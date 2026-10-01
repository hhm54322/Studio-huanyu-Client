<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const activeCase = ref(0)
const complexModalOpen = ref(false)
const modalCloseButton = ref<HTMLButtonElement | null>(null)
const complexModal = ref<HTMLElement | null>(null)
const expandedTrustCards = ref<number[]>([])
let complexTrigger: HTMLElement | null = null

const complexDetail = {
  title: '复杂骨科 · 关节置换',
  disease: '关节因为骨关节炎、股骨头坏死、类风湿或创伤严重磨损，药物与保守治疗效果有限时，用人工关节替代损坏的关节面，重建活动能力与无痛行走。',
  trustIntro: '中国是全世界关节置换手术量增长最快的国家之一——2024 年完成约 244 万例，预计 2025 年达 280 万–300 万例，年增速约 22%；中国骨关节炎患者超 1 亿人，40 岁以上人群患病率高达 46.3%。\n这意味着中国的关节外科医生手术量极其密集、经验积累极快——而关节置换是一门高度依赖"手感与量级"的技术。',
  trustLead: '三大中国技术特色：',
  capabilities: [
    { title: '机器人辅助手术', copy: '中国关节手术机器人累计装机约950台，2025 年市场规模约12.5 亿元；国产机器人（天智航、元化智能、微创鸿鹄）已实现全髋/全膝/单髁多适应症覆盖，并获批出口欧美澳', asset: '/images/figma/about-complex/icon-robot.svg', nodeId: '484:2669' },
    { title: '中西医结合加速康复 (ERAS)', copy: '这是中国独有的围手术期体系——术后 6 小时床上踝泵、24–48 小时即可扶助行器下床；配合针灸、穴位贴敷、中药内服外治镇痛消肿，将"手术成功"推进到"高质量站起来"', asset: '/images/figma/about-complex/icon-eras.svg', nodeId: '484:2677' },
    { title: '集采后费用大幅可及', copy: '2021 年起国家组织人工关节集中带量采购，髋关节假体均价从约 3.5 万元降至约 7000 元，膝关节从约 3.2 万元降至约5000元，平均降价约 82%，更多患者得以承担', asset: '/images/figma/about-complex/icon-cost-down.svg', nodeId: '484:2686' },
  ],
  solutions: [
    '初次全髋/全膝/单髁置换',
    '复杂翻修（假体松动、假体周围感染、骨缺损）',
    '机器人辅助精准截骨与假体安放',
    '高龄/多基础病患者的风险评估与个体化方案',
  ],
  path: ['资料评估', '影像三维重建与术前规划', '匹配专科医生', '面诊确认方案', '微创/机器人手术', '中西医结合康复', '长期随访'],
  suitable: '关节持续疼痛、行走受限超过 6 个月，保守治疗无效者；假体置换术后出现松动、感染、疼痛者；希望以更低费用获得同等技术水平者。',
}

const networkStats = [
  { value: '100+', label: '合作医疗机构' },
  { value: '500+', label: '认证专家可协调' },
  { value: '35+', label: '覆盖城市' },
  { value: '55', label: '240小时免签国家' },
]

const networkCards = [
  { title: '看医院', copy: '按城市、科室与疾病类型筛选，每家医院的资质、国际部能力、承接案例都写清楚。', icon: '/images/figma/about-icons/Icon-1.svg', nodeId: '484:1750' },
  { title: '看专家', copy: '500+认证专家，按疾病与术式匹配，不只看名气，看谁真正接过类似病例。', icon: '/images/figma/about-icons/Frame-7.svg', nodeId: '484:1780' },
  { title: '看城市', copy: '每个城市的入境便利性、医疗特色与生活配套，一次性给你说清。', icon: '/images/figma/about-icons/Frame-2.svg', nodeId: '484:1766' },
]

const complexCases = [
  { title: '复杂骨科 · 关节置换', copy: '关节因为骨关节炎、股骨头坏死、类风湿或创伤严重磨损，药物与保守治疗效果有限时，用人工关节替代损坏的关节面，重建活动能力与无痛行走。', icon: '/images/figma/about-icons/Frame-1.svg', background: '/images/figma/about-complex-knee.webp', nodeId: '484:2093' },
  { title: '肿瘤 · 多学科诊疗（MDT）', copy: '涉及肿瘤诊断后的第二诊疗意见、治疗方案选择、手术可行性评估，以及治疗后并发症与功能重建。', icon: '/images/figma/about-icons/Frame-6.svg', background: '/images/figma/about-complex-mri.webp', nodeId: '484:2127' },
  { title: '慢病与自身免疫 · 个体化长期管理', copy: '糖尿病、高血压、慢阻肺、类风湿关节炎、系统性红斑狼疮、强直性脊柱炎等需要长期、动态调整方案的慢性病与自身免疫性疾病。', icon: '/images/figma/about-icons/Frame-5.svg', background: '/images/figma/about-complex-care.webp', nodeId: '484:2107' },
  { title: '牙科 · 精准种植与美学修复', copy: '缺牙、牙列缺损、牙齿不齐、四环素牙/氟斑牙、牙周病等问题，通过种植、正畸、全瓷冠、贴面等方式恢复功能与美观。', icon: '/images/figma/about-icons/Frame-9.svg', background: '/images/figma/about-complex-care.webp', nodeId: '484:2117' },
]

