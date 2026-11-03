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
})
test('Chinese and unknown values are unchanged; only supplied static copy is translated', () => {
  assert.equal(tx('查看张医生详情', 'zh'), '查看张医生详情')
  assert.equal(tx('patient-upload-123.pdf'), 'patient-upload-123.pdf')
  assert.equal(tx('未登记的文字'), '未登记的文字')
  assert.equal(tx(24), 24)
})
