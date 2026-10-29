const assert=require('node:assert/strict')
const fs=require('node:fs/promises')
const path=require('node:path')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const out=path.resolve(process.env.HUANYU_QA_OUT || 'artifacts/figma-hospitals-2026-10-20')
const base=process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
async function main(){
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const result={createdAt:'',shortScreens:[],motion:{},errors:[]}
  try{
    for(const height of [600,754]){
      const page=await browser.newPage({viewport:{width:1440,height},reducedMotion:'reduce'})
      page.on('pageerror',error=>result.errors.push(error.message))
      await page.goto(base+'/hospitals',{waitUntil:'networkidle'})
      await page.getByRole('button',{name:'查看上海曜影医院详情',exact:true}).click()
      const panel=await page.locator('.hospital-dialog__panel').boundingBox()
      assert.ok(panel.y>=15&&panel.y+panel.height<=height-15)
      for(const tab of ['医院概况','科室中心','国际服务','医疗实力','院区网点','认证荣誉']){
        await page.getByRole('tab',{name:tab,exact:true}).click()
        await page.locator('.hospital-dialog__scroll').evaluate(el=>el.scrollTop=el.scrollHeight)
        await page.waitForTimeout(60)
        if(await page.locator('.hospital-dialog__fixed-tabs').count()){
          const fixed=await page.locator('.hospital-dialog__fixed-tabs').boundingBox()
          assert.ok(Math.abs(fixed.y-panel.y)<1,'Sticky tab boundary')
        }else{
          const natural=await page.getByRole('tab',{name:tab,exact:true}).boundingBox()
          assert.ok(natural.y>=panel.y-1,'Natural tab bar left viewport before pinning')
        }
        const cta=await page.locator('.hospital-dialog__cta').boundingBox()
        assert.ok(cta.y+cta.height<=height-15,'Bottom consultation clipped')
        assert.ok(await page.getByRole('button',{name:'关闭医院详情',exact:true}).isVisible())
      }
      await page.screenshot({path:path.join(out,`detail-short-${height}.png`)})
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('dialog').count(),0)
      result.shortScreens.push({height,panel,allTabs:true,cta:true,close:true})
      await page.close()
    }
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'})
    page.on('pageerror',error=>result.errors.push(error.message))
    await page.goto(base+'/hospitals',{waitUntil:'networkidle'})
    await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}));await page.waitForTimeout(60)
    const animations=await page.locator('[data-hospital-card]').evaluateAll(els=>els.flatMap(el=>el.getAnimations().map(a=>({state:a.playState,keyframes:a.effect.getKeyframes()}))))
    assert.ok(animations.some(a=>a.keyframes.some(k=>String(k.transform).includes('18px'))),'Missing scroll reveal')
    await page.screenshot({path:path.join(out,'cards-motion-mid.png')});await page.waitForTimeout(700)
    const card=page.locator('[data-hospital-card]').first()
    const before=await card.boundingBox();await card.hover();await page.waitForTimeout(360)
    const after=await card.boundingBox();assert.ok(Math.abs(after.y-before.y+4)<.1,'Card hover lift')
    assert.equal(before.height,after.height);assert.equal(before.width,after.width)
    await page.mouse.move(0,0);await page.waitForTimeout(360)
    await page.getByRole('button',{name:'查看上海曜影医院详情',exact:true}).click();await page.waitForTimeout(30)
    assert.ok((await page.locator('.hospital-dialog__position').evaluate(el=>getComputedStyle(el).animationName)).includes('hospital-dialog-in'))
    await page.screenshot({path:path.join(out,'detail-motion-mid.png')});await page.waitForTimeout(420)
    await page.screenshot({path:path.join(out,'detail-motion-settled.png')})
    await page.locator('.hospital-dialog__scroll').evaluate(el=>el.scrollTop=400);await page.getByRole('tab',{name:'科室中心',exact:true}).click()
    await page.waitForTimeout(40)
    const content=page.locator('[data-figma-node="1487:493"]')
    const animated=await page.locator('.hospital-dialog__scroll').evaluate(el=>el.getAnimations({subtree:true}).some(a=>a.animationName==='hospital-content-in'))
    assert.ok(animated,'Missing tab fade')
    await page.screenshot({path:path.join(out,'tab-motion-mid.png')});await page.waitForTimeout(350)
    assert.ok((await page.locator('.hospital-dialog__scroll').evaluate(el=>el.scrollHeight))>0)
    await page.emulateMedia({reducedMotion:'reduce'})
    assert.equal(await page.locator('.hospital-dialog__position').evaluate(el=>getComputedStyle(el).animationName),'none')
    assert.equal(await page.locator('.hospital-dialog__scroll').evaluate(el=>el.getAnimations({subtree:true}).length),0)
    await page.keyboard.press('Escape')
    result.motion={scrollReveal:true,hover:true,noGeometryDrift:true,modalEnter:true,tabFade:true,reducedMotion:true}
    await page.close();assert.deepEqual(result.errors,[])
    result.createdAt=new Date().toISOString()
    await fs.writeFile(path.join(out,'motion-qa.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2))
  }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
