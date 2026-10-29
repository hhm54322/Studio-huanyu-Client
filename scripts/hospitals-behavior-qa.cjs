const assert=require('node:assert/strict')
const fs=require('node:fs/promises')
const path=require('node:path')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const out=path.resolve(process.env.HUANYU_QA_OUT || 'artifacts/figma-hospitals-2026-10-20')
const selector=id=>`[data-figma-node="${id}"]`
const base=process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
async function main(){
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const results=[],errors=[]
  try{
    for(const width of [1024,1440,1920]){
      const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'})
      page.on('pageerror',error=>errors.push({width,message:error.message}))
      await page.goto(base+'/hospitals',{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready)
      const record={width,filters:[],details:[]};results.push(record)
      const data=await page.evaluate(async()=>{
        const source=await import('/src/data/hospitalFigmaSource.ts')
        return source.hospitalRecords.map(item=>({id:item.id,name:item.name,nameEn:item.nameEn,city:item.city,services:item.services,website:item.website}))
      })
      assert.equal(await page.locator('[data-hospital-card]').count(),9,'Default authored list')
      for(const [index,city] of ['全部','北京','上海','广州','深圳'].entries()){
        const id=['144:4733','144:4736','144:4739','144:4742','144:4745'][index]
        await page.locator(selector(id)).click();await page.waitForTimeout(80)
        const expected=data.filter(item=>city==='全部'||item.city===city)
        assert.equal(await page.locator('[data-hospital-card]').count(),expected.length,city+' card count')
        assert.equal(await page.locator(selector(id)).getAttribute('aria-pressed'),'true')
        for(const item of expected)assert.equal(await page.getByRole('button',{name:`查看${item.name}详情`,exact:true}).count(),1,'Hospital mapping '+item.name)
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width)
        record.filters.push({city,count:expected.length})
      }
      await page.locator(selector('144:4733')).click()
      for(const item of [data.find(item=>item.name==='北京协和医院'),data.find(item=>item.name==='上海曜影医院'),data.find(item=>item.city==='广州'),data.find(item=>item.city==='深圳')]){
        assert.ok(item,'Missing test hospital')
        const name=item.name
        const opener=page.getByRole('button',{name:`查看${name}详情`,exact:true})
        await opener.scrollIntoViewIfNeeded();await opener.focus();const before=await page.evaluate(()=>scrollY)
        await page.keyboard.press('Enter');await page.locator('dialog[open]').waitFor()
        assert.equal(await page.locator('#hospital-detail-title').textContent(),name)
        assert.ok(await page.locator('dialog').evaluate(el=>el.contains(document.activeElement)),'Initial focus inside')
        await page.locator('.hospital-dialog__scroll').evaluate(el=>el.scrollTop=300)
        await page.waitForTimeout(100)
        const overflow=await page.locator('.hospital-dialog__scroll').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,scrollTop:el.scrollTop}))
        assert.ok(overflow.scrollWidth<=overflow.width+1,'Detail horizontal overflow')
        if(name==='上海曜影医院'){
          for(const [index,tab] of ['医院概况','科室中心','国际服务','医疗实力','院区网点','认证荣誉'].entries()){
            await page.getByRole('tab',{name:tab,exact:true}).click();await page.waitForTimeout(80)
            assert.equal(await page.getByRole('tab',{name:tab,exact:true}).getAttribute('aria-selected'),'true')
            assert.equal(await page.getByRole('tab',{selected:true}).count(),1)
            const source=JSON.parse(await fs.readFile(`docs/figma-source/hospitals/section-desktop-${index+1}/node-to-code-2026-10-20.json`,'utf8'))
            const missing=await page.evaluate(nodes=>nodes.filter(node=>!document.querySelector(node.selector)).map(node=>node.nodeId),source.nodes.filter(node=>node.rendered&&!['1487:232','1487:412','1487:572','1487:717','1487:883','1487:1037'].includes(node.nodeId)))
            // Sticky tabs replace the authored scrolling tab bar when it leaves
            // the viewport; its individual source owners are checked at top.
            await page.locator('.hospital-dialog__scroll').evaluate(el=>el.scrollTop=0);await page.waitForTimeout(80)
            const atTop=await page.evaluate(nodes=>nodes.filter(node=>!document.querySelector(node.selector)).map(node=>node.nodeId),source.nodes.filter(node=>node.rendered))
            assert.deepEqual(atTop,[],`Missing live Figma owners in ${tab}`)
            record.details.push({name,tab,atTop,scrollingOwnersReplaced:missing.length})
          }
          await page.getByRole('tab',{name:'认证荣誉',exact:true}).press('Home')
          assert.equal(await page.getByRole('tab',{name:'医院概况',exact:true}).getAttribute('aria-selected'),'true')
          await page.getByRole('tab',{name:'医院概况',exact:true}).press('ArrowRight')
          assert.equal(await page.getByRole('tab',{name:'科室中心',exact:true}).getAttribute('aria-selected'),'true')
          await page.getByRole('tab',{name:'科室中心',exact:true}).press('End')
          assert.equal(await page.getByRole('tab',{name:'认证荣誉',exact:true}).getAttribute('aria-selected'),'true')
          await page.getByRole('tab',{name:'认证荣誉',exact:true}).press('ArrowRight')
          await page.locator('.hospital-dialog__scroll').evaluate(el=>el.scrollTop=400)
          await page.waitForTimeout(80)
          const photo=page.locator(selector('1487:315'))
          const photoBefore=await photo.evaluate(el=>getComputedStyle(el).backgroundImage)
          await page.getByRole('button',{name:'下一张医院照片',exact:true}).click()
          const photoAfter=await photo.evaluate(el=>getComputedStyle(el).backgroundImage)
          assert.notEqual(photoBefore,photoAfter,'Gallery next image')
          await page.getByRole('button',{name:'上一张医院照片',exact:true}).click()
          assert.equal(await photo.evaluate(el=>getComputedStyle(el).backgroundImage),photoBefore,'Gallery previous image')
        }else{
          assert.ok((await page.locator('dialog').textContent()).includes(item.nameEn))
          assert.equal(await page.getByRole('link',{name:`打开${name}官网`,exact:true}).getAttribute('href'),item.website)
          assert.equal(await page.locator(selector('1626:347')).count(),0,'Duplicate specialties removed')
          const serviceText=await page.locator(selector('1626:358')).textContent()
          for(const service of item.services)assert.ok(serviceText.includes(service),`${name}: missing ${service}`)
          record.details.push({name,overflow})
          if(width===1440){await page.locator('.hospital-dialog__scroll').evaluate(el=>el.scrollTop=0);await page.screenshot({path:path.join(out,'generic-desktop-local.png')})}
        }
        const focusable=page.locator('dialog button,dialog a[href]')
        await focusable.last().focus();await page.keyboard.press('Tab')
        assert.ok(await page.locator('dialog').evaluate(el=>el.contains(document.activeElement)),'Forward focus trap')
        await page.keyboard.press('Shift+Tab');assert.ok(await page.locator('dialog').evaluate(el=>el.contains(document.activeElement)),'Reverse focus trap')
        await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'})
        assert.equal(await page.evaluate(()=>scrollY),before,'Close changed background scroll')
        assert.equal(await opener.evaluate(el=>el===document.activeElement),true,'Opener focus not restored')
      }
      const opener=page.getByRole('button',{name:'查看上海曜影医院详情',exact:true})
      await opener.click();await page.locator('dialog[open]').waitFor();await page.getByRole('button',{name:'关闭医院详情',exact:true}).click();assert.equal(await page.locator('dialog').count(),0)
      await opener.click();await page.locator('dialog[open]').waitFor();await page.mouse.click(8,8);assert.equal(await page.locator('dialog').count(),0,'Backdrop close')
      await opener.click();await page.locator('dialog[open]').waitFor();await page.getByRole('button',{name:'预约咨询',exact:true}).click();await page.locator('.consult-overlay').waitFor({state:'visible'});await page.keyboard.press('Escape')
      record.consultation=true
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
      await page.locator('header '+selector('484:1573')).hover();await page.locator(selector('1741:5732')).waitFor({state:'visible'})
      assert.equal(await page.locator(selector('1741:5735')).getAttribute('href'),'/hospitals')
      await page.keyboard.press('Escape');await page.locator(selector('1741:5732')).waitFor({state:'hidden'})
      await page.locator(selector('484:1582')).click();await page.locator('.hospital-languages').waitFor({state:'visible'});await page.keyboard.press('Escape');assert.equal(await page.locator('.hospital-languages').count(),0)
      record.navigation=true
      for(const [id,prefix] of [['144:5202','mailto:'],['144:5207','tel:'],['144:5212','https://wa.me/']])assert.ok((await page.locator(selector(id)).getAttribute('href')).startsWith(prefix))
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width)
      await page.close()
    }
    assert.deepEqual(errors,[])
    await fs.writeFile(path.join(out,'behavior-qa.json'),JSON.stringify({createdAt:new Date().toISOString(),results,errors},null,2)+'\n')
    console.log(JSON.stringify({results,errors},null,2))
  }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
