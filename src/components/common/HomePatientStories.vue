<script setup lang="ts">
import { computed, ref } from 'vue'
import HomeFigmaSection from './HomeFigmaSection.vue'
import HomeSourceNode from './HomeSourceNode.vue'
import { homeDesktopNodes, homeStoryPhotoIds, homeStoryDetailPhotoIds } from '@/data/homeFigmaSource'
import { useAutoplayCarousel } from '@/composables/useAutoplayCarousel'

const emit = defineEmits<{ activate: [action: string, event: MouseEvent] }>()
const root = ref<HTMLElement | null>(null)
// Five photographs of one authored case; copy and detail destination stay fixed.
const photos = homeStoryPhotoIds.map(id => homeDesktopNodes.get(id)!)
const { activeIndex, select, paused, togglePause } = useAutoplayCarousel(root, photos.length)
const desktopDots = ['1412:5898', '1412:5899', '1412:5900', '1412:5901', '1412:5902']
const mobileDots = ['1528:367', '1528:368', '1528:369', '1528:370', '1528:371']
const actions = {
  ...Object.fromEntries([...desktopDots, ...mobileDots].map((id, index) => [id, { action: `select:${index % photos.length}`, label: `查看第${index % photos.length + 1}张患者照片` }])),
  ...Object.fromEntries(['1412:5892', '1528:386'].map(id => [id, { action: 'story:detail', label: '查看患者故事' }])),
}
const attributes = computed(() => Object.fromEntries([...desktopDots, ...mobileDots].map((id, index) => [id, { 'aria-pressed': index % photos.length === activeIndex.value }])))
const styles = computed(() => {
  let left = 0
  const dots = Object.fromEntries(desktopDots.map((id, index) => {
    const width = index === activeIndex.value ? 32 : 10
    const style = `left:${left}px;width:${width}px;background:${index === activeIndex.value ? '#DD6B20' : 'rgba(255,255,255,.20)'};`
    left += width + 8
    return [id, style]
  }))
  const mobile = Object.fromEntries(mobileDots.map((id, index) => [id, `background:${index === activeIndex.value ? '#DD6B20' : 'rgba(255,255,255,.20)'};`]))
  const mobilePhoto = homeDesktopNodes.get(homeStoryDetailPhotoIds[activeIndex.value]!)!
  return {
    ...dots, ...mobile,
    '1466:843': 'background-image:none;',
    ...(activeIndex.value ? { '1528:365': `background-image:${mobilePhoto.css.match(/background:\s*(url\([^)]*\))/)?.[1]};background-size:cover;background-position:center;` } : {}),
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
    <HomeFigmaSection desktop-id="1412:5853" mobile-id="1528:360" label="患者故事 · 真实见证" :actions="actions" :attributes="attributes" :styles="styles" @activate="activate">
      <template #after="{ node }">
        <template v-if="node.id === '1466:843'">
          <div v-for="(photo,index) in photos" :key="photo.id" class="home-patient-stories__photo" :class="{'is-active':index === activeIndex}" :aria-hidden="index !== activeIndex" :data-story-photo="index + 1" role="img" :aria-label="`Michael W. 的第${index + 1}张就医照片`">
            <HomeSourceNode :node="photo" root :replica="index === 0" />
          </div>
        </template>
      </template>
    </HomeFigmaSection>
    <button class="home-patient-stories__pause" type="button" :aria-pressed="paused" @click="togglePause">{{ paused ? '播放患者照片' : '暂停患者照片' }}</button>
  </div>
</template>

<style scoped>
.home-patient-stories { position:relative; }
.home-patient-stories__photo { position:absolute; inset:0; opacity:0; pointer-events:none; transition:opacity .5s cubic-bezier(.22,1,.36,1); }
.home-patient-stories__photo.is-active { opacity:1; }
@media (max-width:700px) {
  .home-patient-stories :deep([data-figma-node="1528:383"]) { width:100%!important; }
  .home-patient-stories :deep([data-figma-node="1528:366"]) { left:50%!important; transform:translateX(-50%)!important; }
}
.home-patient-stories__pause { position:absolute; right:24px; bottom:16px; z-index:1; border:0; border-radius:6px; padding:8px 12px; color:#fff; background:#1e3a5f; cursor:pointer; }
.home-patient-stories__pause:not(:focus-visible) { width:1px; height:1px; padding:0; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
@media (prefers-reduced-motion:reduce) { .home-patient-stories__photo { transition:none; } }
</style>
