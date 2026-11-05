<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Phone, X } from 'lucide-vue-next'
import { useWhatsAppContact } from '@/composables/useWhatsAppContact'
import { contactSource, whatsAppPrefillUrl, type WhatsAppContext } from '@/utils/whatsappContact'
import { contactTopicAliases } from '@/data/contactTopics'
import { consultationCountries, reportOptions, budgetOptions, timeOptions, handoffReasons, normalizeConsultationPhone, type HandoffReason } from '@/utils/consultationFlow'
import { createConsultation, getConsultationErrorKey, type ConsultationPayload } from '@/services/patientSubmissions'

const { t, locale } = useI18n()
const { whatsappHref: baseWhatsAppHref, contactMetadata } = useWhatsAppContact('m06-consultation')
const topicOptions = Object.keys(contactTopicAliases)
const countryOptions = [...consultationCountries, 'OTHER']
const totalGuidedSteps = 5
const open = ref(false), submitted = ref(false), submitting = ref(false)
const mode = ref<'quick' | 'guided'>('quick'), guidedStep = ref(1), usedGuide = ref(false)
const submitError = ref(''), validationError = ref(''), submissionReference = ref('')
const directIntent = ref<HandoffReason>('general')
const flow = ref({ country: '', topic: '', reportStatus: '', budget: '', timeWindow: '', name: '', contact: '' })
const panel = ref<HTMLElement | null>(null), successButton = ref<HTMLAnchorElement | null>(null)
const reportPath = computed(() => ({ path: '/report', query: { lang: locale.value } }))
let requestId = '', lastPayload = '', draftStarted = false
let returnFocus: HTMLElement | null = null
let previousOverflow = '', previousScrollBehavior = '', openingScroll = 0, disposed = false

