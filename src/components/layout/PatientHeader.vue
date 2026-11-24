<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useSiteCopy } from '@/i18n/siteCopy'
import { useScroll } from '@/composables/useScroll'
import { useAppStore, type Locale } from '@/stores/app'
import { homeFigmaActions } from '@/data/homeFigmaActions'
import { patientLanguages } from '@/i18n/languages'

const HomeFigmaSection = defineAsyncComponent(() => import('@/components/common/HomeFigmaSection.vue'))
const HomeSourceNode = defineAsyncComponent(() => import('@/components/common/HomeSourceNode.vue'))
const { tx } = useSiteCopy()
const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useAppStore()
const { scrolled } = useScroll(18)
const menuOpen = ref(false)
const serviceMenuOpen = ref(false)
const headerWidth = ref(typeof window === 'undefined' ? 1440 : window.innerWidth)
const homeSource = shallowRef<typeof import('@/data/homeSourceRegistry')>()
void import('@/data/homeSourceRegistry').then(source => { homeSource.value = source })

const mobileMenuActions = {
  '1555:424': { href: '/', label: '首页' },
  '1555:428': { href: '/why-china', label: '为什么选择中国' },
  '1555:431': { href: '/trust', label: '信任与常见问题' },
  '1555:434': { action: 'mobile-services', label: '医疗服务' },
  '1555:439': { href: '/dental?step=1', label: '牙科' },
  '1555:442': { href: '/hospitals', label: '中国医院' },
  '1555:445': { href: '/cases', label: '患者案例' },
  '1555:448': { href: '/insurance', label: '保险指南' },
  '1555:451': { href: '/about', label: '关于我们' },
}
const mobileExpandedActions = {
  '1555:502': { href: '/', label: '首页' },
  '1555:505': { href: '/why-china', label: '为什么选择中国' },
  '1555:508': { href: '/trust', label: '信任与常见问题' },
  '1555:511': { action: 'mobile-services-close', label: '收起医疗服务' },
  '1555:517': { action: 'pending', label: '健康体检' },
  '1555:520': { href: '/diseases-technologies', label: '专科诊疗' },
  '1555:523': { action: 'pending', label: '中医康养' },
  '1555:526': { action: 'pending', label: '细胞治疗' },
  '1555:529': { href: '/dental?step=1', label: '牙科' },
  '1555:532': { href: '/hospitals', label: '中国医院' },
  '1555:535': { href: '/cases', label: '患者案例' },
  '1555:538': { href: '/insurance', label: '保险指南' },
  '1555:541': { href: '/about', label: '关于我们' },
}
function onHeaderAction(action: string) {
  if (action === 'menu') { menuOpen.value = !menuOpen.value; if (!menuOpen.value) serviceMenuOpen.value = false }
  if (action === 'consultation') window.dispatchEvent(new CustomEvent('open-consultation'))
}
function onMobileAction(action: string) {
  if (action === 'mobile-services') serviceMenuOpen.value = true
  if (action === 'mobile-services-close') serviceMenuOpen.value = false
}
function onMobileClick(event: MouseEvent) {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
  if (!link) return
  menuOpen.value = false
  serviceMenuOpen.value = false
  if (new URL(link.href, location.href).pathname === '/dental' && route.path === '/dental' && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey)
    window.dispatchEvent(new CustomEvent('dental-navigation-home'))
}
async function switchLang(code: Locale) {
  if (!await store.setLocale(code)) return
  await router.replace({ query: { ...route.query, lang: code }, hash: route.hash })
}
function resize() { headerWidth.value = window.innerWidth }
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !menuOpen.value) return
  menuOpen.value = false
  serviceMenuOpen.value = false
  document.querySelector<HTMLButtonElement>('[data-figma-node="1528:123"]')?.focus({ preventScroll: true })
}
watch(() => route.fullPath, () => { menuOpen.value = false; serviceMenuOpen.value = false })
onMounted(() => { window.addEventListener('resize', resize, { passive: true }); document.addEventListener('keydown', onKeydown) })
onUnmounted(() => { window.removeEventListener('resize', resize); document.removeEventListener('keydown', onKeydown) })
</script>

