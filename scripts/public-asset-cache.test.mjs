import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { publicAssetCache } from './public-asset-cache.ts'

test('content addresses survive releases and change only with file contents', () => {
  const root = mkdtempSync(join(tmpdir(), 'huanyu-public-cache-'))
  try {
    mkdirSync(join(root, 'images')); mkdirSync(join(root, 'fonts'))
    writeFileSync(join(root, 'image-optimization.json'), JSON.stringify({ images: [{ source: '/images/photo.png', optimizedSource: '/images/photo.png.optimized.webp' }] }))
    writeFileSync(join(root, 'images/photo.png.optimized.webp'), 'public-photo-one')
    const first = publicAssetCache(root).address('/images/photo.png')
    assert.equal(first, publicAssetCache(root).address('/images/photo.png'))
    const hash = createHash('sha256').update('public-photo-one').digest('hex').slice(0, 24)
    assert.equal(first, `/static-assets/${hash}.webp`)
    assert.equal(readFileSync(join(root, first), 'utf8'), 'public-photo-one')
    writeFileSync(join(root, 'images/photo.png.optimized.webp'), 'public-photo-two')
    const next = publicAssetCache(root).address('/images/photo.png')
    assert.notEqual(next, first)
    assert.equal(readFileSync(join(root, first), 'utf8'), 'public-photo-one', 'Old addresses must keep their bytes')
    assert.equal(publicAssetCache(root).address('/api/report.pdf'), '/api/report.pdf')
    assert.equal(publicAssetCache(root).address('/uploads/record.png'), '/uploads/record.png')
    assert.equal(publicAssetCache(root).address('/images/../../secret.png'), '/images/../../secret.png')
  } finally { rmSync(root, { recursive: true, force: true }) }
})
