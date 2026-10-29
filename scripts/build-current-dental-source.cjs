#!/usr/bin/env node
// Mechanical Figma Layers/Dev Mode conversion; no invented CSS/image fallback.
const path = require('node:path')
process.env.HUANYU_SOURCE_DIRECTORY = path.resolve(__dirname, '../docs/figma-source/dental-revision-2026-10-28')
process.env.HUANYU_SOURCE_DATE = '2026-10-28'
process.env.HUANYU_SOURCE_EXACT_TEXT_LINES = '1'
process.env.HUANYU_SOURCE_ASSETS = '/images/figma/dental-revision'
process.env.HUANYU_SOURCE_CONTENT_CACHES = JSON.stringify([
  path.resolve(__dirname, '../artifacts/figma-dental-2026-10-28/original-images.zip'),
  '/Users/hhm/Downloads/寰宇云医 - Partial file saved 2026-10-29.fig',
  '/Users/hhm/Downloads/寰宇云医 (3).fig',
 '/Users/hhm/Downloads/寰宇云医 - Partial file saved 2026-10-28.fig',
])
require('./build-hospital-source-revision.cjs')
