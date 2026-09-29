const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { inflateRawSync } = require('node:zlib')

const args = process.argv.slice(2)
const discoverOnly = args.includes('--discover')
const positional = args.filter((arg) => arg !== '--discover')
const [file, frameId, destination, dependencyDirectory] = positional
if (!file || !frameId || !destination || !dependencyDirectory) {
  throw new Error('Usage: node scripts/extract-figma-native.cjs <file.fig> <frame-id> <output-dir> <parser-node_modules> [--discover]')
}
const UZIP = require(path.join(dependencyDirectory, 'uzip'))
const { decompress } = require(path.join(dependencyDirectory, 'fzstd'))
const { ByteBuffer, compileSchema, decodeBinarySchema } = require(path.join(dependencyDirectory, 'kiwi-schema'))
const bytes = fs.readFileSync(file)
const archive = UZIP.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
const canvas = archive['canvas.fig']
if (!canvas || Buffer.from(canvas.subarray(0, 8)).toString() !== 'fig-kiwi') throw new Error('Missing fig-kiwi canvas')
const view = new DataView(canvas.buffer, canvas.byteOffset, canvas.byteLength)
const chunks = []
for (let offset = 12; offset < canvas.length;) {
  const size = view.getUint32(offset, true)
  offset += 4
  if (!size || offset + size > canvas.length) throw new Error('Invalid Kiwi chunk length')
  const chunk = canvas.subarray(offset, offset + size)
  chunks.push(chunk[0] === 0x28 && chunk[1] === 0xb5 ? decompress(chunk) : inflateRawSync(chunk))
  offset += size
}
const schema = decodeBinarySchema(new ByteBuffer(chunks[0]))
const message = compileSchema(schema).decodeMessage(new ByteBuffer(chunks[1]))
const id = (guid) => guid ? `${guid.sessionID}:${guid.localID}` : null
const nodes = new Map(message.nodeChanges.map((node) => [id(node.guid), node]))
const children = new Map()
for (const node of nodes.values()) {
  const parent = id(node.parentIndex?.guid)
  if (!children.has(parent)) children.set(parent, [])
  children.get(parent).push(node)
}
for (const list of children.values()) list.sort((a, b) => a.parentIndex.position < b.parentIndex.position ? -1 : a.parentIndex.position > b.parentIndex.position ? 1 : 0)
const inventory = []
const parameters = []
const imageAssets = []
function walk(node, level = 0, parentNodeId = null, siblingOrder = 0, visible = true, position = { x: 0, y: 0 }, hiddenBy = null) {
  if (!node) throw new Error(`Missing frame ${frameId}`)
  const nodeId = id(node.guid)
  const ownVisible = node.visible !== false
  hiddenBy = hiddenBy || (!ownVisible ? nodeId : null)
  visible = visible && ownVisible
  const framePosition = level === 0 ? { x: 0, y: 0 } : { x: position.x + (node.transform?.m02 || 0), y: position.y + (node.transform?.m12 || 0) }
  const descendants = children.get(nodeId) || []
  inventory.push({ id: nodeId, index: inventory.length, level, name: node.name, type: node.type, parentNodeId, siblingOrder, visible: ownVisible, rendered: visible, hiddenBy, children: descendants.map((child) => id(child.guid)) })
  const raw = { ...node }
  // Preserve the authored styles and text layout, not thousands of font-outline blobs.
  if (raw.derivedTextData) raw.derivedTextData = { ...raw.derivedTextData, glyphs: undefined }
  parameters.push({ nodeId, framePosition, parameters: raw })
  for (const paint of node.fillPaints || []) {
    if (paint.type !== 'IMAGE' || !paint.image?.hash) continue
    const hash = Buffer.from(paint.image.hash).toString('hex')
    const image = archive[`images/${hash}`]
    if (!image) throw new Error(`Missing image ${hash} for ${nodeId}`)
    imageAssets.push({ nodeId, imageHash: hash, sha256: createHash('sha256').update(image).digest('hex'), rendered: visible && paint.visible !== false, paint })
  }
  descendants.forEach((child, index) => walk(child, level + 1, nodeId, index, visible, framePosition, hiddenBy))
}
walk(nodes.get(frameId))
const previousPath = path.join(destination, 'layers-2026-09-29.json')
const legacyLayersPath = path.join(destination, 'layers.csv')
let previous = fs.existsSync(previousPath) ? JSON.parse(fs.readFileSync(previousPath)).nodes : null
if (!previous && fs.existsSync(legacyLayersPath)) {
  const siblingCounts = new Map()
  previous = fs.readFileSync(legacyLayersPath, 'utf8').trim().split('\n').slice(1).map((line) => {
    const row = line.match(/^(\d+),([^,]+),([^,]*),(\d+),"((?:[^"]|"")*)"\r?$/)
    if (!row) throw new Error(`Invalid Layers CSV row: ${line}`)
    const parentNodeId = row[3] || null
    const siblingOrder = siblingCounts.get(parentNodeId) || 0
    siblingCounts.set(parentNodeId, siblingOrder + 1)
    return { id: row[2], parentNodeId, siblingOrder, name: row[5].replace(/""/g, '"') }
  })
}
if (!previous && !discoverOnly) {
  throw new Error(`Missing Layers cross-check file: ${previousPath}. Use --discover only for an explicitly provisional native export.`)
}
const mismatch = []
if (previous) {
  const previousIds = new Set(previous.map((node) => node.id))
  for (const node of inventory) {
    const old = previous.find((item) => item.id === node.id)
    if (!old || old.parentNodeId !== node.parentNodeId || old.siblingOrder !== node.siblingOrder || (old.name && old.name !== node.name)) mismatch.push({ nodeId: node.id, expected: old, actual: node })
  }
  for (const node of previous) if (!inventory.some((item) => item.id === node.id)) mismatch.push({ missingNodeId: node.id })
  if (inventory.length !== previousIds.size || mismatch.length) throw new Error(`Layers/native mismatch: ${JSON.stringify(mismatch.slice(0, 4))}`)
}
fs.mkdirSync(destination, { recursive: true })
function save(name, value) { fs.writeFileSync(path.join(destination, name), JSON.stringify(value, (_, val) => ArrayBuffer.isView(val) ? Array.from(val) : val, 2) + '\n') }
const metadata = {
  sourceFrame: frameId,
  sourceFile: path.resolve(file),
  sourceSHA256: createHash('sha256').update(bytes).digest('hex'),
  exportedAt: JSON.parse(Buffer.from(archive['meta.json']).toString()).exported_at,
  source: previous ? 'Figma native Kiwi document; complete Layers cross-check' : 'Figma native Kiwi document; provisional discover export; Layers cross-check pending',
  nodeCount: inventory.length,
  layersCrossCheck: Boolean(previous),
}
save('native-inventory-2026-09-29.json', { ...metadata, nodes: inventory })
save('native-parameters-2026-09-29.json', { ...metadata, nodes: parameters })
save('native-image-paints-2026-09-29.json', { ...metadata, assets: imageAssets })
console.log(JSON.stringify({ ...metadata, visible: inventory.filter((node) => node.rendered).length, hidden: inventory.filter((node) => !node.rendered).length, imageAssets: imageAssets.length, layersMismatch: previous ? mismatch.length : null }, null, 2))
