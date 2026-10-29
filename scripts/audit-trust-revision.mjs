import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const root = process.cwd()
const base = join(root, 'docs/figma-source/trust/revision-2026-10-29')
const evidence = join(root, 'artifacts/figma-trust-2026-10-29')
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const { assertCurrentSource } = createRequire(import.meta.url)('./figma-source-gate.cjs')
const inventories = []
for (const [folder, count] of [['', 527], ['travel', 200], ['aftercare', 177], ['assurances', 68]]) {
  const directory = join(base, folder)
  // The main lock also includes the two composed toolkit state directories.
  if (folder === '' || folder === 'assurances') {
    const lock = await read(join(directory, 'baseline-lock-2026-10-29.json'))
    for (const file of lock.files) assert.equal(hash(await readFile(join(directory, file.name))), file.sha256, `${folder}/${file.name}: source lock changed`)
  }
  const [inventory, parameters, layers, dev, mapping, crosscheck] = await Promise.all(
    ['native-inventory', 'native-parameters', 'ui-layers', 'dev-mode', 'node-to-code', 'layers-crosscheck']
      .map(name => read(join(directory, `${name}-2026-10-29.json`))))
  inventories.push(inventory)
  assert.equal(inventory.nodes.length, count)
  assert.equal(new Set(inventory.nodes.map(node => node.id)).size, count)
  assert.equal(crosscheck.layersCrossCheck, true)
  assert.deepEqual(crosscheck.mismatch, [])
  for (const collection of [parameters, layers, dev, mapping]) assert.equal(collection.nodes.length, count)
  for (const node of inventory.nodes) {
    const layer = layers.nodes.find(row => row.nodeId === node.id)
    const copy = dev.nodes.find(row => row.nodeId === node.id)
    const target = mapping.nodes.find(row => row.nodeId === node.id)
    assert.equal(layer.parentNodeId, node.parentNodeId, `${node.id}: hierarchy`)
    assert.equal(target.siblingOrder, node.siblingOrder, `${node.id}: sibling order`)
    assert.equal(target.rendered, node.rendered, `${node.id}: visibility`)
    assert.ok(parameters.nodes.some(row => row.nodeId === node.id), `${node.id}: native parameters`)
    const exactSvgProperties = target.mode === 'Exact SVG ownership' && copy.noCodeReason && copy.copyFields?.length
    if (target.rendered) assert.ok((copy.code?.length || exactSvgProperties) && target.component && target.selector && target.ownerNodeId, `${node.id}: copied CSS and concrete owner`)
  }
  if (folder === '' || folder === 'assurances') {
    const assets = await read(join(directory, 'assets-2026-10-29.json'))
    for (const asset of assets.assets) await access(join(root, asset.projectPath.replace(/^\//, '')))
  }
}
assertCurrentSource({ roots: inventories.slice(0, 3).map(row => row.sourceFrame), baselineSHA256: inventories[0].sourceSHA256, reportFile: join(root, 'artifacts/figma-source-gate/final-trust-source-2026-10-29.json') })
assertCurrentSource({ roots: ['143:3624'], baselineSHA256: inventories[3].sourceSHA256, reportFile: join(root, 'artifacts/figma-source-gate/final-trust-assurances-source-2026-10-29.json') })

const runtime = await read(join(base, 'assurances/runtime-mapping-2026-10-29.json'))
assert.deepEqual(runtime.nodes.map(row => row.nodeId), inventories[3].nodes.map(row => row.id))
for (const row of runtime.nodes) assert.ok(row.selector && row.ownerNodeId && row.component)
const newest = Math.max(...await Promise.all([
  'src/views/patient/TrustView.vue', 'src/components/common/TrustDesktopPage.vue', 'src/data/trustFigmaSource.ts',
  'src/components/common/HomeSourceNode.vue', 'src/components/layout/PatientLayout.vue',
  'scripts/trust-assurances-current-qa.cjs', 'scripts/trust-desktop-current-qa.cjs', 'scripts/trust-desktop-behavior-qa.cjs',
].map(async file => (await stat(join(root, file))).mtimeMs)))
for (const phase of ['development', 'production']) {
  const prefix = phase === 'production' ? 'production-' : ''
  const main = await read(join(evidence, `${prefix}desktop-current-qa.json`))
  const behavior = await read(join(evidence, `${prefix}desktop-behavior-qa.json`))
  const assurances = await read(join(evidence, `${phase}-assurances-qa.json`))
  for (const report of [main, behavior, assurances]) assert.ok(Date.parse(report.createdAt) >= newest, `${phase}: evidence predates implementation or QA`)
  assert.deepEqual(main.result.map(row => row.name), ['main-static', 'travel', 'aftercare', 'cta', 'footer'])
  for (const row of [...main.result, assurances.visual]) {
    assert.ok(row.changedPixelRatio < .01 && row.nMAE < .01, `${phase}: Figma comparison >=1%`)
    if (row.local) await access(row.local)
  }
  assert.deepEqual(main.checks.errors, []); assert.deepEqual(main.checks.broken, [])
  assert.deepEqual(behavior.errors, []); assert.deepEqual(assurances.errors, [])
  assert.deepEqual(behavior.desktop.map(row => row.width), [1024, 1440, 1920])
  for (const row of behavior.desktop) for (const check of ['oneStickyTitle', 'toolkitEntries', 'dialogRestores', 'independentFaq']) assert.equal(row[check], true, `${phase}/${row.width}/${check}`)
  assert.equal(assurances.sourceOwners.length, 68)
  assert.ok(assurances.sourceOwners.every(row => row.present))
  assert.deepEqual(assurances.cards.map(row => row.height), [374, 350, 374, 374])
  assert.ok(assurances.cards.every(row => row.exactCopy))
  assert.deepEqual(assurances.screenshotState, [374, 350, 374, 374].map(height => ({ expanded: 'true', height })))
  for (const check of ['independent', 'keyboard', 'scrollStable', 'fixedTextDuringAnimation', 'reducedMotion']) assert.equal(assurances.behavior[check], true)
  assert.deepEqual(assurances.responsiveState, { desktopBranchRemounted: true, assurancesPreserved: true, faqPreserved: true })
  await access(join(evidence, `${phase}-assurances-context.png`))
}
console.log('Trust desktop gate passed: 972 source nodes, complete Layers/Dev Mode locks, 68 expanded-state owners, dev/production screenshots <1%, independent accordions, responsive state retention and three desktop widths. Mobile UI deferred.')
