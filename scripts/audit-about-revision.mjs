import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd()
const date = '2026-10-22'
const source = join(root, 'docs/figma-source/about')
const revision = join(source, 'complex-revision')
const evidence = join(root, 'artifacts/figma-regression-2026-10-22/about')
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const at = (base, kind) => join(base, `${kind}-${date}.json`)

// Reuse the existing complete page baseline. This regression does not claim
// that the optional, partial 402-row Dev Mode refresh is a new full extraction.
const [main, live, old] = await Promise.all([
  read(at(evidence, 'native-inventory')),
  read(at(evidence, 'ui-layers')),
  read(join(source, '2026-09-28-extraction.json')),
])
assert.equal(main.sourceFrame, '484:1703')
assert.equal(main.nodeCount, 792)
assert.equal(live.nodes.length, main.nodeCount)
for (const [index, n] of main.nodes.entries()) {
  const l = live.nodes[index]
  for (const [field, expected] of Object.entries({ nodeId: n.id, name: n.name, level: n.level, parentNodeId: n.parentNodeId })) {
    assert.equal(l[field], expected, `484:1703/${n.id}: current live Layers ${field} differs`)
  }
}
const oldIds = new Set(old.rows.map(n => n.id))
const currentIds = new Set(main.nodes.map(n => n.id))
assert.deepEqual([...currentIds].filter(id => !oldIds.has(id)), [], 'New page nodes require source extraction')
assert.deepEqual([...oldIds].filter(id => !currentIds.has(id)), ['484:2100', '484:2101', '484:2102', '484:2103', '484:2104', '484:2105'])
for (const file of ['frame.html', 'styles.txt', 'native-css-2026-09-28.json', 'detail-native-css-2026-09-28.json', 'complex-detail.html', 'assets.json']) await access(join(source, file))

const lockFile = at(revision, 'baseline-lock')
const lock = await read(lockFile)
assert.equal(lock.sourceFrame, '484:2501')
for (const file of lock.files) assert.equal(hash(await readFile(join(root, file.name))), file.sha256, `${file.name}: source lock changed`)
const [inventory, parameters, layers, dev, mapping, assets] = await Promise.all(
  ['native-inventory', 'native-parameters', 'ui-layers', 'dev-mode', 'node-to-code', 'assets'].map(kind => read(at(revision, kind))),
)
assert.equal(inventory.nodeCount, 67)
assert.equal(inventory.layersCrossCheck, true)
assert.equal(inventory.sourceSHA256, main.sourceSHA256)
for (const collection of [parameters.nodes, layers.nodes, dev.nodes, mapping.nodes]) assert.equal(collection.length, 67)
const maps = [parameters, layers, dev, mapping].map(set => new Map(set.nodes.map(n => [n.nodeId, n])))
const html = await readFile(join(revision, `baseline-${date}.html`), 'utf8')
const implementation = await readFile(join(root, 'src/views/patient/AboutView.vue'), 'utf8')
const inventoryById = new Map(inventory.nodes.map(n => [n.id, n]))
for (const n of inventory.nodes) {
  const [p, l, d, m] = maps.map(map => map.get(n.id))
  assert.ok(p && l && d && m, `${n.id}: parameter/Dev/mapping missing`)
  assert.equal(p.parameters.name, n.name)
  for (const entry of [l, d, m]) {
    assert.equal(entry.name, n.name)
    assert.equal(entry.parentNodeId, n.parentNodeId)
  }
  assert.equal(m.siblingOrder, n.siblingOrder)
  assert.equal(m.rendered, n.rendered)
  if (!html.includes(`data-figma-node="${n.id}"`)) {
    // SVG paths remain inside the exact exported SVG rather than separate DOM
    // nodes. Accept only a verified SVG ancestor with the same concrete owner.
    let owner = inventoryById.get(n.parentNodeId)
    while (owner && !assets.assets.some(a => a.nodeId === owner.id && a.projectPath.endsWith('.svg'))) owner = inventoryById.get(owner.parentNodeId)
    assert.ok(owner && html.includes(`data-figma-node="${owner.id}"`), `${n.id}: absent from static baseline and exact SVG owner`)
    assert.equal(m.selector, maps[3].get(owner.id).selector, `${n.id}: SVG owner selector differs`)
  }
  if (n.rendered) {
    assert.equal(d.implemented, true)
    assert.equal(d.settleWaitMs, 250)
    assert.ok(Date.parse(d.selectedAt) < Date.parse(lock.lockedAt), `${n.id}: Dev copy must precede baseline lock`)
    assert.ok(d.sourceUrl.includes(`node-id=${n.id.replace(':', '-')}`), `${n.id}: wrong selected node URL`)
    assert.ok(d.code.length && d.code.every(css => !css.includes('[Truncated]')), `${n.id}: incomplete Dev CSS/SVG`)
    assert.equal(m.component, 'src/views/patient/AboutView.vue')
    assert.ok(m.selector?.length && !/pending|unresolved|repeated child/i.test(m.selector), `${n.id}: non-specific owner`)
  } else assert.equal(m.selector, null)
}
assert.equal(inventory.nodes.filter(n => n.rendered).length, 54)
assert.equal(assets.assets.length, 9)
for (const a of assets.assets) {
  assert.equal(hash(await readFile(join(root, a.projectPath))), a.sha256, `${a.nodeId}: asset changed`)
  assert.ok(implementation.includes(a.projectPath.replace(/^public/, '')), `${a.nodeId}: asset not wired to Vue`)
}
assert.equal(assets.assets.find(a => a.nodeId === '484:2537').imageHash, 'd7855bf39889dffd0c1949ace7f19773ad14464d', 'Dental must not reuse chronic-care image')

