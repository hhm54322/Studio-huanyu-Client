// Run one article at a time. Each article owns an independent source and
// composition lock; building the next article cannot rewrite the previous one.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const root = path.resolve(__dirname, '..')
const key = process.argv[2]
assert.ok(/^[a-z-]+$/.test(key || ''), 'Pass the extracted article key')
const date = '2026-10-22'
const folder = path.join(root, 'docs/figma-source/trust-safety-revision', key)
const templateFolder = path.join(root, 'docs/figma-source/trust-content-revision')
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const save = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const flat = n => [n, ...n.children.flatMap(flat)]
const escape = v => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const articleFile = path.join(folder, `content-nodes-${date}.json`)
const article = read(articleFile)
assert.equal(article.key, key)
const templateLock = read(path.join(templateFolder, 'baseline-lock-2026-10-21.json'))
const sourceLock = read(path.join(folder, `baseline-lock-${date}.json`))
for (const [lock, directory] of [[templateLock, templateFolder], [sourceLock, folder]]) {
  for (const f of lock.files) assert.equal(hash(fs.readFileSync(path.join(directory, f.name))), f.sha256, f.name)
}
const inventory = read(path.join(folder, `native-inventory-${date}.json`))
const parameters = new Map(read(path.join(folder, `native-parameters-${date}.json`)).nodes.map(n => [n.nodeId, n.parameters]))
const copied = new Map(read(path.join(folder, `dev-mode-${date}.json`)).nodes.map(n => [n.nodeId, n]))
assert.equal(inventory.nodeCount, 14)
assert.equal(inventory.layersCrossCheck, true)
assert.equal(inventory.sourceFrame, article.frame)
for (const n of inventory.nodes) assert.ok(copied.get(n.id)?.code.length, `${n.id}: missing Dev CSS`)
const template = read(path.join(templateFolder, 'trust/source-tree-2026-10-21.json'))
const model = read(path.join(templateFolder, 'trust/dialog-model-2026-10-21.json'))
const templateNodes = new Map(flat(template.root).map(n => [n.id, n]))
const panel = structuredClone(templateNodes.get(model.panel))
const nodes = new Map(flat(panel).map(n => [n.id, n]))
panel.css = panel.layoutCss + ';left:0;top:0;'
panel.x = 0; panel.y = 0
for (const id of ['143:4213', '143:4214', '143:4216', '143:4218']) nodes.get(id).css = nodes.get(id).layoutCss
for (const [ownerId, contentId] of [[model.title, article.title], [model.description, article.description], ['143:4219', article.body]]) {
  const n = nodes.get(ownerId)
  n.text = parameters.get(contentId).textData.characters
  for (const correction of article.copyCorrections) {
    if (correction.nodeId !== contentId) continue
    assert.ok(n.text.includes(correction.from))
    n.text = n.text.replaceAll(correction.from, correction.to)
  }
  delete n.textLines; delete n.textRuns; delete n.textParagraphs
  n.css = n.layoutCss + (ownerId === '143:4219' ? ';height:auto;' : ';width:max-content;')
  if (ownerId === '143:4219') {
    const paragraphs = n.text.split('\n')
    const spacing = templateNodes.get(ownerId).textParagraphs[0].css
    assert.ok(spacing.includes('margin-bottom:12px'))
    n.textParagraphs = paragraphs.map((text, index) => ({ runs: [{ text, css: '' }], css: index === paragraphs.length - 1 ? 'display:block;' : spacing }))
  }
  n.layoutCss = n.css
}
const ownerMap = new Map([
  [article.frame, [model.frame, 'Native dialog ownership; source background screenshot not shipped']],
  [article.overlay, [model.overlay, 'PC backdrop, padding40, blur4']],
  [article.panel, [model.panel, 'PC template fit-content grid: width896, padding32, radius24']],
  [article.close, [model.close, 'PC close control36']],
  [article.icon, ['143:4211', 'Original PC close SVG20']],
  [article.vector, ['143:4211', 'Exact original PC SVG path owner']],
  [article.bodyContainer, ['143:4218', 'PC content Auto Layout: top padding24']],
  [article.body, ['143:4219', 'Full authored body: PC16/24, paragraph spacing12']],
  [article.header, ['143:4213', 'PC header group']],
  [article.heading, ['143:4214', 'PC heading container']],
  [article.title, [model.title, 'Authored title: PC32/32 semibold']],
  [article.lead, ['143:4216', 'PC description container: top padding8']],
  [article.description, [model.description, 'Authored description: PC14/22']],
  [article.decoration, [null, 'Device home indicator; not website content']],
])
assert.equal(ownerMap.size, inventory.nodeCount)
const contentMapping = inventory.nodes.map(n => {
  assert.ok(ownerMap.has(n.id), `Unmapped ${n.id}`)
  const [ownerNodeId, reason] = ownerMap.get(n.id)
  return { nodeId: n.id, parentNodeId: n.parentNodeId, siblingOrder: n.siblingOrder, name: n.name, ownerNodeId, rendered: Boolean(ownerNodeId), selector: ownerNodeId ? `[data-figma-node="${ownerNodeId}"]` : null, component: [model.frame, model.overlay].includes(ownerNodeId) ? 'TrustArticleDialog.vue' : ownerNodeId ? 'HomeSourceNode.vue' : null, reason }
})
const variant = {
  key, articleFrame: article.frame, templateFrame: model.frame,
  sourceSHA256: inventory.sourceSHA256, templateSHA256: template.sourceSHA256,
  title: nodes.get(model.title).text, description: nodes.get(model.description).text, body: nodes.get('143:4219').text,
  copyCorrections: article.copyCorrections, mobileUI: 'deferred by user',
  geometry: 'PC template fit-content Auto Layout; content-derived height, not a separate authored PC article frame',
  model, root: panel, contentMapping,
}
const render = n => `<${n.type === 'TEXT' ? 'p' : 'div'} data-figma-node="${n.id}" style="${escape(n.css)}">${n.svg ? `<img alt="" src="${n.svg}" style="display:block;width:100%;height:auto">` : n.textParagraphs ? n.textParagraphs.map(p => `<span style="${p.css}">${p.runs.map(r => escape(r.text)).join('')}</span>`).join('') : escape(n.text)}${n.children.map(render).join('')}</${n.type === 'TEXT' ? 'p' : 'div'}>`
const output = path.join(folder, `desktop-variant-${date}.json`)
const html = path.join(folder, `desktop-baseline-${date}.html`)
save(output, variant)
fs.writeFileSync(html, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><link rel="stylesheet" href="/fonts/home-source-fonts.css"><title>${escape(variant.title)} PC template composition</title><style>html,body{margin:0}*{box-sizing:border-box}body{font-family:'PingFang SC',sans-serif;-webkit-font-smoothing:antialiased}img{max-width:none}</style>${render(panel)}</html>\n`)
const inputs = [articleFile, ...sourceLock.files.map(f => path.join(folder, f.name)), ...templateLock.files.map(f => path.join(templateFolder, f.name)), __filename]
save(path.join(folder, `desktop-composition-lock-${date}.json`), {
  lockedAt: new Date().toISOString(),
  phase: 'Static desktop composition before Vue: complete authored copy + exact inspected PC template, not visual acceptance',
  key, sourceFrame: article.frame, nodes: contentMapping.length,
  files: [...new Set([...inputs, output, html])].map(file => ({ name: path.relative(root, file), sha256: hash(fs.readFileSync(file)) })),
})
console.log(JSON.stringify({ key, sourceFrame: article.frame, nodes: contentMapping.length, title: variant.title, description: variant.description }, null, 2))
