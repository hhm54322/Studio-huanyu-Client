import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

/** Center each translated connector between the longest visible line of its
 * preceding label and the next step circle. Measurement is in viewport pixels;
 * convert to the source canvas coordinate system before setting the CSS offset.
 */
export function useDentalStepConnectors(root: Ref<HTMLElement | null | undefined>, localized: Ref<boolean>, revision: () => unknown) {
  let observer: ResizeObserver | undefined
  let frame = 0
  let active = true
  const update = () => {
    frame = 0
    const host = root.value
    const rail = host?.querySelector<HTMLElement>('[data-figma-node="4542:5677"], [data-figma-node="2294:6987"], [data-figma-node="2294:8053"]')
    if (!rail) return
    const children = [...rail.children].filter((child): child is HTMLElement => child instanceof HTMLElement && child.hasAttribute('data-figma-node'))
    if (children.length !== 5) return
    const [first, connector1, second, connector2, third] = children as [HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement]
    const connectors = [connector1, connector2]
    if (!localized.value) { connectors.forEach(line => line.style.removeProperty('--dental-line-shift')); return }
    const scale = rail.getBoundingClientRect().width / rail.offsetWidth
    if (!scale) return
    ;[[first, connector1, second], [second, connector2, third]].forEach(([previous, line, next]) => {
      const label = previous?.lastElementChild?.firstElementChild
      const circle = next?.firstElementChild
      if (!label || !line || !circle) return
      const range = document.createRange()
      range.selectNodeContents(label)
      const visibleLines = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0)
      if (!visibleLines.length) return
      const textRight = Math.max(...visibleLines.map(rect => rect.right))
      const nextLeft = circle.getBoundingClientRect().left
      const lineRect = line.getBoundingClientRect()
      const layoutLeft = lineRect.left - (Number.parseFloat(line.style.getPropertyValue('--dental-line-shift')) || 0) * scale
      const centeredLeft = (textRight + nextLeft - lineRect.width) / 2
      line.style.setProperty('--dental-line-shift', `${(centeredLeft - layoutLeft) / scale}px`)
    })
  }
  const schedule = () => { if (active && !frame) frame = requestAnimationFrame(update) }
  const bind = async () => {
    observer?.disconnect()
    await nextTick()
    const rail = root.value?.querySelector<HTMLElement>('[data-figma-node="4542:5677"], [data-figma-node="2294:6987"], [data-figma-node="2294:8053"]')
    if (!rail) return
    observer = new ResizeObserver(schedule)
    observer.observe(rail)
    rail.querySelectorAll<HTMLElement>('.home-source-node--text').forEach(element => observer?.observe(element))
    schedule()
  }
  watch([root, localized, revision], bind, { flush:'post' })
  onMounted(() => { window.addEventListener('resize', schedule); void document.fonts.ready.then(schedule); void bind() })
  onBeforeUnmount(() => { active = false; observer?.disconnect(); window.removeEventListener('resize', schedule); if (frame) cancelAnimationFrame(frame) })
}
