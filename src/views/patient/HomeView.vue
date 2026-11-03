<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
const { tx, locale } = useSiteCopy()

import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ECharts } from 'echarts/core'
import type { ComponentPublicInstance } from 'vue'
import HomeFigmaSection from '@/components/common/HomeFigmaSection.vue'
import HomeSourceNode from '@/components/common/HomeSourceNode.vue'
import HomeHeroSection from '@/components/common/HomeHeroSection.vue'
import { homeSourceDialog } from '@/components/common/homeSourceDialog'
import { homeExpertDialog } from '@/components/common/homeExpertDialog'
import { homeFigmaActions } from '@/data/homeFigmaActions'
import { homeDesktopNodes, homeBodyHeight } from '@/data/homeSourceRegistry'
import desktopChartSource from '../../../docs/figma-source/home/chart-spec-2026-10-19.json'
import mobileChartSource from '../../../docs/figma-source/home/chart-spec-mobile-2026-10-19.json'

const HomeStrengthSection = defineAsyncComponent(() => import('@/components/common/HomeStrengthSection.vue'))
const HomePartnersSection = defineAsyncComponent(() => import('@/components/common/HomePartnersSection.vue'))
const HomePatientStories = defineAsyncComponent(() => import('@/components/common/HomePatientStories.vue'))
const bodyReady = ref(false)
const bodyFailed = ref(false)
function retryBody() { window.location.reload() }
let bodyFrame = 0
let bodyDisposed = false
onMounted(() => {
  // Two frames let the browser commit the entry before the long-page source
  // and optional sections begin competing for network/CPU time.
  bodyFrame = requestAnimationFrame(() => {
    bodyFrame = requestAnimationFrame(() => {
      void Promise.all([
        import('@/data/homeFigmaSource'),
        import('@/components/common/HomeStrengthSection.vue'),
        import('@/components/common/HomePartnersSection.vue'),
        import('@/components/common/HomePatientStories.vue'),
      ]).then(async () => {
        if (bodyDisposed) return
        bodyReady.value = true
        await nextTick()
        if (pendingProcessIndex !== null) {
          scrollToProcessStep(pendingProcessIndex)
          pendingProcessIndex = null
        } else if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()
        scheduleProcessState()
      }).catch(() => { if (!bodyDisposed) bodyFailed.value = true })
    })
  })
})
onBeforeUnmount(() => { bodyDisposed = true; cancelAnimationFrame(bodyFrame) })

const selectedExpert=ref<number|null>(null)

