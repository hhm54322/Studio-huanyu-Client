const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

async function compareDetails(out) {
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const comparisons = []
  for (const [state, source, crop] of [
    ['complex', '/Users/hhm/Downloads/复杂病例详情模版.png', { left: 272, top: 40, width: 896, height: 1199 }],
    ['trust', '/Users/hhm/Downloads/可信度详情.png', { left: 0, top: 0, width: 1440, height: 1140 }],
  ]) {
    const reference = path.join(out, `${state}-figma.png`)
    await sharp(source).resize({ width: 1440 }).extract(crop).png().toFile(reference)
    const local = path.join(out, `${state}-1440.png`)
    const meta = await sharp(local).metadata()
    assert.equal(meta.width, crop.width, `${state}: source/local width differs`)
    assert.equal(meta.height, crop.height, `${state}: source/local height differs`)
    const a = await sharp(reference).ensureAlpha().raw().toBuffer()
    const b = await sharp(local).ensureAlpha().raw().toBuffer()
    const diff = Buffer.alloc(a.length)
    const changed = pixelmatch(a, b, diff, crop.width, crop.height, { threshold: .15, includeAA: false })
    await sharp(diff, { raw: { width: crop.width, height: crop.height, channels: 4 } }).png().toFile(path.join(out, `${state}-diff.png`))
    await sharp(reference).composite([{ input: await sharp(local).ensureAlpha(.5).toBuffer(), blend: 'over' }]).png().toFile(path.join(out, `${state}-overlay.png`))
    comparisons.push({ state, width: crop.width, height: crop.height, changedPixelRatio: changed / (crop.width * crop.height), requiresVisualReview: true })
  }
  await fs.writeFile(path.join(out, 'state-comparison.json'), JSON.stringify(comparisons, null, 2) + '\n')
  return comparisons
}

async function main() {
  const out = path.resolve(process.env.HUANYU_QA_OUT || 'docs/figma-verification/about/2026-09-28')
  const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
  const browser = await chromium.launch()
  const results = []
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 1279 : 844 }, deviceScaleFactor: 2 })
      await page.goto(`${origin}/about`, { waitUntil: 'networkidle' })
      for (const state of ['complex', 'trust']) {
        await page.setViewportSize({ width, height: width === 1440 ? state === 'complex' ? 1279 : 1140 : 844 })
        const trigger = state === 'complex' ? page.getByRole('button', { name: '阅读全文', exact: true }) : page.getByRole('button', { name: '查看可信度详情' }).first()
        await trigger.click()
        const selector = state === 'complex' ? '.complex-detail-modal' : '.trust-detail-page'
        await page.locator(selector).waitFor({ state: 'visible' })
        await page.mouse.move(0, 0)
        await page.waitForTimeout(500)
        const info = await page.locator(selector).evaluate(el => ({ width: el.clientWidth, height: el.clientHeight, scrollHeight: el.scrollHeight, scrollWidth: el.scrollWidth, locked: document.body.style.overflow === 'hidden', focusInside: el.contains(document.activeElement) }))
        assert.equal(info.locked, true)
        assert.equal(info.focusInside, true)
        assert.ok(info.scrollWidth <= info.width, `${state}: horizontal overflow`)
        await page.locator(selector).screenshot({ path: path.join(out, `${state}-${width}-2x.png`) })
        await sharp(path.join(out, `${state}-${width}-2x.png`)).resize({ width: info.width }).png().toFile(path.join(out, `${state}-${width}.png`))
        if (info.scrollHeight > info.height) {
          for (let top = 0, index = 0; top < info.scrollHeight; top += info.height - 80, index++) {
            await page.locator(selector).evaluate((el, top) => { el.scrollTop = top }, top)
            await page.locator(selector).screenshot({ path: path.join(out, `${state}-${width}-scroll-${index}.png`) })
          }
          await page.locator(selector).evaluate(el => { el.scrollTop = 0 })
        }
        await page.keyboard.press('Shift+Tab')
        assert.equal(await page.locator(selector).evaluate(el => el.contains(document.activeElement)), true)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
        assert.equal(await page.locator(selector).count(), 0)
        assert.equal(await page.evaluate(() => document.body.style.overflow), '')
        assert.equal(await trigger.evaluate(el => el === document.activeElement), true)
        results.push({ state, viewportWidth: width, ...info, escapeClose: true, focusRestored: true })
      }
      await page.getByRole('button', { name: '开始免费评估', exact: true }).click()
      await page.getByRole('dialog', { name: '把情况告诉阿宁' }).waitFor()
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      assert.equal(await page.locator('.consult-overlay').count(), 0)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.reload({ waitUntil: 'networkidle' })
      assert.equal(await page.locator('.about-hero__content').evaluate(el => getComputedStyle(el).opacity), '1')
      results.push({ width, consultationEntry: true, reducedMotionReadable: true })
      await page.close()
    }
    await fs.writeFile(path.join(out, 'interactions.json'), JSON.stringify(results, null, 2) + '\n')
    console.log(JSON.stringify(await compareDetails(out), null, 2))
    console.log(JSON.stringify(results, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
