import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n, { ensurePatientLocale } from './i18n'
import { resolveLocale, savedLocale } from './i18n/languages'
import { useAppStore } from './stores/app'

// Vant 触摸模拟（PC 调试用）
import '@vant/touch-emulator'

// 全局样式
import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

async function bootstrap() {
  // Resolve before the first render: a shared URL must never briefly show
  // the previous visitor language while the static language pack downloads.
  const patient = !location.pathname.startsWith('/hospital/') && location.pathname !== '/hospital'
  const language = patient ? resolveLocale(new URLSearchParams(location.search).get('lang')) || savedLocale() : savedLocale()
  if (patient) {
    await ensurePatientLocale(language)
    i18n.global.locale.value = language
    document.documentElement.lang = language
    document.documentElement.dataset.patientLocale = language
    try { localStorage.setItem('locale',language) } catch { /* The language also works without storage. */ }
  }
  app.mount('#app')
}
void bootstrap().catch(error => {
  console.error('Unable to load the selected site language', error)
  // The ordinary UI remains available if a cached language chunk was removed
  // during deployment. The selector can retry the failed download.
  i18n.global.locale.value = 'zh'
  document.documentElement.lang = 'zh'
  document.documentElement.dataset.patientLocale = 'zh'
  useAppStore().localeLoadError = '语言包加载失败，已显示中文。请在语言菜单中重试。'
  app.mount('#app')
})
