const pending = new Map<symbol, () => void>()
let frame = 0

function flush() {
  frame = 0
  const next = pending.entries().next().value
  if (!next) return
  pending.delete(next[0])
  next[1]()
  // Yield between authored sections, including on slower desktop CPUs.
  if (pending.size) frame = requestAnimationFrame(flush)
}

/** Mount all content after the first paint; never permanently virtualize it. */
export function scheduleHomeSourceMount(mount: () => void) {
  const key = Symbol()
  pending.set(key, mount)
  if (!frame) frame = requestAnimationFrame(() => { frame = requestAnimationFrame(flush) })
  return () => {
    pending.delete(key)
    if (!pending.size) { cancelAnimationFrame(frame); frame = 0 }
  }
}
