import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'

const buildVersion = process.env.VITE_APP_VERSION || new Date().toISOString()

const versionFilePlugin = () => ({
  name: 'huanyu-version-file',
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
