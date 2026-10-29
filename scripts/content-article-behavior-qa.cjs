const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/figma-content-2026-10-21'))
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
const name = process.env.HUANYU_QA_SOURCE || 'toolkit'
assert.equal(name, 'toolkit', 'Trust is a native dialog; use trust-article-revision-qa.cjs')
const route = '/steps/toolkit-detail'
const node = id => `[data-figma-node="${id}"]`
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', name, desktop: [], motion: {}, errors: [] }
  try {
    for (const width of [1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1024 ? 600 : 900 }, reducedMotion: 'reduce' })
      page.on('pageerror', e => report.errors.push(e.message))
      await page.goto(base + route, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      const checks = {}
      const geo = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).length }))
      assert.equal(geo.width, width); assert.equal(geo.broken, 0); checks.fits = true
      const back = page.getByRole('link', { name: '返回信任与常见问题', exact: true })
      await back.focus(); await back.press('Enter'); await page.waitForURL('**/trust'); checks.keyboardReturn = true
      await page.goBack(); await page.waitForURL('**' + route)
      if (name === 'toolkit') {
        const body = await page.locator(node('143:3081')).innerText()
        assert.ok(!body.includes('**规整')); assert.ok(body.includes('全球患者可安心。四、'))
        checks.copyTyposCorrected = true
        assert.equal(await page.getByRole('link', { name: '来华就医可行性评估', exact: true }).getAttribute('href'), '/steps/toolkit-detail?article=assessment')
        assert.equal(await page.getByRole('link', { name: '签证申请清单', exact: true }).getAttribute('href'), '/steps/toolkit-detail?article=visa')
        assert.equal(await page.getByRole('link', { name: '药品入境规定', exact: true }).getAttribute('href'), '/steps/toolkit-detail?article=medication-entry')
        assert.equal(await page.getByRole('link', { name: '家属陪同攻略', exact: true }).getAttribute('href'), '/steps/toolkit-detail?article=companions')
        assert.equal(await page.getByRole('link', { name: '穆斯林患者实操手册', exact: true }).getAttribute('href'), '/steps/toolkit-detail?article=muslim')
        assert.equal(await page.getByRole('link', { name: '就医步骤与就诊流程', exact: true }).getAttribute('href'), '/steps/toolkit-detail?article=steps-flow')
        for (const id of ['143:3095', '143:3115']) {
          assert.equal(await page.locator(node(id)).getAttribute('aria-disabled'), 'true')
          const before = page.url(); await page.locator(node(id)).click(); assert.equal(page.url(), before)
        }
        checks.noFakeAnchors = true
        const scale = Math.min(1, width / 1440)
        const start = await page.locator(node('143:3082')).boundingBox()
        assert.ok(Math.abs(start.y - 112 * scale) < 1)
        await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 500) })
        await page.waitForTimeout(100)
        let mid = await page.locator(node('143:3082')).boundingBox()
        assert.ok(Math.abs(mid.y - 24) < 1, `Sticky top ${mid.y}`)
        await page.evaluate(() => scrollTo(0, 1000)); await page.waitForTimeout(100)
        mid = await page.locator(node('143:3082')).boundingBox(); assert.ok(Math.abs(mid.y - 24) < 1)
        await page.screenshot({ path: path.join(out, `${name}-${width}-sticky.png`) })
        await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(100)
        const last = await page.locator(node('143:3082')).boundingBox()
        const content = await page.locator(node('143:3061')).boundingBox()
        assert.ok(last.y + last.height <= content.y + content.height + 1)
        checks.stickyBoundary = true
        await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(100)
        const restored = await page.locator(node('143:3082')).boundingBox()
        assert.ok(Math.abs(restored.y - start.y) < 1); checks.scrollRestores = true
      }
      const mail = page.getByRole('link', { name: 'contact@huanyuyunyi.com', exact: true })
      if (await mail.count()) assert.equal(await mail.getAttribute('href'), 'mailto:contact@huanyuyunyi.com')
      checks.contactLinks = true
      const consult = page.getByRole('button', { name: '问阿宁', exact: true })
      if (await consult.count()) {
        await page.evaluate(() => scrollTo(0, 0)); await consult.click()
        await page.locator('.consult-panel').waitFor({ state: 'visible' })
        await page.getByRole('dialog').getByRole('button', { name: '关闭', exact: true }).click()
        await page.locator('.consult-panel').waitFor({ state: 'hidden' })
      }
      checks.consultation = true
      const reduced = await page.locator('[data-content-entry]').evaluate(el => {
        const style = getComputedStyle(el)
        return { name: style.animationName, opacity: style.opacity, transform: style.transform }
      })
      assert.equal(reduced.name, 'none'); assert.equal(reduced.opacity, '1'); assert.equal(reduced.transform, 'none')
      checks.reducedMotion = true
      await page.screenshot({ path: path.join(out, `${name}-${width}-settled.png`), fullPage: true })
      report.desktop.push({ width, checks })
      await page.close()
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
    await page.goto(base + route, { waitUntil: 'networkidle' })
    const entry = page.locator('[data-content-entry]')
    const states = await entry.evaluate(async el => {
      const animation = el.getAnimations()[0]
      if (!animation) throw Error('Entry animation missing')
      animation.pause()
      const result = []
      for (const time of [0, 200, 620]) { animation.currentTime = time; await new Promise(requestAnimationFrame); result.push({ opacity: Number(getComputedStyle(el).opacity), transform: getComputedStyle(el).transform }) }
      animation.finish()
      return result
    })
    assert.equal(states[0].opacity, 0); assert.ok(states[1].opacity > 0 && states[1].opacity < 1); assert.equal(states[2].opacity, 1)
    report.motion = { entryInterpolates: true, settledLayoutRestored: states[2].transform === 'matrix(1, 0, 0, 1, 0, 0)', reducedMotionVerified: true }
    await page.screenshot({ path: path.join(out, `${name}-motion-settled.png`) })
    await page.close()
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(out, `${name}-behavior-qa.json`), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
    assert.deepEqual(report.errors, [])
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
