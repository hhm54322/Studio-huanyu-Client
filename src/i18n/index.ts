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
import { patientCopyScope } from './patientCopyScopes'
import localeLoaders from 'virtual:huanyu-patient-copy'

export type { Locale } from './languages'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale(),
  fallbackLocale: 'zh',
  messages: { zh, en, id, ms, pt, ru, mn },
})

const localeLoads = new Map<string, Promise<void>>()
// Catalog copy is literal display text. Vue-i18n interprets @ as a linked
// message and | as a plural separator, so escape these only in its key tree.
// siteCopy itself stays literal for tx(), including email addresses and prices.
const messageLiteral = (value:string) => value.replace(/[@|]/g, character => `{'${character}'}`)
function translatedMessages(source:Record<string,unknown>, copy:Record<string,string>, existing:Record<string,unknown>):Record<string,unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') {
      const translated = copy[siteCopyKey(value.trim())]
      if (translated) result[key] = messageLiteral(translated)
      continue
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const child = translatedMessages(value as Record<string,unknown>, copy, existing[key] as Record<string,unknown> || {})
      if (Object.keys(child).length) result[key] = child
    }
  }
  return result
}
/** Load only shared and current-route public copy; biographies/details stay out
 * of the first request while remaining available when their route is opened. */
export async function ensurePatientLocale(locale: Locale, scope = patientCopyScope(location.pathname)) {
  if (locale === 'zh') return
  const scopes = [...new Set(['common', scope])]
  await Promise.all(scopes.map(async currentScope => {
    const key = `${locale}/${currentScope}`
    if (!localeLoads.has(key)) {
      const load = localeLoaders[key]
      if (!load) throw new Error(`Missing patient language bundle: ${key}`)
      const promise = load().then(siteCopy => {
        const existing = i18n.global.getLocaleMessage(locale) as Record<string,unknown>
        i18n.global.mergeLocaleMessage(locale, {
          ...translatedMessages(zh, siteCopy, existing),
          siteCopy: { ...(existing.siteCopy as Record<string,string> || {}), ...siteCopy },
        })
      }).catch(error => { localeLoads.delete(key); throw error })
      localeLoads.set(key, promise)
    }
    await localeLoads.get(key)
  }))
}

export default i18n
