<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
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
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Languages,
  HeartPulse,
  CalendarDays,
  CreditCard,
} from 'lucide-vue-next'
import { reportData } from '@/data/report'
import { createReportSubmission } from '@/services/reportSubmissions'

const { t, locale } = useI18n()

const step = ref(0)
const selectedRegions = ref<string[]>([])
const generating = ref(false)
const showReport = ref(false)
const expandedCountry = ref<string | null>(null)
const submissionError = ref('')
const submissionNo = ref('')

// 基础信息表单
const form = reactive({
  fullName: '',
  gender: '',
  dateOfBirth: '',
  nationality: '',
  idType: 'passport',
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
const regionAttempted = ref(false)

// 国籍选项：用 ISO 代码存值，展示文案随当前语言自动切换
const nationalityGroups = [
  {
    label: { zh: '亚洲', en: 'Asia', id: 'Asia', ru: 'Азия', mn: 'Ази' },
    options: [
      'CN', 'HK', 'MO', 'TW', 'MN', 'JP', 'KR', 'SG', 'MY', 'ID', 'TH', 'PH',
      'VN', 'KH', 'LA', 'MM', 'IN', 'PK', 'BD', 'LK', 'NP', 'KZ', 'UZ', 'KG', 'TJ',
    ],
  },
  {
    label: { zh: '欧洲', en: 'Europe', id: 'Eropa', ru: 'Европа', mn: 'Европ' },
    options: [
      'GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'SE',
      'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'GR', 'RU', 'UA', 'BY', 'TR',
    ],
  },
  {
    label: { zh: '美洲', en: 'Americas', id: 'Amerika', ru: 'Америка', mn: 'Америк' },
    options: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'PE', 'CO'],
  },
  {
    label: { zh: '中东与非洲', en: 'Middle East & Africa', id: 'Timur Tengah & Afrika', ru: 'Ближний Восток и Африка', mn: 'Ойрх Дорнод ба Африк' },
    options: [
      'AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'JO', 'IL', 'IR', 'IQ', 'EG', 'ZA',
      'NG', 'KE', 'ET', 'MA',
    ],
  },
  {
    label: { zh: '大洋洲', en: 'Oceania', id: 'Oseania', ru: 'Океания', mn: 'Далайн орнууд' },
    options: ['AU', 'NZ'],
  },
  {
    label: localText.other,
    options: ['其他'],
  },
]

const languageCodes = ['zh', 'en', 'id', 'ru', 'mn', 'ja', 'ko', 'other']
const purposeOptions = [
  { value: 'breast_cancer', label: { zh: '乳腺癌', en: 'Breast cancer', id: 'Kanker payudara', ru: 'Рак молочной железы', mn: 'Хөхний хорт хавдар' } },
  { value: 'lung_cancer', label: { zh: '肺癌', en: 'Lung cancer', id: 'Kanker paru-paru', ru: 'Рак легкого', mn: 'Уушгины хорт хавдар' } },
  { value: 'nasopharyngeal_cancer', label: { zh: '鼻咽癌', en: 'Nasopharyngeal cancer', id: 'Kanker nasofaring', ru: 'Рак носоглотки', mn: 'Хамар залгиурын хорт хавдар' } },
  { value: 'liver_cancer', label: { zh: '肝癌', en: 'Liver cancer', id: 'Kanker hati', ru: 'Рак печени', mn: 'Элэгний хорт хавдар' } },
  { value: 'cardiovascular_tumor', label: { zh: '心血管肿瘤', en: 'Cardiovascular tumors', id: 'Tumor kardiovaskular', ru: 'Сердечно-сосудистые опухоли', mn: 'Зүрх судасны хавдар' } },
  { value: 'neurosurgery', label: { zh: '神经外科', en: 'Neurosurgery', id: 'Bedah saraf', ru: 'Нейрохирургия', mn: 'Мэдрэлийн мэс засал' } },
  { value: 'spine_surgery', label: { zh: '脊柱外科', en: 'Spine surgery', id: 'Bedah tulang belakang', ru: 'Хирургия позвоночника', mn: 'Нурууны мэс засал' } },
  { value: 'premium_checkup', label: { zh: '高端体检', en: 'Premium health checkup', id: 'Pemeriksaan kesehatan premium', ru: 'Премиальный медосмотр', mn: 'Дээд зэрэглэлийн эрүүл мэндийн үзлэг' } },
  { value: 'dental', label: { zh: '牙科', en: 'Dental care', id: 'Perawatan gigi', ru: 'Стоматология', mn: 'Шүдний эмчилгээ' } },
  { value: 'cardiology_cardiothoracic', label: { zh: '心内科与心胸外科', en: 'Cardiology & cardiothoracic surgery', id: 'Kardiologi & bedah kardiotoraks', ru: 'Кардиология и кардиоторакальная хирургия', mn: 'Зүрх судлал ба цээжний хөндийн мэс засал' } },
  { value: 'endocrinology_metabolism', label: { zh: '内分泌与代谢科', en: 'Endocrinology & metabolism', id: 'Endokrinologi & metabolisme', ru: 'Эндокринология и метаболизм', mn: 'Дотоод шүүрэл ба бодисын солилцоо' } },
  { value: 'other', label: localText.other },
]

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
        tech: { zh: '保乳技术成熟，5年生存率接近发达国家', en: 'Mature breast-conserving techniques with 5-year survival approaching developed markets', id: 'Teknik konservasi payudara matang; survival 5 tahun mendekati negara maju', ru: 'Отработанные органосохраняющие методики; 5-летняя выживаемость близка к развитым странам', mn: 'Хөх хадгалах арга成熟 бөгөөд 5 жилийн амьдрах үзүүлэлт хөгжингүй орнуудтай ойролцоо' },
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
      { city: { zh: '上海', en: 'Shanghai', id: 'Shanghai', ru: 'Шанхай', mn: 'Шанхай' }, name: { zh: '复旦大学附属肿瘤医院', en: 'Fudan University Shanghai Cancer Center', id: 'Fudan University Shanghai Cancer Center', ru: 'Онкоцентр Фуданьского университета', mn: 'Фудань их сургуулийн Шанхайн хавдрын төв' }, reason: { zh: '肿瘤专科全国第一，精准治疗领先', en: 'Top oncology specialty with leading precision treatment capability', id: 'Spesialis onkologi terdepan dengan kemampuan terapi presisi kuat', ru: 'Ведущий онкоцентр с сильной прецизионной терапией', mn: 'Хавдрын чиглэлээр тэргүүлэх, нарийвчилсан эмчилгээ хүчтэй' } },
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

const displayNames = computed(() => new Intl.DisplayNames([intlLocale.value], { type: 'region' }))
const languageDisplayNames = computed(() => new Intl.DisplayNames([intlLocale.value], { type: 'language' }))
const nationalityLabel = computed(() => {
  return form.nationality === '其他'
    ? lt(localText.other)
    : displayNames.value.of(form.nationality) || form.nationality || '-'
})
const languageOptions = computed(() => {
  return languageCodes.map((code) => ({
    value: code,
    label: code === 'other' ? lt(localText.other) : languageDisplayNames.value.of(code) || code,
  }))
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
  if (!value) return false
  const date = new Date(`${value}T00:00:00`)
  const now = new Date()
  const earliest = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate())
  return !Number.isNaN(date.getTime()) && date <= now && date >= earliest
}

const currentYear = new Date().getFullYear()
const birthYears = computed(() => Array.from({ length: 121 }, (_, index) => currentYear - index))
const birthMonths = Array.from({ length: 12 }, (_, index) => index + 1)
const monthLabels: Record<SupportedLocale, string[]> = {
  zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  mn: ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'],
}
const birthDays = computed(() => {
  const [year, month] = form.dateOfBirth.split('-').map(Number)
  const daysInMonth = year && month ? new Date(year, month, 0).getDate() : 31
  return Array.from({ length: daysInMonth }, (_, index) => index + 1)
})
const birthDateParts = computed(() => {
  const [year = '', month = '', day = ''] = form.dateOfBirth.split('-')
  return { year, month, day }
})

const setBirthDatePart = (part: 'year' | 'month' | 'day', value: string) => {
  const next = { ...birthDateParts.value, [part]: value }
  if (!next.year && !next.month && !next.day) {
    form.dateOfBirth = ''
    return
  }

  if (!next.year || !next.month || !next.day) {
    form.dateOfBirth = `${next.year}-${next.month}-${next.day}`
    return
  }

  const year = Number(next.year)
  const month = Number(next.month)
  const maxDay = new Date(year, month, 0).getDate()
  const day = Math.min(Number(next.day), maxDay)
  form.dateOfBirth = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const formatMonth = (month: number) => {
  return monthLabels[activeLocale.value][month - 1]
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
  } else if (form.idType === 'other' && !validateOtherId(idNumber)) {
    idNumberError = lt(localText.validation.otherId)
  }

  return {
    fullName: form.fullName.trim().length >= 2 ? '' : lt(localText.validation.fullName),
    gender: form.gender ? '' : lt(localText.validation.gender),
    dateOfBirth: validateDateOfBirth(form.dateOfBirth) ? '' : lt(localText.validation.dateOfBirth),
    nationality: form.nationality ? '' : lt(localText.validation.nationality),
    idType: '',
    idNumber: idNumberError,
    phone: !form.phone.trim() || validatePhone(form.phone) ? '' : lt(localText.validation.phone),
    email: validateEmail(form.email) ? '' : lt(localText.validation.email),
    city: form.city.trim().length >= 2 ? '' : lt(localText.validation.city),
    preferredLanguage: form.preferredLanguage ? '' : lt(localText.validation.preferredLanguage),
    visitPurpose: form.visitPurpose ? '' : lt(localText.validation.visitPurpose),
    chiefComplaint: form.chiefComplaint.trim().length >= 6 ? '' : lt(localText.validation.chiefComplaint),
  }
})

