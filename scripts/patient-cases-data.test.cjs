const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const design = JSON.parse(fs.readFileSync(path.join(root, 'src/data/patientCasesContent.json'), 'utf8'))
const source = fs.readFileSync(path.join(root, 'src/data/patientCases.ts'), 'utf8')
  .replace("import content from './patientCasesContent.json'", 'const content = globalThis.fixtureDesign')
  .replace("import sourceMap from './patientCasesSourceMap.json'", 'const sourceMap = globalThis.fixtureSourceMap')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const sandbox = { exports: {}, fixtureDesign: design, fixtureSourceMap: JSON.parse(fs.readFileSync(path.join(root, 'src/data/patientCasesSourceMap.json'), 'utf8')) }
vm.runInNewContext(js, sandbox)
const cases = sandbox.exports.patientCases
const strings = value => JSON.stringify(value)

test('six designed cases include all case sections and available photo groups', () => {
  assert.equal(cases.length, 6)
  assert.deepEqual(Array.from(cases, x => x.sections.length), [4, 4, 3, 5, 4, 7])
  assert.deepEqual(Array.from(cases, x => x.photos.length), [5, 4, 1, 3, 3, 7])
  for (const item of cases) for (const photo of item.photos) {
    assert.ok(photo.startsWith(`/images/patient-stories/patient-${item.id}-`))
    assert.ok(fs.existsSync(path.join(root, 'public', photo)))
  }
})

test('known cross-patient copy errors do not leak into display data', () => {
  assert.ok(!strings(cases[1]).includes('Deauville 1–2'))
  assert.ok(!strings(cases[5]).includes('术后10个小时左右'))
  assert.ok(!strings(cases[5]).includes('739岁'))
  assert.ok(cases[5].detailSummary.text.startsWith('39岁'))
  assert.ok(!strings(design).includes('739岁'), 'published data must exclude the original age typo')
  assert.ok(strings(cases[2]).includes('缩小 28%'))
  assert.ok(strings(cases[2]).includes('缩小 28%（部分缓解 PR）'), 'retain the wording from the approved design')
})

test('every home story includes both designed highlights and uses the corresponding patient', () => {
  assert.equal(sandbox.exports.homePatientStories.length, cases.length)
  assert.deepEqual(Array.from(sandbox.exports.homePatientStories, story => story.length), [4, 4, 4, 4, 4, 4])
  for (const item of cases) assert.ok(item.photos[0].includes(`/patient-${item.id}-`))
})

test('the third case retains the designed 28% and PR wording in all five languages', () => {
  const text = cases[2].sections.flatMap(section => section.content)
    .flatMap(block => block.children).find(node => node.id === '4342:665').text
  const zh = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/site-copy/zh.json'), 'utf8'))
  const key = Object.keys(zh).find(id => zh[id] === text)
  assert.ok(key, 'the complete original text must be in the public translation catalog')
  for (const [locale, wording] of Object.entries({ en: 'partial response', id: 'respons parsial', ms: 'respons separa', pt: 'resposta parcial' })) {
    const copy = JSON.parse(fs.readFileSync(path.join(root, `src/i18n/site-copy/${locale}.json`), 'utf8'))[key]
    assert.ok(copy?.includes('28%') && copy.includes(wording) && copy.includes('PR'), `${locale}: retain both the figure and PR label`)
    assert.doesNotMatch(copy, /[\u3400-\u9fff]/, `${locale}: no untranslated Chinese`)
  }
})
