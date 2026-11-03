const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5319/'
const referenceBase = process.env.HUANYU_QA_BASELINE || 'http://127.0.0.1:5320/'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/home-loading-order/routes')
const routes = ['/', '/why-china', '/trust', '/insurance', '/hospitals', '/doctors', '/report', '/cases', '/dental', '/diseases-technologies', '/steps', '/steps/toolkit-detail', '/about']

async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(async () => {
    const urls = new Set()
    for (const node of document.querySelectorAll('*')) {
      const box = node.getBoundingClientRect()
      if (!box.width || !box.height || box.bottom <= 0 || box.top >= innerHeight) continue
      if (node instanceof HTMLImageElement && node.currentSrc) urls.add(node.currentSrc)
      for (const match of getComputedStyle(node).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(match[1])
    }
    await Promise.all([...urls].map(async url => { const image = new Image(); image.src = url; await image.decode() }))
  })
}
async function capture(browser, origin, route, suffix) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
  const page = await context.newPage(), errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(new URL(route, origin).href, { waitUntil: 'networkidle' })
    await settle(page)
    const slug = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')
    const image = path.join(output, `${slug}-${suffix}.png`)
    await page.screenshot({ path: image, animations: 'disabled' })
    const loading = await page.evaluate(() => {
      const resources=performance.getEntriesByType('resource')
      const scripts = resources.filter(entry => /\.js(?:\?|$)/.test(entry.name))
      const images=resources.filter(entry=>/\.(?:webp|png|jpe?g|svg)(?:\?|$)/i.test(entry.name))
      const preload=document.querySelector('[data-huanyu-preload="patient-hero"]')
      const hero=preload?resources.filter(entry=>entry.name===preload.href):[]
      return {
        imageRequests:images.length,
        imageEncodedBytes:images.reduce((sum,entry)=>sum+entry.encodedBodySize,0),
        heroPreload:preload?{url:preload.href,requests:hero.length,transferredRequests:hero.filter(entry=>entry.transferSize>0).length,initiator:hero[0]?.initiatorType,startMs:hero[0]?.startTime}:null,
        jsDecodedBytes: scripts.reduce((sum, entry) => sum + entry.decodedBodySize, 0),
        jsEncodedBytes: scripts.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
        homeData: scripts.filter(entry => /homeFigmaSource-/.test(entry.name)).map(entry => new URL(entry.name).pathname),
        hospitalData: scripts.filter(entry => /(?:hospitalFigmaSource|HospitalView)-/.test(entry.name)).map(entry => new URL(entry.name).pathname),
        dentalDetails: scripts.filter(entry => /DentalDoctorSourceDialog-/.test(entry.name)).map(entry => new URL(entry.name).pathname),
        toolkitVariants: scripts.filter(entry => /desktop-variant-2026-10-22-/.test(entry.name)).map(entry => new URL(entry.name).pathname),
        homePreloads: document.querySelectorAll('[data-huanyu-preload^="home"]').length,
        routePreloads: document.querySelectorAll('[data-huanyu-preload="patient-entry"]').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }
    })
    let footerImage
    if (await page.locator('.patient-footer').isVisible().catch(() => false)) {
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await settle(page)
      footerImage = path.join(output, `${slug}-footer-${suffix}.png`)
      await page.screenshot({ path: footerImage, animations: 'disabled' })
    }
    if (suffix === 'optimized' && route === '/about') {
      // Importing homepage sources must still work after entering through a
      // secondary route. Use the actual navigation instead of page.goto().
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      await page.locator('.header-logo').click()
      await page.locator('.home-source-hero').waitFor({ state: 'visible' })
      await settle(page)
      const trigger = page.locator('[data-figma-node="1523:95"]')
      await trigger.hover()
      await page.locator('#home-services-menu').waitFor({ state: 'visible' })
      await page.keyboard.press('Escape')
      await page.locator('#home-services-menu').waitFor({ state: 'hidden' })
    }
    assert.deepEqual(errors, [])
    assert.equal(loading.overflow, false, route)
    if (suffix === 'optimized' && route !== '/') {
      assert.deepEqual(loading.homeData, [], `${route}: still fetched full homepage data`)
      assert.equal(loading.homePreloads, 0, `${route}: unnecessary homepage preload`)
    }
    if (suffix === 'optimized' && route !== '/hospitals') {
      assert.deepEqual(loading.hospitalData, [], `${route}: fetched hospital sources through a shared utility`)
    }
    if (suffix === 'optimized') {
      if (loading.heroPreload) {
        // PerformanceResourceTiming records both the preload and the later
        // image consumer. They intentionally share one URL; only the first
        // entry should transfer bytes. Assert the network behavior rather
        // than treating the browser's two bookkeeping entries as a duplicate
        // download.
        assert.equal(loading.heroPreload.transferredRequests, 1, 'The early image and CSS must reuse one network request')
        assert.equal(loading.heroPreload.initiator, 'link')
      }
      assert.deepEqual(loading.dentalDetails, [], `${route}: loaded dental details before they were requested`)
      assert.deepEqual(loading.toolkitVariants, [], `${route}: loaded toolkit articles before they were selected`)
    }
    return { image, footerImage, ...loading, errors }
  } finally { await context.close() }
}
async function compare(reference, local) {
  const [a, b] = await Promise.all([reference, local].map(file => sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })))
  assert.deepEqual(a.info, b.info)
  let sum = 0
  for (let index = 0; index < a.data.length; index++) sum += Math.abs(a.data[index] - b.data[index])
  const [ra, rb] = await Promise.all([reference, local].map(file => sharp(file).ensureAlpha().raw().toBuffer()))
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const changed = pixelmatch(ra, rb, null, a.info.width, a.info.height, { threshold: .15, includeAA: false })
  const result = { nMAE: 100 * sum / a.data.length / 255, pixelmatchPercent: 100 * changed / a.info.width / a.info.height }
  assert.ok(result.nMAE < 1 && result.pixelmatchPercent < 1, `${local}: loading refactor changed resting layout: ${JSON.stringify(result)}`)
  return result
}
async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const results = []
  try {
    for (const route of routes) {
      const reference = await capture(browser, referenceBase, route, 'baseline')
      const optimized = await capture(browser, base, route, 'optimized')
      assert.ok(optimized.jsDecodedBytes <= reference.jsDecodedBytes + 32768, `${route}: first-load scripts regressed by more than 32KiB`)
      const visual = await compare(reference.image, optimized.image)
      const footerVisual = reference.footerImage && optimized.footerImage ? await compare(reference.footerImage, optimized.footerImage) : undefined
      results.push({ route, reference, optimized, visual, footerVisual })
    }
    const report = { createdAt: new Date().toISOString(), base, referenceBase, scope: 'Desktop loading refactor regression against the preceding local build; homepage Figma fidelity is verified separately', results }
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(results.map(item => ({ route: item.route, before: item.reference.jsDecodedBytes, after: item.optimized.jsDecodedBytes, visual: item.visual, footerVisual: item.footerVisual })), null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
