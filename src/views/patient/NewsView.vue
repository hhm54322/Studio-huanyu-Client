<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import DentalSourceCanvas from '@/components/common/DentalSourceCanvas.vue'
import HomeSourceNode, { type HomeSourceAction, type HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'
import { useSiteCopy } from '@/i18n/siteCopy'
import { publicContacts, sourceContactEmail } from '@/data/publicContacts'
import { adaptSourceToMobile } from '@/utils/adaptSourceToMobile'
import { sourceAtOrigin } from '@/utils/sourceAtOrigin'
import source from '../../../docs/figma-source/november-revision-2026-11-23/news/source-tree-2026-11-23.json'

const { tx, tf } = useSiteCopy()
const nodes = new Map<number, HomeSourceNodeData>()
function index(layer: HomeSourceNodeData) {
  nodes.set(Number(layer.id.split(':')[1]), layer)
  layer.children.forEach(index)
}
index(source.root)
const node = (id: number) => nodes.get(id)!
const clean = (text: string) => text.replace(/[\u2e80-\u2fff]/g, character => character.normalize('NFKC')).trim().replace(/\s*\n\s*/g, '')
const copy = (id: number) => clean(tx(node(id).text))
const image = (id: number) => node(id).css.match(/url\(["']?([^)"']+)/)?.[1] || ''
const desktopWidth = ref(typeof window === 'undefined' ? 1440 : innerWidth)
const desktop = computed(() => desktopWidth.value > 900)
const resize = () => { desktopWidth.value = innerWidth }
onMounted(() => addEventListener('resize', resize, { passive: true }))
onBeforeUnmount(() => removeEventListener('resize', resize))

const articles = [
  [6137, 6140, 6142, 6145, 6148, [6151, 6153, 6155], 6159, 6163, 6168, 6115],
  [6169, 6172, 6174, 6177, 6180, [6183, 6185, 6187], 6191, 6195, 6200, 6121],
  [6201, 6204, 6206, 6209, 6212, [6215, 6217, 6219], 6223, 6227, 6232, 6121],
  [6233, 6236, 6238, 6241, 6244, [6247, 6249, 6251], 6255, 6259, 6264, 6124],
  [6265, 6268, 6270, 6273, 6276, [6279, 6281, 6283], 6287, 6291, 6296, 6115],
  [6297, 6300, 6302, 6305, 6308, [6311, 6313, 6315], 6319, 6323, 6328, 6118],
  [6329, 6332, 6334, 6337, 6340, [6343, 6345, 6347], 6351, 6355, 6360, 6115],
  [6361, 6364, 6366, 6369, 6372, [6375, 6377, 6379], 6383, 6387, 6392, 6121],
  [6393, 6395, null, 6398, 6401, [6404, 6406, 6408], 6412, 6416, 6421, 6124],
] as const
type Article = typeof articles[number]
const categories = [[6110, 6112], [6113, 6115], [6116, 6118], [6119, 6121], [6122, 6124]] as const
const trending = [[6033, 6034], [6035, 6036], [6037, 6038], [6039, 6040], [6041, 6042], [6043, 6044]] as const
const category = ref<number>(6112)
const searchInput = ref('')
const query = ref('')
const sort = ref('newest')
const results = ref<HTMLElement>()
const selected = ref<Article>()
const dialog = ref<HTMLDialogElement>()
const featured = articles[0]
const keyword = (value: string) => clean(value).normalize('NFKC').toLocaleLowerCase().replace(/[-‐‑]/g, '')
const filtered = computed(() => {
  const terms = keyword(query.value).split(/\s+/).filter(Boolean)
  const result = articles.filter(article => {
    if (category.value !== 6112 && category.value !== article[9]) return false
    const strings = [article[3], article[4], article[9], ...article[5]].flatMap(id => [node(id).text, copy(id)])
    if (article[0] === 6169 || article[0] === 6201) strings.push(node(6044).text, copy(6044))
    return terms.every(term => keyword(strings.join(' ')).includes(term))
  })
  return sort.value === 'oldest' ? [...result].reverse() : result
})
function search(term = searchInput.value) {
  searchInput.value = term
  query.value = term.trim()
  category.value = 6112
  results.value?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
function showArticle(article: Article) {
  selected.value = article
  dialog.value?.showModal()
}
function closeDialog() { dialog.value?.close() }

const routes: Record<string, string> = {
  疾病中心: '/diseases-technologies', 费用对比: '/why-china#cost-comparison', 报告体验: '/report',
  就医步骤: '/steps', 患者案例: '/cases', 保险指南: '/insurance', 关于我们: '/about',
  [sourceContactEmail]: publicContacts.emailHref, WhatsApp: publicContacts.whatsappHref, Facebook: publicContacts.facebookHref,
}
const actions: Record<string, HomeSourceAction> = {
  [node(6524).id]: { action: 'consultation' },
  [node(6529).id]: { href: '/report' },
  [node(6619).id]: { href: '/', label: '寰宇云医首页' },
}
function addFooterLinks(layer: HomeSourceNodeData) {
  const href = routes[layer.text.trim()]
  if (href) actions[layer.id] = { href }
  layer.children.forEach(addFooterLinks)
}
addFooterLinks(node(6540))
function activate(action: string) {
  if (action === 'consultation') window.dispatchEvent(new CustomEvent('open-consultation'))
}
const tags = { [node(6018).id]: 'h1', [node(6461).id]: 'h2', [node(6520).id]: 'h2' } as const
const layerIds = { hero: 6015, trust: 6458, cta: 6516 }
const sections = Object.fromEntries(Object.entries(layerIds).map(([section, id]) => {
  const original = node(id)
  const desktopSource = sourceAtOrigin(original)
  const mobileSource = adaptSourceToMobile(original)
  return [section, { desktop: desktopSource, mobile: mobileSource }]
}))
const heroHidden = [node(6022).id, node(6030).id]
const mobileStyles = {
  [node(6015).id]: 'padding-top:94px;padding-bottom:52px;min-height:0;justify-content:center;',
  [node(6021).id]: 'width:100%;',
  [node(6045).id]: 'width:100%;height:auto;',
  [node(6464).id]: 'padding:0;',
  [node(6517).id]: 'padding-top:0;',
}
</script>

<template>
  <div class="news-page" :class="{ 'news-page--mobile': !desktop }" data-figma-node="4542:5973">

    <component :is="desktop ? DentalSourceCanvas : HomeSourceNode"
      :node="desktop ? sections.hero!.desktop : sections.hero!.mobile" :width="desktop ? desktopWidth : undefined"
      :fluid="!desktop" :hidden="heroHidden" :tags="tags" :styles="desktop ? undefined : mobileStyles">
      <template #after="{ node: layer }">
        <template v-if="layer.id === '4542:6021'">
          <form class="news-search" role="search" data-figma-node="4542:6022" @submit.prevent="search()">
            <img v-if="node(6024).svg" :src="node(6024).svg" width="20" height="20" alt="" />
            <input v-model="searchInput" type="search" :placeholder="copy(6027)" :aria-label="copy(6027)"
              data-figma-node="4542:6026" maxlength="150" />
            <button type="submit" data-figma-node="4542:6028">{{ copy(6029) }}</button>
          </form>
          <div class="news-trending" data-figma-node="4542:6030">
            <span>{{ copy(6032) }}</span>
            <button v-for="[button, label] in trending" :key="button" type="button"
              :data-figma-node="node(button).id" @click="search(copy(label))">{{ copy(label) }}</button>
          </div>
        </template>
      </template>
    </component>

    <section class="news-featured" data-figma-node="4542:6054">
      <h2 data-figma-node="4542:6057">{{ copy(6057) }}</h2>
      <article class="news-feature" data-figma-node="4542:6060">
        <div class="news-feature__image">
          <img :src="image(6062)" width="587" height="368" alt="" loading="lazy" data-figma-node="4542:6062" />
          <span>{{ copy(6064) }}</span>
        </div>
        <div class="news-feature__description" data-figma-node="4542:6065">
          <p class="news-meta"><time :datetime="copy(6069)">{{ copy(6069) }}</time> · {{ copy(6076) }}</p>
          <h3 data-figma-node="4542:6083">{{ copy(6083) }}</h3>
          <p data-figma-node="4542:6085">{{ copy(6085) }}</p>
          <ul class="news-tags"><li v-for="tag in featured[5]" :key="tag">{{ copy(tag) }}</li></ul>
          <div class="news-feature__action" data-figma-node="4542:6094">
            <button class="news-read" type="button" data-figma-node="4542:6095" @click="showArticle(featured)">
              {{ tx('查看摘要') }} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </article>
    </section>

    <section ref="results" class="news-list" data-figma-node="4542:6100">
      <h2 data-figma-node="4542:6103">{{ copy(6103) }}</h2>
      <div class="news-list__inner" data-figma-node="4542:6106">
        <div class="news-filters" data-figma-node="4542:6108">
          <div class="news-categories" role="group" :aria-label="tx('内容分类')">
            <button v-for="[button, label] in categories" :key="button" type="button"
              :data-figma-node="node(button).id" :aria-pressed="category === label" @click="category = label">
              {{ copy(label) }}
            </button>
          </div>
          <label class="news-sort" data-figma-node="4542:6125">
            <span>{{ copy(6127) }}</span>
            <select v-model="sort" data-figma-node="4542:6128">
              <option value="newest">{{ copy(6130) }}</option>
              <option value="oldest">{{ tx('最早发布') }}</option>
            </select>
          </label>
        </div>
        <p class="news-count" aria-live="polite" data-figma-node="4542:6135">{{ tf('共 {count} 篇内容', { count: filtered.length }) }}
          <button v-if="query" type="button" class="news-clear" @click="search('')">{{ tx('清除搜索') }}</button>
        </p>
        <div v-if="filtered.length" class="news-articles" data-figma-node="4542:6136">
          <article v-for="article in filtered" :key="article[0]" :data-figma-node="node(article[0]).id" class="news-card">
            <div class="news-card__photo">
              <img :src="image(article[1])" width="389" height="244" alt="" loading="lazy" :data-figma-node="node(article[1]).id" />
              <span v-if="article[2]" :data-figma-node="node(article[2]).id">{{ copy(article[2]) }}</span>
            </div>
            <div class="news-card__description">
              <h3 :data-figma-node="node(article[3]).id">
                <button type="button" @click="showArticle(article)">{{ copy(article[3]) }}</button>
              </h3>
              <p :data-figma-node="node(article[4]).id">{{ copy(article[4]) }}</p>
              <ul class="news-tags"><li v-for="tag in article[5]" :key="tag" :data-figma-node="node(tag).id">{{ copy(tag) }}</li></ul>
            </div>
            <div class="news-card__footer news-meta">
              <time :datetime="copy(article[6])">{{ copy(article[6]) }}</time><span> · {{ copy(article[7]) }}</span>
              <span :data-figma-node="node(article[8]).id">{{ copy(article[8]) }}</span>
            </div>
          </article>
        </div>
        <p v-else class="news-empty">{{ tx('没有找到匹配的内容，请换个关键词。') }}</p>
      </div>
    </section>

    <component v-for="section in ['trust', 'cta']" :key="section" :is="desktop ? DentalSourceCanvas : HomeSourceNode"
      :node="desktop ? sections[section]!.desktop : sections[section]!.mobile" :width="desktop ? desktopWidth : undefined"
      :fluid="!desktop" :tags="tags" :actions="actions" :styles="desktop ? undefined : mobileStyles" defer-images @activate="activate" />
    <dialog ref="dialog" class="news-dialog" :aria-label="tx('内容摘要')" @click.self="closeDialog">
      <div v-if="selected" class="news-dialog__inner">
        <button type="button" class="news-dialog__close" :aria-label="tx('关闭')" @click="closeDialog">×</button>
        <p class="news-meta"><time :datetime="copy(selected[6])">{{ copy(selected[6]) }}</time> · {{ copy(selected[8]) }}</p>
        <h2>{{ copy(selected[3]) }}</h2>
        <p>{{ copy(selected[4]) }}</p>
        <ul class="news-tags"><li v-for="tag in selected[5]" :key="tag">{{ copy(tag) }}</li></ul>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.news-page { color:#161c24;position:relative; }
.news-header { position:absolute;inset:0 0 auto;z-index:15; }
.news-search { display:flex;align-items:center;gap:12px;width:min(100%,704px);height:56px;padding:8px 8px 8px 17px;border-radius:999px;background:#fff;box-shadow:0 12px 32px -8px #0f356f14; }
.news-search img { flex:none; }
.news-search input { flex:1;min-width:0;padding:5px 0;border:0;background:transparent;color:#161c24;font-size:16px;line-height:24px; }
.news-search button { flex:none;min-width:80px;min-height:38px;padding:6px 16px;border-radius:999px;color:#fff;background:#1e3a5f;font-size:16px;font-weight:600; }
.news-trending { display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px;padding-top:16px;color:#fff;font-size:13px;line-height:18px; }
.news-trending button { min-height:26px;padding:3px 10px;border:1px solid #fff6;border-radius:16px;background:#fff2;color:#fff; }
.news-featured,.news-list { padding:96px 20px; }
.news-featured h2,.news-list h2 { margin:0 auto 48px;color:#1e3a5f;text-align:center;font-size:40px;line-height:40px;font-weight:600;letter-spacing:.396px; }
.news-feature,.news-list__inner { width:min(100%,1216px);margin:auto; }
.news-feature { display:grid;grid-template-columns:587fr 629fr;min-height:368px;border-radius:28px;overflow:hidden;background:#f5f6f7; }
.news-feature__image,.news-card__photo { position:relative;min-width:0; }
.news-feature__image { min-height:0; }
.news-feature__image img,.news-card__photo img { display:block;width:100%;height:100%;object-fit:cover; }
.news-feature__image img,.news-card__photo img { position:absolute;inset:0; }
.news-feature__image span,.news-card__photo span { position:absolute;top:16px;left:16px;max-width:calc(100% - 32px);padding:8px 10px;border-radius:20px;background:#fff;color:#4b5563;font-size:12px;line-height:12px; }
.news-feature__description { padding:44px;display:flex;flex-direction:column;align-items:flex-start;gap:16px; }
.news-feature h3 { margin:0;font-size:24px;font-weight:600;line-height:36px;letter-spacing:-.775px; }
.news-feature__description > p:not(.news-meta) { font-size:16px;line-height:24px; }
.news-feature__action { width:100%;margin-top:auto;border-top:1px solid #1e3a5f0d;padding-top:20px; }
.news-feature__action button { font-size:14.5px;line-height:21.75px; }
.news-feature p,.news-card p { margin:0;color:#4b5563; }
.news-meta,.news-count { color:#6b7280;font-size:13px; }
.news-tags { display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin:0;padding:0; }
.news-tags li { padding:8px 12px;border-radius:16px;background:#f5f6f7;color:#6b7280;font-size:12px;line-height:12px; }
.news-feature .news-tags li { background:#fff; }
.news-read,.news-clear { color:#2563eb;font-weight:600; }
.news-list { background:#f5f6f7;scroll-margin-top:72px; }
.news-filters,.news-categories { display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap; }
.news-categories button { min-height:42px;padding:10px 24px;border:1px solid #dbdee6;border-radius:24px;background:transparent;color:#4b5563;font-size:16px; }
.news-categories button[aria-pressed=true] { background:#1e3a5f;border-color:#1e3a5f;color:#fff; }
.news-sort { display:flex;align-items:center;gap:8px;color:#4b5563;font-size:14px; }
.news-sort select { min-width:144px;max-width:100%;min-height:42px;padding:7px 12px;border:1px solid #dbdee6;border-radius:12px;background:transparent;font-size:16px; }
.news-count { display:flex;align-items:center;gap:12px;margin:32px 0 24px; }
.news-articles { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px; }
.news-card { display:flex;flex-direction:column;min-width:0;min-height:491px;border-radius:24px;background:#fff;overflow:hidden; }
.news-card__photo { aspect-ratio:389.333/244; }
.news-card__description { flex:1;display:grid;align-content:start;gap:12px;padding:24px; }
.news-card h3 { margin:0;color:#161c24;font-size:20px;font-weight:600;line-height:30px; }
.news-card h3 button { text-align:left; }
.news-card h3 button:hover { color:#2563eb; }
.news-card p { font-size:14px;line-height:22px; }
.news-card__footer { display:flex;flex-wrap:wrap;gap:4px;padding:12px 24px 20px; }
.news-card__footer span:last-child { margin-inline-start:auto; }
.news-empty { padding:32px 0;text-align:center;color:#4b5563; }
.news-page :is(input,button,select,a):focus-visible { outline:2px solid #2563eb;outline-offset:2px; }
.news-dialog { max-width:min(calc(100% - 32px),560px);width:100%;max-height:calc(100dvh - 48px);margin:auto;padding:0;border:0;border-radius:24px;background:white;color:#161c24; }
.news-dialog::backdrop { background:#13202a88; }
.news-dialog__inner { position:relative;padding:32px; }
.news-dialog h2 { margin:14px 0;font-size:24px;line-height:1.3;font-weight:600; }
.news-dialog .news-tags { margin-top:16px; }
.news-dialog__close { position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;background:#f5f6f7;font-size:24px; }
@media(max-width:900px) {
  .news-featured,.news-list { padding:48px 20px; }
  .news-featured h2,.news-list h2 { margin-bottom:24px;font-size:28px;line-height:1.25; }
  .news-feature { grid-template-columns:1fr; }
  .news-feature__image { aspect-ratio:587/368; }
  .news-feature__description { padding:24px; }
  .news-articles { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .news-feature h3 { font-size:24px; }
}
@media(max-width:540px) {
  .news-articles { grid-template-columns:1fr; }
  .news-filters,.news-categories { gap:8px; }
  .news-categories button { padding-inline:12px;font-size:14px; }
  .news-search { gap:7px;padding-left:10px; }
  .news-search button { min-width:60px;padding-inline:10px; }
  .news-card { min-height:0; }
}
</style>
