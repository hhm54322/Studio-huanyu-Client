#!/usr/bin/env node
// Compare explicit official exports; never accept/overwrite an implementation
// baseline. Inventory every node, including hidden layers and small states.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { inflateRawSync } = require('node:zlib')
const root = path.resolve(__dirname, '..')
const digest = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex')
const guid = value => value ? `${value.sessionID}:${value.localID}` : null
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}

function parseFigma(file, parserDirectory = process.env.HUANYU_FIGMA_PARSER || path.join(root, '../tmp/figma-change-audit/node_modules')) {
  const UZIP = require(path.join(parserDirectory, 'uzip'))
  const { decompress } = require(path.join(parserDirectory, 'fzstd'))
  const { ByteBuffer, compileSchema, decodeBinarySchema } = require(path.join(parserDirectory, 'kiwi-schema'))
  const bytes = fs.readFileSync(file)
  const archive = UZIP.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
  const canvas = archive['canvas.fig']
  assert.ok(canvas && Buffer.from(canvas.subarray(0, 8)).toString() === 'fig-kiwi', `${file}: invalid Figma archive`)
  const view = new DataView(canvas.buffer, canvas.byteOffset, canvas.byteLength), chunks = []
  for (let offset = 12; offset < canvas.length;) {
    const length = view.getUint32(offset, true)
    offset += 4
    assert.ok(length && offset + length <= canvas.length, `${file}: invalid Kiwi chunk`)
    const chunk = canvas.subarray(offset, offset + length)
    chunks.push(chunk[0] === 0x28 && chunk[1] === 0xb5 ? decompress(chunk) : inflateRawSync(chunk))
    offset += length
  }
  const message = compileSchema(decodeBinarySchema(new ByteBuffer(chunks[0]))).decodeMessage(new ByteBuffer(chunks[1]))
  const meta = JSON.parse(Buffer.from(archive['meta.json']).toString())
  return prepareDocument({
    file: path.resolve(file), sha256: digest(bytes), exportedAt: meta.exported_at,
    archive, blobs: message.blobs || [], nodes: new Map(message.nodeChanges.map(node => [guid(node.guid), node])),
  })
}

function prepareDocument(doc) {
  doc.children = new Map()
  for (const node of doc.nodes.values()) {
    const parent = guid(node.parentIndex?.guid)
    if (!doc.children.has(parent)) doc.children.set(parent, [])
    doc.children.get(parent).push(guid(node.guid))
  }
  for (const children of doc.children.values()) children.sort((a, b) => {
    const x = doc.nodes.get(a).parentIndex?.position ?? '', y = doc.nodes.get(b).parentIndex?.position ?? ''
    return x < y ? -1 : x > y ? 1 : a.localeCompare(b)
  })
  return doc
}

function normalize(value, doc, nodeLevel = false) {
  if (ArrayBuffer.isView(value)) return Array.from(value)
  if (Array.isArray(value)) return value.map(item => normalize(item, doc))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort()
    .filter(key => !(nodeLevel && ['guid', 'parentIndex'].includes(key)))
    .map(key => {
      const item = value[key]
      if (/Blob$/.test(key) && Number.isInteger(item)) {
        const bytes = doc.blobs[item]?.bytes
        return [key, bytes ? { sha256: digest(bytes) } : { unresolvedBlob: item }]
      }
      return [key, normalize(item, doc)]
    }))
}

function redundantStopColor(stop) {
  const a = stop?.authoredColor, c = stop?.color
  // Only exact duplicated DEFAULT/sRGB channels. Real color/alpha changes,
  // other color spaces, stops and variable bindings remain significant.
  return a && c && a.space === 'DEFAULT' && a.c0 === c.r && a.c1 === c.g && a.c2 === c.b && a.c3 === c.a
}

