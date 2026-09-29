const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const out = path.resolve('docs/figma-verification/dental/2026-09-29')
const checks = [];
(async () => {
  const browser = await chromium.launch({ headless: true })
  try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 }, deviceScaleFactor: 1 })
    await page.goto('http://127.0.0.1:5173/dental', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /02 城市与医生匹配/ }).click()
    await page.waitForTimeout(350)
    const matching = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth, cards: document.querySelectorAll('.dental-doctor-card').length, filters: document.querySelectorAll('.dental-filter-bar select').length }))
    if (width === 1440) await page.screenshot({ path: path.join(out, 'local-step2-1440.png'), fullPage: true })
    const opener = page.getByRole('button', { name: /了解更多/ }).first()
    await opener.click()
    await page.waitForTimeout(500)
    const open = await page.evaluate(() => ({ modal: Boolean(document.querySelector('.dental-doctor-modal')), overflow: document.body.style.overflow }))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    const closed = await page.evaluate(() => ({ modal: Boolean(document.querySelector('.dental-doctor-modal')), overflow: document.body.style.overflow }))
    await page.getByRole('button', { name: /03 上传影像资料/ }).click()
    await page.waitForTimeout(350)
    const upload = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth, dropzone: Boolean(document.querySelector('.dental-dropzone')), submit: Boolean(document.querySelector('.dental-submit')) }))
    if (width === 1440) await page.screenshot({ path: path.join(out, 'local-upload-1440.png'), fullPage: true })
    await page.getByRole('button', { name: /提交评估/ }).click()
    const emptyMessage = await page.locator('.dental-upload-status').innerText()
    checks.push({ width, matching, upload, modal: { open, closed }, emptyUploadRejected: emptyMessage.includes('至少上传') })
    await page.close()
  }
  await fs.writeFile(path.join(out, 'state-results.json'), JSON.stringify({ checks, errors: [] }, null, 2) + '\n')
  console.log(JSON.stringify({ checks }, null, 2))
  } finally {
    await browser.close()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
