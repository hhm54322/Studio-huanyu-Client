<script setup lang="ts">
import { computed, nextTick, reactive, ref, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import axios from 'axios'
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
import {
  createProfessionalReportSubmission,
  getReportSubmission,
  getProfessionalReportSubmission,
  type ProfessionalReport,
  type ProfessionalReportPayload,
  type ReportLayoutBlock,
} from '@/services/reportSubmissions'
import { useAppVersion } from '@/composables/useAppVersion'

const { locale } = useI18n()
const route = useRoute()
const { checkForUpdate } = useAppVersion()

type UploadedFile = {
  id: string
  file: File
}

const purposeOptions = [
  { value: 'breast_cancer', label: '乳腺癌 / Breast Cancer' },
  { value: 'lung_cancer', label: '肺癌 / Lung Cancer' },
  { value: 'nasopharyngeal_cancer', label: '鼻咽癌 / Nasopharyngeal Cancer' },
  { value: 'liver_cancer', label: '肝癌 / Liver Cancer' },
  { value: 'cardiovascular_tumor', label: '心血管肿瘤 / Cardiovascular Tumor' },
  { value: 'dental', label: '牙科 / Dental' },
  { value: 'cardiology_cardiothoracic', label: '心内科与心胸外科 / Cardiology & Cardiothoracic' },
  { value: 'neurosurgery', label: '神经外科 / Neurosurgery' },
  { value: 'spine_surgery', label: '脊柱外科 / Spine Surgery' },
  { value: 'endocrinology_metabolism', label: '内分泌与代谢 / Endocrinology & Metabolism' },
  { value: 'premium_checkup', label: '高端体检 / Premium Checkup' },
  { value: 'other', label: '其他/诊断未明 / Other' },
]

const regionOptions = [
  { value: 'north_america', label: '北美（美国/加拿大）' },
  { value: 'europe', label: '欧洲（英国/德国/法国）' },
  { value: 'southeast_asia', label: '东南亚（新加坡/泰国/马来西亚）' },
  { value: 'japan_korea', label: '日韩' },
  { value: 'middle_east', label: '中东' },
  { value: 'australia_new_zealand', label: '澳新' },
]

const form = reactive({
  fullName: '',
  gender: '',
  dateOfBirth: '',
  nationality: '',
  phone: '',
  email: '',
  city: '',
  preferredLanguage: '',
  visitPurpose: '',
  diagnosis: '',
  stage: '',
  chiefComplaint: '',
  pathologySummary: '',
  imagingSummary: '',
  geneticSummary: '',
  treatmentHistory: '',
  medicationHistory: '',
  comorbidities: '',
  allergyHistory: '',
  budgetRange: '',
  insuranceType: '',
  desiredCity: '',
  urgency: 'routine' as 'routine' | 'priority' | 'urgent',
})

const selectedRegions = ref(['north_america', 'europe', 'southeast_asia', 'japan_korea'])
const files = ref<UploadedFile[]>([])
const generating = ref(false)
const errorMessage = ref('')
const errorTone = ref<'error' | 'warning'>('error')
const report = ref<ProfessionalReport | null>(null)
const activeTab = ref('records')
const sourceSubmissionNo = ref('')
const sourceLoadMessage = ref('')
const sourceLoadFailed = ref(false)

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

const professionalLayoutTabs = computed(() => report.value?.tabs?.length ? report.value.tabs : [])
const activeProfessionalLayoutTab = computed(() => (
  professionalLayoutTabs.value.find((tab) => tab.key === activeTab.value) || professionalLayoutTabs.value[0]
))
const isDentalReport = computed(() => (
  form.visitPurpose === 'dental' ||
  report.value?.hospitalRecommendations?.some((item) => /鼎植|口腔|牙科/.test(`${item.hospital}${item.whyFit}${item.department}`)) ||
  /牙|口腔|鼎植/.test(`${report.value?.title || ''}${report.value?.clinicalAssessment?.workingDiagnosis || ''}`)
))
const hospitalSectionTitle = computed(() => (
  isDentalReport.value ? '七、推荐牙科品牌/机构' : '七、国内权威推荐就诊医院'
))
const hospitalGridClass = computed(() => isDentalReport.value ? 'grid gap-4 md:grid-cols-1' : 'grid gap-4 md:grid-cols-3')

const hasBlockContent = (block: ReportLayoutBlock) => Boolean(
  block.description ||
  block.metrics?.length ||
  block.cards?.length ||
  block.table?.rows?.length ||
  block.timeline?.length ||
  block.items?.length,
)

const tabs = [
  { key: 'diagnosis', label: '诊断解读', icon: Microscope },
  { key: 'assessment', label: '病情评估', icon: Target },
  { key: 'pathway', label: '治疗路径', icon: Stethoscope },
  { key: 'cost', label: '费用明细', icon: DollarSign },
  { key: 'technology', label: '技术优势', icon: Sparkles },
  { key: 'countries', label: '国家对比', icon: Globe },
  { key: 'hospitals', label: '医院推荐', icon: Hospital },
  { key: 'itinerary', label: '行程服务', icon: Plane },
  { key: 'next', label: '风险与下一步', icon: ShieldAlert },
]

const fileTypeCards = [
  { icon: FileText, label: '病理报告', desc: 'PDF/DOCX/JPG/PNG' },
  { icon: Image, label: 'CT/MRI影像资料', desc: 'DICOM/JPG/PNG' },
  { icon: FileSearch, label: '基因检测报告', desc: 'PDF/图片' },
  { icon: ClipboardList, label: '既往治疗记录', desc: 'PDF/图片/文本' },
]

const professionalPackages = [
  {
    name: '标准面诊包',
    nameEn: 'Standard',
    price: '$185-425',
    cny: '约 ¥1,300-3,000',
    tag: '最受欢迎',
    featured: true,
    features: [
      '基础包全部内容',
      '专家1v1视频面诊30分钟',
      '7天无限跟进答疑',
      '病历翻译服务',
      '精准费用到千位',
      '指定专家推荐',
      '治疗时间规划',
    ],
  },
  {
    name: '深度面诊包',
    nameEn: 'Premium',
    price: '$425-1,400',
    cny: '约 ¥3,000-10,000',
    tag: '',
    featured: false,
    features: [
      '标准包全部内容',
      '多学科专家会诊',
      '外科+肿瘤内科+放疗科联合会诊',
      '14天无限跟进答疑',
      '治疗方案第二意见',
      '医疗签证邀请函',
      '防复发随访方案定制',
    ],
  },
]

const phoneRegex = /^\+?[0-9][0-9\s\-()]{6,19}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const fromFreeReport = computed(() => Boolean(sourceSubmissionNo.value && !sourceLoadFailed.value))
const sourceSummaryItems = computed(() => [
  { label: '患者', value: form.fullName || '-' },
  { label: '科室/就医目的', value: purposeOptions.find((item) => item.value === form.visitPurpose)?.label || form.visitPurpose || '-' },
  { label: '联系电话', value: form.phone || '-' },
  { label: '核心诉求', value: form.chiefComplaint || '-' },
])

const validationErrors = computed(() => {
  const errors: string[] = []
  if (form.fullName.trim().length < 2) errors.push('请填写姓名。')
  if (!form.gender) errors.push('请选择性别。')
  if (!phoneRegex.test(form.phone.trim())) errors.push('请填写有效联系电话。')
  if (form.email.trim() && !emailRegex.test(form.email.trim())) errors.push('邮箱格式不正确。')
  if (!form.visitPurpose) errors.push('请选择科室/就医目的。')
  if (form.chiefComplaint.trim().length < 6) errors.push('请至少填写6个字的症状、诊断或核心诉求。')
  if (!selectedRegions.value.length) errors.push('请至少选择一个对比地区。')
  if (!files.value.length) errors.push('请上传病历、检查单、影像报告或图片后生成专业报告。')
  return errors
})

const canSubmit = computed(() => validationErrors.value.length === 0 && !generating.value)
const sourceFileSummary = computed(() => {
  if (!sourceSubmissionNo.value) return ''
  return sourceLoadMessage.value || `已沿用简易报告 ${sourceSubmissionNo.value} 的基础信息，请上传病历、检查单、影像报告或图片生成专业报告。`
})

const addFiles = (fileList: FileList | null) => {
  if (!fileList) return
  const nextFiles = Array.from(fileList).map((file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
  }))
  files.value = [...files.value, ...nextFiles].slice(0, 20)
}

