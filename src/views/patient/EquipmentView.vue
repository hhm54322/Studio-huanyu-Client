<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import {
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building2,
  Crosshair,
  Sparkles,
  TrendingDown,
  Calendar,
  Award,
  Activity,
  ShieldCheck,
  Stethoscope,
} from 'lucide-vue-next'
import {
  equipmentList,
  categoryLabels,
  categoryColors,
  coreAdvantages,
  equipmentComparison,
  priceComparison,
  patientCases,
  gammaVsCyberCompare,
  treatmentRoutes,
  partnerHospitals,
  type EquipmentLocale,
  type LocalizedText,
} from '@/data/equipment'

const { t, locale } = useI18n()

const supportedLocales: EquipmentLocale[] = ['zh', 'en', 'id', 'ru', 'mn']
const activeLocale = computed<EquipmentLocale>(() =>
  supportedLocales.includes(locale.value as EquipmentLocale)
    ? (locale.value as EquipmentLocale)
    : 'zh',
)

/** 取本地化文案，缺失语言回退到中文 */
const lt = (entry?: LocalizedText) => (entry ? entry[activeLocale.value] || entry.zh : '')

/** 设备分类筛选 */
const activeCategory = ref<string>('all')

/** 当前展开详情的设备 ID */
const expandedId = ref<string | null>(null)

const categories = computed(() => {
  const cats = new Set(equipmentList.map((e) => e.category))
  return ['all', ...Array.from(cats)]
})

const filteredEquipment = computed(() => {
  if (activeCategory.value === 'all') return equipmentList
  return equipmentList.filter((e) => e.category === activeCategory.value)
})

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function getCategoryLabel(cat: string) {
  if (cat === 'all') return t('equipment.categorySection.all')
  return lt(categoryLabels[cat]) || cat
}

/** 状态符号样式映射 */
function statusClass(v: string) {
  if (v === '✅') return 'text-emerald-600 font-bold'
  if (v === '⚠️') return 'text-amber-500 font-bold'
  if (v === '❌') return 'text-gray-400 font-bold'
  return ''
}
</script>

