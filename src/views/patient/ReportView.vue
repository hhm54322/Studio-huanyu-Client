<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import axios from 'axios'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle,
  Star,
  Shield,
  Clock,
  DollarSign,
  FileSearch,
  Plane,
  Users,
  FileText,
  Video,
  MessageSquare,
  Stethoscope,
  User,
  Mail,
  Phone,
  Globe,
  HeartPulse,
  Building2,
  BookOpen,
  BarChart3,
  Lock,
  Sparkles,
  Microscope,
  Pill,
} from 'lucide-vue-next'
import { reportData } from '@/data/report'
import { useAppVersion } from '@/composables/useAppVersion'
import { createReportSubmission, getReportSubmission, type GeneratedReport, type ReportLayoutBlock } from '@/services/reportSubmissions'

const { t, locale } = useI18n()
const route = useRoute()
const { checkForUpdate } = useAppVersion()

const defaultSelectedRegions = ['north_america', 'europe', 'southeast_asia', 'japan_korea']
const selectedRegions = ref<string[]>([...defaultSelectedRegions])
const selectedInsurance = ref<number | null>(null)
const generating = ref(false)
const showReport = ref(false)
const expandedCountry = ref<string | null>(null)
const expandedHospital = ref<string | null>(null)
const submissionError = ref('')
const submissionErrorTone = ref<'error' | 'warning'>('error')
const submissionNo = ref('')
const generatedReport = ref<GeneratedReport | null>(null)
const activeFreeLayoutKey = ref('cost')
const showProSampleReport = ref(false)
const activeProSampleTab = ref('analysis')

const generatingLeaveMessage = '报告正在生成中，离开页面可能导致本次生成中断，确定要离开吗？'

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!generating.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(() => {
  if (!generating.value) return true
  return window.confirm(generatingLeaveMessage)
})

// 基础信息表单
const form = reactive({
  fullName: '',
  gender: '',
  dateOfBirth: '',
  nationality: '',
  idType: '',
  idNumber: '',
  phone: '',
  email: '',
  city: '',
  preferredLanguage: '',
  visitPurpose: '',
  careNeed: '',
  careNeedOther: '',
  expectedTreatmentTime: '',
  chiefComplaint: '',
})

type FormField = keyof typeof form
type SupportedLocale = 'zh' | 'en' | 'id' | 'ru' | 'mn'
type LocalizedText = Record<SupportedLocale, string>
type SimpleCostBreakdownData = NonNullable<GeneratedReport['plan']['costBreakdown']>
type SimpleCostBreakdownCategoryData = SimpleCostBreakdownData['coreMedical']
type AdvancedCareData = NonNullable<GeneratedReport['advancedCare']>
type RenderedReport = Omit<GeneratedReport, 'plan'> & {
  direction: string
  duration: string
  totalCost: string
  breakdown: GeneratedReport['plan']['breakdown']
  costBreakdown?: SimpleCostBreakdownData
}

const supportedLocales: SupportedLocale[] = ['zh', 'en', 'id', 'ru', 'mn']
const activeLocale = computed<SupportedLocale>(() => {
  return supportedLocales.includes(locale.value as SupportedLocale) ? locale.value as SupportedLocale : 'zh'
})
const intlLocale = computed(() => {
  const map: Record<SupportedLocale, string> = {
    zh: 'zh-CN',
    en: 'en-US',
    id: 'id-ID',
    ru: 'ru-RU',
    mn: 'mn-MN',
  }
  return map[activeLocale.value]
})

const localText = {
  other: { zh: '其他', en: 'Other', id: 'Lainnya', ru: 'Другое', mn: 'Бусад' },
  selectLanguage: { zh: '请选择首选语言', en: 'Select preferred language', id: 'Pilih bahasa utama', ru: 'Выберите предпочтительный язык', mn: 'Үндсэн хэлээ сонгоно уу' },
  selectPurpose: { zh: '请选择就医目的', en: 'Select medical purpose', id: 'Pilih tujuan medis', ru: 'Выберите цель лечения', mn: 'Эмчилгээний зорилгоо сонгоно уу' },
  year: { zh: '年', en: 'Year', id: 'Tahun', ru: 'Год', mn: 'Жил' },
  month: { zh: '月', en: 'Month', id: 'Bulan', ru: 'Месяц', mn: 'Сар' },
  day: { zh: '日', en: 'Day', id: 'Hari', ru: 'День', mn: 'Өдөр' },
  regionHint: {
    zh: '至少选择一个希望对比的地区，系统会默认加入中国方案作为基准。',
    en: 'Select at least one region for comparison. China will be included as the default baseline.',
    id: 'Pilih minimal satu wilayah untuk dibandingkan. China akan disertakan sebagai acuan utama.',
    ru: 'Выберите хотя бы один регион для сравнения. Китай будет добавлен как базовый вариант.',
    mn: 'Харьцуулах дор хаяж нэг бүсийг сонгоно уу. Хятад улс үндсэн жишиг болгон орно.',
  },
  regionError: { zh: '请至少选择一个国家/地区', en: 'Select at least one country/region', id: 'Pilih minimal satu negara/wilayah', ru: 'Выберите хотя бы одну страну/регион', mn: 'Дор хаяж нэг улс/бүс сонгоно уу' },
  confirmTitle: { zh: '准备生成您的预审报告', en: 'Ready to Generate Your Pre-assessment Report', id: 'Siap Membuat Laporan Pra-asesmen Anda', ru: 'Готово к созданию предварительного отчета', mn: 'Урьдчилсан үнэлгээний тайлан үүсгэхэд бэлэн' },
  confirmPrefix: { zh: '基于您提供的', en: 'Based on your', id: 'Berdasarkan informasi', ru: 'На основе указанной цели', mn: 'Таны оруулсан' },
  confirmMiddle: { zh: '就医信息，我们将对比', en: 'information, we will compare', id: 'Anda, kami akan membandingkan', ru: 'мы сравним', mn: 'мэдээлэлд үндэслэн бид' },
  confirmSuffix: { zh: '与中国就医方案', en: 'with medical options in China', id: 'dengan opsi perawatan di China', ru: 'с вариантами лечения в Китае', mn: 'болон Хятадын эмчилгээний хувилбарыг харьцуулна' },
  selectedRegionsFallback: { zh: '所选地区', en: 'selected regions', id: 'wilayah yang dipilih', ru: 'выбранные регионы', mn: 'сонгосон бүсүүд' },
  globalDestinations: { zh: '全球主要医疗目的地', en: 'Major global medical destinations', id: 'Destinasi medis global utama', ru: 'Ключевые мировые медицинские направления', mn: 'Дэлхийн гол эмчилгээний чиглэлүүд' },
  coreNeed: { zh: '核心诉求', en: 'Primary Need', id: 'Kebutuhan Utama', ru: 'Основной запрос', mn: 'Гол хэрэгцээ' },
  compareRegions: { zh: '对比地区', en: 'Comparison Regions', id: 'Wilayah Perbandingan', ru: 'Регионы сравнения', mn: 'Харьцуулах бүсүүд' },
  costItem: { zh: '费用项目', en: 'Cost Item', id: 'Komponen Biaya', ru: 'Статья расходов', mn: 'Зардлын зүйл' },
  estimatedCost: { zh: '预估费用', en: 'Estimated Cost', id: 'Estimasi Biaya', ru: 'Ориентировочная стоимость', mn: 'Тооцоолсон зардал' },
  popular: { zh: '最受欢迎', en: 'Most Popular', id: 'Paling Populer', ru: 'Самый популярный', mn: 'Хамгийн түгээмэл' },
  choosePackage: { zh: '选择此套餐', en: 'Choose Package', id: 'Pilih Paket Ini', ru: 'Выбрать пакет', mn: 'Энэ багцыг сонгох' },
  highlights: { zh: '专业版核心亮点', en: 'Pro Edition Highlights', id: 'Keunggulan Edisi Pro', ru: 'Ключевые преимущества Pro', mn: 'Pro хувилбарын онцлох зүйлс' },
  contactHint: { zh: '对报告有疑问？我们的医学顾问随时为您解答', en: 'Questions about the report? Our medical advisors are ready to help.', id: 'Ada pertanyaan tentang laporan? Konsultan medis kami siap membantu.', ru: 'Есть вопросы по отчету? Наши медицинские консультанты готовы помочь.', mn: 'Тайлангийн талаар асуулт байна уу? Манай эмнэлгийн зөвлөхүүд туслахад бэлэн.' },
  submitFailed: {
    zh: '信息提交失败，请稍后重试。',
    en: 'Failed to submit your information. Please try again later.',
    id: 'Gagal mengirim informasi. Silakan coba lagi nanti.',
    ru: 'Не удалось отправить информацию. Попробуйте позже.',
    mn: 'Мэдээлэл илгээхэд алдаа гарлаа. Дараа дахин оролдоно уу.',
  },
  validation: {
    passport: { zh: '护照号码通常为6-18位字母或数字', en: 'Passport number is usually 6-18 letters or digits', id: 'Nomor paspor biasanya 6-18 huruf atau angka', ru: 'Номер паспорта обычно содержит 6-18 букв или цифр', mn: 'Паспортын дугаар ихэвчлэн 6-18 үсэг эсвэл тооноос бүрдэнэ' },
    idCard: { zh: '请输入18位有效身份证号码', en: 'Enter a valid 18-digit national ID number', id: 'Masukkan nomor identitas nasional 18 digit yang valid', ru: 'Введите действительный 18-значный номер удостоверения личности', mn: '18 оронтой хүчинтэй иргэний үнэмлэхийн дугаар оруулна уу' },
    otherId: { zh: '请输入4-40位有效证件号码，可含字母、数字、空格、-、/、.', en: 'Enter a valid 4-40 character ID number. Letters, digits, spaces, -, /, . are allowed.', id: 'Masukkan nomor dokumen 4-40 karakter. Huruf, angka, spasi, -, /, . diperbolehkan.', ru: 'Введите номер документа длиной 4-40 символов. Допустимы буквы, цифры, пробелы, -, /, .', mn: '4-40 тэмдэгтийн хүчинтэй баримтын дугаар оруулна уу. Үсэг, тоо, зай, -, /, . ашиглаж болно.' },
    fullName: { zh: '请输入至少2个字符的姓名', en: 'Enter a name with at least 2 characters', id: 'Masukkan nama minimal 2 karakter', ru: 'Введите имя минимум из 2 символов', mn: 'Дор хаяж 2 тэмдэгттэй нэр оруулна уу' },
    gender: { zh: '请选择性别', en: 'Select gender', id: 'Pilih jenis kelamin', ru: 'Выберите пол', mn: 'Хүйсээ сонгоно уу' },
    dateOfBirth: { zh: '请选择有效出生日期', en: 'Select a valid date of birth', id: 'Pilih tanggal lahir yang valid', ru: 'Выберите действительную дату рождения', mn: 'Хүчинтэй төрсөн огноо сонгоно уу' },
    nationality: { zh: '请选择国籍', en: 'Select nationality', id: 'Pilih kewarganegaraan', ru: 'Выберите гражданство', mn: 'Иргэншлээ сонгоно уу' },
    phone: { zh: '请输入有效手机号，建议包含国家/地区区号', en: 'Enter a valid phone number, preferably with country/region code', id: 'Masukkan nomor telepon yang valid, sebaiknya dengan kode negara/wilayah', ru: 'Введите действительный номер телефона, желательно с кодом страны/региона', mn: 'Улс/бүсийн кодтой хүчинтэй утасны дугаар оруулна уу' },
    email: { zh: '请输入有效邮箱地址', en: 'Enter a valid email address', id: 'Masukkan alamat email yang valid', ru: 'Введите действительный адрес электронной почты', mn: 'Хүчинтэй имэйл хаяг оруулна уу' },
    city: { zh: '请输入常住城市', en: 'Enter your city of residence', id: 'Masukkan kota tempat tinggal', ru: 'Введите город проживания', mn: 'Оршин суугаа хотоо оруулна уу' },
    preferredLanguage: { zh: '请选择首选语言', en: 'Select preferred language', id: 'Pilih bahasa utama', ru: 'Выберите предпочтительный язык', mn: 'Үндсэн хэлээ сонгоно уу' },
    visitPurpose: { zh: '请选择就医目的', en: 'Select medical purpose', id: 'Pilih tujuan medis', ru: 'Выберите цель лечения', mn: 'Эмчилгээний зорилгоо сонгоно уу' },
    careNeed: { zh: '请选择就医诉求', en: 'Select care need', id: 'Pilih kebutuhan perawatan', ru: 'Выберите запрос на лечение', mn: 'Эмчилгээний хэрэгцээгээ сонгоно уу' },
    careNeedOther: { zh: '请补充说明其他就医诉求', en: 'Describe your other care need', id: 'Jelaskan kebutuhan lain', ru: 'Опишите другой запрос', mn: 'Бусад хэрэгцээгээ тайлбарлана уу' },
    expectedTreatmentTime: { zh: '请选择期望治疗时间', en: 'Select expected treatment timing', id: 'Pilih waktu perawatan yang diharapkan', ru: 'Выберите желаемые сроки лечения', mn: 'Хүсэж буй эмчилгээний хугацаагаа сонгоно уу' },
    chiefComplaint: { zh: '请至少填写6个字，便于生成更准确的预审报告', en: 'Enter at least 6 characters so we can generate a more accurate pre-assessment report', id: 'Masukkan minimal 6 karakter agar laporan pra-asesmen lebih akurat', ru: 'Введите не менее 6 символов для более точного предварительного отчета', mn: 'Илүү нарийвчилсан урьдчилсан тайлан гаргахын тулд дор хаяж 6 тэмдэгт оруулна уу' },
  },
} satisfies Record<string, LocalizedText | Record<string, LocalizedText>>

const lt = (entry: LocalizedText) => entry[activeLocale.value] || entry.zh

const touched = reactive<Record<FormField, boolean>>({
  fullName: false,
  gender: false,
  dateOfBirth: false,
  nationality: false,
  idType: false,
  idNumber: false,
  phone: false,
  email: false,
  city: false,
  preferredLanguage: false,
  visitPurpose: false,
  careNeed: false,
  careNeedOther: false,
  expectedTreatmentTime: false,
  chiefComplaint: false,
})
const submitAttempted = ref(false)

const languageCodes = ['english', 'chinese', 'japanese', 'korean', 'russian']
const purposeOptions = [
  { value: 'breast_cancer', display: 'Breast Cancer / 乳腺癌', label: { zh: '乳腺癌', en: 'Breast Cancer', id: 'Breast Cancer', ru: 'Breast Cancer', mn: 'Breast Cancer' } },
  { value: 'lung_cancer', display: 'Lung Cancer / 肺癌', label: { zh: '肺癌', en: 'Lung Cancer', id: 'Lung Cancer', ru: 'Lung Cancer', mn: 'Lung Cancer' } },
  { value: 'nasopharyngeal_cancer', display: 'Nasopharyngeal Cancer / 鼻咽癌', label: { zh: '鼻咽癌', en: 'Nasopharyngeal Cancer', id: 'Nasopharyngeal Cancer', ru: 'Nasopharyngeal Cancer', mn: 'Nasopharyngeal Cancer' } },
  { value: 'liver_cancer', display: 'Liver Cancer / 肝癌', label: { zh: '肝癌', en: 'Liver Cancer', id: 'Liver Cancer', ru: 'Liver Cancer', mn: 'Liver Cancer' } },
  { value: 'cardiovascular_tumor', display: 'Cardiovascular Tumor / 心血管肿瘤', label: { zh: '心血管肿瘤', en: 'Cardiovascular Tumor', id: 'Cardiovascular Tumor', ru: 'Cardiovascular Tumor', mn: 'Cardiovascular Tumor' } },
  { value: 'neurosurgery', display: 'Neurosurgery / 神经外科', label: { zh: '神经外科', en: 'Neurosurgery', id: 'Neurosurgery', ru: 'Neurosurgery', mn: 'Neurosurgery' } },
  { value: 'spine_surgery', display: 'Spine Surgery / 脊柱外科', label: { zh: '脊柱外科', en: 'Spine Surgery', id: 'Spine Surgery', ru: 'Spine Surgery', mn: 'Spine Surgery' } },
  { value: 'cardiology_cardiothoracic', display: 'Cardiology & Cardiothoracic / 心内科与心胸外科', label: { zh: '心内科与心胸外科', en: 'Cardiology & Cardiothoracic', id: 'Cardiology & Cardiothoracic', ru: 'Cardiology & Cardiothoracic', mn: 'Cardiology & Cardiothoracic' } },
  { value: 'endocrinology_metabolism', display: 'Endocrinology & Metabolism / 内分泌与代谢科', label: { zh: '内分泌与代谢科', en: 'Endocrinology & Metabolism', id: 'Endocrinology & Metabolism', ru: 'Endocrinology & Metabolism', mn: 'Endocrinology & Metabolism' } },
  { value: 'dental', display: 'Dental / 口腔牙科', label: { zh: '口腔牙科', en: 'Dental', id: 'Dental', ru: 'Dental', mn: 'Dental' } },
  { value: 'checkup', display: 'Health Checkup / 健康体检', label: { zh: '健康体检', en: 'Health Checkup', id: 'Health Checkup', ru: 'Health Checkup', mn: 'Health Checkup' } },
  { value: 'other', display: 'Other / Diagnosis Unclear / 其他/诊断未明', label: { zh: '其他/诊断未明', en: 'Other / Diagnosis Unclear', id: 'Other / Diagnosis Unclear', ru: 'Other / Diagnosis Unclear', mn: 'Other / Diagnosis Unclear' } },
]

const careNeedOptions = [
  { value: 'advanced_surgery', label: '寻求前沿手术方案' },
  { value: 'targeted_immunotherapy', label: '寻求靶向/免疫新药治疗' },
  { value: 'second_opinion', label: '寻求第二诊疗意见' },
  { value: 'postoperative_rehab_recurrence_prevention', label: '术后康复与防复发方案' },
  { value: 'other', label: '其他（请补充说明）' },
]

const expectedTreatmentTimeOptions = [
  { value: 'within_1_month', label: '1个月内' },
  { value: '1_to_3_months', label: '1-3个月' },
  { value: '3_to_6_months', label: '3-6个月' },
  { value: 'consult_only', label: '仅咨询方案，暂无赴华计划' },
]

const visitPurposeAliases: Record<string, string> = {
  heart_surgery: 'cardiology_cardiothoracic',
  orthopedic: 'spine_surgery',
  checkup: 'premium_checkup',
}

const regionOptions = [
  { value: 'north_america', label: { zh: '北美（美国/加拿大）', en: 'North America (US/Canada)', id: 'Amerika Utara (AS/Kanada)', ru: 'Северная Америка (США/Канада)', mn: 'Хойд Америк (АНУ/Канад)' } },
  { value: 'europe', label: { zh: '欧洲（英国/德国/法国）', en: 'Europe (UK/Germany/France)', id: 'Eropa (Inggris/Jerman/Prancis)', ru: 'Европа (Великобритания/Германия/Франция)', mn: 'Европ (Их Британи/Герман/Франц)' } },
  { value: 'southeast_asia', label: { zh: '东南亚（新加坡/泰国/马来西亚）', en: 'Southeast Asia (Singapore/Thailand/Malaysia)', id: 'Asia Tenggara (Singapura/Thailand/Malaysia)', ru: 'Юго-Восточная Азия (Сингапур/Таиланд/Малайзия)', mn: 'Зүүн Өмнөд Ази (Сингапур/Тайланд/Малайз)' } },
  { value: 'middle_east', label: { zh: '中东（阿联酋/沙特）', en: 'Middle East (UAE/Saudi Arabia)', id: 'Timur Tengah (UEA/Arab Saudi)', ru: 'Ближний Восток (ОАЭ/Саудовская Аравия)', mn: 'Ойрх Дорнод (АНЭУ/Саудын Араб)' } },
  { value: 'japan_korea', label: { zh: '日韩', en: 'Japan & Korea', id: 'Jepang & Korea', ru: 'Япония и Корея', mn: 'Япон ба Солонгос' } },
  { value: 'australia_new_zealand', label: { zh: '澳新', en: 'Australia & New Zealand', id: 'Australia & Selandia Baru', ru: 'Австралия и Новая Зеландия', mn: 'Австрали ба Шинэ Зеланд' } },
  { value: 'other', label: localText.other },
]

