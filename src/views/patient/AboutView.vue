<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="px-4 py-8">
    <h1 class="text-xl font-bold mb-4" style="color: var(--patient-primary)">
      {{ t('nav.about') }}
    </h1>
    <div class="text-center py-16" style="color: var(--text-muted)">
      <p class="text-sm">关于我们页 — 待实现</p>
      <p class="text-xs mt-2">CoreValues / ComparisonTable / Team / Contact</p>
    </div>
  </div>
</template>
