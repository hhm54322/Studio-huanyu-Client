const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5319/'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/home-loading-order/optimized')
const baseline = process.argv.includes('--baseline')
const repetitions = Number(process.env.HUANYU_QA_RUNS || 3)
const imagePath = '/images/figma/home-revision/image-bee6ffbc855ab5ba563cd535ce7c82be8e6002e1.webp'

async function measure(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = [], failures = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => failures.push({ url: request.url(), error: request.failure()?.errorText }))
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1600000 / 8, uploadThroughput: 750000 / 8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await page.addInitScript(() => {
    performance.setResourceTimingBufferSize(5000)
    window.huanyuOrder = { textMs: 0, imageDecodedMs: 0, cls: 0, lcpMs: 0 }
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) window.huanyuOrder.lcpMs = entry.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.huanyuOrder.cls += entry.value
    }).observe({ type: 'layout-shift', buffered: true })
    let decoding = false
    const sample = () => {
      const root = document.querySelector('.home-source-hero')
      if (root) {
        const text = [...root.querySelectorAll('.home-source-node--text')].find(element => element.textContent.trim())
        if (text && !window.huanyuOrder.textMs) {
          const rect = text.getBoundingClientRect()
          let visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight
          for (let element = text; element && visible; element = element.parentElement) {
            const style = getComputedStyle(element)
            visible = style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0
          }
          if (visible) window.huanyuOrder.textMs = performance.now()
        }
        const imageNode = root.querySelector('[data-figma-node="1523:37"]')
        const url = imageNode && getComputedStyle(imageNode).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1]
        if (url && !decoding) {
          decoding = true
          const image = new Image()
          image.src = url
          image.decode().then(() => requestAnimationFrame(() => { window.huanyuOrder.imageDecodedMs = performance.now() }))
        }
      }
      if (!window.huanyuOrder.textMs || !window.huanyuOrder.imageDecodedMs) requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForFunction(() => window.huanyuOrder?.textMs && window.huanyuOrder.imageDecodedMs, undefined, { timeout: 90000 })
    await page.waitForLoadState('networkidle')
    const result = await page.evaluate(imagePath => {
      const entries = performance.getEntriesByType('resource')
      const hero = entries.filter(entry => new URL(entry.name).pathname === imagePath)
      const js = entries.filter(entry => /\.js(?:\?|$)/.test(entry.name))
      const image = hero[0]
      return {
        ...window.huanyuOrder,
        textToImageMs: Math.max(0, window.huanyuOrder.imageDecodedMs - window.huanyuOrder.textMs),
        heroRequests: hero.length,
        hero: image && { startMs: image.startTime, responseEndMs: image.responseEnd, bytes: image.encodedBodySize, initiator: image.initiatorType },
        fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        jsDecodedBytes: js.reduce((sum, entry) => sum + entry.decodedBodySize, 0),
        jsEncodedBytes: js.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        preloadUrls: [...document.querySelectorAll('[data-huanyu-preload="home"]')].map(link => new URL(link.href).pathname),
      }
    }, imagePath)
    await page.screenshot({ path: path.join(output, `home-${Date.now()}.png`) })
    assert.equal(result.horizontalOverflow, false)
    assert.equal(result.heroRequests, 1, 'Preload and displayed CSS background must share the same request')
    assert.equal(result.cls, 0)
    assert.deepEqual(errors, [])
    assert.deepEqual(failures, [])
    if (!baseline) {
      assert.ok(result.preloadUrls.includes(imagePath))
      assert.equal(result.hero.initiator, 'link')
      assert.ok(result.hero.startMs < result.textMs, 'The hero request must start before Vue paints its copy')
    }
    return { ...result, errors, failures }
  } finally { await context.close() }
}

async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  try {
    const results = []
    for (let run = 0; run < repetitions; run++) results.push(await measure(browser))
    const median = key => results.map(item => item[key]).sort((a, b) => a - b)[Math.floor(results.length / 2)]
    const report = { createdAt: new Date().toISOString(), base, baseline, conditions: 'New Chromium context per run, 1440x1000 DPR2, reduced motion, 1.6 Mbps down, 150 ms latency, CPU 4x; local emulation, not a public-site SLA', median: Object.fromEntries(['textMs', 'imageDecodedMs', 'textToImageMs', 'fcpMs', 'lcpMs', 'jsDecodedBytes', 'jsEncodedBytes'].map(key => [key, median(key)])), results }
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
