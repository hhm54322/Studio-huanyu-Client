const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..'), out = path.join(root, 'artifacts/figma-dental-2026-10-20')
const models = [{ name: 'project', frame: '231:88', height: 2384 }, { name: 'matching', frame: '231:397', height: 2064 }, { name: 'upload', frame: '231:815', height: 1766 }]
async function compare(page, model, suffix = 'static') {
  await page.evaluate(async () => { scrollTo(0, 0); await document.fonts.ready })
  await page.waitForTimeout(400)
  const file = path.join(out, `${model.name}-${suffix}-local.png`)
  await page.screenshot({ path: file, fullPage: true })
  const reference = await sharp(path.join(out, `${model.name}-figma.png`)).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const actual = await sharp(file).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(actual.info, reference.info, `${model.name}: frame dimensions changed`)
  let sum = 0, changed = 0
  for (let i = 0; i < actual.data.length; i += 3) { let max = 0; for (let c = 0; c < 3; c++) { const d = Math.abs(actual.data[i + c] - reference.data[i + c]); sum += d; max = Math.max(max, d) } if (max > 16) changed++ }
  const nMAE = 100 * sum / actual.data.length / 255
  const cropResults = []
  for (const [section, top, height] of [['hero', 0, 460], ['workspace', 460, model.height - 916], ['footer', model.height - 456, 456]]) {
    const left = await sharp(path.join(out, `${model.name}-figma.png`)).extract({ left: 0, top: top * 2, width: 2880, height: height * 2 }).resize({ width: 1440 }).toBuffer()
    const right = await sharp(file).extract({ left: 0, top: top * 2, width: 2880, height: height * 2 }).resize({ width: 1440 }).toBuffer()
    const comparison = path.join(out, `${model.name}-${section}-${suffix}-comparison.png`)
    await sharp({ create: { width: 2880, height, channels: 3, background: '#fff' } }).composite([{ input: left, left: 0, top: 0 }, { input: right, left: 1440, top: 0 }]).png().toFile(comparison)
    cropResults.push(comparison)
  }
  const mapping = JSON.parse(await fs.readFile(path.join(root, `docs/figma-source/dental-revision/${model.name}/node-to-code-2026-10-20.json`), 'utf8'))
  const missing = await page.evaluate(nodes => nodes.filter(n => !document.querySelector(n.selector)).map(n => n.nodeId), mapping.nodes.filter(n => n.rendered))
  const geometry = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
  const result = { name: model.name, frame: model.frame, nMAE, changedPixelsOver16: 100 * changed / (actual.data.length / 3), missing, geometry, reference: path.join(out, `${model.name}-figma.png`), local: file, cropResults }
  console.log(JSON.stringify(result))
  return result
}
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', results: [], errors: [] }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => report.errors.push(e.message))
    await page.goto((process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174') + '/dental', { waitUntil: 'networkidle' })
    for (const [index, model] of models.entries()) {
      if (index) await page.getByRole('button', { name: `0${index + 1} ${index === 1 ? '城市与医生匹配' : '上传影像资料'}`, exact: true }).click()
      report.results.push(await compare(page, model, process.env.HUANYU_QA_PHASE || 'static'))
    }
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, `${process.env.HUANYU_QA_PHASE || 'static'}-qa.json`), JSON.stringify(report, null, 2) + '\n')
    assert.deepEqual(report.errors, [])
    for (const result of report.results) { assert.deepEqual(result.missing, []); assert.equal(result.geometry.width, 1440); assert.deepEqual(result.geometry.brokenImages, []); assert.ok(result.nMAE < 1, `${result.name}: ${result.nMAE}% exceeds 1%`) }
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
