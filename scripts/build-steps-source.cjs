// Lock the complete current Layers, Dev Mode values and concrete DOM mapping
// before changing the combined, single-sticky toolkit implementation.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const root = path.resolve(__dirname, '..')
const date = '2026-10-29'
const sourceRoot = path.join(root, 'docs/figma-source/steps/revision-' + date)
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const esc = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const originalAssets = JSON.parse(fs.readFileSync(path.join(root, 'docs/figma-source/steps/assets.json'))).assets
const cards = {
  '204:5828': ['travel', 2], '204:5836': ['travel', 1], '204:5851': ['travel', 3], '204:5859': ['travel', 4], '204:5867': ['travel', 5],
  '204:6028': ['after', 1], '204:6045': ['after', 2],
}
for (const name of ['travel', 'aftercare']) {
  const dir = path.join(sourceRoot, name)
  const read = key => JSON.parse(fs.readFileSync(path.join(dir, `${key}-${date}.json`)))
  const save = (key, data) => fs.writeFileSync(path.join(dir, `${key}-${date}.json`), JSON.stringify(data, null, 2) + '\n')
  const inventory = read('native-inventory'), parameters = read('native-parameters'), layers = read('ui-layers'), dev = read('dev-mode')
  const nodes = new Map(inventory.nodes.map(n => [n.id, n])), values = new Map(parameters.nodes.map(n => [n.nodeId, n.parameters])), copied = new Map(dev.nodes.map(n => [n.nodeId, n]))
  assert.equal(digest(fs.readFileSync(inventory.sourceFile)), inventory.sourceSHA256)
  const rows = layers.nodes.filter(n => nodes.has(n.nodeId))
  assert.equal(rows.length, inventory.nodeCount)
  for (let index = 0; index < inventory.nodes.length; index++) {
    const n = inventory.nodes[index], row = rows[index], d = copied.get(n.id)
    assert.ok(row && row.nodeId === n.id && row.parentNodeId === n.parentNodeId && row.name === n.name && row.level === n.level, `Layers mismatch ${n.id}`)
    assert.ok(d, `Uncopied ${n.id}`)
    if (n.rendered) assert.ok(d.selectedName === n.name && d.code.length && !d.code.some(c => c.includes('[Truncated]')), `Incomplete Dev Mode ${n.id}`)
  }
  const assets = originalAssets.filter(a => a.nodeIds.some(id => nodes.has(id))).map(a => ({ ...a, sha256: digest(fs.readFileSync(path.join(root, a.projectPath.replace(/^\//, '')))), currentDevModeNodes: a.nodeIds.filter(id => copied.get(id)?.implemented) }))
  const assetOwners = new Map(assets.flatMap(a => a.nodeIds.map(id => [id, a])))
  const section = name === 'travel' ? '.toolkit-stage-panel:first-child' : '#after'
  function selector(n) {
    if (!n.rendered) return null
    let card
    for (let p = n; p; p = nodes.get(p.parentNodeId)) if (cards[p.id]) { card = `${cards[p.id][0] === 'travel' ? '.toolkit-stage-panel:first-child' : '#after'} .toolkit-stage__cards article:nth-child(${cards[p.id][1]})`; break }
    if (card) {
      if (assetOwners.has(n.id)) return card + (/arrow/.test(assetOwners.get(n.id).projectPath) ? ' a img' : ' .toolkit-stage__icon')
      if (['204:5845', '204:5846', '204:5847', '204:6039', '204:6040', '204:6041'].includes(n.id)) return card + ' a'
      const titleIds = ['204:5832', '204:5833', '204:5841', '204:5842', '204:5855', '204:5856', '204:5863', '204:5864', '204:5872', '204:5873', '204:6035', '204:6036', '204:6049', '204:6050']
      if (titleIds.includes(n.id)) return card + ' h4'
      if (n.type === 'TEXT') return card + ' p'
      if (cards[n.id]) return card
      return card + ' .toolkit-stage__card-copy'
    }
    const id = Number(n.id.split(':')[1]) - (name === 'travel' ? 5813 : 6013)
    if (id === 0) return '.toolkit-stages'
    if (id === 1) return '.toolkit-stages__layout'
    if (id === 2 || id === 3 || id === 6) return '.toolkit-stage__copy'
    if (id === 4 || id === 5) return '.toolkit-stage__copy h2'
    if (id === 7) return '.toolkit-stage__copy p'
    if (id === 8) return name === 'travel' ? '.toolkit-stages__content' : '#after'
    if (id === 9) return section + ' .toolkit-stage__heading'
    if (id === 10 || id === 11) return section + ' h3'
    if (id === 12 || id === 13) return section + ' .toolkit-stage__heading p'
    if (id === 14) return section + ' .toolkit-stage__cards'
    throw Error('Unmapped ' + n.id)
  }
  const mapping = inventory.nodes.map(n => ({ nodeId: n.id, name: n.name, parentNodeId: n.parentNodeId, siblingOrder: n.siblingOrder, rendered: n.rendered, component: n.rendered ? 'src/views/patient/StepView.vue' : null, selector: selector(n), devModeNodeId: n.id, parametersNodeId: n.id, ...(n.rendered ? {} : { reason: 'Authored hidden/off-frame branch remains omitted' }) }))
  const assetByRoot = new Map(assets.map(a => [a.nodeIds[0], a]))
  function render(id, isRoot = false) {
    const n = nodes.get(id), p = values.get(id), d = copied.get(id), a = assetByRoot.get(id)
    let css = d.code.filter(c => !c.trim().startsWith('<svg')).join('\n')
    // Absolute native positions preserve the authored baseline independently
    // of the website's explicitly requested continuous scroll composition.
    css += `;position:${isRoot ? 'relative' : 'absolute'};left:${isRoot ? 0 : p.transform?.m02 || 0}px;top:${isRoot ? 0 : p.transform?.m12 || 0}px;width:${p.size.x}px;height:${p.size.y}px;box-sizing:border-box;margin:0;padding:0;display:${n.rendered ? 'block' : 'none'};`
    if (n.type === 'TEXT') css += 'white-space:pre-wrap;font-synthesis:none;'
    return `<div data-figma-node="${id}" style="${esc(css)}">${a ? `<img src="/${a.projectPath.replace(/^\/?public\//, '')}" style="width:100%;height:100%;display:block" alt="">` : esc(p.textData?.characters || '') + n.children.map(child => render(child)).join('')}</div>`
  }
  fs.writeFileSync(path.join(dir, `baseline-${date}.html`), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>html,body{margin:0}body{font-family:'PingFang SC',sans-serif;-webkit-font-smoothing:antialiased;text-spacing-trim:space-all}</style>${render(inventory.sourceFrame, true)}</html>\n`)
  fs.writeFileSync(path.join(dir, `dev-styles-${date}.css`), dev.nodes.map(n => `/* ${n.nodeId}: ${n.name} */\n${n.code.filter(c => !c.trim().startsWith('<svg')).join('\n')}`).join('\n\n') + '\n')
  save('node-to-code', { sourceFrame: inventory.sourceFrame, nodes: mapping })
  save('assets', { assets })
  for (const key of ['native-inventory', 'native-parameters', 'native-image-paints']) {
    const data = read(key)
    data.layersCrossCheck = true
    data.source = 'Official native export cross-checked against the complete current expanded Layers tree and settled Dev Mode UI'
    save(key, data)
  }
  const files = fs.readdirSync(dir).filter(file => !file.startsWith('baseline-lock-')).map(file => path.join(dir, file))
  save('baseline-lock', { sourceFrame: inventory.sourceFrame, lockedAt: new Date().toISOString(), phase: 'Complete current Layers, Dev CSS, assets and exact mapping before desktop correction; not visual acceptance', files: files.map(file => ({ name: path.relative(root, file), sha256: digest(fs.readFileSync(file)) })) })
  console.log(JSON.stringify({ name, nodes: inventory.nodeCount, visible: inventory.nodes.filter(n => n.rendered).length, assets: assets.length, output: path.relative(root, dir) }))
}
