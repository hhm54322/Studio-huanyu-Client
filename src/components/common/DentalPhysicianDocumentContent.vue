<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { dentalNode } from '@/data/dentalFigmaSource'
import { dentalPhysicianCases, type DentalPhysician } from '@/data/dentalPhysicianData'

const props = defineProps<{ doctor: DentalPhysician; mode: 'profile' | 'cases' | 'reviews' | 'institution' }>()
const emit = defineEmits<{ height: [value: number] }>()
const element = ref<HTMLElement | null>(null)
let observer: ResizeObserver | undefined
const sourceStyle = (id: string) => `${dentalNode(id).layoutCss};height:auto;white-space:normal;overflow-wrap:anywhere;`
const cases = computed(() => dentalPhysicianCases(props.doctor))
const sections = computed(() => [
  { title: '专业资质', rows: props.doctor.credentials },
  { title: '专业领域', rows: props.doctor.professionalFields },
  { title: '履历与任职', rows: props.doctor.originalCredentials },
  ...(props.doctor.originalSpecialty.length ? [{ title: '专业擅长', rows: props.doctor.originalSpecialty }] : []),
])
async function measure() {
  await nextTick()
  if (element.value) emit('height', element.value.offsetHeight)
}
onMounted(async () => {
  observer = new ResizeObserver(measure)
  if (element.value) observer.observe(element.value)
  await document.fonts.ready
  void measure()
})
watch(() => [props.mode, props.doctor.id], measure, { flush: 'post' })
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section id="dental-document-content" ref="element" class="dental-document-content" :class="`dental-document-content--${mode}`" :data-doctor-content="doctor.id" role="tabpanel" :aria-labelledby="mode === 'institution' ? 'dental-source-dialog-title' : undefined" tabindex="0">
    <template v-if="mode === 'profile'">
      <p class="dental-document-content__institution" :style="sourceStyle('2294:7774')">{{ doctor.hospital }}</p>
      <p :style="sourceStyle('2294:7790')" data-figma-source-node="2294:7790">{{ doctor.bio }}</p>
      <div v-for="section in sections" :key="section.title" class="dental-document-content__section" data-figma-source-node="2294:7791">
        <h3 :style="sourceStyle('2294:7793')">{{ section.title }}</h3>
        <ul>
          <li v-for="(row, index) in section.rows" :key="index" data-figma-source-node="2294:7794">
            <img :src="dentalNode('2294:7796').svg" alt="" aria-hidden="true" />
            <span :style="sourceStyle('2294:7799')">{{ row }}</span>
          </li>
        </ul>
      </div>
      <p class="dental-document-content__reference-price" :style="sourceStyle('2294:7774')">{{ doctor.priceDescription }}；具体费用以书面报价为准。</p>
    </template>
    <template v-else-if="mode === 'cases'">
      <article v-for="item in cases" :key="item.id" :style="sourceStyle('2294:7375')" class="dental-document-content__case" :data-physician-case="item.id" data-figma-source-node="2294:7375">
        <h3 :style="sourceStyle('2294:7376')">{{ item.title }}</h3>
        <div :style="`${dentalNode('2294:7377').layoutCss};width:100%;flex-wrap:wrap;`">
          <img v-for="image in item.images.filter(image => image.src.trim())" :key="image.src" :src="image.src" :alt="image.alt || item.title" :style="`${dentalNode('2294:7378').layoutCss};object-fit:cover;background:none;`" loading="lazy" />
        </div>
      </article>
      <div v-if="!cases.length" :style="sourceStyle('2294:7375')" data-figma-source-node="2294:7375">
        <p :style="sourceStyle('2294:7376')">暂无已公开案例</p>
      </div>
    </template>
    <template v-else-if="mode === 'reviews'">
      <article v-for="(review, index) in doctor.reviews" :key="index" :style="sourceStyle('231:1458')" class="dental-document-content__review" data-figma-source-node="231:1458">
        <h3 :style="sourceStyle('231:1464')">{{ review.service }}</h3>
        <p :style="sourceStyle('231:1465')">{{ review.content }}</p>
        <p :style="sourceStyle('231:1471')">{{ review.source }}</p>
      </article>
      <p v-if="!doctor.reviews.length" :style="sourceStyle('2294:7375')">暂无已公开患者评价</p>
    </template>
    <template v-else>
      <p class="dental-document-content__institution" :style="sourceStyle('2294:7774')">{{ doctor.hospital }}</p>
      <p :style="sourceStyle('2294:7790')">{{ doctor.institutionIntro }}</p>
      <p :style="sourceStyle('2294:7790')">{{ doctor.institutionEnvironment }}</p>
    </template>
  </section>
</template>

<style scoped>
.dental-document-content { position:relative; padding-top:16px; width:100%; box-sizing:border-box; }
.dental-document-content__institution { width:100%!important; margin-bottom:16px!important; }
.dental-document-content__section { padding-top:24px; }
.dental-document-content__section h3 { width:100%!important; }
.dental-document-content ul { display:flex; flex-direction:column; gap:12px; margin:12px 0 0; padding:0; list-style:none; }
.dental-document-content li { display:flex; align-items:flex-start; gap:8px; }
.dental-document-content li img { flex:0 0 16px; width:16px; height:16px; margin-top:4px; }
.dental-document-content li span { flex:1; width:auto!important; }
.dental-document-content__reference-price { width:100%!important; margin-top:24px!important; }
.dental-document-content__review + .dental-document-content__review { margin-top:16px!important; }
.dental-document-content__case + .dental-document-content__case { margin-top:16px!important; }
.dental-document-content__review h3,.dental-document-content__review p { width:100%!important; }
.dental-document-content--institution { padding-top:28px; }
.dental-document-content--institution p + p { margin-top:24px!important; }
</style>
