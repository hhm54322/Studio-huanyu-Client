import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sourceGate from './figma-source-gate.cjs'

const date = '2026-10-28'
const frames = {
  project: '2294:8240', matching: '2294:6971', upload: '2294:8037',
  profile: '2294:7751', treatment: '2294:7818', 'treatment-scroll': '2294:7487',
  cases: '2294:7334', reviews: '231:1421', services: '2294:7380',
  'services-scroll': '2294:7557', institution: '2294:7691',
  'institution-scroll': '2294:7631', 'doctor-card': '2323:8392',
}
const visualStates = ['project', 'matching', 'upload', 'profile', 'treatment-scroll', 'treatment-full', 'cases', 'reviews', 'services-scroll', 'services-full', 'institution', 'institution-full']
const dialogFrames = ['2294:7751', '2294:7487', '2294:7334', '231:1421', '2294:7557']
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const descendants = node => [node, ...node.children.flatMap(descendants)]

export async function auditDentalRevision({ sourceOnly = false } = {}) {
  sourceGate.assertPageCurrent('dental')
  const root = process.cwd(), base = join(root, `docs/figma-source/dental-revision-${date}`)
  const lock = await read(join(base, `baseline-lock-${date}.json`))
  const sets = (await read(join(base, `sources-${date}.json`))).sets
  assert.deepEqual(Object.fromEntries(sets.map(set => [set.name, set.sourceFrame])), frames, 'Dental current source must include all 13 authored frames')
  assert.equal(lock.counts.length, sets.length)
  for (const file of lock.files) assert.equal(hash(await readFile(join(base, file.name))), file.sha256, `${file.name}: source lock changed`)

  let total = 0
  const trees = new Map(), sourceIds = new Set()
  for (const set of sets) {
    const at = kind => join(base, set.folder, `${kind}-${date}.json`)
    const [inventory, parameters, layers, dev, mapping, check, tree] = await Promise.all(['native-inventory', 'native-parameters', 'ui-layers', 'dev-mode', 'node-to-code', 'layers-crosscheck', 'source-tree'].map(kind => read(at(kind))))
    assert.equal(inventory.sourceFrame, set.sourceFrame)
    assert.equal(check.layersCrossCheck, true, `${set.name}: Layers cross-check failed`)
    assert.deepEqual(check.mismatch, [], `${set.name}: Layers differ`)
    assert.equal(new Set(inventory.nodes.map(node => node.id)).size, inventory.nodeCount)
    assert.equal(tree.sourceSHA256, inventory.sourceSHA256)
    assert.equal(lock.counts.find(count => count.sourceFrame === set.sourceFrame)?.inventoryNodes, inventory.nodeCount)
    const collections = [parameters.nodes, layers.nodes, dev.nodes, mapping.nodes]
    for (const rows of collections) assert.equal(rows.length, inventory.nodeCount, `${set.name}: incomplete node records`)
    const maps = collections.map(rows => new Map(rows.map(node => [node.nodeId, node])))
    const html = await readFile(join(base, set.folder, `baseline-${date}.html`), 'utf8')
    for (const node of inventory.nodes) {
      const [p, l, d, m] = maps.map(map => map.get(node.id)), label = `${set.name}/${node.id}`
      assert.ok(p && l && d && m, `${label}: missing extraction or mapping`)
      assert.equal(p.parameters.name, node.name, `${label}: parameter owner`)
      assert.equal(l.name, node.name, `${label}: layer name`)
      assert.equal(l.level, node.level, `${label}: layer depth`)
      assert.equal(l.parentNodeId, node.parentNodeId, `${label}: parent`)
      assert.equal(m.parentNodeId, node.parentNodeId, `${label}: mapped parent`)
      assert.equal(m.siblingOrder, node.siblingOrder, `${label}: sibling order`)
      if (m.rendered) {
        assert.ok(d.implemented && d.code?.length && d.code.every(css => !css.includes('[Truncated]')), `${label}: incomplete Dev CSS`)
        assert.ok(m.component && m.selector && m.ownerNodeId, `${label}: missing concrete owner`)
        assert.ok(html.includes(`data-figma-node="${m.ownerNodeId}"`), `${label}: owner absent from baseline`)
      }
      sourceIds.add(node.id)
    }
    trees.set(set.name, tree.root)
    total += inventory.nodeCount
  }
  assert.equal(total, 1358)
  const assets = (await read(join(base, `assets-${date}.json`))).assets
  for (const asset of assets) {
    assert.ok(sourceIds.has(asset.nodeId), `${asset.nodeId}: asset has no source node`)
    const file = join(root, asset.projectPath.replace(/^\//, '')), bytes = await readFile(file)
    if (asset.sha256) assert.ok(hash(bytes) === asset.sha256 || file.endsWith('.svg') && hash(bytes.toString().trimEnd()) === asset.sha256, `${asset.nodeId}: asset differs`)
  }

  const find = (name, id) => descendants(trees.get(name)).find(node => node.id === id)
  assert.equal(find('treatment', '2294:7856').children.length, 6, 'Treatment full frame must contain 01–06')
  assert.equal(find('treatment-scroll', '2294:7526').children.length, 3, 'Treatment viewport source must contain its initial rows')
  assert.equal(find('services', '2294:7421').children.length, 10, 'Services full frame must contain all ten cards')
  assert.equal(find('services-scroll', '2294:7915').children.length, 10, 'Services viewport source must contain all ten cards')
  assert.equal(find('institution', '2294:7742').children.length, 8, 'Institution full frame must contain eight photos')
  const sharedCard = await read(join(base, `matching-card-consumption-${date}.json`))
  const sourceCardNodes = new Set(descendants(trees.get('doctor-card')).map(node => node.id))
  assert.deepEqual(new Set(sharedCard.nodePairs.map(([source]) => source)), sourceCardNodes, 'Every standalone doctor-card DOM/SVG owner must be mapped to its matching-page consumer')
  for (const [source, target] of sharedCard.nodePairs) {
    const a = find('doctor-card', source), b = find('matching', target)
    assert.ok(a && b, `${source}/${target}: missing shared card mapping`)
    for (const key of ['type', 'text', 'width', 'height', ...(sharedCard.placementOwners.includes(target) ? [] : ['x', 'y'])]) assert.deepEqual(a[key], b[key], `${source}/${target}: incompatible shared card ${key}`)
  }
  console.log(`Dental current source gate: ${sets.length} frames / ${total} nodes / ${assets.length} assets; hierarchy, Dev Mode, mapping, source locks and child-content frames pass.`)
  if (sourceOnly) return

  const evidence = join(root, `artifacts/figma-dental-${date}`)
  const uiFiles = ['src/components/common/DentalDesktopFlow.vue', 'src/components/common/DentalSourceCanvas.vue', 'src/components/common/DentalDoctorSourceDialog.vue', 'src/data/dentalFigmaSource.ts', 'src/components/common/HomeSourceNode.vue', 'src/views/patient/DentalView.vue', 'src/assets/styles/main.css', 'src/components/layout/PatientLayout.vue']
  const modified = Math.max(...await Promise.all(uiFiles.map(async file => (await stat(join(root, file))).mtimeMs)))
  const reports = []
  for (const environment of ['', 'production/']) {
    const visual = await read(join(evidence, environment, 'visual/qa.json'))
    const behavior = await read(join(evidence, environment, 'behavior/behavior-qa.json'))
    for (const report of [visual, behavior]) { assert.deepEqual(report.errors, []); assert.ok(Date.parse(report.createdAt) >= modified, `${environment || 'development/'} evidence predates current implementation`) }
    assert.deepEqual(visual.results.map(state => state.name), visualStates)
    for (const state of visual.results) { assert.ok(state.nMAE < 1 && state.pixelmatchPercent < 1, `${environment}${state.name}: screenshot error >=1%`); for (const file of [state.reference, state.figma, state.local]) await access(file); assert.ok((await stat(state.local)).mtimeMs >= modified) }
    assert.deepEqual(behavior.sourceCoverage, { project: frames.project, matching: frames.matching, upload: frames.upload, doctorCard: frames['doctor-card'], profile: frames.profile, treatmentFull: frames.treatment, treatmentViewport: frames['treatment-scroll'], cases: frames.cases, reviews: frames.reviews, servicesFull: frames.services, servicesViewport: frames['services-scroll'], institutionFull: frames.institution, institutionViewport: frames['institution-scroll'] })
    assert.deepEqual(behavior.desktop.map(row => row.width), [1024, 1440, 1920])
    for (const row of behavior.desktop) for (const key of ['keyboardAccordion', 'independentAccordions', 'projectFit', 'priceFilter', 'filterAndEmpty', 'sortAndReset', 'doctorDialog', 'directCases', 'institutionAndEightPhotos', 'quoteEntry', 'formPersistsAcrossSteps', 'nativeFormAndValidation', 'uploadFitAndAssets']) assert.equal(row.checks[key], true, `${row.width}/${key}`)
    assert.deepEqual(behavior.dialogs.map(row => row.width), [1024, 1440, 1920])
    for (const row of behavior.dialogs) { assert.deepEqual(row.states.map(state => state.frame), dialogFrames); for (const state of row.states) assert.equal(state.bottomReachable, true); for (const key of ['keyboard', 'focusTrap', 'focusRestore', 'scrollRestore']) assert.equal(row[key], true) }
    for (const key of ['heightInterpolation', 'stableSummary', 'rapidToggle', 'reducedMotion', 'dialogReducedMotion']) assert.equal(behavior.motion[key], true)
    for (const key of ['payload', 'duplicateBlocked', 'failureRetry', 'emptyBlocked', 'invalidFileBlocked', 'reusedRequestId', 'quoteDoctorPreserved']) assert.equal(behavior.submission[key], true)
    reports.push({ visual, behavior })
  }
  assert.deepEqual(reports[1].behavior.desktop, reports[0].behavior.desktop)
  assert.deepEqual(reports[1].behavior.dialogs, reports[0].behavior.dialogs)
  assert.deepEqual(reports[1].behavior.motion, reports[0].behavior.motion)
  assert.deepEqual(reports[1].behavior.submission, reports[0].behavior.submission)
  console.log('Dental desktop gate passed in development and production: 12 viewport/full-content visual states <1%; all 13 source frames consumed; 3 desktop widths, complete scrolling dialogs, filters, accordions, upload/retry, keyboard, focus/scroll restoration and reduced motion. Mobile deferred by user.')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await auditDentalRevision({ sourceOnly: process.argv.includes('--source-only') })
