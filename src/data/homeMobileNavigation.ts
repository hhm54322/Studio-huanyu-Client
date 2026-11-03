import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'
import source from '../../docs/figma-source/home/navigation-mobile/source-tree-2026-10-19.json'

// The hospital's existing mobile menu reuses this exact locked subtree. It
// must not pull every desktop homepage section into the hospital entry.
const homeMobileNodes = new Map<string, HomeSourceNodeData>()
function indexTree(node: HomeSourceNodeData) {
  homeMobileNodes.set(node.id, node)
  node.children.forEach(indexTree)
}
indexTree(source.root)
export { homeMobileNodes }
