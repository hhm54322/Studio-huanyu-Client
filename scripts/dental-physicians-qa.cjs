// Document-backed dental profiles. This browser only visits localhost.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { createHash } = require('node:crypto')
const runtime = '/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const { chromium } = require(path.join(runtime, 'playwright'))
const sharp = require(path.join(runtime, 'sharp'))
const root = path.resolve(__dirname, '..')
const base = path.join(root, 'artifacts/dental-physicians-2026-10-30')
const out = process.env.HUANYU_QA_OUTPUT || path.join(base, 'development')
const url = (process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')
const s = id => `[data-figma-node="${id}"]`
const normalize = text => text.replace(/\s+/g, '')
const publishedCases = record => (record.caseStudies || []).filter(item => item.title.trim() && item.images.some(image => image.src.trim()))
const displayExperience = value => /(经验|专家)\s*$/.test(value.trim()) ? value : `${value}经验`
const hash = async file => createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex')
const codeFiles = ['src/views/patient/DentalView.vue', 'src/components/common/DentalDesktopFlow.vue', 'src/components/common/DentalDoctorSourceDialog.vue', 'src/components/common/DentalPhysicianDocumentContent.vue', 'src/data/dentalFigmaSource.ts', 'src/data/dentalPhysicianSource.ts', 'src/data/dentalPhysicianData.ts', 'src/components/common/DentalSourceCanvas.vue', 'src/components/common/HomeSourceNode.vue', 'src/utils/figmaFullBleed.ts', 'src/assets/styles/main.css', 'src/components/layout/PatientLayout.vue', 'src/components/layout/PatientHeader.vue']
const pause = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const file = { name: 'qa-dental.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6wAAAAABJRU5ErkJggg==', 'base64') }
async function step(page, number) {
  await page.getByRole('button', { name: `${String(number).padStart(2, '0')} ${['选择牙科项目', '城市与医生匹配', '上传影像资料'][number - 1]}`, exact: true }).click()
  await pause(page)
}
async function imageDifference(reference, local) {
  const a = await sharp(reference).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const b = await sharp(local).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(a.info, b.info)
  let difference = 0
  for (let i = 0; i < a.data.length; i++) difference += Math.abs(a.data[i] - b.data[i])
  return difference / a.data.length / 255
}
async function cardSourceCrop(name, rect, reference, localFull) {
  const target = path.join(out, `${name}-figma.png`), local = path.join(out, `${name}-local.png`)
  await sharp(reference).extract(rect).flatten({ background: '#fff' }).ensureAlpha().png().toFile(target)
  await sharp(localFull).extract(rect).flatten({ background: '#fff' }).ensureAlpha().png().toFile(local)
  const a = await sharp(target).raw().toBuffer(), b = await sharp(local).raw().toBuffer()
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const diff = Buffer.alloc(a.length)
  const changed = pixelmatch(a, b, diff, rect.width, rect.height, { threshold: .15, includeAA: false })
  await sharp(diff, { raw: { width: rect.width, height: rect.height, channels: 4 } }).png().toFile(path.join(out, `${name}-diff.png`))
  await sharp({ create: { width: rect.width * 2, height: rect.height, channels: 4, background: '#fff' } }).composite([{ input: target, left: 0, top: 0 }, { input: local, left: rect.width, top: 0 }]).png().toFile(path.join(out, `${name}-comparison.png`))
  const result = { nMAE: await imageDifference(target, local), pixelmatch: changed / (rect.width * rect.height), reference: target, local }
  assert.ok(result.nMAE < .01 && result.pixelmatch < .01, `${name}: source mismatch ${JSON.stringify(result)}`)
  return result
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const data = JSON.parse(await fs.readFile(path.join(root, 'src/data/dentalPhysicians.json')))
  const records = data.records
  const report = { doctors: [], filters: [], layouts: [], visual: {}, submission: {}, motion: {}, errors: [], failedRequests: [] }
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  let page
  try {
    page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.setDefaultTimeout(7000)
    page.on('pageerror', error => report.errors.push(error.message))
    page.on('response', response => { if (response.status() >= 400 && /127\.0\.0\.1/.test(response.url()) && !response.url().includes('/api/')) report.failedRequests.push({ url: response.url(), status: response.status() }) })
    await page.goto(`${url}/dental`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    // Preserve the eight existing independent project cards and public footer.
    assert.equal(await page.locator('.dental-live-project').count(), 8)
    await page.getByRole('button', { name: '下一步 城市与医生匹配', exact: true }).click()
    const cards = page.locator('[data-doctor]')
    const ids = async () => (await cards.evaluateAll(items => items.map(item => Number(item.dataset.doctor)) ))
    assert.deepEqual(await ids(), records.map(record => record.id))
    assert.ok(!/谭兆林|案例集（1）|128/.test(await page.locator('.dental-desktop-flow').innerText()))
    for (const record of records) {
      const card = page.locator(`[data-doctor="${record.id}"]`)
      const hasCases = publishedCases(record).length > 0
      for (const text of [record.name, displayExperience(record.experience), '深圳', '5.0', '¥1,080/颗']) assert.ok((await card.innerText()).includes(text), `${record.name}: ${text}`)
      assert.equal(await card.locator('[data-figma-source-node="2294:7088"]').count(), hasCases ? 1 : 0, `${record.name}: case panel visibility`)
      assert.equal(await card.locator('[data-figma-source-node="2294:7091"]').count(), hasCases ? 1 : 0, `${record.name}: case image 1 visibility`)
      assert.equal(await card.locator('[data-figma-source-node="2294:7092"]').count(), hasCases ? 1 : 0, `${record.name}: case image 2 visibility`)
      assert.equal(await card.getByRole('button', { name: `查看${record.name}案例集`, exact: true }).count(), hasCases ? 1 : 0, `${record.name}: case action visibility`)
      const avatar = card.locator(`[data-figma-node^="2294:7063::"]`)
      assert.ok((await avatar.getAttribute('style')).includes(record.portrait))
      const design = await card.evaluate(el => {
        const at = id => el.querySelector(`[data-figma-node="${id}::dental-physician-${el.dataset.doctor}"]`)
        const box = id => { const node = at(id); if (!node) return null; const style = getComputedStyle(node); return { width: parseFloat(style.width), height: parseFloat(style.height), radius: style.borderRadius, background: style.backgroundColor } }
        const price = at('2294:7085'), runs = [...price.querySelector('[aria-hidden="true"]').children[0].children]
        return { cardHeight: parseFloat(getComputedStyle(el).height), priceBox: box('2294:7080'), caseBox: box('2294:7088'), images: ['2294:7091', '2294:7092'].map(box), price: runs.map(run => ({ text: run.textContent, color: getComputedStyle(run).color, weight: getComputedStyle(run).fontWeight })), noReferenceLabel: !at('2294:7080').innerText.includes('参考价') }
      })
      assert.deepEqual(design.priceBox, { width: 84, height: 60, radius: '12px', background: 'rgb(255, 255, 255)' })
      if (hasCases) {
        assert.ok(Math.abs(design.caseBox.width - 341.33334) < .02); assert.equal(design.caseBox.height, 134); assert.equal(design.caseBox.radius, '16px')
        for (const image of design.images) { assert.equal(image.width, 80); assert.equal(image.height, 80); assert.equal(image.radius, '16px') }
      } else {
        assert.equal(design.caseBox, null); assert.deepEqual(design.images, [null, null]); assert.equal(design.cardHeight, 338)
      }
      assert.deepEqual(design.price, [{ text: '¥1,080', color: 'rgb(37, 99, 235)', weight: '600' }, { text: '/颗', color: 'rgb(75, 85, 99)', weight: '400' }])
      assert.equal(design.noReferenceLabel, true)
    }
    await page.evaluate(() => scrollTo(0, 0))
    await page.screenshot({ path: path.join(out, 'matching-full.png'), fullPage: true })
    await page.screenshot({ path: path.join(out, 'local-hero-2x.png'), clip: { x: 0, y: 0, width: 1440, height: 460 } })
    const reference = path.join(root, 'artifacts/figma-dental-2026-10-28/source/matching-figma.png')
    report.visual.casePreview = records.some(record => publishedCases(record).length)
      ? await cardSourceCrop('case-preview', { left: 272, top: 2252, width: 682, height: 268 }, reference, path.join(out, 'matching-full.png'))
      : { omitted: true, reason: 'No physician detail currently contains a published/authorised case collection; Figma illustrative assets are not rendered.' }
    report.visual.rating = await cardSourceCrop('rating', { left: 786, top: 1864, width: 168, height: 64 }, reference, path.join(out, 'matching-full.png'))
    await sharp(path.join(out, 'matching-full.png')).extract({ left: 224, top: 1816, width: 779, height: 992 }).toFile(path.join(out, 'card-101.png'))
    const info = await sharp(reference).metadata(), ratio = info.width / 1440
    await sharp(reference).extract({ left: 0, top: 0, width: Math.round(1440 * ratio), height: Math.round(460 * ratio) }).resize(2880, 920).toFile(path.join(out, 'figma-hero-2x.png'))
    report.visual.heroNMAE = await imageDifference(path.join(out, 'figma-hero-2x.png'), path.join(out, 'local-hero-2x.png'))
    assert.ok(report.visual.heroNMAE < .01, `Hero mismatch ${report.visual.heroNMAE}`)
    const first = await cards.first().boundingBox(), second = await cards.nth(1).boundingBox(), fourth = await cards.nth(3).boundingBox()
    report.visual.cardGeometry = { first, second, fourth }
    assert.ok(Math.abs(first.width - 389.33334) < .02); assert.equal(first.height, publishedCases(records[0]).length ? 496 : 338)
    assert.equal(first.x, 112); assert.equal(first.y, 908)
    assert.ok(Math.abs(second.x - first.x - 413.33334) < .02); assert.equal(fourth.y - first.y, Math.max(...records.slice(0, 3).map(record => publishedCases(record).length ? 496 : 338)) + 24)
    const footer = page.locator(s('2294:7214'))
    await footer.scrollIntoViewIfNeeded()
    await footer.screenshot({ path: path.join(out, 'local-footer-2x.png') })
    await sharp(reference).extract({ left: 0, top: Math.round(1596 * ratio), width: Math.round(1440 * ratio), height: Math.round(456 * ratio) }).resize(2880, 912).toFile(path.join(out, 'figma-footer-2x.png'))
    report.visual.footerNMAE = await imageDifference(path.join(out, 'figma-footer-2x.png'), path.join(out, 'local-footer-2x.png'))
    assert.ok(report.visual.footerNMAE < .01, `Footer mismatch ${report.visual.footerNMAE}`)
    const filters = [
      ['城市', '深圳', records], ['城市', '上海', []], ['城市', '广州', []],
      ['医生职称', '副主任医师', records.filter(record => record.title.includes('副主任医师'))],
      ['医生职称', '主任医师', records.filter(record => record.title.replace(/副主任医师/g, '').includes('主任医师'))],
      ['医生职称', '主治医师', records.filter(record => record.title.includes('主治医师'))],
      ['医生职称', '教授', records.filter(record => record.title.includes('教授'))],
      ['医生职称', '院长', records],
      ['经验标签', '20年以上', records.filter(record => Number(record.experience.match(/\d+/)?.[0] || 0) >= 20)],
      ['经验标签', '10-20年', records.filter(record => { const years = Number(record.experience.match(/\d+/)?.[0] || 0); return years >= 10 && years <= 20 })],
      ['机构背景', '口腔专科', records], ['机构背景', '公立三甲', []],
      ['语言能力', 'English', []], ['价格区间', '¥10,000 以下', records], ['价格区间', '¥10,000-30,000', []],
    ]
    for (const [label, value, expected] of filters) {
      await page.getByRole('combobox', { name: label, exact: true }).selectOption(value)
      assert.equal(await cards.count(), 6, 'Filter applied before clicking confirmation')
      await page.getByRole('button', { name: '筛选医生', exact: true }).click()
      assert.deepEqual(await ids(), expected.map(record => record.id), `${label} ${value}`)
      if (!expected.length) assert.equal(await page.getByRole('status').filter({ hasText: '暂无符合条件的医生' }).count(), 1)
      report.filters.push({ label, value, ids: await ids() })
      await page.getByRole('button', { name: '重置筛选', exact: true }).click()
    }
    for (const [name, expected] of [
      ['经验优先', [...records].sort((a, b) => Number(b.experience.match(/\d+/)?.[0] || 0) - Number(a.experience.match(/\d+/)?.[0] || 0))],
      ['价格排序', records], ['评价最高', records], ['综合推荐', records],
    ]) {
      await page.getByRole('button', { name, exact: true }).click()
      assert.deepEqual(await ids(), expected.map(record => record.id))
      assert.equal(await page.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true')
    }
    report.sorting = true
    for (const record of records) {
      const opener = page.getByRole('button', { name: `查看${record.name}医生详情`, exact: true })
      await opener.scrollIntoViewIfNeeded(); await opener.focus()
      const scroll = await page.evaluate(() => scrollY)
      await opener.click()
      const dialog = page.locator('dialog[open]'), clip = dialog.locator('.dental-source-dialog__clip')
      await dialog.waitFor({ state: 'visible' })
      await page.waitForFunction(() => document.querySelector('.dental-source-dialog__canvas').offsetHeight > 900)
      assert.equal(await dialog.getAttribute('data-document-doctor'), String(record.id))
      assert.equal(await dialog.getByRole('tab').count(), 5)
      const content = normalize(await dialog.innerText())
      for (const text of [record.name, record.title, record.hospital, record.bio, ...record.credentials, ...record.professionalFields, ...record.originalCredentials, ...record.originalSpecialty]) assert.ok(content.includes(normalize(text)), `${record.name}: source content missing ${text}`)
      assert.ok(!/谭兆林|原始专业介绍/.test(content))
      await page.screenshot({ path: path.join(out, `profile-${record.id}.png`) })
      await clip.evaluate(el => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' })); await pause(page)
      const bottom = await dialog.locator('.dental-document-content__reference-price').boundingBox(), clipBox = await clip.boundingBox()
      assert.ok(bottom.y >= clipBox.y && bottom.y + bottom.height <= clipBox.y + clipBox.height + 1, `${record.name}: final content clipped`)
      assert.equal(await clip.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true)
      if (record.id === 101) await page.screenshot({ path: path.join(out, 'profile-101-bottom.png') })
      const states = ['profile']
      for (let index = 1; index < 5; index++) {
        await clip.evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }))
        await dialog.getByRole('tab').nth(index).click(); await pause(page)
        assert.equal(await dialog.getByRole('tab', { selected: true }).count(), 1)
        const text = normalize(await dialog.innerText())
        assert.ok(text.includes(record.name)); assert.ok(!text.includes('谭兆林'))
        if (index === 1) {
          for (const item of data.treatment) {
            // The authored second step displays these as two consecutive
            // cards; the Word summary combines them into one title.
            const titles = item.title === '面诊评估与方案报价' ? ['面诊评估', '方案与报价'] : [item.title]
            for (const title of titles) assert.ok(text.includes(normalize(title)), `Treatment missing ${title}`)
          }
          for (const number of ['01', '02', '03', '04', '05', '06']) assert.ok(text.includes(number))
        }
        if (index === 2) { assert.ok(text.includes('暂无已公开案例')); assert.equal(await dialog.locator('img[src*="case"]').count(), 0) }
        if (index === 3) {
          assert.equal(await dialog.locator('.dental-document-content__review').count(), record.reviews.length)
          for (const review of record.reviews) for (const value of Object.values(review)) assert.ok(text.includes(normalize(value)), `${record.name}: missing review`)
        }
        if (index === 4) for (const service of data.services) assert.ok(text.includes(normalize(service.title)), `Service missing ${service.title}`)
        await clip.evaluate(el => el.scrollTo({ top: el.scrollHeight, behavior: 'instant' })); await pause(page)
        assert.equal(await clip.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true)
        if (record.id === 101) await page.screenshot({ path: path.join(out, `tab-${index}-bottom.png`) })
        states.push(['profile', 'treatment', 'cases', 'reviews', 'services'][index])
      }
      await clip.evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }))
      for (const [key, expected] of [['Home', '0'], ['ArrowRight', '1'], ['End', '4'], ['ArrowLeft', '3']]) {
        await dialog.getByRole('tab', { selected: true }).press(key)
        assert.equal(await dialog.getAttribute('data-active-tab'), expected)
      }
      for (let i = 0; i < 10; i++) { await page.keyboard.press(i % 2 ? 'Tab' : 'Shift+Tab'); assert.ok(await dialog.evaluate(el => el.contains(document.activeElement))) }
      if (record.id % 3 === 0) await page.keyboard.press('Escape')
      else if (record.id % 3 === 1) await dialog.getByRole('button', { name: '关闭医生详情', exact: true }).click()
      else await dialog.locator('[data-dental-source-overlay]').click({ position: { x: 4, y: 4 } })
      await dialog.waitFor({ state: 'detached' })
      assert.equal(await page.evaluate(() => scrollY), scroll)
      assert.equal(await opener.evaluate(el => el === document.activeElement), true)
      const institution = page.locator(`[data-doctor="${record.id}"]`).getByRole('button', { name: `查看${record.hospital}`, exact: true })
      await institution.click(); await dialog.waitFor({ state: 'visible' }); await pause(page)
      assert.equal(await dialog.getAttribute('data-dental-dialog'), 'institution')
      for (const text of [record.hospital, record.institutionIntro, record.institutionEnvironment]) assert.ok(normalize(await dialog.innerText()).includes(normalize(text)), `${record.name}: wrong institution`)
      assert.equal(await dialog.locator(s('2294:7683')).count(), 0)
      if (record.id === 102) await page.screenshot({ path: path.join(out, 'institution-102.png') })
      await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'detached' })
      assert.equal(await institution.evaluate(el => el === document.activeElement), true)
      const cases = page.getByRole('button', { name: `查看${record.name}案例集`, exact: true })
      if (publishedCases(record).length) {
        await cases.click(); await dialog.waitFor({ state: 'visible' })
        assert.equal(await dialog.getAttribute('data-document-doctor'), String(record.id)); assert.equal(await dialog.getAttribute('data-active-tab'), '2')
        await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'detached' }); assert.equal(await cases.evaluate(el => el === document.activeElement), true)
      } else assert.equal(await cases.count(), 0)
      report.doctors.push({ id: record.id, name: record.name, states, content: true, bottomReachable: true, institution: true, directCases: true, focusRestore: true, scrollRestore: true, keyboard: true })
    }
    for (const width of [1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: width === 1024 ? 600 : 900 })
      await page.goto(`${url}/dental`, { waitUntil: 'networkidle' }); await step(page, 2)
      await page.evaluate(() => document.fonts.ready)
      const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, cards: document.querySelectorAll('[data-doctor]').length, broken: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src) }))
      assert.equal(layout.width, layout.scrollWidth); assert.equal(layout.cards, 6); assert.deepEqual(layout.broken, [])
      await page.screenshot({ path: path.join(out, `desktop-${width}.png`), fullPage: true })
      await page.getByRole('button', { name: '查看万前程医生详情', exact: true }).click()
      const clip = page.locator('.dental-source-dialog__clip')
      await page.locator('[data-doctor-content="102"]').waitFor({ state: 'visible' })
      await pause(page)
      const box = await clip.boundingBox()
      assert.ok(box.x > 0 && box.x + box.width <= width)
      assert.equal(await clip.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true)
      await page.screenshot({ path: path.join(out, `dialog-${width}.png`) })
      await page.keyboard.press('Escape')
      report.layouts.push(layout)
    }
    // Verify each quote retains the intended doctor through step navigation.
    await page.setViewportSize({ width: 1440, height: 900 })
    let captured = [], mode = 'failure', release
    await page.route('**/api/dental-assessments', async route => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST,OPTIONS', 'access-control-allow-headers': '*' } })
      captured.push(route.request().postDataBuffer().toString())
      if (mode === 'failure') await route.fulfill({ status: 503, headers: { 'access-control-allow-origin': '*' }, json: { message: 'QA 暂时不可用，请重试' } })
      else { await new Promise(resolve => { release = resolve }); await route.fulfill({ status: 201, headers: { 'access-control-allow-origin': '*' }, json: { success: true, submissionId: 'qa-only', status: 'submitted', createdAt: new Date().toISOString() } }) }
    })
    for (const record of records) {
      await page.goto(`${url}/dental`, { waitUntil: 'networkidle' }); await step(page, 2)
      await page.getByRole('button', { name: `获取${record.name}医生免费报价`, exact: true }).click()
      await page.locator('input[type="file"]').setInputFiles(file)
      await page.getByRole('button', { name: '提交评估 · 获取书面报价', exact: true }).click()
      await page.getByRole('alert').filter({ hasText: 'QA 暂时不可用' }).waitFor({ state: 'visible' })
      assert.ok(captured.at(-1).includes(`意向医生：${record.name}`))
    }
    const before = captured.length, submit = page.getByRole('button', { name: '提交评估 · 获取书面报价', exact: true })
    const firstPayload = captured.at(-1)
    mode = 'success'
    await page.getByRole('button', { name: '重试提交', exact: true }).click()
    await page.getByText('正在安全上传资料…', { exact: true }).waitFor({ state: 'visible' })
    assert.equal(await submit.isDisabled(), true)
    await page.waitForTimeout(100)
    assert.equal(captured.length, before + 1)
    const requestId = payload => payload.match(/name="requestId"\r\n\r\n([^\r]+)/)?.[1]
    assert.ok(requestId(firstPayload)); assert.equal(requestId(firstPayload), requestId(captured.at(-1)))
    release()
    await page.getByRole('status').filter({ hasText: '资料已记录，顾问会尽快与你联系。' }).waitFor({ state: 'visible' })
    assert.equal(await submit.isDisabled(), true)
    await page.screenshot({ path: path.join(out, 'quote-success.png'), fullPage: true })
    report.submission = { doctorIds: records.map(record => record.id), failureRetry: true, duplicateBlocked: true, reusedRequestId: true, realDataSent: false }
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(`${url}/dental`, { waitUntil: 'networkidle' }); await step(page, 2)
    await page.getByRole('button', { name: '查看车英林医生详情', exact: true }).click()
    await page.waitForTimeout(450)
    assert.deepEqual(await page.locator('dialog[open]').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').map(a => a.animationName)), [])
    await page.screenshot({ path: path.join(out, 'motion-settled.png') })
    await page.keyboard.press('Escape')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.getByRole('button', { name: '查看车英林医生详情', exact: true }).click()
    assert.deepEqual(await page.locator('dialog[open]').evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').map(a => a.animationName)), [])
    report.motion = { settled: true, reduced: true }
    assert.deepEqual(report.errors, []); assert.deepEqual(report.failedRequests, [])
    report.checkedAt = new Date().toISOString()
    report.dataSHA256 = await hash('src/data/dentalPhysicians.json')
    report.codeSHA256 = Object.fromEntries(await Promise.all(codeFiles.map(async file => [file, await hash(file)])))
    await fs.writeFile(path.join(out, 'behavior-qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ doctors: report.doctors.length, filters: report.filters.length, visual: report.visual, widths: report.layouts.map(row => row.width), submission: report.submission, errors: report.errors }, null, 2))
  } catch (error) {
    if (page && !page.isClosed()) await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {})
    throw error
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
