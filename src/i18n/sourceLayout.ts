import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'

type Box = { x:number; y:number; width:number; height:number }
type Options = { texts?:Record<string,string>; styles?:Record<string,string>; hidden?:string[] }
const number = (css:string, property:string, fallback:number) => {
  const values = [...css.matchAll(new RegExp(`(?:^|;)\\s*${property}:\\s*(-?[\\d.]+)px(?=\\s*(?:;|$))`, 'g'))]
  return values.length ? Number(values[values.length-1]![1]) : fallback
}
const declarations = (css:string, property:string) => { const values=[...css.matchAll(new RegExp(`(?:^|;)\\s*${property}:\\s*([^;]+)`, 'g'))]; return values[values.length-1]?.[1]?.trim() }
let context:CanvasRenderingContext2D|null
const widths = new Map<string,number>()
function textWidth(text:string,font:string) {
  const key = `${font}\0${text}`
  if (widths.has(key)) return widths.get(key)!
  context ||= document.createElement('canvas').getContext('2d')
  if (!context) return text.length * 8
  context.font = font
  const width = context.measureText(text).width
  if (widths.size > 30000) widths.clear()
  widths.set(key,width)
  return width
}
export function clearSourceFontMeasurements() { widths.clear() }

/** Reflow translated text using the copied Auto Layout direction and original
 * gaps. Chinese uses its untouched source tree. No image dimensions are inferred
 * from translated copy, and no text is ellipsized or scaled to hide overflow. */
