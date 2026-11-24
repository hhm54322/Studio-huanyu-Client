import { appendFile, readFile, writeFile } from 'node:fs/promises'

function readRows() {
  const tree = document.querySelector('[role="treegrid"]')
  if (!tree) return null
  let viewport = tree.parentElement
  while (viewport && !['auto', 'scroll'].includes(getComputedStyle(viewport).overflowY)) viewport = viewport.parentElement
  if (!viewport) return null
  const rect = viewport.getBoundingClientRect()
  const rows = [...tree.querySelectorAll('[role="row"]')].map(row => {
    const identity = row.querySelector('[data-testid$="-layers-panel-row"]')
    const label = identity?.querySelector('[role="gridcell"]')
    const box = row.getBoundingClientRect()
    const y = Math.round((box.top + box.bottom) / 2)
    const x = [box.left + 10, box.left + 80].map(Math.round).find(point => {
      const hit = document.elementFromPoint(point, y)
      return hit?.closest('[role="row"]') === row && !hit.closest('button')
    })
    return {
      index: Number(row.getAttribute('data-fpl-tree-row-index')),
      level: Number(row.getAttribute('aria-level')),
      nodeId: identity?.getAttribute('data-testid')?.replace(/-layers-panel-row$/, ''),
      name: label?.textContent,
      visible: x !== undefined && box.top >= rect.top && box.bottom <= rect.bottom,
      x,
      y,
    }
  })
  return { rows, scrollTop: viewport.scrollTop, rowHeight: tree.querySelector('[role="row"]')?.getBoundingClientRect().height || 32,
    x: rect.left + 14, y: rect.top + rect.height / 2, height: rect.height }
}

function readInspect() {
  const panel = document.querySelector('[role="tabpanel"]')
  return {
    sourceUrl: location.href,
    selectedName: panel?.querySelector('[aria-label^="Click to copy layer name"]')?.getAttribute('aria-label')?.replace('Click to copy layer name: ', ''),
    code: [...(panel?.querySelectorAll('code') ?? [])].map(el => el.innerText),
    copyFields: [...(panel?.querySelectorAll('[aria-label^="Copy"]') ?? [])].map(el => el.getAttribute('aria-label')),
  }
}

const sameName = (left, right) => left?.trim() === right?.trim()
const sourceId = url => new URL(url).searchParams.get('node-id')?.replace(/^(\d+)-(\d+)$/, '$1:$2')

async function findRow(tab, index) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const current = await tab.playwright.evaluate(readRows)
    if (!current) throw Error('No live Dev Mode layer viewport')
    const row = current.rows.find(entry => entry.index === index && entry.visible)
    if (row) return row
    const anchor = current.rows[Math.floor(current.rows.length / 2)]
    if (!anchor) throw Error('No live Dev Mode layers')
    const targetY = anchor.y + (index - anchor.index) * current.rowHeight
    const delta = targetY - current.y
    await tab.ax.scroll([Math.round(current.x), Math.round(current.y)], delta < 0 ? 'up' : 'down',
      Math.min(8, Math.max(0.3, Math.abs(delta) / current.height)))
    await tab.playwright.waitForTimeout(90)
  }
  throw Error(`Could not reveal layer row ${index}`)
}

async function readSelected(tab, row) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt === 0) await tab.ax.click([Math.round(row.x), Math.round(row.y)])
    else await tab.playwright.getByTestId(`${row.nodeId}-layers-panel-row`).locator('[role="gridcell"]').click({ timeout: 3000 })
    // Figma updates the selected URL and heading before replacing the CSS and
    // SVG blocks. Wait for the Inspector to render before reading either.
    await tab.playwright.waitForTimeout(180)
    for (let settle = 0; settle < 8; settle++) {
      const selected = await tab.playwright.evaluate(readInspect)
      if (sourceId(selected.sourceUrl) === row.nodeId && sameName(selected.selectedName, row.name)) {
        for (let index = 0; index < selected.code.length; index++) {
          if (selected.code[index].length < 12000 && !selected.code[index].includes('[Truncated]')) continue
          const length = await tab.playwright.evaluate(i => document.querySelectorAll('[role="tabpanel"] code')[i].innerText.length, index)
          let code = ''
          for (let start = 0; start < length; start += 12000) {
            code += await tab.playwright.evaluate(({ index, start }) => document.querySelectorAll('[role="tabpanel"] code')[index].innerText.slice(start, start + 12000), { index, start })
          }
          selected.code[index] = code
        }
        return { ...selected, selectedAt: new Date().toISOString() }
      }
      await tab.playwright.waitForTimeout(45)
    }
  }
  throw Error(`Inspect selection did not settle for ${row.nodeId} ${row.name}`)
}

/** The caller opens the source and recursively expands it in the existing IAB. */
export async function collectFigmaFrame(tab, directory, date, limit = Infinity, recheck = []) {
  const file = await readFile(`${directory}/native-inventory-${date}.json`, 'utf8')
  const { sourceFrame, sourceSHA256, nodes } = JSON.parse(file)
  const progressFile = `${directory}/dev-mode-progress.jsonl`
  const previous = await readFile(progressFile, 'utf8').catch(error => {
    if (error.code === 'ENOENT') return ''
    throw error
  })
  const evidence = new Map(previous.trim().split('\n').filter(Boolean).map(line => {
    const entry = JSON.parse(line)
    if (entry.sourceSHA256 !== sourceSHA256) throw Error('Stored Dev Mode records belong to another export')
    return [entry.nodeId, entry]
  }))
  const recheckIds = new Set(recheck)
  let count = 0
  for (const node of nodes) {
    if (evidence.has(node.id) && !recheckIds.has(node.id)) continue
    if (recheckIds.size && !recheckIds.has(node.id)) continue
    if (count >= limit) break
    const row = await findRow(tab, node.index)
    if (row.nodeId !== node.id || row.level !== node.level || !sameName(row.name, node.name)) {
      throw Error(`Layers and export differ at row ${node.index}: ${node.id} ${node.name} versus ${row.nodeId} ${row.name}`)
    }
    const selected = node.rendered ? await readSelected(tab, { ...row, name: node.name }) : {}
    const entry = {
      index: node.index, level: node.level, nodeId: node.id, name: node.name, uiName: row.name,
      parentNodeId: node.parentNodeId, siblingOrder: node.siblingOrder, visible: node.visible,
      implemented: node.rendered, sourceSHA256, code: [],
      ...selected,
    }
    await appendFile(progressFile, JSON.stringify(entry) + '\n')
    evidence.set(node.id, entry)
    count++
  }
  if (evidence.size === nodes.length) {
    const ordered = nodes.map(node => evidence.get(node.id))
    const payload = { sourceFrame, sourceSHA256, extractionDate: date, nodeCount: nodes.length, layersCrossCheck: true, nodes: ordered }
    await writeFile(`${directory}/ui-layers-${date}.json`, JSON.stringify({ ...payload, nodes: ordered.map(({ index, level, nodeId, name, parentNodeId, siblingOrder }) => ({ index, level, nodeId, name, parentNodeId, siblingOrder })) }, null, 2) + '\n')
    await writeFile(`${directory}/dev-mode-${date}.json`, JSON.stringify(payload, null, 2) + '\n')
  }
  return { copied: evidence.size, total: nodes.length, added: count }
}
