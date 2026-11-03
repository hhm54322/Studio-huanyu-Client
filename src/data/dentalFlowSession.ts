// Retain unfinished dental input in memory while visiting a doctor detail.
// Patient notes and uploaded files never enter localStorage.
export interface DentalFlowSession {
  step: 1 | 2 | 3
  project: string
  expanded: string[]
  filters: { city: string; title: string; experience: string; background: string; language: string; price: string }
  appliedFilters: DentalFlowSession['filters']
  sort: 'recommended' | 'experience' | 'cases' | 'rating' | 'price'
  files: File[]
  form: { notes: string; visitTime: string; budget: string }
  quoteDoctorId: number | null
  requestId: string
  submitted: boolean
}
let saved: DentalFlowSession | undefined
export const getDentalFlowSession = () => saved
export function saveDentalFlowSession(value: DentalFlowSession) { saved = value }
