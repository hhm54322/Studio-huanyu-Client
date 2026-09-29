const { execFileSync } = require('node:child_process')
const { mkdirSync, writeFileSync } = require('node:fs')
const path = require('node:path')

const nodeId = process.argv[2]
if (!/^143:\d+$/.test(nodeId || '')) throw new Error('Expected a homepage Figma Node ID')
const svg = execFileSync('pbpaste', { encoding: 'utf8' }).trim()
if (!/^<svg\b[\s\S]*<\/svg>$/.test(svg)) throw new Error('Clipboard does not contain an SVG')
const directory = path.resolve(__dirname, '../public/images/figma/home-icons')
mkdirSync(directory, { recursive: true })
const output = path.join(directory, `node-${nodeId.replace(':', '-')}.svg`)
writeFileSync(output, `${svg}\n`)
console.log(output)