const localizedReport = computed(() => {
  const texts = {
    subtitle: {
      zh: '来华就医可行性预审报告',
      en: 'Feasibility Pre-Assessment Report for Medical Treatment in China',
      id: 'Laporan Pra-asesmen Kelayakan Berobat ke China',
      ru: 'Предварительный отчет о целесообразности лечения в Китае',
      mn: 'Хятадад эмчлүүлэх боломжийн урьдчилсан үнэлгээний тайлан',
    },
    treatment: {
      zh: '保乳手术 + 术后辅助化疗',
      en: 'Breast-conserving surgery + postoperative adjuvant chemotherapy',
      id: 'Operasi konservasi payudara + kemoterapi adjuvan pascaoperasi',
      ru: 'Органосохраняющая операция + послеоперационная адъювантная химиотерапия',
      mn: 'Хөх хадгалах мэс засал + мэс заслын дараах туслах хими эмчилгээ',
    },
    need: {
      zh: '希望尽快手术，控制总费用在合理范围',
      en: 'Seeking surgery as soon as possible while keeping total cost reasonable',
      id: 'Ingin operasi secepat mungkin dengan total biaya tetap wajar',
      ru: 'Желательно провести операцию как можно скорее при разумном бюджете',
      mn: 'Нийт зардлыг боломжийн түвшинд барьж, мэс заслыг аль болох хурдан хийх хүсэлтэй',
    },
    direction: {
      zh: '乳腺外科保乳手术 -> 病理分期 -> 辅助化疗（如需） -> 内分泌治疗',
      en: 'Breast-conserving surgery -> pathology staging -> adjuvant chemotherapy if needed -> endocrine therapy',
      id: 'Operasi konservasi payudara -> penentuan stadium patologi -> kemoterapi adjuvan bila perlu -> terapi endokrin',
      ru: 'Органосохраняющая операция -> патоморфологическое стадирование -> химиотерапия при необходимости -> эндокринная терапия',
      mn: 'Хөх хадгалах мэс засал -> эмгэг судлалын үе шат тогтоох -> шаардлагатай бол туслах хими эмчилгээ -> дааврын эмчилгээ',
    },
    duration: {
      zh: '预计在华停留14-21天',
      en: 'Estimated stay in China: 14-21 days',
      id: 'Estimasi tinggal di China: 14-21 hari',
      ru: 'Ориентировочное пребывание в Китае: 14-21 день',
      mn: 'Хятадад байх тооцоолсон хугацаа: 14-21 хоног',
    },
    countries: [
      {
        flag: '🇨🇳',
        name: { zh: '中国（推荐）', en: 'China (Recommended)', id: 'China (Direkomendasikan)', ru: 'Китай (рекомендуется)', mn: 'Хятад (санал болгож байна)' },
        fee: '$15,000 - $25,000',
        wait: { zh: '7-14天', en: '7-14 days', id: '7-14 hari', ru: '7-14 дней', mn: '7-14 хоног' },
        tech: { zh: '保乳及综合治疗路径成熟，预后需结合分期、病理和治疗反应评估', en: 'Mature breast-conserving and integrated treatment pathways; prognosis depends on stage, pathology, and treatment response', id: 'Jalur konservasi payudara dan terapi terpadu matang; prognosis bergantung pada stadium, patologi, dan respons terapi', ru: 'Отработанные органосохраняющие и комплексные маршруты; прогноз зависит от стадии, патологии и ответа на лечение', mn: 'Хөх хадгалах болон хавсарсан эмчилгээний замнал тогтсон; тавилан нь үе шат, эмгэг судлал, эмчилгээний хариугаас хамаарна' },
        service: { zh: '国际医疗部全流程英文服务', en: 'Full-process English support through international medical departments', id: 'Layanan bahasa Inggris penuh melalui departemen internasional', ru: 'Полное сопровождение на английском через международные отделения', mn: 'Олон улсын эмнэлгийн тасгаар англи хэлний бүрэн үйлчилгээ' },
        visa: { zh: '医疗签证快速通道，48小时邀请函', en: 'Fast-track medical visa support, invitation letter within 48 hours', id: 'Dukungan visa medis cepat, surat undangan dalam 48 jam', ru: 'Ускоренная поддержка медицинской визы, приглашение за 48 часов', mn: 'Эмнэлгийн визийн шуурхай дэмжлэг, 48 цагийн дотор урилга' },
        follow: { zh: '术后1/3/6/12月随访，远程云病房', en: 'Follow-ups at 1/3/6/12 months plus remote cloud ward', id: 'Kontrol 1/3/6/12 bulan dan bangsal cloud jarak jauh', ru: 'Контроль через 1/3/6/12 месяцев и дистанционная палата', mn: '1/3/6/12 сарын хяналт ба зайнаас үүлэн тасаг' },
        recommended: true,
      },
      {
        flag: '🇺🇸',
        name: { zh: '美国', en: 'United States', id: 'Amerika Serikat', ru: 'США', mn: 'АНУ' },
        fee: '$80,000 - $150,000',
        wait: { zh: '2-6周', en: '2-6 weeks', id: '2-6 minggu', ru: '2-6 недель', mn: '2-6 долоо хоног' },
        tech: { zh: '顶尖技术，新药可及性最高', en: 'Top-tier technology and highest access to new drugs', id: 'Teknologi kelas atas dan akses obat baru tertinggi', ru: 'Передовые технологии и максимальная доступность новых препаратов', mn: 'Тэргүүлэх технологи, шинэ эмийн хүртээмж хамгийн өндөр' },
        service: { zh: '部分医院提供国际患者协调', en: 'Some hospitals offer international patient coordination', id: 'Sebagian rumah sakit menyediakan koordinasi pasien internasional', ru: 'Некоторые больницы координируют иностранных пациентов', mn: 'Зарим эмнэлэг олон улсын өвчтөн зохицуулалттай' },
        visa: { zh: 'B1/B2签证，需面签预约', en: 'B1/B2 visa with interview appointment', id: 'Visa B1/B2 dengan janji wawancara', ru: 'Виза B1/B2 с записью на собеседование', mn: 'Ярилцлагын цагтай B1/B2 виз' },
        follow: { zh: '回国后随访不便', en: 'Follow-up after returning home can be inconvenient', id: 'Kontrol setelah pulang dapat kurang praktis', ru: 'Дальнейшее наблюдение после возвращения затруднено', mn: 'Буцсаны дараах хяналт хүндрэлтэй байж болно' },
      },
      {
        flag: '🇬🇧',
        name: { zh: '英国', en: 'United Kingdom', id: 'Inggris', ru: 'Великобритания', mn: 'Их Британи' },
        fee: '$50,000 - $80,000',
        wait: { zh: 'NHS等待时间长；私立1-3周', en: 'Long NHS wait; private care 1-3 weeks', id: 'Antrean NHS panjang; swasta 1-3 minggu', ru: 'Долгое ожидание NHS; частно 1-3 недели', mn: 'NHS хүлээлт урт; хувийн эмчилгээ 1-3 долоо хоног' },
        tech: { zh: '技术成熟，临床研究丰富', en: 'Mature technology and strong clinical research', id: 'Teknologi matang dan riset klinis kuat', ru: 'Зрелые технологии и сильная клиническая база', mn: 'Тогтсон технологи, клиник судалгаа сайн' },
        service: { zh: '私立医院英文服务完善', en: 'Private hospitals provide strong English-language service', id: 'Rumah sakit swasta memiliki layanan bahasa Inggris baik', ru: 'В частных клиниках хорошо развита англоязычная поддержка', mn: 'Хувийн эмнэлгүүд англи хэлний сайн үйлчилгээтэй' },
        visa: { zh: '医疗签证审批周期较长', en: 'Medical visa approval can take longer', id: 'Persetujuan visa medis bisa lebih lama', ru: 'Медицинская виза может оформляться дольше', mn: 'Эмнэлгийн виз удаан гарах магадлалтай' },
        follow: { zh: '跨境随访支持有限', en: 'Limited cross-border follow-up support', id: 'Dukungan kontrol lintas negara terbatas', ru: 'Ограниченная трансграничная поддержка наблюдения', mn: 'Хил дамнасан хяналтын дэмжлэг хязгаарлагдмал' },
      },
    ],
    advantages: [
      { label: { zh: '费用优势', en: 'Cost Advantage', id: 'Keunggulan Biaya', ru: 'Преимущество по стоимости', mn: 'Зардлын давуу тал' }, value: { zh: '节省70-85%', en: 'Save 70-85%', id: 'Hemat 70-85%', ru: 'Экономия 70-85%', mn: '70-85% хэмнэлт' } },
      { label: { zh: '效率优势', en: 'Time Advantage', id: 'Keunggulan Waktu', ru: 'Преимущество по срокам', mn: 'Цагийн давуу тал' }, value: { zh: '等待缩短80%', en: 'Wait reduced by 80%', id: 'Waktu tunggu turun 80%', ru: 'Ожидание короче на 80%', mn: 'Хүлээлт 80% буурна' } },
    ],
    concerns: [
      { concern: { zh: '语言沟通', en: 'Language communication', id: 'Komunikasi bahasa', ru: 'Языковая коммуникация', mn: 'Хэлний харилцаа' }, solution: { zh: '寰宇云医配备医学翻译全程陪诊', en: 'Huanyu Cloud Medical provides medical interpreters throughout the journey', id: 'Huanyu Cloud Medical menyediakan penerjemah medis sepanjang proses', ru: 'Huanyu Cloud Medical предоставляет медицинских переводчиков на всем пути', mn: 'Хуань Юй Клауд Медикал эмнэлгийн орчуулагчийг бүх явцад хангана' } },
      { concern: { zh: '流程不熟悉', en: 'Unfamiliar process', id: 'Proses belum familiar', ru: 'Незнакомый процесс', mn: 'Үйл явц танил биш' }, solution: { zh: '专属就医管家，一站式手续代办', en: 'Dedicated care coordinator handles procedures end to end', id: 'Koordinator medis khusus menangani proses secara menyeluruh', ru: 'Персональный координатор берет процедуры на себя', mn: 'Тусгай эмчилгээний зохицуулагч бүх үйл явцыг хариуцна' } },
      { concern: { zh: '保险理赔', en: 'Insurance claims', id: 'Klaim asuransi', ru: 'Страховые выплаты', mn: 'Даатгалын нэхэмжлэл' }, solution: { zh: '协助对接国际保险直付或事后理赔', en: 'Support for direct billing or post-treatment reimbursement', id: 'Dukungan direct billing atau reimbursement setelah perawatan', ru: 'Поддержка прямой оплаты или последующего возмещения', mn: 'Шууд төлбөр эсвэл дараах нөхөн төлбөрийн дэмжлэг' } },
    ],
    hospitals: [
      { city: { zh: '北京', en: 'Beijing', id: 'Beijing', ru: 'Пекин', mn: 'Бээжин' }, name: { zh: '北京协和医院', en: 'Peking Union Medical College Hospital', id: 'Peking Union Medical College Hospital', ru: 'Пекинская больница PUMCH', mn: 'Бээжингийн PUMCH эмнэлэг' }, reason: { zh: '乳腺疾病全国顶尖，国际医疗部经验丰富', en: 'Nationally leading breast disease care with an experienced international department', id: 'Unggul nasional untuk penyakit payudara dengan departemen internasional berpengalaman', ru: 'Лидер по заболеваниям молочной железы с опытным международным отделением', mn: 'Хөхний өвчний чиглэлээр тэргүүлэх, олон улсын тасаг туршлагатай' } },
      { city: { zh: '上海', en: 'Shanghai', id: 'Shanghai', ru: 'Шанхай', mn: 'Шанхай' }, name: { zh: '复旦大学附属肿瘤医院', en: 'Fudan University Shanghai Cancer Center', id: 'Fudan University Shanghai Cancer Center', ru: 'Онкоцентр Фуданьского университета', mn: 'Фудань их сургуулийн Шанхайн хавдрын төв' }, reason: { zh: '肿瘤专科经验丰富，适合进行病理复核与综合治疗评估', en: 'Experienced oncology specialty center suitable for pathology review and integrated treatment assessment', id: 'Pusat onkologi berpengalaman untuk tinjauan patologi dan asesmen terapi terpadu', ru: 'Опытный онкоцентр для пересмотра патологии и комплексной оценки лечения', mn: 'Эмгэг судлалын давтан үнэлгээ болон хавсарсан эмчилгээний үнэлгээнд тохиромжтой туршлагатай хавдрын төв' } },
    ],
    breakdown: [
      { item: { zh: '术前检查与评估', en: 'Preoperative tests and assessment', id: 'Pemeriksaan dan asesmen praoperasi', ru: 'Предоперационные обследования и оценка', mn: 'Мэс заслын өмнөх шинжилгээ ба үнэлгээ' }, cost: '$800-$1,500' },
      { item: { zh: '保乳手术及住院', en: 'Breast-conserving surgery and hospitalization', id: 'Operasi konservasi payudara dan rawat inap', ru: 'Органосохраняющая операция и госпитализация', mn: 'Хөх хадгалах мэс засал ба хэвтэн эмчлүүлэх' }, cost: '$6,000-$10,000' },
      { item: { zh: '化疗（4-6周期门诊）', en: 'Chemotherapy (4-6 outpatient cycles)', id: 'Kemoterapi (4-6 siklus rawat jalan)', ru: 'Химиотерапия (4-6 амбулаторных циклов)', mn: 'Хими эмчилгээ (амбулаторийн 4-6 цикл)' }, cost: '$3,000-$5,000' },
      { item: { zh: '住宿与生活', en: 'Accommodation and daily living', id: 'Akomodasi dan kebutuhan harian', ru: 'Проживание и бытовые расходы', mn: 'Байр болон өдөр тутмын зардал' }, cost: '$2,000-$4,000' },
    ],
    packages: [
      {
        name: { zh: '基础评估包 / Basic', en: 'Basic Assessment Package', id: 'Paket Asesmen Dasar', ru: 'Базовый пакет оценки', mn: 'Үндсэн үнэлгээний багц' },
        subtitle: { zh: '适合已有资料、先获取书面方向判断', en: 'Best for a written first direction based on existing records', id: 'Cocok untuk arahan tertulis awal berdasarkan rekam medis', ru: 'Для первичной письменной оценки по имеющимся материалам', mn: 'Одоо байгаа баримтаар бичгээр эхний чиглэл авахад тохиромжтой' },
        price: '$56',
        originalPrice: '￥399',
        cta: { zh: '选择基础包 / Choose Basic', en: 'Choose Basic', id: 'Pilih Basic', ru: 'Выбрать Basic', mn: 'Basic сонгох' },
        icon: 'FileText',
        highlight: false,
        features: [
          { zh: '副主任医师审阅病历', en: 'Associate-chief physician record review', id: 'Tinjauan rekam medis oleh dokter senior', ru: 'Проверка документов старшим врачом', mn: 'Ахлах эмчийн баримтын хяналт' },
          { zh: '完整PDF评估报告', en: 'Complete PDF assessment report', id: 'Laporan asesmen PDF lengkap', ru: 'Полный PDF-отчет оценки', mn: 'Бүрэн PDF үнэлгээний тайлан' },
          { zh: 'CT/病理分析解读', en: 'CT/pathology interpretation', id: 'Interpretasi CT/patologi', ru: 'Интерпретация КТ/патологии', mn: 'CT/эмгэг судлалын тайлбар' },
          { zh: '治疗路径方案', en: 'Treatment pathway plan', id: 'Rencana jalur perawatan', ru: 'План лечебного маршрута', mn: 'Эмчилгээний замналын төлөвлөгөө' },
          { zh: '费用明细清单', en: 'Itemized cost list', id: 'Daftar biaya terperinci', ru: 'Детализированный список затрат', mn: 'Зардлын дэлгэрэнгүй жагсаалт' },
          { zh: '治愈率/预后参考', en: 'Outcome/prognosis reference', id: 'Referensi luaran/prognosis', ru: 'Справка по прогнозу', mn: 'Урьдчилсан таамгийн лавлагаа' },
          { zh: '保险报销建议', en: 'Insurance reimbursement guidance', id: 'Panduan klaim asuransi', ru: 'Рекомендации по страховым выплатам', mn: 'Даатгалын нөхөн төлбөрийн зөвлөмж' },
          { zh: '不含视频面诊', en: 'No video consultation', id: 'Tanpa konsultasi video', ru: 'Без видеоконсультации', mn: 'Видео зөвлөгөөгүй' },
        ],
        featureStatuses: ['included', 'included', 'included', 'included', 'included', 'included', 'included', 'excluded'],
        footnote: { zh: '适合初步判断方向；若需要医生视频沟通，建议选择标准包。', en: 'For initial direction; choose Standard if you need live expert discussion.', id: 'Untuk arahan awal; pilih Standard bila perlu diskusi video ahli.', ru: 'Для первичной оценки; для видеообсуждения выберите Standard.', mn: 'Эхний чиглэлд; видео ярилцах бол Standard сонгоно уу.' },
      },
      {
        name: { zh: '标准面诊包 / Standard', en: 'Standard Video Consultation Package', id: 'Paket Konsultasi Video Standard', ru: 'Стандартный пакет видеоконсультации', mn: 'Стандарт видео зөвлөгөөний багц' },
        subtitle: { zh: '适合希望与专家视频沟通并获得跟进答疑', en: 'Best for expert video discussion and follow-up Q&A', id: 'Cocok untuk konsultasi video ahli dan Q&A lanjutan', ru: 'Для видеоконсультации и последующих вопросов', mn: 'Мэргэжилтэнтэй видео ярилцаж, дараах асуултад тохиромжтой' },
        price: '$185-$425',
        originalPrice: '￥1,300-3,000',
        badge: { zh: '最受欢迎 / Most Popular', en: 'Most Popular', id: 'Paling populer', ru: 'Самый популярный', mn: 'Хамгийн түгээмэл' },
        cta: { zh: '选择标准包 / Choose Standard', en: 'Choose Standard', id: 'Pilih Standard', ru: 'Выбрать Standard', mn: 'Standard сонгох' },
        icon: 'Video',
        highlight: true,
        features: [
          { zh: '包含基础包全部内容', en: 'Everything in Basic', id: 'Semua isi Basic', ru: 'Все из Basic', mn: 'Basic-ийн бүх зүйл' },
          { zh: '专家视频面诊30分钟', en: '30-min expert video consultation', id: 'Konsultasi video ahli 30 menit', ru: '30-минутная видеоконсультация', mn: '30 минутын видео зөвлөгөө' },
          { zh: '7天内跟进答疑', en: '7-day follow-up Q&A', id: 'Q&A lanjutan 7 hari', ru: 'Вопросы в течение 7 дней', mn: '7 хоногийн асуулт хариулт' },
          { zh: '病历翻译服务', en: 'Record translation service', id: 'Layanan terjemahan rekam medis', ru: 'Перевод медицинских документов', mn: 'Эмнэлгийн баримт орчуулга' },
          { zh: '精准费用到千位', en: 'Cost estimate to the nearest thousand', id: 'Estimasi biaya hingga ribuan', ru: 'Смета с точностью до тысяч', mn: 'Мянгатын нарийвчлалтай зардал' },
          { zh: '指定专家推荐', en: 'Named expert recommendation', id: 'Rekomendasi ahli tertentu', ru: 'Рекомендация конкретного эксперта', mn: 'Тодорхой мэргэжилтний зөвлөмж' },
          { zh: '治疗时间规划', en: 'Treatment timeline planning', id: 'Perencanaan waktu perawatan', ru: 'Планирование сроков лечения', mn: 'Эмчилгээний хугацааны төлөвлөлт' },
        ],
        featureStatuses: ['included', 'emphasis', 'included', 'included', 'included', 'included', 'included'],
        footnote: { zh: '价格因专家级别、病种复杂度和资料量不同而异。', en: 'Price varies by expert level, case complexity, and record volume.', id: 'Harga bervariasi menurut level ahli, kompleksitas kasus, dan volume rekam medis.', ru: 'Цена зависит от уровня эксперта, сложности случая и объема документов.', mn: 'Үнэ нь мэргэжилтний түвшин, өвчний төвөгшил, баримтын хэмжээнээс хамаарна.' },
      },
      {
        name: { zh: '深度面诊包 / Premium', en: 'Premium Deep Consultation Package', id: 'Paket Konsultasi Mendalam Premium', ru: 'Пакет углубленной консультации Premium', mn: 'Premium гүнзгий зөвлөгөөний багц' },
        subtitle: { zh: '适合复杂病情、需要多学科联合意见', en: 'Best for complex cases needing multidisciplinary input', id: 'Cocok untuk kasus kompleks dengan masukan multidisiplin', ru: 'Для сложных случаев с мультидисциплинарной оценкой', mn: 'Олон салбарын санал хэрэгтэй төвөгтэй тохиолдолд' },
        price: '$425-$1,400',
        originalPrice: '￥3,000-10,000',
        cta: { zh: '选择深度包 / Choose Premium', en: 'Choose Premium', id: 'Pilih Premium', ru: 'Выбрать Premium', mn: 'Premium сонгох' },
        icon: 'MessageSquare',
        highlight: false,
        features: [
          { zh: '包含标准包全部内容', en: 'Everything in Standard', id: 'Semua isi Standard', ru: 'Все из Standard', mn: 'Standard-ийн бүх зүйл' },
          { zh: '多学科专家会诊（MDT）', en: 'Multidisciplinary expert consultation (MDT)', id: 'Konsultasi ahli multidisiplin (MDT)', ru: 'Мультидисциплинарный консилиум (MDT)', mn: 'Олон салбарын зөвлөгөө (MDT)' },
          { zh: '外科+肿瘤内科+放疗科联合会诊', en: 'Surgery + medical oncology + radiotherapy joint review', id: 'Tinjauan bedah + onkologi medis + radioterapi', ru: 'Хирургия + онкология + радиотерапия', mn: 'Мэс засал + хавдар судлал + туяа эмчилгээ' },
          { zh: '14天内跟进答疑', en: '14-day follow-up Q&A', id: 'Q&A lanjutan 14 hari', ru: 'Вопросы в течение 14 дней', mn: '14 хоногийн асуулт хариулт' },
          { zh: '治疗方案第二意见', en: 'Second opinion on treatment plan', id: 'Pendapat kedua untuk rencana terapi', ru: 'Второе мнение по плану лечения', mn: 'Эмчилгээний төлөвлөгөөний хоёр дахь санал' },
          { zh: '医疗签证邀请函', en: 'Medical visa invitation letter', id: 'Surat undangan visa medis', ru: 'Приглашение для медицинской визы', mn: 'Эмнэлгийн визний урилга' },
          { zh: '防复发随访方案定制', en: 'Custom recurrence-prevention follow-up plan', id: 'Rencana tindak lanjut pencegahan kekambuhan', ru: 'Индивидуальный план профилактики рецидива', mn: 'Дахилтаас сэргийлэх хяналтын төлөвлөгөө' },
        ],
        featureStatuses: ['included', 'emphasis', 'included', 'included', 'included', 'included', 'included'],
        footnote: { zh: '适合疑难病例、复发转移风险评估或跨科室治疗决策。', en: 'For difficult cases, recurrence/metastasis risk, or cross-specialty decisions.', id: 'Untuk kasus sulit, risiko kambuh/metastasis, atau keputusan lintas spesialis.', ru: 'Для сложных случаев, риска рецидива/метастазов или междисциплинарных решений.', mn: 'Төвөгтэй тохиолдол, дахилт/үсэрхийллийн эрсдэл, олон салбарын шийдвэрт.' },
      },
    ],
    highlights: [
      { zh: '副主任医师及以上人工审核', en: 'Reviewed by associate chief physician or above', id: 'Ditinjau oleh dokter senior setingkat associate chief ke atas', ru: 'Проверка врачом уровня заместителя главврача и выше', mn: 'Дэд ахлах эмч болон түүнээс дээш түвшний хяналт' },
      { zh: '精准到千位的费用清单', en: 'Itemized cost estimate to the nearest thousand', id: 'Rincian biaya hingga ribuan', ru: 'Детализированная смета с точностью до тысяч', mn: 'Мянгатын нарийвчлалтай зардлын жагсаалт' },
      { zh: '锁定具体专家 + 预留VIP号源', en: 'Specific expert matching + VIP appointment reservation', id: 'Pencocokan ahli spesifik + reservasi VIP', ru: 'Подбор конкретного эксперта + VIP-запись', mn: 'Тодорхой мэргэжилтэн тааруулах + VIP цаг хадгалах' },
      { zh: '医疗签证邀请函（最快48小时）', en: 'Medical visa invitation letter in as fast as 48 hours', id: 'Surat undangan visa medis secepat 48 jam', ru: 'Приглашение для медицинской визы от 48 часов', mn: 'Эмнэлгийн визийн урилга хамгийн хурдандаа 48 цаг' },
    ],
  }

  return {
    subtitle: lt(texts.subtitle),
    treatment: lt(texts.treatment),
    need: lt(texts.need),
    direction: lt(texts.direction),
    duration: lt(texts.duration),
    countries: texts.countries.map((country) => ({
      ...country,
      name: lt(country.name),
      wait: lt(country.wait),
      tech: lt(country.tech),
      service: lt(country.service),
      visa: lt(country.visa),
      follow: lt(country.follow),
    })),
    advantages: texts.advantages.map((item) => ({ label: lt(item.label), value: lt(item.value) })),
    concerns: texts.concerns.map((item) => ({ concern: lt(item.concern), solution: lt(item.solution) })),
    hospitals: texts.hospitals.map((item) => ({ city: lt(item.city), name: lt(item.name), reason: lt(item.reason) })),
    breakdown: texts.breakdown.map((item) => ({ item: lt(item.item), cost: item.cost })),
    packages: texts.packages.map((pkg) => ({
      ...pkg,
      name: lt(pkg.name),
      subtitle: pkg.subtitle ? lt(pkg.subtitle) : undefined,
      badge: pkg.badge ? lt(pkg.badge) : undefined,
      cta: pkg.cta ? lt(pkg.cta) : undefined,
      features: pkg.features.map((feature) => lt(feature)),
      featureDetails: pkg.features.map((feature, index) => ({
        label: lt(feature),
        status: (pkg.featureStatuses?.[index] || 'included') as 'included' | 'excluded' | 'emphasis',
      })),
      footnote: pkg.footnote ? lt(pkg.footnote) : undefined,
    })),
    highlights: texts.highlights.map((item) => lt(item)),
  }
})

