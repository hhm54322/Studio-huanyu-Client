<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HospitalFigmaCanvas from '@/components/common/HospitalFigmaCanvas.vue'
import HomeSourceNode from '@/components/common/HomeSourceNode.vue'
import { physicianActions, physicianNode, physicianCards, physicianFilters, physicianDescendants, filteredPhysicianSource } from '@/data/physicianFigmaSource'
import { useAppStore, type Locale } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const HomeExpertDialog=defineAsyncComponent(()=>import('@/components/common/HomeExpertDialog.vue'))
const DentalDoctorSourceDialog=defineAsyncComponent(()=>import('@/components/common/DentalDoctorSourceDialog.vue'))
const width=ref(window.innerWidth),filter=ref(0),selected=ref<number|null>(null)
const hospitalMenu=ref(false),languageMenu=ref(false)
const page=ref<HTMLElement|null>(null)
const source=computed(()=>filteredPhysicianSource(filter.value))
const {locale}=useI18n(),app=useAppStore()
const scale=computed(()=>Math.min(1,width.value/1440))
const styles=computed(()=>{
  const result:Record<string,string>={}
  if(filter.value===0)return result
  physicianFilters.forEach((item,index)=>{
    const active=filter.value===index
    result[item.id]=active?'background:#DD6B20;border-color:transparent;':'background:transparent;border:1px solid #DBDEE6;'
    physicianDescendants(physicianNode(item.id)).filter(n=>n.type==='TEXT').forEach(n=>{result[n.id]=`color:${active?'#fff':'#1E3A5F'};font-weight:${active?500:400};`})
  })
  return result
})
const attributes=computed(()=>{
  const result:Record<string,Record<string,string|number|boolean>>={'1689:4839':{role:'tablist','aria-label':'医生科室'},'1689:5416':{'aria-expanded':hospitalMenu.value,'aria-controls':'physician-hospital-menu','aria-haspopup':'true'}}
  physicianFilters.forEach((item,index)=>{result[item.id]={role:'tab','aria-selected':filter.value===index,'aria-controls':'physician-results',tabindex:filter.value===index?0:-1}})
  result['1741:5784']={id:'physician-results',role:'tabpanel','aria-label':`${physicianFilters[filter.value]!.text}医生`}
  physicianCards.forEach(card=>{result[card.id]={'data-physician-card':true}})
  return result
})
let menuTimer:ReturnType<typeof setTimeout>|undefined,observer:IntersectionObserver|undefined
const animations=new Set<Animation>(),seen=new WeakSet<Element>()
function resize(){width.value=innerWidth;hospitalMenu.value=false;languageMenu.value=false}
async function bindMotion(){
  await nextTick();observer?.disconnect()
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return
  observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting||seen.has(entry.target))continue;seen.add(entry.target);observer?.unobserve(entry.target);const animation=entry.target.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,easing:'cubic-bezier(.22,1,.36,1)'});animations.add(animation);animation.finished.catch(()=>{}).finally(()=>animations.delete(animation))}},{threshold:.04})
  page.value?.querySelectorAll('[data-physician-card]').forEach(card=>observer?.observe(card))
}
function activate(action:string){
  if(action==='consultation')window.dispatchEvent(new CustomEvent('open-consultation'))
  else if(action==='language')languageMenu.value=!languageMenu.value
  else if(action==='hospital-menu'){clearTimeout(menuTimer);hospitalMenu.value=true}
  else if(action.startsWith('doctor:'))selected.value=Number(action.slice(7))
  else if(action.startsWith('filter:')){filter.value=Number(action.slice(7));void bindMotion()}
}
function enter(event:MouseEvent|FocusEvent){if((event.target as HTMLElement).closest('[data-figma-node="1689:5416"],#physician-hospital-menu')){clearTimeout(menuTimer);hospitalMenu.value=true}}
function leave(event:MouseEvent|FocusEvent){
  if((event.relatedTarget as HTMLElement|null)?.closest('[data-figma-node="1689:5416"],#physician-hospital-menu'))return
  if((event.target as HTMLElement).closest('[data-figma-node="1689:5416"],#physician-hospital-menu'))menuTimer=setTimeout(()=>hospitalMenu.value=false,140)
}
async function keydown(event:KeyboardEvent){
  const el=event.target as HTMLElement
  if(event.key==='Escape'){
    if(hospitalMenu.value){hospitalMenu.value=false;page.value?.querySelector<HTMLElement>('[data-figma-node="1689:5416"]')?.focus({preventScroll:true});hospitalMenu.value=false}
    languageMenu.value=false
  }
  if(el.closest('[data-figma-node="1689:5416"]')&&event.key==='ArrowDown'){event.preventDefault();hospitalMenu.value=true;await nextTick();page.value?.querySelector<HTMLElement>('#physician-hospital-menu a')?.focus({preventScroll:true})}
  if(el.getAttribute('role')!=='tab')return
  const index=filter.value
  const next=event.key==='ArrowRight'?(index+1)%6:event.key==='ArrowLeft'?(index+5)%6:event.key==='Home'?0:event.key==='End'?5:null
  if(next!==null){event.preventDefault();filter.value=next;await nextTick();page.value?.querySelector<HTMLElement>(`[data-figma-node="${physicianFilters[next]!.id}"]`)?.focus({preventScroll:true});void bindMotion()}
}
function changeLanguage(code:Locale){locale.value=code;app.setLocale(code);languageMenu.value=false}
function outside(event:MouseEvent){if(!(event.target as HTMLElement).closest('.physician-languages,[data-figma-node="1689:5425"]'))languageMenu.value=false}
onMounted(()=>{window.addEventListener('resize',resize,{passive:true});document.addEventListener('click',outside);void bindMotion()})
onBeforeUnmount(()=>{window.removeEventListener('resize',resize);document.removeEventListener('click',outside);clearTimeout(menuTimer);observer?.disconnect();animations.forEach(animation=>animation.cancel())})
</script>

