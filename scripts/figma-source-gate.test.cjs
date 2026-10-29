const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { prepareDocument, compareDocuments, assertCurrentSource, digest, main } = require('./figma-source-gate.cjs')

const id = value => { const [sessionID, localID] = value.split(':').map(Number); return { sessionID, localID } }
const node = (key, name, type, parent, position, props = {}) => ({ guid: id(key), name, type, ...(parent ? { parentIndex: { guid: id(parent), position } } : {}), ...props })
function fixture() {
  return prepareDocument({ file: 'fixture.fig', sha256: 'fixture', exportedAt: new Date().toISOString(), archive: {}, blobs: [], nodes: new Map([
    ['0:0', node('0:0', 'Document', 'DOCUMENT')],
    ['143:2', node('143:2', 'pc改版', 'CANVAS', '0:0', 'a')],
    ['1:1', node('1:1', 'Dental', 'FRAME', '143:2', 'a', { size: { x: 1440, y: 1156 }, transform: { m00: 1, m01: 0, m02: 20, m10: 0, m11: 1, m12: 30 } })],
    ['1:2', node('1:2', 'Title', 'TEXT', '1:1', 'a', { textData: { characters: '选择项目' }, fontSize: 24, opacity: 1, size: { x: 200, y: 40 }, transform: { m00: 1, m01: 0, m02: 20, m10: 0, m11: 1, m12: 30 } })],
    ['1:3', node('1:3', 'Tiny hidden state', 'FRAME', '1:1', 'b', { size: { x: 20, y: 20 }, visible: false })],
  ]) })
}
const clone = doc => prepareDocument(structuredClone(doc))
const compare = (a, b) => compareDocuments(a, b, { roots: ['1:1'] })
const fields = report => report.changed.flatMap(row => row.fields.map(field => `${row.id}/${field.field}`))

test('identical document is unchanged, including all small/hidden nodes', () => {
  const source = fixture(), report = compare(source, clone(source))
  assert.equal(report.status, 'unchanged')
  assert.equal(report.current.nodeCount, 5)
  assert.equal(report.scopes[0].currentNodes, 3)
})

test('editor timestamp changes remain visible as provenance, not design modifications', () => {
  const source = fixture(), current = clone(source)
  current.nodes.get('1:2').editInfo = { lastEditedAt: 100 }
  const report = compare(source, current)
  assert.equal(report.scopes[0].status, 'unchanged')
  assert.equal(report.metadataOnly[0].fields[0].field, 'editInfo')
})

test('same-sized frame internal text, typography, fractional spacing and opacity are located', () => {
  for (const [field, value] of [['fontSize', 24.125], ['opacity', .7], ['textData', { characters: '新项目' }], ['stackSpacing', 7.5]]) {
    const source = fixture(), current = clone(source)
    current.nodes.get('1:2')[field] = value
    const report = compare(source, current)
    assert.equal(report.scopes[0].status, 'changed')
    assert.ok(fields(report).some(path => path.startsWith(`1:2/parameters.${field}`)))
    assert.equal(report.scopes[0].changedIds[0], '1:2')
  }
})

test('added, removed, renamed, reordered, reparented and hidden states are detected', () => {
  const source = fixture(), current = clone(source)
  current.nodes.delete('1:2')
  current.nodes.get('1:3').visible = true
  current.nodes.get('1:3').name = 'Revealed state'
  current.nodes.set('2:1', node('2:1', 'Small popover', 'FRAME', '1:1', 'a', { size: { x: 8, y: 8 } }))
  prepareDocument(current)
  const report = compare(source, current)
  assert.ok(report.added.some(row => row.id === '2:1'))
  assert.ok(report.removed.some(row => row.id === '1:2'))
  assert.ok(fields(report).includes('1:3/parameters.visible'))
  const reordered = clone(source)
  reordered.nodes.get('1:3').parentIndex.position = '0'
  prepareDocument(reordered)
  assert.ok(fields(compare(source, reordered)).some(path => path.startsWith('1:1/children')))
  reordered.nodes.get('1:3').parentIndex.guid = id('143:2')
  prepareDocument(reordered)
  assert.ok(fields(compare(source, reordered)).includes('1:3/parentId'))
})

test('same-name added source is detected even if the old source remains', () => {
  const source = fixture(), current = clone(source)
  current.nodes.set('2:1', node('2:1', 'Dental', 'FRAME', '143:2', 'b', { size: { x: 1440, y: 2052 } }))
  prepareDocument(current)
  const report = compare(source, current)
  assert.equal(report.alternatives.length, 1)
  assert.equal(report.alternatives[0].oldRetained, true)
  assert.equal(report.scopes[0].status, 'changed')
  current.nodes.delete('1:1')
  assert.equal(compare(source, prepareDocument(current)).alternatives[0].oldRetained, false)
})

