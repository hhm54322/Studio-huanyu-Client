# 患者案例

- Route: `/cases`
- Figma frame: `07寰宇云医 - 患者案例`
- Node ID: `190:5300`
- Source baseline HTML: `docs/figma-source/cases/source-frame-2026-09-29.html`
- Source baseline CSS: `docs/figma-source/cases/dev-styles-2026-09-29.css`
- Source asset manifest: `docs/figma-source/cases/assets.json`
- Source extraction run: `2026-09-29`, 248 expanded Layers and selected Dev Mode reads
- Desktop frame: `1440 x 1822px`
- Mobile frame: no authored mobile frame; responsive adaptation
- Status: verified

## Source Inventory And Parameter Record

All files below are in `docs/figma-source/cases/`:

- `layers-2026-09-29.json`: every Node ID, parent and displayed sibling order; no index gaps.
- `native-inventory-2026-09-29.json`: 248 nodes, 229 rendered, 19 authored-hidden nodes; browser hierarchy cross-check has zero mismatch.
- `dev-mode-2026-09-29.json`: all 248 nodes selected in parent-first order and the visible Inspect panel copied. For the 19 hidden nodes Figma Inspect displays the visible ancestor's CSS; this is not claimed as their own CSS.
- `native-parameters-2026-09-29.json`: exact native properties for every node, including hidden nodes, image transforms and mixed text styles.
- `node-to-code-2026-09-29.json`: all 248 concrete selectors; hidden hierarchy is retained in a hidden source subtree.
- `baseline-lock-2026-09-29.json`: source artifacts locked before page Vue changes.
- `content-2026-09-29.json`: actual image paints and editable source card/metric data.
- Native source SHA256: `f46e9364d764719ef3534683e7a8ab3289f0d4dda20e10292373fcb7a18d74eb`.

## Layer Mapping

Complete mapping is in the JSON record above. Principal nodes:

| Node ID | Parent | Source layer | Vue element |
| --- | --- | --- | --- |
| `190:5303` | `190:5302` | Hero Section | `.case-hero` |
| `190:5304` | `190:5303` | Frame 74 | `.case-hero__content` |
| `190:5305` | `190:5304` | Copy Container | `.case-hero__copy` |
| `190:5320` | `190:5319` | Title Text | `h1` |
| `190:5322` | `190:5321` | Subtitle Text | `p` |
| `190:5323` | `190:5305` | Link | `.case-match-button` |
| `221:6192` | `221:6191` | Filter row | `.case-filters` |
| `190:5365` | `190:5328` | Grid | `.case-grid` |
| `190:5366` | `190:5365` | Maria card | `.case-grid>article:nth-child(1)` |
| `190:5383` | `190:5365` | James card | `.case-grid>article:nth-child(2)` |
| `190:5402` | `190:5302` | Metrics Section | `.case-summary` |
| `190:5429` | `190:5428` | Footer | `PatientFooter.vue` |
| `484:1592` | `190:5301` | Header | `PatientHeader.vue` |

## Sections

| Section | Node ID | W x H | Parameters |
| --- | --- | --- | --- |
| Hero | `190:5303` | 1440 x460 | copy x112/y129.5, 1216 x235; inner568; gap24 |
| Directory | `190:5328` | 1440 x622 | padding96/40; filter42; grid388 including top48 |
| Metrics | `190:5402` | 1440 x284 | padding96/0; content1216 x92; four286px columns, gap24 |
| Footer | `190:5429` | 1440 x456 | existing shell with per-page source icons/fonts |

## Typography

| Element | Node ID | Font | Size / line-height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title | `190:5320` | PingFang SC | 64/96 | 600 | #143162 |
| Hero subtitle | `190:5322` | PingFang SC | 20/29 | 400 | #5B606A |
| Match CTA | `190:5327` | PingFang SC | 20/30 | 600 | #FFFFFF |
| Patient names | `190:5371`, `190:5388` | SF Pro | 18/18 | native600 | #1E3A5F |
| Card titles | `190:5376`, `190:5395` | PingFang SC | 24/24 | 500 | #1E3A5F |
| Metric values | `190:5407`, `190:5412`, `190:5417`, `190:5422` | SF Pro | 56/56 | 700 | #52E8FF |

