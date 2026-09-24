<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean; compact?: boolean }>(), { light: false, compact: false })
</script>
<template><span class="brand-logo" :class="{ 'brand-logo--light': light, 'brand-logo--compact': compact }"><span class="brand-logo__mark" aria-hidden="true">寰</span><span class="brand-logo__copy"><strong>寰宇云医</strong><small>HUANYU HEALTH</small></span></span></template>
<style scoped>
.brand-logo { display:inline-flex; align-items:center; gap:8px; color:#123b66; white-space:nowrap; }.brand-logo__mark { display:grid; width:32px; height:32px; flex:none; place-items:center; border-radius:8px; background:linear-gradient(145deg,#317ff4,#1a62e4); color:#fff; font-size:12px; font-weight:850; box-shadow:0 6px 14px rgba(38,103,222,.16); }.brand-logo__copy { display:grid; line-height:1; }.brand-logo__copy strong { font-size:18px; font-weight:800; }.brand-logo__copy small { margin-top:5px; color:#2287c8; font-size:6px; font-weight:800; letter-spacing:1.1px; }.brand-logo--compact .brand-logo__copy small { display:none; }.brand-logo--light { color:#fff; }.brand-logo--light .brand-logo__copy small { color:rgba(255,255,255,.56); }
@media (max-width:420px) { .brand-logo__copy strong { font-size:15px; } }
</style>
