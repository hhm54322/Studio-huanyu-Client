const fs = require('node:fs')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const normalize = (value) => value.replace(/[\s“”"']/g, '').toLowerCase()
const firstFont = (value) => value.split(',')[0].replace(/["']/g, '').trim().toLowerCase()
const props = [
  ['font-family', 'fontFamily', firstFont],
  ['font-size', 'fontSize', (value) => value],
  ['font-weight', 'fontWeight', (value) => value],
  ['line-height', 'lineHeight', (value) => value],
  ['color', 'color', (value) => value.replace(/\s/g, '').toLowerCase()],
]

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    const source = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await source.setContent(fs.readFileSync('docs/figma-source/home/frame-2026-09-28.html', 'utf8'))
    const reference = await source.evaluate(() => [...document.body.firstElementChild.children[0].children[0].children].map((section) => [...section.querySelectorAll('*')].filter((el) => el.children.length === 0 && el.textContent.trim()).map((el) => ({
      text: el.textContent.trim(),
      declared: Object.fromEntries(['font-family', 'font-size', 'font-weight', 'line-height', 'color'].filter((key) => el.style.getPropertyValue(key)).map((key) => [key, el.style.getPropertyValue(key)])),
      computed: Object.fromEntries(['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color'].map((key) => [key, getComputedStyle(el)[key]])),
    }))))
    const local = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await local.emulateMedia({ reducedMotion: 'reduce' })
    await local.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
    const rendered = await local.evaluate(() => [...document.querySelectorAll('main section')].map((section) => [...section.querySelectorAll('*')].filter((el) => el.children.length === 0 && el.textContent.trim()).map((el) => ({
      text: el.textContent.trim(),
      computed: Object.fromEntries(['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color'].map((key) => [key, getComputedStyle(el)[key]])),
    }))))
    const differences = []
    for (const [sectionIndex, texts] of reference.entries()) {
      const matched = new Set()
      for (const item of texts) {
        const index = rendered[sectionIndex]?.findIndex((candidate, index) => !matched.has(index) && normalize(candidate.text) === normalize(item.text)) ?? -1
        if (index < 0) continue
        matched.add(index)
        const candidate = rendered[sectionIndex][index]
        for (const [sourceKey, localKey, format] of props) {
          if (!item.declared[sourceKey]) continue
          const expected = format(item.computed[localKey])
          const actual = format(candidate.computed[localKey])
          if (expected !== actual) differences.push({ section: sectionIndex + 1, text: item.text.slice(0, 45), property: sourceKey, expected, actual })
        }
      }
    }
    console.log(JSON.stringify({ matchedSections: Math.min(reference.length, rendered.length), differences: differences.slice(0, 120), totalDifferences: differences.length }, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
