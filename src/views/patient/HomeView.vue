<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { init, use, type ECharts } from 'echarts/core'
import { BarChart, RadarChart } from 'echarts/charts'
import { GraphicComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Building2, HeartHandshake, ScanLine } from 'lucide-vue-next'

use([BarChart, RadarChart, GraphicComponent, GridComponent, CanvasRenderer])

type HeroSlide = {
  eyebrow?: string
  eyebrowIcon?: string
  title: string
  copy?: string
  meta?: string
  image: string
  action?: string
  actionIcon?: string
  link?: string
  bullets?: { title: string; copy: string }[]
}
const heroSlides: HeroSlide[] = [
  { eyebrow: '来华就医首选平台', eyebrowIcon: '/images/figma/home-icons/banner-01-eyebrow.svg', title: '让全球患者安心赴华就医', copy: '从首份病历到回国复查，全程有人替你安排。', image: '/images/figma/home-banner-01-source.png', action: '提交病例 · 3分钟获取方案', actionIcon: '/images/figma/home-icons/banner-01-action.svg', link: '/report' },
  { eyebrow: '用数据说话', eyebrowIcon: '/images/figma/home-icons/banner-02-eyebrow.svg', title: '8000+个家庭已陪伴赴华就医', copy: '覆盖肿瘤、齿科、康养、心脑血管等专科，每月新增XXX个家庭', image: '/images/figma/home-banner-02-source.png' },
  { title: '就医保障，写在前面', image: '/images/figma/home-banner-03-source.png', bullets: [
    { title: '已证正式签约医院', copy: '只与有正式合作协议的知名公立/私立医院合作，资质可查' },
    { title: '公司直属员工', copy: '全流程服务人员均为公司直属员工，非外包、可追溯' },
    { title: '费用清单说清', copy: '费用清单来华前全部列明，无隐藏收费，账单透明' },
    { title: '全周期守护', copy: '出院后按节奏随访，全周期健康守护，由专业再保机构提供保障方案' },
  ] },
  { eyebrow: '真实患者声音', eyebrowIcon: '/images/figma/home-icons/Frame.svg', title: '"来中国是我做过最正确的决定"', copy: '来自俄罗斯、印尼、哈萨克斯坦等国的患者，在中国重获新生', meta: 'M·A，35岁，脊髓肿瘤 → 天坛医院 → 术后3年无复发', image: '/images/figma/patient-hero.png', action: '查看更多案例', actionIcon: '/images/figma/home-icons/Icon-15.svg', link: '/cases' },
]
const heroIndex = ref(3)
const heroSlide = computed(() => heroSlides[heroIndex.value]!)
let heroTimer: number | undefined
function goHero(index: number) { heroIndex.value = (index + heroSlides.length) % heroSlides.length }
function stopHeroTimer() { if (heroTimer) window.clearInterval(heroTimer); heroTimer = undefined }
function startHeroTimer() { stopHeroTimer(); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) heroTimer = window.setInterval(() => goHero(heroIndex.value + 1), 7000) }

const flowSteps = [
  { no: '01', label: '认知', title: '了解为什么选择中国', path: '/why-china' },
  { no: '02', label: '评估', title: '3分钟免费可行性评估', path: '/report' },
  { no: '03', label: '信任', title: '常见疑问解答', path: '/trust' },
  { no: '04', label: '行动', title: '开启来华就医之旅', path: '/steps' },
]
const whyItems = [
  { title: '医疗水平 · 国际领先', copy: '三甲医院手术量与临床经验位居全球前列，多专科国际领先', icon: '/images/figma/home-icons/Icon-19.svg', nodeId: '143:152', link: true },
  { title: '费用优势 · 高性价比', copy: '同等治疗方案，费用比欧美低40-70%，清单事先说清', icon: '/images/figma/home-icons/Icon-17.svg', nodeId: '143:167' },
  { title: '多语言陪诊 · 全程专业', copy: '中英俄阿西等5大语种 + 印尼等小语种，医学背景译员全程陪同', icon: '/images/figma/home-icons/Frame-3.svg', nodeId: '143:176' },
  { title: '顶级专家 · 稀缺可及', copy: '院士、学科带头人、国际知名专家资源，按病症精准匹配', icon: '/images/figma/home-icons/Frame-4.svg', nodeId: '143:184' },
  { title: '康养特色 · 中西结合', copy: '中西医结合+术后康养调理，全周期健康管理', icon: '/images/figma/home-icons/Frame-1.svg', nodeId: '143:192' },
  { title: '签证便利 · 快速通道', copy: '多国公民可申请医疗签证，部分国家免签 / 落地签30天', icon: '/images/figma/home-icons/Frame-2.svg', nodeId: '143:201' },
]
const careSteps = [
  { no: '1', title: '就诊前', copy: '病历评估 · 视频会诊 · 行程规划', icon: ScanLine },
  { no: '2', title: '就诊中', copy: '落地接送 · 入院陪同 · 院中管家', icon: Building2 },
  { no: '3', title: '就诊后', copy: '定期随访 · 专家直连 · 保险理赔', icon: HeartHandshake },
]
const team = [
  { title: '医疗管家', copy: '全程陪同，从入院到出院的医疗事务统筹', image: '/images/figma/team-medical-steward.png', imageSize: '176.246% 132.185%', imagePosition: '-22.433px -0.554px' },
  { title: '陪诊翻译', copy: '多种语言，与医生沟通零障碍', image: '/images/figma/team-interpreter.png', imageSize: '201.646% 151.235%', imagePosition: '-32.539px -3.741px' },
  { title: '医学顾问', copy: '病例初筛 + 多学科会诊协调', image: '/images/figma/team-advisor.png', imageSize: '186.09% 139.568%', imagePosition: '-26.539px -0.741px' },
  { title: '海外协调', copy: '签证、机票、住宿、接送全安排', image: '/images/figma/team-coordinator.png', imageSize: '180.528% 135.396%', imagePosition: '-30.317px -2.195px' },
]
const costs = [
  { label: '心脏搭桥', china: 15, usa: 120, germany: 80, japan: 75 },
  { label: '肿瘤手术', china: 12, usa: 80, germany: 55, japan: 60 },
  { label: '关节置换', china: 8, usa: 55, germany: 35, japan: 40 },
  { label: '脊柱手术', china: 10, usa: 65, germany: 45, japan: 50 },
  { label: '种植牙', china: 1.2, usa: 4.5, germany: 3, japan: 3.5 },
  { label: '牙齿矫正', china: 2.2, usa: 6.5, germany: 4.8, japan: 5 },
]
const hospitals = [
  { name: '上海复旦大学附属肿瘤医院', copy: '肿瘤科全国第1', image: '/images/figma/hospital-shanghai-design.png', imageSize: '126.6% 100%', imagePosition: '92.9% 0%' },
  { name: '北京301医院 (解放军总医院)', copy: '综合排名全国前3', image: '/images/figma/hospital-beijing-design.png', imageSize: '133.4% 100%', imagePosition: '84.59% 0%' },
  { name: '广州中山大学附属第一医院', copy: '器官移植全国第1', image: '/images/figma/hospital-guangzhou-design.jpg', imageSize: '168.881% 126.408%', imagePosition: '42.83% 0%' },
  { name: '四川华西医院', copy: '综合排名全国第2', image: '/images/figma/hospital-huaxi-design.png', imageSize: '224.452% 166.86%', imagePosition: '50.03% 0%' },
]
const experts = [
  { name: '吴一龙', title: '终身首席教授', hospital: '广东省人民医院', specialty: '肺癌、免疫治疗', experience: '35年临床经验，肺癌领域国际权威', image: '/images/figma/expert-wu-yilong-source.png', imageSize: '154.17% 231.255%', imagePosition: '-18.223px -5.221px', imageFlip: true },
  { name: '邵志敏', title: '主任医师/教授', hospital: '上海复旦肿瘤医院', specialty: '乳腺癌综合治疗', experience: '28年临床经验，年手术量超2000例', image: '/images/figma/expert-shao-zhimin-source.png', imageSize: '107.409% 198.93%', imagePosition: '-4.328px 4.28px', imageFlip: true },
  { name: '张俊廷', title: '主任医师/教授', hospital: '北京天坛医院', specialty: '颅底肿瘤、脑干肿瘤', experience: '30年临床经验，手术超万例', image: '/images/figma/expert-zhang-junting-source.png', imageSize: '126.65% 225.067%', imagePosition: '-7.192px -13.387px', imageFlip: false },
  { name: '李进', title: '主任医师/博导', hospital: '上海复旦肿瘤医院', specialty: '消化道肿瘤、靶向治疗', experience: '25年临床经验，主持新药临床50+项', image: '/images/figma/expert-li-jin-source.png', imageSize: '140.689% 187.585%', imagePosition: '-12.413px -0.239px', imageFlip: true },
]
const expertTabs = ['肿瘤科', '心血管科', '骨科']
const activeExpertTab = ref('肿瘤科')
const expertsByTab: Record<string, typeof experts> = { 肿瘤科: experts, 心血管科: [], 骨科: [] }
const visibleExperts = computed(() => expertsByTab[activeExpertTab.value] ?? [])
const radarChartEl = ref<HTMLElement | null>(null)
const costChartEl = ref<HTMLElement | null>(null)
let radarChart: ECharts | undefined
let costChart: ECharts | undefined

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

