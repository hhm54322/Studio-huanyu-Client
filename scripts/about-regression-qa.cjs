// Desktop-only regression. Native source dimensions and actual Figma PNG are
// diagnostic inputs, never inferred implementation parameters.
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const assert = require('node:assert/strict')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/figma-regression-2026-10-22/about'))
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
const phase = process.env.HUANYU_QA_PHASE || 'diagnostic'
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'))
async function compare(reference, local, diffFile) {
  const a = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const b = await sharp(local).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(a.info, b.info)
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const diff = Buffer.alloc(a.data.length)
  const changed = pixelmatch(a.data, b.data, diff, a.info.width, a.info.height, { threshold: .15, includeAA: false })
  let sum = 0
  for (let i = 0; i < a.data.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(a.data[i + c] - b.data[i + c])
  await sharp(diff, { raw: a.info }).png().toFile(diffFile)
  return { pixelmatchPercent: changed * 100 / (a.info.width * a.info.height), nMAE: sum * 100 / (a.info.width * a.info.height * 3 * 255), reference, local, diff: diffFile }
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const native = await read(path.join(out, 'native-parameters-2026-10-22.json'))
  const nodes = new Map(native.nodes.map(n => [n.nodeId, n]))
  const source = path.join(out, 'about-figma.png')
  const complexSource = path.join(out, 'complex/complex-figma.png')
  const sourceMeta = await sharp(source).metadata()
  const frame = nodes.get('484:1703').parameters.size
  assert.equal(sourceMeta.width, frame.x * 2)
  assert.equal(sourceMeta.height, frame.y * 2)
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = []
  const report = { phase, sourceFrame: '484:1703', source, complexSourceFrame: '484:2501', complexSource, mobile: 'deferred by user', pixelmatchOptions: { threshold: .15, includeAA: false }, geometry: {}, sections: [], errors }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(base + '/about', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
    for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 700) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(30) }
    await page.evaluate(() => scrollTo(0, 0))
    await page.waitForTimeout(400)
    report.geometry = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src) }))
    const mapping = await read(path.join(root, 'docs/figma-source/about/complex-revision/node-to-code-2026-10-22.json'))
    report.missingOwners = await page.evaluate(nodes => nodes.filter(n => n.rendered && !document.querySelector(n.selector)).map(n => ({ nodeId: n.nodeId, selector: n.selector })), mapping.nodes)
    const local = path.join(out, `about-${phase}-local.png`)
    await page.screenshot({ path: local, fullPage: true })
    const complexGeometry = nodes.get('484:2070')
    const composite = path.join(out, 'about-user-specified-source-composite.png')
    await sharp(source).composite([{ input: complexSource, left: complexGeometry.framePosition.x * 2, top: complexGeometry.framePosition.y * 2 }]).png().toFile(composite)
    report.sourceComposition = { path: composite, kind: 'Documented composition of two actual Figma exports, not an independent Figma frame', pageFrame: '484:1703', replacementFrame: '484:2501', replacesNode: '484:2070', reason: 'User explicitly requested separately authored complex-case section' }
    if (report.geometry.height === frame.y && report.geometry.width === frame.x) report.visual = await compare(composite, local, path.join(out, `about-${phase}-diff.png`))
    for (const [id, selector] of [['484:1706', '.about-hero'], ['484:1718', '.about-network'], ['484:2070', '.about-complex'], ['484:2243', '.about-matching'], ['484:2305', '.about-proof'], ['484:2369', '.about-cta'], ['484:2382', '.patient-footer']]) {
      const n = nodes.get(id), bounds = await page.locator(selector).boundingBox()
      const reference = path.join(out, `${id.replace(':', '-')}-figma.png`)
      const crop = path.join(out, `${id.replace(':', '-')}-${phase}.png`)
      if (id === '484:2070') await fs.copyFile(complexSource, reference)
      else await sharp(source).extract({ left: Math.round(n.framePosition.x * 2), top: Math.round(n.framePosition.y * 2), width: Math.round(n.parameters.size.x * 2), height: Math.round(n.parameters.size.y * 2) }).png().toFile(reference)
      await sharp(local).extract({ left: Math.round(bounds.x * 2), top: Math.round(bounds.y * 2), width: Math.round(bounds.width * 2), height: Math.round(bounds.height * 2) }).png().toFile(crop)
      const geometry = { expected: { x: n.framePosition.x, y: n.framePosition.y, width: n.parameters.size.x, height: n.parameters.size.y }, actual: bounds }
      const matchesSize = n.parameters.size.x === bounds.width && n.parameters.size.y === bounds.height
      report.sections.push({ id, sourceNodeId: id === '484:2070' ? '484:2501' : id, selector, geometry, ...(matchesSize ? await compare(reference, crop, path.join(out, `${id.replace(':', '-')}-${phase}-diff.png`)) : { sizeMismatch: true }) })
    }
    const sourceBaseline = path.join(root, 'docs/figma-source/about/complex-revision/baseline-2026-10-22.html')
    await page.goto(base + '/about', { waitUntil: 'domcontentloaded' })
    await page.setContent(await fs.readFile(sourceBaseline, 'utf8'))
    await page.evaluate(() => document.fonts.ready)
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
    const baselineLocal = path.join(out, `complex-${phase}-baseline.png`)
    await page.locator('[data-figma-node="484:2501"]').screenshot({ path: baselineLocal })
    report.baselineVisual = await compare(complexSource, baselineLocal, path.join(out, `complex-${phase}-baseline-diff.png`))
    const detailParameters = await read(path.join(out, 'complex-detail/native-parameters-2026-10-22.json'))
    const detailNode = detailParameters.nodes.find(n => n.nodeId === '484:2649')
    const detailSource = path.join(out, 'complex-detail/complex-detail-figma.png')
    const detailReference = path.join(out, 'complex-detail-reference.png')
    await sharp(detailSource).extract({ left: detailNode.framePosition.x * 2, top: detailNode.framePosition.y * 2, width: detailNode.parameters.size.x * 2, height: detailNode.parameters.size.y * 2 }).png().toFile(detailReference)
    await page.setViewportSize({ width: 1440, height: 1279 })
    await page.goto(base + '/about', { waitUntil: 'networkidle' })
    await page.locator('.complex-card__read').click()
    await page.locator('.complex-detail-modal').waitFor()
    await page.waitForTimeout(200)
    const detailLocal = path.join(out, `complex-detail-${phase}-local.png`)
    await page.locator('.complex-detail-modal').screenshot({ path: detailLocal })
    report.detailVisual = await compare(detailReference, detailLocal, path.join(out, `complex-detail-${phase}-diff.png`))
    report.detailVisual.sourceFrame = '484:2646'
    report.detailVisual.panelNode = '484:2649'
    report.detailVisual.panelGeometry = await page.locator('.complex-detail-modal').boundingBox()
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, `${phase}-qa.json`), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
    assert.deepEqual(errors, [])
    assert.deepEqual(report.geometry.brokenImages, [])
    assert.deepEqual(report.missingOwners, [])
    assert.equal(report.geometry.width, 1440)
    if (phase !== 'diagnostic') {
      assert.equal(report.geometry.height, frame.y)
      for (const visual of [report.visual, report.baselineVisual, report.detailVisual, ...report.sections]) {
        assert.ok(!visual.sizeMismatch && visual.pixelmatchPercent < 1 && visual.nMAE < 1, `Visual gate failed: ${JSON.stringify(visual)}`)
      }
    }
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
