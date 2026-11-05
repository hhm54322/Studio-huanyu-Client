// These pages remain in the repository for later design work. Use the same
// availability rule for routing and public links so an entrance cannot lead
// to a navigation cancelled by the router.
export const pendingPatientDesignRoutes = new Set(['/equipment', '/visa', '/professional-report'])
export function unavailablePatientHref(href?: string) {
  return Boolean(href?.startsWith('/') && pendingPatientDesignRoutes.has(href.split(/[?#]/)[0]!))
}
