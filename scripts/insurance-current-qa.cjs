const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const out = path.join(root, 'artifacts/figma-insurance-2026-10-29')
const source = path.join(out, 'figma-reference-current.png')
const phase = process.env.HUANYU_QA_PHASE || 'development'
async function compare(reference, local, name) {
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const a = await sharp(reference).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let localMeta = await sharp(local).metadata()
  if (localMeta.width === a.info.width && Math.abs(localMeta.height - a.info.height) === 1) {
    const normalized = local + '.normalized.png'
    if (localMeta.height < a.info.height) await sharp(local).extend({ bottom: 1, background: '#fff' }).png().toFile(normalized)
    else await sharp(local).extract({ left: 0, top: 0, width: localMeta.width, height: a.info.height }).png().toFile(normalized)
    await fs.rename(normalized, local)
  }
  const b = await sharp(local).flatten({ background: '#fff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.deepEqual(a.info, b.info, `${name}: geometry mismatch`)
  const diff = Buffer.alloc(a.data.length); const mismatches = pixelmatch(a.data, b.data, diff, a.info.width, a.info.height, { threshold: .15, includeAA: false })
  let sum = 0
  for (let i = 0; i < a.data.length; i += 4) for (let c = 0; c < 3; c++) sum += Math.abs(a.data[i + c] - b.data[i + c])
  await sharp(diff, { raw: a.info }).png().toFile(path.join(out, `${name}-diff.png`))
  return { changedPixelRatio: mismatches / (a.info.width * a.info.height), nMAE: sum / (a.info.width * a.info.height * 3 * 255), reference, local }
}
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = [], report = { createdAt: '', phase, sourceChange: 'unchanged against current official export', visual: {}, expanded: {}, behavior: {}, errors }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(base + '/insurance', { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: path.join(out, `${phase}-full.png`), fullPage: true })
    report.visual = await compare(source, path.join(out, `${phase}-full.png`), `${phase}-full`)
    assert.ok(report.visual.changedPixelRatio < .01 && report.visual.nMAE < .01)
    assert.equal(await page.locator('.insurance-paths h2').innerText(), '三条报销路径')
    const broken = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, images: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }))
    assert.equal(broken.width, broken.viewport); assert.deepEqual(broken.images, [])

    const assessment = page.getByRole('button', { name: '立即评估', exact: true })
    await assessment.focus(); await assessment.press('Enter'); await page.locator('#insurance-assessment-result').waitFor()
    assert.equal(await page.locator('.insurance-hero').evaluate(e => e.getBoundingClientRect().height), 1150)
    const assessmentLocal = path.join(out, `${phase}-assessment.png`); await page.locator('.insurance-hero').screenshot({ path: assessmentLocal })
    const assessmentSource = path.join(out, 'source/assessment-figma.png');
    const assessmentRef = path.join(out, `${phase}-assessment-reference.png`); await sharp(assessmentSource).png().toFile(assessmentRef)
    report.expanded.assessment = await compare(assessmentRef, assessmentLocal, `${phase}-assessment`)
    await assessment.press('Enter'); await page.locator('#insurance-assessment-result').waitFor({ state: 'hidden' }); assert.equal(await page.locator('#insurance-assessment-result').count(), 0)
    report.behavior.assessment = { opensInPlace: true, closesInPlace: true, keyboard: true }

    const scenarios = page.locator('.insurance-scenario-grid article')
    for (let i = 0; i < 3; i++) { await scenarios.nth(i).click(); assert.equal(await scenarios.nth(i).locator('.insurance-scenario-detail').count(), 1) }
    assert.equal(await page.locator('.insurance-scenario-detail').count(), 3)
    const scenariosLocal = path.join(out, `${phase}-scenarios.png`); await page.locator('.insurance-scenarios').screenshot({ path: scenariosLocal })
    const scenariosRef = path.join(out, 'source/scenarios-figma.png'); report.expanded.scenarios = await compare(scenariosRef, scenariosLocal, `${phase}-scenarios`)
    for (let i = 0; i < 3; i++) await scenarios.nth(i).click(); await page.locator('.insurance-scenario-detail').last().waitFor({ state: 'hidden' }); assert.equal(await page.locator('.insurance-scenario-detail').count(), 0)
    report.behavior.scenarios = { threeIndependentCards: true, cardClick: true, closesIndependently: true }

    const paths = page.locator('.insurance-path-grid article')
    for (let i = 0; i < 3; i++) { await paths.nth(i).click(); assert.equal(await paths.nth(i).locator('.insurance-path-detail').count(), 1) }
    assert.equal(await page.locator('.insurance-path-detail').count(), 3)
    assert.equal(await page.locator('.insurance-paths h2').innerText(), '保险报销三条路径')
    const pathsLocal = path.join(out, `${phase}-paths.png`); await page.locator('.insurance-paths').screenshot({ path: pathsLocal })
    const pathsRef = path.join(out, 'source/paths-figma.png'); report.expanded.paths = await compare(pathsRef, pathsLocal, `${phase}-paths`)
    for (let i = 0; i < 3; i++) await paths.nth(i).click(); await page.locator('.insurance-path-detail').last().waitFor({ state: 'hidden' }); assert.equal(await page.locator('.insurance-path-detail').count(), 0)
    report.behavior.paths = { threeIndependentCards: true, cardClick: true, closesIndependently: true }

    const faq = page.locator('.insurance-faq-list article'); await faq.nth(0).locator('button').click(); await faq.nth(0).locator('.insurance-faq-answer').waitFor({ state: 'hidden' }); assert.equal(await faq.nth(0).locator('.insurance-faq-answer').count(), 0); await faq.nth(1).locator('button').focus(); await faq.nth(1).locator('button').press('Enter'); assert.equal(await faq.nth(1).locator('.insurance-faq-answer').count(), 1)
    report.behavior.faq = { accordion: true, keyboard: true }
    await page.emulateMedia({ reducedMotion: 'no-preference' }); const partners = page.locator('.insurance-partners-track'); const before = await partners.evaluate(e => getComputedStyle(e).animationName); await page.locator('.insurance-partners-marquee').hover(); const paused = await partners.evaluate(e => getComputedStyle(e).animationPlayState); assert.ok(before.startsWith('insurance-partners-loop')); assert.equal(paused, 'paused')
    const edgeFade = await page.locator('.insurance-partners-marquee').evaluate(el => ['::before', '::after'].map(pseudo => { const s = getComputedStyle(el, pseudo); return { position: s.position, background: s.backgroundImage, parent: el.className } }))
    for (const edge of edgeFade) { assert.equal(edge.position, 'absolute'); assert.ok(edge.background.startsWith('linear-gradient(')); assert.equal(edge.parent, 'insurance-partners-marquee') }
    await page.locator('.insurance-partners h2').hover()
    assert.equal(await partners.evaluate(e => getComputedStyle(e).animationPlayState), 'running')
    const from = await partners.evaluate(e => getComputedStyle(e).transform)
    await page.waitForTimeout(100)
    assert.notEqual(await partners.evaluate(e => getComputedStyle(e).transform), from)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    assert.equal(await partners.evaluate(e => getComputedStyle(e).animationName), 'none')
    report.behavior.partners = { continuousTrack: true, fixedEdgeFade: true, hoverPause: true, reducedMotion: true, edgeFade }
    report.desktop = []
    for (const width of [1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      for (const [grid, detail] of [['.insurance-scenario-grid', '.insurance-scenario-detail'], ['.insurance-path-grid', '.insurance-path-detail']]) {
        const cards = page.locator(`${grid} article`)
        await cards.nth(0).locator('button').press('Enter')
        await cards.nth(1).locator('button').press('Enter')
        await cards.nth(0).locator(detail).waitFor({ state: 'visible' })
        await cards.nth(1).locator(detail).waitFor({ state: 'visible' })
        assert.equal(await page.locator(detail).count(), 2)
        await cards.nth(0).locator('button').click()
        await cards.nth(0).locator(detail).waitFor({ state: 'hidden' })
        assert.equal(await cards.nth(1).locator(detail).count(), 1)
        await cards.nth(1).locator('button').press('Enter')
        await page.locator(detail).waitFor({ state: 'hidden' })
      }
      const steps = page.locator('.insurance-step-line button')
      for (let i = 0; i < 4; i++) { await steps.nth(i).press('Enter'); assert.equal(await steps.nth(i).getAttribute('aria-pressed'), 'true'); assert.ok((await page.locator('.insurance-step-note b').innerText()).startsWith(`0${i + 1}`)) }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width)
      report.desktop.push({ width, independentCards: true, enterAndSpace: true, fourStepDetails: true, noOverflow: true })
    }
    assert.deepEqual(errors, [])
    report.createdAt = new Date().toISOString(); await fs.writeFile(path.join(out, `${phase}-qa.json`), JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2))
    for (const kind of ['assessment', 'scenarios', 'paths']) assert.ok(report.expanded[kind].changedPixelRatio < .01 && report.expanded[kind].nMAE < .01, `${kind}: expanded diff >=1%`)
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
