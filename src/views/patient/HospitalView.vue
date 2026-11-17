<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
import { useRoute, useRouter } from 'vue-router'
import { patientLanguages } from '@/i18n/languages'
const { tx, localized } = useSiteCopy()
const route=useRoute(), router=useRouter()

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HospitalFigmaCanvas from '@/components/common/HospitalFigmaCanvas.vue'
import PatientFooter from '@/components/layout/PatientFooter.vue'
import HomeSourceNode, { type HomeSourceAction } from '@/components/common/HomeSourceNode.vue'
import { hospitalActions, hospitalSources, hospitalNode, hospitalCities, hospitalCityNodes, hospitalCards, hospitalRecords, hospitalRecord, descendants, filteredHospitalSource } from '@/data/hospitalFigmaSource'
import { homeMobileNodes } from '@/data/homeMobileNavigation'
import { useAppStore, type Locale } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { hospitalSourceDialog } from '@/components/common/hospitalSourceDialog'

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
const mobileHospitals=computed(()=>hasFiltered.value
  ? hospitalRecords.filter(item=>selectedCity.value==='全部'||item.city===selectedCity.value)
  : [...hospitalCards.mobile].sort((a,b)=>a.node.y-b.node.y||a.node.x-b.node.x).map(card=>hospitalRecord(card.name)).filter((item): item is NonNullable<typeof item> => Boolean(item)))