function chartLegend(xs: number[], y: number, fontSize: number, japan = false) {
  const items = japan ? [...radarSeries, { name: '日本 Japan', color: '#94A3B8' }] : radarSeries
  return items.flatMap((item, index) => [
    { type: 'rect', silent: true, shape: { x: xs[index], y: y + (fontSize === 12 ? 5.09 : 3.85), width: 14, height: 10.5 }, style: { fill: item.color } },
    { type: 'text', silent: true, x: xs[index]! + 18, y, style: { text: item.name, fill: item.color, fontFamily: '"SF Pro", "PingFang SC", sans-serif', fontSize, lineHeight: fontSize * 1.5, verticalAlign: 'top' } },
  ])
}

function initCharts() {
  if (!radarChartEl.value || !costChartEl.value) return
  radarChart?.dispose()
  costChart?.dispose()
  // Render in Figma's coordinate space; CSS scales the complete chart on narrow screens.
  radarChart = init(radarChartEl.value, undefined, { renderer: 'canvas', width: 542, height: 300 })
  costChart = init(costChartEl.value, undefined, { renderer: 'canvas', width: 542, height: 300 })
  radarChart.setOption({
    animation: false,
    radar: {
      center: [271, 150],
      radius: 88.4,
      startAngle: 90,
      splitNumber: 4,
      shape: 'polygon',
      indicator: radarIndicators,
      axisName: { show: false },
      axisLine: { lineStyle: { color: '#E5E7EB', width: 1 } },
      splitLine: { lineStyle: { color: '#E5E7EB', width: 1 } },
      splitArea: { areaStyle: { color: ['transparent'] } },
    },
    series: [{
      type: 'radar',
      symbol: 'none',
      silent: true,
      data: radarSeries.map((item) => ({ value: item.value, name: item.name, lineStyle: { color: item.color, width: 2 }, areaStyle: { color: item.fill, opacity: 1 } })),
    }],
    graphic: [
      ...[
        { text: '治疗费用', x: 249, y: 42.6 },
        { text: '治愈率', x: 354.48, y: 90.8 },
        { text: '等待时间', x: 354.48, y: 187.2 },
        { text: '技术水平', x: 249, y: 235.4 },
        { text: '服务质量', x: 143.52, y: 187.2 },
        { text: '语言支持', x: 143.52, y: 90.8 },
      ].map((label) => ({ type: 'text', silent: true, x: label.x, y: label.y, style: { text: label.text, fill: '#374151', fontFamily: 'Inter, sans-serif', fontSize: 11, verticalAlign: 'top' } })),
      ...[0, 25, 50, 75, 100].map((value, index) => ({ type: 'text', silent: true, x: 279.66 + index * 19.14, y: 145 - index * 11.05, rotation: -Math.PI / 3, style: { text: String(value), fill: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: 10, verticalAlign: 'top' } })),
      ...chartLegend([134.09, 221.71, 301.67], 277, 12),
    ],
  })
  costChart.setOption({
    animation: false,
    grid: { left: 50, right: 5, top: 5, bottom: 47 },
    xAxis: { type: 'category', data: costs.map((item) => item.label), axisLine: { lineStyle: { color: '#666666' } }, axisTick: { alignWithLabel: true, length: 6 }, axisLabel: { color: '#374151', fontFamily: 'Inter, sans-serif', fontSize: 11, interval: 0, margin: 5 }, splitLine: { show: false } },
    yAxis: { type: 'value', max: 120, interval: 30, axisLine: { show: true, lineStyle: { color: '#666666' } }, axisTick: { show: true, length: 6 }, axisLabel: { color: '#6B7280', fontFamily: 'Inter, sans-serif', fontSize: 11 }, splitLine: { lineStyle: { color: '#E5E7EB', type: [3, 3] } } },
    series: [
      { name: '中国 China', type: 'bar', silent: true, barWidth: 13, barGap: '30.76923077%', itemStyle: { color: '#2563EB', borderRadius: [4, 4, 0, 0] }, data: costs.map((item) => item.china) },
      { name: '美国 USA', type: 'bar', silent: true, barWidth: 13, itemStyle: { color: '#1E3A5F', borderRadius: [4, 4, 0, 0] }, data: costs.map((item) => item.usa) },
      { name: '德国 Germany', type: 'bar', silent: true, barWidth: 13, itemStyle: { color: '#C9A84C', borderRadius: [4, 4, 0, 0] }, data: costs.map((item) => item.germany) },
      { name: '日本 Japan', type: 'bar', silent: true, barWidth: 13, itemStyle: { color: '#94A3B8', borderRadius: [4, 4, 0, 0] }, data: costs.map((item) => item.japan) },
    ],
    graphic: [
      ...[50, 90.5835, 171.75, 252.917, 334.083, 415.25, 496.417, 537].map((x) => ({ type: 'line', silent: true, z: -1, shape: { x1: x, y1: 5, x2: x, y2: 253 }, style: { stroke: '#E5E7EB', lineWidth: 1, lineDash: [3, 3] } })),
      ...chartLegend([91.59, 174.63, 250.52, 350.74], 283, 11, true),
    ],
  })
}

