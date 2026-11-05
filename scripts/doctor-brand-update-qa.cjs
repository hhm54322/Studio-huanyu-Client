// Focused UI regression for the 2026-11-05 doctor card, logo and hover update.
// No patient data is entered or submitted by this script.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/doctor-brand-20261105/final/qa'))
const url = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const report = { checkedAt: '', url, cards: [], tabs: [], doctors: [], languages: [], mobile: [], errors: [], failedAssets: [], realDataSent: false, codeHashes: {} }
const sourceFiles = ['src/views/patient/HomeView.vue', 'src/views/patient/PhysicianView.vue', 'src/views/patient/DentalDoctorView.vue', 'src/views/patient/DentalView.vue', 'src/data/physicianFigmaSource.ts', 'src/data/dentalDoctorPageSource.ts', 'src/components/common/HomeSourceNode.vue', 'src/components/common/SourceLearnMore.vue', 'src/components/common/BrandLogo.vue', 'public/images/brand/univadoc-plus.png']
const tabs = ['profile', 'treatment', 'cases', 'reviews', 'services']
const slugs = ['tan-zhaolin', 'che-yinglin', 'wan-qiancheng', 'li-teng', 'huang-jianrong', 'zheng-rui', 'jiang-gang']
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].filter(i => i.getClientRects().length && i.getBoundingClientRect().top < innerHeight).map(i => i.decode().catch(() => {})))
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}
async function ready(page, tab) {
  await page.waitForFunction(t => {
    const e = document.querySelector('[data-dental-doctor-page]')
    return e?.getAttribute('data-active-tab') === t && e.getAttribute('aria-busy') === 'false'
  }, tab)
  await settle(page)
}
async function noOverflow(page) {
  const sizes = await page.evaluate(() => ({ actual: document.documentElement.scrollWidth, viewport: innerWidth }))
  assert.ok(sizes.actual <= sizes.viewport, JSON.stringify(sizes))
}
async function logo(page) {
  const logos = page.locator('img[alt="Univadoc+"]')
  assert.ok(await logos.count(), `Missing logo: ${page.url()}`)
  const bounds = await logos.first().boundingBox()
  assert.ok(bounds.width > 0 && bounds.x >= 0 && bounds.x + bounds.width <= page.viewportSize().width)
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  page.setDefaultTimeout(10000)
  page.on('pageerror', e => report.errors.push(e.message))
  page.on('response', response => { if (response.status() >= 400 && !response.url().includes('/api/')) report.failedAssets.push({ url: response.url(), status: response.status() }) })
  try {
    for (const [name, route, selector, summarySelector, count, restY, hoverY, moreY] of [
      ['physicians', '/doctors', '[data-physician-card]', '[data-physician-summary]', 60, 211, 180, 244],
      ['home', '/', '[data-home-expert-card]', '[data-home-expert-summary] > .home-source-node--text', 4, 232, 200, 288],
    ]) {
      await page.goto(`${url}${route}?lang=zh`, { waitUntil: 'networkidle' }); await settle(page)
      const cards = page.locator(selector)
      await cards.first().scrollIntoViewIfNeeded(); await settle(page)
      assert.equal(await cards.count(), count)
      assert.ok((await cards.evaluateAll(es => es.every(e => e.querySelectorAll('.source-learn-more').length === 1))))
      for (let i = 0; i < Math.min(count, 4); i++) {
        const card = cards.nth(i), more = card.locator('.source-learn-more'), summary = card.locator(summarySelector)
        await card.scrollIntoViewIfNeeded(); await page.mouse.move(0, 0); await page.evaluate(() => document.activeElement?.blur()); await settle(page)
        const box = await card.boundingBox(), rest = await summary.boundingBox()
        assert.ok(Math.abs(rest.y - box.y - restY) < .1, `${name}/${i}: resting summary`)
        assert.equal(await more.evaluate(e => getComputedStyle(e).opacity), '0')
        await card.hover(); await settle(page)
        const hovered = await summary.boundingBox(), moreBox = await more.boundingBox()
        assert.ok(Math.abs(hovered.y - box.y - hoverY) < .1, `${name}/${i}: hover summary`)
        assert.ok(Math.abs(moreBox.y - box.y - moreY) < .1, `${name}/${i}: CTA placement`)
        assert.equal(await card.evaluate(e => getComputedStyle(e).boxShadow), 'none')
        assert.equal(await more.evaluate(e => getComputedStyle(e).opacity), '1')
        await page.mouse.move(0, 0); await card.focus(); await settle(page)
        assert.equal(await more.evaluate(e => getComputedStyle(e).opacity), '1', 'Keyboard CTA')
      }
      await cards.first().focus(); await page.keyboard.press('Enter')
      await page.locator('dialog[open]').first().waitFor()
      await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog[open]').count(), 0)
      await logo(page); await noOverflow(page)
      await page.screenshot({ path: path.join(out, `${name}-desktop.png`) })
      report.cards.push({ name, count, noShadow: true, correctPositions: true, hover: true, keyboard: true, wholeCardClick: true, noDuplicateCTA: true })
      if (name === 'physicians') {
        await page.locator('#physician-department').selectOption('血液内科')
        assert.ok(await cards.count() > 0)
        assert.ok(await cards.evaluateAll(es => es.every(e => e.getAttribute('data-physician-department') === '血液内科')))
      }
    }
    for (const tab of tabs) {
      await page.goto(`${url}/dental/doctors/tan-zhaolin?tab=${tab}&lang=zh`, { waitUntil: 'networkidle' }); await ready(page, tab)
      const card = await page.locator('[data-dental-doctor-card]').boundingBox()
      assert.deepEqual(card, { x: 112, y: 113, width: 304, height: 489 })
      assert.equal(await page.getByRole('tab', { selected: true }).count(), 1)
      await logo(page); await noOverflow(page)
      await page.screenshot({ path: path.join(out, `dental-${tab}.png`) })
      report.tabs.push({ tab, card, selected: 1, noOverflow: true, logo: true })
    }
    for (const slug of slugs.slice(1)) {
      await page.goto(`${url}/dental/doctors/${slug}?tab=profile&lang=zh`, { waitUntil: 'networkidle' }); await ready(page, 'profile')
      assert.equal((await page.locator('[data-dental-doctor-card]').boundingBox()).height, 489)
      assert.ok((await page.locator('[data-dental-doctor-card]').innerText()).trim())
      await noOverflow(page)
      report.doctors.push({ slug, profile: true, cardHeight: 489, noOverflow: true })
    }
    for (const lang of ['en', 'id', 'ms', 'pt']) for (const route of ['/', '/doctors', '/dental/doctors/tan-zhaolin?tab=profile']) {
      await page.goto(`${url}${route}${route.includes('?') ? '&' : '?'}lang=${lang}`, { waitUntil: 'networkidle' }); await settle(page)
      if (route.includes('/dental/doctors/')) await ready(page, 'profile')
      else {
        const card = page.locator('[data-physician-card],[data-home-expert-card]').first()
        await card.hover(); await settle(page)
        const more = card.locator('.source-learn-more')
        assert.notEqual((await more.innerText()).trim(), '了解更多')
        const a = await card.boundingBox(), b = await more.boundingBox()
        assert.ok(b.x >= a.x && b.x + b.width <= a.x + a.width && b.y + b.height <= a.y + a.height)
      }
      await logo(page); await noOverflow(page)
      report.languages.push({ lang, route, translatedCTA: true, noOverflow: true })
    }
    for (const width of [320, 390, 430, 768]) for (const route of ['/', '/doctors', '/dental']) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${url}${route}?lang=zh`, { waitUntil: 'networkidle' }); await settle(page)
      await noOverflow(page)
      await page.screenshot({ path: path.join(out, `regression-${route.slice(1) || 'home'}-${width}.png`) })
      report.mobile.push({ width, route, noOverflow: true, existingFlow: true })
    }
    assert.deepEqual(report.errors, []); assert.deepEqual(report.failedAssets, [])
    for (const file of sourceFiles) report.codeHashes[file] = createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex')
    report.checkedAt = new Date().toISOString()
    await fs.writeFile(path.join(out, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ cards: report.cards, tabs: report.tabs.length, doctors: report.doctors.length, languages: report.languages.length, mobile: report.mobile.length, errors: report.errors, failedAssets: report.failedAssets }, null, 2))
  } catch (error) {
    await fs.writeFile(path.join(out, 'failure.json'), JSON.stringify({ error: String(error), report }, null, 2))
    throw error
  } finally { await browser.close() }
}
main().catch(e => { console.error(e); process.exitCode = 1 })
