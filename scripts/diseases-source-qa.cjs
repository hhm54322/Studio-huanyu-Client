const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const dir = path.resolve('docs/figma-source/diseases')
const out = path.resolve('docs/figma-verification/diseases/2026-09-29')
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name)))
const mapping = read('node-to-code-2026-09-29.json')
const values = new Map(read('native-parameters-2026-09-29.json').nodes.map(n => [n.nodeId, n]))
const dev = new Map(read('dev-mode-2026-09-29.json').nodes.map(n => [n.nodeId, n]))
async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    await page.goto('http://127.0.0.1:5173/diseases-technologies', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const evidence = { nodes: [], typography: [], geometry: [], failures: [] }
    for (const node of mapping.nodes) {
      const element = page.locator(node.selector).first()
      if (!await element.count()) { evidence.failures.push(`${node.id}: missing ${node.selector}`); continue }
      evidence.nodes.push({ nodeId: node.id, selector: node.selector, rendered: node.rendered })
      if (!node.rendered) {
        if (await element.isVisible()) evidence.failures.push(`${node.id}: hidden source node is visible`)
        continue
      }
      const source = values.get(node.id), p = source.parameters
      if (p.type === 'TEXT') {
        const mixed = p.textData.characters.startsWith('合作医院：')
        for (const [index, run] of (mixed ? [null, 'strong'] : [null]).entries()) {
          const locator = run ? element.locator(run) : element
          const copied = dev.get(node.id).css[index]
          const expected = {
            fontSize: p.fontSize,
            lineHeight: p.lineHeight.units === 'PIXELS' ? p.lineHeight.value : 'normal',
            fontWeight: Number(copied.match(/font-weight:\s*(?:var\([^,]+,\s*)?(\d+)/)?.[1] || p.derivedTextData.fontMetaData.find(n => n.key.style === p.fontName.style)?.fontWeight),
            color: copied.match(/color:\s*(#[\da-f]+)/i)?.[1]?.toUpperCase(),
          }
          const actual = await locator.evaluate((el, placeholder) => {
            const s = getComputedStyle(el, placeholder ? '::placeholder' : undefined)
            const c = s.color.match(/\d+/g)?.slice(0, 3).map(n => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()
            return { fontSize: parseFloat(s.fontSize), lineHeight: s.lineHeight === 'normal' ? 'normal' : parseFloat(s.lineHeight), fontWeight: Number(s.fontWeight), color: `#${c}`, text: el.tagName === 'INPUT' ? el.placeholder : el.textContent }
          }, node.id === '144:4402')
          if (mixed) expected.fontWeight = index === 0 ? 400 : 500
          // Native font metadata resolves SF Pro's variable weights (510/590).
          if (!mixed && p.fontName.family === 'SF Pro') expected.fontWeight = p.derivedTextData.fontMetaData[0].fontWeight
          const paint = (mixed && index === 1 ? p.textData.styleOverrideTable[0] : p).fillPaints.find(n => n.type === 'SOLID')
          expected.color = '#' + [paint.color.r, paint.color.g, paint.color.b].map(n => Math.round(n * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
          for (const key of ['fontSize', 'lineHeight', 'fontWeight', 'color']) if (actual[key] !== expected[key]) evidence.failures.push(`${node.id}/${run || 'text'} ${key}: ${actual[key]} != ${expected[key]}`)
          if (index === 0 && actual.text.trim() !== p.textData.characters.trim()) evidence.failures.push(`${node.id}: text copy ${actual.text}`)
          evidence.typography.push({ nodeId: node.id, run, actual, expected })
        }
      }
      if (node.index < 206 && p.type !== 'TEXT' && node.ownerNodeId === node.id) {
        const actual = await element.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height } })
        const expected = { ...source.framePosition, width: p.size.x, height: p.size.y }
        for (const key of ['x', 'y', 'width', 'height']) if (Math.abs(actual[key] - expected[key]) >= .05) evidence.failures.push(`${node.id} ${key}: ${actual[key]} != ${expected[key]}`)
        evidence.geometry.push({ nodeId: node.id, actual, expected })
      }
    }
    fs.mkdirSync(out, { recursive: true })
    fs.writeFileSync(path.join(out, 'source-map-results.json'), JSON.stringify(evidence, null, 2) + '\n')
    console.log(JSON.stringify({ nodes: evidence.nodes.length, typography: evidence.typography.length, geometry: evidence.geometry.length, failures: evidence.failures }, null, 2))
    assert.equal(evidence.failures.length, 0, 'Source node checks failed')
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
