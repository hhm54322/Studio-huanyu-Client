<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ value: string; duration?: number }>(), {
  duration: 1300,
})

const element = ref<HTMLElement | null>(null)
const displayValue = ref(props.value)
let observer: IntersectionObserver | null = null
let animationFrame = 0

const numberPattern = /\d[\d,]*(?:\.\d+)?/g

function renderValue(progress: number) {
  if (progress >= 1) return props.value

  return props.value.replace(numberPattern, (token) => {
    const target = Number(token.split(',').join(''))
    const decimalPlaces = token.includes('.') ? token.split('.')[1]!.length : 0
    const current = target * progress
    const formatted = decimalPlaces ? current.toFixed(decimalPlaces) : Math.round(current).toString()

    if (!token.includes(',')) return formatted
    const [integer, decimal] = formatted.split('.')
    return `${Number(integer).toLocaleString('en-US')}${decimal ? `.${decimal}` : ''}`
  })
}

function animate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayValue.value = props.value
    return
  }

  const startedAt = performance.now()
  displayValue.value = renderValue(0)

  const tick = (now: number) => {
    const rawProgress = Math.min(1, (now - startedAt) / props.duration)
    const easedProgress = 1 - Math.pow(1 - rawProgress, 3)
    displayValue.value = renderValue(easedProgress)
    if (rawProgress < 1) animationFrame = window.requestAnimationFrame(tick)
  }

  animationFrame = window.requestAnimationFrame(tick)
}

onMounted(() => {
  if (!element.value || typeof IntersectionObserver === 'undefined') {
    displayValue.value = props.value
    return
  }

  observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    animate()
    observer?.disconnect()
  }, { threshold: 0.45 })

  observer.observe(element.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (animationFrame) window.cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <strong ref="element" class="count-up-number">{{ displayValue }}</strong>
</template>
