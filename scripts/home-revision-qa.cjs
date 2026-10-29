const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const sharp = require('sharp')

const directory = path.resolve('artifacts/figma-2026-10-19')
const base = 'http://127.0.0.1:5174'
async function capture(page, geometry) {
  if(geometry.height*2<=16000) return page.screenshot({fullPage:true})
  const tiles=[],viewport=page.viewportSize().height
  const captureStyle=await page.addStyleTag({content:'body.qa-capture header.patient-header,body.qa-capture header.patient-header *,body.qa-capture .consult-float,body.qa-capture .consult-float * {visibility:hidden!important}'} )
  for(let top=0;top<geometry.height;top+=viewport) {
    await page.evaluate(hidden=>document.body.classList.toggle('qa-capture',hidden),top>0)
    await page.evaluate(y=>scrollTo(0,y),top)
    await page.waitForTimeout(70)
    const actual=await page.evaluate(()=>scrollY)
    const bytes=await page.screenshot()
    const height=Math.min(viewport,geometry.height-top)
    tiles.push({input:await sharp(bytes).extract({left:0,top:Math.round((top-actual)*2),width:geometry.width*2,height:height*2}).toBuffer(),left:0,top:top*2})
  }
  await page.evaluate(()=>document.body.classList.remove('qa-capture'))
  await captureStyle.evaluate(el=>el.remove())
  await page.evaluate(()=>scrollTo(0,0))
  return sharp({create:{width:geometry.width*2,height:geometry.height*2,channels:4,background:'#fff'}}).composite(tiles).png().toBuffer()
}
async function main() {
  await fs.mkdir(directory, { recursive:true })
  const browser = await chromium.launch({ headless:true, executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const results=[]
  try {
    for(const width of [1440,375,320,390,430,768]) {
      const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:2})
      const errors=[]
      page.on('pageerror',error=>errors.push(error.message))
      await page.emulateMedia({reducedMotion:'reduce'})
      await page.goto(base,{waitUntil:'networkidle'})
      await page.evaluate(()=>document.fonts.ready)
      const geometry=await page.evaluate(()=>({
        width:innerWidth,height:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth,
        brokenImages:[...document.images].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src),
        stages:[...document.querySelectorAll('[id^="process-stage-"]')].map(el=>({id:el.id,y:el.getBoundingClientRect().y+scrollY,height:el.getBoundingClientRect().height})),
        sections:[...document.querySelectorAll('.home-figma-section')].map(el=>({label:el.getAttribute('aria-label'),y:el.getBoundingClientRect().y+scrollY,height:el.getBoundingClientRect().height})),
      }))
      const screenshot=path.join(directory,`revision-${width}.png`)
      const buffer=await capture(page,geometry)
      await sharp(buffer).resize({width}).png().toFile(screenshot)
      if(width===1440) {
        for(const stage of geometry.stages.slice(1)) {
          const no=stage.id.slice(-2)
          const current=path.join(directory,`journey-${no}-local.png`)
          await sharp(screenshot).extract({left:0,top:Math.round(stage.y),width,height:Math.round(stage.height)}).png().toFile(current)
          // The fixed rail follows page scroll by customer request; compare
          // source content separately, and verify the sticky rail as behavior.
          const crop={left:526,top:0,width:802,height:Math.round(stage.height)}
          const reference=path.join(directory,`journey-${no}-figma.png`)
          const a=await sharp(reference).resize({width:1440}).extract(crop).removeAlpha().raw().toBuffer()
          const b=await sharp(current).extract(crop).removeAlpha().raw().toBuffer()
          let difference=0
          for(let i=0;i<a.length;i++) difference+=Math.abs(a[i]-b[i])
          stage.contentNmae=100*difference/a.length/255
        }
        const faq=page.locator('[data-figma-node="1401:297"]')
        const second=page.locator('[data-figma-node="1401:307"]')
        await second.click()
        geometry.faqIndependent=await faq.getAttribute('aria-expanded')==='true'&&await second.getAttribute('aria-expanded')==='true'
        await faq.click()
        await page.waitForTimeout(450)
        geometry.faqSecondStaysOpen=await faq.getAttribute('aria-expanded')==='false'&&await second.getAttribute('aria-expanded')==='true'
        geometry.faqExpandedHeight=(await page.locator('#process-stage-03').boundingBox()).height
        geometry.caseLink=await page.locator('[data-figma-node="1401:274"]').getAttribute('href')
        geometry.diseaseLink=await page.locator('[data-figma-node="1401:269"]').getAttribute('href')
        await page.screenshot({path:path.join(directory,'revision-faq-open.png')})
      }
      if(width===375) {
        const section=geometry.sections.find(s=>s.label==='中国医疗数据优势')
        await sharp(screenshot).extract({left:0,top:Math.round(section.y),width,height:Math.round(section.height)}).png().toFile(path.join(directory,'revision-chart-375.png'))
      }
      results.push({...geometry,errors})
      await page.close()
    }
    await fs.writeFile(path.join(directory,'revision-qa.json'),JSON.stringify(results,null,2)+'\n')
    console.log(JSON.stringify(results,null,2))
    if(results.some(r=>r.errors.length||r.brokenImages.length||r.scrollWidth>r.width)||results[0].faqIndependent!==true||results[0].faqSecondStaysOpen!==true||results[0].caseLink!=='/cases'||results[0].diseaseLink!=='/diseases-technologies') process.exitCode=1
  } finally { await browser.close() }
}
main().catch(error=>{console.error(error);process.exitCode=1})
