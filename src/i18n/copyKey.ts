/** Stable copy identity: changing source copy requires new translations. */
export function siteCopyKey(value: string): string {
  let a = 0xdeadbeef, b = 0x41c6ce57
  for (let i = 0; i < value.length; i++) { a = Math.imul(a ^ value.charCodeAt(i), 2654435761); b = Math.imul(b ^ value.charCodeAt(i), 1597334677) }
  a = Math.imul(a ^ a >>> 16, 2246822507) ^ Math.imul(b ^ b >>> 13, 3266489909)
  b = Math.imul(b ^ b >>> 16, 2246822507) ^ Math.imul(a ^ a >>> 13, 3266489909)
  return `s_${(b >>> 0).toString(36)}_${(a >>> 0).toString(36)}`
}
