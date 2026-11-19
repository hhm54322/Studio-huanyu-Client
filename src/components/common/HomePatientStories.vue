<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSiteCopy } from '@/i18n/siteCopy'
import { useAutoplayCarousel } from '@/composables/useAutoplayCarousel'
import { patientCases, homePatientStories, type PatientCase } from '@/data/patientCases'
import PatientCaseDialog from './PatientCaseDialog.vue'
const { tx, tf } = useSiteCopy()
const storyRoot = ref<HTMLElement | null>(null)
const selected = ref<PatientCase | null>(null)
const keyboardFocus = ref(false)
// The active slide changes, so resolve its image at pointer-event time.
const imageTarget = computed(() => {
  active.value
  return storyRoot.value?.querySelector<HTMLElement>('.home-stories__slide--active .home-stories__photo') ?? null
})
const pauseWhen = computed(() => Boolean(selected.value) || keyboardFocus.value)
const { activeIndex: active, select, paused, togglePause } = useAutoplayCarousel(storyRoot, patientCases.length, { hoverTarget: imageTarget, pauseWhen })
const leaving = ref<number | null>(null)
let leavingTimer: ReturnType<typeof setTimeout> | undefined
watch(active, (next, previous) => {
  if (next === previous) return
  leaving.value = previous
  window.clearTimeout(leavingTimer)
  leavingTimer = window.setTimeout(() => { leaving.value = null }, 650)
}, { flush: 'sync' })
onBeforeUnmount(() => window.clearTimeout(leavingTimer))
const stories = homePatientStories
const sourceNodes = [
  { card:'4342:984', photo:'4342:985', content:'4342:986', link:'4342:1015' },
  { card:'4342:1026', photo:'4342:1027', content:'4342:1028', link:'4342:1057' },
  { card:'4342:1066', photo:'4342:1067', content:'4342:1068', link:'4342:1097' },
  { card:'4342:1102', photo:'4342:1103', content:'4342:1104', link:'4342:1133' },
  { card:'4342:1138', photo:'4342:1139', content:'4342:1140', link:'4342:1169' },
  { card:'4342:1174', photo:'4342:1175', content:'4342:1176', link:'4342:1205' },
] as const
const layer = (index:number, offset:number) => `4342:${Number(sourceNodes[index]!.card.split(':')[1]) + offset}`
function chooseCase(index:number) { select(index) }
function onFocusIn(event: FocusEvent) {
  keyboardFocus.value = event.target instanceof HTMLElement && event.target.matches(':focus-visible')
}
function onFocusOut(event: FocusEvent) {
  if (!(event.relatedTarget instanceof Node && storyRoot.value?.contains(event.relatedTarget))) keyboardFocus.value = false
}
</script>
<template>
  <section class="home-stories" aria-labelledby="home-story-title" data-figma-node="4342:983">
    <div class="hy-container"><h2 id="home-story-title">{{tx('患者故事 · 真实见证')}}</h2>
      <div ref="storyRoot" class="home-stories__viewport" @focusin="onFocusIn" @focusout="onFocusOut">
        <div v-for="(patient, index) in patientCases" :key="patient.id"
          class="home-stories__slide" :class="{ 'home-stories__slide--active': index === active, 'home-stories__slide--leaving': index === leaving }"
          :aria-hidden="index !== active" :inert="index !== active" :data-figma-node="sourceNodes[index]?.card">
          <div class="home-stories__photo" :data-figma-node="sourceNodes[index]?.photo">
            <img :src="patient.photos[0]" :alt="tx('患者照片')" loading="lazy" />
          </div>
          <div class="home-stories__content" :data-figma-node="sourceNodes[index]?.content">
            <div :data-figma-node="layer(index, 3)" :data-figma-collapsed="`${layer(index, 6)} ${layer(index, 8)}`">
              <p class="home-stories__label" :data-figma-node="stories[index]?.[0]?.nodeId" :data-figma-collapsed="layer(index, 4)">{{tx(stories[index]?.[0]?.text || patient.specialty.text)}}</p>
              <h3 :data-figma-node="stories[index]?.[1]?.nodeId">{{tx(stories[index]?.[1]?.text || patient.headline.text)}}</h3>
              <p v-for="(line,i) in (stories[index] || []).slice(2)" :key="line.nodeId" class="home-stories__point" :data-figma-node="line.nodeId" :data-figma-collapsed="`${layer(index, 9+6*i)} ${layer(index, 13+6*i)}`">
                <svg :data-figma-node="layer(index, 10+6*i)" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path :data-figma-node="layer(index, 11+6*i)" d="M14.5341 6.66764C14.8385 8.16183 14.6215 9.71525 13.9193 11.0688C13.2171 12.4224 12.072 13.4943 10.6751 14.1058C9.27816 14.7174 7.71382 14.8315 6.24293 14.4292C4.77205 14.0269 3.48353 13.1326 2.59225 11.8952C1.70097 10.6579 1.26081 9.15246 1.34518 7.62989C1.42954 6.10733 2.03332 4.6597 3.05583 3.52842C4.07835 2.39714 5.45779 1.65059 6.96411 1.41327C8.47043 1.17595 10.0126 1.46221 11.3334 2.2243" stroke="#2563EB" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/><path :data-figma-node="layer(index, 12+6*i)" d="M6 7.33268L8 9.33268L14.6667 2.66602" stroke="#2563EB" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/></svg>{{tx(line.text)}}
              </p>
            </div>
            <button class="home-stories__detail" type="button" :data-figma-node="sourceNodes[index]?.link" :data-figma-collapsed="layer(index, 30)" @click="selected=patient"><span :data-figma-node="layer(index, 32)">{{tx([2,5].includes(index) ? '查看她的故事' : '查看他的故事')}}</span><svg :data-figma-node="layer(index, 33)" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path :data-figma-node="layer(index, 34)" d="M3.33325 8H12.6666" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path :data-figma-node="layer(index, 35)" d="M8 3.33398L12.6667 8.00065L8 12.6673" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        </div>
        <button class="home-stories__pause" type="button" :aria-pressed="paused" @click="togglePause">{{tx(paused?'播放':'暂停')}}</button>
      </div>
      <div class="home-stories__cases" :aria-label="tx('患者案例')"><button v-for="(item,i) in patientCases" :key="item.id" type="button" :class="{active:i===active}" :aria-pressed="i===active" :aria-label="tf('查看第{arg0}个案例',{arg0:i+1})" @click="chooseCase(i)" /></div>
    </div>
    <PatientCaseDialog :patient="selected" @close="selected=null" />
  </section>
