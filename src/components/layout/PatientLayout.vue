<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ConsultationPanel from '@/components/common/ConsultationPanel.vue'
import PatientFooter from './PatientFooter.vue'
import PatientHeader from './PatientHeader.vue'

const route = useRoute()
const homeMobile = ref(typeof window !== 'undefined' && window.innerWidth <= 700)
const articleDesktop = ref(typeof window === 'undefined' || window.innerWidth > 900)
const sourceArticle = computed(() => articleDesktop.value && route.path === '/steps/toolkit-detail')
const sourceDirectory = computed(() => ['/hospitals', '/doctors'].includes(route.path))
const sourceTrust = computed(() => articleDesktop.value && route.path === '/trust')
function updateHomeViewport() {
  homeMobile.value = window.innerWidth <= 700
  articleDesktop.value = window.innerWidth > 900
}
let observer: IntersectionObserver | null = null
let contentObserver: MutationObserver | null = null
let buttonCleanups: Array<() => void> = []
let scrollMotionFrame = 0
let routeMotionTimer: number | undefined

function clearButtonMotion() {
  buttonCleanups.forEach((cleanup) => cleanup())
  buttonCleanups = []
}

function attachButtonMotion() {
  clearButtonMotion()
  if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return

  document.querySelectorAll<HTMLElement>('.hy-button-primary, .hy-button-secondary, .hy-button-light').forEach((button) => {
    button.classList.add('hy-motion-button')

    const move = (event: PointerEvent) => {
      const rect = button.getBoundingClientRect()
      button.style.setProperty('--motion-x', `${event.clientX - rect.left}px`)
      button.style.setProperty('--motion-y', `${event.clientY - rect.top}px`)
    }
    const reset = () => {
      button.style.setProperty('--motion-x', '50%')
      button.style.setProperty('--motion-y', '50%')
    }

    button.addEventListener('pointermove', move)
    button.addEventListener('pointerleave', reset)
    reset()
    buttonCleanups.push(() => {
      button.removeEventListener('pointermove', move)
      button.removeEventListener('pointerleave', reset)
    })
  })
}

function revealVisibleElements() {
  const viewportBottom = window.innerHeight
  document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-visible="true"])').forEach((element) => {
    const rect = element.getBoundingClientRect()
    if (rect.bottom <= 0 || rect.top >= viewportBottom) return
    element.setAttribute('data-reveal-visible', 'true')
    element.classList.add('is-visible')
    observer?.unobserve(element)
  })
}

function attachRevealAnimations() {
  observer?.disconnect()
  contentObserver?.disconnect()
  document.documentElement.classList.remove('hy-reveal-ready')
  const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]')

  // Some embedded browsers do not expose IntersectionObserver. The base CSS
  // keeps content visible there instead of leaving the page permanently transparent.
  if (typeof IntersectionObserver === 'undefined') {
    attachButtonMotion()
    return
  }

  document.documentElement.classList.add('hy-reveal-ready')
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.setAttribute('data-reveal-visible', 'true')
      entry.target.classList.add('is-visible')
      observer?.unobserve(entry.target)
    })
  }, { rootMargin: '0px', threshold: 0 })

  const observeRevealElements = (root: ParentNode = document) => {
    root.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-visible="true"])').forEach((element) => observer?.observe(element))
    revealVisibleElements()
  }

  revealElements.forEach((element) => observer?.observe(element))
  const main = document.querySelector('main')
  if (main && typeof MutationObserver !== 'undefined') {
    contentObserver = new MutationObserver((mutations) => {
      if (!mutations.some((mutation) => mutation.addedNodes.length)) return
      observeRevealElements(main)
    })
    contentObserver.observe(main, { childList: true, subtree: true })
  }
  revealVisibleElements()
  attachButtonMotion()
}

