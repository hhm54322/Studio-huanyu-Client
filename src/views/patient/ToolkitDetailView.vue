<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentArticleCanvas from '@/components/common/ContentArticleCanvas.vue'
import { toolkitArticles } from '@/data/contentFigmaSource'
const route = useRoute()
const router = useRouter()
const article = computed(() => typeof route.query.article === 'string' && toolkitArticles[route.query.article] ? route.query.article : undefined)
watch(() => route.query.article, value => {
  // Unknown article keys must not silently display an unrelated article.
  if (value && (typeof value !== 'string' || !toolkitArticles[value])) void router.replace({ path: route.path })
}, { immediate: true })
watch(article, key => { document.title = `${key ? toolkitArticles[key]!.title : '病历翻译与整理工具'} | 寰宇云医` }, { immediate: true })
const viewportWidth = ref(typeof window === 'undefined' ? 1440 : window.innerWidth)
watch([article, viewportWidth], ([key, width]) => {
  // New content is desktop-only until the user confirms the mobile design.
  // Never show the translation article under another article's URL.
  if (key && width <= 900) void router.replace('/trust')
}, { immediate: true })
const updateViewport = () => { viewportWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', updateViewport, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('resize', updateViewport))
const sections = [
  { label: '来华就医可行性评估', id: 'assessment' },
  { label: '签证申请清单', id: 'visa' },
  { label: '免签国家清单', id: 'visa-free' },
  { label: '药品入境规定', id: 'medication' },
  { label: '家属陪同攻略', id: 'companions' },
  { label: '穆斯林患者实操手册', id: 'muslim' },
  { label: '就医步骤与就诊流程', id: 'steps' },
  { label: '国际报告与回国随访', id: 'follow-up' },
]
const topLines = [
  { y: 0, text: '很多全球海外患者准备来华就医时，都会遇到同一个难题：', strong: true },
  { y: 36, text: '外文病历杂乱、各国格式不统一、影像资料零散无序、专业术语不通。' },
  { y: 72, text: '导致国内专家无法快速读懂、难以精准判断病情，直接拉长评估周期、耽误就诊时机。' },
  { y: 108, text: '我们面向全球所有国家海外患者，提供一站式病历翻译 + 结构化整理服务。' },
  { y: 144, text: '让你的海外医疗资料，直接达到国内三甲医院专家审阅标准。' },
  { y: 183.12, text: '一、我们可以为你整理、翻译', heading: true, id: 'assessment' },
  { y: 220, text: '全覆盖全球所有病种、所有海外医疗资料类型，无需患者筛选、无需自行整理：', lead: true },
  { y: 260, text: '1. 文字诊断类资料', strong: true },
  { y: 284, text: '出院小结、专科诊断报告、病理活检报告、既往治疗记录、复查小结、门诊病历。' },
  { y: 320, text: '2. 影像检查类资料', strong: true },
  { y: 356, text: 'CT、MRI、PET-CT、X 光、B 超影像结论单及原始影像文件整理归档。' },
  { y: 392, text: '3. 化验指标类资料', strong: true },
  { y: 428, text: '血常规、肿瘤标志物、肝肾功能、专项筛查、全套化验数据整理对标。' },
  { y: 464, text: '4. 用药治疗类资料', strong: true },
  { y: 500, text: '靶向药、化疗药、止痛药、慢病长期用药记录、既往手术 / 放疗 / 化疗史整理。' },
  { y: 536, text: '所有资料统一医疗级中文翻译、标准化排版、结构化归档，完全适配国内诊疗体系。' },
  { y: 575.12, text: '二、标准化整理后病历样板（全球）', heading: true },
  { y: 612, text: '为了让你直观了解整理后的效果，我们采用国内专家统一审阅模板，所有海外国家患者全部通用：', lead: true },
]
const bottomLines = [
  { y: 0, text: '整理后标准样板结构：', strong: true },
  { y: 36, text: '1. 患者基础信息（全程脱敏）' },
  { y: 72, text: '2. 完整病情发展时间线（初诊 — 治疗 — 最新进展）' },
  { y: 108, text: '3. 历次影像检查结果结构化汇总对比' },
  { y: 144, text: '4. 全部化验指标规整表格呈现' },
  { y: 180, text: '5. 完整既往治疗史梳理（手术、药物、放疗、靶向）' },
  { y: 216, text: '6. 当前症状、身体状态、持续用药总结' },
  { y: 252, text: '7. 国内专家可读的标准化中文病情总结' },
  { y: 288, text: '整理价值：', strong: true },
  { y: 324, text: '• 剔除海外杂乱无效信息，只保留核心诊疗依据' },
  { y: 360, text: '• 病灶尺寸、分期、关键指标全部高亮突出' },
  { y: 396, text: '• 病情逻辑清晰、时间线完整' },
  { y: 432, text: '• 支持国内专家快速阅片、快速评估、直接定制方案' },
  { y: 468, text: '患者上传零散外文资料，我们统一梳理为规整、专业、可直接送审的中文病历档案' },
  { y: 507.12, text: '三、全球患者病历数据・隐私安全郑重承诺', heading: true },
  { y: 544, text: '病历与影像属于患者最高级隐私，我们对所有国家海外患者，公开做出四重合规保密承诺：', lead: true },
  { y: 584, text: '1. 全程信息脱敏', strong: true },
  { y: 620, text: '所有证件信息、个人隐私资料全程脱敏处理，仅专属医疗评估团队可见。' },
  { y: 656, text: '2. 严禁外泄、严禁商用', strong: true },
  { y: 692, text: '患者病历、影像、检查数据绝不公开、绝不做案例展示、绝不用于任何商业用途。' },
  { y: 728, text: '3. 专属封闭审核通道', strong: true },
  { y: 764, text: '每份患者资料独立归档、专人对接，无公开浏览权限、无第三方共享。' },
  { y: 800, text: '4. 阅后可销毁机制', strong: true },
  { y: 836, text: '评估结束、诊疗完成后，可根据患者要求永久删除所有云端备份数据。' },
  { y: 872, text: '全流程严格遵循 GDPR、HIPAA 国际双隐私合规标准，全球患者可安心。' },
  { y: 908, text: '完成病历标准化整理后，即可直接提交国内三甲专家团队，获取专属来华就医可行性评估报告。' },
  { y: 944, text: '你无需懂中文、无需翻译、无需整理排版、无需梳理病情时间线。' },
  { y: 980, text: '全程由我们医疗文案团队标准化处理，直接对接专家初审通道。' },
]
</script>

<template>
  <ContentArticleCanvas v-if="viewportWidth > 900" :key="article || 'translation'" source="toolkit" :article="article" :width="viewportWidth" />
  <div v-else class="toolkit-detail-page" data-page="steps-toolkit-detail">
    <div class="toolkit-detail-shell">
      <article class="toolkit-detail-article">
        <RouterLink class="toolkit-detail-back" to="/trust" data-figma-node="143:3065"><span aria-hidden="true">‹</span> 返回信任与常见问题</RouterLink>
        <div class="toolkit-detail-heading-gap" aria-hidden="true" />
        <span class="toolkit-detail-kicker" data-figma-node="143:3071">01 出行前 · 决策评估工具</span>
        <h1 data-figma-node="143:3074">病历翻译与整理工具</h1>
        <div class="toolkit-detail-copy toolkit-detail-copy--top" data-figma-node="143:3077"><p v-for="(line, index) in topLines" :id="line.id" :key="index" class="toolkit-detail-line" :class="{ 'is-strong': line.strong, 'is-heading': line.heading, 'is-lead': line.lead }" :style="{ '--line-y': `${line.y}px` }">{{ line.text }}</p></div>
        <div class="toolkit-detail-images" data-figma-node="143:3078">
          <img src="/images/figma/toolkit-source-record.webp" alt="标准化病历整理示例" data-figma-node="143:3079" />
          <img src="/images/figma/toolkit-source-report.webp" alt="海外病历可行性评估报告示例" data-figma-node="143:3080" />
        </div>
        <div class="toolkit-detail-copy toolkit-detail-copy--bottom" data-figma-node="143:3081"><p v-for="(line, index) in bottomLines" :key="index" class="toolkit-detail-line" :class="{ 'is-strong': line.strong, 'is-heading': line.heading, 'is-lead': line.lead }" :style="{ '--line-y': `${line.y}px` }">{{ line.text }}</p></div>
      </article>
      <aside class="toolkit-detail-sidebar" data-figma-node="143:3082"><strong>来华就医全流程工具包</strong><nav aria-label="工具包目录"><a v-for="section in sections" :key="section.id" :href="`#${section.id}`">{{ section.label }}</a></nav></aside>
    </div>
  </div>
</template>

<style scoped>
.toolkit-detail-page { min-height:2453px; margin-top:-64px; padding:112px 0; box-sizing:border-box; background:#f5f6f8; color:#1e3a5f; }
.toolkit-detail-shell { display:grid; width:min(1216px,calc(100% - 48px)); min-height:2229px; margin:0 auto; grid-template-columns:minmax(0,906px) 286px; gap:24px; align-items:start; }
.toolkit-detail-article { min-width:0; min-height:2229px; box-sizing:border-box; padding:32px; border-radius:24px; background:#fff; }
.toolkit-detail-back { display:inline-flex; height:27px; align-items:center; gap:8px; color:#6b7280; font-size:14px; line-height:22px; transition:color .2s ease; }
.toolkit-detail-back:hover { color:#1685c3; }.toolkit-detail-back span { font-size:24px; line-height:16px; }.toolkit-detail-heading-gap { height:29px; }
.toolkit-detail-kicker { display:inline-flex; width:191px; height:34px; box-sizing:border-box; align-items:center; border-radius:6px; padding:0 16px; background:#e8f1ff; color:#2387dd; font-size:14px; font-weight:600; line-height:14px; }
.toolkit-detail-article h1 { margin:16px 0 40px; color:#1e3a5f; font-family:"PingFang SC","Noto Sans SC",sans-serif; font-size:40px; font-weight:600; line-height:60px; }
.toolkit-detail-copy { position:relative; color:#4b5563; font-family:"PingFang SC","Noto Sans SC",sans-serif; font-size:16px; font-weight:400; line-height:24px; }.toolkit-detail-copy--top { height:644px; }.toolkit-detail-copy--bottom { height:1004px; }
.toolkit-detail-line { position:absolute; left:0; top:var(--line-y); width:100%; margin:0; line-height:24px; white-space:nowrap; }.toolkit-detail-line.is-strong { color:#1e3a5f; font-weight:600; }.toolkit-detail-line.is-heading { color:#1e3a5f; font-size:24px; font-weight:600; line-height:36px; }.toolkit-detail-line.is-lead { line-height:32px; }
.toolkit-detail-images { display:grid; width:100%; height:260px; margin:24px 0; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }.toolkit-detail-images img { display:block; width:100%; height:260px; border-radius:8px; object-fit:cover; }
.toolkit-detail-sidebar { position:sticky; top:88px; box-sizing:border-box; height:465px; padding:24px; border-radius:24px; background:#fff; }.toolkit-detail-sidebar strong { display:block; margin-bottom:18px; color:#1e3a5f; font-size:18px; font-weight:600; line-height:18px; }.toolkit-detail-sidebar nav { display:grid; }.toolkit-detail-sidebar a { display:flex; min-height:47px; box-sizing:border-box; align-items:center; border-top:1px solid #eef0f3; color:#6b7280; font-size:14px; line-height:14px; transition:color .2s ease,padding-left .2s ease; }.toolkit-detail-sidebar a:hover,.toolkit-detail-sidebar a:focus-visible { padding-left:4px; color:#1685c3; }
@media (max-width:900px) { .toolkit-detail-page { min-height:0; margin-top:-56px; padding:88px 0 72px; }.toolkit-detail-shell { display:block; min-height:0; width:min(calc(100% - 32px),680px); }.toolkit-detail-article { min-height:0; padding:24px; border-radius:18px; }.toolkit-detail-copy--top,.toolkit-detail-copy--bottom { height:auto; }.toolkit-detail-line { position:static; width:auto; margin:0 0 12px; white-space:normal; }.toolkit-detail-sidebar { position:static; height:auto; margin-top:16px; border-radius:18px; }.toolkit-detail-images { height:auto; grid-template-columns:1fr; }.toolkit-detail-images img { height:auto; aspect-ratio:1.573; } }
@media (prefers-reduced-motion:reduce) { .toolkit-detail-page * { scroll-behavior:auto; transition-duration:.01ms !important; } }
</style>
