// Reuse the complete Layers/Dev Mode converter; never synthesize CSS.
const path = require('node:path')
process.env.HUANYU_SOURCE_DIRECTORY = path.resolve(__dirname, '../docs/figma-source/home/revision-2026-10-28')
process.env.HUANYU_SOURCE_DATE = '2026-10-28'
process.env.HUANYU_SOURCE_ASSETS = '/images/figma/home-revision'
process.env.HUANYU_SOURCE_CONTENT_CACHES = JSON.stringify(['/Users/hhm/Downloads/寰宇云医 (3).fig'])
require('./build-hospital-source-revision.cjs')
