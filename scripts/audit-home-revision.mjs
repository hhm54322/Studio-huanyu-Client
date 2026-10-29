import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import sourceGate from './figma-source-gate.cjs'

if ((await readFile('src/data/homeFigmaSource.ts','utf8')).includes('revision-2026-10-28/hero')) {
  await import('./audit-current-home.mjs')
} else {
// Historical screenshots/locks cannot prove that today's Design is unchanged.
sourceGate.assertPageCurrent('home')

const root = process.cwd()
const directory = join(root, 'docs/figma-source/home')
const read = name => readFile(join(directory, name), 'utf8')
const json = async name => JSON.parse(await read(name))
const lock = await json('baseline-lock-2026-10-19.json')
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
assert.equal(lock.counts.length, 56, 'Missing home source/state set (25 main/supplemental + 31 expert states)')
const expertSources=await json('experts/dialog-sources-2026-10-19.json')
assert.equal(Object.keys(expertSources.records).length,31,'Incomplete expert source inventory')
for(const expert of ['xu-yu','zhou-li-li','liu-guang-yu','chen-ji-wu']){
  for(const device of ['','-mobile']){
    for(let state=1;state<=(expert==='xu-yu'?3:4);state++)assert.ok(expertSources.records[`${expert}${device}-0${state}`],`Missing ${expert}${device} state ${state}`)
  }
}
assert.ok(expertSources.records['liu-guang-yu-mobile-02-alternate'],'Missing short-screen source')
for (const file of lock.files) assert.equal(digest(await read(file.name)), file.sha256, `${file.name}: source baseline changed without extraction`)

let nodeCount = 0
for (const file of lock.files.filter(file => /(?:^|\/)node-to-code(?:-mobile)?-2026-10-19\.json$/.test(file.name))) {
  const folder = dirname(file.name)
  const suffix = file.name.includes('node-to-code-mobile-') ? '-mobile' : ''
  const at = name => join(folder, `${name}${suffix}-2026-10-19.json`)
  const inventory = await json(at('native-inventory'))
  const parameters = await json(at('native-parameters'))
  const layers = await json(at('ui-layers'))
  const dev = await json(at('dev-mode'))
  const map = await json(file.name)
  const check = await json(at('layers-crosscheck'))
  const tree = await json(at('source-tree'))
  const html = await read(join(folder, `baseline${suffix}-2026-10-19.html`))
  assert.equal(check.layersCrossCheck, true, `${file.name}: Layers not cross-checked`)
  assert.deepEqual(check.mismatch, [], `${file.name}: Layers mismatch`)
  assert.equal(tree.sourceSHA256, inventory.sourceSHA256)
  const ids = new Set(inventory.nodes.map(n => n.id))
  assert.equal(ids.size, inventory.nodeCount)
  const source = new Map(parameters.nodes.map(n => [n.nodeId, n]))
  const copied = new Map(dev.nodes.map(n => [n.nodeId, n]))
  const ui = new Map(layers.nodes.map(n => [n.nodeId, n]))
  const mapping = new Map(map.nodes.map(n => [n.nodeId, n]))
  for (const node of inventory.nodes) {
    const p = source.get(node.id), c = copied.get(node.id), layer = ui.get(node.id), target = mapping.get(node.id)
    assert.ok(p && c && layer && target, `${node.id}: missing exact source, Dev Mode or mapping record`)
    assert.equal(layer.name, node.name, `${node.id}: layer name`)
    assert.equal(layer.level, node.level, `${node.id}: layer depth`)
    assert.equal(target.parentNodeId, layer.parentNodeId ?? node.parentNodeId, `${node.id}: layer parent`)
    assert.equal(target.siblingOrder, node.siblingOrder, `${node.id}: sibling order`)
    assert.equal(p.parameters.name, node.name, `${node.id}: parameter ownership`)
    if (target.rendered) {
      assert.ok(c.implemented && c.code.length && c.code.every(value => !value.includes('[Truncated]')), `${node.id}: incomplete Dev Mode copy`)
      assert.ok(target.selector && target.ownerNodeId && target.component, `${node.id}: absent implementation owner`)
      assert.ok(html.includes(`data-figma-node="${target.ownerNodeId}"`), `${node.id}: owner absent from static baseline`)
      if (p.parameters.mask) assert.match(target.mode, /clipping/, `${node.id}: Figma mask must map to its clipping viewport, not painted DOM`)
    }
  }
  nodeCount += inventory.nodes.length
}
const assets = await json('assets-2026-10-19.json')
for (const asset of assets.assets) await access(join(root, asset.projectPath.replace(/^\//, '')))

// ECharts replaces chart DOM, not the source hierarchy's paint semantics.
// Check all flattened primitives, including the transparent tooltip label.
const chartParameters = new Map((await json('native-parameters-2026-10-19.json')).nodes.map(row => [row.nodeId, row.parameters]))
const chartParents = new Map((await json('native-inventory-2026-10-19.json')).nodes.map(row => [row.id, row.parentNodeId]))
for (const chart of Object.values(await json('chart-spec-2026-10-19.json'))) {
  for (const primitive of [...chart.texts, ...(chart.lines || []), ...chart.legendSymbols]) {
    let expected = 1
    for (let id = primitive.nodeId; id && id !== chart.nodeId; id = chartParents.get(id)) {
      const p = chartParameters.get(id)
      assert.ok(p, `${id}: missing chart paint source`)
      expected *= p.visible === false ? 0 : (p.opacity ?? 1)
    }
    assert.equal(primitive.opacity, expected, `${primitive.nodeId}: chart ancestor opacity omitted`)
  }
}

// The source lock checks extraction; runtime evidence separately proves the
// mapped DOM really exists. A passing historical 143:45 audit is insufficient.
const evidence = join(root, 'artifacts/figma-2026-10-19')
const site = JSON.parse(await readFile(join(evidence, 'site/qa.json'), 'utf8'))
assert.equal(site.results.length, 6)
assert.deepEqual(site.errors, [])
for (const result of site.results) {
  assert.deepEqual(result.missingSourceOwners, [], `${result.width}: source owners missing from live Vue DOM`)
  assert.equal(result.hero.length, 4)
  assert.equal(result.flow.length, 4)
}
const page = JSON.parse(await readFile(join(evidence, 'page/qa.json'), 'utf8'))
assert.deepEqual(page.results.map(result => result.width), [1440, 375])
for (const viewport of page.results) {
  assert.deepEqual(viewport.errors, [])
  for (const section of viewport.sections) assert.ok(section.nMAE < 1, `${section.id}: ${section.nMAE}% screenshot difference`)
}
const behavior = JSON.parse(await readFile(join(evidence, 'behavior/qa.json'), 'utf8'))
assert.equal(behavior.results.length, 6)
assert.deepEqual(behavior.errors, [])
for (const checked of Object.values(behavior.playback)) assert.equal(checked, true)
const dialogs=JSON.parse(await readFile(join(evidence,'dialogs/qa.json'),'utf8'))
assert.deepEqual(dialogs.errors,[])
assert.equal(dialogs.results.length,42)
for(const state of dialogs.results){
  assert.ok(state.closed,`Dialog state not closed: ${state.state}/${state.width}`)
  assert.ok(state.overflow.scrollWidth<=state.overflow.clientWidth+1,`Dialog overflow: ${state.state}/${state.width}`)
  if(state.diff)assert.ok(state.diff.nMAE<1,`Dialog screenshot mismatch: ${state.state}/${state.width}`)
}
const experts=JSON.parse(await readFile(join(evidence,'experts/qa.json'),'utf8'))
assert.equal(experts.results.length,90,'Missing expert viewport/tag verification')
assert.deepEqual(experts.errors,[])
for(const width of [1440,375,320,390,430,768]){
  const states=experts.results.filter(state=>state.width===width)
  assert.equal(states.length,15,`${width}: expected every expert tab`)
  for(const state of states){
    assert.deepEqual(state.missingOwners,[],`${state.expert}/${width}/${state.tab}: live source nodes missing`)
    assert.equal(state.selected,1)
    assert.ok(state.overflow.scrollWidth<=state.overflow.width+1,`${state.expert}/${width}/${state.tab}: overflow`)
    if(width===1440||width===375)assert.ok(state.diff?.nMAE<1,`${state.expert}/${width}/${state.tab}: screenshot mismatch`)
  }
}
assert.ok(experts.smallScreen.diff.nMAE<1&&experts.smallScreen.headerFixed&&experts.smallScreen.scrollTop===40,'Missing alternate scrolling source evidence')
for(const passed of Object.values(experts.closePaths))assert.equal(passed,true)
console.log('home: historical desktop/mobile source and coverage checks preserved above; mobile remains deferred, not re-accepted in this desktop regression')

// The 2026-10-20 scope decision freezes mobile development. Keep its historical
// checks, but require fresh, real desktop evidence in both running environments.
const currentEvidence = join(root, 'artifacts/figma-regression-2026-10-23/home')
const reportAt = async file => JSON.parse(await readFile(join(currentEvidence, file), 'utf8'))
const current = await reportAt('current-source-check.json')
assert.equal(current.sourceSHA256, digest(await readFile(current.currentFile)), 'Current official Figma export changed; compare the source again')
assert.equal(current.results.length, 30, 'Missing desktop source/state comparison')
assert.equal(current.results.reduce((sum, row) => sum + row.nodeCount, 0), 3237)
for (const row of current.results) assert.deepEqual(row.changes, [], `${row.sourceFrame}: extract actual updated nodes before implementation`)
const inventory = await reportAt('native-inventory-2026-10-23.json')
const layers = await reportAt('ui-layers-2026-10-23.json')
const original = await json('native-inventory-2026-10-19.json')
assert.equal(inventory.sourceFrame, '1412:5682')
assert.equal(inventory.sourceSHA256, current.sourceSHA256)
assert.equal(inventory.nodeCount, 1138)
assert.equal(layers.nodes.length, 1138)
assert.deepEqual(inventory.nodes.map(row => row.id), original.nodes.map(row => row.id))
for (const [index, row] of inventory.nodes.entries()) {
  const layer = layers.nodes[index]
  for (const [field, expected] of Object.entries({ nodeId: row.id, name: row.name, level: row.level, parentNodeId: row.parentNodeId })) {
    assert.equal(layer[field], expected, `${row.id}: current live Layers ${field}`)
  }
}

const codeFiles = ['src/views/patient/HomeView.vue', 'src/components/layout/PatientLayout.vue', 'src/components/layout/PatientHeader.vue', 'src/components/layout/PatientFooter.vue', 'src/components/common/ConsultationPanel.vue', 'src/assets/styles/main.css', 'src/components/common/HomeSourceNode.vue', 'src/components/common/HomeFigmaSection.vue', 'src/components/common/HomeHeroSection.vue', 'src/components/common/HomePatientStories.vue', 'src/components/common/HomeStrengthSection.vue', 'src/components/common/HomePartnersSection.vue', 'src/components/common/HomeSourceDialog.vue', 'src/components/common/HomeExpertDialog.vue', 'src/composables/useAutoplayCarousel.ts', 'src/data/homeFigmaSource.ts', 'src/data/homeFigmaActions.ts']
const qaFiles = ['scripts/home-page-qa.cjs', 'scripts/home-desktop-states-qa.cjs', 'scripts/home-site-qa.cjs', 'scripts/home-behavior-qa.cjs', 'scripts/home-dialog-qa.cjs', 'scripts/home-expert-qa.cjs', 'scripts/doctor-experts-motion-qa.cjs', 'scripts/home-desktop-interaction-regression.cjs']
const newest = Math.max(...await Promise.all([...codeFiles, ...qaFiles].map(async file => (await stat(join(root, file))).mtimeMs)))
const sectionIds = ['1412:5685', '1412:5718', '1412:5765', '1412:5853', '1412:6019', '1412:6055', '1412:6092', '1412:6313', '1412:6350', '1442:343', '1412:6495', '1412:6635', '1412:6672']
const widths = [1024, 1440, 1920]
const totals = []
async function screenshot(visual) {
  assert.ok(Number.isFinite(visual.nMAE) && visual.nMAE < 1, `nMAE >=1%: ${visual.local}`)
  assert.ok(Number.isFinite(visual.pixelmatchPercent) && visual.pixelmatchPercent < 1, `pixelmatch >=1%: ${visual.local}`)
  for (const file of [visual.reference || visual.panelReference, visual.local]) await access(file)
  if (visual.panelReference) await access(visual.panelReference)
  assert.ok((await stat(visual.local)).mtimeMs >= newest, `Stale local screenshot: ${visual.local}`)
}
for (const phase of ['development', 'production']) {
  const reports = Object.fromEntries(await Promise.all(['page', 'states', 'site', 'behavior', 'dialogs', 'experts', 'interactions'].map(async name => [name, await reportAt(`${phase}/${name}/qa.json`)])))
  const motion = await reportAt(`${phase}/expert-motion/expert-motion-qa.json`)
  for (const [name, report] of [...Object.entries(reports), ['expert-motion', motion]]) {
    if (name === 'page') for (const viewport of report.results) assert.deepEqual(viewport.errors, [], `${phase}/${viewport.width}: page errors`)
    else assert.deepEqual(report.errors, [], `${phase}/${name}: page errors`)
    assert.ok(Date.parse(report.createdAt) >= newest, `${phase}/${name}: evidence predates implementation or QA; rerun actual tests`)
    if (phase === 'production') assert.ok(Date.parse(report.createdAt) >= (await stat(join(root, 'dist/index.html'))).mtimeMs, `${name}: preview evidence predates latest build`)
    if (report.base) assert.equal(report.base, phase === 'production' ? 'http://127.0.0.1:5186/' : 'http://127.0.0.1:5174/')
  }
  assert.deepEqual(reports.page.pixelmatchOptions, { threshold: .15, includeAA: false })
  assert.deepEqual(reports.page.results.map(row => row.width), [1440])
  const sections = reports.page.results[0].sections
  assert.deepEqual(sections.map(row => row.id), sectionIds)
  for (const section of sections) {
    assert.equal(section.source.width, section.actual.width, `${section.id}: width`)
    assert.equal(section.source.height, section.actual.height, `${section.id}: height`)
    await screenshot(section)
  }
  assert.deepEqual(reports.states.results.map(row => row.label), ['hero-01', 'hero-02', 'hero-03', 'journey-02', 'journey-03', 'journey-04', 'strength-01', 'strength-02', 'strength-03'])
  for (const state of reports.states.results) await screenshot(state)
  assert.deepEqual(reports.states.geometry, { width: 1440, scrollWidth: 1440, brokenImages: [] })
  assert.ok(reports.states.independentFaq && reports.states.routeChecks)
  assert.deepEqual(reports.site.results.map(row => row.width), widths)
  for (const row of reports.site.results) {
    assert.deepEqual(row.missingSourceOwners, [], `${phase}/${row.width}: source DOM owner missing`)
    assert.equal(row.hero.length, 4)
    assert.equal(row.flow.length, 4)
    assert.equal(row.charts.length, 2)
    assert.ok(row.consultation && row.language)
  }
  assert.ok(reports.site.motion.strength && reports.site.motion.partnerHover && reports.site.motion.reducedMotion)
  assert.ok(reports.site.motion.partnerLoopNmae < .1)
  assert.deepEqual(reports.behavior.results.map(row => row.width), widths)
  for (const row of reports.behavior.results) assert.ok(row.states.length === 5 && row.keyboard && row.dialogFocus)
  for (const passed of Object.values(reports.behavior.playback)) assert.equal(passed, true)
  assert.equal(reports.dialogs.results.length, 21)
  for (const state of reports.dialogs.results) {
    assert.ok(state.closed && state.overflow.scrollWidth <= state.overflow.clientWidth + 1)
    if (state.state !== 'story') assert.equal(state.scrollDelta, 0)
    if (state.width === 1440) await screenshot(state.diff)
  }
  assert.equal(reports.experts.results.length, 45)
  for (const width of widths) {
    const rows = reports.experts.results.filter(row => row.width === width)
    assert.equal(rows.length, 15)
    for (const state of rows) {
      assert.deepEqual(state.missingOwners, [])
      assert.equal(state.selected, 1)
      assert.ok(state.overflow.scrollWidth <= state.overflow.width + 1)
      if (width === 1440) await screenshot(state.diff)
    }
  }
  for (const passed of Object.values(reports.experts.closePaths)) assert.equal(passed, true)
  assert.equal(motion.desktop.length, 12)
  for (const row of motion.desktop) {
    assert.ok(row.focusRestore && row.scrollRestore)
    for (const state of row.states) assert.ok(state.bottomReachable && !state.overflow)
  }
  for (const passed of Object.values(motion.motion)) assert.equal(passed, true)
  assert.deepEqual(reports.interactions.results.map(row => row.width), widths)
  for (const row of reports.interactions.results) {
    assert.equal(row.cards.length, 6)
    for (const card of row.cards) {
      for (const flag of ['hover', 'focus', 'wholeCard', 'enter', 'space', 'escape', 'button', 'backdrop', 'focusTrap', 'focusRestore', 'scrollRestore', 'bottomReachable']) assert.equal(card[flag], true, `${row.width}/card ${card.card}: ${flag}`)
      const file = join(currentEvidence, `${phase}/interactions/why-card-${card.card}-${row.width}-hover.png`)
      assert.ok((await stat(file)).mtimeMs >= newest, `Stale hover screenshot: ${file}`)
    }
  }
  for (const flag of ['cardInterpolates', 'faqInterpolates', 'faqTextWidthStable', 'faqIndependent', 'reducedMotion']) assert.equal(reports.interactions.motion[flag], true)
  totals.push({ phase, visualStates: sections.length + reports.states.results.length + 7 + 15, maxNmae: Math.max(...sections.map(row => row.nMAE), ...reports.states.results.map(row => row.nMAE), ...reports.dialogs.results.filter(row => row.diff).map(row => row.diff.nMAE), ...reports.experts.results.filter(row => row.diff).map(row => row.diff.nMAE)) })
}
console.log(`Home revision gate passed: ${lock.counts.length} source sets/${nodeCount} native nodes/${assets.assets.length} assets locked; current 30 desktop sources/3237 nodes unchanged; 1138 live Layers checked; fresh development + production desktop visual/interaction/motion evidence. Mobile remains deferred.`)
console.log(JSON.stringify(totals))

}
