import type { HomeSourceAction } from '@/components/common/HomeSourceNode.vue'

// Explicit source-node bindings. Content and geometry remain in the locked source tree.
export const homeFigmaActions: Record<string, HomeSourceAction> = {}
const link = (ids: string[], href: string, label?:string) => ids.forEach(id => { homeFigmaActions[id] = { href, label } })
const action = (ids:string[], value:string, label?:string) => ids.forEach(id => { homeFigmaActions[id] = { action:value, label } })

// Current desktop first-screen/header, copied from the October 28 source.
link(['2326:8518'], '/', '寰宇云医首页')
link(['1523:59'], '/cases')
action(['1523:84', '1523:119'], 'consultation')
action(['1523:110'], 'language', '选择语言')
action(['1523:95'], 'desktop-services', '医疗服务')
;['/', '/why-china', '/trust', '/dental', '/hospitals', '/cases', '/insurance', '/about'].forEach((href, i) => link([['1523:89','1523:91','1523:93','1523:99','1523:101','1523:103','1523:105','1523:107'][i]!], href))
link(['1524:29'], '/diseases-technologies', '专科诊疗')

link(['1412:5702', '1528:142'], '/cases')
action(['1412:5707'], 'hero:previous', '上一张')
action(['1412:5710'], 'hero:next', '下一张')
;['1412:5714','1412:5715','1412:5716','1412:5717'].forEach((id,i) => action([id],`hero:${i}`,`第${i+1}张`))
;['1412:5726','1412:5736','1412:5746','1412:5756'].forEach((id,i) => action([id,`1528:${153 + i * 7}`],`process:${i}`,`前往${['认知','评估','信任','行动'][i]}阶段`))
;['1412:5795','1412:5810','1412:5819','1412:5827','1412:5835','1412:5844'].forEach((id,i) => action([id, ...(['1528:194','1528:210'][i] ? [['1528:194','1528:210'][i]!] : [])],`why:${i}`))
action(['1412:5892', '1528:386'], 'story:detail', '查看患者故事')
;['1412:6028','1412:6037','1412:6046','1528:398','1528:405'].forEach(id => link([id],'/steps'))
;['1412:6321','1412:6329','1412:6336','1412:6343','1528:628','1528:635','1528:642','1528:649'].forEach(id => link([id],'/hospitals'))
;['1412:6419','1414:7095','1414:7128','1414:7161'].forEach((id,i) => action([id, ...(['1528:663','1528:695'][i] ? [['1528:663','1528:695'][i]!] : [])],`doctor:${i}`))
action(['1412:6643','1412:6651','1412:6791','1528:776','1528:785','1528:231'], 'consultation')
link(['1412:6647','1528:781','1528:235'],'/report')
link(['1528:311'],'/trust')
link(['1528:349'],'/diseases-technologies')
link(['1528:354'],'/cases')
link(['1528:326'],'/diseases-technologies')
link(['1528:338'],'/diseases-technologies')

// Shared header and footer use the same source-linked, real links on the home route.
link(['1412:6751','1528:118'],'/','寰宇云医首页')
action(['1412:6758'],'consultation')
action(['1412:6782'],'language','选择语言')
action(['1528:123'],'menu','打开导航')
const nav = ['/', '/why-china','/trust','/diseases-technologies','/dental','/hospitals','/cases','/insurance','/about']
nav.forEach((href,i) => link([`1412:${6763 + i * 2}`], href))
const footer = [
  [['1412:6689','1528:817'],'/diseases-technologies'],
  [['1412:6691','1528:818'],'/cost'],
  [['1412:6693','1528:819'],'/report'],
  [['1412:6697','1528:821','1412:6707','1528:828'],'/steps'],
  [['1412:6703','1528:826'],'/cases'],
  [['1412:6705','1528:827'],'/insurance'],
  [['1412:6709','1528:829'],'/about'],
  [['1412:6716','1528:836'],'mailto:contact@huanyuyunyi.com'],
  [['1412:6721','1528:841'],'tel:+864008886688'],
  [['1412:6726','1528:846'],'https://wa.me/864008886688'],
] as const
footer.forEach(([ids,href]) => link([...ids],href))
