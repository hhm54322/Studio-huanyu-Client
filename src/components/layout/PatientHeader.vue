<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import {
  Check,
  Menu,
  X,
} from "lucide-vue-next";
import BrandLogo from "@/components/common/BrandLogo.vue";
import { useAppStore } from "@/stores/app";
import { useScroll } from "@/composables/useScroll";
import type { Locale } from "@/stores/app";
import HomeFigmaSection from '@/components/common/HomeFigmaSection.vue'
import HomeSourceNode from '@/components/common/HomeSourceNode.vue'
import MedicalServicesMenu from '@/components/layout/MedicalServicesMenu.vue'
import { homeFigmaActions } from '@/data/homeFigmaActions'
import { homeDesktopNodes, homeMobileNodes } from '@/data/homeFigmaSource'

const route = useRoute();
withDefaults(defineProps<{ consultationIcon?: string; languageIcon?: string }>(), { consultationIcon: '/images/figma/about-icons/Icon.svg', languageIcon: '/images/figma/about-icons/Icon-8.svg' });
const { locale } = useI18n();
const appStore = useAppStore();
const { scrolled } = useScroll(18);
const menuOpen = ref(false);
const langOpen = ref(false);
const serviceMenuOpen = ref(false);
const desktopServicesOpen = ref(false);
const headerWidth = ref(typeof window === 'undefined' ? 1440 : window.innerWidth);
let desktopServicesTimer: ReturnType<typeof setTimeout> | undefined;
const desktopServicesStyle = computed(() => {
  const scale = Math.min(1, headerWidth.value / 1440)
  return { left:`calc(50% + ${(830 - 720) * scale}px)`, top:`${72 * scale}px`, transform:`scale(${scale})` }
});
async function navigateDesktopServices(event: KeyboardEvent) {
  if (!(event.target as HTMLElement).closest('[data-figma-node="1523:95"], .desktop-services-trigger')) return
  if (event.key !== 'ArrowDown' && !(event.key === 'Tab' && !event.shiftKey && desktopServicesOpen.value)) return
  event.preventDefault()
  desktopServicesOpen.value = true
  await nextTick()
  document.querySelector<HTMLElement>('#home-services-menu a, #desktop-services-menu a')?.focus({ preventScroll:true })
}
function resizeHeader() { headerWidth.value = window.innerWidth }
function closeDesktopServices() {
  clearTimeout(desktopServicesTimer)
  desktopServicesTimer = setTimeout(() => { desktopServicesOpen.value = false }, 100)
}
function enterDesktopServices(event: Event) {
  if ((event.target as HTMLElement).closest('[data-figma-node="1523:95"], .desktop-services-trigger, .home-desktop-services, .desktop-services-popover')) {
    clearTimeout(desktopServicesTimer)
    desktopServicesOpen.value = true
  } else closeDesktopServices()
}
function leaveDesktopFocus(event: FocusEvent) {
  if (!(event.relatedTarget as HTMLElement | null)?.closest('[data-figma-node="1523:95"], .desktop-services-trigger, .home-desktop-services, .desktop-services-popover')) closeDesktopServices()
}
const mobileMenuActions = {
  '1555:424': { href: '/', label: '首页' },
  '1555:428': { href: '/why-china', label: '为什么选择中国' },
  '1555:431': { href: '/trust', label: '信任与常见问题' },
  '1555:434': { action: 'mobile-services', label: '医疗服务' },
  '1555:439': { href: '/dental', label: '牙科' },
  '1555:442': { href: '/hospitals', label: '中国医院' },
  '1555:445': { href: '/cases', label: '患者案例' },
  '1555:448': { href: '/insurance', label: '保险指南' },
  '1555:451': { href: '/about', label: '关于我们' },
};
const mobileExpandedActions = {
  '1555:502': { href: '/', label: '首页' },
  '1555:505': { href: '/why-china', label: '为什么选择中国' },
  '1555:508': { href: '/trust', label: '信任与常见问题' },
  '1555:511': { action: 'mobile-services-close', label: '收起医疗服务' },
  '1555:517': { action: 'pending', label: '健康体检' },
  '1555:520': { action: 'pending', label: '专科诊疗' },
  '1555:523': { action: 'pending', label: '中医康养' },
  '1555:526': { action: 'pending', label: '细胞治疗' },
  '1555:529': { href: '/dental', label: '牙科' },
  '1555:532': { href: '/hospitals', label: '中国医院' },
  '1555:535': { href: '/cases', label: '患者案例' },
  '1555:538': { href: '/insurance', label: '保险指南' },
  '1555:541': { href: '/about', label: '关于我们' },
};
const mobileLanguageActions = {
  '1555:503': { href: '/', label: '首页' },
  '1555:506': { href: '/why-china', label: '为什么选择中国' },
  '1555:509': { href: '/trust', label: '信任与常见问题' },
  '1555:512': { href: '/diseases-technologies', label: '医疗服务' },
  '1555:518': { action: 'pending', label: '健康体检' },
  '1555:521': { action: 'pending', label: '专科诊疗' },
  '1555:524': { action: 'pending', label: '中医康养' },
  '1555:527': { action: 'pending', label: '细胞治疗' },
  '1555:530': { href: '/dental', label: '牙科' },
  '1555:533': { href: '/hospitals', label: '中国医院' },
  '1555:536': { href: '/cases', label: '患者案例' },
  '1555:539': { href: '/insurance', label: '保险指南' },
  '1555:542': { href: '/about', label: '关于我们' },
};

