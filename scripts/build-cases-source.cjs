const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const UZIP = require('/tmp/huanyu-fig-parser.Ifwr2W/node_modules/uzip')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')
const root = path.resolve(__dirname, '..')
const dir = path.join(root, 'docs/figma-source/cases')
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name)))
const inventory = read('native-inventory-2026-09-29.json')
const parameters = read('native-parameters-2026-09-29.json')
const dev = read('dev-mode-2026-09-29.json')
const paints = read('native-image-paints-2026-09-29.json')
const nodes = new Map(inventory.nodes.map(n => [n.id, n]))
const values = new Map(parameters.nodes.map(n => [n.nodeId, n]))
const copies = new Map(dev.nodes.map(n => [n.nodeId, n]))
const p = id => values.get(id).parameters
const children = id => nodes.get(id).children.map(id => nodes.get(id))
const descendants = id => [nodes.get(id), ...children(id).flatMap(n => descendants(n.id))]
const text = id => p(id).textData?.characters || ''
const save = (name, value) => fs.writeFileSync(path.join(dir, name), JSON.stringify(value, null, 2) + '\n')
const targets = new Map()
const bind = (id, selector, mode = 'DOM') => targets.set(id, { selector, mode, ownerNodeId: id })
const assets = [], images = new Map(), vectors = new Map()
const assetDir = path.join(root, 'public/images/figma/case-source')
const assetPath = (id, ext) => `/images/figma/case-source/node-${id.replace(':', '-')}.${ext}`
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const bytes = fs.readFileSync(inventory.sourceFile)
if (createHash('sha256').update(bytes).digest('hex') !== inventory.sourceSHA256) throw new Error('Native source changed')
const archive = UZIP.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))

function shell(sourceId, hospitalId, hospitalMap) {
  const target = hospitalMap.get(hospitalId)
  const source = nodes.get(sourceId)
  if (!target || source.type !== target.type || source.children.length !== target.children.length) throw new Error(`Shell structure mismatch ${sourceId}`)
  bind(sourceId, target.selector, target.mode)
  source.children.forEach((id, i) => shell(id, target.children[i], hospitalMap))
}

