<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
const { tx, tf } = useSiteCopy()

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { HomeSourceNodeData as SourceNode } from './HomeSourceNode.vue'
import { dentalPhysicianCases, type DentalPhysician } from '@/data/dentalPhysicianData'
import caseSource from '../../../docs/figma-source/dental-pages-2026-11-03/case-detail/source-tree-2026-11-03.json'

const props = defineProps<{ doctor: DentalPhysician; mode: 'profile' | 'cases' | 'reviews'; source: SourceNode }>()
const emit = defineEmits<{ height: [value: number]; image: [image: { src: string; alt: string }] }>()
const element = ref<HTMLElement>()
const expanded = ref(new Set<string>())
const cases = computed(() => dentalPhysicianCases(props.doctor))
const all = (node: SourceNode): SourceNode[] => [node, ...node.children.flatMap(all)]
const sourceNode = (text: string) => all(props.source).find(node => node.text === text)
const sourceId = (id: string) => all(props.source).find(node => node.id === id)
const style = (node?: SourceNode) => `${node?.layoutCss || ''};position:relative;left:0;top:0;width:auto;height:auto;min-height:0;white-space:normal;overflow-wrap:anywhere;`
const caseNodes = all(caseSource.root as SourceNode)
const caseNode = (id: string) => caseNodes.find(node => node.id === id)!
const caseBox = caseNode('3423:6058')
const caseTitle = caseNode('3423:6061')
const caseCopy = caseNode('3423:5965')
const caseImage = caseNode('3423:6067')
const arrow = caseNode('3423:6063').svg
const sections = computed(() => [
  { title: '专业资质', rows: props.doctor.credentials },
  { title: '专业领域', rows: props.doctor.professionalFields },
  { title: '履历与任职', rows: props.doctor.originalCredentials },
  ...(props.doctor.originalSpecialty.length ? [{ title: '专业擅长', rows: props.doctor.originalSpecialty }] : []),
])
let observer: ResizeObserver | undefined
function toggle(id: string) { const next = new Set(expanded.value); if (next.has(id)) next.delete(id); else next.add(id); expanded.value = next }
function measure() { if (element.value) emit('height', element.value.offsetHeight) }
onMounted(async () => { observer = new ResizeObserver(measure); observer.observe(element.value!); await document.fonts.ready; measure() })
watch(() => [props.doctor.id, props.mode], async () => { expanded.value = new Set(); await nextTick(); measure() })
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="element" class="dental-doctor-content" :class="`dental-doctor-content--${mode}`" :data-doctor-content="doctor.id">
    <template v-if="mode === 'profile'">
      <p :style="style(sourceId('3421:2624'))" data-figma-source-node="3421:2624">{{ tx(doctor.bio) }}</p>
      <section v-for="section in sections.filter(section => section.rows.length)" :key="section.title" class="dental-doctor-content__section">
        <h3 :style="style(sourceNode('专业资质'))" data-figma-source-node="3421:2627">{{ tx(section.title) }}</h3>
        <ul><li v-for="(row,index) in section.rows" :key="index"><img src="/images/figma/dental-pages-20261103/node-3421-2631.svg" alt="" /><span>{{ tx(row) }}</span></li></ul>
      </section>
    </template>
    <template v-else-if="mode === 'cases'">
      <article v-for="item in cases" :key="item.id" class="dental-doctor-case" :style="`${style(caseBox)};display:block;width:100%;min-height:164px;`" :data-physician-case="item.id" data-figma-source-node="3423:6058">
        <div class="dental-doctor-case__heading">
          <h3 :style="style(caseTitle)" data-figma-source-node="3423:6061">{{ tx(item.title) }}</h3>
          <button v-if="item.description" type="button" :aria-label="tf(expanded.has(item.id) ? '收起：{title}' : '展开：{title}',{title:tx(item.title)})" :aria-expanded="expanded.has(item.id)" :aria-controls="`dental-case-copy-${item.id}`" @click="toggle(item.id)"><img :src="arrow" alt="" :class="{ 'is-open': expanded.has(item.id) }" /></button>
        </div>
        <p v-if="item.description && expanded.has(item.id)" :id="`dental-case-copy-${item.id}`" :style="style(caseCopy)" class="dental-doctor-case__copy" data-figma-source-node="3423:5965">{{ tx(item.description) }}</p>
        <div class="dental-doctor-case__images" data-figma-source-node="3423:6066">
          <button v-for="image in item.images" :key="image.src" type="button" :aria-label="tx(`放大${image.alt || item.title}`)" @click="emit('image', image)"><img :src="image.thumbnail || image.src" :alt="tx(image.alt || item.title)" width="80" height="80" :style="`${caseImage.layoutCss};position:relative;left:0;top:0;background:none;object-fit:cover;`" loading="lazy" data-figma-source-node="3423:6067" /></button>
        </div>
      </article>
    </template>
    <template v-else>
      <article v-for="(review,index) in doctor.reviews" :key="index" class="dental-doctor-review" :style="style(sourceId('3421:3470'))" data-figma-source-node="3421:3470">
        <h3 :style="style(sourceId('3421:3476'))" data-figma-source-node="3421:3476">{{ tx(review.service) }}</h3>
        <p :style="style(sourceId('3421:3477'))" data-figma-source-node="3421:3477">{{ tx(review.content) }}</p>
        <small :style="style(sourceId('3421:3483'))" data-figma-source-node="3421:3483">{{ tx(review.source) }}</small>
      </article>
      <p v-if="!doctor.reviews.length">{{ tx("暂无已公开患者评价") }}</p>
    </template>
  </div>
</template>

<style scoped>
.dental-doctor-content { width:824px; font:400 16px/24px 'PingFang SC',sans-serif; color:#4b5563; }
.dental-doctor-content p,.dental-doctor-content h3 { margin:0; }
.dental-doctor-content__section { margin-top:24px; }
.dental-doctor-content ul { display:flex; flex-direction:column; gap:12px; list-style:none; padding:0; margin:16px 0 0; }
.dental-doctor-content li { display:flex; gap:8px; align-items:flex-start; }
.dental-doctor-content li img { width:16px; height:16px; flex:none; margin-top:4px; }
.dental-doctor-case { padding:24px!important; border-radius:24px; background:#f3f4f6; box-sizing:border-box; }
.dental-doctor-case + .dental-doctor-case { margin-top:24px!important; }
.dental-doctor-case__heading { display:flex; width:100%; align-items:flex-start; justify-content:space-between; }
.dental-doctor-case__heading h3 { flex:1; min-width:0; }
.dental-doctor-case__heading button { flex:none; width:24px; height:24px; padding:0; border:0; background:none; cursor:pointer; }
.dental-doctor-case__heading img { display:block; width:24px; height:24px; }
.dental-doctor-case__heading img.is-open { transform:rotate(180deg); }
.dental-doctor-case__copy { margin-top:8px!important; }
.dental-doctor-case__images { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
.dental-doctor-case__images button { display:block; padding:0; border:0; background:transparent; cursor:zoom-in; }
.dental-doctor-case__images img { display:block; }
.dental-doctor-case :focus-visible { outline:2px solid #2563eb; outline-offset:4px; }
.dental-doctor-review { padding:24px; border-radius:24px; background:#f3f4f6; }
.dental-doctor-review + .dental-doctor-review { margin-top:16px; }
.dental-doctor-review small { display:block; }
</style>
