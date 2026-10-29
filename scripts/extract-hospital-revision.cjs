const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const root = path.resolve(__dirname, '..')
const directory = path.join(root, 'docs/figma-source/hospitals')
const date = '2026-10-20'
const sets = [
  ['desktop', '144:4707', '.'],
  ['mobile', '1620:581', 'list-mobile'],
  ['detail-desktop', '1487:5', 'detail-desktop'],
  ['menu-desktop', '1487:119', 'menu-desktop'],
  ...['1487:232','1487:412','1487:572','1487:717','1487:883','1487:1037'].map((id,i)=>[`section-desktop-${i+1}`,id,`section-desktop-${i+1}`]),
  ['detail-mobile-all', '1626:277', 'detail-mobile-all'],
  ['detail-mobile', '1626:402', 'detail-mobile'],
  ['detail-mobile-scroll', '1626:476', 'detail-mobile-scroll'],
  ['yaoying-mobile', '1620:1878', 'yaoying-mobile'],
  ['menu-mobile', '1620:2024', 'menu-mobile'],
  ['menu-mobile-scroll', '1620:2126', 'menu-mobile-scroll'],
  ...['1620:1165','1620:1309','1620:1428','1620:1534','1620:1661','1620:1777'].map((id,i)=>[`section-mobile-${i+1}`,id,`section-mobile-${i+1}`]),
]
const source = '/Users/hhm/Downloads/寰宇云医 (2).fig'
const parser = path.resolve(root, '../tmp/figma-change-audit/node_modules')
for (const [name, id, folder] of sets) {
  const target = path.join(directory, folder)
  const file = path.join(target, `native-inventory-${date}.json`)
  if (!fs.existsSync(file) || JSON.parse(fs.readFileSync(file)).sourceFile !== source) {
    execFileSync(process.execPath, [path.join(__dirname,'extract-figma-native.cjs'),source,id,target,parser,'--discover','--date',date], { stdio:'pipe' })
  }
  const inventory = JSON.parse(fs.readFileSync(file))
  console.log(JSON.stringify({name,folder,sourceFrame:id,nodeCount:inventory.nodeCount,sourceSHA256:inventory.sourceSHA256}))
}
fs.writeFileSync(path.join(directory,`sources-${date}.json`),JSON.stringify({date,source,sets:sets.map(([name,sourceFrame,folder])=>({name,sourceFrame,folder}))},null,2)+'\n')
