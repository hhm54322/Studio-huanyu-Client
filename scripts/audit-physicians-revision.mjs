import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd()
const sourceDir = join(root, 'docs/figma-source/physicians/revision-2026-10-29')
const evidenceDir = join(root, 'artifacts/figma-physicians-2026-10-29')
const read = async file => JSON.parse(await readFile(join(sourceDir, file), 'utf8'))
const sourceFile = '/Users/hhm/Downloads/寰宇云医 (9).fig'
const sourceSHA = 'b81bbd3eb95eb33a7a2db2d313f7f6e326e24ce2ad5a1c6c5e82d618308d081e'
assert.equal(createHash('sha256').update(await readFile(sourceFile)).digest('hex'), sourceSHA, 'official current Figma export changed')
const inventory = await read('native-inventory-2026-10-29.json')
const layers = await read('ui-layers-2026-10-29.json')
const dev = await read('dev-mode-2026-10-29.json')
const mapping = await read('node-to-code-2026-10-29.json')
const lock = await read('baseline-lock-2026-10-29.json')
assert.equal(inventory.sourceSHA256, sourceSHA)
const crosscheck = await read('layers-crosscheck-2026-10-29.json')
assert.equal(crosscheck.layersCrossCheck, true)
assert.deepEqual(crosscheck.mismatch, [])
assert.equal(inventory.nodes.length, 306); assert.equal(layers.nodes.length, 306); assert.equal(dev.nodes.length, 306); assert.equal(mapping.nodes.length, 306)
const ids = new Set(inventory.nodes.map(n => n.id)); assert.equal(ids.size, 306)
for (const node of inventory.nodes) {
  const layer = layers.nodes.find(n => n.nodeId === node.id), copy = dev.nodes.find(n => n.nodeId === node.id), target = mapping.nodes.find(n => n.nodeId === node.id)
  assert.ok(layer && copy && target, `${node.id}: complete source record missing`)
  assert.equal(layer.parentNodeId, node.parentNodeId, `${node.id}: parent mismatch`)
  assert.equal(layer.level, node.level, `${node.id}: level mismatch`)
  assert.equal(target.rendered, node.rendered, `${node.id}: visibility mismatch`)
  assert.ok(copy.code?.length, `${node.id}: Dev Mode code missing`)
  assert.ok(target.selector && !/pending|unresolved/i.test(target.selector), `${node.id}: concrete selector missing`)
}
for (const file of lock.files) assert.equal(createHash('sha256').update(await readFile(join(sourceDir, file.name))).digest('hex'), file.sha256, `${file.name}: source lock changed`)
const assets = await read('assets-2026-10-29.json'); for (const asset of assets.assets) await access(join(root, asset.projectPath.replace(/^\//, '')))
const qa = JSON.parse(await readFile(join(evidenceDir, 'source-qa.json'), 'utf8'))
assert.equal(qa.owners.length, 306); assert.equal(qa.geometry.height, 1790); assert.equal(qa.geometry.scrollWidth, 1440); assert.deepEqual(qa.geometry.broken, [])
assert.ok(qa.nMAE < .01); assert.ok(qa.changedPixelRatio < .01); assert.deepEqual(qa.errors, [])
const behavior = JSON.parse(await readFile(join(evidenceDir, 'behavior-qa.json'), 'utf8'))
assert.equal(behavior.filterResults.length, 6); assert.equal(behavior.dialogResults.length, 5); assert.equal(behavior.hospitalEntry, true); assert.equal(behavior.keyboardMenu, true); assert.deepEqual(behavior.errors, [])
for (const file of ['local-1440.png','local-1440-2x.png','revision-2026-10-29-figma.png','source-qa.json','behavior-qa.json']) await access(join(evidenceDir, file))
const changed = Math.max(...await Promise.all(['src/views/patient/PhysicianView.vue','src/data/physicianFigmaSource.ts','src/components/layout/PatientLayout.vue','src/components/layout/PatientHeader.vue','src/data/hospitalFigmaSource.ts'].map(async file => (await stat(join(root,file))).mtimeMs)))
for (const file of ['local-1440.png','source-qa.json','behavior-qa.json']) assert.ok((await stat(join(evidenceDir,file))).mtimeMs >= changed, `${file}: evidence predates implementation`)
console.log(`physicians source gate passed: 306 Layers/Dev Mode mappings, ${assets.assets.length} exact assets, <1% desktop comparison and filter/dialog/navigation behavior evidence`)