function mobileImage(name:string,fallback:string){
  const card=hospitalCards.mobile.find(item=>item.name===name)
  return card ? descendants(card.photo).map(node=>node.css.match(/url\(["']?([^)'";]+)["']?\)/)?.[1]).find(Boolean)||fallback : ''
}
const source=computed(()=>filtered.value?.root||hospitalSources[phone.value?'list-mobile':'desktop']!.root)
const cardNodes=computed(()=>filtered.value?.root?descendants(filtered.value.root).filter(node=>node.id.includes('::hospital-')&&node.name===hospitalCards.desktop[0]!.node.name&&node.height===398):hospitalCards[phone.value?'mobile':'desktop'].map(card=>card.node))
const deferredImageRoots=computed(()=>phone.value?[]:cardNodes.value.map(node=>node.id))
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
    if(localized.value)for(const card of hospitalCards.mobile)for(const id of [card.detail,card.consult]) {
      // Both authored actions share one row. Let translated labels wrap in
      // equal columns instead of retaining two fixed Chinese button widths.
      result[id]=(result[id]||'')+'flex:1 1 0;width:0;height:auto;min-height:38px;'
    }
  }
  return result
})
const attributes=computed(()=>{
  const values:Record<string,Record<string,string|number|boolean>>={}
  hospitalCityNodes[phone.value?'mobile':'desktop'].forEach((id,index)=>values[id]={'aria-pressed':selectedCity.value===hospitalCities[index]})
  values[phone.value?'1620:589':'484:1573']={'aria-expanded':phone.value?menuOpen.value:hospitalMenuOpen.value}
  for(const card of cardNodes.value){
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
  nextTick(()=>window.dispatchEvent(new CustomEvent('open-consultation', { detail: { intent: 'appointment' } })))
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
async function changeLanguage(code:Locale){if(await app.setLocale(code)){languageOpen.value=false;await router.replace({query:{...route.query,lang:code}})}}
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
    <template v-if="phone">
      <section class="hospital-phone-hero"><h1>{{tx('中国顶尖国际医疗资源')}}</h1><p>{{tx('51家涉外认证医院')}}</p><p>{{tx('覆盖肿瘤/心血管/神经/骨科/慢性病等全病种')}}</p></section>
      <section class="hospital-phone-directory" :aria-label="tx('中国医院列表')">
        <RouterLink class="hospital-phone-doctors" to="/doctors">{{tx('中国医生')}} →</RouterLink>
        <div class="hospital-phone-cities" role="group" :aria-label="tx('按城市筛选')"><button v-for="city in hospitalCities" :key="city" type="button" :aria-pressed="hasFiltered&&selectedCity===city" @click="selectedCity=city;hasFiltered=true">{{tx(city)}}</button></div>
        <div class="hospital-phone-cards"><article v-for="hospital in mobileHospitals" :key="hospital.id" class="hospital-phone-card">
          <div class="hospital-phone-photo" :style="{backgroundImage:mobileImage(hospital.name,hospital.image)?`url('${mobileImage(hospital.name,hospital.image)}')`:undefined}"><span v-if="hospital.jci">JCI</span><span>{{tx(hospital.type)}}</span><span class="hospital-phone-city">{{tx(hospital.city)}}</span></div>
          <div class="hospital-phone-content"><h2>{{tx(hospital.name)}}</h2><div class="hospital-phone-tags"><span v-for="tag in hospital.specialties.slice(0,3)" :key="tag">{{tx(tag)}}</span></div><p>{{hospital.established}} · {{hospital.beds}} {{tx('床')}} · {{hospital.departments}} {{tx('科室')}}</p><div class="hospital-phone-actions"><button type="button" @click="selectedName=hospital.name">{{tx('查看详情')}}</button><button type="button" @click="openConsultation">{{tx('预约咨询')}}</button></div></div>
        </article></div>
      </section>
      <PatientFooter />
    </template>
    <HospitalFigmaCanvas v-else :node="source" :width="viewport" :phone="phone" :fluid="fluid" :actions="actions" :styles="nodeStyles" :attributes="attributes" :full-bleed="['144:4710','144:5154']" :hidden="[headerId,'1741:5732']" :defer-image-roots="deferredImageRoots" image-preload-margin="200px 0px" :label="tx('中国医院列表')" @activate="activate" />
    <header v-if="!phone" class="hospital-source-header">
      <HospitalFigmaCanvas :node="hospitalNode(headerId)" :width="viewport" :phone="phone" :fluid="fluid" :actions="actions" :styles="nodeStyles" :attributes="attributes" :label="tx('主导航')" @activate="activate" />
      <Transition name="hospital-dropdown"><div v-if="!phone&&hospitalMenuOpen" class="hospital-nav-dropdown">
        <div :style="{width:'1440px',transform:`translateX(-50%) scale(${Math.min(1,viewport/1440)})`}">
          <HomeSourceNode :node="hospitalNode('1741:5732')" :actions="actions" @activate="activate" />
        </div>
      </div></Transition>
      <div v-if="phone&&menuOpen" class="hospital-mobile-menu" :aria-label="tx('移动端导航')" @click="menuOpen=false">
        <HomeSourceNode :node="homeMobileNodes.get('1555:422')!" root :actions="menuActions" />
      </div>
      <div v-if="languageOpen" class="hospital-languages">
        <button v-for="language in patientLanguages" :key="language.code" type="button" @click="changeLanguage(language.code)">{{language.label}}</button>
      </div>
    </header>
    <component :is="hospitalSourceDialog(selectedName)" v-if="selectedName" :hospital-name="selectedName" @close="selectedName=null" @consultation="openConsultation" />
  </div>
</template>

<style scoped>
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
.hospital-phone-doctors{display:inline-block;margin-bottom:16px;color:#2563eb;font-size:15px;font-weight:600;text-decoration:none}
.hospital-phone-hero{box-sizing:border-box;min-height:400px;padding:32px 20px 220px;text-align:center;color:#1e3a5f;background:linear-gradient(180deg,#eff4f9 0%,rgba(239,244,249,.8) 38%,transparent 57%),url('/images/figma/hospital-revision/image-ded16e6e38437219c4b5a6aa20f61c740a19ba87.webp') right 88px / 266.133% 77.847% no-repeat,#dceefe}.hospital-phone-hero h1{margin:0 0 12px;font-size:24px;line-height:1.35}.hospital-phone-hero p{margin:4px 0;font-size:13px;line-height:1.5}.hospital-phone-directory{padding:32px 16px 48px}.hospital-phone-cities{display:flex;gap:10px;overflow-x:auto;padding-bottom:12px}.hospital-phone-cities button{flex:none;border:1px solid #dbdee6;border-radius:24px;padding:8px 16px;background:#fff;color:#1e3a5f;white-space:nowrap}.hospital-phone-cities button[aria-pressed=true]{background:#dd6b20;color:#fff;border-color:#dd6b20}.hospital-phone-cards{display:grid;gap:16px;margin-top:12px}.hospital-phone-card{overflow:hidden;border-radius:20px;background:#f5f6f8}.hospital-phone-photo{position:relative;min-height:170px;background-position:center;background-size:cover;padding:12px;display:flex;align-items:flex-start;gap:8px}.hospital-phone-photo span{padding:4px 8px;border-radius:6px;color:#1e3a5f;background:#ffffffe6;font-size:12px}.hospital-phone-photo .hospital-phone-city{position:absolute;bottom:12px;left:12px;color:white;background:#4678dd}.hospital-phone-content{padding:16px}.hospital-phone-content h2{margin:0 0 12px;font-size:18px;line-height:1.4;color:#1e3a5f}.hospital-phone-tags{display:flex;flex-wrap:wrap;gap:7px}.hospital-phone-tags span{padding:4px 8px;border-radius:6px;background:#e8eefb;color:#5671ae;font-size:12px}.hospital-phone-content p{color:#64748b;font-size:13px}.hospital-phone-actions{display:flex;gap:8px}.hospital-phone-actions button{flex:1;min-width:0;min-height:42px;border:1px solid #1e3a5f;border-radius:8px;background:transparent;color:#1e3a5f;padding:7px;overflow-wrap:anywhere}.hospital-phone-actions button+button{background:#dd762d;color:#fff;border-color:#dd762d}
</style>