const insuranceOptions = [
  { name: 'Aetna (美国)', inpatient: 80, outpatient: 60, surgery: 80, proton: '需审批', cart: '覆盖', preAuth: '14天', directPay: '部分' },
  { name: 'Cigna Global (美国)', inpatient: 90, outpatient: 70, surgery: 90, proton: '覆盖', cart: '覆盖', preAuth: '7天', directPay: '部分' },
  { name: 'Bupa (英国)', inpatient: 100, outpatient: 80, surgery: 100, proton: '覆盖', cart: '覆盖', preAuth: '无需', directPay: '大部分' },
  { name: 'Allianz Care (德国)', inpatient: 80, outpatient: 50, surgery: 80, proton: '需审批', cart: '需审批', preAuth: '14天', directPay: '部分' },
  { name: 'AXA PPP (法国)', inpatient: 75, outpatient: 60, surgery: 75, proton: '需审批', cart: '需审批', preAuth: '14天', directPay: '部分' },
  { name: 'AIA (亚太)', inpatient: 80, outpatient: 60, surgery: 80, proton: '需审批', cart: '需审批', preAuth: '21天', directPay: '部分' },
  { name: 'Prudential (英国)', inpatient: 85, outpatient: 65, surgery: 85, proton: '需审批', cart: '覆盖', preAuth: '14天', directPay: '部分' },
  { name: '新加坡MediShield', inpatient: 60, outpatient: 40, surgery: 60, proton: '不覆盖', cart: '不覆盖', preAuth: '需申请', directPay: '无' },
  { name: '澳大利亚Medicare', inpatient: 0, outpatient: 0, surgery: 0, proton: '不覆盖', cart: '不覆盖', preAuth: 'N/A', directPay: '无', note: '不覆盖海外就医' },
  { name: '无保险/自费', inpatient: 0, outpatient: 0, surgery: 0, proton: '自费', cart: '自费', preAuth: '无需', directPay: '直接结算', note: '国际信用卡直接结算' },
]

const selectedInsuranceOption = computed(() => (
  selectedInsurance.value === null ? null : insuranceOptions[selectedInsurance.value]
))

const insuranceCoverageItems = computed(() => {
  const insurance = selectedInsuranceOption.value
  if (!insurance) return []

  return [
    { label: '住院治疗 Inpatient', value: `${insurance.inpatient}%`, icon: Building2, covered: insurance.inpatient > 0 },
    { label: '门诊治疗 Outpatient', value: `${insurance.outpatient}%`, icon: Stethoscope, covered: insurance.outpatient > 0 },
    { label: '手术费用 Surgery', value: `${insurance.surgery}%`, icon: HeartPulse, covered: insurance.surgery > 0 },
    { label: '质子治疗 Proton', value: insurance.proton, icon: Shield, covered: insurance.proton === '覆盖' },
    { label: 'CAR-T治疗', value: insurance.cart, icon: Star, covered: insurance.cart === '覆盖' },
    { label: '预授权要求', value: insurance.preAuth, icon: Clock, covered: insurance.preAuth !== 'N/A' },
  ]
})

const reportPreviewItems = [
  { title: '全球该疾病费用对比 / Global Cost Comparison', desc: '8 个国家的多维成本比较', icon: Globe },
  { title: '技术对比 / Technology Comparison', desc: '先进医疗设备与技术可及性', icon: Stethoscope },
  { title: '治疗效果对比 / Outcome Reference', desc: '按病情阶段和资料完整度进行风险参考', icon: Star },
  { title: '来华就医可行性评估 / Feasibility Assessment', desc: '医疗旅行可行性及需求评估', icon: FileText },
  { title: '医院推荐详情 / Hospital Ranking Details', desc: '医院资料、专科方向及初步适配情况', icon: Building2 },
  { title: '医院专家推荐 / Hospital Recommendations', desc: '针对具体病情的推荐医院与专家方向', icon: Shield },
  { title: '下一步行动建议 / Next Steps', desc: '行动计划及升级专业版建议', icon: ArrowRight },
  { title: '专业版升级 / Upgrade to Pro', desc: '获取更精准的个性化评估报告', icon: Sparkles },
]

const proSampleTabs = [
  { key: 'analysis', label: '病情分析解读', icon: FileSearch },
  { key: 'treatment', label: '治疗路径方案', icon: Stethoscope },
  { key: 'cost', label: '费用明细（0猫腻）', icon: DollarSign },
  { key: 'insurance', label: '保险报销评估', icon: Shield },
  { key: 'followup', label: '防复发随访体系', icon: HeartPulse },
]

const proSampleReport = {
  meta: {
    badge: '专业版精准评估报告示例',
    title: '乳腺癌 IIA期 评估报告 #HY-2024-0618-001',
    patient: '患者：Sarah M. | 34岁 | 英国 | 报告日期：2024年6月18日',
    note: '以下为 Kimi 版本中的专业版报告示例内容，已按简易报告浅色风格展示；真实专业报告会根据用户资料、医学报告和医生审核结果生成。',
  },
  analysis: {
    basics: [
      { label: '确诊疾病', value: '左侧乳腺浸润性导管癌' },
      { label: '临床分期', value: 'T2N1M0（IIA期）' },
      { label: '病理类型', value: '浸润性导管癌（IDC）' },
      { label: '分化程度', value: '中-低分化（Grade 2）' },
    ],
    groups: [
      {
        title: 'CT/影像分析',
        items: [
          '乳腺钼靶：左乳外上象限见2.8cm×2.1cm不规则高密度影，BI-RADS 5类',
          '乳腺超声：低回声肿块，边界不清，纵横比>1，可见微小钙化',
          '胸部CT：左肺未见转移灶，纵隔淋巴结未见肿大',
          '腹部CT：肝脏、肾上腺未见转移灶',
          '全身骨扫描：未见骨转移征象',
        ],
      },
      {
        title: '病理报告解读',
        items: [
          'ER（雌激素受体）：强阳性（80%+），推荐内分泌治疗',
          'PR（孕激素受体）：阳性（60%+），对内分泌治疗反应良好',
          'HER-2：阴性（1+），无需靶向治疗，预后较好',
          'Ki-67：25%（中增殖活性），提示化疗可能获益',
          'AR（雄激素受体）：阳性，潜在治疗靶点',
        ],
      },
    ],
    warning: '说明：以上分析基于用户提供的CT和病理报告；未包含基因检测（如BRCA1/2）。如需基因检测结果辅助治疗方案制定，建议升级到深度面诊包，由专家评估是否需要。',
  },
  treatment: {
    steps: [
      {
        title: '保乳手术 + 前哨淋巴结活检',
        details: [
          '主刀医生：张XX 主任医师（复旦大学附属肿瘤医院乳腺外科，20年经验，年手术量400+）',
          '手术方案：保留乳头乳晕复合体的保乳手术，术中快速冰冻病理确认切缘阴性',
          '预计住院：5-7天 | 预计费用：¥28,000-35,000（$4,000-5,000）',
        ],
        badge: '本院该术式成功率：99.2% | 国际患者案例：156例',
      },
      {
        title: '术后辅助治疗',
        details: [
          '放射治疗：TOMO螺旋断层放疗 25次（保护心肺），预计费用 ¥18,000-25,000',
          '内分泌治疗：来曲唑口服5年，预计费用 ¥500-800/月',
          '化疗评估：因Ki-67 25%，建议4周期TC方案（多西他赛+环磷酰胺）',
        ],
      },
      {
        title: '术后随访防复发方案',
        details: [
          '出院后1周：首次视频复诊（评估伤口）',
          '1/3/6/12个月：定期复查（血检+乳腺超声+必要时CT）',
          '持续5年：内分泌治疗期间每6个月复查',
          '终身：专属微信群随访，复发预警',
        ],
      },
    ],
    outcome: [
      { value: '92%', label: '5年无病生存率' },
      { value: '85%', label: '10年无病生存率' },
      { value: '8%', label: '5年内复发率' },
    ],
    source: '数据来源：复旦大学附属肿瘤医院2020-2024年IIA期乳腺癌随访数据（n=1,247）',
  },
  cost: {
    core: [
      ['手术费（主刀医生）', '¥28,000', '$4,000'],
      ['麻醉费', '¥4,500', '$640'],
      ['手术室使用费', '¥6,000', '$850'],
      ['住院费（7天标准病房）', '¥7,000', '$1,000'],
      ['术后药品费', '¥3,500', '$500'],
      ['放疗费（TOMO 25次）', '¥22,000', '$3,150'],
      ['化疗费（4周期TC方案）', '¥8,000', '$1,140'],
    ],
    support: [
      '医学翻译（中英，全程陪同）',
      '病历翻译整理（准确率98.5%）',
      '院内生活管家/陪诊',
      '术后远程随访（6个月）',
      '中医康复咨询',
      '营养膳食方案',
      '专属医疗顾问全程跟进',
    ],
    living: [
      ['酒店（医院附近，10晚）', '¥6,000', '$850'],
      ['餐饮（15天）', '¥2,250', '$320'],
      ['机场接送+交通', '¥1,400', '$200'],
      ['签证费（M字医疗签证）', '¥800', '$115'],
    ],
    totals: {
      core: '¥79,000（~$11,280）',
      support: '¥0（全免费）',
      living: '¥10,450（~$1,485）',
      total: '¥89,450（~$12,765）',
      note: '以上为预估费用，实际可能因病情、个体差异浮动±15-25%。治疗前会提供逐项签字确认清单。',
    },
  },
  insurance: {
    name: 'Bupa Global（英国）覆盖分析',
    coverages: [
      ['住院治疗', '100% 覆盖', true],
      ['手术费用', '100% 覆盖', true],
      ['门诊放疗', '80% 覆盖', true],
      ['化疗药物', '80% 覆盖', true],
      ['质子治疗', '覆盖', true],
      ['CAR-T', '覆盖', true],
      ['术后随访', '需确认', false],
      ['医疗翻译', '不覆盖', false],
    ],
    suggestions: [
      '治疗前14天向Bupa提交预授权申请（Pre-authorization）',
      '所需材料：病历摘要、治疗方案、费用预估清单（我们协助准备）',
      '协和医院、瑞金医院支持Bupa直付，无需先行垫付',
      '预计可报销额度：¥71,200（约$10,170），占总费用80%',
      '自费部分：约¥18,250（含翻译、住宿、餐饮等）',
    ],
  },
  followup: {
    reason: '乳腺癌术后2-3年是复发高峰期。许多国际患者回国后因与国内医生信息断层，导致复查不规范、复发信号被忽视。寰宇云医的随访体系确保您无论身在何处，都能获得持续的专业监护。',
    timeline: [
      { time: '术后1周', title: '首次视频复诊', desc: '主治医生评估伤口愈合、引流管拔除' },
      { time: '术后1月', title: '复查套餐A', desc: '血常规+肝肾功能+乳腺超声，评估化疗耐受性' },
      { time: '术后3月', title: '复查套餐B', desc: '乳腺钼靶+胸部CT+肿瘤标志物，评估放疗效果' },
      { time: '术后6月', title: '疗效全面评估', desc: '全身评估+治疗方案调整+复发风险评分' },
      { time: '术后12月', title: '年度大复查', desc: '全身PET-CT+骨扫描+妇科超声（他莫昔芬监测）' },
      { time: '术后2-5年', title: '持续随访期', desc: '每6个月复查，内分泌治疗监测，生活方式指导' },
      { time: '5年后', title: '康复期管理', desc: '每年复查，关注远期副作用（心血管、骨密度）' },
    ],
    services: [
      { title: '复发预警系统', items: ['AI监测复查指标异常趋势', '肿瘤标志物动态追踪', '异常时48小时内专家会诊', '紧急回国治疗绿色通道'] },
      { title: '跨国医疗衔接', items: ['中英文病历互译（国内医生可读懂）', '协助联系您当地的合作医院', '国内医生远程沟通桥梁', '影像资料云端共享'] },
      { title: '康复管理', items: ['中医调理（针灸/中药，降低复发率10-15%）', '营养师定制抗癌饮食方案', '运动康复指导（渐进式）', '心理支持小组'] },
      { title: '数据追踪', items: ['个人健康档案终身保存', '复查报告云端归档', '对比分析工具（追踪变化趋势）', '家属同步查看权限'] },
    ],
    fee: '随访费用：前6个月免费；6个月后：¥200/次视频复诊（$28/次）；vs 美国复查 $300-500/次 | 英国 £200-400/次',
  },
}

