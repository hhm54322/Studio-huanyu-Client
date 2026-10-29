const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
const phase = process.env.HUANYU_QA_PHASE || 'development'
const out = path.join(root, 'artifacts/figma-regression-2026-10-22/about')
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 1, `${message}: ${a} vs ${b}`)
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { phase, base, desktop: [], motion: {}, mobile: 'No mobile implementation or acceptance; user deferred mobile', errors: [] }
  try {
    for (const width of [1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1024 ? 600 : 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
      page.on('pageerror', e => report.errors.push(e.message))
      await page.goto(base + '/about', { waitUntil: 'networkidle' })
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; return document.fonts.ready })
      await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
      const geometry = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src) }))
      assert.equal(geometry.width, width); assert.deepEqual(geometry.brokenImages, [])
      const cards = page.locator('.complex-card')
      const beforeUrl = page.url()
      for (let index = 1; index < 4; index++) {
        await cards.nth(index).click(); assert.equal(await cards.nth(index).getAttribute('aria-current'), 'true')
        await page.getByRole('dialog').waitFor()
        assert.equal(page.url(), beforeUrl)
        assert.equal(await page.locator('.complex-detail-modal--specialty').count(), 1)
        await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'hidden' })
        await cards.nth(index).focus(); await page.keyboard.press('Space')
        await page.getByRole('dialog').waitFor()
        await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'hidden' })
        assert.equal(page.url(), beforeUrl); assert.equal(await page.locator('.complex-detail-modal').count(), 0)
      }
      const trigger = page.locator('.complex-card__read')
      await trigger.scrollIntoViewIfNeeded(); await trigger.focus()
      const originalY = await page.evaluate(() => scrollY)
      await page.keyboard.press('Enter')
      await page.getByRole('dialog', { name: '复杂骨科 · 关节置换', exact: true }).waitFor()
      await page.waitForTimeout(100)
      assert.equal(await page.locator('.complex-detail-modal').count(), 1, 'Nested card keyboard must not swallow the article button')
      const panel = page.locator('.complex-detail-modal'), close = page.locator('.complex-detail-close')
      const bounds = await panel.boundingBox()
      assert.ok(bounds.y >= 40 && bounds.y + bounds.height <= (width === 1024 ? 600 : 900) - 40 + 1, 'Short screen safe area')
      const info = await panel.evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth, height: el.clientHeight, scrollHeight: el.scrollHeight, locked: document.body.style.overflow === 'hidden', focusInside: el.contains(document.activeElement), headings: [...el.querySelectorAll('h3')].map(h => h.textContent) }))
      assert.ok(info.scrollWidth <= info.width); assert.equal(info.locked, true); assert.equal(info.focusInside, true); assert.equal(info.headings.length, 5)
      await page.screenshot({ path: path.join(out, `${phase}-complex-${width}-viewport.png`) })
      await page.keyboard.press('Shift+Tab'); assert.equal(await close.evaluate(el => el === document.activeElement), true)
      await page.keyboard.press('Tab'); assert.equal(await close.evaluate(el => el === document.activeElement), true)
      await panel.evaluate(el => { el.scrollTop = el.scrollHeight }); await page.waitForTimeout(50)
      assert.ok(await panel.locator('h3').last().isVisible())
      await page.keyboard.press('Escape'); await panel.waitFor({ state: 'detached' })
      near(await page.evaluate(() => scrollY), originalY, 'Escape restores original page scroll')
      assert.equal(await trigger.evaluate(el => el === document.activeElement), true)
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')
      for (const mode of ['close', 'outside']) {
        await trigger.click(); await panel.waitFor()
        await page.waitForTimeout(100)
        if (mode === 'close') await close.click()
        else await page.locator('.complex-detail-backdrop').click({ position: { x: 4, y: 4 } })
        await panel.waitFor({ state: 'detached' }); near(await page.evaluate(() => scrollY), originalY, `${mode} restores page scroll`)
      }
      const proof = page.locator('.proof-card')
      await proof.nth(0).locator('h3').click(); await proof.nth(1).locator('h3').click()
      assert.equal(await page.getByRole('button', { name: '收起可信度详情', exact: true }).count(), 2)
      assert.equal(await page.locator('.trust-detail-backdrop').count(), 0); assert.equal(page.url(), beforeUrl)
      await proof.nth(0).getByRole('button').click(); assert.equal(await proof.nth(0).getByRole('button').getAttribute('aria-expanded'), 'false')
      assert.equal(await proof.nth(1).getByRole('button').getAttribute('aria-expanded'), 'true')
      await proof.nth(1).getByRole('button').focus(); await page.keyboard.press('Enter')
      assert.equal(await page.getByRole('button', { name: '收起可信度详情', exact: true }).count(), 0)
      for (let index = 0; index < 4; index++) await proof.nth(index).locator('h3').click()
      assert.equal(await page.getByRole('button', { name: '收起可信度详情', exact: true }).count(), 4)
      for (let index = 0; index < 4; index++) {
        assert.equal(await proof.nth(index).locator('.proof-card__detail').getAttribute('aria-hidden'), 'false')
        const box = await proof.nth(index).boundingBox()
        assert.ok(box.x >= 0 && box.x + box.width <= width)
      }
      await page.locator('.about-proof').screenshot({ path: path.join(out, `${phase}-proof-all-open-${width}.png`) })
      for (let index = 0; index < 4; index++) await proof.nth(index).getByRole('button').click()
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')
      for (const text of ['免费远程评估', '开始免费评估']) {
        const cta = page.getByRole('button', { name: text, exact: true })
        await cta.click(); await page.getByRole('dialog', { name: '把情况告诉阿宁', exact: true }).waitFor()
        assert.equal(await page.locator('#consult-name').evaluate(el => document.activeElement === el), true)
        await page.keyboard.press('Escape'); await page.locator('.consult-overlay').waitFor({ state: 'detached' })
        assert.equal(await cta.evaluate(el => document.activeElement === el), true)
      }
      assert.equal(await page.getByRole('link', { name: 'contact@huanyuyunyi.com', exact: true }).getAttribute('href'), 'mailto:contact@huanyuyunyi.com')
      assert.ok((await page.getByRole('link', { name: 'WhatsApp', exact: true }).getAttribute('href')).startsWith('https://wa.me/'))
      const reduced = await page.locator('.proof-card__detail').first().evaluate(el => ({ duration: getComputedStyle(el).transitionDuration, heroOpacity: getComputedStyle(document.querySelector('.about-hero__content')).opacity }))
      assert.ok(parseFloat(reduced.duration) <= 0.00001); assert.equal(reduced.heroOpacity, '1')
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
      await page.evaluate(() => scrollTo(0, 0))
      await page.screenshot({ path: path.join(out, `${phase}-about-${width}-settled.png`), fullPage: true })
      report.desktop.push({ width, geometry, complexDialog: { ...info, keyboardOpen: true, escapeClose: true, outsideClose: true, buttonClose: true, focusLoop: true, scrollRestored: true, focusRestored: true }, proofIndependentCards: 4, consultationEntries: 2, reducedMotion: true, contacts: true })
      await page.close()
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
    await page.goto(base + '/about', { waitUntil: 'networkidle' })
    await page.locator('.about-proof').scrollIntoViewIfNeeded(); await page.waitForTimeout(1000)
    const card = page.locator('.proof-card').first(), detail = card.locator('.proof-card__detail')
    await card.locator('h3').click()
    const states = await detail.evaluate(async el => {
      const animation = el.getAnimations().find(a => a.transitionProperty === 'grid-template-rows')
      if (!animation) throw Error('Accordion height transition missing')
      const result = []
      for (const a of el.getAnimations()) a.pause()
      for (const time of [0, 120, 360]) {
        for (const a of el.getAnimations()) a.currentTime = Math.min(time, Number(a.effect.getTiming().duration))
        await new Promise(requestAnimationFrame)
        result.push({ height: el.getBoundingClientRect().height, bodyWidth: el.querySelector('.proof-card__detail-inner').getBoundingClientRect().width })
      }
      for (const a of el.getAnimations()) a.finish()
      return result
    })
    assert.ok(states[0].height < states[1].height && states[1].height < states[2].height, JSON.stringify(states))
    near(states[0].bodyWidth, states[2].bodyWidth, 'Accordion keeps text width stable')
    await page.waitForTimeout(500); await card.getByRole('button').click(); await page.waitForTimeout(500)
    const button = page.locator('.complex-card__read'); await button.click()
    await page.locator('.complex-detail-modal').waitFor()
    await page.waitForTimeout(70)
    const motion = await page.locator('.complex-detail-modal').evaluate(async el => {
      const a = el.getAnimations().find(a => a.transitionProperty === 'transform')
      if (!a) throw Error('Complex dialog enter transition missing')
      a.pause(); const result = []
      for (const time of [0, 140, 380]) { a.currentTime = time; await new Promise(requestAnimationFrame); result.push(getComputedStyle(el).transform) }
      a.finish(); return result
    })
    assert.notEqual(motion[0], motion[1]); assert.notEqual(motion[1], motion[2])
    await page.waitForTimeout(500); await page.keyboard.press('Escape'); await page.locator('.complex-detail-modal').waitFor({ state: 'detached' })
    report.motion = { accordionInterpolates: true, accordionStates: states, textWidthStable: true, complexEnterInterpolates: true, complexTransforms: motion, reducedMotionVerified: true }
    await page.close()
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, `${phase}-behavior-qa.json`), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2)); assert.deepEqual(report.errors, [])
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
