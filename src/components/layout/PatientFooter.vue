<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
const { tx, localized } = useSiteCopy()

import { publicContacts } from '@/data/publicContacts'
import { useWhatsAppContact } from '@/composables/useWhatsAppContact'
const { whatsappHref } = useWhatsAppContact('footer-shared')
withDefaults(defineProps<{ contactIcons?: string[]; embedded?: boolean }>(), {
  contactIcons: () => [4871, 4877, 4882].map(id => `/images/figma/dental-implants-2026-11-23/node-4542-${id}.svg`),
  embedded: false,
})
const serviceLinks = [{ label:'疾病中心',path:'/diseases-technologies' },{ label:'费用对比',path:'/cost' },{ label:'报告体验',path:'/report' },{ label:'签证办理',path:'/visa' },{ label:'就医步骤',path:'/steps' }]
const resourceLinks = [{ label:'患者案例',path:'/cases' },{ label:'保险指南',path:'/insurance' },{ label:'就医步骤',path:'/steps' },{ label:'关于我们',path:'/about' }]
</script>
<template>
  <footer class="patient-footer" :class="{'is-localized':localized, 'is-embedded':embedded}" data-figma-node="4759:179">
    <div class="footer-top hy-container">
      <div class="footer-intro"><RouterLink to="/" class="footer-logo" aria-label="Univadoc+" /><p>{{ tx("全球患者来华就医首选平台") }}</p><small>{{ tx("蚂蚁集团技术保障 × 好大夫94万医生") }}</small></div>
      <div class="footer-column"><h3>{{ tx("服务") }}</h3><RouterLink v-for="item in serviceLinks" :key="item.label" :to="item.path">{{ tx(item.label) }}</RouterLink></div>
      <div class="footer-column"><h3>{{ tx("资源") }}</h3><RouterLink v-for="item in resourceLinks" :key="item.label" :to="item.path">{{ tx(item.label) }}</RouterLink></div>
      <div class="footer-column footer-contact">
        <h3>{{ tx("联系") }}</h3>
        <a :href="publicContacts.emailHref" data-figma-node="4759:219"><img :src="contactIcons[0]" alt="" aria-hidden="true" />{{ publicContacts.email }}</a>
        <a :href="publicContacts.phoneHref" data-figma-node="4759:225"><img :src="contactIcons[1]" alt="" aria-hidden="true" />{{ publicContacts.phone }}</a>
        <a :href="publicContacts.instagramHref" class="footer-instagram" data-figma-node="4759:260" target="_blank" rel="noopener noreferrer" :aria-label="`Instagram: ${publicContacts.instagram}`"><img src="/images/figma/footer-2026-11-24/instagram-4759-266.svg" alt="" aria-hidden="true" />{{ publicContacts.instagram }}</a>
        <a :href="publicContacts.facebookHref" data-figma-node="4759:237" target="_blank" rel="noopener noreferrer"><img src="/images/figma/footer-2026-11-24/facebook-4759-238.svg" alt="" aria-hidden="true" />Facebook</a>
        <a :href="whatsappHref" class="footer-whatsapp" data-contact-entry="footer-shared" target="_blank" rel="noopener noreferrer"><img src="/images/figma/footer-2026-11-24/whatsapp-4759-231.svg" alt="" aria-hidden="true" />WhatsApp</a>
      </div>
    </div>
    <div class="footer-bottom hy-container"><div class="footer-bottom-row"><span>{{ tx("Copyright 2026 寰宇云医. All rights reserved.") }}</span><div><button type="button">{{ tx("隐私政策") }}</button><span class="footer-separator">|</span><button type="button">{{ tx("服务条款") }}</button></div></div></div>
  </footer>
</template>
<style scoped>
.patient-footer { -webkit-font-smoothing: antialiased; }
.patient-footer { box-sizing:border-box; height:440px; padding:64px 0; background:#021d2e; color:#9ca3af; font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif; }
.patient-footer :deep(.hy-container) { width:min(1216px,calc(100% - 48px)); }
.footer-top { display:grid; height:231px; grid-template-columns:repeat(4,minmax(0,1fr)); gap:48px; }
.footer-logo { display:block; width:148px; height:48px; background:url('/images/brand/univadoc-2026-11-24-light.png') left center / contain no-repeat; }
.footer-intro p { margin:16px 0 12px; color:#d1d5db; font-size:14px; line-height:22.75px; }
.footer-intro small { display:block; font-size:12px; line-height:19.5px; }
.footer-column { display:flex; flex-direction:column; align-items:flex-start; gap:10px; }
.footer-column h3 { margin:0 0 6px; color:#d1d5db; font-size:14px; font-weight:600; line-height:20px; letter-spacing:.55px; }
.footer-column a,.footer-column>span { color:#9ca3af; font-size:14px; line-height:20px; transition:color .2s ease; }
.footer-column a:hover { color:#fff; }
.footer-contact { gap:12px; }
.footer-contact h3 { margin-bottom:4px; }
.footer-contact>a { display:flex; align-items:center; gap:8px; }
.footer-contact .footer-instagram { max-width:100%; overflow-wrap:anywhere; }
.footer-contact img { width:16px; height:16px; flex:none; }
.footer-contact .footer-whatsapp { justify-content:center; min-height:36px; border:1px solid #2563eb; border-radius:6px; padding:7px 14px; color:#fff; background:#2563eb; font-weight:600; }
.footer-contact .footer-whatsapp:hover { background:#1d4ed8; }
.footer-whatsapp img { filter:brightness(0) invert(1); }
.footer-bottom { padding-top:40px; color:#6b7280; font-size:12px; line-height:16px; }
.footer-bottom-row { display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(255,255,255,.1); padding-top:24px; }
.footer-bottom-row>div { display:flex; align-items:center; gap:16px; }
.footer-separator { color:#4b5563; }
.footer-bottom button { border:0; padding:0; background:transparent; color:inherit; font-size:inherit; cursor:pointer; }
.patient-footer.is-localized { height:auto; min-height:440px; }
.is-localized .footer-top { height:auto; min-height:231px; }
.is-localized .footer-column { min-width:0; }
.is-localized .footer-column a,.is-localized .footer-intro { max-width:100%; overflow-wrap:anywhere; }
.is-localized .footer-bottom-row { flex-wrap:wrap; row-gap:16px; }
.is-localized .footer-bottom-row>div { flex-wrap:wrap; }
@media (max-width:860px) { .patient-footer:not(.is-embedded) { height:auto; }.patient-footer:not(.is-embedded) .footer-top { height:auto; grid-template-columns:1.2fr 1fr 1fr; gap:42px; }.patient-footer:not(.is-embedded) .footer-intro { grid-column:1/-1; }.patient-footer:not(.is-embedded) .footer-bottom { height:auto; } }
@media (max-width:560px) { .patient-footer:not(.is-embedded) { height:auto; padding:52px 0 28px; }.patient-footer:not(.is-embedded) :deep(.hy-container) { width:calc(100% - 32px); }.patient-footer:not(.is-embedded) .footer-top { height:auto; grid-template-columns:1fr 1fr; gap:36px 24px; }.patient-footer:not(.is-embedded) .footer-contact { grid-column:1/-1; }.patient-footer:not(.is-embedded) .footer-bottom { margin-top:36px; padding-top:0; }.patient-footer:not(.is-embedded) .footer-bottom-row { align-items:flex-start; flex-direction:column; gap:12px; padding-top:20px; } }
</style>
