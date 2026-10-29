const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const key = process.argv[2]
assert.ok(/^[a-z-]+$/.test(key || ''))
const url = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
const sourceUrl = process.env.HUANYU_QA_SOURCE_URL || 'http://127.0.0.1:5174'
const phase = process.env.HUANYU_QA_PHASE || 'final'
const directory = path.join(root, 'docs/figma-source/toolkit-revision', key)
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/figma-toolkit-2026-10-22', key))
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'))
const selector = id => `[data-figma-node="${id}"]`
const flat = n => [n, ...n.children.flatMap(flat)]
async function main() {
  await fs.mkdir(out, { recursive: true })
  const variant = await read(path.join(directory, 'desktop-variant-2026-10-22.json'))
  const source = await read(path.join(directory, 'article-nodes-2026-10-22.json'))
  const sourceTree = await read(path.join(directory, 'source-tree-2026-10-22.json'))
  const mapping = await read(path.join(directory, 'node-to-code-2026-10-22.json'))
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = []
  const reports = {}
  async function compare(reference, local, name) {
    const expected = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const original = await fs.readFile(local)
    const metadata = await sharp(original).metadata()
    let rounding = 0
    if (metadata.width === expected.info.width && Math.abs(metadata.height - expected.info.height) === 1) {
      // Figma rounds a fractional export edge differently from Chromium's
      // element clip. Keep the original, then normalize only this single
      // native bottom pixel, without resizing/repositioning any content.
      rounding = metadata.height - expected.info.height
      await fs.writeFile(local.replace('.png', '-native-clip.png'), original)
      const adjusted = rounding > 0 ? sharp(original).extract({ left: 0, top: 0, width: metadata.width, height: expected.info.height }) : sharp(original).extend({ bottom: 1, background: '#fff' })
      await fs.writeFile(local, await adjusted.png().toBuffer())
    }
    const actual = await sharp(local).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    assert.deepEqual(actual.info, expected.info, `${name}: geometry mismatch`)
    let sum = 0, changed = 0
    for (let i = 0; i < actual.data.length; i += 4) {
      let max = 0
      for (let c = 0; c < 3; c++) { const d = Math.abs(actual.data[i + c] - expected.data[i + c]); sum += d; max = Math.max(max, d) }
      if (max > 16) changed++
    }
    const diff = Buffer.alloc(actual.data.length)
    const count = pixelmatch(expected.data, actual.data, diff, actual.info.width, actual.info.height, { threshold: .15, includeAA: false })
    const diffFile = path.join(out, `${name}-diff.png`)
    await sharp(diff, { raw: actual.info }).png().toFile(diffFile)
    const result = { reference, local, width: actual.info.width, height: actual.info.height, fractionalBottomEdgeRounding: rounding, pixelmatchPercent: count * 100 / (actual.info.width * actual.info.height), nMAE: sum * 100 / (actual.info.width * actual.info.height * 3 * 255), changedPixelsOver16: changed * 100 / (actual.info.width * actual.info.height), diff: diffFile }
    for (let top = 0; top < actual.info.height; top += 1600) {
      const height = Math.min(1600, actual.info.height - top), width = actual.info.width
      const slices = await Promise.all([reference, local].map(file => sharp(file).extract({ left: 0, top, width, height }).toBuffer()))
      await sharp({ create: { width: width * 2, height, channels: 3, background: '#fff' } }).composite(slices.map((input, index) => ({ input, left: width * index, top: 0 }))).png().toFile(path.join(out, `${name}-compare-${top}.png`))
    }
    return result
  }
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    // Original source fidelity is isolated from the PC composition metric.
    await page.goto(sourceUrl + `/docs/figma-source/toolkit-revision/${key}/source-baseline-2026-10-22.html`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const sourceReference = path.join(out, 'source-figma.png')
    await fs.copyFile(source.referenceExport, sourceReference)
    const sourceLocal = path.join(out, `source-${phase}.png`)
    await page.locator(selector(source.article)).screenshot({ path: sourceLocal })
    reports.source = await compare(sourceReference, sourceLocal, `source-${phase}`)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(sourceUrl + `/docs/figma-source/toolkit-revision/${key}/desktop-baseline-2026-10-22.html`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const baseline = path.join(out, `desktop-baseline-${phase}.png`)
    assert.ok(Math.abs(await page.evaluate(() => document.documentElement.scrollHeight) - variant.root.height) <= 1, 'Static baseline total height differs from its locked layout')
    await page.screenshot({ path: baseline, fullPage: true })
    await page.goto(url + '/steps/toolkit-detail?article=' + key, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(750)
    const local = path.join(out, `desktop-${phase}.png`)
    assert.ok(Math.abs(await page.evaluate(() => document.documentElement.scrollHeight) - variant.root.height) <= 1, 'Vue total height differs from its locked layout')
    await page.screenshot({ path: local, fullPage: true })
    reports.desktop = await compare(baseline, local, `desktop-${phase}`)
    reports.geometry = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
    reports.markerHug = await page.evaluate(() => {
      const frame = document.querySelector('[data-figma-node="143:3071"]').getBoundingClientRect()
      const text = document.querySelector('[data-figma-node="143:3072"]').getBoundingClientRect()
      return { left: text.left - frame.left, right: frame.right - text.right, height: frame.height, textFits: text.left >= frame.left && text.right <= frame.right }
    })
    assert.ok(reports.markerHug.textFits && Math.abs(reports.markerHug.left - 16) < .02 && Math.abs(reports.markerHug.right - 16) < .02 && reports.markerHug.height === 34, 'PC marker must preserve Figma Hug width and 16px horizontal padding')
    reports.missing = await page.evaluate(rows => rows.filter(n => !document.querySelector(n.selector)).map(n => n.nodeId), mapping.nodes)
    if (process.argv.includes('--static')) {
      const report = { createdAt: new Date().toISOString(), key, phase, staticOnly: true, sourceFrame: source.article, templateFrame: variant.templateFrame, pixelmatchOptions: { threshold: .15, includeAA: false }, ...reports, errors }
      await fs.writeFile(path.join(out, `${phase}-static-qa.json`), JSON.stringify(report, null, 2) + '\n')
      console.log(JSON.stringify(report, null, 2))
      assert.deepEqual(errors, []); assert.deepEqual(reports.missing, []); assert.deepEqual(reports.geometry.brokenImages, [])
      for (const kind of ['source', 'desktop']) assert.ok(reports[kind].pixelmatchPercent < 1 && reports[kind].nMAE < 1, `${kind}: static difference >=1%`)
      return
    }
    const desktop = []
    for (const [width, height] of [[1024, 600], [1440, 900], [1920, 1080]]) {
      await page.setViewportSize({ width, height })
      await page.goto(url + '/steps/toolkit-detail?article=' + key, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const scale = Math.min(1, width / 1440)
      const checks = { fits: await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), fullCopy: (await page.locator(selector('143:3077')).innerText()).replace(/\s/g, '') === flat(variant.root).find(n => n.id === '143:3077').text.replace(/\s/g, '') }
      await page.evaluate(() => scrollTo(0, 700))
      await page.waitForTimeout(100)
      const sticky = await page.locator(selector('143:3082')).boundingBox()
      checks.stickyTop = Math.abs(sticky.y - 24) < 1
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
      await page.waitForTimeout(100)
      const sidebar = await page.locator(selector('143:3082')).boundingBox()
      const layout = await page.locator(selector('143:3061')).boundingBox()
      const expectedTop = Math.min(Math.max(layout.y, 24), layout.y + layout.height - sidebar.height)
      checks.bottomBoundary = sidebar.y + sidebar.height <= layout.y + layout.height + 1 && Math.abs(sidebar.y - expectedTop) < 1
      await page.evaluate(() => scrollTo(0, 0))
      await page.waitForTimeout(100)
      checks.scrollRestores = Math.abs((await page.locator(selector('143:3082')).boundingBox()).y - 112 * scale) < 1
      checks.currentArticle = await page.locator(selector(source.entryNode || '143:3087')).getAttribute('aria-current') === 'page'
      checks.noFakeAnchors = await page.locator('a[href^="#"]').count() === 0
      await page.locator(selector('143:3065')).focus()
      await page.keyboard.press('Enter')
      await page.waitForURL('**/trust')
      checks.keyboardReturn = true
      await page.goBack({ waitUntil: 'networkidle' })
      await page.waitForSelector('[data-toolkit-article="' + key + '"]')
      const links = {
        'contact@huanyuyunyi.com': 'mailto:contact@huanyuyunyi.com',
        '+86 400-888-XXXX': 'tel:+864008886688',
        'WhatsApp': 'https://wa.me/864008886688',
      }
      checks.contactLinks = true
      for (const [label, href] of Object.entries(links)) {
        checks.contactLinks &&= await page.getByRole('link', { name: label, exact: true }).getAttribute('href') === href
      }
      await page.evaluate(() => scrollTo(0, 0))
      await page.getByRole('button', { name: '问阿宁', exact: true }).click()
      await page.locator('.consult-panel').waitFor({ state: 'visible' })
      await page.getByRole('dialog').getByRole('button', { name: '关闭', exact: true }).click()
      await page.locator('.consult-panel').waitFor({ state: 'hidden' })
      checks.consultation = true
      checks.disabledDestinations = true
      for (const item of await page.locator('[aria-disabled="true"]').all()) {
        const before = page.url()
        await item.click()
        checks.disabledDestinations &&= before === page.url() && await item.getAttribute('href') === null
      }
      await page.evaluate(() => scrollTo(0, 0))
      await page.screenshot({ path: path.join(out, `${phase}-${width}.png`), fullPage: true })
      desktop.push({ width, height, checks })
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(url + '/steps/toolkit-detail', { waitUntil: 'networkidle' })
    const entry = source.entryNode || '143:3087'
    await page.locator(selector(entry)).focus()
    await page.keyboard.press('Enter')
    await page.waitForURL('**/steps/toolkit-detail?article=' + key)
    await page.waitForSelector('[data-toolkit-article="' + key + '"]')
    reports.directoryEntry = (await page.locator(selector('143:3074')).innerText()) === variant.title
    await page.goBack({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-toolkit-article="translation"]')
    reports.historyRestores = (await page.locator(selector('143:3074')).innerText()) === '病历翻译与整理工具'
    await page.goForward({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-toolkit-article="' + key + '"]')
    reports.historyRestores &&= (await page.locator(selector('143:3074')).innerText()) === variant.title
    // Preserve the frozen mobile page and fail safely for desktop-only keys.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(url + '/steps/toolkit-detail?article=' + key, { waitUntil: 'networkidle' })
    reports.mobileDeferredSafely = new URL(page.url()).pathname === '/trust'
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(url + '/steps/toolkit-detail?article=not-an-article', { waitUntil: 'networkidle' })
    reports.unknownKeySafe = !new URL(page.url()).search && await page.locator('[data-toolkit-article="translation"]').count() === 1
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(url + '/steps/toolkit-detail?article=' + key, { waitUntil: 'networkidle' })
    const motion = await page.locator('[data-content-entry]').evaluate(el => {
      const animation = el.getAnimations().find(a => a.animationName?.startsWith('content-enter'))
      if (!animation) return { exists: false }
      animation.pause(); animation.currentTime = 0
      const start = { opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform }
      animation.currentTime = 220
      const middle = { opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform }
      animation.finish()
      const end = { opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform }
      return { exists: true, start, middle, end, duration: animation.effect.getTiming().duration }
    })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload({ waitUntil: 'networkidle' })
    motion.reducedMotion = await page.locator('[data-content-entry]').evaluate(el => getComputedStyle(el).animationName === 'none')
    reports.motion = motion
    reports.desktopBehavior = desktop
    const report = { createdAt: new Date().toISOString(), key, phase, sourceFrame: source.article, templateFrame: variant.templateFrame, pixelmatchOptions: { threshold: .15, includeAA: false }, ...reports, errors }
    await fs.writeFile(path.join(out, `${phase}-qa.json`), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
    assert.deepEqual(errors, [])
    assert.deepEqual(reports.missing, [])
    assert.deepEqual(reports.geometry.brokenImages, [])
    for (const kind of ['source', 'desktop']) { assert.ok(reports[kind].pixelmatchPercent < 1, `${kind} pixelmatch >=1%`); assert.ok(reports[kind].nMAE < 1, `${kind} nMAE >=1%`) }
    for (const row of desktop) for (const [check, result] of Object.entries(row.checks)) assert.equal(result, true, `${row.width}: ${check}`)
    assert.ok(motion.exists && +motion.start.opacity === 0 && +motion.middle.opacity > 0 && +motion.middle.opacity < 1 && +motion.end.opacity === 1 && motion.reducedMotion)
    assert.ok(reports.mobileDeferredSafely && reports.unknownKeySafe && reports.directoryEntry && reports.historyRestores)
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
