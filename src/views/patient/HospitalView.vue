<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HospitalFigmaCanvas from '@/components/common/HospitalFigmaCanvas.vue'
import HomeSourceNode, { type HomeSourceAction } from '@/components/common/HomeSourceNode.vue'
import HospitalSourceDialog from '@/components/common/HospitalSourceDialog.vue'
import { hospitalActions, hospitalSources, hospitalNode, hospitalCities, hospitalCityNodes, hospitalCards, descendants, filteredHospitalSource } from '@/data/hospitalFigmaSource'
import { homeMobileNodes } from '@/data/homeFigmaSource'
import { useAppStore, type Locale } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const viewport=ref(typeof window==='undefined'?1440:window.innerWidth)
const phone=computed(()=>viewport.value<=700)
const fluid=computed(()=>phone.value&&viewport.value!==375)
const selectedCity=ref('北京')
const hasFiltered=ref(false)
const selectedName=ref<string|null>(null)
const menuOpen=ref(false)
const languageOpen=ref(false)
const hospitalMenuOpen=ref(false)
const {locale}=useI18n()
const app=useAppStore()
const filtered=computed(()=>hasFiltered.value&&!phone.value?filteredHospitalSource(selectedCity.value):undefined)
const source=computed(()=>filtered.value?.root||hospitalSources[phone.value?'list-mobile':'desktop']!.root)
const headerId=computed(()=>phone.value?'1620:583':'484:1549')
const actions=computed<Record<string,HomeSourceAction>>(()=>({...hospitalActions,...filtered.value?.actions}))
const nodeStyles=computed(()=>{
  const result:Record<string,string>={}
  const ids=hospitalCityNodes[phone.value?'mobile':'desktop']
  ids.forEach((id,index)=>{
    if(!hasFiltered.value)return
    const active=hospitalCities[index]===selectedCity.value
    result[id]=active?'background:#DD6B20;border:0;color:#fff;':'background:transparent;border:1px solid #DBDEE6;'
    descendants(hospitalNode(id)).filter(node=>node.type==='TEXT').forEach(node=>{result[node.id]=active?'color:#fff;font-weight:500;':'color:#1E3A5F;font-weight:400;'})
  })
  if(fluid.value) {
    for(const node of descendants(source.value)) {
      let css=''
      if(node.id===source.value.id||['1620:593','1620:595','1620:600','1620:601','1620:617','1620:1077','1620:1087','1620:1096'].includes(node.id))css+='width:100%;'
      if(node.type==='TEXT')css+='max-width:100%;'
      if(hospitalCards.mobile.some(card=>card.node.id===node.id))css+='width:100%;'
      if(node.id==='1620:583')css+='height:52px;'
      if(node.id==='1620:589')css+='left:auto;right:16px;'
      result[node.id]=(result[node.id]||'')+css
    }
  }
  return result
})
const attributes=computed(()=>{
  const values:Record<string,Record<string,string|number|boolean>>={}
  hospitalCityNodes[phone.value?'mobile':'desktop'].forEach((id,index)=>values[id]={'aria-pressed':selectedCity.value===hospitalCities[index]})
  values[phone.value?'1620:589':'484:1573']={'aria-expanded':phone.value?menuOpen.value:hospitalMenuOpen.value}
  const cards=filtered.value?.root?descendants(filtered.value.root).filter(node=>node.id.includes('::hospital-')&&node.name===hospitalCards.desktop[0]!.node.name&&node.height===398):hospitalCards[phone.value?'mobile':'desktop'].map(card=>card.node)
  for(const card of cards){
    values[card.id]={'data-hospital-card':true}
    const title=card.children[1]?.children[0]?.children.find(node=>node.type==='TEXT')
    if(title)values[title.id]={title:title.text}
  }
  return values
})
const menuActions={
  '1555:424':{href:'/'},'1555:428':{href:'/why-china'},'1555:431':{href:'/trust'},
  '1555:434':{href:'/diseases-technologies'},'1555:439':{href:'/dental'},'1555:442':{href:'/hospitals'},
  '1555:445':{href:'/cases'},'1555:448':{href:'/insurance'},'1555:451':{href:'/about'},
}
let menuTimer:number|undefined
let motionObserver:IntersectionObserver|undefined
const revealAnimations=new Set<Animation>()
const seenCards=new WeakSet<Element>()
const page=ref<HTMLElement|null>(null)
async function bindCardMotion(){
  await nextTick();motionObserver?.disconnect()
  if(phone.value||matchMedia('(prefers-reduced-motion: reduce)').matches||typeof IntersectionObserver==='undefined')return
  motionObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting||seenCards.has(entry.target))continue
      seenCards.add(entry.target);motionObserver?.unobserve(entry.target)
      const animation=entry.target.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,easing:'cubic-bezier(.22,1,.36,1)'})
      revealAnimations.add(animation);animation.finished.catch(()=>{}).finally(()=>revealAnimations.delete(animation))
    }
  },{threshold:.04})
  page.value?.querySelectorAll('[data-hospital-card]').forEach(card=>motionObserver?.observe(card))
}
function resize(){viewport.value=window.innerWidth;menuOpen.value=false;hospitalMenuOpen.value=false}
function openConsultation(){
  selectedName.value=null;menuOpen.value=false
  nextTick(()=>window.dispatchEvent(new CustomEvent('open-consultation')))
}
function activate(action:string){
  if(action==='consultation')openConsultation()
  else if(action.startsWith('hospital:'))selectedName.value=action.slice('hospital:'.length)
  else if(action.startsWith('city:')){selectedCity.value=action.slice(5);hasFiltered.value=true}
  else if(action==='menu')menuOpen.value=!menuOpen.value
  else if(action==='language')languageOpen.value=!languageOpen.value
}
function hover(event:MouseEvent|FocusEvent){
  const node=(event.target as HTMLElement).closest('[data-figma-node]')
  if(node?.closest('[data-figma-node="484:1573"],[data-figma-node="1741:5732"],.hospital-nav-dropdown')) {
    if(menuTimer)clearTimeout(menuTimer)
    hospitalMenuOpen.value=true
  }
}
function leaveMenu(event:MouseEvent|FocusEvent){
  const next=event.relatedTarget instanceof Element?event.relatedTarget:null
  if(next?.closest('[data-figma-node="484:1573"],[data-figma-node="1741:5732"],.hospital-nav-dropdown'))return
  if((event.target as HTMLElement).closest('[data-figma-node="484:1573"],[data-figma-node="1741:5732"],.hospital-nav-dropdown'))
    menuTimer=window.setTimeout(()=>hospitalMenuOpen.value=false,140)
}
function keydown(event:KeyboardEvent){
  if(event.key!=='Escape')return
  if(menuOpen.value){menuOpen.value=false;page.value?.querySelector<HTMLElement>('[data-figma-node="1620:589"]')?.focus({preventScroll:true})}
  hospitalMenuOpen.value=false;languageOpen.value=false
}
function changeLanguage(code:Locale){locale.value=code;app.setLocale(code);languageOpen.value=false}
function outside(event:MouseEvent){
  if(!(event.target as HTMLElement).closest('.hospital-languages,[data-figma-node="484:1582"]'))languageOpen.value=false
}
watch(source,bindCardMotion,{flush:'post'})
onMounted(()=>{
  window.addEventListener('resize',resize,{passive:true});document.addEventListener('keydown',keydown);document.addEventListener('click',outside)
  void bindCardMotion()
})
onBeforeUnmount(()=>{window.removeEventListener('resize',resize);document.removeEventListener('keydown',keydown);document.removeEventListener('click',outside);if(menuTimer)clearTimeout(menuTimer);motionObserver?.disconnect();revealAnimations.forEach(animation=>animation.cancel())})
</script>

