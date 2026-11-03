import { publicContacts } from './publicContacts'
import source from '../../docs/figma-source/physicians/revision-2026-10-29/source-tree-2026-10-29.json'
import directory from './yaoyingPhysicians.json'
import assignedAvatars from './physicianAvatars.json'
import type { HomeSourceNodeData as SourceNode, HomeSourceAction } from '@/components/common/HomeSourceNode.vue'

export type PhysicianRecord = {
  id: string
  sourceNumber: number
  name: string
  department: string
  departmentSource: string
  employmentType: string
  title: string
  label: string
  workplace: string
  specialty: string
  footerLabel: string
  basicInfo: string[]
  professionalExpertise: string[]
  career: string[]
  academic: string[]
  research: string[]
  crossBorderServices: string[]
  avatar?: string
  gender?: string
  sourceCardId?: string
  sourceExpert?: number
}

export const physicianRoot = source.root as SourceNode
export const physicianDescendants = (node: SourceNode): SourceNode[] => [node, ...node.children.flatMap(physicianDescendants)]
export const physicianNodes = new Map(physicianDescendants(physicianRoot).map(node => [node.id, node]))
export const physicianNode = (id: string) => physicianNodes.get(id)!
// Document revisions replace their own previous release list, while the
// original site's doctors remain. A name present in both uses the document.
const originalDoctors = [
  { card: '1741:5785', name: '谭兆林', department: '口腔科', expert: -1 },
  { card: '2324:8478', name: '徐宇', department: '骨软组织外科', expert: 0 },
  { card: '1741:5817', name: '周莉莉', department: '血液内科', expert: 1 },
  { card: '1741:5843', name: '柳光宇', department: '乳腺外科', expert: 2 },
  { card: '1741:5869', name: '陈疾忤', department: '运动医学科', expert: 3 },
]
const documentRecords = (directory.records as PhysicianRecord[]).map(record => ({ ...record }))
export const physicianRecords: PhysicianRecord[] = [
  ...originalDoctors.map(original => {
    const current = documentRecords.find(record => record.name === original.name)
    if (current) return current
    const texts = physicianDescendants(physicianNode(original.card)).filter(node => node.type === 'TEXT').map(node => node.text.trim())
    return {
      id: `figma-${original.card.replace(':', '-')}`, sourceNumber: 0,
      name: original.name, department: original.department, departmentSource: original.department,
      employmentType: '', title: texts[1]!, label: texts[2]!, workplace: texts[3]!, specialty: texts[4]!, footerLabel: '',
      basicInfo: [], professionalExpertise: [], career: [], academic: [], research: [], crossBorderServices: [],
      sourceCardId: original.card, sourceExpert: original.expert,
    }
  }),
  ...documentRecords.filter(record => !originalDoctors.some(original => original.name === record.name)),
]
export const physicianDepartments = [...new Set(physicianRecords.map(record => record.departmentSource))].sort()

const avatarByNameDepartment: Record<string, string> = {
  '周莉莉::血液内科': '/images/figma/physicians-revision/image-65b522a475e04b2b9c3f9d41fd3398f003f9c315.webp',
  '柳光宇::乳腺外科': '/images/figma/physicians-revision/image-2e1dc8b4dd3733f191842bf58d4b2ee702b1e140.webp',
  '陈疾忤::骨科': '/images/figma/physicians-revision/image-56f78245a05bde4bd8cc14881640b6f0a1bf9d29.webp',
}
const portraitAssignments = assignedAvatars as Record<string, { gender: string; avatar: string }>
for (const record of physicianRecords) {
  const assignment = portraitAssignments[record.id]
  record.avatar = avatarByNameDepartment[`${record.name}::${record.departmentSource}`] || record.avatar || assignment?.avatar
  if (assignment) record.gender = assignment.gender
}

// Preserve all six authored shortcut labels and their actual departments.
const shortcutDepartments = ['', '口腔科', '运动医学科', '血液内科', '骨软组织外科', '乳腺外科']
export const physicianFilters = physicianNode('1689:4839').children.map((node, index) => ({
  id: node.id,
  text: physicianDescendants(node).filter(item => item.type === 'TEXT').map(item => item.text).join(''),
  department: shortcutDepartments[index]!,
}))

export const physicianActions: Record<string, HomeSourceAction> = {}
const link = (id: string, href: string) => { physicianActions[id] = { href } }
const action = (id: string, value: string, label?: string, labelValues?:Record<string,string|number>) => { physicianActions[id] = { action: value, label, labelValues } }
for (const [id, href] of [
  ['1689:5319', '/'], ['1689:5394', '/'], ['1689:5406', '/'], ['1689:5408', '/why-china'], ['1689:5410', '/trust'],
  ['1689:5412', '/diseases-technologies'], ['1689:5414', '/dental'], ['1689:5418', '/cases'], ['1689:5420', '/insurance'], ['1689:5422', '/about'],
  ['1732:5717', '/hospitals'], ['1732:5719', '/doctors'], ['1689:5333', '/diseases-technologies'], ['1689:5335', '/cost'], ['1689:5337', '/report'],
  ['1689:5341', '/steps'], ['1689:5347', '/cases'], ['1689:5349', '/insurance'], ['1689:5351', '/steps'], ['1689:5353', '/about'],
  ['1689:5363', publicContacts.emailHref], ['1689:5368', 'tel:+864008886688'], ['1689:5373', publicContacts.whatsappHref],
] as const) link(id, href)
action('1689:5401', 'consultation', '问阿宁')
action('1689:5425', 'language', '选择语言')
action('1689:5416', 'hospital-menu', '中国医院')
physicianFilters.forEach((node, index) => action(node.id, `filter:${index}`, node.text))
physicianRecords.forEach(record => action(`physician-card:${record.id}`, `doctor:${record.id}`, '查看{name}（{department}）详情', {name:record.name,department:record.departmentSource}))

