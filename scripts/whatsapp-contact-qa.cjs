// Browser verification only. Configuration fixtures are intercepted on localhost;
// they never replace release configuration or send an external message.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const out = process.env.HUANYU_QA_OUTPUT || path.join(root, 'artifacts/contact-update-20261103/qa')
const dev = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5317'
const production = process.env.HUANYU_QA_PRODUCTION_URL || 'http://127.0.0.1:5318'
// The router deliberately blocks the three destinations without approved
// designs. Test every published patient route without bypassing that guard.
const routes = ['/', '/why-china', '/trust', '/insurance', '/hospitals', '/doctors', '/cases', '/dental', '/diseases-technologies', '/steps', '/steps/toolkit-detail', '/about', '/report']
const pendingDesignRoutes = ['/equipment', '/visa', '/professional-report']
const email = 'gh20260826@qq.com'
const whatsapp = 'https://api.whatsapp.com/message/Y42GUI2UUXBVB1?autoload=1&app_absent=0'

async function fixed(page) {
  const contact = page.locator('.whatsapp-contact')
  await contact.waitFor({ state: 'visible' })
  assert.equal(await contact.count(), 1, `${page.url()}: exactly one fixed entry`)
  const geometry = await contact.evaluate(el => ({ ...el.getBoundingClientRect().toJSON(), position: getComputedStyle(el).position, viewportWidth: innerWidth, viewportHeight: innerHeight }))
  assert.equal(geometry.position, 'fixed')
  assert.equal(geometry.viewportWidth - geometry.right, 24)
  assert.equal(geometry.viewportHeight - geometry.bottom, 80)
  assert.equal(geometry.height, 44)
  return geometry
}

async function main() {
  for (const url of [dev, production]) assert.match(url, /^http:\/\/127\.0\.0\.1:/)
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = [], environments = [], configurations = []
  try {
    for (const [environment, base] of [['development', dev], ['production-preview', production]]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
      page.on('pageerror', error => errors.push({ environment, message: error.message }))
      const checkedRoutes = []
      for (const route of routes) {
        console.log(`Checking WhatsApp ${environment} ${route}`)
        await page.goto(base + route, { waitUntil: 'networkidle' })
        const geometry = await fixed(page)
        const button = page.locator('.whatsapp-contact')
        assert.equal(await button.evaluate(el => el.tagName), 'A')
        assert.equal(await button.getAttribute('href'), whatsapp)
        assert.equal(await button.getAttribute('target'), '_blank')
        assert.equal(await button.getAttribute('rel'), 'noopener noreferrer')
        assert.equal(await button.getAttribute('title'), '通过 WhatsApp 联系寰宇医疗客服')
        await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
        const mail = page.locator(`a[href="mailto:${email}"]`).filter({ visible:true })
        await mail.first().waitFor({ state:'visible' })
        assert.equal(await page.locator('a[href="mailto:contact@huanyuyunyi.com"],a[href="https://wa.me/864008886688"]').count(), 0)
        assert.ok((await mail.first().textContent()).includes(email))
        const footerWhatsApp = page.locator(`a[href="${whatsapp}"]`).filter({ visible:true })
        assert.ok(await footerWhatsApp.count() >= 2, `${route}: footer and fixed WhatsApp entry`)
        for (const entry of await footerWhatsApp.all()) {
          assert.equal(await entry.getAttribute('target'), '_blank')
          assert.equal(await entry.getAttribute('rel'), 'noopener noreferrer')
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
        await page.screenshot({path:path.join(out,`${environment}-${route.replaceAll('/','_')||'home'}-footer.png`)})
        if (route === '/') {
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
          const assistant = await page.locator('.home-source-hero__assistant').boundingBox()
          assert.equal(assistant.y - geometry.bottom, 12)
          await page.screenshot({ path: path.join(out, `${environment}-home.png`) })
          await page.evaluate(() => scrollTo({ top: 3500, behavior: 'instant' }))
          assert.deepEqual(await fixed(page), geometry)
          await page.locator('[data-figma-node="1412:5892"]').click()
          const dialog = page.locator('dialog[open]')
          await dialog.waitFor({ state: 'visible' })
          // Native top-layer modal makes the fixed entry inert beneath it.
          const point = { x: geometry.x + geometry.width / 2, y: geometry.y + geometry.height / 2 }
          assert.equal(await page.evaluate(p => document.elementFromPoint(p.x, p.y)?.closest('.whatsapp-contact') !== null, point), false)
          await page.keyboard.press('Escape')
          await dialog.waitFor({ state: 'detached' })
        }
        checkedRoutes.push(route)
      }
      for (const width of [1024, 1280, 1440, 1920]) { await page.setViewportSize({ width, height: 900 }); await fixed(page) }
      await page.setViewportSize({ width: 375, height: 812 })
      assert.equal(await page.locator('.whatsapp-contact').isVisible(), false)
      environments.push({ environment, base, routes: checkedRoutes, fixed: true, assistantGap: 12, mobileDeferred: true, modalDoesNotExposeContact: true })
      await page.close()
    }
    for (const [input, expected] of [
      ['+12025550123', 'https://wa.me/12025550123'],
      ['https://wa.me/12025550123?text=Hello', 'https://wa.me/12025550123?text=Hello'],
      [whatsapp, whatsapp],
      ['', whatsapp], ['400-888-XXXX', whatsapp], ['https://evil.example/support', whatsapp], ['https://wa.me/012345678', whatsapp],
      ['https://api.whatsapp.com.evil.example/message/ABC', whatsapp],
      ['https://api.whatsapp.com@evil.example/message/ABC', whatsapp],
      ['http://api.whatsapp.com/message/ABC', whatsapp],
      ['https://api.whatsapp.com/send?phone=123', whatsapp],
    ]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
      page.on('pageerror', error => errors.push({ input, message: error.message }))
      let intercepted = false
      await page.route(url => url.pathname === '/src/data/publicContacts.ts', async route => {
        const response = await route.fetch()
        const code = await response.text()
        assert.ok(code.includes('import.meta.env.VITE_WHATSAPP_CONTACT'))
        intercepted = true
        await route.fulfill({ response, body: code.replaceAll('import.meta.env.VITE_WHATSAPP_CONTACT', JSON.stringify(input)) })
      })
      await page.goto(dev, { waitUntil: 'networkidle' })
      assert.equal(intercepted, true, 'Configuration fixture did not intercept the Vite module')
      await fixed(page)
      const contact = page.locator('.whatsapp-contact')
      assert.equal(await contact.getAttribute('href'), expected)
      assert.equal(await contact.evaluate(el => el.tagName), expected ? 'A' : 'BUTTON')
      if (expected) {
        assert.equal(await contact.getAttribute('target'), '_blank')
        assert.equal(await contact.getAttribute('rel'), 'noopener noreferrer')
      } else assert.equal(await contact.isDisabled(), true)
      configurations.push({ input, href: expected, disabled: !expected })
      await page.close()
    }
    assert.deepEqual(errors, [])
    const codeSHA256 = Object.fromEntries(await Promise.all(['src/data/publicContacts.ts', 'src/components/common/HomeSourceNode.vue', 'src/components/common/WhatsAppContact.vue', 'src/components/layout/PatientFooter.vue'].map(async file => [file, createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex')])))
    const report = { checkedAt: new Date().toISOString(), environments, configurations, codeSHA256, pendingDesignRoutes, externalMessagesSent: false, errors }
    await fs.writeFile(path.join(out, 'qa.json'), JSON.stringify(report, null, 2) + '\n')
    console.log(JSON.stringify(report, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
