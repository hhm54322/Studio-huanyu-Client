import { readFileSync, writeFileSync } from 'fs'

// Read the LanguageContext.tsx
const src = readFileSync('../Kimi_Agent_双版医疗导航网站-3/patient-app/src/context/LanguageContext.tsx', 'utf-8')

// Extract each language block
const langs = ['zh', 'en', 'id', 'ru', 'mn']
const fileMap = { zh: 'zh-CN', en: 'en', id: 'id', ru: 'ru', mn: 'mn' }

for (const lang of langs) {
  // Find the block for this language
  const regex = new RegExp(`${lang === 'zh' ? '  zh' : `  ${lang}`}: \\{([\\s\\S]*?)\\n  \\}`, 'm')
  const match = src.match(regex)
  if (!match) { console.log(`No match for ${lang}`); continue }
  
  const block = match[1]
  const nested = {}
  
  // Extract key-value pairs
  const kvRegex = /['"]([^'"]+)['"]\s*:\s*['"]([^']*(?:\\'[^']*)*)['"]/g
  let m
  while ((m = kvRegex.exec(block)) !== null) {
    const key = m[1]
    let val = m[2].replace(/\\'/g, "'")
    const parts = key.split('.')
    let obj = nested
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {}
      obj = obj[parts[i]]
    }
    obj[parts[parts.length - 1]] = val
  }
  
  const outFile = `src/i18n/locales/${fileMap[lang]}.json`
  writeFileSync(outFile, JSON.stringify(nested, null, 2) + '\n', 'utf-8')
  console.log(`${lang} -> ${outFile}: ${Object.keys(nested).length} top-level keys`)
}