export function sourceLocaleLayout(root:HomeSourceNodeData, translate:(text:string)=>string, options:Options={}) {
  const result:Record<string,string> = {}, preferred=new Map<string,number>(), minimums=new Map<string,number>(), original=new Map<string,Box>()
  const anchors=new Map<string,{x:number;y:number}>()
  const parents=new Map<string,HomeSourceNodeData>()
  function index(node:HomeSourceNodeData) { for(const child of node.children) { parents.set(child.id,node); index(child) } }
  index(root)
  const textContent=new Map<string,boolean>()
  const navigation=(node:HomeSourceNodeData)=>node.name==='Navigation'&&node.width>700
  const hasText=(node:HomeSourceNodeData):boolean=>{
    if(!textContent.has(node.id))textContent.set(node.id,node.type==='TEXT'&&Boolean(node.text)||node.children.some(hasText))
    return textContent.get(node.id)!
  }
  const hidden=new Set(options.hidden)
  function dimension(css:string,property:string,fallback:number,base:number) {
    const value=declarations(css,property)
    if(!value)return fallback
    if(/^-?[\d.]+px$/.test(value))return parseFloat(value)
    if(/^-?[\d.]+%$/.test(value))return parseFloat(value)*base/100
    const expression=value.match(/^calc\(\s*(-?[\d.]+)%\s*([+-])\s*([\d.]+)px\s*\)$/)
    return expression ? Number(expression[1])*base/100+(expression[2]==='+'?1:-1)*Number(expression[3]) : fallback
  }
  const box = (node:HomeSourceNodeData):Box => {
    if (!original.has(node.id)) {
      // Business data can append updated geometry to the copied source CSS
      // (e.g. a physician name filling its identity column). Use its final
      // declaration, including %/calc(), rather than the stale export width.
      const css=node.css+';'+(options.styles?.[node.id]||'')
      const parent=parents.get(node.id), base=parent?box(parent):{width:node.width,height:node.height}
      const b={x:dimension(css,'left',node.x,base.width),y:dimension(css,'top',node.y,base.height),width:dimension(css,'width',node.width,base.width),height:dimension(css,'height',node.height,base.height)}
      // Native mirrored image fills use an anchor at their far edge. Layout
      // uses the visual bounds; write the original matrix anchor back later.
      const matrix=declarations(node.css,'transform')?.match(/^matrix\(\s*(-?1),\s*0,\s*0,\s*(-?1),\s*0,\s*0\)$/)
      const offset={x:matrix?.[1]==='-1'?b.width:0,y:matrix?.[2]==='-1'?b.height:0}
      if(matrix&&/transform-origin:\s*0(?:px)?\s+0(?:px)?/.test(node.css)) {
        anchors.set(node.id,offset);b.x-=offset.x;b.y-=offset.y
      }
      original.set(node.id,b)
    }
    return original.get(node.id)!
  }
  const children = (node:HomeSourceNodeData) => node.children.filter(child=>child.visible&&!hidden.has(child.id)&&!/(?:^|;)\s*display:\s*none/.test(options.styles?.[child.id]||''))
  const direction = (node:HomeSourceNodeData) => /display:\s*(?:inline-)?flex/.test(node.layoutCss||'')
    ? /flex-direction:\s*column/.test(node.layoutCss||'') ? 'column'
      : /flex-wrap:\s*wrap/.test(node.layoutCss||'')&&children(node).some(child=>Math.abs(box(child).y-box(children(node)[0]!).y)>1) ? 'free' : 'row'
    : 'free'
  function containerPadding(node:HomeSourceNodeData) {
    const css=node.layoutCss||'', values=declarations(css,'padding')?.split(/\s+/).map(parseFloat)||[]
    return {
      left:number(css,'padding-left',values[3]??values[1]??values[0]??0),
      right:number(css,'padding-right',values[1]??values[0]??0),
    }
  }
  function metrics(node:HomeSourceNodeData) {
    const css=node.css+';'+(options.styles?.[node.id]||'')
    const size=number(css,'font-size',16), line=number(css,'line-height',size*1.5)
    const font=`${declarations(css,'font-weight')||'400'} ${size}px ${declarations(css,'font-family')||'sans-serif'}`
    const raw=options.texts?.[node.id]??node.text, text=translate(raw)
    const spacing=number(css,'letter-spacing',0)
    const measure=(value:string)=>textWidth(value,font)+Math.max(0,[...value].length-1)*spacing
    return {text,font,line,measure,changed:text!==node.text,natural:Math.max(0,...text.split('\n').map(measure))}
  }
  function desired(node:HomeSourceNodeData):number {
    if(preferred.has(node.id))return preferred.get(node.id)!
    const b=box(node), kids=children(node), mode=direction(node)
    if(navigation(node))return b.width
    let width=b.width
    if(node.type==='TEXT'&&node.text) {
      const m=metrics(node)
      if(m.changed&&b.height<=m.line*1.5&&!node.text.includes('\n'))width=Math.max(width,m.natural+1)
    } else if(kids.length&&mode==='row') {
      const ordered=[...kids].sort((a,b)=>box(a).x-box(b).x)
      width+=ordered.reduce((sum,child)=>sum+Math.max(0,desired(child)-box(child).width),0)
    } else if(kids.length&&(mode==='column'||mode==='free'&&!node.svg&&!/url\(/.test(node.css)&&kids.every(hasText))) {
      width=Math.max(width,...kids.map(child=>b.width-box(child).width+desired(child)))
    }
    preferred.set(node.id,width)
    return width
  }
  function minimum(node:HomeSourceNodeData):number {
    if(minimums.has(node.id))return minimums.get(node.id)!
    const b=box(node),kids=children(node),mode=direction(node)
    let width=0
    if(!hasText(node))width=b.width
    else if(node.type==='TEXT'&&node.text) {
      const m=metrics(node)
      // Numeric ratings and unchanged native rich-text runs cannot be
      // compressed: their authored spans retain their own pixel widths.
      if(!m.changed&&(node.textLines||node.textRuns||node.textParagraphs||/^[\d\s.,%+$€¥/–-]+$/.test(node.text)))width=Math.max(b.width,m.natural)
    } else if(kids.length) {
      const padding=containerPadding(node)
      if(mode==='row') {
        const ordered=[...kids].sort((a,b)=>box(a).x-box(b).x)
        width=padding.left+padding.right+ordered.reduce((sum,child,i)=>sum+minimum(child)+(i?Math.max(0,box(child).x-box(ordered[i-1]!).x-box(ordered[i-1]!).width):0),0)
      } else width=padding.left+padding.right+Math.max(0,...kids.map(minimum))
    }
    minimums.set(node.id,width)
    return width
  }
  function textHeight(node:HomeSourceNodeData,width:number) {
    const m=metrics(node)
    let lines=0
    for(const paragraph of m.text.split('\n')) {
      if(!paragraph){lines++;continue}
      let used=0; lines++
      for(const token of paragraph.match(/\s+|\S+/g)||[]) {
        const measured=m.measure(token)
        if(used&&used+measured>width+.1&&!/^\s+$/.test(token)){lines++;used=0}
        if(measured>width) {
          for(const char of token) {
            const size=m.measure(char)
            if(used&&used+size>width+.1){lines++;used=0}
            used+=size
          }
        } else used+=used||!/^\s+$/.test(token)?measured:0
      }
    }
    return Math.max(box(node).height,Math.ceil(lines*m.line))
  }
  function visit(node:HomeSourceNodeData,assigned:number):Box {
    const b=box(node), width=Math.max(1,assigned), kids=children(node), mode=direction(node)
    // Collapsed accordions intentionally keep their descendants mounted.
    // Translation must not turn a zero-height hidden state into an open panel.
    if(b.height<=0&&/overflow(?:-y)?:\s*(?:hidden|clip)/.test(node.css+';'+(options.styles?.[node.id]||'')))return {...b,width,height:0}
    // The live shared navigation already owns label wrapping, menus and its
    // compact rows. Do not measure its replaced Figma children a second time.
    if(navigation(node))return {...b,width}
    if(node.type==='TEXT'&&node.text&&node.text!=='\uf005') {
      const m=metrics(node)
      // Public records can already use Latin names. Even without a dictionary
      // replacement they need wrapping when the assigned identity column is
      // narrower than the name. Preserve untouched native rich-text runs.
      if(!m.changed&&(m.natural<=width+1||node.textLines||node.textRuns||node.textParagraphs))return {...b,width}
      const height=textHeight(node,width)
      result[node.id]=`width:${width}px;height:${height}px;white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;`
      return {...b,width,height}
    }
    if(!kids.length)return {...b,width}
    const ordered=[...kids].sort((a,b)=>mode==='row'?box(a).x-box(b).x:box(a).y-box(b).y||box(a).x-box(b).x)
    // A centered child's x is its alignment offset, not container padding.
    // Treating it as padding pushed long translations to the right edge.
    const insets=containerPadding(node)
    const left=mode==='free'?Math.min(...kids.map(k=>box(k).x)):insets.left
    // An absolute close icon may sit inside the panel's padding. It must not
    // reduce the inset available to a wider translated heading/body column.
    const right=mode==='free'?Math.max(insets.right,b.width-Math.max(...kids.map(k=>box(k).x+box(k).width)),0):insets.right
    const usable=Math.max(1,width-left-right)
    const sizes=new Map<string,number>()
    if(mode==='row') {
      const columns=ordered.length>1&&ordered.every(k=>k.type!=='TEXT'&&box(k).height>=80&&box(k).width>=120)
      const gaps=ordered.slice(1).reduce((sum,k,i)=>sum+Math.max(0,box(k).x-box(ordered[i]!).x-box(ordered[i]!).width),0)
      const desiredTotal=ordered.reduce((sum,k)=>sum+desired(k),0), available=Math.max(1,usable-gaps)
      const flexible=ordered.filter(hasText)
      const fixed=ordered.filter(k=>!flexible.includes(k)).reduce((sum,k)=>sum+box(k).width,0)
      const flexDesired=flexible.reduce((sum,k)=>sum+desired(k),0)
      const minimumTotal=flexible.reduce((sum,k)=>sum+Math.min(desired(k),minimum(k)),0)
      const remaining=Math.max(0,available-fixed-minimumTotal)
      for(const k of ordered) sizes.set(k.id,columns ? box(k).width : desiredTotal<=available
        ? flexible.length===1&&flexible[0]===k&&k.type!=='TEXT' ? Math.max(desired(k),available-fixed) : desired(k)
        : flexible.includes(k)?Math.max(1,Math.min(desired(k),minimum(k))+(desired(k)-Math.min(desired(k),minimum(k)))*remaining/Math.max(1,flexDesired-minimumTotal)):box(k).width)
    } else for(const k of ordered) {
      const c=box(k)
      const positioned=declarations(k.layoutCss||'','position')==='absolute'
      const cardColumn=mode==='free'&&c.width>=120&&c.height>=80&&ordered.some(s=>s!==k&&Math.abs(box(s).y-c.y)<1&&Math.abs(box(s).width-c.width)<1&&Math.abs(box(s).height-c.height)<1)
      // Small absolute labels hug their copy over an image; side columns and
      // cards retain their authored widths. Otherwise a city becomes a
      // vertical string while the last card expands into unused grid space.
      const overlayLabel=positioned&&c.width<b.width&&c.height<80
      const blockers=mode==='free'?ordered.filter(s=>s!==k&&box(s).x>=c.x+c.width-1&&box(s).y<c.y+c.height&&box(s).y+box(s).height>c.y):[]
      const edge=Math.min(width-(overlayLabel?insets.right:right),...blockers.map(s=>box(s).x-Math.max(0,box(s).x-c.x-c.width)))
      const available=Math.max(1,edge-(mode==='column'&&!positioned?left:c.x))
      sizes.set(k.id,!hasText(k)||c.width>b.width ? c.width : cardColumn||positioned&&!overlayLabel ? Math.min(c.width,available) : mode==='column'&&k.type==='TEXT' ? available : Math.min(Math.max(c.width,desired(k)),available))
    }
    const laid=ordered.map(k=>({node:k,old:box(k),next:visit(k,sizes.get(k.id)!)}))
    // Keep authored equal-size card rows aligned when one translation needs
    // an extra line. Later rows then move by the tallest card in that row.
    for(const first of laid) {
      if(first.old.height<80)continue
      const row=laid.filter(item=>Math.abs(item.old.y-first.old.y)<1&&Math.abs(item.old.width-first.old.width)<1&&Math.abs(item.old.height-first.old.height)<1)
      if(row.length<2)continue
      const height=Math.max(...row.map(item=>item.next.height))
      row.forEach(item=>{item.next.height=height})
    }
    let maxBottom=0
    const rowHeight=Math.max(0,...laid.map(k=>k.next.height-k.old.height))
    const rowWidth=laid.reduce((total,item,i)=>total+item.next.width+(i?Math.max(0,item.old.x-laid[i-1]!.old.x-laid[i-1]!.old.width):0),0)
    const rowStart=/justify-content:\s*center/.test(node.layoutCss||'')?left+Math.max(0,usable-rowWidth)/2
      : /justify-content:\s*(?:flex-)?end/.test(node.layoutCss||'')?width-right-rowWidth:laid[0]?.old.x||left
    for(let i=0;i<laid.length;i++) {
      const item=laid[i]!, c=item.old
      let x=c.x,y=c.y
      if(mode==='row') {
        if(i) {const prev=laid[i-1]!;x=prev.next.x+prev.next.width+Math.max(0,c.x-prev.old.x-prev.old.width)} else x=rowStart
        if(/align-items:\s*center/.test(node.layoutCss||''))y+=Math.max(0,rowHeight-(item.next.height-c.height))/2
      } else {
        const positioned=declarations(item.node.layoutCss||'','position')==='absolute'
        if(mode==='column'&&!positioned&&/align-items:\s*center/.test(node.layoutCss||''))x=left+Math.max(0,usable-item.next.width)/2
        else if(mode==='column'&&!positioned&&/align-items:\s*(?:flex-)?end/.test(node.layoutCss||''))x=width-right-item.next.width
        for(let j=0;j<i;j++) {
          const prev=laid[j]!
          if(prev.old.y+prev.old.height<=c.y+1&&prev.old.x<c.x+c.width&&prev.old.x+prev.old.width>c.x)
            y=Math.max(y,prev.next.y+prev.next.height+Math.max(0,c.y-prev.old.y-prev.old.height))
        }
      }
      item.next.x=x;item.next.y=y
      const size=item.next
      const anchor=anchors.get(item.node.id)
      result[item.node.id]=(result[item.node.id]||'')+`left:${x+(anchor?.x||0)}px;top:${y+(anchor?.y||0)}px;width:${size.width}px;height:${size.height}px;`
      const clipsChildren=/overflow(?:-y)?:\s*(?:hidden|clip)/.test(node.css+';'+(options.styles?.[node.id]||''))
      // A larger photo is intentionally cropped by its original viewport.
      // Its unchanged hidden pixels cannot increase the translated card height.
      maxBottom=Math.max(maxBottom,clipsChildren&&!hasText(item.node)?Math.min(b.height,y+size.height):y+size.height)
    }
    const oldBottom=Math.max(...kids.map(k=>box(k).y+box(k).height)), padding=Math.max(0,b.height-oldBottom)
    const height=Math.max(b.height,maxBottom+padding)
    result[node.id]=`width:${width}px;height:${height}px;`
    return {...b,width,height}
  }
  const dimensions=visit(root,box(root).width)
  return {styles:result,height:dimensions.height}
}
