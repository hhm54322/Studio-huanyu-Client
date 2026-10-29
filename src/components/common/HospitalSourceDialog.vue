<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeSourceNode, { type HomeSourceAction, type HomeSourceNodeData as SourceNode } from './HomeSourceNode.vue'
import HospitalRadar from './HospitalRadar.vue'
import { hospitalSources, hospitalNode, hospitalText, descendants, sourceAtOrigin, hospitalCards, hospitalRecord } from '@/data/hospitalFigmaSource'

const props=defineProps<{hospitalName:string}>()
const emit=defineEmits<{close:[];consultation:[]}>()
const width=ref(typeof window==='undefined'?1440:window.innerWidth)
const height=ref(typeof window==='undefined'?900:window.innerHeight)
const phone=computed(()=>width.value<=700)
const fluid=computed(()=>phone.value&&width.value!==375)
const activeTab=ref(0)
const scrollTop=ref(0)
const overviewEntered=ref(false)
const dialog=ref<HTMLDialogElement|null>(null)
const scroller=ref<HTMLElement|null>(null)
const yaoying=computed(()=>props.hospitalName==='上海曜影医院')
const selected=computed(()=>hospitalRecord(props.hospitalName))
const tabNames=['医院概况','科室中心','国际服务','医疗实力','院区网点','认证荣誉']
const model=computed(()=>{
  const file=hospitalSources[yaoying.value?`section-${phone.value?'mobile':'desktop'}-${activeTab.value+1}`:'detail-mobile-all']!.root
  const panel=yaoying.value?(phone.value?file.children[0]!.children[0]!:file):hospitalNode('1626:279')
  const [hero,body,cta]=panel.children as [SourceNode,SourceNode,SourceNode]
  const tabs=yaoying.value?body.children.find(node=>descendants(node).some(child=>child.name==='Button'&&tabNames.includes(hospitalText(child)))):undefined
  const tabButtons=tabs?descendants(tabs).filter(node=>node.name==='Button'&&tabNames.includes(hospitalText(node))):[]
  const close=hero.children.find(node=>node.name==='Button')!
  const title=descendants(hero).find(node=>node.type==='TEXT'&&node.text.endsWith('医院'))!
  return {file,panel,hero,body,cta,tabs,tabButtons,close,title,width:phone.value?343:yaoying.value?896:896}
})
const panelWidth=computed(()=>phone.value?width.value-32:Math.min(model.value.width,width.value-48))
const desktopScale=computed(()=>phone.value||!yaoying.value?1:panelWidth.value/model.value.width)
const panelHeight=computed(()=>Math.min(phone.value?640:650,(height.value-32)/desktopScale.value))
const tabTop=computed(()=>model.value.tabs?model.value.body.y+model.value.tabs.y:Infinity)
const stuck=computed(()=>scrollTop.value>=tabTop.value-(phone.value?model.value.hero.height:0))
const showFloatingClose=computed(()=>!phone.value&&scrollTop.value>model.value.hero.height-40)
const showIntroSummary=computed(()=>yaoying.value&&!phone.value&&activeTab.value===0&&!overviewEntered.value)
const allNodes=computed(()=>descendants(model.value.panel))
const baselineNodes=computed(()=>descendants(rootNode.value).filter(node=>node.textLines).map(node=>node.id))
const rootNode=computed(()=>{
  const m=model.value
  if(!showIntroSummary.value)return sourceAtOrigin(m.panel)
  // The authored opening state uses a 14px director quote, whereas the long
  // overview uses 16px. Preserve both exact Figma states rather than averaging.
  const openingQuote=hospitalNode('1487:18')
  return sourceAtOrigin({...m.panel,children:[m.hero,{...m.body,children:[openingQuote,...m.body.children.slice(1)]},m.cta]})
})
const footerNode=computed(()=>sourceAtOrigin(model.value.cta))
const stickyTabNode=computed(()=>sourceAtOrigin(hospitalNode(phone.value?'1620:2030':'1487:210')))
const actions=computed<Record<string,HomeSourceAction>>(()=>{
  const result:Record<string,HomeSourceAction>={}
  for(const root of [model.value.panel,stickyTabNode.value]) {
    for(const node of descendants(root)) {
      if(node.name==='Button'&&tabNames.includes(hospitalText(node)))result[node.id]={action:`tab:${tabNames.indexOf(hospitalText(node))}`,label:hospitalText(node)}
      if(node.name==='Link'&&hospitalText(node)==='预约咨询')result[node.id]={action:'consultation',label:'预约咨询'}
      if(node.name==='Button'&&hospitalText(node)==='查看详情'&&selected.value)result[node.id]={href:selected.value.website,label:`打开${selected.value.name}官网`}
    }
  }
  result[model.value.close.id]={action:'close',label:'关闭医院详情'}
  result['1487:121']={action:'close',label:'关闭医院详情'}
  const photoButtons=allNodes.value.filter(node=>node.name==='Button'&&descendants(node).some(c=>c.svg)&&node.id!==model.value.close.id&&!result[node.id])
  photoButtons.forEach((node,index)=>result[node.id]={action:`gallery:${index===0?-1:1}`,label:index===0?'上一张医院照片':'下一张医院照片'})
  return result
})
const hidden=computed(()=>{
  const ids=[model.value.cta.id,...(stuck.value&&model.value.tabs?[model.value.tabs.id]:[]),...(showFloatingClose.value?[model.value.close.id]:[])]
  if(!phone.value&&!yaoying.value&&selected.value){
    // The source accidentally repeats specialty chips inside International
    // Services. Retain the real service list instead of presenting them twice.
    ids.push('1626:347')
    const specialties=hospitalNode('1626:331').children
    specialties.slice(selected.value.specialties.length).forEach(node=>ids.push(node.id))
    const services=descendants(model.value.body.children[3]!).filter(node=>node.name==='List Item')
    services.slice(selected.value.services.length).forEach(node=>ids.push(node.id))
  }
  return ids
})
const genericData=computed(()=>{
  if(!selected.value||yaoying.value)return {}
  const item=selected.value
  const nodes=allNodes.value.filter(n=>n.type==='TEXT')
  const result:Record<string,string>={}
  const set=(from:string,to:string)=>{for(const node of nodes.filter(n=>n.text===from))result[node.id]=to}
  set('北京协和医院',item.name);set('Shanghai SinoUnited Hospital',item.nameEn)
  set('1921',String(item.established));set('2000',String(item.beds));set('56',String(item.departments))
  const intro=nodes.find(n=>n.text.startsWith('北京协和医院创建于1921年'))
  if(intro&&item.id!==1)result[intro.id]=item.intro
  if(item.id!==1) {
    const specialtyNodes=descendants(model.value.body.children[2]!).filter(n=>n.type==='TEXT'&&!['优势专科'].includes(n.text))
    specialtyNodes.forEach((node,index)=>{result[node.id]=item.specialties[index]||''})
    const serviceNodes=descendants(model.value.body.children[3]!).filter(n=>n.type==='TEXT'&&!['国际服务'].includes(n.text))
    const list=serviceNodes.slice(-6)
    list.forEach((node,index)=>{result[node.id]=item.services[index]||''})
  }
  return result
})
const nodeStyles=computed(()=>{
  const result:Record<string,string>={}
  const m=model.value
  result[m.panel.id]=`height:${m.cta.y}px;overflow:visible;`
  result[m.body.id]=`height:${m.cta.y-m.body.y}px;`
  if(phone.value)result[m.hero.id]='position:sticky;top:0;left:0;z-index:4;background:#fff;'
  if(showIntroSummary.value)result[m.body.children[m.body.children.length-1]!.id]='visibility:hidden;'
  if(!phone.value&&yaoying.value){
    const content=m.body.children[m.body.children.length-1]!
    // Keep the exact native position, but send its fractional translation to
    // the compositor. CSS layout otherwise snaps the raster-image origin to
    // a whole CSS pixel at this authored .59375px coordinate.
    const integral=Math.floor(content.y),fraction=content.y-integral
    result[content.id]=(result[content.id]||'')+`top:${integral}px;transform:translate3d(0,${fraction}px,0);`
    result[content.id]+='animation:hospital-content-in .28s cubic-bezier(.22,1,.36,1);'
  }
  for(const node of [m.tabs,stickyTabNode.value].filter(Boolean) as SourceNode[]) {
    for(const button of descendants(node).filter(n=>n.name==='Button'&&tabNames.includes(hospitalText(n)))) {
      const selected=tabNames.indexOf(hospitalText(button))===activeTab.value
      result[button.id]=(result[button.id]||'')+(selected?'border-bottom:2px solid #2563EB;':'border-bottom:0;')
      descendants(button).filter(child=>child.type==='TEXT').forEach(child=>{result[child.id]=`color:${selected?'#2563EB':'#94A3B8'};`})
    }
  }
  if(m.tabs&&phone.value)result[m.tabs.id]=(result[m.tabs.id]||'')+'overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scrollbar-width:none;'
  if(phone.value)result['1620:2030']='width:100%;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;'
  const gallery=m.body.children[m.body.children.length-1]?.children[0]
  if(gallery?.name==='Mask group')result[gallery.id]='overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scrollbar-width:none;'
  if(!yaoying.value) {
    const heroImage=m.hero.children[0]!
    const card=hospitalCards[phone.value?'mobile':'desktop'].find(card=>card.name===props.hospitalName)
    const image=card&&descendants(card.photo).find(n=>n.css.includes('url('))
    const imageUrl=image?.css.match(/url\(([^)]+)\)/)?.[1]||selected.value?.image
    if(imageUrl&&selected.value?.id!==1)result[heroImage.id]=`background-image:linear-gradient(0deg,rgba(0,0,0,.7),rgba(0,0,0,.2) 50%,transparent),url(${imageUrl});background-position:center;background-size:cover;`
    const en=allNodes.value.find(n=>n.text==='Shanghai SinoUnited Hospital')!
    result[en.id]='width:calc(100% - 32px);height:auto;white-space:normal;'
  }
  if(fluid.value||!phone.value&&!yaoying.value) {
    for(const node of allNodes.value) {
      let css=''
      const parent=allNodes.value.find(p=>p.children.some(c=>c.id===node.id))
      const isRow=parent?.layoutCss?.includes('display: flex;')&&!parent?.layoutCss?.includes('flex-direction: column;')
      const absolute=node.layoutCss?.includes('position:absolute;')
      if(node.type==='TEXT')css+=`max-width:100%;width:${isRow?'auto':'100%'};white-space:pre-wrap;height:auto;overflow-wrap:anywhere;`
      else if(!node.svg&&!absolute&&node.width>80)css+=(isRow?'flex:1 1 0;width:0;':'width:100%;')+'height:auto;'
      result[node.id]=(result[node.id]||'')+css
    }
    result[m.panel.id]='width:100%;height:auto;overflow:visible;'
    result[m.hero.id]='position:sticky;top:0;left:0;width:100%;height:121px;z-index:4;'
    result[m.hero.children[0]!.id]=(result[m.hero.children[0]!.id]||'')+'width:100%;height:120px;background-size:cover;background-position:center;'
    result[m.close.id]='top:16px;left:auto;right:16px;z-index:8;'
    result[m.body.id]='width:100%;height:auto;padding-bottom:0;'
    result[m.cta.id]='width:100%;'
    if(!phone.value)result['1626:282']='left:16px;top:auto;bottom:16px;width:calc(100% - 64px);height:auto;'
  }
  return result
})
const attributes=computed(()=>{
  const result:Record<string,Record<string,string|number|boolean>>={[model.value.title.id]:{id:'hospital-detail-title'}}
  for(const root of [model.value.panel,stickyTabNode.value])for(const node of descendants(root)){
    if(node.name==='Button'&&tabNames.includes(hospitalText(node))) {
      const index=tabNames.indexOf(hospitalText(node))
      result[node.id]={role:'tab','aria-selected':activeTab.value===index,tabindex:activeTab.value===index?0:-1,'aria-controls':'hospital-tab-content'}
    }
  }
  return result
})
let trigger:HTMLElement|null=null,oldOverflow='',savedY=0
let galleryIndex=0
function resize(){width.value=innerWidth;height.value=innerHeight}
function onScroll(){scrollTop.value=scroller.value?.scrollTop||0;if(scrollTop.value>0)overviewEntered.value=true}
async function changeTab(index:number){
  const wasStuck=stuck.value
  const oldScroll=scrollTop.value
  activeTab.value=index;galleryIndex=0
  await nextTick()
  if(scroller.value){scroller.value.scrollTop=wasStuck?tabTop.value-(phone.value?model.value.hero.height:0):Math.min(oldScroll,tabTop.value-1);onScroll()}
  const tab=dialog.value?.querySelector<HTMLElement>(`[role="tab"][aria-selected="true"]`)
  tab?.focus({preventScroll:true})
  const tabRect=tab?.getBoundingClientRect()
  const track=tab?.closest<HTMLElement>('[data-figma-name="Mask group"]')
  if(track&&tab&&tabRect&&(tabRect.right>track.getBoundingClientRect().right||tabRect.left<track.getBoundingClientRect().left))
    track.scrollLeft=tab.offsetLeft-8
}
function gallery(direction:number) {
  galleryIndex=(galleryIndex+direction+3)%3
  const photos=allNodes.value.filter(node=>node.type==='ROUNDED_RECTANGLE'&&node.css.includes('url('))
  const track=dialog.value?.querySelector<HTMLElement>('[data-figma-name="Mask group"] [data-figma-name="Frame 697"]')?.parentElement
  if(track)track.scrollTo({left:galleryIndex*132,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
  else if(photos.length>=3) {
    const urls=photos.map(node=>node.css.match(/url\(([^)]+)\)/)?.[1]).filter(Boolean)
    photos.forEach((node,index)=>{
      const element=dialog.value?.querySelector<HTMLElement>(`[data-figma-node="${node.id}"]`)
      if(element)element.style.backgroundImage=`url(${urls[(index+galleryIndex)%urls.length]})`
    })
  }
}
function activate(action:string){if(action==='close')emit('close');else if(action==='consultation')emit('consultation');else if(action.startsWith('tab:'))void changeTab(Number(action.slice(4)));else if(action.startsWith('gallery:'))gallery(Number(action.slice(8)))}
function keydown(event:KeyboardEvent){
  if(event.key==='Tab'&&dialog.value){
    const elements=Array.from(dialog.value.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')).filter(el=>el.tabIndex>=0&&el.getClientRects().length&&!el.closest('[inert]'))
    const first=elements[0],last=elements[elements.length-1]
    if(first&&last){if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus({preventScroll:true})}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus({preventScroll:true})}}
  }
  if(!(event.target instanceof HTMLElement)||event.target.getAttribute('role')!=='tab')return
  let index=activeTab.value
  if(event.key==='ArrowRight')index=(index+1)%6
  else if(event.key==='ArrowLeft')index=(index+5)%6
  else if(event.key==='Home')index=0
  else if(event.key==='End')index=5
  else return
  event.preventDefault();void changeTab(index)
}
function outside(event:MouseEvent){if(event.target===dialog.value)emit('close')}
onMounted(async()=>{
  trigger=document.activeElement instanceof HTMLElement?document.activeElement:null;savedY=scrollY;oldOverflow=document.body.style.overflow
  document.body.style.overflow='hidden';window.addEventListener('resize',resize,{passive:true})
  dialog.value?.showModal();await nextTick()
  dialog.value?.querySelector<HTMLElement>('[aria-label="关闭医院详情"]')?.focus({preventScroll:true})
})
onBeforeUnmount(()=>{
  dialog.value?.close();document.body.style.overflow=oldOverflow;window.removeEventListener('resize',resize)
  window.scrollTo({top:savedY,behavior:'instant'});trigger?.focus({preventScroll:true})
})
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" class="hospital-dialog" :class="{'is-phone':phone,'is-fluid':fluid,'is-generic':!yaoying}" aria-labelledby="hospital-detail-title" @cancel.prevent="emit('close')" @click="outside" @keydown="keydown">
      <div class="hospital-dialog__position" :style="{width:`${panelWidth}px`,height:`${panelHeight*desktopScale}px`}">
        <section class="hospital-dialog__panel" :data-hospital-panel="model.panel.id" :style="{width:`${phone?panelWidth:model.width}px`,height:`${panelHeight}px`,transform:`scale(${desktopScale})`}">
          <div ref="scroller" class="hospital-dialog__scroll" :style="{height:`${panelHeight-model.cta.height}px`}" @scroll="onScroll">
            <HomeSourceNode :node="rootNode" root :fluid="fluid||!phone&&!yaoying" :actions="actions" :styles="nodeStyles" :texts="genericData" :hidden="hidden" :attributes="attributes" :baseline-nodes="baselineNodes" :preserve-text-lines="!fluid&&(phone||yaoying)" @activate="activate">
              <template #radar><HospitalRadar :phone="phone" /></template>
            </HomeSourceNode>
            <div v-if="showIntroSummary" class="hospital-dialog__summary" :style="{left:'24px',top:'462.59375px'}">
              <HomeSourceNode :node="sourceAtOrigin(hospitalNode('1487:87'))" root :baseline-nodes="descendants(hospitalNode('1487:87')).filter(n=>n.textLines).map(n=>n.id)" />
            </div>
          </div>
          <div v-if="stuck&&model.tabs" class="hospital-dialog__fixed-tabs" :style="{top:phone?'121px':'0px',left:phone?'16px':'0px',width:phone?'calc(100% - 32px)':'100%',paddingTop:phone?'16px':'0px'}">
            <HomeSourceNode :node="stickyTabNode" root :actions="actions" :styles="nodeStyles" :attributes="attributes" @activate="activate" />
          </div>
          <div v-if="showFloatingClose" class="hospital-dialog__floating-close">
            <HomeSourceNode :node="hospitalNode('1487:121')" :actions="actions" @activate="activate" />
          </div>
          <footer class="hospital-dialog__cta" :style="{height:`${model.cta.height}px`}">
            <HomeSourceNode :node="footerNode" root :fluid="fluid||!phone&&!yaoying" :actions="actions" :styles="nodeStyles" @activate="activate" />
          </footer>
        </section>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
