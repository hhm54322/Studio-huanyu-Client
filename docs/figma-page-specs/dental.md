# 牙科服务

- Route: `/dental`
- Figma frames: `04寰宇云医 - 牙科 - 选择牙科项目`, `04寰宇云医 - 牙科 - 城市与医生匹配`
- Desktop frames: `1440 x 2384px` (项目选择), `1440 x 2064px` (城市与医生匹配)
- Mobile frame: no dedicated frame found; responsive adaptation required
- Source baseline HTML: `docs/figma-source/dental/source-frame-2026-09-29.html`
- Source baseline CSS: `docs/figma-source/dental/dev-styles-2026-09-29.css`
- Source asset manifest: `docs/figma-source/dental/assets-2026-09-29.json`
- Doctor matching source baseline HTML: `docs/figma-source/dental/matching/source-frame-2026-09-29.html`
- Doctor matching source baseline CSS: `docs/figma-source/dental/matching/dev-styles-2026-09-29.css`
- Doctor matching asset manifest: `docs/figma-source/dental/matching/native-image-paints-2026-09-29.json`
- Status: verified
- Node IDs: project selection `231:88`, doctor matching `231:397`; modal states `医生简介 231:1292`, `案例集 231:1355`, `患者评价 231:1421`

## Shared Geometry

- Header overlay: `64px`; hero image stage begins below the header.
- Hero: `1440 x 460px`, Figma bitmap crop `1440 x 396px`.
- Step navigation: `164px` desktop stage with three connected steps.
- Shared footer: fixed `456px`.

## State 1: 选择牙科项目

- Route state: `activeStep = 1`.
- Frame total: `2384px`; the project workspace fills the remaining height between hero/steps and footer.
- Project grid: 3 columns, 24px gap, authored order `种植牙 / 牙齿美白 / 牙齿贴面 / 隐形正畸 / 全瓷牙冠 / 洁牙 / 牙周 / 根管治疗 / 儿童齿科`.
- Cards use `#F5F6F7`, 24px radius; the authored initial state keeps `种植牙` expanded for detail rows while `牙齿美白` carries the dark selected outline. User selection synchronizes both states.
- Next action remains interactive and advances to the doctor matching state.

## State 2: 城市与医生匹配

- Route state: `activeStep = 2`.
- Frame total: `2064px`; desktop workspace is fixed to the authored state height.
- Filter row: six select controls plus orange filter and reset actions.
- Sort row and authored result count (`128`), followed by four doctor cards in a 3-column grid.
- Selected authored card is the center `吴一龙` card; doctor details modal remains keyboard-accessible and locks body scroll.

## State 2A: 医生简介交互状态

- Dedicated Figma state: `医生简介`, `1440 x 756px`.
- Trigger: doctor card `了解更多`; default tab is `医生简介`.
- Authored content: doctor header, three-tab rail, biography, `专业资质`, and four credential rows.
- Local record: [doctor-profile.md](doctor-profile.md).

## State 2B: 医生详情子状态

- Dedicated Figma states: `案例集` and `患者评价`, both `1440 x 756px`.
- Trigger: tab switch within the doctor dialog; counts remain `32` and `128`.
- Local records: [doctor-cases.md](doctor-cases.md) and [doctor-reviews.md](doctor-reviews.md).

## Assets