</template>
<style scoped>
.home-stories{padding:96px 0;background:#fff;color:#1e3a5f}
.home-stories h2{text-align:center;font-size:36px;line-height:1.3;margin:0 0 48px}
.home-stories__viewport{position:relative;display:grid;overflow:hidden}
.home-stories__slide{grid-area:1/1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.06164fr);gap:24px;min-width:0;min-height:400px;visibility:hidden;transform:translateX(100%);pointer-events:none}
.home-stories__slide--active,.home-stories__slide--leaving{visibility:visible;transition:transform 600ms cubic-bezier(.22,1,.36,1)}
.home-stories__slide--active{transform:translateX(0);pointer-events:auto}
.home-stories__slide--leaving{transform:translateX(-100%)}
.home-stories__photo{position:relative;min-width:0;min-height:400px;overflow:hidden;border-radius:24px}
.home-stories__photo>img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover}
.home-stories__content{display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;box-sizing:border-box;min-width:0;min-height:400px;padding:32px;border-radius:24px;background:#f5f6f7}
.home-stories__label{display:inline-flex;max-width:100%;padding:4px 12px;border-radius:23px 47px 47px 23px;background:rgba(37,99,235,.1);font-size:14px;line-height:21px;color:#2563eb;margin:0 0 24px}
.home-stories__content h3{font-size:24px;font-weight:500;line-height:1.5;margin:0 0 24px}
.home-stories__point{display:flex;gap:8px;font-size:16px;line-height:24px;color:#4b5563;margin:0 0 12px}
.home-stories__point svg{flex:none;margin-top:4px}
.home-stories__detail{display:inline-flex;align-items:center;gap:8px;margin-top:24px;min-height:52px;padding:18px 24px;border:0;border-radius:14px;background:#dd6b20;color:#fff;font:600 16px/16px "PingFang SC",sans-serif;cursor:pointer}
.home-stories__detail svg{flex:none}
.home-stories__cases{display:flex;justify-content:center;gap:10px;margin-top:24px}
.home-stories__cases button{padding:0;width:10px;height:10px;border:0;border-radius:50%;background:#d7dce4;cursor:pointer}
.home-stories__cases .active{width:32px;border-radius:20px;background:#dd6b20}
.home-stories__pause{position:absolute;right:10px;bottom:10px;clip-path:inset(50%)}
.home-stories__pause:focus-visible{clip-path:none;z-index:2}
.home-stories__content button:focus-visible,.home-stories__cases button:focus-visible{outline:3px solid #2164e7;outline-offset:3px}
@media(max-width:800px){
  .home-stories{padding:64px 0}
  .home-stories h2{font-size:28px}
  .home-stories__slide{grid-template-columns:1fr;grid-template-rows:280px 1fr}
  .home-stories__photo{min-height:280px}
  .home-stories__content{min-height:0;padding:24px}
}
@media(prefers-reduced-motion:reduce){.home-stories__slide{transition:none}}
</style>
