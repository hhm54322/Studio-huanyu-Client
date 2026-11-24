import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'

/** Reflow authored desktop stacks and grids when a page has no mobile frame. */
export function adaptSourceToMobile(source: HomeSourceNodeData, compactText = false): HomeSourceNodeData {
  const text = source.type === 'TEXT'
  const landscapeAsset = source.name !== 'Section' && source.css.includes('url(') && source.width >= 180 && source.height > 60
  const visual = source.svg || landscapeAsset
  const fixedVisual = compactText || Boolean(visual) && source.width < 180
  const base = source.layoutCss || source.css
  const hasGrid = /display:\s*(?:inline-)?grid/.test(base)
  const row = /display:\s*(?:inline-)?flex/.test(base) && !/flex-direction:\s*column/.test(base)
  const children = source.children.filter(child => child.visible)
  const substantial = children.filter(child => child.width > 110)
  const columns = hasGrid || row && substantial.length >= 2 && children.some(child => child.height > 84)
  const figure = !fixedVisual && landscapeAsset
  const hasText = Boolean(source.text || children.some(child => child.text))
  const css = fixedVisual
    ? base
    : base + ';position:relative;inset:auto;transform:none;max-width:100%;min-height:0;'
  let adapted = css
  if (!fixedVisual) {
    if (text) {
      adapted += 'width:auto;height:auto;white-space:pre-wrap;overflow-wrap:anywhere;'
      const fontSize = Number(base.match(/font-size:\s*([\d.]+)px/)?.[1])
      if (fontSize > 45) adapted += 'font-size:clamp(28px,6.75vw,44px);line-height:1.18;'
      else if (fontSize > 28) adapted += 'font-size:clamp(23px,5.7vw,32px);line-height:1.23;'
      else if (fontSize >= 14) adapted += 'line-height:1.55;'
    } else if (figure) {
      adapted += `display:block;width:100%;height:auto;aspect-ratio:${source.width}/${source.height};background-size:cover;`
    } else if (visual) {
      adapted += `width:100%;height:auto;aspect-ratio:${source.width}/${Math.max(1, source.height)};`
    } else if (children.length) {
      adapted += 'height:auto;overflow:visible;'
      if (columns) adapted += 'display:flex;flex-direction:column;align-items:stretch;width:100%;gap:16px;'
      else if (row) adapted += 'display:flex;flex-wrap:wrap;gap:min(12px,3vw);'
      if (source.width > 300 || source.name.includes(':margin')) adapted += 'width:100%;'
      if (source.name === 'Section') adapted += 'width:100%;padding:44px 20px;'
      else if (base.includes('padding:')) {
        adapted += 'padding-left:min(24px,5vw);padding-right:min(24px,5vw);'
        if (!hasText && source.width >= 900) adapted += 'padding-top:min(34px,6vw);padding-bottom:min(34px,6vw);'
      }
      adapted += 'row-gap:min(24px,5vw);'
    } else if (source.width > 320) adapted += 'width:100%;'
  }
  return { ...source, layoutCss: adapted, children: children.map(child => adaptSourceToMobile(child, figure || fixedVisual)) }
}
