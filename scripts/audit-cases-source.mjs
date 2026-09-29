import assert from 'node:assert/strict'
import { readFile, access, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const dir = join(process.cwd(), 'docs/figma-source/cases')
const evidenceDir = join(process.cwd(), 'docs/figma-verification/cases/2026-09-29')
const json = async name => JSON.parse(await readFile(join(dir, name), 'utf8'))
const inventory = await json('native-inventory-2026-09-29.json')
const parameters = await json('native-parameters-2026-09-29.json')
const layers = await json('layers-2026-09-29.json')
const dev = await json('dev-mode-2026-09-29.json')
const mapping = await json('node-to-code-2026-09-29.json')
const assets = await json('assets.json')
const lock = await json('baseline-lock-2026-09-29.json')
const collections = [inventory.nodes, parameters.nodes, layers.nodes, dev.nodes, mapping.nodes]
for (const collection of collections) assert.equal(collection.length, 248)
const ids = new Set(inventory.nodes.map(node => node.id))
assert.equal(ids.size, 248)
for (const node of inventory.nodes) {
  const parameter = parameters.nodes.find(value => value.nodeId === node.id)
  const layer = layers.nodes.find(value => value.id === node.id)
  const copy = dev.nodes.find(value => value.nodeId === node.id)
  const target = mapping.nodes.find(value => value.id === node.id)
  assert.ok(parameter && layer && copy && target, `${node.id}: missing source or code record`)
  assert.equal(layer.parentNodeId, node.parentNodeId, `${node.id}: parent`)
  assert.equal(layer.siblingOrder, node.siblingOrder, `${node.id}: sibling order`)
  assert.equal(target.rendered, node.rendered, `${node.id}: visibility`)
  assert.ok(copy.css.length, `${node.id}: Dev Mode read missing`)
  assert.ok(target.selector && !/pending|unresolved/.test(target.selector), `${node.id}: concrete selector missing`)
}
// Hidden children inherit the visible ancestor's Inspect CSS; native parameters retain their own exact properties.
assert.equal(inventory.nodes.filter(node => !node.rendered).length, 19)
for (const file of lock.files) {
  const digest = createHash('sha256').update(await readFile(join(dir, file.name))).digest('hex')
  assert.equal(digest, file.sha256, `${file.name}: source baseline changed`)
}
for (const asset of assets.assets) {
  assert.ok(ids.has(asset.nodeId), `${asset.nodeId}: unknown asset owner`)
  await access(join(process.cwd(), asset.projectPath.replace(/^\//, '')))
}
const html = await readFile(join(dir, 'source-frame-2026-09-29.html'), 'utf8')
for (const id of ids) assert.ok(html.includes(`data-figma-node="${id}"`), `${id}: baseline node missing`)
const qa = JSON.parse(await readFile(join(evidenceDir, 'source-map-results.json'), 'utf8'))
assert.equal(qa.nodes.length, 248)
assert.equal(qa.typography.length, 75)
assert.equal(qa.geometry.length, 17)
for (const record of qa.typography) {
  for (const property of ['fontSize', 'lineHeight', 'fontWeight', 'color']) {
    assert.equal(record.actual[property], record.expected[property], `${record.nodeId}: ${property}`)
  }
}
for (const record of qa.geometry) {
  for (const property of ['x', 'y', 'width', 'height']) {
    assert.ok(Math.abs(record.actual[property] - record.expected[property]) < .05, `${record.nodeId}: ${property}`)
  }
}
const states = JSON.parse(await readFile(join(evidenceDir, 'state-results.json'), 'utf8'))
assert.deepEqual(states.results.map(result => result.width), [1440, 1024, 768, 390])
assert.equal(states.errors.length, 0)
assert.equal(states.results[0].sourceChecks.length, 12, 'Matcher geometry, typography and foreground comparison evidence missing')
for (const result of states.results) {
  assert.equal(result.scrollWidth, result.width)
  assert.equal(result.broken.length, 0)
  for (const property of ['reset', 'empty', 'required', 'matching', 'focusTrap', 'focusRestore', 'escape', 'backdrop']) {
    assert.equal(result[property], true, `${result.width}: ${property} QA missing`)
  }
}
assert.equal(states.reduced.transform, 'none')
const geometry = JSON.parse(await readFile(join(evidenceDir, 'geometry.json'), 'utf8'))
assert.equal(geometry.results[0].height, 1822)
assert.equal(geometry.errors.length, 0)
assert.ok(geometry.results[2].changedPixelRatio < .02, 'Desktop pixel difference exceeds the reviewed 2% tolerance')
const sourceMtime = Math.max(...await Promise.all([
  'src/views/patient/CaseView.vue', 'src/components/layout/PatientLayout.vue',
  'src/components/layout/PatientHeader.vue', 'src/components/layout/PatientFooter.vue',
  'src/components/common/CountUpNumber.vue', 'src/assets/styles/main.css',
].map(async file => (await stat(file)).mtimeMs)))
for (const file of [
  'local-1440.png', 'local-390.png', 'source-map-results.json', 'state-results.json',
  ...states.results.flatMap(result => [`matcher-${result.width}.png`, `matcher-selected-${result.width}.png`, `empty-${result.width}.png`]),
]) {
  assert.ok((await stat(join(evidenceDir, file))).mtimeMs >= sourceMtime, `${file}: evidence predates the last UI edit; rerun QA`)
}
console.log(`cases source gate passed: 248 node records/mappings, 75 text checks, 17 geometry checks, ${assets.assets.length} source assets, 4 viewport interaction checks`)
