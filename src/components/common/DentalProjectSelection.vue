<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DentalSourceCanvas from './DentalSourceCanvas.vue'
import AccordionPanel from './AccordionPanel.vue'
import HomeSourceNode, { type HomeSourceAction, type HomeSourceNodeData } from './HomeSourceNode.vue'
import snapshot from '../../../docs/figma-source/november-revision-2026-11-23/project/source-tree-2026-11-23.json'
import { useSiteCopy } from '@/i18n/siteCopy'
import { publicContacts, sourceContactEmail } from '@/data/publicContacts'
import { figmaFullBleedStyles } from '@/utils/figmaFullBleed'
import { sourceAtOrigin } from '@/utils/sourceAtOrigin'
import { useDentalStepConnectors } from '@/composables/useDentalStepConnectors'

const props = defineProps<{
  width: number
  selectedProject: string
  expandedProjects: Set<string>
  projects: { id: string; title: string; price: string; suitable: string; detail: string; duration: string; note?: string }[]
  busy: boolean
  compact?: boolean
}>()
const emit = defineEmits<{ step: [step: 1 | 2 | 3]; project: [id: string] }>()
const { tx, localized } = useSiteCopy()
const { t } = useI18n()
const router = useRouter()
// Several source cards contain the same chevron as differently transformed
// vector sublayers. Use the authored 14 × 14 down-chevron export for each
// card so that every expanded/collapsed state renders consistently.
const source: HomeSourceNodeData = structuredClone(snapshot.root)
const projectArrowIds = new Set([5718, 5740, 5757, 5774, 5790, 5808, 5826, 5843].map(id => `4542:${id}`))
function normalizeProjectArrows(parent: HomeSourceNodeData) {
  for (const child of parent.children) {
    if (projectArrowIds.has(child.id)) {
      child.svg = '/images/figma/dental-project-2026-11-23/node-4542-5757.svg'
      child.children = []
      child.css += `;left:${parent.width - child.width}px;top:${parent.height - child.height}px;transform:none;transform-origin:center;`
    } else normalizeProjectArrows(child)
  }
}
normalizeProjectArrows(source)
const nodes = new Map<string, HomeSourceNodeData>()
function index(node: HomeSourceNodeData) {
  nodes.set(node.id, node)
  node.children.forEach(index)
}
index(source)
const node = (id: number) => nodes.get(`4542:${id}`)!
const compactMetrics = [[5530, 5532, 5533], [5534, 5536, 5537], [5538, 5539, 5543], [5544, 5546, 5552]]
const compactScan = sourceAtOrigin(node(5567))
const scanMask = '/images/figma/dental-project-2026-11-23/mask-4542-5636.svg'
const gumStrokes = [[5568, 27.900001525878906], [5569, 13.950000762939453], [5570, 2.682692527770996]] as const
const compactScale = computed(() => Math.min(.76, (props.width - 46) / 690))
const cards = [
  { card: 5702, content: 5707, toggle: 5715, arrow: 5718, icon: 5703, title: 5709, price: 5713, summary: 5714 },
  { card: 5725, content: 5731, toggle: 5737, arrow: 5740, icon: 5726, title: 5733, price: 5735, summary: 5736 },
  { card: 5742, content: 5748, toggle: 5754, arrow: 5757, icon: 5743, title: 5750, price: 5752, summary: 5753 },
  { card: 5759, content: 5765, toggle: 5771, arrow: 5774, icon: 5760, title: 5767, price: 5769, summary: 5770 },
  { card: 5776, content: 5781, toggle: 5787, arrow: 5790, icon: 5777, title: 5783, price: 5785, summary: 5786 },
  { card: 5792, content: 5799, toggle: 5805, arrow: 5808, icon: 5793, title: 5801, price: 5803, summary: 5804 },
  { card: 5810, content: 5817, toggle: 5823, arrow: 5826, icon: 5811, title: 5819, price: 5821, summary: 5822 },
  { card: 5828, content: 5834, toggle: 5840, arrow: 5843, icon: 5829, title: 5836, price: 5838, summary: 5839 },
] as const
const action = node(5846)
const headings = {
  [node(5525).id]: 'h1',
  [node(5682).id]: 'h2',
  ...Object.fromEntries([5709, 5733, 5750, 5767, 5783, 5801, 5819, 5836].map(id => [node(id).id, 'h3' as const])),
} as const
const floatingAction = sourceAtOrigin(action)
const footer = node(5851)
const afterButton = node(5528).height - (node(5676).y + node(5676).height)
const rowGap = node(5759).y - node(5702).height
const selectedPaint = node(5725).css.split('\n').filter(line => /^(?:background|border:|box-shadow)/.test(line)).join('')
const restingPaint = node(5702).css.split('\n').filter(line => /^(?:background|border:|box-shadow)/.test(line)).join('')
const detailHeights = ref<Record<string, number>>({})
const localizedGrid = ref<HTMLElement>()
const localizedGridHeight = ref(0)
let localizedGridObserver: ResizeObserver | undefined
watch(localizedGrid, element => {
  localizedGridObserver?.disconnect()
  if (!element) return
  const measure = () => { const height = element.offsetHeight; if (height > 0) localizedGridHeight.value = height }
  localizedGridObserver = new ResizeObserver(measure)
  localizedGridObserver.observe(element)
  measure()
}, { flush: 'post' })
const projectLayout = computed(() => {
  const heights = cards.map(({ card }, index) => {
    const rest = node(card).height - (index === 0 ? node(5720).height : index === 1 ? 4 : 0)
    const project = props.projects[index]!
    const selected = project.id === props.selectedProject
    const expanded = props.expandedProjects.has(project.id)
    return rest + (selected ? 4 : 0) + (expanded ? detailHeights.value[project.id] ?? node(5720).height : 0)
  })
  const rows = [heights.slice(0, 3), heights.slice(3, 6), heights.slice(6)]
  const rowTops = rows.map((_, i) => rows.slice(0, i).reduce((sum, row) => sum + Math.max(...row) + rowGap, 0))
  const gridHeight = localized.value && localizedGridHeight.value ? localizedGridHeight.value : rowTops[2]! + Math.max(...rows[2]!)
  const footerTop = node(5528).y + node(5676).y + node(5695).y + gridHeight + node(5845).height + afterButton
  return { heights, rowTops, gridHeight, footerTop, height: footerTop + footer.height }
})
const actions = computed<Record<string, HomeSourceAction>>(() => {
  const result: Record<string, HomeSourceAction> = {
    [node(5678).id]: { action: 'step:1', label: '选择牙科项目' },
    [node(5684).id]: { action: 'step:2', label: '城市与医生匹配' },
    [node(5690).id]: { action: 'step:3', label: '上传影像资料' },
    [action.id]: { action: 'step:2', label: '下一步 城市与医生匹配' },
    [node(5560).id]: { action: 'whiten', label: '美白预览' },
  }
  if (router.hasRoute('patient-dental-implant')) result[node(5710).id] = { href: '/dental/implants', label: '更多详情' }
  cards.forEach(({ toggle }, index) => { result[node(toggle).id] = { action: `project:${props.projects[index]!.id}`, label: '查看详情' } })
  const links: Record<string, string> = {
    寰宇云医: '/', 疾病中心: '/diseases-technologies', 费用对比: '/cost', 报告体验: '/report',
    就医步骤: '/steps', 患者案例: '/cases', 保险指南: '/insurance', 关于我们: '/about',
    [sourceContactEmail]: publicContacts.emailHref, WhatsApp: publicContacts.whatsappHref,
  }
  for (const layer of nodes.values()) {
    const href = links[layer.text.trim()]
    if (href && layer.id !== node(5969).id && Number(layer.id.split(':')[1]) < 5928) result[layer.id] = { href }
  }
  return result
})

