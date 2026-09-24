<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import {
  Check,
  ChevronDown,
  Menu,
  X,
} from "lucide-vue-next";
import BrandLogo from "@/components/common/BrandLogo.vue";
import { useAppStore } from "@/stores/app";
import { useScroll } from "@/composables/useScroll";
import type { Locale } from "@/stores/app";

const route = useRoute();
const { locale } = useI18n();
const appStore = useAppStore();
const { scrolled } = useScroll(18);
const menuOpen = ref(false);
const langOpen = ref(false);

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

function closeOutside(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest(".language-control"))
    langOpen.value = false;
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
    langOpen.value = false;
  },
);

onMounted(() => document.addEventListener("click", closeOutside));
onUnmounted(() => document.removeEventListener("click", closeOutside));
</script>

<template>
  <header
    class="patient-header"
    :class="{
      'patient-header--scrolled': scrolled,
      'patient-header--open': menuOpen,
    }"
  >
    <div class="header-inner">
      <RouterLink to="/" class="header-logo" aria-label="寰宇云医首页"
        ><BrandLogo compact
      /></RouterLink>
      <button class="ask-aning" type="button" @click="openConsultation">
        <img src="/images/figma/trust/Icon-5.svg" alt="" aria-hidden="true" />问阿宁
      </button>
      <nav class="desktop-nav" aria-label="主导航">
        <template v-for="item in navItems" :key="item.name">
          <RouterLink
            v-if="item.path"
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
            <img src="/images/figma/trust/Icon-4.svg" alt="" aria-hidden="true" /><span class="language-flag">🇨🇳</span
            ><b>{{ currentLang?.short }}</b
            ><ChevronDown class="h-3 w-3" />
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
    <Transition name="mobile-menu"
      ><div v-if="menuOpen" class="mobile-nav">
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
  position: sticky;
  top: 0;
  z-index: 60;
  height: 64px;
  pointer-events: none;
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;
}
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
.ask-aning {
  display: inline-flex;
  width: 80px;
  height: 30px;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-left: auto;
  border: 0;
  border-radius: 10px;
  padding: 0 12px;
  background: linear-gradient(102deg, #ee771d, #4a82f0);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
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
.desktop-nav > button:hover {
  color: #2563eb;
}
.desktop-nav > a.active {
  background: rgba(37, 99, 235, 0.1);
  font-weight: 600;
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
  height: 34px;
  align-items: center;
  gap: 4px;
  border: 0;
  padding: 0 2px;
  background: transparent;
  color: #526879;
  font-size: 9px;
  cursor: pointer;
}
.language-button b {
  font-weight: 700;
}
.language-button > img {
  width: 14px;
  height: 14px;
}
.language-flag {
  font-size: 10px;
  line-height: 1;
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
}
</style>
