import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { homeEntrySourcePlugin, packedHomeSourcePlugin } from './scripts/packed-home-source'
import { publicAssetCache } from './scripts/public-asset-cache'
import { patientCachePlugin } from './scripts/patient-cache-plugin'

const assetCache = publicAssetCache(fileURLToPath(new URL('./public', import.meta.url)))

const buildVersion = process.env.VITE_APP_VERSION || new Date().toISOString()

const versionPayload = () => JSON.stringify({ version: buildVersion, builtAt: new Date().toISOString() })

// Project each expert's exact authored desktop/mobile states at build time.
// The immutable Figma handoff stays intact; the browser downloads one person.
const homeExpertSourcePlugin = (): Plugin => {
  const prefix = 'virtual:huanyu-home-expert/'
  const names = new Set(['xu-yu','zhou-li-li','liu-guang-yu','chen-ji-wu'])
  const sourceFile = fileURLToPath(new URL('./docs/figma-source/home/experts/dialog-sources-2026-10-19.json', import.meta.url))
  return {
    name: 'huanyu-home-expert-sources',
    resolveId(id) { if (id.startsWith(prefix) && names.has(id.slice(prefix.length))) return `\0${id}` },
    load(id) {
      if (!id.startsWith(`\0${prefix}`)) return
      this.addWatchFile(sourceFile)
      const name = id.slice(prefix.length + 1)
      const source = JSON.parse(readFileSync(sourceFile, 'utf8'))
      const records = Object.fromEntries(Object.entries(source.records).filter(([key]) => key.startsWith(`${name}-`)))
      if (!Object.keys(records).length) throw new Error(`Missing expert source: ${name}`)
      return `export default JSON.parse(${JSON.stringify(assetCache.rewrite(JSON.stringify(records)))})`
    },
  }
}

const optimizedImagePlugin = (): Plugin => {
  const urls = new Map<string, string>()
  const hospitalCardUrls = new Map<string, string>()
  return {
    name: 'huanyu-patient-optimized-images',
    apply: 'build',
    enforce: 'pre',
    buildStart() {
      const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('./public/image-optimization.json', import.meta.url)), 'utf8'))
      for (const image of manifest.images) urls.set(image.source, image.optimizedSource)
      for (const image of manifest.hospitalCardImages || []) hospitalCardUrls.set(image.source, image.optimizedSource)
    },
    transform(code, id) {
      if (!id.includes('/src/views/patient/') && !id.includes('/src/data/') && !id.includes('/docs/figma-source/') && !id.startsWith('\0virtual:huanyu-home-expert/')) return
      const directory = id.endsWith('/docs/figma-source/hospitals/source-tree-2026-10-20.json')
      const updated = code.replace(/\/images\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp)(?=["'`)\s])/g,
        url => (directory ? hospitalCardUrls.get(url) : undefined) || urls.get(url) || url)
      return updated === code ? undefined : { code: updated, map: null }
    },
  }
}