function semanticProperties(raw, canvasChild) {
  function visit(value) {
    if (Array.isArray(value)) return value.map(visit)
    if (!value || typeof value !== 'object') return value
    return Object.fromEntries(Object.entries(value).map(([key, item]) => {
      if (key === 'stopsVar' && Array.isArray(item)) return [key, item.map(stop => {
        const copy = { ...stop }
        if (redundantStopColor(stop)) delete copy.authoredColor
        return visit(copy)
      })]
      return [key, visit(item)]
    }))
  }
  const result = visit(raw)
  // Editor timestamps are provenance, not layout. Keep them in rawFields and
  // report separately, so opening/saving a source cannot impersonate redesign.
  delete result.editInfo
  // Export presets are handoff metadata and do not change the rendered Design
  // node. Keep the raw field in the provenance report, but exclude it from the
  // semantic visual comparison so a PNG scale preset cannot mask a geometry,
  // typography, asset, or hierarchy edit.
  delete result.exportSettings
  // Ignore only moving a source on the canvas; retain rotation/scale/skew.
  // Every position inside the source frame remains significant.
  if (canvasChild && result.transform) {
    result.transform = { ...result.transform }
    delete result.transform.m02
    delete result.transform.m12
  }
  return result
}

function context(doc, nodeId) {
  const chain = [], seen = new Set()
  for (let cursor = nodeId; cursor && doc.nodes.has(cursor);) {
    assert.ok(!seen.has(cursor), `${nodeId}: cyclic Figma hierarchy`)
    seen.add(cursor)
    const node = doc.nodes.get(cursor)
    chain.unshift({ id: cursor, name: node.name || '', type: node.type })
    cursor = guid(node.parentIndex?.guid)
  }
  const canvasIndex = chain.findIndex(item => item.type === 'CANVAS')
  const source = canvasIndex >= 0 ? chain[canvasIndex + 1] : null
  return { canvasId: chain[canvasIndex]?.id || null, sourceId: source?.id || null, sourceName: source?.name || null, path: chain.map(item => `${item.name} [${item.id}]`).join(' / ') }
}

function imageReferences(value, prefix = '') {
  const refs = []
  if (!value || typeof value !== 'object' || ArrayBuffer.isView(value)) return refs
  for (const [key, child] of Object.entries(value)) {
    const at = prefix ? `${prefix}.${key}` : key
    if (key === 'image' && child?.hash) refs.push({ field: at, hash: Buffer.from(child.hash).toString('hex') })
    else refs.push(...imageReferences(child, at))
  }
  return refs
}

function designReferences(node) {
  const references = new Set()
  const visit = value => {
    if (!value || typeof value !== 'object' || ArrayBuffer.isView(value)) return
    if (Number.isInteger(value.sessionID) && Number.isInteger(value.localID)) {
      references.add(guid(value))
      return
    }
    for (const child of Object.values(value)) visit(child)
  }
  // These are authored dependency fields, not the node's own identity,
  // parent, grid-line IDs or publishing IDs. A shared variable/style/component
  // may change without changing the consumer's serialized binding.
  for (const [field, value] of Object.entries(node)) {
    if (/^(?:styleIdFor|symbolData|overriddenSymbolID|derivedSymbolData|variableConsumptionMap|parameterConsumptionMap|variableDataValues|variableSetID|fillPaints|strokePaints|backgroundPaints|effects|textData)/.test(field)) visit(value)
  }
  references.delete(guid(node.guid))
  return [...references]
}

function makeSnapshot(doc, caches = []) {
  const nodes = new Map(), assetCache = new Map(), integrityErrors = [], unresolvedBlobs = []
  const resolveAsset = hash => {
    if (assetCache.has(hash)) return assetCache.get(hash)
    let result = { hash, availability: 'unresolved', sha256: null, sourceFile: null }
    for (const source of [doc, ...caches]) {
      const bytes = source.archive[`images/${hash}`]
      if (!bytes) continue
      const actual = digest(bytes, 'sha1')
      if (actual !== hash) {
        integrityErrors.push({ hash, actualSHA1: actual, sourceFile: source.file })
        continue
      }
      result = { hash, availability: source === doc ? 'current-export' : 'verified-content-cache', sha256: digest(bytes), sourceFile: source.file }
      break
    }
    assetCache.set(hash, result)
    return result
  }
  for (const [nodeId, node] of doc.nodes) {
    const parentId = guid(node.parentIndex?.guid), canvasChild = doc.nodes.get(parentId)?.type === 'CANVAS'
    const raw = normalize(node, doc, true), props = semanticProperties(raw, canvasChild)
    const images = imageReferences(node).map(ref => ({ ...ref, ...resolveAsset(ref.hash) }))
    const scanBlobs = (value, field = '') => {
      if (!value || typeof value !== 'object') return
      if ('unresolvedBlob' in value) unresolvedBlobs.push({ nodeId, field, index: value.unresolvedBlob })
      else for (const [key, child] of Object.entries(value)) scanBlobs(child, field ? `${field}.${key}` : key)
    }
    scanBlobs(props)
    nodes.set(nodeId, {
      id: nodeId, name: node.name, type: node.type, parentId,
      children: doc.children.get(nodeId) || [], ...context(doc, nodeId),
      width: node.size?.x ?? null, height: node.size?.y ?? null, raw, props, images,
      references: designReferences(node),
    })
  }
  return { doc, nodes, integrityErrors, unresolvedBlobs, assets: [...assetCache.values()] }
}

