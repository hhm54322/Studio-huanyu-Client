const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const sharp = require('sharp')
const UZIP = require('../../tmp/figma-change-audit/node_modules/uzip')

// Mechanical conversion of the inspected nodes, not screenshot measurements.
const root = path.resolve(__dirname, '..')
const source = path.join(root, 'docs/figma-source/home')
const date = '2026-10-19'
const desktopChartsOnly = process.argv.includes('--desktop-charts-only')
const read = name => JSON.parse(fs.readFileSync(path.join(source, name)))
const save = (name, value) => fs.writeFileSync(path.join(source, name), JSON.stringify(value, null, 2) + '\n')
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const assetDir = path.join(root, 'public/images/figma/home-revision')
const assetUrl = name => `/images/figma/home-revision/${name}`
const esc = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const px = n => Number((n || 0).toFixed(5)) + 'px'
const sets = ['', '-mobile'].map(suffix => ({
  suffix,
  directory:source,
  layers: read(`ui-layers${suffix}-${date}.json`),
  dev: read(`dev-mode${suffix}-${date}.json`),
  inventory: read(`native-inventory${suffix}-${date}.json`),
  parameters: read(`native-parameters${suffix}-${date}.json`),
  paints: read(`native-image-paints${suffix}-${date}.json`),
}))
for (const folder of ['journey-states','strength-02','strength-03','hero-01','hero-02','hero-03','story-02','story-03','why-01','why-02','why-03','why-04','why-05','why-06','why-mobile-01','why-mobile-02','why-mobile-03','why-mobile-04','why-mobile-05','why-mobile-06','story-mobile','navigation-mobile','navigation-mobile-language']) {
  const directory=path.join(source,folder)
  const from=name=>JSON.parse(fs.readFileSync(path.join(directory,`${name}-${date}.json`)))
  sets.push({suffix:'',directory,supplement:true,layers:from('ui-layers'),dev:from('dev-mode'),inventory:from('native-inventory'),parameters:from('native-parameters'),paints:from('native-image-paints')})
}
for(const folder of fs.readdirSync(path.join(source,'experts')).sort()) {
  const directory=path.join(source,'experts',folder)
  if(!fs.statSync(directory).isDirectory()) continue
  const from=name=>JSON.parse(fs.readFileSync(path.join(directory,`${name}-${date}.json`)))
  sets.push({suffix:'',directory,supplement:true,expert:folder,layers:from('ui-layers'),dev:from('dev-mode'),inventory:from('native-inventory'),parameters:from('native-parameters'),paints:from('native-image-paints')})
}
const sourceArchives = new Map()
function archiveFor(inventory) {
  if (sourceArchives.has(inventory.sourceSHA256)) return sourceArchives.get(inventory.sourceSHA256)
  const file = fs.readFileSync(inventory.sourceFile)
  if (digest(file) !== inventory.sourceSHA256) throw Error(`Native document changed: ${inventory.sourceFile}; re-export and recheck Layers`)
  const archive = UZIP.parse(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength))
  sourceArchives.set(inventory.sourceSHA256,archive)
  return archive
}
const assets = [], exportedImages = new Map()
const selectedImageExports=read(`selected-image-exports-${date}.json`).exports
const liveCorrections=read('live-corrections-2026-10-20.json').nodes

