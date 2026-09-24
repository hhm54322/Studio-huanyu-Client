# 中国医院

- Route: `/hospitals`
- Figma frame: `07寰宇云医 - 中国医院`
- Node ID: `144:4707`
- Source baseline HTML: `docs/figma-source/hospitals/frame.html`
- Source baseline CSS: `docs/figma-source/hospitals/styles.txt`
- Source asset manifest: `docs/figma-source/hospitals/assets.json`
- Source extraction run: `2026-09-24 Dev Mode HTML expansion from node 144:4707`
- Desktop frame: `1440 x 2440px` (`2x` export: `2880 x 4880px`)
- Mobile frame: no dedicated frame found; responsive adaptation required
- Status: verified (desktop frame; responsive mobile adaptation)

## Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `144:4707` | `07寰宇云医 - 中国医院` frame | — | `.hospital-page` | `1440 x 2440px` | Source frame |
| `144:4709` | `Main Content` auto-layout | `144:4708` | page section flow | `1440 x 1984px` | Header/footer shell-owned |
| `144:4710` | Hero section | `144:4709` | `.hospital-hero` | `1440 x 460px` | Image stage below overlay header |
| `144:4731` | Hospital directory container | `144:4709` | `.hospital-directory` | `1440 x 1524px`, padding `96px 40px` | City tabs + 3 x 3 cards |
| `144:4732` | Tab List | `144:4731` | `.city-tabs` | `1216 x 42px`, gap `16px` | Tab nodes `144:4733`, `144:4736`, `144:4739`, `144:4742`, `144:4745` |
| `144:4748` | Hospital card grid | `144:4731` | `.hospital-grid` | `1216 x 1290px`, 3 x 3, `24px` gaps | Representative card `144:5104` |
| `144:5104` | Hospital card component | `144:4748` | `.hospital-grid article` | `389.33 x 398px`, radius `24px` | Image stage `192px`; body `206px` |
| `144:5154` | Footer | `144:4707` | `PatientFooter.vue` | `1440 x 456px` | Shared shell |

## Sections

| Order | Section | Node / Layer | Width | Height | Container/Grid | Background / Notes |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | Hero | `144:4710` (`Section`) | 1440 | 460 | Full width; image stage starts below the 64px overlaid header | Figma bitmap crop, `1440 x 396px`, exact image copy and artwork |
| 2 | Hospital directory | `144:4731` (`Container`) | 1440 | 1524 | `1216px` content; city tabs `1216 x 42px`; card grid `1216 x 1290px`, 3 columns x 3 rows, 24px gaps | White; 96px top/bottom padding |
| 3 | Shared footer | `144:5154` (`Footer`) | 1440 | 456 | `1216px` content | Dark navy footer, `#021D2E` |

The three sections total exactly `2440px`. The shared header is overlaid on the hero and does not add to the body height.

## Verified Figma Parameters

- Hero section: vertical flow, fixed `460px`, padding `180px 112px 146px`, gap `44px`; the exported image is cropped to `1440 x 396px` beneath the overlaid 64px header.
- Directory section: vertical flow, hug `1524px`, padding `96px 40px`; content width `1216px`.
- City tab list: `144:4732`, `1216 x 42px`, 16px gap, 80px minimum tab width, 1px border, 24px radius; inactive border `#DBDEE6`; active Beijing variant is `80 x 42px`, fill/border `#DD6B20`.
- Hospital grid: `144:4748`, `1216 x 1290px`, 3 rows x 3 columns, 24px row/column gap.
- Hospital cards: `144:5104` (representative card), `389.33 x 398px`, `#F5F6F7` fill, 1px border, 24px radius. Image stage `192px`; content stage `206px` with padding `20px 24px 24px`.
- Footer: fixed `456px` height.

## Assets

| Asset | Source | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hospital directory hero | `144:4710` image layer, hash `ded16e6e38437219c4b5a6aa20f61c740a19ba87` | Crop, `1440 x 396px` | `/public/images/figma/hospital-directory-hero.png` |
| Beijing hospital card 01-08 | `144:4748` card image instances | Cover, baked location/type/JCI badges where authored | `/public/images/figma/hospital-card-01.png` through `/public/images/figma/hospital-card-08.png` |

## Behavior

- City tabs filter the editable hospital constants; the Beijing view exposes the eight authored Figma cards.
- `查看详情` opens the existing accessible modal and preserves the selected hospital data.
- `预约咨询` dispatches the existing `open-consultation` event without changing report or hospital administration behavior.
- Desktop cards use restrained lift/image feedback and reveal timing inspired by Octagos; resting geometry remains unchanged.
- Mobile uses a responsive single-column card flow and keeps the tab list horizontally scrollable without page-level overflow.
- `prefers-reduced-motion` disables card, image, tab and action transitions.

## Verification

- Figma reference screenshot: `/Users/hhm/Downloads/07寰宇云医 - 中国医院 (3).png`
- Local desktop screenshot: `/tmp/huanyu-hospitals-desktop-verified.png` (exact 1440px viewport; full-page geometry checked via DOM)
- Local mobile screenshot: `/tmp/huanyu-hospitals-mobile-verified.png`
- Verification run: `2026-09-24`
- Remaining differences: none
- Desktop geometry: `460 / 1524 / 456px`; exact total height `2440px`
- Desktop and mobile: no horizontal overflow, broken images, or unrevealed content
- Interaction checks: city filtering, detail modal open/close, consultation event, body scroll lock, and responsive tab scrolling
- 2026-09-23: Re-read Dev Mode source frame `144:4707` and checked the live page at desktop geometry. Hero bitmap copy remains intentionally hidden from the live text layer; directory measured `460 / 1524 / 456px`, cards `389.33 x 398px`, city tabs `1216 x 42px`. Mobile remains the approved responsive interpretation because no dedicated Figma mobile frame is present.

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title and subtitle | baked into `144:4710` image | Figma exported bitmap | N/A (image pixels) | N/A | Image pixels |
| Hospital card title | `144:5117` (`Heading 3`) | Patient shell heading | `36px` line box | 700 | `#192D47` |
| Hospital card metadata/actions | `144:5104` descendants | Patient shell body | 12-14px / authored card layout | 400-700 | `#173B67` / Figma fills |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| City tabs | `144:4732` (`Tab List`) | 1216 x 42px | 16px gap; items 80-82px x 42px; 12px/24px item padding | 24px, 1px border |
| Hospital grid | `144:4748` | 1216 x 1290px | 3 x 3; 24px row/column gap | Grid container |
| Hospital card | `144:5104` | 389.33 x 398px | 192px image + 206px body; body padding 20/24/24 | 24px, 1px border |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| City filter | Figma prototype | Tab click | Short color transition | Horizontal tab scroll |
| Detail modal | Existing patient flow | Detail action | Backdrop fade | Full-width scrollable modal |
