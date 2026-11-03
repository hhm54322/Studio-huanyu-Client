<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
const { tx } = useSiteCopy()

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, type Locale } from '@/stores/app'
import { patientNavigationGroups, patientNavigationItems, patientNavigationTranslationKeys, usePatientNavigation, type PatientNavigationGroup } from '@/composables/usePatientNavigation'
import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'
import { patientLanguages } from '@/i18n/languages'

const props = defineProps<{ source?: HomeSourceNodeData }>()
const route = useRoute()
const router = useRouter()
const { locale, t, te } = useI18n()
const app = useAppStore()
const { groupLabel, groupActive } = usePatientNavigation()
const navigation = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const open = ref<PatientNavigationGroup | 'language' | null>(null)
const panelStyle = ref<Record<string, string>>({})
const items = ref<HTMLElement>()
const availableWidth = ref(853)
const localized = computed(() => locale.value !== 'zh')
const label = (text: string) => t(`conversion.navigation.${patientNavigationTranslationKeys[text]}`)
const compactLabel = (text: string) => {
  const key = `conversion.navigationCompact.${patientNavigationTranslationKeys[text]}`
  return te(key) ? t(key) : label(text)
}
const panelGap = 8
let closeTimer: ReturnType<typeof setTimeout> | undefined
let suppressFocus = false
const languages = patientLanguages
const currentLanguage = computed(() => languages.find(item => item.code === locale.value) || languages[0]!)
const itemActive = (path: string) => route.path === path || path === '/dental' && route.name === 'patient-dental-doctor'
const flatten = (node: HomeSourceNodeData): HomeSourceNodeData[] => [node, ...node.children.flatMap(flatten)]
function sourceId(label: string) {
  return props.source?.children.find(child => flatten(child).some(node => node.type === 'TEXT' && node.text === label))?.id
}
const trigger = (kind: NonNullable<typeof open.value>) => navigation.value?.querySelector<HTMLButtonElement>(`[data-navigation-trigger="${kind}"]`)
function cancelClose() { clearTimeout(closeTimer) }
function close() { cancelClose(); open.value = null }
function scheduleClose() { cancelClose(); closeTimer = setTimeout(close, 140) }
function positionPanel() {
  if (!open.value) return
  const box = trigger(open.value)?.getBoundingClientRect()
  if (!box) return
  const scale = box.height / 28
  // A translated navigation can occupy two rows. Its menu belongs below the
  // complete row group, otherwise it covers the lower navigation links.
  const bottom = Math.max(box.bottom, items.value?.getBoundingClientRect().bottom || box.bottom)
  const baseWidth = open.value === 'services' ? 111 : open.value === 'hospitals' ? 119 : 168
  const naturalWidth = panel.value ? panel.value.scrollWidth : baseWidth
  const width = localized.value || open.value === 'language' ? Math.min(Math.max(baseWidth, naturalWidth), (innerWidth - 16) / scale) : baseWidth
  const left = open.value === 'language' ? box.right - width * scale : box.left - 12 * scale
  const top = Math.min(bottom + panelGap * scale, innerHeight - 48)
  const maxHeight = Math.max(44, (innerHeight - top - 8) / scale)
  panelStyle.value = {
    left: `${Math.max(8, Math.min(left, innerWidth - width * scale - 8))}px`,
    top: `${top}px`, width: localized.value ? 'max-content' : `${width}px`,
    maxWidth:`${(innerWidth - 16) / scale}px`, maxHeight:`${maxHeight}px`,
    overflowY:panel.value && panel.value.scrollHeight > maxHeight ? 'auto' : 'visible',
    '--patient-menu-gap': `${Math.max(panelGap, (top - box.bottom) / scale)}px`,
    transform: `scale(${scale})`, transformOrigin: 'top left',
  }
}
async function show(kind: NonNullable<typeof open.value>) { cancelClose(); open.value = kind; positionPanel(); await nextTick(); positionPanel() }
function focusTrigger(kind: NonNullable<typeof open.value>) {
  if (suppressFocus) { suppressFocus = false; return }
  show(kind)
}
function consultation() { close(); window.dispatchEvent(new CustomEvent('open-consultation')) }
async function changeLanguage(code: Locale) { if (!await app.setLocale(code)) return; close(); await router.replace({ query:{ ...route.query, lang:code } }) }
async function fitNavigation() {
  await nextTick()
  const node = navigation.value
  if (!node || !localized.value) return
  const box = node.getBoundingClientRect(), scale = box.height / 28
  const header = node.closest('[data-figma-name="Header"],header') || node.parentElement
  const logo = header?.querySelector('a[href="/"]:not(.patient-desktop-navigation__link)')?.getBoundingClientRect()
  availableWidth.value = logo ? Math.max(300, (box.right - logo.right) / scale - 24) : props.source?.width || 853
}
function resize() { close(); void fitNavigation() }
function focusables() { return [...panel.value?.querySelectorAll<HTMLElement>('a, button:not(:disabled)') || []] }
async function triggerKey(event: KeyboardEvent, kind: NonNullable<typeof open.value>) {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  event.preventDefault(); show(kind); await nextTick()
  const items = focusables()
  ;(event.key === 'ArrowUp' ? items[items.length - 1] : items[0])?.focus({ preventScroll: true })
}
function panelKey(event: KeyboardEvent) {
  if (event.key === 'Escape') { escape(event); return }
  const items = focusables(), index = items.indexOf(document.activeElement as HTMLElement)
  const next = event.key === 'ArrowDown' ? (index + 1) % items.length : event.key === 'ArrowUp' ? (index + items.length - 1) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : -1
  if (next >= 0) { event.preventDefault(); items[next]?.focus({ preventScroll: true }) }
}
function leaveFocus(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !navigation.value?.contains(next) && !panel.value?.contains(next)) close()
}
function outside(event: MouseEvent) {
  const target = event.target as Node
  if (!navigation.value?.contains(target) && !panel.value?.contains(target)) close()
}
function escape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  event.preventDefault()
  const button = trigger(open.value)
  close(); suppressFocus = document.activeElement !== button
  button?.focus({ preventScroll: true })
}
function navigationKey(event: KeyboardEvent) {
  if (event.key === 'Tab') close()
  else escape(event)
}
watch(() => route.fullPath, close)
watch(locale, fitNavigation, { flush:'post' })
onMounted(() => {
  document.addEventListener('click', outside); document.addEventListener('keydown', escape)
  window.addEventListener('resize', resize); window.addEventListener('scroll', positionPanel, { passive: true })
  void document.fonts.ready.then(fitNavigation)
})
onBeforeUnmount(() => {
  close(); document.removeEventListener('click', outside); document.removeEventListener('keydown', escape)
  window.removeEventListener('resize', resize); window.removeEventListener('scroll', positionPanel)
})
</script>

