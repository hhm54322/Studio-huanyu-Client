import { createI18n } from 'vue-i18n'

import zh from './locales/zh.json'
import en from './locales/en.json'
import id from './locales/id.json'
import ru from './locales/ru.json'
import mn from './locales/mn.json'
import ms from './locales/ms.json'
import pt from './locales/pt.json'
import { savedLocale, type Locale } from './languages'
import { siteCopyKey } from './copyKey'

export type { Locale } from './languages'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale(),
  fallbackLocale: 'zh',
  messages: { zh, en, id, ms, pt, ru, mn },
})

const copyBundles = import.meta.glob('./site-copy/{en,id,ms,pt}.json', { import: 'default' }) as Record<string, () => Promise<Record<string, string>>>
const localeLoads = new Map<string, Promise<void>>()
// Catalog copy is literal display text. Vue-i18n interprets @ as a linked
// message and | as a plural separator, so escape these only in its key tree.
// siteCopy itself stays literal for tx(), including email addresses and prices.
const messageLiteral = (value:string) => value.replace(/[@|]/g, character => `{'${character}'}`)
function translatedMessages(source:Record<string,unknown>, copy:Record<string,string>, existing:Record<string,unknown>):Record<string,unknown> {
  return Object.fromEntries(Object.entries(source).map(([key,value])=>[key,
    typeof value==='string' ? copy[siteCopyKey(value.trim())] ? messageLiteral(copy[siteCopyKey(value.trim())]!) : existing[key] || value
      : value&&typeof value==='object'&&!Array.isArray(value) ? translatedMessages(value as Record<string,unknown>,copy,existing[key] as Record<string,unknown>||{}) : value,
  ]))
}
/** Load one static language once; never put all biographies in the entry JS. */
export async function ensurePatientLocale(locale: Locale) {
  if (locale === 'zh') return
  if (!localeLoads.has(locale)) {
    const load = copyBundles[`./site-copy/${locale}.json`]
    if (!load) throw new Error(`Missing patient language bundle: ${locale}`)
    const promise = load().then(siteCopy => {
      const existing=i18n.global.getLocaleMessage(locale) as Record<string,unknown>
      i18n.global.mergeLocaleMessage(locale, {...translatedMessages(zh,siteCopy,existing),siteCopy})
    })
      .catch(error => { localeLoads.delete(locale); throw error })
    localeLoads.set(locale, promise)
  }
  await localeLoads.get(locale)
}

export default i18n
