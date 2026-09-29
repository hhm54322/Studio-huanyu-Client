import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const dir=join(process.cwd(),'docs/figma-source/hospitals')
const json=async name=>JSON.parse(await readFile(join(dir,name),'utf8'))
const inventory=await json('native-inventory-2026-09-29.json')
const parameters=await json('native-parameters-2026-09-29.json')
const layers=await json('layers-2026-09-29.json')
const dev=await json('dev-mode-2026-09-29.json')
const mapping=await json('node-to-code-2026-09-29.json')
const assets=await json('assets.json')
const lock=await json('baseline-lock-2026-09-29.json')
for(const collection of [inventory.nodes,parameters.nodes,layers.nodes,dev.nodes,mapping.nodes])assert.equal(collection.length,566)
const ids=new Set(inventory.nodes.map(n=>n.id))
assert.equal(ids.size,566)
for(const node of inventory.nodes) {
  const value=parameters.nodes.find(n=>n.nodeId===node.id)
  const layer=layers.nodes.find(n=>n.id===node.id)
  const copy=dev.nodes.find(n=>n.nodeId===node.id)
  const target=mapping.nodes.find(n=>n.id===node.id)
  assert.ok(value&&copy&&target&&layer,`${node.id}: incomplete source coverage`)
  assert.equal(layer.parentNodeId,node.parentNodeId,`${node.id}: parent`)
  assert.equal(layer.siblingOrder,node.siblingOrder,`${node.id}: sibling order`)
  assert.ok(copy.css.length,`${node.id}: missing Dev CSS`)
  assert.ok(target.selector&&!/pending|unresolved/.test(target.selector),`${node.id}: invalid mapping`)
}
for(const file of lock.files)assert.equal(createHash('sha256').update(await readFile(join(dir,file.name))).digest('hex'),file.sha256,`${file.name}: source lock changed`)
for(const asset of assets.assets) {
  assert.ok(ids.has(asset.nodeId),`${asset.nodeId}: asset owner absent`)
  assert.ok(!asset.projectPath.includes(' through '))
  await access(join(process.cwd(),asset.projectPath.replace(/^\//,'')))
}
const html=await readFile(join(dir,'source-frame-2026-09-29.html'),'utf8')
for(const id of ids)assert.ok(html.includes(`data-figma-node="${id}"`),`${id}: absent from generated static baseline`)
const qa=JSON.parse(await readFile('docs/figma-verification/hospitals/2026-09-29/source-map-results.json','utf8'))
assert.equal(qa.nodes.length,566)
assert.equal(qa.geometry.length,15)
assert.equal(qa.typography.length,139)
for(const record of qa.typography) {
  for(const property of ['fontSize','lineHeight','fontWeight','color'])assert.equal(record.actual[property],record.expected[property],`${record.nodeId}: ${property}`)
}
const states=JSON.parse(await readFile('docs/figma-verification/hospitals/2026-09-29/state-results.json','utf8'))
assert.equal(states.results.length,4)
assert.equal(states.errors.length,0)
console.log(`hospitals source gate passed: 566 Layers/Dev CSS/parameters/mappings, 139 text checks, 15 geometry checks, ${assets.assets.length} assets, 4 viewport interaction checks`)
