<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { useScroll } from '@/composables/useScroll'
import { Menu, X, Stethoscope } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { scrolled } = useScroll(40)

const menuOpen = ref(false)

const navLinks = [
  { label: '首页', path: '/hospital' },
  { label: '解决方案', path: '/hospital/solutions' },
  { label: '数据案例', path: '/hospital/cases' },
  { label: 'API对接', path: '/hospital/api' },
  { label: '入驻申请', path: '/hospital/apply' },
]

function navigate(path: string) {
  router.push(path)
  menuOpen.value = false
}

// 路由切换时关闭菜单
watch(() => route.path, () => {
  menuOpen.value = false
})
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled
      ? 'bg-[#1A365D]/90 backdrop-blur-md shadow-lg'
      : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/hospital" class="flex items-center gap-2 text-white font-bold text-lg">
          <Stethoscope class="w-6 h-6 text-[#D69E2E]" />
          <span>寰宇云医 · 医院版</span>
        </router-link>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="route.path === link.path
              ? 'text-[#D69E2E]'
              : 'text-white/80 hover:text-white hover:bg-white/10'"
          >
            {{ link.label }}
          </router-link>
        </div>

        <!-- Desktop CTA -->
        <div class="hidden md:block">
          <router-link
            to="/hospital/apply"
            class="inline-block rounded-md px-4 py-2 text-sm font-bold transition-colors"
            style="background-color: #D69E2E; color: #1A365D"
            @mouseover="($event.target as HTMLElement).style.backgroundColor = '#B7791F'"
            @mouseleave="($event.target as HTMLElement).style.backgroundColor = '#D69E2E'"
          >
            立即入驻
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden text-white p-2"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <div
        v-show="menuOpen"
        class="md:hidden bg-[#1A365D]/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
      >
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="route.path === link.path
              ? 'text-[#D69E2E] bg-white/10'
              : 'text-white/80 hover:text-white hover:bg-white/10'"
            @click="menuOpen = false"
          >
            {{ link.label }}
          </router-link>
          <div class="pt-2">
            <router-link
              to="/hospital/apply"
              class="block w-full text-center rounded-md px-4 py-2 text-sm font-bold transition-colors"
              style="background-color: #D69E2E; color: #1A365D"
              @click="menuOpen = false"
            >
              立即入驻
            </router-link>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.25s ease;
  max-height: 400px;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