const matchingSteps = [
  { title: '整理你的资料', copy: '病历与影像由专业人员做医疗翻译与结构化整理，避免信息偏差导致诊疗误判。', icon: '/images/figma/about-icons/Frame-4.svg', nodeId: '484:2254' },
  { title: '按“接不接得住”筛', copy: '把病情特征与医生真实能力对应：哪类术式、多少类似病例、并发症处理能力。', icon: '/images/figma/about-icons/Frame-8.svg', nodeId: '484:2298' },
  { title: '专科医生复核', copy: 'AI 把范围缩到可管理，最终推荐由医生把关，并协调号源与绿色通道。', icon: '/images/figma/about-icons/Frame-7.svg', nodeId: '484:2262' },
  { title: '给一份能核对的清单', copy: '医院、医生、方案、费用区间、时间节点一次说清，含不含逐项列明。', icon: '/images/figma/about-icons/Frame-3.svg', nodeId: '484:2270' },
  { title: '落地有人接', copy: '接驳、住宿、多语种陪诊与医疗翻译、跨境支付协助，陌生环境里有人替你打通每一关。', icon: '/images/figma/about-icons/Icon-7.svg', nodeId: '484:2281' },
  { title: '回国后不断档', copy: '远程随访持续跟踪康复，复诊复购在同一套记录里延续，距离不是断联的理由。', icon: '/images/figma/about-icons/Icon-11.svg', nodeId: '484:2289' },
]

const proofCards = [
  { title: '主体与资质可查', copy: '平台由香港寰宇云医科技有限公司运营，香港跨境医疗长寿医学协会提供行业标准与品牌背书。合作机构须持有效《医疗机构执业许可证》，每 1–3 年校验一次，执照过期或超范围接诊即进入"暂不推荐"名单。', icon: '/images/figma/about-icons/Icon-5.svg', nodeId: '484:2315' },
  { title: '数据跨境与隐私合规', copy: '遵循《个人信息保护法》《数据出境安全评估办法》。病历影像最小化采集、加密存储、访问留痕；确需向境外提供时，依法通过安全评估/个人信息保护认证/标准合同三者之一，并向患者告知境外接收方与处理方式、取得单独同意。', icon: '/images/figma/about-icons/Icon-3.svg', nodeId: '484:2356' },
  { title: '诊疗边界清楚', copy: '平台做分诊、翻译、病例整理、医院与医生匹配；诊断、处方、手术等诊疗行为由实体医院及其注册医师完成。不远程首诊开处方，不承诺治愈、不承诺成功率、不使用"最便宜/最好/第一"等绝对化表述。', icon: '/images/figma/about-icons/Frame.svg', nodeId: '484:2330' },
  { title: '官方核验路径', copy: '不信我们一句话？你可以自己去卫健委查医院、查医生、查执照。', icon: '/images/figma/about-icons/Icon-2.svg', nodeId: '484:2343' },
]

const trustDetailAssets: Record<string, { path: string; nodeId: string }> = {
  '主体与资质可查': { path: '/images/figma/about-trust-detail/icon-shield.svg', nodeId: '484:2594' },
  '数据跨境与隐私合规': { path: '/images/figma/about-trust-detail/icon-lock.svg', nodeId: '484:2628' },
  '诊疗边界清楚': { path: '/images/figma/about-trust-detail/icon-scale.svg', nodeId: '484:2578' },
  '官方核验路径': { path: '/images/figma/about-trust-detail/icon-search.svg', nodeId: '484:2612' },
}

const trustDetailSourceCards = [
  {
    ...proofCards[2],
    copy: '平台做分诊、翻译、病例整理、医院与医生匹配；诊断、处方、手术等诊疗行为由实体医院及其注册医师完成。不远程首诊开处方，不承诺治愈、不承诺成功率、不使用"最便宜/最好/第一"等绝对化表述。',
    evidence: '最终方案须面诊、影像复核、签署知情同意书后生效；耗材品牌与型号写入预评估报告。',
  },
  {
    ...proofCards[0],
    copy: '平台由香港寰宇云医科技有限公司运营，香港跨境医疗长寿医学协会提供行业标准与品牌背书。合作机构须持有效《医疗机构执业许可证》，每 1–3 年校验一次，执照过期或超范围接诊即进入"暂不推荐"名单。',
    evidence: '国家卫健委「全国医疗机构查询」zgcx.nhc.gov.cn/unit（机构名称输入连续 4 字即可模糊查询）；医生执业信息 zwfw.nhc.gov.cn/cxx/ywrycx/zyyscx/（输入全名 + 机构名）；',
  },
  {
    ...proofCards[3],
    copy: '不信我们一句话？你可以自己去卫健委查医院、查医生、查执照。',
    evidence: '移动端可下载「医通办」APP 或微信搜索「健康中国」官方小程序，实时查询医师执业信息与电子证照。',
  },
  {
    ...proofCards[1],
    copy: '遵循《个人信息保护法》《数据出境安全评估办法》。病历影像最小化采集、加密存储、访问留痕；确需向境外提供时，依法通过安全评估/个人信息保护认证/标准合同三者之一，并向患者告知境外接收方与处理方式、取得单独同意。',
    evidence: '《个人信息保护法》第 28 条将医疗健康信息列为敏感个人信息；第 38–39 条明确跨境三条路径与单独同意要求；患者有权导出、更正、删除自己的资料。',
  },
]

// Native grid positions, not export traversal order, determine the reading order.
const trustDetailCards = [trustDetailSourceCards[1], trustDetailSourceCards[3], trustDetailSourceCards[0], trustDetailSourceCards[2]]

function openConsultation() {
  window.dispatchEvent(new CustomEvent('open-consultation'))
}

async function openComplexCase(index: number) {
  activeCase.value = index
  if (index !== 0) return
  complexTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
  complexModalOpen.value = true
  await nextTick()
  modalCloseButton.value?.focus()
}

