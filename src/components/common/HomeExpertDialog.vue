<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeSourceNode, { type HomeSourceAction, type HomeSourceNodeData } from './HomeSourceNode.vue'
import source from '../../../docs/figma-source/home/experts/dialog-sources-2026-10-19.json'

type ExpertSource = {
  name:string; frame:string; overlay:string; panel:string; width:number; height:number
  title:string; close:string; tabs:{id:string;text:string}[]; scrollContainers:string[]
  root:HomeSourceNodeData
}
const records = source.records as Record<string, ExpertSource>
const props = defineProps<{ expert:number }>()
const emit = defineEmits<{ close:[] }>()
const names = ['xu-yu','zhou-li-li','liu-guang-yu','chen-ji-wu']
const activeTab = ref(0)
const width = ref(typeof window==='undefined'?1440:window.innerWidth)
const height = ref(typeof window==='undefined'?900:window.innerHeight)
const dialog = ref<HTMLDialogElement|null>(null)
const phone = computed(()=>width.value<=700)
const fluid = computed(()=>phone.value&&width.value!==375)
const name = computed(()=>names[props.expert]!)
const model = computed(()=>{
  const key=`${name.value}${phone.value?'-mobile':''}-0${activeTab.value+1}`
  // The separate Figma Frame 716 is the short-screen scrolling variant of
  // this long list. Use it when the complete 560px version cannot fit.
  return records[phone.value&&key==='liu-guang-yu-mobile-02'&&height.value<records[key]!.height+32?`${key}-alternate`:key]!
})
const scale = computed(()=>phone.value?1:Math.min(1,(width.value-48)/model.value.width))
const actions = computed<Record<string,HomeSourceAction>>(()=>({
  [model.value.close]:{action:'close',label:'关闭专家详情'},
  ...Object.fromEntries(model.value.tabs.map((tab,index)=>[tab.id,{action:`tab:${index}`,label:tab.text}])),
}))
const tabLayout=computed(()=>{
  let row:{id:string;bottom:number}|undefined
  const positioned:{node:HomeSourceNodeData;y:number;ancestors:string[]}[]=[]
  const visit=(node:HomeSourceNodeData,y=0,ancestors:string[]=[])=>{
    const top=ancestors.length?y+node.y:0
    positioned.push({node,y:top,ancestors})
    if(node.children.some(child=>model.value.tabs.some(tab=>tab.id===child.id)))row={id:node.id,bottom:top+node.height}
    node.children.forEach(child=>visit(child,top,[...ancestors,node.id]))
  }
  visit(model.value.root)
  const owners=new Set<string>()
  for(const item of positioned){
    if(item.node.visible&&row&&item.y>=row.bottom&&!item.ancestors.some(id=>owners.has(id)))owners.add(item.node.id)
  }
  return {row:row?.id,contents:[...owners]}
})
const attributes = computed(()=>{
  const result:Record<string,Record<string,string|number|boolean>>={[model.value.title]:{id:'expert-dialog-title'}}
  if(tabLayout.value.row)result[tabLayout.value.row]={role:'tablist','aria-label':'专家资料'}
  model.value.tabs.forEach((tab,index)=>{result[tab.id]={
    role:'tab',id:`expert-tab-${index}`,'aria-selected':activeTab.value===index,
    'aria-controls':tabLayout.value.contents.map((_,index)=>`expert-content-${index}`).join(' '),tabindex:activeTab.value===index?0:-1,
  }})
  tabLayout.value.contents.forEach((id,index)=>{result[id]={id:`expert-content-${index}`,role:index===0?'tabpanel':'region','aria-labelledby':`expert-tab-${activeTab.value}`,...(index===0?{tabindex:0}:{})}})
  return result
})
const nodeStyles = computed(()=>{
  const result:Record<string,string> = {[model.value.close]:'z-index:3;'}
  if(model.value.name==='liu-guang-yu-mobile-02-alternate'){
    result['1650:2345']='overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:none;'
    // The authored alternate captures scrollTop=40. A real scrolling viewport
    // starts at zero; scrolling it 40px reproduces that exact Figma state.
    result['1650:2347']='top:0;'
  }
  if(!fluid.value) return result
  const visit=(node:HomeSourceNodeData,parent?:HomeSourceNodeData)=>{
    const absolute=node.layoutCss?.includes('position:absolute;')
    const row=parent?.layoutCss?.includes('display: flex;')&&!parent.layoutCss.includes('flex-direction: column;')||parent?.layoutCss?.includes('display: inline-flex;')&&!parent.layoutCss.includes('flex-direction: column;')
    let css='max-width:100%;'
    // Keep the authored tab row inside the reduced phone panel. The source
    // frame is 343px wide; at 320px the fluid panel is narrower, so the tabs
    // become an intentional local scroller instead of widening the dialog or
    // the document. Their source widths and typography remain unchanged.
    if(node.children.some(child=>model.value.tabs.some(tab=>tab.id===child.id))) css+='width:100%;overflow-x:auto;overflow-y:hidden;'
    if(node.type==='TEXT') css+='height:auto;white-space:pre-wrap;overflow-wrap:anywhere;'
    else if(!node.svg&&!actions.value[node.id]&&!absolute&&node.width>80) css+=(row?'flex:1 1 0;width:0;':'width:100%;')+'height:auto;'
    result[node.id]=(result[node.id]||'')+css
    node.children.forEach(child=>visit(child,node))
  }
  visit(model.value.root)
  result[model.value.panel]='width:100%;height:auto;min-height:'+model.value.height+'px;'
  result[model.value.close]='left:auto;right:8px;top:8px;z-index:3;'
  return result
})
let trigger:HTMLElement|null=null
let oldOverflow=''
function resize(){width.value=window.innerWidth;height.value=window.innerHeight}
async function changeTab(index:number){
  if(index===activeTab.value)return
  activeTab.value=index
  await nextTick()
  dialog.value?.querySelector<HTMLElement>(`#expert-tab-${index}`)?.focus({preventScroll:true})
  // Keep the viewport and outer dialog stable; only the selected source changes.
  if(dialog.value) dialog.value.scrollTop=0
  if(!phone.value&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    for(const id of tabLayout.value.contents){
      dialog.value?.querySelector<HTMLElement>(`[data-figma-node="${id}"]`)?.animate([{opacity:0},{opacity:1}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)'})
    }
  }
}
function activate(action:string){
  if(action==='close')emit('close')
  else if(action.startsWith('tab:'))void changeTab(Number(action.split(':')[1]))
}
function keydown(event:KeyboardEvent){
  if(event.key==='Tab'&&dialog.value){
    const focusable=Array.from(dialog.value.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')).filter(element=>element.tabIndex>=0&&element.getClientRects().length&&!element.closest('[inert]'))
    const first=focusable[0],last=focusable[focusable.length-1]
    if(first&&last){
      if(event.shiftKey&&(document.activeElement===first||!dialog.value.contains(document.activeElement))){event.preventDefault();last.focus({preventScroll:true})}
      else if(!event.shiftKey&&(document.activeElement===last||!dialog.value.contains(document.activeElement))){event.preventDefault();first.focus({preventScroll:true})}
    }
    return
  }
  if(!(event.target instanceof HTMLElement)||event.target.getAttribute('role')!=='tab')return
  const count=model.value.tabs.length
  let next=activeTab.value
  if(event.key==='ArrowRight')next=(next+1)%count
  else if(event.key==='ArrowLeft')next=(next+count-1)%count
  else if(event.key==='Home')next=0
  else if(event.key==='End')next=count-1
  else return
  event.preventDefault()
  void changeTab(next)
}
function outside(event:MouseEvent){if(event.target===dialog.value||event.target instanceof HTMLElement&&event.target.dataset.expertOverlay!==undefined)emit('close')}
onMounted(async()=>{
  trigger=document.activeElement instanceof HTMLElement?document.activeElement:null
  oldOverflow=document.body.style.overflow
  document.body.style.overflow='hidden'
  window.addEventListener('resize',resize,{passive:true})
  dialog.value?.showModal()
  await nextTick()
  dialog.value?.querySelector<HTMLElement>('[aria-label="关闭专家详情"]')?.focus({preventScroll:true})
})
onBeforeUnmount(()=>{
  dialog.value?.close()
  document.body.style.overflow=oldOverflow
  window.removeEventListener('resize',resize)
  trigger?.focus({preventScroll:true})
})
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" class="expert-source-dialog" :class="{'is-phone':phone}" :data-figma-node="model.frame" aria-labelledby="expert-dialog-title" @cancel.prevent="emit('close')" @click="outside" @keydown="keydown">
      <div class="expert-source-dialog__overlay" data-expert-overlay :data-figma-node="model.overlay">
        <div class="expert-source-dialog__position" :style="phone?undefined:{width:`${model.width*scale}px`,height:`${model.height*scale}px`}">
          <div class="expert-source-dialog__canvas" :style="phone?undefined:{width:`${model.width}px`,height:`${model.height}px`,transform:`scale(${scale})`}">
            <HomeSourceNode :key="model.panel" :node="model.root" root :fluid="fluid" :actions="actions" :styles="nodeStyles" :attributes="attributes" @activate="activate" />
          </div>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
@import url('/fonts/home-source-fonts.css');
.expert-source-dialog { position:fixed; inset:0; width:100%; max-width:none; height:100%; max-height:none; margin:0; padding:0; border:0; overflow:auto; overscroll-behavior:contain; background:transparent; -webkit-font-smoothing:antialiased; }
.expert-source-dialog::backdrop { background:rgba(0,0,0,.5); backdrop-filter:blur(4px); }
.expert-source-dialog__overlay { display:flex; flex-direction:column; align-items:center; min-height:100%; padding:40px 24px; }
.expert-source-dialog__position { flex:none; margin:auto; }
.expert-source-dialog__canvas { transform-origin:top left; font-family:'PingFang SC',sans-serif; }
.is-phone .expert-source-dialog__overlay { padding:16px; }
.is-phone .expert-source-dialog__position,.is-phone .expert-source-dialog__canvas { width:343px; max-width:100%; }
.expert-source-dialog :deep(button:focus-visible),.expert-source-dialog :deep([tabindex="0"]:focus-visible) { outline:2px solid #2563eb; outline-offset:2px; }
@media (min-width:701px) and (prefers-reduced-motion:no-preference) {
  .expert-source-dialog__position { animation:expert-dialog-in .32s cubic-bezier(.22,1,.36,1) both; }
  .expert-source-dialog::backdrop { animation:expert-backdrop-in .25s ease both; }
}
@keyframes expert-dialog-in { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes expert-backdrop-in { from { opacity:0; } to { opacity:1; } }
</style>
