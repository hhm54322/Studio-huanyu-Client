const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const origin=process.env.HUANYU_QA_URL||'http://127.0.0.1:5351'
const out=path.resolve(process.env.HUANYU_QA_OUTPUT||'artifacts/performance-exhaustive-2026-11-01/hospital-card-loading')
async function decode(card){
 await card.scrollIntoViewIfNeeded()
 await card.evaluate(async element=>{
  while(element.dataset.sourceImages!=='loaded')await new Promise(requestAnimationFrame)
  const urls=new Set()
  for(const node of [element,...element.querySelectorAll('*')]){
   if(node instanceof HTMLImageElement&&node.currentSrc)urls.add(node.currentSrc)
   for(const match of getComputedStyle(node).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(match[1])
  }
  await Promise.all([...urls].map(async url=>{const image=new Image();image.src=url;await image.decode()}))
 })
}
async function main(){
 await fs.mkdir(out,{recursive:true})
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 try{
  await page.goto(origin+'/hospitals',{waitUntil:'networkidle'})
  const cards=page.locator('[data-hospital-card]')
  assert.equal(await cards.count(),9)
  const initial=await cards.evaluateAll(elements=>elements.map(element=>({id:element.dataset.figmaNode,state:element.dataset.sourceImages,top:element.getBoundingClientRect().top,hiddenImages:[...element.querySelectorAll('[style]')].some(child=>getComputedStyle(child).backgroundImage.includes('url('))})))
  const deferred=initial.filter(card=>card.state==='deferred')
  assert.ok(deferred.length>=3,'Distant card images were loaded immediately')
  assert.ok(deferred.every(card=>card.top>1200&&!card.hiddenImages),'Deferred source CSS still requests photos')
  const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(entry=>/\/images\//.test(entry.name)).map(entry=>({name:entry.name,bytes:entry.encodedBodySize})))
  await decode(cards.last());await cards.last().screenshot({path:path.join(out,'jump-to-last.png')})
  for(const card of await cards.all())await decode(card)
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
  assert.equal(await page.locator('[data-hospital-card][data-source-images="deferred"]').count(),0,'Loaded images were unloaded on return')
  await page.locator('[data-figma-node="144:4733"]').click()
  assert.equal(await cards.count(),52)
  await decode(cards.last());await cards.last().screenshot({path:path.join(out,'filtered-last.png')})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),1440)
  // Resizing retains the existing phone rendering; this optimization is desktop-only.
  await page.setViewportSize({width:390,height:844})
  await page.waitForTimeout(150)
  assert.equal(await page.locator('[data-hospital-card][data-source-images]').count(),0)
  assert.deepEqual(errors,[])
  const report={checkedAt:new Date().toISOString(),origin,initial,initialImageBytes:resources.reduce((sum,r)=>sum+r.bytes,0),resources,jumpAndDecode:true,loadedImagesRetained:true,filteredDirectory:52,phoneLoadingUnchanged:true,errors}
  await fs.writeFile(path.join(out,'qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))
 }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
