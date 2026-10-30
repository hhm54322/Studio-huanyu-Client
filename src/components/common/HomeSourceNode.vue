<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
export interface HomeSourceNodeData {
  id: string
  name: string
  type: string
  width: number
  height: number
  x: number
  y: number
  visible: boolean
  css: string
  layoutCss?: string
  text: string
  textRuns?: { text:string; css:string }[]
  textParagraphs?: { runs:{text:string;css:string}[];css:string }[]
  textLines?: { runs:{text:string;css:string}[];css:string;baseline?:number }[]
  svg?: string
  chart?: string
  children: HomeSourceNodeData[]
}
export interface HomeSourceAction { action?: string; href?: string; label?: string }
const props = defineProps<{
  node: HomeSourceNodeData; root?: boolean; fluid?: boolean
  actions?: Record<string, HomeSourceAction>
  texts?: Record<string, string>
  styles?: Record<string, string>
  hidden?: string[]
  attributes?: Record<string, Record<string, string | number | boolean>>
  flowRoots?: string[]
  fixedRoots?: string[]
  baselineNodes?: string[]
  baselineScale?: number
  preserveTextLines?: boolean
  replica?: boolean
}>()
const emit = defineEmits<{ activate: [action: string, event: MouseEvent] }>()
defineSlots<{
  radar(props: { node: HomeSourceNodeData }): unknown
  cost(props: { node: HomeSourceNodeData }): unknown
  after(props: { node: HomeSourceNodeData }): unknown
}>()
const control = computed(() => props.actions?.[props.node.id])
const fluidLayout = computed(() => !props.fixedRoots?.includes(props.node.id) && (props.fluid || props.flowRoots?.includes(props.node.id)))
const tag = computed(() => control.value?.href ? control.value.href.startsWith('/') ? RouterLink : 'a' : control.value?.action ? 'button' : props.node.type === 'TEXT' ? 'p' : 'div')
const linkAttributes = computed(() => !control.value?.href ? {} : control.value.href.startsWith('/') ? { to:control.value.href } : { href:control.value.href })
const style = computed(() => `${control.value ? 'font:inherit;text-align:inherit;border:0;background:transparent;' : ''}${fluidLayout.value ? props.node.layoutCss : props.node.css};${control.value ? 'text-decoration:none;cursor:pointer;appearance:none;' : ''}${props.styles?.[props.node.id] || ''}`)
const sourceLines = ref<HTMLElement | null>(null)
const baselineOffsets = ref<number[]>([])
let alignmentRun = 0
async function alignSourceBaselines() {
  const run = ++alignmentRun
  if (!props.baselineNodes?.includes(props.node.id) || !props.node.textLines?.some(line => line.baseline !== undefined)) return
  await nextTick()
  await document.fonts.ready
  if (run !== alignmentRun || !sourceLines.value?.isConnected) return
  // CSS line boxes round font metrics, while Figma stores fractional glyph
  // baselines. Measure the browser's actual baseline, then use the copied
  // native baseline; never estimate a text offset from a screenshot.
  baselineOffsets.value = Array.from(sourceLines.value.children).map((element, index) => {
    const expected = props.node.textLines?.[index]?.baseline
    if (expected === undefined) return 0
    const marker = document.createElement('span')
    marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;'
    element.append(marker)
    const actual = marker.getBoundingClientRect().top - element.getBoundingClientRect().top
    const unscaledHeight = (element as HTMLElement).offsetHeight
    const scale = props.baselineScale ?? (unscaledHeight ? element.getBoundingClientRect().height / unscaledHeight : 1)
    marker.remove()
    return expected - actual / (scale || 1)
  })
}
onMounted(alignSourceBaselines)
watch([() => props.node, () => props.preserveTextLines, () => props.baselineScale, fluidLayout, () => props.texts?.[props.node.id]], alignSourceBaselines, { flush:'post' })
</script>

<template>
  <component :is="tag" v-if="node.visible && !hidden?.includes(node.id)" v-bind="{...linkAttributes,...attributes?.[node.id]}" :data-figma-node="replica ? undefined : node.id" :data-figma-name="replica ? undefined : node.name" :type="tag === 'button' ? 'button' : undefined" :aria-label="control?.label" :style="style" :class="{ 'home-source-node--root': root, 'home-source-node--text':node.type==='TEXT' }" @click="control?.action && emit('activate', control.action, $event)">
    <img v-if="node.svg" :src="node.svg" alt="" aria-hidden="true" draggable="false" />
    <img v-else-if="node.text === '\uf005'" class="home-source-node__font-awesome-glyph" src="/images/figma/doctor-review-star.svg" alt="" aria-hidden="true" draggable="false" />
    <template v-else-if="node.textLines && (preserveTextLines || !fluidLayout) && !texts?.[node.id]"><span class="home-source-node__accessible-text">{{ node.text }}</span><span ref="sourceLines" aria-hidden="true"><span v-for="(line,index) in node.textLines" :key="index" :style="[line.css, { transform: `translateY(${baselineOffsets[index] || 0}px)` }]"><span v-for="(run,runIndex) in line.runs" :key="runIndex" :style="run.css">{{ run.text }}</span></span></span></template>
    <template v-else-if="node.textParagraphs && !texts?.[node.id]"><span v-for="(paragraph,index) in node.textParagraphs" :key="index" :style="paragraph.css"><span v-for="(run,runIndex) in paragraph.runs" :key="runIndex" :style="run.css">{{ run.text }}</span></span></template>
    <template v-else-if="node.textRuns && !texts?.[node.id]"><span v-for="(run,index) in node.textRuns" :key="index" :style="run.css">{{ run.text }}</span></template>
    <template v-else-if="node.text">{{ texts?.[node.id] ?? node.text }}</template>
    <slot v-if="node.chart === 'radar'" name="radar" :node="node" />
    <slot v-if="node.chart === 'cost'" name="cost" :node="node" />
    <HomeSourceNode v-for="child in node.children" :key="child.id" :node="child" :fluid="Boolean(fluidLayout)" :flow-roots="flowRoots" :fixed-roots="fixedRoots" :baseline-nodes="baselineNodes" :baseline-scale="baselineScale" :preserve-text-lines="preserveTextLines" :actions="actions" :texts="texts" :styles="styles" :hidden="hidden" :attributes="attributes" :replica="replica" @activate="(action, event) => emit('activate', action, event)">
      <template #radar="slotProps"><slot name="radar" v-bind="slotProps" /></template>
      <template #cost="slotProps"><slot name="cost" v-bind="slotProps" /></template>
      <template #after="slotProps"><slot name="after" v-bind="slotProps" /></template>
    </HomeSourceNode>
    <slot name="after" :node="node" />
  </component>
</template>

<style scoped>
[data-figma-node] { font-synthesis:none; }
img { display:block; width:100%; height:auto; max-width:none; }
.home-source-node--root { position:relative!important; left:0!important; top:0!important; }
.home-source-node__accessible-text { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:pre; }
.home-source-node__font-awesome-glyph { width:100%!important; height:100%!important; object-fit:fill; }
</style>
