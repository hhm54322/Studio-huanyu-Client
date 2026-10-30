// Local-only regression: ensure card previews and detail cases use one collection.
// Synthetic records live only in an intercepted Vite module response, never on disk or a server.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'artifacts/dental-physicians-2026-10-30/case-regression')
const url = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'

async function main() {
  assert.match(url, /^http:\/\/127\.0\.0\.1:/, 'Synthetic cases are restricted to local development')
  const data = JSON.parse(await fs.readFile(path.join(root, 'src/data/dentalPhysicians.json'), 'utf8'))
  for (const doctor of data.records) doctor.caseStudies = []
  for (const index of [0, 3]) {
    const doctor = data.records[index]
    doctor.caseStudies = [{
      id: `qa-fixture-${doctor.id}`, title: `QA fixture ${doctor.id}`,
      images: [doctor.portrait, data.records[index + 1].portrait].map((src, image) => ({ src, alt: `QA image ${doctor.id}-${image + 1}` })),
    }]
    // A count of zero must not hide real detail entries.
    doctor.cases = '0'
  }
  // Conversely, a stale positive count without detail entries must not create a preview.
  data.records[1].cases = '99'
  data.records[2].caseStudies = [{ id: 'qa-incomplete', title: 'QA invalid image', images: [] }]
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/src/data/dentalPhysicians.json*', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: `export default ${JSON.stringify(data)}` }))
    await page.goto(`${url}/dental`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: '下一步 城市与医生匹配', exact: true }).click()
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('[data-figma-source-node="2294:7088"]').count(), 2)
    for (const [index, doctor] of data.records.entries()) {
      const card = page.locator(`[data-doctor="${doctor.id}"]`)
      const hasCase = index === 0 || index === 3
      const preview = card.locator('[data-figma-source-node="2294:7088"]')
      assert.equal(await preview.count(), hasCase ? 1 : 0)
      assert.equal((await card.boundingBox()).height, hasCase ? 496 : 338)
      if (!hasCase) continue
      assert.ok((await preview.innerText()).includes(doctor.caseStudies[0].title))
      const images = await preview.locator('[data-figma-source-node="2294:7091"], [data-figma-source-node="2294:7092"]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundImage))
      doctor.caseStudies[0].images.forEach((image, i) => assert.ok(images[i].includes(image.src)))
      await preview.click()
      const dialog = page.locator('dialog[open]')
      await dialog.waitFor({ state: 'visible' })
      assert.equal(await dialog.getAttribute('data-active-tab'), '2')
      const detail = dialog.locator(`[data-physician-case="${doctor.caseStudies[0].id}"]`)
      assert.equal(await detail.locator('h3').innerText(), doctor.caseStudies[0].title)
      assert.deepEqual(await detail.locator('img').evaluateAll(nodes => nodes.map(node => node.getAttribute('src'))), doctor.caseStudies[0].images.map(image => image.src))
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'detached' })
    }
    const first = await page.locator('[data-doctor="101"]').boundingBox()
    const fourth = await page.locator('[data-doctor="104"]').boundingBox()
    assert.equal(fourth.y - first.y, 520, 'Mixed rows must retain the highest source card and 24px row gap')
    await page.getByRole('combobox', { name: '城市', exact: true }).selectOption('上海')
    await page.getByRole('button', { name: '筛选医生', exact: true }).click()
    assert.equal(await page.locator('[data-doctor]').count(), 0)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await page.getByRole('button', { name: '重置筛选', exact: true }).click()
    assert.equal(await page.locator('[data-figma-source-node="2294:7088"]').count(), 2)
    assert.deepEqual(errors, [])
    const result = { cardsWithRealDetailCases: [101, 104], staleCountIgnored: true, incompleteCaseIgnored: true, perDoctorImagesMatchDetail: true, mixedRows: true, emptyFilter: true, reset: true, errors, realDataSent: false, checkedAt: new Date().toISOString() }
    await fs.writeFile(path.join(out, 'result.json'), JSON.stringify(result, null, 2) + '\n')
    console.log(JSON.stringify(result))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
