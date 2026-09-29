const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const UZIP = require('/tmp/huanyu-fig-parser.Ifwr2W/node_modules/uzip')
const sharp = require('/tmp/huanyu-visual-qa-tools/node_modules/sharp')
const root = path.resolve(__dirname, '..')
const dir = path.join(root, 'docs/figma-source/hospitals')
const inventory = JSON.parse(fs.readFileSync(path.join(dir, 'native-inventory-2026-09-29.json')))
const native = JSON.parse(fs.readFileSync(path.join(dir, 'native-parameters-2026-09-29.json')))
const dev = JSON.parse(fs.readFileSync(path.join(dir, 'dev-mode-2026-09-29.json')))
const paints = JSON.parse(fs.readFileSync(path.join(dir, 'native-image-paints-2026-09-29.json')))
const nodes = new Map(inventory.nodes.map(n => [n.id, n]))
const values = new Map(native.nodes.map(n => [n.nodeId, n]))
const copied = new Map(dev.nodes.map(n => [n.nodeId, n]))
const bytes = fs.readFileSync(inventory.sourceFile)
if (createHash('sha256').update(bytes).digest('hex') !== inventory.sourceSHA256) throw new Error('Native file changed')
const archive = UZIP.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
const save = (name, data) => fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2) + '\n')
const targets = new Map()
const bind = (id, selector, mode = 'DOM') => targets.set(id, { selector, mode, ownerNodeId: id })
const children = id => nodes.get(id).children.map(id => nodes.get(id))
const descendants = id => [nodes.get(id), ...children(id).flatMap(n => descendants(n.id))]
const p = id => values.get(id).parameters
const text = id => p(id).textData?.characters
const rgba = paint => `rgba(${[paint.color.r,paint.color.g,paint.color.b].map(v => Math.round(v * 255)).join(',')},${(paint.color.a ?? 1) * (paint.opacity ?? 1)})`
const assets = []
const assetDirectory = path.join(root, 'public/images/figma/hospital-source')
fs.mkdirSync(assetDirectory, { recursive: true })
const pathFor = (id, ext) => `/images/figma/hospital-source/node-${id.replace(':', '-')}.${ext}`
const vectors = new Map()
for (const node of inventory.nodes) {
  const css = copied.get(node.id)?.css
  if (!css?.length) throw new Error(`No Dev Mode copy for ${node.id}`)
  const svg = css.find(code => code.trim().startsWith('<svg'))
  if (svg) {
    const projectPath = pathFor(node.id, 'svg')
    fs.writeFileSync(path.join(root, 'public', projectPath), svg + '\n')
    assets.push({ nodeId: node.id, name: node.name, projectPath: `/public${projectPath}`, export: 'Figma Dev Mode SVG code' })
    vectors.set(node.id, projectPath)
  }
}
const images = new Map()
async function main() {
  for (const asset of paints.assets.filter(a => a.rendered)) {
    const projectPath = pathFor(asset.nodeId, 'webp')
    await sharp(Buffer.from(archive[`images/${asset.imageHash}`])).webp({lossless:true}).toFile(path.join(root, 'public', projectPath))
    const superseded = path.join(root, 'public', pathFor(asset.nodeId, 'png'))
    if(fs.existsSync(superseded)) fs.unlinkSync(superseded)
    images.set(asset.nodeId, { src: projectPath, paint: asset.paint })
    assets.push({ nodeId: asset.nodeId, name: nodes.get(asset.nodeId).name, imageHash: asset.imageHash, projectPath: `/public${projectPath}`, export: 'Original Figma image decoded to lossless WebP; identical pixels, native crop/transform retained', paint: asset.paint })
  }
  for (const id of ['144:4707','144:4708','144:4709']) bind(id, '.hospital-page')
  bind('144:4710', '.hospital-hero')
  bind('144:4711', '.hospital-hero__content')
  bind('144:4712', '.hospital-hero__copy')
  bind('144:4713', '.hospital-hero__features')
  for (const [index, chip] of children('144:4713').entries()) {
    bind(chip.id, `.hospital-hero__features>span:nth-child(${index + 1})`)
    const [icon, label] = children(chip.id)
    bind(icon.id, `.hospital-hero__features>span:nth-child(${index + 1})>img`, 'Figma SVG asset')
    bind(label.id, `.hospital-hero__features>span:nth-child(${index + 1})>.feature-label`)
  }
  for (const id of ['144:4727','144:4728']) bind(id, '.hospital-hero h1')
  for (const id of ['144:4729','144:4730']) bind(id, '.hospital-hero p')
  bind('144:4731', '.hospital-directory')
  bind('144:4732', '.city-tabs')
  for (const [index, tab] of children('144:4732').entries()) {
    for (const n of descendants(tab.id)) bind(n.id, `.city-tabs>button:nth-child(${index + 1})`)
  }
  bind('144:4748', '.hospital-grid')
  const cards = children('144:4748').map((card, index) => {
    const selector = `.hospital-grid>article:nth-child(${index + 1})`
    bind(card.id, selector)
    const [imageStage, body] = children(card.id)
    bind(imageStage.id, `${selector}>.hospital-image`)
    const photo = descendants(imageStage.id).find(n => images.has(n.id))
    for (const n of descendants(imageStage.id)) {
      if (n.id === imageStage.id) continue
      if (descendants(n.id).some(c => c.id === photo.id)) bind(n.id, `${selector} .hospital-photo`, 'Figma image crop wrapper')
    }
    bind(photo.id, `${selector} .hospital-photo>img`, 'Original Figma photo')
    const badges = descendants(imageStage.id).filter(n => n.type === 'TEXT').map(n => {
      const badge = nodes.get(n.parentNodeId)
      const name = text(n.id)
      const kind = name === '北京' ? 'location' : name === 'JCI' ? 'jci' : 'type'
      bind(badge.id, `${selector} .hospital-badge--${kind}`)
      bind(n.id, `${selector} .hospital-badge--${kind}>.badge-label`)
      const icon = children(badge.id).find(n => vectors.has(n.id))
      if (icon) bind(icon.id, `${selector} .hospital-badge--${kind}>img`, 'Figma SVG asset')
      const pos = values.get(badge.id).framePosition
      const origin = values.get(imageStage.id).framePosition
      return { nodeId: badge.id, label: name, kind, icon: icon ? vectors.get(icon.id) : null, x:pos.x-origin.x, y:pos.y-origin.y, width:p(badge.id).size.x, height:p(badge.id).size.y, css:copied.get(badge.id).css.filter(s => !s.startsWith('<svg')).join(''), textCss:copied.get(n.id).css.join('') }
    })
    // JCI/type share an authored horizontal wrapper on the first card.
    for (const n of children(imageStage.id)) if (!targets.has(n.id)) bind(n.id, `${selector} .hospital-image`, 'Badge row consolidated; child coordinates retained')
    bind(body.id, `${selector}>.hospital-body`)
    const [heading, tags, facts, actions] = children(body.id)
    bind(heading.id, `${selector} h2`)
    const title = children(heading.id)[0]
    bind(title.id, `${selector} h2`)
    bind(tags.id, `${selector} .specialties`)
    const specialties = children(tags.id).map((tag,index) => {
      bind(tag.id, `${selector} .specialties>span:nth-child(${index+1})`)
      const label = children(tag.id)[0]
      bind(label.id, `${selector} .specialties>span:nth-child(${index+1})>.specialty-label`)
      return { nodeId:tag.id, label:text(label.id), radius:p(tag.id).rectangleTopLeftCornerRadius }
    })
    bind(facts.id, `${selector} .hospital-facts`)
    const metadata = children(facts.id).map((fact,index) => {
      bind(fact.id, `${selector} .hospital-facts>span:nth-child(${index+1})`)
      const [icon,label] = children(fact.id)
      bind(icon.id, `${selector} .hospital-facts>span:nth-child(${index+1})>img`, 'Figma SVG asset')
      bind(label.id, `${selector} .hospital-facts>span:nth-child(${index+1})>.fact-label`)
      return { nodeId:fact.id, label:text(label.id), icon:vectors.get(icon.id), width:p(fact.id).size.x }
    })
    bind(actions.id, `${selector} .hospital-actions`)
    const buttons=children(actions.id).map((button,index)=>{
      bind(button.id, `${selector} .hospital-actions>button:nth-child(${index+1})`)
      const label=children(button.id)[0]
      bind(label.id, `${selector} .hospital-actions>button:nth-child(${index+1})>.button-label`)
      return { nodeId:button.id, label:text(label.id), width:p(button.id).size.x }
    })
    const pos=values.get(photo.id).framePosition, origin=values.get(imageStage.id).framePosition
    return {nodeId:card.id,index,hospitalId:index+1,gridColumn:Math.round(p(card.id).transform.m02/(p(card.id).size.x+24))+1,gridRow:Math.round((p(card.id).transform.m12-48)/(398+24))+1,name:text(title.id),titleNodeId:title.id,titleFont:p(title.id).fontName,titleWeight:p(title.id).derivedTextData?.fontMetaData?.[0]?.fontWeight ?? ({Semibold:600,Bold:700}[p(title.id).fontName.style]),specialties,metadata,buttons,badges,photo:{nodeId:photo.id,src:images.get(photo.id).src,x:pos.x-origin.x,y:pos.y-origin.y,width:p(photo.id).size.x,height:p(photo.id).size.y,paint:images.get(photo.id).paint}}
  })
  // Map the page-specific shell instances to their already implemented semantic counterparts.
  const whyMap=JSON.parse(fs.readFileSync(path.join(root,'docs/figma-source/why-china/node-to-code-2026-09-29.json')))
  for(const n of whyMap.nodes) {
    const [session,local]=n.id.split(':').map(Number)
    const id=session===143&&local>=1958&&local<=2034 ? `144:${local+3196}` : session===484&&local>=1420&&local<=1461 ? `484:${local+129}` : null
    if(id&&nodes.has(id)) bind(id,n.selector,n.mode)
  }
  const mapped=inventory.nodes.map(node=>{
    let ancestor=node
    while(ancestor&&!targets.has(ancestor.id))ancestor=nodes.get(ancestor.parentNodeId)
    if(!ancestor||(['144:4707','144:4708','144:4709'].includes(ancestor.id)&&node.id!==ancestor.id))throw new Error(`Unmapped node ${node.id}`)
    const target=targets.get(ancestor.id)
    return {...node,...target,parametersNodeId:node.id,devModeNodeId:node.id,implementation:node.id===ancestor.id?target.mode:`${node.type==='VECTOR'?'Exported vector primitive':'Consolidated layout/text'} in ${target.selector}`,framePosition:values.get(node.id).framePosition}
  })
  save('assets.json',{sourceFrame:inventory.sourceFrame,assets})
  save('card-data-2026-09-29.json',cards)
  save('node-to-code-2026-09-29.json',{sourceFrame:inventory.sourceFrame,nodes:mapped})
  const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  function renderBaseline(node, suppressed = false) {
    const value=p(node.id)
    const ownSvg=vectors.get(node.id)
    let css=copied.get(node.id).css.filter(s=>!s.startsWith('<svg')).join('')
    if(images.has(node.id)) css=css.replaceAll('<path-to-image>', images.get(node.id).src)
    css+=`;position:${node.id===inventory.sourceFrame?'relative':'absolute'};left:${node.id===inventory.sourceFrame?0:value.transform.m02}px;top:${node.id===inventory.sourceFrame?0:value.transform.m12}px;width:${value.size.x}px;height:${value.size.y}px;box-sizing:border-box;letter-spacing:0;`
    if(value.type==='TEXT')css+=`white-space:${value.size.y>(value.lineHeight?.value??value.fontSize)*1.5?'pre-wrap':'pre'};`
    if(value.frameMaskDisabled===false)css+='overflow:hidden;'
    if(suppressed)css+='visibility:hidden;'
    const content=ownSvg?`<img src="${ownSvg}" alt="" style="position:absolute;inset:0;width:100%;height:100%">`:escape(text(node.id)??'')
    return `<div data-figma-node="${node.id}" data-layer-name="${escape(node.name)}" style="${escape(css)}">${content}${children(node.id).map(child=>renderBaseline(child,suppressed||!!ownSvg)).join('')}</div>`
  }
  fs.writeFileSync(path.join(dir,'source-frame-2026-09-29.html'),`<!doctype html><meta charset="utf-8"><title>144:4707 Figma static baseline</title><base href="http://127.0.0.1:5173/"><style>html,body{margin:0}*{box-sizing:border-box}</style>${renderBaseline(nodes.get(inventory.sourceFrame))}\n`)
  fs.writeFileSync(path.join(dir,'dev-styles-2026-09-29.css'),dev.nodes.map(n=>`/* ${n.nodeId} ${n.layerName} */\n[data-figma-node="${n.nodeId}"] { ${n.css.filter(s=>!s.startsWith('<svg')).join('\n')} }`).join('\n\n')+'\n')
  const files=['layers-2026-09-29.json','dev-mode-2026-09-29.json','native-inventory-2026-09-29.json','native-parameters-2026-09-29.json','native-image-paints-2026-09-29.json','node-to-code-2026-09-29.json','card-data-2026-09-29.json','dev-styles-2026-09-29.css','source-frame-2026-09-29.html','assets.json']
  save('baseline-lock-2026-09-29.json',{sourceFrame:inventory.sourceFrame,sourceSHA256:inventory.sourceSHA256,phase:'all Layers, Dev CSS, native paints, semantic mapping and original assets extracted before Vue changes',nodeCount:mapped.length,files:files.map(name=>({name,sha256:createHash('sha256').update(fs.readFileSync(path.join(dir,name))).digest('hex')}))})
  console.log(JSON.stringify({nodes:mapped.length,devCopies:dev.nodes.length,assets:assets.length,cards:cards.map(c=>({id:c.nodeId,name:c.name,font:c.titleFont,weight:c.titleWeight}))},null,2))
}
main().catch(e=>{console.error(e);process.exitCode=1})
