const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

async function main() {
  const directory = path.resolve('docs/figma-source/why-china')
  const mapping = JSON.parse(await fs.readFile(path.join(directory, 'node-to-code-2026-09-29.json'), 'utf8'))
  const source = JSON.parse(await fs.readFile(path.join(directory, 'native-parameters-2026-09-29.json'), 'utf8'))
  const byId = new Map(source.nodes.map((node) => [node.nodeId,node]))
  const browser = await chromium.launch({headless:true})
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900}})
    await page.emulateMedia({reducedMotion:'reduce'})
    await page.goto('http://127.0.0.1:5173/why-china',{waitUntil:'networkidle'})
    await page.evaluate(() => document.fonts.ready)
    for(let y=0;y<5700;y+=600) { await page.evaluate(y=>scrollTo(0,y),y); await page.waitForTimeout(80) }
    await page.evaluate(()=>scrollTo(0,0))
    const nodes = []
    const typography = []
    for(const node of mapping.nodes) {
      if(!node.rendered) {nodes.push({nodeId:node.id,hiddenBy:node.hiddenBy,rendered:false});continue}
      const locator = page.locator(node.selector)
      const count = await locator.count()
      assert.equal(count,1,`${node.id}: ${node.selector} resolves ${count} elements`)
      const parameter = byId.get(node.id)
      let copyMatches = null
      if(parameter.parameters.type==='TEXT' && !node.mode.startsWith('ECharts')) {
        const normalize=(value)=>value.replace(/\s+/g,' ').trim()
        const actual=normalize(await locator.textContent())
        const expected=normalize(parameter.parameters.textData.characters)
        copyMatches=actual.includes(expected)
        assert.equal(copyMatches,true,`${node.id}: source ${expected} is absent from ${node.selector}: ${actual}`)
        const native=parameter.parameters
        const paint=native.fillPaints.find(paint=>paint.visible && paint.type==='SOLID')
        const color=paint.color
        const alpha=Math.round(color.a*paint.opacity*native.opacity*1000)/1000
        const expectedColor=`${alpha===1?'rgb':'rgba'}(${Math.round(color.r*255)}, ${Math.round(color.g*255)}, ${Math.round(color.b*255)}${alpha===1?'':`, ${alpha}`})`
        const expectedStyle={
          fontSize:native.fontSize,
          lineHeight:native.lineHeight.units==='PERCENT' ? native.fontSize*native.lineHeight.value/100 : native.lineHeight.value,
          fontWeight:native.derivedTextData.fontMetaData[0].fontWeight,
        }
        const actualStyle=await locator.evaluate(el=>{
          if(el.children.length===1 && el.firstElementChild.textContent===el.textContent)el=el.firstElementChild
          const style=getComputedStyle(el)
          return {fontSize:parseFloat(style.fontSize),lineHeight:parseFloat(style.lineHeight),fontWeight:Number(style.fontWeight),color:style.color}
        })
        for(const property of Object.keys(expectedStyle))assert.ok(Math.abs(actualStyle[property]-expectedStyle[property])<.01,`${node.id}: ${property} differs from native source: ${actualStyle[property]} vs ${expectedStyle[property]}`)
        assert.equal(actualStyle.color,expectedColor,`${node.id}: text color/opacity differs from native source`)
        typography.push({nodeId:node.id,expected:{...expectedStyle,color:expectedColor},actual:actualStyle})
      }
      nodes.push({nodeId:node.id,selector:node.selector,rendered:true,copyMatches})
    }
    const geometry = []
    for(const nodeId of ['143:1302','143:1353','143:1354','143:1361', '143:1362','143:1381','143:1473','143:1481','143:1766','143:1785','143:1786','143:1787','143:1789','143:1790','143:1797','143:1824','143:1834','143:1847','143:1860','143:1912','143:1920','143:1925','143:1958']) {
      const node=mapping.nodes.find(n=>n.id===nodeId)
      const actual=await page.locator(node.selector).evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y+scrollY,width:r.width,height:r.height}})
      const source=byId.get(nodeId)
      const expected={...source.framePosition,width:source.parameters.size.x,height:source.parameters.size.y}
      // The ECharts canvas includes the separate 24px legend and its 16px gap.
      if(nodeId==='143:1481')expected.height=403.2602233886719
      const delta=Object.fromEntries(Object.keys(actual).map(k=>[k,actual[k]-expected[k]]))
      assert.ok(Object.values(delta).every(value=>Math.abs(value)<1),`${nodeId}: geometry drift ${JSON.stringify(delta)}`)
      geometry.push({nodeId,expected,actual,delta})
    }
    const effects = []
    for(const nodeId of ['143:1341','143:1345','143:1752','143:1759','143:1920','143:1925']) {
      const node=mapping.nodes.find(n=>n.id===nodeId)
      const nativeEffects=byId.get(nodeId).parameters.effects || []
      const expected=nativeEffects.filter(e=>e.visible && e.type==='DROP_SHADOW').map(e=>`rgba(${Math.round(e.color.r*255)}, ${Math.round(e.color.g*255)}, ${Math.round(e.color.b*255)}, ${Math.round(e.color.a*1000)/1000}) ${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread}px`).join(', ') || 'none'
      const actual=await page.locator(node.selector).evaluate(el=>getComputedStyle(el).boxShadow)
      assert.equal(actual,expected,`${nodeId}: shadow differs from native source`)
      effects.push({nodeId,expected,actual})
    }
    const result={frame:mapping.sourceFrame,parameters:source.nodes.length,nodes,geometry,effects,typography}
    await fs.writeFile(path.resolve('docs/figma-verification/why-china/2026-09-29/source-map-results.json'),JSON.stringify(result,null,2)+'\n')
    console.log(`${nodes.length} exact node mappings resolved; ${geometry.length} geometry, ${effects.length} shadow and ${typography.length} typography checks passed`)
  }finally{await browser.close()}
}
main().catch(error=>{console.error(error);process.exitCode=1})
