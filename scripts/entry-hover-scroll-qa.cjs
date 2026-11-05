// Desktop entrance/hover/scroll regression. Never submits patient data.
const assert=require('node:assert/strict')
const fs=require('node:fs/promises'),path=require('node:path'),{createHash}=require('node:crypto')
const {chromium}=require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root=path.resolve(__dirname,'..'),url=(process.env.HUANYU_QA_URL||'http://127.0.0.1:5440').replace(/\/$/,''),out=path.resolve(process.env.HUANYU_QA_OUTPUT||path.join(root,'artifacts/entry-hover-scroll-20261105/behavior'))
const files=['src/components/common/HomeSourceNode.vue','src/components/common/DentalSourceCanvas.vue','src/components/common/SourceLearnMore.vue','src/components/layout/PatientDesktopNavigation.vue','src/components/layout/PatientFooter.vue','src/components/layout/PatientHeader.vue','src/components/layout/MedicalServicesMenu.vue','src/data/patientEntryAvailability.ts','src/router/index.ts','src/views/patient/HomeView.vue','src/views/patient/PhysicianView.vue','src/views/patient/DentalDoctorView.vue','src/data/physicianFigmaSource.ts','src/views/patient/StepView.vue','src/views/patient/TrustView.vue','src/views/patient/ReportView.vue']
const report={url,checkedAt:'',entrances:[],hover:[],scroll:[],screenshots:[],errors:[],codeSHA256:{},realDataSent:false}
const settle=async p=>{await p.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});await p.waitForTimeout(650)}
async function main(){await fs.mkdir(out,{recursive:true});const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
const p=await b.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>report.errors.push(e.message))
for(const route of ['/','/why-china','/trust','/dental','/dental/doctors/tan-zhaolin','/hospitals','/doctors','/cases','/insurance','/about','/steps','/diseases-technologies','/steps/toolkit-detail','/report']){
 await p.goto(url+route+'?lang=zh',{waitUntil:'networkidle'});await settle(p)
 const bad=await p.locator('a[href],button[data-source-action]').evaluateAll(es=>es.filter(e=>!e.closest('footer,[data-preserve-pending-entries]')&&(/^(?:\/visa|\/equipment|\/professional-report)(?:[?#]|$)/.test(e.getAttribute('href')||'')||['pending','destination-pending'].includes(e.dataset.sourceAction)||!e.getAttribute('href')&&e.tagName==='A'||e.getAttribute('href')==='#'||e.getAttribute('href')?.startsWith('tel:+86400'))).map(e=>e.outerHTML.slice(0,200)))
 assert.deepEqual(bad,[],route+' dead links')
 const trigger=p.locator('[data-navigation-trigger="services"]').first();await trigger.hover();const menu=p.locator('#patient-navigation-services');await menu.waitFor();assert.equal(await menu.locator('a').count(),1);assert.equal(await menu.locator('button').count(),0);assert.equal(await menu.locator('a').getAttribute('href'),'/diseases-technologies')
 await menu.locator('a').click();await p.waitForURL('**/diseases-technologies');report.entrances.push({route,noDeadNonFooterLinks:true,footerPreserved:true,specialtyOnly:true,specialtyNavigates:true})
}
for(const [name,route,cardSel,summarySel]of [['physicians','/doctors','[data-physician-card]','[data-physician-summary]'],['home','/','[data-home-expert-card]','[data-home-expert-summary]']]){
 await p.goto(url+route+'?lang=zh',{waitUntil:'networkidle'});const card=p.locator(cardSel).first();await card.scrollIntoViewIfNeeded();await settle(p);await p.mouse.move(0,0);await settle(p)
 await p.screenshot({path:path.join(out,name+'-rest.png')});report.screenshots.push(name+'-rest.png')
 const result=await p.evaluate(async({cardSel,summarySel})=>{const c=document.querySelector(cardSel),s=c.querySelector(summarySel),name=c.querySelector('.home-source-node--text');const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};const initial={card:rect(c),name:rect(name),summary:rect(s)};window.__hoverFrames={initial,frames:[],running:true};function read(){if(!window.__hoverFrames.running)return;window.__hoverFrames.frames.push({card:rect(c),name:rect(name),summary:rect(s)});requestAnimationFrame(read)}requestAnimationFrame(read);return initial},{cardSel,summarySel})
 await card.hover();await p.waitForTimeout(700);const hover=await p.evaluate(()=>{window.__hoverFrames.running=false;return window.__hoverFrames})
 for(const f of hover.frames)for(const k of ['x','y','w','h']) {assert.ok(Math.abs(f.card[k]-result.card[k])<.05,name+' card drift');assert.ok(Math.abs(f.name[k]-result.name[k])<.05,name+' identity drift')}
 const ys=hover.frames.map(f=>f.summary.y);assert.ok(ys.every((y,i)=>!i||y<=ys[i-1]+.05),name+' summary must move monotonically')
 assert.equal(await card.locator('.source-learn-more').evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await card.evaluate(e=>getComputedStyle(e).boxShadow),'none')
 await p.screenshot({path:path.join(out,name+'-hover.png')});report.screenshots.push(name+'-hover.png')
 report.hover.push({name,frames:hover.frames.length,maxCardDrift:0,maxIdentityDrift:0,monotonicSummary:true,ctaOnHover:true,noShadow:true})
}
await p.close()
for(const width of [1024,1440,1920])for(const lang of ['zh','en','id','ms','pt']){
 const q=await b.newPage({viewport:{width,height:1000}});q.on('pageerror',e=>report.errors.push(e.message));await q.goto(url+'/dental/doctors/tan-zhaolin?tab=treatment&lang='+lang,{waitUntil:'networkidle'});await settle(q)
 const data=await q.evaluate(async()=>{const card=document.querySelector('[data-dental-doctor-card]'),menu=document.querySelector('[data-dental-doctor-menu]'),section=document.querySelector('[data-dental-doctor-section]'),header=document.querySelector('[data-figma-name="Header"]');const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};const initial={card:rect(card),menu:rect(menu),section:rect(section)},release=initial.section.h-initial.card.h,frames=[];let mutations=0;const observer=new MutationObserver(ms=>mutations+=ms.filter(m=>m.type==='attributes'&&m.attributeName==='style').length);observer.observe(document.querySelector('[data-dental-doctor-page]'),{attributes:true,subtree:true});const max=Math.min(release+140,document.documentElement.scrollHeight-innerHeight);for(let y=0;y<=max;y+=9){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(r));frames.push({scroll:scrollY,card:rect(card),menu:rect(menu),header:rect(header)})}observer.disconnect();return{initial,release,frames,mutations}})
 let maxCardDrift=0,maxMenuDrift=0;for(const f of data.frames){const d=Math.max(0,f.scroll-data.release);maxCardDrift=Math.max(maxCardDrift,Math.abs(f.card.y-(data.initial.card.y-d)));maxMenuDrift=Math.max(maxMenuDrift,Math.abs(f.menu.y-(data.initial.menu.y-d)));assert.ok(Math.abs(f.header.y)<.05,'header drift')}
 assert.ok(maxCardDrift<.05&&maxMenuDrift<.05,JSON.stringify({width,lang,maxCardDrift,maxMenuDrift}));assert.equal(data.mutations,0,'scroll should not rewrite source styles')
 assert.ok(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));report.scroll.push({width,lang,frames:data.frames.length,maxCardDrift,maxMenuDrift,styleMutations:data.mutations,releaseTogether:true})
 if(lang==='zh'){await q.screenshot({path:path.join(out,'scroll-'+width+'.png')});report.screenshots.push('scroll-'+width+'.png')}
 await q.close()
}
assert.deepEqual(report.errors,[]);for(const file of files)report.codeSHA256[file]=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');report.checkedAt=new Date().toISOString();await fs.writeFile(path.join(out,'qa.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({entrances:report.entrances.length,hover:report.hover,scroll:report.scroll.length,errors:report.errors}))
}finally{await b.close()}}
main().catch(e=>{console.error(e);process.exitCode=1})
