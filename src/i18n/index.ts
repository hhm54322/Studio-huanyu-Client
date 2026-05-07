import { createI18n } from 'vue-i18n'

import zh from './locales/zh.json'
import en from './locales/en.json'
import id from './locales/id.json'
import ru from './locales/ru.json'
import mn from './locales/mn.json'

export type Locale = 'zh' | 'en' | 'id' | 'ru' | 'mn'

const savedLocale =
  (typeof localStorage !== 'undefined' && localStorage.getItem('locale')) || 'zh'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale as Locale,
  fallbackLocale: 'zh',
  messages: { zh, en, id, ru, mn },
})

export default i18n
