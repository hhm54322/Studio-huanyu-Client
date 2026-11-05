<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
const { tx, localized } = useSiteCopy()

import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DentalSourceCanvas from '@/components/common/DentalSourceCanvas.vue'
import DentalDoctorPageContent from '@/components/common/DentalDoctorPageContent.vue'
import type { HomeSourceAction, HomeSourceNodeData as SourceNode, SourceSticky } from '@/components/common/HomeSourceNode.vue'
import { dentalPhysicians, dentalPhysicianCases } from '@/data/dentalPhysicianData'
import { replaceDentalPortrait, replaceDentalPrice, replaceDentalText } from '@/data/dentalPhysicianSource'
import { displayDentalExperience } from '@/data/dentalPhysicianPresentation'
import { dentalDoctorPageModel, dentalDoctorTabs, doctorPageDescendants, getDentalDoctorPage, loadDentalDoctorPage, parseDentalDoctorTab } from '@/data/dentalDoctorPageSource'
import { publicContacts } from '@/data/publicContacts'
const InstitutionDialog = defineAsyncComponent(async () => {
  await import('@/data/dentalFigmaDetails').then(module => module.loadDentalDetail(0, true))
  return import('@/components/common/DentalDoctorSourceDialog.vue')
})
const route = useRoute(), router = useRouter()
// beforeEnter validates initial URLs; this component is reused for related
// doctor links, so keep later param changes safe as well.
const doctor = computed(() => dentalPhysicians.find(item => item.slug === route.params.slug) || dentalPhysicians[0]!)
const activeTab = computed(() => parseDentalDoctorTab(route.query.tab))
const loaded = shallowRef(getDentalDoctorPage(activeTab.value) || getDentalDoctorPage('profile')!)
const loading = ref(false), error = ref(false), width = ref(innerWidth)
const rootElement = ref<HTMLElement>(), institution = ref(false)
const image = ref<{ src: string; alt: string }>(), imageDialog = ref<HTMLDialogElement>()
const contentHeight = ref(0), stickyCardHeight = ref(0)
let request = 0, disposed = false
let geometryObserver: ResizeObserver | undefined
const originalModel = computed(() => dentalDoctorPageModel(loaded.value))
const customMode = computed(() => activeTab.value === 'cases' ? 'cases' : !doctor.value?.sourceProfile && (activeTab.value === 'profile' || activeTab.value === 'reviews') ? activeTab.value : null)
const contentTop = computed(() => originalModel.value.content[0]!.y)
const minRightHeight = computed(() => originalModel.value.card.height)
const rightHeight = computed(() => customMode.value && contentHeight.value
  ? Math.max(minRightHeight.value, contentTop.value + contentHeight.value + 32)
  : originalModel.value.right.height)
