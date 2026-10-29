const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/figma-content-2026-10-21'))
const references = path.join(root, 'artifacts/figma-content-2026-10-21')
const phase = process.env.HUANYU_QA_PHASE || 'static'
const name = process.env.HUANYU_QA_SOURCE || 'toolkit'
assert.equal(name, 'toolkit', 'Trust is a native dialog, not an article route; use trust-article-revision-qa.cjs')
const route = '/steps/toolkit-detail'

async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    await page.goto((process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174') + route, { waitUntil: 'networkidle' })
    await page.evaluate(async () => { await document.fonts.ready; scrollTo(0, 0) })
    await page.waitForTimeout(400)
    const reference = path.join(references, `${name}-figma.png`)
    const metadata = await sharp(reference).metadata()
    const file = path.join(out, `${name}-${phase}-local.png`)
    const full = await page.screenshot({ path: path.join(out, `${name}-${phase}-full.png`), fullPage: true })
    const fullMeta = await sharp(full).metadata()
    console.log(JSON.stringify({ reference: { width: metadata.width, height: metadata.height }, actual: { width: fullMeta.width, height: fullMeta.height } }))
    // Figma rounds the fractional frame bottom up; Chromium rounds the CSS
    // full-page bottom down. Normalize only that <=1 native-pixel white edge,
    // never resize/reposition page content or conceal a geometry mismatch.
    assert.ok(Math.abs(fullMeta.height - metadata.height) <= 1, 'Page height differs beyond fractional export rounding')
    await sharp(full).extract({ left: 0, top: 0, width: metadata.width, height: Math.min(metadata.height, fullMeta.height) }).extend({ bottom: Math.max(0, metadata.height - fullMeta.height), background: '#fff' }).png().toFile(file)
    const expected = await sharp(reference).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const actual = await sharp(file).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    assert.deepEqual(actual.info, expected.info)
    let sum = 0, changed = 0
    for (let i = 0; i < actual.data.length; i += 3) {
      let max = 0
      for (let c = 0; c < 3; c++) { const d = Math.abs(actual.data[i + c] - expected.data[i + c]); sum += d; max = Math.max(max, d) }
      if (max > 16) changed++
    }
    // Match the site's established Figma QA metric (visual-qa.cjs): native
    // DPR2, threshold .15, antialias edges excluded. Keep raw RGB diagnostics
    // separately so rasterization differences remain visible in the report.
    const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
    const refRgba = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer()
    const localRgba = await sharp(file).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer()
    const diff = Buffer.alloc(refRgba.length)
    const mismatches = pixelmatch(refRgba, localRgba, diff, metadata.width, metadata.height, { threshold: .15, includeAA: false })
    const pixelmatchPercent = 100 * mismatches / (metadata.width * metadata.height)
    await sharp(diff, { raw: { width: metadata.width, height: metadata.height, channels: 4 } }).png().toFile(path.join(out, `${name}-${phase}-diff.png`))
    const crops = []
    for (let y = 0; y < metadata.height; y += 1400) {
      const height = Math.min(1400, metadata.height - y)
      const left = await sharp(reference).extract({ left: 0, top: y, width: metadata.width, height }).resize({ width: 1440 }).toBuffer()
      const right = await sharp(file).extract({ left: 0, top: y, width: metadata.width, height }).resize({ width: 1440 }).toBuffer()
      const destination = path.join(out, `${name}-${phase}-comparison-${y}.png`)
      await sharp({ create: { width: 2880, height: Math.round(height / 2), channels: 3, background: '#fff' } }).composite([{ input: left, left: 0, top: 0 }, { input: right, left: 1440, top: 0 }]).png().toFile(destination)
      crops.push(destination)
    }
    const sourceDirectory = 'content-revision/toolkit'
    const mapping = JSON.parse(await fs.readFile(path.join(root, `docs/figma-source/${sourceDirectory}/node-to-code-2026-10-21.json`), 'utf8'))
    const missing = await page.evaluate(nodes => nodes.filter(n => !document.querySelector(n.selector)).map(n => n.nodeId), mapping.nodes.filter(n => n.rendered))
    const geometry = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
    const report = { createdAt: new Date().toISOString(), name, phase, frame: mapping.sourceFrame, nMAE: 100 * sum / actual.data.length / 255, pixelmatchPercent, pixelmatchOptions: { threshold: .15, includeAA: false }, changedPixelsOver16: 100 * changed / (actual.data.length / 3), geometry, missing, reference, local: file, crops, errors }
    await fs.writeFile(path.join(out, `${name}-${phase}-qa.json`), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
    assert.deepEqual(errors, [])
    assert.deepEqual(missing, [])
    assert.equal(geometry.width, 1440)
    assert.deepEqual(geometry.brokenImages, [])
    assert.ok(report.nMAE < 1)
    assert.ok(report.pixelmatchPercent < 1)
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
