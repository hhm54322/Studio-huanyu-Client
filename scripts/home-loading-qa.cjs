const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5318/'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/patient-updates-2026-10-31/performance/optimized')
const measureOnly = process.argv.includes('--measure-only')

async function resources(page) {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('resource')
    const images = entries.filter(r => /\/images\//.test(r.name))
    const scripts = entries.filter(r => /\.js(?:\?|$)/.test(r.name))
    return {
      images: images.length,
      imageBytes: images.reduce((n, r) => n + r.encodedBodySize, 0),
      imageTransferBytes: images.reduce((n, r) => n + r.transferSize, 0),
      jsCount: scripts.length,
      jsDecodedBytes: scripts.reduce((n, r) => n + r.decodedBodySize, 0),
      jsEncodedBytes: scripts.reduce((n, r) => n + r.encodedBodySize, 0),
      jsTransferBytes: scripts.reduce((n, r) => n + r.transferSize, 0),
      largestScripts: scripts.sort((a, b) => b.decodedBodySize - a.decodedBodySize).slice(0, 5).map(r => ({ path: new URL(r.name).pathname, decodedBytes: r.decodedBodySize })),
      imagePaths: images.map(r => new URL(r.name).pathname),
      lcpMs: window.huanyuLoadingMetrics.lcp,
      cls: window.huanyuLoadingMetrics.cls,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    }
  })
}

async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = [], failures = [], sections = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    page.on('requestfailed', r => failures.push({ url: r.url(), error: r.failure()?.errorText }))
    await page.addInitScript(() => {
      performance.setResourceTimingBufferSize(5000)
      window.huanyuLoadingMetrics = { lcp: 0, cls: 0 }
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.huanyuLoadingMetrics.lcp = entry.startTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.huanyuLoadingMetrics.cls += entry.value
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.locator('.home-source-hero').waitFor({ state: 'visible' })
    const initial = await resources(page)
    await page.screenshot({ path: path.join(output, 'initial-desktop.png') })
    assert.equal(initial.horizontalOverflow, false)

    if (!measureOnly) {
      const deferred = page.locator('.home-patient-stories [data-source-images="deferred"]')
      assert.ok(await deferred.count(), 'Distant patient-story photos were requested on initial load')
      const initiallyHidden = await page.locator('.home-patient-stories__photos').evaluate(el => [...el.querySelectorAll('[style]')].every(n => !n.style.backgroundImage.includes('url(')))
      assert.equal(initiallyHidden, true)

      for (const selector of ['#process-stage-01', '#process-stage-02', '#process-stage-03', '#process-stage-04', '.home-patient-stories', '#care-section', '#data-section', '.home-strength-source', '.home-partners-source', '#home-cta']) {
        const section = page.locator(selector)
        await section.scrollIntoViewIfNeeded()
        await page.waitForTimeout(350)
        const visibleDeferred = await section.locator('[data-source-images="deferred"]').evaluateAll(elements => elements.filter(element => {
          const rect = element.getBoundingClientRect()
          const style = getComputedStyle(element)
          return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && !element.closest('[aria-hidden="true"]')
        }).map(element => element.getAttribute('data-figma-node')))
        assert.deepEqual(visibleDeferred, [], `${selector}: visible image source roots stayed deferred`)
        const loaded = await section.evaluate(async el => {
          const urls = new Set()
          for (const node of [el, ...el.querySelectorAll('*')]) {
            if (node instanceof HTMLImageElement && node.getAttribute('src')) urls.add(node.src)
            for (const match of getComputedStyle(node).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(match[1])
          }
          const failed = []
          await Promise.all([...urls].map(async url => {
            const image = new Image()
            image.src = url
            try { await image.decode() } catch { failed.push(url) }
          }))
          return { imageUrls: urls.size, failed }
        })
        assert.deepEqual(loaded.failed, [], `${selector}: image decode failed`)
        if (['.home-patient-stories', '.home-strength-source', '.home-partners-source'].includes(selector)) assert.ok(loaded.imageUrls > 0, `${selector}: descendants did not inherit image readiness`)
        await section.screenshot({ path: path.join(output, selector.replace(/^[.#]/, '') + '.png') })
        sections.push({ selector, ...loaded })
      }
      // A real modal must load its own photographs and preserve page position.
      const story = page.locator('.home-patient-stories')
      await story.scrollIntoViewIfNeeded()
      const scroll = await page.evaluate(() => scrollY)
      await page.locator('[data-figma-node="1412:5892"]').click()
      await page.locator('dialog[open] .home-story-photos').waitFor({ state: 'visible' })
      await page.locator('dialog[open]').screenshot({ path: path.join(output, 'patient-detail.png') })
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('dialog[open]').count(), 0)
      assert.equal(await page.evaluate(() => scrollY), scroll)
      // Previously loaded sections must remain ready after scrolling away/back.
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      await story.scrollIntoViewIfNeeded()
      assert.equal(await story.locator('[data-source-images="deferred"]').count(), 0)
    }
    const afterScroll = await resources(page)
    const report = { createdAt: new Date().toISOString(), base, measureOnly, conditions: 'Clean Chromium context, 1440x1000, DPR2, reduced motion, production preview; local timings are not WAN speed claims', initial, sections, afterScroll, errors, failures }
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ ...report, initial: { ...initial, imagePaths: undefined }, afterScroll: { ...afterScroll, imagePaths: undefined } }, null, 2))
    assert.deepEqual(errors, [])
    assert.deepEqual(failures, [])
    assert.equal(afterScroll.horizontalOverflow, false)
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
