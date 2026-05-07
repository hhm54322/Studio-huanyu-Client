<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import type { Locale } from '@/stores/app'
import {
  Globe,
  Menu,
  X,
  Home,
  DollarSign,
  Building2,
  FileText,
  Users,
  Plane,
  Footprints,
  Info,
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const menuOpen = ref(false)
const scrolled = ref(false)
const langOpen = ref(false)

const navItems = computed(() => [
  { name: t('nav.home'), path: '/', icon: Home },
  { name: t('nav.cost'), path: '/cost', icon: DollarSign },
  { name: t('nav.hospitals'), path: '/hospitals', icon: Building2 },
  { name: t('nav.report'), path: '/report', icon: FileText },
  { name: t('nav.cases'), path: '/cases', icon: Users },
  { name: t('nav.visa'), path: '/visa', icon: Plane },
  { name: t('nav.steps'), path: '/steps', icon: Footprints },
  { name: t('nav.about'), path: '/about', icon: Info },
])

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'mn', label: 'Монгол', flag: '🇲🇳' },
]

function switchLang(code: Locale) {
  locale.value = code
  appStore.setLocale(code)
  langOpen.value = false
}

function navigate(path: string) {
  router.push(path)
  menuOpen.value = false
}

function onScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <!-- 顶部导航 -->
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-white/95 backdrop-blur shadow-sm' : 'bg-white'"
  >
    <div class="flex items-center justify-between px-4 h-14">
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer" @click="navigate('/')">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style="background: linear-gradient(135deg, var(--patient-primary), var(--patient-accent))"
        >
          寰
        </div>
        <span class="font-bold text-base" style="color: var(--patient-primary)">寰宇云医</span>
      </div>

      <!-- 右侧操作 -->
      <div class="flex items-center gap-3">
        <!-- 语言切换 -->
        <div class="relative">
          <button
            class="flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-gray-100"
            @click="langOpen = !langOpen"
          >
            <Globe class="w-4 h-4" style="color: var(--text-secondary)" />
            <span class="text-xs">{{ languages.find(l => l.code === locale)?.flag }}</span>
          </button>
          <div
            v-show="langOpen"
            class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[140px]"
          >
            <button
              v-for="lang in languages"
              :key="lang.code"
              class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              :class="{ 'font-bold': locale === lang.code }"
              @click="switchLang(lang.code)"
            >
              <span>{{ lang.flag }}</span>
              <span>{{ lang.label }}</span>
            </button>
          </div>
        </div>

        <!-- 汉堡菜单 -->
        <button class="p-1" @click="menuOpen = !menuOpen">
          <Menu v-if="!menuOpen" class="w-6 h-6" style="color: var(--text-primary)" />
          <X v-else class="w-6 h-6" style="color: var(--text-primary)" />
        </button>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <transition name="menu">
      <div v-show="menuOpen" class="bg-white border-t shadow-lg">
        <nav class="py-2">
          <button
            v-for="item in navItems"
            :key="item.path"
            class="w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors"
            :class="route.path === item.path
              ? 'font-bold'
              : 'hover:bg-gray-50'"
            :style="route.path === item.path
              ? { color: 'var(--patient-primary)', backgroundColor: 'var(--patient-light)' }
              : { color: 'var(--text-secondary)' }"
            @click="navigate(item.path)"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.name }}</span>
          </button>
        </nav>
      </div>
    </transition>
  </header>

  <!-- 主内容 -->
  <main class="pt-14 min-h-screen" style="background-color: var(--bg-page)">
    <RouterView />
  </main>

  <!-- 底部 -->
  <footer
    class="text-white py-8 px-4"
    style="background: linear-gradient(135deg, var(--patient-primary), var(--patient-secondary))"
  >
    <div class="max-w-lg mx-auto text-center">
      <div class="flex items-center justify-center gap-2 mb-4">
        <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
          寰
        </div>
        <span class="font-bold text-lg">寰宇云医</span>
      </div>
      <p class="text-white/80 text-xs mb-4">{{ t('footer.desc') }}</p>
      <div class="flex justify-center gap-6 text-sm mb-4">
        <button class="text-white/80 hover:text-white" @click="navigate('/about')">
          {{ t('footer.about') }}
        </button>
        <button class="text-white/80 hover:text-white" @click="navigate('/hospitals')">
          {{ t('footer.hospitals') }}
        </button>
        <button class="text-white/80 hover:text-white" @click="navigate('/cases')">
          {{ t('footer.cases') }}
        </button>
      </div>
      <p class="text-white/60 text-xs">{{ t('footer.copyright') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.menu-enter-from,
.menu-leave-to {
  max-height: 0;
  opacity: 0;
}
.menu-enter-to,
.menu-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