const removeFile = (id: string) => {
  files.value = files.value.filter((item) => item.id !== id)
}

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback
  const data = error.response?.data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return fallback
}

const getApiErrorTone = (error: unknown): 'error' | 'warning' => {
  if (!axios.isAxiosError(error)) return 'error'
  const code = error.response?.data?.error
  return code === 'PROFESSIONAL_REPORT_GENERATION_FAILED' ? 'warning' : 'error'
}

const normalizeProfessionalReport = (input: ProfessionalReport): ProfessionalReport => ({
  ...input,
  diagnosticConclusion: input.diagnosticConclusion || {
    finalImpression: input.clinicalAssessment?.workingDiagnosis
      ? `当前资料支持围绕“${input.clinicalAssessment.workingDiagnosis}”进行专业预审，最终仍需医生复核原始资料后确认。`
      : '当前资料已生成专业预审报告，仍需医生复核原始资料后确认。',
    severityInterpretation: input.clinicalAssessment?.severity || '当前严重程度需结合补充资料进一步分层评估。',
    indicatorInterpretations: [{
      indicator: '关键指标',
      value: input.patientSnapshot?.diagnosisStatus || '当前资料未见明确数值',
      interpretation: '建议补充病理、影像、基因/实验室或专科检查资料，避免仅凭主诉决定治疗路径。',
    }],
    evidenceBasis: input.clinicalAssessment?.keyFindings?.length
      ? input.clinicalAssessment.keyFindings
      : ['当前主要依据用户填写的主诉和就医目的；建议补充原始报告、影像或既往治疗资料。'],
  },
  prognosisComparison: input.prognosisComparison || {
    positioning: '本节用于结构化说明当前风险、治疗窗口和中国方案价值；不作为疗效承诺。',
    metrics: [{
      metric: '资料完整度',
      currentRisk: '资料不完整会影响治疗路径和费用估算准确性。',
      chinaReference: '可先通过资料复核和专家预审提高决策确定性。',
      note: '最终以医生面诊和医院正式方案为准。',
    }],
    conclusion: '中国方案的核心价值在于资料复核、专家预审、治疗路径排序、费用拆分和跨境服务执行。',
  },
  technologyAdvantages: input.technologyAdvantages?.length ? input.technologyAdvantages : [
    { technology: '专科资料复核', value: '由目标专科复核病理、影像、检查和既往治疗，减少信息误差。', applicability: '适用于所有跨境就医预审。' },
    { technology: '多学科联合评估', value: '把诊断、治疗、康复和并发症管理放在同一决策框架下。', applicability: '适用于疑难、重症、复发或路径不清晰的患者。' },
    { technology: '远程复诊与长期随访', value: '治疗后继续追踪复查结果、用药和康复计划。', applicability: '适用于需要跨国连续管理的患者。' },
  ],
  paymentAndInsurance: input.paymentAndInsurance?.length ? input.paymentAndInsurance : [
    '建议按医院正式报价、平台服务项目和在华生活费用分项确认预算。',
    '如持有国际商业保险，建议提前确认预授权、直付或事后理赔要求。',
  ],
})

