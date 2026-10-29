# 来华就医流程工具包

- Route: `/steps`
- Figma frames: `06来华就医全流程-出行中`, `07来华就医全流程-在华&回国`
- Node IDs: `204:5813`, `204:6013`
- Source baseline HTML: `docs/figma-source/steps/revision-2026-10-29/travel/baseline-2026-10-29.html`
- Source baseline CSS: `docs/figma-source/steps/revision-2026-10-29/travel/dev-styles-2026-10-29.css`
- Source asset manifest: `docs/figma-source/steps/revision-2026-10-29/travel/assets-2026-10-29.json`
- Additional locked source: `docs/figma-source/steps/revision-2026-10-29/aftercare/baseline-2026-10-29.html`, `docs/figma-source/steps/revision-2026-10-29/aftercare/dev-styles-2026-10-29.css`
- Source extraction run: 2026-10-29T00:06Z, current Figma Design export `寰宇云医 (11).fig`, live browser-client/IAB Layers and Dev Mode cross-check (200/200 + 177/177 nodes)
- Desktop frames: `1440 x 1275` and `1440 x 754`
- Responsive QA viewport: `390 x 844`; the two source frames are desktop compositions
- Status: verified

## Scope Boundary

The two source frames own the dark `#travel` and `#after` toolkit sections. The route hero, sticky phase navigation, pre-travel business flow, CTA, site header, footer, and consultation panel are existing business UI outside nodes `204:5813` and `204:6013`; they are preserved but are not represented as copied Figma nodes in this specification.

