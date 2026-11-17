// Compare a recovered Figma version with the historical, actual-baseline
// comparison. This is evidence of equal recorded deltas, not byte identity.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const [recoveredPath, recordedPath] = process.argv.slice(2)
if (!recoveredPath || !recordedPath) throw Error('Usage: node scripts/check-dental-historical-evidence.mjs recovered-comparison.json recorded-comparison.json')
const read = async path => JSON.parse(await readFile(path, 'utf8'))
const hash = async path => createHash('sha256').update(await readFile(path)).digest('hex')
const [recovered, recorded] = await Promise.all([read(recoveredPath), read(recordedPath)])
const expectedActualBaseline = '40cfc2a778a324a311807aa26d51799bdfde168e33c00bfb9800f28d62ea1de5'
assert.equal(recorded.baseline.sha256, expectedActualBaseline, 'Recorded baseline must match the source used by doctor-page extraction')
assert.equal(recovered.version, 3)
assert.equal(recorded.version, 3)
assert.equal(await hash(recovered.baseline.file), recovered.baseline.sha256, 'Recovered history file changed')
assert.equal(await hash(recovered.current.file), recovered.current.sha256, 'Retained later source changed')
const ids = ['3421:2534', '3421:2810', '3421:3113', '3421:3380', '3421:3698', '3423:4315']
const results = []
for (const id of ids) {
  const a = recovered.scopes.find(item => item.rootId === id)
  const b = recorded.scopes.find(item => item.rootId === id)
  assert.ok(a && b, `Missing scope ${id}`)
  for (const key of ['addedIds', 'removedIds', 'changedIds', 'dependencyChanges', 'unresolvedImages', 'unresolvedBlobs', 'integrityErrors']) assert.deepEqual(a[key], b[key], `${id}: ${key} differs`)
  for (const [collection, key] of [['added', 'addedIds'], ['removed', 'removedIds'], ['changed', 'changedIds']]) {
    for (const nodeId of a[key]) assert.deepEqual(recovered[collection].find(row => row.id === nodeId), recorded[collection].find(row => row.id === nodeId), `${id}: ${collection}/${nodeId} differs`)
  }
  results.push({ id, equalRecordedDeltas: true, changes: a.changedIds.length, added: a.addedIds.length, removed: a.removedIds.length })
}
console.log(JSON.stringify({ recovered: recovered.baseline, retainedLater: recovered.current, recordedActualBaseline: recorded.baseline, recordedLater: recorded.current, scopes: results, limitation: 'The original source file remains unavailable; matching deltas do not establish byte identity or cover unrelated nodes.' }, null, 2))
