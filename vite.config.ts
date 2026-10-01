import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync, writeFileSync } from 'node:fs'

const buildVersion = process.env.VITE_APP_VERSION || new Date().toISOString()

const versionPayload = () => JSON.stringify({ version: buildVersion, builtAt: new Date().toISOString() })

const optimizedImagePlugin = (): Plugin => {
  const urls = new Map<string, string>()
  return {
    name: 'huanyu-patient-optimized-images',
    apply: 'build',
    enforce: 'pre',
    buildStart() {
      const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('./public/image-optimization.json', import.meta.url)), 'utf8'))
      for (const image of manifest.images) urls.set(image.source, image.optimizedSource)
    },
    transform(code, id) {
      if (!id.includes('/src/views/patient/') && !id.includes('/src/data/') && !id.includes('/docs/figma-source/')) return
      const updated = code.replace(/\/images\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp)(?=["'`)\s])/g,
        url => urls.get(url) || url)
      return updated === code ? undefined : { code: updated, map: null }
    },
  }
}

const versionFilePlugin = (): Plugin => ({
  name: 'huanyu-version-file',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (new URL(request.url || '/', 'http://localhost').pathname !== '/version.json') return next()
      response.setHeader('Content-Type', 'application/json')
      response.setHeader('Cache-Control', 'no-store')
      response.end(versionPayload())
    })
  },
  closeBundle() {
    writeFileSync(
      fileURLToPath(new URL('./dist/version.json', import.meta.url)),
      `${JSON.stringify({
        version: buildVersion,
        builtAt: new Date().toISOString(),
      }, null, 2)}\n`,
    )
  },
})

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  plugins: [
    optimizedImagePlugin(),
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
        },
      },
    },
  },
})
