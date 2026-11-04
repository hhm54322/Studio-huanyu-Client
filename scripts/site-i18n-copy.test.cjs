// Exercise real public-copy resolution without making translation requests.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function loadTs(file, require) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, require })
  return module.exports
}
const { siteCopyKey } = loadTs('src/i18n/copyKey.ts')
const catalog = Object.fromEntries([
  ['查看{arg0}', 'View {arg0}'],
  ['查看{arg0}详情', 'View details for {arg0}'],
  ['查看{name}（{department}）详情', 'View {name} ({department}) profile'],
  ['张医生', 'Dr. Zhang'], ['中医科', 'Traditional Chinese medicine'],
  ['上海曜影医院', 'Shanghai SinoUnited Hospital'],
  ['打开{arg0}官网', 'Open {arg0} website'],
  ['共 {count} 位医生', '{count} physicians'],
  ['上海', 'Shanghai'], ['治疗', 'Treatment'], ['随访', 'Follow-up'],
  ['0T磁共振', 'Zero-tesla MRI'],
].map(([source, target]) => [siteCopyKey(source), target]))
const api = loadTs('src/i18n/siteCopy.ts', id => {
  if (id === 'vue') return { computed: fn => ({ get value() { return fn() } }) }
  if (id === './index') return { default: { global: { locale: { value: 'en' }, getLocaleMessage: () => ({ siteCopy: catalog }) } } }
  if (id === './copyKey') return { siteCopyKey }
  if (id === './languages') return { resolveLocale: code => ['zh', 'en', 'id', 'ms', 'pt'].includes(code) ? code : undefined }
  if (id === './site-copy/templates.json') return { default: JSON.parse(fs.readFileSync('src/i18n/site-copy/templates.json', 'utf8')) }
  throw Error(`Unexpected import ${id}`)
})
const { translateSiteCopy: tx, formatSiteCopy: tf } = api

test('specific details patterns win over a generic view prefix', () => {
  assert.equal(tx('查看张医生详情'), 'View details for Dr. Zhang')
  assert.equal(tx('查看上海曜影医院详情'), 'View details for Shanghai SinoUnited Hospital')
  assert.equal(tx('查看张医生'), 'View Dr. Zhang')
})
test('public arguments, named counters and surrounding whitespace are preserved', () => {
  assert.equal(tx(' 打开上海曜影医院官网 '), ' Open Shanghai SinoUnited Hospital website ')
  assert.equal(tf('共 {count} 位医生', { count: 177 }), '177 physicians')
  assert.equal(tf('查看{name}（{department}）详情', { name: 'LIM SIEW JUE（Jue Lim）', department: 'Chiropractic' }), 'View LIM SIEW JUE（Jue Lim） (Chiropractic) profile')
})
test('composite public labels and document lines resolve independently', () => {
  assert.equal(tx('上海 · 中医科'), 'Shanghai · Traditional Chinese medicine')
  assert.equal(tx('治疗\n随访'), 'Treatment\nFollow-up')
  assert.equal(tx('3.0T磁共振'), '3.0T磁共振')
})
test('Chinese and unknown values are unchanged; only supplied static copy is translated', () => {
  assert.equal(tx('查看张医生详情', 'zh'), '查看张医生详情')
  assert.equal(tx('patient-upload-123.pdf'), 'patient-upload-123.pdf')
  assert.equal(tx('未登记的文字'), '未登记的文字')
  assert.equal(tx(24), 24)
})

test('large Chinese counts retain their value in translated currency and statistics', async () => {
  const { copyNumbers } = await import('./site-i18n-values.mjs')
  assert.equal(copyNumbers('25岁，60万美元'), copyNumbers('Age 25, USD 600,000'))
  assert.equal(copyNumbers('94万医生'), copyNumbers('940000 physicians'))
  assert.equal(copyNumbers('1.28亿元'), copyNumbers('CNY 128000000'))
  assert.notEqual(copyNumbers('60万美元'), copyNumbers('USD 60000'))
})

test('numeric validation still rejects changed doses, durations and added numbers', async () => {
  const { copyNumbers } = await import('./site-i18n-values.mjs')
  assert.notEqual(copyNumbers('每日5mg，持续3天'), copyNumbers('50mg daily for 3 days'))
  assert.notEqual(copyNumbers('每日5mg，持续3天'), copyNumbers('5mg daily for 30 days'))
  assert.notEqual(copyNumbers('每周复查'), copyNumbers('Follow up every 2 weeks'))
  assert.equal(copyNumbers('六、每次5mg，持续3天'), copyNumbers('6. 5mg each time for 3 days'))
  assert.equal(copyNumbers('六、每次5mg，持续3天'), copyNumbers('VI. 5mg each time for 3 days'))
  assert.equal(copyNumbers('第十一届学会，5名委员'), copyNumbers('11th society, 5 members'))
  assert.equal(copyNumbers('第三、四版'), copyNumbers('3rd and 4th editions'))
  assert.equal(copyNumbers('说明\n一、用药\n每次5mg\n二、复查\n3天后'), copyNumbers('Note\nI. Medication\n5mg each time\nII. Follow-up\nAfter 3 days'))
  assert.notEqual(copyNumbers('说明\n一、用药\n每次5mg\n二、复查\n3天后'), copyNumbers('Note\nI. Medication\n50mg each time\nII. Follow-up\nAfter 3 days'))
  assert.notEqual(copyNumbers('六、每次5mg，持续3天'), copyNumbers('6. 50mg each time for 3 days'))
})

test('copy extraction preserves prose URLs and medical decimals while excluding resource identifiers', async () => {
  const { isCopyResource, skipJsonCopyField, stripCopyListMarker } = await import('./site-i18n-scope.mjs')
  assert.equal(isCopyResource('https://baike.baidu.com/item/北京协和医院'), true)
  assert.equal(isCopyResource('详情参阅 https://baike.baidu.com/item/北京协和医院'), false)
  assert.equal(isCopyResource('docs/source/医生资料.docx'), true)
  assert.equal(isCopyResource('docs/source/医生资料 (1).docx'), true)
  const node = { id: '1:2', type: 'TEXT', children: [], css: 'display:block;', name: '图层名称', text: '患者可读正文' }
  assert.equal(skipJsonCopyField('name', node), true)
  assert.equal(skipJsonCopyField('text', node), false)
  assert.equal(skipJsonCopyField('name', { name: '王燕' }), false)
  assert.equal(skipJsonCopyField('name', { name: 'ChatGPT Image 2026年9月15日', hash: Array(20).fill(5) }), true)
  assert.equal(skipJsonCopyField('source', { source: '2026年·患者评价' }), false)
  assert.equal(skipJsonCopyField('sourceImage', { sourceImage: '案例一.png' }), true)
  assert.equal(stripCopyListMarker('3.0T磁共振'), '3.0T磁共振')
  assert.equal(stripCopyListMarker('1. 擅长疾病：鼻炎'), '擅长疾病：鼻炎')
})