function closeComplexCase() {
  complexModalOpen.value = false
  nextTick(() => complexTrigger?.focus())
}

function toggleTrustDetail(index: number) {
  expandedTrustCards.value = expandedTrustCards.value.includes(index)
    ? expandedTrustCards.value.filter(item => item !== index)
    : [...expandedTrustCards.value, index]
}

function handleComplexModalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (complexModalOpen.value) closeComplexCase()
    return
  }
  if (event.key !== 'Tab') return
  const container = complexModalOpen.value ? complexModal.value : null
  if (!container) return
  const focusable = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

watch(complexModalOpen, (complexOpen) => {
  document.body.style.overflow = complexOpen ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', handleComplexModalKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleComplexModalKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <main class="about-page">
    <section class="about-hero" aria-labelledby="about-title">
      <div class="about-hero__content" data-reveal>
        <div class="about-hero__copy">
          <h1 id="about-title">把你的病情<br />交给最适合接住<br class="about-hero-mobile-break" />它的那双手</h1>
          <p>适合你的方案、清楚的费用、合理的节奏<br />先看明白，再决定要不要来</p>
        </div>
      </div>
      <button class="about-primary-button" type="button" @click="openConsultation">免费远程评估 <img class="about-cta-icon" src="/images/figma/about-icons/Icon-13.svg" alt="" aria-hidden="true" /></button>
    </section>

    <section class="about-network" aria-labelledby="network-title">
      <div class="about-content">
        <header class="about-section-heading" data-reveal>
          <h2 id="network-title">不是名单越长越好，<br class="about-hero-mobile-break" />是能接住你的有多少</h2>
          <p>覆盖全国100+医疗机构，从头部三甲国际部到区域特色专科先筛选，再给清单</p>
        </header>
        <div class="network-stats" data-reveal>
          <div v-for="item in networkStats" :key="item.label" class="network-stat"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div>
        </div>
        <div class="network-cards">
          <article v-for="(item, index) in networkCards" :key="item.title" class="network-card" data-reveal :style="{ '--reveal-delay': `${index * 70}ms` }">
            <img class="about-card-icon" :src="item.icon" :data-figma-node="item.nodeId" alt="" aria-hidden="true" /><div class="about-card-body"><h3>{{ item.title }}</h3><p>{{ item.copy }}</p></div>
          </article>
        </div>
      </div>
    </section>

    <section class="about-complex" aria-labelledby="complex-title">
      <div class="about-content">
        <header class="about-section-heading about-section-heading--light" data-reveal>
          <h2 id="complex-title">复杂病例，一人一策</h2><p>点击切换，看我们如何为不同情况做个性化方案。</p>
        </header>
        <div class="complex-grid">
          <article v-for="(item, index) in complexCases" :key="item.title" class="complex-card" :class="{ 'complex-card--active': activeCase === index, 'complex-card--knee': index === 0 }" :aria-current="activeCase === index ? 'true' : undefined" :style="{ '--reveal-delay': `${index * 60}ms`, '--complex-image': `url(${item.background})` }" data-reveal role="button" tabindex="0" @click="activeCase = index" @keydown.enter.prevent="activeCase = index" @keydown.space.prevent="activeCase = index">
            <img class="about-card-icon" :src="item.icon" :data-figma-node="item.nodeId" alt="" aria-hidden="true" /><div class="about-card-body"><h3>{{ item.title }}</h3><p>{{ item.copy }}</p>
            <button v-if="index === 0" class="complex-card__read" type="button" @click.stop="openComplexCase(index)">阅读全文 <img src="/images/figma/about-icons/Icon-12.svg" alt="" aria-hidden="true" /></button></div>
          </article>
        </div>
      </div>
    </section>

    <section class="about-matching" aria-labelledby="matching-title">
      <div class="about-content">
        <header class="about-section-heading" data-reveal>
          <h2 id="matching-title">匹配的全流程，每一步都可解释</h2><p>不是给你一份标准套餐，而是从你的情况出发，一步步缩到最适合的那一个选项</p>
        </header>
        <div class="matching-grid">
          <article v-for="(item, index) in matchingSteps" :key="item.title" class="matching-card" data-reveal :style="{ '--reveal-delay': `${index * 55}ms` }">
            <img class="about-card-icon" :src="item.icon" :data-figma-node="item.nodeId" alt="" aria-hidden="true" /><div class="about-card-body"><h3>{{ item.title }}</h3><p>{{ item.copy }}</p></div>
          </article>
        </div>
      </div>
    </section>

    <section class="about-proof" aria-labelledby="proof-title">
      <div class="about-content">
        <header class="about-section-heading" data-reveal>
          <h2 id="proof-title">可信度，靠证据不靠形容词</h2><p>主体、隐私、边界——每一项都能被核实</p>
        </header>
        <div class="proof-grid">
          <article v-for="(item, index) in proofCards" :key="item.title" class="proof-card" :class="{ 'proof-card--expanded': expandedTrustCards.includes(index) }" data-reveal :style="{ '--reveal-delay': `${index * 65}ms` }" @click="toggleTrustDetail(index)">
            <img class="about-card-icon" :src="item.icon" :data-figma-node="item.nodeId" alt="" aria-hidden="true" /><div class="about-card-body"><h3>{{ item.title }}</h3><p>{{ item.copy }}</p>
            <button type="button" :aria-expanded="expandedTrustCards.includes(index)" :aria-controls="`trust-detail-${index}`" :aria-label="expandedTrustCards.includes(index) ? '收起可信度详情' : '查看可信度详情'"><span>{{ expandedTrustCards.includes(index) ? '收起详情' : '查看详情' }}</span><img src="/images/figma/about-icons/Icon-4.svg" alt="" aria-hidden="true" /></button>
            <div :id="`trust-detail-${index}`" class="proof-card__detail" :class="{ 'proof-card__detail--open': expandedTrustCards.includes(index) }" :aria-hidden="!expandedTrustCards.includes(index)"><div class="proof-card__detail-inner"><div class="proof-card__detail-heading"><img :src="trustDetailAssets[item.title]?.path || item.icon" :data-figma-node="trustDetailAssets[item.title]?.nodeId" alt="" aria-hidden="true" /><strong>{{ item.title }}</strong></div><p>{{ trustDetailCards[index]?.evidence }}</p></div></div></div>
          </article>
        </div>
      </div>
    </section>

    <section class="about-cta" aria-labelledby="about-cta-title">
      <div class="about-cta__content" data-reveal>
        <h2 id="about-cta-title">先听医生怎么说，再决定要不要飞过来</h2><p>免费远程二次评估，把病情与合适的医院、医生、方案先讲清楚。来华前的这一步，不花在"碰运气"上</p>
        <button class="about-primary-button" type="button" @click="openConsultation">开始免费评估 <img class="about-cta-icon" src="/images/figma/about-icons/Icon-13.svg" alt="" aria-hidden="true" /></button>
      </div>
    </section>

    <Transition name="complex-detail">
      <div v-if="complexModalOpen" class="complex-detail-backdrop" role="presentation" @click.self="closeComplexCase">
        <section ref="complexModal" class="complex-detail-modal" role="dialog" aria-modal="true" aria-labelledby="complex-detail-title">
          <button ref="modalCloseButton" class="complex-detail-close" type="button" aria-label="关闭复杂病例详情" @click="closeComplexCase"><img src="/images/figma/about-complex/icon-close.svg" alt="" aria-hidden="true" /></button>
          <div class="complex-detail-row complex-detail-row--title"><h2 id="complex-detail-title">{{ complexDetail.title }}</h2></div>
          <section class="complex-detail-row"><h3>1、疾病是什么？</h3><p>{{ complexDetail.disease }}</p></section>
          <section class="complex-detail-row complex-detail-row--trust"><h3>2、中国为什么做得好（信任核心）</h3><p class="complex-detail-trust-copy"><span v-for="paragraph in complexDetail.trustIntro.split('\n')" :key="paragraph">{{ paragraph }}</span><strong>{{ complexDetail.trustLead }}</strong></p><div class="complex-detail-capabilities"><article v-for="capability in complexDetail.capabilities" :key="capability.title"><img :src="capability.asset" :data-figma-node="capability.nodeId" alt="" aria-hidden="true" /><div><h4>{{ capability.title }}</h4><p>{{ capability.copy }}</p></div></article></div></section>
          <section class="complex-detail-row"><h3>3、我们能解决什么？</h3><div class="complex-detail-solutions"><span v-for="solution in complexDetail.solutions" :key="solution">{{ solution }}</span></div></section>
          <section class="complex-detail-row"><h3>4、典型治疗路径</h3><div class="complex-detail-path"><template v-for="(step, index) in complexDetail.path" :key="step"><span>{{ step }}</span><b v-if="index < complexDetail.path.length - 1" aria-hidden="true">→</b></template></div></section>
          <section class="complex-detail-row"><h3>5、适合谁来</h3><p>{{ complexDetail.suitable }}</p></section>
        </section>
      </div>
    </Transition>

  </main>
</template>

<style scoped>
.about-card-icon { display: block; width: 32px; height: 32px; flex: 0 0 32px; position: relative; z-index: 1; }
.about-card-body { width: 100%; min-width: 0; position: relative; z-index: 1; }
.about-page { -webkit-font-smoothing: antialiased; text-spacing-trim: space-all; }
.proof-card:not(:first-child) .about-card-body p { letter-spacing: -0.15px; }
.complex-card:nth-child(4) .about-card-body p { letter-spacing: -0.15px; }
.about-card-body .complex-card__read, .proof-card .about-card-body button { display: flex; }
.about-page .about-card-body h3 { letter-spacing: -0.439px; }
.about-cta-icon { width: 20px; height: 20px; transition: transform .3s ease; }
.about-primary-button:hover .about-cta-icon { transform: translateX(3px); }
.about-cta .about-cta-icon, .complex-card__read img { width: 16px; height: 16px; }
.about-cta .about-primary-button { font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; letter-spacing: -0.312px; }
.about-page { font-family: 'PingFang SC', sans-serif; margin-top: -64px; color: #1e3a5f; background: #fff; }
.about-content { width: min(1216px, calc(100% - 80px)); margin-inline: auto; }
.about-hero { min-height: 757px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 60px; overflow: hidden; padding: 180px 112px 146px; background: #fff url('/images/figma/about-hero.jpg') center / cover no-repeat; }
.about-hero__content { width: min(1216px, 100%); margin: 0; text-align: center; }.about-hero__copy { width: min(772px, 100%); margin-inline: auto; }
.about-hero h1 { margin: 0; color: #143162; font-size: 64px; font-weight: 600; line-height: 1.5; letter-spacing: 0.35px; white-space: nowrap; }.about-hero-mobile-break { display: none; }
.about-hero p { margin: 24px 0 0; color: #5b606a; font-size: 20px; line-height: 29px; font-weight: 400; letter-spacing: -0.439px; }
.about-primary-button { position: relative; isolation: isolate; overflow: hidden; display: inline-flex; min-height: 52px; align-items: center; justify-content: center; gap: 8px; margin-top: 0; border: 0; border-radius: 14px; padding: 16px 24px; background: #dd6b20; color: #fff; font-size: 16px; font-weight: 600; line-height: 16px; letter-spacing: -0.15px; cursor: pointer; transition: transform .32s cubic-bezier(.22,1,.36,1), box-shadow .32s ease, background-color .32s ease; }
.about-primary-button::before { position: absolute; z-index: -1; left: 50%; top: 50%; width: 180%; aspect-ratio: 1; border-radius: 50%; background: #e9853f; content: ''; transform: translate(-50%,-50%) scale(0); transition: transform .45s cubic-bezier(.22,1,.36,1); }
.about-primary-button:hover { transform: translateY(-2px); background: #ce5d14; box-shadow: 0 14px 28px rgba(221,107,32,.25); }.about-primary-button:hover::before { transform: translate(-50%,-50%) scale(1); }.about-primary-button svg { transition: transform .3s cubic-bezier(.22,1,.36,1); }.about-primary-button:hover svg { transform: translateX(3px); }
.about-network, .about-matching, .about-proof { box-sizing: border-box; padding: 96px 0; }.about-network { min-height: 708px; background: #fff; }.about-matching { min-height: 840px; background: #fff; }.about-proof { min-height: 948px; background: #f5f6f7; }
.about-section-heading { margin: 0 auto; text-align: center; }.about-section-heading h2 { margin: 0; color: #1e3a5f; font-size: 40px; font-weight: 600; line-height: 40px; letter-spacing: 0.396px; }.about-section-heading p { margin: 16px 0 0; color: #6b7280; font-size: 16px; line-height: 24px; font-weight: 400; }.about-section-heading--light h2 { color: #fff; }.about-section-heading--light p { color: rgba(255,255,255,.7); }
.about-complex .about-section-heading h2 { font-family: 'PingFang MO', 'PingFang SC', sans-serif; line-height: 39px; }
.network-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; height: 92px; margin-top: 48px; }.network-stat { position: relative; display: flex; flex-direction: column; gap: 16px; align-items: center; min-height: 92px; text-align: center; }.network-stat:not(:first-child)::before { position: absolute; left: -13px; top: 11px; width: 1px; height: 70px; background: #eef1f4; content: ''; }.network-stat strong { font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #2563eb; font-size: 56px; font-weight: 700; line-height: 56px; letter-spacing: 0.352px; }.network-stat span { color: #6b7280; font-size: 14px; font-weight: 400; line-height: 20px; letter-spacing: -0.15px; }
.network-cards { display: grid; grid-template-columns: repeat(3,1fr); grid-auto-rows: 248px; gap: 24px; height: 248px; margin-top: 48px; }.network-card, .matching-card { box-sizing: border-box; border-radius: 24px; background: #f5f6f7; }.network-card { display: flex; flex-direction: column; gap: 80px; height: 248px; min-height: 248px; padding: 24px; border: 0; }.network-card svg, .matching-card svg, .proof-card > svg { color: #5e8bff; }.network-card h3, .matching-card h3, .proof-card h3 { margin: 0 0 16px; color: #1e3a5f; font-size: 24px; font-weight: 600; line-height: 24px; letter-spacing: 0; }.network-card p, .matching-card p, .proof-card p { margin: 0; color: #4b5563; font-size: 16px; font-weight: 400; line-height: 24px; }
.about-complex { min-height: 839px; box-sizing: border-box; padding: 96px 0; background: #1e3a5f; }.complex-grid { display: grid; grid-template-columns: repeat(2,1fr); grid-auto-rows: 248px; gap: 24px; height: 520px; margin-top: 48px; }.complex-card { width: 100%; min-height: 248px; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start; gap: 80px; box-sizing: border-box; border: 0; border-radius: 24px; padding: 24px; background: #0f213e; color: inherit; font: inherit; text-align: left; cursor: pointer; transition: transform .42s cubic-bezier(.22,1,.36,1), box-shadow .42s ease; }.complex-card::before { position: absolute; inset: 0; opacity: .15; background: center / cover no-repeat var(--complex-image); content: ''; pointer-events: none; }.complex-card:hover { transform: translateY(-4px); box-shadow: 0 18px 32px rgba(4,23,45,.22); }.complex-card--knee { justify-content: space-between; gap: 0; }.complex-card svg, .complex-card h3, .complex-card p, .complex-card__read { position: relative; z-index: 1; }.complex-card svg { color: #35d5e9; }.complex-card h3 { margin: 0 0 16px; color: #fff; font-size: 24px; font-weight: 600; line-height: 24px; }.complex-card p { margin: 0; color: rgba(255,255,255,.70); font-size: 16px; line-height: 24px; }.complex-card__read { display: inline-flex; align-items: center; gap: 4px; margin-top: 16px; border: 0; padding: 0; background: transparent; color: #dd6b20; font-size: 16px; font-weight: 500; line-height: 16px; cursor: pointer; }.complex-card__read img { color: currentColor; transition: transform .3s ease; }.complex-card:hover .complex-card__read img { transform: translateX(3px); }
.matching-grid { display: grid; grid-template-columns: repeat(3,1fr); grid-auto-rows: 248px; gap: 24px; height: 520px; margin-top: 48px; }.matching-card { display: flex; flex-direction: column; gap: 80px; height: 248px; min-height: 248px; padding: 24px; border: 0; border-radius: 24px; transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }.matching-card:hover { transform: translateY(-5px); box-shadow: 0 16px 28px rgba(30,58,95,.08); }
.proof-grid { display: grid; grid-template-columns: repeat(2,1fr); grid-auto-rows: minmax(302px, auto); gap: 24px; margin-top: 48px; }.proof-card { min-height: 302px; box-sizing: border-box; display: flex; flex-direction: column; gap: 80px; padding: 24px; border: 0; border-radius: 24px; background: #fff; cursor: pointer; transition: box-shadow .32s ease, transform .32s cubic-bezier(.22,1,.36,1); }.proof-card:hover { transform: translateY(-4px); box-shadow: 0 16px 30px rgba(30,58,95,.08); }.proof-card:nth-child(4) { justify-content: space-between; gap: 0; }.proof-card button { display: inline-flex; align-items: center; width: 100%; justify-content: space-between; gap: 4px; margin-top: 16px; border: 0; padding: 0; background: transparent; color: #9ca3af; font-size: 14px; font-weight: 500; line-height: 14px; cursor: pointer; }.proof-card button:hover { color: #2563eb; }.proof-card button img { width: 14px; height: 14px; transition: transform .3s cubic-bezier(.22,1,.36,1); }.proof-card button[aria-expanded="true"] img { transform: rotate(180deg); }.proof-card--expanded { box-shadow: 0 14px 28px rgba(30,58,95,.09); }.proof-card__detail { overflow: hidden; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }.proof-card__detail-heading { display: flex; align-items: center; gap: 10px; color: #1e3a5f; font-size: 16px; line-height: 24px; }.proof-card__detail-heading img { width: 24px; height: 24px; }.proof-card__detail p { margin-top: 12px; }.trust-accordion-enter-active, .trust-accordion-leave-active { transition: opacity .25s ease, transform .3s cubic-bezier(.22,1,.36,1); }.trust-accordion-enter-from, .trust-accordion-leave-to { opacity: 0; transform: translateY(-8px); }
.trust-detail-backdrop { position: fixed; inset: 0; z-index: 140; overflow-y: auto; background: #f5f6f7; }
.trust-detail-page { position: relative; box-sizing: border-box; min-height: 100%; padding: 96px 40px; color: #1e3a5f; }
.trust-detail-content { width: min(1216px, 100%); min-height: 948px; margin-inline: auto; display: grid; grid-template-rows: 40px 40px 780px 40px; gap: 16px; }
.trust-detail-content > h2 { margin: 0; color: #1e3a5f; font-size: 40px; font-weight: 600; line-height: 40px; letter-spacing: .4px; text-align: center; }
.trust-detail-mobile-break { display: none; }
.trust-detail-subtitle, .trust-detail-note { box-sizing: border-box; height: 40px; margin: 0; padding-top: 16px; color: #6b7280; font-size: 16px; font-weight: 400; line-height: 24px; text-align: center; }
.trust-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: 390px 366px; gap: 24px; }
.trust-detail-card { box-sizing: border-box; display: flex; min-width: 0; flex-direction: column; padding: 24px; border: 0; border-radius: 24px; background: #fff; color: #1e3a5f; }
.trust-detail-card__icon { width: 32px; height: 32px; flex: 0 0 32px; object-fit: contain; }
.trust-detail-card__body { display: flex; min-height: 0; flex: 1; flex-direction: column; margin-top: 80px; }
.trust-detail-card h3 { margin: 0; color: #1e3a5f; font-size: 24px; font-weight: 600; line-height: 24px; }
.trust-detail-card p { margin: 16px 0 0; color: #4b5563; font-size: 16px; font-weight: 400; line-height: 24px; }
.trust-detail-card__action { display: inline-flex; width: 100%; align-items: center; justify-content: space-between; gap: 4px; margin-top: 16px; color: #9ca3af; font-size: 14px; font-weight: 500; line-height: 14px; }
.trust-detail-card__action img { width: 14px; height: 14px; transition: transform .3s cubic-bezier(.22,1,.36,1); }
.trust-detail-card:hover .trust-detail-card__action { color: #2563eb; }
.trust-detail-card:hover .trust-detail-card__action img { transform: translateX(3px); }
.trust-detail-close { position: absolute; top: 24px; right: 32px; z-index: 1; display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid #e4e9ee; border-radius: 9999px; background: rgba(255,255,255,.78); color: #1e3a5f; cursor: pointer; backdrop-filter: blur(16px); transition: transform .28s cubic-bezier(.22,1,.36,1), background .22s ease; }
.trust-detail-close:hover { transform: rotate(90deg); background: #fff; }
.trust-detail-enter-active, .trust-detail-leave-active { transition: opacity .3s ease; }
.trust-detail-enter-active .trust-detail-page, .trust-detail-leave-active .trust-detail-page { transition: transform .42s cubic-bezier(.22,1,.36,1); }
.trust-detail-enter-from, .trust-detail-leave-to { opacity: 0; }
.trust-detail-enter-from .trust-detail-page, .trust-detail-leave-to .trust-detail-page { transform: translateY(18px); }
.about-cta { min-height: 368px; box-sizing: border-box; display: grid; place-items: center; padding: 96px 24px; background: #1e3a5f url('/images/figma/about-cta-background.png') center / cover no-repeat; }.about-cta__content { width: min(940px,100%); text-align: center; }.about-cta h2 { margin: 0; color: #1e3a5f; font-size: 40px; font-weight: 600; line-height: 40px; letter-spacing: .4px; }.about-cta p { max-width: 1216px; margin: 16px auto 0; color: #6b7280; font-size: 16px; line-height: 24px; }.about-cta .about-primary-button { min-height: 48px; margin-top: 48px; padding: 12px 24px; line-height: 24px; }
.complex-detail-backdrop { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 40px; background: rgba(0,0,0,.5); backdrop-filter: blur(4px); overflow-y: auto; }.complex-detail-modal { position: relative; width: min(896px, 100%); max-height: calc(100vh - 80px); box-sizing: border-box; overflow-y: auto; display: flex; flex-direction: column; align-items: stretch; gap: 32px; border-radius: 24px; padding: 32px; background: #fff; color: #1e3a5f; }.complex-detail-row { min-width: 0; }.complex-detail-row--title { padding-right: 42px; }.complex-detail-row h3, .complex-detail-row h2 { margin: 0; color: #1e3a5f; font-weight: 600; }.complex-detail-row h2 { font-size: 32px; line-height: 32px; letter-spacing: .4px; }.complex-detail-row h3 { font-size: 24px; line-height: 24px; }.complex-detail-row > p { margin: 16px 0 0; color: #4b5563; font-size: 16px; line-height: 24px; white-space: pre-line; }.complex-detail-trust-copy strong { display: block; color: #1e3a5f; font-size: 20px; font-weight: 600; line-height: 28px; }.complex-detail-close { position: absolute; top: 16px; right: 16px; display: grid; width: 36px; height: 36px; place-items: center; border: 0; border-radius: 9999px; background: transparent; cursor: pointer; backdrop-filter: blur(8px); transition: transform .28s cubic-bezier(.22,1,.36,1), background .22s ease; }.complex-detail-close img { width: 20px; height: 20px; }.complex-detail-close:hover { transform: rotate(90deg); background: #e8eef4; }.complex-detail-capabilities { display: flex; flex-direction: column; align-items: stretch; margin-top: 16px; }.complex-detail-capabilities article { display: flex; min-height: 0; box-sizing: border-box; flex-direction: column; align-items: flex-start; gap: 40px; border-radius: 24px; padding: 24px; background: #f5f6f7; }.complex-detail-capabilities article > img { width: 32px; height: 32px; flex: 0 0 32px; object-fit: contain; }.complex-detail-capabilities h4 { margin: 0 0 16px; color: #1e3a5f; font-size: 18px; font-weight: 600; line-height: 18px; }.complex-detail-capabilities article p { margin: 0; color: #4b5563; font-size: 16px; line-height: 24px; text-align: justify; }.complex-detail-solutions { display: flex; flex-direction: column; align-items: stretch; margin-top: 16px; }.complex-detail-solutions span, .complex-detail-path span { display: flex; min-width: 0; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 12px; padding: 12px 24px; background: #f5f6f7; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center; }.complex-detail-solutions span { min-height: 48px; }.complex-detail-path { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 16px; }.complex-detail-path span { min-height: 48px; white-space: nowrap; }.complex-detail-path b { color: #4b5563; font-size: 16px; font-weight: 400; }.complex-detail-enter-active, .complex-detail-leave-active { transition: opacity .22s ease; }.complex-detail-enter-active .complex-detail-modal, .complex-detail-leave-active .complex-detail-modal { transition: opacity .22s ease, transform .38s cubic-bezier(.22,1,.36,1); }.complex-detail-enter-from, .complex-detail-leave-to { opacity: 0; }.complex-detail-enter-from .complex-detail-modal, .complex-detail-leave-to .complex-detail-modal { opacity: 0; transform: translateY(18px); }
@media (max-width: 900px) { .about-content { width: min(680px, calc(100% - 48px)); }.about-hero { min-height: 680px; padding: 120px 48px 100px; background-position: 60% center; }.about-hero h1 { font-size: 50px; line-height: 1.32; white-space: normal; }.about-network, .about-complex, .about-matching, .about-proof { min-height: auto; padding: 80px 0; }.network-stats { margin-top: 44px; }.network-cards, .matching-grid { grid-template-columns: 1fr; height: auto; grid-auto-rows: auto; }.complex-grid, .proof-grid { height: auto; grid-auto-rows: auto; gap: 16px; }.network-card, .matching-card { display: flex; flex-direction: column; gap: 80px; height: auto; min-height: 170px; }.complex-card, .proof-card { height: auto; min-height: 208px; }.about-cta { min-height: 330px; }.about-cta h2 { font-size: 32px; } }
@media (max-width: 560px) { .about-content { width: calc(100% - 40px); }.about-hero { min-height: 608px; align-items: end; justify-content: flex-end; gap: 24px; padding: 0 20px 68px; background-position: 66% center; }.about-hero__content, .about-hero__copy { width: 100%; margin-top: 0; }.about-hero-mobile-break { display: block; }.about-hero h1 { width: min(100%, 340px); max-width: 100%; margin-inline: auto; font-size: 32px; line-height: 1.34; white-space: normal !important; overflow-wrap: anywhere; word-break: break-all; }.about-hero p { font-size: 14px; }.about-primary-button { min-height: 46px; }.about-section-heading h2 { max-width: 100%; margin-inline: auto; font-size: 30px; line-height: 1.2; overflow-wrap: anywhere; word-break: break-all; }.about-section-heading p { font-size: 13px; }.network-stats { height: auto; grid-template-columns: repeat(2,1fr); gap: 20px 0; margin-top: 34px; }.network-stat { min-height: 70px; }.network-stat:nth-child(3) { border-left: 0; }.network-stat strong { font-size: 34px; }.network-cards, .complex-grid, .matching-grid, .proof-grid { grid-template-columns: 1fr; margin-top: 34px; }.network-card, .matching-card { min-height: auto; }.network-card h3, .matching-card h3 { margin-top: 24px; }.complex-card { min-height: 0; }.proof-card { min-height: 0; }.about-cta { min-height: 368px; background-position: 58% center; }.about-cta h2 { font-size: 29px; }.about-cta p { font-size: 13px; }.complex-detail-backdrop { padding: 12px; align-items: end; }.complex-detail-modal { width: 100%; max-height: calc(100vh - 24px); gap: 24px; border-radius: 20px 20px 0 0; padding: 28px 20px 24px; }.complex-detail-capabilities { grid-template-columns: 1fr; gap: 12px; }.complex-detail-capabilities article { min-height: 0; padding: 18px; }.complex-detail-capabilities h4 { margin-top: 14px; }.complex-detail-solutions { grid-template-columns: 1fr; gap: 8px; }.complex-detail-path { align-items: stretch; flex-direction: column; }.complex-detail-path b { transform: rotate(90deg); line-height: 10px; }.complex-detail-path span { width: 100%; }.complex-detail-row h3 { font-size: 15px; } }
@media (prefers-reduced-motion: reduce) { .about-primary-button, .about-primary-button::before, .about-primary-button svg, .complex-card, .complex-card::after, .complex-card__read img, .matching-card, .proof-card, .proof-card button svg, .complex-detail-enter-active, .complex-detail-leave-active, .complex-detail-enter-active .complex-detail-modal, .complex-detail-leave-active .complex-detail-modal, .complex-detail-close { transition: none; } }
@media (max-width: 560px) { .complex-detail-modal { height: auto; grid-template-rows: none; } }
@media (max-width: 900px) {
  .network-card, .matching-card, .complex-card, .proof-card { gap: 40px; }
  .complex-card--knee, .proof-card:nth-child(4) { gap: 40px; }
}
@media (max-width: 560px) {
  .network-card h3, .matching-card h3 { margin-top: 0; }
  .network-stat:nth-child(3)::before { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .about-cta-icon, .complex-card::before, .complex-card__read img, .proof-card button img { transition: none; }
}
@media (max-width: 560px) {
  .trust-detail-page { min-height: 100%; padding: 72px 20px 64px; }
  .trust-detail-content { min-height: 0; grid-template-rows: auto auto auto auto; gap: 16px; }
  .trust-detail-content > h2 { font-size: 30px; line-height: 40px; text-align: left; }
  .trust-detail-mobile-break { display: inline; }
  .trust-detail-subtitle, .trust-detail-note { height: auto; font-size: 14px; line-height: 24px; text-align: left; }
  .trust-detail-grid { grid-template-columns: 1fr; grid-template-rows: none; gap: 16px; }
  .trust-detail-card { min-height: 0; padding: 24px; }
  .trust-detail-card__body { margin-top: 40px; gap: 24px; }
  .trust-detail-card p { font-size: 16px; line-height: 24px; }
  .trust-detail-close { top: 20px; right: 20px; }
}
/* Native Dev Mode grid placement is not preserved by the HTML export. */
.complex-detail-modal { display: grid; grid-template-columns: minmax(0, 1fr); }
.complex-detail-row h3 { letter-spacing: -0.439px; }
.complex-detail-capabilities article:nth-child(2) p { letter-spacing: -0.15px; }
.complex-detail-trust-copy { min-height: 117px; }
.complex-detail-trust-copy > span { display: block; }
.complex-detail-trust-copy > :not(:first-child) { margin-top: 8px; }
.complex-detail-capabilities { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.complex-detail-capabilities article:nth-child(2) { grid-column: 3; grid-row: 1; }
.complex-detail-capabilities article:nth-child(3) { grid-column: 2; grid-row: 1; }
.complex-detail-capabilities h4 { width: max-content; max-width: 314.664px; letter-spacing: -0.439px; }
.complex-detail-solutions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.trust-detail-content { display: flex; flex-direction: column; gap: 0; }
.trust-detail-grid { margin-top: 48px; }
.trust-detail-card__body { flex: none; width: 100%; }
.trust-detail-card:nth-child(4) { justify-content: space-between; }
.trust-detail-card:nth-child(4) .trust-detail-card__body { margin-top: 0; }
.trust-detail-card h3 { letter-spacing: -0.439px; }
.trust-detail-card:not(:first-child) p { letter-spacing: -0.15px; }
.trust-detail-card p:last-child { letter-spacing: 0; }
.trust-detail-card__action { display: flex; border: 0; padding: 0; background: transparent; text-align: left; cursor: pointer; }
@media (max-width: 560px) {
  .complex-detail-capabilities, .complex-detail-solutions { grid-template-columns: minmax(0, 1fr); }
  .complex-detail-capabilities article:nth-child(n) { grid-column: auto; grid-row: auto; }
  .complex-detail-capabilities h4 { width: auto; margin-top: 0; }
  .complex-detail-path b { width: 24px; align-self: center; text-align: center; }
  .trust-detail-card:nth-child(4) .trust-detail-card__body { margin-top: 40px; }
}
.proof-card__detail { display: grid; grid-template-rows: 0fr; margin-top: 0; padding-top: 0; border-top-width: 0; opacity: 0; transition: grid-template-rows .36s cubic-bezier(.22,1,.36,1), margin-top .36s cubic-bezier(.22,1,.36,1), padding-top .36s cubic-bezier(.22,1,.36,1), opacity .24s ease, border-color .24s ease; }
.proof-card__detail--open { grid-template-rows: 1fr; margin-top: 20px; padding-top: 20px; border-top-width: 1px; opacity: 1; }
.proof-card__detail-inner { min-height: 0; overflow: hidden; }
.proof-card { align-self: start; }
@media (prefers-reduced-motion: reduce) { .proof-card__detail { transition: none; } }
</style>
