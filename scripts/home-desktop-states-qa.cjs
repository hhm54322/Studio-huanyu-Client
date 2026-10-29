const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const root = path.resolve(__dirname, '..')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174/'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/figma-regression-2026-10-23/home/development/states')
const references = path.resolve(process.env.HUANYU_QA_REFERENCE || 'artifacts/figma-regression-2026-10-23/home')
const source = path.join(root, 'docs/figma-source/home')
const selector = id => `[data-figma-node="${id}"]`
const json = async file => JSON.parse(await fs.readFile(file, 'utf8'))

async function compare(label, sourceImage, crop, actual) {
  const meta = await sharp(sourceImage).metadata()
  assert.equal(meta.width, 2880, `${label}: expected an actual native 2x Figma export`)
  const reference = path.join(output, `${label}-figma.png`)
  await sharp(sourceImage).extract({ left: crop.x * 2, top: crop.y * 2, width: crop.width * 2, height: crop.height * 2 }).flatten({ background: '#fff' }).png().toFile(reference)
  const [a, b] = await Promise.all([reference, actual].map(image => sharp(image).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })))
  assert.deepEqual(a.info, b.info, `${label}: source dimensions must match without resampling`)
  let difference = 0
  for (let i = 0; i < a.data.length; i++) difference += Math.abs(a.data[i] - b.data[i])
  const rgba = await Promise.all([reference, actual].map(image => sharp(image).ensureAlpha().raw().toBuffer()))
  const pixelmatch = (await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const diffFile = path.join(output, `${label}-diff.png`)
  const diff = Buffer.alloc(a.info.width * a.info.height * 4)
  const count = pixelmatch(rgba[0], rgba[1], diff, a.info.width, a.info.height, { threshold: .15, includeAA: false })
  await sharp(diff, { raw: { width: a.info.width, height: a.info.height, channels: 4 } }).png().toFile(diffFile)
  const previewWidth = Math.min(crop.width, 960)
  const previewHeight = Math.round(crop.height * previewWidth / crop.width)
  await sharp({ create: { width: previewWidth * 2, height: previewHeight, channels: 3, background: '#fff' } }).composite(await Promise.all([reference, actual].map(async (file, index) => ({ input: await sharp(file).resize({ width: previewWidth }).png().toBuffer(), left: index * previewWidth, top: 0 })))).png().toFile(path.join(output, `${label}-comparison.png`))
  return { label, sourceImage, crop, reference, local: actual, diff: diffFile, nMAE: 100 * difference / a.data.length / 255, pixelmatchPercent: 100 * count / (a.info.width * a.info.height) }
}

async function capture(page, locator, crop, file) {
  const origin = await locator.evaluate(el => el.getBoundingClientRect().top + scrollY)
  await page.evaluate(y => scrollTo({ top: Math.floor(y), behavior: 'instant' }), origin)
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const box = await locator.boundingBox()
  assert.ok(box)
  const image = await page.screenshot({ animations: 'disabled' })
  await sharp(image).extract({ left: Math.round((box.x + crop.x) * 2), top: Math.round((box.y + crop.y) * 2), width: crop.width * 2, height: crop.height * 2 }).png().toFile(file)
  return box
}

async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const results = [], errors = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1700 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.mouse.move(0, 0)
    // Header and assistant overlays are independently verified against the
    // full homepage. Supplemental Hero frames do not contain those overlays.
    await page.addStyleTag({ content: '.patient-header,.patient-header *,.consult-float,.consult-float *,.home-source-hero__assistant,.home-source-hero__assistant *{visibility:hidden!important}' })
    const hero = page.locator('.home-source-hero')
    for (let state = 1; state <= 3; state++) {
      await hero.press('ArrowRight')
      assert.equal(await hero.getAttribute('data-hero-state'), String(state))
      const local = path.join(output, `hero-0${state}-local.png`)
      await capture(page, hero, { x: 0, y: 0, width: 1440, height: 754 }, local)
      const current = path.join(references, `hero-0${state}-figma.png`)
      const reference = await fs.access(current).then(() => current, () => `/Users/hhm/Downloads/banner-0${state}.png`)
      results.push(await compare(`hero-0${state}`, reference, { x: 0, y: 0, width: 1440, height: 754 }, local))
    }
    const journey = (await json(path.join(source, 'journey-states/source-tree-2026-10-19.json'))).root
    for (const [index, id] of ['1401:18', '1401:281', '1401:49'].entries()) {
      const node = journey.children.find(node => node.id === id)
      if(id==='1401:281') await page.locator(selector('1401:297')).click()
      const label = `journey-0${index + 2}`
      const local = path.join(output, `${label}-local.png`)
      const box = await capture(page, page.locator(`#process-stage-0${index + 2}`), { x: 526, y: 0, width: 802, height: node.height }, local)
      assert.equal(box.width, node.width)
      assert.equal(box.height, node.height)
      // The customer explicitly requests a single page-sticky rail. Its
      // scroll position is behavior, not the repeated source's static rail.
      results.push({ ...(await compare(label, path.join(references, 'journey-states-figma.png'), { x: 526, y: node.y, width: 802, height: node.height }, local)), sourceNode: id, comparisonScope: 'Complete right-hand content; single sticky rail verified separately' })
    }
    const strength = page.locator('.home-strength-source')
    for (let state = 1; state <= 3; state++) {
      if (state > 1) await strength.press('ArrowRight')
      assert.equal(await strength.getAttribute('data-strength-state'), String(state))
      const local = path.join(output, `strength-0${state}-local.png`)
      await capture(page, strength, { x: 0, y: 0, width: 1440, height: 834 }, local)
      const reference = state === 1 ? path.join(references, 'home-figma.png') : path.join(references, `strength-0${state}-figma.png`)
      const main = (await json(path.join(source, 'native-parameters-2026-10-19.json'))).nodes.find(n => n.nodeId === '1442:343')
      results.push(await compare(`strength-0${state}`, reference, { x: 0, y: state === 1 ? main.framePosition.y : 0, width: 1440, height: 834 }, local))
    }
    const first = page.locator(selector('1401:297')), second = page.locator(selector('1401:307'))
    if(await first.getAttribute('aria-expanded')!=='true') await first.click()
    await second.click()
    assert.equal(await first.getAttribute('aria-expanded'), 'true')
    assert.equal(await second.getAttribute('aria-expanded'), 'true')
    await first.click()
    assert.equal(await second.getAttribute('aria-expanded'), 'true')
    assert.equal(await first.getAttribute('aria-expanded'), 'false')
    assert.equal(await page.locator(selector('1401:274')).getAttribute('href'), '/cases')
    assert.equal(await page.locator(selector('1401:269')).getAttribute('href'), '/diseases-technologies')
    const geometry = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, brokenImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src) }))
    await page.screenshot({ path: path.join(output, 'faq-independent.png') })
    const summary = { createdAt: new Date().toISOString(), base, pixelmatchOptions: { threshold: .15, includeAA: false }, mobile: 'Deferred by user', results, geometry, independentFaq: true, routeChecks: true, errors }
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify(summary, null, 2) + '\n')
    console.log(JSON.stringify(summary, null, 2))
    assert.deepEqual(errors, [])
    assert.deepEqual(geometry, { width: 1440, scrollWidth: 1440, brokenImages: [] })
    assert.ok(results.every(row => row.nMAE < 1 && row.pixelmatchPercent < 1), 'State visual mismatch; see native reference/local/difference images')
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
