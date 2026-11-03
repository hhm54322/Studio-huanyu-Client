import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'
import entry from 'virtual:huanyu-home-entry'

// Stable, non-reactive source objects retain every copied Figma value. Only
// the entry subtrees are downloaded initially; the full page extends these
// same maps after the hero has painted.
export function indexHomeSource(node: HomeSourceNodeData, map: Map<string, HomeSourceNodeData>) {
  map.set(node.id, node)
  node.children.forEach(child => indexHomeSource(child, map))
  return map
}
export const homeDesktopNodes = new Map<string, HomeSourceNodeData>()
export const homeMobileNodes = new Map<string, HomeSourceNodeData>()
export function restoreHomeEntrySources() {
  entry.desktop.forEach(node => indexHomeSource(node, homeDesktopNodes))
  entry.mobile.forEach(node => indexHomeSource(node, homeMobileNodes))
}
restoreHomeEntrySources()
export const homeBodyHeight = entry.bodyHeight
