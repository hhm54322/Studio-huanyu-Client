const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

const directory = path.resolve('artifacts/figma-regression-2026-10-23/home/production')
const target = path.join(directory, 'review')
const read = async name => JSON.parse(await fs.readFile(path.join(directory, name, 'qa.json'), 'utf8'))

async function sheets(name, rows) {
  const files = []
  for (let offset = 0; offset < rows.length; offset += 3) {
    const group = rows.slice(offset, offset + 3)
    const inputs = []
    let y = 0
    for (const row of group) {
      const reference = row.panelReference || row.reference
      const { width, height } = await sharp(reference).metadata()
      const previewWidth = Math.min(720, width / 2)
      const previewHeight = Math.round(height * previewWidth / width)
      const heading = Buffer.from(`<svg width="1440" height="32"><rect width="1440" height="32" fill="#e9eff8"/><text x="12" y="22" font-family="sans-serif" font-size="16" fill="#1e3a5f">${row.id || row.label || row.name} — Figma / Local — nMAE ${row.nMAE.toFixed(4)}%; pixelmatch ${row.pixelmatchPercent.toFixed(4)}%</text></svg>`)
      inputs.push({ input: heading, left: 0, top: y })
      for (const [index, file] of [reference, row.local].entries()) {
        inputs.push({ input: await sharp(file).resize({ width: previewWidth }).png().toBuffer(), left: index * 720, top: y + 32 })
      }
      y += previewHeight + 48
    }
    const file = path.join(target, `${name}-${Math.floor(offset / 3) + 1}.png`)
    await sharp({ create: { width: 1440, height: y, channels: 3, background: '#fff' } }).composite(inputs).png().toFile(file)
    files.push(file)
  }
  return files
}

async function main() {
  await fs.mkdir(target, { recursive: true })
  const [page, states, dialogs, experts] = await Promise.all(['page', 'states', 'dialogs', 'experts'].map(read))
  const files = []
  files.push(...await sheets('page', page.results[0].sections))
  files.push(...await sheets('states', states.results))
  files.push(...await sheets('dialogs', dialogs.results.filter(row => row.diff).map(row => ({ ...row.diff, name: `detail ${row.state}` }))))
  files.push(...await sheets('experts', experts.results.filter(row => row.diff).map(row => ({ ...row.diff, name: `${row.expert} ${row.tab}` }))))
  console.log(files.join('\n'))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