const toggleRegion = (region: string) => {
  if (selectedRegions.value.includes(region)) {
    selectedRegions.value = selectedRegions.value.filter((item) => item !== region)
    return
  }
  selectedRegions.value = [...selectedRegions.value, region]
}

const buildPayload = (): ProfessionalReportPayload => ({
  locale: ['zh', 'en', 'id', 'ru', 'mn'].includes(locale.value) ? locale.value : 'zh',
  patient: {
    fullName: form.fullName.trim(),
    gender: form.gender,
    dateOfBirth: form.dateOfBirth,
    nationality: form.nationality.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    city: form.city.trim(),
    preferredLanguage: form.preferredLanguage.trim(),
  },
  medical: {
    visitPurpose: form.visitPurpose,
    diagnosis: form.diagnosis.trim(),
    stage: form.stage.trim(),
    chiefComplaint: form.chiefComplaint.trim(),
    pathologySummary: form.pathologySummary.trim(),
    imagingSummary: form.imagingSummary.trim(),
    geneticSummary: form.geneticSummary.trim(),
    treatmentHistory: form.treatmentHistory.trim(),
    medicationHistory: form.medicationHistory.trim(),
    comorbidities: form.comorbidities.trim(),
    allergyHistory: form.allergyHistory.trim(),
  },
  preferences: {
    selectedRegions: selectedRegions.value,
    budgetRange: form.budgetRange.trim(),
    insuranceType: form.insuranceType.trim(),
    desiredCity: form.desiredCity.trim(),
    urgency: form.urgency,
  },
  uploadedFiles: [],
  parsedFiles: [],
})

const generateReport = async () => {
  errorMessage.value = ''
  errorTone.value = 'error'
  if (!canSubmit.value) {
    errorMessage.value = validationErrors.value[0] || '请检查表单。'
    return
  }

  generating.value = true
  try {
    if (await checkForUpdate({ force: true })) {
      errorMessage.value = '系统已更新，请先刷新页面后再生成专业报告。'
      errorTone.value = 'warning'
      generating.value = false
      return
    }

    const response = await createProfessionalReportSubmission(buildPayload(), files.value.map((item) => item.file))
    if (!response.report) throw new Error('Professional report response did not include report')
    const normalizedReport = normalizeProfessionalReport(response.report)
    generating.value = false
    report.value = normalizedReport
    activeTab.value = normalizedReport.tabs?.[0]?.key || 'records'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error(error)
    errorMessage.value = getApiErrorMessage(error, '专业报告生成失败，请稍后重试或减少上传文件大小。')
    errorTone.value = getApiErrorTone(error)
    generating.value = false
  } finally {
    generating.value = false
  }
}

const loadExistingReport = async () => {
  const querySubmissionNo = typeof route.query.submissionNo === 'string' ? route.query.submissionNo : ''
  if (!querySubmissionNo) return

  errorMessage.value = ''
  errorTone.value = 'error'
  generating.value = true
  try {
    const response = await getProfessionalReportSubmission(querySubmissionNo)
    const normalizedReport = normalizeProfessionalReport(response.report)
    report.value = normalizedReport
    activeTab.value = normalizedReport.tabs?.[0]?.key || 'records'
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error(error)
    errorMessage.value = '专业报告加载失败，请检查报告编号或稍后重试。'
    errorTone.value = 'error'
  } finally {
    generating.value = false
  }
}

const inferDiagnosisFromFreeReport = (value: string) => {
  const normalized = value.trim()
  if (!normalized || normalized === '综合分诊评估') return ''
  return normalized
}

const loadSourceSubmission = async () => {
  const querySourceSubmissionNo = typeof route.query.sourceSubmissionNo === 'string' ? route.query.sourceSubmissionNo : ''
  if (!querySourceSubmissionNo) return

  errorMessage.value = ''
  errorTone.value = 'error'
  sourceSubmissionNo.value = querySourceSubmissionNo
  generating.value = true
  try {
    const response = await getReportSubmission(querySourceSubmissionNo)
    const basicInfo = response.basicInfo
    if (basicInfo) {
      form.fullName = basicInfo.fullName || form.fullName
      form.gender = basicInfo.gender || form.gender
      form.dateOfBirth = basicInfo.dateOfBirth || form.dateOfBirth
      form.nationality = basicInfo.nationality || form.nationality
      form.phone = basicInfo.phone || form.phone
      form.email = basicInfo.email || form.email
      form.city = basicInfo.city || form.city
      form.preferredLanguage = basicInfo.preferredLanguage || form.preferredLanguage
      form.visitPurpose = basicInfo.visitPurpose || form.visitPurpose
      form.chiefComplaint = basicInfo.chiefComplaint || response.report?.need || form.chiefComplaint
    }
    if (response.selectedRegions?.length) selectedRegions.value = response.selectedRegions
    form.diagnosis = inferDiagnosisFromFreeReport(response.report?.disease || form.diagnosis)
    if (!form.chiefComplaint && response.report?.need) form.chiefComplaint = response.report.need
    sourceLoadMessage.value = `已沿用简易报告 ${querySourceSubmissionNo} 的基础信息和症状详情。专业报告需补充上传病历、检查单、影像报告或图片。`
    sourceLoadFailed.value = false
  } catch (error) {
    console.error(error)
    sourceLoadMessage.value = '简易报告资料读取失败，请返回简易报告重新进入，或在本页完整填写信息并上传资料。'
    sourceLoadFailed.value = true
  } finally {
    generating.value = false
  }
}

