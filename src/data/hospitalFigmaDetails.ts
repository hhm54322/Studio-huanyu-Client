import { hospitalSources, registerHospitalSources, type HospitalSourceFile } from './hospitalFigmaSource'

// The source sets have disjoint node IDs. Register only the selected state,
// together with its phone counterpart so resizing an open dialog is immediate.
const files = import.meta.glob('../../docs/figma-source/hospitals/*/source-tree-2026-10-20.json', {
  import: 'default',
}) as Record<string, () => Promise<HospitalSourceFile>>
const pending = new Map<string, Promise<void>>()
function load(folder: string): Promise<void> {
  if (hospitalSources[folder]) return Promise.resolve()
  const active = pending.get(folder)
  if (active) return active
  const path = `../../docs/figma-source/hospitals/${folder}/source-tree-2026-10-20.json`
  const request = files[path]!().then(source => { registerHospitalSources({ [path]: source }) })
    .finally(() => pending.delete(folder))
  pending.set(folder, request)
  return request
}
export function loadHospitalTab(index: number): Promise<unknown> {
  return Promise.all([load(`section-desktop-${index + 1}`), load(`section-mobile-${index + 1}`)])
}
export function loadHospitalDetail(name: string): Promise<unknown> {
  return Promise.all([
    load('menu-desktop'), load('menu-mobile'),
    ...(name === '上海曜影医院' ? [load('detail-desktop'), loadHospitalTab(0)] : [load('detail-mobile-all')]),
  ])
}
