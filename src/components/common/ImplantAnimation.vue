<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useSiteCopy } from '@/i18n/siteCopy'
import { implantMediaCopy } from '@/i18n/implantMedia'
import drawing from './implant-anatomy.svg?raw'

const emit = defineEmits<{ complete: [] }>()
const { locale } = useSiteCopy()
const copy = computed(() => implantMediaCopy[locale.value])
const diagramText = {
  zh: ['钛植体', '连接件', '可见牙冠'], en: ['titanium root', 'connector', 'visible tooth'],
  id: ['akar titanium', 'penghubung', 'gigi yang terlihat'], ms: ['akar titanium', 'penyambung', 'gigi yang kelihatan'],
  pt: ['raiz de titânio', 'conector', 'dente visível'],
}
const diagram = computed(() => {
  const [gap, fixture, abutment, crown] = copy.value.labels
  const [root, connector, tooth] = diagramText[locale.value]
  return drawing.replace('>GAP<', `>${gap}<`).replace('>FIXTURE<', `>${fixture}<`)
    .replace('>ABUTMENT<', `>${abutment}<`).replace('>CROWN<', `>${crown}<`)
    .replace('>titanium root<', `>${root}<`).replace('>connector<', `>${connector}<`).replace('>visible tooth<', `>${tooth}<`)
})
const panel = ref<HTMLElement>()
const stage = ref(0)
const playing = ref(false)
const current = computed(() => copy.value.steps[stage.value]!)
const finalStage = 4
const interval = 1900
let timer: ReturnType<typeof setInterval> | undefined
let observer: IntersectionObserver | undefined
let motion: MediaQueryList | undefined
let inView = false
let interacted = false
let autoStarted = false

function pause() {
  clearInterval(timer)
  timer = undefined
  playing.value = false
}
function advance(by: number) {
  stage.value = Math.max(0, Math.min(finalStage, stage.value + by))
  if (stage.value === finalStage) pause()
}
function play() {
  if (playing.value) return
  if (stage.value === finalStage) stage.value = 0
  playing.value = true
  timer = setInterval(() => advance(1), interval)
}
function toggle() {
  interacted = true
  if (playing.value) pause()
  else play()
}
function select(by: number) {
  interacted = true
  pause()
  advance(by)
}
function reset() {
  interacted = true
  pause()
  stage.value = 0
}
function syncPlayback() {
  if (motion?.matches || !inView || document.hidden) {
    pause()
    return
  }
  if (!autoStarted && !interacted) {
    autoStarted = true
    play()
  }
}
onMounted(() => {
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  motion.addEventListener('change', syncPlayback)
  document.addEventListener('visibilitychange', syncPlayback)
  observer = new IntersectionObserver(([entry]) => {
    inView = (entry?.intersectionRatio ?? 0) >= .45
    syncPlayback()
  }, { threshold: .45 })
  if (panel.value) observer.observe(panel.value)
})
onBeforeUnmount(() => {
  pause()
  observer?.disconnect()
  motion?.removeEventListener('change', syncPlayback)
  document.removeEventListener('visibilitychange', syncPlayback)
})
</script>

<template>
  <div ref="panel" class="implant-animation" :data-stage="stage" :data-playing="playing">
    <div class="implant-animation__art" data-figma-node="4542:3675">
      <div class="implant-animation__diagram" :aria-label="copy.diagram" role="img" data-figma-node="4542:3676">
        <!-- The source SVG is checked in as static artwork. Its internal text is decorative. -->
        <div aria-hidden="true" v-html="diagram" />
      </div>
      <ul class="implant-animation__legend" aria-hidden="true" data-figma-node="4542:3724">
        <li v-for="(label, index) in copy.labels.slice(1)" :key="label" :data-part="index"
          :data-figma-node="'4542:' + (3727 + index * 3)"><span></span>{{ label }}</li>
      </ul>
    </div>
    <div class="implant-animation__controls" data-figma-node="4542:3734">
      <div class="implant-animation__text" :aria-live="playing ? 'off' : 'polite'">
        <p class="implant-animation__stage" data-figma-node="4542:3737">{{ current[0] }}</p>
        <h3 data-figma-node="4542:3738">{{ current[1] }}</h3>
        <p class="implant-animation__description" data-figma-node="4542:3740">{{ current[2] }}</p>
      </div>
      <div class="implant-animation__progress" role="progressbar" :aria-label="copy.progress"
        :aria-valuenow="(stage + 1) * 20" aria-valuemin="0" aria-valuemax="100" data-figma-node="4542:3742">
        <span :style="{ width: `${(stage + 1) * 20}%` }" data-figma-node="4542:3743" />
      </div>
      <div class="implant-animation__buttons" data-figma-node="4542:3744">
        <button type="button" class="implant-animation__play" data-figma-node="4542:3745" @click="toggle">
          <span aria-hidden="true">{{ playing ? '❚❚' : '▶' }}</span>
          <span data-figma-node="4542:3746">{{ playing ? copy.controls[1] : copy.controls[0] }}</span>
        </button>
        <button type="button" :disabled="stage === 0" data-figma-node="4542:3747" @click="select(-1)">
          <span aria-hidden="true">‹</span><span data-figma-node="4542:3748">{{ copy.controls[2] }}</span>
        </button>
        <button type="button" :disabled="stage === finalStage" data-figma-node="4542:3749" @click="select(1)">
          <span data-figma-node="4542:3750">{{ copy.controls[3] }}</span><span aria-hidden="true">›</span>
        </button>
        <button type="button" data-figma-node="4542:3751" @click="reset">
          <span aria-hidden="true">↺</span><span data-figma-node="4542:3752">{{ copy.controls[4] }}</span>
        </button>
      </div>
      <a v-if="stage === finalStage" href="#allon" class="implant-animation__complete" data-figma-node="4542:3754"
        @click.prevent="emit('complete')"><span data-figma-node="4542:3755">{{ copy.controls[5] }}</span><span aria-hidden="true">→</span></a>
    </div>
  </div>
