import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import sourceGate from './figma-source-gate.cjs'

// A live-reviewed frame-label correction is retained separately from the
// historical extraction. Never rewrite the detector's changed result or
// allow any other source/layout/dependency change through this exception.
export function assertCurrentDentalSource() {
  const config = sourceGate.pageSourceConfiguration('dental')
  const report = JSON.parse(readFileSync(config.reportFile, 'utf8'))
  const renamed = report.scopes.find(scope => scope.rootId === '2294:7751')
  if (renamed?.status === 'unchanged') return sourceGate.assertPageCurrent('dental')
  sourceGate.assertCurrentSource({ ...config, roots: config.roots.filter(id => id !== '2294:7751') })
  const review = JSON.parse(readFileSync('docs/figma-source/dental-revision-2026-11-03/profile-frame-name.json', 'utf8'))
  assert.equal(review.nodeId, '2294:7751')
  assert.equal(review.before, '05案例集'); assert.equal(review.after, '05医生简介')
  assert.equal(review.field, 'parameters.name')
  const live = readFileSync(review.liveEvidence)
  assert.equal(createHash('sha256').update(live).digest('hex'), review.liveEvidenceSHA256)
  for (const field of ['addedIds', 'removedIds', 'alternatives', 'dependencyChanges', 'unresolvedImages', 'unresolvedBlobs', 'integrityErrors']) assert.deepEqual(renamed[field], [], `${renamed.rootId}: unexpected ${field}`)
  assert.equal(renamed.beforeNodes, 69); assert.equal(renamed.currentNodes, 69)
  assert.equal(renamed.name, review.after)
  assert.deepEqual(renamed.changedIds, ['2294:7751'])
  const changed = report.changed.find(node => node.id === '2294:7751')
  assert.deepEqual(changed.fields, [{ field: review.field, before: review.before, after: review.after, kind: 'modified' }])
  assert.deepEqual(changed.rawFields, [{ field: 'name', before: review.before, after: review.after, kind: 'modified' }])
  console.log('Dental source: 12 unchanged scopes; profile frame label 05案例集 → 05医生简介 explicitly re-read in live Layers/Dev Mode; raw changed report and historical locks preserved.')
  return report
}
