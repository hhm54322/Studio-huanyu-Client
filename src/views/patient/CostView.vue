<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import {
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Stethoscope,
  Shield,
} from 'lucide-vue-next'
import { costMatrix, countries, chinaColumnIndex } from '@/data/costs'

use([BarChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

const { t } = useI18n()

// 费用对比页独有的完整 8 国柱状图数据
const fullBarData = [
  { name: '肿瘤手术', usa: 115, uk: 65, germany: 55, malaysia: 20, singapore: 45, thailand: 16, china: 22, japan: 57 },
  { name: '心血管手术', usa: 150, uk: 80, germany: 65, malaysia: 24, singapore: 52, thailand: 20, china: 27, japan: 70 },
  { name: '慢性病年管理', usa: 40, uk: 27, germany: 20, malaysia: 6.5, singapore: 16, thailand: 5.5, china: 4.5, japan: 23 },
  { name: '质子治疗', usa: 200, uk: 100, germany: 85, malaysia: 0, singapore: 105, thailand: 0, china: 46, japan: 95 },
  { name: 'CAR-T', usa: 500, uk: 325, germany: 275, malaysia: 0, singapore: 275, thailand: 0, china: 65, japan: 325 },
  { name: 'PD-1年费用', usa: 175, uk: 125, germany: 100, malaysia: 32, singapore: 80, thailand: 27, china: 4, japan: 125 },
  { name: '化疗(6周期)', usa: 80, uk: 50, germany: 40, malaysia: 11, singapore: 32, thailand: 9, china: 7, japan: 45 },
]

// 详细节省案例
const savingsCases = [
  {
    id: 1,
    title: '肿瘤治疗（乳腺癌）',
    patient: 'Sarah M.，英国',
    flag: '🇬🇧',
    story: 'Sarah 在英国 NHS 系统中被诊断为乳腺癌II期，预约手术需等待62天。焦虑之下，她通过寰宇云医联系到北京协和医院国际医疗部。7天内完成术前检查并实施保乳手术。术后恢复良好，目前正在接受规范化随访。',
    before: '英国私立 £60,000',
    after: '中国 ¥120,000（约 $17,000）',
    saving: '节省约 72%',
    waitBefore: 'NHS 等待62天',
    waitAfter: '中国 7天手术',
    result: '保乳手术成功，术后恢复良好',
    icon: HeartPulse,
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    iconColor: 'text-pink-600',
  },
  {
    id: 2,
    title: '心血管治疗（心脏搭桥）',
    patient: 'Ahmed K.，阿联酋',
    flag: '🇦🇪',
    story: 'Ahmed 在迪拜被诊断为三支血管病变，建议行心脏搭桥手术。对比德国顶尖心脏中心（费用约 €65,000，等待4周）后，选择通过寰宇云医前往中国。北京安贞医院为其安排了微创搭桥手术。',
    before: '德国 €65,000',
    after: '中国 ¥180,000（约 $25,000）',
    saving: '节省约 65%',
    waitBefore: '德国 4周',
    waitAfter: '中国 3天入院',
    result: '微创搭桥，术后5天出院',
    icon: Stethoscope,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
  },
  {
    id: 3,
    title: '慢性病管理（糖尿病+肾病）',
    patient: 'Linda W.，新加坡',
    flag: '🇸🇬',
    story: 'Linda 患糖尿病多年并发展为糖尿病肾病IV期，新加坡年度管理费用高昂。通过寰宇云医，她转诊至中日友好医院中西医结合科室，获得个性化的年度慢病管理方案。',
    before: '新加坡 S$25,000/年',
    after: '中国 ¥45,000/年（约 $6,500）',
    saving: '节省约 74%',
    waitBefore: '新加坡常规排期',
    waitAfter: '中国专属管理通道',
    result: '中西医结合治疗，血糖控制稳定',
    icon: Shield,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
  },
]

// ECharts 完整 8 国柱状图
const isMobileChart = ref(false)

onMounted(() => {
  isMobileChart.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobileChart.value = window.innerWidth < 768
  })
})

