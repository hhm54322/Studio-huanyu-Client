<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileImage,
  Globe2,
  MapPin,
  MessageCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  UploadCloud,
} from 'lucide-vue-next'
import { createDentalAssessment, getSubmissionErrorMessage } from '@/services/patientSubmissions'

type DentalStep = 1 | 2 | 3

interface DentalProject {
  id: string
  title: string
  price: string
  copy: string
  image: string
  detail: string
  duration: string
  suitable: string
  icon: string
  note?: string
}

interface DentalDoctor {
  id: number
  name: string
  title: string
  hospital: string
  city: string
  experience: string
  languages: string[]
  background: string
  specialty: string
  rating: string
  cases: string
  portrait: string
  tags: string[]
  bio?: string
  credentials?: string[]
  startingPrice: number
}

const projects: DentalProject[] = [
  { id: 'implant', title: '种植牙', price: '¥5,000 起', copy: '单颗/多颗/半口全口，数字化导板种植', image: '/images/equipment/image1.jpeg', icon: '/images/figma/dental-source/icon-implant.svg', detail: '检查评估 - 植入手术 -愈合期 - 牙冠修复', duration: '3-6个月', suitable: '单颗/多颗牙缺失，缺牙时间较长者', note: '需进行口腔检查，排除禁忌症' },
  { id: 'whitening', title: '牙齿美白', price: '¥1,200 起', copy: '冷光美白 / 家庭美白，单次见效', image: '/images/equipment/image4.jpeg', icon: '/images/figma/dental-source/icon-whitening.svg', detail: '根据牙齿敏感情况选择诊室或家庭美白方案。', duration: '1-2周', suitable: '希望改善外源性色素和轻度黄牙问题' },
  { id: 'veneer', title: '牙齿贴面', price: '¥2,800/颗', copy: '全瓷贴面/树脂贴面前牙美学修复', image: '/images/happy-patient.jpg', icon: '/images/figma/dental-source/icon-veneer.svg', detail: '通过微创或无创方式改善前牙颜色、形态和轻度排列问题。', duration: '5-10天', suitable: '前牙颜色、形态和轻度间隙问题' },
  { id: 'aligner', title: '隐形正畸', price: '¥18,000 起', copy: '隐形矫治器/舌侧矫正，远程复诊', image: '/images/doctor-team.jpg', icon: '/images/figma/dental-source/icon-aligner.svg', detail: '根据面型、咬合和牙齿移动目标制定分期矫治方案。', duration: '12-24个月', suitable: '希望改善牙列和咬合、重视美观的成人' },
  { id: 'crown', title: '全瓷牙冠', price: '¥3,500 /颗', copy: '二氧化锆/玻璃陶瓷，颜色自然', image: '/images/patient-case.jpg', icon: '/images/figma/dental-source/icon-crown.svg', detail: '针对严重龋坏、缺损或旧修复体，提供美学和功能兼顾的修复。', duration: '7-14天', suitable: '牙体缺损、根管治疗后或需要美学修复者' },
  { id: 'periodontal', title: '洁牙 / 牙周', price: '¥280 起', copy: '超声波洁牙/牙周系统治疗', image: '/images/equipment/image2.jpeg', icon: '/images/figma/dental-source/icon-periodontal.svg', detail: '从基础洁治到牙周系统治疗，帮助控制牙龈出血和牙周炎症。', duration: '1-4次就诊', suitable: '牙龈出血、牙结石或牙周维护需求' },
  { id: 'root-canal', title: '根管治疗', price: '¥1,200 起', copy: '显微根管/热牙胶充填', image: '/images/equipment/image3.jpeg', icon: '/images/figma/dental-source/icon-root-canal.svg', detail: '以显微视野完成感染清除、根管充填和后续牙体保护。', duration: '1-3次就诊', suitable: '牙髓炎、根尖周炎和复杂根管病例' },
  { id: 'children', title: '儿童齿科', price: '¥200 起', copy: '涂氟/窝沟封闭/早期矫正', image: '/images/hospital-sh.jpg', icon: '/images/figma/dental-source/icon-children.svg', detail: '围绕儿童龋齿预防、早期咬合干预和舒适化就诊设计。', duration: '按治疗计划', suitable: '儿童口腔保健及早期矫正需求' },
]

function detailBeforeEnter(element: Element) {
  const panel = element as HTMLElement
  panel.style.height = '0px'
  panel.style.opacity = '0'
}
function detailEnter(element: Element) {
  const panel = element as HTMLElement
  const height = panel.scrollHeight
  requestAnimationFrame(() => {
    panel.style.height = `${height}px`
    panel.style.opacity = '1'
  })
}
function detailAfterEnter(element: Element) {
  (element as HTMLElement).style.height = ''
}
function detailBeforeLeave(element: Element) {
  const panel = element as HTMLElement
  panel.style.height = `${panel.getBoundingClientRect().height}px`
  panel.style.opacity = '1'
}
function detailLeave(element: Element) {
  const panel = element as HTMLElement
  requestAnimationFrame(() => {
    panel.style.height = '0px'
    panel.style.opacity = '0'
  })
}

const doctors: DentalDoctor[] = [
  { id: 4, name: '郑雨容', title: '主任医师/教授', hospital: '上海交通大学医学院附属第九人民医院', city: '上海', experience: '26年经验', languages: ['中文', 'English', 'Русский'], background: '公立三甲 · 种植科', specialty: '擅长复杂种植手术、尤其骨量微弱及即刻种植修复有丰富经验', rating: '5.0', cases: '3,200+', portrait: '/images/figma/expert-shao-zhimin-avatar.png', tags: ['数字化种植', '骨增量'], startingPrice: 28000, bio: '郑雨容，主任医师，种植学科带头人，毕业于上海交通大学医学院，从事口腔种植临床工作26年。擅长复杂种植手术、尤其骨量微弱及即刻种植修复具有丰富经验。', credentials: ['医师执业证书(可查)', '主任医师职称', 'ITI国际口腔种植学会会员', 'DIO种植牙高级教授'] },
  { id: 3, name: '张俊廷', title: '主任医师/教授', hospital: '北京天坛医院', city: '北京', experience: '26年经验', languages: ['中文', 'English'], background: '公立三甲 · 牙周与种植', specialty: '牙齿周围支持组织（牙龈、牙槽骨）的诊治，擅长洁牙、牙周刮治及手术', rating: '4.9', cases: '2,100+', portrait: '/images/figma/expert-zhang-junting-avatar.png', tags: ['牙周治疗', '复杂种植'], startingPrice: 18000 },
  { id: 2, name: '李进', title: '主任医师/博导', hospital: '上海复旦医院', city: '上海', experience: '26年经验', languages: ['中文', 'English', 'Русский'], background: '公立三甲 · 口腔修复科', specialty: '缺失牙齿的修复与美学重建，擅长全冠、全口假牙、瓷贴面', rating: '5.0', cases: '2,800+', portrait: '/images/figma/expert-li-jin-avatar.png', tags: ['美学修复', '种植修复'], startingPrice: 22000 },
  { id: 1, name: '吴一龙', title: '终身首席教授', hospital: '广东省人民医院', city: '广州', experience: '18年经验', languages: ['中文', 'English'], background: '公立三甲 · 国际医疗部', specialty: '牙齿硬组织修复与牙髓治疗，擅长显微根管治疗、补牙', rating: '4.9', cases: '1,200+', portrait: '/images/figma/expert-wu-yilong-avatar.png', tags: ['显微根管', '舒适化治疗'], startingPrice: 12000 },
]

const activeStep = ref<DentalStep>(1)
const selectedProjectId = ref('whitening')
const expandedProjectIds = ref<Set<string>>(new Set(['implant']))
const filters = ref({ city: '', title: '', experience: '', background: '', language: '', price: '' })
const appliedFilters = ref({ ...filters.value })
const sortMode = ref<'recommended' | 'experience' | 'cases' | 'rating' | 'price'>('recommended')
const selectedDoctor = ref<DentalDoctor | null>(null)
const doctorTab = ref<'profile' | 'cases' | 'reviews'>('profile')
const modalCloseButton = ref<HTMLButtonElement | null>(null)
const uploadFiles = ref<File[]>([])
const uploadStatus = ref<'idle' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
const submitted = ref(false)
const submitError = ref('')
const form = ref({ notes: '', visitTime: '', budget: '' })
const modalTrigger = ref<HTMLButtonElement | null>(null)
const modalPanel = ref<HTMLElement | null>(null)
let assessmentRequestId = crypto.randomUUID()

