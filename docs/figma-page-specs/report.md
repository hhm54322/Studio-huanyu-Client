# 海外就医可行性评估报告

- Route: `/report`
- Figma frames: `免费报告-输入信息`, `免费报告`, `免费报告-展开`, `付费报告`
- Node IDs: `2:1905`, `45:8457`, `47:12118`, `43:6175`
- Source baseline HTML: `docs/figma-source/report/input.clipboard.html`
- Additional state HTML: `docs/figma-source/report/free-report.clipboard.html`, `docs/figma-source/report/free-expanded.clipboard.html`, `docs/figma-source/report/paid-report.clipboard.html`
- Source baseline CSS: `docs/figma-source/report/report.parameters.css`
- Source asset manifest: `docs/figma-source/report/asset-manifest.json`
- Complete source inventories: `docs/figma-source/report/*.tree.json`, `*.layers.csv`, `*.texts.csv`, `*.assets.json`
- Source extraction run: 2026-09-24, Dev Mode through `browser-client` and the `iab` Figma design tab
- Desktop frames: `1440 x 2925`, `1440 x 8351.584`, `1440 x 4488.563`, `1440 x 2426`
- Mobile frame: no separate authored frame; responsive implementation verified at a real `390px` CSS viewport
- Status: verified

## Layer Mapping

