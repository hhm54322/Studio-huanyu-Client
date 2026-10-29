const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const source = path.join(root, 'docs/figma-source/home/experts')
const output = path.join(source, 'dialog-sources-2026-10-19.json')
const records = {}

for (const folder of fs.readdirSync(source).sort()) {
  const directory = path.join(source, folder)
  const modelPath = path.join(directory, 'dialog-model-2026-10-19.json')
  const treePath = path.join(directory, 'source-tree-2026-10-19.json')
  if (!fs.existsSync(modelPath) || !fs.existsSync(treePath)) continue
  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'))
  const tree = JSON.parse(fs.readFileSync(treePath, 'utf8')).root
  const walk = node => {
    if (node.id === model.panel) return node
    for (const child of node.children || []) {
      const hit = walk(child)
      if (hit) return hit
    }
    return undefined
  }
  const panel = walk(tree)
  if (!panel) throw new Error(`${folder}: missing panel ${model.panel}`)
  records[folder] = { ...model, root: panel }
}

fs.writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2) + '\n')
console.log(`Generated ${Object.keys(records).length} expert dialog sources at ${output}`)