const isStep0Valid = computed(() => {
  return Object.values(validationErrors.value).every((message) => !message)
})
const isStep1Valid = computed(() => selectedRegions.value.length > 0)

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

const controlClass = (field: FormField, withIcon = false) => [
  'w-full rounded-lg border py-2.5 text-sm outline-none transition-colors focus:ring-1',
  withIcon ? 'pl-9 pr-3' : 'px-3',
  shouldShowError(field)
    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-[#DD6B20] focus:ring-[#DD6B20]',
]

const selectClass = (field: FormField) => [
  ...controlClass(field, true),
  'appearance-none bg-white',
]

const dateSelectClass = (field: FormField) => [
  'w-full rounded-lg border px-2 py-2.5 text-center text-sm outline-none transition-colors focus:ring-1 text-center-last',
  shouldShowError(field)
    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 bg-white focus:border-[#DD6B20] focus:ring-[#DD6B20]',
]

const textareaClass = (field: FormField) => [
  ...controlClass(field),
  'resize-none',
]

const pkgIconMap: Record<string, any> = { FileText, Video, MessageSquare }

const stepLabels = computed(() => [t('report.step1'), t('report.step2'), t('report.step3')])
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
    visitPurpose: form.visitPurpose,
    chiefComplaint: form.chiefComplaint.trim(),
  },
  selectedRegions: selectedRegions.value,
}))