test('shared variables and alias chains invalidate a consumer whose own binding did not change', () => {
  const alias = { value: { alias: { guid: id('2:1') } } }
  for (const binding of [
    { parameterConsumptionMap: { entries: [{ variableData: alias }] } },
    { fillPaints: [{ type: 'SOLID', colorVar: alias }] },
    { textData: { styleOverrideTable: [{ styleIdForText: { guid: id('2:1') } }] } },
  ]) {
    const source = fixture()
    Object.assign(source.nodes.get('1:2'), binding)
    source.nodes.set('2:1', node('2:1', 'Text size alias', 'VARIABLE', '0:0', 'b', { variableDataValues: { entries: [{ variableData: { value: { alias: { guid: id('2:2') } } } }] } }))
    source.nodes.set('2:2', node('2:2', 'Text size', 'VARIABLE', '0:0', 'c', { variableDataValues: { entries: [{ variableData: { value: 24 } }] } }))
    prepareDocument(source)
    const current = clone(source)
    current.nodes.get('2:2').variableDataValues.entries[0].variableData.value = 26
    const scope = compare(source, current).scopes[0]
    assert.equal(scope.status, 'changed')
    assert.deepEqual(scope.changedIds, [])
    assert.deepEqual(scope.dependencyChanges.map(row => row.id), ['2:2'])
  }
})

test('shared style and component descendants invalidate every referencing source', () => {
  for (const binding of [{ styleIdForFill: { guid: id('2:1') } }, { symbolData: { symbolID: id('2:1') } }]) {
    const source = fixture()
    Object.assign(source.nodes.get('1:2'), binding)
    source.nodes.set('2:1', node('2:1', 'Shared source', 'COMPONENT', '143:2', 'b'))
    source.nodes.set('2:2', node('2:2', 'Component text', 'TEXT', '2:1', 'a', { fontSize: 18 }))
    prepareDocument(source)
    const current = clone(source)
    current.nodes.get('2:2').fontSize = 20
    const scope = compare(source, current).scopes[0]
    assert.equal(scope.status, 'changed')
    assert.deepEqual(scope.changedIds, [])
    assert.deepEqual(scope.dependencyChanges.map(row => row.id), ['2:2'])
    current.nodes.delete('2:1')
    assert.ok(compare(source, prepareDocument(current)).scopes[0].dependencyChanges.some(row => row.id === '2:1' && row.kind === 'removed'))
  }
})

test('only source canvas translation is separate; internal movement and source rotation remain significant', () => {
  const source = fixture(), current = clone(source)
  current.nodes.get('1:1').transform.m02 += 10
  const moved = compare(source, current)
  assert.equal(moved.scopes[0].status, 'unchanged')
  assert.equal(moved.canvasPlacement.length, 1)
  current.nodes.get('1:1').transform.m00 = .8
  assert.ok(fields(compare(source, current)).includes('1:1/parameters.transform.m00'))
  current.nodes.get('1:2').transform.m12 += .125
  assert.ok(fields(compare(source, current)).includes('1:2/parameters.transform.m12'))
})

test('exact duplicate gradient authored color is metadata; changed alpha/color space/binding is not', () => {
  const source = fixture(), color = { r: .1, g: .2, b: .3, a: .4 }
  source.nodes.get('1:2').fillPaints = [{ type: 'GRADIENT_LINEAR', stopsVar: [{ position: 0, color }] }]
  const current = clone(source), stop = current.nodes.get('1:2').fillPaints[0].stopsVar[0]
  stop.authoredColor = { space: 'DEFAULT', c0: .1, c1: .2, c2: .3, c3: .4 }
  const metadata = compare(source, current)
  assert.equal(metadata.scopes[0].status, 'unchanged')
  assert.equal(metadata.metadataOnly.length, 1)
  stop.authoredColor.c3 = .5
  assert.equal(compare(source, current).scopes[0].status, 'changed')
  stop.authoredColor.c3 = .4
  stop.authoredColor.space = 'DISPLAY_P3'
  assert.equal(compare(source, current).scopes[0].status, 'changed')
  stop.authoredColor.space = 'DEFAULT'
  stop.colorVar = { variableID: 'new-binding' }
  assert.equal(compare(source, current).scopes[0].status, 'changed')
})

