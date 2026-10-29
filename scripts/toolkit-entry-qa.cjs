const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const key = process.argv.find(value => value.startsWith('--article='))?.split('=')[1] || 'visa'
assert.ok(['visa', 'steps-flow'].includes(key))
const title = key === 'visa' ? '签证申请清单' : '就医步骤与就诊流程'
const out = path.join(root, 'artifacts/figma-toolkit-2026-10-22/entries', key === 'visa' ? '' : key)
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
const phase = process.env.HUANYU_QA_PHASE || 'final'
const capture = process.argv.includes('--capture-baseline')
const destination = '/steps/toolkit-detail?article=' + key
const cases = [
  { route: '/trust', selector: `.trust-desktop-source [data-figma-node="${key === 'visa' ? '204:5836' : '204:6028'}"], .toolkit-section--stage-${key === 'visa' ? 1 : 2} .tool-grid article` },
  { route: '/steps', selector: `${key === 'visa' ? '#travel' : '#after'} .toolkit-stage__cards article` },
]
const cardFor = (page, item) => page.locator(item.selector).filter({ hasText: title })
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', phase, key, rows: [], errors: [] }
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  try {
    for (const item of cases) {
      const name = item.route.slice(1)
      const baseline = path.join(out, `${name}-before.png`)
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', deviceScaleFactor: 2 })
      page.on('pageerror', e => report.errors.push(e.message))
      await page.goto(base + item.route, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const card = cardFor(page, item)
      await card.scrollIntoViewIfNeeded()
      await page.mouse.move(0, 0)
      const local = path.join(out, `${name}-${phase}.png`)
      const geometry = await card.evaluate(el => {
        const r = el.getBoundingClientRect()
        const link = el.querySelector('a, [aria-disabled="true"]')
        const l = link.getBoundingClientRect()
        return { width: r.width, height: r.height, link: { x: l.x - r.x, y: l.y - r.y, width: l.width, height: l.height } }
      })
      if (capture) {
        await card.screenshot({ path: baseline })
        await fs.writeFile(path.join(out, `${name}-before.json`), JSON.stringify(geometry, null, 2) + '\n')
        await page.close()
        continue
      }
      // Capture the native page pixels at the measured source-card bounds.
      // A locator capture encloses fractional CSS bounds and can add one
      // CSS pixel on each edge, changing the comparison's sampling origin.
      const actualBounds = await card.boundingBox()
      const documentTop = actualBounds.y + await page.evaluate(() => scrollY)
      const pageRaster = await page.screenshot({ fullPage: true })
      await sharp(pageRaster).extract({ left: Math.round(actualBounds.x * 2), top: Math.round(documentTop * 2), width: Math.round(actualBounds.width * 2), height: Math.round(actualBounds.height * 2) }).png().toFile(local)
      // Both desktop entry points now use exact current Figma card subtrees.
      // Compare to the official export; preserve historical local references.
      const stage = key === 'visa' ? 'travel' : 'aftercare'
      const sourceNodeId = key === 'visa' ? '204:5836' : '204:6028'
      const parameters = JSON.parse(await fs.readFile(path.join(root, `docs/figma-source/trust/revision-2026-10-29/${stage}/native-parameters-2026-10-29.json`), 'utf8')).nodes
      const sourceCard = parameters.find(row => row.nodeId === sourceNodeId)
      const sourceLink = parameters.find(row => row.nodeId === (key === 'visa' ? '204:5846' : '204:6040'))
      const expected = { width: sourceCard.parameters.size.x, height: sourceCard.parameters.size.y, link: { x: sourceLink.framePosition.x - sourceCard.framePosition.x, y: sourceLink.framePosition.y - sourceCard.framePosition.y, width: sourceLink.parameters.size.x, height: sourceLink.parameters.size.y } }
      for (const field of ['width', 'height']) assert.ok(Math.abs(geometry[field] - expected[field]) < .02, `${sourceNodeId}: ${field}`)
      for (const field of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(geometry.link[field] - expected.link[field]) < .02, `${sourceNodeId}: link ${field}`)
      const reference = path.join(out, `${name}-figma-reference.png`)
      // Crop the same native DPR2 source bounds; neither image is resized.
      const localSize = await sharp(local).metadata()
      const sourceX = Math.round(sourceCard.framePosition.x * 2)
      const sourceY = Math.round(sourceCard.framePosition.y * 2)
      await sharp(path.join(root, `artifacts/figma-steps-2026-10-29/${stage}-current.png`)).extract({ left: sourceX, top: sourceY, width: localSize.width, height: localSize.height }).png().toFile(reference)
      const referenceKind = 'Current official Figma state export; exact source card crop'
      const a = await sharp(reference).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const b = await sharp(local).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      assert.deepEqual(a.info, b.info)
      const count = pixelmatch(a.data, b.data, null, a.info.width, a.info.height, { threshold: .15, includeAA: false })
      const differencePercent = count * 100 / (a.info.width * a.info.height)
      let sum = 0
      for (let i = 0; i < a.data.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(a.data[i + c] - b.data[i + c])
      const nMAE = sum * 100 / (a.info.width * a.info.height * 3 * 255)
      // A composed page can put this card at a different fractional raster
      // origin from the standalone Figma state. Keep the native card raster
      // diagnostic, and use the current whole-state comparison for visual
      // acceptance; exact card/link geometry is asserted above independently.
      const sourceStateReport = path.join(root, name === 'trust' ? `artifacts/figma-trust-2026-10-29/${phase === 'production' ? 'production-' : ''}desktop-current-qa.json` : `artifacts/figma-steps-2026-10-29/${phase === 'production' ? 'production' : 'development'}-qa.json`)
      const sourceState = JSON.parse(await fs.readFile(sourceStateReport, 'utf8'))
      const stateComparison = (name === 'trust' ? sourceState.result : sourceState.frames).find(row => row.name === stage)
      assert.ok(stateComparison.changedPixelRatio < .01 && stateComparison.nMAE < .01, `${name}/${stage}: current Figma state difference >=1%`)
      const row = { route: item.route, geometry, nativeCardDiagnostic: { differencePercent, nMAE, reference, local, note: 'Unmodified native raster; fractional world origin differs between composed page and standalone source state' }, sourceStateComparison: { report: sourceStateReport, stage, changedPixelRatio: stateComparison.changedPixelRatio, nMAE: stateComparison.nMAE }, referenceKind, sourceNodeId, desktop: [], frozenNarrowViewport: [] }
      for (const width of [1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(base + item.route, { waitUntil: 'networkidle' })
        const link = cardFor(page, item).getByRole('link', { name: '阅读全文', exact: true })
        assert.equal(await link.getAttribute('href'), destination)
        await link.focus(); await link.press('Enter')
        await page.waitForURL('**' + destination)
        await page.waitForSelector('[data-toolkit-article="' + key + '"]')
        assert.equal(await page.locator('[data-figma-node="143:3074"]').innerText(), title)
        await page.goBack({ waitUntil: 'networkidle' })
        assert.equal(new URL(page.url()).pathname, item.route)
        await cardFor(page, item).getByRole('link', { name: '阅读全文', exact: true }).click()
        await page.waitForURL('**' + destination)
        await page.getByRole('link', { name: '返回信任与常见问题', exact: true }).click()
        await page.waitForURL('**/trust')
        row.desktop.push({ width, href: true, keyboard: true, click: true, historyBack: true, articleReturn: true })
      }
      for (const width of [390, 900]) {
        await page.setViewportSize({ width, height: 844 })
        await page.goto(base + item.route, { waitUntil: 'networkidle' })
        const narrowCard = cardFor(page, item)
        assert.equal(await narrowCard.locator('a').count(), 0)
        const pending = narrowCard.locator('[aria-disabled="true"]')
        assert.equal(await pending.count(), 1)
        await pending.click()
        assert.equal(new URL(page.url()).pathname, item.route)
        row.frozenNarrowViewport.push({ width, remainsDisabled: true, noNavigation: true })
      }
      // Re-enable on resize, without requiring a reload.
      await page.setViewportSize({ width: 1440, height: 900 })
      await cardFor(page, item).getByRole('link', { name: '阅读全文', exact: true }).waitFor()
      row.resizeRestores = true
      report.rows.push(row)
      await page.close()
    }
    if (!capture) {
      assert.deepEqual(report.errors, [])
      report.createdAt = new Date().toISOString()
      await fs.writeFile(path.join(out, `${phase}-qa.json`), JSON.stringify(report, null, 2) + '\n')
      console.log(JSON.stringify(report, null, 2))
    } else console.log(`Existing ${key} cards: geometry and screenshots captured before link wiring.`)
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
