<script setup lang="ts">
import BrandLogo from '@/components/common/BrandLogo.vue'
const serviceLinks = [{ label:'疾病中心',path:'/diseases-technologies' },{ label:'费用对比',path:'/cost' },{ label:'报告体验',path:'/report' },{ label:'签证办理',path:'/visa' },{ label:'就医步骤',path:'/steps' }]
const resourceLinks = [{ label:'患者案例',path:'/cases' },{ label:'保险指南',path:'/insurance' },{ label:'就医步骤',path:'/steps' },{ label:'关于我们',path:'/about' }]
</script>
<template><footer class="patient-footer"><div class="footer-top hy-container"><div class="footer-intro"><BrandLogo light compact /><p>全球患者来华就医首选平台</p><small>蚂蚁集团技术保障 × 好大夫94万医生</small></div><div class="footer-column"><h3>服务</h3><RouterLink v-for="item in serviceLinks" :key="item.label" :to="item.path">{{ item.label }}</RouterLink></div><div class="footer-column"><h3>资源</h3><template v-for="item in resourceLinks" :key="item.label"><RouterLink v-if="item.path" :to="item.path">{{ item.label }}</RouterLink><span v-else>{{ item.label }}</span></template></div><div class="footer-column footer-contact"><h3>联系</h3><a href="mailto:contact@huanyuyunyi.com"><img src="/images/figma/trust/Icon.svg" alt="" aria-hidden="true" />contact@huanyuyunyi.com</a><a href="tel:+864008886688"><img src="/images/figma/trust/Icon-20.svg" alt="" aria-hidden="true" />+86 400-888-6688</a><a href="https://wa.me/864008886688" target="_blank" rel="noopener noreferrer"><img src="/images/figma/trust/Icon-13.svg" alt="" aria-hidden="true" />WhatsApp</a><div class="footer-service"><b>24小时客服</b><i>扫码加微信</i></div></div></div><div class="footer-bottom hy-container"><span>Copyright 2026 寰宇云医. All rights reserved.</span><div><button type="button">隐私政策</button><i /><button type="button">服务条款</button></div></div></footer></template>
<style scoped>
.patient-footer { height:456px; padding:64px 0; background:#021d2e; color:rgba(255,255,255,.52); }
.patient-footer :deep(.hy-container) { width:min(1216px,calc(100% - 48px)); }
.footer-top { display:grid; height:247px; grid-template-columns:1.28fr .9fr .9fr 1.05fr; gap:74px; }
.footer-intro p { margin:20px 0 7px; color:rgba(255,255,255,.72); font-size:12px; }
.footer-intro small { font-size:10px; }
.footer-column { display:flex; flex-direction:column; align-items:flex-start; gap:11px; }
.footer-column h3 { margin:3px 0 12px; color:rgba(255,255,255,.74); font-size:12px; font-weight:700; }
.footer-column a,.footer-column>span { color:rgba(255,255,255,.47); font-size:11px; transition:color .2s ease; }
.footer-column a:hover { color:#fff; }
.footer-contact>a { display:flex; align-items:center; gap:7px; }
.footer-contact img { width:16px; height:16px; flex:none; }
.footer-service { width:100%; margin-top:2px; padding-top:10px; border-top:1px solid rgba(255,255,255,.09); }
.footer-service b { display:block; color:#167fd4; font-size:10px; }
.footer-service i { display:grid; width:80px; height:80px; place-items:center; margin-top:6px; border-radius:10px; background:rgba(255,255,255,.1); color:rgba(255,255,255,.32); font-size:9px; font-style:normal; }
.footer-bottom { display:flex; height:81px; align-items:flex-end; justify-content:space-between; border-top:1px solid rgba(255,255,255,.09); padding-top:40px; font-size:9px; }
.footer-bottom div { display:flex; align-items:center; gap:12px; }
.footer-bottom i { width:1px; height:10px; background:rgba(255,255,255,.16); }
.footer-bottom button { border:0; padding:0; background:transparent; color:inherit; font-size:inherit; cursor:pointer; }
@media (max-width:860px) { .patient-footer { height:auto; }.footer-top { height:auto; grid-template-columns:1.2fr 1fr 1fr; gap:42px; }.footer-intro { grid-column:1/-1; }.footer-bottom { height:auto; } }
@media (max-width:560px) { .patient-footer { height:auto; padding:52px 0 28px; }.patient-footer :deep(.hy-container) { width:calc(100% - 32px); }.footer-top { height:auto; grid-template-columns:1fr 1fr; gap:36px 24px; }.footer-contact { grid-column:1/-1; }.footer-bottom { height:auto; align-items:flex-start; flex-direction:column; gap:12px; margin-top:36px; padding-top:20px; } }
</style>