const scrollToPageTop = async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const nextStep = async () => {
  if (step.value === 0) {
    submitAttempted.value = true
    markAllTouched()
    if (!isStep0Valid.value) return
  }

  if (step.value === 1) {
    regionAttempted.value = true
    if (!isStep1Valid.value) return
  }

  if (step.value === 2) {
    if (generating.value) return
    submissionError.value = ''
    generating.value = true
    try {
      const response = await createReportSubmission(reportSubmissionPayload.value)
      submissionNo.value = response.submissionNo
      generating.value = false
      showReport.value = true
      await scrollToPageTop()
    } catch (error) {
      console.error(error)
      submissionError.value = lt(localText.submitFailed)
      generating.value = false
    }
  } else {
    step.value++
    await scrollToPageTop()
  }
}

const prevStep = async () => {
  step.value--
  await scrollToPageTop()
}

const toggleRegion = (r: string) => {
  const idx = selectedRegions.value.indexOf(r)
  if (idx >= 0) selectedRegions.value.splice(idx, 1)
  else selectedRegions.value.push(r)
  regionAttempted.value = true
}

const resetWizard = () => {
  showReport.value = false
  submissionError.value = ''
  submissionNo.value = ''
  step.value = 0
  selectedRegions.value = []
  submitAttempted.value = false
  regionAttempted.value = false
  ;(Object.keys(touched) as FormField[]).forEach((field) => {
    touched[field] = false
  })
  Object.assign(form, {
    fullName: '', gender: '', dateOfBirth: '', nationality: '',
    idType: 'passport', idNumber: '', phone: '', email: '',
    city: '', preferredLanguage: '', visitPurpose: '', chiefComplaint: '',
  })
}
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
            <p class="mt-2 text-orange-100 text-sm md:text-base">{{ localizedReport.subtitle }}</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-orange-100">{{ t('report.reportId') }}</div>
            <div class="font-mono font-bold text-base md:text-lg">{{ submissionNo || reportData.id }}</div>
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
              <div class="font-semibold text-gray-900">{{ visitPurposeLabel ? lt(visitPurposeLabel) : reportData.disease }}</div>
            </div>
            <div class="rounded-xl bg-orange-50/50 p-4 border border-orange-100">
              <div class="text-gray-500 mb-1">{{ lt(localText.coreNeed) }}</div>
              <div class="font-semibold text-gray-900 line-clamp-2">{{ form.chiefComplaint || localizedReport.need }}</div>
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
              v-for="c in localizedReport.countries"
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
              <div class="text-4xl font-extrabold">{{ reportData.score }}</div>
              <div class="text-sm text-orange-100 mt-1">{{ t('report.score') }} / 100</div>
            </div>
            <div v-for="a in localizedReport.advantages" :key="a.label" class="rounded-xl bg-orange-50 border border-orange-100 p-6 text-center">
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
                <tr v-for="c in localizedReport.concerns" :key="c.concern">
                  <td class="px-4 py-3 text-gray-800 font-medium">{{ c.concern }}</td>
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
            <div v-for="h in localizedReport.hospitals" :key="h.name" class="rounded-xl border border-orange-100 bg-orange-50/30 p-5">
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
              <div class="font-medium text-gray-900">{{ localizedReport.direction }}</div>
            </div>
            <div class="rounded-xl bg-gray-50 p-4">
              <div class="text-sm text-gray-500 mb-1">{{ t('report.duration') }}</div>
              <div class="font-medium text-gray-900">{{ localizedReport.duration }}</div>
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
                  <tr v-for="b in localizedReport.breakdown" :key="b.item">
                    <td class="px-4 py-3 text-gray-800">{{ b.item }}</td>
                    <td class="px-4 py-3 text-right text-[#C05621] font-semibold whitespace-nowrap">{{ b.cost }}</td>
                  </tr>
                  <tr class="bg-orange-50">
                    <td class="px-4 py-3 font-bold text-gray-900">{{ t('report.total') }}</td>
                    <td class="px-4 py-3 text-right font-bold text-[#C05621] whitespace-nowrap">$14,300 - $25,500</td>
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
                v-for="pkg in localizedReport.packages"
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
                <button
                  :class="[
                    'mt-5 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors',
                    pkg.highlight
                      ? 'bg-[#DD6B20] text-white hover:bg-[#C05621]'
                      : 'border border-[#DD6B20] text-[#DD6B20] hover:bg-orange-50',
                  ]"
                >
                  {{ lt(localText.choosePackage) }}
                </button>
              </div>
            </div>

            <div class="rounded-xl bg-white border border-orange-100 p-5">
              <h4 class="font-bold text-gray-900 mb-3">{{ lt(localText.highlights) }}</h4>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="h in localizedReport.highlights" :key="h" class="flex items-center gap-2 text-sm text-gray-700">
                  <Star class="h-4 w-4 text-[#ED8936] shrink-0" />
                  {{ h }}
                </div>
              </div>
            </div>

            <div class="mt-6 text-center">
              <p class="text-sm text-gray-500 mb-3">{{ lt(localText.contactHint) }}</p>
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
      <!-- Step 0: 基础信息 -->
      <div v-if="step === 0">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ t('report.basicInfo') }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ t('report.basicInfoHint') }}</p>
        </div>

        <!-- 个人信息 -->
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-4">
            <User class="h-5 w-5 text-[#DD6B20]" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('report.sectionPersonal') }}</h3>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <!-- 姓名 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.fullName') }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.fullName"
                type="text"
                :placeholder="t('report.fullNamePlaceholder')"
                :class="controlClass('fullName')"
                @blur="markTouched('fullName')"
              />
              <p v-if="shouldShowError('fullName')" class="mt-1 text-xs text-red-500">{{ validationErrors.fullName }}</p>
            </div>
            <!-- 性别 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.gender') }} <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-3">
                <button
                  v-for="g in [
                    { value: 'male', label: t('report.genderMale') },
                    { value: 'female', label: t('report.genderFemale') },
                    { value: 'other', label: t('report.genderOther') },
                  ]"
                  :key="g.value"
                  :class="[
                    'flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                    form.gender === g.value
                      ? 'border-[#DD6B20] bg-orange-50 text-[#C05621] ring-1 ring-[#DD6B20]'
                      : 'border-gray-300 text-gray-700 hover:border-orange-200 hover:bg-orange-50/30',
                  ]"
                  @click="form.gender = g.value; markTouched('gender')"
                >
                  {{ g.label }}
                </button>
              </div>
              <p v-if="shouldShowError('gender')" class="mt-1 text-xs text-red-500">{{ validationErrors.gender }}</p>
            </div>
            <!-- 出生日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.dateOfBirth') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <CalendarDays class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <div class="grid grid-cols-3 gap-2 pl-9">
                  <select
                    :value="birthDateParts.year"
                    :class="dateSelectClass('dateOfBirth')"
                    @change="setBirthDatePart('year', ($event.target as HTMLSelectElement).value); markTouched('dateOfBirth')"
                    @blur="markTouched('dateOfBirth')"
                  >
                    <option value="" disabled>{{ lt(localText.year) }}</option>
                    <option v-for="year in birthYears" :key="year" :value="year">{{ year }}</option>
                  </select>
                  <select
                    :value="birthDateParts.month"
                    :class="dateSelectClass('dateOfBirth')"
                    @change="setBirthDatePart('month', ($event.target as HTMLSelectElement).value); markTouched('dateOfBirth')"
                    @blur="markTouched('dateOfBirth')"
                  >
                    <option value="" disabled>{{ lt(localText.month) }}</option>
                    <option v-for="month in birthMonths" :key="month" :value="String(month).padStart(2, '0')">{{ formatMonth(month) }}</option>
                  </select>
                  <select
                    :value="birthDateParts.day"
                    :class="dateSelectClass('dateOfBirth')"
                    @change="setBirthDatePart('day', ($event.target as HTMLSelectElement).value); markTouched('dateOfBirth')"
                    @blur="markTouched('dateOfBirth')"
                  >
                    <option value="" disabled>{{ lt(localText.day) }}</option>
                    <option v-for="day in birthDays" :key="day" :value="String(day).padStart(2, '0')">{{ day }}</option>
                  </select>
                </div>
              </div>
              <p v-if="shouldShowError('dateOfBirth')" class="mt-1 text-xs text-red-500">{{ validationErrors.dateOfBirth }}</p>
            </div>
            <!-- 国籍 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.nationality') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <Globe class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  v-model="form.nationality"
                  :class="selectClass('nationality')"
                  @change="markTouched('nationality')"
                  @blur="markTouched('nationality')"
                >
                  <option value="" disabled>{{ t('report.nationalityPlaceholder') }}</option>
                  <optgroup v-for="group in nationalityGroups" :key="lt(group.label)" :label="lt(group.label)">
                    <option v-for="n in group.options" :key="n" :value="n">
                      {{ n === '其他' ? lt(localText.other) : displayNames.of(n) || n }}
                    </option>
                  </optgroup>
                </select>
              </div>
              <p v-if="shouldShowError('nationality')" class="mt-1 text-xs text-red-500">{{ validationErrors.nationality }}</p>
            </div>
            <!-- 证件类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.idType') }}
              </label>
              <div class="relative">
                <CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  v-model="form.idType"
                  :class="selectClass('idType')"
                  @change="markTouched('idType'); markTouched('idNumber')"
                  @blur="markTouched('idType')"
                >
                  <option value="passport">{{ t('report.idTypePassport') }}</option>
                  <option value="id_card">{{ t('report.idTypeIdCard') }}</option>
                  <option value="other">{{ t('report.idTypeOther') }}</option>
                </select>
              </div>
              <p v-if="shouldShowError('idType')" class="mt-1 text-xs text-red-500">{{ validationErrors.idType }}</p>
            </div>
            <!-- 证件号码 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.idNumber') }}
              </label>
              <input
                v-model="form.idNumber"
                type="text"
                :placeholder="t('report.idNumberPlaceholder')"
                autocomplete="off"
                :class="controlClass('idNumber')"
                @blur="markTouched('idNumber')"
              />
              <p v-if="shouldShowError('idNumber')" class="mt-1 text-xs text-red-500">{{ validationErrors.idNumber }}</p>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-4">
            <Mail class="h-5 w-5 text-[#DD6B20]" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('report.sectionContact') }}</h3>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <!-- 手机号 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.phone') }}
              </label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  v-model="form.phone"
                  type="tel"
                  :placeholder="t('report.phonePlaceholder')"
                  inputmode="tel"
                  :class="controlClass('phone', true)"
                  @blur="markTouched('phone')"
                />
              </div>
              <p v-if="shouldShowError('phone')" class="mt-1 text-xs text-red-500">{{ validationErrors.phone }}</p>
            </div>
            <!-- 邮箱 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.email') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  v-model="form.email"
                  type="email"
                  :placeholder="t('report.emailPlaceholder')"
                  autocomplete="email"
                  :class="controlClass('email', true)"
                  @blur="markTouched('email')"
                />
              </div>
              <p v-if="shouldShowError('email')" class="mt-1 text-xs text-red-500">{{ validationErrors.email }}</p>
            </div>
            <!-- 常住城市 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.city') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  v-model="form.city"
                  type="text"
                  :placeholder="t('report.cityPlaceholder')"
                  :class="controlClass('city', true)"
                  @blur="markTouched('city')"
                />
              </div>
              <p v-if="shouldShowError('city')" class="mt-1 text-xs text-red-500">{{ validationErrors.city }}</p>
            </div>
            <!-- 首选语言 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.preferredLanguage') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <Languages class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  v-model="form.preferredLanguage"
                  :class="selectClass('preferredLanguage')"
                  @change="markTouched('preferredLanguage')"
                  @blur="markTouched('preferredLanguage')"
                >
                  <option value="" disabled>{{ lt(localText.selectLanguage) }}</option>
                  <option v-for="l in languageOptions" :key="l.value" :value="l.value">{{ l.label }}</option>
                </select>
              </div>
              <p v-if="shouldShowError('preferredLanguage')" class="mt-1 text-xs text-red-500">{{ validationErrors.preferredLanguage }}</p>
            </div>
          </div>
        </div>

        <!-- 就医信息 -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <HeartPulse class="h-5 w-5 text-[#DD6B20]" />
            <h3 class="text-base font-semibold text-gray-800">{{ t('report.sectionMedical') }}</h3>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <!-- 就医目的 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.visitPurpose') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <Stethoscope class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  v-model="form.visitPurpose"
                  :class="selectClass('visitPurpose')"
                  @change="markTouched('visitPurpose')"
                  @blur="markTouched('visitPurpose')"
                >
                  <option value="" disabled>{{ lt(localText.selectPurpose) }}</option>
                  <option v-for="p in purposeOptions" :key="p.value" :value="p.value">{{ lt(p.label) }}</option>
                </select>
              </div>
              <p v-if="shouldShowError('visitPurpose')" class="mt-1 text-xs text-red-500">{{ validationErrors.visitPurpose }}</p>
            </div>
            <!-- 占位保持网格对齐 -->
            <div class="hidden md:block" />
            <!-- 疾病/症状描述 -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('report.chiefComplaint') }} <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.chiefComplaint"
                :placeholder="t('report.chiefComplaintPlaceholder')"
                maxlength="500"
                rows="4"
                :class="textareaClass('chiefComplaint')"
                @blur="markTouched('chiefComplaint')"
              />
              <div class="mt-1 flex items-center justify-between gap-3">
                <p v-if="shouldShowError('chiefComplaint')" class="text-xs text-red-500">{{ validationErrors.chiefComplaint }}</p>
                <p v-else class="text-xs text-gray-400">{{ t('report.chiefComplaintHint') }}</p>
                <div class="text-right text-xs text-gray-400 shrink-0">
                  {{ form.chiefComplaint.length }} / 500
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Region -->
      <div v-if="step === 1">
        <h2 class="text-xl font-bold text-gray-900 mb-4">{{ t('report.selectRegion') }}</h2>
        <p class="mb-4 text-sm text-gray-500">{{ lt(localText.regionHint) }}</p>
        <div class="grid md:grid-cols-2 gap-3">
          <button
            v-for="r in regionOptions"
            :key="r.value"
            :class="[
              'rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all flex items-center gap-2',
              selectedRegions.includes(r.value)
                ? 'border-[#DD6B20] bg-orange-50 text-[#C05621] ring-1 ring-[#DD6B20]'
                : 'border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50',
            ]"
            @click="toggleRegion(r.value)"
          >
            <div
              :class="[
                'h-4 w-4 rounded border flex items-center justify-center',
                selectedRegions.includes(r.value) ? 'bg-[#DD6B20] border-[#DD6B20]' : 'border-gray-300',
              ]"
            >
              <Check v-if="selectedRegions.includes(r.value)" class="h-3 w-3 text-white" />
            </div>
            {{ lt(r.label) }}
          </button>
        </div>
        <p v-if="regionAttempted && !isStep1Valid" class="mt-3 text-sm text-red-500">{{ lt(localText.regionError) }}</p>
      </div>

      <!-- Step 2: 确认生成 -->
      <div v-if="step === 2" class="text-center py-8">
        <h2 class="text-xl font-bold text-gray-900 mb-2">{{ lt(localText.confirmTitle) }}</h2>
        <p class="text-gray-600 text-sm mb-6">
          {{ lt(localText.confirmPrefix) }}
          <span class="font-semibold text-[#C05621]">{{ visitPurposeLabel ? lt(visitPurposeLabel) : '-' }}</span>
          {{ lt(localText.confirmMiddle) }}
          {{ selectedRegionLabels.length ? selectedRegionLabels.join(regionJoiner) : lt(localText.selectedRegionsFallback) }}
          {{ lt(localText.confirmSuffix) }}
        </p>
        <div v-if="generating" class="flex flex-col items-center gap-3">
          <Loader2 class="h-10 w-10 text-[#DD6B20] animate-spin" />
          <p class="text-sm text-gray-500">{{ t('report.generating') }}</p>
        </div>
        <p v-if="submissionError" class="mb-4 text-sm text-red-500">{{ submissionError }}</p>
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

    <div v-if="step < 2" class="mt-6 flex items-center justify-between">
      <button
        :disabled="step === 0"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="prevStep"
      >
        <ArrowLeft class="h-4 w-4" />
        {{ t('common.prev') }}
      </button>
      <button
        :disabled="(step === 0 && submitAttempted && !isStep0Valid) || (step === 1 && regionAttempted && !isStep1Valid)"
        :class="[
          'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow transition-colors',
          (step === 0 && submitAttempted && !isStep0Valid) || (step === 1 && regionAttempted && !isStep1Valid)
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#DD6B20] text-white hover:bg-[#C05621]',
        ]"
        @click="nextStep"
      >
        {{ t('common.next') }}
        <ArrowRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