<template>
  <nav ref="navigation" class="patient-desktop-navigation" :class="{ 'patient-desktop-navigation--localized':localized }" :aria-label="t('conversion.navigation.main')"
    @click.stop @pointerover.stop @mouseover.stop @mouseout.stop @focusin.stop @focusout.stop="leaveFocus" @keydown.stop="navigationKey">
    <div ref="items" class="patient-desktop-navigation__items" :style="localized ? { width:`${availableWidth}px` } : undefined">
      <button class="patient-desktop-navigation__consult" type="button" :title="label('问阿宁')" :aria-label="label('问阿宁')" :data-figma-node="sourceId('问阿宁')" @pointerenter="close" @click="consultation">
        <img src="/images/figma/home-revision/node-1523-85.svg" alt="" />{{ compactLabel('问阿宁') }}
      </button>
      <template v-for="item in patientNavigationItems" :key="item.label">
        <button v-if="'group' in item" type="button" class="patient-desktop-navigation__link patient-desktop-navigation__trigger"
          :class="{ 'is-active': groupActive(item.group) }" :data-figma-node="sourceId(item.label)" :data-navigation-trigger="item.group"
          :title="label(groupLabel(item.group))"
          :aria-label="tx(`${label(groupLabel(item.group))} ${t('conversion.navigation.menu')}`)" :aria-expanded="open === item.group" aria-haspopup="true"
          :aria-controls="`patient-navigation-${item.group}`" @pointerenter="show(item.group)" @pointerleave="scheduleClose"
          @focus="focusTrigger(item.group)" @keydown="triggerKey($event, item.group)" @click="show(item.group)">
          {{ compactLabel(groupLabel(item.group)) }}<span class="patient-desktop-navigation__chevron" aria-hidden="true" />
        </button>
        <RouterLink v-else :to="item.path" class="patient-desktop-navigation__link" :class="{ 'is-active': itemActive(item.path) }"
          :title="label(item.label)" :aria-label="label(item.label)" :data-figma-node="sourceId(item.label)" :aria-current="itemActive(item.path) ? 'page' : undefined" @pointerenter="close" @click="close">{{ compactLabel(item.label) }}</RouterLink>
      </template>
      <button type="button" class="patient-desktop-navigation__language" data-navigation-trigger="language" :aria-label="t('conversion.navigation.language')"
        :aria-expanded="open === 'language'" aria-controls="patient-navigation-language" @click="open === 'language' ? close() : show('language')"
        @keydown="triggerKey($event, 'language')"><img src="/images/figma/home-revision/node-1523-111.svg" alt="" /><span>{{ tx(currentLanguage.flag) }}</span>{{ tx(currentLanguage.short) }}</button>
    </div>
    <Teleport to="body">
      <div v-if="open" ref="panel" :id="`patient-navigation-${open}`" class="patient-navigation-menu" :class="[`patient-navigation-menu--${open}`, { 'patient-navigation-menu--localized':localized }]" :style="panelStyle"
        :aria-label="tx(open === 'language' ? t('conversion.navigation.language') : label(open === 'services' ? '医疗服务' : '中国医院'))"
        @pointerenter="cancelClose" @pointerleave="scheduleClose" @focusin="cancelClose" @focusout="leaveFocus" @keydown.stop="panelKey">
        <template v-if="open !== 'language'">
          <template v-for="item in patientNavigationGroups[open]" :key="item.label">
            <RouterLink v-if="item.path" :to="item.path" class="patient-navigation-menu__item" :class="{ 'is-active': route.path === item.path }"
              :aria-current="route.path === item.path ? 'page' : undefined" @click="close">{{ label(item.label) }}</RouterLink>
            <button v-else class="patient-navigation-menu__item" type="button" disabled :title="t('conversion.navigation.preparing')">{{ label(item.label) }}</button>
          </template>
        </template>
        <template v-else><button v-for="language in languages" :key="language.code" type="button" class="patient-navigation-menu__item"
          :class="{ 'is-active': locale === language.code }" @click="changeLanguage(language.code)">{{ language.label }}</button></template>
      </div>
    </Teleport>
  </nav>
