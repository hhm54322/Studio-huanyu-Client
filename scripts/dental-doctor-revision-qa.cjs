const assert=require('node:assert/strict')
const fs=require('node:fs/promises')
const path=require('node:path')
const sharp=require('sharp')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/figma-doctors-2026-10-20')
const source=path.join(root,'docs/figma-source/doctors')
const read=async(folder,name)=>JSON.parse(await fs.readFile(path.join(source,folder,`${name}-2026-10-20.json`),'utf8'))
const sel=id=>`[data-figma-node="${id}"]`
async function compare(page,name,model,mode='reduced'){
  const panel=page.locator(model.mask?`dialog ${sel(model.mask.id)}`:`dialog ${sel(model.panel)}`)
  const box=await panel.boundingBox()
  const width=model.mask?.width??model.width,height=model.mask?.height??model.height
  assert.equal(box.width,width);assert.equal(box.height,height)
  const local=path.join(out,`dental-${name}-1440-${mode==='reduced'?'local':'settled'}.png`)
  await sharp(await page.screenshot()).extract({left:Math.round(box.x*2),top:Math.round(box.y*2),width:Math.round(box.width*2),height:Math.round(box.height*2)}).png().toFile(local)
  const parameters=await read(`dental-${name}`,'native-parameters')
  const pos=parameters.nodes.find(node=>node.nodeId===(model.mask?.id??model.panel)).framePosition
  const original=path.join(out,`dental-${name}-figma.png`)
  assert.equal((await sharp(original).metadata()).width,2880,'Export must be at the authored DPR2 size')
  const reference=path.join(out,`dental-${name}-panel-figma.png`)
  await sharp(original).extract({left:Math.round(pos.x*2),top:Math.round(pos.y*2),width:Math.round(width*2),height:Math.round(height*2)}).flatten({background:'#fff'}).removeAlpha().png().toFile(reference)
  const ref=await sharp(reference).raw().toBuffer({resolveWithObject:true})
  const actual=await sharp(local).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true})
  assert.deepEqual(ref.info,actual.info)
  let sum=0,changed=0
  for(let i=0;i<ref.data.length;i+=3){let max=0;for(let channel=0;channel<3;channel++){const d=Math.abs(ref.data[i+channel]-actual.data[i+channel]);sum+=d;max=Math.max(d,max)}if(max>16)changed++}
  const nMAE=100*sum/ref.data.length/255
  await sharp({create:{width:width*2,height,channels:3,background:'#fff'}}).composite([{input:await sharp(reference).resize({width}).toBuffer(),left:0,top:0},{input:await sharp(local).resize({width}).toBuffer(),left:width,top:0}]).png().toFile(path.join(out,`dental-${name}-${mode}-comparison.png`))
  const map=await read(`dental-${name}`,'node-to-code')
  const missingOwners=await page.evaluate(items=>items.filter(item=>!document.querySelector(item.selector)).map(item=>item.nodeId),map.nodes.filter(item=>item.rendered))
  return {name,frame:model.frame,box,nMAE,changedPixelsOver16:100*changed/(ref.data.length/3),missingOwners,reference,local}
}
async function main(){
  await fs.mkdir(out,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const report={createdAt:'',results:[],settled:[],behavior:{},errors:[]}
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'reduce'})
    page.on('pageerror',error=>report.errors.push(error.message))
    await page.goto((process.env.HUANYU_QA_URL||'http://127.0.0.1:5174')+'/dental',{waitUntil:'networkidle'})
    await page.getByRole('button',{name:/02 城市与医生匹配/}).click()
    const trigger=page.locator('.dental-doctor-card__button').first()
    await trigger.click()
    for(const [index,name] of ['profile','cases','reviews'].entries()){
      if(index)await page.getByRole('tab').nth(index).click()
      const model=await read(`dental-${name}`,'dialog-model')
      await page.locator(sel(model.panel)).waitFor({state:'visible'})
      await page.evaluate(()=>document.fonts.ready)
      await page.waitForTimeout(150)
      const result=await compare(page,name,model)
      report.results.push(result);console.log(JSON.stringify(result))
    }
    const y=await page.evaluate(()=>scrollY)
    await page.getByRole('tab').last().focus();await page.keyboard.press('Home')
    assert.equal(await page.getByRole('tab').first().getAttribute('aria-selected'),'true')
    await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab').nth(1).getAttribute('aria-selected'),'true')
    await page.keyboard.press('End');assert.equal(await page.getByRole('tab').last().getAttribute('aria-selected'),'true')
    for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert.ok(await page.locator('dialog').evaluate(el=>el.contains(document.activeElement)))}
    await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0)
    assert.equal(await page.evaluate(()=>scrollY),y)
    assert.ok(await trigger.evaluate(el=>document.activeElement===el))
    await trigger.click();await page.getByRole('button',{name:'关闭医生详情',exact:true}).click();assert.equal(await page.locator('dialog[open]').count(),0)
    await trigger.click();await page.mouse.click(8,8);assert.equal(await page.locator('dialog[open]').count(),0)
    await page.locator('.dental-doctor-card__button').nth(1).click()
    assert.ok(!(await page.locator('dialog').innerText()).includes('郑雨容'))
    await page.getByRole('tab').nth(1).click();assert.ok((await page.getByRole('status').innerText()).includes('暂无已授权'))
    await page.keyboard.press('Escape')
    await page.emulateMedia({reducedMotion:'no-preference'})
    await trigger.click()
    for(const [index,name] of ['profile','cases','reviews'].entries()){
      if(index)await page.getByRole('tab').nth(index).click()
      await page.waitForTimeout(400)
      const result=await compare(page,name,await read(`dental-${name}`,'dialog-model'),'settled')
      report.settled.push(result);console.log(JSON.stringify({...result,mode:'motion settled'}))
    }
    await page.keyboard.press('Escape')
    report.behavior={tabs:true,keyboard:true,focusTrap:true,focusRestore:true,scrollRestore:true,escape:true,closeButton:true,backdrop:true,noForeignDoctorCases:true}
    report.createdAt=new Date().toISOString()
    await fs.writeFile(path.join(out,'dental-qa.json'),JSON.stringify(report,null,2)+'\n')
    assert.deepEqual(report.errors,[])
    for(const result of [...report.results,...report.settled]){assert.deepEqual(result.missingOwners,[]);assert.ok(result.nMAE<1,`${result.name}: ${result.nMAE}% exceeds 1%`)}
  }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
