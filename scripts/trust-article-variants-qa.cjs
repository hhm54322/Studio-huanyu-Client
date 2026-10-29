const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const date = '2026-10-22'
const sourceDirectory = path.resolve(process.env.HUANYU_ARTICLE_SOURCE || path.join(root, 'docs/figma-source/trust-articles-revision'))
const articleKeys = process.env.HUANYU_ARTICLE_KEYS?.split(',') || ['cost', 'doctor']
const evidence = path.join(root, `artifacts/figma-content-${date}`)
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || evidence)
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const phase = process.env.HUANYU_QA_PHASE || 'final'
const selector = id => `[data-figma-node="${id}"]`
const panel = selector('143:4209')
const flat = n => [n, ...n.children.flatMap(flat)]
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'))
const trigger = (page, title) => page.locator('[data-trust-article]').filter({ has: page.getByRole('heading', { name: title, exact: true }) })
async function open(page, title) {
  await trigger(page, title).scrollIntoViewIfNeeded()
  await trigger(page, title).click()
  await page.getByRole('dialog', { name: title, exact: true }).waitFor()
  await page.evaluate(() => document.fonts.ready)
}
async function compare(reference, local, diffFile) {
  const a = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const b = await sharp(local).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.equal(a.info.width, b.info.width); assert.equal(a.info.height, b.info.height)
  let sum = 0, changed = 0
  for (let i = 0; i < a.data.length; i += 4) {
    let maximum = 0
    for (let c = 0; c < 3; c++) { const d = Math.abs(a.data[i + c] - b.data[i + c]); sum += d; maximum = Math.max(maximum, d) }
    if (maximum > 16) changed++
  }
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const diff = Buffer.alloc(a.data.length)
  const mismatches = pixelmatch(a.data, b.data, diff, a.info.width, a.info.height, { threshold: .15, includeAA: false })
  await sharp(diff, { raw: a.info }).png().toFile(diffFile)
  return { nMAE: sum / (a.info.width * a.info.height * 3) / 255 * 100, pixelmatchPercent: mismatches / (a.info.width * a.info.height) * 100, changedPixelsOver16: changed / (a.info.width * a.info.height) * 100, pixelmatchOptions: { threshold: .15, includeAA: false }, reference, local }
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', phase, scope: 'Desktop PC template composition and actual article content. Generated baseline is NOT an independent Figma PC article screenshot. Mobile site implementation is deferred.', articles: [], errors: [] }
  try {
    for (const key of articleKeys) {
      const variant = await read(path.join(sourceDirectory, key, `desktop-variant-${date}.json`))
      const row = { key, frame: variant.articleFrame, title: variant.title, visual: {}, desktop: [], shortScreen: {}, motion: {} }
      const baselinePage = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
      const html = await fs.readFile(path.join(sourceDirectory, key, `desktop-baseline-${date}.html`), 'utf8')
      await baselinePage.setContent(html.replace('<meta charset="utf-8">', `<meta charset="utf-8"><base href="${base}/">`))
      await baselinePage.evaluate(() => document.fonts.ready)
      await baselinePage.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
      const reference = path.join(out, `${key}-desktop-composition-reference.png`)
      await baselinePage.locator(panel).screenshot({ path: reference })
      const referenceBounds = await baselinePage.locator(panel).boundingBox()
      await baselinePage.close()
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
      page.on('pageerror', e => report.errors.push(e.message))
      await page.goto(base + '/trust', { waitUntil: 'networkidle' }); await open(page, variant.title)
      await page.mouse.move(4, 4)
      const bounds = await page.locator(panel).boundingBox()
      assert.equal(bounds.width, 896); assert.equal(bounds.height, referenceBounds.height)
      const missing = await page.evaluate(nodes => nodes.filter(n => n.rendered && !document.querySelector(n.selector)).map(n => n.nodeId), variant.contentMapping)
      assert.deepEqual(missing, [])
      const geometry = await page.locator(panel).evaluate(el => {
        const rect = id => { const r = el.querySelector(`[data-figma-node="${id}"]`).getBoundingClientRect(), p = el.getBoundingClientRect(); return { x: r.x - p.x, y: r.y - p.y, width: r.width, height: r.height } }
        const text = getComputedStyle(el.querySelector('[data-figma-node="143:4219"]'))
        return { header: rect('143:4213'), heading: rect('143:4215'), description: rect('143:4217'), body: rect('143:4219'), close: rect('143:4210'), radius: getComputedStyle(el).borderRadius, text: { size: text.fontSize, line: text.lineHeight, color: text.color }, brokenImages: [...el.querySelectorAll('img')].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }
      })
      assert.equal(geometry.radius, '24px')
      assert.deepEqual(geometry.text, { size: '16px', line: '24px', color: 'rgb(30, 58, 95)' })
      assert.equal(geometry.header.x, 32); assert.equal(geometry.header.y, 32)
      assert.equal(geometry.body.x, 32); assert.equal(geometry.body.y, 118); assert.equal(geometry.body.width, 832)
      assert.equal(geometry.body.y + geometry.body.height + 32, bounds.height)
      assert.deepEqual(geometry.close, { x: 844, y: 16, width: 36, height: 36 })
      assert.deepEqual(geometry.brokenImages, [])
      const local = path.join(out, `${key}-${phase}-local.png`)
      await page.locator(panel).screenshot({ path: local })
      await page.screenshot({ path: path.join(out, `${key}-${phase}-viewport.png`) })
      row.visual = { ...await compare(reference, local, path.join(out, `${key}-${phase}-diff.png`)), referenceKind: 'Locked composition from Figma PC template + authored article copy; not separate Figma desktop frame', bounds, geometry, missing }
      assert.ok(row.visual.nMAE < 1); assert.ok(row.visual.pixelmatchPercent < 1)
      const raw = await sharp(reference).metadata()
      await sharp({ create: { width: raw.width * 2, height: raw.height, channels: 3, background: '#fff' } }).composite([{ input: reference, left: 0, top: 0 }, { input: local, left: raw.width, top: 0 }]).png().toFile(path.join(out, `${key}-${phase}-comparison.png`))
      await page.close()
      if (phase === 'static') { report.articles.push(row); continue }
      for (const width of [1024, 1440, 1920]) {
        const test = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
        test.on('pageerror', e => report.errors.push(e.message))
        await test.goto(base + '/trust', { waitUntil: 'networkidle' })
        await trigger(test, variant.title).scrollIntoViewIfNeeded(); await trigger(test, variant.title).focus()
        const scroll = await test.evaluate(() => scrollY)
        await trigger(test, variant.title).press('Enter')
        const dialog = test.getByRole('dialog', { name: variant.title, exact: true }); await dialog.waitFor()
        const close = dialog.getByRole('button', { name: `关闭${variant.title}`, exact: true })
        const checks = {}
        assert.equal(test.url(), base + '/trust'); checks.noInventedRoute = true
        assert.equal(await dialog.getAttribute('data-article-source'), variant.articleFrame)
        assert.equal(await test.locator(selector('143:4207')).count(), 0); checks.noScreenshotUI = true
        const body = await dialog.locator(selector('143:4219')).innerText()
        assert.equal(body.replace(/\s/g, ''), variant.body.replace(/\s/g, '')); checks.completeSourceCopy = true
        assert.equal(await close.evaluate(el => document.activeElement === el), true)
        for (const key of ['Tab', 'Shift+Tab']) { await close.press(key); assert.equal(await close.evaluate(el => document.activeElement === el), true) }
        checks.keyboardFocusTrap = true
        assert.equal(await test.evaluate(() => document.body.style.overflow), 'hidden')
        await test.mouse.wheel(0, 500); await test.waitForTimeout(100)
        assert.equal(await test.evaluate(() => scrollY), scroll); checks.backgroundLocked = true
        const restored = async () => {
          await dialog.waitFor({ state: 'hidden' })
          assert.equal(await trigger(test, variant.title).evaluate(el => document.activeElement === el), true)
          assert.equal(await test.evaluate(() => scrollY), scroll)
          assert.notEqual(await test.evaluate(() => document.body.style.overflow), 'hidden')
        }
        await close.press('Escape'); await restored(); checks.escapeRestores = true
        await trigger(test, variant.title).press('Enter'); await dialog.waitFor(); await close.click(); await restored(); checks.closeRestores = true
        await trigger(test, variant.title).press('Enter'); await dialog.waitFor(); await test.mouse.click(8, 8); await restored(); checks.backdropRestores = true
        await trigger(test, variant.title).press('Enter'); await dialog.waitFor()
        const bounds = await test.locator(panel).boundingBox()
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width)
        assert.equal(await test.evaluate(() => document.documentElement.scrollWidth), width)
        assert.equal(await test.locator('.trust-source-dialog__frame').evaluate(el => getComputedStyle(el).animationName), 'none')
        checks.fits = true; checks.reducedMotion = true
        await test.mouse.move(4, 4)
        await test.screenshot({ path: path.join(out, `${key}-${width}-settled.png`) })
        await close.press('Escape')
        row.desktop.push({ width, checks }); await test.close()
      }
      const short = await browser.newPage({ viewport: { width: 1024, height: 350 }, reducedMotion: 'reduce' })
      await short.goto(base + '/trust', { waitUntil: 'networkidle' }); await open(short, variant.title)
      assert.equal((await short.locator(panel).boundingBox()).y, 40)
      await short.locator('dialog').evaluate(el => el.scrollTo(0, el.scrollHeight))
      const bottom = await short.locator(panel).boundingBox()
      assert.ok(bottom.y + bottom.height <= 310)
      await short.screenshot({ path: path.join(out, `${key}-short-screen.png`) })
      row.shortScreen = { topPadding: true, bottomReachable: true }; await short.close()
      const motion = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
      await motion.goto(base + '/trust', { waitUntil: 'networkidle' }); await open(motion, variant.title)
      const states = await motion.locator('.trust-source-dialog__frame').evaluate(async el => {
        const a = el.getAnimations()[0]; if (!a) throw Error('Missing entry animation'); a.pause()
        const states = []
        for (const time of [0, 120, 320]) { a.currentTime = time; await new Promise(requestAnimationFrame); states.push(Number(getComputedStyle(el).opacity)) }
        a.finish(); return states
      })
      assert.equal(states[0], 0); assert.ok(states[1] > 0 && states[1] < 1); assert.equal(states[2], 1)
      const exit = await motion.locator('.trust-source-dialog__frame').evaluate(async el => {
        el.querySelector('button').click(); await new Promise(requestAnimationFrame)
        const a = el.getAnimations().find(a => a.playState !== 'finished'); if (!a) throw Error('Missing exit animation'); a.pause()
        const states = []
        for (const time of [0, 100, 200]) { a.currentTime = time; await new Promise(requestAnimationFrame); states.push(Number(getComputedStyle(el).opacity)) }
        a.finish(); return states
      })
      assert.equal(exit[0], 1); assert.ok(exit[1] > 0 && exit[1] < 1); assert.equal(exit[2], 0)
      await motion.getByRole('dialog').waitFor({ state: 'hidden' })
      row.motion = { entryInterpolates: true, exitInterpolates: true, reducedMotionVerified: true }; await motion.close()
      const resize = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
      await resize.goto(base + '/trust', { waitUntil: 'networkidle' }); await open(resize, variant.title)
      await resize.setViewportSize({ width: 390, height: 844 })
      await resize.getByRole('dialog').waitFor({ state: 'hidden' })
      assert.notEqual(await resize.evaluate(() => document.body.style.overflow), 'hidden')
      assert.equal(await trigger(resize, variant.title).count(), 0)
      await resize.setViewportSize({ width: 1440, height: 900 }); await open(resize, variant.title)
      assert.equal(await resize.getByRole('dialog', { name: variant.title, exact: true }).count(), 1)
      row.breakpointCleanup = true; await resize.close()
      report.articles.push(row)
    }
    report.createdAt = new Date().toISOString()
    const reportFile = path.resolve(process.env.HUANYU_QA_REPORT || path.join(out, `trust-variants-${phase}-qa.json`))
    await fs.mkdir(path.dirname(reportFile), { recursive: true })
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2)); assert.deepEqual(report.errors, [])
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
