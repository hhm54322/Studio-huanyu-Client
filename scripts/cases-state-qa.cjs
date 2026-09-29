const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')
const out = path.resolve('docs/figma-verification/cases/2026-09-29')
const url = 'http://127.0.0.1:5173/cases'

async function settled(page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('.matcher-dialog')
    return el && getComputedStyle(el).transform === 'none' && getComputedStyle(el).opacity === '1'
  })
}

async function expectCases(page, count) {
  await page.waitForFunction(expected => document.querySelectorAll('.case-grid article').length === expected, count)
  assert.equal(await page.locator('.case-grid article').count(), count)
}

async function expectFocus(page, locator) {
  await page.waitForFunction((element) => document.activeElement === element, await locator.elementHandle())
  assert.equal(await locator.evaluate(el => el === document.activeElement), true)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 834 } })
    const errors = [], results = []
    page.on('pageerror', error => errors.push(error.message))
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: width === 1440 ? 834 : 844 })
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const cards = page.locator('.case-grid article')
      assert.equal(await cards.count(), 2)
      const selects = page.locator('.case-filters select')
      for (const [index, value] of ['消化内科', '东南亚', '多学科诊疗', '7天内'].entries()) {
        await selects.nth(index).selectOption(value)
        await page.locator('.case-filter-submit').click()
        await expectCases(page, 1)
        assert.equal(await cards.locator('h2').textContent(), 'Maria S.')
        assert.equal(await cards.evaluateAll(els => els.every(el => getComputedStyle(el).opacity === '1')), true)
        await page.locator('.case-filter-reset').click()
        await expectCases(page, 2)
        assert.deepEqual(await selects.evaluateAll(els => els.map(el => el.value)), ['', '', '', ''])
      }
      await selects.nth(0).selectOption('消化内科')
      await selects.nth(1).selectOption('南亚')
      await page.locator('.case-filter-submit').click()
      await expectCases(page, 0)
      await page.screenshot({ path: path.join(out, `empty-${width}.png`) })
      await page.getByRole('button', { name: '查看全部案例', exact: true }).click()
      await expectCases(page, 2)

      const trigger = page.locator('.case-match-button')
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: '智能匹配', exact: true })
      await dialog.waitFor({ state: 'visible' })
      await settled(page)
      const close = page.getByRole('button', { name: '关闭智能匹配', exact: true })
      const submit = dialog.getByRole('button', { name: '为我推荐相似病例', exact: true })
      assert.equal(await submit.isDisabled(), true)
      assert.equal(await page.locator(':focus').getAttribute('aria-label'), '关闭智能匹配')
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
      await page.screenshot({ path: path.join(out, `matcher-${width}.png`) })
      await page.keyboard.press('Shift+Tab')
      assert.equal((await page.locator(':focus').textContent()).trim(), '暂未确定')
      await page.keyboard.press('Tab')
      assert.equal(await page.locator(':focus').getAttribute('aria-label'), '关闭智能匹配')
      const modalGeometry = await dialog.evaluate(el => {
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y, width: r.width, height: r.height, scrollWidth: el.scrollWidth }
      })
      assert.ok(modalGeometry.x >= 0 && modalGeometry.x + modalGeometry.width <= width, `${width}: dialog overflows ${JSON.stringify(modalGeometry)}`)
      assert.ok(modalGeometry.y >= 0 && modalGeometry.y + modalGeometry.height <= page.viewportSize().height, `${width}: dialog height`)
      assert.ok(modalGeometry.scrollWidth <= modalGeometry.width, `${width}: dialog content overflow`)
      if (width === 1440) assert.deepEqual(modalGeometry, { x: 272, y: 40, width: 896, height: 754, scrollWidth: 896 })
      const sourceChecks = []
      if (width === 1440) {
        for (const [selector, expected] of [
          ['h2', { x: 304, y: 72, width: 128, height: 32 }],
          ['fieldset:nth-child(1) .matcher-options', { x: 336, y: 218, width: 800, height: 120 }],
          ['fieldset:nth-child(2) .matcher-options', { x: 336, y: 452, width: 800, height: 48 }],
          ['fieldset:nth-child(3) .matcher-options', { x: 336, y: 614, width: 800, height: 48 }],
          ['footer button', { x: 617.5, y: 710, width: 205, height: 48 }],
        ]) {
          const actual = await dialog.locator(selector).boundingBox()
          assert.deepEqual(actual, expected, `matcher source geometry: ${selector}`)
          sourceChecks.push({ selector, actual, expected })
        }
        for (const [selector, expected] of [
          ['h2', { fontSize: '32px', lineHeight: '32px', fontWeight: '600', color: 'rgb(30, 58, 95)' }],
          ['legend', { fontSize: '24px', lineHeight: '24px', fontWeight: '600', color: 'rgb(30, 58, 95)' }],
          ['legend b', { fontSize: '12px', lineHeight: '16px', fontWeight: '700', color: 'rgb(255, 255, 255)' }],
          ['fieldset p', { fontSize: '14px', lineHeight: '22px', fontWeight: '400', color: 'rgb(107, 114, 128)' }],
          ['.matcher-options button', { fontSize: '16px', lineHeight: '16px', fontWeight: '400', color: 'rgb(75, 85, 99)' }],
          ['footer button', { fontSize: '16px', lineHeight: '16px', fontWeight: '600', color: 'rgb(255, 255, 255)' }],
        ]) {
          const actual = await dialog.locator(selector).evaluateAll(els => els.map(el => {
            const s = getComputedStyle(el)
            return { fontSize: s.fontSize, lineHeight: s.lineHeight, fontWeight: s.fontWeight, color: s.color }
          }))
          for (const style of actual) assert.deepEqual(style, expected, `matcher typography: ${selector}`)
          sourceChecks.push({ selector, actual, expected })
        }
        await sharp('/Users/hhm/Downloads/智能匹配.png').png().toFile(path.join(out, 'figma-matcher-1440.png'))
        const crop = { left: 272, top: 40, width: 896, height: 754 }
        const reference = await sharp(path.join(out, 'figma-matcher-1440.png')).extract(crop).ensureAlpha().raw().toBuffer()
        const local = await sharp(path.join(out, 'matcher-1440.png')).extract(crop).ensureAlpha().raw().toBuffer()
        const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
        const diff = Buffer.alloc(local.length)
        const changed = pixelmatch(reference, local, diff, crop.width, crop.height, { threshold: .15, includeAA: false })
        const changedPixelRatio = changed / (crop.width * crop.height)
        assert.ok(changedPixelRatio < .02, `matcher foreground diff: ${changedPixelRatio}`)
        await sharp(diff, { raw: { width: crop.width, height: crop.height, channels: 4 } }).png().toFile(path.join(out, 'matcher-diff.png'))
        sourceChecks.push({ changedPixelRatio, comparison: 'Foreground dialog only; authored background belongs to trust, runtime background is cases; keyboard focus ring and corrected badge are retained.' })
      }
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      await expectFocus(page, trigger)
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')

      await trigger.click()
      await dialog.waitFor({ state: 'visible' })
      await dialog.getByRole('button', { name: '消化系统', exact: true }).click()
      await dialog.getByRole('button', { name: '31-45', exact: true }).click()
      await dialog.getByRole('button', { name: '1-3个月', exact: true }).click()
      assert.equal(await dialog.locator('.matcher-options button.active').count(), 3)
      assert.equal(await submit.isEnabled(), true)
      await settled(page)
      await page.screenshot({ path: path.join(out, `matcher-selected-${width}.png`) })
      await submit.focus()
      await page.keyboard.press('Tab')
      assert.equal(await page.locator(':focus').getAttribute('aria-label'), '关闭智能匹配')
      await page.keyboard.press('Shift+Tab')
      await expectFocus(page, submit)
      await page.keyboard.press('Enter')
      await dialog.waitFor({ state: 'hidden' })
      await expectCases(page, 1)
      assert.equal(await cards.locator('h2').textContent(), 'Maria S.')
      assert.ok((await page.getByRole('status').filter({ hasText: '已根据' }).textContent()).includes('消化系统'))
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')
      const rematch = page.locator('.case-match-note button')
      await rematch.click()
      await dialog.getByRole('button', { name: '骨科', exact: true }).click()
      await submit.click()
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(await cards.locator('h2').textContent(), 'James T.')
      await rematch.click()
      await close.click()
      await dialog.waitFor({ state: 'hidden' })
      await expectFocus(page, rematch)
      await trigger.click()
      await settled(page)
      await page.locator('.matcher-backdrop').click({ position: { x: 2, y: 2 } })
      await dialog.waitFor({ state: 'hidden' })
      await expectFocus(page, trigger)
      await page.locator('.case-filter-reset').click()
      await expectCases(page, 2)
      await page.waitForFunction(() => [...document.images].every(img => img.complete))
      const geometry = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
      assert.equal(geometry.scrollWidth, width, `${width}: horizontal overflow`)
      assert.equal(geometry.broken.length, 0, `${width}: broken images: ${JSON.stringify(geometry.broken)}`)
      results.push({ ...geometry, modalGeometry, sourceChecks, filters: 4, reset: true, empty: true, required: true, matching: true, focusTrap: true, focusRestore: true, escape: true, backdrop: true })
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(url, { waitUntil: 'networkidle' })
    const card = page.locator('.case-grid article').first()
    await card.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.case-grid article')).opacity === '1')
    await page.waitForTimeout(900)
    const rest = await card.boundingBox()
    await card.hover()
    await page.waitForTimeout(450)
    const hover = await card.evaluate(el => ({ transform: getComputedStyle(el).transform, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }))
    assert.ok(hover.transform.includes('-6'), JSON.stringify(hover))
    assert.equal(hover.width, rest.width)
    assert.equal(hover.height, rest.height)
    await page.screenshot({ path: path.join(out, 'hover-1440.png') })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(450)
    const reduced = await card.evaluate(el => ({ transform: getComputedStyle(el).transform, transition: getComputedStyle(el).transitionDuration, opacity: getComputedStyle(el).opacity }))
    assert.equal(reduced.transform, 'none')
    assert.ok(parseFloat(reduced.transition) <= .0001, `Reduced-motion duration ${reduced.transition}`)
    assert.equal(reduced.opacity, '1')
    await page.locator('.case-match-button').click()
    await settled(page)
    const modalReduced = await page.locator('.matcher-dialog').evaluate(el => ({ transition: getComputedStyle(el).transitionDuration, backdropTransition: getComputedStyle(el.parentElement).transitionDuration }))
    assert.ok(parseFloat(modalReduced.transition) <= .0001)
    assert.ok(parseFloat(modalReduced.backdropTransition) <= .0001)
    assert.equal(errors.length, 0, errors.join('\n'))
    fs.writeFileSync(path.join(out, 'state-results.json'), JSON.stringify({ results, hover, reduced, modalReduced, errors }, null, 2) + '\n')
    console.log(JSON.stringify({ viewports: results.length, filters: 16, matching: true, hover, reduced, modalReduced, errors }))
  } finally { await browser.close() }
}
fs.mkdirSync(out, { recursive: true })
main().catch(error => { console.error(error); process.exitCode = 1 })