<template>
  <header class="patient-header" :class="{ 'patient-header--scrolled': scrolled, 'patient-header--open': menuOpen }">
    <HomeFigmaSection class="home-source-header" desktop-id="1523:75" mobile-id="1528:117" :label="tx('主导航')"
      :actions="homeFigmaActions" :styles="headerWidth > 700 ? { '1523:75': 'background:transparent;' } : undefined" @activate="onHeaderAction" />
    <Transition name="mobile-menu">
      <div v-if="menuOpen && homeSource" class="mobile-source-menu" :class="{ 'mobile-source-menu--expanded': serviceMenuOpen }" :aria-label="tx('移动端导航')" @click="onMobileClick">
        <HomeSourceNode :node="homeSource.homeMobileNodes.get(serviceMenuOpen ? '1555:500' : '1555:422')!" root :actions="serviceMenuOpen ? mobileExpandedActions : mobileMenuActions" @activate="onMobileAction" />
        <RouterLink class="mobile-source-news" to="/news">{{ tx('新闻与咨询') }}</RouterLink>
        <div class="mobile-language" :aria-label="tx('选择语言')"><button v-for="language in patientLanguages" :key="language.code" type="button" :aria-pressed="locale === language.code" @click="switchLang(language.code)">{{ language.label }}</button></div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.patient-header { position:sticky; top:0; z-index:60; height:64px; pointer-events:none; font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; transition:background .3s ease,box-shadow .3s ease; }
.patient-header--scrolled,.patient-header--open { background:rgba(255,255,255,.92); box-shadow:0 1px 0 rgba(18,63,103,.09),0 12px 32px rgba(18,63,103,.06); backdrop-filter:blur(18px); }
.home-source-header { pointer-events:auto; background:transparent!important; overflow:visible; }
.patient-header--scrolled .home-source-header { background:rgba(255,255,255,.96)!important; }
.mobile-source-menu { position:absolute; top:52px; left:50%; z-index:59; width:min(375px,100vw); height:auto; max-height:calc(100dvh - 52px); overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; transform:translateX(-50%); background:#fff; box-shadow:0 16px 28px rgba(30,58,95,.08); pointer-events:auto; }
.mobile-source-menu :deep(.home-source-node--root) { width:100%!important; height:497px!important; overflow:hidden; background:#fff; font-family:'PingFang SC',sans-serif; }
.mobile-source-menu--expanded :deep(.home-source-node--root) { height:552px!important; }
.mobile-source-menu--expanded :deep([data-figma-node="1555:516"]),.mobile-source-menu--expanded :deep([data-figma-node="1555:522"]),.mobile-source-menu--expanded :deep([data-figma-node="1555:525"]) { display:none!important; }
.mobile-source-menu--expanded :deep([data-figma-node="1555:519"]) { top:222px!important; }
.mobile-source-menu--expanded :deep([data-figma-node="1555:528"]) { top:277px!important; }
.mobile-source-menu--expanded :deep([data-figma-node="1555:531"]) { top:332px!important; }
.mobile-source-menu--expanded :deep([data-figma-node="1555:534"]) { top:387px!important; }
.mobile-source-menu--expanded :deep([data-figma-node="1555:537"]) { top:442px!important; }
.mobile-source-menu--expanded :deep([data-figma-node="1555:540"]) { top:497px!important; }
.mobile-source-news { display:block; margin:4px 22px 12px; color:#1e3a5f; font-size:15px; font-weight:500; }
.mobile-language { display:flex; flex-wrap:wrap; gap:8px; padding:16px; pointer-events:auto; background:#fff; }
.mobile-language button { border:1px solid #dbe1e9; border-radius:18px; padding:7px 10px; background:#fff; color:#1e3a5f; font-size:12px; }
.mobile-language button[aria-pressed=true] { border-color:#2563eb; color:#2563eb; background:#eff6ff; }
.mobile-menu-enter-active,.mobile-menu-leave-active { transition:opacity .2s ease; }
.mobile-menu-enter-from,.mobile-menu-leave-to { opacity:0; }
@media (max-width:700px) { .patient-header { height:52px; } }
@media (prefers-reduced-motion:reduce) { .patient-header,.mobile-menu-enter-active,.mobile-menu-leave-active { transition:none; } }
</style>
