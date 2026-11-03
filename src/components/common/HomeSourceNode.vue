<script lang="ts">
// All recursive instances must share one key so descendants use the same
// viewport readiness as their source root.
const IMAGE_READY = Symbol('home-source-image-ready')
const SOURCE_LOCALE_LAYOUT = Symbol('source-locale-layout')
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, inject, ref, watch, type Ref, type ComputedRef } from 'vue'
import { RouterLink } from 'vue-router'
import { alignSourceText, cancelSourceText } from '@/utils/sourceBaseline'
import PatientDesktopNavigation from '@/components/layout/PatientDesktopNavigation.vue'
import { publicContacts, publicContactText } from '@/data/publicContacts'
import { patientContactKey } from '@/composables/useWhatsAppContact'
import { useSiteCopy } from '@/i18n/siteCopy'
import { sourceLocaleLayout, clearSourceFontMeasurements } from '@/i18n/sourceLayout'

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
export interface HomeSourceAction { action?: string; href?: string; label?: string; labelValues?:Record<string,string|number> }
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
  /** Keep the Figma geometry in the DOM, but defer image requests until the
   * source root is close to the viewport. */
  deferImages?: boolean
  /** Independently defer these authored subtrees, preserving their geometry. */
  deferImageRoots?: string[]
  imagePreloadMargin?: string
}>()
const emit = defineEmits<{ activate: [action: string, event: MouseEvent]; layout: [height:number] }>()
defineSlots<{
  radar(props: { node: HomeSourceNodeData }): unknown
  cost(props: { node: HomeSourceNodeData }): unknown
  after(props: { node: HomeSourceNodeData }): unknown
}>()
const control = computed(() => props.actions?.[props.node.id])
const { tx, tf, localized } = useSiteCopy()
const patientContact = inject(patientContactKey, null)
const isWhatsApp = computed(() => control.value?.href === publicContacts.whatsappHref)
// Source wordmarks are artwork, matching the shared BrandLogo component.
// Translating them inside their locked logo shell breaks the mobile header.
const sourceBrandCopy=(text:string)=>text==='寰'||text==='寰宇云医'
const brandMark=props.node.type==='TEXT'&&sourceBrandCopy(props.node.text)
const textOverride = computed(() => {
  const override=props.texts?.[props.node.id] ?? publicContactText(props.node.text)
  const translated=brandMark?props.node.text:tx(override ?? props.node.text)
  return localized.value && translated!==props.node.text ? translated : override
})
const controlLabel = computed(() => {
  const label=publicContactText(control.value?.label || '') ?? control.value?.label
  if(!label || !control.value?.labelValues)return tx(label)
  return tf(label,Object.fromEntries(Object.entries(control.value.labelValues).map(([key,value])=>[key,typeof value==='string'?tx(value):value])))
})
const sourceAttributes = computed(() => Object.fromEntries(Object.entries(props.attributes?.[props.node.id]||{}).map(([key,value])=>[key,['aria-label','title','alt'].includes(key)?tx(value):value])))
const parentLocaleLayout = inject<ComputedRef<ReturnType<typeof sourceLocaleLayout>> | null>(SOURCE_LOCALE_LAYOUT,null)
const ownsLocaleLayout = props.root || !parentLocaleLayout
const fontRevision=ref(0)
// Sticky transforms and carousel opacity change during scrolling. They do not
// change text geometry and must not remeasure an entire source page each frame.
const localeStyleKey=computed(()=>JSON.stringify(Object.fromEntries(Object.entries(props.styles||{}).flatMap(([id,css])=>{
  const geometry=css.split(';').filter(rule=>/^\s*(?:left|top|width|height|display|overflow(?:-[xy])?|font(?:-[\w-]+)?|line-height|letter-spacing)\s*:/.test(rule)).join(';')
  return geometry?[[id,geometry]]:[]
}))))
const localeLayout = ownsLocaleLayout ? computed(() => {
  void fontRevision.value
  return localized.value ? sourceLocaleLayout(props.node, text=>sourceBrandCopy(text)?text:tx(publicContactText(text)??text), {texts:props.texts,hidden:props.hidden,styles:JSON.parse(localeStyleKey.value)}) : {styles:{},height:props.node.height}
}) : parentLocaleLayout!
if(ownsLocaleLayout) {
  provide(SOURCE_LOCALE_LAYOUT,localeLayout)
  onMounted(async()=>{await document.fonts.ready;clearSourceFontMeasurements();fontRevision.value++})
  watch(()=>localeLayout.value.height,height=>emit('layout',height),{immediate:true,flush:'post'})
}
// Source pages keep their own exact header shell/logo, but all desktop
// Navigation instances share route state and both dropdown interactions.
const desktopNavigationSource = props.node.name === 'Navigation' && props.node.width > 700
  && props.node.children.some(child => child.children.some(text => text.text === '首页'))
  && props.node.children.some(child => child.children.some(text => text.text === '中国医院'))
