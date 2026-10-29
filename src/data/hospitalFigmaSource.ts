import type { HomeSourceNodeData as SourceNode, HomeSourceAction } from '@/components/common/HomeSourceNode.vue'
import { hospitals, type Hospital } from './hospitals'

type SourceFile = { sourceFrame:string; sourceSHA256:string; root:SourceNode }
const files = import.meta.glob('../../docs/figma-source/hospitals/**/source-tree-2026-10-20.json', { eager:true, import:'default' }) as Record<string,SourceFile>
export const hospitalSources:Record<string,SourceFile> = {}
export const hospitalNodes = new Map<string,SourceNode>()
export const hospitalParents = new Map<string,SourceNode>()
export function descendants(node:SourceNode):SourceNode[] { return [node,...node.children.flatMap(descendants)] }
for (const [path,source] of Object.entries(files)) {
  const folder = path.replace('../../docs/figma-source/hospitals/','').split('/')
  hospitalSources[folder.length===1?'desktop':folder[0]!] = source
  function index(node:SourceNode) {
    hospitalNodes.set(node.id,node)
    node.children.forEach(child=>{ hospitalParents.set(child.id,node); index(child) })
  }
  index(source.root)
}
export const hospitalNode = (id:string) => hospitalNodes.get(id)!
export const hospitalText = (node:SourceNode) => descendants(node).filter(n=>n.type==='TEXT').map(n=>n.text).join('')
export const hospitalActions:Record<string,HomeSourceAction> = {}
const action=(ids:string[],value:string,label?:string)=>ids.forEach(id=>{hospitalActions[id]={action:value,label}})
const link=(ids:string[],href:string)=>ids.forEach(id=>{hospitalActions[id]={href}})
action(['484:1558'],'consultation','问阿宁')
action(['484:1582'],'language','选择语言')
action(['1620:589'],'menu','打开导航')
link(['484:1551','1620:584','144:5158'],'/')
const nav=['/','/why-china','/trust','/diseases-technologies','/dental','/hospitals','/cases','/insurance','/about']
nav.forEach((href,i)=>link([`484:${1563+i*2}`],href))
link(['1741:5735'],'/hospitals')
link(['1741:5733'],'/doctors')
const footer=[
  [['144:5172','1620:1088'],'/diseases-technologies'],[['144:5174','1620:1089'],'/cost'],
  [['144:5176','1620:1090'],'/report'],[['144:5180','144:5190','1620:1092','1620:1099'],'/steps'],
  [['144:5186','1620:1097'],'/cases'],[['144:5188','1620:1098'],'/insurance'],
  [['144:5192','1620:1100'],'/about'],[['144:5202','1620:1110'],'mailto:contact@huanyuyunyi.com'],
  [['144:5207','1620:1115'],'tel:+864008886688'],[['144:5212','1620:1120'],'https://wa.me/864008886688'],
] as const
footer.forEach(([ids,href])=>link([...ids],href))

export const hospitalCities=['全部','北京','上海','广州','深圳']
export const hospitalCityNodes={desktop:['144:4733','144:4736','144:4739','144:4742','144:4745'],mobile:['1620:602','1620:605','1620:608','1620:611','1620:614']}
Object.values(hospitalCityNodes).forEach(ids=>ids.forEach((id,index)=>action([id],`city:${hospitalCities[index]}`)))

export type HospitalCardSource = {node:SourceNode;name:string;title:SourceNode;photo:SourceNode;detail:string;consult:string}
function cards(gridId:string):HospitalCardSource[] {
  return hospitalNode(gridId).children.map(node=>{
    const body=node.children[1]!
    const title=descendants(body.children[0]!).find(n=>n.type==='TEXT')!
    const nodes=descendants(node)
    const detail=nodes.find(n=>n.name==='Button'&&hospitalText(n)==='查看详情')!
    const consult=nodes.find(n=>n.name==='Button'&&hospitalText(n)==='预约咨询')!
    const photo=descendants(node.children[0]!).find(n=>n.name.startsWith('Image ('))!
    action([detail.id],`hospital:${title.text}`,`查看${title.text}详情`)
    action([consult.id],'consultation',`预约${title.text}咨询`)
    return {node,name:title.text,title,photo,detail:detail.id,consult:consult.id}
  })
}
export const hospitalCards={desktop:cards('144:4748'),mobile:cards('1620:617')}

