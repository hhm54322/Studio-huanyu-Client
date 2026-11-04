// Both the build-time splitter and runtime loader use this route inventory.
// Keep all optional dialogs/details reachable from a page in that page's pack.
export const patientCopyViews: Record<string, string> = {
  home: 'HomeView', 'why-china': 'WhyChinaView', trust: 'TrustView',
  insurance: 'InsuranceView', hospitals: 'HospitalView', doctors: 'PhysicianView',
  report: 'ReportView', cases: 'CaseView', dental: 'DentalView',
  'dental-doctor': 'DentalDoctorView', 'diseases-technologies': 'DiseaseTechnologyView',
  steps: 'StepView', toolkit: 'ToolkitDetailView', about: 'AboutView',
}

export function patientCopyScope(path: string): string {
  path = path.replace(/\/$/, '') || '/'
  if (path === '/') return 'home'
  if (path.startsWith('/dental/doctors/')) return 'dental-doctor'
  if (path === '/steps/toolkit-detail') return 'toolkit'
  if (path === '/cost' || path === '/cost-generated') return 'why-china'
  const scope = path.slice(1)
  return Object.prototype.hasOwnProperty.call(patientCopyViews, scope) ? scope : 'common'
}
