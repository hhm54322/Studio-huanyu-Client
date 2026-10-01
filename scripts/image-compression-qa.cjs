const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

const base = process.env.HUANYU_QA_URL || 'https://www.huanyumedical.com'
const output = path.resolve('docs/figma-verification/image-compression-2026-09-30')
const routes = ['/', '/about', '/why-china', '/hospitals', '/cases', '/diseases-technologies', '/dental', '/steps', '/cost', '/insurance', '/trust', '/report']
async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const results = process.env.HUANYU_QA_RESUME === '1'
    ? JSON.parse(await fs.readFile(path.join(output, 'results.json'), 'utf8')).filter(result => routes.includes(result.route))
    : []
  try {
    for (const route of routes) {
      for (const width of [1440, 390]) {
        if (results.some(result => result.route === route && result.width === width)) continue
        const shots = []
        const name = route === '/' ? 'home' : route.slice(1)
        const layouts = []
        for (const original of [true, false]) {
          const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
          const page = await context.newPage()
          const errors = []
          const responses = []
          page.on('pageerror', e => errors.push(e.message))
          page.on('response', response => {
            if (response.url().includes('/images/')) responses.push({ url: response.url(), type: response.headers()['content-type'], status: response.status() })
          })
          if (original) {
            await page.route('**/images/**', async handler => {
              const request = handler.request()
              const url = new URL(request.url())
              const file = path.resolve('public', `.${decodeURIComponent(url.pathname).replace(/\.optimized\.webp$/, '')}`)
              assert.ok(file.startsWith(path.resolve('public/images') + path.sep))
              const extension = path.extname(file)
              const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' }[extension]
              await handler.fulfill({ status: 200, contentType: mime, body: await fs.readFile(file) })
            })
          }
          await page.goto(`${base}${route}?compressionQA=20260930`, { waitUntil: 'networkidle', timeout: 60000 })
          await page.waitForSelector('main', { timeout: 30000 })
          await page.evaluate(async () => {
            for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
              window.scrollTo(0, y)
              await new Promise(resolve => setTimeout(resolve, 20))
            }
            window.scrollTo(0, 0)
          })
          await page.waitForTimeout(800)
          const layout = await page.evaluate(() => ({
            width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
            brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src),
            sections: [...document.querySelectorAll('main section, [data-page] section')].map(s => {
              const r = s.getBoundingClientRect()
              return { class: s.className, x: r.x, y: r.y, width: r.width, height: r.height }
            }),
          }))
          assert.deepEqual(errors, [])
          assert.deepEqual(layout.brokenImages, [])
          assert.equal(layout.width, layout.scrollWidth)
          assert.ok(responses.every(r => r.status < 400))
          layouts.push(layout)
          const shot = await page.screenshot({ fullPage: true })
          shots.push(shot)
          await fs.writeFile(path.join(output, `${name}-${width}-${original ? 'original' : 'compressed'}.png`), shot)
          await context.close()
        }
        assert.deepEqual(layouts[0], layouts[1], `Layout changed: ${route} ${width}`)
        const a = await sharp(shots[0]).removeAlpha().raw().toBuffer({ resolveWithObject: true })
        const b = await sharp(shots[1]).removeAlpha().raw().toBuffer({ resolveWithObject: true })
        assert.deepEqual(a.info, b.info)
        let sum = 0
        for (let i = 0; i < a.data.length; i++) sum += Math.abs(a.data[i] - b.data[i])
        const differencePercent = sum / a.data.length / 255 * 100
        assert.ok(differencePercent < 1, `Compression difference: ${route} ${width}: ${differencePercent}%`)
        const result = { route, width, differencePercent, layoutUnchanged: true }
        results.push(result)
        console.log(JSON.stringify(result))
        await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2))
      }
    }
  } finally { await browser.close() }
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2))
  console.log(`Verified ${results.length} route/viewport pairs.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
