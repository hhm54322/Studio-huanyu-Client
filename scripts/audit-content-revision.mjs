import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd()
const name = process.argv.includes('--trust') ? 'trust' : 'toolkit'
const folder = name === 'toolkit' ? 'content-revision' : 'trust-content-revision'
const base = join(root, 'docs/figma-source', folder), date = '2026-10-21'
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const lock = await read(join(base, `baseline-lock-${date}.json`))
for (const file of lock.files) assert.equal(hash(await readFile(join(base, file.name))), file.sha256, `${file.name}: locked source changed`)
const at = kind => join(base, name, `${kind}-${date}.json`)
const [inventory, parameters, layers, dev, mapping, crosscheck, tree] = await Promise.all(['native-inventory', 'native-parameters', 'ui-layers', 'dev-mode', 'node-to-code', 'layers-crosscheck', 'source-tree'].map(kind => read(at(kind))))
assert.equal(crosscheck.layersCrossCheck, true)
assert.deepEqual(crosscheck.mismatch, [])
assert.equal(new Set(inventory.nodes.map(n => n.id)).size, inventory.nodeCount)
assert.equal(tree.sourceSHA256, inventory.sourceSHA256)
assert.equal(lock.counts.find(c => c.sourceFrame === inventory.sourceFrame).inventoryNodes, inventory.nodeCount)
for (const collection of [parameters.nodes, layers.nodes, dev.nodes, mapping.nodes]) assert.equal(collection.length, inventory.nodeCount)
const maps = [parameters, layers, dev, mapping].map(set => new Map(set.nodes.map(n => [n.nodeId, n])))
const html = await readFile(join(base, name, `baseline-${date}.html`), 'utf8')
for (const node of inventory.nodes) {
  const [p, l, d, t] = maps.map(map => map.get(node.id))
  assert.ok(p && l && d && t, `${node.id}: missing extraction or mapping`)
  assert.equal(p.parameters.name, node.name)
  assert.equal(l.name, node.name); assert.equal(l.level, node.level)
  assert.equal(l.parentNodeId, node.parentNodeId)
  assert.equal(t.siblingOrder, node.siblingOrder)
  assert.equal(t.parentNodeId, node.parentNodeId)
  if (t.rendered) {
    assert.ok(d.implemented && d.code?.length && d.code.every(css => !css.includes('[Truncated]')), `${node.id}: missing Dev CSS`)
    assert.ok(t.component && t.selector && t.ownerNodeId)
    assert.ok(html.includes(`data-figma-node="${t.ownerNodeId}"`), `${node.id}: missing baseline owner`)
  }
}
const assets = await read(join(base, `assets-${date}.json`))
for (const asset of assets.assets) {
  const file = join(root, asset.projectPath.replace(/^\//, ''))
  const bytes = await readFile(file)
  if (asset.sha256) assert.ok(hash(bytes) === asset.sha256 || file.endsWith('.svg') && hash(bytes.toString().trimEnd()) === asset.sha256, `${asset.nodeId}: asset differs`)
}
console.log(`${name}: ${inventory.nodeCount} nodes / ${assets.assets.length} assets; full hierarchy, Dev CSS, concrete mapping and locked source pass`)
if (!process.argv.includes('--source-only')) {
  const evidence = join(root, name === 'trust' ? 'artifacts/figma-content-2026-10-22/jci-regression' : `artifacts/figma-content-${date}`)
  const reports = await Promise.all([
    join(evidence, `${name}-final-qa.json`), join(evidence, `${name}-behavior-qa.json`),
    join(evidence, 'production', `${name}-production-qa.json`), join(evidence, 'production', `${name}-behavior-qa.json`),
  ].map(read))
  const [visual, behavior, productionVisual, productionBehavior] = reports
  for (const report of reports) assert.deepEqual(report.errors, [])
  for (const report of [visual, productionVisual]) {
    assert.equal(report.frame, inventory.sourceFrame)
    assert.ok(report.nMAE < 1, 'Average RGB error >=1%')
    assert.ok(report.pixelmatchPercent < 1, 'Project pixelmatch difference >=1%')
    assert.deepEqual(report.pixelmatchOptions, { threshold: .15, includeAA: false })
    assert.deepEqual(report.missing, [])
    assert.equal(report.geometry.width, 1440)
    assert.deepEqual(report.geometry.brokenImages, [])
    await access(report.reference); await access(report.local)
    // raw RGB threshold16 ratio is intentionally retained as a distinct
    // rasterization diagnostic, not relabelled as pixelmatch percentage.
    assert.equal(typeof report.changedPixelsOver16, 'number')
  }
  for (const field of ['pixelmatchPercent', 'geometry', 'missing']) assert.deepEqual(visual[field], productionVisual[field], `Production ${field} differs`)
  // Compare the actual dev/production rasters too, rather than requiring
  // identical floating-point diagnostics after harmless subthreshold noise.
  // The latest toolkit pair differs at 1715 antialiased pixels, max RGB11:
  // direct nMAE .0000214%, pixelmatch zero. No region is masked or resized.
  const sharp = (await import('sharp')).default
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const devImage = await sharp(visual.local).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const productionImage = await sharp(productionVisual.local).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(devImage.info, productionImage.info)
  assert.equal(pixelmatch(devImage.data, productionImage.data, null, devImage.info.width, devImage.info.height, { threshold: .15, includeAA: false }), 0, 'Dev/production screenshot pixelmatch differs')
  for (const field of ['nMAE', 'changedPixelsOver16']) assert.ok(Math.abs(visual[field] - productionVisual[field]) < .001, `Production ${field} differs beyond subthreshold raster noise`)
  for (const report of [behavior, productionBehavior]) {
    assert.deepEqual(report.desktop.map(r => r.width), [1024, 1440, 1920])
    const checks = name === 'trust'
      ? ['noInventedRoute', 'noScreenshotUI', 'completeSourceCopy', 'keyboardFocusTrap', 'backgroundLocked', 'escapeRestores', 'closeRestores', 'backdropRestores', 'fits', 'reducedMotion']
      : ['fits', 'keyboardReturn', 'copyTyposCorrected', 'noFakeAnchors', 'stickyBoundary', 'scrollRestores', 'contactLinks', 'consultation', 'reducedMotion']
    for (const row of report.desktop) for (const check of checks) assert.equal(row.checks[check], true, `${name}/${row.width}: ${check} missing or failed`)
    const motions = ['entryInterpolates', 'settledLayoutRestored', 'reducedMotionVerified', ...(name === 'trust' ? ['exitInterpolates', 'exitRestores'] : [])]
    for (const check of motions) assert.equal(report.motion[check], true, `${name}: ${check} missing or failed`)
    if (name === 'trust') assert.deepEqual(report.shortScreen, { topPadding: true, bottomReachable: true })
  }
  assert.deepEqual(behavior.desktop, productionBehavior.desktop)
  assert.deepEqual(behavior.motion, productionBehavior.motion)
  const files = [
    'src/components/common/HomeSourceNode.vue', 'src/components/common/HospitalFigmaCanvas.vue',
    'src/components/layout/PatientLayout.vue', 'src/assets/styles/main.css',
    name === 'toolkit' ? 'src/views/patient/ToolkitDetailView.vue' : 'src/components/common/TrustArticleDialog.vue',
    `docs/figma-source/${folder}/baseline-lock-${date}.json`,
  ]
  if (name === 'trust') files.push('src/views/patient/TrustView.vue')
  else files.push('src/components/common/ContentArticleCanvas.vue', 'src/data/contentFigmaSource.ts')
  const newest = Math.max(...await Promise.all(files.map(async file => (await stat(join(root, file))).mtimeMs)))
  for (const report of reports) assert.ok(Date.parse(report.createdAt) >= newest, 'Evidence predates implementation/source lock')
  for (const report of [visual, productionVisual]) assert.ok((await stat(report.local)).mtimeMs >= newest, 'Screenshot predates implementation')
  console.log(`${name}: desktop development + production screenshots <1% using documented pixelmatch/nMAE metrics; keyboard, ${name === 'trust' ? 'modal lock/close restoration + short screen + entry/exit' : 'sticky boundary + entry'} motion and reduced-motion pass. Mobile deferred by user.`)
}
