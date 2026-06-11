<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { RefreshCw } from 'lucide-vue-next'
import { useAppVersion } from '@/composables/useAppVersion'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const route = useRoute()
const { updateAvailable, checkForUpdate, refreshApp } = useAppVersion()

const handleWindowFocus = () => {
  checkForUpdate().catch(() => undefined)
}

onMounted(() => {
  appStore.initResponsive()
  checkForUpdate({ force: true }).catch(() => undefined)
  window.addEventListener('focus', handleWindowFocus)
})

onUnmounted(() => {
  appStore.destroyResponsive()
  window.removeEventListener('focus', handleWindowFocus)
})

watch(
  () => route.fullPath,
  () => {
    checkForUpdate().catch(() => undefined)
  },
)
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>

  <div
    v-if="updateAvailable"
    class="fixed inset-x-0 top-0 z-[9999] border-b border-orange-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur"
  >
    <div class="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="font-semibold text-slate-950">系统已更新，请刷新后继续</div>
        <p class="mt-0.5 text-xs leading-5 text-slate-500">
          为避免旧页面缓存影响报告生成或展示，请刷新加载最新版本。
        </p>
      </div>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#DD6B20] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#C05621]"
        type="button"
        @click="refreshApp"
      >
        <RefreshCw class="h-4 w-4" />
        刷新页面
      </button>
    </div>
  </div>
</template>