const initPage = async () => {
  const querySubmissionNo = typeof route.query.submissionNo === 'string' ? route.query.submissionNo : ''
  if (querySubmissionNo) {
    await loadExistingReport()
    return
  }
  await loadSourceSubmission()
}

initPage()

const reset = () => {
  report.value = null
  errorMessage.value = ''
  errorTone.value = 'error'
}

const scrollToSection = (key: string) => {
  activeTab.value = key
  document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200">
    <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <router-link to="/report" class="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-teal-300">
          <ArrowLeft class="h-4 w-4" />
          返回报告体验
        </router-link>
        <button
          v-if="report"
          class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-teal-500/60 hover:text-teal-300"
          @click="reset"
        >
          重新生成
        </button>
      </div>

      <template v-if="!report">
        <section class="mb-8 text-center">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm text-teal-300">
            <Sparkles class="h-4 w-4" />
            专业版报告生成 / Professional Report
          </div>
          <h1 class="text-3xl font-bold text-white md:text-4xl">上传资料，生成来华就医专业评估报告</h1>
          <p class="mx-auto mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            {{ fromFreeReport ? '已从简易报告带入基础信息和症状详情，请上传病历、检查单、影像报告或图片后生成专业结构化预审报告。' : '上传病历、检查单、影像报告和既往治疗资料后，系统将结合您填写的病情信息生成专业结构化预审报告。' }}
          </p>
        </section>

        <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section class="space-y-6">
            <div v-if="fromFreeReport" class="rounded-2xl border border-teal-500/20 bg-slate-900/70 p-5 md:p-6">
              <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <FileSearch class="h-5 w-5 text-teal-400" />
                已沿用简易报告基础信息
              </h2>
              <p class="mb-4 text-sm leading-6 text-slate-400">
                基础信息和症状详情已从简易报告带入，专业版只需要补充上传医疗资料。
              </p>
              <div class="grid gap-3 md:grid-cols-2">
                <div
                  v-for="item in sourceSummaryItems"
                  :key="item.label"
                  :class="[
                    'rounded-xl border border-slate-800 bg-slate-950/40 p-4',
                    item.label === '核心诉求' ? 'md:col-span-2' : '',
                  ]"
                >
                  <div class="text-xs text-slate-500">{{ item.label }}</div>
                  <div class="mt-1 text-sm font-semibold leading-6 text-slate-100">{{ item.value }}</div>
                </div>
              </div>
            </div>

            <div v-if="!fromFreeReport" class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
              <h2 class="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                <User class="h-5 w-5 text-teal-400" />
                患者基础信息
              </h2>
              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>姓名 *</span>
                  <input v-model="form.fullName" class="field" placeholder="Full name" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>性别 *</span>
                  <select v-model="form.gender" class="field">
                    <option value="">请选择</option>
                    <option value="male">男 / Male</option>
                    <option value="female">女 / Female</option>
                    <option value="other">其他 / Other</option>
                  </select>
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>出生日期</span>
                  <input v-model="form.dateOfBirth" type="date" class="field" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>国籍</span>
                  <input v-model="form.nationality" class="field" placeholder="Nationality" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>电话 *</span>
                  <input v-model="form.phone" class="field" placeholder="+86 138..." />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>邮箱</span>
                  <input v-model="form.email" class="field" placeholder="email@example.com" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>所在城市</span>
                  <input v-model="form.city" class="field" placeholder="City" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>首选语言</span>
                  <input v-model="form.preferredLanguage" class="field" placeholder="English / 中文 / Russian..." />
                </label>
              </div>
            </div>

            <div v-if="!fromFreeReport" class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
              <h2 class="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                <HeartPulse class="h-5 w-5 text-teal-400" />
                医疗资料摘要
              </h2>
              <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-1.5 text-sm text-slate-400 md:col-span-2">
                  <span>科室/就医目的 *</span>
                  <select v-model="form.visitPurpose" class="field">
                    <option value="">请选择</option>
                    <option v-for="item in purposeOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>已确诊疾病/工作诊断</span>
                  <input v-model="form.diagnosis" class="field" placeholder="如：牙髓炎、肺结节、乳腺癌..." />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>分期/严重程度/关键指标</span>
                  <input v-model="form.stage" class="field" placeholder="如：II期、WHO4、HbA1c 9.0%" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400 md:col-span-2">
                  <span>症状、诊断和核心诉求 *</span>
                  <textarea v-model="form.chiefComplaint" rows="4" class="field resize-none" placeholder="请描述症状开始时间、已做检查、目前最想解决的问题..." />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400 md:col-span-2">
                  <span>病理/检查报告摘要</span>
                  <textarea v-model="form.pathologySummary" rows="3" class="field resize-none" placeholder="可粘贴病理诊断、免疫组化、检查结论等关键文字" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400 md:col-span-2">
                  <span>影像资料摘要</span>
                  <textarea v-model="form.imagingSummary" rows="3" class="field resize-none" placeholder="可填写CT/MRI/超声/CBCT等影像结论" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400 md:col-span-2">
                  <span>基因检测/分子指标摘要</span>
                  <textarea v-model="form.geneticSummary" rows="3" class="field resize-none" placeholder="如 EGFR、ALK、HER2、Ki-67、IDH、MGMT 等" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400 md:col-span-2">
                  <span>既往治疗记录</span>
                  <textarea v-model="form.treatmentHistory" rows="3" class="field resize-none" placeholder="手术、放疗、化疗、用药、牙科处理、介入治疗等" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>当前用药</span>
                  <textarea v-model="form.medicationHistory" rows="3" class="field resize-none" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>基础疾病/过敏史</span>
                  <textarea v-model="form.comorbidities" rows="3" class="field resize-none" placeholder="糖尿病、高血压、心脏病等" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>药物/食物过敏</span>
                  <input v-model="form.allergyHistory" class="field" placeholder="无/不详/具体过敏源" />
                </label>
                <label class="space-y-1.5 text-sm text-slate-400">
                  <span>紧急程度</span>
                  <select v-model="form.urgency" class="field">
                    <option value="routine">常规评估</option>
                    <option value="priority">优先评估</option>
                    <option value="urgent">较紧急，需要先排除风险</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <aside class="space-y-6">
            <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
              <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Upload class="h-5 w-5 text-teal-400" />
                上传资料
              </h2>
              <div
                v-if="sourceSubmissionNo"
                class="mb-4 rounded-xl border border-teal-500/25 bg-teal-500/10 p-3 text-xs leading-5 text-teal-100"
              >
                <div class="mb-1 flex items-center gap-2 font-semibold text-teal-300">
                  <FileSearch class="h-4 w-4" />
                  已沿用简易报告基础信息
                </div>
                <p>{{ sourceFileSummary }}</p>
                <p class="mt-1 text-teal-200/70">请在此上传医疗资料，系统会基于新上传资料进行识别和专业分析。</p>
              </div>
              <div class="mb-4 grid grid-cols-2 gap-3">
                <div v-for="item in fileTypeCards" :key="item.label" class="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-center">
                  <component :is="item.icon" class="mx-auto mb-2 h-5 w-5 text-teal-400" />
                  <div class="text-xs font-medium text-white">{{ item.label }}</div>
                  <div class="mt-1 text-[11px] text-slate-500">{{ item.desc }}</div>
                </div>
              </div>
              <label class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/40 p-6 text-center transition hover:border-teal-500/60">
                <Upload class="mb-3 h-8 w-8 text-slate-500" />
                <span class="text-sm font-medium text-white">点击选择文件</span>
                <span class="mt-1 text-xs text-slate-500">PDF/DOCX/JPG/PNG/DICOM，单文件不超过50MB</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.webp,.dcm,.dicom,.txt"
                  class="hidden"
                  @change="addFiles(($event.target as HTMLInputElement).files); ($event.target as HTMLInputElement).value = ''"
                />
              </label>
              <div v-if="files.length" class="mt-4 space-y-2">
                <div v-for="item in files" :key="item.id" class="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
                  <FileText class="h-4 w-4 shrink-0 text-teal-400" />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm text-slate-200">{{ item.file.name }}</div>
                    <div class="text-xs text-slate-500">{{ formatFileSize(item.file.size) }}</div>
                  </div>
                  <button class="rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-red-300" @click="removeFile(item.id)">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="!fromFreeReport" class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
              <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Globe class="h-5 w-5 text-teal-400" />
                偏好与对比地区
              </h2>
              <div class="mb-4 grid gap-2">
                <button
                  v-for="region in regionOptions"
                  :key="region.value"
                  :class="[
                    'flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition',
                    selectedRegions.includes(region.value) ? 'border-teal-500/40 bg-teal-500/10 text-teal-200' : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700',
                  ]"
                  @click="toggleRegion(region.value)"
                >
                  <span>{{ region.label }}</span>
                  <CheckCircle v-if="selectedRegions.includes(region.value)" class="h-4 w-4 text-teal-400" />
                </button>
              </div>
              <div class="space-y-3">
                <input v-model="form.budgetRange" class="field" placeholder="预算范围，如 $10,000-$30,000" />
                <input v-model="form.insuranceType" class="field" placeholder="保险类型/保险公司" />
                <input v-model="form.desiredCity" class="field" placeholder="期望来华城市，如北京/上海/广州" />
              </div>
            </div>

            <div class="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-100">
              <div class="mb-2 font-semibold text-amber-300">专业版说明</div>
              <p class="leading-6">
                本报告用于跨境就医资料预审和方案准备，不替代医生诊断。若资料不足，报告会明确列出缺失材料和下一步检查。
              </p>
            </div>

            <p
              v-if="errorMessage"
              :class="[
                'rounded-xl border p-3 text-sm',
                errorTone === 'warning'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                  : 'border-red-500/30 bg-red-500/10 text-red-300',
              ]"
            >
              {{ errorMessage }}
            </p>
            <button
              :disabled="generating"
              :class="[
                'flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60',
                canSubmit ? 'bg-teal-600 hover:bg-teal-500' : 'bg-teal-700/70 hover:bg-teal-600',
              ]"
              @click="generateReport"
            >
              <Loader2 v-if="generating" class="h-5 w-5 animate-spin" />
              <FileText v-else class="h-5 w-5" />
              {{ generating ? '生成专业报告中...' : '生成专业报告' }}
            </button>
          </aside>
        </div>
      </template>

      <template v-else>
        <section class="mb-6 rounded-2xl border border-teal-500/20 bg-slate-900/80 p-6">
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
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">患者</div>
              <div class="mt-1 font-semibold text-white">{{ report.patientSnapshot.patient }}</div>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">诊断状态</div>
              <div class="mt-1 font-semibold text-white">{{ report.patientSnapshot.diagnosisStatus }}</div>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">资料完整度</div>
              <div class="mt-1 font-semibold text-teal-300">{{ report.patientSnapshot.dataCompleteness }}/100</div>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">上传文件</div>
              <div class="mt-1 font-semibold text-white">{{ report.patientSnapshot.uploadedFiles.length }} 个</div>
            </div>
          </div>

          <div v-if="report.patientSnapshot.parsedFiles.length" class="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
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

        <section class="mb-6 grid gap-3 md:grid-cols-3">
          <div v-for="item in report.executiveSummary" :key="item" class="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300">
            {{ item }}
          </div>
        </section>

        <template v-if="professionalLayoutTabs.length">
          <div class="space-y-5">
            <div class="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-900/30 p-4">
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
              <div v-if="activeProfessionalLayoutTab.summary" class="rounded-xl border border-teal-500/20 bg-teal-500/10 p-4 text-sm leading-6 text-teal-100">
                {{ activeProfessionalLayoutTab.summary }}
              </div>

              <article
                v-for="block in activeProfessionalLayoutTab.blocks"
                v-show="hasBlockContent(block)"
                :key="`${activeProfessionalLayoutTab.key}-${block.title}`"
                :class="['rounded-xl border p-4', toneClass(block.tone)]"
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

        <template v-else>
        <nav class="mb-6 flex gap-2 overflow-x-auto border-b border-slate-800 pb-3">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="[
              'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
              activeTab === tab.key ? 'bg-teal-500/15 text-teal-300' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300',
            ]"
            @click="scrollToSection(tab.key)"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
          </button>
        </nav>

        <section id="section-diagnosis" class="report-panel report-section">
          <h2 class="section-title"><Microscope class="h-5 w-5 text-teal-400" />一、核心诊断结论与资料解读</h2>
          <div class="space-y-4">
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">诊断/工作方向</div>
              <p class="mt-2 text-sm leading-7 text-slate-200">{{ report.diagnosticConclusion.finalImpression }}</p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">严重程度解读</div>
              <p class="mt-2 text-sm leading-7 text-slate-200">{{ report.diagnosticConclusion.severityInterpretation }}</p>
            </div>
            <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
              <div class="border-b border-slate-800 px-4 py-3 font-semibold text-white">核心指标解释</div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-900 text-slate-500">
                    <tr>
                      <th class="px-4 py-3 text-left font-medium">指标</th>
                      <th class="px-4 py-3 text-left font-medium">当前信息</th>
                      <th class="px-4 py-3 text-left font-medium">专业解读</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800">
                    <tr v-for="item in report.diagnosticConclusion.indicatorInterpretations" :key="item.indicator">
                      <td class="px-4 py-3 font-semibold text-slate-200">{{ item.indicator }}</td>
                      <td class="px-4 py-3 text-teal-300">{{ item.value }}</td>
                      <td class="px-4 py-3 leading-6 text-slate-400">{{ item.interpretation }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <ListBlock title="本报告依据" :items="report.diagnosticConclusion.evidenceBasis" />
          </div>
        </section>

        <section id="section-assessment" class="report-panel report-section">
          <h2 class="section-title"><Target class="h-5 w-5 text-teal-400" />二、患者病情综合全面评估</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">工作诊断</div>
              <div class="mt-1 text-white">{{ report.clinicalAssessment.workingDiagnosis }}</div>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="text-xs text-slate-500">严重程度</div>
              <div class="mt-1 text-white">{{ report.clinicalAssessment.severity }}</div>
            </div>
          </div>
          <div class="mt-5 grid gap-5 md:grid-cols-2">
            <ListBlock title="关键发现" :items="report.clinicalAssessment.keyFindings" />
            <ListBlock title="关键决策问题" :items="report.clinicalAssessment.decisionQuestions" />
            <ListBlock title="需补充材料" :items="report.clinicalAssessment.missingMaterials" />
            <ListBlock title="风险信号" :items="report.clinicalAssessment.redFlags.length ? report.clinicalAssessment.redFlags : ['当前资料未显示明确急症信号，仍需医生结合检查确认。']" />
          </div>
          <div class="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
            <div class="border-b border-slate-800 px-4 py-3 font-semibold text-white">预后/决策参考对比</div>
            <p class="px-4 py-3 text-sm leading-6 text-slate-300">{{ report.prognosisComparison.positioning }}</p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-slate-900 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 text-left font-medium">指标</th>
                    <th class="px-4 py-3 text-left font-medium">当前风险</th>
                    <th class="px-4 py-3 text-left font-medium">中国方案参考</th>
                    <th class="px-4 py-3 text-left font-medium">说明</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  <tr v-for="item in report.prognosisComparison.metrics" :key="item.metric">
                    <td class="px-4 py-3 font-semibold text-slate-200">{{ item.metric }}</td>
                    <td class="px-4 py-3 leading-6 text-slate-400">{{ item.currentRisk }}</td>
                    <td class="px-4 py-3 leading-6 text-teal-200">{{ item.chinaReference }}</td>
                    <td class="px-4 py-3 leading-6 text-slate-400">{{ item.note }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="border-t border-slate-800 px-4 py-3 text-sm leading-6 text-slate-300">{{ report.prognosisComparison.conclusion }}</p>
          </div>
        </section>

        <section id="section-pathway" class="report-panel report-section">
          <h2 class="section-title"><Stethoscope class="h-5 w-5 text-teal-400" />三、中国专属标准化治疗路径</h2>
          <p class="mb-5 rounded-xl border border-teal-500/20 bg-teal-500/10 p-4 text-sm leading-6 text-teal-100">{{ report.treatmentPathway.goal }}</p>
          <div class="space-y-4">
            <div v-for="phase in report.treatmentPathway.phases" :key="phase.phase" class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 class="font-semibold text-white">{{ phase.phase }}</h3>
                <span class="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">{{ phase.timeline }}</span>
              </div>
              <ul class="space-y-1.5 text-sm text-slate-300">
                <li v-for="action in phase.actions" :key="action" class="flex gap-2">
                  <CheckCircle class="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                  <span>{{ action }}</span>
                </li>
              </ul>
              <div class="mt-3 text-xs text-slate-500">阶段输出：{{ phase.output }}</div>
            </div>
          </div>
        </section>

        <section id="section-cost" class="report-panel report-section">
          <h2 class="section-title"><DollarSign class="h-5 w-5 text-teal-400" />四、来华就医全套费用明细</h2>
          <p class="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">{{ report.costBreakdown.currencyNote }}</p>
          <div class="space-y-5">
            <CostTable :category="report.costBreakdown.medical" />
            <CostTable :category="report.costBreakdown.services" />
            <CostTable :category="report.costBreakdown.living" />
          </div>
          <div class="mt-5 rounded-xl border border-teal-500/20 bg-teal-500/10 p-5">
            <div class="text-sm text-teal-200">综合预估总费用</div>
            <div class="mt-1 text-2xl font-bold text-white">{{ report.costBreakdown.grandTotal }}</div>
            <p class="mt-2 text-sm leading-6 text-teal-100">{{ report.costBreakdown.volatilityNote }}</p>
          </div>
        </section>

        <section id="section-technology" class="report-panel report-section">
          <h2 class="section-title"><Sparkles class="h-5 w-5 text-teal-400" />五、中国前沿技术与服务优势</h2>
          <div class="grid gap-4 md:grid-cols-3">
            <div v-for="item in report.technologyAdvantages" :key="item.technology" class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="mb-2 flex items-center gap-2 font-semibold text-white">
                <Landmark class="h-4 w-4 text-teal-400" />
                {{ item.technology }}
              </div>
              <p class="text-sm leading-6 text-slate-300">{{ item.value }}</p>
              <p class="mt-3 rounded-lg bg-slate-900 p-3 text-xs leading-5 text-slate-400">{{ item.applicability }}</p>
            </div>
          </div>
        </section>

        <section id="section-countries" class="report-panel report-section">
          <h2 class="section-title"><Globe class="h-5 w-5 text-teal-400" />六、全球国家诊疗方案对比</h2>
          <div class="space-y-3">
            <div
              v-for="country in report.countryComparison"
              :key="country.country"
              :class="['rounded-xl border p-4', country.recommended ? 'border-teal-500/30 bg-teal-500/10' : 'border-slate-800 bg-slate-950/40']"
            >
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2 font-semibold text-white"><span>{{ country.flag }}</span>{{ country.country }}</div>
                <div class="text-sm text-teal-300">匹配度 {{ country.fitScore }}/100</div>
              </div>
              <div class="grid gap-3 text-sm md:grid-cols-2">
                <div><span class="text-slate-500">费用：</span>{{ country.cost }}</div>
                <div><span class="text-slate-500">等待：</span>{{ country.waitTime }}</div>
                <div><span class="text-slate-500">优势：</span>{{ country.strengths }}</div>
                <div><span class="text-slate-500">限制：</span>{{ country.limitations }}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="section-hospitals" class="report-panel report-section">
          <h2 class="section-title"><Hospital class="h-5 w-5 text-teal-400" />{{ hospitalSectionTitle }}</h2>
          <div :class="hospitalGridClass">
            <div v-for="hospital in report.hospitalRecommendations" :key="hospital.hospital" class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div class="mb-2 text-xs text-teal-300">{{ hospital.city }} · {{ hospital.department }}</div>
              <h3 class="font-semibold text-white">{{ hospital.hospital }}</h3>
              <div class="mt-2 text-sm text-slate-300">{{ hospital.whyFit }}</div>
              <div class="mt-3 rounded-lg bg-slate-900 p-3 text-xs leading-5 text-slate-400">{{ hospital.preparation }}</div>
              <div class="mt-3 text-sm text-teal-300">匹配度 {{ hospital.matchScore }}/100</div>
            </div>
          </div>
        </section>

        <section id="section-itinerary" class="report-panel report-section">
          <h2 class="section-title"><Calendar class="h-5 w-5 text-teal-400" />八、外籍患者来华全程行程与服务</h2>
          <div class="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div class="space-y-3">
              <div v-for="item in report.itinerary" :key="item.dayRange" class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div class="mb-2 flex items-center justify-between gap-3">
                  <h3 class="font-semibold text-white">{{ item.stage }}</h3>
                  <span class="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">{{ item.dayRange }}</span>
                </div>
                <ul class="space-y-1.5 text-sm text-slate-300">
                  <li v-for="task in item.tasks" :key="task">· {{ task }}</li>
                </ul>
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="service in report.servicePlan" :key="service.service" class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div class="mb-1 flex items-center gap-2 font-semibold text-white">
                  <Users class="h-4 w-4 text-teal-400" />
                  {{ service.service }}
                </div>
                <p class="text-sm leading-6 text-slate-300">{{ service.value }}</p>
              </div>
            </div>
          </div>
          <div class="mt-5 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h3 class="mb-3 font-semibold text-white">支付与保险保障</h3>
            <ul class="space-y-2 text-sm leading-6 text-slate-300">
              <li v-for="item in report.paymentAndInsurance" :key="item" class="flex gap-2">
                <CheckCircle class="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="section-next" class="report-panel report-section">
          <h2 class="section-title"><ShieldAlert class="h-5 w-5 text-teal-400" />九、病情风险提示与下一步就诊流程</h2>
          <div class="grid gap-5 md:grid-cols-2">
            <ListBlock title="风险与免责声明" :items="report.risksAndDisclaimers" />
            <ListBlock title="下一步行动" :items="report.nextSteps" />
            <ListBlock v-if="report.qualityFlags.length" class="md:col-span-2" title="质量提示" :items="report.qualityFlags" />
          </div>
        </section>
        </template>

        <section class="mx-auto mt-10 max-w-4xl">
          <div class="mb-6 text-center">
            <h2 class="text-2xl font-bold text-white">选择您的评估报告套餐 / Choose Your Assessment Package</h2>
            <p class="mt-2 text-sm text-slate-500">所有费用均以美元标价，实际价格因专家级别和病情复杂度而异。</p>
          </div>
          <div class="grid gap-6 md:grid-cols-2">
            <article
              v-for="pkg in professionalPackages"
              :key="pkg.name"
              :class="[
                'relative rounded-2xl border bg-slate-950/30 p-6',
                pkg.featured ? 'border-teal-500/70 shadow-[0_0_40px_rgba(20,184,166,0.12)]' : 'border-amber-500/50',
              ]"
            >
              <div
                v-if="pkg.tag"
                class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-4 py-1 text-xs font-bold text-slate-950"
              >
                {{ pkg.tag }}
              </div>
              <div class="text-sm font-semibold" :class="pkg.featured ? 'text-teal-300' : 'text-amber-300'">
                {{ pkg.name }} / {{ pkg.nameEn }}
              </div>
              <div class="mt-4 text-4xl font-black text-white">{{ pkg.price }}</div>
              <div class="mt-1 text-sm text-slate-500">{{ pkg.cny }}</div>
              <ul class="mt-6 space-y-3">
                <li v-for="feature in pkg.features" :key="feature" class="flex gap-2 text-sm leading-5 text-slate-300">
                  <CheckCircle class="mt-0.5 h-4 w-4 shrink-0" :class="pkg.featured ? 'text-teal-400' : 'text-amber-400'" />
                  <span>{{ feature }}</span>
                </li>
              </ul>
              <button
                type="button"
                :class="[
                  'mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition',
                  pkg.featured ? 'bg-teal-500 text-slate-950 hover:bg-teal-400' : 'border border-amber-500/60 text-amber-300 hover:bg-amber-500/10',
                ]"
              >
                {{ pkg.featured ? '预约面诊' : '预约深度面诊' }}
              </button>
              <p class="mt-3 text-center text-xs text-slate-600">价格因病情复杂度和专家级别而异</p>
            </article>
          </div>
        </section>

        <section class="mt-8 rounded-2xl border border-teal-500/20 bg-teal-500/10 p-6 md:p-8">
          <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="flex items-center gap-2 text-xl font-bold text-white">
                <Sparkles class="h-5 w-5 text-teal-300" />
                想要获得属于您的专业版精准评估报告？
              </h2>
              <p class="mt-3 text-sm leading-6 text-slate-400">
                联系客服升级，享受副主任医师级别资料复核、专家面诊、精准费用预估与个性化治疗路径规划。
              </p>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row">
              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400">
                <Phone class="h-4 w-4" />
                联系客服
              </button>
              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                <Mail class="h-4 w-4" />
                邮件咨询
              </button>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { ProfessionalCostCategory } from '@/services/reportSubmissions'

