const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

async function main() {
  const out = path.resolve('docs/figma-verification/about/2026-09-30')
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch()
  const results = []
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 }, deviceScaleFactor: 1 })
      await page.goto('http://127.0.0.1:5173/about', { waitUntil: 'networkidle' })
      await page.locator('.about-complex').scrollIntoViewIfNeeded()
      await page.waitForTimeout(900)
      await page.locator('header').first().evaluate(el => { el.style.visibility = 'hidden' })
      await page.locator('.about-complex').screenshot({ path: path.join(out, `complex-${width}.png`) })
      await page.locator('.about-proof').scrollIntoViewIfNeeded()
      await page.waitForTimeout(900)
      await page.locator('.about-proof').screenshot({ path: path.join(out, `proof-closed-${width}.png`) })
      const triggers = page.getByRole('button', { name: '查看可信度详情' })
      assert.equal(await triggers.count(), 4)
      await triggers.nth(0).click()
      await triggers.nth(1).click()
      assert.equal(await page.getByRole('button', { name: '收起可信度详情' }).count(), 2)
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')
      await page.locator('.about-proof').screenshot({ path: path.join(out, `proof-expanded-${width}.png`) })
      await page.getByRole('button', { name: '收起可信度详情' }).first().click()
      assert.equal(await page.getByRole('button', { name: '收起可信度详情' }).count(), 1)
      const remaining = page.getByRole('button', { name: '收起可信度详情' })
      await remaining.focus()
      await page.keyboard.press('Enter')
      assert.equal(await page.getByRole('button', { name: '收起可信度详情' }).count(), 0)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.getByRole('button', { name: '查看可信度详情' }).first().click()
      const transition = await page.locator('.proof-card__detail').first().evaluate(el => getComputedStyle(el).transitionDuration)
      assert.ok(parseFloat(transition) <= 0.00001, `reduced-motion transition: ${transition}`)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert.ok(overflow <= 0, `horizontal overflow at ${width}px: ${overflow}px`)
      results.push({ width, independentExpand: true, independentCollapse: true, keyboardClose: true, reducedMotion: true, noScrollLock: true, horizontalOverflow: overflow })
      await page.close()
    }
    const reference = '/var/folders/39/2gjzv9l92vs2d9kf2vh3wd500000gp/T/codex-clipboard-751dbc99-b28d-4507-b9a1-0d645d648729.png'
    const crop = { left: 44, top: 89, width: 1001, height: 584 }
    await sharp(reference).extract(crop).png().toFile(path.join(out, 'complex-figma-reference.png'))
    await sharp(path.join(out, 'complex-1440.png')).resize(crop.width, crop.height).png().toFile(path.join(out, 'complex-local-scaled.png'))
    await fs.writeFile(path.join(out, 'interactions.json'), JSON.stringify(results, null, 2) + '\n')
    console.log(JSON.stringify(results, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
