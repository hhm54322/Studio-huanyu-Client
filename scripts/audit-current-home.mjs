import assert from 'node:assert/strict'
import { readFile, stat, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import sourceGate from './figma-source-gate.cjs'
const read=async file=>JSON.parse(await readFile(file,'utf8')),hash=bytes=>createHash('sha256').update(bytes).digest('hex')
sourceGate.assertPageCurrent('home')
for(const [base,date] of [['docs/figma-source/home','2026-10-19'],['docs/figma-source/home/revision-2026-10-28','2026-10-28']]){
 const lock=await read(`${base}/baseline-lock-${date}.json`);for(const file of lock.files)assert.equal(hash(await readFile(`${base}/${file.name}`)),file.sha256,`Source lock changed: ${base}/${file.name}`)
 for(const entry of lock.files.filter(f=>/node-to-code.*\.json$/.test(f.name))){
  const prefix=entry.name.replace(/node-to-code.*$/,''),suffix=entry.name.includes('node-to-code-mobile')?'-mobile':''
  const get=kind=>read(`${base}/${prefix}${kind}${suffix}-${date}.json`)
  const [inventory,parameters,layers,dev,mapping,check]=await Promise.all(['native-inventory','native-parameters','ui-layers','dev-mode','node-to-code','layers-crosscheck'].map(get))
  assert.equal(check.layersCrossCheck,true);assert.deepEqual(check.mismatch,[])
  for(const collection of [parameters.nodes,layers.nodes,dev.nodes,mapping.nodes]) assert.ok(collection.length>=inventory.nodes.length)
  const maps=[parameters.nodes,layers.nodes,dev.nodes,mapping.nodes].map(rows=>new Map(rows.map(row=>[row.nodeId,row])))
  const layerParents=new Map(), stack=[]
  for(const layer of layers.nodes){while(stack.length>layer.level)stack.pop();layerParents.set(layer.nodeId,stack.at(-1)?.nodeId??null);stack.push(layer)}
  for(const node of inventory.nodes){const [p,l,d,m]=maps.map(map=>map.get(node.id));assert.ok(p&&l&&d&&m,`Missing ${node.id}`);assert.equal(p.parameters.name,node.name);assert.equal(l.name,node.name);assert.equal(layerParents.get(node.id),node.parentNodeId??null);assert.equal(m.siblingOrder,node.siblingOrder);if(m.rendered)assert.ok(d.implemented&&d.code?.length&&d.code.every(code=>!code.includes('[Truncated]'))&&m.ownerNodeId&&m.selector&&m.component)}
 }
 const assets=await read(`${base}/assets-${date}.json`);for(const a of assets.assets)await access(a.projectPath.replace(/^\//,''))
}
const out='artifacts/figma-home-2026-10-28'
const modified=Math.max(...await Promise.all(['src/components/layout/PatientHeader.vue','src/components/common/HomeHeroSection.vue','src/components/common/HomePatientStories.vue','src/components/common/HomeSourceDialog.vue','src/data/homeFigmaSource.ts','src/data/homeFigmaActions.ts','src/views/patient/HomeView.vue'].map(async f=>(await stat(f)).mtimeMs)))
const visual=async item=>{const v=typeof item.visual==='object'?item.visual:typeof item.diff==='object'?item.diff:item;assert.ok(v.nMAE<1&&v.pixelmatchPercent<1,`Screenshot exceeds 1%: ${v.local}`);await access(v.local);await access(v.panelReference||v.reference);assert.ok((await stat(v.local)).mtimeMs>=modified,`Stale screenshot: ${v.local}`)}
for(const name of ['hero','page','states','dialogs','experts','interactions','site','behavior']){
 const r=await read(`${out}/${name}/qa.json`);assert.deepEqual(r.errors ?? [],[]);assert.ok(Date.parse(r.createdAt)>=modified,`Evidence predates code: ${name}`)
 if(name==='hero'){assert.deepEqual(r.results.map(x=>x.width),[1024,1440,1920]);for(const row of r.results){for(const value of Object.values(row.checks))assert.equal(value,true);if(row.visual){assert.deepEqual(row.visual.missing,[]);await visual(row.visual)}}}
 if(name==='page'){assert.equal(r.results.length,1);assert.equal(r.results[0].width,1440);assert.equal(r.results[0].sections.length,13);for(const row of r.results[0].sections)await visual(row)}
 if(name==='states'){assert.equal(r.results.length,9);for(const row of r.results)await visual(row);assert.equal(r.independentFaq,true)}
 if(name==='dialogs'){assert.equal(r.results.length,7);for(const row of r.results){assert.equal(row.closed,true);await visual(row)}}
 if(name==='experts'){assert.equal(r.results.length,15);for(const row of r.results){assert.deepEqual(row.missingOwners,[]);await visual(row)}}
 if(name==='interactions'){assert.equal(r.results.length,3);for(const value of Object.values(r.motion))if(typeof value==='boolean')assert.equal(value,true)}
 if(name==='site'){for(const row of r.results){assert.deepEqual(row.missingSourceOwners,[]);assert.equal(row.hero.length,4);assert.equal(row.flow.length,4);assert.equal(row.consultation,true)};for(const value of Object.values(r.motion))if(typeof value==='boolean')assert.equal(value,true)}
 if(name==='behavior')for(const value of Object.values(r.playback))assert.equal(value,true)
}
const photoSource='artifacts/figma-home-corrections-2026-10-29/sources'
const photoLock=await read(`${photoSource}/baseline-lock-2026-10-29.json`)
for(const file of photoLock.files) assert.equal(hash(await readFile(`${photoSource}/${file.name}`)),file.sha256,`Photo source changed: ${file.name}`)
const photoTrees=await read('docs/figma-source/home/story-carousel/source-trees-2026-10-29.json')
assert.equal(photoTrees.sets.length,8)
sourceGate.assertCurrentSource({roots:photoTrees.sets.map(s=>s.sourceFrame),baselineSHA256:photoTrees.sourceSHA256,reportFile:'artifacts/figma-source-gate/current-home-photos.json'})
for(const source of photoTrees.sets) {
 const original=await read(`${photoSource}/${source.sourceFrame.replace(':','-')}/source-tree-2026-10-29.json`)
 assert.deepEqual(source,original,'Runtime photo tree differs from its extracted baseline')
}
const correction=await read('artifacts/figma-home-corrections-2026-10-29/verification/qa.json')
assert.ok(Date.parse(correction.createdAt)>=modified,'Stale photo/wide-screen verification')
assert.deepEqual(correction.errors,[])
assert.equal(correction.constantPatient,true)
assert.equal(correction.focusAndScrollRestore,true)
assert.deepEqual(correction.photos.map(p=>p.source),['1466:843','1412:5862','1466:848','1466:850','1466:852','1407:20','1466:856','1466:865','1466:866','1466:867'])
for(const photo of correction.photos)await visual(photo)
await visual(correction.bottom.visual)
assert.equal(correction.bottom.inset,32)
for(const value of Object.values(correction.detailPlayback))assert.equal(value,true)
assert.equal(correction.heroes.length,16)
for(const hero of correction.heroes){assert.ok(Math.abs(hero.x)<=1&&Math.abs(hero.widthRendered-hero.width)<=1);assert.equal(hero.transparentHeader,true);assert.equal(hero.noOverflow,true)}
console.log('Home current desktop gate: complete source locks and per-node records; all current page/state screenshots <1%; 3 desktop widths; hover, fixed assistant, navigation, independent accordion, modal, ECharts, scroll, autoplay and reduced-motion checks pass. Mobile deferred by user.')
