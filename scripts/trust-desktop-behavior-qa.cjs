const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'artifacts/figma-trust-2026-10-29')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const phase = process.env.HUANYU_QA_PHASE || 'development'
const prefix = phase === 'production' ? 'production-' : ''
const articleIds = ['jci', 'cost', 'doctor', 'medicine', 'infection', 'rights', 'privacy', 'muslim']
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: new Date().toISOString(), desktop: [], errors: [], checks: {} }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    page.on('pageerror', e => report.errors.push(e.message))
    await page.goto(base + '/trust', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('.trust-desktop-source').count(), 1)
    assert.equal(await page.locator('[data-trust-article]').count(), 8)
    assert.equal(await page.locator('[data-trust-assurance]').count(), 4)
    assert.equal(await page.locator('[aria-controls^="trust-answer-"]').count(), 4)
    report.checks.sourceStructure = true
    // Every assurance expands independently and remains keyboard accessible.
    const assuranceHeights = []
    for (let i = 0; i < 4; i++) {
      const card = page.locator(`[data-trust-assurance="${i}"]`)
      await card.focus()
      if (await card.getAttribute('aria-expanded') === 'true') await card.press('Enter')
      const before = await card.boundingBox(); await card.press('Enter')
      await page.waitForTimeout(420)
      const after = await card.boundingBox(); assert.ok(after.height > before.height)
      assuranceHeights.push({ index: i, before: before.height, after: after.height, expanded: await card.getAttribute('aria-expanded') })
      await card.press('Space'); assert.equal(await card.getAttribute('aria-expanded'), 'false')
    }
    report.checks.assuranceIndependent = assuranceHeights
    // The resting source has FAQ 01 expanded. Each row can be selected without
    // changing the page scroll position and Escape is not hijacked by the page.
    const faq = page.locator('[aria-controls^="trust-answer-"]')
    assert.equal(await faq.nth(0).getAttribute('aria-expanded'), 'true')
    await faq.nth(2).focus(); const scrollBefore = await page.evaluate(() => scrollY); await faq.nth(2).press('Enter')
    assert.equal(await faq.nth(2).getAttribute('aria-expanded'), 'true'); assert.equal(await page.evaluate(() => scrollY), scrollBefore)
    assert.equal(await faq.nth(0).getAttribute('aria-expanded'), 'true'); report.checks.faqIndependentAccordion = true
    await faq.nth(2).press('Enter')
    // Clicking each authored source card opens its corresponding real dialog.
    for (const key of articleIds) {
      const card = page.locator(`[data-trust-article="${key}"]`)
      assert.equal(await card.count(), 1, `${key}: source card missing`)
      await card.focus(); const triggerScroll = await page.evaluate(() => scrollY); await card.press('Enter')
      const dialog = page.locator('dialog[open]')
      await dialog.waitFor()
      const articleFrames = { cost:'1595:3491', doctor:'1595:3519', medicine:'1595:3547', infection:'1595:3477', rights:'1595:3505', privacy:'1595:3533', muslim:'1595:3561' }
      if (key !== 'jci') assert.equal(await dialog.getAttribute('data-article-source'), articleFrames[key])
      assert.ok((await dialog.innerText()).length > 100, `${key}: article body missing`)
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
      const close = dialog.locator('button').first(); await close.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('dialog[open] button')), true)
      await close.press('Escape'); await dialog.waitFor({ state: 'hidden' }); assert.equal(await page.evaluate(() => scrollY), triggerScroll)
      assert.equal(await card.evaluate(el => document.activeElement === el), true)
    }
    report.checks.articles = articleIds.map(key => ({ key, openCloseEscapeFocus: true }))
    // Fixed header action remains available and does not create horizontal overflow.
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 1440)
    assert.equal((await page.locator('[data-figma-node="484:1472"]').count()) > 0, true)
    report.checks.headerAndOverflow = true
    for (const width of [1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(base + '/trust', { waitUntil: 'networkidle' })
      const scale = Math.min(1, width / 1440)
      const geometry = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
      assert.equal(geometry.width, width); assert.deepEqual(geometry.broken, [])
      const toolkit = page.locator('[data-figma-node="204:5636"]'), title = page.locator('[data-figma-node="204:5638"]')
      assert.equal(await title.count(), 1)
      const top = await toolkit.evaluate(el => el.getBoundingClientRect().top + scrollY)
      const positions = []
      for (const offset of [0, 600, 1000, 1800, 2600]) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), top + offset * scale)
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
        positions.push({ offset, actualOffset: (await page.evaluate(() => scrollY)-top)/scale, box: await title.boundingBox() })
      }
      assert.ok(Math.abs(positions[1].box.y - 165 * scale) < 1)
      assert.ok(Math.abs(positions[1].box.y - positions[2].box.y) < 1)
      assert.ok(positions[4].box.y + positions[4].box.height <= (2783 - positions[4].actualOffset - 96) * scale + 1)
      for (const href of ['/steps/toolkit-detail', '/steps/toolkit-detail?article=visa', '/steps/toolkit-detail?article=steps-flow']) {
        const link = page.locator(`.trust-desktop-source__canvas a[href="${href}"]`)
        assert.equal(await link.count(), 1)
        await link.focus(); await link.press('Enter'); await page.waitForURL('**' + href)
        await page.goBack({ waitUntil: 'networkidle' })
      }
      const card = page.locator('[data-trust-article="jci"]'); await card.focus(); const saved = await page.evaluate(() => scrollY)
      await card.press('Enter'); const dialog = page.locator('dialog[open]'); await dialog.waitFor(); await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' })
      assert.equal(await page.evaluate(() => scrollY), saved); assert.equal(await card.evaluate(el => document.activeElement === el), true)
      const faq = page.locator('[aria-controls^="trust-answer-"]'); await faq.nth(3).focus(); await faq.nth(3).press('Enter')
      assert.equal(await faq.nth(0).getAttribute('aria-expanded'), 'true'); assert.equal(await faq.nth(3).getAttribute('aria-expanded'), 'true')
      report.desktop.push({ width, geometry, oneStickyTitle: true, positions, toolkitEntries: true, dialogRestores: true, independentFaq: true })
      await page.screenshot({ path: path.join(out, `${prefix}desktop-${width}-live.png`) })
    }
    assert.deepEqual(report.errors, [])
    report.createdAt = new Date().toISOString()
    report.phase = phase
    await page.screenshot({ path: path.join(out, `${prefix}desktop-behavior-final.png`), fullPage: true })
    await fs.writeFile(path.join(out, `${prefix}desktop-behavior-qa.json`), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
