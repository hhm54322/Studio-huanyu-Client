// Refresh existing source evidence from the selected Figma Layers UI.
// Kept separate from older cached REPL modules so every inspected node gets
// a settled right-panel record, including repeated names such as Container.
import fs from 'node:fs/promises'

export async function collectSettledChunk(tab, directory, begin, end, date) {
  const read = async name => JSON.parse(await fs.readFile(`${directory}/${name}-${date}.json`, 'utf8'))
  const inventory = await read('native-inventory')
  const layers = new Map((await read('ui-layers')).nodes.map(n => [n.nodeId, n]))
  let record
  try { record = await read('dev-mode') } catch { record = { sourceFrame: inventory.sourceFrame, extractionDate: date, nodes: [] } }
  const records = new Map(record.nodes.map(n => [n.nodeId, n]))
  for (let index = begin; index < Math.min(end, inventory.nodes.length); index++) {
    const n = inventory.nodes[index], row = layers.get(n.id)
    if (!row || row.name !== n.name) throw Error(`Layers mismatch: ${n.id}`)
    if (!n.rendered) records.set(n.id, { ...row, implemented: false, reason: 'Authored hidden layer', code: [] })
    else {
      for (let pass = 0; pass < 80; pass++) {
        const visible = await tab.playwright.locator('[role="treegrid"] [role="row"]').evaluateAll(rows => rows.map(r => Number(r.getAttribute('data-fpl-tree-row-index'))))
        if (visible.includes(row.index)) break
        if (pass === 79) throw Error(`Missing Layers row ${n.id}`)
        const distance = Math.min(...visible.map(index => Math.abs(index - row.index)))
        await tab.ax.scroll([300, 580], row.index < visible[0] ? 'up' : 'down', distance > 60 ? 5 : 1)
        await tab.ax.get()
      }
      await tab.playwright.locator(`[role="treegrid"] [data-fpl-tree-row-index="${row.index}"] [data-testid="tree-grid-row-content"] [role="gridcell"]`).click()
      await tab.playwright.waitForURL(`**/*node-id=${n.id.replace(':', '-')}&m=dev`, { timeoutMs: 3000 })
      const selectedAt = new Date().toISOString()
      await tab.playwright.waitForTimeout(250)
      const evidence = await tab.playwright.evaluate(() => ({
        sourceUrl: location.href,
        selectedName: document.querySelector('[role="tabpanel"] [aria-label^="Click to copy layer name"]')?.getAttribute('aria-label')?.replace('Click to copy layer name: ', ''),
        code: [...document.querySelectorAll('[role="tabpanel"] code')].map(e => e.innerText),
        copyFields: [...document.querySelectorAll('[role="tabpanel"] button[aria-label^="Copy"]')].map(e => e.getAttribute('aria-label')),
      }))
      if (evidence.selectedName !== n.name || !evidence.sourceUrl.includes(`node-id=${n.id.replace(':', '-')}&`)) throw Error(`Inspect selection mismatch: ${n.id}`)
      if (evidence.code.some(code => code.includes('[Truncated]'))) throw Error(`Truncated CSS/SVG: ${n.id}`)
      records.set(n.id, { ...row, implemented: true, selectedAt, settleWaitMs: 250, ...evidence })
    }
    record.source = 'Complete Figma Layers; each visible node selected with 250ms settled Inspect CSS/SVG before copying'
    record.nodes = [...records.values()].sort((a, b) => a.index - b.index)
    await fs.writeFile(`${directory}/dev-mode-${date}.json`, JSON.stringify(record, null, 2) + '\n')
  }
  return { refreshed: record.nodes.filter(n => !n.implemented || n.settleWaitMs === 250).length, total: inventory.nodeCount }
}