@import url('/fonts/home-source-fonts.css');
.hospital-dialog { position:fixed; inset:0; width:100%; max-width:none; height:100%; max-height:none; margin:0; padding:16px; border:0; background:transparent; overflow:auto; overscroll-behavior:contain; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.hospital-dialog[open] { display:flex; align-items:center; justify-content:center; }
.hospital-dialog::backdrop { background:rgba(0,0,0,.5); backdrop-filter:blur(4px); }
.hospital-dialog__position { flex:none; pointer-events:none; }
@media (min-width:701px) and (prefers-reduced-motion:no-preference) {
  .hospital-dialog__position { animation:hospital-dialog-in .32s cubic-bezier(.22,1,.36,1); }
  .hospital-dialog::backdrop { animation:hospital-backdrop-in .25s ease; }
}
@keyframes hospital-dialog-in { from {opacity:0;transform:translateY(16px);} to {opacity:1;transform:translateY(0);} }
@keyframes hospital-backdrop-in { from {opacity:0;} to {opacity:1;} }
.hospital-dialog__panel { position:relative; flex:none; overflow:hidden; border-radius:24px; background:#fff; transform-origin:top left; pointer-events:auto; }
.hospital-dialog__scroll { position:relative; width:100%; overflow:auto; overscroll-behavior:contain; scrollbar-width:none; }
.hospital-dialog__scroll::-webkit-scrollbar { display:none; }
.hospital-dialog__cta { position:absolute; bottom:0; left:0; width:100%; z-index:8; background:#fff; }
.hospital-dialog__summary { position:absolute; width:848px; pointer-events:none; }
.hospital-dialog__fixed-tabs { position:absolute; z-index:5; background:#fff; }
.hospital-dialog__floating-close { position:absolute; inset:0; z-index:6; pointer-events:none; }
.hospital-dialog__floating-close :deep(button) { pointer-events:auto; }
.hospital-dialog :deep(button:focus-visible),.hospital-dialog :deep(a:focus-visible) { outline:2px solid #2563eb; outline-offset:2px; }
.is-fluid :deep(.home-source-node--root) { width:100%!important; }
.is-fluid .hospital-dialog__scroll :deep([data-figma-name="Mask group"]) { max-width:100%; }
.is-generic:not(.is-phone) .hospital-dialog__scroll { font-size:14px; }
@media (prefers-reduced-motion:reduce) { .hospital-dialog :deep([data-figma-node]) { animation:none!important;transition:none!important; } }
</style>
<style>
@keyframes hospital-content-in { from { opacity:0; } to { opacity:1; } }
</style>
