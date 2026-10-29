import assert from 'node:assert/strict'
import {readFile,access,stat} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {join,dirname} from 'node:path'
const root=process.cwd(),dir=join(root,'docs/figma-source/hospitals')
const read=name=>readFile(join(dir,name),'utf8')
const json=async name=>JSON.parse(await read(name))
const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
const lock=await json('baseline-lock-2026-10-20.json')
assert.equal(lock.counts.length,22,'Missing hospital source/state set')
for(const file of lock.files)assert.equal(digest(await read(file.name)),file.sha256,`${file.name}: source lock mismatch`)
let count=0
for(const file of lock.files.filter(file=>/(?:^|\/)node-to-code-2026-10-20\.json$/.test(file.name))){
  const folder=dirname(file.name),at=name=>join(folder,`${name}-2026-10-20.json`)
  const [inventory,parameters,layers,dev,mapping,check,tree]=await Promise.all(['native-inventory','native-parameters','ui-layers','dev-mode','node-to-code','layers-crosscheck','source-tree'].map(name=>json(at(name))))
  assert.equal(check.layersCrossCheck,true,`${folder}: Layers not cross-checked`)
  assert.deepEqual(check.mismatch,[],`${folder}: Layers mismatch`)
  assert.equal(tree.sourceSHA256,inventory.sourceSHA256)
  const html=await read(join(folder,'baseline-2026-10-20.html'))
  const params=new Map(parameters.nodes.map(node=>[node.nodeId,node]))
  const copied=new Map(dev.nodes.map(node=>[node.nodeId,node]))
  const ui=new Map(layers.nodes.map(node=>[node.nodeId,node]))
  const targets=new Map(mapping.nodes.map(node=>[node.nodeId,node]))
  assert.equal(new Set(inventory.nodes.map(node=>node.id)).size,inventory.nodeCount)
  for(const node of inventory.nodes){
    const p=params.get(node.id),c=copied.get(node.id),l=ui.get(node.id),t=targets.get(node.id)
    assert.ok(p&&c&&l&&t,`${node.id}: missing exact source/Dev copy/mapping`)
    assert.equal(l.name,node.name,`${node.id}: layer name`)
    assert.equal(l.level,node.level,`${node.id}: layer depth`)
    assert.equal(t.parentNodeId,l.parentNodeId??node.parentNodeId,`${node.id}: parent`)
    assert.equal(t.siblingOrder,node.siblingOrder,`${node.id}: sibling order`)
    assert.equal(p.parameters.name,node.name,`${node.id}: parameter owner`)
    if(t.rendered){
      assert.ok(c.implemented&&c.code?.length&&c.code.every(code=>!code.includes('[Truncated]')),`${node.id}: incomplete Dev Mode copy`)
      assert.ok(t.component&&t.selector&&t.ownerNodeId,`${node.id}: missing implementation owner`)
      assert.ok(html.includes(`data-figma-node="${t.ownerNodeId}"`),`${node.id}: absent static owner`)
    }
  }
  count+=inventory.nodes.length
}
assert.equal(count,3719)
const assets=await json('assets-2026-10-20.json')
for(const asset of assets.assets){
  const file=join(root,asset.projectPath.replace(/^\//,''));await access(file)
  if(asset.sha256){const bytes=await readFile(file);assert.ok(digest(bytes)===asset.sha256||file.endsWith('.svg')&&digest(bytes.toString().trimEnd())===asset.sha256,`${asset.nodeId}: asset hash mismatch`)}
}
const evidence=join(root,'artifacts/figma-hospitals-2026-10-29')
const report=async name=>JSON.parse(await readFile(join(evidence,name),'utf8'))
const list=await report('list-qa.json'),detail=await report('detail-qa.json'),behavior=await report('behavior-qa.json'),motion=await report('motion-qa.json')
assert.deepEqual(list.map(result=>result.width),[1440],'This batch verifies desktop only')
for(const result of list){
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.geometry.images,[])
  assert.equal(result.geometry.scrollWidth,result.width)
  for(const section of result.sections)assert.ok(section.nmae<1,`${section.section}: screenshot nMAE ${section.nmae}%`)
}
assert.equal(detail.results.length,1)
for(const result of detail.results){
  assert.deepEqual(result.errors,[]);assert.ok(result.initial<1);assert.ok(result.closedAfterEscape)
  assert.equal(result.tabs.length,6)
  for(const tab of result.tabs)assert.ok(tab.full<1&&tab.content<1,`${tab.name}: screenshot nMAE exceeds 1%`)
}
assert.deepEqual(behavior.results.map(result=>result.width),[1024,1440,1920])
assert.deepEqual(behavior.errors,[])
for(const result of behavior.results){
  assert.equal(result.filters.length,5);assert.equal(result.filters[0].count,52)
  assert.ok(result.consultation&&result.navigation)
  assert.equal(result.details.filter(item=>item.tab).length,6)
  for(const item of result.details.filter(item=>item.tab))assert.deepEqual(item.atTop,[])
}
assert.equal(motion.shortScreens.length,2)
assert.deepEqual(motion.errors,[])
for(const passed of Object.values(motion.motion))assert.equal(passed,true)
const codeFiles=['src/views/patient/HospitalView.vue','src/components/common/HospitalFigmaCanvas.vue','src/components/common/HospitalSourceDialog.vue','src/components/common/HospitalRadar.vue','src/components/common/HomeSourceNode.vue','src/data/hospitalFigmaSource.ts','src/components/layout/PatientLayout.vue']
const changed=Math.max(...await Promise.all(codeFiles.map(async file=>(await stat(join(root,file))).mtimeMs)))
for(const name of ['list-qa.json','detail-qa.json','behavior-qa.json','motion-qa.json'])assert.ok((await stat(join(evidence,name))).mtimeMs>=changed,`${name}: evidence predates code`)
console.log(`Hospital desktop revision gate passed: 22 locked source sets / ${count} native nodes / ${assets.assets.length} assets; list + 7 detail states nMAE <1%; 3 desktop widths; interactions, short screens, motion and reduced-motion. Mobile development/acceptance deferred by user.`)