const filteredDoctors = computed(() => {
  const filtered = doctors.filter((doctor) => {
    const current = appliedFilters.value
    if (current.city && doctor.city !== current.city) return false
    if (current.title && !doctor.title.includes(current.title)) return false
    if (current.experience === '20年以上' && !doctor.experience.includes('26')) return false
    if (current.experience === '10-20年' && !doctor.experience.includes('18')) return false
    if (current.background && !doctor.background.includes(current.background)) return false
    if (current.language && !doctor.languages.includes(current.language)) return false
    if (current.price === '¥10,000 以下' && doctor.startingPrice > 10000) return false
    if (current.price === '¥10,000-30,000' && (doctor.startingPrice < 10000 || doctor.startingPrice > 30000)) return false
    return true
  })
  return filtered.sort((a, b) => {
    if (sortMode.value === 'experience') return Number(b.experience.match(/\d+/)?.[0] || 0) - Number(a.experience.match(/\d+/)?.[0] || 0)
    if (sortMode.value === 'cases') return Number(b.cases.replace(/\D/g, '')) - Number(a.cases.replace(/\D/g, ''))
    if (sortMode.value === 'rating') return Number(b.rating) - Number(a.rating)
    if (sortMode.value === 'price') return a.startingPrice - b.startingPrice
    return 0
  })
})

function setStep(step: DentalStep) {
  activeStep.value = step
  nextTick(() => document.querySelector('.dental-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function chooseProject(project: DentalProject) {
  selectedProjectId.value = project.id
  const next = new Set(expandedProjectIds.value)
  if (next.has(project.id)) next.delete(project.id)
  else next.add(project.id)
  expandedProjectIds.value = next
}
function isProjectExpanded(projectId: string) {
  return expandedProjectIds.value.has(projectId)
}

function resetFilters() {
  filters.value = { city: '', title: '', experience: '', background: '', language: '', price: '' }
  appliedFilters.value = { ...filters.value }
}

function applyFilters() {
  appliedFilters.value = { ...filters.value }
}

function openDoctor(doctor: DentalDoctor) {
  modalTrigger.value = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null
  selectedDoctor.value = doctor
  doctorTab.value = 'profile'
}

function closeDoctor() {
  selectedDoctor.value = null
}

function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  assessmentRequestId = crypto.randomUUID()
  const invalid = files.length > 5 || files.some((file) => file.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type))
  uploadFiles.value = files.slice(0, 5)
  if (invalid) {
    uploadFiles.value = []
    input.value = ''
    uploadStatus.value = 'error'
    submitError.value = files.length > 5 ? '最多上传 5 个文件。' : '仅支持 JPG、PNG 或 PDF，且单个文件不能超过 10MB。'
    return
  }
  submitError.value = ''
  submitted.value = false
  uploadStatus.value = uploadFiles.value.length ? 'ready' : 'idle'
}

function retryUpload() {
  uploadStatus.value = uploadFiles.value.length ? 'ready' : 'idle'
  submitError.value = ''
}

function openPhotoExample() {
  window.open('/images/figma/dental-upload-example.png', '_blank', 'noopener,noreferrer')
}

async function submitForm() {
  if (!uploadFiles.value.length) {
    uploadStatus.value = 'error'
    submitError.value = '请至少上传一份牙片或口腔照片。'
    return
  }
  if (uploadStatus.value === 'submitting') return
  uploadStatus.value = 'submitting'
  submitError.value = ''
  try {
    await createDentalAssessment({ requestId: assessmentRequestId, projectId: selectedProjectId.value, budget: form.value.budget, visitTime: form.value.visitTime, notes: form.value.notes }, uploadFiles.value)
    submitted.value = true
    uploadStatus.value = 'success'
  } catch (error) {
    uploadStatus.value = 'error'
    submitError.value = getSubmissionErrorMessage(error, '提交失败，请检查网络后重试。')
  }
}

