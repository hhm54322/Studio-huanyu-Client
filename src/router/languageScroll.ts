import type { RouteLocationNormalized } from 'vue-router'

/** A locale change updates the URL but should not navigate the reader away. */
export function onlyLanguageChanged(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  if (to.path !== from.path || to.hash !== from.hash || to.query.lang === from.query.lang) return false
  const keys = new Set([...Object.keys(to.query), ...Object.keys(from.query)])
  keys.delete('lang')
  return [...keys].every(key => {
    const a = to.query[key], b = from.query[key]
    return Array.isArray(a) || Array.isArray(b)
      ? Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index])
      : a === b
  })
}
