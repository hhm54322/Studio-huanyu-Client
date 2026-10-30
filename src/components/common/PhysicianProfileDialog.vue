<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { PhysicianRecord } from '@/data/physicianFigmaSource'

const props = defineProps<{ record: PhysicianRecord }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const activeTab = ref(0)
const trigger = ref<HTMLElement | null>(null)
let previousOverflow = ''

const tabs = computed(() => [
  { label: '专业擅长', values: props.record.professionalExpertise.length ? props.record.professionalExpertise : (props.record.specialty ? [props.record.specialty] : []) },
  { label: '专业任职', values: props.record.career },
  { label: '学术任职', values: props.record.academic },
  { label: '科研成果', values: props.record.research },
  { label: '可提供的跨境医疗服务', values: props.record.crossBorderServices },
].filter(tab => tab.values.length))
const activeContent = computed(() => tabs.value[activeTab.value]?.values ?? [])

function focusables() {
  return Array.from(dialog.value?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') ?? [])
    .filter(element => element.tabIndex >= 0 && element.getClientRects().length)
}

function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); emit('close'); return }
  if (event.key === 'Tab') {
    const items = focusables(); const first = items[0]; const last = items[items.length - 1]
    if (first && last) {
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus({ preventScroll: true }) }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus({ preventScroll: true }) }
    }
    return
  }
  if (!(event.target instanceof HTMLElement) || event.target.getAttribute('role') !== 'tab') return
  let next = activeTab.value
  if (event.key === 'ArrowRight') next = (next + 1) % tabs.value.length
  else if (event.key === 'ArrowLeft') next = (next + tabs.value.length - 1) % tabs.value.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = tabs.value.length - 1
  else return
  event.preventDefault(); activeTab.value = next
  void nextTick(() => dialog.value?.querySelector<HTMLElement>(`#physician-tab-${next}`)?.focus({ preventScroll: true }))
}

function closeOutside(event: MouseEvent) { if (event.target === dialog.value) emit('close') }

onMounted(async () => {
  trigger.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
  await nextTick()
  dialog.value?.querySelector<HTMLElement>('[aria-label="关闭医生详情"]')?.focus({ preventScroll: true })
})
onBeforeUnmount(() => {
  dialog.value?.close(); document.body.style.overflow = previousOverflow
  trigger.value?.focus({ preventScroll: true })
})
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" class="physician-profile-dialog" aria-labelledby="physician-dialog-title" @cancel.prevent="emit('close')" @click="closeOutside" @keydown="keydown">
      <div class="physician-profile-dialog__backdrop" data-physician-dialog-overlay @click.self="emit('close')">
        <article class="physician-profile-dialog__panel">
          <button class="physician-profile-dialog__close" type="button" aria-label="关闭医生详情" @click="emit('close')"><img src="/images/figma/home-revision/node-1432-7746.svg" alt="" aria-hidden="true" /></button>
          <h2 id="physician-dialog-title">专家介绍</h2>
          <header class="physician-profile-dialog__header">
            <div v-if="record.avatar" class="physician-profile-dialog__avatar"><img :src="record.avatar" :alt="`${record.name}医生头像`" /></div>
            <div class="physician-profile-dialog__identity">
              <div class="physician-profile-dialog__name-row"><h3>{{ record.name }}</h3><span v-if="record.title">{{ record.title }}</span></div>
              <p v-if="record.workplace">任职：{{ record.workplace }}</p>
              <p v-for="(item, index) in record.basicInfo" :key="index">{{ item.replace(/^[•□]\s*/, '') }}</p>
            </div>
          </header>
          <div class="physician-profile-dialog__tabs" role="tablist" aria-label="医生资料">
            <button v-for="(tab, index) in tabs" :id="`physician-tab-${index}`" :key="tab.label" type="button" role="tab" :aria-selected="activeTab === index" :tabindex="activeTab === index ? 0 : -1" :aria-controls="`physician-panel-${index}`" @click="activeTab = index">{{ tab.label }}</button>
          </div>
          <section v-for="(tab, index) in tabs" v-show="activeTab === index" :id="`physician-panel-${index}`" :key="tab.label" class="physician-profile-dialog__content" role="tabpanel" :aria-labelledby="`physician-tab-${index}`" :tabindex="activeTab === index ? 0 : -1">
            <ul v-if="activeTab === index && activeContent.length">
              <li v-for="(item, itemIndex) in activeContent" :key="`${itemIndex}-${item}`">{{ item.replace(/^(?:[•□]\s*|\d+[.．]\s*)/, '') }}</li>
            </ul>
            <p v-else-if="activeTab === index" class="physician-profile-dialog__empty">暂无该项资料</p>
          </section>
          <p v-if="record.footerLabel" class="physician-profile-dialog__source-label">{{ record.footerLabel }}</p>
        </article>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
