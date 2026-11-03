const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const cache = new Map()
function load(file) {
  if (cache.has(file)) return cache.get(file)
  const module = { exports: {} }
  const requireLocal = name => name.startsWith('@/') ? load(path.join(root, 'src', name.slice(2) + '.ts')) : require(name)
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInThisContext(`(function(module,exports,require){${code}\n})`, { filename: file })(module, module.exports, requireLocal)
  cache.set(file, module.exports)
  return module.exports
}
const util = load(path.join(root, 'src/utils/whatsappContact.ts'))
const languages = load(path.join(root, 'src/i18n/languages.ts'))
const topics = load(path.join(root, 'src/data/contactTopics.ts'))

test('WhatsApp retains five-language text, accents, newlines and literal special characters', () => {
  for (const locale of ['zh', 'en', 'id', 'ms', 'pt']) {
    const catalog = JSON.parse(fs.readFileSync(path.join(root, `src/i18n/locales/${locale}.json`))).conversion
    for (const topic of Object.keys(topics.contactTopicAliases)) {
      assert.ok(catalog.topics[topic], `${locale}: missing ${topic}`)
      const text = catalog.whatsapp.topicMessage.replace('{disease}', catalog.topics[topic]) + '\n& + # % café 您好'
      for (const base of ['https://wa.me/8615855159472', 'https://api.whatsapp.com/message/Y42GUI2UUXBVB1?autoload=1']) {
        const url = new URL(util.whatsAppPrefillUrl(base, text))
        assert.equal(url.searchParams.get('text'), text)
        assert.equal(url.hostname, new URL(base).hostname)
      }
    }
  }
})
test('Source fields are allowlisted, bounded and safe to put in a URL', () => {
  assert.deepEqual(util.readAttribution({ utm_source:'facebook', utm_campaign:'HY-dental-id-2026', email:'person@example.test', phone:'+8612345678', gclid:'TRACKER' }), { utm_source:'facebook', utm_campaign:'HY-dental-id-2026' })
  assert.deepEqual(util.readAttribution({ utm_source:'ok\nmalicious', utm_campaign:'https://private.test/?token=123', utm_content:['a','b'], source_id:'a'.repeat(81) }), {})
  assert.equal(util.readAttribution({ step:'2' }), undefined)
  assert.deepEqual(util.parseStoredAttribution('{bad'), {})
  assert.deepEqual(util.parseStoredAttribution('null'), {})
  assert.deepEqual(util.parseStoredAttribution('{"utm_source":"facebook","email":"private"}'), { utm_source:'facebook' })
  assert.equal(util.contactCountry('MY'), 'MY')
  assert.equal(util.contactCountry('Malaysia\nphone'), undefined)
})
test('Language variants normalize to the five configured language codes', () => {
  for (const [input, expected] of [['pt-BR','pt'],['en-GB','en'],['zh_CN','zh'],['id','id'],['ms-MY','ms'],['ru',undefined],['bogus',undefined]]) assert.equal(languages.resolveLocale(input), expected)
})
test('Sources distinguish entry and campaign and contain no private medical notes', () => {
  const context = {locale:'pt',topic:'lung_cancer',page:'patient-home',entry:'floating',country:'pt',attribution:{utm_source:'facebook',utm_campaign:'HY-lung-pt-v1'}}
  const source = util.contactSource(context)
  assert.ok(source.includes('HY1 | lang=pt | topic=lung_cancer'))
  assert.ok(source.includes('country=PT'))
  assert.notEqual(source, util.contactSource({...context,entry:'footer-1412-6726'}))
  assert.ok(source.includes('utm_campaign=HY-lung-pt-v1'))
})
