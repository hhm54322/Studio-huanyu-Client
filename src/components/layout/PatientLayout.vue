<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ConsultationPanel from '@/components/common/ConsultationPanel.vue'
import PatientFooter from './PatientFooter.vue'
import PatientHeader from './PatientHeader.vue'

const route = useRoute()
let observer: IntersectionObserver | null = null
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
  const viewportBottom = window.innerHeight * .96
  document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((element) => {
    const rect = element.getBoundingClientRect()
    if (rect.bottom <= 0 || rect.top >= viewportBottom) return
    element.classList.add('is-visible')
    observer?.unobserve(element)
  })
}

function attachRevealAnimations() {
  observer?.disconnect()
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
      entry.target.classList.add('is-visible')
      observer?.unobserve(entry.target)
    })
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

  revealElements.forEach((element) => observer?.observe(element))
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
  window.addEventListener('scroll', requestScrollMotion, { passive: true })
  window.addEventListener('resize', requestScrollMotion)
  scheduleRouteMotion()
})
onBeforeUnmount(() => {
  observer?.disconnect()
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
    :class="{
      'patient-shell--disease': route.path === '/diseases-technologies',
      'patient-shell--trust': route.path === '/trust',
    }"
  >
    <PatientHeader />
    <main class="flex-1"><RouterView /></main>
    <PatientFooter />
    <ConsultationPanel />
  </div>
</template>

<style scoped>
.patient-shell--disease :deep(.consult-float),
.patient-shell--trust :deep(.consult-float) { display: none; }
</style>
