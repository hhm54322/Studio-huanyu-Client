<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HomeSourceNode, { type HomeSourceNodeData, type HomeSourceAction } from './HomeSourceNode.vue'
import { homeDesktopNodes as desktop, homeMobileNodes as mobile } from '@/data/homeFigmaSource'

const props = defineProps<{ desktopId: string; mobileId?: string; label: string; actions?:Record<string, HomeSourceAction>; texts?:Record<string,string>; styles?:Record<string,string>; hidden?:string[]; attributes?:Record<string,Record<string,string|number|boolean>>; fixedMobile?:boolean; flowRoots?:string[]; contentHeightId?:string; baselineNodes?:string[] }>()
const emit = defineEmits<{ activate: [action: string, event: MouseEvent] }>()
const width = ref(typeof window === 'undefined' ? 1440 : window.innerWidth)
const canvas = ref<HTMLElement | null>(null)
const contentDelta = ref(0)
let heightObserver: ResizeObserver | undefined
function resize() { width.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', resize, { passive:true }))
onBeforeUnmount(() => { window.removeEventListener('resize', resize); heightObserver?.disconnect() })
const isMobile = computed(() => width.value <= 700 && props.mobileId)
const node = computed(() => (isMobile.value ? mobile.get(props.mobileId!) : desktop.get(props.desktopId))!)
const scale = computed(() => isMobile.value ? 1 : Math.min(1, width.value / 1440))
const contentHeight = computed(() => node.value.height + contentDelta.value)
watch([canvas, () => props.contentHeightId, node], async () => {
  heightObserver?.disconnect()
  contentDelta.value = 0
  await nextTick()
  if (!props.contentHeightId || !canvas.value) return
  const child = canvas.value.querySelector<HTMLElement>(`[data-figma-node="${props.contentHeightId}"]`)
  const original = desktop.get(props.contentHeightId) || mobile.get(props.contentHeightId)
  if (!child || !original) return
  heightObserver = new ResizeObserver(() => { contentDelta.value = child.offsetHeight - original.height })
  heightObserver.observe(child)
}, { flush:'post' })
const sourceStyles = computed(() => props.contentHeightId ? { ...props.styles, [node.value.id]:`${props.styles?.[node.value.id] || ''}height:${contentHeight.value}px;` } : props.styles)
const sectionStyle = computed(() => ({
  ...(!isMobile.value || props.fixedMobile ? { height:`${contentHeight.value * scale.value}px` } : {}),
  background: node.value.css.match(/(?:^|\n)background:\s*([^;]+);/)?.[1] || '#fff',
}))
</script>

<template>
  <section class="home-figma-section" :class="{ 'home-figma-section--mobile': isMobile }" :aria-label="label" :style="sectionStyle">
    <div ref="canvas" class="home-figma-section__canvas" :style="isMobile ? undefined : { width: `${node.width}px`, height: `${contentHeight}px`, transform: `translateX(-50%) scale(${scale})` }">
      <HomeSourceNode :node="node" :fluid="Boolean(isMobile) && !fixedMobile" :flow-roots="flowRoots" :baseline-nodes="baselineNodes" :preserve-text-lines="Boolean(isMobile) && width === node.width" :actions="actions" :texts="texts" :styles="sourceStyles" :hidden="hidden" :attributes="attributes" root @activate="(action, event) => emit('activate', action, event)">
        <template #radar="slotProps"><slot name="radar" v-bind="slotProps" /></template>
        <template #cost="slotProps"><slot name="cost" v-bind="slotProps" /></template>
        <template #after="slotProps"><slot name="after" v-bind="slotProps" /></template>
      </HomeSourceNode>
    </div>
  </section>
</template>

<style scoped>
@import url('/fonts/home-source-fonts.css');
.home-figma-section { position:relative; width:100%; overflow:clip; background:#fff; }
.home-figma-section__canvas { position:absolute; top:0; left:50%; transform-origin:top center; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.home-figma-section--mobile .home-figma-section__canvas { position:relative; left:0; width:100%; transform:none; }
.home-figma-section--mobile :deep(.home-source-node--root) { width:100%!important; }
.home-figma-section--mobile :deep([data-figma-node="1528:181"]),
.home-figma-section--mobile :deep([data-figma-node="1528:182"]),
.home-figma-section--mobile :deep([data-figma-node="1528:183"]) { width:calc((100% - 61px)/3 - 46px)!important; }
.home-figma-section--mobile :deep([data-figma-node="1528:182"]) { left:calc(54px + (100% - 61px)/3)!important; }
.home-figma-section--mobile :deep([data-figma-node="1528:183"]) { left:calc(54px + (100% - 61px)*2/3)!important; }
/* These masks are horizontal reading viewports in the mobile Figma, not
   scaled-down desktop grids. Keep authored card sizes and expose the rest
   through native touch/keyboard scrolling. */
.home-figma-section--mobile :deep([data-figma-node="1528:191"]),
.home-figma-section--mobile :deep([data-figma-node="1528:323"]),
.home-figma-section--mobile :deep([data-figma-node="1528:395"]),
.home-figma-section--mobile :deep([data-figma-node="1528:416"]),
.home-figma-section--mobile :deep([data-figma-node="1528:625"]),
.home-figma-section--mobile :deep([data-figma-node="1528:660"]) {
  width:100%!important; max-width:100%; overflow-x:auto!important; overflow-y:hidden!important;
  overscroll-behavior-x:contain; scroll-snap-type:x proximity; scroll-padding-inline:16px; scrollbar-width:none;
}
.home-figma-section--mobile :deep([data-figma-node="1528:193"]),
.home-figma-section--mobile :deep([data-figma-node="1528:325"]),
.home-figma-section--mobile :deep([data-figma-node="1528:397"]),
.home-figma-section--mobile :deep([data-figma-node="1528:627"]),
.home-figma-section--mobile :deep([data-figma-node="1528:662"]) {
  position:relative!important; top:0!important; left:0!important; display:flex!important;
  width:max-content!important; height:100%!important; padding:0!important; gap:12px!important;
}
.home-figma-section--mobile :deep([data-figma-node="1528:193"]),
.home-figma-section--mobile :deep([data-figma-node="1528:325"]),
.home-figma-section--mobile :deep([data-figma-node="1528:397"]),
.home-figma-section--mobile :deep([data-figma-node="1528:662"]) { padding:0 16px!important; }
.home-figma-section--mobile :deep([data-figma-node="1528:625"]) { width:calc(100% + 32px)!important; max-width:none; }
.home-figma-section--mobile :deep([data-figma-node="1528:627"]) { top:-1px!important; height:238px!important; }
.home-figma-section--mobile :deep([data-figma-node="1528:662"]) { top:-.09961px!important; }
.home-figma-section--mobile :deep([data-figma-node="1528:193"] > *),
.home-figma-section--mobile :deep([data-figma-node="1528:325"] > *),
.home-figma-section--mobile :deep([data-figma-node="1528:397"] > *),
.home-figma-section--mobile :deep([data-figma-node="1528:627"] > *),
.home-figma-section--mobile :deep([data-figma-node="1528:662"] > *) { scroll-snap-align:start; }
.home-figma-section--mobile :deep([data-figma-node="1528:419"]),
.home-figma-section--mobile :deep([data-figma-node="1528:424"]) { scroll-snap-align:start; }
.home-figma-section--mobile :deep([data-figma-node="1528:240"]) { width:100%!important; overflow-y:auto!important; overscroll-behavior-y:contain; }
.home-figma-section--mobile :deep([data-figma-node="1528:251"]) { display:none!important; }
.home-figma-section--mobile :deep([data-figma-node="1528:239"])::after {
  content:""; position:absolute; inset:0; z-index:1; pointer-events:none;
  border:6px solid #e4ebfa; border-radius:24px;
}
@media (max-width:374px) {
  /* Below the authored 375px width, keep readable text instead of clipping the
     source's single-line boxes. Horizontal card tracks keep their card widths. */
  .home-figma-section--mobile :deep(.home-source-node--text) { max-width:100%!important; white-space:pre-wrap!important; overflow-wrap:anywhere; height:auto!important; }
  .home-figma-section--mobile :deep([data-figma-node="1528:134"]) { width:100%!important; }
  .home-figma-section--mobile :deep([data-figma-node="1528:135"]) { width:calc(100% - 48px)!important; }
  .home-figma-section--mobile :deep([data-figma-node="1528:136"]) { width:100%!important; }
  .home-figma-section--mobile :deep([data-figma-node="1528:138"]) { width:calc(100% - 36px)!important; }
  .home-figma-section--mobile :deep([data-figma-node="1528:141"]) { width:100%!important; text-align:center; }
  .home-figma-section--mobile :deep([data-figma-node="1528:150"]),
  .home-figma-section--mobile :deep([data-figma-node="1528:151"]) { width:max-content!important; }
}
</style>