function resize(node: SourceNode, values: Partial<Pick<SourceNode, 'x' | 'y' | 'width' | 'height'>>) {
  Object.assign(node, values)
  for (const [key,value] of Object.entries(values)) node.css += `;${({x:'left',y:'top',width:'width',height:'height'} as Record<string,string>)[key]}:${value}px;`
}
const composition = computed(() => {
  const root = structuredClone(loaded.value), model = dentalDoctorPageModel(root)
  const all = doctorPageDescendants(root)
  const actions: Record<string, HomeSourceAction> = {}
  const attributes: Record<string, Record<string,string|number|boolean>> = {}
  const titleRoutes: Record<string,string> = { 首页:'/', 疾病中心:'/diseases-technologies', 费用对比:'/why-china#cost-comparison', 报告体验:'/report', 签证办理:'/visa', 就医步骤:'/steps', 患者案例:'/cases', 保险指南:'/insurance', 关于我们:'/about', 'contact@huanyuyunyi.com':publicContacts.emailHref, WhatsApp:publicContacts.whatsappHref }
  for (const node of all) {
    if (node.type === 'TEXT' && titleRoutes[node.text]) actions[node.id] = { href:titleRoutes[node.text] }
    if (node.text === '隐私政策' || node.text === '服务条款') actions[node.id] = { action:'pending', label:node.text }
    if (/^未标题-1 [12]$/.test(node.name)) actions[node.id] = { href:'/', label:'寰宇云医首页' }
  }
  const cardNodes = doctorPageDescendants(model.card)
  const cardText = (text: string) => cardNodes.find(node => node.text.trim() === text)
  if (!doctor.value.sourceProfile) {
    const portrait = cardNodes.find(node => node.name.startsWith('Image ('))!
    // Figma's portrait mask is mirrored in the source. Supplied portraits are
    // already upright square exports, so keep its actual center in the card.
    replaceDentalPortrait(portrait, doctor.value.portrait)
    resize(portrait, { x:0 })
    const name = cardText('谭兆林')!, title = cardText('院长 / 主治医生')!
    replaceDentalText(name, doctor.value.name)
    replaceDentalText(title, doctor.value.title)
    // The 2026-11-05 identity lives above a separate divider and metadata
    // group. Expand only this column for supplied longer titles, preserving
    // the authored 122/26px text positions and centered 110px portrait.
    resize(model.card.children[0]!,{x:32,width:240})
    resize(portrait,{x:65})
    const identity = model.card.children[0]!.children[1]!
    resize(identity,{x:0,width:240})
    for (const wrapper of identity.children) resize(wrapper,{x:0,width:240})
    resize(name,{x:0,width:240});resize(title,{x:0,width:240})
    name.css += ';text-align:center;'
    title.css += ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;'
    attributes[title.id] = { title:doctor.value.title }
    const location = cardText('上海 · 口腔专科')!
    replaceDentalText(location, `${doctor.value.city} · ${doctor.value.department}`)
    const metadata = model.card.children.find(node => doctorPageDescendants(node).some(child => child.id === location.id))!
    const locationRow = metadata.children.find(node => doctorPageDescendants(node).some(child => child.id === location.id))!
    const experienceRow = metadata.children.find(node => doctorPageDescendants(node).some(child => child.text === '20年经验'))!
    for (const row of [locationRow,experienceRow]) {
      resize(row,{x:0,width:240})
      if(localized.value) row.layoutCss+=';justify-content:center;'
      else {
        row.css += ';display:flex;justify-content:center;align-items:center;gap:4px;'
        for (const child of row.children) child.css += ';position:relative;left:0;top:0;'
      }
    }
    location.css += ';width:auto;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    attributes[location.id] = { title:`${doctor.value.city} · ${doctor.value.department}` }
    const experience = cardText('20年经验')!
    replaceDentalText(experience, displayDentalExperience(doctor.value.experience))
    experience.css += ';width:auto;white-space:nowrap;'
  }
  const price = cardNodes.find(node => /^[¥$]/.test(node.text))!
  replaceDentalPrice(price, doctor.value.priceLabel)
  price.css += ';white-space:nowrap;'
  attributes[price.id] = { title:doctor.value.priceDescription }
  const buttonGroup = model.card.children.find(node => node.children.some(child => child.name === 'Button'))!
  const institutionButton = buttonGroup.children[0]!
  if (!doctor.value.sourceProfile) replaceDentalText(institutionButton.children[0]!, `${doctor.value.city}牙科机构`)
  actions[institutionButton.id] = { action:'institution', label:`查看${doctor.value.hospital}` }
  actions[buttonGroup.children[1]!.id] = { action:'quote', label:`获取${doctor.value.name}医生免费报价` }
  const labels = ['医生简介','治疗流程',`案例集 · ${dentalPhysicianCases(doctor.value).length}`,`患者评价 · ${doctor.value.sourceProfile ? 128 : doctor.value.reviews.length}`,'在华就诊保障服务 · 10']
  attributes[model.menu.id] = { role:'tablist', 'aria-label':'医生资料' }
  model.tabs.forEach((tab,index) => {
    replaceDentalText(tab.children.find(node => node.type === 'TEXT')!, labels[index]!)
    actions[tab.id] = { action:`tab:${dentalDoctorTabs[index]}`, label:labels[index] }
    attributes[tab.id] = { id:`dental-doctor-tab-${index}`, role:'tab', 'aria-selected':activeTab.value === dentalDoctorTabs[index], 'aria-controls':'dental-doctor-panel', tabindex:activeTab.value === dentalDoctorTabs[index] ? 0 : -1 }
  })
  const relatedDoctors = dentalPhysicians.filter(item => item.id !== doctor.value.id).slice(0,3)
  const cards = model.related.children[1]!.children
  cards.forEach((card,index) => {
    const related = relatedDoctors[index]!
    const nodes = doctorPageDescendants(card)
    const text = nodes.filter(node => node.type === 'TEXT')
    const name = text[0]!, title = text[1]!
    replaceDentalText(name,related.name);replaceDentalText(title,related.title)
    title.css += ';width:269px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    attributes[title.id] = { title:related.title }
    replaceDentalText(text.find(node => /年经验$/.test(node.text))!, displayDentalExperience(related.experience))
    const location = text.find(node => node.text.includes(' · '))!
    replaceDentalText(location,`${related.city} · ${related.department}`)
    location.css += ';width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    const specialty = text[text.length-1]!
    replaceDentalText(specialty,related.specialty)
    specialty.css += ';white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;'
    const portrait = nodes.find(node => node.name.startsWith('Image ('))!
    replaceDentalPortrait(portrait,related.portrait)
    actions[card.id] = { href:`/dental/doctors/${related.slug}`, label:`查看${related.name}医生详情` }
    attributes[card.id] = { 'data-related-doctor':related.id }
  })
  const delta = rightHeight.value - model.section.height
  const contentId=customMode.value?model.content[0]!.id:undefined
  if(contentId) {
    // Keep a real layout anchor for document-supplied content. Hiding every
    // source content node left the injected slot at the old Chinese tab
    // height, so translated tabs could cover it and its expansion controls.
    const anchor=structuredClone(model.content[0]!)
    anchor.children=[];anchor.text='';anchor.type='FRAME'
    delete anchor.textLines;delete anchor.textRuns;delete anchor.textParagraphs
    resize(anchor,{height:Math.max(1,contentHeight.value)})
    anchor.css+=';background:transparent;border:0;border-radius:0;overflow:visible;padding:0;'
    anchor.layoutCss='position:relative;'
    model.right.children=[model.right.children[0]!,anchor]
  }
  resize(model.right,{height:rightHeight.value});resize(model.section,{height:rightHeight.value})
  resize(model.related,{y:model.related.y+delta})
  resize(model.main,{height:model.main.height+delta});resize(model.footer,{y:model.footer.y+delta})
  resize(model.body,{height:model.body.height+delta});resize(root,{height:root.height+delta})
  attributes[model.section.id] = { 'data-dental-doctor-section':true }
  attributes[model.card.id] = { 'data-dental-doctor-card':true }
  attributes[model.menu.id] = { ...attributes[model.menu.id], 'data-dental-doctor-menu':true }
  attributes[model.related.id] = { 'data-dental-doctor-related':true }
  attributes[model.right.id] = { role:'tabpanel', id:'dental-doctor-panel', 'aria-labelledby':`dental-doctor-tab-${dentalDoctorTabs.indexOf(activeTab.value)}` }
  return { root, model, actions, attributes, contentId }
})
// Native sticky positioning is evaluated by the browser during scrolling.
// Keep the source geometry and shared lower boundary without reactive writes
// for every scroll frame (or the 4px first-scroll menu jump).
const stickyNodes = computed<Record<string, SourceSticky>>(() => {
  const { model } = composition.value
  const top = model.header.height + model.section.y
  const menuTop = model.menuWrap.y
  return {
    [model.card.id]: { top, zIndex:4 },
    [model.menuWrap.id]: { top:top+menuTop, boundaryHeight:'var(--dental-sticky-card-height)', zIndex:5 },
    [model.header.id]: { top:0, zIndex:6 },
  }
})
function measureGeometry() {
  const card = rootElement.value?.querySelector<HTMLElement>('[data-dental-doctor-card]')
  if (card) stickyCardHeight.value = card.getBoundingClientRect().height / Math.min(1,width.value/1440)
}
async function observeGeometry() {
  await nextTick()
  geometryObserver?.disconnect()
  const card = rootElement.value?.querySelector<HTMLElement>('[data-dental-doctor-card]')
  if (card) geometryObserver?.observe(card)
  measureGeometry()
}
function updateViewport() {
  width.value=innerWidth
  if (width.value<=700) { void router.replace({path:'/dental',query:{step:'2'}});return }
  void nextTick(measureGeometry)
}
async function loadTab() {
  const current=++request;loading.value=true;error.value=false;contentHeight.value=0
  try { const source=await loadDentalDoctorPage(activeTab.value);if(disposed||current!==request)return;loaded.value=source;await observeGeometry() }
  catch { if (!disposed&&current===request) error.value=true }
  finally { if (!disposed&&current===request) loading.value=false }
}
async function activate(action: string) {
  if (action.startsWith('tab:')) {
    if (action.slice(4) === activeTab.value) return
    await router.replace({ query:{...route.query,tab:action.slice(4)} })
    // A shorter new panel must start at its first row rather than inherit a
    // deep position in the previous panel and hide content behind the menu.
    window.scrollTo({top:0,behavior:'instant'});return
  }
  if (action==='institution') institution.value=true
  if (action==='quote') await router.push({path:'/dental',query:{step:'3',doctor:doctor.value.slug,...(typeof route.query.project==='string'?{project:route.query.project}:{})}})
}
async function keydown(event: KeyboardEvent) {
  if (!(event.target instanceof HTMLElement) || event.target.getAttribute('role')!=='tab') return
  const index=dentalDoctorTabs.indexOf(activeTab.value)
  const next=event.key==='ArrowRight'?(index+1)%5:event.key==='ArrowLeft'?(index+4)%5:event.key==='Home'?0:event.key==='End'?4:null
  if (next===null) return
  event.preventDefault();await activate(`tab:${dentalDoctorTabs[next]}`);await nextTick()
  rootElement.value?.querySelector<HTMLElement>(`#dental-doctor-tab-${next}`)?.focus({preventScroll:true})
}
watch(() => [route.params.slug,activeTab.value], () => {
  if (!dentalPhysicians.some(item => item.slug === route.params.slug)) { void router.replace('/dental');return }
  image.value=undefined;institution.value=false;void loadTab()
}, {immediate:true})
watch(rightHeight,observeGeometry)
watch(image, async value => { await nextTick();if(value)imageDialog.value?.showModal();else imageDialog.value?.close() })
onMounted(()=>{geometryObserver=new ResizeObserver(measureGeometry);window.addEventListener('resize',updateViewport,{passive:true});void observeGeometry()})
onBeforeUnmount(()=>{disposed=true;request++;window.removeEventListener('resize',updateViewport);geometryObserver?.disconnect();imageDialog.value?.close()})
</script>

