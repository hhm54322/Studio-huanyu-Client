const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const routes = [
  '/', '/about', '/why-china', '/trust', '/insurance', '/hospitals', '/cases',
  '/dental', '/diseases-technologies', '/report', '/steps',
]

async function assertVisibleReveals(page, label) {
  await page.waitForTimeout(750)
  const hidden = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')]
    .filter((element) => {
      const rect = element.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0
        && getComputedStyle(element).opacity === '0'
    })
    .map((element) => `${element.tagName.toLowerCase()}.${String(element.className).replaceAll(' ', '.')}`))
  assert.deepEqual(hidden, [], `${label}: visible elements stayed transparent`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const checked = []
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } })
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      for (const route of routes) {
        process.stdout.write(`checking ${route}/${width}\n`)
        await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded' })
        await assertVisibleReveals(page, `${route}/${width}/top`)
        for (const fraction of [0.35, 0.7, 1]) {
          await page.evaluate((position) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * position), fraction)
          await assertVisibleReveals(page, `${route}/${width}/${fraction}`)
        }
        checked.push(`${route}/${width}`)
      }

      await page.goto(`${origin}/trust`, { waitUntil: 'domcontentloaded' })
      const assurances = page.locator('.assurance-grid article')
      await assurances.nth(1).click()
      assert.equal(await assurances.nth(0).getAttribute('aria-expanded'), 'true')
      assert.equal(await assurances.nth(1).getAttribute('aria-expanded'), 'true')
      await assertVisibleReveals(page, `/trust/${width}/expanded`)

      await page.goto(`${origin}/why-china`, { waitUntil: 'domcontentloaded' })
      const capabilities = page.locator('.capability-grid article')
      for (let index = 1; index < 8; index++) await capabilities.nth(index).click()
      await assertVisibleReveals(page, `/why-china/${width}/expanded`)
      const boundary = await page.evaluate(() => ({
        cardBottom: document.querySelector('.capability-grid article:last-child').getBoundingClientRect().bottom,
        sectionBottom: document.querySelector('.capability-section').getBoundingClientRect().bottom,
      }))
      assert.ok(boundary.cardBottom <= boundary.sectionBottom, `/why-china/${width}: expanded cards overlap next section`)
      await page.locator('.cost-actions button').click()
      assert.equal(await page.locator('.cost-detail-card').count(), 8)
      await assertVisibleReveals(page, `/why-china/${width}/cost`)

      for (const [route, selector] of [
        ['/', '.expert-tabs button:nth-child(2)'],
        ['/about', '.complex-card:nth-child(2)'],
        ['/insurance', '.insurance-scenario-grid article:nth-child(2)'],
        ['/hospitals', '.city-tabs button:nth-child(2)'],
        ['/dental', '.dental-project-card:nth-child(2)'],
      ]) {
        await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded' })
        await page.locator(selector).click()
        await assertVisibleReveals(page, `${route}/${width}/interaction`)
      }
      assert.deepEqual(errors, [], `${width}: runtime errors`)
      await page.close()
    }
    console.log(JSON.stringify({ checkedRoutes: checked.length, interactionChecks: 14, result: 'pass' }))
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
