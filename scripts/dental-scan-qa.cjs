// Run against a local production preview: HUANYU_QA_URL=http://127.0.0.1:5174 node scripts/dental-scan-qa.cjs
const assert = require('node:assert/strict')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const origin = (process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174').replace(/\/$/, '')
const languages = ['zh', 'en', 'id', 'ms', 'pt']
const steps = [
  { id: 1, hero: '2294:8243', section: '2294:8250', steps: '2294:8256' },
  { id: 2, hero: '2294:6974', section: '2294:6981', steps: '2294:6987', trigger: '2294:8263' },
  { id: 3, hero: '2294:8040', section: '2294:8047', steps: '2294:8053', trigger: '2294:7000' },
]

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const checked = []
  try {
    for (const lang of languages) for (const width of [1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(`${origin}/dental?lang=${lang}`, { waitUntil: 'domcontentloaded' })
      for (const step of steps) {
        if (step.trigger) await page.locator(`[data-figma-node="${step.trigger}"]`).click()
        await page.locator(`[data-dental-step="${step.id}"]`).waitFor()
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const geometry = await page.evaluate(({ hero, section, steps }) => {
          const box = selector => {
            const node = document.querySelector(selector)
            if (!node) throw new Error(`Missing ${selector}`)
            const rect = node.getBoundingClientRect()
            return { top: rect.top + scrollY, bottom: rect.bottom + scrollY }
          }
          return { hero: box(`[data-figma-node="${hero}"]`), scan: box('.dental-scan'), card: box('.scan-card'), section: box(`[data-figma-node="${section}"]`), steps: box(`[data-figma-node="${steps}"]`) }
        }, step)
        assert.ok(geometry.scan.top >= geometry.hero.bottom - 1, `${lang}/${width}/${step.id}: scan overlaps hero`)
        assert.ok(geometry.section.top >= geometry.scan.bottom - 1, `${lang}/${width}/${step.id}: scan overlaps step section`)
        const gap = 96 * Math.min(1, width / 1440)
        assert.ok(Math.abs(geometry.card.top - geometry.hero.bottom - gap) < 1, `${lang}/${width}/${step.id}: incorrect spacing above animation`)
        assert.ok(Math.abs(geometry.steps.top - geometry.card.bottom - gap) < 1, `${lang}/${width}/${step.id}: incorrect spacing below animation`)
        await page.locator('.scan-card').scrollIntoViewIfNeeded()
        // Position updates are scheduled in requestAnimationFrame on scroll.
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const overlap = await page.evaluate(() => {
          const card = document.querySelector('.scan-card').getBoundingClientRect()
          const action = document.querySelector('.dental-floating-action')?.getBoundingClientRect()
          return action ? Math.max(0, Math.min(card.bottom, action.bottom) - Math.max(card.top, action.top)) : 0
        })
        assert.ok(overlap < 1, `${lang}/${width}/${step.id}: floating action overlaps scan`)
      }
      const labels = await page.evaluate(() => {
        const viewport = document.querySelector('.scan-viewport').getBoundingClientRect()
        const progress = document.querySelector('.scan-progress').getBoundingClientRect()
        return { left: progress.left - viewport.left, right: progress.right - viewport.right }
      })
      assert.ok(labels.left >= 0 && labels.right <= 1, `${lang}/${width}: scan progress out of bounds`)
      // Inspect actual pixels, not merely the background element's width: a
      // centered 1440px canvas can otherwise leave white strips on wide screens.
      await page.evaluate(() => scrollTo(0, document.querySelector('.dental-scan').getBoundingClientRect().top + scrollY - 120))
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const scanTop = await page.locator('.dental-scan').evaluate(element => element.getBoundingClientRect().top)
      const screenshot = await page.screenshot()
      const pixels = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      const y = Math.round(scanTop + 8 * Math.min(1, width / 1440))
      const sample = x => Array.from(pixels.data.subarray((y * pixels.info.width + x) * 3, (y * pixels.info.width + x) * 3 + 3))
      const center = sample(Math.floor(width / 2)), left = sample(2), right = sample(width - 3)
      for (const edge of [left, right]) assert.ok(edge.every((value, channel) => Math.abs(value - center[channel]) <= 2), `${lang}/${width}: background does not fill viewport`)
      assert.ok(center[0] < 253 && center[2] > center[0], `${lang}/${width}: expected pale blue background`)
      // Check every tooth in the final step, including long translated tooltips.
      const teeth = page.locator('.scan-tooth-group')
      assert.equal(await teeth.count(), 14)
      for (let index = 0; index < 14; index++) {
        await teeth.nth(index).focus()
        await page.waitForFunction(() => document.querySelector('.scan-tip.show'))
        await page.waitForTimeout(240) // allow the original tooltip transition to settle
        const label = await teeth.nth(index).getAttribute('aria-label')
        assert.ok(label?.trim(), `${lang}/${width}/${index}: missing project label`)
        const info = page.locator('.scan-tip.show')
        assert.ok((await info.locator('b').innerText()).includes(label), `${lang}/${width}/${index}: tooltip title does not match tooth`)
        assert.ok((await info.locator('.scan-price').innerText()).trim(), `${lang}/${width}/${index}: missing project price`)
        assert.ok((await info.locator('.scan-duration').innerText()).trim(), `${lang}/${width}/${index}: missing project duration`)
        const activeGap = await page.evaluate(() => document.querySelector('[data-figma-node="2294:8053"]').getBoundingClientRect().top - document.querySelector('.scan-card').getBoundingClientRect().bottom)
        assert.ok(Math.abs(activeGap - 96 * Math.min(1, width / 1440)) < 1, `${lang}/${width}/${index}: spacing changed while a tooth is active`)
        const position = await teeth.nth(index).evaluate(element => {
          const tooth = element.querySelector('.scan-tooth').getBoundingClientRect()
          const tooltip = document.querySelector('.scan-tip').getBoundingClientRect()
          const viewport = document.querySelector('.scan-viewport').getBoundingClientRect()
          return { toothCenter: tooth.top + tooth.height / 2, bottom: tooltip.bottom, left: tooltip.left - viewport.left, right: tooltip.right - viewport.right, top: tooltip.top - viewport.top }
        })
        assert.ok(position.bottom <= position.toothCenter && position.left >= -2 && position.right <= 2 && position.top >= -2, `${lang}/${width}/${index}: ${JSON.stringify(position)}`)
      }
      const toggle = page.getByRole('switch')
      await toggle.click()
      assert.equal(await toggle.getAttribute('aria-checked'), 'true')
      assert.equal(await page.locator('.scan-card.white .scan-spark').count(), 6)
      assert.deepEqual(errors, [])
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1)
      checked.push({ lang, width, steps: 3, teeth: 14 })
      await page.close()
    }
    const autoplayPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await autoplayPage.goto(`${origin}/dental`, { waitUntil: 'domcontentloaded' })
    await autoplayPage.locator('.scan-card').scrollIntoViewIfNeeded()
    await autoplayPage.locator('.scan-tip.show').waitFor({ timeout: 6000 })
    await autoplayPage.evaluate(() => scrollTo(0, document.querySelector('.dental-scan').getBoundingClientRect().bottom + scrollY + 50))
    await autoplayPage.waitForTimeout(300)
    await autoplayPage.locator('.scan-card').scrollIntoViewIfNeeded()
    await autoplayPage.waitForTimeout(300)
    assert.equal(await autoplayPage.locator('.scan-tip.show').count(), 0, 'A paused auto-demo must not leave a stale tooltip when revisited')
    await autoplayPage.close()
    const mixedInput = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    await mixedInput.goto(`${origin}/dental`, { waitUntil: 'domcontentloaded' })
    await mixedInput.locator('.scan-card').scrollIntoViewIfNeeded()
    const first = mixedInput.locator('.scan-tooth-group').nth(0)
    const second = mixedInput.locator('.scan-tooth-group').nth(1)
    await first.focus()
    await second.hover()
    assert.equal(await second.getAttribute('aria-pressed'), 'true')
    await mixedInput.mouse.move(0, 0)
    assert.equal(await first.getAttribute('aria-pressed'), 'true', 'Mouse exit restores keyboard focus')
    await first.blur()
    await second.hover()
    await first.focus()
    assert.equal(await first.getAttribute('aria-pressed'), 'true')
    await first.blur()
    assert.equal(await second.getAttribute('aria-pressed'), 'true', 'Keyboard blur restores mouse hover')
    await mixedInput.close()
    const resizePage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    await resizePage.goto(`${origin}/dental?lang=zh`, { waitUntil: 'domcontentloaded' })
    await resizePage.locator('.scan-card').scrollIntoViewIfNeeded()
    const selectedTooth = resizePage.locator('.scan-tooth-group').nth(1)
    await selectedTooth.focus()
    for (const width of [1920, 1024, 1440]) {
      await resizePage.setViewportSize({ width, height: 900 })
      await resizePage.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      assert.equal(await selectedTooth.getAttribute('aria-pressed'), 'true', `${width}: resized selection was lost`)
      const offset = await selectedTooth.evaluate(element => {
        const point = element.ownerSVGElement.createSVGPoint()
        const tooth = point.matrixTransform(element.getScreenCTM())
        const tip = document.querySelector('.scan-tip').getBoundingClientRect()
        return Math.abs(tooth.x - (tip.left + tip.right) / 2)
      })
      assert.ok(offset < 2, `${width}: resized tooltip is not aligned with its tooth (${offset}px)`)
    }
    await resizePage.close()
    const wideBackgrounds = []
    for (const width of [1660, 2560]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      await page.goto(`${origin}/dental?lang=zh`, { waitUntil: 'domcontentloaded' })
      await page.locator('.scan-card').waitFor()
      await page.evaluate(() => scrollTo(0, document.querySelector('.dental-scan').getBoundingClientRect().top + scrollY - 120))
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const geometry = await page.evaluate(() => {
        const scan = document.querySelector('.dental-scan').getBoundingClientRect()
        const card = document.querySelector('.scan-card').getBoundingClientRect()
        const steps = document.querySelector('[data-figma-node="2294:8256"]').getBoundingClientRect()
        return { y: Math.round(scan.top + 8), left: card.left, right: card.right, topGap: card.top - scan.top, bottomGap: steps.top - card.bottom, scrollWidth: document.documentElement.scrollWidth }
      })
      const image = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      const sample = x => Array.from(image.data.subarray((geometry.y * image.info.width + x) * 3, (geometry.y * image.info.width + x) * 3 + 3))
      const center = sample(Math.floor(width / 2))
      for (const edge of [sample(2), sample(width - 3)]) assert.ok(edge.every((value, channel) => Math.abs(value - center[channel]) <= 2), `${width}: blue background has white side strips`)
      assert.ok(center[0] < 253 && center[2] > center[0], `${width}: blue background is missing`)
      assert.ok(Math.abs(geometry.left - (width - geometry.right)) < 1, `${width}: animation is not centered`)
      assert.ok(Math.abs(geometry.topGap - 96) < 1 && Math.abs(geometry.bottomGap - 96) < 1, `${width}: inconsistent spacing`)
      assert.ok(geometry.scrollWidth <= width, `${width}: horizontal overflow`)
      wideBackgrounds.push({ width, centered: true, edgePixels: true, equalSpacing: true })
      await page.close()
    }
    console.log(JSON.stringify({ origin, checked, offscreenAutoplayCleared: true, mixedInputRetained: true, resizedSelectionRetained: true, wideBackgrounds }, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
