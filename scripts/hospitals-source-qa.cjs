const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const directory = path.join(root, 'docs/figma-source/hospitals')
const native = JSON.parse(fs.readFileSync(path.join(directory, 'native-parameters-2026-09-29.json')))
const mapping = JSON.parse(fs.readFileSync(path.join(directory, 'node-to-code-2026-09-29.json')))
const parameters = new Map(native.nodes.map(n => [n.nodeId,n]))
const out = path.join(root, 'docs/figma-verification/hospitals/2026-09-29')
async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport:{width:1440,height:900}, reducedMotion:'reduce' })
    await page.goto('http://127.0.0.1:5173/hospitals',{waitUntil:'networkidle'})
    await page.evaluate(()=>document.fonts.ready)
    const evidence={nodes:[],geometry:[],typography:[]}
    for(const node of mapping.nodes) {
      const element=page.locator(node.selector).first()
      assert.ok(await element.count(),`${node.id}: missing DOM ${node.selector}`)
      evidence.nodes.push({nodeId:node.id,selector:node.selector,implementation:node.implementation})
      const value=parameters.get(node.id).parameters
      if(value.type!=='TEXT')continue
      const actual=await element.evaluate(el=>{const s=getComputedStyle(el);return {text:el.textContent,fontSize:parseFloat(s.fontSize),lineHeight:parseFloat(s.lineHeight),fontWeight:Number(s.fontWeight),color:s.color}})
      const solid=value.fillPaints.find(p=>p.type==='SOLID'&&p.visible!==false)
      const expected={text:value.textData.characters,fontSize:value.fontSize,lineHeight:value.lineHeight.value,fontWeight:value.derivedTextData.fontMetaData[0].fontWeight,color:`rgb(${[solid.color.r,solid.color.g,solid.color.b].map(v=>Math.round(v*255)).join(', ')})`}
      assert.ok(actual.text.includes(expected.text),`${node.id}: missing text ${expected.text}`)
      for(const property of ['fontSize','lineHeight','fontWeight']) assert.ok(Math.abs(actual[property]-expected[property])<.01,`${node.id}: ${property}, actual ${actual[property]}, expected ${expected[property]}`)
      assert.equal(actual.color,expected.color,`${node.id}: color`)
      evidence.typography.push({nodeId:node.id,actual,expected})
    }
    const geometryIds=['144:4710','144:4711','144:4712','144:4713','144:4731','144:4732','144:4748',...mapping.nodes.filter(n=>n.parentNodeId==='144:4748').map(n=>n.id)]
    for(const id of geometryIds) {
      const node=mapping.nodes.find(n=>n.id===id)
      const source=parameters.get(id)
      const actual=await page.locator(node.selector).first().evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y+scrollY,width:r.width,height:r.height}})
      const expected={...source.framePosition,width:source.parameters.size.x,height:source.parameters.size.y}
      for(const key of ['x','y','width','height'])assert.ok(Math.abs(actual[key]-expected[key])<.04,`${id}: ${key}, actual ${actual[key]}, expected ${expected[key]}`)
      evidence.geometry.push({nodeId:id,actual,expected})
    }
    fs.mkdirSync(out,{recursive:true})
    fs.writeFileSync(path.join(out,'source-map-results.json'),JSON.stringify(evidence,null,2)+'\n')
    console.log(JSON.stringify({mapped:evidence.nodes.length,geometry:evidence.geometry.length,typography:evidence.typography.length}))
  } finally { await browser.close() }
}
main().catch(e=>{console.error(e);process.exitCode=1})