async function build(set) {
  const { suffix, inventory, parameters, layers, dev, paints } = set
  const archive = archiveFor(inventory)
  const saveSet=(name,value)=>fs.writeFileSync(path.join(set.directory,name),JSON.stringify(value,null,2)+'\n')
  const native = new Map(inventory.nodes.map(n => [n.id, n]))
  const params = new Map(parameters.nodes.map(n => [n.nodeId, n.parameters]))
  const values = new Map(parameters.nodes.map(n => [n.nodeId, n]))
  const copied = new Map(dev.nodes.map(n => [n.nodeId, n]))
  const ui = layers.nodes
  const stack = []
  const tree = new Map()
  for (const n of ui) {
    while (stack.length > n.level) stack.pop()
    tree.set(n.nodeId, { ...n, parentNodeId: stack.at(-1)?.nodeId || null })
    stack.push(n)
  }
  const mismatches = []
  for (const n of inventory.nodes) {
    const actual = tree.get(n.id)
    if (!actual || actual.name !== n.name || actual.level !== n.level || actual.parentNodeId !== n.parentNodeId) mismatches.push(n.id)
  }
  const extras = ui.filter(n => !native.has(n.nodeId))
  const isDeviceChrome = node => {
    if(node.nodeId.startsWith('1690:') || node.nodeId.startsWith('1791:')) return true
    for(let current=node;current;current=tree.get(current.parentNodeId)) if(current.name==='Navigation/Notification Area') return true
    return false
  }
  if (mismatches.length || extras.some(n => !isDeviceChrome(n))) throw Error(`Layers/native mismatch ${JSON.stringify({ mismatches, extras })}`)
  const websiteRoot = suffix ? '1528:116' : inventory.sourceFrame
  const chartRoots = set.supplement ? new Map() : suffix ? new Map([['1528:437', 'radar'], ['1528:491', 'cost']]) : new Map([['1412:6103', 'radar'], ['1412:6176', 'cost']])
  const walk = id => [native.get(id), ...(native.get(id)?.children || []).flatMap(walk)]
  const website = new Set(walk(websiteRoot).map(n => n.id))
  const chartOwners = new Map()
  for (const [id] of chartRoots) {
    if (!native.has(id)) throw Error(`Missing chart root ${id}`)
    for (const n of walk(id)) chartOwners.set(n.id, id)
  }
  const colorCss = paint => {
    const c = paint?.color
    if (!c) return 'transparent'
    const rgb = [c.r,c.g,c.b].map(v => Math.round(v * 255))
    const a = (c.a ?? 1) * (paint.opacity ?? 1)
    return a === 1 ? `#${rgb.map(v => v.toString(16).padStart(2,'0')).join('')}` : `rgba(${rgb.join(',')},${a})`
  }
  const charts = {}
  for (const [id, type] of chartRoots) {
    const owner = values.get(id)
    const nodes = walk(id).map(n => values.get(n.id))
    const relative = n => ({ x:n.framePosition.x-owner.framePosition.x, y:n.framePosition.y-owner.framePosition.y })
    // Flattening chart geometry must preserve opacity/visibility inherited from
    // every source ancestor. The owner itself is already styled by Vue DOM.
    const effectiveOpacity = nodeId => {
      let opacity = 1
      for (let current = nodeId; current && current !== id; current = native.get(current).parentNodeId) {
        const p = params.get(current)
        opacity *= p.visible === false ? 0 : (p.opacity ?? 1)
      }
      return opacity
    }
    const texts = nodes.filter(n=>n.parameters.type==='TEXT').map(n=>{
      const p=n.parameters
      return { nodeId:n.nodeId, opacity:effectiveOpacity(n.nodeId), ...relative(n), width:p.size.x, height:p.size.y,
        text:p.textData.characters, fontFamily:p.fontName.family, fontSize:p.fontSize,
        lineHeight:p.lineHeight?.units==='PIXELS'?p.lineHeight.value:p.size.y,
        fill:colorCss(p.fillPaints?.find(paint=>paint.visible!==false)),
        rotation:-Math.atan2(p.transform?.m10||0,p.transform?.m00??1) }
    })
    charts[type]={nodeId:id,width:owner.parameters.size.x,height:owner.parameters.size.y,texts}
    if(type==='radar') {
      const axis=values.get(suffix?'1528:441':'1412:6107')
      charts[type].center=[relative(axis).x,relative(axis).y+axis.parameters.size.y]
      charts[type].radius=axis.parameters.size.y
    } else {
      const grid=values.get(suffix?'1528:493':'1412:6178')
      charts[type].grid={...relative(grid),width:grid.parameters.size.x,height:grid.parameters.size.y}
      charts[type].barWidth=suffix?7.906727313995361:13
      charts[type].barGap='30.76923077%'
      charts[type].lines=nodes.filter(n=>n.parameters.type==='VECTOR'&&(n.parameters.size.x===0||n.parameters.size.y===0)&&n.parameters.strokePaints?.length).map(n=>({
        nodeId:n.nodeId,opacity:effectiveOpacity(n.nodeId),...relative(n),width:n.parameters.size.x,height:n.parameters.size.y,
        stroke:colorCss(n.parameters.strokePaints.find(p=>p.visible!==false)),lineWidth:n.parameters.strokeWeight,lineDash:n.parameters.dashPattern||[]
      }))
    }
    charts[type].legendSymbols=nodes.filter(n=>n.parameters.type==='VECTOR'&&Math.abs(n.parameters.size.x-14)<0.01&&Math.abs(n.parameters.size.y-10.5)<0.01).map(n=>({nodeId:n.nodeId,opacity:effectiveOpacity(n.nodeId),...relative(n),width:n.parameters.size.x,height:n.parameters.size.y,fill:colorCss(n.parameters.fillPaints?.[0])}))
  }
  if(!set.supplement) saveSet(`chart-spec${suffix}-${date}.json`,charts)
  if (desktopChartsOnly) return
  const svgOwners = new Map(), svgs = new Map(), images = new Map(), masks = new Map()
  for (const n of inventory.nodes) {
    if (!website.has(n.id) || !n.rendered || chartOwners.has(n.id) || svgOwners.has(n.id)) continue
    const d = copied.get(n.id)
    if (!d?.implemented || !d.code.length) throw Error(`Missing Dev Mode copy ${n.id}`)
    const svg = d.code.find(c => c.trim().startsWith('<svg'))
    if (svg) {
      if (!svg.trim().endsWith('</svg>') || svg.includes('[Truncated]')) throw Error(`Incomplete selected SVG ${n.id}`)
      const filename = `node-${n.id.replace(':', '-')}.svg`
      fs.writeFileSync(path.join(assetDir, filename), svg + '\n')
      svgs.set(n.id, assetUrl(filename))
      walk(n.id).forEach(child => svgOwners.set(child.id, n.id))
      assets.push({ nodeId: n.id, name: n.name, projectPath: '/public' + assetUrl(filename), source: 'Selected Figma Dev Mode SVG', sha256: digest(svg) })
    }
  }
  for (const asset of paints.assets.filter(a => a.rendered && website.has(a.nodeId))) {
    const selected=selectedImageExports.find(item=>item.nodeId===asset.nodeId)
    if(selected) {
      const original=fs.readFileSync(selected.downloadPath)
      if(digest(original)!==selected.downloadSHA256) throw Error(`Selected image export changed: ${asset.nodeId}`)
      const destination=path.join(root,selected.projectPath.slice(1))
      await sharp(original).resize({width:selected.outputWidth,withoutEnlargement:true}).webp({quality:90,effort:5,alphaQuality:100}).toFile(destination)
      images.set(asset.nodeId,selected.projectPath.replace('/public',''))
      assets.push({...selected,sha256:digest(fs.readFileSync(destination)),imageHash:asset.imageHash,source:'Selected Figma image-node PNG with native paint adjustment, compressed without CSS approximation'})
      continue
    }
    const paintOpacity = asset.paint.opacity ?? 1
    const paintKey = `${asset.imageHash}:${paintOpacity}`
    if (!exportedImages.has(paintKey)) {
      const image = archive[`images/${asset.imageHash}`]
      if (!image || digest(image) !== asset.sha256) throw Error(`Missing image ${asset.nodeId}`)
      const filename = `image-${asset.imageHash}${paintOpacity < 1 ? `-alpha-${Math.round(paintOpacity * 100)}` : ''}.webp`
      const pipeline = sharp(Buffer.from(image)).rotate().resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      if (paintOpacity < 1) {
        // Dev Mode background shorthand omits individual image-fill opacity.
        // Apply the exact native paint alpha to that image only, leaving the
        // same node's gradient/border/text unchanged.
        const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
        for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * paintOpacity)
        await sharp(data, { raw: info }).webp({ quality: 90, effort: 5, alphaQuality: 100 }).toFile(path.join(assetDir, filename))
      } else await pipeline.webp({ quality: 90, effort: 5, alphaQuality: 100 }).toFile(path.join(assetDir, filename))
      exportedImages.set(paintKey, assetUrl(filename))
    }
    images.set(asset.nodeId, exportedImages.get(paintKey))
    assets.push({ nodeId: asset.nodeId, imageHash: asset.imageHash, paintOpacity, originalSHA256: asset.sha256, projectPath: '/public' + exportedImages.get(paintKey), source: 'Original Figma image; WebP quality 90; 2048px cap; exact native image-fill alpha; Dev Mode crop retained' })
  }
  for (const n of inventory.nodes.filter(n=>params.get(n.id).mask)) {
    const p=params.get(n.id)
    if(!p.fillGeometry?.length) continue
    // A Figma mask itself cannot be exported in Dev Mode. When the file has
    // an exported copy of the SAME native geometry, use its exact paths.
    const same=inventory.nodes.find(other=>other.id!==n.id && JSON.stringify(params.get(other.id).fillGeometry)===JSON.stringify(p.fillGeometry) && svgs.has(other.id))
    if(!same) continue
    const code=copied.get(same.id).code.find(c=>c.trim().startsWith('<svg')).replace(/\sopacity="[^"]*"/g,'')
    const filename=`mask-${n.id.replace(':','-')}.svg`
    fs.writeFileSync(path.join(assetDir,filename),code+'\n')
    masks.set(n.id,assetUrl(filename))
    assets.push({nodeId:n.id,geometrySourceNodeId:same.id,commands:p.fillGeometry,projectPath:'/public'+assetUrl(filename),source:'Identical native Figma fillGeometry; exact Dev Mode paths; mask opacity normalized',sha256:digest(code)})
  }
  function maskStyle(id) {
    const mask=native.get(id).children.find(child=>params.get(child).mask && masks.has(child))
    return mask?`mask-image:url("${masks.get(mask)}");mask-size:100% 100%;mask-repeat:no-repeat;`:''
  }
  function outsideStrokeStyle(id) {
    const p=params.get(id)
    if(p.fillPaints?.some(paint=>paint.visible!==false)) return ''
    const protrudes=native.get(id).children.some(child=>{
      const c=params.get(child),at=origin(c,p)
      if(c.strokeAlign!=='OUTSIDE'||!visibleStroke(c)) return false
      const weight=c.strokeWeight||0
      return at.x-weight<0||at.y-weight<0||at.x+c.size.x+weight>p.size.x||at.y+c.size.y+weight>p.size.y
    })
    // Native Figma outside strokes remain visible around these empty grouping
    // frames. CSS overflow:hidden would crop the authored 20px circular ring.
    return protrudes?'overflow:visible;':''
  }

  const styles = new Map()
  // Source variables belong to the Figma library, not this app's Tailwind palette.
  const sourceFont = family => family==='SF Pro'?'"SF Pro",-apple-system,BlinkMacSystemFont,sans-serif':`"${family}"`
  function resolveSourceVariables(css) {
    // Figma also emits fallbacks containing functions (gradients, rgba, etc.).
    // A flat regexp leaves those library variables unresolved in the app.
    const variable = /var\(--[\w-]*\s*,\s*/g
    let match
    while ((match = variable.exec(css))) {
      let depth = 1, end = variable.lastIndex
      for (; end < css.length && depth; end++) {
        if (css[end] === '(') depth++
        else if (css[end] === ')') depth--
      }
      if (depth) break
      const fallback = resolveSourceVariables(css.slice(variable.lastIndex, end - 1))
      css = css.slice(0, match.index) + fallback + css.slice(end)
      variable.lastIndex = match.index + fallback.length
    }
    return css.replace(/font-family:\s*"SF Pro";/g,`font-family:${sourceFont('SF Pro')};`)
  }
  const visibleStroke = p => p?.strokePaints?.some(paint => paint.visible !== false && (paint.opacity ?? 1) > 0)
  function borderBoxCss(css, p) {
    // Figma OUTSIDE strokes do not consume the node's authored dimensions.
    // A CSS border does; use an outline rather than moving/shrinking children.
    if (visibleStroke(p) && p.strokeAlign === 'OUTSIDE') {
      css = css.replace(/(^|\n)border:\s*([^;]+);/g, '$1outline:$2;outline-offset:0;border:0;')
    }
    const gradient=p.strokePaints?.find(paint=>paint.visible!==false&&paint.type==='GRADIENT_LINEAR')
    if(gradient&&p.dashPattern?.length===2&&p.size.y===2*p.strokeWeight) {
      // Dev Mode omits a gradient dashed border from its CSS shorthand.
      // Preserve the original fill, alpha stops, 16/16 dash pattern and node
      // transform with a CSS mask; these are native properties, not PNG guesses.
      const stops=gradient.stops.map(stop=>`${colorCss({color:stop.color,opacity:gradient.opacity})} ${stop.position*100}%`).join(',')
      css+=`\nborder:0;background:linear-gradient(90deg,${stops});mask-image:repeating-linear-gradient(90deg,#000 0 ${px(p.dashPattern[0])},transparent ${px(p.dashPattern[0])} ${px(p.dashPattern[0]+p.dashPattern[1])});`
    }
    return css
  }
  function origin(p, parent) {
    const inside = visibleStroke(parent) && parent.strokeAlign === 'INSIDE'
    const separate=parent&&['borderLeftWeight','borderRightWeight','borderTopWeight','borderBottomWeight'].some(key=>parent[key]!==undefined)
    return {
      x: (p.transform?.m02 || 0) - (inside ? separate?parent.borderLeftWeight||0:parent.strokeWeight||0 : 0),
      y: (p.transform?.m12 || 0) - (inside ? separate?parent.borderTopWeight||0:parent.strokeWeight||0 : 0),
    }
  }
  function layoutStyle(id, top = false) {
    const n = native.get(id), p = params.get(id), d = copied.get(id)
    const parent = params.get(n.parentNodeId)
    let css = resolveSourceVariables((d?.code.filter(c => !c.startsWith('<svg')) || []).join('\n')).replaceAll('<path-to-image>', images.get(id) || '').replaceAll(/\s+lightgray(?=\s)/g, '')
    css = borderBoxCss(css, p)
    css += selectedImageExports.find(item=>item.nodeId===id)?.css || ''
    css += textBaseCss(id)
    css += '\nbox-sizing:border-box;margin:0;min-width:0;flex-shrink:0;'
    const absolute = !top && (p.stackPositioning === 'ABSOLUTE' || !parent?.stackMode)
    css += `position:${absolute ? 'absolute' : 'relative'};`
    const at = origin(p, parent)
    if (absolute) css += `left:${px(at.x)};top:${px(at.y)};right:auto;bottom:auto;width:${px(p.size.x)};height:${px(p.size.y)};`
    else {
      if (top || p.stackChildAlignSelf === 'STRETCH' && parent?.stackMode === 'VERTICAL') css += 'width:100%;'
      else if (!/(^|;)\s*width:/.test(css)) css += `width:${px(p.size.x)};`
      if (!p.stackMode || !n.children.length || n.children.every(c => params.get(c)?.stackPositioning === 'ABSOLUTE')) css += `height:${px(p.size.y)};`
    }
    const t = p.transform || {}
    if (absolute && [t.m00 ?? 1, t.m01 || 0, t.m10 || 0, t.m11 ?? 1].some((v, i) => Math.abs(v - [1, 0, 0, 1][i]) > 0.00001)) {
      css += `transform-origin:0 0;transform:matrix(${t.m00},${t.m10},${t.m01},${t.m11},0,0);`
    }
    if (p.type === 'TEXT') css += `white-space:${(p.derivedTextData?.baselines?.length || 1) > 1 ? 'pre-wrap' : 'pre'};`
    if (chartRoots.has(id)) css += `height:${px(p.size.y)};`
    const mask = n.children.map(c => params.get(c)).find(c => c?.mask)
    if (p.frameMaskDisabled === false || mask) css += 'overflow:hidden;'
    if (mask?.cornerRadius) css += `border-radius:${px(mask.cornerRadius)};`
    if (p.opacity !== undefined && p.opacity !== 1) css += `opacity:${p.opacity};`
    if (!n.rendered || p.mask) css += 'display:none;'
    css += maskStyle(id)
    css += outsideStrokeStyle(id)
    css = exportedSvgStyle(id, css, absolute)
    const live=liveCorrections.find(item=>item.nodeId===id)
    if(live&&!live.staticOnly) css+=live.css
    return css
  }
  function exportedSvgStyle(id, css, positioned = true) {
    if (!svgs.has(id)) return css
    const p = params.get(id), t = p.transform || {}
    const at = origin(p, params.get(native.get(id).parentNodeId))
    // Dev Mode exports SVG paths in their transformed orientation and already
    // includes layer opacity. Applying either again reverses arrows or fades
    // a mask twice. Place its transformed bounding box in the original parent.
    const corners = [[0,0],[p.size.x,0],[0,p.size.y],[p.size.x,p.size.y]].map(([x,y]) => ({
      x:(t.m00??1)*x+(t.m01||0)*y, y:(t.m10||0)*x+(t.m11??1)*y,
    }))
    const left=Math.min(...corners.map(c=>c.x)), right=Math.max(...corners.map(c=>c.x))
    const top=Math.min(...corners.map(c=>c.y)), bottom=Math.max(...corners.map(c=>c.y))
    return css+`background:none;opacity:1;transform:none;width:${px(right-left)};height:${px(bottom-top)};${positioned?`left:${px(at.x+left)};top:${px(at.y+top)};`:''}`
  }
  function textRuns(id) {
    const p=params.get(id), text=p.textData
    if (!text?.styleOverrideTable?.length) return undefined
    const table=new Map(text.styleOverrideTable.map(s=>[s.styleID,s])), runs=[]
    for(let i=0;i<text.characters.length;i++) {
      const styleId=text.characterStyleIDs[i]||0
      if(runs.at(-1)?.styleId===styleId) runs.at(-1).text+=text.characters[i]
      else runs.push({styleId,text:text.characters[i]})
    }
    return runs.map(run=>{
      const p=table.get(run.styleId)||{}, css=[]
      if(p.fillPaints?.length) css.push(`color:${colorCss(p.fillPaints.find(p=>p.visible!==false))}`)
      if(p.fontSize) css.push(`font-size:${px(p.fontSize)}`)
      if(p.fontName) {
        css.push(`font-family:${sourceFont(p.fontName.family)}`)
        const weight={Thin:100,Ultralight:200,Light:300,Regular:400,Medium:500,Semibold:600,Bold:700,Heavy:800,Black:900}[p.fontName.style]
        if(!weight) throw Error(`Unmapped exact font style ${id}: ${p.fontName.style}`)
        css.push(`font-weight:${weight}`)
      }
      if(p.lineHeight?.units==='PIXELS') css.push(`line-height:${px(p.lineHeight.value)}`)
      if(p.lineHeight?.units==='PERCENT') css.push(`line-height:${p.lineHeight.value}%`)
      if(p.letterSpacing?.units==='PIXELS') css.push(`letter-spacing:${px(p.letterSpacing.value)}`)
      return {text:run.text,css:css.join(';')}
    })
  }
  function textBaseCss(id) {
    const p=params.get(id)
    if(p.type!=='TEXT'||!p.textData?.styleOverrideTable?.length) return ''
    const weight={Thin:100,Ultralight:200,Light:300,Regular:400,Medium:500,Semibold:600,Bold:700,Heavy:800,Black:900}[p.fontName.style]
    const align={LEFT:'left',CENTER:'center',RIGHT:'right',JUSTIFIED:'justify'}[p.textAlignHorizontal]||'left'
    const line=p.lineHeight?.units==='PIXELS'?px(p.lineHeight.value):p.lineHeight?.units==='PERCENT'?`${p.lineHeight.value}%`:'normal'
    return `color:${colorCss(p.fillPaints?.find(paint=>paint.visible!==false))};font-family:${sourceFont(p.fontName.family)};font-size:${px(p.fontSize)};font-weight:${weight};line-height:${line};text-align:${align};`
  }
  function textParagraphs(id) {
    const p=params.get(id)
    if(p.type!=='TEXT'||!p.textData.characters.includes('\n')) return undefined
    const table=new Map((p.textData.styleOverrideTable||[]).map(style=>[style.styleID,style]))
    const spacingAt=index=>table.get(p.textData.characterStyleIDs?.[index])?.paragraphSpacing??p.paragraphSpacing??0
    const runs=textRuns(id)||[{text:p.textData.characters,css:''}]
    const paragraphs=[{runs:[],start:0}]
    let offset=0
    for(const run of runs) {
      const parts=run.text.split('\n')
      parts.forEach((text,index)=>{
        if(index) {offset++;paragraphs.push({runs:[],start:offset})}
        if(text) paragraphs.at(-1).runs.push({text,css:run.css})
        offset+=text.length
      })
    }
    return paragraphs.map(({runs,start},index)=>({runs,css:`display:block;${index<paragraphs.length-1?`margin-bottom:${px(spacingAt(start))};`:''}`}))
  }
  function textLines(id) {
    const p=params.get(id),baselines=p.derivedTextData?.baselines
    if(p.type!=='TEXT'||!baselines||baselines.length<2) return undefined
    const text=p.textData.characters,runs=textRuns(id)||[{text,css:''}]
    const styles=[]
    for(const run of runs) for(let i=0;i<run.text.length;i++) styles.push(run.css)
    const positions=p.derivedTextData.logicalIndexToCharacterOffsetMap
    // Figma's native line breaks/justification are implementation data too.
    // Preserve them at authored dimensions; fluid layouts use paragraphs and
    // browser wrapping instead. No positions are measured from screenshots.
    return baselines.map(line=>{
      const start=line.firstCharacter,end=line.endCharacter
      const value=text.slice(start,end).replace(/\n$/,'')
      const placed=p.textAlignHorizontal==='JUSTIFIED'&&positions?.length>=start+value.length
      const lineRuns=[]
      let index=start
      for(const character of value) {
        const css=(styles[index]||'')+(placed?`;position:absolute;left:${px(positions[index]-line.position.x)};top:0;`:'')
        if(!placed&&lineRuns.at(-1)?.css===css) lineRuns.at(-1).text+=character
        else lineRuns.push({text:character,css})
        index+=character.length
      }
      return {runs:lineRuns,baseline:line.position.y-line.lineY,css:`display:block;position:absolute;left:${px(line.position.x)};top:${px(line.lineY)};width:${px(line.width)};height:${px(line.lineHeight)};line-height:${px(line.lineHeight)};white-space:pre;text-align:left;`}
    })
  }
  function style(id, top = false) {
    const n = native.get(id), p = params.get(id), d = copied.get(id)
    let css = (p.type === 'TEXT' ? d?.code.filter(c => !c.startsWith('<svg')).slice(0, p.textData?.styleOverrideTable?.length ? 1 : undefined) : d?.code.filter(c => !c.startsWith('<svg')))?.join('\n') || ''
    css = resolveSourceVariables(css).replaceAll('<path-to-image>', images.get(id) || '').replaceAll(/\s+lightgray(?=\s)/g, '')
    css = borderBoxCss(css, p)
    css += selectedImageExports.find(item=>item.nodeId===id)?.css || ''
    css += textBaseCss(id)
    const at = origin(p, params.get(n.parentNodeId))
    // Coordinates are the original node transforms, not measurements from PNG.
    css += `\nposition:${top ? 'relative' : 'absolute'};left:${top ? '0px' : px(at.x)};top:${top ? '0px' : px(at.y)};right:auto;bottom:auto;width:${px(p.size.x)};height:${px(p.size.y)};min-width:0;max-width:none;min-height:0;max-height:none;padding:0;margin:0;box-sizing:border-box;display:block;flex:none;`
    const t = p.transform || {}
    if ([t.m00 ?? 1, t.m01 || 0, t.m10 || 0, t.m11 ?? 1].some((v, i) => Math.abs(v - [1, 0, 0, 1][i]) > 0.00001)) {
      css += `transform-origin:0 0;transform:matrix(${t.m00},${t.m10},${t.m01},${t.m11},0,0);`
    } else css += 'transform:none;'
    if (p.type === 'TEXT') css += `white-space:${(p.derivedTextData?.baselines?.length || 1) > 1 ? 'pre-wrap' : 'pre'};overflow-wrap:normal;`
    const mask = (n.children || []).map(c => params.get(c)).find(c => c?.mask)
    if (p.frameMaskDisabled === false || mask) css += 'overflow:hidden;'
    if (mask?.cornerRadius) css += `border-radius:${px(mask.cornerRadius)};`
    if (p.opacity !== undefined && p.opacity !== 1) css += `opacity:${p.opacity};`
    if (!n.rendered || p.mask) css += 'display:none;'
    if (svgs.has(id)) css += `background-image:none;`
    css += maskStyle(id)
    css += outsideStrokeStyle(id)
    css = exportedSvgStyle(id, css)
    css+=liveCorrections.find(item=>item.nodeId===id)?.css||''
    styles.set(id, css)
    return css
  }

  function buildNode(id, top = false) {
    const n = native.get(id), p = params.get(id)
    const svgOwner = svgOwners.get(id)
    const chartOwner = chartOwners.get(id)
    return {
      id, name: n.name, type: n.type, width: liveCorrections.find(item=>item.nodeId===id)?.width??p.size.x, height: liveCorrections.find(item=>item.nodeId===id)?.height??p.size.y,
      x: p.transform?.m02 || 0, y: liveCorrections.find(item=>item.nodeId===id)?.y??p.transform?.m12??0,
      visible: n.rendered && !p.mask,
      css: style(id, top),
      layoutCss: layoutStyle(id, top),
      text: p.textData?.characters || '',
      ...(textRuns(id) ? {textRuns:textRuns(id)} : {}),
      ...(textParagraphs(id) ? {textParagraphs:textParagraphs(id)} : {}),
      ...(textLines(id) ? {textLines:textLines(id)} : {}),
      ...(svgs.has(id) ? { svg: svgs.get(id) } : {}),
      ...(chartRoots.has(id) ? { chart: chartRoots.get(id) } : {}),
      children: svgOwner || chartOwner ? [] : n.children.map(c => buildNode(c)),
    }
  }
  const data = buildNode(websiteRoot, true)
  const panel=set.expert?inventory.nodes.find(n=>n.name==='Frame 631'):null
  const panelNodes=new Set(panel?walk(panel.id).map(n=>n.id):[])
  const mapping = ui.map(n => {
    const runtimeShell=panel&&[websiteRoot,panel.parentNodeId].includes(n.nodeId)
    const expertDemonstration=panel&&!runtimeShell&&!panelNodes.has(n.nodeId)
    const rendered = native.get(n.nodeId)?.rendered && website.has(n.nodeId)&&!expertDemonstration
    let maskOwner
    for(let current=n.nodeId;current;current=native.get(current)?.parentNodeId) {
      if(params.get(current)?.mask) { maskOwner=native.get(current).parentNodeId;break }
    }
    const isMask = Boolean(maskOwner)
    const owner = maskOwner || svgOwners.get(n.nodeId) || chartOwners.get(n.nodeId) || n.nodeId
    const mode = expertDemonstration?'Figma demonstration background/device decoration; actual home page stays underneath the native dialog':runtimeShell?'Native dialog/backdrop ownership':!website.has(n.nodeId) ? 'Figma device chrome; deliberately not part of the website' : !rendered ? 'Figma hidden layer; not rendered' : isMask ? 'CSS clipping viewport ownership; mask is not painted' : chartOwners.has(n.nodeId) ? 'ECharts geometry/text/series ownership' : svgOwners.has(n.nodeId) ? 'Exact SVG ownership' : 'Vue DOM'
    const component = runtimeShell?'HomeExpertDialog.vue':['1412:5682','1412:5683','1528:116'].includes(n.nodeId) ? 'PatientLayout.vue' : n.nodeId==='1412:5684' ? 'HomeView.vue' : 'HomeSourceNode.vue'
    return { nodeId: n.nodeId, name: n.name, parentNodeId: tree.get(n.nodeId).parentNodeId, siblingOrder: native.get(n.nodeId)?.siblingOrder ?? n.siblingOrder, uiSiblingOrder: n.index, rendered: Boolean(rendered), mode, ownerNodeId: owner, component, selector: `[data-figma-node="${owner}"]`, parametersNodeId: native.has(n.nodeId) ? n.nodeId : null, devModeNodeId: native.has(n.nodeId) ? n.nodeId : null }
  })
  function html(n, isRoot = false) {
    if (!n.visible) return ''
    const media = n.svg ? `<img src="${n.svg}" alt="" style="width:100%;height:auto;display:block">` : n.chart ? `<div data-chart="${n.chart}" style="width:100%;height:100%"></div>` : n.textLines||n.textParagraphs ? (n.textLines||n.textParagraphs).map(p=>`<span style="${esc(p.css)}">${p.runs.map(run=>`<span style="${esc(run.css)}">${esc(run.text)}</span>`).join('')}</span>`).join('') : n.textRuns ? n.textRuns.map(run=>`<span style="${esc(run.css)}">${esc(run.text)}</span>`).join('') : esc(n.text)
    return `<div data-figma-node="${n.id}" style="${esc(n.css)}">${media}${n.children.map(c => html(c)).join('')}</div>`
  }
  saveSet(`source-tree${suffix}-${date}.json`, { sourceFrame: websiteRoot, sourceSHA256: inventory.sourceSHA256, root: data })
  saveSet(`node-to-code${suffix}-${date}.json`, { sourceFrame: websiteRoot, nodes: mapping })
  saveSet(`layers-crosscheck${suffix}-${date}.json`, { sourceFrame: websiteRoot, checkedAt: new Date().toISOString(), nativeNodes: inventory.nodes.length, uiNodes: ui.length, mismatch: mismatches, extraDeviceNodes: extras.map(n => n.nodeId), layersCrossCheck: true, renderedNodes: mapping.filter(n => n.rendered).length })
  fs.writeFileSync(path.join(set.directory, `baseline${suffix}-${date}.html`), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><base href="http://127.0.0.1:5174/"><link rel="stylesheet" href="/fonts/home-source-fonts.css"><title>Figma static baseline ${websiteRoot}</title><style>html,body{margin:0;background:#fff}*{box-sizing:border-box}body{font-family:'PingFang SC',sans-serif;-webkit-font-smoothing:antialiased}</style>${html(data)}</html>\n`)
  fs.writeFileSync(path.join(set.directory, `dev-styles${suffix}-${date}.css`), Array.from(styles, ([id, css]) => `[data-figma-node="${id}"]{${css}}`).join('\n') + '\n')
  if(panel) {
    const p=params.get(panel.id)
    const descendants=walk(panel.id)
    const tabs=descendants.filter(n=>n.type==='TEXT'&&/^(专业擅长|专业任职|科研成果|主要荣誉与科研|可提供的跨境医疗服务|跨境医疗服务)$/.test(params.get(n.id).textData?.characters||''))
    const model={name:set.expert,frame:websiteRoot,overlay:panel.parentNodeId,panel:panel.id,width:p.size.x,height:p.size.y,title:descendants.find(n=>params.get(n.id).textData?.characters==='专家介绍').id,close:descendants.find(n=>n.name==='Button').id,tabs:tabs.map(n=>({id:n.parentNodeId,text:params.get(n.id).textData.characters})),scrollContainers:descendants.filter(n=>['Section','Frame 716'].includes(n.name)).map(n=>n.id)}
    saveSet(`dialog-model-${date}.json`,model)
  }
  return { sourceFrame: websiteRoot, inventoryNodes: inventory.nodes.length, uiNodes: ui.length, renderedNodes: mapping.filter(n => n.rendered).length }
}

async function main() {
  if (desktopChartsOnly) {
    await build(sets[0])
    const lock = read(`baseline-lock-${date}.json`)
    const entry = lock.files.find(file => file.name === `chart-spec-${date}.json`)
    if (!entry) throw Error('Missing desktop chart source lock')
    const previousSHA256 = entry.sha256
    entry.sha256 = digest(fs.readFileSync(path.join(source, entry.name)))
    lock.desktopChartCorrection = { correctedAt:new Date().toISOString(), method:'Preserve exact native ancestor opacity and visibility when flattening chart primitives', previousSHA256, sha256:entry.sha256 }
    save(`baseline-lock-${date}.json`, lock)
    console.log(JSON.stringify(lock.desktopChartCorrection))
    return
  }
  fs.mkdirSync(assetDir, { recursive: true })
  const counts = []
  for (const set of sets) counts.push(await build(set))
  require('./build-home-expert-dialog-source.cjs')
  save(`assets-${date}.json`, { sourceSHA256: sets[0].inventory.sourceSHA256, assets })
  const files = sets.flatMap(({ suffix, directory, supplement }) => [`ui-layers${suffix}-${date}.json`, `dev-mode${suffix}-${date}.json`, `native-parameters${suffix}-${date}.json`, `source-tree${suffix}-${date}.json`, `node-to-code${suffix}-${date}.json`, `layers-crosscheck${suffix}-${date}.json`, ...(!supplement?[`chart-spec${suffix}-${date}.json`]:[]), `baseline${suffix}-${date}.html`, `dev-styles${suffix}-${date}.css`].map(file=>path.relative(source,path.join(directory,file))))
  files.push(...sets.filter(set=>set.expert).map(set=>path.relative(source,path.join(set.directory,`dialog-model-${date}.json`))))
  files.push(`experts/dialog-sources-${date}.json`)
  files.push(`assets-${date}.json`)
  files.push(`selected-image-exports-${date}.json`)
  files.push('live-corrections-2026-10-20.json')
  save(`baseline-lock-${date}.json`, { lockedAt: new Date().toISOString(), phase: 'Source hierarchy, node parameters, DOM mapping, images and static baseline; not visual approval', counts, files: files.map(name => ({ name, sha256: digest(fs.readFileSync(path.join(source, name))) })) })
  console.log(JSON.stringify({ counts, assets: assets.length, uniqueImages: exportedImages.size }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
