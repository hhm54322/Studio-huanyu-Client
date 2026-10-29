import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const read = async (path) => readFile(new URL(path, root), 'utf8')
const layers = JSON.parse(await read('docs/figma-source/home/layers-2026-09-29.json'))
const css = JSON.parse(await read('docs/figma-source/home/native-css-2026-09-28.json'))
const devMode = JSON.parse(await read('docs/figma-source/home/dev-mode-2026-09-29.json'))
const baseline = JSON.parse(await read('docs/figma-source/home/aligned-baseline-2026-09-29.json'))
const assets = JSON.parse(await read('docs/figma-source/home/assets.json'))
const supplementalFrames = assets.supplementalFrames || []
const nodeMap = JSON.parse(await read('docs/figma-source/home/node-to-code-2026-09-29.json'))
const spec = await read('docs/figma-page-specs/home.md')
const mapped = new Set(nodeMap.nodes.filter((node) => node.visibility === 'hidden' || node.selector).map((node) => node.nodeId))
const exported = new Set(assets.assets.map((asset) => asset.nodeId))
const inlineStyled = new Set(baseline.sections.flatMap((section) => section.nodes.filter((node) => node.inlineStyle).map((node) => node.nodeId)))
const known = new Set([...layers.map((layer) => layer.id), ...supplementalFrames.flatMap((frame) => frame.assetNodeIds)])
const validDevMode = new Set(layers.filter((layer) => devMode[layer.id]?.name === layer.name && devMode[layer.id].id === layer.id && (layer.disabled || devMode[layer.id].verified)).map((layer) => layer.id))
const invalidDevMode = layers.filter((layer) => devMode[layer.id] && !validDevMode.has(layer.id))
const sections = []
let currentSection = 'page shell'

for (const layer of layers) {
  if (layer.level === 3 && layer.name === 'Section') currentSection = layer.id
  sections.push({ ...layer, section: currentSection })
}

const scope = process.argv.find((arg) => /^\d+:\d+$/.test(arg))
if (scope && !known.has(scope)) {
  console.error(`Unknown Figma node: ${scope}`)
  process.exit(2)
}

const selected = scope ? sections.filter((layer) => layer.section === scope || layer.id === scope) : sections
const missingCss = selected.filter((layer) => !validDevMode.has(layer.id) || (!layer.disabled && !devMode[layer.id].css?.length))
const missingMapping = selected.filter((layer) => !mapped.has(layer.id))
const invalidAssets = assets.assets.filter((asset) => !known.has(asset.nodeId))
const missingSupplementalBaselines = []
for (const frame of supplementalFrames) {
  for (const path of [frame.html, frame.textStyles]) {
    try {
      if (!(await read(path)).trim()) missingSupplementalBaselines.push(`${frame.nodeId} ${path} (empty)`)
    } catch {
      missingSupplementalBaselines.push(`${frame.nodeId} ${path} (missing)`)
    }
  }
  for (const nodeId of frame.assetNodeIds) {
    if (!exported.has(nodeId)) missingSupplementalBaselines.push(`${frame.nodeId} ${nodeId} (asset absent)`)
  }
}
const sample = (items) => items.slice(0, 20).map((layer) => `${layer.id} ${layer.name}`).join(', ')

console.log(`Home Figma source${scope ? ` (${scope})` : ''}: ${selected.length} Layers nodes, ${selected.length - missingCss.length} node-linked CSS/asset records, ${selected.length - missingMapping.length} specification mappings.`)
if (missingCss.length) console.error(`Missing source properties (${missingCss.length}): ${sample(missingCss)}`)
if (missingMapping.length) console.error(`Missing node-to-code mappings (${missingMapping.length}): ${sample(missingMapping)}`)
if (invalidDevMode.length) console.error(`Misattributed Dev Mode records (${invalidDevMode.length}): ${sample(invalidDevMode)}`)
if (invalidAssets.length) console.error(`Asset IDs absent from Layers: ${invalidAssets.map((asset) => asset.nodeId).join(', ')}`)
if (missingSupplementalBaselines.length) console.error(`Missing supplemental Banner source: ${missingSupplementalBaselines.join(', ')}`)
if (missingCss.length || missingMapping.length || invalidDevMode.length || invalidAssets.length || missingSupplementalBaselines.length) process.exitCode = 1

if (/Node ID: `1412:5682`/.test(spec)) await import('./audit-home-revision.mjs')
