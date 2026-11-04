// These are identifiers and provenance, never displayed copy. URLs embedded
// within prose remain translatable strings and keep their protected values.
export function isCopyResource(value) {
  return /^https?:\/\/\S+$/u.test(value)
    || /^(?:\/Users\/|docs\/|\/images\/)[^\r\n]+$/u.test(value)
}

export function isSourceNode(value) {
  return typeof value?.id === 'string' && typeof value.type === 'string'
    && Array.isArray(value.children) && ['string', 'object'].includes(typeof value.css)
}

export function skipJsonCopyField(key, value) {
  if (['textRuns', 'textLines', 'textParagraphs', 'css', 'layoutCss', 'hiddenHtml'].includes(key)) return true
  if (isSourceNode(value) && key === 'name') return true
  if (key === 'name' && Array.isArray(value?.hash) && value.hash.length === 20 && value.hash.every(n => Number.isInteger(n) && n >= 0 && n <= 255)) return true
  return ['sourceImage', 'sourceFile', 'sourceSHA256', 'sourceImageSHA256', 'sourceFrame', 'allocation'].includes(key)
}

export function stripCopyListMarker(value) {
  // A decimal equipment designation such as 3.0T is not a numbered list.
  return value.replace(/^(?:[•□●]\s*|\d+[.．](?!\d)\s*)/u, '')
}
