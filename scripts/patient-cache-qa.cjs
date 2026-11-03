const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5392'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/cache-2026-11-03/cache-qa')
const serverLogs = !process.env.HUANYU_QA_PUBLIC

async function requests(reset = false) {
  if (!serverLogs) return []
  return fetch(`${base}/__qa/${reset ? 'reset' : 'requests'}`).then(response => reset ? [] : response.json())
}

async function settle(page) {
  await page.locator('main').first().waitFor({ state: 'visible' })
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  const metrics = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource')
    const assets = entries.filter(entry => /\/(?:assets|static-assets|images|fonts)\//.test(new URL(entry.name).pathname))
    const uncached = assets.filter(entry => entry.transferSize > 0)
    const navigation = performance.getEntriesByType('navigation')[0]
    return {
      navigation: { ttfbMs: navigation.responseStart, workerStart: navigation.workerStart, transferBytes: navigation.transferSize },
      assetCount: assets.length, transferredAssets: uncached.length,
      transferredBytes: assets.reduce((sum, entry) => sum + entry.transferSize, 0),
      uncached: uncached.map(entry => ({ path: new URL(entry.name).pathname, bytes: entry.transferSize })),
      overflow: document.documentElement.scrollWidth > innerWidth,
    }
  })
  assert.equal(metrics.overflow, false)
  return metrics
}

async function main() {
  await fs.mkdir(output, { recursive: true })
  const profile = await fs.mkdtemp(path.join(output, 'browser-profile-'))
  const launch = () => chromium.launchPersistentContext(profile, {
    headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce',
  })
  let context = await launch(), result = {}, errors = []
  try {
    let page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    if (serverLogs) await fetch(`${base}/__qa/initial`)
    await requests(true)
    await page.goto(base, { waitUntil: 'networkidle' })
    result.cold = await settle(page)
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), { timeout: 20000 })
    await page.screenshot({ path: path.join(output, 'cold.png') })
    // Test normal second navigation without Playwright request interception;
    // routing would disable the browser HTTP cache and invalidate the result.
    await requests(true)
    await page.goto(base, { waitUntil: 'networkidle' })
    result.repeat = await settle(page)
    result.repeat.serverRequests = await requests()
    assert.ok(result.repeat.navigation.workerStart > 0, 'Public navigation did not use the local shell')
    assert.equal(result.repeat.transferredAssets, 0, 'Repeat visit downloaded unchanged assets')
    assert.deepEqual(result.repeat.serverRequests.filter(row => /^\/(?:assets|static-assets|images|fonts)\//.test(row.path)), [])
    await page.screenshot({ path: path.join(output, 'repeat.png') })
    await page.goto(`${base}/dental`, { waitUntil: 'networkidle' }); await settle(page)
    await page.goto(`${base}/dental`, { waitUntil: 'networkidle' })
    result.dentalRepeat = await settle(page)
    assert.equal(result.dentalRepeat.transferredAssets, 0)
    // Close the whole browser so the next sample must use disk cache, rather
    // than only in-memory resources in the current renderer.
    await context.close()
    context = await launch(); page = await context.newPage()
    await requests(true)
    await page.goto(base, { waitUntil: 'networkidle' })
    result.afterRestart = await settle(page)
    assert.equal(result.afterRestart.transferredAssets, 0, 'Browser restart lost immutable resource reuse')
    result.afterRestart.serverRequests = await requests()
    // CacheStorage is intentionally just one build-time anonymous shell.
    result.storage = await page.evaluate(async () => Promise.all((await caches.keys()).filter(name => name.startsWith('huanyu-')).map(async name => ({ name, urls: (await (await caches.open(name)).keys()).map(request => request.url) }))))
    assert.equal(result.storage.length, 1)
    assert.equal(result.storage[0].urls.length, 1)
    assert.match(new URL(result.storage[0].urls[0]).pathname, /^\/patient-shell\/[a-f0-9]{24}\.html$/)
    await context.setOffline(true)
    await page.goto(base, { waitUntil: 'load' })
    await page.locator('.home-source-hero').waitFor({ state: 'visible' })
    result.offline = await page.evaluate(() => ({ hero: !!document.querySelector('.home-source-hero'), worker: !!navigator.serviceWorker.controller }))
    assert.equal(result.offline.hero, true)
    await context.setOffline(false)
    for (const route of ['/report', '/hospital', '/expert-review', '/professional-report']) {
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' })
      assert.equal(response.fromServiceWorker(), false, route + ': private/business navigation was intercepted')
    }
    result.privateNavigationsExcluded = true
    await page.goto(base + '/?token=synthetic-cache-test', { waitUntil: 'domcontentloaded' }).then(response => assert.equal(response.fromServiceWorker(), false))
    result.tokenNavigationExcluded = true
    if (serverLogs) {
      await fetch(`${base}/__qa/next`)
      await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration('/')).update() })
      await page.waitForFunction(async () => (await caches.keys()).some(name => name.startsWith('huanyu-public-shell-') && !window.__qaOldNames?.includes(name)), null, { timeout: 10000 }).catch(() => {})
      // Wait for installation/activation using a real controller/cache state,
      // not a fixed delay; the test server changes the immutable shell URL.
      await page.waitForFunction(async () => {
        const names = await caches.keys()
        for (const name of names.filter(name => name.startsWith('huanyu-public-shell-'))) {
          const entries = await (await caches.open(name)).matchAll()
          if (await Promise.all(entries.map(response => response.text())).then(text => text.some(html => html.includes('name="huanyu-cache-qa"')))) return true
        }
        return false
      }, null, { timeout: 15000 })
      await page.goto(base, { waitUntil: 'networkidle' })
      assert.equal(await page.locator('meta[name="huanyu-cache-qa"]').getAttribute('content'), 'next')
      result.newRelease = { changedShellApplied: true, ...(await settle(page)) }
      assert.equal(result.newRelease.transferredAssets, 0, 'Unchanged assets re-downloaded after shell update')
      // Explicit update links must bypass the previous cached shell and remove
      // only their one-time marker, preserving ordinary query/hash state.
      const response = await page.goto(base + '/?article=keep&__huanyu_update=test#care-section', { waitUntil: 'networkidle' })
      assert.equal(response.fromServiceWorker(), false)
      assert.equal(new URL(page.url()).searchParams.get('article'), 'keep')
      assert.equal(new URL(page.url()).searchParams.has('__huanyu_update'), false)
      result.explicitUpdateBypassesCache = true
      await fetch(`${base}/__qa/initial`)
    }
    assert.deepEqual(errors, [])
    result.errors = errors
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify({ checkedAt: new Date().toISOString(), base, result }, null, 2) + '\n')
    console.log(JSON.stringify(result, null, 2))
  } finally { await context.close(); await fs.rm(profile, { recursive: true, force: true }) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
