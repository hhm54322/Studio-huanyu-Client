import type { HomeSourceNodeData as SourceNode, HomeSourceAction } from '@/components/common/HomeSourceNode.vue'
import doctorCardConsumption from '../../docs/figma-source/dental-revision-2026-10-28/matching-card-consumption-2026-10-28.json'
import completeSource from '../../docs/figma-source/dental-complete-2026-10-30/source-extension.json'
export { dentalPhysicians as dentalCurrentDoctors } from './dentalPhysicianData'
type SourceFile = { sourceFrame: string; root: SourceNode }
const files = import.meta.glob('../../docs/figma-source/dental-revision-2026-10-28/*/source-tree-2026-10-28.json', { eager: true, import: 'default' }) as Record<string, SourceFile>
export const dentalSources: Record<string, SourceFile> = {}
export const dentalNodes = new Map<string, SourceNode>()
export const dentalParents = new Map<string, SourceNode>()
export function dentalDescendants(node: SourceNode): SourceNode[] { return [node, ...node.children.flatMap(dentalDescendants)] }
for (const [path, source] of Object.entries(files)) {
  const segments = path.split('/')
  dentalSources[segments[segments.length - 2]!] = source
  function index(node: SourceNode) {
    dentalNodes.set(node.id, node)
    node.children.forEach(child => { dentalParents.set(child.id, node); index(child) })
  }
  index(source.root)
}
export const dentalNode = (id: string) => dentalNodes.get(id)!
export const dentalCompleteSource = completeSource
for (const subtree of [...completeSource.projectCards, completeSource.footer]) {
  function index(node: SourceNode) {
    dentalNodes.set(node.id, node)
    node.children.forEach(child => { dentalParents.set(child.id, node); index(child) })
  }
  index(subtree as SourceNode)
}
export const dentalProjectNodes = ['2294:8281', '2294:8302', '2294:8319', ...completeSource.projectCards.map(card => card.id)]
export const dentalDoctorNodes = [{ node: '2294:7061', id: 5, name: '谭兆林' }]
// The standalone Doctor Card frame is the reusable source component used by
// the matching result card. The page frame owns its placement; this component
// owns the card's exact inner hierarchy and copy.
export const dentalDoctorCardSource = { frame: '2323:8392', folder: 'doctor-card' }
export const dentalDoctorCardAliases = Object.fromEntries(doctorCardConsumption.nodePairs.map(([source, target]) => [target!, source!]))
const doctorCardPlacement = new Set(doctorCardConsumption.placementOwners)
function composeMatchingCard(node: SourceNode): SourceNode {
  const sourceId = dentalDoctorCardAliases[node.id]
  const shared = sourceId ? dentalNode(sourceId) : undefined
  const result = shared ? { ...shared, id: node.id, x: node.x, y: node.y } : { ...node }
  if (shared && doctorCardPlacement.has(node.id)) {
    // Shared component paint comes from its own Dev CSS. Only placement comes
    // from the enclosing matching frame's exact absolute geometry.
    const position = node.css.indexOf('position:absolute;')
    result.css = shared.css.split(/position:(?:absolute|relative);/)[0]! + node.css.slice(position)
  }
  result.children = node.children.map(composeMatchingCard)
  return result
}
export const dentalMatchingSource = composeMatchingCard(dentalSources.matching!.root)
export const dentalStepNodes = [['2294:8257', '2294:8263', '2294:8269'], ['2294:6988', '2294:6994', '2294:7000'], ['2294:8054', '2294:8060', '2294:8066']]
export const dentalStepRails = ['2294:8256', '2294:6987', '2294:8053']
export const dentalActions: Record<string, HomeSourceAction> = {}
const routes: Record<string, string> = {
  首页: '/', 为什么选择中国: '/why-china', 信任与常见问题: '/trust', 医疗服务: '/diseases-technologies', 疾病中心: '/diseases-technologies',
  牙科: '/dental', 中国医院: '/hospitals', 患者案例: '/cases', 保险指南: '/insurance', 关于我们: '/about', 费用对比: '/cost',
  报告体验: '/report', 就医步骤: '/steps', 'contact@huanyuyunyi.com': 'mailto:contact@huanyuyunyi.com',
  '+86 400-888-XXXX': 'tel:+864008886688', WhatsApp: 'https://wa.me/864008886688',
}
for (const source of [...Object.values(dentalSources), { root: completeSource.footer as SourceNode }]) {
  for (const node of dentalDescendants(source.root)) {
    if (node.type !== 'TEXT' || !node.visible) continue
    if (routes[node.text]) dentalActions[node.id] = { href: routes[node.text] }
    if (node.text === '寰宇云医') dentalActions[dentalParents.get(dentalParents.get(node.id)!.id)!.id] = { href: '/' }
    if (node.text === '问阿宁') dentalActions[dentalParents.get(node.id)!.id] = { action: 'consultation', label: '问阿宁' }
    if (node.text === 'ZH') dentalActions[node.id] = { action: 'language', label: '选择语言' }
    // Keep entries without authored destinations visible, without inventing pages.
    if (['签证办理', '隐私政策', '服务条款', '扫码加微信'].includes(node.text)) dentalActions[node.id] = { action: 'destination-pending', label: node.text }
  }
}
dentalStepNodes.forEach(ids => ids.forEach((id, index) => { dentalActions[id] = { action: `step:${index + 1}`, label: `0${index + 1} ${['选择牙科项目', '城市与医生匹配', '上传影像资料'][index]}` } }))
dentalActions['2294:8336'] = { action: 'step:2', label: '下一步 城市与医生匹配' }
dentalActions['2294:7209'] = { action: 'step:3', label: '下一步 上传影像资料' }
dentalActions['2294:7036'] = { action: 'filter', label: '筛选医生' }
dentalActions['2294:7040'] = { action: 'reset', label: '重置筛选' }
;(['recommended', 'experience', 'rating', 'price'] as const).forEach((sort,index)=>{
  dentalActions[['2294:7047','2294:7049','2294:7051','2294:7053'][index]!] = {action:`sort:${sort}`,label:['综合推荐','经验优先','评价最高','价格排序'][index]!}
})
dentalActions['2294:7099']={action:'doctor:5',label:'查看谭兆林医生详情'}
dentalActions['2294:7088']={action:'doctor-cases:5',label:'查看谭兆林种植修复案例'}
dentalActions['2294:7093']={action:'institution',label:'查看上海牙科机构'}
dentalActions['2294:7101']={action:'quote:5',label:'获取谭兆林医生免费报价'}
// Current upload Design shows all three photo examples inline; this group is
// reference content, not a button opening an unauthored page or modal.
dentalActions['2294:8114']={action:'submit',label:'提交评估 · 获取书面报价'}
export const dentalFilterControls = [
 {node:'2294:7006',text:'2294:7007',key:'city',label:'城市',options:['深圳','上海','广州','北京']},
 {node:'2294:7011',text:'2294:7012',key:'title',label:'医生职称',options:['主治医师','副主任医师','主任医师','教授','院长']},
 {node:'2294:7016',text:'2294:7017',key:'experience',label:'经验标签',options:['10-20年','20年以上']},
 {node:'2294:7021',text:'2294:7022',key:'background',label:'机构背景',options:['口腔专科','公立三甲']},
 {node:'2294:7026',text:'2294:7027',key:'language',label:'语言能力',options:['English','Русский','中文']},
 {node:'2294:7031',text:'2294:7032',key:'price',label:'价格区间',options:['¥10,000 以下','¥10,000-30,000']},
] as const