const toothKeys = [5571, 5575, 5581, 5585, 5589, 5593, 5599, 5603, 5609, 5613, 5617, 5621, 5625, 5629] as const
const toothProjects = ['whitening', 'veneer', 'aligner', 'periodontal', 'root-canal', 'crown', 'implant'] as const
const whitened = ref(false)
const hovered = ref<number>()
const focused = ref<number>()
const suggested = ref<number>()
const activeTooth = computed(() => hovered.value ?? focused.value ?? suggested.value)
const toothProject = (index: number) => props.projects.find(project => project.id === toothProjects[index % 7])
const activeProject = computed(() => activeTooth.value === undefined ? undefined : toothProject(activeTooth.value))
const dentalRoot = ref<HTMLElement>()
useDentalStepConnectors(dentalRoot, localized, () => props.width)
const scanActive = ref(false)
const reduced = ref(false)
let suggestions: ReturnType<typeof setInterval> | undefined
let hideSuggestion: ReturnType<typeof setTimeout> | undefined
let scanObserver: IntersectionObserver | undefined
let motion: MediaQueryList | undefined
let lastInteraction = 0
function clearSuggestion() { suggested.value = undefined; clearTimeout(hideSuggestion) }
function engageTooth(index: number, type: 'hover' | 'focus', event?: FocusEvent) {
  if (type === 'hover') hovered.value = index
  else {
    if (!(event?.target instanceof HTMLElement) || !event.target.matches(':focus-visible')) return
    focused.value = index
  }
  lastInteraction = Date.now()
  clearSuggestion()
}
function releaseTooth(type: 'hover' | 'focus') {
  if (type === 'hover') hovered.value = undefined
  else focused.value = undefined
}
function syncMotion() { reduced.value = !!motion?.matches }
watch([scanActive, reduced], () => {
  clearInterval(suggestions)
  clearSuggestion()
  if (!scanActive.value || reduced.value) return
  const hotspots = [6, 8, 0, 12]
  let index = 0
  suggestions = setInterval(() => {
    if (hovered.value !== undefined || focused.value !== undefined || Date.now() - lastInteraction < 6000) return
    suggested.value = hotspots[index++ % hotspots.length]
    hideSuggestion = setTimeout(clearSuggestion, 2600)
  }, 3400)
})
const tipStyle = computed(() => {
  const tooth = activeTooth.value === undefined ? undefined : node(toothKeys[activeTooth.value]!)
  return tooth ? { left: `${tooth.x + tooth.width / 2}px`, top: `${tooth.y - 16}px` } : undefined
})