## Layer Mapping: 06 出行中

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `204:5813` | 06来华就医全流程-出行中 / Frame | frame root | `section#travel.toolkit-stage` | `1440 x 1275`, padding `40px 96px`, fill `#1E3A5F` | Authored section root |
| `204:5814` | Container | `204:5813` | `.toolkit-stage__layout` | width `1216px`, two columns `389.33px / 802px`, inter-column space `24.67px` | Centered content container |
| `204:5815`, `204:5816` | Left title containers | `204:5814`, `204:5815` | `.toolkit-stage__copy` | vertical group; title wrapper top padding `20px`; content vertically centered | Left column |
| `204:5817`, `204:5818` | Heading 2 / title text | `204:5816`, `204:5817` | `.toolkit-stage__copy h2` | PingFang SC `40/60`, weight `600`, `0.4px`, white | Exact two-line copy |
| `204:5819`, `204:5820` | Description container / text | `204:5816`, `204:5819` | `.toolkit-stage__copy p` | width `283px`, top gap `16px`, PingFang SC `16/24`, white `70%` | Exact copy |
| `204:5821`, `204:5822` | Right content / heading group | `204:5814`, `204:5821` | `.toolkit-stage__content`, `.toolkit-stage__heading` | width `802px`; right content fills `1083px` inner height | Right column |
| `204:5823`, `204:5824` | Heading 2 / `02 出行中 · 落地办理工具` | `204:5822`, `204:5823` | `.toolkit-stage__heading h3` | PingFang SC `32/32`, weight `600`, `0.4px`, white | Exact copy |
| `204:5825`, `204:5826` | Paragraph / stage description | `204:5822`, `204:5825` | `.toolkit-stage__heading p` | top gap `16px`, PingFang SC `16/24`, white `70%` | Exact copy |
| `204:5827` | Card grid container | `204:5821` | `.toolkit-stage__cards` | width `802px`, columns `389px 389px`, gap `24px`, top gap `48px` | Three visual rows; fifth card left |
| `204:5828` | 免签国家清单 card | `204:5827` | `travelTools[1]` article | `389 x 305`, padding `24px`, radius `24px`, fill `#0F213E` | Visual grid column 2, row 1 |
| `204:5829`, `204:5830` | Frame / Vector | `204:5828`, `204:5829` | `steps-travel-visa-free.svg` | `32 x 32`, cyan `#52E8FF` | Exact Figma SVG export |
| `204:5831`, `204:5832`, `204:5833` | Body / Heading 3 / title text | `204:5828`, `204:5831`, `204:5832` | card body and `h4` | title `24/24`, weight `600`, white | Exact copy |
| `204:5834`, `204:5835` | Copy container / body text | `204:5831`, `204:5834` | card body `p` | top gap `16px`, `16/24`, white `70%` | Exact copy |
| `204:5836` | 签证申请清单 card | `204:5827` | `travelTools[0]` article | `389 x 304`, padding `24px`, radius `24px`, fill `#0F213E` | Visual grid column 1, row 1; desktop route `/steps/toolkit-detail?article=visa`; mobile remains disabled |
| `204:5837`, `204:5838`, `204:5839` | Frame / two Vectors | `204:5836`, `204:5837` | `steps-travel-visa.svg` | `32 x 32`, cyan `#52E8FF` | Exact Figma SVG export |
| `204:5840`, `204:5841`, `204:5842` | Body / Heading 3 / title text | `204:5836`, `204:5840`, `204:5841` | card body and `h4` | title `24/24`, weight `600`, white | Exact copy |
| `204:5843`, `204:5844` | Copy container / body text | `204:5840`, `204:5843` | card body `p` | top gap `16px`, `16/24`, white `70%` | Exact copy |
| `204:5845`, `204:5846`, `204:5847` | Action container / Paragraph / action text | `204:5840`, `204:5845`, `204:5846` | `RouterLink` text | top gap `16px`, `16/16`, weight `500`, `#DD6B20` | `阅读全文` |
| `204:5848`, `204:5849`, `204:5850` | Icon / two Vectors | `204:5845`, `204:5848` | `steps-toolkit-arrow.svg` | `16 x 16`, `1.5px` orange strokes | Exact Figma SVG export |
| `204:5851` | 药品入境规定 card | `204:5827` | `travelTools[2]` article | `389 x 305`, padding `24px`, radius `24px`, fill `#0F213E` | Visual grid column 1, row 2 |
| `204:5852`, `204:5853` | Icon / Vector | `204:5851`, `204:5852` | `steps-travel-medicine.svg` | `32 x 32`, `2px` cyan stroke | Exact Figma SVG export |
| `204:5854`, `204:5855`, `204:5856` | Body / Heading 3 / title text | `204:5851`, `204:5854`, `204:5855` | card body and `h4` | title `24/24`, weight `600`, white | Exact copy |
| `204:5857`, `204:5858` | Copy container / body text | `204:5854`, `204:5857` | card body `p` | top gap `16px`, `16/24`, white `70%` | Exact copy |
| `204:5859` | 家属陪同攻略 card | `204:5827` | `travelTools[3]` article | `389 x 305`, padding `24px`, radius `24px`, fill `#0F213E` | Visual grid column 2, row 2 |
| `204:5860`, `204:5861` | Icon / Vector | `204:5859`, `204:5860` | `steps-travel-family.svg` | `32 x 32`, `2px` cyan stroke | Exact Figma SVG export |
| `204:5862`, `204:5863`, `204:5864` | Body / Heading 3 / title text | `204:5859`, `204:5862`, `204:5863` | card body and `h4` | title `24/24`, weight `600`, white | Exact copy |
| `204:5865`, `204:5866` | Copy container / body text | `204:5862`, `204:5865` | card body `p` | top gap `16px`, `16/24`, white `70%` | Exact copy |
| `204:5867` | 穆斯林患者实操手册 card | `204:5827` | `travelTools[4]` article | `389 x 305`, padding `24px`, radius `24px`, fill `#0F213E` | Visual grid column 1, row 3 |
| `204:5868`, `204:5869`, `204:5870` | Frame / two Vectors | `204:5867`, `204:5868` | `steps-travel-muslim.svg` | `32 x 32`, cyan `#52E8FF` | Exact Figma SVG export |
| `204:5871`, `204:5872`, `204:5873` | Body / Heading 3 / title text | `204:5867`, `204:5871`, `204:5872` | card body and `h4` | title `24/24`, weight `600`, white | Exact copy |
| `204:5874`, `204:5875` | Copy container / body text | `204:5871`, `204:5874` | card body `p` | top gap `16px`, `16/24`, white `70%` | Exact copy |

Nodes after `204:5875` are off-frame content outside the visible source composition and are not rendered in this section.

