// New desktop page flow and authorised case data; never sends patient data.
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const {createHash} = require('node:crypto')
const sharp = require('sharp')
const {chromium} = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname,'..')
const base = path.join(root,'artifacts/dental-page-20261103')
const output = path.resolve(process.env.HUANYU_QA_OUTPUT || path.join(base,'qa'))
const url = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const source = path.join(root,'docs/figma-source/dental-pages-2026-11-03')
const tabs = ['profile','treatment','cases','reviews','services']
const slug = ['tan-zhaolin','che-yinglin','wan-qiancheng','li-teng','huang-jianrong','zheng-rui','jiang-gang']
const names = ['谭兆林','车英林','万前程','李腾','黄建荣','郑锐','蒋刚']
const all = n => [n,...n.children.flatMap(all)]
const norm = text => text.replace(/\s+/g,'')
const read = async file => JSON.parse(await fs.readFile(file,'utf8'))
const codeFiles = ['src/views/patient/DentalDoctorView.vue','src/components/common/DentalDoctorPageContent.vue','src/data/dentalDoctorPageSource.ts','src/data/dentalFlowSession.ts','src/data/dentalCaseSupplements.json','src/data/dentalPhysicianData.ts','src/data/dentalPhysicians.json','src/data/dentalPhysicianSource.ts','src/data/dentalFigmaDetails.ts','src/views/patient/DentalView.vue','src/router/index.ts','src/components/common/DentalSourceCanvas.vue','src/components/common/HomeSourceNode.vue','src/components/layout/PatientLayout.vue','src/components/layout/PatientDesktopNavigation.vue','src/utils/sourceBaseline.ts',...['profile','treatment','cases','reviews','services','case-detail'].map(tab=>`docs/figma-source/dental-pages-2026-11-03/${tab}/source-tree-2026-11-03.json`),'docs/figma-source/dental-pages-2026-11-03/profile/text-layout-2026-11-03.json']
async function settle(page) {
  await page.evaluate(async()=>{
    await document.fonts.ready
    const urls=new Set()
    for(const el of document.querySelectorAll('.dental-doctor-page *, [data-dental-step] *')) {
      if(!el.getClientRects().length)continue
      for(const m of getComputedStyle(el).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(m[1])
    }
    await Promise.all([...urls].map(async url=>{const i=new Image();i.src=url;await i.decode()}))
    await Promise.all([...document.querySelectorAll('.dental-doctor-page img')].filter(i=>i.getClientRects().length).map(i=>i.decode()))
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
  })
}
async function ready(page,tab) {
  await page.waitForFunction(tab=>{const e=document.querySelector('[data-dental-doctor-page]');return e?.getAttribute('data-active-tab')===tab&&e.getAttribute('aria-busy')==='false'},tab)
  await settle(page)
}
async function compare(name,local,figma,rect,dpr=2) {
  const ref=path.join(output,`${name}-figma.png`)
  await sharp(figma).extract(Object.fromEntries(Object.entries(rect).map(([k,v])=>[k,Math.round(v*dpr)]))).flatten({background:'#fff'}).ensureAlpha().png().toFile(ref)
  const a=await sharp(ref).raw().toBuffer({resolveWithObject:true})
  const b=await sharp(local).flatten({background:'#fff'}).ensureAlpha().raw().toBuffer({resolveWithObject:true})
  assert.deepEqual(a.info,b.info,`${name}: raster dimensions`)
  const pixelmatch=(await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  let sum=0;for(let i=0;i<a.data.length;i+=4)for(let c=0;c<3;c++)sum+=Math.abs(a.data[i+c]-b.data[i+c])
  const diff=Buffer.alloc(a.data.length),changed=pixelmatch(a.data,b.data,diff,a.info.width,a.info.height,{threshold:.15,includeAA:false})
  await sharp(diff,{raw:a.info}).png().toFile(path.join(output,`${name}-diff.png`))
  await sharp({create:{width:a.info.width*2,height:a.info.height,channels:4,background:'#fff'}}).composite([{input:ref,left:0,top:0},{input:local,left:a.info.width,top:0}]).png().toFile(path.join(output,`${name}-comparison.png`))
  return {name,nMAE:sum/(a.info.width*a.info.height*3)/255,pixelmatch:changed/(a.info.width*a.info.height),figma:ref,local}
}
async function main() {
  await fs.mkdir(output,{recursive:true})
  const report={createdAt:'',visual:[],doctors:[],layouts:[],navigation:{},mobile:[],errors:[],failedAssets:[],realDataSent:false}
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'reduce'})
  const cacheManifest=await page.request.get(`${url}/asset-cache-manifest.json`)
  const assetUrls=cacheManifest.ok()?await cacheManifest.json().then(manifest=>manifest.assets||{}).catch(()=>({})):{}
  page.setDefaultTimeout(8000)
  page.on('pageerror',e=>report.errors.push(e.message))
  page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/'))report.failedAssets.push({url:r.url(),status:r.status()})})
  try {
    // Static source content is compared separately from approved document
    // substitutions (prices, contact links, 3-case counts, recommendation copy).
    for(const tab of tabs) {
      const tree=(await read(path.join(source,tab,'source-tree-2026-11-03.json'))).root
      await page.setViewportSize({width:1440,height:tree.height})
      await page.goto(`${url}/dental/doctors/tan-zhaolin?tab=${tab}`,{waitUntil:'networkidle'})
      await ready(page,tab);await page.evaluate(()=>scrollTo(0,0));await settle(page)
      await page.screenshot({path:path.join(output,`${tab}-page.png`)})
      if(tab==='cases')continue
      const body=tree.children.find(n=>n.name==='Body'),main=body.children[0],right=main.children[0].children[1]
      const content=right.children.slice(1),top=content[0].y,bottom=Math.max(...content.map(n=>n.y+n.height))
      const rect={left:472,top:113+top,width:824,height:bottom-top}
      const local=path.join(output,`${tab}-content.png`)
      await page.screenshot({path:local,clip:{x:rect.left,y:rect.top,width:rect.width,height:rect.height}})
      report.visual.push(await compare(`${tab}-content`,local,path.join(base,'reference',tab==='profile'?'native-3421-2534-figma.png':`${tab}-figma.png`),rect))
      if(tab==='profile') {
        const file=path.join(output,'profile-card.png')
        await page.locator('[data-dental-doctor-card]').screenshot({path:file})
        report.visual.push(await compare('profile-card',file,path.join(base,'reference/native-3421-2534-figma.png'),{left:112,top:113,width:304,height:448}))
      }
    }
    // The first authorised case is also the exact case used in the new Figma
    // expanded/collapsed component, allowing an unmasked component comparison.
    const casePage=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1,reducedMotion:'reduce'})
    await casePage.goto(`${url}/dental/doctors/che-yinglin?tab=cases`,{waitUntil:'networkidle'});await ready(casePage,'cases')
    const first=casePage.locator('[data-physician-case="nord-01"]')
    for(const state of ['collapsed','expanded']) {
      if(state==='expanded')await first.locator('button[aria-expanded]').click()
      await settle(casePage);await casePage.evaluate(()=>scrollTo(0,0));await settle(casePage)
      const file=path.join(output,`case-${state}.png`);await first.screenshot({path:file})
      report.visual.push(await compare(`case-${state}`,file,path.join(base,'reference/case-detail-figma.png'),{left:32,top:state==='expanded'?20:282,width:824,height:state==='expanded'?238:164},1))
    }
    await casePage.close()
    await page.setViewportSize({width:1440,height:900})
    const supplement=await read(path.join(root,'src/data/dentalCaseSupplements.json'))
    const docs=(await read(path.join(root,'src/data/dentalPhysicians.json'))).records
    for(let index=0;index<slug.length;index++) {
      console.log(`Checking ${names[index]}`)
      await page.goto(`${url}/dental/doctors/${slug[index]}?tab=profile`,{waitUntil:'networkidle'})
      await ready(page,'profile')
      assert.ok(norm(await page.locator('[data-dental-doctor-card]').innerText()).includes(norm(names[index])))
      if(index)assert.ok(norm(await page.locator('[data-doctor-content]').innerText()).includes(norm(docs[index-1].bio)))
      for(const [tabIndex,tab]of tabs.entries()) {
        if(tabIndex){await page.getByRole('tab').nth(tabIndex).click();await ready(page,tab)}
        assert.equal(await page.getByRole('tab',{selected:true}).count(),1)
        assert.equal(await page.locator('dialog[open]').count(),0,'Doctor detail must remain a page')
        if(tab==='cases') {
          const entries=page.locator('[data-physician-case]');assert.equal(await entries.count(),3)
          const expected=supplement.records.filter(c=>c.doctorId===(index?100+index:5))
          const actualIds=await entries.evaluateAll(es=>es.map(e=>e.dataset.physicianCase))
          assert.deepEqual(actualIds,[...(index?[]:['tan-original']),...expected.map(c=>c.id)])
          assert.equal(await page.locator('[data-physician-case] [aria-expanded=true]').count(),0)
          for(const c of expected) {
            const entry=page.locator(`[data-physician-case="${c.id}"]`),toggle=entry.locator('[aria-expanded]')
            await toggle.click();assert.ok(norm(await entry.innerText()).includes(norm(c.description)))
            await toggle.click();assert.equal(await entry.locator('p').count(),0)
          }
          const thumb=entries.last().locator('button[aria-label^="放大"]').first()
          await thumb.click();await page.locator('.dental-case-image[open]').waitFor()
          const expectedImage=expected.at(-1).images[0].src
          assert.equal(await page.locator('.dental-case-image img').getAttribute('src'),assetUrls[expectedImage]||expectedImage)
          await page.locator('.dental-case-image img').evaluate(image=>image.decode())
          await page.keyboard.press('Escape');assert.equal(await page.locator('.dental-case-image[open]').count(),0)
        }
      }
      await page.getByRole('tab').first().focus();await page.keyboard.press('End');await ready(page,'services')
      await page.keyboard.press('Home');await ready(page,'profile')
      await page.getByRole('button',{name:`查看${index?docs[index-1].hospital:'博远口腔'}`,exact:true}).click()
      await page.locator('[data-dental-dialog="institution"][open]').waitFor()
      await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0)
      report.doctors.push({id:index?100+index:5,name:names[index],allTabs:true,caseCount:3,caseContent:true,defaultCollapsed:true,zoomEscape:true,institution:true,keyboard:true})
    }
    // Page/pinned-menu geometry at different desktop widths and the common
    // exit boundary before recommendations. No clipping-only fit assertion.
    for(const width of [1024,1440,1920]) {
      await page.setViewportSize({width,height:width===1024?600:900})
      await page.goto(`${url}/dental/doctors/tan-zhaolin?tab=treatment`,{waitUntil:'networkidle'});await ready(page,'treatment')
      const scale=Math.min(1,width/1440)
      await page.evaluate(()=>scrollTo(0,150))
      await page.waitForFunction(scale=>Math.abs(document.querySelector('[data-dental-doctor-card]').getBoundingClientRect().y-113*scale)<.1,scale)
      await settle(page)
      const card=await page.locator('[data-dental-doctor-card]').boundingBox(),menu=await page.locator('[data-dental-doctor-menu]').boundingBox()
      assert.ok(Math.abs(card.y-113*scale)<.1,JSON.stringify({width,scale,card,menu,scrollY:await page.evaluate(()=>scrollY)}))
      assert.ok(Math.abs(menu.y-card.y-24*scale)<.1,JSON.stringify({width,scale,card,menu}))
      const section=await page.locator('[data-dental-doctor-section]').boundingBox()
      await page.evaluate(y=>scrollTo(0,y),(935-448+100)*scale)
      await page.waitForFunction(scale=>{const card=document.querySelector('[data-dental-doctor-card]').getBoundingClientRect(),related=document.querySelector('[data-dental-doctor-related]').getBoundingClientRect();return Math.abs(related.y-card.y-card.height-48*scale)<.1},scale)
      await settle(page)
      const end=await page.locator('[data-dental-doctor-card]').boundingBox(),related=await page.locator('[data-dental-doctor-related]').boundingBox()
      assert.ok(Math.abs(related.y-end.y-end.height-48*scale)<.1)
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width)
      await page.evaluate(()=>scrollTo(0,150));await settle(page)
      await page.screenshot({path:path.join(output,`sticky-${width}.png`)})
      report.layouts.push({width,scale,pinCardTop:card.y,pinMenuTop:menu.y,releaseGap:related.y-end.y-end.height,sectionHeight:section.height,noOverflow:true})
    }
    // Real list navigation, filters and unfinished quote inputs survive visits.
    await page.setViewportSize({width:1440,height:900})
    await page.goto(`${url}/dental?step=2`,{waitUntil:'networkidle'})
    await page.locator('[data-dental-step="2"] [data-doctor]').first().waitFor()
    assert.equal(await page.locator('[data-doctor]').count(),7)
    await page.getByLabel('城市', {exact:true}).selectOption('深圳')
    await page.getByRole('button',{name:'筛选医生',exact:true}).click()
    assert.equal(await page.locator('[data-doctor]').count(),6)
    const trigger=page.getByRole('button',{name:'查看车英林医生详情',exact:true})
    await trigger.click();await ready(page,'profile')
    await page.goBack();await page.locator('[data-dental-step="2"] [data-doctor]').first().waitFor()
    assert.equal(await page.getByLabel('城市',{exact:true}).inputValue(),'深圳')
    assert.equal(await page.locator('[data-doctor]').count(),6)
    await page.getByRole('button',{name:'查看车英林案例集',exact:true}).click();await ready(page,'cases')
    await page.getByRole('button',{name:'获取车英林医生免费报价',exact:true}).click()
    await page.locator('[data-dental-step="3"]').waitFor()
    assert.ok(page.url().includes('doctor=che-yinglin'))
    await page.getByLabel('其他说明').fill('QA only: retain notes and doctor attribution')
    await page.getByLabel('预算范围').selectOption('¥5,000 - ¥20,000')
    await page.getByLabel('计划到访时间').fill('2027-01-15')
    const testImage={name:'qa-no-patient-data.png',mimeType:'image/png',buffer:await sharp({create:{width:2,height:2,channels:3,background:'#fff'}}).png().toBuffer()}
    await page.locator('input[type=file]').first().setInputFiles(testImage)
    await page.getByRole('button',{name:'02 城市与医生匹配',exact:true}).click()
    await page.locator('[data-dental-step="2"]').waitFor()
    await page.getByRole('button',{name:'查看车英林医生详情',exact:true}).click();await ready(page,'profile')
    await page.getByRole('button',{name:'获取车英林医生免费报价',exact:true}).click()
    await page.locator('[data-dental-step="3"]').waitFor()
    assert.equal(await page.getByLabel('其他说明').inputValue(),'QA only: retain notes and doctor attribution')
    assert.equal(await page.getByLabel('预算范围').inputValue(),'¥5,000 - ¥20,000')
    assert.equal(await page.getByLabel('计划到访时间').inputValue(),'2027-01-15')
    assert.ok((await page.getByLabel('已选择的资料').innerText()).includes(testImage.name))
    const captured=[]
    await page.route('**/api/dental-assessments',async route=>{captured.push(route.request().postData());await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({code:200,data:{id:'qa-only',requestId:'qa-only'}})})})
    await page.getByRole('button',{name:'提交评估 · 获取书面报价',exact:true}).click()
    await page.waitForFunction(()=>document.body.textContent.includes('资料已记录'))
    assert.equal(captured.length,1);assert.ok(captured[0].includes('意向医生：车英林'))
    assert.equal(await page.evaluate(()=>Object.values(localStorage).some(v=>v.includes('QA only: retain'))),false)
    const submittedRequest=captured[0].match(/name="requestId"\r\n\r\n([^\r]+)/)?.[1]
    assert.ok(submittedRequest)
    await page.getByRole('button',{name:'02 城市与医生匹配',exact:true}).click()
    await page.getByRole('button',{name:'查看车英林医生详情',exact:true}).click();await ready(page,'profile')
    await page.getByRole('button',{name:'获取车英林医生免费报价',exact:true}).click()
    await page.locator('[data-dental-step="3"]').waitFor()
    assert.equal(await page.getByRole('button',{name:'提交评估 · 获取书面报价',exact:true}).isDisabled(),true)
    await page.getByRole('button',{name:'02 城市与医生匹配',exact:true}).click()
    await page.getByRole('button',{name:'查看万前程医生详情',exact:true}).click();await ready(page,'profile')
    await page.getByRole('button',{name:'获取万前程医生免费报价',exact:true}).click()
    await page.locator('[data-dental-step="3"]').waitFor()
    assert.equal(await page.getByRole('button',{name:'提交评估 · 获取书面报价',exact:true}).isEnabled(),true)
    await page.getByRole('button',{name:'提交评估 · 获取书面报价',exact:true}).click()
    await page.waitForFunction(()=>document.body.textContent.includes('资料已记录'))
    assert.equal(captured.length,2);assert.ok(captured[1].includes('意向医生：万前程'))
    assert.notEqual(captured[1].match(/name="requestId"\r\n\r\n([^\r]+)/)?.[1],submittedRequest)
    report.navigation={filtersRetained:true,fullPage:true,directCases:true,quoteDoctor:true,formAndFilesRetained:true,submissionMocked:true,noNotesInLocalStorage:true}
    for(const width of [390,430]) {
      await page.setViewportSize({width,height:844})
      await page.goto(`${url}/dental`,{waitUntil:'networkidle'})
      assert.equal(await page.locator('.dental-page').count(),1)
      assert.equal(await page.locator('[data-dental-doctor-page]').count(),0)
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width)
      await page.screenshot({path:path.join(output,`mobile-regression-${width}.png`)})
      await page.goto(`${url}/dental/doctors/che-yinglin`,{waitUntil:'networkidle'})
      assert.ok(new URL(page.url()).pathname==='/dental')
      report.mobile.push({width,existingFlow:true,detailRedirect:true,noOverflow:true})
    }
    report.createdAt=new Date().toISOString()
    report.codeSHA256=Object.fromEntries(await Promise.all(codeFiles.map(async file=>[file,createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex')])))
    await fs.writeFile(path.join(output,'qa.json'),JSON.stringify(report,null,2)+'\n')
    console.log(JSON.stringify(report,null,2))
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedAssets,[])
    for(const check of report.visual)assert.ok(check.nMAE<.01&&check.pixelmatch<.01,`${check.name}: visual difference >=1%`)
  } catch(error) {
    await page.screenshot({path:path.join(output,'failure.png'),fullPage:true})
    await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({message:error.message,errors:report.errors,url:page.url(),report},null,2))
    throw error
  } finally { await browser.close() }
}
main().catch(error=>{console.error(error);process.exitCode=1})
