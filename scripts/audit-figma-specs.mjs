import { access, readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const specsDir = join(process.cwd(), 'docs', 'figma-page-specs')
const requestedFiles = new Set(process.argv.slice(2).map((file) => file.split('/').at(-1)))
const files = (await readdir(specsDir)).filter((file) => file.endsWith('.md') && (!requestedFiles.size || requestedFiles.has(file)))
const deliveryFiles = files.filter((file) => file !== 'compliance-audit.md' && file !== 'cost-generated-experiment.md')
const errors = []

if (!requestedFiles.size || requestedFiles.has('home.md')) {
  const sourceAudit = spawnSync(process.execPath, [join(process.cwd(), 'scripts', 'audit-home-source.mjs')], { encoding: 'utf8' })
  if (sourceAudit.stdout) process.stdout.write(sourceAudit.stdout)
  if (sourceAudit.stderr) process.stderr.write(sourceAudit.stderr)
  if (sourceAudit.status !== 0) errors.push('home.md: Figma source inventory/parameter/node-to-code coverage is incomplete')
}

if (!requestedFiles.size || requestedFiles.has('why-china.md')) {
  const sourceAudit = spawnSync(process.execPath, [join(process.cwd(), 'scripts', 'audit-why-china-source.mjs')], { encoding: 'utf8' })
  if (sourceAudit.stdout) process.stdout.write(sourceAudit.stdout)
  if (sourceAudit.stderr) process.stderr.write(sourceAudit.stderr)
  if (sourceAudit.status !== 0) errors.push('why-china.md: native parameters, exact node mapping, source lock or verification evidence failed')
}

console.log('Figma-first gate: source inventory -> Dev Mode parameters -> node mapping -> implementation -> evidence')

if (!requestedFiles.size || requestedFiles.has('hospitals.md')) {
  const sourceAudit = spawnSync(process.execPath, [join(process.cwd(), 'scripts', 'audit-hospitals-source.mjs')], { encoding: 'utf8' })
  if (sourceAudit.stdout) process.stdout.write(sourceAudit.stdout)
  if (sourceAudit.stderr) process.stderr.write(sourceAudit.stderr)
  if (sourceAudit.status !== 0) errors.push('hospitals.md: source coverage, exact mapping, source lock or verification evidence failed')
}

if (!requestedFiles.size || requestedFiles.has('cases.md') || requestedFiles.has('smart-match.md')) {
  const sourceAudit = spawnSync(process.execPath, [join(process.cwd(), 'scripts', 'audit-cases-source.mjs')], { encoding: 'utf8' })
  if (sourceAudit.stdout) process.stdout.write(sourceAudit.stdout)
  if (sourceAudit.stderr) process.stderr.write(sourceAudit.stderr)
  if (sourceAudit.status !== 0) errors.push('cases.md: source coverage, source lock, live node checks or final state evidence failed')
}

if (!requestedFiles.size || requestedFiles.has('diseases.md')) {
  const sourceAudit = spawnSync(process.execPath, [join(process.cwd(), 'scripts', 'audit-diseases-source.mjs')], { encoding: 'utf8' })
  if (sourceAudit.stdout) process.stdout.write(sourceAudit.stdout)
  if (sourceAudit.stderr) process.stderr.write(sourceAudit.stderr)
  if (sourceAudit.status !== 0) errors.push('diseases.md: complete source lock, live node checks or final state evidence failed')
}

if (!requestedFiles.size || requestedFiles.has('dental.md')) {
  const sourceAudit = spawnSync(process.execPath, [join(process.cwd(), 'scripts', 'audit-dental-source.mjs')], { encoding: 'utf8' })
  if (sourceAudit.stdout) process.stdout.write(sourceAudit.stdout)
  if (sourceAudit.stderr) process.stderr.write(sourceAudit.stderr)
  if (sourceAudit.status !== 0) errors.push('dental.md: complete source lock, live state checks or final evidence failed')
}

for (const file of deliveryFiles) {
  const source = await readFile(join(specsDir, file), 'utf8')
  const lines = source.split(/\r?\n/)
  const lineNumber = (index) => `${file}:${index + 1}`
  const hasVagueChildMapping = (line) => {
    if (!line.trimStart().startsWith('|')) return false
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    return cells.slice(0, 2).some((cell) => /\b(?:child(?: of)?|repeated child|shared dialog child)\b/i.test(cell))
  }
  const addMatchingLines = (pattern, label, limit = 12, includeLine = () => true) => {
    const matches = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => includeLine(line) && pattern.test(line) && !/\bresolved\b.*\b(?:unresolved|pending)\b/i.test(line))
      .slice(0, limit)
    for (const { line, index } of matches) errors.push(`${lineNumber(index)}: ${label}: ${line.trim()}`)
    return matches.length > 0
  }
  const status = source.match(/^\- Status:\s*(.+)$/m)?.[1]?.trim()
  if (!status) {
    errors.push(`${file}: missing Status`)
    continue
  }

  if (/^not in current Figma scope; navigation disabled$/i.test(status)) {
    continue
  }

  if (!/^verified\b/i.test(status)) {
    const statusIndex = lines.findIndex((line) => /^\- Status:/i.test(line))
    errors.push(`${statusIndex >= 0 ? lineNumber(statusIndex) : file}: status is not verified (${status})`)
    addMatchingLines(/\b(?:unresolved|pending)\b/i, 'unresolved/pending content', 20, (line) => !/^- (?:Status|Remaining differences):/i.test(line))
    addMatchingLines(/^\- Figma frame:\s*no dedicated/i, 'no dedicated Figma frame')
    addMatchingLines(/Figma compliance blocked/i, 'Figma compliance blocked')
    addMatchingLines(/.*/, 'non-specific child mapping; exact Figma Node ID required', 20, hasVagueChildMapping)
    continue
  }

  const sourceArtifacts = [
    source.match(/^- Source baseline HTML:\s*`([^`]+)`/mi)?.[1],
    source.match(/^- Source baseline CSS:\s*`([^`]+)`/mi)?.[1],
    source.match(/^- Source asset manifest:\s*`([^`]+)`/mi)?.[1],
  ]
  if (sourceArtifacts.some((artifact) => !artifact)) {
    errors.push(`${file}: verified page is missing the Figma source baseline HTML/CSS/asset manifest lock`)
  } else {
    for (const artifact of sourceArtifacts) {
      try {
        await access(join(process.cwd(), artifact))
      } catch {
        errors.push(`${file}: missing locked Figma source artifact: ${artifact}`)
      }
    }
  }

  const hasFrameError = addMatchingLines(/^\- Figma frame:\s*no dedicated/i, 'no dedicated Figma frame')
  const hasPageNodeError = addMatchingLines(/Node ID:\s*`?unresolved/i, 'unresolved page Node ID')
  if (!hasFrameError && !hasPageNodeError && (/^\- Figma frame:\s*no dedicated/im.test(source) || /Node ID:\s*`?unresolved/i.test(source))) {
    errors.push(`${file}: verified page has no dedicated Figma frame or unresolved page Node ID`)
  }

  addMatchingLines(/\b(?:unresolved|pending)\b/i, 'unresolved/pending content', 20, (line) => !/^- (?:Status|Remaining differences):/i.test(line))
  addMatchingLines(/.*/, 'non-specific child mapping; exact Figma Node ID required', 20, hasVagueChildMapping)

  addMatchingLines(/Figma compliance blocked/i, 'Figma compliance blocked')

  if (!/^## Verification$/m.test(source)) {
    errors.push(`${file}: missing Verification section`)
  }

  if (!/^- Remaining differences:\s*none\s*$/mi.test(source)) {
    errors.push(`${file}: Remaining differences must be explicitly recorded as none before verification can pass`)
  }

  if (!/^- Verification run:\s*\S+/mi.test(source)) {
    errors.push(`${file}: missing dated Verification run evidence`)
  }

  const assetHeading = source.indexOf('## Assets\n')
  const assetSectionStart = assetHeading >= 0 ? assetHeading + '## Assets\n'.length : -1
  const nextHeading = assetSectionStart >= 0 ? source.indexOf('\n## ', assetSectionStart) : -1
  const assetSection = assetSectionStart >= 0 ? source.slice(assetSectionStart, nextHeading >= 0 ? nextHeading : source.length) : ''
  if (!assetSection || !/\|[^\n]*\b\d+:\d+\b[^\n]*\|/m.test(assetSection)) {
    errors.push(`${file}: Assets must include at least one exact Figma asset Node ID`)
  }
  if (/\b(?:Lucide substitute|lucide-vue-next|Lucide equivalents?|placeholder asset|CSS icon substitute|unresolved asset|pending asset)\b/i.test(assetSection)) {
    errors.push(`${file}: Assets contain a substitute or unresolved asset mapping`)
  }

  if (!/Figma (?:reference|references)(?: screenshot| crops?)?:/i.test(source)) {
    errors.push(`${file}: missing Figma verification evidence (expected a Figma reference line)`)
  }

  if (!/(?:Local (?:desktop|project desktop)|Baseline local|Final desktop)(?: screenshot)?:/i.test(source)) {
    errors.push(`${file}: missing local desktop/state verification evidence (expected a desktop screenshot or geometry line)`)
  }

  const screenshotPaths = [...source.matchAll(/(?:Figma reference|Local desktop|Local mobile|Baseline local|Final (?:desktop|mobile)) screenshot:\s*`([^`]+)`/gi)].map((match) => match[1])
  for (const screenshotPath of screenshotPaths) {
    try {
      await access(screenshotPath)
    } catch {
      errors.push(`${file}: verification screenshot is missing: ${screenshotPath}`)
    }
  }

  if (!/(?:Local mobile|Final mobile)(?: screenshot)?:|Mobile geometry:/i.test(source)) {
    errors.push(`${file}: missing local mobile verification evidence (expected a mobile screenshot or geometry line)`)
  }

  if (!/^## (?:Prototype And Motion|Behavior)$/m.test(source)) {
    errors.push(`${file}: missing interaction/motion section`)
  }
}

if (errors.length) {
  console.error('Figma compliance gate failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Figma compliance gate passed for ${deliveryFiles.length} delivery specs.`)
}
