<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeFigmaSection from './HomeFigmaSection.vue'
import HomeSourceNode from './HomeSourceNode.vue'
import { homeDesktopNodes } from '@/data/homeFigmaSource'
import { homeFigmaActions } from '@/data/homeFigmaActions'
import { useAutoplayCarousel } from '@/composables/useAutoplayCarousel'

const emit=defineEmits<{ activate:[action:string,event:MouseEvent] }>()
const root=ref<HTMLElement|null>(null)
const {activeIndex:active,select:selectSlide}=useAutoplayCarousel(root,4,{initialIndex:3})
const width=ref(typeof window==='undefined'?1440:window.innerWidth)
const mobileOrder=[3,0,1,2]
const states=[
  {frame:'143:1190',content:'143:1196',image:'143:1194',previous:'143:1211',next:'143:1214',dots:['143:1218','143:1219','143:1220','143:1221']},
  {frame:'143:1222',content:'143:1228',image:'143:1226',previous:'143:1240',next:'143:1243',dots:['143:1247','143:1248','143:1249','143:1250']},
  {frame:'143:1251',content:'143:1256',image:'143:1255',previous:'143:1288',next:'143:1291',dots:['143:1295','143:1296','143:1297','143:1298']},
  {frame:'1523:33',content:'1523:47',image:'1523:37',previous:'1523:64',next:'1523:67',dots:['1523:71','1523:72','1523:73','1523:74']},
]
const selected=computed(()=>states[active.value]!)
const actions={...homeFigmaActions,'143:1206':{href:'/report'},...Object.fromEntries(states.flatMap(state=>[
  [state.previous,{action:'hero:previous',label:'上一张'}],
  [state.next,{action:'hero:next',label:'下一张'}],
  ...state.dots.map((id,index)=>[id,{action:`hero:${index}`,label:`第${index+1}张`}]),
])),...Object.fromEntries(['1528:130','1528:131','1528:132','1528:133'].map((id,index)=>[id,{action:`hero:${mobileOrder[index]}`,label:`第${index+1}张`}]))}
const mobileStyles=computed(()=>{
  const node=homeDesktopNodes.get(selected.value.content)!
  const all:Record<string,string>={}
  function walk(item:typeof node) {
    all[item.id]='max-width:100%;'
    if(item.type==='TEXT') all[item.id]+='width:auto;height:auto;white-space:pre-wrap;overflow-wrap:anywhere;'
    else if(!item.svg) all[item.id]+='width:100%;height:auto;'
    item.children.forEach(walk)
  }
  walk(node)
  return all
})
const attributes=computed(()=>Object.fromEntries([...selected.value.dots.map((id,index)=>[id,{'aria-pressed':index===active.value}]),...['1528:130','1528:131','1528:132','1528:133'].map((id,index)=>[id,{'aria-pressed':mobileOrder[index]===active.value}])] ))
const styles=computed(()=>({
  ...Object.fromEntries(['1528:130','1528:131','1528:132','1528:133'].map((id,index)=>[id,`background:${active.value===mobileOrder[index]?'#DD6B20':'rgba(0,0,0,.10)'};`])),
  // These selected SVGs already include the source parent's reflection.
  // Invert that reflection only on the asset, not on its button geometry.
  ...Object.fromEntries(['143:1215','143:1244','143:1292','1412:5711','1523:68'].map(id=>[id,'transform:scaleX(-1);transform-origin:center;'])),
}))
function select(index:number){selectSlide(index)}
function activate(action:string,event:MouseEvent) {
  const [name,value]=action.split(':')
  if(name==='hero') select(value==='previous'?active.value-1:value==='next'?active.value+1:Number(value))
  else emit('activate',action,event)
}
function resize(){width.value=window.innerWidth}
onMounted(()=>{
  window.addEventListener('resize',resize,{passive:true})
})
onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
})
</script>

