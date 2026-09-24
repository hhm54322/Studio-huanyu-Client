# 医生详情 · 医生简介

- Figma frame: `医生简介`
- Node ID: `231:1292`
- Source baseline HTML: `docs/figma-source/doctor-profile/frame.html`
- Source baseline CSS: `docs/figma-source/doctor-profile/styles.txt`
- Source asset manifest: `docs/figma-source/doctor-profile/assets.json`
- Source extraction run: 2026-09-24, Dev Mode HTML plus recursively expanded Layers tree
- Source: `/Users/hhm/Downloads/医生简介.png`
- Desktop authored state: `1440 x 756px`
- Mobile frame: responsive fallback at `390 x 844px` (no authored mobile modal frame)
- Entry: `/dental` -> step `02 城市与医生匹配` -> `了解更多` -> `医生简介`
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer | Parent | Vue implementation | Dev Mode values copied | Notes |
| --- | --- | --- | --- | --- | --- |
| `231:1292`, `231:1293`, `231:1294` | `医生简介` / background page / overlay container | document | `Teleport`, `.dental-modal-backdrop` | `1440 x 756`; rgba black 0.50; blur 4px; 40px vertical padding | authored modal state |
| `231:1295` | `Frame 631` dialog surface | `231:1294` | `.dental-doctor-modal` | 896px wide; 32px padding; 24px radius; vertical Auto Layout | measured local height 501px |
| `231:1296`, `231:1297`, `231:1298` | close Button / Icon / Vector | `231:1295` | `.dental-modal-close`, `X` | 36px hit area; 8px padding; 20px icon; top/right 16px | Escape and focus behavior added in Vue |
| `231:1299`, `231:1300`, `231:1301` | title containers / `医生详情` | `231:1295` | `.dental-doctor-modal h2` | 32/32px, weight 600, `#1E3A5F`, .4px tracking | exact copy |
| `231:1302`–`231:1317` | doctor header, portrait, identity, hospital and experience nodes | `231:1295` | `.dental-modal-profile` descendants | 106px high; 32px top padding; 12px outer gap; 8px detail gap; 60px portrait | source order preserved |
| `231:1318`–`231:1325` | tab margin/container/buttons/text | `231:1295` | `.dental-modal-tabs` and buttons | 24px top; 27px rail; 14/14px text; 2px active underline | profile state omits counts exactly as authored |
| `231:1326`, `231:1327` | biography container/text | `231:1295` | `.dental-modal-panel > p` | 16px top; 16/24px; `#4B5563` | typo `修腹` corrected to `修复` |
| `231:1328`, `231:1329`, `231:1330` | credential section/container/title | `231:1295` | `.dental-modal-panel h4`, `ul` | 24px top; 16/16px heading; vertical Auto Layout; 12px gap | one-column source hierarchy |
| `231:1331`–`231:1354` | four credential frames, icon/vector nodes and text nodes | `231:1328` | `.dental-modal-panel li` and exported credential SVG | 16px icons; 8px row gap; 16/24px text; four 24px rows | order and copy preserved |

## Authored State Parameters

- The Figma state is a doctor-detail dialog over the existing doctor-match page. The background is dimmed and blurred while the dialog remains the only active surface.
- Dialog heading is `医生详情`; the profile header contains the doctor portrait, name, title, hospital and experience.
- The tab rail has three authored states: `医生简介`, `案例集`, and `患者评价`. `医生简介` is the active tab in this frame and uses the blue underline/accent treatment.
- The active panel contains one biography paragraph, a `专业资质` heading, and four check-mark credential rows.
- Close control is an icon-only `X` in the upper-right corner.

## Exact Figma Frame Properties

| Element | Node ID | Width | Height | Fill / Notes |
| --- | --- | ---: | ---: | --- |
| Authored state frame | `231:1292` | 1440px | 756px | `#FFFFFF` frame surface |
| Background page | `231:1293` | 1440px | 756px | dimmed by `231:1294`: rgba black 0.50, blur 4px |
| Dialog surface | `231:1295` | 896px | 501px content height | white, 24px radius, 32px padding |
| Profile body | `231:1326` | 832px inner | 248px | `#4B5563`, 16px/24px |

## Assets

| Asset | Figma source | Project mapping |
| --- | --- | --- |
| Doctor portrait | `231:1303` | `/public/images/figma/expert-shao-zhimin-avatar.png` |
| Close icon | `231:1297` | `/public/images/figma/doctor-modal-close.svg` |
| Hospital icon | `231:1311` | `/public/images/figma/doctor-modal-hospital.svg` |
| Experience icon | `231:1315` | `/public/images/figma/doctor-modal-experience.svg` |
| Credential icons | `231:1333`, `231:1339`, `231:1345`, `231:1351` | `/public/images/figma/doctor-modal-credential.svg` |

## Implementation Mapping

| Figma element | Local implementation |
| --- | --- |
| Doctor header | `DentalView.vue` `.dental-modal-profile` |
| Active tab | `doctorTab === 'profile'` |
| Credential rows | `DentalView.vue` `.dental-modal-panel ul` |
| Close / Escape / backdrop | `closeDoctor`, `handleKeydown`, `.dental-modal-backdrop` |

## Prototype And Motion

| Interaction | Trigger | Authored behavior | Local behavior |
| --- | --- | --- | --- |
| Open detail | `了解更多` | Dialog appears above blurred page | 250ms backdrop fade + 350ms lift/scale, cubic-bezier(.22,1,.36,1) |
| Profile tab | Tab click | Blue active underline and profile panel | `doctorTab = 'profile'` |
| Close detail | `X`, backdrop, `Escape` | Return to doctor-match state | Clears selection and restores body scroll |

## Verification

- Figma reference screenshot: `/Users/hhm/Downloads/医生简介.png`
- Local desktop screenshot: `/tmp/huanyu-doctor-profile-verified.png`
- Local mobile screenshot: `/tmp/huanyu-doctor-profile-mobile-verified.png`
- Local verification: `/dental`, state 2, doctor `了解更多`, profile tab
- Desktop geometry: viewport `1440 x 756`; dialog `896 x 501` at `(272, 127.5)`; profile header `832 x 106`; tabs `832 x 27`; body `832 x 248`
- Mobile geometry: viewport `390 x 844`; dialog `342 x 593` at `(24, 125.5)`; one-column credentials; document width remains 390px
- Accessibility checks: dialog exposes `role="dialog"`; close button receives focus; `Escape`, close button and backdrop all close it; body scroll locks while open and restores after close
- Motion fallback: global `prefers-reduced-motion` gate reduces all modal transitions and animations to `.01ms`
- Remaining differences: none
- Verification run: 2026-09-24
