const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const out = path.resolve('docs/figma-verification/home/2026-10-01-process')

async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    await page.goto(origin, { waitUntil: 'networkidle', timeout: 60000 })
    await page.evaluate(() => document.fonts.ready)
    const geometry = await page.evaluate(() => ({
      viewport: { width: innerWidth, height: innerHeight },
      process: (() => { const r = document.querySelector('.home-process')?.getBoundingClientRect(); return r ? { y: r.top + scrollY, height: r.height } : null })(),
      stages: [...document.querySelectorAll('.home-process__stage')].map((el) => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, height: r.height } }),
      rail: (() => { const r = document.querySelector('.home-process__rail')?.getBoundingClientRect(); return r ? { x: r.x, y: r.y + scrollY, width: r.width, height: r.height } : null })(),
      stack: (() => { const r = document.querySelector('.home-process__stack')?.getBoundingClientRect(); return r ? { x: r.x, width: r.width } : null })(),
      overflow: document.documentElement.scrollWidth > innerWidth,
    }))
    // Figma Group 602 (143:3723) is positioned 132px from the 1440px frame edge.
    assert.deepEqual(geometry.rail && { x: geometry.rail.x, width: geometry.rail.width }, { x: 132, width: 220 })
    assert.deepEqual(geometry.stack && { x: geometry.stack.x, width: geometry.stack.width }, { x: 526, width: 802 })
    const railParts = await page.evaluate(() => {
      const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, width: r.width } }
      return { node: rect('.home-process__rail-node'), line: rect('.home-process__rail-line'), label: rect('.home-process__rail > span') }
    })
    assert.deepEqual(railParts.node, { x: 112, width: 160 })
    assert.deepEqual(railParts.line, { x: 188, width: 8 })
    assert.equal(railParts.label.x, 292)
    assert.deepEqual(geometry.stages.map(stage => stage.height), [1208, 754, 1148, 1384])
    assert.deepEqual(await page.locator('.home-process__disease-grid a').first().evaluate(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })), { width: 389, height: 300 })
    assert.equal(await page.locator('.home-process__stage:nth-child(2) .home-process__secondary').textContent(), '生成可行性报告')
    assert.equal(await page.locator('.home-process__stage:nth-child(2) .home-process__secondary span').count(), 0)
    assert.equal(await page.locator('.home-process__stage:nth-child(2) .home-process__subtitle').textContent(), '3分钟获取个性化来华就医可行性报告')
    assert.equal(await page.locator('.home-process__stage:nth-child(3) .home-process__subtitle').textContent(), '点击卡片查看详细解答')
    assert.equal(await page.locator('.home-process__stage:nth-child(3) .home-process__faq button strong').first().textContent(), '中国三甲医院病理复核，免费第二诊疗意见')
    assert.equal(await page.locator('.home-process__stage:nth-child(3) .home-process__faq button p').first().textContent(), '我们与北京协和医院、上海复旦肿瘤医院等42家三甲医院合作，提供权威的病理复核服务。国际患者可申请免费第二诊疗意见，由副主任级别以上专家亲自审核。')
    assert.equal(await page.locator('.home-process__disease-grid a').first().locator('p').last().textContent(), '诊疗特色：MDT多学科会诊，前沿个体化治疗方案')
    await page.screenshot({ path: path.join(out, 'desktop-full.png'), fullPage: true })
    for (const [index, stage] of geometry.stages.entries()) {
      await page.evaluate((y) => scrollTo({ top: y - 120, behavior: 'auto' }), stage.top)
      await page.waitForTimeout(250)
      assert.equal(await page.locator('.home-process__rail-node strong').textContent(), `0${index + 1}`)
      assert.equal(await page.locator('.home-process__rail > span').textContent(), ['认知', '评估', '信任', '行动'][index])
      const railTop = await page.locator('.home-process__rail').evaluate(element => element.getBoundingClientRect().top)
      if (index > 0) assert.equal(railTop, 104)
      await page.screenshot({ path: path.join(out, `desktop-stage-${index + 1}.png`), fullPage: false })
    }
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    await mobile.goto(origin, { waitUntil: 'networkidle', timeout: 60000 })
    await mobile.evaluate(() => document.fonts.ready)
    const mobileGeometry = await mobile.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, stages: document.querySelectorAll('.home-process__stage').length }))
    assert.equal(mobileGeometry.scrollWidth, mobileGeometry.width)
    assert.equal(mobileGeometry.stages, 4)
    for (let index = 0; index < 4; index++) {
      await mobile.locator('.home-process__stage').nth(index).evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 100, behavior: 'instant' }))
      await mobile.waitForTimeout(100)
      assert.equal(await mobile.locator('.home-process__rail-node strong').textContent(), `0${index + 1}`)
      await mobile.screenshot({ path: path.join(out, `mobile-stage-${index + 1}.png`), fullPage: false })
    }
    await mobile.screenshot({ path: path.join(out, 'mobile-full.png'), fullPage: true })
    await fs.writeFile(path.join(out, 'geometry.json'), JSON.stringify({ geometry, railParts, mobileGeometry }, null, 2) + '\n')
    console.log(JSON.stringify({ geometry, mobileGeometry, out }, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
