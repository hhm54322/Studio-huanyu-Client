const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const origin = 'http://127.0.0.1:5173'

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin, { waitUntil: 'networkidle' })

    assert.equal(await page.locator('.home-hero__controls button.active').getAttribute('aria-label'), '第4张')
    await page.getByRole('button', { name: '下一张' }).click()
    await page.getByRole('heading', { name: '让全球患者安心赴华就医' }).waitFor()
    assert.equal(await page.locator('.home-hero h1').textContent(), '让全球患者安心赴华就医')
    await page.locator('.home-hero__button').click()
    await page.waitForURL('**/report')

    await page.goto(origin, { waitUntil: 'networkidle' })
    await page.locator('.home-hero__assistant').click()
    assert.equal(await page.getByRole('dialog').count(), 1)
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.equal(await page.getByRole('dialog').count(), 0)

    await page.getByRole('tab', { name: '心血管科' }).click()
    assert.equal(await page.locator('.expert-empty').count(), 1)
    await page.getByRole('tab', { name: '肿瘤科' }).click()
    assert.equal(await page.locator('.expert-grid article').count(), 4)
    await page.locator('.home-flow a').first().click()
    await page.waitForURL('**/why-china')

    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    await reduced.goto(origin, { waitUntil: 'networkidle' })
    await reduced.waitForTimeout(7200)
    assert.equal(await reduced.locator('.home-hero__controls button.active').getAttribute('aria-label'), '第4张')
    assert.equal(await reduced.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)

    const animated = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
    await animated.goto(origin, { waitUntil: 'networkidle' })
    await animated.waitForTimeout(7200)
    assert.equal(await animated.locator('.home-hero__controls button.active').getAttribute('aria-label'), '第1张')
    assert.deepEqual(errors, [])
    console.log('Home interactions: routes, consultation, expert tabs, autoplay, reduced motion and overflow passed.')
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
