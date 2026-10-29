const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { chromium } = require(path.join(process.env.HUANYU_QA_TOOLS || '/tmp/huanyu-visual-qa-tools/node_modules', 'playwright'))
const directory = path.resolve('docs/figma-source/cases')
const mapping = JSON.parse(fs.readFileSync(path.join(directory, 'node-to-code-2026-09-29.json')))
const native = new Map(JSON.parse(fs.readFileSync(path.join(directory, 'native-parameters-2026-09-29.json'))).nodes.map(n => [n.nodeId, n]))
const out = path.resolve(process.env.HUANYU_QA_OUT || 'docs/figma-verification/cases/2026-09-29')
const corrected = text => text.replace('患者背景：:', '患者背景：').replaceAll('压迫险', '压迫风险').replaceAll('手术险', '手术风险')
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.HUANYU_QA_BROWSER })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
    await page.goto(`${process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'}/cases`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const evidence = { nodes: [], typography: [], geometry: [] }
    for (const node of mapping.nodes) {
      const element = page.locator(node.selector).first()
      assert.ok(await element.count(), `${node.id}: missing ${node.selector}`)
      evidence.nodes.push({ nodeId: node.id, selector: node.selector, rendered: node.rendered })
      if (!node.rendered) {
        assert.equal(await element.isVisible(), false, `${node.id}: authored hidden node rendered`)
        continue
      }
      const value = native.get(node.id).parameters
      if (value.type !== 'TEXT') continue
      const mixed = value.textData.styleOverrideTable?.length > 1
      const runs = mixed ? ['dt', 'dd'] : [null]
      for (const [index, run] of runs.entries()) {
        const locator = run ? element.locator(run) : element
        const expectedStyle = mixed ? { ...value, ...value.textData.styleOverrideTable[index] } : value
        const paint = expectedStyle.fillPaints.find(n => n.type === 'SOLID' && n.visible !== false)
        const actual = await locator.evaluate(el => {
          const s = getComputedStyle(el)
          return { text: el.tagName === 'SELECT' ? el.selectedOptions[0].textContent : el.textContent, fontSize: parseFloat(s.fontSize), lineHeight: parseFloat(s.lineHeight), fontWeight: Number(s.fontWeight), color: s.color, opacity: s.opacity }
        })
        const expected = {
          fontSize: expectedStyle.fontSize,
          lineHeight: expectedStyle.lineHeight.value,
          fontWeight: value.derivedTextData.fontMetaData[index].fontWeight,
          color: `rgb(${[paint.color.r, paint.color.g, paint.color.b].map(n => Math.round(n * 255)).join(', ')})`,
        }
        if (!mixed) assert.ok(actual.text.includes(corrected(value.textData.characters)), `${node.id}: copy ${actual.text}`)
        else assert.equal(await element.textContent(), corrected(value.textData.characters), `${node.id}: mixed text copy`)
        for (const key of ['fontSize', 'lineHeight', 'fontWeight', 'color']) assert.equal(actual[key], expected[key], `${node.id}/${run || 'text'}: ${key}`)
        evidence.typography.push({ nodeId: node.id, run, actual, expected })
      }
    }
    const ids = ['190:5303', '190:5304', '190:5305', '190:5323', '190:5328', '221:6192', '190:5365', '190:5366', '190:5383', '190:5367', '190:5384', '190:5368', '190:5385', '190:5374', '190:5393', '190:5402', '190:5404']
    for (const id of ids) {
      const node = mapping.nodes.find(n => n.id === id), value = native.get(id)
      const actual = await page.locator(node.selector).first().evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height, opacity: getComputedStyle(el).opacity } })
      const expected = { ...value.framePosition, width: value.parameters.size.x, height: value.parameters.size.y }
      for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(actual[key] - expected[key]) < .05, `${id}: ${key}: ${actual[key]} != ${expected[key]}`)
      assert.equal(actual.opacity, '1', `${id}: source control not visible`)
      evidence.geometry.push({ nodeId: id, actual, expected })
    }
    fs.mkdirSync(out, { recursive: true })
    fs.writeFileSync(path.join(out, 'source-map-results.json'), JSON.stringify(evidence, null, 2) + '\n')
    console.log(JSON.stringify({ nodes: evidence.nodes.length, typography: evidence.typography.length, geometry: evidence.geometry.length }))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