## Layer Mapping: 07 在华&回国

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `204:6013` | 07来华就医全流程-在华&回国 / Frame | frame root | `section#after.toolkit-stage--after` | `1440 x 754`, padding `40px 96px`, fill `#1E3A5F` | Authored section root |
| `204:6014` | Container | `204:6013` | `.toolkit-stage__layout` | width `1216px`, height `424px`, columns `389.33px / 802px`, centered in `562px` content area | Main row |
| `204:6015`, `204:6016` | Left title containers | `204:6014`, `204:6015` | `.toolkit-stage__copy` | title wrapper top padding `20px`; aligned to row top | Left column |
| `204:6017`, `204:6018` | Heading 2 / title text | `204:6016`, `204:6017` | `.toolkit-stage__copy h2` | PingFang SC `40/60`, weight `600`, `0.4px`, white | Exact two-line copy |
| `204:6019`, `204:6020` | Description container / text | `204:6016`, `204:6019` | `.toolkit-stage__copy p` | width `283px`, top gap `16px`, `16/24`, white `70%` | Exact copy |
| `204:6021`, `204:6022` | Right content / heading group | `204:6014`, `204:6021` | `.toolkit-stage__content`, `.toolkit-stage__heading` | width `802px`, height `424px` | Right column |
| `204:6023`, `204:6024` | Heading 2 / `03 在华&回国 · 就诊随访工具` | `204:6022`, `204:6023` | `.toolkit-stage__heading h3` | PingFang SC `32/32`, weight `600`, `0.4px`, white | Exact copy |
| `204:6025`, `204:6026` | Paragraph / stage description | `204:6022`, `204:6025` | `.toolkit-stage__heading p` | top gap `16px`, `16/24`, white `70%` | Exact copy |
| `204:6027` | Card grid container | `204:6021` | `.toolkit-stage__cards` | width `802px`, columns `389px 389px`, gap `24px`, top gap `48px` | One visual row |
| `204:6028` | 就医步骤与就诊流程 card | `204:6027` | `afterTools[0]` article | `389 x 304`, padding `24px`, radius `24px`, fill `#0F213E` | Desktop article `/steps/toolkit-detail?article=steps-flow`; mobile remains disabled |
| `204:6029`, `204:6030`, `204:6031`, `204:6032`, `204:6033` | Frame / Group 618 / three Vectors | `204:6028`, `204:6029`, `204:6030` | `steps-aftercare-path.svg` | `32 x 32`, `1.5px` cyan strokes | Exact Figma SVG export |
| `204:6034`, `204:6035`, `204:6036` | Body / Heading 3 / title text | `204:6028`, `204:6034`, `204:6035` | card body and `h4` | title `24/24`, weight `600`, white | Exact copy |
| `204:6037`, `204:6038` | Copy container / body text | `204:6034`, `204:6037` | card body `p` | top gap `16px`, `16/24`, white `70%` | Exact copy |
| `204:6039`, `204:6040`, `204:6041` | Action container / Paragraph / action text | `204:6034`, `204:6039`, `204:6040` | action button text | top gap `16px`, `16/16`, weight `500`, `#DD6B20` | `阅读全文` |
| `204:6042`, `204:6043`, `204:6044` | Icon / two Vectors | `204:6039`, `204:6042` | `steps-toolkit-arrow.svg` | `16 x 16`, `1.5px` orange strokes | Exact Figma SVG export |
| `204:6045` | 国际报告与回国随访 card | `204:6027` | `afterTools[1]` article | `389 x 304`, padding `24px`, radius `24px`, fill `#0F213E` | Visual grid column 2 |
| `204:6046`, `204:6047` | Frame / Vector | `204:6045`, `204:6046` | `steps-aftercare-followup.svg` | `32 x 32`, cyan `#52E8FF` | Exact Figma SVG export |
| `204:6048`, `204:6049`, `204:6050` | Body / Heading 3 / title text | `204:6045`, `204:6048`, `204:6049` | card body and `h4` | title `24/24`, weight `600`, white | Exact copy |
| `204:6051`, `204:6052` | Copy container / body text | `204:6048`, `204:6051` | card body `p` | top gap `16px`, `16/24`, white `70%` | Exact copy |

