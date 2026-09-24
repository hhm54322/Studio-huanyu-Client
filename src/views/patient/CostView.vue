<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, Check, CircleDollarSign, Info, TrendingDown } from 'lucide-vue-next'
import SectionHeading from '@/components/common/SectionHeading.vue'
import { barData, chinaColumnIndex, costMatrix, countries } from '@/data/costs'

const activeTreatment = ref(0)
const current = computed(() => barData[activeTreatment.value])
const chartCountries = ['中国', '美国', '英国', '德国', '新加坡', '日本']
const chartKeys = ['china', 'usa', 'uk', 'germany', 'singapore', 'japan'] as const
const maxValue = computed(() => Math.max(...chartKeys.map((key) => Number(current.value?.[key] || 0))))

const costFactors = [
  ['疾病分期与治疗复杂度', '同一病种在不同分期可能采用完全不同的治疗组合。'],
  ['医院与专家选择', '综合医院、专科中心、国际医疗部的计费方式不同。'],
  ['药品、耗材与住院时间', '进口耗材、靶向药和重症监护都会影响最终费用。'],
  ['保险与支付安排', '部分国际保险可直付，也可协助准备理赔所需材料。'],
]
</script>

<template>
  <div class="cost-page">
    <section class="hy-page-hero cost-hero">
      <img class="hy-page-hero__media" src="/images/figma/patient-hero.png" alt="国际患者在中国就医" />
      <div class="hy-page-hero__overlay" />
      <div class="hy-page-hero__content" data-reveal>
        <span class="hy-kicker">COST COMPARISON</span>
        <h1>医疗费用，应该在决定之前说清楚</h1>
        <p>用同一治疗项目、同一计价口径进行跨国比较，帮助患者建立更真实的预算预期。</p>
      </div>
    </section>

    <section class="hy-section cost-overview">
      <div class="hy-container">
        <SectionHeading kicker="TYPICAL TREATMENTS" title="典型治疗项目费用对比" description="选择治疗项目，查看中国与主要医疗目的地的公开费用区间对比。" />
        <div class="cost-tabs" role="tablist">
          <button v-for="(item, index) in barData" :key="item.name" type="button" :class="{ active: activeTreatment === index }" @click="activeTreatment = index">{{ item.name }}</button>
        </div>
        <div class="chart-panel" data-reveal>
          <div class="chart-panel__meta"><span><CircleDollarSign class="h-5 w-5" /> {{ current.name }}</span><small>单位：千美元</small></div>
          <div class="bar-chart">
            <div v-for="(country, index) in chartCountries" :key="country" class="bar-column" :class="{ china: index === 0 }">
              <strong>{{ current[chartKeys[index]!] }}</strong>
              <div class="bar-track"><i :style="{ height: `${Math.max(8, Number(current[chartKeys[index]!]) / maxValue * 100)}%` }" /></div>
              <span>{{ country }}</span>
            </div>
          </div>
          <div class="chart-callout"><TrendingDown class="h-5 w-5" /><span>以{{ current.name }}为例，中国治疗费用约为美国的 <strong>{{ Math.round(Number(current.china) / Number(current.usa) * 100) }}%</strong></span></div>
        </div>
      </div>
    </section>

    <section class="matrix-section hy-section hy-section--soft">
      <div class="hy-container">
        <SectionHeading kicker="REFERENCE MATRIX" title="更多项目费用区间" description="下表用于早期决策参考。实际费用需在医院完成远程评估或入院检查后确认。" />
        <div class="matrix-wrap" data-reveal>
          <table>
            <thead><tr><th>治疗项目</th><th v-for="country in countries" :key="country">{{ country }}</th></tr></thead>
            <tbody><tr v-for="row in costMatrix" :key="row[0]"><td>{{ row[0] }}</td><td v-for="(value, index) in row.slice(1)" :key="`${row[0]}-${index}`" :class="{ china: index === chinaColumnIndex }">{{ value }}</td></tr></tbody>
          </table>
        </div>
        <p class="matrix-note"><Info class="h-4 w-4" /> N/A 表示缺乏稳定公开区间；所有金额仅作跨国决策参考，不构成报价。</p>
      </div>
    </section>

    <section class="hy-section factors-section">
      <div class="hy-container factors-layout">
        <SectionHeading kicker="WHAT CHANGES THE COST" title="为什么最终费用会变化" description="专业的费用评估必须同时说明区间，也说明哪些因素可能让费用上升或下降。" />
        <div class="factor-list">
          <article v-for="(item, index) in costFactors" :key="item[0]" data-reveal :style="{ '--reveal-delay': `${index * 70}ms` }"><span>0{{ index + 1 }}</span><div><h3>{{ item[0] }}</h3><p>{{ item[1] }}</p></div></article>
        </div>
      </div>
    </section>

    <section class="cost-cta">
      <div class="hy-container" data-reveal><div><span class="hy-kicker">PERSONALIZED ESTIMATE</span><h2>想知道更接近你病情的费用？</h2><p>上传病历后，报告会结合治疗方向给出更有针对性的预算参考。</p></div><RouterLink to="/report" class="hy-button-primary">生成费用评估报告 <ArrowRight class="h-4 w-4" /></RouterLink></div>
    </section>
  </div>
