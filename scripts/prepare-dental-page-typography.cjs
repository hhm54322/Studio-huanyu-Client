// Supplement the immutable baseline with the native CJK glyph positions.
// Chrome and Figma shape punctuation differently even with the same font.
const fs=require('node:fs'),assert=require('node:assert/strict')
const root=require('node:path').resolve(__dirname,'..')
const base=root+'/docs/figma-source/dental-pages-2026-11-03'
const native=JSON.parse(fs.readFileSync(base+'/profile/native-parameters-2026-11-03.json'))
const tree=JSON.parse(fs.readFileSync(base+'/profile/source-tree-2026-11-03.json'))
const all=n=>[n,...n.children.flatMap(all)]
const id='3421:2624',p=native.nodes.find(n=>n.nodeId===id).parameters
const source=all(tree.root).find(n=>n.id===id)
const positions=p.derivedTextData.logicalIndexToCharacterOffsetMap
assert.equal(source.text,p.textData.characters)
assert.equal(source.textLines.length,p.derivedTextData.baselines.length)
const textLines=p.derivedTextData.baselines.map((line,index)=>({
  ...source.textLines[index],
  runs:Array.from(p.textData.characters.slice(line.firstCharacter,line.endCharacter)).map((text,offset)=>({
    text,css:`position:absolute;left:${positions[line.firstCharacter+offset]-line.position.x}px;top:0;`,
  })),
}))
const inventory=JSON.parse(fs.readFileSync(base+'/profile/native-inventory-2026-11-03.json'))
fs.writeFileSync(base+'/profile/text-layout-2026-11-03.json',JSON.stringify({nodeId:id,sourceSHA256:inventory.sourceSHA256,text:source.text,textLines},null,2)+'\n')
