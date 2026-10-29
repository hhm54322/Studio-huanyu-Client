<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import DentalSourceCanvas from './DentalSourceCanvas.vue'
import { dentalActions, dentalDoctorCardAliases, dentalDoctorCardSource, dentalDoctorNodes, dentalFilterControls, dentalMatchingSource, dentalNode, dentalProjectNodes, dentalSources } from '@/data/dentalFigmaSource'
type Filters = { city: string; title: string; experience: string; background: string; language: string; price: string }
const props = defineProps<{
  step: 1 | 2 | 3; width: number; selectedProject: string; expandedProjects: Set<string>
  projects: { id: string; title: string; suitable: string; detail: string; duration: string; note?: string }[]
  filters: Filters; filteredDoctorIds: number[]; sort: string; filtered: boolean
  form: { budget: string; visitTime: string; notes: string }; files: File[]; status: string; error: string; submitted: boolean
}>()
const emit = defineEmits<{
  step: [step: 1 | 2 | 3]; project: [id: string]; doctor: [id: number]; filter: []; reset: []; sort: [sort: 'recommended' | 'experience' | 'rating' | 'price']
  'update-filter': [key: keyof Filters, value: string]; 'update-form': [key: 'budget' | 'visitTime' | 'notes', value: string]
  files: [event: Event]; submit: []; retry: []; consultation: []; institution: []; 'doctor-cases':[id:number]; quote:[id:number]
}>()
const root = ref<HTMLElement | null>(null)
const source = computed(() => props.step === 2 ? dentalMatchingSource : dentalSources[props.step === 1 ? 'project' : 'upload']!.root)
const detailHeights = ref<Record<string, number>>({})
let observer: ResizeObserver | undefined
const detailElements = new Map<Element, string>()
function measureDetails() {
  detailElements.forEach((id, element) => {
    const height = (element as HTMLElement).offsetHeight
    if (height && detailHeights.value[id] !== height) detailHeights.value[id] = height
  })
}
function detailElement(value: unknown, id: string) {
  for (const [element, key] of detailElements) if (key === id && element !== value) { observer?.unobserve(element); detailElements.delete(element) }
  if (!(value instanceof HTMLElement)) return
  detailElements.set(value, id)
  observer?.observe(value)
  measureDetails()
}
onMounted(() => { observer = new ResizeObserver(measureDetails); detailElements.forEach((_, element) => observer!.observe(element)); measureDetails() })
onBeforeUnmount(() => observer?.disconnect())