// Detail was not redesigned; all 91 nodes were nevertheless rechecked in the
// live Dev panel, and the existing detailed HTML/CSS remains the implementation input.
const detailBase = join(evidence, 'complex-detail')
const [detailInventory, detailLayers, detailDev] = await Promise.all(
  ['native-inventory', 'ui-layers', 'dev-mode'].map(kind => read(at(detailBase, kind))),
)
assert.equal(detailInventory.nodeCount, 91)
assert.equal(detailLayers.nodes.length, 91)
assert.equal(detailDev.nodes.length, 91)
for (const [index, n] of detailInventory.nodes.entries()) {
  const l = detailLayers.nodes[index], d = detailDev.nodes[index]
  for (const entry of [l, d]) {
    assert.equal(entry.nodeId, n.id)
    assert.equal(entry.name, n.name)
    assert.equal(entry.parentNodeId, n.parentNodeId)
  }
  if (n.rendered) assert.ok(d.settleWaitMs === 250 && d.code.length, `${n.id}: detail Dev copy missing`)
}
console.log('about: existing page baseline + current 792-node Layers/native check; revised section 67 nodes/9 assets fully locked; detail 91-node Dev review pass')

const visualReports = await Promise.all(['final', 'production'].map(phase => read(join(evidence, `${phase}-qa.json`))))
const behaviorReports = await Promise.all(['development', 'production'].map(phase => read(join(evidence, `${phase}-behavior-qa.json`))))
const dependencies = [
  'src/views/patient/AboutView.vue', 'src/components/layout/PatientLayout.vue',
  'src/components/layout/PatientHeader.vue', 'src/components/layout/PatientFooter.vue',
  'src/components/common/ConsultationPanel.vue', 'src/assets/styles/main.css',
  'scripts/about-regression-qa.cjs', 'scripts/about-behavior-regression.cjs',
  'docs/figma-source/about/assets.json', ...lock.files.map(f => f.name),
]
const newest = Math.max(...await Promise.all(dependencies.map(async file => (await stat(join(root, file))).mtimeMs)))
for (const report of [...visualReports, ...behaviorReports]) {
  assert.deepEqual(report.errors, [])
  assert.ok(Date.parse(report.createdAt) >= newest, 'about: evidence predates code/asset/source/QA changes; rerun actual QA')
}
for (const report of visualReports) {
  assert.equal(report.sourceFrame, '484:1703')
  assert.equal(report.complexSourceFrame, '484:2501')
  assert.deepEqual(report.geometry, { width: 1440, height: 4916, brokenImages: [] })
  assert.deepEqual(report.pixelmatchOptions, { threshold: .15, includeAA: false })
  assert.equal(report.sourceComposition.replacesNode, '484:2070')
  assert.ok(report.sourceComposition.kind.includes('not an independent Figma frame'))
  assert.equal(report.sections.length, 7)
  assert.deepEqual(report.missingOwners, [], 'about: mapped Vue owners absent')
  for (const s of report.sections) assert.deepEqual(s.geometry.actual, s.geometry.expected, `${s.id}: source geometry drift`)
  for (const visual of [report.visual, report.baselineVisual, report.detailVisual, ...report.sections]) {
    assert.ok(visual.pixelmatchPercent < 1 && visual.nMAE < 1, `about visual difference >=1%: ${visual.local}`)
    for (const file of [visual.reference, visual.local, visual.diff]) await access(file)
    assert.ok((await stat(visual.local)).mtimeMs >= newest, `Stale local screenshot: ${visual.local}`)
  }
  assert.equal(report.detailVisual.sourceFrame, '484:2646')
  assert.equal(report.detailVisual.panelNode, '484:2649')
  assert.deepEqual(report.detailVisual.panelGeometry, { x: 272, y: 40, width: 896, height: 1199 })
}
for (const report of behaviorReports) {
  assert.deepEqual(report.desktop.map(row => row.width), [1024, 1440, 1920])
  for (const row of report.desktop) {
    assert.equal(row.geometry.width, row.width)
    assert.deepEqual(row.geometry.brokenImages, [])
    assert.equal(row.proofIndependentCards, 4)
    assert.equal(row.consultationEntries, 2)
    for (const check of ['reducedMotion', 'contacts']) assert.equal(row[check], true)
    for (const check of ['locked', 'focusInside', 'keyboardOpen', 'escapeClose', 'outsideClose', 'buttonClose', 'focusLoop', 'scrollRestored', 'focusRestored']) assert.equal(row.complexDialog[check], true, `${row.width}: ${check}`)
    assert.equal(row.complexDialog.headings.length, 5)
  }
  for (const check of ['accordionInterpolates', 'textWidthStable', 'complexEnterInterpolates', 'reducedMotionVerified']) assert.equal(report.motion[check], true, `about motion: ${check}`)
  for (const width of [1024, 1440, 1920]) for (const suffix of [`about-${width}-settled`, `complex-${width}-viewport`, `proof-all-open-${width}`]) await access(join(evidence, `${report.phase}-${suffix}.png`))
}
assert.deepEqual(behaviorReports[0].desktop, behaviorReports[1].desktop)
console.log('about: development + production whole page/7 sections/detail/source baseline <1% on both documented metrics; actual behavior/motion/freshness pass. Mobile remains deferred.')
