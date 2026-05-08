<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { use } from 'echarts/core'
import { RadarChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import {
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
  Stethoscope,
  FileText,
  Plane,
  HeartPulse,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-vue-next'
import {
  radarData,
  barData,
  costMatrix,
  countries,
  chinaColumnIndex,
  savingsCases,
  freeVsPro,
} from '@/data/costs'

use([
  RadarChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
  CanvasRenderer,
])

const { t } = useI18n()

// 统计数据
const stats = [
  { num: '42+', label: '合作三甲医院', icon: Stethoscope },
  { num: '8国', label: '费用数据对比', icon: DollarSign },
  { num: '72%', label: '平均费用节省', icon: Shield },
  { num: '7天', label: '平均入院等待', icon: Clock },
]

// 功能特性
const features = computed(() => [
  {
    title: t('feature.ai.title'),
    desc: t('feature.ai.desc'),
    icon: FileText,
    color: 'bg-orange-100 text-[#C05621]',
  },
  {
    title: t('feature.cost.title'),
    desc: t('feature.cost.desc'),
    icon: Shield,
    color: 'bg-amber-100 text-[#DD6B20]',
  },
  {
    title: t('feature.full.title'),
    desc: t('feature.full.desc'),
    icon: Plane,
    color: 'bg-orange-100 text-[#ED8936]',
  },
])

// 信任背书
const trustItems = computed(() => [
  t('trust.ai'),
  t('trust.transparent'),
  t('trust.followup'),
  t('trust.compliance'),
])

// 案例图标映射
const iconMap = { heartPulse: HeartPulse, stethoscope: Stethoscope, shield: Shield }

// 移动端检测
const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth < 768 }
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

// ECharts 雷达图配置
const radarOption = computed(() => {
  const mobile = isMobile.value
  return {
    tooltip: { confine: true },
    legend: { data: ['中国', '欧美新平均'], bottom: 0, textStyle: { fontSize: 12 }, itemWidth: mobile ? 14 : 25 },
    animationDuration: 800,
    animationDurationUpdate: 0,
    radar: {
      indicator: radarData.map((d) => ({ name: d.subject, max: 100 })),
      radius: mobile ? '55%' : '65%',
      name: { textStyle: { fontSize: mobile ? 11 : 12 } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: radarData.map((d) => d.china),
            name: '中国',
            areaStyle: { color: 'rgba(192,86,33,0.35)' },
            lineStyle: { color: '#C05621' },
            itemStyle: { color: '#C05621' },
          },
          {
            value: radarData.map((d) => d.overseas),
            name: '欧美新平均',
            areaStyle: { color: 'rgba(148,163,184,0.15)' },
            lineStyle: { color: '#94a3b8' },
            itemStyle: { color: '#94a3b8' },
          },
        ],
      },
    ],
  }
})

// ECharts 柱状图配置
const barOption = computed(() => {
  const mobile = isMobile.value
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, confine: true },
    legend: { bottom: 0, textStyle: { fontSize: 12 }, itemWidth: mobile ? 14 : 25 },
    grid: { left: mobile ? '2%' : '3%', right: mobile ? '2%' : '4%', bottom: mobile ? '14%' : '12%', containLabel: true },
    xAxis: { type: 'category', data: barData.map((d) => d.name), axisLabel: { fontSize: mobile ? 10 : 12, rotate: mobile ? 25 : 0 } },
    yAxis: { type: 'value', axisLabel: { fontSize: mobile ? 11 : 12 } },
    animationDuration: 800,
    animationDurationUpdate: 0,
    series: [
      { name: '中国', type: 'bar', data: barData.map((d) => d.china), itemStyle: { color: '#C05621', borderRadius: [4, 4, 0, 0] } },
      { name: '美国', type: 'bar', data: barData.map((d) => d.usa), itemStyle: { color: '#94a3b8', borderRadius: [4, 4, 0, 0] } },
      { name: '新加坡', type: 'bar', data: barData.map((d) => d.singapore), itemStyle: { color: '#ED8936', borderRadius: [4, 4, 0, 0] } },
    ],
  }
})

// 国家列颜色
function countryClass(index: number) {
  return index === chinaColumnIndex ? 'text-[#C05621] font-bold bg-orange-50' : 'text-gray-800'
}
</script>

