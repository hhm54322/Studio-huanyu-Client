// Verify the extracted article source against actual Figma exports, without
// implementing/changing the paused mobile website UI.
const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const date = '2026-10-22'
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, `artifacts/figma-content-${date}`))
const sourceDirectory = path.resolve(process.env.HUANYU_ARTICLE_SOURCE || path.join(root, 'docs/figma-source/trust-articles-revision'))
const articles = process.env.HUANYU_ARTICLE_KEYS ? process.env.HUANYU_ARTICLE_KEYS.split(',').map(key => [key, key]) : [['cost', 'trust-02'], ['doctor', 'trust-03']]
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'))
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', scope: 'Original source extraction fidelity only; NOT mobile website implementation/acceptance', articles: [] }
  try {
    for (const [key, exportName] of articles) {
      const directory = path.join(sourceDirectory, key)
      const model = await read(path.join(directory, `dialog-model-${date}.json`))
      const parameters = await read(path.join(directory, `native-parameters-${date}.json`))
      const tree = await read(path.join(directory, `source-tree-${date}.json`))
      const at = parameters.nodes.find(n => n.nodeId === model.panel).framePosition
      const source = path.join(out, `${exportName}-figma.png`)
      const metadata = await sharp(source).metadata()
      const scale = metadata.width / tree.root.width
      assert.equal(scale, 3)
      const reference = path.join(out, `${key}-source-reference.png`)
      await sharp(source).extract({ left: Math.round(at.x * scale), top: Math.round(at.y * scale), width: Math.round(model.width * scale), height: Math.round(model.height * scale) }).png().toFile(reference)
      const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: scale })
      let html = await fs.readFile(path.join(directory, `baseline-${date}.html`), 'utf8')
      html = html.replace('http://127.0.0.1:5174/', base + '/')
      await page.setContent(html)
      await page.evaluate(() => document.fonts.ready)
      await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())))
      // Inspect the copied source CSS/native line positions without extra
      // baseline transforms. This is the raw static extraction, not the Vue
      // renderer; measuring its empty line strut and applying a transform
      // would add an unrelated offset to already-positioned glyph spans.
      const local = path.join(out, `${key}-source-local.png`)
      await page.locator(`[data-figma-node="${model.panel}"]`).screenshot({ path: local })
      const a = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const b = await sharp(local).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      assert.deepEqual(a.info, b.info)
      let sum = 0
      for (let i = 0; i < a.data.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(a.data[i + c] - b.data[i + c])
      const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
      const diff = Buffer.alloc(a.data.length)
      const changed = pixelmatch(a.data, b.data, diff, a.info.width, a.info.height, { threshold: .15, includeAA: false })
      await sharp(diff, { raw: a.info }).png().toFile(path.join(out, `${key}-source-diff.png`))
      const row = { key, frame: model.frame, reference, local, nMAE: sum / (a.info.width * a.info.height * 3) / 255 * 100, pixelmatchPercent: changed / (a.info.width * a.info.height) * 100, pixelmatchOptions: { threshold: .15, includeAA: false } }
      report.articles.push(row)
      console.log(JSON.stringify(row))
      await page.close()
    }
    report.createdAt = new Date().toISOString()
    const reportFile = path.resolve(process.env.HUANYU_QA_REPORT || path.join(out, 'trust-article-source-qa.json'))
    await fs.mkdir(path.dirname(reportFile), { recursive: true })
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2) + '\n')
    for (const row of report.articles) { assert.ok(row.nMAE < 1); assert.ok(row.pixelmatchPercent < 1) }
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
