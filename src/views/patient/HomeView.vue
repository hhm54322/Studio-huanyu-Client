<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { init, use, type ECharts } from 'echarts/core'
import { BarChart, RadarChart } from 'echarts/charts'
import { GraphicComponent, GridComponent, LegendComponent, RadarComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Award, Building2, ChartNoAxesCombined, CircleDollarSign, FileText, Globe2, HeartHandshake, Languages, ListFilter, Plane, ScanLine, ShieldCheck, Stethoscope, Trophy } from 'lucide-vue-next'
import type { Component, ComponentPublicInstance } from 'vue'
import HomeFigmaSection from '@/components/common/HomeFigmaSection.vue'
import HomeStrengthSection from '@/components/common/HomeStrengthSection.vue'
import HomePartnersSection from '@/components/common/HomePartnersSection.vue'
import HomePatientStories from '@/components/common/HomePatientStories.vue'
import HomeSourceNode from '@/components/common/HomeSourceNode.vue'
import HomeHeroSection from '@/components/common/HomeHeroSection.vue'
import HomeSourceDialog from '@/components/common/HomeSourceDialog.vue'
import { homeFigmaActions } from '@/data/homeFigmaActions'
import { homeDesktopNodes, homeSourceText } from '@/data/homeFigmaSource'
import desktopChartSource from '../../../docs/figma-source/home/chart-spec-2026-10-19.json'
import mobileChartSource from '../../../docs/figma-source/home/chart-spec-mobile-2026-10-19.json'

use([BarChart, RadarChart, GraphicComponent, GridComponent, LegendComponent, RadarComponent, CanvasRenderer])
const HomeExpertDialog=defineAsyncComponent(()=>import('@/components/common/HomeExpertDialog.vue'))
const selectedExpert=ref<number|null>(null)

type HeroSlide = {
  eyebrow?: string
  eyebrowIcon?: string
  title: string
  copy?: string
  meta?: string
  image: string
  action?: string
  actionIcon?: string
  link?: string
  bullets?: { title: string; copy: string }[]
}
const heroSlides: HeroSlide[] = [
  { eyebrow: '来华就医首选平台', eyebrowIcon: '/images/figma/home-icons/banner-01-eyebrow.svg', title: '让全球患者安心赴华就医', copy: '从首份病历到回国复查，全程有人替你安排。', image: '/images/figma/home-banner-01-source.png', action: '提交病例·3分钟获取方案', actionIcon: '/images/figma/home-icons/banner-01-action.svg', link: '/report' },
  { eyebrow: '用数据说话', eyebrowIcon: '/images/figma/home-icons/banner-02-eyebrow.svg', title: '8000+个家庭已陪伴赴华就医', copy: '覆盖肿瘤、齿科、康养、心脑血管等专科，每月新增XXX个家庭', image: '/images/figma/home-banner-02-source.png' },
  { title: '就医保障，写在前面', image: '/images/figma/home-banner-03-source.png', bullets: [
    { title: '已证正式签约医院', copy: '只与有正式合作协议的知名公立/私立医院合作，资质可查' },
    { title: '公司直属员工', copy: '全流程服务人员均为公司直属员工，非外包、可追溯' },
    { title: '费用清单说清', copy: '费用清单来华前全部列明，无隐藏收费，账单透明' },
    { title: '全周期守护', copy: '出院后按节奏随访，全周期健康守护，由专业再保机构提供保障方案' },
  ] },
  { eyebrow: '真实患者声音', eyebrowIcon: '/images/figma/home-icons/Frame.svg', title: '"来中国是我做过最正确的决定"', copy: '来自俄罗斯、印尼、哈萨克斯坦等国的患者，在中国重获新生', meta: 'M·A，35岁，脊髓肿瘤 → 天坛医院 → 术后3年无复发', image: '/images/figma/patient-hero.png', action: '查看更多案例', actionIcon: '/images/figma/home-icons/Icon-15.svg', link: '/cases' },
]
const heroIndex = ref(3)
const heroSlide = computed(() => heroSlides[heroIndex.value]!)
let heroTimer: number | undefined
function goHero(index: number) { heroIndex.value = (index + heroSlides.length) % heroSlides.length }
function stopHeroTimer() { if (heroTimer) window.clearInterval(heroTimer); heroTimer = undefined }
function startHeroTimer() { stopHeroTimer(); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) heroTimer = window.setInterval(() => goHero(heroIndex.value + 1), 7000) }