function leafChanges(before, after, prefix = '') {
  if (equal(before, after)) return []
  if (before === undefined || after === undefined || before === null || after === null || typeof before !== 'object' || typeof after !== 'object' || Array.isArray(before) !== Array.isArray(after)) {
    return [{ field: prefix, before: before === undefined ? null : before, after: after === undefined ? null : after, kind: before === undefined ? 'added' : after === undefined ? 'removed' : 'modified' }]
  }
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort().flatMap(key => leafChanges(before[key], after[key], prefix ? `${prefix}.${key}` : key))
}

const describe = row => ({ id: row.id, name: row.name, type: row.type, parentId: row.parentId, sourceId: row.sourceId, sourceName: row.sourceName, canvasId: row.canvasId, path: row.path, width: row.width, height: row.height })

function compareDocuments(beforeDoc, currentDoc, { caches = [], roots = [] } = {}) {
  const before = makeSnapshot(beforeDoc), after = makeSnapshot(currentDoc, [beforeDoc, ...caches])
  const added = [], removed = [], changed = [], metadataOnly = [], canvasPlacement = []
  for (const [nodeId, row] of before.nodes) if (!after.nodes.has(nodeId)) removed.push(describe(row))
  for (const [nodeId, row] of after.nodes) {
    const old = before.nodes.get(nodeId)
    if (!old) { added.push(describe(row)); continue }
    const fields = leafChanges({ parentId: old.parentId, children: old.children, parameters: old.props }, { parentId: row.parentId, children: row.children, parameters: row.props })
    const rawFields = leafChanges(old.raw, row.raw)
    if (fields.length) changed.push({ ...describe(row), beforePath: old.path, fields, rawFields })
    else if (rawFields.length) {
      const placement = rawFields.filter(field => /^transform\.m(?:02|12)$/.test(field.field))
      const metadata = rawFields.filter(field => !placement.includes(field))
      if (placement.length) canvasPlacement.push({ ...describe(row), fields: placement })
      if (metadata.length) metadataOnly.push({ ...describe(row), fields: metadata, reason: 'Only editor provenance and/or exact redundant stopsVar.authoredColor fields changed; resolved design properties remain equal.' })
    }
  }
  const frames = snapshot => [...snapshot.nodes.values()].filter(row => ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'SECTION'].includes(row.type))
  const beforeSources = frames(before).filter(row => row.sourceId === row.id)
  const newSources = frames(after).filter(row => row.sourceId === row.id && !before.nodes.has(row.id))
  const alternatives = newSources.flatMap(row => beforeSources.filter(old => old.name === row.name && old.canvasId === row.canvasId).map(old => ({
    name: row.name, oldId: old.id, newId: row.id, canvasId: row.canvasId,
    oldRetained: after.nodes.has(old.id), oldSize: [old.width, old.height], newSize: [row.width, row.height],
    reason: after.nodes.has(old.id) ? 'Same-name new source exists alongside the old source; inspect Design/Prototype before selecting.' : 'Same-name new source replaces a removed source; extract and rebind explicitly.',
  })))
  const affected = new Map()
  for (const [kind, rows] of [['added', added], ['removed', removed], ['changed', changed]]) for (const row of rows) {
    const key = row.sourceId || row.id
    if (!affected.has(key)) affected.set(key, { id: key, name: row.sourceName || row.name, canvasId: row.canvasId, added: 0, removed: 0, changed: 0 })
    affected.get(key)[kind]++
  }
  const allIds = (snapshot, nodeId) => {
    const set = new Set()
    const visit = cursor => { if (set.has(cursor) || !snapshot.nodes.has(cursor)) return; set.add(cursor); snapshot.nodes.get(cursor).children.forEach(visit) }
    visit(nodeId)
    return set
  }
  const withDependencies = (snapshot, ids) => {
    const set = new Set(ids), queue = [...ids]
    for (let index = 0; index < queue.length; index++) {
      const row = snapshot.nodes.get(queue[index])
      for (const target of [...(row?.children || []), ...(row?.references || [])]) {
        if (set.has(target) || !snapshot.nodes.has(target)) continue
        set.add(target)
        queue.push(target)
      }
    }
    return set
  }
  const unresolvedImages = [...after.nodes.values()].flatMap(row => row.images.filter(image => image.availability === 'unresolved').map(image => ({ ...describe(row), ...image })))
  const scopes = roots.map(nodeId => {
    const oldIds = allIds(before, nodeId), newIds = allIds(after, nodeId), ids = new Set([...oldIds, ...newIds])
    const oldDependencies = withDependencies(before, oldIds), newDependencies = withDependencies(after, newIds)
    const dependencyIds = new Set([...oldDependencies, ...newDependencies].filter(id => !ids.has(id)))
    const dependencyChanges = [
      ...changed.filter(row => dependencyIds.has(row.id)).map(row => ({ kind: 'changed', ...row })),
      ...added.filter(row => dependencyIds.has(row.id)).map(row => ({ kind: 'added', ...row })),
      ...removed.filter(row => dependencyIds.has(row.id)).map(row => ({ kind: 'removed', ...row })),
    ]
    const changedNodes = changed.filter(row => ids.has(row.id)), addedNodes = added.filter(row => ids.has(row.id)), removedNodes = removed.filter(row => ids.has(row.id))
    const hints = alternatives.filter(row => ids.has(row.oldId) || ids.has(row.newId))
    const relevantIds = new Set([...ids, ...dependencyIds])
    const unresolved = unresolvedImages.filter(row => relevantIds.has(row.id)), blobs = after.unresolvedBlobs.filter(row => relevantIds.has(row.nodeId))
    const imageHashes = new Set([...newDependencies].flatMap(id => after.nodes.get(id).images.map(image => image.hash)))
    const integrityErrors = after.integrityErrors.filter(error => imageHashes.has(error.hash))
    return {
      rootId: nodeId, name: after.nodes.get(nodeId)?.name || before.nodes.get(nodeId)?.name || null,
      beforeNodes: oldIds.size, currentNodes: newIds.size,
      status: !newIds.size || !oldIds.size || changedNodes.length || addedNodes.length || removedNodes.length || hints.length || dependencyChanges.length ? 'changed' : unresolved.length || blobs.length || integrityErrors.length ? 'unresolved' : 'unchanged',
      addedIds: addedNodes.map(row => row.id), removedIds: removedNodes.map(row => row.id), changedIds: changedNodes.map(row => row.id), alternatives: hints,
      dependencyNodeIds: [...dependencyIds], dependencyChanges,
      unresolvedImages: unresolved, unresolvedBlobs: blobs, integrityErrors,
      metadataOnlyNodes: metadataOnly.filter(row => ids.has(row.id)).length,
      verifiedImages: [...imageHashes].map(hash => after.assets.find(image => image.hash === hash)),
    }
  })
  return {
    version: 3, checkedAt: new Date().toISOString(),
    method: 'Every node without size/visibility filters: hierarchy/order, all native parameters, text/layout/style/image transforms, bindings/interactions, transitive shared variable/style/component dependencies, vector blob SHA256 and SHA1-verified image bytes. Only exact duplicated default gradient-stop colors and root canvas translation are classified separately.',
    baseline: { file: beforeDoc.file, sha256: beforeDoc.sha256, exportedAt: beforeDoc.exportedAt, nodeCount: before.nodes.size, frameCount: frames(before).length },
    current: { file: currentDoc.file, sha256: currentDoc.sha256, exportedAt: currentDoc.exportedAt, nodeCount: after.nodes.size, frameCount: frames(after).length },
    status: added.length || removed.length || changed.length || alternatives.length ? 'changed' : unresolvedImages.length || after.unresolvedBlobs.length || after.integrityErrors.length ? 'unresolved' : 'unchanged',
    counts: { added: added.length, removed: removed.length, changed: changed.length, alternatives: alternatives.length, metadataOnly: metadataOnly.length, canvasPlacement: canvasPlacement.length, unresolvedImages: unresolvedImages.length, unresolvedBlobs: after.unresolvedBlobs.length, integrityErrors: after.integrityErrors.length },
    sources: [...affected.values()], alternatives, added, removed, changed, metadataOnly, canvasPlacement,
    assets: after.assets, unresolvedImages, unresolvedBlobs: after.unresolvedBlobs, integrityErrors: after.integrityErrors, scopes,
  }
}

