# 疾病中心

- Route: `/diseases-technologies`
- Figma frame: `05寰宇云医 - 疾病中心`
- Node ID: `144:4380`
- Source baseline HTML: `docs/figma-source/diseases/source-frame-2026-09-29.html`
- Source baseline CSS: `docs/figma-source/diseases/dev-styles-2026-09-29.css`
- Source asset manifest: `docs/figma-source/diseases/assets.json`
- Source extraction run: `2026-09-29`; 325 expanded Layers and selected Dev Mode reads
- Desktop frame: `1440 x 3144px`
- Mobile frame: no authored mobile frame; responsive adaptation
- Status: verified

## Source Inventory And Parameter Record

All source records are in `docs/figma-source/diseases/`:

- `layers-2026-09-29.json`: all 325 IDs, exact parent hierarchy and displayed sibling order. Figma's aria-posinset is retained separately because reversed Vector entries do not represent displayed order.
- `native-inventory-2026-09-29.json`: 325 nodes, 309 rendered, 16 hidden descendants; real browser/native cross-check enabled, zero hierarchy/order/name mismatches.
- `dev-mode-2026-09-29.json`: every node selected in parent-first order; CSS and displayed property labels read from Inspect. Hidden descendants can display ancestor Inspect CSS; their own properties are retained in the native supplement, not claimed as independently displayed CSS.
- `native-parameters-2026-09-29.json`: exact transforms, dimensions, image paints, text runs, hidden properties and constraints.
- `node-to-code-2026-09-29.json`: all 325 concrete selectors. SVG descendants map to their exact exported owner asset; hidden hierarchy remains in the hidden source subtree.
- `content-2026-09-29.json`: editable frontend card constants read from the source; only dental has an implemented detail destination.
- `baseline-lock-2026-09-29.json`: locked source files; generated before initial Vue replacement, then regenerated for parameter-preserving code-generation corrections.
- Native source SHA256: `f46e9364d764719ef3534683e7a8ab3289f0d4dda20e10292373fcb7a18d74eb`.

The old representative-node pilot and missing temporary screenshots are no longer used as current verification evidence.

## Layer Mapping

The JSON mapping above contains every exact node; principal DOM nodes:

| Node ID | Parent | Source layer | Vue element |
| --- | --- | --- | --- |
| `144:4380` | document | Source Frame | `.patient-shell` |
| `144:4381` | `144:4380` | Body | `.patient-shell` |
| `144:4382` | `144:4381` | Main Content | `.disease-main` |
| `144:4383` | `144:4382` | Hero Section | `.disease-hero` |
| `144:4384` | `144:4383` | Frame 74 | `.disease-hero__content` |
| `144:4385` | `144:4384` | Copy Container | `.disease-hero__copy` |
| `144:4387` | `144:4386` | Title Text | `h1[data-figma-node]` |
| `144:4389` | `144:4388` | Subtitle Text | `p[data-figma-node]` |
| `144:4390` | `144:4382` | Directory | `.disease-directory` |
| `144:4397` | `144:4396` | Search Frame 609 | `.disease-search` |
| `144:4401` | `144:4397` | Text Input | `.disease-input-wrap` |
| `144:4402` | `144:4401` | Search Text | `input[data-figma-node]` placeholder |
| `144:4403` | `144:4390` | Grid | `.disease-grid` |
| `144:4572` | `144:4382` | CTA Section | `.disease-cta` |
| `144:4574` | `144:4573` | CTA Container | `.disease-cta__content` |
| `144:4577` | `144:4574` | Action Container | `.disease-cta__actions` |
| `144:4578` | `144:4577` | Submit Link | RouterLink to /report |
| `144:4582` | `144:4577` | Consultation Link | Consultation button |
| `144:4586` | `144:4381` | Footer | PatientFooter.vue |
| `484:1506` | `144:4381` | Header | PatientHeader.vue |

## Sections

