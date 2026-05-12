<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Award,
  Stethoscope,
  Building2,
  Globe,
  Bed,
  Calendar,
  Users,
  ExternalLink,
  X,
  CheckCircle,
} from 'lucide-vue-next'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { RadarComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { hospitals, cities, type Hospital } from '@/data/hospitals'

use([RadarChart, RadarComponent, TooltipComponent, CanvasRenderer])

const { t } = useI18n()

const selectedCity = ref('全部')
const expandedId = ref<number | null>(null)
const lang = ref<'zh' | 'en'>('zh')
const chartKey = ref(0)

const filtered = computed(() =>
  selectedCity.value === '全部' ? hospitals : hospitals.filter((h) => h.city === selectedCity.value)
)

const toggleExpand = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id
}

const h = computed(() => hospitals.find((h) => h.id === expandedId.value) || null)

// Scroll lock when modal is open
let savedScrollY = 0
watch(expandedId, (val) => {
  if (val !== null) {
    savedScrollY = window.scrollY
    document.body.classList.add('scroll-locked')
    document.body.style.top = `-${savedScrollY}px`
    // 强制 echarts 在弹窗渲染后重新计算尺寸
    nextTick(() => { chartKey.value++ })
  } else {
    document.body.classList.remove('scroll-locked')
    document.body.style.top = ''
    window.scrollTo(0, savedScrollY)
  }
})
onUnmounted(() => {
  document.body.classList.remove('scroll-locked')
  document.body.style.top = ''
})

