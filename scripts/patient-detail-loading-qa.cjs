// Verify delayed authored-source downloads never replace a newer tab or
// reopen a closed dialog. All traffic stays on the selected QA origin.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const origin=(process.env.HUANYU_QA_URL||'http://127.0.0.1:5351').replace(/\/$/,'')
const out=path.resolve(process.env.HUANYU_QA_OUTPUT||'artifacts/performance-exhaustive-2026-11-01/detail-races')
async function sourceChunk(id){
 const candidates=[]
 for(const file of await fs.readdir('dist/assets'))if(file.startsWith('source-tree-')&&file.endsWith('.js')){
  const code=await fs.readFile(path.join('dist/assets',file),'utf8')
  if(code.includes(id)&&code.includes('sourceFrame'))candidates.push('/assets/'+file)
 }
 assert.equal(candidates.length,1,`Source chunk for ${id}`)
 return candidates[0]
}
async function run(browser,dental){
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 const slowFirst=await sourceChunk(dental?'2294:7487':'1487:412'),slowLast=await sourceChunk(dental?'2294:7557':'1487:883')
 await page.route('**/assets/*.js',async route=>{const url=new URL(route.request().url());if([slowFirst,slowLast].includes(url.pathname))await new Promise(resolve=>setTimeout(resolve,1000));await route.continue()})
 try{
  await page.goto(origin+(dental?'/dental':'/hospitals'),{waitUntil:'networkidle'})
  if(dental)await page.getByRole('button',{name:'下一步 城市与医生匹配',exact:true}).click()
  const trigger=page.getByRole('button',{name:dental?'查看谭兆林医生详情':'查看上海曜影医院详情',exact:true})
  await trigger.click();const dialog=page.locator('dialog[open]');await dialog.waitFor()
  const active=()=>dialog.getByRole('tab',{selected:true}).textContent()
  const initial=await active()
  await dialog.getByRole('tab').nth(1).click()
  assert.equal(await active(),initial,'Previous content must remain while the requested tab downloads')
  await dialog.getByRole('tab').nth(2).click()
  await page.waitForFunction(()=>document.querySelectorAll('dialog[open] [role=tab]')[2]?.getAttribute('aria-selected')==='true')
  await page.waitForTimeout(1150)
  assert.equal(await dialog.getByRole('tab').nth(2).getAttribute('aria-selected'),'true','Late first request replaced newer tab')
  const y=await page.evaluate(()=>scrollY)
  await dialog.getByRole('tab').nth(4).click()
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'})
  await page.waitForTimeout(1150)
  assert.equal(await page.locator('dialog[open]').count(),0)
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'')
  assert.equal(await page.evaluate(()=>scrollY),y)
  assert.equal(await trigger.evaluate(el=>el===document.activeElement),true)
  await trigger.click();await dialog.waitFor();await dialog.getByRole('tab').nth(4).click()
  await page.waitForFunction(()=>document.querySelectorAll('dialog[open] [role=tab]')[4]?.getAttribute('aria-selected')==='true')
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'})
  assert.deepEqual(errors,[])
  return {page:dental?'dental':'hospitals',retainsContentWhileLoading:true,newestTabWins:true,closeCancelsPending:true,cachedReopen:true,focusAndScrollRestore:true,errors}
 }finally{await page.close()}
}
async function main(){await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{const results=[];for(const dental of [false,true])results.push(await run(browser,dental));await fs.writeFile(path.join(out,'qa.json'),JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));console.log(JSON.stringify(results,null,2))}finally{await browser.close()}}
main().catch(error=>{console.error(error);process.exitCode=1})
