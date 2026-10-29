import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd(), date = '2026-10-22'
const keys = process.argv.slice(2).filter(v => !v.startsWith('--'))
assert.ok(keys.length, 'Provide article keys')
const sourceOnly = process.argv.includes('--source-only')
const base = join(root, 'docs/figma-source/trust-safety-revision')
const evidence = join(root, `artifacts/figma-content-${date}/safety`)
const read = async f => JSON.parse(await readFile(f, 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
for (const key of keys) {
  const folder = join(base, key)
  for (const [name, relativeTo] of [['baseline-lock', folder], ['desktop-composition-lock', root]]) {
    const lock = await read(join(folder, `${name}-${date}.json`))
    for (const f of lock.files) assert.equal(hash(await readFile(join(relativeTo, f.name))), f.sha256, `${key}/${f.name}: source lock changed`)
  }
  const [inventory, parameters, layers, dev, crosscheck, variant, content] = await Promise.all(['native-inventory', 'native-parameters', 'ui-layers', 'dev-mode', 'layers-crosscheck', 'desktop-variant', 'content-nodes'].map(type => read(join(folder, `${type}-${date}.json`))))
  assert.equal(inventory.layersCrossCheck, true)
  assert.equal(crosscheck.layersCrossCheck, true); assert.deepEqual(crosscheck.mismatch, [])
  for (const s of [inventory, parameters, layers, dev]) assert.equal(s.nodes.length, 14)
  assert.equal(variant.sourceSHA256, inventory.sourceSHA256)
  assert.equal(variant.contentMapping.length, 14)
  const maps = [parameters.nodes, layers.nodes, dev.nodes, variant.contentMapping].map(nodes => new Map(nodes.map(n => [n.nodeId, n])))
  for (const n of inventory.nodes) {
    const [p, l, d, m] = maps.map(map => map.get(n.id))
    assert.ok(p && l && d && m, `${key}/${n.id}: missing native/UI/CSS/owner`)
    assert.equal(p.parameters.name, n.name); assert.equal(l.name, n.name)
    assert.equal(l.parentNodeId, n.parentNodeId); assert.equal(l.level, n.level)
    assert.equal(m.parentNodeId, n.parentNodeId); assert.equal(m.siblingOrder, n.siblingOrder)
    assert.ok(d.implemented && d.code.length && d.code.every(v => !v.includes('[Truncated]')))
    if (m.rendered) assert.ok(m.ownerNodeId && m.selector && m.component)
    else assert.equal(n.name, 'dragger')
  }
  for (const property of ['title', 'description', 'body']) {
    const id = content[property]
    let text = maps[0].get(id).parameters.textData.characters
    for (const c of content.copyCorrections) if (c.nodeId === id) text = text.replaceAll(c.from, c.to)
    assert.equal(variant[property], text, `${key}/${property}: authored copy drift`)
  }
  const assets = await read(join(folder, `assets-${date}.json`))
  for (const a of assets.assets) assert.equal(hash((await readFile(join(root, a.projectPath.slice(1)), 'utf8')).trimEnd()), a.sha256)
  if (!sourceOnly) {
    const source = await read(join(evidence, `${key}/source-qa.json`))
    assert.deepEqual(source.articles.map(a => a.key), [key])
    for (const row of source.articles) {
      assert.ok(row.nMAE < 1 && row.pixelmatchPercent < 1)
      await access(row.reference); await access(row.local)
    }
    const files = ['src/views/patient/TrustView.vue', 'src/components/common/TrustArticleDialog.vue', 'src/components/common/HomeSourceNode.vue', 'src/components/layout/PatientLayout.vue', 'src/assets/styles/main.css', `docs/figma-source/trust-safety-revision/${key}/desktop-composition-lock-${date}.json`, 'scripts/trust-article-variants-qa.cjs']
    const newest = Math.max(...await Promise.all(files.map(async f => (await stat(join(root, f))).mtimeMs)))
    const reports = await Promise.all([`${key}/final-qa.json`, `${key}/production-qa.json`].map(f => read(join(evidence, f))))
    for (const report of reports) {
      assert.ok(Date.parse(report.createdAt) >= newest, `${key}: evidence predates code/source`)
      assert.deepEqual(report.articles.map(a => a.key), [key]); assert.deepEqual(report.errors, [])
      const row = report.articles[0]
      assert.ok(row.visual.referenceKind.includes('not separate Figma desktop frame'))
      assert.ok(row.visual.nMAE < 1 && row.visual.pixelmatchPercent < 1)
      assert.deepEqual(row.visual.missing, []); assert.deepEqual(row.visual.geometry.brokenImages, [])
      assert.ok((await stat(row.visual.local)).mtimeMs >= newest)
      assert.deepEqual(row.desktop.map(w => w.width), [1024, 1440, 1920])
      for (const width of row.desktop) for (const name of ['completeSourceCopy', 'noInventedRoute', 'noScreenshotUI', 'keyboardFocusTrap', 'backgroundLocked', 'escapeRestores', 'closeRestores', 'backdropRestores', 'fits', 'reducedMotion']) assert.equal(width.checks[name], true, `${key}/${width.width}/${name}`)
      assert.deepEqual(row.shortScreen, { topPadding: true, bottomReachable: true })
      assert.deepEqual(row.motion, { entryInterpolates: true, exitInterpolates: true, reducedMotionVerified: true })
      assert.equal(row.breakpointCleanup, true)
    }
    for (const field of ['nMAE', 'pixelmatchPercent', 'geometry', 'missing']) assert.deepEqual(reports[0].articles[0].visual[field], reports[1].articles[0].visual[field], `${key}: production ${field} differs`)
  }
  console.log(`${key}: 14/14 nodes, native/Layers/Dev CSS, concrete owners and immutable source/composition locks pass${sourceOnly ? '' : '; actual Figma source and desktop composition <1%, dev/production behavior/motion/fresh evidence pass'}. Mobile UI deferred.`)
}
