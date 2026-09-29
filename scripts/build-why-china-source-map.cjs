const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const root = path.resolve(__dirname, '..')
const dir = path.join(root, 'docs/figma-source/why-china')
const inventory = JSON.parse(fs.readFileSync(path.join(dir, 'native-inventory-2026-09-29.json')))
const parameters = JSON.parse(fs.readFileSync(path.join(dir, 'native-parameters-2026-09-29.json')))
const byId = new Map(inventory.nodes.map((node) => [node.id, node]))
const values = new Map(parameters.nodes.map((node) => [node.nodeId, node]))
const targets = new Map()
const bind = (id, selector, mode = 'DOM') => targets.set(id, { selector, mode, ownerNodeId: id })
const bindMany = (ids, selector) => ids.forEach((id) => bind(`143:${id}`, selector))
bindMany([1299,1300,1301], '.why-page')
bindMany([1302], '.why-hero')
bindMany([1303], '.why-hero>.hy-container')
bindMany([1304,1305], '.why-hero h1')
bindMany([1306,1307], '.why-hero p')
bindMany([1340], '.why-hero .hero-actions')
bindMany([1341], '.why-hero button')
bindMany([1344], '.why-hero button .button-label')
bindMany([1345], '.why-hero a')
bindMany([1352], '.why-hero a .button-label')
bindMany([1353], '.capability-section')
bindMany([1354], '.capability-layout')
bindMany([1355,1356], '.capability-layout aside')
bindMany([1357,1358], '.capability-layout aside h2')
bindMany([1359,1360], '.capability-layout aside p')
bindMany([1361], '.capability-grid')
const cards = [1362,1381,1394,1407,1421,1434,1447,1460]
cards.forEach((id, index) => {
  const selector = `.capability-grid article:nth-child(${index + 1})`
  bind(`143:${id}`, selector)
  const card = byId.get(`143:${id}`)
  for (const childId of card.children) {
    const child = byId.get(childId)
    if (child.name === 'Icon' || child.name === 'Frame') bind(childId, `${selector}>.capability-icon`, 'SVG asset')
    else {
      bind(childId, `${selector}>.capability-content`)
      for (const itemId of child.children) {
        const item = byId.get(itemId)
        if (item.name === 'Heading 3') bind(itemId, `${selector} h3`)
        else if (item.children.some((nodeId) => byId.get(nodeId).name === 'Icon')) {
          bind(itemId, `${selector} .capability-detail-row`)
          for (const rowId of item.children) bind(rowId, `${selector} .${byId.get(rowId).name === 'Icon' ? 'capability-chevron' : 'capability-detail-label'}`, byId.get(rowId).name === 'Icon' ? 'SVG asset' : 'DOM')
        } else if (itemId === '143:1378') bind(itemId, `${selector} .capability-expanded`)
        else bind(itemId, `${selector} .capability-copy`)
      }
    }
  }
})
bindMany([1473], '.cost-section')
bindMany([1474], '.cost-section .section-title')
bindMany([1475,1476], '.cost-section h2')
bindMany([1477,1478], '.cost-section .section-title p')
bindMany([1479], '.cost-section .comparison-content')
bindMany([1480,1481,1675], '.comparison-chart')
bind('143:1481', '.comparison-chart', 'ECharts axes/grid/series canvas')
bind('143:1675', '.comparison-chart', 'ECharts legend')
bindMany([1700,1701], '.saving-tags')
bindMany([1713], '.saving-tags::before')
bindMany([1714], '.saving-tags::after')
for (let index = 0; index < 5; index++) bindMany([1703 + index * 2, 1704 + index * 2], `.saving-tags span:nth-child(${index + 1})`)
bindMany([1750,1751], '.cost-actions')
bindMany([1752], '.cost-actions a:first-child')
bindMany([1753], '.cost-actions a:first-child .button-label')
bindMany([1759], '.cost-actions a:last-child')
bindMany([1760], '.cost-actions a:last-child .button-label')
bindMany([1764,1765], '.disclaimer')
bindMany([1766], '.wait-section')
bindMany([1767,1768], '.wait-section h2')
bindMany([1769,1770], '.wait-section .section-title p')
bindMany([1771,1772,1773], '.wait-grid')
for (let index = 0; index < 3; index++) {
  const start = 1774 + index * 3
  const selector = `.wait-grid article:nth-child(${index + 1})`
  bindMany([start], selector)
  bindMany([start + 1], `${selector}>strong`)
  bindMany([start + 2], `${selector}>p`)
}
bindMany([1784], '.wait-grid article.highlight')
bindMany([1785], '.wait-highlight-content')
bindMany([1786], '.wait-value')
bindMany([1787], '.wait-highlight-content>b')
bindMany([1788,1789], '.wait-grid article.highlight>p')
bindMany([1790], '.national-section')
bindMany([1791], '.national-section header')
bindMany([1792,1793], '.national-section h2')
bindMany([1794,1795], '.national-section header p')
bindMany([1796,1797], '.national-grid')
for (let index = 0; index < 4; index++) {
  const start = 1798 + index * 5
  const selector = `.national-grid>div:nth-child(${index + 1})`
  bindMany([start], selector)
  bindMany([start+1,start+2], `${selector}>strong`)
  bindMany([start+3,start+4], `${selector}>span`)
}
bindMany([1818,1819], '.national-section a')
bindMany([1820], '.national-section a .button-label')
bindMany([1824], '.stories-section')
bindMany([1825,1826,1827], '.stories-section>.hy-container')
bindMany([1828,1829], '.stories-section h2')
bindMany([1830,1831], '.stories-section .section-title p')
bindMany([1832,1833], '.story-grid')
for (let index = 0; index < 3; index++) {
  const start = 1834 + index * 13
  const selector = `.story-grid article:nth-child(${index + 1})`
  bindMany([start], selector)
  bindMany([start+1], `${selector}>img`)
  bindMany([start+2], `${selector}>.story-copy`)
  bindMany([start+3,start+4], `${selector} blockquote`)
  bindMany([start+5,start+6,start+7], `${selector} .story-meta`)
  bindMany([start+8,start+9], `${selector} .story-dash`)
  bindMany([start+10,start+11,start+12], `${selector} .story-meta-label`)
}
bindMany([1912], '.why-cta')
bindMany([1913,1914], '.why-cta>.hy-container')
bindMany([1915,1916], '.why-cta h2')
bindMany([1917,1918], '.why-cta p')
bindMany([1919], '.why-cta .cta-actions')
bindMany([1920], '.why-cta a')
bindMany([1921], '.why-cta a .button-label')
bindMany([1925], '.why-cta button')
bindMany([1926], '.why-cta button .button-label')
bindMany([1932], '.why-cta small')
for (let index = 0; index < 5; index++) {
  const start = 1933 + index * 5
  bindMany([start], `.why-cta small>span:nth-child(${index+1})`)
  bindMany([start+1], `.why-cta small>span:nth-child(${index+1}) img`)
  bindMany([start+4], `.why-cta small>span:nth-child(${index+1}) .feature-label`)
}
const assets = JSON.parse(fs.readFileSync(path.join(dir, 'assets.json')))
const assetTargets = [[1342,'.why-hero button img'],[1346,'.why-hero a img'],[1757,'.cost-actions a:first-child img'],[1761,'.cost-actions a:last-child img'],[1821,'.national-section a img'],[1922,'.why-cta a img'],[1927,'.why-cta button img']]
for (const [id, selector] of assetTargets) {
  bind(`143:${id}`, selector, 'SVG asset')
  const projectPath = `/public/images/figma/why-china-icons/node-143-${id}.svg`
  if (!assets.assets.some((asset) => asset.nodeId === `143:${id}`)) assets.assets.push({ nodeId: `143:${id}`, name: byId.get(`143:${id}`).name, projectPath })
}
// Shared shell instances have distinct source IDs but resolve to the same semantic elements.
const shell = [
  [1958,'.patient-footer'],[1959,'.patient-footer'],[1960,'.footer-top'],[1961,'.footer-intro'],[1962,'.footer-intro .brand-logo'],[1963,'.footer-intro .brand-mark'],[1964,'.footer-intro .brand-mark'],[1965,'.footer-intro .brand-logo-text'],[1966,'.footer-intro .brand-logo-text'],[1967,'.footer-intro p'],[1969,'.footer-intro small'],[1971,'.footer-column:nth-child(2)'],[1972,'.footer-column:nth-child(2) h3'],[1974,'.footer-column:nth-child(2)'],[1985,'.footer-column:nth-child(3)'],[1986,'.footer-column:nth-child(3) h3'],[1988,'.footer-column:nth-child(3)'],[1997,'.footer-contact'],[1998,'.footer-contact h3'],[2000,'.footer-contact'],[2001,'.footer-contact a:nth-of-type(1)'],[2002,'.footer-contact a:nth-of-type(1) img'],[2005,'.footer-contact a:nth-of-type(1)'],[2007,'.footer-contact a:nth-of-type(2)'],[2008,'.footer-contact a:nth-of-type(2) img'],[2010,'.footer-contact a:nth-of-type(2)'],[2012,'.footer-contact a:nth-of-type(3)'],[2013,'.footer-contact a:nth-of-type(3) img'],[2015,'.footer-contact a:nth-of-type(3)'],[2017,'.footer-service'],[2018,'.footer-service'],[2019,'.footer-service b'],[2021,'.footer-service i'],[2022,'.footer-service i'],[2024,'.footer-bottom'],[2025,'.footer-bottom-row'],[2026,'.footer-bottom-row>span'],[2028,'.footer-bottom-row>div'],[2029,'.footer-bottom button:first-child'],[2031,'.footer-separator'],[2033,'.footer-bottom button:last-child'],
]
for (const [id, selector] of shell) bind(`143:${id}`, selector)
for (let i=0;i<5;i++) bind(`143:${1975+i*2}`, `.footer-column:nth-child(2)>a:nth-of-type(${i+1})`)
for (let i=0;i<4;i++) bind(`143:${1989+i*2}`, `.footer-column:nth-child(3)>a:nth-of-type(${i+1})`)
for (const [id, selector] of [[1420,'.patient-header'],[1421,'.header-inner'],[1422,'.header-logo'],[1423,'.header-logo .brand-mark'],[1424,'.header-logo .brand-mark'],[1425,'.header-logo .brand-logo-text'],[1426,'.header-logo .brand-logo-text'],[1427,'.desktop-nav'],[1428,'.ask-aning'],[1429,'.ask-aning'],[1430,'.ask-aning img'],[1432,'.ask-aning'],[1452,'.header-actions'],[1453,'.language-button'],[1454,'.language-button img'],[1458,'.language-flag'],[1460,'.language-button b']]) bind(`484:${id}`, selector)
for(let i=0;i<9;i++) bind(`484:${1434+i*2}`, `.desktop-nav>a:nth-child(${i+1})`)
for (const [id, target] of targets) targets.set(id, { ...target, selector:target.selector.replaceAll('.brand-mark','.brand-logo__mark').replaceAll('.brand-logo-text','.brand-logo__copy strong') })
bind('143:1969', '.footer-intro>small')
bind('143:1713', '.saving-tags', 'CSS left fade mask')
bind('143:1714', '.saving-tags', 'CSS right fade mask')
const nodes = inventory.nodes.map((node) => {
  if (!node.rendered) return { ...node, selector:null, implementation:'Figma hidden branch excluded', sourceHiddenAncestor:node.hiddenBy, parametersNodeId:node.id }
  let ancestor = node
  while (ancestor && !targets.has(ancestor.id)) ancestor = byId.get(ancestor.parentNodeId)
  if (!ancestor) throw new Error(`No exact code mapping for ${node.id}`)
  const target = targets.get(ancestor.id)
  if (target.ownerNodeId === '143:1299' && node.id !== '143:1299') throw new Error(`Page-wide fallback is invalid: ${node.id}`)
  return { ...node, ...target, implementation: node.id === target.ownerNodeId ? target.mode : target.mode.includes('ECharts') ? `${target.mode}; primitive ${node.id}` : node.type === 'VECTOR' ? `Figma vector in ${target.selector}` : `Layout/text node consolidated into ${target.selector}`, parametersNodeId:node.id, framePosition:values.get(node.id).framePosition }
})
for (const node of nodes) if (!values.has(node.id)) throw new Error(`Missing native parameters ${node.id}`)
fs.writeFileSync(path.join(dir, 'node-to-code-2026-09-29.json'), JSON.stringify({sourceFrame:inventory.sourceFrame, nodes}, null, 2)+'\n')
fs.writeFileSync(path.join(dir, 'assets.json'), JSON.stringify(assets,null,2)+'\n')
const rgba = (color) => `rgba(${Math.round(color.r*255)}, ${Math.round(color.g*255)}, ${Math.round(color.b*255)}, ${color.a??1})`
const css = parameters.nodes.map(({nodeId,parameters:p}) => {
  const lines=[`width: ${p.size.x}px;`,`height: ${p.size.y}px;`,`opacity: ${p.opacity ?? 1};`]
  if (p.transform) lines.push(`--figma-local-x: ${p.transform.m02}px;`,`--figma-local-y: ${p.transform.m12}px;`)
  if(p.visible===false)lines.push('display: none;')
  else if(p.stackMode==='VERTICAL'||p.stackMode==='HORIZONTAL')lines.push('display: flex;',`flex-direction: ${p.stackMode==='VERTICAL'?'column':'row'};`)
  else if(p.stackMode==='GRID')lines.push('display: grid;',`row-gap: ${p.gridRowGap ?? 0}px;`,`column-gap: ${p.gridColumnGap ?? 0}px;`)
  if(p.stackSpacing!==undefined)lines.push(`gap: ${p.stackSpacing}px;`)
  if(p.stackHorizontalPadding!==undefined||p.stackVerticalPadding!==undefined)lines.push(`padding: ${p.stackVerticalPadding??0}px ${p.stackPaddingRight??p.stackHorizontalPadding??0}px ${p.stackPaddingBottom??p.stackVerticalPadding??0}px ${p.stackHorizontalPadding??0}px;`)
  const align={MIN:'flex-start',CENTER:'center',MAX:'flex-end',BASELINE:'baseline',SPACE_EVENLY:'space-between'}
  if(align[p.stackPrimaryAlignItems])lines.push(`justify-content: ${align[p.stackPrimaryAlignItems]};`)
  if(align[p.stackCounterAlignItems])lines.push(`align-items: ${align[p.stackCounterAlignItems]};`)
  if(p.fontSize!==undefined) {
    const meta=p.derivedTextData?.fontMetaData?.[0]
    const weight=meta?.fontWeight || {Regular:400,Medium:500,Semibold:600,Bold:700}[p.fontName?.style]
    if(!weight)throw new Error(`Missing font weight ${nodeId}`)
    lines.push(`font-family: ${JSON.stringify(p.fontName.family)};`,`font-size: ${p.fontSize}px;`,`font-weight: ${weight};`,'letter-spacing: 0;')
    if(p.lineHeight)lines.push(`line-height: ${p.lineHeight.units==='PIXELS'?`${p.lineHeight.value}px`:`${p.lineHeight.value}%`};`)
    if(p.textAlignHorizontal)lines.push(`text-align: ${p.textAlignHorizontal.toLowerCase()};`)
  }
  const solid=(p.fillPaints||[]).filter(p=>p.visible!==false&&p.type==='SOLID').at(-1)
  if(solid)lines.push(`${p.type==='TEXT'?'color':'background-color'}: ${rgba(solid.color)};`)
  const radius=p.cornerRadius??p.rectangleTopLeftCornerRadius
  if(radius!==undefined)lines.push(`border-radius: ${radius}px;`)
  const stroke=(p.strokePaints||[]).find(p=>p.visible!==false&&p.type==='SOLID')
  if(stroke)lines.push(`border: ${p.strokeWeight}px solid ${rgba(stroke.color)};`)
  for(const effect of p.effects||[])if(effect.visible!==false&&effect.type==='DROP_SHADOW')lines.push(`box-shadow: ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread??0}px ${rgba(effect.color)};`)
  return `/* ${nodeId} ${byId.get(nodeId).name}; raw gradients, rich-text runs, paint filters and constraints: native-parameters-2026-09-29.json */\n[data-figma-node="${nodeId}"] {\n  ${lines.join('\n  ')}\n}`
}).join('\n\n')
fs.writeFileSync(path.join(dir,'native-styles-2026-09-29.css'),css+'\n')
const files=['frame.html','native-styles-2026-09-29.css','native-inventory-2026-09-29.json','native-parameters-2026-09-29.json','native-image-paints-2026-09-29.json','node-to-code-2026-09-29.json','assets.json']
fs.writeFileSync(path.join(dir,'baseline-lock-2026-09-29.json'),JSON.stringify({sourceFrame:inventory.sourceFrame,sourceSHA256:inventory.sourceSHA256,phase:'source inventory, parameters and semantic mapping; static QA required',nodes:nodes.length,visible:nodes.filter(n=>n.rendered).length,files:files.map(name=>({name,sha256:createHash('sha256').update(fs.readFileSync(path.join(dir,name))).digest('hex')}))},null,2)+'\n')
console.log(`Mapped ${nodes.length} nodes (${nodes.filter(n=>n.rendered).length} visible, ${nodes.filter(n=>!n.rendered).length} hidden)`)
