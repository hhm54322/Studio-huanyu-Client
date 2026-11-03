// Local state regression; no patient forms or external messages are submitted.
const fs=require('node:fs'),path=require('node:path')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const {inject,scan,settle}=require('./site-i18n-qa.cjs')
const out=path.resolve(process.env.HUANYU_QA_OUTPUT||'artifacts/i18n-20261104/states-qa')
fs.mkdirSync(out,{recursive:true})
const report={checkedAt:new Date().toISOString(),mode:process.argv.includes('--stress')?'synthetic long-copy state regression; not translation acceptance':'actual catalogs',results:[],errors:[]}
const widths=(process.env.HUANYU_QA_WIDTHS||'1440,1024,390').split(',').map(Number)
const languages=process.env.HUANYU_QA_LANGUAGES?.split(',')||(process.argv.includes('--stress')?['pt']:['zh','en','id','ms','pt'])
let page
async function load(route,language){const url=new URL(route,'http://127.0.0.1:5173');url.searchParams.set('lang',language);await page.goto(url.href,{waitUntil:'networkidle'});await inject(page,language);await settle(page)}
async function check(state,language,width){
 await settle(page)
 const samples=[await scan(page)]
 await page.screenshot({path:path.join(out,`${state}-${language}-${width}-top.png`)})
 const scrolls=await page.locator('dialog[open], [role="dialog"],dialog[open] div').evaluateAll(elements=>elements.filter(el=>el.scrollHeight>el.clientHeight+10&&['auto','scroll'].includes(getComputedStyle(el).overflowY)).map(el=>{el.dataset.i18nQaScroll='true';return el.scrollHeight}))
 const scrollers=page.locator('[data-i18n-qa-scroll]')
 for(let i=0;i<scrolls.length;i++)for(let top=600;top<scrolls[i]+600;top+=600){await scrollers.nth(i).evaluate((el,top)=>{el.scrollTop=top},top);await page.waitForTimeout(40);samples.push(await scan(page))}
 await page.screenshot({path:path.join(out,`${state}-${language}-${width}.png`)})
 await scrollers.evaluateAll(elements=>elements.forEach(el=>{el.scrollTop=0;delete el.dataset.i18nQaScroll}))
 await page.waitForTimeout(80)
 const dedupe=key=>[...new Map(samples.flatMap(item=>item[key]).map(item=>[JSON.stringify(item),item])).values()]
 const result={state,language,width,url:page.url(),documentOverflow:samples.some(x=>x.documentWidth>width+1),outside:dedupe('outside'),clipped:dedupe('clipped'),untranslated:dedupe('untranslated')}
 if(state.startsWith('trust-article-')){
  // These article panels have an authored 32px inset. Viewport-only overflow
  // checks miss a double-applied relative offset that consumes that padding.
  const crossed=await page.locator('dialog[open] .home-source-node--root').evaluate(root=>{
   const panel=root.getBoundingClientRect()
   return [...root.querySelectorAll('.home-source-node--text')].flatMap(el=>{
    const r=el.getBoundingClientRect()
    return r.left<panel.left+31||r.right>panel.right-31?[{id:el.dataset.figmaNode,reason:'text crosses article padding'}]:[]
   })
  })
  result.outside.push(...crossed)
 }
 report.results.push(result);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2))
 console.log(JSON.stringify({state,language,width,outside:result.outside.length,clipped:result.clipped.length,untranslated:result.untranslated.length}))
}
async function click(selector){await page.locator(selector).first().click();await page.waitForTimeout(80)}
async function close(){await page.keyboard.press('Escape');await page.waitForTimeout(80)}
;(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
 page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});page.setDefaultTimeout(10000)
 page.on('pageerror',error=>report.errors.push({url:page.url(),message:error.message}))
 await page.route('**/api/**',route=>route.request().method()==='GET'?route.continue():route.abort())
 const groups=process.env.HUANYU_QA_STATES?.split(',')||['home','cases','doctors','hospitals','dental','articles','trust','report','consultation']
 try{for(const width of widths)for(const language of languages){await page.setViewportSize({width,height:900})
  if(groups.includes('home')){
   await load('/',language)
   // Frozen mobile Figma exposes two why/expert cards; desktop exposes six/four.
   for(let index=0;index<(width<=700?2:6);index++){
    await click(`[data-source-action="why:${index}"]`);await page.locator('dialog[open]').waitFor();await check(`home-why-${index+1}`,language,width);await close()
   }
   await click('[data-source-action^="story:"]:not([data-source-action="story:close"])');await page.locator('dialog[open]').waitFor();await check('home-story',language,width);await close()
   for(let index=0;index<(width<=700?2:4);index++){
    await click(`[data-source-action="doctor:${index}"]`);await page.locator('dialog[open]').waitFor()
    const tabs=await page.locator('dialog[open] [role="tab"]').count()
    for(let tab=0;tab<tabs;tab++){await click(`dialog[open] #expert-tab-${tab}`);await check(`home-expert-${index+1}-${tab+1}`,language,width)}await close()
   }
  }
  if(groups.includes('cases')){
   await load('/cases',language);await click('.case-match-button');await page.locator('.matcher-dialog').waitFor();await check('case-matcher',language,width)
   for(const selector of ['.matcher-options--wide button','.matcher-dialog fieldset:nth-of-type(2) button','.matcher-dialog fieldset:nth-of-type(3) button'])await click(selector)
   await click('.matcher-dialog footer button');await check('case-matched',language,width)
  }
  if(groups.includes('doctors')){
   await load('/doctors',language);const values=await page.locator('#physician-department option').evaluateAll(items=>items.map(x=>x.value));await page.locator('#physician-department').selectOption(values.find(Boolean));await check('doctor-filtered',language,width)
   // A document-supplied profile uses a distinct dialog from Figma experts.
   await click('[data-physician-card]');await page.locator('dialog[open]').waitFor()
   const tabs=await page.locator('.physician-profile-dialog [role="tab"]').count()
   for(let index=0;index<tabs;index++){await page.locator('.physician-profile-dialog [role="tab"]').nth(index).click();await check(`doctor-profile-${index+1}`,language,width)}await close()
  }
  if(groups.includes('hospitals')){
   await load('/hospitals',language)
   await click('[data-source-action="hospital:上海曜影医院"]');await page.locator('dialog[open]').waitFor()
   for(let tab=0;tab<6;tab++){await click(`.hospital-dialog [data-source-action="tab:${tab}"]`);await page.waitForTimeout(150);await check(`hospital-detail-${tab+1}`,language,width)}await close()
  }
  if(groups.includes('dental')){
   if(width>700){
    for(const doctor of ['tan-zhaolin','che-yinglin'])for(const tab of ['profile','treatment','cases','reviews','services']){
     await load(`/dental/doctors/${doctor}?tab=${tab}`,language);await check(`dental-${doctor}-${tab}`,language,width)
     if(tab==='cases'){const toggle=page.locator('[aria-controls^="dental-case-copy-"]').first();if(await toggle.count()){await toggle.click();await check(`dental-${doctor}-case-expanded`,language,width)}}
    }
   }
   await load('/dental?step=3&doctor=tan-zhaolin',language);await check('dental-quote-form',language,width)
  }
  if(groups.includes('articles')&&width>900){for(const key of ['assessment','visa','medication-entry','companions','muslim','steps-flow']){await load(`/steps/toolkit-detail?article=${key}`,language);await check(`toolkit-${key}`,language,width)}}
  if(groups.includes('trust')){
   await load('/trust',language)
   if(width>900){
    for(const key of ['jci','cost','doctor','medicine','infection','rights','privacy','muslim']){await click(`[data-trust-article="${key}"]`);await page.locator('dialog[open]').waitFor();await check(`trust-article-${key}`,language,width);await close()}
    for(const id of ['143:2611','143:2619','143:2627']){await click(`[data-figma-node="${id}"]`);await check(`trust-faq-${id.replace(':','-')}`,language,width)}
   }else{
    await click('[aria-controls="jci-truth-dialog"]');await page.locator('dialog[open],[role="dialog"]').waitFor();await check('trust-jci-mobile',language,width);await close()
    for(let index=1;index<4;index++){await click(`[aria-controls="trust-faq-answer-${index}"]`);await check(`trust-faq-${index}`,language,width)}
   }
  }
  if(groups.includes('report')){
   await load('/report',language);await click('.report-form-actions button');await check('report-validation',language,width)
  }
  if(groups.includes('consultation')){await load('/',language);await page.evaluate(()=>window.dispatchEvent(new CustomEvent('open-consultation')));await page.locator('.consult-overlay').waitFor();await check('consultation-form',language,width);await close()}
 }}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2))}
 if(report.errors.length||report.results.some(x=>x.documentOverflow||x.outside.length||x.clipped.length||x.language!=='zh'&&x.untranslated.length))process.exitCode=1
})().catch(error=>{report.errors.push({message:error.message});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.error(error);process.exitCode=1})
