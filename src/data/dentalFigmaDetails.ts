import { dentalSources, registerDentalSources, type DentalSourceFile } from './dentalFigmaSource'

// Each tab loads its exact authored viewport and, where needed, its full
// scrolling-content frame. No other doctor/clinic state is downloaded.
const sources = import.meta.glob('../../docs/figma-source/dental-revision-2026-10-28/*/source-tree-2026-10-28.json', {
  import: 'default',
}) as Record<string, () => Promise<DentalSourceFile>>
const pending = new Map<string, Promise<void>>()
const tabFolders = [['profile'], ['treatment-scroll', 'treatment'], ['cases'], ['reviews'], ['services-scroll', 'services']]
function load(folder: string): Promise<void> {
  if (dentalSources[folder]) return Promise.resolve()
  const active = pending.get(folder)
  if (active) return active
  const path = `../../docs/figma-source/dental-revision-2026-10-28/${folder}/source-tree-2026-10-28.json`
  const request = sources[path]!().then(source => { registerDentalSources({ [path]: source }) })
    .finally(() => pending.delete(folder))
  pending.set(folder, request)
  return request
}
export function loadDentalDetail(tab = 0, institution = false): Promise<unknown> {
  return Promise.all((institution ? ['institution-scroll', 'institution'] : tabFolders[tab]!).map(load))
}

export function loadDentalStep(step: 1 | 2 | 3): Promise<unknown> {
  return Promise.all((step === 2 ? ['matching', 'doctor-card'] : step === 3 ? ['upload'] : []).map(load))
}
