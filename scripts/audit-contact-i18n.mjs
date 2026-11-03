import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const root = new URL('../', import.meta.url)
const languages = ['zh', 'en', 'id', 'ms', 'pt']
function flatten(value, prefix = '') {
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof child === 'string' ? [[path, child]] : Object.entries(flatten(child, path))
  }))
}
const placeholderKeys = value => [...value.matchAll(/\{([\w]+)\}/g)].map(match => match[1]).sort()
const messages = Object.fromEntries(await Promise.all(languages.map(async language => {
  const document = JSON.parse(await readFile(new URL(`src/i18n/locales/${language}.json`, root), 'utf8'))
  assert.ok(document.conversion, `${language}: missing conversion namespace`)
  return [language, flatten(document.conversion)]
})))
const keys = Object.keys(messages.zh).sort()
for (const language of languages) {
  assert.deepEqual(Object.keys(messages[language]).sort(), keys, `${language}: update all five catalogs when changing contact content`)
  for (const key of keys) {
    const value = messages[language][key]
    assert.ok(value.trim(), `${language}.${key}: empty translation`)
    assert.deepEqual(placeholderKeys(value), placeholderKeys(messages.zh[key]), `${language}.${key}: different template fields`)
    if (language !== 'zh') assert.ok(!/[\u3400-\u9fff]/u.test(value), `${language}.${key}: untranslated Chinese`)
  }
}
const aliases = await readFile(new URL('src/data/contactTopics.ts', root), 'utf8')
const topicFile = ts.createSourceFile('contactTopics.ts', aliases, ts.ScriptTarget.Latest, true)
let topicObject
function findTopics(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(topicFile) === 'contactTopicAliases') topicObject = node.initializer
  ts.forEachChild(node, findTopics)
}
findTopics(topicFile)
assert.ok(topicObject && ts.isObjectLiteralExpression(topicObject), 'Contact topics must be an explicit allowlist')
const publicTopics = new Map()
for (const property of topicObject.properties) {
  assert.ok(ts.isPropertyAssignment(property) && ts.isArrayLiteralExpression(property.initializer), 'Every contact topic requires an explicit alias list')
  const key = property.name.text
  publicTopics.set(key, property.initializer.elements.map(value => {
    assert.ok(ts.isStringLiteral(value), `${key}: topic aliases must be literal public labels`)
    return value.text
  }))
}
assert.deepEqual([...publicTopics.keys()].sort(), keys.filter(key => key.startsWith('topics.')).map(key => key.slice(7)).sort(), 'Every topic requires a translation in all five catalogs')
const knownLabels = new Set([...publicTopics.values()].flat())
// Every Chinese public disease/department in the report and directory must be
// intentionally covered; a new option cannot silently fall back to general.
const report = await readFile(new URL('src/data/report.ts', root), 'utf8')
const directory = JSON.parse(await readFile(new URL('docs/figma-source/diseases/content-2026-09-29.json', root), 'utf8'))
const dental = await readFile(new URL('src/views/patient/DentalView.vue', root), 'utf8')
const dentalNames = [...dental.split('const projects: DentalProject[] = [')[1].split('\n]')[0].matchAll(/title: '([^']+)'/g)].map(match => match[1])
const names = [...report.split('export const regions')[0].matchAll(/name: '([^']+)'/g)].map(match => match[1]).concat(directory.cards.map(card => card.name), dentalNames)
for (const name of names) assert.ok(knownLabels.has(name), `New topic requires explicit five-language coverage: ${name}`)
console.log(`M02 i18n: ${languages.length} languages × ${keys.length} messages; placeholders and ${names.length} disease/department entries verified.`)
