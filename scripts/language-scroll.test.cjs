const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const output = ts.transpileModule(fs.readFileSync('src/router/languageScroll.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText
const moduleObject = { exports: {} }
vm.runInNewContext(output, { module: moduleObject, exports: moduleObject.exports })
const { onlyLanguageChanged } = moduleObject.exports
const route = (path, query, hash = '') => ({ path, query, hash })

test('language-only changes preserve other query parameters and hash', () => {
  const from = route('/dental', { step: '2', project: 'implant', filter: ['a', 'b'], lang: 'zh' }, '#details')
  const to = route('/dental', { step: '2', project: 'implant', filter: ['a', 'b'], lang: 'en' }, '#details')
  assert.equal(onlyLanguageChanged(to, from), true)
})

test('real navigations and changed query filters retain normal scrolling', () => {
  const from = route('/dental', { step: '2', filter: ['a', 'b'], lang: 'zh' }, '#details')
  for (const to of [
    route('/doctors', { step: '2', filter: ['a', 'b'], lang: 'en' }, '#details'),
    route('/dental', { step: '3', filter: ['a', 'b'], lang: 'en' }, '#details'),
    route('/dental', { step: '2', filter: ['b', 'a'], lang: 'en' }, '#details'),
    route('/dental', { step: '2', filter: ['a', 'b'], lang: 'en' }, '#other'),
    route('/dental', { step: '2', filter: ['a', 'b'], lang: 'zh' }, '#details'),
  ]) assert.equal(onlyLanguageChanged(to, from), false)
})
