// Run from the browser-client REPL with the already-selected Figma tab.
// This collects visible UI evidence only: no Figma private API/application state.
import fs from 'node:fs/promises'
import path from 'node:path'

export async function prepareSource(tab,directory,date='2026-10-19') {
  const native=JSON.parse(await fs.readFile(`${directory}/native-inventory-${date}.json`,'utf8'))
  await tab.goto(`https://www.figma.com/design/s6gMozOqPBJFujindYruwb/寰宇云医?node-id=${native.sourceFrame.replace(':','-')}&m=dev`)
  // The full Figma editor replaces its document after goto. Waiting for that
  // replacement avoids querying the detached sidebar from the prior frame.
  await tab.playwright.waitForTimeout(4000)
  const snapshot=await tab.playwright.domSnapshot()
  if(!snapshot.includes(native.nodes[0].name)) throw Error(`Figma frame not loaded: ${native.sourceFrame}`)
  return {frame:native.sourceFrame,name:native.nodes[0].name}
}

export async function exportSelectedFrame(tab,directory,evidenceDirectory,date='2026-10-19') {
  const native=JSON.parse(await fs.readFile(`${directory}/native-inventory-${date}.json`,'utf8'))
  const selected=await tab.playwright.locator('[role="tabpanel"] [aria-label^="Click to copy layer name"]').getAttribute('aria-label')
  const selectedName=selected?.replace('Click to copy layer name: ','')
  if(!selectedName?.endsWith(native.nodes[0].name)) throw Error(`Wrong frame selected for export: ${native.sourceFrame}`)
  const download=tab.playwright.waitForEvent('download',{timeoutMs:30000}).catch(error=>({error}))
  await tab.playwright.getByRole('button',{name:`Export ${selectedName}`,exact:true}).click()
  const exported=await download
  if('error' in exported) throw exported.error
  const downloaded=await exported.path({timeoutMs:30000})
  if(!downloaded) throw Error(`No actual export: ${native.sourceFrame}`)
  await fs.mkdir(evidenceDirectory,{recursive:true})
  const destination=path.join(evidenceDirectory,`${path.basename(directory)}-figma.png`)
  await fs.copyFile(downloaded,destination)
  return {frame:native.sourceFrame,path:destination}
}

export async function expandSourceLayers(tab) {
  const first=tab.playwright.locator('[role="treegrid"] [role="row"]').first()
  await first.waitFor({state:'visible',timeoutMs:15000})
  const expanded=await first.getAttribute('aria-expanded')
  const caret=first.locator('button[data-testid="layers-panel-expand-caret"]')
  // Option-click applies to every descendant in Figma. Reset the root first
  // so mixed saved expansion states cannot leave an unseen branch collapsed.
  if(expanded==='true') await caret.click({modifiers:['Alt']})
  await caret.click({modifiers:['Alt']})
  return await tab.playwright.locator('[role="treegrid"] [role="row"]').count()
}

