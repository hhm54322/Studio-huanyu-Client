<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DentalSourceCanvas from '@/components/common/DentalSourceCanvas.vue'
import HomeSourceNode, { type HomeSourceAction, type HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'
import ImplantAnimation from '@/components/common/ImplantAnimation.vue'
import ImplantFilm from '@/components/common/ImplantFilm.vue'
import ImplantFaq from '@/components/common/ImplantFaq.vue'
import { useSiteCopy } from '@/i18n/siteCopy'
import { implantMediaCopy } from '@/i18n/implantMedia'
import { adaptSourceToMobile } from '@/utils/adaptSourceToMobile'
import { sourceAtOrigin } from '@/utils/sourceAtOrigin'
import source from '../../../docs/figma-source/november-revision-2026-11-23/implant/source-tree-2026-11-23.json'

const { tx, locale } = useSiteCopy()
const mediaCopy = computed(() => implantMediaCopy[locale.value])
const route = useRoute()
const router = useRouter()
const sourceRoot: HomeSourceNodeData = structuredClone(source.root)
const heroArrow = '/images/figma/dental-implants-2026-11-23/node-4542-4819.svg'
function normalizeHeroArrows(layer: HomeSourceNodeData) {
  if (['4542:3544', '4542:3549'].includes(layer.id)) {
    layer.svg = heroArrow
    layer.children = []
    return
  }
  layer.children.forEach(normalizeHeroArrows)
}
normalizeHeroArrows(sourceRoot)
const byId = new Map<string, HomeSourceNodeData>()
function collect(node: HomeSourceNodeData) {
  byId.set(node.id, node)
  node.children.forEach(collect)
}
collect(sourceRoot)
const node = (id: string) => byId.get(id)!
const id = (number: number) => `4542:${number}`
const get = (number: number) => node(id(number))
const imageUrl = (layer: HomeSourceNodeData) => layer.css.match(/url\(["']?([^)"']+)/)?.[1] ?? ''
const poster = imageUrl(get(3781))
const filmLogo = '/images/brand/univadoc-2026-11-24-light.png'
// The client's demo animates the existing photographs rather than providing
// separate GIFs. Keep each Figma image as the source and animate a clipped
// paint layer, leaving the authored frame, crop and content geometry intact.
const movingPhotos = [3556, 3616, 3801, 3849, 3888, 4073, 4153, 4217, 4412, 4521, 4568, 4695, 4773].map(id)
movingPhotos.push('4548:7245')
const movingDiagrams = [3873, 3979, 3988, 4305, 4339, 4373].map(id)
const motionDelays: Record<string, string> = { [id(3988)]: '-3s', [id(4339)]: '-2s', [id(4373)]: '-4s' }
const motionAttributes: Record<string, Record<string, string>> = {}
const motionStyles: Record<string, string> = {}
const observedPhotos = new Set<HTMLElement>()
for (const key of [...movingPhotos, ...movingDiagrams]) {
  const photo = node(key)
  const background = photo.css.match(/(?:^|\n)background:\s*([^;]+);/)?.[1]
  if (!background) continue
  motionAttributes[key] = { 'data-implant-motion': movingDiagrams.includes(key) ? 'soft' : 'photo' }
  motionStyles[key] = `background:none;overflow:hidden;--implant-motion-background:${background};--implant-motion-delay:${motionDelays[key] || '0s'};`
}
const headings: Record<string, 'h1' | 'h2' | 'h3' | 'h4' | 'section' | 'article' | 'nav'> = { [id(3537)]: 'h1' }
for (const layer of byId.values()) {
  const heading = layer.name.match(/^Heading (2|3|4)$/)?.[1]
  if (heading) headings[layer.id] = `h${heading}` as 'h2' | 'h3' | 'h4'
}
const sections = {
  'what-it-is': id(3601), allon: id(3876), 'how-it-works': id(4141),
  'real-cases': id(4284), reviews: id(4400), faq: '4548:7233',
}
type Anchor = keyof typeof sections
const tabs = (Object.keys(sections) as Anchor[]).map((anchor, index) => ({
  anchor, id: id(3589 + index * 2), stickyId: id(5202 + index * 2), textId: id(3590 + index * 2),
}))
const topStrip = get(3588)
const faqId = sections.faq
const animationId = id(3674)
const filmId = id(3780)
const anatomyId = id(3629)
const anatomy = sourceAtOrigin(node(anatomyId))
const slotNodes = [animationId, filmId]
const faqHeight = node('4548:7234').y + node('4548:7248').y
const hideNested = [node('4548:7248').id, ...slotNodes.flatMap(key => node(key).children.map(child => child.id))]
const texts: Record<string, string> = {
  // Keep the source typography when the whole translated heading replaces
  // its Chinese rich-text runs.
  [id(3535)]: '种植牙 · 国际患者', [id(3582)]: '病例均基于 CBCT 三维影像规划',
  [id(3587)]: '标准全口病例通常需要两次行程', [id(3592)]: '全口种植 4/6',
  [id(3594)]: '治疗流程', [id(3600)]: '常见问题',
  [id(3613)]: '种植牙不是「假牙」，而是把牙根补回去。下面的动画演示三个部件的安装顺序。',
  [id(3773)]: '每一步都有英文说明、九步进度条和 Univadoc 标志',
  // Translate the exact source entry, then correct the source typo only for
  // Chinese. A changed string has a different catalog identity.
  [id(3862)]: get(3862).text,
  [id(3885)]: '当一整排牙即将脱落或已经缺失时，无需逐颗种植。把 4 或 6 颗植体固定在骨量最好的位置，再以螺丝固定一排 12–14 颗牙的固定桥。这就是 All-on-4 / All-on-6。植体位置通过 CBCT 扫描和数字化规划确定。',
  [id(3900)]: get(3900).text,
}
const displayTexts = computed(() => locale.value === 'zh' ? { ...texts,
  [id(3862)]: texts[id(3862)]!.replace('治疗让划', '治疗计划'),
  [id(3900)]: texts[id(3900)]!.replace('手术当天或次月', '手术当天或次日'),
} : texts)
const anchors = Object.fromEntries(Object.entries(sections).map(([name, key]) => [key, name])) as Record<string, Anchor>
const sectionSources = get(3531).children.filter(layer => layer.visible && layer.id !== topStrip.id).map(layer => {
  const prepared = layer.id === faqId ? {
    ...layer,
    height: faqHeight,
    children: layer.children.filter(child => child.id === '4548:7234').map(child => ({
      ...child,
      height: node('4548:7248').y,
      css: `${child.css};height:${node('4548:7248').y}px;`,
    })),
  } : layer
  const background = prepared.css.match(/(?:^|\n)background:\s*([^;]+);/)?.[1]
  return { original: layer, background, desktop: { ...sourceAtOrigin(prepared), css: `${prepared.css};height:${prepared.height}px;overflow:visible;` }, mobile: adaptSourceToMobile(prepared), anchor: anchors[layer.id] }
})
const uploadPath = '/dental?step=3&project=implant'
const actions: Record<string, HomeSourceAction> = {
  [id(3542)]: { href: uploadPath }, [id(3547)]: { action: 'how-it-works' },
  [id(4399)]: { action: 'consultation' },
  [id(4817)]: { href: uploadPath }, [id(4822)]: { action: 'faq' },
  [id(4906)]: { href: '/', label: '寰宇云医首页' },
}
const width = ref(typeof window === 'undefined' ? 1440 : window.innerWidth)
const desktop = computed(() => width.value > 900)
const scrollTop = ref(0)
const activeAnchor = ref<Anchor>('what-it-is')
const bottom = ref<HTMLElement>()
const pageRoot = ref<HTMLElement>()
const bottomReleased = ref(false)
let scrollFrame = 0
let resizeObserver: ResizeObserver | undefined
let imageMotionObserver: IntersectionObserver | undefined
let motionSetup = 0
const backIcon = '/images/figma/dental-implants-2026-11-23/node-4542-5419.svg'
const returnQuery = computed(() => ({ step: '1', ...(route.query.lang ? { lang: route.query.lang } : {}) }))
function readScroll() {
  scrollFrame = 0
  scrollTop.value = window.scrollY
  const section = [...tabs].reverse().find(item => (document.getElementById(item.anchor)?.getBoundingClientRect().top ?? Infinity) <= 156)
  activeAnchor.value = section?.anchor || 'what-it-is'
  bottomReleased.value = (bottom.value?.getBoundingClientRect().bottom ?? Infinity) <= window.innerHeight
}
function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(readScroll) }
function onResize() { width.value = window.innerWidth; scheduleScroll() }
function seek(anchor: Anchor | 'consultation') {
  if (anchor === 'consultation') {
    window.dispatchEvent(new CustomEvent('open-consultation'))
    return
  }
  if (!(anchor in sections)) return
  if (route.hash !== `#${anchor}`) void router.replace({ hash: `#${anchor}`, query: route.query })
  else document.getElementById(anchor)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
const mobileStyles = {
  [id(3532)]: 'padding-top:62px;',
  [id(3567)]: 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;',
  ...Object.fromEntries([3568,3569,3571,3573,3574,3576,3578,3579,3581,3583,3584,3586].map(layer => [id(layer), 'width:100%;min-width:0;flex-wrap:wrap;'])),
  [id(3560)]: 'display:none;',
  [id(3602)]: 'padding:0;',
  [id(3628)]: 'padding:16px;',
  [anatomyId]: 'display:none;',
  [id(3674)]: 'margin:0;overflow:visible;display:block;',
  [id(3758)]: 'display:flex;flex-direction:column-reverse;',
  [id(3780)]: 'width:100%;height:auto;margin:0;position:relative;inset:auto;',
  [id(4807)]: 'min-height:0;height:auto;',
}
const mobileAnatomyScale = computed(() => Math.min(1, (width.value - 74) / anatomy.width))
async function setupPhotoMotion() {
  const request = ++motionSetup
  await nextTick()
  if (request !== motionSetup || !pageRoot.value) return
  imageMotionObserver?.disconnect()
  observedPhotos.clear()
  const photos = [...pageRoot.value.querySelectorAll<HTMLElement>('[data-implant-motion]')]
  if (!('IntersectionObserver' in window)) {
    photos.forEach(photo => { photo.dataset.motionVisible = 'true'; photo.dataset.motionSeen = 'true' })
    return
  }
  imageMotionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const photo = entry.target as HTMLElement
      photo.dataset.motionVisible = entry.isIntersecting ? 'true' : 'false'
      if (entry.isIntersecting) photo.dataset.motionSeen = 'true'
    }
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' })
  photos.forEach(photo => {
    observedPhotos.add(photo)
    if (!photo.dataset.motionSeen) photo.dataset.motionSeen = 'false'
    imageMotionObserver!.observe(photo)
  })
}
function syncPhotoVisibility() {
  if (!pageRoot.value) return
  const photos = [...pageRoot.value.querySelectorAll<HTMLElement>('[data-implant-motion]')]
  if (photos.length !== observedPhotos.size || photos.some(photo => !observedPhotos.has(photo))) void setupPhotoMotion()
}
watch(desktop, () => { void setupPhotoMotion() }, { flush: 'post' })
onMounted(() => {
  addEventListener('scroll', scheduleScroll, { passive: true })
  addEventListener('resize', onResize, { passive: true })
  resizeObserver = new ResizeObserver(scheduleScroll)
  if (bottom.value) resizeObserver.observe(bottom.value)
  scheduleScroll()
  const anchor = route.hash.slice(1) as Anchor
  if (anchor in sections) document.getElementById(anchor)?.scrollIntoView({ behavior: 'instant' })
  void setupPhotoMotion()
})
onBeforeUnmount(() => {
  motionSetup++
  imageMotionObserver?.disconnect()
  observedPhotos.clear()
  removeEventListener('scroll', scheduleScroll)
  removeEventListener('resize', onResize)
  resizeObserver?.disconnect()
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
})
</script>

<template>
  <div ref="pageRoot" class="implant-page" :class="{ 'implant-page--mobile': !desktop }" data-figma-node="4542:3529">

    <template v-for="section in sectionSources" :key="section.original.id">
      <nav v-if="section.anchor === 'what-it-is'" class="implant-page__nav" :aria-label="tx('种植牙页面导航')"
        :data-figma-node="scrollTop >= 969 ? '4542:5201' : '4542:3588'">
        <a v-for="tab in tabs" :key="tab.anchor" :href="`#${tab.anchor}`" :data-figma-node="scrollTop >= 969 ? tab.stickyId : tab.id"
          :aria-current="activeAnchor === tab.anchor ? 'location' : undefined" @click.prevent="seek(tab.anchor)">
          {{ tx(texts[tab.textId] || node(tab.textId).text) }}
        </a>
      </nav>
      <section :id="section.anchor" class="implant-page__section" :style="desktop && section.background ? { background: section.background } : undefined">
        <component :is="desktop ? DentalSourceCanvas : HomeSourceNode" :node="desktop ? section.desktop : section.mobile"
          :width="desktop ? width : undefined" :height="desktop ? section.desktop.height : undefined" :fluid="!desktop" :root="!desktop"
          :actions="actions" :tags="headings" :hidden="hideNested" :texts="displayTexts" :attributes="motionAttributes"
          :styles="desktop ? { ...motionStyles, [section.original.id]: 'background:transparent;', ...(locale !== 'zh' ? { [id(3537)]: 'color:#13202a;font-family:PingFang SC,sans-serif;font-size:56px;font-weight:600;line-height:72px;' } : {}) } : { ...mobileStyles, ...motionStyles }" :defer-images="section.original.y > 1000"
          @layout="syncPhotoVisibility" @activate="(name: string) => seek(name as Anchor | 'consultation')">
          <template #after="{ node: layer }">
            <ImplantAnimation v-if="layer.id === animationId" @complete="seek('allon')" />
            <ImplantFilm v-else-if="layer.id === filmId" :poster="poster" :play-icon="get(3783).svg || ''"
              :duration="tx(get(3785).text)" :logo="filmLogo" />
            <div v-else-if="!desktop && layer.id === id(3628)" class="implant-page__anatomy"
              :style="{ height: `${anatomy.height * mobileAnatomyScale}px` }">
              <HomeSourceNode :node="anatomy" root :styles="{ [anatomyId]: `transform:scale(${mobileAnatomyScale});transform-origin:top left;` }" />
            </div>
          </template>
        </component>
        <div v-if="section.anchor === 'what-it-is'" class="implant-page__transcript">
          <details>
            <summary>{{ mediaCopy.transcript }}</summary>
            <ol><li v-for="(chapter, index) in mediaCopy.chapters" :key="chapter"><b aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</b><span>{{ chapter }}</span></li></ol>
          </details>
        </div>
        <div v-if="section.anchor === 'faq'" class="implant-page__faq">
          <ImplantFaq />
        </div>
      </section>
    </template>
    <div ref="bottom" class="implant-page__back-track">
      <div class="implant-page__back" :class="{ 'implant-page__back--fixed': scrollTop >= 969 && !bottomReleased }"
        data-figma-node="4542:5416">
        <RouterLink :to="{ path: '/dental', query: returnQuery }" data-figma-node="4542:5418">
          <img :src="backIcon" alt="" width="16" height="16" data-figma-node="4542:5419" />
          <span data-figma-node="4542:5422">{{ tx('返回选择牙科项目') }}</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.implant-page { position:relative;width:100%;color:#13202a;background:#fff; }
.implant-page__header { position:absolute;z-index:12;top:0;left:0;right:0; }
.implant-page__section { position:relative;scroll-margin-top:68px; }
.implant-page__section :deep([data-implant-motion]) { isolation:isolate; }
.implant-page__section :deep([data-implant-motion][data-motion-seen]) { transition:opacity .75s ease,translate .75s cubic-bezier(.2,.75,.25,1); }
.implant-page__section :deep([data-implant-motion][data-motion-seen="false"]) { opacity:0;translate:0 36px; }
.implant-page__section :deep([data-implant-motion][data-motion-seen="true"]) { opacity:1;translate:0 0; }
.implant-page__section :deep([data-implant-motion]::before) { content:'';position:absolute;inset:0;border-radius:inherit;background:var(--implant-motion-background);pointer-events:none;transform-origin:center;backface-visibility:hidden;animation:implant-photo-pan 6s ease-in-out infinite;animation-delay:var(--implant-motion-delay,0s);animation-play-state:paused;transition:opacity .75s ease,filter .75s ease; }
.implant-page__section :deep([data-implant-motion="soft"]::before) { animation-name:implant-photo-pan-soft;animation-duration:8s; }
.implant-page__section :deep([data-implant-motion][data-motion-visible="true"]::before) { animation-play-state:running; }
@keyframes implant-photo-pan { 0%,100% { transform:scale(1.10) translate(-5%,-3%); } 50% { transform:scale(1.42) translate(5%,3%); } }
@keyframes implant-photo-pan-soft { 0%,100% { transform:scale(1.05) translate(-3%,-2%); } 50% { transform:scale(1.22) translate(3%,2%); } }
.implant-page__section :deep([data-figma-node="4542:3620"]) { max-width:100%; }
.implant-page:not(:lang(zh)) :deep(:is([data-figma-node="4542:4160"],[data-figma-node="4542:4169"],[data-figma-node="4542:4178"],[data-figma-node="4542:4187"],[data-figma-node="4542:4196"])) { left:0!important; top:0!important; width:38px!important; height:38px!important; line-height:38px!important; text-align:center!important; white-space:nowrap!important; }
.implant-page:not(:lang(zh)) :deep(:is([data-figma-node="4542:4166"],[data-figma-node="4542:4175"],[data-figma-node="4542:4184"],[data-figma-node="4542:4193"],[data-figma-node="4542:4202"])) { text-align:left!important; overflow-wrap:normal!important; }
.implant-page__nav { display:grid;grid-template-columns:repeat(6,minmax(0,1fr));position:sticky;z-index:20;top:64px;min-height:63px;border-bottom:1px solid #eaecf0;background:#fff; }
.implant-page__nav a { display:grid;place-content:center;min-height:62px;padding:8px;color:#4b5563;text-align:center;text-decoration:none;font-size:16px;font-weight:500;line-height:22px; }
.implant-page__nav a:not(:last-child) { border-right:1px solid #eaecf0; }
.implant-page__nav a[aria-current] { color:#2563eb; }
.implant-page__nav a:hover { background:#f5f8ff; }
.implant-page__transcript { width:min(calc(100% - 40px),1216px);margin:-64px auto 0;position:relative;padding-bottom:64px; }
.implant-page__transcript details { max-width:596px;padding:16px;border:1px solid #e3e8ec;border-radius:12px;background:#fff; }
.implant-page__transcript summary { display:flex;align-items:flex-start;gap:10px;list-style:none;cursor:pointer;color:#13202a;font-size:14px;font-weight:600;line-height:22px; }
.implant-page__transcript summary::-webkit-details-marker { display:none; }
.implant-page__transcript summary::before { content:'+';flex:none;color:#217b8c;font-weight:700; }
.implant-page__transcript details[open] summary::before { content:'−'; }
.implant-page__transcript ol { display:grid;margin:14px 0 0;padding:0;list-style:none; }
.implant-page__transcript li { display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px;border-top:1px solid #e3e8ec;padding:10px 0;color:#4a5a66;font-size:14px;line-height:22px;overflow-wrap:anywhere; }
.implant-page__transcript li b { color:#217b8c;font-weight:700; }
.implant-page__faq { position:relative;margin:auto;padding:48px 0 96px;width:min(calc(100% - 40px),1216px); }
.implant-page__faq :deep(summary) { scroll-margin:88px 0 92px; }
.implant-page__section:has(.implant-page__faq) { background:#f5f6f7; }
.implant-page__back-track { min-height:80px; }
.implant-page__back { display:flex;align-items:center;justify-content:center;width:100%;min-height:80px;padding:12px 18px;border-top:1px solid #eaecf0;background:#fff;z-index:38; }
.implant-page__back--fixed { position:fixed;bottom:0;left:0; }
.implant-page__back a { display:flex;justify-content:center;align-items:center;gap:8px;min-width:199px;min-height:48px;max-width:100%;padding:10px 24px;border-radius:14px;background:#dd6b20;color:#fff;font-size:16px;font-weight:600;text-decoration:none; }
.implant-page :is(a,summary):focus-visible { outline:2px solid #2563eb;outline-offset:-2px; }
.implant-page--mobile .implant-page__nav { display:flex;overflow-x:auto;scrollbar-width:none;min-height:49px;top:52px; }
.implant-page--mobile .implant-page__section { scroll-margin-top:115px; }
.implant-page--mobile .implant-page__nav a { flex:0 0 auto;padding:8px 14px;min-height:48px;font-size:14px;white-space:nowrap; }
.implant-page--mobile :deep(h1 span) { font-size:inherit!important;line-height:inherit!important; }
.implant-page__anatomy { order:-1;flex:none;width:100%;overflow:hidden; }
.implant-page__anatomy :deep(img) { max-width:none; }
.implant-page--mobile .implant-page__transcript { margin:0 auto;padding-bottom:38px; }
.implant-page--mobile .implant-page__faq { padding:4px 0 44px; }
.implant-page--mobile .implant-page__back { min-height:64px; }
.implant-page--mobile .implant-page__back-track { min-height:64px; }
@media (prefers-reduced-motion:reduce) { .implant-page__section :deep([data-implant-motion][data-motion-seen]) { opacity:1;translate:none;transition:none; }.implant-page__section :deep([data-implant-motion]::before) { animation:none;transition:none;transform:none; } }
</style>
