const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const UZIP = require('/tmp/huanyu-fig-parser.Ifwr2W/node_modules/uzip')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')
const root = path.resolve(__dirname, '..')
const dir = path.join(root, 'docs/figma-source/diseases')
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name)))
const inventory = read('native-inventory-2026-09-29.json')
const parameters = read('native-parameters-2026-09-29.json')
const dev = read('dev-mode-2026-09-29.json')
const paints = read('native-image-paints-2026-09-29.json')
if (!inventory.layersCrossCheck || !dev.extractionComplete) throw new Error('Source extraction not complete')
const nodes = new Map(inventory.nodes.map(n => [n.id, n]))
const values = new Map(parameters.nodes.map(n => [n.nodeId, n]))
const copies = new Map(dev.nodes.map(n => [n.nodeId, n]))
const p = id => values.get(id).parameters
const children = id => nodes.get(id).children.map(id => nodes.get(id))
const descendants = id => [nodes.get(id), ...children(id).flatMap(n => descendants(n.id))]
const text = id => p(id).textData?.characters || ''
const save = (name, value) => fs.writeFileSync(path.join(dir, name), JSON.stringify(value, null, 2) + '\n')
const targets = new Map(), assets = [], images = new Map(), vectors = new Map()
const bind = (id, selector, mode = 'DOM', ownerNodeId = id) => targets.set(id, { selector, mode, ownerNodeId })
const selector = id => `[data-figma-node="${id}"]`
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const bytes = fs.readFileSync(inventory.sourceFile)
if (createHash('sha256').update(bytes).digest('hex') !== inventory.sourceSHA256) throw new Error('Native source changed')
const archive = UZIP.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
const assetPath = (id, ext) => `/images/figma/disease-source/node-${id.replace(':', '-')}.${ext}`
function shell(sourceId, hospitalId, hospitalMap) {
  const target = hospitalMap.get(hospitalId), source = nodes.get(sourceId)
  if (!target || source.type !== target.type || source.children.length !== target.children.length) throw new Error(`Shell structure mismatch ${sourceId}`)
  bind(sourceId, target.selector, target.mode)
  source.children.forEach((id, i) => shell(id, target.children[i], hospitalMap))
}
async function main() {
  fs.mkdirSync(path.join(root, 'public/images/figma/disease-source'), { recursive: true })
  for (const node of inventory.nodes) {
    if (!copies.get(node.id)?.css.length) throw new Error(`Missing Inspect read ${node.id}`)
    const svg = copies.get(node.id).css.find(code => code.startsWith('<svg'))
    if (svg && node.rendered) {
      const src = assetPath(node.id, 'svg')
      fs.writeFileSync(path.join(root, 'public', src), svg + '\n')
      vectors.set(node.id, src)
      assets.push({ nodeId: node.id, name: node.name, projectPath: `/public${src}`, export: 'Exact selected Dev Mode SVG' })
    }
  }
  for (const image of paints.assets.filter(n => n.rendered)) {
    const src = assetPath(image.nodeId, 'webp')
    await sharp(Buffer.from(archive[`images/${image.imageHash}`])).webp({ lossless: true }).toFile(path.join(root, 'public', src))
    images.set(image.nodeId, { src, paint: image.paint })
    assets.push({ ...image, projectPath: `/public${src}`, export: 'Original Figma image pixels; lossless WebP; selected crop preserved' })
  }
  for (const node of inventory.nodes.filter(n => n.index < 206)) bind(node.id, selector(node.id))
  bind('144:4380', '.patient-shell')
  bind('144:4381', '.patient-shell')
  for (const id of ['144:4398', '144:4579', '144:4583', ...children('144:4403').filter(n => n.rendered).map(n => children(n.id)[0].id)]) {
    descendants(id).forEach(n => bind(n.id, selector(id), n.id === id ? 'Exact Figma SVG asset' : `SVG descendant retained in exact owner asset ${id}`, id))
  }
  const cards = children('144:4403').filter(n => n.rendered).map(n => {
    const [icon, body] = children(n.id), [heading, rows] = children(body.id)
    const [hospital, cases, feature] = children(rows.id)
    return { nodeId: n.id, iconNodeId: icon.id, icon: vectors.get(icon.id), bodyNodeId: body.id, headingNodeId: heading.id, titleNodeId: children(heading.id)[0].id, rowsNodeId: rows.id, hospitalNodeId: hospital.id, casesNodeId: cases.id, featureNodeId: feature.id, name: text(children(heading.id)[0].id), hospitals: text(hospital.id).replace('合作医院：', ''), cases: text(cases.id), feature: text(feature.id), path: text(children(heading.id)[0].id) === '牙科' ? '/dental' : null }
  })
  const hospitalMap = new Map(JSON.parse(fs.readFileSync(path.join(root, 'docs/figma-source/hospitals/node-to-code-2026-09-29.json'))).nodes.map(n => [n.id, n]))
  shell('144:4586', '144:5154', hospitalMap)
  shell('484:1506', '484:1549', hospitalMap)
  const mapping = inventory.nodes.map(node => {
    if (!targets.has(node.id)) throw new Error(`Unmapped ${node.id}`)
    return { ...node, ...targets.get(node.id), parametersNodeId: node.id, devModeNodeId: node.id, framePosition: values.get(node.id).framePosition }
  })
  function html(node, suppressed = false) {
    const value = p(node.id), svg = vectors.get(node.id)
    const copiedCSS = copies.get(node.id).css.filter(s => !s.startsWith('<svg'))
    let css = value.textData?.styleOverrideTable?.length ? copiedCSS[0] : copiedCSS.join('')
    if (images.has(node.id)) css = css.replaceAll('<path-to-image>', images.get(node.id).src)
    css += `;position:${node.id === inventory.sourceFrame ? 'relative' : 'absolute'};left:${node.id === inventory.sourceFrame ? 0 : value.transform.m02}px;top:${node.id === inventory.sourceFrame ? 0 : value.transform.m12}px;width:${value.size.x}px;height:${value.size.y}px;box-sizing:border-box;`
    if (!node.rendered || suppressed) css += 'display:none;'
    if (value.type === 'TEXT') css += `white-space:${value.size.y > (value.lineHeight?.value || value.fontSize) * 1.5 ? 'pre-wrap' : 'pre'};`
    if (value.frameMaskDisabled === false) css += 'overflow:hidden;'
    const content = svg ? `<img src="${svg}" alt="" style="position:absolute;inset:0;width:100%;height:100%">` : value.textData?.styleOverrideTable?.length && text(node.id).startsWith('合作医院：') ? `合作医院：<span style="${escape(copiedCSS[1])}">${escape(text(node.id).slice(5))}</span>` : escape(text(node.id))
    return `<div data-figma-node="${node.id}" style="${escape(css)}">${content}${children(node.id).map(n => html(n, suppressed || Boolean(svg))).join('')}</div>`
  }
  const style = node => (p(node.id).textData?.styleOverrideTable?.length ? copies.get(node.id).css[0] : copies.get(node.id).css.filter(s => !s.startsWith('<svg')).join(''))
    .replaceAll('<path-to-image>', images.get(node.id)?.src || '')
  save('assets.json', { sourceFrame: inventory.sourceFrame, assets })
  save('node-to-code-2026-09-29.json', { sourceFrame: inventory.sourceFrame, nodes: mapping })
  save('content-2026-09-29.json', { hero: images.get('144:4383'), cards, hiddenHtml: inventory.nodes.filter(n => !n.visible).map(n => html(n)).join('') })
  fs.writeFileSync(path.join(dir, 'source-frame-2026-09-29.html'), `<!doctype html><meta charset="utf-8"><title>144:4380 static source</title><base href="http://127.0.0.1:5173/"><style>html,body{margin:0}*{box-sizing:border-box}</style>${html(nodes.get(inventory.sourceFrame))}\n`)
  fs.writeFileSync(path.join(dir, 'dev-styles-2026-09-29.css'), inventory.nodes.filter(n => n.index < 206 && n.rendered && targets.get(n.id).ownerNodeId === n.id).map(n => `.disease-page ${selector(n.id)} { ${style(n)} }`).join('\n\n') + '\n')
  const files = ['layers-2026-09-29.json', 'dev-mode-2026-09-29.json', 'native-inventory-2026-09-29.json', 'native-parameters-2026-09-29.json', 'native-image-paints-2026-09-29.json', 'node-to-code-2026-09-29.json', 'content-2026-09-29.json', 'source-frame-2026-09-29.html', 'dev-styles-2026-09-29.css', 'assets.json']
  save('baseline-lock-2026-09-29.json', { sourceFrame: inventory.sourceFrame, sourceSHA256: inventory.sourceSHA256, nodeCount: mapping.length, lockedAt: new Date().toISOString(), phase: 'Full Layers, exact Dev Mode parameters, mapping and static baseline locked before Vue changes', files: files.map(name => ({ name, sha256: createHash('sha256').update(fs.readFileSync(path.join(dir, name))).digest('hex') })) })
  console.log(JSON.stringify({ nodes: mapping.length, rendered: mapping.filter(n => n.rendered).length, assets: assets.length, cards: cards.length }))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
