import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root=process.cwd(), date='2026-11-03'
const source=join(root,`docs/figma-source/dental-pages-${date}`)
const evidence=join(root,'artifacts/dental-page-20261103')
const read=async file=>JSON.parse(await readFile(file,'utf8'))
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex')
const all=node=>[node,...node.children.flatMap(all)]
const frames={profile:'3421:2534',treatment:'3421:2810',cases:'3421:3113',reviews:'3421:3380',services:'3421:3698',scroll:'3423:4315','case-detail':'3423:5936'}
const lock=await read(join(source,`baseline-lock-${date}.json`))
for(const file of lock.files) assert.equal(await hash(join(source,file.name)),file.sha256,`Changed source baseline: ${file.name}`)
let nodeCount=0
for(const [folder,id]of Object.entries(frames)) {
  const base=join(source,folder)
  const inventory=await read(join(base,`native-inventory-${date}.json`))
  const cross=await read(join(base,`layers-crosscheck-${date}.json`))
  const dev=await read(join(base,`dev-mode-${date}.json`))
  const mapping=await read(join(base,`node-to-code-${date}.json`))
  const parameters=await read(join(base,`native-parameters-${date}.json`))
  const tree=await read(join(base,`source-tree-${date}.json`))
  assert.equal(inventory.sourceFrame,id)
  assert.equal(cross.layersCrossCheck,true)
  assert.deepEqual(cross.mismatch,[])
  assert.deepEqual(cross.extraDeviceNodes,[])
  const ids=inventory.nodes.map(n=>n.id).sort()
  for(const [label,nodes,key]of [['Dev Mode',dev.nodes,'nodeId'],['mapping',mapping.nodes,'nodeId'],['parameters',parameters.nodes,'nodeId']]) {
    assert.deepEqual(nodes.map(n=>n[key]).sort(),ids,`${folder}: incomplete ${label} coverage`)
  }
  const rendered=new Map(all(tree.root).map(node=>[node.id,node]))
  for(const entry of mapping.nodes) {
    assert.ok(entry.component&&entry.selector,`${entry.nodeId}: concrete mapping required`)
    assert.equal(entry.devModeNodeId,entry.nodeId)
    const owner=rendered.get(entry.ownerNodeId)
    assert.ok(owner,`${entry.nodeId}: missing rendered owner`)
    if(entry.ownerNodeId!==entry.nodeId) {
      assert.equal(entry.mode,'Exact SVG ownership')
      assert.ok(owner.svg,`${entry.nodeId}: SVG descendant must retain its exported SVG`)
    }
  }
  nodeCount+=ids.length
}
assert.equal(nodeCount,1644)
const assets=await read(join(source,`assets-${date}.json`))
for(const asset of assets.assets) {
  const file=join(root,asset.projectPath.replace(/^\//,''))
  await access(file)
  // The export manifest hashes the Dev Mode SVG string; file serialization
  // adds a single terminating newline. Validate that exact representation.
  if(asset.sha256)assert.equal(createHash('sha256').update((await readFile(file,'utf8')).replace(/\n$/,'')).digest('hex'),asset.sha256,asset.nodeId)
}
const comparison=await read(join(evidence,'final-source-comparison.json'))
assert.equal(comparison.baseline.sha256,'226e87c1db70c194a959bf0a74a5549f8592ed6d2f6b02fe2031adadd71d02cc')
for(const exportInfo of [comparison.baseline,comparison.current])assert.equal(await hash(exportInfo.file),exportInfo.sha256)
assert.ok(Date.now()-Date.parse(comparison.current.exportedAt)<24*60*60*1000,'Current official source export is stale')
for(const id of Object.values(frames)) {
  const scope=comparison.scopes.find(item=>item.rootId===id)
  assert.equal(scope?.status,'unchanged',id)
  for(const field of ['addedIds','removedIds','changedIds','alternatives','dependencyChanges','unresolvedImages','unresolvedBlobs','integrityErrors'])assert.deepEqual(scope[field],[],`${id}: ${field}`)
}
// The comparator scans the whole file. Any changes outside these scopes must
// remain explicit: the separately inspected Xu Yu profile is not dental.
assert.ok(comparison.changed.every(node=>node.sourceId==='3423:5659'))
assert.deepEqual(comparison.added,[]);assert.deepEqual(comparison.removed,[])
const supplements=await read(join(root,'src/data/dentalCaseSupplements.json'))
assert.equal(supplements.records.length,20);assert.equal(supplements.portraits.length,6)
assert.equal(new Set(supplements.records.map(item=>item.id)).size,20)
for(const [index,item]of supplements.records.entries()) {
  assert.equal(item.number,index+1)
  assert.equal(item.doctorId,index<18?101+Math.floor(index/3):5)
  assert.ok(item.title&&item.description&&item.images.length)
  for(const image of item.images)for(const src of [image.src,image.thumbnail])await access(join(root,'public',src))
}
for(const sourceFile of supplements.sources)assert.equal(await hash(join(root,sourceFile.path)),sourceFile.sha256)
for(const portrait of supplements.portraits)assert.equal(await hash(join(root,portrait.projectPath)),portrait.sha256)

for(const folder of ['qa','production-qa']) {
  const qa=await read(join(evidence,folder,'qa.json'))
  assert.equal(qa.doctors.length,7)
  for(const doctor of qa.doctors)for(const field of ['allTabs','caseContent','defaultCollapsed','zoomEscape','institution','keyboard'])assert.equal(doctor[field],true)
  assert.ok(qa.doctors.every(doctor=>doctor.caseCount===3))
  assert.equal(qa.layouts.length,3)
  assert.ok(qa.layouts.every(layout=>layout.noOverflow))
  assert.equal(qa.mobile.length,2)
  assert.ok(qa.mobile.every(item=>item.existingFlow&&item.detailRedirect&&item.noOverflow))
  assert.ok(Object.values(qa.navigation).every(Boolean))
  assert.equal(qa.realDataSent,false)
  assert.deepEqual(qa.errors,[]);assert.deepEqual(qa.failedAssets,[])
  assert.equal(qa.visual.length,7)
  for(const check of qa.visual) {
    assert.ok(check.nMAE<.01&&check.pixelmatch<.01,`${folder}/${check.name}: >=1% visual difference`)
    await access(check.figma);await access(check.local)
  }
  for(const [file,expected]of Object.entries(qa.codeSHA256))assert.equal(await hash(join(root,file)),expected,`${folder}: stale QA for ${file}`)
}
console.log(`Dental desktop doctor pages passed: ${Object.keys(frames).length} source frames, ${nodeCount} nodes, 7 doctors, 21 cases; dev/production screenshot and behavior checks passed. Mobile design remains frozen.`)