function countryLabel(code: string) {
  if (code === 'OTHER') return t('conversion.flow.otherCountry')
  try { return new Intl.DisplayNames([locale.value], { type: 'region' }).of(code) || code } catch { return code }
}
function topicLabel(topic: string) { return topic ? t(`conversion.topics.${topic}`) : '' }
const selectionSummary = computed(() => [
  ...(flow.value.reportStatus ? [{ label: t('conversion.flow.report'), value: t(`conversion.flow.reportOptions.${flow.value.reportStatus}`) }] : []),
  ...(flow.value.budget ? [{ label: t('conversion.flow.budget'), value: t(`conversion.flow.budgetOptions.${flow.value.budget}`) }] : []),
  ...(flow.value.timeWindow ? [{ label: t('conversion.flow.time'), value: t(`conversion.flow.timeOptions.${flow.value.timeWindow}`) }] : []),
])
function context(entry: string): WhatsAppContext {
  return { ...contactMetadata.value, locale: locale.value as WhatsAppContext['locale'], entry,
    topic: flow.value.topic || contactMetadata.value.topic, country: flow.value.country === 'OTHER' ? undefined : flow.value.country || contactMetadata.value.country }
}
function summaryLines() {
  return [t('conversion.flow.whatsappGreeting'),
    `${t('conversion.flow.country')}: ${countryLabel(flow.value.country)}`,
    `${t('conversion.flow.disease')}: ${topicLabel(flow.value.topic)}`,
    ...selectionSummary.value.map(row => `${row.label}: ${row.value}`),
    ...(directIntent.value !== 'general' ? [`${t('conversion.flow.request')}: ${t(`conversion.flow.intent.${directIntent.value}`)}`] : []),
    ...(submissionReference.value ? [`${t('conversion.flow.reference')}: ${submissionReference.value}`] : []),
    `${t('conversion.whatsapp.sourceLabel')}: ${contactSource(context(usedGuide.value ? 'm08-whatsapp' : 'm06-whatsapp'))}`]
}
const consultationWhatsAppHref = computed(() => whatsAppPrefillUrl(baseWhatsAppHref.value, summaryLines().join('\n')))
const directWhatsAppHref = computed(() => directLink(directIntent.value))
function directLink(reason: HandoffReason) {
  return whatsAppPrefillUrl(baseWhatsAppHref.value, [t('conversion.flow.directMessage', { intent: t(`conversion.flow.intent.${reason}`) }),
    `${t('conversion.whatsapp.sourceLabel')}: ${contactSource(context('m08-direct'))}`].join('\n'))
}
function resetFlow() {
  const metadata = contactMetadata.value
  flow.value = { country: countryOptions.includes(metadata.country || '') ? metadata.country! : '', topic: metadata.topic !== 'general' ? metadata.topic : '', reportStatus: '', budget: '', timeWindow: '', name: '', contact: '' }
  mode.value = 'quick'; guidedStep.value = 1; usedGuide.value = false; directIntent.value = 'general'
  submissionReference.value = ''; validationError.value = ''; submitError.value = ''; lastPayload = ''; requestId = ''
  submitted.value = false; draftStarted = true
}
function openPanel(event?: Event) {
  if (open.value) return
  const intent = event instanceof CustomEvent ? event.detail?.intent : undefined
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow; previousScrollBehavior = document.documentElement.style.scrollBehavior; openingScroll = window.scrollY
  document.documentElement.style.scrollBehavior = 'auto'
  if (!draftStarted) resetFlow()
  if (!submitting.value && !submitted.value && handoffReasons.includes(intent)) directIntent.value = intent
  open.value = true; document.body.style.overflow = 'hidden'
  nextTick(() => {
    if (submitted.value) successButton.value?.focus({ preventScroll: true })
    else document.querySelector<HTMLElement>(mode.value === 'guided' ? `#consult-step-${guidedStep.value}` : '#consult-name')?.focus({ preventScroll: true })
  })
}
function closePanel() {
  if (!open.value) return
  if (submitted.value) draftStarted = false
  open.value = false; document.body.style.overflow = previousOverflow
  nextTick(() => {
    if (open.value || disposed) return
    returnFocus?.focus({ preventScroll: true })
    if (window.scrollY !== openingScroll) window.scrollTo({ top: openingScroll, behavior: 'instant' })
    document.documentElement.style.scrollBehavior = previousScrollBehavior
  })
}
function validateQuick() {
  if (!flow.value.name.trim()) return t('conversion.flow.requiredName')
  if (!normalizeConsultationPhone(flow.value.contact)) return t('conversion.flow.requiredWhatsApp')
  if (!countryOptions.includes(flow.value.country)) return t('conversion.flow.requiredCountry')
  if (!topicOptions.includes(flow.value.topic)) return t('conversion.flow.requiredDisease')
  return ''
}
function validateGuidedStep() {
  if (guidedStep.value === 1 && !countryOptions.includes(flow.value.country)) return t('conversion.flow.requiredCountry')
  if (guidedStep.value === 2 && !topicOptions.includes(flow.value.topic)) return t('conversion.flow.requiredDisease')
  return ''
}
function switchMode(next: 'quick' | 'guided') {
  if (submitting.value) return
  mode.value = next; guidedStep.value = 1; validationError.value = ''; submitError.value = ''
  if (next === 'guided') usedGuide.value = true
  nextTick(() => document.querySelector<HTMLElement>(next === 'quick' ? '#consult-name' : '#consult-step-1')?.focus({ preventScroll: true }))
}
function nextStep() {
  validationError.value = validateGuidedStep()
  if (validationError.value) return
  if (guidedStep.value === totalGuidedSteps) { switchMode('quick'); return }
  guidedStep.value++
  nextTick(() => document.querySelector<HTMLElement>(`#consult-step-${guidedStep.value}`)?.focus({ preventScroll: true }))
}
function previousStep() { if (guidedStep.value > 1) guidedStep.value--; validationError.value = '' }
async function submit() {
  validationError.value = validateQuick()
  if (validationError.value || submitting.value) return
  const values = { schemaVersion: 2 as const, name: flow.value.name.trim(), contact: normalizeConsultationPhone(flow.value.contact)!,
    country: flow.value.country, topic: flow.value.topic, reportStatus: flow.value.reportStatus, budget: flow.value.budget,
    timeWindow: flow.value.timeWindow, locale: locale.value, mode: usedGuide.value ? 'guided' as const : 'quick' as const,
    handoffReason: directIntent.value, sourceContext: contactSource(context(usedGuide.value ? 'm08-consultation' : 'm06-consultation')) }
  const serialized = JSON.stringify(values)
  if (!requestId || serialized !== lastPayload) { requestId = crypto.randomUUID(); lastPayload = serialized }
  const payload: ConsultationPayload = { requestId, ...values, concern: summaryLines().slice(1).join('；') }
  submitting.value = true; submitError.value = ''
  try {
    const response = await createConsultation(payload)
    if (disposed) return
    submissionReference.value = response.submissionId; submitted.value = true
    await nextTick()
    if (open.value) successButton.value?.focus({ preventScroll: true })
  } catch (error) { if (!disposed) submitError.value = t(getConsultationErrorKey(error)) }
  finally { submitting.value = false }
}
function onSubmit() { if (mode.value === 'guided') nextStep(); else void submit() }
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) closePanel()
  if (event.key !== 'Tab' || !open.value || !panel.value) return
  const focusable = Array.from(panel.value.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter(el => !el.closest('fieldset[disabled]') && el.getClientRects().length)
  const first = focusable[0], last = focusable[focusable.length - 1]
  if (!first || !last) { event.preventDefault(); panel.value.focus(); return }
  if (event.shiftKey && (document.activeElement === first || !panel.value.contains(document.activeElement))) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && (document.activeElement === last || !panel.value.contains(document.activeElement))) { event.preventDefault(); first.focus() }
}
onMounted(() => { window.addEventListener('open-consultation', openPanel); window.addEventListener('keydown', onKeydown) })
onUnmounted(() => { disposed = true; window.removeEventListener('open-consultation', openPanel); window.removeEventListener('keydown', onKeydown); if (open.value) { document.body.style.overflow = previousOverflow; document.documentElement.style.scrollBehavior = previousScrollBehavior } })
</script>

