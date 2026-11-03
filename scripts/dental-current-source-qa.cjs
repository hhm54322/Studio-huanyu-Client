const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root=path.resolve(__dirname,'..'),base=path.join(root,'docs/figma-source/dental-revision-2026-10-28'),output=path.resolve(process.env.HUANYU_QA_OUTPUT||path.join(root,'artifacts/figma-dental-2026-10-28/visual')),references=path.join(root,'artifacts/figma-dental-2026-10-28/source')
const read=async(name,kind)=>JSON.parse(await fs.readFile(path.join(base,name,`${kind}-2026-10-28.json`),'utf8'))
const sel=id=>`[data-figma-node="${id}"]`
// A tab mounts new source text. Wait for the native-baseline alignment to
// finish its fonts-ready/nextTick cycle before capturing the settled state.
const settled=page=>page.evaluate(async()=>{
 await document.fonts.ready
 // Dialog backgrounds start loading when their source subtree is mounted.
 // Wait for the actual image decodes before comparing, including on the CDN.
 const urls=new Set()
 for(const element of document.querySelectorAll('.dental-source-canvas *, .dental-source-dialog__clip *')){
  if(!element.getClientRects().length)continue
  for(const match of getComputedStyle(element).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))urls.add(match[1])
 }
 await Promise.all([...urls].map(async url=>{const image=new Image();image.src=url;await image.decode()}))
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
})
async function fullContent(page,name){
 const model=await read(name,'dialog-model'),source=await read(name,'source-tree'),clip=page.locator('.dental-source-dialog__clip'),position=page.locator('.dental-source-dialog__position')
 const original={clip:await clip.getAttribute('style'),position:await position.getAttribute('style')}
 await page.setViewportSize({width:1440,height:Math.round(source.root.height)})
 await settled(page)
 await clip.evaluate((el,height)=>{el.style.height=`${height}px`;el.scrollTop=0},model.height)
 // This extra content check expands the 640px scrolling viewport to the
 // authored full frame. Keep that frame's native origin as well as its size;
 // centering a fractional-height panel would add a false raster offset.
 await position.evaluate((el,model)=>{Object.assign(el.style,{position:'absolute',left:`${model.sourceX}px`,top:`${model.sourceY}px`,margin:'0',height:`${model.height}px`})},model)
 await settled(page)
 const local=path.join(output,name+'-full-local.png');await clip.screenshot({path:local})
 const result=await compare(name+'-full',local,path.join(references,name+'-figma.png'),{left:model.sourceX,top:model.sourceY,width:model.width,height:model.height})
 await page.setViewportSize({width:1440,height:756})
 await clip.evaluate((el,style)=>el.setAttribute('style',style),original.clip)
 await position.evaluate((el,style)=>el.setAttribute('style',style),original.position)
 return result
}
async function compare(name,local,reference,rect){
 const target=path.join(output,name+'-reference.png'),meta=await sharp(reference).metadata()
 let image=sharp(reference);if(rect)image=image.extract(Object.fromEntries(Object.entries(rect).map(([key,value])=>[key,Math.round(value*2)])))
 await image.flatten({background:'#fff'}).ensureAlpha().png().toFile(target)
 const a=await sharp(target).raw().toBuffer({resolveWithObject:true}),localMeta=await sharp(local).metadata()
 // Figma keeps 773.3333 CSS px for the institution panel. Chromium's element
 // screenshot rounds that outer box upward, producing one extra device row.
 // Compare the common raster extent; never resize the content to hide drift.
 const extraRasterRow=rect&&!Number.isInteger(rect.height)&&localMeta.height===a.info.height+1
 const extraRasterColumn=rect&&!Number.isInteger(rect.width)&&localMeta.width===a.info.width+1
 let localRasterInput=sharp(local)
 if(extraRasterRow||extraRasterColumn) localRasterInput=localRasterInput.extract({left:0,top:0,width:a.info.width,height:a.info.height})
 const localRaster=extraRasterRow||extraRasterColumn?await localRasterInput.png().toBuffer():await fs.readFile(local)
 const b=await sharp(localRaster).flatten({background:'#fff'}).ensureAlpha().raw().toBuffer({resolveWithObject:true})
 assert.equal(b.info.width,a.info.width,`${name} width`);assert.equal(b.info.height,a.info.height,`${name} height`)
 let sum=0;for(let i=0;i<a.data.length;i+=4)for(let c=0;c<3;c++)sum+=Math.abs(a.data[i+c]-b.data[i+c])
 const pixelmatch=(await import('/tmp/huanyu-visual-qa-tools/node_modules/pixelmatch/index.js')).default
 const diff=Buffer.alloc(a.data.length),pixels=pixelmatch(a.data,b.data,diff,a.info.width,a.info.height,{threshold:.15,includeAA:false})
 await sharp(diff,{raw:a.info}).png().toFile(path.join(output,name+'-diff.png'))
 await sharp({create:{width:a.info.width*2,height:a.info.height,channels:4,background:'#fff'}}).composite([{input:target,left:0,top:0},{input:localRaster,left:a.info.width,top:0}]).png().toFile(path.join(output,name+'-comparison.png'))
 return {name,nMAE:100*sum/(a.info.width*a.info.height*3)/255,pixelmatchPercent:100*pixels/(a.info.width*a.info.height),reference:target,figma:reference,local,...(extraRasterRow||extraRasterColumn?{rasterNormalization:{localWidth:localMeta.width,localHeight:localMeta.height,comparisonWidth:a.info.width,comparisonHeight:a.info.height,reason:'One device column/row from fractional Figma geometry; common raster extent, no resizing'}}:{})}
}
async function main(){
 await fs.mkdir(output,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),errors=[],results=[]
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1156},deviceScaleFactor:2,reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message))
 await page.goto((process.env.HUANYU_QA_URL||'http://127.0.0.1:5174')+'/dental',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready)
 for(const [index,name]of ['project','matching','upload'].entries()){
  if(index)await page.locator(sel(index===1?'2294:8336':'2294:7209')).click()
  await page.locator(`[data-dental-step="${index+1}"]`).waitFor()
  const t=await read(name,'source-tree');await page.setViewportSize({width:1440,height:index===0?2384:t.root.height});await page.evaluate(()=>window.scrollTo(0,0));await settled(page);await page.waitForTimeout(200)
  // The customer confirmed the complete 8-project source 231:88 alongside
  // the short 2294:8240 first-screen state. Compare every restored row and
  // footer against the full official source, without truncating the page.
  const reference=index===0?path.join(root,'artifacts/hero-full-bleed-2026-10-30/source/dental-complete-figma.png'):path.join(references,name+'-figma.png')
  const local=path.join(output,name+'-local.png');await page.locator('.dental-source-canvas').screenshot({path:local})
  if(name==='matching'){
   // The approved directory adds six document-backed doctors. Compare its
   // unchanged source shell, retained card and footer separately; a full-frame
   // comparison would incorrectly count approved content/height as drift.
   const top=path.join(output,'matching-shell-local.png');await page.screenshot({path:top,clip:{x:0,y:0,width:1440,height:908}});results.push(await compare('matching-shell',top,reference,{left:0,top:0,width:1440,height:908}))
   const card=path.join(output,'matching-original-card-local.png');await page.locator('[data-doctor="5"]').screenshot({path:card});results.push(await compare('matching-original-card',card,reference,{left:112,top:908,width:389.33334,height:496}))
   const footer=path.join(output,'matching-footer-local.png');await page.locator(sel('2294:7214')).screenshot({path:footer});results.push(await compare('matching-footer',footer,reference,{left:0,top:1596,width:1440,height:456}))
  }else results.push(await compare(name,local,reference))
 }
 await page.locator(sel('2294:8060')).click();await page.locator('[data-dental-step="2"]').waitFor();await page.setViewportSize({width:1440,height:756});await page.getByRole('button',{name:'查看谭兆林医生详情',exact:true}).click();await page.evaluate(()=>document.fonts.ready)
 for(const [index,name]of ['profile','treatment-scroll','cases','reviews','services-scroll'].entries()){
  if(index)await page.getByRole('tab').nth(index).click()
  await page.waitForFunction(index=>document.querySelector('dialog[open]')?.getAttribute('data-active-tab')===String(index)&&document.querySelector('.dental-source-dialog__clip')?.getAttribute('aria-busy')!=='true',index)
  const model=await read(name,'dialog-model');const local=path.join(output,name+'-local.png');await settled(page);await page.locator('.dental-source-dialog__clip').screenshot({path:local})
  results.push(await compare(name,local,path.join(references,name+'-figma.png'),{left:model.sourceX,top:model.sourceY,width:model.width,height:model.mask?.height||model.height}))
  const viewport=page.locator('.dental-source-dialog__clip');if(index===1){await viewport.evaluate(el=>el.scrollTop=el.scrollHeight);assert.equal(await page.locator(sel('2294:7912')).isVisible(),true);assert.ok(await page.locator(sel('2294:7912')).evaluate(el=>el.getBoundingClientRect().bottom)<=698,'Treatment 06 remains clipped');results.push(await fullContent(page,'treatment'))}
  if(index===4){await viewport.evaluate(el=>el.scrollTop=el.scrollHeight);assert.ok(await page.locator(sel('2294:7486')).evaluate(el=>el.getBoundingClientRect().bottom)<=698,'Tenth service remains clipped');results.push(await fullContent(page,'services'))}
 }
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'查看博远口腔',exact:true}).click();await page.locator('dialog[open]').waitFor();await settled(page);const local=path.join(output,'institution-local.png');await page.locator('.dental-source-dialog__clip').screenshot({path:local});results.push(await compare('institution',local,path.join(references,'institution-figma.png'),{left:272,top:40,width:896,height:640}));results.push(await fullContent(page,'institution'));await page.keyboard.press('Escape')
 await fs.writeFile(path.join(output,'qa.json'),JSON.stringify({createdAt:new Date().toISOString(),results,errors},null,2));console.log(JSON.stringify({results:results.map(({name,nMAE,pixelmatchPercent})=>({name,nMAE,pixelmatchPercent})),errors},null,2));assert.deepEqual(errors,[]);for(const r of results)assert.ok(r.nMAE<1&&r.pixelmatchPercent<1,`${r.name}: screenshot exceeds 1%`)
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