function disposeCharts() {
  radarChart?.dispose()
  costChart?.dispose()
  radarChart = undefined
  costChart = undefined
}
function openConsultation() { window.dispatchEvent(new CustomEvent('open-consultation')) }
onMounted(() => { startHeroTimer(); nextTick(initCharts) })
onBeforeUnmount(() => { stopHeroTimer(); disposeCharts() })
</script>

<template>
  <div class="home-page">
    <section class="home-hero" @mouseenter="stopHeroTimer" @mouseleave="startHeroTimer">
      <Transition name="hero-image" mode="out-in"><img :key="heroSlide.image" class="home-hero__image" :class="{ 'home-hero__image--source': heroIndex !== 3 }" :src="heroSlide.image" :alt="heroSlide.title" /></Transition>
      <div class="home-hero__wash" :class="{ 'home-hero__wash--first': heroIndex === 0, 'home-hero__wash--assurance': heroIndex === 2, 'home-hero__wash--patient': heroIndex === 3 }" />
      <button type="button" class="home-hero__arrow home-hero__arrow--left" aria-label="上一张" @click="goHero(heroIndex - 1)"><img src="/images/figma/home-icons/Icon-22.svg" alt="" aria-hidden="true" /></button>
      <button type="button" class="home-hero__arrow home-hero__arrow--right" aria-label="下一张" @click="goHero(heroIndex + 1)"><img src="/images/figma/home-icons/Icon-22.svg" alt="" aria-hidden="true" /></button>
      <div class="hy-container home-hero__inner">
        <Transition name="hero-copy" mode="out-in">
          <div :key="heroIndex" class="home-hero__copy" :class="{ 'home-hero__copy--simple': heroIndex < 2, 'home-hero__copy--assurance': heroIndex === 2 }">
            <span v-if="heroSlide.eyebrow" class="home-hero__eyebrow"><img :src="heroSlide.eyebrowIcon" alt="" aria-hidden="true" />{{ heroSlide.eyebrow }}</span>
            <div class="home-hero__heading"><h1>{{ heroSlide.title }}</h1><p v-if="heroSlide.copy">{{ heroSlide.copy }}</p></div>
            <div v-if="heroSlide.bullets" class="home-hero__bullets"><div v-for="bullet in heroSlide.bullets" :key="bullet.title"><strong><img src="/images/figma/home-icons/banner-03-check.svg" alt="" aria-hidden="true" />{{ bullet.title }}</strong><p>{{ bullet.copy }}</p></div></div>
            <span v-if="heroSlide.meta" class="home-hero__meta">{{ heroSlide.meta }}</span>
            <div v-if="heroSlide.action && heroSlide.link" class="home-hero__button-wrap"><RouterLink :to="heroSlide.link" class="home-hero__button">{{ heroSlide.action }}<img :src="heroSlide.actionIcon" alt="" aria-hidden="true" /></RouterLink></div>
          </div>
        </Transition>
      </div>
      <div class="home-hero__controls"><button v-for="(_, index) in heroSlides" :key="index" type="button" :class="{ active: heroIndex === index }" :aria-label="`第${index + 1}张`" @click="goHero(index)" /></div>
      <button type="button" class="home-hero__assistant" @click="openConsultation"><img src="/images/figma/home-icons/node-143-1146.svg" alt="" />问问寰宇小助手</button>
    </section>

    <section class="home-flow"><div class="hy-container"><header class="section-title" data-reveal><h2>来华就医流程</h2><p>点击步骤卡片跳转到对应页面</p></header><div class="home-flow__line"><RouterLink v-for="step in flowSteps" :key="step.no" :to="step.path" data-reveal><span>{{ step.no }}</span><strong>{{ step.label }}</strong><small>{{ step.title }}</small></RouterLink></div></div></section>

    <section class="why-overview"><div class="hy-container why-overview__layout"><aside data-reveal><div><strong>01</strong></div><h3>认知</h3></aside><div class="why-overview__main"><header class="section-title" data-reveal><h2>为什么来中国就医？</h2><p>不只是选我们，是选这个医疗体系本身的价值</p></header><div class="why-overview__grid"><article v-for="(item,index) in whyItems" :key="item.title" data-reveal :style="{ '--reveal-delay': `${(index % 2) * 60}ms` }"><img class="why-overview__icon" :src="item.icon" :alt="`${item.title}图标`" /><h3>{{ item.title }}</h3><p>{{ item.copy }}</p><RouterLink v-if="item.link" to="/why-china">了解更多<img src="/images/figma/home-icons/Icon-11.svg" alt="" aria-hidden="true" /></RouterLink></article></div></div></div></section>

    <section class="patient-story"><div class="hy-container"><header class="section-title" data-reveal><h2>患者故事 · 真实见证</h2><p>来自全球患者的真实反馈与感恩</p></header><div class="patient-story__card" data-reveal><div class="patient-story__image"><img src="/images/figma/patient-story.png" alt="国际患者康复故事" /><span><i /><i class="active" /><i /></span></div><div class="patient-story__content"><div class="patient-story__top"><b>节省50%</b><blockquote>“天坛医院的张俊廷教授给了我第二次生命。从确诊到手术仅用了5天，术后3年无复发。”</blockquote><div class="patient-story__details"><p><img src="/images/figma/home-icons/node-143-227.svg" alt="" />术后3年无复发</p><p><img src="/images/figma/home-icons/node-143-233.svg" alt="" />北京天坛医院</p></div></div><div class="patient-story__bottom"><small><span>— M·A</span>, 35岁 · 俄罗斯 · 脊髓肿瘤</small><RouterLink to="/cases">了解更多<img src="/images/figma/home-icons/node-143-254.svg" alt="" /></RouterLink></div></div></div></div></section>

    <section class="care-section"><div class="hy-container"><header class="section-title" data-reveal><h2>就医全程陪伴</h2><p>点击任意步骤，看下一步我们要替你做什么</p></header><div class="care-grid"><RouterLink v-for="step in careSteps" :key="step.no" to="/steps" data-reveal><span>{{ step.no }}</span><h3>{{ step.title }}</h3><p>{{ step.copy }}</p></RouterLink></div></div></section>

    <section class="team-section"><div class="hy-container"><header class="section-title" data-reveal><h2>陪你走全程的人</h2><p>公司直属团队，非外包、可追溯</p></header><div class="team-grid"><article v-for="person in team" :key="person.title" data-reveal><span class="team-grid__image" role="img" :aria-label="person.title" :style="{ backgroundImage: `url(${person.image})`, backgroundSize: person.imageSize, backgroundPosition: person.imagePosition }" /><h3>{{ person.title }}</h3><p>{{ person.copy }}</p></article></div></div></section>

    <section class="data-section"><div class="hy-container"><header class="section-title" data-reveal><h2>中国医疗数据优势</h2><p>用数据客观对比，助您做出明智决策</p></header><div class="data-grid"><article class="radar-card" data-reveal><h3>多维度能力对比</h3><div class="source-chart" role="img" aria-label="中国、美国、德国医疗能力雷达图"><div ref="radarChartEl" class="chart-canvas" /></div></article><article class="cost-card" data-reveal><h3>治疗费用对比（千美元）</h3><div class="source-chart" role="img" aria-label="治疗费用对比"><div ref="costChartEl" class="chart-canvas" /></div></article></div></div></section>

    <section class="hospital-section"><div class="hy-container"><header class="section-title" data-reveal><h2>权威合作医院</h2><p>只与中国最高水平的医院官方签约合作</p></header><div class="hospital-grid"><RouterLink v-for="hospital in hospitals" :key="hospital.name" to="/hospitals" data-reveal><span class="hospital-grid__image" role="img" :aria-label="hospital.name" :style="{ backgroundImage: `url(${hospital.image})`, backgroundSize: hospital.imageSize, backgroundPosition: hospital.imagePosition }" /><h3>{{ hospital.name }}</h3><p>{{ hospital.copy }}</p></RouterLink></div></div></section>

    <section class="expert-section"><div class="hy-container"><header class="section-title" data-reveal><h2>权威专家团队</h2><p>按疾病分类，为您推荐各领域顶尖专家</p><div class="expert-tabs" role="tablist"><button v-for="tab in expertTabs" :key="tab" type="button" role="tab" :class="{ active: activeExpertTab === tab }" :aria-selected="activeExpertTab === tab" @click="activeExpertTab = tab">{{ tab }}</button></div></header><div v-if="visibleExperts.length" class="expert-grid" role="tabpanel"><article v-for="expert in visibleExperts" :key="expert.name" data-reveal><div><span class="expert-grid__portrait" role="img" :aria-label="expert.name" :style="{ backgroundImage: `url(${expert.image})`, backgroundSize: expert.imageSize, backgroundPosition: expert.imagePosition, transform: expert.imageFlip ? 'scaleX(-1)' : 'none' }" /><h3>{{ expert.name }}</h3></div><div class="expert-grid__body"><div class="expert-grid__details"><p><img src="/images/figma/home-icons/node-143-760.svg" alt="" />{{ expert.title }}</p><p><img src="/images/figma/home-icons/node-143-766.svg" alt="" />{{ expert.hospital }}</p></div><div class="expert-grid__specialty"><strong>擅长: {{ expert.specialty }}</strong><small>{{ expert.experience }}</small></div></div></article></div><div v-else class="expert-empty" role="tabpanel"><p>{{ activeExpertTab }}专家资料正在更新</p><button type="button" @click="openConsultation">提交病历，由医疗顾问人工匹配</button></div></div></section>

    <section class="strength-section"><div class="hy-container"><header class="section-title" data-reveal><h2>我们的实力</h2><p>用专业和实力赢得全球患者信赖</p></header><div class="strength-layout"><div data-reveal><h3>八千多个海外患者的生命与健康托付</h3><p>来自全球80+国家和地区的患者选择信赖我们</p></div><span class="strength-layout__image" role="img" aria-label="全球患者医疗协同" data-reveal /></div></div></section>

    <section class="partners-section"><header class="section-title hy-container" data-reveal><h2>合作伙伴</h2><p>携手全球顶尖企业与保险公司，为患者提供全方位保障</p></header><div class="partners-marquee"><div><img src="/images/figma/partners-matrix.png" alt="全球合作伙伴" /><img src="/images/figma/partners-matrix.png" alt="" aria-hidden="true" /></div></div></section>

    <section class="home-cta"><div class="hy-container" data-reveal><h2>准备好开启您的来华就医之旅了吗？</h2><p>我们的医疗顾问团队随时为您提供免费咨询</p><div><button type="button" class="cta-white" @click="openConsultation"><img src="/images/figma/home-icons/node-143-996.svg" alt="" />免费问阿宁</button><RouterLink to="/report" class="cta-outline"><img src="/images/figma/home-icons/node-143-1000.svg" alt="" />生成可行性报告</RouterLink><button type="button" class="cta-dark" @click="openConsultation">预约专家面诊 $185起<img src="/images/figma/home-icons/node-143-1005.svg" alt="" /></button></div><small><span><img src="/images/figma/home-icons/node-143-1010.svg" alt="" />免费咨询</span><span><img src="/images/figma/home-icons/node-143-1015.svg" alt="" />无隐藏费用</span><span><img src="/images/figma/home-icons/node-143-1020.svg" alt="" />24小时响应</span></small></div></section>
  </div>
