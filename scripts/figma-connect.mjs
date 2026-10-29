// Run through mcp__node_repl__js, never a standalone browser or alternate transport.
import { access, readdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const FIGMA_FILE_ID = 's6gMozOqPBJFujindYruwb'
export const FIGMA_URL = `https://www.figma.com/design/${FIGMA_FILE_ID}/?m=dev`
const defaultRuntimeRoot = join(homedir(), '.codex/plugins/cache/openai-bundled/browser')
let cachedRuntime

function fail(stage, message, cause) {
  const error = new Error(`[${stage}] ${message}`, { cause })
  error.stage = stage
  throw error
}

export async function discoverRuntimePath(runtimeRoot = defaultRuntimeRoot) {
  let entries
  try {
    entries = await readdir(runtimeRoot, { withFileTypes: true })
  } catch (cause) {
    fail('runtime-discovery', 'Cannot read the installed browser runtime directory.', cause)
  }
  const versions = entries
    .filter(entry => entry.isDirectory() && /^\d+(?:\.\d+)+$/.test(entry.name))
    .map(entry => entry.name)
    .sort((a, b) => b.localeCompare(a, 'en', { numeric: true }))
  for (const version of versions) {
    const runtimePath = join(runtimeRoot, version, 'scripts/browser-client.mjs')
    try {
      await access(runtimePath)
      return runtimePath
    } catch (cause) {
      if (cause.code !== 'ENOENT') {
        fail('runtime-discovery', `Cannot access ${runtimePath}.`, cause)
      }
    }
  }
  fail('runtime-discovery', 'No installed browser-client.mjs was found; do not reuse an old version path.')
}

export async function verifyFigmaConnection({ agent, sessionId, runtimePath }) {
  if (!sessionId) fail('session-match', 'The current node_repl thread/session id is required.')
  const browsers = await agent.browsers.list()
  const iab = browsers.find(browser => browser.type === 'iab'
    && browser.metadata?.codexSessionId === sessionId)
  if (!iab) {
    fail('browser-discovery', 'No IAB backend for this session. Do not substitute Chrome, another instance, or repeat initialization.')
  }
  const browser = await agent.browsers.get(iab.id)
  const tabs = await browser.tabs.list()
  const sources = tabs.filter(tab => {
    try {
      const url = new URL(tab.url)
      return ['figma.com', 'www.figma.com'].includes(url.hostname)
        && (url.pathname === `/design/${FIGMA_FILE_ID}`
          || url.pathname.startsWith(`/design/${FIGMA_FILE_ID}/`))
    } catch {
      return false
    }
  })
  if (!sources.length) {
    fail('tab-discovery', `No matching Design tab. Open ${FIGMA_URL} once with open_in_codex, then rerun this same check.`)
  }
  const failures = []
  const observations = []
  // One pass over existing source tabs: a stale first tab must not hide a working second tab.
  for (const source of sources) {
    let figmaTab, snapshot
    try {
      figmaTab = await browser.tabs.get(source.id)
      snapshot = await figmaTab.playwright.domSnapshot()
    } catch {
      failures.push(`${source.id}: snapshot unavailable`)
      continue
    }
    // Figma's accessibility labels differ between editor builds: some expose
    // role names in quotes, others expose only generic text. The source URL,
    // authored page name, Layers text and Dev Mode text together are the stable
    // visible Design/Inspect evidence; do not reject a valid tab because a
    // browser build omitted a role label.
    const checks = {
      design: snapshot.includes('pc改版') || snapshot.includes('Figma Design') || snapshot.includes('Figma'),
      layers: snapshot.includes('treegrid') && /(?:Layers|01寰宇云医|牙科|关于我们)/.test(snapshot),
      properties: /Dev Mode|Inspect|Properties|tabpanel/.test(snapshot),
    }
    if (!Object.values(checks).every(Boolean)) {
      const missing = Object.entries(checks).filter(([, passed]) => !passed).map(([key]) => key)
      failures.push(`${source.id}: missing ${missing.join(', ')}`)
      observations.push({ tabId: source.id, url: source.url, checks, snapshot: snapshot.slice(0, 5000), browser, figmaTab })
      continue
    }
    await figmaTab.markHandoff()
    const url = new URL(source.url)
    return {
      browser,
      figmaTab,
      snapshot,
      evidence: {
        verified: true,
        checkedAt: new Date().toISOString(),
        runtimePath,
        sessionId,
        browserId: iab.id,
        tabId: source.id,
        sourceUrl: source.url,
        sourceNodeId: url.searchParams.get('node-id')?.replace(/^(\d+)-(\d+)$/, '$1:$2') ?? null,
        checks,
      },
    }
  }
  // A failed verification must expose the actual observed screen for diagnosis;
  // these handles are not a verified connection or permission to change hosts.
  const error = new Error(`[design-verification] No source tab passed: ${failures.join('; ')}. A visible tab or queued open is not a successful connection.`)
  error.stage = 'design-verification'
  error.observations = observations
  throw error
}

export async function connectHuanyuFigma({ sessionId, existingAgent, runtimeRoot } = {}) {
  const runtimePath = await discoverRuntimePath(runtimeRoot)
  if (cachedRuntime?.runtimePath !== runtimePath) {
    try {
      // Adopt an already initialized runtime on first use; do not reset a failed backend.
      const agent = !cachedRuntime && existingAgent ? existingAgent
        : await (await import(pathToFileURL(runtimePath).href)).setupBrowserRuntime()
      cachedRuntime = { runtimePath, agent }
    } catch (cause) {
      fail('runtime-bootstrap', 'The installed browser runtime could not initialize.', cause)
    }
  }
  const connection = await verifyFigmaConnection({ ...cachedRuntime, sessionId })
  return { agent: cachedRuntime.agent, ...connection }
}