function updateScrollMotion() {
  scrollMotionFrame = 0
  revealVisibleElements()
  const reduceMotion = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches

  document.querySelectorAll<HTMLElement>('.hy-page-hero').forEach((hero) => {
    if (reduceMotion) {
      hero.style.removeProperty('--hy-hero-media-y')
      hero.style.removeProperty('--hy-hero-content-y')
      hero.style.removeProperty('--hy-hero-content-opacity')
      return
    }

    const rect = hero.getBoundingClientRect()
    const travelled = Math.max(0, -rect.top - 70)
    const progress = Math.min(1, travelled / Math.max(rect.height * 0.72, 1))
    hero.style.setProperty('--hy-hero-media-y', `${Math.round(progress * 58)}px`)
    hero.style.setProperty('--hy-hero-content-y', `${Math.round(progress * -28)}px`)
    hero.style.setProperty('--hy-hero-content-opacity', `${1 - progress * 0.42}`)
  })
}

function requestScrollMotion() {
  if (!scrollMotionFrame) scrollMotionFrame = window.requestAnimationFrame(updateScrollMotion)
}

function scheduleRouteMotion() {
  if (routeMotionTimer) window.clearTimeout(routeMotionTimer)
  const bind = () => {
    attachRevealAnimations()
    updateScrollMotion()
  }
  requestAnimationFrame(() => {
    bind()
  })
  // RouterView uses an out-in transition; bind once more after the new lazy
  // route has entered without repeatedly scanning the page during navigation.
  routeMotionTimer = window.setTimeout(() => {
    bind()
    routeMotionTimer = undefined
  }, 320)
}

watch(() => route.fullPath, async () => {
  await nextTick()
  scheduleRouteMotion()
})

onMounted(() => {
  window.addEventListener('resize', updateHomeViewport, { passive:true })
  window.addEventListener('scroll', requestScrollMotion, { passive: true })
  window.addEventListener('resize', requestScrollMotion)
  scheduleRouteMotion()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHomeViewport)
  observer?.disconnect()
  contentObserver?.disconnect()
  clearButtonMotion()
  window.removeEventListener('scroll', requestScrollMotion)
  window.removeEventListener('resize', requestScrollMotion)
  if (scrollMotionFrame) window.cancelAnimationFrame(scrollMotionFrame)
  if (routeMotionTimer) window.clearTimeout(routeMotionTimer)
})
</script>

<template>
  <div
    class="patient-shell min-h-screen flex flex-col"
    :data-figma-node="route.path === '/' ? homeMobile ? '1528:116' : '1412:5682' : undefined"
    :class="{
      'patient-shell--disease': route.path === '/diseases-technologies',
      'patient-shell--trust': route.path === '/trust',
      'patient-shell--source-article': sourceArticle,
      'patient-shell--about': route.path === '/about',
      'patient-shell--home': route.path === '/',
      'patient-shell--why-china': route.path === '/why-china',
      'patient-shell--hospitals': sourceDirectory,
      'patient-shell--cases': route.path === '/cases',
      'patient-shell--dental': route.path === '/dental',
      'patient-shell--insurance': route.path === '/insurance',
      'patient-shell--cost': route.path === '/cost' || route.path === '/cost-generated',
    }"
  >
    <div class="patient-shell__body" :data-figma-node="route.path === '/' && !homeMobile ? '1412:5683' : undefined">
    <PatientHeader v-if="!sourceArticle && !sourceDirectory && !sourceTrust && (route.path !== '/dental' || homeMobile)" :consultation-icon="route.path === '/hospitals' ? '/images/figma/hospital-source/node-484-1559.svg' : route.path === '/cases' ? '/images/figma/case-source/node-484-1602.svg' : route.path === '/diseases-technologies' ? '/images/figma/disease-source/node-484-1516.svg' : undefined" :language-icon="route.path === '/hospitals' ? '/images/figma/hospital-source/node-484-1583.svg' : route.path === '/cases' ? '/images/figma/case-source/node-484-1626.svg' : route.path === '/diseases-technologies' ? '/images/figma/disease-source/node-484-1540.svg' : undefined" />
    <main class="flex-1"><RouterView /></main>
    <PatientFooter v-if="!sourceArticle && !sourceDirectory && !sourceTrust && (route.path !== '/dental' || homeMobile)" :contact-icons="route.path === '/hospitals' ? [5198, 5204, 5209].map(id => `/images/figma/hospital-source/node-144-${id}.svg`) : route.path === '/cases' ? [5473, 5479, 5484].map(id => `/images/figma/case-source/node-190-${id}.svg`) : route.path === '/diseases-technologies' ? [4630, 4636, 4641].map(id => `/images/figma/disease-source/node-144-${id}.svg`) : undefined" />
    <ConsultationPanel />
    </div>
  </div>