<template>
  <div ref="page" class="hospital-page" :class="{'is-phone':phone,'is-fluid':fluid}" @mouseover="hover" @mouseout="leaveMenu" @focusin="hover" @focusout="leaveMenu">
    <HospitalFigmaCanvas :node="source" :width="viewport" :phone="phone" :fluid="fluid" :actions="actions" :styles="nodeStyles" :attributes="attributes" :hidden="[headerId,'1741:5732']" label="中国医院列表" @activate="activate" />
    <header class="hospital-source-header">
      <HospitalFigmaCanvas :node="hospitalNode(headerId)" :width="viewport" :phone="phone" :fluid="fluid" :actions="actions" :styles="nodeStyles" :attributes="attributes" label="主导航" @activate="activate" />
      <Transition name="hospital-dropdown"><div v-if="!phone&&hospitalMenuOpen" class="hospital-nav-dropdown">
        <div :style="{width:'1440px',transform:`translateX(-50%) scale(${Math.min(1,viewport/1440)})`}">
          <HomeSourceNode :node="hospitalNode('1741:5732')" :actions="actions" @activate="activate" />
        </div>
      </div></Transition>
      <div v-if="phone&&menuOpen" class="hospital-mobile-menu" aria-label="移动端导航" @click="menuOpen=false">
        <HomeSourceNode :node="homeMobileNodes.get('1555:422')!" root :actions="menuActions" />
      </div>
      <div v-if="languageOpen" class="hospital-languages">
        <button v-for="language in [{code:'zh',name:'中文'},{code:'en',name:'English'},{code:'id',name:'Bahasa Indonesia'},{code:'ru',name:'Русский'},{code:'mn',name:'Монгол'}]" :key="language.code" type="button" @click="changeLanguage(language.code as Locale)">{{language.name}}</button>
      </div>
    </header>
    <HospitalSourceDialog v-if="selectedName" :hospital-name="selectedName" @close="selectedName=null" @consultation="openConsultation" />
  </div>
