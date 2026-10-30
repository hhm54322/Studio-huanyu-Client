import type { HomeSourceAction, HomeSourceNodeData as SourceNode } from '@/components/common/HomeSourceNode.vue'
import { dentalDescendants, dentalDoctorCardAliases, dentalDoctorCardSource, dentalMatchingSource } from './dentalFigmaSource'
import { dentalPhysicianById, dentalPhysicianCases, type DentalPhysician } from './dentalPhysicianData'

/** Keep authored descriptive labels intact; append the source suffix only to bare year values. */
export function displayDentalExperience(value: string) {
  return /(经验|专家)\s*$/.test(value.trim()) ? value : `${value}经验`
}

export function replaceDentalText(node: SourceNode, text: string) {
  node.text = text
  delete node.textLines
  delete node.textRuns
  delete node.textParagraphs
}

function replaceDentalPrice(node: SourceNode, value: string) {
  const label = value.replace(/\s*起\s*$/, '')
  const match = label.match(/^(.*?)(\/.*)$/)
  const amount = match?.[1] || label
  const unit = match?.[2] || ''
  const amountCss = node.textRuns![0]!.css
  const unitCss = node.textRuns![1]!.css
  node.text = label
  node.textRuns = [{ text: amount, css: amountCss }, ...(unit ? [{ text: unit, css: unitCss }] : [])]
  node.textParagraphs = undefined
  if (node.textLines?.length) {
    node.textLines = node.textLines.map(line => ({ ...line, runs: [{ text: amount, css: amountCss }, ...(unit ? [{ text: unit, css: unitCss }] : [])] }))
  }
}

function resize(node: SourceNode, values: { width?: number; height?: number; x?: number; y?: number }) {
  Object.assign(node, values)
  const properties = { width: 'width', height: 'height', x: 'left', y: 'top' } as const
  for (const key of Object.keys(values) as (keyof typeof properties)[]) node.css += `;${properties[key]}:${values[key]}px;`
}

export function replaceDentalPortrait(node: SourceNode, portrait: string) {
  node.children = []
  node.svg = undefined
  node.x = 0
  node.visible = Boolean(portrait)
  node.css += `;left:0;transform:none;overflow:hidden;background:${portrait ? `url("${portrait}") center top / cover no-repeat` : 'none'};`
}

