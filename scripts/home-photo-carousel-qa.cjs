const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174/'
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/figma-home-corrections-2026-10-29/verification')
const references = path.resolve('artifacts/figma-home-corrections-2026-10-29/references')
const selector = id => `[data-figma-node="${id}"]`
const homeIds = ['1466:843','1412:5862','1466:848','1466:850','1466:852']
const detailIds = ['1407:20','1466:856','1466:865','1466:866','1466:867']
const homeDots = ['1412:5898','1412:5899','1412:5900','1412:5901','1412:5902']
const detailDots = ['1466:859','1466:860','1466:861','1466:862','1466:863']

async function compare(reference, local, label) {
  const [a,b] = await Promise.all([reference,local].map(file => sharp(file).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true})))
  assert.deepEqual(a.info,b.info,`${label}: native Figma and browser pixel grids differ`)
  let sum=0
  for(let i=0;i<a.data.length;i++) sum+=Math.abs(a.data[i]-b.data[i])
  const rgba=await Promise.all([reference,local].map(file=>sharp(file).flatten({background:'#fff'}).ensureAlpha().raw().toBuffer()))
  const diff=Buffer.alloc(rgba[0].length)
  const pixelmatch=(await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const changed=pixelmatch(rgba[0],rgba[1],diff,a.info.width,a.info.height,{threshold:.15,includeAA:false})
  await sharp(diff,{raw:{width:a.info.width,height:a.info.height,channels:4}}).png().toFile(path.join(output,`${label}-diff.png`))
  await sharp({create:{width:a.info.width*2,height:a.info.height,channels:3,background:'#fff'}}).composite([{input:await sharp(reference).flatten({background:'#fff'}).png().toBuffer(),left:0,top:0},{input:await sharp(local).flatten({background:'#fff'}).png().toBuffer(),left:a.info.width,top:0}]).png().toFile(path.join(output,`${label}-comparison.png`))
  return {reference,local,nMAE:100*sum/a.data.length/255,pixelmatchPercent:100*changed/a.info.width/a.info.height}
}

async function photo(page,locator,label) {
  const reference=path.join(references,`${label}.png`),local=path.join(output,`${label}-local.png`)
  const meta=await sharp(reference).metadata(),box=await locator.boundingBox()
  assert.ok(box)
  // Figma's Copy as PNG uses DPR2 and rounds the fractional outer pixel.
  // Preserve that source grid; no image resampling or guessed crop.
  assert.ok(Math.abs(meta.width-box.width*2)<=1&&Math.abs(meta.height-box.height*2)<=1)
  await sharp(await page.screenshot()).extract({left:Math.round(box.x*2),top:Math.round(box.y*2),width:meta.width,height:meta.height}).png().toFile(local)
  return {label,...await compare(reference,local,label)}
}

