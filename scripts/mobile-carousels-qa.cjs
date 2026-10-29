const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const tools = process.env.HUANYU_QA_TOOLS || '/tmp/huanyu-visual-qa-tools/node_modules'
const { chromium, devices } = require(path.join(tools, 'playwright'))
const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const out = path.resolve(process.env.HUANYU_QA_OUT || 'artifacts/mobile-feedback-2026-10-10/carousels')
const results = []
const fixtures = [
  { name: 'home', route: '/', root: '.patient-story__viewport', slides: '.patient-story__content', controls: '.patient-story__image > span button', pause: '.patient-story__pause', initial: 1, next: '.care-section' },
  { name: 'why-china', route: '/why-china', root: '.story-carousel', slides: '.story-grid article', current: '.story-card--active', controls: '.story-carousel__controls > div button', pause: '.story-carousel__controls > button', initial: 0, next: '.why-cta' },
]
async function swipe(page, selector, dx, dy) {
  await page.locator(selector).evaluate((el, delta) => {
    const r = el.getBoundingClientRect()
    const touch = (x, y) => new Touch({ identifier: 1, target: el, clientX: r.x + r.width / 2 + x, clientY: r.y + 50 + y })
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [touch(0, 0)] }))
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [touch(delta.dx, delta.dy)] }))
  }, { dx, dy })
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: process.env.HUANYU_QA_BROWSER })
  try {
    for (const fixture of fixtures) {
      for (const width of [320, 390, 430, 768, 1440]) {
        const context = await browser.newContext({ ...(width < 768 ? devices['iPhone 13'] : {}), viewport: { width, height: 900 }, reducedMotion: 'reduce' })
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', e => errors.push(e.message))
        await page.goto(origin + fixture.route, { waitUntil: 'networkidle' })
        await page.locator(fixture.root).scrollIntoViewIfNeeded()
        await page.waitForTimeout(500)
        if (fixture.name === 'why-china' && width > 700) {
          assert.equal(await page.locator(fixture.slides + '[aria-hidden="true"]').count(), 0)
          assert.equal(await page.locator(fixture.slides + '[inert]').count(), 0)
        } else {
          const nextTop = await page.locator(fixture.next).evaluate(el => el.getBoundingClientRect().top + scrollY)
          for (let index = 0; index < 3; index++) {
            await page.locator(fixture.controls).nth(index).click()
            assert.equal(await page.locator(fixture.controls).nth(index).getAttribute('aria-pressed'), 'true')
            assert.equal(await page.locator(fixture.slides + '[aria-hidden="false"]').count(), 1)
            assert.equal(await page.locator(fixture.slides + '[inert]').count(), 2)
            assert.ok(Math.abs(await page.locator(fixture.next).evaluate(el => el.getBoundingClientRect().top + scrollY) - nextTop) < 1, 'carousel moved the next section')
            if (fixture.name === 'home') {
              const cta = await page.locator('.patient-story__content--active a').evaluate(el => {
                const range = document.createRange()
                range.selectNode(el.firstChild)
                const text = range.getBoundingClientRect(), button = el.getBoundingClientRect()
                return { lines: range.getClientRects().length, textBottom: text.bottom, buttonBottom: button.bottom }
              })
              assert.equal(cta.lines, 1, `home ${width}px case ${index}: CTA wraps vertically`)
              assert.ok(cta.textBottom <= cta.buttonBottom + 1, `home ${width}px case ${index}: CTA text spills outside button`)
            }
            await page.locator(fixture.root).screenshot({ path: path.join(out, `${fixture.name}-${width}-${index}.png`) })
          }
          if (width <= 700) {
            await swipe(page, fixture.root, -110, 5)
            assert.equal(await page.locator(fixture.controls).nth(0).getAttribute('aria-pressed'), 'true')
            await swipe(page, fixture.root, 5, 110)
            assert.equal(await page.locator(fixture.controls).nth(0).getAttribute('aria-pressed'), 'true', 'vertical scroll changed the case')
          }
          await page.locator(fixture.controls).nth(0).click()
          await page.locator(fixture.controls).nth(0).focus()
          await page.keyboard.press('ArrowRight')
          assert.equal(await page.locator(fixture.controls).nth(1).getAttribute('aria-pressed'), 'true')
          await page.keyboard.press('ArrowRight')
          assert.equal(await page.locator(fixture.controls).nth(2).getAttribute('aria-pressed'), 'true', 'keyboard focus was lost after switching')
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
        assert.deepEqual(errors, [])
        results.push({ page: fixture.name, width, manual: true, noLayoutShift: true })
        await context.close()
      }
      const context = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
      const page = await context.newPage()
      // Browser clock exercises the real timer callbacks without slow wall-clock waits.
      await page.clock.install()
      await page.goto(origin + fixture.route, { waitUntil: 'networkidle' })
      await page.clock.runFor(7000)
      assert.equal(await page.locator(fixture.controls).nth(fixture.initial).getAttribute('aria-pressed'), 'true', 'offscreen carousel advanced')
      await page.locator(fixture.root).scrollIntoViewIfNeeded()
      await page.mouse.move(0, 0)
      await page.waitForTimeout(300)
      await page.clock.runFor(7000)
      assert.equal(await page.locator(fixture.controls).nth((fixture.initial + 1) % 3).getAttribute('aria-pressed'), 'true', 'visible carousel did not autoplay')
      await page.locator(fixture.pause).click()
      await page.evaluate(() => document.activeElement.blur())
      await page.mouse.move(0, 0)
      await page.clock.runFor(14000)
      assert.equal(await page.locator(fixture.controls).nth((fixture.initial + 1) % 3).getAttribute('aria-pressed'), 'true', 'paused carousel advanced')
      await page.locator(fixture.pause).click()
      await page.evaluate(() => document.activeElement.blur())
      await page.mouse.move(0, 0)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForTimeout(100)
      await page.clock.runFor(14000)
      assert.equal(await page.locator(fixture.controls).nth((fixture.initial + 1) % 3).getAttribute('aria-pressed'), 'true', 'reduced-motion carousel advanced')
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.waitForTimeout(100)
      await page.clock.runFor(7000)
      assert.equal(await page.locator(fixture.controls).nth((fixture.initial + 2) % 3).getAttribute('aria-pressed'), 'true', 'autoplay did not resume')
      results.push({ page: fixture.name, autoplay: true, offscreenPause: true, explicitPause: true, reducedMotion: true, resume: true })
      await context.close()
      console.log(`${fixture.name}: responsive screenshots, autoplay, manual selection, swipe, keyboard, pauses and stable layout passed`)
    }
  } finally { await browser.close() }
  await fs.writeFile(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
