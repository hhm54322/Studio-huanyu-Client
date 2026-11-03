import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'

/** Register motion once per element, including content added by lazy routes. */
export function usePatientMotion(shell: Ref<HTMLElement | null>) {
  const route = useRoute()
  const buttonSelector = '.hy-button-primary, .hy-button-secondary, .hy-button-light'
  const motionSelector = `[data-reveal], .hy-page-hero, ${buttonSelector}`
  const pending = new Set<HTMLElement>(), heroes = new Set<HTMLElement>(), buttons = new Set<HTMLElement>()
  const buttonCleanups = new Map<HTMLElement, () => void>()
  const heroProgress = new WeakMap<HTMLElement, number>()
  let revealObserver: IntersectionObserver | undefined
  let contentObserver: MutationObserver | undefined
  let reduced: MediaQueryList, pointer: MediaQueryList
  let frame = 0, disposed = false

  function reveal(element: HTMLElement) {
    pending.delete(element)
    element.setAttribute('data-reveal-visible', 'true')
    element.classList.add('is-visible')
    revealObserver?.unobserve(element)
  }
  function attachButton(button: HTMLElement) {
    if (pointer.matches || buttonCleanups.has(button)) return
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
    buttonCleanups.set(button, () => {
      button.removeEventListener('pointermove', move)
      button.removeEventListener('pointerleave', reset)
    })
  }
  function register(element: HTMLElement) {
    if (revealObserver && element.hasAttribute('data-reveal') && element.dataset.revealVisible !== 'true' && !pending.has(element)) {
      pending.add(element); revealObserver.observe(element)
    }
    if (element.classList.contains('hy-page-hero')) heroes.add(element)
    if (element.matches(buttonSelector)) { buttons.add(element); attachButton(element) }
  }
  function scan(root: HTMLElement) {
    if (root.matches(motionSelector)) register(root)
    if (root.childElementCount) root.querySelectorAll<HTMLElement>(motionSelector).forEach(register)
  }
  function prune() {
    for (const element of pending) if (!element.isConnected) { pending.delete(element); revealObserver?.unobserve(element) }
    for (const hero of heroes) if (!hero.isConnected) { heroes.delete(hero); heroProgress.delete(hero) }
    for (const button of buttons) if (!button.isConnected) {
      buttons.delete(button); buttonCleanups.get(button)?.(); buttonCleanups.delete(button)
    }
  }
  function update() {
    frame = 0
    if (disposed) return
    // Batch geometry reads before reveal writes. Scrolling never queries the
    // whole DOM, and already revealed elements leave the pending collection.
    const visible: HTMLElement[] = []
    for (const element of pending) {
      const rect = element.getBoundingClientRect()
      if (rect.bottom > 0 && rect.top < innerHeight) visible.push(element)
    }
    const values = [...heroes].map(hero => {
      if (reduced.matches) return { hero, progress: -1 }
      const rect = hero.getBoundingClientRect()
      return { hero, progress: Math.min(1, Math.max(0, -rect.top - 70) / Math.max(rect.height * .72, 1)) }
    })
    visible.forEach(reveal)
    for (const { hero, progress } of values) {
      if (heroProgress.get(hero) === progress) continue
      heroProgress.set(hero, progress)
      if (progress < 0) {
        for (const property of ['--hy-hero-media-y','--hy-hero-content-y','--hy-hero-content-opacity']) hero.style.removeProperty(property)
      } else {
        hero.style.setProperty('--hy-hero-media-y', `${Math.round(progress * 58)}px`)
        hero.style.setProperty('--hy-hero-content-y', `${Math.round(progress * -28)}px`)
        hero.style.setProperty('--hy-hero-content-opacity', `${1 - progress * .42}`)
      }
    }
  }
  function schedule() {
    if (!disposed && !frame && (pending.size || heroes.size)) frame = requestAnimationFrame(update)
  }
  function pointerChanged() {
    buttonCleanups.forEach(cleanup => cleanup()); buttonCleanups.clear()
    buttons.forEach(attachButton)
  }
  watch(() => route.fullPath, async () => {
    await nextTick()
    if (disposed) return
    prune()
    if (!contentObserver && shell.value) scan(shell.value)
    schedule()
  })
  onMounted(() => {
    reduced = matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)')
    pointer = matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)')
    if (typeof IntersectionObserver !== 'undefined') {
      document.documentElement.classList.add('hy-reveal-ready')
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target as HTMLElement) })
      }, { rootMargin: '0px', threshold: 0 })
    }
    if (shell.value) {
      scan(shell.value)
      if (typeof MutationObserver !== 'undefined') {
        contentObserver = new MutationObserver(mutations => {
          prune()
          for (const mutation of mutations) for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement && node.isConnected) scan(node)
          }
          schedule()
        })
        contentObserver.observe(shell.value, { childList: true, subtree: true })
      }
    }
    update()
    reduced.addEventListener('change', schedule)
    pointer.addEventListener('change', pointerChanged)
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule, { passive: true })
  })
  onBeforeUnmount(() => {
    disposed = true
    if (frame) cancelAnimationFrame(frame)
    revealObserver?.disconnect(); contentObserver?.disconnect()
    buttonCleanups.forEach(cleanup => cleanup()); buttonCleanups.clear()
    pending.clear(); heroes.clear(); buttons.clear()
    reduced?.removeEventListener('change', schedule)
    pointer?.removeEventListener('change', pointerChanged)
    removeEventListener('scroll', schedule); removeEventListener('resize', schedule)
    document.documentElement.classList.remove('hy-reveal-ready')
  })
}
