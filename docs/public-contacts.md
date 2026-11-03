# Public patient contacts — 2026-11-03

- Scope: user-authorized public contact copy and link override across patient pages. No layout redesign or report-generation change.
- Company email: `gh20260826@qq.com`, native `mailto:` link (opens the configured email application; does not send automatically).
- WhatsApp: `https://api.whatsapp.com/message/Y42GUI2UUXBVB1?autoload=1&app_absent=0`, opens a new tab with `noopener noreferrer`; both footer and desktop fixed CTA use the same configuration.
- Facebook: user confirmed pending; the supplied email is not used as a Facebook destination.
- Configuration: `src/data/publicContacts.ts`. Optional release override accepts HTTPS official phone/message links; invalid overrides retain the confirmed account.
- Immutable Figma source JSON/CSS/assets remain unchanged. `HomeSourceNode` replaces only the exact old public email text; clinical/user content is unaffected.

## Source connection and scope

- Mandatory `scripts/figma-connect.mjs` succeeded in current-session IAB browser `6`, tab `4`, session `01a0bebd-b6f9-7fd3-bf5a-b79501589b80`, at `2026-11-03T06:43:41.248Z`; Design/Layers/Properties readable. Source tab remains marked for handoff.
- Before implementation: official export `/Users/hhm/Downloads/寰宇云医 (36).fig`, exported `2026-11-03T06:47:56.587Z`, SHA256 `edd6228d9e5071ad87b9bd965bb113b4232612ecb198f5fa845bd7db8f540d64`, comparison against each actual implementation export in `artifacts/contact-update-20261103/source/before-*.json`.
- Before delivery: official export `/Users/hhm/Downloads/寰宇云医 (37).fig`, exported `2026-11-03T07:03:35.872Z`, SHA256 `7f8d84ae8ee641aa362682d7b8af265e8e891b1e97a4c27ab797d4707b97c20e`. Reports `source/final-*.json` and `final-summary.json`.
- Main home, hero, hospital, physician, trust, toolkit and dental contact/footer scopes unchanged. Dental profile `2294:7751` retains the previously documented name-only change. Original full dental page `231:88` contains previously documented changes; contact subtree `231:276` is independently unchanged. Full-file added/removed/same-name source lists retained; not automatically accepted.
- Live Dev Mode selected email text `1412:6720`: `175 × 20`, SF Pro 14px / 20px, weight 400, color `#9CA3AF`, letter spacing `-0.15px`. Existing source geometry/style retained for the shorter replacement email.

## Node mapping

| Source | Email link / text | WhatsApp link | Implementation |
| --- | --- | --- | --- |
| Home desktop | `1412:6715` / `1412:6720` | `1412:6726` | `homeFigmaActions.ts`, `HomeSourceNode.vue` |
| Home mobile | `1528:835` / `1528:840` | `1528:846` | Same action map; existing mobile layout preserved |
| Dental shared footer | `231:324` | source text `WhatsApp` | `dentalFigmaSource.ts`, `HomeSourceNode.vue` |
| Hospital desktop/mobile | `144:5202`, `1620:1110` | `144:5212`, `1620:1120` | `hospitalFigmaSource.ts` |
| Physicians | `1689:5363` | `1689:5373` | `physicianFigmaSource.ts` |
| Trust | `143:2980` | `143:2991` | `trustFigmaSource.ts` |
| Toolkit / trust articles | Original exact contact text inside `Link` / `List Item` | `WhatsApp` | `contentFigmaSource.ts` |
| Shared patient / report footer | Existing DOM contact entries | Existing footer entry and fixed CTA | `PatientFooter.vue`, `ReportView.vue`, `WhatsAppContact.vue` |

Home email now binds the entire source list item instead of only its 16px icon. The source parent, children, typography, spacing and icons are retained.

## Verification

- Development and actual production preview: all 13 patient routes, correct email and WhatsApp destinations, no obsolete mail/WhatsApp hrefs, no page errors or horizontal overflow; one desktop fixed entry; 12px gap above homepage assistant; modal top layer blocks the background CTA. Evidence `artifacts/contact-update-20261103/qa/qa.json` and screenshots.
- Click verification: mail click target correct; WhatsApp opens exact new-tab URL. External destination intercepted for QA, no email or chat message sent. `click-qa.json`.
- Mobile/tablet smoke: 320/390/430/768px, home/dental/report, zero horizontal overflow and correct footer email; existing mobile frozen layout retained. `mobile-qa.json`.
- Compared before/after footer screenshots personally: `footer-comparison.jpg`. Only authorized contact copy/link differences; no layout drift observed.
- `vue-tsc -b`, direct Vite production build (`20261103220000`) and `git diff --check` passed. Full `pnpm run build` was executed and remains failed due to pre-existing/stale full-page evidence and changed shared-code hashes in the repository's Figma gate; no audit or historical source lock was weakened. This contact regression is not a claim of renewed whole-site Figma acceptance.
- WhatsApp URL format is official. Direct external account-page verification timed out on current network; account availability cannot be inferred from local href/click tests. Mailbox ownership/deliverability not tested.

## Published result

- Live release `20261103220000`: `https://www.huanyumedical.com/`, published `2026-11-03T07:16:15.555568+00:00`.
- Public 13-route contact regression passed on complete recheck. Initial homepage connection failure is retained separately; evidence `artifacts/deployment/20261103220000/online-recheck/qa.json`.
- Both domains' 32 entry refreshes and 37 new asset/shell prewarms completed 100%, checked individually against the submitted URL lists: `cdn-summary.json` (69/69, zero missing).
- Release checksum, backup and verification details: `docs/deployment.md`.
