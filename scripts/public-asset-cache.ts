import type { Plugin } from 'vite'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'

/** Content addresses, rather than release numbers, preserve the browser cache
 * for unchanged pictures/fonts across releases. Only public build inputs enter
 * this map; uploaded records and API responses are never inspected. */
export function publicAssetCache(publicDir: string) {
  const aliases = new Map<string, string>()
  const assets = new Map<string, { source: string; bytes: Buffer }>()
  let optimized: Map<string, string> | undefined
  const root = resolve(publicDir)
  const extension = /\.(?:png|jpe?g|webp|svg|ico|woff2?|avif)$/i
  let publicFiles: string[] | undefined

  function files(directory: string): string[] {
    return readdirSync(resolve(root, `.${directory}`), { withFileTypes: true }).flatMap(entry => {
      const url = `${directory}/${entry.name}`
      return entry.isDirectory() ? files(url) : extension.test(url) ? [url] : []
    })
  }

  function address(url: string): string {
    if (aliases.has(url)) return aliases.get(url)!
    if (!/^\/(?:images|fonts)\//.test(url) && url !== '/favicon.svg') return url
    if (!extension.test(url)) return url
    if (!optimized) {
      const manifest = JSON.parse(readFileSync(resolve(root, 'image-optimization.json'), 'utf8'))
      optimized = new Map(manifest.images.map((item: { source: string; optimizedSource: string }) => [item.source, item.optimizedSource]))
    }
    const source = optimized.get(url) || url
    const file = resolve(root, `.${source}`)
    if (!file.startsWith(root + sep) || !existsSync(file)) return url
    const bytes = readFileSync(file)
    const digest = createHash('sha256').update(bytes).digest('hex')
    const target = `/static-assets/${digest.slice(0, 24)}${extname(source).toLowerCase()}`
    aliases.set(url, target)
    aliases.set(source, target)
    assets.set(target.slice(1), { source, bytes })
    // Vite treats absolute public URLs as external only when the target is
    // already present in public/. Materialize the alias before Rollup resolves
    // the transformed Vue/CSS module; Vite copies it to dist unchanged.
    const output = resolve(root, `.${target}`)
    mkdirSync(resolve(root, 'static-assets'), { recursive: true })
    if (!existsSync(output)) writeFileSync(output, bytes)
    return target
  }

  function rewrite(code: string, id = ''): string {
    let result = code.replace(/\/(?:images|fonts)\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp|svg|ico|woff2?|avif)(?=[?"'`)\s;\\]|$)|\/favicon\.svg/g,
      url => address(url))
    // Vite inlines this public stylesheet into the patient shell. Rewrite its
    // relative font URLs before Vite computes the containing CSS chunk hash.
    if (id.split('?')[0] === resolve(root, 'fonts/home-source-fonts.css')) {
      result = result.replace(/(url\(['"]?)(?:\.\/)?([A-Za-z0-9_-]+\.woff2?)/g,
        (_match, prefix, name) => `${prefix}${address(`/fonts/${name}`)}`)
    }
    return result
  }

  function rewriteTemplates(code: string): string {
    return code.replace(/`(\/(?:images|fonts)\/[^`]*\$\{[^`]+)`/g, (literal, template: string) => {
      publicFiles ||= [...files('/images'), ...files('/fonts')]
      const parts = template.split(/\$\{[^}]+\}/)
      const escape = (part: string) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`^${parts.map(escape).join('.*')}$`)
      const entries = publicFiles.filter(url => pattern.test(url)).map(url => [url, address(url)])
      if (!entries.length) return literal
      // This runs on the compiled module, after Vue has parsed attributes.
      // Keep mappings local to their dynamic prefix, rather than ship a
      // full-site URL dictionary with every page.
      return `((url)=>(${JSON.stringify(Object.fromEntries(entries))}[url]||url))(${literal})`
    })
  }

  const plugin: Plugin = {
    name: 'huanyu-content-addressed-public-assets',
    apply: 'build',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('/node_modules/')) return
      if (!/\.(?:vue|ts|js|json|css)(?:\?|$)/.test(id) && !id.startsWith('\0virtual:huanyu-')) return
      const result = rewriteTemplates(rewrite(code, id))
      return result === code ? undefined : { code: result, map: null }
    },
    transformIndexHtml: { order: 'post', handler: html => rewrite(html) },
    generateBundle: {
      order: 'post',
      handler() {
        for (const [fileName, asset] of assets) this.emitFile({ type: 'asset', fileName, source: asset.bytes })
        this.emitFile({ type: 'asset', fileName: 'asset-cache-manifest.json', source: JSON.stringify({
          algorithm: 'sha256-96',
          assets: Object.fromEntries([...aliases].sort(([a], [b]) => a.localeCompare(b))),
        }, null, 2) + '\n' })
      },
    },
  }
  return { address, rewrite, plugin }
}
