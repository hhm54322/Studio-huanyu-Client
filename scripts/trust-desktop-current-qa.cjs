const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const assert = require('node:assert/strict')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'artifacts/figma-trust-2026-10-29')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const phase = process.env.HUANYU_QA_PHASE || 'development'
const prefix = phase === 'production' ? 'production-' : ''
const pixelmatchModule = require('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')
const pixelmatch = pixelmatchModule.default || pixelmatchModule
async function compare(reference, raw, referenceClip, localClip, name) {
  const ref = await sharp(reference).extract(referenceClip).png().toBuffer()
  const local = await sharp(raw).extract(localClip).png().toBuffer()
  const a = await sharp(ref).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const b = await sharp(local).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(a.info, b.info, `${name} dimensions`)
  const diff = Buffer.alloc(a.data.length)
  const changed = pixelmatch(a.data, b.data, diff, a.info.width, a.info.height, { threshold: .15, includeAA: false })
  let sum = 0
  for (let i = 0; i < a.data.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(a.data[i + c] - b.data[i + c])
  await fs.writeFile(path.join(out, `${prefix}${name}-reference.png`), ref)
  await fs.writeFile(path.join(out, `${prefix}${name}-local.png`), local)
  await sharp(diff, { raw: a.info }).png().toFile(path.join(out, `${prefix}${name}-diff.png`))
  return { name, changedPixelRatio: changed / (a.info.width * a.info.height), nMAE: sum / (a.info.width * a.info.height * 3 * 255), reference, referenceClip, localClip, local: path.join(out, `${prefix}${name}-local.png`) }
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const result = [], errors = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(base + '/trust', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const raw = await page.screenshot({ fullPage: true, path: path.join(out, `${prefix}desktop-full-current.png`) })
    const ref = path.join(out, 'figma-reference-current.png')
    const clip = (top, height, left = 0, width = 2880) => ({ left, top, width, height })
    // The source trust frame's native content is used through the end of
    // toolkit stage 01. Stages 02/03 are appended before the source CTA.
    result.push(await compare(ref, raw, clip(0, 6594), clip(0, 6594), 'main-static'))
    // Each state repeats the left title; the product has one sticky title.
    // Compare complete right content, then test the shared title separately.
    result.push(await compare(path.resolve(out, '../figma-steps-2026-10-29/travel-current.png'), raw, clip(0, 2550, 1040, 1840), clip(6594, 2550, 1040, 1840), 'travel'))
    result.push(await compare(path.resolve(out, '../figma-steps-2026-10-29/aftercare-current.png'), raw, clip(0, 1508, 1040, 1840), clip(9144, 1508, 1040, 1840), 'aftercare'))
    result.push(await compare(ref, raw, clip(6594, 824), clip(10652, 824), 'cta'))
    result.push(await compare(ref, raw, clip(7418, 912), clip(11476, 912), 'footer'))
    const checks = await page.evaluate(() => ({ height: document.querySelector('.trust-desktop-source').getBoundingClientRect().height, scrollWidth: document.documentElement.scrollWidth, broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
    checks.stages = await page.locator('[data-figma-node="204:5813"],[data-figma-node="204:6013"]').count()
    checks.articles = await page.locator('[data-trust-article]').count()
    checks.errors = errors
    assert.ok(Math.abs(checks.height - 6194.04) < .02)
    assert.equal(checks.scrollWidth, 1440)
    assert.deepEqual(checks.broken, [])
    assert.deepEqual(errors, [])
    assert.equal(checks.stages, 2)
    assert.equal(checks.articles, 8)
    await fs.writeFile(path.join(out, `${prefix}desktop-current-qa.json`), JSON.stringify({ createdAt: new Date().toISOString(), phase, result, checks }, null, 2) + '\n')
    console.log(JSON.stringify({ result, checks }, null, 2))
    for (const row of result) { assert.ok(row.changedPixelRatio < .01, `${row.name} changed pixels`); assert.ok(row.nMAE < .01, `${row.name} nMAE`) }
  } finally { await browser.close() }
}
main().catch(e => { console.error(e); process.exitCode = 1 })
