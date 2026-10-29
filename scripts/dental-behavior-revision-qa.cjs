const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..'), out = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/figma-dental-2026-10-20'))
const url = (process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174').replace(/\/$/, '') + '/dental'
const selector = id => `[data-figma-node="${id}"]`
const ids = ['231:129', '231:150', '231:167', '231:184', '231:201', '231:217', '231:235', '231:253']
const projectIds = ['implant', 'whitening', 'veneer', 'aligner', 'crown', 'periodontal', 'root-canal', 'children']
const file = { name: 'qa-dental.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6wAAAAABJRU5ErkJggg==', 'base64') }
const pause = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const settle = page => page.waitForTimeout(500)
const order = page => page.locator('[data-doctor]').evaluateAll(elements => elements.map(el => ({ id: Number(el.dataset.doctor), x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y })).sort((a, b) => Math.abs(a.y - b.y) > 1 ? a.y - b.y : a.x - b.x).map(el => el.id))
async function selectedSort(page, name) {
  const buttons = page.locator('[data-figma-node="231:472"] button[aria-pressed]')
  const states = await buttons.evaluateAll(elements => elements.map(el => ({ name: el.getAttribute('aria-label'), selected: el.getAttribute('aria-pressed') === 'true', background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el.querySelector('p')).color })))
  assert.equal(states.length, 4)
  for (const state of states) {
    assert.equal(state.selected, state.name === name)
    assert.equal(state.background, state.selected ? 'rgba(221, 107, 32, 0.1)' : 'rgba(0, 0, 0, 0)')
    assert.equal(state.color, state.selected ? 'rgb(221, 107, 32)' : 'rgb(71, 85, 105)')
  }
}
async function step(page, number) { await page.getByRole('button', { name: `${String(number).padStart(2, '0')} ${['选择牙科项目', '城市与医生匹配', '上传影像资料'][number - 1]}`, exact: true }).click(); await pause(page) }
async function screenshot(page, name) { await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true }) }
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', desktop: [], motion: {}, submission: {}, errors: [] }
  try {
    for (const [width, height] of [[1024,600], [1440,900], [1920,1080]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
      page.on('pageerror', error => report.errors.push(error.message))
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const checks = {}
      for (let index = 0; index < ids.length; index++) {
        const card = page.locator(selector(ids[index])), detail = page.locator(`#dental-details-${projectIds[index]}`)
        if (await card.getAttribute('aria-expanded') === 'false') await card.click()
        assert.equal(await card.getAttribute('aria-expanded'), 'true')
        const box = await detail.boundingBox()
        assert.ok(box.height > 0, `${ids[index]}: details did not open`)
        const cardBox = await card.boundingBox()
        assert.ok(box.y + box.height <= cardBox.y + cardBox.height + 1, `${ids[index]}: details clipped`)
      }
      assert.equal(await page.locator('.dental-live-project[aria-expanded="true"]').count(), 8)
      await screenshot(page, `all-projects-open-${width}`)
      await page.locator(selector(ids[1])).press('Enter')
      assert.equal(await page.locator(selector(ids[1])).getAttribute('aria-expanded'), 'false')
      assert.equal(await page.locator('.dental-live-project[aria-expanded="true"]').count(), 7)
      assert.equal(await page.locator('#dental-details-whitening').getAttribute('aria-hidden'), 'true')
      assert.equal(await page.locator(selector('231:165')).evaluate(el => getComputedStyle(el).transform), 'matrix(1, 0, 0, 1, 0, 0)')
      assert.equal(await page.locator(selector('231:182')).evaluate(el => getComputedStyle(el).transform), 'matrix(-1, 0, 0, -1, 0, 0)')
      checks.independentAccordions = true
      checks.keyboardAccordion = true
      checks.accordionIndicators = true
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      checks.projectFit = true
      await step(page, 2)
      assert.deepEqual(await order(page), [4,1,3,2])
      await page.getByRole('combobox', { name: '城市', exact: true }).selectOption('广州')
      assert.equal(await page.locator('[data-doctor]').count(), 4, 'filters must apply only on button click')
      await page.getByRole('button', { name: '筛选医生' }).click()
      assert.deepEqual(await order(page), [1])
      assert.match(await page.locator(selector('231:487')).innerText(), /共 1 位医生/)
      await page.getByRole('combobox', { name: '城市', exact: true }).selectOption('北京')
      await page.getByRole('combobox', { name: '价格区间' }).selectOption('¥10,000 以下')
      await page.getByRole('button', { name: '筛选医生' }).click()
      assert.equal(await page.locator('[data-doctor]').count(), 0)
      await page.getByText('暂无符合条件的医生，请调整筛选条件。', { exact: true }).waitFor({ state: 'visible' })
      checks.filterAndEmpty = true
      await page.getByRole('button', { name: '重置筛选' }).click()
      assert.deepEqual(await order(page), [4,1,3,2])
      await page.getByRole('button', { name: '价格排序', exact: true }).click()
      assert.deepEqual(await order(page), [1,3,2,4])
      assert.equal(await page.getByRole('button', { name: '价格排序', exact: true }).getAttribute('aria-pressed'), 'true')
      await selectedSort(page, '价格排序')
      await page.getByRole('button', { name: '评价最高', exact: true }).click()
      assert.deepEqual(await order(page), [4,2,3,1])
      await selectedSort(page, '评价最高')
      await page.getByRole('button', { name: '经验优先', exact: true }).click()
      assert.deepEqual(await order(page), [4,3,2,1])
      await selectedSort(page, '经验优先')
      await screenshot(page, `sorted-doctors-${width}`)
      checks.sortAndReset = true
      checks.sortPaints = true
      await page.getByRole('button', { name: '重置筛选' }).click()
      await selectedSort(page, '综合推荐')
      const opener = page.getByRole('button', { name: '查看郑雨容医生详情' })
      await opener.click()
      await page.locator('dialog[open]').waitFor({ state: 'visible' })
      await page.keyboard.press('Escape')
      await page.locator('dialog[open]').waitFor({ state: 'detached' })
      assert.ok(await opener.evaluate(el => document.activeElement === el))
      checks.doctorDialog = true
      await step(page, 3)
      const submit = page.getByRole('button', { name: '提交评估 · 24h 内获取书面报价', exact: true })
      await submit.click()
      await page.getByRole('alert').filter({ hasText: '请至少上传一份' }).waitFor({ state: 'visible' })
      await page.getByRole('combobox', { name: '预算范围' }).selectOption('¥20,000 - ¥50,000')
      await page.getByLabel('计划到访时间', { exact: true }).fill('2026-12-01')
      await page.getByLabel('其他说明', { exact: true }).fill('QA only — no patient data')
      assert.notEqual(await page.getByLabel('其他说明', { exact: true }).evaluate(el => getComputedStyle(el).color), 'rgba(0, 0, 0, 0)')
      await page.locator('input[type="file"]').setInputFiles(file)
      await page.getByRole('list', { name: '已选择的资料' }).filter({ hasText: file.name }).waitFor({ state: 'visible' })
      assert.equal(await submit.isEnabled(), true)
      await screenshot(page, `upload-ready-${width}`)
      checks.nativeFormAndValidation = true
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src)), [])
      checks.uploadFitAndAssets = true
      report.desktop.push({ width, height, checks })
      await page.close()
    }
    // Exercise the unchanged multipart contract against an isolated local stub.
    const page = await browser.newPage({ viewport: { width:1440,height:900 }, reducedMotion:'reduce' })
    page.on('pageerror', error => report.errors.push(error.message))
    let calls = 0, payloads = [], mode = 'failure', release
    await page.route('**/api/dental-assessments', async route => {
      if (route.request().method() === 'OPTIONS') { await route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'*'}}); return }
      calls++; payloads.push(route.request().postDataBuffer().toString())
      if (mode === 'failure') await route.fulfill({ status:503,headers:{'access-control-allow-origin':'*'},json:{ message:'QA 暂时不可用，请重试' } })
      else { await new Promise(resolve => { release=resolve }); await route.fulfill({status:201,headers:{'access-control-allow-origin':'*'},json:{success:true,submissionId:'qa-only',status:'submitted',createdAt:new Date().toISOString()}}) }
    })
    await page.goto(url, { waitUntil:'networkidle' })
    await step(page,3)
    const submit = page.getByRole('button', { name:'提交评估 · 24h 内获取书面报价',exact:true })
    await submit.click()
    assert.equal(calls,0)
    await page.locator('input[type="file"]').setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('QA')})
    await page.getByRole('alert').filter({hasText:'仅支持 JPG'}).waitFor({state:'visible'})
    await page.locator('input[type="file"]').setInputFiles(file)
    await page.getByRole('combobox',{name:'预算范围'}).selectOption('¥5,000 - ¥20,000')
    await page.getByLabel('计划到访时间',{exact:true}).fill('2026-12-01')
    await page.getByLabel('其他说明',{exact:true}).fill('QA contract only')
    await submit.click()
    await page.getByRole('alert').filter({hasText:'QA 暂时不可用'}).waitFor({state:'visible'})
    await screenshot(page,'upload-api-error')
    mode='success'
    await page.getByRole('button',{name:'重试提交'}).click()
    await page.getByText('正在安全上传资料…',{exact:true}).waitFor({state:'visible'})
    assert.equal(calls,2)
    assert.equal(await submit.isEnabled(),false)
    assert.equal(await page.getByRole('combobox',{name:'预算范围'}).isEnabled(),false)
    await page.waitForTimeout(150)
    assert.equal(calls,2)
    release()
    await page.getByRole('status').filter({hasText:'资料已记录，顾问会尽快与你联系。'}).waitFor({state:'visible'})
    assert.equal(await submit.isEnabled(),false)
    for(const value of ['implant','whitening','budget','visitTime','2026-12-01','QA contract only','qa-dental.png']) if(value!=='implant') assert.ok(payloads[0].includes(value),`missing multipart ${value}`)
    const requestId = payload => payload.match(/name="requestId"\r\n\r\n([^\r]+)/)?.[1]
    assert.ok(requestId(payloads[0])); assert.equal(requestId(payloads[0]),requestId(payloads[1]))
    await screenshot(page,'upload-api-success')
    report.submission={payload:true,duplicateBlocked:true,failureRetry:true,emptyBlocked:true,invalidFileBlocked:true,reusedRequestId:true,realDataSent:false,requests:calls}
    await page.close()

    const motion=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'})
    motion.on('pageerror',error=>report.errors.push(error.message))
    await motion.goto(url,{waitUntil:'networkidle'})
    await motion.evaluate(()=>document.fonts.ready)
    const card=motion.locator(selector('231:129')), detail=motion.locator('#dental-details-implant')
    await card.scrollIntoViewIfNeeded()
    const before=await motion.locator(selector('231:136')).boundingBox()
    await card.click()
    await motion.waitForTimeout(80)
    const mid=await detail.boundingBox()
    assert.ok(mid.height>0&&mid.height<160,'accordion height must interpolate')
    const after=await motion.locator(selector('231:136')).boundingBox()
    assert.ok(Math.abs(before.y-after.y)<0.25,'summary must not move during collapse or selection')
    await screenshot(motion,'accordion-mid')
    await settle(motion)
    assert.equal((await detail.boundingBox()).height,0)
    for(let index=0;index<4;index++)await card.click()
    await settle(motion)
    assert.equal(await card.getAttribute('aria-expanded'),'false')
    await motion.emulateMedia({reducedMotion:'reduce'})
    await card.click();await pause(motion)
    assert.equal((await detail.boundingBox()).height,160)
    assert.equal(await card.evaluate(el=>getComputedStyle(el).transitionDuration),'0s')
    await motion.emulateMedia({reducedMotion:'no-preference'})
    const lowerCard=motion.locator(selector('231:253'))
    await lowerCard.scrollIntoViewIfNeeded()
    await lowerCard.click();await settle(motion)
    const canvas=motion.locator('.dental-source-canvas')
    const canvasBefore=(await canvas.boundingBox()).height
    await lowerCard.click();await motion.waitForTimeout(40)
    const canvasMid=(await canvas.boundingBox()).height
    assert.ok(canvasMid<canvasBefore&&canvasMid>canvasBefore-140,'page height must interpolate rather than clamp immediately')
    await settle(motion)
    assert.ok((await canvas.boundingBox()).height<canvasMid)
    report.motion={heightInterpolation:true,canvasHeightInterpolation:true,stableSummary:true,rapidToggle:true,reducedMotion:true}
    await screenshot(motion,'accordion-settled')
    await motion.close()
    assert.deepEqual(report.errors,[])
    report.createdAt=new Date().toISOString()
    await fs.writeFile(path.join(out,'behavior-qa.json'),JSON.stringify(report,null,2)+'\n')
    console.log(JSON.stringify(report))
  } finally { await browser.close() }
}
main().catch(error=>{console.error(error);process.exitCode=1})
