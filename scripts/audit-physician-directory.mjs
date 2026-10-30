import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const root = process.cwd()
const evidence = join(root, 'artifacts/physicians-directory-2026-10-30')
const read = async file => JSON.parse(await readFile(file, 'utf8'))
const hash = async file => createHash('sha256').update(await readFile(join(root, file))).digest('hex')
const { assertCurrentSource } = createRequire(import.meta.url)('./figma-source-gate.cjs')

// The document changes directory content, not the locked Figma composition.
// Keep the historic static-source audit and verify current content separately.
assertCurrentSource({
  roots: ['1689:4814', '1432:7741'],
  baselineSHA256: 'b81bbd3eb95eb33a7a2db2d313f7f6e326e24ce2ad5a1c6c5e82d618308d081e',
  reportFile: join(root, 'artifacts/figma-source-gate/current-physicians-directory.json'),
})
const dataPath = 'src/data/yaoyingPhysicians.json'
const data = await read(join(root, dataPath))
const qa = await read(join(evidence, 'behavior-qa.json'))
const verification = await read(join(evidence, 'data-verification.json'))
const sourceSHA = 'cb05c6c9413afd89de709596dcc0e168f0d23a4c674415cc39447ff3147ff9f2'
assert.equal(await hash(data.source), sourceSHA, 'Archived physician document changed; reimport and verify it')
assert.equal(verification.docxSHA256, sourceSHA)
assert.equal(verification.records, 177)
assert.equal(verification.dataSHA256, await hash(dataPath), 'DOCX content verification predates the runtime data')
assert.equal(verification.importerSHA256, await hash('scripts/build-yaoying-physicians.py'), 'DOCX importer changed after source verification')
assert.equal(data.recordCount, 177)
assert.equal(data.records.length, 177)
assert.equal(new Set(data.records.map(record => record.id)).size, 177)
assert.equal(data.departments.length, 34)
assert.deepEqual(data.departments, [...new Set(data.records.map(record => record.departmentSource))].sort())
assert.equal(qa.dataSHA256, await hash(dataPath), 'Directory data changed after browser QA')

const codeFiles = ['src/views/patient/PhysicianView.vue', 'src/data/physicianFigmaSource.ts', 'src/components/common/PhysicianProfileDialog.vue']
for (const file of codeFiles) assert.equal(qa.codeSHA256[file], await hash(file), `${file}: changed after browser QA`)
assert.deepEqual(qa.errors, [])
assert.deepEqual(qa.failedRequests, [])
assert.ok(Number.isFinite(Date.parse(qa.checkedAt)))

assert.equal(qa.filterResults.length, 40)
const shortcuts = [['全部', ''], ['牙科', '口腔科'], ['骨科', '骨科'], ['血液内科', '血液内科'], ['乳腺外科', '乳腺外科'], ['全科', '全科']]
const filters = [
  ...shortcuts.map(([label, department]) => ({ type: 'shortcut', label, department })),
  ...data.departments.map(department => ({ type: 'department', label: department, department })),
]
for (const { type, label, department } of filters) {
  const result = qa.filterResults.find(item => item.type === type && item.label === label)
  assert.ok(result, `${type} ${label}: filter evidence missing`)
  const ids = data.records.filter(record => !department || record.departmentSource === department).map(record => record.id)
  assert.equal(result.count, ids.length)
  assert.deepEqual(result.ids, ids, `${label}: filter omitted or misclassified a doctor`)
}

assert.deepEqual(qa.dialogResults.map(result => result.id), data.records.map(record => record.id))
const portraits = new Set(['周莉莉::血液内科', '柳光宇::乳腺外科', '陈疾忤::骨科'])
for (const record of data.records) {
  const result = qa.dialogResults.find(item => item.id === record.id)
  assert.equal(result.name, record.name)
  assert.equal(result.department, record.departmentSource)
  assert.equal(result.portrait, portraits.has(`${record.name}::${record.departmentSource}`))
  const tabs = [
    ['专业擅长', record.professionalExpertise.length ? record.professionalExpertise : record.specialty ? [record.specialty] : []],
    ['专业任职', record.career], ['学术任职', record.academic], ['科研成果', record.research], ['可提供的跨境医疗服务', record.crossBorderServices],
  ].filter(([, values]) => values.length).map(([label]) => label)
  assert.deepEqual(result.tabs, tabs)
  for (const key of ['content', 'keyboard', 'close', 'focusRestore', 'scrollRestore']) assert.equal(result[key], true, `${record.id}: ${key} failed`)
}

// Only unchanged Figma regions are pixel-compared. The document adds 172 cards;
// claiming the complete page still matches the five-card sample would be false.
assert.ok(qa.visual.heroNMAE >= 0 && qa.visual.heroNMAE < .01)
assert.ok(qa.visual.footerNMAE >= 0 && qa.visual.footerNMAE < .01)
assert.ok(Math.abs(qa.visual.cardGeometry.width - 389.33334) < .01)
assert.equal(qa.visual.cardGeometry.height, 284)
assert.equal(qa.visual.cardGeometry.x, 112)
assert.equal(qa.visual.cardGeometry.y, 646)
assert.deepEqual(qa.layouts.map(layout => layout.width), [1024, 1280, 1440, 1920])
for (const layout of qa.layouts) { assert.equal(layout.scrollWidth, layout.width); assert.equal(layout.cards, 177); assert.deepEqual(layout.broken, []) }

const dependencies = [...codeFiles, dataPath, 'src/components/common/HospitalFigmaCanvas.vue', 'src/components/common/HomeSourceNode.vue', 'src/components/layout/PatientLayout.vue', 'src/components/layout/PatientHeader.vue', 'src/data/hospitalFigmaSource.ts']
const changed = Math.max(...await Promise.all(dependencies.map(async file => (await stat(join(root, file))).mtimeMs)))
for (const file of ['all-desktop-1440.png', 'desktop-1024.png', 'desktop-1280.png', 'desktop-1440.png', 'desktop-1920.png', 'dialog-yaoying-143.png', 'dialog-yaoying-119.png', 'dialog-yaoying-091.png', 'dialog-yaoying-187.png', 'dialog-yaoying-133.png', 'local-hero-2x.png', 'local-footer-2x.png', 'final-乳腺外科.png', 'behavior-qa.json']) {
  assert.ok((await stat(join(evidence, file))).mtimeMs >= changed, `${file}: evidence predates directory implementation`)
}
console.log('physician directory gate passed: current Figma sources unchanged, 177 document profiles, 34 department filters + 6 shortcuts, all detail content/close/focus/scroll checks, four desktop widths and unchanged-source crops <1%')
