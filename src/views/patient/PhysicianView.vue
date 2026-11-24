<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
import { useRoute, useRouter } from 'vue-router'
const { tx, tf, localized } = useSiteCopy()
const route=useRoute(), router=useRouter()

import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import HospitalFigmaCanvas from '@/components/common/HospitalFigmaCanvas.vue'
import HomeSourceNode from '@/components/common/HomeSourceNode.vue'
import SourceLearnMore from '@/components/common/SourceLearnMore.vue'
import {
  filteredPhysicianRecords,
  filteredPhysicianSource,
  physicianActions,
  physicianDepartments,
  physicianDescendants,
  physicianFilters,
  physicianNode,
  physicianRecords,
  type PhysicianRecord,
} from '@/data/physicianFigmaSource'
import { useAppStore, type Locale } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { patientLanguages } from '@/i18n/languages'

const PhysicianProfileDialog = defineAsyncComponent(() => import('@/components/common/PhysicianProfileDialog.vue'))
import { homeExpertDialog } from '@/components/common/homeExpertDialog'
import { dentalSourceDialog } from '@/components/common/dentalSourceDialog'
const width = ref(typeof window === 'undefined' ? 1440 : window.innerWidth)
const phone = computed(() => width.value <= 700)
const filter = ref(0)
const department = ref('')
const selected = ref<PhysicianRecord | null>(null)
const hospitalMenu = ref(false)
const languageMenu = ref(false)
const page = ref<HTMLElement | null>(null)
const { locale } = useI18n()
const app = useAppStore()
const source = computed(() => {
  const tree=filteredPhysicianSource(filter.value, department.value)
  if(locale.value==='zh')return tree
  // The added department select shares no Figma node with the six shortcuts.
  // Give it a separate row; long translated shortcuts may use the whole row.
  const shortcuts=physicianDescendants(tree).find(node=>node.id==='1689:4839')!
  const row={...shortcuts,id:'physician-shortcut-row',x:0,y:0,height:60,
    css:`${shortcuts.css};left:0px;top:0px;height:60px;`,children:[]}
  const field={id:'physician-department-row',name:'Department select',type:'FRAME',x:0,y:76,
    width:shortcuts.width,height:42,visible:true,text:'',children:[],
    css:`left:0px;top:76px;width:${shortcuts.width}px;height:42px;`}
  shortcuts.children=[row,field]
  shortcuts.height=118
  shortcuts.css+=`;height:${shortcuts.height}px;`
  shortcuts.layoutCss='display:flex;flex-direction:column;gap:16px;'
  const results=physicianDescendants(tree).find(node=>node.id==='1741:5784')!
  // The translated directory uses the same authored card shell, but lets the
  // record text flow inside it. The source tree's absolute text positions are
  // sized for Chinese and can overlap when a workplace wraps in another language.
  for (const card of results.children) card.children = []
  results.y+=76
  results.css+=`;top:${results.y}px;`
  return tree
})
const visibleRecords = computed(() => filteredPhysicianRecords(filter.value, department.value))
const recordsBySourceId = new Map(physicianRecords.map(record => [`physician-card:${record.id}`, record]))
const mobilePortrait = (record:PhysicianRecord) => record.avatar || ({
  '谭兆林':'/images/figma/physicians-revision/image-3d917ce08391a294490b64fe755d5643e23f6093.webp',
  '徐宇':'/images/figma/physicians-revision/image-252a3f9503f22967be08dff82505a9bd5f7cf33f.webp',
  '陈疾忤':'/images/figma/physicians-revision/image-56f78245a05bde4bd8cc14881640b6f0a1bf9d29.webp',
} as Record<string,string>)[record.name]
// These original portraits use authored crop/flip transforms in the source
// tree; displaying the whole source photo as an <img> loses that crop.
const sourcePortrait = (record:PhysicianRecord) => ({
  '1741:5785':'2326:8511', '2324:8478':'2324:8480', '1741:5869':'1741:5871',
} as Record<string,string>)[record.sourceCardId || '']
const scale = computed(() => Math.min(1, width.value / 1440))

