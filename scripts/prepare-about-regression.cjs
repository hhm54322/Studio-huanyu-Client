// Build the separately authored complex-cases source before touching Vue.
// Geometry comes only from native Figma; typography/paint CSS is copied from
// each settled Inspect selection. The PNG is used by QA, never by this builder.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const sharp = require('sharp')
const UZIP = require('/tmp/huanyu-figma-parser.YmPg7Z/node_modules/uzip')
const root = path.resolve(__dirname, '..')
const date = '2026-10-22'
const input = path.join(root, 'artifacts/figma-regression-2026-10-22/about/complex')
const output = path.join(root, 'docs/figma-source/about/complex-revision')
const assetDirectory = path.join(root, 'public/images/figma/about-revision')
const read = name => JSON.parse(fs.readFileSync(path.join(input, `${name}-${date}.json`)))
const save = (name, data) => fs.writeFileSync(path.join(output, `${name}-${date}.json`), JSON.stringify(data, null, 2) + '\n')
const hash = value => createHash('sha256').update(value).digest('hex')
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const inventory = read('native-inventory'), parameters = read('native-parameters'), dev = read('dev-mode'), layers = read('ui-layers'), paints = read('native-image-paints')
const native = new Map(inventory.nodes.map(n => [n.id, n]))
const values = new Map(parameters.nodes.map(n => [n.nodeId, n.parameters]))
const copied = new Map(dev.nodes.map(n => [n.nodeId, n]))
const rows = layers.nodes.filter(n => native.has(n.nodeId))
const siblings = new Map()
for (const [index, n] of inventory.nodes.entries()) {
  const ui = rows[index]
  assert.ok(ui && ui.nodeId === n.id && ui.name === n.name && ui.parentNodeId === n.parentNodeId && ui.level === n.level, `Layers mismatch: ${n.id}`)
  ui.id = n.id
  ui.siblingOrder = siblings.get(n.parentNodeId) || 0
  siblings.set(n.parentNodeId, ui.siblingOrder + 1)
  assert.equal(ui.siblingOrder, n.siblingOrder)
  assert.ok(copied.has(n.id))
  if (n.rendered) assert.ok(copied.get(n.id).settleWaitMs === 250 && copied.get(n.id).code.length, `Unsettled Dev Mode copy: ${n.id}`)
}
const archiveBytes = fs.readFileSync(inventory.sourceFile)
assert.equal(hash(archiveBytes), inventory.sourceSHA256)
const archive = UZIP.parse(archiveBytes.buffer.slice(archiveBytes.byteOffset, archiveBytes.byteOffset + archiveBytes.byteLength))
fs.mkdirSync(output, { recursive: true }); fs.mkdirSync(assetDirectory, { recursive: true })
for (const name of ['native-inventory', 'native-parameters', 'native-image-paints', 'dev-mode', 'ui-layers']) {
  const data = read(name)
  if (name.startsWith('native-')) { data.layersCrossCheck = true; data.source = 'Official native Figma cross-checked against the complete live Layers tree' }
  save(name, data)
}
save('layers', { sourceFrame: inventory.sourceFrame, nodes: rows })
const assets = [], assetById = new Map(), svgOwners = new Map()
const walk = id => [id, ...native.get(id).children.flatMap(walk)]
const cardSelectors = { '484:2523': '.complex-card:nth-child(1)', '484:2557': '.complex-card:nth-child(2)', '484:2547': '.complex-card:nth-child(3)', '484:2537': '.complex-card:nth-child(4)' }
function selectorFor(n) {
  if (!n.rendered) return null
  for (let current = n; current; current = native.get(current.parentNodeId)) {
    const card = cardSelectors[current.id]
    if (!card) continue
    if (svgOwners.has(n.id)) return `${card} ${svgOwners.get(n.id) === '484:2534' ? '.complex-card__read img' : '.about-card-icon'}`
    if (n.type === 'TEXT') return `${card} ${n.id === '484:2533' ? '.complex-card__read' : /^(484:2528|484:2544|484:2554|484:2565)$/.test(n.id) ? 'h3' : 'p'}`
    if (n.id === '484:2531' || n.id === '484:2532') return `${card} .complex-card__read`
    if (n.id === current.id) return card
    return `${card} .about-card-body`
  }
  return { '484:2501': '.about-complex', '484:2502': '.about-complex .about-content', '484:2503': '.about-complex .about-section-heading', '484:2504': '#complex-title', '484:2505': '#complex-title', '484:2506': '.about-complex .about-section-heading p', '484:2507': '.about-complex .about-section-heading p', '484:2521': '.complex-grid', '484:2522': '.complex-grid' }[n.id]
}
function resolveVariables(css) {
  const match = /var\(--[\w-]+\s*,\s*/g
  let hit
  while ((hit = match.exec(css))) {
    let depth = 1, end = match.lastIndex
    for (; end < css.length && depth; end++) { if (css[end] === '(') depth++; if (css[end] === ')') depth-- }
    assert.equal(depth, 0)
    css = css.slice(0, hit.index) + resolveVariables(css.slice(match.lastIndex, end - 1)) + css.slice(end)
    match.lastIndex = hit.index
  }
  return css
}
async function main() {
  for (const n of inventory.nodes) {
    if (!n.rendered || svgOwners.has(n.id)) continue
    const svg = copied.get(n.id).code.find(c => c.trim().startsWith('<svg'))
    if (!svg) continue
    assert.ok(svg.trim().endsWith('</svg>') && !svg.includes('[Truncated]'))
    const file = `node-${n.id.replace(':', '-')}.svg`
    fs.writeFileSync(path.join(assetDirectory, file), svg + '\n')
    const asset = { nodeId: n.id, projectPath: `public/images/figma/about-revision/${file}`, sha256: hash(fs.readFileSync(path.join(assetDirectory, file))), source: 'Exact settled Figma Dev Mode SVG' }
    assets.push(asset); assetById.set(n.id, asset)
    walk(n.id).forEach(id => svgOwners.set(id, n.id))
  }
  for (const paint of paints.assets.filter(a => a.rendered)) {
    const bytes = Buffer.from(archive[`images/${paint.imageHash}`])
    assert.equal(hash(bytes), paint.sha256)
    const file = `image-${paint.nodeId.replace(':', '-')}-alpha.webp`
    const { data, info } = await sharp(bytes).resize({ width: 1192, withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * paint.paint.opacity)
    await sharp(data, { raw: info }).webp({ quality: 82, alphaQuality: 100, effort: 5 }).toFile(path.join(assetDirectory, file))
    const asset = { nodeId: paint.nodeId, projectPath: `public/images/figma/about-revision/${file}`, sha256: hash(fs.readFileSync(path.join(assetDirectory, file))), imageHash: paint.imageHash, nativeSHA256: paint.sha256, nativeImageOpacity: paint.paint.opacity, widthCap: 1192, quality: 82, source: 'Exact native image; 15% image alpha only; Dev CSS cover crop and separate gradient retained' }
    assets.push(asset); assetById.set(paint.nodeId, asset)
  }
  const mapping = inventory.nodes.map(n => ({ nodeId: n.id, name: n.name, parentNodeId: n.parentNodeId, siblingOrder: n.siblingOrder, rendered: n.rendered, component: n.rendered ? 'src/views/patient/AboutView.vue' : null, selector: selectorFor(n), devModeNodeId: n.id, parametersNodeId: n.id, ...(n.rendered ? {} : { reason: 'Authored hidden branch omitted, not an implementation gap' }) }))
  assert.ok(mapping.every(n => !n.rendered || n.selector), 'Every visible source node must have a concrete owner')
  function build(id, top = false) {
    const n = native.get(id), p = values.get(id), d = copied.get(id), asset = assetById.get(id)
    let css = resolveVariables(d.code.filter(code => !code.trim().startsWith('<svg')).join('\n'))
    if (asset?.imageHash) css = css.replace('url(<path-to-image>) lightgray', `url(/${asset.projectPath.replace(/^public\//, '')})`)
    css += `;position:${top ? 'relative' : 'absolute'};left:${top ? 0 : p.transform?.m02 || 0}px;top:${top ? 0 : p.transform?.m12 || 0}px;width:${p.size.x}px;height:${p.size.y}px;box-sizing:border-box;padding:0;margin:0;display:${n.rendered ? 'block' : 'none'};`
    if (p.type === 'TEXT') css += 'white-space:pre-wrap;font-synthesis:none;'
    if (p.clipsContent) css += 'overflow:hidden;'
    const svg = asset && !asset.imageHash ? `/${asset.projectPath.replace(/^public\//, '')}` : null
    return { id, css, svg, text: p.textData?.characters || '', children: svgOwners.has(id) ? [] : n.children.map(child => build(child)) }
  }
  const tree = build(inventory.sourceFrame, true)
  const render = n => `<div data-figma-node="${n.id}" style="${esc(n.css)}">${n.svg ? `<img src="${n.svg}" alt="" style="display:block;width:100%;height:100%">` : esc(n.text)}${n.children.map(render).join('')}</div>`
  const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>html,body{margin:0}body{font-family:'PingFang SC',sans-serif;-webkit-font-smoothing:antialiased;text-spacing-trim:space-all}*{box-sizing:border-box}</style>${render(tree)}</html>\n`
  fs.writeFileSync(path.join(output, `baseline-${date}.html`), html)
  fs.writeFileSync(path.join(output, `dev-styles-${date}.css`), dev.nodes.map(n => `/* ${n.nodeId}: ${n.name} */\n${n.code.filter(c => !c.startsWith('<svg')).join('\n')}`).join('\n\n') + '\n')
  save('node-to-code', { sourceFrame: inventory.sourceFrame, nodes: mapping })
  save('source-tree', { sourceFrame: inventory.sourceFrame, root: tree })
  save('assets', { assets })
  const files = fs.readdirSync(output).filter(f => !f.startsWith('baseline-lock-')).map(f => path.join(output, f)).concat(assets.map(a => path.join(root, a.projectPath)))
  save('baseline-lock', { sourceFrame: inventory.sourceFrame, lockedAt: new Date().toISOString(), phase: 'Full source, settled Dev CSS, exact assets and mapping before Vue correction; not visual acceptance', files: files.map(file => ({ name: path.relative(root, file), sha256: hash(fs.readFileSync(file)) })) })
  console.log(JSON.stringify({ sourceFrame: inventory.sourceFrame, nodes: inventory.nodeCount, assets: assets.length, output }))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
