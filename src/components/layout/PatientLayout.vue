<script setup lang="ts">
import '@/i18n/patient-layout.css'
import { useSiteCopy } from '@/i18n/siteCopy'
const { tx } = useSiteCopy()

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePatientMotion } from '@/composables/usePatientMotion'
import ConsultationPanel from '@/components/common/ConsultationPanel.vue'
import PatientFooter from './PatientFooter.vue'
import PatientHeader from './PatientHeader.vue'
import WhatsAppContact from '@/components/common/WhatsAppContact.vue'
import { providePatientContact } from '@/composables/useWhatsAppContact'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const app = useAppStore()
providePatientContact()
const homeMobile = ref(typeof window !== 'undefined' && window.innerWidth <= 700)
const articleDesktop = ref(typeof window === 'undefined' || window.innerWidth > 900)
const sourceArticle = computed(() => articleDesktop.value && (route.path === '/steps/toolkit-detail' || route.path.startsWith('/guides/')))
const sourceDirectory = computed(() => ['/hospitals', '/doctors'].includes(route.path))
const sourceTrust = computed(() => articleDesktop.value && route.path === '/trust')
const dentalPage = computed(() => route.path === '/dental' || route.name === 'patient-dental-doctor')
const revisionSource = computed(() => articleDesktop.value && (route.name === 'patient-dental-implant' || route.name === 'patient-news'))
function updateHomeViewport() {
  homeMobile.value = window.innerWidth <= 700
  articleDesktop.value = window.innerWidth > 900
}
const shell = ref<HTMLElement | null>(null)
const mainContent = ref<HTMLElement | null>(null)
const sourceFooterOverlap = ref(0)
let footerObserver: ResizeObserver | undefined
let treeObserver: MutationObserver | undefined
let footerFrame = 0
let observedFooterAnchor: HTMLElement | null = null
function measureSourceFooter() {
  footerFrame = 0
  const main = mainContent.value
  const anchor = main?.querySelector<HTMLElement>('[data-source-footer-placeholder]')?.parentElement
  if (!main || !anchor) { sourceFooterOverlap.value = 0; return }
  const mainBox = main.getBoundingClientRect(), anchorBox = anchor.getBoundingClientRect()
  sourceFooterOverlap.value = Math.max(0, Math.min(anchorBox.height, mainBox.bottom - anchorBox.top))
}
function scheduleFooterMeasure() { if (!footerFrame) footerFrame = requestAnimationFrame(measureSourceFooter) }
function watchFooterAnchor() {
  if (!mainContent.value) return
  const anchor = mainContent.value.querySelector<HTMLElement>('[data-source-footer-placeholder]')?.parentElement || null
  if (anchor !== observedFooterAnchor) {
    footerObserver?.disconnect()
    footerObserver?.observe(mainContent.value)
    if (anchor) footerObserver?.observe(anchor)
    observedFooterAnchor = anchor
  }
  scheduleFooterMeasure()
}
usePatientMotion(shell)
watch(() => route.fullPath, () => { sourceFooterOverlap.value = 0; void nextTick(watchFooterAnchor) })
onMounted(() => {
  window.addEventListener('resize', updateHomeViewport, { passive: true })
  footerObserver = new ResizeObserver(scheduleFooterMeasure)
  treeObserver = new MutationObserver(watchFooterAnchor)
  if (mainContent.value) { footerObserver.observe(mainContent.value); treeObserver.observe(mainContent.value, { childList:true, subtree:true }) }
  watchFooterAnchor()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHomeViewport)
  footerObserver?.disconnect(); treeObserver?.disconnect()
  if (footerFrame) cancelAnimationFrame(footerFrame)
})
</script>