@import url('/fonts/home-source-fonts.css');
.physician-profile-dialog { position:fixed; inset:0; width:100%; max-width:none; height:100%; max-height:none; margin:0; padding:0; border:0; background:transparent; overflow:auto; color:#1E3A5F; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.physician-profile-dialog::backdrop { background:rgba(0,0,0,.5); backdrop-filter:blur(4px); }
.physician-profile-dialog__backdrop { min-height:100%; display:flex; align-items:center; justify-content:center; padding:40px 24px; box-sizing:border-box; }
.physician-profile-dialog__panel { position:relative; width:min(896px,100%); min-height:min(650px,calc(100vh - 80px)); max-height:min(760px,calc(100vh - 80px)); overflow:auto; overscroll-behavior:contain; box-sizing:border-box; padding:32px; border-radius:24px; background:#fff; }
.physician-profile-dialog__close { position:absolute; right:16px; top:16px; width:36px; height:36px; border:0; border-radius:9999px; background:transparent; color:#1E3A5F; font-size:28px; line-height:1; cursor:pointer; }
.physician-profile-dialog__close img { display:block; width:20px; height:20px; margin:auto; }
.physician-profile-dialog h2 { margin:0 0 32px; text-align:left; font-size:32px; line-height:32px; font-weight:600; letter-spacing:.396px; }
.physician-profile-dialog__header { display:flex; gap:24px; align-items:flex-start; min-height:102px; margin-bottom:32px; }
.physician-profile-dialog__avatar { flex:0 0 74px; width:74px; height:74px; overflow:hidden; border-radius:16px; background:#F5F6F7; }
.physician-profile-dialog__avatar img { width:100%; height:100%; object-fit:cover; display:block; }
.physician-profile-dialog__identity { min-width:0; padding-top:2px; }
.physician-profile-dialog__name-row { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
.physician-profile-dialog h3 { margin:0; color:#1E3A5F; font-size:18px; line-height:18px; font-weight:590; }
.physician-profile-dialog__name-row span { color:#4B5563; font-size:14px; line-height:16px; }
.physician-profile-dialog__identity p { margin:10px 0 0; color:#9CA3AF; font-size:14px; line-height:20px; }
.physician-profile-dialog__tabs { display:flex; gap:20px; overflow-x:auto; margin:0 0 24px; border-bottom:1px solid #E5E7EB; scrollbar-width:none; }
.physician-profile-dialog__tabs::-webkit-scrollbar { display:none; }
.physician-profile-dialog__tabs button { flex:none; padding:0 0 8px; border:0; border-bottom:2px solid transparent; background:transparent; color:#4B5563; font:inherit; font-size:14px; line-height:18px; cursor:pointer; }
.physician-profile-dialog__tabs button[aria-selected="true"] { border-color:#2563EB; color:#1E3A5F; font-weight:500; }
.physician-profile-dialog__content { min-height:164px; color:#4B5563; font-size:16px; line-height:24px; }
.physician-profile-dialog__content ul { margin:0; padding-left:22px; }
.physician-profile-dialog__content li { margin:0 0 10px; white-space:pre-wrap; overflow-wrap:anywhere; }
.physician-profile-dialog__empty { margin:0; color:#9CA3AF; }
.physician-profile-dialog__source-label { margin:24px 0 0; color:#9CA3AF; font-size:14px; line-height:20px; }
.physician-profile-dialog button:focus-visible { outline:2px solid #2563EB; outline-offset:3px; }
@media (max-width:700px) { .physician-profile-dialog__backdrop { padding:16px; align-items:flex-start; } .physician-profile-dialog__panel { max-height:calc(100vh - 32px); padding:24px; border-radius:20px; } .physician-profile-dialog h2 { font-size:26px; margin-bottom:24px; } .physician-profile-dialog__header { margin-bottom:24px; } }
@media (prefers-reduced-motion:no-preference) { .physician-profile-dialog__panel { animation:physician-dialog-in .28s cubic-bezier(.22,1,.36,1) both; } }
@keyframes physician-dialog-in { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
</style>
