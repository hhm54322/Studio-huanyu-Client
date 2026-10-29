<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import type { ProfessionalReport, ReportLayoutBlock } from '@/services/reportSubmissions'
import {
  Activity,
  ArrowLeft,
  Atom,
  Award,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileSearch,
  FileText,
  Footprints,
  Globe,
  Headset,
  HeartPulse,
  Hospital,
  Image,
  Landmark,
  Loader2,
  Mail,
  Microscope,
  Phone,
  Plane,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Upload,
  User,
  Users,
} from 'lucide-vue-next'
const props = defineProps<{ report: ProfessionalReport, activeKey: string }>()
const emit = defineEmits<{ module: [key: string] }>()
const report = computed(() => props.report)
const activeTab = computed({ get: () => props.activeKey === 'overview' ? 'records' : props.activeKey, set: (key) => emit('module', key) })
const layoutIconMap: Record<string, Component> = {
  Activity,
  Atom,
  Award,
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  DollarSign,
  FileSearch,
  FileText,
  Footprints,
  Globe,
  Headset,
  HeartPulse,
  Hospital,
  Landmark,
  Microscope,
  Plane,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  Trophy,
  Users,
}

const getLayoutIcon = (icon?: string) => layoutIconMap[icon || ''] || CheckCircle

const toneClass = (tone?: string) => {
  if (tone === 'danger') return 'border-red-500/25 bg-red-500/10'
  if (tone === 'warning') return 'border-amber-500/25 bg-amber-500/10'
  if (tone === 'highlight') return 'border-teal-500/30 bg-teal-500/10'
  return 'border-slate-800 bg-slate-950/40'
}

const toneTextClass = (tone?: string) => {
  if (tone === 'danger') return 'text-red-300'
  if (tone === 'warning') return 'text-amber-300'
  if (tone === 'highlight') return 'text-teal-300'
  return 'text-slate-300'
}


const professionalLayoutTabs = computed(() => report.value.tabs || [])
const activeProfessionalLayoutTab = computed(() => professionalLayoutTabs.value.find(tab => tab.key === activeTab.value) || professionalLayoutTabs.value[0])
const hasBlockContent = (block: ReportLayoutBlock) => Boolean(
  block.description ||
  block.metrics?.length ||
  block.cards?.length ||
  block.table?.rows?.length ||
  block.timeline?.length ||
  block.items?.length,
)


