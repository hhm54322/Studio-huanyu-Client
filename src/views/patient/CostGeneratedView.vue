<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { init, use, type ECharts } from 'echarts/core'
import { GraphicComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([GraphicComponent, CanvasRenderer])

type Country = '美国' | '英国' | '德国' | '中国' | '新加坡' | '日本'

const countries: Array<{ name: Country; color: string; icon: string; node: string }> = [
  { name: '美国', color: '#9CA3AF', icon: '/images/figma/cost-legend-us.svg', node: '143:2283' },
  { name: '英国', color: '#6B7280', icon: '/images/figma/cost-legend-uk.svg', node: '143:2287' },
  { name: '德国', color: '#4B5563', icon: '/images/figma/cost-legend-germany.svg', node: '143:2291' },
  { name: '中国', color: '#DD6B20', icon: '/images/figma/cost-legend-china.svg', node: '143:2295' },
  { name: '新加坡', color: '#2563EB', icon: '/images/figma/cost-legend-singapore.svg', node: '143:2299' },
  { name: '日本', color: '#3B82F6', icon: '/images/figma/cost-legend-japan.svg', node: '143:2303' },
]

const treatments = [
  '肿瘤手术',
  '心血管手术',
  '慢性病年管理',
  '质子治疗',
  'CAR-T',
  'PD-1年费用',
  '化疗(6周期)',
  '牙科-种植牙',
  '眼科-白内障',
]

const generatedHeights = [
  [64.4, 84, 22.4, 112, 280, 98, 44.8, 1.68, 2.8],
  [36.4, 44.8, 15.12, 56, 182, 70, 28, 1.4, 1.96],
  [30.8, 36.4, 11.2, 47.6, 154, 56, 22.4, 1.12, 1.96],
  [12.32, 15.12, 2.52, 25.76, 36.4, 2.24, 3.92, 0.45, 0.84],
  [25.2, 29.12, 8.96, 58.8, 154, 44.8, 17.92, 1.4, 2.52],
  [31.92, 39.2, 12.88, 53.2, 182, 70, 25.2, 1.4, 2.24],
]

const barColors = [
  ['#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF'],
  ['#6B7280', '#6B7280', '#6B7280', '#6B7280', '#6B7280', '#6B7280', '#6B7280', '#6B7280', '#6B7280'],
  ['#4B5563', '#4B5563', '#4B5563', '#4B5563', '#4B5563', '#4B5563', '#4B5563', '#4B5563', '#4B5563'],
  ['#1D4ED8', '#1D4ED8', '#1D4ED8', '#DD6B20', '#1D4ED8', '#1D4ED8', '#DD6B20', '#1D4ED8', '#1D4ED8'],
  ['#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#2563EB', '#2563EB', '#2563EB', '#3B82F6', '#3B82F6'],
  ['#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6'],
]

const chartEl = ref<HTMLElement | null>(null)
let chart: ECharts | undefined
let resizeObserver: ResizeObserver | undefined

function renderChart() {
  if (!chartEl.value) return
  chart?.dispose()
  chart = init(chartEl.value, undefined, { renderer: 'canvas' })
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const width = chartEl.value.clientWidth
  const height = chartEl.value.clientHeight
  const scaleX = width / 1216
  const scaleY = height / 363.2602233886719
  const plotLeft = 71.39339065551758 * scaleX
  const plotRight = 23.990276336669922 * scaleX
  const plotBottom = 19.519989013671875 * scaleY
  const plotHeight = 280 * scaleY
  const plotWidth = width - plotLeft - plotRight
  const categoryWidth = plotWidth / treatments.length
  const barWidth = 12.269521713256836 * scaleX
  const barGap = 4.08984 * scaleX
  const barOrigin = 83.84393692016602 * scaleX
  const bars = countries.flatMap((country, countryIndex) => generatedHeights[countryIndex].map((sourceHeight, treatmentIndex) => {
    const barHeight = sourceHeight * (plotHeight / 280)
    const x = barOrigin + categoryWidth * treatmentIndex + countryIndex * (barWidth + barGap)
    return {
      type: 'rect' as const,
      id: `cost-bar-${countryIndex}-${treatmentIndex}`,
      silent: true,
      shape: { x, y: height - plotBottom - barHeight, width: barWidth, height: barHeight },
      style: { fill: barColors[countryIndex][treatmentIndex] },
    }
  }))
  const labels = treatments.flatMap((label, index) => [{
    type: 'text', silent: true, x: plotLeft + categoryWidth * (index + 0.5), y: 348.2602233886719 * scaleY,
    style: { text: label, fill: '#666', fontFamily: 'Inter, "Noto Sans SC", sans-serif', fontSize: 12, align: 'center', verticalAlign: 'top' },
  }])
  const gridLines = [0, 1, 2, 3, 4].flatMap((index) => [{
    type: 'line', silent: true, shape: { x1: plotLeft, y1: height - plotBottom - 84 * scaleY * index, x2: width - plotRight, y2: height - plotBottom - 84 * scaleY * index }, style: { stroke: '#e0e1e1', lineWidth: 1, lineDash: [3, 3] },
  }])
  const verticalPositions = [0, ...Array.from({ length: 9 }, (_, index) => index + .5), 9]
  const verticalLines = verticalPositions.map((position) => ({
    type: 'line' as const, silent: true,
    shape: { x1: plotLeft + categoryWidth * position, y1: 7.740234375 * scaleY, x2: plotLeft + categoryWidth * position, y2: height - plotBottom },
    style: { stroke: '#e0e1e1', lineWidth: 1, lineDash: [3, 3] },
  }))
  const axis = { type: 'line' as const, silent: true, shape: { x1: plotLeft, y1: 7.740234375 * scaleY, x2: plotLeft, y2: height - plotBottom }, style: { stroke: '#888888', lineWidth: 1 } }
  const axisLabels = [600, 450, 300, 150, 0].map((value, index) => ({
    type: 'text', silent: true, x: plotLeft - 8, y: 84 * scaleY * index,
    style: { text: value === 0 ? '0' : `$${value}K`, fill: '#666', fontFamily: 'Inter, sans-serif', fontSize: 12, align: 'right', verticalAlign: 'top' },
  }))
  chart.setOption({
    animation: !reducedMotion,
    animationDuration: 650,
    animationEasing: 'cubicOut',
    graphic: [...gridLines, ...verticalLines, axis, ...axisLabels, ...labels, ...bars],
  })
}

function resizeChart() { chart?.resize() }

onMounted(async () => {
  await nextTick()
  renderChart()
  if (chartEl.value) {
    resizeObserver = new ResizeObserver(resizeChart)
    resizeObserver.observe(chartEl.value)
  }
})
onBeforeUnmount(() => { resizeObserver?.disconnect(); chart?.dispose() })

const savings = [
  '心脏搭桥节省69%',
  'CAR-T细胞免疫治疗节省55%',
  'PET-CT全身影像筛查节省85%',
  '质子重离子肿瘤放疗节省53%',
  '膝关节置换手术节省57%',
]

const detailCards = [
  { node: '143:2374', iconNode: '143:2375', icon: '/images/figma/cost-heart-bypass.svg', title: '心脏搭桥手术', first: ['较欧美节省', '69%'], second: ['较新马节省', '42%'], copy: '国内三甲手术案例量大，整套手术+住院费用远低于海外。' },
  { node: '143:2393', iconNode: '143:2394', icon: '/images/figma/cost-car-t.svg', title: 'CAR-T细胞免疫治疗', first: ['较欧美节省', '55%'], second: ['较日本节省', '38%'], copy: '国产获批疗法成熟，临床案例充足，大幅降低肿瘤免疫治疗门槛。' },
  { node: '143:2411', iconNode: '143:2412', icon: '/images/figma/cost-pet-ct.svg', title: 'PET-CT全身影像筛查', first: ['较欧美节省', '85%'], second: ['较新马节省', '70%'], copy: '设备与国际标准同步，影像诊断质量一致，检查成本优势突出。' },
  { node: '143:2434', iconNode: '143:2435', icon: '/images/figma/cost-proton.svg', title: '质子重离子肿瘤放疗', first: ['较欧美节省', '53%'], second: ['较日本节省', '41%'], copy: '国内多中心稳定接诊，无需长时间排队等候。' },
  { node: '143:2452', iconNode: '143:2453', icon: '/images/figma/cost-knee.svg', title: '膝关节置换手术', first: ['较欧美节省', '57%'], second: ['较新加坡节省', '36%'], copy: '进口假体+微创机器人手术全套服务，包含基础住院康复。' },
  { node: '143:2470', iconNode: '143:2471', icon: '/images/figma/cost-robot.svg', title: '机器人胃肠肿瘤微创手术', first: ['较欧美节省', '62%'], second: ['较马来西亚节省', '35%'], copy: '达芬奇微创外科，创伤小，术后恢复更快。' },
  { node: '143:2488', iconNode: '143:2489', icon: '/images/figma/cost-tooth.svg', title: 'All-on6半口种植牙', first: ['较新加坡节省', '52%'], second: ['较马来西亚节省', '33%'], copy: '全套含6颗进口种植体+上部固定牙桥，资深口腔外科医生主刀。' },
  { node: '143:2508', iconNode: '143:2509', icon: '/images/figma/cost-tooth.svg', title: '单颗进口种植牙', first: ['较新加坡节省', '48%'], second: ['较马来西亚节省', '29%'], copy: '包含进口植体、基台+全瓷牙冠，诊疗流程规范透明。' },
]

const detailsExpanded = ref(true)

function toggleDetails() {
  detailsExpanded.value = !detailsExpanded.value
}
</script>

<template>
  <div class="cost-generated-page">
    <section class="cost-generated-frame" data-figma-node="143:2079">
      <div class="cost-generated-inner">
        <header class="cost-generated-heading" data-figma-node="143:2080" data-reveal>
          <h1>同等医疗质量，中国就医成本全球最优</h1>
          <p>对标新、马、日、欧美，同质医疗效果下，中国整体治疗费用大幅更低</p>
        </header>

        <div class="cost-generated-chart" data-figma-node="143:2085" data-reveal>
          <div ref="chartEl" class="chart-plot" data-figma-node="143:2086" role="img" aria-label="不同国家治疗费用对比" />
          <div class="chart-legend" data-figma-node="143:2281" aria-label="国家图例">
            <span v-for="country in countries" :key="country.name" :data-figma-node="country.node" :style="{ color: country.color }"><img :src="country.icon" alt="" />{{ country.name }}</span>
          </div>
        </div>

        <div class="savings-marquee" data-figma-node="143:2306" aria-label="费用节省亮点">
          <div class="savings-track">
            <span v-for="(item, index) in [...savings, ...savings]" :key="`${item}-${index}`">{{ item }}</span>
          </div>
        </div>

        <div class="cost-generated-actions" data-figma-node="143:2356" data-reveal>
          <div class="cost-generated-buttons" data-figma-node="143:2357">
            <button class="cost-generated-button cost-generated-button--orange" type="button" :aria-expanded="detailsExpanded" aria-controls="cost-detail-grid" @click="toggleDetails">
              查看更多病种费用对比详情
              <img :src="detailsExpanded ? '/images/figma/cost-chevron-up.svg' : '/images/figma/cost-arrow-right.svg'" alt="" />
            </button>
            <RouterLink to="/report" class="cost-generated-button cost-generated-button--navy">提交病历，获取AI个性化精准预算与来华方案 <img src="/images/figma/cost-arrow-right.svg" alt="" /></RouterLink>
          </div>
          <p>中国是唯一同时具备：顶级重症技术、超快就诊时效、亲民治疗成本的跨境医疗目的地。</p>
        </div>

        <Transition name="cost-accordion">
        <div v-if="detailsExpanded" class="cost-accordion-shell">
        <div id="cost-detail-grid" class="cost-generated-details" data-figma-node="143:2372">
          <article v-for="card in detailCards" :key="card.title" class="cost-detail-card" :data-figma-node="card.node" data-reveal>
            <img class="cost-detail-card__icon" :src="card.icon" :data-figma-node="card.iconNode" alt="" />
            <div class="cost-detail-card__content">
              <h2>{{ card.title }}</h2>
              <div class="cost-detail-card__metrics"><span>{{ card.first[0] }}</span><strong>{{ card.first[1] }}</strong></div>
              <div class="cost-detail-card__metrics"><span>{{ card.second[0] }}</span><strong>{{ card.second[1] }}</strong></div>
              <p>{{ card.copy }}</p>
            </div>
          </article>
        </div>
        </div>
        </Transition>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cost-generated-page { background: #fff; color: #1e3a5f; }
.cost-generated-frame { min-height: 1768px; padding: 96px 0; box-sizing: border-box; background: #f5f6f7; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.cost-generated-inner { width: min(1216px, calc(100% - 48px)); margin: 0 auto; }
.cost-generated-heading { text-align: center; }
.cost-generated-heading h1 { margin: 0; color: #1e3a5f; font-family: 'PingFang SC', 'Noto Sans SC', sans-serif; font-size: 40px; font-weight: 600; line-height: 40px; letter-spacing: .4px; }
.cost-generated-heading p { margin: 16px 0 0; color: #6b7280; font-family: 'PingFang SC', 'Noto Sans SC', sans-serif; font-size: 16px; line-height: 24px; }
.cost-generated-chart { padding-top: 48px; }
.chart-plot { position: relative; width: 100%; height: 363.26px; }
.chart-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; padding-top: 16px; color: #6b7280; font: 16px/24px 'SF Pro', 'PingFang SC', sans-serif; }
.chart-legend span { display: inline-flex; align-items: center; gap: 4px; }
.chart-legend img { display: block; width: 14px; height: 14px; }
.savings-marquee { position: relative; height: 96px; padding-top: 48px; box-sizing: border-box; overflow: hidden; margin-top: 0; }
.savings-marquee::before, .savings-marquee::after { position: absolute; top: 0; z-index: 2; width: 160px; height: 96px; content: ''; pointer-events: none; }
.savings-marquee::before { left: 0; background: linear-gradient(90deg, #f5f6f7 25%, rgba(245,246,247,0)); }
.savings-marquee::after { right: 0; transform: rotate(180deg); background: linear-gradient(90deg, #f5f6f7 25%, rgba(245,246,247,0)); }
.savings-track { position: absolute; top: 48px; left: 0; display: flex; width: max-content; height: 48px; gap: 24px; animation: cost-marquee 24s linear infinite; }
.savings-track span { flex: none; padding: 12px 24px; border-radius: 14px; background: #fff; color: #1e3a5f; font: 16px/24px 'PingFang SC', 'Noto Sans SC', sans-serif; letter-spacing: -0.313px; white-space: nowrap; }
.cost-generated-actions { padding-top: 48px; text-align: center; }
.cost-generated-buttons { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
.cost-generated-button { display: inline-flex; align-items: center; gap: 8px; border-radius: 14px; padding: 18px 24px; box-shadow: 0 4px 6px -4px rgba(0,0,0,.1); color: #fff; font: 600 16px/16px 'PingFang SC', 'Noto Sans SC', sans-serif; transition: transform .25s ease, box-shadow .25s ease; }
.cost-generated-button:hover { transform: translateY(-3px); box-shadow: 0 12px 20px -12px rgba(30,58,95,.45); }
.cost-generated-button img { display: block; width: 16px; height: 16px; flex: none; }
.cost-generated-button--orange { background: #dd6b20; }
.cost-generated-button--navy { background: #1e3a5f; }
.cost-generated-actions p { margin: 16px 0 0; color: #6b7280; font: 14px/22px 'PingFang SC', 'Noto Sans SC', sans-serif; }
.cost-generated-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; padding-top: 32px; }
.cost-accordion-enter-active,.cost-accordion-leave-active { display:grid; grid-template-rows:1fr; overflow:hidden; opacity:1; transition:grid-template-rows .42s cubic-bezier(.22,1,.36,1),opacity .26s ease; }
.cost-accordion-enter-from,.cost-accordion-leave-to { grid-template-rows:0fr; opacity:0; }
.cost-accordion-shell { min-height:0; overflow:hidden; }
@media (prefers-reduced-motion: reduce) { .cost-accordion-enter-active, .cost-accordion-leave-active { transition:none; } }
.cost-detail-card { display: flex; min-height: 308px; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 24px; border-radius: 24px; padding: 24px; background: #fff; box-sizing: border-box; transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
.cost-detail-card:hover { transform: translateY(-6px); box-shadow: 0 18px 36px rgba(30,58,95,.12); }
.cost-detail-card__icon { display: block; width: 32px; height: 32px; }
.cost-detail-card__content { width: 100%; }
.cost-detail-card h2 { margin: 0 0 20px; color: #1e3a5f; font: 600 24px/24px 'PingFang SC', 'Noto Sans SC', sans-serif; letter-spacing: -0.439px; text-align: left; }
.cost-detail-card__metrics { display: flex; justify-content: space-between; gap: 16px; color: #6b7280; font: 16px/16px 'PingFang SC', 'Noto Sans SC', sans-serif; }
.cost-detail-card__metrics + .cost-detail-card__metrics { margin-top: 12px; }
.cost-detail-card__metrics strong { color: #2563eb; font-weight: 500; }
.cost-detail-card p { margin: 12px 0 0; color: #4b5563; font: 16px/24px 'PingFang SC', 'Noto Sans SC', sans-serif; letter-spacing: -0.150px; }
@keyframes cost-marquee { to { transform: translateX(calc(-50% - 12px)); } }
@media (prefers-reduced-motion: reduce) { .savings-track { animation: none; } .cost-detail-card, .cost-generated-button { transition: none; } }
@media (max-width: 900px) { .cost-generated-frame { min-height: 0; padding: 72px 0; }.cost-generated-heading h1 { font-size: 32px; line-height: 38px; }.chart-plot { height: 320px; }.cost-generated-details { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .cost-generated-inner { width: min(100% - 32px, 520px); }.cost-generated-heading p { font-size: 14px; }.chart-legend { justify-content: flex-start; font-size: 14px; }.cost-generated-buttons { align-items: stretch; flex-direction: column; }.cost-generated-button { justify-content: center; text-align: center; }.cost-generated-details { grid-template-columns: 1fr; }.cost-detail-card { min-height: 308px; gap: 24px; }.cost-detail-card h2 { font-size: 21px; } }
</style>