<template>
  <div class="equipment-page bg-[#FFFFFF] text-[#152B3C]">
    <!-- ============= 1. Hero ============= -->
    <section class="equipment-hero relative overflow-hidden pb-16 pt-14 md:pb-24 md:pt-20">
      <img class="equipment-hero__media" src="/images/equipment/image1.jpeg" alt="国际一流放射治疗设备" />
      <div class="equipment-hero__wash" aria-hidden="true" />
      <div class="relative mx-auto w-full max-w-6xl px-4 md:px-8">
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium text-[#60788B] shadow-sm backdrop-blur md:text-sm"
        >
          <Sparkles :size="14" />
          {{ t('equipment.hero.tag') }}
        </span>
        <h1
          class="mt-5 text-3xl font-bold leading-tight text-[#082D4B] md:text-5xl md:leading-tight"
        >
          {{ t('equipment.hero.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-base text-[#60788B]/90 md:text-lg">
          {{ t('equipment.hero.subtitle') }}
        </p>

        <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            v-for="(s, i) in [
              { icon: Award, text: t('equipment.hero.stat1') },
              { icon: TrendingDown, text: t('equipment.hero.stat2') },
              { icon: Calendar, text: t('equipment.hero.stat3') },
            ]"
            :key="i"
            class="flex items-center gap-3 rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur"
          >
            <div
              class="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-[#FF8A34] to-[#123F67] text-white"
            >
              <component :is="s.icon" :size="20" />
            </div>
            <span class="text-sm font-semibold text-[#082D4B] md:text-base">{{
              s.text
            }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============= 2. 核心优势速览 ============= -->
    <section class="mx-auto w-full max-w-6xl px-4 py-14 md:px-8 md:py-20">
      <div class="mb-8 text-center md:mb-12">
        <h2 class="text-2xl font-bold text-[#082D4B] md:text-3xl">
          {{ t('equipment.advantageSection.title') }}
        </h2>
        <p class="mt-3 text-sm text-[#60788B]/80 md:text-base">
          {{ t('equipment.advantageSection.subtitle') }}
        </p>
      </div>

      <div class="overflow-x-auto rounded-lg border border-sky-100 bg-white shadow-sm">
        <table class="w-full min-w-[640px] text-sm md:text-base">
          <thead class="bg-gradient-to-r from-[#EAF6FB] to-[#CFEAF5]">
            <tr class="text-left text-[#082D4B]">
              <th class="sticky left-0 z-10 bg-gradient-to-r from-[#EAF6FB] to-[#EAF6FB]/80 px-4 py-3 font-semibold md:px-6">
                {{ t('equipment.advantageSection.colDim') }}
              </th>
              <th class="px-4 py-3 font-semibold md:px-6">
                {{ t('equipment.advantageSection.colChina') }}
              </th>
              <th class="px-4 py-3 font-semibold md:px-6">
                {{ t('equipment.advantageSection.colOverseas') }}
              </th>
              <th class="px-4 py-3 font-semibold md:px-6">
                {{ t('equipment.advantageSection.colSea') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in coreAdvantages"
              :key="i"
              class="border-t border-sky-100 hover:bg-sky-50/40"
            >
              <td class="sticky left-0 z-10 bg-white/95 px-4 py-3 font-semibold text-[#082D4B] md:px-6">
                {{ lt(row.dim) }}
              </td>
              <td class="px-4 py-3 text-[#123F67] md:px-6">{{ lt(row.china) }}</td>
              <td class="px-4 py-3 text-[#152B3C]/80 md:px-6">{{ lt(row.overseas) }}</td>
              <td class="px-4 py-3 text-[#152B3C]/80 md:px-6">{{ lt(row.sea) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mt-8">
        <div
          v-for="(h, i) in [
            t('equipment.advantageSection.highlightPrice'),
            t('equipment.advantageSection.highlightWait'),
            t('equipment.advantageSection.highlightTech'),
          ]"
          :key="i"
          class="flex items-start gap-2 rounded-lg bg-white p-4 text-sm shadow-sm"
        >
          <CheckCircle2 :size="18" class="mt-0.5 flex-none text-[#123F67]" />
          <span class="text-[#152B3C]">{{ h }}</span>
        </div>
      </div>
    </section>

    <!-- ============= 3. 设备硬件水平对比 ============= -->
    <section class="bg-white py-14 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div class="mb-8 text-center md:mb-12">
          <h2 class="text-2xl font-bold text-[#082D4B] md:text-3xl">
            {{ t('equipment.comparisonSection.title') }}
          </h2>
          <p class="mt-3 text-sm text-[#60788B]/80 md:text-base">
            {{ t('equipment.comparisonSection.subtitle') }}
          </p>
          <p class="mt-2 text-xs text-[#60788B]/60 md:hidden">← 左右滑动查看 →</p>
        </div>

        <div class="overflow-x-auto rounded-lg border border-sky-100 shadow-sm scroll-hint">
          <table class="w-full min-w-[640px] text-sm md:text-base">
            <thead class="bg-gradient-to-r from-[#EAF6FB] to-[#CFEAF5]">
              <tr class="text-left text-[#082D4B]">
                <th class="sticky left-0 z-10 bg-gradient-to-r from-[#EAF6FB] to-[#EAF6FB]/80 px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.comparisonSection.deviceCol') }}
                </th>
                <th class="px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.advantageSection.colChina') }}
                </th>
                <th class="px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.advantageSection.colOverseas') }}
                </th>
                <th class="px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.advantageSection.colSea') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in equipmentComparison"
                :key="i"
                class="border-t border-sky-100 hover:bg-sky-50/40"
              >
                <td class="sticky left-0 z-10 bg-white/95 px-4 py-3 font-semibold text-[#082D4B] md:px-6">
                  {{ lt(row.type) }}
                </td>
                <td class="px-4 py-3 md:px-6">
                  <div class="flex items-start gap-1.5">
                    <span :class="statusClass(row.china.v)">{{ row.china.v }}</span>
                    <span class="text-[#152B3C]/80">{{ lt(row.china.desc) }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 md:px-6">
                  <div class="flex items-start gap-1.5">
                    <span :class="statusClass(row.overseas.v)">{{ row.overseas.v }}</span>
                    <span class="text-[#152B3C]/80">{{ lt(row.overseas.desc) }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 md:px-6">
                  <div class="flex items-start gap-1.5">
                    <span :class="statusClass(row.sea.v)">{{ row.sea.v }}</span>
                    <span class="text-[#152B3C]/80">{{ lt(row.sea.desc) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ============= 4. 设备全景（分类筛选 + 卡片网格） ============= -->
    <section class="mx-auto w-full max-w-6xl px-4 py-14 md:px-8 md:py-20">
      <div class="mb-8 text-center md:mb-12">
        <h2 class="text-2xl font-bold text-[#082D4B] md:text-3xl">
          {{ t('equipment.categorySection.title') }}
        </h2>
        <p class="mt-3 text-sm text-[#60788B]/80 md:text-base">
          {{ t('equipment.categorySection.subtitle') }}
        </p>
      </div>

      <!-- 分类 Tab 横向滚动 -->
      <div class="-mx-4 mb-8 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div class="flex w-max gap-2 md:flex-wrap md:w-auto">
          <button
            v-for="cat in categories"
            :key="cat"
            class="flex-none rounded-full border px-4 py-2 text-sm font-medium transition md:text-base"
            :class="
              activeCategory === cat
                ? 'border-[#123F67] bg-[#123F67] text-white shadow-sm'
                : 'border-sky-200 bg-white text-[#082D4B] hover:border-[#FF8A34]'
            "
            @click="activeCategory = cat"
          >
            {{ getCategoryLabel(cat) }}
          </button>
        </div>
      </div>

      <!-- 设备卡片网格 -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in filteredEquipment"
          :key="item.id"
          class="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm transition hover:shadow-md"
        >
          <!-- 卡片头：图片 + 渐变遮罩 -->
          <div
            class="relative h-40 w-full bg-gradient-to-br md:h-44"
            :class="categoryColors[item.category]"
          >
            <img
              v-if="item.image"
              :src="item.image"
              :alt="lt(item.name)"
              class="h-full w-full object-cover mix-blend-multiply"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-white/90"
            >
              <Stethoscope :size="48" />
            </div>
            <span
              v-if="item.tag"
              class="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#123F67] shadow-sm"
            >
              {{ lt(item.tag) }}
            </span>
            <span
              class="absolute right-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur"
            >
              {{ lt(categoryLabels[item.category]) }}
            </span>
          </div>

          <!-- 卡片体 -->
          <div class="p-5 md:p-6">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-lg font-bold text-[#082D4B] md:text-xl">
                  {{ lt(item.name) }}
                </h3>
                <p class="mt-0.5 text-xs text-[#60788B]/70">{{ item.nameEn }}</p>
              </div>
              <div v-if="item.stars > 0" class="flex flex-none items-center gap-0.5">
                <Star
                  v-for="n in item.stars"
                  :key="n"
                  :size="14"
                  fill="#77CDEC"
                  class="text-[#FF8A34]"
                />
              </div>
            </div>

            <p class="mt-3 line-clamp-3 text-sm leading-relaxed text-[#152B3C]/80">
              {{ lt(item.intro) }}
            </p>

            <!-- 价格 -->
            <div class="mt-4 flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2.5">
              <span class="text-xs text-[#60788B]/80">
                {{ t('equipment.categorySection.priceLabel') }}
              </span>
              <span class="text-sm font-semibold text-[#123F67]">
                {{ lt(item.priceChina) }}
                <span class="mx-1 text-[#60788B]/50">/</span>
                <span class="text-[#60788B]/80">{{ lt(item.priceOverseas) }}</span>
              </span>
            </div>

            <!-- 展开按钮 -->
            <button
              :aria-expanded="expandedId === item.id"
              :aria-controls="`equipment-detail-${item.id}`"
              class="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#FF8A34]/40 bg-white px-3 py-2.5 text-sm font-semibold text-[#123F67] transition hover:bg-[#EAF6FB]"
              @click="toggleExpand(item.id)"
            >
              {{
                expandedId === item.id
                  ? t('equipment.categorySection.collapse')
                  : t('equipment.categorySection.expand')
              }}
              <component :is="expandedId === item.id ? ChevronUp : ChevronDown" :size="16" />
            </button>

            <!-- 展开详情 -->
            <Transition name="accordion">
            <div
              v-if="expandedId === item.id"
              :id="`equipment-detail-${item.id}`"
              class="equipment-detail accordion-panel mt-4 space-y-5 border-t border-sky-100 pt-5 text-sm"
            >
              <!-- 技术特点 -->
              <div>
                <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-[#082D4B]">
                  <Crosshair :size="14" />
                  {{ t('equipment.categorySection.techPoints') }}
                </h4>
                <ul class="space-y-1.5">
                  <li
                    v-for="(p, i) in item.techPoints"
                    :key="i"
                    class="flex items-start gap-1.5 text-[#152B3C]/80"
                  >
                    <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#FF8A34]" />
                    <span>{{ lt(p) }}</span>
                  </li>
                </ul>
              </div>

              <!-- 技术优势（如有） -->
              <div v-if="item.techAdvantages?.length">
                <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-[#082D4B]">
                  <Sparkles :size="14" />
                  {{ t('equipment.categorySection.techAdvantages') }}
                </h4>
                <div class="space-y-1.5">
                  <div
                    v-for="(p, i) in item.techAdvantages"
                    :key="i"
                    class="rounded-lg bg-sky-50/60 px-3 py-2"
                  >
                    <span class="font-medium text-[#123F67]">{{ lt(p.benefit) }}</span>
                    <span class="text-[#60788B]/60"> · </span>
                    <span class="text-[#152B3C]/80">{{ lt(p.detail) }}</span>
                  </div>
                </div>
              </div>

              <!-- 适用病症 -->
              <div v-if="item.diseaseCategories?.length">
                <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-[#082D4B]">
                  <Activity :size="14" />
                  {{ t('equipment.categorySection.diseaseCategories') }}
                </h4>
                <div class="space-y-1.5">
                  <div
                    v-for="(p, i) in item.diseaseCategories"
                    :key="i"
                    class="rounded-lg bg-sky-50/60 px-3 py-2"
                  >
                    <span class="font-medium text-[#123F67]">{{ lt(p.category) }}</span>
                    <span class="text-[#60788B]/60"> · </span>
                    <span class="text-[#152B3C]/80">{{ lt(p.diseases) }}</span>
                  </div>
                </div>
              </div>
              <div v-else>
                <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-[#082D4B]">
                  <Activity :size="14" />
                  {{ t('equipment.categorySection.diseases') }}
                </h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(d, i) in item.diseases"
                    :key="i"
                    class="rounded-full bg-sky-100 px-3 py-1 text-xs text-[#123F67]"
                  >
                    {{ lt(d) }}
                  </span>
                </div>
              </div>

              <!-- 中国代表医院 -->
              <div>
                <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-[#082D4B]">
                  <Building2 :size="14" />
                  {{ t('equipment.categorySection.hospitals') }}
                </h4>
                <ul class="space-y-1.5">
                  <li
                    v-for="(h, i) in item.hospitals"
                    :key="i"
                    class="flex items-start gap-1.5 text-[#152B3C]/80"
                  >
                    <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#123F67]" />
                    <span>
                      <span class="font-medium text-[#082D4B]">{{ lt(h.name) }}</span>
                      <span v-if="h.note" class="text-[#60788B]/70"> — {{ lt(h.note) }}</span>
                    </span>
                  </li>
                </ul>
              </div>

              <!-- 患者获益 -->
              <div v-if="item.benefitDetails?.length">
                <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-[#082D4B]">
                  <ShieldCheck :size="14" />
                  {{ t('equipment.categorySection.benefitDetails') }}
                </h4>
                <div class="space-y-1.5">
                  <div
                    v-for="(p, i) in item.benefitDetails"
                    :key="i"
                    class="rounded-lg bg-emerald-50/70 px-3 py-2"
                  >
                    <span class="font-medium text-emerald-700">{{ lt(p.benefit) }}</span>
                    <span class="text-emerald-700/60"> · </span>
                    <span class="text-[#152B3C]/80">{{ lt(p.detail) }}</span>
                  </div>
                </div>
              </div>
              <div v-else>
                <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-[#082D4B]">
                  <ShieldCheck :size="14" />
                  {{ t('equipment.categorySection.benefits') }}
                </h4>
                <ul class="space-y-1.5">
                  <li
                    v-for="(b, i) in item.benefits"
                    :key="i"
                    class="flex items-start gap-1.5 text-[#152B3C]/80"
                  >
                    <CheckCircle2 :size="14" class="mt-0.5 flex-none text-emerald-500" />
                    <span>{{ lt(b) }}</span>
                  </li>
                </ul>
              </div>
            </div>
            </Transition>
          </div>
        </article>
      </div>
    </section>

    <!-- ============= 5. 价格对比表 ============= -->
    <section class="bg-white py-14 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div class="mb-8 text-center md:mb-12">
          <h2 class="text-2xl font-bold text-[#082D4B] md:text-3xl">
            {{ t('equipment.priceSection.title') }}
          </h2>
          <p class="mt-3 text-sm text-[#60788B]/80 md:text-base">
            {{ t('equipment.priceSection.subtitle') }}
          </p>
          <p class="mt-2 text-xs text-[#60788B]/60 md:hidden">← 左右滑动查看 →</p>
        </div>

        <div class="overflow-x-auto rounded-lg border border-sky-100 shadow-sm scroll-hint">
          <table class="w-full min-w-[640px] text-sm md:text-base">
            <thead class="bg-gradient-to-r from-[#EAF6FB] to-[#CFEAF5]">
              <tr class="text-left text-[#082D4B]">
                <th class="sticky left-0 z-10 bg-gradient-to-r from-[#EAF6FB] to-[#EAF6FB]/80 px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.priceSection.colTreatment') }}
                </th>
                <th class="px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.priceSection.colChina') }}
                </th>
                <th class="px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.priceSection.colUsa') }}
                </th>
                <th class="px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.priceSection.colSingapore') }}
                </th>
                <th class="px-4 py-3 font-semibold md:px-6">
                  {{ t('equipment.priceSection.colThailand') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in priceComparison"
                :key="i"
                class="border-t border-sky-100 hover:bg-sky-50/40"
              >
                <td class="sticky left-0 z-10 bg-white/95 px-4 py-3 font-semibold text-[#082D4B] md:px-6">
                  {{ lt(row.name) }}
                </td>
                <td class="px-4 py-3 font-semibold text-[#123F67] md:px-6">{{ row.china }}</td>
                <td class="px-4 py-3 text-[#152B3C]/80 md:px-6">{{ row.usa }}</td>
                <td class="px-4 py-3 text-[#152B3C]/80 md:px-6">{{ row.singapore }}</td>
                <td class="px-4 py-3 text-[#152B3C]/80 md:px-6">{{ row.thailand }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ============= 6. 伽马刀 vs 射波刀 ============= -->
    <section class="mx-auto w-full max-w-6xl px-4 py-14 md:px-8 md:py-20">
      <div class="mb-8 text-center md:mb-12">
        <h2 class="text-2xl font-bold text-[#082D4B] md:text-3xl">
          {{ t('equipment.vsSection.title') }}
        </h2>
        <p class="mt-3 text-sm text-[#60788B]/80 md:text-base">
          {{ t('equipment.vsSection.subtitle') }}
        </p>
      </div>

      <div class="overflow-x-auto rounded-lg border border-sky-100 bg-white shadow-sm">
        <table class="w-full min-w-[560px] text-sm md:text-base">
          <thead class="bg-gradient-to-r from-[#EAF6FB] to-[#CFEAF5]">
            <tr class="text-left text-[#082D4B]">
              <th class="sticky left-0 z-10 bg-gradient-to-r from-[#EAF6FB] to-[#EAF6FB]/80 px-4 py-3 font-semibold md:px-6">
                {{ t('equipment.vsSection.colDim') }}
              </th>
              <th class="px-4 py-3 font-semibold md:px-6">
                {{ t('equipment.vsSection.colGamma') }}
              </th>
              <th class="px-4 py-3 font-semibold md:px-6">
                {{ t('equipment.vsSection.colCyber') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in gammaVsCyberCompare"
              :key="i"
              class="border-t border-sky-100 hover:bg-sky-50/40"
            >
              <td class="sticky left-0 z-10 bg-white/95 px-4 py-3 font-semibold text-[#082D4B] md:px-6">
                {{ lt(row.dim) }}
              </td>
              <td class="px-4 py-3 text-[#152B3C]/80 md:px-6">{{ lt(row.gamma) }}</td>
              <td class="px-4 py-3 text-[#123F67] md:px-6">{{ lt(row.cyber) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ============= 7. 重点技术路线（3 卡） ============= -->
    <section class="bg-gradient-to-b from-[#EAF6FB] to-white py-14 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div class="mb-8 text-center md:mb-12">
          <h2 class="text-2xl font-bold text-[#082D4B] md:text-3xl">
            {{ t('equipment.routeSection.title') }}
          </h2>
          <p class="mt-3 text-sm text-[#60788B]/80 md:text-base">
            {{ t('equipment.routeSection.subtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article
            v-for="route in treatmentRoutes"
            :key="route.id"
            class="overflow-hidden rounded-lg border bg-white shadow-sm"
            :class="[route.border, route.bg]"
          >
            <div
              class="flex h-24 items-center justify-center bg-gradient-to-br text-5xl"
              :class="route.color"
            >
              <span>{{ route.icon }}</span>
            </div>
            <div class="p-5 md:p-6">
              <h3 class="text-lg font-bold text-[#082D4B] md:text-xl">
                {{ lt(route.title) }}
              </h3>
              <p class="mt-2 text-sm text-[#60788B]/80">
                <span class="font-medium text-[#082D4B]">
                  {{ t('equipment.routeSection.target') }}：</span
                >
                {{ lt(route.target) }}
              </p>

              <div class="mt-4">
                <h4 class="mb-2 text-sm font-semibold text-[#082D4B]">
                  {{ t('equipment.routeSection.techs') }}
                </h4>
                <ul class="space-y-1.5">
                  <li
                    v-for="(tech, i) in route.techs"
                    :key="i"
                    class="flex items-start gap-1.5 text-sm text-[#152B3C]/80"
                  >
                    <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#FF8A34]" />
                    <span>{{ lt(tech) }}</span>
                  </li>
                </ul>
              </div>

              <div class="mt-4">
                <h4 class="mb-2 text-sm font-semibold text-[#082D4B]">
                  {{ t('equipment.routeSection.advantages') }}
                </h4>
                <ul class="space-y-1.5">
                  <li
                    v-for="(adv, i) in route.advantages"
                    :key="i"
                    class="flex items-start gap-1.5 text-sm text-[#152B3C]/80"
                  >
                    <CheckCircle2 :size="14" class="mt-0.5 flex-none text-emerald-500" />
                    <span>{{ lt(adv) }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ============= 8. 患者成功案例 ============= -->
    <section class="mx-auto w-full max-w-6xl px-4 py-14 md:px-8 md:py-20">
      <div class="mb-8 text-center md:mb-12">
        <h2 class="text-2xl font-bold text-[#082D4B] md:text-3xl">
          {{ t('equipment.caseSection.title') }}
        </h2>
        <p class="mt-3 text-sm text-[#60788B]/80 md:text-base">
          {{ t('equipment.caseSection.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article
          v-for="(c, i) in patientCases"
          :key="i"
          class="rounded-lg border bg-white p-5 shadow-sm md:p-6"
          :class="c.color"
        >
          <header class="flex items-center gap-3">
            <span class="text-3xl md:text-4xl">{{ c.flag }}</span>
            <div>
              <h3 class="text-base font-bold text-[#082D4B] md:text-lg">
                {{ lt(c.patient) }}
              </h3>
              <p class="text-xs text-[#60788B]/70 md:text-sm">{{ lt(c.diagnosis) }}</p>
            </div>
          </header>

          <dl class="mt-4 space-y-2.5 text-sm">
            <div
              v-for="row in [
                { label: t('equipment.caseSection.before'), value: c.before },
                { label: t('equipment.caseSection.equipment'), value: c.equipment },
                { label: t('equipment.caseSection.plan'), value: c.plan },
                { label: t('equipment.caseSection.hospital'), value: c.hospital },
                { label: t('equipment.caseSection.process'), value: c.process },
                { label: t('equipment.caseSection.result'), value: c.result },
              ]"
              :key="row.label"
              class="grid grid-cols-[88px_1fr] gap-3 md:grid-cols-[100px_1fr]"
            >
              <dt class="font-semibold text-[#082D4B]">{{ row.label }}</dt>
              <dd class="text-[#152B3C]/80">{{ lt(row.value) }}</dd>
            </div>
          </dl>

          <blockquote
            class="mt-4 rounded-lg bg-white/80 px-4 py-3 text-sm italic text-[#082D4B] shadow-sm"
          >
            <span class="text-base text-[#123F67]">“</span>
            {{ lt(c.feedback) }}
            <span class="text-base text-[#123F67]">”</span>
          </blockquote>
        </article>
      </div>
    </section>

    <!-- ============= 9. 合作医院展示 ============= -->
    <section class="bg-white py-14 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div class="mb-8 text-center md:mb-12">
          <h2 class="text-2xl font-bold text-[#082D4B] md:text-3xl">
            {{ t('equipment.partnerSection.title') }}
          </h2>
          <p class="mt-3 text-sm text-[#60788B]/80 md:text-base">
            {{ t('equipment.partnerSection.subtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article
            v-for="(h, i) in partnerHospitals"
            :key="i"
            class="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm"
          >
            <div
              class="flex items-center justify-between bg-gradient-to-r px-5 py-4 text-white md:px-6"
              :class="h.color"
            >
              <div>
                <h3 class="text-base font-bold md:text-lg">{{ lt(h.name) }}</h3>
                <p class="mt-0.5 text-xs opacity-90 md:text-sm">{{ lt(h.intro) }}</p>
              </div>
              <span
                class="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur md:text-sm"
              >
                {{ lt(h.tag) }}
              </span>
            </div>
            <div class="space-y-3 p-5 text-sm md:p-6">
              <div v-if="h.stars > 0" class="flex items-center gap-0.5">
                <Star
                  v-for="n in h.stars"
                  :key="n"
                  :size="16"
                  fill="#77CDEC"
                  class="text-[#FF8A34]"
                />
              </div>
              <div>
                <p class="font-semibold text-[#082D4B]">
                  {{ t('equipment.partnerSection.equipment') }}
                </p>
                <p class="mt-1 text-[#152B3C]/80">{{ lt(h.equipment) }}</p>
              </div>
              <div>
                <p class="font-semibold text-[#082D4B]">
                  {{ t('equipment.partnerSection.advantage') }}
                </p>
                <p class="mt-1 text-[#152B3C]/80">{{ lt(h.advantage) }}</p>
              </div>
              <div>
                <p class="font-semibold text-[#082D4B]">
                  {{ t('equipment.partnerSection.suit') }}
                </p>
                <p class="mt-1 text-[#152B3C]/80">{{ lt(h.suit) }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ============= 10. CTA ============= -->
    <section class="bg-gradient-to-br from-[#123F67] via-[#1685C3] to-[#FF8A34] py-14 md:py-20">
      <div class="mx-auto max-w-3xl px-4 text-center text-white md:px-8">
        <h2 class="text-2xl font-bold md:text-3xl">{{ t('equipment.cta.title') }}</h2>
        <p class="mt-3 text-sm opacity-90 md:text-base">
          {{ t('equipment.cta.subtitle') }}
        </p>
        <div class="mt-6">
          <RouterLink
            to="/report"
            class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#123F67] shadow-md transition hover:shadow-lg md:px-8 md:py-3.5 md:text-base"
          >
            {{ t('equipment.cta.button') }}
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.equipment-page {
  min-width: 0;
  background: #fff;
}

.equipment-hero {
  min-height: 520px;
  isolation: isolate;
  background: #eaf6fb;
}

.equipment-hero__media {
  position: absolute;
  z-index: -2;
  top: 0;
  right: 0;
  width: min(58%, 820px);
  height: 100%;
  object-fit: cover;
  object-position: center;
  mix-blend-mode: multiply;
  opacity: .88;
}

.equipment-hero__wash {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: linear-gradient(90deg, #eaf6fb 0%, rgba(234, 246, 251, .98) 38%, rgba(234, 246, 251, .66) 58%, rgba(234, 246, 251, 0) 82%);
}

.equipment-hero > .relative {
  z-index: 1;
  min-width: 0;
}

.equipment-hero h1 {
  max-width: 680px;
  letter-spacing: 0;
}

.equipment-hero p {
  max-width: 620px;
}

.equipment-hero > .relative > .mt-8 {
  max-width: 760px;
}

.equipment-page table {
  line-height: 1.55;
}

.equipment-page button:focus-visible,
.equipment-page a:focus-visible {
  outline: 3px solid rgba(255, 138, 52, .62);
  outline-offset: 3px;
}
.equipment-page :deep(.accordion-enter-active),
.equipment-page :deep(.accordion-leave-active) { display:grid; grid-template-rows:1fr; overflow:hidden; opacity:1; transition:grid-template-rows .38s cubic-bezier(.22,1,.36,1),opacity .24s ease; }
.equipment-page :deep(.accordion-enter-from),
.equipment-page :deep(.accordion-leave-to) { grid-template-rows:0fr; opacity:0; }
.equipment-detail { min-height:0; overflow:hidden; }
@media (prefers-reduced-motion: reduce) { .equipment-page :deep(.accordion-enter-active), .equipment-page :deep(.accordion-leave-active) { transition:none; } }

@media (max-width: 700px) {
  .equipment-hero {
    min-height: 0;
  }

  .equipment-hero__media {
    width: 100%;
    opacity: .2;
  }

  .equipment-hero__wash {
    background: rgba(234, 246, 251, .82);
  }

  .equipment-hero > .relative > .mt-8 {
    max-width: none;
  }

  .equipment-hero h1 {
    width: 100%;
    max-width: 100%;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .equipment-hero > .relative > .mt-8 > * {
    min-width: 0;
  }
}
</style>
