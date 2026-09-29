# 医生详情 · 患者评价

- Figma frame: `患者评价`
- Node ID: `231:1421`
- Source baseline HTML: `docs/figma-source/doctor-reviews/frame.html`
- Source baseline CSS: `docs/figma-source/doctor-reviews/styles.txt`
- Source asset manifest: `docs/figma-source/doctor-reviews/assets.json`
- Source extraction run: 2026-09-24, Dev Mode HTML plus recursively expanded Layers tree
- Source reference: `/Users/hhm/Downloads/患者评价 (1).png`
- Desktop authored state: `1440 x 756px`
- Mobile frame: responsive fallback at `390 x 844px` (no authored mobile modal frame)
- Entry: `/dental` -> step `02 城市与医生匹配` -> `了解更多` -> `患者评价（128）`
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer/type | Parent | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `231:1421` | `患者评价` frame | document | modal state root | 1440 x 756 | authored review state |
| `231:1422` | background page image | `231:1421` | existing `/dental` doctor-match page | 1440 x 1136 at 0,0 | obscured by overlay |
| `231:1423` | `Container` overlay | `231:1421` | `.dental-modal-backdrop` | 1440 x 756; 40px vertical padding; black 50%; blur 4px | centered dialog |
| `231:1424` | `Rectangle 17` | `231:1423` | overlay backing geometry | 896 x 600 at x272/y51; radius 24px; `#D9D9D9` | source backing rectangle |
| `231:1425` | `Frame 631` dialog | `231:1423` | `.dental-doctor-modal--reviews` | 896 x 654; 32px padding; radius 24px; white; vertical Auto Layout | fixed desktop state height |
| `231:1426`–`231:1428` | close Button / Icon / Vector | `231:1425` | `.dental-modal-close` and exported close SVG | 36px hit area; 8px padding; 20px icon; top/right 16px; blur 8px | focus, click and Escape close |
| `231:1429`–`231:1432` | `Frame 683`, title containers, `医生详情` | `231:1425` | dialog content and `h2` | 832px inner width; title 32/32px, 600, .4px tracking, `#1E3A5F` | exact title copy |
| `231:1433`–`231:1440` | doctor header, portrait, identity/name/title | `231:1429` | `.dental-modal-profile` first two groups | 106px high; 32px top padding; 12px outer gap; 60px portrait; 8px detail gap | source order preserved |
| `231:1441`–`231:1444` | hospital row / Icon / Vector / text | `231:1435` | hospital metadata row | 16px icon; 4px gap; 14/20px, `#9CA3AF` | hospital SVG from source vector |
| `231:1445`–`231:1448` | experience row / Frame / Vector / text | `231:1435` | experience metadata row | 16px icon; 4px gap; 14/20px, `#9CA3AF` | experience SVG from source vector |
| `231:1449`–`231:1456` | tab margin, rail, three Buttons and text | `231:1429` | `.dental-modal-tabs` | 24px top; 27px rail; 14/14px; 2px active underline; counts 32/128 | reviews tab active |
| `231:1457` | first review wrapper | `231:1429` | first review list slot | 832 x 144; 16px top padding | contains first 128px card |
| `231:1458`–`231:1465` | first card, rating, star/value, title and body | `231:1457` | first review `article` | 832 x 144; 24px padding; 12px gap; radius 24px; `#F3F4F6` | US half-mouth implant review |
| `231:1466`–`231:1471` | first metadata row / dash / metadata text | `231:1458` | first review `small` | 14/14px; `#9CA3AF`; 17px dash slot | 2025.08 source line |
| `231:1472` | second review wrapper | `231:1429` | second review list slot | 832 x 144; 16px top padding | contains second 128px card |
| `231:1473`–`231:1480` | second card, rating, star/value, title and body | `231:1472` | second review `article` | same copied geometry and typography | Australia aligner review |
| `231:1481`–`231:1486` | second metadata row / dash / metadata text | `231:1473` | second review `small` | 14/14px; `#9CA3AF`; 17px dash slot | 2025.06 source line |
| `231:1487` | third review wrapper | `231:1429` | third review list slot | 832 x 144; 16px top padding | authored duplicate review retained |
| `231:1488`–`231:1495` | third card, rating, star/value, title and body | `231:1487` | third review `article` | same copied geometry and typography | authored Australia duplicate |
| `231:1496`–`231:1501` | third metadata row / dash / metadata text | `231:1488` | third review `small` | 14/14px; `#9CA3AF`; 17px dash slot | 2025.06 source line |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Modal title | `231:1432` | PingFang SC | 32px / 32px | 600 | `#1E3A5F` |
| Doctor name | `231:1438` | SF Pro | 18px / 18px | 600 | `#1E3A5F` |
| Tab labels | `231:1452`, `231:1454`, `231:1456` | PingFang SC | 14px / 14px | 500 | inactive `#94A3B8`; active `#2563EB` |
| Rating glyph | `231:1461`, `231:1476`, `231:1491` | Font Awesome 6 Free | 10px / 10px | 900 | `#F59E0B` |
| Rating value | `231:1463`, `231:1478`, `231:1493` | PingFang SC | 12px / 12px | 600 | `#F59E0B` |
| Review title | `231:1464`, `231:1479`, `231:1494` | PingFang SC | 16px / 16px | 500 | `#1E3A5F` |
| Review body | `231:1465`, `231:1480`, `231:1495` | PingFang SC | 14px / 14px | 400 | `#6B7280` |
| Review metadata | `231:1471`, `231:1486`, `231:1501` | PingFang SC | 14px / 14px | 400 | `#9CA3AF` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Dialog | `231:1425` | 896 x 654px | 32px | 24px radius, white |
| Tabs | `231:1449`, `231:1450` | 832 x 51px | 24px top | 1px `#F1F5F9` rail, 2px blue active edge |
| Review wrapper | `231:1457`, `231:1472`, `231:1487` | 832 x 144px | 16px top | no decoration |
| Review card | `231:1458`, `231:1473`, `231:1488` | 832 x 144px | 24px; 12px vertical gap | 24px radius, `#F3F4F6` |
| Rating row | `231:1459`, `231:1474`, `231:1489` | stretch x 16px | 4px gap | orange star and value |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Doctor portrait | `231:1434` | 60 x 60px, cover, radius 16px | `/public/images/figma/expert-shao-zhimin-avatar.png` |
| Close icon | `231:1427` | 20 x 20px | `/public/images/figma/doctor-modal-close.svg` |
| Hospital icon | `231:1442` | 16 x 16px | `/public/images/figma/doctor-modal-hospital.svg` |
| Experience icon | `231:1446` | 16 x 16px | `/public/images/figma/doctor-modal-experience.svg` |
| Review star | `231:1461`, `231:1476`, `231:1491` | Font Awesome solid glyph rendered as 12 x 12px SVG | `/public/images/figma/doctor-review-star.svg` |

