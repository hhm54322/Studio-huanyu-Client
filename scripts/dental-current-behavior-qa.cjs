const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/figma-dental-2026-10-28/behavior'))
const url = (process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174').replace(/\/$/, '') + '/dental'
const selector = id => `[data-figma-node="${id}"]`
const projects = ['2294:8281', '2294:8302', '2294:8319']
const projectNames = ['implant', 'whitening', 'veneer']
const frames = ['2294:7751', '2294:7487', '2294:7334', '231:1421', '2294:7557']
const tails = ['2294:7817', '2294:7912', '2294:7376', '231:1501', '2294:7486']
const cardConsumption = require('../docs/figma-source/dental-revision-2026-10-28/matching-card-consumption-2026-10-28.json')
const sourceCoverage = {
  project: '2294:8240', matching: '2294:6971', upload: '2294:8037', doctorCard: '2323:8392',
  profile: '2294:7751', treatmentFull: '2294:7818', treatmentViewport: '2294:7487', cases: '2294:7334',
  reviews: '231:1421', servicesFull: '2294:7380', servicesViewport: '2294:7557', institutionFull: '2294:7691', institutionViewport: '2294:7631',
}
const file = { name: 'qa-dental.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6wAAAAABJRU5ErkJggg==', 'base64') }
const pause = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
async function step(page, number) {
  await page.getByRole('button', { name: `${String(number).padStart(2, '0')} ${['选择牙科项目', '城市与医生匹配', '上传影像资料'][number - 1]}`, exact: true }).click()
  await pause(page)
  assert.equal(await page.locator('.dental-desktop-flow').getAttribute('data-dental-step'), String(number))
}
async function screenshot(page, name) {
  // A modal is fixed to the viewport. Capturing the full document while it is
  // inert makes Chrome briefly resize this page to 1×1, replacing the desktop
  // subtree with the frozen mobile UI. Capture modal evidence at its real size.
  await page.screenshot({ path: path.join(out, name + '.png'), fullPage: !(await page.locator('dialog[open]').count()) })
}
async function assertDialogTail(page, id) {
  const clip = page.locator('.dental-source-dialog__clip')
  await clip.evaluate(el => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' }))
  await pause(page)
  const box = await clip.boundingBox(), tail = await page.locator(selector(id)).boundingBox()
  assert.ok(tail && tail.y >= box.y - 1 && tail.y + tail.height <= box.y + box.height + 1, `${id}: final content cannot be read`)
  assert.ok(await clip.evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'Dialog overflows horizontally')
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', sourceCoverage, desktop: [], dialogs: [], motion: {}, submission: {}, errors: [] }
  let activePage
  try {
    for (const [width, height] of [[1024, 600], [1440, 900], [1920, 1080]]) {
      const page = activePage = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
      page.setDefaultTimeout(5000)
      page.on('pageerror', error => report.errors.push(error.message))
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const checks = {}
      for (let index = 0; index < projects.length; index++) {
        const card = page.locator(selector(projects[index])), detail = page.locator(`#dental-details-${projectNames[index]}`)
        if (await card.getAttribute('aria-expanded') === 'false') await card.click()
        assert.equal(await card.getAttribute('aria-expanded'), 'true')
        const box = await detail.boundingBox(), cardBox = await card.boundingBox()
        assert.ok(box.height > 0 && box.y + box.height <= cardBox.y + cardBox.height + 1, 'Expanded detail clipped')
      }
      assert.equal(await page.locator('.dental-live-project[aria-expanded="true"]').count(), 3)
      await screenshot(page, `all-projects-open-${width}`)
      await page.locator(selector(projects[1])).press('Enter')
      assert.equal(await page.locator('.dental-live-project[aria-expanded="true"]').count(), 2)
      assert.equal(await page.locator('#dental-details-whitening').getAttribute('aria-hidden'), 'true')
      await page.locator(selector(projects[1])).press('Space')
      assert.equal(await page.locator('.dental-live-project[aria-expanded="true"]').count(), 3)
      checks.independentAccordions = checks.keyboardAccordion = true
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      checks.projectFit = true
      await page.getByRole('button', { name: '下一步 城市与医生匹配', exact: true }).click()
      await pause(page)
      assert.equal(await page.locator('[data-doctor]').count(), 1)
      assert.equal(await page.locator('[data-doctor][data-figma-component="2323:8392"]').count(), 1, 'Standalone Doctor Card source is not consumed by the matching result')
      for (const [source, target] of cardConsumption.nodePairs) assert.equal(await page.locator(selector(target)).getAttribute('data-figma-source-node'), source, `${source}: standalone card node not composed into matching result`)
      await page.getByRole('combobox', { name: '城市', exact: true }).selectOption('广州')
      assert.equal(await page.locator('[data-doctor]').count(), 1, 'Filter applied before confirmation')
      await page.getByRole('button', { name: '筛选医生' }).click()
      assert.equal(await page.locator('[data-doctor]').count(), 0)
      await page.getByText('暂无符合条件的医生，请调整筛选条件。', { exact: true }).waitFor({ state: 'visible' })
      await page.getByRole('button', { name: '重置筛选' }).click()
      for (const [label, value, expected] of [['价格区间', '¥10,000-30,000', 0], ['价格区间', '¥10,000 以下', 1], ['城市', '上海', 1], ['医生职称', '主治医生', 1], ['经验标签', '20年以上', 1], ['机构背景', '口腔专科', 1], ['语言能力', 'English', 1]]) {
        await page.getByRole('combobox', { name: label, exact: true }).selectOption(value)
        await page.getByRole('button', { name: '筛选医生' }).click()
        assert.equal(await page.locator('[data-doctor]').count(), expected, label)
        await page.getByRole('button', { name: '重置筛选' }).click()
      }
      checks.filterAndEmpty = checks.priceFilter = true
      for (const name of ['价格排序', '评价最高', '经验优先', '综合推荐']) {
        await page.getByRole('button', { name, exact: true }).click()
        assert.equal(await page.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true')
        assert.equal(await page.locator('button[aria-pressed="true"]').count(), 1)
        assert.equal(await page.locator('[data-doctor]').count(), 1)
      }
      checks.sortAndReset = true
      await screenshot(page, `matching-${width}`)
      const opener = page.getByRole('button', { name: '查看谭兆林医生详情', exact: true })
      await opener.scrollIntoViewIfNeeded()
      const scroll = await page.evaluate(() => scrollY)
      await opener.click()
      const dialog = page.locator('dialog[open]')
      await dialog.waitFor({ state: 'visible' })
      assert.equal(await page.getByRole('tab').count(), 5)
      const states = []
      for (let index = 0; index < frames.length; index++) {
        if (index) await page.getByRole('tab').nth(index).click()
        assert.equal(await dialog.getAttribute('data-figma-node'), frames[index])
        assert.equal(await page.getByRole('tab', { selected: true }).count(), 1)
        if (index === 1) for (const text of ['01', '02', '03', '04', '05', '06']) assert.ok((await dialog.textContent()).includes(text))
        if (index === 4) assert.equal(await page.locator(selector('2294:7421')).count(), 1, 'Services full-content frame was not composed into its viewport')
        await assertDialogTail(page, tails[index])
        await screenshot(page, `doctor-tab-${index}-${width}-bottom`)
        states.push({ frame: frames[index], bottomReachable: true })
        await page.locator('.dental-source-dialog__clip').evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }))
      }
      // Focus remains in the modal and arrow/Home/End navigation updates tabs.
      for (const [key, expected] of [['Home', 0], ['ArrowRight', 1], ['End', 4], ['ArrowLeft', 3]]) {
        await page.getByRole('tab', { selected: true }).press(key)
        assert.equal(await dialog.getAttribute('data-active-tab'), String(expected))
      }
      for (let index = 0; index < 9; index++) {
        await page.keyboard.press(index % 2 ? 'Shift+Tab' : 'Tab')
        assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)))
      }
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'detached' })
      assert.ok(await opener.evaluate(el => document.activeElement === el), 'Doctor focus not restored')
      assert.equal(await page.evaluate(() => scrollY), scroll, 'Doctor close scrolled the page')
      report.dialogs.push({ width, states, keyboard: true, focusTrap: true, focusRestore: true, scrollRestore: true })
      checks.doctorDialog = true
      await page.getByRole('button', { name: '查看谭兆林种植修复案例', exact: true }).click()
      assert.equal(await page.locator('dialog[open]').getAttribute('data-active-tab'), '2')
      await page.getByRole('button', { name: '关闭医生详情', exact: true }).click()
      await page.locator('dialog[open]').waitFor({ state: 'detached' })
      checks.directCases = true
      const institution = page.getByRole('button', { name: '查看上海牙科机构', exact: true })
      await institution.click()
      await page.locator('dialog[data-dental-dialog="institution"][open]').waitFor({ state: 'visible' })
      assert.equal(await page.locator('dialog[open]').getAttribute('data-figma-node'), '2294:7631')
      for (const id of ['2294:7743', '2294:7744', '2294:7745', '2294:7746', '2294:7747', '2294:7748', '2294:7749', '2294:7750']) assert.equal(await page.locator(selector(id)).count(), 1)
      await assertDialogTail(page, '2294:7750')
      await screenshot(page, `institution-${width}-bottom`)
      await page.mouse.click(4, 4)
      await page.locator('dialog[open]').waitFor({ state: 'detached' })
      assert.ok(await institution.evaluate(el => document.activeElement === el))
      checks.institutionAndEightPhotos = true
      await page.getByRole('button', { name: '获取谭兆林医生免费报价', exact: true }).click()
      await pause(page)
      assert.equal(await page.locator('.dental-desktop-flow').getAttribute('data-dental-step'), '3')
      const submit = page.getByRole('button', { name: '提交评估 · 获取书面报价', exact: true })
      await submit.click()
      await page.getByRole('alert').filter({ hasText: '请至少上传一份' }).waitFor({ state: 'visible' })
      await page.getByRole('combobox', { name: '预算范围' }).selectOption('¥20,000 - ¥50,000')
      await page.getByLabel('计划到访时间', { exact: true }).fill('2026-12-01')
      await page.getByLabel('其他说明', { exact: true }).fill('QA only — no patient data')
      await page.locator('input[type="file"]').setInputFiles(file)
      await step(page, 2); await step(page, 3)
      assert.equal(await page.getByLabel('其他说明', { exact: true }).inputValue(), 'QA only — no patient data')
      await page.getByRole('list', { name: '已选择的资料' }).filter({ hasText: file.name }).waitFor({ state: 'visible' })
      assert.equal(await submit.isEnabled(), true)
      assert.equal(await page.getByRole('button', { name: /照片示例/ }).count(), 0, 'Photo examples are inline in the current Figma')
      await screenshot(page, `upload-ready-${width}`)
      checks.nativeFormAndValidation = checks.formPersistsAcrossSteps = checks.quoteEntry = true
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src)), [])
      checks.uploadFitAndAssets = true
      report.desktop.push({ width, height, checks })
      await page.close()
    }
    // Preserve the real multipart contract without writing a test case to the server.
    const page = activePage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    page.setDefaultTimeout(5000)
    let calls = 0, payloads = [], mode = 'failure', release
    await page.route('**/api/dental-assessments', async route => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST,OPTIONS', 'access-control-allow-headers': '*' } })
      calls++; payloads.push(route.request().postDataBuffer().toString())
      if (mode === 'failure') await route.fulfill({ status: 503, headers: { 'access-control-allow-origin': '*' }, json: { message: 'QA 暂时不可用，请重试' } })
      else { await new Promise(resolve => { release = resolve }); await route.fulfill({ status: 201, headers: { 'access-control-allow-origin': '*' }, json: { success: true, submissionId: 'qa-only', status: 'submitted', createdAt: new Date().toISOString() } }) }
    })
    await page.goto(url, { waitUntil: 'networkidle' })
    await step(page, 2)
    await page.getByRole('button', { name: '获取谭兆林医生免费报价', exact: true }).click()
    const submit = page.getByRole('button', { name: '提交评估 · 获取书面报价', exact: true })
    await submit.click(); assert.equal(calls, 0)
    await page.locator('input[type="file"]').setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('QA') })
    await page.getByRole('alert').filter({ hasText: '仅支持 JPG' }).waitFor({ state: 'visible' })
    await page.locator('input[type="file"]').setInputFiles(file)
    await page.getByRole('combobox', { name: '预算范围' }).selectOption('¥5,000 - ¥20,000')
    await page.getByLabel('计划到访时间', { exact: true }).fill('2026-12-01')
    await page.getByLabel('其他说明', { exact: true }).fill('QA contract only')
    await submit.click()
    await page.getByRole('alert').filter({ hasText: 'QA 暂时不可用' }).waitFor({ state: 'visible' })
    await screenshot(page, 'upload-api-error')
    mode = 'success'
    await page.getByRole('button', { name: '重试提交' }).click()
    await page.getByText('正在安全上传资料…', { exact: true }).waitFor({ state: 'visible' })
    assert.equal(calls, 2); assert.equal(await submit.isEnabled(), false)
    assert.equal(await page.getByRole('combobox', { name: '预算范围' }).isEnabled(), false)
    await page.waitForTimeout(150); assert.equal(calls, 2)
    release()
    await page.getByRole('status').filter({ hasText: '资料已记录，顾问会尽快与你联系。' }).waitFor({ state: 'visible' })
    assert.equal(await submit.isEnabled(), false)
    for (const value of ['whitening', 'budget', 'visitTime', '2026-12-01', 'QA contract only', 'qa-dental.png', '意向医生：谭兆林']) assert.ok(payloads[0].includes(value), `missing multipart ${value}`)
    const requestId = payload => payload.match(/name="requestId"\r\n\r\n([^\r]+)/)?.[1]
    assert.ok(requestId(payloads[0])); assert.equal(requestId(payloads[0]), requestId(payloads[1]))
    await screenshot(page, 'upload-api-success')
    report.submission = { payload: true, duplicateBlocked: true, failureRetry: true, emptyBlocked: true, invalidFileBlocked: true, reusedRequestId: true, quoteDoctorPreserved: true, realDataSent: false, requests: calls }
    await page.close()
    const motion = activePage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
    motion.setDefaultTimeout(5000)
    await motion.goto(url, { waitUntil: 'networkidle' }); await motion.evaluate(() => document.fonts.ready)
    const card = motion.locator(selector(projects[0])), detail = motion.locator('#dental-details-implant')
    await card.scrollIntoViewIfNeeded()
    const initialHeight = (await detail.boundingBox()).height, before = await motion.locator(selector('2294:8288')).boundingBox()
    await card.click(); await motion.waitForTimeout(80)
    const mid = (await detail.boundingBox()).height, after = await motion.locator(selector('2294:8288')).boundingBox()
    assert.ok(mid > 0 && mid < initialHeight, 'Accordion height must interpolate')
    assert.ok(Math.abs(before.y - after.y) < 0.25, 'Summary jumps during selection')
    await screenshot(motion, 'accordion-mid'); await motion.waitForTimeout(450)
    assert.equal((await detail.boundingBox()).height, 0)
    for (let i = 0; i < 4; i++) await card.click()
    await motion.waitForTimeout(450); assert.equal(await card.getAttribute('aria-expanded'), 'false')
    await motion.emulateMedia({ reducedMotion: 'reduce' }); await card.click(); await pause(motion)
    assert.equal((await detail.boundingBox()).height, initialHeight)
    assert.equal(await card.evaluate(el => getComputedStyle(el).transitionDuration), '0s')
    await step(motion, 2); await motion.getByRole('button', { name: '查看谭兆林医生详情', exact: true }).click()
    assert.deepEqual(await motion.locator('dialog[open]').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').map(a => a.animationName)), [])
    await motion.keyboard.press('Escape')
    report.motion = { heightInterpolation: true, stableSummary: true, rapidToggle: true, reducedMotion: true, dialogReducedMotion: true }
    await screenshot(motion, 'accordion-settled'); await motion.close()
    assert.deepEqual(report.errors, [])
  } catch (error) {
    report.errors.push(error.message)
    if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {})
    throw error
  } finally {
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, 'behavior-qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report))
    await browser.close()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
