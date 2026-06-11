<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
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
const submissionError = ref('')
const submissionNo = ref('')
const generatedReport = ref<GeneratedReport | null>(null)
const activeFreeLayoutKey = ref('cost')

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
  chiefComplaint: '',
})

type FormField = keyof typeof form
type SupportedLocale = 'zh' | 'en' | 'id' | 'ru' | 'mn'
type LocalizedText = Record<SupportedLocale, string>
type RenderedReport = Omit<GeneratedReport, 'plan'> & {
  direction: string
  duration: string
  totalCost: string
  breakdown: GeneratedReport['plan']['breakdown']
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
      { name: { zh: '书面评估基础包', en: 'Written Review Basic Package', id: 'Paket Dasar Tinjauan Tertulis', ru: 'Базовый пакет письменной оценки', mn: 'Бичгийн үнэлгээний үндсэн багц' }, price: '60💲', icon: 'FileText', highlight: false, features: [
        { zh: '病历整理与归档', en: 'Medical record sorting and archiving', id: 'Penyusunan dan arsip rekam medis', ru: 'Систематизация и архивирование меддокументов', mn: 'Эмнэлгийн баримт цэгцлэх ба архивлах' },
        { zh: '专家智能匹配', en: 'Smart expert matching', id: 'Pencocokan ahli cerdas', ru: 'Интеллектуальный подбор эксперта', mn: 'Ухаалаг мэргэжилтэн тааруулах' },
        { zh: '书面初步评估PDF', en: 'Written preliminary assessment PDF', id: 'PDF asesmen awal tertulis', ru: 'PDF предварительной письменной оценки', mn: 'Бичгийн урьдчилсан үнэлгээ PDF' },
      ] },
      { name: { zh: '单次视频面诊标准包', en: 'Single Video Consultation Standard Package', id: 'Paket Standar Konsultasi Video Tunggal', ru: 'Стандартный пакет одной видеоконсультации', mn: 'Нэг удаагийн видео зөвлөгөөний стандарт багц' }, price: '235💲', icon: 'Video', highlight: true, features: [
        { zh: '专家视频面诊15-30分钟', en: '15-30 min expert video consultation', id: 'Konsultasi video ahli 15-30 menit', ru: 'Видеоконсультация эксперта 15-30 минут', mn: '15-30 минутын мэргэжилтний видео зөвлөгөө' },
        { zh: '书面诊疗总结', en: 'Written consultation summary', id: 'Ringkasan konsultasi tertulis', ru: 'Письменное резюме консультации', mn: 'Бичгийн зөвлөгөөний хураангуй' },
        { zh: '7天内1次跟进答疑', en: 'One follow-up Q&A within 7 days', id: '1 sesi tanya jawab lanjutan dalam 7 hari', ru: 'Один последующий Q&A в течение 7 дней', mn: '7 хоногийн дотор нэг удаагийн асуулт хариулт' },
      ] },
      { name: { zh: '双专家视频面诊深度包', en: 'Dual-Specialist Video Consultation Package', id: 'Paket Mendalam Konsultasi Video Dua Ahli', ru: 'Расширенный пакет видеоконсультации двух экспертов', mn: 'Хоёр мэргэжилтний видео зөвлөгөөний гүнзгий багц' }, price: '450💲', icon: 'MessageSquare', highlight: false, features: [
        { zh: '2位相关科室专家会诊', en: 'Consultation by two relevant specialists', id: 'Konsultasi oleh 2 ahli terkait', ru: 'Консилиум двух профильных специалистов', mn: 'Холбогдох хоёр мэргэжилтний зөвлөгөө' },
        { zh: '综合诊疗报告', en: 'Integrated treatment report', id: 'Laporan perawatan terpadu', ru: 'Комплексный лечебный отчет', mn: 'Нэгдсэн эмчилгээний тайлан' },
        { zh: '14天内2次跟进答疑', en: 'Two follow-up Q&A sessions within 14 days', id: '2 sesi tanya jawab lanjutan dalam 14 hari', ru: 'Два последующих Q&A в течение 14 дней', mn: '14 хоногийн дотор хоёр удаагийн асуулт хариулт' },
      ] },
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
      features: pkg.features.map((feature) => lt(feature)),
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
  .replace(/\s{2,}/g, ' ')
  .trim()

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
    const isDentalGeneratedReport = report.hospitals.some((item) => /鼎植|口腔|牙科/.test(`${item.name}${item.reason}`)) || /牙|口腔|鼎植/.test(`${report.disease}${report.treatment}`)
    const totalCost = isDentalGeneratedReport ? report.plan.totalCost : getBreakdownTotalCost(report.plan.breakdown) || report.plan.totalCost

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
      })),
      direction: cleanReportText(report.plan.direction),
      duration: cleanReportText(report.plan.duration),
      totalCost,
      breakdown: report.plan.breakdown.map((item) => ({ item: cleanReportText(item.item), cost: cleanReportText(item.cost) })),
      packages: report.packages.map((pkg) => ({
        ...pkg,
        name: cleanReportText(pkg.name),
        price: cleanReportText(pkg.price),
        features: pkg.features.map((feature) => cleanReportText(feature)),
      })),
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
    packages: localizedReport.value.packages,
    highlights: localizedReport.value.highlights,
    layoutSections: [],
    disclaimer: '本报告为来华就医可行性预审，不构成诊断、处方或最终治疗建议。',
    generatedBy: 'rules' as const,
  }
})

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
    phone: form.phone.trim() && validatePhone(form.phone) ? '' : lt(localText.validation.phone),
    email: !form.email.trim() || validateEmail(form.email) ? '' : lt(localText.validation.email),
    city: '',
    preferredLanguage: '',
    visitPurpose: form.visitPurpose ? '' : lt(localText.validation.visitPurpose),
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
  freeLayoutSections.value.filter((section) => !['cost', 'hospitals', 'hospitalDetails', 'records'].includes(section.key))
))
const activeFreeLayoutSection = computed(() => (
  freeLayoutSections.value.find((section) => section.key === activeFreeLayoutKey.value) || freeLayoutSections.value[0]
))
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
const costSavingsText = computed(() => {
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
  { label: '语言', value: languageLabel.value },
])
const topHospitals = computed(() => renderedReport.value.hospitals.slice(0, 3))
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
    chiefComplaint: form.chiefComplaint.trim(),
  },
  selectedRegions: selectedRegions.value.length ? selectedRegions.value : defaultSelectedRegions,
}))

