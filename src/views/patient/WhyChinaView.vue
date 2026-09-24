<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, Atom, Bone, BrainCircuit, CheckCircle2, ChevronDown, Dna, FileText, HeartPulse, MessageCircle, Microscope, ScanLine, Stethoscope } from 'lucide-vue-next'

const medicalCapabilities = [
  { title:'肿瘤MDT综合诊疗', copy:'疑难重症多学科联合方案，临床医生经验与设备协同', icon:Atom, detail:'新马轻症处理成熟，但复发难治、晚期肿瘤方案薄弱；日本方案保守、欧美费用极高。中国拥有全球最大肿瘤临床病例库，常规MDT多学科会诊，靶向、免疫、介入、手术综合方案更灵活、个体化更强。' },
  { title:'CAR–T细胞免疫治疗', copy:'多国临床经验，价格与等待时间具竞争力', icon:Dna, detail:'覆盖血液肿瘤评估、细胞制备、回输与随访全流程，帮助国际患者缩短等待周期并获得连续管理。' },
  { title:'质子重离子精准放疗', copy:'多中心规模化运营，实体肿瘤精准治疗', icon:Microscope, detail:'依托国内成熟的质子重离子中心，为适合的实体肿瘤患者制定精确照射与器官保护方案。' },
  { title:'高难度心脑外科手术', copy:'复杂脑肿瘤、心脏瓣膜、神经外科经验丰富', icon:BrainCircuit, detail:'连接高年手术量中心与多学科专家团队，为复杂心脑血管和神经外科疾病提供联合评估。' },
  { title:'机器人微创外科体系', copy:'达芬奇机器人全覆盖，多科室复杂微创能力', icon:ScanLine, detail:'将机器人、腔镜与围术期快速康复体系结合，减少复杂手术创伤并提升恢复效率。' },
  { title:'新药临床与靶向免疫治疗', copy:'国产与进口新药同步可及，方案迭代快', icon:Stethoscope, detail:'根据病理与基因检测结果匹配靶向、免疫方案及适合的临床研究机会。' },
  { title:'器官移植重症修复', copy:'规范化移植体系、大量长期管理经验', icon:HeartPulse, detail:'由移植、重症、感染与康复团队共同评估，覆盖围术期治疗和长期随访管理。' },
  { title:'罕见病疑难病联合诊疗', copy:'全国专家协作网络，专业诊疗路径', icon:Bone, detail:'通过全国专家协作网络整合检查与既往病史，为复杂和罕见疾病形成清晰诊疗路径。' },
]
const activeCapability = ref(0)
const comparison = [
  { label:'肿瘤手术', china:25, usa:120, uk:75, germany:55, singapore:50, japan:60 },
  { label:'心血管手术', china:30, usa:150, uk:80, germany:65, singapore:50, japan:75 },
  { label:'慢性病年管理', china:5, usa:40, uk:30, germany:20, singapore:15, japan:25 },
  { label:'质子治疗', china:50, usa:200, uk:100, germany:85, singapore:110, japan:100 },
  { label:'CAR-T', china:65, usa:500, uk:330, germany:280, singapore:280, japan:330 },
  { label:'PD-1年费用', china:10, usa:180, uk:125, germany:100, singapore:80, japan:130 },
  { label:'化疗(6周期)', china:15, usa:85, uk:55, germany:45, singapore:35, japan:50 },
  { label:'牙科-种植牙', china:2, usa:8, uk:6, germany:5, singapore:4, japan:7 },
  { label:'眼科-白内障', china:2, usa:9, uk:7, germany:6, singapore:5, japan:8 },
]
const waits = [
  { value:'30–180天', label:'欧美平均就诊等待' },
  { value:'21–90天', label:'日本/新加坡公立医院' },
  { value:'14–60天', label:'马来西亚公立体系' },
  { value:'7–13天', label:'寰宇云医·来华中国就医', highlight:true },
]
const nationalStats = [
  { value:'2000+', label:'全国合作三甲医院' },
  { value:'137家', label:'JCI国际认证医疗机构' },
  { value:'128万+', label:'国际患者年度诊疗服务' },
  { value:'73.6%', label:'重大疾病治疗相对费用优势' },
]
const stories = [
  { quote:'在新加坡排期3个月，来华11天完成全套评估与治疗方案制定。', meta:'— 新加坡患者· 肿瘤综合治疗', image:'/images/figma/why-story-singapore.png' },
  { quote:'对比本地报价，来华完成种植修复，节省大量费用，医生沟通顺畅。', meta:'— 马来西亚患者· All-on6半口种植', image:'/images/figma/why-story-malaysia.png' },
  { quote:'欧美等待半年，国内绿色通道快速安排手术，术后恢复良好。', meta:'— 欧美患者· 心外科手术', image:'/images/figma/why-story-europe.png' },
]
function openConsultation(){ window.dispatchEvent(new CustomEvent('open-consultation')) }
</script>

