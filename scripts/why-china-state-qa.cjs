const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require(path.join(process.env.HUANYU_QA_TOOLS || '/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules', 'playwright'))

async function main() {
  const out = path.resolve(process.env.HUANYU_QA_OUT || 'docs/figma-verification/why-china/2026-09-29')
  const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: process.env.HUANYU_QA_BROWSER || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const results = []
  const errors = []
  const failedResources = []
  try {
    const widths=(process.env.HUANYU_QA_WIDTHS || '1440,1024,768,390').split(',').map(Number)
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('response', response => {
        if (response.status() >= 400) failedResources.push({ viewport: width, page: new URL(page.url()).pathname, path: new URL(response.url()).pathname, status: response.status() })
      })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`${origin}/why-china`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForSelector('.capability-grid article', { timeout: 30000 })
      await page.waitForFunction(() => [...document.images].every(image => image.naturalWidth > 0), { timeout: 60000 })
      const cards = page.locator('.capability-grid article')
      assert.equal(await cards.count(), 8)
      assert.equal(await cards.nth(0).getAttribute('aria-expanded'), 'true')
      assert.equal(await cards.nth(1).getAttribute('aria-expanded'), 'false')
      await cards.nth(1).click()
      assert.equal(await cards.nth(0).getAttribute('aria-expanded'), 'true')
      assert.equal(await cards.nth(1).getAttribute('aria-expanded'), 'true')
      assert.equal(await cards.locator('small').count(), 2)
      await cards.nth(1).click()
      assert.equal(await cards.nth(0).getAttribute('aria-expanded'), 'true')
      assert.equal(await cards.nth(1).getAttribute('aria-expanded'), 'false')
      await cards.nth(0).focus()
      await page.keyboard.press('Enter')
      assert.equal(await cards.nth(0).getAttribute('aria-expanded'), 'false')
      await cards.nth(1).focus()
      await page.keyboard.press('Space')
      assert.equal(await cards.nth(1).getAttribute('aria-expanded'), 'true')
      await cards.nth(0).click()

      for (const selector of ['.why-hero button', '.why-cta button']) {
        const trigger = page.locator(selector)
        await trigger.click()
        await page.locator('[role="dialog"]').waitFor({ state: 'visible' })
        await page.waitForTimeout(100)
        assert.equal(await page.locator('#consult-name').evaluate(el => el === document.activeElement), true)
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab')
          assert.equal(await page.evaluate(() => Boolean(document.activeElement.closest('.consult-panel'))), true)
        }
        await page.keyboard.press('Escape')
        await page.locator('[role="dialog"]').waitFor({ state: 'hidden' })
        assert.equal(await trigger.evaluate(el => el === document.activeElement), true)
      }

      const geometry = await page.evaluate(() => {
        const chart = document.querySelector('.comparison-chart canvas')
        const buttons = [...document.querySelectorAll('.why-page button, .why-page a')]
        const clippedControls = buttons.filter(el => {
          const box = el.getBoundingClientRect()
          return box.width && (box.left < -1 || box.right > innerWidth + 1)
        }).map(el => el.textContent.trim())
        let canvasPixels = 0
        if (chart) {
          const ctx = chart.getContext('2d')
          const data = ctx.getImageData(0, 0, chart.width, chart.height).data
          for (let i = 3; i < data.length; i += 4) if (data[i]) canvasPixels++
        }
        return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, clippedControls, canvasPixels, brokenImages: [...document.images].filter(img => !img.naturalWidth).map(img => img.src), links: [...document.querySelectorAll('.why-page a')].map(el => ({ text: el.textContent.trim(), href: el.getAttribute('href') })) }
      })
      assert.equal(geometry.scrollWidth, width)
      assert.deepEqual(geometry.clippedControls, [])
      assert.deepEqual(geometry.brokenImages, [])
      assert.ok(geometry.canvasPixels > 5000)
      assert.ok(geometry.links.every(link => ['/report', '/cases'].includes(link.href)))
      const costToggle = page.locator('.cost-actions button')
      assert.equal(await costToggle.getAttribute('aria-expanded'), 'false')
      await costToggle.click()
      assert.equal(await costToggle.getAttribute('aria-expanded'), 'true')
      assert.equal(await page.locator('.cost-detail-card').count(), 8)
      await costToggle.click()
      assert.equal(await costToggle.getAttribute('aria-expanded'), 'false')
      await page.evaluate(() => scrollTo(0, 0))
      await page.screenshot({ path: path.join(out, `interaction-${width}.png`), fullPage: true })
      await page.goto(`${origin}/cost`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForURL('**/why-china#cost-comparison')
      assert.equal(await page.locator('.cost-actions button').getAttribute('aria-expanded'), 'true')
      assert.equal(await page.locator('.cost-detail-card').count(), 8)
      await page.goto(`${origin}/why-china`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForSelector('.capability-grid article', { timeout: 30000 })
      await page.waitForFunction(() => [...document.images].every(image => image.naturalWidth > 0), { timeout: 60000 })
      await page.locator('.national-section a').click()
      await page.waitForURL('**/cases')
      results.push(geometry)
      await page.close()
    }
    const motion = []
    for (const [width, reducedMotion] of [[1440, 'no-preference'], [1440, 'reduce'], ...(widths.includes(390) ? [[390, 'no-preference']] : [])]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      page.on('pageerror', error => errors.push(error.message))
      await page.emulateMedia({ reducedMotion })
      await page.goto(`${origin}/why-china`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForSelector('.capability-grid article', { timeout: 30000 })
      // The narrow chart is horizontal and only 358px wide at 390px. Sample
      // an interior US bar in each actual chart, never outside its canvas.
      const sample = () => page.locator('.comparison-chart canvas').evaluate((canvas, point) => [...canvas.getContext('2d').getImageData(point[0], point[1], 1, 1).data], width > 900 ? [563,120] : [120,85])
      const before = await sample()
      if (width === 1440 && reducedMotion === 'no-preference') assert.equal(before[3], 0)
      else assert.equal(before[3], 255)
      await page.locator('.comparison-chart').scrollIntoViewIfNeeded()
      await page.waitForTimeout(1100)
      const after = await sample()
      assert.deepEqual(after, [156, 163, 175, 255])
      await page.screenshot({ path: path.join(out, `chart-${width}-${reducedMotion}.png`) })
      motion.push({ width, reducedMotion, before, after })
      await page.close()
    }
    console.log(JSON.stringify({ results, motion, errors, failedResources }, null, 2))
    await fs.writeFile(path.join(out, 'interaction-results.json'), JSON.stringify({ results, motion, errors, failedResources }, null, 2) + '\n')
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
