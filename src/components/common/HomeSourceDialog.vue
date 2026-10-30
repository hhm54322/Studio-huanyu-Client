<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeSourceNode, { type HomeSourceAction, type HomeSourceNodeData } from './HomeSourceNode.vue'
import { homeDesktopNodes, homeMobileNodes, homeStoryDetailPhotoIds } from '@/data/homeFigmaSource'
import { useAutoplayCarousel } from '@/composables/useAutoplayCarousel'

const props = defineProps<{
  desktopPanel: string
  mobilePanel: string
  desktopTitle: string
  mobileTitle: string
  actions: Record<string, HomeSourceAction>
  texts?: Record<string,string>
  styles?: Record<string,string>
  scrollNode?: string
  photoCarousel?: boolean
}>()
const emit = defineEmits<{ close:[]; activate:[action:string,event:MouseEvent] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const width = ref(typeof window==='undefined'?1440:window.innerWidth)
const mobile = computed(()=>width.value<=700)
const photoViewport = ref<HTMLElement | null>(null)
const photos = homeStoryDetailPhotoIds.map(id=>homeDesktopNodes.get(id)!)
const { activeIndex:photoIndex, select:selectPhoto, paused:photosPaused, togglePause:togglePhotos } = useAutoplayCarousel(photoViewport, props.photoCarousel ? photos.length : 0)
const photoDots=['1466:859','1466:860','1466:861','1466:862','1466:863']
const showPhotos=computed(()=>props.photoCarousel&&!mobile.value)
const sourceActions=computed(()=>({
  ...props.actions,
  ...(showPhotos.value ? Object.fromEntries(photoDots.map((id,index)=>[id,{action:`photo:${index}`,label:`查看第${index+1}张患者照片`}])) : {}),
}))
const photoDotStyles=computed(()=>{
  let left=0
  return Object.fromEntries(photoDots.map((id,index)=>{
    const width=index===photoIndex.value?32:10
    const css=`left:${left}px;width:${width}px;background:${index===photoIndex.value?'#DD6B20':'rgba(255,255,255,.20)'};`
    left+=width+8
    return [id,css]
  }))
})
const photoAttributes=computed(()=>Object.fromEntries(photoDots.map((id,index)=>[id,{'aria-pressed':index===photoIndex.value}])))
const storyScrollContent=homeDesktopNodes.get('1407:30')!
const storyBottomContent=homeDesktopNodes.get('1414:7363')!
const storyBottomInset=homeDesktopNodes.get('1414:7361')!.height-(storyBottomContent.height+storyBottomContent.y)
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
  if(props.photoCarousel&&!mobile.value) {
    result['1407:28']+='background:#fff;'
    result['1407:30']='border-radius:24px;'
  }
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
  if(action.startsWith('photo:')) { selectPhoto(Number(action.split(':')[1])); return }
  if(action.endsWith(':close')) { emit('close'); return }
  emit('activate',action,event)
}
function photoKey(event:KeyboardEvent) {
  if(!['ArrowLeft','ArrowRight'].includes(event.key))return
  event.preventDefault()
  selectPhoto(photoIndex.value+(event.key==='ArrowRight'?1:-1))
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
          <HomeSourceNode :node="node" root :fluid="adaptive" :fixed-roots="fixedRoots" :actions="sourceActions" :texts="texts" :styles="nodeStyles" :attributes="attributes" :hidden="showPhotos ? ['1407:20','1466:858'] : undefined" @activate="activate">
            <template #after="{node:sourceNode}">
              <div v-if="showPhotos && sourceNode.id==='1407:19'" ref="photoViewport" class="home-story-photos" role="region" aria-roledescription="轮播" aria-label="患者就医照片" :data-story-detail-state="photoIndex+1" @keydown="photoKey">
                <div v-for="(photo,index) in photos" :key="photo.id" class="home-story-photos__photo" :class="{'is-active':index===photoIndex}" :aria-hidden="index!==photoIndex" :data-detail-photo="index+1" role="img" :aria-label="`Michael W. 的第${index+1}张就医照片`"><HomeSourceNode :node="photo" root /></div>
                <HomeSourceNode :node="homeDesktopNodes.get('1466:858')!" :actions="sourceActions" :styles="photoDotStyles" :attributes="photoAttributes" @activate="activate" />
                <button class="home-story-photos__pause" type="button" :aria-pressed="photosPaused" @click="togglePhotos">{{photosPaused?'播放患者照片':'暂停患者照片'}}</button>
              </div>
              <div v-if="showPhotos && sourceNode.id==='1407:28'" aria-hidden="true" class="home-story-scroll-spacer" :style="{top:`${storyScrollContent.height}px`,height:`${storyBottomInset}px`}" />
            </template>
          </HomeSourceNode>
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
.home-story-photos { position:absolute; inset:0; }
.home-story-photos__photo { position:absolute; inset:0; opacity:0; pointer-events:none; transition:opacity .5s cubic-bezier(.22,1,.36,1); }
.home-story-photos__photo.is-active { opacity:1; }
.home-story-photos__pause { position:absolute; right:8px; top:8px; border:0; border-radius:6px; padding:8px 12px; background:#1e3a5f; color:#fff; cursor:pointer; }
.home-story-photos__pause:not(:focus-visible) { width:1px; height:1px; padding:0; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
.home-story-scroll-spacer { position:absolute; left:0; width:100%; pointer-events:none; }
@media(prefers-reduced-motion:reduce) { .home-story-photos__photo { transition:none; } }
</style>
