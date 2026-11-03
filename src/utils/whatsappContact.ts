import { resolveLocale, type Locale } from '@/i18n/languages'
import { resolveContactTopic, type ContactTopic } from '@/data/contactTopics'

export const contactAttributionKey = 'huanyu.contact-attribution.v1'
export const attributionFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'source_id'] as const
export type ContactAttribution = Partial<Record<(typeof attributionFields)[number], string>>

// Marketing identifiers only: bounded public labels, no raw URLs/query strings,
// click IDs, personal details or control characters. A new campaign replaces
// the entire preceding campaign, so two ads can never be accidentally merged.
const marketingLabel = (value: unknown) => typeof value === 'string' && /^[\p{L}\p{N}_. -]{1,80}$/u.test(value.trim()) ? value.trim() : undefined
export function readAttribution(query: Record<string, unknown>): ContactAttribution | undefined {
  if (!attributionFields.some(key => Object.prototype.hasOwnProperty.call(query, key))) return
  return Object.fromEntries(attributionFields.flatMap(key => {
    const value = marketingLabel(query[key])
    return value ? [[key, value]] : []
  }))
}
export function parseStoredAttribution(value: string | null): ContactAttribution {
  try { const saved: unknown = JSON.parse(value || '{}'); return saved && typeof saved === 'object' && !Array.isArray(saved) ? readAttribution(saved as Record<string, unknown>) || {} : {} } catch { return {} }
}
export const contactCountry = (value: unknown) => typeof value === 'string' && /^[A-Za-z]{2}$/.test(value) ? value.toUpperCase() : undefined
export interface WhatsAppContext {
  locale: Locale
  topic: ContactTopic
  country?: string
  page: string
  entry: string
  attribution: ContactAttribution
}
export function contactSource(context: WhatsAppContext): string {
  return [
    'HY1', `lang=${resolveLocale(context.locale) || 'zh'}`, `topic=${resolveContactTopic(context.topic) || 'general'}`,
    `page=${context.page}`, `entry=${context.entry}`,
    ...(contactCountry(context.country) ? [`country=${contactCountry(context.country)}`] : []),
    ...Object.entries(readAttribution(context.attribution) || {}).map(([key, value]) => `${key}=${value}`),
  ].join(' | ')
}
export function whatsAppPrefillUrl(base: string, message: string): string {
  const url = new URL(base)
  // Both supported official contact URL shapes accept the text parameter.
  // URLSearchParams owns all encoding (including accents, newlines and &).
  url.searchParams.set('text', message)
  return url.href
}