const flowSteps = [
  { no: '01', label: '认知', title: '了解为什么选择中国', anchor: '#process-stage-01' },
  { no: '02', label: '评估', title: '3分钟免费可行性评估', anchor: '#process-stage-02' },
  { no: '03', label: '信任', title: '常见疑问解答', anchor: '#process-stage-03' },
  { no: '04', label: '行动', title: '开启来华就医之旅', anchor: '#process-stage-04' },
]
const processFaqs = [
  { question: '我的诊断正确吗？', lead: '中国三甲医院病理复核，免费第二诊疗意见', answer: '我们与北京协和医院、上海复旦肿瘤医院等42家三甲医院合作，提供权威的病理复核服务。国际患者可申请免费第二诊疗意见，由副主任级别以上专家亲自审核。' },
  { question: '治疗方案是否最佳？', answer: '医疗顾问会根据病情匹配对应专科专家，并提供可比较的治疗路径、预计周期和费用范围。' },
  { question: '能治愈吗？治愈率多少？', answer: '治疗效果取决于疾病类型、分期、既往治疗和身体状况，专家评估后会如实说明可能性。' },
  { question: '有没有新药新疗法？', answer: '符合适应症的患者可由合作医院评估前沿技术、临床试验和已获批的新药方案。' },
  { question: '保险能报销吗？', answer: '我们会在出发前协助核对保险责任、直赔范围和所需材料，避免产生无法预期的费用。' },
  { question: '语言不通怎么办？', answer: '医学背景陪诊翻译会全程协助远程咨询、面诊、住院沟通和出院随访。' },
  { question: '费用有隐藏收费吗？', answer: '出发前提供逐项费用清单，医院诊疗、交通住宿和陪诊服务分别列明。' },
  { question: '术后回国怎么随访？', answer: '回国后按治疗计划进行远程复查和报告解读，必要时协助预约复诊。' },
]
const processSection = ref<HTMLElement | null>(null)
const processStageRefs = ref<HTMLElement[]>([])
const homeWidth = ref(typeof window === 'undefined' ? 1440 : window.innerWidth)
const homeHeight = ref(typeof window === 'undefined' ? 1000 : window.innerHeight)
const journeyScale = computed(() => Math.min(1, homeWidth.value / 1440))
const pendingHeight = computed(() => {
  if (homeWidth.value <= 700) return '6320px'
  const scale = journeyScale.value
  const pinned = homeWidth.value > 1024 && homeHeight.value >= 834 * scale + 64 && typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return `${homeBodyHeight * scale + (pinned ? Math.max(480 * scale, homeHeight.value * .6) * 2 : 0)}px`
})
const whyCards = ['1412:5795','1412:5810','1412:5819','1412:5827','1412:5835','1412:5844']
const whyCopyNodes = ['1412:5799','1412:5814','1412:5822','1412:5830','1412:5839','1412:5848']
const whyMoreSource = computed(() => bodyReady.value ? homeDesktopNodes.get('1412:5804')! : undefined)
const whyCardAttributes = Object.fromEntries([
  ...whyCards.map((id,index) => [id,{ 'data-home-why-card':index,'aria-haspopup':'dialog' }]),
  ...whyCopyNodes.map((id,index) => [id,{ 'data-home-why-copy':index }]),
])
function resizeHomepage() { homeWidth.value = window.innerWidth; homeHeight.value = window.innerHeight; scheduleProcessState() }
const activeProcessIndex = ref(0)
let pendingProcessIndex: number | null = null
let processScrollFrame = 0
const expandedDesktopFaqs = ref(new Set<number>())
const desktopFaqRows = ['1401:296','1401:306','1401:313','1401:320','1401:327','1401:334','1401:341','1401:348']
const desktopFaqButtons = ['1401:297','1401:307','1401:314','1401:321','1401:328','1401:335','1401:342','1401:349']
const desktopFaqArrows = ['1401:300','1401:310','1401:317','1401:324','1401:331','1401:338','1401:345','1401:352']
const mobileFaqRows = ['1528:260','1528:269','1528:275','1528:281','1528:287','1528:293','1528:299','1528:305']
const mobileFaqButtons = ['1528:261','1528:270','1528:276','1528:282','1528:288','1528:294','1528:300','1528:306']
const mobileFaqArrows = ['1528:264','1528:273','1528:279','1528:285','1528:291','1528:297','1528:303','1528:309']
const expandedMobileFaqs = ref(new Set<number>())
const journeyActions = {
  ...homeFigmaActions,
  '1401:40': { action:'consultation', label:'免费问阿宁' },
  '1401:44': { href:'/report', label:'生成可行性报告' },
  '1401:269': { href:'/diseases-technologies', label:'查看全部疾病' },
  '1401:274': { href:'/cases', label:'查看全部案例' },
  '1401:356': { href:'/trust', label:'查看完整20个FAQ' },
  ...Object.fromEntries(desktopFaqButtons.map((id,index) => [id,{action:`desktop-faq:${index}`}])),
  ...Object.fromEntries(['1401:64','1401:77','1401:88','1401:98','1401:108','1401:120'].map(id=>[id,{href:id==='1401:108'?'/dental':'/diseases-technologies'}])),
  ...Object.fromEntries(mobileFaqButtons.map((id,index) => [id,{action:`faq:${index}`}]))
}
const mobileFaqAttributes = computed(() => Object.fromEntries(mobileFaqButtons.map((id,index) => [id,{
  'aria-expanded': expandedMobileFaqs.value.has(index),
  'aria-controls': `home-faq-answer-${index}`
}])))
const mobileFaqStyles = computed(() => Object.fromEntries([
  ...mobileFaqRows.map(id => [id,'width:100%;']),
  ...mobileFaqArrows.map((id,index) => [id,`transition:transform .3s ease;transform:rotate(${expandedMobileFaqs.value.has(index) ? 180 : 0}deg);`])
]))
const desktopFaqAttributes = computed(() => Object.fromEntries(desktopFaqButtons.map((id,index) => [id,{
  'aria-expanded': expandedDesktopFaqs.value.has(index),
  'aria-controls': `home-desktop-faq-answer-${index}`
}])))
const desktopFaqStyles = computed(() => Object.fromEntries([
  ['1401:289','height:auto!important;'],
  ['1401:295','display:flex;flex-direction:column;width:100%;'],
  ...desktopFaqRows.map(id => [id,'width:100%;']),
  ...desktopFaqArrows.map((id,index) => [id,`transition:transform .3s ease;transform:rotate(${expandedDesktopFaqs.value.has(index) === (index === 0) ? 0 : 180}deg);`])
]))
function toggleMobileFaq(index:number) {
  const next = new Set(expandedMobileFaqs.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  expandedMobileFaqs.value = next
}
function setProcessStageRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLElement) processStageRefs.value[index] = el
}
function updateProcessState() {
  processScrollFrame = 0
  if (!processStageRefs.value.length) return
  const pivot = window.innerHeight * 0.38
  let next = 0
  processStageRefs.value.forEach((stage, index) => {
    if (stage.getBoundingClientRect().top <= pivot) next = index
  })
  activeProcessIndex.value = next
}
function scheduleProcessState() {
  if (!processScrollFrame) processScrollFrame = requestAnimationFrame(updateProcessState)
}
function scrollToProcessStep(index: number) {
  if (!bodyReady.value) { pendingProcessIndex = index; return }
  const stage = processStageRefs.value[index]
  if (!stage) return
  const headerOffset = window.matchMedia('(max-width: 700px)').matches ? 88 : 104
  const top = Math.max(0, stage.getBoundingClientRect().top + window.scrollY - headerOffset)
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
function toggleDesktopFaq(index:number) {
  const next = new Set(expandedDesktopFaqs.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  expandedDesktopFaqs.value = next
}
const whyModalOpen = ref(false)
const selectedWhyIndex = ref(0)
let whyModalTrigger: HTMLElement | null = null
const storyModalOpen = ref(false)
let storyModalTrigger: HTMLElement | null = null
const whyDesktopPanels = ['143:4038','143:4223','143:4319','143:4087','143:4130','143:4170']
const whyMobilePanels = ['1541:1005','1541:1050','1541:1148','1541:1213','1541:1254','1541:1292']
const whyDesktopTitles = ['143:4081','143:4248','143:4342','143:4122','143:4164','143:4203']
const whyMobileTitles = ['1541:1044','1541:1142','1541:1207','1541:1248','1541:1286','1541:1322']
const whyCloseNodes = ['143:4039','143:4224','143:4320','143:4088','143:4131','143:4171']
const whyMobileCloseNodes = ['1541:1006','1541:1051','1541:1149','1541:1214','1541:1255','1541:1293']
const whySourceActions = Object.fromEntries([
  ...whyCloseNodes.map(id => [id, { action:'why:close', label:'关闭详情' }]),
  ...whyMobileCloseNodes.map(id => [id, { action:'why:close', label:'关闭详情' }]),
])
const storySourceActions = {
  '1414:7342': { action:'story:close', label:'关闭详情' },
  '1407:9': { action:'story:close', label:'关闭详情' },
  '1543:43': { action:'story:close', label:'关闭详情' },
}
function openWhyDetail(index: number, event?: Event) {
  selectedWhyIndex.value = index
  whyModalTrigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  whyModalOpen.value = true
}
function closeWhyDetail() {
  whyModalOpen.value = false
  nextTick(() => whyModalTrigger?.focus({ preventScroll: true }))
}
function openStoryDetail(event?: Event) {
  storyModalTrigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  storyModalOpen.value = true
}
function closeStoryDetail() {
  storyModalOpen.value = false
  nextTick(() => storyModalTrigger?.focus({ preventScroll: true }))
}
function onWhyModalKeydown(event: KeyboardEvent) {
  if (!whyModalOpen.value && !storyModalOpen.value) return
  if (event.key === 'Escape') { event.preventDefault(); whyModalOpen.value ? closeWhyDetail() : closeStoryDetail(); return }
  if (event.key !== 'Tab') return
  const panel = document.querySelector<HTMLElement>('.home-source-dialog[open]')
  if (!panel) return
  const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled'))
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

const costs = [
  { label: '心脏搭桥', china: 15, usa: 120, germany: 80, japan: 75 },
  { label: '肿瘤手术', china: 12, usa: 80, germany: 55, japan: 60 },
  { label: '关节置换', china: 8, usa: 55, germany: 35, japan: 40 },
  { label: '脊柱手术', china: 10, usa: 65, germany: 45, japan: 50 },
  { label: '种植牙', china: 1.2, usa: 4.5, germany: 3, japan: 3.5 },
  { label: '牙齿矫正', china: 2.2, usa: 6.5, germany: 4.8, japan: 5 },
]
const radarChartEl = ref<HTMLElement | null>(null)
const costChartEl = ref<HTMLElement | null>(null)
let radarChart: ECharts | undefined
let costChart: ECharts | undefined
let chartObserver: ResizeObserver | undefined
let chartSize = ''
let chartViewportObserver: IntersectionObserver | undefined
let chartsRequested = false
let chartRun = 0

const radarIndicators = [
  { name: '治疗费用', max: 100 },
  { name: '语言支持', max: 100 },
  { name: '服务质量', max: 100 },
  { name: '技术水平', max: 100 },
  { name: '等待时间', max: 100 },
  { name: '治愈率', max: 100 },
]
const radarSeries = [
  { name: '中国 China', value: [95, 92, 85, 90, 95, 88], color: '#2563EB', fill: 'rgba(37,99,235,.30)' },
  { name: '美国 USA', value: [30, 60, 82, 95, 50, 92], color: '#1E3A5F', fill: 'rgba(30,58,95,.15)' },
  { name: '德国 Germany', value: [50, 55, 88, 93, 65, 90], color: '#C9A84C', fill: 'rgba(201,168,76,.15)' },
]

async function initCharts() {
  if (!radarChartEl.value || !costChartEl.value) return
  const run = ++chartRun
  const { init } = await import('@/utils/homeCharts')
  await document.fonts.ready
  if (run !== chartRun || !radarChartEl.value?.isConnected || !costChartEl.value?.isConnected) return
  radarChart?.dispose()
  costChart?.dispose()
  // Mobile has its own authored chart, not a percentage-scaled desktop option.
  const source = window.matchMedia('(max-width: 700px)').matches ? mobileChartSource : desktopChartSource
  const graphics = (chart: typeof source.radar | typeof source.cost) => [
    ...chart.texts.map(label => ({
      type: 'group', x: label.x, y: label.y, rotation: label.rotation, silent: true,
      children: [{ type: 'text', style: {
        text: tx(label.text), fill: label.fill, opacity: 'opacity' in label ? Number(label.opacity) : 1, fontFamily: `"${label.fontFamily}", "PingFang SC", sans-serif`,
        fontSize: label.fontSize, lineHeight: label.height, verticalAlign: 'top',
        ...(tx(label.text)!==label.text ? { width:Math.max(label.width,Math.min(120,chart.width-label.x)),overflow:'break' as const } : {}),
      } }],
    })),
    ...chart.legendSymbols.map(symbol => ({
      type: 'rect', silent: true, shape: { x: symbol.x, y: symbol.y, width: symbol.width, height: symbol.height },
      style: { fill: symbol.fill, opacity: 'opacity' in symbol ? Number(symbol.opacity) : 1 },
    })),
  ]
  const devicePixelRatio = Math.max(2, window.devicePixelRatio || 1)
  radarChart = init(radarChartEl.value, undefined, { renderer: 'canvas', width: source.radar.width, height: source.radar.height, devicePixelRatio })
  costChart = init(costChartEl.value, undefined, { renderer: 'canvas', width: source.cost.width, height: source.cost.height, devicePixelRatio })
  radarChart.setOption({
    animation: false,
    radar: {
      center: source.radar.center, radius: source.radar.radius,
      startAngle: 90, splitNumber: 4, shape: 'polygon', indicator: radarIndicators.map(item=>({...item,name:tx(item.name)})),
      axisName: { show: false },
      axisLine: { lineStyle: { color: '#E5E7EB', width: 1 } },
      splitLine: { lineStyle: { color: '#E5E7EB', width: 1 } },
      splitArea: { areaStyle: { color: ['transparent'] } },
    },
    series: [{
      type: 'radar', symbol: 'none', silent: true,
      data: radarSeries.map(item => ({
        value: item.value, name: tx(item.name), lineStyle: { color: item.color, width: 2 },
        areaStyle: { color: item.fill, opacity: 1 },
      })),
    }],
    graphic: graphics(source.radar),
  })
  const grid = source.cost.grid
  costChart.setOption({
    animation: false,
    grid: { left: grid.x, top: grid.y, width: grid.width, height: grid.height },
    // Axes/labels/ticks are graphic primitives at their actual Figma positions;
    // the bars and coordinate system remain a genuine ECharts data series.
    xAxis: { type: 'category', data: costs.map(item => tx(item.label)), show: false },
    yAxis: { type: 'value', min: 0, max: 120, show: false },
    series: [
      { name: '中国', field: 'china', color: '#2563EB' }, { name: '美国', field: 'usa', color: '#1E3A5F' },
      { name: '德国', field: 'germany', color: '#C9A84C' }, { name: '日本', field: 'japan', color: '#94A3B8' },
    ].map(item => ({
      name: tx(item.name), type: 'bar', silent: true, barWidth: source.cost.barWidth, barGap: source.cost.barGap,
      itemStyle: { color: item.color, borderRadius: source.cost.width < 542 ? [2.4328, 2.4328, 0, 0] : [4, 4, 0, 0] },
      data: costs.map(cost => cost[item.field as 'china' | 'usa' | 'germany' | 'japan']),
    })),
    graphic: [
      ...source.cost.lines.map(line => ({
        type: 'line', silent: true, z: -1,
        shape: { x1: line.x, y1: line.y, x2: line.x + line.width, y2: line.y + line.height },
        style: { stroke: line.stroke, lineWidth: line.lineWidth, lineDash: line.lineDash, opacity: 'opacity' in line ? Number(line.opacity) : 1 },
      })),
      ...graphics(source.cost),
    ],
  })
}
function disposeCharts() {
  chartRun++
  radarChart?.dispose()
  costChart?.dispose()
  radarChart = undefined
  costChart = undefined
}
function observeCharts() {
  chartViewportObserver?.disconnect()
  if (!radarChartEl.value || !costChartEl.value) return
  if (chartsRequested) { void initCharts(); return }
  chartViewportObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return
    chartsRequested = true
    chartViewportObserver?.disconnect()
    void initCharts()
  }, { rootMargin: '900px 0px' })
  chartViewportObserver.observe(radarChartEl.value)
  chartViewportObserver.observe(costChartEl.value)
}
function openConsultation() { window.dispatchEvent(new CustomEvent('open-consultation')) }
watch(locale,()=>{if(chartsRequested)void initCharts()})
function activateFigmaAction(action:string, event:MouseEvent) {
  const [name, value] = action.split(':')
  if (name === 'consultation') openConsultation()
  else if (name === 'doctor') selectedExpert.value=Number(value)
  else if (name === 'process') scrollToProcessStep(Number(value))
  else if (name === 'why' && value === 'close') closeWhyDetail()
  else if (name === 'why') openWhyDetail(Number(value), event)
  else if (name === 'faq') toggleMobileFaq(Number(value))
  else if (name === 'desktop-faq') toggleDesktopFaq(Number(value))
  else if (name === 'story' && value === 'close') closeStoryDetail()
  else if (name === 'story') openStoryDetail(event)
}
watch([radarChartEl, costChartEl], () => nextTick(() => {
  observeCharts()
  chartObserver?.disconnect()
  if (radarChartEl.value) chartObserver?.observe(radarChartEl.value)
  if (costChartEl.value) chartObserver?.observe(costChartEl.value)
}))
onMounted(() => {
  nextTick(() => {
    observeCharts()
    chartObserver = new ResizeObserver(() => {
      const size = `${radarChartEl.value?.clientWidth}:${costChartEl.value?.clientWidth}:${window.innerWidth <= 700}`
      if (size === chartSize) return
      chartSize = size
      if (chartsRequested) void initCharts()
    })
    if (radarChartEl.value) chartObserver.observe(radarChartEl.value)
    if (costChartEl.value) chartObserver.observe(costChartEl.value)
  })
  window.addEventListener('keydown', onWhyModalKeydown)
  window.addEventListener('scroll', scheduleProcessState, { passive: true })
  window.addEventListener('resize', resizeHomepage, { passive: true })
  updateProcessState()
})
onBeforeUnmount(() => {
  chartObserver?.disconnect()
  chartViewportObserver?.disconnect()
  disposeCharts()
  window.removeEventListener('keydown', onWhyModalKeydown)
  window.removeEventListener('scroll', scheduleProcessState)
  if (processScrollFrame) cancelAnimationFrame(processScrollFrame)
  window.removeEventListener('resize', resizeHomepage)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="home-page" :data-figma-node="homeWidth>700 ? '1412:5684' : undefined">
    <HomeHeroSection class="home-source-hero" @activate="activateFigmaAction" />

    <HomeFigmaSection desktop-id="1412:5718" mobile-id="1528:148" :label="tx('来华就医流程')" :actions="homeFigmaActions" @activate="activateFigmaAction" />

    <template v-if="bodyReady">
    <div ref="processSection" class="home-source-journey">
      <template v-if="homeWidth <= 700">
        <div v-for="(sourceId, index) in ['1528:184', '1528:223', '1528:252', '1528:316']" :id="`process-stage-${flowSteps[index]!.no}`" :key="sourceId" :ref="el => setProcessStageRef(el, index)">
          <HomeFigmaSection class="journey-mobile-source" desktop-id="1412:5765" :mobile-id="sourceId" :label="tx(`来华就医·${flowSteps[index]!.label}`)" :actions="journeyActions" :styles="mobileFaqStyles" :attributes="mobileFaqAttributes" @activate="activateFigmaAction">
            <template #after="{ node }">
              <div v-if="mobileFaqRows.includes(node.id)" :id="`home-faq-answer-${mobileFaqRows.indexOf(node.id)}`" class="home-source-faq-answer" :class="{ 'is-open':expandedMobileFaqs.has(mobileFaqRows.indexOf(node.id)) }" :inert="!expandedMobileFaqs.has(mobileFaqRows.indexOf(node.id))" :aria-hidden="!expandedMobileFaqs.has(mobileFaqRows.indexOf(node.id))">
                <div><div class="home-source-faq-answer__copy"><strong v-if="processFaqs[mobileFaqRows.indexOf(node.id)]!.lead">{{ tx(processFaqs[mobileFaqRows.indexOf(node.id)]!.lead) }}</strong><p>{{ tx(processFaqs[mobileFaqRows.indexOf(node.id)]!.answer) }}</p></div></div>
              </div>
            </template>
          </HomeFigmaSection>
        </div>
      </template>
      <div v-else class="journey-desktop" :style="{ '--journey-scale': journeyScale }">
        <div id="process-stage-01" :ref="el => setProcessStageRef(el, 0)">
          <HomeFigmaSection desktop-id="1412:5765" defer-render :label="tx('来华就医·认知')" :actions="homeFigmaActions" :attributes="whyCardAttributes" :hidden="['1412:5780']" @activate="activateFigmaAction">
            <template #after="{ node }">
              <div v-if="whyCopyNodes.indexOf(node.id)>0 && whyMoreSource" class="home-why-card__more" :style="{left:`${whyMoreSource.x}px`,top:`${whyMoreSource.y}px`,width:`${whyMoreSource.width}px`,height:`${whyMoreSource.height}px`}" aria-hidden="true">
                <HomeSourceNode :node="whyMoreSource" root replica />
              </div>
            </template>
          </HomeFigmaSection>
        </div>
        <div v-for="(sourceId, index) in ['1401:18','1401:281','1401:49']" :id="`process-stage-${flowSteps[index+1]!.no}`" :key="sourceId" :ref="el => setProcessStageRef(el, index+1)">
          <HomeFigmaSection :desktop-id="sourceId" :defer-render="sourceId !== '1401:281'" :label="tx(`来华就医·${flowSteps[index+1]!.label}`)" :hidden="['1401:26','1401:282','1401:50','1401:303']" :flow-roots="['1401:289']" :content-height-id="sourceId === '1401:281' ? '1401:289' : undefined" :actions="journeyActions" :styles="desktopFaqStyles" :attributes="desktopFaqAttributes" @activate="activateFigmaAction">
            <template #after="{ node }">
              <div v-if="desktopFaqRows.includes(node.id)" :id="`home-desktop-faq-answer-${desktopFaqRows.indexOf(node.id)}`" class="home-source-faq-answer" :class="{ 'is-open':expandedDesktopFaqs.has(desktopFaqRows.indexOf(node.id)) }" :inert="!expandedDesktopFaqs.has(desktopFaqRows.indexOf(node.id))" :aria-hidden="!expandedDesktopFaqs.has(desktopFaqRows.indexOf(node.id))">
                <div><HomeSourceNode :node="homeDesktopNodes.get('1401:303')!" root fluid :hidden="processFaqs[desktopFaqRows.indexOf(node.id)]!.lead ? [] : ['1401:304']" :texts="{ '1401:304': processFaqs[desktopFaqRows.indexOf(node.id)]!.lead || '', '1401:305': processFaqs[desktopFaqRows.indexOf(node.id)]!.answer }" :styles="{ '1401:305':'height:auto!important;white-space:pre-wrap;' }" /></div>
              </div>
            </template>
          </HomeFigmaSection>
        </div>
        <div class="journey-desktop__rail-lane">
          <aside class="journey-desktop__rail" :aria-label="tx('当前流程阶段')">
            <HomeSourceNode :node="homeDesktopNodes.get('1412:5780')!" root :texts="{ '1412:5782': flowSteps[activeProcessIndex]!.label, '1412:5786': flowSteps[activeProcessIndex]!.no }" />
          </aside>
        </div>
      </div>
    </div>

    <HomePatientStories id="patient-story" @activate="activateFigmaAction" />
    <HomeFigmaSection id="care-section" desktop-id="1412:6019" defer-render mobile-id="1528:391" :label="tx('就医全程陪伴')" :actions="homeFigmaActions" @activate="activateFigmaAction" />
    <HomeFigmaSection desktop-id="1412:6055" defer-render mobile-id="1528:412" :label="tx('陪你走全程的人')" />
    <HomeFigmaSection id="data-section" desktop-id="1412:6092" defer-render mobile-id="1528:429" :label="tx('中国医疗数据优势')">
      <template #radar><div ref="radarChartEl" class="revision-chart" role="img" :aria-label="tx('中国、美国、德国医疗能力雷达图')" /></template>
      <template #cost><div ref="costChartEl" class="revision-chart" role="img" :aria-label="tx('治疗费用对比')" /></template>
    </HomeFigmaSection>
    <HomeFigmaSection desktop-id="1412:6313" defer-render mobile-id="1528:621" :label="tx('权威合作医院')" :actions="homeFigmaActions" :baseline-nodes="['1528:632','1528:639','1528:646','1528:653']" @activate="activateFigmaAction" />
    <HomeFigmaSection desktop-id="1412:6350" defer-render mobile-id="1528:656" :label="tx('权威专家团队')" :actions="homeFigmaActions" @activate="activateFigmaAction" />
    <HomeStrengthSection />
    <HomePartnersSection />
    <HomeFigmaSection id="home-cta" desktop-id="1412:6635" defer-render mobile-id="1528:771" :label="tx('开启来华就医之旅')" :actions="homeFigmaActions" :texts="{ '1412:6652': '预约专家面诊 $200起' }" @activate="activateFigmaAction" />

    <component :is="homeSourceDialog(whyDesktopPanels[selectedWhyIndex]!)" v-if="whyModalOpen" :desktop-panel="whyDesktopPanels[selectedWhyIndex]!" :mobile-panel="whyMobilePanels[selectedWhyIndex]!" :desktop-title="whyDesktopTitles[selectedWhyIndex]!" :mobile-title="whyMobileTitles[selectedWhyIndex]!" :actions="whySourceActions" @close="closeWhyDetail" />
    <component :is="homeSourceDialog('1407:8')" v-if="storyModalOpen" desktop-panel="1407:8" mobile-panel="1543:42" desktop-title="1407:14" mobile-title="1543:134" :actions="storySourceActions" scroll-node="1407:28" photo-carousel @close="closeStoryDetail" />
    <component :is="homeExpertDialog(selectedExpert)" v-if="selectedExpert!==null" :expert="selectedExpert" @close="selectedExpert=null" />
    </template>
    <div v-else class="home-page__pending" :style="{ height: pendingHeight }" :aria-hidden="!bodyFailed">
      <button v-if="bodyFailed" type="button" @click="retryBody">{{ tx("内容暂未加载成功，点击重试") }}</button>
    </div>
  </div>
</template>

<style scoped>
.revision-chart { width:100%; height:100%; }
.home-page__pending { min-height:100vh; }
.home-source-faq-answer { display:grid; grid-template-rows:0fr; width:100%; opacity:0; transition:grid-template-rows .38s cubic-bezier(.22,1,.36,1),opacity .24s ease; }
.home-source-faq-answer.is-open { grid-template-rows:1fr; opacity:1; }
.home-source-faq-answer > div { min-height:0; overflow:hidden; }
.home-source-faq-answer__copy { padding:0 0 24px; }
.home-source-faq-answer strong { display:block; margin:0 0 12px; color:#2563eb; font:500 14px/22px 'PingFang SC',sans-serif; }
.home-source-faq-answer p { margin:0; color:#6b7280; font:400 14px/22px 'PingFang SC',sans-serif; }
@media (prefers-reduced-motion:reduce) { .home-source-faq-answer { transition:none; } }
.home-source-journey { position:relative; background:#f5f6f7; }
.journey-desktop { position:relative; }
.journey-desktop :deep([data-home-why-copy]) { transition:transform .3s cubic-bezier(.22,1,.36,1); }
.journey-desktop :deep([data-home-why-copy="0"]) { transform:translateY(32px)!important; }
.journey-desktop :deep([data-figma-node="1412:5804"]),.home-why-card__more { opacity:0; transition:opacity .3s cubic-bezier(.22,1,.36,1); }
.home-why-card__more { position:absolute; pointer-events:none; }
.journey-desktop :deep([data-home-why-card]:hover [data-home-why-copy]),.journey-desktop :deep([data-home-why-card]:focus-visible [data-home-why-copy]) { transform:translateY(-32px)!important; }
.journey-desktop :deep([data-home-why-card="0"]:hover [data-home-why-copy]),.journey-desktop :deep([data-home-why-card="0"]:focus-visible [data-home-why-copy]) { transform:none!important; }
.journey-desktop :deep([data-home-why-card]:hover [data-figma-node="1412:5804"]),.journey-desktop :deep([data-home-why-card]:focus-visible [data-figma-node="1412:5804"]),
.journey-desktop :deep([data-home-why-card]:hover .home-why-card__more),.journey-desktop :deep([data-home-why-card]:focus-visible .home-why-card__more) { opacity:1; }
.journey-desktop :deep([data-home-why-card]:focus-visible) { outline:2px solid #2563eb; outline-offset:3px; }
@media (prefers-reduced-motion:reduce) { .journey-desktop :deep([data-home-why-copy]),.journey-desktop :deep([data-figma-node="1412:5804"]),.home-why-card__more { transition:none; } }
.journey-desktop__rail-lane { position:absolute; z-index:2; top:calc(279px * var(--journey-scale)); bottom:calc(279px * var(--journey-scale)); left:calc(50% - 588px * var(--journey-scale)); width:calc(220px * var(--journey-scale)); pointer-events:none; }
.journey-desktop__rail { position:sticky; top:88px; height:calc(650px * var(--journey-scale)); }
.journey-desktop__rail > :deep([data-figma-node]) { transform:scale(var(--journey-scale))!important; transform-origin:top left!important; }
@media (min-width:701px) and (max-width:1199px) { .journey-desktop__tail { grid-template-columns:minmax(160px,220px) minmax(0,1fr); gap:24px; } }
.home-source-partners :deep([data-figma-node="1528:766"]) { overflow:hidden!important; }
@media (max-width:700px) { .home-page { margin-top:0!important; } }
.home-page { margin-top:-64px; background:#fff; color:#1e3a5f; font-family:'PingFang SC',sans-serif; }
.home-page section[id] { scroll-margin-top:72px; }
.home-page :deep(.hy-container) { width:min(1216px,calc(100% - 48px)); }

</style>
