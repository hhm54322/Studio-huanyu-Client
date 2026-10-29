const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')

const output = path.resolve(process.env.HUANYU_QA_OUTPUT || 'artifacts/figma-2026-10-19/page')
const sourceDirectory = path.resolve('docs/figma-source/home')
const base = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5174/'
const desktopExport = process.env.HUANYU_QA_REFERENCE || '/Users/hhm/Downloads/01寰宇云医 - 首页.png'
const mobileExport = '/Users/hhm/Downloads/01 首页.png'
const desktopIds = ['1523:33','1412:5718','1412:5765','1412:5853','1412:6019','1412:6055','1412:6092','1412:6313','1412:6350','1442:343','1412:6495','1412:6635','1412:6672']
const mobileIds = ['1528:117','1528:127','1528:148','1528:184','1528:223','1528:252','1528:316','1528:360','1528:391','1528:412','1528:429','1528:621','1528:656','1528:727','1528:762','1528:771','1528:806']

function indexTree(root) {
  const nodes = new Map()
  function walk(node, parentX=0, parentY=0) {
    const x=parentX+node.x, y=parentY+node.y
    nodes.set(node.id,{...node,absoluteX:x,absoluteY:y})
    node.children.forEach(child=>walk(child,x,y))
  }
  walk({...root,x:0,y:0})
  return nodes
}
async function difference(reference, actual) {
  const a=await sharp(reference).removeAlpha().raw().toBuffer({resolveWithObject:true})
  const b=await sharp(actual).removeAlpha().raw().toBuffer({resolveWithObject:true})
  if(a.info.width!==b.info.width||a.info.height!==b.info.height) throw Error(`Geometry mismatch ${JSON.stringify([a.info,b.info])}`)
  let sum=0, count=0
  for(let i=0;i<a.data.length;i++) {const delta=Math.abs(a.data[i]-b.data[i]);sum+=delta;if(delta>25)count++}
  const pixelmatch=(await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
  const rgba=await Promise.all([reference,actual].map(image=>sharp(image).ensureAlpha().raw().toBuffer()))
  const changed=pixelmatch(rgba[0],rgba[1],null,a.info.width,a.info.height,{threshold:.15,includeAA:false})
  return {nMAE:100*sum/a.data.length/255,pixelmatchPercent:100*changed/(a.info.width*a.info.height),channelsOver10Percent:100*count/a.data.length}
}
async function compare(page,width,id,source,referenceImage) {
  const node=source.get(id)
  const locator=page.locator(`[data-figma-node="${id}"]`).first()
  const origin=await locator.evaluate(element=>element.getBoundingClientRect().top+window.scrollY)
  // Integer scroll positions retain the source's fractional device-pixel
  // phase. Capture viewport tiles: macOS Chrome can repeat GPU tiles in a
  // single full-page DPR2 bitmap taller than 16384 device pixels.
  await page.evaluate(y=>window.scrollTo({top:Math.floor(y),behavior:'instant'}),origin)
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
  // The source frame depicts the first advantage card's revealed state.
  // Match that state explicitly, not by permanently exposing its CTA.
  if(id==='1412:5765') await page.locator('[data-home-why-card="0"]').hover()
  else if(id==='1523:33') await page.locator('[data-figma-node="1523:95"]').hover()
  else await page.mouse.move(0,0)
  const box=await locator.boundingBox()
  if(!box) throw Error(`Missing source element ${id}`)
  const viewportImage=await page.screenshot({animations:'disabled'})
  const local=await sharp(viewportImage).extract({left:Math.round(box.x*2),top:Math.round(box.y*2),width:width*2,height:Math.round(node.height*2)}).png().toBuffer()
  const slug=`${width}-${id.replace(':','-')}`
  const reference=await sharp(referenceImage).extract({left:0,top:Math.round(node.absoluteY*2),width:width*2,height:Math.round(node.height*2)}).png().toBuffer()
  // Render at native DPR2. Round only the fractional bottom edge, not geometry.
  const meta=await sharp(local).metadata()
  const actual=await sharp(local).extract({left:0,top:0,width:width*2,height:Math.min(meta.height,Math.round(node.height*2))}).png().toBuffer()
  const target=await sharp(reference).extract({left:0,top:0,width:width*2,height:Math.min(meta.height,Math.round(node.height*2))}).png().toBuffer()
  await Promise.all([fs.writeFile(path.join(output,`${slug}-local.png`),actual),fs.writeFile(path.join(output,`${slug}-figma.png`),target)])
  const metric=await difference(target,actual)
  await sharp({create:{width:width*2,height:Math.round(node.height)*2,channels:3,background:'#fff'}})
    .composite([{input:await sharp(target).resize({width}).toBuffer(),left:0,top:0},{input:await sharp(actual).resize({width}).toBuffer(),left:width,top:0}])
    .png().toFile(path.join(output,`${slug}-comparison.png`))
  return {id,name:node.name,...metric,reference:path.join(output,`${slug}-figma.png`),local:path.join(output,`${slug}-local.png`),source:{width:node.width,height:node.height,y:node.absoluteY},actual:{width:box.width,height:box.height}}
}
async function main() {
  await fs.mkdir(output,{recursive:true})
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const results=[]
  try {
    for(const width of (process.env.HUANYU_QA_WIDTHS || '1440,375').split(',').map(Number)) {
      const errors=[]
      const page=await browser.newPage({viewport:{width,height:1500},deviceScaleFactor:2})
      page.on('pageerror',error=>errors.push(error.message))
      await page.emulateMedia({reducedMotion:'reduce'})
      await page.goto(base,{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready)
      // Keep the screenshot in its authored resting state. A pointer left at
      // the viewport centre can open an ECharts hover tooltip after scrolling.
      await page.mouse.move(0,0)
      const source=indexTree(JSON.parse(await fs.readFile(path.join(sourceDirectory,`source-tree${width===375?'-mobile':''}-2026-10-19.json`))).root)
      if(width===1440) {
        const current=indexTree(JSON.parse(await fs.readFile(path.join(sourceDirectory,'revision-2026-10-28/hero/source-tree-2026-10-28.json'))).root);
        for(const [id,node] of current) source.set(id,node)
      }
      const sourceImage=width===1440
        ? await sharp(desktopExport).png().toBuffer()
        // 84px is the native Frame 630 Y offset. Device/browser chrome is not
        // website UI and must never be included in the mobile comparison.
        : await sharp(mobileExport).extract({left:0,top:84*3,width:375*3,height:Math.round(7566.0625*3)}).resize({width:750}).png().toBuffer()
      const sections=[]
      for(const id of width===1440?desktopIds:mobileIds) {
        if(id===(width===1440?'1412:5718':'1528:127')) await page.addStyleTag({content:'.patient-header,.patient-header *,.consult-float,.consult-float *,.home-source-hero__assistant,.home-source-hero__assistant *{visibility:hidden!important}'})
        sections.push(await compare(page,width,id,source,id==='1523:33' ? await sharp('artifacts/figma-home-2026-10-28/figma-1523-31-2x.png').png().toBuffer() : sourceImage))
      }
      results.push({width,errors,sections})
      await page.close()
    }
    await fs.writeFile(path.join(output,'qa.json'),JSON.stringify({createdAt:new Date().toISOString(),base,reference:desktopExport,pixelmatchOptions:{threshold:.15,includeAA:false},mobile:process.env.HUANYU_QA_WIDTHS==='1440'?'deferred by user':'historical full scope',results},null,2)+'\n')
    console.log(JSON.stringify(results,null,2))
    if(results.some(result=>result.errors.length||result.sections.some(section=>section.nMAE>=1||section.pixelmatchPercent>=1))) process.exitCode=1
  } finally {await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
