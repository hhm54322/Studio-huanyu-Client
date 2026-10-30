import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const root = process.cwd()
const archive = join(root, 'docs/source/dental-physicians')
const dataFile = 'src/data/dentalPhysicians.json'
const evidence = join(root, 'artifacts/dental-physicians-2026-10-30/development')
const readJson = async file => JSON.parse(await readFile(file, 'utf8'))
const digest = async file => createHash('sha256').update(await readFile(file)).digest('hex')
const names = ['车英林', '万前程', '李腾', '黄建荣', '郑锐', '蒋刚']
const sourceHashes = {
  '寰宇云医牙科平台-医生信息文字版.docx': '0880dfb4927b0cd7a1a4bd5d623de8a5f89c6e2c959f37f2f794781281be6b10',
  '医生介绍（全）.docx': '5b09591e6c4a541cc7476a23fa16579cedf50f92a068491dd8fac78a36d66b3a',
}

for (const [name, expected] of Object.entries(sourceHashes)) {
  const file = join(archive, name)
  await access(file)
  assert.equal(await digest(file), expected, `${name}: archived source changed`)
}

const data = await readJson(join(root, dataFile))
assert.equal(data.records.length, 6)
assert.deepEqual(data.records.map(record => record.name), names)
assert.equal(data.treatment.length, 6)
assert.equal(data.services.length, 10)
for (const [name, expected] of Object.entries(sourceHashes)) {
  const source = data.sources.find(item => item.path.endsWith(name))
  assert.ok(source, `${name}: data source missing`)
  assert.equal(source.sha256, expected)
}
for (const record of data.records) {
  assert.ok(record.bio && record.credentials.length === 4 && record.professionalFields.length)
  assert.ok(record.originalCredentials.length)
  assert.ok(record.hospital.startsWith('寰宇云医齿科（深圳）'))
  assert.equal(record.rating, '', `${record.name}: sample rating leaked into live data`)
  assert.equal(record.cases, '0', `${record.name}: sample case count leaked into live data`)
  assert.equal((record.caseStudies ?? []).length, 0, `${record.name}: cases must come from supplied authorised records`)
  const asset = data.assets.find(item => item.name === record.name)
  assert.ok(asset, `${record.name}: portrait manifest missing`)
  assert.equal(await digest(join(root, asset.projectPath)), asset.sha256, `${record.name}: portrait changed`)
}
const cardAssets = await readJson(join(archive, 'card-assets.json'))
assert.deepEqual(cardAssets.assets.map(asset => asset.nodeId), ['2294:7091', '2294:7092'])
for (const asset of cardAssets.assets) {
  assert.equal(asset.productionUsage, false)
  assert.equal(asset.projectPath, null)
  assert.equal(asset.width, 160); assert.equal(asset.height, 160)
  assert.ok(asset.bytes < 12000)
}

const sourceGate = await readJson(join(root, 'artifacts/figma-source-gate/latest-dental.json'))
assert.equal(sourceGate.scopes.length, 13)
assert.ok(sourceGate.scopes.every(scope => scope.status === 'unchanged'), 'A dental Figma source scope changed after extraction')
assert.deepEqual(sourceGate.unresolvedImages, [])
assert.deepEqual(sourceGate.unresolvedBlobs, [])
assert.deepEqual(sourceGate.integrityErrors, [])

const connection = await readJson(join(root, 'artifacts/dental-physicians-2026-10-30/connection.json'))
assert.equal(connection.verified, true)
assert.equal(connection.checks.design && connection.checks.layers && connection.checks.properties, true)
const qa = await readJson(join(evidence, 'behavior-qa.json'))
const production = await readJson(join(root, 'artifacts/dental-physicians-2026-10-30/production/behavior-qa.json'))
for (const key of ['doctors', 'filters', 'layouts', 'submission', 'motion', 'dataSHA256', 'codeSHA256', 'errors', 'failedRequests']) assert.deepEqual(production[key], qa[key], `Production differs for ${key}`)
assert.ok(production.visual.heroNMAE < 0.01)
assert.ok(production.visual.footerNMAE < 0.01)
for (const result of [qa, production]) {
  assert.equal(result.visual.casePreview.omitted, true, 'No real detail cases: production cards must not show illustrative case previews')
  assert.ok(result.visual.rating.nMAE < .01)
  assert.ok(result.visual.rating.pixelmatch < .01)
  if (!result.visual.casePreview.omitted) {
    assert.ok(result.visual.casePreview.nMAE < .01)
    assert.ok(result.visual.casePreview.pixelmatch < .01)
  }
}
const caseRegression = await readJson(join(root, 'artifacts/dental-physicians-2026-10-30/case-regression/result.json'))
assert.deepEqual(caseRegression.cardsWithRealDetailCases, [101, 104])
for (const key of ['staleCountIgnored', 'incompleteCaseIgnored', 'perDoctorImagesMatchDetail', 'mixedRows', 'emptyFilter', 'reset']) assert.equal(caseRegression[key], true)
assert.equal(caseRegression.realDataSent, false)
assert.deepEqual(caseRegression.errors, [])
assert.equal(qa.doctors.length, 6)
assert.deepEqual(qa.doctors.map(item => item.id), data.records.map(record => record.id))
for (const item of qa.doctors) for (const key of ['content', 'bottomReachable', 'institution', 'directCases', 'focusRestore', 'scrollRestore', 'keyboard']) assert.equal(item[key], true, `${item.id}: ${key}`)
assert.equal(qa.filters.length, 15)
assert.deepEqual(qa.layouts.map(item => item.width), [1024, 1280, 1440, 1920])
for (const layout of qa.layouts) { assert.equal(layout.width, layout.scrollWidth); assert.equal(layout.cards, 6); assert.deepEqual(layout.broken, []) }
assert.deepEqual(qa.errors, [])
assert.deepEqual(qa.failedRequests, [])
assert.ok(qa.visual.heroNMAE < 0.01)
assert.ok(qa.visual.footerNMAE < 0.01)
assert.ok(Math.abs(qa.visual.cardGeometry.first.width - 389.33334) < 0.02)
assert.equal(qa.visual.cardGeometry.first.height, data.records[0].cases === '0' ? 338 : 496)
assert.deepEqual(qa.submission, { doctorIds: [101, 102, 103, 104, 105, 106], failureRetry: true, duplicateBlocked: true, reusedRequestId: true, realDataSent: false })
assert.deepEqual(qa.motion, { settled: true, reduced: true })

const modified = Math.max(...await Promise.all([
  dataFile,
  'src/components/common/DentalDesktopFlow.vue',
  'src/components/common/DentalDoctorSourceDialog.vue',
  'src/components/common/DentalPhysicianDocumentContent.vue',
  'src/components/common/DentalSourceCanvas.vue',
  'src/components/common/HomeSourceNode.vue',
  'src/data/dentalPhysicianData.ts',
  'src/data/dentalPhysicianSource.ts',
  'src/views/patient/DentalView.vue',
].map(async file => (await stat(join(root, file))).mtimeMs)))
assert.ok((await stat(join(evidence, 'behavior-qa.json'))).mtimeMs >= modified, 'QA evidence predates current implementation')
for (const [file, expected] of Object.entries(qa.codeSHA256)) assert.equal(await digest(join(root, file)), expected, `${file}: changed after QA`)
assert.equal(qa.dataSHA256, await digest(join(root, dataFile)))

console.log('Dental physician gate passed: archived DOCX hashes, six records, six portraits, 13 current Figma scopes, profile/tabs/institution content, filters, responsive desktop widths, quote retry and reduced-motion evidence.')
