// Localhost-only verification of the document-backed directory. Figma is read
// separately through the official IAB; this browser never navigates to Figma.
const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const runtime = '/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const { chromium } = require(path.join(runtime, 'playwright'))
const sharp = require(path.join(runtime, 'sharp'))
const root = path.resolve(__dirname, '..')
const out = path.join(root, 'artifacts/physicians-directory-2026-10-30')
const url = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const s = id => `[data-figma-node="${id}"]`
const clean = text => text.replace(/^(?:[•□]\s*|\d+[.．]\s*)/, '')
const normalize = text => text.replace(/\s+/g, ' ').trim()
async function compareImages(reference, local) {
  const a = await sharp(reference).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const b = await sharp(local).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(a.info, b.info)
  let difference = 0
  for (let i = 0; i < a.data.length; i++) difference += Math.abs(a.data[i] - b.data[i])
  return difference / a.data.length / 255
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const data = JSON.parse(await fs.readFile(path.join(root, 'src/data/yaoyingPhysicians.json')))
  const records = data.records
  const errors = [], failedRequests = []
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { filterResults: [], dialogResults: [], layouts: [], visual: {}, errors, failedRequests }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    page.on('response', response => { if (response.status() >= 400 && /127\.0\.0\.1/.test(response.url())) failedRequests.push({ url: response.url(), status: response.status() }) })
    await page.goto(`${url}/doctors`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const allCards = page.locator('[data-physician-card]')
    assert.equal(await allCards.count(), 177)
    const cardIds = await allCards.evaluateAll(items => items.map(item => item.dataset.physicianId))
    assert.deepEqual(cardIds, records.map(record => record.id))
    assert.equal(new Set(cardIds).size, 177)
    await page.screenshot({ path: path.join(out, 'all-desktop-1440.png') })
    // Full content intentionally differs from the five Figma sample records.
    // Compare only unchanged source regions and assert card geometry separately.
    await page.screenshot({ path: path.join(out, 'local-hero-2x.png'), clip: { x: 0, y: 0, width: 1440, height: 460 } })
    const reference = path.join(out, 'figma-current.png')
    const referenceInfo = await sharp(reference).metadata()
    const ratio = referenceInfo.width / 1440
    await sharp(reference).extract({ left: 0, top: 0, width: Math.round(1440 * ratio), height: Math.round(460 * ratio) }).resize(2880, 920).toFile(path.join(out, 'figma-hero-2x.png'))
    report.visual.heroNMAE = await compareImages(path.join(out, 'figma-hero-2x.png'), path.join(out, 'local-hero-2x.png'))
    assert.ok(report.visual.heroNMAE < .01, `Hero mismatch ${report.visual.heroNMAE}`)
    const geometry = await allCards.first().boundingBox()
    assert.ok(Math.abs(geometry.width - 389.33334) < .01)
    assert.equal(geometry.height, 284)
    assert.equal(geometry.x, 112); assert.equal(geometry.y, 646)
    assert.ok(Math.abs((await allCards.nth(1).boundingBox()).x - geometry.x - 413.33334375) < .02)
    const footer = page.locator(s('1689:5315'))
    await footer.scrollIntoViewIfNeeded()
    await footer.screenshot({ path: path.join(out, 'local-footer-2x.png') })
    await sharp(reference).extract({ left: 0, top: Math.round(1334 * ratio), width: Math.round(1440 * ratio), height: Math.round(456 * ratio) }).resize(2880, 912).toFile(path.join(out, 'figma-footer-2x.png'))
    report.visual.footerNMAE = await compareImages(path.join(out, 'figma-footer-2x.png'), path.join(out, 'local-footer-2x.png'))
    assert.ok(report.visual.footerNMAE < .01, `Footer mismatch ${report.visual.footerNMAE}`)
    report.visual.cardGeometry = geometry
    await page.evaluate(() => scrollTo(0, 0))
    const shortcuts = [
      ['1689:4843', '', '全部'], ['1689:4846', '口腔科', '牙科'], ['1689:4849', '骨科', '骨科'],
      ['1689:4852', '血液内科', '血液内科'], ['1689:4840', '乳腺外科', '乳腺外科'], ['2320:8384', '全科', '全科'],
    ]
    for (const [id, department, label] of shortcuts) {
      await page.locator(s(id)).click()
      const expected = records.filter(record => !department || record.departmentSource === department).map(record => record.id)
      assert.deepEqual(await allCards.evaluateAll(items => items.map(item => item.dataset.physicianId)), expected)
      assert.equal(await page.locator(s(id)).getAttribute('aria-selected'), 'true')
      assert.equal(await page.getByLabel('按科室筛选医生').inputValue(), '')
      assert.equal((await page.locator(s(id)).innerText()).trim(), label)
      report.filterResults.push({ type: 'shortcut', label, count: expected.length, ids: expected })
    }
    const select = page.getByLabel('按科室筛选医生')
    assert.equal(await select.locator('option').count(), 35)
    for (const department of data.departments) {
      await select.selectOption(department)
      const expected = records.filter(record => record.departmentSource === department).map(record => record.id)
      assert.deepEqual(await allCards.evaluateAll(items => items.map(item => item.dataset.physicianId)), expected)
      assert.equal(await page.locator('[role="tab"][aria-selected="true"]').count(), 0)
      report.filterResults.push({ type: 'department', label: department, count: expected.length, ids: expected })
      if (['口腔科', '骨科', '乳腺外科', '全科'].includes(department)) await page.screenshot({ path: path.join(out, `department-${department}.png`) })
    }
    await select.selectOption('')
    assert.equal(await allCards.count(), 177)
    await page.locator(s('1689:4843')).press('ArrowRight')
    assert.equal(await page.locator(s('1689:4846')).evaluate(element => element === document.activeElement), true)
    await page.locator(s('1689:4846')).press('End')
    assert.equal(await allCards.count(), 22)
    await page.locator(s('2320:8384')).press('Home')
    assert.equal(await allCards.count(), 177)
    let currentDepartment = ''
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      if (currentDepartment !== record.departmentSource) { await select.selectOption(record.departmentSource); currentDepartment = record.departmentSource }
      const button = page.locator(`[data-physician-id="${record.id}"]`)
      await button.scrollIntoViewIfNeeded(); await button.focus()
      const before = await page.evaluate(() => scrollY)
      await button.click()
      const dialog = page.getByRole('dialog', { name: '专家介绍', exact: true })
      await dialog.waitFor({ state: 'visible' })
      assert.equal(await dialog.getByRole('heading', { level: 3, name: record.name, exact: true }).count(), 1)
      const body = await dialog.innerText()
      for (const info of record.basicInfo) assert.ok(normalize(body).includes(normalize(info.replace(/^[•□]\s*/, ''))), `${record.name}: basic info missing`)
      assert.ok(normalize(body).includes(normalize(record.workplace)), `${record.name}: workplace missing`)
      const expectedTabs = [
        ['专业擅长', record.professionalExpertise.length ? record.professionalExpertise : (record.specialty ? [record.specialty] : [])],
        ['专业任职', record.career], ['学术任职', record.academic], ['科研成果', record.research], ['可提供的跨境医疗服务', record.crossBorderServices],
      ].filter(([, values]) => values.length)
      assert.equal(await dialog.getByRole('tab').count(), expectedTabs.length)
      for (const [label, values] of expectedTabs) {
        const tab = dialog.getByRole('tab', { name: label, exact: true }); await tab.click()
        const panel = dialog.getByRole('tabpanel')
        const content = await panel.innerText()
        for (const value of values) assert.ok(normalize(content).includes(normalize(clean(value))), `${record.name}/${label}: missing source content`)
        assert.equal(await tab.getAttribute('aria-selected'), 'true')
      }
      const portrait = dialog.locator('.physician-profile-dialog__avatar img')
      const hasPortrait = ['周莉莉::血液内科', '柳光宇::乳腺外科', '陈疾忤::骨科'].includes(`${record.name}::${record.departmentSource}`)
      assert.equal(await portrait.count(), hasPortrait ? 1 : 0)
      assert.ok(!/供设计师|源表原始信息|执业证编号|直付医院名称\/执业地点/.test(await dialog.innerText()))
      if (['yaoying-143', 'yaoying-119', 'yaoying-091', 'yaoying-187', 'yaoying-133'].includes(record.id)) {
        await dialog.getByRole('tab').first().click()
        await page.screenshot({ path: path.join(out, `dialog-${record.id}.png`) })
      }
      // Native dialog + explicit handling must keep keyboard focus contained.
      if (i === 0) {
        const close = dialog.getByRole('button', { name: '关闭医生详情', exact: true })
        await close.focus(); await page.keyboard.press('Shift+Tab')
        assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true)
        await page.keyboard.press('Tab')
        assert.equal(await close.evaluate(element => element === document.activeElement), true)
      }
      if (i % 3 === 0) await page.keyboard.press('Escape')
      else if (i % 3 === 1) await dialog.getByRole('button', { name: '关闭医生详情', exact: true }).click()
      else await dialog.locator('[data-physician-dialog-overlay]').click({ position: { x: 8, y: 8 } })
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(await button.evaluate(element => element === document.activeElement), true, `${record.name}: focus restore`)
      assert.equal(await page.evaluate(() => scrollY), before, `${record.name}: scroll restore`)
      report.dialogResults.push({ id: record.id, name: record.name, department: record.departmentSource, tabs: expectedTabs.map(([label]) => label), portrait: hasPortrait, content: true, keyboard: true, close: true, focusRestore: true, scrollRestore: true })
      if ((i + 1) % 30 === 0) console.log(`Verified ${i + 1}/177 doctor profiles`)
    }
    for (const width of [1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${url}/doctors`, { waitUntil: 'networkidle' })
      const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, broken: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src), cards: document.querySelectorAll('[data-physician-card]').length }))
      assert.equal(layout.width, layout.scrollWidth); assert.deepEqual(layout.broken, []); assert.equal(layout.cards, 177)
      await page.screenshot({ path: path.join(out, `desktop-${width}.png`) })
      report.layouts.push(layout)
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${url}/doctors`, { waitUntil: 'networkidle' })
    const menu = page.locator(s('1689:5416'))
    await menu.press('ArrowDown')
    const link = page.locator('#physician-hospital-menu a').first(); await link.waitFor({ state: 'visible' })
    assert.equal(await link.evaluate(element => element === document.activeElement), true)
    await page.keyboard.press('Escape'); assert.equal(await menu.evaluate(element => element === document.activeElement), true)
    await page.locator(s('1689:5401')).click(); const consultation = page.getByRole('dialog'); await consultation.waitFor({ state: 'visible' }); await page.keyboard.press('Escape'); await consultation.waitFor({ state: 'hidden' })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await select.selectOption('乳腺外科')
    await page.waitForTimeout(750)
    const reduced = await page.emulateMedia({ reducedMotion: 'reduce' }); void reduced
    await page.screenshot({ path: path.join(out, 'final-乳腺外科.png') })
    assert.deepEqual(errors, []); assert.deepEqual(failedRequests, [])
    report.checkedAt = new Date().toISOString()
    report.dataSHA256 = createHash('sha256').update(await fs.readFile(path.join(root, 'src/data/yaoyingPhysicians.json'))).digest('hex')
    report.codeSHA256 = Object.fromEntries(await Promise.all(['src/views/patient/PhysicianView.vue', 'src/data/physicianFigmaSource.ts', 'src/components/common/PhysicianProfileDialog.vue'].map(async file => [file, createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex')])))
    await fs.writeFile(path.join(out, 'behavior-qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ doctors: report.dialogResults.length, filters: report.filterResults.length, visual: report.visual, layouts: report.layouts, errors }, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