function assertCurrentSource({ roots, baselineSHA256, reportFile = process.env.HUANYU_FIGMA_GATE_OUTPUT || path.join(root, 'artifacts/figma-source-gate/latest.json'), maxAgeHours = 24, now = Date.now() }) {
  assert.ok(fs.existsSync(reportFile), `Missing current Figma comparison: ${reportFile}. Run audit:figma:changes with explicit --baseline, --current and --root IDs before page work.`)
  const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
  assert.equal(report.version, 3, 'Outdated source detector report; rerun audit:figma:changes')
  if (baselineSHA256) assert.equal(report.baseline.sha256, baselineSHA256, 'Comparison baseline differs from this page extraction; compare its original source export, not an arbitrarily recent file')
  assert.ok(now - Date.parse(report.checkedAt) <= maxAgeHours * 3600000 && Date.parse(report.checkedAt) <= now + 60000, 'Figma source comparison is stale; obtain a fresh official export for this task')
  const exportedAt = Date.parse(report.current.exportedAt)
  assert.ok(Number.isFinite(exportedAt) && now - exportedAt <= maxAgeHours * 3600000 && exportedAt <= now + 60000, 'Current Figma export is stale or has no valid export time; rerunning comparison on an old download is not a fresh source check')
  assert.equal(digest(fs.readFileSync(report.current.file)), report.current.sha256, 'Current Figma export differs from the inspected file; rerun comparison')
  for (const rootId of roots) {
    const scope = report.scopes.find(row => row.rootId === rootId)
    assert.ok(scope, `${rootId}: not included in current source comparison; rerun with --root ${rootId}`)
    assert.equal(scope.status, 'unchanged', `${rootId} ${scope.name}: ${scope.status}; changed nodes [${scope.changedIds.join(', ')}], added [${scope.addedIds.join(', ')}], removed [${scope.removedIds.join(', ')}], alternative frames [${scope.alternatives.map(row => row.newId).join(', ')}], changed dependencies [${scope.dependencyChanges.map(row => row.id).join(', ')}], unresolved images ${scope.unresolvedImages.length}. See ${reportFile}. Re-extract changed sources; comparison never accepts a new implementation baseline.`)
  }
  return report
}

