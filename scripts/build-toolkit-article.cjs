// One article at a time: the live Layers/Dev CSS record and authored native
// parameters must exist before this script can produce a Vue input baseline.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { chromium } = require('/Users/hhm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const root = path.resolve(__dirname, '..')
const key = process.argv[2]
assert.ok(/^[a-z-]+$/.test(key || ''), 'Pass one extracted article key')
const date = '2026-10-22'
const directory = path.join(root, 'docs/figma-source/toolkit-revision', key)
const templateDirectory = path.join(root, 'docs/figma-source/content-revision')
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
const hash = value => createHash('sha256').update(value).digest('hex')
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const flat = n => [n, ...n.children.flatMap(flat)]
const px = value => `${Number((value || 0).toFixed(5))}px`
const source = read(path.join(directory, `article-nodes-${date}.json`))
const inventory = read(path.join(directory, `native-inventory-${date}.json`))
const parameters = new Map(read(path.join(directory, `native-parameters-${date}.json`)).nodes.map(n => [n.nodeId, n.parameters]))
const dev = new Map(read(path.join(directory, `dev-mode-${date}.json`)).nodes.map(n => [n.nodeId, n]))
const layers = read(path.join(directory, `layers-${date}.json`)).nodes
assert.equal(inventory.sourceFrame, source.article)
assert.equal(inventory.layersCrossCheck, true)
assert.equal(layers.length, inventory.nodeCount)
for (const n of inventory.nodes) {
  const ui = layers.find(row => row.nodeId === n.id)
  assert.ok(ui && ui.name === n.name && ui.level === n.level && ui.parentNodeId === n.parentNodeId && ui.siblingOrder === n.siblingOrder, `Layers mismatch: ${n.id}`)
  assert.ok(dev.get(n.id)?.code?.length, `Missing selected Dev CSS: ${n.id}`)
}
const templateLock = read(path.join(templateDirectory, `baseline-lock-2026-10-21.json`))
for (const file of templateLock.files) assert.equal(hash(fs.readFileSync(path.join(templateDirectory, file.name))), file.sha256, file.name)
const template = read(path.join(templateDirectory, 'toolkit/source-tree-2026-10-21.json'))
const templateParameters = new Map(read(path.join(templateDirectory, 'toolkit/native-parameters-2026-10-21.json')).nodes.map(n => [n.nodeId, n.parameters]))
const markerLayout = templateParameters.get('143:3071')
assert.equal(markerLayout.stackMode, 'HORIZONTAL')
assert.equal(templateParameters.get('143:3072').textAutoResize, 'WIDTH_AND_HEIGHT')
const markerPadding = { left: markerLayout.stackHorizontalPadding, right: markerLayout.stackPaddingRight }
const color = paint => {
  if (!paint?.color) return 'transparent'
  const c = paint.color, rgb = [c.r, c.g, c.b].map(v => Math.round(v * 255))
  const alpha = (c.a ?? 1) * (paint.opacity ?? 1)
  return alpha === 1 ? `#${rgb.map(n => n.toString(16).padStart(2, '0')).join('')}` : `rgba(${rgb.join(',')},${alpha})`
}
const weight = style => ({ Regular: 400, Medium: 500, Semibold: 600, Bold: 700 }[style])
const textCss = p => `${p.fillPaints ? `color:${color(p.fillPaints.find(p => p.visible !== false))};` : ''}${p.fontName ? `font-family:"${p.fontName.family}";font-weight:${weight(p.fontName.style)};` : ''}${p.fontSize ? `font-size:${px(p.fontSize)};` : ''}${p.lineHeight?.units === 'PIXELS' ? `line-height:${px(p.lineHeight.value)};` : ''}`
function authoredRuns(p, desktop = false) {
  const table = new Map((p.textData.styleOverrideTable || []).map(s => [s.styleID, s]))
  const runs = []
  for (let i = 0; i < p.textData.characters.length; i++) {
    const id = p.textData.characterStyleIDs?.[i] || 0
    if (runs.at(-1)?.id === id) runs.at(-1).text += p.textData.characters[i]
    else runs.push({ id, text: p.textData.characters[i] })
  }
  return runs.map(r => {
    const override = structuredClone(table.get(r.id) || {})
    if (desktop) {
      // Semantic tokens are copied from the inspected PC template, not a
      // multiplier of the unfinished mobile layout or a screenshot estimate.
      if (override.fontSize) override.fontSize = 24
      if (override.lineHeight) override.lineHeight.value = 36
    }
    return { text: r.text, css: textCss(override) }
  })
}
function paragraphs(p, desktop = false) {
  const items = [{ runs: [] }]
  for (const run of authoredRuns(p, desktop)) run.text.split('\n').forEach((text, index) => {
    if (index) items.push({ runs: [] })
    if (text) items.at(-1).runs.push({ text, css: run.css })
  })
  const spacing = desktop ? 12 : p.paragraphSpacing || 0
  return items.map((item, i) => ({ ...item, css: `display:block;${i < items.length - 1 ? `margin-bottom:${spacing}px;` : ''}` }))
}
const assets = [], owners = new Map()
const assetDirectory = path.join(root, 'public/images/figma/toolkit-revision', key)
fs.mkdirSync(assetDirectory, { recursive: true })
const native = new Map(inventory.nodes.map(n => [n.id, n]))
const descendants = id => [id, ...native.get(id).children.flatMap(descendants)]
for (const n of inventory.nodes) {
  if (owners.has(n.id)) continue
  const svg = dev.get(n.id).code.find(code => code.startsWith('<svg'))
  if (!svg) continue
  assert.ok(svg.trim().endsWith('</svg>') && !svg.includes('[Truncated]'))
  const file = path.join(assetDirectory, `node-${n.id.replace(':', '-')}.svg`)
  fs.writeFileSync(file, svg + '\n')
  assets.push({ nodeId: n.id, projectPath: path.relative(root, file), sha256: hash(fs.readFileSync(file)), source: 'Exact selected Figma Dev Mode SVG; source QA only, PC uses locked PC SVG' })
  descendants(n.id).forEach(id => owners.set(id, n.id))
}
function buildSource(id, top = false) {
  const p = parameters.get(id), n = native.get(id), svgOwner = owners.get(id)
  const at = top ? { x: 0, y: 0 } : { x: p.transform?.m02 || 0, y: p.transform?.m12 || 0 }
  let css = dev.get(id).code.filter(code => !code.startsWith('<svg')).join('\n')
  css += `;position:${top ? 'relative' : 'absolute'};left:${px(at.x)};top:${px(at.y)};width:${px(p.size.x)};height:${px(p.size.y)};box-sizing:border-box;padding:0;margin:0;display:block;`
  if (p.type === 'TEXT') css += textCss(p) + 'white-space:pre-wrap;'
  const asset = assets.find(a => a.nodeId === id)
  const node = { id, name: n.name, type: n.type, width: p.size.x, height: p.size.y, x: at.x, y: at.y, visible: n.rendered, css, text: p.textData?.characters || '', children: svgOwner ? [] : n.children.map(child => buildSource(child)) }
  if (asset) {
    node.svg = '/' + asset.projectPath.replace(/^public\//, '')
    // Dev Mode SVG paths already contain the source layer transform.
    // Use its native transformed bounds, not a second CSS flip/rotation.
    const t = p.transform || {}
    const corners = [[0, 0], [p.size.x, 0], [0, p.size.y], [p.size.x, p.size.y]].map(([x, y]) => ({ x: (t.m00 ?? 1) * x + (t.m01 || 0) * y, y: (t.m10 || 0) * x + (t.m11 ?? 1) * y }))
    const left = Math.min(...corners.map(c => c.x)), right = Math.max(...corners.map(c => c.x))
    const top = Math.min(...corners.map(c => c.y)), bottom = Math.max(...corners.map(c => c.y))
    node.css += `background:none;opacity:1;transform:none;left:${px(at.x + left)};top:${px(at.y + top)};width:${px(right - left)};height:${px(bottom - top)};`
  }
  if (p.type === 'TEXT') {
    node.textRuns = authoredRuns(p)
    node.textParagraphs = paragraphs(p)
    const characterStyles = node.textRuns.flatMap(run => Array.from({ length: run.text.length }, () => run.css))
    if (p.derivedTextData?.baselines?.length > 1) node.textLines = p.derivedTextData.baselines.map(line => {
      const text = p.textData.characters.slice(line.firstCharacter, line.endCharacter).replace(/\n$/, '')
      const runs = []
      for (let index = 0; index < text.length; index++) {
        const css = characterStyles[line.firstCharacter + index] || ''
        if (runs.at(-1)?.css === css) runs.at(-1).text += text[index]
        else runs.push({ text: text[index], css })
      }
      return { runs, baseline: line.position.y - line.lineY, css: `display:block;position:absolute;left:${px(line.position.x)};top:${px(line.lineY)};width:${px(line.width)};height:${px(line.lineHeight)};line-height:${px(line.lineHeight)};white-space:pre;` }
    })
  }
  return node
}
const render = n => `<div data-figma-node="${n.id}" style="${esc(n.css)}">${n.svg ? `<img src="${n.svg}" alt="" style="display:block;width:100%;height:auto">` : n.textLines || n.textParagraphs ? (n.textLines || n.textParagraphs).map(p => `<span style="${esc(p.css)}">${p.runs.map(run => `<span style="${esc(run.css)}">${esc(run.text)}</span>`).join('')}</span>`).join('') : n.textRuns ? n.textRuns.map(run => `<span style="${esc(run.css)}">${esc(run.text)}</span>`).join('') : esc(n.text)}${n.children.map(render).join('')}</div>`
const html = (title, body) => `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><link rel="stylesheet" href="/fonts/home-source-fonts.css"><title>${esc(title)}</title><style>html,body{margin:0}*{box-sizing:border-box}body{font-family:'PingFang SC',sans-serif;-webkit-font-smoothing:antialiased}img{max-width:none}[data-figma-node]{font-synthesis:none}</style>${body}</html>\n`
async function main() {
  const sourceTree = buildSource(source.article, true)
  save(path.join(directory, `source-tree-${date}.json`), { sourceFrame: source.article, sourceSHA256: inventory.sourceSHA256, root: sourceTree })
  fs.writeFileSync(path.join(directory, `source-baseline-${date}.html`), html(source.key, render(sourceTree)))
  const desktop = structuredClone(template.root), nodes = new Map(flat(desktop).map(n => [n.id, n]))
  const title = parameters.get(source.title).textData.characters
  const body = nodes.get('143:3077'), authoredBody = structuredClone(parameters.get(source.body))
  // Keep the original Figma text untouched. Only explicit, recorded typo
  // deletions may affect the derived PC copy and its character style indices.
  for (const { from, to } of source.copyCorrections || []) {
    const index = authoredBody.textData.characters.indexOf(from)
    assert.ok(index >= 0 && authoredBody.textData.characters.indexOf(from, index + from.length) < 0 && from.includes(to), 'Copy corrections must be unique literal typo deletions')
    const styles = authoredBody.textData.characterStyleIDs
    authoredBody.textData.characters = authoredBody.textData.characters.slice(0, index) + to + authoredBody.textData.characters.slice(index + from.length)
    if (styles) authoredBody.textData.characterStyleIDs = [...styles.slice(0, index + to.length), ...styles.slice(index + from.length)]
  }
  const baseParagraphCss = textCss(parameters.get(source.body))
  assert.ok(baseParagraphCss.includes('font-size:12px;line-height:18px;'))
  body.text = authoredBody.textData.characters
  body.textRuns = authoredRuns(authoredBody, true)
  body.textParagraphs = paragraphs(authoredBody, true)
  delete body.textLines
  // PC body defaults and section typography match the locked PC template.
  body.css = body.css.replace(/(^|[;\n])height:[\d.]+px/g, '$1height:auto')
  nodes.get('143:3076').children = [body]
  for (const id of ['143:3074', '143:3073']) {
    const n = nodes.get(id)
    n.css = n.css.replace(/(^|[;\n])width:[\d.]+px/g, '$1width:max-content')
  }
  const titleNode = nodes.get('143:3074')
  titleNode.text = title
  delete titleNode.textLines; delete titleNode.textRuns; delete titleNode.textParagraphs
  const markerText = parameters.get(source.marker).textData.characters
  nodes.get('143:3072').text = markerText
  // The PC tag is an authored horizontal Auto Layout frame with Hug sizing.
  // The locked template JSON stores the source instance width (191px), but
  // each article owns its marker copy. Measure the copied PC text with the
  // inspected PingFang/14px/500/-0.15px style, then apply the exact Hug width
  // (text width + 16px left + 16px right padding). This keeps the Figma
  // padding/gap semantics while preventing long article labels from escaping
  // their blue capsule.
  const markerFrame = nodes.get('143:3071')
  const markerNode = nodes.get('143:3072')
  markerNode.css = markerNode.css.replace(/(^|[;\n])width:[\d.]+px/g, '$1width:max-content')
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    await page.goto('http://127.0.0.1:5174/', { waitUntil: 'domcontentloaded' })
    await page.setContent(html(title, render(desktop)))
    await page.evaluate(() => document.fonts.ready)
    const dimensions = await page.evaluate(padding => {
      const marker = document.querySelector('[data-figma-node="143:3072"]')
      const markerFrame = document.querySelector('[data-figma-node="143:3071"]')
      const body = document.querySelector('[data-figma-node="143:3077"]')
      const title = document.querySelector('[data-figma-node="143:3074"]')
      const textWidth = marker.getBoundingClientRect().width
      const width = textWidth + padding.left + padding.right
      return {
        body: body.getBoundingClientRect().height,
        title: title.getBoundingClientRect().width,
        markerText: textWidth,
        marker: width,
        markerFrameHeight: markerFrame.getBoundingClientRect().height,
      }
    }, markerPadding)
    markerNode.width = dimensions.markerText
    markerNode.css = markerNode.css.replace(/(^|[;\n])width:max-content/g, `$1width:${px(dimensions.markerText)}`)
    markerFrame.width = dimensions.marker
    markerFrame.css = markerFrame.css.replace(/(^|[;\n])width:[\d.]+px/g, `$1width:${px(dimensions.marker)}`)
    const delta = dimensions.body - nodes.get('143:3076').height
    body.height = dimensions.body
    body.css = body.css.replace(/(^|[;\n])height:auto/g, `$1height:${px(body.height)}`)
    for (const id of ['143:3076', '143:3075', '143:3064', '143:3063', '143:3062', '143:3061', '143:3060', '143:3059', '143:3058']) {
      const n = nodes.get(id)
      n.height += delta
      n.css = n.css.replace(/(^|[;\n])height:[\d.]+px/g, `$1height:${px(n.height)}`)
    }
    const footer = nodes.get('143:3163')
    footer.y += delta
    footer.css = footer.css.replace(/(^|[;\n])top:[\d.]+px/g, `$1top:${px(footer.y)}`)
    for (const id of ['143:3074', '143:3073']) nodes.get(id).width = dimensions.title
    const ownerIds = ['143:3062', '143:3065', '143:3066', '143:3066', '143:3066', '143:3069', '143:3070', '143:3071', '143:3072', '143:3072', '143:3073', '143:3074', '143:3075', '143:3076', '143:3077']
    assert.equal(ownerIds.length, inventory.nodes.length)
    const mapping = inventory.nodes.map((n, index) => ({ nodeId: n.id, name: n.name, parentNodeId: n.parentNodeId, siblingOrder: n.siblingOrder, rendered: true, ownerNodeId: ownerIds[index], selector: `[data-figma-node="${ownerIds[index]}"]`, component: 'HomeSourceNode.vue', sourceParametersNodeId: n.id, sourceDevModeNodeId: n.id, composition: 'Exact authored article content + independently locked PC toolkit template; mobile UI is not implemented' }))
    save(path.join(directory, `node-to-code-${date}.json`), { sourceFrame: source.article, templateFrame: template.sourceFrame, nodes: mapping })
    save(path.join(directory, `desktop-variant-${date}.json`), { key, title, articleFrame: source.frame, articleNode: source.article, sourceSHA256: inventory.sourceSHA256, templateFrame: template.sourceFrame, root: desktop, contentMapping: mapping, mobileUI: 'deferred by user', measuredAutoLayout: { ...dimensions, markerAutoLayout: '143:3071 Hug = measured 143:3072 text width + 16px left/right padding copied from Figma Dev Mode' }, geometry: 'Authored copy composed into the inspected PC template. Not an independently authored PC article frame.' })
    fs.writeFileSync(path.join(directory, `desktop-baseline-${date}.html`), html(title, render(desktop)))
    fs.writeFileSync(path.join(directory, `dev-styles-${date}.css`), inventory.nodes.map(n => `[data-source-node="${n.id}"]{${dev.get(n.id).code.filter(s => !s.startsWith('<svg')).join('\n')}}`).join('\n') + '\n')
    save(path.join(directory, `assets-${date}.json`), { sourceAssets: assets, desktopAssets: read(path.join(templateDirectory, 'assets-2026-10-21.json')).assets.filter(a => !['143:3079', '143:3080'].includes(a.nodeId)) })
    const sourceFiles = ['article-nodes', 'layers', 'native-inventory', 'native-parameters', 'native-image-paints', 'dev-mode', 'source-tree', 'node-to-code', 'assets'].map(name => path.join(directory, `${name}-${date}.json`))
    const files = [...sourceFiles, path.join(directory, `source-baseline-${date}.html`), path.join(directory, `desktop-variant-${date}.json`), path.join(directory, `desktop-baseline-${date}.html`), path.join(directory, `dev-styles-${date}.css`), ...templateLock.files.map(f => path.join(templateDirectory, f.name)), __filename]
    save(path.join(directory, `baseline-lock-${date}.json`), { key, lockedAt: new Date().toISOString(), phase: 'Complete source and PC-template composition before Vue, not visual acceptance', sourceFrame: source.article, templateFrame: template.sourceFrame, files: files.map(file => ({ name: path.relative(root, file), sha256: hash(fs.readFileSync(file)) })) })
    console.log(JSON.stringify({ key, title, article: source.article, nodes: inventory.nodeCount, desktopHeight: desktop.height, dimensions }, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