const navItems = [
  { name: "首页", path: "/" },
  { name: "为什么选择中国", path: "/why-china" },
  { name: "信任与常见问题", path: "/trust" },
  { name: "医疗服务", path: "/diseases-technologies" },
  { name: "牙科", path: "/dental" },
  { name: "中国医院", path: "/hospitals" },
  { name: "患者案例", path: "/cases" },
  { name: "保险指南", path: "/insurance" },
  { name: "关于我们", path: "/about" },
];

const languages: { code: Locale; label: string; short: string }[] = [
  { code: "zh", label: "中文", short: "ZH" },
  { code: "en", label: "English", short: "EN" },
  { code: "id", label: "Bahasa Indonesia", short: "ID" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "mn", label: "Монгол", short: "MN" },
];

const currentLang = computed(
  () => languages.find((item) => item.code === locale.value) || languages[0],
);

function switchLang(code: Locale) {
  locale.value = code;
  appStore.setLocale(code);
  langOpen.value = false;
}

function openConsultation() {
  window.dispatchEvent(new CustomEvent("open-consultation"));
  menuOpen.value = false;
}
function onHomeAction(action:string) {
  if (action === 'desktop-services') {
    clearTimeout(desktopServicesTimer)
    desktopServicesOpen.value = true
  }
  if (action === 'menu') {
    menuOpen.value = !menuOpen.value
    if (!menuOpen.value) serviceMenuOpen.value = false
  }
  if (action === 'language') langOpen.value = !langOpen.value
  if (action === 'consultation') openConsultation()
}
function onMobileSourceAction(action:string) {
  if (action === 'mobile-services') {
    serviceMenuOpen.value = true
    return
  }
  if (action === 'mobile-services-close') {
    serviceMenuOpen.value = false
    return
  }
  if (action === 'pending') return
}

function closeOutside(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest('.language-control, [data-figma-node="1412:6782"], [data-figma-node="1523:110"], .home-language-menu'))
    langOpen.value = false;
}
function onHeaderKeydown(event:KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (desktopServicesOpen.value) {
    clearTimeout(desktopServicesTimer)
    desktopServicesOpen.value = false
    document.querySelector<HTMLButtonElement>('[data-figma-node="1523:95"], .desktop-services-trigger')?.focus({ preventScroll:true })
    desktopServicesOpen.value = false
  }
  if (menuOpen.value) {
    menuOpen.value = false
    serviceMenuOpen.value = false
    document.querySelector<HTMLButtonElement>('[data-figma-node="1528:123"], .menu-button')?.focus({preventScroll:true})
  }
  if (langOpen.value) {
    langOpen.value = false
    document.querySelector<HTMLButtonElement>('[data-figma-node="1523:110"], [data-figma-node="1412:6782"], .language-button')?.focus({preventScroll:true})
  }
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
    serviceMenuOpen.value = false;
    langOpen.value = false;
    desktopServicesOpen.value = false;
  },
);

onMounted(() => { document.addEventListener('click', closeOutside); document.addEventListener('keydown', onHeaderKeydown); window.addEventListener('resize', resizeHeader) });
onUnmounted(() => { document.removeEventListener('click', closeOutside); document.removeEventListener('keydown', onHeaderKeydown); window.removeEventListener('resize', resizeHeader); clearTimeout(desktopServicesTimer) });
</script>