const styles = computed(() => {
  const result: Record<string, string> = {}
  if (localized.value) {
    // Leave the people in the hero artwork unobstructed by longer headings.
    result['1689:4835'] = 'width:700px;font-size:44px;line-height:56px;'
    result['1689:4837'] = 'width:700px;font-size:18px;line-height:26px;'
  }
  if (filter.value === 0) return result
  physicianFilters.forEach((item, index) => {
    const active = filter.value === index
    result[item.id] = active ? 'background:#DD6B20;border-color:transparent;' : 'background:transparent;border:1px solid #DBDEE6;'
    physicianDescendants(physicianNode(item.id)).filter(node => node.type === 'TEXT').forEach(node => {
      result[node.id] = `color:${active ? '#fff' : '#1E3A5F'};font-weight:${active ? 500 : 400};`
    })
  })
  return result
})

const attributes = computed(() => {
  const result: Record<string, Record<string, string | number | boolean>> = {
    '1689:4839': { role: 'tablist', 'aria-label': '医生科室快捷筛选' },
    '1689:5416': { 'aria-expanded': hospitalMenu.value, 'aria-controls': 'physician-hospital-menu', 'aria-haspopup': 'true' },
  }
  physicianFilters.forEach((item, index) => {
    result[item.id] = { role: 'tab', 'aria-selected': filter.value === index, 'aria-controls': 'physician-results', tabindex: filter.value === index || filter.value === -1 && index === 0 ? 0 : -1 }
  })
  result['1741:5784'] = { id: 'physician-results', role: 'tabpanel', 'aria-label': department.value || physicianFilters[filter.value]?.text || '全部医生' }
  physicianRecords.forEach(record => {
    result[`physician-card:${record.id}`] = { 'data-physician-card': true, 'data-physician-id': record.id, 'data-physician-department': record.departmentSource, title: `${tx(record.name)}｜${tx(record.departmentSource)}\n${tx(record.workplace)}` }
    result[`physician-summary:${record.id}`] = { 'data-physician-summary': true }
  })
  return result
})

let menuTimer: ReturnType<typeof setTimeout> | undefined
let observer: IntersectionObserver | undefined
const animations = new Set<Animation>()
const seen = new WeakSet<Element>()

function resize() { width.value = window.innerWidth; hospitalMenu.value = false; languageMenu.value = false }
async function bindMotion() {
  await nextTick(); observer?.disconnect()
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || seen.has(entry.target)) continue
      seen.add(entry.target); observer?.unobserve(entry.target)
      const animation = entry.target.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' })
      animations.add(animation); animation.finished.catch(() => {}).finally(() => animations.delete(animation))
    }
  }, { threshold: .04 })
  page.value?.querySelectorAll('[data-physician-card]').forEach(card => observer?.observe(card))
}

