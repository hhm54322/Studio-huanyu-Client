const fs=require('node:fs/promises')
const path=require('node:path')
const sharp=require('sharp')
const assert=require('node:assert/strict')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const out=path.resolve(process.env.HUANYU_QA_OUT || 'artifacts/figma-hospitals-2026-10-20')
async function nmae(a,b){
  const first=await sharp(a).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true})
  const other=await sharp(b).flatten({background:'#fff'}).removeAlpha().raw().toBuffer({resolveWithObject:true})
  assert.equal(other.info.width,first.info.width,'Source/local width differs')
  assert.equal(other.info.height,first.info.height,'Source/local height differs')
  const second=other.data
  let error=0;for(let i=0;i<first.data.length;i++)error+=Math.abs(first.data[i]-second[i])
  return 100*error/first.data.length/255
}
async function main(){
  await fs.mkdir(out,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const results=[]
  try{
    // Mobile design is not final; this revision only verifies desktop.
    for(const width of [1440]){
      const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:2})
      const errors=[];page.on('pageerror',error=>errors.push(error.message))
      await page.emulateMedia({reducedMotion:'reduce'})
      await page.goto(`${process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174'}/hospitals`,{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready)
      await page.waitForTimeout(350)
      if(width===1440)await page.locator('[data-figma-node="484:1573"]').hover()
      const buffer=await page.screenshot({fullPage:true})
      const local=path.join(out,`list-${width}-local.png`)
      await sharp(buffer).resize({width}).png().toFile(local)
      const reference=width===1440?'hospitals':'list-mobile'
      const meta=await sharp(path.join(out,reference+'-figma.png')).metadata()
      const ref=await sharp(path.join(out,reference+'-figma.png')).resize({width}).toBuffer()
      const referenceSite=width===375?await sharp(ref).extract({left:0,top:84,width:375,height:4139}).toBuffer():ref
      const geometry=await page.evaluate(()=>({height:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}))
      const crops=width===1440?[{name:'hero',y:0,height:460},{name:'directory',y:460,height:1524},{name:'footer',y:1984,height:456}]:[{name:'header',y:0,height:52},{name:'hero',y:52,height:400},{name:'directory',y:452,height:3173},{name:'footer',y:3625,height:514}]
      const sections=[]
      for(const crop of crops){
        const rect={left:0,top:crop.y,width,height:crop.height}
        const a=await sharp(referenceSite).extract(rect).png().toBuffer()
        const b=await sharp(local).extract(rect).png().toBuffer()
        await sharp(a).toFile(path.join(out,`${crop.name}-${width}-figma.png`))
        await sharp(b).toFile(path.join(out,`${crop.name}-${width}-local.png`))
        sections.push({section:crop.name,nmae:await nmae(a,b)})
      }
      results.push({width,geometry,errors,referenceSize:meta,sections})
      await page.close()
    }
    await fs.writeFile(path.join(out,'list-qa.json'),JSON.stringify(results,null,2)+'\n')
    console.log(JSON.stringify(results,null,2))
    for(const result of results){
      assert.equal(result.geometry.scrollWidth,result.width,'Hospital page overflow')
      assert.deepEqual(result.geometry.images,[],'Broken hospital images')
      assert.deepEqual(result.errors,[],'Hospital list runtime errors')
      for(const section of result.sections)assert.ok(section.nmae<1,`${section.section} nMAE ${section.nmae}%`)
    }
  }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