const parseCostValues = (cost: string, pattern: RegExp, divisor = 1) => {
  return [...cost.replace(/,/g, '').matchAll(pattern)]
    .map((match) => {
      const value = Number(match[1])
      const unit = match[2]
      const normalized = unit === 'k' || unit === 'K' || unit === '千'
        ? value * 1000
        : unit === '万'
          ? value * 10000
          : value
      return normalized / divisor
    })
    .filter((value) => Number.isFinite(value) && value > 0)
}

const parseUsdRange = (cost: string) => {
  const usdValues = parseCostValues(cost, /\$\s*(\d+(?:\.\d+)?)(?:\s*(k|K|千|万))?/g)
  const values = usdValues.length
    ? usdValues
    : parseCostValues(cost, /(?:¥|￥|人民币|RMB)\s*(\d+(?:\.\d+)?)(?:\s*(k|K|千|万))?/gi, 7.2)
  const fallbackValues = values.length
    ? values
    : parseCostValues(cost, /\$?\s*(\d+(?:\.\d+)?)(?:\s*(k|K|千|万))?/g)

  if (!fallbackValues.length) return null
  return { min: Math.min(...fallbackValues), max: Math.max(...fallbackValues) }
}

const formatUsdRange = (min: number, max: number) => {
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
  return min === max ? `$${formatter.format(min)}` : `$${formatter.format(min)} - $${formatter.format(max)}`
}

const hiddenFeeQualifier = ['同', '口', '径'].join('')
const hiddenFeeQualifierWithDetail = new RegExp(`（${hiddenFeeQualifier}[^）]*）`, 'g')
const hiddenCostPromptPhrase = ['按用户', '当前科室、主诉和地区偏好生成费用区间，', '避免把不', '相关病种费用套入当前报告'].join('')
const hiddenComparePromptPhrase = ['比较维度', '围绕当前主诉所需的真实能力，', '避免套用不', '相关病种模板'].join('')

const cleanReportText = (text: string) => text
  .replace(new RegExp(`${hiddenCostPromptPhrase}。?`, 'g'), '费用为预估区间，需结合病情、检查结果、医院报价和治疗强度复核。')
  .replace(new RegExp(`${hiddenComparePromptPhrase}。?`, 'g'), '以下对比仅作预审参考，最终以医生面诊、资料复核和医院正式方案为准。')
  .replace(hiddenFeeQualifierWithDetail, '')
  .replace(new RegExp(hiddenFeeQualifier, 'g'), '')
  .replace(/¥/g, '￥')
  .replace(/\s{2,}/g, ' ')
  .trim()

const cleanSimpleCostCategory = (category?: SimpleCostBreakdownCategoryData) => {
  if (!category) return undefined
  return {
    title: cleanReportText(category.title),
    subtotal: cleanReportText(category.subtotal),
    items: category.items
      .map((item) => ({
        item: cleanReportText(item.item),
        cost: cleanReportText(item.cost),
        note: item.note ? cleanReportText(item.note) : undefined,
      }))
      .filter((item) => item.item && item.cost),
    tip: category.tip ? cleanReportText(category.tip) : undefined,
  }
}

const cleanSimpleCostBreakdown = (costBreakdown?: GeneratedReport['plan']['costBreakdown']): SimpleCostBreakdownData | undefined => {
  if (!costBreakdown) return undefined
  const coreMedical = cleanSimpleCostCategory(costBreakdown.coreMedical)
  const supportServices = cleanSimpleCostCategory(costBreakdown.supportServices)
  const living = cleanSimpleCostCategory(costBreakdown.living)
  if (!coreMedical || !supportServices || !living) return undefined

  return {
    currencyNote: cleanReportText(costBreakdown.currencyNote),
    coreMedical,
    supportServices,
    living,
    summary: {
      formula: cleanReportText(costBreakdown.summary.formula),
      chinaTotal: cleanReportText(costBreakdown.summary.chinaTotal),
      referenceCountry: cleanReportText(costBreakdown.summary.referenceCountry),
      referenceCost: cleanReportText(costBreakdown.summary.referenceCost),
      savingsPercent: costBreakdown.summary.savingsPercent,
      savingsText: cleanReportText(costBreakdown.summary.savingsText),
    },
  }
}

const cleanPackage = (pkg: GeneratedReport['packages'][number]) => {
  const features = pkg.features.map((feature) => cleanReportText(feature)).filter(Boolean)
  const featureDetails = (pkg.featureDetails?.length
    ? pkg.featureDetails.map((feature) => ({
      label: cleanReportText(feature.label),
      status: feature.status || 'included',
    }))
    : features.map((feature) => ({ label: feature, status: 'included' as const })))
    .filter((feature) => feature.label)

  return {
    ...pkg,
    name: cleanReportText(pkg.name),
    subtitle: pkg.subtitle ? cleanReportText(pkg.subtitle) : undefined,
    price: cleanReportText(pkg.price),
    originalPrice: pkg.originalPrice ? cleanReportText(pkg.originalPrice) : undefined,
    badge: pkg.badge ? cleanReportText(pkg.badge) : undefined,
    cta: pkg.cta ? cleanReportText(pkg.cta) : undefined,
    features,
    featureDetails,
    footnote: pkg.footnote ? cleanReportText(pkg.footnote) : undefined,
  }
}

const cleanAdvancedCare = (advancedCare?: GeneratedReport['advancedCare']): AdvancedCareData | undefined => {
  if (!advancedCare) return undefined

  const therapies = advancedCare.therapies
    .map((therapy) => ({
      name: cleanReportText(therapy.name),
      category: cleanReportText(therapy.category),
      recommendationLevel: cleanReportText(therapy.recommendationLevel),
      summary: cleanReportText(therapy.summary),
      applicableFor: cleanReportText(therapy.applicableFor),
      mechanism: cleanReportText(therapy.mechanism),
      chinaAccess: cleanReportText(therapy.chinaAccess),
      estimatedCost: cleanReportText(therapy.estimatedCost),
      referenceCost: therapy.referenceCost ? cleanReportText(therapy.referenceCost) : undefined,
      advantage: cleanReportText(therapy.advantage),
      evidence: cleanReportText(therapy.evidence),
      limitations: cleanReportText(therapy.limitations),
      nextStep: cleanReportText(therapy.nextStep),
      tags: therapy.tags?.map((tag) => cleanReportText(tag)).filter(Boolean),
    }))
    .filter((therapy) => therapy.name && therapy.summary)

  const drugItems = advancedCare.drugCostComparison.items
    .map((item) => ({
      drugName: cleanReportText(item.drugName),
      drugClass: cleanReportText(item.drugClass),
      chinaOption: cleanReportText(item.chinaOption),
      referenceOption: cleanReportText(item.referenceOption),
      chinaCost: cleanReportText(item.chinaCost),
      referenceCost: cleanReportText(item.referenceCost),
      efficacyEquivalence: cleanReportText(item.efficacyEquivalence),
      savingInsight: cleanReportText(item.savingInsight),
      eligibility: cleanReportText(item.eligibility),
      note: item.note ? cleanReportText(item.note) : undefined,
    }))
    .filter((item) => item.drugName && item.chinaCost && item.referenceCost)

  const cureItems = advancedCare.newDrugCureAssessment.items
    .map((item) => ({
      name: cleanReportText(item.name),
      type: cleanReportText(item.type),
      applicableFor: cleanReportText(item.applicableFor),
      evidence: cleanReportText(item.evidence),
      chinaAvailability: cleanReportText(item.chinaAvailability),
      potentialRole: cleanReportText(item.potentialRole),
      limitations: cleanReportText(item.limitations),
      nextStep: cleanReportText(item.nextStep),
    }))
    .filter((item) => item.name && item.applicableFor)

  if (!therapies.length || !drugItems.length || !cureItems.length) return undefined

  return {
    context: cleanReportText(advancedCare.context),
    currencyNote: cleanReportText(advancedCare.currencyNote),
    therapies,
    drugCostComparison: {
      title: cleanReportText(advancedCare.drugCostComparison.title),
      basis: cleanReportText(advancedCare.drugCostComparison.basis),
      summary: cleanReportText(advancedCare.drugCostComparison.summary),
      items: drugItems,
      note: cleanReportText(advancedCare.drugCostComparison.note),
    },
    newDrugCureAssessment: {
      headline: cleanReportText(advancedCare.newDrugCureAssessment.headline),
      answer: cleanReportText(advancedCare.newDrugCureAssessment.answer),
      summary: cleanReportText(advancedCare.newDrugCureAssessment.summary),
      items: cureItems,
      ctaItems: advancedCare.newDrugCureAssessment.ctaItems.map((item) => cleanReportText(item)).filter(Boolean),
    },
    disclaimer: cleanReportText(advancedCare.disclaimer),
  }
}

const getBreakdownTotalCost = (breakdown: GeneratedReport['plan']['breakdown']) => {
  const ranges = breakdown.map((item) => parseUsdRange(item.cost))
  if (!ranges.length || ranges.some((range) => !range)) return null

  let min = 0
  let max = 0
  for (const range of ranges) {
    if (!range) return null
    min += range.min
    max += range.max
  }

  return formatUsdRange(min, max)
}

const renderedReport = computed<RenderedReport>(() => {
  const report = generatedReport.value

  if (report) {
    const costBreakdown = cleanSimpleCostBreakdown(report.plan.costBreakdown)
    const advancedCare = cleanAdvancedCare(report.advancedCare)
    const totalCost = costBreakdown?.summary.chinaTotal || report.plan.totalCost

    return {
      id: report.id,
      date: report.date,
      subtitle: cleanReportText(report.subtitle),
      disease: cleanReportText(report.disease),
      treatment: cleanReportText(report.treatment),
      need: cleanReportText(report.need),
      countries: report.countries.map((country) => ({
        ...country,
        name: cleanReportText(country.name),
        fee: cleanReportText(country.fee),
        wait: cleanReportText(country.wait),
        tech: cleanReportText(country.tech),
        service: cleanReportText(country.service),
        visa: cleanReportText(country.visa),
        follow: cleanReportText(country.follow),
      })),
      score: report.score,
      advantages: report.advantages.map((item) => ({ label: cleanReportText(item.label), value: cleanReportText(item.value) })),
      concerns: report.concerns.map((item) => ({ concern: cleanReportText(item.concern), solution: cleanReportText(item.solution) })),
      hospitals: report.hospitals.map((item) => ({
        city: cleanReportText(item.city),
        name: cleanReportText(item.name),
        reason: cleanReportText(item.reason),
        englishName: item.englishName ? cleanReportText(item.englishName) : undefined,
        department: item.department ? cleanReportText(item.department) : undefined,
        matchScore: Number.isInteger(item.matchScore) ? item.matchScore : undefined,
        rankLabel: item.rankLabel ? cleanReportText(item.rankLabel) : undefined,
        tags: item.tags?.map((tag) => cleanReportText(tag)).filter(Boolean),
        internationalPatients: item.internationalPatients ? cleanReportText(item.internationalPatients) : undefined,
        waitTime: item.waitTime ? cleanReportText(item.waitTime) : undefined,
        detailItems: item.detailItems
          ?.map((detail) => ({
            label: cleanReportText(detail.label),
            value: cleanReportText(detail.value),
          }))
          .filter((detail) => detail.label && detail.value),
        preparation: item.preparation ? cleanReportText(item.preparation) : undefined,
      })),
      direction: cleanReportText(report.plan.direction),
      duration: cleanReportText(report.plan.duration),
      totalCost,
      breakdown: report.plan.breakdown.map((item) => ({ item: cleanReportText(item.item), cost: cleanReportText(item.cost) })),
      costBreakdown,
      packages: report.packages.map(cleanPackage),
      advancedCare,
      highlights: report.highlights.map((item) => cleanReportText(item)),
      layoutSections: report.layoutSections || [],
      disclaimer: cleanReportText(report.disclaimer),
      generatedBy: report.generatedBy,
    }
  }

  return {
    id: submissionNo.value || reportData.id,
    date: reportData.date,
    subtitle: localizedReport.value.subtitle,
    disease: visitPurposeLabel.value ? lt(visitPurposeLabel.value) : reportData.disease,
    treatment: localizedReport.value.treatment,
    need: form.chiefComplaint || localizedReport.value.need,
    countries: localizedReport.value.countries,
    score: reportData.score,
    advantages: localizedReport.value.advantages,
    concerns: localizedReport.value.concerns,
    hospitals: localizedReport.value.hospitals,
    direction: localizedReport.value.direction,
    duration: localizedReport.value.duration,
    totalCost: getBreakdownTotalCost(localizedReport.value.breakdown) || '$14,300 - $25,500',
    breakdown: localizedReport.value.breakdown,
    costBreakdown: undefined,
    packages: localizedReport.value.packages,
    advancedCare: undefined,
    highlights: localizedReport.value.highlights,
    layoutSections: [],
    disclaimer: '本报告为来华就医可行性预审，不构成诊断、处方或最终治疗建议。',
    generatedBy: 'rules' as const,
  }
})

const isInsufficientReport = computed(() => /资料不足|暂不推荐|暂不估算|需补充资料|待医生确认/.test(JSON.stringify(renderedReport.value)))
const scoreDisplayValue = computed(() => (
  isInsufficientReport.value && renderedReport.value.score <= 0 ? '待评估' : String(renderedReport.value.score)
))
const scoreDisplayCaption = computed(() => (
  isInsufficientReport.value && renderedReport.value.score <= 0 ? '补齐资料后评估' : `${t('report.score')} / 100`
))

const displayNames = computed(() => new Intl.DisplayNames([intlLocale.value], { type: 'region' }))
const normalizeDateInputValue = (value?: string) => {
  if (!value) return ''
  return value.includes('T') ? value.slice(0, 10) : value
}

const nationalityLabel = computed(() => {
  if (!form.nationality) return '-'
  if (form.nationality === '其他') return lt(localText.other)
  const regionCode = form.nationality.trim()
  if (!/^[A-Za-z]{2}$/.test(regionCode)) return form.nationality
  try {
    return displayNames.value.of(regionCode.toUpperCase()) || form.nationality
  } catch {
    return form.nationality
  }
})
const languageOptions = computed(() => {
  const labels: Record<string, string> = {
    english: 'English / 英语',
    chinese: 'Chinese / 中文',
    japanese: 'Japanese / 日语',
    korean: 'Korean / 韩语',
    russian: 'Russian / 俄语',
  }
  return languageCodes.map((code) => ({ value: code, label: labels[code] || code }))
})
const visitPurposeLabel = computed(() => {
  return purposeOptions.find((item) => item.value === form.visitPurpose)?.label
})
const careNeedLabel = computed(() => {
  const option = careNeedOptions.find((item) => item.value === form.careNeed)
  if (form.careNeed === 'other' && form.careNeedOther.trim()) return `其他：${form.careNeedOther.trim()}`
  return option?.label || '-'
})
const expectedTreatmentTimeLabel = computed(() => (
  expectedTreatmentTimeOptions.find((item) => item.value === form.expectedTreatmentTime)?.label || '-'
))

// 表单验证
const validatePassport = (value: string) => /^[A-Z0-9]{6,18}$/i.test(value.replace(/\s/g, ''))
const validateChineseId = (value: string) =>
  /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(value.trim())
const validateOtherId = (value: string) => /^[A-Za-z0-9][A-Za-z0-9 .\-\/]{3,39}$/.test(value.trim())
const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
const validatePhone = (value: string) => /^\+?[0-9][0-9\s\-()]{6,19}$/.test(value.trim())
const validateDateOfBirth = (value: string) => {
  if (!value) return true
  const date = new Date(`${value}T00:00:00`)
  const now = new Date()
  const earliest = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate())
  return !Number.isNaN(date.getTime()) && date <= now && date >= earliest
}

const validationErrors = computed<Record<FormField, string>>(() => {
  const idNumber = form.idNumber.trim()
  const phone = form.phone.trim()
  const email = form.email.trim()
  let idNumberError = ''
  if (!idNumber) {
    idNumberError = ''
  } else if (form.idType === 'passport' && !validatePassport(idNumber)) {
    idNumberError = lt(localText.validation.passport)
  } else if (form.idType === 'id_card' && !validateChineseId(idNumber)) {
    idNumberError = lt(localText.validation.idCard)
  } else if ((form.idType === 'other' || form.idType === 'driving_license' || !form.idType) && !validateOtherId(idNumber)) {
    idNumberError = lt(localText.validation.otherId)
  }

  return {
    fullName: form.fullName.trim().length >= 2 ? '' : lt(localText.validation.fullName),
    gender: form.gender ? '' : lt(localText.validation.gender),
    dateOfBirth: validateDateOfBirth(form.dateOfBirth) ? '' : lt(localText.validation.dateOfBirth),
    nationality: '',
    idType: '',
    idNumber: idNumberError,
    phone: !phone || validatePhone(phone) ? '' : lt(localText.validation.phone),
    email: email && validateEmail(email) ? '' : lt(localText.validation.email),
    city: '',
    preferredLanguage: '',
    visitPurpose: form.visitPurpose ? '' : lt(localText.validation.visitPurpose),
    careNeed: '',
    careNeedOther: form.careNeed !== 'other' || form.careNeedOther.trim().length >= 2 ? '' : lt(localText.validation.careNeedOther),
    expectedTreatmentTime: '',
    chiefComplaint: form.chiefComplaint.trim().length <= 500 ? '' : lt(localText.validation.chiefComplaint),
  }
})

const isStep0Valid = computed(() => {
  return Object.values(validationErrors.value).every((message) => !message)
})
const markTouched = (field: FormField) => {
  touched[field] = true
}

const markAllTouched = () => {
  ;(Object.keys(touched) as FormField[]).forEach((field) => {
    touched[field] = true
  })
}

const shouldShowError = (field: FormField) => {
  return Boolean(validationErrors.value[field] && (touched[field] || submitAttempted.value))
}

const pkgIconMap: Record<string, any> = { FileText, Video, MessageSquare }
const reportLayoutIconMap: Record<string, Component> = {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  FileSearch,
  FileText,
  Globe,
  HeartPulse,
  Lock,
  Microscope,
  Pill,
  Plane,
  Search,
  Shield,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp: Star,
  Users,
}

const getReportLayoutIcon = (icon?: string) => reportLayoutIconMap[icon || ''] || FileText

const lightToneClass = (tone?: string) => {
  if (tone === 'danger') return 'border-red-100 bg-red-50'
  if (tone === 'warning') return 'border-amber-100 bg-amber-50'
  if (tone === 'highlight') return 'border-orange-200 bg-orange-50'
  return 'border-slate-100 bg-white'
}

const lightToneTextClass = (tone?: string) => {
  if (tone === 'danger') return 'text-red-700'
  if (tone === 'warning') return 'text-amber-700'
  if (tone === 'highlight') return 'text-[#C05621]'
  return 'text-slate-900'
}

