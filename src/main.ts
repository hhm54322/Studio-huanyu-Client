import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

import '@vant/touch-emulator'
import './assets/styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
// Initial route components and the selected route language load concurrently.
// The router guard resolves both before the first patient render, so a slow
// language request never flashes Chinese or overwrites a later user choice.
app.use(router)

async function bootstrap() {
  const patient = !/^\/hospital(?:\/|$)/.test(location.pathname)
  if (patient) {
    await router.isReady()
    await window.__huanyuPatientLoad?.entryStylesReady()
  }
  app.mount('#app')
  if (patient) {
    document.documentElement.dataset.huanyuAppReady = 'true'
    window.__huanyuRemoveBoot?.()
    window.__huanyuPatientLoad?.ready()
  } else {
    window.__huanyuRemoveBoot?.()
  }
}
void bootstrap().catch(error => {
  console.error('Unable to load the initial patient page', error)
  window.__huanyuShowRecovery?.()
  window.__huanyuPatientLoad?.failed()
})
