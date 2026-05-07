<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  User,
  Globe,
  Heart,
  Activity,
  Plane,
  Building2,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Clock,
  CheckCircle,
  Stethoscope,
  MapPin,
} from 'lucide-vue-next'
import { casesData } from '@/data/cases'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="max-w-7xl mx-auto text-center mb-12">
      <div class="flex items-center justify-center gap-2 mb-4">
        <Heart class="w-8 h-8 text-orange-500" />
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">{{ t('cases.title') }}</h1>
      </div>
      <p class="text-lg text-gray-600">
        Real Patient Cases — {{ t('cases.subtitle') }}
      </p>
    </div>

    <!-- Cases Grid -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="c in casesData"
        :key="c.id"
        class="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-orange-100 overflow-hidden flex flex-col"
      >
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="bg-white/20 rounded-full p-1.5">
              <User class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-white font-semibold text-lg leading-tight">{{ c.name }}</h3>
              <div class="flex items-center gap-1 text-orange-50 text-sm">
                <Globe class="w-3 h-3" />
                <span>{{ c.nationality }}</span>
                <span class="mx-1">&middot;</span>
                <span>{{ c.age }}岁 &middot; {{ c.gender }}</span>
              </div>
            </div>
          </div>
          <div class="bg-white text-orange-600 font-bold text-sm px-3 py-1 rounded-full shadow-sm">
            案例 {{ c.id }}
          </div>
        </div>

        <!-- Card Body -->
        <div class="px-5 py-4 flex-1 flex flex-col gap-3.5 text-sm text-gray-700">
          <!-- Condition -->
          <div class="flex items-start gap-2">
            <Activity class="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <span class="font-medium text-gray-900">病情：</span>{{ c.condition }}
            </div>
          </div>

          <!-- Decision -->
          <div class="flex items-start gap-2">
            <Plane class="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <span class="font-medium text-gray-900">决策对比：</span>对比{{ c.comparisonCountry }}（{{ c.comparisonCost }}）后选择中国
            </div>
          </div>

          <!-- Treatment -->
          <div class="flex items-start gap-2">
            <Building2 class="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <span class="font-medium text-gray-900">治疗：</span>{{ c.hospital }}，{{ c.treatment }}
            </div>
          </div>

          <!-- Cost -->
          <div class="flex items-start gap-2">
            <DollarSign class="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <span class="font-medium text-gray-900">费用：</span><span class="text-orange-600 font-semibold">{{ c.costChina }}</span>
              <span class="text-gray-400 mx-1">vs</span>
              <span class="line-through text-gray-400">{{ c.costOverseas }}</span>
            </div>
          </div>

          <!-- Savings Badge -->
          <div class="flex items-center gap-2">
            <TrendingDown class="w-4 h-4 text-green-600 shrink-0" />
            <div class="bg-green-50 border border-green-200 text-green-700 font-bold px-3 py-1 rounded-md text-xs inline-flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5" />节省 {{ c.savingsPercent }}%
            </div>
          </div>

          <!-- Wait Time -->
          <div v-if="c.waitTime" class="flex items-start gap-2">
            <Clock class="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <span class="font-medium text-gray-900">等待：</span>{{ c.waitTime }}
            </div>
          </div>

          <!-- Outcome -->
          <div class="flex items-start gap-2 bg-orange-50 rounded-lg p-3 mt-1">
            <CheckCircle class="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <span class="font-medium text-gray-900">结果：</span><span class="text-gray-800">{{ c.outcome }}</span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <Stethoscope class="w-3.5 h-3.5" />
            <span>已验证案例</span>
          </div>
          <div class="flex items-center gap-1 text-orange-500 text-xs font-medium">
            <MapPin class="w-3.5 h-3.5" />
            <span>中国</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Stats -->
    <div class="max-w-7xl mx-auto mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-orange-100 p-4 text-center">
        <div class="text-2xl font-bold text-orange-500">8</div>
        <div class="text-xs text-gray-600 mt-1">真实案例</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-orange-100 p-4 text-center">
        <div class="text-2xl font-bold text-orange-500">6</div>
        <div class="text-xs text-gray-600 mt-1">国家/地区</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-orange-100 p-4 text-center">
        <div class="text-2xl font-bold text-orange-500">50-94%</div>
        <div class="text-xs text-gray-600 mt-1">费用节省幅度</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-orange-100 p-4 text-center">
        <div class="text-2xl font-bold text-orange-500">2-14</div>
        <div class="text-xs text-gray-600 mt-1">平均等待天数</div>
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="text-center mt-12">
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
