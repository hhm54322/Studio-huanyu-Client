// Compare numeric values rather than their language-specific display units.
// Chinese large-number units must not force an incorrect foreign translation.
export function copyNumbers(text) {
  const digits = '零一二三四五六七八九'
  const numeralValue = s => s.includes('十')
    ? (digits.indexOf(s.split('十')[0]) > 0 ? digits.indexOf(s.split('十')[0]) : 1) * 10 + (s.split('十')[1] ? digits.indexOf(s.split('十')[1]) : 0)
    : digits.indexOf(s)
  const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X']
  const normalized = text.normalize('NFKC')
  // Section numbers are content too. Translate the Chinese enumeration to
  // its numeric value without accepting newly introduced clinical numbers.
  .replace(/^([一二三四五六七八九十]{1,3})、/gmu, (_, numeral) => `${numeralValue(numeral)}.`)
  .replace(/^(VIII|VII|III|VI|IV|IX|II|V|X|I)\.\s/gmu, (_, numeral) => `${roman.indexOf(numeral) + 1}. `)
  .replace(/第([一二三四五六七八九十]{1,3})、([一二三四五六七八九十]{1,3})(?=届|版)/gu, (_, first, second) => `${numeralValue(first)},${numeralValue(second)}`)
  .replace(/第([一二三四五六七八九十]{1,3})(?=届|期|版)/gu, (_, numeral) => String(numeralValue(numeral)))
  .replace(/([一二三四五六七八九十]{1,3})(?=届|版)/gu, (_, numeral) => String(numeralValue(numeral)))
  .replace(
    /(\d+(?:[,，]\d{3})*(?:\.\d+)?)\s*([万萬亿億])/g,
    (_, amount, unit) => String(Number(amount.replace(/[,，]/g, '')) * (unit === '万' || unit === '萬' ? 10000 : 100000000)),
  )
  return [...normalized.matchAll(/\d+(?:[,，]\d{3})*(?:\.\d+)?/g)]
    .map(match => String(Number(match[0].replace(/[,，]/g, ''))))
    .sort().join('|')
}
