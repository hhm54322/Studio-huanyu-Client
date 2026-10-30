const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const base = (process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174').replace(/\/$/, '')
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/hero-full-bleed-2026-10-30/development')
const routes = [
  { route: '/', hero: '.home-source-hero', media: '.home-source-hero [data-figma-node="1523:37"],.home-source-hero [data-figma-node="143:1194"],.home-source-hero [data-figma-node="143:1226"],.home-source-hero [data-figma-node="143:1255"]' },
  { route: '/why-china', hero: '.why-hero', media: '.why-hero__visual' },
  { route: '/trust', hero: '[data-figma-node="143:2531"]', media: '[data-figma-node="143:2531"]' },
  { route: '/insurance', hero: '.insurance-hero', media: '.insurance-hero__backdrop' },
  { route: '/hospitals', hero: '[data-figma-node="144:4710"]', media: '[data-figma-node="144:4710"]' },
  { route: '/doctors', hero: '[data-figma-node="1689:4817"]', media: '[data-figma-node="1689:4817"]' },
  { route: '/cases', hero: '.case-hero', media: '.case-hero', pseudo: '::before' },
  { route: '/dental', hero: '.dental-source-canvas [data-figma-name="Section"]', media: '.dental-source-canvas [data-figma-name="Section"]' },
  { route: '/diseases-technologies', hero: '.disease-hero', media: '.disease-hero' },
  { route: '/steps', hero: '.hy-page-hero', media: '.hy-page-hero__media' },
  { route: '/about', hero: '.about-hero', media: '.about-hero' },
  // Form/article routes have no full-bleed decorative banner. The remaining
  // three destinations are deliberately unavailable until Design adds them.
  ...['/report', '/professional-report', '/equipment', '/visa', '/steps/toolkit-detail'].map(route => ({ route })),
]
const settle = page => page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))) })
async function coverage(page, config) {
  return page.evaluate(async config => {
    const hero = document.querySelector(config.hero)
    const element = document.querySelector(config.media)
    if (!hero || !element) return { error: 'Missing rendered banner' }
    const h = hero.getBoundingClientRect(), r = element.getBoundingClientRect(), s = getComputedStyle(element, config.pseudo)
    const split = value => {
      let depth = 0, start = 0
      const result = []
      for (let i = 0; i < value.length; i++) {
        if (value[i] === '(') depth++
        else if (value[i] === ')') depth--
        else if (value[i] === ',' && !depth) { result.push(value.slice(start, i).trim()); start = i + 1 }
      }
      result.push(value.slice(start).trim())
      return result
    }
    const box = v => ({ x: v.x, y: v.y, width: v.width, height: v.height, right: v.right, bottom: v.bottom })
    const fit = (width, height, naturalWidth, naturalHeight, mode) => {
      const factor = mode === 'cover' ? Math.max(width / naturalWidth, height / naturalHeight) : Math.min(width / naturalWidth, height / naturalHeight)
      return [naturalWidth * factor, naturalHeight * factor]
    }
    const position = (value, container, painted) => /%$/.test(value) ? (container - painted) * parseFloat(value) / 100 : parseFloat(value) || 0
    const images = split(s.backgroundImage), sizes = split(s.backgroundSize), positions = split(s.backgroundPosition)
    const paints = []
    const layoutWidth = parseFloat(s.width), layoutHeight = parseFloat(s.height), scaleX = r.width / layoutWidth, scaleY = r.height / layoutHeight
    for (let i = 0; i < images.length; i++) {
      const url = images[i].match(/^url\(["']?(.*?)["']?\)$/)?.[1]
      if (!url) continue
      const image = new Image(); image.src = url; await image.decode()
      const size = sizes[i % sizes.length], point = positions[i % positions.length].split(' ')
      let width, height
      if (size === 'cover' || size === 'contain') [width, height] = fit(layoutWidth, layoutHeight, image.naturalWidth, image.naturalHeight, size)
      else {
        const [x, y = 'auto'] = size.split(' ')
        const dimension = (value, container) => value === 'auto' ? null : parseFloat(value) * (/%$/.test(value) ? container / 100 : 1)
        width = dimension(x, layoutWidth); height = dimension(y, layoutHeight)
        if (width === null && height === null) { width = image.naturalWidth; height = image.naturalHeight }
        else if (width === null) width = height * image.naturalWidth / image.naturalHeight
        else if (height === null) height = width * image.naturalHeight / image.naturalWidth
      }
      const x = r.x + position(point[0], layoutWidth, width) * scaleX
      const y = r.y + position(point[1], layoutHeight, height) * scaleY
      paints.push({ url, size, position: positions[i % positions.length], naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, x, y, width: width * scaleX, height: height * scaleY, right: x + width * scaleX, bottom: y + height * scaleY })
    }
    if (element.tagName === 'IMG') {
      const [width, height] = fit(r.width, r.height, element.naturalWidth, element.naturalHeight, s.objectFit)
      paints.push({ url: element.currentSrc, size: s.objectFit, x: r.x + (r.width - width) / 2, y: r.y + (r.height - height) / 2, width, height, right: r.x + (r.width + width) / 2, bottom: r.y + (r.height + height) / 2 })
    }
    return { hero: box(h), media: box(r), paints, viewport: innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, scrollbar: getComputedStyle(document.documentElement).scrollbarWidth, webkitScrollbar: getComputedStyle(document.documentElement, '::-webkit-scrollbar').display }
  }, config)
}
async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const report = { createdAt: '', base, widths: [1024, 1440, 1920, 2560], results: [], dental: [], errors: [] }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    page.on('pageerror', error => report.errors.push(error.message))
    for (const config of routes) {
      await page.goto(base + config.route, { waitUntil: 'networkidle' })
      await settle(page)
      const name = config.route === '/' ? 'home' : config.route.slice(1).replaceAll('/', '-')
      if (!config.hero) {
        await page.screenshot({ path: path.join(output, name + '-1440.png') })
        report.results.push({ route: config.route, banner: 'No decorative banner in the current route', title: await page.title() })
        continue
      }
      for (const width of report.widths) {
        await page.setViewportSize({ width, height: 900 }); await settle(page)
        const states = config.route === '/' ? [1, 2, 3, 4] : config.route === '/dental' ? [1, 2, 3] : [1]
        for (const state of states) {
          if (config.route === '/') {
            await page.locator('.home-source-hero').focus()
            while (Number(await page.locator('.home-source-hero').getAttribute('data-hero-state')) !== state) await page.keyboard.press('ArrowRight')
          }
          if (config.route === '/dental') await page.getByRole('button', { name: `${String(state).padStart(2, '0')} ${['选择牙科项目', '城市与医生匹配', '上传影像资料'][state - 1]}`, exact: true }).click()
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await settle(page)
          const result = await coverage(page, config)
          const label = `${name}-${width}-${state}`
          assert.ok(!result.error, `${label}: ${result.error}`)
          assert.ok(result.hero.x <= 1 && result.hero.right >= width - 1, `${label}: background container has gutters`)
          assert.ok(result.paints.some(paint => paint.x <= 1 && paint.right >= width - 1 && paint.y <= result.hero.y + 1 && paint.bottom >= result.hero.bottom - 1), `${label}: the actual painted bitmap fails to cover the banner\n${JSON.stringify(result)}`)
          assert.equal(result.scrollWidth, width, `${label}: horizontal page overflow`)
          assert.equal(result.clientWidth, width, `${label}: scrollbar consumes width`)
          assert.equal(result.scrollbar, 'none', `${label}: visible native scrollbar`)
          assert.equal(result.webkitScrollbar, 'none')
          const screenshot = path.join(output, label + '.png')
          await page.screenshot({ path: screenshot })
          report.results.push({ route: config.route, width, state, ...result, screenshot })
        }
        await page.mouse.move(width / 2, 400); await page.mouse.wheel(0, 500); await page.waitForTimeout(180)
        assert.ok(await page.evaluate(() => scrollY > 0), `${name}: wheel scrolling was disabled`)
      }
    }
    for (const width of report.widths) {
      await page.setViewportSize({ width, height: 900 }); await page.goto(base + '/dental', { waitUntil: 'networkidle' }); await settle(page)
      const cards = page.locator('.dental-live-project')
      assert.equal(await cards.count(), 8)
      const first = cards.nth(0), last = cards.nth(7)
      await last.focus(); await page.keyboard.press('Enter'); await settle(page)
      assert.equal(await last.getAttribute('aria-expanded'), 'true')
      assert.equal(await first.getAttribute('aria-expanded'), 'true', 'Opening the eighth subject collapsed another subject')
      assert.equal(await last.getAttribute('aria-pressed'), 'true')
      await page.keyboard.press('Enter'); await settle(page)
      assert.equal(await last.getAttribute('aria-expanded'), 'false')
      const geometry = await page.evaluate(() => {
        const button = document.querySelector('[data-figma-node="2294:8336"]'), footer = document.querySelector('[data-figma-node="231:276"]'), grid = document.querySelector('[data-figma-node="2294:8280"]')
        const b = button.getBoundingClientRect(), f = footer.getBoundingClientRect(), g = grid.getBoundingClientRect()
        return { footerGap: f.y - b.bottom, gridGap: b.y - g.bottom, scale: Math.min(1, innerWidth / 1440), position: getComputedStyle(button).position, hrefs: [...footer.querySelectorAll('a')].map(a => a.getAttribute('href')) }
      })
      assert.ok(Math.abs(geometry.footerGap - 96 * geometry.scale) < 1)
      assert.ok(Math.abs(geometry.gridGap - 48 * geometry.scale) < 1)
      assert.ok(!['fixed', 'sticky'].includes(geometry.position))
      assert.ok(geometry.hrefs.includes('mailto:contact@huanyuyunyi.com'))
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await settle(page)
      await page.screenshot({ path: path.join(output, `dental-${width}-footer.png`) })
      report.dental.push({ width, cards: 8, independentExpansion: true, keyboardSelection: true, ...geometry })
    }
    assert.deepEqual(report.errors, [])
    report.createdAt = new Date().toISOString()
    await fs.writeFile(path.join(output, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify({ routes: routes.length, bannerStates: report.results.filter(row => row.paints).length, dental: report.dental, errors: report.errors }))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
