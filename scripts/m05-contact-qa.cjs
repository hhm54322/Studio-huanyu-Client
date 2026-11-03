// Local application only. Real WhatsApp navigation is intercepted; no messages.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base = 'http://127.0.0.1:5396', api = 'http://127.0.0.1:3095'
const out = path.resolve('artifacts/m05-20261104/browser')
const routes = ['/', '/dental', '/dental/doctors/tan-zhaolin', '/hospitals', '/doctors', '/trust', '/diseases-technologies', '/why-china', '/cases', '/insurance', '/steps', '/steps/toolkit-detail', '/about', '/report']
const languages = ['zh', 'en', 'id', 'ms', 'pt']
async function main() {
  await fs.mkdir(out, { recursive: true })
  const { cookie } = JSON.parse(await fs.readFile('../Studio-huanyu-Server/artifacts/m05/browser-auth.json', 'utf8'))
  const report = { checkedAt: new Date().toISOString(), routes: [], flows: [], errors: [], events: [], externalMessagesSent: false }
  const stats = async (query = '') => {
    const response = await fetch(`${api}/api/expert/analytics/contacts${query}`, { headers: { cookie } })
    assert.equal(response.status, 200)
    return response.json()
  }
  assert.equal((await stats()).totals.clicks, 0, 'Isolated QA database must start empty')
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  let expectedClicks = 0
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    await context.route('https://wa.me/**', route => route.fulfill({ status: 200, body: 'M05 local QA. No message sent.' }))
    const page = await context.newPage()
    page.setDefaultTimeout(10_000)
    page.on('pageerror', error => report.errors.push(error.message))
    async function activate(locator, method = 'mouse') {
      const completion = Promise.all([
        page.waitForResponse(response => response.url() === `${api}/api/analytics/events` && response.request().method() === 'POST'),
        method === 'middle' ? Promise.resolve(undefined) : page.waitForEvent('popup'),
      ])
      completion.catch(() => undefined)
      if (method === 'keyboard') { await locator.focus(); await page.keyboard.press('Enter') }
      else {
        const box = await locator.boundingBox()
        // Source footer rows also have a sibling Facebook label at their
        // centre. Click the WhatsApp text/icon area, not that separate link.
        await locator.click({ button: method === 'middle' ? 'middle' : 'left', position: { x: Math.min(32, box.width / 3), y: box.height / 2 } })
      }
      const [response, popup] = await completion
      assert.equal(response.status(), 202)
      const request = response.request(), payload = JSON.parse(request.postData())
      assert.equal(request.headers()['content-type'], 'text/plain;charset=UTF-8')
      assert.equal(request.headers().referer, undefined)
      assert.equal(request.headers().cookie, undefined)
      if (popup) { await popup.waitForLoadState('domcontentloaded'); await popup.close() }
      else for (const extra of context.pages()) if (extra !== page) await extra.close()
      report.events.push(payload); expectedClicks++
      assert.equal((await stats()).totals.clicks, expectedClicks, 'Exactly one stored event per user activation')
      return payload
    }
    for (const language of languages) for (const [index, route] of routes.entries()) {
      console.log(`${language} ${route}`)
      await page.goto(`${base}${route}?lang=${language}&disease=lung_cancer&country=MY&utm_source=facebook&utm_medium=paid_social&utm_campaign=M05-${language}&utm_term=medical-care&email=PRIVATE_EMAIL&token=PRIVATE_TOKEN`, { waitUntil: 'networkidle' })
      const fixed = page.locator('a[data-contact-entry="floating"]')
      await fixed.waitFor({ state: 'visible' })
      let target = fixed
      if (index % 2) {
        await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
        target = page.locator('a[data-contact-entry]:not([data-contact-entry="floating"])').filter({ visible: true }).last()
        await target.waitFor({ state: 'visible' })
      }
      const entry = await target.getAttribute('data-contact-entry')
      const href = new URL(await target.getAttribute('href'))
      const payload = await activate(target)
      assert.equal(payload.locale, language)
      assert.equal(payload.entry, entry)
      assert.equal(payload.topic, route === '/dental' ? 'whitening' : 'lung_cancer')
      assert.equal(payload.attribution.utm_campaign, `M05-${language}`)
      assert.equal(payload.attribution.utm_term, 'medical-care')
      assert.ok(href.searchParams.get('text').includes(`page=${payload.page}`))
      assert.ok(!JSON.stringify(payload).includes('PRIVATE_'))
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      report.routes.push({ language, route, entry, eventId: payload.eventId })
      if (route === '/' && ['zh', 'pt'].includes(language)) await page.screenshot({ path: path.join(out, `${language}-home.png`) })
    }
    assert.equal(new Set(report.events.map(event => event.visitorId)).size, 1)
    assert.equal(new Set(report.events.map(event => event.sessionId)).size, 1)
    assert.equal(new Set(report.events.map(event => event.eventId)).size, 70)
    // Hovering and synthetic dispatch must never count as user contact clicks.
    await page.goto(`${base}/?lang=en&utm_source=google&utm_campaign=M05-new&utm_term=new-term`, { waitUntil: 'networkidle' })
    const fixed = page.locator('a[data-contact-entry="floating"]')
    await fixed.hover()
    await fixed.evaluate(element => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })))
    await page.waitForTimeout(150)
    for (const extra of context.pages()) if (extra !== page) await extra.close()
    assert.equal((await stats()).totals.clicks, expectedClicks)
    report.flows.push('hover, page visits and synthetic clicks are not counted')
    const newer = await activate(fixed, 'keyboard')
    assert.equal(newer.attribution.utm_source, 'google'); assert.equal(newer.attribution.utm_campaign, 'M05-new')
    await page.locator('.patient-desktop-navigation a[href="/about"]').click(); await page.waitForURL(`${base}/about`)
    const internal = await activate(fixed, 'middle')
    assert.equal(internal.page, 'patient-about'); assert.equal(internal.attribution.utm_campaign, 'M05-new')
    assert.equal(internal.visitorId, report.events[0].visitorId)
    report.flows.push('keyboard/middle-button activation; source survives SPA navigation without duplicate listeners')
    const duplicate = await fetch(`${api}/api/analytics/events`, { method: 'POST', headers: { origin: base, 'content-type': 'text/plain' }, body: JSON.stringify(internal) })
    assert.equal(duplicate.status, 202); assert.equal((await stats()).totals.clicks, expectedClicks)
    report.flows.push('server retries are idempotent')
    // Abort only our analytics transport, while the actual contact popup stays usable.
    await context.route(`${api}/api/analytics/events`, route => route.abort('internetdisconnected'))
    const popupPromise = page.waitForEvent('popup'); await fixed.click()
    const popup = await popupPromise; await popup.waitForLoadState('domcontentloaded'); await popup.close()
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('huanyu.contact-events.v1') || '[]').length === 1)
    const queued = await page.evaluate(() => JSON.parse(sessionStorage.getItem('huanyu.contact-events.v1'))[0])
    await page.reload({ waitUntil: 'networkidle' })
    await context.unroute(`${api}/api/analytics/events`)
    const recoveredPromise = page.waitForResponse(response => response.url() === `${api}/api/analytics/events` && response.status() === 202)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    const recovered = await recoveredPromise
    assert.equal(JSON.parse(recovered.request().postData()).eventId, queued.eventId)
    expectedClicks++; report.events.push(queued)
    await page.waitForFunction(() => JSON.parse(sessionStorage.getItem('huanyu.contact-events.v1') || '[]').length === 0)
    assert.equal((await stats()).totals.clicks, expectedClicks)
    report.flows.push('network failure does not block WhatsApp; pending event survives reload and recovers once')
    // A separate browser context has a separate visitor ID.
    const isolated = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await isolated.route('https://wa.me/**', route => route.fulfill({ status: 200, body: 'Local QA only' }))
    await isolated.addInitScript(() => { Object.defineProperty(Storage.prototype, 'getItem', { value() { throw Error('blocked') } }); Object.defineProperty(Storage.prototype, 'setItem', { value() { throw Error('blocked') } }) })
    const privatePage = await isolated.newPage(); privatePage.on('pageerror', error => report.errors.push(error.message))
    await privatePage.goto(`${base}/?lang=ms`, { waitUntil: 'networkidle' })
    const privateResponse = privatePage.waitForResponse(response => response.url() === `${api}/api/analytics/events`)
    const privatePopup = privatePage.waitForEvent('popup')
    await privatePage.locator('a[data-contact-entry="floating"]').click()
    const privateResult = await privateResponse; assert.equal(privateResult.status(), 202)
    const privateEvent = JSON.parse(privateResult.request().postData()); assert.notEqual(privateEvent.visitorId, report.events[0].visitorId)
    const privateTab = await privatePopup; await privateTab.close(); expectedClicks++; report.events.push(privateEvent)
    await isolated.close(); report.flows.push('blocked storage leaves contacts usable and uses memory IDs')
    const final = await stats('?groupBy=locale,campaign,keyword&limit=100')
    assert.deepEqual(final.totals, { clicks: expectedClicks, uniqueVisitors: 2, sessions: 2 })
    assert.equal(final.groups.reduce((sum, row) => sum + row.clicks, 0), expectedClicks)
    assert.equal(final.metrics.conversations, 'not_measured')
    assert.ok(final.groups.some(row => row.keyword === 'medical-care'))
    report.summary = final; assert.deepEqual(report.errors, [])
  } finally {
    // Evidence records the public event metadata, never auth credentials.
    await fs.writeFile(path.join(out, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    await browser.close()
  }
  console.log(`M05 QA passed: ${report.routes.length} route/language clicks, ${expectedClicks} stored clicks and 2 anonymous browsers.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
