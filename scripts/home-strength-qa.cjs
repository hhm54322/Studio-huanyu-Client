const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const sharp = require('sharp')

const directory=path.resolve('artifacts/figma-2026-10-19')
async function error(reference,actual) {
  const a=await sharp(reference).resize({width:1440}).removeAlpha().raw().toBuffer()
  const b=await sharp(actual).resize({width:1440}).removeAlpha().raw().toBuffer()
  if(a.length!==b.length) throw Error('Reference/actual geometry mismatch')
  let difference=0
  for(let i=0;i<a.length;i++) difference+=Math.abs(a[i]-b[i])
  return 100*difference/a.length/255
}
async function main() {
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
  const results=[]
  try {
    for(const width of [1440,375,320,430]) {
      const page=await browser.newPage({viewport:{width,height:960},deviceScaleFactor:2})
      await page.emulateMedia({reducedMotion:'reduce'})
      await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready)
      await page.addStyleTag({content:'header.patient-header,header.patient-header *, .consult-float,.consult-float * {visibility:hidden!important}'})
      const section=page.locator('.home-strength-source')
      for(let index=0;index<3;index++) {
        await section.scrollIntoViewIfNeeded()
        if(index) await section.press('ArrowRight')
        await page.waitForTimeout(120)
        const filename=path.join(directory,`strength-${index+1}-local-${width}.png`)
        await section.screenshot({path:filename})
        const reference=path.join(directory,`strength-0${index+1}-figma.png`)
        const available=await fs.access(reference).then(()=>true,()=>false)
        results.push({width,state:index+1,geometry:await section.boundingBox(),nMAE:width===1440&&available?await error(reference,filename):null,
          description:await section.locator('[data-figma-node="1528:757"]').allTextContents(),
          mosaic:await section.locator('.home-strength-source__mobile-mosaic').evaluateAll(nodes=>nodes.map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,child:el.firstElementChild.getBoundingClientRect().toJSON()})))})
      }
      if(width===320) {
        await page.evaluate(()=>scrollTo(0,0))
        await page.screenshot({path:path.join(directory,'revision-first-320.png')})
      }
      await page.close()
    }
    await fs.writeFile(path.join(directory,'strength-static-qa.json'),JSON.stringify(results,null,2)+'\n')
    console.log(JSON.stringify(results,null,2))
  } finally {await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