<template>
  <div ref="page" class="physician-page" @mouseover="enter" @mouseout="leave" @focusin="enter" @focusout="leave" @keydown="keydown">
    <HospitalFigmaCanvas :node="source" :width="width" :actions="physicianActions" :styles="styles" :attributes="attributes" :hidden="['1689:5392','1732:5716']" label="中国医生" @activate="activate" />
    <header class="physician-source-header">
      <HospitalFigmaCanvas :node="physicianNode('1689:5392')" :width="width" :actions="physicianActions" :attributes="attributes" label="主导航" @activate="activate" />
      <Transition name="physician-dropdown"><div v-if="hospitalMenu" id="physician-hospital-menu" class="physician-menu">
        <div :style="{width:'1440px',transform:`translateX(-50%) scale(${scale})`}"><HomeSourceNode :node="physicianNode('1732:5716')" :actions="physicianActions" @activate="activate" /></div>
      </div></Transition>
      <div v-if="languageMenu" class="physician-languages"><button v-for="language in [{code:'zh',name:'中文'},{code:'en',name:'English'},{code:'id',name:'Bahasa Indonesia'},{code:'ru',name:'Русский'},{code:'mn',name:'Монгол'}]" :key="language.code" type="button" @click="changeLanguage(language.code as Locale)">{{ language.name }}</button></div>
    </header>
    <HomeExpertDialog v-if="selected!==null && selected>=0" :expert="selected" @close="selected=null" />
    <DentalDoctorSourceDialog v-if="selected===-1" :doctor="{id:1,name:'谭兆林'}" @close="selected=null" />
  </div>
</template>

<style scoped>
@import url('/fonts/home-source-fonts.css');
.physician-page { position:relative; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.physician-source-header { position:fixed; inset:0 0 auto; height:64px; z-index:60; pointer-events:none; }
.physician-source-header :deep(a),.physician-source-header :deep(button),.physician-menu,.physician-languages { pointer-events:auto; }
.physician-menu { position:absolute; inset:0 0 auto; }
.physician-menu>div { position:absolute; top:0; left:50%; height:0; transform-origin:top center; }
.physician-languages { position:absolute; top:56px; right:max(16px,calc((100vw - 1216px)/2)); display:grid; padding:8px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 12px 30px #0002; }
.physician-languages button { padding:9px 16px; border:0; text-align:left; background:transparent; color:#143162; cursor:pointer; }
.physician-dropdown-enter-active,.physician-dropdown-leave-active { transition:opacity .2s ease; }
.physician-dropdown-enter-from,.physician-dropdown-leave-to { opacity:0; }
@media (hover:hover) and (prefers-reduced-motion:no-preference) {
  .physician-page :deep([data-physician-card]) { transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s ease; }
  .physician-page :deep([data-physician-card]:hover),.physician-page :deep([data-physician-card]:focus-within) { transform:translateY(-4px)!important; box-shadow:0 12px 28px #14316214!important; }
}
@media (prefers-reduced-motion:reduce) { .physician-dropdown-enter-active,.physician-dropdown-leave-active { transition:none; } }
</style>
