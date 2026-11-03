type Alignment = {
  element: HTMLElement
  baselines: (number | undefined)[]
  scale?: number
  current: () => boolean
  apply: (offsets: number[]) => void
}
const pending = new Map<HTMLElement, Alignment>()
let frame = 0

/** Preserve the exact native-baseline formula while doing all DOM writes,
 * geometry reads and marker removals in separate batches. */
export function alignSourceText(request: Alignment) {
  pending.set(request.element, request)
  if (!frame) frame = requestAnimationFrame(flush)
}
export function cancelSourceText(element: HTMLElement | null) {
  if (element) pending.delete(element)
  if (!pending.size && frame) { cancelAnimationFrame(frame); frame = 0 }
}
function flush() {
  frame = 0
  const requests = [...pending.values()].filter(item => item.current() && item.element.isConnected)
  pending.clear()
  const batches = requests.map(request => ({ request, lines: Array.from(request.element.children).map((element, index) => {
    const expected = request.baselines[index]
    if (expected === undefined) return { element, expected }
    const marker = document.createElement('span')
    marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;'
    element.append(marker)
    return { element, expected, marker }
  }) }))
  const results = batches.map(({ request, lines }) => lines.map(({ element, expected, marker }) => {
    if (expected === undefined || !marker) return 0
    const rect = element.getBoundingClientRect()
    const actual = marker.getBoundingClientRect().top - rect.top
    const height = (element as HTMLElement).offsetHeight
    const scale = request.scale ?? (height ? rect.height / height : 1)
    return expected - actual / (scale || 1)
  }))
  batches.forEach(({ lines }) => lines.forEach(line => line.marker?.remove()))
  requests.forEach((request, index) => { if (request.current() && request.element.isConnected) request.apply(results[index]!) })
}
