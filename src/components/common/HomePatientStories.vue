<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import HomeFigmaSection from './HomeFigmaSection.vue'
import { homeSourceText } from '@/data/homeFigmaSource'
import { useAutoplayCarousel } from '@/composables/useAutoplayCarousel'
import caseSource from '../../../docs/figma-source/cases/content-2026-09-29.json'

const emit = defineEmits<{ activate: [action: string, event: MouseEvent] }>()
const root = ref<HTMLElement | null>(null)
// The initial frame is untouched. Extra slides reuse existing Figma content,
// rather than inventing quotations, outcomes or unrelated patient portraits.
const cases = caseSource.cards.map(card => ({
  badge: card.title,
  copy: card.rows[0]!.text.replace(/^患者背景：:?/, '').replace(/压迫险/g, '压迫风险').replace(/手术险/g, '手术风险'),
  detail: card.rows[2]!.text,
  byline: `${card.name} · ${card.metadata}`,
  mobileByline: `— ${card.name}`,
  image: card.avatar.src,
  href: '/cases',
}))
const stories = [
  {
    badge: homeSourceText('1412:5866'), copy: homeSourceText('1412:5868'),
    detail: homeSourceText('1412:5875'), byline: homeSourceText('1412:5891'),
    mobileByline: '— 新西兰患者', image: '', href: '',
  },
  ...cases,
  {
    badge: '新加坡患者· 肿瘤综合治疗',
    copy: '在新加坡排期3个月，来华11天完成全套评估与治疗方案制定。',
    detail: '', byline: '新加坡患者· 肿瘤综合治疗', mobileByline: '— 新加坡患者',
    image: '/images/figma/why-story-singapore-source-2x.png', href: '/why-china',
  },
  {
    badge: '马来西亚患者· All-on6半口种植',
    copy: '对比本地报价，来华完成种植修复，节省大量费用，医生沟通顺畅',
    detail: '', byline: '马来西亚患者· All-on6半口种植', mobileByline: '— 马来西亚患者',
    image: '/images/figma/why-story-malaysia-source-2x.png', href: '/why-china',
  },
]
const { activeIndex, select, paused, togglePause } = useAutoplayCarousel(root, stories.length)
const selected = computed(() => stories[activeIndex.value]!)
// Keep the source controls mounted when a slide changes. Replacing the whole
// section loses keyboard focus and incorrectly resumes autoplay after a click.
watch(activeIndex, async () => {
  await nextTick()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  root.value?.querySelectorAll<HTMLElement>('[data-figma-node="1466:843"], [data-figma-node="1412:5863"], [data-figma-node="1528:365"], [data-figma-node="1528:372"]').forEach(element => {
    element.getAnimations().forEach(animation => animation.cancel())
    element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)' })
  })
})
const desktopDots = ['1412:5898', '1412:5899', '1412:5900', '1412:5901', '1412:5902']
const mobileDots = ['1528:367', '1528:368', '1528:369', '1528:370', '1528:371']
const actions = computed(() => ({
  ...Object.fromEntries([...desktopDots, ...mobileDots].map((id, index) => [id, { action: `select:${index % stories.length}`, label: `查看第${index % stories.length + 1}个患者故事` }])),
  ...Object.fromEntries(['1412:5892', '1528:386'].map(id => [id, selected.value.href ? { href: selected.value.href } : { action: 'story:detail', label: '查看患者故事' }])),
}))
const attributes = computed(() => Object.fromEntries([...desktopDots, ...mobileDots].map((id, index) => [id, { 'aria-pressed': index % stories.length === activeIndex.value }])))
const texts = computed(() => activeIndex.value ? {
  '1412:5866': selected.value.badge, '1528:375': selected.value.badge,
  '1412:5868': selected.value.copy, '1528:376': selected.value.copy,
  '1412:5875': selected.value.detail, '1528:382': selected.value.detail,
  '1412:5891': selected.value.byline, '1528:385': selected.value.mobileByline,
} : undefined)
const styles = computed(() => {
  let left = 0
  const dots = Object.fromEntries(desktopDots.map((id, index) => {
    const width = index === activeIndex.value ? 32 : 10
    const style = `left:${left}px;width:${width}px;background:${index === activeIndex.value ? '#DD6B20' : 'rgba(255,255,255,.20)'};`
    left += width + 8
    return [id, style]
  }))
  const mobile = Object.fromEntries(mobileDots.map((id, index) => [id, `background:${index === activeIndex.value ? '#DD6B20' : 'rgba(255,255,255,.20)'};`]))
  if (!activeIndex.value) return { ...dots, ...mobile }
  return {
    ...dots, ...mobile,
    ...Object.fromEntries(['1466:843', '1528:365'].map(id => [id, `background-image:url('${selected.value.image}');background-size:cover;background-position:center;`])),
    '1412:5865': 'width:max-content;max-width:100%;',
    '1412:5866': 'position:relative;left:0;top:0;width:auto;padding:4px 12px;white-space:pre-wrap;height:auto;',
    '1412:5868': 'height:auto;white-space:pre-wrap;',
    '1412:5869': 'width:100%;', '1412:5870': 'width:100%;', '1412:5874': 'width:calc(100% - 24px);',
    '1412:5875': 'width:100%;height:auto;white-space:pre-wrap;',
    '1412:5886': 'width:calc(100% - 156px);', '1412:5889': 'width:calc(100% - 17px);', '1412:5890': 'width:100%;',
    '1412:5891': 'width:100%;height:auto;white-space:pre-wrap;',
    '1528:374': 'width:max-content;max-width:100%;',
    '1528:375': 'width:auto;max-width:100%;height:auto;white-space:pre-wrap;',
    '1528:377': 'width:100%;', '1528:381': 'width:calc(100% - 20px);', '1528:382': 'width:100%;height:auto;white-space:pre-wrap;',
    '1528:384': 'width:auto;', '1528:385': 'width:auto;height:auto;white-space:pre-wrap;',
    ...(!selected.value.detail ? { '1412:5869': 'visibility:hidden;', '1528:377': 'visibility:hidden;' } : {}),
  }
})
function activate(action: string, event: MouseEvent) {
  if (action.startsWith('select:')) select(Number(action.split(':')[1]))
  else emit('activate', action, event)
}
function handleKey(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  event.preventDefault()
  select(activeIndex.value + (event.key === 'ArrowRight' ? 1 : -1))
}
</script>

<template>
  <div ref="root" class="home-patient-stories" role="region" aria-roledescription="轮播" aria-label="患者故事" :data-story-state="activeIndex + 1" @keydown="handleKey">
    <HomeFigmaSection desktop-id="1412:5853" mobile-id="1528:360" label="患者故事 · 真实见证" :actions="actions" :attributes="attributes" :texts="texts" :styles="styles" @activate="activate" />
    <button class="home-patient-stories__pause" type="button" :aria-pressed="paused" @click="togglePause">{{ paused ? '播放患者故事' : '暂停患者故事' }}</button>
  </div>
</template>

<style scoped>
.home-patient-stories { position:relative; }
@media (max-width:700px) {
  .home-patient-stories :deep([data-figma-node="1528:383"]) { width:100%!important; }
  .home-patient-stories :deep([data-figma-node="1528:366"]) { left:50%!important; transform:translateX(-50%)!important; }
}
.home-patient-stories__pause { position:absolute; right:24px; bottom:16px; z-index:1; border:0; border-radius:6px; padding:8px 12px; color:#fff; background:#1e3a5f; cursor:pointer; }
.home-patient-stories__pause:not(:focus-visible) { width:1px; height:1px; padding:0; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
</style>
