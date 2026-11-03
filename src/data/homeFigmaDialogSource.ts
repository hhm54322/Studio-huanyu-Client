import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'
import { homeDesktopNodes as pageDesktopNodes, homeMobileNodes as pageMobileNodes } from './homeSourceRegistry'
type DialogSources = { desktop: Map<string, HomeSourceNodeData>; mobile: Map<string, HomeSourceNodeData> }
const files = import.meta.glob('../../docs/figma-source/home/{why-*,story-02,story-03,story-mobile}/source-tree-2026-10-19.json', { import: 'root' }) as Record<string, () => Promise<HomeSourceNodeData>>
const panels = ['143:4038','143:4223','143:4319','143:4087','143:4130','143:4170']
const loaded = new Map<string, DialogSources>()
const pending = new Map<string, Promise<void>>()
function indexTree(node: HomeSourceNodeData, map: Map<string, HomeSourceNodeData>) {
  map.set(node.id, node)
  node.children.forEach(child => indexTree(child, map))
}
export function loadHomeDialogSources(panel: string): Promise<void> {
  if (loaded.has(panel)) return Promise.resolve()
  const active = pending.get(panel)
  if (active) return active
  const index = panels.indexOf(panel)
  const groups = panel === '1407:8'
    ? { desktop: ['story-02','story-03'], mobile: ['story-mobile'] }
    : index >= 0 ? { desktop: [`why-0${index + 1}`], mobile: [`why-mobile-0${index + 1}`] } : undefined
  if (!groups) return Promise.reject(new Error(`Unknown homepage dialog panel: ${panel}`))
  const sources = { desktop: new Map(pageDesktopNodes), mobile: new Map(pageMobileNodes) }
  const request = Promise.all((['desktop','mobile'] as const).map(async viewport => {
    const roots = await Promise.all(groups[viewport].map(folder => files[`../../docs/figma-source/home/${folder}/source-tree-2026-10-19.json`]!()))
    // Preserve the original source order, independently of download order.
    roots.forEach(root => indexTree(root, sources[viewport]))
  })).then(() => { loaded.set(panel, sources) }).finally(() => pending.delete(panel))
  pending.set(panel, request)
  return request
}
export function homeDialogSources(panel: string): DialogSources {
  const sources = loaded.get(panel)
  if (!sources) throw new Error(`Homepage dialog was not prepared before opening: ${panel}`)
  return sources
}
