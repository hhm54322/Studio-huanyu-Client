import { computed, inject, onBeforeUnmount, provide, shallowRef, watch, type InjectionKey, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { resolveLocale } from '@/i18n/languages'
import { resolveContactTopic } from '@/data/contactTopics'
import { publicContacts } from '@/data/publicContacts'
import { useContactAnalytics } from '@/composables/useContactAnalytics'
import { contactAttributionKey, contactCountry, contactSource, parseStoredAttribution, readAttribution, whatsAppPrefillUrl, type ContactAttribution, type WhatsAppContext } from '@/utils/whatsappContact'

export const patientContactKey: InjectionKey<ReturnType<typeof providePatientContact>> = Symbol('patient-contact')

/** One route/i18n watcher per patient shell, rather than one per source-tree node. */
export function providePatientContact() {
  const route = useRoute(), { t, locale } = useI18n(), app = useAppStore()
  let saved: ContactAttribution = {}
  try { saved = parseStoredAttribution(sessionStorage.getItem(contactAttributionKey)) } catch { /* Storage is optional. */ }
  const attribution = shallowRef(saved)
  const pageTopic = shallowRef<{ owner: symbol; topic: string }>()
  const country = shallowRef<string>()
  const landingTopic = shallowRef<string>()
  watch(() => route.query, query => {
    const language = resolveLocale(query.lang)
    if (language && language !== app.locale) void app.setLocale(language)
    const campaign = readAttribution(query)
    if (campaign) {
      attribution.value = campaign
      country.value = contactCountry(query.country)
      landingTopic.value = resolveContactTopic(query.disease) || resolveContactTopic(query.topic)
      try { sessionStorage.setItem(contactAttributionKey, JSON.stringify(campaign)) } catch { /* Retain in memory. */ }
    }
    country.value = contactCountry(query.country) || country.value
    if (query.disease !== undefined || query.topic !== undefined) landingTopic.value = resolveContactTopic(query.disease) || resolveContactTopic(query.topic)
  }, { immediate: true })
  watch(locale, value => {
    const language = resolveLocale(value) || 'zh'
    document.documentElement.lang = language
    document.documentElement.dataset.patientLocale = language
  }, { immediate: true })
  const topic = computed(() => resolveContactTopic(pageTopic.value?.topic)
    || resolveContactTopic(route.query.disease) || resolveContactTopic(route.query.topic)
    || (route.path.startsWith('/dental') ? 'dental' : resolveContactTopic(landingTopic.value) || 'general'))
  const metadata = (entry: string): WhatsAppContext => ({
    locale: resolveLocale(locale.value) || 'zh', topic: topic.value, country: country.value,
    // Strip all query/hash data. Only the public route name is carried over.
    page: String(route.name || 'patient'), entry, attribution: attribution.value,
  })
  const href = (entry: string) => {
    const context = metadata(entry)
    const disease = t(`conversion.topics.${context.topic}`)
    const lines = [t(`conversion.whatsapp.${context.topic === 'general' ? 'generalMessage' : 'topicMessage'}`, { disease })]
    if (context.country) lines.push(t('conversion.whatsapp.countryLine', { country: context.country }))
    lines.push(`${t('conversion.whatsapp.sourceLabel')}: ${contactSource(context)}`)
    return whatsAppPrefillUrl(publicContacts.whatsappHref, lines.join('\n'))
  }
  const context = { href, metadata, pageTopic }
  useContactAnalytics(metadata)
  provide(patientContactKey, context)
  return context
}

export function useWhatsAppContact(entry: string) {
  const context = inject(patientContactKey)
  if (!context) throw new Error('WhatsApp entry must be rendered inside PatientLayout')
  return { whatsappHref: computed(() => context.href(entry)), contactMetadata: computed(() => context.metadata(entry)) }
}

/** Page-owned public topic; leaving the page clears it without retaining medical input. */
export function useWhatsAppTopic(topic: Ref<string>) {
  const context = inject(patientContactKey)
  const owner = Symbol('contact-topic-owner')
  watch(topic, value => { if (context) context.pageTopic.value = { owner, topic: value } }, { immediate: true })
  onBeforeUnmount(() => { if (context?.pageTopic.value?.owner === owner) context.pageTopic.value = undefined })
}
