<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Activity,
  Baby,
  Bone,
  Brain,
  ClipboardCheck,
  Dna,
  HeartPulse,
  Leaf,
  ShieldPlus,
  Smile,
  Sparkles,
  Stethoscope,
} from 'lucide-vue-next'

type Locale = 'zh' | 'en' | 'id' | 'ru' | 'mn'
type LocalizedText = Record<Locale, string>

const { t, locale } = useI18n()

const supportedLocales: Locale[] = ['zh', 'en', 'id', 'ru', 'mn']
const activeLocale = computed<Locale>(() =>
  supportedLocales.includes(locale.value as Locale) ? locale.value as Locale : 'zh',
)

const lt = (entry: LocalizedText) => entry[activeLocale.value] || entry.zh

const services = [
  {
    title: {
      zh: '肿瘤中心',
      en: 'Oncology Center',
      id: 'Pusat Onkologi',
      ru: 'Онкологический центр',
      mn: 'Хавдрын төв',
    },
    icon: Activity,
    color: 'from-orange-400 to-red-400',
  },
  {
    title: {
      zh: '骨科中心',
      en: 'Orthopedics Center',
      id: 'Pusat Ortopedi',
      ru: 'Ортопедический центр',
      mn: 'Ортопедийн төв',
    },
    icon: Bone,
    color: 'from-amber-400 to-orange-500',
  },
  {
    title: {
      zh: '妇产科与儿科',
      en: 'Women & Children’s Department',
      id: 'Departemen Ibu & Anak',
      ru: 'Отделение женщин и детей',
      mn: 'Эх хүүхдийн тасаг',
    },
    icon: Baby,
    color: 'from-pink-400 to-orange-400',
  },
  {
    title: {
      zh: '中医科',
      en: 'Traditional Chinese Medicine (TCM)',
      id: 'Pengobatan Tradisional Tiongkok (TCM)',
      ru: 'Традиционная китайская медицина',
      mn: 'Хятадын уламжлалт анагаах ухаан',
    },
    icon: Leaf,
    color: 'from-lime-400 to-emerald-500',
  },
  {
    title: {
      zh: '健康体检中心',
      en: 'Medical Checkup Center',
      id: 'Pusat Pemeriksaan Kesehatan',
      ru: 'Центр медицинского обследования',
      mn: 'Эрүүл мэндийн үзлэгийн төв',
    },
    icon: ClipboardCheck,
    color: 'from-sky-400 to-blue-500',
  },
  {
    title: {
      zh: '神经医学中心',
      en: 'Neurosciences Department',
      id: 'Departemen Neurosains',
      ru: 'Неврологический центр',
      mn: 'Мэдрэлийн анагаахын төв',
    },
    icon: Brain,
    color: 'from-green-400 to-lime-500',
  },
  {
    title: {
      zh: '心脏中心',
      en: 'Cardiovascular Department',
      id: 'Departemen Kardiovaskular',
      ru: 'Кардиологический центр',
      mn: 'Зүрх судасны төв',
    },
    icon: HeartPulse,
    color: 'from-red-400 to-orange-500',
  },
  {
    title: {
      zh: '肝胆胰外科',
      en: 'Hepatobiliary and Pancreatic Surgery',
      id: 'Bedah Hepatobilier dan Pankreas',
      ru: 'Гепатобилиарная и панкреатическая хирургия',
      mn: 'Элэг, цөс, нойр булчирхайн мэс засал',
    },
    icon: ShieldPlus,
    color: 'from-violet-400 to-purple-500',
  },
  {
    title: {
      zh: '免疫细胞治疗中心',
      en: 'Immune Cell Therapy Center',
      id: 'Pusat Terapi Sel Imun',
      ru: 'Центр терапии иммунными клетками',
      mn: 'Дархлааны эсийн эмчилгээний төв',
    },
    icon: Dna,
    color: 'from-teal-400 to-cyan-500',
  },
  {
    title: {
      zh: '中医康养中心',
      en: 'TCM Wellness & Rehabilitation Center',
      id: 'Pusat Kebugaran & Rehabilitasi TCM',
      ru: 'Центр оздоровления и реабилитации ТКМ',
      mn: 'Уламжлалт анагаахын сэргээн засах төв',
    },
    icon: Sparkles,
    color: 'from-emerald-400 to-orange-400',
  },
  {
    title: {
      zh: '牙科中心',
      en: 'Dental Center',
      id: 'Pusat Gigi',
      ru: 'Стоматологический центр',
      mn: 'Шүдний төв',
    },
    icon: Smile,
    color: 'from-blue-400 to-indigo-500',
  },
] satisfies Array<{ title: LocalizedText; icon: any; color: string }>
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <section class="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div class="flex items-center gap-3">
          <Stethoscope class="h-9 w-9" />
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-orange-100">Medical Services</p>
            <h1 class="mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">
              {{ t('diseaseTech.title') }}
            </h1>
          </div>
        </div>
        <p class="mt-5 max-w-3xl text-base leading-relaxed text-orange-50 md:text-lg">
          {{ t('diseaseTech.subtitle') }}
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 md:py-14">
      <div class="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 md:text-3xl">{{ t('diseaseTech.servicesTitle') }}</h2>
          <p class="mt-2 text-sm text-gray-500">{{ t('diseaseTech.servicesSubtitle') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        <article
          v-for="service in services"
          :key="service.title.en"
          class="group flex min-h-[168px] flex-col items-center justify-center rounded-2xl border border-orange-100 bg-white px-4 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100"
        >
          <div
            :class="[
              'mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-orange-100 transition-transform duration-300 group-hover:scale-105',
              service.color,
            ]"
          >
            <component :is="service.icon" class="h-7 w-7" :stroke-width="1.8" />
          </div>
          <h3 class="text-base font-bold leading-snug text-gray-800 md:text-lg">
            {{ lt(service.title) }}
          </h3>
        </article>
      </div>
    </section>
  </div>
</template>
