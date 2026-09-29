import assert from 'node:assert/strict'
import { readFile, access, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const dir = join(process.cwd(), 'docs/figma-source/diseases')
const out = join(process.cwd(), 'docs/figma-verification/diseases/2026-09-29')
const json = async name => JSON.parse(await readFile(join(dir, name), 'utf8'))
const inventory = await json('native-inventory-2026-09-29.json')
const parameters = await json('native-parameters-2026-09-29.json')
const layers = await json('layers-2026-09-29.json')
const dev = await json('dev-mode-2026-09-29.json')
const mapping = await json('node-to-code-2026-09-29.json')
const assets = await json('assets.json')
const lock = await json('baseline-lock-2026-09-29.json')
assert.equal(inventory.layersCrossCheck, true, 'Discovery export is not a verified source')
assert.equal(dev.extractionComplete, true)
for (const collection of [inventory.nodes, parameters.nodes, layers.nodes, dev.nodes, mapping.nodes]) assert.equal(collection.length, 325)
assert.equal(new Set(inventory.nodes.map(n => n.id)).size, 325)
assert.equal(inventory.nodes.filter(n => !n.rendered).length, 16)
for (const node of inventory.nodes) {
  const layer = layers.nodes.find(n => n.id === node.id)
  const copy = dev.nodes.find(n => n.nodeId === node.id)
  const target = mapping.nodes.find(n => n.id === node.id)
  assert.equal(layer.parentNodeId, node.parentNodeId, `${node.id}: parent`)
  assert.equal(layer.siblingOrder, node.siblingOrder, `${node.id}: sibling order`)
  assert.equal(target.rendered, node.rendered, `${node.id}: visibility`)
  assert.ok(parameters.nodes.some(n => n.nodeId === node.id), `${node.id}: parameter record`)
  assert.ok(copy.css.length, `${node.id}: Dev Mode read`)
  assert.ok(target.selector && !/pending|unresolved/.test(target.selector), `${node.id}: selector`)
}
for (const file of lock.files) {
  assert.equal(createHash('sha256').update(await readFile(join(dir, file.name))).digest('hex'), file.sha256, `${file.name}: source lock changed`)
}
const html = await readFile(join(dir, 'source-frame-2026-09-29.html'), 'utf8')
for (const node of inventory.nodes) assert.ok(html.includes(`data-figma-node="${node.id}"`), `${node.id}: baseline missing`)
for (const asset of assets.assets) {
  const file = join(process.cwd(), asset.projectPath.replace(/^\//, ''))
  await access(file)
  if (file.endsWith('.svg')) {
    const expected = dev.nodes.find(n => n.nodeId === asset.nodeId).css.find(c => c.startsWith('<svg'))
    assert.equal((await readFile(file, 'utf8')).trim(), expected, `${asset.nodeId}: source SVG altered`)
  }
}
const qa = JSON.parse(await readFile(join(out, 'source-map-results.json'), 'utf8'))
assert.equal(qa.nodes.length, 325)
assert.equal(qa.typography.length, 115)
assert.equal(qa.geometry.length, 93)
assert.equal(qa.failures.length, 0)
const states = JSON.parse(await readFile(join(out, 'state-results.json'), 'utf8'))
assert.deepEqual(states.results.map(r => r.width), [1440, 1024, 768, 390])
assert.equal(states.errors.length, 0)
for (const result of states.results) {
  assert.equal(result.scrollWidth, result.width)
  assert.equal(result.broken.length, 0)
  for (const field of ['search', 'featureSearch', 'reset', 'empty', 'dental', 'report', 'unfinishedDisabled', 'consultation', 'focusTrap', 'focusRestore', 'escape', 'reveal']) assert.equal(result[field], true, `${result.width}: ${field}`)
}
assert.equal(states.reduced.transform, 'none')
assert.ok(parseFloat(states.reduced.transition) <= .0001)
const geometry = JSON.parse(await readFile(join(out, 'geometry.json'), 'utf8'))
assert.equal(geometry.results[0].height, 3144)
assert.equal(geometry.errors.length, 0)
assert.ok(geometry.results[2].changedPixelRatio < .01, 'Source frame pixel difference exceeds 1%')
const changed = Math.max(...await Promise.all([
  'src/views/patient/DiseaseTechnologyView.vue', 'src/components/layout/PatientLayout.vue',
  'src/components/layout/PatientHeader.vue', 'src/components/layout/PatientFooter.vue',
  'src/assets/styles/main.css', 'docs/figma-source/diseases/dev-styles-2026-09-29.css',
].map(async file => (await stat(file)).mtimeMs)))
for (const file of ['local-1440.png', 'local-390.png', 'source-map-results.json', 'state-results.json', 'hover-1440.png', ...states.results.flatMap(r => [`search-${r.width}.png`, `empty-${r.width}.png`, `consult-${r.width}.png`])]) assert.ok((await stat(join(out, file))).mtimeMs >= changed, `${file}: evidence predates UI edit`)
console.log(`diseases source gate passed: 325 node mappings, 115 text checks, 93 geometry checks, ${assets.assets.length} exact source assets, four viewport state checks`)