<template>
  <div class="why-page">
    <section class="why-hero"><div class="why-hero__visual" /><div class="hy-container" data-reveal><h1><span>为什么全球患者优先选择</span><br /><span>来华就医？</span></h1><p>对比新马日与欧美，中国重症医疗兼具技术、时效与成本优势</p><div><button type="button" @click="openConsultation"><MessageCircle />免费咨询</button><RouterLink to="/report"><FileText />AI初诊 3分钟生成就医评估报告</RouterLink></div></div></section>

    <section class="capability-section"><div class="hy-container capability-layout"><aside data-reveal><h2>中国严肃医疗｜多国对比技术优势</h2><p>在肿瘤、心脑外科、细胞治疗、复杂微创手术等重症领域，中国医院临床体量、手术复杂度、病例积累，全面优于东南亚及部分欧美体系。</p></aside><div class="capability-grid"><article v-for="(item,index) in medicalCapabilities" :key="item.title" data-reveal :class="{ open:index===activeCapability }" :style="{ '--reveal-delay':`${(index%2)*55}ms` }" role="button" tabindex="0" :aria-expanded="index===activeCapability" @click="activeCapability=index" @keydown.enter.prevent="activeCapability=index" @keydown.space.prevent="activeCapability=index"><component :is="item.icon" /><h3>{{ item.title }}</h3><p>{{ item.copy }}</p><span v-if="index!==activeCapability">查看详情</span><small v-if="index===activeCapability">{{ item.detail }}</small><ChevronDown class="capability-chevron" :class="{ rotated:index===activeCapability }" /></article></div></div></section>

    <section class="cost-section"><div class="hy-container"><header class="section-title" data-reveal><h2>同等医疗质量，中国就医成本全球最优</h2><p>对标新、马、日、欧美，同质医疗效果下，中国整体治疗费用大幅更低</p></header><div class="comparison-chart" data-reveal><div class="comparison-axis"><span>$600K</span><span>$450K</span><span>$300K</span><span>$150K</span><span>0</span></div><div v-for="item in comparison" :key="item.label"><div class="bars"><i class="usa" :style="{ height:`${item.usa * .56}px` }"/><i class="uk" :style="{ height:`${item.uk * .56}px` }"/><i class="germany" :style="{ height:`${item.germany * .56}px` }"/><i class="china" :style="{ height:`${item.china * .56}px` }"/><i class="singapore" :style="{ height:`${item.singapore * .56}px` }"/><i class="japan" :style="{ height:`${item.japan * .56}px` }"/></div><span>{{ item.label }}</span></div></div><div class="legend"><span><i class="usa" />美国</span><span><i class="uk" />英国</span><span><i class="germany" />德国</span><span><i class="china" />中国</span><span><i class="singapore" />新加坡</span><span><i class="japan" />日本</span></div><div class="saving-tags"><span>心脏搭桥节省69%</span><span>CAR–T细胞免疫治疗节省55%</span><span>PET–CT全身影像筛查节省85%</span><span>质子重离子肿瘤放疗节省53%</span><span>膝关节置换手术</span></div><div class="cost-actions"><RouterLink to="/cost">查看更多病种费用对比详情<ArrowRight /></RouterLink><RouterLink to="/report">提交病历，获取AI个性化精准预算与来华方案<ArrowRight /></RouterLink></div><small class="disclaimer">中国是唯一同时具备：顶级重症技术、超快就诊时效、亲民治疗成本的跨境医疗目的地。</small></div></section>

    <section class="wait-section"><div class="hy-container"><header class="section-title" data-reveal><h2>告别超长排队｜中国就医时效碾压全球</h2><p>欧美、日本、新加坡重症排队数月起，中国实现极速接诊，不延误黄金治疗期</p></header><div class="wait-grid"><article v-for="item in waits" :key="item.value" :class="{ highlight:item.highlight }" data-reveal><div v-if="item.highlight" class="wait-value"><span>最快</span><strong>{{ item.value }}</strong></div><strong v-else>{{ item.value }}</strong><p>{{ item.label }}</p></article></div></div></section>

    <section class="national-section"><div class="national-section__image" /><div class="hy-container" data-reveal><header><h2>国家级医疗实力 · 权威机构背书</h2><p>依托国内庞大三甲医疗体系，众多国际认证医疗机构，已服务全球百万国际患者</p></header><div class="national-grid"><div v-for="item in nationalStats" :key="item.value"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div><RouterLink to="/cases">查看更多各国患者完整数据<ArrowRight /></RouterLink></div></section>

    <section class="stories-section"><div class="hy-container"><header class="section-title" data-reveal><h2>新/马/日/欧美患者真实就医反馈</h2><p>来自各国患者真实就诊经历，客观记录来华治疗全过程</p></header><div class="story-grid"><article v-for="item in stories" :key="item.quote" data-reveal><img :src="item.image" alt="国际患者" /><blockquote>{{ item.quote }}</blockquote><small>{{ item.meta }}</small></article></div></div></section>

    <section class="why-cta"><div class="hy-container" data-reveal><h2>想知道你的病情是否适合来华治疗？</h2><p>提交病历，AI自动生成专属来华就医可行性报告</p><div><RouterLink to="/report">立即提交病历<ArrowRight /></RouterLink><button type="button" @click="openConsultation">免费一对一咨询<ArrowRight /></button></div><small><span><CheckCircle2 />适配科室</span><span><CheckCircle2 />推荐医院</span><span><CheckCircle2 />治疗方案参考</span><span><CheckCircle2 />预估预算</span><span><CheckCircle2 />就诊周期规划</span></small></div></section>
  </div>