</template>

<style scoped>
.patient-shell__body { display:contents; }
.patient-shell--source-article :deep(.consult-float) { display:none; }
.patient-shell--disease :deep(.footer-intro .brand-logo__mark) { font-size:14px; font-weight:700; line-height:20px; letter-spacing:0; }
.patient-shell--disease :deep(.footer-intro .brand-logo__copy strong) { font-weight:700; line-height:28px; }
.patient-shell--disease :deep(.footer-column h3),
.patient-shell--disease :deep(.ask-aning) { font-weight:590; letter-spacing:0; }
.patient-shell--disease :deep(.footer-service b),
.patient-shell--disease :deep(.desktop-nav>a:nth-child(n+5)) { font-weight:510; }
.patient-shell--disease :deep(.desktop-nav>a.active) { font-weight:600; }
.patient-shell--disease :deep(.language-button b),
.patient-shell--disease :deep(.header-logo .brand-logo__mark),
.patient-shell--disease :deep(.header-logo .brand-logo__copy strong) { letter-spacing:0; }
.patient-shell--cases :deep(.footer-intro .brand-logo__mark) { font-size:14px; font-weight:700; line-height:20px; letter-spacing:0; }
.patient-shell--cases :deep(.footer-intro .brand-logo__copy strong) { font-weight:700; line-height:28px; }
.patient-shell--cases :deep(.footer-column h3),
.patient-shell--cases :deep(.ask-aning) { font-weight:590; letter-spacing:0; }
.patient-shell--cases :deep(.footer-service b),
.patient-shell--cases :deep(.desktop-nav>a:nth-child(n+4)) { font-weight:510; }
.patient-shell--cases :deep(.desktop-nav>a.active) { font-weight:600; }
.patient-shell--cases :deep(.language-button b),
.patient-shell--cases :deep(.header-logo .brand-logo__mark),
.patient-shell--cases :deep(.header-logo .brand-logo__copy strong) { letter-spacing:0; }
.patient-shell--cases :deep(.consult-float) { display:none; }
.patient-shell--hospitals :deep(.footer-intro .brand-logo__mark) { font-size:14px; font-weight:700; line-height:20px; letter-spacing:0; }
.patient-shell--hospitals :deep(.footer-intro .brand-logo__copy strong) { font-weight:700; line-height:28px; }
.patient-shell--hospitals :deep(.footer-column h3),
.patient-shell--hospitals :deep(.ask-aning) { font-weight:590; letter-spacing:0; }
.patient-shell--hospitals :deep(.footer-service b),
.patient-shell--hospitals :deep(.desktop-nav>a:nth-child(n+4)) { font-weight:510; }
.patient-shell--hospitals :deep(.desktop-nav>a.active) { font-weight:600; }
.patient-shell--hospitals :deep(.language-button b),
.patient-shell--hospitals :deep(.header-logo .brand-logo__mark),
.patient-shell--hospitals :deep(.header-logo .brand-logo__copy strong) { letter-spacing:0; }
.patient-shell--hospitals :deep(.consult-float) { display:none; }
.patient-shell--why-china :deep(.footer-intro .brand-logo__mark) { font-size:14px; font-weight:700; line-height:20px; }
.patient-shell--why-china :deep(.footer-intro .brand-logo__copy strong) { font-weight:700; line-height:28px; }
.patient-shell--why-china :deep(.footer-column h3),
.patient-shell--why-china :deep(.ask-aning) { font-weight:590; }
.patient-shell--why-china :deep(.footer-service b),
.patient-shell--why-china :deep(.desktop-nav>a:nth-child(n+4)) { font-weight:510; }
.patient-shell--disease :deep(.consult-float),
.patient-shell--cost :deep(.consult-float),
.patient-shell--why-china :deep(.consult-float),
.patient-shell--about :deep(.consult-float),
.patient-shell--trust :deep(.consult-float),
.patient-shell--insurance :deep(.consult-float),
.patient-shell--dental :deep(.consult-float) { display: none; }
@media (min-width: 701px) {
  .patient-shell--home :deep(.consult-float) { display: none; }
}
</style>
