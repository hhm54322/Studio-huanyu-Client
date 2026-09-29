const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')

const root = path.resolve(__dirname, '..')
const source = path.join(root, 'docs/figma-source/home')
const layers = JSON.parse(fs.readFileSync(path.join(source, 'layers-2026-09-29.json'), 'utf8'))
const dev = JSON.parse(fs.readFileSync(path.join(source, 'dev-mode-2026-09-29.json'), 'utf8'))
const sections = [
  [48, 81, '.home-hero'], [81, 128, '.home-flow'], [128, 209, '.why-overview'],
  [209, 377, '.patient-story'], [377, 413, '.care-section'], [413, 450, '.team-section'],
  [450, 671, '.data-section'], [671, 708, '.hospital-section'], [708, 827, '.expert-section'],
  [827, 847, '.strength-section'], [847, 987, '.partners-section'], [987, 1024, '.home-cta'],
  [1024, 1101, '.patient-footer'], [1145, 1150, '.home-hero__assistant'],
]
const ranges = [
  [49, 53, '.home-hero__image'], [53, 54, '.home-hero__copy'], [54, 59, '.home-hero__eyebrow'],
  [59, 61, '.home-hero h1'], [61, 62, '.home-hero__heading p'], [62, 64, '.home-hero__meta'],
  [64, 65, '.home-hero__button-wrap'], [65, 70, '.home-hero__button'],
  [70, 73, '.home-hero__arrow--left'], [73, 76, '.home-hero__arrow--right'], [76, 81, '.home-hero__controls'],
  [136, 143, '.why-overview aside'], [143, 149, '.why-overview__main .section-title'],
  [149, 151, '.why-overview__grid'], [218, 219, '.patient-story__image'],
  [219, 221, '.patient-story__content'], [221, 223, '.patient-story__card b'], [223, 225, '.patient-story blockquote'],
  [225, 241, '.patient-story__details'], [241, 252, '.patient-story__card small'],
  [252, 257, '.patient-story__card a'], [257, 261, '.patient-story__image>span'],
  [461, 531, '.radar-card .chart-canvas'], [534, 669, '.cost-card .chart-canvas'],
  [715, 725, '.expert-tabs'], [725, 727, '.expert-grid'],
  [834, 841, '.strength-layout>div'], [841, 843, '.strength-layout__image'],
  [853, 985, '.partners-marquee img:first-child'],
  [995, 999, '.cta-white'], [999, 1003, '.cta-outline'], [1003, 1008, '.cta-dark'],
  [1008, 1024, '.home-cta small'],
]
const repeated = [
  [[[89, 99], [99, 109], [109, 119], [119, 128]], '.home-flow__line>a'],
  [[[151, 166], [166, 175], [175, 183], [183, 191], [191, 200], [200, 209]], '.why-overview__grid>article'],
  [[[386, 395], [395, 404], [404, 413]], '.care-grid>a'],
  [[[422, 429], [429, 436], [436, 443], [443, 450]], '.team-grid>article'],
  [[[680, 687], [687, 694], [694, 701], [701, 708]], '.hospital-grid>a'],
  [[[727, 752], [752, 777], [777, 802], [802, 827]], '.expert-grid>article'],
]
// Repeated source subtrees retain their authored order. Layout-only wrappers may
// share a semantic Vue element; vector descendants are represented by the SVG asset.
for (const [siblings, selector] of repeated) {
  siblings.forEach(([start, end], index) => ranges.push([start, end, `${selector}:nth-child(${index + 1})`]))
}
const stack = []
const siblingCounts = new Map()
const mapping = layers.map((layer) => {
  stack[layer.level] = layer.id
  const parentNodeId = stack[layer.level - 1] || null
  const siblingOrder = siblingCounts.get(parentNodeId) || 0
  siblingCounts.set(parentNodeId, siblingOrder + 1)
  const parameters = dev[layer.id]
  if (parameters.name !== layer.name || (!layer.disabled && !parameters.verified)) throw new Error(`Unverified source ${layer.id}`)
  const id = Number(layer.id.split(':')[1])
  const base = layer.id.startsWith('484:') ? '.patient-header' : sections.find(([start, end]) => id >= start && id < end)?.[2] || '.home-page'
  const selector = ranges.find(([start, end]) => id >= start && id < end)?.[2] || base
  return {
    nodeId: layer.id, layerName: layer.name, parentNodeId, siblingOrder,
    visibility: layer.disabled ? 'hidden' : 'visible',
    selector: layer.disabled ? null : selector,
    implementation: layer.disabled ? 'Excluded hidden source layer' : selector.includes('chart-canvas') ? 'ECharts canonical source coordinates' : selector.includes('partners-marquee img') ? 'Flattened Figma viewport bitmap; source child parameters retained' : 'Vue semantic element; source layout wrappers flattened',
    parameters,
  }
})
fs.writeFileSync(path.join(source, 'node-to-code-2026-09-29.json'), JSON.stringify({ sourceFrame: '143:45', nodes: mapping }, null, 2) + '\n')
const runtimeIcons = new Set(['143:227', '143:233', '143:254', '143:735', '143:741', '143:760', '143:766', '143:785', '143:791', '143:810', '143:816', '143:996', '143:1000', '143:1005', '143:1010', '143:1015', '143:1020', '143:1146'])
const iconDirectory = path.join(root, 'public/images/figma/home-icons')
for (const filename of fs.readdirSync(iconDirectory)) {
  const match = /^node-(143-\d+)\.svg$/.exec(filename)
  if (match && !runtimeIcons.has(match[1].replace('-', ':'))) fs.unlinkSync(path.join(iconDirectory, filename))
}
let svgCount = 0
for (const node of mapping.filter((node) => runtimeIcons.has(node.nodeId))) {
  const svg = node.parameters.css.find((value) => value.startsWith('<svg'))
  if (!svg) continue
  fs.writeFileSync(path.join(iconDirectory, `node-${node.nodeId.replace(':', '-')}.svg`), `${svg}\n`)
  svgCount++
}
const files = ['frame-2026-09-28.html', 'styles-2026-09-28.txt', 'layers-2026-09-29.json', 'dev-mode-2026-09-29.json', 'node-to-code-2026-09-29.json']
fs.writeFileSync(path.join(source, 'baseline-lock-2026-09-29.json'), JSON.stringify({ sourceFrame: '143:45', files: files.map((name) => ({ name, sha256: createHash('sha256').update(fs.readFileSync(path.join(source, name))).digest('hex') })), visible: mapping.filter((node) => node.visibility === 'visible').length, hidden: mapping.filter((node) => node.visibility === 'hidden').length }, null, 2) + '\n')
console.log(`${mapping.length} node mappings; ${svgCount} original SVG files`)