<template>
  <button class="consult-float" type="button" :aria-label="t('conversion.flow.openAria')" @click="openPanel()">
    <MessageCircle class="h-5 w-5" /><span>{{ t('conversion.navigation.ask') }}</span>
  </button>
  <Teleport to="body">
    <Transition name="consult">
      <div v-if="open" class="consult-overlay" role="dialog" aria-modal="true" aria-labelledby="consult-title" @click.self="closePanel">
        <section ref="panel" class="consult-panel" tabindex="-1">
          <button class="consult-close" type="button" :aria-label="t('conversion.flow.close')" @click="closePanel"><X class="h-5 w-5" /></button>
          <template v-if="!submitted">
            <span class="hy-kicker">{{ t('conversion.flow.kicker') }}</span>
            <h2 id="consult-title">{{ t('conversion.flow.title') }}</h2>
            <p class="consult-intro">{{ t('conversion.flow.description') }}</p>
            <div class="consult-mode-switch" :aria-label="t('conversion.flow.modeLabel')">
              <button type="button" :aria-pressed="mode === 'quick'" :disabled="submitting" :class="{ active: mode === 'quick' }" @click="switchMode('quick')">
                {{ t('conversion.flow.quickMode') }}<small>{{ t('conversion.flow.quickHint') }}</small>
              </button>
              <button type="button" :aria-pressed="mode === 'guided'" :disabled="submitting" :class="{ active: mode === 'guided' }" @click="switchMode('guided')">
                {{ t('conversion.flow.guidedMode') }}<small>{{ t('conversion.flow.guidedHint') }}</small>
              </button>
            </div>
            <form class="consult-form" novalidate :aria-busy="submitting" @input="validationError = ''; submitError = ''" @submit.prevent="onSubmit">
              <fieldset class="consult-fields" :disabled="submitting">
                <template v-if="mode === 'quick'">
                  <label for="consult-name"><span>{{ t('conversion.flow.name') }}</span>
                    <input id="consult-name" v-model="flow.name" required maxlength="120" autocomplete="name" :placeholder="t('conversion.flow.namePlaceholder')" />
                  </label>
                  <label for="consult-whatsapp"><span>{{ t('conversion.flow.whatsapp') }}</span>
                    <input id="consult-whatsapp" v-model="flow.contact" required type="tel" maxlength="40" inputmode="tel" autocomplete="tel" placeholder="+60 123 456 789" aria-describedby="consult-phone-hint" />
                    <small id="consult-phone-hint">{{ t('conversion.flow.whatsappPlaceholder') }}</small>
                  </label>
                  <label for="consult-country"><span>{{ t('conversion.flow.country') }}</span>
                    <select id="consult-country" v-model="flow.country" required>
                      <option value="" disabled>{{ t('conversion.flow.chooseCountry') }}</option>
                      <option v-for="country in countryOptions" :key="country" :value="country">{{ countryLabel(country) }}</option>
                    </select>
                  </label>
                  <label for="consult-topic"><span>{{ t('conversion.flow.disease') }}</span>
                    <select id="consult-topic" v-model="flow.topic" required>
                      <option value="" disabled>{{ t('conversion.flow.chooseDisease') }}</option>
                      <option v-for="topic in topicOptions" :key="topic" :value="topic">{{ topicLabel(topic) }}</option>
                    </select>
                  </label>
                  <dl v-if="selectionSummary.length" class="consult-summary">
                    <template v-for="row in selectionSummary" :key="row.label"><dt>{{ row.label }}</dt><dd>{{ row.value }}</dd></template>
                  </dl>
                </template>
                <template v-else>
                  <div class="consult-progress" :aria-label="t('conversion.flow.progress')">
                    <span v-for="number in totalGuidedSteps" :key="number" :aria-current="number === guidedStep ? 'step' : undefined" :class="{ active: number <= guidedStep, current: number === guidedStep }">{{ number }}</span>
                  </div>
                  <fieldset v-if="guidedStep === 1" id="consult-step-1" tabindex="-1">
                    <legend>{{ t('conversion.flow.countryQuestion') }}</legend>
                    <label><span class="sr-only">{{ t('conversion.flow.country') }}</span><select v-model="flow.country" required><option value="" disabled>{{ t('conversion.flow.chooseCountry') }}</option><option v-for="country in countryOptions" :key="country" :value="country">{{ countryLabel(country) }}</option></select></label>
                  </fieldset>
                  <fieldset v-else-if="guidedStep === 2" id="consult-step-2" tabindex="-1">
                    <legend>{{ t('conversion.flow.diseaseQuestion') }}</legend>
                    <label><span class="sr-only">{{ t('conversion.flow.disease') }}</span><select v-model="flow.topic" required><option value="" disabled>{{ t('conversion.flow.chooseDisease') }}</option><option v-for="topic in topicOptions" :key="topic" :value="topic">{{ topicLabel(topic) }}</option></select></label>
                  </fieldset>
                  <fieldset v-else-if="guidedStep === 3" id="consult-step-3" tabindex="-1">
                    <legend>{{ t('conversion.flow.reportQuestion') }}</legend>
                    <div class="consult-options"><label v-for="option in reportOptions" :key="option" :class="{ selected: flow.reportStatus === option }"><input v-model="flow.reportStatus" type="radio" name="report-status" :value="option" /><span>{{ t(`conversion.flow.reportOptions.${option}`) }}</span></label></div>
                  </fieldset>
                  <fieldset v-else-if="guidedStep === 4" id="consult-step-4" tabindex="-1">
                    <legend>{{ t('conversion.flow.budgetQuestion') }}</legend>
                    <p class="consult-help">{{ t('conversion.flow.budgetHint') }}</p>
                    <div class="consult-options"><label v-for="option in budgetOptions" :key="option" :class="{ selected: flow.budget === option }"><input v-model="flow.budget" type="radio" name="budget" :value="option" /><span>{{ t(`conversion.flow.budgetOptions.${option}`) }}</span></label></div>
                  </fieldset>
                  <fieldset v-else id="consult-step-5" tabindex="-1">
                    <legend>{{ t('conversion.flow.timeQuestion') }}</legend>
                    <div class="consult-options"><label v-for="option in timeOptions" :key="option" :class="{ selected: flow.timeWindow === option }"><input v-model="flow.timeWindow" type="radio" name="time-window" :value="option" /><span>{{ t(`conversion.flow.timeOptions.${option}`) }}</span></label></div>
                  </fieldset>
                  <button class="consult-more-link" type="button" @click="switchMode('quick')">{{ t('conversion.flow.skipToContact') }}</button>
                </template>
                <p v-if="validationError || submitError" class="consult-error" role="alert">{{ validationError || submitError }}</p>
                <p v-if="mode === 'quick'" class="consult-help">{{ t('conversion.flow.contactNotice') }}</p>
                <div class="consult-actions">
                  <button v-if="mode === 'guided' && guidedStep > 1" class="consult-back" type="button" @click="previousStep"><ArrowLeft class="h-4 w-4" />{{ t('conversion.flow.back') }}</button><span v-else />
                  <button class="hy-button-primary consult-next" type="submit" :disabled="submitting">{{ t(mode === 'guided' ? (guidedStep === totalGuidedSteps ? 'conversion.flow.reviewContact' : 'conversion.flow.next') : (submitting ? 'conversion.flow.submitting' : 'conversion.flow.submit')) }} <ArrowRight class="h-4 w-4" /></button>
                </div>
              </fieldset>
            </form>
            <div class="consult-direct">
              <p>{{ t('conversion.flow.directHint') }}</p>
              <a class="consult-direct-link" :href="directWhatsAppHref" target="_blank" rel="noopener noreferrer" data-contact-entry="m08-direct" :data-contact-topic="flow.topic" :data-contact-country="flow.country"><MessageCircle class="h-4 w-4" />{{ t('conversion.flow.directWhatsapp') }}</a>
              <div class="consult-handoff-links"><a v-for="reason in handoffReasons.filter(value => value !== 'general')" :key="reason" :href="directLink(reason)" target="_blank" rel="noopener noreferrer" data-contact-entry="m08-direct" :data-contact-topic="flow.topic" :data-contact-country="flow.country">{{ t(`conversion.flow.intent.${reason}`) }} <ArrowRight class="h-3 w-3" /></a></div>
            </div>
            <div class="consult-hotline"><Phone class="h-4 w-4" />{{ t('conversion.flow.handoff') }}</div>
          </template>
          <div v-else class="consult-success">
            <CheckCircle2 class="h-12 w-12" /><h2 id="consult-title">{{ t('conversion.flow.received') }}</h2><p>{{ t('conversion.flow.receivedDescription') }}</p>
            <p class="consult-reference">{{ t('conversion.flow.reference') }}: {{ submissionReference }}</p>
            <dl class="consult-summary"><dt>{{ t('conversion.flow.country') }}</dt><dd>{{ countryLabel(flow.country) }}</dd><dt>{{ t('conversion.flow.disease') }}</dt><dd>{{ topicLabel(flow.topic) }}</dd><template v-for="row in selectionSummary" :key="row.label"><dt>{{ row.label }}</dt><dd>{{ row.value }}</dd></template></dl>
            <a ref="successButton" class="hy-button-primary consult-whatsapp" :href="consultationWhatsAppHref" target="_blank" rel="noopener noreferrer" :data-contact-entry="usedGuide ? 'm08-whatsapp' : 'm06-whatsapp'" :data-contact-topic="flow.topic" :data-contact-country="flow.country"><MessageCircle class="h-4 w-4" />{{ t('conversion.flow.openWhatsApp') }}</a>
            <RouterLink class="consult-report-link" :to="reportPath" @click="closePanel">{{ t('conversion.flow.continueReport') }}</RouterLink>
            <button class="hy-button-secondary" type="button" @click="closePanel">{{ t('conversion.flow.done') }}</button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.consult-float { position: fixed; right: 22px; bottom: max(22px, env(safe-area-inset-bottom)); z-index: 45; display: flex; height: 52px; align-items: center; gap: 8px; border: 0; border-radius: 26px; padding: 0 20px; background: var(--hy-orange); color: #fff; font-size: 14px; font-weight: 750; box-shadow: 0 14px 34px rgba(10, 52, 82, .2), 0 8px 22px rgba(255, 138, 52, .3); cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; }
.consult-float:hover { transform: translateY(-3px); box-shadow: 0 18px 38px rgba(10, 52, 82, .24), 0 10px 26px rgba(255, 138, 52, .35); }
.consult-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: flex-end; background: rgba(4, 28, 46, .48); backdrop-filter: blur(6px); }
.consult-panel { position: relative; width: min(100%, 500px); min-height: 0; height: 100%; max-height: 100dvh; overflow-y: auto; box-sizing: border-box; padding: 70px 52px 44px; background: #fff; box-shadow: -20px 0 60px rgba(5, 38, 63, .18); }
.consult-close { position: absolute; top: 24px; right: 24px; display: grid; width: 40px; height: 40px; place-items: center; border: 1px solid var(--hy-line); border-radius: 50%; background: #fff; color: var(--hy-navy); cursor: pointer; }
.consult-panel h2 { margin: 16px 0 10px; color: var(--hy-navy-deep); font-size: 34px; line-height: 1.25; font-weight: 760; }
.consult-intro, .consult-success p { margin: 0; color: var(--hy-muted); line-height: 1.8; }
.consult-mode-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 24px; }
.consult-mode-switch button { display: grid; gap: 4px; min-width: 0; border: 1px solid var(--hy-line); border-radius: 8px; padding: 12px 13px; background: #fff; color: var(--hy-ink); text-align: left; font: inherit; font-size: 14px; font-weight: 750; cursor: pointer; }
.consult-mode-switch button.active { border-color: var(--hy-blue); background: #f0f7ff; color: var(--hy-blue); }
.consult-mode-switch small { color: var(--hy-muted); font-size: 11px; font-weight: 500; line-height: 1.45; }
.consult-form { display: grid; gap: 20px; margin-top: 26px; }
.consult-form fieldset { display: grid; gap: 14px; min-width: 0; padding: 0; border: 0; }
.consult-form legend { padding: 0; color: var(--hy-ink); font-size: 16px; font-weight: 750; }
.consult-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.consult-form label { display: grid; gap: 7px; min-width: 0; color: var(--hy-ink); font-size: 13px; font-weight: 700; }
.consult-form select, .consult-form input:not([type="radio"]) { width: 100%; box-sizing: border-box; border: 1px solid var(--hy-line); border-radius: 8px; padding: 14px 15px; outline: 0; background: #f9fcfd; color: var(--hy-ink); font: inherit; font-size: 15px; font-weight: 400; }
.consult-form select:focus, .consult-form input:not([type="radio"]):focus { border-color: var(--hy-blue); box-shadow: 0 0 0 3px rgba(22, 133, 195, .1); }
.consult-options { display: grid; gap: 10px; }
.consult-options label { display: flex; align-items: center; gap: 12px; min-height: 48px; border: 1px solid var(--hy-line); border-radius: 8px; padding: 10px 14px; color: var(--hy-ink); cursor: pointer; transition: border-color .2s ease, background .2s ease; }
.consult-options label.selected { border-color: var(--hy-blue); background: #f0f7ff; }
.consult-options input { flex: 0 0 16px; width: 16px; height: 16px; accent-color: var(--hy-blue); }
.consult-options--compact { grid-template-columns: 1fr 1fr; }
.consult-contact-fields { display: grid; gap: 14px; }
.consult-more-link { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 0; background: transparent; color: var(--hy-blue); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.consult-progress { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.consult-progress span { display: grid; width: 26px; height: 26px; place-items: center; border-radius: 50%; background: #eef2f5; color: #8b96a2; font-size: 12px; font-weight: 700; }
.consult-progress span.active { background: #dbeefe; color: var(--hy-blue); }
.consult-progress span.current { background: var(--hy-blue); color: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, .12); }
.consult-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 4px; }
.consult-next { min-width: 150px; justify-content: center; }
.consult-back { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--hy-muted); font: inherit; cursor: pointer; }
.consult-error { margin: -4px 0 0; color: #b42318; font-size: 12px; line-height: 1.5; }
.consult-form button:disabled { cursor: wait; opacity: .68; }
.consult-direct { display: grid; gap: 10px; margin-top: 25px; border-top: 1px solid var(--hy-line); padding-top: 18px; }
.consult-direct p { margin: 0; color: var(--hy-muted); font-size: 12px; line-height: 1.55; }
.consult-direct-link { display: inline-flex; align-items: center; justify-content: center; gap: 7px; width: 100%; min-height: 42px; box-sizing: border-box; border: 1px solid #cfe4d9; border-radius: 8px; background: #f3fbf6; color: #16834e; font: inherit; font-size: 13px; font-weight: 750; cursor: pointer; text-decoration: none; }
.consult-hotline { display: flex; align-items: center; gap: 8px; margin-top: 17px; color: var(--hy-muted); font-size: 12px; line-height: 1.6; }
.consult-success { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #27a776; }
.consult-success .consult-whatsapp { margin-top: 26px; display: inline-flex; align-items: center; gap: 8px; }
.consult-reference { color: var(--hy-ink) !important; font-size: 13px; }
.consult-report-link { margin-top: 16px; color: var(--hy-blue); font-size: 14px; text-decoration: underline; }
.consult-success .hy-button-secondary { margin-top: 24px; }
.consult-enter-active, .consult-leave-active { transition: opacity .3s ease; }
.consult-enter-active .consult-panel, .consult-leave-active .consult-panel { transition: transform .38s cubic-bezier(.22, 1, .36, 1); }
.consult-enter-from, .consult-leave-to { opacity: 0; }
.consult-enter-from .consult-panel, .consult-leave-to .consult-panel { transform: translateX(100%); }
@media (max-width: 640px) {
  .consult-float { right: 14px; bottom: max(14px, env(safe-area-inset-bottom)); width: 48px; height: 48px; justify-content: center; padding: 0; }
  .consult-float span { display: none; }
  .consult-panel { min-height: 0; height: 100%; max-height: 100dvh; padding: 68px 24px 32px; }
  .consult-panel h2 { font-size: 29px; }
  .consult-mode-switch, .consult-quick-grid, .consult-options--compact { grid-template-columns: 1fr; }
  .consult-form select, .consult-form input:not([type="radio"]) { font-size: 16px; }
}
@media (prefers-reduced-motion: reduce) { .consult-float, .consult-enter-active, .consult-leave-active, .consult-enter-active .consult-panel, .consult-leave-active .consult-panel { transition: none; } }
.consult-panel :is(button, a, input, select):focus-visible { outline: 2px solid var(--hy-blue); outline-offset: 3px; }
.consult-fields { display: grid; gap: 14px; width: 100%; margin: 0; border: 0; padding: 0; }
.consult-fields:disabled { opacity: .75; }
.consult-form small, .consult-help { margin: 0; color: var(--hy-muted); font-size: 12px; font-weight: 400; line-height: 1.6; }
.consult-handoff-links { display: flex; flex-wrap: wrap; gap: 9px 16px; }
.consult-handoff-links a { display: inline-flex; align-items: center; gap: 3px; color: var(--hy-blue); font-size: 12px; text-decoration: underline; }
.consult-summary { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: 8px 12px; width: 100%; margin: 18px 0 0; padding: 14px; box-sizing: border-box; border-radius: 6px; background: #f9fcfd; color: var(--hy-ink); font-size: 13px; line-height: 1.6; text-align: left; }
.consult-summary dt { color: var(--hy-muted); }
.consult-summary dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
.consult-reference { overflow-wrap: anywhere; }
.consult-hotline svg, .consult-whatsapp svg { flex-shrink: 0; }
.consult-actions button, .consult-direct-link, .consult-whatsapp, .consult-mode-switch button { white-space: normal; overflow-wrap: anywhere; height: auto; }
.consult-whatsapp { justify-content: center; }
.consult-actions { flex-wrap: wrap; }
.consult-mode-switch button:disabled { cursor: wait; opacity: .6; }
</style>