</template>

<style scoped>
.cost-page { margin-top: -72px; background: #f5f6f7; }
.cost-hero { min-height: 570px; }
.cost-hero .hy-page-hero__media { object-position: center; }
.cost-hero .hy-page-hero__content { padding-top: 160px; }
.cost-tabs { display: flex; gap: 8px; margin-top: 42px; overflow-x: auto; padding-bottom: 4px; }
.cost-tabs button { flex: none; border: 1px solid var(--hy-line); border-radius: 5px; padding: 10px 16px; background: #fff; color: var(--hy-muted); font-size: 12px; font-weight: 700; cursor: pointer; }
.cost-tabs button.active { border-color: var(--hy-blue); background: var(--hy-blue); color: #fff; }
.chart-panel { margin-top: 18px; padding: 30px 38px; border: 1px solid var(--hy-line); border-radius: 8px; background: #fff; box-shadow: 0 18px 48px rgba(12, 58, 89, .07); }
.chart-panel__meta { display: flex; justify-content: space-between; align-items: center; }
.chart-panel__meta span { display: flex; align-items: center; gap: 8px; color: var(--hy-navy-deep); font-weight: 750; }
.chart-panel__meta svg { color: var(--hy-orange); }
.chart-panel__meta small { color: var(--hy-muted); }
.bar-chart { height: 350px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 24px; align-items: end; margin-top: 25px; border-bottom: 1px solid var(--hy-line); }
.bar-column { height: 100%; display: grid; grid-template-rows: 26px 1fr 42px; gap: 8px; text-align: center; }
.bar-column strong { color: var(--hy-navy); font-size: 12px; }
.bar-track { height: 100%; display: flex; align-items: flex-end; justify-content: center; }
.bar-track i { width: min(54px, 80%); border-radius: 4px 4px 0 0; background: #bfd8e5; transition: height .5s cubic-bezier(.22, 1, .36, 1); }
.bar-column.china .bar-track i { background: var(--hy-orange); }
.bar-column.china strong, .bar-column.china > span { color: var(--hy-orange); font-weight: 800; }
.bar-column > span { color: var(--hy-muted); font-size: 11px; }
.chart-callout { display: flex; align-items: center; gap: 9px; margin-top: 24px; color: #547084; font-size: 12px; }
.chart-callout svg { color: #27a776; }
.chart-callout strong { color: #1f8a68; }
.matrix-wrap { margin-top: 42px; overflow-x: auto; border: 1px solid var(--hy-line); border-radius: 8px; background: #fff; }
.matrix-wrap table { width: 100%; min-width: 1050px; border-collapse: collapse; font-size: 12px; }
.matrix-wrap th { padding: 17px 14px; background: var(--hy-navy-deep); color: #fff; text-align: center; font-weight: 700; }
.matrix-wrap th:first-child { text-align: left; }
.matrix-wrap td { padding: 15px 14px; border-top: 1px solid var(--hy-line); color: #5d7688; text-align: center; }
.matrix-wrap td:first-child { color: var(--hy-navy-deep); text-align: left; font-weight: 700; }
.matrix-wrap td.china { background: #fff4eb; color: #e86f1c; font-weight: 800; }
.matrix-note { display: flex; align-items: flex-start; gap: 7px; margin: 15px 0 0; color: var(--hy-muted); font-size: 11px; }
.matrix-note svg { flex: none; color: var(--hy-blue); }
.factors-layout { display: grid; grid-template-columns: .85fr 1.15fr; gap: 90px; }
.factor-list { border-top: 1px solid var(--hy-line); }
.factor-list article { display: grid; grid-template-columns: 42px 1fr; gap: 14px; padding: 25px 0; border-bottom: 1px solid var(--hy-line); }
.factor-list article > span { color: var(--hy-orange); font-size: 12px; font-weight: 800; }
.factor-list h3 { margin: 0 0 7px; color: var(--hy-navy-deep); font-size: 15px; }
.factor-list p { margin: 0; color: var(--hy-muted); font-size: 12px; line-height: 1.7; }
.cost-cta { padding: 76px 0; background: #eaf6fb; }
.cost-cta > div { display: flex; justify-content: space-between; align-items: center; gap: 50px; }
.cost-cta h2 { margin: 13px 0 6px; color: var(--hy-navy-deep); font-size: 36px; }
.cost-cta p { margin: 0; color: var(--hy-muted); }
.cost-cta .hy-button-primary { flex: none; }
.cost-page button:focus-visible,
.cost-page a:focus-visible { outline: 3px solid rgba(255, 138, 52, .62); outline-offset: 3px; }
.cost-page .hy-section { background: #f5f6f7; }
.cost-page .matrix-section { background: #eef2f4; }
@media (max-width: 800px) { .factors-layout { grid-template-columns: 1fr; gap: 40px; } .cost-cta > div { align-items: flex-start; flex-direction: column; } }
@media (max-width: 600px) { .cost-page { margin-top: -70px; } .cost-hero { min-height: 520px; } .chart-panel { padding: 24px 16px; } .bar-chart { gap: 7px; height: 290px; } .bar-track i { width: 70%; } .cost-cta h2 { font-size: 30px; } .cost-cta .hy-button-primary { width: 100%; } }
</style>