const flowSteps = [
  { no: '01', label: '认知', title: '了解为什么选择中国', anchor: '#process-stage-01' },
  { no: '02', label: '评估', title: '3分钟免费可行性评估', anchor: '#process-stage-02' },
  { no: '03', label: '信任', title: '常见疑问解答', anchor: '#process-stage-03' },
  { no: '04', label: '行动', title: '开启来华就医之旅', anchor: '#process-stage-04' },
]
const processFaqs = [
  { question: '我的诊断正确吗？', lead: '中国三甲医院病理复核，免费第二诊疗意见', answer: '我们与北京协和医院、上海复旦肿瘤医院等42家三甲医院合作，提供权威的病理复核服务。国际患者可申请免费第二诊疗意见，由副主任级别以上专家亲自审核。' },
  { question: '治疗方案是否最佳？', answer: '医疗顾问会根据病情匹配对应专科专家，并提供可比较的治疗路径、预计周期和费用范围。' },
  { question: '能治愈吗？治愈率多少？', answer: '治疗效果取决于疾病类型、分期、既往治疗和身体状况，专家评估后会如实说明可能性。' },
  { question: '有没有新药新疗法？', answer: '符合适应症的患者可由合作医院评估前沿技术、临床试验和已获批的新药方案。' },
  { question: '保险能报销吗？', answer: '我们会在出发前协助核对保险责任、直赔范围和所需材料，避免产生无法预期的费用。' },
  { question: '语言不通怎么办？', answer: '医学背景陪诊翻译会全程协助远程咨询、面诊、住院沟通和出院随访。' },
  { question: '费用有隐藏收费吗？', answer: '出发前提供逐项费用清单，医院诊疗、交通住宿和陪诊服务分别列明。' },
  { question: '术后回国怎么随访？', answer: '回国后按治疗计划进行远程复查和报告解读，必要时协助预约复诊。' },
]
const processDiseases = [
  { name: '肿瘤科', hospitals: '32家', cases: '擅长病例：实体肿瘤、复发难治肿瘤', feature: '诊疗特色：MDT多学科会诊，前沿个体化治疗方案', icon: '/images/figma/disease-source/node-144-4416.svg', path: '/diseases-technologies' },
  { name: '心血管', hospitals: '26家', cases: '擅长病例：冠心病、瓣膜病、复杂心律失常', feature: '诊疗特色：微创介入手术、重症心脏外科诊疗', icon: '/images/figma/disease-source/node-144-4429.svg', path: '/diseases-technologies' },
  { name: '神经外科', hospitals: '24家', cases: '擅长病例：脑肿瘤、脑血管病变、脊髓疾病', feature: '诊疗特色：显微神经外科、神经内镜精准手术', icon: '/images/figma/disease-source/node-144-4440.svg', path: '/diseases-technologies' },
  { name: '骨科', hospitals: '28家', cases: '擅长病例：脊柱疾病、关节置换、复杂创伤修复', feature: '诊疗特色：微创骨科、快速康复ERAS体系', icon: '/images/figma/disease-source/node-144-4450.svg', path: '/diseases-technologies' },
  { name: '牙科', hospitals: '21家', cases: '擅长病例：全口种植、颌面修复、复杂正畸', feature: '诊疗特色：数字化口腔、All-on系列种植方案', icon: '/images/figma/disease-source/node-144-4460.svg', path: '/dental' },
  { name: '眼科', hospitals: '20家', cases: '擅长病例：眼底病变、白内障、复杂屈光问题', feature: '诊疗特色：高端晶体植入、微创眼底外科手术', icon: '/images/figma/disease-source/node-144-4482.svg', path: '/diseases-technologies' },
]
const processSection = ref<HTMLElement | null>(null)
const processStageRefs = ref<HTMLElement[]>([])
const homeWidth = ref(typeof window === 'undefined' ? 1440 : window.innerWidth)
const journeyScale = computed(() => Math.min(1, homeWidth.value / 1440))
const whyCards = ['1412:5795','1412:5810','1412:5819','1412:5827','1412:5835','1412:5844']
const whyCopyNodes = ['1412:5799','1412:5814','1412:5822','1412:5830','1412:5839','1412:5848']
const whyMoreSource = homeDesktopNodes.get('1412:5804')!
const whyCardAttributes = Object.fromEntries([
  ...whyCards.map((id,index) => [id,{ 'data-home-why-card':index,'aria-haspopup':'dialog' }]),
  ...whyCopyNodes.map((id,index) => [id,{ 'data-home-why-copy':index }]),
])
function resizeHomepage() { homeWidth.value = window.innerWidth; updateProcessState() }
const activeProcessIndex = ref(0)
const expandedDesktopFaqs = ref(new Set<number>())
const desktopFaqRows = ['1401:296','1401:306','1401:313','1401:320','1401:327','1401:334','1401:341','1401:348']
const desktopFaqButtons = ['1401:297','1401:307','1401:314','1401:321','1401:328','1401:335','1401:342','1401:349']
const desktopFaqArrows = ['1401:300','1401:310','1401:317','1401:324','1401:331','1401:338','1401:345','1401:352']
const mobileFaqRows = ['1528:260','1528:269','1528:275','1528:281','1528:287','1528:293','1528:299','1528:305']
const mobileFaqButtons = ['1528:261','1528:270','1528:276','1528:282','1528:288','1528:294','1528:300','1528:306']
const mobileFaqArrows = ['1528:264','1528:273','1528:279','1528:285','1528:291','1528:297','1528:303','1528:309']
const expandedMobileFaqs = ref(new Set<number>())
const journeyActions = {
  ...homeFigmaActions,
  '1401:40': { action:'consultation', label:'免费问阿宁' },
  '1401:44': { href:'/report', label:'生成可行性报告' },
  '1401:269': { href:'/diseases-technologies', label:'查看全部疾病' },
  '1401:274': { href:'/cases', label:'查看全部案例' },
  '1401:356': { href:'/trust', label:'查看完整20个FAQ' },
  ...Object.fromEntries(desktopFaqButtons.map((id,index) => [id,{action:`desktop-faq:${index}`}])),
  ...Object.fromEntries(['1401:64','1401:77','1401:88','1401:98','1401:108','1401:120'].map(id=>[id,{href:id==='1401:108'?'/dental':'/diseases-technologies'}])),
  ...Object.fromEntries(mobileFaqButtons.map((id,index) => [id,{action:`faq:${index}`}]))
}
const mobileFaqAttributes = computed(() => Object.fromEntries(mobileFaqButtons.map((id,index) => [id,{
  'aria-expanded': expandedMobileFaqs.value.has(index),
  'aria-controls': `home-faq-answer-${index}`
}])))
const mobileFaqStyles = computed(() => Object.fromEntries([
  ...mobileFaqRows.map(id => [id,'width:100%;']),
  ...mobileFaqArrows.map((id,index) => [id,`transition:transform .3s ease;transform:rotate(${expandedMobileFaqs.value.has(index) ? 180 : 0}deg);`])
]))
const desktopFaqAttributes = computed(() => Object.fromEntries(desktopFaqButtons.map((id,index) => [id,{
  'aria-expanded': expandedDesktopFaqs.value.has(index),
  'aria-controls': `home-desktop-faq-answer-${index}`
}])))
const desktopFaqStyles = computed(() => Object.fromEntries([
  ['1401:289','height:auto!important;'],
  ['1401:295','display:flex;flex-direction:column;width:100%;'],
  ...desktopFaqRows.map(id => [id,'width:100%;']),
  ...desktopFaqArrows.map((id,index) => [id,`transition:transform .3s ease;transform:rotate(${expandedDesktopFaqs.value.has(index) === (index === 0) ? 0 : 180}deg);`])
]))
function toggleMobileFaq(index:number) {
  const next = new Set(expandedMobileFaqs.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  expandedMobileFaqs.value = next
}
function setProcessStageRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLElement) processStageRefs.value[index] = el
}
function updateProcessState() {
  if (!processStageRefs.value.length) return
  const pivot = window.innerHeight * 0.38
  let next = 0
  processStageRefs.value.forEach((stage, index) => {
    if (stage.getBoundingClientRect().top <= pivot) next = index
  })
  activeProcessIndex.value = next
}
function scrollToProcessStep(index: number) {
  const stage = processStageRefs.value[index]
  if (!stage) return
  const headerOffset = window.matchMedia('(max-width: 700px)').matches ? 88 : 104
  const top = Math.max(0, stage.getBoundingClientRect().top + window.scrollY - headerOffset)
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
function toggleDesktopFaq(index:number) {
  const next = new Set(expandedDesktopFaqs.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  expandedDesktopFaqs.value = next
}
const whyItems = [
  { title: '医疗水平 · 国际领先', copy: '三甲医院手术量与临床经验位居全球前列，多专科国际领先', icon: '/images/figma/home-icons/Icon-19.svg', nodeId: '143:152' },
  { title: '费用优势 · 高性价比', copy: '同等治疗方案，费用比欧美低40-70%，清单事先说清', icon: '/images/figma/home-icons/Icon-17.svg', nodeId: '143:167' },
  { title: '多语言陪诊 · 全程专业', copy: '中英俄阿西等5大语种 + 印尼等小语种，医学背景译员全程陪同', icon: '/images/figma/home-icons/Frame-3.svg', nodeId: '143:176' },
  { title: '顶级专家 · 稀缺可及', copy: '院士、学科带头人、国际知名专家资源，按病症精准匹配', icon: '/images/figma/home-icons/Frame-4.svg', nodeId: '143:184' },
  { title: '康养特色 · 中西结合', copy: '中西医结合+术后康养调理，全周期健康管理', icon: '/images/figma/home-icons/Frame-1.svg', nodeId: '143:192' },
  { title: '签证便利 · 快速通道', copy: '多国公民可申请医疗签证，部分国家免签 / 落地签30天', icon: '/images/figma/home-icons/Frame-2.svg', nodeId: '143:201' },
]
type WhyCard = { title: string; copy: string; icon: Component }
type WhyDetail = {
  title: string
  subtitle: string
  layout: 'cards-2x2' | 'table-cards' | 'wide-cards' | 'cards-3'
  icon?: Component
  cards: WhyCard[]
  table?: { headers: string[]; rows: string[][] }
  note?: string
}
const whyDetails: WhyDetail[] = [
  { title: '医疗水平 · 国际领先', subtitle: '三甲医院手术量与临床经验位居全球前列，多专科国际领先', layout: 'cards-2x2', cards: [
    { title: '中国三甲医院的全球排名与专科实力', icon: Award, copy: '中国拥有超过1,500家三级甲等医院，其中多家综合医院连续多年入选全球最佳医院排行榜。在《Nature Index》医学研究领域、复旦大学医院管理研究所专科声誉排名中，肿瘤学、心血管外科、骨科、神经外科、肝胆外科、眼科等专科稳居亚洲前列，部分科室在疑难重症诊疗方面已达到国际一流水准。' },
    { title: '临床诊疗技术的国际地位', icon: Trophy, copy: '中国是全球最大的介入手术、器官移植、机器人辅助手术市场之一。以微创介入、达芬奇手术机器人、质子重离子治疗、CAR-T细胞治疗、造血干细胞移植为代表的前沿技术，已在多家头部医院实现常规化临床应用，手术量与长期随访数据均处于全球领先区间。' },
    { title: '疑难重症的诊治能力', icon: Stethoscope, copy: '依托庞大的人口基数和病种覆盖，中国医生在复杂肿瘤综合治疗、晚期心血管疾病、罕见病、复杂骨科重建、神经疑难病等领域积累了丰富的临床样本。多学科会诊（MDT）模式已成为三甲医院标准流程，可为复杂病例提供系统化、个性化的诊疗方案。' },
    { title: '与欧美医疗水平对比', icon: ChartNoAxesCombined, copy: '手术量与经验：中国头部医院单中心年手术量通常是欧美同级别医院的2-5倍，医生在高频手术中的熟练度和并发症控制能力更强。\n技术与设备同步：中国顶级医院在影像诊断、放疗设备、手术机器人、基因检测等硬件配置上与国际同步，部分设备更新速度甚至快于欧美。\n学术与科研对接：多家医院与梅奥诊所、MD Anderson、约翰·霍普金斯等国际顶尖机构建立联合实验室、远程会诊与学术交流机制，诊疗标准与国际接轨。' },
  ] },
  { title: '费用优势 · 高性价比', subtitle: '同等治疗方案，费用比欧美低40-70%，清单事先说清', layout: 'table-cards', cards: [
    { title: '费用构成全透明', icon: ShieldCheck, copy: '患者来华前即可收到完整费用清单，涵盖：医院诊疗费、手术费、住院费、药品费；视频会诊费、病历翻译费；医疗签证、机票、住宿、接送机、本地交通；陪诊翻译、医疗管家服务、术后随访。无隐藏收费，无中途加价。每一项费用对应具体服务节点，患者及家属可在出发前确认全部预算。' },
    { title: '为何能实现高品质低价格', icon: CircleDollarSign, copy: '规模化医疗体系：中国医院接诊量大，设备、耗材、药品采购规模化，单位成本显著降低。\n医保与公立体系支撑：公立医院运营成本由国家基础设施和医保体系分摊，诊疗定价更可控。\n本土供应链成熟：从高端医疗器械到生物制药，中国产业链完善，减少了进口溢价。\n汇率与生活成本优势：来华就医期间的住宿、餐饮、交通等综合生活成本低于欧美主要城市。' },
  ], table: { headers: ['项目', '中国参考费用', '美国参考费用', '欧洲参考费用'], rows: [['冠状动脉搭桥手术', '$15,000-30,000', '$80,000-200,000', '$40,000-80,000'], ['肿瘤综合治疗（化疗/靶向/免疫）', '$20,000-50,000/疗程', '$100,000-300,000+', '$60,000-150,000'], ['试管婴儿（IVF）单周期', '$4,000-8,000', '$15,000-30,000', '$8,000-15,000'], ['髋关节/膝关节置换', '$6,000-12,000', '$40,000-70,000', '$25,000-45,000'], ['质子重离子放疗', '$15,000-30,000', '$80,000-150,000', '$50,000-100,000']] }, note: '注：以上数据为行业公开区间参考，实际费用因医院、方案、个体病情而异。提交病例后我们将提供个性化清单。' },
  { title: '多语言陪诊 · 全程专业', subtitle: '中英俄阿西等5大语种 + 印尼等小语种，医学背景译员全程陪同', layout: 'table-cards', cards: [
    { title: '覆盖国家与语种', icon: Globe2, copy: '我们提供中英俄阿西五大核心语种的全流程陪诊服务，同时可协调印尼语、泰语、日语、韩语、法语、德语、葡萄牙语等小语种资源，覆盖东南亚、中东、欧美、俄语区、拉美等主要客源地。所有语种译员均按患者需求提前配对，确保从远程咨询、视频会诊、入院办理、医患沟通到出院随访的语言一致性。' },
    { title: '医疗翻译的专业资质要求', icon: Languages, copy: '医学背景：临床医学、护理学、药学或公共卫生专业本科及以上学历，具备基础医学知识。\n语言认证：持有CATTI、NAATI、TOLES、DELF/DALF、Goethe-Zertifikat等国际认可的语言资质。\n医疗陪诊经验：至少2年以上医院陪诊或国际医疗协调实战经验。\n双重审核机制：译员输出由医学顾问复核，关键诊断、用药说明、手术同意书等必须双人确认。' },
  ], table: { headers: ['阶段', '陪诊服务内容'], rows: [['远程咨询期', '病历资料翻译、视频会诊实时口译、专家问答双向传达'], ['抵华初期', '机场接机、酒店入住协助、医院就诊指引、初次面诊翻译'], ['治疗期间', '门诊/住院全程陪同、医患沟通翻译、检查预约、用药说明讲解'], ['出院离境', '出院小结翻译、用药指导、随访计划说明、复诊预约安排'], ['回国随访', '远程视频翻译、复查报告翻译、国内医生反馈传达']] }, note: '注：以上数据为行业公开区间参考，实际费用因医院、方案、个体病情而异。提交病例后我们将提供个性化清单。' },
  { title: '顶级专家 · 稀缺可及', subtitle: '院士、学科带头人、国际知名专家资源，按病症精准匹配', layout: 'wide-cards', cards: [
    { title: '平台覆盖的专家范围', icon: FileText, copy: '我们整合了全国主要城市公立三甲医院、知名私立专科医院及国际医疗中心的专家资源，覆盖：\n院士及国家级医学领军人才：中国工程院院士、中国科学院院士及国家级重点学科负责人。\n学科带头人：各三甲医院科室主任、副主任、教授，长期深耕某一专科领域。\n国际知名专家：曾在海外顶尖医疗机构研修或任职、参与国际指南制定的华人专家。\n专科名医联盟：按肿瘤、心血管、骨科、神经、生殖医学、眼科、康养等专科建立的专家协作网络。' },
    { title: '专家筛选与匹配机制', icon: ListFilter, copy: '我们的匹配流程不是简单推荐，而是基于患者病情做系统化筛选：收集病理报告、影像资料、治疗史、当前诉求；由医学顾问判断应优先对接的专科方向；从合作专家库中筛选手术经验丰富、患者满意度高、研究方向契合的专家；必要时提供2-3位候选专家资料，由患者及家属自主选择；安排视频会诊，患者先与专家沟通，再决定是否来华治疗。' },
    { title: '前沿治疗技术与在研药物渠道', icon: Stethoscope, copy: '依托中国顶级医院的临床试验中心和科研平台，患者可及的治疗选择包括：已上市靶向药、免疫治疗、细胞治疗，以及符合条件的临床试验入组机会；质子重离子放疗、达芬奇手术机器人、TAVR经导管瓣膜置换、干细胞治疗、AI辅助精准诊断；在肿瘤康复、慢性病管理、术后调理等领域，整合中医、康复医学、营养学资源。' },
  ], note: '说明：所有前沿治疗方案均需经过专家评估适应症，我们不承诺任何未获批或不适合患者个体的疗法。' },
  { title: '康养特色 · 中西结合', subtitle: '中西医结合+术后康养调理，全周期健康管理', layout: 'wide-cards', cards: [
    { title: '中西医结合的发展成熟度', icon: HeartHandshake, copy: '中西医结合是中国医学体系的重要组成部分，已有超过60年的系统化发展历史。国家层面设立了中西医结合一级学科、中西医结合医院、国家重点专科，并在肿瘤、心血管、消化、呼吸、老年病、康复医学等领域形成了标准化诊疗指南。中国中西医结合学会及多家三甲中医院、综合医院中医科共同推动了这一体系的国际化与规范化。' },
    { title: '特色康养方案', icon: Award, copy: '我们为患者提供的治疗后康养方案，由中西医结合专家团队制定，主要包括：\n术后中医调理：针灸、艾灸、推拿、中药汤剂辅助术后恢复，减轻疼痛、改善睡眠、促进伤口愈合。\n肿瘤康复管理：化疗/放疗后的中药扶正、免疫调节、营养支持、疲劳综合征管理。\n慢性病中医结合管理：高血压、糖尿病、骨关节病、心脑血管病等长期用药+中医体质调理。\n亚健康调理：针对高管、企业家群体的高压状态，提供睡眠、免疫、代谢、抗衰老等定向调理方案。' },
    { title: '相比纯西医治疗的独特价值', icon: Trophy, copy: '全周期干预：西医解决急性期、关键期问题，中医和康复医学覆盖恢复期、稳定期，降低复发和再入院风险。\n副作用管理：中医药和康复疗法可有效缓解放化疗后的恶心、乏力、免疫力下降等症状。\n个体化方案：中医强调辨证论治，根据患者体质、病程、季节等因素定制调理方案。\n成本可控：康养调理疗程灵活，费用透明，适合高净值人群长期健康管理需求。' },
  ] },
  { title: '签证便利 · 快速通道', subtitle: '多国公民可申请医疗签证，部分国家免签 / 落地签30天', layout: 'cards-3', cards: [
    { title: '医疗签证申请支持', icon: FileText, copy: '我们协助患者及家属准备医疗邀请函、医院预约函、病历摘要翻译件、费用说明等签证材料，支持申请中国驻外使领馆的医疗签证（通常可获得30-90天停留期，部分情况可延期）。' },
    { title: '免签与落地签政策', icon: Globe2, copy: '部分东南亚、中东、欧洲国家的公民可凭普通护照享受中国免签或落地签政策，具体停留期限以目的地城市和国籍为准。提交病例后，我们的海外协调团队将根据患者国籍提供针对性的入境方案。' },
    { title: '落地后服务衔接', icon: Plane, copy: '从机场接机、酒店入住、医院注册到首次面诊，我们的团队会提前与医院确认预约时间，确保患者抵华后第一时间进入诊疗流程，减少等待和不确定性。' },
  ] },
]
const whyModalOpen = ref(false)
const selectedWhyIndex = ref(0)
let whyModalTrigger: HTMLElement | null = null
const storyModalOpen = ref(false)
let storyModalTrigger: HTMLElement | null = null
const whyDesktopFrames = ['143:4035','143:4220','143:4316','143:4084','143:4127','143:4167']
const whyMobileFrames = ['1541:1003','1541:1048','1541:1146','1541:1211','1541:1252','1541:1290']
const whyDesktopPanels = ['143:4038','143:4223','143:4319','143:4087','143:4130','143:4170']
const whyMobilePanels = ['1541:1005','1541:1050','1541:1148','1541:1213','1541:1254','1541:1292']
const whyDesktopTitles = ['143:4081','143:4248','143:4342','143:4122','143:4164','143:4203']
const whyMobileTitles = ['1541:1044','1541:1142','1541:1207','1541:1248','1541:1286','1541:1322']
const whyCloseNodes = ['143:4039','143:4224','143:4320','143:4088','143:4131','143:4171']
const whyMobileCloseNodes = ['1541:1006','1541:1051','1541:1149','1541:1214','1541:1255','1541:1293']
const whySourceActions = Object.fromEntries([
  ...whyCloseNodes.map(id => [id, { action:'why:close', label:'关闭详情' }]),
  ...whyMobileCloseNodes.map(id => [id, { action:'why:close', label:'关闭详情' }]),
])
const storySourceActions = {
  '1414:7342': { action:'story:close', label:'关闭详情' },
  '1407:9': { action:'story:close', label:'关闭详情' },
  '1543:43': { action:'story:close', label:'关闭详情' },
}
function openWhyDetail(index: number, event?: Event) {
  selectedWhyIndex.value = index
  whyModalTrigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  whyModalOpen.value = true
}
function closeWhyDetail() {
  whyModalOpen.value = false
  nextTick(() => whyModalTrigger?.focus({ preventScroll: true }))
}
function openStoryDetail(event?: Event) {
  storyModalTrigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
  storyModalOpen.value = true
}
function closeStoryDetail() {
  storyModalOpen.value = false
  nextTick(() => storyModalTrigger?.focus({ preventScroll: true }))
}
function onWhyModalKeydown(event: KeyboardEvent) {
  if (!whyModalOpen.value && !storyModalOpen.value) return
  if (event.key === 'Escape') { event.preventDefault(); whyModalOpen.value ? closeWhyDetail() : closeStoryDetail(); return }
  if (event.key !== 'Tab') return
  const panel = document.querySelector<HTMLElement>('.home-source-dialog[open]')
  if (!panel) return
  const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled'))
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

function scrollHomeTo(event: MouseEvent, anchor: string) {
  event.preventDefault()
  history.replaceState(null, '', anchor)
  const target = document.querySelector<HTMLElement>(anchor)
  target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}

const careSteps = [
  { no: '1', title: '就诊前', copy: '病历评估 · 视频会诊 · 行程规划', icon: ScanLine },
  { no: '2', title: '就诊中', copy: '落地接送 · 入院陪同 · 院中管家', icon: Building2 },
  { no: '3', title: '就诊后', copy: '定期随访 · 专家直连 · 保险理赔', icon: HeartHandshake },
]
const team = [
  { title: '医疗管家', copy: '全程陪同，从入院到出院的医疗事务统筹', image: '/images/figma/team-medical-steward.png', imageSize: '176.246% 132.185%', imagePosition: '-22.433px -0.554px' },
  { title: '陪诊翻译', copy: '多种语言，与医生沟通零障碍', image: '/images/figma/team-interpreter.png', imageSize: '201.646% 151.235%', imagePosition: '-32.539px -3.741px' },
  { title: '医学顾问', copy: '病例初筛 + 多学科会诊协调', image: '/images/figma/team-advisor.png', imageSize: '186.09% 139.568%', imagePosition: '-26.539px -0.741px' },
  { title: '海外协调', copy: '签证、机票、住宿、接送全安排', image: '/images/figma/team-coordinator.png', imageSize: '180.528% 135.396%', imagePosition: '-30.317px -2.195px' },
]
const costs = [
  { label: '心脏搭桥', china: 15, usa: 120, germany: 80, japan: 75 },
  { label: '肿瘤手术', china: 12, usa: 80, germany: 55, japan: 60 },
  { label: '关节置换', china: 8, usa: 55, germany: 35, japan: 40 },
  { label: '脊柱手术', china: 10, usa: 65, germany: 45, japan: 50 },
  { label: '种植牙', china: 1.2, usa: 4.5, germany: 3, japan: 3.5 },
  { label: '牙齿矫正', china: 2.2, usa: 6.5, germany: 4.8, japan: 5 },
]
const hospitals = [
  { name: '上海复旦大学附属肿瘤医院', copy: '肿瘤科全国第1', image: '/images/figma/hospital-shanghai-design.png', imageSize: '126.6% 100%', imagePosition: '92.9% 0%' },
  { name: '北京301医院 (解放军总医院)', copy: '综合排名全国前3', image: '/images/figma/hospital-beijing-design.png', imageSize: '133.4% 100%', imagePosition: '84.59% 0%' },
  { name: '广州中山大学附属第一医院', copy: '器官移植全国第1', image: '/images/figma/hospital-guangzhou-design.jpg', imageSize: '168.881% 126.408%', imagePosition: '42.83% 0%' },
  { name: '四川华西医院', copy: '综合排名全国第2', image: '/images/figma/hospital-huaxi-design.png', imageSize: '224.452% 166.86%', imagePosition: '50.03% 0%' },
]
const experts = [
  { name: '吴一龙', title: '终身首席教授', hospital: '广东省人民医院', specialty: '肺癌、免疫治疗', experience: '35年临床经验，肺癌领域国际权威', image: '/images/figma/expert-wu-yilong-source.png', imageSize: '154.17% 231.255%', imagePosition: '-18.223px -5.221px', imageFlip: true },
  { name: '邵志敏', title: '主任医师/教授', hospital: '上海复旦肿瘤医院', specialty: '乳腺癌综合治疗', experience: '28年临床经验，年手术量超2000例', image: '/images/figma/expert-shao-zhimin-source.png', imageSize: '107.409% 198.93%', imagePosition: '-4.328px 4.28px', imageFlip: true },
  { name: '张俊廷', title: '主任医师/教授', hospital: '北京天坛医院', specialty: '颅底肿瘤、脑干肿瘤', experience: '30年临床经验，手术超万例', image: '/images/figma/expert-zhang-junting-source.png', imageSize: '126.65% 225.067%', imagePosition: '-7.192px -13.387px', imageFlip: false },
  { name: '李进', title: '主任医师/博导', hospital: '上海复旦肿瘤医院', specialty: '消化道肿瘤、靶向治疗', experience: '25年临床经验，主持新药临床50+项', image: '/images/figma/expert-li-jin-source.png', imageSize: '140.689% 187.585%', imagePosition: '-12.413px -0.239px', imageFlip: true },
]
const expertTabs = ['肿瘤科', '心血管科', '骨科']
const activeExpertTab = ref('肿瘤科')
const expertsByTab: Record<string, typeof experts> = { 肿瘤科: experts, 心血管科: [], 骨科: [] }
const visibleExperts = computed(() => expertsByTab[activeExpertTab.value] ?? [])
const radarChartEl = ref<HTMLElement | null>(null)
const costChartEl = ref<HTMLElement | null>(null)
let radarChart: ECharts | undefined
let costChart: ECharts | undefined
let chartObserver: ResizeObserver | undefined
let chartSize = ''

const radarIndicators = [
  { name: '治疗费用', max: 100 },
  { name: '语言支持', max: 100 },
  { name: '服务质量', max: 100 },
  { name: '技术水平', max: 100 },
  { name: '等待时间', max: 100 },
  { name: '治愈率', max: 100 },
]
const radarSeries = [
  { name: '中国 China', value: [95, 92, 85, 90, 95, 88], color: '#2563EB', fill: 'rgba(37,99,235,.30)' },
  { name: '美国 USA', value: [30, 60, 82, 95, 50, 92], color: '#1E3A5F', fill: 'rgba(30,58,95,.15)' },
  { name: '德国 Germany', value: [50, 55, 88, 93, 65, 90], color: '#C9A84C', fill: 'rgba(201,168,76,.15)' },
]

function initCharts() {
  if (!radarChartEl.value || !costChartEl.value) return
  radarChart?.dispose()
  costChart?.dispose()
  // Mobile has its own authored chart, not a percentage-scaled desktop option.
  const source = window.matchMedia('(max-width: 700px)').matches ? mobileChartSource : desktopChartSource
  const graphics = (chart: typeof source.radar | typeof source.cost) => [
    ...chart.texts.map(label => ({
      type: 'group', x: label.x, y: label.y, rotation: label.rotation, silent: true,
      children: [{ type: 'text', style: {
        text: label.text, fill: label.fill, opacity: 'opacity' in label ? Number(label.opacity) : 1, fontFamily: `"${label.fontFamily}", "PingFang SC", sans-serif`,
        fontSize: label.fontSize, lineHeight: label.height, verticalAlign: 'top',
      } }],
    })),
    ...chart.legendSymbols.map(symbol => ({
      type: 'rect', silent: true, shape: { x: symbol.x, y: symbol.y, width: symbol.width, height: symbol.height },
      style: { fill: symbol.fill, opacity: 'opacity' in symbol ? Number(symbol.opacity) : 1 },
    })),
  ]
  const devicePixelRatio = Math.max(2, window.devicePixelRatio || 1)
  radarChart = init(radarChartEl.value, undefined, { renderer: 'canvas', width: source.radar.width, height: source.radar.height, devicePixelRatio })
  costChart = init(costChartEl.value, undefined, { renderer: 'canvas', width: source.cost.width, height: source.cost.height, devicePixelRatio })
  radarChart.setOption({
    animation: false,
    radar: {
      center: source.radar.center, radius: source.radar.radius,
      startAngle: 90, splitNumber: 4, shape: 'polygon', indicator: radarIndicators,
      axisName: { show: false },
      axisLine: { lineStyle: { color: '#E5E7EB', width: 1 } },
      splitLine: { lineStyle: { color: '#E5E7EB', width: 1 } },
      splitArea: { areaStyle: { color: ['transparent'] } },
    },
    series: [{
      type: 'radar', symbol: 'none', silent: true,
      data: radarSeries.map(item => ({
        value: item.value, name: item.name, lineStyle: { color: item.color, width: 2 },
        areaStyle: { color: item.fill, opacity: 1 },
      })),
    }],
    graphic: graphics(source.radar),
  })
  const grid = source.cost.grid
  costChart.setOption({
    animation: false,
    grid: { left: grid.x, top: grid.y, width: grid.width, height: grid.height },
    // Axes/labels/ticks are graphic primitives at their actual Figma positions;
    // the bars and coordinate system remain a genuine ECharts data series.
    xAxis: { type: 'category', data: costs.map(item => item.label), show: false },
    yAxis: { type: 'value', min: 0, max: 120, show: false },
    series: [
      { name: '中国', field: 'china', color: '#2563EB' }, { name: '美国', field: 'usa', color: '#1E3A5F' },
      { name: '德国', field: 'germany', color: '#C9A84C' }, { name: '日本', field: 'japan', color: '#94A3B8' },
    ].map(item => ({
      name: item.name, type: 'bar', silent: true, barWidth: source.cost.barWidth, barGap: source.cost.barGap,
      itemStyle: { color: item.color, borderRadius: source.cost.width < 542 ? [2.4328, 2.4328, 0, 0] : [4, 4, 0, 0] },
      data: costs.map(cost => cost[item.field as 'china' | 'usa' | 'germany' | 'japan']),
    })),
    graphic: [
      ...source.cost.lines.map(line => ({
        type: 'line', silent: true, z: -1,
        shape: { x1: line.x, y1: line.y, x2: line.x + line.width, y2: line.y + line.height },
        style: { stroke: line.stroke, lineWidth: line.lineWidth, lineDash: line.lineDash, opacity: 'opacity' in line ? Number(line.opacity) : 1 },
      })),
      ...graphics(source.cost),
    ],
  })
}
function disposeCharts() {
  radarChart?.dispose()
  costChart?.dispose()
  radarChart = undefined
  costChart = undefined
}
function openConsultation() { window.dispatchEvent(new CustomEvent('open-consultation')) }
function activateFigmaAction(action:string, event:MouseEvent) {
  const [name, value] = action.split(':')
  if (name === 'consultation') openConsultation()
  else if (name === 'doctor') selectedExpert.value=Number(value)
  else if (name === 'process') scrollToProcessStep(Number(value))
  else if (name === 'why' && value === 'close') closeWhyDetail()
  else if (name === 'why') openWhyDetail(Number(value), event)
  else if (name === 'faq') toggleMobileFaq(Number(value))
  else if (name === 'desktop-faq') toggleDesktopFaq(Number(value))
  else if (name === 'hero') goHero(value === 'previous' ? heroIndex.value - 1 : value === 'next' ? heroIndex.value + 1 : Number(value))
  else if (name === 'story' && value === 'close') closeStoryDetail()
  else if (name === 'story') openStoryDetail(event)
}
watch([radarChartEl, costChartEl], () => nextTick(() => {
  if (radarChartEl.value && costChartEl.value) initCharts()
}))
onMounted(() => {
  startHeroTimer()
  nextTick(() => {
    chartObserver = new ResizeObserver(() => {
      const size = `${radarChartEl.value?.clientWidth}:${costChartEl.value?.clientWidth}:${window.innerWidth <= 700}`
      if (size === chartSize) return
      chartSize = size
      initCharts()
    })
    if (radarChartEl.value) chartObserver.observe(radarChartEl.value)
    if (costChartEl.value) chartObserver.observe(costChartEl.value)
  })
  window.addEventListener('keydown', onWhyModalKeydown)
  window.addEventListener('scroll', updateProcessState, { passive: true })
  window.addEventListener('resize', resizeHomepage, { passive: true })
  updateProcessState()
})
onBeforeUnmount(() => {
  stopHeroTimer()
  chartObserver?.disconnect()
  disposeCharts()
  window.removeEventListener('keydown', onWhyModalKeydown)
  window.removeEventListener('scroll', updateProcessState)
  window.removeEventListener('resize', resizeHomepage)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="home-page" :data-figma-node="homeWidth>700 ? '1412:5684' : undefined">
    <HomeHeroSection class="home-source-hero" @activate="activateFigmaAction" />

    <HomeFigmaSection desktop-id="1412:5718" mobile-id="1528:148" label="来华就医流程" :actions="homeFigmaActions" @activate="activateFigmaAction" />

    <div ref="processSection" class="home-source-journey">
      <template v-if="homeWidth <= 700">
        <div v-for="(sourceId, index) in ['1528:184', '1528:223', '1528:252', '1528:316']" :id="`process-stage-${flowSteps[index]!.no}`" :key="sourceId" :ref="el => setProcessStageRef(el, index)">
          <HomeFigmaSection class="journey-mobile-source" desktop-id="1412:5765" :mobile-id="sourceId" :label="`来华就医·${flowSteps[index]!.label}`" :actions="journeyActions" :styles="mobileFaqStyles" :attributes="mobileFaqAttributes" @activate="activateFigmaAction">
            <template #after="{ node }">
              <div v-if="mobileFaqRows.includes(node.id)" :id="`home-faq-answer-${mobileFaqRows.indexOf(node.id)}`" class="home-source-faq-answer" :class="{ 'is-open':expandedMobileFaqs.has(mobileFaqRows.indexOf(node.id)) }" :inert="!expandedMobileFaqs.has(mobileFaqRows.indexOf(node.id))" :aria-hidden="!expandedMobileFaqs.has(mobileFaqRows.indexOf(node.id))">
                <div><div class="home-source-faq-answer__copy"><strong v-if="processFaqs[mobileFaqRows.indexOf(node.id)]!.lead">{{ processFaqs[mobileFaqRows.indexOf(node.id)]!.lead }}</strong><p>{{ processFaqs[mobileFaqRows.indexOf(node.id)]!.answer }}</p></div></div>
              </div>
            </template>
          </HomeFigmaSection>
        </div>
      </template>
      <div v-else class="journey-desktop" :style="{ '--journey-scale': journeyScale }">
        <div id="process-stage-01" :ref="el => setProcessStageRef(el, 0)">
          <HomeFigmaSection desktop-id="1412:5765" label="来华就医·认知" :actions="homeFigmaActions" :attributes="whyCardAttributes" :hidden="['1412:5780']" @activate="activateFigmaAction">
            <template #after="{ node }">
              <div v-if="whyCopyNodes.indexOf(node.id)>0" class="home-why-card__more" :style="{left:`${whyMoreSource.x}px`,top:`${whyMoreSource.y}px`,width:`${whyMoreSource.width}px`,height:`${whyMoreSource.height}px`}" aria-hidden="true">
                <HomeSourceNode :node="whyMoreSource" root replica />
              </div>
            </template>
          </HomeFigmaSection>
        </div>
        <div v-for="(sourceId, index) in ['1401:18','1401:281','1401:49']" :id="`process-stage-${flowSteps[index+1]!.no}`" :key="sourceId" :ref="el => setProcessStageRef(el, index+1)">
          <HomeFigmaSection :desktop-id="sourceId" :label="`来华就医·${flowSteps[index+1]!.label}`" :hidden="['1401:26','1401:282','1401:50','1401:303']" :flow-roots="['1401:289']" :content-height-id="sourceId === '1401:281' ? '1401:289' : undefined" :actions="journeyActions" :styles="desktopFaqStyles" :attributes="desktopFaqAttributes" @activate="activateFigmaAction">
            <template #after="{ node }">
              <div v-if="desktopFaqRows.includes(node.id)" :id="`home-desktop-faq-answer-${desktopFaqRows.indexOf(node.id)}`" class="home-source-faq-answer" :class="{ 'is-open':expandedDesktopFaqs.has(desktopFaqRows.indexOf(node.id)) }" :inert="!expandedDesktopFaqs.has(desktopFaqRows.indexOf(node.id))" :aria-hidden="!expandedDesktopFaqs.has(desktopFaqRows.indexOf(node.id))">
                <div><HomeSourceNode :node="homeDesktopNodes.get('1401:303')!" root fluid :hidden="processFaqs[desktopFaqRows.indexOf(node.id)]!.lead ? [] : ['1401:304']" :texts="{ '1401:304': processFaqs[desktopFaqRows.indexOf(node.id)]!.lead || '', '1401:305': processFaqs[desktopFaqRows.indexOf(node.id)]!.answer }" :styles="{ '1401:305':'height:auto!important;white-space:pre-wrap;' }" /></div>
              </div>
            </template>
          </HomeFigmaSection>
        </div>
        <div class="journey-desktop__rail-lane">
          <aside class="journey-desktop__rail" aria-label="当前流程阶段">
            <HomeSourceNode :node="homeDesktopNodes.get('1412:5780')!" root :texts="{ '1412:5782': flowSteps[activeProcessIndex]!.label, '1412:5786': flowSteps[activeProcessIndex]!.no }" />
          </aside>
        </div>
      </div>
    </div>

    <HomePatientStories id="patient-story" @activate="activateFigmaAction" />
    <HomeFigmaSection id="care-section" desktop-id="1412:6019" mobile-id="1528:391" label="就医全程陪伴" :actions="homeFigmaActions" @activate="activateFigmaAction" />
    <HomeFigmaSection desktop-id="1412:6055" mobile-id="1528:412" label="陪你走全程的人" />
    <HomeFigmaSection id="data-section" desktop-id="1412:6092" mobile-id="1528:429" label="中国医疗数据优势">
      <template #radar><div ref="radarChartEl" class="revision-chart" role="img" aria-label="中国、美国、德国医疗能力雷达图" /></template>
      <template #cost><div ref="costChartEl" class="revision-chart" role="img" aria-label="治疗费用对比" /></template>
    </HomeFigmaSection>
    <HomeFigmaSection desktop-id="1412:6313" mobile-id="1528:621" label="权威合作医院" :actions="homeFigmaActions" :baseline-nodes="['1528:632','1528:639','1528:646','1528:653']" @activate="activateFigmaAction" />
    <HomeFigmaSection desktop-id="1412:6350" mobile-id="1528:656" label="权威专家团队" :actions="homeFigmaActions" @activate="activateFigmaAction" />
    <HomeStrengthSection />
    <HomePartnersSection />
    <HomeFigmaSection id="home-cta" desktop-id="1412:6635" mobile-id="1528:771" label="开启来华就医之旅" :actions="homeFigmaActions" :texts="{ '1412:6652': '预约专家面诊 $200起' }" @activate="activateFigmaAction" />

    <HomeSourceDialog v-if="whyModalOpen" :desktop-panel="whyDesktopPanels[selectedWhyIndex]!" :mobile-panel="whyMobilePanels[selectedWhyIndex]!" :desktop-title="whyDesktopTitles[selectedWhyIndex]!" :mobile-title="whyMobileTitles[selectedWhyIndex]!" :actions="whySourceActions" @close="closeWhyDetail" />
    <HomeSourceDialog v-if="storyModalOpen" desktop-panel="1407:8" mobile-panel="1543:42" desktop-title="1407:14" mobile-title="1543:134" :actions="storySourceActions" scroll-node="1407:28" photo-carousel @close="closeStoryDetail" />
    <HomeExpertDialog v-if="selectedExpert!==null" :expert="selectedExpert" @close="selectedExpert=null" />
  </div>
</template>

<style scoped>
.revision-chart { width:100%; height:100%; }
.home-source-faq-answer { display:grid; grid-template-rows:0fr; width:100%; opacity:0; transition:grid-template-rows .38s cubic-bezier(.22,1,.36,1),opacity .24s ease; }
.home-source-faq-answer.is-open { grid-template-rows:1fr; opacity:1; }
.home-source-faq-answer > div { min-height:0; overflow:hidden; }
.home-source-faq-answer__copy { padding:0 0 24px; }
.home-source-faq-answer strong { display:block; margin:0 0 12px; color:#2563eb; font:500 14px/22px 'PingFang SC',sans-serif; }
.home-source-faq-answer p { margin:0; color:#6b7280; font:400 14px/22px 'PingFang SC',sans-serif; }
@media (prefers-reduced-motion:reduce) { .home-source-faq-answer { transition:none; } }
.home-source-journey { position:relative; background:#f5f6f7; }
.journey-desktop { position:relative; }
.journey-desktop :deep([data-home-why-copy]) { transition:transform .3s cubic-bezier(.22,1,.36,1); }
.journey-desktop :deep([data-home-why-copy="0"]) { transform:translateY(32px)!important; }
.journey-desktop :deep([data-figma-node="1412:5804"]),.home-why-card__more { opacity:0; transition:opacity .3s cubic-bezier(.22,1,.36,1); }
.home-why-card__more { position:absolute; pointer-events:none; }
.journey-desktop :deep([data-home-why-card]:hover [data-home-why-copy]),.journey-desktop :deep([data-home-why-card]:focus-visible [data-home-why-copy]) { transform:translateY(-32px)!important; }
.journey-desktop :deep([data-home-why-card="0"]:hover [data-home-why-copy]),.journey-desktop :deep([data-home-why-card="0"]:focus-visible [data-home-why-copy]) { transform:none!important; }
.journey-desktop :deep([data-home-why-card]:hover [data-figma-node="1412:5804"]),.journey-desktop :deep([data-home-why-card]:focus-visible [data-figma-node="1412:5804"]),
.journey-desktop :deep([data-home-why-card]:hover .home-why-card__more),.journey-desktop :deep([data-home-why-card]:focus-visible .home-why-card__more) { opacity:1; }
.journey-desktop :deep([data-home-why-card]:focus-visible) { outline:2px solid #2563eb; outline-offset:3px; }
@media (prefers-reduced-motion:reduce) { .journey-desktop :deep([data-home-why-copy]),.journey-desktop :deep([data-figma-node="1412:5804"]),.home-why-card__more { transition:none; } }
.journey-desktop__tail { position:relative; display:grid; width:min(1216px,calc(100% - 48px)); margin:0 auto; grid-template-columns:220px minmax(0,802px); justify-content:space-between; }
.journey-desktop__tail .home-process__stack { grid-column:2; }
.journey-desktop__tail .home-process__stage::before { display:none; }
.journey-desktop__tail .home-process__stage[data-stage="02"] { display:flex; min-height:754px; flex-direction:column; justify-content:center; padding:80px 0; }
.journey-desktop__tail .home-process__stage[data-stage="03"] { min-height:1148px; padding:96px 0; }
.journey-desktop__tail .home-process__stage[data-stage="04"] { min-height:1384px; padding:96px 0; }
.journey-desktop__rail-lane { position:absolute; z-index:2; top:calc(279px * var(--journey-scale)); bottom:calc(279px * var(--journey-scale)); left:calc(50% - 588px * var(--journey-scale)); width:calc(220px * var(--journey-scale)); pointer-events:none; }
.journey-desktop__rail { position:sticky; top:88px; height:calc(650px * var(--journey-scale)); }
.journey-desktop__rail > :deep([data-figma-node]) { transform:scale(var(--journey-scale))!important; transform-origin:top left!important; }
@media (min-width:701px) and (max-width:1199px) { .journey-desktop__tail { grid-template-columns:minmax(160px,220px) minmax(0,1fr); gap:24px; } }
.home-source-partners :deep([data-figma-node="1528:766"]) { overflow:hidden!important; }
@media (max-width:700px) { .home-page { margin-top:0!important; } }
.home-page { margin-top:-64px; background:#fff; color:#1e3a5f; font-family:'PingFang SC',sans-serif; }
.home-page section[id] { scroll-margin-top:72px; }
.home-page :deep(.hy-container) { width:min(1216px,calc(100% - 48px)); }
.home-hero { position:relative; height:754px; overflow:hidden; isolation:isolate; background:#eaf4f9; }
.home-hero__image,.home-hero__wash { position:absolute; inset:0; }
.home-hero__image { z-index:-2; width:100%; height:100%; object-fit:fill; object-position:left top; }
.home-hero__image--source { width:100%; height:100%; object-fit:fill; }
.home-hero__wash { z-index:-1; background:linear-gradient(90deg,#ebf3f8 0%,rgba(235,243,248,0) 100%); }
.home-hero__wash--first { width:1290px; }
.home-hero__wash--assurance { display:none; }
.home-hero__wash--patient { background:transparent; }
.home-hero__inner { display:flex; height:754px; align-items:center; }
.home-hero__copy { display:flex; width:730px; height:362px; flex-direction:column; align-items:flex-start; gap:40px; }
.home-hero__copy--simple,.home-hero__copy--assurance { height:auto; }
.home-hero__copy--assurance { gap:48px; }
.home-hero__copy--assurance .home-hero__heading { height:auto; }
.home-hero__bullets { display:flex; flex-direction:column; gap:32px; }
.home-hero__bullets>div { display:flex; flex-direction:column; gap:12px; }
.home-hero__bullets strong { display:flex; align-items:center; gap:8px; color:#143162; font-size:20px; font-weight:600; line-height:20px; }
.home-hero__bullets img { width:20px; height:20px; }
.home-hero__bullets p { font-size:18px; line-height:18px; }
.home-hero__eyebrow { display:inline-flex; height:34px; align-items:center; gap:4px; border:0; border-radius:9999px; padding:0 16px; background:rgba(37,99,235,.1); color:#2563eb; font-size:14px; line-height:14px; white-space:nowrap; }
.home-hero__eyebrow img { width:14px; height:14px; flex:none; }
.home-hero__heading { display:flex; height:94px; flex-direction:column; gap:24px; }
.home-hero h1 { width:732px; margin:0; color:#143162; font-family:"PingFang SC",sans-serif; font-size:52px; font-weight:600; line-height:52px; white-space:nowrap; }
.home-hero p { margin:0; color:#5b606a; font-family:"PingFang SC",sans-serif; font-size:18px; font-weight:400; line-height:18px; white-space:nowrap; }
.home-hero__meta { display:flex; width:max-content; max-width:100%; height:46px; align-items:center; border:1px solid rgba(37,99,235,.2); border-radius:10px; padding:0 12px; background:rgba(255,255,255,.1); color:#3b82f6; font-size:14px; line-height:20px; white-space:nowrap; }
.home-hero__button-wrap { height:68px; padding-top:16px; }
.home-hero__button { display:inline-flex; width:168px; height:52px; align-items:center; justify-content:center; gap:10px; border-radius:14px; padding:0 24px; background:#1e3a5f; color:#fff; font-size:16px; font-weight:600; line-height:16px; white-space:nowrap; box-shadow:0 4px 6px -4px rgba(0,0,0,.1); transition:transform .25s ease,background .25s ease,box-shadow .25s ease; }
.home-hero__copy--simple .home-hero__button-wrap { height:72px; }
.home-hero__copy--simple .home-hero__button { width:auto; height:56px; }
.home-hero__button:hover { transform:translateY(-2px); background:#dd6b20; box-shadow:0 12px 28px rgba(221,107,32,.24); }
.home-hero__button img { width:16px; height:16px; }
.home-hero__arrow { position:absolute; top:50%; z-index:2; display:grid; width:48px; height:48px; place-items:center; border:0; border-radius:50%; background:#fff; color:#1e3a5f; cursor:pointer; transform:translateY(-50%); transition:transform .25s ease,background .25s ease; }
.home-hero__arrow:hover { transform:translateY(-50%) scale(1.06); background:#fff; }
.home-hero__arrow img { width:24px; height:24px; }
.home-hero__arrow--left img { transform:rotate(180deg); }
.home-hero__arrow--left { right:auto!important; left:24px!important; }
.home-hero__arrow--right { right:24px!important; left:auto!important; }
.home-hero__controls { position:absolute; bottom:26px; left:50%; display:flex; height:10px; gap:8px; transform:translateX(-50%); }
.home-hero__controls button { width:10px; height:10px; border:0; border-radius:5px; padding:0; background:#d1d7db; cursor:pointer; transition:width .25s ease,background .25s ease; }
.home-hero__controls button.active { width:32px; background:#dd6b20; }
.home-hero__assistant { position:absolute; top:686px; right:24px; z-index:3; display:flex; align-items:center; gap:8px; border:0; border-radius:9999px; padding:12px 16px; background:linear-gradient(135deg,#dd6b20,#3b82f6); box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1); color:#fff; font-family:'SF Pro','PingFang SC',sans-serif; font-size:14px; font-weight:500; line-height:20px; cursor:pointer; }
.home-hero__assistant img { width:20px; height:20px; }
.hero-image-enter-active,.hero-image-leave-active,.hero-copy-enter-active,.hero-copy-leave-active { transition:opacity .55s ease,transform .65s cubic-bezier(.22,1,.36,1),filter .5s ease; }
.hero-image-enter-from,.hero-image-leave-to { opacity:0; transform:scale(1.025); filter:blur(3px); }
.hero-copy-enter-from { opacity:0; transform:translateY(16px); }
.hero-copy-leave-to { opacity:0; transform:translateY(-10px); }
.section-title { height:80px; text-align:center; }
.section-title h2 { margin:0; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:40px; font-weight:700; line-height:40px; }
.section-title p { margin:0; padding-top:16px; color:#6b7280; font-size:16px; line-height:24px; }
.home-process { display:flex; flex-direction:column; gap:72px; padding:64px 0 53px; background:#fff; }
.home-process__heading { flex:none; }
.home-process__heading h2 { margin:0; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:40px; font-weight:700; line-height:40px; letter-spacing:.4px; text-align:center; }
.home-process__body { position:relative; display:grid; grid-template-columns:220px 802px; justify-content:space-between; gap:0; align-items:start; isolation:isolate; }
.home-process__rail { position:sticky; top:104px; display:flex; width:220px; height:650px; align-items:center; align-self:start; z-index:2; margin-left:20px; }
.home-process__rail-line { position:absolute; top:0; bottom:0; left:56px; width:8px; background:linear-gradient(180deg,#f5f6f7,transparent 35%,transparent 65%,#f5f6f7),repeating-linear-gradient(180deg,rgba(30,58,95,.1) 0 15px,transparent 15px 31px); -webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 8%,#000 92%,transparent 100%); mask-image:linear-gradient(180deg,transparent 0%,#000 8%,#000 92%,transparent 100%); box-sizing:border-box; }
.home-process__rail-node { position:relative; z-index:1; display:grid; width:120px; height:120px; box-sizing:content-box; place-items:center; flex:none; margin-left:-20px; border:20px solid rgba(30,58,95,.1); border-radius:80px; background:#1e3a5f; background-clip:padding-box; color:#fff; transition:transform .45s cubic-bezier(.22,1,.36,1),background .35s ease; }
.home-process__rail-node strong { font-family:Poppins,'SF Pro',sans-serif; font-size:48px; font-weight:500; line-height:120px; }
.home-process__rail>span { position:relative; z-index:1; margin-left:20px; padding:4px 0; background:#f5f6f7; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:30px; font-weight:700; line-height:48px; white-space:nowrap; }
.home-process__stack { position:relative; z-index:1; min-width:0; }
.home-process__stage { position:relative; z-index:0; box-sizing:border-box; padding:96px 0; background:transparent; }
.home-process__stage::before { position:absolute; z-index:-1; top:0; bottom:0; left:calc((1216px - 100vw)/2 - 414px); width:100vw; background:#f5f6f7; content:""; }
.home-process__stage:first-child { min-height:1208px; padding-top:96px; padding-bottom:96px; }
.home-process__stage:nth-child(2) { display:flex; min-height:754px; flex-direction:column; justify-content:center; padding-top:80px; padding-bottom:80px; }
.home-process__stage:nth-child(3) { min-height:1148px; }
.home-process__stage:nth-child(4) { min-height:1384px; }
.home-process__stage:nth-child(4) .home-process__actions { margin-top:40px; }
.home-process__stage + .home-process__stage { margin-top:0; }
.home-process__content { position:relative; z-index:1; width:100%; box-sizing:border-box; }
.home-process__content h3 { margin:0; color:#1e3a5f; font-family:'PingFang SC','SF Pro',sans-serif; font-size:40px; font-weight:600; line-height:40px; letter-spacing:.4px; }
.home-process__subtitle { margin:16px 0 0; color:#6b7280; font-size:16px; line-height:24px; }
.home-process__why-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; margin-top:48px; }
.home-process__why-grid article { display:flex; height:280px; box-sizing:border-box; flex-direction:column; justify-content:space-between; border-radius:24px; padding:24px; background:#fff; cursor:pointer; transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }
.home-process__why-grid article:hover,.home-process__why-grid article:focus-visible { transform:translateY(-5px); box-shadow:0 18px 36px rgb(19 55 84 / 9%); outline:2px solid rgb(37 99 235 / 35%); outline-offset:3px; }
.home-process__why-grid article>img { width:32px; height:32px; object-fit:contain; }
.home-process__why-grid h4 { margin:24px 0 0; color:#1e3a5f; font-size:24px; font-weight:600; line-height:24px; }
.home-process__why-grid p { margin:16px 0 0; color:#4b5563; font-size:16px; line-height:24px; }
.home-process__actions { display:flex; align-items:center; gap:12px; margin-top:48px; }
.home-process__primary,.home-process__secondary { display:inline-flex; min-height:40px; align-items:center; gap:6px; border-radius:10px; padding:0 16px; font:500 14px/20px 'PingFang SC',sans-serif; cursor:pointer; transition:transform .25s ease,box-shadow .25s ease; }
.home-process__primary img,.home-process__secondary img { width:20px; height:20px; flex:none; object-fit:contain; }
.home-process__stage:nth-child(2) .home-process__primary,.home-process__stage:nth-child(2) .home-process__secondary { min-height:48px; border-radius:10px; padding:0 16px; font-size:16px; line-height:24px; }
.home-process__stage:nth-child(2) .home-process__primary { background:linear-gradient(100deg,#dd6b20 0%,#3b82f6 100%); }
.home-process__stage:nth-child(2) .home-process__primary img { filter:brightness(0) invert(1); }
.home-process__stage:nth-child(2) .home-process__secondary { border:1px solid #1e3a5f; }
.home-process__primary { border:0; background:#dd6b20; color:#fff; box-shadow:0 4px 8px rgb(221 107 32 / 20%); }
.home-process__secondary { border:1px solid #1e3a5f; background:#fff; color:#1e3a5f; }
.home-process__primary:hover,.home-process__secondary:hover { transform:translateY(-2px); box-shadow:0 8px 18px rgb(19 55 84 / 12%); }
.home-process__faq { display:grid; margin-top:40px; border-top:1px solid #dbdee6; }
.home-process__faq button { position:relative; display:grid; grid-template-columns:1fr auto; gap:14px; width:100%; border:0; border-bottom:1px solid #dbdee6; padding:16px 0; background:transparent; color:#1e3a5f; font:600 16px/24px 'PingFang SC',sans-serif; text-align:left; cursor:pointer; }
.home-process__faq button>span:nth-child(2) { color:#1e3a5f; font-size:18px; line-height:20px; transition:transform .3s ease; }
.home-process__faq button.open>span:nth-child(2) { transform:rotate(180deg); }
.home-process__faq button p { grid-column:1 / -1; margin:0; color:#6b7280; font:400 14px/22px 'PingFang SC',sans-serif; }
.home-process__faq button strong { grid-column:1 / -1; margin:0; color:#2563eb; font:400 14px/20px 'PingFang SC',sans-serif; }
.home-process__faq-cta { margin-top:24px; }
.home-process__disease-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; margin-top:48px; }
.home-process__disease-grid a { display:flex; height:300px; box-sizing:border-box; flex-direction:column; align-items:flex-start; border-radius:24px; padding:24px; background:#fff; color:#1e3a5f; transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .3s ease; }
.home-process__disease-grid a:hover { transform:translateY(-4px); box-shadow:0 14px 28px rgb(19 55 84 / 10%); }
.home-process__disease-grid img { width:32px; height:32px; flex:none; object-fit:contain; }
.home-process__disease-grid strong { margin-top:auto; color:#1e3a5f; font-size:24px; font-weight:600; line-height:24px; }
.home-process__disease-grid small { margin-top:16px; color:#4b5563; font-size:16px; line-height:24px; }
.home-process__disease-grid small b { color:#2563eb; font-weight:500; }
.home-process__disease-grid p { margin:8px 0 0; color:#4b5563; font-size:16px; line-height:24px; }
.home-process__note { margin:16px 0 0; color:#6b7280; font-size:14px; line-height:20px; }
.home-flow { height:516px; box-sizing:border-box; border-bottom:1px solid #e5e7eb; padding:96px 0; background:#fff; }
.home-flow__heading { width:100%; height:80px; text-align:center; }
.home-flow__heading h2 { margin:0; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:40px; font-weight:700; line-height:40px; letter-spacing:.4px; }
.home-flow__heading p { margin:0; padding-top:16px; color:#6b7280; font-family:'PingFang SC','SF Pro',sans-serif; font-size:16px; font-weight:400; line-height:24px; }
.home-flow__line { position:relative; display:grid; height:244px; grid-template-columns:repeat(4,minmax(0,1fr)); margin-top:0; padding-top:68px; }
.home-flow__progress { position:absolute; top:106px; left:10.5%; right:10.5%; height:4px; border:2px dashed #fcf1e9; pointer-events:none; }
.home-flow__step { position:relative; z-index:1; display:flex; width:285px; height:176px; box-sizing:border-box; flex-direction:column; align-items:center; padding:0 20px; text-align:center; }
.home-flow__step>span { display:grid; width:80px; height:80px; flex:none; box-sizing:border-box; place-items:center; border:0; outline:20px solid #fcf1e9; border-radius:40px; background:#fff; color:#1e3a5f; font-family:'PingFang SC',sans-serif; font-size:32px; font-weight:600; line-height:80px; transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease,background .35s ease,color .35s ease; }
.home-flow__step:hover>span,.home-flow__step:focus-visible>span { transform:translateY(-4px); box-shadow:0 14px 30px rgba(221,107,32,.13); background:#1e3a5f; color:#fff; }
.home-flow__step strong { width:100%; height:64px; box-sizing:border-box; padding-top:40px; color:#dd6b20; font-family:'SF Pro','PingFang SC',sans-serif; font-size:24px; font-weight:700; line-height:24px; }
.home-flow__step small { width:100%; height:32px; padding-top:16px; color:#6b7280; font-family:'SF Pro','PingFang SC',sans-serif; font-size:16px; line-height:16px; }
.why-overview { height:1208px; padding:96px 0; background:#f5f6f7; }
.why-overview__layout { display:grid; height:1016px; grid-template-columns:220px 802px; justify-content:space-between; margin-top:0; }
.why-overview aside { position:sticky; top:96px; align-self:start; display:flex; height:650px; align-items:center; margin-top:183px; padding:0; }
.why-overview aside::before { position:absolute; top:0; bottom:0; left:74px; width:8px; background:linear-gradient(180deg,#f5f6f7,transparent 35%,transparent 65%,#f5f6f7),repeating-linear-gradient(180deg,rgba(30,58,95,.1) 0 15px,transparent 15px 31px); content:''; }
.why-overview aside div { position:relative; z-index:1; display:grid; width:160px; height:160px; flex:none; place-items:center; border:20px solid rgba(30,58,95,.1); border-radius:80px; background:#1e3a5f; background-clip:padding-box; color:#fff; }
.why-overview aside strong { font-family:Poppins,sans-serif; font-size:48px; font-weight:500; line-height:120px; }
.why-overview aside h3 { position:relative; z-index:1; margin:0 0 0 20px; padding:4px 0; background:#f5f6f7; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:30px; font-weight:700; line-height:48px; white-space:nowrap; }
.why-overview .section-title h2,.patient-story .section-title h2 { font-family:'PingFang SC',sans-serif; font-weight:600; }
.why-overview__main { width:802px; height:1016px; }
.why-overview__main .section-title { width:802px; text-align:left; }
.why-overview__grid { display:grid; width:802px; height:936px; grid-template-columns:repeat(2,389px); grid-template-rows:repeat(3,280px); gap:24px; padding-top:48px; }
.why-overview__grid article { display:flex; width:389px; height:280px; flex-direction:column; align-items:flex-start; border:0; border-radius:24px; padding:24px; background:#fff; box-shadow:none; text-align:left; cursor:pointer; transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }
.why-overview__grid article:hover,.why-overview__grid article:focus-visible { transform:translateY(-6px); box-shadow:0 18px 36px rgba(19,55,84,.09); outline:2px solid rgba(37,99,235,.45); outline-offset:3px; }
.why-overview__grid .why-overview__icon { width:32px; height:32px; flex:none; object-fit:contain; }
.why-overview__grid h3 { margin:auto 0 16px; color:#1e3a5f; font-size:24px; line-height:24px; font-weight:600; }
.why-overview__grid p { margin:0; color:#4b5563; font-size:16px; line-height:24px; }
.why-overview__more { display:flex; align-items:center; gap:4px; margin-top:16px; color:#dd6b20; font-size:16px; font-weight:500; line-height:16px; opacity:0; transform:translateY(4px); transition:opacity .25s ease,transform .25s ease; }
.why-overview__grid article:hover .why-overview__more,.why-overview__grid article:focus-visible .why-overview__more { opacity:1; transform:none; }
.why-overview__more img { width:16px; height:16px; margin:0; }
.patient-story { height:720px; padding:96px 0; background:#fff; }
.patient-story__viewport { position:relative; display:grid; }
.patient-story__card { display:grid; height:448px; grid-template-columns:389.33px 1fr; gap:24px; margin-top:0; padding-top:48px; }
.patient-story__contents { display:grid; min-width:0; }
.patient-story__image { position:relative; height:400px; overflow:hidden; border-radius:24px; }
.patient-story__image img { width:100%; height:100%; object-fit:cover; object-position:60.7% 0; }
.patient-story__image>img { position:absolute; inset:0; visibility:hidden; opacity:0; transition:opacity .5s ease,visibility .5s; }
.patient-story__image>img.active { visibility:visible; opacity:1; }
.patient-story__image>span { position:absolute; bottom:24px; left:50%; display:flex; gap:8px; transform:translateX(-50%); }
.patient-story__image i { width:10px; height:10px; border-radius:9999px; background:rgba(255,255,255,.2); }
.patient-story__image i.active { width:32px; background:#dd6b20; }
.patient-story__image>span { z-index:1; bottom:13px; }
.patient-story__image>span button { display:grid; place-items:center; height:32px; border:0; padding:0; background:none; cursor:pointer; }
.patient-story__image>span i { display:block; }
.patient-story__pause { position:absolute; top:16px; right:16px; min-height:32px; border:0; border-radius:999px; padding:6px 12px; background:rgba(15,22,46,.6); color:#fff; font-size:12px; opacity:0; transition:opacity .2s; }
.patient-story__viewport:hover .patient-story__pause,.patient-story__viewport:focus-within .patient-story__pause { opacity:1; }
.patient-story__content { display:flex; min-width:0; height:400px; flex-direction:column; justify-content:space-between; align-items:flex-start; border-radius:24px; padding:32px; background:#f5f6f7; }
.patient-story__content { grid-area:1 / 1; visibility:hidden; opacity:0; pointer-events:none; transition:opacity .5s ease,visibility .5s; }
.patient-story__content--active { visibility:visible; opacity:1; pointer-events:auto; }
.patient-story__top { display:flex; width:100%; flex-direction:column; align-items:flex-start; }
.patient-story__bottom { display:flex; width:100%; align-items:flex-end; justify-content:space-between; }
.patient-story__card b { border-radius:23px 47px 47px 23px; padding:4px 12px; background:#2563eb; color:#fff; font-size:14px; font-weight:400; line-height:21px; }
.patient-story blockquote { width:100%; margin:24px 0 0; color:#1e3a5f; font-size:24px; font-weight:500; line-height:36px; }
.patient-story__details { width:339.33px; max-width:100%; padding-top:24px; }
.patient-story__card p { display:flex; align-items:center; gap:8px; margin:0; color:#4b5563; font-size:16px; line-height:16px; }
.patient-story__details p + p { padding-top:16px; }
.patient-story__content:not([data-story-index="1"]) .patient-story__details p { align-items:flex-start; line-height:22px; }
.patient-story__card p img { width:16px; height:16px; flex:none; }
.patient-story__card small { color:#9ca3af; font-family:'DM Sans',sans-serif; font-size:14px; line-height:14px; }
.patient-story__card small span { color:#0f162e; }
.patient-story__card a { display:flex; height:52px; align-items:center; gap:8px; border-radius:14px; padding:18px 24px; background:#dd6b20; color:#fff; font-size:16px; font-weight:600; line-height:16px; }
.patient-story__card a { box-shadow:0 4px 6px -4px rgba(0,0,0,.1); }
.patient-story__card a img { width:16px; height:16px; }
.care-section { height:544px; padding:96px 0; background:#f5f6f7; }
.care-grid { display:grid; height:272px; grid-template-columns:repeat(3,1fr); gap:24px; padding-top:48px; }
.care-grid a { position:relative; display:flex; height:224px; flex-direction:column; align-items:flex-start; justify-content:flex-end; overflow:hidden; border-radius:24px; padding:24px; background:#fff; transition:transform .35s ease,box-shadow .35s ease; }
.care-grid a:hover { transform:translateY(-5px); box-shadow:0 17px 35px rgba(22,58,89,.08); }
.care-grid a>span { position:absolute; top:24px; left:24px; display:grid; width:32px; height:32px; place-items:center; border:1px solid #2563eb; border-radius:50%; color:#2563eb; font-family:'Alibaba PuHuiTi','PingFang SC',sans-serif; font-size:16px; line-height:24px; }
.care-grid h3 { margin:0 0 16px; color:#1e3a5f; font-size:24px; line-height:24px; font-weight:600; }
.care-grid p { margin:0; color:#4b5563; font-size:16px; line-height:24px; }
.team-section { height:596px; padding:96px 0; background:#fff; }
.team-grid { display:grid; height:324px; grid-template-columns:repeat(4,1fr); gap:24px; padding-top:48px; }
.team-grid article { position:relative; width:286px; height:276px; border-radius:24px; padding:24px; background:#f5f6f7; transition:transform .35s ease,background .3s ease,box-shadow .35s ease; }
.team-grid article:hover { transform:translateY(-5px); background:#fff; box-shadow:0 17px 35px rgba(22,58,89,.08); }
.team-grid__image { display:block; width:60px; height:60px; border-radius:16px; background-repeat:no-repeat; }
.team-grid h3 { margin:80px 0 16px; color:#1e3a5f; font-size:24px; line-height:24px; font-weight:600; }
.team-grid article:not(:first-child) { display:flex; flex-direction:column; }
.team-grid article:not(:first-child) h3 { margin-top:auto; }
.team-grid p { margin:0; color:#4b5563; font-family:"PingFang SC",sans-serif; font-size:16px; line-height:24px; }
.data-section { height:740px; padding:96px 0; background:#f5f6f7; }
.data-grid { display:grid; height:468px; grid-template-columns:repeat(2,592px); gap:32px; padding-top:48px; }
.data-grid article { width:592px; min-width:0; height:420px; border-radius:24px; padding:40px 24px; background:#fff; }
.data-grid h3 { margin:0; text-align:center; color:#1e3a5f; font-family:'SF Pro','PingFang SC',sans-serif; font-size:24px; line-height:24px; font-weight:700; }
.source-chart { position:relative; display:block; width:542px; height:auto; aspect-ratio:542 / 300; max-width:100%; margin-top:16px; overflow:hidden; }
.chart-canvas { position:absolute; inset:0; width:100%!important; height:100%!important; }
.chart-canvas :deep(>div),.chart-canvas :deep(canvas) { width:100%!important; height:100%!important; }
.radar { width:min(280px,100%); margin:28px auto 0; }
.radar svg { width:100%; overflow:visible; }
.radar text { fill:#758698; font-size:11px; text-anchor:middle; }
.chart-legend { display:flex; flex-wrap:wrap; justify-content:center; gap:18px; color:#687b8d; font-size:11px; }
.chart-legend span { display:flex; align-items:center; gap:5px; }
.chart-legend i { width:9px; height:9px; }
.chart-legend .blue { background:#2b6ff7; }
.chart-legend .navy { background:#233f63; }
.chart-legend .gold { background:#d5a72f; }
.chart-legend .gray { background:#95a5b8; }
.cost-chart { position:relative; display:grid; grid-template-columns:repeat(6,1fr); gap:8px; align-items:end; height:267px; margin-top:20px; padding-left:28px; border-bottom:1px solid #dce4ea; background:repeating-linear-gradient(to bottom,#e9eef2 0,#e9eef2 1px,transparent 1px,transparent 61px); }
.cost-chart>div:not(.cost-axis) { display:flex; height:267px; flex-direction:column; justify-content:flex-end; align-items:center; }
.cost-chart>div:not(.cost-axis)>div { display:flex; height:225px; align-items:flex-end; gap:3px; }
.cost-axis { position:absolute; top:-6px; bottom:16px; left:0; display:flex; flex-direction:column; justify-content:space-between; color:#6b7280; font-size:9px; line-height:10px; }
.cost-chart i { display:block; width:9px; min-height:3px; border-radius:2px 2px 0 0; }
.cost-chart .china { background:#2b6ff7; }
.cost-chart .usa { background:#233f63; }
.cost-chart .germany { background:#d5a72f; }
.cost-chart .japan { background:#95a5b8; }
.cost-chart>div:not(.cost-axis)>span { margin-top:9px; color:#65778a; font-size:9px; white-space:nowrap; }
.hospital-section { height:703px; padding:96px 0; background:#fff; }
.hospital-grid { display:grid; height:431px; grid-template-columns:repeat(4,286px); gap:24px; padding-top:48px; }
.hospital-grid a { height:383px; transition:transform .35s ease; }
.hospital-grid a:hover { transform:translateY(-5px); }
.hospital-grid__image { display:block; width:286px; height:286px; border-radius:24px; background-repeat:no-repeat; }
.hospital-grid h3 { margin:24px 0 0 8px; color:#1e3a5f; font-size:22px; line-height:22px; font-weight:600; }
.hospital-grid p { margin:16px 0 0 8px; color:#6b7280; font-size:14px; line-height:20px; }
.expert-section { height:667px; padding:96px 0; background:#f5f6f7; }
.expert-section .section-title { height:169px; }
.expert-section .section-title h2,.strength-section .section-title h2,.partners-section .section-title h2 { line-height:39px; }
.expert-tabs { display:flex; height:90px; justify-content:center; gap:12px; margin:0; padding-top:48px; }
.expert-tabs button { height:42px; border:1px solid #dbdee6; border-radius:24px; padding:0 24px; background:transparent; color:#1e3a5f; font-size:16px; line-height:18px; cursor:pointer; }
.expert-tabs button.active { font-weight:500; }
.expert-tabs button:not(.active) { line-height:16px; }
.expert-tabs button.active { border-color:#dd6b20; background:#dd6b20; color:#fff; }
.expert-grid { display:grid; height:306px; grid-template-columns:repeat(4,286px); gap:24px; margin:0; padding-top:40px; }
.expert-grid article { display:flex; width:286px; height:266px; flex-direction:column; gap:24px; border-radius:24px; padding:24px; background:#fff; }
.expert-grid article:nth-child(1) { grid-column:3; grid-row:1; }
.expert-grid article:nth-child(2) { grid-column:4; grid-row:1; }
.expert-grid article:nth-child(3) { grid-column:1; grid-row:1; }
.expert-grid article:nth-child(4) { grid-column:2; grid-row:1; }
.expert-grid article>div:first-child { display:flex; height:60px; align-items:center; gap:12px; }
.expert-grid__portrait { display:block; width:60px; height:60px; flex:none; border-radius:16px; background-color:#5b5d63; background-repeat:no-repeat; }
.expert-grid__body { display:flex; flex-direction:column; }
.expert-grid__details,.expert-grid__specialty { display:flex; flex-direction:column; }
.expert-grid__specialty { padding-top:48px; }
.expert-grid h3 { margin:0; color:#1e3a5f; font-size:24px; line-height:24px; font-weight:600; }
.expert-grid article:nth-child(2) h3 { color:#0f162e; }
.expert-grid p { display:flex; align-items:center; gap:8px; margin:0; color:#4b5563; font-size:14px; line-height:16px; }
.expert-grid p+p { margin-top:12px; }
.expert-grid p img { width:14px; height:14px; flex:none; }
.expert-grid strong { display:block; margin-top:auto; color:#1e3a5f; font-size:16px; line-height:16px; font-weight:500; }
.expert-grid small { display:block; margin-top:12px; color:#6b7280; font-size:14px; line-height:14px; }
.expert-empty { display:grid; height:306px; place-content:center; justify-items:center; gap:18px; padding-top:40px; color:#6b7280; text-align:center; }
.expert-empty p { margin:0; font-size:16px; }
.expert-empty button { min-height:44px; border:0; border-radius:14px; padding:0 22px; background:#1e3a5f; color:#fff; cursor:pointer; }
.strength-section { height:1459px; background:#fff; }
.strength-sticky { position:sticky; top:64px; height:699px; padding:96px 0; box-sizing:border-box; overflow:hidden; }
.strength-section .section-title { height:79px; }
.strength-layout { display:grid; height:428px; grid-template-columns:repeat(2,minmax(0,596px)); gap:24px; align-items:start; margin:0; padding-top:48px; box-sizing:border-box; }
.strength-copy-window { width:596px; height:380px; overflow:hidden; }
.strength-copy-track { width:596px; height:1140px; will-change:transform; }
.strength-copy-state { display:flex; width:596px; height:380px; flex-direction:column; justify-content:center; align-items:flex-start; box-sizing:border-box; }
.strength-copy-state h3 { width:100%; margin:0; color:#1e3a5f; font-family:'PingFang SC',sans-serif; font-size:36px; font-weight:600; line-height:36px; }
.strength-copy-state p { width:480px; max-width:100%; margin:0; padding:32px 0 16px; color:#4b5563; font-family:'DM Sans','PingFang SC',sans-serif; font-size:18px; font-weight:400; line-height:27px; }
.strength-copy-state__mobile-image { display:none; }
.strength-artwork { position:relative; width:596px; height:409px; overflow:visible; border-radius:28px; }
.strength-layout__image { position:absolute; inset:0; display:block; width:100%; height:100%; border-radius:28px; object-fit:cover; object-position:right center; opacity:0; transition:opacity .55s ease; }
.strength-layout__image:first-child { top:-15px; }
.strength-layout__image.active { opacity:1; }
.why-detail-modal { position:fixed; inset:0; z-index:100; display:flex; align-items:flex-start; justify-content:center; overflow:auto; padding:40px 24px; background:rgba(0,0,0,.5); backdrop-filter:blur(4px); }
.why-detail-modal__panel { position:relative; width:min(896px,100%); margin:0 auto; border-radius:24px; padding:32px; background:#fff; color:#1e3a5f; box-sizing:border-box; }
.why-detail-modal__header { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; margin-bottom:32px; }
.why-detail-modal__header h2 { margin:0; color:#1e3a5f; font-family:'PingFang SC',sans-serif; font-size:36px; font-weight:600; line-height:44px; letter-spacing:0; }
.why-detail-modal__header p { margin:8px 0 0; color:#7b8494; font-size:18px; line-height:27px; }
.why-detail-modal__close { display:grid; width:32px; height:32px; flex:none; place-items:center; border:0; border-radius:8px; padding:0; background:transparent; color:#1e3a5f; cursor:pointer; }
.why-detail-modal__close span { display:block; font-family:Arial,sans-serif; font-size:32px; font-weight:300; line-height:28px; }
.why-detail-modal__close:hover,.why-detail-modal__close:focus-visible { outline:3px solid rgba(37,99,235,.35); outline-offset:3px; }
.visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }
.why-detail-modal__body { display:grid; gap:16px; }
.why-detail-modal__body--cards-2x2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
.why-detail-modal__body--table-cards { grid-template-columns:repeat(2,minmax(0,1fr)); }
.why-detail-modal__body--wide-cards { grid-template-columns:repeat(2,minmax(0,1fr)); }
.why-detail-modal__body--wide-cards article:first-child { grid-column:1 / -1; }
.why-detail-modal__body--cards-3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
.why-detail-modal__body article { min-height:328px; display:flex; flex-direction:column; border-radius:24px; padding:24px; background:#f5f6f7; box-sizing:border-box; }
.why-detail-modal__body--cards-2x2 article { min-height:408px; }
.why-detail-modal__body--table-cards article { min-height:390px; }
.why-detail-modal__body--wide-cards article:first-child { min-height:248px; }
.why-detail-modal__body--wide-cards article:not(:first-child) { min-height:328px; }
.why-detail-modal__body--state-3 article:first-child { min-height:292px; }
.why-detail-modal__body--state-3 article:not(:first-child) { min-height:368px; }
.why-detail-modal__body--cards-3 article { min-height:340px; }
.why-detail-modal__icon { flex:none; color:#2563eb; }
.why-detail-modal__card-copy { margin-top:auto; }
.why-detail-modal__body h3,.why-detail-modal__table-block h3 { margin:0; color:#1e3a5f; font-size:24px; font-weight:600; line-height:32px; }
.why-detail-modal__body h3 { white-space:nowrap; }
.why-detail-modal__body p { margin:16px 0 0; color:#5f6878; font-size:16px; line-height:26px; white-space:pre-line; }
.why-detail-modal__table-block { margin-bottom:24px; }
.why-detail-modal__table-block h3 { margin-bottom:16px; }
.why-detail-modal__table-wrap { overflow:hidden; border:1px solid #e5e7eb; border-radius:24px; }
.why-detail-modal__table-wrap table { width:100%; border-collapse:collapse; table-layout:fixed; font-size:16px; line-height:24px; }
.why-detail-modal__table-block--cost th:first-child,.why-detail-modal__table-block--cost td:first-child { width:40%; }
.why-detail-modal__table-block--cost th:not(:first-child),.why-detail-modal__table-block--cost td:not(:first-child) { width:20%; }
.why-detail-modal__table-block--care th:first-child,.why-detail-modal__table-block--care td:first-child { width:38%; }
.why-detail-modal__table-block--care th:last-child,.why-detail-modal__table-block--care td:last-child { width:62%; }
.why-detail-modal__table-wrap th { padding:16px 20px; background:#2563eb; color:#fff; text-align:left; font-weight:600; }
.why-detail-modal__table-wrap th:not(:first-child),.why-detail-modal__table-wrap td:not(:first-child) { text-align:left; }
.why-detail-modal__table-wrap td { padding:16px 20px; border-top:1px solid #e5e7eb; color:#7b8494; vertical-align:middle; }
.why-detail-modal__table-wrap th,.why-detail-modal__table-wrap td { white-space:nowrap; }
.why-detail-modal__table-wrap td:first-child { color:#1e3a5f; font-weight:600; }
.why-detail-modal__table-wrap td:nth-child(2) { background:#eaf0ff; }
.why-detail-modal__note { margin:16px 0 0; color:#7b8494; font-size:14px; line-height:22px; }
.why-detail-modal__note--bottom { margin-top:16px; }
.why-modal-enter-active,.why-modal-leave-active { transition:opacity .3s ease; }
.why-modal-enter-active .why-detail-modal__panel,.why-modal-leave-active .why-detail-modal__panel { transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .3s ease; }
.why-modal-enter-from,.why-modal-leave-to { opacity:0; }
.why-modal-enter-from .why-detail-modal__panel,.why-modal-leave-to .why-detail-modal__panel { opacity:0; transform:translateY(22px) scale(.98); }
.partners-section { height:791px; overflow:hidden; padding:96px 0; background:#f5f6f7; }
.partners-section .section-title { height:127px; padding-bottom:48px; }
.partners-marquee { --partner-step:3570px; --partner-fade:160px; position:relative; width:100%; max-width:1920px; height:472px; margin:0 auto; overflow:hidden; background:#f5f6f7; }
.partners-marquee::before,.partners-marquee::after { content:""; position:absolute; top:0; bottom:0; z-index:2; width:var(--partner-fade); pointer-events:none; }
.partners-marquee::before { left:0; background:linear-gradient(90deg,#f5f6f7 25%,rgba(245,246,247,0) 100%); }
.partners-marquee::after { right:0; background:linear-gradient(90deg,rgba(245,246,247,0) 0%,#f5f6f7 75%); }
.partners-marquee>div { position:absolute; top:0; left:calc(50% - 1722px); display:flex; width:max-content; height:472px; transform:translate3d(0,0,0); will-change:transform; animation:partner-loop 120s linear infinite; }
.partners-marquee:hover>div { animation-play-state:paused; }
.partners-marquee picture { display:block; width:var(--partner-step); height:472px; flex:none; }
.partners-marquee img { display:block; width:var(--partner-step); height:472px; flex:none; object-fit:cover; }
.home-cta { height:412px; padding:96px 0; background:linear-gradient(90deg,#dd6b20 0%,#3b82f6 100%); color:#fff; text-align:center; }
.home-cta>div { height:220px; }
.home-cta h2 { margin:0; font-size:40px; font-weight:600; line-height:40px; letter-spacing:0; }
.home-cta p { margin:16px 0 0; color:rgba(255,255,255,.8); font-size:16px; line-height:24px; }
.home-cta p { font-family:'SF Pro','PingFang SC',sans-serif; }
.home-cta>div>div { display:flex; height:100px; align-items:flex-start; justify-content:center; gap:16px; padding-top:48px; }
.home-cta button,.home-cta a { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:14px; padding:12px 24px; font-size:16px; font-weight:600; line-height:24px; cursor:pointer; }
.cta-white { height:52px; padding:16px 24px !important; line-height:16px !important; }
.cta-outline,.cta-dark { height:52px; }
.home-cta button img,.home-cta a img { width:20px; height:20px; }
.home-cta .cta-white img { width:20px; height:20px; }
.home-cta small span { display:flex; align-items:center; gap:6px; }
.home-cta small img { width:12px; height:12px; }
.cta-white { border:0; background:#fff; color:#dd6b20; box-shadow:0 4px 6px -4px rgba(0,0,0,.1); }
.cta-outline { border:2px solid #fff; color:#fff; }
.cta-dark { border:0; background:#1e3a5f; color:#fff; box-shadow:0 1px 3px rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1); }
.home-cta small { display:flex; justify-content:center; gap:16px; margin-top:24px; color:rgba(255,255,255,.58); font-size:12px; line-height:16px; }
@keyframes partner-loop { to { transform:translate3d(calc(0px - var(--partner-step)),0,0); } }
@media (max-width:1199px) and (min-width:701px) {
  .home-hero__image { object-fit:cover; }
  .home-process__body { grid-template-columns:minmax(180px,220px) minmax(0,1fr); }
  .home-process__stage::before { left:calc((100% - 100vw)/2 - 220px); }
  .home-flow__step { width:100%; min-width:0; padding-right:8px; padding-left:8px; }
  .home-flow__progress { left:12%; right:12%; }
  .why-overview__layout { grid-template-columns:minmax(180px,220px) minmax(0,1fr); gap:24px; }
  .why-overview__main,.why-overview__main .section-title,.why-overview__grid { width:100%; min-width:0; }
  .why-overview__grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .why-overview__grid article { width:auto; min-width:0; }
  .patient-story { height:auto; }
  .patient-story__card { height:auto; grid-template-columns:minmax(0,34fr) minmax(0,66fr); }
  .patient-story__image { height:100%; min-height:400px; }
  .patient-story__content { height:auto; min-height:400px; gap:24px; }
  .patient-story__bottom { flex-wrap:wrap; gap:16px; }
  .patient-story__bottom small { line-height:22px; }
  .patient-story__bottom a { flex:none; white-space:nowrap; }
  .data-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .data-grid article { width:auto; min-width:0; }
  .hospital-grid,.expert-grid,.team-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
  .hospital-grid a,.hospital-grid__image,.expert-grid article,.team-grid article { width:100%; min-width:0; }
  .hospital-grid__image { height:auto; aspect-ratio:1; }
  .strength-layout { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .strength-layout>div,.strength-layout__image { width:100%; min-width:0; }
}
@media (max-width:900px) {
  .home-page :deep(.hy-container) { width:calc(100% - 40px); }
  .home-process__body { grid-template-columns:160px minmax(0,1fr); gap:32px; }
  .home-process__stage::before { left:calc((100% - 100vw)/2 - 192px); }
  .home-hero__copy { max-width:70vw; }
  .home-hero h1 { width:auto; white-space:normal; }
  .why-overview,.patient-story,.care-section,.team-section,.data-section,.hospital-section,.expert-section,.strength-section,.partners-section,.home-cta { height:auto; }
  .why-overview__layout { height:auto; grid-template-columns:160px minmax(0,1fr); gap:32px; }
  .why-overview aside { height:650px; }
  .why-overview__main,.why-overview__main .section-title,.why-overview__grid { width:100%; height:auto; }
  .why-overview__grid { grid-template-columns:1fr; grid-template-rows:none; }
  .why-overview__grid article { width:100%; }
  .data-grid,.hospital-grid,.expert-grid,.team-grid,.strength-layout { width:100%; height:auto; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .data-grid article,.hospital-grid a,.hospital-grid img,.expert-grid article,.team-grid article,.strength-layout>div,.strength-layout__image { width:100%; }
  .expert-grid article:nth-child(n) { grid-column:auto; grid-row:auto; }
  .expert-grid article:nth-child(3) { order:1; }
  .expert-grid article:nth-child(4) { order:2; }
  .expert-grid article:nth-child(1) { order:3; }
  .expert-grid article:nth-child(2) { order:4; }
  .partners-marquee { width:100vw; }
  .data-grid { grid-template-columns:1fr; }
  .source-chart { width:100%; height:280px; aspect-ratio:auto; }
  .patient-story__content { padding:24px; }
  .patient-story blockquote { font-size:20px; line-height:30px; }
}
@media (max-width:700px) {
  .home-page { margin-top:-64px; }
  .home-page :deep(.hy-container) { width:calc(100% - 32px); }
  .home-hero,.home-hero__inner { height:680px; min-height:680px; }
  .home-hero__image { width:100%; height:100%; object-fit:cover; object-position:67% center; }
  .home-hero__wash { width:100%; background:linear-gradient(180deg,rgba(241,249,252,.2),rgba(241,249,252,.88) 47%,#f1f9fc 100%); }
  .home-hero__wash--assurance { display:block; background:linear-gradient(180deg,rgba(241,249,252,.08),rgba(241,249,252,.82) 43%,rgba(241,249,252,.92) 100%); }
  .home-hero__inner { align-items:flex-end; padding-bottom:82px; }
  .home-hero__copy { width:100%; max-width:none; height:auto; gap:22px; }
  .home-hero__eyebrow { height:30px; padding:0 12px; font-size:12px; line-height:30px; }
  .home-hero__heading { width:100%; height:auto; gap:12px; }
  .home-hero__copy--assurance { gap:22px; }
  .home-hero__bullets { gap:16px; }
  .home-hero__bullets>div { gap:6px; }
  .home-hero__bullets strong { font-size:16px; line-height:20px; }
  .home-hero__bullets p { font-size:13px; line-height:18px; }
  .home-hero h1 { width:100%; font-size:34px; line-height:1.2; white-space:normal; text-wrap:balance; }
  .home-hero p { font-size:14px; line-height:1.55; white-space:normal; }
  .home-hero__meta { height:auto; min-height:42px; white-space:normal; text-wrap:balance; }
  .home-hero__button-wrap { height:auto; padding-top:0; }
  .home-hero__button { width:auto; min-width:168px; height:48px; font-size:14px; }
  .home-hero__arrow { top:auto; bottom:18px; width:42px; height:42px; }
  .home-hero__arrow--left { right:auto!important; left:16px!important; }
  .home-hero__arrow--right { right:16px!important; left:auto!important; }
  .home-hero__controls { bottom:33px; }
  .home-hero__assistant { display:none; }
  .section-title { height:auto; }
  .home-process { gap:40px; padding:48px 0 40px; }
  .home-process__heading h2 { font-size:28px; line-height:34px; }
  .home-process__body { display:block; width:calc(100% - 32px)!important; }
  .home-process__stage::before { left:calc((100% - 100vw)/2); transform:none; }
  .home-process__rail { position:sticky; top:72px; display:flex; width:100%; height:96px; align-items:center; margin:0 0 16px; background:#f5f6f7; }
  .home-process__rail-line { top:0; bottom:0; left:47px; width:4px; border-width:2px; }
  .home-process__rail-node { width:72px; height:72px; margin-left:0; border-width:12px; border-radius:40px; }
  .home-process__rail-node strong { font-size:28px; line-height:72px; }
  .home-process__rail>span { margin-left:14px; font-size:22px; line-height:32px; }
  .home-process__stage,.home-process__stage:first-child,.home-process__stage:nth-child(2),.home-process__stage:nth-child(3),.home-process__stage:nth-child(4) { min-height:0; padding:48px 16px; }
  .home-process__stage + .home-process__stage { margin-top:0; }
  .home-process__content h3 { font-size:26px; line-height:34px; }
  .home-process__why-grid,.home-process__disease-grid { grid-template-columns:1fr; gap:16px; margin-top:32px; }
  .home-process__why-grid article { min-height:180px; }
  .home-process__actions { flex-wrap:wrap; margin-top:32px; }
  .home-process__faq { margin-top:28px; }
  .home-process__faq button { font-size:14px; line-height:22px; }
  .home-process__disease-grid a { min-height:150px; }
  .section-title h2 { font-size:28px; line-height:34px; }
  .section-title p { padding-top:10px; font-size:14px; line-height:22px; }
  .home-flow { height:auto; padding:64px 0; }
  .home-flow__heading { height:auto; }
  .home-flow__heading h2 { font-size:28px; line-height:34px; }
  .home-flow__heading p { padding-top:10px; font-size:14px; line-height:22px; }
  .home-flow__line { height:auto; grid-template-columns:1fr 1fr; gap:34px 8px; padding-top:40px; }
  .home-flow__progress { display:none; }
  .home-flow__step { width:100%; height:auto; padding:0 6px; }
  .home-flow__step>span { width:80px; height:80px; border-width:14px; font-size:23px; line-height:52px; }
  .home-flow__step strong { height:auto; padding-top:16px; font-size:20px; line-height:24px; }
  .home-flow__step small { height:auto; padding-top:6px; font-size:13px; line-height:20px; }
  .why-overview { padding:64px 0; }
  .why-overview__layout { display:block; height:auto; }
  .why-overview aside { position:static; height:auto; justify-content:center; margin:0 0 40px; }
  .why-overview aside::before { display:none; }
  .why-overview aside div { width:96px; height:96px; border-width:12px; }
  .why-overview aside strong { font-size:30px; line-height:72px; }
  .why-overview aside h3 { margin-left:14px; font-size:22px; }
  .why-overview__main,.why-overview__main .section-title,.why-overview__grid { width:100%; height:auto; }
  .why-overview__main .section-title { text-align:center; }
  .why-overview__grid { grid-template-columns:1fr; grid-template-rows:none; padding-top:40px; }
  .why-overview__grid article { width:100%; height:230px; }
  .patient-story { padding:64px 0; }
  .patient-story__card { height:auto; grid-template-columns:1fr; padding-top:40px; }
  .patient-story__image { width:100%; height:auto; aspect-ratio:4 / 3; max-height:240px; }
  .patient-story__pause { opacity:1; }
  .patient-story__content { height:auto; min-height:0; padding:20px; gap:24px; }
  .patient-story__bottom { flex-wrap:wrap; gap:16px; }
  .patient-story__bottom small { line-height:22px; }
  .patient-story__bottom a { flex:none; height:44px; padding:12px 20px; line-height:20px; white-space:nowrap; }
  .patient-story blockquote { margin-top:20px; font-size:18px; line-height:28px; }
  .patient-story__details { padding-top:20px; }
  .patient-story__details p { font-size:14px; line-height:22px; }
  .care-section,.team-section,.data-section,.hospital-section,.expert-section,.strength-section,.partners-section { padding:64px 0; }
  .care-grid,.team-grid,.data-grid,.hospital-grid,.expert-grid,.strength-layout { width:100%; height:auto; grid-template-columns:1fr; gap:24px; padding-top:40px; }
  .care-grid a { height:210px; }
  .team-grid article { width:100%; height:250px; }
  .data-grid article { width:100%; height:auto; padding:32px 16px; }
  .cost-chart i { width:6px; }
  .cost-chart>div:not(.cost-axis)>span { font-size:7px; }
  .hospital-grid a { width:100%; height:auto; }
  .hospital-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px 16px; padding-top:32px; }
  .hospital-grid__image { width:100%; height:auto; aspect-ratio:1; border-radius:16px; }
  .hospital-grid img { width:100%; height:auto; aspect-ratio:1; }
  .hospital-grid h3,.hospital-grid p { margin-left:0; }
  .hospital-grid h3 { min-height:48px; margin-top:12px; font-size:16px; line-height:24px; }
  .hospital-grid p { margin-top:6px; font-size:13px; line-height:20px; }
  .expert-section .section-title { height:auto; }
  .expert-tabs { height:auto; flex-wrap:wrap; padding-top:30px; }
  .expert-tabs button { height:40px; font-size:14px; }
  .expert-grid { margin-top:0; }
  .expert-grid article { width:100%; height:266px; }
  .why-detail-modal { padding:16px; }
  .why-detail-modal__panel { width:100%; border-radius:20px; padding:24px; }
  .why-detail-modal__header { gap:12px; margin-bottom:24px; }
  .why-detail-modal__header h2 { font-size:28px; line-height:36px; }
  .why-detail-modal__header p { font-size:15px; line-height:23px; }
  .why-detail-modal__body,.why-detail-modal__body--cards-2x2,.why-detail-modal__body--table-cards,.why-detail-modal__body--wide-cards,.why-detail-modal__body--cards-3 { grid-template-columns:1fr; gap:16px; }
  .why-detail-modal__body--wide-cards article:first-child { grid-column:auto; }
  .why-detail-modal__body h3 { white-space:normal; }
  .why-detail-modal__body article,.why-detail-modal__body--cards-2x2 article,.why-detail-modal__body--table-cards article,.why-detail-modal__body--wide-cards article:first-child,.why-detail-modal__body--wide-cards article:not(:first-child),.why-detail-modal__body--cards-3 article { min-height:260px; padding:24px; }
  .why-detail-modal__table-wrap { overflow:auto; }
  .why-detail-modal__table-wrap table { min-width:620px; font-size:14px; }
  .why-detail-modal__table-wrap th,.why-detail-modal__table-wrap td { white-space:normal; }
  .partners-section .section-title { height:auto; padding-bottom:0; }
  .partners-marquee { --partner-step:1785px; --partner-fade:40px; width:100%; height:236px; aspect-ratio:auto; margin:40px 0 0; }
  .partners-marquee>div { left:0; }
  .partners-marquee>div { height:auto; }
  .partners-marquee picture,.partners-marquee img { width:var(--partner-step); max-width:none; height:236px; aspect-ratio:3570 / 472; }
  .home-cta { padding:64px 0; }
  .home-cta>div { height:auto; }
  .home-cta h2 { font-size:30px; line-height:38px; }
  .home-cta p { margin:14px 0 28px; font-size:14px; }
  .home-cta>div>div { height:auto; flex-direction:column; }
  .home-cta button,.home-cta a { width:100%; height:48px; }
  .home-cta small { flex-wrap:wrap; margin-top:20px; }
}
@media (max-width:900px) {
  .strength-section { height:auto; min-height:0; padding:0; }
  .strength-sticky { position:static; height:auto; padding:64px 0; overflow:visible; }
  .strength-section .section-title { height:auto; }
  .strength-layout { display:block; height:auto; padding-top:32px; }
  .strength-copy-window,.strength-copy-track { width:100%; height:auto; overflow:visible; }
  .strength-copy-track { transform:none !important; }
  .strength-copy-state { width:100%; height:auto; min-height:0; padding:24px 0 12px; }
  .strength-copy-state h3 { font-size:26px; line-height:34px; }
  .strength-copy-state p { width:100%; padding-top:16px; font-size:15px; line-height:24px; }
  .strength-copy-state__mobile-image { display:block; width:100%; height:auto; aspect-ratio:596/409; object-fit:cover; border-radius:16px; }
  .strength-artwork { display:none; }
}
@media (prefers-reduced-motion:reduce) {
  .patient-story__content,.patient-story__image>img,.patient-story__pause { transition:none; }
  .home-hero__image,
  .home-hero__copy,
  .hero-image-enter-active,
  .hero-image-leave-active,
  .hero-copy-enter-active,
  .hero-copy-leave-active,
  .home-hero__button,
  .home-hero__arrow,
  .home-hero__controls button,
  .home-flow__line a>span,
  .home-process__rail-node,
  .home-process__why-grid article,
  .home-process__primary,
  .home-process__secondary,
  .home-process__disease-grid a,
  .home-process__faq button>span:nth-child(2),
  .why-overview__grid article,
  .care-grid a,
  .team-grid article,
  .hospital-grid a,
  .expert-tabs button,
  .home-cta button,
  .home-cta a,
  .partners-marquee>div,
  .strength-layout__image,
  .strength-copy-track {
    transition: none;
    animation: none;
  }
  .strength-copy-enter-active,.strength-copy-leave-active,.strength-image-enter-active,.strength-image-leave-active,
  .why-modal-enter-active,.why-modal-leave-active,.why-modal-enter-active .why-detail-modal__panel,.why-modal-leave-active .why-detail-modal__panel,
  .why-overview__more { transition:none; }
}
</style>