| Asset | Source | Project Path |
| --- | --- | --- |
| Dental hero | Figma image layer in `231:88`, crop `1440 x 396px` | `/public/images/figma/dental-hero-background.png` |
| Doctor avatars | Authored doctor card assets in `231:397` | `/public/images/figma/expert-*-avatar.png` |
| Project icons, ordered implant/whitening/veneer/aligner/crown/periodontal/root canal/children | Dev Mode SVG from `231:130`, `231:151`, `231:168`, `231:185`, `231:202`, `231:218`, `231:236`, `231:254`; each `32 x 32`, transparent background, `#2563EB` vector paint | `/public/images/figma/dental-source/icon-*.svg` |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Dental hero title | `231:88` hero text baked into source bitmap | PingFang SC | 64px / 96px | 600 | `#143162` |
| Dental hero subtitle | `231:88` hero text baked into source bitmap | PingFang SC | 20px / 29px | 400 | `#5B606A` |
| Step labels | `231:88` step rail | PingFang SC | 24px / 24px | 600 active; 500 inactive | `#1E3A5F`; inactive `#94A3B8` |
| Card/body copy | `231:88` project card children | PingFang SC | 16-24px / 24px | 400-600 | `#1E3A5F`, `#4B5563`, `#2563EB` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Project card | `231:88` repeated card | 389 x 286px collapsed; expanded authored card grows with details | 24px | 24px, `#F5F6F7`; selected outline 2px black |
| Step rail | `231:88` | 40px nodes with 64px connectors | 49px horizontal padding; 20px node gap | active `#1E3A5F`, inactive `#F1F5F9` |
| Doctor modal | `231:1292`, `231:1355`, `231:1421` | 896px surface in 1440 x 756px authored state | source modal state recorded separately | white modal over prototype backdrop |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Step switch | Figma prototype | Step button | Short transition | Stacked step rail |
| Doctor modal | Figma prototype | Detail action | Backdrop fade | Scrollable full-width modal |
| Project card detail | Figma expanded project state | Click individual card | Outer detail height animates `420ms cubic-bezier(.22,1,.36,1)` while the inner copy keeps its natural height; summary stays at its resting position | Same stable layout at one column; reduced motion removes transition |

## Verification

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/figma-project-2x.png`
- Figma doctor-state reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/figma-doctors-2x.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/local-1440.png`
- Local doctor-state screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/local-step2-1440.png`
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/local-390.png`
- Desktop geometry: `2384px` project state, `2064px` doctor state
- Mobile geometry: project and doctor states have no horizontal overflow; doctor state verified at `390 x 844`
- Interaction checks: step switching, project selection, applied doctor filters (including price), sorting, reset, doctor modal open/close/Escape/focus restoration and body scroll lock
- Backend behavior: `/api/dental-assessments` accepts multipart JPG/PNG/PDF uploads, requires at least one file, persists the assessment and returns explicit submitting/success/error states. One submission reuses its request ID across retries; the server returns the original record for an idempotent retry and removes the retry's duplicate upload files.
- Latest program regression screenshot: `artifacts/program-regression/dental-upload-success.png`; captured after a real browser multipart upload reached the API and the persisted success state rendered.
- Remaining differences: none
- Verification run: 2026-09-29. Re-read Figma source frames `231:88`, `231:397`, `231:815`, `231:1292`, `231:1355`, and `231:1421`; locked 307/416/198/63/66/81 node trees, regenerated source baselines, and verified project/doctor/upload desktop geometry, responsive mobile flow, filters/reset, step transitions, doctor modal tabs, Escape close, body scroll lock, image loading, empty-upload rejection, and reduced-motion fallback. Source screenshot changed-pixel ratios: project 2.71%, doctor 3.76%, upload 2.19% at threshold .15; all authored frame heights match exactly. State evidence: `docs/figma-verification/dental/2026-09-29/state-results.json`.
- 2026-09-30 icon/accordion correction: Dev Mode SVG code was copied from all eight exact icon nodes listed above, replacing screenshot-derived `32 x 32` PNGs that had an opaque `#F5F6F7` background and clipped strokes. Source SVGs render with zero corner alpha. At `1440` and `390px`, all eight expanded cards display every detail row inside their own bounds with no horizontal overflow. Implant summary title remains at the same `136px` card-relative Y position before/after toggle; authored desktop expanded height remains `446px`. Final focused screenshots: `docs/figma-verification/dental/2026-09-30/expanded-final-1440.png` and `expanded-final-390.png`.
- Motion check: at `30 / 60 / 100 / 200 / 480ms` after expanding a card, the detail shell grew smoothly while the `dl` kept natural row positions and no adjacent rows overlapped. All eight card details fit at desktop/mobile widths; rapid repeated clicks, SVG loading, reduced-motion reading state, and browser runtime errors were checked. Full-page captures: `docs/figma-verification/dental/2026-09-30/full-1440.png` and `full-390.png`.
- Latest `1440 x 2384` full-page screenshot versus the existing 2x Figma export normalized to 1x: changed-pixel ratio at RGB max-channel threshold `38` is `1.51%` (prior local image `2.78%`); mean absolute RGB difference is `1.95/255` (prior `3.61/255`). This focused fix improves the comparison but does not establish a site-wide 100% match. Type check and Vite build pass; global Figma gate is still blocked by unrelated cases/diseases evidence and unfinished about/toolkit-detail source records.
