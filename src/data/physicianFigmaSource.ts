import source from '../../docs/figma-source/physicians/revision-2026-10-29/source-tree-2026-10-29.json'
import directory from './yaoyingPhysicians.json'
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
}

export const physicianRoot = source.root as SourceNode
export const physicianDescendants = (node: SourceNode): SourceNode[] => [node, ...node.children.flatMap(physicianDescendants)]
export const physicianNodes = new Map(physicianDescendants(physicianRoot).map(node => [node.id, node]))
export const physicianNode = (id: string) => physicianNodes.get(id)!
export const physicianRecords = (directory.records as PhysicianRecord[]).map(record => ({ ...record }))
export const physicianDepartments = directory.departments as string[]

const avatarByNameDepartment: Record<string, string> = {
  '周莉莉::血液内科': '/images/figma/physicians-revision/image-65b522a475e04b2b9c3f9d41fd3398f003f9c315.webp',
  '柳光宇::乳腺外科': '/images/figma/physicians-revision/image-2e1dc8b4dd3733f191842bf58d4b2ee702b1e140.webp',
  '陈疾忤::骨科': '/images/figma/physicians-revision/image-56f78245a05bde4bd8cc14881640b6f0a1bf9d29.webp',
}
for (const record of physicianRecords) record.avatar = avatarByNameDepartment[`${record.name}::${record.departmentSource}`]

// Keep the six authored controls, using real departments in the new directory.
const shortcutDepartments = ['', '口腔科', '骨科', '血液内科', '乳腺外科', '全科']
const shortcutLabels = ['全部', '牙科', '骨科', '血液内科', '乳腺外科', '全科']
export const physicianFilters = physicianNode('1689:4839').children.map((node, index) => ({
  id: node.id,
  text: shortcutLabels[index]!,
  department: shortcutDepartments[index]!,
}))

export const physicianActions: Record<string, HomeSourceAction> = {}
const link = (id: string, href: string) => { physicianActions[id] = { href } }
const action = (id: string, value: string, label?: string) => { physicianActions[id] = { action: value, label } }
for (const [id, href] of [
  ['1689:5319', '/'], ['1689:5394', '/'], ['1689:5406', '/'], ['1689:5408', '/why-china'], ['1689:5410', '/trust'],
  ['1689:5412', '/diseases-technologies'], ['1689:5414', '/dental'], ['1689:5418', '/cases'], ['1689:5420', '/insurance'], ['1689:5422', '/about'],
  ['1732:5717', '/hospitals'], ['1732:5719', '/doctors'], ['1689:5333', '/diseases-technologies'], ['1689:5335', '/cost'], ['1689:5337', '/report'],
  ['1689:5341', '/steps'], ['1689:5347', '/cases'], ['1689:5349', '/insurance'], ['1689:5351', '/steps'], ['1689:5353', '/about'],
  ['1689:5363', 'mailto:contact@huanyuyunyi.com'], ['1689:5368', 'tel:+864008886688'], ['1689:5373', 'https://wa.me/864008886688'],
] as const) link(id, href)
action('1689:5401', 'consultation', '问阿宁')
action('1689:5425', 'language', '选择语言')
action('1689:5416', 'hospital-menu', '中国医院')
physicianFilters.forEach((node, index) => action(node.id, `filter:${index}`, node.text))
physicianRecords.forEach(record => action(`physician-card:${record.id}`, `doctor:${record.id}`, `查看${record.name}（${record.departmentSource}）详情`))

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
