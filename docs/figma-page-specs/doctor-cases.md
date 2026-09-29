# 医生详情 · 案例集

- Figma frame: `案例集`
- Node ID: `231:1355`
- Source baseline HTML: `docs/figma-source/doctor-cases/frame.html`
- Source baseline CSS: `docs/figma-source/doctor-cases/styles.txt`
- Source asset manifest: `docs/figma-source/doctor-cases/assets.json`
- Source extraction run: 2026-09-24, Dev Mode HTML plus recursively expanded Layers tree
- Source: `/Users/hhm/Downloads/案例集 (1).png`
- Desktop frame: `1440 x 756px`
- Mobile frame: responsive fallback at `390 x 844px` (no authored mobile modal frame)
- Entry: `/dental` -> step `02 城市与医生匹配` -> `了解更多` -> `案例集（32）`
- Modal: blurred backdrop, rounded white panel, doctor profile header, three-tab navigation, three case cards with location/date/authorization metadata.
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer | Parent | Vue implementation | Dev Mode values copied | Notes |
| --- | --- | --- | --- | --- | --- |
| `231:1355`, `231:1356`, `231:1357` | `案例集` / background page / overlay container | document | `Teleport`, `.dental-modal-backdrop` | `1440 x 756`; rgba black 0.50; blur 4px; 40px vertical padding | authored modal state |
| `231:1358`, `231:1359` | backdrop rectangle / `Frame 631` dialog | `231:1357` | backdrop surface, `.dental-doctor-modal` | 896px wide; 32px padding; 24px radius; vertical Auto Layout | white dialog measured at 649px |
| `231:1360`, `231:1361`, `231:1362` | close Button / Icon / Vector | `231:1359` | `.dental-modal-close`, `X` | 36px hit area; 8px padding; 20px icon; top/right 16px | focusable control |
| `231:1363`–`231:1366` | title containers / `医生详情` | `231:1359` | `.dental-doctor-modal h2` | 32/32px, weight 600, `#1E3A5F`, .4px tracking | exact copy |
| `231:1367`–`231:1382` | doctor header, portrait, identity, hospital and experience nodes | `231:1359` | `.dental-modal-profile` descendants | 106px high; 32px top padding; 12px outer gap; 8px detail gap; 60px portrait | source order preserved |
| `231:1383`–`231:1390` | tab margin/container/buttons/text | `231:1359` | `.dental-modal-tabs` and buttons | 24px top; 27px rail; 14/14px text; 2px blue active underline | authored counts `32` and `128` |
| `231:1391`–`231:1400` | first case wrapper/card/title/body/meta | `231:1359` | first `.dental-modal-list--cases article` | 832 x 116; 24px padding; 12px content gap; 24px radius | 半口种植 |
| `231:1401`–`231:1410` | second case wrapper/card/title/body/meta | `231:1359` | second `.dental-modal-list--cases article` | 832 x 116; same copied properties | 单颗后牙种植 |
| `231:1411`–`231:1420` | third case wrapper/card/title/body/meta | `231:1359` | third `.dental-modal-list--cases article` | 832 x 116; same copied properties | 美学区种植修复 |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Modal title | `231:1366` | PingFang SC | 32px / 32px | 600 | `#1E3A5F` |
| Case title | `231:1393`, `231:1403`, `231:1413` | PingFang SC | 16px / 16px | 500 | `#1E3A5F` |
| Case body | `231:1394`, `231:1404`, `231:1414` | PingFang SC | 14px / 14px | 400 | `#6B7280` |
| Case metadata | `231:1400`, `231:1410`, `231:1420` | PingFang SC | 14px / 14px | 400 | `#9CA3AF` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Modal | `231:1359` | 896px x 649px | 32px padding | 24px radius, white, backdrop blur |
| Case card | `231:1391`, `231:1401`, `231:1411` | 832px x 116px | 24px padding; 16px list gap; 12px content gap | 24px radius, `#F3F4F6` fill |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Tab switch | Figma authored state | Tab click | Immediate content state with active underline | Single-line tab row |
| Modal open/close | Figma prototype / Octagos motion vocabulary | Action/Escape/backdrop | 250ms backdrop fade + 350ms lift/scale, cubic-bezier(.22,1,.36,1) | Same scroll lock; reduced motion `.01ms` |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Doctor/avatar imagery | `231:1368` | Cover/contain | `/public/images/figma/expert-shao-zhimin-avatar.png` |
| Close icon | `231:1361` | 20px | `/public/images/figma/doctor-modal-close.svg` |
| Hospital icon | `231:1376` | 16px | `/public/images/figma/doctor-modal-hospital.svg` |
| Experience icon | `231:1380` | 16px | `/public/images/figma/doctor-modal-experience.svg` |

## Verification

- Figma reference screenshot: `/Users/hhm/Downloads/案例集 (1).png`
- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/doctor-cases-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/doctor-cases-390.png`
- Desktop geometry: viewport `1440 x 756`; dialog `896 x 649` at `(272, 53.5)`; three cards each `832 x 116`; document width remains 1440px
- Mobile geometry: viewport `390 x 844`; dialog `342 x 720` at `(24, 62)` with internal scrolling; document width remains 390px; tabs remain one line
- Interaction checks: profile/cases tab switch, 3-card authored state, close-button focus, Escape close, backdrop close, close-button close, body-scroll restoration
- Remaining differences: none
- Verification run: 2026-09-24. Re-read Dev Mode state `231:1355` and recursively expanded the Layers tree through `231:1420`; verified three authored cards, active tab counts, dialog geometry, motion fallback, mobile scroll fallback, all close paths, and body scroll restoration.