const radarOption = computed(() => {
  if (!h.value) return {}
  const isZh = lang.value === 'zh'
  return {
    tooltip: { confine: true },
    radar: {
      indicator: [
        { name: isZh ? '医疗技术' : 'Medical Tech', max: 100 },
        { name: isZh ? '设备水平' : 'Equipment', max: 100 },
        { name: isZh ? '国际服务' : 'Intl Service', max: 100 },
        { name: isZh ? '专家团队' : 'Experts', max: 100 },
        { name: isZh ? '患者评价' : 'Patient Rating', max: 100 },
      ],
      radius: '60%',
      name: { textStyle: { fontSize: 12 } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [90, 88, h.value.jci ? 95 : 70, 92, 87],
            name: h.value.name,
            areaStyle: { color: 'rgba(237,137,54,0.4)' },
            lineStyle: { color: '#DD6B20' },
            itemStyle: { color: '#DD6B20' },
          },
        ],
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50/30 to-white">
    <!-- Header -->
    <section class="bg-gradient-to-r from-[#C05621] to-[#ED8936] text-white py-16 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">中国顶尖国际医疗资源</h1>
        <p class="text-lg text-white/90 max-w-3xl mx-auto">
          北上广深+博鳌51家涉外认证医院，覆盖肿瘤/心血管/神经/骨科/牙科/慢性病等全病种
        </p>
        <div class="flex flex-wrap justify-center gap-4 mt-8 text-sm">
          <span class="bg-white/20 backdrop-blur px-4 py-2 rounded-full">15家 北京</span>
          <span class="bg-white/20 backdrop-blur px-4 py-2 rounded-full">10家 上海</span>
          <span class="bg-white/20 backdrop-blur px-4 py-2 rounded-full">6家 广州</span>
          <span class="bg-white/20 backdrop-blur px-4 py-2 rounded-full">9家 深圳</span>
          <span class="bg-white/20 backdrop-blur px-4 py-2 rounded-full">11家 博鳌</span>
        </div>
      </div>
    </section>

    <!-- City Filter + Language -->
    <div class="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="city in cities"
          :key="city"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition',
            selectedCity === city
              ? 'bg-[#DD6B20] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300',
          ]"
          @click="selectedCity = city"
        >
          {{ city }}
        </button>
      </div>
      <div class="flex gap-2">
        <button
          :class="['px-3 py-1 rounded text-sm', lang === 'zh' ? 'bg-orange-100 text-[#C05621] font-medium' : 'text-gray-500']"
          @click="lang = 'zh'"
        >
          中文
        </button>
        <button
          :class="['px-3 py-1 rounded text-sm', lang === 'en' ? 'bg-orange-100 text-[#C05621] font-medium' : 'text-gray-500']"
          @click="lang = 'en'"
        >
          EN
        </button>
      </div>
    </div>

    <!-- Hospital Grid -->
    <div class="max-w-7xl mx-auto px-4 pb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="hospital in filtered"
          :key="hospital.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group"
        >
          <!-- Image -->
          <div class="h-48 overflow-hidden relative">
            <img :src="hospital.image" :alt="hospital.name" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            <div class="absolute top-3 left-3 flex gap-2">
              <span
                v-if="hospital.jci"
                class="bg-green-600 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1"
              >
                <Award class="h-3 w-3" /> JCI
              </span>
              <span class="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">
                {{ hospital.type }}
              </span>
            </div>
            <div class="absolute bottom-3 left-3">
              <span class="bg-[#C05621] text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <MapPin class="h-3 w-3" /> {{ hospital.city }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="font-bold text-lg text-gray-900">{{ hospital.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ hospital.nameEn }}</p>

            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="s in hospital.specialties.slice(0, 3)"
                :key="s"
                class="bg-orange-50 text-[#C05621] text-xs px-2 py-1 rounded"
              >
                {{ s }}
              </span>
            </div>

            <div class="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span class="flex items-center gap-1"><Calendar class="h-3.5 w-3.5" /> {{ hospital.established }}</span>
              <span class="flex items-center gap-1"><Bed class="h-3.5 w-3.5" /> {{ hospital.beds }}{{ lang === 'zh' ? '床' : ' beds' }}</span>
              <span class="flex items-center gap-1"><Building2 class="h-3.5 w-3.5" /> {{ hospital.departments }}{{ lang === 'zh' ? '科室' : ' depts' }}</span>
            </div>

            <div class="flex gap-2 mt-4">
              <button
                class="flex-1 py-2 border border-[#DD6B20] text-[#DD6B20] rounded-lg text-sm font-medium hover:bg-orange-50 transition flex items-center justify-center gap-1"
                @click="toggleExpand(hospital.id)"
              >
                {{ lang === 'zh' ? '查看详情' : 'View Details' }}
                <ChevronDown class="h-4 w-4" />
              </button>
              <router-link
                to="/report"
                class="flex-1 py-2 bg-[#DD6B20] text-white rounded-lg text-sm font-medium hover:bg-[#C05621] transition flex items-center justify-center gap-1"
              >
                {{ lang === 'zh' ? '预约咨询' : 'Consult' }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="h"
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="expandedId = null"
      >
        <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl modal-overlay-scroll">
          <!-- Modal Header -->
          <div class="relative h-56">
            <img :src="h.image" :alt="h.name" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div class="absolute bottom-4 left-6 right-6 text-white">
              <h2 class="text-2xl font-bold">{{ lang === 'zh' ? h.name : h.nameEn }}</h2>
              <p class="text-sm text-white/80 mt-1 line-clamp-2">
                {{ lang === 'zh' ? h.intro.substring(0, 80) + '...' : h.introEn.substring(0, 100) + '...' }}
              </p>
            </div>
            <button
              class="absolute top-4 right-4 bg-white/20 backdrop-blur text-white rounded-full p-2 hover:bg-white/40"
              @click="expandedId = null"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-orange-50 rounded-lg p-3 text-center">
                <Calendar class="h-5 w-5 text-[#DD6B20] mx-auto mb-1" />
                <p class="text-xs text-gray-500">{{ lang === 'zh' ? '成立年份' : 'Established' }}</p>
                <p class="font-bold text-[#C05621]">{{ h.established }}</p>
              </div>
              <div class="bg-orange-50 rounded-lg p-3 text-center">
                <Bed class="h-5 w-5 text-[#DD6B20] mx-auto mb-1" />
                <p class="text-xs text-gray-500">{{ lang === 'zh' ? '开放床位' : 'Beds' }}</p>
                <p class="font-bold text-[#C05621]">{{ h.beds }}</p>
              </div>
              <div class="bg-orange-50 rounded-lg p-3 text-center">
                <Building2 class="h-5 w-5 text-[#DD6B20] mx-auto mb-1" />
                <p class="text-xs text-gray-500">{{ lang === 'zh' ? '临床科室' : 'Departments' }}</p>
                <p class="font-bold text-[#C05621]">{{ h.departments }}</p>
              </div>
              <div class="bg-orange-50 rounded-lg p-3 text-center">
                <Award class="h-5 w-5 text-[#DD6B20] mx-auto mb-1" />
                <p class="text-xs text-gray-500">{{ lang === 'zh' ? '认证' : 'Accreditation' }}</p>
                <p class="font-bold text-[#C05621]">{{ h.jci ? 'JCI' : h.type.split('/')[0] }}</p>
              </div>
            </div>

            <!-- Radar + Departments -->
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Stethoscope class="h-4 w-4 text-[#DD6B20]" />
                  {{ lang === 'zh' ? '医院实力评估' : 'Hospital Assessment' }}
                </h4>
                <v-chart :key="chartKey" :option="radarOption" class="w-full h-64" autoresize />
              </div>
              <div>
                <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 class="h-4 w-4 text-[#DD6B20]" />
                  {{ lang === 'zh' ? '核心科室' : 'Core Departments' }}
                </h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="d in (lang === 'zh' ? h.deptList : h.deptListEn).slice(0, 12)"
                    :key="d"
                    class="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-md"
                  >
                    {{ d }}
                  </span>
                </div>
                <h4 class="font-bold text-gray-900 mt-4 mb-3 flex items-center gap-2">
                  <Globe class="h-4 w-4 text-[#DD6B20]" />
                  {{ lang === 'zh' ? '国际患者服务' : 'International Services' }}
                </h4>
                <ul class="space-y-1.5">
                  <li
                    v-for="s in (lang === 'zh' ? h.services : h.servicesEn)"
                    :key="s"
                    class="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <CheckCircle class="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {{ s }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Intro -->
            <div>
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Users class="h-4 w-4 text-[#DD6B20]" />
                {{ lang === 'zh' ? '医院介绍' : 'Hospital Overview' }}
              </h4>
              <p class="text-sm text-gray-600 leading-relaxed">{{ lang === 'zh' ? h.intro : h.introEn }}</p>
            </div>

            <!-- Specialties -->
            <div>
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Award class="h-4 w-4 text-[#DD6B20]" />
                {{ lang === 'zh' ? '擅长病种' : 'Specialties' }}
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="s in (lang === 'zh' ? h.specialties : h.specialtiesEn)"
                  :key="s"
                  class="bg-orange-50 text-[#C05621] text-sm px-3 py-1.5 rounded-md font-medium"
                >
                  {{ s }}
                </span>
              </div>
            </div>

            <!-- Equipment -->
            <div>
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ExternalLink class="h-4 w-4 text-[#DD6B20]" />
                {{ lang === 'zh' ? '核心设备与技术' : 'Core Equipment & Technology' }}
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="e in (lang === 'zh' ? h.equipments : h.equipmentsEn)"
                  :key="e"
                  class="bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-lg p-3 text-sm text-gray-700"
                >
                  {{ e }}
                </div>
              </div>
            </div>

            <!-- External Links -->
            <div class="flex gap-3 pt-4 border-t border-gray-100">
              <a
                :href="h.website"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 bg-[#DD6B20] text-white text-center py-3 rounded-lg font-medium hover:bg-[#C05621] transition flex items-center justify-center gap-2"
              >
                <Globe class="h-4 w-4" />
                {{ lang === 'zh' ? '官网' : 'Website' }}
              </a>
              <a
                :href="h.wiki"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 border border-[#DD6B20] text-[#DD6B20] text-center py-3 rounded-lg font-medium hover:bg-orange-50 transition flex items-center justify-center gap-2"
              >
                <ExternalLink class="h-4 w-4" />
                {{ lang === 'zh' ? '百科' : 'Wiki' }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
