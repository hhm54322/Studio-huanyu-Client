import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'

const buildVersion = process.env.VITE_APP_VERSION || new Date().toISOString()

const versionPayload = () => JSON.stringify({ version: buildVersion, builtAt: new Date().toISOString() })

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
