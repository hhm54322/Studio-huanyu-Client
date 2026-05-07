<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useScroll } from '@/composables/useScroll'
import type { Locale } from '@/stores/app'
import { Globe, Menu, X, ChevronDown, Check } from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { scrolled } = useScroll(20)

const menuOpen = ref(false)
const langOpen = ref(false)

const navItems = computed(() => [
  { name: t('nav.home'), path: '/' },
  { name: t('nav.cost'), path: '/cost' },
  { name: t('nav.report'), path: '/report' },
  { name: t('nav.hospitals'), path: '/hospitals' },
  { name: t('nav.cases'), path: '/cases' },
  { name: t('nav.visa'), path: '/visa' },
  { name: t('nav.steps'), path: '/steps' },
  { name: t('nav.about'), path: '/about' },
])

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'mn', label: 'Монгол', flag: '🇲🇳' },
]

const currentLang = computed(() => languages.find(l => l.code === locale.value))

function switchLang(code: Locale) {
  locale.value = code
  appStore.setLocale(code)
  langOpen.value = false
}

function navigate(path: string) {
  router.push(path)
  menuOpen.value = false
}

// 路由切换时关闭菜单
watch(() => route.path, () => {
  menuOpen.value = false
  langOpen.value = false
})

// 点击外部关闭语言下拉
function onClickOutsideLang(e: Event) {
  const target = e.target as HTMLElement
  if (!target.closest('.lang-switcher')) {
    langOpen.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-orange-100">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <div
            class="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style="background: linear-gradient(to bottom right, #C05621, #ED8936)"
          >
            寰
          </div>
          <span
            class="text-lg font-bold"
            style="background: linear-gradient(to right, #C05621, #DD6B20); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text"
          >
            寰宇云医
          </span>
        </router-link>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="route.path === item.path
              ? 'text-[#C05621] bg-orange-50'
              : 'text-gray-700 hover:text-[#DD6B20] hover:bg-orange-50/60'"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Desktop Right: Language + CTA -->
        <div class="hidden md:flex items-center gap-3">
          <!-- Language Switcher -->
          <div class="relative lang-switcher" @click.stop>
            <button
              class="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-[#DD6B20] hover:bg-orange-50/60 transition-colors"
              @click="langOpen = !langOpen"
            >
              <Globe class="h-4 w-4" />
              <span>{{ currentLang?.flag }}</span>
              <span class="text-xs">{{ currentLang?.label }}</span>
              <ChevronDown class="h-3 w-3" />
            </button>
            <transition name="dropdown">
              <div
                v-show="langOpen"
                class="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-orange-100 py-1 z-50"
              >
                <button
                  v-for="l in languages"
                  :key="l.code"
                  class="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-orange-50 transition-colors"
                  :class="locale === l.code ? 'text-[#C05621] font-medium bg-orange-50/50' : 'text-gray-700'"
                  @click="switchLang(l.code)"
                >
                  <span class="text-base">{{ l.flag }}</span>
                  <span>{{ l.label }}</span>
                  <Check v-if="locale === l.code" class="h-3.5 w-3.5 ml-auto text-[#DD6B20]" />
                </button>
              </div>
            </transition>
          </div>

          <!-- CTA -->
          <button
            class="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition-colors"
            style="background-color: #DD6B20"
            @mouseover="($event.target as HTMLElement).style.backgroundColor = '#C05621'"
            @mouseleave="($event.target as HTMLElement).style.backgroundColor = '#DD6B20'"
          >
            {{ t('nav.consult') }}
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2 rounded-md text-gray-700 hover:text-[#DD6B20]"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="h-6 w-6" />
          <Menu v-else class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <div v-show="menuOpen" class="md:hidden border-t border-orange-100 bg-white overflow-hidden">
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="block px-3 py-2 rounded-md text-sm font-medium"
            :class="route.path === item.path
              ? 'text-[#C05621] bg-orange-50'
              : 'text-gray-700 hover:text-[#DD6B20] hover:bg-orange-50/60'"
            @click="menuOpen = false"
          >
            {{ item.name }}
          </router-link>

          <!-- Mobile Language Switcher -->
          <div class="pt-2 pb-1 border-t border-orange-50 mt-2">
            <p class="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider">
              {{ t('nav.language') }}
            </p>
            <div class="flex flex-wrap gap-2 px-3 py-2">
              <button
                v-for="l in languages"
                :key="l.code"
                class="px-2 py-1 rounded text-xs border transition-colors"
                :class="locale === l.code
                  ? 'border-[#DD6B20] text-[#C05621] bg-orange-50'
                  : 'border-gray-200 text-gray-600 hover:border-orange-200'"
                @click="switchLang(l.code)"
              >
                {{ l.flag }} {{ l.label }}
              </button>
            </div>
          </div>

          <!-- Mobile CTA -->
          <button
            class="mt-2 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition-colors"
            style="background-color: #DD6B20"
          >
            {{ t('nav.consult') }}
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.25s ease;
  max-height: 600px;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
