import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const root = process.cwd()
const evidence = join(root, 'artifacts/patient-updates-2026-10-31/physicians')
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
const sourceSHA = '83d02e83c0293e6924dd217e79b314b167b7847f21eab7e7e851b6d4a6846421'
assert.equal(await hash(data.source), sourceSHA, 'Archived physician document changed; reimport and verify it')
assert.equal(verification.docxSHA256, sourceSHA)
assert.equal(verification.records, 57)
assert.equal(verification.dataSHA256, await hash(dataPath), 'DOCX content verification predates the runtime data')
assert.equal(verification.importerSHA256, await hash('scripts/build-yaoying-physicians.py'), 'DOCX importer changed after source verification')
assert.equal(data.recordCount, 57)
assert.equal(data.records.length, 57)
assert.equal(new Set(data.records.map(record => record.id)).size, 57)
assert.equal(data.departments.length, 34)
assert.deepEqual(data.departments, [...new Set(data.records.map(record => record.departmentSource))].sort())
assert.equal(qa.dataSHA256, await hash(dataPath), 'Directory data changed after browser QA')
assert.equal(data.sourceSHA256, sourceSHA)
assert.equal(data.publicationOverrides.sha256, await hash(data.publicationOverrides.source))
assert.equal(verification.overridesSHA256, data.publicationOverrides.sha256)
assert.deepEqual(data.publicationOverrides.recordIds,['yaoying-119'])
const zhou=data.records.find(r=>r.id==='yaoying-119')
assert.ok(zhou.specialty.includes('血液肿瘤')&&!/精神|抑郁|焦虑/.test(zhou.professionalExpertise.join(' ')))
const original=[
 {id:'figma-1741-5785',name:'谭兆林',departmentSource:'口腔科',sourceExpert:-1},
 {id:'figma-2324-8478',name:'徐宇',departmentSource:'骨软组织外科',sourceExpert:0},
 data.records.find(r=>r.name==='周莉莉'),data.records.find(r=>r.name==='柳光宇'),
 {id:'figma-1741-5869',name:'陈疾忤',departmentSource:'运动医学科',sourceExpert:3},
]
const merged=[...original,...data.records.filter(r=>!original.some(old=>old.name===r.name))]
assert.equal(merged.length,60)
const departments=[...new Set(merged.map(r=>r.departmentSource))].sort()
assert.equal(departments.length,36)


const codeFiles = ['src/views/patient/PhysicianView.vue', 'src/data/physicianFigmaSource.ts', 'src/data/physicianAvatars.json', 'src/components/common/PhysicianProfileDialog.vue', 'src/components/layout/PatientDesktopNavigation.vue', 'src/composables/usePatientNavigation.ts']
for (const file of codeFiles) assert.equal(qa.codeSHA256[file], await hash(file), `${file}: changed after browser QA`)
assert.deepEqual(qa.errors, [])
assert.deepEqual(qa.failedRequests, [])
assert.ok(Number.isFinite(Date.parse(qa.checkedAt)))

assert.equal(qa.filterResults.length, 42)
const shortcuts = [['全部', ''], ['牙科', '口腔科'], ['运动医学科', '运动医学科'], ['血液内科主任', '血液内科'], ['骨软组织外科', '骨软组织外科'], ['乳腺外科', '乳腺外科']]
const filters = [
  ...shortcuts.map(([label, department]) => ({ type: 'shortcut', label, department })),
  ...departments.map(department => ({ type: 'department', label: department, department })),
]
for (const { type, label, department } of filters) {
  const result = qa.filterResults.find(item => item.type === type && item.label === label)
  assert.ok(result, `${type} ${label}: filter evidence missing`)
  const ids = merged.filter(record => !department || record.departmentSource === department).map(record => record.id)
  assert.equal(result.count, ids.length)
  assert.deepEqual(result.ids, ids, `${label}: filter omitted or misclassified a doctor`)
}