test('image replacement, crop, scale mode and alpha are independently located', () => {
  const source = fixture(), bytes = Buffer.from('official-image'), hash = digest(bytes, 'sha1')
  source.archive[`images/${hash}`] = bytes
  source.nodes.get('1:2').fillPaints = [{ type: 'IMAGE', image: { hash: Buffer.from(hash, 'hex') }, opacity: 1, imageScaleMode: 'FILL', transform: { m02: .2 } }]
  for (const mutate of [paint => { paint.opacity = .9 }, paint => { paint.transform.m02 = .3 }, paint => { paint.imageScaleMode = 'FIT' }, paint => { paint.image.hash = Buffer.from(digest('replacement', 'sha1'), 'hex') }]) {
    const current = clone(source)
    mutate(current.nodes.get('1:2').fillPaints[0])
    assert.equal(compare(source, current).scopes[0].status, 'changed')
  }
})

test('partial export reuses only verified content-addressed bytes; missing or corrupt bytes cannot pass', () => {
  const source = fixture(), bytes = Buffer.from('official-image'), hash = digest(bytes, 'sha1')
  source.archive[`images/${hash}`] = bytes
  source.nodes.get('1:2').fillPaints = [{ type: 'IMAGE', image: { hash: Buffer.from(hash, 'hex') } }]
  const current = clone(source)
  delete current.archive[`images/${hash}`]
  const cached = compare(source, current)
  assert.equal(cached.scopes[0].status, 'unchanged')
  assert.equal(cached.scopes[0].verifiedImages[0].availability, 'verified-content-cache')
  delete source.archive[`images/${hash}`]
  assert.equal(compare(source, current).scopes[0].status, 'unresolved')
  current.archive[`images/${hash}`] = Buffer.from('wrong bytes')
  assert.equal(compare(source, current).scopes[0].integrityErrors.length, 1)
})

test('vector blob relocation is neutral; changed or missing vector data is reported', () => {
  const source = fixture()
  source.blobs = [{ bytes: Buffer.from('vector path') }]
  source.nodes.get('1:2').vectorData = { pathBlob: 0 }
  const current = clone(source)
  current.blobs.unshift({ bytes: Buffer.from('unrelated') })
  current.nodes.get('1:2').vectorData.pathBlob = 1
  assert.equal(compare(source, current).scopes[0].status, 'unchanged')
  current.blobs[1].bytes = Buffer.from('changed path')
  assert.equal(compare(source, current).scopes[0].status, 'changed')
  delete current.blobs[1]
  assert.equal(compare(source, current).scopes[0].unresolvedBlobs.length, 1)
})

test('preflight rejects stale/missing/tampered/uncompared source and reports exact failed nodes', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'figma-source-test-'))
  try {
    const source = fixture(), file = path.join(directory, 'source.fig'), reportFile = path.join(directory, 'report.json')
    fs.writeFileSync(file, 'official-export')
    source.file = file; source.sha256 = digest(fs.readFileSync(file))
    const write = report => fs.writeFileSync(reportFile, JSON.stringify(report))
    assert.throws(() => assertCurrentSource({ roots: ['1:1'], reportFile }), /Missing current Figma/)
    write(compare(source, clone(source)))
    assertCurrentSource({ roots: ['1:1'], reportFile })
    assert.throws(() => assertCurrentSource({ roots: ['1:1'], baselineSHA256: 'wrong baseline', reportFile }), /baseline differs/)
    assert.throws(() => assertCurrentSource({ roots: ['other'], reportFile }), /not included/)
    assert.throws(() => assertCurrentSource({ roots: ['1:1'], reportFile, now: Date.now() + 25 * 3600000 }), /stale/)
    const oldExport = clone(source)
    oldExport.exportedAt = new Date(Date.now() - 25 * 3600000).toISOString()
    write(compare(source, oldExport))
    assert.throws(() => assertCurrentSource({ roots: ['1:1'], reportFile }), /export is stale/)
    oldExport.exportedAt = undefined
    write(compare(source, oldExport))
    assert.throws(() => assertCurrentSource({ roots: ['1:1'], reportFile }), /no valid export time/)
    const changed = clone(source); changed.nodes.get('1:2').fontSize = 25
    write(compare(source, changed))
    assert.throws(() => assertCurrentSource({ roots: ['1:1'], reportFile }), /changed nodes \[1:2\]/)
    fs.writeFileSync(file, 'tampered-export')
    assert.throws(() => assertCurrentSource({ roots: ['1:1'], reportFile }), /differs/)
    assert.throws(() => main(['--write-catalog']), /cannot overwrite/)
    assert.throws(() => main([]), /Usage/)
  } finally { fs.rmSync(directory, { recursive: true, force: true }) }
})
