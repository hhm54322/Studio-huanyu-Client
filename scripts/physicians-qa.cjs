const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const tools = process.env.HUANYU_QA_TOOLS || '/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const { chromium } = require(path.join(tools, 'playwright'))
const sharp = require(path.join(tools, 'sharp'))
const root = path.resolve(__dirname, '..'), source = path.join(root, 'docs/figma-source/physicians/revision-2026-10-29')
const out = path.join(root, 'artifacts/figma-physicians-2026-10-29')
const url = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'
const s = id => `[data-figma-node="${id}"]`
async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless:true, executablePath:process.env.HUANYU_QA_BROWSER || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  const errors = []
  try {
    const page = await browser.newPage({ viewport:{ width:1440, height:900 }, deviceScaleFactor:2, reducedMotion:'reduce' })
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(`${url}/doctors`, { waitUntil:'networkidle' }); await page.evaluate(() => document.fonts.ready)
    const trigger = page.locator(s('1689:5416'))
    await trigger.click(); await page.waitForTimeout(350)
    const native = JSON.parse(await fs.readFile(path.join(source,'native-inventory-2026-10-29.json')))
    const mapping = JSON.parse(await fs.readFile(path.join(source,'node-to-code-2026-10-29.json')))
    const owners = []
    for (const record of mapping.nodes) {
      const element = page.locator(record.selector)
      assert.equal(await element.count(),1,`${record.nodeId}: exact DOM/SVG owner`)
      owners.push({nodeId:record.nodeId,ownerNodeId:record.ownerNodeId,selector:record.selector})
    }
    assert.equal(owners.length,native.nodeCount)
    const geometry = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}))
    assert.equal(geometry.height,1790);assert.equal(geometry.scrollWidth,1440);assert.deepEqual(geometry.broken,[])
    await page.screenshot({path:path.join(out,'local-1440-2x.png'),fullPage:true})
    await sharp(path.join(out,'local-1440-2x.png')).resize({width:1440}).toFile(path.join(out,'local-1440.png'))
    const reference = path.join(out,'revision-2026-10-29-figma.png')
    const a = await sharp(reference).resize({width:2880}).removeAlpha().raw().toBuffer()
    const b = await sharp(path.join(out,'local-1440-2x.png')).removeAlpha().raw().toBuffer()
    assert.equal(a.length,b.length,'Figma and implementation dimensions')
    let delta=0;for(let i=0;i<a.length;i++)delta+=Math.abs(a[i]-b[i])
    const nMAE=delta/a.length/255
    const pixelmatch=(await import(path.join(tools,'pixelmatch/index.js'))).default
    const pa=await sharp(reference).resize({width:2880}).ensureAlpha().raw().toBuffer(),pb=await sharp(path.join(out,'local-1440-2x.png')).ensureAlpha().raw().toBuffer()
    const changed=pixelmatch(pa,pb,null,2880,3580,{threshold:.15,includeAA:false})/(2880*3580)
    await sharp(reference).resize({width:1440}).toFile(path.join(out,'figma-1440.png'))
    const result={owners,geometry,nMAE,changedPixelRatio:changed,errors,checkedAt:new Date().toISOString()}
    await fs.writeFile(path.join(out,'source-qa.json'),JSON.stringify(result,null,2)+'\n')
    console.log(JSON.stringify({geometry,nMAE,changedPixelRatio:changed,owners:owners.length,errors},null,2))
    assert.ok(nMAE<.01,'Visual error exceeds 1%')
    const filterIds=['1689:4843','1689:4846','1689:4849','1689:4852','1689:4840','2320:8384']
    const names=['谭兆林','徐宇','周莉莉','柳光宇','陈疾忤']
    const expected=[5,1,1,1,1,1],filterResults=[]
    for(let i=0;i<filterIds.length;i++){
      await page.locator(s(filterIds[i])).click();assert.equal(await page.locator('[data-physician-card]').count(),expected[i]);assert.equal(await page.locator(s(filterIds[i])).getAttribute('aria-selected'),'true')
      const cards=await page.locator('[data-physician-card]').allTextContents();filterResults.push({id:filterIds[i],cards})
    }
    await page.locator(s(filterIds[5])).press('Home');assert.equal(await page.locator('[data-physician-card]').count(),5)
    const cards=['1741:5785','2324:8478','1741:5817','1741:5843','1741:5869']
    const dialogResults=[]
    for(let i=0;i<cards.length;i++){
      const button=page.locator(s(cards[i]));await button.scrollIntoViewIfNeeded();await button.focus();const before=await page.evaluate(()=>scrollY);await button.click()
      const dialog=page.getByRole('dialog');await dialog.waitFor({state:'visible'});assert.ok((await dialog.textContent()).includes(names[i]))
      const tabs=dialog.getByRole('tab');const count=await tabs.count();assert.equal(count,i===0?5:i===1?3:4)
      await tabs.last().click();await page.waitForTimeout(280);assert.equal(await tabs.last().getAttribute('aria-selected'),'true')
      await page.screenshot({path:path.join(out,`dialog-${i}.png`)})
      await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.equal(await button.evaluate(el=>el===document.activeElement),true);assert.equal(await page.evaluate(()=>scrollY),before)
      dialogResults.push({name:names[i],tabs:count,escape:true,focusRestore:true,scrollRestore:true})
    }
    await page.evaluate(()=>scrollTo(0,0));await trigger.press('ArrowDown');await page.waitForTimeout(300);assert.equal(await page.locator('#physician-hospital-menu a').first().evaluate(el=>el===document.activeElement),true)
    await page.keyboard.press('Escape');await page.locator('#physician-hospital-menu').waitFor({state:'hidden'})
    await page.locator(s('1689:5401')).click();await page.getByRole('dialog').waitFor({state:'visible'});await page.keyboard.press('Escape')
    const widths=[]
    for(const width of [1024,1440,1920]){await page.setViewportSize({width,height:900});await page.goto(`${url}/doctors`,{waitUntil:'networkidle'});const g=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}));assert.equal(g.width,g.scrollWidth);assert.equal(g.broken,0);widths.push(g)}
    await page.goto(`${url}/hospitals`,{waitUntil:'networkidle'});await page.locator(s('484:1573')).hover();await page.locator(s('1741:5733')).click();await page.waitForURL('**/doctors')
    assert.deepEqual(errors,[])
    await fs.writeFile(path.join(out,'behavior-qa.json'),JSON.stringify({filterResults,dialogResults,widths,hospitalEntry:true,keyboardMenu:true,consultation:true,errors,checkedAt:new Date().toISOString()},null,2)+'\n')
    console.log('Doctor directory behaviors passed')
  } finally {await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1})