const barOption = computed(() => {
  const mobile = isMobileChart.value
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, confine: true },
    legend: { bottom: 0, textStyle: { fontSize: 12 }, itemWidth: mobile ? 14 : 25, itemGap: mobile ? 8 : 10 },
    grid: { left: mobile ? '2%' : '3%', right: mobile ? '2%' : '4%', top: '8%', bottom: mobile ? '18%' : '14%', containLabel: true },
    xAxis: { type: 'category', data: fullBarData.map((d) => d.name), axisLabel: { fontSize: mobile ? 10 : 11, rotate: mobile ? 35 : 15, interval: 0 } },
    yAxis: { type: 'value', axisLabel: { fontSize: mobile ? 11 : 12 } },
    series: [
      { name: '美国', type: 'bar', data: fullBarData.map((d) => d.usa), itemStyle: { color: '#9CA3AF', borderRadius: [4, 4, 0, 0] } },
      { name: '英国', type: 'bar', data: fullBarData.map((d) => d.uk), itemStyle: { color: '#6B7280', borderRadius: [4, 4, 0, 0] } },
      { name: '德国', type: 'bar', data: fullBarData.map((d) => d.germany), itemStyle: { color: '#4B5563', borderRadius: [4, 4, 0, 0] } },
      { name: '中国', type: 'bar', data: fullBarData.map((d) => d.china), itemStyle: { color: '#C05621', borderRadius: [4, 4, 0, 0] } },
      { name: '新加坡', type: 'bar', data: fullBarData.map((d) => d.singapore), itemStyle: { color: '#ED8936', borderRadius: [4, 4, 0, 0] } },
      { name: '日本', type: 'bar', data: fullBarData.map((d) => d.japan), itemStyle: { color: '#F6AD55', borderRadius: [4, 4, 0, 0] } },
    ],
  }
})

function countryClass(index: number) {
  return index === chinaColumnIndex ? 'text-[#C05621] font-bold bg-orange-50' : 'text-gray-800'
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
    <!-- Back -->
    <div class="mb-6">
      <router-link to="/" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#C05621]">
        <ArrowLeft class="h-4 w-4" />
        {{ t('cases.back') }}
      </router-link>
    </div>

    <!-- Title -->
    <div class="mb-10">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900">{{ t('cost.pageTitle') }}</h1>
      <p class="mt-3 text-gray-600">{{ t('cost.pageSubtitle') }}</p>
    </div>

    <!-- Cost Matrix Table -->
    <div class="mb-12">
      <div class="overflow-x-auto rounded-2xl border border-orange-200 shadow-sm bg-white -webkit-overflow-scrolling-touch">
      <table class="min-w-full text-sm">
        <thead style="background: linear-gradient(to right, #C05621, #DD6B20)" class="text-white">
          <tr>
            <th class="px-4 py-3 text-left font-semibold sticky left-0" style="background: linear-gradient(to right, #C05621, #DD6B20)">
              {{ t('costTable.treatment') }}
            </th>
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
    </div>

    <!-- Bar Chart -->
    <div class="rounded-2xl border border-orange-100 p-6 bg-white shadow-sm mb-12">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">典型治疗项目费用柱状图对比（千美元）</h2>
      <v-chart :option="barOption" class="chart-container-mobile" autoresize />
    </div>

    <!-- Savings Cases -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ t('cost.savings') }}</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="c in savingsCases"
          :key="c.id"
          :class="['rounded-2xl border p-6', c.border, c.bg]"
        >
          <div class="flex items-center gap-3 mb-4">
            <div :class="['h-10 w-10 rounded-lg bg-white flex items-center justify-center', c.iconColor]">
              <component :is="c.icon" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ c.title }}</h3>
              <p class="text-sm text-gray-600">{{ c.patient }}</p>
            </div>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed mb-4">{{ c.story }}</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">原方案费用</span>
              <span class="font-medium text-gray-900">{{ c.before }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">中国方案费用</span>
              <span class="font-medium text-[#C05621]">{{ c.after }}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-black/5">
              <span class="text-gray-500">实际节省</span>
              <span class="rounded-full bg-[#C05621] px-3 py-1 text-xs font-bold text-white">{{ c.saving }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">等待对比</span>
              <span class="font-medium text-gray-900">{{ c.waitBefore }} → {{ c.waitAfter }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">治疗结果</span>
              <span class="font-medium text-gray-900">{{ c.result }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="text-center">
      <router-link
        to="/report"
        class="inline-flex items-center gap-2 rounded-xl bg-[#DD6B20] px-6 py-3 text-white font-semibold shadow hover:bg-[#C05621] transition-colors"
      >
        {{ t('cta.btn') }}
        <ArrowRight class="h-4 w-4" />
      </router-link>
    </div>
  </div>
</template>
