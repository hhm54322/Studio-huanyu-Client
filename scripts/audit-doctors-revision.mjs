// The dental gate owns the current 13-frame inventory; the homepage gate owns
// its 15 expert states. Old three-tab dental evidence cannot cover the newly
// authored treatment, services, institution and standalone-card sources.
import './audit-current-home.mjs'
import { auditDentalRevision } from './audit-dental-revision.mjs'

await auditDentalRevision()
console.log('Current doctor-detail gate passed: homepage 15 expert states; dental five tabs, full-content/scroll-viewport pairs, institution gallery and standalone card are covered. Mobile deferred by user.')
