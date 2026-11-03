import type { Plugin } from 'vite'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// The shell is build-generated and contains no patient data. API, report,
// authentication, expert and administration navigations stay network-only.
export const publicPatientRoutes = [
  '/', '/why-china', '/trust', '/insurance', '/hospitals', '/doctors',
  '/cases', '/dental', '/diseases-technologies', '/steps', '/steps/toolkit-detail', '/about',
]

export function patientCachePlugin(): Plugin {
  return {
    name: 'huanyu-public-patient-shell-cache',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const script = readFileSync(fileURLToPath(new URL('../src/bootstrap/patientCacheRegistration.js', import.meta.url)), 'utf8')
        return html.replace('</body>', `<script>(function(){${script}\ninstallPublicPatientCache(${JSON.stringify(publicPatientRoutes)})})()</script></body>`)
      },
    },
    generateBundle: {
      // Run after Vite has emitted the final HTML with its hashed imports.
      order: 'post',
      handler(_options, bundle) {
        const entry = bundle['index.html']
        if (!entry || entry.type !== 'asset') throw new Error('Missing final patient HTML shell')
        const html = String(entry.source)
        const digest = createHash('sha256').update(html).digest('hex').slice(0, 24)
        const shell = `/patient-shell/${digest}.html`
        this.emitFile({ type: 'asset', fileName: shell.slice(1), source: html })
        const worker = readFileSync(fileURLToPath(new URL('../src/bootstrap/patientCacheWorker.js', import.meta.url)), 'utf8')
          .replace('__PUBLIC_ROUTES__', JSON.stringify(publicPatientRoutes))
          .replace('__SHELL_URL__', JSON.stringify(shell))
        this.emitFile({ type: 'asset', fileName: 'patient-cache-sw.js', source: worker })
      },
    },
  }
}
