const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const evidence = path.join(root, 'artifacts/figma-content-2026-10-21')
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || evidence)
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
const phase = process.env.HUANYU_QA_PHASE || 'static'
const selector = id => `[data-figma-node="${id}"]`
const panel = selector('143:4209')
const trigger = page => page.locator('[data-trust-article="jci"]')
async function open(page) {
  await trigger(page).scrollIntoViewIfNeeded()
  await trigger(page).click()
  await page.getByRole('dialog', { name: 'JCI认证真相', exact: true }).waitFor()
  await page.evaluate(() => document.fonts.ready)
}

async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 754 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(base + '/trust', { waitUntil: 'networkidle' })
    await open(page)
    const bounds = await page.locator(panel).boundingBox()
    assert.deepEqual(bounds, { x: 272, y: 152, width: 896, height: 450 })
    const reference = path.join(out, 'trust-panel-reference.png')
    await sharp(path.join(evidence, 'trust-figma.png')).extract({ left: 544, top: 304, width: 1792, height: 900 }).png().toFile(reference)
    const local = path.join(out, `trust-${phase}-local.png`)
    await page.screenshot({ path: local, clip: bounds })
    await page.screenshot({ path: path.join(out, `trust-${phase}-viewport.png`) })
    const a = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer()
    const b = await sharp(local).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer()
    assert.equal(a.length, b.length)
    let sum = 0, changed = 0
    for (let i = 0; i < a.length; i += 4) {
      let max = 0
      for (let c = 0; c < 3; c++) { const d = Math.abs(a[i + c] - b[i + c]); sum += d; max = Math.max(max, d) }
      if (max > 16) changed++
    }
    const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
    const diff = Buffer.alloc(a.length)
    const mismatches = pixelmatch(a, b, diff, 1792, 900, { threshold: .15, includeAA: false })
    await sharp(diff, { raw: { width: 1792, height: 900, channels: 4 } }).png().toFile(path.join(out, `trust-${phase}-diff.png`))
    const mapping = JSON.parse(await fs.readFile(path.join(root, 'docs/figma-source/trust-content-revision/trust/node-to-code-2026-10-21.json'), 'utf8'))
    const missing = await page.evaluate(nodes => nodes.filter(n => !document.querySelector(n.selector)).map(n => n.nodeId), mapping.nodes.filter(n => n.rendered))
    const geometry = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, brokenImages: [...document.querySelectorAll('dialog img')].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
    const visual = { createdAt: new Date().toISOString(), name: 'trust', phase, frame: '143:4206', scope: 'Full 896x450 authored dialog; no masking or resizing. Source background is demonstration screenshot, live background remains the real page.', bounds, nMAE: sum / (a.length / 4 * 3) / 255 * 100, pixelmatchPercent: mismatches / (1792 * 900) * 100, pixelmatchOptions: { threshold: .15, includeAA: false }, changedPixelsOver16: changed / (1792 * 900) * 100, geometry, missing, errors, reference, local }
    const comparison = path.join(out, `trust-${phase}-comparison.png`)
    await sharp({ create: { width: 3584, height: 900, channels: 3, background: '#fff' } }).composite([{ input: reference, left: 0, top: 0 }, { input: local, left: 1792, top: 0 }]).png().toFile(comparison)
    await fs.writeFile(path.join(out, `trust-${phase}-qa.json`), JSON.stringify(visual, null, 2) + '\n')
    console.log(JSON.stringify(visual, null, 2))
    assert.deepEqual(missing, []); assert.deepEqual(errors, []); assert.deepEqual(geometry.brokenImages, [])
    assert.ok(visual.nMAE < 1); assert.ok(visual.pixelmatchPercent < 1)
    await page.close()
    if (phase === 'static') return

    const report = { createdAt: '', name: 'trust', desktop: [], shortScreen: {}, motion: {}, errors }
    for (const width of [1024, 1440, 1920]) {
      const test = await browser.newPage({ viewport: { width, height: width === 1024 ? 600 : 900 }, reducedMotion: 'reduce' })
      test.on('pageerror', e => errors.push(e.message))
      await test.goto(base + '/trust', { waitUntil: 'networkidle' })
      await trigger(test).scrollIntoViewIfNeeded()
      await trigger(test).focus()
      const scroll = await test.evaluate(() => scrollY)
      await trigger(test).press('Enter')
      const dialog = test.getByRole('dialog', { name: 'JCI认证真相', exact: true })
      await dialog.waitFor()
      const close = dialog.getByRole('button', { name: '关闭JCI认证真相', exact: true })
      const checks = {}
      assert.equal(test.url(), base + '/trust'); checks.noInventedRoute = true
      assert.equal(await test.locator(selector('143:4207')).count(), 0); checks.noScreenshotUI = true
      const body = await dialog.innerText()
      for (const fragment of ['很多海外患者规划', '共计137家', '院内感染率仅0.5%', 'JCI认证不是宣传噱头']) assert.ok(body.includes(fragment))
      checks.completeSourceCopy = true
      assert.equal(await close.evaluate(el => document.activeElement === el), true)
      for (const key of ['Tab', 'Shift+Tab']) { await close.press(key); assert.equal(await close.evaluate(el => document.activeElement === el), true) }
      checks.keyboardFocusTrap = true
      assert.equal(await test.evaluate(() => document.body.style.overflow), 'hidden')
      await test.mouse.wheel(0, 600); await test.waitForTimeout(100)
      assert.equal(await test.evaluate(() => scrollY), scroll); checks.backgroundLocked = true
      const restored = async () => {
        await dialog.waitFor({ state: 'hidden' })
        assert.equal(await trigger(test).evaluate(el => document.activeElement === el), true)
        assert.equal(await test.evaluate(() => scrollY), scroll)
        assert.notEqual(await test.evaluate(() => document.body.style.overflow), 'hidden')
      }
      await close.press('Escape'); await restored(); checks.escapeRestores = true
      await trigger(test).press('Enter'); await dialog.waitFor(); await close.click(); await restored(); checks.closeRestores = true
      await trigger(test).press('Enter'); await dialog.waitFor(); await test.mouse.click(8, 8); await restored(); checks.backdropRestores = true
      await trigger(test).press('Enter'); await dialog.waitFor()
      const bounds = await test.locator(panel).boundingBox()
      assert.equal(bounds.width, 896); assert.equal(bounds.height, 450)
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width)
      assert.equal(await test.evaluate(() => document.documentElement.scrollWidth), width)
      checks.fits = true
      const reduced = await test.locator('.trust-source-dialog__frame').evaluate(el => ({ name: getComputedStyle(el).animationName, opacity: getComputedStyle(el).opacity }))
      assert.equal(reduced.name, 'none'); assert.equal(reduced.opacity, '1'); checks.reducedMotion = true
      await test.screenshot({ path: path.join(out, `trust-${width}-settled.png`) })
      await close.press('Escape')
      report.desktop.push({ width, checks }); await test.close()
    }
    const short = await browser.newPage({ viewport: { width: 1024, height: 480 }, reducedMotion: 'reduce' })
    await short.goto(base + '/trust', { waitUntil: 'networkidle' }); await open(short)
    let boundsShort = await short.locator(panel).boundingBox()
    assert.equal(boundsShort.y, 40)
    await short.locator('dialog').evaluate(el => el.scrollTo(0, el.scrollHeight))
    boundsShort = await short.locator(panel).boundingBox()
    assert.ok(boundsShort.y + boundsShort.height <= 440)
    await short.screenshot({ path: path.join(out, 'trust-short-screen.png') })
    report.shortScreen = { topPadding: true, bottomReachable: true }
    await short.close()
    const motion = await browser.newPage({ viewport: { width: 1440, height: 754 }, reducedMotion: 'no-preference' })
    await motion.goto(base + '/trust', { waitUntil: 'networkidle' }); await open(motion)
    const states = await motion.locator('.trust-source-dialog__frame').evaluate(async el => {
      const animation = el.getAnimations()[0]
      if (!animation) throw Error('Trust dialog entry missing')
      animation.pause()
      const states = []
      for (const time of [0, 120, 320]) { animation.currentTime = time; await new Promise(requestAnimationFrame); states.push({ opacity: Number(getComputedStyle(el).opacity), transform: getComputedStyle(el).transform }) }
      animation.finish()
      return states
    })
    assert.equal(states[0].opacity, 0); assert.ok(states[1].opacity > 0 && states[1].opacity < 1); assert.equal(states[2].opacity, 1)
    report.motion = { entryInterpolates: true, settledLayoutRestored: states[2].transform === 'matrix(1, 0, 0, 1, 0, 0)', reducedMotionVerified: true }
    await motion.screenshot({ path: path.join(out, 'trust-motion-settled.png') })
    const motionScroll = await motion.evaluate(() => scrollY)
    const exiting = await motion.locator('.trust-source-dialog__frame').evaluate(async el => {
      el.querySelector('button').click()
      await new Promise(requestAnimationFrame)
      const animation = el.getAnimations().find(candidate => candidate instanceof Animation && candidate.playState !== 'finished')
      if (!animation) throw Error('Dialog exit missing')
      animation.pause()
      const values = []
      for (const time of [0, 100, 200]) { animation.currentTime = time; await new Promise(requestAnimationFrame); values.push(Number(getComputedStyle(el).opacity)) }
      animation.finish()
      return values
    })
    assert.equal(exiting[0], 1); assert.ok(exiting[1] > 0 && exiting[1] < 1); assert.equal(exiting[2], 0)
    await motion.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.equal(await trigger(motion).evaluate(el => document.activeElement === el), true)
    assert.equal(await motion.evaluate(() => scrollY), motionScroll)
    report.motion.exitInterpolates = true; report.motion.exitRestores = true
    await motion.close()
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, 'trust-behavior-qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2)); assert.deepEqual(errors, [])
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
