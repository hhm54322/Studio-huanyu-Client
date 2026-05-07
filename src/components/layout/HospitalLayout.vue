<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Menu,
  X,
  Home,
  Lightbulb,
  BookOpen,
  Code,
  ClipboardCheck,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const menuOpen = ref(false)
const scrolled = ref(false)

const navItems = computed(() => [
  { name: '首页', path: '/hospital', icon: Home },
  { name: '解决方案', path: '/hospital/solutions', icon: Lightbulb },
  { name: '案例研究', path: '/hospital/cases', icon: BookOpen },
  { name: 'API 对接', path: '/hospital/api', icon: Code },
  { name: '申请入驻', path: '/hospital/apply', icon: ClipboardCheck },
])

function navigate(path: string) {
  router.push(path)
  menuOpen.value = false
}

function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <!-- 顶部导航 -->
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled
      ? 'backdrop-blur shadow-sm'
      : ''"
    :style="scrolled
      ? { backgroundColor: 'rgba(26,54,93,0.95)' }
      : { backgroundColor: 'var(--hospital-primary)' }"
  >
    <div class="flex items-center justify-between px-4 h-14">
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer" @click="navigate('/hospital')">
        <div
          class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm"
        >
          寰
        </div>
        <span class="font-bold text-base text-white">寰宇云医</span>
        <span class="text-xs text-white/60 ml-1">医院端</span>
      </div>

      <!-- 右侧操作 -->
      <div class="flex items-center gap-3">
        <!-- 入驻 CTA -->
        <button
          class="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
          style="background-color: var(--hospital-accent); color: var(--hospital-primary)"
          @click="navigate('/hospital/apply')"
        >
          立即入驻
        </button>

        <!-- 汉堡菜单 -->
        <button class="p-1 text-white" @click="menuOpen = !menuOpen">
          <Menu v-if="!menuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <transition name="menu">
      <div
        v-show="menuOpen"
        class="border-t border-white/10"
        style="background-color: var(--hospital-primary)"
      >
        <nav class="py-2">
          <button
            v-for="item in navItems"
            :key="item.path"
            class="w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors"
            :class="route.path === item.path
              ? 'text-white font-bold'
              : 'text-white/70 hover:text-white hover:bg-white/5'"
            :style="route.path === item.path
              ? { backgroundColor: 'rgba(255,255,255,0.1)' }
              : {}"
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
  <main class="pt-14 min-h-screen" style="background-color: var(--hospital-light)">
    <RouterView />
  </main>

  <!-- 底部 -->
  <footer
    class="text-white py-8 px-4"
    style="background-color: var(--hospital-primary)"
  >
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
          寰
        </div>
        <span class="font-bold text-lg">寰宇云医</span>
        <span class="text-xs text-white/50 ml-1">医院端</span>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <h4 class="font-medium mb-2 text-white/90">解决方案</h4>
          <div class="space-y-1">
            <button class="block text-white/60 hover:text-white text-xs" @click="navigate('/hospital/solutions')">AI 智能匹配</button>
            <button class="block text-white/60 hover:text-white text-xs" @click="navigate('/hospital/api')">API 对接</button>
          </div>
        </div>
        <div>
          <h4 class="font-medium mb-2 text-white/90">联系我们</h4>
          <p class="text-white/60 text-xs">400-888-6688</p>
          <p class="text-white/60 text-xs">hospital@huanyuyunyi.com</p>
        </div>
      </div>

      <div class="border-t border-white/10 pt-4 text-center">
        <p class="text-white/40 text-xs">© 2024 寰宇云医 版权所有 | ICP备案号</p>
      </div>
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
  max-height: 400px;
  opacity: 1;
}
</style>