</script>
<template><div class="professional-report-page min-h-screen bg-slate-950 text-slate-200"><div class="mx-auto max-w-6xl px-4 py-8">
        <section data-review-module="overview" data-review-target="overview" tabindex="0" class="mb-6 rounded-lg border border-teal-500/20 bg-slate-900/80 p-6">
          <div class="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs text-teal-300">
                <FileText class="h-3.5 w-3.5" />
                {{ report.generatedBy === 'llm' ? '专业评估报告' : '预审评估报告' }}
              </div>
              <h1 class="text-2xl font-bold text-white md:text-3xl">{{ report.title }}</h1>
              <p class="mt-2 text-sm text-slate-400">{{ report.subtitle }}</p>
            </div>
            <div class="text-left md:text-right">
              <div class="text-xs text-slate-500">报告编号</div>
              <div class="font-mono text-lg font-semibold text-teal-300">{{ report.id }}</div>
              <div class="mt-1 text-sm text-slate-500">{{ report.date }}</div>
            </div>
          </div>

          <div class="mt-6 grid gap-3 md:grid-cols-4">
            <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">患者</div>
              <div class="mt-1 font-semibold text-white">{{ report.patientSnapshot.patient }}</div>
            </div>
            <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">诊断状态</div>
              <div class="mt-1 font-semibold text-white">{{ report.patientSnapshot.diagnosisStatus }}</div>
            </div>
            <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">资料完整度</div>
              <div class="mt-1 font-semibold text-teal-300">{{ report.patientSnapshot.dataCompleteness }}/100</div>
            </div>
            <div class="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">上传文件</div>
              <div class="mt-1 font-semibold text-white">{{ report.patientSnapshot.uploadedFiles.length }} 个</div>
            </div>
          </div>

          <div v-if="report.patientSnapshot.parsedFiles.length" class="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <div class="mb-3 text-sm font-semibold text-white">资料解析摘要</div>
            <div class="grid gap-3 md:grid-cols-2">
              <div v-for="file in report.patientSnapshot.parsedFiles" :key="file.file" class="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <div class="mb-1 flex items-center justify-between gap-3">
                  <span class="truncate text-sm font-medium text-slate-200">{{ file.file }}</span>
                  <span
                    :class="[
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px]',
                      file.status === 'parsed' ? 'bg-emerald-500/10 text-emerald-300' : file.status === 'partial' ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-800 text-slate-400',
                    ]"
                  >
                    {{ file.status }}
                  </span>
                </div>
                <p class="line-clamp-3 text-xs leading-5 text-slate-400">{{ file.summary }}</p>
              </div>
            </div>
          </div>
        </section>

        <section data-review-module="overview" data-review-target="summary" tabindex="0" class="mb-6 grid gap-3 md:grid-cols-3">
          <div v-for="item in report.executiveSummary" :key="item" class="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300">
            {{ item }}
          </div>
        </section>

        <template v-if="professionalLayoutTabs.length">
          <div class="space-y-5">
            <div class="rounded-lg border border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-900/30 p-4">
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <div>
                  <span class="text-slate-500">报告编号 / Report ID: </span>
                  <span class="font-mono text-teal-300">{{ report.id }}</span>
                </div>
                <div>
                  <span class="text-slate-500">患者 / Patient: </span>
                  <span class="text-slate-300">{{ report.patientSnapshot.patient }}</span>
                </div>
                <div>
                  <span class="text-slate-500">生成时间 / Generated: </span>
                  <span class="text-slate-300">{{ report.date }}</span>
                </div>
                <div>
                  <span class="text-slate-500">版本 / Version: </span>
                  <span class="text-emerald-300">Professional Full Version</span>
                </div>
              </div>
            </div>

            <nav class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
              <button
                v-for="tab in professionalLayoutTabs"
                :key="tab.key"
                :class="[
                  'inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition',
                  activeTab === tab.key
                    ? 'border-teal-500/30 bg-teal-500/20 text-teal-300'
                    : 'border-slate-700/30 bg-slate-800/40 text-slate-400 hover:text-slate-200',
                ]"
                :title="`${tab.label}${tab.labelEn ? ' / ' + tab.labelEn : ''}`"
                @click="activeTab = tab.key"
              >
                <component :is="getLayoutIcon(tab.icon)" class="h-3.5 w-3.5" />
                <span class="hidden md:inline">{{ tab.label }}</span>
                <span class="md:hidden">{{ tab.label.slice(0, 4) }}</span>
              </button>
            </nav>

            <div v-if="activeProfessionalLayoutTab" class="-mt-2 flex items-center gap-2 text-xs text-slate-500">
              <ChevronRight class="h-3 w-3" />
              <span class="text-teal-300">{{ activeProfessionalLayoutTab.label }}</span>
              <span v-if="activeProfessionalLayoutTab.labelEn">/</span>
              <span v-if="activeProfessionalLayoutTab.labelEn">{{ activeProfessionalLayoutTab.labelEn }}</span>
            </div>

            <section v-if="activeProfessionalLayoutTab" class="space-y-4">
              <div v-if="activeProfessionalLayoutTab.summary" class="rounded-lg border border-teal-500/20 bg-teal-500/10 p-4 text-sm leading-6 text-teal-100">
                {{ activeProfessionalLayoutTab.summary }}
              </div>

              <article
                v-for="(block, blockIndex) in activeProfessionalLayoutTab.blocks"
                :data-review-module="activeTab"
                :data-review-target="`${activeTab}-block-${blockIndex}`"
                tabindex="0"
                v-show="hasBlockContent(block)"
                :key="`${activeProfessionalLayoutTab.key}-${block.title}`"
                :class="['rounded-lg border p-4', toneClass(block.tone)]"
              >
                <div class="mb-3">
                  <h3 class="flex items-center gap-2 font-semibold text-white">
                    <component :is="getLayoutIcon(activeProfessionalLayoutTab.icon)" class="h-4 w-4 text-teal-400" />
                    {{ block.title }}
                  </h3>
                  <p v-if="block.titleEn" class="mt-0.5 text-xs text-slate-500">{{ block.titleEn }}</p>
                  <p v-if="block.description" class="mt-2 text-sm leading-6 text-slate-300">{{ block.description }}</p>
                </div>

                <div v-if="block.metrics?.length" class="grid gap-3 md:grid-cols-3">
                  <div
                    v-for="metric in block.metrics"
                    :key="metric.label"
                    :class="['rounded-lg border p-3', toneClass(metric.tone)]"
                  >
                    <div class="text-xs text-slate-500">{{ metric.label }}</div>
                    <div :class="['mt-1 text-lg font-bold', toneTextClass(metric.tone)]">{{ metric.value }}</div>
                    <p v-if="metric.detail" class="mt-2 text-xs leading-5 text-slate-400">{{ metric.detail }}</p>
                  </div>
                </div>

                <div v-if="block.cards?.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div
                    v-for="card in block.cards"
                    :key="`${card.title}-${card.subtitle || ''}`"
                    :class="['rounded-lg border p-3', toneClass(card.tone)]"
                  >
                    <div class="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 class="text-sm font-semibold text-white">{{ card.title }}</h4>
                        <p v-if="card.subtitle" class="mt-0.5 text-[11px] text-slate-500">{{ card.subtitle }}</p>
                      </div>
                      <span v-if="card.tag" class="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-300">{{ card.tag }}</span>
                    </div>
                    <div v-if="card.value" :class="['mb-2 text-sm font-bold', toneTextClass(card.tone)]">{{ card.value }}</div>
                    <p v-if="card.description" class="text-xs leading-5 text-slate-300">{{ card.description }}</p>
                    <p v-if="card.detail" class="mt-2 rounded-lg bg-slate-900/60 p-2 text-[11px] leading-5 text-slate-500">{{ card.detail }}</p>
                  </div>
                </div>

                <div v-if="block.table" class="overflow-x-auto rounded-lg border border-slate-800">
                  <table class="w-full min-w-[720px] text-xs">
                    <thead class="bg-slate-900/80 text-slate-500">
                      <tr>
                        <th v-for="column in block.table.columns" :key="column" class="px-3 py-2 text-left font-medium">{{ column }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
                      <tr
                        v-for="(row, rowIndex) in block.table.rows"
                        :key="rowIndex"
                        :class="row.highlight ? 'bg-teal-500/10' : 'hover:bg-slate-900/40'"
                      >
                        <td v-for="(cell, cellIndex) in row.cells" :key="cellIndex" class="px-3 py-2 leading-5 text-slate-300">{{ cell }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-if="block.timeline?.length" class="space-y-3">
                  <div v-for="(item, index) in block.timeline" :key="`${item.time}-${item.title}`" class="flex gap-3">
                    <div class="flex shrink-0 flex-col items-center">
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">{{ index + 1 }}</div>
                      <div v-if="index < (block.timeline?.length || 0) - 1" class="my-1 h-full min-h-8 w-px bg-slate-800"></div>
                    </div>
                    <div class="flex-1 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                      <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <h4 class="text-sm font-semibold text-white">{{ item.title }}</h4>
                        <span class="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">{{ item.time }}</span>
                      </div>
                      <p v-if="item.description" class="text-xs leading-5 text-slate-400">{{ item.description }}</p>
                      <ul v-if="item.items?.length" class="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                        <li v-for="task in item.items" :key="task" class="flex gap-2">
                          <CheckCircle class="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                          <span>{{ task }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <ul v-if="block.items?.length" class="space-y-2 text-sm leading-6 text-slate-300">
                  <li v-for="item in block.items" :key="item" class="flex gap-2">
                    <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </article>
            </section>
          </div>
        </template>

        </div></div></template>
<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgba(51, 65, 85, 0.9);
  background: rgba(15, 23, 42, 0.72);
  padding: 0.75rem 1rem;
  color: white;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field:focus {
  border-color: rgba(20, 184, 166, 0.72);
  box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.18);
}

.field::placeholder {
  color: rgb(100, 116, 139);
}

.report-panel {
  border: 1px solid rgb(30, 41, 59);
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.74);
  padding: 1.25rem;
}

.report-section {
  scroll-margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.section-title {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
}

.professional-report-page {
  background: #061725;
}

.professional-report-page > div {
  padding-top: clamp(32px, 5vw, 72px);
  padding-bottom: clamp(56px, 7vw, 112px);
}

.professional-report-page .field {
  min-height: 48px;
}

.professional-report-page button:focus-visible,
.professional-report-page a:focus-visible,
.professional-report-page label:has(input:focus-visible),
.professional-report-page label:has(select:focus-visible),
.professional-report-page label:has(textarea:focus-visible) {
  outline: 2px solid rgba(45, 212, 191, .84);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .professional-report-page > div {
    padding-top: 24px;
    padding-bottom: 64px;
  }
}
</style>
