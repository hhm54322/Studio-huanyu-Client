# 复杂病例详情模版

- Route: `/about`（由“复杂骨科 · 关节置换”的“阅读全文”打开）
- Figma frame: `复杂病例详情模版`
- Node ID: `484:2646`
- Source baseline HTML: `docs/figma-source/about/complex-detail.html`
- Source baseline CSS: `docs/figma-source/about/complex-detail-styles.txt`
- Source asset manifest: `docs/figma-source/about/complex-detail-assets.json`
- Desktop frame: `1440 x 1279px`
- Mobile frame: no separately authored mobile frame; responsive sheet verified at `390px`
- Status: verified

## Sections

| Section | Figma source | Vue target | Dev Mode values copied |
| --- | --- | --- | --- |
| Overlay | `484:2646` | `.complex-detail-backdrop` | width `1440`; padding-block `40`; black `50%`; blur `4px`; centered |
| Panel | root HTML panel | `.complex-detail-modal` | width `896`; padding `32`; radius `24`; vertical Auto Layout |
| Close | `484:2651` | `.complex-detail-close img` | `20 x 20`; control `36 x 36`; top/right `16` |
| Content order | root HTML ordered layers | six `.complex-detail-row` sections | title, disease, trust, scope, path, audience |
| Capability stack | root HTML ordered layers | `.complex-detail-capabilities` | vertical; card padding `24`; radius `24`; internal gap `40` |
| Solution stack | root HTML ordered layers | `.complex-detail-solutions` | vertical; padding `12px 24px`; radius `12` |
| Treatment path | root HTML ordered layers | `.complex-detail-path` | wrapping row; gap `12`; chips padding `12px 24px`; radius `12` |

## Typography

| Element | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | ---: | --- |
| Panel title | PingFang SC | `32px / 32px` | 600 | `#1E3A5F` |
| Section headings | PingFang SC | `24px / 24px` | 600 | `#1E3A5F` |
| Trust lead | PingFang SC | `20px / 28px` | 600 | `#1E3A5F` |
| Card headings | PingFang SC | `18px / 18px` | 600 | `#1E3A5F` |
| Body/card copy | PingFang SC | `16px / 24px` | 400 | `#4B5563` |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Close | `484:2651` | exact SVG, `20 x 20` | `public/images/figma/about-complex/icon-close.svg` |
| Robot-assisted surgery | `484:2669` | exact SVG, `32 x 32` | `public/images/figma/about-complex/icon-robot.svg` |
| ERAS | `484:2677` | exact SVG, `32 x 32` | `public/images/figma/about-complex/icon-eras.svg` |
| Cost accessibility | `484:2686` | exact SVG, `32 x 32` | `public/images/figma/about-complex/icon-cost-down.svg` |

## Prototype And Motion

| Interaction | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- |
| Open | Click `阅读全文` | overlay `220ms`; panel `380ms`, cubic-bezier `.22,1,.36,1`; translateY `18px` | full-width bottom sheet |
| Close | Close, Escape, backdrop click | reverse fade/translate | same controls; body scroll restored |
| Reduced motion | `prefers-reduced-motion: reduce` | transitions disabled | static sheet |

## Verification

- Figma reference: `484:2646` reviewed in Dev Mode; locked HTML and text styles checked against the implementation
- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/about-details/complex-desktop-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/about-details/complex-mobile-390.png`
- Interaction evidence: open, close, Escape, focus handoff, body scroll lock/unlock and zero horizontal overflow checked
- Verification run: 2026-09-24
- Remaining differences: none