assert.deepEqual(qa.dialogResults.map(result => result.id), merged.map(record => record.id))
const portraits = new Set(['周莉莉::血液内科', '柳光宇::乳腺外科', '陈疾忤::骨科'])
const assignments = await read(join(root, 'src/data/physicianAvatars.json'))
const avatarManifest = await read(join(root, 'docs/source/physicians/avatar-assignments.json'))
assert.equal(avatarManifest.count, 55)
assert.equal(avatarManifest.assignments.length, 55)
assert.equal(new Set(avatarManifest.assignments.map(item => item.sourceFile)).size, 55)
for (const item of avatarManifest.assignments) {
  assert.deepEqual(assignments[item.id], { gender: item.gender, avatar: item.avatar })
  assert.equal(await hash(`public${item.avatar}`), item.sha256)
}
assert.deepEqual(qa.avatarAssignments, { count: 55, male: 30, female: 25, unique: true, preserved: ['周莉莉', '柳光宇', '谭兆林', '徐宇', '陈疾忤'], totalWebpBytes: 404918 })
for (const record of merged) {
  const result = qa.dialogResults.find(item => item.id === record.id)
  assert.equal(result.name, record.name)
  assert.equal(result.department, record.departmentSource)
  if(record.sourceExpert!==undefined) {
    assert.equal(result.sourceExpert,record.sourceExpert)
    assert.equal(result.portrait,true)
    assert.equal(result.tabs.length,record.sourceExpert===-1?5:record.sourceExpert===0?3:4)
    for (const key of ['content','keyboard','close','focusRestore','scrollRestore']) assert.equal(result[key],true)
    continue
  }
  assert.equal(result.portrait, Boolean(assignments[record.id] || portraits.has(`${record.name}::${record.departmentSource}`)))
  const tabs = [
    ['专业擅长', record.professionalExpertise.length ? record.professionalExpertise : record.specialty ? [record.specialty] : []],
    ['专业任职', record.career], ['学术任职', record.academic], ['科研成果', record.research], ['可提供的跨境医疗服务', record.crossBorderServices],
  ].filter(([, values]) => values.length).map(([label]) => label)
  assert.deepEqual(result.tabs, tabs)
  for (const key of ['content', 'keyboard', 'close', 'focusRestore', 'scrollRestore']) assert.equal(result[key], true, `${record.id}: ${key} failed`)
}

// Only unchanged Figma regions are pixel-compared. The merged directory adds 55 cards;
// claiming the complete page still matches the five-card sample would be false.
assert.ok(qa.visual.heroNMAE >= 0 && qa.visual.heroNMAE < .01)
assert.deepEqual(qa.visual.heroComparedRegion, { x: 0, y: 64, width: 1440, height: 396, excluded: 'authorized shared navigation correction; checked separately' })
assert.ok(qa.visual.footerNMAE >= 0 && qa.visual.footerNMAE < .01)
assert.ok(Math.abs(qa.visual.cardGeometry.width - 389.33334) < .01)
assert.equal(qa.visual.cardGeometry.height, 284)
assert.equal(qa.visual.cardGeometry.x, 112)
assert.equal(qa.visual.cardGeometry.y, 646)
assert.deepEqual(qa.layouts.map(layout => layout.width), [1024, 1280, 1440, 1920])
for (const layout of qa.layouts) { assert.equal(layout.scrollWidth, layout.width); assert.equal(layout.cards, 60); assert.deepEqual(layout.broken, []) }

const dependencies = ['src/utils/sourceBaseline.ts','src/composables/usePatientMotion.ts','src/data/homeExpertSource.ts','src/components/common/homeExpertDialog.ts','src/components/common/dentalSourceDialog.ts','src/data/dentalFigmaDetails.ts',...codeFiles, dataPath, 'src/components/common/HospitalFigmaCanvas.vue', 'src/components/common/HomeSourceNode.vue', 'src/components/layout/PatientLayout.vue', 'src/components/layout/PatientHeader.vue', 'src/data/hospitalFigmaSource.ts']
const changed = Math.max(...await Promise.all(dependencies.map(async file => (await stat(join(root, file))).mtimeMs)))
for (const file of ['all-desktop-1440.png', 'desktop-1024.png', 'desktop-1280.png', 'desktop-1440.png', 'desktop-1920.png', 'dialog-yaoying-143.png', 'dialog-yaoying-119.png', 'dialog-figma-1741-5785.png', 'dialog-figma-2324-8478.png', 'dialog-figma-1741-5869.png', 'local-hero-2x.png', 'local-footer-2x.png', 'final-乳腺外科.png', 'behavior-qa.json']) {
  assert.ok((await stat(join(evidence, file))).mtimeMs >= changed, `${file}: evidence predates directory implementation`)
}
console.log('physician directory gate passed: current Figma sources unchanged, 57 document profiles + 3 retained doctors, 36 department filters + 6 shortcuts, all detail content/close/focus/scroll checks, four desktop widths and unchanged-source crops <1%')
