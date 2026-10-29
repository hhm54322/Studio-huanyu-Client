import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const directory = join(process.cwd(), 'docs/figma-source/why-china')
const json = async (name) => JSON.parse(await readFile(join(directory,name),'utf8'))
const inventory = await json('native-inventory-2026-09-29.json')
const parameters = await json('native-parameters-2026-09-29.json')
const mapping = await json('node-to-code-2026-10-29.json')
const lock = await json('baseline-lock-2026-09-29.json')
const assets = await json('assets.json')
assert.equal(inventory.nodeCount,778)
assert.equal(inventory.nodes.length,778)
assert.equal(parameters.nodes.length,778)
assert.equal(mapping.nodes.length,778)
const ids=new Set(inventory.nodes.map(node=>node.id))
assert.equal(ids.size,778)
const byParameter=new Map(parameters.nodes.map(node=>[node.nodeId,node.parameters]))
const byMapping=new Map(mapping.nodes.map(node=>[node.id,node]))
for(const node of inventory.nodes) {
  const parameter=byParameter.get(node.id)
  const target=byMapping.get(node.id)
  assert.ok(parameter&&target,`${node.id}: missing parameters or code mapping`)
  assert.equal(`${parameter.guid.sessionID}:${parameter.guid.localID}`,node.id)
  assert.equal(target.parentNodeId,node.parentNodeId,`${node.id}: incorrect parent`)
  assert.equal(target.siblingOrder,node.siblingOrder,`${node.id}: incorrect sibling order`)
  assert.equal(target.rendered,node.rendered,`${node.id}: incorrect visibility`)
  assert.ok(parameter.size&&parameter.transform,`${node.id}: missing geometry`)
  if(node.rendered)assert.ok(target.selector&&!/pending|unresolved/.test(target.selector),`${node.id}: missing exact selector`)
  else assert.ok(target.sourceHiddenAncestor,`${node.id}: hidden-node reason missing`)
  if(node.type==='TEXT')assert.ok(parameter.textData?.characters&&parameter.fontName&&parameter.lineHeight,`${node.id}: missing text parameters`)
}
for(const file of lock.files)assert.equal(createHash('sha256').update(await readFile(join(directory,file.name))).digest('hex'),file.sha256,`${file.name}: source lock no longer matches`)
for(const asset of assets.assets) {
  assert.ok(ids.has(asset.nodeId),`${asset.nodeId}: unknown asset owner`)
  await access(join(process.cwd(),asset.projectPath.replace(/^\//,'')))
}
const qa=JSON.parse(await readFile('artifacts/figma-why-china-2026-10-29-rerun/source-map-results.json','utf8'))
assert.equal(qa.nodes.length,778)
assert.ok(qa.geometry.length>=23)
assert.equal(qa.effects.length,6)
for(const effect of qa.effects)assert.equal(effect.actual,effect.expected,`${effect.nodeId}: incorrect shadow evidence`)
assert.equal(qa.typography.length,122)
for(const text of qa.typography) {
  for(const property of ['fontSize','lineHeight','fontWeight'])assert.ok(Math.abs(text.actual[property]-text.expected[property])<.01,`${text.nodeId}: incorrect ${property} evidence`)
  assert.equal(text.actual.color,text.expected.color,`${text.nodeId}: incorrect color evidence`)
}
console.log(`why-china source gate passed: 778 native parameters and mappings, locked source files, ${qa.geometry.length} geometry checks, ${qa.effects.length} shadow checks, ${qa.typography.length} typography checks, real assets`)