const wideNavigation = ref(typeof window === 'undefined' || window.innerWidth > 700)
const patientNavigation = computed(() => desktopNavigationSource && wideNavigation.value)
if (desktopNavigationSource) {
  const media = typeof window === 'undefined' ? undefined : window.matchMedia('(min-width:701px)')
  const update = () => { wideNavigation.value = Boolean(media?.matches) }
  onMounted(() => media?.addEventListener('change', update))
  onBeforeUnmount(() => media?.removeEventListener('change', update))
}
const fluidLayout = computed(() => !props.fixedRoots?.includes(props.node.id) && (props.fluid || props.flowRoots?.includes(props.node.id)))
const tag = computed(() => control.value?.href ? control.value.href.startsWith('/') ? RouterLink : 'a' : control.value?.action ? 'button' : props.node.type === 'TEXT' ? 'p' : 'div')
const linkAttributes = computed(() => !control.value?.href ? {} : control.value.href.startsWith('/') ? { to:control.value.href } : {
  href:isWhatsApp.value && patientContact ? patientContact.href(`footer-${props.node.id.replace(':', '-')}`) : control.value.href,
  ...(isWhatsApp.value ? { target:'_blank', rel:'noopener noreferrer', 'data-contact-entry':`footer-${props.node.id.replace(':', '-')}` } : {}),
})
// Facebook is a user-authorized contact addition. Keep the locked source
// hierarchy and WhatsApp hit area; append a sibling link in its existing row.
const facebookStyle = computed(() => {
  if (control.value?.href !== publicContacts.whatsappHref || !props.node.visible || props.hidden?.includes(props.node.id)) return
  const locate = (node: HomeSourceNodeData, x = 0, y = 0): { node: HomeSourceNodeData; x: number; y: number } | undefined => {
    if (node.type === 'TEXT' && node.text === 'WhatsApp') return { node, x, y }
    for (const child of node.children) {
      const found = locate(child, x + child.x, y + child.y)
      if (found) return found
    }
  }
  const text = locate(props.node)
  if (!text) return
  const typography = text.node.css.split(';').filter(value => /^\s*(?:color|font(?:-[\w-]+)?|line-height|letter-spacing):/.test(value)).join(';')
  // The injected link is a sibling of the source item in the parent source
  // tree. Include the item's authored position so the added contact stays
  // aligned with the source row at every nesting level.
  return `${typography};position:absolute;left:${props.node.x + text.x + text.node.width + 8}px;top:${props.node.y + text.y}px;`
})
const inheritedImageReady = inject<Ref<boolean> | null>(IMAGE_READY, null)
const ownsDeferredImages = Boolean(!inheritedImageReady && props.root && props.deferImages || props.deferImageRoots?.includes(props.node.id))
const imageReady = ownsDeferredImages ? ref(false) : inheritedImageReady ?? ref(!props.deferImages)
if (ownsDeferredImages) provide(IMAGE_READY, imageReady)
const imageElement = ref<HTMLElement | null>(null)
let imageObserver: IntersectionObserver | undefined
const style = computed(() => {
  const localization = !localized.value ? '' : fluidLayout.value
    ? props.node.type==='TEXT' ? 'max-width:100%;width:auto;height:auto;white-space:pre-wrap;overflow-wrap:anywhere;flex-shrink:1;' : 'max-width:100%;'
    : localeLayout.value.styles[props.node.id] || ''
  const authored = `${control.value ? 'font:inherit;text-align:inherit;border:0;background:transparent;' : ''}${fluidLayout.value ? props.node.layoutCss : props.node.css};${control.value ? 'text-decoration:none;cursor:pointer;appearance:none;' : ''}${props.styles?.[props.node.id] || ''};${localization}`
  // Replacing only url() leaves the copied dimensions, gradients, colors and
  // border geometry intact while the section is still outside the preload
  // window. The original CSS is restored as soon as it approaches the view.
  if (!authored.includes('url(')) return authored
  return imageReady.value ? authored : authored.replace(/url\([^)]*\)/g, 'none')
})
const sourceLines = ref<HTMLElement | null>(null)
const baselineOffsets = ref<number[]>([])
let alignmentRun = 0
async function alignSourceBaselines() {
  const run = ++alignmentRun
  if (localized.value || !props.baselineNodes?.includes(props.node.id) || !props.node.textLines?.some(line => line.baseline !== undefined)) return
  await nextTick()
  await document.fonts.ready
  if (run !== alignmentRun || !sourceLines.value?.isConnected) return
  // CSS line boxes round font metrics, while Figma stores fractional glyph
  // baselines. Measure the browser's actual baseline, then use the copied
  // native baseline; never estimate a text offset from a screenshot.
  alignSourceText({
    element: sourceLines.value,
    baselines: props.node.textLines.map(line => line.baseline),
    scale: props.baselineScale,
    current: () => run === alignmentRun,
    apply: offsets => { baselineOffsets.value = offsets },
  })
}
// Most source nodes are frames, images or text without native glyph
// baselines. Do not allocate watchers and mount hooks for those nodes.
const tracksBaselines = props.node.textLines?.some(line => line.baseline !== undefined)
if (tracksBaselines) {
  onMounted(alignSourceBaselines)
  watch([() => props.node, () => props.preserveTextLines, () => props.baselineScale, fluidLayout, textOverride], alignSourceBaselines, { flush:'post' })
}
if (ownsDeferredImages) onMounted(() => {
  if (imageReady.value || !imageElement.value) return
  imageObserver = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    imageReady.value = true
    imageObserver?.disconnect()
    imageObserver = undefined
  }, { rootMargin: props.imagePreloadMargin || '900px 0px' })
  imageObserver.observe(imageElement.value)
})
if (tracksBaselines || ownsDeferredImages) onBeforeUnmount(() => { alignmentRun++;cancelSourceText(sourceLines.value);imageObserver?.disconnect() })
</script>

