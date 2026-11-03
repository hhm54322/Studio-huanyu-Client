<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HomeSourceNode, { type HomeSourceNodeData } from './HomeSourceNode.vue'
import { trustArticleSource } from '@/data/trustArticleSource'
import templateModel from '../../../docs/figma-source/trust-content-revision/trust/dialog-model-2026-10-21.json'

const props = withDefaults(defineProps<{ article?: 'jci' | 'cost' | 'doctor' | 'medicine' | 'infection' | 'rights' | 'privacy' | 'muslim' }>(), { article: 'jci' })
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const closing = ref(false)
function descendants(node: HomeSourceNodeData): HomeSourceNodeData[] { return [node, ...node.children.flatMap(descendants)] }
const articleSource = computed(() => trustArticleSource(props.article))
const model = templateModel
const root = computed(() => articleSource.value.root)
const title = computed(() => articleSource.value.title)
const dialogId = computed(() => props.article === 'jci' ? 'jci-truth-dialog' : `trust-${props.article}-dialog`)
const baselineNodes = computed(() => descendants(root.value).filter(node => node.textLines).map(node => node.id))
const actions = computed(() => ({ [model.close]: { action: 'close', label: `关闭${title.value}` } }))
const attributes: Record<string, Record<string, string | number | boolean>> = {
  [model.title]: { id: 'jci-source-title', role: 'heading', 'aria-level': 2 },
  [model.description]: { id: 'jci-source-description' },
}
const frameStyle = computed(() => ({ width: `${model.width}px`, height: props.article === 'jci' ? `${model.height}px` : 'auto' }))
let trigger: HTMLElement | null = null
let oldOverflow = '', oldScrollBehavior = '', scrollPosition = 0
let openingFrame = 0
function outside(event: MouseEvent) {
  if (event.target === dialog.value || event.target instanceof HTMLElement && event.target.hasAttribute('data-trust-source-overlay')) void requestClose()
}
async function requestClose() {
  if (closing.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { emit('close'); return }
  closing.value = true
  await nextTick()
  const frame = dialog.value?.querySelector('.trust-source-dialog__frame')
  if (frame) {
    const animation = frame.animate(
      [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(8px)' }],
      { duration: 200, easing: 'ease', fill: 'both' },
    )
    await animation.finished.catch(() => {})
  }
  emit('close')
}
function keydown(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !dialog.value) return
  const buttons = Array.from(dialog.value.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'))
  const first = buttons[0], last = buttons[buttons.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus({ preventScroll: true }) }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus({ preventScroll: true }) }
}
onMounted(async () => {
  trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
  oldOverflow = document.body.style.overflow
  oldScrollBehavior = document.documentElement.style.scrollBehavior
  scrollPosition = window.scrollY
  // showModal's automatic focus can start the document's smooth scrolling.
  // Stop it before locking the background, then keep the opening position.
  document.documentElement.style.scrollBehavior = 'auto'
  window.scrollTo({ top: scrollPosition, behavior: 'instant' })
  document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
  window.scrollTo({ top: scrollPosition, behavior: 'instant' })
  await nextTick()
  dialog.value?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
  // Native modal focus can finish scrolling after an async component's first
  // layout. Keep the captured background position through that first frame.
  openingFrame = requestAnimationFrame(() => {
    openingFrame = 0
    if (window.scrollY !== scrollPosition) window.scrollTo({ top: scrollPosition, behavior: 'instant' })
  })
})
onBeforeUnmount(() => {
  if (openingFrame) cancelAnimationFrame(openingFrame)
  dialog.value?.close()
  document.body.style.overflow = oldOverflow
  trigger?.focus({ preventScroll: true })
  if (window.scrollY !== scrollPosition) window.scrollTo({ top: scrollPosition, behavior: 'instant' })
  document.documentElement.style.scrollBehavior = oldScrollBehavior
})
</script>

<template>
  <Teleport to="body">
    <dialog :id="dialogId" ref="dialog" class="trust-source-dialog" :class="{ 'is-closing': closing }" :data-figma-node="model.frame" :data-article-source="articleSource.articleFrame" aria-labelledby="jci-source-title" aria-describedby="jci-source-description" @cancel.prevent="requestClose" @keydown="keydown" @click="outside">
      <div class="trust-source-dialog__overlay" data-trust-source-overlay :data-figma-node="model.overlay">
        <div class="trust-source-dialog__frame" :style="frameStyle">
          <HomeSourceNode :node="root" root :actions="actions" :attributes="attributes" :baseline-nodes="baselineNodes" @activate="requestClose" />
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.trust-source-dialog { position:fixed; inset:0; width:100%; max-width:none; height:100%; max-height:none; padding:0; border:0; margin:0; overflow:auto; overscroll-behavior:contain; background:transparent; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.trust-source-dialog::backdrop { background:rgba(0,0,0,.5); backdrop-filter:blur(4px); }
.trust-source-dialog__overlay { display:flex; flex-direction:column; align-items:center; min-height:100%; padding:40px 0; }
.trust-source-dialog__frame { position:relative; flex:none; margin:auto; }
.trust-source-dialog :deep(button:focus-visible) { outline:2px solid #2563eb; outline-offset:2px; }
.trust-source-dialog :deep([data-figma-node="143:4210"]) { z-index:3; pointer-events:auto; }
.trust-source-dialog :deep(button) { transition:background-color 180ms ease; }
.trust-source-dialog :deep(button:hover) { background-color:#f5f6f8!important; }
@media (prefers-reduced-motion:no-preference) {
  .trust-source-dialog__frame { animation:trust-article-in 320ms cubic-bezier(.22,1,.36,1) both; }
  .trust-source-dialog::backdrop { animation:trust-shade-in 250ms ease both; }
  .trust-source-dialog.is-closing::backdrop { animation:trust-shade-out 200ms ease both; }
}
@keyframes trust-article-in { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes trust-shade-in { from { opacity:0; } to { opacity:1; } }
@keyframes trust-shade-out { from { opacity:1; } to { opacity:0; } }
@media (prefers-reduced-motion:reduce) { .trust-source-dialog :deep(button) { transition:none; } }
</style>
