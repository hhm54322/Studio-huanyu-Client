// Compatibility entry: use the same full-file discovery/field comparator as
// every current source preflight. Never silently fall back to an old download.
const { main } = require('./figma-source-gate.cjs')
try { process.exitCode = main(['--page', 'home', ...process.argv.slice(2)]) }
catch (error) { console.error(error.message); process.exitCode = 2 }
