<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeFigmaSection from './HomeFigmaSection.vue'
import HomeSourceNode from './HomeSourceNode.vue'
import { homeDesktopNodes, homeSourceText } from '@/data/homeFigmaSource'

// All three desktop states were copied independently from Figma Dev Mode.
// The authored mobile frame supplies the typography, spacing and dot controls.
const states = [
  { frame:'1442:343', mosaic:'1442:345', copy:'1442:373', title:'1442:375', description:'1442:378' },
  { frame:'1451:534', mosaic:'1451:536', copy:'1451:564', title:'1451:566', description:'1451:569' },
  { frame:'1442:289', mosaic:'1442:302', copy:'1442:296', title:'1442:298', description:'1442:301' },
]
const active = ref(0)
const root = ref<HTMLElement | null>(null)
const width = ref(typeof window==='undefined'?375:window.innerWidth)
const viewportHeight = ref(typeof window==='undefined'?900:window.innerHeight)
const reducedMotion = ref(true)
let motion:MediaQueryList | undefined
let frame=0
let touchStart:{x:number;y:number} | undefined
const scale = computed(()=>Math.min(1,width.value/1440))
const original = homeDesktopNodes.get(states[0]!.frame)!
const mosaic = homeDesktopNodes.get(states[0]!.mosaic)!
const copy = homeDesktopNodes.get(states[0]!.copy)!
const heading = copy.children[0]!
const copyHeight = copy.height-heading.y
const pinned = computed(()=>!reducedMotion.value&&width.value>1024&&viewportHeight.value>=original.height*scale.value+64)
const segment = computed(()=>Math.max(480*scale.value,viewportHeight.value*.6))
const sectionStyle = computed(()=>pinned.value?{height:`${original.height*scale.value+segment.value*(states.length-1)}px`}:undefined)
function update() {
  frame=0
  if(!pinned.value||!root.value) return
  const step=Math.min(states.length-1,Math.max(0,(64-root.value.getBoundingClientRect().top)/segment.value))
  active.value=Math.round(step)
}
function schedule() {if(!frame) frame=requestAnimationFrame(update)}
function resize() {width.value=window.innerWidth;viewportHeight.value=window.innerHeight;schedule()}
function motionChange() {reducedMotion.value=motion?.matches??true;schedule()}
onMounted(()=>{
  motion=window.matchMedia('(prefers-reduced-motion: reduce)')
  motionChange()
  window.addEventListener('resize',resize,{passive:true})
  window.addEventListener('scroll',schedule,{passive:true})
  motion.addEventListener('change',motionChange)
})
onBeforeUnmount(()=>{
  cancelAnimationFrame(frame)
  window.removeEventListener('resize',resize)
  window.removeEventListener('scroll',schedule)
  motion?.removeEventListener('change',motionChange)
})
const selected = computed(() => states[active.value]!)
const dots = ['1528:759','1528:760','1528:761']
const actions = Object.fromEntries(dots.map((id,index) => [id,{action:String(index),label:`我们的实力，第${index+1}项`}]))
const attributes = computed(() => Object.fromEntries(dots.map((id,index) => [id,{'aria-pressed':active.value===index}])))
const styles = computed(() => ({
  ...Object.fromEntries(dots.map((id,index) => [id,`background:${active.value===index?'#DD6B20':'rgba(0,0,0,.10)'};` ])),
  '1528:732':active.value?'visibility:hidden;':'',
  '1528:755':active.value?'width:100%;':'',
  '1528:756':active.value?'width:max-content;max-width:100%;height:auto;white-space:pre-wrap;':'',
  '1528:757':active.value?'width:max-content;max-width:100%;height:auto;white-space:pre-wrap;':'',
}))
const texts = computed(() => ({'1528:756':homeSourceText(selected.value.title),'1528:757':homeSourceText(selected.value.description)}))
function select(index:number) {
  active.value=(index+states.length)%states.length
  if(pinned.value&&root.value) window.scrollTo({top:root.value.getBoundingClientRect().top+window.scrollY-64+segment.value*active.value,behavior:'smooth'})
}
function handleKey(event:KeyboardEvent) {
  if (!['ArrowLeft','ArrowRight'].includes(event.key)) return
  event.preventDefault()
  select(active.value+(event.key==='ArrowRight'?1:-1))
}
function startTouch(event:TouchEvent) {const t=event.touches[0];if(t)touchStart={x:t.clientX,y:t.clientY}}
function endTouch(event:TouchEvent) {
  const t=event.changedTouches[0],start=touchStart
  touchStart=undefined
  if(!t||!start) return
  const dx=t.clientX-start.x,dy=t.clientY-start.y
  if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3) select(active.value+(dx<0?1:-1))
}
</script>

