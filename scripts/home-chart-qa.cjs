const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

async function main() {
  const output = path.resolve('docs/figma-verification/home/2026-09-28')
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const results = []
    for (const reducedMotion of ['reduce', 'no-preference']) {
      await page.emulateMedia({ reducedMotion })
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 })
        await page.locator('.data-section').scrollIntoViewIfNeeded()
        await page.waitForTimeout(1000)
        const charts = await page.locator('.source-chart').evaluateAll(elements => elements.map(element => {
          const canvas = element.querySelector('canvas')
          const rect = element.getBoundingClientRect()
          const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
          let painted = 0
          for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) painted++
          return { x: rect.x, width: rect.width, height: rect.height, instance: element.querySelector('.chart-canvas').getAttribute('_echarts_instance_'), painted, canvasWidth: canvas.width, canvasHeight: canvas.height }
        }))
        assert.equal(charts.length, 2)
        for (const chart of charts) {
          assert.ok(chart.instance, 'ECharts instance must exist')
          assert.ok(chart.painted > 10000, 'chart canvas must not be blank')
          assert.ok(chart.x >= 0 && chart.x + chart.width <= width, `chart must fit ${width}px viewport: ${JSON.stringify(chart)}`)
          assert.ok(Math.abs(chart.width / chart.height - 542 / 300) < 0.01, 'chart aspect ratio must remain stable')
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
        const section = await page.locator('.data-section').evaluate(element => {
          const rect = element.getBoundingClientRect()
          return { x: rect.x, y: rect.y + scrollY, width: rect.width, height: rect.height }
        })
        await page.evaluate(() => scrollTo(0, 0))
        const screenshot = await page.screenshot({ fullPage: true })
        await sharp(screenshot).extract({ left: Math.round(section.x * 2), top: Math.round(section.y * 2), width: Math.round(section.width * 2), height: Math.round(section.height * 2) }).png().toFile(path.join(output, `echarts-${width}-${reducedMotion}.png`))
        results.push({ width, reducedMotion, charts })
      }
      await page.goto('http://127.0.0.1:5173/about', { waitUntil: 'networkidle' })
      assert.equal(await page.locator('.source-chart').count(), 0)
      await page.goBack({ waitUntil: 'networkidle' })
      await page.waitForFunction(() => document.querySelectorAll('.source-chart canvas').length === 2)
    }
    assert.deepEqual(errors, [])
    const local = await sharp(path.join(output, 'echarts-1440-reduce.png')).resize({ width: 1440 }).ensureAlpha().raw().toBuffer()
    const reference = await sharp(path.join(output, 'figma-section-7.png')).ensureAlpha().raw().toBuffer()
    const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
    const diff = Buffer.alloc(local.length)
    const changed = pixelmatch(reference, local, diff, 1440, 740, { threshold: 0.15, includeAA: false })
    await sharp(diff, { raw: { width: 1440, height: 740, channels: 4 } }).png().toFile(path.join(output, 'echarts-diff.png'))
    const report = { results, errors, changedPixelRatio: changed / (1440 * 740) }
    await fs.writeFile(path.join(output, 'echarts-qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
  } finally {
    await browser.close()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