export function createDentalPhysicianMatching(ids: number[]) {
  const root = structuredClone(dentalMatchingSource)
  const nodes = new Map(dentalDescendants(root).map(node => [node.id, node]))
  const grid = nodes.get('2294:7060')!
  const template = grid.children[0]!
  const actions: Record<string, HomeSourceAction> = {}
  const attributes: Record<string, Record<string, string | number | boolean>> = {}
  const doctors = ids.map(dentalPhysicianById).filter((doctor): doctor is DentalPhysician => Boolean(doctor))
  const cards = doctors.map(doctor => {
    const card = structuredClone(template)
    const owners = new Map(dentalDescendants(card).map(node => [node.id, node]))
    const at = (id: string) => owners.get(id)!
    const text = (id: string, value: string) => replaceDentalText(at(id), value)
    // The preview and detail tab share the physician's actual case collection.
    // Figma illustrations and numeric case counts are not clinical case data.
    const preview = dentalPhysicianCases(doctor)[0]
    const hasCases = Boolean(preview)
    const previewPanel = at('2294:7088')
    const sourceGap = at('2294:7093').y - previewPanel.y - previewPanel.height
    const removedHeight = hasCases ? 0 : previewPanel.height + sourceGap
    const cardHeight = template.height - removedHeight
    resize(card, { height: cardHeight })
    previewPanel.visible = hasCases
    if (!hasCases) {
      resize(at('2294:7093'), { y: at('2294:7093').y - removedHeight })
      resize(at('2294:7098'), { y: at('2294:7098').y - removedHeight })
    }
    if (preview) text('2294:7089', preview.title)
    for (const [index, id] of ['2294:7091', '2294:7092'].entries()) {
      const image = preview?.images.filter(item => item.src.trim())[index]
      at(id).visible = Boolean(image)
      at(id).css += `;background-image:${image ? `url(${JSON.stringify(image.src)})` : 'none'};`
    }
    replaceDentalPortrait(at('2294:7063'), doctor.portrait)
    text('2294:7068', doctor.name)
    text('2294:7070', doctor.title)
    at('2294:7070').css += ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    text('2294:7075', `${doctor.city} · ${doctor.department}`)
    at('2294:7075').css += ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    text('2294:7079', displayDentalExperience(doctor.experience))
    resize(at('2294:7076'), { width: 173 })
    resize(at('2294:7079'), { width: 153 })
    // Keep the authored Figma rating/price composition. The supplied doctor
    // records do not contain a separate rating value, so the source card's
    // authored rating remains part of the reusable visual component while the
    // price itself comes from the document-backed record.
    at('2294:7082').visible = true
    replaceDentalPrice(at('2294:7085'), doctor.priceLabel)
    at('2294:7085').css += ';top:37px;width:65px;height:14px;line-height:14px;white-space:nowrap;'
    text('2294:7087', doctor.specialty)
    at('2294:7087').css += ';display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;white-space:normal;'
    text('2294:7097', '深圳牙科机构')
    const idFor = (source: string) => `${source}::dental-physician-${doctor.id}`
    for (const node of dentalDescendants(card)) {
      const sourceId = node.id.split('::')[0]!
      const id = idFor(node.id)
      attributes[id] = {
        'data-figma-source-node': dentalDoctorCardAliases[sourceId] || sourceId,
        ...(node.text ? { title: node.text } : {}),
      }
      node.id = id
    }
    attributes[card.id] = { ...attributes[card.id], 'data-doctor': doctor.id, 'data-figma-component': dentalDoctorCardSource.frame }
    attributes[idFor('2294:7085')] = { ...attributes[idFor('2294:7085')], title: `${doctor.priceDescription}；具体费用以书面报价为准` }
    attributes[idFor('2294:7093')] = { ...attributes[idFor('2294:7093')], title: doctor.hospital }
    actions[idFor('2294:7099')] = { action: `doctor:${doctor.id}`, label: `查看${doctor.name}医生详情` }
    if (hasCases) actions[idFor('2294:7088')] = { action: `doctor-cases:${doctor.id}`, label: `查看${doctor.name}案例集` }
    actions[idFor('2294:7101')] = { action: `quote:${doctor.id}`, label: `获取${doctor.name}医生免费报价` }
    actions[idFor('2294:7093')] = { action: `institution:${doctor.id}`, label: `查看${doctor.hospital}` }
    return { card, height: cardHeight }
  })
  const rowHeights = Array.from({ length: Math.ceil(cards.length / 3) }, (_, row) =>
    Math.max(...cards.slice(row * 3, (row + 1) * 3).map(item => item.height)))
  let rowTop = 0
  cards.forEach(({ card }, index) => {
    const row = Math.floor(index / 3)
    if (index % 3 === 0) rowTop = row === 0 ? 0 : rowTop + rowHeights[row - 1]! + 24
    resize(card, { x: index % 3 * (template.width + 24), y: rowTop })
  })
  grid.children = cards.map(item => item.card)
  const gridHeight = rowHeights.length ? rowHeights.reduce((total, height, index) => total + height + (index ? 24 : 0), 0) : template.height
  const delta = gridHeight - grid.height
  resize(grid, { height: gridHeight })
  for (const id of ['2294:6971', '2294:6972', '2294:6973', '2294:6981', '2294:7044']) resize(nodes.get(id)!, { height: nodes.get(id)!.height + delta })
  for (const id of ['2294:7209', '2294:7214']) resize(nodes.get(id)!, { y: nodes.get(id)!.y + delta })
  replaceDentalText(nodes.get('2294:7059')!, `共 ${doctors.length} 位医生`)
  // Preserve the immutable source tree; the document-backed repeated tree
  // alone owns the six records and their unique action/DOM identities.
  return { root, actions, attributes }
}

export function populateDentalPhysicianIdentity(panel: SourceNode, doctor: DentalPhysician) {
  const nodes = dentalDescendants(panel)
  const profile = nodes.find(node => node.name === 'Frame 651')
  if (!profile) return
  const portrait = profile.children.find(node => node.name.startsWith('Image ('))
  if (portrait) replaceDentalPortrait(portrait, doctor.portrait)
  const profileNodes = dentalDescendants(profile)
  const identity = profile.children.find(node => node.id !== portrait?.id)!
  const nameRow = identity.children[0]!
  resize(nameRow, { width: identity.width })
  const titleBox = nameRow.children[1]!
  resize(titleBox, { width: identity.width - titleBox.x })
  for (const node of profileNodes) {
    if (node.text === '谭兆林') replaceDentalText(node, doctor.name)
    else if (node.text === '院长 / 主治医生') { replaceDentalText(node, doctor.title); resize(node, { width: titleBox.width }) }
    else if (node.text.trim() === '上海 · 口腔专科') { replaceDentalText(node, `${doctor.city} · ${doctor.department}`); resize(node, { width: identity.width - node.x }) }
    else if (node.text === '20年经验') { replaceDentalText(node, displayDentalExperience(doctor.experience)); resize(node, { width: identity.width - node.x }) }
  }
  const labels = ['医生简介', '治疗流程', '案例集', `患者评价（${doctor.reviews.length}）`, '在华就诊保障服务（10）']
  for (const node of nodes) {
    if (node.text.startsWith('案例集（')) replaceDentalText(node, labels[2]!)
    else if (node.text.startsWith('患者评价（')) replaceDentalText(node, labels[3]!)
  }
}
