// Local UI regression only. --stress injects synthetic copy in browser memory;
// it never writes language catalogs or submits patient data.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base=process.env.HUANYU_QA_URL||'http://127.0.0.1:5173'
assert.match(base,/^http:\/\/127\.0\.0\.1:/)
const out=path.resolve(process.env.HUANYU_QA_OUTPUT||'artifacts/i18n-20261104/site-qa')
fs.mkdirSync(out,{recursive:true})
const stress=process.argv.includes('--stress')
const languages=process.env.HUANYU_QA_LANGUAGES?.split(',')||(stress?['en','pt']:['zh','en','id','ms','pt'])
const widths=process.env.HUANYU_QA_WIDTHS?process.env.HUANYU_QA_WIDTHS.split(',').map(Number):[1440,1024,390]
const routes=process.env.HUANYU_QA_ROUTES?process.env.HUANYU_QA_ROUTES.split(','):['/','/dental','/dental/doctors/tan-zhaolin','/hospitals','/doctors','/trust','/diseases-technologies','/why-china','/cases','/insurance','/steps','/steps/toolkit-detail','/about','/report']
const source=JSON.parse(fs.readFileSync('src/i18n/site-copy/zh.json','utf8'))
const report={checkedAt:new Date().toISOString(),mode:stress?'synthetic long-copy stress; not translation acceptance':'actual catalogs',results:[],errors:[]}
async function inject(page,language){
 if(!stress)return
 const word=language==='pt'?'Atendimento médico':'Medical services'
 const copy=Object.fromEntries(Object.entries(source).filter(([,v])=>/[\u3400-\u9fff]/.test(v)).map(([k,v])=>[k,word.repeat(Math.max(1,Math.ceil(v.length/9))).replaceAll(word,word+' ').trim()+' '+[...v.matchAll(/\{\w+\}/g)].map(m=>m[0]).join(' ')]))
 await page.evaluate(async({copy,language})=>{const {default:i}=await import('/src/i18n/index.ts');const {useAppStore}=await import('/src/stores/app.ts');i.global.mergeLocaleMessage(language,{siteCopy:copy});await useAppStore().setLocale('zh')},{copy,language})
 await page.evaluate(async language=>{const {useAppStore}=await import('/src/stores/app.ts');await useAppStore().setLocale(language)},language)
}
async function scan(page,{canvas=true}={}){return page.evaluate(async({canvas})=>{
 const outside=[],clipped=[],han=[]
 const candidates=[...document.querySelectorAll('.home-source-node--text,main p,main h1,main h2,main h3,main button,dialog p,dialog h2,dialog h3')]
 const shown=el=>{const r=el.getBoundingClientRect(),c=getComputedStyle(el);if(r.width<=1||r.height<=1||r.bottom<=0||r.top>=innerHeight||c.visibility==='hidden'||c.display==='none'||c.clipPath==='inset(50%)'||el.closest('[inert]'))return false;for(let p=el;p;p=p.parentElement)if(getComputedStyle(p).opacity==='0'||p.getAttribute('aria-hidden')==='true'&&!p.closest('.home-source-node--text'))return false;return true}
 for(const el of candidates.filter(shown)){
  const r=el.getBoundingClientRect(),c=getComputedStyle(el)
  const entry={id:el.dataset.figmaNode||el.className,text:el.innerText?.slice(0,100)}
  let horizontalScroll=false,p=el.parentElement
  while(p&&p!==document.body){const s=getComputedStyle(p);if(['auto','scroll'].includes(s.overflowX)||/carousel|photos|marquee|mosaic|slider|track/.test(p.className||'')){horizontalScroll=true;break}p=p.parentElement}
  if(!horizontalScroll&&(r.left < -2 || r.right > innerWidth+2))outside.push(entry)
  if(c.webkitLineClamp==='none'&&['hidden','clip'].includes(c.overflowY)&&el.scrollHeight>el.clientHeight+5)clipped.push(entry)
  if(!horizontalScroll&&['nowrap','pre'].includes(c.whiteSpace)&&el.scrollWidth>el.clientWidth+5)clipped.push({...entry,reason:'unwrapped text wider than its box'})
  if(!document.documentElement.lang.startsWith('zh')&&el.classList.contains('home-source-node--text')){
   for(const child of el.childNodes){
    if(child.nodeType!==Node.TEXT_NODE||!/[\p{L}\p{N}]/u.test(child.textContent))continue
    const range=document.createRange()
    const rects=[]
    // Trailing spaces have a range box even when CSS drops them at a wrap.
    // Natural font ascenders also extend beyond a tight authored line-height.
    for(const word of child.textContent.matchAll(/\S+/g)){
     range.setStart(child,word.index);range.setEnd(child,word.index+word[0].length)
     rects.push(...range.getClientRects())
    }
    const scale=el.offsetHeight?r.height/el.offsetHeight:1
    const verticalAllowance=Math.max(3,(Math.max(0,...rects.map(x=>x.height))-parseFloat(c.lineHeight)*scale)/2+1)
    if(rects.some(text=>text.left<r.left-3||text.right>r.right+3||text.top<r.top-verticalAllowance||text.bottom>r.bottom+verticalAllowance))clipped.push({...entry,reason:'translated text exceeds measured box after font leading allowance'})
   }
  }
 }
 for(const label of document.querySelectorAll('.button-label')){
  if(!shown(label))continue
  const control=label.closest('button,a');if(!control)continue
  const range=document.createRange();range.selectNodeContents(label)
  const text=range.getBoundingClientRect(),box=control.getBoundingClientRect()
  if(text.left<box.left-2||text.right>box.right+2||text.top<box.top-2||text.bottom>box.bottom+2)clipped.push({id:control.className,text:label.textContent?.slice(0,100),reason:'label exceeds its control'})
 }
 const overlaps=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2
 const heroCopy=document.querySelector('[data-figma-node="1528:135"]')
 const heroAction=document.querySelector('[data-figma-node="1528:142"]')
 if(heroCopy&&heroAction&&shown(heroCopy)&&shown(heroAction)&&overlaps(heroCopy.getBoundingClientRect(),heroAction.getBoundingClientRect()))clipped.push({id:'1528:142',reason:'homepage hero action overlaps heading or subtitle'})
 const toolkitRail=document.querySelector('.trust-desktop-source [data-figma-node="204:5638"]')
 if(toolkitRail&&shown(toolkitRail))for(const column of document.querySelectorAll('.trust-desktop-source :is([data-figma-node="204:5644"],[data-figma-node="204:5820"],[data-figma-node="204:6018"])'))if(shown(column)&&overlaps(toolkitRail.getBoundingClientRect(),column.getBoundingClientRect()))clipped.push({id:'204:5638',reason:'toolkit sticky title overlaps its content column'})
 const department=document.querySelector('.physician-department-filter')
 if(department&&shown(department))for(const tab of document.querySelectorAll('.physician-page [role="tab"]'))if(shown(tab)&&overlaps(department.getBoundingClientRect(),tab.getBoundingClientRect()))clipped.push({id:tab.dataset.figmaNode,reason:'department selector overlaps a shortcut'})
 if(department&&shown(department))for(const card of document.querySelectorAll('[data-physician-card]'))if(shown(card)&&overlaps(department.getBoundingClientRect(),card.getBoundingClientRect()))clipped.push({id:card.dataset.figmaNode,reason:'department selector overlaps a physician card'})
 for(const header of document.querySelectorAll('.insurance-path-grid header')){
  const heading=header.querySelector('h3'),badge=header.querySelector(':scope>span')
  if(heading&&badge&&shown(header)){
   // The heading block also spans the wider subtitle. Check rendered title
   // glyphs, since the badge can safely share the block's unused space.
   const range=document.createRange();range.selectNodeContents(heading)
   if([...range.getClientRects()].some(rect=>overlaps(rect,badge.getBoundingClientRect())))clipped.push({id:header.parentElement.className,reason:'insurance badge overlaps heading'})
  }
 }
 for(const strip of document.querySelectorAll('[data-hospital-tabs]'))if(shown(strip)){
  if(strip.clientHeight<12)clipped.push({id:strip.dataset.figmaNode,reason:'hospital tab strip has no readable height'})
  for(const text of strip.querySelectorAll('.home-source-node--text'))if(text.getBoundingClientRect().height>parseFloat(getComputedStyle(text).lineHeight)*1.5)clipped.push({id:text.dataset.figmaNode,reason:'translated hospital tab wraps into a narrow column'})
 }
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT)
 while(walker.nextNode()){
  const n=walker.currentNode,e=n.parentElement,text=n.textContent.trim()
  if(!/[\u3400-\u9fff]/.test(text)||!e||!shown(e)||e.closest('script,style,.brand-logo,[data-source-brand],.home-source-node__accessible-text,.language-menu,.hospital-languages,.physician-languages,#patient-navigation-language')||text==='寰')continue
  const r=document.createRange();r.selectNodeContents(n);const b=r.getBoundingClientRect();if(b.width&&b.height)han.push({id:e.dataset.figmaNode||e.className,text:text.slice(0,150)})
 }
 for(const el of document.querySelectorAll('[aria-label],[title],input[placeholder],textarea[placeholder],img[alt]')){
  if(!shown(el)||el.closest('.brand-logo,.language-menu,.hospital-languages,.physician-languages,#patient-navigation-language'))continue
  for(const attr of ['aria-label','title','placeholder','alt']){const text=el.getAttribute(attr);if(text&&/[\u3400-\u9fff]/.test(text))han.push({id:el.dataset.figmaNode||el.className,attribute:attr,text:text.slice(0,150)})}
 }
 // Canvas labels are absent from the DOM text walker. Inspect the chart's
 // actual option after the same language-switch path used by the UI.
 const charts=[...document.querySelectorAll('[_echarts_instance_]')].filter(shown)
 if(canvas&&charts.length&&!document.documentElement.lang.startsWith('zh')){
  const {getInstanceByDom}=await import('/node_modules/.vite/deps/echarts_core.js')
  for(const element of charts){
   const option=getInstanceByDom(element)?.getOption();if(!option)continue
   const labels=[...(option.xAxis||[]).flatMap(x=>x.data||[]),...(option.yAxis||[]).flatMap(x=>x.data||[]),...(option.legend||[]).flatMap(x=>x.data||[]),...(option.radar||[]).flatMap(x=>x.indicator||[]),...(option.series||[]).map(x=>x.name)].map(x=>typeof x==='string'?x:x?.name)
   for(const text of labels)if(text&&/[\u3400-\u9fff]/.test(text))han.push({id:element.className,attribute:'canvas-label',text})
  }
 }
 return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,outside:outside.slice(0,30),clipped:clipped.slice(0,30),untranslated:han.slice(0,50)}
},{canvas})}
async function settle(page){await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))}
module.exports={inject,scan,settle}
if(require.main===module)(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'})
 page.setDefaultTimeout(12000)
 page.on('pageerror',error=>report.errors.push({url:page.url(),message:error.message}))
 // Never send forms during layout QA.
 await page.route('**/api/**',route=>route.request().method()==='GET'?route.continue():route.abort())
 try{
  for(const width of widths)for(const language of languages)for(const route of routes){
   await page.setViewportSize({width,height:900})
   const url=new URL(route,base);url.searchParams.set('lang',language)
   await page.goto(url.href,{waitUntil:'networkidle'})
   await inject(page,language);await settle(page)
   const slug=(route==='/'?'home':route.slice(1).replaceAll('/','-'))+'-'+language+'-'+width
   const initial=await scan(page), samples=[]
   const height=await page.evaluate(()=>document.documentElement.scrollHeight)
   // Warm lazy sections and inspect all visible content, including the footer.
   for(let top=0;top<height;top+=700){
    await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),top)
    await page.waitForTimeout(60);samples.push(await scan(page))
   }
   for(const [label,fraction] of [['top',0],['middle',.5],['bottom',1]]){
    await page.evaluate(f=>window.scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:'instant'}),fraction)
    await page.waitForTimeout(90);await page.screenshot({path:path.join(out,slug+'-'+label+'.png')})
   }
   const dedupe=key=>[...new Map([initial,...samples].flatMap(x=>x[key]).map(x=>[JSON.stringify(x),x])).values()]
   const result={route,language,width,url:page.url(),documentOverflow:initial.documentWidth>width+1,outside:dedupe('outside'),clipped:dedupe('clipped'),untranslated:dedupe('untranslated')}
   report.results.push(result);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
   console.log(JSON.stringify({route,language,width,outside:result.outside.length,clipped:result.clipped.length,untranslated:result.untranslated.length}))
  }
 }finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2))}
 if(report.errors.length||report.results.some(x=>x.documentOverflow||x.outside.length||x.clipped.length||x.language!=='zh'&&x.untranslated.length))process.exitCode=1
})().catch(error=>{console.error(error);process.exitCode=1})
