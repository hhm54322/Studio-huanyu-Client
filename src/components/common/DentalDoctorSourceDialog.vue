<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeSourceNode, { type HomeSourceAction, type HomeSourceNodeData as SourceNode } from './HomeSourceNode.vue'
import { dentalDescendants, dentalNode, dentalSources } from '@/data/dentalFigmaSource'
import { dentalPhysicianById } from '@/data/dentalPhysicianData'
import { populateDentalPhysicianIdentity, replaceDentalText } from '@/data/dentalPhysicianSource'
import DentalPhysicianDocumentContent from './DentalPhysicianDocumentContent.vue'
import profileModel from '../../../docs/figma-source/dental-revision-2026-10-28/profile/dialog-model-2026-10-28.json'
import treatmentModel from '../../../docs/figma-source/dental-revision-2026-10-28/treatment-scroll/dialog-model-2026-10-28.json'
import casesModel from '../../../docs/figma-source/dental-revision-2026-10-28/cases/dialog-model-2026-10-28.json'
import reviewsModel from '../../../docs/figma-source/dental-revision-2026-10-28/reviews/dialog-model-2026-10-28.json'
import servicesModel from '../../../docs/figma-source/dental-revision-2026-10-28/services-scroll/dialog-model-2026-10-28.json'
import institutionModel from '../../../docs/figma-source/dental-revision-2026-10-28/institution-scroll/dialog-model-2026-10-28.json'

