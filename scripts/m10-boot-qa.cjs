// Production-only fault injection: exercise real entry/route/language imports.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5420/'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/m10/boot')

async function snapshot(page) {
  return page.evaluate(() => ({
    ready: document.documentElement.dataset.huanyuAppReady === 'true', language: document.documentElement.lang,
    main: !!document.querySelector('#app main'), text: document.querySelector('#app')?.innerText?.slice(0, 200) || '',
    status: (document.querySelector('#huanyu-load-status') || document.querySelector('#huanyu-boot__message'))?.textContent || '',
    state: (document.querySelector('#huanyu-load-status') || document.querySelector('#huanyu-boot'))?.getAttribute('data-state') || '',
    localeLinks: [...document.querySelectorAll('link[data-huanyu-preload="patient-locale"]')].map(link => link.href),
  }))
}
async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: process.env.HUANYU_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const results = []
  try {
    for (const scenario of [
      { name: 'normal-english', lang: 'en' },
      { name: 'slow-language-no-chinese-flash', lang: 'en', pattern: '**/assets/home-*.js', delay: 3000 },
      { name: 'failed-language-bounded', lang: 'en', pattern: '**/assets/common-*.js', permanent: true },
      { name: 'entry-dependency-once', pattern: '**/assets/ui-icons-*.js', once: true },
      { name: 'stylesheet-once', pattern: '**/assets/index-*.css', once: true },
      { name: 'route-stylesheet-once', pattern: '**/assets/HomeView-*.css', once: true },
      { name: 'stylesheet-permanent-bounded', pattern: '**/assets/index-*.css', permanent: true },
      { name: 'route-stylesheet-permanent-bounded', pattern: '**/assets/HomeView-*.css', permanent: true },
      { name: 'direct-route-once', path: '/dental', pattern: '**/assets/DentalView-*.js', once: true },
      { name: 'direct-route-permanent', path: '/dental', pattern: '**/assets/DentalView-*.js', permanent: true },
      { name: 'interaction-cancels-reload', pattern: '**/assets/ui-icons-*.js', permanent: true, interact: true },
      { name: 'blocked-session-storage', pattern: '**/assets/ui-icons-*.js', permanent: true, storage: true },
      { name: 'mobile-failure-no-auto-reload', pattern: '**/assets/ui-icons-*.js', permanent: true, width: 390 },
      { name: 'report-no-auto-reload', path: '/report', pattern: '**/assets/ui-icons-*.js', permanent: true },
      { name: 'hospital-unchanged', path: '/hospital', pattern: '**/assets/ui-icons-*.js', permanent: true, excluded: true },
    ]) {
      console.log('Checking', scenario.name)
      const context = await browser.newContext({ viewport: { width: scenario.width || 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
      const page = await context.newPage()
      let navigations = 0, injected = 0
      const errors = []
      page.on('pageerror', e => errors.push(e.message))
      page.on('request', r => { if (r.isNavigationRequest() && r.frame() === page.mainFrame()) navigations++ })
      if (scenario.storage) await page.addInitScript(() => { Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Blocked', 'SecurityError') } }) })
      if (scenario.interact) await page.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => document.dispatchEvent(new Event('input', { bubbles: true })), { once: true }) })
      if (scenario.pattern) await page.route(scenario.pattern, async route => {
        injected++
        if (scenario.delay) { await new Promise(resolve => setTimeout(resolve, scenario.delay)); await route.continue() }
        else if (scenario.permanent || injected === 1) await route.abort('connectionreset')
        else await route.continue()
      })
      const url = new URL(scenario.path || '/', base)
      url.searchParams.set('lang', scenario.lang || 'zh')
      await page.goto(url.href, { waitUntil: 'commit' })
      let early
      if (scenario.delay) {
        await page.waitForTimeout(1500)
        early = await snapshot(page)
        assert.equal(early.main, false, 'do not display untranslated content while the pack is pending')
        assert.match(early.status, /Loading/)
      }
      const shouldRecover = scenario.once || !scenario.pattern || scenario.delay
      if (shouldRecover) {
        await page.waitForFunction(() => document.documentElement.dataset.huanyuAppReady === 'true', null, { timeout: 18000 })
        const state = await snapshot(page)
        assert.equal(state.main, true); assert.equal(state.language, scenario.lang || 'zh'); assert.equal(state.status, '')
        if (scenario.once) assert.ok(navigations >= 1 && navigations <= 2, 'recover without more than one automatic reload')
        else assert.equal(navigations, 1)
        if (!scenario.pattern) {
          assert.ok(state.localeLinks.some(url => /common-/.test(url)) && state.localeLinks.some(url => /home-/.test(url)))
          assert.deepEqual(errors, [])
        }
      } else {
        await page.waitForTimeout(2200)
        const state = await snapshot(page)
        const auto = !scenario.interact && !scenario.storage && !scenario.width && !['/report', '/hospital'].includes(scenario.path)
        assert.equal(navigations, auto ? 2 : 1, 'automatic retries must stay bounded')
        assert.equal(state.ready, false)
        if (scenario.excluded) assert.equal(state.status, '')
        else { assert.equal(state.state, 'error'); if (scenario.lang === 'en') assert.match(state.status, /Page resources/) }
      }
      if (scenario.pattern) assert.ok(injected, 'fault injection must run')
      results.push({ name: scenario.name, navigations, injected, early, ...await snapshot(page), errors })
      await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify({ checkedAt: new Date().toISOString(), base, results }, null, 2) + '\n')
      await context.close()
    }
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
      const page = await context.newPage()
      let navigations = 0
      page.on('request', r => { if (r.isNavigationRequest() && r.frame() === page.mainFrame()) navigations++ })
      await page.goto(new URL('/?lang=en', base).href)
      await page.waitForFunction(() => document.documentElement.dataset.huanyuAppReady === 'true')
      await page.evaluate(() => {
        const input = document.createElement('input'); input.id = 'm10-unsaved'; document.querySelector('main').appendChild(input)
      })
      await page.locator('#m10-unsaved').fill('unsaved patient draft')
      await page.route('**/assets/AboutView-*.js', route => route.abort('connectionreset'))
      // Click an actual authored RouterLink: the target import must fail while
      // the current page and draft stay mounted.
      await page.locator('a[href="/about"]').first().click()
      await page.locator('#huanyu-load-status[data-state="error"]').waitFor()
      assert.equal(navigations, 1); assert.equal(await page.locator('#m10-unsaved').inputValue(), 'unsaved patient draft')
      assert.match(page.url(), /\/?\?lang=en/)
      const state = await snapshot(page)
      assert.match(state.status, /Page resources/)
      await page.locator('a[href="/cases"]').first().click()
      await page.waitForURL('**/cases')
      assert.equal(await page.locator('#huanyu-load-status').count(), 0)
      results.push({ name: 'spa-error-preserves-user-input', navigations, state, successfulNavigationClearsNotice: true })
      await context.close()
    }
    const report = { checkedAt: new Date().toISOString(), base, results }
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(results.map(({name,navigations,injected}) => ({name,navigations,injected})), null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
