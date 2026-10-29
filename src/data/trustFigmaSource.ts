import type { HomeSourceNodeData as Node, HomeSourceAction } from '@/components/common/HomeSourceNode.vue'
import source from '../../docs/figma-source/trust/revision-2026-10-29/source-tree-2026-10-29.json'
import travel from '../../docs/figma-source/trust/revision-2026-10-29/travel/source-tree-2026-10-29.json'
import aftercare from '../../docs/figma-source/trust/revision-2026-10-29/aftercare/source-tree-2026-10-29.json'
import assurances from '../../docs/figma-source/trust/revision-2026-10-29/assurances/source-tree-2026-10-29.json'
export const trustSource = source.root as Node
export const trustTravel = travel.root as Node
export const trustAftercare = aftercare.root as Node
export const trustAssuranceState = assurances.root as Node
export const trustDescendants = (n: Node): Node[] => [n, ...n.children.flatMap(trustDescendants)]
export const trustNodes = new Map([trustSource, trustTravel, trustAftercare].flatMap(trustDescendants).map(n => [n.id, n]))
export const trustNode = (id: string) => trustNodes.get(id)!
export const trustArticles = [
  ['143:2707', 'jci', 'JCI认证真相', '143:2713'],
  ['143:2645', 'cost', '费用低的原因', '143:2651'],
  ['143:2654', 'doctor', '医生资质揭秘', '143:2659'],
  ['143:2662', 'medicine', '药品安全说明', '143:2667'],
  ['143:2670', 'infection', '感染控制数据', '143:2678'],
  ['143:2681', 'rights', '权益保障解读', '143:2686'],
  ['143:2689', 'privacy', '数据隐私合规', '143:2695'],
  ['143:2698', 'muslim', '穆斯林患者就医保障', '143:2704'],
] as const
export type TrustArticleKey = typeof trustArticles[number][1]
export const trustAssurances = ['143:2539', '143:2555', '143:2567', '143:2578']
export const trustFaqRows = ['143:2597', '143:2610', '143:2618', '143:2626']
export const trustActions: Record<string, HomeSourceAction> = {}
const link = (id: string, href: string) => { trustActions[id] = { href } }
const action = (id: string, value: string, label?: string) => { trustActions[id] = { action: value, label } }
action('484:1472', 'consultation', '问阿宁')
action('484:1496', 'language', '选择语言')
link('484:1465', '/')
;['/', '/why-china', '/trust', '/diseases-technologies', '/dental', '/hospitals', '/cases', '/insurance', '/about'].forEach((href, i) => link(`484:${1477 + i * 2}`, href))
for (const [id, href] of [
  ['143:2941', '/'], ['143:2954', '/diseases-technologies'], ['143:2956', '/cost'], ['143:2958', '/report'],
  ['143:2962', '/steps'], ['143:2968', '/cases'], ['143:2970', '/insurance'], ['143:2972', '/steps'], ['143:2974', '/about'],
  ['143:2980', 'mailto:contact@huanyuyunyi.com'], ['143:2986', 'tel:+864008886688'], ['143:2991', 'https://wa.me/864008886688'],
  ['204:5660', '/steps/toolkit-detail'], ['204:5846', '/steps/toolkit-detail?article=visa'],
  ['204:6040', '/steps/toolkit-detail?article=steps-flow'], ['1582:2014', '/report'],
]) link(id!, href!)
action('1582:2010', 'consultation', '免费问阿宁')
action('1582:2018', 'consultation', '预约专家面诊 $200起')
trustAssurances.forEach((id, i) => action(id, `assurance:${i}`))
;['143:2598', '143:2611', '143:2619', '143:2627'].forEach((id, i) => action(id, `faq:${i}`))