const props=withDefaults(defineProps<{doctor?:{id:number;name:string};initialTab?:number;institution?:boolean}>(),{initialTab:0,institution:false})
const emit=defineEmits<{close:[]}>()
const active=ref(props.initialTab),dialog=ref<HTMLDialogElement|null>(null),clip=ref<HTMLElement|null>(null)
const width=ref(window.innerWidth),height=ref(window.innerHeight)
const record=computed(()=>props.doctor?dentalPhysicianById(props.doctor.id):undefined)
const documentMode=computed(() => props.institution?'institution':active.value===0?'profile':active.value===2?'cases':active.value===3?'reviews':null)
const documentHeight=ref(0)
const sources=[{...profileModel,folder:'profile'},{...treatmentModel,folder:'treatment-scroll'},{...casesModel,folder:'cases'},{...reviewsModel,folder:'reviews'},{...servicesModel,folder:'services-scroll'}]
const model=computed(()=>props.institution?{...institutionModel,folder:'institution-scroll',tabs:[]}:sources[active.value]!)
const root=computed(()=>{
  const panel=structuredClone(dentalNode(model.value.panel))
  const nodes=dentalDescendants(panel)
  if(!props.institution&&active.value===1){
    // The short Figma frame is a scrolling viewport, not the whole timeline.
    // Its first three rows remain exact; 04–06 come from the full 01–06 frame.
    const content=nodes.find(node=>node.id==='2294:7526')!
    const full=dentalNode('2294:7856')
    content.children.push(...structuredClone(full.children.slice(3)))
    content.height=full.height;content.css+=`;height:${full.height}px;`
    const body=nodes.find(node=>node.id==='2294:7495')!
    body.height=dentalNode('2294:7825').height;body.css+=`;height:${body.height}px;`
    panel.height=dentalNode('2294:7821').height
  }
  if(props.institution){
    // Full-content frame supplies the complete eight-photo gallery. The short
    // frame supplies the fixed 896×640 viewport and its title/close control.
    const gallery=nodes.find(node=>node.id==='2294:7683')!
    gallery.children=structuredClone(dentalNode('2294:7742').children)
    panel.height=dentalNode('2294:7694').height
  }
  if(!props.institution&&active.value===4){
    // The complete services frame owns all ten cards; the short frame owns
    // the tab/header state and the 896×640 scrolling viewport.
    const content=nodes.find(node=>node.id==='2294:7914')!
    content.children=structuredClone(dentalNode('2294:7420').children)
  }
  if(!props.institution&&active.value===3){
    const body=nodes.find(node=>node.name==='Frame 683')!
    panel.height=Math.max(panel.height,body.y+body.height+body.y)
  }
  if(record.value){
    if(props.institution){
      const title=nodes.find(node=>node.id==='2294:7642')!
      replaceDentalText(title,`${record.value.institutionLabel}（${record.value.city}）`)
      title.css+=';width:784px;white-space:normal;'
    }else populateDentalPhysicianIdentity(panel,record.value)
    if(documentMode.value){
      panel.height=Math.max(640,documentHeight.value+(props.institution?32:189)+64)
      const body=nodes.find(node=>node.name==='Frame 683')!
      body.height=panel.height-64;body.css+=`;height:${body.height}px;`
    }
  }
  panel.css+=`;height:${panel.height}px;overflow:visible;`
  return panel
})
const nodes=computed(()=>dentalDescendants(root.value))
const baselines=computed(()=>nodes.value.filter(node=>node.textLines).map(node=>node.id))
const tabs=computed(()=>model.value.tabs.map((tab,index)=>({...tab,text:record.value?['医生简介','治疗流程','案例集',`患者评价（${record.value.reviews.length}）`,'在华就诊保障服务（10）'][index]!:tab.text})))
const bodyId=computed(()=>nodes.value.find(node=>node.name==='Frame 683')!.id)
const tabRow=computed(()=>nodes.value.find(node=>node.children.some(child=>tabs.value.some(tab=>tab.id===child.id))))
const contentRoots=computed(()=>{
  if(props.institution)return root.value.children.filter(node=>node.name==='Frame 683').map(node=>node.id)
  const body=nodes.value.find(node=>node.name==='Frame 683')!
  const tabs=body.children.find(child=>dentalDescendants(child).some(node=>node.id===tabRow.value?.id))!
  return body.children.filter(node=>node.y>=tabs.y+tabs.height).map(node=>node.id)
})
const scale=computed(()=>Math.min(1,(width.value-48)/model.value.width))
const viewportHeight=computed(()=>Math.min(model.value.mask?.height??model.value.height,(height.value-80)/scale.value))
const actions=computed<Record<string,HomeSourceAction>>(()=>({
  [model.value.close]:{action:'close',label:props.institution?'关闭机构介绍':'关闭医生详情'},
  ...Object.fromEntries(tabs.value.map((tab,index)=>[tab.id,{action:`tab:${index}`,label:tab.text}])),
}))
const attributes=computed(()=>{
  const result:Record<string,Record<string,string|number|boolean>>={
    [model.value.title]:{id:'dental-source-dialog-title'},[model.value.close]:{'data-dialog-close':true},
  }
  if(tabRow.value)result[tabRow.value.id]={role:'tablist','aria-label':'医生资料'}
  tabs.value.forEach((tab,index)=>{result[tab.id]={id:`dental-source-tab-${index}`,role:'tab','aria-selected':active.value===index,'aria-controls':record.value&&documentMode.value?'dental-document-content':contentRoots.value.map((_,i)=>`dental-source-content-${i}`).join(' '),tabindex:active.value===index?0:-1}})
  contentRoots.value.forEach((id,index)=>{result[id]={id:`dental-source-content-${index}`,role:index===0?'tabpanel':'region','aria-labelledby':props.institution?'dental-source-dialog-title':`dental-source-tab-${active.value}`,...(index===0?{tabindex:0}:{})}})
  return result
})
const styles=computed(()=>({[model.value.close]:'z-index:3;'}))
const hidden=computed(()=>record.value&&documentMode.value?(props.institution?['2294:7681','2294:7683']:contentRoots.value):[])
let trigger:HTMLElement|null=null,oldOverflow='',scrollPosition=0
function resize(){width.value=window.innerWidth;height.value=window.innerHeight}
async function changeTab(index:number){
  if(index===active.value)return
  active.value=index;await nextTick()
  if(clip.value)clip.value.scrollTop=0
  dialog.value?.querySelector<HTMLElement>(`#dental-source-tab-${index}`)?.focus({preventScroll:true})
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)for(const id of contentRoots.value)dialog.value?.querySelector<HTMLElement>(`[data-figma-node="${id}"]`)?.animate([{opacity:0},{opacity:1}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)'})
}
function activate(action:string){if(action==='close')emit('close');else if(action.startsWith('tab:'))void changeTab(Number(action.slice(4)))}
function keydown(event:KeyboardEvent){
  if(!dialog.value)return
  if(event.key==='Tab'){
    const items=[...dialog.value.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(el=>el.tabIndex>=0&&el.getClientRects().length)
    const first=items[0],last=items[items.length-1]
    if(first&&last){if(event.shiftKey&&(document.activeElement===first||!dialog.value.contains(document.activeElement))){event.preventDefault();last.focus({preventScroll:true})}else if(!event.shiftKey&&(document.activeElement===last||!dialog.value.contains(document.activeElement))){event.preventDefault();first.focus({preventScroll:true})}}
    return
  }
  if(!(event.target instanceof HTMLElement)||event.target.getAttribute('role')!=='tab')return
  const next=event.key==='ArrowRight'?(active.value+1)%tabs.value.length:event.key==='ArrowLeft'?(active.value+tabs.value.length-1)%tabs.value.length:event.key==='Home'?0:event.key==='End'?tabs.value.length-1:null
  if(next!==null){event.preventDefault();void changeTab(next)}
}
function outside(event:MouseEvent){if(event.target===dialog.value||event.target instanceof HTMLElement&&event.target.dataset.dentalSourceOverlay!==undefined)emit('close')}
onMounted(async()=>{
  trigger=document.activeElement instanceof HTMLElement?document.activeElement:null
  oldOverflow=document.body.style.overflow;scrollPosition=window.scrollY;document.body.style.overflow='hidden'
  dialog.value?.showModal();await nextTick();dialog.value?.querySelector<HTMLElement>('[data-dialog-close]')?.focus({preventScroll:true})
  window.addEventListener('resize',resize,{passive:true})
})
onBeforeUnmount(()=>{window.removeEventListener('resize',resize);dialog.value?.close();document.body.style.overflow=oldOverflow;trigger?.focus({preventScroll:true});if(window.scrollY!==scrollPosition)window.scrollTo({top:scrollPosition,behavior:'instant'})})
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" class="dental-source-dialog" :data-figma-node="model.frame" :data-dental-dialog="institution?'institution':'doctor'" :data-document-doctor="record?.id" :data-active-tab="active" aria-labelledby="dental-source-dialog-title" @cancel.prevent="emit('close')" @keydown="keydown" @click="outside">
      <div class="dental-source-dialog__overlay" data-dental-source-overlay :data-figma-node="model.overlay">
        <div class="dental-source-dialog__position" :style="{width:`${model.width*scale}px`,height:`${viewportHeight*scale}px`}">
          <div ref="clip" class="dental-source-dialog__clip" :data-figma-node="model.mask?.id" :style="{width:`${model.width}px`,height:`${viewportHeight}px`,transform:`scale(${scale})`}">
            <div class="dental-source-dialog__canvas" :style="{width:`${model.width}px`,height:`${root.height}px`}">
              <HomeSourceNode :key="model.panel" :node="root" root :actions="actions" :attributes="attributes" :styles="styles" :hidden="hidden" :baseline-nodes="baselines" preserve-text-lines @activate="activate">
                <template #after="{node}">
                  <DentalPhysicianDocumentContent v-if="record&&documentMode&&node.id===bodyId" :key="documentMode" :doctor="record" :mode="documentMode" :aria-labelledby="institution?'dental-source-dialog-title':`dental-source-tab-${active}`" :style="{top:`${institution?32:189}px`}" @height="value=>documentHeight=value" />
                </template>
              </HomeSourceNode>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
@import url('/fonts/home-source-fonts.css');
.dental-source-dialog{position:fixed;inset:0;width:100%;max-width:none;height:100%;max-height:none;padding:0;border:0;margin:0;overflow:auto;overscroll-behavior:contain;background:transparent;font-family:'PingFang SC',sans-serif;-webkit-font-smoothing:antialiased;}
.dental-source-dialog::backdrop{background:rgba(0,0,0,.5);backdrop-filter:blur(4px);}
.dental-source-dialog__overlay{display:flex;flex-direction:column;align-items:center;min-height:100%;padding:40px 24px;}
.dental-source-dialog__position{position:relative;flex:none;margin:auto;}
.dental-source-dialog__clip{position:absolute;inset:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:none;border-radius:24px;background:white;transform-origin:top left;}
.dental-source-dialog__canvas{position:relative;}
.dental-source-dialog :deep(button:focus-visible){outline:2px solid #2563eb;outline-offset:2px;}
@media (prefers-reduced-motion:no-preference){.dental-source-dialog__position{animation:dental-dialog-in .32s cubic-bezier(.22,1,.36,1) both;}.dental-source-dialog::backdrop{animation:dental-backdrop-in .25s ease both;}}
@media (prefers-reduced-motion:reduce){.dental-source-dialog :deep(*){animation:none!important;transition:none!important;}}
@keyframes dental-dialog-in{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes dental-backdrop-in{from{opacity:0;}to{opacity:1;}}
</style>
