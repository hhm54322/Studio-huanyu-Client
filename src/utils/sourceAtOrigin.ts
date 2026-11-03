import type { HomeSourceNodeData as SourceNode } from '@/components/common/HomeSourceNode.vue'

/**
 * Place a source subtree at its own origin without pulling in any page's
 * source registry. Shared canvases use this for a local render root; the
 * page-specific data modules remain responsible for loading their own trees.
 */
export function sourceAtOrigin(node: SourceNode): SourceNode {
  return {
    ...node,
    x: 0,
    y: 0,
    css: `${node.css};position:relative;left:0;top:0;`,
    layoutCss: `${node.layoutCss};position:relative;left:0;top:0;`,
  }
}