// Scrolling changes the floating action's position, but not the design tree.
// Keep these values separate: otherwise each scroll frame invalidates `styles`
// and forces hundreds of source nodes to rerender and recalculate layout.
const floatingVisible = ref(false)
const floatingTop = ref(0)
const floatingReleased = ref(false)
let scrollFrame = 0
let flowObserver: ResizeObserver | undefined
const scale = computed(() => Math.min(1, props.width / source.width))
function updateFloating() {
  scrollFrame = 0
  const root = dentalRoot.value
  const footerElement = root?.querySelector(`[data-figma-node="${footer.id}"]`)
  const rail = root?.querySelector(`[data-figma-node="${node(5677).id}"]`)
  if (!footerElement || !rail) return
  const footerTop = footerElement.getBoundingClientRect().top
  const top = Math.min(innerHeight, footerTop) - (afterButton + action.height) * scale.value
  const visible = rail.getBoundingClientRect().top < top
  const released = footerTop <= innerHeight
  if (floatingVisible.value !== visible) floatingVisible.value = visible
  if (floatingTop.value !== top) floatingTop.value = top
  if (floatingReleased.value !== released) floatingReleased.value = released
}
function scheduleFloating() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFloating) }
function measureDetail(element: unknown, projectId: string) {
  if (!(element instanceof HTMLElement)) return
  const height = element.scrollHeight
  if (height > 0 && height !== detailHeights.value[projectId]) detailHeights.value = { ...detailHeights.value, [projectId]: height }
}
onMounted(() => {
  motion = matchMedia('(prefers-reduced-motion: reduce)')
  syncMotion()
  motion.addEventListener('change', syncMotion)
  const scan = dentalRoot.value?.querySelector(`[data-figma-node="${node(5565).id}"]`)
  if (scan) {
    scanObserver = new IntersectionObserver(([entry]) => { scanActive.value = !!entry?.isIntersecting }, { threshold: .05 })
    scanObserver.observe(scan)
  }
  flowObserver = new ResizeObserver(scheduleFloating)
  if (dentalRoot.value) flowObserver.observe(dentalRoot.value)
  window.addEventListener('scroll', scheduleFloating, { passive: true })
  window.addEventListener('resize', scheduleFloating, { passive: true })
  scheduleFloating()
})
onBeforeUnmount(() => {
  localizedGridObserver?.disconnect()
  scanObserver?.disconnect()
  flowObserver?.disconnect()
  motion?.removeEventListener('change', syncMotion)
  window.removeEventListener('scroll', scheduleFloating)
  window.removeEventListener('resize', scheduleFloating)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
  clearInterval(suggestions)
  clearTimeout(hideSuggestion)
})
watch([projectLayout, () => props.width], scheduleFloating, { flush: 'post' })

