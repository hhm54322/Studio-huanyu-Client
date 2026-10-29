const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const root = path.resolve(__dirname, '..')
const out = path.join(root, 'artifacts/figma-trust-2026-10-29')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const phase = process.env.HUANYU_QA_PHASE || 'development'
const source = path.join(root, 'docs/figma-source/trust/revision-2026-10-29/assurances')
const textIds = ['143:3690', '143:3646', '143:3660', '143:3674']
const runtimeTextIds = ['143:2554', ...textIds.slice(1)]
const expandedHeights = [374, 350, 374, 374]

async function main() {
  const params = JSON.parse(await fs.readFile(path.join(source, 'native-parameters-2026-10-29.json'), 'utf8'))
  const exactCopy = textIds.map(id => params.nodes.find(n => n.nodeId === id).parameters.textData.characters)
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { phase, createdAt: '', sourceFrame: '143:3624', cards: [], errors: [] }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => report.errors.push(e.message))
    await page.goto(base + '/trust', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    for (let i = 0; i < 4; i++) {
      const card = page.locator(`[data-trust-assurance="${i}"]`)
      if (await card.getAttribute('aria-expanded') !== 'true') await card.click()
      const box = await card.boundingBox()
      assert.equal(box.height, expandedHeights[i])
      const copy = card.locator(`[data-figma-node="${runtimeTextIds[i]}"] .home-source-node__accessible-text`)
      assert.equal(await copy.textContent(), exactCopy[i])
      const copyBox = await copy.locator('..').boundingBox()
      assert.equal(copyBox.x, box.x + 24)
      assert.equal(copyBox.y, box.y + 254)
      assert.equal(copyBox.width, 238)
      report.cards.push({ index: i, height: box.height, exactCopy: true, copyBox })
    }
    assert.equal(await page.locator('[data-trust-assurance][aria-expanded="true"]').count(), 4)
    const mapping = JSON.parse(await fs.readFile(path.join(source, 'runtime-mapping-2026-10-29.json'), 'utf8'))
    report.sourceOwners = await page.evaluate(nodes => nodes.map(node => ({ nodeId: node.nodeId, present: Boolean(document.querySelector(node.selector)) })), mapping.nodes)
    assert.equal(report.sourceOwners.length, 68)
    assert.deepEqual(report.sourceOwners.filter(node => !node.present), [])
    const full = await page.screenshot({ fullPage: true })
    report.screenshotState = await page.locator('[data-trust-assurance]').evaluateAll(cards => cards.map(card => ({
      expanded: card.getAttribute('aria-expanded'), height: card.getBoundingClientRect().height,
    })))
    assert.deepEqual(report.screenshotState, expandedHeights.map(height => ({ expanded: 'true', height })), 'Full-page capture must preserve all four expanded cards')
    const clip = { left: 224, top: 740, width: 2432, height: 748 }
    const reference = await sharp(path.join(out, 'assurances-figma-current.png')).extract(clip).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const local = await sharp(full).extract(clip).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    assert.deepEqual(local.info, reference.info)
    const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
    const diff = Buffer.alloc(local.data.length)
    const count = pixelmatch(reference.data, local.data, diff, local.info.width, local.info.height, { threshold: .15, includeAA: false })
    let sum = 0
    for (let i = 0; i < local.data.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(reference.data[i + c] - local.data[i + c])
    const pixels = local.info.width * local.info.height
    report.visual = { changedPixelRatio: count / pixels, nMAE: sum / (pixels * 3 * 255), reference: 'assurances-figma-current.png', clip, masking: 'none' }
    await sharp(reference.data, { raw: reference.info }).png().toFile(path.join(out, `${phase}-assurances-reference.png`))
    await sharp(local.data, { raw: local.info }).png().toFile(path.join(out, `${phase}-assurances-local.png`))
    await sharp(diff, { raw: local.info }).png().toFile(path.join(out, `${phase}-assurances-diff.png`))
    await page.screenshot({ path: path.join(out, `${phase}-assurances-context.png`) })
    assert.ok(report.visual.changedPixelRatio < .01 && report.visual.nMAE < .01, 'Expanded source comparison must be below 1%')
    for (let i = 0; i < 4; i++) {
      const card = page.locator(`[data-trust-assurance="${i}"]`)
      await card.focus()
      const y = await page.evaluate(() => scrollY)
      await card.press('Space')
      assert.equal((await card.boundingBox()).height, 262)
      assert.equal(await page.evaluate(() => scrollY), y)
      for (let j = 0; j < 4; j++) if (j !== i) assert.equal(await page.locator(`[data-trust-assurance="${j}"]`).getAttribute('aria-expanded'), 'true')
      await card.press('Enter')
    }
    const faq = page.locator('[aria-controls="trust-answer-1"]')
    await faq.press('Enter')
    await page.setViewportSize({ width: 800, height: 900 })
    await page.locator('.trust-desktop-source').waitFor({ state: 'hidden' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.locator('.trust-desktop-source').waitFor()
    assert.equal(await page.locator('[data-trust-assurance][aria-expanded="true"]').count(), 4)
    assert.equal(await faq.getAttribute('aria-expanded'), 'true')
    assert.equal(await page.locator('[aria-controls="trust-answer-0"]').getAttribute('aria-expanded'), 'true')
    await faq.press('Enter')
    report.responsiveState = { desktopBranchRemounted: true, assurancesPreserved: true, faqPreserved: true }
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const card = page.locator('[data-trust-assurance="1"]')
    await card.click(); await page.waitForTimeout(420)
    await card.click(); await page.waitForTimeout(100)
    const middle = await card.boundingBox()
    const copy = card.locator('[data-figma-node="143:3646"]')
    const before = await copy.boundingBox()
    assert.ok(middle.height > 262 && middle.height < 350)
    await page.waitForTimeout(320)
    const after = await copy.boundingBox()
    assert.deepEqual(after, before, 'Text must retain stable geometry during the height animation')
    assert.equal((await card.boundingBox()).height, 350)
    report.behavior = { independent: true, keyboard: true, scrollStable: true, fixedTextDuringAnimation: true, reducedMotion: true }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 1440)
    assert.deepEqual(report.errors, [])
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, `${phase}-assurances-qa.json`), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
