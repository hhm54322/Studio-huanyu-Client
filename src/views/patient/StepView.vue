<script setup lang="ts">
import { ArrowRight, Banknote, Check, Clock3, FileText, Globe2, HeartHandshake, Plane, ShieldCheck } from 'lucide-vue-next'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { stepsData } from '@/data/steps'

const iconMap: Record<string, any> = { FileText, Plane, ShieldCheck, HeartHandshake, Banknote, Globe: Globe2 }
const phaseSections = [
  { id: 'before', no: '01', label: '出行前', title: '决策评估工具', copy: '从病历预审、专家匹配到签证和行程准备，把出发前最容易遗漏的事项整理成清单。' },
  { id: 'travel', no: '02', label: '出行中', title: '落地办理工具', copy: '确认来华，办理入境、药品、陪护等手续，减少抵达后的不确定性。' },
  { id: 'after', no: '03', label: '在华&回国', title: '就诊随访工具', copy: '抵达中国就诊，出院回国后的资料与远程服务持续衔接。' },
]
const travelTools = [
  { icon: '/images/figma/steps-travel-visa.svg', title: '签证申请清单', copy: '梳理来华医疗签证所需材料、办理流程与时间参考，协助你准备入境就医手续', path: '', action: true },
  { icon: '/images/figma/steps-travel-visa-free.svg', title: '免签国家清单', copy: '了解来华就医的现实条件、预算参考与治疗可能性。提供免费初步摸底与深度专家研判两种选择，辅助你理性做就医决策。', path: '', action: false },
  { icon: '/images/figma/steps-travel-medicine.svg', title: '药品入境规定', copy: '清晰了解个人自用药品入境规范、申报要求与禁限带清单，合规携带常用药物来华，避免入境受阻。', path: '', action: false },
  { icon: '/images/figma/steps-travel-family.svg', title: '家属陪同攻略', copy: '完整家属来华陪护指南，包含签证办理、出行住宿、院内陪护规则、双管家全程协助，让家属陪护省心、轻松、无负担。', path: '', action: false },
  { icon: '/images/figma/steps-travel-muslim.svg', title: '穆斯林患者实操手册', copy: '专属穆斯林患者来华就医全套生活、饮食、信仰、就医礼仪指南，尊重宗教习惯，全程适配清真生活方式。', path: '', action: false },
]
const afterTools = [
  { icon: '/images/figma/steps-aftercare-path.svg', title: '就医步骤与就诊流程', copy: '梳理从评估到完成治疗回国的全流程步骤，帮你清晰规划来华就医的每一个环节', path: '', action: true },
  { icon: '/images/figma/steps-aftercare-followup.svg', title: '国际报告与回国随访', copy: '了解来华就医的现实条件、预算参考与治疗可能性。提供免费初步摸底与深度专家研判两种选择，辅助你理性做就医决策。', path: '', action: false },
]

</script>

