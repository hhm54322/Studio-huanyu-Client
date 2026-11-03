const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict')
const{chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const origin=(process.env.HUANYU_QA_URL||'http://127.0.0.1:5351').replace(/\/$/,'')
const out=path.resolve(process.env.HUANYU_QA_OUTPUT||'artifacts/performance-home-dental-2026-11-01/step-loading')
const names=['选择牙科项目','城市与医生匹配','上传影像资料']
const click=(page,n)=>page.getByRole('button',{name:`0${n} ${names[n-1]}`,exact:true}).click()
const ready=(page,n)=>page.locator(`[data-dental-step="${n}"]`).waitFor()
async function chunk(id){for(const file of await fs.readdir('dist/assets'))if(file.startsWith('source-tree-')&&file.endsWith('.js')&&(await fs.readFile('dist/assets/'+file,'utf8')).includes(id))return '/assets/'+file;throw Error('Missing '+id)}
async function main(){
 await fs.mkdir(out,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[]
 const matching=await chunk('2294:6971'),upload=await chunk('2294:8037'),card=await chunk('2323:8392')
 const make=async()=>{const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(new URL(r.url()).pathname));return{page,errors,requests}}
 try{
  {
   const{page,errors,requests}=await make();await page.goto(origin+'/dental',{waitUntil:'networkidle'});assert.equal(await page.locator('.dental-live-project').count(),8);for(const file of [matching,upload,card])assert.ok(!requests.includes(file),'Later step downloaded at entry')
   await click(page,3);await ready(page,3);assert.ok(requests.includes(upload));for(const file of [matching,card])assert.ok(!requests.includes(file),'Jumping to upload downloaded matching')
   await page.getByRole('textbox',{name:'其他说明',exact:true}).fill('QA draft remains while switching steps');await click(page,1);await ready(page,1);await click(page,3);await ready(page,3);assert.equal(await page.getByRole('textbox',{name:'其他说明',exact:true}).inputValue(),'QA draft remains while switching steps');assert.equal(requests.filter(x=>x===upload).length,1)
   await page.setViewportSize({width:390,height:844});await page.locator('.dental-page').waitFor();await page.setViewportSize({width:1440,height:1000});await ready(page,3);assert.deepEqual(errors,[]);results.push({name:'entry-direct-upload-cache-draft-resize',passed:true,errors});await page.close()
  }
  {
   const{page,errors}=await make();await page.route('**'+matching,async route=>{await new Promise(r=>setTimeout(r,1200));await route.continue()});await page.goto(origin+'/dental',{waitUntil:'networkidle'});await click(page,2);await ready(page,1);await page.getByRole('status').filter({hasText:'正在准备下一步'}).waitFor();await click(page,3);await ready(page,3);await page.waitForTimeout(1400);await ready(page,3);await click(page,2);await ready(page,2);assert.equal(await page.locator('[data-doctor]').count(),7);assert.deepEqual(errors,[]);results.push({name:'late-step-does-not-replace-newest-cache-reuse',passed:true,errors});await page.close()
  }
  {
   const{page,errors}=await make();await page.route('**'+matching,async route=>{await new Promise(r=>setTimeout(r,1000));await route.continue()});await page.goto(origin+'/dental',{waitUntil:'networkidle'});await click(page,2);await click(page,1);await page.waitForTimeout(1300);await ready(page,1);assert.equal(await page.getByRole('status').filter({hasText:'正在准备下一步'}).count(),0);assert.deepEqual(errors,[]);results.push({name:'return-to-current-cancels-pending-navigation',passed:true,errors});await page.close()
  }
  {
   const{page,errors}=await make();let attempts=0;await page.route('**'+matching,route=>++attempts===1?route.abort('failed'):route.continue());await page.goto(origin+'/dental',{waitUntil:'networkidle'});await click(page,2);await page.getByRole('alert').filter({hasText:'下一步暂时未能加载'}).waitFor();await ready(page,1);await page.screenshot({path:path.join(out,'failure-retains-projects.png')});await page.getByRole('button',{name:'重新加载',exact:true}).click();await ready(page,2);assert.equal(await page.getByRole('alert').count(),0);assert.equal(await page.locator('[data-doctor]').count(),7);assert.ok(attempts>=2);assert.deepEqual(errors,[]);results.push({name:'failed-step-retains-content-and-retries',passed:true,errors,attempts});await page.close()
  }
  {
   const{page,errors}=await make();await page.setViewportSize({width:390,height:844});await page.goto(origin+'/dental',{waitUntil:'networkidle'});await page.getByRole('button',{name:/03 上传影像资料/}).click();await page.setViewportSize({width:1440,height:1000});await ready(page,3);assert.deepEqual(errors,[]);results.push({name:'mobile-step-resizes-to-prepared-desktop',passed:true,errors});await page.close()
  }
 }finally{await browser.close();await fs.writeFile(path.join(out,'qa.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,results},null,2))}
 console.log(JSON.stringify(results,null,2))
}
main().catch(e=>{console.error(e);process.exitCode=1})
