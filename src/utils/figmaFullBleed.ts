import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'

/** Extend source background layers while keeping their children's authored size. */
export function figmaFullBleedStyles(
  root: HomeSourceNodeData,
  viewport: number,
  ids: readonly string[],
): Record<string, string> {
  if (viewport <= root.width) return {}
  const extra = viewport - root.width
  const targets = new Set(ids)
  const styles: Record<string, string> = {}
  function visit(node: HomeSourceNodeData) {
    if (targets.has(node.id)) {
      styles[node.id] = `width:${viewport}px;left:${node.x - extra / 2}px;`
      if (node.css.includes('url(')) styles[node.id] += 'background-size:cover;background-position:center;background-repeat:no-repeat;'
      for (const child of node.children) styles[child.id] = `left:${child.x + extra / 2}px;`
    }
    node.children.forEach(visit)
  }
  visit(root)
  return styles
}
