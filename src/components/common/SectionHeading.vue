<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ kicker?: string; title: string; description?: string; align?: 'left' | 'center'; light?: boolean }>(), {
  kicker: '', description: '', align: 'left', light: false,
})

const titleCharacters = computed(() => Array.from(props.title))
</script>

<template>
  <div class="section-heading" :class="[`section-heading--${align}`, { 'section-heading--light': light }]" data-reveal>
    <span v-if="kicker" class="hy-kicker">{{ kicker }}</span>
    <h2 class="hy-title motion-text" :aria-label="title">
      <span
        v-for="(character, index) in titleCharacters"
        :key="`${character}-${index}`"
        aria-hidden="true"
        :style="{ '--motion-index': index }"
      >{{ character === ' ' ? '\u00a0' : character }}</span>
    </h2>
    <p v-if="description" class="hy-copy">{{ description }}</p>
  </div>
</template>

<style scoped>
.section-heading { max-width: 720px; }
.section-heading .hy-copy { margin: 20px 0 0; }
.section-heading--center { margin-inline: auto; text-align: center; }
.section-heading--center .hy-kicker { justify-content: center; }
.section-heading--center .hy-copy { margin-inline: auto; }
.section-heading--light .hy-title { color: #fff; }
.section-heading--light .hy-copy { color: rgba(255, 255, 255, .72); }
.section-heading--light .hy-kicker { color: #8dd7fa; }
.motion-text > span { display: inline-block; opacity: .18; filter: blur(7px); transform: translateY(9px); transition: opacity .55s ease, filter .65s ease, transform .65s cubic-bezier(.22, 1, .36, 1); transition-delay: calc(var(--motion-index) * 18ms); }
.section-heading.is-visible .motion-text > span { opacity: 1; filter: blur(0); transform: translateY(0); }
.section-heading[data-reveal-visible="true"] .motion-text > span { opacity: 1; filter: blur(0); transform: translateY(0); }
@media (max-width: 767px), (prefers-reduced-motion: reduce) { .motion-text > span { opacity: 1; filter: none; transform: none; transition: none; } }
</style>
