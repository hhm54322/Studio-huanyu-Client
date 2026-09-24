# 患者案例

- Route: `/cases`
- Figma frame: `07寰宇云医 - 患者案例`
- Node ID: `190:5300`
- Source baseline HTML: `docs/figma-source/cases/frame.html`
- Source baseline CSS: `docs/figma-source/cases/styles.txt`
- Source asset manifest: `docs/figma-source/cases/assets.json`
- Desktop frame: `1440 x 1822px` (`2x` export: `2880 x 3644px`)
- Mobile frame: no dedicated frame found; responsive adaptation required
- Status: verified (desktop frame; responsive mobile adaptation)

## Sections

| Order | Section | Node / Layer | Width | Height | Container / Geometry | Background / Notes |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | Hero | `190:5303` (`Section` under `Main Content`) | 1440 | 460 | 64px overlaid header; image stage `1440 x 396px`; Figma padding `180px 112px 146px` and 44px gap | Figma hero bitmap with authored copy and CTA |
| 2 | Case directory | `190:5328` (`Container` under `Main Content`) | 1440 | 622 | 96px top/bottom, 40px left/right; content width `1216px`; filter row `221:6191`; filter gap `16px`; two authored cards | White; card fill `#F5F6F7`, 24px radius |
| 3 | Service metrics | `190:5402` (`Section` under `Main Content`) | 1440 | 284 | 96px top/bottom; four metrics in one row | `#1E3A5F`, 50% Figma image layer opacity |
| 4 | Shared footer | `190:5428` (`Frame 657`) | 1440 | 456 | `1216px` content; 10px authored child gap | Dark navy footer |

The four sections total exactly `1822px`. The shared header is overlaid on the hero and does not add to the body height.

## Verified Figma Parameters

- Hero section: vertical flow, fixed `460px`, padding `180px 112px 146px`, gap `44px`; image stage starts below the 64px header.
- Directory section: vertical flow, hug `622px`, padding `96px 40px`; filter row height `42px` and `16px` gap.
- Case cards: `190:5383` and `190:5366`, each `389px` wide and `332px` high, `#F5F6F7` fill and `24px` radius; card gap `24px`.
- First card header: `190:5384` (`Frame 650`); recommendation badge: `190:5391` (`Text`, `64 x 28px`, `#03956D`, 8px radius, 8px padding).
- First card body: `190:5393`; title `190:5394` (`Heading 3`, fill width `341.33px`, hug height `40px`, bottom padding `16px`); detail rows `190:5396`, `190:5398`, `190:5400`.
- Metrics section: vertical flow, hug `284px`, padding `96px`; fill `#1E3A5F`; authored image layer opacity `50%`.
- Footer: fixed `456px` height.

## Assets

| Asset | Source | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Patient stories hero | Figma image layer `190:5303` / image asset `77d979736f1beeba01ee6bdf548d731cd0e060c1`; cropped from the 2x frame export below the overlaid header | `1440 x 396px` | `/public/images/figma/case-hero-background.png` |
| Service metrics band | Figma section `190:5402` / image asset `ec92f8934d2f92f09b9281def35cff5f4ff3cc35`; cropped from the 2x frame export | `1440 x 284px` | `/public/images/figma/case-summary-background.png` |
| Maria S. avatar | Authored card node `190:5384`, crop from the Figma frame export | `58 x 58px` | `/public/images/figma/case-avatar-maria.png` |
| James T. avatar | Authored card node `190:5366`, crop from the Figma frame export | `58 x 58px` | `/public/images/figma/case-avatar-james.png` |

## Behavior

- Four editable filters update the case cards without changing the authored copy or layout.
- `开始智能匹配` opens the existing accessible modal, locks body scroll, and applies the selected specialty to the case list.
- Smart matcher has its own authored Figma state: `智能匹配`, `1440 x 834px`; the state parameters and verification path are recorded in [smart-match.md](smart-match.md).
- Cards use restrained lift feedback and reveal timing inspired by Octagos; resting geometry remains unchanged.
- Mobile uses a responsive single-column flow, keeps filter controls usable, and removes page-level horizontal overflow.
- `prefers-reduced-motion` disables case, matcher and action transitions.

## Verification

- Figma reference screenshot: `/Users/hhm/Downloads/07寰宇云医 - 患者案例 (1).png`
- Local desktop screenshot: `/tmp/huanyu-cases-desktop-verified.png`
- Local directory screenshot: `/tmp/huanyu-cases-directory-verified.png`
- Local metrics/footer screenshot: `/tmp/huanyu-cases-bottom-verified.png`
- Local mobile screenshot: `/tmp/huanyu-cases-mobile-verified.png`
- Desktop geometry: `460 / 622 / 284 / 456px`; exact total height `1822px`
- Desktop and mobile: no horizontal overflow, broken images, or unrevealed content
- Interaction checks: filter apply/reset, smart matcher open/submit, body scroll lock, and result status
- Remaining differences: none
- Verification run: 2026-09-24. Re-read Dev Mode source frame `190:5300` and the authored smart-match state `190:5550`; verified hero/directory/metrics/footer geometry `460 / 622 / 284 / 456px`, corrected the matcher third-step number to `3`, checked filter/reset, modal validation, submit/result state, Escape close, reduced motion, image loading, and desktop/mobile overflow. Mobile remains the approved responsive interpretation because no dedicated Figma mobile frame is present.

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title | authored in image layer `77d979736f1beeba01ee6bdf548d731cd0e060c1` | Figma bitmap copy | 64px / 1.13 | 760 | `#143162` |
| Case card title | `190:5394` | Heading 3 | 24px / 40px frame | 700 | `#173565` |
| Recommendation badge | `190:5391` | Text | 13px / 28px frame | 400 | `#03956D` |
| Case card copy | `190:5396`, `190:5398`, `190:5400` | Patient shell body | 14px / 1.55 | 400-700 | `#173565` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Case card | `190:5383`, `190:5366` | 389 x 332px | 24px, 24px grid gap | 24px, `#F5F6F7` fill |
| Matcher modal | `190:5550` authored state | 898 x 754px at 1440 x 834 viewport | 34px horizontal content inset; 40px viewport inset | 24px radius, deep shadow |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Smart matcher | Figma prototype | CTA click | Backdrop fade, short lift | Full-width modal |
| Card reveal | Octagos section reveal | Viewport entry | Opacity/translate ease-out | Natural card flow |