// Resting coordinates, padding, and typography come from the locked source.
const detailTemplate = dentalNode('2294:8297')
const projects = computed(() => dentalProjectNodes.map((id, index) => {
  const node = dentalNode(id), content = node.children.find(child => child.type === 'FRAME' && child.children.some(item => item.name === 'Heading 3'))!
  const detail = content.children.find(child => child.id === detailTemplate.id)
  const summaryHeight = detail?.y ?? content.height
  const extraHeight = detail?.height ?? detailHeights.value[id] ?? detailTemplate.height
  const expanded = props.expandedProjects.has(props.projects[index]!.id)
  return { id, node, content, detail, data: props.projects[index]!, summaryHeight, extraHeight, expanded, height: node.height - (detail?.height ?? 0) + (expanded ? extraHeight : 0) }
}))
const projectLayout = computed(() => {
  const next=dentalNode('2294:8336')
  // The source action sits in the middle column. Preserve its resting position
  // and let that column's independently expanded card push it down.
  const buttonTop=Math.max(next.y,projects.value[1]!.height+24)
  const height=Math.max(dentalNode('2294:8280').height,...projects.value.map(item=>item.height),buttonTop+next.height)
  return { height,buttonTop,delta:height-dentalNode('2294:8280').height }
})
const canvasHeight = computed(() => source.value.height + (props.step === 1 ? projectLayout.value.delta : 0))
const actions = computed(() => {
  const result = { ...dentalActions }
  dentalProjectNodes.forEach((id, index) => { result[id] = { action: `project:${props.projects[index]!.id}`, label: props.projects[index]!.title } })
  return result
})
const texts = computed(() => {
  const result: Record<string, string> = {}
  dentalFilterControls.forEach(control => { if (props.filters[control.key]) result[control.text] = props.filters[control.key] })
  if (props.filtered) result['2294:7059'] = `共 ${props.filteredDoctorIds.length} 位医生`
  if (props.status === 'submitting') result['2294:8115'] = '正在提交…'
  else if (props.submitted) result['2294:8115'] = '资料提交成功'
  return result
})
const attributes = computed(() => {
  const result: Record<string, Record<string, string | number | boolean>> = {}
  for (const [id, sourceId] of Object.entries(dentalDoctorCardAliases)) result[id] = { 'data-figma-source-node': sourceId }
  projects.value.forEach(project => {
    result[project.id] = { 'aria-expanded': project.expanded, 'aria-controls': `dental-details-${project.data.id}`, 'aria-pressed': props.selectedProject === project.data.id, 'data-project': project.data.id, class: 'dental-live-project' }
    if (project.detail) result[project.detail.id] = { id: `dental-details-${project.data.id}`, 'aria-hidden': !project.expanded, class: 'dental-live-detail' }
    const arrow = project.content.children.find(child => child.y === 96)?.children.find(child => child.svg)
    if (arrow) result[arrow.id] = { class: 'dental-live-arrow' }
  })
  dentalDoctorNodes.forEach(doctor => { result[doctor.node] = { ...result[doctor.node], 'data-doctor': doctor.id, 'data-figma-component': dentalDoctorCardSource.frame, class: 'dental-doctor-card__button' } })
  sortNodes.forEach((id, index) => { result[id] = { 'aria-pressed': props.sort === sorts[index] } })
  result['2294:8114'] = { disabled: props.status === 'submitting' || props.submitted, 'aria-busy': props.status === 'submitting' }
  result['2294:8078'] = { class: 'dental-live-picker', 'data-upload-state': props.status }
  return result
})
const sorts = ['recommended', 'experience', 'rating', 'price'] as const
const sortNodes = ['2294:7047', '2294:7049', '2294:7051', '2294:7053']
const paint = (id: string) => dentalNode(id).css.split('position:absolute;')[0]!.split('\n').filter(line => /^(?:border|background|box-shadow)/.test(line.trim())).join(';')
const styles = computed(() => {
  const result: Record<string, string> = {}
  if (props.step === 1) {
    const delta = projectLayout.value.delta
    for (const id of ['2294:8240', '2294:8241', '2294:8242', '2294:8250', '2294:8274']) result[id] = `height:${dentalNode(id).height + delta}px;`
    result['2294:8280'] = `height:${projectLayout.value.height}px;`
    result['2294:8336'] = `top:${projectLayout.value.buttonTop}px;`
    projects.value.forEach((project, index) => {
      result[project.id] = `top:0px;height:${project.height}px;overflow:hidden;`
      const originallySelected = project.id === '2294:8302'
      if ((props.selectedProject === project.data.id) !== originallySelected) {
        const selected = props.selectedProject === project.data.id
        result[project.id] += `border:0;box-shadow:none;${paint(selected ? '2294:8302' : '2294:8319')};`
        const border = selected ? 2 : 0
        project.node.children.forEach(child => { result[child.id] = `left:${child.x - border}px;top:${child.y - border}px;` })
      }
      if (project.detail) result[project.detail.id] = `height:${project.expanded ? project.extraHeight : 0}px;overflow:hidden;opacity:${project.expanded ? 1 : 0};`
      const arrow = project.content.children.find(child => child.y === 96)?.children.find(child => child.svg)
      if (arrow) result[arrow.id] = `transform-origin:center;transform:rotate(${project.expanded !== Boolean(project.detail) ? 180 : 0}deg);`
    })
  }
  if (props.step === 2) {
    sortNodes.forEach((id, index) => {
      const active = props.sort === sorts[index]
      if (active !== (index === 0)) {
        result[id] = `background:transparent;${paint(active ? sortNodes[0]! : sortNodes[1]!)};`
        result[dentalNode(id).children[0]!.id] = typography(active ? '2294:7048' : '2294:7050')
      }
    })
    if (props.filtered) {
      const slots = dentalDoctorNodes.map(doctor => dentalNode(doctor.node)).sort((a, b) => a.y - b.y || a.x - b.x)
      props.filteredDoctorIds.forEach((id, index) => {
        const doctor = dentalDoctorNodes.find(item => item.id === id), slot = slots[index]
        if (doctor && slot) result[doctor.node] = `left:${slot.x}px;top:${slot.y}px;`
      })
    }
  }
  if (props.step === 3) {
    if (props.form.budget) result['2294:8095'] = 'visibility:hidden;'
    if (props.form.visitTime) result['2294:8103'] = 'visibility:hidden;'
    if (props.form.notes) result['2294:8113'] = 'visibility:hidden;'
  }
  return result
})
const hidden = computed(() => props.step === 2 && props.filtered ? dentalDoctorNodes.filter(doctor => !props.filteredDoctorIds.includes(doctor.id)).map(doctor => doctor.node) : [])
function activate(action: string) {
  if (action.startsWith('step:')) emit('step', Number(action.slice(5)) as 1 | 2 | 3)
  else if (action.startsWith('project:')) emit('project', action.slice(8))
  else if (action.startsWith('doctor-cases:')) emit('doctor-cases',Number(action.slice(13)))
  else if (action.startsWith('quote:')) emit('quote',Number(action.slice(6)))
  else if (action === 'institution') emit('institution')
  else if (action.startsWith('doctor:')) emit('doctor', Number(action.slice(7)))
  else if (action.startsWith('sort:')) emit('sort', action.slice(5) as 'recommended' | 'experience' | 'rating' | 'price')
  else if (action === 'filter') emit('filter')
  else if (action === 'reset') { emit('reset'); emit('sort', 'recommended') }
  else if (action === 'submit' && props.status !== 'submitting' && !props.submitted) emit('submit')
  else if (action === 'consultation') emit('consultation')
}
function filterChanged(key: keyof Filters, event: Event) { emit('update-filter', key, (event.target as HTMLSelectElement).value) }
function formChanged(key: 'budget' | 'visitTime' | 'notes', event: Event) { emit('update-form', key, (event.target as HTMLInputElement).value) }
const typography = (id: string) => dentalNode(id).css.split('\n').filter(line => /^(?:color:|font-|line-height:|letter-spacing:|text-align:)/.test(line.trim())).join(';')
const controlStyle = (frame: string, text: string, value: string) => `${typography(text)};${dentalNode(frame).layoutCss?.split('\n').filter(line => /^padding:/.test(line.trim())).join(';')};color:${value ? '#0F172A' : 'transparent'};`
const feedbackStyle = computed(() => `${typography('2294:8115')};color:${props.status === 'error' ? '#DD6B20' : '#1E3A5F'};top:${dentalNode('2294:8114').y + dentalNode('2294:8114').height + 24}px;`)
const feedback = computed(() => props.error || (props.status === 'submitting' ? '正在安全上传资料…' : props.status === 'success' ? '资料已记录，顾问会尽快与你联系。' : props.status === 'ready' ? `已选择 ${props.files.length} 个文件，可提交评估。` : ''))
</script>
<template>
  <div ref="root" class="dental-desktop-flow" :data-dental-step="step">
    <DentalSourceCanvas :key="step" :node="source" :width="width" :height="canvasHeight" :actions="actions" :texts="texts" :attributes="attributes" :styles="styles" :hidden="hidden" @activate="activate">
      <template #after="{ node }">
        <template v-for="project in projects" :key="project.id">
          <div v-if="!project.detail && node.id === project.content.id" :id="`dental-details-${project.data.id}`" class="dental-live-detail dental-added-detail" :aria-hidden="!project.expanded" :style="{ top: `${project.summaryHeight}px`, height: `${project.expanded ? project.extraHeight : 0}px` }">
            <div :ref="element => detailElement(element, project.id)" :style="detailTemplate.layoutCss">
              <p v-for="(row,index) in [['适用人群：',project.data.suitable],['治疗流程：',project.data.detail],['周期：',project.data.duration],...(project.data.note ? [['注意事项：',project.data.note]] : [])]" :key="index" :style="`${dentalNode('2294:8298').layoutCss};height:auto;white-space:normal;`"><span :style="dentalNode('2294:8298').textRuns?.[0]?.css">{{ row[0] }}</span>{{ row[1] }}</p>
            </div>
          </div>
        </template>
        <template v-for="control in dentalFilterControls" :key="control.node">
          <select v-if="node.id === control.node" class="dental-native-overlay" :aria-label="control.label" :value="filters[control.key]" @change="filterChanged(control.key, $event)"><option value="">{{ control.label }}</option><option v-for="option in control.options" :key="option">{{ option }}</option></select>
        </template>
        <p v-if="node.id === '2294:7060' && filtered && !filteredDoctorIds.length" class="dental-empty-results" role="status" :style="typography('2294:7059')">暂无符合条件的医生，请调整筛选条件。</p>
        <label v-if="node.id === '2294:8078'" class="dental-native-overlay dental-file-picker" aria-label="上传牙片或口腔照片"><input type="file" accept=".jpg,.jpeg,.png,.pdf" multiple :disabled="status === 'submitting' || submitted" aria-label="上传牙片或口腔照片" @change="emit('files', $event)" /></label>
        <ul v-if="node.id === '2294:8073' && files.length" class="dental-upload-files" :style="typography('2294:8084')" aria-label="已选择的资料"><li v-for="(file,index) in files" :key="`${index}-${file.name}`" :title="file.name">{{ file.name }}</li></ul>
        <select v-if="node.id === '2294:8093'" class="dental-native-overlay dental-editable-control" aria-label="预算范围" :style="controlStyle('2294:8093','2294:8095',form.budget)" :value="form.budget" :disabled="status === 'submitting' || submitted" @change="formChanged('budget', $event)"><option value="">请输入您的预算</option><option>¥5,000 - ¥20,000</option><option>¥20,000 - ¥50,000</option><option>¥50,000以上</option></select>
        <input v-if="node.id === '2294:8099'" type="date" class="dental-native-overlay dental-editable-control" :class="{ 'is-empty': !form.visitTime }" aria-label="计划到访时间" :style="controlStyle('2294:8099','2294:8103',form.visitTime)" :value="form.visitTime" :disabled="status === 'submitting' || submitted" @input="formChanged('visitTime', $event)" />
        <textarea v-if="node.id === '2294:8111'" class="dental-native-overlay dental-editable-control" aria-label="其他说明" :style="controlStyle('2294:8111','2294:8113',form.notes)" :value="form.notes" :disabled="status === 'submitting' || submitted" @input="formChanged('notes', $event)" />
        <div v-if="node.id === '2294:8047' && feedback" class="dental-upload-feedback" :style="feedbackStyle" :role="status === 'error' ? 'alert' : 'status'" aria-live="polite">{{ feedback }} <button v-if="status === 'error' && files.length" type="button" @click="emit('submit')">重试提交</button></div>
      </template>
    </DentalSourceCanvas>
  </div>