<template>
  <header
    class="patient-header"
    @pointerover="enterDesktopServices"
    @pointerleave="closeDesktopServices"
    @focusin="enterDesktopServices"
    @focusout="leaveDesktopFocus"
    @keydown="navigateDesktopServices"
    :class="{
      'patient-header--scrolled': scrolled,
      'patient-header--open': menuOpen,
    }"
  >
    <HomeFigmaSection v-if="route.path === '/'" class="home-source-header" desktop-id="1523:75" mobile-id="1528:117" label="主导航" :actions="homeFigmaActions" :styles="headerWidth > 700 ? { '1523:75':'background:transparent;' } : undefined" :attributes="{ '1523:95': { 'aria-expanded':desktopServicesOpen, 'aria-controls':'home-services-menu', 'aria-haspopup':'true' } }" @activate="onHomeAction" />
    <div v-if="route.path === '/' && headerWidth > 700 && desktopServicesOpen" id="home-services-menu" class="home-desktop-services" :style="desktopServicesStyle">
      <HomeSourceNode :node="homeDesktopNodes.get('1524:26')!" root :actions="homeFigmaActions" />
    </div>
    <div v-if="route.path !== '/'" class="header-inner">
      <RouterLink to="/" class="header-logo" aria-label="寰宇云医首页"
        ><BrandLogo compact
      /></RouterLink>
      <button class="ask-aning" type="button" @click="openConsultation">
        <img :src="consultationIcon" alt="" aria-hidden="true" />问阿宁
      </button>
      <nav class="desktop-nav" aria-label="主导航">
        <template v-for="item in navItems" :key="item.name">
          <RouterLink
            v-if="item.name === '医疗服务'"
            :to="item.path"
            class="desktop-services-trigger"
            :class="{ active: route.path === item.path, 'desktop-services-trigger--disease': route.path === '/diseases-technologies' }"
            aria-haspopup="true"
            :aria-expanded="desktopServicesOpen"
            aria-controls="desktop-services-menu"
            @click.stop.prevent="desktopServicesOpen = true"
          >{{ item.name }}<span v-if="route.path === '/diseases-technologies'" class="disease-services-chevron" data-figma-node="1524:22" aria-hidden="true"><img src="/images/figma/disease-source/node-1524-23.svg" data-figma-node="1524:23" alt="" /></span></RouterLink>
          <RouterLink
            v-else-if="item.path"
            :to="item.path"
            :class="{ active: route.path === item.path }"
            >{{ item.name }}</RouterLink
          >
          <button v-else type="button" title="内容正在准备中">
            {{ item.name }}
          </button>
        </template>
      </nav>
      <div class="header-actions">
        <div class="language-control" @click.stop>
          <button
            class="language-button"
            type="button"
            :aria-expanded="langOpen"
            @click="langOpen = !langOpen"
          >
            <img :src="languageIcon" alt="" aria-hidden="true" /><span class="language-flag">🇨🇳</span
            ><b>{{ currentLang?.short }}</b
            >
          </button>
          <Transition name="dropdown"
            ><div v-if="langOpen" class="language-menu">
              <button
                v-for="language in languages"
                :key="language.code"
                type="button"
                @click="switchLang(language.code)"
              >
                <span>{{ language.label }}</span
                ><Check v-if="locale === language.code" class="h-4 w-4" />
              </button></div
          ></Transition>
        </div>
        <button
          class="menu-button"
          type="button"
          :aria-label="menuOpen ? '关闭菜单' : '打开菜单'"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="h-5 w-5" /><Menu v-else class="h-5 w-5" />
        </button>
      </div>
    </div>
    <Transition name="dropdown">
      <div v-if="route.path !== '/' && desktopServicesOpen && headerWidth > 700" id="desktop-services-menu" class="desktop-services-popover">
        <MedicalServicesMenu />
      </div>
    </Transition>
    <Transition name="dropdown">
      <div v-if="route.path === '/' && langOpen" class="language-menu home-language-menu" @click.stop>
        <button v-for="language in languages" :key="language.code" type="button" @click="switchLang(language.code)">
          <span>{{ language.label }}</span><Check v-if="locale === language.code" class="h-4 w-4" />
        </button>
      </div>
    </Transition>
    <Transition name="mobile-menu"><div v-if="menuOpen && route.path === '/'" class="mobile-source-menu" :class="{ 'mobile-source-menu--expanded': serviceMenuOpen }" aria-label="移动端导航">
      <HomeSourceNode :node="homeMobileNodes.get(serviceMenuOpen ? '1555:500' : '1555:422')!" root :actions="serviceMenuOpen ? mobileExpandedActions : mobileMenuActions" @activate="onMobileSourceAction" />
    </div></Transition>
    <Transition name="mobile-menu"
      ><div v-if="menuOpen && route.path !== '/'" class="mobile-nav">
        <nav aria-label="移动端导航">
          <template v-for="item in navItems" :key="item.name"
            ><RouterLink v-if="item.path" :to="item.path">{{
              item.name
            }}</RouterLink
            ><button v-else type="button" title="内容正在准备中">
              {{ item.name }}
            </button></template
          ><RouterLink to="/steps">来华就医流程</RouterLink>
        </nav>
        <button class="mobile-consult" type="button" @click="openConsultation">
          <img src="/images/figma/trust/Icon-5.svg" alt="" aria-hidden="true" />问阿宁
        </button>
      </div></Transition
    >
  </header>
