import { computed } from 'vue'
import i18n from './index'
import { siteCopyKey } from './copyKey'
import { resolveLocale } from './languages'
import templates from './site-copy/templates.json'

const fixedCopyLength=(source:string)=>source.replace(/\{arg\d+\}/g,'').length
// Prefer a complete sentence over a shorter prefix such as "查看{arg0}".
// Otherwise the prefix swallows the name, department and untranslated suffix.
const patterns=Object.entries(templates).filter(([,source])=>/[\u3400-\u9fff]|[A-Za-z]{3}/.test(source.replace(/\{arg\d+\}/g,'')))
  .sort(([,a],[,b])=>fixedCopyLength(b)-fixedCopyLength(a)).map(([key,source])=>{
  const fields:string[]=[]
  const escaped=source.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\\{(arg\d+)\\\}/g,(_,field:string)=>{fields.push(field);return'([\\s\\S]+?)'})
  return {key,fields,match:new RegExp(`^${escaped}$`)}
})

/** Static public copy only. There is no translation request at runtime. */
export function translateSiteCopy(value: string, language?: string): string
export function translateSiteCopy<T>(value: T, language?: string): T
export function translateSiteCopy(value: unknown, language: string = i18n.global.locale.value): unknown {
  const targetLocale = resolveLocale(language)
  if (typeof value !== 'string' || !targetLocale || targetLocale === 'zh') return value
  const text = value.replace(/\r\n/g, '\n').trim()
  const catalog = (i18n.global.getLocaleMessage(targetLocale) as Record<string, unknown>).siteCopy as Record<string, string> | undefined
  const translated = catalog?.[siteCopyKey(text)]
  if (typeof translated === 'string') return value.replace(text, () => translated)
  // Public data combines independently translated labels with a visual
  // separator (for example a city and a medical department).
  if (text.includes(' · ')) return value.split(' · ').map(part => translateSiteCopy(part, language)).join(' · ')
  // Lists in the source documents are rendered without their source bullets.
  const stripped = text.replace(/^(?:[•□●]\s*|\d+[.．]\s*)/, '')
  if (stripped !== text && catalog?.[siteCopyKey(stripped)]) return value.replace(stripped, () => catalog[siteCopyKey(stripped)]!)
  for(const pattern of patterns) {
    const target=catalog?.[pattern.key]
    if(!target)continue
    const match=text.match(pattern.match)
    if(!match)continue
    const translated=target.replace(/\{(arg\d+)\}/g,(_,field:string)=>{
      const captured=match[pattern.fields.indexOf(field)+1]||''
      // Arguments are public UI labels/numbers, never form values or reports.
      return captured===text?captured:translateSiteCopy(captured,language)
    })
    return value.replace(text,()=>translated)
  }
  // Source biographies contain paragraphs and lists that are also displayed
  // separately. Resolve those exact entries without translating patient data.
  if (text.includes('\n')) return value.split('\n').map(line => translateSiteCopy(line, language)).join('\n')
  return value
}

export function useSiteCopy() {
  const locale = computed(() => resolveLocale(i18n.global.locale.value) || 'zh')
  return { tx: translateSiteCopy, tf: formatSiteCopy, locale, localized: computed(() => locale.value !== 'zh') }
}

export function formatSiteCopy(source:string,values:Record<string,string|number>) {
  return translateSiteCopy(source).replace(/\{([A-Za-z]\w*)\}/g,(token,key:string)=>Object.prototype.hasOwnProperty.call(values,key)?String(values[key]):token)
}