</template>

<style scoped>
.implant-animation { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;height:100%; }
.implant-animation__art,.implant-animation__controls { min-width:0;padding:28px;border:1px solid rgb(227 232 236);border-radius:24px; }
.implant-animation__art { background:#fff; }
.implant-animation__controls { display:flex;flex-direction:column;background:#f5f6f7;gap:16px; }
.implant-animation__diagram { display:flex;align-items:center;min-height:250px;height:310.219px; }
.implant-animation__diagram > div { width:100%; }
.implant-animation__diagram :deep(svg) { display:block;width:100%;height:auto; }
.implant-animation__diagram :deep(.part) { opacity:0;transition:opacity .45s ease; }
.implant-animation__diagram :deep(.lbl) { opacity:0;transition:opacity .4s ease; }
.implant-animation__diagram :deep(.lbl text) { fill:#1f7a8c;font:700 11px Inter,sans-serif;letter-spacing:.06em; }
.implant-animation__diagram :deep(.lbl text.sub) { fill:#4a5a66;font-size:10px;font-weight:400;letter-spacing:0; }
[data-stage="0"] :deep(#p-gap),
:is([data-stage="1"],[data-stage="2"],[data-stage="3"],[data-stage="4"]) :deep(#p-fix),
:is([data-stage="1"],[data-stage="2"],[data-stage="3"],[data-stage="4"]) :deep(#l-fix),
:is([data-stage="2"],[data-stage="3"],[data-stage="4"]) :deep(#p-abut),
:is([data-stage="2"],[data-stage="3"],[data-stage="4"]) :deep(#l-abut),
:is([data-stage="3"],[data-stage="4"]) :deep(#p-crown),
:is([data-stage="3"],[data-stage="4"]) :deep(#l-crown),
[data-stage="4"] :deep(#p-done) { opacity:1; }
.implant-animation__legend { list-style:none;display:flex;flex-wrap:wrap;gap:8px 24px;margin:8px 0 0;padding:12px 0 0;border-top:1px solid #e3e8ec; }
.implant-animation__legend li { display:flex;align-items:center;gap:8px;color:#6b7280;font-size:12px;line-height:18px; }
.implant-animation__legend span { flex:none;width:12px;height:12px;border-radius:3px;background:#dcebf0; }
.implant-animation__legend [data-part="1"] span { background:#b9cbd3; }
.implant-animation__legend [data-part="2"] span { border:1px solid #b9cbd3;background:#fff; }
.implant-animation__text { display:grid;align-content:start;gap:15px;min-height:147px; }
.implant-animation__stage { width:max-content;max-width:100%;margin:0;padding:6px 10px;border-radius:999px;background:#e7efff;color:#2563eb;font-size:12px;font-weight:500;line-height:18px; }
.implant-animation h3 { margin:0;color:#13202a;font-size:20px;font-weight:600;line-height:30px;letter-spacing:-.74px; }
.implant-animation__description { margin:0;color:#4b5563;font-size:16px;line-height:26px; }
.implant-animation__progress { flex:none;height:5px;margin-top:4px;background:#dde9ec;border-radius:8px;overflow:hidden; }
.implant-animation__progress span { display:block;height:100%;background:#2563eb;transition:width .4s ease; }
.implant-animation__buttons { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px; }
.implant-animation__buttons button { display:flex;align-items:center;justify-content:center;gap:6px;min-height:50px;padding:8px 6px;border:1px solid #e3e8ec;border-radius:12px;background:#fff;color:#13202a;font-size:14px;font-weight:500;overflow-wrap:anywhere; }
.implant-animation__buttons button:disabled { opacity:.55;cursor:default; }
.implant-animation__buttons .implant-animation__play,.implant-animation__complete { border-color:#2563eb;background:#2563eb;color:#fff; }
.implant-animation__complete { display:flex;flex:1;justify-content:space-between;align-items:center;gap:8px;min-height:50px;border-radius:16px;padding:14px 24px;text-decoration:none;font-size:18px;font-weight:600;line-height:30px; }
.implant-animation :is(button,a):focus-visible { outline:2px solid #2563eb;outline-offset:3px; }
@media (max-width: 900px) {
  .implant-animation { grid-template-columns:1fr;height:auto; }
  .implant-animation__art,.implant-animation__controls { padding:18px; }
  .implant-animation__diagram { min-height:0;height:auto; }
  .implant-animation__text { min-height:0; }
  .implant-animation__buttons { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .implant-animation__complete { font-size:14px;line-height:22px; }
}
@media (prefers-reduced-motion: reduce) {
  .implant-animation__diagram :deep(.part),.implant-animation__diagram :deep(.lbl),.implant-animation__progress span { transition:none; }
}
</style>