## Prototype And Motion

| Interaction | Figma/Octagos reference | Trigger | Timing/Easing | Mobile fallback |
| --- | --- | --- | --- | --- |
| Review tab | Figma authored state | tab click | active underline plus content state | single-line scroll-safe tab rail |
| Modal open | Figma composition / Octagos motion vocabulary | `了解更多` | backdrop 250ms; dialog 350ms cubic-bezier(.22,1,.36,1) | same state, internal dialog scroll |
| Modal close | Figma prototype | close, backdrop, Escape | reverse fade/lift | body scroll restored |
| Reduced motion | accessibility fallback | OS preference | `.01ms`, no lift | same complete content |

## Verification

- Figma reference screenshot: `/Users/hhm/Downloads/患者评价 (1).png`
- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/doctor-reviews-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/doctor-reviews-390.png`
- Desktop geometry: viewport `1440 x 756`; dialog `896 x 654` at `(272, 51)`; three authored cards `832 x 144`; the fixed Figma frame intentionally clips the lower part of the third card.
- Mobile geometry: viewport `390 x 844`; dialog `342 x 720` at `(24, 62)` with internal scrolling; document width remains 390px.
- Interaction checks: all three tabs switch authored states; close-button focus, Escape and close-button paths restore body scroll; backdrop uses the existing self-click close path.
- Motion checks: 250ms backdrop fade and 350ms cubic-bezier(.22,1,.36,1) dialog lift retain the fixed resting geometry; reduced-motion fallback remains active.
- Remaining differences: none
- Verification run: 2026-09-24