| Section | Node ID | W x H | Parameters |
| --- | --- | --- | --- |
| Hero | `144:4383` | 1440 x460 | copy x112/y172, outer1216 x150, inner644; gap24 |
| Directory | `144:4390` | 1440 x1896 | padding96/40; search800 x60; grid1216 x1644 including top48 |
| Final CTA | `144:4572` | 1440 x332 | padding96/0; content1280 x140 with32px inset; heading40 + action region100 |
| Footer | `144:4586` | 1440 x456 | y2688; shared shell with this frame's source icons/fonts |

## Typography

| Element | Node ID | Font | Size / line-height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title | `144:4387` | PingFang SC | 64/96 | 600 | #143162 |
| Hero subtitle | `144:4389` | PingFang SC | 20/30 | 400 | #5B606A |
| Card title | `144:4423` | PingFang SC | 24/24 | 600 | #1E3A5F |
| Card body | `144:4425`, `144:4426`, `144:4427` | PingFang SC | 16/24 | 400 | #4B5563 |
| Hospital count | `144:4425` text run | PingFang SC | 16/24 | 500 | #2563EB |
| CTA title | `144:4576` | PingFang SC | 40/40 | 600 (Dev token fallback) | #1E3A5F |
| CTA labels | `144:4581`, `144:4585` | PingFang SC | 16/16 | 600 | #FFFFFF / #1E3A5F |

Every authored card text node has its own Dev Mode record and live typography assertion. Native font metadata resolves shared SF Pro weights 510/590. Mixed hospital-label/count styles are preserved.

Source letter-spacing values remain untouched in the Dev Mode record and baseline CSS; live typography follows the application's zero-letter-spacing requirement, within the accepted minor pixel tolerance.

## Components And Spacing

- Hero uses the original 2510 x850 image, exact Dev crop `0.476px -13.73px / 100% 106.011% no-repeat`.
- Search:800 x60, padding0/24, border1 #DBDEE6, radius46; icon24; input598 x24 includes16px left padding, text582 x22.
- Grid:1216 wide; three389.3333px columns, 24px gaps, five300px rows, 48px top padding.
- Authored Grid placements are preserved. Eye card `144:4471` is row3/column1; gynecology `144:4481` is row2/column3, despite their order in Layers.
- Cards:300px, padding24, radius24, #F5F6F7; space-between icon32 and body. Body height follows actual source text wrapping; rows use16px top padding and8px gap.
- Submit:140 x52, padding16/24, gap8, radius14, #DD6B20.
- Consultation:176 x52, border2 #1E3A5F, radius14; exact source shadow and20px icon.
- At 1000px and below, the directory uses two auto-placed columns. At 600px and below it uses one column. Search and CTA remain contained; no separate mobile Figma frame is claimed.

## Assets

All 63 exported asset records are listed in the asset manifest. The following are live page owners; subordinate SVG exports also belong to the exact selected source node.

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero clinician/patient image | `144:4383` | lossless original pixels, exact Figma crop | `/public/images/figma/disease-source/node-144-4383.webp` |
| Search | `144:4398` | exact Dev Mode SVG, 24 x24 | `/public/images/figma/disease-source/node-144-4398.svg` |
| Submit | `144:4579` | exact Dev Mode SVG, 20 x20 | `/public/images/figma/disease-source/node-144-4579.svg` |
| Consultation | `144:4583` | exact Dev Mode SVG, 20 x20 | `/public/images/figma/disease-source/node-144-4583.svg` |
| Header consultation | `484:1516` | exact Dev Mode SVG | `/public/images/figma/disease-source/node-484-1516.svg` |
| Header language | `484:1540` | exact Dev Mode SVG | `/public/images/figma/disease-source/node-484-1540.svg` |
| Footer email/phone/WhatsApp | `144:4630`, `144:4636`, `144:4641` | exact Dev Mode SVG | `/public/images/figma/disease-source/node-144-4630.svg`, `node-144-4636.svg`, `node-144-4641.svg` |