const patientEntryPreloadPlugin = (): Plugin => ({
  name: 'huanyu-patient-entry-preload',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html, context) {
      const bundle = context.bundle
      if (!bundle) return
      const routes: Record<string, string> = {
        '/': 'HomeView', '/why-china': 'WhyChinaView', '/trust': 'TrustView',
        '/insurance': 'InsuranceView', '/hospitals': 'HospitalView', '/doctors': 'PhysicianView',
        '/report': 'ReportView', '/cases': 'CaseView', '/dental': 'DentalView',
        '/diseases-technologies': 'DiseaseTechnologyView', '/steps': 'StepView',
        '/steps/toolkit-detail': 'ToolkitDetailView', '/about': 'AboutView',
      }
      const entries: Record<string, [string, string][]> = {}
      for (const [route, view] of Object.entries(routes)) {
        const files = new Set<string>(), styles = new Set<string>()
        const visit = (file: string) => {
          if (files.has(file)) return
          const chunk = bundle[file]
          if (!chunk || chunk.type !== 'chunk') return
          files.add(file)
          const metadata = chunk as typeof chunk & { viteMetadata?: { importedCss: Set<string> } }
          for (const css of metadata.viteMetadata?.importedCss || []) styles.add(css)
          for (const dependency of chunk.imports) visit(dependency)
        }
        for (const chunk of Object.values(bundle)) {
          if (chunk.type !== 'chunk') continue
          const facade = chunk.facadeModuleId || ''
          if (facade.endsWith(`/src/views/patient/${view}.vue`)
            || facade.endsWith('/src/components/layout/PatientLayout.vue')
            || route === '/dental' && facade.endsWith('/src/components/common/DentalDesktopFlow.vue')
            || Object.keys(chunk.modules).some(id => id.endsWith(`/src/views/patient/${view}.vue`))) visit(chunk.fileName)
        }
        const links = () => [...files].map(file => ['modulepreload', `/${file}`] as [string, string])
          .concat([...styles].map(file => ['preload', `/${file}`] as [string, string]))
        entries[route] = links()
        if (route === '/steps/toolkit-detail') {
          for (const chunk of Object.values(bundle)) {
            if (chunk.type !== 'chunk') continue
            const source = Object.keys(chunk.modules).find(id => /\/toolkit-revision\/[^/]+\/desktop-variant-2026-10-22\.json$/.test(id))
            if (!source) continue
            const key = source.split('/').at(-2)!
            files.clear(); styles.clear()
            visit(chunk.fileName)
            entries[`${route}?article=${key}`] = links()
          }
        }
      }
      // Run before any blocking stylesheet: an inline script placed after a
      // stylesheet otherwise waits for that CSS before it can start requests.
      // Only the current desktop route is preloaded, never other page/dialog
      // dependencies. CSS keeps the same CORS mode as Vite's stylesheet links.
      const script = `if(matchMedia('(min-width: 701px)').matches){const entries=${JSON.stringify(entries)};const route=location.pathname.endsWith('/')?location.pathname.slice(0,-1)||'/':location.pathname;const article=route==='/steps/toolkit-detail'?entries[route+'?article='+new URLSearchParams(location.search).get('article')]||[]:[];for(const [rel,href] of [...entries[route]||[],...article]){if([...document.querySelectorAll('link')].some(link=>link.getAttribute('href')===href&&(link.rel===rel||rel==='preload'&&link.rel==='stylesheet')))continue;const link=document.createElement('link');link.rel=rel;link.href=href;link.crossOrigin='anonymous';if(rel==='preload')link.as='style';link.dataset.huanyuPreload='patient-entry';document.head.appendChild(link)}}`
      const recoverySource = readFileSync(fileURLToPath(new URL('./src/bootstrap/patientLoadRecovery.js', import.meta.url)), 'utf8')
      // Reports and administration are excluded: never reload a form or an
      // in-progress workflow to recover an optional component download.
      const recoverableRoutes = Object.keys(routes).filter(route => route !== '/report')
      const recovery = `(function(){${recoverySource}\ninstallPatientLoadRecovery(${JSON.stringify(buildVersion)},${JSON.stringify(recoverableRoutes)})})()`
      // Exact first-screen assets verified against the rendered source nodes.
      // Only this route's image is requested; phone/tablet loading is unchanged.
      const heroImages: Record<string,string> = {
        '/why-china': '/images/figma/why-china-hero-source.png',
        '/dental': '/images/figma/dental-revision/image-95a7534f58ff374efc9bc43e522f01d1513d25a0.webp', // 2294:8243
        '/hospitals': '/images/figma/hospital-revision/image-85535e98733878855d82c5395b98a077a05309e9.webp', // 144:4710
        '/cases': '/images/figma/case-source/node-190-5303.webp',
        '/insurance': '/images/figma/insurance/hero.png',
        '/about': '/images/figma/about-hero.jpg',
        '/diseases-technologies': '/images/figma/disease-source/node-144-4383.webp',
      }
      const images = JSON.parse(readFileSync(fileURLToPath(new URL('./public/image-optimization.json', import.meta.url)), 'utf8')).images as { source:string; optimizedSource:string }[]
      for (const route of Object.keys(heroImages)) heroImages[route] = images.find(image=>image.source===heroImages[route])?.optimizedSource || heroImages[route]!
      const imagePreload = `if(matchMedia('(min-width: 901px)').matches){const images=${JSON.stringify(heroImages)};const route=location.pathname.replace(/\\/$/,'')||'/';const href=images[route];if(href){const link=document.createElement('link');link.rel='preload';link.as='image';link.type='image/webp';link.href=href;link.fetchPriority='low';link.dataset.huanyuPreload='patient-hero';document.head.appendChild(link)}}`
      return html.replace('</title>', `</title>\n    <script>${recovery}</script>\n    <script>${script}</script>\n    <script>${imagePreload}</script>`)
    },
  },
})

const versionFilePlugin = (): Plugin => {
  let config: ResolvedConfig
  return {
  name: 'huanyu-version-file',
  configResolved(resolved) { config = resolved },
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (new URL(request.url || '/', 'http://localhost').pathname !== '/version.json') return next()
      response.setHeader('Content-Type', 'application/json')
      response.setHeader('Cache-Control', 'no-store')
      response.end(versionPayload())
    })
  },
  closeBundle() {
    if (config.command !== 'build' || config.build.write === false) return
    writeFileSync(
      resolve(config.root, config.build.outDir, 'version.json'),
      `${JSON.stringify({
        version: buildVersion,
        builtAt: new Date().toISOString(),
      }, null, 2)}\n`,
    )
  },
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  plugins: [
    homeExpertSourcePlugin(),
    homeEntrySourcePlugin(assetCache.rewrite),
    optimizedImagePlugin(),
    packedHomeSourcePlugin(assetCache.rewrite),
    patientEntryPreloadPlugin(),
    assetCache.plugin,
    patientCachePlugin(),
    vue(),
    tailwindcss(),
    Components({
      resolvers: [VantResolver()],
    }),
    versionFilePlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2015',
    cssTarget: 'chrome80',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          'echarts-vendor': ['echarts', 'vue-echarts'],
          'vant-vendor': ['vant'],
          'ui-icons': ['lucide-vue-next'],
        },
      },
    },
  },
})