</template>

<style scoped>
.patient-header {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  -webkit-font-smoothing: antialiased;
  position: sticky;
  top: 0;
  z-index: 60;
  height: 64px;
  pointer-events: none;
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;
}
.home-source-header { pointer-events:auto; background:transparent!important; overflow:visible; }
.patient-header--scrolled .home-source-header { background:rgba(255,255,255,.96)!important; }
.patient-header:has(.home-source-header) { height:64px; }
.home-language-menu { position:absolute; top:calc(100% + 8px); right:max(24px,calc((100vw - 1216px)/2)); pointer-events:auto; }
.desktop-services-popover { position:absolute; z-index:61; top:72px; left:calc(50% + 110px); pointer-events:auto; }
.home-desktop-services { position:absolute; z-index:1; width:111px; height:149px; transform-origin:top left; pointer-events:auto; }
.mobile-source-menu { position:absolute; top:52px; left:50%; z-index:59; width:min(375px,100vw); height:497px; max-height:calc(100dvh - 52px); overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; transform:translateX(-50%); background:#fff; box-shadow:0 16px 28px rgba(30,58,95,.08); pointer-events:auto; }
.mobile-source-menu--expanded { height:717px; }
.mobile-source-menu :deep(.home-source-node--root) { width:100%!important; height:497px!important; overflow:hidden; background:#fff; font-family:'PingFang SC',sans-serif; }
.mobile-source-menu--expanded :deep(.home-source-node--root) { height:717px!important; }
.mobile-source-menu :deep([data-figma-node="1555:424"]),
.mobile-source-menu :deep([data-figma-node="1555:428"]),
.mobile-source-menu :deep([data-figma-node="1555:431"]),
.mobile-source-menu :deep([data-figma-node="1555:434"]),
.mobile-source-menu :deep([data-figma-node="1555:439"]),
.mobile-source-menu :deep([data-figma-node="1555:442"]),
.mobile-source-menu :deep([data-figma-node="1555:445"]),
.mobile-source-menu :deep([data-figma-node="1555:448"]),
.mobile-source-menu :deep([data-figma-node="1555:451"]) { cursor:pointer; }
@media (max-width:700px) { .patient-header:has(.home-source-header) { height:52px; } }
.header-inner {
  width: min(1280px, calc(100% - 48px));
  height: 64px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 32px;
  pointer-events: auto;
}
.patient-header--scrolled,
.patient-header--open {
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 1px 0 rgba(18, 63, 103, 0.09),
    0 12px 32px rgba(18, 63, 103, 0.06);
  backdrop-filter: blur(18px);
}
.header-logo {
  flex: none;
}
.header-logo :deep(.brand-logo__mark) {
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: -0.15px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  box-shadow: none;
}
.header-logo :deep(.brand-logo__copy strong) {
  color: #1e3a5f;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.439px;
}
.ask-aning {
  display: inline-flex;
  width: 80px;
  height: 28px;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-left: auto;
  margin-right: 8px;
  border: 0;
  border-radius: 10px;
  padding: 0 12px;
  background: linear-gradient(90deg, #dd6b20, #3b82f6);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}
.ask-aning:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(40, 94, 169, 0.18);
}
.ask-aning img {
  width: 14px;
  height: 14px;
}
.desktop-nav {
  display: flex;
  height: 100%;
  flex: none;
  align-items: center;
  justify-content: flex-start;
  gap: 2px;
}
.desktop-nav > a,
.desktop-nav > button {
  position: relative;
  display: flex;
  height: 28px;
  align-items: center;
  border: 0;
  border-radius: 8px;
  padding: 0 10px;
  background: transparent;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}
.desktop-nav > a:hover,
.desktop-nav > a.active,
.desktop-nav > button:hover,
.desktop-nav > button.active {
  color: #2563eb;
}
.desktop-nav > a.active,
.desktop-nav > .desktop-services-trigger.active {
  background: rgba(37, 99, 235, 0.1);
  font-weight: 600;
}
.desktop-nav > .desktop-services-trigger--disease {
  width: 84px;
  padding: 6px 8px 6px 10px;
  align-items: flex-start;
  gap: 2px;
}
.patient-header:has(.desktop-services-trigger--disease) { background: #fff; }
.patient-header:has(.desktop-services-trigger--disease) .language-button { width: 65px; }
.patient-header:has(.desktop-services-trigger--disease) .ask-aning { margin-right: 10px; }
.patient-header:has(.desktop-services-trigger--disease) .header-actions { margin-left: 10px; }
.disease-services-chevron {
  position: relative;
  display: flex;
  width: 16px;
  height: 16px;
  flex: none;
  align-items: center;
  justify-content: center;
}
.disease-services-chevron img {
  position: absolute;
  left: 3.4px;
  top: 5.4px;
  width: 10px;
  height: 5px;
  max-width: none;
}
.header-actions {
  display: flex;
  flex: none;
  align-items: center;
  margin-left: 8px;
}
.language-control {
  position: relative;
}
.language-button {
  display: flex;
  height: 28px;
  align-items: center;
  gap: 4px;
  border: 0;
  padding: 6px 8px;
  background: transparent;
  color: #6b7280;
  font-size: 10px;
  line-height: 16px;
  cursor: pointer;
}
.language-button b {
  font-weight: 400;
  letter-spacing: .12px;
}
.language-button > img {
  width: 14px;
  height: 14px;
}
.language-flag {
  font-size: 12px;
  line-height: 16px;
}
.language-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 168px;
  padding: 7px;
  border: 1px solid var(--hy-line);
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 18px 42px rgba(9, 48, 76, 0.14);
}
.language-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: 4px;
  padding: 9px 10px;
  background: transparent;
  color: #38546a;
  font-size: 12px;
  cursor: pointer;
}
.language-menu button:hover {
  background: #f2f7fa;
}
.menu-button {
  display: none;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: #edf5fa;
  color: var(--hy-navy);
  cursor: pointer;
}
.mobile-nav {
  width: calc(100% - 24px);
  max-height: calc(100vh - 82px);
  margin: 4px auto 0;
  overflow-y: auto;
  padding: 14px;
  border: 1px solid var(--hy-line);
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 22px 55px rgba(9, 48, 76, 0.16);
  pointer-events: auto;
}
.mobile-nav nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.mobile-nav nav a,
.mobile-nav nav button {
  border: 0;
  border-radius: 4px;
  padding: 11px 10px;
  background: transparent;
  color: var(--hy-ink);
  text-align: left;
  font-size: 12px;
}
.mobile-nav nav a.router-link-active {
  background: #edf6fb;
  color: var(--hy-blue);
  font-weight: 700;
}
.mobile-consult {
  display: flex;
  width: 100%;
  height: 42px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 10px;
  border: 0;
  border-radius: 5px;
  background: linear-gradient(102deg, #ee771d, #4a82f0);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.mobile-consult img {
  width: 16px;
  height: 16px;
}
.dropdown-enter-active,
.dropdown-leave-active,
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s ease;
}
.dropdown-enter-from,
.dropdown-leave-to,
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
@media (max-width: 1230px) {
  .ask-aning {
    margin-left: auto;
  }
  .desktop-nav {
    flex: none;
    justify-content: flex-start;
  }
  .desktop-nav > a,
  .desktop-nav > button {
    padding-inline: 7px;
    font-size: 10px;
  }
  .header-actions {
    margin-left: 0;
  }
}
@media (max-width: 1050px) {
  .desktop-nav,
  .language-control {
    display: none;
  }
  .ask-aning {
    margin-left: auto;
  }
  .menu-button {
    display: grid;
    margin-left: 8px;
  }
}
@media (max-width: 640px) {
  .patient-header {
    height: 64px;
  }
  .header-inner {
    width: calc(100% - 24px);
    height: 64px;
    padding: 0;
  }
  .ask-aning {
    display: none;
  }
  .header-actions {
    margin-left: auto;
  }
}
</style>
