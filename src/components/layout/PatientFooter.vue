<script setup lang="ts">
import BrandLogo from '@/components/common/BrandLogo.vue'
import { useRoute } from 'vue-router'
import HomeFigmaSection from '@/components/common/HomeFigmaSection.vue'
import { homeFigmaActions } from '@/data/homeFigmaActions'
const route = useRoute()
withDefaults(defineProps<{ contactIcons?: string[] }>(), { contactIcons: () => ['/images/figma/about-icons/Icon-9.svg', '/images/figma/about-icons/Icon-6.svg', '/images/figma/about-icons/Icon-10.svg'] })
const serviceLinks = [{ label:'疾病中心',path:'/diseases-technologies' },{ label:'费用对比',path:'/cost' },{ label:'报告体验',path:'/report' },{ label:'签证办理',path:'/visa' },{ label:'就医步骤',path:'/steps' }]
const resourceLinks = [{ label:'患者案例',path:'/cases' },{ label:'保险指南',path:'/insurance' },{ label:'就医步骤',path:'/steps' },{ label:'关于我们',path:'/about' }]
</script>
<template>
  <HomeFigmaSection v-if="route.path === '/'" desktop-id="1412:6672" mobile-id="1528:806" label="网站页脚" :actions="homeFigmaActions" />
  <footer v-else class="patient-footer" data-figma-node="484:2382">
    <div class="footer-top hy-container">
      <div class="footer-intro"><BrandLogo light compact /><p>全球患者来华就医首选平台</p><small>蚂蚁集团技术保障 × 好大夫94万医生</small></div>
      <div class="footer-column"><h3>服务</h3><RouterLink v-for="item in serviceLinks" :key="item.label" :to="item.path">{{ item.label }}</RouterLink></div>
      <div class="footer-column"><h3>资源</h3><RouterLink v-for="item in resourceLinks" :key="item.label" :to="item.path">{{ item.label }}</RouterLink></div>
      <div class="footer-column footer-contact">
        <h3>联系</h3>
        <a href="mailto:contact@huanyuyunyi.com"><img :src="contactIcons[0]" alt="" aria-hidden="true" />contact@huanyuyunyi.com</a>
        <a href="tel:+864008886688"><img :src="contactIcons[1]" alt="" aria-hidden="true" />+86 400-888-XXXX</a>
        <a href="https://wa.me/864008886688" target="_blank" rel="noopener noreferrer"><img :src="contactIcons[2]" alt="" aria-hidden="true" />WhatsApp</a>
        <div class="footer-service"><b>24小时客服</b><i>扫码加微信</i></div>
      </div>
    </div>
    <div class="footer-bottom hy-container"><div class="footer-bottom-row"><span>Copyright 2026 寰宇云医. All rights reserved.</span><div><button type="button">隐私政策</button><span class="footer-separator">|</span><button type="button">服务条款</button></div></div></div>
  </footer>
</template>
<style scoped>
.patient-footer { -webkit-font-smoothing: antialiased; }
.patient-footer { box-sizing:border-box; height:456px; padding:64px 0; background:#021d2e; color:#9ca3af; font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif; }
.patient-footer :deep(.hy-container) { width:min(1216px,calc(100% - 48px)); }
.footer-top { display:grid; height:247px; grid-template-columns:repeat(4,minmax(0,1fr)); gap:48px; }
.footer-intro p { margin:16px 0 12px; color:#d1d5db; font-size:14px; line-height:22.75px; }
.footer-intro small { display:block; font-size:12px; line-height:19.5px; }
.footer-column { display:flex; flex-direction:column; align-items:flex-start; gap:10px; }
.footer-column h3 { margin:0 0 6px; color:#d1d5db; font-size:14px; font-weight:600; line-height:20px; letter-spacing:.55px; }
.footer-column a,.footer-column>span { color:#9ca3af; font-size:14px; line-height:20px; transition:color .2s ease; }
.footer-column a:hover { color:#fff; }
.footer-contact { gap:12px; }
.footer-contact h3 { margin-bottom:4px; }
.footer-contact>a { display:flex; align-items:center; gap:8px; }
.footer-contact img { width:16px; height:16px; flex:none; }
.footer-service { width:100%; padding-top:12px; border-top:1px solid rgba(255,255,255,.1); }
.footer-service b { display:block; color:#2563eb; font-size:12px; font-weight:500; line-height:16px; }
.footer-service i { display:grid; width:80px; height:80px; place-items:center; margin-top:6px; border-radius:10px; background:rgba(255,255,255,.1); color:#6b7280; font-size:12px; line-height:16px; font-style:normal; }
.footer-bottom { padding-top:40px; color:#6b7280; font-size:12px; line-height:16px; }
.footer-bottom-row { display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(255,255,255,.1); padding-top:24px; }
.footer-bottom-row>div { display:flex; align-items:center; gap:16px; }
.footer-separator { color:#4b5563; }
.footer-bottom button { border:0; padding:0; background:transparent; color:inherit; font-size:inherit; cursor:pointer; }
@media (max-width:860px) { .patient-footer { height:auto; }.footer-top { height:auto; grid-template-columns:1.2fr 1fr 1fr; gap:42px; }.footer-intro { grid-column:1/-1; }.footer-bottom { height:auto; } }
@media (max-width:560px) { .patient-footer { height:auto; padding:52px 0 28px; }.patient-footer :deep(.hy-container) { width:calc(100% - 32px); }.footer-top { height:auto; grid-template-columns:1fr 1fr; gap:36px 24px; }.footer-contact { grid-column:1/-1; }.footer-bottom { margin-top:36px; padding-top:0; }.footer-bottom-row { align-items:flex-start; flex-direction:column; gap:12px; padding-top:20px; } }
</style>