// The authored directory is the resting Figma state. Once a user applies a
// city filter, retain the existing full directory data and reuse the locked
// card hierarchy instead of silently discarding hospitals outside that frame.
export const hospitalRecords:Hospital[]=[...hospitals,{
  id:52,name:'上海曜影医院',nameEn:'Shanghai SinoUnited Hospital',city:'上海',cityEn:'Shanghai',
  type:'综合医院',typeEn:'General Hospital',jci:false,established:2022,beds:40,departments:30,
  image:descendants(hospitalCards.desktop.find(card=>card.name==='上海曜影医院')!.photo).find(node=>node.css.includes('url('))!.css.match(/url\(([^)]+)\)/)![1]!,
  intro:'以上海为总部、长三角多点布局的高品质医疗连锁机构。核心团队由国内外资深医生组成，坚持以患者为中心，提供可靠的就诊体验与个性化照护。',introEn:'',
  specialties:['综合医院','Mayo Clinic 合作','国际保险直付'],specialtiesEn:[],deptList:[],deptListEn:[],
  services:['多语种医疗服务','国际保险直付','24h急诊住院'],servicesEn:[],equipments:[],equipmentsEn:[],
  website:'https://www.sinounitedhealth.com/',wiki:'',
}]
export function hospitalRecord(name:string) {
  return hospitalRecords.find(item=>item.name===name||name==='北医三院'&&item.id===6)
}
export function filteredHospitalSource(city:string) {
  const records=hospitalRecords.filter(item=>city==='全部'||item.city===city)
  const extraActions:Record<string,HomeSourceAction>={}
  const template=hospitalCards.desktop[0]!
  const replaceText=(node:SourceNode,text:string)=>{
    node.text=text;delete node.textRuns;delete node.textParagraphs;delete node.textLines
    node.css+=';width:100%;';node.layoutCss+=';width:100%;'
  }
  const cardNodes=records.map((item,index)=>{
    const original=hospitalCards.desktop.find(card=>hospitalRecord(card.name)?.id===item.id)
    const base=original||template
    const card=structuredClone(base.node)
    const nodes=descendants(card)
    const get=(id:string)=>nodes.find(node=>node.id===id)!
    const title=get(base.title.id)
    replaceText(title,original?base.name:item.name)
    // Runtime records can have longer official names than the authored sample.
    // Keep the source title geometry; expose the full name through title/ARIA
    // and the detail panel rather than allowing clipped text outside the card.
    title.css+=';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
    if(!original) {
      const image=get(base.photo.id)
      image.css+=`;background:url(${item.image}) center / cover no-repeat;`
      const textNodes=nodes.filter(node=>node.type==='TEXT')
      for(const node of textNodes){
        if(node.text==='北京')replaceText(node,item.city)
        if(node.text==='三甲/公立')replaceText(node,item.type)
        if(node.text==='1921')replaceText(node,String(item.established))
        if(node.text==='2000床')replaceText(node,`${item.beds}床`)
        if(node.text==='56科室')replaceText(node,`${item.departments}科室`)
      }
      if(!item.jci){
        get('144:4753').visible=false
        get('144:4758').css+=';left:0;'
      }
      const tagRow=get('144:4768')
      tagRow.css+=';display:flex;gap:8px;padding:12px 0 0;width:341.33334px;overflow:hidden;'
      tagRow.children.forEach((tag,i)=>{
        tag.visible=Boolean(item.specialties[i])
        tag.css+=';position:relative;left:0;top:0;width:auto;flex:none;display:flex;align-items:center;padding:4px 8px;'
        const text=descendants(tag).find(n=>n.type==='TEXT')!
        replaceText(text,item.specialties[i]||'')
        text.css+=';position:relative;left:0;top:0;width:auto;'
      })
    }
    if(item.id===52)nodes.filter(node=>node.text==='北京').forEach(node=>replaceText(node,'上海'))
    const x=(index%3)*(template.node.width+24),y=48+Math.floor(index/3)*(template.node.height+24)
    card.x=x;card.y=y;card.css+=`;left:${x}px;top:${y}px;`
    const detail=get(base.detail),consult=get(base.consult)
    for(const node of nodes)node.id+=`::hospital-${item.id}`
    extraActions[detail.id]={action:`hospital:${item.name}`,label:`查看${item.name}详情`}
    extraActions[consult.id]={action:'consultation',label:`预约${item.name}咨询`}
    return card
  })
  const rows=Math.ceil(cardNodes.length/3)
  const gridHeight=48+rows*398+Math.max(0,rows-1)*24
  const directoryHeight=96+42+gridHeight+96
  const mainHeight=460+directoryHeight
  const totalHeight=mainHeight+456
  const visit=(node:SourceNode):SourceNode=>{
    const clone={...node,children:node.children.map(visit)}
    const heights:Record<string,number>={'144:4707':totalHeight,'144:4708':totalHeight,'144:4709':mainHeight,'144:4731':directoryHeight,'144:4748':gridHeight}
    if(heights[node.id]!==undefined){clone.height=heights[node.id]!;clone.css+=`;height:${clone.height}px;`}
    if(node.id==='144:5154'){clone.y=mainHeight;clone.css+=`;top:${mainHeight}px;`}
    if(node.id==='144:4748')clone.children=cardNodes
    return clone
  }
  return {root:visit(hospitalSources.desktop!.root),actions:extraActions,records}
}

export function sourceAtOrigin(node:SourceNode):SourceNode {
  return {...node,x:0,y:0,css:node.css+';position:relative;left:0;top:0;',layoutCss:node.layoutCss+';position:relative;left:0;top:0;'}
}