Mixed card body text: label PingFang500 #1E3A5F, value PingFang400 #4B5563, both14/22. Source letter spacing is normalized to zero under application instructions. Text fixes for `190:5397`: remove duplicate colon; restore the missing character in both occurrences of 风险.

## Components And Spacing

- Hero fill: original image, exact Dev crop `0px -78.03px / 100% 123.964% no-repeat`; no text baked into the live hero.
- CTA: 199 x62, padding16/24, gap8, radius14, source icon24, #1E3A5F, source shadow.
- Dropdowns: 220 x42, padding1/16, border1 #DBDEE6, radius10, source arrow10 x6 in20 x38.5 wrapper; placeholders match source.
- Filter/reset buttons: 104/106 x42, gap8, padding16/24, radius14.
- Grid: 1216 x388, three equal columns389.3333, gap24, top48; two authored cards.
- Cards: 389.3333 x340, padding24, gap80 between60px header and152px body; radius24, #F5F6F7.
- Avatars: 60 x60, radius16; exact source photo/crop; no border/shadow.
- Recommendation: 64 x28, top16/right15.667, padding8, radius8, #03956D; text12/12 white.
- Metric dividers: 1 x70, top11 at native x298/608/917, white10% opacity. Metrics background image opacity50% over #1E3A5F.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero photo | `190:5303` | original image paint | `public/images/figma/case-source/node-190-5303.webp` |
| Maria avatar | `190:5368` | original image/crop | `public/images/figma/case-source/node-190-5368.webp` |
| James avatar | `190:5385` | original image/crop | `public/images/figma/case-source/node-190-5385.webp` |
| Metrics photo | `190:5402` | original image50% opacity | `public/images/figma/case-source/node-190-5402.webp` |
| Match icon | `190:5324` | exact Dev SVG | `public/images/figma/case-source/node-190-5324.svg` |

All 32 SVG/photo asset rows and source IDs are in the manifest.

## Prototype And Motion

- Preserve the existing smart-matcher business entry; its independent source state is `190:5550`, tracked separately in `smart-match.md`.
- Four filters participate in apply/reset logic; empty results stay usable and do not hide later sections.
- Existing Octagos-inspired viewport reveal/card hover/count-up motion preserves source resting layout. Cards lift 6px over 350ms with cubic-bezier(.22,1,.36,1), without changing width/height; metrics count up over 1300ms with cubic ease-out. Mobile disables hover lift; reduced motion removes transforms and reduces transitions to .01ms.
- Keyboard focus trap, Escape, focus restoration and mobile scroll are required for the matcher entry.
- No hospital administration or medical-report generation behavior is modified.

## Verification

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/figma-1440.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/local-1440.png`
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/local-390.png`
- Verification run: 2026-09-29; final screenshots regenerated after the last UI edit and personally reviewed with section crops, overlay and diff.
- Source QA: `source-map-results.json`, 248 concrete selectors, 75 exact text-style checks, 17 geometry checks within .05px; authored-hidden nodes remain hidden.
- State QA: `state-results.json`, 1440/1024/768/390px; four filters, reset, incompatible-filter empty state, required first matching group, independent answer groups, matching result, close button, backdrop, Escape, forward/backward focus trap, opener restoration, body scroll restoration, card hover and reduced motion. Zero runtime errors, broken images or horizontal overflow.
- Static comparison: Figma and desktop are both 1440 x1822; four sections match source coordinates/heights exactly. Changed-pixel ratio is 0.0162866661 with threshold .15 and anti-alias exclusion. This is a pixel-diff metric, not a percentage claim of design completeness. Residual differences are text rasterization/zero tracking and the documented typo corrections.
- Matcher comparison: independent frame `190:5550`; 5 internal geometry groups and all resting title/question/badge/helper/option/CTA typography checked; foreground changed-pixel ratio 0.0140041801. Its authored background belongs to the trust page; the live dialog correctly remains over cases. See `smart-match.md` for permanent evidence.
- Source audit: `node scripts/audit-cases-source.mjs` passes and is now part of `audit:figma`; screenshot freshness is checked against the last shared/page UI modification.
- Compilation: `pnpm exec vue-tsc -b` and `pnpm exec vite build` pass. `git diff --check` passes.
- Completion gate: source inventory, exact Dev Mode mapping, current-page desktop/mobile state QA, screenshot comparison, type checking and production build pass. Other page specifications are audited independently and do not change this page's evidence.
- Remaining differences: none
