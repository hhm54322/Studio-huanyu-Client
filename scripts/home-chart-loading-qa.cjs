const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium }=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const base=process.env.HUANYU_QA_URL||'http://127.0.0.1:5440/'
const out=path.resolve(process.env.HUANYU_QA_OUTPUT||'artifacts/home-layout-charts-20261105/loading')
const chartModule=url=>/\/src\/utils\/homeCharts\.ts(?:\?|$)|\/assets\/homeCharts-[\w-]+\.js(?:\?|$)|\/assets\/echarts-vendor-[\w-]+\.js(?:\?|$)/.test(url)
async function ready(p){await p.waitForFunction(()=>[...document.querySelectorAll('.revision-chart')].length===2&&[...document.querySelectorAll('.revision-chart')].every(e=>e.querySelector('canvas')));const painted=await p.locator('.revision-chart canvas').evaluateAll(cs=>cs.map(c=>{let n=0;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n}));assert.ok(painted.every(n=>n>10000));return painted}
async function main(){await fs.mkdir(out,{recursive:true});const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),results=[]
try{
 const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));let release;const gate=new Promise(r=>release=r);let blocked=0
 await p.route('**/*',async r=>{if(chartModule(r.request().url())){blocked++;await gate}await r.continue()})
 await p.goto(base,{waitUntil:'domcontentloaded',timeout:90000});await p.locator('#data-section').scrollIntoViewIfNeeded();await p.locator('.revision-chart__status').first().waitFor({state:'visible'});assert.ok(blocked>0);await p.screenshot({path:path.join(out,'slow-renderer-status.png')});release();const first=await ready(p);await p.locator('.revision-chart__status').first().waitFor({state:'hidden'});assert.equal(await p.locator('.revision-chart__retry').count(),0)
 for(const width of [390,1440]){await p.setViewportSize({width,height:1000});await p.locator('#data-section').scrollIntoViewIfNeeded();await ready(p)}
 await p.goto(new URL('/doctors',base).href,{waitUntil:'domcontentloaded'});await p.goBack({waitUntil:'domcontentloaded'});await p.locator('#data-section').scrollIntoViewIfNeeded();await ready(p);assert.deepEqual(errors,[]);results.push({scenario:'delayed-renderer-resize-and-return',blocked,first,errors});await p.close()
 const q=await b.newPage({viewport:{width:1440,height:1000}});let rejected=0;await q.route('**/*',async r=>{if(chartModule(r.request().url())){rejected++;return r.abort('failed')}return r.continue()});await q.goto(base,{waitUntil:'domcontentloaded',timeout:90000});await q.locator('#data-section').scrollIntoViewIfNeeded();await q.locator('.revision-chart__retry').first().waitFor({state:'visible'});assert.ok(rejected>0);assert.equal(await q.locator('.revision-chart__status').count(),0);await q.screenshot({path:path.join(out,'failed-renderer-retry.png')});await q.unroute('**/*');await Promise.all([q.waitForNavigation({waitUntil:'domcontentloaded'}),q.locator('.revision-chart__retry').first().click()]);await q.locator('#data-section').scrollIntoViewIfNeeded();const restored=await ready(q);results.push({scenario:'failed-renderer-page-retry',rejected,restored});await q.close()
 await fs.writeFile(path.join(out,'qa.json'),JSON.stringify({createdAt:new Date().toISOString(),base,results},null,2)+'\n');console.log(JSON.stringify(results,null,2))
}finally{await b.close()}}
main().catch(e=>{console.error(e);process.exitCode=1})
