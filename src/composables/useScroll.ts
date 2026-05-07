import { ref, onMounted, onUnmounted } from 'vue'

export function useScroll(threshold = 40) {
  const scrolled = ref(false)
  const scrollY = ref(0)

  function onScroll() {
    scrollY.value = window.scrollY
    scrolled.value = window.scrollY > threshold
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { scrolled, scrollY }
}