function activate(action: string) {
  if (action === 'consultation') window.dispatchEvent(new CustomEvent('open-consultation', { detail: { intent: 'appointment' } }))
  else if (action === 'language') languageMenu.value = !languageMenu.value
  else if (action === 'hospital-menu') { clearTimeout(menuTimer); hospitalMenu.value = true }
  else if (action.startsWith('doctor:')) selected.value = physicianRecords.find(record => record.id === action.slice(7)) ?? null
  else if (action.startsWith('filter:')) { department.value = ''; filter.value = Number(action.slice(7)); void bindMotion() }
}
function selectDepartment(value: string) { department.value = value; filter.value = value ? -1 : 0; void bindMotion() }
function enter(event: MouseEvent | FocusEvent) {
  if ((event.target as HTMLElement).closest('[data-figma-node="1689:5416"],#physician-hospital-menu')) { clearTimeout(menuTimer); hospitalMenu.value = true }
}
function leave(event: MouseEvent | FocusEvent) {
  if ((event.relatedTarget as HTMLElement | null)?.closest('[data-figma-node="1689:5416"],#physician-hospital-menu')) return
  if ((event.target as HTMLElement).closest('[data-figma-node="1689:5416"],#physician-hospital-menu')) menuTimer = setTimeout(() => { hospitalMenu.value = false }, 140)
}
async function keydown(event: KeyboardEvent) {
  const element = event.target as HTMLElement
  if (event.key === 'Escape') {
    if (hospitalMenu.value) { hospitalMenu.value = false; page.value?.querySelector<HTMLElement>('[data-figma-node="1689:5416"]')?.focus({ preventScroll: true }) }
    languageMenu.value = false
  }
  if (element.closest('[data-figma-node="1689:5416"]') && event.key === 'ArrowDown') {
    event.preventDefault(); hospitalMenu.value = true; await nextTick(); page.value?.querySelector<HTMLElement>('#physician-hospital-menu a')?.focus({ preventScroll: true })
  }
  if (element.getAttribute('role') !== 'tab') return
  const focusedIndex = physicianFilters.findIndex(item => item.id === element.dataset.figmaNode)
  let next: number | null = null
  if (event.key === 'ArrowRight') next = (focusedIndex + 1) % physicianFilters.length
  else if (event.key === 'ArrowLeft') next = (focusedIndex + physicianFilters.length - 1) % physicianFilters.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = physicianFilters.length - 1
  if (next !== null) { event.preventDefault(); department.value = ''; filter.value = next; await nextTick(); page.value?.querySelector<HTMLElement>(`[data-figma-node="${physicianFilters[next]!.id}"]`)?.focus({ preventScroll: true }); void bindMotion() }
}
async function changeLanguage(code: Locale) { if(await app.setLocale(code)){languageMenu.value = false;await router.replace({query:{...route.query,lang:code},hash:route.hash})} }
function outside(event: MouseEvent) { if (!(event.target as HTMLElement).closest('.physician-languages,[data-figma-node="1689:5425"]')) languageMenu.value = false }

onMounted(() => { window.addEventListener('resize', resize, { passive: true }); document.addEventListener('click', outside); void bindMotion() })
onBeforeUnmount(() => { window.removeEventListener('resize', resize); document.removeEventListener('click', outside); clearTimeout(menuTimer); observer?.disconnect(); animations.forEach(animation => animation.cancel()) })
</script>

