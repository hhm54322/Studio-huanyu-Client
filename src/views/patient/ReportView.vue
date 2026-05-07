<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  Clock,
  DollarSign,
  Plane,
  Users,
  FileText,
  Video,
  MessageSquare,
  Stethoscope,
} from 'lucide-vue-next'
import { diseases, regions, budgets, reportData, packages, coreHighlights } from '@/data/report'

const { t } = useI18n()

const step = ref(0)
const selectedDisease = ref<string | null>(null)
const selectedRegions = ref<string[]>([])
const selectedBudget = ref<string | null>(null)
const generating = ref(false)
const showReport = ref(false)
const expandedCountry = ref<string | null>(null)

const pkgIconMap: Record<string, any> = { FileText, Video, MessageSquare }

const nextStep = () => {
  if (step.value === 3) {
    generating.value = true
    setTimeout(() => {
      generating.value = false
      showReport.value = true
    }, 2000)
  } else {
    step.value++
  }
}

const prevStep = () => step.value--

const toggleRegion = (r: string) => {
  const idx = selectedRegions.value.indexOf(r)
  if (idx >= 0) selectedRegions.value.splice(idx, 1)
  else selectedRegions.value.push(r)
}

const resetWizard = () => {
  showReport.value = false
  step.value = 0
  selectedDisease.value = null
  selectedRegions.value = []
  selectedBudget.value = null
}

const stepLabels = [t('report.step1'), t('report.step2'), t('report.step3'), t('report.step4')]
</script>

