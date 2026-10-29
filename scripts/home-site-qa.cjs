const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const out = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/figma-2026-10-19/site')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174/'
const node = id => `[data-figma-node="${id}"]`
const widths = (process.env.HUANYU_QA_WIDTHS || '1440,375,320,390,430,768').split(',').map(Number)

async function main() {
  await fs.mkdir(out,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const results=[],errors=[]
  try {
    for(const width of widths) {
      const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'})
      page.on('pageerror',e=>errors.push({width,message:e.message}))
      await page.goto(base,{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready)
      const result={width,hero:[],flow:[]}
      const sourceMap=JSON.parse(await fs.readFile(path.resolve(`docs/figma-source/home/node-to-code${width<=700?'-mobile':''}-2026-10-19.json`),'utf8'))
      result.missingSourceOwners=await page.evaluate(nodes=>nodes.filter(item=>!document.querySelector(item.selector)).map(item=>({id:item.nodeId,selector:item.selector})),sourceMap.nodes.filter(item=>{
        const all=new Map(sourceMap.nodes.map(n=>[n.nodeId,n]));
        for(let n=item;n;n=all.get(n.parentNodeId)) if(['1412:5685','1412:6749','1412:6791'].includes(n.nodeId)) return false;
        return item.rendered
      }))
      assert.deepEqual(result.missingSourceOwners,[],`Source owners absent at ${width}`)
      const hero=page.locator('.home-source-hero')
      for(let index=0;index<4;index++) {
        await hero.press('ArrowRight')
        await page.waitForTimeout(50)
        const state=Number(await hero.getAttribute('data-hero-state'))
        assert.equal(state,index+1)
        await hero.screenshot({path:path.join(out,`hero-${width}-${state}.png`)})
        result.hero.push({state,height:(await hero.boundingBox()).height})
      }
      const steps=width<=700?['1528:153','1528:160','1528:167','1528:174']:['1412:5726','1412:5736','1412:5746','1412:5756']
      for(const [index,id] of steps.entries()) {
        await page.locator(node(id)).click()
        await page.waitForTimeout(60)
        const stage=page.locator(`#process-stage-0${index+1}`)
        const y=(await stage.boundingBox()).y
        assert.ok(Math.abs(y-(width<=700?88:104))<2,`Flow ${index+1}: ${y}`)
        if(width>700) {
          assert.equal(await page.locator('.journey-desktop__rail '+node('1412:5786')).textContent(),'0'+(index+1))
          assert.equal(await page.locator('.journey-desktop__rail').count(),1)
        }
        result.flow.push({stage:index+1,y})
      }
      const chart=await page.locator('.revision-chart').evaluateAll(elements=>elements.map(el=>{
        const canvas=el.querySelector('canvas'),r=el.getBoundingClientRect()
        const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data
        let painted=0
        for(let i=3;i<data.length;i+=4)if(data[i])painted++
        return {width:r.width,height:r.height,left:r.left,right:r.right,instance:el.getAttribute('_echarts_instance_'),painted}
      }))
      assert.equal(chart.length,2)
      for(const c of chart)assert.ok(c.instance&&c.painted>10000&&c.left>=-1&&c.right<=width+1,JSON.stringify(c))
      result.charts=chart
      const consult=width<=700?'1528:231':'1401:40'
      const before=await page.evaluate(()=>scrollY)
      await page.locator(node(consult)).click()
      await page.getByRole('dialog').waitFor({state:'visible'})
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({state:'hidden'})
      assert.equal(await page.locator(node(consult)).evaluate(el=>document.activeElement===el),true)
      result.consultation=true
      if(width<=700) {
        await page.locator(node('1528:123')).click()
        await page.locator('.mobile-source-menu').waitFor({state:'visible'})
        await page.locator(node('1555:434')).click()
        await page.locator(node('1555:511')).waitFor({state:'visible'})
        await page.locator(node('1555:511')).click()
        await page.keyboard.press('Escape')
        await page.locator('.mobile-source-menu').waitFor({state:'hidden'})
        assert.equal(await page.locator(node('1528:123')).evaluate(el=>document.activeElement===el),true)
        const track=page.locator(node('1528:625'))
        await track.evaluate(el=>el.scrollTo({left:el.scrollWidth,behavior:'instant'}))
        assert.ok(await track.evaluate(el=>el.scrollLeft>0))
        result.menu=result.mobileCards=true
      } else {
        await page.locator(node('1523:110')).click()
        await page.locator('.home-language-menu').waitFor({state:'visible'})
        await page.keyboard.press('Escape')
        await page.locator('.home-language-menu').waitFor({state:'hidden'})
        result.language=true
      }
      const contacts=width<=700?['1528:836','1528:841','1528:846']:['1412:6716','1412:6721','1412:6726']
      result.contacts=await Promise.all(contacts.map(id=>page.locator(node(id)).getAttribute('href')))
      assert.ok(result.contacts[0].startsWith('mailto:')&&result.contacts[1].startsWith('tel:')&&result.contacts[2].startsWith('https://wa.me/'))
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width)
      result.scrollBeforeConsultation=before
      await page.close()
      results.push(result)
    }
    const page=await browser.newPage({viewport:{width:1440,height:1100}})
    await page.goto(base,{waitUntil:'networkidle'})
    const strength=page.locator('.home-strength-source')
    const top=await strength.evaluate(el=>el.getBoundingClientRect().top+scrollY)
    for(const [index,offset] of [0,660,1320].entries()) {
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top-64+offset)
      await page.waitForTimeout(650)
      assert.equal(await strength.getAttribute('data-strength-state'),String(index+1))
      assert.ok(Math.abs((await page.locator('.home-strength-source__stage').boundingBox()).y-64)<1)
      await page.screenshot({path:path.join(out,`strength-motion-${index+1}.png`)})
    }
    const marquee=page.locator('.home-partners-source')
    await marquee.scrollIntoViewIfNeeded()
    await page.mouse.move(0,0)
    await page.waitForTimeout(80)
    const animation=page.locator(node('1412:6502'))
    assert.equal(await animation.evaluate(el=>getComputedStyle(el).animationPlayState),'running')
    await marquee.hover()
    assert.equal(await animation.evaluate(el=>getComputedStyle(el).animationPlayState),'paused')
    // Check one complete loop on the real paired DOM tracks. Edge fades remain
    // in the viewport and are deliberately not animated with their contents.
    async function at(progress) {
      await page.locator('.home-partners-source').evaluate((el,p)=>{
        for(const a of el.getAnimations({subtree:true})){a.pause();a.currentTime=Number(a.effect.getTiming().duration)*p}
      },progress)
      return marquee.screenshot()
    }
    const first=await at(0),last=await at(1)
    const a=await sharp(first).removeAlpha().raw().toBuffer(),b=await sharp(last).removeAlpha().raw().toBuffer()
    assert.equal(a.length,b.length)
    let delta=0;for(let i=0;i<a.length;i++)delta+=Math.abs(a[i]-b[i])
    const loopNmae=100*delta/a.length/255
    assert.ok(loopNmae<.1,`Marquee seam: ${loopNmae}`)
    await fs.writeFile(path.join(out,'partners-loop.png'),last)
    await page.emulateMedia({reducedMotion:'reduce'})
    assert.equal(await animation.evaluate(el=>getComputedStyle(el).animationName),'none')
    await page.close()
    assert.deepEqual(errors,[])
    const report={createdAt:new Date().toISOString(),results,motion:{strength:true,partnerHover:true,partnerLoopNmae:loopNmae,reducedMotion:true},errors}
    await fs.writeFile(path.join(out,'qa.json'),JSON.stringify(report,null,2)+'\n')
    console.log(JSON.stringify({widths,heroStates:results.length*4,charts:true,flow:true,menu:true,consultation:true,motion:report.motion,errors},null,2))
  } finally {await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
