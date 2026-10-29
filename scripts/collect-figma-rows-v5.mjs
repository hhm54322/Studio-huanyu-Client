import fs from 'node:fs/promises'

// Figma's deeply nested labels can extend underneath the Inspect panel in a
// narrow IAB. Select the visible row background, then verify the exact URL and
// Inspect name before recording any CSS. No private Figma state is used.
export async function collectRows(tab, directory, begin, end, date) {
  // Figma's visible layer-name labels remove trailing whitespace. Preserve the
  // authored name from the native tree and the actual UI name as evidence.
  const sameName = (a, b) => typeof a === 'string' && typeof b === 'string' && a.trimEnd() === b.trimEnd()
  const inventory = JSON.parse(await fs.readFile(`${directory}/native-inventory-${date}.json`, 'utf8'))
  const layers = JSON.parse(await fs.readFile(`${directory}/ui-layers-${date}.json`, 'utf8'))
  const layerMap = new Map(layers.nodes.map(n => [n.nodeId, n]))
  const filename = `${directory}/dev-mode-${date}.json`
  let record
  try { record = JSON.parse(await fs.readFile(filename, 'utf8')) } catch { record = { sourceFrame: inventory.sourceFrame, extractionDate: date, nodes: [] } }
  const copied = new Map(record.nodes.map(n => [n.nodeId, n]))
  for (let index = begin; index < Math.min(end, inventory.nodes.length); index++) {
    const node = inventory.nodes[index], layer = layerMap.get(node.id)
    if (!layer || layer.name !== node.name || layer.level !== node.level) throw Error(`Layers mismatch: ${node.id}`)
    if (sameName(copied.get(node.id)?.selectedName, node.name)) continue
    if (!node.rendered) copied.set(node.id, { ...layer, implemented: false, reason: 'Authored hidden layer', code: [] })
    else {
      let selected = false
      for (let pass = 0; pass < 100; pass++) {
        const rows = await tab.playwright.locator('[role="treegrid"] [role="row"]').evaluateAll(items => items.map(el => {
          const r = el.getBoundingClientRect()
          let top = Math.max(0, r.top), bottom = Math.min(innerHeight - 8, r.bottom)
          for (let p = el.parentElement; p; p = p.parentElement) {
            const s = getComputedStyle(p), b = p.getBoundingClientRect()
            if (b.height && s.overflowY !== 'visible') { top = Math.max(top, b.top); bottom = Math.min(bottom, b.bottom) }
          }
          const label = el.querySelector('[data-testid="tree-grid-row-content"] [role="gridcell"]')
          const labelRect = label?.getBoundingClientRect() || r
          let left = Math.max(0, labelRect.left), right = Math.min(innerWidth, labelRect.right)
          for (let p = label?.parentElement; p; p = p.parentElement) {
            const s = getComputedStyle(p), b = p.getBoundingClientRect()
            if (b.width && s.overflowX !== 'visible') { left = Math.max(left, b.left); right = Math.min(right, b.right) }
          }
          // Click the clipped label, never the expand caret at row.left + 10.
          const index = Number(el.getAttribute('data-fpl-tree-row-index'))
          return { index, x: r.left + (index === 0 ? 80 : 10), y: (top + bottom) / 2, visible: bottom - top >= r.height - 1 }
        }))
        const target = rows.find(row => row.index === layer.index && row.visible)
        if (target) {
          await tab.ax.click([target.x, target.y])
          selected = true
          break
        }
        const visible = rows.filter(r => r.visible)
        await tab.ax.scroll([100, 580], layer.index < (visible[0]?.index ?? 0) ? 'up' : 'down', Math.abs(layer.index - (visible[0]?.index ?? 0)) > 60 ? 2 : .35)
        await tab.playwright.waitForTimeout(80)
        await tab.ax.get()
      }
      if (!selected) throw Error(`Cannot reveal Figma row: ${node.id}`)
      let evidence
      for (let settle = 0; settle < 20; settle++) {
        await tab.playwright.waitForTimeout(180)
        evidence = await tab.playwright.evaluate(() => ({
          sourceUrl: location.href,
          selectedName: document.querySelector('[role="tabpanel"] [aria-label^="Click to copy layer name"]')?.getAttribute('aria-label')?.replace('Click to copy layer name: ', ''),
          code: [...document.querySelectorAll('[role="tabpanel"] code')].map(e => e.innerText),
          copyFields: [...document.querySelectorAll('[role="tabpanel"] button[aria-label^="Copy"]')].map(e => e.getAttribute('aria-label')),
        }))
        if (evidence.sourceUrl.includes(`node-id=${node.id.replace(':', '-')}`) && (sameName(evidence.selectedName, node.name) || node.id === inventory.sourceFrame && evidence.selectedName?.endsWith(node.name))) break
      }
      if (!evidence?.sourceUrl.includes(`node-id=${node.id.replace(':', '-')}`) || !sameName(evidence.selectedName, node.name)) throw Error(`Inspect mismatch: ${node.id}`)
      const lengths = await tab.playwright.evaluate(() => [...document.querySelectorAll('[role="tabpanel"] code')].map(e => e.innerText.length))
      for (let c = 0; c < lengths.length; c++) {
        if (lengths[c] < 16000) continue
        let code = ''
        for (let start = 0; start < lengths[c]; start += 16000) {
          code += await tab.playwright.evaluate(({ c, start }) => document.querySelectorAll('[role="tabpanel"] code')[c].innerText.slice(start, start + 16000), { c, start })
        }
        evidence.code[c] = code
      }
      if ((!evidence.code.length && !evidence.copyFields?.length) || evidence.code.some(c => c.includes('[Truncated]'))) throw Error(`Incomplete Inspect CSS/SVG: ${node.id}`)
      if (!evidence.code.length) evidence.noCodeReason = 'Figma Inspect exposed layer-property/assets controls without a CSS/SVG code block; all visible copy fields were recorded.'
      copied.set(node.id, { ...layer, implemented: true, selectedAt: new Date().toISOString(), settleWaitMs: 180, ...evidence })
    }
    record.source = 'Complete expanded Figma Layers; each visible row selected in parent-first order, exact node URL and settled Inspect CSS/SVG verified'
    record.nodes = [...copied.values()].sort((a, b) => a.index - b.index)
    await fs.writeFile(filename, JSON.stringify(record, null, 2) + '\n')
  }
  return { copied: copied.size, next: inventory.nodes.findIndex(n => !copied.has(n.id)), total: inventory.nodeCount }
}