const classifyCostItem = (item: string) => {
  if (/住宿|生活|交通|机票|酒店|餐饮|出行|停留/.test(item)) return 'living'
  if (/翻译|陪诊|协调|预约|签证|保险|服务|资料|远程|随访/.test(item)) return 'support'
  return 'medical'
}

const costBreakdownGroups = computed(() => {
  const groups = [
    { key: 'medical', title: '第一类：核心医疗费用', subtitle: '检查、治疗、手术或主要医疗项目', icon: HeartPulse, tone: 'rose', items: [] as GeneratedReport['plan']['breakdown'] },
    { key: 'support', title: '第二类：配套服务费用', subtitle: '翻译、预约、陪诊及跨境协调', icon: Shield, tone: 'emerald', items: [] as GeneratedReport['plan']['breakdown'] },
    { key: 'living', title: '第三类：生活预估费用', subtitle: '住宿、生活和在华停留成本', icon: Building2, tone: 'blue', items: [] as GeneratedReport['plan']['breakdown'] },
  ]

  for (const item of renderedReport.value.breakdown) {
    const target = groups.find((group) => group.key === classifyCostItem(item.item)) || groups[0]
    target.items.push(item)
  }

  return groups.map((group) => ({
    ...group,
    total: getBreakdownTotalCost(group.items) || '需按项目确认',
  }))
})

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

