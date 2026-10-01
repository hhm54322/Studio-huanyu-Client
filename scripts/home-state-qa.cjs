const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

const out = path.resolve(process.env.HUANYU_QA_OUT || 'docs/figma-verification/home/2026-09-29')
const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const expected = [
  '让全球患者安心赴华就医',
  '8000+个家庭已陪伴赴华就医',
  '就医保障，写在前面',
  '"来中国是我做过最正确的决定"',
]
const expectedImages = [
  'home-banner-01-source.png',
  'home-banner-02-source.png',
  'home-banner-03-source.png',
  'patient-hero.png',
]

async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
    const results = []
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 754 : 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.evaluate(() => document.fonts.ready)
      for (let index = 0; index < expected.length; index++) {
        await page.locator('.home-hero__controls button').nth(index).click()
        await page.locator('.home-hero h1').waitFor()
        await page.waitForFunction(expectedImage => {
          const image = document.querySelector('.home-hero__image')
          return image && image.src.endsWith(expectedImage) && image.complete && image.naturalWidth > 0
        }, expectedImages[index], { timeout: 90000 })
        await page.locator('.home-hero__image').evaluate(image => image.decode())
        await page.waitForTimeout(750)
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
        // Independent Figma banner frames intentionally exclude the shared shell.
        await page.addStyleTag({ content: '.patient-header,.home-hero__assistant{opacity:0!important}' })
        const screenshot = path.join(out, `local-banner-${index + 1}-${width}.png`)
        const nativeScreenshot = path.join(out, `local-banner-${index + 1}-${width}-2x.png`)
        await page.locator('.home-hero').screenshot({ path: nativeScreenshot })
        await sharp(nativeScreenshot).resize({ width }).png().toFile(screenshot)
        results.push({ width, slide: index + 1, ...state, screenshot })
      }
      if (errors.length) throw new Error(`Page errors: ${errors.join(', ')}`)
      await page.close()
    }
    for (let index = 0; index < 3; index++) {
      const reference = `/Users/hhm/Downloads/banner-0${index + 1} (1).png`
      const local = path.join(out, `local-banner-${index + 1}-1440-2x.png`)
      const source = await sharp(reference).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const rendered = await sharp(local).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
      const diff = Buffer.alloc(source.data.length)
      const changed = pixelmatch(source.data, rendered.data, diff, 2880, 1508, { threshold: .15, includeAA: false })
      await sharp(diff, { raw: { width: 2880, height: 1508, channels: 4 } }).png().toFile(path.join(out, `diff-banner-${index + 1}.png`))
      results.push({ slide: index + 1, source: reference, scale: 2, changedPixelRatio: changed / (2880 * 1508) })
    }
    await fs.writeFile(path.join(out, 'state-qa.json'), `${JSON.stringify(results, null, 2)}\n`)
    console.log(JSON.stringify(results, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