<template>
  <div
    ref="shell"
    class="patient-shell min-h-screen flex flex-col"
    :data-figma-node="route.path === '/' ? homeMobile ? '1528:116' : '1412:5682' : undefined"
    :class="{
      'patient-shell--disease': route.path === '/diseases-technologies',
      'patient-shell--trust': route.path === '/trust',
      'patient-shell--source-article': sourceArticle,
      'patient-shell--about': route.path === '/about',
      'patient-shell--home': route.path === '/',
      'patient-shell--why-china': route.path === '/why-china',
      'patient-shell--hospitals': sourceDirectory,
      'patient-shell--cases': route.path === '/cases',
      'patient-shell--dental': dentalPage,
      'patient-shell--insurance': route.path === '/insurance',
      'patient-shell--cost': route.path === '/cost' || route.path === '/cost-generated',
      'patient-shell--revision-source': revisionSource,
    }"
  >
    <div class="patient-shell__body" :data-figma-node="route.path === '/' && !homeMobile ? '1412:5683' : undefined">
    <PatientHeader />
    <main ref="mainContent" class="flex-1"><RouterView /></main>
    <PatientFooter :style="{ marginTop: `-${sourceFooterOverlap}px` }" />
    <ConsultationPanel />
    <WhatsAppContact />
    <div v-if="app.localeLoadError" class="patient-language-error" role="alert">{{ tx(app.localeLoadError) }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Register the exact local faces once for every patient route. Lazy sections
   and dialogs reuse these faces instead of repeating their @font-face rules.
   Keep this in the patient shell so hospital administration is unaffected. */
@import url('/fonts/home-source-fonts.css');
.patient-language-error { position:fixed; top:80px; left:50%; transform:translateX(-50%); z-index:10000; max-width:calc(100vw - 32px); padding:12px 20px; border-radius:8px; color:#fff; background:#1e3a5f; }
.patient-shell__body { display:contents; }
/* Source-based canvases include a 64px header and a 456px footer in their
   coordinate systems. The shared shell owns both; keep those coordinates
   while removing only the space reserved for the old footer. */
@media (min-width:701px) {
  .patient-shell--source-article :deep(.toolkit-detail-page),
  .patient-shell--source-article :deep(.toolkit-detail-page *) { scroll-margin-top:80px; }
  .patient-shell--hospitals :deep(.hospital-page),
  .patient-shell--hospitals :deep(.physician-page),
  .patient-shell--dental :deep(.dental-project-source),
  .patient-shell--dental :deep(.dental-desktop-flow),
  .patient-shell--dental :deep(.dental-doctor-page),
  .patient-shell--trust :deep(.trust-desktop-source),
  .patient-shell--source-article :deep(.content-article),
  .patient-shell--revision-source :deep(.implant-page),
  .patient-shell--revision-source :deep(.news-page) { margin-top:-64px; }
}
.patient-shell--dental :deep(.dental-project-source [data-figma-name="Header"]),
.patient-shell--dental :deep(.dental-desktop-flow [data-figma-name="Header"]),
.patient-shell--dental :deep(.dental-doctor-page [data-figma-name="Header"]) { visibility:hidden!important; pointer-events:none!important; }
.patient-shell--source-article :deep(.content-article [data-figma-name="Header"]) { visibility:hidden!important; pointer-events:none!important; }
.patient-shell--source-article :deep(.consult-float) { display:none; }
.patient-shell--disease :deep(.footer-intro .brand-logo__mark) { font-size:14px; font-weight:700; line-height:20px; letter-spacing:0; }
.patient-shell--disease :deep(.footer-intro .brand-logo__copy strong) { font-weight:700; line-height:28px; }
.patient-shell--disease :deep(.footer-column h3),
.patient-shell--disease :deep(.ask-aning) { font-weight:590; letter-spacing:0; }
.patient-shell--disease :deep(.footer-service b),
.patient-shell--disease :deep(.desktop-nav>a:nth-child(n+5)) { font-weight:510; }
.patient-shell--disease :deep(.desktop-nav>a.active) { font-weight:600; }
.patient-shell--disease :deep(.language-button b),
.patient-shell--disease :deep(.header-logo .brand-logo__mark),
.patient-shell--disease :deep(.header-logo .brand-logo__copy strong) { letter-spacing:0; }
.patient-shell--cases :deep(.footer-intro .brand-logo__mark) { font-size:14px; font-weight:700; line-height:20px; letter-spacing:0; }
.patient-shell--cases :deep(.footer-intro .brand-logo__copy strong) { font-weight:700; line-height:28px; }
.patient-shell--cases :deep(.footer-column h3),
.patient-shell--cases :deep(.ask-aning) { font-weight:590; letter-spacing:0; }
.patient-shell--cases :deep(.footer-service b),
.patient-shell--cases :deep(.desktop-nav>a:nth-child(n+4)) { font-weight:510; }
.patient-shell--cases :deep(.desktop-nav>a.active) { font-weight:600; }
.patient-shell--cases :deep(.language-button b),
.patient-shell--cases :deep(.header-logo .brand-logo__mark),
.patient-shell--cases :deep(.header-logo .brand-logo__copy strong) { letter-spacing:0; }
.patient-shell--cases :deep(.consult-float) { display:none; }
.patient-shell--hospitals :deep(.footer-intro .brand-logo__mark) { font-size:14px; font-weight:700; line-height:20px; letter-spacing:0; }
.patient-shell--hospitals :deep(.footer-intro .brand-logo__copy strong) { font-weight:700; line-height:28px; }
.patient-shell--hospitals :deep(.footer-column h3),
.patient-shell--hospitals :deep(.ask-aning) { font-weight:590; letter-spacing:0; }
.patient-shell--hospitals :deep(.footer-service b),
.patient-shell--hospitals :deep(.desktop-nav>a:nth-child(n+4)) { font-weight:510; }
.patient-shell--hospitals :deep(.desktop-nav>a.active) { font-weight:600; }
.patient-shell--hospitals :deep(.language-button b),
.patient-shell--hospitals :deep(.header-logo .brand-logo__mark),
.patient-shell--hospitals :deep(.header-logo .brand-logo__copy strong) { letter-spacing:0; }
.patient-shell--hospitals :deep(.consult-float) { display:none; }
.patient-shell--why-china :deep(.footer-intro .brand-logo__mark) { font-size:14px; font-weight:700; line-height:20px; }
.patient-shell--why-china :deep(.footer-intro .brand-logo__copy strong) { font-weight:700; line-height:28px; }
.patient-shell--why-china :deep(.footer-column h3),
.patient-shell--why-china :deep(.ask-aning) { font-weight:590; }
.patient-shell--why-china :deep(.footer-service b),
.patient-shell--why-china :deep(.desktop-nav>a:nth-child(n+4)) { font-weight:510; }
.patient-shell--disease :deep(.consult-float),
.patient-shell--cost :deep(.consult-float),
.patient-shell--why-china :deep(.consult-float),
.patient-shell--about :deep(.consult-float),
.patient-shell--trust :deep(.consult-float),
.patient-shell--insurance :deep(.consult-float),
.patient-shell--dental :deep(.consult-float) { display: none; }
@media (min-width: 701px) {
  .patient-shell--home :deep(.consult-float) { display: none; }
}
</style>