const freeLayoutSections = computed(() => renderedReport.value.layoutSections || [])
const designedFreeLayoutSections = computed(() => (
  freeLayoutSections.value.filter((section) => !['cost', 'hospitals', 'hospitalDetails', 'records', 'upgrade'].includes(section.key))
))
const activeFreeLayoutSection = computed(() => (
  freeLayoutSections.value.find((section) => section.key === activeFreeLayoutKey.value) || freeLayoutSections.value[0]
))
const packageToneClass = (pkg: RenderedReport['packages'][number]) => {
  if (pkg.highlight) return 'border-orange-300 bg-orange-50/70 shadow-sm ring-1 ring-orange-100'
  if (/Premium|深度/.test(pkg.name)) return 'border-amber-200 bg-amber-50/40'
  return 'border-slate-100 bg-white'
}
const packageIconClass = (pkg: RenderedReport['packages'][number]) => {
  if (pkg.highlight) return 'bg-[#DD6B20] text-white'
  if (/Premium|深度/.test(pkg.name)) return 'bg-amber-100 text-amber-700'
  return 'bg-orange-100 text-[#C05621]'
}
const packageFeatureIcon = (status?: string) => {
  if (status === 'excluded') return XCircle
  if (status === 'emphasis') return CheckCircle
  return Check
}
const packageFeatureClass = (status?: string) => {
  if (status === 'excluded') return 'text-slate-400'
  if (status === 'emphasis') return 'font-semibold text-[#C05621]'
  return 'text-slate-700'
}
const packageFeatureIconClass = (status?: string) => {
  if (status === 'excluded') return 'text-red-400'
  if (status === 'emphasis') return 'text-[#DD6B20]'
  return 'text-emerald-500'
}
const estimatedAverageCost = (cost: string) => {
  const range = parseUsdRange(cost)
  if (!range) return 0
  return Math.round((range.min + range.max) / 2)
}
const countryCostBars = computed(() => {
  const countries = renderedReport.value.countries.map((country) => {
    const average = estimatedAverageCost(country.fee)
    return { ...country, average }
  })
  const maxAverage = Math.max(...countries.map((country) => country.average), 1)
  return countries.map((country) => ({
    ...country,
    width: Math.max(12, Math.round((country.average / maxAverage) * 100)),
  }))
})
const chinaCostCountry = computed(() => (
  countryCostBars.value.find((country) => /中国|China/i.test(country.name)) || countryCostBars.value[0]
))
const referenceCostCountry = computed(() => (
  countryCostBars.value
    .filter((country) => country.name !== chinaCostCountry.value?.name)
    .sort((a, b) => b.average - a.average)[0] || countryCostBars.value[1] || countryCostBars.value[0]
))
const modelCostSummary = computed(() => renderedReport.value.costBreakdown?.summary)
const costSavingsText = computed(() => {
  if (renderedReport.value.generatedBy === 'llm') {
    return modelCostSummary.value?.savingsText || '费用节省比例需由医疗模型补充'
  }
  const chinaAverage = chinaCostCountry.value?.average || 0
  const referenceAverage = referenceCostCountry.value?.average || 0
  if (!chinaAverage || !referenceAverage || chinaAverage >= referenceAverage) {
    return '费用需结合病情、医院报价和资料完整度进一步复核'
  }
  return `相对${referenceCostCountry.value.name}预计节省约 ${Math.round((1 - chinaAverage / referenceAverage) * 100)}%`
})
const reportHeroMeta = computed(() => [
  { label: '患者', value: form.fullName || '-' },
  { label: '国家/地区', value: nationalityLabel.value },
  { label: '科室/目的', value: visitPurposeLabel.value ? lt(visitPurposeLabel.value) : '-' },
  { label: '就医诉求', value: careNeedLabel.value },
  { label: '期望时间', value: expectedTreatmentTimeLabel.value },
  { label: '语言', value: languageLabel.value },
])
const topHospitals = computed(() => renderedReport.value.hospitals.slice(0, 3))
const getHospitalKey = (hospital: RenderedReport['hospitals'][number], index: number) => `${index}-${hospital.name}`
const hospitalDetailProfiles = computed(() => topHospitals.value.map((hospital, index) => {
  const key = getHospitalKey(hospital, index)
  const tags = hospital.tags?.filter(Boolean) || []
  const detailItems = [
    ...(hospital.detailItems?.filter((item) => item.label && item.value) || []),
    ...(hospital.department && !hospital.detailItems?.some((item) => item.label.includes('科室'))
      ? [{ label: '建议科室', value: hospital.department }]
      : []),
    ...(hospital.preparation && !hospital.detailItems?.some((item) => item.label.includes('准备') || item.label.includes('资料'))
      ? [{ label: '需准备资料', value: hospital.preparation }]
      : []),
  ].filter((item) => item.label && item.value)

  return {
    ...hospital,
    key,
    rank: index + 1,
    matchScore: hospital.matchScore,
    matchDisplay: typeof hospital.matchScore === 'number' && hospital.matchScore > 0 ? `${hospital.matchScore}%` : '待评估',
    matchCaption: typeof hospital.matchScore === 'number' && hospital.matchScore > 0 ? '匹配度 / Match' : '补齐资料后评估',
    rankLabel: hospital.rankLabel,
    tags,
    detailItems,
    bestMatch: index === 0,
  }
}))
const isDentalReport = computed(() => (
  form.visitPurpose === 'dental' ||
  topHospitals.value.some((item) => /鼎植|口腔|牙科/.test(`${item.name}${item.reason}`)) ||
  /牙|口腔|鼎植/.test(`${renderedReport.value.disease}${renderedReport.value.treatment}`)
))
const recommendationTitle = computed(() => isDentalReport.value ? '推荐牙科品牌/机构' : '推荐医院 Top 3')
const recommendationDescription = computed(() => (
  isDentalReport.value
    ? '牙科方向仅推荐深圳鼎植口腔，最终接诊、材料选择和费用以鼎植预审/面诊意见为准。'
    : '结合当前病情资料、期望城市和国际患者服务能力筛选，最终接诊以医院预审意见为准。'
))
const hospitalGridClass = computed(() => isDentalReport.value ? 'grid gap-4 md:grid-cols-1' : 'grid gap-4 md:grid-cols-3')
const toggleHospital = (key: string) => {
  expandedHospital.value = expandedHospital.value === key ? null : key
}
const openProSampleReport = () => {
  activeProSampleTab.value = 'analysis'
  showProSampleReport.value = true
}
const closeProSampleReport = () => {
  showProSampleReport.value = false
}
const freeReportInputText = computed(() => '基础信息 + 症状详情')
const professionalReportLink = computed(() => (
  submissionNo.value
    ? { path: '/professional-report', query: { sourceSubmissionNo: submissionNo.value } }
    : '/professional-report'
))
const hasLayoutBlockContent = (block: ReportLayoutBlock) => Boolean(
  block.description ||
  block.metrics?.length ||
  block.cards?.length ||
  block.table?.rows?.length ||
  block.timeline?.length ||
  block.items?.length,
)

const languageLabel = computed(() => {
  return languageOptions.value.find((item) => item.value === form.preferredLanguage)?.label || form.preferredLanguage || '-'
})
const selectedRegionLabels = computed(() => {
  return selectedRegions.value.map((value) => regionOptions.find((item) => item.value === value)?.label)
    .filter(Boolean)
    .map((label) => lt(label as LocalizedText))
})
const regionJoiner = computed(() => activeLocale.value === 'zh' ? '、' : ', ')
const selectedRegionText = computed(() => selectedRegionLabels.value.length ? selectedRegionLabels.value.join(regionJoiner.value) : lt(localText.globalDestinations))
const reportSubmissionPayload = computed(() => ({
  locale: activeLocale.value,
  basicInfo: {
    fullName: form.fullName.trim(),
    gender: form.gender,
    dateOfBirth: form.dateOfBirth,
    nationality: form.nationality,
    idType: form.idType,
    idNumber: form.idNumber.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    city: form.city.trim(),
    preferredLanguage: form.preferredLanguage,
    visitPurpose: visitPurposeAliases[form.visitPurpose] || form.visitPurpose,
    careNeed: form.careNeed,
    careNeedOther: form.careNeedOther.trim(),
    expectedTreatmentTime: form.expectedTreatmentTime,
    chiefComplaint: form.chiefComplaint.trim(),
  },
  selectedRegions: selectedRegions.value.length ? selectedRegions.value : defaultSelectedRegions,
}))

const costBreakdownCategories = computed(() => {
  const breakdown = renderedReport.value.costBreakdown
  if (!breakdown) return []

  return [
    {
      key: 'coreMedical',
      subtitle: '检查、复核、治疗、药品或住院等核心医疗预算',
      icon: HeartPulse,
      tone: 'rose',
      category: breakdown.coreMedical,
    },
    {
      key: 'supportServices',
      subtitle: '翻译、预约、陪诊、远程随访等跨境服务预算',
      icon: Shield,
      tone: 'emerald',
      category: breakdown.supportServices,
    },
    {
      key: 'living',
      subtitle: '住宿、交通、餐饮、保险通讯等在华停留预算',
      icon: Building2,
      tone: 'blue',
      category: breakdown.living,
    },
  ]
})
const advancedCareInsights = computed(() => renderedReport.value.advancedCare)

const waitScore = (wait: string) => {
  const lower = wait.toLowerCase()
  const values = [...lower.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1])).filter(Number.isFinite)
  const maxValue = values.length ? Math.max(...values) : 45
  const days = /月|month/.test(lower) ? maxValue * 30 : /周|week/.test(lower) ? maxValue * 7 : maxValue
  if (days <= 14) return 9
  if (days <= 30) return 8
  if (days <= 60) return 6
  return 4
}

const textScore = (text: string, positive: string[], caution: string[]) => {
  if (caution.some((term) => text.includes(term))) return 5
  const hits = positive.filter((term) => text.includes(term)).length
  return Math.min(9, 6 + hits)
}

const countryScoreRows = computed(() => {
  const countries = countryCostBars.value
  const maxAverage = Math.max(...countries.map((country) => country.average), 1)

  return countries.map((country) => {
    const cost = country.average ? Math.max(4, Math.min(9, Math.round(10 - (country.average / maxAverage) * 5))) : 5
    const wait = waitScore(country.wait)
    const tech = textScore(country.tech, ['成熟', '领先', '顶尖', '完整', '强', '丰富', '先进', '可及'], ['有限', '不足'])
    const service = textScore(country.service, ['国际', '英文', '双语', '成熟', '完善', '协调', '支持'], ['有限', '不足'])
    const follow = textScore(country.follow, ['远程', '随访', '方便', '支持', '云病房', '月'], ['不便', '有限', '薄弱'])
    const average = Math.round(((cost + wait + tech + service + follow) / 5) * 10) / 10
    return {
      ...country,
      scores: [
        { label: '费用可控性', value: cost },
        { label: '等待效率', value: wait },
        { label: '技术适配', value: tech },
        { label: '服务支持', value: service },
        { label: '后续管理', value: follow },
      ],
      average,
    }
  })
})

const scrollToPageTop = async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
  return code === 'REPORT_GENERATION_FAILED' ? 'warning' : 'error'
}

const generateFreeReport = async () => {
  submitAttempted.value = true
  markAllTouched()
  if (!isStep0Valid.value || generating.value) return

  submissionError.value = ''
  submissionErrorTone.value = 'error'
  generating.value = true
  try {
    if (await checkForUpdate({ force: true })) {
      submissionError.value = '系统已更新，请先刷新页面后再生成报告。'
      submissionErrorTone.value = 'warning'
      generating.value = false
      return
    }

    const response = await createReportSubmission(reportSubmissionPayload.value)
    submissionNo.value = response.submissionNo
    generatedReport.value = response.report
    activeFreeLayoutKey.value = response.report.layoutSections?.[0]?.key || 'cost'
    generating.value = false
    showReport.value = true
    scrollToPageTop().catch((error) => console.error(error))
  } catch (error) {
    console.error(error)
    submissionError.value = getApiErrorMessage(error, lt(localText.submitFailed))
    submissionErrorTone.value = getApiErrorTone(error)
    generating.value = false
  }
}

const nextStep = generateFreeReport

const loadExistingReport = async () => {
  const querySubmissionNo = typeof route.query.submissionNo === 'string' ? route.query.submissionNo : ''
  if (!querySubmissionNo) return

  submissionError.value = ''
  submissionErrorTone.value = 'error'
  generating.value = true
  let response: Awaited<ReturnType<typeof getReportSubmission>>
  try {
    response = await getReportSubmission(querySubmissionNo)
  } catch (error) {
    console.error(error)
    submissionError.value = getApiErrorMessage(error, lt(localText.submitFailed))
    submissionErrorTone.value = getApiErrorTone(error)
    generating.value = false
    return
  }

  submissionNo.value = response.submissionNo
  if (response.basicInfo) {
    Object.assign(form, response.basicInfo)
    form.dateOfBirth = normalizeDateInputValue(response.basicInfo.dateOfBirth)
  }
  if (response.selectedRegions?.length) {
    selectedRegions.value = response.selectedRegions
  }
  generatedReport.value = response.report
  activeFreeLayoutKey.value = response.report.layoutSections?.[0]?.key || 'cost'
  showReport.value = true
  generating.value = false
  scrollToPageTop().catch((error) => console.error(error))
}

onMounted(loadExistingReport)

const resetWizard = () => {
  showReport.value = false
  submissionError.value = ''
  submissionErrorTone.value = 'error'
  submissionNo.value = ''
  generatedReport.value = null
  selectedRegions.value = [...defaultSelectedRegions]
  selectedInsurance.value = null
  submitAttempted.value = false
  ;(Object.keys(touched) as FormField[]).forEach((field) => {
    touched[field] = false
  })
  Object.assign(form, {
    fullName: '', gender: '', dateOfBirth: '', nationality: '',
    idType: '', idNumber: '', phone: '', email: '',
    city: '', preferredLanguage: '', visitPurpose: '',
    careNeed: '', careNeedOther: '', expectedTreatmentTime: '',
    chiefComplaint: '',
  })
}
</script>

