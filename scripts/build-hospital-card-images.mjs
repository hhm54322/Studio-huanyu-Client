import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

/** Derivatives are only consumed by the desktop directory source. Full-size
 * detail assets and the locked Figma exports retain their original files. */
export async function buildHospitalCardImages() {
  const source = JSON.parse(await readFile('docs/figma-source/hospitals/source-tree-2026-10-20.json', 'utf8'))
  const nodes = node => [node, ...node.children.flatMap(nodes)]
  const grid = nodes(source.root).find(node => node.id === '144:4748')
  if (!grid) throw new Error('Hospital directory image owner is missing')
  const usages = new Map()
  for (const node of nodes(grid)) for (const [, url] of node.css.matchAll(/url\(["']?(\/images\/[^"')]+)["']?\)/g)) {
    if (!/\.(?:webp|png|jpe?g)$/.test(url)) continue
    const list = usages.get(url) || []
    list.push(node); usages.set(url, list)
  }
  const records = []
  for (const [url, owners] of usages) {
    const file = path.resolve('public', url.slice(1))
    const original = await readFile(file)
    const meta = await sharp(original).metadata()
    if (!meta.width || !meta.height || meta.pages > 1) continue
    // Account for the full authored image layer, including images positioned
    // outside a clipped card; the card's visible width alone can undersample it.
    const scale = Math.min(1, Math.max(...owners.map(node => Math.max(node.width / meta.width, node.height / meta.height) * 2)))
    if (scale >= .95) continue
    const width = Math.ceil(meta.width * scale)
    const { data, info } = await sharp(original).resize({ width, withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 }).toBuffer({ resolveWithObject: true })
    if (data.length >= original.length * .9) continue
    const optimizedSource = `${url}.card.optimized.webp`
    await writeFile(path.resolve('public', optimizedSource.slice(1)), data)
    records.push({ source: url, optimizedSource, originalBytes: original.length, optimizedBytes: data.length,
      originalWidth: meta.width, originalHeight: meta.height, width: info.width, height: info.height,
      sourceNodeIds: owners.map(node => node.id), pixelRatio: 2 })
  }
  return records
}
