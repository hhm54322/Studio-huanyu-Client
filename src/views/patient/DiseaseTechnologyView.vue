<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import source from '../../../docs/figma-source/diseases/content-2026-09-29.json'

const query = ref('')
const services = source.cards
const filtered = computed(() => services.filter(item =>
  `${item.name}${item.cases}${item.feature}`.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase()),
))
const icon = (id: string) => `/images/figma/disease-source/node-${id.replace(':', '-')}.svg`
function openConsultation() {
  window.dispatchEvent(new CustomEvent('open-consultation'))
}
const motionReady = ref(false)
let cardObserver: IntersectionObserver | null = null
function observeCards() {
  if (!cardObserver) return
  document.querySelectorAll('.disease-card:not(.is-entered)').forEach(card => cardObserver!.observe(card))
}
onMounted(() => {
  if (window.matchMedia('(max-width:600px), (prefers-reduced-motion:reduce)').matches || typeof IntersectionObserver === 'undefined') return
  cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-entered')
      cardObserver!.unobserve(entry.target)
    })
  }, { threshold:.08, rootMargin:'0px 0px -8% 0px' })
  motionReady.value = true
  observeCards()
})
watch(query, async () => { await nextTick(); observeCards() })
onBeforeUnmount(() => cardObserver?.disconnect())
</script>

<template>
  <div class="disease-page" :class="{ 'disease-page--motion': motionReady }" data-figma-node="144:4380">
    <div data-figma-node="144:4381">
      <div class="disease-main" data-figma-node="144:4382">
        <section class="disease-hero" data-figma-node="144:4383">
          <div class="disease-hero__content" data-figma-node="144:4384" data-reveal>
            <div class="disease-hero__copy" data-figma-node="144:4385">
              <div data-figma-node="144:4386"><h1 data-figma-node="144:4387">专科诊疗</h1></div>
              <div data-figma-node="144:4388"><p data-figma-node="144:4389">按疾病查找治疗方案，获取权威专家建议</p></div>
            </div>
          </div>
        </section>
        <section class="disease-directory" data-figma-node="144:4390">
          <div class="disease-source-hidden" aria-hidden="true" v-html="source.hiddenHtml" />
          <div class="disease-search-row" data-figma-node="144:4396">
            <label class="disease-search" data-figma-node="144:4397">
              <img :src="icon('144:4398')" data-figma-node="144:4398" alt="" />
              <div class="disease-input-wrap" data-figma-node="144:4401">
                <input v-model="query" data-figma-node="144:4402" type="search" aria-label="搜索疾病" placeholder="搜索疾病" />
              </div>
            </label>
          </div>
          <div class="disease-grid" :class="{ 'disease-grid--filtered': query.trim() }" data-figma-node="144:4403">
            <component :is="item.path ? 'RouterLink' : 'article'" v-for="item in filtered" :key="item.nodeId"
              :to="item.path || undefined" :data-figma-node="item.nodeId" class="disease-card">
              <img class="disease-card-icon" :src="item.icon" :data-figma-node="item.iconNodeId" alt="" />
              <div class="disease-card__body" :data-figma-node="item.bodyNodeId">
                <div :data-figma-node="item.headingNodeId"><h2 :data-figma-node="item.titleNodeId">{{ item.name }}</h2></div>
                <div class="disease-card__rows" :data-figma-node="item.rowsNodeId">
                  <p :data-figma-node="item.hospitalNodeId">合作医院：<strong>{{ item.hospitals }}</strong></p>
                  <p :data-figma-node="item.casesNodeId">{{ item.cases }}</p>
                  <p :data-figma-node="item.featureNodeId">{{ item.feature }}</p>
                </div>
              </div>
            </component>
          </div>
          <div v-if="!filtered.length" class="disease-empty" role="status">
            <h2>暂未找到相关疾病</h2>
            <p>可以直接向阿宁描述病情，我们会协助匹配对应方向。</p>
            <button type="button" @click="query = ''">查看全部疾病</button>
          </div>
        </section>
        <section class="disease-cta" data-figma-node="144:4572">
          <div data-figma-node="144:4573">
            <div class="disease-cta__content" data-figma-node="144:4574" data-reveal>
              <div class="disease-cta__heading" data-figma-node="144:4575"><h2 data-figma-node="144:4576">没有找到您的疾病？问阿宁帮您解答</h2></div>
              <div class="disease-cta__actions" data-figma-node="144:4577">
                <RouterLink to="/report" data-figma-node="144:4578"><img :src="icon('144:4579')" data-figma-node="144:4579" alt="" /><span data-figma-node="144:4581">提交病历</span></RouterLink>
                <button type="button" data-figma-node="144:4582" @click="openConsultation"><img :src="icon('144:4583')" data-figma-node="144:4583" alt="" /><span data-figma-node="144:4585">免费咨询阿宁</span></button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style src="../../../docs/figma-source/diseases/dev-styles-2026-09-29.css"></style>