const styles = computed<Record<string, string>>(() => {
  const layout = projectLayout.value
  const out = figmaFullBleedStyles(source, props.width, [node(5521).id, node(5528).id, footer.id])
  const set = (id: number, css: string) => { out[node(id).id] = (out[node(id).id] ?? '') + css }
  if (localized.value) set(5677, 'height:66px;max-height:66px;')
  set(5518, `height:${layout.height}px;`)
  set(5519, `height:${layout.height}px;`)
  set(5520, `height:${layout.footerTop}px;`)
  if (localized.value) set(5525, 'font-size:42px;line-height:56px;')
  set(5528, `height:${layout.footerTop - node(5528).y}px;`)
  set(5676, `height:${node(5695).y + layout.gridHeight + node(5845).height}px;`)
  set(5695, `height:${layout.gridHeight + node(5845).height}px;`)
  set(5701, `height:${layout.gridHeight}px;`)
  set(5845, `top:${layout.gridHeight}px;`)
  set(5846, `visibility:${floatingVisible.value ? 'hidden' : 'visible'};`)
  set(5851, `top:${layout.footerTop}px;`)
  set(5555, 'overflow:visible;')
  set(5565, 'overflow:hidden;isolation:isolate;')
  // These native strokes extend beyond their layer boxes.
  for (const [id, stroke] of gumStrokes) {
    const gum = node(id)
    set(id, `left:${gum.x - stroke / 2}px;top:${gum.y - stroke / 2}px;width:${gum.width + stroke}px;height:${gum.height + stroke}px;`)
  }
  set(5653, 'opacity:1;')
  set(5635, `mask:url("${scanMask}") 0 0 / 100% 100% no-repeat;`)
  set(5560, whitened.value ? 'border-color:#1b8fc4;' : '')
  if (whitened.value) { set(5561, 'background:#1b8fc4;'); set(5562, 'left:13px;') }
  if (scanActive.value && !reduced.value) {
    set(5653, 'animation:dental-project-scan 5.6s linear infinite;')
    set(5666, 'animation:dental-project-scan 5.6s linear infinite;')
    set(5651, 'animation:dental-project-scan 5.6s linear infinite;')
  }
  cards.forEach(({ card, content, arrow }, index) => {
    const project = props.projects[index]!
    const isSelected = props.selectedProject === project.id
    const expanded = props.expandedProjects.has(project.id)
    const shift = (isSelected ? 2 : 0) - (index === 1 ? 2 : 0)
    set(card, `top:${layout.rowTops[Math.floor(index / 3)]}px;height:${layout.heights[index]}px;border:0;box-shadow:none;${isSelected ? selectedPaint : restingPaint}`)
    node(card).children.forEach(child => { out[child.id] = `left:${child.x + shift - (isSelected ? 2 : 0)}px;top:${child.y + shift - (isSelected ? 2 : 0)}px;` })
    if (expanded) set(content, `height:${node(content).height - (index === 0 ? node(5720).height : 0) + (detailHeights.value[project.id] ?? node(5720).height)}px;`)
    set(arrow, `rotate:${expanded ? 180 : 0}deg;`)
  })
  set(5720, `height:${props.expandedProjects.has('implant') ? node(5720).height : 0}px;opacity:${props.expandedProjects.has('implant') ? 1 : 0};overflow:hidden;`)
  toothKeys.forEach((id, index) => {
    if (activeTooth.value === index) set(id, 'filter:brightness(1.12) drop-shadow(0 0 5px #58b7e2);')
    else if (whitened.value) set(id, 'filter:brightness(1.12) saturate(.5);')
  })
  return out
})
const attributes = computed(() => {
  const out: Record<string, Record<string, string | boolean>> = {
    [node(5677).id]: { 'data-dental-project-rail': true },
    [node(5560).id]: { role: 'switch', 'aria-checked': whitened.value },
    [node(5720).id]: { id: 'dental-details-implant', 'aria-hidden': !props.expandedProjects.has('implant') },
  }
  cards.forEach(({ card, toggle }, index) => {
    const project = props.projects[index]!
    const expanded = props.expandedProjects.has(project.id)
    out[node(toggle).id] = { 'aria-expanded': expanded, 'data-project': project.id, 'data-project-card': node(card).id }
    if (expanded) out[node(toggle).id]!['aria-controls'] = `dental-details-${project.id}`
  })
  return out
})
const hidden = computed(() => localized.value ? [...cards.map(card => node(card.card).id), ...compactMetrics.map(([frame]) => node(frame!).id)] : [])
const texts = computed(() => {
  const project = activeProject.value
  return project ? { [node(5559).id]: `${tx(project.title)} · ${tx(project.price)} · ${tx(project.duration)}` } : {}
})
function activate(action: string) {
  if (props.busy) return
  if (action.startsWith('step:')) emit('step', Number(action.slice(5)) as 1 | 2 | 3)
  else if (action.startsWith('project:')) emit('project', action.slice(8))
  else if (action === 'whiten') whitened.value = !whitened.value
}
</script>

