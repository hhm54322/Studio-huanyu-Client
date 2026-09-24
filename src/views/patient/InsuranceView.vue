<script setup lang="ts">
import { ref } from 'vue'

const scenario = ref(-1)
const activeStep = ref(0)
const activeFaq = ref(0)
const scenarios = [
  { icon: '/images/figma/insurance/Icon-17.svg', title: '计划来华治疗', copy: '主动跨境就医通常不在常规住院保障内。出行前务必确认保单条款，即使不覆盖，费用仍可能比本国低60一72%。', action: '如何预审' },
  { icon: '/images/figma/insurance/Icon-15.svg', title: '在华突发就医', copy: '旅行险通常覆盖意外与急症。请先确认保单是否覆盖中国医院，并保留全部单据。', action: '材料清单' },
  { icon: '/images/figma/insurance/Icon-11.svg', title: '术后并发症保障', copy: '专保二次手术、延长住院与药费。建议术前购买，所有手术患者均推荐配置。', action: '了解详情' },
]
const paths = [
  { tone: 'blue', title: '直付', tag: '最便捷', percent: '95%+', copy: '无需垫付大额费用 · 入院最快1-3天', items: ['保险在直赔网络内', '已获预授权', '已出示保险卡'], action: '了解直付流程' },
  { tone: 'orange', title: '先付后垫', tag: '最常见', percent: '70-85%', copy: '平台代整理材料 · 任何保险都可尝试', items: ['保单覆盖中国治疗', '不在直赔网络内', '时间充裕'], action: '查看材料清单' },
  { tone: 'navy', title: '理赔协助', tag: '最省心', percent: '90%+', copy: '一对一专业协助 · 可协商分期垫付', items: ['不确定是否覆盖', '理赔被拒需申诉', '有语言障碍'], action: '咨询理赔顾问' },
]
const stepDetails = [
  { title: '01 治疗前 · 确认与授权', lead: '平台协助：免费预审保单+担保信申请代办', copy: '· 向保险公司确认保单覆盖范围、自付额、共付比例\n· 如需直付，提交担保信（GoC）申请，1-3个工作日\n· 保留原始医疗文件与诊断报告，供后续核对' },
  { title: '02 治疗中 · 收集与留存', lead: '平台协助：同步整理中英双语费用材料', copy: '· 按医院节点收集发票、费用明细和检查报告\n· 及时补齐保险公司要求的授权和医疗记录\n· 每次支付保留原始凭证，避免后续补件' },
  { title: '03 出院后 · 整理与申请', lead: '平台协助：出具双语清单，核对理赔字段', copy: '· 获取出院小结、诊断证明与完整费用清单\n· 按保险公司格式填写理赔申请表\n· 提交前由顾问复核材料完整性' },
  { title: '04 理赔跟进 · 补件与到账', lead: '平台协助：48h内补件，持续跟进到账', copy: '· 收到补件通知后在48小时内响应\n· 顾问协助与保险公司沟通理赔进度\n· 通常30-60天完成审核并到账' },
]
const faqs = [
  ['我的国际医疗保险能覆盖来华就医吗？', '这取决于您的具体保单条款。大多数高端国际医疗保险（如Bupa、Cigna、AXA等）包含全球或亚洲地区就医保障，在中国治疗通常属于可报销范围。寰宇云医与10余家国际主流保险公司建立了直赔合作网络，可为您确认报销范围和直付资格。'],
  ['什么是担保信(Guarantee Letter)？我需要吗？', '担保信是保险公司向医院出具的费用担保文件。走直付路径时，医院通常会要求在治疗前取得担保信。'],
  ['直赔和先付后赔有什么区别？', '直赔由保险公司与医院直接结算；先付后赔则由患者先支付，再提交发票、病历和付款凭证申请报销。'],
  ['没有保险，来华就医还划算吗？', '没有现有保险时仍可使用自费路径。我们会先提供透明的医院报价和支付节点，不把保险作为就医前提。'],
  ['治疗结束后如何向保险公司申请理赔？', '保留发票、费用明细、病历、检查报告和出院小结，按保险公司的线上或线下渠道提交即可。'],
  ['并发症保险是什么？我需要买吗？', '并发症保障针对治疗后发生的特定风险，是否需要购买要结合治疗类型、原保单和预算判断。'],
  ['寰宇云医能帮我联系保险公司吗？', '可以。顾问会协助整理医疗资料、翻译关键文件并陪同沟通，但最终承保和理赔决定由保险公司作出。'],
  ['费用清单和医疗报告能提供英文版吗？', '可以按保险公司的格式准备中英双语材料，避免因翻译或字段缺失造成补件。'],
  ['如果保险公司拒绝理赔怎么办？', '先核对拒赔理由与保单条款，再由顾问协助准备补充材料或发起复议。'],
  ['我可以同时使用旅行险和医疗险吗？', '可以分别按两份保单的承保范围申请，但同一笔费用不能重复报销。'],
]
function openConsultation() {
  window.dispatchEvent(new CustomEvent('open-consultation'))
}

