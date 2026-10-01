const path = require('node:path')
const { chromium } = require('/tmp/huanyu-visual-qa-tools/node_modules/playwright')

const out = path.resolve(process.env.HUANYU_QA_OUT || 'docs/figma-verification/dental/2026-09-29')
const origin = process.env.HUANYU_QA_URL || 'http://127.0.0.1:5173'

async function capture(page, name) {
  await page.screenshot({ path: path.join(out, name), fullPage: true })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } })
      await page.goto(`${origin}/dental`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: /02 城市与医生匹配/ }).click()
      await page.getByRole('button', { name: /了解更多/ }).first().click()
      await page.getByRole('button', { name: '医生简介', exact: true }).click()
      await page.waitForTimeout(500)
      await capture(page, `doctor-profile-${width}.png`)
      await page.getByRole('button', { name: /案例集/ }).click()
      await page.waitForTimeout(350)
      await capture(page, `doctor-cases-${width}.png`)
      await page.getByRole('button', { name: /患者评价/ }).click()
      await page.waitForTimeout(350)
      await capture(page, `doctor-reviews-${width}.png`)
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: /03 上传影像资料/ }).click()
      await page.waitForTimeout(350)
      await capture(page, `dental-upload-${width}.png`)
      await page.close()
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