<template>
  <PatientDesktopNavigation v-if="patientNavigation && node.visible && !hidden?.includes(node.id)" :source="node" :style="style" :data-figma-node="node.id" :data-figma-name="node.name" />
  <component ref="imageElement" :is="tag" v-else-if="node.visible && !hidden?.includes(node.id)" v-bind="{...linkAttributes,...sourceAttributes}" :data-figma-node="replica ? undefined : node.id" :data-figma-name="replica ? undefined : node.name" :data-source-brand="brandMark || undefined" :data-source-locale-height="ownsLocaleLayout && localized ? localeLayout.height : undefined" :data-source-images="root && deferImages || ownsDeferredImages ? imageReady ? 'loaded' : 'deferred' : undefined" :data-source-action="control?.action" :type="tag === 'button' ? 'button' : undefined" :aria-label="controlLabel" :style="style" :class="{ 'home-source-node--root': root, 'home-source-node--text':node.type==='TEXT' }" @click="control?.action && emit('activate', control.action, $event)">
    <img v-if="node.svg" :src="imageReady ? node.svg : undefined" :loading="deferImages ? 'lazy' : 'eager'" alt="" aria-hidden="true" draggable="false" />
    <img v-else-if="node.text === '\uf005'" class="home-source-node__font-awesome-glyph" :src="imageReady ? '/images/figma/doctor-review-star.svg' : undefined" :loading="deferImages ? 'lazy' : 'eager'" alt="" aria-hidden="true" draggable="false" />
    <template v-else-if="node.textLines && (preserveTextLines || !fluidLayout) && !textOverride"><span class="home-source-node__accessible-text">{{ node.text }}</span><span ref="sourceLines" aria-hidden="true"><span v-for="(line,index) in node.textLines" :key="index" :style="[line.css, { transform: `translateY(${baselineOffsets[index] || 0}px)` }]"><span v-for="(run,runIndex) in line.runs" :key="runIndex" :style="run.css">{{ run.text }}</span></span></span></template>
    <template v-else-if="node.textParagraphs && !textOverride"><span v-for="(paragraph,index) in node.textParagraphs" :key="index" :style="paragraph.css"><span v-for="(run,runIndex) in paragraph.runs" :key="runIndex" :style="run.css">{{ run.text }}</span></span></template>
    <template v-else-if="node.textRuns && !textOverride"><span v-for="(run,index) in node.textRuns" :key="index" :style="run.css">{{ run.text }}</span></template>
    <template v-else-if="node.text">{{ textOverride ?? node.text }}</template>
    <slot v-if="node.chart === 'radar'" name="radar" :node="node" />
    <slot v-if="node.chart === 'cost'" name="cost" :node="node" />
    <HomeSourceNode v-for="child in node.children" :key="child.id" :node="child" :fluid="Boolean(fluidLayout)" :flow-roots="flowRoots" :fixed-roots="fixedRoots" :baseline-nodes="baselineNodes" :baseline-scale="baselineScale" :preserve-text-lines="preserveTextLines" :actions="actions" :texts="texts" :styles="styles" :hidden="hidden" :attributes="attributes" :replica="replica" :defer-images="deferImages" :defer-image-roots="deferImageRoots" :image-preload-margin="imagePreloadMargin" @activate="(action, event) => emit('activate', action, event)">
      <template #radar="slotProps"><slot name="radar" v-bind="slotProps" /></template>
      <template #cost="slotProps"><slot name="cost" v-bind="slotProps" /></template>
      <template #after="slotProps"><slot name="after" v-bind="slotProps" /></template>
    </HomeSourceNode>
    <slot name="after" :node="node" />
  </component>
  <a v-if="facebookStyle" class="home-source-node__facebook" :style="facebookStyle" :href="publicContacts.facebookHref" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
</template>

<style scoped>
[data-figma-node] { font-synthesis:none; }
img { display:block; width:100%; height:auto; max-width:none; }
.home-source-node--root { position:relative!important; left:0!important; top:0!important; }
.home-source-node__accessible-text { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:pre; }
.home-source-node__font-awesome-glyph { width:100%!important; height:100%!important; object-fit:fill; }
.home-source-node__facebook { display:block; width:max-content; margin:0; padding:0; text-decoration:none; white-space:nowrap; }
.home-source-node__facebook:hover { text-decoration:underline; }
.home-source-node__facebook:focus-visible { outline:2px solid currentColor; outline-offset:3px; }
</style>
