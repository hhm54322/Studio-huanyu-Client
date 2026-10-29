// Compose authored article copy with the inspected PC dialog template.
// No dimensions are inferred from screenshots; all flow rules come from the
// template's Dev CSS/native Auto Layout. Do not overwrite either source lock.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const root = path.resolve(__dirname, '..')
const directory = path.join(root, 'docs/figma-source/trust-articles-revision')
const date = '2026-10-22'
const templateDirectory = path.join(root, 'docs/figma-source/trust-content-revision')
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const save = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
const hash = value => createHash('sha256').update(value).digest('hex')
const template = read(path.join(templateDirectory, 'trust/source-tree-2026-10-21.json'))
const model = read(path.join(templateDirectory, 'trust/dialog-model-2026-10-21.json'))
const lock = read(path.join(templateDirectory, 'baseline-lock-2026-10-21.json'))
for (const file of lock.files) assert.equal(hash(fs.readFileSync(path.join(templateDirectory, file.name))), file.sha256)
const sourceLock = read(path.join(directory, `baseline-lock-${date}.json`))
for (const file of sourceLock.files) assert.equal(hash(fs.readFileSync(path.join(directory, file.name))), file.sha256)
const flat = node => [node, ...node.children.flatMap(flat)]
const sourceNodes = new Map(flat(template.root).map(node => [node.id, node]))
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const generated = []
const counts = []
for (const [key, article] of Object.entries({
  cost: { frame: '1595:3491', panel: '1595:3493', overlay: '1595:3492', close: '1595:3494', icon: '1595:3495', vector: '1595:3496', bodyContainer: '1595:3497', body: '1595:3498', header: '1595:3499', heading: '1595:3500', title: '1595:3501', lead: '1595:3502', description: '1595:3503', decoration: '1595:3504' },
  doctor: { frame: '1595:3519', panel: '1595:3521', overlay: '1595:3520', close: '1595:3522', icon: '1595:3523', vector: '1595:3524', bodyContainer: '1595:3525', body: '1595:3526', header: '1595:3527', heading: '1595:3528', title: '1595:3529', lead: '1595:3530', description: '1595:3531', decoration: '1595:3532' },
})) {
  const folder = path.join(directory, key)
  const inventory = read(path.join(folder, `native-inventory-${date}.json`))
  const parameters = new Map(read(path.join(folder, `native-parameters-${date}.json`)).nodes.map(n => [n.nodeId, n.parameters]))
  const copied = new Map(read(path.join(folder, `dev-mode-${date}.json`)).nodes.map(n => [n.nodeId, n]))
  assert.equal(inventory.nodeCount, 14)
  assert.equal(inventory.layersCrossCheck, true)
  for (const n of inventory.nodes) assert.ok(copied.get(n.id)?.code.length, `${n.id}: missing Dev CSS`)
  const panel = structuredClone(sourceNodes.get(model.panel))
  const nodes = new Map(flat(panel).map(node => [node.id, node]))
  // Native template grid rows are fit-content, text is WIDTH_AND_HEIGHT/HEIGHT.
  // Remove fixed baseline line/height data only for the replaced text, keeping
  // every original template spacing, font, colour, radius, and close control.
  panel.css = panel.layoutCss + ';left:0;top:0;'
  panel.x = 0; panel.y = 0
  for (const id of ['143:4213', '143:4214', '143:4216', '143:4218']) {
    const node = nodes.get(id)
    node.css = node.layoutCss
  }
  const replacements = [[model.title, article.title], [model.description, article.description], ['143:4219', article.body]]
  for (const [templateId, contentId] of replacements) {
    const node = nodes.get(templateId)
    node.text = parameters.get(contentId).textData.characters.replaceAll('\u001e', '-')
    delete node.textLines; delete node.textRuns; delete node.textParagraphs
    node.css = node.layoutCss + (templateId === '143:4219' ? ';height:auto;' : ';width:max-content;')
    if (templateId === '143:4219') {
      const paragraphs = node.text.split('\n')
      const original = sourceNodes.get(templateId).textParagraphs
      assert.ok(original[0].css.includes('margin-bottom:12px'))
      node.textParagraphs = paragraphs.map((text, index) => ({ runs: [{ text, css: '' }], css: index === paragraphs.length - 1 ? 'display:block;' : original[0].css }))
    }
    node.layoutCss = node.css
  }
  const mapping = new Map([
    [article.frame, ['143:4206', 'Native dialog ownership; source background image not shipped']],
    [article.overlay, ['143:4208', 'Native backdrop; PC template padding40 and blur4']],
    [article.panel, [model.panel, 'PC template grid, width896, padding32, radius24']],
    [article.close, [model.close, 'PC template close button36 with exact original SVG']],
    [article.icon, ['143:4211', 'PC template exact SVG owner']],
    [article.vector, ['143:4211', 'PC template exact SVG path ownership']],
    [article.bodyContainer, ['143:4218', 'PC template content Auto Layout, top padding24']],
    [article.body, ['143:4219', 'Authored copy; PC template16/24 text, paragraph spacing12']],
    [article.header, ['143:4213', 'PC template heading group']],
    [article.heading, ['143:4214', 'PC template heading container']],
    [article.title, [model.title, 'Authored copy; PC template32/32 semibold and intrinsic text width']],
    [article.lead, ['143:4216', 'PC template description container, top padding8']],
    [article.description, [model.description, 'Authored copy; PC template14/22 description']],
    [article.decoration, [null, 'Device home indicator; not website content']],
  ])
  const concrete = inventory.nodes.map(node => {
    const [ownerNodeId, reason] = mapping.get(node.id)
    return { nodeId: node.id, parentNodeId: node.parentNodeId, siblingOrder: node.siblingOrder, name: node.name, ownerNodeId, rendered: Boolean(ownerNodeId), selector: ownerNodeId ? `[data-figma-node="${ownerNodeId}"]` : null, component: ['143:4206','143:4208'].includes(ownerNodeId) ? 'TrustArticleDialog.vue' : ownerNodeId ? 'HomeSourceNode.vue' : null, reason }
  })
  const data = { key, articleFrame: article.frame, templateFrame: model.frame, sourceSHA256: inventory.sourceSHA256, templateSHA256: template.sourceSHA256, title: nodes.get(model.title).text, description: nodes.get(model.description).text, body: nodes.get('143:4219').text, mobileUI: 'deferred by user', geometry: 'PC template fit-content Auto Layout; content-derived height, not a separate authored PC article frame', model, root: panel, contentMapping: concrete }
  const render = node => `<${node.type === 'TEXT' ? 'p' : 'div'} data-figma-node="${node.id}" style="${escape(node.css)}">${node.svg ? `<img alt="" src="${node.svg}" style="display:block;width:100%;height:auto">` : node.textParagraphs ? node.textParagraphs.map(p => `<span style="${p.css}">${p.runs.map(r => escape(r.text)).join('')}</span>`).join('') : escape(node.text)}${node.children.map(render).join('')}</${node.type === 'TEXT' ? 'p' : 'div'}>`
  const output = path.join(folder, `desktop-variant-${date}.json`)
  save(output, data)
  const html = path.join(folder, `desktop-baseline-${date}.html`)
  fs.writeFileSync(html, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><link rel="stylesheet" href="/fonts/home-source-fonts.css"><title>${data.title} PC template composition</title><style>html,body{margin:0}*{box-sizing:border-box}body{font-family:'PingFang SC',sans-serif;-webkit-font-smoothing:antialiased}img{max-width:none}</style>${render(panel)}</html>\n`)
  generated.push(output, html)
  counts.push({ key, sourceFrame: article.frame, nodes: concrete.length, runtimeOwners: new Set(concrete.filter(n => n.rendered).map(n => n.ownerNodeId)).size })
}
const inputs = [...sourceLock.files.map(file => path.join(directory, file.name)), ...lock.files.map(file => path.join(templateDirectory, file.name)), __filename]
save(path.join(directory, `desktop-composition-lock-${date}.json`), { lockedAt: new Date().toISOString(), phase: 'Static desktop composition before Vue: complete authored copy + exact inspected PC template, not visual acceptance', counts, files: [...inputs, ...generated].map(file => ({ name: path.relative(root, file), sha256: hash(fs.readFileSync(file)) })) })
console.log(JSON.stringify(counts, null, 2))