The four ordered, recursive source inventories contain 3,076 Figma nodes. The locked HTML, tree, layer, text, and asset files preserve every source node, parent ID, sibling order, visibility, transform, size, Auto Layout property, text value, paint, stroke, radius, effect, constraint, and export setting. The table below records the implemented state roots and layout-bearing branches. Composite vector assets are mapped from their complete parent Frame and rendered from project-owned static SVGs.

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `2:1905` | 免费报告-输入信息 / Frame | root | `.collection-page` | `1440 x 2925`, vertical frame, white fill | Input state root |
| `2:1915` | Container / Frame | `2:1911` | `.collection-shell` | `896 x 2860`, padding `32px 16px`, gap `32px` | Main input column |
| `2:1918` | Container / Frame | `2:1915` | `.report-form-intro` | `864 x 122`, vertical gap `8px`, center aligned | Input heading |
| `2:1957` | Overlay+Border+OverlayBlur / Frame | `2:1915` | `.report-form-card` | `864 x 1712`, padding `32px`, gap `24px`, radius `16px` | Full report form |
| `2:2152` | Overlay+Border / Frame | `2:1915` | `.report-preview-card` | `864 x 898`, padding `32px`, gap `24px`, radius `16px` | Preview list |
| `45:8457` | 免费报告 / Frame | root | `.free-report-page` | `1440 x 8351.584`, vertical frame, `#F8FAFC` | Generated free report root |
| `45:8505` | toolbar / Frame | `45:8504` | `.report-toolbar` | `1120 x 66`, horizontal layout, center aligned | Back/download actions |
| `45:8530` | report metadata / Frame | `45:8504` | `.report-meta-card` | `1120 x 68`, padding `24px 32px`, radius `16px` | ID and generated time |
| `45:8560` | cost overview / Frame | `45:8504` | `.report-cost-card` | `1120 x 649`, padding `32px`, gap `20px`, radius `16px` | Cost chart and details |
| `45:8632` | hospital matching / Frame | `45:8504` | `.report-hospital-card` | `1120 x 538`, padding `32px`, gap `16px`, radius `16px` | Hospital state cards |
| `46:10809` | insurance section / Frame | `45:8504` | `.report-insurance-card` | `1120 x 398`, padding `33px`, gap `24px`, radius `16px` | Insurance selector/result |
| `47:12118` | 免费报告-展开 / Frame | root | `.free-report-page` with expanded state | `1440 x 4488.563`, vertical frame, `#F8FAFC` | Authored expanded state root |
| `47:12220` | expanded cost / Frame | `47:12165` | `.report-cost-card.is-expanded` | `1120 x 1341`, padding `32px`, gap `20px`, radius `16px` | Expanded cost detail |
| `47:12478` | expanded comparison / Frame | `47:12165` | `.report-country-comparison` | `1120 x 2323`, padding `32px`, gap `20px`, radius `16px` | Full comparison branch |
| `43:6175` | 付费报告 / Frame | root | `.pro-report-page` | `1440 x 2426`, vertical frame, `#0F172B` | Professional demo root |
| `43:6177` | main content / Frame | `43:6175` | `.pro-report-shell` | `992 x 2008`, padding-block `24px`, gap `40px`, centered | Main professional column |
| `43:6178` | heading / Frame | `43:6177` | `.pro-report-header` | `992 x 190`, vertical gap `10px` | Breadcrumb, badge, title, patient label |
| `43:6190` | metadata / Frame | `43:6189` | `.pro-report-meta-grid` | `992 x 68.5`, padding `16px`, radius `14px` | Four metadata values |
| `43:6204` | tabs / Frame | `43:6189` | `.pro-report-tabs` | `992 x 44`, horizontal gap `8px`, bottom padding `4px` | 13 authored tabs |
| `43:6297` | pathology / Frame | `43:6189` | `.pro-pathology-panel` | `992 x 573.5`, padding `32px`, gap `20px`, radius `14px` | Pathology and indicator cards |
| `43:6335` | packages / Frame | `43:6177` | `.pro-package-section` | `992 x 847.5`, vertical gap `32.25px` | Package heading, cards and CTA |
| `45:10663` | package cards / Frame | `43:6335` | `.pro-package-grid` | `992 x 506`, padding-block `16px`, gap `24px` | Two `336px` package cards |
| `43:6475` | upgrade CTA / Frame | `43:6335` | `.pro-upgrade-cta` | `992 x 224.5`, padding `32px`, gap `16px`, radius `14px` | Contact and email actions |
| `43:6504` | 返回重新上传 / Text | `43:6177` | `.pro-report-back` | `191 x 20`, Helvetica `14/20`, `#64748B` | Restores input state |
| `43:6688` | Footer / Frame | `43:6175` | `.pro-report-footer` | `1440 x 353`, horizontal padding `80px`; top `2073px` | Authored orange gradient footer |

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Input frame | `2:1905` | 1440 | 2925 | centered `896px` column | Intro, form, preview |
| Free report toolbar | `45:8505` | 1120 | 66 | horizontal actions | Top `24px` |
| Free report metadata | `45:8530` | 1120 | 68 | source vertical frame | Top `114px` |
| Free report cost | `45:8560` | 1120 | 649 | 32px inset | Top `206px` |
| Free report hospitals | `45:8632` | 1120 | 538 | 32px inset | Top `879px` |
| Free report insurance | `46:10809` | 1120 | 398 | 33px inset | Top `1441px` |
| Expanded cost | `47:12220` | 1120 | 1341 | 32px inset | Authored expanded state |
| Expanded comparison | `47:12478` | 1120 | 2323 | 32px inset | Top `1571px` |
| Paid main | `43:6177` | 992 | 2008 | centered column | Top `65px` |
| Paid footer | `43:6688` | 1440 | 353 | four columns | Top `2073px`; page ends at `2426px` |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Professional title | `43:6187` | Helvetica | `30px / 36px` | 700 | `#FFFFFF` |
| Demo badge | `43:6186` | Helvetica | `12px / 16px` | 400 | `#5EEAD4` |
| Professional metadata | `43:6191`-`43:6203` | Helvetica | `12px / 16px` | 400 / 500 | `#94A3B8` / `#CBD5E1` |
| Tab labels | `43:6213`, `43:6217`, `43:6225`, `43:6230`, `43:6236`, `43:6242`, `43:6249`, `43:6256`, `43:6264`, `43:6269`, `43:6275`, `43:6283`, `43:6290` | Helvetica | `12px / 16px` | 600 | source teal/slate states |
| Package heading | `43:6337` | Helvetica | `20px / 28px` | 700 | `#FFFFFF` |
| Package price | `43:6365`, `43:6419` | Helvetica | `32px / 36px` | 700 | `#FFFFFF` |
| Upgrade title | `43:6483` | Helvetica | `18px / 28px` | 700 | `#FFFFFF` |
| Back action | `43:6504` | Helvetica | `14px / 20px` | 400 | `#64748B` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Input form surface | `2:1957` | `864 x 1712` | `32px`; `24px` gap | `16px`, white overlay/border/blur |
| Input preview surface | `2:2152` | `864 x 898` | `32px`; `24px` gap | `16px`, white border |
| Free cost surface | `45:8560` | `1120 x 649` | `32px`; `20px` gap | `16px`, source gradient |
| Free hospital surface | `45:8632` | `1120 x 538` | `32px`; `16px` gap | `16px`, white |
| Paid pathology surface | `43:6297` | `992 x 573.5` | `32px`; `20px` gap | `14px`, translucent slate fill |
| Package card row | `45:10663` | `992 x 506` | `16px` vertical; `24px` gap | two centered `336px` cards |
| Upgrade CTA | `43:6475` | `992 x 224.5` | `32px`; `16px` gap | `14px`, teal gradient/border |

