<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HospitalFigmaCanvas from './HospitalFigmaCanvas.vue'
import { articleControls, contentArticleRoot, contentDescendants } from '@/data/contentFigmaSource'
const props = defineProps<{ source: string; width: number; article?: string }>()
const container = ref<HTMLElement | null>(null)
const sidebarOffset = ref(0)
const controls = computed(() => articleControls(props.source, props.article))
const model = computed(() => {
  const root = contentArticleRoot(props.source, props.article)
  const sidebar = contentDescendants(root).find(n => n.id === '143:3082')
  const layout = contentDescendants(root).find(n => n.id === '143:3061')
  return { root, sidebar, layout }
})
const styles = computed(() => model.value.sidebar ? { [model.value.sidebar.id]: `transform:translateY(${sidebarOffset.value}px);will-change:transform;` } : {})
let frame = 0
function updateSidebar() {
  frame = 0
  const { sidebar, layout } = model.value
  if (!sidebar || !layout || !container.value) return
  const scale = Math.min(1, props.width / model.value.root.width)
  const pageTop = container.value.getBoundingClientRect().top
  const desired = (24 - pageTop) / scale - layout.y
  sidebarOffset.value = Math.max(0, Math.min(layout.height - sidebar.height, desired))
}
function requestSidebar() {
  if (!frame) frame = requestAnimationFrame(updateSidebar)
}
function activate(action: string) {
  if (action === 'consultation') window.dispatchEvent(new CustomEvent('open-consultation'))
}
watch(() => props.article, () => { sidebarOffset.value = 0; requestSidebar() }, { flush: 'post' })
onMounted(() => {
  window.addEventListener('scroll', requestSidebar, { passive: true })
  window.addEventListener('resize', requestSidebar, { passive: true })
  updateSidebar()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', requestSidebar)
  window.removeEventListener('resize', requestSidebar)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="container" class="content-article" :data-article-source="source" :data-toolkit-article="article || 'translation'">
    <HospitalFigmaCanvas :node="model.root" :width="width" :actions="controls.actions" :attributes="controls.attributes" :styles="styles" @activate="activate" />
  </div>
</template>

<style scoped>
.content-article { width: 100%; }
.content-article :deep([data-content-entry]) { animation: content-enter 620ms cubic-bezier(.22,1,.36,1) both; }
.content-article :deep(a),.content-article :deep(button) { transition: filter 220ms ease, color 220ms ease; }
.content-article :deep(a:hover),.content-article :deep(button:hover) { filter: brightness(1.12); }
.content-article :deep([aria-disabled="true"]) { cursor:default; }
@keyframes content-enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion:reduce) {
  .content-article :deep([data-content-entry]) { animation:none; }
  .content-article :deep(a),.content-article :deep(button) { transition:none; }
}
</style>
