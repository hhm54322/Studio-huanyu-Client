import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extract, publicFiles } from './site-i18n-catalog.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const prefix = 'virtual:huanyu-patient-copy/'
const registry = 'virtual:huanyu-patient-copy'
const locales = ['en', 'id', 'ms', 'pt']

/** Split the reviewed catalog from the actual import graph, never a stale
 * locations artifact. Source/copy updates are picked up on every build. */
export function patientLocalePlugin(views) {
  let packs
  const buildPacks = () => {
    const { sources, locations } = extract(true)
    const relativeFiles = seeds => new Set(publicFiles(seeds).map(file => path.relative(root, file)))
    const shared = relativeFiles(['src/components/layout/PatientLayout.vue'])
    shared.add('src/i18n/locales/zh.json')
    shared.add('src/router/index.ts')
    const templates = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/site-copy/templates.json'), 'utf8'))
    const common = new Set(Object.keys(sources).filter(key => Object.hasOwn(templates, key) || [...locations[key]].some(file => shared.has(file))))
    const keys = { common }
    const covered = new Set(common)
    for (const [scope, view] of Object.entries(views)) {
      const files = relativeFiles([`src/views/patient/${view}.vue`])
      keys[scope] = new Set(Object.keys(sources).filter(key => !common.has(key) && [...locations[key]].some(file => files.has(file))))
      for (const key of keys[scope]) covered.add(key)
    }
    const missing = Object.keys(sources).filter(key => !covered.has(key))
    if (missing.length) throw new Error(`Public copy has no route scope: ${missing.slice(0, 6).join(', ')}`)
    return Object.fromEntries(locales.flatMap(locale => {
      const catalog = JSON.parse(fs.readFileSync(path.join(root, `src/i18n/site-copy/${locale}.json`), 'utf8'))
      return Object.entries(keys).map(([scope, selected]) => {
        const copy = Object.fromEntries([...selected].sort().map(key => {
          if (!catalog[key]) throw new Error(`Missing ${locale}/${scope} translation: ${key}`)
          return [key, catalog[key]]
        }))
        return [`${locale}/${scope}`, copy]
      })
    }))
  }
  return {
    name: 'huanyu-route-locale-catalog',
    resolveId(id) { if (id === registry || id.startsWith(prefix)) return `\0${id}` },
    load(id) {
      if (id !== `\0${registry}` && !id.startsWith(`\0${prefix}`)) return
      packs ||= buildPacks()
      if (id === `\0${registry}`) return `export default {${Object.keys(packs).map(key => `${JSON.stringify(key)}:()=>import(${JSON.stringify(prefix + key)}).then(module=>module.default)`).join(',')}}`
      const key = id.slice(prefix.length + 1)
      if (!packs[key]) throw new Error(`Unknown patient translation scope ${key}`)
      return `export default JSON.parse(${JSON.stringify(JSON.stringify(packs[key]))})`
    },
    handleHotUpdate() { packs = undefined },
  }
}