<template>
  <div class="steps-page">
    <section class="hy-page-hero steps-hero"><img class="hy-page-hero__media" src="/images/page-banners/steps-pc.jpg" alt="来华就医全流程" /><div class="hy-page-hero__overlay" /><div class="hy-page-hero__content" data-reveal><span class="hy-kicker">MEDICAL JOURNEY TO CHINA</span><h1>来华就医全流程</h1><p>从首次咨询到回国随访，把复杂的跨境医疗拆解成清楚、可执行的每一步。</p><RouterLink to="/report" class="hy-button-primary">从病历预审开始 <ArrowRight class="h-4 w-4" /></RouterLink></div></section>

    <nav class="phase-nav" aria-label="流程阶段"><div class="hy-container"><a v-for="phase in phaseSections" :key="phase.id" :href="`#${phase.id}`"><b>{{ phase.no }}</b><span><strong>{{ phase.label }}</strong><small>{{ phase.title }}</small></span></a></div></nav>

    <section id="before" class="hy-section journey-section"><div class="hy-container"><SectionHeading kicker="01 · BEFORE TRAVEL" title="从咨询到赴华，先把决策做清楚" description="每一步都标注核心事项、参考时间与费用说明，方便患者和家属提前准备。" /><div class="journey-list"><article v-for="(step, index) in stepsData" :key="step.number" data-reveal><div class="journey-index"><span>{{ step.number }}</span><i /></div><div class="journey-icon"><component :is="iconMap[step.icon] || FileText" /></div><div class="journey-main"><small>{{ step.subtitle }}</small><h2>{{ step.title }}</h2><p>{{ step.content }}</p><div class="journey-actions"><span v-for="action in step.actions" :key="action"><Check class="h-3.5 w-3.5" />{{ action }}</span></div></div><aside><span><Clock3 class="h-4 w-4" /><i><small>参考时间</small>{{ step.time }}</i></span><span><Banknote class="h-4 w-4" /><i><small>费用说明</small>{{ step.cost }}</i></span></aside></article></div></div></section>

    <section id="travel" class="toolkit-stages">
      <div class="hy-container toolkit-stages__layout">
        <div class="toolkit-stage__copy"><h2>来华就医全流程<br />工具包</h2><p>确认来华就医，获取全套办理模板、清单与流程指引</p></div>
        <div class="toolkit-stages__content">
          <section class="toolkit-stage-panel"><header class="toolkit-stage__heading"><h3>02 出行中 · 落地办理工具</h3><p>确认来华，办理入境、药品、陪护等手续</p></header><div class="toolkit-stage__cards"><article v-for="tool in travelTools" :key="tool.title" :class="{ 'toolkit-stage__card--visa': tool.title === '签证申请清单' }" data-reveal><img class="toolkit-stage__icon" :src="tool.icon" alt="" /><div class="toolkit-stage__card-copy"><h4>{{ tool.title }}</h4><p>{{ tool.copy }}</p><RouterLink v-if="tool.action && tool.path" :to="tool.path">阅读全文 <img src="/images/figma/steps-toolkit-arrow.svg" alt="" /></RouterLink><span v-else-if="tool.action" class="toolkit-stage__pending-action" aria-disabled="true">阅读全文 <img src="/images/figma/steps-toolkit-arrow.svg" alt="" /></span></div></article></div></section>
          <section id="after" class="toolkit-stage-panel toolkit-stage-panel--after"><header class="toolkit-stage__heading"><h3>03 在华&amp;回国 · 就诊随访工具</h3><p>抵达中国就诊，出院回国后的资料与远程服务</p></header><div class="toolkit-stage__cards"><article v-for="tool in afterTools" :key="tool.title" data-reveal><img class="toolkit-stage__icon" :src="tool.icon" alt="" /><div class="toolkit-stage__card-copy"><h4>{{ tool.title }}</h4><p>{{ tool.copy }}</p><RouterLink v-if="tool.action && tool.path" :to="tool.path">阅读全文 <img src="/images/figma/steps-toolkit-arrow.svg" alt="" /></RouterLink><span v-else-if="tool.action" class="toolkit-stage__pending-action" aria-disabled="true">阅读全文 <img src="/images/figma/steps-toolkit-arrow.svg" alt="" /></span></div></article></div></section>
        </div>
      </div>
    </section>

    <section class="steps-cta"><div class="hy-container" data-reveal><div><h2>准备好开始了吗？</h2><p>提交医疗资料，我们会从第一步开始帮你梳理。</p></div><RouterLink to="/report" class="hy-button-primary">提交病例 <ArrowRight class="h-4 w-4" /></RouterLink></div></section>
  </div>
</template>