export async function collectExpandedLayers(tab,directory,date='2026-10-19') {
  await expandSourceLayers(tab)
  const native=JSON.parse(await fs.readFile(`${directory}/native-inventory-${date}.json`,'utf8'))
  const nativeById=new Map(native.nodes.map(node=>[node.id,node]))
  const rows=new Map()
  for(let pass=0;pass<100;pass++) {
    const visible=await tab.playwright.locator('[role="treegrid"] [role="row"]').evaluateAll(items=>items.map(r=>({
      index:Number(r.getAttribute('data-fpl-tree-row-index')),level:Number(r.getAttribute('aria-level')),
      nodeId:r.querySelector('[data-testid$="-layers-panel-row"]')?.getAttribute('data-testid')?.replace(/-layers-panel-row$/,''),
      name:r.querySelector('[data-testid="tree-grid-row-content"] [role="gridcell"]')?.innerText,
    })))
    for(const row of visible) if(row.nodeId) rows.set(row.index,row)
    if(native.nodes.every(node=>[...rows.values()].some(row=>row.nodeId===node.id))) break
    if(pass===99) throw Error(`Incomplete expanded Layers: ${rows.size}/${native.nodeCount}`)
    await tab.ax.scroll([180,580],'down',1)
    await tab.ax.get()
  }
  const nodes=[...rows.values()].sort((a,b)=>a.index-b.index)
  const stack=[]
  for(const row of nodes) {
    while(stack.length>row.level) stack.pop()
    const expected=nativeById.get(row.nodeId)
    if(row.nodeId===native.sourceFrame && expected && row.name!==expected.name && row.name.endsWith(expected.name)) {
      row.uiName=row.name
      row.name=expected.name
    }
    row.parentNodeId=stack.at(-1)?.nodeId||null
    stack.push(row)
    if(!expected) {
      if(!stack.some(ancestor=>ancestor.name==='Navigation/Notification Area')) throw Error(`Unexpected extra Layers node ${row.nodeId}`)
      row.deviceChrome=true
      continue
    }
    if(expected.name!==row.name||expected.level!==row.level||expected.parentNodeId!==row.parentNodeId) throw Error(`Native/UI Layers mismatch at ${row.nodeId}`)
  }
  if(nodes.filter(row=>nativeById.has(row.nodeId)).some((row,index)=>native.nodes[index].id!==row.nodeId)) throw Error('Layers sibling order mismatch')
  const output={sourceFrame:native.sourceFrame,sourceUrl:await tab.url(),extractionDate:date,source:'Expanded Figma Dev Mode Layers, complete parent-first UI index checked against official native export',nodes}
  await fs.writeFile(`${directory}/ui-layers-${date}.json`,JSON.stringify(output,null,2)+'\n')
  return {sourceFrame:native.sourceFrame,nodeCount:nodes.length,match:true}
}

