const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'artifacts/figma-steps-2026-10-29')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const phase = process.env.HUANYU_QA_PHASE || 'development'
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = [], report = { createdAt: '', phase, frames: [], desktop: [], errors }
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(base + '/steps', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const stage = await page.locator('.toolkit-stages').boundingBox()
    assert.equal(stage.height, 2029)
    assert.equal(await page.locator('.toolkit-stage__copy').count(), 1)
    await page.screenshot({ path: path.join(out, `${phase}-full-page.png`), fullPage: true })
    for (const [name, height, offset] of [['travel', 1275, 0], ['aftercare', 754, 1275]]) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), stage.y + offset)
      await page.screenshot({ path: path.join(out, `${name}-${phase}-live-viewport.png`) })
      const reference = path.join(out, `${name}-current.png`), local = path.join(out, `${name}-${phase}-local.png`)
      // These Figma frames own only the toolkit. Hide unrelated fixed site
      // chrome for this source-frame capture, retaining a separate live view.
      // No source node is hidden, moved, resized, recolored or substituted.
      if (!offset) await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      const raw = await page.screenshot({ fullPage: !offset, style: '.patient-header,.patient-header *,.phase-nav,.phase-nav *,.consult-float{visibility:hidden!important}' })
      const capture = await sharp(raw).extract({ left: 0, top: offset ? 0 : Math.round(stage.y * 2), width: 2880, height: height * 2 }).png().toBuffer()
      await fs.writeFile(local, capture)
      const A = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const B = await sharp(capture).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      assert.deepEqual(A.info, B.info)
      const diff = Buffer.alloc(A.data.length)
      const changed = pixelmatch(A.data, B.data, diff, A.info.width, A.info.height, { threshold: .15, includeAA: false })
      let sum = 0
      for (let i = 0; i < A.data.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(A.data[i + c] - B.data[i + c])
      await sharp(diff, { raw: A.info }).png().toFile(path.join(out, `${name}-${phase}-diff.png`))
      const left = await sharp(reference).resize({ width: 720 }).toBuffer(), right = await sharp(capture).resize({ width: 720 }).toBuffer()
      await sharp({ create: { width: 1440, height: Math.round(height / 2), channels: 4, background: '#fff' } }).composite([{ input: left, left: 0, top: 0 }, { input: right, left: 720, top: 0 }]).png().toFile(path.join(out, `${name}-${phase}-pair.png`))
      const missing = await page.evaluate(nodes => nodes.filter(n => n.rendered && !document.querySelector(n.selector)).map(n => n.nodeId), JSON.parse(await fs.readFile(path.join(root, `docs/figma-source/steps/revision-2026-10-29/${name}/runtime-node-to-code-2026-10-29.json`))).nodes)
      const row = { name, height, offset, reference, local, changedPixelRatio: changed / (A.info.width * A.info.height), nMAE: sum / (A.info.width * A.info.height * 3 * 255), missing }
      report.frames.push(row)
      assert.deepEqual(missing, [])
    }
    for (const width of [1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(base + '/steps', { waitUntil: 'networkidle' })
      const boxes = await page.evaluate(() => ({ top: document.querySelector('.toolkit-stages').getBoundingClientRect().top + scrollY, height: document.querySelector('.toolkit-stages').getBoundingClientRect().height, overflow: document.documentElement.scrollWidth - innerWidth, broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
      assert.equal(boxes.overflow, 0); assert.deepEqual(boxes.broken, [])
      const clippedCards = await page.locator('.toolkit-stage__card--source').evaluateAll(cards => cards.filter(card => { const outer = card.getBoundingClientRect(), inner = card.firstElementChild.getBoundingClientRect(); return inner.width > outer.width + .05 || inner.height > outer.height + .05 }).map(card => card.firstElementChild.getAttribute('data-figma-node')))
      assert.deepEqual(clippedCards, [], `${width}: source card content clips internally`)
      const positions = []
      for (const offset of [0, 600, 1000, 1275, 1800, 2029]) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), boxes.top + offset)
        positions.push({ offset, copy: await page.locator('.toolkit-stage__copy').boundingBox() })
      }
      assert.ok(Math.abs(positions[1].copy.y - 165) < .1)
      assert.ok(Math.abs(positions[2].copy.y - positions[1].copy.y) < .1)
      assert.ok(Math.abs(positions[3].copy.y - positions[1].copy.y) < .1)
      assert.ok(positions[4].copy.y + positions[4].copy.height <= boxes.height - 1800 - 96)
      for (const [selector, article] of [['.toolkit-stage-panel:first-child a', 'visa'], ['#after a', 'steps-flow']]) {
        const link = page.locator(selector)
        assert.equal(await link.getAttribute('href'), '/steps/toolkit-detail?article=' + article)
        await link.focus(); await link.press('Enter')
        await page.waitForURL('**/steps/toolkit-detail?article=' + article)
        await page.goBack({ waitUntil: 'networkidle' })
      }
      report.desktop.push({ width, ...boxes, positions, keyboardEntries: true, singleStickyTitle: true })
    }
    assert.deepEqual(errors, [])
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, `${phase}-qa.json`), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
    for (const row of report.frames) { assert.ok(row.changedPixelRatio < .01, `${row.name} pixel diff`); assert.ok(row.nMAE < .01, `${row.name} RGB diff`) }
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
