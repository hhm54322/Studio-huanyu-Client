import assert from 'node:assert/strict'
import { readFile, stat, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd(), date = '2026-10-22'
const base = join(root, 'docs/figma-source/trust-articles-revision')
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
for (const [filename, directory] of [[`baseline-lock-${date}.json`, base], [`desktop-composition-lock-${date}.json`, root]]) {
  const lock = await read(join(base, filename))
  for (const file of lock.files) assert.equal(hash(await readFile(join(directory, file.name))), file.sha256, `${file.name}: source lock changed`)
}
for (const key of ['cost', 'doctor']) {
  const at = type => join(base, key, `${type}-${date}.json`)
  const [inventory, parameters, layers, dev, crosscheck, variant] = await Promise.all(['native-inventory', 'native-parameters', 'ui-layers', 'dev-mode', 'layers-crosscheck', 'desktop-variant'].map(type => read(at(type))))
  assert.equal(inventory.layersCrossCheck, true); assert.equal(crosscheck.layersCrossCheck, true)
  assert.deepEqual(crosscheck.mismatch, [])
  for (const set of [inventory, parameters, layers, dev]) assert.equal(set.nodes.length, 14)
  assert.equal(variant.sourceSHA256, inventory.sourceSHA256)
  assert.equal(variant.contentMapping.length, 14)
  const maps = [parameters.nodes, layers.nodes, dev.nodes, variant.contentMapping].map(nodes => new Map(nodes.map(n => [n.nodeId, n])))
  for (const node of inventory.nodes) {
    const [p, l, d, m] = maps.map(map => map.get(node.id))
    assert.ok(p && l && d && m, `${node.id}: missing parameter/UI/CSS/owner`)
    assert.equal(p.parameters.name, node.name); assert.equal(l.name, node.name)
    assert.equal(l.level, node.level); assert.equal(l.parentNodeId, node.parentNodeId)
    assert.equal(m.parentNodeId, node.parentNodeId); assert.equal(m.siblingOrder, node.siblingOrder)
    assert.ok(d.implemented && d.code.length && d.code.every(code => !code.includes('[Truncated]')))
    if (m.rendered) assert.ok(m.selector && m.component && m.ownerNodeId)
    else assert.equal(node.name, 'dragger')
  }
  for (const [property, templateId] of [['title', '143:4215'], ['description', '143:4217'], ['body', '143:4219']]) {
    const contentId = variant.contentMapping.find(m => m.ownerNodeId === templateId).nodeId
    assert.equal(variant[property], maps[0].get(contentId).parameters.textData.characters.replaceAll('\u001e', '-'))
  }
}
const assets = await read(join(base, `assets-${date}.json`))
for (const asset of assets.assets) assert.equal(hash((await readFile(join(root, asset.projectPath.slice(1)), 'utf8')).trimEnd()), asset.sha256)
console.log('Trust cost/doctor: 28/28 complete Layers + Dev CSS + native parameters + concrete PC owners; original and composed source locks pass')
if (!process.argv.includes('--source-only')) {
  const evidence = join(root, `artifacts/figma-content-${date}`)
  const source = await read(join(evidence, 'trust-article-source-qa.json'))
  assert.deepEqual(source.articles.map(a => a.key), ['cost', 'doctor'])
  for (const article of source.articles) {
    assert.ok(article.nMAE < 1 && article.pixelmatchPercent < 1)
    await access(article.reference); await access(article.local)
  }
  const reports = await Promise.all([join(evidence, 'trust-variants-final-qa.json'), join(evidence, 'production/trust-variants-production-qa.json')].map(read))
  const implementation = ['src/views/patient/TrustView.vue', 'src/components/common/TrustArticleDialog.vue', 'src/components/common/HomeSourceNode.vue', 'src/components/layout/PatientLayout.vue', 'src/assets/styles/main.css', 'docs/figma-source/trust-articles-revision/desktop-composition-lock-2026-10-22.json']
  const newest = Math.max(...await Promise.all(implementation.map(async name => (await stat(join(root, name))).mtimeMs)))
  for (const report of reports) {
    assert.ok(Date.parse(report.createdAt) >= newest, 'Evidence predates code/source lock')
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.articles.map(a => a.key), ['cost', 'doctor'])
    for (const article of report.articles) {
      assert.ok(article.visual.referenceKind.includes('not separate Figma desktop frame'), 'Do not mislabel generated composition as Figma screenshot')
      assert.ok(article.visual.nMAE < 1 && article.visual.pixelmatchPercent < 1)
      assert.deepEqual(article.visual.pixelmatchOptions, { threshold: .15, includeAA: false })
      assert.deepEqual(article.visual.missing, [])
      assert.deepEqual(article.visual.geometry.brokenImages, [])
      assert.ok((await stat(article.visual.local)).mtimeMs >= newest)
      assert.deepEqual(article.desktop.map(a => a.width), [1024, 1440, 1920])
      for (const row of article.desktop) for (const name of ['completeSourceCopy', 'noInventedRoute', 'noScreenshotUI', 'keyboardFocusTrap', 'backgroundLocked', 'escapeRestores', 'closeRestores', 'backdropRestores', 'fits', 'reducedMotion']) assert.equal(row.checks[name], true, `${article.key}/${row.width}/${name}`)
      assert.deepEqual(article.shortScreen, { topPadding: true, bottomReachable: true })
      assert.deepEqual(article.motion, { entryInterpolates: true, exitInterpolates: true, reducedMotionVerified: true })
      assert.equal(article.breakpointCleanup, true)
    }
  }
  for (let i = 0; i < reports[0].articles.length; i++) {
    const a = reports[0].articles[i], b = reports[1].articles[i]
    for (const field of ['nMAE', 'pixelmatchPercent', 'geometry', 'missing']) assert.deepEqual(a.visual[field], b.visual[field], `Production ${a.key}/${field} changed`)
    assert.deepEqual(a.desktop, b.desktop)
  }
  console.log('Trust cost/doctor: Figma source exports <1%; PC template-composition integration <1%; dev/production full copy, keyboard, short-screen, motion, resize cleanup and fresh evidence pass. Mobile UI deferred.')
}
