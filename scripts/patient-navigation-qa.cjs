// Patient UI regression only. Figma remains on the official current-session IAB.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/patient-navigation-avatars-20261103/final')
const url = (process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')
const tick = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const nav = page => page.locator('.patient-desktop-navigation')
const trigger = (page, group) => nav(page).locator(`[data-navigation-trigger="${group}"]`)
const menu = (page, group) => page.locator(`#patient-navigation-${group}`)
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { routes: [], selections: [], keyboard: [], floating: [], mobile: [], errors: [], failedRequests: [] }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    page.setDefaultTimeout(7000)
    page.on('pageerror', error => report.errors.push(error.message))
    page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(url) && !response.url().includes('/api/')) report.failedRequests.push({ url: response.url(), status: response.status() }) })
    // A new tab starts with unselected group labels. Merely opening a menu
    // must not choose it or create the old route-owned second popover.
    const routes = ['/', '/dental', '/hospitals', '/doctors', '/diseases-technologies', '/trust', '/why-china', '/cases', '/insurance', '/about', '/steps', '/steps/toolkit-detail']
    for (const route of routes) {
      await page.goto(`${url}${route}`, { waitUntil: 'networkidle' })
      await nav(page).waitFor(); await page.evaluate(() => document.fonts.ready)
      assert.equal(await nav(page).count(), 1, `${route}: one desktop navigation`)
      const expected = route === '/hospitals' || route === '/doctors' ? 'hospitals' : route === '/diseases-technologies' ? 'services' : null
      for (const group of ['services', 'hospitals']) {
        const button = trigger(page, group)
        assert.equal(await button.getAttribute('aria-haspopup'), 'true')
        assert.equal(await button.locator('.patient-desktop-navigation__chevron').count(), 1)
        assert.equal(await button.evaluate(el => el.classList.contains('is-active')), group === expected)
        await button.hover(); await menu(page, group).waitFor({ state: 'visible' })
        const from = await button.boundingBox(), panel = await menu(page, group).boundingBox()
        // Traverse the actual gap slowly: users must be able to reach an item.
        await page.mouse.move(from.x + from.width / 2, from.y + from.height + 8)
        await page.waitForTimeout(200)
        await page.mouse.move(panel.x + panel.width / 2, panel.y + 14)
        await page.waitForTimeout(180)
        assert.equal(await menu(page, group).isVisible(), true, `${route}: hover bridge`)
        assert.equal(await page.locator('#home-services-menu,#desktop-services-menu,#physician-hospital-menu,#hospital-doctor-menu').count(), 0, `${route}: no duplicate legacy popover`)
        if (['/', '/dental', '/doctors'].includes(route)) await page.screenshot({ path: path.join(out, `${route === '/' ? 'home' : route.slice(1)}-${group}-open.png`) })
        await page.mouse.move(10, 250); await menu(page, group).waitFor({ state: 'detached' })
      }
      if (route === '/') {
        assert.equal((await trigger(page, 'services').innerText()).trim(), '医疗服务')
        assert.equal((await trigger(page, 'hospitals').innerText()).trim(), '中国医院')
        assert.equal(await nav(page).locator('a.is-active').innerText(), '首页')
      }
      const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }))
      assert.equal(layout.width, layout.scrollWidth, route)
      await page.screenshot({ path: path.join(out, `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png`) })
      report.routes.push({ route, activeGroup: expected, hover: true, arrows: true, singleMenu: true, ...layout })
    }
    await page.goto(`${url}/`, { waitUntil: 'networkidle' })
    for (const [group, label, destination] of [['services', '专科诊疗', '/diseases-technologies'], ['hospitals', '中国医生', '/doctors'], ['hospitals', '中国医院', '/hospitals']]) {
      await trigger(page, group).hover()
      await menu(page, group).getByRole('link', { name: label, exact: true }).click()
      await page.waitForURL(`${url}${destination}`); await nav(page).waitFor()
      assert.equal((await trigger(page, group).innerText()).trim(), label)
      assert.equal(await trigger(page, group).evaluate(el => el.classList.contains('is-active')), true)
      await nav(page).getByRole('link', { name: '牙科', exact: true }).click(); await page.waitForURL(`${url}/dental`)
      await page.mouse.move(10, 250)
      assert.equal((await trigger(page, group).innerText()).trim(), label)
      assert.equal(await trigger(page, group).evaluate(el => getComputedStyle(el).color), 'rgb(75, 85, 99)')
      await page.reload({ waitUntil: 'networkidle' })
      assert.equal((await trigger(page, group).innerText()).trim(), label)
      report.selections.push({ group, label, destination, routeHighlight: true, retainedOnOtherRoute: true, survivesReload: true })
    }
    for (const group of ['services', 'hospitals']) {
      await page.mouse.move(10, 250)
      const button = trigger(page, group)
      await button.focus(); await button.press('ArrowDown')
      const links = menu(page, group).locator('a')
      assert.equal(await links.first().evaluate(el => el === document.activeElement), true)
      await page.keyboard.press('End'); assert.equal(await links.last().evaluate(el => el === document.activeElement), true)
      await page.keyboard.press('Home'); assert.equal(await links.first().evaluate(el => el === document.activeElement), true)
      await page.keyboard.press('Escape'); await menu(page, group).waitFor({ state: 'detached' })
      assert.equal(await button.evaluate(el => el === document.activeElement), true)
      await button.press('ArrowUp'); assert.equal(await links.last().evaluate(el => el === document.activeElement), true)
      await page.mouse.click(10, 250); await menu(page, group).waitFor({ state: 'detached' })
      await button.focus(); await button.press('Tab'); await menu(page, group).waitFor({ state: 'detached' })
      report.keyboard.push({ group, arrows: true, homeEnd: true, escape: true, focusRestore: true, tab: true, outside: true })
    }
    for (const [width, height] of [[1024, 768], [1280, 720], [1440, 900], [1920, 1080]]) {
      await page.setViewportSize({ width, height })
      await page.goto(`${url}/dental`, { waitUntil: 'networkidle' })
      for (const step of [1, 2]) {
        if (step === 2) {
          await page.locator('.dental-floating-action button').click()
          await page.locator('[data-dental-step="2"]').waitFor()
        }
        await page.evaluate(() => scrollTo(0, 0)); await tick(page)
        const floating = page.locator('.dental-floating-action')
        await floating.waitFor()
        assert.equal(await floating.count(), 1)
        const scale = Math.min(1, width / 1440), fixed = await floating.boundingBox()
        assert.ok(Math.abs(height - fixed.y - fixed.height - 96 * scale) < 1, 'fixed bottom gap')
        assert.equal(await floating.getAttribute('data-dental-action-state'), 'fixed')
        const footer = page.locator('.dental-desktop-flow [data-figma-name="Footer"]')
        await footer.scrollIntoViewIfNeeded(); await tick(page)
        const released = await floating.boundingBox(), footerBox = await footer.boundingBox()
        assert.equal(await floating.getAttribute('data-dental-action-state'), 'released')
        assert.ok(Math.abs(footerBox.y - released.y - released.height - 96 * scale) < 1, 'footer gap')
        await page.screenshot({ path: path.join(out, `dental-${step}-${width}-footer.png`) })
        const before = await footer.boundingBox()
        await page.evaluate(() => scrollBy(0, -60)); await tick(page)
        const after = await footer.boundingBox(), moved = await floating.boundingBox()
        assert.ok(Math.abs((moved.y - released.y) - (after.y - before.y)) < 1, 'release follows footer')
        assert.equal(await page.locator('.dental-desktop-flow').evaluate(el => el.scrollWidth > innerWidth), false)
        report.floating.push({ width, height, step, fixedGap: height - fixed.y - fixed.height, releasedGap: footerBox.y - released.y - released.height, scale, unique: true, followsFooter: true })
        await page.evaluate(() => scrollTo(0, 0)); await tick(page)
      }
      await page.locator('.dental-floating-action button').click(); await page.locator('[data-dental-step="3"]').waitFor()
      assert.equal(await page.locator('.dental-floating-action').count(), 0)
    }
    // Preserve the existing frozen mobile navigation; do not substitute the
    // new desktop controls or floating dental action at phone widths.
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 844 })
      for (const route of ['/', '/dental']) {
        await page.goto(`${url}${route}`, { waitUntil: 'networkidle' })
        assert.equal(await nav(page).count(), 0)
        assert.equal(await page.locator('.dental-floating-action').count(), 0)
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
        await page.screenshot({ path: path.join(out, `mobile-${width}-${route === '/' ? 'home' : 'dental'}.png`) })
        report.mobile.push({ width, route, desktopControlsAbsent: true, noOverflow: true })
      }
    }
    assert.deepEqual(report.errors, []); assert.deepEqual(report.failedRequests, [])
    report.checkedAt = new Date().toISOString()
    report.codeSHA256 = Object.fromEntries(await Promise.all(['src/components/layout/PatientDesktopNavigation.vue', 'src/composables/usePatientNavigation.ts', 'src/components/common/HomeSourceNode.vue', 'src/components/layout/PatientHeader.vue', 'src/components/common/DentalDesktopFlow.vue'].map(async file => [file, createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex')])))
    await fs.writeFile(path.join(out, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ routes: report.routes.length, selections: report.selections.length, keyboard: report.keyboard.length, floating: report.floating.length, mobile: report.mobile.length, errors: report.errors }, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
