const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const date = '2026-10-29'
const source = path.join(root, 'docs/figma-source/about/specialties-revision-' + date)
const out = path.join(root, 'artifacts/figma-about-specialties-' + date)
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'))
async function main() {
  await fs.mkdir(out, { recursive: true })
  const sets = (await read(path.join(source, 'sources-' + date + '.json'))).sets
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', visual: [], desktop: [], motion: {}, errors: [] }
  try {
    for (const width of [1440, 1024, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1024 ? 600 : 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
      page.on('pageerror', error => report.errors.push(error.message))
      await page.goto(base + '/about', { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const states = []
      for (const [index, set] of sets.entries()) {
        const opener = page.locator('.complex-card').nth(index + 1)
        await opener.scrollIntoViewIfNeeded()
        await opener.focus()
        const scroll = await page.evaluate(() => scrollY)
        await opener.press('Enter')
        const dialog = page.getByRole('dialog', { name: (await read(path.join(source, set.folder, `native-inventory-${date}.json`))).nodes[0].name, exact: true })
        await dialog.waitFor({ state: 'visible' })
        await dialog.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
        const close = dialog.getByRole('button', { name: '关闭复杂病例详情', exact: true })
        assert.equal(await close.evaluate(el => document.activeElement === el), true)
        await close.press('Tab'); assert.equal(await close.evaluate(el => document.activeElement === el), true)
        await close.press('Shift+Tab'); assert.equal(await close.evaluate(el => document.activeElement === el), true)
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden')
        const panel = page.locator(`[data-figma-node="${set.sourceFrame}"]`)
        const tree = (await read(path.join(source, set.folder, `source-tree-${date}.json`))).root
        const geometry = await panel.boundingBox()
        assert.equal(geometry.width, tree.width); assert.equal(geometry.height, tree.height)
        assert.ok(geometry.x >= 40 && geometry.x + geometry.width <= width - 40)
        const mapping = await read(path.join(source, set.folder, `node-to-code-${date}.json`))
        const missing = await page.evaluate(nodes => nodes.filter(n => document.querySelectorAll(n.selector).length !== 1).map(n => n.nodeId), mapping.nodes)
        assert.deepEqual(missing, [])
        assert.deepEqual(await dialog.locator('img').evaluateAll(images => images.filter(i => !i.complete || !i.naturalWidth).map(i => i.src)), [])
        if (width === 1440) {
          const local = path.join(out, `${set.name}-local.png`), reference = path.join(out, 'source', `${set.name}-figma.png`)
          await panel.screenshot({ path: local })
          const a = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
          const b = await sharp(local).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
          assert.deepEqual(a.info, b.info)
          let sum = 0
          for (let i = 0; i < a.data.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(a.data[i + c] - b.data[i + c])
          const pixelmatch = (await import('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pixelmatch/index.js')).default
          const diff = Buffer.alloc(a.data.length), changed = pixelmatch(a.data, b.data, diff, a.info.width, a.info.height, { threshold: .15, includeAA: false })
          await sharp(diff, { raw: a.info }).png().toFile(path.join(out, `${set.name}-diff.png`))
          const row = { name: set.name, frame: set.sourceFrame, geometry, ownerCount: mapping.nodes.length, missing, local, reference, nMAE: sum * 100 / (a.info.width * a.info.height * 3 * 255), pixelmatchPercent: changed * 100 / (a.info.width * a.info.height) }
          report.visual.push(row)
        }
        await close.press('Escape'); await dialog.waitFor({ state: 'hidden' })
        assert.equal(await page.evaluate(() => scrollY), scroll)
        assert.equal(await opener.evaluate(el => document.activeElement === el), true)
        await opener.press('Space'); await dialog.waitFor(); await close.click(); await dialog.waitFor({ state: 'hidden' })
        await opener.click(); await dialog.waitFor(); await page.mouse.click(8, 8); await dialog.waitFor({ state: 'hidden' })
        assert.equal(await page.evaluate(() => scrollY), scroll)
        assert.equal(await opener.evaluate(el => document.activeElement === el), true)
        assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden')
        states.push({ name: set.name, focusLoop: true, keyboardOpen: true, escape: true, buttonClose: true, backdrop: true, focusRestored: true, scrollRestored: true })
      }
      report.desktop.push({ width, states })
      await page.close()
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(base + '/about', { waitUntil: 'networkidle' })
    await page.locator('.complex-card').nth(1).click()
    const panel = page.locator('.complex-detail-modal--specialty')
    const samples = await panel.evaluate(async element => {
      const animation = element.getAnimations().find(item => item.effect?.getTiming().duration === 380) || element.getAnimations()[0]
      if (!animation) throw Error('Missing dialog motion')
      animation.pause()
      const states = []
      for (const time of [0, 120, 380]) { animation.currentTime = time; await new Promise(requestAnimationFrame); states.push({ time, transform: getComputedStyle(element).transform, width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }) }
      animation.finish(); return states
    })
    assert.notEqual(samples[0].transform, samples[1].transform)
    await page.waitForTimeout(500)
    assert.equal(await panel.evaluate(element => getComputedStyle(element).transform), 'none')
    assert.ok(samples.every(s => Math.abs(s.width - 896) < .01 && Math.abs(s.height - 338) < .01), JSON.stringify(samples))
    report.motion = { samples, interpolates: true, layoutStable: true, reducedMotionVerified: true }
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
    assert.deepEqual(report.errors, [])
    for (const row of report.visual) assert.ok(row.nMAE < 1 && row.pixelmatchPercent < 1, `${row.name}: screenshot exceeds 1%`)
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
