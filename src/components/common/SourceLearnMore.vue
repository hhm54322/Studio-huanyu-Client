<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
defineProps<{ icon: string }>()
const { tx } = useSiteCopy()
</script>

<template>
  <span class="source-learn-more" aria-hidden="true"><span>{{ tx('了解更多') }}</span><img :src="icon" alt="" /></span>
</template>

<style scoped>
.source-learn-more { display:flex; align-items:center; gap:4px; width:max-content; max-width:calc(100% - 48px); color:#2563eb; font:500 16px/16px 'PingFang SC',sans-serif; white-space:nowrap; pointer-events:none; }
.source-learn-more img { display:block; flex:none; width:16px; height:16px; }
</style>