<style scoped>
.steps-page { margin-top: -72px; }.steps-hero { min-height: 620px; }.steps-hero .hy-page-hero__content { padding-top: 170px; }.steps-hero .hy-button-primary { margin-top: 29px; }
.phase-nav { position: sticky; top: 72px; z-index: 20; padding: 0; border-bottom: 1px solid var(--hy-line); background: rgba(255,255,255,.92); backdrop-filter: blur(14px); }.phase-nav > div { display: grid; grid-template-columns: repeat(3, 1fr); }.phase-nav a { display: flex; gap: 15px; min-height: 72px; align-items: center; padding: 0 28px; border-left: 1px solid var(--hy-line); }.phase-nav a:first-child { padding-left: 0; border-left: 0; }.phase-nav b { color: var(--hy-orange); font-size: 12px; }.phase-nav span { display: grid; gap: 2px; }.phase-nav strong { color: var(--hy-navy-deep); font-size: 14px; }.phase-nav small { color: var(--hy-muted); font-size: 10px; }
.journey-section { background: #fff; }.journey-list { margin-top: 48px; border-top: 1px solid var(--hy-line); }.journey-list article { display: grid; grid-template-columns: 62px 58px 1fr 260px; gap: 22px; padding: 34px 0; border-bottom: 1px solid var(--hy-line); }.journey-index { position: relative; }.journey-index span { color: var(--hy-orange); font-size: 22px; font-weight: 800; }.journey-index i { position: absolute; top: 34px; bottom: -35px; left: 11px; width: 1px; background: var(--hy-line); }.journey-list article:last-child .journey-index i { display: none; }.journey-icon { display: grid; width: 50px; height: 50px; place-items: center; border-radius: 50%; background: #eaf6fb; color: var(--hy-blue); }.journey-icon svg { width: 23px; height: 23px; }.journey-main > small { color: var(--hy-blue); font-size: 9px; font-weight: 750; }.journey-main h2 { margin: 4px 0 9px; color: var(--hy-navy-deep); font-size: 20px; }.journey-main > p { margin: 0; color: var(--hy-muted); font-size: 12px; line-height: 1.75; }.journey-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }.journey-actions span { display: flex; align-items: center; gap: 4px; border-radius: 3px; padding: 5px 7px; background: #f2f7f9; color: #587184; font-size: 9px; }.journey-actions svg { color: #26a676; }.journey-list aside { display: grid; align-content: start; gap: 15px; padding-left: 24px; border-left: 1px solid var(--hy-line); }.journey-list aside > span { display: flex; gap: 9px; color: var(--hy-blue); }.journey-list aside i { display: grid; color: var(--hy-ink); font-size: 10px; font-style: normal; }.journey-list aside small { color: var(--hy-muted); font-size: 8px; }
.toolkit-stages { position: relative; background: #1e3a5f; color: #fff; font-family: "PingFang SC", sans-serif; }
.toolkit-stages__layout { display: grid; width: 1216px; height: 2029px; box-sizing: border-box; grid-template-columns: 389.33px 802px; gap: 24.67px; align-items: start; align-content: start; padding: 96px 0; }
.toolkit-stage__copy { position: sticky; top: 168px; align-self: start; margin-bottom: 96px; }
.toolkit-stages__content { width: 802px; min-width: 0; }
.toolkit-stage-panel { height: 1179px; box-sizing: border-box; overflow: clip; }
.toolkit-stage-panel--after { height: 658px; }
.toolkit-stage__copy h2 { margin: 0; padding-top: 20px; color: #fff; font-size: 40px; font-weight: 600; line-height: 60px; letter-spacing: .4px; }
.toolkit-stage__copy p { width: 283px; margin: 16px 0 0; color: rgba(255,255,255,.7); font-size: 16px; font-weight: 400; line-height: 24px; }
.toolkit-stage__heading h3 { margin: 0; color: #fff; font-size: 32px; font-weight: 600; line-height: 32px; letter-spacing: .4px; }
.toolkit-stage__heading p { margin: 16px 0 0; color: rgba(255,255,255,.7); font-size: 16px; font-weight: 400; line-height: 24px; }
.toolkit-stage__cards { display: grid; grid-template-columns: repeat(2, 389px); gap: 24px; margin-top: 48px; }
.toolkit-stage__cards article { display: flex; height: 305px; box-sizing: border-box; flex-direction: column; align-items: flex-start; justify-content: space-between; overflow: hidden; border-radius: 24px; padding: 24px; background: #0f213e; transition: transform .45s cubic-bezier(.22,1,.36,1), box-shadow .4s ease; }
.toolkit-stage__cards article.toolkit-stage__card--visa { height: 304px; justify-content: flex-start; gap: 80px; }
.toolkit-stage-panel--after .toolkit-stage__cards article { height: 304px; }
.toolkit-stage__cards article:hover { transform: translateY(-7px); box-shadow: 0 20px 50px rgba(1,17,33,.2); }
.toolkit-stage__icon { display: block; width: 32px; height: 32px; flex: none; }
.toolkit-stage__card-copy { width: 100%; }
.toolkit-stage__cards h4 { margin: 0; color: #fff; font-size: 24px; font-weight: 600; line-height: 24px; letter-spacing: -.439px; }
.toolkit-stage__cards p { margin: 16px 0 0; color: rgba(255,255,255,.7); font-size: 16px; font-weight: 400; line-height: 24px; }
.toolkit-stage__cards a, .toolkit-stage__cards button { display: inline-flex; align-items: center; gap: 4px; margin-top: 16px; border: 0; padding: 0; background: transparent; color: #dd6b20; font: inherit; font-size: 16px; font-weight: 500; line-height: 16px; cursor: pointer; }
.toolkit-stage__cards .toolkit-stage__pending-action { display: inline-flex; align-items: center; gap: 4px; margin-top: 16px; color: #dd6b20; font-size: 16px; font-weight: 500; line-height: 16px; }
.toolkit-stage__cards .toolkit-stage__pending-action img { width: 16px; height: 16px; }
.toolkit-stage__cards a img, .toolkit-stage__cards button img { width: 16px; height: 16px; transition: transform .25s ease; }
.toolkit-stage__cards a:hover img, .toolkit-stage__cards button:hover img { transform: translateX(4px); }
.steps-cta { padding: 74px 0; background: var(--hy-navy-deep); }.steps-cta > div { display: flex; align-items: center; justify-content: space-between; gap: 50px; }.steps-cta h2 { margin: 0; color: #fff; font-size: 37px; }.steps-cta p { margin: 6px 0 0; color: rgba(255,255,255,.58); }

@media (max-width:1199px) and (min-width:851px) {
  .toolkit-stages__layout { width: min(100%, calc(100vw - 48px)); grid-template-columns: minmax(220px, 1fr) minmax(0, 2fr); gap: 24px; }
  .toolkit-stages__content { width: 100%; }
  .toolkit-stage__cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .toolkit-stage__cards article { min-width: 0; }
}
@media (max-width: 850px) {
  .toolkit-stage-panel, .toolkit-stage-panel--after { height: auto; min-height: 0; overflow: visible; }
  .toolkit-stages__layout { width: min(100%, calc(100vw - 64px)); min-height: 0; height: auto; grid-template-columns: minmax(0, 1fr); gap: 48px; padding: 78px 0 80px; }
  .toolkit-stage__copy { position: static; align-self: auto; margin-bottom: 0; }
  .toolkit-stage__copy p, .toolkit-stages__content { width: 100%; }
  .toolkit-stage__cards { grid-template-columns: minmax(0, 1fr); }
  .toolkit-stage__cards article, .toolkit-stage-panel--after .toolkit-stage__cards article { height: auto; min-height: 304px; }
}
@media (max-width: 850px) { .journey-list article { grid-template-columns: 50px 1fr; }.journey-icon { grid-column: 1; }.journey-main { grid-column: 2; grid-row: 1 / span 2; }.journey-list aside { grid-column: 2; grid-row: 3; grid-template-columns: 1fr 1fr; padding: 17px 0 0; border-left: 0; border-top: 1px solid var(--hy-line); }.toolkit-stage__copy h2 { max-width: 600px; } }
@media (max-width: 620px) { .steps-page { margin-top: -70px; }.phase-nav { top: 70px; }.phase-nav > div { grid-template-columns: 1fr; }.phase-nav a, .phase-nav a:first-child { min-height: 56px; padding: 0; border-left: 0; border-top: 1px solid var(--hy-line); }.phase-nav a:first-child { border-top: 0; }.journey-list article { grid-template-columns: 42px 1fr; gap: 13px; }.journey-icon { width: 40px; height: 40px; }.journey-main { grid-column: 2; }.journey-list aside { grid-template-columns: 1fr; }.toolkit-stages__layout { width: min(100%, calc(100vw - 40px)); }.toolkit-stage__copy h2 { padding-top: 0; font-size: 36px; line-height: 48px; }.toolkit-stage__heading h3 { font-size: 28px; line-height: 36px; }.toolkit-stage__cards { gap: 16px; }.toolkit-stage__cards article, .toolkit-stage-panel--after .toolkit-stage__cards article { min-height: 280px; padding: 24px; }.steps-cta > div { align-items: flex-start; flex-direction: column; }.steps-cta h2 { font-size: 30px; }.steps-cta .hy-button-primary { width: 100%; } }

@media (prefers-reduced-motion: reduce) {
  .toolkit-stage__cards article, .toolkit-stage__cards a img, .toolkit-stage__cards button img { transition: none; }
  .toolkit-stage__cards article:hover { transform: none; }
}
</style>
