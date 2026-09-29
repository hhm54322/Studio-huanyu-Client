const fs = require('node:fs/promises')
const path = require('node:path')

// QA dependencies live outside the application dependency graph.
const tools = process.env.HUANYU_QA_TOOLS || '/tmp/huanyu-visual-qa-tools/node_modules'
const { chromium } = require(path.join(tools, 'playwright'))
const sharp = require(path.join(tools, 'sharp'))

async function captureBaseline(page, destination, geometry) {
  const scale = 2
  const viewportHeight = page.viewportSize().height
  if (geometry.height * scale <= 16000) {
    await page.screenshot({ path: destination, fullPage: true })
    return 'full-page'
  }
  // Long composited pages can exceed Chromium's texture limit at 2x scale.
  const tiles = []
  for (let top = 0; top < geometry.height; top += viewportHeight) {
    await page.evaluate(y => scrollTo(0, y), top)
    await page.waitForTimeout(120)
    const actualTop = await page.evaluate(() => scrollY)
    const buffer = await page.screenshot({
      fullPage: false,
      style: top ? 'header.patient-header, .consult-float { display: none !important; }' : '',
    })
    const height = Math.min(viewportHeight, geometry.height - top)
    const input = await sharp(buffer).extract({
      left: 0, top: Math.round((top - actualTop) * scale),
      width: geometry.width * scale, height: height * scale,
    }).toBuffer()
    tiles.push({ input, top: top * scale, left: 0 })
  }
  await sharp({ create: { width: geometry.width * scale, height: geometry.height * scale, channels: 4, background: '#fff' } }).composite(tiles).png().toFile(destination)
  await page.evaluate(() => scrollTo(0, 0))
  return 'viewport-tiles'
}

async function main() {
  const [name = 'about', route = '/about', reference] = process.argv.slice(2)
  const runDate = process.env.HUANYU_QA_DATE || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
  const out = path.resolve('docs/figma-verification', name, runDate)
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const results = []
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 })
      // Capture the authored resting state; animated carousels/marquees must not advance during the baseline diff.
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 600) {
        await page.evaluate(y => scrollTo(0, y), y)
        await page.waitForTimeout(90)
      }
      await page.evaluate(() => scrollTo(0, 0))
      await page.waitForTimeout(1200)
      const geometry = await page.evaluate(() => ({
        width: innerWidth,
        height: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
        sections: [...document.querySelectorAll('main section, footer')].map(el => {
          const rect = el.getBoundingClientRect()
          return { selector: el.className, x: rect.x, y: rect.y + scrollY, width: rect.width, height: rect.height }
        }),
        brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src),
      }))
      const screenshot = path.join(out, `local-${width}.png`)
      const nativeScreenshot = path.join(out, `local-${width}-2x.png`)
      geometry.captureMethod = await captureBaseline(page, nativeScreenshot, geometry)
      await sharp(nativeScreenshot).resize({ width }).png().toFile(screenshot)
      for (const [index, section] of geometry.sections.entries()) {
        if (section.y < 0 || section.height < 1) continue
        const cropName = width === 1440 ? `local-section-${index + 1}.png` : `local-${width}-section-${index + 1}.png`
        await sharp(screenshot).extract({ left: 0, top: Math.round(section.y), width, height: Math.min(Math.round(section.height), geometry.height - Math.round(section.y)) }).toFile(path.join(out, cropName))
      }
      results.push(geometry)
    }
    if (reference) {
      // Keep the source evidence immutable. Passing a reference already inside
      // this output directory must not make Sharp read and overwrite one file.
      const ref = path.join(out, 'figma-reference-1440.png')
      const sourceMeta = await sharp(reference).metadata()
      // Figma exports keep the authored 1440px desktop frame at 2x even for
      // short pages. Compare those pixels natively instead of downsampling
      // and re-rasterizing the reference first.
      const nativeReference = sourceMeta.width >= 2880 && sourceMeta.height >= 2 * 1000
      const nativeRef = path.join(out, 'figma-reference-native.png')
      if (nativeReference) {
        if (path.resolve(reference) !== path.resolve(nativeRef)) await sharp(reference).png().toFile(nativeRef)
        await sharp(reference).resize({ width: 1440 }).png().toFile(ref)
      } else if (path.resolve(reference) !== path.resolve(ref)) {
        await sharp(reference).resize({ width: 1440 }).png().toFile(ref)
      }
      const local = path.join(out, 'local-1440.png')
      const refMeta = await sharp(ref).metadata()
      const localMeta = await sharp(local).metadata()
      const height = Math.max(refMeta.height, localMeta.height)
      const a = await sharp(ref).extend({ bottom: height - refMeta.height, background: '#ff00ff' }).ensureAlpha().raw().toBuffer()
      const b = await sharp(local).extend({ bottom: height - localMeta.height, background: '#00ffff' }).ensureAlpha().raw().toBuffer()
      const pixelmatch = (await import(path.join(tools, 'pixelmatch/index.js'))).default
      const diff = Buffer.alloc(a.length)
      const changed = pixelmatch(a, b, diff, 1440, height, { threshold: 0.15, includeAA: false })
      await sharp(diff, { raw: { width: 1440, height, channels: 4 } }).png().toFile(path.join(out, 'diff.png'))
      let measuredChanged = changed
      let measuredPixels = 1440 * height
      if (nativeReference) {
        const nativeLocal = path.join(out, 'local-1440-2x.png')
        const nativeMeta = await sharp(nativeRef).metadata()
        const localNativeMeta = await sharp(nativeLocal).metadata()
        const nativeHeight = Math.max(nativeMeta.height, localNativeMeta.height)
        const nativeA = await sharp(nativeRef).extend({ bottom: nativeHeight - nativeMeta.height, background: '#ff00ff' }).ensureAlpha().raw().toBuffer()
        const nativeB = await sharp(nativeLocal).extend({ bottom: nativeHeight - localNativeMeta.height, background: '#00ffff' }).ensureAlpha().raw().toBuffer()
        measuredChanged = pixelmatch(nativeA, nativeB, null, nativeMeta.width, nativeHeight, { threshold: 0.15, includeAA: false })
        measuredPixels = nativeMeta.width * nativeHeight
      }
      await sharp(ref).extend({ bottom: height - refMeta.height, background: '#ff00ff' }).composite([{ input: await sharp(local).ensureAlpha(0.5).toBuffer(), blend: 'over' }]).png().toFile(path.join(out, 'overlay.png'))
      results.push({ referenceHeight: refMeta.height, localHeight: localMeta.height, changedPixelRatio: measuredChanged / measuredPixels, comparison: nativeReference ? 'native-2x' : '1440-css-pixels' })
      for (const [index, section] of results[0].sections.entries()) {
        const top = Math.round(section.y)
        const sectionHeight = Math.min(Math.round(section.height), refMeta.height - top)
        if (top < 0 || sectionHeight < 1) continue
        await sharp(ref).extract({ left: 0, top, width: 1440, height: sectionHeight }).toFile(path.join(out, `figma-section-${index + 1}.png`))
      }
    }
    await fs.writeFile(path.join(out, 'geometry.json'), JSON.stringify({ results, errors }, null, 2) + '\n')
    console.log(JSON.stringify({ directory: out, results, errors }, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