<template>
  <div v-if="compact" ref="dentalRoot" class="dental-project-compact">
    <ul class="dental-compact-metrics" data-figma-node="4542:5529">
      <li v-for="([group, icon, title]) in compactMetrics" :key="group" :data-figma-node="node(group!).id">
        <img :src="node(icon!).svg" :data-figma-node="node(icon!).id" width="20" height="20" alt="" />
        <span :data-figma-node="node(title!).id">{{ tx(node(title!).text) }}</span>
      </li>
    </ul>
    <section class="dental-compact-scan" data-figma-node="4542:5553" :aria-label="t('dentalScan.label')">
      <div class="dental-compact-screen" data-figma-node="4542:5565" :style="{ height: `${558 * compactScale}px` }">
        <span class="dental-compact-scan-label">{{ t('dentalScan.label') }}</span>
        <div class="dental-compact-art" :style="{ transform: `translateX(-50%) scale(${compactScale})` }">
          <HomeSourceNode :node="compactScan" :styles="styles" root>
            <template #after="{ node: layer }">
              <template v-if="layer.id === compactScan.id">
                <div v-for="(id, index) in toothKeys" :key="id" role="img" tabindex="0"
                  class="dental-project-tooth" :aria-label="tx(toothProject(index)?.title ?? '')"
                  :style="{ left: `${node(id).x}px`, top: `${node(id).y}px`, width: `${node(id).width}px`, height: `${node(id).height}px` }"
                  @pointerenter="engageTooth(index, 'hover')" @pointerleave="releaseTooth('hover')"
                  @focus="engageTooth(index, 'focus', $event)" @blur="releaseTooth('focus')" @pointerdown.prevent />
              </template>
            </template>
          </HomeSourceNode>
        </div>
      </div>
      <div class="dental-compact-controls" data-figma-node="4542:5557">
        <span v-if="activeProject" role="status">{{ tx(activeProject.title) }} · {{ tx(activeProject.price) }} · {{ tx(activeProject.duration) }}</span>
        <span v-else>{{ t('dentalScan.hint') }}</span>
        <button type="button" role="switch" :aria-checked="whitened" data-figma-node="4542:5560" @click="activate('whiten')">
          <i aria-hidden="true"></i>{{ whitened ? t('dentalScan.whitenOn') : t('dentalScan.whiten') }}
        </button>
      </div>
    </section>
  </div>
  <div v-else ref="dentalRoot" class="dental-project-source" data-dental-step="1" :aria-busy="busy">
    <DentalSourceCanvas :node="source" :width="width" :height="projectLayout.height" animate-height :actions="actions"
      :styles="styles" :attributes="attributes" :tags="headings" :hidden="hidden" :texts="texts" @activate="activate">
      <template #after="{ node: layer }">
        <div v-if="localized && layer.id === node(5529).id" class="dental-project-metrics">
          <div v-for="([frame, icon, text]) in compactMetrics" :key="frame" class="dental-project-metric" :style="{ color: node(text!).css.match(/color:\s*([^;]+);/)?.[1] }">
            <img :src="node(icon!).svg" alt="" aria-hidden="true" />
            <span><b>{{ tx(node(text!).text).match(/^\S+(?:\s+mil\+)?/)?.[0] }}</b><small>{{ tx(node(text!).text).replace(/^\S+(?:\s+mil\+)?\s*/, '') }}</small></span>
          </div>
        </div>
        <template v-if="layer.id === node(5567).id">
          <div v-for="(id, index) in toothKeys" :key="id" role="img" tabindex="0"
            class="dental-project-tooth"
            :aria-label="tx(toothProject(index)?.title ?? '')"
            :style="{ left: `${node(id).x}px`, top: `${node(id).y}px`, width: `${node(id).width}px`, height: `${node(id).height}px` }"
            @pointerenter="engageTooth(index, 'hover')" @pointerleave="releaseTooth('hover')"
            @focus="engageTooth(index, 'focus', $event)" @blur="releaseTooth('focus')" @pointerdown.prevent />
          <div v-if="activeProject && tipStyle" class="dental-project-tip" :style="tipStyle" role="status">
            <b>{{ tx(activeProject.title) }} · {{ tx(activeProject.price) }}</b>
            <span>{{ t(`dentalScan.description.${activeProject.id}`) }}</span>
            <span>{{ t('dentalScan.duration') }} {{ tx(activeProject.duration) }}</span>
          </div>
        </template>
        <div v-if="localized && layer.id === node(5701).id" ref="localizedGrid" class="dental-project-localized-grid">
          <article v-for="(card, index) in cards" :key="card.card" class="dental-project-localized-card"
            :class="{ 'is-selected': selectedProject === projects[index]!.id }" :data-localized-project="projects[index]!.id">
            <img class="dental-project-localized-card__icon" :src="node(card.icon).svg" alt="" aria-hidden="true" />
            <div class="dental-project-localized-card__content">
              <div class="dental-project-localized-card__heading">
                <h3>{{ tx(node(card.title).text) }}</h3>
                <RouterLink v-if="index === 0" to="/dental/implants" class="dental-project-localized-card__more">{{ tx('更多详情') }}</RouterLink>
              </div>
              <p class="dental-project-localized-card__price">{{ tx(node(card.price).text) }}</p>
              <p class="dental-project-localized-card__summary">{{ tx(node(card.summary).text) }}</p>
              <button type="button" class="dental-project-localized-card__toggle" :data-project="projects[index]!.id"
                :aria-expanded="expandedProjects.has(projects[index]!.id)" :aria-controls="`dental-localized-details-${projects[index]!.id}`"
                @click="activate(`project:${projects[index]!.id}`)">
                <span>{{ tx('查看详情') }}</span><img :src="node(card.arrow).svg" alt="" aria-hidden="true" :class="{ 'is-expanded': expandedProjects.has(projects[index]!.id) }" />
              </button>
              <AccordionPanel :id="`dental-localized-details-${projects[index]!.id}`" :open="expandedProjects.has(projects[index]!.id)"><div class="dental-project-localized-card__details">
                <template v-if="index === 0"><p v-for="detail in [5721, 5722, 5723, 5724]" :key="detail">{{ tx(node(detail).text) }}</p></template>
                <template v-else>
                  <p><b>{{ tx('适用人群：') }}</b> {{ tx(projects[index]!.suitable) }}</p>
                  <p><b>{{ tx('治疗流程：') }}</b> {{ tx(projects[index]!.detail) }}</p>
                  <p><b>{{ tx('周期：') }}</b> {{ tx(projects[index]!.duration) }}</p>
                  <p v-if="projects[index]!.note"><b>{{ tx('注意事项：') }}</b> {{ tx(projects[index]!.note) }}</p>
                </template>
              </div></AccordionPanel>
            </div>
          </article>
        </div>
        <template v-for="({ content }, index) in cards" :key="content">
          <AccordionPanel v-if="!localized && index > 0 && layer.id === node(content).id"
            :id="`dental-details-${projects[index]!.id}`" class="dental-project-extra" :style="{ top: `${node(content).height}px` }" :open="expandedProjects.has(projects[index]!.id)">
            <div :ref="element => measureDetail(element, projects[index]!.id)" class="dental-project-extra__inner">
              <p><b>{{ tx('适用人群：') }}</b>{{ tx(projects[index]!.suitable) }}</p>
              <p><b>{{ tx('治疗流程：') }}</b>{{ tx(projects[index]!.detail) }}</p>
              <p><b>{{ tx('周期：') }}</b>{{ tx(projects[index]!.duration) }}</p>
              <p v-if="projects[index]!.note"><b>{{ tx('注意事项：') }}</b>{{ tx(projects[index]!.note) }}</p>
            </div>
          </AccordionPanel>
        </template>
      </template>
    </DentalSourceCanvas>
    <Teleport to="body">
      <div v-if="floatingVisible" class="dental-project-floating" :data-dental-action-state="floatingReleased ? 'released' : 'fixed'"
        :style="{ top: `${floatingTop}px`, width: `${action.width}px`, height: `${action.height}px`, transform: `translateX(-50%) scale(${scale})` }">
        <HomeSourceNode :node="floatingAction" :actions="actions" root replica @activate="activate" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dental-project-source { width: 100%; }
