<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero -->
    <section
      class="px-4 py-16 text-center text-white"
      style="background: linear-gradient(135deg, var(--patient-primary), var(--patient-accent))"
    >
      <h1 class="text-2xl font-bold mb-3">{{ t('hero.title') }}</h1>
      <p class="text-white/80 text-sm mb-6">{{ t('hero.subtitle') }}</p>
      <button
        class="bg-white font-medium text-sm px-6 py-2.5 rounded-full"
        style="color: var(--patient-primary)"
      >
        {{ t('hero.cta') }}
      </button>
    </section>

    <!-- Placeholder content -->
    <section class="px-4 py-8">
      <div class="text-center" style="color: var(--text-muted)">
        <p class="text-sm">患者端首页 — 待实现</p>
        <p class="text-xs mt-2">Stats / Features / Charts / Cases / CostMatrix / Trust / CTA</p>
      </div>
    </section>
  </div>
</template>