function replaceText(node: SourceNode, text: string, css = '') {
  node.text = text
  delete node.textRuns
  delete node.textParagraphs
  delete node.textLines
  node.css += `;${css}`
  node.layoutCss = `${node.layoutCss || ''};${css}`
}

function cloneCard(template: SourceNode, record: PhysicianRecord): SourceNode {
  const suffix = `--${record.id}`
  if (record.sourceCardId) {
    const card = structuredClone(physicianNode(record.sourceCardId))
    for (const item of physicianDescendants(card)) item.id += suffix
    card.id = `physician-card:${record.id}`
    return card
  }
  const textValues: Record<string, string> = {
    '1741:5822': record.name,
    '1741:5823': record.title,
    '1741:5831': record.label,
    '1741:5840': record.workplace,
    '1741:5842': record.specialty,
  }
  const copy = (node: SourceNode): SourceNode => {
    const result: SourceNode = { ...node, id: `${node.id}${suffix}`, children: node.children.map(copy) }
    if (node.type === 'TEXT') {
      replaceText(result, textValues[node.id] ?? '', node.id === '1741:5842'
        ? 'white-space:pre-wrap;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;'
        : 'width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;')
    }
    if (node.id === '1741:5821') {
      const left = record.avatar ? 72 : 0
      result.css += `;left:${left}px;width:${template.width - 48 - left}px;`
    }
    if (node.id === '1741:5830' || node.id === '1741:5839') result.css += ';width:calc(100% - 22px);'
    if (node.id === '1741:5819') {
      result.visible = Boolean(record.avatar)
      result.css += ';background:transparent;'
    }
    if (node.id === '1741:5820' && record.avatar) {
      result.css += `;background:url(${record.avatar}) center / cover no-repeat;`
    }
    return result
  }
  const card = copy(template)
  card.id = `physician-card:${record.id}`
  card.name = `医生卡片 ${record.name}`
  card.css += ';content-visibility:auto;contain-intrinsic-size:389.33334px 284px;'
  return card
}

function matchesPreset(record: PhysicianRecord, index: number) {
  const department = physicianFilters[index]?.department
  return !department || record.departmentSource === department
}

export function filteredPhysicianRecords(filter: number, department = '') {
  return physicianRecords.filter(record => {
    if (department && record.departmentSource !== department) return false
    return matchesPreset(record, filter)
  })
}

export function filteredPhysicianSource(filter: number, department = ''): SourceNode {
  const records = filteredPhysicianRecords(filter, department)
  const grid = physicianNode('1741:5784')
  const template = physicianNode('1741:5817')
  const columns = 3
  const gap = 24
  const padding = 48
  const rows = Math.max(1, Math.ceil(records.length / columns))
  const gridHeight = padding + rows * template.height + Math.max(0, rows - 1) * gap
  const offset = gridHeight - grid.height
  const cardNodes = records.map((record, index) => {
    const card = cloneCard(template, record)
    const x = (index % columns) * (template.width + gap)
    const y = padding + Math.floor(index / columns) * (template.height + gap)
    card.x = x
    card.y = y
    card.css += `;left:${x}px;top:${y}px;`
    card.layoutCss = `${card.layoutCss || ''};left:${x}px;top:${y}px;`
    return card
  })
  const visit = (node: SourceNode): SourceNode => {
    const result = { ...node, children: node.children.map(visit) }
    const shortcutIndex = physicianFilters.findIndex(item => item.id === node.id)
    if (shortcutIndex >= 0) {
      const text = physicianDescendants(result).find(item => item.type === 'TEXT')!
      replaceText(text, physicianFilters[shortcutIndex]!.text, 'width:100%;text-align:center;')
      result.children[0]!.css += ';left:0;top:12px;width:100%;height:18px;'
    }
    if (['1689:4814', '1689:4815', '1689:4816', '1689:4838'].includes(node.id)) {
      result.height += offset
      result.css += `;height:${result.height}px;`
      result.layoutCss = `${result.layoutCss || ''};height:${result.height}px;`
    }
    if (node.id === '1689:5315') {
      result.y += offset
      result.css += `;top:${result.y}px;`
      result.layoutCss = `${result.layoutCss || ''};top:${result.y}px;`
    }
    if (node.id === grid.id) {
      result.height = gridHeight
      result.children = cardNodes
      result.css += `;height:${gridHeight}px;`
      result.layoutCss = `${result.layoutCss || ''};height:${gridHeight}px;`
    }
    return result
  }
  return visit(physicianRoot)
}