export async function collectChunk(tab, directory, begin, end, date='2026-10-19') {
  const native = JSON.parse(await fs.readFile(`${directory}/native-inventory-${date}.json`, 'utf8'))
  const layers = JSON.parse(await fs.readFile(`${directory}/ui-layers-${date}.json`, 'utf8'))
  const rows = new Map(layers.nodes.map(n => [n.nodeId, n]))
  const filename = `${directory}/dev-mode-${date}.json`
  let collected
  try { collected = JSON.parse(await fs.readFile(filename, 'utf8')) } catch { collected = { sourceFrame: native.sourceFrame, extractionDate: date, source: 'Figma Dev Mode UI; each node selected by Layers ID and CSS copied from right panel', nodes: [] } }
  const records = new Map(collected.nodes.map(n => [n.nodeId, n]))
  for (let i = begin; i < Math.min(end, native.nodes.length); i++) {
    const node = native.nodes[i], row = rows.get(node.id)
    if (!row || row.name !== node.name || row.level !== node.level) throw Error(`Layers mismatch: ${node.id}`)
    if (records.get(node.id)?.name === node.name) continue
    if (!node.rendered) records.set(node.id, { ...row, implemented: false, reason: 'Figma hidden node; original visibility retained', code: [], copyFields: [] })
    else {
      for (let count = 0; count < 70; count++) {
        const visible = await tab.playwright.locator('[role="treegrid"] [role="row"]').evaluateAll(items => items.map(r => Number(r.getAttribute('data-fpl-tree-row-index'))))
        if (visible.includes(row.index)) break
        if (count === 69) throw Error(`Cannot scroll to ${node.id}`)
        await tab.ax.scroll([180, 580], row.index < visible[0] ? 'up' : 'down', 1)
        await tab.ax.get()
      }
      const target = tab.playwright.locator(`[role="treegrid"] [data-fpl-tree-row-index="${row.index}"] [data-testid="tree-grid-row-content"] [role="gridcell"]`)
      // A long layer name may extend beyond Figma's clipped sidebar. The
      // locator's center then lands outside its visible part without throwing.
      // Intersect actual DOM clipping ancestors before using the IAB pointer.
      const point=await target.evaluate(element=>{
        let r=element.getBoundingClientRect(),left=Math.max(0,r.left),right=Math.min(innerWidth,r.right),top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom)
        for(let p=element.parentElement;p;p=p.parentElement){
          const b=p.getBoundingClientRect(),s=getComputedStyle(p)
          if(b.width&&s.overflowX!=='visible'){left=Math.max(left,b.left);right=Math.min(right,b.right)}
          if(b.height&&s.overflowY!=='visible'){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom)}
        }
        return {x:(left+right)/2,y:(top+bottom)/2,clipped:right-left<r.width-.5,valid:right>left&&bottom>top}
      })
      if(point.clipped&&point.valid)await tab.ax.click([point.x,point.y])
      else await target.click({timeoutMs:1000})
      await tab.playwright.waitForURL(`**/*node-id=${node.id.replace(':', '-')}&m=dev`, { timeoutMs: 200 }).catch(() => {})
      // URL selection updates before the Inspect panel finishes rendering.
      // Always let the selected node's code settle before copying its values.
      const selectedAt = new Date().toISOString()
      await tab.playwright.waitForTimeout(160)
      let selectionReady=false
      for(let settle=0;settle<15;settle++) {
        const selection=await tab.playwright.evaluate(()=>({url:location.href,name:document.querySelector('[role="tabpanel"] [aria-label^="Click to copy layer name"]')?.getAttribute('aria-label')?.replace('Click to copy layer name: ', '')}))
        if(selection.url.includes(`node-id=${node.id.replace(':','-')}`) && (selection.name===node.name || node.id===native.sourceFrame && selection.name?.endsWith(node.name))) {selectionReady=true;break}
        await tab.playwright.waitForTimeout(160)
      }
      if(!selectionReady) throw Error(`Inspect panel did not settle for ${node.id}`)
      const evidence = await tab.playwright.evaluate(() => ({
        sourceUrl: location.href,
        selectedName: document.querySelector('[role="tabpanel"] [aria-label^="Click to copy layer name"]')?.getAttribute('aria-label')?.replace('Click to copy layer name: ', ''),
        code: [...document.querySelectorAll('[role="tabpanel"] code')].map(e => e.innerText),
        copyFields: [...document.querySelectorAll('[role="tabpanel"] button[aria-label^="Copy"]')].map(e => e.getAttribute('aria-label')),
      }))
      // Browser output can truncate an SVG containing an embedded raster.
      // Read long DOM code in bounded chunks instead of persisting [Truncated].
      const lengths = await tab.playwright.evaluate(() => [...document.querySelectorAll('[role="tabpanel"] code')].map(e => e.innerText.length))
      for (let c = 0; c < lengths.length; c++) {
        if (lengths[c] < 16000) continue
        let code = ''
        for (let start = 0; start < lengths[c]; start += 16000) {
          code += await tab.playwright.evaluate(({ c, start }) => document.querySelectorAll('[role="tabpanel"] code')[c].innerText.slice(start, start + 16000), { c, start })
        }
        evidence.code[c] = code
      }
      if (!evidence.code.length) throw Error(`Empty Dev Mode code ${node.id}`)
      if (evidence.code.some(code => code.includes('[Truncated]'))) throw Error(`Incomplete Dev Mode code ${node.id}`)
      if (evidence.selectedName !== node.name && !(node.id === native.sourceFrame && evidence.selectedName?.endsWith(node.name))) throw Error(`Selection mismatch ${node.id}: ${evidence.selectedName}`)
      records.set(node.id, { ...row, implemented: true, selectedAt, settleWaitMs: 160, ...evidence })
    }
    // Generated extraction data is persisted after each node so a browser
    // kernel interruption cannot discard already copied source evidence.
    collected.nodes = [...records.values()].sort((a, b) => a.index - b.index)
    await fs.writeFile(filename, JSON.stringify(collected, null, 2) + '\n')
  }
  return { copied: records.size, next: native.nodes.findIndex(n => !records.has(n.id)), total: native.nodes.length }
}
