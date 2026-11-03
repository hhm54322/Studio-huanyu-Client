const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5331'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/home-loading-order/recovery')

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const results = []
  try {
    for (const scenario of [
      { name: 'entry-dependency-once', recover: true },
      { name: 'stylesheet-once', css: true, recover: true },
      { name: 'permanent-failure-bounded', permanent: true },
      { name: 'after-ready-no-reload', ready: true },
      { name: 'interaction-cancels-reload', interact: true },
      { name: 'storage-unavailable-no-loop', storage: true },
      { name: 'report-excluded', route: '/report' },
      { name: 'administration-excluded', route: '/hospital' },
      { name: 'mobile-unchanged', width: 390 },
    ]) {
      const context = await browser.newContext({ viewport: { width: scenario.width || 1440, height: 1000 }, reducedMotion: 'reduce' })
      const page = await context.newPage()
      let navigations = 0, aborted = 0
      page.on('request', request => {
        if (request.isNavigationRequest() && request.frame() === page.mainFrame()) navigations++
      })
      if (scenario.storage) await page.addInitScript(() => {
        Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError') } })
      })
      if (!scenario.ready) await page.route(scenario.css ? '**/assets/index-*.css' : '**/assets/ui-icons-*.js', async route => {
        if (!aborted || scenario.permanent) { aborted++; await route.abort('connectionreset') }
        else await route.continue()
      })
      if (scenario.interact) await page.addInitScript(() => {
        // A real input signal during the recovery delay must cancel the reload.
        document.addEventListener('DOMContentLoaded', () => window.dispatchEvent(new Event('pointerdown')), { once: true })
      })
      await page.goto(base + (scenario.route || '/doctors'), { waitUntil: 'commit' })
      if (scenario.ready || scenario.recover) await page.locator('main').first().waitFor({ state: 'visible', timeout: 15000 })
      if (scenario.ready) {
        await page.waitForLoadState('networkidle')
        await page.route('**/assets/optional-failure.js', route => { aborted++; return route.abort('connectionreset') })
        await page.evaluate(() => {
          const script = document.createElement('script')
          script.src = '/assets/optional-failure.js'
          document.head.appendChild(script)
        })
      }
      await page.waitForTimeout(scenario.permanent ? 2200 : 1100)
      assert.ok(aborted > 0, scenario.name + ': failure injection did not run')
      assert.equal(navigations, scenario.recover || scenario.permanent ? 2 : 1, scenario.name + ': unexpected reload count')
      if (scenario.recover) assert.ok(await page.locator('main').first().isVisible(), scenario.name + ': page did not recover')
      results.push({ name: scenario.name, navigations, aborted, recovered: !!scenario.recover })
      await context.close()
    }
    await fs.mkdir(output, { recursive: true })
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify({ checkedAt: new Date().toISOString(), base, results }, null, 2) + '\n')
    console.log(JSON.stringify(results, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