Nodes after `204:6052` are off-frame content outside the visible source composition and are not rendered in this section.

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| 出行中工具包 | `204:5813` | `1440px` | `1275px` | `1216px`; `389.33px + 24.67px + 802px` | Outer padding `40px 96px` |
| 在华&回国工具包 | `204:6013` | `1440px` | `754px` | `1216px`; `389.33px + 24.67px + 802px` | `424px` content row centered vertically |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Toolkit title | `204:5818`, `204:6018` | PingFang SC | `40px / 60px` | 600 | `#FFFFFF`, `0.4px` spacing |
| Toolkit description | `204:5820`, `204:6020` | PingFang SC | `16px / 24px` | 400 | `rgba(255,255,255,.70)` |
| Stage heading | `204:5824`, `204:6024` | PingFang SC | `32px / 32px` | 600 | `#FFFFFF`, `0.4px` spacing |
| Stage description | `204:5826`, `204:6026` | PingFang SC | `16px / 24px` | 400 | `rgba(255,255,255,.70)` |
| Card title | `204:5833`, `204:5842`, `204:5856`, `204:5864`, `204:5873`, `204:6036`, `204:6050` | PingFang SC | `24px / 24px` | 600 | `#FFFFFF` |
| Card copy | `204:5835`, `204:5844`, `204:5858`, `204:5866`, `204:5875`, `204:6038`, `204:6052` | PingFang SC | `16px / 24px` | 400 | `rgba(255,255,255,.70)` |
| Action | `204:5847`, `204:6041` | PingFang SC | `16px / 16px` | 500 | `#DD6B20` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Travel card grid | `204:5827` | `802 x 963px` | `24px` row/column gap; `48px` from heading | none |
| Travel cards | `204:5828`, `204:5836`, `204:5851`, `204:5859`, `204:5867` | `389 x 305px` (`204:5836` is `304px`) | `24px` | `24px`; `#0F213E`; no border/effect |
| Aftercare card grid | `204:6027` | `802 x 304px` | `24px` column gap; `48px` from heading | none |
| Aftercare cards | `204:6028`, `204:6045` | `389 x 304px` | `24px` | `24px`; `#0F213E`; no border/effect |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| 免签国家清单 icon | `204:5829`, `204:5830` | SVG `32 x 32` | `/public/images/figma/steps-travel-visa-free.svg` |
| 签证申请清单 icon | `204:5837`, `204:5838`, `204:5839` | SVG `32 x 32` | `/public/images/figma/steps-travel-visa.svg` |
| 药品入境规定 icon | `204:5852`, `204:5853` | SVG `32 x 32` | `/public/images/figma/steps-travel-medicine.svg` |
| 家属陪同攻略 icon | `204:5860`, `204:5861` | SVG `32 x 32` | `/public/images/figma/steps-travel-family.svg` |
| 穆斯林患者实操手册 icon | `204:5868`, `204:5869`, `204:5870` | SVG `32 x 32` | `/public/images/figma/steps-travel-muslim.svg` |
| Travel action arrow | `204:5848`, `204:5849`, `204:5850` | SVG `16 x 16` | `/public/images/figma/steps-toolkit-arrow.svg` |
| 就医步骤与就诊流程 icon | `204:6029`, `204:6030`, `204:6031`, `204:6032`, `204:6033` | SVG `32 x 32` | `/public/images/figma/steps-aftercare-path.svg` |
| Aftercare action arrow | `204:6042`, `204:6043`, `204:6044` | SVG `16 x 16` | `/public/images/figma/steps-toolkit-arrow.svg` |
| 国际报告与回国随访 icon | `204:6046`, `204:6047` | SVG `32 x 32` | `/public/images/figma/steps-aftercare-followup.svg` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Card reveal | Octagos section-entry vocabulary | IntersectionObserver adds `.is-visible` | Global reveal `520ms cubic-bezier(.22,1,.36,1)` | Same reveal; fully visible without observer |
| Card hover lift | Octagos restrained card response | Pointer hover | `450ms cubic-bezier(.22,1,.36,1)`, `translateY(-7px)` | No hover dependency |
| Action arrow response | Octagos directional affordance | Link/button hover | `250ms ease`, `translateX(4px)` | Static arrow |
| Visa article | Existing Figma article entry | Activate `阅读全文` | Vue Router to `/steps/toolkit-detail?article=visa` | Remains disabled until mobile design confirmed |
| Journey article | Existing Figma article entry | Activate `阅读全文` | Vue Router to `/steps/toolkit-detail?article=steps-flow` | Remains disabled until mobile design confirmed |
| Reduced motion | Accessibility contract | `prefers-reduced-motion: reduce` | no card/arrow transition or hover transform | Content visible, transform none |

## Verification

### Current source and combined scroll composition — 2026-10-29

