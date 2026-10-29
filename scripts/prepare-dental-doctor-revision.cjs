const fs=require('node:fs')
const path=require('node:path')
const root=path.resolve(__dirname,'..'),date='2026-10-20'
const directory=path.join(root,'docs/figma-source/doctors')
const sources=[['profile','231:1292'],['cases','231:1355'],['reviews','231:1421']]
fs.mkdirSync(directory,{recursive:true})
for(const [name] of sources){
  const target=path.join(directory,`dental-${name}`)
  fs.mkdirSync(target,{recursive:true})
  for(const type of ['native-inventory','native-parameters','native-image-paints']){
    const filename=`${type}-${date}.json`
    fs.copyFileSync(path.join(root,`artifacts/figma-doctors-${date}/native-current/dental-${name}`,filename),path.join(target,filename))
  }
}
fs.writeFileSync(path.join(directory,`sources-${date}.json`),JSON.stringify({date,mobile:'Deferred by user; desktop source sets only',sets:sources.map(([name,sourceFrame])=>({name:`dental-${name}`,folder:`dental-${name}`,sourceFrame,expert:`dental-${name}`}))},null,2)+'\n')
const selected=path.join(directory,`selected-image-exports-${date}.json`)
if(!fs.existsSync(selected))fs.writeFileSync(selected,JSON.stringify({exports:[]},null,2)+'\n')
console.log('Prepared three native desktop source sets; UI Layers/Dev Mode copy required before build')
