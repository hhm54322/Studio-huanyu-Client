import {createApp} from 'vue'
import {createI18n} from 'vue-i18n'
import zh from '../src/i18n/locales/zh.json'
import App from './App.vue'
import './workbench.css'
createApp(App).use(createI18n({legacy:false,locale:'zh',fallbackLocale:'zh',messages:{zh}})).mount('#app')
