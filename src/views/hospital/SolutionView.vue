<script setup lang="ts">
import { ref } from 'vue'
import {
  Check,
  X,
  Brain,
  BarChart3,
  FileText,
  MessageCircle,
  Headset,
  Code,
  Shield,
  Zap,
} from 'lucide-vue-next'
import {
  pricingPlans,
  customPlanFeatures,
  comparisonRows,
  featureHighlights,
} from '@/data/hospitalB'

const iconMap: Record<string, any> = {
  Zap,
  Shield,
  Brain,
  FileText,
  MessageCircle,
  Headset,
}

/* ROI Calculator */
const beds = ref('')
const avgDays = ref('')
const currentPatients = ref('')

const bedsNum = () => parseInt(beds.value) || 0
const daysNum = () => parseInt(avgDays.value) || 0
const currNum = () => parseInt(currentPatients.value) || 0
const capacity = () => bedsNum() > 0 && daysNum() > 0 ? Math.round((bedsNum() * 30) / daysNum()) : 0
const surplus = () => Math.max(0, capacity() - currNum())
const newPatients = () => Math.round(surplus() * 0.15)
const revenue = () => newPatients() * 80000
</script>

<template>
  <div>
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-[#1A365D] to-[#319795] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold mb-4">为医院量身定制的国际化解决方案</h1>
        <p class="text-white/70 max-w-2xl mx-auto">从智能匹配到系统对接，全方位助力医院国际化业务增长</p>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Pro & Enterprise -->
          <div
            v-for="(plan, i) in pricingPlans"
            :key="i"
            :class="[
              'rounded-2xl p-8',
              plan.highlighted
                ? 'bg-[#1A365D] text-white ring-4 ring-[#D69E2E]/30'
                : 'bg-white border border-gray-100',
            ]"
          >
            <div class="flex items-center gap-3 mb-6">
              <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', plan.highlighted ? 'bg-white/10' : 'bg-[#1A365D]/10']">
                <component :is="iconMap[plan.icon]" :class="['w-6 h-6', plan.highlighted ? 'text-[#D69E2E]' : 'text-[#1A365D]']" />
              </div>
              <div>
                <h3 :class="['text-xl font-bold', plan.highlighted ? 'text-white' : 'text-[#1A365D]']">{{ plan.title }}</h3>
                <p :class="['text-sm', plan.highlighted ? 'text-white/60' : 'text-gray-400']">{{ plan.period }}</p>
              </div>
            </div>
            <div class="mb-6">
              <span :class="['text-4xl font-bold', plan.highlighted ? 'text-[#D69E2E]' : 'text-[#1A365D]']">{{ plan.price }}</span>
              <span :class="plan.highlighted ? 'text-white/60' : 'text-gray-400'">/月</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li
                v-for="(f, fi) in plan.features"
                :key="fi"
                class="flex items-start gap-2 text-sm"
              >
                <Check :class="['w-4 h-4 mt-0.5 shrink-0', plan.highlighted ? 'text-[#D69E2E]' : 'text-emerald-500']" />
                <span :class="plan.highlighted ? 'text-white/80' : 'text-gray-600'">{{ f }}</span>
              </li>
              <li
                v-for="(u, ui) in plan.unavailable"
                :key="'u-' + ui"
                class="flex items-start gap-2 text-sm"
              >
                <X class="w-4 h-4 mt-0.5 shrink-0 text-gray-300" />
                <span :class="plan.highlighted ? 'text-white/40' : 'text-gray-300'">{{ u }}</span>
              </li>
            </ul>
            <button
              :class="[
                'w-full py-2.5 rounded-lg font-medium transition',
                plan.highlighted
                  ? 'bg-[#D69E2E] hover:bg-[#B7791F] text-[#1A365D] font-bold'
                  : 'bg-[#1A365D] hover:bg-[#142d4d] text-white',
              ]"
            >
              {{ plan.cta }}
            </button>
          </div>

          <!-- Custom Plan -->
          <div class="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col justify-center text-center">
            <div class="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-5">
              <Code class="w-7 h-7 text-purple-600" />
            </div>
            <h3 class="text-xl font-bold text-[#1A365D] mb-2">定制化方案</h3>
            <p class="text-gray-500 text-sm mb-6">大型医院集团专属方案，根据需求量身定制</p>
            <ul class="text-left space-y-2 text-sm text-gray-600 mb-8">
              <li
                v-for="(f, i) in customPlanFeatures"
                :key="i"
                class="flex items-center gap-2"
              >
                <Check class="w-4 h-4 text-emerald-500" />
                {{ f }}
              </li>
            </ul>
            <button class="bg-[#1A365D] hover:bg-[#142d4d] text-white py-2.5 rounded-lg transition">
              联系销售
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Table -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-10">详细功能对比</h2>
        <div class="overflow-x-auto rounded-xl">
          <table class="w-full text-sm" style="min-width: 480px">
            <thead>
              <tr class="border-b-2 border-[#1A365D]">
                <th class="text-left py-4 px-4 font-semibold text-[#1A365D] whitespace-nowrap">功能对比</th>
                <th class="text-center py-4 px-4 font-semibold text-[#1A365D] whitespace-nowrap">Pro版</th>
                <th class="text-center py-4 px-4 font-semibold text-[#D69E2E] whitespace-nowrap">Enterprise版</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in comparisonRows"
                :key="i"
                :class="i % 2 === 0 ? 'bg-[#F7FAFC]' : 'bg-white'"
              >
                <td class="py-3 px-4 text-gray-700">{{ row.feature }}</td>
                <td class="text-center py-3 px-4">
                  <Check v-if="row.pro" class="w-5 h-5 text-emerald-500 mx-auto" />
                  <X v-else class="w-5 h-5 text-gray-300 mx-auto" />
                </td>
                <td class="text-center py-3 px-4">
                  <Check v-if="row.enterprise" class="w-5 h-5 text-[#D69E2E] mx-auto" />
                  <X v-else class="w-5 h-5 text-gray-300 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ROI Calculator -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 class="text-2xl font-bold text-[#1A365D] mb-6 flex items-center gap-2">
            <BarChart3 class="w-6 h-6 text-[#319795]" /> ROI计算器
          </h3>
          <p class="text-gray-500 mb-6 text-sm">输入你的科室数据，预估通过平台可新增的国际患者和收入</p>
          <div class="grid sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">科室床位数</label>
              <input
                v-model="beds"
                type="number"
                placeholder="如：50"
                class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">平均住院日</label>
              <input
                v-model="avgDays"
                type="number"
                placeholder="如：7"
                class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">当前国际患者数/月</label>
              <input
                v-model="currentPatients"
                type="number"
                placeholder="如：5"
                class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
              />
            </div>
          </div>
          <div class="grid sm:grid-cols-3 gap-4">
            <div class="bg-[#F7FAFC] rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">理论月容量</div>
              <div class="text-2xl font-bold text-[#1A365D]">
                {{ capacity() }} <span class="text-sm font-normal text-gray-400">人</span>
              </div>
            </div>
            <div class="bg-emerald-50 rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">预估新增患者</div>
              <div class="text-2xl font-bold text-emerald-600">
                {{ newPatients() }} <span class="text-sm font-normal text-gray-400">人/月</span>
              </div>
            </div>
            <div class="bg-amber-50 rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">预估新增年收入</div>
              <div class="text-2xl font-bold text-amber-600">
                ¥{{ (revenue() / 10000).toFixed(0) }} <span class="text-sm font-normal text-gray-400">万</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Highlights -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-14">核心功能亮点</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(f, i) in featureHighlights"
            :key="i"
            class="text-center p-6 bg-[#F7FAFC] rounded-xl border border-gray-100"
          >
            <div class="w-14 h-14 rounded-xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <component :is="iconMap[f.icon]" class="w-7 h-7 text-[#319795]" />
            </div>
            <h3 class="font-semibold text-[#1A365D] mb-2">{{ f.title }}</h3>
            <p class="text-sm text-gray-500">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
