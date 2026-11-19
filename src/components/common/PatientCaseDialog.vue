<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useSiteCopy } from '@/i18n/siteCopy'
import { patientCaseDetailSource, type DesignNode, type PatientCase } from '@/data/patientCases'

const props = defineProps<{ patient: PatientCase | null }>()
const emit = defineEmits<{ close: [] }>()
const { tx, tf } = useSiteCopy()
const index = ref(0)
const dialog = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const paused = ref(false)
let restoreFocus: HTMLElement | null = null
let previousOverflow = ''
let timer: number | undefined
let hoveringPhoto = false
let motionPreference: MediaQueryList | undefined
const photo = computed(() => props.patient?.photos[index.value])
const source = computed(() => patientCaseDetailSource[String(props.patient?.id)]!)
function stopAutoplay() { window.clearTimeout(timer); timer = undefined }
function scheduleAutoplay() {
  stopAutoplay()
  if (!props.patient || props.patient.photos.length < 2 || hoveringPhoto || paused.value || document.hidden || motionPreference?.matches) return
  timer = window.setTimeout(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { stopAutoplay(); return }
    selectPhoto(index.value + 1)
  }, 5000)
}
function togglePause() { paused.value = !paused.value; scheduleAutoplay() }
function photoPointer(event: PointerEvent, inside: boolean) { if (event.pointerType === 'mouse') { hoveringPhoto = inside; scheduleAutoplay() } }
function selectPhoto(value: number) {
  const count = props.patient?.photos.length || 0
  if (count) index.value = (value + count) % count
  scheduleAutoplay()
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); emit('close'); return }
  if (event.key === 'ArrowLeft') { event.preventDefault(); selectPhoto(index.value - 1); return }
  if (event.key === 'ArrowRight') { event.preventDefault(); selectPhoto(index.value + 1); return }
  if (event.key !== 'Tab' || !dialog.value) return
  const elements = Array.from(dialog.value.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'))
  if (!elements.length) return
  const first = elements[0]!, last = elements[elements.length - 1]!
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
watch(() => props.patient, async (patient, previous) => {
  if (patient && !previous) {
    restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', keydown)
    document.addEventListener('visibilitychange', scheduleAutoplay)
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionPreference.addEventListener('change', scheduleAutoplay)
    index.value = 0
    paused.value = false
    hoveringPhoto = false
    scheduleAutoplay()
    await nextTick()
    closeButton.value?.focus()
  } else if (!patient && previous) {
    document.body.style.overflow = previousOverflow
    window.removeEventListener('keydown', keydown)
    document.removeEventListener('visibilitychange', scheduleAutoplay)
    motionPreference?.removeEventListener('change', scheduleAutoplay)
    stopAutoplay()
    await nextTick()
    restoreFocus?.focus({ preventScroll: true })
  }
})
onBeforeUnmount(() => {
  if (props.patient) document.body.style.overflow = previousOverflow
  window.removeEventListener('keydown', keydown)
  document.removeEventListener('visibilitychange', scheduleAutoplay)
  motionPreference?.removeEventListener('change', scheduleAutoplay)
  stopAutoplay()
})
function text(node:DesignNode):string { return node.type === 'TEXT' ? node.text || '' : node.children.map(text).join('') }
type TableCell = { id:string; textId?:string; text:string }
type TableRow = { id:string; cells:TableCell[] }
type ContentBlock = { id:string; kind:'table'; rows:TableRow[] } | { id:string; kind:'quote'|'paragraph'; textId?:string; intermediates:string; text:string; leadStrong:boolean; paragraphSpacing:boolean }
// These source text nodes use a semibold first line in Figma's rich-text runs.
const strongLeadNodes = new Set(['4342:466', '4342:468', '4342:470', '4342:472', '4342:594', '4342:596', '4342:663', '4342:665', '4342:667', '4342:728', '4342:730'])
// Figma's paragraphSpacing is separate from text line-height on these nodes.
const spacedParagraphNodes = new Set(['4342:460', '4342:834', '4342:893', '4342:905', '4342:911', '4342:928', '4342:941', '4342:950'])
function firstText(node:DesignNode):DesignNode | undefined {
  if (node.type === 'TEXT') return node
  for (const child of node.children) { const match = firstText(child); if (match) return match }
}
function intermediateNodes(node:DesignNode):string {
  return node.children.flatMap(child => child.type === 'TEXT' ? [] : [child.id, ...intermediateNodes(child).split(' ').filter(Boolean)]).join(' ')
}
function blocks(nodes:DesignNode[]): ContentBlock[] {
  return nodes.flatMap<ContentBlock>(node => {
    if (!text(node).trim()) return []
    if (node.name === 'Table' || node.children.some(child => child.name === 'Table')) return [{ id:node.id, kind:'table', rows: tableRows(node) }]
    const textId = firstText(node)?.id
    return [{ id:node.id, kind:node.name === 'Frame 717' ? 'quote' : 'paragraph', textId, intermediates:intermediateNodes(node), text:text(node), leadStrong: Boolean(textId && strongLeadNodes.has(textId)), paragraphSpacing: Boolean(textId && spacedParagraphNodes.has(textId)) }]
  })
}
function tableRows(node:DesignNode): TableRow[] {
  const table = node.name === 'Table' ? node : node.children.find(child => child.name === 'Table')
  if (!table) return []
  return table.children.map(row => ({ id:row.id, cells:row.children.map(cell => ({ id:cell.id, textId:firstText(cell)?.id, text:text(cell) })).filter(cell => cell.text) })).filter(row => row.cells.length)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="patient" class="case-dialog-frame" :data-figma-node="source.root">
    <div class="case-dialog-backdrop" :data-figma-node="source.backdrop" @mousedown.self="emit('close')">
      <section ref="dialog" class="case-dialog" role="dialog" aria-modal="true" aria-labelledby="patient-story-title" :data-figma-frame="patient.frameId" :data-figma-node="source.dialog">
        <button ref="closeButton" type="button" class="case-dialog__close" :data-figma-node="source.close" :aria-label="tx('关闭详情')" @click="emit('close')"><svg :data-figma-node="source.closeIcon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path :data-figma-node="source.closePath" d="M5 15L15 5M5 5L15 15" stroke="#1E3A5F" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div :data-figma-node="source.headingGroup"><h2 id="patient-story-title" :data-figma-node="source.heading"><span :data-figma-node="source.headingText">{{ tx('患者故事') }}</span></h2></div>
        <div class="case-dialog__columns" :data-figma-node="source.columns">
          <aside class="case-dialog__aside" :data-figma-node="source.left">
            <div class="case-dialog__image" :data-figma-node="source.photo" @pointerenter="photoPointer($event, true)" @pointerleave="photoPointer($event, false)">
              <img :src="photo" :data-figma-node="source.photoPaint" :alt="tf('查看第{arg0}张患者照片', { arg0: index + 1 })" />
              <template v-if="patient.photos.length > 1">
                <div class="case-dialog__dots" :data-figma-node="source.dots"><button v-for="(_, i) in patient.photos" :key="i" type="button" :data-figma-node="source.dotButtons[i]" :class="{ active:i===index }" :aria-pressed="i===index" :aria-label="tf('查看第{arg0}张患者照片', { arg0:i+1 })" @click="selectPhoto(i)" /></div>
                <button type="button" class="case-dialog__pause" :aria-pressed="paused" @click="togglePause">{{ tx(paused ? '播放患者照片' : '暂停患者照片') }}</button>
              </template>
            </div>
            <div class="case-dialog__summary-outer" :data-figma-node="source.summaryOuter"><div class="case-dialog__summary" :data-figma-node="source.summaryBox"><div :data-figma-node="source.summaryInner"><h3 :data-figma-node="source.summaryHeading"><span :data-figma-node="patient.detailTitle.nodeId">{{ tx(patient.detailTitle.text) }}</span></h3><div :data-figma-node="source.summaryCopy"><p :data-figma-node="patient.detailSummary.nodeId">{{ tx(patient.detailSummary.text) }}</p></div></div></div></div>
          </aside>
          <div class="case-dialog__timeline-wrapper" :data-figma-node="source.right">
          <div class="case-dialog__timeline" :data-figma-node="source.timeline" :data-figma-background="source.background">
            <div class="case-dialog__timeline-head" :data-figma-node="source.timelineHead"><h3 :data-figma-node="source.timelineHeading"><span :data-figma-node="source.timelineHeadingText">{{ tx('治疗全流程') }}</span></h3><small v-if="patient.id === 6" :data-figma-node="source.sourceHeading"><span :data-figma-node="source.sourceText">{{ tx('来源于广州现代肿瘤医院公开信息披露') }}</span></small></div>
            <div :data-figma-node="source.steps">
            <article v-for="(section, i) in patient.sections" :key="section.nodeId" class="case-dialog__step" :data-figma-node="section.nodeId">
              <span v-if="source.sections[section.nodeId]?.line" class="case-dialog__line" :data-figma-node="source.sections[section.nodeId]?.line" aria-hidden="true" />
              <span class="case-dialog__number" :data-figma-node="source.sections[section.nodeId]?.number"><span :data-figma-node="source.sections[section.nodeId]?.numberText">{{ String(i+1).padStart(2, '0') }}</span></span>
              <h4 :data-figma-node="source.sections[section.nodeId]?.heading"><span :data-figma-node="section.heading.nodeId">{{ tx(section.heading.text) }}</span></h4>
              <div :data-figma-node="source.sections[section.nodeId]?.list">
              <template v-for="block in blocks(section.content)" :key="block.id">
                <div v-if="block.kind === 'table'" class="case-dialog__table-wrap" :data-figma-node="block.id"><table><tbody><tr v-for="(row, ri) in block.rows" :key="row.id" :data-figma-node="row.id"><component :is="ri === 0 ? 'th' : 'td'" v-for="cell in row.cells" :key="cell.id" :data-figma-node="cell.id"><span :data-figma-node="cell.textId">{{ tx(cell.text) }}</span></component></tr></tbody></table></div>
                <blockquote v-else-if="block.kind === 'quote'" :data-figma-node="block.id" :data-figma-collapsed="block.intermediates"><span :data-figma-node="block.textId">{{ tx(block.text) }}</span></blockquote>
                <p v-else :data-figma-node="block.id" :data-figma-collapsed="block.intermediates"><span :data-figma-node="block.textId"><template v-if="block.leadStrong && tx(block.text).includes('\n')"><strong>{{ tx(block.text).split('\n')[0] }}</strong>{{ '\n' + tx(block.text).split('\n').slice(1).join('\n') }}</template><template v-else-if="block.paragraphSpacing && tx(block.text).includes('\n')"><span v-for="(paragraph, paragraphIndex) in tx(block.text).split('\n')" :key="paragraphIndex" class="case-dialog__paragraph-line">{{ paragraph }}</span></template><template v-else>{{ tx(block.text) }}</template></span></p>
              </template>
              </div>
            </article>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  </Teleport>
</template>

<style scoped>
.case-dialog-backdrop{position:fixed;z-index:1000;inset:0;display:flex;justify-content:center;align-items:flex-start;overflow-y:auto;padding:40px 16px;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);scrollbar-width:none}.case-dialog-backdrop::-webkit-scrollbar{display:none}
.case-dialog{position:relative;width:min(1096px,100%);padding:32px;border-radius:24px;background:#fff;color:#1e3a5f;box-sizing:border-box}
.case-dialog [id="patient-story-title"]{margin:0;padding-right:48px;overflow-wrap:anywhere;font:600 28px/28px 'PingFang SC',sans-serif}.case-dialog__close{position:absolute;top:16px;right:32px;width:36px;height:36px;padding:8px;border:0;border-radius:50%;background:transparent;color:#1e3a5f;cursor:pointer}
.case-dialog__columns{display:grid;grid-template-columns:404px minmax(0,604px);gap:24px;padding-top:24px}.case-dialog__aside{min-width:0}.case-dialog__image{position:relative;aspect-ratio:3/2;overflow:hidden;border-radius:24px;background:#e9eef3}.case-dialog__image>img{display:block;width:100%;height:100%;object-fit:cover}.case-dialog__dots{position:absolute;bottom:17px;left:50%;display:flex;gap:8px;transform:translateX(-50%)}.case-dialog__dots button{width:10px;height:10px;padding:0;border:0;border-radius:999px;background:#fff9;cursor:pointer}.case-dialog__dots button.active{width:32px;background:#dd6b20}.case-dialog__summary{margin-top:24px;padding:24px;border-radius:24px;background:#f5f6f7}.case-dialog__summary h3{margin:0 0 16px;font-size:20px;line-height:1.5}.case-dialog__summary p{margin:0;color:#4b5563;font-size:16px;line-height:1.6}.case-dialog__timeline{min-width:0;padding:24px;border-radius:24px;background:#f5f6f7}.case-dialog__timeline-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:24px}.case-dialog__timeline-head h3{margin:0;font-size:24px}.case-dialog__timeline-head small{color:#9ca3af;font-size:12px;text-align:right}.case-dialog__step{position:relative;margin-left:16px;padding:0 0 24px 26px;border-left:2px solid #dbeafe}.case-dialog__step:last-child{padding-bottom:0;border-color:transparent}.case-dialog__number{position:absolute;left:-17px;top:0;display:grid;width:32px;height:32px;place-items:center;border-radius:50%;background:#2d6bec;color:#fff;font-weight:700}.case-dialog__step h4{margin:0 0 16px;font-size:18px;line-height:32px}.case-dialog__step p,.case-dialog__step blockquote{margin:0 0 14px;color:#4b5563;font-size:16px;line-height:1.65;white-space:pre-line;overflow-wrap:anywhere}.case-dialog__step blockquote{padding:16px;border-radius:16px;background:#fff;font-style:italic}.case-dialog__table-wrap{overflow-x:auto}.case-dialog__step table{width:100%;border-collapse:collapse;margin:0 0 16px;color:#4b5563}.case-dialog__step th,.case-dialog__step td{padding:8px;border-bottom:1px solid #d9dee6;text-align:left;vertical-align:top;font-size:14px}
@media(max-width:800px){.case-dialog__columns{grid-template-columns:1fr}.case-dialog__aside{display:grid;grid-template-columns:1fr 1fr;gap:16px}.case-dialog__summary{margin:0}.case-dialog__timeline-head{flex-wrap:wrap}}
@media(max-width:600px){.case-dialog-backdrop{padding:12px}.case-dialog{padding:20px}.case-dialog__close{right:16px;top:12px}.case-dialog__aside{display:block}.case-dialog__summary{margin-top:16px}.case-dialog__timeline{padding:18px}.case-dialog__step{padding-left:22px}.case-dialog__summary h3{font-size:18px}}
.case-dialog:not(:lang(zh)) [id="patient-story-title"]{line-height:1.2}
.case-dialog__timeline-wrapper{min-width:0}.case-dialog__step{border-left-color:transparent}.case-dialog__line{position:absolute;left:-2px;top:32px;bottom:0;width:2px;background:#dbeafe}
.case-dialog__pause{position:absolute;right:10px;bottom:10px;clip-path:inset(50%)}.case-dialog__pause:focus-visible{clip-path:none}
.case-dialog__summary h3{font-size:18px;line-height:28px;font-weight:600;margin-bottom:8px}.case-dialog__summary p,.case-dialog__step p,.case-dialog__step blockquote{line-height:24px}.case-dialog__timeline-head h3{font-size:22px;font-weight:600;line-height:22px}.case-dialog__step{padding-bottom:20px}.case-dialog__step h4{font-weight:600;margin-bottom:8px}
.case-dialog__table-wrap{width:100%;border:1px solid #f3f4f6;border-radius:20px;overflow-x:auto;overflow-y:hidden;margin-bottom:16px}.case-dialog__step table{min-width:480px;table-layout:fixed;border-collapse:collapse;margin:0}.case-dialog__step tr:first-child{background:linear-gradient(90deg,#2563eb,#1d4ed8)}.case-dialog__step th{height:52px;padding:10px 20px;color:#fff;font-size:16px;font-weight:600;line-height:20px;vertical-align:middle}.case-dialog__step td{height:52px;padding:10px 20px;background:#fff;color:#4b5563;font-size:14px;line-height:20px;vertical-align:middle}.case-dialog__step :is(th,td)+:is(th,td){border-left:1px solid #f3f4f6}.case-dialog__step td{border-top:1px solid #f3f4f6;border-bottom:0}.case-dialog__table-wrap[data-figma-node="4342:539"] :is(th,td):first-child{width:110px}.case-dialog__table-wrap[data-figma-node="4342:539"] :is(th,td):nth-child(2){width:170px}.case-dialog__table-wrap[data-figma-node="4342:741"] :is(th,td):first-child{width:215px}.case-dialog__table-wrap[data-figma-node="4342:741"] :is(th,td):nth-child(2){width:110px}
.case-dialog:lang(zh) .case-dialog__step th{white-space:nowrap}
.case-dialog__summary{box-sizing:border-box;min-height:238px}.case-dialog__step p strong{font-weight:600}
.case-dialog__step p,.case-dialog__step blockquote{margin-bottom:12px}.case-dialog__step :is(p,blockquote):last-child{margin-bottom:0}
.case-dialog__step blockquote{padding:12px;color:#6b7280;font-size:14px;line-height:22px}
.case-dialog__step:not(:first-child):not(:last-child){padding-bottom:24px}
.case-dialog:lang(zh) .case-dialog__step blockquote:is([data-figma-node="4342:473"],[data-figma-node="4342:485"]){min-height:89px}
.case-dialog__paragraph-line{display:block}.case-dialog__paragraph-line+.case-dialog__paragraph-line{margin-top:8px}
.case-dialog{font-family:'PingFang SC','Noto Sans SC',sans-serif}.case-dialog__number{font-family:'Noto Sans SC',sans-serif}
.case-dialog__step th,.case-dialog__step td{font-size:16px;line-height:16px}.case-dialog__step td{color:#6b7280}.case-dialog__step td:first-child{color:#1e3a5f;font-weight:600}
.case-dialog:not(:lang(zh)) .case-dialog__step :is(th,td){overflow-wrap:anywhere}
.case-dialog:lang(zh) .case-dialog__table-wrap[data-figma-node="4342:741"] td:first-child{padding-right:10px;white-space:nowrap}
.case-dialog:lang(zh) .case-dialog__table-wrap[data-figma-node="4342:741"] table{min-width:510px}
.case-dialog:lang(zh) .case-dialog__table-wrap[data-figma-node="4342:741"] td:last-child{padding-right:10px;white-space:nowrap}
.case-dialog__table-wrap{margin-bottom:0}
.case-dialog:lang(zh) [data-figma-node="4342:729"]{min-height:96px}
@media(max-width:800px){.case-dialog__summary{min-height:0}}
</style>
