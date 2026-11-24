<script setup lang="ts">
defineProps<{ open: boolean }>()
</script>

<template>
  <div class="accordion-panel-motion" :class="{ 'is-open': open }" :aria-hidden="!open" :inert="!open">
    <div class="accordion-panel-motion__inner"><slot /></div>
  </div>
</template>

<style scoped>
.accordion-panel-motion { display:grid; grid-template-rows:0fr; min-width:0; opacity:0; transition:grid-template-rows .38s cubic-bezier(.22,1,.36,1),opacity .24s ease; }
.accordion-panel-motion.is-open { grid-template-rows:1fr; opacity:1; }
.accordion-panel-motion__inner { min-height:0; overflow:hidden; }
@media (prefers-reduced-motion:reduce) { .accordion-panel-motion { transition:none; } }
</style>
