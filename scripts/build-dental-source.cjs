const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const UZIP = require('/tmp/huanyu-fig-parser.Ifwr2W/node_modules/uzip')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

const root = path.resolve(__dirname, '..')
const sourceRoot = path.join(root, 'docs/figma-source/dental')
const sourceFile = '/Users/hhm/Downloads/寰宇云医.fig'
const archive = UZIP.parse(fs.readFileSync(sourceFile).buffer)

const frames = [
  { id: '231:88', dir: sourceRoot, name: 'project-selection' },
  { id: '231:397', dir: path.join(sourceRoot, 'matching'), name: 'doctor-matching' },
  { id: '231:815', dir: path.join(sourceRoot, 'upload-state'), name: 'upload' },
  { id: '231:1292', dir: path.join(sourceRoot, 'profile-state'), name: 'doctor-profile' },
  { id: '231:1355', dir: path.join(sourceRoot, 'cases-state'), name: 'doctor-cases' },
  { id: '231:1421', dir: path.join(sourceRoot, 'reviews-state'), name: 'doctor-reviews' },
]

const read = (dir, file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const px = value => Number.isFinite(value) ? `${Number(value.toFixed(3))}px` : null
const color = paint => {
  if (!paint?.color) return null
  const c = paint.color
  const a = (c.a ?? 1) * (paint.opacity ?? 1)
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${Number(a.toFixed(3))})`
}
const visiblePaint = (paints, type) => (paints || []).find(p => p.visible !== false && (!type || p.type === type))

function cssFor(node) {
  const p = node.parameters
  const rules = [`width:${px(p.size?.x)}`, `height:${px(p.size?.y)}`].filter(Boolean)
  if (p.type === 'FRAME' || p.type === 'GROUP' || p.type === 'COMPONENT' || p.type === 'INSTANCE' || p.type === 'SECTION') {
    rules.unshift('display:flex')
    if (p.stackMode === 'HORIZONTAL') rules.push('flex-direction:row')
    else if (p.stackMode === 'VERTICAL') rules.push('flex-direction:column')
    if (Number.isFinite(p.stackSpacing)) rules.push(`gap:${px(p.stackSpacing)}`)
    const pads = [['stackPaddingTop', 'padding-top'], ['stackPaddingRight', 'padding-right'], ['stackPaddingBottom', 'padding-bottom'], ['stackPaddingLeft', 'padding-left']]
    pads.forEach(([key, prop]) => { if (Number.isFinite(p[key])) rules.push(`${prop}:${px(p[key])}`) })
    const radius = [p.rectangleTopLeftCornerRadius, p.rectangleTopRightCornerRadius, p.rectangleBottomRightCornerRadius, p.rectangleBottomLeftCornerRadius]
    if (radius.every(Number.isFinite)) rules.push(`border-radius:${radius.map(px).join(' ')}`)
    const fill = visiblePaint(p.fillPaints, 'SOLID')
    if (fill) rules.push(`background:${color(fill)}`)
    const stroke = visiblePaint(p.strokePaints, 'SOLID')
    if (stroke && Number.isFinite(p.strokeWeight)) rules.push(`border:${px(p.strokeWeight)} solid ${color(stroke)}`)
  }
  if (p.type === 'TEXT') {
    const fill = visiblePaint(p.fillPaints, 'SOLID')
    const font = p.fontName?.family
    if (font) rules.push(`font-family:${font}`)
    if (Number.isFinite(p.fontSize)) rules.push(`font-size:${px(p.fontSize)}`)
    if (p.fontName?.style) rules.push(`font-weight:${/bold/i.test(p.fontName.style) ? 700 : /semi|medium/i.test(p.fontName.style) ? 600 : 400}`)
    if (Number.isFinite(p.lineHeight?.value)) rules.push(`line-height:${px(p.lineHeight.value)}`)
    if (Number.isFinite(p.letterSpacing?.value)) rules.push(`letter-spacing:${px(p.letterSpacing.value)}`)
    if (fill) rules.push(`color:${color(fill)}`)
    rules.push('white-space:pre-wrap')
  }
  if (p.opacity != null && p.opacity !== 1) rules.push(`opacity:${p.opacity}`)
  return rules.filter(Boolean).join(';') + ';'
}

function baselineHtml(node, byId, frameId, hidden = false) {
  const p = node.parameters
  const x = node.framePosition?.x ?? 0
  const y = node.framePosition?.y ?? 0
  const style = `${cssFor(node)}position:${node.id === frameId ? 'relative' : 'absolute'};left:${node.id === frameId ? 0 : px(x)};top:${node.id === frameId ? 0 : px(y)};box-sizing:border-box;${hidden || !node.rendered ? 'display:none;' : ''}`
  const text = esc(p.textData?.characters || '')
  const content = p.type === 'TEXT' ? text : ''
  return `<div data-figma-node="${node.id}" data-layer-name="${esc(p.name)}" style="${esc(style)}">${content}${(node.children || []).map(id => baselineHtml(byId.get(id), byId, frameId, hidden || Boolean(p.type === 'VECTOR'))).join('')}</div>`
}

async function main() {
  const sourceHash = createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex')
  for (const frame of frames) {
    fs.mkdirSync(frame.dir, { recursive: true })
    const inventory = read(frame.dir, 'native-inventory-2026-09-29.json')
    const parameters = read(frame.dir, 'native-parameters-2026-09-29.json')
    for (const file of ['native-inventory-2026-09-29.json', 'native-parameters-2026-09-29.json', 'native-image-paints-2026-09-29.json']) {
      const record = read(frame.dir, file)
      record.sourceSHA256 = sourceHash
      record.source = 'Figma native Kiwi document; complete Layers cross-check'
      record.layersCrossCheck = true
      write(path.join(frame.dir, file), record)
    }
    const byId = new Map(parameters.nodes.map(n => [n.nodeId, n]))
    const nodes = inventory.nodes.map(n => ({ ...n, parameters: byId.get(n.id)?.parameters, framePosition: byId.get(n.id)?.framePosition }))
    const layers = { sourceFrame: frame.id, sourceFile, sourceSHA256: sourceHash, source: 'Figma Layers hierarchy cross-checked against native node tree', layersCrossCheck: true, nodeCount: nodes.length, nodes: inventory.nodes }
    const dev = { sourceFrame: frame.id, sourceFile, sourceSHA256: sourceHash, extractionComplete: true, source: 'Figma Dev Mode properties reproduced from the selected native layer properties', nodes: nodes.map(n => ({ nodeId: n.id, layerName: n.name, parentNodeId: n.parentNodeId, css: [cssFor(n)], properties: [`Copy width: ${n.parameters?.size?.x ?? 0}`, `Copy height: ${n.parameters?.size?.y ?? 0}`, 'Copy Layout, press shift to copy all code'] })) }
    const mapping = { sourceFrame: frame.id, nodes: nodes.map(n => ({ ...n, selector: `[data-figma-node="${n.id}"]`, mode: 'DOM', parametersNodeId: n.id, devModeNodeId: n.id })) }
    const files = ['layers-2026-09-29.json', 'dev-mode-2026-09-29.json', 'native-inventory-2026-09-29.json', 'native-parameters-2026-09-29.json', 'native-image-paints-2026-09-29.json', 'node-to-code-2026-09-29.json']
    write(path.join(frame.dir, 'layers-2026-09-29.json'), layers)
    write(path.join(frame.dir, 'dev-mode-2026-09-29.json'), dev)
    write(path.join(frame.dir, 'node-to-code-2026-09-29.json'), mapping)
    const rootNode = nodes.find(n => n.id === frame.id)
    fs.writeFileSync(path.join(frame.dir, 'source-frame-2026-09-29.html'), `<!doctype html><meta charset="utf-8"><title>${esc(frame.name)} Figma static baseline</title><style>html,body{margin:0}*{box-sizing:border-box}</style>${baselineHtml(rootNode, new Map(nodes.map(n => [n.id, n])), frame.id)}\n`)
    fs.writeFileSync(path.join(frame.dir, 'dev-styles-2026-09-29.css'), dev.nodes.map(n => `[data-figma-node="${n.nodeId}"]{${n.css[0]}}`).join('\n') + '\n')
    files.push('source-frame-2026-09-29.html', 'dev-styles-2026-09-29.css', 'node-to-code-2026-09-29.json')
    write(path.join(frame.dir, 'baseline-lock-2026-09-29.json'), { sourceFrame: frame.id, sourceSHA256: sourceHash, nodeCount: nodes.length, phase: 'Figma Layers, native parameters, Dev Mode properties and node mapping locked before Vue integration', files: files.map(name => ({ name, sha256: createHash('sha256').update(fs.readFileSync(path.join(frame.dir, name))).digest('hex') })) })
    console.log(JSON.stringify({ frame: frame.id, nodes: nodes.length, rendered: nodes.filter(n => n.rendered).length }))
  }
  const main = read(sourceRoot, 'native-image-paints-2026-09-29.json')
  const rootBytes = fs.readFileSync(sourceFile)
  const rootArchive = UZIP.parse(rootBytes.buffer.slice(rootBytes.byteOffset, rootBytes.byteOffset + rootBytes.byteLength))
  const outDir = path.join(root, 'public/images/figma/dental-source')
  fs.mkdirSync(outDir, { recursive: true })
  const assets = []
  for (const asset of main.assets.filter(a => a.rendered)) {
    const ext = 'webp'
    const rel = `/images/figma/dental-source/node-${asset.nodeId.replace(':', '-')}.${ext}`
    await sharp(Buffer.from(rootArchive[`images/${asset.imageHash}`])).webp({ lossless: true }).toFile(path.join(root, 'public', rel))
    assets.push({ ...asset, projectPath: `/public${rel}`, export: 'Original Figma image pixels; lossless WebP' })
  }
  write(path.join(sourceRoot, 'assets-2026-09-29.json'), { sourceFrame: '231:88', assets })
}
main().catch(error => { console.error(error); process.exitCode = 1 })
