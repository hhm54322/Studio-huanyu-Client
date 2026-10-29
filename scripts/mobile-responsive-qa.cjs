// Screenshots are local QA artifacts, not application assets.
// HUANYU_QA_TOOLS may point to an external node_modules containing Playwright/Sharp.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const os = require('node:os')
const resolveTool = name => process.env.HUANYU_QA_TOOLS
  ? require(path.join(process.env.HUANYU_QA_TOOLS, name)) : require(name)
const { chromium, devices } = resolveTool('playwright')
const sharp = resolveTool('sharp')
const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const out = path.resolve(process.env.HUANYU_QA_OUT || 'artifacts/mobile-responsive-2026-10-10')
const widths = (process.env.HUANYU_QA_WIDTHS || '320,390,430,768,1440').split(',').map(Number)
const routes = (process.env.HUANYU_QA_ROUTES || '/,/about,/why-china,/hospitals,/cases,/diseases-technologies,/dental,/steps,/steps/toolkit-detail,/insurance,/report,/trust').split(',')
const results = []
const failures = []

async function executable() {
  if (process.env.HUANYU_QA_BROWSER) return process.env.HUANYU_QA_BROWSER
  try { await fs.access(chromium.executablePath()); return chromium.executablePath() } catch {}
  // A bundled Playwright package may lag the installed browser revision.
  const cache = process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library/Caches/ms-playwright')
    : path.join(os.homedir(), '.cache/ms-playwright')
  for (const dir of (await fs.readdir(cache)).filter(d => d.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const file = path.join(cache, dir, process.platform === 'darwin'
      ? `chrome-headless-shell-mac-${process.arch === 'arm64' ? 'arm64' : 'x64'}/chrome-headless-shell`
      : 'chrome-headless-shell-linux64/chrome-headless-shell')
    try { await fs.access(file); return file } catch {}
  }
  throw new Error('No Chromium executable; set HUANYU_QA_BROWSER')
}

async function geometry(page) {
  return page.evaluate(() => {
    const visible = el => {
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return false
      for (let p = el; p; p = p.parentElement) {
        const css = getComputedStyle(p)
        if (css.display === 'none' || css.visibility === 'hidden' || css.opacity === '0') return false
      }
      return true
    }
    const selector = el => `${el.tagName.toLowerCase()}.${String(el.className).replaceAll(' ', '.')}`
    const scrollingParent = el => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const css = getComputedStyle(p), rect = p.getBoundingClientRect()
        if (['auto', 'scroll'].includes(css.overflowX) && rect.left >= -1 && rect.right <= innerWidth + 1) return true
      }
      return false
    }
    // The hero image scales during crossfade inside .home-hero's overflow:hidden.
    // Continue checking all hero copy/controls and the document's actual scrollWidth.
    const controlled = '.partners-marquee,.insurance-partners-marquee,.home-hero__media,.home-hero__image,.strength-artwork'
    const overflow = [...document.querySelectorAll('main *,footer *,[role=dialog] *,.collection-page *,.free-report-page *,.pro-report-page *')]
      .filter(visible).filter(el => !el.closest(controlled) && !scrollingParent(el))
      .filter(el => !el.matches('.hy-page-hero__media,.hospital-photo,.hospital-photo > img'))
      .filter(el => { const r = el.getBoundingClientRect(); return r.left < -2 || r.right > innerWidth + 2 })
      .map(el => ({ selector: selector(el), text: el.textContent?.trim().slice(0, 70) }))
    const stretched = [...document.images].filter(visible).filter(el => el.naturalWidth && getComputedStyle(el).objectFit === 'fill'
      && Math.abs(Math.log((el.clientWidth / el.clientHeight) / (el.naturalWidth / el.naturalHeight))) > .08)
      .map(el => ({ selector: selector(el), src: el.currentSrc.split('/').pop(), box: [el.clientWidth, el.clientHeight], natural: [el.naturalWidth, el.naturalHeight] }))
    const clipped = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const el = node.parentElement
      if (!node.textContent.trim() || !visible(el) || !el.closest('main,footer,[role=dialog],.collection-page,.free-report-page,.pro-report-page')) continue
      // Intentionally hidden accessible copy and authored summary truncation.
      if (el.closest('[aria-hidden=true],.sr-only') || el.getBoundingClientRect().width <= 1) continue
      const range = document.createRange(); range.selectNodeContents(node)
      for (let p = el; p && p !== document.body; p = p.parentElement) {
        const css = getComputedStyle(p), r = p.getBoundingClientRect()
        // Source-authored edge fading, and inactive slides outside the fixed reading window.
        if (css.maskImage !== 'none') break
        if (p.matches('.strength-copy-window') && [...range.getClientRects()].every(t => t.bottom <= r.top || t.top >= r.bottom)) break
        if (parseInt(css.webkitLineClamp) > 0 || ['auto', 'scroll'].includes(css.overflowX) || ['auto', 'scroll'].includes(css.overflowY) || scrollingParent(p) || p.closest(controlled)) break
        if ([...range.getClientRects()].some(t => (['hidden','clip'].includes(css.overflowX) && (t.left < r.left - 2 || t.right > r.right + 2))
          || (['hidden','clip'].includes(css.overflowY) && (t.top < r.top - 4 || t.bottom > r.bottom + 4)))) {
          clipped.push({ text: node.textContent.trim().slice(0, 70), clip: selector(p) }); break
        }
      }
    }
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight,
      overflow, stretched, clipped,
      broken: [...document.images].filter(visible).filter(el => el.complete && !el.naturalWidth).map(el => el.src),
      smallInputs: innerWidth <= 900 ? [...document.querySelectorAll('.patient-shell input:not([type=checkbox]):not([type=radio]):not([type=file]),.patient-shell select,.patient-shell textarea')]
        .filter(visible).filter(el => parseFloat(getComputedStyle(el).fontSize) < 16).map(selector) : [] }
  })
}