</template>

<style scoped>
.home-page { margin-top:-64px; background:#fff; color:#1e3a5f; font-family:'PingFang SC',sans-serif; }
.home-page :deep(.hy-container) { width:min(1216px,calc(100% - 48px)); }
.home-hero { position:relative; height:754px; overflow:hidden; isolation:isolate; background:#eaf4f9; }
.home-hero__image,.home-hero__wash { position:absolute; inset:0; }
.home-hero__image { z-index:-2; width:1440.72px; height:757px; object-fit:fill; object-position:left top; }
.home-hero__image--source { width:100%; height:100%; object-fit:fill; }
.home-hero__wash { z-index:-1; background:linear-gradient(90deg,#ebf3f8 0%,rgba(235,243,248,0) 100%); }
.home-hero__wash--first { width:1290px; }
.home-hero__wash--assurance { display:none; }
.home-hero__wash--patient { background:transparent; }
.home-hero__inner { display:flex; height:754px; align-items:center; }
.home-hero__copy { display:flex; width:730px; height:362px; flex-direction:column; align-items:flex-start; gap:40px; }
.home-hero__copy--simple,.home-hero__copy--assurance { height:auto; }
.home-hero__copy--assurance { gap:48px; }
.home-hero__copy--assurance .home-hero__heading { height:auto; }
.home-hero__bullets { display:flex; flex-direction:column; gap:32px; }
.home-hero__bullets>div { display:flex; flex-direction:column; gap:12px; }
.home-hero__bullets strong { display:flex; align-items:center; gap:8px; color:#143162; font-size:20px; font-weight:600; line-height:20px; }
.home-hero__bullets img { width:20px; height:20px; }
.home-hero__bullets p { font-size:18px; line-height:18px; }
.home-hero__eyebrow { display:inline-flex; height:34px; align-items:center; gap:4px; border:0; border-radius:9999px; padding:0 16px; background:rgba(37,99,235,.1); color:#2563eb; font-size:14px; line-height:14px; white-space:nowrap; }
.home-hero__eyebrow img { width:14px; height:14px; flex:none; }
.home-hero__heading { display:flex; height:94px; flex-direction:column; gap:24px; }
.home-hero h1 { width:732px; margin:0; color:#143162; font-family:"PingFang SC",sans-serif; font-size:52px; font-weight:600; line-height:52px; white-space:nowrap; }
.home-hero p { margin:0; color:#5b606a; font-family:"PingFang SC",sans-serif; font-size:18px; font-weight:400; line-height:18px; white-space:nowrap; }
.home-hero__meta { display:flex; width:max-content; max-width:100%; height:46px; align-items:center; border:1px solid rgba(37,99,235,.2); border-radius:10px; padding:0 12px; background:rgba(255,255,255,.1); color:#3b82f6; font-size:14px; line-height:20px; white-space:nowrap; }
.home-hero__button-wrap { height:68px; padding-top:16px; }
.home-hero__button { display:inline-flex; width:168px; height:52px; align-items:center; justify-content:center; gap:10px; border-radius:14px; padding:0 24px; background:#1e3a5f; color:#fff; font-size:16px; font-weight:600; line-height:16px; white-space:nowrap; box-shadow:0 4px 6px -4px rgba(0,0,0,.1); transition:transform .25s ease,background .25s ease,box-shadow .25s ease; }
.home-hero__copy--simple .home-hero__button-wrap { height:72px; }
.home-hero__copy--simple .home-hero__button { width:auto; height:56px; }
.home-hero__button:hover { transform:translateY(-2px); background:#dd6b20; box-shadow:0 12px 28px rgba(221,107,32,.24); }
.home-hero__button img { width:16px; height:16px; }
.home-hero__arrow { position:absolute; top:50%; z-index:2; display:grid; width:48px; height:48px; place-items:center; border:0; border-radius:50%; background:#fff; color:#1e3a5f; cursor:pointer; transform:translateY(-50%); transition:transform .25s ease,background .25s ease; }
.home-hero__arrow:hover { transform:translateY(-50%) scale(1.06); background:#fff; }
.home-hero__arrow img { width:24px; height:24px; }
.home-hero__arrow--left img { transform:rotate(180deg); }
.home-hero__arrow--left { right:auto!important; left:24px!important; }
.home-hero__arrow--right { right:24px!important; left:auto!important; }
.home-hero__controls { position:absolute; bottom:26px; left:50%; display:flex; height:10px; gap:8px; transform:translateX(-50%); }
.home-hero__controls button { width:10px; height:10px; border:0; border-radius:5px; padding:0; background:#d1d7db; cursor:pointer; transition:width .25s ease,background .25s ease; }
.home-hero__controls button.active { width:32px; background:#dd6b20; }
.home-hero__assistant { position:absolute; top:686px; right:24px; z-index:3; display:flex; align-items:center; gap:8px; border:0; border-radius:9999px; padding:12px 16px; background:linear-gradient(135deg,#dd6b20,#3b82f6); box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1); color:#fff; font-family:'SF Pro','PingFang SC',sans-serif; font-size:14px; font-weight:500; line-height:20px; cursor:pointer; }
.home-hero__assistant img { width:20px; height:20px; }
.hero-image-enter-active,.hero-image-leave-active,.hero-copy-enter-active,.hero-copy-leave-active { transition:opacity .55s ease,transform .65s cubic-bezier(.22,1,.36,1),filter .5s ease; }
.hero-image-enter-from,.hero-image-leave-to { opacity:0; transform:scale(1.025); filter:blur(3px); }
.hero-copy-enter-from { opacity:0; transform:translateY(16px); }
.hero-copy-leave-to { opacity:0; transform:translateY(-10px); }
.section-title { height:80px; text-align:center; }
.section-title h2 { margin:0; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:40px; font-weight:700; line-height:40px; }
.section-title p { margin:0; padding-top:16px; color:#6b7280; font-size:16px; line-height:24px; }
.home-flow { height:516px; border-bottom:1px solid #e5e7eb; padding:96px 0; background:#fff; }
.home-flow__line { position:relative; display:grid; height:244px; grid-template-columns:repeat(4,minmax(0,1fr)); margin-top:0; padding-top:68px; }
.home-flow__line a:not(:last-child)::after { position:absolute; top:38px; left:202px; width:185px; height:4px; border:2px dashed #fcf1e9; content:''; }
.home-flow__line a { position:relative; z-index:1; display:flex; width:285px; height:176px; box-sizing:border-box; flex-direction:column; align-items:center; padding:0 20px; text-align:center; }
.home-flow__line a>span { display:grid; width:80px; height:80px; flex:none; box-sizing:border-box; place-items:center; border:0; outline:20px solid #fcf1e9; border-radius:40px; background:#fff; color:#1e3a5f; font-family:'PingFang SC',sans-serif; font-size:32px; font-weight:600; line-height:80px; transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }
.home-flow__line a:hover>span { transform:translateY(-4px); box-shadow:0 14px 30px rgba(221,107,32,.13); }
.home-flow__line strong { width:100%; height:64px; box-sizing:border-box; padding-top:40px; color:#dd6b20; font-family:'SF Pro','PingFang SC',sans-serif; font-size:24px; font-weight:700; line-height:24px; }
.home-flow__line small { width:100%; height:32px; padding-top:16px; color:#6b7280; font-family:'SF Pro','PingFang SC',sans-serif; font-size:16px; line-height:16px; }
.why-overview { height:1208px; padding:96px 0; background:#f5f6f7; }
.why-overview__layout { display:grid; height:1016px; grid-template-columns:220px 802px; justify-content:space-between; margin-top:0; }
.why-overview aside { position:sticky; top:96px; align-self:start; display:flex; height:650px; align-items:center; margin-top:183px; padding:0; }
.why-overview aside::before { position:absolute; top:0; bottom:0; left:74px; width:8px; background:linear-gradient(180deg,#f5f6f7,transparent 35%,transparent 65%,#f5f6f7),repeating-linear-gradient(180deg,rgba(30,58,95,.1) 0 15px,transparent 15px 31px); content:''; }
.why-overview aside div { position:relative; z-index:1; display:grid; width:160px; height:160px; flex:none; place-items:center; border:20px solid rgba(30,58,95,.1); border-radius:80px; background:#1e3a5f; background-clip:padding-box; color:#fff; }
.why-overview aside strong { font-family:Poppins,sans-serif; font-size:48px; font-weight:500; line-height:120px; }
.why-overview aside h3 { position:relative; z-index:1; margin:0 0 0 20px; padding:4px 0; background:#f5f6f7; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:30px; font-weight:700; line-height:48px; white-space:nowrap; }
.why-overview .section-title h2,.patient-story .section-title h2 { font-family:'PingFang SC',sans-serif; font-weight:600; }
.why-overview__main { width:802px; height:1016px; }
.why-overview__main .section-title { width:802px; text-align:left; }
.why-overview__grid { display:grid; width:802px; height:936px; grid-template-columns:repeat(2,389px); grid-template-rows:repeat(3,280px); gap:24px; padding-top:48px; }
.why-overview__grid article { display:flex; width:389px; height:280px; flex-direction:column; align-items:flex-start; border-radius:24px; padding:24px; background:#fff; box-shadow:none; transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }
.why-overview__grid article:hover { transform:translateY(-6px); box-shadow:0 18px 36px rgba(19,55,84,.09); }
.why-overview__grid .why-overview__icon { width:32px; height:32px; flex:none; object-fit:contain; }
.why-overview__grid h3 { margin:auto 0 16px; color:#1e3a5f; font-size:24px; line-height:24px; font-weight:600; }
.why-overview__grid p { margin:0; color:#4b5563; font-size:16px; line-height:24px; }
.why-overview__grid a { display:flex; align-items:center; gap:4px; margin-top:16px; color:#dd6b20; font-size:16px; font-weight:500; line-height:16px; }
.why-overview__grid a img { width:16px; height:16px; margin:0; }
.patient-story { height:720px; padding:96px 0; background:#fff; }
.patient-story__card { display:grid; height:448px; grid-template-columns:389.33px 1fr; gap:24px; margin-top:0; padding-top:48px; }
.patient-story__image { position:relative; height:400px; overflow:hidden; border-radius:24px; }
.patient-story__image img { width:100%; height:100%; object-fit:cover; object-position:60.7% 0; }
.patient-story__image>span { position:absolute; bottom:24px; left:50%; display:flex; gap:8px; transform:translateX(-50%); }
.patient-story__image i { width:10px; height:10px; border-radius:9999px; background:rgba(255,255,255,.2); }
.patient-story__image i.active { width:32px; background:#dd6b20; }
.patient-story__content { display:flex; min-width:0; height:400px; flex-direction:column; justify-content:space-between; align-items:flex-start; border-radius:24px; padding:32px; background:#f5f6f7; }
.patient-story__top { display:flex; width:100%; flex-direction:column; align-items:flex-start; }
.patient-story__bottom { display:flex; width:100%; align-items:flex-end; justify-content:space-between; }
.patient-story__card b { border-radius:23px 47px 47px 23px; padding:4px 12px; background:#2563eb; color:#fff; font-size:14px; font-weight:400; line-height:21px; }
.patient-story blockquote { width:100%; margin:24px 0 0; color:#1e3a5f; font-size:24px; font-weight:500; line-height:36px; }
.patient-story__details { width:339.33px; max-width:100%; padding-top:24px; }
.patient-story__card p { display:flex; align-items:center; gap:8px; margin:0; color:#4b5563; font-size:16px; line-height:16px; }
.patient-story__details p + p { padding-top:16px; }
.patient-story__card p img { width:16px; height:16px; }
.patient-story__card small { color:#9ca3af; font-family:'DM Sans',sans-serif; font-size:14px; line-height:14px; }
.patient-story__card small span { color:#0f162e; }
.patient-story__card a { display:flex; height:52px; align-items:center; gap:8px; border-radius:14px; padding:18px 24px; background:#dd6b20; color:#fff; font-size:16px; font-weight:600; line-height:16px; }
.patient-story__card a { box-shadow:0 4px 6px -4px rgba(0,0,0,.1); }
.patient-story__card a img { width:16px; height:16px; }
.care-section { height:544px; padding:96px 0; background:#f5f6f7; }
.care-grid { display:grid; height:272px; grid-template-columns:repeat(3,1fr); gap:24px; padding-top:48px; }
.care-grid a { position:relative; display:flex; height:224px; flex-direction:column; align-items:flex-start; justify-content:flex-end; overflow:hidden; border-radius:24px; padding:24px; background:#fff; transition:transform .35s ease,box-shadow .35s ease; }
.care-grid a:hover { transform:translateY(-5px); box-shadow:0 17px 35px rgba(22,58,89,.08); }
.care-grid a>span { position:absolute; top:24px; left:24px; display:grid; width:32px; height:32px; place-items:center; border:1px solid #2563eb; border-radius:50%; color:#2563eb; font-family:'Alibaba PuHuiTi','PingFang SC',sans-serif; font-size:16px; line-height:24px; }
.care-grid h3 { margin:0 0 16px; color:#1e3a5f; font-size:24px; line-height:24px; font-weight:600; }
.care-grid p { margin:0; color:#4b5563; font-size:16px; line-height:24px; }
.team-section { height:596px; padding:96px 0; background:#fff; }
.team-grid { display:grid; height:324px; grid-template-columns:repeat(4,1fr); gap:24px; padding-top:48px; }
.team-grid article { position:relative; width:286px; height:276px; border-radius:24px; padding:24px; background:#f5f6f7; transition:transform .35s ease,background .3s ease,box-shadow .35s ease; }
.team-grid article:hover { transform:translateY(-5px); background:#fff; box-shadow:0 17px 35px rgba(22,58,89,.08); }
.team-grid__image { display:block; width:60px; height:60px; border-radius:16px; background-repeat:no-repeat; }
.team-grid h3 { margin:80px 0 16px; color:#1e3a5f; font-size:24px; line-height:24px; font-weight:600; }
.team-grid article:not(:first-child) { display:flex; flex-direction:column; }
.team-grid article:not(:first-child) h3 { margin-top:auto; }
.team-grid p { margin:0; color:#4b5563; font-family:"PingFang SC",sans-serif; font-size:16px; line-height:24px; }
.data-section { height:740px; padding:96px 0; background:#f5f6f7; }
.data-grid { display:grid; height:468px; grid-template-columns:repeat(2,592px); gap:32px; padding-top:48px; }
.data-grid article { width:592px; min-width:0; height:420px; border-radius:24px; padding:40px 24px; background:#fff; }
.data-grid h3 { margin:0; text-align:center; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:24px; line-height:24px; font-weight:700; }
.source-chart { position:relative; display:block; width:542px; height:auto; aspect-ratio:542 / 300; max-width:100%; margin-top:16px; overflow:hidden; }
.chart-canvas { position:absolute; inset:0; width:100%!important; height:100%!important; }
.chart-canvas :deep(>div),.chart-canvas :deep(canvas) { width:100%!important; height:100%!important; }
.radar { width:min(280px,100%); margin:28px auto 0; }
.radar svg { width:100%; overflow:visible; }
.radar text { fill:#758698; font-size:11px; text-anchor:middle; }
.chart-legend { display:flex; flex-wrap:wrap; justify-content:center; gap:18px; color:#687b8d; font-size:11px; }
.chart-legend span { display:flex; align-items:center; gap:5px; }
.chart-legend i { width:9px; height:9px; }
.chart-legend .blue { background:#2b6ff7; }
.chart-legend .navy { background:#233f63; }
.chart-legend .gold { background:#d5a72f; }
.chart-legend .gray { background:#95a5b8; }
.cost-chart { position:relative; display:grid; grid-template-columns:repeat(6,1fr); gap:8px; align-items:end; height:267px; margin-top:20px; padding-left:28px; border-bottom:1px solid #dce4ea; background:repeating-linear-gradient(to bottom,#e9eef2 0,#e9eef2 1px,transparent 1px,transparent 61px); }
.cost-chart>div:not(.cost-axis) { display:flex; height:267px; flex-direction:column; justify-content:flex-end; align-items:center; }
.cost-chart>div:not(.cost-axis)>div { display:flex; height:225px; align-items:flex-end; gap:3px; }
.cost-axis { position:absolute; top:-6px; bottom:16px; left:0; display:flex; flex-direction:column; justify-content:space-between; color:#6b7280; font-size:9px; line-height:10px; }
.cost-chart i { display:block; width:9px; min-height:3px; border-radius:2px 2px 0 0; }
.cost-chart .china { background:#2b6ff7; }
.cost-chart .usa { background:#233f63; }
.cost-chart .germany { background:#d5a72f; }
.cost-chart .japan { background:#95a5b8; }
.cost-chart>div:not(.cost-axis)>span { margin-top:9px; color:#65778a; font-size:9px; white-space:nowrap; }
.hospital-section { height:703px; padding:96px 0; background:#fff; }
.hospital-grid { display:grid; height:431px; grid-template-columns:repeat(4,286px); gap:24px; padding-top:48px; }
.hospital-grid a { height:383px; transition:transform .35s ease; }
.hospital-grid a:hover { transform:translateY(-5px); }
.hospital-grid__image { display:block; width:286px; height:286px; border-radius:24px; background-repeat:no-repeat; }
.hospital-grid h3 { margin:24px 0 0 8px; color:#1e3a5f; font-size:22px; line-height:22px; font-weight:600; }
.hospital-grid p { margin:16px 0 0 8px; color:#6b7280; font-size:14px; line-height:20px; }
.expert-section { height:667px; padding:96px 0; background:#f5f6f7; }
.expert-section .section-title { height:169px; }
.expert-section .section-title h2,.strength-section .section-title h2,.partners-section .section-title h2 { line-height:39px; }
.expert-tabs { display:flex; height:90px; justify-content:center; gap:12px; margin:0; padding-top:48px; }
.expert-tabs button { height:42px; border:1px solid #dbdee6; border-radius:24px; padding:0 24px; background:transparent; color:#1e3a5f; font-size:16px; line-height:18px; cursor:pointer; }
.expert-tabs button.active { font-weight:500; }
.expert-tabs button:not(.active) { line-height:16px; }
.expert-tabs button.active { border-color:#dd6b20; background:#dd6b20; color:#fff; }
.expert-grid { display:grid; height:306px; grid-template-columns:repeat(4,286px); gap:24px; margin:0; padding-top:40px; }
.expert-grid article { display:flex; width:286px; height:266px; flex-direction:column; gap:24px; border-radius:24px; padding:24px; background:#fff; }
.expert-grid article:nth-child(1) { grid-column:3; grid-row:1; }
.expert-grid article:nth-child(2) { grid-column:4; grid-row:1; }
.expert-grid article:nth-child(3) { grid-column:1; grid-row:1; }
.expert-grid article:nth-child(4) { grid-column:2; grid-row:1; }
.expert-grid article>div:first-child { display:flex; height:60px; align-items:center; gap:12px; }
.expert-grid__portrait { display:block; width:60px; height:60px; flex:none; border-radius:16px; background-color:#5b5d63; background-repeat:no-repeat; }
.expert-grid__body { display:flex; flex-direction:column; }
.expert-grid__details,.expert-grid__specialty { display:flex; flex-direction:column; }
.expert-grid__specialty { padding-top:48px; }
.expert-grid h3 { margin:0; color:#1e3a5f; font-size:24px; line-height:24px; font-weight:600; }
.expert-grid article:nth-child(2) h3 { color:#0f162e; }
.expert-grid p { display:flex; align-items:center; gap:8px; margin:0; color:#4b5563; font-size:14px; line-height:16px; }
.expert-grid p+p { margin-top:12px; }
.expert-grid p img { width:14px; height:14px; flex:none; }
.expert-grid strong { display:block; margin-top:auto; color:#1e3a5f; font-size:16px; line-height:16px; font-weight:500; }
.expert-grid small { display:block; margin-top:12px; color:#6b7280; font-size:14px; line-height:14px; }
.expert-empty { display:grid; height:306px; place-content:center; justify-items:center; gap:18px; padding-top:40px; color:#6b7280; text-align:center; }
.expert-empty p { margin:0; font-size:16px; }
.expert-empty button { min-height:44px; border:0; border-radius:14px; padding:0 22px; background:#1e3a5f; color:#fff; cursor:pointer; }
.strength-section { height:699px; padding:96px 0; background:#fff; }
.strength-section .section-title { height:79px; }
.strength-layout { display:grid; height:428px; grid-template-columns:repeat(2,596px); gap:24px; align-items:start; margin:0; padding-top:48px; }
.strength-layout>div { display:flex; height:380px; flex-direction:column; justify-content:center; }
.strength-layout h3 { max-width:596px; margin:0; color:#1e3a5f; font-size:36px; font-weight:600; line-height:36px; }
.strength-layout p { width:480px; max-width:100%; margin:0; padding:32px 0 16px; color:#4b5563; font-family:'DM Sans',sans-serif; font-size:18px; line-height:27px; }
.strength-layout__image { display:block; width:596px; height:409px; margin-top:-14.5px; border-radius:28px; background:url('/images/figma/home-global-care-source.png') 0 -0.5px / 100% 103.918% no-repeat; }
.partners-section { height:791px; overflow:hidden; padding:96px 0; background:#f5f6f7; }
.partners-section .section-title { height:127px; padding-bottom:48px; }
.partners-marquee { width:1440px; height:472px; margin:0; mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent); }
.partners-marquee>div { display:flex; width:max-content; height:472px; animation:partner-loop 55s linear infinite; }
.partners-marquee:hover>div { animation-play-state:paused; }
.partners-marquee img { width:1440px; height:472px; flex:none; object-fit:cover; }
.home-cta { height:412px; padding:96px 0; background:linear-gradient(90deg,#dd6b20 0%,#3b82f6 100%); color:#fff; text-align:center; }
.home-cta>div { height:220px; }
.home-cta h2 { margin:0; font-size:40px; font-weight:600; line-height:40px; letter-spacing:0; }
.home-cta p { margin:16px 0 0; color:rgba(255,255,255,.8); font-size:16px; line-height:24px; }
.home-cta p { font-family:'SF Pro','PingFang SC',sans-serif; }
.home-cta>div>div { display:flex; height:100px; align-items:flex-start; justify-content:center; gap:16px; padding-top:48px; }
.home-cta button,.home-cta a { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:14px; padding:12px 24px; font-size:16px; font-weight:600; line-height:24px; cursor:pointer; }
.cta-white { height:52px; padding:16px 24px !important; line-height:16px !important; }
.cta-outline,.cta-dark { height:52px; }
.home-cta button img,.home-cta a img { width:20px; height:20px; }
.home-cta .cta-white img { width:20px; height:20px; }
.home-cta small span { display:flex; align-items:center; gap:6px; }
.home-cta small img { width:12px; height:12px; }
.cta-white { border:0; background:#fff; color:#dd6b20; box-shadow:0 4px 6px -4px rgba(0,0,0,.1); }
.cta-outline { border:2px solid #fff; color:#fff; }
.cta-dark { border:0; background:#1e3a5f; color:#fff; box-shadow:0 1px 3px rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1); }
.home-cta small { display:flex; justify-content:center; gap:16px; margin-top:24px; color:rgba(255,255,255,.58); font-size:12px; line-height:16px; }
@keyframes partner-loop { to { transform:translateX(-50%); } }
@media (max-width:900px) {
  .home-page :deep(.hy-container) { width:calc(100% - 40px); }
  .home-hero__copy { max-width:70vw; }
  .home-hero h1 { width:auto; white-space:normal; }
  .why-overview,.patient-story,.care-section,.team-section,.data-section,.hospital-section,.expert-section,.strength-section,.partners-section,.home-cta { height:auto; }
  .why-overview__layout { height:auto; grid-template-columns:160px minmax(0,1fr); gap:32px; }
  .why-overview aside { height:650px; }
  .why-overview__main,.why-overview__main .section-title,.why-overview__grid { width:100%; height:auto; }
  .why-overview__grid { grid-template-columns:1fr; grid-template-rows:none; }
  .why-overview__grid article { width:100%; }
  .data-grid,.hospital-grid,.expert-grid,.team-grid,.strength-layout { width:100%; height:auto; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .data-grid article,.hospital-grid a,.hospital-grid img,.expert-grid article,.team-grid article,.strength-layout>div,.strength-layout__image { width:100%; }
  .expert-grid article:nth-child(n) { grid-column:auto; grid-row:auto; }
  .expert-grid article:nth-child(3) { order:1; }
  .expert-grid article:nth-child(4) { order:2; }
  .expert-grid article:nth-child(1) { order:3; }
  .expert-grid article:nth-child(2) { order:4; }
  .partners-marquee { width:100vw; }
}
@media (max-width:700px) {
  .home-page { margin-top:-64px; }
  .home-page :deep(.hy-container) { width:calc(100% - 32px); }
  .home-hero,.home-hero__inner { height:680px; min-height:680px; }
  .home-hero__image { width:100%; height:100%; object-fit:cover; object-position:67% center; }
  .home-hero__wash { width:100%; background:linear-gradient(180deg,rgba(241,249,252,.2),rgba(241,249,252,.88) 47%,#f1f9fc 100%); }
  .home-hero__wash--assurance { display:block; background:linear-gradient(180deg,rgba(241,249,252,.08),rgba(241,249,252,.82) 43%,rgba(241,249,252,.92) 100%); }
  .home-hero__inner { align-items:flex-end; padding-bottom:82px; }
  .home-hero__copy { width:100%; max-width:none; height:auto; gap:22px; }
  .home-hero__eyebrow { height:30px; padding:0 12px; font-size:12px; line-height:30px; }
  .home-hero__heading { width:100%; height:auto; gap:12px; }
  .home-hero__copy--assurance { gap:22px; }
  .home-hero__bullets { gap:16px; }
  .home-hero__bullets>div { gap:6px; }
  .home-hero__bullets strong { font-size:16px; line-height:20px; }
  .home-hero__bullets p { font-size:13px; line-height:18px; }
  .home-hero h1 { width:100%; font-size:34px; line-height:1.2; white-space:normal; text-wrap:balance; }
  .home-hero p { font-size:14px; line-height:1.55; white-space:normal; }
  .home-hero__meta { height:auto; min-height:42px; white-space:normal; text-wrap:balance; }
  .home-hero__button-wrap { height:auto; padding-top:0; }
  .home-hero__button { width:auto; min-width:168px; height:48px; font-size:14px; }
  .home-hero__arrow { top:auto; bottom:18px; width:42px; height:42px; }
  .home-hero__arrow--left { right:auto!important; left:16px!important; }
  .home-hero__arrow--right { right:16px!important; left:auto!important; }
  .home-hero__controls { bottom:33px; }
  .home-hero__assistant { display:none; }
  .section-title { height:auto; }
  .section-title h2 { font-size:28px; line-height:34px; }
  .section-title p { padding-top:10px; font-size:14px; line-height:22px; }
  .home-flow { height:auto; padding:64px 0; }
  .home-flow__line { height:auto; grid-template-columns:1fr 1fr; gap:34px 8px; padding-top:40px; }
  .home-flow__line a:not(:last-child)::after { display:none; }
  .home-flow__line a { width:100%; height:auto; padding:0 6px; }
  .home-flow__line a>span { width:80px; height:80px; border-width:14px; font-size:23px; line-height:52px; }
  .home-flow__line strong { height:auto; padding-top:16px; font-size:20px; line-height:24px; }
  .home-flow__line small { height:auto; padding-top:6px; font-size:13px; line-height:20px; }
  .why-overview { padding:64px 0; }
  .why-overview__layout { display:block; height:auto; }
  .why-overview aside { position:static; height:auto; justify-content:center; margin:0 0 40px; }
  .why-overview aside::before { display:none; }
  .why-overview aside div { width:96px; height:96px; border-width:12px; }
  .why-overview aside strong { font-size:30px; line-height:72px; }
  .why-overview aside h3 { margin-left:14px; font-size:22px; }
  .why-overview__main,.why-overview__main .section-title,.why-overview__grid { width:100%; height:auto; }
  .why-overview__main .section-title { text-align:center; }
  .why-overview__grid { grid-template-columns:1fr; grid-template-rows:none; padding-top:40px; }
  .why-overview__grid article { width:100%; height:230px; }
  .patient-story { padding:64px 0; }
  .patient-story__card { height:auto; grid-template-columns:1fr; padding-top:40px; }
  .patient-story__image { height:340px; }
  .patient-story__content { height:380px; padding:24px; }
  .patient-story__bottom { gap:12px; }
  .patient-story blockquote { font-size:20px; }
  .care-section,.team-section,.data-section,.hospital-section,.expert-section,.strength-section,.partners-section { padding:64px 0; }
  .care-grid,.team-grid,.data-grid,.hospital-grid,.expert-grid,.strength-layout { width:100%; height:auto; grid-template-columns:1fr; gap:24px; padding-top:40px; }
  .care-grid a { height:210px; }
  .team-grid article { width:100%; height:250px; }
  .data-grid article { width:100%; height:420px; padding:32px 16px; }
  .cost-chart i { width:6px; }
  .cost-chart>div:not(.cost-axis)>span { font-size:7px; }
  .hospital-grid a { width:100%; height:auto; }
  .hospital-grid img { width:100%; height:auto; aspect-ratio:1; }
  .hospital-grid h3,.hospital-grid p { margin-left:0; }
  .expert-section .section-title { height:auto; }
  .expert-tabs { height:auto; flex-wrap:wrap; padding-top:30px; }
  .expert-tabs button { height:40px; font-size:14px; }
  .expert-grid { margin-top:0; }
  .expert-grid article { width:100%; height:266px; }
  .strength-section .section-title { height:auto; }
  .strength-layout>div { height:auto; min-height:220px; }
  .strength-layout h3 { font-size:26px; line-height:34px; }
  .strength-layout p { margin-top:20px; }
  .strength-layout__image { width:100%; height:auto; margin-top:0; aspect-ratio:596/409; }
  .partners-section .section-title { height:auto; padding-bottom:0; }
  .partners-marquee { width:100vw; height:auto; margin:40px 0 0 -16px; }
  .partners-marquee>div { height:auto; }
  .partners-marquee img { width:100vw; height:auto; }
  .home-cta { padding:64px 0; }
  .home-cta>div { height:auto; }
  .home-cta h2 { font-size:30px; line-height:38px; }
  .home-cta p { margin:14px 0 28px; font-size:14px; }
  .home-cta>div>div { height:auto; flex-direction:column; }
  .home-cta button,.home-cta a { width:100%; height:48px; }
  .home-cta small { flex-wrap:wrap; margin-top:20px; }
}
@media (prefers-reduced-motion:reduce) {
  .home-hero__image,
  .home-hero__copy,
  .hero-image-enter-active,
  .hero-image-leave-active,
  .hero-copy-enter-active,
  .hero-copy-leave-active,
  .home-hero__button,
  .home-hero__arrow,
  .home-hero__controls button,
  .home-flow__line a>span,
  .why-overview__grid article,
  .care-grid a,
  .team-grid article,
  .hospital-grid a,
  .expert-tabs button,
  .home-cta button,
  .home-cta a,
  .partners-marquee>div {
    transition: none;
    animation: none;
  }
}
</style>