</template>

<style scoped>
.why-page { margin-top:-64px; color:#1e3a5f; }
.why-page :deep(.hy-container) { width:min(1216px,calc(100% - 48px)); }
.why-hero { position:relative; height:757px; overflow:hidden; background:#f8fbfd; }
.why-hero__visual { position:absolute; inset:0; background:url('/images/figma/why-china-hero-background.png') center/cover no-repeat; }
.why-hero>.hy-container { position:relative; z-index:1; display:flex; height:757px; flex-direction:column; align-items:center; padding-top:180px; text-align:center; }
.why-hero h1 { margin:0; color:#143162; font-size:64px; font-weight:600; line-height:96px; }
.why-hero h1 span:last-child { color:#1e3a5f; }
.why-hero p { margin:32px 0 0; color:#5b606a; font-size:20px; line-height:30px; }
.why-hero>div>div { display:flex; gap:24px; margin-top:48px; }
.why-hero button,.why-hero a { display:inline-flex; height:64px; align-items:center; justify-content:center; gap:8px; border:0; border-radius:14px; padding:16px 24px; color:#fff; font-size:20px; font-weight:600; line-height:30px; white-space:nowrap; box-shadow:0 6px 14px rgba(26,61,97,.14); cursor:pointer; transition:transform .25s ease,box-shadow .25s ease,background .25s ease; }
.why-hero button { width:160px; background:linear-gradient(102deg,#dd6b20,#3b82f6); }
.why-hero a { width:354px; background:#1e3a5f; }
.why-hero button:hover,.why-hero a:hover { transform:translateY(-2px); background:#dd6b20; box-shadow:0 12px 28px rgba(221,107,32,.22); }
.why-hero svg { width:24px; height:24px; }
.section-title { height:80px; text-align:center; }
.section-title h2 { margin:0; color:#1e3a5f; font-size:40px; font-weight:600; line-height:40px; }
.section-title p { margin:0; padding-top:16px; color:#6b7280; font-size:16px; line-height:24px; }
.capability-section { height:1416px; padding:96px 0; background:#fff; }
.capability-layout { display:grid; height:1224px; grid-template-columns:389.33px 802.67px; column-gap:24px; }
.capability-layout aside { position:sticky; top:96px; align-self:start; padding-top:25px; }
.capability-layout aside h2 { margin:0; color:#1e3a5f; font-size:40px; font-weight:600; line-height:60px; }
.capability-layout aside p { margin:24px 0 0; color:#6b7280; font-size:16px; line-height:28px; }
.capability-grid { display:grid; width:802.67px; height:1224px; grid-template-columns:repeat(2,389.33px); grid-auto-rows:min-content; align-content:start; column-gap:24px; row-gap:24px; }
.capability-grid article { position:relative; display:flex; width:389.33px; height:254px; flex-direction:column; align-items:flex-start; align-self:start; border-radius:24px; padding:24px; background:#f5f6f7; cursor:pointer; transition:height .52s cubic-bezier(.22,1,.36,1),transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }
.capability-grid article.open { height:390px; }
.capability-grid article:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(20,49,98,.08); }
.capability-grid svg { width:32px; height:32px; color:#3b82f6; }
.capability-grid h3 { margin:auto 0 12px; color:#1e3a5f; font-size:22px; line-height:28px; }
.capability-grid article.open h3 { margin:82px 0 12px; }
.capability-grid p { margin:0; color:#6b7280; font-size:14px; line-height:22px; }
.capability-grid span { margin-top:12px; color:#9ca3af; font-size:13px; line-height:18px; }
.capability-grid small { margin-top:14px; border-top:1px solid #dde3e8; padding-top:14px; color:#65778a; font-size:14px; line-height:24px; }
.capability-grid .capability-chevron { position:absolute; right:24px; bottom:24px; width:14px; height:14px; color:#a0acb8; transition:transform .3s ease,color .3s ease; }.capability-grid .capability-chevron.rotated { color:#3b82f6; transform:rotate(180deg); }
.cost-section { height:957px; overflow:hidden; padding:96px 0; background:#f5f6f7; }
.comparison-chart { position:relative; display:grid; height:360px; grid-template-columns:repeat(9,1fr); gap:12px; align-items:end; margin-top:48px; border-bottom:1px solid #9ca3af; padding-left:70px; background:repeating-linear-gradient(to bottom,#e1e5e9 0,#e1e5e9 1px,transparent 1px,transparent 85px); }
.comparison-chart>div:not(.comparison-axis) { display:flex; height:360px; flex-direction:column; align-items:center; justify-content:flex-end; }
.bars { display:flex; height:320px; align-items:flex-end; gap:3px; }
.bars i { display:block; width:10px; min-height:3px; border-radius:3px 3px 0 0; transform-origin:bottom; transition:transform .8s cubic-bezier(.22,1,.36,1); }
.comparison-chart:not(.is-visible) .bars i { transform:scaleY(0); }
.comparison-chart.is-visible .bars i { transform:scaleY(1); }
.comparison-chart .bars i:nth-child(2) { transition-delay:70ms; }.comparison-chart .bars i:nth-child(3) { transition-delay:140ms; }.comparison-chart .bars i:nth-child(4) { transition-delay:210ms; }.comparison-chart .bars i:nth-child(5) { transition-delay:280ms; }.comparison-chart .bars i:nth-child(6) { transition-delay:350ms; }
.comparison-chart>div:not(.comparison-axis)>span { height:24px; margin-top:10px; color:#657180; font-size:12px; line-height:14px; white-space:nowrap; }
.comparison-axis { position:absolute; inset:0 auto 0 0; display:flex; width:68px; flex-direction:column; justify-content:space-between; padding-bottom:20px; color:#657180; font-size:12px; text-align:right; }
.usa { background:#9ca3af; }.uk { background:#64748b; }.germany { background:#475569; }.china { background:#dd6b20; }.singapore { background:#1d4ed8; }.japan { background:#3b82f6; }
.legend { display:flex; height:24px; align-items:center; justify-content:center; gap:18px; margin-top:16px; color:#657180; font-size:12px; }
.legend span { display:flex; align-items:center; gap:5px; }.legend i { width:12px; height:12px; }
.saving-tags { display:flex; width:100vw; height:48px; justify-content:center; gap:24px; margin-top:48px; margin-left:calc(50% - 50vw); overflow:hidden; }
.saving-tags span { display:flex; min-width:260px; flex:none; align-items:center; justify-content:center; border-radius:16px; padding:0 24px; background:#fff; color:#48627d; font-size:14px; white-space:nowrap; }
.cost-actions { display:flex; height:52px; justify-content:center; gap:16px; margin-top:48px; }
.cost-actions a { display:flex; height:52px; align-items:center; gap:10px; border-radius:14px; padding:0 24px; background:#dd6b20; color:#fff; font-size:14px; font-weight:700; white-space:nowrap; box-shadow:0 4px 8px rgba(20,49,98,.12); transition:transform .25s ease,background .25s ease; }
.cost-actions a:first-child { width:264px; justify-content:center; }.cost-actions a:last-child { width:390px; justify-content:center; background:#1e3a5f; }.cost-actions a:hover { transform:translateY(-2px); background:#dd6b20; }.cost-actions svg { width:16px; }
.disclaimer { display:block; margin-top:16px; color:#9ca3af; font-size:12px; line-height:20px; text-align:center; }
.wait-section { height:552px; padding:96px 0; background:#fff; }
.wait-grid { display:grid; height:232px; grid-template-columns:repeat(4,1fr); gap:24px; margin-top:48px; }
.wait-grid article { position:relative; display:flex; height:232px; flex-direction:column; align-items:center; justify-content:center; gap:12px; border-radius:14px; padding:48px 24px; background:#f5f6f7; }
.wait-grid strong { color:#1e3a5f; font-size:40px; font-weight:600; line-height:40px; }
.wait-grid p { margin:0; color:#6b7280; font-size:16px; line-height:16px; }
.wait-grid article.highlight { gap:16px; background:rgba(221,107,32,.1); color:#dd6b20; }.wait-grid article.highlight strong { color:#dd6b20; }
.wait-grid article.highlight .wait-value { display:flex; align-items:center; gap:8px; }
.wait-grid article.highlight>div>span { color:#1e3a5f; font-size:16px; font-weight:600; line-height:40px; }
.national-section { position:relative; height:512px; overflow:hidden; padding:88px 0; background:#153d6a; color:#fff; }
.national-section__image { position:absolute; inset:0; background:url('/images/figma/why-china-national-background.png') center/cover no-repeat; }
.national-section>.hy-container { position:relative; z-index:1; text-align:center; }
.national-section h2 { margin:0; font-size:40px; font-weight:700; line-height:40px; }.national-section header p { margin:16px 0 0; color:rgba(255,255,255,.7); font-size:16px; line-height:24px; }
.national-grid { display:grid; height:96px; grid-template-columns:repeat(4,1fr); margin:42px 0 42px; }
.national-grid div { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; border-left:1px solid rgba(255,255,255,.16); }.national-grid div:first-child { border-left:0; }
.national-grid strong { color:#52e8ff; font-size:56px; font-weight:700; line-height:56px; }.national-grid span { color:#fff; font-size:14px; line-height:20px; }
.national-section a { display:inline-flex; height:52px; align-items:center; gap:10px; border-radius:14px; padding:0 24px; background:#dd6b20; color:#fff; font-size:14px; font-weight:700; transition:transform .25s ease; }.national-section a:hover { transform:translateY(-2px); }.national-section a svg { width:18px; }
.stories-section { height:593px; padding:96px 0; background:#fff; }
.story-grid { display:grid; height:272px; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:48px; }
.story-grid article { display:flex; height:272px; flex-direction:column; align-items:flex-start; border-radius:24px; padding:24px; background:#f5f6f7; transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }.story-grid article:hover { transform:translateY(-5px); box-shadow:0 18px 40px rgba(20,49,98,.08); }
.story-grid img { width:60px; height:60px; border-radius:16px; object-fit:cover; }
.story-grid blockquote { margin:auto 0 12px; color:#1e3a5f; font-size:16px; font-weight:500; line-height:24px; }.story-grid small { color:#9ca3af; font-family:"DM Sans",sans-serif; font-size:14px; line-height:21px; }
.why-cta { height:412px; padding:96px 0; background:#f5f6f7; text-align:center; }
.why-cta>div { height:220px; }.why-cta h2 { margin:0; color:#1e3a5f; font-size:40px; font-weight:600; line-height:40px; }.why-cta p { margin:16px 0 0; color:#6b7280; font-size:16px; line-height:24px; }
.why-cta>div>div { display:flex; height:52px; align-items:flex-start; justify-content:center; gap:16px; padding-top:48px; }.why-cta button,.why-cta a { display:flex; height:52px; align-items:center; justify-content:center; gap:8px; border:0; border-radius:14px; padding:16px 24px; background:#dd6b20; color:#fff; font-size:16px; font-weight:600; line-height:16px; cursor:pointer; transition:transform .25s ease,background .25s ease,box-shadow .25s ease; }.why-cta button { background:#1e3a5f; }.why-cta button:hover,.why-cta a:hover { transform:translateY(-2px); background:#dd6b20; box-shadow:0 10px 24px rgba(221,107,32,.2); }.why-cta>div>div svg { width:20px; height:20px; }
.why-cta small { display:flex; justify-content:center; gap:18px; margin-top:24px; color:#a2acb8; font-size:12px; line-height:18px; }.why-cta small span { display:flex; align-items:center; gap:5px; }.why-cta small svg { width:14px; height:14px; }
@media (max-width:900px) {
  .why-page :deep(.hy-container) { width:calc(100% - 40px); }
  .capability-section,.cost-section,.wait-section,.national-section,.stories-section,.why-cta { height:auto; }
  .capability-layout { height:auto; grid-template-columns:230px minmax(0,1fr); gap:32px; }
  .capability-grid { width:100%; height:auto; grid-template-columns:1fr 1fr; grid-template-rows:none; }
  .capability-grid article,.capability-grid article.open { width:100%; height:280px; }
  .comparison-chart { gap:5px; padding-left:50px; }.bars { gap:2px; }.bars i { width:6px; }
  .comparison-chart>div:not(.comparison-axis)>span { font-size:9px; }
}
@media (max-width:700px) {
  .why-page :deep(.hy-container) { width:calc(100% - 32px); }
  .why-hero { height:680px; }.why-hero__visual { background-position:64% center; }.why-hero>.hy-container { height:680px; justify-content:flex-end; padding:0 0 84px; }
  .why-hero h1 { font-size:36px; line-height:1.35; }.why-hero p { margin-top:18px; font-size:14px; line-height:22px; }
  .why-hero>div>div { width:100%; flex-direction:column; gap:12px; margin-top:26px; }.why-hero button,.why-hero a { width:100%; height:52px; font-size:14px; }
  .section-title { height:auto; }.section-title h2 { font-size:28px; line-height:36px; }.section-title p { padding-top:10px; font-size:14px; line-height:22px; }
  .capability-section,.cost-section,.wait-section,.national-section,.stories-section,.why-cta { padding:64px 0; }
  .capability-layout { display:block; }.capability-layout aside { position:static; padding:0 0 40px; text-align:center; }.capability-layout aside h2 { font-size:30px; line-height:1.4; }.capability-layout aside p { font-size:14px; line-height:24px; }
  .capability-grid { display:grid; grid-template-columns:1fr; gap:16px; }.capability-grid article,.capability-grid article.open { height:auto; min-height:250px; }
  .comparison-chart { width:850px; grid-template-columns:repeat(9,1fr); }.cost-section>.hy-container { overflow:hidden; }.legend { flex-wrap:wrap; height:auto; }
  .saving-tags { justify-content:flex-start; padding-left:16px; overflow-x:auto; }.cost-actions,.why-cta>div>div { height:auto; flex-direction:column; }.cost-actions a,.why-cta button,.why-cta a { justify-content:center; }
  .wait-grid,.story-grid { height:auto; grid-template-columns:1fr; }.wait-grid article { height:190px; }.wait-grid article.highlight>span { top:66px; left:62px; }
  .national-section { min-height:620px; }.national-grid { height:auto; grid-template-columns:1fr 1fr; gap:28px; }.national-grid div { border:0; }.national-grid strong { font-size:40px; }
  .story-grid article { height:250px; }.why-cta>div { height:auto; }.why-cta h2 { font-size:30px; line-height:38px; }.why-cta small { flex-wrap:wrap; }
}
@media (prefers-reduced-motion:reduce) {
  .capability-grid article,.capability-grid .capability-chevron,.bars i { transition:none; }
  .comparison-chart:not(.is-visible) .bars i { transform:none; }
}
</style>