<template>
  <div>
    <!-- Section 1: Hero -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0" style="background: linear-gradient(to bottom right, #C05621, #DD6B20, #ED8936)" />
      <div class="absolute inset-0 opacity-20">
        <img src="/images/hero-orange.jpg" alt="Hero" class="w-full h-full object-cover" />
      </div>
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            {{ t('hero.title') }}
          </h1>
          <p class="mt-6 text-lg text-orange-50 leading-relaxed max-w-2xl">
            {{ t('hero.subtitle') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-4">
            <router-link
              to="/report"
              class="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[#C05621] font-bold shadow-lg hover:bg-orange-50 transition-colors"
            >
              {{ t('hero.btn1') }}
              <ArrowRight class="h-4 w-4" />
            </router-link>
            <router-link
              to="/cost"
              class="inline-flex items-center gap-2 rounded-xl border-2 border-white px-6 py-3 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              {{ t('hero.btn2') }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Stats -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="s in stats"
          :key="s.label"
          class="rounded-2xl bg-white p-6 shadow-md border border-orange-100 flex flex-col items-center text-center"
        >
          <component :is="s.icon" class="h-6 w-6 text-[#DD6B20] mb-2" />
          <div class="text-2xl font-extrabold text-[#C05621]">{{ s.num }}</div>
          <div class="text-sm text-gray-600 mt-1">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- Section 3: Features -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900">{{ t('trust.title') }}</h2>
        <p class="mt-3 text-gray-600">一站式国际就医服务，让跨国治疗更简单</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="f in features"
          :key="f.title"
          class="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div :class="['h-12 w-12 rounded-xl flex items-center justify-center mb-4', f.color]">
            <component :is="f.icon" class="h-6 w-6" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ f.title }}</h3>
          <p class="text-gray-600 text-sm leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Section 4: Charts -->
    <section class="bg-white py-16 border-y border-orange-100">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">中国就医 vs 欧美新 多维度对比</h2>
          <p class="mt-3 text-gray-600">综合费用、效率、技术与服务体验的全方位评估</p>
        </div>
        <div class="grid lg:grid-cols-2 gap-8">
          <div class="rounded-2xl border border-orange-100 p-6 bg-gray-50/50">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">多维度能力雷达图</h3>
            <v-chart :option="radarOption" class="chart-container-mobile" autoresize />
          </div>
          <div class="rounded-2xl border border-orange-100 p-6 bg-gray-50/50">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">典型治疗项目费用对比（千美元）</h3>
            <v-chart :option="barOption" class="chart-container-mobile" autoresize />
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: Real Savings Cases -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900">{{ t('cases.title') }}</h2>
        <p class="mt-3 text-gray-600">{{ t('cases.subtitle') }}</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="c in savingsCases"
          :key="c.id"
          :class="['rounded-2xl border p-6 hover:shadow-md transition-shadow', c.border, c.bg]"
        >
          <div class="flex items-center gap-3 mb-4">
            <div :class="['h-10 w-10 rounded-lg bg-white flex items-center justify-center', c.iconColor]">
              <component :is="iconMap[c.iconType]" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ c.title }}</h3>
              <p class="text-sm text-gray-600">{{ c.patient }}</p>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <p class="text-gray-700"><span class="font-medium">等待对比：</span>{{ c.wait }}</p>
            <p class="text-gray-700"><span class="font-medium">{{ t('cases.cost') }}：</span>{{ c.cost }}</p>
            <div class="inline-block rounded-full bg-[#C05621] px-3 py-1 text-xs font-bold text-white">
              {{ c.saving }}
            </div>
            <p class="text-gray-700"><span class="font-medium">{{ t('cases.result') }}：</span>{{ c.result }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 6: Cost Matrix -->
    <section style="background: linear-gradient(to bottom right, #fff7ed, white)" class="py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900">{{ t('costTable.title') }}</h2>
          <p class="mt-3 text-gray-600">{{ t('costTable.subtitle') }}</p>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-orange-200 shadow-sm bg-white -webkit-overflow-scrolling-touch">
          <table class="min-w-full text-sm">
            <thead style="background: linear-gradient(to right, #C05621, #DD6B20)" class="text-white">
              <tr>
                <th class="px-4 py-3 text-left font-semibold sticky left-0" style="background: linear-gradient(to right, #C05621, #DD6B20)">{{ t('costTable.treatment') }}</th>
                <th v-for="c in countries" :key="c" class="px-4 py-3 text-center font-semibold">{{ c }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-orange-100">
              <tr
                v-for="(row, i) in costMatrix"
                :key="i"
                :class="i % 2 === 0 ? 'bg-white' : 'bg-orange-50/40'"
              >
                <td class="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-inherit">{{ row[0] }}</td>
                <td
                  v-for="(cell, j) in row.slice(1)"
                  :key="j"
                  :class="['px-4 py-3 text-center', countryClass(j)]"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 text-center">
          <router-link
            to="/cost"
            class="inline-flex items-center gap-2 rounded-xl bg-[#DD6B20] px-6 py-3 text-white font-semibold shadow hover:bg-[#C05621] transition-colors"
          >
            {{ t('costTable.viewFull') }}
            <ArrowRight class="h-4 w-4" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- Section 7: Free vs Pro -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-900">{{ t('compare.title') }}</h2>
        <p class="mt-3 text-gray-600">从免费预审开始，按需升级到专业版获得全流程服务</p>
      </div>
      <div class="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">功能对比</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-700">{{ t('compare.free') }}</th>
              <th class="px-4 py-3 text-center font-semibold text-[#C05621]">{{ t('compare.pro') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in freeVsPro" :key="item.feature">
              <td class="px-4 py-3 text-gray-800">{{ item.feature }}</td>
              <td class="px-4 py-3 text-center">
                <CheckCircle2 v-if="item.free" class="inline h-5 w-5 text-green-500" />
                <XCircle v-else class="inline h-5 w-5 text-gray-300" />
              </td>
              <td class="px-4 py-3 text-center">
                <CheckCircle2 class="inline h-5 w-5 text-[#DD6B20]" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 8: Trust -->
    <section class="bg-white py-16 border-y border-orange-100">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900">信任背书</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div v-for="item in trustItems" :key="item" class="flex flex-col items-center gap-2">
            <Star class="h-6 w-6 text-[#ED8936]" />
            <span class="text-sm font-medium text-gray-700">{{ item }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 9: CTA -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div
        class="rounded-3xl p-10 md:p-14 text-center text-white"
        style="background: linear-gradient(to bottom right, #C05621, #ED8936)"
      >
        <h2 class="text-3xl md:text-4xl font-bold">{{ t('cta.title') }}</h2>
        <p class="mt-4 text-lg text-orange-50 max-w-2xl mx-auto">
          {{ t('cta.subtitle') }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <router-link
            to="/report"
            class="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[#C05621] font-bold shadow-lg hover:bg-orange-50 transition-colors"
          >
            {{ t('cta.btn') }}
            <ArrowRight class="h-5 w-5" />
          </router-link>
          <router-link
            to="/hospitals"
            class="inline-flex items-center gap-2 rounded-xl border-2 border-white px-8 py-4 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            浏览合作医院
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
