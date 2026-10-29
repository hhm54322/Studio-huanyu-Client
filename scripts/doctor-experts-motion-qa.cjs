const assert=require('node:assert/strict')
const fs=require('node:fs/promises')
const path=require('node:path')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const out=path.resolve(process.env.HUANYU_QA_OUTPUT||'artifacts/figma-doctors-2026-10-20')
const selector=id=>`[data-figma-node="${id}"]`
const names=['xu-yu','zhou-li-li','liu-guang-yu','chen-ji-wu']
const triggers=['1412:6419','1414:7095','1414:7128','1414:7161']
async function main(){
  await fs.mkdir(out,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const results={createdAt:'',desktop:[],motion:{},errors:[]}
  try{
    const records=JSON.parse(await fs.readFile('docs/figma-source/home/experts/dialog-sources-2026-10-19.json','utf8')).records
    for(const [width,height] of [[1024,600],[1440,754],[1920,1080]]){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'})
      page.on('pageerror',error=>results.errors.push(error.message))
      await page.goto(process.env.HUANYU_QA_URL||'http://127.0.0.1:5174/',{waitUntil:'networkidle'})
      for(const [index,name] of names.entries()){
        await page.locator(selector(triggers[index])).click()
        const y=await page.evaluate(()=>scrollY)
        const initial=records[`${name}-01`]
        const states=[]
        for(let tab=0;tab<initial.tabs.length;tab++){
          await page.getByRole('tab').nth(tab).click()
          const model=records[`${name}-0${tab+1}`]
          await page.locator(selector(model.panel)).waitFor({state:'visible'})
          await page.waitForTimeout(80)
          const box=await page.locator(selector(model.panel)).boundingBox()
          assert.equal(Math.round(box.width),896)
          assert.ok(box.x>=23&&box.x+box.width<=width-23)
          const dialog=page.locator('.expert-source-dialog')
          await dialog.evaluate(el=>el.scrollTo({top:el.scrollHeight,behavior:'instant'}))
          await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
          const bottom=await page.locator(selector(model.panel)).boundingBox()
          assert.ok(bottom.y+bottom.height<=height-38,`${name}/${tab+1}/${width}: content bottom ${bottom.y+bottom.height} is not reachable`)
          const overflow=await dialog.evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth}))
          assert.ok(overflow.scrollWidth<=overflow.width)
          await page.keyboard.press('Tab')
          assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)))
          await dialog.evaluate(el=>el.scrollTop=0)
          await page.screenshot({path:path.join(out,`${name}-0${tab+1}-short-${width}.png`)})
          states.push({tab:tab+1,box,bottomReachable:true,overflow:false})
        }
        await page.keyboard.press('Escape')
        assert.equal(await page.locator('dialog[open]').count(),0)
        assert.equal(await page.evaluate(()=>scrollY),y)
        assert.ok(await page.locator(selector(triggers[index])).evaluate(el=>document.activeElement===el))
        results.desktop.push({width,height,expert:name,states,focusRestore:true,scrollRestore:true})
      }
      await page.close()
    }
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'})
    page.on('pageerror',error=>results.errors.push(error.message))
    await page.goto(process.env.HUANYU_QA_URL||'http://127.0.0.1:5174/',{waitUntil:'networkidle'})
    await page.locator(selector(triggers[1])).click()
    const position=page.locator('.expert-source-dialog__position')
    assert.ok((await position.evaluate(el=>getComputedStyle(el).animationName)).startsWith('expert-dialog-in'))
    await page.screenshot({path:path.join(out,'expert-motion-mid.png')})
    await page.waitForTimeout(380)
    await page.getByRole('tab').nth(1).click()
    const animations=await page.locator('dialog').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').map(a=>a.effect.getKeyframes()))
    assert.ok(animations.some(frames=>frames[0].opacity==='0'&&frames.at(-1).opacity==='1'),'Tab content must fade')
    await page.screenshot({path:path.join(out,'expert-tab-mid.png')})
    for(const tab of [2,1,3,0,2])await page.getByRole('tab').nth(tab).click()
    await page.waitForTimeout(300)
    assert.equal(await page.getByRole('tab',{selected:true}).count(),1)
    assert.equal(await page.locator('dialog').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0)
    await page.screenshot({path:path.join(out,'expert-motion-settled.png')})
    await page.emulateMedia({reducedMotion:'reduce'})
    assert.equal(await position.evaluate(el=>getComputedStyle(el).animationName),'none')
    await page.getByRole('tab').first().click()
    assert.equal(await page.locator('dialog').evaluate(el=>el.getAnimations({subtree:true}).length),0)
    await page.getByRole('button',{name:'关闭专家详情',exact:true}).click()
    assert.equal(await page.locator('dialog[open]').count(),0)
    results.motion={modalEnter:true,tabFade:true,rapidSwitch:true,reducedMotion:true,closeButton:true}
    results.createdAt=new Date().toISOString()
    assert.deepEqual(results.errors,[])
    await fs.writeFile(path.join(out,'expert-motion-qa.json'),JSON.stringify(results,null,2)+'\n')
    console.log(JSON.stringify({createdAt:results.createdAt,desktop:results.desktop.length,motion:results.motion,errors:results.errors}))
  }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
