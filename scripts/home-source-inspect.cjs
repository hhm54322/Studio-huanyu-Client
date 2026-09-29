const fs = require('node:fs')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(fs.readFileSync('docs/figma-source/home/frame-2026-09-28.html', 'utf8'), { waitUntil: 'domcontentloaded' })
  const source = await page.evaluate(() => {
    const root = document.body.firstElementChild
    const sections = [...root.children[0].children[0].children]
    return sections.map((el, section) => ({
      section: section + 1,
      style: el.getAttribute('style'),
      nodes: [...el.querySelectorAll('*')].map((node, index) => ({
        index,
        tag: node.tagName,
        text: node.children.length ? '' : node.textContent,
        style: node.getAttribute('style'),
        parent: [...el.querySelectorAll('*')].indexOf(node.parentElement),
      })),
    }))
  })
  console.log(JSON.stringify(source.filter(s => process.argv.slice(2).includes(String(s.section))), null, 2))
  await browser.close()
}
main().catch(error => { console.error(error); process.exitCode = 1 })
