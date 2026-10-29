const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const root = path.resolve(__dirname, '..')
const source = path.join(root, 'docs/figma-source/home/experts')
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/figma-2026-10-19/experts'))
const sourceImages = path.resolve(process.env.HUANYU_QA_REFERENCE || path.join(root, 'artifacts/figma-2026-10-19/experts'))
const names = ['xu-yu', 'zhou-li-li', 'liu-guang-yu', 'chen-ji-wu']
const triggers = ['1412:6419', '1414:7095', '1414:7128', '1414:7161']
const widths = (process.env.HUANYU_QA_WIDTHS || '1440,375,320,390,430,768').split(',').map(Number).filter(Number.isFinite)
const selector = id => `[data-figma-node="${id}"]`
const read = async (folder, file) => JSON.parse(await fs.readFile(path.join(source, folder, `${file}-2026-10-19.json`), 'utf8'))

async function capture(page, panel, file) {
  let box = await panel.boundingBox()
  let viewport = page.viewportSize()
  if (Math.abs(box.y - Math.round(box.y)) > .01 && Math.abs(box.height - Math.round(box.height)) < .01) {
    await page.setViewportSize({ ...viewport, height: viewport.height + 1 })
    box = await panel.boundingBox()
    viewport = page.viewportSize()
  }
  if (box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height) {
    await sharp(await page.screenshot()).extract({ left: Math.round(box.x * 2), top: Math.round(box.y * 2), width: Math.round(box.width * 2), height: Math.round(box.height * 2) }).png().toFile(file)
  } else await panel.screenshot({ path: file })
  return box
}

async function compare(folder, model, local) {
  const inventory = await read(folder, 'native-inventory')
  const parameters = await read(folder, 'native-parameters')
  const p = parameters.nodes.find(node => node.nodeId === model.panel)
  const frame = parameters.nodes.find(node => node.nodeId === inventory.sourceFrame)
  const sourceWidth = Math.round(frame.parameters.size.x * 2)
  const png = path.join(sourceImages, `${folder}-figma.png`)
  const metadata = await sharp(png).metadata()
  const normalized = metadata.width === sourceWidth ? png : await sharp(png).resize({ width: sourceWidth }).png().toBuffer()
  const ref = await sharp(normalized).extract({ left: Math.round(p.framePosition.x * 2), top: Math.round(p.framePosition.y * 2), width: Math.round(model.width * 2), height: Math.round(model.height * 2) }).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const actual = await sharp(local).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(actual.info, ref.info, `${folder}: comparison geometry`)
  let sum = 0, changed = 0
  for (let i = 0; i < ref.data.length; i += 3) {
    const delta = [0, 1, 2].map(channel => Math.abs(ref.data[i + channel] - actual.data[i + channel]))
    sum += delta[0] + delta[1] + delta[2]
    if (Math.max(...delta) > 16) changed++
  }
  const refFile = path.join(output, `${folder}-panel-figma.png`)
  await sharp(ref.data, { raw: ref.info }).png().toFile(refFile)
  const rgba = await Promise.all([refFile, local].map(file => sharp(file).ensureAlpha().raw().toBuffer()))
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const changedPixels = pixelmatch(rgba[0], rgba[1], null, ref.info.width, ref.info.height, { threshold: .15, includeAA: false })
  const referencePreview = await sharp(refFile).resize({ width: model.width }).png().toBuffer()
  const actualPreview = await sharp(local).resize({ width: model.width }).png().toBuffer()
  await sharp({ create: { width: model.width * 2, height: model.height, channels: 3, background: '#fff' } }).composite([{ input: referencePreview, left: 0, top: 0 }, { input: actualPreview, left: model.width, top: 0 }]).png().toFile(path.join(output, `${folder}-comparison.png`))
  return { nMAE: 100 * sum / ref.data.length / 255, pixelmatchPercent: 100 * changedPixels / (ref.info.width * ref.info.height), changedPixelsOver16: 100 * changed / (ref.data.length / 3), reference: png, panelReference: refFile, local }
}

