const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5440/'
const out = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/home-layout-charts-20261105/development')
const node = id => `[data-figma-node="${id}"]`
const json = async p => JSON.parse(await fs.readFile(p, 'utf8'))
const refs = {
  why:'artifacts/figma-home-2026-10-28/page/1440-1412-5765-figma.png',
  journey:'artifacts/figma-regression-2026-10-23/home/journey-states-figma.png',
  data:'artifacts/figma-home-2026-10-28/page/1440-1412-6092-figma.png',
}
async function compare(name, reference, local) {
  const a = await sharp(reference).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true})
  const b = await sharp(local).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true})
  assert.deepEqual(a.info,b.info,`${name}: native dimensions`)
  let sum=0;for(let i=0;i<a.data.length;i++)sum+=Math.abs(a.data[i]-b.data[i])
  const rgba=await Promise.all([reference,local].map(p=>sharp(p).ensureAlpha().raw().toBuffer()))
  const pixelmatch=(await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const changed=pixelmatch(rgba[0],rgba[1],null,a.info.width,a.info.height,{threshold:.15,includeAA:false})
  const result={name,nMAE:100*sum/a.data.length/255,pixelmatchPercent:100*changed/(a.info.width*a.info.height)}
  const images=await Promise.all([reference,local].map(p=>sharp(p).resize({width:Math.min(720,a.info.width/2)}).png().toBuffer()))
  const sizes=await sharp(images[0]).metadata()
  await sharp({create:{width:sizes.width*2,height:sizes.height,channels:3,background:'#fff'}}).composite(images.map((input,i)=>({input,left:i*sizes.width,top:0}))).png().toFile(path.join(out,`${name}-comparison.png`))
  assert.ok(result.nMAE<1&&result.pixelmatchPercent<1,JSON.stringify(result))
  return result
}
async function charts(page) {
  await page.locator('#data-section').scrollIntoViewIfNeeded()
  await page.waitForFunction(()=>[...document.querySelectorAll('.revision-chart')].length===2&&[...document.querySelectorAll('.revision-chart')].every(e=>e.querySelector('canvas')&&e.hasAttribute('_echarts_instance_')))
  return page.locator('.revision-chart').evaluateAll(es=>es.map(e=>{
    const r=e.getBoundingClientRect(),c=e.querySelector('canvas'),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data
    let painted=0;for(let i=3;i<data.length;i+=4)if(data[i])painted++
    return{width:r.width,height:r.height,left:r.left,right:r.right,painted}
  }))
}
async function open(browser,width=1440,locale='zh') {
  const p=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'})
  await p.addInitScript(l=>localStorage.setItem('locale',l),locale)
  await p.goto(base,{waitUntil:'networkidle',timeout:90000})
  await p.locator('#process-stage-01').waitFor({timeout:90000})
  await p.evaluate(()=>document.fonts.ready)
  return p
}
async function main() {
  await fs.mkdir(out,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const errors=[],results={base,createdAt:new Date().toISOString(),comparisons:[],stages:[],cards:[],locales:[],charts:[],errors}
  browser.on('page',p=>p.on('pageerror',e=>errors.push(e.message)))
  try {
    const p=await open(browser)
    await p.addStyleTag({content:'.patient-header,.consult-float,.whatsapp-contact,.home-source-hero__assistant{visibility:hidden!important}'})
    const journey=(await json('docs/figma-source/home/journey-states/source-tree-2026-10-19.json')).root
    for (let i=0;i<4;i++) {
      const stage=p.locator(`#process-stage-0${i+1}`)
      await stage.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY+200))
      await p.waitForTimeout(70)
      const rail=p.locator('.journey-desktop__rail')
      const values=await rail.locator('.home-source-node--text').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),rect:e.getBoundingClientRect().toJSON()})))
      assert.ok(values.some(v=>v.text===`0${i+1}`))
      const digit=values.find(v=>v.text===`0${i+1}`),box=await rail.boundingBox()
      assert.ok(Math.abs(digit.rect.x+digit.rect.width/2-(box.x+60))<=.6,`${i+1} not centred`)
      assert.equal(box.y,88)
      const railNode=i?journey.children.find(n=>n.id===['','1401:18','1401:281','1401:49'][i]):null
      const original=i?railNode.children.find(n=>n.id===['','1401:26','1401:282','1401:50'][i]):{y:279}
      const local=path.join(out,`rail-0${i+1}-local.png`),reference=path.join(out,`rail-0${i+1}-figma.png`)
      await sharp(await p.screenshot()).extract({left:112*2,top:88*2,width:240*2,height:650*2}).png().toFile(local)
      await sharp(i?refs.journey:refs.why).extract({left:112*2,top:Math.round((i?railNode.y+original.y:279)*2),width:240*2,height:650*2}).png().toFile(reference)
      results.comparisons.push(await compare(`rail-0${i+1}`,reference,local));results.stages.push({stage:i+1,values})
    }
    for(let i=0;i<6;i++) {
      const card=p.locator(`[data-home-why-card="${i}"]`),more=card.locator(i?'.home-why-card__more':node('1412:5804'))
      await card.scrollIntoViewIfNeeded();await p.mouse.move(0,0);await p.evaluate(()=>document.activeElement?.blur())
      assert.equal(await more.evaluate(e=>getComputedStyle(e).opacity),'0')
      await card.hover();const box=await card.boundingBox(),cta=await more.boundingBox()
      assert.ok(Math.abs(box.y+box.height-(cta.y+cta.height)-24)<1,`Card ${i+1}: bottom padding`)
      await card.screenshot({path:path.join(out,`card-${i+1}-hover.png`)})
      const local=path.join(out,`cta-${i+1}-local.png`),reference=path.join(out,`cta-${i+1}-figma.png`)
      await more.screenshot({path:local});await sharp(refs.why).extract({left:550*2,top:448*2,width:341*2,height:32*2}).png().toFile(reference)
      results.comparisons.push(await compare(`cta-${i+1}`,reference,local));results.cards.push({card:i+1,bottomPadding:box.y+box.height-(cta.y+cta.height)})
    }
    results.charts.push(...await charts(p));assert.ok(results.charts.every(c=>c.painted>10000))
    await p.mouse.move(0,0);const local=path.join(out,'charts-local.png');await p.locator('#data-section').screenshot({path:local})
    results.comparisons.push(await compare('charts',refs.data,local))
    await p.close()
    for(const width of [1024,1440,1920])for(const language of ['zh','en','id','ms','pt']) {
      const p=await open(browser,width,language)
      for(let i=0;i<4;i++) {
        await p.locator(`#process-stage-0${i+1}`).evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-200));await p.waitForTimeout(30)
        const text=await p.locator('.journey-desktop__rail').innerText();assert.ok(text.includes('0'+(i+1)),JSON.stringify({width,language,i,text,scroll:await p.evaluate(()=>scrollY)}))
      }
      for(let i=0;i<6;i++) {
        const card=p.locator(`[data-home-why-card="${i}"]`);await card.hover()
        const check=await card.evaluate(e=>{const a=e.getBoundingClientRect(),copy=e.querySelector('[data-home-why-copy]').getBoundingClientRect(),cta=e.querySelector('.home-why-card__more')||e.querySelector('[data-figma-node="1412:5804"]'),c=cta.getBoundingClientRect();return{within:c.left>=a.left&&c.right<=a.right+.6&&c.bottom<=a.bottom+.6,overlap:c.top<copy.top,overflow:document.documentElement.scrollWidth>innerWidth}})
        assert.ok(check.within&&!check.overlap&&!check.overflow,JSON.stringify({width,language,i,check}))
      }
      const painted=await charts(p);assert.ok(painted.every(c=>c.painted>10000&&c.left>=0&&c.right<=width+1))
      results.locales.push({width,language,stages:4,cards:6,charts:painted})
      await p.close()
    }
    for(const width of [320,390,430,768]) {
      const p=await open(browser,width);const painted=await charts(p);assert.ok(painted.every(c=>c.painted>10000));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
      await p.locator('#data-section').screenshot({path:path.join(out,`charts-regression-${width}.png`)});results.locales.push({width,regression:true,charts:painted});await p.close()
    }
    assert.deepEqual(errors,[])
    await fs.writeFile(path.join(out,'qa.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({comparisons:results.comparisons,localeRuns:results.locales.length,errors},null,2))
  } finally { await browser.close() }
}
main().catch(error=>{console.error(error);process.exitCode=1})