.dental-project-metrics { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:32px; white-space:nowrap; }
.dental-project-metric { display:flex; align-items:center; gap:8px; font-family:'PingFang SC',sans-serif; }
.dental-project-metric img { display:block; width:32px; height:32px; object-fit:contain; }
.dental-project-metric span { display:flex; align-items:baseline; gap:8px; }
.dental-project-metric b { font-size:40px; line-height:40px; font-weight:600; }
.dental-project-metric small { font-size:16px; line-height:24px; font-weight:400; }
.dental-project-tooth { position: absolute; cursor: default; border-radius: 8px; }
.dental-project-tooth:focus { outline: none; }
.dental-project-tooth:focus-visible { outline: 2px solid #0876ac; outline-offset: 1px; }
.dental-project-tip { position: absolute; z-index: 4; transform: translate(-50%, -100%); width: max-content; max-width: 240px; padding: 10px 14px; border-radius: 10px; background: #0a3556; color: white; pointer-events: none; font-size: 12px; }
.dental-project-tip span { display: block; }
.dental-project-extra { position:absolute; width:100%; color:#4b5563; font-size:16px; line-height:24px; overflow-wrap:anywhere; }
.dental-project-extra__inner { display:grid; gap:8px; padding-top:16px; }
.dental-project-extra b { font-weight: 600; }
.dental-project-localized-grid { position:relative; display:grid; width:100%; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; align-items:start; }
.dental-project-localized-card { box-sizing:border-box; min-width:0; min-height:286px; padding:24px; border:2px solid transparent; border-radius:24px; background:#f5f6f7; color:#1e3a5f; }
.dental-project-localized-card.is-selected { border-color:#000; background:#fff; box-shadow:0 4px 10px #0000001a; }
.dental-project-localized-card__icon { display:block; width:32px; height:32px; object-fit:contain; }
.dental-project-localized-card__content { margin-top:80px; }
.dental-project-localized-card__heading { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.dental-project-localized-card__heading h3 { min-width:0; margin:0; color:#1e3a5f; font-size:24px; font-weight:600; line-height:1.25; overflow-wrap:break-word; }
.dental-project-localized-card__more { flex:none; padding:4px 8px; border:1px solid #2563eb; border-radius:8px; color:#2563eb; font-size:14px; line-height:20px; text-decoration:none; }
.dental-project-localized-card__price,.dental-project-localized-card__summary { margin:16px 0 0; color:#4b5563; font-size:16px; line-height:24px; overflow-wrap:break-word; }
.dental-project-localized-card__summary { margin-top:8px; }
.dental-project-localized-card__toggle { display:flex; width:100%; min-height:30px; align-items:center; justify-content:space-between; gap:12px; margin:12px 0 0; padding:0; border:0; background:transparent; color:#9ca3af; font:400 14px/20px 'PingFang SC',sans-serif; text-align:left; cursor:pointer; }
.dental-project-localized-card__toggle img { width:14px; height:14px; flex:none; }
.dental-project-localized-card__toggle img { transition:rotate .3s ease; }
.dental-project-localized-card__toggle img.is-expanded { rotate:180deg; }
.dental-project-localized-card__details { display:grid; gap:8px; margin-top:16px; color:#4b5563; font-size:16px; line-height:24px; overflow-wrap:break-word; }
.dental-project-localized-card__details p { margin:0; }
.dental-project-localized-card__details b { color:#1e3a5f; font-weight:600; }
.dental-project-floating { position: fixed; left: 50%; z-index: 45; transform-origin: top center; }
.dental-project-floating :deep(button:focus-visible) { outline: 2px solid #2563eb; outline-offset: 3px; }
.dental-project-compact { width: min(100% - 32px, 560px); margin: 36px auto; }
.dental-project-source :deep(:is([data-figma-node="4542:5702"],[data-figma-node="4542:5725"],[data-figma-node="4542:5742"],[data-figma-node="4542:5759"],[data-figma-node="4542:5776"],[data-figma-node="4542:5792"],[data-figma-node="4542:5810"],[data-figma-node="4542:5828"],[data-figma-node="4542:5701"],[data-figma-node="4542:5695"],[data-figma-node="4542:5676"],[data-figma-node="4542:5528"],[data-figma-node="4542:5520"],[data-figma-node="4542:5519"],[data-figma-node="4542:5518"],[data-figma-node="4542:5720"],[data-figma-node="4542:5845"],[data-figma-node="4542:5851"])) { transition:height .38s cubic-bezier(.22,1,.36,1),top .38s cubic-bezier(.22,1,.36,1),opacity .24s ease; }
.dental-project-source :deep(:is([data-figma-node="4542:5679"],[data-figma-node="4542:5685"],[data-figma-node="4542:5691"])) { width:40px!important; height:40px!important; min-width:40px!important; min-height:40px!important; max-width:40px!important; max-height:40px!important; flex:none!important; border-radius:50%!important; }
.dental-project-source :deep(:is([data-figma-node="4542:5680"],[data-figma-node="4542:5686"],[data-figma-node="4542:5692"])) { left:50%!important; transform:translateX(-50%)!important; }
.dental-compact-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; list-style: none; margin: 0 0 28px; padding: 0; }
.dental-compact-metrics li { display:flex; align-items:center; gap:8px; font-size:14px; color:#1e3a5f; overflow-wrap:anywhere; }
.dental-compact-metrics img { flex:none; object-fit:contain; }
.dental-compact-scan { padding: 12px; border: 1px solid #dde8f0; border-radius: 24px; background:#fff; box-shadow:0 12px 36px rgba(10,53,86,.12); }
.dental-compact-screen { position:relative; overflow:hidden; border:1px solid #dceaf3; border-radius:14px; background:linear-gradient(165deg,#f7fcff,#e2f0f8); }
.dental-compact-art { position:absolute; top:0; left:50%; transform-origin:top center; width:1168px; }
.dental-compact-scan-label { position:absolute; top:12px; left:12px; z-index:1; color:#0b6e99; font-size:11px; font-weight:600; }
.dental-compact-controls { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; padding-top:12px; font-size:12px; color:#4b5563; }
.dental-compact-controls button { display:flex; align-items:center; min-height:38px; gap:8px; border:1px solid #dde8f0; border-radius:20px; padding:5px 10px; background:#fff; color:#0a3556; }
.dental-compact-controls i { display:block; width:26px; height:15px; padding:2px; border-radius:8px; background:#d8e4ec; }
.dental-compact-controls i::before { content:""; display:block; width:11px; height:11px; border-radius:50%; background:#fff; }
.dental-compact-controls [aria-checked=true] i { background:#1b8fc4; }
.dental-compact-controls [aria-checked=true] i::before { margin-left:auto; }
</style>
<style>
@keyframes dental-project-scan { from { translate: -360px 0; } to { translate: 1170px 0; } }
@media (prefers-reduced-motion: reduce) {
  .dental-project-source [data-figma-node="4542:5653"], .dental-project-source [data-figma-node="4542:5666"], .dental-project-source [data-figma-node="4542:5651"] { animation: none !important; }
  .dental-project-source [data-figma-node] { transition:none!important; }
  .dental-project-localized-card__toggle img { transition:none; }
}
</style>
