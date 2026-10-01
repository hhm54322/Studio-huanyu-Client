const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 })

    assert.equal(await page.locator('.home-hero__controls button.active').getAttribute('aria-label'), '第4张')
    await page.getByRole('button', { name: '下一张' }).click()
    await page.getByRole('heading', { name: '让全球患者安心赴华就医' }).waitFor()
    assert.equal(await page.locator('.home-hero h1').textContent(), '让全球患者安心赴华就医')
    await page.locator('.home-hero__button').click()
    await page.waitForURL('**/report')

    await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.locator('.home-hero__assistant').click()
    assert.equal(await page.getByRole('dialog').count(), 1)
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.equal(await page.getByRole('dialog').count(), 0)

    await page.getByRole('tab', { name: '心血管科' }).click()
    assert.equal(await page.locator('.expert-empty').count(), 1)
    await page.getByRole('tab', { name: '肿瘤科' }).click()
    assert.equal(await page.locator('.expert-grid article').count(), 4)
    assert.equal(await page.locator('.home-process').count(), 1)
    assert.equal(await page.locator('.home-process__stage').count(), 4)
    assert.equal(await page.locator('.home-process__rail').count(), 1)
    const stageTops = await page.locator('.home-process__stage').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top + window.scrollY))
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    for (const [index, top] of stageTops.entries()) {
      await page.locator('.home-flow__step').nth(index).click()
      await page.waitForTimeout(1500)
      assert.equal(await page.locator('.home-process__rail-node strong').textContent(), `0${index + 1}`)
      const expectedTop = Math.min(Math.max(0, top - 104), await page.evaluate(() => document.documentElement.scrollHeight - innerHeight))
      const actualTop = await page.evaluate(() => window.scrollY)
      assert.ok(Math.abs(actualTop - expectedTop) <= 3, `flow step ${index + 1} scroll target mismatch: ${actualTop} vs ${expectedTop}`)
    }
    for (const [index, top] of stageTops.entries()) {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'auto' }), top)
      await page.waitForTimeout(250)
      assert.equal(await page.locator('.home-process__rail-node strong').textContent(), `0${index + 1}`)
    }
    assert.equal(await page.locator('.home-process__stage:nth-child(4) .home-process__secondary').getAttribute('href'), '/cases')
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    await page.locator('.home-process__why-grid article').first().click()
    assert.equal(await page.getByRole('dialog').count(), 1)
    assert.equal(await page.getByRole('dialog').getByRole('heading', { name: '医疗水平 · 国际领先' }).count(), 1)
    assert.equal(await page.getByRole('dialog').locator('.why-detail-modal__body article').count(), 4)
    assert.equal(await page.getByRole('dialog').locator('.why-detail-modal__source').count(), 0)
    await page.getByRole('button', { name: '关闭详情' }).click()
    await page.getByRole('dialog').waitFor({ state: 'hidden' })

    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    await reduced.emulateMedia({ reducedMotion: 'reduce' })
    await reduced.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await reduced.waitForTimeout(7200)
    assert.equal(await reduced.locator('.home-hero__controls button.active').getAttribute('aria-label'), '第4张')
    assert.equal(await reduced.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)

    const animated = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
    await animated.emulateMedia({ reducedMotion: 'no-preference' })
    await animated.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await animated.locator('.home-hero').dispatchEvent('mouseleave')
    await animated.mouse.move(1500, 1000)
    await animated.waitForTimeout(8500)
    assert.equal(await animated.locator('.home-hero__controls button.active').getAttribute('aria-label'), '第1张')
    assert.deepEqual(errors, [])
    console.log('Home interactions: routes, consultation, expert tabs, autoplay, reduced motion and overflow passed.')
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