async function main() {
  await fs.mkdir(output,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const errors=[],photos=[],heroes=[]
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1200},deviceScaleFactor:2,reducedMotion:'reduce'})
    page.on('pageerror',e=>errors.push(e.message))
    await page.goto(base,{waitUntil:'networkidle'})
    await page.evaluate(()=>document.fonts.ready)
    const story=page.locator('.home-patient-stories')
    await story.scrollIntoViewIfNeeded()
    const original=await story.locator('.home-source-node--text').allTextContents()
    assert.ok(original.join(' ').includes('新西兰'))
    assert.ok(!/Maria|James|新加坡|马来西亚/.test(original.join(' ')))
    const hideDots=await page.addStyleTag({content:[...homeDots,...detailDots].map(id=>`${selector(id)}{opacity:0!important}`).join('\n')})
    for(let i=0;i<5;i++) {
      // Keyboard activates the actual authored dot, even while its pixels are
      // hidden for a photo-only comparison against the standalone source.
      await story.locator(selector(homeDots[i])).focus()
      await page.keyboard.press('Enter')
      assert.equal(await story.getAttribute('data-story-state'),String(i+1))
      assert.deepEqual(await story.locator('.home-source-node--text').allTextContents(),original,'Changing a photo changed the patient case')
      const active=story.locator('.home-patient-stories__photo.is-active')
      assert.equal(await active.count(),1)
      assert.equal(await active.getAttribute('data-story-photo'),String(i+1))
      photos.push({source:homeIds[i],...await photo(page,active,`home-${i+1}`)})
    }
    await hideDots.evaluate(el=>el.remove())
    await story.screenshot({path:path.join(output,'home-five-photos-with-controls.png')})
    const y=await page.evaluate(()=>scrollY)
    const trigger=page.locator(selector('1412:5892'))
    await trigger.click()
    const dialog=page.locator('dialog.home-source-dialog[open]')
    const detail=dialog.locator('.home-story-photos')
    const text=await dialog.locator('.home-source-node--text').allTextContents()
    const detailHide=await page.addStyleTag({content:detailDots.map(id=>`${selector(id)}{opacity:0!important}`).join('\n')})
    for(let i=0;i<5;i++) {
      await detail.locator(selector(detailDots[i])).focus()
      await page.keyboard.press('Enter')
      assert.equal(await detail.getAttribute('data-story-detail-state'),String(i+1))
      assert.deepEqual(await dialog.locator('.home-source-node--text').allTextContents(),text)
      const active=detail.locator('.home-story-photos__photo.is-active')
      assert.equal(await active.count(),1)
      photos.push({source:detailIds[i],...await photo(page,active,`detail-${i+1}`)})
    }
    await detailHide.evaluate(el=>el.remove())
    await detail.locator(selector(detailDots[0])).click()
    await detail.screenshot({path:path.join(output,'detail-with-controls.png')})
    const scroll=dialog.locator(selector('1407:28'))
    await scroll.evaluate(el=>el.scrollTo({top:el.scrollHeight,behavior:'instant'}))
    const bottom=await scroll.evaluate(el=>({height:el.clientHeight,scrollHeight:el.scrollHeight,scrollTop:el.scrollTop,inset:el.getBoundingClientRect().bottom-el.querySelector('[data-figma-node="1407:30"]').getBoundingClientRect().bottom,background:getComputedStyle(el).backgroundColor}))
    assert.deepEqual(bottom,{height:532,scrollHeight:810,scrollTop:278,inset:32,background:'rgb(255, 255, 255)'})
    const panel=dialog.locator(selector('1407:8'))
    const panelBox=await panel.boundingBox()
    const bottomLocal=path.join(output,'detail-bottom-local.png')
    await sharp(await page.screenshot()).extract({left:Math.round(panelBox.x*2),top:Math.round(panelBox.y*2),width:1792,height:1300}).png().toFile(bottomLocal)
    const bottomReference=path.join(references,'detail-bottom.png')
    const bottomVisual=await compare(bottomReference,bottomLocal,'detail-bottom')
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('dialog[open]').count(),0)
    assert.equal(await page.evaluate(()=>scrollY),y)
    assert.ok(await trigger.evaluate(el=>el===document.activeElement))

    for(const width of [1024,1440,1920,2560]) {
      await page.setViewportSize({width,height:1000})
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('.patient-header')).backgroundColor==='rgba(0, 0, 0, 0)')
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
      const hero=page.locator('.home-source-hero')
      for(let n=0;n<4;n++) {
        const state=Number(await hero.getAttribute('data-hero-state'))
        const ids=['143:1190','143:1222','143:1251','1523:33']
        const frame=hero.locator(selector(ids[state-1]))
        const geometry=await frame.boundingBox()
        assert.ok(Math.abs(geometry.x)<=1&&Math.abs(geometry.width-width)<=1,`Hero ${state} leaves side gutters at ${width}`)
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width)
        for(const target of ['.patient-header','.home-source-header',selector('1523:75')]) {
          assert.equal(await page.locator(target).evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)',`${target}: opaque header at rest`)
        }
        await page.screenshot({path:path.join(output,`hero-${width}-${state}.png`)})
        heroes.push({width,state,x:geometry.x,widthRendered:geometry.width,transparentHeader:true,noOverflow:true})
        await hero.press('ArrowRight')
      }
    }
    const animated=await browser.newPage({viewport:{width:1440,height:1000}})
    animated.on('pageerror',e=>errors.push(e.message))
    await animated.clock.install()
    await animated.goto(base,{waitUntil:'networkidle'})
    await animated.locator(selector('1412:5892')).click()
    const carousel=animated.locator('.home-story-photos')
    await animated.mouse.move(0,0)
    await animated.waitForTimeout(100)
    await animated.clock.fastForward(6700)
    assert.equal(await carousel.getAttribute('data-story-detail-state'),'2','Detail photos did not autoplay')
    await carousel.hover()
    await animated.clock.fastForward(7000)
    assert.equal(await carousel.getAttribute('data-story-detail-state'),'2','Detail hover did not pause')
    await animated.mouse.move(0,0)
    await carousel.locator(selector(detailDots[4])).click()
    await animated.keyboard.press('ArrowRight')
    assert.equal(await carousel.getAttribute('data-story-detail-state'),'1','Detail keyboard wrap failed')
    await animated.clock.fastForward(7000)
    assert.equal(await carousel.getAttribute('data-story-detail-state'),'1','Detail focus did not pause')
    await animated.getByRole('button',{name:'关闭详情',exact:true}).focus()
    await animated.mouse.move(0,0)
    await animated.clock.fastForward(6700)
    assert.equal(await carousel.getAttribute('data-story-detail-state'),'2','Detail did not resume')
    await animated.emulateMedia({reducedMotion:'reduce'})
    await animated.clock.fastForward(14000)
    assert.equal(await carousel.getAttribute('data-story-detail-state'),'2','Detail reduced motion did not pause')
    await animated.close()
    assert.deepEqual(errors,[])
    const report={createdAt:new Date().toISOString(),base,scope:'Desktop-only user corrections; each photo compared to its own native Figma Copy as PNG',photos,bottom:{...bottom,visual:bottomVisual},heroes,constantPatient:true,focusAndScrollRestore:true,detailPlayback:{autoplay:true,hoverPause:true,focusPause:true,resume:true,keyboardWrap:true,reducedMotion:true},errors}
    await fs.writeFile(path.join(output,'qa.json'),JSON.stringify(report,null,2)+'\n')
    console.log(JSON.stringify(report,null,2))
    assert.ok([...photos,bottomVisual].every(r=>r.nMAE<1&&r.pixelmatchPercent<1),'Source photo comparison exceeds 1%; inspect comparison/difference files')
  } finally {await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
