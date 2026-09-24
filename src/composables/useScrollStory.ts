import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useScrollStory(root: Ref<HTMLElement | null>, itemCount: number) {
  const activeIndex = ref(0)
  const progress = ref(0)
  let animationFrame = 0

  const update = () => {
    animationFrame = 0
    const element = root.value
    if (!element || window.matchMedia('(max-width: 899px)').matches) return

    const rect = element.getBoundingClientRect()
    const distance = Math.max(element.offsetHeight - window.innerHeight, 1)
    const nextProgress = Math.min(1, Math.max(0, -rect.top / distance))

    progress.value = nextProgress
    activeIndex.value = Math.min(itemCount - 1, Math.floor(nextProgress * itemCount))
  }

  const requestUpdate = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(update)
  }

  const goTo = (index: number) => {
    const element = root.value
    if (!element) return

    const distance = Math.max(element.offsetHeight - window.innerHeight, 1)
    const sectionTop = window.scrollY + element.getBoundingClientRect().top
    const segment = distance / itemCount
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: sectionTop + segment * (index + 0.5),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  onMounted(() => {
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    requestUpdate()
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', requestUpdate)
    window.removeEventListener('resize', requestUpdate)
    if (animationFrame) window.cancelAnimationFrame(animationFrame)
  })

  return { activeIndex, progress, goTo }
}
