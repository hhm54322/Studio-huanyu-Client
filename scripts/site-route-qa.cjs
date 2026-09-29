const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const routes = [
  '/', '/about', '/why-china', '/hospitals', '/cases', '/diseases-technologies',
  '/dental', '/steps', '/cost', '/insurance', '/report', '/trust', '/cost-generated',
  '/equipment', '/visa', '/professional-report',
]
const disabledRoutes = new Set(['/equipment', '/visa', '/professional-report'])

async function main() {
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    for (const width of [1440, 390]) {
      for (const route of routes) {
        const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } })
        const errors = []
        const failedResources = []
        page.on('pageerror', error => errors.push(error.message))
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
        page.on('response', response => { if (response.status() >= 400) failedResources.push({ url: response.url(), status: response.status() }) })
        await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        await page.waitForTimeout(250)
        const geometry = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
          canvasPixels: [...document.querySelectorAll('canvas')].map(canvas => {
            const context = canvas.getContext('2d')
            if (!context) return 0
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
            let nonTransparent = 0
            for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) nonTransparent += 1
            return nonTransparent
          }),
          main: Boolean(document.querySelector('main')),
        }))
        assert.equal(geometry.width, width, `${route}/${width}: viewport changed`)
        assert.equal(geometry.scrollWidth, width, `${route}/${width}: horizontal overflow`)
        assert.ok(geometry.height > 300, `${route}/${width}: empty document`)
        assert.equal(geometry.brokenImages.length, 0, `${route}/${width}: broken images`)
        if (route === '/cost' || route === '/cost-generated') {
          assert.ok(geometry.canvasPixels.some(pixelCount => pixelCount > 0), `${route}/${width}: ECharts canvas is blank`)
        }
        if (!disabledRoutes.has(route)) assert.equal(geometry.main, true, `${route}/${width}: missing main`)
        assert.deepEqual(errors, [], `${route}/${width}: runtime errors ${JSON.stringify(errors)}`)
        assert.deepEqual(failedResources, [], `${route}/${width}: failed resources ${JSON.stringify(failedResources)}`)
        if (disabledRoutes.has(route)) assert.equal(new URL(page.url()).pathname, route, `${route}: unexpected redirect`)
        results.push({ route, width, finalPath: new URL(page.url()).pathname, disabled: disabledRoutes.has(route), ...geometry, errors, failedResources })
        await page.close()
      }
    }
    const evidence = { run: '2026-09-29', routes: routes.length, viewports: 2, checks: results.length, disabledRoutes: [...disabledRoutes], results }
    const evidencePath = path.resolve('docs/figma-verification/site-route-qa-2026-09-29.json')
    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n')
    console.log(JSON.stringify(evidence, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
