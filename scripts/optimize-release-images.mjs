import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve('public/images')
async function files(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await files(file))
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name) && !entry.name.endsWith('.optimized.webp')) result.push(file)
  }
  return result
}
const records = []
// One decoder at a time keeps large source exports from exhausting memory.
for (const file of await files(root)) {
  const original = await readFile(file)
  const metadata = await sharp(original).metadata()
  if (metadata.pages > 1 || /partners-(track|matrix)\.webp$/.test(file)) continue
  let image = sharp(original)
  if (!metadata.hasAlpha && Math.max(metadata.width, metadata.height) > 2560) {
    image = image.resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
  }
  // These 534px institution crops are already the displayed Figma image
  // exports. Preserve their pixels instead of adding a second lossy pass.
  const lossless = /dental-revision\/selected-image-2294-(?:774[3-9]|7750)\.png$/.test(file)
  const { data, info } = await image.webp({ quality: 90, alphaQuality: 100, effort: 6, lossless }).toBuffer({ resolveWithObject: true })
  if (data.length >= original.length * 0.9) continue
  await writeFile(`${file}.optimized.webp`, data)
  records.push({ source: `/images/${path.relative(root, file).split(path.sep).join('/')}`, optimizedSource: `/images/${path.relative(root, file).split(path.sep).join('/')}.optimized.webp`, originalBytes: original.length, optimizedBytes: data.length, originalWidth: metadata.width, originalHeight: metadata.height, width: info.width, height: info.height, ...(lossless ? { lossless: true } : {}) })
}
await writeFile('public/image-optimization.json', JSON.stringify({ quality: 90, maxPhotoDimension: 2560, images: records }, null, 2) + '\n')
const before = records.reduce((sum, item) => sum + item.originalBytes, 0)
const after = records.reduce((sum, item) => sum + item.optimizedBytes, 0)
console.log(`Images: ${records.length} optimized, ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB. Originals retained for non-WebP clients.`)
