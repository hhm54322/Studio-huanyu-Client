<script setup lang="ts">
import '@/i18n/patient-layout.css'
import { useSiteCopy } from '@/i18n/siteCopy'
const { tx } = useSiteCopy()

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
const sourceArticle = computed(() => articleDesktop.value && route.path === '/steps/toolkit-detail')
const sourceDirectory = computed(() => ['/hospitals', '/doctors'].includes(route.path))
const sourceTrust = computed(() => articleDesktop.value && route.path === '/trust')
const dentalPage = computed(() => route.path === '/dental' || route.name === 'patient-dental-doctor')
function updateHomeViewport() {
  homeMobile.value = window.innerWidth <= 700
  articleDesktop.value = window.innerWidth > 900
}
const shell = ref<HTMLElement | null>(null)
usePatientMotion(shell)
onMounted(() => window.addEventListener('resize', updateHomeViewport, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('resize', updateHomeViewport))
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
    }"
  >
    <div class="patient-shell__body" :data-figma-node="route.path === '/' && !homeMobile ? '1412:5683' : undefined">
    <PatientHeader v-if="!sourceArticle && (!sourceDirectory || homeMobile && route.path === '/doctors') && !sourceTrust && (!dentalPage || homeMobile)" :consultation-icon="route.path === '/hospitals' ? '/images/figma/hospital-source/node-484-1559.svg' : route.path === '/cases' ? '/images/figma/case-source/node-484-1602.svg' : route.path === '/diseases-technologies' ? '/images/figma/disease-source/node-484-1516.svg' : undefined" :language-icon="route.path === '/hospitals' ? '/images/figma/hospital-source/node-484-1583.svg' : route.path === '/cases' ? '/images/figma/case-source/node-484-1626.svg' : route.path === '/diseases-technologies' ? '/images/figma/disease-source/node-484-1540.svg' : undefined" />
    <main class="flex-1"><RouterView /></main>
    <PatientFooter v-if="!sourceArticle && !sourceDirectory && !sourceTrust && (!dentalPage || homeMobile)" :contact-icons="route.path === '/hospitals' ? [5198, 5204, 5209].map(id => `/images/figma/hospital-source/node-144-${id}.svg`) : route.path === '/cases' ? [5473, 5479, 5484].map(id => `/images/figma/case-source/node-190-${id}.svg`) : route.path === '/diseases-technologies' ? [4630, 4636, 4641].map(id => `/images/figma/disease-source/node-144-${id}.svg`) : undefined" />
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