</template>

<style scoped>
@import url('/fonts/home-source-fonts.css');
.hospital-page { position:relative; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.hospital-source-header { position:fixed; left:0; right:0; top:0; z-index:60; height:64px; pointer-events:none; }
.hospital-source-header :deep(a),.hospital-source-header :deep(button),.hospital-nav-dropdown,.hospital-mobile-menu,.hospital-languages { pointer-events:auto; }
.hospital-nav-dropdown { position:absolute; inset:0 0 auto; }
.hospital-nav-dropdown>div { position:absolute; top:0; left:50%; height:0; transform-origin:top center; }
.hospital-mobile-menu { position:absolute; top:52px; left:0; width:100%; height:calc(100dvh - 52px); overflow:auto; background:#fff; }
.hospital-mobile-menu :deep(.home-source-node--root) { width:100%!important; }
.hospital-languages { position:absolute; top:56px; right:max(16px,calc((100vw - 1216px)/2)); display:grid; padding:8px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 12px 30px #0002; }
.hospital-languages button { padding:9px 16px; text-align:left; border:0; background:transparent; color:#143162; cursor:pointer; }
@media (hover:hover) and (min-width:701px) and (prefers-reduced-motion:no-preference) {
  .hospital-page :deep([data-hospital-card]) { transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s ease; }
  .hospital-page :deep([data-hospital-card]:hover),.hospital-page :deep([data-hospital-card]:focus-within) { transform:translateY(-4px)!important;box-shadow:0 12px 28px #14316214!important; }
}
.hospital-dropdown-enter-active,.hospital-dropdown-leave-active { transition:opacity .2s ease; }
.hospital-dropdown-enter-from,.hospital-dropdown-leave-to { opacity:0; }
@media (prefers-reduced-motion:reduce) { .hospital-dropdown-enter-active,.hospital-dropdown-leave-active { transition:none; } }
.is-phone .hospital-source-header { height:52px; background:#fff; }
</style>
