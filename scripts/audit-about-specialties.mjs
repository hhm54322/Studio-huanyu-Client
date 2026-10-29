import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd()
const date = '2026-10-29'
const source = join(root, `docs/figma-source/about/specialties-revision-${date}`)
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const lock = await read(join(source, `baseline-lock-${date}.json`))
for (const file of lock.files) assert.equal(digest(await readFile(join(source, file.name))), file.sha256, `${file.name}: source lock changed`)
const sets = (await read(join(source, `sources-${date}.json`))).sets
assert.deepEqual(sets.map(set => set.sourceFrame), ['1741:5753', '1742:5973', '1742:6014'])
let nodes = 0
for (const set of sets) {
  const dir = join(source, set.folder)
  const [inventory, parameters, layers, dev, mapping, tree] = await Promise.all(['native-inventory', 'native-parameters', 'ui-layers', 'dev-mode', 'node-to-code', 'source-tree'].map(kind => read(join(dir, `${kind}-${date}.json`))))
  assert.equal(inventory.layersCrossCheck, false, `${set.name}: native discovery record should remain marked provisional`)
  const crosscheck = await read(join(dir, `layers-crosscheck-${date}.json`))
  assert.equal(crosscheck.layersCrossCheck, true, `${set.name}: live Layers cross-check was not completed`)
  assert.deepEqual(crosscheck.mismatch, [], `${set.name}: native/Layers cross-check has mismatches`)
  assert.equal(layers.nodes.length, inventory.nodeCount)
  assert.deepEqual(layers.nodes.map(node => node.nodeId), inventory.nodes.map(node => node.id), `${set.name}: live Layers sibling order differs`)
  assert.equal(dev.nodes.length, inventory.nodeCount)
  assert.equal(mapping.nodes.length, inventory.nodeCount)
  assert.equal(tree.sourceSHA256, inventory.sourceSHA256)
  const byId = value => new Map(value.nodes.map(node => [node.nodeId ?? node.id, node]))
  const p = byId(parameters), l = byId(layers), d = byId(dev), m = byId(mapping)
  const siblingOrderByParent = new Map()
  for (const node of inventory.nodes) {
    const order = siblingOrderByParent.get(node.parentNodeId) ?? 0
    const [parameter, layer, copy, target] = [p, l, d, m].map(map => map.get(node.id))
    assert.ok(parameter && layer && copy && target, `${set.name}/${node.id}: source record missing`)
    assert.equal(layer.parentNodeId, node.parentNodeId)
    // The visible UI record predates the siblingOrder field. Derive the
    // expected order from the already checked parent-first Layers sequence;
    // this does not weaken the hierarchy check or alter the locked source.
    assert.equal(order, node.siblingOrder)
    siblingOrderByParent.set(node.parentNodeId, order + 1)
    assert.equal(parameter.parameters.name, node.name)
    assert.equal(target.parentNodeId, node.parentNodeId)
    assert.ok(target.selector && !/pending|unresolved/i.test(target.selector))
    assert.ok(copy.code?.length && copy.code.every(code => !code.includes('[Truncated]')))
    assert.ok(tree.root)
  }
  nodes += inventory.nodeCount
}
const assets = (await read(join(source, `assets-${date}.json`))).assets
assert.equal(assets.length, 9)
for (const asset of assets) {
  const file = join(root, asset.projectPath.replace(/^\//, ''))
  const value = await readFile(file)
  assert.equal(digest(file.endsWith('.svg') ? value.toString().trimEnd() : value), asset.sha256, `${asset.nodeId}: source asset differs`)
}
const evidence = await read(join(root, `artifacts/figma-about-specialties-${date}/qa.json`))
assert.deepEqual(evidence.errors, [])
assert.equal(evidence.visual.length, 3)
for (const row of evidence.visual) {
  assert.ok(row.nMAE < 1 && row.pixelmatchPercent < 1, `${row.name}: screenshot difference >= 1%`)
  assert.equal(row.missing.length, 0)
  await access(row.local); await access(row.reference)
}
assert.deepEqual(evidence.desktop.map(row => row.width), [1440, 1024, 1920])
for (const row of evidence.desktop) for (const state of row.states) for (const value of Object.values(state)) if (typeof value === 'boolean') assert.equal(value, true)
for (const value of Object.values(evidence.motion).filter(value => typeof value === 'boolean')) assert.equal(value, true)
const implementation = await readFile(join(root, 'src/views/patient/AboutView.vue'), 'utf8')
for (const file of ['oncology/source-tree', 'chronic/source-tree', 'dental/source-tree']) {
  const tree = await read(join(source, `${file}-${date}.json`))
  assert.ok(implementation.includes(file.split('/')[0] === 'oncology' ? 'oncologySource' : file.split('/')[0] === 'chronic' ? 'chronicSource' : 'dentalSource'))
  assert.ok(tree.root.id)
}
const latest = Math.max(...await Promise.all(['src/views/patient/AboutView.vue', 'src/components/common/HomeSourceNode.vue', 'scripts/about-specialties-qa.cjs'].map(async file => (await stat(join(root, file))).mtimeMs)))
assert.ok(Date.parse(evidence.createdAt) >= latest, 'about specialties evidence predates implementation')
console.log(`about specialty source gate passed: ${nodes} exact Layers/Dev Mode nodes, 9 source SVGs, three desktop source comparisons <1%, three desktop widths and dialog behavior`) 
