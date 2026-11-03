import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { savedLocale, type Locale } from '@/i18n/languages'
import i18n, { ensurePatientLocale } from '@/i18n'
export type { Locale } from '@/i18n/languages'

export type AppSide = 'patient' | 'hospital'

export const useAppStore = defineStore('app', () => {
  // 当前语言
  const locale = ref<Locale>(i18n.global.locale.value as Locale || savedLocale())

  // 移动端检测
  const isMobile = ref(false)

  function updateMobile() {
    isMobile.value = window.innerWidth < 768
  }

  let localeRequest = 0
  const localeLoadError = ref('')
  async function setLocale(lang: Locale) {
    const request = ++localeRequest
    try { await ensurePatientLocale(lang) } catch {
      const errors = { zh:'语言包加载失败，请重试。', en:'Language download failed. Please try again.', id:'Gagal memuat bahasa. Silakan coba lagi.', ms:'Gagal memuatkan bahasa. Sila cuba lagi.', pt:'Não foi possível carregar o idioma. Tente novamente.' }
      if (request === localeRequest) localeLoadError.value = errors[lang]
      return false
    }
    if (request !== localeRequest) return false
    localeLoadError.value = ''
    locale.value = lang
    i18n.global.locale.value = lang
    document.documentElement.lang = lang
    document.documentElement.dataset.patientLocale = lang
    try { localStorage.setItem('locale', lang) } catch { /* Language switching also works in private browsing. */ }
    return true
  }

  function initResponsive() {
    updateMobile()
    window.addEventListener('resize', updateMobile)
  }

  function destroyResponsive() {
    window.removeEventListener('resize', updateMobile)
  }

  return {
    locale,
    isMobile,
    setLocale,
    localeLoadError,
    initResponsive,
    destroyResponsive,
  }
})