| Card | Card Node ID | Icon Node ID | Project Path |
| --- | --- | --- | --- |
| 肿瘤科 | `144:4415` | `144:4416` | `/public/images/figma/disease-source/node-144-4416.svg` |
| 心血管 | `144:4428` | `144:4429` | `/public/images/figma/disease-source/node-144-4429.svg` |
| 神经外科 | `144:4439` | `144:4440` | `/public/images/figma/disease-source/node-144-4440.svg` |
| 骨科 | `144:4449` | `144:4450` | `/public/images/figma/disease-source/node-144-4450.svg` |
| 牙科 | `144:4459` | `144:4460` | `/public/images/figma/disease-source/node-144-4460.svg` |
| 妇科 | `144:4471` | `144:4472` | `/public/images/figma/disease-source/node-144-4472.svg` |
| 眼科 | `144:4481` | `144:4482` | `/public/images/figma/disease-source/node-144-4482.svg` |
| 消化科 | `144:4492` | `144:4493` | `/public/images/figma/disease-source/node-144-4493.svg` |
| 呼吸科 | `144:4502` | `144:4503` | `/public/images/figma/disease-source/node-144-4503.svg` |
| 泌尿外科 | `144:4512` | `144:4513` | `/public/images/figma/disease-source/node-144-4513.svg` |
| 整形外科 | `144:4523` | `144:4524` | `/public/images/figma/disease-source/node-144-4524.svg` |
| 细胞治疗 | `144:4537` | `144:4538` | `/public/images/figma/disease-source/node-144-4538.svg` |
| 儿科 | `144:4547` | `144:4548` | `/public/images/figma/disease-source/node-144-4548.svg` |
| 中医药 | `144:4560` | `144:4561` | `/public/images/figma/disease-source/node-144-4561.svg` |

This page has no chart. SVGs above are source icons, not chart substitutes.

## Prototype And Motion

- Search filters department, cases and treatment features, case-insensitively. Clearing or resetting restores all 14 authored cards.
- Dental navigates to /dental; departments without designed detail pages have no destination. Submit navigates to /report.
- Consultation dispatches the existing open-consultation event. The actual form API, validation and focus handling are preserved.
- Octagos actively inspected on2026-09-29: multiple scroll speeds through pinned hero/solution, Device Volume tab switch. Its floating composition is not copied into this page.
- Adaptation: card entry uses opacity0→1 and translateY18→0 over550ms, cubic-bezier(.22,1,.36,1); IntersectionObserver at8% threshold and8% bottom inset, disconnected on unmount and rebound to filtered cards.
- Hover: desktop fine-pointer cards lift6px with shadow, without resizing or changing brand fill. CTA lifts2px over250ms.
- Hero/CTA use the existing shared scroll-reveal behavior. Natural scrolling remains usable; no extra pinned section is invented.
- Mobile skips card reveal hiding. Reduced-motion removes transforms and visibility hiding, with the shared global negligible transition fallback.

## Verification

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/diseases/2026-09-29/figma-reference-native.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/diseases/2026-09-29/local-1440.png`
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/diseases/2026-09-29/local-390.png`
- Current Figma export: selected144:4380 via iab Export; downloaded `/Users/hhm/Downloads/05寰宇云医 - 疾病中心 (2).png` on2026-09-29. Earlier exports have obsolete card placement and are not final evidence.
- Evidence directory contains full screenshots, per-section crops, diff, overlay, source-map results, search/empty/consultation at1440/1024/768/390, hover and reduced-motion results.
- Live source checks:325 mapped nodes, 115 typography checks and93 geometry checks; zero failures.
- Desktop total height3144; changed pixels approximately0.680% against the current Figma export, including the required zero-letter-spacing normalization.
- Four viewports: no horizontal overflow, no broken images or runtime errors. Search, feature search, clear/reset, empty state, dental/report navigation, disabled unfinished destinations, actual consultation opening, keyboard focus loop, Escape and focus restoration passed.
- Motion: every card becomes visible after scrolling; hover retains width/height; reduced-motion returns opacity1 and transformnone.
- Verification run: 2026-09-29, after final UI/asset edits.
- Remaining differences: none
- Production qualification: the page-specific source/evidence audit, vue-tsc and direct Vite production build pass. Other page specifications are audited independently and do not change this page's evidence.
