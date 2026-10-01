<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { X } from "lucide-vue-next";

const trustAsset = (name: string) => `/images/figma/trust/${name}`;

const assurances = [
  {
    title: "正规企业资质\n与全球服务网络",
    copy: "企业具备完整注册资质，国内设立多地全资服务机构，同时布局海外服务中心，搭建跨国就医服务网络，保障跨境服务落地。",
    icon: trustAsset("Icon-22.svg"),
  },
  {
    title: "直连正规权威\n医疗机构",
    copy: "官方合作、路径清晰，医院与医生信息可核验。",
    icon: trustAsset("Icon-15.svg"),
  },
  {
    title: "无中间商\n全程直连对接",
    copy: "直属团队负责需求理解、资料整理、医院协调与落地服务。",
    icon: trustAsset("Frame-3.svg"),
  },
  {
    title: "完整服务权益\n保障体系",
    copy: "从评估、签约、费用到随访，每个关键节点都有书面说明。",
    icon: trustAsset("Frame-4.svg"),
  },
];
const expandedAssurances = ref(new Set([0]));
function toggleAssurance(index: number) {
  const next = new Set(expandedAssurances.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  expandedAssurances.value = next;
}
const activeFaq = ref(0);
function faqBeforeEnter(element: Element) {
  const panel = element as HTMLElement;
  panel.style.height = '0px';
  panel.style.opacity = '0';
}
function faqEnter(element: Element) {
  const panel = element as HTMLElement;
  const height = panel.scrollHeight;
  requestAnimationFrame(() => {
    panel.style.height = `${height}px`;
    panel.style.opacity = '1';
  });
}
function faqAfterEnter(element: Element) {
  (element as HTMLElement).style.height = '';
}
function faqBeforeLeave(element: Element) {
  const panel = element as HTMLElement;
  panel.style.height = `${panel.getBoundingClientRect().height}px`;
  panel.style.opacity = '1';
}
function faqLeave(element: Element) {
  const panel = element as HTMLElement;
  requestAnimationFrame(() => {
    panel.style.height = '0px';
    panel.style.opacity = '0';
  });
}
const faqs = [
  {
    q: "合作的中国医院是什么等级？是否国际认可？",
    a: "我们仅对接国内三级甲等公立总院、三级国际高端私立医院、JCI国际认证医院、博鳌特许医疗中心。<br />所有医院具备国家正规医疗执业资质，病历、检查报告、手术记录全球通用，可用于海外复诊与保险理赔。",
  },
  {
    q: "主治医生是什么资质？能否对接专科专家？",
    a: "根据疾病类型和治疗方向，优先匹配主任医师、教授、学科带头人及多学科会诊团队，专家信息可在预约前核验。",
  },
  {
    q: "中国医院的医疗安全、消毒标准是否对标国际？",
    a: "合作医院执行国家医疗质量和院感规范，部分机构通过 JCI 等国际体系认证，具体标准会随医院推荐一并说明。",
  },
  {
    q: "进口药物、靶向药、放疗设备是否齐全？",
    a: "平台会按病情核对药物可及性、设备条件和适应证，涉及具体用药与治疗方案时，以执业医生评估为准。",
  },
];
const articles = [
  {
    title: "JCI认证真相",
    copy: "137家JCI认证，院内感染率0.5%仅为欧美一半",
    icon: trustAsset("Icon-6.svg"),
    link: true,
  },
  {
    title: "费用低的原因",
    copy: "便宜≠低质，5大成本结构差异",
    icon: trustAsset("Icon-9.svg"),
  },
  {
    title: "医生资质揭秘",
    copy: "98.7%海外培训，3-5倍手术量",
    icon: trustAsset("Frame-2.svg"),
  },
  {
    title: "药品安全说明",
    copy: "一细胞一码，全链路可追溯",
    icon: trustAsset("Icon-8.svg"),
  },
  {
    title: "感染控制数据",
    copy: "0.5% vs 欧美1.2%，4大核心支柱",
    icon: trustAsset("Icon-7.svg"),
  },
  {
    title: "权益保障解读",
    copy: "82%调解成功率，5重保障",
    icon: trustAsset("Icon-12.svg"),
  },
  {
    title: "数据隐私合规",
    copy: "GDPR/HIPAA双合规",
    icon: trustAsset("Icon-3.svg"),
  },
  {
    title: "穆斯林患者就医保障",
    copy: "清真饮食·礼拜空间·隐私保护·斋月适配，全流程尊重伊斯兰信仰",
    icon: trustAsset("Frame-1.svg"),
  },
];
const jciModalOpen = ref(false);
const jciTrigger = ref<HTMLButtonElement | null>(null);
const jciCloseButton = ref<HTMLButtonElement | null>(null);
function setJciTrigger(element: any) {
  jciTrigger.value = element as HTMLButtonElement | null;
}
function openJciArticle() {
  jciModalOpen.value = true;
  nextTick(() => jciCloseButton.value?.focus());
}
function closeJciArticle() {
  jciModalOpen.value = false;
  nextTick(() => jciTrigger.value?.focus());
}
function handleJciKeydown(event: KeyboardEvent) {
  if (!jciModalOpen.value) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeJciArticle();
    return;
  }
  if (event.key !== 'Tab') return;
  const dialog = document.getElementById('jci-truth-dialog');
  if (!dialog) return;
  const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute('disabled'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
onMounted(() => document.addEventListener('keydown', handleJciKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', handleJciKeydown));
const tools = [
  {
    title: "病历翻译与整理工具",
    copy: "海外病历标准化整理、中文医疗级翻译、影像归档模板。专业团队结构化梳理病历，快速适配国内医生评估标准，前置完成来华就医第一步。",
    icon: trustAsset("Frame.svg"),
  },
  {
    title: "来华就医可行性评估",
    copy: "了解来华就医的现实条件、预算参考与治疗可能性。提供免费初步摸底与深度专家研判两种选择，辅助你理性做就医决策。",
    icon: trustAsset("Icon-21.svg"),
  },
];
const travelTools = [
  { title: "签证申请清单", copy: "梳理来华医疗签证所需材料、办理流程与时间参考，协助你准备入境就医手续。", icon: "/images/figma/steps-travel-visa.svg", action: false },
  { title: "免签国家清单", copy: "了解来华就医的现实条件、预算参考与治疗可能性。提供免费初步摸底与深度专家研判两种选择，辅助你理性做就医决策。", icon: "/images/figma/steps-travel-visa-free.svg", action: false },
  { title: "药品入境规定", copy: "清晰了解个人自用药品入境规范、申报要求与禁限带清单，合规携带常用药物来华，避免入境受阻。", icon: "/images/figma/steps-travel-medicine.svg", action: false },
  { title: "家属陪同攻略", copy: "完整家属来华陪护指南，包含签证办理、出行住宿、院内陪护规则、双管家全程协助，让家属陪护省心、轻松、无负担。", icon: "/images/figma/steps-travel-family.svg", action: false },
  { title: "穆斯林患者实操手册", copy: "专属穆斯林患者来华就医全套生活、饮食、信仰、就医礼仪指南，尊重宗教习惯，全程适配清真生活方式。", icon: "/images/figma/steps-travel-muslim.svg", action: false },
];
const afterTools = [
  { title: "就医步骤与就诊流程", copy: "梳理从评估到完成治疗回国的全流程步骤，帮你清晰规划来华就医的每一个环节。", icon: "/images/figma/steps-aftercare-path.svg", action: false },
  { title: "国际报告与回国随访", copy: "了解来华就医的现实条件、预算参考与治疗可能性。提供免费初步摸底与深度专家研判两种选择，辅助你理性做就医决策。", icon: "/images/figma/steps-aftercare-followup.svg", action: false },
];
const toolkitStages = [
  { heading: "01 出行前 · 决策评估工具", description: "还未确定来华，准备病历、评估可行性", items: tools },
  { heading: "02 出行中 · 落地办理工具", description: "确认来华，办理入境、药品、陪护等手续", items: travelTools },
  { heading: "03 在华&回国 · 就诊随访工具", description: "抵达中国就诊，出院回国后的资料与远程服务", items: afterTools },
];
function openConsultation() {
  window.dispatchEvent(new CustomEvent("open-consultation"));
}
</script>

<template>
  <div class="trust-page">
    <section class="trust-hero">
      <div class="trust-hero__media" />
      <div class="hy-container">
        <header data-reveal>
          <h1>就医保障 · 信任中心</h1>
          <p>透明资质｜正规合作｜全程直连｜权益保障</p>
        </header>
        <div class="assurance-grid">
          <article
            v-for="(item, index) in assurances"
            :key="item.title"
            data-reveal
            :class="{ expanded: expandedAssurances.has(index) }"
            role="button"
            tabindex="0"
            :aria-expanded="expandedAssurances.has(index)"
            @click="toggleAssurance(index)"
            @keydown.enter.prevent="toggleAssurance(index)"
            @keydown.space.prevent="toggleAssurance(index)"
          >
            <img class="assurance-icon" :src="item.icon" alt="" aria-hidden="true" />
            <h2>{{ item.title }}</h2>
            <span
              >查看详情<img
                class="assurance-chevron"
                :src="trustAsset('Icon-14.svg')"
                alt=""
                aria-hidden="true"
            /></span>
            <p>{{ item.copy }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="faq-section">
      <div class="hy-container faq-layout">
        <aside data-reveal>
          <h2>20个高频就医疑问</h2>
          <p>汇总海外患者来华就医最关心的核心问题</p>
        </aside>
        <div>
          <nav>
            <strong>医疗资质与诊疗保障</strong>
          </nav>
          <div class="faq-list">
            <article
              v-for="(item, index) in faqs"
              :key="item.q"
              :class="{ active: activeFaq === index }"
            >
              <button
                type="button"
                :aria-expanded="activeFaq === index"
                :aria-controls="`trust-faq-answer-${index}`"
                @click="activeFaq = activeFaq === index ? -1 : index"
              >
                <span>{{ item.q }}</span
                ><img
                  class="faq-chevron"
                  :src="
                    trustAsset(
                      activeFaq === index ? 'Icon-18.svg' : 'Icon-11.svg',
                    )
                  "
                  alt=""
                  aria-hidden="true"
                /></button>
              <Transition name="accordion" @before-enter="faqBeforeEnter" @enter="faqEnter" @after-enter="faqAfterEnter" @before-leave="faqBeforeLeave" @leave="faqLeave">
                <div v-if="activeFaq === index" :id="`trust-faq-answer-${index}`" class="accordion-panel">
                  <p v-html="item.a"></p>
                </div>
              </Transition>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="articles-section">
      <div class="hy-container">
        <header class="section-title" data-reveal>
          <h2>8篇信任深度长文</h2>
          <p>专家·费用·合规，你想知道的都在这里</p>
        </header>
        <div class="article-grid">
          <article
            v-for="(item, index) in articles"
            :key="item.title"
            data-reveal
            :style="{ '--reveal-delay': `${(index % 3) * 55}ms` }"
          >
            <img class="article-icon" :src="item.icon" alt="" aria-hidden="true" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.copy }}</p>
            <button
              v-if="item.link"
              :ref="setJciTrigger"
              type="button"
              aria-haspopup="dialog"
              :aria-expanded="jciModalOpen"
              aria-controls="jci-truth-dialog"
              @click="openJciArticle"
            >
              阅读全文<img
                class="arrow-icon"
                :src="trustAsset('Icon-2.svg')"
                alt=""
                aria-hidden="true"
              />
            </button>
          </article>
        </div>
      </div>
    </section>

    <Transition name="jci-dialog">
      <div
        v-if="jciModalOpen"
        class="jci-dialog-backdrop"
        role="presentation"
        @click.self="closeJciArticle"
        @keydown.esc.stop="closeJciArticle"
      >
        <section
          id="jci-truth-dialog"
          class="jci-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jci-dialog-title"
          tabindex="-1"
        >
          <button
            ref="jciCloseButton"
            class="jci-dialog-close"
            type="button"
            aria-label="关闭JCI认证真相"
            @click="closeJciArticle"
          >
            <X :size="16" aria-hidden="true" />
          </button>
          <h2 id="jci-dialog-title">JCI认证真相</h2>
          <p class="jci-dialog-lead">137家JCI认证，院内感染率0.5%仅为欧美一半</p>
          <div class="jci-dialog-copy">
            <p>很多海外患者规划来华就医时，首要顾虑：中国医院的医疗标准是否和国际接轨，是否得到全球认可。</p>
            <p>JCI（Joint Commission International）是国际公认的医疗质量与安全评审体系，执行全球统一标准，不存在国别专属版本。</p>
            <p>我们合作的医疗机构中，共计137家取得JCI国际认证，在患者安全、诊疗流程、手术质控、院感管理、护理规范上全部对标国际行业要求。</p>
            <p>公开统计数据显示，这类JCI认证医院院内感染率仅0.5%，对比欧美医院平均1.2%的感染水平，拥有更严格的无菌管控与术后安全体系。</p>
            <p>从术前评估、手术操作到术后监护，整套诊疗流程完全同步欧美、新加坡等国际医疗规范。对海外患者而言，JCI认证是判断医院正规性、安全性的重要参考依据。</p>
            <p>JCI认证不是宣传噱头，代表医院的医疗安全体系达到国际统一标准，为跨境就医提供基础安全保障。</p>
          </div>
        </section>
      </div>
    </Transition>

    <div class="toolkit-scroll" aria-label="来华就医全流程工具包">
      <div class="hy-container toolkit-layout">
        <aside class="toolkit-sticky">
          <h2>来华就医全流程<br />工具包</h2>
          <p>确认来华就医，获取全套办理模板、清单与流程指引</p>
        </aside>
        <div class="toolkit-stages">
          <section v-for="(stage, stageIndex) in toolkitStages" :key="stage.heading" class="toolkit-section" :class="`toolkit-section--stage-${stageIndex}`">
            <header>
              <h3>{{ stage.heading }}</h3>
              <p>{{ stage.description }}</p>
            </header>
            <div class="tool-grid">
              <article v-for="(item, itemIndex) in stage.items" :key="item.title" data-reveal>
                <img class="tool-icon" :src="item.icon" alt="" aria-hidden="true" />
                <h3>{{ item.title }}</h3>
                <p>{{ item.copy }}</p>
                <RouterLink v-if="stageIndex === 0 && itemIndex === 0" to="/steps/toolkit-detail">
                  阅读全文<img class="arrow-icon" :src="trustAsset('Icon-2.svg')" alt="" aria-hidden="true" />
                </RouterLink>
                <span v-else-if="(stageIndex === 1 && itemIndex === 0) || (stageIndex === 2 && itemIndex === 0)" class="tool-action-pending" aria-disabled="true">
                  阅读全文<img class="arrow-icon" :src="trustAsset('Icon-2.svg')" alt="" aria-hidden="true" />
                </span>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>

    <section class="trust-cta">
      <div class="hy-container" data-reveal>
        <h2>准备好开启您的来华就医之旅了吗？</h2>
        <p>我们的医疗顾问团队随时为您提供免费咨询</p>
        <div>
          <button type="button" @click="openConsultation">
            <img
              class="cta-icon"
              :src="trustAsset('Icon-1.svg')"
              alt=""
              aria-hidden="true"
            />免费问阿宁</button
          ><RouterLink to="/report"
            ><img
              class="cta-icon"
              :src="trustAsset('Icon-17.svg')"
              alt=""
              aria-hidden="true"
            />生成可行性报告</RouterLink
          ><button class="dark" type="button" @click="openConsultation">
            预约专家面诊 $200起<img
              class="cta-icon"
              :src="trustAsset('Icon-10.svg')"
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
        <small
          ><span
            ><img :src="trustAsset('Icon-19.svg')" alt="" aria-hidden="true" />免费咨询</span
          ><span
            ><img :src="trustAsset('Icon-19.svg')" alt="" aria-hidden="true" />无隐藏费用</span
          ><span
            ><img :src="trustAsset('Icon-19.svg')" alt="" aria-hidden="true" />24小时响应</span
          ></small
        >
      </div>
    </section>
  </div>
</template>

<style scoped>
.trust-page {
  margin-top: -72px;
  color: #173b67;
}
.trust-hero {
  position: relative;
  min-height: 760px;
  overflow: hidden;
  padding-top: 72px;
  background: #eef7fb;
}
.trust-hero__media {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(239, 248, 252, 0.98),
      rgba(239, 248, 252, 0.65)
    ),
    url("/images/china-hospitals.jpg") center/cover;
  opacity: 0.48;
}
.trust-hero > .hy-container {
  position: relative;
  z-index: 1;
  padding-top: 78px;
}
.trust-hero header {
  text-align: center;
}
.trust-hero h1 {
  margin: 0;
  font-size: 43px;
}
.trust-hero header p {
  margin: 16px 0 0;
  color: #758698;
  font-size: 13px;
}
.assurance-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin-top: 48px;
}
.assurance-grid article {
  display: flex;
  min-height: 270px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 9px;
  padding: 26px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 35px rgba(25, 61, 89, 0.035);
}
.assurance-grid svg {
  width: 24px;
  color: #397af0;
}
.assurance-grid h2 {
  margin: auto 0 12px;
  white-space: pre-line;
  font-size: 18px;
  line-height: 1.45;
}
.assurance-grid span {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: #9aa5ae;
  font-size: 10px;
}
.assurance-grid span svg {
  width: 13px;
  color: inherit;
}
.assurance-grid p {
  display: none;
  margin: 10px 0 0;
  color: #6f8190;
  font-size: 10px;
  line-height: 1.7;
}
.assurance-grid article.expanded {
  min-height: 380px;
}
.assurance-grid article.expanded p {
  display: block;
}
.assurance-grid article.expanded h2 {
  margin-top: auto;
}
.faq-section {
  padding: 95px 0 100px;
}
.faq-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 90px;
}
.faq-layout aside {
  position: sticky;
  top: 130px;
  align-self: start;
}
.faq-layout aside h2 {
  margin: 0;
  font-size: 31px;
}
.faq-layout aside p {
  margin: 12px 0 0;
  color: #8695a2;
  font-size: 11px;
}
.faq-layout nav {
  display: flex;
  gap: 22px;
  overflow-x: auto;
  border-bottom: 1px solid #dae3e9;
}
.faq-layout nav button {
  flex: none;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 0 0 15px;
  background: transparent;
  color: #71869a;
  font-size: 11px;
  cursor: pointer;
}
.faq-layout nav button.active {
  border-color: #397af0;
  color: #397af0;
  font-weight: 700;
}
.faq-list article {
  border-bottom: 1px solid #dde5ea;
}
.faq-list article > button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border: 0;
  padding: 20px 0;
  background: transparent;
  color: #173b67;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.faq-list article > button svg {
  width: 16px;
  color: #55738a;
  transition: transform 0.25s ease;
}
.faq-list article.active > button svg {
  transform: rotate(180deg);
}
.faq-list p {
  margin: -5px 36px 20px 0;
  color: #718193;
  font-size: 11px;
  line-height: 1.85;
}
.accordion-panel { min-height:0; overflow:hidden; }
.accordion-enter-active,
.accordion-leave-active { overflow:hidden; transition:height .38s cubic-bezier(.22,1,.36,1),opacity .24s ease; }
.accordion-leave-active { transition-duration:.38s,.12s; }
.accordion-enter-from,
.accordion-leave-to { opacity:0; }
@media (prefers-reduced-motion: reduce) { .accordion-enter-active, .accordion-leave-active { transition:none; } }
.articles-section {
  padding: 84px 0 98px;
  background: #f4f6f8;
}
.section-title {
  text-align: center;
}
.section-title h2 {
  margin: 0;
  font-size: 33px;
}
.section-title p {
  margin: 9px 0 0;
  color: #8996a2;
  font-size: 10px;
}
.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 42px;
}
.article-grid article {
  display: flex;
  min-height: 230px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 9px;
  padding: 27px;
  background: rgba(255, 255, 255, 0.96);
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease;
}
.article-grid article:hover {
  transform: translateY(-5px);
  box-shadow: 0 17px 35px rgba(24, 59, 89, 0.08);
}
.article-grid svg {
  width: 23px;
  color: #3d7cf2;
}
.article-grid h3 {
  margin: auto 0 8px;
  font-size: 17px;
}
.article-grid p {
  margin: 0;
  color: #7d8b98;
  font-size: 10px;
}
.article-grid button {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #ed6e1f;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.article-grid button svg {
  width: 12px;
  color: inherit;
}
.toolkit-section {
  padding: 110px 0 115px;
  background: #21436c;
  color: #fff;
}
.toolkit-layout {
  display: grid;
  grid-template-columns: 330px 1fr;
  gap: 84px;
}
.toolkit-layout > aside {
  position: sticky;
  top: 130px;
  align-self: start;
  padding-top: 105px;
}
.toolkit-layout > aside h2 {
  margin: 0;
  font-size: 35px;
  line-height: 1.45;
}
.toolkit-layout > aside p {
  max-width: 250px;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.57);
  font-size: 11px;
  line-height: 1.75;
}
.toolkit-layout > div > header h3 {
  margin: 0;
  font-size: 26px;
}
.toolkit-layout > div > header p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 10px;
}
.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 35px;
}
.tool-grid article {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 9px;
  padding: 28px;
  background: #102b50;
}
.tool-grid svg {
  width: 23px;
  color: #42d6eb;
}
.tool-grid h3 {
  margin: auto 0 11px;
  font-size: 18px;
}
.tool-grid p {
  margin: 0;
  color: rgba(255, 255, 255, 0.61);
  font-size: 11px;
  line-height: 1.75;
}
.tool-grid a {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 13px;
  color: #f07a29;
  font-size: 10px;
  font-weight: 700;
}
.tool-grid a svg {
  width: 13px;
  color: inherit;
}
.trust-cta {
  padding: 78px 0;
  background: linear-gradient(103deg, #ed6d19, #a77f82 47%, #347df0);
  color: #fff;
  text-align: center;
}
.trust-cta h2 {
  margin: 0;
  font-size: 31px;
}
.trust-cta p {
  margin: 10px 0 27px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
}
.trust-cta > div > div {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.trust-cta button,
.trust-cta a {
  display: inline-flex;
  min-height: 45px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 7px;
  padding: 0 20px;
  background: transparent;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.trust-cta button:first-child {
  border: 0;
  background: rgba(255, 255, 255, 0.96);
  color: #ed6d1f;
}
.trust-cta button.dark {
  border: 0;
  background: #173b63;
  color: #fff;
}
.trust-cta svg {
  width: 15px;
}
.trust-cta small {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 17px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 9px;
}
@media (max-width: 900px) {
  .assurance-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .faq-layout {
    grid-template-columns: 240px 1fr;
    gap: 45px;
  }
  .toolkit-layout {
    grid-template-columns: 260px 1fr;
    gap: 40px;
  }
}
@media (max-width: 700px) {
  .trust-page {
    margin-top: -64px;
  }
  .trust-hero {
    padding-top: 64px;
  }
  .trust-hero > .hy-container {
    padding-top: 62px;
  }
  .trust-hero h1 {
    font-size: 34px;
  }
  .assurance-grid {
    grid-template-columns: 1fr;
  }
  .assurance-grid article,
  .assurance-grid article.expanded {
    min-height: 250px;
  }
  .faq-layout,
  .toolkit-layout {
    grid-template-columns: 1fr;
  }
  .faq-layout aside,
  .toolkit-layout > aside {
    position: static;
    padding-top: 0;
  }
  .article-grid,
  .tool-grid {
    grid-template-columns: 1fr;
  }
  .trust-cta > div > div {
    flex-direction: column;
  }
  .trust-cta button,
  .trust-cta a {
    width: 100%;
  }
  .trust-cta small {
    flex-wrap: wrap;
  }
}

/* Figma node 143:2528 exact desktop geometry. */
.trust-page {
  margin-top: -64px;
  color: #1e3a5f;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-spacing-trim: space-all;
}
.trust-page :deep(.hy-container) {
  width: min(1216px, calc(100% - 48px));
}
.trust-hero {
  position: relative;
  height: 757px;
  min-height: 0;
  overflow: hidden;
  padding: 180px 0 96px;
  background: rgba(255, 255, 255, 0.96);
}
.trust-hero__media {
  position: absolute;
  inset: 0;
  background: url("/images/figma/trust/hero-source.png") center/cover no-repeat;
  opacity: 0.4;
}
.trust-hero > .hy-container {
  position: relative;
  z-index: 1;
  padding: 0;
}
.trust-hero header {
  display: flex;
  height: 142px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.trust-hero h1 {
  margin: 0;
  color: #143162;
  font-size: 64px;
  font-weight: 600;
  line-height: 96px;
  letter-spacing: 0.35px;
}
.trust-hero header p {
  margin: 16px 0 0;
  color: #5b606a;
  font-size: 20px;
  line-height: 30px;
  letter-spacing: -0.439px;
}
.assurance-grid {
  display: grid;
  height: 373px;
  grid-template-columns: repeat(4, 286px);
  align-items: start;
  gap: 24px;
  margin-top: 48px;
}
.assurance-grid article {
  display: flex;
  width: 286px;
  height: 263px;
  min-height: 0;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 24px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 1px 20px rgba(237, 247, 254, 0.7);
  cursor: pointer;
  transition:
    height 0.52s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.assurance-grid article:hover,
.assurance-grid article:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(20, 49, 98, 0.08);
  outline: none;
}
.assurance-grid article.expanded {
  height: 373px;
  min-height: 0;
}
.assurance-grid .assurance-icon {
  display: block;
  width: 32px;
  height: 32px;
  flex: none;
}
.assurance-grid h2,
.assurance-grid article.expanded h2 {
  margin: 80px 0 16px;
  color: #1e3a5f;
  white-space: pre-line;
  font-size: 24px;
  font-weight: 600;
  line-height: 36px;
  letter-spacing: -0.439px;
}
.assurance-grid span {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
  line-height: 14px;
}
.assurance-grid span .assurance-chevron {
  display: block;
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
}
.assurance-grid article.expanded span .assurance-chevron {
  transform: rotate(180deg);
}
.assurance-grid p {
  display: none;
  margin: 16px 0 0;
  color: #4b5563;
  font-size: 16px;
  line-height: 24px;
}
.assurance-grid article:nth-child(2) {
  box-shadow: 0 1px 20px rgba(237, 247, 254, 0.5);
}
.assurance-grid article.expanded p {
  display: block;
}
.faq-section {
  height: 650.04px;
  padding: 96px 0;
  background: #fff;
}
.faq-layout {
  display: grid;
  height: 458.04px;
  grid-template-columns: 389px 802px;
  gap: 25px;
}
.faq-layout aside {
  position: sticky;
  top: 96px;
  align-self: start;
  padding-top: 20px;
}
.faq-layout aside h2 {
  margin: 0;
  color: #1e3a5f;
  font-family: "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 40px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: 0.396px;
}
.faq-layout aside p {
  margin: 16px 0 0;
  color: #6b7280;
  font-size: 16px;
  line-height: 24px;
}
.faq-layout nav {
  display: flex;
  height: 67px;
  align-items: flex-start;
  border-bottom: 1px solid #dbe3e9;
  overflow: visible;
}
.faq-layout nav strong {
  color: #3b82f6;
  font-size: 18px;
  font-weight: 600;
  line-height: 18px;
}
.faq-list article {
  border-bottom: 1px solid #dbe3e9;
}
.faq-list article > button {
  display: flex;
  width: 100%;
  min-height: 0;
  align-items: center;
  justify-content: space-between;
  border: 0;
  padding: 24px 0;
  background: transparent;
  color: #1e3a5f;
  font-size: 24px;
  font-weight: 600;
  line-height: 28.8px;
  text-align: left;
  cursor: pointer;
}
.faq-list article > button .faq-chevron {
  display: block;
  width: 24px;
  height: 24px;
  flex: none;
}
.faq-list p {
  margin: 0 38px 15.04px 0;
  color: #4b5563;
  font-size: 16px;
  line-height: 32px;
  text-align: justify;
}
.articles-section {
  height: 1136px;
  padding: 96px 0;
  background: #f5f6f7;
}
.section-title {
  height: 80px;
  text-align: center;
}
.section-title h2 {
  margin: 0;
  color: #1e3a5f;
  font-size: 40px;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: 0.4px;
}
.section-title p {
  margin: 0;
  padding-top: 16px;
  color: #6b7280;
  font-size: 16px;
  line-height: 24px;
}
.article-grid {
  display: grid;
  height: 816px;
  grid-template-columns: repeat(3, 389px);
  grid-template-rows: repeat(3, 256px);
  gap: 24px;
  margin-top: 48px;
}
.article-grid article {
  display: flex;
  width: 389px;
  height: 256px;
  min-height: 0;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 24px;
  padding: 24px;
  background: #fff;
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease;
}
.article-grid article:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 40px rgba(20, 49, 98, 0.08);
}
.article-grid .article-icon {
  display: block;
  width: 32px;
  height: 32px;
}
.article-grid h3 {
  margin: auto 0 12px;
  color: #1e3a5f;
  font-size: 24px;
  font-weight: 600;
  line-height: 24px;
}
.article-grid article:nth-child(-n + 3) h3 {
  letter-spacing: -0.439px;
}
.article-grid p {
  margin: 0;
  color: #4b5563;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.15px;
}
.article-grid button {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #dd6b20;
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;
}
.article-grid button .arrow-icon {
  display: block;
  width: 16px;
  height: 16px;
}
.jci-dialog-backdrop { position:fixed; inset:0; z-index:160; display:grid; place-items:center; padding:24px; background:rgba(12,25,42,.56); backdrop-filter:blur(5px); }
.jci-dialog { position:relative; width:min(650px,100%); max-height:min(620px,calc(100vh - 48px)); overflow:auto; box-sizing:border-box; border-radius:16px; padding:24px; background:#fff; color:#1e3a5f; box-shadow:0 24px 80px rgba(15,33,62,.24); }
.jci-dialog h2 { margin:0; padding-right:32px; color:#1e3a5f; font-size:26px; font-weight:600; line-height:32px; letter-spacing:.1px; }
.jci-dialog-lead { margin:4px 0 0; color:#6b7280; font-size:13px; line-height:20px; }
.jci-dialog-copy { margin-top:22px; color:#4b5563; font-size:13px; line-height:1.85; }
.jci-dialog-copy p { margin:0 0 10px; }
.jci-dialog-copy p:last-child { margin-bottom:0; }
.jci-dialog-close { position:absolute; top:16px; right:16px; display:grid; width:28px; height:28px; place-items:center; border:0; border-radius:50%; background:transparent; color:#1e3a5f; cursor:pointer; transition:background .2s ease,transform .25s ease; }
.jci-dialog-close:hover { background:#eef4f8; transform:rotate(90deg); }
.jci-dialog-close:focus-visible { outline:2px solid #2563eb; outline-offset:2px; }
.jci-dialog-enter-active,.jci-dialog-leave-active { transition:opacity .24s ease; }
.jci-dialog-enter-active .jci-dialog,.jci-dialog-leave-active .jci-dialog { transition:transform .34s cubic-bezier(.22,1,.36,1),opacity .24s ease; }
.jci-dialog-enter-from,.jci-dialog-leave-to { opacity:0; }
.jci-dialog-enter-from .jci-dialog,.jci-dialog-leave-to .jci-dialog { opacity:0; transform:translateY(14px) scale(.98); }
.toolkit-scroll {
  position: relative;
  background: #1e3a5f;
}
.toolkit-section {
  position: relative;
  display: flex;
  height: 754px;
  flex-direction: column;
  justify-content: center;
  padding: 96px 0;
  background: #1e3a5f;
  color: #fff;
}
.toolkit-section--stage-1 { height: 1275px; }
.toolkit-section--stage-1 .tool-grid { height: 963px; margin-top: 48px; grid-template-rows: repeat(3, 305px); }
.toolkit-section--stage-1 .tool-grid article { height: 305px; }
.toolkit-section--stage-2 .tool-grid { height: 304px; margin-top: 48px; }
.toolkit-section--stage-2 .tool-grid article { height: 304px; }
.toolkit-layout {
  display: grid;
  height: auto;
  grid-template-columns: 389px 802px;
  gap: 25px;
  align-items: start;
}
.toolkit-stages { min-width: 0; }
.toolkit-layout > .toolkit-sticky {
  position: sticky;
  top: max(96px, calc(50vh - 110px));
  align-self: start;
  /* Keep the pinned copy inside the authored section padding at both edges. */
  margin-block: 96px;
  padding: 0;
}
.toolkit-layout > aside h2 {
  margin: 0;
  color: #fff;
  font-size: 40px;
  font-weight: 600;
  line-height: 60px;
  letter-spacing: 0.4px;
}
.toolkit-layout > aside p {
  width: 300px;
  max-width: none;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 28px;
}
.toolkit-section > header {
  height: 88px;
}
.toolkit-section > header h3 {
  margin: 0;
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0.4px;
}
.toolkit-section > header p {
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 24px;
}
.tool-grid {
  display: grid;
  height: 305px;
  grid-template-columns: repeat(2, 389px);
  gap: 24px;
  margin-top: 31px;
}
.tool-grid article {
  display: flex;
  width: 389px;
  height: 305px;
  min-height: 0;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 24px;
  padding: 24px;
  background: #0f213e;
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease;
}
.tool-grid article:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 45px rgba(5, 19, 42, 0.24);
}
.tool-grid .tool-icon {
  display: block;
  width: 32px;
  height: 32px;
}
.tool-grid h3 {
  margin: auto 0 12px;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.439px;
}
.tool-grid p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 24px;
}
.tool-grid a {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  color: #dd6b20;
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
}
.tool-grid a .arrow-icon {
  display: block;
  width: 16px;
  height: 16px;
}
.tool-action-pending {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  color: #dd6b20;
  font-size: 16px;
  font-weight: 500;
  line-height: 16px;
  cursor: default;
}
.tool-action-pending .arrow-icon { display: block; width: 16px; height: 16px; }
.trust-cta {
  height: 412px;
  padding: 96px 0;
  background: linear-gradient(90deg, #dd6b20 0%, #3b82f6 100%);
  color: #fff;
  text-align: center;
}
.trust-cta > .hy-container {
  height: 220px;
}
.trust-cta h2 {
  margin: 0;
  font-size: 40px;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: 0.396px;
}
.trust-cta p {
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-family: "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.3125px;
}
.trust-cta > div > div {
  display: flex;
  height: 96px;
  align-items: flex-start;
  justify-content: center;
  gap: 16px;
  padding-top: 48px;
}
.trust-cta button,
.trust-cta a {
  display: inline-flex;
  height: 48px;
  min-height: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px solid #fff;
  border-radius: 14px;
  padding: 0 24px;
  background: transparent;
  color: #fff;
  font-family: "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.trust-cta button:hover,
.trust-cta a:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(20, 49, 98, 0.2);
}
.trust-cta button:first-child {
  border: 0;
  background: #fff;
  box-shadow: 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  color: #dd6b20;
  line-height: 16px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.15px;
}
.trust-cta a,
.trust-cta button.dark {
  letter-spacing: -0.3125px;
}
.trust-cta button.dark {
  border: 0;
  background: #1e3a5f;
  box-shadow:
    0 1px 2px -1px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.1);
  color: #fff;
}
.trust-cta .cta-icon {
  display: block;
  width: 20px;
  height: 20px;
}
.trust-cta small {
  display: flex;
  justify-content: center;
  gap: 16px;
  height: 40px;
  align-items: flex-start;
  margin-top: 0;
  padding-top: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-family: "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  line-height: 16px;
}
.trust-cta small span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.trust-cta small img {
  display: block;
  width: 12px;
  height: 12px;
}
@media (max-width:1199px) and (min-width:701px) {
  .assurance-grid { grid-template-columns:repeat(4,minmax(0,1fr)); }
  .assurance-grid article { width:100%; min-width:0; }
  .faq-layout { grid-template-columns:minmax(220px,389px) minmax(0,1fr); }
  .article-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .article-grid article { width:100%; min-width:0; }
  .toolkit-layout { grid-template-columns:minmax(220px,389px) minmax(0,1fr); }
  .toolkit-layout > aside p { width:100%; }
  .tool-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .tool-grid article { width:100%; min-width:0; }
}
@media (max-width: 900px) {
  .trust-page :deep(.hy-container) {
    width: calc(100% - 40px);
  }
  .trust-hero,
  .faq-section,
  .articles-section,
  .toolkit-section,
  .trust-cta {
    height: auto;
  }
  .trust-hero {
    padding-inline: 0;
  }
  .assurance-grid {
    width: 100%;
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .assurance-grid article,
  .assurance-grid article.expanded {
    width: 100%;
  }
  .faq-layout,
  .toolkit-layout {
    height: auto;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 32px;
  }
  .article-grid {
    width: 100%;
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
  }
  .article-grid article,
  .tool-grid article {
    width: 100%;
  }
  .tool-grid {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .trust-page :deep(.hy-container) {
    width: calc(100% - 32px);
  }
  .trust-hero {
    padding: 120px 0 64px;
  }
  .trust-hero header {
    height: auto;
  }
  .trust-hero h1 {
    font-size: 36px;
    line-height: 46px;
  }
  .trust-hero header p {
    margin-top: 14px;
    font-size: 14px;
    line-height: 22px;
  }
  .assurance-grid {
    grid-template-columns: 1fr;
    margin-top: 40px;
  }
  .assurance-grid article {
    height: 253px;
  }
  .assurance-grid article.expanded {
    height: 373px;
  }
  .faq-section,
  .articles-section,
  .toolkit-section,
  .trust-cta {
    padding: 64px 0;
  }
  .faq-layout,
  .toolkit-layout {
    display: block;
  }
  .faq-layout aside,
  .toolkit-layout > aside {
    position: static;
    padding: 0 0 40px;
  }
  .toolkit-layout > .toolkit-sticky {
    position: static;
    top: auto;
    margin-block: 0;
  }
  .faq-layout aside h2,
  .section-title h2,
  .toolkit-layout > aside h2,
  .trust-cta h2 {
    font-size: 30px;
    line-height: 40px;
  }
  .faq-list article > button {
    min-height: 68px;
    font-size: 18px;
    line-height: 28px;
  }
  .faq-list p {
    margin-right: 24px;
    font-size: 14px;
    line-height: 24px;
  }
  .article-grid,
  .tool-grid {
    grid-template-columns: 1fr;
  }
  .article-grid article {
    height: 240px;
  }
  .toolkit-section {
    display: block;
  }
  .toolkit-section--stage-1,
  .toolkit-section--stage-2 { height: auto; }
  .toolkit-section--stage-1 .tool-grid { height: auto; grid-template-rows: none; }
  .toolkit-section--stage-1 .tool-grid article { height: 300px; }
  .toolkit-section--stage-2 .tool-grid { height: auto; }
  .toolkit-layout > aside p {
    width: auto;
  }
  .toolkit-layout > div > header {
    height: auto;
  }
  .toolkit-layout > div > header h3 {
    font-size: 26px;
    line-height: 36px;
  }
  .tool-grid {
    height: auto;
    margin-top: 32px;
  }
  .tool-grid article {
    height: 300px;
  }
  .trust-cta > .hy-container {
    height: auto;
  }
  .trust-cta p {
    margin: 14px 0 28px;
    font-size: 14px;
  }
  .trust-cta > div > div {
    height: auto;
    flex-direction: column;
    padding-top: 0;
  }
  .trust-cta button,
  .trust-cta a {
    width: 100%;
    height: 48px;
  }
  .trust-cta small {
    flex-wrap: wrap;
    margin-top: 20px;
    padding-top: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .assurance-grid article,
  .assurance-grid span .assurance-chevron,
  .article-grid article,
  .tool-grid article {
    transition: none;
  }
}
</style>