<template>
  <!-- Report Display -->
  <div v-if="showReport" class="free-report-page mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 md:py-12">
    <div class="mb-6 flex items-center justify-between flex-wrap gap-4">
      <router-link to="/" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#C05621]">
        <ArrowLeft class="h-4 w-4" />
        {{ t('cases.back') }}
      </router-link>
      <button class="text-sm font-semibold text-[#C05621] hover:underline" @click="resetWizard">
        重新填写资料
      </button>
    </div>

    <div class="overflow-hidden rounded-[18px] border border-orange-100 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <!-- Header -->
      <div class="bg-white px-4 py-6 text-slate-900 md:px-8 md:py-7">
        <div class="mb-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span class="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 font-semibold text-[#C05621]">
            <Sparkles class="h-3.5 w-3.5" />
            免费预审报告 / Free Preview
          </span>
          <span>{{ freeReportInputText }}</span>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-950 md:text-4xl">海外就医可行性评估报告</h1>
            <p class="mt-2 text-sm text-slate-500 md:text-base">{{ renderedReport.subtitle }}</p>
          </div>
          <div class="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-left md:text-right">
            <div class="text-xs text-[#C05621]">{{ t('report.reportId') }}</div>
            <div class="font-mono text-base font-bold text-slate-950 md:text-lg">{{ renderedReport.id }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ renderedReport.date }}</div>
          </div>
        </div>
        <div class="mt-5 grid gap-3 md:grid-cols-4">
          <div v-for="item in reportHeroMeta" :key="item.label" class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div class="text-xs text-slate-500">{{ item.label }}</div>
            <div class="mt-1 truncate text-sm font-semibold text-slate-900">{{ item.value }}</div>
          </div>
        </div>
      </div>

      <div v-if="freeLayoutSections.length" class="space-y-6 bg-[#f7f8fb] p-4 text-slate-900 md:p-8">
        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
          <div class="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
                <DollarSign class="h-5 w-5 text-[#DD6B20]" />
                全球治疗方案费用总览
              </h2>
              <p class="mt-1 text-sm text-slate-500">以下为预估区间，最终以医院正式报价、检查结果和治疗强度为准。</p>
            </div>
            <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#C05621]">{{ costSavingsText }}</span>
          </div>

          <div class="mb-5 grid gap-4 md:grid-cols-2">
            <div class="rounded-xl bg-orange-50 p-5">
              <div class="text-xs font-semibold uppercase tracking-wide text-[#C05621]">China Estimated Total</div>
              <div class="mt-2 text-2xl font-black text-slate-950">{{ chinaCostCountry?.fee || renderedReport.totalCost }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ chinaCostCountry?.name || '中国方案' }}</div>
            </div>
            <div class="rounded-xl bg-slate-50 p-5">
              <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Reference Market</div>
              <div class="mt-2 text-2xl font-black text-slate-950">{{ referenceCostCountry?.fee || '-' }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ referenceCostCountry?.name || '对比地区' }}</div>
            </div>
          </div>

          <div class="space-y-3">
            <div v-for="country in countryCostBars" :key="country.name" class="grid gap-2 md:grid-cols-[120px_1fr_150px] md:items-center">
              <div class="truncate text-sm font-semibold text-slate-700">{{ country.flag }} {{ country.name }}</div>
              <div class="h-3 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-[#F2A365]" :style="{ width: `${country.width}%` }"></div>
              </div>
              <div class="text-sm font-semibold text-[#C05621] md:text-right">{{ country.fee }}</div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
          <div class="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
                <Building2 class="h-5 w-5 text-[#DD6B20]" />
                {{ recommendationTitle }}
              </h2>
              <p class="mt-1 text-sm text-slate-500">{{ recommendationDescription }}</p>
            </div>
          </div>
          <div :class="hospitalGridClass">
            <article
              v-for="hospital in hospitalDetailProfiles"
              :key="hospital.key"
              :class="[
                'overflow-hidden rounded-xl border bg-slate-50 transition-all',
                expandedHospital === hospital.key ? 'border-orange-200 shadow-sm ring-1 ring-orange-100' : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50/40',
              ]"
            >
              <button
                type="button"
                class="w-full p-4 text-left"
                :aria-expanded="expandedHospital === hospital.key"
                @click="toggleHospital(hospital.key)"
              >
                <div class="mb-3 flex items-start justify-between gap-3">
                  <span
                    :class="[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                      hospital.rank === 1 ? 'bg-[#DD6B20]' : hospital.rank === 2 ? 'bg-slate-400' : 'bg-orange-500',
                    ]"
                  >
                    {{ hospital.rank }}
                  </span>
                  <div v-if="hospital.matchScore !== undefined" class="text-right">
                    <div class="text-2xl font-black leading-none text-[#14B8A6]">{{ hospital.matchScore }}%</div>
                    <div class="mt-1 text-[11px] font-medium text-slate-400">匹配度 / Match</div>
                  </div>
                </div>

                <h3 class="text-base font-bold leading-6 text-slate-950">{{ hospital.name }}</h3>
                <p v-if="hospital.englishName" class="mt-1 text-sm leading-5 text-slate-500">{{ hospital.englishName }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ hospital.city }}</p>

                <div
                  v-if="hospital.rankLabel"
                  class="mt-4 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-semibold leading-6 text-teal-700"
                >
                  {{ hospital.rankLabel }}
                </div>

                <div v-if="hospital.tags.length" class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="tag in hospital.tags"
                    :key="`${hospital.key}-${tag}`"
                    class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-100"
                  >
                    {{ tag }}
                  </span>
                </div>

                <dl v-if="hospital.internationalPatients || hospital.waitTime" class="mt-4 grid gap-2 text-sm">
                  <div v-if="hospital.internationalPatients" class="flex items-center justify-between gap-3">
                    <dt class="text-slate-500">国际患者 / Intl Patients</dt>
                    <dd class="font-bold text-slate-900">{{ hospital.internationalPatients }}</dd>
                  </div>
                  <div v-if="hospital.waitTime" class="flex items-center justify-between gap-3">
                    <dt class="text-slate-500">等待时间 / Wait Time</dt>
                    <dd class="font-bold text-[#14B8A6]">{{ hospital.waitTime }}</dd>
                  </div>
                </dl>

                <div class="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-semibold">
                  <span :class="hospital.bestMatch ? 'text-[#C05621]' : 'text-slate-500'">
                    <Star v-if="hospital.bestMatch" class="mr-1 inline h-4 w-4 align-[-2px] text-[#ED8936]" />
                    {{ hospital.bestMatch ? '最佳匹配 / Best Match' : '点击查看详情 / View Details' }}
                  </span>
                  <component :is="expandedHospital === hospital.key ? ChevronUp : ChevronDown" class="h-4 w-4 text-slate-400" />
                </div>
              </button>

              <div v-if="expandedHospital === hospital.key" class="border-t border-orange-100 bg-white px-4 pb-4 pt-4">
                <p class="text-sm leading-6 text-slate-600">{{ hospital.reason }}</p>
                <div v-if="hospital.detailItems.length" class="mt-4 grid gap-3">
                  <div
                    v-for="item in hospital.detailItems"
                    :key="`${hospital.key}-${item.label}`"
                    class="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div class="mb-1 text-xs font-semibold text-[#C05621]">{{ item.label }}</div>
                    <p class="text-sm leading-6 text-slate-700">{{ item.value }}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div class="mt-5 rounded-xl border border-orange-200 bg-orange-50/70 p-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div class="flex items-start gap-3 text-sm font-semibold leading-6 text-[#9A4A1E]">
                <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-[#DD6B20]" />
                <p>
                  想要更精准的医院推荐?升级到专业版，获取包含副主任医师审核的个性化医院匹配分析、指定专家预约、以及VIP号源预留服务。
                </p>
              </div>
              <router-link
                :to="professionalReportLink"
                class="inline-flex shrink-0 items-center justify-center gap-1 text-sm font-bold text-[#C05621] underline decoration-orange-300 underline-offset-4 transition hover:text-[#DD6B20]"
              >
                Upgrade to Pro ->
              </router-link>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
          <div class="mb-5">
            <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
              <HeartPulse class="h-5 w-5 text-[#DD6B20]" />
              我的治疗路径与费用拆分
            </h2>
            <p class="mt-1 text-sm text-slate-500">先完成资料复核和专科判断，再确认治疗方案、预算和在华停留时间。</p>
          </div>

          <div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div class="space-y-3">
              <div class="rounded-xl border border-orange-100 bg-orange-50 p-4">
                <div class="text-xs font-semibold text-[#C05621]">推荐诊疗方向</div>
                <p class="mt-2 text-sm leading-6 text-slate-800">{{ renderedReport.direction }}</p>
              </div>
              <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div class="text-xs font-semibold text-slate-500">预计在华安排</div>
                <p class="mt-2 text-sm leading-6 text-slate-800">{{ renderedReport.duration }}</p>
              </div>
              <div class="rounded-xl border border-slate-100 bg-white p-4">
                <div class="text-xs font-semibold text-slate-500">核心诉求</div>
                <p class="mt-2 text-sm leading-6 text-slate-700">{{ renderedReport.need }}</p>
              </div>
            </div>

            <div class="self-start rounded-xl border border-orange-100 bg-white p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-slate-950">AI费用汇总</h3>
                  <p class="mt-1 text-xs leading-5 text-slate-500">
                    费用细项、美元折算和节省比例由医疗模型按本次信息返回。
                  </p>
                </div>
                <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#C05621]">
                  {{ modelCostSummary?.chinaTotal || renderedReport.totalCost }}
                </span>
              </div>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-lg bg-slate-50 p-3">
                  <div class="text-xs text-slate-500">本次中国方案</div>
                  <div class="mt-1 text-lg font-black text-slate-950">{{ modelCostSummary?.chinaTotal || renderedReport.totalCost }}</div>
                </div>
                <div class="rounded-lg bg-slate-50 p-3">
                  <div class="text-xs text-slate-500">{{ modelCostSummary?.referenceCountry || '对比治疗地' }}</div>
                  <div class="mt-1 text-lg font-black text-slate-950">{{ modelCostSummary?.referenceCost || '需模型返回' }}</div>
                </div>
              </div>
              <p v-if="renderedReport.costBreakdown?.currencyNote" class="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs leading-5 text-[#9A4A1E]">
                {{ renderedReport.costBreakdown.currencyNote }}
              </p>
            </div>
          </div>

          <div v-if="costBreakdownCategories.length" class="mt-5 grid gap-4 xl:grid-cols-3">
            <div
              v-for="group in costBreakdownCategories"
              :key="group.key"
              class="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div class="mb-3 flex items-start gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#DD6B20]">
                  <component :is="group.icon" class="h-4 w-4" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-950">{{ group.category.title }}</h3>
                  <p class="mt-1 text-xs leading-5 text-slate-500">{{ group.subtitle }}</p>
                </div>
              </div>
              <div class="mb-3 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                <span class="text-xs font-semibold text-slate-500">小计</span>
                <span class="text-sm font-bold text-[#C05621]">{{ group.category.subtotal }}</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="item in group.category.items"
                  :key="`${group.key}-${item.item}`"
                  class="rounded-lg bg-white px-3 py-2 text-xs"
                >
                  <div class="flex items-start justify-between gap-3">
                    <span class="leading-5 text-slate-600">{{ item.item }}</span>
                    <span class="whitespace-nowrap font-semibold text-slate-900">{{ item.cost }}</span>
                  </div>
                  <p v-if="item.note" class="mt-1 leading-5 text-slate-400">{{ item.note }}</p>
                </div>
              </div>
              <p v-if="group.category.tip" class="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-500">
                {{ group.category.tip }}
              </p>
            </div>
          </div>
          <div v-else class="mt-5 overflow-hidden rounded-xl border border-amber-100 bg-amber-50/60">
            <div class="border-b border-amber-100 px-4 py-3">
              <h3 class="font-semibold text-slate-950">医疗模型暂未返回三类费用细分</h3>
              <p class="mt-1 text-xs leading-5 text-slate-500">以下仅展示兼容字段中的原始费用项，系统不会自行归类或补算。</p>
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-amber-100 bg-white">
                <tr v-for="item in renderedReport.breakdown" :key="item.item">
                  <td class="px-4 py-3 leading-6 text-slate-700">{{ item.item }}</td>
                  <td class="whitespace-nowrap px-4 py-3 text-right font-semibold text-[#C05621]">{{ item.cost }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="modelCostSummary" class="mt-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-4 text-center">
            <p class="text-sm font-bold leading-6 text-[#C05621]">{{ modelCostSummary.formula }}</p>
            <p class="mt-2 text-sm font-bold leading-6 text-slate-900">{{ modelCostSummary.savingsText }}</p>
          </div>
          <div v-else class="mt-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-center text-sm font-semibold text-[#C05621]">
            费用细分、总公式和节省比例需由医疗模型返回；最终以医院正式报价、检查结果和治疗强度为准。
          </div>
        </section>

        <section v-if="advancedCareInsights" class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
          <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
                <Microscope class="h-5 w-5 text-[#DD6B20]" />
                前沿疗法与新药可及性推荐
              </h2>
              <p class="mt-1 text-sm leading-6 text-slate-500">{{ advancedCareInsights.context }}</p>
            </div>
            <span class="inline-flex w-fit items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#C05621]">
              AI医疗模型生成
            </span>
          </div>

          <div class="grid gap-4 xl:grid-cols-3">
            <article
              v-for="therapy in advancedCareInsights.therapies"
              :key="therapy.name"
              class="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div class="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold text-[#C05621]">{{ therapy.category }}</div>
                  <h3 class="mt-1 text-base font-bold leading-6 text-slate-950">{{ therapy.name }}</h3>
                </div>
                <span class="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-100">
                  {{ therapy.recommendationLevel }}
                </span>
              </div>
              <p class="text-sm leading-6 text-slate-700">{{ therapy.summary }}</p>
              <div class="mt-4 grid gap-2 text-xs">
                <div class="rounded-lg bg-white p-3">
                  <div class="font-semibold text-slate-500">适用前提</div>
                  <p class="mt-1 leading-5 text-slate-700">{{ therapy.applicableFor }}</p>
                </div>
                <div class="rounded-lg bg-white p-3">
                  <div class="font-semibold text-slate-500">治疗机制</div>
                  <p class="mt-1 leading-5 text-slate-700">{{ therapy.mechanism }}</p>
                </div>
                <div class="rounded-lg bg-white p-3">
                  <div class="font-semibold text-slate-500">中国可及性</div>
                  <p class="mt-1 leading-5 text-slate-700">{{ therapy.chinaAccess }}</p>
                </div>
              </div>
              <div class="mt-4 grid gap-2 sm:grid-cols-2">
                <div class="rounded-lg bg-orange-50 p-3">
                  <div class="text-xs font-semibold text-[#C05621]">中国预估</div>
                  <div class="mt-1 text-sm font-black text-slate-950">{{ therapy.estimatedCost }}</div>
                </div>
                <div v-if="therapy.referenceCost" class="rounded-lg bg-white p-3">
                  <div class="text-xs font-semibold text-slate-500">参考市场</div>
                  <div class="mt-1 text-sm font-black text-slate-950">{{ therapy.referenceCost }}</div>
                </div>
              </div>
              <div class="mt-4 space-y-2 text-xs leading-5">
                <p class="rounded-lg bg-white p-3 text-teal-700">{{ therapy.advantage }}</p>
                <p class="rounded-lg bg-white p-3 text-slate-600">{{ therapy.evidence }}</p>
                <p class="rounded-lg bg-amber-50 p-3 text-amber-700">{{ therapy.limitations }}</p>
                <p class="rounded-lg bg-white p-3 font-semibold text-slate-700">{{ therapy.nextStep }}</p>
              </div>
              <div v-if="therapy.tags?.length" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="tag in therapy.tags"
                  :key="`${therapy.name}-${tag}`"
                  class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-100"
                >
                  {{ tag }}
                </span>
              </div>
            </article>
          </div>

          <div class="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div class="mb-4 flex items-start gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#DD6B20]">
                  <Pill class="h-4 w-4" />
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-950">{{ advancedCareInsights.drugCostComparison.title }}</h3>
                  <p class="mt-1 text-xs leading-5 text-slate-500">{{ advancedCareInsights.drugCostComparison.summary }}</p>
                </div>
              </div>
              <p class="mb-4 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-600">
                {{ advancedCareInsights.drugCostComparison.basis }}
              </p>
              <div class="space-y-3">
                <article
                  v-for="drug in advancedCareInsights.drugCostComparison.items"
                  :key="drug.drugName"
                  class="rounded-lg bg-white p-3"
                >
                  <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 class="text-sm font-bold text-slate-950">{{ drug.drugName }}</h4>
                      <p class="mt-0.5 text-xs text-slate-400">{{ drug.drugClass }}</p>
                    </div>
                    <span class="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">{{ drug.savingInsight }}</span>
                  </div>
                  <div class="grid gap-3 md:grid-cols-2">
                    <div class="rounded-lg bg-orange-50 p-3">
                      <div class="text-xs font-semibold text-[#C05621]">{{ drug.chinaOption }}</div>
                      <div class="mt-1 text-sm font-black text-slate-950">{{ drug.chinaCost }}</div>
                    </div>
                    <div class="rounded-lg bg-slate-50 p-3">
                      <div class="text-xs font-semibold text-slate-500">{{ drug.referenceOption }}</div>
                      <div class="mt-1 text-sm font-black text-slate-950">{{ drug.referenceCost }}</div>
                    </div>
                  </div>
                  <p class="mt-3 text-xs leading-5 text-slate-600">{{ drug.efficacyEquivalence }}</p>
                  <p class="mt-2 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-500">{{ drug.eligibility }}</p>
                  <p v-if="drug.note" class="mt-2 text-xs leading-5 text-slate-400">{{ drug.note }}</p>
                </article>
              </div>
              <p class="mt-3 text-xs leading-5 text-slate-500">{{ advancedCareInsights.drugCostComparison.note }}</p>
            </div>

            <div class="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
              <div class="mb-4">
                <div class="text-xs font-semibold text-[#C05621]">{{ advancedCareInsights.newDrugCureAssessment.headline }}</div>
                <h3 class="mt-1 text-base font-bold leading-6 text-slate-950">{{ advancedCareInsights.newDrugCureAssessment.answer }}</h3>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ advancedCareInsights.newDrugCureAssessment.summary }}</p>
              </div>
              <div class="space-y-3">
                <article
                  v-for="item in advancedCareInsights.newDrugCureAssessment.items"
                  :key="item.name"
                  class="rounded-lg bg-white p-3"
                >
                  <div class="mb-2 flex flex-wrap items-center gap-2">
                    <h4 class="text-sm font-bold text-slate-950">{{ item.name }}</h4>
                    <span class="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">{{ item.type }}</span>
                  </div>
                  <p class="text-xs leading-5 text-slate-600">{{ item.applicableFor }}</p>
                  <div class="mt-3 grid gap-2 text-xs leading-5">
                    <p class="rounded-lg bg-slate-50 p-2 text-slate-600">{{ item.evidence }}</p>
                    <p class="rounded-lg bg-slate-50 p-2 text-slate-600">{{ item.chinaAvailability }}</p>
                    <p class="rounded-lg bg-teal-50 p-2 text-teal-700">{{ item.potentialRole }}</p>
                    <p class="rounded-lg bg-amber-50 p-2 text-amber-700">{{ item.limitations }}</p>
                    <p class="rounded-lg bg-slate-50 p-2 font-semibold text-slate-700">{{ item.nextStep }}</p>
                  </div>
                </article>
              </div>
              <div v-if="advancedCareInsights.newDrugCureAssessment.ctaItems.length" class="mt-4 rounded-lg bg-white p-3">
                <div class="text-xs font-semibold text-[#C05621]">下一步确认事项</div>
                <ul class="mt-2 space-y-1 text-xs leading-5 text-slate-700">
                  <li v-for="item in advancedCareInsights.newDrugCureAssessment.ctaItems" :key="item" class="flex gap-2">
                    <CheckCircle class="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="mt-5 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs leading-5 text-[#9A4A1E]">
            <p>{{ advancedCareInsights.currencyNote }}</p>
            <p class="mt-1">{{ advancedCareInsights.disclaimer }}</p>
          </div>
        </section>

        <section
          v-for="section in designedFreeLayoutSections"
          :key="section.key"
          class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-6"
        >
          <div class="mb-5">
            <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
              <component :is="getReportLayoutIcon(section.icon)" class="h-5 w-5 text-[#DD6B20]" />
              {{ section.label }}
            </h2>
            <p v-if="section.labelEn" class="mt-1 text-xs text-slate-400">{{ section.labelEn }}</p>
          </div>

          <div v-if="section.key === 'technology'" class="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="font-semibold text-slate-950">维度评分展开</h3>
                <p class="mt-1 text-xs leading-5 text-slate-500">基于本报告中的费用、等待、技术、服务和随访信息做预审可视化，最终选择仍需医生和医院复核。</p>
              </div>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C05621]">1-10 分参考</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[760px] text-xs">
                <thead>
                  <tr class="text-left text-slate-500">
                    <th class="px-3 py-2 font-medium">国家/地区</th>
                    <th class="px-3 py-2 font-medium">综合</th>
                    <th
                      v-for="dimension in countryScoreRows[0]?.scores || []"
                      :key="dimension.label"
                      class="px-3 py-2 font-medium"
                    >
                      {{ dimension.label }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="country in countryScoreRows" :key="country.name" :class="country.recommended ? 'bg-orange-50' : ''">
                    <td class="px-3 py-3 font-semibold text-slate-800">{{ country.flag }} {{ country.name }}</td>
                    <td class="px-3 py-3 font-bold text-[#C05621]">{{ country.average }}</td>
                    <td v-for="score in country.scores" :key="score.label" class="px-3 py-3">
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div class="h-full rounded-full bg-[#DD6B20]" :style="{ width: `${score.value * 10}%` }"></div>
                        </div>
                        <span class="font-medium text-slate-700">{{ score.value }}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <article
            v-for="block in section.blocks"
            v-show="hasLayoutBlockContent(block)"
            :key="`${section.key}-${block.title}`"
            :class="['mb-4 rounded-xl border p-4 last:mb-0', lightToneClass(block.tone)]"
          >
            <div class="mb-3">
              <h3 class="flex items-center gap-2 font-semibold text-slate-950">
                <component :is="getReportLayoutIcon(section.icon)" class="h-4 w-4 text-[#DD6B20]" />
                {{ block.title }}
              </h3>
              <p v-if="block.titleEn" class="mt-0.5 text-xs text-slate-400">{{ block.titleEn }}</p>
              <p v-if="block.description" class="mt-2 text-sm leading-6 text-slate-600">{{ block.description }}</p>
            </div>

            <div v-if="block.metrics?.length" class="grid gap-3 md:grid-cols-3">
              <div
                v-for="metric in block.metrics"
                :key="metric.label"
                :class="['rounded-lg border p-3', lightToneClass(metric.tone)]"
              >
                <div class="text-xs text-slate-500">{{ metric.label }}</div>
                <div :class="['mt-1 text-lg font-bold', lightToneTextClass(metric.tone)]">{{ metric.value }}</div>
                <p v-if="metric.detail" class="mt-2 text-xs leading-5 text-slate-500">{{ metric.detail }}</p>
              </div>
            </div>

            <div v-if="block.cards?.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div
                v-for="card in block.cards"
                :key="`${card.title}-${card.subtitle || ''}`"
                :class="['rounded-lg border p-3', lightToneClass(card.tone)]"
              >
                <div class="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 class="text-sm font-semibold text-slate-950">{{ card.title }}</h4>
                    <p v-if="card.subtitle" class="mt-0.5 text-[11px] text-slate-400">{{ card.subtitle }}</p>
                  </div>
                  <span v-if="card.tag" class="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-[#C05621]">{{ card.tag }}</span>
                </div>
                <div v-if="card.value" :class="['mb-2 text-sm font-bold', lightToneTextClass(card.tone)]">{{ card.value }}</div>
                <p v-if="card.description" class="text-xs leading-5 text-slate-600">{{ card.description }}</p>
                <p v-if="card.detail" class="mt-2 rounded-lg bg-slate-50 p-2 text-[11px] leading-5 text-slate-500">{{ card.detail }}</p>
              </div>
            </div>

            <div v-if="block.table" class="overflow-x-auto rounded-lg border border-slate-100">
              <table class="w-full min-w-[720px] text-xs">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th v-for="column in block.table.columns" :key="column" class="px-3 py-2 text-left font-medium">{{ column }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr
                    v-for="(row, rowIndex) in block.table.rows"
                    :key="rowIndex"
                    :class="row.highlight ? 'bg-orange-50' : 'hover:bg-slate-50'"
                  >
                    <td v-for="(cell, cellIndex) in row.cells" :key="cellIndex" class="px-3 py-2 leading-5 text-slate-700">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="block.timeline?.length" class="space-y-3">
              <div v-for="(item, index) in block.timeline" :key="`${item.time}-${item.title}`" class="flex gap-3">
                <div class="flex shrink-0 flex-col items-center">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-[#C05621]">{{ index + 1 }}</div>
                  <div v-if="index < (block.timeline?.length || 0) - 1" class="my-1 h-full min-h-8 w-px bg-orange-100"></div>
                </div>
                <div class="flex-1 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <h4 class="text-sm font-semibold text-slate-950">{{ item.title }}</h4>
                    <span class="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">{{ item.time }}</span>
                  </div>
                  <p v-if="item.description" class="text-xs leading-5 text-slate-500">{{ item.description }}</p>
                  <ul v-if="item.items?.length" class="mt-2 space-y-1 text-xs leading-5 text-slate-700">
                    <li v-for="task in item.items" :key="task" class="flex gap-2">
                      <CheckCircle class="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{{ task }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <ul v-if="block.items?.length" class="space-y-2 text-sm leading-6 text-slate-700">
              <li v-for="item in block.items" :key="item" class="flex gap-2">
                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DD6B20]"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </article>
        </section>

        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
          <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div class="max-w-2xl">
              <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-[#C05621]">
                <BookOpen class="h-3.5 w-3.5" />
                专业版报告示例 / Pro Report Sample
              </div>
              <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
                <FileText class="h-5 w-5 text-[#DD6B20]" />
                想知道专业版报告包含哪些内容? / What's in the Pro Report?
              </h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                以下是一份专业版精准评估报告的完整示例，包含病情解读、治疗路径、费用明细、保险评估和防复发随访体系。
              </p>
            </div>
            <button
              type="button"
              class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#DD6B20] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#C05621]"
              @click="openProSampleReport"
            >
              <BookOpen class="h-4 w-4" />
              查看专业版报告示例 View Sample Report
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
          <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
                <Sparkles class="h-5 w-5 text-[#DD6B20]" />
                专业评估服务包
              </h2>
              <p class="mt-1 text-sm leading-6 text-slate-500">从书面评估到专家视频面诊，再到多学科深度会诊，按资料完整度和决策复杂度选择。</p>
            </div>
            <span class="inline-flex w-fit items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#C05621]">
              副主任医师审核起
            </span>
          </div>

          <div class="grid gap-4 xl:grid-cols-3">
            <article
              v-for="pkg in renderedReport.packages"
              :key="pkg.name"
              :class="['relative flex flex-col rounded-xl border p-4', pkg.badge ? 'pt-7' : '', packageToneClass(pkg)]"
            >
              <div
                v-if="pkg.badge"
                class="absolute -top-3 left-1/2 min-w-[180px] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#DD6B20] px-3 py-1 text-center text-xs font-bold text-white shadow-sm"
              >
                {{ pkg.badge }}
              </div>
              <div class="mb-4 flex items-start gap-3">
                <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', packageIconClass(pkg)]">
                  <component :is="pkgIconMap[pkg.icon] || FileText" class="h-5 w-5" />
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-bold text-slate-950">{{ pkg.name }}</h3>
                  <p v-if="pkg.subtitle" class="mt-1 text-xs leading-5 text-slate-500">{{ pkg.subtitle }}</p>
                </div>
              </div>

              <div class="mb-4 rounded-lg bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100">
                <div class="text-3xl font-black leading-none text-slate-950">{{ pkg.price }}</div>
                <div v-if="pkg.originalPrice" class="mt-2 text-sm font-semibold text-slate-400 line-through">{{ pkg.originalPrice }}</div>
              </div>

              <ul class="flex-1 space-y-2">
                <li
                  v-for="feature in pkg.featureDetails || pkg.features.map((feature) => ({ label: feature, status: 'included' }))"
                  :key="`${pkg.name}-${feature.label}`"
                  :class="['flex items-start gap-2 text-sm leading-6', packageFeatureClass(feature.status)]"
                >
                  <component :is="packageFeatureIcon(feature.status)" :class="['mt-1 h-4 w-4 shrink-0', packageFeatureIconClass(feature.status)]" />
                  <span>{{ feature.label }}</span>
                </li>
              </ul>

              <router-link
                :to="professionalReportLink"
                :class="[
                  'mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-colors',
                  pkg.highlight
                    ? 'bg-[#DD6B20] text-white shadow-sm hover:bg-[#C05621]'
                    : 'border border-orange-200 bg-white text-[#C05621] hover:bg-orange-50',
                ]"
              >
                {{ pkg.cta || lt(localText.choosePackage) }}
              </router-link>
              <p v-if="pkg.footnote" class="mt-3 text-center text-xs leading-5 text-slate-400">{{ pkg.footnote }}</p>
            </article>
          </div>

          <div class="mt-5 rounded-xl border border-orange-100 bg-orange-50/70 p-4">
            <h3 class="font-semibold text-slate-950">{{ lt(localText.highlights) }}</h3>
            <div class="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              <div v-for="h in renderedReport.highlights" :key="h" class="flex items-start gap-2 text-sm leading-6 text-slate-700">
                <Star class="mt-1 h-4 w-4 shrink-0 text-[#ED8936]" />
                <span>{{ h }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm md:p-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
                <Sparkles class="h-5 w-5 text-[#DD6B20]" />
                专业版评估报告
              </h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">补充完整资料后生成带多 Tab 排版的专业报告。</p>
            </div>
            <router-link
              :to="professionalReportLink"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DD6B20] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#C05621] transition-colors"
            >
              生成专业报告
              <ArrowRight class="h-4 w-4" />
            </router-link>
          </div>
        </section>
      </div>

      <div v-else class="p-4 md:p-8 space-y-8 md:space-y-10">
        <!-- Section 1: Patient Summary -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section1') }}</h2>
          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div class="rounded-xl bg-orange-50/50 p-4 border border-orange-100">
              <div class="text-gray-500 mb-1">{{ t('report.diagnosis') }}</div>
              <div class="font-semibold text-gray-900">{{ renderedReport.disease }}</div>
            </div>
            <div class="rounded-xl bg-orange-50/50 p-4 border border-orange-100">
              <div class="text-gray-500 mb-1">{{ lt(localText.coreNeed) }}</div>
              <div class="font-semibold text-gray-900 line-clamp-2">{{ renderedReport.need }}</div>
            </div>
            <div class="rounded-xl bg-orange-50/50 p-4 border border-orange-100">
              <div class="text-gray-500 mb-1">{{ lt(localText.compareRegions) }}</div>
              <div class="font-semibold text-gray-900">{{ selectedRegionText }}</div>
            </div>
          </div>
          <div class="mt-4 grid md:grid-cols-4 gap-3 text-sm">
            <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div class="text-gray-500 mb-1">{{ t('report.patient') }}</div>
              <div class="font-medium text-gray-900">{{ form.fullName || '-' }}</div>
            </div>
            <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div class="text-gray-500 mb-1">{{ t('report.nationality') }}</div>
              <div class="font-medium text-gray-900">{{ nationalityLabel }}</div>
            </div>
            <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div class="text-gray-500 mb-1">{{ t('report.preferredLanguage') }}</div>
              <div class="font-medium text-gray-900">{{ languageLabel }}</div>
            </div>
            <div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div class="text-gray-500 mb-1">{{ t('report.email') }}</div>
              <div class="font-medium text-gray-900 break-all">{{ form.email || '-' }}</div>
            </div>
          </div>
        </section>

        <!-- Section 2: Country Comparison -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section2') }}</h2>
          <div class="space-y-3">
            <div
              v-for="c in renderedReport.countries"
              :key="c.name"
              :class="[
                'rounded-xl border transition-all',
                c.recommended ? 'border-[#DD6B20] bg-orange-50/30' : 'border-gray-200 bg-white',
              ]"
            >
              <button
                class="w-full text-left px-5 py-4 flex items-center justify-between"
                @click="expandedCountry = expandedCountry === c.name ? null : c.name"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ c.flag }}</span>
                  <span :class="['font-bold', c.recommended ? 'text-[#C05621]' : 'text-gray-900']">
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
              <div class="text-4xl font-extrabold">{{ scoreDisplayValue }}</div>
              <div class="text-sm text-orange-100 mt-1">{{ scoreDisplayCaption }}</div>
            </div>
            <div v-for="a in renderedReport.advantages" :key="a.label" class="rounded-xl bg-orange-50 border border-orange-100 p-6 text-center">
              <div class="text-lg font-bold text-[#C05621]">{{ a.value }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ a.label }}</div>
            </div>
          </div>
          <div class="rounded-xl border border-gray-200 overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700 w-[30%]">{{ t('report.concern') }}</th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-700">{{ t('report.languageSol') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="c in renderedReport.concerns" :key="c.concern">
                  <td class="px-4 py-3 text-gray-800 font-medium">{{ c.concern }}</td>
                  <td class="px-4 py-3 text-gray-700">{{ c.solution }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Section 4: Hospitals -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ recommendationTitle }}</h2>
          <div :class="hospitalGridClass">
            <article
              v-for="hospital in hospitalDetailProfiles"
              :key="hospital.key"
              :class="[
                'overflow-hidden rounded-xl border bg-orange-50/30 transition-all',
                expandedHospital === hospital.key ? 'border-orange-200 shadow-sm ring-1 ring-orange-100' : 'border-orange-100 hover:bg-orange-50',
              ]"
            >
              <button
                type="button"
                class="w-full p-5 text-left"
                :aria-expanded="expandedHospital === hospital.key"
                @click="toggleHospital(hospital.key)"
              >
                <div class="mb-3 flex items-start justify-between gap-3">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DD6B20] text-sm font-bold text-white">{{ hospital.rank }}</span>
                  <div v-if="hospital.matchScore !== undefined" class="text-right">
                    <div class="text-2xl font-black leading-none text-[#14B8A6]">{{ hospital.matchDisplay }}</div>
                    <div class="mt-1 text-[11px] font-medium text-slate-400">{{ hospital.matchCaption }}</div>
                  </div>
                </div>
                <h4 class="font-bold text-gray-900">{{ hospital.name }}</h4>
                <p v-if="hospital.englishName" class="mt-1 text-sm text-gray-500">{{ hospital.englishName }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ hospital.city }}</p>
                <div
                  v-if="hospital.rankLabel"
                  class="mt-3 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-semibold leading-6 text-teal-700"
                >
                  {{ hospital.rankLabel }}
                </div>
                <div v-if="hospital.tags.length" class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="tag in hospital.tags"
                    :key="`${hospital.key}-${tag}`"
                    class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 ring-1 ring-orange-100"
                  >
                    {{ tag }}
                  </span>
                </div>
                <dl v-if="hospital.internationalPatients || hospital.waitTime" class="mt-4 grid gap-2 text-sm">
                  <div v-if="hospital.internationalPatients" class="flex items-center justify-between gap-3">
                    <dt class="text-gray-500">国际患者 / Intl Patients</dt>
                    <dd class="font-bold text-gray-900">{{ hospital.internationalPatients }}</dd>
                  </div>
                  <div v-if="hospital.waitTime" class="flex items-center justify-between gap-3">
                    <dt class="text-gray-500">等待时间 / Wait Time</dt>
                    <dd class="font-bold text-[#14B8A6]">{{ hospital.waitTime }}</dd>
                  </div>
                </dl>
                <p class="mt-3 text-sm leading-6 text-gray-600">{{ hospital.reason }}</p>
                <div class="mt-4 flex items-center justify-between border-t border-orange-100 pt-3 text-sm font-semibold text-[#C05621]">
                  <span>{{ expandedHospital === hospital.key ? '收起详情' : '点击展开医院详情' }}</span>
                  <component :is="expandedHospital === hospital.key ? ChevronUp : ChevronDown" class="h-4 w-4 text-slate-400" />
                </div>
              </button>
              <div v-if="expandedHospital === hospital.key" class="border-t border-orange-100 bg-white px-5 pb-5 pt-4">
                <p class="text-sm leading-6 text-slate-600">{{ hospital.reason }}</p>
                <div v-if="hospital.detailItems.length" class="mt-4 grid gap-3">
                  <div
                    v-for="item in hospital.detailItems"
                    :key="`${hospital.key}-${item.label}`"
                    class="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div class="mb-1 text-xs font-semibold text-[#C05621]">{{ item.label }}</div>
                    <p class="text-sm leading-6 text-slate-700">{{ item.value }}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div class="mt-5 rounded-xl border border-orange-200 bg-orange-50/70 p-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div class="flex items-start gap-3 text-sm font-semibold leading-6 text-[#9A4A1E]">
                <AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-[#DD6B20]" />
                <p>
                  想要更精准的医院推荐?升级到专业版，获取包含副主任医师审核的个性化医院匹配分析、指定专家预约、以及VIP号源预留服务。
                </p>
              </div>
              <router-link
                :to="professionalReportLink"
                class="inline-flex shrink-0 items-center justify-center gap-1 text-sm font-bold text-[#C05621] underline decoration-orange-300 underline-offset-4 transition hover:text-[#DD6B20]"
              >
                Upgrade to Pro ->
              </router-link>
            </div>
          </div>
        </section>

        <!-- Section 5: Plan -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section5') }}</h2>
          <div class="space-y-4">
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500 mb-1">{{ t('report.direction') }}</div>
              <div class="font-medium text-gray-900">{{ renderedReport.direction }}</div>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500 mb-1">{{ t('report.duration') }}</div>
              <div class="font-medium text-gray-900">{{ renderedReport.duration }}</div>
            </div>
            <div class="rounded-xl border border-gray-200 overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold text-gray-700">{{ lt(localText.costItem) }}</th>
                    <th class="px-4 py-3 text-right font-semibold text-gray-700">{{ lt(localText.estimatedCost) }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="b in renderedReport.breakdown" :key="b.item">
                    <td class="px-4 py-3 text-gray-800">{{ b.item }}</td>
                    <td class="px-4 py-3 text-right text-[#C05621] font-semibold whitespace-nowrap">{{ b.cost }}</td>
                  </tr>
                  <tr class="bg-orange-50">
                    <td class="px-4 py-3 font-bold text-gray-900">{{ t('report.total') }}</td>
                    <td class="px-4 py-3 text-right font-bold text-[#C05621] whitespace-nowrap">{{ renderedReport.totalCost }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <div class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
            <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div class="max-w-2xl">
                <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-[#C05621]">
                  <BookOpen class="h-3.5 w-3.5" />
                  专业版报告示例 / Pro Report Sample
                </div>
                <h2 class="flex items-center gap-2 text-lg font-bold text-slate-950">
                  <FileText class="h-5 w-5 text-[#DD6B20]" />
                  想知道专业版报告包含哪些内容? / What's in the Pro Report?
                </h2>
                <p class="mt-2 text-sm leading-6 text-slate-500">
                  以下是一份专业版精准评估报告的完整示例，包含病情解读、治疗路径、费用明细、保险评估和防复发随访体系。
                </p>
              </div>
              <button
                type="button"
                class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#DD6B20] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#C05621]"
                @click="openProSampleReport"
              >
                <BookOpen class="h-4 w-4" />
                查看专业版报告示例 View Sample Report
              </button>
            </div>
          </div>
        </section>

        <!-- Section 6: Upgrade -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-orange-100">{{ t('report.section6') }}</h2>
          <div class="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4 md:p-8">
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div
                v-for="pkg in renderedReport.packages"
                :key="pkg.name"
                :class="[
                  'rounded-2xl border p-6 flex flex-col',
                  pkg.badge || pkg.highlight ? 'pt-8' : '',
                  pkg.highlight ? 'border-[#DD6B20] bg-orange-50/70 shadow-lg relative' : 'border-gray-200 bg-white',
                ]"
              >
                <div
                  v-if="pkg.badge || pkg.highlight"
                  class="absolute -top-3 left-1/2 min-w-[180px] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#DD6B20] px-3 py-1 text-center text-xs font-bold text-white"
                >
                  {{ pkg.badge || lt(localText.popular) }}
                </div>
                <div class="flex items-center gap-3 mb-3">
                  <div :class="['h-10 w-10 rounded-lg flex items-center justify-center', packageIconClass(pkg)]">
                    <component :is="pkgIconMap[pkg.icon] || FileText" class="h-5 w-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-900">{{ pkg.name }}</h4>
                    <p v-if="pkg.subtitle" class="mt-1 text-xs leading-5 text-gray-500">{{ pkg.subtitle }}</p>
                  </div>
                </div>
                <div class="mb-4 rounded-xl bg-white p-3 ring-1 ring-orange-100">
                  <div class="text-2xl font-extrabold text-[#C05621]">{{ pkg.price }}</div>
                  <div v-if="pkg.originalPrice" class="mt-1 text-sm font-semibold text-gray-400 line-through">{{ pkg.originalPrice }}</div>
                </div>
                <ul class="space-y-2 flex-1">
                  <li
                    v-for="feature in pkg.featureDetails || pkg.features.map((feature) => ({ label: feature, status: 'included' }))"
                    :key="`${pkg.name}-${feature.label}`"
                    :class="['flex items-start gap-2 text-sm leading-6', packageFeatureClass(feature.status)]"
                  >
                    <component :is="packageFeatureIcon(feature.status)" :class="['mt-1 h-4 w-4 shrink-0', packageFeatureIconClass(feature.status)]" />
                    <span>{{ feature.label }}</span>
                  </li>
                </ul>
                <router-link
                  :to="professionalReportLink"
                  :class="[
                    'mt-5 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors',
                    pkg.highlight
                      ? 'bg-[#DD6B20] text-white hover:bg-[#C05621]'
                      : 'border border-[#DD6B20] text-[#DD6B20] hover:bg-orange-50',
                  ]"
                >
                  {{ pkg.cta || lt(localText.choosePackage) }}
                </router-link>
                <p v-if="pkg.footnote" class="mt-3 text-center text-xs leading-5 text-gray-400">{{ pkg.footnote }}</p>
              </div>
            </div>

            <div class="rounded-xl bg-white border border-orange-100 p-5">
              <h4 class="font-bold text-gray-900 mb-3">{{ lt(localText.highlights) }}</h4>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="h in renderedReport.highlights" :key="h" class="flex items-center gap-2 text-sm text-gray-700">
                  <Star class="h-4 w-4 text-[#ED8936] shrink-0" />
                  {{ h }}
                </div>
              </div>
            </div>

            <div class="mt-6 text-center">
              <p class="text-sm text-gray-500 mb-3">{{ lt(localText.contactHint) }}</p>
              <router-link :to="professionalReportLink" class="inline-flex items-center gap-2 rounded-xl bg-[#DD6B20] px-6 py-3 text-white font-semibold shadow hover:bg-[#C05621] transition-colors">
                <ArrowRight class="h-4 w-4" />
                {{ t('report.contact') }}
              </router-link>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- Redesigned collection page -->
  <div v-else class="collection-page min-h-screen bg-[#f6f8fb] text-slate-900">
    <div class="mx-auto max-w-4xl px-4 py-8">
      <div class="mb-6">
        <router-link to="/" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#C05621]">
          <ArrowLeft class="h-4 w-4" />
          {{ t('cases.back') }}
        </router-link>
      </div>

      <div class="mb-10 text-center">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-[#C05621]">
          <Sparkles class="h-4 w-4" />
          <span>报告样例预览</span>
        </div>
        <h1 class="mb-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">海外就医可行性评估报告</h1>
        <p class="text-sm text-slate-500">填写以下基础信息，生成您的专属简易预审报告；医疗报告上传仅用于专业版。</p>
      </div>

      <div class="mb-8 rounded-[18px] border border-orange-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:p-8">
        <h2 class="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-950">
          <User class="h-5 w-5 text-[#DD6B20]" />
          基本信息
        </h2>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">姓名 *</label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="您的名字"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:ring-1"
              :class="shouldShowError('fullName') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:border-[#DD6B20] focus:ring-orange-200'"
              @blur="markTouched('fullName')"
            />
            <p v-if="shouldShowError('fullName')" class="mt-1 text-xs text-red-400">{{ validationErrors.fullName }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">性别 *</label>
            <select
              v-model="form.gender"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition"
              :class="shouldShowError('gender') ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#DD6B20]'"
              @change="markTouched('gender')"
              @blur="markTouched('gender')"
            >
              <option value="">Select / 请选择</option>
              <option value="male">Male / 男</option>
              <option value="female">Female / 女</option>
              <option value="other">Other / 其他</option>
            </select>
            <p v-if="shouldShowError('gender')" class="mt-1 text-xs text-red-400">{{ validationErrors.gender }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">出生日期</label>
            <input
              v-model="form.dateOfBirth"
              type="date"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#DD6B20]"
              @blur="markTouched('dateOfBirth')"
            />
            <p v-if="shouldShowError('dateOfBirth')" class="mt-1 text-xs text-red-400">{{ validationErrors.dateOfBirth }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">国籍</label>
            <input
              v-model="form.nationality"
              type="text"
              placeholder="美国"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#DD6B20]"
              @blur="markTouched('nationality')"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">证件类型</label>
            <select
              v-model="form.idType"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#DD6B20]"
              @change="markTouched('idType'); markTouched('idNumber')"
              @blur="markTouched('idType')"
            >
              <option value="">Select / 请选择</option>
              <option value="passport">Passport / 护照</option>
              <option value="id_card">National ID / 身份证</option>
              <option value="driving_license">Driving License / 驾照</option>
            </select>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">证件号码</label>
            <input
              v-model="form.idNumber"
              type="text"
              placeholder="您的证件号码"
              autocomplete="off"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:ring-1"
              :class="shouldShowError('idNumber') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:border-[#DD6B20] focus:ring-orange-200'"
              @blur="markTouched('idNumber')"
            />
            <p v-if="shouldShowError('idNumber')" class="mt-1 text-xs text-red-400">{{ validationErrors.idNumber }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">电话</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              inputmode="tel"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:ring-1"
              :class="shouldShowError('phone') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:border-[#DD6B20] focus:ring-orange-200'"
              @blur="markTouched('phone')"
            />
            <p v-if="shouldShowError('phone')" class="mt-1 text-xs text-red-400">{{ validationErrors.phone }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">邮箱 *</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="您的邮箱"
              autocomplete="email"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:ring-1"
              :class="shouldShowError('email') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:border-[#DD6B20] focus:ring-orange-200'"
              @blur="markTouched('email')"
            />
            <p v-if="shouldShowError('email')" class="mt-1 text-xs text-red-400">{{ validationErrors.email }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">所在城市</label>
            <input
              v-model="form.city"
              type="text"
              placeholder="您的城市"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#DD6B20]"
              @blur="markTouched('city')"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">首选语言</label>
            <select
              v-model="form.preferredLanguage"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#DD6B20]"
              @change="markTouched('preferredLanguage')"
              @blur="markTouched('preferredLanguage')"
            >
              <option value="">Select / 请选择</option>
              <option v-for="l in languageOptions" :key="l.value" :value="l.value">{{ l.label }}</option>
            </select>
          </div>
        </div>

        <h2 class="mb-6 mt-8 flex items-center gap-2 text-xl font-semibold text-slate-950">
          <Stethoscope class="h-5 w-5 text-[#DD6B20]" />
          就医信息
        </h2>
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-slate-700">就医目的 *</label>
            <select
              v-model="form.visitPurpose"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition"
              :class="shouldShowError('visitPurpose') ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#DD6B20]'"
              @change="markTouched('visitPurpose')"
              @blur="markTouched('visitPurpose')"
            >
              <option value="">Select / 请选择</option>
              <option v-for="p in purposeOptions" :key="p.value" :value="p.value">
                {{ p.display }}
              </option>
            </select>
            <p v-if="shouldShowError('visitPurpose')" class="mt-1 text-xs text-red-400">{{ validationErrors.visitPurpose }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">就医诉求</label>
            <select
              v-model="form.careNeed"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition"
              :class="shouldShowError('careNeed') ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#DD6B20]'"
              @change="markTouched('careNeed'); markTouched('careNeedOther')"
              @blur="markTouched('careNeed')"
            >
              <option value="">Select / 请选择</option>
              <option v-for="item in careNeedOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <p v-if="shouldShowError('careNeed')" class="mt-1 text-xs text-red-400">{{ validationErrors.careNeed }}</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">期望治疗时间</label>
            <select
              v-model="form.expectedTreatmentTime"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition"
              :class="shouldShowError('expectedTreatmentTime') ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#DD6B20]'"
              @change="markTouched('expectedTreatmentTime')"
              @blur="markTouched('expectedTreatmentTime')"
            >
              <option value="">Select / 请选择</option>
              <option v-for="item in expectedTreatmentTimeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <p v-if="shouldShowError('expectedTreatmentTime')" class="mt-1 text-xs text-red-400">{{ validationErrors.expectedTreatmentTime }}</p>
          </div>

          <div v-if="form.careNeed === 'other'" class="md:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-slate-700">其他就医诉求说明 *</label>
            <input
              v-model="form.careNeedOther"
              type="text"
              maxlength="300"
              placeholder="请补充说明您的就医诉求"
              class="w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:ring-1"
              :class="shouldShowError('careNeedOther') ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:border-[#DD6B20] focus:ring-orange-200'"
              @blur="markTouched('careNeedOther')"
            />
            <p v-if="shouldShowError('careNeedOther')" class="mt-1 text-xs text-red-400">{{ validationErrors.careNeedOther }}</p>
          </div>

          <div class="md:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-slate-700">症状及病史</label>
            <textarea
              v-model="form.chiefComplaint"
              rows="4"
              maxlength="500"
              placeholder="请描述您的症状、诊断和当前治疗情况..."
              class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#DD6B20]"
              @blur="markTouched('chiefComplaint')"
            />
            <div class="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
              <p v-if="shouldShowError('chiefComplaint')" class="text-red-400">{{ validationErrors.chiefComplaint }}</p>
              <p v-else>限500字以内</p>
              <span>{{ form.chiefComplaint.length }} / 500</span>
            </div>
          </div>

        </div>

        <div class="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-5">
          <div class="flex items-start gap-3">
            <AlertTriangle class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#DD6B20]" />
            <div>
              <h3 class="mb-2 font-semibold text-[#C05621]">费用透明声明</h3>
              <ul class="list-inside list-disc space-y-1.5 text-sm leading-6 text-[#9A4A1E]">
                <li>以上费用为全周期治疗预估区间，实际费用可能因病情分期、个体差异、并发症、住院标准等因素产生±15-25%波动</li>
                <li>进口靶向药与国产替代药价格差异可达3-10倍</li>
                <li>费用区间基于公开信息、医院预审口径和服务项目拆分整理，最终以医院正式报价、检查结果和治疗强度为准；不作为固定收费承诺</li>
                <li>如何获得更精准的费用预估？升级到「专业版评估报告」，由副主任医师审核后提供精准到千位的个性化费用清单</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-950">
            <Shield class="h-5 w-5 text-[#DD6B20]" />
            保险覆盖自检
          </h3>
          <div class="relative">
            <select
              :value="selectedInsurance ?? ''"
              class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#DD6B20]"
              @change="selectedInsurance = ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value)"
            >
              <option value="">Select your insurance company / 选择您的保险公司</option>
              <option v-for="(ins, i) in insuranceOptions" :key="ins.name" :value="i">{{ ins.name }}</option>
            </select>
            <ChevronDown class="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          </div>

          <div v-if="selectedInsuranceOption" class="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <h4 class="mb-4 flex items-center gap-2 font-semibold text-slate-950">
              <Search class="h-4 w-4 text-[#DD6B20]" />
              Coverage Results for {{ selectedInsuranceOption.name }}
            </h4>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="item in insuranceCoverageItems"
                :key="item.label"
                :class="[
                  'flex items-center gap-3 rounded-lg border p-3',
                  item.covered ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white',
                ]"
              >
                <component :is="item.icon" :class="['h-4 w-4', item.covered ? 'text-emerald-400' : 'text-slate-500']" />
                <div class="min-w-0 flex-1">
                  <div class="text-xs text-slate-500">{{ item.label }}</div>
                  <div :class="['text-sm font-medium', item.covered ? 'text-emerald-400' : 'text-slate-400']">{{ item.value }}</div>
                </div>
                <CheckCircle v-if="item.covered" class="h-4 w-4 flex-shrink-0 text-emerald-500" />
                <XCircle v-else class="h-4 w-4 flex-shrink-0 text-red-400" />
              </div>
            </div>
            <div v-if="selectedInsuranceOption.note" class="mt-3 flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle class="h-4 w-4" />
              <span>{{ selectedInsuranceOption.note }}</span>
            </div>
            <div class="mt-3 flex items-center gap-2 text-sm text-[#C05621]">
              <DollarSign class="h-4 w-4" />
              <span>直付网络 Direct Pay: {{ selectedInsuranceOption.directPay }}</span>
            </div>
            <div class="mt-3 rounded-lg border border-orange-100 bg-orange-50 p-3 text-sm text-[#9A4A1E]">
              <span class="font-semibold">建议：</span>联系保险公司国际部，告知计划编号即可查询中国就医覆盖详情
            </div>
          </div>
        </div>

        <p
          v-if="submissionError"
          :class="[
            'mt-6 rounded-xl border px-4 py-3 text-sm',
            submissionErrorTone === 'warning'
              ? 'border-amber-300/40 bg-amber-50 text-[#9A4A1E]'
              : 'border-red-400/30 bg-red-500/10 text-red-300',
          ]"
        >
          {{ submissionError }}
        </p>

        <div class="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            :disabled="generating"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C05621] px-8 py-4 font-semibold text-white transition-all hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-50"
            @click="generateFreeReport"
          >
            <Loader2 v-if="generating" class="h-5 w-5 animate-spin" />
            <FileText v-else class="h-5 w-5" />
            {{ generating ? '生成报告中...' : '生成评估报告' }}
          </button>
          <router-link
            to="/cases"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-8 py-4 font-semibold text-white transition-all hover:bg-slate-600"
          >
            <BookOpen class="h-5 w-5" />
            查看案例
          </router-link>
        </div>
      </div>

      <div class="rounded-[18px] border border-orange-100 bg-white p-6 shadow-sm md:p-8">
        <h2 class="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-950">
          <BarChart3 class="h-5 w-5 text-[#DD6B20]" />
          报告预览样例
        </h2>
        <p class="mb-6 text-sm text-slate-500">以下为基于来华治疗的样例报告。您的实际报告将根据病情和资料定制。</p>
        <div class="space-y-4">
          <div
            v-for="item in reportPreviewItems"
            :key="item.title"
            class="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-orange-200 hover:bg-orange-50/40"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#DD6B20]">
              <component :is="item.icon" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium text-slate-950">{{ item.title }}</div>
              <div class="text-sm text-slate-500">{{ item.desc }}</div>
            </div>
            <Lock class="h-4 w-4 flex-shrink-0 text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showProSampleReport"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6"
    @click="closeProSampleReport"
  >
    <div
      class="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl"
      @click.stop
    >
      <div class="border-b border-orange-100 bg-white px-5 py-4 md:px-6">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-[#C05621]">{{ proSampleReport.meta.badge }}</div>
            <h2 class="mt-1 text-lg font-bold leading-7 text-slate-950 md:text-xl">{{ proSampleReport.meta.title }}</h2>
            <p class="mt-1 text-sm leading-6 text-slate-500">{{ proSampleReport.meta.patient }}</p>
          </div>
          <button
            type="button"
            class="rounded-full p-1.5 text-slate-400 transition hover:bg-orange-50 hover:text-[#C05621]"
            aria-label="关闭示例报告"
            @click="closeProSampleReport"
          >
            <XCircle class="h-6 w-6" />
          </button>
        </div>

        <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="tab in proSampleTabs"
            :key="tab.key"
            type="button"
            :class="[
              'inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
              activeProSampleTab === tab.key
                ? 'border-orange-200 bg-orange-50 text-[#C05621]'
                : 'border-slate-200 bg-white text-slate-500 hover:border-orange-200 hover:text-[#C05621]',
            ]"
            @click="activeProSampleTab = tab.key"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="overflow-y-auto bg-[#f7f8fb] p-4 md:p-6">
        <div class="mb-4 rounded-xl border border-orange-100 bg-orange-50/80 p-4 text-sm leading-6 text-[#9A4A1E]">
          {{ proSampleReport.meta.note }}
        </div>

        <section v-if="activeProSampleTab === 'analysis'" class="space-y-4">
          <div class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 font-bold text-slate-950">
              <FileSearch class="h-5 w-5 text-[#DD6B20]" />
              一、病情深度分析解读
            </h3>
            <div class="grid gap-3 md:grid-cols-2">
              <div
                v-for="item in proSampleReport.analysis.basics"
                :key="item.label"
                class="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div class="text-xs font-semibold text-slate-500">{{ item.label }}</div>
                <div class="mt-1 font-bold text-slate-950">{{ item.value }}</div>
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <article
              v-for="group in proSampleReport.analysis.groups"
              :key="group.title"
              class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <h4 class="mb-3 font-bold text-[#C05621]">{{ group.title }}</h4>
              <ul class="space-y-2 text-sm leading-6 text-slate-700">
                <li v-for="item in group.items" :key="item" class="flex gap-2">
                  <CheckCircle class="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </article>
          </div>

          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            {{ proSampleReport.analysis.warning }}
          </div>
        </section>

        <section v-else-if="activeProSampleTab === 'treatment'" class="space-y-4">
          <div class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h3 class="mb-5 flex items-center gap-2 font-bold text-slate-950">
              <Stethoscope class="h-5 w-5 text-[#DD6B20]" />
              二、治疗路径方案（预估）
            </h3>
            <div class="space-y-4">
              <div v-for="(step, index) in proSampleReport.treatment.steps" :key="step.title" class="flex gap-3">
                <div class="flex shrink-0 flex-col items-center">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#C05621]">{{ index + 1 }}</div>
                  <div v-if="index < proSampleReport.treatment.steps.length - 1" class="my-1 h-full min-h-10 w-px bg-orange-100"></div>
                </div>
                <div class="flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h4 class="font-bold text-slate-950">{{ step.title }}</h4>
                  <ul class="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                    <li v-for="detail in step.details" :key="detail" class="flex gap-2">
                      <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DD6B20]"></span>
                      <span>{{ detail }}</span>
                    </li>
                  </ul>
                  <div v-if="step.badge" class="mt-3 inline-flex rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {{ step.badge }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <h4 class="mb-4 font-bold text-slate-950">治愈率预估</h4>
            <div class="grid grid-cols-3 gap-3 text-center">
              <div v-for="item in proSampleReport.treatment.outcome" :key="item.label" class="rounded-xl bg-emerald-50 p-4">
                <div class="text-2xl font-black text-emerald-600">{{ item.value }}</div>
                <div class="mt-1 text-xs leading-5 text-slate-500">{{ item.label }}</div>
              </div>
            </div>
            <p class="mt-3 text-xs leading-5 text-slate-500">{{ proSampleReport.treatment.source }}</p>
          </div>
        </section>

        <section v-else-if="activeProSampleTab === 'cost'" class="space-y-4">
          <div class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 font-bold text-slate-950">
              <DollarSign class="h-5 w-5 text-[#DD6B20]" />
              三、费用明细 - 0猫腻透明报价
            </h3>
            <div class="overflow-x-auto rounded-xl border border-slate-100">
              <table class="w-full min-w-[560px] text-sm">
                <thead class="bg-slate-50 text-slate-500">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold">第一类：核心医疗费用</th>
                    <th class="px-4 py-3 text-right font-semibold">人民币</th>
                    <th class="px-4 py-3 text-right font-semibold">美元</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="row in proSampleReport.cost.core" :key="row[0]">
                    <td class="px-4 py-3 text-slate-700">{{ row[0] }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-slate-700">{{ row[1] }}</td>
                    <td class="px-4 py-3 text-right font-semibold text-[#C05621]">{{ row[2] }}</td>
                  </tr>
                  <tr class="bg-orange-50">
                    <td class="px-4 py-3 font-bold text-slate-950">核心医疗小计</td>
                    <td class="px-4 py-3 text-right font-bold text-slate-950">¥79,000</td>
                    <td class="px-4 py-3 text-right font-bold text-[#C05621]">~$11,280</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h4 class="mb-3 font-bold text-emerald-800">第二类：配套服务（全免费）</h4>
              <ul class="space-y-2 text-sm leading-6 text-emerald-800">
                <li v-for="item in proSampleReport.cost.support" :key="item" class="flex gap-2">
                  <CheckCircle class="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{{ item }}</span>
                </li>
              </ul>
              <div class="mt-3 font-bold text-emerald-700">小计：{{ proSampleReport.cost.totals.support }}</div>
            </div>

            <div class="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <h4 class="mb-3 font-bold text-amber-800">第三类：生活预估（自理）</h4>
              <div class="space-y-2 text-sm">
                <div v-for="row in proSampleReport.cost.living" :key="row[0]" class="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2">
                  <span class="text-slate-700">{{ row[0] }}</span>
                  <span class="shrink-0 font-semibold text-[#C05621]">{{ row[1] }} / {{ row[2] }}</span>
                </div>
              </div>
              <div class="mt-3 font-bold text-amber-800">小计：{{ proSampleReport.cost.totals.living }}</div>
            </div>
          </div>

          <div class="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div class="font-bold text-slate-950">预估总费用</div>
                <p class="mt-1 text-sm text-[#9A4A1E]">核心医疗 + 配套服务（免费）+ 生活预估</p>
              </div>
              <div class="text-2xl font-black text-[#C05621]">{{ proSampleReport.cost.totals.total }}</div>
            </div>
            <p class="mt-3 text-sm leading-6 text-[#9A4A1E]">{{ proSampleReport.cost.totals.note }}</p>
          </div>
        </section>

        <section v-else-if="activeProSampleTab === 'insurance'" class="space-y-4">
          <div class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 font-bold text-slate-950">
              <Shield class="h-5 w-5 text-[#DD6B20]" />
              四、保险报销评估
            </h3>
            <h4 class="mb-3 font-semibold text-slate-950">{{ proSampleReport.insurance.name }}</h4>
            <div class="grid gap-3 md:grid-cols-2">
              <div
                v-for="coverage in proSampleReport.insurance.coverages"
                :key="String(coverage[0])"
                :class="[
                  'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                  coverage[2] ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-600',
                ]"
              >
                <span>{{ coverage[0] }}</span>
                <span class="font-bold">{{ coverage[1] }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <h4 class="mb-3 font-bold text-amber-800">报销建议</h4>
            <ul class="space-y-2 text-sm leading-6 text-amber-800">
              <li v-for="item in proSampleReport.insurance.suggestions" :key="item" class="flex gap-2">
                <CheckCircle class="mt-1 h-4 w-4 shrink-0 text-amber-600" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </section>

        <section v-else class="space-y-4">
          <div class="rounded-2xl border border-red-100 bg-red-50 p-5">
            <h3 class="mb-2 flex items-center gap-2 font-bold text-red-700">
              <HeartPulse class="h-5 w-5" />
              五、术后防复发随访体系
            </h3>
            <p class="text-sm leading-6 text-red-700">{{ proSampleReport.followup.reason }}</p>
          </div>

          <div class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <h4 class="mb-4 font-bold text-slate-950">随访时间线</h4>
            <div class="space-y-3">
              <div v-for="item in proSampleReport.followup.timeline" :key="`${item.time}-${item.title}`" class="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div class="w-20 shrink-0 text-sm font-bold text-[#C05621]">{{ item.time }}</div>
                <div>
                  <div class="font-semibold text-slate-950">{{ item.title }}</div>
                  <p class="mt-1 text-sm leading-6 text-slate-600">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <article
              v-for="service in proSampleReport.followup.services"
              :key="service.title"
              class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <h4 class="mb-3 font-bold text-[#C05621]">{{ service.title }}</h4>
              <ul class="space-y-2 text-sm leading-6 text-slate-700">
                <li v-for="item in service.items" :key="item" class="flex gap-2">
                  <CheckCircle class="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </article>
          </div>

          <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center font-bold text-emerald-700">
            {{ proSampleReport.followup.fee }}
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