- Current source comparison `artifacts/figma-source-gate/steps-current-2026-10-29.json` covers `204:5813`, `204:6013` and the current toolkit detail frame `143:3058`; all registered scopes are unchanged against the current official export.
- Complete current source records, settled Dev Mode code, exact asset manifest, baseline HTML/CSS and node-to-code mapping are in `docs/figma-source/steps/revision-2026-10-29/`. Hidden/off-frame authored nodes remain recorded and are intentionally not rendered.
- The product composition uses one `.toolkit-stage__copy` sticky element and concatenates the two source right columns. `02` and `03` content remain in source order; the left copy does not duplicate when the right column crosses the stage boundary.
- Current local evidence: `artifacts/figma-steps-2026-10-29/travel-development-local.png`, `artifacts/figma-steps-2026-10-29/aftercare-development-local.png`, and `artifacts/figma-steps-2026-10-29/development-qa.json`. Source-frame pixel comparisons are `0.750%` travel and `0.362%` aftercare; both are below the 1% acceptance threshold and all rendered node selectors are present.
- Desktop behavior evidence covers 1024/1440/1920 widths: one sticky title, zero horizontal overflow, no broken images, right-stage scroll boundaries, keyboard article entry and history return. Reduced motion leaves the authored content visible without transform transitions.

### 2026-10-22 签证文章桌面入口

- 仅接入原有`204:5845–5850`阅读全文到`/steps/toolkit-detail?article=visa`，不使用无独立设计页的`/visa`，不改卡片样式或源几何。
- `scripts/toolkit-entry-qa.cjs`验证改动前后卡片截图/尺寸一致，1024/1440/1920桌面点击、键盘进入、历史返回及文章返回通过；开发和生产preview均通过。
- 390px与900px保持旧禁用状态，未开始移动端UI更新；证据在`artifacts/figma-toolkit-2026-10-22/entries/`。本记录只验收入口，不取代全页新一轮Figma回归。

### 2026-10-22 就医步骤与就诊流程桌面入口

- 现有卡片`204:6028`及阅读全文`204:6039–6044`接到`/steps/toolkit-detail?article=steps-flow`；不是咨询面板，也不跳无独立设计页。只启用原有操作，不更改静态几何。
- `scripts/toolkit-entry-qa.cjs --article=steps-flow`在开发及生产preview验证入口启用前后卡片截图/几何差异0%，1024/1440/1920桌面点击、键盘进入、历史返回及文章返回通过。390/900px维持禁用，resize恢复桌面链接。
- 证据在`artifacts/figma-toolkit-2026-10-22/entries/steps-flow/`；正文逐层规格为`steps-toolkit-steps-flow.md`。此处只验收新增入口，不将历史整页截图当作当前整页复核。

### Responsive regression (2026-10-10)

- Retain the authored toolkit stage geometry; allow visible overflow at the static stage wrapper so the tight source title line-height does not crop glyphs. Card masks and the mobile natural-height layout remain intact.
- Phone/tablet/desktop screenshots and actual scroll checks are generated under ignored `artifacts/mobile-responsive-2026-10-10/` by `scripts/mobile-responsive-qa.cjs`.

- Figma references: `/Users/hhm/Downloads/06来华就医全流程-出行中 (1).png`, `/Users/hhm/Downloads/07来华就医全流程-在华&回国 (1).png`
- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/steps/travel-desktop-1440.png`
- Final desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/steps/after-desktop-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/steps/mobile-390x844.png`
- Desktop geometry check: card edges match the 2x Figma exports at `x=526`, travel `y=216`, aftercare `y=285`; rendered section sizes are `1440 x 1275` and `1440 x 754`
- Mobile geometry check: viewport and document width both `390px`; all travel cards are `350px`; no horizontal overflow
- Interaction check: `/visa` navigation, consultation panel, phase hash, hover lift, and reduced-motion fallback exercised in Playwright
- Verification run: 2026-09-29; latest source-frame crops measured `0.904%` for travel and `0.818%` for aftercare at 2x, after removing the two browser locator raster rows. The visa card uses the authored `304px + 80px` gap and other travel cards use `305px`.
- Remaining differences: none


### 2026-10-29 exact desktop toolkit cards

The seven desktop cards use the complete already-extracted Design subtrees (`204:5828/5836/5851/5859/5867`, `204:6028/6045`) from `trust/revision-2026-10-29/{travel,aftercare}/source-tree-2026-10-29.json`. This copies all text line/glyph baselines, native fractional geometry, icons and child hierarchy without deriving a CSS offset from screenshots. All 377 native nodes retain their original extraction and immutable locks. The updated concrete desktop mapping is `steps/revision-2026-10-29/{travel,aftercare}/runtime-node-to-code-2026-10-29.json`; it supplements, rather than overwrites, the historical map. Original narrow cards remain unchanged while the mobile design is frozen. The continuous two-stage layout and one sticky title remain the product composition. Only authored visa and steps-flow links are enabled.
