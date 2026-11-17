// Read-only diagnosis; this does not replace or weaken the Figma delivery gate.
import { readFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import gate from './figma-source-gate.cjs'

const [oldReportPath, laterReportPath] = process.argv.slice(2)
if (!oldReportPath || !laterReportPath) throw Error('Usage: node scripts/diagnose-dental-source.mjs <original-baseline-report.json> <later-baseline-report.json>')
const read = async path => JSON.parse(await readFile(path, 'utf8'))
const [oldReport, laterReport] = await Promise.all([read(oldReportPath), read(laterReportPath)])
const config = gate.pageSourceConfiguration('dental')
assert.equal(oldReport.baseline.sha256, config.baselineSHA256, 'The first report must use the original three-step implementation source')
assert.equal(oldReport.current.sha256, laterReport.current.sha256, 'Both reports must compare the same current export')
assert.equal(createHash('sha256').update(await readFile(oldReport.current.file)).digest('hex'), oldReport.current.sha256, 'Current export changed')
assert.equal(createHash('sha256').update(await readFile(oldReport.baseline.file)).digest('hex'), oldReport.baseline.sha256, 'Original step export changed')
assert.equal(createHash('sha256').update(await readFile(laterReport.baseline.file)).digest('hex'), laterReport.baseline.sha256, 'Later export changed')
assert.ok(Date.now() - Date.parse(oldReport.current.exportedAt) < 24 * 60 * 60 * 1000, 'Current export is stale')
const baseline = await read('docs/figma-source/dental-pages-2026-11-05/profile/native-inventory-2026-11-05.json')
const roots = ['2294:8240', '2294:6971', '2294:8037']
const currentDoctorRoots = ['3421:2534', '3421:2810', '3421:3113', '3421:3380', '3421:3698', '3423:4315', '3423:5936']
const stepChanges = roots.map(id => {
  const scope = oldReport.scopes.find(item => item.rootId === id)
  assert.ok(scope, `Missing original source scope ${id}`)
  const newRoots = oldReport.added.filter(node => scope.addedIds.includes(node.id) && !scope.addedIds.includes(node.parentId))
  const removedRoots = oldReport.removed.filter(node => scope.removedIds.includes(node.id) && !scope.removedIds.includes(node.parentId))
  return { id, status: scope.status, changedIds: scope.changedIds, addedRoots: newRoots.map(node => ({ id: node.id, name: node.name, parentId: node.parentId })), removedRoots: removedRoots.map(node => ({ id: node.id, name: node.name, parentId: node.parentId })), dependencyChanges: scope.dependencyChanges.length, unresolvedImages: scope.unresolvedImages.length, unresolvedBlobs: scope.unresolvedBlobs.length }
})
const laterScopes = [...roots, ...currentDoctorRoots].map(id => {
  const scope = laterReport.scopes.find(item => item.rootId === id)
  assert.ok(scope, `Missing later source scope ${id}`)
  return { id, status: scope.status, changed: scope.changedIds.length, added: scope.addedIds.length, removed: scope.removedIds.length, alternatives: scope.alternatives.length, dependencyChanges: scope.dependencyChanges.length, unresolvedImages: scope.unresolvedImages.length, unresolvedBlobs: scope.unresolvedBlobs.length }
})
const baselinePresent = await access(baseline.sourceFile).then(() => true, () => false)
console.log(JSON.stringify({
  current: oldReport.current,
  originalStepBaseline: oldReport.baseline,
  stepChanges,
  laterBaseline: laterReport.baseline,
  laterScopes,
  actualDoctorBaseline: { path: baseline.sourceFile, sha256: baseline.sourceSHA256, present: baselinePresent },
  interpretation: 'Diagnostic only: a later export comparison does not prove equality with the missing actual doctor baseline. Historical gates remain unchanged.',
}, null, 2))