## Assets

The report states have no photographic image fill. Composite icons are mapped by their parent Frame node; vector descendants are recorded as children in the asset manifest and are not misidentified as separate icons.

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Input preview sparkles | `2:1925` (`2:1926`-`2:1929` vector descendants) | exact SVG, `16 x 16` | `public/images/figma/report/input-preview-sparkles.svg` |
| Professional demo document | `43:6180` (`43:6181`-`43:6185` vector descendants) | exact SVG, `24 x 24` | `public/images/figma/report/pro-demo-file.svg` |
| Pathology tab microscope | `43:6206` (`43:6207`-`43:6212` vector descendants) | exact SVG, `14 x 14` | `public/images/figma/report/pro-tab-pathology.svg` |
| Assessment tab activity | `43:6215` (`43:6216`) | exact SVG, `14 x 14` | `public/images/figma/report/pro-tab-assessment.svg` |
| Treatment tab stethoscope | `43:6219` (`43:6220`-`43:6224`) | exact SVG, `14 x 14` | `public/images/figma/report/pro-tab-treatment.svg` |
| Cost tab dollar | `43:6227` (`43:6228`-`43:6229`) | exact SVG, `14 x 14` | `public/images/figma/report/pro-tab-cost.svg` |
| Technology tab atom | `43:6232` (`43:6233`-`43:6235`) | exact SVG, `14 x 14` | `public/images/figma/report/pro-tab-technology.svg` |
| Countries tab globe | `43:6238` (`43:6239`-`43:6241`) | exact SVG, `14 x 14` | `public/images/figma/report/pro-tab-countries.svg` |
| Journey tab calendar | `43:6244` (`43:6245`-`43:6248`) | Dev Mode vector reconstruction, `14 x 14` | `public/images/figma/report/pro-tab-journey.svg` |
| Cases tab users | `43:6251` (`43:6252`-`43:6255`) | Dev Mode vector reconstruction, `14 x 14` | `public/images/figma/report/pro-tab-cases.svg` |
| Experts tab stethoscope | `43:6258` (`43:6259`-`43:6263`) | Dev Mode vector reconstruction, `14 x 14` | `public/images/figma/report/pro-tab-experts.svg` |
| Service tab headset | `43:6266` (`43:6267`-`43:6268`) | Dev Mode vector reconstruction, `14 x 14` | `public/images/figma/report/pro-tab-service.svg` |
| Risk tab triangle alert | `43:6271` (`43:6272`-`43:6274`) | Dev Mode vector reconstruction, `14 x 14` | `public/images/figma/report/pro-tab-risk.svg` |
| Hospitals tab building | `43:6277` (`43:6278`-`43:6282`) | exact SVG, `14 x 14` | `public/images/figma/report/pro-tab-hospitals.svg` |
| Process tab footprints | `43:6285` (`43:6286`-`43:6289`) | Dev Mode vector reconstruction, `14 x 14` | `public/images/figma/report/pro-tab-process.svg` |
| Professional section chevron | `43:6292` (`43:6293`) | exact SVG, `24 x 24` | `public/images/figma/report/pro-section-chevron.svg` |
| Pathology heading microscope | `43:6299` (`43:6300`-`43:6305`) | exact SVG, `24 x 24` | `public/images/figma/report/pro-pathology-heading.svg` |

