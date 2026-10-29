const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { execFileSync } = require('node:child_process')

const root = path.resolve(__dirname, '..')
const date = '2026-10-20'
const currentFile = '/Users/hhm/Downloads/寰宇云医 (2).fig'
const sha = createHash('sha256').update(fs.readFileSync(currentFile)).digest('hex')
const output = path.join(root, `artifacts/figma-doctors-${date}/native-current`)
const experts = path.join(root, 'docs/figma-source/home/experts')
const sources = fs.readdirSync(experts).filter(name => !name.includes('mobile') && fs.statSync(path.join(experts, name)).isDirectory()).map(name => ({ name, directory: path.join(experts, name), date: '2026-10-19' }))
for (const [name, folder] of [['dental-profile', 'profile-state'], ['dental-cases', 'cases-state'], ['dental-reviews', 'reviews-state']]) sources.push({ name, directory: path.join(root, 'docs/figma-source/dental', folder), date: '2026-09-29' })
const read = (directory, name, suffix) => JSON.parse(fs.readFileSync(path.join(directory, `${name}-${suffix}.json`)))
const normalized = (value, isRoot = false) => {
  if (Array.isArray(value)) return value.map(item => normalized(item))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().filter(key => key !== 'exportSettings' && key !== 'guid' && key !== 'parentIndex' && !(isRoot && key === 'transform')).map(key => [key, normalized(value[key])]))
}
const results = []
for (const source of sources) {
  const previous = read(source.directory, 'native-inventory', source.date)
  const target = path.join(output, source.name)
  const current = path.join(target, `native-inventory-${date}.json`)
  if (!fs.existsSync(current) || JSON.parse(fs.readFileSync(current)).sourceSHA256 !== sha) execFileSync(process.execPath, [path.join(__dirname, 'extract-figma-native.cjs'), currentFile, previous.sourceFrame, target, path.resolve(root, '../tmp/figma-change-audit/node_modules'), '--discover', '--date', date], { stdio: 'pipe' })
  const latest = read(target, 'native-inventory', date)
  const oldParameters = read(source.directory, 'native-parameters', source.date)
  const newParameters = read(target, 'native-parameters', date)
  const latestById = new Map(newParameters.nodes.map(node => [node.nodeId, node.parameters]))
  const changes = []
  if (JSON.stringify(previous.nodes) !== JSON.stringify(latest.nodes)) changes.push({ field: 'Layers hierarchy/order/visibility' })
  for (const node of oldParameters.nodes) {
    const before = normalized(node.parameters, node.nodeId === previous.sourceFrame)
    const after = normalized(latestById.get(node.nodeId), node.nodeId === previous.sourceFrame)
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      const fields = [...new Set([...Object.keys(before), ...Object.keys(after || {})])].filter(key => JSON.stringify(before[key]) !== JSON.stringify(after?.[key]))
      changes.push({ nodeId: node.nodeId, fields })
    }
  }
  const result = { name: source.name, frame: previous.sourceFrame, previousSHA256: previous.sourceSHA256, sourceSHA256: sha, nodes: latest.nodeCount, changes }
  results.push(result)
  console.log(JSON.stringify(result))
}
fs.mkdirSync(output, { recursive: true })
fs.writeFileSync(path.join(output, '../revision-check.json'), JSON.stringify({ checkedAt: new Date().toISOString(), currentFile, sourceSHA256: sha, mobile: 'Deferred by user; desktop sources only', results }, null, 2) + '\n')
