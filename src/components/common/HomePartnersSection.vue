<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import HomeFigmaSection from './HomeFigmaSection.vue'
import HomeSourceNode from './HomeSourceNode.vue'
import { homeDesktopNodes, homeMobileNodes } from '@/data/homeFigmaSource'

const root=ref<HTMLElement|null>(null)
const visible=ref(false)
const documentVisible=ref(true)
const touching=ref(false)
let observer:IntersectionObserver|undefined
function visibility(){documentVisible.value=!document.hidden}
onMounted(()=>{
  visibility()
  observer=new IntersectionObserver(entries=>{visible.value=Boolean(entries[0]?.isIntersecting)})
  if(root.value)observer.observe(root.value)
  document.addEventListener('visibilitychange',visibility)
})
onBeforeUnmount(()=>{observer?.disconnect();document.removeEventListener('visibilitychange',visibility)})
const desktopTrack=homeDesktopNodes.get('1412:6502')!
const mobileTrack=homeMobileNodes.get('1528:767')!
const desktopCycle=desktopTrack.width+24
const mobileCycle=mobileTrack.width+24*mobileTrack.height/desktopTrack.height
const loopStyle={'--partner-desktop-cycle':`${desktopCycle}px`,'--partner-mobile-cycle':`${mobileCycle}px`,'--partner-desktop-copy-left':`${desktopTrack.x+desktopCycle}px`,'--partner-mobile-copy-left':`${mobileTrack.x+mobileCycle}px`}
</script>

<template>
  <div ref="root" class="home-partners-source" :style="loopStyle" :class="{'is-paused':!visible||!documentVisible||touching}" tabindex="0" aria-label="合作伙伴，悬停或聚焦暂停滚动" @touchstart.passive="touching=true" @touchend.passive="touching=false" @touchcancel.passive="touching=false">
    <HomeFigmaSection desktop-id="1412:6495" mobile-id="1528:762" label="合作伙伴">
      <template #after="{node}">
        <div v-if="node.id==='1412:6501'" class="home-partners-source__copy home-partners-source__copy--desktop" aria-hidden="true" inert><HomeSourceNode :node="desktopTrack" root replica /></div>
        <div v-if="node.id==='1528:766'" class="home-partners-source__copy home-partners-source__copy--mobile" aria-hidden="true" inert><HomeSourceNode :node="mobileTrack" root replica /></div>
      </template>
    </HomeFigmaSection>
  </div>
</template>

<style scoped>
.home-partners-source { position:relative; outline-offset:-4px; }
.home-partners-source :deep([data-figma-node="1412:6501"]),.home-partners-source :deep([data-figma-node="1528:766"]) { overflow:hidden!important; }
.home-partners-source :deep([data-figma-node="1412:6502"]),.home-partners-source__copy--desktop { --partner-cycle:var(--partner-desktop-cycle); animation:home-partner-source-loop 120s linear infinite; }
.home-partners-source :deep([data-figma-node="1528:767"]),.home-partners-source__copy--mobile { --partner-cycle:var(--partner-mobile-cycle); animation:home-partner-source-loop 90s linear infinite; }
.home-partners-source__copy { position:absolute; top:0; pointer-events:none; }
.home-partners-source__copy--desktop { left:var(--partner-desktop-copy-left); width:3546px; height:472px; }
.home-partners-source__copy--mobile { left:var(--partner-mobile-copy-left); width:1653.43115px; height:220px; }
.home-partners-source :deep([data-figma-node="1528:769"]),.home-partners-source :deep([data-figma-node="1528:770"]) { z-index:2; pointer-events:none; }
.home-partners-source :deep([data-figma-node="1528:770"]) { left:100%!important; }
.home-partners-source.is-paused :deep([data-figma-node="1412:6502"]),.home-partners-source.is-paused :deep([data-figma-node="1528:767"]),.home-partners-source.is-paused .home-partners-source__copy,
.home-partners-source:hover :deep([data-figma-node="1412:6502"]),.home-partners-source:hover :deep([data-figma-node="1528:767"]),.home-partners-source:hover .home-partners-source__copy,
.home-partners-source:focus-within :deep([data-figma-node="1412:6502"]),.home-partners-source:focus-within :deep([data-figma-node="1528:767"]),.home-partners-source:focus-within .home-partners-source__copy { animation-play-state:paused; }
@keyframes home-partner-source-loop { to { transform:translate3d(calc(-1 * var(--partner-cycle)),0,0); } }
@media(prefers-reduced-motion:reduce) { .home-partners-source :deep([data-figma-node="1412:6502"]),.home-partners-source :deep([data-figma-node="1528:767"]),.home-partners-source__copy { animation:none; } }
</style>
