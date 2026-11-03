const { test } = require('node:test')
const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
function loadAnalytics() {
  const cache = new Map()
  function load(file) {
    if (cache.has(file)) return cache.get(file)
    const module = { exports: {} }
    const requireLocal = name => name.startsWith('@/') ? load(path.join(root, 'src', name.slice(2) + '.ts')) : require(name)
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
    vm.runInThisContext(`(function(module,exports,require){${code}\n})`, { filename: file })(module, module.exports, requireLocal)
    cache.set(file, module.exports)
    return module.exports
  }
  return load(path.join(root, 'src/utils/contactAnalytics.ts'))
}
const storage = () => {
  const values = new Map()
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
}
const context = { locale: 'pt', topic: 'lung_cancer', page: 'patient-home', entry: 'floating', attribution: { utm_source: 'facebook', utm_term: 'lung care' } }
const settle = () => new Promise(resolve => setImmediate(resolve))
test('intentional clicks get distinct IDs; persistent browser and session identities are reused without personal data', async () => {
  const { createContactAnalytics } = loadAnalytics(), store = storage(), session = storage(), sent = []
  const options = { endpoint: '/api/analytics/events', storage: store, sessionStorage: session, randomUUID, send: async (_url, body) => { sent.push(JSON.parse(body)); return { ok: true, status: 202 } } }
  const a = createContactAnalytics(options)
  a.track({ ...context, patientName: 'PRIVATE_PATIENT', attribution: { ...context.attribution, email: 'PRIVATE_EMAIL', gclid: 'PRIVATE_TRACKER' } })
  await settle(); a.track(context); await settle(); a.stop()
  const b = createContactAnalytics(options); b.track(context); await settle(); b.stop()
  assert.equal(sent.length, 3)
  assert.equal(new Set(sent.map(event => event.eventId)).size, 3)
  assert.equal(new Set(sent.map(event => event.visitorId)).size, 1)
  assert.equal(new Set(sent.map(event => event.sessionId)).size, 1)
  assert.ok(!JSON.stringify(sent).includes('PRIVATE_'))
  assert.equal(sent[0].attribution.utm_term, 'lung care')
})
test('failed delivery survives refresh and reuses the same event ID; malformed/stale queued data is discarded', async () => {
  const { createContactAnalytics } = loadAnalytics(), store = storage(), session = storage(), sent = []
  const options = { endpoint: '/api/analytics/events', storage: store, sessionStorage: session, randomUUID, later: () => 1 }
  const first = createContactAnalytics({ ...options, send: async (_url, body) => { sent.push(JSON.parse(body)); throw Error('offline') } })
  first.track(context); await settle(); first.stop()
  const retry = createContactAnalytics({ ...options, send: async (_url, body) => { sent.push(JSON.parse(body)); return { ok: true, status: 202 } } })
  await retry.flush(); retry.stop()
  assert.equal(sent.length, 2); assert.equal(sent[0].eventId, sent[1].eventId)
  assert.deepEqual(JSON.parse(session.getItem('huanyu.contact-events.v1')), [])
  session.setItem('huanyu.contact-events.v1', JSON.stringify([{ ...sent[0], occurredAt: '2000-01-01T00:00:00Z' }, { patientName: 'PRIVATE_PATIENT' }]))
  const invalid = createContactAnalytics({ ...options, send: async () => { throw Error('must not send') } })
  await invalid.flush(); invalid.stop()
  assert.deepEqual(JSON.parse(session.getItem('huanyu.contact-events.v1')), [])
})
test('storage failures leave tracking usable; queues are bounded and expired visitor identities rotate', async () => {
  const { createContactAnalytics } = loadAnalytics(), sent = []
  const blocked = { getItem() { throw Error('blocked') }, setItem() { throw Error('blocked') } }
  const t = createContactAnalytics({ endpoint: '/api/analytics/events', storage: blocked, sessionStorage: blocked, randomUUID, send: async (_url, body) => { sent.push(JSON.parse(body)); return { ok: true, status: 202 } } })
  t.track(context); await settle(); t.stop(); assert.equal(sent.length, 1)
  let time = Date.now(); const persistent = storage(), session = storage()
  const options = { endpoint: '/api/analytics/events', storage: persistent, sessionStorage: session, randomUUID, now: () => time, later: () => 1, send: async () => ({ ok: false, status: 503 }) }
  const q = createContactAnalytics(options)
  for (let i = 0; i < 40; i++) q.track(context)
  await settle(); q.stop()
  assert.equal(JSON.parse(session.getItem('huanyu.contact-events.v1')).length, 20)
  const previous = JSON.parse(persistent.getItem('huanyu.contact-visitor.v1')).id
  time += 181 * 86400_000
  const next = createContactAnalytics(options); next.stop()
  assert.notEqual(JSON.parse(persistent.getItem('huanyu.contact-visitor.v1')).id, previous)
  assert.equal(JSON.parse(session.getItem('huanyu.contact-events.v1')).length, 0)
})
test('frontend topic/locale/marketing catalogs match the backend validation contract', () => {
  const source = ts.createSourceFile('schema.ts', fs.readFileSync(path.resolve(root, '../Studio-huanyu-Server/src/analytics/schema.ts'), 'utf8'), ts.ScriptTarget.Latest, true)
  const arrays = {}
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ['analyticsTopics', 'analyticsLocales', 'marketingKeys'].includes(node.name.getText(source))) {
      const value = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer
      arrays[node.name.getText(source)] = value.elements.map(item => item.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  const aliases = fs.readFileSync(path.join(root, 'src/data/contactTopics.ts'), 'utf8')
  const topicFile = ts.createSourceFile('contactTopics.ts', aliases, ts.ScriptTarget.Latest, true)
  let topics
  function topicVisit(node) { if (ts.isVariableDeclaration(node) && node.name.getText(topicFile) === 'contactTopicAliases') topics = node.initializer.properties.map(p => p.name.text); ts.forEachChild(node, topicVisit) }
  topicVisit(topicFile)
  assert.deepEqual(topics.sort(), arrays.analyticsTopics.sort())
  assert.deepEqual(arrays.analyticsLocales, ['zh', 'en', 'id', 'ms', 'pt'])
  assert.deepEqual(arrays.marketingKeys, ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'source_id'])
})