<template>
  <!-- Report Display -->
  <div v-if="showReport" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-6 flex items-center justify-between flex-wrap gap-4">
      <router-link to="/" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#C05621]">
        <ArrowLeft class="h-4 w-4" />
        {{ t('cases.back') }}
      </router-link>
      <button class="text-sm text-[#C05621] hover:underline" @click="resetWizard">
        {{ t('report.generate') }}
      </button>
    </div>

    <div class="rounded-3xl border border-orange-200 bg-white shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-[#C05621] to-[#DD6B20] px-4 md:px-8 py-6 md:py-8 text-white">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-xl md:text-3xl font-bold">{{ t('report.reportTitle') }}</h1>
            <p class="mt-2 text-orange-100 text-sm md:text-base">Feasibility Pre-Assessment Report for Medical Treatment in China</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-orange-100">{{ t('report.reportId') }}</div>
            <div class="font-mono font-bold text-base md:text-lg">{{ reportData.id }}</div>
            <div class="text-sm text-orange-100 mt-1">{{ reportData.date }}</div>
          </div>
        </div>
      </div>

      <div class="p-4 md:p-8 space-y-8 md:space-y-10">
        <!-- Section 1: Patient Summary -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section1') }}</h2>
          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div class="rounded-xl bg-orange-50/50 p-4 border border-orange-100">
              <div class="text-gray-500 mb-1">{{ t('report.diagnosis') }}</div>
              <div class="font-semibold text-gray-900">{{ reportData.disease }}</div>
            </div>
            <div class="rounded-xl bg-orange-50/50 p-4 border border-orange-100">
              <div class="text-gray-500 mb-1">所需治疗方式</div>
              <div class="font-semibold text-gray-900">{{ reportData.treatment }}</div>
            </div>
            <div class="rounded-xl bg-orange-50/50 p-4 border border-orange-100">
              <div class="text-gray-500 mb-1">核心就医需求</div>
              <div class="font-semibold text-gray-900">{{ reportData.need }}</div>
            </div>
          </div>
        </section>

        <!-- Section 2: Country Comparison -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section2') }}</h2>
          <div class="space-y-3">
            <div
              v-for="c in reportData.countries"
              :key="c.name"
              :class="[
                'rounded-xl border transition-all',
                c.name.includes('推荐') ? 'border-[#DD6B20] bg-orange-50/30' : 'border-gray-200 bg-white',
              ]"
            >
              <button
                class="w-full text-left px-5 py-4 flex items-center justify-between"
                @click="expandedCountry = expandedCountry === c.name ? null : c.name"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ c.flag }}</span>
                  <span :class="['font-bold', c.name.includes('推荐') ? 'text-[#C05621]' : 'text-gray-900']">
                    {{ c.name }}
                  </span>
                </div>
                <component :is="expandedCountry === c.name ? ChevronUp : ChevronDown" class="h-5 w-5 text-gray-400" />
              </button>
              <div v-if="expandedCountry === c.name" class="px-5 pb-5 grid md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-start gap-2">
                  <DollarSign class="h-4 w-4 text-[#DD6B20] mt-0.5" />
                  <div><span class="font-medium text-gray-700">{{ t('report.totalCost') }}：</span>{{ c.fee }}</div>
                </div>
                <div class="flex items-start gap-2">
                  <Clock class="h-4 w-4 text-[#DD6B20] mt-0.5" />
                  <div><span class="font-medium text-gray-700">{{ t('report.waitTime') }}：</span>{{ c.wait }}</div>
                </div>
                <div class="flex items-start gap-2">
                  <Stethoscope class="h-4 w-4 text-[#DD6B20] mt-0.5" />
                  <div><span class="font-medium text-gray-700">{{ t('report.tech') }}：</span>{{ c.tech }}</div>
                </div>
                <div class="flex items-start gap-2">
                  <Users class="h-4 w-4 text-[#DD6B20] mt-0.5" />
                  <div><span class="font-medium text-gray-700">{{ t('report.service') }}：</span>{{ c.service }}</div>
                </div>
                <div class="flex items-start gap-2">
                  <Plane class="h-4 w-4 text-[#DD6B20] mt-0.5" />
                  <div><span class="font-medium text-gray-700">{{ t('report.visa') }}：</span>{{ c.visa }}</div>
                </div>
                <div class="flex items-start gap-2">
                  <Shield class="h-4 w-4 text-[#DD6B20] mt-0.5" />
                  <div><span class="font-medium text-gray-700">{{ t('report.followup') }}：</span>{{ c.follow }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3: Score -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section3') }}</h2>
          <div class="grid md:grid-cols-3 gap-4 mb-6">
            <div class="rounded-xl bg-gradient-to-br from-[#C05621] to-[#DD6B20] p-6 text-white text-center">
              <div class="text-4xl font-extrabold">{{ reportData.score }}</div>
              <div class="text-sm text-orange-100 mt-1">{{ t('report.score') }} / 100</div>
            </div>
            <div v-for="a in reportData.advantages" :key="a.label" class="rounded-xl bg-orange-50 border border-orange-100 p-6 text-center">
              <div class="text-lg font-bold text-[#C05621]">{{ a.value }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ a.label }}</div>
            </div>
          </div>
          <div class="rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
            <table class="min-w-full text-sm" style="min-width: 480px">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">{{ t('report.concern') }}</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">{{ t('report.languageSol') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="c in reportData.concerns" :key="c.concern">
                  <td class="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">{{ c.concern }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ c.solution }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Section 4: Hospitals -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section4') }}</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="h in reportData.hospitals" :key="h.name" class="rounded-xl border border-orange-100 bg-orange-50/30 p-5">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-semibold text-[#C05621]">{{ h.city }}</span>
              </div>
              <h4 class="font-bold text-gray-900">{{ h.name }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ h.reason }}</p>
            </div>
          </div>
        </section>

        <!-- Section 5: Plan -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section5') }}</h2>
          <div class="space-y-4">
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500 mb-1">{{ t('report.direction') }}</div>
              <div class="font-medium text-gray-900">{{ reportData.plan.direction }}</div>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500 mb-1">{{ t('report.duration') }}</div>
              <div class="font-medium text-gray-900">{{ reportData.plan.duration }}</div>
            </div>
            <div class="rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
              <table class="min-w-full text-sm" style="min-width: 360px">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold text-gray-700">费用项目</th>
                    <th class="px-4 py-3 text-right font-semibold text-gray-700">预估费用</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="b in reportData.plan.breakdown" :key="b.item">
                    <td class="px-4 py-3 text-gray-800">{{ b.item }}</td>
                    <td class="px-4 py-3 text-right text-[#C05621] font-semibold">{{ b.cost }}</td>
                  </tr>
                  <tr class="bg-orange-50">
                    <td class="px-4 py-3 font-bold text-gray-900">{{ t('report.total') }}</td>
                    <td class="px-4 py-3 text-right font-bold text-[#C05621]">$14,300 - $25,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Section 6: Upgrade -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section6') }}</h2>
          <div class="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 md:p-8">
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div
                v-for="pkg in packages"
                :key="pkg.name"
                :class="[
                  'rounded-2xl border p-6 flex flex-col',
                  pkg.highlight ? 'border-[#DD6B20] bg-white shadow-lg relative' : 'border-gray-200 bg-white',
                ]"
              >
                <div
                  v-if="pkg.highlight"
                  class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#DD6B20] px-3 py-1 text-xs font-bold text-white"
                >
                  最受欢迎
                </div>
                <div class="flex items-center gap-3 mb-3">
                  <div :class="['h-10 w-10 rounded-lg flex items-center justify-center', pkg.highlight ? 'bg-[#DD6B20] text-white' : 'bg-orange-100 text-[#C05621]']">
                    <component :is="pkgIconMap[pkg.icon]" class="h-5 w-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-900">{{ pkg.name }}</h4>
                    <div class="text-xl font-extrabold text-[#C05621]">{{ pkg.price }}</div>
                  </div>
                </div>
                <ul class="space-y-2 flex-1">
                  <li v-for="f in pkg.features" :key="f" class="flex items-start gap-2 text-sm text-gray-700">
                    <Check class="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {{ f }}
                  </li>
                </ul>
                <button
                  :class="[
                    'mt-5 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors',
                    pkg.highlight
                      ? 'bg-[#DD6B20] text-white hover:bg-[#C05621]'
                      : 'border border-[#DD6B20] text-[#DD6B20] hover:bg-orange-50',
                  ]"
                >
                  选择此套餐
                </button>
              </div>
            </div>

            <div class="rounded-xl bg-white border border-orange-100 p-5">
              <h4 class="font-bold text-gray-900 mb-3">专业版核心亮点</h4>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="h in coreHighlights" :key="h" class="flex items-center gap-2 text-sm text-gray-700">
                  <Star class="h-4 w-4 text-[#ED8936] shrink-0" />
                  {{ h }}
                </div>
              </div>
            </div>

            <div class="mt-6 text-center">
              <p class="text-sm text-gray-500 mb-3">对报告有疑问？我们的医学顾问随时为您解答</p>
              <button class="inline-flex items-center gap-2 rounded-xl bg-[#DD6B20] px-6 py-3 text-white font-semibold shadow hover:bg-[#C05621] transition-colors">
                <ArrowRight class="h-4 w-4" />
                {{ t('report.contact') }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- Wizard -->
  <div v-else class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-6">
      <router-link to="/" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#C05621]">
        <ArrowLeft class="h-4 w-4" />
        {{ t('cases.back') }}
      </router-link>
    </div>

    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900">{{ t('report.pageTitle') }}</h1>
      <p class="mt-3 text-gray-600">{{ t('report.pageSubtitle') }}</p>
    </div>

    <!-- Stepper -->
    <div class="flex items-center justify-between mb-10">
      <div v-for="(s, i) in stepLabels" :key="i" class="flex-1 flex items-center">
        <div class="flex flex-col items-center">
          <div
            :class="[
              'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold',
              i <= step ? 'bg-[#DD6B20] text-white' : 'bg-gray-200 text-gray-500',
            ]"
          >
            <Check v-if="i < step" class="h-5 w-5" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span :class="['mt-2 text-xs font-medium', i <= step ? 'text-[#C05621]' : 'text-gray-400']">
            {{ s }}
          </span>
        </div>
        <div
          v-if="i < stepLabels.length - 1"
          :class="['flex-1 h-1 mx-2 rounded', i < step ? 'bg-[#DD6B20]' : 'bg-gray-200']"
        />
      </div>
    </div>

    <!-- Step Content -->
    <div class="rounded-2xl border border-orange-100 bg-white p-6 md:p-8 shadow-sm">
      <!-- Step 0: Disease -->
      <div v-if="step === 0">
        <h2 class="text-xl font-bold text-gray-900 mb-4">{{ t('report.selectDisease') }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="d in diseases"
            :key="d.name"
            :class="[
              'rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all',
              selectedDisease === d.name
                ? `${d.bg} ${d.text} ${d.border} ring-2 ring-offset-1 ring-[#DD6B20]`
                : 'border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50',
            ]"
            @click="selectedDisease = d.name"
          >
            {{ d.name }}
          </button>
        </div>
      </div>

      <!-- Step 1: Region -->
      <div v-if="step === 1">
        <h2 class="text-xl font-bold text-gray-900 mb-4">{{ t('report.selectRegion') }}</h2>
        <div class="grid md:grid-cols-2 gap-3">
          <button
            v-for="r in regions"
            :key="r"
            :class="[
              'rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all flex items-center gap-2',
              selectedRegions.includes(r)
                ? 'border-[#DD6B20] bg-orange-50 text-[#C05621] ring-1 ring-[#DD6B20]'
                : 'border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50',
            ]"
            @click="toggleRegion(r)"
          >
            <div
              :class="[
                'h-4 w-4 rounded border flex items-center justify-center',
                selectedRegions.includes(r) ? 'bg-[#DD6B20] border-[#DD6B20]' : 'border-gray-300',
              ]"
            >
              <Check v-if="selectedRegions.includes(r)" class="h-3 w-3 text-white" />
            </div>
            {{ r }}
          </button>
        </div>
      </div>

      <!-- Step 2: Budget -->
      <div v-if="step === 2">
        <h2 class="text-xl font-bold text-gray-900 mb-4">{{ t('report.budget') }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="b in budgets"
            :key="b"
            :class="[
              'rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all',
              selectedBudget === b
                ? 'border-[#DD6B20] bg-orange-50 text-[#C05621] ring-1 ring-[#DD6B20]'
                : 'border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50',
            ]"
            @click="selectedBudget = b"
          >
            {{ b }}
          </button>
        </div>
      </div>

      <!-- Step 3: Confirm -->
      <div v-if="step === 3" class="text-center py-8">
        <h2 class="text-xl font-bold text-gray-900 mb-2">准备生成您的预审报告</h2>
        <p class="text-gray-600 text-sm mb-6">
          基于您选择的 <span class="font-semibold text-[#C05621]">{{ selectedDisease }}</span>，我们将对比
          {{ selectedRegions.join('、') }} 与中国就医方案
        </p>
        <div v-if="generating" class="flex flex-col items-center gap-3">
          <Loader2 class="h-10 w-10 text-[#DD6B20] animate-spin" />
          <p class="text-sm text-gray-500">{{ t('report.generating') }}</p>
        </div>
        <button
          v-else
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C05621] to-[#DD6B20] px-8 py-4 text-white font-bold shadow-lg hover:shadow-xl transition-all"
          @click="nextStep"
        >
          {{ t('report.generate') }}
          <ArrowRight class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div v-if="step < 3" class="mt-6 flex items-center justify-between">
      <button
        :disabled="step === 0"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="prevStep"
      >
        <ArrowLeft class="h-4 w-4" />
        {{ t('common.prev') }}
      </button>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-[#DD6B20] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#C05621] transition-colors"
        @click="nextStep"
      >
        {{ t('common.next') }}
        <ArrowRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
