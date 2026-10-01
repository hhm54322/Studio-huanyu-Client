# 08 来华就医全流程工具包详情

- Route: `/steps/toolkit-detail`
- Figma frame: `08来华就医全流程工具包详情模版`
- Node ID: `143:3058`
- Source baseline HTML: `docs/figma-source/steps-toolkit-detail/baseline.html`
- Source baseline CSS: `docs/figma-source/steps-toolkit-detail/baseline.css`
- Source asset manifest: `docs/figma-source/steps-toolkit-detail/asset-manifest.json`
- Source extraction run: 2026-09-30, Figma Dev Mode through browser-client and iab; native inventory/parameters/image paints are locked under `docs/figma-source/steps-toolkit-detail/`
- Desktop frame: `1440 x 2909.117px`; header `1440 x 64px`, main `1440 x 2453.117px`, footer `1440 x 456px`
- Mobile frame: `390px` responsive single-column article and index
- Status: verified

## Layer Mapping

The complete 183-node parent/child inventory, sibling order, visibility, geometry, paint, text, and asset data is recorded in `docs/figma-source/steps-toolkit-detail/native-inventory-2026-09-29.json`, `native-parameters-2026-09-29.json`, and `native-image-paints-2026-09-29.json`. Implemented nodes map to the following concrete Vue elements:

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:3058` | 08来华就医全流程工具包详情模版 / FRAME | `Section` | `.toolkit-detail-page` | 1440 x 2909.117, white | source frame |
| `143:3059` | Main Content / FRAME | `143:3058` | `.toolkit-detail-page` | 1440 x 2453.117 | gray content surface |
| `143:3060` | Container / FRAME | `143:3059` | `.toolkit-detail-page` | vertical, #F5F6F8 | page surface |
| `143:3061` | Container / FRAME | `143:3060` | `.toolkit-detail-shell` | x112 y112, 1216 x 2229.117, 906/286 grid, 24 gap | desktop grid |
| `143:3062` | Container / FRAME | `143:3061` | `.toolkit-detail-article` | x112 y112, 906 x 2229.117, padding32, radius24, white | article surface |
| `143:3064` | Container / FRAME | `143:3063` | `.toolkit-detail-article` content | x144 y144, 842 x 2165.117, vertical | inner content |
| `143:3065` | Link / FRAME | `143:3064` | `.toolkit-detail-back` | x144 y144, 768 x 27.117 | router link to `/trust` |
| `143:3069` | 返回信任与常见问题 / TEXT | `143:3065` | `.toolkit-detail-back` text | 14px/22px, gray | exact copy |
| `143:3071` | Text / FRAME | `143:3064` | `.toolkit-detail-kicker` | x144 y203.117, 191 x 34 | exact label |
| `143:3074` | 病历翻译与整理工具 / TEXT | `143:3073` | `h1` | x144 y253.117, 357 x 60, PingFang SC 40/60 semibold | exact copy |
| `143:3077` | Paragraph / TEXT | `143:3076` | `.toolkit-detail-copy--top` | x144 y353.117, 842 x 644, PingFang SC 16/24, paragraph spacing12 | exact line baselines |
| `143:3078` | Frame 656 / FRAME | `143:3075` | `.toolkit-detail-images` | x144 y1021.117, 842 x 260, 24 gap | two source image assets |
| `143:3079` | image / ROUNDED_RECTANGLE | `143:3078` | first `img` | 409 x 260, cover, radius8 | `toolkit-source-record.webp` |
| `143:3080` | image / ROUNDED_RECTANGLE | `143:3078` | second `img` | 409 x 260, cover, radius8 | `toolkit-source-report.webp` |
| `143:3081` | Paragraph / TEXT | `143:3076` | `.toolkit-detail-copy--bottom` | x144 y1305.117, 842 x 1004, PingFang SC 16/24, paragraph spacing12 | exact line baselines |
| `143:3082` | Container / FRAME | `143:3061` | `.toolkit-detail-sidebar` | x1042 y112, 286 x 465, radius24, white | sticky desktop index |
| `143:3085` | 来华就医全流程工具包 / TEXT | `143:3084` | sidebar `strong` | x1066 y136, 177 x 18, 18/18 semibold | exact copy |
| `143:3087`/`143:3091`/`143:3095`/`143:3099`/`143:3103`/`143:3107`/`143:3111`/`143:3115` | toolkit index item / FRAME | `143:3086` | sidebar `a` items | x1066, 238px wide, 47px row; final row 46px | concrete anchors to section IDs |
| `143:3119` | Header / FRAME | `143:3058` | `PatientHeader` | x0 y0, 1440 x 64 | shared authored header |
| `143:3163` | Body / FRAME | `143:3058` | `PatientFooter` | x0 y2453.117, 1440 x 456 | shared authored footer |

All remaining text, vector, icon, wrapper, and footer children retain their exact IDs and sibling order in the locked native inventory and are represented by their parent Vue element above; no source node is substituted with a placeholder asset.

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Main Content | `143:3060` | 1440px | 2453.117px | #F5F6F8 | header overlays top 64px |
| Article | `143:3062` | 906px | 2229.117px | padding 32px | white, radius 24px |
| Toolkit index | `143:3082` | 286px | 465px | padding 24px | sticky at top 88px |
| Footer | `143:3163` | 1440px | 456px | shared footer grid | starts y2453.117 |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Page title | `143:3074` | PingFang SC | 40/60px | 600 | `#1E3A5F` |
| Body and paragraph lines | `143:3077`, `143:3081` | PingFang SC | 16/24px; paragraph spacing 12px | 400 | `#4B5563` |
| Embedded section headings | `143:3077`, `143:3081` | PingFang SC | 24/36px | 600 | `#1E3A5F` |
| Toolkit index title | `143:3085` | PingFang SC | 18/18px | 600 | `#1E3A5F` |
| Toolkit index items | `143:3089` etc. | PingFang SC | 14/14px | 400 | `#6B7280` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Article | `143:3062` | 906 x 2229.117 | 32px | radius 24px, white |
| Image pair | `143:3078` | 842 x 260 | 24px gap | image radius 8px, cover |
| Toolkit index | `143:3082` | 286 x 465 | 24px | radius 24px, white |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Standardized record example | `143:3079` | source crop, cover, 409 x 260 | `public/images/figma/toolkit-source-record.webp` |
| Feasibility report example | `143:3080` | source crop, cover, 409 x 260 | `public/images/figma/toolkit-source-report.webp` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Return to FAQ | Authored route entry | Click `143:3065` | Vue Router navigation, scroll top | Same route |
| Toolkit index | Source section links | Click any `143:3087`-`143:3115` item | Native anchor scroll | Index becomes static block below article |
| Page reveal | Octagos entry vocabulary | Page entry/scroll | Shared `data-reveal`, 520ms cubic-bezier(.22,1,.36,1) | Static content when coarse/reduced motion |

## Verification

- Figma reference screenshot: `docs/figma-verification/steps-toolkit-detail/2026-09-30/figma-reference-native.png`
- Local desktop screenshot: `docs/figma-verification/steps-toolkit-detail/2026-09-30/local-1440-2x.png`
- Local mobile screenshot: `docs/figma-verification/steps-toolkit-detail/2026-09-30/local-390-2x.png`
- Verification run: `2026-09-30` (`scripts/visual-qa.cjs steps-toolkit-detail /steps/toolkit-detail`)
- Desktop native-2x changed pixel ratio: `0.9003%`
- Desktop geometry: `1440 x 2909`, footer `y=2453.09`, `height=456`; no horizontal overflow or broken images
- Mobile geometry: `390px` width, no horizontal overflow or broken images; single-column article/index/footer
- Remaining differences: none