export default {
  components: {
    ListBlock: {
      props: {
        title: { type: String, required: true },
        items: { type: Array as PropType<string[]>, required: true },
      },
      template: `
        <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <h3 class="mb-3 font-semibold text-white">{{ title }}</h3>
          <ul class="space-y-2 text-sm leading-6 text-slate-300">
            <li v-for="item in items" :key="item" class="flex gap-2">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      `,
    },
    CostTable: {
      props: {
        category: { type: Object as PropType<ProfessionalCostCategory>, required: true },
      },
      template: `
        <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
            <h3 class="font-semibold text-white">{{ category.title }}</h3>
            <span class="text-sm font-semibold text-teal-300">{{ category.total }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-900 text-slate-500">
                <tr>
                  <th class="px-4 py-3 text-left font-medium">项目</th>
                  <th class="px-4 py-3 text-left font-medium">费用</th>
                  <th class="px-4 py-3 text-left font-medium">说明</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr v-for="item in category.items" :key="item.item">
                  <td class="px-4 py-3 text-slate-200">{{ item.item }}</td>
                  <td class="whitespace-nowrap px-4 py-3 font-semibold text-teal-300">{{ item.cost }}</td>
                  <td class="px-4 py-3 text-slate-400">{{ item.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `,
    },
  },
}
</script>

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
</style>
