// Local application QA only; never use this browser for Figma or send messages.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/m02-20261103/qa')
assert.match(base, /^http:\/\/127\.0\.0\.1:/)
const languages = ['zh', 'en', 'id', 'ms', 'pt']
const routes = ['/', '/dental', '/dental/doctors/tan-zhaolin', '/hospitals', '/doctors', '/trust', '/diseases-technologies', '/why-china', '/cases', '/insurance', '/steps', '/steps/toolkit-detail', '/about', '/report']
const tick = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const readContact = async (page, locator = page.locator('.whatsapp-contact')) => {
  await locator.waitFor({ state:'visible' })
  const url = new URL(await locator.getAttribute('href'))
  assert.equal(url.origin + url.pathname, 'https://wa.me/8615855159472')
  assert.equal(await locator.getAttribute('target'), '_blank')
  assert.equal(await locator.getAttribute('rel'), 'noopener noreferrer')
  const text = url.searchParams.get('text')
  assert.ok(text && text.includes('HY1 | lang='), `${page.url()}: missing prefill`)
  assert.equal(text.includes('conversion.'), false)
  return { url:url.href, text }
}
async function fit(page) {
  const state = await page.evaluate(() => {
    const row = document.querySelector('.patient-desktop-navigation__items')
    const header = row.closest('[data-figma-name="Header"],header') || row.parentElement
    const logo = header.querySelector('a[href="/"]:not(.patient-desktop-navigation__link)')?.getBoundingClientRect()
    const children = [...row.children].map(el => ({ text:el.innerText, ...el.getBoundingClientRect().toJSON(), clipped:el.scrollWidth > el.clientWidth + 1 }))
    return { width:innerWidth, scrollWidth:document.documentElement.scrollWidth, logo:logo?.toJSON(), children }
  })
  assert.equal(state.scrollWidth, state.width, `page overflows: ${page.url()}`)
  for (const item of state.children) {
    assert.ok(item.x >= -1 && item.right <= state.width + 1 && item.top >= -1, `nav outside viewport: ${JSON.stringify(item)}`)
    assert.equal(item.clipped, false, `clipped navigation text: ${item.text}`)
    if (state.logo) assert.ok(item.left >= state.logo.right - 1, `nav overlaps brand: ${item.text}`)
  }
  for (let i = 0; i < state.children.length; i++) for (let j = i + 1; j < state.children.length; j++) {
    const a = state.children[i], b = state.children[j]
    assert.ok(Math.min(a.right,b.right) <= Math.max(a.left,b.left) + .2 || Math.min(a.bottom,b.bottom) <= Math.max(a.top,b.top) + .2, `overlap ${a.text}/${b.text}`)
  }
  return { width:state.width, items:state.children.length, rows:[...new Set(state.children.map(item => Math.round(item.y)))].length }
}
async function main() {
  await fs.mkdir(out, {recursive:true})
  const browser = await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const report = {checkedAt:new Date().toISOString(),routes:[],layouts:[],flows:[],errors:[],httpErrors:[],externalMessagesSent:false}
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'})
    page.setDefaultTimeout(9000)
    page.on('pageerror',e=>report.errors.push(e.message))
    page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(base) && !r.url().includes('/api/')) report.httpErrors.push({url:r.url(),status:r.status()})})
    for (const language of process.env.HUANYU_QA_MODE === 'layout' ? [] : languages) {
      for (const route of routes) {
        console.log(`${language} ${route}`)
        await page.goto(`${base}${route}?lang=${language}&disease=lung_cancer&country=MY&utm_source=facebook&utm_campaign=HY-lung-${language}-v1&utm_content=hero`,{waitUntil:'networkidle'})
        await page.evaluate(()=>document.fonts.ready); await tick(page)
        assert.equal(await page.getAttribute('html','lang'),language)
        const contact = await readContact(page)
        const topic = route === '/dental' ? 'whitening' : 'lung_cancer'
        assert.ok(contact.text.includes(`topic=${topic}`), contact.text)
        assert.ok(contact.text.includes(`lang=${language}`))
        assert.ok(contact.text.includes(`utm_campaign=HY-lung-${language}-v1`))
        assert.ok(contact.text.includes('country=MY'))
        const layout = await fit(page)
        await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}))
        const entries = page.locator('a[href^="https://wa.me/"]:not(.whatsapp-contact)').filter({visible:true})
        assert.ok(await entries.count() > 0, `${route}: footer entry missing`)
        for (const entry of await entries.all()) {
          const footer = await readContact(page,entry)
          assert.ok(footer.text.includes(`lang=${language}`) && footer.text.includes(`topic=${topic}`))
          assert.ok(!footer.text.includes('entry=floating'))
          assert.ok(footer.text.includes(`utm_campaign=HY-lung-${language}-v1`))
        }
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await tick(page)
        if (['/', '/dental', '/report'].includes(route)) await page.screenshot({path:path.join(out,`${language}-${route==='/'?'home':route.slice(1)}.png`)})
        report.routes.push({language,route,topic,footerEntries:await entries.count(),...layout})
      }
    }
    // Every public language at each compact desktop size. Menus must stay
    // within the screen and remain reachable across the actual hover gap.
    for (const width of [701,1024,1280,1440,1920]) for (const language of languages) for (const route of ['/','/dental','/hospitals']) {
      await page.setViewportSize({width,height:900})
      await page.goto(`${base}${route}?lang=${language}`,{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready); await tick(page)
      const layout = await fit(page)
      for (const group of ['services','hospitals','language']) {
        const trigger = page.locator(`[data-navigation-trigger="${group}"]`)
        if(group==='language')await trigger.click();else await trigger.hover()
        const panel = page.locator(`#patient-navigation-${group}`)
        await panel.waitFor({state:'visible'});await tick(page)
        const bounds = await panel.boundingBox()
        assert.ok(bounds.x>=-1 && bounds.x+bounds.width<=width+1 && bounds.y>=0 && bounds.y+bounds.height<=900, `${language} ${width}: menu offscreen`)
        for (const item of await panel.locator('a,button').all()) assert.equal(await item.evaluate(el=>el.scrollWidth>el.clientWidth+1),false,`clipped ${language} ${group}`)
        const button = await trigger.boundingBox()
        await page.mouse.move(button.x+button.width/2,button.y+button.height+Math.min(3,(bounds.y-button.y-button.height)/2))
        await page.waitForTimeout(180)
        await page.mouse.move(bounds.x+bounds.width/2,bounds.y+12)
        await page.waitForTimeout(180)
        assert.equal(await panel.isVisible(),true,`hover bridge ${language} ${width}`)
        if (['pt','id'].includes(language) && [1024,1440].includes(width) && route==='/')await page.screenshot({path:path.join(out,`${language}-${width}-${group}.png`)})
        await page.keyboard.press('Escape')
        await page.mouse.move(5,300)
      }
      report.layouts.push({language,route,...layout})
    }
    await page.setViewportSize({width:1440,height:900})
    await page.goto(`${base}/?lang=pt-BR&disease=breast_cancer&country=BR&utm_source=facebook&utm_campaign=campaign_A`,{waitUntil:'networkidle'})
    await page.locator('.patient-desktop-navigation a[href="/about"]').click();await page.waitForURL(`${base}/about`)
    assert.ok((await readContact(page)).text.includes('utm_campaign=campaign_A'))
    assert.ok((await readContact(page)).text.includes('topic=breast_cancer'))
    assert.ok((await readContact(page)).text.includes('country=BR'))
    await page.reload({waitUntil:'networkidle'})
    assert.ok((await readContact(page)).text.includes('utm_campaign=campaign_A'))
    assert.ok((await readContact(page)).text.includes('lang=pt'))
    // A new ad replaces earlier source/creative identifiers, not just campaign.
    await page.goto(`${base}/?lang=id&utm_source=google&utm_campaign=campaign_B`,{waitUntil:'networkidle'})
    const second=(await readContact(page)).text
    assert.ok(second.includes('utm_campaign=campaign_B') && !second.includes('campaign_A') && !second.includes('country=BR'))
    await page.locator('[data-navigation-trigger="language"]').click()
    await page.locator('#patient-navigation-language').getByRole('button',{name:'Bahasa Melayu',exact:true}).click()
    await tick(page);assert.equal(await page.getAttribute('html','lang'),'ms')
    assert.ok((await readContact(page)).text.includes('lang=ms'))
    assert.equal(new URL(page.url()).searchParams.get('lang'),'ms')
    report.flows.push('source survives internal navigation/reload; new campaign replaces source; locale URL and memory stay in sync')
    // Destination is intercepted: verify the exact clicked URL without opening
    // WhatsApp or sending any test medical enquiry to the real account.
    let clicked
    await page.context().route('https://wa.me/**',async route=>{clicked=route.request().url();await route.fulfill({status:200,body:'Local contact QA; no message sent'})})
    const expected=(await readContact(page)).url
    const popupPromise=page.waitForEvent('popup');await page.locator('.whatsapp-contact').click();const popup=await popupPromise;await popup.waitForLoadState()
    assert.equal(clicked,expected);await popup.close();report.flows.push('actual click opens encoded destination in new tab')
    // Storage can be unavailable, and malformed stale values must not prevent
    // the patient site or current-language contact from rendering.
    const isolated=await browser.newContext({viewport:{width:1440,height:900}})
    await isolated.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('disabled')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('disabled')}})})
    const privatePage=await isolated.newPage();privatePage.on('pageerror',e=>report.errors.push(e.message))
    await privatePage.goto(`${base}/?lang=ms&disease=dental&utm_source=facebook`,{waitUntil:'networkidle'})
    assert.ok((await readContact(privatePage)).text.includes('lang=ms'));await isolated.close();report.flows.push('contact works with blocked storage')
    assert.deepEqual(report.errors,[])
    assert.deepEqual(report.httpErrors,[])
  } finally {
    await fs.writeFile(path.join(out,'qa.json'),JSON.stringify(report,null,2)+'\n')
    await browser.close()
  }
  console.log(`M02 browser QA passed: ${report.routes.length} route/language checks, ${report.layouts.length} layout checks.`)
}
main().catch(e=>{console.error(e);process.exitCode=1})