function pageSourceConfiguration(page) {
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
  let inventories, relatedRoots
  if (page === 'home') {
    const base = 'docs/figma-source/home', lock = read(`${base}/baseline-lock-2026-10-19.json`)
    inventories = lock.files.filter(item => /(?:^|\/)node-to-code-2026-10-19\.json$/.test(item.name) && !item.name.includes('mobile'))
      .map(item => read(path.posix.join(base, path.posix.dirname(item.name), 'native-inventory-2026-10-19.json')))
    // This separate desktop navigation/hero frame is also authored in Design.
    // It is not a substitute for the long frame, and must not be missed when
    // its children change while the long frame is untouched.
    // This frame now has its own complete extraction. Check it against that
    // exact implementation export, separately from the unchanged long page.
    relatedRoots = []
  } else if (page === 'dental') {
    const base = 'docs/figma-source/dental-revision-2026-10-28'
    const lock = read(`${base}/baseline-lock-2026-10-28.json`)
    inventories = lock.files.filter(item => /(?:^|\/)native-inventory-2026-10-28\.json$/.test(item.name))
      .map(item => read(path.posix.join(base, item.name)))
    relatedRoots = []
  } else throw Error(`No registered source configuration for ${page}; pass explicit --baseline and --root IDs`)
  assert.equal(new Set(inventories.map(item => item.sourceSHA256)).size, 1, `${page}: multiple original source exports; compare each explicitly`)
  return { page, baselineFile: inventories[0].sourceFile, baselineSHA256: inventories[0].sourceSHA256, roots: [...new Set([...inventories.map(item => item.sourceFrame), ...relatedRoots])], reportFile: path.join(root, `artifacts/figma-source-gate/latest-${page}.json`) }
}

