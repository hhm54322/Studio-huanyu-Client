const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/figma-2026-10-19/behavior')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174/'
const select = id => `[data-figma-node="${id}"]`

async function carousel(page, width) {
  const root = page.locator('.home-patient-stories')
  const dots = width <= 700 ? ['1528:367','1528:368','1528:369','1528:370','1528:371'] : ['1412:5898','1412:5899','1412:5900','1412:5901','1412:5902']
  const detail = width <= 700 ? '1528:386' : '1412:5892'
  const result = { width, states:[] }
  await root.scrollIntoViewIfNeeded()
  for (let i=0;i<5;i++) {
    await page.locator(select(dots[i])).click()
    assert.equal(await root.getAttribute('data-story-state'), String(i+1))
    assert.equal(await page.locator(select(dots[i])).getAttribute('aria-pressed'), 'true')
    const overflow = await root.evaluate(el => ({client:el.clientWidth,scroll:el.scrollWidth, height:el.getBoundingClientRect().height,
      text:[...el.querySelectorAll('.home-source-node--text')].filter(e=>e.getClientRects().length).map(e=>({id:e.dataset.figmaNode,text:e.textContent,rect:e.getBoundingClientRect().toJSON(),scroll:e.scrollWidth,client:e.clientWidth}))}))
    assert.ok(overflow.scroll<=overflow.client+1, `Story ${i+1} overflow at ${width}`)
    const detailBox=await page.locator(select(detail)).boundingBox()
    const rootBox=await root.boundingBox()
    assert.ok(detailBox.x>=rootBox.x && detailBox.x+detailBox.width<=rootBox.x+rootBox.width+1, `Story ${i+1} detail control clipped at ${width}`)
    await root.screenshot({path:path.join(output,`story-${width}-${i+1}.png`)})
    result.states.push({state:i+1,...overflow,href:await page.locator(select(detail)).getAttribute('href')})
  }
  await page.locator(select(dots[2])).click()
  await page.keyboard.press('ArrowRight')
  assert.equal(await root.getAttribute('data-story-state'),'4')
  assert.equal(await page.locator(select(dots[2])).evaluate(el=>el===document.activeElement),true, 'Story controls lost focus')
  await page.keyboard.press('ArrowLeft')
  assert.equal(await root.getAttribute('data-story-state'),'3')
  await page.locator(select(dots[0])).click()
  const y = await page.evaluate(()=>scrollY)
  await page.locator(select(detail)).click()
  assert.equal(await page.locator('dialog[open]').count(),1)
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(()=>Boolean(document.activeElement?.closest('dialog'))),true)
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('dialog[open]').count(),0)
  assert.equal(await page.locator(select(detail)).evaluate(el=>el===document.activeElement),true)
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-y)<=1, 'Story dialog changed page scroll')
  result.keyboard = result.dialogFocus = true
  if(width<=700) {
    await root.dispatchEvent('touchstart',{touches:[{identifier:1,clientX:280,clientY:400}]})
    await root.dispatchEvent('touchend',{changedTouches:[{identifier:1,clientX:100,clientY:410}]})
    assert.equal(await root.getAttribute('data-story-state'),'2')
    result.swipe = true
  }
  return result
}

async function autoplay(browser) {
  const page = await browser.newPage({viewport:{width:1440,height:1000}})
  await page.clock.install()
  await page.goto(base,{waitUntil:'networkidle'})
  await page.evaluate(()=>document.fonts.ready)
  const root=page.locator('.home-patient-stories')
  const state=()=>root.getAttribute('data-story-state')
  await root.scrollIntoViewIfNeeded()
  await page.mouse.move(0,0)
  await page.waitForTimeout(100)
  const initial=await state()
  await page.clock.fastForward(6700)
  assert.notEqual(await state(),initial,'Visible story did not autoplay')
  await root.hover()
  const hoverState=await state()
  await page.clock.fastForward(7000)
  assert.equal(await state(),hoverState,'Hover did not pause story')
  await page.mouse.move(0,0)
  await root.locator('button[aria-label="查看第1张患者照片"]').focus()
  const focused=await state()
  await page.clock.fastForward(7000)
  assert.equal(await state(),focused,'Focus did not pause story')
  await page.evaluate(()=>document.activeElement.blur())
  await page.clock.fastForward(6700)
  assert.notEqual(await state(),focused,'Story failed to resume after focus left')
  await page.emulateMedia({reducedMotion:'reduce'})
  const reduced=await state()
  await page.clock.fastForward(14000)
  assert.equal(await state(),reduced,'Reduced motion did not stop autoplay')
  await page.close()
  return {autoplay:true,hoverPause:true,focusPause:true,focusResume:true,reducedMotion:true}
}

async function main() {
  await fs.mkdir(output,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const results=[],errors=[]
  try {
    for(const width of (process.env.HUANYU_QA_WIDTHS || '1440,375,320,390,430,768').split(',').map(Number)) {
      const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:2})
      page.on('pageerror',error=>errors.push({width,message:error.message}))
      await page.emulateMedia({reducedMotion:'reduce'})
      await page.goto(base,{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready)
      results.push(await carousel(page,width))
      await page.close()
    }
    const playback=await autoplay(browser)
    assert.equal(errors.length,0,JSON.stringify(errors))
    const report={createdAt:new Date().toISOString(),results,playback,errors}
    await fs.writeFile(path.join(output,'qa.json'),JSON.stringify(report,null,2)+'\n')
    console.log(JSON.stringify({widths:results.map(r=>r.width),storyStates:results.length*5,keyboard:true,dialogFocus:true,playback,errors},null,2))
  } finally {await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