function openPathAction(index: number) {
  if (index === 2) {
    openConsultation()
    return
  }
  activeStep.value = index === 0 ? 0 : 1
  document.querySelector('.insurance-steps')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <div class="insurance-page">
    <section class="insurance-hero">
      <div class="insurance-hero__backdrop" />
      <div class="hy-container insurance-hero__inner" data-reveal>
        <h1>您的保险，能不能在华就医?</h1>
        <p>1分钟评估，确认覆围与直付资格，避风险。</p>
        <div class="insurance-hero__filters" data-figma-node="419:72">
          <label><span>保险公司</span><select aria-label="保险公司"><option>请选择</option><option>Allianz</option><option>Cigna</option></select><img src="/images/figma/insurance/Icon-12.svg" alt="" /></label>
          <label><span>计划来华时间</span><select aria-label="计划来华时间"><option>请选择</option><option>治疗前</option><option>治疗中</option><option>治疗后</option></select><img src="/images/figma/insurance/Icon-12.svg" alt="" /></label>
          <label><span>能否接受垫付</span><select aria-label="能否接受垫付"><option>请选择</option><option>可以</option><option>不可以</option></select><img src="/images/figma/insurance/Icon-12.svg" alt="" /></label>
        </div>
        <button class="insurance-primary insurance-primary--navy" type="button" @click="$router.push('/report')"><img src="/images/figma/insurance/Icon-13.svg" alt="" />立即评估</button>
      </div>
    </section>

    <section class="insurance-scenarios">
      <div class="hy-container">
        <h2 data-reveal>您属于哪种就医场景?</h2>
        <div class="insurance-scenario-grid">
          <article v-for="(item, index) in scenarios" :key="item.title" :class="{ active: index === scenario }" :style="{ '--reveal-delay': `${index * 70}ms` }" data-reveal tabindex="0" @click="scenario = index" @keydown.enter.prevent="scenario = index" @keydown.space.prevent="scenario = index">
            <img class="insurance-scenario-icon" :src="item.icon" alt="" />
            <div class="insurance-scenario-body"><h3>{{ item.title }}</h3><p>{{ item.copy }}</p><button type="button">{{ item.action }} <img src="/images/figma/insurance/Icon-16.svg" alt="" /></button></div>
          </article>
        </div>
      </div>
    </section>

    <section class="insurance-steps">
      <div class="hy-container">
        <h2 data-reveal>先付后赔4步走</h2><p class="insurance-section-copy">点击步骤卡片后出现详情</p>
        <div class="insurance-step-line"><div v-for="(item, index) in ['治疗前','治疗中','出院后','理赔跟进']" :key="item" :class="{ active: index === activeStep }" @click="activeStep = index"><span>0{{ index + 1 }}</span><b>{{ item }}</b><small>{{ ['确认保单范围，获取预授权','收集凭证，出具双语清单','出具报告，填写申请表','48h内补件，30-60天到账'][index] }}</small></div></div>
        <div class="insurance-step-note"><b>{{ stepDetails[activeStep].title }}</b><strong>{{ stepDetails[activeStep].lead }}</strong><p>{{ stepDetails[activeStep].copy }}</p></div>
      </div>
    </section>

    <section class="insurance-paths">
        <div class="hy-container"><h2 data-reveal>三条报销路径</h2><div class="insurance-path-grid"><article v-for="(path, index) in paths" :key="path.title" :class="`insurance-path-card--${path.tone}`" :style="{ '--reveal-delay': `${index * 70}ms` }" data-reveal><header><div><h3>{{ path.title }}</h3><small>{{ path.copy }}</small></div><span>{{ path.tag }}</span></header><div class="insurance-path-rate"><strong>{{ path.percent }}</strong><em>成功率</em></div><div class="insurance-path-conditions"><h4>适合条件：</h4><ul><li v-for="item in path.items" :key="item"><img src="/images/figma/insurance/Icon-10.svg" alt="" />{{ item }}</li></ul></div><button type="button" @click="openPathAction(index)">{{ path.action }} <img src="/images/figma/insurance/Icon-16.svg" alt="" /></button></article></div></div>
    </section>

    <section class="insurance-compare"><div class="hy-container"><h2 data-reveal>三条路径对比一览</h2><table data-reveal><thead><tr><th>对比维度</th><th>直付</th><th>先付后垫</th><th>理赔协助</th></tr></thead><tbody><tr><th>入院速度</th><td>1-3天</td><td>3-7天</td><td>视协商</td></tr><tr><th>垫付金额</th><td>仅自付部分</td><td>全额垫付</td><td>可分期</td></tr><tr><th>理赔成功率</th><td>95%+</td><td>70-85%</td><td>90%+</td></tr><tr><th>适用保险</th><td>直赔网络内</td><td>任何保险</td><td>任何保险</td></tr></tbody></table><small>以上数据仅供参考，具体成功率因保险公司和个案而异</small></div></section>

    <section class="insurance-partners"><div><header data-reveal><h2>直赔合作保险公司</h2><p>即使在列表中，仍需确认具体保单是否覆盖、是否需要担保信、自付额与共付比例，顾问会为您逐条核对</p></header><img src="/images/figma/partners-matrix.png" alt="直赔合作保险公司" /></div></section>

    <section class="insurance-faq"><div class="hy-container"><div class="insurance-faq-title" data-reveal><h2>保险常见问题解答</h2></div><div class="insurance-faq-list" data-reveal><article v-for="(item, index) in faqs" :key="item[0]" :class="{ active: activeFaq === index }"><button type="button" :aria-expanded="activeFaq === index" @click="activeFaq = activeFaq === index ? -1 : index"><span>{{ item[0] }}</span><img :src="activeFaq === index ? '/images/figma/insurance/Icon-7.svg' : '/images/figma/insurance/Icon-6.svg'" alt="" /></button><p v-if="activeFaq === index">{{ item[1] }}</p></article></div></div></section>

    <section class="insurance-cta"><div class="hy-container" data-reveal><h2>不确定保险能否覆盖？免费咨询保险顾问</h2><p>1对1保单解读 · 直付资格确认 · 担保信申请 · 理赔跟进</p><div><button class="insurance-primary insurance-primary--orange" type="button" @click="openConsultation"><img src="/images/figma/insurance/Frame.svg" alt="" />咨询在线客服</button><button class="insurance-primary insurance-primary--navy" type="button" @click="openConsultation"><img src="/images/figma/insurance/Icon-8.svg" alt="" />发送邮件咨询</button><button class="insurance-secondary" type="button" @click="openConsultation"><img src="/images/figma/insurance/Icon-5.svg" alt="" />预约视频咨询</button></div><small>24小时内响应　　结果不构成保险承诺，以保单条款为准</small></div></section>
  </div>
</template>

<style scoped>
.insurance-page { margin-top: -64px; color: #173b67; }
.insurance-page :deep(.hy-container) { width: min(1216px, calc(100% - 64px)); margin: 0 auto; }
.insurance-page h1,.insurance-page h2,.insurance-page h3,.insurance-page p { margin: 0; }
.insurance-hero { position: relative; height: 757px; padding: 180px 112px 96px; overflow: hidden; background: #fff; box-sizing: border-box; }
.insurance-hero__backdrop { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,.58), rgba(255,255,255,.84)), url('/images/figma/patient-hero.png') center/cover; }
.insurance-hero__inner { position: relative; z-index: 1; display: grid; width: min(1136px, 100%); justify-items: center; padding: 0; text-align: center; }
.insurance-hero h1 { color: #143162; font-size: 64px; font-weight: 600; line-height: 96px; letter-spacing: .35px; }
.insurance-hero p { margin-top: 24px; color: #5b606a; font-size: 20px; line-height: 29px; }
.insurance-hero__filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); width: min(1120px, 100%); gap: 16px; margin-top: 60px; }
.insurance-hero label { position: relative; display: grid; gap: 16px; padding-bottom: 16px; text-align: left; }
.insurance-hero label span { color: #1e3a5f; font-size: 16px; font-weight: 500; line-height: 16px; }
.insurance-hero select { height: 56px; appearance: none; border: 1px solid #d9dde2; border-radius: 16px; padding: 0 48px 0 16px; background: #fff; color: #9ca3af; font-size: 16px; }
.insurance-hero label svg { position: absolute; right: 16px; bottom: 33px; width: 16px; color: #1e3a5f; }
.insurance-primary,.insurance-secondary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-width: 150px; min-height: 52px; border: 0; border-radius: 14px; padding: 16px 24px; background: linear-gradient(90deg, #dd6b20, #3b82f6); color: #fff; font-size: 16px; font-weight: 600; line-height: 16px; cursor: pointer; box-shadow: 0 4px 6px -4px rgba(0,0,0,.1); }
.insurance-primary svg { width: 16px; }
.insurance-hero .insurance-primary { margin-top: 16px; }
.insurance-scenarios { min-height: 901px; padding: 96px 0; background: #fff; box-sizing: border-box; }
.insurance-scenarios h2,.insurance-steps h2,.insurance-paths h2,.insurance-compare h2,.insurance-partners h2 { text-align: center; color: #1e3a5f; font-size: 40px; font-weight: 600; line-height: 40px; letter-spacing: .4px; }
.insurance-scenario-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: 48px; }
.insurance-scenario-grid article { min-height: 302px; border-radius: 24px; padding: 24px; background: #f5f6f7; cursor: pointer; transition: transform .25s ease, background .25s ease; box-sizing: border-box; }
.insurance-scenario-grid article:hover,.insurance-scenario-grid article.active { transform: translateY(-4px); background: #f0f5fb; }
.insurance-scenario-grid svg { width: 20px; color: #4c83ef; }
.insurance-scenario-grid h3 { margin-top: 32px; color: #1e3a5f; font-size: 24px; font-weight: 600; line-height: 24px; }
.insurance-scenario-grid p { margin-top: 16px; color: #4b5563; font-size: 16px; line-height: 24px; }
.insurance-scenario-grid button { display: inline-flex; align-items: center; gap: 4px; margin-top: 16px; border: 0; background: transparent; color: #1e3a5f; font-size: 14px; font-weight: 500; line-height: 14px; }
.insurance-scenario-grid button svg { width: 13px; }
.insurance-steps { min-height: 788px; padding: 96px 40px; background: #1e3a5f; color: #fff; box-sizing: border-box; }
.insurance-section-copy { margin-top: 16px !important; color: rgba(255,255,255,.7); text-align: center; font-size: 16px; line-height: 24px; }
.insurance-step-line { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-top: 68px; }
.insurance-step-line > div { position: relative; display: grid; justify-items: center; gap: 13px; text-align: center; cursor: pointer; }
.insurance-step-line > div:not(:last-child)::after { position: absolute; top: 27px; left: calc(50% + 32px); width: calc(100% - 64px); height: 1px; background: rgba(255,255,255,.2); content: ''; }
.insurance-step-line span { display: grid; width: 80px; height: 80px; place-items: center; border: 20px solid rgba(255,255,255,.12); border-radius: 50%; background: #2563eb; color: #fff; font-size: 32px; font-weight: 600; line-height: 80px; box-sizing: border-box; }
.insurance-step-line .active span { border-color: #27d6f3; background: #267fa2; color: #fff; }
.insurance-step-line b { font-size: 24px; line-height: 24px; }.insurance-step-line small { color: rgba(255,255,255,.72); font-size: 16px; line-height: 24px; }
.insurance-step-note { margin: 0 auto; max-width: 1126px; border-radius: 16px; padding: 32px; background: #143162; }
.insurance-step-note b { display:block; font-size: 24px; line-height: 32px; }.insurance-step-note strong { display:block; margin-top: 8px; font-size: 14px; line-height: 14px; font-weight: 400; }.insurance-step-note p { margin-top: 20px; color: rgba(255,255,255,.8); font-size: 16px; line-height: 26px; white-space: pre-line; }
.insurance-paths { min-height: 834px; padding: 96px 40px; background: #f5f6f7; box-sizing: border-box; }.insurance-paths .insurance-section-copy { color: #8797a5; }
.insurance-path-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: 48px; }.insurance-path-grid article { min-height: 500px; border-radius: 24px; padding: 24px; background: #fff; box-shadow: none; }
.insurance-path-grid header { display:flex; justify-content:space-between; gap: 10px; }.insurance-path-grid h3 { color:#1e3a5f; font-size: 24px; line-height:24px; }.insurance-path-grid header small { display:block; margin-top: 16px; color:#4b5563; font-size: 16px; line-height:24px; }.insurance-path-grid header span { height: 30px; border-radius: 16px; padding: 8px 12px; background:#fcebdc; color:#e66e1b; font-size:14px; line-height:14px; white-space:nowrap; }.insurance-path-grid article > strong { display:block; margin-top:24px; padding:12px; border-radius:16px; background:#2563eb; color:#fff; text-align:center; font-size:24px; line-height:32px; }.insurance-path-grid article > em { display:block; color:#fff; font-size:12px; font-style:normal; text-align:center; margin-top:-32px; transform:translateY(28px); }.insurance-path-grid h4 { margin:32px 0 0; color:#1e3a5f; font-size:16px; font-weight:400; line-height:16px; }.insurance-path-grid ul { display:grid; gap:16px; margin:16px 0 0; padding:0; list-style:none; color:#4b5563; font-size:16px; line-height:20px; }.insurance-path-grid li { display:flex; align-items:center; gap:12px; }.insurance-path-grid li svg { width:20px; color:#2563eb; }.insurance-path-grid button { display:inline-flex; align-items:center; gap:4px; margin-top:16px; border:0; background:transparent; color:#1e3a5f; font-size:14px; font-weight:500; }.insurance-path-grid button svg { width:12px; }
.insurance-compare { min-height: 660px; padding: 96px 0; background:#fff; box-sizing:border-box; }.insurance-compare table { width:100%; margin-top:48px; border-collapse:separate; border-spacing:0 10px; text-align:center; font-size:16px; }.insurance-compare th,.insurance-compare td { height:56px; background:#f5f6f7; color:#768a9a; }.insurance-compare th:first-child { width:25%; border-radius:16px 0 0 16px; color:#526f85; }.insurance-compare th:last-child,.insurance-compare td:last-child { border-radius:0 16px 16px 0; }.insurance-compare small { display:block; color:#9ca3af; text-align:center; font-size:14px; }
.insurance-partners { min-height: 660px; padding:96px 0; background:#f5f6f7; box-sizing:border-box; }.insurance-partners p { margin-top:16px; color:#6b7280; text-align:center; font-size:16px; line-height:24px; }.insurance-partners img { display:block; width:100%; margin-top:48px; border-radius:16px; }
.insurance-faq { min-height: 850px; padding:96px 0; background:#fff; box-sizing:border-box; }.insurance-faq .hy-container { display:grid; grid-template-columns: 389px 1fr; gap:80px; }.insurance-faq-title h2 { color:#1e3a5f; font-size:40px; line-height:40px; }.insurance-faq-title p { margin-top:16px; color:#6b7280; font-size:16px; line-height:24px; }.insurance-faq-list article { border-bottom:1px solid #e7edf1; }.insurance-faq-list button { display:flex; width:100%; align-items:center; justify-content:space-between; border:0; padding:24px 0; background:transparent; color:#1e3a5f; text-align:left; font-size:24px; line-height:28.8px; cursor:pointer; }.insurance-faq-list button svg { width:24px; color:#1e3a5f; transition:transform .2s; }.insurance-faq-list article.active button svg { transform:rotate(180deg); }.insurance-faq-list p { width:min(803px,100%); padding:0 0 23px; color:#4b5563; font-size:16px; line-height:24px; }
.insurance-cta { min-height: 685px; padding:96px 0; background:linear-gradient(180deg,#f5f6f7,#f5f6f7),linear-gradient(90deg,#dd6b20,#3b82f6); text-align:center; box-sizing:border-box; }.insurance-cta h2 { color:#1e3a5f; font-size:40px; line-height:40px; letter-spacing:.4px; }.insurance-cta p { margin-top:16px; color:#6b7280; font-size:16px; line-height:24px; }.insurance-cta > .hy-container > div { display:flex; justify-content:center; gap:16px; margin-top:48px; }.insurance-secondary { border:2px solid #1e3a5f; background:transparent; color:#1e3a5f; }.insurance-cta small { display:block; margin-top:18px; color:#9ca3af; font-size:14px; }
@media (max-width: 700px) { .insurance-page { margin-top:-64px; }.insurance-page :deep(.hy-container) { width:calc(100% - 32px); }.insurance-hero { height:auto; min-height:700px; padding:120px 16px 72px; }.insurance-hero__inner { padding-top:0; }.insurance-hero h1 { font-size:32px; line-height:1.2; letter-spacing:0; }.insurance-hero p { font-size:16px; line-height:24px; }.insurance-hero__filters,.insurance-scenario-grid,.insurance-path-grid,.insurance-faq .hy-container { grid-template-columns:1fr; }.insurance-hero__filters { width:100%; margin-top:40px; }.insurance-scenarios,.insurance-steps,.insurance-paths,.insurance-compare,.insurance-partners,.insurance-faq,.insurance-cta { height:auto; min-height:0; padding:72px 0; }.insurance-scenario-grid,.insurance-path-grid { gap:16px; }.insurance-step-line { gap:10px; margin-top:54px; }.insurance-step-line > div:not(:last-child)::after { display:none; }.insurance-step-line b { font-size:11px; }.insurance-step-line small { display:none; }.insurance-step-note { margin-top:48px; }.insurance-compare table { font-size:10px; }.insurance-partners img { margin-top:34px; }.insurance-faq .hy-container { gap:35px; }.insurance-cta > .hy-container > div { flex-direction:column; align-items:center; } }
</style>

<style scoped>
/* Locked to Figma frame 419:31. These values override the earlier draft CSS. */
.insurance-page [data-reveal] { will-change: auto; }
.insurance-hero__backdrop { background: #fff url('/images/figma/insurance/hero.png') center / cover no-repeat; }
.insurance-hero__inner { display: flex; flex-direction: column; align-items: center; gap: 60px; }
.insurance-hero__filters { margin-top: 0; }
.insurance-hero label { padding-bottom: 0; }
.insurance-hero select { border-color: #dbeafe; line-height: 16px; }
.insurance-hero label > img { position: absolute; right: 21px; bottom: 25px; width: 10px; height: 6px; }
.insurance-hero .insurance-primary { margin-top: 0; }
.insurance-primary,.insurance-secondary { background: #1e3a5f; transition: transform .24s cubic-bezier(.22,1,.36,1), box-shadow .24s ease; }
.insurance-primary:hover,.insurance-secondary:hover { transform: translateY(-3px); box-shadow: 0 10px 22px -12px rgba(2,29,46,.48); }
.insurance-primary img,.insurance-secondary img { width: 20px; height: 20px; object-fit: contain; }
.insurance-primary--orange { background: #dd6b20; }
.insurance-primary--navy { background: #1e3a5f; }

.insurance-scenarios { height: 582px; min-height: 0; }
.insurance-scenario-grid article { display: flex; height: 302px; min-height: 0; flex-direction: column; gap: 80px; transition: transform .28s cubic-bezier(.22,1,.36,1), background .28s ease, box-shadow .28s ease; }
.insurance-scenario-grid article:hover,.insurance-scenario-grid article.active { transform: translateY(-6px); box-shadow: 0 22px 36px -30px rgba(30,58,95,.5); }
.insurance-scenario-icon { width: 32px; height: 32px; object-fit: contain; }
.insurance-scenario-body { width: 100%; }
.insurance-scenario-grid h3 { margin-top: 0; }
.insurance-scenario-grid button { display: flex; width: 100%; justify-content: space-between; gap: 0; padding: 0; color: #9ca3af; }
.insurance-scenario-grid button img { width: 14px; height: 14px; transition: transform .2s ease; }
.insurance-scenario-grid article:hover button img,.insurance-scenario-grid article.active button img { transform: translateY(2px); }

.insurance-paths { height: 690px; min-height: 0; }
.insurance-path-grid article { position: relative; display: flex; height: 410px; min-height: 0; flex-direction: column; align-items: flex-start; gap: 24px; overflow: hidden; box-sizing: border-box; transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease; }
.insurance-path-grid article:hover { transform: translateY(-6px); box-shadow: 0 24px 42px -34px rgba(30,58,95,.5); }
.insurance-path-grid header { width: 100%; }
.insurance-path-grid header span { position: absolute; top: 16px; right: 24px; box-sizing: border-box; background: rgba(37,99,235,.1); color: #2563eb; }
.insurance-path-card--orange header span { background: rgba(221,107,32,.1); color: #dd6b20; }
.insurance-path-card--navy header span { background: rgba(30,58,95,.1); color: #1e3a5f; }
.insurance-path-rate { display: flex; width: 100%; flex-direction: column; align-items: center; border-radius: 16px; padding: 12px; background: #2563eb; color: #fff; box-sizing: border-box; }
.insurance-path-card--orange .insurance-path-rate { background: #f97316; }
.insurance-path-card--navy .insurance-path-rate { background: #1e3a5f; }
.insurance-path-rate strong { font-size: 24px; font-weight: 800; line-height: 32px; }
.insurance-path-rate em { opacity: .9; font-size: 12px; font-style: normal; line-height: 16px; }
.insurance-path-conditions { display: flex; flex-direction: column; gap: 16px; }
.insurance-path-grid h4 { margin: 0; color: #4b5563; font-weight: 400; }
.insurance-path-grid ul { margin: 0; color: #1e3a5f; }
.insurance-path-grid li img { width: 20px; height: 20px; }
.insurance-path-grid button { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 0; margin-top: 0; padding: 0; color: #9ca3af; }
.insurance-path-grid button img { width: 14px; height: 14px; }

.insurance-compare { height: 667px; min-height: 0; }
.insurance-partners { height: 791px; min-height: 0; overflow: hidden; }
.insurance-partners > div { width: 1440px; margin: 0 auto; }
.insurance-partners header { width: 1216px; margin: 0 auto 48px; }
.insurance-partners img { width: 1440px; height: 472px; margin-top: 0; border-radius: 0; object-fit: cover; }
.insurance-faq { height: 1067px; min-height: 0; }
.insurance-faq-title { padding-top: 20px; }
.insurance-faq-title h2 { font-family: 'SF Pro Display','SF Pro Text',sans-serif; font-weight: 700; }
.insurance-faq-list button img { width: 24px; height: 24px; }
.insurance-cta { height: 412px; min-height: 0; background: #f5f6f7; }
.insurance-secondary { border: 2px solid #1e3a5f; background: transparent; color: #1e3a5f; box-shadow: none; }

@media (max-width: 700px) {
  .insurance-hero__inner { gap: 40px; }
  .insurance-hero__filters { margin-top: 0; }
  .insurance-scenarios,.insurance-paths,.insurance-compare,.insurance-partners,.insurance-faq,.insurance-cta { height: auto; }
  .insurance-scenario-grid article,.insurance-path-grid article { height: auto; min-height: 302px; }
  .insurance-step-line span { width: 58px; height: 58px; border-width: 12px; font-size: 20px; line-height: 58px; }
  .insurance-step-note { padding: 24px; }
  .insurance-compare { overflow-x: auto; }
  .insurance-compare .hy-container { min-width: 680px; }
  .insurance-partners > div { width: 100%; }
  .insurance-partners header { width: calc(100% - 32px); }
  .insurance-partners img { width: 100%; height: auto; }
  .insurance-faq-list button { font-size: 18px; line-height: 24px; }
  .insurance-cta h2 { font-size: 30px; line-height: 38px; }
}
@media (prefers-reduced-motion: reduce) {
  .insurance-primary,.insurance-secondary,.insurance-scenario-grid article,.insurance-scenario-grid button img,.insurance-path-grid article { transition: none; }
  .insurance-primary:hover,.insurance-secondary:hover,.insurance-scenario-grid article:hover,.insurance-scenario-grid article.active,.insurance-path-grid article:hover { transform: none; }
}
</style>
