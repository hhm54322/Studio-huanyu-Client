const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const sourceDir = path.resolve('docs/figma-source/home')
const layers = JSON.parse(fs.readFileSync(path.join(sourceDir, 'layers-2026-09-28.json'), 'utf8'))
const sectionStarts = layers.flatMap((layer, index) => layer.level === 3 && layer.name === 'Section' ? [index] : [])
const normalize = (value) => value.replace(/[\s“”"']/g, '').toLowerCase()
const generic = /^(?:Container(?::margin)?|Frame(?: \d+)?|Heading \d|Paragraph|Text|Button|Tab(?: List| Panel)?|List Item|Icon|Vector|Group|Image(?: \(.+\))?|Link|Section)$/
const sourceCopyOverrides = new Set(['143:98', '143:108', '143:118', '143:127'])

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent(fs.readFileSync(path.join(sourceDir, 'frame-2026-09-28.html'), 'utf8'), { waitUntil: 'domcontentloaded' })
    const htmlSections = await page.evaluate(() => {
      const root = document.body.firstElementChild
      return [...root.children[0].children[0].children].map((section, sectionIndex) => [section, ...section.querySelectorAll('*')].map((element, index) => ({
        index,
        sectionIndex: sectionIndex + 1,
        tag: element.tagName.toLowerCase(),
        text: element.children.length ? '' : element.textContent.trim(),
        style: element.getAttribute('style') || '',
      })))
    })
    const sections = sectionStarts.map((start, sectionIndex) => {
      let end = sectionStarts[sectionIndex + 1] ?? layers.findIndex((layer, index) => index > start && layer.level <= 2)
      if (end < 0) end = layers.length
      const sourceLayers = layers.slice(start, end)
      const html = htmlSections[sectionIndex]
      const sameCount = sourceLayers.length === html.length
      const textMismatches = sameCount ? sourceLayers.flatMap((layer, index) => {
        if (generic.test(layer.name) || !html[index].text) return []
        return normalize(layer.name) === normalize(html[index].text) || sourceCopyOverrides.has(layer.id) ? [] : [{ nodeId: layer.id, name: layer.name, htmlText: html[index].text }]
      }) : []
      const aligned = sameCount && !textMismatches.length
      const stack = []
      const nodes = aligned ? sourceLayers.map((layer, index) => {
        stack[layer.level] = layer.id
        const element = html[index]
        return { nodeId: layer.id, parentNodeId: stack[layer.level - 1] || null, order: index, layer: layer.name, tag: element.tag, text: element.text, inlineStyle: element.style, ...(sourceCopyOverrides.has(layer.id) ? { copySource: 'Figma Dev Mode HTML; layer name is stale English placeholder' } : {}) }
      }) : []
      return { sectionIndex: sectionIndex + 1, nodeId: sourceLayers[0].id, layerCount: sourceLayers.length, htmlElementCount: html.length, aligned, textMismatches, nodes }
    })
    const output = {
      sourceFrame: '143:45',
      sourceHtml: 'docs/figma-source/home/frame-2026-09-28.html',
      sourceLayers: 'docs/figma-source/home/layers-2026-09-28.json',
      sections,
    }
    fs.writeFileSync(path.join(sourceDir, 'aligned-baseline-2026-09-29.json'), JSON.stringify(output, null, 2) + '\n')
    for (const section of sections) console.log(`${section.nodeId}: ${section.aligned ? 'aligned' : 'needs node review'} (${section.layerCount} Layers / ${section.htmlElementCount} HTML${section.textMismatches.length ? ` / ${section.textMismatches.length} copy conflicts` : ''})`)
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
