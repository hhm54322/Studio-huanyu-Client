import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { discoverRuntimePath, FIGMA_FILE_ID, verifyFigmaConnection } from './figma-connect.mjs'

test('discovers newest existing runtime numerically, skips incomplete installations', async t => {
  const root = await mkdtemp(join(tmpdir(), 'huanyu-figma-runtime-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  for (const version of ['26.99.1', '26.1023.2', '26.1023.12']) {
    await mkdir(join(root, version, 'scripts'), { recursive: true })
    await writeFile(join(root, version, 'scripts/browser-client.mjs'), '')
  }
  await mkdir(join(root, '26.1024.1'))
  assert.equal(await discoverRuntimePath(root), join(root, '26.1023.12/scripts/browser-client.mjs'))
})

test('missing installations fail at runtime discovery, not Figma authentication', async t => {
  const root = await mkdtemp(join(tmpdir(), 'huanyu-figma-runtime-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await assert.rejects(discoverRuntimePath(root), { stage: 'runtime-discovery' })
})

function fixture({ browsers, tabs, snapshot, snapshots } = {}) {
  const calls = []
  const tab = {
    playwright: { domSnapshot: async () => {
      calls.push('snapshot')
      return snapshot ?? '- main "Figma Design, 1 item selected"\n- button "Layers"\n- treegrid:\n  - row "首页"\n- tabpanel "Inspect"'
    } },
    markHandoff: async () => calls.push('handoff'),
  }
  const browser = { tabs: {
    list: async () => tabs ?? [
      { id: 'qa', url: 'http://127.0.0.1:5173/' },
      { id: 'source', url: `https://www.figma.com/design/${FIGMA_FILE_ID}/file?node-id=143-1251&m=dev` },
    ],
    get: async id => {
      calls.push(id)
      return snapshots ? { ...tab, playwright: { domSnapshot: async () => snapshots[id] } } : tab
    },
  } }
  const agent = { browsers: {
    list: async () => browsers ?? [{ id: 'iab-current', type: 'iab', metadata: { codexSessionId: 'current' } }],
    get: async id => { calls.push(id); return browser },
  } }
  return { agent, calls, sessionId: 'current', runtimePath: '/installed/browser-client.mjs' }
}

test('Chrome or another session cannot substitute for the current IAB', async () => {
  const context = fixture({ browsers: [
    { id: 'chrome', type: 'extension' },
    { id: 'other', type: 'iab', metadata: { codexSessionId: 'other-session' } },
  ] })
  await assert.rejects(verifyFigmaConnection(context), { stage: 'browser-discovery' })
  assert.deepEqual(context.calls, [])
})

test('missing source tab never creates duplicate tabs or uses the local QA page', async () => {
  const context = fixture({ tabs: [{ id: 'qa', url: 'http://127.0.0.1:5173/' }] })
  await assert.rejects(verifyFigmaConnection(context), { stage: 'tab-discovery' })
  assert.deepEqual(context.calls, ['iab-current'])
})

for (const snapshot of [
  '- main "Board, View only"',
  '- heading "Log in to Figma"',
  '- main "Figma Design"\n- button "Layers"',
  '- main "Figma Design"\n- button "Layers"\n- tabpanel "Inspect"',
]) {
  test(`unverified content cannot report a successful connection: ${snapshot.split('\n')[0]}`, async () => {
    const context = fixture({ snapshot })
    await assert.rejects(verifyFigmaConnection(context), { stage: 'design-verification' })
    assert.ok(!context.calls.includes('handoff'))
  })
}

test('success requires the real Design snapshot and returns source evidence', async () => {
  const context = fixture()
  const result = await verifyFigmaConnection(context)
  assert.equal(result.evidence.verified, true)
  assert.equal(result.evidence.sourceNodeId, '143:1251')
  assert.deepEqual(result.evidence.checks, { design: true, layers: true, properties: true })
  assert.deepEqual(context.calls, ['iab-current', 'source', 'snapshot', 'handoff'])
})

test('an existing stale first tab does not hide a working source tab', async () => {
  const context = fixture({
    tabs: ['stale', 'working'].map(id => ({ id, url: `https://www.figma.com/design/${FIGMA_FILE_ID}/` })),
    snapshots: {
      stale: '- main "Board, View only"',
      working: '- main "Figma Design"\n- button "Layers"\n- treegrid:\n  - row "首页"\n- tab "Inspect"',
    },
  })
  const result = await verifyFigmaConnection(context)
  assert.equal(result.evidence.tabId, 'working')
  assert.deepEqual(context.calls, ['iab-current', 'stale', 'working', 'handoff'])
})

test('current unlabeled Figma role snapshot exposes actual Layers and Dev Mode content', async () => {
  const context = fixture({ snapshot: '- application\n- button:\n  - generic: pc改版\n- button:\n  - generic: Layers\n- treegrid:\n  - row:\n    - generic: 01寰宇云医 - 首页\n- tabpanel:\n  - generic: Layer properties\n- radio:\n  - generic: Dev Mode' })
  const result = await verifyFigmaConnection(context)
  assert.deepEqual(result.evidence.checks, { design: true, layers: true, properties: true })
})