<template>
  <div ref="root" class="home-source-hero" tabindex="0" :data-figma-node="width>700 && active===3 ? '1523:31' : undefined" :data-hero-state="active+1" aria-roledescription="轮播" aria-label="寰宇云医介绍" @keydown.left.prevent="select(active-1)" @keydown.right.prevent="select(active+1)">
    <Transition name="home-hero-fade">
    <HomeFigmaSection v-if="width>700 || active===3" :key="selected.frame" :data-figma-node="width>700 && active===3 ? '1523:32' : undefined" :desktop-id="selected.frame" mobile-id="1528:127" label="寰宇云医介绍" :actions="actions" :attributes="attributes" :styles="styles" @activate="activate" />
    <section v-else :key="`mobile-${active}`" class="home-source-hero__mobile" :data-figma-desktop-state="selected.frame">
      <div class="home-source-hero__mobile-image" :style="{backgroundImage:homeDesktopNodes.get(selected.image)!.css.match(/background:\s*(url\([^;]*?\))/)?.[1]}" />
      <div class="home-source-hero__mobile-copy" :class="{'is-assurance':active===2}"><HomeSourceNode :node="homeDesktopNodes.get(selected.content)!" root fluid :styles="mobileStyles" :actions="actions" @activate="activate" /></div>
      <div class="home-source-hero__mobile-dots"><button v-for="(state,index) in mobileOrder" :key="state" type="button" :aria-label="`第${index+1}张`" :aria-pressed="state===active" @click="select(state)" /></div>
    </section>
    </Transition>
    <Teleport to="body"><div v-if="width>700" class="home-source-hero__assistant"><HomeSourceNode :node="homeDesktopNodes.get('1523:119')!" root :actions="actions" @activate="activate" /></div></Teleport>
  </div>
</template>

<style scoped>
.home-source-hero { position:relative; }
.home-source-hero__assistant { position:fixed; right:24px; bottom:24px; z-index:55; width:158px; height:44px; pointer-events:none; }
.home-source-hero__assistant :deep(button) { pointer-events:auto; }
.home-hero-fade-enter-active,.home-hero-fade-leave-active { transition:opacity .55s cubic-bezier(.22,1,.36,1); }
.home-hero-fade-leave-active { position:absolute; inset:0; pointer-events:none; }
.home-hero-fade-enter-from,.home-hero-fade-leave-to { opacity:0; }
@media(prefers-reduced-motion:reduce) { .home-hero-fade-enter-active,.home-hero-fade-leave-active { transition:none; } }
.home-source-hero__mobile { position:relative; min-height:400px; display:flex; padding:32px 24px 48px; overflow:hidden; background:#eff4f9; }
.home-source-hero__mobile-image { position:absolute; inset:0; background-position:center; background-size:cover; opacity:.25; }
.home-source-hero__mobile-copy { position:relative; width:100%; align-self:center; }
.home-source-hero__mobile-copy :deep(.home-source-node--root) { padding:0!important; gap:24px!important; }
.home-source-hero__mobile-copy :deep(.home-source-node--text) { font-size:12px!important; line-height:18px!important; }
.home-source-hero__mobile-copy :deep([data-figma-name="Heading 1"] > .home-source-node--text) { font-size:22px!important; line-height:34px!important; }
.home-source-hero__mobile-copy :deep([data-figma-name="Heading 1"]) { gap:12px!important; }
.home-source-hero__mobile-copy.is-assurance :deep([data-figma-name="Heading 1"]) { gap:20px!important; }
.home-source-hero__mobile-copy.is-assurance :deep([data-figma-name="Heading 3"] .home-source-node--text) { font-size:14px!important; line-height:20px!important; }
.home-source-hero__mobile-dots { position:absolute; bottom:12px; left:50%; display:flex; gap:8px; transform:translateX(-50%); }
.home-source-hero__mobile-dots button { width:16px; height:4px; padding:0; border:0; border-radius:9999px; background:rgba(0,0,0,.1); }
.home-source-hero__mobile-dots button[aria-pressed="true"] { background:#dd6b20; }
</style>