async function main() {
  await fs.mkdir(output, { recursive: true })
  const records = JSON.parse(await fs.readFile(path.join(source, 'dialog-sources-2026-10-19.json'), 'utf8')).records
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const results = [], errors = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174/', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    for (const width of widths) {
      for (const [expert, name] of names.entries()) {
        // Desktop exposes all four experts; the authored mobile homepage has
        // only the first two. Resizing an open dialog tests all four sources.
        const phoneTrigger = ['1528:663', '1528:695'][expert]
        const directPhone = width <= 700 && Boolean(phoneTrigger)
        const triggerId = directPhone ? phoneTrigger : triggers[expert]
        await page.setViewportSize({ width: directPhone ? width : 1440, height: 1200 })
        await page.locator(selector(triggerId)).click()
        await page.setViewportSize({ width, height: 1200 })
        const initial = records[`${name}${width <= 700 ? '-mobile' : ''}-01`]
        for (let tab = 0; tab < initial.tabs.length; tab++) {
          if (tab) await page.getByRole('tab').nth(tab).click()
          await page.evaluate(() => document.fonts.ready)
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
          const folder = `${name}${width <= 700 ? '-mobile' : ''}-0${tab + 1}`
          const model = records[folder]
          const panel = page.locator(`dialog ${selector(model.panel)}`)
          const local = path.join(output, `${folder}-${width}-local.png`)
          const box = await capture(page, panel, local)
          const overflow = await page.locator('.expert-source-dialog').evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth, height: el.clientHeight, scrollHeight: el.scrollHeight }))
          const nodes = await read(folder, 'node-to-code')
          const missingOwners = await page.evaluate(items => items.filter(item => !document.querySelector(item.selector)).map(item => item.nodeId), nodes.nodes.filter(node => node.rendered))
          const diff = width === 1440 || width === 375 ? await compare(folder, model, local) : null
          const selected = await page.getByRole('tab', { selected: true }).count()
          results.push({ width, expert: name, tab: tab + 1, box, overflow, diff, selected, missingOwners })
          console.log(JSON.stringify({ width, expert: name, tab: tab + 1, diff: diff?.nMAE, overflow }))
        }
        const before = await page.evaluate(() => scrollY)
        await page.getByRole('tab').first().focus()
        await page.keyboard.press('End')
        assert.equal(await page.getByRole('tab').last().getAttribute('aria-selected'), 'true')
        await page.keyboard.press('Home')
        assert.equal(await page.getByRole('tab').first().getAttribute('aria-selected'), 'true')
        for (let i = 0; i < 8; i++) {
          await page.keyboard.press('Tab')
          assert.ok(await page.locator('dialog').evaluate(el => el.contains(document.activeElement)), 'Focus escaped modal')
        }
        await page.keyboard.press('Escape')
        assert.equal(await page.locator('dialog[open]').count(), 0)
        if (directPhone || width > 700) assert.equal(await page.locator(selector(triggerId)).evaluate(el => document.activeElement === el), true)
        assert.equal(await page.evaluate(() => scrollY), before)
      }
    }
    let smallScreen = null
    if (widths.some(width => width <= 700)) {
      await page.setViewportSize({ width: 1440, height: 1200 })
      await page.locator(selector(triggers[2])).click()
      await page.setViewportSize({ width: 375, height: 568 })
      await page.getByRole('tab').nth(1).click()
      const alternate = records['liu-guang-yu-mobile-02-alternate']
      const scroller = page.locator(selector('1650:2345'))
      const headerBefore = await page.locator(selector('1648:2322')).boundingBox()
      assert.equal(await scroller.evaluate(el => el.scrollTop), 0)
      await scroller.evaluate(el => el.scrollTo({ top: 40, behavior: 'instant' }))
      assert.equal(await scroller.evaluate(el => el.scrollTop), 40)
      assert.deepEqual(await page.locator(selector('1648:2322')).boundingBox(), headerBefore, 'The profile header moved with its long list')
      const alternateFile = path.join(output, 'liu-guang-yu-mobile-02-alternate-375-local.png')
      const alternateBox = await capture(page, page.locator(selector(alternate.panel)), alternateFile)
      const alternateDiff = await compare('liu-guang-yu-mobile-02-alternate', alternate, alternateFile)
      smallScreen = { folder: alternate.name, width: 375, height: 568, box: alternateBox, scrollTop: await scroller.evaluate(el => el.scrollTop), headerFixed: true, diff: alternateDiff }
      await page.getByRole('button', { name: '关闭专家详情', exact: true }).click()
    }
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.locator(selector(triggers[0])).click()
    const buttonY = await page.evaluate(() => scrollY)
    await page.getByRole('button', { name: '关闭专家详情', exact: true }).click()
    assert.equal(await page.locator('dialog[open]').count(), 0)
    assert.equal(await page.evaluate(() => scrollY), buttonY)
    assert.ok(await page.locator(selector(triggers[0])).evaluate(el => document.activeElement === el))
    await page.locator(selector(triggers[0])).click()
    const y = await page.evaluate(() => scrollY)
    await page.mouse.click(8, 8)
    assert.equal(await page.locator('dialog[open]').count(), 0)
    assert.equal(await page.evaluate(() => scrollY), y)
    const summary = { createdAt: new Date().toISOString(), pixelmatchOptions: { threshold: .15, includeAA: false }, metric: 'Panel-only nMAE = sum absolute RGB differences / (255 × RGB sample count); native DPR2, Figma mobile 3x normalized to DPR2; geometry read from source parameters', results, smallScreen, closePaths: { escape: true, button: true, backdrop: true, focusTrap: true, focusRestore: true, scrollRestore: true }, errors }
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify(summary, null, 2) + '\n')
    assert.deepEqual(errors, [])
    assert.ok(results.every(result => result.selected === 1 && !result.missingOwners.length && result.overflow.scrollWidth <= result.overflow.width + 1 && (!result.diff || result.diff.nMAE < 1 && result.diff.pixelmatchPercent < 1)) && (!smallScreen || (smallScreen.diff.nMAE < 1 && smallScreen.headerFixed && smallScreen.scrollTop === 40)), 'Expert visual/overflow verification failed; see the configured QA output directory')
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