<template>
  <div ref="page" class="physician-page" @mouseover="enter" @mouseout="leave" @focusin="enter" @focusout="leave" @keydown="keydown">
    <template v-if="phone">
      <section class="physician-mobile-hero"><h1>{{ tx('中国顶尖医生资源') }}</h1><p>{{ tx('三甲医院权威专家，覆盖肿瘤/心血管/神经/骨科/微创等全病种') }}</p></section>
      <section class="physician-mobile-directory" :aria-label="tx('中国医生')">
        <div class="physician-mobile-shortcuts" role="group" :aria-label="tx('医生科室快捷筛选')"><button v-for="(item,index) in physicianFilters" :key="item.id" type="button" :class="{active:filter===index}" :aria-pressed="filter===index" @click="department='';filter=index">{{ tx(item.text) }}</button></div>
        <label class="physician-mobile-filter">{{ tx('按科室筛选') }}<select :value="department || (filter > 0 ? physicianFilters[filter]?.department : '')" :aria-label="tx('按科室筛选医生')" @change="selectDepartment(($event.target as HTMLSelectElement).value)"><option value="">{{ tf('全部科室（{count}）',{count:physicianRecords.length}) }}</option><option v-for="item in physicianDepartments" :key="item" :value="item">{{ tx(item) }}</option></select></label>
        <p class="physician-mobile-count" aria-live="polite">{{ tf('共 {count} 位医生',{count:visibleRecords.length}) }}</p>
        <div class="physician-mobile-grid"><button v-for="record in visibleRecords" :key="record.id" type="button" class="physician-mobile-card" @click="selected=record"><span class="physician-mobile-identity"><img v-if="mobilePortrait(record)" :src="mobilePortrait(record)" :alt="tx(`${record.name}医生头像`)" loading="lazy" /><span><strong>{{ tx(record.name) }}</strong><small v-if="record.title">{{ tx(record.title) }}</small><small v-if="record.workplace">{{ tx(record.workplace) }}</small></span></span><span v-if="record.specialty" class="physician-mobile-specialty">{{ tx(record.specialty) }}</span><span class="physician-mobile-more">{{ tx('了解更多') }} →</span></button></div>
        <p v-if="!visibleRecords.length" class="physician-mobile-no-results">{{ tx('暂无符合条件的医生') }}</p>
      </section>
    </template>
    <HospitalFigmaCanvas v-else :node="source" :width="width" :actions="physicianActions" :styles="styles" :attributes="attributes" :full-bleed="['1689:4817', ...source.children.flatMap(body => body.children.filter(node => node.name === 'Footer').map(node => node.id))]" :hidden="['1689:5392', '1732:5716']" :label="tx('中国医生')" @activate="activate">
      <template #after="{ node: sourceNode }">
        <div v-if="localized && sourceNode.id === 'physician-shortcut-row'" class="physician-local-shortcuts">
          <button v-for="(item, index) in physicianFilters" :key="item.id" type="button" role="tab"
            :data-figma-node="item.id" :aria-selected="filter === index" aria-controls="physician-results"
            :tabindex="filter === index || filter === -1 && index === 0 ? 0 : -1"
            @click="activate(`filter:${index}`)">{{ tx(item.text) }}</button>
        </div>
        <div v-if="sourceNode.id === '1689:4839'" class="physician-department-filter">
          <label for="physician-department">{{ tx("按科室筛选") }}</label>
          <select id="physician-department" :value="department" :aria-label="tx('按科室筛选医生')" @change="selectDepartment(($event.target as HTMLSelectElement).value)">
            <option value="">{{ tf('全部科室（{count}）',{count:physicianRecords.length}) }}</option>
            <option v-for="item in physicianDepartments" :key="item" :value="item">{{ tx(item) }}</option>
          </select>
          <span class="physician-result-count" aria-live="polite">{{ tf('共 {count} 位医生',{count:visibleRecords.length}) }}</span>
        </div>
        <div v-if="sourceNode.id === '1741:5784' && !visibleRecords.length" class="physician-empty">{{ tx("暂无符合条件的医生") }}</div>
        <template v-if="sourceNode.id.startsWith('physician-card:')">
          <div v-if="localized && recordsBySourceId.get(sourceNode.id)" class="physician-local-card">
            <template v-for="record in [recordsBySourceId.get(sourceNode.id)!]" :key="record.id">
              <div class="physician-local-card__identity">
                <div v-if="sourcePortrait(record)" class="physician-local-card__source-portrait" role="img" :aria-label="tx(`${record.name}医生头像`)">
                  <HomeSourceNode :node="physicianNode(sourcePortrait(record)!)" />
                </div>
                <img v-else-if="mobilePortrait(record)" :src="mobilePortrait(record)" :alt="tx(`${record.name}医生头像`)" loading="lazy" />
                <div class="physician-local-card__name"><strong>{{ tx(record.name) }}</strong><span v-if="record.title">{{ tx(record.title) }}</span></div>
              </div>
              <div class="physician-local-card__meta">
                <p v-if="record.label"><img src="/images/figma/physicians-revision/node-1741-5827.svg" alt="" /><span>{{ tx(record.label) }}</span></p>
                <p v-if="record.workplace"><img src="/images/figma/physicians-revision/node-1741-5833.svg" alt="" /><span>{{ tx(record.workplace) }}</span></p>
              </div>
              <p v-if="record.specialty" class="physician-local-card__summary">{{ tx(record.specialty) }}</p>
            </template>
          </div>
          <SourceLearnMore class="physician-learn-more" icon="/images/figma/physicians-revision/node-1741-5814.svg" />
        </template>
      </template>
    </HospitalFigmaCanvas>

    <component :is="dentalSourceDialog()" v-if="selected?.sourceExpert === -1" :doctor="{ id: 5, name: selected.name }" @close="selected = null" />
    <component :is="homeExpertDialog(selected.sourceExpert)" v-else-if="selected?.sourceExpert !== undefined" :expert="selected.sourceExpert" @close="selected = null" />
    <PhysicianProfileDialog v-else-if="selected" :record="selected" @close="selected = null" />
  </div>
</template>

