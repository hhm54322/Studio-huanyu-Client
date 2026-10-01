<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { init, use, type ECharts } from 'echarts/core'
import { CustomChart } from 'echarts/charts'
import type { CustomSeriesRenderItem } from 'echarts'
import { GraphicComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { whyChinaBarPositions } from '@/data/whyChinaChartGeometry'

use([CustomChart, GraphicComponent, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const medicalCapabilities = [
  { title:'肿瘤MDT综合诊疗', copy:'疑难复发肿瘤多学科联合方案，临床量全球第一', icon:'/images/figma/why-china-icons/node-143-1363.svg', detail:'新马轻症处理成熟，但复发难治、晚期肿瘤方案薄弱；日本方案保守、欧美费用极高。中国拥有全球最大肿瘤临床病例库，常规MDT多学科会诊，靶向、免疫、介入、手术综合方案更灵活、个体化更强。' },
  { title:'CAR-T细胞免疫治疗', copy:'多款国产获批疗法，价格与落地性全球领先', icon:'/images/figma/why-china-icons/node-143-1382.svg', detail:'覆盖血液肿瘤评估、细胞制备、回输与随访全流程，帮助国际患者缩短等待周期并获得连续管理。' },
  { title:'质子重离子精准放疗', copy:'多中心规模化运营，实体肿瘤精准无创放疗', icon:'/images/figma/why-china-icons/node-143-1395.svg', detail:'依托国内成熟的质子重离子中心，为适合的实体肿瘤患者制定精确照射与器官保护方案。' },
  { title:'高难度心脑外科手术', copy:'复杂脑血管、心脏瓣膜、搭桥手术经验丰富', icon:'/images/figma/why-china-icons/node-143-1408.svg', detail:'连接高年手术量中心与多学科专家团队，为复杂心脑血管和神经外科疾病提供联合评估。' },
  { title:'机器人微创外科体系', copy:'达芬奇机器人全覆盖，多科室复杂微创落地成熟', icon:'/images/figma/why-china-icons/node-143-1422.svg', detail:'将机器人、腔镜与围术期快速康复体系结合，减少复杂手术创伤并提升恢复效率。' },
  { title:'新药临床与靶向免疫治疗', copy:'国产+进口新药同步可及，方案迭代快', icon:'/images/figma/why-china-icons/node-143-1435.svg', detail:'根据病理与基因检测结果匹配靶向、免疫方案及适合的临床研究机会。' },
  { title:'器官移植重症修复', copy:'规范化移植体系，术后长期管理成熟', icon:'/images/figma/why-china-icons/node-143-1448.svg', detail:'由移植、重症、感染与康复团队共同评估，覆盖围术期治疗和长期随访管理。' },
  { title:'罕见病疑难病联合诊疗', copy:'全国专家协作网，专治全球疑难杂症', icon:'/images/figma/why-china-icons/node-143-1461.svg', detail:'通过全国专家协作网络整合检查与既往病史，为复杂和罕见疾病形成清晰诊疗路径。' },
]
const expandedCapabilities = ref(new Set([0]))
function toggleCapability(index: number) {
  const next = new Set(expandedCapabilities.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  expandedCapabilities.value = next
}
const comparisonLabels = ['肿瘤手术', '心血管手术', '慢性病年管理', '质子治疗', 'CAR-T', 'PD-1年费用', '化疗(6周期)', '牙科-种植牙', '眼科-白内障']
// Values in USD thousands, copied from the 54 Figma bar heights at 0.56px per $1K.
const comparisonSeries = [
  { name: '美国', color: '#9CA3AF', values: [115, 150, 40, 200, 500, 175, 80, 3, 5] },
  { name: '英国', color: '#6B7280', values: [65, 80, 27, 100, 325, 125, 50, 2.5, 3.5] },
  { name: '德国', color: '#4B5563', values: [55, 65, 20, 85, 275, 100, 40, 2, 3.5] },
  { name: '中国', color: '#DD6B20', values: [22, 27, 4.5, 46, 65, 4, 7, 0.8, 1.5] },
  { name: '新加坡', color: '#1D4ED8', values: [45, 52, 16, 105, 275, 80, 32, 2.5, 4.5] },
  { name: '日本', color: '#3B82F6', values: [57, 70, 23, 95, 325, 125, 45, 2.5, 4] },
]
const costDetailCards = [
  { icon: '/images/figma/cost-heart-bypass.svg', title: '心脏搭桥手术', first: ['较欧美节省', '69%'], second: ['较新马节省', '42%'], copy: '国内三甲手术案例量大，整套手术+住院费用远低于海外。' },
  { icon: '/images/figma/cost-car-t.svg', title: 'CAR-T细胞免疫治疗', first: ['较欧美节省', '55%'], second: ['较日本节省', '38%'], copy: '国产获批疗法成熟，临床案例充足，大幅降低肿瘤免疫治疗门槛。' },
  { icon: '/images/figma/cost-pet-ct.svg', title: 'PET-CT全身影像筛查', first: ['较欧美节省', '85%'], second: ['较新马节省', '70%'], copy: '设备与国际标准同步，影像诊断质量一致，检查成本优势突出。' },
  { icon: '/images/figma/cost-proton.svg', title: '质子重离子肿瘤放疗', first: ['较欧美节省', '53%'], second: ['较日本节省', '41%'], copy: '国内多中心稳定接诊，无需长时间排队等候。' },
  { icon: '/images/figma/cost-knee.svg', title: '膝关节置换手术', first: ['较欧美节省', '57%'], second: ['较新加坡节省', '36%'], copy: '进口假体+微创机器人手术全套服务，包含基础住院康复。' },
  { icon: '/images/figma/cost-robot.svg', title: '机器人胃肠肿瘤微创手术', first: ['较欧美节省', '62%'], second: ['较马来西亚节省', '35%'], copy: '达芬奇微创外科，创伤小，术后恢复更快。' },
  { icon: '/images/figma/cost-tooth.svg', title: 'All-on6半口种植牙', first: ['较新加坡节省', '52%'], second: ['较马来西亚节省', '33%'], copy: '全套含6颗进口种植体+上部固定牙桥，资深口腔外科医生主刀。' },
  { icon: '/images/figma/cost-tooth.svg', title: '单颗进口种植牙', first: ['较新加坡节省', '48%'], second: ['较马来西亚节省', '29%'], copy: '包含进口植体、基台+全瓷牙冠，诊疗流程规范透明。' },
]
const costChartEl = ref<HTMLElement | null>(null)
const route = useRoute()
const costDetailsExpanded = ref(route.hash === '#cost-comparison')
let costChart: ECharts | undefined
let chartObserver: IntersectionObserver | undefined
const renderCostBar = (seriesIndex: number): CustomSeriesRenderItem => (_params, api) => {
  const categoryIndex = Number(api.value(0))
  const value = Number(api.value(1))
  const top = api.coord([categoryIndex, value])[1]
  const bottom = api.coord([categoryIndex, 0])[1]
  const [x = 0, width = 0] = whyChinaBarPositions[seriesIndex]?.[categoryIndex] ?? []
  const height = Math.max(0, bottom - top)
  const radius = Math.min(4, height / 2)
  return { type: 'rect', shape: { x, y: top, width, height, r: [radius, radius, 0, 0] }, style: { fill: comparisonSeries[seriesIndex]?.color }, transition: ['shape'] }
}
onMounted(() => {
  if (!costChartEl.value) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const animateChart = !reducedMotion && window.innerWidth >= 768 && typeof IntersectionObserver !== 'undefined'
  costChart = init(costChartEl.value, undefined, { renderer: 'canvas', width: 1168.02, height: 403.26 })
  costChart.setOption({
    animation: animateChart,
    animationDuration: 0,
    animationDurationUpdate: 800,
    animationEasingUpdate: 'cubicOut',
    grid: { left: 47.4033, right: 0, top: 7.74023, height: 336, containLabel: false },
    xAxis: { type: 'category', data: comparisonLabels, axisTick: { show: true, alignWithLabel: true, length: 6 }, axisLine: { lineStyle: { color: '#666666' } }, axisLabel: { interval: 0, color: '#666666', fontFamily: 'Inter', fontSize: 12, margin: 6 }, splitLine: { show: false }, splitArea: { show: false } },
    yAxis: { type: 'value', min: 0, max: 600, interval: 150, axisLine: { show: true, lineStyle: { color: '#777777' } }, axisTick: { show: true, lineStyle: { color: '#777777' } }, axisLabel: { color: '#666666', fontFamily: 'Inter', fontSize: 12, formatter: (value: number) => value ? `$${value}K` : '0' }, splitLine: { lineStyle: { color: '#E0E1E1', type: [3, 3] } } },
    graphic: [109.66, 234.173, 358.686, 483.198, 607.711, 732.225, 856.737, 981.25, 1105.76, 1168.02].map((x) => ({ type: 'line', silent: true, shape: { x1: x, x2: x, y1: 7.74023, y2: 343.74023 }, style: { stroke: '#E0E1E1', lineWidth: 1, lineDash: [3, 3] } })),
    legend: { top: 379.26, left: 'center', padding: 0, itemWidth: 14, itemHeight: 10.5, itemGap: 10, icon: 'rect', selectedMode: false, textStyle: { fontFamily: 'PingFang SC', fontSize: 16, lineHeight: 24 }, data: comparisonSeries.map((item) => ({ name: item.name, textStyle: { color: item.color } })) },
    tooltip: { trigger: 'axis', valueFormatter: (value: number) => `$${value}K` },
    series: comparisonSeries.map((item, seriesIndex) => ({ type: 'custom', name: item.name, renderItem: renderCostBar(seriesIndex), itemStyle: { color: item.color }, encode: { x: 0, y: 1, tooltip: [1] }, data: item.values.map((value, categoryIndex) => [categoryIndex, animateChart ? 0 : value]) })),
  })
  if (animateChart) {
    chartObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      costChart?.setOption({ series: comparisonSeries.map((item) => ({ data: item.values.map((value, categoryIndex) => [categoryIndex, value]) })) })
      chartObserver?.disconnect()
    }, { threshold: 0.15 })
    chartObserver.observe(costChartEl.value)
  }
})
onBeforeUnmount(() => { chartObserver?.disconnect(); costChart?.dispose() })
const waits = [
  { value:'30–180天', label:'欧美平均就诊等待' },
  { value:'21–90天', label:'日本/新加坡公立医院' },
  { value:'14–60天', label:'马来西亚公立体系' },
  { value:'7–13天', label:'中国跨境就医', highlight:true },
]
const nationalStats = [
  { value:'2000+', label:'全国合作三甲医院' },
  { value:'137家', label:' JCI国际认证医疗机构' },
  { value:'128万+', label:'国际患者来华就诊案例' },
  { value:'73.6%', label:'三年跨境就医增长率' },
]
const stories = [
  { quote:'在新加坡排期3个月，来华11天完成全套评估与治疗方案制定。', meta:'新加坡患者· 肿瘤综合治疗', image:'/images/figma/why-story-singapore-source-2x.png' },
  { quote:'对比本地报价，来华完成种植修复，节省大量费用，医生沟通顺畅', meta:'马来西亚患者· All-on6半口种植', image:'/images/figma/why-story-malaysia-source-2x.png' },
  { quote:'欧美等待半年，国内绿色通道快速安排手术，术后恢复良好', meta:'欧美患者· 心外科手术', image:'/images/figma/why-story-europe-source-2x.png' },
]
function openConsultation(){ window.dispatchEvent(new CustomEvent('open-consultation')) }
</script>

<template>
  <div class="why-page">
    <section class="why-hero"><div class="why-hero__visual" /><div class="hy-container" data-reveal><h1><span>为什么全球患者优先选择</span><br /><span>{{ '   来华就医？' }}</span></h1><p>对比新马日与欧美，中国重症医疗兼具技术、时效与成本优势</p><div class="hero-actions"><button type="button" @click="openConsultation"><img class="source-icon" src="/images/figma/why-china-icons/node-143-1342.svg" alt="" /><span class="button-label">免费咨询</span></button><RouterLink to="/report"><img class="source-icon" src="/images/figma/why-china-icons/node-143-1346.svg" alt="" /><span class="button-label">AI初诊 3分钟生成就医评估报告</span></RouterLink></div></div></section>

    <section class="capability-section" :class="{ 'capability-section--multi-expanded': expandedCapabilities.size > 1 }"><div class="hy-container capability-layout"><aside data-reveal><h2>中国严肃医疗｜多国对比技术优势</h2><p>在肿瘤、心脑外科、细胞治疗、复杂微创手术等重症领域，中国医院临床体量、手术复杂度、病例积累，全面优于东南亚及部分欧美体系。</p></aside><div class="capability-grid"><article v-for="(item,index) in medicalCapabilities" :key="item.title" data-reveal :class="{ open:expandedCapabilities.has(index) }" :style="{ '--reveal-delay':`${(index%2)*55}ms` }" role="button" tabindex="0" :aria-expanded="expandedCapabilities.has(index)" @click="toggleCapability(index)" @keydown.enter.prevent="toggleCapability(index)" @keydown.space.prevent="toggleCapability(index)"><img class="capability-icon" :src="item.icon" alt="" /><div class="capability-content"><h3>{{ item.title }}</h3><p class="capability-copy">{{ item.copy }}</p><span class="capability-detail-row"><span class="capability-detail-label">查看详情</span><img class="capability-chevron" :class="{ rotated:!expandedCapabilities.has(index) }" src="/images/figma/why-china-icons/node-143-1376.svg" alt="" /></span><div v-if="expandedCapabilities.has(index)" class="capability-expanded"><small>{{ item.detail }}</small></div></div></article></div></div></section>

    <section id="cost-comparison" class="cost-section" :class="{ 'cost-section--expanded': costDetailsExpanded }"><div class="hy-container"><header class="section-title" data-reveal><h2>同等医疗质量，中国就医成本全球最优</h2><p>对标新、马、日、欧美，同质医疗效果下，中国整体治疗费用大幅更低</p></header><div class="comparison-content"><div class="comparison-chart-scroll" data-reveal><div ref="costChartEl" class="comparison-chart" role="img" aria-label="九类治疗费用在美国、英国、德国、中国、新加坡和日本的对比柱状图" /></div><div class="saving-tags"><span>心脏搭桥节省69%</span><span>CAR-T细胞免疫治疗节省55%</span><span>PET-CT全身影像筛查节省85%</span><span>质子重离子肿瘤放疗节省53%</span><span>膝关节置换手术节省57%</span></div></div><div class="cost-actions"><button type="button" :aria-expanded="costDetailsExpanded" aria-controls="why-cost-details" @click="costDetailsExpanded = !costDetailsExpanded"><span class="button-label">查看更多病种费用对比详情</span><img class="source-icon cost-action-chevron" :class="{ 'is-open': costDetailsExpanded }" src="/images/figma/why-china-icons/node-143-1757.svg" alt="" /></button><RouterLink to="/report"><span class="button-label">提交病历，获取AI个性化精准预算与来华方案</span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1761.svg" alt="" /></RouterLink></div><small class="disclaimer">中国是唯一同时具备：顶级重症技术、超快就诊时效、亲民治疗成本的跨境医疗目的地。</small><Transition name="cost-details"><div v-show="costDetailsExpanded" id="why-cost-details" class="cost-detail-grid" aria-label="病种费用对比详情"><article v-for="item in costDetailCards" :key="item.title" class="cost-detail-card"><img :src="item.icon" alt="" /><div><h3>{{ item.title }}</h3><p class="cost-detail-metric"><span>{{ item.first[0] }}</span><strong>{{ item.first[1] }}</strong></p><p class="cost-detail-metric"><span>{{ item.second[0] }}</span><strong>{{ item.second[1] }}</strong></p><p class="cost-detail-copy">{{ item.copy }}</p></div></article></div></Transition></div></section>

    <section class="wait-section"><div class="hy-container"><header class="section-title" data-reveal><h2>告别超长排队｜中国就医时效碾压全球</h2><p>欧美、日本、新加坡重症排队数月起，中国实现极速接诊，不延误黄金治疗期</p></header><div class="wait-grid"><article v-for="item in waits" :key="item.value" :class="{ highlight:item.highlight }" data-reveal><div v-if="item.highlight" class="wait-highlight-content"><div class="wait-value"><span>最快</span><strong>{{ item.value }}</strong></div><b>完成检查+手术</b></div><strong v-else>{{ item.value }}</strong><p>{{ item.label }}</p></article></div></div></section>

    <section class="national-section"><div class="hy-container" data-reveal><header><h2>国家级医疗实力 · 权威机构背书</h2><p>依托国内庞大三甲医疗体系，众多国际认证医疗机构，已服务全球百万国际患者</p></header><div class="national-grid"><div v-for="item in nationalStats" :key="item.value"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div><RouterLink to="/cases"><span class="button-label">查看更多各国患者完整故事</span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1821.svg" alt="" /></RouterLink></div></section>

    <section class="stories-section"><div class="hy-container"><header class="section-title" data-reveal><h2>新/马/日/欧美患者真实就医反馈</h2><p>来自各国患者真实就诊经历，客观记录来华治疗全过程</p></header><div class="story-grid"><article v-for="item in stories" :key="item.quote" data-reveal><img :src="item.image" alt="国际患者" /><div class="story-copy"><blockquote>{{ item.quote }}</blockquote><small class="story-meta"><span class="story-dash">—</span><span class="story-meta-label">{{ item.meta }}</span></small></div></article></div></div></section>

    <section class="why-cta"><div class="hy-container" data-reveal><h2>想知道你的病情是否适合来华治疗？</h2><p>提交病历，AI自动生成专属来华就医可行性报告</p><div class="cta-actions"><RouterLink to="/report"><span class="button-label">立即提交病历</span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1922.svg" alt="" /></RouterLink><button type="button" @click="openConsultation"><span class="button-label">免费一对一咨询</span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1927.svg" alt="" /></button></div><small><span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1934.svg" alt="" /><span class="feature-label">适配科室</span></span><span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1934.svg" alt="" /><span class="feature-label">推荐医院</span></span><span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1934.svg" alt="" /><span class="feature-label">治疗方案参考</span></span><span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1934.svg" alt="" /><span class="feature-label">预估预算</span></span><span><img class="source-icon" src="/images/figma/why-china-icons/node-143-1934.svg" alt="" /><span class="feature-label">就诊周期规划</span></span></small></div></section>
  </div>
</template>

<style scoped>
.why-page { margin-top:-64px; color:#1e3a5f; font-family:"PingFang SC",sans-serif; -webkit-font-smoothing:antialiased; }
.why-page :deep(.hy-container) { width:min(1216px,calc(100% - 48px)); }
.why-hero { position:relative; height:757px; overflow:hidden; background:#fff; }
.why-hero__visual { position:absolute; inset:0; background:url('/images/figma/why-china-hero-source.png') center/cover no-repeat; opacity:.4; filter:saturate(.73); }
.why-hero>.hy-container { position:relative; z-index:1; display:flex; height:757px; flex-direction:column; align-items:center; padding-top:180px; text-align:center; }
.why-hero h1 { margin:0; color:#143162; font-size:64px; font-weight:600; line-height:96px; }
.why-hero h1 span:last-child { color:#1e3a5f; white-space:pre; }
.why-hero p { margin:24px 0 0; color:#5b606a; font-size:20px; line-height:30px; }
.why-hero>div>div { display:flex; gap:24px; margin-top:60px; }
.why-hero button,.why-hero a { display:inline-flex; height:62px; align-items:center; justify-content:center; gap:8px; border:0; border-radius:14px; padding:16px 24px; color:#fff; font-size:20px; font-weight:600; line-height:30px; white-space:nowrap; box-shadow:0 4px 6px -4px rgba(0,0,0,.1); cursor:pointer; transition:transform .25s ease,box-shadow .25s ease,background .25s ease; }
.why-hero button { width:160px; background:linear-gradient(90deg,#dd6b20,#3b82f6); }
.why-hero a { width:353px; background:#1e3a5f; }
.why-hero button:hover,.why-hero a:hover { transform:translateY(-2px); background:#dd6b20; box-shadow:0 12px 28px rgba(221,107,32,.22); }
.source-icon { display:block; flex:none; }
.button-label { flex:none; white-space:nowrap; }
.why-hero .source-icon { width:24px; height:24px; }
.section-title { height:80px; text-align:center; }
.section-title h2 { margin:0; color:#1e3a5f; font-family:"PingFang SC",sans-serif; font-size:40px; font-weight:600; line-height:40px; }
.section-title p { margin:0; padding-top:16px; color:#6b7280; font-size:16px; line-height:24px; }
.capability-section { height:1416px; padding:96px 0; background:#fff; }
.capability-layout { display:grid; height:1224px; grid-template-columns:389.33px 802.67px; column-gap:24px; }
.capability-layout aside { position:sticky; top:96px; align-self:start; padding-top:20px; }
.capability-layout aside h2 { margin:0; color:#1e3a5f; font-size:40px; font-weight:600; line-height:60px; }
.capability-layout aside p { margin:16px 0 0; color:#6b7280; font-size:16px; line-height:24px; }
.capability-grid { display:grid; width:802.67px; height:1224px; grid-template-columns:repeat(2,389.33px); grid-auto-rows:min-content; align-content:start; column-gap:24px; row-gap:24px; }
.capability-grid article { position:relative; display:flex; width:389.33px; height:254px; flex-direction:column; align-items:flex-start; align-self:start; border-radius:24px; padding:24px; background:#f5f6f7; cursor:pointer; transition:height .52s cubic-bezier(.22,1,.36,1),transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }
.capability-grid article.open { height:390px; }
.capability-section--multi-expanded,
.capability-section--multi-expanded .capability-layout,
.capability-section--multi-expanded .capability-grid { height:auto; }
.capability-grid article:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(20,49,98,.08); }
.capability-grid .capability-icon { display:block; width:32px; height:32px; flex:none; }
.capability-content { width:100%; margin-top:80px; }
.capability-grid h3 { margin:0; color:#1e3a5f; font-size:24px; font-weight:600; line-height:24px; }
.capability-grid p { margin:16px 0 0; color:#4b5563; font-size:16px; line-height:24px; }
.capability-grid .capability-detail-row { display:flex; width:100%; align-items:center; justify-content:space-between; margin-top:16px; color:#9ca3af; font-size:14px; font-weight:500; line-height:14px; }
.capability-expanded { margin-top:16px; }.capability-grid small { display:block; color:#4b5563; font-size:16px; line-height:24px; }
.capability-grid .capability-chevron { width:14px; height:14px; transition:transform .3s ease; }.capability-grid .capability-chevron.rotated { transform:rotate(180deg); }
.cost-section { min-height:957.260254px; box-sizing:border-box; padding:96px 0; background:#f5f6f7; }
.cost-section--expanded { height:auto; overflow:visible; }
.comparison-chart-scroll { width:1216px; margin-top:48px; }
.comparison-chart { width:1168.02px; height:403.26px; margin-inline:auto; }
.saving-tags { display:flex; width:1216px; max-width:100%; height:48px; justify-content:flex-start; gap:24px; margin-top:48px; overflow:hidden; mask-image:linear-gradient(to right,transparent 0,transparent 40px,#000 160px,#000 calc(100% - 160px),transparent calc(100% - 40px),transparent 100%); }
.saving-tags span { display:flex; flex:none; align-items:center; justify-content:center; border-radius:14px; padding:12px 24px; background:#fff; color:#1e3a5f; font-size:16px; line-height:24px; white-space:nowrap; }
.saving-tags span:nth-child(1) { width:177px; }.saving-tags span:nth-child(2) { width:259px; }.saving-tags span:nth-child(3) { width:268px; }.saving-tags span:nth-child(4) { width:255px; }.saving-tags span:nth-child(5) { width:223px; }
.cost-actions { display:flex; height:52px; justify-content:center; gap:16px; margin-top:48px; }
.cost-actions button,.cost-actions a { display:flex; height:52px; align-items:center; gap:8px; border:0; border-radius:14px; padding:18px 24px; background:#dd6b20; color:#fff; font:600 16px/16px "PingFang SC",sans-serif; white-space:nowrap; box-shadow:0 4px 6px -4px rgba(0,0,0,.1); cursor:pointer; transition:transform .25s ease,background .25s ease; }
.cost-actions button { width:263px; justify-content:center; }.cost-actions a { width:388px; justify-content:center; background:#1e3a5f; }.cost-actions button:hover,.cost-actions a:hover { transform:translateY(-2px); background:#dd6b20; }.cost-actions .source-icon { width:16px; height:16px; }.cost-action-chevron { transition:transform .3s ease; }.cost-action-chevron.is-open { transform:rotate(180deg); }
.disclaimer { display:block; margin-top:16px; color:#6b7280; font-size:14px; line-height:22px; text-align:center; }
.cost-detail-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; padding-top:32px; }
.cost-detail-card { display:flex; min-height:308px; flex-direction:column; justify-content:space-between; gap:24px; border-radius:24px; padding:24px; background:#fff; box-sizing:border-box; transition:transform .35s ease,box-shadow .35s ease; }
.cost-detail-card:hover { transform:translateY(-4px); box-shadow:0 18px 36px rgba(30,58,95,.12); }
.cost-detail-card>img { width:32px; height:32px; }.cost-detail-card h3 { margin:0 0 20px; color:#1e3a5f; font-size:24px; font-weight:600; line-height:24px; }.cost-detail-card p { margin:0; }.cost-detail-metric { display:flex; justify-content:space-between; gap:16px; color:#6b7280; font-size:16px; line-height:16px; }.cost-detail-metric + .cost-detail-metric { margin-top:12px; }.cost-detail-metric strong { color:#2563eb; font-weight:500; }.cost-detail-copy { margin-top:12px !important; color:#4b5563; font-size:16px; line-height:24px; }
.cost-details-enter-active,.cost-details-leave-active { max-height:1100px; overflow:hidden; transition:max-height .42s cubic-bezier(.22,1,.36,1),opacity .3s ease,transform .4s cubic-bezier(.22,1,.36,1); }.cost-details-enter-from,.cost-details-leave-to { max-height:0; opacity:0; transform:translateY(-12px); }
.wait-section { height:552px; padding:96px 0; background:#fff; }
.wait-grid { display:grid; height:232px; grid-template-columns:repeat(3,271px) 331px; gap:24px; margin-top:48px; }
.wait-grid article { position:relative; display:flex; height:232px; flex-direction:column; align-items:center; justify-content:center; gap:12px; border-radius:14px; padding:48px 24px; background:#f5f6f7; }
.wait-grid strong { color:#1e3a5f; font-size:40px; font-weight:600; line-height:40px; }
.wait-grid p { margin:0; color:#6b7280; font-size:16px; line-height:16px; }
.wait-grid article.highlight { gap:16px; background:rgba(221,107,32,.1); color:#dd6b20; }.wait-grid article.highlight strong { color:#dd6b20; }
.wait-grid article.highlight .wait-value { display:flex; height:40px; align-items:baseline; white-space:nowrap; font-size:40px; font-weight:600; line-height:40px; }
.wait-grid article.highlight>div>span { color:#1e3a5f; font-size:16px; font-weight:600; line-height:40px; }
.wait-highlight-content { display:flex; flex-direction:column; align-items:center; gap:8px; }.wait-value>span { color:#1e3a5f; font-size:16px; font-weight:600; line-height:16px; }
.wait-grid article.highlight b { color:#1e3a5f; font-size:16px; font-weight:600; line-height:24px; }
.national-section { position:relative; height:512px; overflow:hidden; padding:96px 0; background:#1e3a5f; color:#fff; }
.national-section::before { content:""; position:absolute; inset:0; background:url('/images/figma/why-china-national-source.png') center/cover no-repeat; opacity:.8; mix-blend-mode:multiply; }
.national-section>.hy-container { position:relative; z-index:1; text-align:center; }
.national-section h2 { margin:0; font-family:"SF Pro",-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif; font-size:40px; font-weight:700; line-height:40px; }.national-section header p { margin:16px 0 0; color:rgba(255,255,255,.7); font-size:16px; line-height:24px; }
.national-grid { display:grid; height:92px; grid-template-columns:repeat(4,286px); gap:24px; margin:48px 0; }
.national-grid div { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; }
.national-grid strong { color:#52e8ff; font-family:"SF Pro",-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif; font-size:56px; font-weight:700; line-height:56px; }.national-grid span { color:#fff; font-family:"SF Pro",-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif; font-size:14px; line-height:20px; }
.national-section a { display:inline-flex; width:267px; height:52px; align-items:center; gap:8px; border-radius:14px; padding:0 24px; background:#dd6b20; color:#fff; font-family:"PingFang SC",sans-serif; font-size:16px; font-weight:600; line-height:16px; transition:transform .25s ease; }.national-section a:hover { transform:translateY(-2px); }.national-section a .source-icon { width:20px; height:20px; }
.stories-section { height:593px; padding:96px 0; background:#fff; }
.story-grid { display:grid; height:273px; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:48px; }
.story-grid article { display:flex; height:273px; flex-direction:column; align-items:flex-start; border-radius:24px; padding:24px; background:#f5f6f7; transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }.story-grid article:hover { transform:translateY(-5px); box-shadow:0 18px 40px rgba(20,49,98,.08); }
.story-grid img { width:60px; height:60px; border-radius:16px; object-fit:cover; }
.story-copy { width:100%; margin-top:80px; }.story-grid blockquote { margin:0; color:#1e3a5f; font-size:16px; font-weight:500; line-height:24px; }.story-meta { display:flex; margin-top:16px; color:#9ca3af; font-family:"DM Sans",sans-serif; font-size:14px; line-height:21px; }.story-dash { width:17px; flex:none; }
.why-cta { height:412px; padding:96px 0; background:#f5f6f7; text-align:center; }
.why-cta>div { height:220px; }.why-cta h2 { margin:0; color:#1e3a5f; font-size:40px; font-weight:600; line-height:40px; }.why-cta p { margin:16px 0 0; color:#6b7280; font-size:16px; line-height:24px; }
.why-cta>div>div { display:flex; height:100px; align-items:flex-start; justify-content:center; gap:16px; padding-top:48px; }.why-cta button,.why-cta a { display:flex; height:52px; align-items:center; justify-content:center; gap:8px; border:0; border-radius:14px; padding:16px 24px; background:#dd6b20; color:#fff; font-size:16px; font-weight:600; line-height:16px; cursor:pointer; transition:transform .25s ease,background .25s ease,box-shadow .25s ease; }.why-cta button { background:#1e3a5f; }.why-cta button:hover,.why-cta a:hover { transform:translateY(-2px); background:#dd6b20; box-shadow:0 10px 24px rgba(221,107,32,.2); }.why-cta>div>div .source-icon { width:16px; height:16px; }
.why-cta small { display:flex; justify-content:center; gap:16px; margin-top:24px; color:#9ca3af; font-size:12px; line-height:16px; }.why-cta small span { display:flex; align-items:center; gap:5px; }.why-cta small .source-icon { width:12px; height:12px; }
.why-cta a { width:172px; }.why-cta button { width:184px; }.why-cta a .source-icon { width:20px; height:20px; }.why-cta small>span { gap:4px; }.why-cta p,.why-cta small { font-family:"SF Pro",-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif; }
.why-cta button { box-shadow:0 4px 6px -4px rgba(0,0,0,.1); }
@media (max-width:1263px) {
  .capability-section { height:auto; }
  .capability-layout { height:auto; grid-template-columns:minmax(230px,1fr) minmax(0,2fr); }
  .capability-grid { width:100%; height:auto; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .capability-grid article,.capability-grid article.open { width:100%; height:auto; min-height:254px; }
  .capability-grid article.open { min-height:390px; }
  .comparison-chart-scroll { max-width:100%; overflow-x:auto; }
  .wait-grid { grid-template-columns:repeat(3,minmax(0,271fr)) minmax(0,331fr); }
  .national-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
}
@media (max-width:900px) {
  .why-page :deep(.hy-container) { width:calc(100% - 40px); }
  .capability-section,.cost-section,.wait-section,.national-section,.stories-section,.why-cta { height:auto; }
  .capability-layout { height:auto; grid-template-columns:230px minmax(0,1fr); gap:32px; }
  .capability-grid { width:100%; height:auto; grid-template-columns:1fr 1fr; grid-template-rows:none; }
  .capability-grid article,.capability-grid article.open { width:100%; height:auto; }
  .wait-grid { height:auto; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .national-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
  .comparison-chart-scroll { max-width:100%; overflow-x:auto; }
}
@media (max-width:700px) {
  .why-page :deep(.hy-container) { width:calc(100% - 32px); }
  .why-hero { height:680px; }.why-hero__visual { background-position:64% center; }.why-hero>.hy-container { height:680px; justify-content:flex-end; padding:0 0 84px; }
  .why-hero h1 { font-size:36px; line-height:1.35; }.why-hero h1 span:last-child { white-space:normal; }.why-hero p { margin-top:18px; font-size:14px; line-height:22px; }
  .why-hero>div>div { width:100%; flex-direction:column; gap:12px; margin-top:26px; }.why-hero button,.why-hero a { width:100%; height:52px; font-size:14px; }
  .section-title { height:auto; }.section-title h2 { font-size:28px; line-height:36px; }.section-title p { padding-top:10px; font-size:14px; line-height:22px; }
  .capability-section,.cost-section,.wait-section,.national-section,.stories-section,.why-cta { padding:64px 0; }
  .capability-layout { display:block; }.capability-layout aside { position:static; padding:0 0 40px; text-align:center; }.capability-layout aside h2 { font-size:30px; line-height:1.4; }.capability-layout aside p { font-size:14px; line-height:24px; }
  .capability-grid { display:grid; grid-template-columns:1fr; gap:16px; }.capability-grid article,.capability-grid article.open { height:auto; min-height:250px; }
  .comparison-chart-scroll { margin-top:32px; }
  .saving-tags { overflow-x:auto; mask-image:none; }.cost-actions,.why-cta>div>div { height:auto; flex-direction:column; }.cost-actions button,.cost-actions a,.why-cta button,.why-cta a { justify-content:center; }
  .cost-actions button,.cost-actions a { width:100%; height:auto; min-height:52px; white-space:normal; line-height:22px; text-align:center; padding:16px 24px; }
  .cost-actions .button-label { min-width:0; flex:1; white-space:normal; }
  .cost-detail-grid { grid-template-columns:1fr; }.cost-details-enter-active,.cost-details-leave-active { max-height:3000px; }
  .wait-grid,.story-grid { height:auto; grid-template-columns:1fr; }.wait-grid article { height:190px; }.wait-grid article.highlight>span { top:66px; left:62px; }
  .national-section { min-height:620px; }.national-grid { height:auto; grid-template-columns:1fr 1fr; gap:28px; }.national-grid strong { font-size:40px; }
  .story-grid article { height:auto; min-height:250px; }.story-copy { margin-top:64px; }.why-cta>div { height:auto; }.why-cta h2 { font-size:30px; line-height:38px; }.why-cta small { flex-wrap:wrap; }.why-cta a,.why-cta button { width:100%; }
}
@media (prefers-reduced-motion:reduce) {
  .why-page * { transition:none !important; }
  .capability-grid article:hover,.story-grid article:hover,.why-hero button:hover,.why-hero a:hover,.cost-actions button:hover,.cost-actions a:hover,.national-section a:hover,.why-cta button:hover,.why-cta a:hover { transform:none; }
}
</style>
