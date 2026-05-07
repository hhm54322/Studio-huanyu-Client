import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export type AppSide = 'patient' | 'hospital'
export type Locale = 'zh' | 'en' | 'id' | 'ru' | 'mn'

export const useAppStore = defineStore('app', () => {
  // 当前语言
  const locale = ref<Locale>(
    (typeof localStorage !== 'undefined' && localStorage.getItem('locale') as Locale) || 'zh'
  )

  // 移动端检测
  const isMobile = ref(false)

  function updateMobile() {
    isMobile.value = window.innerWidth < 768
  }

  function setLocale(lang: Locale) {
    locale.value = lang
    localStorage.setItem('locale', lang)
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
    initResponsive,
    destroyResponsive,
  }
})
