import document from './dentalPhysicians.json'

export interface DentalPhysicianCase {
  id: string
  title: string
  images: { src: string; alt: string }[]
}
export type DentalPhysician = (typeof document.records)[number] & { caseStudies?: DentalPhysicianCase[] }
export const dentalPhysicians: DentalPhysician[] = document.records
export const dentalPhysicianById = (id: number) => dentalPhysicians.find(doctor => doctor.id === id)
export const dentalPhysicianTreatment = document.treatment
export const dentalPhysicianServices = document.services

/** Both the detail tab and matching card consume actual cases, never a legacy count or Figma sample. */
export function dentalPhysicianCases(doctor: DentalPhysician) {
  return (doctor.caseStudies ?? []).filter(item => item.title.trim() && item.images.some(image => image.src.trim()))
}

export function dentalPhysicianTitleMatches(title: string, filter: string) {
  if (!filter) return true
  const normalized = filter.replace('主治医生', '主治医师')
  // A deputy chief's title also contains 主任医师; these are separate filters.
  return normalized === '主任医师'
    ? title.replace(/副主任医师/g, '').includes(normalized)
    : title.includes(normalized)
}
