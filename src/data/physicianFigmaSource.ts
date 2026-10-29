import source from '../../docs/figma-source/physicians/revision-2026-10-29/source-tree-2026-10-29.json'
import type { HomeSourceNodeData as SourceNode, HomeSourceAction } from '@/components/common/HomeSourceNode.vue'

export const physicianRoot = source.root as SourceNode
export const physicianDescendants = (node:SourceNode):SourceNode[] => [node, ...node.children.flatMap(physicianDescendants)]
export const physicianNodes = new Map(physicianDescendants(physicianRoot).map(node => [node.id, node]))
export const physicianNode = (id:string) => physicianNodes.get(id)!
export const physicianFilters = physicianNode('1689:4839').children.map(node => ({ id:node.id, text:physicianDescendants(node).filter(n=>n.type==='TEXT').map(n=>n.text).join('') }))
export const physicianCards = [
  { id:'1741:5785', name:'谭兆林', filter:1, expert:-1 },
  { id:'2324:8478', name:'徐宇', filter:4, expert:0 },
  { id:'1741:5817', name:'周莉莉', filter:3, expert:1 },
  { id:'1741:5843', name:'柳光宇', filter:5, expert:2 },
  { id:'1741:5869', name:'陈疾忤', filter:2, expert:3 },
]
export const physicianActions:Record<string,HomeSourceAction> = {}
const link = (id:string,href:string) => {physicianActions[id]={href}}
const action = (id:string,action:string,label?:string) => {physicianActions[id]={action,label}}
for(const [id,href] of [
  ['1689:5319','/'],['1689:5394','/'],['1689:5406','/'],['1689:5408','/why-china'],['1689:5410','/trust'],
  ['1689:5412','/diseases-technologies'],['1689:5414','/dental'],['1689:5418','/cases'],['1689:5420','/insurance'],['1689:5422','/about'],
  ['1732:5717','/hospitals'],['1732:5719','/doctors'],['1689:5333','/diseases-technologies'],['1689:5335','/cost'],['1689:5337','/report'],
  ['1689:5341','/steps'],['1689:5347','/cases'],['1689:5349','/insurance'],['1689:5351','/steps'],['1689:5353','/about'],
  ['1689:5363','mailto:contact@huanyuyunyi.com'],['1689:5368','tel:+864008886688'],['1689:5373','https://wa.me/864008886688'],
] as const)link(id,href)
action('1689:5401','consultation','问阿宁')
action('1689:5425','language','选择语言')
action('1689:5416','hospital-menu','中国医院')
physicianFilters.forEach((node,index)=>action(node.id,`filter:${index}`,node.text))
physicianCards.forEach(card=>action(card.id,`doctor:${card.expert}`,`查看${card.name}详情`))

export function filteredPhysicianSource(filter:number):SourceNode {
  if(filter===0)return physicianRoot
  const cards=physicianCards.filter(card=>card.filter===filter)
  const grid=physicianNode('1741:5784')
  const template=grid.children[0]!
  const columns=3,gap=24,padding=48
  const rows=Math.ceil(cards.length/columns)
  const gridHeight=padding+rows*template.height+Math.max(0,rows-1)*gap
  const offset=gridHeight-grid.height
  const visit=(node:SourceNode):SourceNode=>{
    const result={...node,children:node.children.map(visit)}
    if(['1689:4814','1689:4815','1689:4816','1689:4838'].includes(node.id)){result.height+=offset;result.css+=`;height:${result.height}px;`}
    if(node.id==='1689:5315'){result.y+=offset;result.css+=`;top:${result.y}px;`}
    if(node.id===grid.id){
      result.height=gridHeight;result.css+=`;height:${gridHeight}px;`
      result.children=cards.map((card,index)=>{const original=physicianNode(card.id);const x=index%columns*(template.width+gap),y=padding+Math.floor(index/columns)*(template.height+gap);return {...original,x,y,css:original.css+`;left:${x}px;top:${y}px;`}})
    }
    return result
  }
  return visit(physicianRoot)
}
