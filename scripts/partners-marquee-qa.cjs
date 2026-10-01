const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const output = path.resolve(process.env.HUANYU_QA_OUT || 'docs/figma-verification/partners-2026-09-30')
async function meanDifference(first, second) {
  const a = await sharp(first).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const b = await sharp(second).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(a.info, b.info)
  let sum = 0
  for (let i = 0; i < a.data.length; i++) sum += Math.abs(a.data[i] - b.data[i])
  return sum / a.data.length / 255 * 100
}
async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    for (const width of [1440, 1920, 2048, 3174, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      const errors = []
      page.on('pageerror', e => errors.push(e.message))
      await page.goto(`${base}/?partnersQA=20260930`, { waitUntil: 'networkidle' })
      const marquee = page.locator('.partners-marquee')
      await marquee.scrollIntoViewIfNeeded()
      await page.waitForTimeout(900)
      const initial = await page.evaluate(() => {
        const root = document.querySelector('.partners-marquee')
        const track = root.firstElementChild
        const animation = track.getAnimations()[0]
        animation.pause()
        animation.currentTime = 0
        const rect = root.getBoundingClientRect()
        return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, x: rect.x, right: rect.right, height: rect.height, tileWidth: track.querySelector('img').getBoundingClientRect().width, images: [...root.querySelectorAll('img')].map(i => ({ src: i.currentSrc, naturalWidth: i.naturalWidth })), duration: animation.effect.getTiming().duration }
      })
      assert.equal(initial.width, initial.scrollWidth)
      assert.ok(Math.abs(initial.x - (width - initial.right)) < 1)
      assert.ok(initial.images.every(i => i.naturalWidth === (width <= 700 ? 1440 : 3570)))
      const first = await marquee.screenshot({ path: path.join(output, `${width}-start.png`) })
      for (const progress of [0.25, 0.5, 0.75, 0.99999, 1]) {
        const geometry = await page.evaluate(progress => {
          const root = document.querySelector('.partners-marquee')
          const animation = root.firstElementChild.getAnimations()[0]
          animation.currentTime = animation.effect.getTiming().duration * progress
          const r = root.getBoundingClientRect()
          const imgs = [...root.querySelectorAll('img')].map(i => i.getBoundingClientRect())
          return { left: imgs[0].left, right: imgs.at(-1).right, viewportLeft: r.left, viewportRight: r.right }
        }, progress)
        assert.ok(geometry.left <= geometry.viewportLeft + 1 && geometry.right >= geometry.viewportRight - 1)
        const screenshot = await marquee.screenshot({ path: path.join(output, `${width}-${progress}.png`) })
        if (progress === 1 || progress === 0.99999) {
          const difference = await meanDifference(first, screenshot)
          assert.ok(difference < 1, `Loop jump: ${width}, ${difference}%`)
          if (progress === 1) initial.cycleDifferencePercent = difference
        }
      }
      await page.evaluate(() => {
        const animation = document.querySelector('.partners-marquee>div').getAnimations()[0]
        animation.currentTime = 0
        animation.play()
      })
      await marquee.hover()
      await page.waitForTimeout(100)
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.partners-marquee>div')).animationPlayState), 'paused')
      await page.emulateMedia({ reducedMotion: 'reduce' })
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.partners-marquee>div')).animationName), 'none')
      const resting = await marquee.screenshot({ path: path.join(output, `${width}-reduced.png`) })
      assert.ok(await meanDifference(first, resting) < 1)
      if (width === 1440) {
        const reference = await sharp('public/images/figma/partners-matrix.png').toBuffer()
        initial.figmaViewportDifferencePercent = await meanDifference(reference, resting)
        assert.ok(initial.figmaViewportDifferencePercent < 1, `Static difference: ${initial.figmaViewportDifferencePercent}%`)
      }
      assert.deepEqual(errors, [])
      results.push(initial)
      await page.close()
    }
  } finally { await browser.close() }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
