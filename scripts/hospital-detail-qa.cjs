const fs=require('node:fs/promises')
const path=require('node:path')
const sharp=require('sharp')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const out=path.resolve(process.env.HUANYU_QA_OUT || 'artifacts/figma-hospitals-2026-10-20')
const base=process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'
const assert=require('node:assert/strict')
const root='docs/figma-source/hospitals'
const load=folder=>require(path.resolve(root,folder,'source-tree-2026-10-20.json')).root
const flatten=node=>[node,...node.children.flatMap(flatten)]
async function metric(a,b){const x=await sharp(a).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true});const y=await sharp(b).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(x.data.length,y.data.length,'Screenshot dimensions differ');let e=0;for(let i=0;i<x.data.length;i++)e+=Math.abs(x.data[i]-y.data[i]);return 100*e/x.data.length/255}
async function sourceCrop(name,width,rect){
  const bytes=await sharp(path.join(out,`${name}-figma.png`)).resize({width:width*2}).toBuffer()
  return sharp(bytes).extract(Object.fromEntries(Object.entries(rect).map(([key,value])=>[key,Math.round(value*2)]))).png().toBuffer()
}
async function screenshotRegion(page,rect){return sharp(await page.screenshot()).extract({left:Math.round(rect.x*2),top:Math.round(rect.y*2),width:Math.round(rect.width*2),height:Math.round(rect.height*2)}).png().toBuffer()}
async function main(){
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const result=[]
  try {
    for(const width of [1440]){
      const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:2})
      const errors=[];page.on('pageerror',e=>errors.push(e.message))
      await page.emulateMedia({reducedMotion:'reduce'})
      await page.goto(base+'/hospitals',{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250)
      const button=page.getByRole('button',{name:'查看上海曜影医院详情',exact:true})
      await button.click();await page.waitForTimeout(280)
      const opened=await page.locator('dialog').count()
      const panel=page.locator('.hospital-dialog__panel')
      const panelBox=await panel.boundingBox()
      const local=await screenshotRegion(page,panelBox)
      const reference=await sourceCrop('detail-desktop',1440,{left:272,top:52,width:896,height:650})
      await sharp(local).toFile(path.join(out,'detail-initial-local.png'))
      await sharp(reference).toFile(path.join(out,'detail-initial-figma.png'))
      const record={width,opened,errors,initial:await metric(local,reference),scrollY:await page.evaluate(()=>scrollY),scrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth),tabs:[]}
      result.push(record)
      await page.locator('.hospital-dialog__scroll').evaluate(el=>{el.scrollTop=1})
      await page.waitForTimeout(100)
      for(const [index,name] of ['医院概况','科室中心','国际服务','医疗实力','院区网点','认证荣誉'].entries()){
        if(index)await page.getByRole('tab',{name,exact:true}).click()
        await page.locator('.hospital-dialog__scroll').evaluate(el=>{el.scrollTop=0})
        await page.waitForTimeout(250)
        const source=load(`section-desktop-${index+1}`)
        const cta=source.children[2]
        const body=source.children[1]
        const content=body.children.at(-1)
        const top=body.y+content.y
        const region=await page.locator('.hospital-dialog__scroll').boundingBox()
        const composites=[]
        const firstHeight=Math.floor(top*2)/2
        composites.push({input:await screenshotRegion(page,{...region,height:firstHeight}),left:0,top:0})
        // Capture the actual scroll viewport in overlapping strips, keeping the
        // authored sticky menu outside each strip. No off-screen baseline is used.
        for(let cursor=firstHeight;cursor<Math.round(cta.y*2)/2;){
          const desired=Math.max(1,cursor-63)
          const actual=await page.locator('.hospital-dialog__scroll').evaluate((el,n)=>{el.scrollTop=n;return el.scrollTop},desired)
          await page.waitForTimeout(100)
          const y=cursor-actual
          const pixels=Math.min(Math.floor((region.height-y)*2)/2,Math.round(cta.y*2)/2-cursor)
          assert.ok(pixels>0,`Scroll stitching made no progress: ${JSON.stringify({index,cursor,desired,actual,y,region,cta:cta.y,geometry:await page.locator('.hospital-dialog__scroll').evaluate(el=>({h:el.scrollHeight,c:el.clientHeight,top:el.scrollTop}))})}`)
          composites.push({input:await screenshotRegion(page,{x:region.x,y:region.y+y,width:896,height:pixels}),left:0,top:Math.round(cursor*2)})
          cursor+=pixels
        }
        const footer=await screenshotRegion(page,await page.locator('.hospital-dialog__cta').boundingBox())
        composites.push({input:footer,left:0,top:Math.round(cta.y*2)})
        const fullHeight=Math.max(Math.round(source.height*2),Math.round((cta.y+cta.height)*2))
        const full=await sharp({create:{width:1792,height:fullHeight,channels:4,background:'#fff'}}).composite(composites).png().toBuffer()
        const ref=await sharp(path.join(out,`section-desktop-${index+1}-figma.png`)).extract({left:0,top:0,width:1792,height:fullHeight}).png().toBuffer()
        await sharp(full).toFile(path.join(out,`detail-content-${index+1}-local.png`))
        const contentRect={left:48,top:Math.round(top*2),width:1696,height:Math.floor(content.height*2)}
        const contentA=await sharp(full).extract(contentRect).png().toBuffer()
        const contentB=await sharp(ref).extract(contentRect).png().toBuffer()
        record.tabs.push({name,full:await metric(full,ref),content:await metric(contentA,contentB),canvas:await page.locator('.hospital-radar canvas').count()})
      }
      record.tabCount=await page.getByRole('tab').count()
      await page.keyboard.press('Escape');result.at(-1).closedAfterEscape=await page.locator('dialog').count()===0
      await page.close()
    }
    await fs.writeFile(path.join(out,'detail-qa.json'),JSON.stringify({createdAt:new Date().toISOString(),results:result},null,2)+'\n');console.log(JSON.stringify(result,null,2))
    for(const entry of result){
      assert.ok(entry.opened===1&&entry.closedAfterEscape,'Dialog open/Escape failed')
      assert.deepEqual(entry.errors,[],'Hospital detail runtime errors')
      assert.ok(entry.initial<1,`Opening state nMAE ${entry.initial}%`)
      for(const tab of entry.tabs){assert.ok(tab.full<1,`${tab.name} full nMAE ${tab.full}%`);assert.ok(tab.content<1,`${tab.name} content nMAE ${tab.content}%`)}
    }
  } finally {await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})

