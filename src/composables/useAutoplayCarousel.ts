import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/** Autoplay only while readable; touch swipes leave vertical page scrolling alone. */
export function useAutoplayCarousel(root: Ref<HTMLElement | null>, count: number, options: { initialIndex?: number; media?: string; hoverTarget?: Ref<HTMLElement | null>; intervalMs?: number } = {}) {
  const activeIndex = ref(options.initialIndex ?? 0)
  const paused = ref(false)
  const enabled = ref(!options.media)
  let timer: number | undefined
  let observer: IntersectionObserver | undefined
  let motion: MediaQueryList
  let viewport: MediaQueryList | undefined
  let visible = false
  let hovering = false
  let touching = false
  let startX = 0
  let startY = 0
  const cleanups: (() => void)[] = []

  function stop() { window.clearTimeout(timer); timer = undefined }
  function reducedMotionActive() {
    // Some browser automation environments update matchMedia().matches
    // without dispatching the MediaQueryList change event. Read the current
    // media state at scheduling and callback time so a timer can never advance
    // a carousel after the user has requested reduced motion.
    return motion?.matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  function schedule() {
    if (!visible || hovering || touching || paused.value || document.hidden || reducedMotionActive() || viewport?.matches === false || count < 2) { stop(); return }
    // A repeated observer or resize callback must not postpone a running
    // countdown. Only a real pause or manual selection starts a new interval.
    if (timer !== undefined) return
    timer = window.setTimeout(() => {
      timer = undefined
      if (reducedMotionActive()) return
      activeIndex.value = (activeIndex.value + 1) % count
      schedule()
    }, options.intervalMs ?? 5000)
  }
  function select(index: number) { if (count < 1) return; activeIndex.value = ((index % count) + count) % count; stop(); schedule() }
  function togglePause() { paused.value = !paused.value; schedule() }

  onMounted(() => {
    motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    viewport = options.media ? window.matchMedia(options.media) : undefined
    enabled.value = viewport?.matches ?? true
    const element = root.value
    if (!element) return
    observer = new IntersectionObserver(entries => { visible = Boolean(entries[0]?.isIntersecting && entries[0].intersectionRatio >= .2); schedule() }, { threshold: .2 })
    observer.observe(element)
    function listen(target: EventTarget, type: string, handler: EventListener) {
      target.addEventListener(type, handler, { passive: true })
      cleanups.push(() => target.removeEventListener(type, handler))
    }
    // Pause only while the pointer is over the authored image viewport. The
    // image wrapper uses pointer-events:none so this is delegated from the
    // carousel root to the active image itself; copy, whitespace and dots do
    // not affect the countdown. The ref is read at event time because a slot
    // can mount after this composable's onMounted hook.
    const isImageTarget = (target: EventTarget | null) => {
      const hoverElement = options.hoverTarget ? options.hoverTarget.value : element
      return Boolean(hoverElement && target instanceof Node && hoverElement.contains(target))
    }
    listen(element, 'pointerover', event => {
      const pointer = event as PointerEvent
      if (pointer.pointerType !== 'mouse' || !isImageTarget(pointer.target)) return
      if (!isImageTarget(pointer.relatedTarget)) { hovering = true; schedule() }
    })
    listen(element, 'pointerout', event => {
      const pointer = event as PointerEvent
      if (pointer.pointerType !== 'mouse' || !isImageTarget(pointer.target)) return
      if (!isImageTarget(pointer.relatedTarget)) { hovering = false; schedule() }
    })
    listen(element, 'touchstart', event => {
      const touch = (event as TouchEvent).touches[0]
      if (!touch) return
      startX = touch.clientX; startY = touch.clientY; touching = true; schedule()
    })
    listen(element, 'touchend', event => {
      const touch = (event as TouchEvent).changedTouches[0]
      touching = false
      if (touch && (!viewport || viewport.matches)) {
        const dx = touch.clientX - startX, dy = touch.clientY - startY
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) select(activeIndex.value + (dx < 0 ? 1 : -1))
      }
      schedule()
    })
    listen(element, 'touchcancel', () => { touching = false; schedule() })
    listen(document, 'visibilitychange', schedule)
    listen(motion, 'change', schedule)
    if (viewport) listen(viewport, 'change', () => { enabled.value = viewport!.matches; schedule() })
  })
  onBeforeUnmount(() => { stop(); observer?.disconnect(); cleanups.forEach(cleanup => cleanup()) })
  return { activeIndex, select, paused, togglePause, enabled }
}