const generateFreeReport = async () => {
  submitAttempted.value = true
  markAllTouched()
  if (!isStep0Valid.value || generating.value) return

  submissionError.value = ''
  generating.value = true
  try {
    if (await checkForUpdate({ force: true })) {
      submissionError.value = '系统已更新，请先刷新页面后再生成报告。'
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
    submissionError.value = lt(localText.submitFailed)
    generating.value = false
  }
}

const nextStep = generateFreeReport

const loadExistingReport = async () => {
  const querySubmissionNo = typeof route.query.submissionNo === 'string' ? route.query.submissionNo : ''
  if (!querySubmissionNo) return

  submissionError.value = ''
  generating.value = true
  let response: Awaited<ReturnType<typeof getReportSubmission>>
  try {
    response = await getReportSubmission(querySubmissionNo)
  } catch (error) {
    console.error(error)
    submissionError.value = lt(localText.submitFailed)
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
    city: '', preferredLanguage: '', visitPurpose: '', chiefComplaint: '',
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
            <div v-for="(hospital, index) in topHospitals" :key="hospital.name" class="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div class="mb-3 flex items-center justify-between">
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#DD6B20] text-xs font-bold text-white">{{ index + 1 }}</span>
                <span class="text-xs font-semibold text-[#C05621]">{{ hospital.city }}</span>
              </div>
              <h3 class="text-base font-bold text-slate-950">{{ hospital.name }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ hospital.reason }}</p>
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

            <div class="overflow-hidden rounded-xl border border-slate-100">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h3 class="font-semibold text-slate-950">费用明细预估</h3>
                <span class="text-sm font-bold text-[#C05621]">{{ renderedReport.totalCost }}</span>
              </div>
              <table class="w-full text-sm">
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="item in renderedReport.breakdown" :key="item.item">
                    <td class="px-4 py-3 leading-6 text-slate-700">{{ item.item }}</td>
                    <td class="whitespace-nowrap px-4 py-3 text-right font-semibold text-[#C05621]">{{ item.cost }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-3">
            <div
              v-for="group in costBreakdownGroups"
              :key="group.key"
              class="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div class="mb-3 flex items-start gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#DD6B20]">
                  <component :is="group.icon" class="h-4 w-4" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-950">{{ group.title }}</h3>
                  <p class="mt-1 text-xs leading-5 text-slate-500">{{ group.subtitle }}</p>
                </div>
              </div>
              <div class="mb-3 text-sm font-bold text-[#C05621]">{{ group.total }}</div>
              <div class="space-y-2">
                <div
                  v-for="item in group.items"
                  :key="`${group.key}-${item.item}`"
                  class="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs"
                >
                  <span class="leading-5 text-slate-600">{{ item.item }}</span>
                  <span class="whitespace-nowrap font-semibold text-slate-900">{{ item.cost }}</span>
                </div>
                <div v-if="!group.items.length" class="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-400">
                  本次报告暂未单列此类费用。
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-center text-sm font-semibold text-[#C05621]">
            预估总计：{{ renderedReport.totalCost }}；最终以医院正式报价、检查结果和治疗强度为准。
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
              <div class="text-4xl font-extrabold">{{ renderedReport.score }}</div>
              <div class="text-sm text-orange-100 mt-1">{{ t('report.score') }} / 100</div>
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
          <div :class="isDentalReport ? 'grid gap-4 md:grid-cols-1' : 'grid gap-4 md:grid-cols-2'">
            <div v-for="h in renderedReport.hospitals" :key="h.name" class="rounded-xl border border-orange-100 bg-orange-50/30 p-5">
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
                  pkg.highlight ? 'border-[#DD6B20] bg-white shadow-lg relative' : 'border-gray-200 bg-white',
                ]"
              >
                <div
                  v-if="pkg.highlight"
                  class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#DD6B20] px-3 py-1 text-xs font-bold text-white"
                >
                  {{ lt(localText.popular) }}
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
                <router-link
                  :to="professionalReportLink"
                  :class="[
                    'mt-5 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors',
                    pkg.highlight
                      ? 'bg-[#DD6B20] text-white hover:bg-[#C05621]'
                      : 'border border-[#DD6B20] text-[#DD6B20] hover:bg-orange-50',
                  ]"
                >
                  {{ lt(localText.choosePackage) }}
                </router-link>
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
            <label class="mb-1.5 block text-sm font-medium text-slate-700">电话 *</label>
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
            <label class="mb-1.5 block text-sm font-medium text-slate-700">邮箱</label>
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

        <p v-if="submissionError" class="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
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
</template>
