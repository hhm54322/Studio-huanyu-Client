/** Public patient languages. Keep selectors, URL resolution and M02 in sync. */
export const patientLanguages = [
  { code: 'zh', label: '中文', short: 'ZH', flag: '🇨🇳' },
  { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
  { code: 'id', label: 'Bahasa Indonesia', short: 'ID', flag: '🇮🇩' },
  { code: 'ms', label: 'Bahasa Melayu', short: 'MS', flag: '🇲🇾' },
  { code: 'pt', label: 'Português', short: 'PT', flag: '🇵🇹' },
] as const
export type Locale = (typeof patientLanguages)[number]['code']

export function resolveLocale(value: unknown): Locale | undefined {
  if (typeof value !== 'string') return
  const code = value.trim().toLowerCase().split(/[-_]/)[0]
  return patientLanguages.find(language => language.code === code)?.code
}

export function savedLocale(): Locale {
  try { return resolveLocale(localStorage.getItem('locale')) || 'zh' } catch { return 'zh' }
}
