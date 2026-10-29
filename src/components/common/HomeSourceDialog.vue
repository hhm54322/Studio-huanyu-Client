<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeSourceNode, { type HomeSourceAction, type HomeSourceNodeData } from './HomeSourceNode.vue'
import { homeDesktopNodes, homeMobileNodes } from '@/data/homeFigmaSource'

const props = defineProps<{
  desktopPanel: string
  mobilePanel: string
  desktopTitle: string
  mobileTitle: string
  actions: Record<string, HomeSourceAction>
  texts?: Record<string,string>
  styles?: Record<string,string>
  scrollNode?: string
}>()
const emit = defineEmits<{ close:[]; activate:[action:string,event:MouseEvent] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const width = ref(typeof window==='undefined'?1440:window.innerWidth)
const mobile = computed(()=>width.value<=700)
const node = computed(()=>(mobile.value?homeMobileNodes.get(props.mobilePanel):homeDesktopNodes.get(props.desktopPanel))!)
const scale = computed(()=>mobile.value?1:Math.min(1,(width.value-48)/node.value.width))
const adaptive = computed(()=>mobile.value&&width.value!==375)
const titleId = computed(()=>mobile.value?props.mobileTitle:props.desktopTitle)
const fixedRoots=['1541:1074','1541:1170']
const attributes = computed<Record<string, Record<string, string | number | boolean>>>(()=>{
  const result:Record<string, Record<string, string | number | boolean>> = {[titleId.value]:{id:'home-source-dialog-title'}}
  if(props.scrollNode) result[props.scrollNode]={tabindex:0,'aria-label':'治疗全流程，向下滚动查看'}
  return result
})
const nodeStyles = computed(()=>{
  const result:Record<string,string>={...props.styles}
  for(const [id,control] of Object.entries(props.actions)) if(control.action?.endsWith(':close')) result[id]=(result[id]||'')+'z-index:2;'
  if(props.scrollNode&&!mobile.value) result[props.scrollNode]='overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;'
  for(const id of fixedRoots) result[id]='overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;'
  if(!adaptive.value) return result
  function visit(item:HomeSourceNodeData,parent?:HomeSourceNodeData,fixed=false){
    if(fixed) return
    if(fixedRoots.includes(item.id)) {
      result[item.id]=(result[item.id]||'')+`position:relative;left:0;top:0;width:100%;height:${item.height}px;max-width:100%;`
      return
    }
    const horizontal=parent?.layoutCss?.includes('display: flex;')&&!parent?.layoutCss?.includes('flex-direction: column;')
    const absolute=item.layoutCss?.includes('position:absolute;')
    let css='max-width:100%;'
    if(item.type==='TEXT') css+=/^\d{1,2}$/.test(item.text)?'width:max-content;max-width:none;height:auto;white-space:pre;overflow-wrap:normal;':'height:auto;white-space:pre-wrap;overflow-wrap:anywhere;'
    else if(!item.svg&&!props.actions[item.id]&&!absolute&&item.width>40) {
      css+=horizontal?'flex:1 1 0;width:0;':'width:100%;'
      css+='height:auto;'
    }
    result[item.id]=(result[item.id]||'')+css
    if(item.children.some(child=>child.id===titleId.value)) result[item.id]+='width:calc(100% - 36px);'
    if(props.actions[item.id]?.action?.endsWith(':close')) result[item.id]='left:auto;right:8px;z-index:2;'
    if(item.id==='1543:53') result[item.id]+='aspect-ratio:3/2;height:auto;'
    if(item.id==='1543:54') result[item.id]='top:auto;bottom:12px;left:50%;right:auto;width:112px;transform:translateX(-50%);'
    item.children.forEach(child=>visit(child,item))
  }
  visit(node.value)
  result[node.value.id]='width:100%;height:auto;'
  return result
})
let originalOverflow=''
let trigger:HTMLElement|null=null
function resize(){width.value=window.innerWidth}
function activate(action:string,event:MouseEvent){
  if(action.endsWith(':close')) { emit('close'); return }
  emit('activate',action,event)
}
function closeOutside(event:MouseEvent){if(event.target===dialog.value)emit('close')}
onMounted(async()=>{
  trigger=document.activeElement instanceof HTMLElement?document.activeElement:null
  originalOverflow=document.body.style.overflow
  document.body.style.overflow='hidden'
  window.addEventListener('resize',resize,{passive:true})
  dialog.value?.showModal()
  await nextTick()
  dialog.value?.querySelector<HTMLElement>('[aria-label="关闭详情"]')?.focus({preventScroll:true})
})
onBeforeUnmount(()=>{
  dialog.value?.close()
  document.body.style.overflow=originalOverflow
  window.removeEventListener('resize',resize)
  trigger?.focus({preventScroll:true})
})
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" class="home-source-dialog" :class="{'is-mobile':mobile}" aria-labelledby="home-source-dialog-title" @cancel.prevent="emit('close')" @click="closeOutside">
      <div class="home-source-dialog__position" :style="mobile?undefined:{width:`${node.width*scale}px`,height:`${node.height*scale}px`}">
        <div class="home-source-dialog__canvas" :style="mobile?undefined:{width:`${node.width}px`,height:`${node.height}px`,transform:`scale(${scale})`}">
          <HomeSourceNode :node="node" root :fluid="adaptive" :fixed-roots="fixedRoots" :actions="actions" :texts="texts" :styles="nodeStyles" :attributes="attributes" @activate="activate" />
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
@import url('/fonts/home-source-fonts.css');
.home-source-dialog { position:fixed; inset:0; width:100%; max-width:none; height:100%; max-height:none; margin:0; border:0; padding:40px 24px; overflow:auto; overscroll-behavior:contain; background:transparent; -webkit-font-smoothing:antialiased; }
.home-source-dialog[open] { display:flex; flex-direction:column; align-items:center; }
.home-source-dialog::backdrop { background:rgba(0,0,0,.5); backdrop-filter:blur(4px); }
.home-source-dialog__position { flex:none; margin:auto; }
.home-source-dialog__canvas { transform-origin:top left; font-family:'PingFang SC',sans-serif; }
.home-source-dialog.is-mobile { padding:16px 16px 36px; }
.is-mobile .home-source-dialog__position,.is-mobile .home-source-dialog__canvas { width:100%; }
.home-source-dialog :deep(button:focus-visible),.home-source-dialog :deep([tabindex="0"]:focus-visible) { outline:2px solid #2563eb; outline-offset:2px; }
</style>