</template>

<style scoped>
.patient-desktop-navigation { height:28px; overflow:visible; pointer-events:auto; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.patient-desktop-navigation__items { position:absolute; right:0; top:0; display:flex; width:max-content; height:28px; align-items:center; gap:2px; }
.patient-desktop-navigation__link { display:flex; flex:none; height:28px; align-items:center; gap:2px; padding:6px 10px; margin:0; border:0; border-radius:8px; background:transparent; color:#4B5563; font-size:12px; font-weight:500; line-height:16px; text-decoration:none; white-space:nowrap; cursor:pointer; box-sizing:border-box; }
.patient-desktop-navigation__link.is-active { color:#2563EB; background:rgba(37,99,235,.1); font-weight:600; }
.patient-desktop-navigation__link:hover { color:#2563EB; }
.patient-desktop-navigation__trigger { min-width:86px; }
.patient-desktop-navigation__chevron { width:16px; height:16px; display:block; flex:none; background:currentColor; mask:url('/images/figma/home-revision/node-1523-98.svg') center / 8px 4px no-repeat; }
.patient-desktop-navigation__consult { display:flex; flex:none; width:80px; height:28px; align-items:center; justify-content:center; gap:6px; margin:0 8px 0 0; padding:6px 12px; border:0; border-radius:10px; color:#fff; background:linear-gradient(90deg,#DD6B20,#3B82F6); box-shadow:0 1px 2px -1px rgba(0,0,0,.1); font:600 12px/16px 'PingFang SC',sans-serif; white-space:nowrap; cursor:pointer; }
.patient-desktop-navigation__consult img { width:14px; height:14px; }
.patient-desktop-navigation__language { display:flex; flex:none; width:65px; height:28px; align-items:center; gap:4px; margin:0 0 0 8px; padding:6px 8px; border:0; border-radius:8px; background:transparent; color:#6B7280; font:400 10px/16px 'PingFang SC',sans-serif; cursor:pointer; }
.patient-desktop-navigation__language img { width:14px; height:14px; }
.patient-desktop-navigation__language span { font-size:12px; }
.patient-navigation-menu { position:fixed; z-index:80; display:flex; flex-direction:column; align-items:flex-start; gap:4px; padding:12px 14px 12px 12px; border:.5px solid #E3E4E8; border-radius:16px; background:#fff; box-sizing:border-box; pointer-events:auto; }
.patient-navigation-menu::before { content:''; position:absolute; left:0; right:0; top:calc(0px - var(--patient-menu-gap) - 1px); height:calc(var(--patient-menu-gap) + 1px); }
.patient-navigation-menu__item { display:flex; width:84px; flex:none; height:28px; align-items:center; padding:6px 10px; border:0; border-radius:8px; background:transparent; color:#6B7280; font:400 12px/16px 'PingFang SC',sans-serif; text-align:left; text-decoration:none; white-space:nowrap; box-sizing:border-box; cursor:pointer; }
.patient-navigation-menu--hospitals .patient-navigation-menu__item { width:92px; }
.patient-navigation-menu--language .patient-navigation-menu__item { width:100%; }
.patient-desktop-navigation--localized .patient-desktop-navigation__items { top:14px; height:auto; min-height:28px; justify-content:flex-end; flex-wrap:wrap; transform:translateY(-50%); }
.patient-desktop-navigation--localized .patient-desktop-navigation__consult { width:auto; min-width:80px; }
.patient-desktop-navigation--localized .patient-desktop-navigation__link { padding-inline:8px; }
.patient-navigation-menu--localized .patient-navigation-menu__item { width:100%; min-width:0; height:auto; min-height:28px; white-space:normal; overflow-wrap:anywhere; }
.patient-navigation-menu--language { min-width:168px; }
.patient-navigation-menu--language .patient-navigation-menu__item { height:auto; min-height:28px; white-space:normal; overflow-wrap:anywhere; }
.patient-navigation-menu__item.is-active { color:#2563EB; background:rgba(37,99,235,.1); font-weight:600; }
.patient-navigation-menu__item:not(:disabled):hover { background:#f5f8ff; }
.patient-navigation-menu__item:disabled { cursor:default; }
.patient-desktop-navigation :focus-visible,.patient-navigation-menu__item:focus-visible { outline:2px solid #2563EB; outline-offset:3px; }
</style>
