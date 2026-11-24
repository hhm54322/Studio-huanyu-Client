<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
import faq from '@/data/implantFaq.json'
import { ref } from 'vue'
import AccordionPanel from './AccordionPanel.vue'

const { tx } = useSiteCopy()
const expanded = ref(new Set<string>())
function toggle(id: string) {
  const next = new Set(expanded.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expanded.value = next
}
const groups = [
  { title: '价格与价值', start: 0, end: 6, heading: '4548:7250' },
  { title: '疼痛、恢复和飞行', start: 6, end: 10, heading: '4548:7300' },
  { title: '旅行及后续护理', start: 10, end: 16, heading: '4548:7334' },
  { title: '安全、证据和技术', start: 16, end: 23, heading: '4548:7384' },
]
const collapsed = [7252, 7260, 7268, 7276, 7284, 7292, 7302, 7310, 7318, 7326, 7336, 7344, 7352, 7360, 7368, 7376, 7386, 7394, 7402, 7410, 7418, 7426, 7434]
</script>

<template>
  <div class="implant-faq" data-figma-node="4548:7248">
    <section v-for="group in groups" :key="group.heading">
      <h3 :data-figma-node="group.heading">{{ tx(group.title) }}</h3>
      <article v-for="(item, index) in faq.slice(group.start, group.end)" :key="item.questionId"
        :data-figma-node="'4548:' + collapsed[group.start + index]">
        <button type="button" :aria-expanded="expanded.has(item.questionId)" :aria-controls="`implant-answer-${item.questionId.replace(':', '-')}`" @click="toggle(item.questionId)">
          <span :data-figma-node="item.questionId">{{ tx(item.question) }}</span>
          <span aria-hidden="true" class="implant-faq__icon">{{ expanded.has(item.questionId) ? '−' : '+' }}</span>
        </button>
        <AccordionPanel :id="`implant-answer-${item.questionId.replace(':', '-')}`" :open="expanded.has(item.questionId)"><p :data-figma-node="item.answerId">{{ tx(item.answer) }}</p></AccordionPanel>
      </article>
    </section>
  </div>
</template>

<style scoped>
.implant-faq section+section { margin-top:30px; }
.implant-faq h3 { margin:0;color:#2563eb;font-size:13px;font-weight:600;line-height:18px;letter-spacing:1.2px; }
.implant-faq article { margin-top:12px;background:#fff;border-radius:14px;overflow:hidden; }
.implant-faq button { display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;min-height:64px;padding:18px 22px;border:0;background:transparent;color:#13202a;font-family:inherit;font-size:16px;font-weight:600;line-height:26px;text-align:left;cursor:pointer; }
.implant-faq button:focus-visible { outline:2px solid #2563eb;outline-offset:-3px;border-radius:14px; }
.implant-faq button[aria-expanded=true] { border-bottom:1px solid #f5f6f7; }
.implant-faq p { margin:0;padding:16px 22px 20px;color:#4a5a66;font-size:16px;line-height:26px;overflow-wrap:anywhere; }
.implant-faq__icon { flex:none;color:#2563eb;font-size:20px;line-height:1; }
@media(max-width:700px) {
  .implant-faq button { padding:13px 16px; }
  .implant-faq p { padding:14px 16px 18px; }
}
</style>
