const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const assert = require('node:assert/strict')
const {chromium} = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const root=path.resolve(__dirname,'..')
const evidence=path.resolve(process.env.HUANYU_QA_OUTPUT||path.join(root,'artifacts/figma-2026-10-19/dialogs'))
const widths=(process.env.HUANYU_QA_WIDTHS||'1440,375,320,390,430,768').split(',').map(Number)
const source=path.join(root,'docs/figma-source/home')
const triggers=['1412:5795','1412:5810','1412:5819','1412:5827','1412:5835','1412:5844']
const panels=['143:4038','143:4223','143:4319','143:4087','143:4130','143:4170']
const phonePanels=['1541:1005','1541:1050','1541:1148','1541:1213','1541:1254','1541:1292']
const selector=id=>`[data-figma-node="${id}"]`
async function screenshotPanel(page,panel,file) {
  let box=await panel.boundingBox(),viewport=page.viewportSize()
  const dpr=2
  // A centred odd-height panel lands on a half CSS pixel in an even-height
  // viewport. Choose the matching viewport parity so its raster origin has
  // the same pixel phase as the source export; do not stretch or blur it.
  if(Math.abs(box.y-Math.round(box.y))>.01&&Math.abs(box.height-Math.round(box.height))<.01) {
    await page.setViewportSize({...viewport,height:viewport.height+1})
    box=await panel.boundingBox();viewport=page.viewportSize()
  }
  if(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width&&box.y+box.height<=viewport.height) {
    const bytes=await page.screenshot()
    await sharp(bytes).extract({left:Math.round(box.x*dpr),top:Math.round(box.y*dpr),width:Math.round(box.width*dpr),height:Math.round(box.height*dpr)}).png().toFile(file)
  } else await panel.screenshot({path:file})
}
async function parameters(folder,id) {
  const data=JSON.parse(await fs.readFile(path.join(source,folder,'native-parameters-2026-10-19.json')))
  return data.nodes.find(n=>n.nodeId===id)
}
async function compare(png,folder,id,file,label) {
  const p=await parameters(folder,id)
  const frame=JSON.parse(await fs.readFile(path.join(source,folder,'native-inventory-2026-10-19.json')))
  const width=Math.round(p.parameters.size.x),height=Math.round(p.parameters.size.y)
  const designWidth=folder.includes('mobile')?375:1440
  const captureDpr=2
  // Compare at the browser capture's native pixel grid. Desktop Figma exports
  // are 2x; mobile exports are 3x, so only mobile is resampled to the same
  // 2x grid. This avoids judging two different rasterisation phases.
  const sourceMeta=await sharp(png).metadata()
  const scaledSource=sourceMeta.width===designWidth*captureDpr?png:await sharp(png).resize({width:designWidth*captureDpr}).png().toBuffer()
  const reference=await sharp(scaledSource).extract({left:Math.round(p.framePosition.x*captureDpr),top:Math.round(p.framePosition.y*captureDpr),width:width*captureDpr,height:height*captureDpr}).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true})
  const local=await sharp(file).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true})
  assert.deepEqual(reference.info,local.info,`${label}: source geometry`)
  const ref=reference.data,actual=local.data
  let delta=0,changed=0
  for(let i=0;i<ref.length;i+=3) {
    const d=[0,1,2].map(k=>Math.abs(ref[i+k]-actual[i+k]))
    delta+=d[0]+d[1]+d[2]
    if(Math.max(...d)>16)changed++
  }
  const referenceFile=path.join(evidence,`${label}-figma.png`)
  await sharp(ref,{raw:reference.info}).png().toFile(referenceFile)
  const rgba=await Promise.all([referenceFile,file].map(image=>sharp(image).ensureAlpha().raw().toBuffer()))
  const pixelmatch=(await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const difference=pixelmatch(rgba[0],rgba[1],null,reference.info.width,reference.info.height,{threshold:.15,includeAA:false})
  await sharp({create:{width:width*2,height,channels:3,background:'#fff'}}).composite([{input:await sharp(referenceFile).resize({width}).png().toBuffer(),left:0,top:0},{input:await sharp(file).resize({width}).png().toBuffer(),left:width,top:0}]).png().toFile(path.join(evidence,`${label}-comparison.png`))
  return {nMAE:100*delta/ref.length/255,pixelmatchPercent:100*difference/(reference.info.width*reference.info.height),changedPixelsOver16:100*changed/(ref.length/3),width,height,reference:png,panelReference:referenceFile,local:file}
}
async function main() {
  await fs.mkdir(evidence,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const results=[]
  const errors=[]
  try {
    // Capture at 2x consistently with the page QA. Crop the exact authored
    // bounds before downsampling; locator screenshots round half CSS pixels.
    const page=await browser.newPage({viewport:{width:1440,height:1200},deviceScaleFactor:2})
    page.on('pageerror',e=>errors.push(e.message))
    await page.emulateMedia({reducedMotion:'reduce'})
    await page.goto(process.env.HUANYU_QA_URL||'http://127.0.0.1:5174/',{waitUntil:'networkidle'})
    await page.evaluate(()=>document.fonts.ready)
    for(const width of widths) {
      for(let i=0;i<6;i++) {
        await page.setViewportSize({width:1440,height:1200})
        await page.locator(selector(triggers[i])).click()
        await page.setViewportSize({width,height:1200})
        await page.waitForTimeout(120)
        await page.evaluate(()=>document.fonts.ready)
        const yBefore=await page.evaluate(()=>scrollY)
        const panelId=width<=700?phonePanels[i]:panels[i]
        const panel=page.locator(`dialog ${selector(panelId)}`)
        const box=await panel.boundingBox()
        const file=path.join(evidence,`why-${i+1}-${width}.png`)
        await screenshotPanel(page,panel,file)
        const overflow=await page.locator('dialog').evaluate(el=>({clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight}))
        const label=`why-${i+1}-${width}`
        const reference=width===1440?`/Users/hhm/Downloads/为什么来中国就医-0${i+1}.png`:width===375?i===0?'/Users/hhm/Downloads/01 首页-06为什么来中国就医-01.png':`/Users/hhm/Downloads/为什么来中国就医-0${i+1} (1).png`:null
        const diff=reference?await compare(reference,width===1440?`why-0${i+1}`:`why-mobile-0${i+1}`,panelId,file,label):null
        await page.getByRole('button',{name:'关闭详情',exact:true}).click()
        const yAfter=await page.evaluate(()=>scrollY)
        const closed=await page.locator('dialog[open]').count()===0
        results.push({width,state:i+1,box,overflow,closed,scrollDelta:yAfter-yBefore,diff})
      }
    }
    for(const width of widths) {
      await page.setViewportSize({width,height:1200})
      await page.waitForTimeout(120)
      await page.locator(selector(width<=700?'1528:386':'1412:5892')).click()
      const panelId=width<=700?'1543:42':'1407:8'
      const panel=page.locator(`dialog ${selector(panelId)}`)
      const file=path.join(evidence,`story-${width}.png`)
      await screenshotPanel(page,panel,file)
      const reference=width===1440?'/Users/hhm/Downloads/患者故事 · 真实见证 (1).png':width===375?'/Users/hhm/Downloads/01首页-09患者故事详情.png':null
      const diff=reference?await compare(reference,width===1440?'story-03':'story-mobile',panelId,file,`story-${width}`):null
      const overflow=await page.locator('dialog').evaluate(el=>({clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight}))
      await page.keyboard.press('Escape')
      results.push({width,state:'story',diff,overflow,closed:await page.locator('dialog[open]').count()===0})
    }
    const summary={createdAt:new Date().toISOString(),pixelmatchOptions:{threshold:.15,includeAA:false},metric:'nMAE = absolute RGB difference / (255 × RGB sample count); panel-only; native DPR2; no screenshot-derived style values',results,errors}
    await fs.writeFile(path.join(evidence,'qa.json'),JSON.stringify(summary,null,2)+'\n')
    console.log(JSON.stringify(summary,null,2))
    if(errors.length||results.some(r=>!r.closed||r.overflow.scrollWidth>r.overflow.clientWidth+1||r.scrollDelta||r.diff?.nMAE>=1||r.diff?.pixelmatchPercent>=1))process.exitCode=1
  } finally {await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
