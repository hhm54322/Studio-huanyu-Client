const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const UZIP = require(path.join(process.env.HUANYU_PARSER_MODULES, 'uzip'))
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')

async function main() {
  const root = path.resolve(__dirname, '..')
  const source = process.env.HUANYU_NATIVE_SOURCE
  const inventory = JSON.parse(fs.readFileSync(path.join(source, 'native-inventory-2026-09-29.json')))
  const native = JSON.parse(fs.readFileSync(path.join(source, 'native-parameters-2026-09-29.json')))
  const dev = JSON.parse(fs.readFileSync(path.join(root, 'docs/figma-source/home/dev-mode-2026-09-29.json')))
  const values = new Map(native.nodes.map(n => [n.nodeId, n.parameters]))
  const bytes = fs.readFileSync(inventory.sourceFile)
  if (createHash('sha256').update(bytes).digest('hex') !== inventory.sourceSHA256) throw new Error('Figma export changed')
  const archive = UZIP.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
  const group = inventory.nodes.find(n => n.id === '143:854')
  const cards = group.children.map(id => inventory.nodes.find(n => n.id === id))
  const record = []
  const html = cards.map(card => {
    const p = values.get(card.id)
    const cardCss = dev[card.id].css.join('')
    const children = card.children.map(id => {
      const c = values.get(id)
      const paint = c.fillPaints.find(p => p.type === 'IMAGE' && p.visible !== false)
      if (!paint) {
        record.push({ nodeId: id, parentNodeId: card.id, size: c.size, transform: c.transform, css: dev[id].css })
        return `<div data-node-id="${id}" style="${dev[id].css.join('')};position:absolute;left:${c.transform.m02}px;top:${c.transform.m12}px"></div>`
      }
      const hash = Buffer.from(paint.image.hash).toString('hex')
      const asset = Buffer.from(archive[`images/${hash}`])
      const mime = asset[0] === 0x89 ? 'image/png' : asset[0] === 0xff ? 'image/jpeg' : 'image/webp'
      const css = dev[id].css.join('').replace('<path-to-image>', `data:${mime};base64,${asset.toString('base64')}`).replace(' lightgray ', ' transparent ')
      record.push({ nodeId: id, parentNodeId: card.id, size: c.size, transform: c.transform, css: dev[id].css, imageHash: hash })
      return `<div data-node-id="${id}" style="${css};position:absolute;left:${c.transform.m02}px;top:${c.transform.m12}px"></div>`
    }).join('')
    record.push({ nodeId: card.id, parentNodeId: group.id, size: p.size, transform: p.transform, css: dev[card.id].css })
    return `<div data-node-id="${card.id}" style="${cardCss};position:absolute;left:${p.transform.m02}px;top:${p.transform.m12}px">${children}</div>`
  }).join('')
  const directory = path.join(root, 'docs/figma-source/home')
  const baseline = `<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:3570px;height:472px;background:#f5f6f7}#partners{position:relative;width:3546px;height:472px;overflow:hidden}</style></head><body><div id="partners">${html}</div></body></html>`
  fs.writeFileSync(path.join(directory, 'partners-baseline.html'), baseline)
  fs.writeFileSync(path.join(directory, 'partners-parameters.json'), JSON.stringify({ sourceFile: inventory.sourceFile, sourceSHA256: inventory.sourceSHA256, group: { nodeId: group.id, ...values.get(group.id) }, cycleWidth: 3570, seamGap: 24, nodes: record }, null, 2) + '\n')
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 3570, height: 472 }, deviceScaleFactor: 1 })
    await page.setContent(baseline)
    const png = await page.screenshot()
    const assetPath = path.join(root, 'public/images/figma/partners-track.webp')
    await sharp(png).webp({ quality: 92, effort: 6 }).toFile(assetPath)
    const reference = await sharp(png).extract({ left: 1002, top: 0, width: 1440, height: 472 }).png().toBuffer()
    fs.writeFileSync(path.join(directory, 'partners-unfaded-reference.png'), reference)
    console.log(JSON.stringify({ cards: cards.length, nodes: record.length, bytes: fs.statSync(assetPath).size, assetPath }))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