function contactSupport() {
  window.dispatchEvent(new CustomEvent('open-consultation'))
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && selectedDoctor.value) closeDoctor()
  if (event.key !== 'Tab' || !selectedDoctor.value || !modalPanel.value) return
  const focusable = Array.from(modalPanel.value.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

watch(selectedDoctor, async (doctor) => {
  document.body.style.overflow = doctor ? 'hidden' : ''
  if (doctor) {
    window.addEventListener('keydown', handleKeydown)
    await nextTick()
    modalCloseButton.value?.focus()
  } else {
    window.removeEventListener('keydown', handleKeydown)
    nextTick(() => modalTrigger.value?.focus())
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="dental-page" :class="`dental-page--step-${activeStep}`">
    <section class="dental-hero" :class="`dental-hero--step-${activeStep}`">
      <div class="dental-hero__backdrop" />
      <div class="hy-container dental-hero__content" data-reveal>
        <h1>匹配城市与医生<br />获取个性化治疗方案</h1>
        <p>种植牙、牙齿美白、牙齿贴面、正畸、修复一一先了解项目，再自主选择城市与医生，最后获取书面报价</p>
      </div>
    </section>

    <section class="dental-steps" aria-label="牙科服务流程">
      <div class="hy-container dental-steps__inner">
        <template v-for="step in ([1, 2, 3] as DentalStep[])" :key="step">
          <button type="button" :class="{ active: activeStep === step }" @click="setStep(step)">
            <span>0{{ step }}</span>
            <strong>{{ step === 1 ? '选择牙科项目' : step === 2 ? '城市与医生匹配' : '上传影像资料' }}</strong>
          </button>
          <i v-if="step < 3" class="dental-step-connector" aria-hidden="true" />
        </template>
      </div>
    </section>

    <main class="dental-workspace">
      <section v-if="activeStep === 1" class="dental-section dental-projects hy-container">
        <div class="dental-section__heading">
          <div><span class="hy-kicker">01 · DENTAL SERVICES</span><h2>选择适合你的牙科项目</h2><p>固定示例价格用于方案预览，最终费用以医院检查和书面报价为准。</p></div>
          <span class="dental-section__counter">{{ projects.length }} 个项目</span>
        </div>
        <div class="dental-project-grid">
          <button v-for="project in projects" :key="project.id" type="button" class="dental-project-card" :class="{ selected: selectedProjectId === project.id, expanded: isProjectExpanded(project.id) }" :aria-expanded="isProjectExpanded(project.id)" :aria-controls="`dental-project-detail-${project.id}`" @click="chooseProject(project)">
            <img class="dental-project-card__icon" :src="project.icon" alt="" aria-hidden="true" />
            <div class="dental-project-card__content"><h3>{{ project.title }}</h3><p class="dental-project-price"><span>参考价格：</span><strong>{{ project.price.match(/^¥[\d,]+/)?.[0] }}</strong><span>{{ project.price.replace(/^¥[\d,]+/, '') }}</span></p><p>{{ project.copy }}</p><b>查看详情 <ChevronDown class="h-4 w-4" /></b><Transition name="dental-accordion" @before-enter="detailBeforeEnter" @enter="detailEnter" @after-enter="detailAfterEnter" @before-leave="detailBeforeLeave" @leave="detailLeave"><div v-if="isProjectExpanded(project.id)" class="dental-project-detail-shell"><dl :id="`dental-project-detail-${project.id}`" class="dental-project-detail"><div><dt>适用人群：</dt><dd>{{ project.suitable }}</dd></div><div><dt>治疗流程：</dt><dd>{{ project.detail }}</dd></div><div><dt>周期：</dt><dd>{{ project.duration }}</dd></div><div v-if="project.note"><dt>注意事项：</dt><dd>{{ project.note }}</dd></div></dl></div></Transition></div>
          </button>
        </div>
        <div class="dental-project-next"><button type="button" class="dental-next-button" @click="setStep(2)">下一步 城市与医生匹配 <ArrowRight class="h-4 w-4" /></button></div>
      </section>

      <section v-else-if="activeStep === 2" class="dental-section dental-doctors hy-container">
        <div class="dental-section__heading">
          <div><span class="hy-kicker">02 · CITY & DOCTOR MATCH</span><h2>匹配城市与医生</h2><p>先筛选，再查看医生经历、语言和案例，获得更适合你的治疗方向。</p></div>
          <span class="dental-section__counter">共 {{ filteredDoctors.length }} 位医生</span>
        </div>
        <div class="dental-filter-bar" data-reveal>
          <label><span>城市</span><select v-model="filters.city"><option value="">全部城市</option><option>上海</option><option>广州</option><option>北京</option></select><ChevronDown class="h-4 w-4" /></label>
          <label><span>医生职称</span><select v-model="filters.title"><option value="">全部职称</option><option>主任医师</option><option>教授</option></select><ChevronDown class="h-4 w-4" /></label>
          <label><span>经验标签</span><select v-model="filters.experience"><option value="">全部经验</option><option>10-20年</option><option>20年以上</option></select><ChevronDown class="h-4 w-4" /></label>
          <label><span>机构背景</span><select v-model="filters.background"><option value="">全部机构</option><option>公立三甲</option><option>口腔修复科</option></select><ChevronDown class="h-4 w-4" /></label>
          <label><span>语言能力</span><select v-model="filters.language"><option value="">全部语言</option><option>English</option><option>Русский</option></select><ChevronDown class="h-4 w-4" /></label>
          <label><span>价格区间</span><select v-model="filters.price"><option value="">全部价格</option><option>¥10,000 以下</option><option>¥10,000-30,000</option></select><ChevronDown class="h-4 w-4" /></label>
          <button type="button" class="dental-filter-submit" @click="applyFilters"><Search class="h-4 w-4" />筛选</button>
          <button type="button" title="重置筛选" class="dental-reset" @click="resetFilters"><RotateCcw class="h-4 w-4" />重置</button>
        </div>
        <div class="dental-sort-row" aria-label="医生排序"><button type="button" :class="{ active: sortMode === 'recommended' }" @click="sortMode = 'recommended'">综合推荐</button><button type="button" :class="{ active: sortMode === 'experience' }" @click="sortMode = 'experience'">经验优先</button><button type="button" :class="{ active: sortMode === 'cases' }" @click="sortMode = 'cases'">案例最多</button><button type="button" :class="{ active: sortMode === 'rating' }" @click="sortMode = 'rating'">评价最高</button><button type="button" :class="{ active: sortMode === 'price' }" @click="sortMode = 'price'">价格排序</button></div>
        <p class="dental-doctor-count">共 <strong>{{ filteredDoctors.length }}</strong> 位医生</p>
        <div class="dental-doctor-grid">
          <article v-for="doctor in filteredDoctors" :key="doctor.id" class="dental-doctor-card" :class="{ selected: doctor.id === 1 }" data-reveal>
            <div class="dental-doctor-card__top"><div class="dental-doctor-card__portrait"><img :src="doctor.portrait" :alt="doctor.name" /></div><div><h3>{{ doctor.name }}</h3><span>{{ doctor.title }}</span><small><MapPin class="h-3.5 w-3.5" />{{ doctor.hospital }}</small></div><span class="dental-doctor-card__rating"><Star class="h-3.5 w-3.5" />{{ doctor.rating }}</span></div>
            <div class="dental-doctor-card__meta"><span><Clock3 class="h-4 w-4" />{{ doctor.experience }}</span><span><Globe2 class="h-4 w-4" />{{ doctor.languages.join(' / ') }}</span></div>
            <p>{{ doctor.specialty }}</p>
            <div class="dental-doctor-card__tags"><span v-for="tag in doctor.tags" :key="tag">{{ tag }}</span></div>
            <button type="button" class="dental-doctor-card__button" @click="openDoctor(doctor)">了解更多 <ArrowRight class="h-4 w-4" /></button>
          </article>
        </div>
        <div v-if="!filteredDoctors.length" class="dental-empty"><Search class="h-6 w-6" /><p>暂无符合条件的医生，请调整筛选条件。</p></div>
        <div class="dental-step-actions"><button type="button" class="dental-ghost-button" @click="setStep(1)">返回选择项目</button><button type="button" class="dental-next-button" @click="setStep(3)">下一步：上传影像资料 <ArrowRight class="h-4 w-4" /></button></div>
      </section>

      <section v-else class="dental-section dental-upload hy-container">
        <div class="dental-section__heading"><div><span class="hy-kicker">03 · MEDICAL FILES</span><h2>上传影像资料</h2><p>上传牙片或口腔照片，医生会根据资料准备初步评估和书面报价。</p></div><span class="dental-section__counter">24h 内获取评估</span></div>
        <form class="dental-upload-layout" @submit.prevent="submitForm">
          <div class="dental-upload-media"><span class="dental-upload-label">上传牙片/口腔照片 <em>(JPG/PNG/PDF，≤10MB)</em></span><label class="dental-dropzone" :class="{ 'has-files': uploadFiles.length, 'is-uploading': uploadStatus === 'submitting', 'is-error': uploadStatus === 'error' }"><input type="file" accept=".jpg,.jpeg,.png,.pdf" multiple @change="handleFiles" /><UploadCloud class="h-10 w-10" /><strong>{{ uploadStatus === 'submitting' ? '提交中…' : uploadFiles.length ? `已选择 ${uploadFiles.length} 个文件` : '+' }}</strong><span>JPG / PNG / PDF，单个文件不超过 10MB</span><button type="button" class="dental-inline-action" @click.prevent="openPhotoExample">查看照片示例</button><ul v-if="uploadFiles.length"><li v-for="file in uploadFiles" :key="file.name"><FileImage class="h-4 w-4" />{{ file.name }}</li></ul></label><p class="dental-upload-status" aria-live="polite"><template v-if="uploadStatus === 'submitting'">正在安全上传资料…</template><template v-else-if="uploadStatus === 'ready'">文件已准备好，可提交评估</template><template v-else-if="uploadStatus === 'success'">资料提交成功</template><template v-else-if="uploadStatus === 'error'">{{ submitError }} <button v-if="uploadFiles.length" type="button" @click="retryUpload">重试</button></template></p></div>
          <div class="dental-upload-form"><div class="dental-form-grid"><label><span>预算范围</span><select v-model="form.budget"><option value="">请输入您的预算</option><option>¥5,000 - ¥20,000</option><option>¥20,000 - ¥50,000</option><option>¥50,000以上</option></select></label><label><span>计划到访时间</span><select v-model="form.visitTime"><option value="">请选择</option><option>1个月内</option><option>1-3个月</option><option>时间待定</option></select></label></div><label><span>其他说明</span><textarea v-model="form.notes" rows="5" placeholder="其他说明..." /></label><div class="dental-upload-trust"><ShieldCheck class="h-5 w-5" /><span>资料仅用于医疗评估，我们会保护你的隐私。</span></div><button class="dental-submit" type="submit" :disabled="uploadStatus === 'submitting' || submitted"><MessageCircle class="h-4 w-4" />{{ uploadStatus === 'submitting' ? '正在提交…' : '提交评估 · 24h 内获取书面报价' }} <ArrowRight class="h-4 w-4" /></button><p v-if="submitted" class="dental-success"><CheckCircle2 class="h-5 w-5" />资料已记录，顾问会尽快与你联系。</p></div>
        </form>
        <div class="dental-upload-footer"><button type="button" class="dental-ghost-button" @click="setStep(2)">返回匹配城市与医生</button><span>不确定如何准备？<button type="button" @click="contactSupport">联系 24 小时客服</button></span></div>
      </section>
    </main>

    <Teleport to="body">
      <Transition name="dental-modal">
        <div v-if="selectedDoctor" class="dental-modal-backdrop" @click.self="closeDoctor">
          <section ref="modalPanel" class="dental-doctor-modal" :class="`dental-doctor-modal--${doctorTab}`" role="dialog" aria-modal="true" aria-label="医生详情">
            <button ref="modalCloseButton" type="button" class="dental-modal-close" aria-label="关闭医生详情" @click="closeDoctor"><img src="/images/figma/doctor-modal-close.svg" alt="" /></button>
            <h2>医生详情</h2>
            <header class="dental-modal-profile"><div class="dental-modal-profile__portrait"><img :src="selectedDoctor.portrait" :alt="selectedDoctor.name" /></div><div class="dental-modal-profile__details"><div class="dental-modal-profile__identity"><h3>{{ selectedDoctor.name }}</h3><p>{{ selectedDoctor.title }}</p></div><span><img src="/images/figma/doctor-modal-hospital.svg" alt="" />{{ selectedDoctor.hospital }}</span><small><img src="/images/figma/doctor-modal-experience.svg" alt="" />{{ selectedDoctor.experience }}</small></div></header>
            <nav class="dental-modal-tabs"><button v-for="tab in ([['profile', '医生简介'], ['cases', '案例集'], ['reviews', '患者评价']] as const)" :key="tab[0]" type="button" :class="{ active: doctorTab === tab[0] }" @click="doctorTab = tab[0]">{{ tab[1] }}<template v-if="doctorTab !== 'profile'"><span v-if="tab[0] === 'cases'">（32）</span><span v-if="tab[0] === 'reviews'">（128）</span></template></button></nav>
            <div v-if="doctorTab === 'profile'" class="dental-modal-panel"><p>{{ selectedDoctor.bio ?? `${selectedDoctor.name}，${selectedDoctor.title}，从事口腔临床工作${selectedDoctor.experience.replace('经验', '')}。擅长复杂种植、数字化修复和跨境患者治疗方案设计，为国际患者提供清晰的治疗路径。` }}</p><h4>专业资质</h4><ul><li v-for="credential in (selectedDoctor.credentials ?? ['医师执业证书（可查）', '主任医师职称', '国际口腔种植学会会员', '多语种医疗沟通经验'])" :key="credential"><img src="/images/figma/doctor-modal-credential.svg" alt="" />{{ credential }}</li></ul></div>
            <div v-else-if="doctorTab === 'cases'" class="dental-modal-list dental-modal-list--cases"><article><b>半口种植 · 数字化导板</b><p>美国患者，半口缺牙多年。采用数字化导板精准种植，2次到诊完成。整体费用较美国节省约65%。</p><small>上海 · 2025.08 · 已匿名授权</small></article><article><b>单颗后牙种植</b><p>新加坡患者，后牙缺失伴骨量不足。完成植骨+种植，全程1次到诊+远程复诊。</p><small>上海 · 2025.05 · 已匿名授权</small></article><article><b>美学区种植修复</b><p>菲律宾患者，上颌半口牙缺失伴重度骨吸收。完成4枚植体半口即刻负重，全程2次到诊+远程复诊。</p><small>上海 · 2025.03 · 已匿名授权</small></article></div>
            <div v-else class="dental-modal-list dental-modal-list--reviews"><article><b><img src="/images/figma/doctor-review-star.svg" alt="" />5.0</b><h3>美国 · 半口种植</h3><p>从咨询到回国的每一步都有人安排妥当，翻译全程陪同，和医生沟通毫无障碍。种牙过程比想象中轻松太多。</p><small><i>—</i>2025.08 · 已匿名授权 · 来自生活服务平台</small></article><article><b><img src="/images/figma/doctor-review-star.svg" alt="" />5.0</b><h3>澳大利亚 · 隐形矫正</h3><p>出发前就拿到了完整的治疗方案和报价单，每一项费用写得清清楚楚。在中国看牙的体验远超我的预期。</p><small><i>—</i>2025.06 · 已匿名授权 · 来自生活服务平台</small></article><article><b><img src="/images/figma/doctor-review-star.svg" alt="" />5.0</b><h3>澳大利亚 · 隐形矫正</h3><p>出发前就拿到了完整的治疗方案和报价单，每一项费用写得清清楚楚。在中国看牙的体验远超我的预期。</p><small><i>—</i>2025.06 · 已匿名授权 · 来自生活服务平台</small></article></div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dental-page { --dental-ink: #153a68; --dental-blue: #3778ef; --dental-cyan: #46d6ec; --dental-orange: #ea6f1f; margin-top:-72px; color: #173b5b; background: #fff; }
.dental-hero { position: relative; min-height: 490px; display: grid; align-items: center; overflow: hidden; isolation: isolate; background: #edf7fb; }
.dental-hero__backdrop { position: absolute; inset: 0; z-index: -2; background: linear-gradient(90deg, rgba(239,248,252,.98) 0%, rgba(239,248,252,.86) 44%, rgba(239,248,252,.1) 76%), url('/images/doctor-team.jpg') 82% 28% / 55% auto no-repeat; }
.dental-hero--step-3 .dental-hero__backdrop { background: linear-gradient(90deg, rgba(239,248,252,.98) 0%, rgba(239,248,252,.85) 44%, rgba(239,248,252,.1) 76%), url('/images/equipment/image2.jpeg') 82% 50% / 55% auto no-repeat; }
.dental-hero__content { padding: 145px 0 68px; }
.dental-hero h1 { max-width: 700px; margin: 0 0 24px; color: var(--dental-ink); font-size: 54px; line-height: 1.45; }
.dental-hero p { max-width: 620px; margin: 0; color: #687d90; font-size: 14px; line-height: 1.85; }
.dental-hero__cta, .dental-next-button, .dental-submit { display: inline-flex; align-items: center; justify-content: center; gap: 9px; border: 0; border-radius: 5px; padding: 0 20px; min-height: 48px; background: var(--dental-orange); color: #fff; font-size: 13px; font-weight: 750; cursor: pointer; transition: transform .25s ease, background .25s ease, box-shadow .25s ease; }
.dental-hero__cta { margin-top: 28px; }
.dental-hero__cta:hover, .dental-next-button:hover, .dental-submit:hover { transform: translateY(-2px); background: #ff9a70; box-shadow: 0 13px 28px rgba(255, 133, 88, .26); }
.dental-hero__signal { position: absolute; right: 8%; bottom: 10%; display: flex; gap: 7px; align-items: end; opacity: .7; }
.dental-hero__signal span { display: block; width: 3px; border-radius: 4px; background: var(--dental-cyan); animation: dental-signal 1.5s ease-in-out infinite alternate; }.dental-hero__signal span:nth-child(1) { height: 18px; }.dental-hero__signal span:nth-child(2) { height: 35px; animation-delay: .18s; }.dental-hero__signal span:nth-child(3) { height: 57px; animation-delay: .36s; }
.dental-steps { position:sticky; top:72px; z-index:20; background:rgba(255,255,255,.94); backdrop-filter:blur(16px); }
.dental-steps__inner { position:relative; display:grid; grid-template-columns:repeat(3,1fr); width:min(760px,calc(100% - 40px)); padding:54px 0 28px; }
.dental-steps__inner::before { position:absolute; top:69px; right:15%; left:15%; height:1px; background:#d7e1e8; content:''; }
.dental-steps button { position:relative; z-index:1; display:flex; align-items:center; justify-content:center; gap:12px; min-height:48px; border:0; padding:0; background:transparent; color:#9aa8b5; cursor:pointer; }.dental-steps button span { display:grid; width:38px; height:38px; place-items:center; border-radius:50%; background:#f2f5f7; color:#9aa8b5; font-size:12px; font-weight:800; }.dental-steps button.active { color:var(--dental-ink); }.dental-steps button.active span { background:var(--dental-ink); color:#fff; }.dental-steps strong { padding-right:12px; background:#fff; font-size:16px; }
.dental-workspace { min-height:720px; padding:46px 0 110px; background:#fff; scroll-margin-top:130px; }.dental-section__heading { display:none; }
.dental-project-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }.dental-project-card { position:relative; display:flex; min-height:255px; flex-direction:column; align-items:flex-start; border:1px solid transparent; border-radius:9px; padding:26px; background:#f4f6f8; color:var(--dental-ink); text-align:left; cursor:pointer; transition:border-color .25s ease,box-shadow .35s ease,background .3s ease; }.dental-project-card:hover { background:#f0f3f6; }.dental-project-card.selected { border-color:#1a1a1a; background:#fff; box-shadow:0 3px 0 rgba(0,0,0,.12); }.dental-project-card__icon { width:25px; color:var(--dental-blue); }.dental-project-card__content { display:flex; width:100%; min-height:180px; flex-direction:column; }.dental-project-card h3 { margin:auto 0 10px; font-size:20px; }.dental-project-card p { min-height:0; margin:5px 0 0; color:#687c8e; font-size:11px; line-height:1.65; }.dental-project-card p strong { color:var(--dental-blue); }.dental-project-card b { display:flex; align-items:center; justify-content:space-between; margin-top:13px; color:#9ba6af; font-size:10px; font-weight:500; }.dental-project-card.selected b svg { transform:rotate(180deg); }.dental-project-card dl { display:grid; gap:5px; margin:14px 0 0; border-top:1px solid #e3e8ec; padding-top:12px; }.dental-project-card dl div { display:flex; gap:4px; color:#5f7486; font-size:10px; line-height:1.55; }.dental-project-card dt { flex:none; color:#173b67; font-weight:700; }.dental-project-card dd { margin:0; }.dental-project-next { display:flex; justify-content:center; margin-top:45px; }
.dental-project-detail { display: grid; grid-template-columns: 52px minmax(0, 1.1fr) minmax(230px, .9fr) auto; gap: 18px; align-items: center; margin-top: 28px; border: 1px solid #dbe8ef; border-radius: 8px; padding: 24px; background: #fff; box-shadow: 0 16px 38px rgba(20,68,102,.07); }.dental-project-detail__icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 50%; background: #e5f8fb; color: var(--dental-blue); }.dental-project-detail span, .dental-project-detail dt { color: #7c96a7; font-size: 11px; }.dental-project-detail h3 { margin: 3px 0 5px; color: var(--dental-ink); font-size: 21px; }.dental-project-detail p { margin: 0; color: #657f91; font-size: 12px; line-height: 1.65; }.dental-project-detail dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 0; }.dental-project-detail dd { margin: 3px 0 0; color: #264d6b; font-size: 12px; line-height: 1.5; }.dental-project-detail .dental-next-button { white-space: nowrap; }
.dental-filter-bar { display: grid; grid-template-columns: repeat(5, 1fr) 44px; gap: 11px; margin-bottom: 26px; }.dental-filter-bar label { position: relative; display: grid; gap: 5px; }.dental-filter-bar label span { color: #7990a0; font-size: 10px; }.dental-filter-bar select { width: 100%; appearance: none; border: 1px solid #d5e3ea; border-radius: 5px; padding: 12px 30px 12px 12px; outline: none; background: #fff; color: #294f6d; font-size: 12px; cursor: pointer; }.dental-filter-bar label > svg { position: absolute; right: 10px; bottom: 13px; pointer-events: none; color: #7d95a5; }.dental-reset { align-self: end; display: grid; min-height: 39px; place-items: center; border: 1px solid #d5e3ea; border-radius: 5px; background: #fff; color: #5f7c91; cursor: pointer; transition: background .2s ease, color .2s ease, transform .2s ease; }.dental-reset:hover { transform: rotate(-25deg); background: #edf8fc; color: var(--dental-blue); }
.dental-doctor-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }.dental-doctor-card { position:relative; overflow:hidden; min-height:250px; border:1px solid transparent; border-radius:9px; padding:22px; background:#f4f6f8; transition:transform .35s ease,border-color .25s ease,box-shadow .35s ease; }.dental-doctor-card:hover { transform:translateY(-5px); border-color:var(--dental-ink); background:#fff; box-shadow:0 16px 34px rgba(20,57,86,.08); }.dental-doctor-card__top { display:grid; grid-template-columns:55px 1fr; gap:12px; align-items:center; }.dental-doctor-card__portrait { width:55px; height:55px; overflow:hidden; border-radius:12px; background:#e6eef3; }.dental-doctor-card__portrait img { width:100%; height:100%; object-fit:cover; object-position:50% 20%; }.dental-doctor-card h3 { display:inline; margin:0; color:var(--dental-ink); font-size:17px; }.dental-doctor-card__top>div:nth-child(2)>span { margin-left:7px; color:#6d7f8e; font-size:10px; }.dental-doctor-card__top small { display:flex; align-items:center; gap:4px; margin-top:6px; color:#8996a2; font-size:9px; }.dental-doctor-card__top small svg { width:12px; }.dental-doctor-card__rating { display:none; }.dental-doctor-card__meta { display:flex; gap:10px; margin-top:9px; padding:0 0 0 67px; }.dental-doctor-card__meta span { display:inline-flex; align-items:center; gap:4px; color:#8996a2; font-size:9px; }.dental-doctor-card__meta svg { width:12px; color:#7891a4; }.dental-doctor-card>p { min-height:54px; margin:45px 0 9px; color:#173b67; font-size:12px; font-weight:650; line-height:1.65; }.dental-doctor-card__tags { display:none; }.dental-doctor-card__button { display:inline-flex; align-items:center; gap:5px; border:0; padding:0; background:transparent; color:#ec6f20; font-size:10px; font-weight:700; cursor:pointer; }.dental-doctor-card__button svg { width:13px; }.dental-empty { display:grid; justify-items:center; gap:9px; padding:70px 20px; border:1px dashed #cddfe8; border-radius:8px; color:#7892a3; }.dental-empty p { margin:0; font-size:13px; }
.dental-step-actions,.dental-upload-footer { display:flex; justify-content:center; align-items:center; gap:16px; margin-top:45px; }.dental-ghost-button { border:1px solid #cbdde6; border-radius:5px; padding:0 17px; min-height:44px; background:#fff; color:#587589; font-size:11px; cursor:pointer; }.dental-upload-layout { display:flex; flex-direction:column; gap:28px; width:min(940px,100%); margin:0 auto; }.dental-dropzone { position:relative; display:flex; width:145px; min-height:145px; flex-direction:column; align-items:center; justify-content:center; gap:6px; border:1px dashed #c6d2da; border-radius:7px; background:#fff; color:#9ba7af; text-align:center; cursor:pointer; }.dental-dropzone:hover,.dental-dropzone.has-files { border-color:var(--dental-blue); background:#f6faff; }.dental-dropzone>svg { width:28px; color:#b4bdc4; }.dental-dropzone strong { color:#526b7e; font-size:10px; }.dental-dropzone>span { display:none; }.dental-dropzone input { position:absolute; width:1px; height:1px; opacity:0; }.dental-inline-action { position:absolute; top:155px; left:0; width:145px; border:0; padding:0; background:transparent; color:var(--dental-blue); font-size:10px; cursor:pointer; }.dental-dropzone ul { position:absolute; top:178px; left:0; width:300px; margin:0; padding:0; list-style:none; }.dental-dropzone li { display:flex; align-items:center; gap:6px; color:#60798b; font-size:9px; }.dental-upload-form { display:flex; flex-direction:column; gap:18px; padding:20px 0 0; border:0; background:#fff; box-shadow:none; }.dental-upload-form>label { order:2; display:grid; gap:7px; }.dental-upload-form .dental-form-grid { order:1; }.dental-upload-trust { order:3; }.dental-submit { order:4; align-self:center; }.dental-success { order:5; align-self:center; }.dental-upload-form label>span { color:#334f67; font-size:10px; font-weight:600; }.dental-upload-form textarea,.dental-upload-form select { width:100%; border:1px solid #d5dee5; border-radius:7px; padding:14px; outline:none; background:#fff; color:#294f6d; font-size:11px; resize:vertical; }.dental-form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:22px; }.dental-upload-trust { display:none; }.dental-submit { width:auto; min-width:290px; background:#ea6f1f; }.dental-success { display:flex; align-items:center; gap:8px; color:#249b73; font-size:11px; }.dental-upload-footer { justify-content:space-between; }.dental-upload-footer>span { color:#7a91a0; font-size:10px; }.dental-upload-footer>span button { border:0; padding:0; background:transparent; color:var(--dental-blue); font-size:inherit; cursor:pointer; }
.dental-assurance { padding: 28px 0; background: var(--dental-ink); color: #fff; }.dental-assurance .hy-container { display: grid; grid-template-columns: repeat(3, 1fr); }.dental-assurance .hy-container > div { display: grid; grid-template-columns: 25px 1fr; column-gap: 8px; align-items: center; padding: 8px 27px; border-left: 1px solid rgba(255,255,255,.17); }.dental-assurance .hy-container > div:first-child { border-left: 0; }.dental-assurance svg { grid-row: 1 / span 2; color: var(--dental-cyan); }.dental-assurance span { font-size: 13px; font-weight: 750; }.dental-assurance small { color: rgba(255,255,255,.56); font-size: 10px; }
.dental-modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 24px; background: rgba(3,21,37,.68); backdrop-filter: blur(9px); }.dental-doctor-modal { position: relative; width: min(850px, 100%); max-height: min(720px, calc(100vh - 48px)); overflow: auto; border-radius: 13px; padding: 34px 35px 38px; background: #fff; box-shadow: 0 30px 90px rgba(0,0,0,.3); }.dental-modal-close { position: absolute; top: 19px; right: 19px; display: grid; width: 34px; height: 34px; place-items: center; border: 0; border-radius: 50%; background: #edf3f7; color: #537187; cursor: pointer; transition: background .2s ease, transform .2s ease; }.dental-modal-close:hover { transform: rotate(90deg); background: #d9eef4; color: var(--dental-ink); }.dental-doctor-modal h2 { margin: 8px 0 19px; color: var(--dental-ink); font-size: 34px; }.dental-modal-profile { display: flex; align-items: center; gap: 15px; }.dental-modal-profile__portrait { width: 66px; height: 66px; overflow: hidden; border-radius: 50%; background: #e6f1f6; }.dental-modal-profile__portrait img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 25%; }.dental-modal-profile h3 { display: inline; color: var(--dental-ink); font-size: 18px; }.dental-modal-profile p { display: inline; margin-left: 9px; color: #638096; font-size: 12px; }.dental-modal-profile span, .dental-modal-profile small { display: flex; align-items: center; gap: 5px; margin-top: 5px; color: #7a919f; font-size: 10px; }.dental-modal-tabs { display: flex; gap: 24px; margin-top: 25px; border-bottom: 1px solid #e0e9ee; }.dental-modal-tabs button { position: relative; border: 0; padding: 0 0 12px; background: transparent; color: #8295a2; font-size: 13px; cursor: pointer; }.dental-modal-tabs button.active { color: var(--dental-blue); font-weight: 750; }.dental-modal-tabs button.active::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--dental-blue); content: ''; }.dental-modal-panel { padding-top: 20px; color: #576f81; font-size: 13px; line-height: 1.9; }.dental-modal-panel p { margin: 0; }.dental-modal-panel h4 { margin: 25px 0 10px; color: var(--dental-ink); font-size: 15px; }.dental-modal-panel ul { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin: 0; padding: 0; list-style: none; }.dental-modal-panel li { display: flex; align-items: center; gap: 8px; color: #546f82; }.dental-modal-panel li svg { color: var(--dental-blue); }.dental-modal-list { display: grid; gap: 14px; padding-top: 20px; }.dental-modal-list article { border-radius: 8px; padding: 18px 20px; background: #f1f4f8; }.dental-modal-list b { display: flex; align-items: center; gap: 5px; color: var(--dental-ink); font-size: 14px; }.dental-modal-list b svg { color: #e9a629; }.dental-modal-list p { margin: 8px 0 5px; color: #5d7281; font-size: 12px; line-height: 1.7; }.dental-modal-list small { color: #94a3ad; font-size: 10px; }
.dental-modal-enter-active, .dental-modal-leave-active { transition: opacity .25s ease; }.dental-modal-enter-active .dental-doctor-modal, .dental-modal-leave-active .dental-doctor-modal { transition: transform .35s cubic-bezier(.22,1,.36,1), opacity .25s ease; }.dental-modal-enter-from, .dental-modal-leave-to { opacity: 0; }.dental-modal-enter-from .dental-doctor-modal, .dental-modal-leave-to .dental-doctor-modal { opacity: 0; transform: translateY(18px) scale(.98); }
@keyframes dental-drift { from { transform: scale(1.04) translate3d(0, 0, 0); } to { transform: scale(1.1) translate3d(-1.5%, -1%, 0); } }
@keyframes dental-signal { from { opacity: .35; transform: scaleY(.65); } to { opacity: 1; transform: scaleY(1); } }
@media (max-width:980px) { .dental-project-grid,.dental-doctor-grid { grid-template-columns:repeat(2,1fr); }.dental-filter-bar { grid-template-columns:repeat(3,1fr); } }
@media (max-width:700px) { .dental-page { margin-top:-64px; }.dental-hero { min-height:560px; }.dental-hero__backdrop { background:linear-gradient(180deg,rgba(239,248,252,.2),#eff8fc 70%),url('/images/doctor-team.jpg') 60% 15%/cover no-repeat; }.dental-hero__content { width:calc(100% - 32px); padding-top:215px; }.dental-hero h1 { max-width:100%; font-size:34px; line-height:1.3; }.dental-hero p { font-size:12px; }.dental-steps { top:64px; }.dental-steps__inner { width:calc(100% - 20px); padding:20px 0; }.dental-steps__inner::before { top:38px; }.dental-steps button { min-height:40px; gap:6px; }.dental-steps button span { width:30px; height:30px; font-size:9px; }.dental-steps strong { padding-right:5px; font-size:10px; line-height:1.35; }.dental-workspace { padding-top:40px; }.dental-project-grid,.dental-doctor-grid { grid-template-columns:1fr; }.dental-filter-bar { grid-template-columns:repeat(2,1fr); }.dental-form-grid,.dental-modal-panel ul { grid-template-columns:1fr; }.dental-step-actions,.dental-upload-footer { align-items:stretch; flex-direction:column; }.dental-step-actions>*,.dental-upload-footer>* { width:100%; text-align:center; }.dental-submit { width:100%; min-width:0; }.dental-assurance .hy-container { grid-template-columns:1fr; }.dental-assurance .hy-container>div,.dental-assurance .hy-container>div:first-child { border-left:0; border-top:1px solid rgba(255,255,255,.17); padding:13px 0; }.dental-assurance .hy-container>div:first-child { border-top:0; }.dental-doctor-modal { max-height:calc(100vh - 24px); padding:26px 20px; }.dental-modal-profile { align-items:flex-start; }.dental-doctor-modal h2 { font-size:30px; }.dental-modal-tabs { gap:17px; } }

/* Figma dental frames: project selection and city/doctor matching. */
.dental-page {
  margin-top: -64px;
  color: #173b67;
}
.dental-page :deep(.hy-container) {
  width: min(1216px, calc(100% - 64px));
}
.dental-hero {
  height: 460px;
  min-height: 0;
  padding-top: 64px;
  display: block;
  background: #eef7fc;
}
.dental-hero__backdrop {
  inset: 64px 0 0;
  background: url('/images/figma/dental-hero-background.png') center / cover no-repeat;
}
.dental-hero__content {
  position: absolute;
  width: 1px !important;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.dental-steps {
  position: relative;
  top: auto;
  height: 164px;
  background: #fff;
  backdrop-filter: none;
  padding-top: 96px;
}
.dental-steps__inner {
  display: flex;
  width: min(918px, calc(100% - 40px)) !important;
  height: 66px;
  box-sizing: border-box;
  align-items: center;
  gap: 20px;
  padding: 13px 49px;
}
.dental-steps__inner::before {
  display: none;
}
.dental-steps button {
  min-height: 40px;
  gap: 0;
  flex: none;
}
.dental-steps button span {
  width: 40px;
  height: 40px;
  font-size: 20px;
  font-weight: 500;
  line-height: 20px;
}
.dental-steps strong {
  padding: 0 0 0 12px;
  color: #94a3b8;
  font-size: 24px;
  font-weight: 500;
  line-height: 24px;
}
.dental-steps button.active strong {
  color: #1e3a5f;
  font-weight: 600;
}
.dental-step-connector {
  display: block;
  width: 64px;
  height: 1px;
  flex: none;
  background: #e2e8f0;
}
.dental-workspace {
  min-height: 0;
  padding: 46px 0 96px;
}
.dental-project-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
}
.dental-project-card {
  height: auto;
  min-height: 286px;
  overflow: hidden;
  justify-content: flex-start;
  gap: 80px;
  border: 0;
  border-radius: 24px;
  padding: 24px;
  background: #f5f6f7;
  transition: border-color .25s ease, box-shadow .35s ease, background .3s ease;
}
.dental-project-card.selected {
  min-height: 290px;
  outline: 2px solid #1a1a1a;
  outline-offset: -2px;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, .1);
}
.dental-project-card.expanded {
  min-height: 290px;
}
.dental-project-card__icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  object-fit: contain;
  object-position: left top;
  opacity: 1;
  background: transparent;
}
.dental-project-card__content {
  min-height: 0;
  flex: none;
}
.dental-project-card h3 {
  margin: 0;
  color: #1e3a5f;
  font-size: 24px;
  font-weight: 600;
  line-height: 24px;
}
.dental-project-card p,
.dental-project-card dl div {
  color: #4b5563;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}
.dental-project-card p { margin-top: 8px; }
.dental-project-card .dental-project-price { margin-top: 16px; }
.dental-project-price > span:first-child { color: #1e3a5f; font-weight: 500; }
.dental-project-price strong { font-weight: 600; }
.dental-project-card b {
  margin-top: 16px;
  font-size: 14px;
  line-height: 14px;
}
.dental-project-card b svg {
  width: 14px;
  height: 14px;
}
.dental-project-card.selected:not(.expanded) b svg {
  transform: none;
}
.dental-project-card dl {
  gap: 8px;
  margin-top: 16px;
  border: 0;
  padding-top: 0;
}
.dental-project-card dl div { display: block; }
.dental-project-card dt, .dental-project-card dd { display: inline; }
.dental-project-card dt { color: #1e3a5f; font-weight: 500; }
.dental-project-detail-shell { min-height: 0; overflow: hidden; }
.dental-project-card .dental-project-detail {
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr);
  min-height: 0;
  height: max-content;
  align-self: start;
  overflow: visible;
  margin: 16px 0 0;
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
  box-shadow: none;
}
.dental-project-card .dental-project-detail > div {
  display: block;
  font-size: 16px;
  line-height: 24px;
}
.dental-project-card .dental-project-detail dt,
.dental-project-card .dental-project-detail dd {
  font-size: 16px;
  line-height: 24px;
}
.dental-accordion-enter-active,
.dental-accordion-leave-active { overflow: hidden; transition: height .42s cubic-bezier(.22,1,.36,1), opacity .24s ease; }
.dental-accordion-enter-from,
.dental-accordion-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .dental-project-card, .dental-accordion-enter-active, .dental-accordion-leave-active { transition: none; } }
.dental-project-next {
  margin-top: 48px;
}
.dental-project-next .dental-next-button {
  min-height: 48px;
  border-radius: 15px;
  background: #173b67;
  padding: 12px 24px;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}
.dental-project-next .dental-next-button svg { width: 20px; height: 20px; }
.dental-filter-bar {
  grid-template-columns: repeat(6, minmax(0, 1fr)) auto auto;
  gap: 16px;
  margin-bottom: 28px;
}
.dental-filter-bar label span {
  display: none;
}
.dental-filter-bar select {
  height: 44px;
  border-radius: 10px;
  padding: 0 30px 0 16px;
  color: #9aa9b7;
  font-size: 16px;
}
.dental-filter-bar label > svg {
  bottom: 14px;
}
.dental-filter-submit,
.dental-reset {
  align-self: end;
  display: inline-flex;
  height: 44px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 15px;
  padding: 0 18px;
  font-size: 15px;
  cursor: pointer;
}
.dental-filter-submit {
  border: 0;
  background: #e86c17;
  color: #fff;
}
.dental-reset {
  min-height: 44px;
  border: 1px solid #dce4e9;
  background: #fff;
  color: #8795a3;
}
.dental-sort-row {
  display: flex;
  gap: 12px;
  margin: 0 0 13px;
}
.dental-sort-row button {
  border: 1px solid #dce4e9;
  border-radius: 6px;
  padding: 7px 12px;
  background: #fff;
  color: #7e91a0;
  font-size: 13px;
  cursor: pointer;
}
.dental-sort-row button.active {
  border-color: #f2d5bf;
  background: #fff3ea;
  color: #e86c17;
}
.dental-doctor-count {
  margin: 0 0 22px;
  color: #768b9a;
  font-size: 14px;
}
.dental-doctor-count strong {
  color: #3478ef;
  font-size: 17px;
}
.dental-doctor-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.dental-doctor-card {
  min-height: 286px;
  border-radius: 24px;
  padding: 24px;
  background: #f5f6f7;
}
.dental-doctor-card.selected {
  border-color: #173b67;
  background: #fff;
  box-shadow: 0 3px 0 rgba(0, 0, 0, .12);
}
.dental-doctor-card__portrait {
  width: 58px;
  height: 58px;
  border-radius: 12px;
}
.dental-doctor-card__top {
  grid-template-columns: 58px 1fr;
}
.dental-doctor-card h3 {
  font-size: 18px;
}
.dental-doctor-card__top > div:nth-child(2) > span,
.dental-doctor-card__top small,
.dental-doctor-card__meta span {
  font-size: 13px;
}
.dental-doctor-card > p {
  margin-top: 45px;
  font-size: 15px;
}
.dental-doctor-card__button {
  font-size: 14px;
}
.dental-doctor-modal {
  width: min(900px, 100%);
  max-height: min(720px, calc(100vh - 48px));
  border-radius: 28px;
  padding: 38px 46px 46px;
}
.dental-doctor-modal > .hy-kicker {
  display: none;
}
.dental-doctor-modal h2 {
  margin-top: 0;
  font-size: 34px;
}
.dental-modal-profile__portrait {
  width: 84px;
  height: 84px;
  border-radius: 18px;
}
.dental-modal-profile h3 {
  font-size: 20px;
}
.dental-modal-profile p {
  font-size: 15px;
}
.dental-modal-profile span,
.dental-modal-profile small {
  font-size: 13px;
}
.dental-modal-tabs {
  gap: 32px;
  margin-top: 31px;
}
.dental-modal-tabs button {
  padding-bottom: 15px;
  font-size: 16px;
}
.dental-modal-list {
  gap: 24px;
  padding-top: 24px;
}
.dental-modal-list article {
  min-height: 135px;
  border-radius: 25px;
  padding: 27px 34px;
}
.dental-modal-list b {
  font-size: 17px;
}
.dental-modal-list p {
  margin: 12px 0 7px;
  font-size: 14px;
}
.dental-modal-list small {
  font-size: 12px;
}
.dental-page--step-2 .dental-workspace {
  height: 984px;
  box-sizing: border-box;
  overflow: hidden;
}

/* Figma upload state: 1440 x 1766, including the shared patient footer. */
.dental-page--step-3 .dental-workspace {
  height: 686px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 42px 0 0;
}
.dental-page--step-3 .dental-hero--step-3 .dental-hero__backdrop {
  z-index: 0;
  inset: 64px 0 0;
  background: url('/images/figma/dental-upload-hero.png') center -64px / 100% 460px no-repeat;
}
.dental-page--step-3 .dental-section__heading {
  display: none;
}
.dental-page--step-3 .dental-upload {
  width: min(918px, calc(100% - 64px));
}
.dental-page--step-3 .dental-upload-layout {
  width: 918px;
  max-width: 100%;
  margin: 0;
  gap: 0;
}
.dental-upload-media {
  position: relative;
  display: grid;
  justify-items: start;
  gap: 8px;
}
.dental-upload-label {
  color: #0f172a;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}
.dental-upload-label em {
  color: #cbd5e1;
  font-style: normal;
  font-weight: 400;
}
.dental-page--step-3 .dental-dropzone {
  width: 140px;
  min-height: 140px;
  border-color: #d1d5dc;
  border-radius: 14px;
  color: #d3d7db;
  font-size: 32px;
}
.dental-page--step-3 .dental-dropzone > svg {
  display: none;
}
.dental-page--step-3 .dental-dropzone strong {
  color: #d3d7db;
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
}
.dental-page--step-3 .dental-dropzone.has-files strong {
  color: #3478ef;
  font-size: 11px;
}
.dental-page--step-3 .dental-dropzone.is-uploading {
  border-color: #2563eb;
  background: #f5f8ff;
}
.dental-page--step-3 .dental-dropzone.is-error {
  border-color: #dc2626;
  background: #fff7f7;
}
.dental-upload-status {
  position: absolute;
  top: 194px;
  left: 0;
  min-height: 18px;
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 18px;
}
.dental-upload-status button {
  border: 0;
  padding: 0;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
}
.dental-page--step-3 .dental-inline-action {
  top: 151px;
  width: 140px;
  color: #3478ef;
  text-align: left;
}
.dental-page--step-3 .dental-dropzone ul {
  top: 174px;
}
.dental-page--step-3 .dental-upload-form {
  gap: 20px;
  padding: 50px 0 0;
}
.dental-page--step-3 .dental-upload-form .dental-form-grid {
  order: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.dental-page--step-3 .dental-upload-form > label {
  order: 2;
  gap: 8px;
}
.dental-page--step-3 .dental-upload-form label > span {
  font-size: 14px;
}
.dental-page--step-3 .dental-upload-form textarea,
.dental-page--step-3 .dental-upload-form select {
  min-height: 52px;
  border-radius: 14px;
  padding: 0 18px;
  color: #8493a1;
  font-size: 15px;
}
.dental-page--step-3 .dental-upload-form select {
  padding-right: 32px;
}
.dental-page--step-3 .dental-upload-form textarea {
  min-height: 98px;
  padding: 15px 18px;
}
.dental-page--step-3 .dental-submit {
  order: 4;
  min-width: 265px;
  min-height: 48px;
  border-radius: 14px;
  font-size: 15px;
}
.dental-page--step-3 .dental-submit:disabled { cursor: wait; opacity: .68; transform: none; box-shadow: none; }
.dental-page--step-3 .dental-submit svg {
  display: none;
}
.dental-page--step-3 .dental-upload-trust,
.dental-page--step-3 .dental-upload-footer {
  display: none;
}

/* Dev Mode modal dimensions and authored typography. */
.dental-project-card.selected b svg,
.dental-project-card.expanded b svg {
  transform: rotate(180deg);
}
.dental-doctor-modal {
  width: min(896px, 100%);
  border-radius: 24px;
  padding: 32px;
  box-shadow: none;
}
.dental-doctor-modal--reviews {
  height: 654px;
  overflow: hidden;
}
.dental-modal-backdrop {
  background: rgba(0, 0, 0, .5);
  backdrop-filter: blur(4px);
}
.dental-doctor-modal h2 {
  margin: 0;
  font-size: 32px;
  line-height: 32px;
  letter-spacing: .4px;
}
.dental-modal-close {
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: transparent;
  color: #1e3a5f;
  backdrop-filter: blur(8px);
}
.dental-modal-close img {
  width: 20px;
  height: 20px;
}
.dental-modal-profile {
  align-items: flex-start;
  gap: 12px;
  padding-top: 32px;
}
.dental-modal-profile__portrait {
  width: 60px;
  height: 60px;
  border-radius: 16px;
}
.dental-modal-profile__details {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.dental-modal-profile__identity {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.dental-modal-profile h3 {
  margin: 0;
  font-size: 18px;
  line-height: 18px;
}
.dental-modal-profile p {
  margin: 0;
  font-size: 14px;
  line-height: 16px;
}
.dental-modal-profile span,
.dental-modal-profile small {
  margin-top: 0;
  font-size: 14px;
  line-height: 20px;
}
.dental-modal-profile__details > span img,
.dental-modal-profile__details > small img {
  width: 16px;
  height: 16px;
  flex: none;
}
.dental-modal-tabs {
  height: 27px;
  gap: 20px;
  margin-top: 24px;
}
.dental-modal-tabs button {
  height: 27px;
  padding-bottom: 8px;
  font-size: 14px;
  line-height: 14px;
  white-space: nowrap;
}
.dental-modal-panel {
  padding-top: 16px;
  font-size: 16px;
  line-height: 24px;
}
.dental-modal-panel h4 {
  margin: 24px 0 12px;
  color: #0f162e;
  font-size: 16px;
  font-weight: 600;
  line-height: 16px;
}
.dental-modal-panel ul {
  grid-template-columns: 1fr;
  gap: 12px;
}
.dental-modal-panel li {
  gap: 8px;
  color: #4b5563;
  font-size: 16px;
  line-height: 24px;
}
.dental-modal-panel li img {
  width: 16px;
  height: 16px;
  flex: none;
}
.dental-modal-list {
  gap: 16px;
  padding-top: 16px;
}
.dental-modal-list article {
  min-height: 116px;
  border-radius: 24px;
  padding: 24px;
  background: #f3f4f6;
}
.dental-modal-list b {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1e3a5f;
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
}
.dental-modal-list b svg {
  width: 12px;
  height: 12px;
  color: #f59e0b;
}
.dental-modal-list h3 {
  margin: 12px 0 0;
  color: #1e3a5f;
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
}
.dental-modal-list p {
  margin: 12px 0 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 14px;
}
.dental-modal-list small {
  display: block;
  margin-top: 12px;
  color: #9ca3af;
  font-size: 14px;
  line-height: 14px;
}
.dental-modal-list--reviews {
  gap: 16px;
}
.dental-modal-list--reviews article {
  display: flex;
  height: 144px;
  min-height: 144px;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.dental-modal-list--reviews b {
  height: 16px;
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  letter-spacing: .12px;
}
.dental-modal-list--reviews b img {
  width: 12px;
  height: 12px;
}
.dental-modal-list--reviews h3,
.dental-modal-list--reviews p,
.dental-modal-list--reviews small {
  margin: 0;
}
.dental-modal-list--reviews h3 {
  width: 238px;
  height: 16px;
}
.dental-modal-list--reviews small {
  display: flex;
  align-items: center;
}
.dental-modal-list--reviews small i {
  width: 17px;
  padding-right: 4px;
  color: #9ca3af;
  font-family: "DM Sans", sans-serif;
  font-style: normal;
  line-height: 14px;
}

@media (max-width:900px) and (min-width:701px) {
  .dental-steps__inner { width:calc(100% - 32px); }
  .dental-steps button { gap:6px; }
  .dental-steps strong { padding-right:4px; font-size:13px; white-space:nowrap; }
}

@media (max-width: 900px) {
  .dental-filter-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .dental-page {
    margin-top: -64px;
  }
  .dental-hero {
    height: 560px;
    padding-top: 64px;
  }
  .dental-hero__backdrop {
    inset: 64px 0 0;
    background:
      linear-gradient(180deg, rgba(239, 248, 252, .2), #eff8fc 70%),
      url('/images/figma/dental-hero-background.png') 72% -18px / auto 430px no-repeat;
  }
  .dental-page--step-3 .dental-hero--step-3 .dental-hero__backdrop {
    inset: 64px 0 0;
    background:
      linear-gradient(180deg, rgba(239, 248, 252, .08), #eff8fc 76%),
      url('/images/figma/dental-upload-hero.png') 72% -54px / auto 460px no-repeat;
  }
  .dental-hero__content {
    position: relative;
    display: block;
    width: calc(100% - 32px) !important;
    height: auto;
    overflow: visible;
    padding-top: 215px;
    clip-path: none;
    white-space: normal;
  }
  .dental-hero h1,
  .dental-hero p {
    visibility: visible;
  }
  .dental-steps {
    height: auto;
    position: sticky;
    top: 64px;
    padding-top: 0;
  }
  .dental-steps__inner {
    width: calc(100% - 20px) !important;
    height: auto;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 20px 0;
  }
  .dental-step-connector { display: none; }
  .dental-steps__inner::before {
    top: 38px;
  }
  .dental-workspace {
    padding: 40px 0 70px;
  }
  .dental-page--step-2 .dental-workspace {
    height: auto;
    overflow: visible;
  }
  .dental-page--step-3 .dental-workspace {
    height: auto;
    overflow: visible;
    padding-top: 40px;
  }
  .dental-page--step-3 .dental-upload {
    width: calc(100% - 32px);
  }
  .dental-page--step-3 .dental-upload-form {
    padding-top: 50px;
  }
  .dental-page--step-3 .dental-upload-form .dental-form-grid {
    grid-template-columns: 1fr;
  }
  .dental-project-grid,
  .dental-doctor-grid {
    grid-template-columns: 1fr;
  }
  .dental-project-card,
  .dental-project-card.selected,
  .dental-doctor-card {
    min-height: 286px;
  }
  .dental-filter-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dental-modal-tabs {
    gap: 12px;
  }
  .dental-modal-tabs button {
    flex-shrink: 0;
  }
  .dental-modal-list article {
    min-height: 0;
  }
  .dental-doctor-modal--reviews {
    height: auto;
    overflow: auto;
  }
  .dental-modal-list--reviews article {
    height: auto;
    min-height: 144px;
  }
  .dental-modal-list b,
  .dental-modal-list p,
  .dental-modal-list small {
    line-height: 20px;
  }
  .dental-sort-row {
    overflow-x: auto;
  }
}
</style>
