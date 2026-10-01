const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

const base = process.env.HUANYU_QA_URL || 'https://www.huanyumedical.com'
const output = path.resolve(process.env.HUANYU_QA_OUT || 'docs/figma-verification/production-regression')
const widths = (process.env.HUANYU_QA_WIDTHS || '1440,2048,1024,768,390,320').split(',').map(Number)
const routes = (process.env.HUANYU_QA_ROUTES || '/,/about,/why-china,/hospitals,/cases,/diseases-technologies,/dental,/steps,/cost,/insurance,/report,/trust').split(',')
const cacheKey = process.env.HUANYU_QA_CACHE_KEY || String(Date.now())

function inspectLayout() {
  const describe = element => ({
    tag: element.tagName, class: String(element.className).slice(0, 100),
    text: element.textContent.trim().slice(0, 100),
  })
  const clippedText = []
  const outsideContent = []
  const emptySections = []
  for (const element of document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main button, main a, footer a')) {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none') continue
    // Image crops, tickers, tabs, and charts intentionally contain offscreen content.
    if (element.closest('.partners-marquee, .savings-marquee, .saving-tags, .hospital-tabs, .comparison-chart-scroll, .insurance-compare')) continue
    if (element.textContent.trim() && element.scrollWidth > element.clientWidth + 2 &&
      !['auto', 'scroll'].includes(style.overflowX) &&
      !element.closest('.city-tabs, .hospital-tabs') &&
      !(style.textOverflow === 'ellipsis' && style.overflow === 'hidden')) {
      clippedText.push({ ...describe(element), width: rect.width, scrollWidth: element.scrollWidth })
    }
    if (rect.left < -2 || rect.right > innerWidth + 2) {
      if (element.closest('.city-tabs, .hospital-tabs')) continue
      outsideContent.push({ ...describe(element), left: rect.left, right: rect.right })
    }
  }
  for (const element of document.querySelectorAll('.partners-marquee, main section')) {
    if (getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().height < 1) emptySections.push(describe(element))
  }
  return {
    viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight, main: Boolean(document.querySelector('main')),
    entryScripts: [...document.querySelectorAll('script[src]')].map(script => script.src),
    brokenImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src),
    loadingImages: [...document.images].filter(image => !image.complete).map(image => image.src),
    clippedText, outsideContent, emptySections,
    sections: [...document.querySelectorAll('main section, footer')].map(element => {
      const rect = element.getBoundingClientRect()
      return { class: element.className, x: rect.x, y: rect.y + scrollY, width: rect.width, height: rect.height }
    }),
    canvasPixels: [...document.querySelectorAll('canvas')].map(canvas => {
      const pixels = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data
      let count = 0
      for (let i = 3; pixels && i < pixels.length; i += 4) if (pixels[i]) count++
      return count
    }),
  }
}

async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    for (const route of routes) {
      const name = route === '/' ? 'home' : route.slice(1)
      const directory = path.join(output, name)
      await fs.mkdir(directory, { recursive: true })
      const context = await browser.newContext({ reducedMotion: 'reduce', deviceScaleFactor: 1 })
      const page = await context.newPage()
      for (const width of widths) {
        const errors = [], failedResources = []
        page.removeAllListeners('pageerror')
        page.removeAllListeners('response')
        page.on('pageerror', error => errors.push(error.message))
        page.on('response', response => {
          if (response.status() >= 400) failedResources.push({ url: response.url(), status: response.status() })
        })
        await page.setViewportSize({ width, height: width < 700 ? 844 : 900 })
        await page.goto(`${base}${route}?visualQA=${cacheKey}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.waitForSelector('main', { timeout: 30000 })
        await page.evaluate(() => document.fonts.ready)
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
            scrollTo({ top: y, behavior: 'instant' })
            await new Promise(resolve => setTimeout(resolve, 40))
          }
          scrollTo({ top: 0, behavior: 'instant' })
        })
        await page.waitForFunction(() => [...document.images].every(image => image.complete), { timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(300)
        const geometry = await page.evaluate(inspectLayout)
        const screenshot = path.join(directory, `page-${width}.png`)
        await page.screenshot({ path: screenshot, fullPage: true, timeout: 30000 })
        await sharp(screenshot).resize({ width: width < 700 ? 260 : 480 }).toFile(path.join(directory, `overview-${width}.png`))
        const result = { route, width, screenshot, ...geometry, errors, failedResources }
        results.push(result)
        await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ base, run: new Date().toISOString(), results }, null, 2))
        console.log(JSON.stringify({ route, width, height: geometry.height, overflow: geometry.scrollWidth - width, clipped: geometry.clippedText.length, outside: geometry.outsideContent.length, empty: geometry.emptySections.length, broken: geometry.brokenImages.length, loading: geometry.loadingImages.length, errors, failed: failedResources.length }))
      }
      await context.close()
    }
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
