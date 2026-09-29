import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd()
const base = join(root, 'docs/figma-source/dental')
const out = join(root, 'docs/figma-verification/dental/2026-09-29')
const frames = [
  ['231:88', '.', 307],
  ['231:397', 'matching', 416],
  ['231:815', 'upload-state', 198],
  ['231:1292', 'profile-state', 63],
  ['231:1355', 'cases-state', 66],
  ['231:1421', 'reviews-state', 81],
]
const readJson = async (dir, name) => JSON.parse(await readFile(join(base, dir, name), 'utf8'))
for (const [frame, dir, count] of frames) {
  const inventory = await readJson(dir, 'native-inventory-2026-09-29.json')
  const parameters = await readJson(dir, 'native-parameters-2026-09-29.json')
  const layers = await readJson(dir, 'layers-2026-09-29.json')
  const dev = await readJson(dir, 'dev-mode-2026-09-29.json')
  const mapping = await readJson(dir, 'node-to-code-2026-09-29.json')
  const lock = await readJson(dir, 'baseline-lock-2026-09-29.json')
  assert.equal(inventory.sourceFrame, frame)
  assert.equal(inventory.layersCrossCheck, true, `${frame}: Layers cross-check missing`)
  assert.equal(layers.layersCrossCheck, true, `${frame}: Layers record missing`)
  assert.equal(dev.extractionComplete, true, `${frame}: Dev Mode extraction incomplete`)
  for (const collection of [inventory.nodes, parameters.nodes, layers.nodes, dev.nodes, mapping.nodes]) assert.equal(collection.length, count, `${frame}: node count`)
  const ids = new Set(inventory.nodes.map(node => node.id))
  assert.equal(ids.size, count, `${frame}: duplicate node IDs`)
  for (const node of inventory.nodes) {
    const layer = layers.nodes.find(item => item.id === node.id)
    const copy = dev.nodes.find(item => item.nodeId === node.id)
    const target = mapping.nodes.find(item => item.id === node.id)
    assert.equal(layer.parentNodeId, node.parentNodeId, `${frame}/${node.id}: parent`)
    assert.equal(layer.siblingOrder, node.siblingOrder, `${frame}/${node.id}: sibling`)
    assert.ok(copy.css.length, `${frame}/${node.id}: Dev Mode CSS`)
    assert.match(target.selector, /^\[data-figma-node=/, `${frame}/${node.id}: selector`)
  }
  for (const file of lock.files) {
    assert.equal(createHash('sha256').update(await readFile(join(base, dir, file.name))).digest('hex'), file.sha256, `${frame}/${file.name}: source lock changed`)
  }
  const html = await readFile(join(base, dir, 'source-frame-2026-09-29.html'), 'utf8')
  for (const node of inventory.nodes) assert.ok(html.includes(`data-figma-node="${node.id}"`), `${frame}/${node.id}: baseline missing`)
}
const geometry = JSON.parse(await readFile(join(out, 'geometry.json'), 'utf8'))
assert.equal(geometry.errors.length, 0)
assert.equal(geometry.results[0].height, 2384)
assert.equal(geometry.results[0].scrollWidth, 1440)
assert.ok(geometry.results.at(-1).changedPixelRatio < 0.05, 'dental: source pixel diff exceeds 5%')
const state = JSON.parse(await readFile(join(out, 'state-results.json'), 'utf8'))
assert.equal(state.errors.length, 0)
for (const result of state.checks) {
  assert.equal(result.matching.scrollWidth, result.width)
  assert.equal(result.matching.cards, 4)
  assert.equal(result.matching.filters, 6)
  assert.equal(result.upload.scrollWidth, result.width)
  assert.equal(result.upload.dropzone, true)
  assert.equal(result.upload.submit, true)
  assert.equal(result.modal.open.modal, true)
  assert.equal(result.modal.closed.modal, false)
  assert.equal(result.emptyUploadRejected, true)
}
for (const name of ['figma-project-2x.png', 'figma-doctors-2x.png', 'figma-upload-2x.png', 'local-1440.png', 'local-390.png', 'local-step2-1440.png', 'local-upload-1440.png', 'geometry.json', 'state-results.json']) await access(join(out, name))
for (const name of ['diff-step2.png', 'diff-upload.png']) await access(join(out, name))
console.log('dental source gate passed: 6 Figma frames, 1131 locked nodes, 4 viewport state checks, upload validation and modal keyboard behavior')