<style scoped>
.physician-page { position:relative; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.physician-mobile-hero { box-sizing:border-box; min-height:280px; padding:110px 20px 55px; background:#eef6fb url('/images/figma/physicians-revision/image-2f9239c0bd99a390d832a82b3671215ba66d1401.webp') center/cover no-repeat; color:#1e3a5f; }
.physician-mobile-hero h1 { margin:0 0 14px; font-size:28px; line-height:1.3; }
.physician-mobile-hero p { max-width:28em; margin:0; font-size:14px; line-height:1.6; }
.physician-mobile-directory { box-sizing:border-box; padding:28px 16px 56px; color:#1e3a5f; background:#fff; }
.physician-mobile-shortcuts { display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; }
.physician-mobile-shortcuts button { flex:none; padding:8px 14px; border:1px solid #dbe1e9; border-radius:20px; background:#fff; color:#1e3a5f; font-size:14px; }
.physician-mobile-shortcuts button.active { border-color:#dd6b20; background:#dd6b20; color:#fff; }
.physician-mobile-filter { display:grid; gap:8px; margin-top:12px; font-size:14px; font-weight:600; }
.physician-mobile-filter select { width:100%; min-height:44px; padding:0 12px; border:1px solid #dbe1e9; border-radius:10px; background:#fff; color:#1e3a5f; font:inherit; }
.physician-mobile-count { margin:18px 0 12px; color:#64748b; font-size:14px; }
.physician-mobile-grid { display:grid; grid-template-columns:1fr; gap:14px; }
.physician-mobile-card { width:100%; min-width:0; padding:20px; border:0; border-radius:16px; background:#f4f6f8; text-align:left; color:#1e3a5f; font:inherit; }
.physician-mobile-identity { display:flex; align-items:flex-start; gap:14px; }
.physician-mobile-identity img { width:60px; height:60px; flex:none; object-fit:cover; border-radius:12px; }
.physician-mobile-identity>span { display:grid; min-width:0; gap:6px; }
.physician-mobile-identity strong { font-size:18px; line-height:1.3; }
.physician-mobile-identity small { font-size:13px; line-height:1.5; color:#64748b; overflow-wrap:anywhere; }
.physician-mobile-specialty { display:-webkit-box; margin-top:14px; overflow:hidden; -webkit-line-clamp:3; -webkit-box-orient:vertical; font-size:14px; line-height:1.6; }
.physician-mobile-more { display:block; margin-top:14px; color:#147cb8; font-size:14px; font-weight:600; }
.physician-mobile-no-results { padding:32px 0; text-align:center; color:#64748b; }
.physician-local-shortcuts { display:flex; align-items:center; gap:16px; width:100%; min-height:60px; }
.physician-local-shortcuts button { display:flex; align-items:center; justify-content:center; flex:0 1 auto; min-width:0; min-height:42px; padding:12px 24px; border:1px solid #dbdee6; border-radius:24px; background:#fff; color:#1e3a5f; font:400 14px/16px 'PingFang SC',sans-serif; text-align:center; overflow-wrap:break-word; cursor:pointer; }
.physician-local-shortcuts button[aria-selected='true'] { border-color:#dd6b20; background:#dd6b20; color:#fff; }
.physician-department-filter { position:absolute; z-index:4; top:0; right:0; display:flex; align-items:center; gap:10px; height:42px; }
.physician-department-filter label { color:#4B5563; font-size:14px; line-height:20px; white-space:nowrap; }
.physician-department-filter select { height:42px; min-width:220px; padding:0 32px 0 14px; border:1px solid #DBDEE6; border-radius:10px; background:#fff; color:#1E3A5F; font:inherit; font-size:14px; cursor:pointer; }
.physician-page:not(:lang(zh)) .physician-department-filter { top:auto; bottom:0; max-width:100%; }
.physician-page:not(:lang(zh)) .physician-department-filter label { min-width:0; white-space:normal; }
.physician-page:not(:lang(zh)) .physician-department-filter select { min-width:0; max-width:100%; flex:1; }
.physician-result-count { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
.physician-empty { position:absolute; left:0; right:0; top:48px; color:#9CA3AF; text-align:center; font-size:16px; line-height:24px; }
.physician-source-header { position:fixed; inset:0 0 auto; height:64px; z-index:60; pointer-events:none; }
.physician-source-header :deep(a),.physician-source-header :deep(button),.physician-menu,.physician-languages { pointer-events:auto; }
.physician-page :deep([data-physician-card]) { box-shadow:none!important; }
.physician-page:not(:lang(zh)) :deep([data-figma-node="1689:4837"]) { width:700px!important; max-width:700px!important; height:auto!important; }
.physician-page :deep([data-physician-summary]) { top:103px!important; bottom:auto!important; height:48px!important; transform:translate3d(0,0,0);will-change:transform;transition:transform .3s cubic-bezier(.22,1,.36,1); }
.physician-page :deep([data-physician-summary] .home-source-node--text) { height:48px!important; max-height:48px!important; overflow:hidden!important; display:-webkit-box!important; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.physician-learn-more { position:absolute; left:24px; bottom:24px; opacity:0; transition:opacity .18s ease; }
.physician-page :deep([data-physician-card]:hover [data-physician-summary]),.physician-page :deep([data-physician-card]:focus-visible [data-physician-summary]) { transform:translate3d(0,-31px,0)!important; }
.physician-page :deep([data-physician-card]:hover .physician-learn-more),.physician-page :deep([data-physician-card]:focus-visible .physician-learn-more) { opacity:1; }
.physician-local-card { box-sizing:border-box; display:flex; flex-direction:column; width:100%; height:100%; padding:24px 24px 50px; overflow:hidden; text-align:left; }
.physician-local-card__identity { display:flex; align-items:center; gap:12px; min-width:0; min-height:60px; }
.physician-local-card__identity>img { flex:none; width:60px; height:60px; border-radius:16px; object-fit:cover; }
.physician-local-card__source-portrait { position:relative; flex:none; width:60px; height:60px; }
.physician-local-card__name { display:grid; min-width:0; gap:8px; }
.physician-local-card__name strong,.physician-local-card__name span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.physician-local-card__name strong { color:#1e3a5f; font-size:24px; font-weight:600; line-height:28px; }
.physician-local-card__name span { color:#9ca3af; font-size:14px; line-height:18px; }
.physician-local-card__meta { display:grid; gap:6px; margin-top:18px; color:#4b5563; font-size:14px; line-height:16px; }
.physician-local-card__meta p { display:flex; align-items:flex-start; gap:8px; min-width:0; margin:0; }
.physician-local-card__meta img { flex:none; width:14px; height:14px; margin-top:1px; }
.physician-local-card__meta span { display:-webkit-box; min-width:0; overflow:hidden; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow-wrap:anywhere; }
.physician-local-card__summary { display:-webkit-box; margin:12px 0 0; overflow:hidden; color:#1e3a5f; font-size:16px; font-weight:500; line-height:24px; text-align:left; overflow-wrap:anywhere; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
@media (hover:none) { .physician-learn-more { opacity:1; } }
.physician-menu { position:absolute; inset:0 0 auto; }
.physician-menu>div { position:absolute; top:0; left:50%; height:0; transform-origin:top center; }
.physician-languages { position:absolute; top:56px; right:max(16px,calc((100vw - 1216px)/2)); display:grid; padding:8px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 12px 30px #0002; }
.physician-languages button { padding:9px 16px; border:0; text-align:left; background:transparent; color:#143162; cursor:pointer; }
.physician-dropdown-enter-active,.physician-dropdown-leave-active { transition:opacity .2s ease; }
.physician-dropdown-enter-from,.physician-dropdown-leave-to { opacity:0; }
/* No mobile physician header was authored. Use the existing shared mobile
   header rather than shrink all desktop labels to a few pixels. */
@media (max-width:700px) { .physician-source-header { display:none; } }
@media (max-width:1100px) and (min-width:701px) { .physician-department-filter label { display:none; } .physician-department-filter select { min-width:170px; } }
@media (prefers-reduced-motion:reduce) { .physician-dropdown-enter-active,.physician-dropdown-leave-active,.physician-learn-more,.physician-page :deep([data-physician-summary]) { transition:none; } }
</style>
