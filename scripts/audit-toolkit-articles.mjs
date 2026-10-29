import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd(), date = '2026-10-22', key = process.argv[2]
assert.ok(/^[a-z-]+$/.test(key || ''), 'Pass one article key')
const dir = join(root, 'docs/figma-source/toolkit-revision', key)
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const lock = await read(join(dir, `baseline-lock-${date}.json`))
for (const file of lock.files) assert.equal(hash(await readFile(join(root, file.name))), file.sha256, `${key}: source lock changed: ${file.name}`)
const at = kind => join(dir, `${kind}-${date}.json`)
const [inventory, layers, dev, parameters, mapping, variant, source, assets] = await Promise.all(['native-inventory', 'layers', 'dev-mode', 'native-parameters', 'node-to-code', 'desktop-variant', 'article-nodes', 'assets'].map(kind => read(at(kind))))
assert.equal(inventory.layersCrossCheck, true)
assert.equal(inventory.sourceFrame, source.article)
assert.equal(new Set(inventory.nodes.map(n => n.id)).size, inventory.nodeCount)
for (const collection of [layers, dev, parameters, mapping]) assert.equal(collection.nodes.length, inventory.nodeCount)
const sets = [layers, dev, parameters, mapping].map(set => new Map(set.nodes.map(n => [n.nodeId, n])))
const baseline = await readFile(join(dir, `desktop-baseline-${date}.html`), 'utf8')
for (const node of inventory.nodes) {
  const [l, d, p, m] = sets.map(set => set.get(node.id))
  assert.ok(l && d && p && m, `${node.id}: missing record`)
  assert.equal(l.parentNodeId, node.parentNodeId); assert.equal(l.siblingOrder, node.siblingOrder)
  assert.equal(l.name, node.name); assert.equal(l.level, node.level)
  assert.equal(p.parameters.name, node.name)
  assert.ok(d.code?.length && d.code.every(code => !code.includes('[Truncated]')), `${node.id}: incomplete Dev CSS`)
  assert.equal(m.parentNodeId, node.parentNodeId); assert.equal(m.siblingOrder, node.siblingOrder)
  assert.ok(m.component && m.selector && baseline.includes(`data-figma-node="${m.ownerNodeId}"`), `${node.id}: missing concrete owner`)
}
const flatten = n => [n, ...n.children.flatMap(flatten)]
let authoredBody = sets[2].get(source.body).parameters.textData.characters
for (const { from, to } of source.copyCorrections || []) authoredBody = authoredBody.replace(from, to)
assert.equal(flatten(variant.root).find(n => n.id === '143:3077').text, authoredBody)
assert.equal(variant.title, sets[2].get(source.title).parameters.textData.characters)
const marker = flatten(variant.root).find(n => n.id === '143:3071')
const markerText = flatten(variant.root).find(n => n.id === '143:3072')
assert.equal(markerText.text, sets[2].get(source.marker).parameters.textData.characters)
assert.ok(Math.abs(marker.width - markerText.width - 32) < .02, `${key}: PC tag lost its Figma Hug width`)
for (const asset of [...assets.sourceAssets, ...assets.desktopAssets]) {
  const bytes = await readFile(join(root, asset.projectPath.replace(/^\//, '')))
  if (asset.sha256) assert.ok(hash(bytes) === asset.sha256 || asset.projectPath.endsWith('.svg') && hash(bytes.toString().trimEnd()) === asset.sha256, `${asset.nodeId}: asset changed`)
}
console.log(`${key}: ${inventory.nodeCount}/${inventory.nodeCount} Layers, native parameters, selected Dev CSS, concrete owners, authored copy and source locks pass`)
if (!process.argv.includes('--source-only')) {
  const evidence = join(root, 'artifacts/figma-toolkit-2026-10-22', key)
  const reports = await Promise.all([join(evidence, 'final-qa.json'), join(evidence, 'production/production-qa.json')].map(read))
  const implementation = ['src/data/contentFigmaSource.ts', 'src/components/common/ContentArticleCanvas.vue', 'src/views/patient/ToolkitDetailView.vue', 'src/components/common/HomeSourceNode.vue', 'src/components/common/HospitalFigmaCanvas.vue', 'src/components/layout/PatientLayout.vue', 'src/assets/styles/main.css', 'scripts/toolkit-article-qa.cjs', ...lock.files.map(f => f.name)]
  if (['visa', 'steps-flow'].includes(key)) implementation.push('src/views/patient/TrustView.vue', 'src/views/patient/StepView.vue', 'scripts/toolkit-entry-qa.cjs')
  const newest = Math.max(...await Promise.all(implementation.map(async file => (await stat(join(root, file))).mtimeMs)))
  for (const report of reports) {
    assert.equal(report.key, key); assert.equal(report.sourceFrame, source.article); assert.equal(report.templateFrame, '143:3058')
    assert.deepEqual(report.errors, []); assert.deepEqual(report.missing, []); assert.deepEqual(report.geometry.brokenImages, [])
    assert.deepEqual(report.pixelmatchOptions, { threshold: .15, includeAA: false })
    for (const kind of ['source', 'desktop']) {
      assert.ok(report[kind].pixelmatchPercent < 1 && report[kind].nMAE < 1, `${key}/${kind}: visual difference >=1%`)
      assert.equal(typeof report[kind].changedPixelsOver16, 'number')
      await access(report[kind].reference); await access(report[kind].local)
      assert.ok((await stat(report[kind].local)).mtimeMs >= newest, `${key}/${kind}: stale screenshot`)
    }
    assert.equal(report.geometry.width, 1440)
    assert.ok(report.markerHug.textFits && Math.abs(report.markerHug.left - 16) < .02 && Math.abs(report.markerHug.right - 16) < .02 && report.markerHug.height === 34, `${key}: marker text overflow/padding`)
    assert.ok(Math.abs(report.geometry.height - variant.root.height) <= 1)
    assert.deepEqual(report.desktopBehavior.map(row => row.width), [1024, 1440, 1920])
    for (const row of report.desktopBehavior) for (const check of ['fits', 'fullCopy', 'stickyTop', 'bottomBoundary', 'scrollRestores', 'currentArticle', 'noFakeAnchors', 'keyboardReturn', 'contactLinks', 'consultation', 'disabledDestinations']) assert.equal(row.checks[check], true, `${key}/${row.width}: ${check}`)
    for (const check of ['directoryEntry', 'historyRestores', 'mobileDeferredSafely', 'unknownKeySafe']) assert.equal(report[check], true, `${key}: ${check}`)
    const m = report.motion
    assert.ok(m.exists && +m.start.opacity === 0 && +m.middle.opacity > 0 && +m.middle.opacity < 1 && +m.end.opacity === 1 && m.duration === 620 && m.reducedMotion)
    assert.ok(Date.parse(report.createdAt) >= newest, `${key}: stale evidence`)
  }
  const [devReport, production] = reports
  assert.deepEqual(devReport.desktopBehavior, production.desktopBehavior)
  assert.deepEqual(devReport.geometry, production.geometry)
  for (const metric of ['pixelmatchPercent', 'nMAE']) assert.ok(Math.abs(devReport.desktop[metric] - production.desktop[metric]) < .001)
  if (['visa', 'steps-flow'].includes(key)) {
    const entries = join(root, 'artifacts/figma-toolkit-2026-10-22/entries', key === 'visa' ? '' : key)
    for (const phase of ['final', 'production']) {
      const report = await read(join(entries, `${phase}-qa.json`))
      assert.ok(Date.parse(report.createdAt) >= newest, `${key}: card-entry evidence predates implementation`)
      assert.equal(report.key, key)
      assert.deepEqual(report.errors, [])
      assert.deepEqual(report.rows.map(row => row.route), ['/trust', '/steps'])
      for (const row of report.rows) {
        {
          assert.equal(row.sourceNodeId, key === 'visa' ? '204:5836' : '204:6028')
          assert.equal(row.referenceKind, 'Current official Figma state export; exact source card crop')
          await access(row.nativeCardDiagnostic.reference)
          await access(row.nativeCardDiagnostic.local)
          await access(row.sourceStateComparison.report)
          assert.ok(row.sourceStateComparison.changedPixelRatio < .01 && row.sourceStateComparison.nMAE < .01, `${row.route}: current Figma state difference >=1%`)
        }
        assert.equal(row.resizeRestores, true)
        assert.deepEqual(row.desktop.map(viewport => viewport.width), [1024, 1440, 1920])
        for (const viewport of row.desktop) for (const check of ['href', 'keyboard', 'click', 'historyBack', 'articleReturn']) assert.equal(viewport[check], true)
        assert.deepEqual(row.frozenNarrowViewport, [390, 900].map(width => ({ width, remainsDisabled: true, noNavigation: true })))
      }
    }
    console.log(`${key}: /trust and /steps exact source-card geometry and current Figma states <1%; desktop click/keyboard/history and frozen narrow-screen behavior pass in development and production`)
  }
  console.log(`${key}: separate Figma-source and PC-composition metrics <1%; development/production desktop interactions, natural sticky boundary, entry/reduced-motion and fresh evidence pass; mobile deferred`)
}