async function main() {
  fs.mkdirSync(assetDir, { recursive: true })
  for (const node of inventory.nodes) {
    if (!copies.get(node.id)?.css.length) throw new Error(`Missing Inspect read ${node.id}`)
    const svg = copies.get(node.id).css.find(code => code.startsWith('<svg'))
    if (svg && node.rendered) {
      const src = assetPath(node.id, 'svg')
      fs.writeFileSync(path.join(root, 'public', src), svg + '\n')
      vectors.set(node.id, src)
      assets.push({ nodeId: node.id, name: node.name, projectPath: `/public${src}`, export: 'Exact Dev Mode SVG' })
    }
  }
  for (const image of paints.assets.filter(n => n.rendered)) {
    const src = assetPath(image.nodeId, 'webp')
    await sharp(Buffer.from(archive[`images/${image.imageHash}`])).webp({ lossless: true }).toFile(path.join(root, 'public', src))
    images.set(image.nodeId, { src, paint: image.paint })
    assets.push({ ...image, projectPath: `/public${src}`, export: 'Original Figma image pixels encoded as lossless WebP; source crop preserved' })
  }
  for (const id of ['190:5300', '190:5301', '190:5302']) bind(id, '.case-page')
  bind('190:5303', '.case-hero')
  bind('190:5304', '.case-hero__content')
  bind('190:5305', '.case-hero__copy')
  for (const node of inventory.nodes.filter(n => !n.rendered)) bind(node.id, `.case-source-hidden [data-figma-node="${node.id}"]`, 'Authored hidden node; native parameters supplement ancestor Inspect CSS')
  for (const id of ['190:5319', '190:5320']) bind(id, '.case-hero h1')
  for (const id of ['190:5321', '190:5322']) bind(id, '.case-hero p')
  bind('190:5323', '.case-match-button')
  bind('190:5324', '.case-match-button>img', 'Exact Figma SVG')
  bind('190:5327', '.case-match-button>.button-label')
  bind('190:5328', '.case-directory')
  bind('221:6191', '.case-filters')
  bind('221:6192', '.case-filters')
  children('221:6192').slice(0, 4).forEach((node, i) => {
    const selector = `.case-filters>label:nth-child(${i + 1})`
    bind(node.id, selector)
    const [label, arrow] = children(node.id)
    bind(label.id, `${selector}>select`, 'Native select label')
    bind(arrow.id, `${selector}>.filter-arrow`)
    bind(children(arrow.id)[0].id, `${selector} .filter-arrow>img`, 'Exact Figma SVG')
  })
  for (const [id, selector] of [['221:6213', '.case-filter-submit'], ['221:6217', '.case-filter-reset']]) {
    bind(id, selector)
    const [icon, label] = children(id)
    bind(icon.id, `${selector}>img`, 'Exact Figma SVG')
    bind(label.id, `${selector}>.button-label`)
  }
  bind('190:5365', '.case-grid')
  const cards = children('190:5365').map((node, i) => {
    const selector = `.case-grid>article:nth-child(${i + 1})`
    bind(node.id, selector)
    const header = children(node.id)[0], body = children(node.id).at(-1)
    bind(header.id, `${selector}>header`)
    const [avatar, identity] = children(header.id)
    bind(avatar.id, `${selector} .case-avatar`, 'Original Figma image and crop')
    bind(identity.id, `${selector} .case-identity`)
    const [heading, metadata] = children(identity.id)
    descendants(heading.id).forEach(n => bind(n.id, `${selector} h2`))
    descendants(metadata.id).forEach(n => bind(n.id, `${selector} .case-identity>p`))
    bind(body.id, `${selector} .case-card__body`)
    const [title, ...rows] = children(body.id)
    descendants(title.id).forEach(n => bind(n.id, `${selector} h3`))
    rows.forEach((row, j) => descendants(row.id).forEach(n => bind(n.id, `${selector} dl>div:nth-child(${j + 1})`)))
    const badge = children(node.id).find(n => n.id === '190:5391')
    if (badge) descendants(badge.id).forEach(n => bind(n.id, `${selector} .case-recommendation`))
    return { nodeId: node.id, avatar: images.get(avatar.id), name: text(children(heading.id)[0].id), metadata: text(children(metadata.id)[0].id), title: text(children(title.id)[0].id), rows: rows.map(n => ({ nodeId: children(n.id)[0].id, text: text(children(n.id)[0].id) })), recommended: Boolean(badge) }
  })
  bind('190:5402', '.case-summary')
  bind('190:5403', '.case-summary>.hy-container')
  bind('190:5404', '.case-summary>.hy-container')
  const metrics = children('190:5404').slice(0, 4).map((node, i) => {
    const selector = `.case-summary .summary-metric:nth-child(${i + 1})`
    bind(node.id, selector)
    const [number, label] = children(node.id)
    descendants(number.id).forEach(n => bind(n.id, `${selector}>strong`))
    descendants(label.id).forEach(n => bind(n.id, `${selector}>span`))
    return { nodeId: node.id, value: text(children(number.id)[0].id), label: text(children(label.id)[0].id) }
  })
  children('190:5404').slice(4).forEach((n, i) => bind(n.id, `.case-summary .summary-divider:nth-of-type(${i + 1})`))
  const hospitalMap = new Map(JSON.parse(fs.readFileSync(path.join(root, 'docs/figma-source/hospitals/node-to-code-2026-09-29.json'))).nodes.map(n => [n.id, n]))
  bind('190:5428', '.patient-footer')
  shell('190:5429', '144:5154', hospitalMap)
  shell('484:1592', '484:1549', hospitalMap)
  const mapping = inventory.nodes.map(node => {
    let owner = node
    while (owner && !targets.has(owner.id)) owner = nodes.get(owner.parentNodeId)
    if (!owner || ['190:5300', '190:5301', '190:5302'].includes(owner.id) && node.id !== owner.id) throw new Error(`Unmapped ${node.id}`)
    return { ...node, ...targets.get(owner.id), parametersNodeId: node.id, devModeNodeId: node.id, framePosition: values.get(node.id).framePosition }
  })
  function html(node, suppressed = false) {
    const value = p(node.id), svg = vectors.get(node.id)
    let css = copies.get(node.id).css.filter(s => !s.startsWith('<svg')).join('')
    if (images.has(node.id)) css = css.replaceAll('<path-to-image>', images.get(node.id).src)
    css += `;position:${node.id === inventory.sourceFrame ? 'relative' : 'absolute'};left:${node.id === inventory.sourceFrame ? 0 : value.transform.m02}px;top:${node.id === inventory.sourceFrame ? 0 : value.transform.m12}px;width:${value.size.x}px;height:${value.size.y}px;box-sizing:border-box;letter-spacing:0;`
    if (!node.rendered || suppressed) css += 'display:none;'
    if (value.type === 'TEXT') css += `white-space:${value.size.y > (value.lineHeight?.value || value.fontSize) * 1.5 ? 'pre-wrap' : 'pre'};`
    if (value.frameMaskDisabled === false) css += 'overflow:hidden;'
    const content = svg ? `<img src="${svg}" alt="" style="position:absolute;inset:0;width:100%;height:100%">` : escape(text(node.id))
    return `<div data-figma-node="${node.id}" style="${escape(css)}">${content}${children(node.id).map(n => html(n, suppressed || Boolean(svg))).join('')}</div>`
  }
  save('assets.json', { sourceFrame: inventory.sourceFrame, assets })
  save('node-to-code-2026-09-29.json', { sourceFrame: inventory.sourceFrame, nodes: mapping })
  save('content-2026-09-29.json', { hero: images.get('190:5303'), summary: images.get('190:5402'), cards, metrics, hiddenHtml: inventory.nodes.filter(n => !n.rendered && nodes.get(n.parentNodeId)?.rendered).map(n => html(n)).join('') })
  fs.writeFileSync(path.join(dir, 'source-frame-2026-09-29.html'), `<!doctype html><meta charset="utf-8"><title>190:5300 static source</title><base href="http://127.0.0.1:5173/"><style>html,body{margin:0}*{box-sizing:border-box}</style>${html(nodes.get(inventory.sourceFrame))}\n`)
  fs.writeFileSync(path.join(dir, 'dev-styles-2026-09-29.css'), dev.nodes.map(n => `/* ${n.nodeId} ${n.layerName} */\n[data-figma-node="${n.nodeId}"] { ${n.css.filter(s => !s.startsWith('<svg')).join('\n')} }`).join('\n\n'))
  const files = ['layers-2026-09-29.json', 'dev-mode-2026-09-29.json', 'native-inventory-2026-09-29.json', 'native-parameters-2026-09-29.json', 'native-image-paints-2026-09-29.json', 'node-to-code-2026-09-29.json', 'content-2026-09-29.json', 'source-frame-2026-09-29.html', 'dev-styles-2026-09-29.css', 'assets.json']
  save('baseline-lock-2026-09-29.json', { sourceFrame: inventory.sourceFrame, sourceSHA256: inventory.sourceSHA256, nodeCount: mapping.length, lockedAt: new Date().toISOString(), phase: 'Source hierarchy, exact parameter supplement, mapping and static baseline locked before Vue changes', files: files.map(name => ({ name, sha256: createHash('sha256').update(fs.readFileSync(path.join(dir, name))).digest('hex') })) })
  console.log(JSON.stringify({ nodes: mapping.length, rendered: mapping.filter(n => n.rendered).length, assets: assets.length, cards, metrics }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
