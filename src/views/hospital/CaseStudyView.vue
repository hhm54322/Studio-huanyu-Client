<script setup lang="ts">
import {
  TrendingUp,
  Users,
  DollarSign,
  Smile,
  Quote,
  Building2,
} from 'lucide-vue-next'
import { platformStats, caseStudies, growthData } from '@/data/hospitalB'

const iconMap: Record<string, any> = {
  Building2,
  Users,
  DollarSign,
  Smile,
}
</script>

<template>
  <div>
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-[#1A365D] to-[#319795] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold mb-4">医院国际化成功案例</h1>
        <p class="text-white/70 max-w-2xl mx-auto">真实数据见证国际化转型的力量</p>
      </div>
    </section>

    <!-- Platform Stats -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(s, i) in platformStats"
            :key="i"
            class="text-center p-6 rounded-xl bg-[#F7FAFC] border border-gray-100"
          >
            <component :is="iconMap[s.icon]" class="w-8 h-8 mx-auto mb-3 text-[#319795]" />
            <div class="text-3xl font-bold text-[#1A365D]">{{ s.value }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Case Studies -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-3 gap-8">
          <div
            v-for="(c, i) in caseStudies"
            :key="i"
            class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div class="p-8">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A365D] to-[#319795] flex items-center justify-center text-white font-bold text-lg">
                  {{ c.name.charAt(0) }}
                </div>
                <div>
                  <h3 class="font-bold text-[#1A365D]">{{ c.name }}</h3>
                  <p class="text-sm text-gray-400">{{ c.dept }}</p>
                </div>
              </div>

              <div class="space-y-4 mb-6">
                <div>
                  <h4 class="text-sm font-semibold text-red-500 mb-1">挑战</h4>
                  <p class="text-sm text-gray-600 leading-relaxed">{{ c.challenge }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-[#319795] mb-1">解决方案</h4>
                  <p class="text-sm text-gray-600 leading-relaxed">{{ c.solution }}</p>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3 mb-6">
                <div
                  v-for="(r, ri) in c.results"
                  :key="ri"
                  class="bg-[#F7FAFC] rounded-lg p-3 text-center"
                >
                  <div class="text-lg font-bold text-[#319795]">{{ r.value }}</div>
                  <div class="text-xs text-gray-500">{{ r.label }}</div>
                </div>
              </div>

              <div class="bg-gradient-to-r from-[#1A365D]/5 to-[#319795]/5 rounded-xl p-4 border-l-4 border-[#D69E2E]">
                <Quote class="w-5 h-5 text-[#D69E2E] mb-2" />
                <p class="text-sm text-gray-700 italic mb-2">{{ c.quote }}</p>
                <p class="text-xs text-gray-400">— {{ c.author }}，{{ c.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Growth Chart -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-14">平台增长趋势</h2>
        <div class="bg-[#F7FAFC] rounded-2xl p-4 md:p-8 border border-gray-100">
          <div class="flex items-end justify-between h-48 md:h-64 gap-1 md:gap-3 overflow-x-auto">
            <div
              v-for="(d, i) in growthData"
              :key="i"
              class="flex-1 flex flex-col items-center gap-2"
            >
              <div
                class="w-full bg-gradient-to-t from-[#1A365D] to-[#319795] rounded-t-md transition-all hover:opacity-80 relative group"
                :style="{ height: d.value + '%' }"
              >
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A365D] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {{ d.value }}0人
                </div>
              </div>
              <span class="text-xs text-gray-500">{{ d.month }}</span>
            </div>
          </div>
          <div class="text-center mt-4 text-sm text-gray-500">
            <TrendingUp class="w-4 h-4 inline text-emerald-500 mr-1" />
            2025年平台国际患者月均增长 <span class="font-bold text-[#1A365D]">73.6%</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