<template>
  <div ref="rootElement" class="dental-doctor-page" :style="{'--dental-sticky-card-height':`${stickyCardHeight || composition.model.card.height}px`}" :data-dental-doctor-page="doctor.id" :data-active-tab="activeTab" :aria-busy="loading" @keydown="keydown">
    <p v-if="error" class="dental-doctor-page__error" role="alert">{{ tx("内容暂时未能加载，") }}<button type="button" @click="loadTab">{{ tx("重新加载") }}</button></p>
    <DentalSourceCanvas :key="`${doctor.id}-${loaded.id}`" :node="composition.root" :width="width" :actions="composition.actions" :attributes="composition.attributes" native-sticky :sticky-nodes="stickyNodes" @layout="observeGeometry" @activate="activate">
      <template #after="{node}">
        <DentalDoctorPageContent v-if="customMode && node.id === composition.contentId" :key="`${doctor.id}-${customMode}`" :doctor="doctor" :mode="customMode" :source="loaded" @height="value=>contentHeight=value" @image="value=>image=value" />
      </template>
    </DentalSourceCanvas>
    <InstitutionDialog v-if="institution" :doctor="doctor" institution @close="institution=false" />
    <Teleport to="body">
      <dialog ref="imageDialog" class="dental-case-image" :aria-label="tx('案例图片预览')" @cancel.prevent="image=undefined" @click="event=>{if(event.target===imageDialog)image=undefined}">
        <button type="button" class="dental-case-image__close" :aria-label="tx('关闭图片预览')" @click="image=undefined">×</button>
        <img v-if="image" :src="image.src" :alt="tx(image.alt)" />
      </dialog>
    </Teleport>
  </div>