<style scoped>
.disease-page { margin-top:-64px; color:#1e3a5f; }
.disease-page h1,.disease-page h2,.disease-page p { margin:0; }
.disease-page * { box-sizing:border-box; letter-spacing:0; }
.disease-source-hidden { display:none; }
.disease-page .disease-hero { overflow:hidden; }
.disease-page .disease-hero__copy { width:644px; }
.disease-page .disease-search input { width:100%; padding:0; border:0; outline:0; background:transparent; color:#1e3a5f; }
.disease-page .disease-search input::placeholder { color:#9ca3af; }
.disease-page .disease-search:focus-within { border-color:#2563eb; outline:3px solid rgb(37 99 235 / 10%); }
.disease-page .disease-card__rows strong { color:#2563eb; font-weight:500; }
.disease-page .disease-grid--filtered .disease-card { grid-row:auto; grid-column:auto; }
.disease-page .disease-cta__actions>a { width:140px; }
.disease-page .disease-cta__actions>button { width:176px; }
.disease-page .disease-cta__actions button { cursor:pointer; background:transparent; }
.disease-empty { width:min(1216px,100%); padding:64px 24px; text-align:center; }
.disease-empty h2 { font-size:24px; line-height:32px; }
.disease-empty p { padding:16px 0; color:#4b5563; }
.disease-empty button { color:#2563eb; cursor:pointer; }
.disease-page a:focus-visible,.disease-page button:focus-visible { outline:3px solid #2563eb; outline-offset:4px; }
.disease-page .disease-card { transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1),box-shadow .35s ease; }
.disease-page--motion .disease-card:not(.is-entered) { opacity:0; transform:translateY(18px); }
.disease-page .disease-cta__actions>a,.disease-page .disease-cta__actions>button { transition:transform .25s ease,box-shadow .25s ease; }
@media (hover:hover) and (pointer:fine) {
  .disease-page .disease-card.is-entered:hover { transform:translateY(-6px); box-shadow:0 18px 38px rgb(22 58 89 / 10%); }
  .disease-page .disease-cta__actions>a:hover,.disease-page .disease-cta__actions>button:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgb(30 58 95 / 12%); }
}
@media (prefers-reduced-motion:reduce) {
  .disease-page .disease-card,.disease-page .disease-cta__actions>a,.disease-page .disease-cta__actions>button { opacity:1!important; transform:none!important; transition:none; }
}
@media (max-width:1300px) {
  .disease-page .disease-hero { padding-right:40px; padding-left:40px; }
  .disease-page .disease-hero__content,.disease-page .disease-search-row,.disease-page .disease-grid { width:100%; }
  .disease-page .disease-cta__content { width:100%; }
  .disease-page .disease-cta__actions { width:100%; }
}
@media (max-width:1000px) {
  .disease-page .disease-hero__copy,.disease-page .disease-hero__copy>div { width:100%; }
  .disease-page .disease-grid { grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:none; }
  .disease-page .disease-card { grid-row:auto; grid-column:auto; }
  .disease-page .disease-search { max-width:100%; }
  .disease-page .disease-input-wrap { width:calc(100% - 24px); min-width:0; flex-shrink:1; }
}
@media (max-width:600px) {
  .disease-page .disease-hero { padding:240px 16px 48px; height:460px; background-size:auto 106.011%; background-position:65% -13.73px; }
  .disease-page .disease-hero__copy { gap:16px; }
  .disease-page .disease-hero h1 { font-size:40px; line-height:56px; }
  .disease-page .disease-hero p { max-width:290px; font-size:16px; line-height:24px; }
  .disease-page .disease-directory { padding:48px 16px; }
  .disease-page .disease-grid { grid-template-columns:minmax(0,1fr); padding-top:32px; gap:16px; }
  .disease-page .disease-card { height:300px; }
  .disease-page .disease-cta { padding:48px 0; }
  .disease-page .disease-cta__content { padding:0 16px; }
  .disease-page .disease-cta h2 { font-size:28px; line-height:40px; }
  .disease-page .disease-cta__actions { padding-top:32px; flex-direction:column; }
  .disease-page .disease-cta__actions>a,.disease-page .disease-cta__actions>button { width:100%; justify-content:center; }
}
</style>