async function check(page, label, capture = true) {
  await page.waitForTimeout(450)
  const measured = await geometry(page)
  const errors = ['overflow', 'stretched', 'clipped', 'broken', 'smallInputs'].flatMap(key => measured[key].map(item => ({ key, item })))
  if (measured.scrollWidth > measured.width) errors.push({ key: 'document-overflow', item: measured.scrollWidth })
  if (errors.length) failures.push({ label, errors })
  results.push({ label, ...measured })
  if (capture) await page.screenshot({ path: path.join(out, `${label}.png`), fullPage: true })
}

async function captureScroll(page, label) {
  const tiles = []
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += 700) {
    await page.evaluate(y => scrollTo(0, y), y)
    await page.waitForTimeout(100)
    const buffer = await page.screenshot()
    const input = await sharp(buffer).resize({ width: 280 }).png().toBuffer()
    tiles.push({ input, left: (tiles.length % 4) * 280, top: Math.floor(tiles.length / 4) * Math.round(280 * page.viewportSize().height / page.viewportSize().width) })
  }
  const h = Math.round(280 * page.viewportSize().height / page.viewportSize().width)
  await sharp({ create: { width: 1120, height: Math.ceil(tiles.length / 4) * h, channels: 4, background: '#eee' } })
    .composite(tiles).png().toFile(path.join(out, `${label}-scroll.png`))
  await page.evaluate(() => scrollTo(0, 0))
  await check(page, label)
}

async function interactions(page, route, label) {
  if (route === '/') {
    for (let i = 0; i < 6; i++) {
      await page.locator('.home-process__why-grid article').nth(i).click()
      await page.getByRole('dialog').waitFor()
      await check(page, `${label}-advantage-${i + 1}`)
      await page.keyboard.press('Escape')
    }
  } else if (route === '/about') {
    await page.locator('.proof-grid article').first().click()
    await check(page, `${label}-assurance`)
    await page.locator('.complex-card__read').click()
    await page.getByRole('dialog').waitFor()
    await check(page, `${label}-complex`)
    await page.keyboard.press('Escape')
  } else if (route === '/hospitals') {
    await page.locator('.hospital-actions button').first().click()
    await page.locator('.hospital-modal').waitFor()
    await check(page, `${label}-hospital`)
    await page.keyboard.press('Escape')
  } else if (route === '/cases') {
    await page.locator('.case-match-button').click()
    await page.getByRole('dialog', { name: '智能匹配', exact: true }).waitFor()
    await check(page, `${label}-matcher`)
    await page.keyboard.press('Escape')
  } else if (route === '/dental') {
    for (let i = 0; i < 2; i++) {
      const card = page.locator('.dental-project-card').nth(i)
      if (!(await card.getAttribute('class')).includes('expanded')) await card.click()
    }
    assert.equal(await page.locator('.dental-project-card.expanded').count(), 2)
    await check(page, `${label}-projects`)
    await page.getByRole('button', { name: /02 城市与医生匹配/ }).click()
    await check(page, `${label}-matching`)
    await page.getByRole('button', { name: /了解更多/ }).first().click()
    await page.locator('.dental-doctor-modal').waitFor()
    for (let i = 0; i < 3; i++) {
      await page.locator('.dental-modal-tabs button').nth(i).click()
      await check(page, `${label}-doctor-${i}`)
    }
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /03 上传影像资料/ }).click()
    await page.getByRole('button', { name: /提交评估/ }).click()
    assert.match(await page.locator('.dental-upload-status').innerText(), /至少上传/)
    await check(page, `${label}-upload-empty`)
  } else if (route === '/insurance') {
    await page.getByRole('button', { name: '立即评估', exact: true }).click()
    for (const sel of ['.insurance-scenario-grid article', '.insurance-path-grid article']) {
      for (let i = 0; i < 3; i++) await page.locator(sel).nth(i).click()
      assert.equal(await page.locator(`${sel}.expanded`).count(), 3)
    }
    await check(page, `${label}-expanded`)
  } else if (route === '/why-china') {
    await page.locator('.cost-actions button').click()
    assert.equal(await page.locator('.cost-detail-card').count(), 8)
    await check(page, `${label}-cost-expanded`)
  } else if (route === '/trust') {
    await page.locator('.faq-list article > button').nth(1).click()
    await check(page, `${label}-faq`)
    await page.getByRole('button', { name: '阅读全文', exact: true }).click()
    await page.locator('.jci-dialog').waitFor()
    await check(page, `${label}-jci`)
    await page.keyboard.press('Escape')
  } else if (route === '/report') {
    // Exercise real rendering with the existing sample data; never create a patient submission.
    const sample = await page.evaluate(async () => ({ ...await import('/src/data/report.ts') }))
    await page.route('**/api/report-submissions/MOBILE-QA', r => r.fulfill({ json: { success: true, submissionNo: 'MOBILE-QA', report: {
      ...sample.reportData, subtitle: '海外就医可行性评估报告', plan: { ...sample.reportData.plan, totalCost: '$14,300 - $25,500' },
      packages: sample.packages, highlights: sample.coreHighlights, disclaimer: '本地布局验证样例', generatedBy: 'rules',
    } } }))
    await page.goto(`${origin}/report?submissionNo=MOBILE-QA`, { waitUntil: 'networkidle' })
    await check(page, `${label}-generated`)
    await page.getByRole('button', { name: /查看专业版报告示例/ }).click()
    await page.locator('.pro-report-page').waitFor()
    await check(page, `${label}-professional`)
    assert.ok(await page.locator('.pro-pathology-panel').evaluate(el => el.lastElementChild.getBoundingClientRect().bottom <= el.getBoundingClientRect().bottom), 'Pathology content spills out of its card')
    const tabs = page.locator('.pro-report-tabs button')
    for (let i = 0; i < await tabs.count(); i++) {
      await tabs.nth(i).evaluate(el => el.scrollIntoView({ block: 'nearest', inline: 'center' }))
      await tabs.nth(i).click()
      await check(page, `${label}-professional-tab-${i}`, false)
    }
    await page.getByRole('button', { name: '关闭示例报告' }).click()
    await page.unroute('**/api/report-submissions/MOBILE-QA')
  }
}

