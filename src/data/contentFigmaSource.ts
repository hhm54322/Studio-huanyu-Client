import type { HomeSourceNodeData as SourceNode, HomeSourceAction } from '@/components/common/HomeSourceNode.vue'

type SourceFile = { sourceFrame: string; sourceSHA256: string; root: SourceNode }
type ToolkitVariant = { key: string; title: string; articleFrame: string; root: SourceNode }
const variantFiles = import.meta.glob('../../docs/figma-source/toolkit-revision/*/desktop-variant-2026-10-22.json', { eager: true, import: 'default' }) as Record<string, ToolkitVariant>
export const toolkitArticles: Record<string, ToolkitVariant> = Object.fromEntries(Object.values(variantFiles).map(variant => [variant.key, variant]))
const files = import.meta.glob('../../docs/figma-source/content-revision/**/source-tree-2026-10-21.json', { eager: true, import: 'default' }) as Record<string, SourceFile>
export const contentSources: Record<string, SourceFile> = {}
for (const [path, source] of Object.entries(files)) {
  const folder = path.replace('../../docs/figma-source/content-revision/', '').split('/')[0]!
  contentSources[folder] = source
}

export function contentDescendants(node: SourceNode): SourceNode[] {
  return [node, ...node.children.flatMap(contentDescendants)]
}

// The implementation standard permits obvious source-copy corrections.
// Keep the original locked Figma data unchanged; only repair these two
// literal typos in the derived DOM runs, never its hierarchy or geometry.
export function contentArticleRoot(source: string, article?: string): SourceNode {
  if (source === 'toolkit' && article && toolkitArticles[article]) return toolkitArticles[article].root
  const fix = (text: string) => text.replace('为**规整', '为规整').replace('全球患者可安心四、', '全球患者可安心。四、')
  const visit = (node: SourceNode): SourceNode => {
    const result = { ...node, children: node.children.map(visit) }
    if (source !== 'toolkit' || node.id !== '143:3081') return result
    const runs = (items: { text: string; css: string }[]) => items.map(run => ({ ...run, text: fix(run.text) }))
    return {
      ...result, text: fix(node.text),
      textRuns: node.textRuns && runs(node.textRuns),
      textParagraphs: node.textParagraphs?.map(paragraph => ({ ...paragraph, runs: runs(paragraph.runs) })),
      textLines: node.textLines?.map(line => ({ ...line, runs: runs(line.runs) })),
    }
  }
  return visit(contentSources[source]!.root)
}
export function articleControls(source: string, article?: string) {
  const actions: Record<string, HomeSourceAction> = {}
  const attributes: Record<string, Record<string, string | number | boolean>> = {}
  const nodes = contentDescendants(contentSources[source]!.root)
  const text = (node: SourceNode) => contentDescendants(node).filter(n => n.type === 'TEXT').map(n => n.text).join('')
  const links: Record<string, string> = {
    '寰寰宇云医': '/', '首页': '/', '为什么选择中国': '/why-china', '信任与常见问题': '/trust',
    '疾病中心': '/diseases-technologies', '中国医院': '/hospitals', '患者案例': '/cases',
    '保险指南': '/insurance', '关于我们': '/about', '费用对比': '/cost', '报告体验': '/report',
    '就医步骤': '/steps', '返回信任与常见问题': '/trust',
    'contact@huanyuyunyi.com': 'mailto:contact@huanyuyunyi.com',
    '+86 400-888-XXXX': 'tel:+864008886688', 'WhatsApp': 'https://wa.me/864008886688',
  }
  for (const node of nodes) {
    if (['Link', 'List Item'].includes(node.name)) {
      const label = text(node)
      if (links[label]) actions[node.id] = { href: links[label], label }
      else if (label === '问阿宁') actions[node.id] = { action: 'consultation', label }
      else if (['长寿医学', '会员中心', '签证办理', '隐私政策', '服务条款'].includes(label)) {
        attributes[node.id] = { 'aria-disabled': true, title: '对应页面尚未开放' }
      }
    }
    if (node.name === 'Button' && text(node) === '🇨🇳ZH') {
      attributes[node.id] = { 'aria-label': '当前语言：中文', 'aria-disabled': true, title: '多语言功能暂缓' }
    }
  }
  // These are article destinations, not sections in the translation article.
  // Keep unavailable articles non-navigating until their source is verified.
  for (const id of ['143:3091', '143:3095', '143:3099', '143:3103', '143:3107', '143:3111', '143:3115']) {
    attributes[id] = { 'aria-disabled': true, title: '对应文章尚未接入' }
  }
  if (source === 'toolkit') {
    for (const [key, nodeId] of [['assessment', '143:3087'], ['visa', '143:3091'], ['medication-entry', '143:3099'], ['companions', '143:3103'], ['muslim', '143:3107'], ['steps-flow', '143:3111']]) {
      const entry = toolkitArticles[key!]
      if (!entry || !nodeId || !key) continue
      actions[nodeId] = { href: `/steps/toolkit-detail?article=${key}`, label: entry.title }
      attributes[nodeId] = article === key ? { 'aria-current': 'page' } : {}
    }
    attributes['143:3074'] = { role: 'heading', 'aria-level': 1 }
    attributes['143:3062'] = { role: 'article', 'aria-label': article ? toolkitArticles[article]?.title || '病历翻译与整理工具' : '病历翻译与整理工具', 'data-content-entry': true }
    attributes['143:3082'] = { role: 'navigation', 'aria-label': '来华就医全流程工具包目录' }
    attributes['143:3079'] = { role: 'img', 'aria-label': '标准化病历整理示例' }
    attributes['143:3080'] = { role: 'img', 'aria-label': '海外病历可行性评估报告示例' }
  }
  return { actions, attributes }
}