function assertPageCurrent(page, options = {}) {
  const config = pageSourceConfiguration(page)
  const report = assertCurrentSource({ ...config, ...options, reportFile: options.reportFile || process.env.HUANYU_FIGMA_GATE_OUTPUT || config.reportFile })
  if (page === 'home') {
    const inventory = JSON.parse(fs.readFileSync(path.join(root, 'docs/figma-source/home/revision-2026-10-28/hero/native-inventory-2026-10-28.json')))
    assertCurrentSource({ roots:[inventory.sourceFrame], baselineSHA256:inventory.sourceSHA256, reportFile:path.join(root, 'artifacts/figma-source-gate/current-home-hero.json') })
  }
  return report
}

function main(args = process.argv.slice(2)) {
  const option = name => { const index = args.indexOf(name); return index < 0 ? null : args[index + 1] }
  assert.ok(!args.includes('--write-catalog') && !option('--catalog-out'), 'Comparison cannot overwrite/accept a baseline. Keep original extraction locks immutable.')
  const page = option('--page'), config = page ? pageSourceConfiguration(page) : null
  const baselineFile = option('--baseline') || config?.baselineFile, currentFile = option('--current') || process.env.HUANYU_FIGMA_FILE
  assert.ok(baselineFile && currentFile, 'Usage: node scripts/figma-source-gate.cjs --baseline previous.fig --current freshly-exported.fig [--root ID ...] [--output report.json]')
  const output = path.resolve(option('--output') || process.env.HUANYU_FIGMA_GATE_OUTPUT || config?.reportFile || path.join(root, 'artifacts/figma-source-gate/latest.json'))
  assert.ok(![baselineFile, currentFile].map(file => path.resolve(file)).includes(output), 'Report cannot overwrite an input export')
  const roots = [...new Set([...(config?.roots || []), ...args.flatMap((arg, i) => arg === '--root' ? [args[i + 1]] : [])])]
  const parser = option('--parser') || undefined
  const before = parseFigma(baselineFile, parser), current = path.resolve(baselineFile) === path.resolve(currentFile) ? before : parseFigma(currentFile, parser)
  if (config) assert.equal(before.sha256, config.baselineSHA256, `${page}: original extraction export hash does not match`)
  const caches = args.flatMap((arg, i) => arg === '--asset-cache' ? [parseFigma(args[i + 1], parser)] : [])
  const report = compareDocuments(before, current, { roots, caches })
  if (page) { report.page = page; report.pageStatus = report.scopes.every(scope => scope.status === 'unchanged') ? 'unchanged' : 'changed-or-unresolved' }
  writeJson(output, report)
  console.log(JSON.stringify({ checkedAt: report.checkedAt, status: report.status, pageStatus: report.pageStatus, beforeNodes: report.baseline.nodeCount, currentNodes: report.current.nodeCount, ...report.counts, scopes: report.scopes.map(scope => ({ rootId: scope.rootId, name: scope.name, status: scope.status, beforeNodes: scope.beforeNodes, currentNodes: scope.currentNodes })), report: output }, null, 2))
  return (page ? report.pageStatus : report.status) === 'unchanged' ? 0 : 1
}

module.exports = { parseFigma, prepareDocument, normalize, semanticProperties, designReferences, makeSnapshot, compareDocuments, assertCurrentSource, pageSourceConfiguration, assertPageCurrent, leafChanges, digest, main }
if (require.main === module) {
  try { process.exitCode = main() } catch (error) { console.error(error.message); process.exitCode = 2 }
}
