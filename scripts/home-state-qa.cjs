const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

const out = path.resolve('docs/figma-verification/home/2026-09-29')
const expected = [
  '让全球患者安心赴华就医',
  '8000+个家庭已陪伴赴华就医',
  '就医保障，写在前面',
  '"来中国是我做过最正确的决定"',
]

async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
    const results = []
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 754 : 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      for (let index = 0; index < expected.length; index++) {
        await page.locator('.home-hero__controls button').nth(index).click()
        await page.locator('.home-hero h1').waitFor()
        await page.waitForTimeout(100)
        const state = await page.evaluate(() => ({
          title: document.querySelector('.home-hero h1')?.textContent,
          image: document.querySelector('.home-hero__image')?.getAttribute('src'),
          loaded: !!document.querySelector('.home-hero__image')?.naturalWidth,
          buttons: document.querySelectorAll('.home-hero__controls button').length,
          active: [...document.querySelectorAll('.home-hero__controls button')].findIndex(button => button.classList.contains('active')),
          overflow: document.documentElement.scrollWidth > innerWidth,
        }))
        if (state.title !== expected[index] || !state.loaded || state.active !== index || state.buttons !== 4 || state.overflow) {
          throw new Error(`Invalid ${width}px slide ${index + 1}: ${JSON.stringify(state)}`)
        }
        const screenshot = path.join(out, `local-banner-${index + 1}-${width}.png`)
        await page.locator('.home-hero').screenshot({ path: screenshot })
        results.push({ width, slide: index + 1, ...state, screenshot })
      }
      if (errors.length) throw new Error(`Page errors: ${errors.join(', ')}`)
      await page.close()
    }
    for (let index = 0; index < 3; index++) {
      const reference = path.join(out, `figma-banner-${index + 1}.png`)
      const local = path.join(out, `local-banner-${index + 1}-1440.png`)
      const source = await sharp(reference).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const rendered = await sharp(local).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
      const diff = Buffer.alloc(source.data.length)
      const changed = pixelmatch(source.data, rendered.data, diff, 1440, 754, { threshold: .15, includeAA: false })
      await sharp(diff, { raw: { width: 1440, height: 754, channels: 4 } }).png().toFile(path.join(out, `diff-banner-${index + 1}.png`))
      results.push({ slide: index + 1, changedPixelRatio: changed / (1440 * 754) })
    }
    await fs.writeFile(path.join(out, 'state-qa.json'), `${JSON.stringify(results, null, 2)}\n`)
    console.log(JSON.stringify(results, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