<template>
  <div ref="root" class="home-strength-source" :class="{'is-pinned':pinned}" :style="sectionStyle" tabindex="0" aria-label="我们的实力，使用左右方向键切换" :data-strength-state="active+1" @keydown="handleKey" @touchstart.passive="startTouch" @touchend.passive="endTouch">
    <HomeFigmaSection class="home-strength-source__stage" desktop-id="1442:343" mobile-id="1528:727" label="我们的实力" :actions="actions" :attributes="attributes" :styles="styles" :texts="texts" :hidden="['1442:345','1442:373']" @activate="action=>select(Number(action))">
      <template #after="{ node }">
        <template v-if="node.id==='1442:344'">
          <div class="home-strength-source__mosaics" :style="{left:`${mosaic.x}px`,top:`${mosaic.y}px`,width:`${mosaic.width}px`,height:`${mosaic.height}px`}">
            <div v-for="(state,index) in states" :key="state.frame" class="home-strength-source__mosaic" :class="{'is-active':active===index}" :aria-hidden="active!==index"><HomeSourceNode :node="homeDesktopNodes.get(state.mosaic)!" root /></div>
          </div>
          <div class="home-strength-source__copy-window" :style="{left:`${copy.x}px`,top:`${copy.y+heading.y}px`,width:`${copy.width}px`,height:`${copyHeight}px`}">
            <div class="home-strength-source__copy-track" :style="{transform:`translate3d(0,${-active*copyHeight}px,0)`}">
              <div v-for="(state,index) in states" :key="state.copy" class="home-strength-source__copy-item" :style="{height:`${copyHeight}px`}" :aria-hidden="active!==index">
                <div :style="{position:'absolute',top:`${-heading.y}px`,width:`${copy.width}px`}"><HomeSourceNode :node="homeDesktopNodes.get(state.copy)!" root /></div>
              </div>
            </div>
          </div>
        </template>
        <div v-if="active && node.id==='1528:731'" class="home-strength-source__mobile-mosaic">
          <div :style="{width:'1216px',height:'387px',transform:`scale(${(width-32)/1216})`,transformOrigin:'top left'}"><HomeSourceNode :node="homeDesktopNodes.get(selected.mosaic)!" root /></div>
        </div>
      </template>
    </HomeFigmaSection>
    <div class="home-strength-source__keyboard-controls"><button type="button" @click="select(active-1)">上一项实力介绍</button><button type="button" @click="select(active+1)">下一项实力介绍</button></div>
  </div>
</template>

<style scoped>
.home-strength-source { position:relative; outline-offset:-4px; }
.home-strength-source.is-pinned>.home-strength-source__stage { position:sticky; top:64px; }
.home-strength-source__mosaics,.home-strength-source__copy-window { position:absolute; overflow:hidden; }
.home-strength-source__mosaic { position:absolute; inset:0; opacity:0; transition:opacity .55s cubic-bezier(.22,1,.36,1); pointer-events:none; }
.home-strength-source__mosaic.is-active { opacity:1; }
.home-strength-source__copy-track { transition:transform .55s cubic-bezier(.22,1,.36,1); }
.home-strength-source__copy-item { position:relative; overflow:hidden; }
.home-strength-source__mobile-mosaic { position:absolute; top:0; left:0; width:100%; aspect-ratio:1216/387; overflow:hidden; }
.home-strength-source__mobile-mosaic :deep(.home-source-node--root) { width:1216px!important; }
.home-strength-source__keyboard-controls { position:absolute; bottom:12px; left:50%; display:flex; gap:12px; transform:translateX(-50%); }
.home-strength-source__keyboard-controls button:not(:focus-visible) { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
.home-strength-source__keyboard-controls button:focus-visible { padding:8px 12px; border-radius:6px; background:#1e3a5f; color:#fff; white-space:nowrap; }
@media (prefers-reduced-motion:reduce) { .home-strength-source__mosaic,.home-strength-source__copy-track { transition:none; } }
</style>
