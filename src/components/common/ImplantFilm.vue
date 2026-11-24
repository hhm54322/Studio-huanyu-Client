<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useSiteCopy } from '@/i18n/siteCopy'
import { implantMediaCopy } from '@/i18n/implantMedia'

defineProps<{ poster: string; playIcon: string; duration: string; logo: string }>()
const { locale } = useSiteCopy()
const copy = computed(() => implantMediaCopy[locale.value])
const media = '/images/figma/dental-implants-2026-11-23/media'
const enabled = ref(false)
const player = ref<HTMLVideoElement>()
async function play() {
  enabled.value = true
  await nextTick()
  player.value?.focus({ preventScroll: true })
  await player.value?.play().catch(() => undefined)
}
</script>

<template>
  <div class="implant-film" data-figma-node="4542:3780">
    <video v-if="enabled" ref="player" controls playsinline tabindex="0" preload="none"
      :poster="poster" :aria-label="copy.film" data-figma-node="4542:3781">
      <source :src="`${media}/implant-journey-v3.webm`" type="video/webm" />
      <source :src="`${media}/implant-journey-v3.mp4`" type="video/mp4" />
      <a :href="`${media}/implant-journey-v3.mp4`">{{ copy.film }}</a>
    </video>
    <div v-else class="implant-film__poster" data-figma-node="4542:3781">
      <img :src="poster" width="585" height="329" alt="" loading="lazy" />
      <span v-if="logo" class="implant-film__brand" data-figma-node="4542:3786"><img :src="logo" alt="Univadoc" loading="lazy" /></span>
      <button type="button" :aria-label="copy.playFilm" data-figma-node="4542:3782" @click="play">
        <img :src="playIcon" width="26" height="26" alt="" data-figma-node="4542:3783" />
      </button>
      <span class="implant-film__duration" data-figma-node="4542:3784">{{ duration }}</span>
    </div>
  </div>
</template>

<style scoped>
.implant-film { position:relative;width:100%;aspect-ratio:16/9;border-radius:24px;overflow:hidden;background:#0e2a33; }
.implant-film video,.implant-film__poster,.implant-film__poster>img { display:block;width:100%;height:100%;object-fit:cover; }
.implant-film__poster button { position:absolute;left:50%;top:50%;display:grid;place-items:center;width:min(76px,20%);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:white;box-shadow:0 12px 34px #0005; }
.implant-film__poster button:focus-visible { outline:3px solid #2563eb;outline-offset:3px; }
.implant-film__brand,.implant-film__duration { position:absolute;left:16px;display:block;background:#1e3a5f80;backdrop-filter:blur(6px); }
.implant-film__brand { top:16px;width:95.703px;padding:7px 12px;border:1px solid #fff3;border-radius:8px; }
.implant-film__brand img { display:block;width:100%;height:auto; }
.implant-film__duration { bottom:16px;max-width:calc(100% - 32px);padding:6px 11px;border-radius:999px;color:white;font-size:12px;line-height:18px;letter-spacing:.597px; }
</style>
