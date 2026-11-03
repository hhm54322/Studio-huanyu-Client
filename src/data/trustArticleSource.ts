import type { HomeSourceNodeData as SourceNode } from '@/components/common/HomeSourceNode.vue'
import type { TrustArticleKey } from './trustFigmaSource'
import { sourceAtOrigin } from '@/utils/sourceAtOrigin'

type Article = { title: string; articleFrame?: string; root: SourceNode }
const titles: Record<TrustArticleKey, string> = {
  jci: 'JCI认证真相', cost: '费用低的原因', doctor: '医生资质揭秘', medicine: '药品安全说明',
  infection: '感染控制数据', rights: '权益保障解读', privacy: '数据隐私合规', muslim: '穆斯林患者就医保障',
}
// Only import the rendered tree, not its audit inventory and duplicated copy.
// Each article remains a separate chunk, loaded on its first explicit opening.
const articleFiles = {
  ...import.meta.glob('../../docs/figma-source/trust-articles-revision/*/desktop-variant-2026-10-22.json', { import: 'root' }),
  ...import.meta.glob('../../docs/figma-source/trust-safety-revision/*/desktop-variant-2026-10-22.json', { import: 'root' }),
} as Record<string, () => Promise<SourceNode>>
const frames: Partial<Record<TrustArticleKey, string>> = {
  cost: '1595:3491', doctor: '1595:3519', medicine: '1595:3547', infection: '1595:3477',
  rights: '1595:3505', privacy: '1595:3533', muslim: '1595:3561',
}
const loaded = new Map<TrustArticleKey, Article>()
const pending = new Map<TrustArticleKey, Promise<void>>()

function findPanel(node: SourceNode): SourceNode | undefined {
  if (node.id === '143:4209') return node
  for (const child of node.children) {
    const found = findPanel(child)
    if (found) return found
  }
}
export function loadTrustArticle(key: TrustArticleKey): Promise<void> {
  if (loaded.has(key)) return Promise.resolve()
  const active = pending.get(key)
  if (active) return active
  const load = key === 'jci'
    ? import('../../docs/figma-source/trust-content-revision/trust/source-tree-2026-10-21.json').then(source => findPanel(source.root as SourceNode)!)
    : articleFiles[`../../docs/figma-source/${key === 'cost' || key === 'doctor' ? 'trust-articles-revision' : 'trust-safety-revision'}/${key}/desktop-variant-2026-10-22.json`]!()
  const request = load.then(root => { loaded.set(key, { title: titles[key], articleFrame: frames[key], root: sourceAtOrigin(root) }) })
    .finally(() => pending.delete(key))
  pending.set(key, request)
  return request
}
export function trustArticleSource(key: TrustArticleKey): Article {
  const article = loaded.get(key)
  if (!article) throw new Error(`Trust article was not prepared before opening: ${key}`)
  return article
}
