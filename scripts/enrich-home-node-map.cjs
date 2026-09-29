const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const source = path.resolve(__dirname, '../docs/figma-source/home')
const mapPath = path.join(source, 'node-to-code-2026-09-29.json')
const normalize = (value) => value.replace(/[\s“”"']/g, '').toLowerCase()
const generic = /^(?:Body|Main Content|Section|Footer|Header|Navigation|Container(?::margin)?|Frame(?: \d+)?|Heading \d|Paragraph|Text|Button|Tab(?: List| Panel)?|List Item(?::margin)?|List|Icon|Vector(?: \(Stroke\))?|Group(?: \d+)?|Image(?: \(.+\))?|image \d+|Link(?::margin)?|Rectangle \d+|Ellipse \d+)$/

async function main() {
  const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
    const candidates = await page.evaluate(() => {
      const selector = (element) => {
        const parts = []
        for (let current = element; current && current !== document.body; current = current.parentElement) {
          const root = ['home-page', 'patient-footer', 'patient-header'].find((name) => current.classList.contains(name))
          if (root) { parts.unshift(`.${root}`); break }
          const siblings = [...current.parentElement.children].filter((child) => child.tagName === current.tagName)
          parts.unshift(`${current.tagName.toLowerCase()}:nth-of-type(${siblings.indexOf(current) + 1})`)
        }
        return parts.join(' > ')
      }
      return [...document.querySelectorAll('.home-page *, .patient-footer *, .patient-header *')].map((element) => ({
        text: [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join('').trim(),
        selector: selector(element),
        section: element.closest('section')?.className || (element.closest('footer') ? 'patient-footer' : 'patient-header'),
      })).filter((item) => item.text)
    })
    const used = new Set()
    let exact = 0
    const unmatched = []
    for (const node of mapping.nodes) {
      if (node.visibility === 'hidden' || generic.test(node.layerName) || !node.layerName.trim() || node.nodeId === '143:45' || node.nodeId === '143:52' || node.selector.includes('chart-canvas')) continue
      const section = node.selector.match(/\.([\w-]+)/)?.[1]
      let index = candidates.findIndex((candidate, index) => !used.has(index) && candidate.section === section && normalize(candidate.text) === normalize(node.layerName))
      if (index < 0) index = candidates.findIndex((candidate, index) => !used.has(index) && normalize(candidate.text) === normalize(node.layerName))
      if (index < 0) { unmatched.push({ nodeId: node.nodeId, layerName: node.layerName, section }); continue }
      used.add(index)
      node.selector = candidates[index].selector
      node.implementation = 'Exact source text to Vue DOM element'
      exact++
    }
    mapping.textMapping = { exact, unmatched }
    fs.writeFileSync(mapPath, JSON.stringify(mapping, null, 2) + '\n')
    const lockPath = path.join(source, 'baseline-lock-2026-09-29.json')
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
    lock.files.find((file) => file.name === path.basename(mapPath)).sha256 = createHash('sha256').update(fs.readFileSync(mapPath)).digest('hex')
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n')
    console.log(JSON.stringify({ exactTextMappings: exact, unmatchedTextNodes: unmatched.length, sample: unmatched.slice(0, 25) }, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