</template>

<style scoped>
.dental-doctor-page { position:relative; background:#f3f4f6; }
.dental-doctor-page :deep([data-dental-doctor-menu]::before) { content:''; position:absolute; left:-32px; top:-20px; width:888px; height:calc(100% + 44px); border-radius:24px 24px 0 0; background:linear-gradient(180deg,#fff 0%,#fff 100%); z-index:-1; }
.dental-doctor-page :deep([data-dental-doctor-menu]::after) { content:'';position:absolute;left:-32px;top:-68px;width:888px;height:48px;background:#f3f4f6;z-index:-1;pointer-events:none; }
.dental-doctor-page__error { position:fixed; z-index:40; top:12px; left:50%; transform:translateX(-50%); background:white; padding:12px 20px; border:1px solid #e5e7eb; border-radius:12px; }
.dental-doctor-page :deep(button:focus-visible),.dental-doctor-page :deep(a:focus-visible) { outline:2px solid #2563eb; outline-offset:3px; }
.dental-case-image { width:max-content; max-width:94vw; max-height:92vh; border:0; padding:40px 16px 16px; border-radius:16px; background:white; margin:auto; }
.dental-case-image::backdrop { background:rgba(0,0,0,.65); }
.dental-case-image img { display:block; max-width:88vw; max-height:80vh; width:auto; height:auto; object-fit:contain; }
.dental-case-image__close { position:absolute; top:4px; right:10px; width:32px; height:32px; font-size:28px; cursor:pointer; border:0; background:transparent; }
</style>
