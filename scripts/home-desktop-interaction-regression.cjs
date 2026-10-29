const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174/'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/figma-regression-2026-10-23/home/development/interactions')
const selector = id => `[data-figma-node="${id}"]`
const triggers = ['1412:5795','1412:5810','1412:5819','1412:5827','1412:5835','1412:5844']
const panels = ['143:4038','143:4223','143:4319','143:4087','143:4130','143:4170']

async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const results = [], errors = []
  try {
    for (const [width, height] of [[1024,600],[1440,900],[1920,1080]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
      page.on('pageerror', error => errors.push({ width, message: error.message }))
      await page.goto(base, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const cards = []
      for (const [index, id] of triggers.entries()) {
        const card = page.locator(selector(id))
        const more = card.locator(index ? '.home-why-card__more' : selector('1412:5804'))
        await card.scrollIntoViewIfNeeded()
        await page.mouse.move(0,0)
        await page.evaluate(() => document.activeElement?.blur())
        assert.equal(await more.evaluate(el => getComputedStyle(el).opacity), '0', `${index}/${width}: CTA visible at rest`)
        const before = await card.boundingBox()
        await card.hover()
        assert.equal(await more.evaluate(el => getComputedStyle(el).opacity), '1')
        assert.deepEqual(await card.boundingBox(), before, 'Hover moved the card')
        await card.screenshot({ path: path.join(output, `why-card-${index+1}-${width}-hover.png`) })
        // The whole card, not only the revealed CTA, must open the detail.
        await card.click({ position: { x: 20, y: 20 } })
        const y = await page.evaluate(() => scrollY)
        const dialog = page.locator('dialog.home-source-dialog[open]')
        await dialog.waitFor({ state: 'visible' })
        assert.equal(await dialog.locator(selector(panels[index])).count(), 1)
        assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden')
        for (let n = 0; n < 5; n++) {
          await page.keyboard.press(n % 2 ? 'Shift+Tab' : 'Tab')
          assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Modal focus escaped')
        }
        await dialog.evaluate(el => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' }))
        const box = await dialog.locator(selector(panels[index])).boundingBox()
        assert.ok(box.y + box.height <= height - 39, `${index}/${width}: short-screen bottom unreachable`)
        await dialog.evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }))
        await page.keyboard.press('Escape')
        assert.equal(await page.locator('dialog[open]').count(), 0)
        assert.equal(await page.evaluate(() => scrollY), y)
        assert.ok(await card.evaluate(el => el === document.activeElement))
        await page.mouse.move(0,0)
        await card.focus()
        assert.equal(await more.evaluate(el => getComputedStyle(el).opacity), '1', 'Keyboard focus must reveal CTA')
        await page.keyboard.press('Enter')
        await page.getByRole('button', { name: '关闭详情', exact: true }).click()
        assert.equal(await page.locator('dialog[open]').count(), 0)
        assert.equal(await page.evaluate(() => scrollY), y)
        await page.keyboard.press('Space')
        await page.locator('dialog[open]').waitFor({ state: 'visible' })
        await page.mouse.click(4,4)
        assert.equal(await page.locator('dialog[open]').count(), 0)
        assert.equal(await page.evaluate(() => scrollY), y)
        cards.push({ card: index + 1, hover: true, focus: true, wholeCard: true, enter: true, space: true, escape: true, button: true, backdrop: true, focusTrap: true, focusRestore: true, scrollRestore: true, bottomReachable: true })
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
      results.push({ width, height, cards })
      await page.close()
    }
    const page = await browser.newPage({ viewport: { width:1440, height:1000 }, reducedMotion:'no-preference' })
    page.on('pageerror', error => errors.push({ width:1440, message:error.message }))
    await page.goto(base, { waitUntil:'networkidle' })
    const card = page.locator(selector(triggers[1]))
    await card.scrollIntoViewIfNeeded()
    await page.mouse.move(0,0)
    const copy = card.locator('[data-home-why-copy]')
    const initial = await copy.evaluate(el => getComputedStyle(el).transform)
    await card.hover()
    await page.waitForTimeout(100)
    const mid = await copy.evaluate(el => getComputedStyle(el).transform)
    const alpha = await card.locator('.home-why-card__more').evaluate(el => Number(getComputedStyle(el).opacity))
    await page.waitForTimeout(300)
    const settled = await copy.evaluate(el => getComputedStyle(el).transform)
    assert.notEqual(mid, initial)
    assert.notEqual(mid, settled)
    assert.ok(alpha > 0 && alpha < 1, `CTA did not interpolate: ${alpha}`)
    await page.screenshot({ path:path.join(output,'why-card-motion-settled.png') })
    const first = page.locator(selector('1401:297')), second = page.locator(selector('1401:307'))
    assert.equal(await first.getAttribute('aria-expanded'), 'false', 'Design annotation: cards initially collapsed')
    await first.click()
    await first.scrollIntoViewIfNeeded()
    const answer = page.locator('#home-desktop-faq-answer-1')
    const before = await answer.evaluate(el => el.getBoundingClientRect().height)
    await second.click()
    const samples = []
    for (const delay of [0,100,350]) {
      if (delay) await page.waitForTimeout(delay)
      samples.push(await answer.evaluate(el => ({ height:el.getBoundingClientRect().height, width:el.querySelector('[data-figma-node="1401:305"]').getBoundingClientRect().width, scroll:scrollY })))
    }
    assert.ok(samples[1].height > before && samples[1].height < samples[2].height, 'FAQ height did not interpolate')
    assert.equal(samples[0].width, samples[1].width)
    assert.equal(samples[1].width, samples[2].width)
    assert.equal(await first.getAttribute('aria-expanded'), 'true')
    assert.equal(await second.getAttribute('aria-expanded'), 'true')
    await first.click()
    await page.waitForTimeout(450)
    assert.equal(await second.getAttribute('aria-expanded'), 'true')
    await page.emulateMedia({ reducedMotion:'reduce' })
    await page.mouse.move(0,0)
    await page.evaluate(() => document.activeElement?.blur())
    // The shared reduced-motion rule uses .01ms to preserve transition events.
    // Verify its numerical duration instead of requiring one CSS serialization.
    const reducedCardDuration = await copy.evaluate(el => getComputedStyle(el).transitionDuration)
    assert.ok(reducedCardDuration.split(',').every(value => Number.parseFloat(value) <= 0.00001), `Card motion remains enabled: ${reducedCardDuration}`)
    await second.click()
    const reducedFaqDuration = await answer.evaluate(el => getComputedStyle(el).transitionDuration)
    assert.ok(reducedFaqDuration.split(',').every(value => Number.parseFloat(value) <= 0.00001), `FAQ motion remains enabled: ${reducedFaqDuration}`)
    await page.close()
    assert.deepEqual(errors, [])
    const report = { createdAt:new Date().toISOString(), base, results, motion:{ cardInterpolates:true, cardSamples:{initial,mid,settled,alpha}, faqInterpolates:true, faqTextWidthStable:true, faqIndependent:true, faqSamples:samples, reducedMotion:true, reducedCardDuration, reducedFaqDuration }, errors }
    await fs.writeFile(path.join(output,'qa.json'), JSON.stringify(report,null,2)+'\n')
    console.log(JSON.stringify({ widths:results.map(row=>row.width), cards:results.reduce((sum,row)=>sum+row.cards.length,0), motion:report.motion, errors }))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode=1 })
