# Public patient contacts — 2026-11-03

- Scope: user-authorized public contact copy and link override across patient pages. No layout redesign or report-generation change.
- Company email: `gh20260826@qq.com`, native `mailto:` link (opens the configured email application; does not send automatically).
- WhatsApp: `+86 158 5515 9472`, linked as `https://wa.me/8615855159472`, opens a new tab with `noopener noreferrer`; both footer and desktop fixed CTA use the same account.
- Facebook: `https://www.facebook.com/share/19QEe4vFdQ/?mibextid=wwXIfr`, opens a new tab with `noopener noreferrer`. The user confirmed that the share link's destination is intentional.
- Configuration: `src/data/publicContacts.ts`. Optional release override accepts HTTPS official phone/message links; invalid overrides retain the confirmed account.
- Immutable Figma source JSON/CSS/assets remain unchanged. `HomeSourceNode` replaces only the exact old public email text and appends the user-authorized Facebook contact beside the existing WhatsApp row; clinical/user content is unaffected.

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
- WhatsApp URL format is official. The account page was verified in the current-session browser as `huanyu china medical tourism`; no message was sent. The Facebook share link was opened and verified as `Sarah Desi Littman | York NY`, matching the user-confirmed destination. Mailbox ownership/deliverability and native-app receipt were not tested.

## Published result

- Live release `20261103220000`: `https://www.huanyumedical.com/`, published `2026-11-03T07:16:15.555568+00:00`.
- Public 13-route contact regression passed on complete recheck. Initial homepage connection failure is retained separately; evidence `artifacts/deployment/20261103220000/online-recheck/qa.json`.
- Both domains' 32 entry refreshes and 37 new asset/shell prewarms completed 100%, checked individually against the submitted URL lists: `cdn-summary.json` (69/69, zero missing).
- Release checksum, backup and verification details: `docs/deployment.md`.

## Follow-up contact update — 20261103230000

- User confirmed the phone-based WhatsApp account and Facebook share destination. The preceding release used the old WhatsApp message-code URL and had no Facebook entry; those historical release notes above describe that release only.
- Current-session connection reverified at `2026-11-03T09:03:34.179Z`, IAB `6`, source tab `4`, session `01a0bebd-b6f9-7fd3-bf5a-b79501589b80`. Selected WhatsApp text `1412:6730`; Design, Layers and Properties readable. Before-change connection was verified at `2026-11-03T08:24:38.948Z`.
- Before-change official export: `/Users/hhm/Downloads/寰宇云医 (38).fig`, exported `2026-11-03T08:30:00.850Z`, SHA256 `3b88c9bc2b7800e916b02be1bcac6493f3293e38d04643ef1285d9bde77d09e2`. Before-delivery export: `/Users/hhm/Downloads/寰宇云医 (39).fig`, exported `2026-11-03T09:05:26.987Z`, SHA256 `aa6a67423deb9ce4ab98e157efa8a264ebecae6410b3069d744f7e130d3ef5db`.
- Compared all nodes, same-name source candidates, dependencies and image/blob bytes against five actual implementation exports. Reports: `artifacts/contact-social-update-20261103/source/{before,final}-*.json` and summary files. Home/footer, hero, hospital, physician directory, trust, toolkit and dental footer `231:276` contact scopes are unchanged. Existing unrelated dental detail replacements/alternatives remain unresolved. The final export also adds same-name homepage expert-detail candidate `3424:6069` alongside `1432:7917` (徐宇-01专业擅长); recorded for the subsequent design task, not silently adopted or reported as unchanged.
- Live source WhatsApp row `1412:6726`: `268 × 32`, top padding `12`, gap `8`, icon `16 × 16`; text `1412:6730`: `68 × 20`, SF Pro `14 / 20`, weight `400`, `#9CA3AF`, letter spacing `-0.15px`. Facebook uses the source text style beside the WhatsApp label; original source hierarchy and geometry remain unchanged.
- Final production preview and development checks passed on 13 patient routes. Personally inspected final home, dental, hospital and toolkit footer screenshots; both social labels align with no overlap. Actual fixed/footer WhatsApp and Facebook clicks opened the expected new-tab URLs (destination intercepted, no messages sent). 12 narrow-screen smoke checks at `320/390/430/768px` passed for home, dental and report; contact labels remain within the viewport. Existing mobile layout remains frozen, including its pre-existing narrow home-footer clipping outside the added contacts.
- Evidence: `artifacts/contact-social-update-20261103/{qa/qa.json,contact-smoke.json}` and screenshots. `vue-tsc -b`, Vite production build and `git diff --check` passed. Full-site Figma compliance build remains failed on historical/stale page evidence and shared-code hashes; logs retained in `build.log`, no gate or baseline weakened. This update verifies public contacts only, not renewed whole-site design acceptance.
- Published at `2026-11-03T09:22:16.490205+00:00`; public version `20261103230000`. All 13 public routes passed contact regression with zero script errors. Both domains' 32 entry refreshes and 37 asset/shell prewarms individually completed (69/69). Evidence: `artifacts/deployment/20261103230000/{online/qa.json,cdn-summary.json,published.json}`. Backup and checksums in `docs/deployment.md`.

## M02 localized prefill — local verification

- Patient contact entries now generate Chinese, English, Indonesian, Malay or Portuguese prefilled messages, carrying the public topic, locale, route, entry and campaign labels. Clinical notes, names, phone numbers and unfiltered URL data are excluded.
- Language selectors use the same five-locale configuration. Longer labels use available width, bounded dropdowns and wrapping; the floating CTA can grow vertically. All five locales passed the desktop length/overflow checks.
- This M02 implementation is locally verified and has not been published by this task. The public release above remains the last verified deployment. Implementation, source verification and test evidence: `docs/implementation/m02-contact-localization.md`.
