import type { HomeSourceNodeData as SourceNode } from '@/components/common/HomeSourceNode.vue'
import profile from '../../docs/figma-source/dental-pages-2026-11-03/profile/source-tree-2026-11-03.json'
import profileTypography from '../../docs/figma-source/dental-pages-2026-11-03/profile/text-layout-2026-11-03.json'

export const dentalDoctorTabs = ['profile', 'treatment', 'cases', 'reviews', 'services'] as const
export type DentalDoctorTab = typeof dentalDoctorTabs[number]
function profileSource(): SourceNode {
  const root=structuredClone(profile.root) as SourceNode
  const visit=(node: SourceNode): void => {
    if(node.id===profileTypography.nodeId && node.text===profileTypography.text) node.textLines=profileTypography.textLines
    node.children.forEach(visit)
  }
  visit(root)
  return root
}
const cached = new Map<DentalDoctorTab, SourceNode>([['profile', profileSource()]])
const pending = new Map<DentalDoctorTab, Promise<SourceNode>>()
const loaders = import.meta.glob('../../docs/figma-source/dental-pages-2026-11-03/*/source-tree-2026-11-03.json', { import: 'default' }) as Record<string, () => Promise<{ root: SourceNode }>>
export function parseDentalDoctorTab(value: unknown): DentalDoctorTab {
  return dentalDoctorTabs.includes(value as DentalDoctorTab) ? value as DentalDoctorTab : 'profile'
}
export function loadDentalDoctorPage(tab: DentalDoctorTab): Promise<SourceNode> {
  const available = cached.get(tab)
  if (available) return Promise.resolve(available)
  const loading = pending.get(tab)
  if (loading) return loading
  const request = loaders[`../../docs/figma-source/dental-pages-2026-11-03/${tab}/source-tree-2026-11-03.json`]!()
    .then(source => { cached.set(tab, source.root); return source.root })
    .finally(() => pending.delete(tab))
  pending.set(tab, request)
  return request
}
export function getDentalDoctorPage(tab: DentalDoctorTab) { return cached.get(tab) }
export const doctorPageDescendants = (node: SourceNode): SourceNode[] => [node, ...node.children.flatMap(doctorPageDescendants)]
export function dentalDoctorPageModel(root: SourceNode) {
  const header = root.children.find(node => node.name === 'Header')!
  const body = root.children.find(node => node.name === 'Body')!
  const main = body.children.find(node => node.name === 'Main Content')!
  const section = main.children[0]!
  const card = section.children[0]!
  const right = section.children[1]!
  const menuWrap = right.children[0]!
  const menu = menuWrap.name === 'Container:margin' ? menuWrap.children[0]! : menuWrap
  const related = main.children[1]!
  return { header, body, main, section, card, right, menuWrap, menu, related,
    footer: body.children.find(node => node.name === 'Footer')!,
    content: right.children.slice(1), tabs: menu.children }
}
