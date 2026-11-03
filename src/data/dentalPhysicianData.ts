import document from './dentalPhysicians.json'
import supplements from './dentalCaseSupplements.json'

export interface DentalPhysicianCase {
  id: string
  title: string
  description?: string
  images: { src: string; alt: string; thumbnail?: string; width?: number; height?: number }[]
}
export type DentalPhysician = (typeof document.records)[number] & { caseStudies?: DentalPhysicianCase[]; sourceProfile?: boolean }
// The original Figma profile owns its full card, cases, tabs and institution.
// These fields are used only for matching/sorting and quotation attribution.
const originalPhysicians: DentalPhysician[] = [{
  id: 5, slug: 'tan-zhaolin', name: '谭兆林', title: '院长 / 主治医生',
  hospital: '博远口腔', institutionLabel: '上海牙科机构', city: '上海',
  experience: '20年经验', languages: [], background: '口腔专科', department: '口腔专科',
  specialty: '擅长保留残根残冠、各类义齿修复（活动/固定/种植）、成人隐形及儿童早期正畸，致力于最大限度守护天然牙',
  rating: '5.0', cases: '1', portrait: '/images/dental-physicians/tan-zhaolin.webp',
  tags: [], startingPrice: 1200, priceLabel: '¥1,200/颗', priceDescription: '参考价格：¥1,200/颗',
  bio: '', credentials: [], professionalFields: [], originalCredentials: [], originalSpecialty: [],
  institutionIntro: '', institutionEnvironment: '', reviews: [], sourceProfile: true,
}]
export const dentalPhysicians: DentalPhysician[] = [
  ...originalPhysicians.map(original => document.records.find(record => record.name === original.name) ?? original),
  ...document.records.filter(record => !originalPhysicians.some(original => original.name === record.name)),
].map(doctor => ({ ...doctor, cases: '3', caseStudies: [
  ...('sourceProfile' in doctor && doctor.sourceProfile ? [{ id: 'tan-original', title: '种植修复（单颗/多颗缺失的种植与上部修复）', description: '', images: [
    { src: '/images/figma/dental-revision/image-6c39aa3f0dc96d05e237ff0fb5e000bb77e1c99b.webp', alt: '原有种植修复案例图片一' },
    { src: '/images/figma/dental-revision/image-bafaa0021c58d76a43f7d2761e8c9bed0263c785.webp', alt: '原有种植修复案例图片二' },
  ] }] : []),
  ...supplements.records.filter(item => item.doctorId === doctor.id),
] }))
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
  const actual = title.replace('主治医生', '主治医师')
  // A deputy chief's title also contains 主任医师; these are separate filters.
  return normalized === '主任医师'
    ? actual.replace(/副主任医师/g, '').includes(normalized)
    : actual.includes(normalized)
}