Direct exports are byte-preserved. Figma returned `Failed to export` for six parent Frames; their ordered vector geometry, transforms, stroke values and Dev Mode thumbnails are locked in `paid-report.tree.json` and `tab-icon-node-map.json`. The application does not render Lucide components for any professional-report tab.

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Form validation | Existing report API and authored field states | blur/submit | immediate field feedback; no layout shift | same 48px+ controls |
| Report generation | Existing medical-report workflow | valid submit or route query | loading state then generated report | single-column report |
| Hospital details | Authored free-report state | card action | in-place state expansion | stacked cards |
| Free expanded state | node `47:12118` | details activation | content reveal without changing settled geometry | vertical flow |
| Professional demo | node `43:6175` | demo action | state replacement; exact paid resting frame | responsive dark report |
| Back action | node `43:6504` | click/keyboard | returns to collection state | same action |
| Section reveal/hover | Octagos restrained response | viewport/pointer | shared eased opacity/transform; no resting-layout drift | simplified; disabled for reduced motion |
| Reduced motion | accessibility contract | `prefers-reduced-motion: reduce` | transforms and animated scrolling disabled | complete static content |

## Verification

### Mobile correction (2026-10-10)

- Keep the authored desktop form and report states; up to 900px inputs/selects/textarea use 16px text to avoid iOS focus zoom. Professional report headers/body retain 20px side gutters; metadata wraps in natural-height rows, pathology cards grow with their content, packages use fluid columns and upgrade actions wrap. No report-generation behavior or API contract changes.
- Phone/tablet form and authored report states are checked by `scripts/mobile-responsive-qa.cjs`; screenshots and measured results are stored in ignored `artifacts/mobile-responsive-2026-10-10/`.

- Figma reference screenshots: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-report/input-reference.png`, `free-report-reference.png`, `free-expanded-reference.png`, `paid-report-reference-canvas.png`
- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/report/input-desktop-1440.png`
- Additional desktop states: `free-desktop-1440.png`, `free-expanded-desktop-1440.png`, `paid-desktop-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/report/input-mobile-390.png`
- Post-interaction-fix mobile evidence: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/interaction-audit/report-mobile-517.jpg`
- Additional mobile states: `free-mobile-390.png`, `free-expanded-mobile-390.png`, `paid-mobile-390.png`
- Professional Tab asset regression: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/report-fixes/pro-tabs-desktop-1440.png`, `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/report-fixes/pro-tabs-mobile-390.png`
- Desktop geometry: professional state rendered `1440 x 2425px` against the `1440 x 2426px` Figma frame; pathology, package row, CTA, back action, and footer start are within `0-2px` source raster rounding.
- Mobile geometry: all four states use a true `390px` CSS viewport; `scrollWidth === clientWidth`; no horizontal overflow.
- Interaction evidence: real API/report query path, professional demo open/close, professional-demo consultation entry, back-to-upload, form controls, and generated states exercised; page error list was empty.
- Verification run: 2026-09-24
- Figma reference: all four authored states reviewed against their corresponding source frame; no screenshot was used as a parameter source.
- Local desktop screenshot: final state captures generated after the last CSS change.
- Remaining differences: none