</template>
<style scoped>
.dental-desktop-flow { width:100%; }
.dental-native-overlay { position:absolute; inset:0; width:100%; height:100%; margin:0; border:0; border-radius:inherit; padding:0; background:transparent; color:transparent; appearance:none; cursor:pointer; }
select.dental-native-overlay option { color:#1e3a5f; background:#fff; }
.dental-file-picker input { display:block; width:100%; height:100%; opacity:0; cursor:pointer; }
.dental-editable-control { position:absolute!important; width:100%!important; height:100%!important; margin:0; border:0; box-sizing:border-box; caret-color:#1e3a5f; cursor:text; resize:none; }
.dental-editable-control.is-empty { opacity:0; }
.dental-added-detail { position:absolute; left:0; width:100%; height:0; overflow:hidden; }
.dental-empty-results { width:100%; margin:0; padding-top:24px; color:#1e3a5f; }
.dental-upload-files { position:absolute; top:26px; left:164px; right:0; margin:0; padding:0; list-style:none; color:#1e3a5f!important; line-height:24px!important; }
.dental-upload-files li { max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dental-upload-feedback { position:absolute; left:261px; width:918px; text-align:center; margin:0; }
.dental-upload-feedback button { margin-left:8px; border:0; padding:0; font:inherit; color:inherit; text-decoration:underline; background:transparent; cursor:pointer; }
.dental-desktop-flow :deep(.dental-live-project), .dental-desktop-flow :deep([data-figma-node="2294:8336"]), .dental-desktop-flow :deep([data-figma-node="2294:8274"]) { transition:height 420ms cubic-bezier(.22,1,.36,1),top 420ms cubic-bezier(.22,1,.36,1),background-color 200ms ease,box-shadow 240ms ease; }
.dental-desktop-flow[data-dental-step="1"] :deep(.dental-source-canvas), .dental-desktop-flow[data-dental-step="1"] :deep(.dental-source-canvas__inner) { transition:height 420ms cubic-bezier(.22,1,.36,1); }
.dental-desktop-flow :deep(.dental-live-detail), .dental-live-detail { transition:height 420ms cubic-bezier(.22,1,.36,1),opacity 180ms ease; }
.dental-desktop-flow :deep(.dental-live-arrow) { transition:transform 420ms cubic-bezier(.22,1,.36,1); }
.dental-desktop-flow :deep(.dental-doctor-card__button) { transition:box-shadow 240ms ease,filter 180ms ease; }
.dental-desktop-flow :deep(.dental-doctor-card__button:hover) { filter:brightness(.985); box-shadow:0 4px 10px rgba(0,0,0,.10); }
.dental-desktop-flow :deep(button:not(.dental-live-project)), .dental-desktop-flow :deep(a) { transition:filter 180ms ease; }
.dental-desktop-flow :deep(button:not(.dental-live-project):hover), .dental-desktop-flow :deep(a:hover) { filter:brightness(.96); }
.dental-desktop-flow :deep(.dental-live-picker:focus-within) { outline:2px solid #2563eb; outline-offset:3px; }
.dental-desktop-flow :deep(button:disabled) { cursor:default; }
@media (prefers-reduced-motion:reduce) { .dental-desktop-flow :deep(*), .dental-live-detail { transition:none!important; animation:none!important; } }
</style>