async function sharedControls(page, label) {
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' })
  await page.locator('.menu-button').click()
  await page.locator('.mobile-nav').waitFor()
  await check(page, `${label}-navigation`)
  await page.locator('.menu-button').click()
  await page.locator(await page.locator('.consult-float').isVisible() ? '.consult-float' : '.ask-aning').click()
  await page.locator('.consult-overlay').waitFor()
  await page.waitForTimeout(500)
  assert.ok(await page.locator('.consult-panel').evaluate(el => el.clientHeight <= innerHeight))
  await page.locator('#consult-name').fill('移动端布局测试')
  assert.equal(await page.locator('#consult-name').evaluate(el => getComputedStyle(el).fontSize), '16px')
  await check(page, `${label}-consultation`)
  await page.locator('.consult-panel').evaluate(el => { el.scrollTop = el.scrollHeight })
  await page.screenshot({ path: path.join(out, `${label}-consultation-bottom.png`) })
  await page.keyboard.press('Escape')
  await page.locator('.consult-overlay').waitFor({ state: 'hidden' })
}

async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: await executable() })
  try {
    for (const width of widths) {
      const mobile = width < 1000
      const context = await browser.newContext({ ...(mobile ? devices['iPhone 13'] : {}), viewport: { width, height: width === 1440 ? 900 : 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
      const page = await context.newPage()
      page.setDefaultTimeout(6000)
      let runtime = []
      page.on('pageerror', e => runtime.push(e.message))
      for (const route of routes) {
        const label = `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-${width}`
        try {
          runtime = []
          await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
          await page.evaluate(() => document.fonts.ready)
          await page.waitForTimeout(300)
          if (width === 390) await captureScroll(page, label)
          else await check(page, label)
          if ([320, 768].includes(width)) await interactions(page, route, label)
          if (runtime.length) failures.push({ label, runtime })
          console.log(`${label}: checked`)
        } catch (error) {
          failures.push({ label, error: error.message, url: page.url(), buttons: await page.locator('button').allTextContents() })
          await page.screenshot({ path: path.join(out, `${label}-failure.png`) })
          console.log(`${label}: ${error.message}`)
        }
      }
      if (width === 390 && routes.includes('/')) {
        await page.emulateMedia({ reducedMotion: 'no-preference' })
        for (const route of routes) {
          await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
          for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 600) {
            await page.evaluate(y => scrollTo(0, y), y)
            await page.waitForTimeout(80)
          }
          await check(page, `motion-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}`, false)
        }
        await sharedControls(page, 'phone-390')
        await page.setViewportSize({ width: 844, height: 390 })
        await sharedControls(page, 'landscape-844')
      }
      await context.close()
    }
  } finally { await browser.close() }
  await fs.writeFile(path.join(out, 'results.json'), JSON.stringify({ results, failures }, null, 2) + '\n')
  console.log(JSON.stringify({ checks: results.length, failures }, null, 2))
  if (failures.length) process.exitCode = 1
}
main().catch(async error => {
  await fs.writeFile(path.join(out, 'results.json'), JSON.stringify({ results, failures, fatal: error.message }, null, 2) + '\n')
  console.error(error); process.exitCode = 1
})
