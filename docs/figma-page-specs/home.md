# 首页

- Route: `/`
- Figma frame: `01寰宇云医 - 首页`
- Node ID: `143:45`
- Source baseline HTML: `docs/figma-source/home/frame-2026-09-28.html`
- Source baseline CSS: `docs/figma-source/home/styles-2026-09-28.txt`
- Source asset manifest: `docs/figma-source/home/assets.json`
- Source extraction run: `2026-09-29; layers-2026-09-29.json; dev-mode-2026-09-29.json; node-to-code-2026-09-29.json`; independent Banner source HTML/CSS is stored as `banner-01`, `banner-02`, `banner-03` under `docs/figma-source/home/`.
- Desktop frame: `1440 x 8806px`
- Mobile frame: responsive adaptation of the desktop source; no separate mobile frame exists in this Figma page
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:45` | `01寰宇云医 - 首页` frame | — | `.home-page` | `1440 x 8806px`, vertical hug | Source frame |
| `143:47` | `Main Content` auto-layout | `143:46` | `.home-page` section flow | `1440 x 8350px`, vertical auto-layout | Header/footer remain shell-owned |
| `143:48` | Hero section | `143:47` | `.home-hero` | `1440 x 754px`, fixed stage | `143:52` image, carousel state |
| `143:54` | Hero eyebrow | `143:53` | `.home-hero__eyebrow` | 14px icon, 10px/16px padding, 10px gap, 9999px radius | Icon asset `Frame.svg` (`143:56`) |
| `143:56` | Hero eyebrow icon | `143:55` | `.home-hero__eyebrow img` | `14 x 14px`, source vector copied | `/public/images/figma/home-icons/Frame.svg` |
| `143:81` | Journey flow section | `143:47` | `.home-flow` | `1440 x 516px`, padding `96px` | Four step links |
| `143:128` | China advantages section | `143:47` | `.why-overview` | `1440 x 1208px`, `#F5F6F7` | Sticky rail + 6 cards |
| `143:151` | Advantage card grid | `143:150` | `.why-overview__grid` | 2 columns x 3 rows, `389 x 280px`, 24px gap | Six card mappings below |
| `143:152` | Medical level icon | `143:151` | `.why-overview article:nth-child(1) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Icon-19.svg` |
| `143:167` | Cost advantage icon | `143:166` | `.why-overview article:nth-child(2) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Icon-17.svg` |
| `143:176` | Language support icon | `143:175` | `.why-overview article:nth-child(3) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Frame-3.svg` |
| `143:184` | Expert access icon | `143:183` | `.why-overview article:nth-child(4) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Frame-4.svg` |
| `143:192` | Integrative care icon | `143:191` | `.why-overview article:nth-child(5) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Frame-1.svg` |
| `143:201` | Visa convenience icon | `143:200` | `.why-overview article:nth-child(6) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Frame-2.svg` |
| `143:209` | Patient story section | `143:47` | `.patient-story` | `1440 x 720px` | Image fill is child `143:218` |
| `143:218` | Patient story image panel | `143:217` | `.patient-story__image` | `389.33 x 400px`, 24px radius, image `154.11% 100%` at `-127.992px 0px` | `/public/images/figma/patient-story.png` |
| `143:377` | Global care section | `143:47` | `.care-section` | `1440 x 544px` | Three route cards |
| `143:413` | Team section | `143:47` | `.team-section` | `1440 x 596px` | Four portrait instances |
| `143:450` | Medical data section | `143:47` | `.data-section` | `1440 x 740px` | Radar and cost chart |
| `143:671` | Hospital section | `143:47` | `.hospital-section` | `1440 x 703px` | Four hospital image cards |
| `143:681` | Shanghai hospital image | `143:680` | `.hospital-grid__image` item 1 | `286 x 286px`, 24px radius, image `126.6% 100%` at `-70.681px 0.172px` | `/public/images/figma/hospital-shanghai-design.png` |
| `143:688` | Beijing hospital image | `143:687` | `.hospital-grid__image` item 2 | `286 x 286px`, 24px radius, image `133.4% 100%` at `-80.805px 0px` | `/public/images/figma/hospital-beijing-design.png` |
| `143:695` | Guangzhou hospital image | `143:694` | `.hospital-grid__image` item 3 | `286 x 286px`, 24px radius, image `168.881% 126.408%` at `-84.373px -0.369px` | `/public/images/figma/hospital-guangzhou-design.jpg` |
| `143:702` | Huaxi hospital image | `143:701` | `.hospital-grid__image` item 4 | `286 x 286px`, 24px radius, image `224.452% 166.86%` at `-178.054px 0px` | `/public/images/figma/hospital-huaxi-design.png` |
| `143:708` | Expert section | `143:47` | `.expert-section` | `1440 x 667px` | Three authored tab states |
| `143:827` | Strength section | `143:47` | `.strength-section` | `1440 x 699px` | `143:827` image instance |
| `143:847` | Partner section | `143:47` | `.partners-section` | `1440 x 791px` | `143:847` matrix marquee |
| `143:987` | Final CTA section | `143:47` | `.home-cta` | `1440 x 412px` | Three CTA actions |
| `143:1024` | Footer | `143:45` | `PatientFooter.vue` | `1440 x 456px` | Shared shell component |
| `484:1377` | Header | `143:46` | `PatientHeader.vue` | `1440 x 64px` overlay | Current source instance, replaces the old `143:1101` |

The complete recursive mapping is `docs/figma-source/home/node-to-code-2026-09-29.json`: 1103 source nodes, including 127 hidden nodes. `dev-mode-2026-09-29.json` contains the node-linked source properties. The table above is a section index, not a substitute for the complete mapping.

### Added state-frame mappings

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:4035` | `为什么来中国就医-01` frame | `143:45` | `.why-detail-modal` state 01 | `1440 x 1106`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4220` | `为什么来中国就医-02` frame | `143:45` | `.why-detail-modal` state 02 | `1440 x 1068`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4316` | `为什么来中国就医-03` frame | `143:45` | `.why-detail-modal` state 03 | `1440 x 1068`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4084` | `为什么来中国就医-04` frame | `143:45` | `.why-detail-modal` state 04 | `1440 x 952`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4127` | `为什么来中国就医-05` frame | `143:45` | `.why-detail-modal` state 05 | `1440 x 889`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4167` | `为什么来中国就医-06` frame | `143:45` | `.why-detail-modal` state 06 | `1440 x 754`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:1150` | `我们的实力-02` frame | `143:45` | `.strength-layout__image` state 02 | `1440 x 699`, section source frame | `/public/images/figma/home-source/strength-02-art-exact.webp` |
| `143:1170` | `我们的实力-03` frame | `143:45` | `.strength-layout__image` state 03 | `1440 x 699`, section source frame | `/public/images/figma/home-source/strength-03-art-exact.webp` |

### Partner marquee correction (2026-09-30)

- The previous `143:853` viewport bitmap included the side gradients and was not a valid looping asset.
- The replacement baseline is `docs/figma-source/home/partners-baseline.html`; complete group/card/image geometry and image hashes are in `partners-parameters.json` (64 cards, 130 descendants). Native geometry is paired with the existing node-linked Dev Mode CSS, not inferred from screenshots.
- `143:854` is rendered at `3546 x 472px`; a 24px inter-cycle gap continues the authored card spacing. Two 3570px tiles cover the viewport throughout the loop. Desktop origin is `-1002px` at 1440px viewport width.
- `143:985` maps to `.partners-marquee::before`, and `143:986` maps to `::after`: fixed 160px gradient layers, `#F5F6F7`, with 25%/75% opaque stops. Neither layer moves with the logos.
- The old child mappings to `.partners-marquee img:first-child` are retained as flattened-asset ownership; their actual parameters are now rendered in the full group asset instead of a cropped viewport screenshot.
- Narrow screens use a 1440 x 472 crop of the same Figma group (`partners-mobile-track.webp`) at `viewport / 1440`, while desktop uses the complete 3546px group. Both resources are unfaded; repeating the old faded viewport asset is forbidden. GPU transforms and integer-pixel tile widths prevent subpixel loop seams. Hover pauses; reduced motion holds the Figma source position; the animation returns to an identical cycle boundary.
- Release raster compression uses quality-90 WebP and a 2560px photo cap; alpha images and text/logo matrices keep native dimensions. Original Figma assets remain unchanged. Prebuild generates `.optimized.webp` companions and a manifest; Vite uses those actual existing public files before bundle hashing. Production uses independent WebP URLs because some CDN nodes ignore query strings on cached PNG URLs. Nginx also retains `Accept` negotiation and original-file fallback for legacy URLs.

### Homepage interaction corrections (2026-09-30)

- `143:128` advantage cards preserve the six-card Figma order and open a same-page detail dialog on the whole card. Hover/focus reveals `了解更多`, while click, Enter, and Space open the same state. Escape, backdrop click, focus trapping, and focus restoration are implemented.
- `143:81` journey nodes `01` through `04` are rendered as one connected four-node track with the Figma 80px circles, 20px warm outline, and 185px dashed connectors. The restored flow section keeps the source copy and uses same-page smooth scrolling to `#process-stage-01` through `#process-stage-04`; the left rail then updates to the selected stage.
- `143:827` strength content is a scroll-driven authored-state section. The section title remains fixed in the sticky frame; the left copy is a continuous vertical track of the three authored `596 x 380px` blocks, while the right artwork cross-fades at the three scroll ranges. Desktop uses the Octagos-style pinned reading stage; mobile releases the sticky frame and keeps all three text blocks readable; reduced motion removes the image transition while preserving the scroll sequence.
- Evidence after this change: local desktop QA verified the six-card dialog, Escape close, four-node flow, and strength state transition at `http://127.0.0.1:5173/`. Build and `audit:figma` passed on 2026-10-01.
- Flow restoration evidence (2026-10-01): `docs/figma-verification/home/2026-10-01-process/flow-desktop.png` and `flow-geometry.json`; `.home-flow` is `1440 x 516px`, each step is `285 x 176px`, and `scripts/home-interaction-qa.cjs` verifies all four click-to-stage scroll targets at desktop plus mobile overflow.

### Advantage dialog DOM baseline (2026-10-01)

- The six advantage dialogs are implemented as Vue DOM/CSS, not as exported board images. Figma source frames used for node/content verification are `为什么来中国就医-01` (`143:4035`, `1440 x 1106`), `-02` (`143:4220`, `1440 x 1068`), `-03` (`143:4316`, `1440 x 1068`), `-04` (`143:4084`, `1440 x 952`), `-05` (`143:4127`, `1440 x 889`), `-06` (`143:4167`, `1440 x 754`).
- Shared frame parameters: `Container` overlay `rgba(0,0,0,.50)` + `backdrop-filter: blur(4px)`, centered white modal, 24px radius, 32px internal padding at desktop, and responsive scroll on mobile. Dialog states map to structured `whyDetails` records with explicit Figma copy, table rows, card layout and icon components.
- State layouts: 01 `cards-2x2`; 02 `table-cards` with a five-row fee table and two cards; 03 `table-cards` with a five-row accompaniment table and two cards; 04 `wide-cards` with one wide card and two lower cards; 05 `wide-cards` with one wide card and two lower cards; 06 `cards-3` with three independent cards.
- Figma panel measurements recorded from Dev Mode: all states use `896px` outer width, `32px` panel padding and `24px` radius. Inner content heights are 876px (01), 924px (02), 924px (03), 808px (04), 745px (05), and 432px (06); the implementation preserves these state-specific composition proportions while allowing viewport scrolling on small screens.
- DOM screenshot evidence: `docs/figma-verification/home/2026-10-01-why-dom/why-01-desktop.png`, `why-02-desktop.png`, and `why-06-mobile.png`. The evidence checks the rendered DOM against the corresponding Figma source-frame composition; no `.why-detail-modal__source` image is present.
- The strength section now has three authored states: main source `143:827`, state 02 `143:1150`, and state 03 `143:1170`. The source title container is `1216 x 79px`; the content container is `1216 x 380px` with `48px` top padding, two `596 x 380px` columns, and `24px` column gap. The left track is `596 x 1140px` (three consecutive `380px` blocks). State 01 text nodes are `143:836`/`143:837` and `143:838`/`143:840`; state 02 and 03 repeat the same authored hierarchy in their own source frames. The right artwork node is `143:842` (`596 x 409px`, `28px` radius); all three states use compressed Figma image exports in `/public/images/figma/home-source/strength-01-art-exact.webp`, `strength-02-art-exact.webp`, and `strength-03-art-exact.webp`.
- Journey nodes are same-page anchors (`#why-overview`, `#data-section`, `#care-section`, `#home-cta`) and use smooth scrolling with hash updates. They no longer navigate to another route.
- This correction supersedes the previous hand-authored dialog copy and route-link behavior. Verification evidence: `docs/figma-verification/home/2026-10-01-why-01-local.png`, `docs/figma-verification/home/2026-10-01-flow-anchor-local.png`; `scripts/home-interaction-qa.cjs` passed on 2026-10-01.

### Strength scroll verification (2026-10-01)

- Desktop frame evidence: `docs/figma-verification/home/2026-10-01-strength-01-frame.png`, `2026-10-01-strength-02-frame.png`, and `2026-10-01-strength-03-frame.png` at `1440 x 699px`.
- Mobile evidence: `docs/figma-verification/home/2026-10-01-strength-390-final.png`; document width remains `390px` with all three text/image blocks readable.
- Figma source comparisons measured normalized mean pixel error `0.95%` for 01 (the supplied 01 evidence crop), `0.51%` for 02, and `0.53%` for 03; the title and content coordinates remain fixed while the left track translates `0 -> 760px` and the right image cross-fades.
- Remaining differences: none observed in the verified desktop/mobile states.

## Page Structure

- `Body` (`143:46`): `1440px` fill x `8806px` hug.
- `Main Content` (`143:47`): vertical flow, `1440px` fill x `8350px` hug.
- `Footer` (`143:1024`): `1440px` fill x `456px` hug.
- `Header` (`484:1377`): `1440 x 64px` hug; it overlays the page and does not add to the body height.
- Header container (`484:1378`): horizontal flow, `1280 x 64px`, max-width `1280px`, `space-between`, horizontal padding token `item spacing/m`.
- Header logo link (`484:1379`): `111 x 32px` hug.

## Sections

All non-hero sections use vertical Auto Layout and `96px` top/bottom padding unless noted otherwise.

| Order | Section | Node ID | Width | Height | Container/Grid | Background / Notes |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | Hero / patient voice | `143:48` | 1440 | 754 | Fixed-height stage | Hero container `143:50` has 80px left/right padding |
| 2 | 来华就医流程 | `143:81` | 1440 | 516 | `1216px` content | White, 1px bottom border |
| 3 | 为什么来中国就医 | `143:128` | 1440 | 1208 | 220px rail + 802px content | `#F5F6F7`, fixed height |
| 4 | 患者故事 | `143:209` | 1440 | 720 | `1216px` content | `#FFFFFF` |
| 5 | 就医全程陪伴 | `143:377` | 1440 | 544 | `1216px` content, 3-card grid, `24px` gap | `#F5F6F7` |
| 6 | 陪你走全程的人 | `143:413` | 1440 | 596 | `1216px` content, 4-card grid, `24px` gap | `#FFFFFF` |
| 7 | 中国医疗数据优势 | `143:450` | 1440 | 740 | `1216px` content, 2 data cards, `32px` gap | `#F5F6F7` |
| 8 | 权威合作医院 | `143:671` | 1440 | 703 | `1216px` content, 4-card grid, `24px` gap | `#FFFFFF` |
| 9 | 权威专家团队 | `143:708` | 1440 | 667 | `1216px` content, 4-card grid with authored tabs | `#F5F6F7` |
| 10 | 我们的实力 | `143:827` | 1440 | 699 | `1216px` two-column content, `24px` gap | `#FFFFFF` |
| 11 | 合作伙伴 | `143:847` | 1440 | 791 | min-width 1280; max-width 1920 | `#F5F6F7` |
| 12 | Final CTA | `143:987` | 1440 | 412 | `143:988` is 1440 x 220px | Linear gradient `#DD6B20` to `#3B82F6` |

Section heights total exactly `8350px`, matching `Main Content`.

## Hero

### Independent Banner States

| State | Source Frame | Image Node | Source Baseline | Vue State |
| --- | --- | --- | --- | --- |
| 让全球患者安心赴华就医 | `143:1190` | `143:1194` | `banner-01.html` / `banner-01-styles.txt` | `heroSlides[0]` |
| 8000+个家庭已陪伴赴华就医 | `143:1222` | `143:1226` | `banner-02.html` / `banner-02-styles.txt` | `heroSlides[1]` |
| 就医保障，写在前面 | `143:1251` | `143:1255` | `banner-03.html` / `banner-03-styles.txt` | `heroSlides[2]` |
| 真实患者声音 | `143:48` | `143:52` | Main frame baseline | `heroSlides[3]` (initial state) |

- Independent frames: `1440 x 754px`; copy parent `1280px`, max-width `1280px`, horizontal padding `32px`, gap `40px`; outer stage horizontal padding `80px`.
- States 1/2: eyebrow padding `10px 16px`, gap `4px`, icon `14px`; heading/copy gap `24px`; title PingFang SC `52/52px`, 600, `#143162`; subtitle `18/18px`, 400, `#5B606A`.
- State 1 CTA: `56px` height, `18px 24px` padding, `8px` gap, `14px` radius, `#1E3A5F`; source copy is `提交病例·3分钟获取方案`.
- State 2 has no CTA. `XXX` is an editable source placeholder, not an invented business metric.
- State 3: heading/list gap `48px`; list gap `32px`; item gap `12px`; heading icon `20px`, `8px` gap; item heading PingFang SC `20/20px`, 600.
- The three frames do not contain the shared page Header or assistant. Comparison evidence must distinguish those shell-owned overlays from differences in the Banner itself.
- Image-node exports preserve Figma image adjustments/crop. Downloading the original image alone did not preserve the actual Figma rendering.

- Stage wrapper `143:49`: `1440 x 754px`.
- Content/image frame `143:50`: vertical flow, `1440 x 754px`, 80px left/right padding, 10px gap, `#FFFFFF`.
- Image frame `143:51`: `1440 x 754px`; bitmap node `143:52` is `1440.72 x 757px`.
- Copy container `143:53`: vertical flow, `1280 x 362px` hug, max-width `1280px`, 40px gap, horizontal padding token `item spacing/m`.
- Eyebrow `143:54`: `134 x 34px`, horizontal flow, 9999px radius, 1px border, 10px vertical / 16px horizontal padding, 10px gap, `#2563EB` at 10% fill.
- Heading wrapper `143:59`: `730 x 94px`, vertical flow, 24px gap.
- Main heading `143:60`: `732 x 52px`, PingFang SC Semibold 600, 52/52px, `#143162`.
- Supporting copy `143:61`: `475 x 18px`, PingFang SC Regular 400, 18/18px, `#5B606A`.
- Case chip `143:62`: `361 x 46px`, 10px radius, 1px border, 12px padding, 10px gap, `#FFFFFF` at 10%; border `#2563EB` at 20%.
- Case chip text `143:63`: `335 x 20px`, PingFang SC Regular 400, 14/20px, `#3B82F6`.
- CTA spacer/wrapper `143:64`: `168 x 68px`, 16px top padding.
- CTA link `143:65`: `168 x 52px`, horizontal flow, 14px radius, 18px vertical / 24px horizontal padding, token gap `item spacing/xs`, shadow `0 4px 6px -4px rgba(0,0,0,.1)`.
- CTA text `143:66`: `96 x 16px`, PingFang SC Semibold 600, 16/16px, `#FFFFFF`.
- Hero arrows `143:70` and `143:73`: `48 x 48px`.
- Hero pagination `143:76`: `86 x 10px` hug, token gap `item spacing/xs`; dot `143:77` is `10 x 10px`.

## Journey Flow

- Section `143:81`: vertical flow, `1440 x 516px`, 96px top/bottom padding, 1px bottom border, `#FFFFFF`.
- Heading container `143:82`: `1216 x 80px` hug.
- Heading wrapper `143:83`: `1216 x 40px`.
- Heading text `143:84`: `242 x 40px`, SF Pro Bold 700, 40/40px, centered, `#1E3A5F`.
- Supporting wrapper `143:85`: `1216 x 40px`, 16px top padding.
- Supporting text `143:86`: `208 x 24px`, PingFang SC Regular 400, 16/24px, centered, `#6B7280`.
- Steps offset container `143:87`: `1216 x 244px`, 68px top padding.
- Steps grid `143:88`: `1216 x 244px`, 1 row x 4 columns.
- First step `143:89`: `285 x 176px`, vertical flow, 20px horizontal padding, top position 68px.
- Step visual `143:90`: `245 x 80px`; the implementation uses four fixed `285px` columns with `space-between` distribution.
- Step link/line anchor `143:91`: `80 x 19px`, top 34.5px, left 82.5px.
- Number circle `143:92`: `80 x 80px`, radius 40px, 20px outer border `#FCF1E9`, white fill, top -34.5px. This was corrected from the previous 120px implementation.
- Number text `143:93`: PingFang SC Semibold 600, 32/80px, centered, `#1E3A5F`.
- Connector `143:94`: `185 x 4px`, top 38px, left 182px, 2px dashed `#FCF1E9`, dash pattern 4/2.
- Step heading wrapper `143:95`: `245 x 64px`, 40px top padding.
- Step heading `143:96`: SF Pro Bold 700, 24/24px, centered, `#DD6B20`.
- Step paragraph wrapper `143:97`: `245 x 32px`.
- Step paragraph `143:98`: SF Pro Regular 400, 16/16px, centered, `#6B7280`.

## China Advantages

- Section `143:128`: `1440 x 1208px`, 96px top/bottom padding, `#F5F6F7`.
- Old rail `143:129`: `220 x 650px`, hidden.
- Visible rail `143:136`: `220 x 650px`.
- Rail number visual `143:141`: `120 x 120px`.
- Main content `143:143`: `802 x 1016px`, vertical flow, max-width `1280px`.
- Heading container `143:144`: `802 x 80px` hug.
- Cards spacer `143:149`: `802 x 936px`, 48px top padding.
- Card grid `143:150`: `802 x 888px`, 3 rows x 2 columns, 24px row/column gap.
- Card `143:151`: `389 x 280px`, vertical flow, 24px radius, 24px padding, 80px content gap, `#FFFFFF`.

## Patient Story

- Section `143:209`: `1440 x 720px`, 96px top/bottom padding, `#FFFFFF`.
- Outer content `143:210`: `1440 x 528px`.
- Inner container `143:211`: `1216 x 528px`, max-width `1280px`.
- Image panel: `389.33 x 400px`, 24px radius; story content panel: remaining `802.67 x 400px`, 24px radius, `#F5F6F7` fill, `32px` padding.
- Savings badge: `14px / 21px`, regular weight, `4px 12px` padding, `14px` radius, `#3B82F6` fill.
- Quote: `24px / 36px`, weight `500`, `#1E3A5F`; copy is `"天坛医院的张俊廷教授给了我第二次生命。从确诊到手术仅用了5天，术后3年无复发。"`.

## Medical Data Charts (ECharts)

- User requirement (2026-09-28): render data charts with ECharts. Exported chart SVGs remain source evidence, not runtime images. This exception applies only to the two data charts, not ordinary UI icons or other design assets.
- Source: Dev Mode HTML above, chart nodes `143:462` and `143:535`, and exported vector paths `public/images/figma/home-medical-capability.svg` / `home-treatment-cost.svg`.
- Chart wrapper nodes `143:461` / `143:534`: `542 x 316`, including `16px` top padding. Drawing region: `542 x 300`.
- Radar: center `(271,150)`, radius `88.4`, four polygon subdivisions; line width `2`, grid `#E5E7EB` width `1`. Data paths use blue `#2563EB` with alpha `.30`, navy `#1E3A5F` with alpha `.15`, gold `#C9A84C` with alpha `.15`.
- Radar values, clockwise from top (treatment cost, cure rate, waiting time, technology, service, language): China `95,88,95,90,85,92`; USA `30,92,50,95,82,60`; Germany `50,90,65,93,88,55`. These values reproduce the exported source vector vertices; they are editable example constants, not clinical evidence. ECharts takes the corresponding counterclockwise ordering.
- Radar label nodes: `143:481`, `143:484`, `143:487`, `143:490`, `143:493`, `143:496`; exact source coordinates copied to ECharts `graphic` text. Scale text nodes: `143:501`, `143:503`, `143:505`, `143:507`, `143:509`.
- Cost chart: plot `(50,5)` to `(537,253)`, Y-axis `0,30,60,90,120`, bar width `13`, gap `4`, top radius `4`. Colors match radar plus Japan `#94A3B8`. Grid dash `3,3`, axis `#666666`.
- Cost labels: nodes `143:557`, `143:560`, `143:563`, `143:566`, `143:569`, `143:572`; Inter `11px`, `#374151`. Y-axis text nodes: `143:578`, `143:581`, `143:584`, `143:587`, `143:590`; Inter `11px`, `#6B7280`.
- Cost values (China/USA/Germany/Japan), in thousands of USD:
  - heart bypass: `15/120/80/75`
  - tumor surgery: `12/80/55/60`
  - joint replacement: `8/55/35/40`
  - spine surgery: `10/65/45/50`
  - dental implant: `1.2/4.5/3/3.5`
  - orthodontics: `2.2/6.5/4.8/5`
- Radar legend text nodes `143:522`, `143:526`, `143:530`: SF Pro `12/18`. Cost legend nodes `143:654`, `143:658`, `143:662`, `143:666`: SF Pro `11/16.5`. Their colored markers and exact coordinates are implemented in `chartLegend()`.
- Implementation: `HomeView.vue` refs `radarChartEl` / `costChartEl`, `initCharts()`, `radarSeries`, `costs`, `chartLegend()`. Chart instances are disposed on route unmount and recreated on return. No tooltip or selection is added to the authored resting state.
- Mobile: proportional scaling of the complete canonical chart; wrapper constrains chart and canvas without document overflow. No independent mobile source frame exists. Animation is disabled in ECharts; existing section reveal remains the motion layer, with reduced-motion fallback.
- Regression: `node scripts/home-chart-qa.cjs`; screenshots `docs/figma-verification/home/2026-09-28/echarts-*.png`, canvas pixel/overflow/remount results `echarts-qa.json`, difference image `echarts-diff.png`.
- This chart change does not mark the whole homepage verified. Other homepage differences remain under review.

## Final CTA

- Section `143:987`: `1440 x 412px`, `96px` top/bottom padding; inner content `143:988` is `1440 x 220px`.
- Heading: `40px / 40px`, weight `600`, `0.4px` source letter spacing retained as the nearest project token.
- Supporting copy: `16px / 24px`, `rgba(255,255,255,.80)`, top margin `16px`.
- Button row: `48px` top padding, `16px` gap; white primary is `52px` high with `16px 24px` padding; outline and dark actions are `48px` high with `12px 24px` padding; all use `14px` radius and `16px / 24px` semibold text.
- Benefits row: `24px` top margin, `12px / 16px` text, `rgba(255,255,255,.60)`.

## Shared Typography

The 12 section text styles are checked against the node-linked Dev Mode source by `scripts/home-style-audit.cjs` (zero reported differences). The journey heading is SF Pro Bold 700, 40/40px, centered, `#1E3A5F`; individual overrides remain in the node-linked record.

Figma contains positive or negative letter-spacing values on some text nodes. The implementation uses `letter-spacing: 0` to comply with the project UI rule while retaining all other Figma typography values.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero patient image | `143:52` | Figma bitmap, cover | `/public/images/figma/patient-hero.png` |
| Banner images 1/2/3 | `143:1194`, `143:1226`, `143:1255` | Selected image-node exports | `/public/images/figma/home-banner-01-source.png`, `/public/images/figma/home-banner-02-source.png`, `/public/images/figma/home-banner-03-source.png` |
| Banner 1 eyebrow / CTA | `143:1198`, `143:1208` | `14px` / `16px` SVG | `/public/images/figma/home-icons/banner-01-eyebrow.svg`, `/public/images/figma/home-icons/banner-01-action.svg` |
| Banner 2 eyebrow | `143:1230` | `14px` SVG | `/public/images/figma/home-icons/banner-02-eyebrow.svg` |
| Banner 3 assurance check | `143:1283` | `20px` SVG | `/public/images/figma/home-icons/banner-03-check.svg` |
| Global care artwork | `143:842` | `100% 103.918%` at `0px -0.5px` | `/public/images/figma/home-global-care-source.png` |
| Partner logo matrix | `143:854` | Complete Figma group `3546 x 472px`, with 24px loop spacing; no baked-in fade | `/public/images/figma/partners-track.webp` |
| Partner logo mobile viewport | `143:854` | Same group crop, `1440 x 472px`; no baked-in fade | `/public/images/figma/partners-mobile-track.webp` |
| Patient story image | `143:218` | Figma image, `154.11% 100%` at `-127.992px 0px` | `/public/images/figma/patient-story.png` |
| Shanghai hospital image | `143:681` | Figma image, `126.6% 100%` at `-70.681px 0.172px` | `/public/images/figma/hospital-shanghai-design.png` |
| Beijing hospital image | `143:688` | Figma image, `133.4% 100%` at `-80.805px 0px` | `/public/images/figma/hospital-beijing-design.png` |
| Guangzhou hospital image | `143:695` | Figma image, `168.881% 126.408%` at `-84.373px -0.369px` | `/public/images/figma/hospital-guangzhou-design.jpg` |
| Huaxi hospital image | `143:702` | Figma image, `224.452% 166.86%` at `-178.054px 0px` | `/public/images/figma/hospital-huaxi-design.png` |
| Team portraits | `143:423`, `143:430`, `143:437`, `143:444` | Source crop values in `HomeView.vue` | `/public/images/figma/team-medical-steward.png`, `/public/images/figma/team-interpreter.png`, `/public/images/figma/team-advisor.png`, `/public/images/figma/team-coordinator.png` |
| Expert portraits | `143:729`, `143:754`, `143:779`, `143:804` | Source crop/flip values in `HomeView.vue` | `/public/images/figma/expert-wu-yilong-source.png`, `/public/images/figma/expert-shao-zhimin-source.png`, `/public/images/figma/expert-zhang-junting-source.png`, `/public/images/figma/expert-li-jin-source.png` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Hero carousel | Figma source frames above | arrows, dots, timed advance; hover pauses | `7000ms`, `0.55s` opacity/scale settle | same arrows/dots; balanced heading wrap; readable background wash; no autoplay for reduced motion |
| China advantages story | Octagos left-pinned/right-scrolling language | page scroll | sticky rail remains within `143:128` section; cards reveal `0.62s` | natural card list |
| Partner marquee | Octagos continuous horizontal movement | centered source matrix, continuous loop, hover pause | `55s` linear loop across four `1440px` copies; the source matrix stays centered on the viewport and the track pauses on hover | same centered track at `100vw` on mobile; disabled for reduced motion |
| Section reveal | Octagos restrained section transitions | viewport entry | opacity + `translateY(22px)` + blur, `0.62s` cubic-bezier; no layout drift | static visible content when motion is reduced |

## Verification

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/home/2026-09-28/figma-1440.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/home/2026-09-28/local-1440.png`; full-page `1440 x 8806px`, every section height equals the Figma source.
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/home/2026-09-28/local-390.png`; `390px`, no horizontal overflow or broken image. There is no independent Figma mobile frame.
- Hero state evidence: `docs/figma-verification/home/2026-09-29/figma-banner-{1,2,3}.png`, `local-banner-{1,2,3,4}-{1440,390}.png`, `state-qa.json`. Independent Banner references omit the shared Header and consultation assistant; those are intentionally visible on the complete page.
- Interaction evidence: `scripts/home-interaction-qa.cjs` passed routes, consultation open/Escape close, expert tab data states and fallback, 7-second autoplay, reduced-motion no-autoplay, and mobile overflow. `scripts/home-state-qa.cjs` passed all four slide states at 1440/390.
- Chart evidence: `scripts/home-chart-qa.cjs` passed nonblank ECharts canvas and overflow at 1440/768/390/320 with both motion settings.
- Verification run: `2026-09-29`
- Remaining differences: none

## Latest Audit

### Continuous China-care process (2026-10-01)

- Figma source frame: `来华就医流程`, node `143:3691`.
- The authored process is implemented as one continuous right-hand content stack with one sticky left rail. The existing homepage advantage frame `143:128` is the source baseline for `01 认知`; the current authored process source frames are `143:3692` (`02 评估`), `143:3954` (`03 信任`), and `143:3722` (`04 行动`). The parent flow frame is `143:3691`.
- Desktop source geometry copied from Dev Mode: the parent content width is `1216px`; the rail group `143:3723` is `220 x 650px` at `left:132px` (the rail's 1440px-frame x coordinate); the right content column `143:3707`/`143:3730` is `802px` wide at `right:112px`, placing it at `x=526px` in the `1440px` frame. The stage backgrounds use `#F5F6F7` across the full viewport.
- The rail's vertical dashed child is `143:3726`/`143:3727`, `245 x 8px`, rotated `90deg` (one direction is mirrored), with `4px` dashed border and the source gradient; the active number child `143:3728` is a `1:1` circle with `20px` solid `rgba(30,58,95,.10)` border, `#1E3A5F` fill, and `62px` source radius. The Vue rail preserves the `120px` content diameter plus `20px` border (`160px` rendered outer diameter), including the source stroke's `20px` outward extension (`margin-left:-20px`), and positions the rail group at `x=132px` while keeping the content column at `x=526px`.
- Stage baselines: `01` uses `1440 x 1208px`, `96px` vertical padding, a `389 x 280px` two-column card grid with `24px` gaps; `02` uses the authored `754px` frame with `80px` vertical padding; `03` uses the authored `1148px` frame with `96px` vertical padding; `04` uses the authored disease-card frame with `300px` cards, `24px` padding/radius, `32px` icons, `24px` titles, and `16px / 24px` body text.
- The four process stages are joined directly with no inter-stage margin, so the `#F5F6F7` source background remains continuous. The left rail uses the source repeating dashed pattern with a vertical mask/gradient that fades at both ends; the mobile rail uses the same treatment at its compact scale.
- Stage state is derived from the right stack's top edge crossing the desktop reading pivot. The rail number and label therefore remain fixed while scrolling, changing in order `01 认知` -> `02 评估` -> `03 信任` -> `04 行动`. On mobile the rail is released into a compact top status bar and the stack becomes a normal readable list.
- `02` buttons use the exported Figma icon assets and the authored gradient/outline treatment. The secondary `生成可行性报告` link contains only the document icon and text in the source hierarchy (no arrow). `03` FAQ rows remain independently expandable with the first row open in the source resting state. `04` uses the six exported Figma disease icons from `docs/figma-source/diseases/dev-styles-2026-09-29.css`.
- Evidence: `docs/figma-verification/home/2026-10-01-process/desktop-full.png`, `desktop-stage-{1,2,3,4}.png`, `mobile-stage-{1,2,3,4}.png`, `mobile-full.png`, and `geometry.json`. `scripts/home-process-qa.cjs` checks all four scroll states, the desktop sticky top edge, rail circle/line/label coordinates, four source-frame heights, right-column placement, and mobile overflow.

- 2026-09-29: `audit-home-source.mjs` passed all 1103 main-frame nodes; three alternate Banner HTML/text-style exports and exact image/icon source IDs are recorded. `home-style-audit.cjs` found zero section text-style differences. Final full-page screenshot comparison ratio is `0.0125029178` at pixel threshold `0.15`, excluding antialiasing; this is a diagnostic rasterization measure, not a substitute for visual review. Desktop geometry is `1440 x 8806px`, matching the source exactly; mobile has no overflow or broken assets. `vue-tsc -b`, direct Vite production compilation, and `git diff --check` passed. Full-site `pnpm run build` is still blocked by missing `/tmp` verification screenshot files referenced by other page specs, not by the homepage.
- 2026-09-24: Re-read the complete Dev Mode HTML/CSS source after expanding the code panel; verified all twelve section node IDs, authored desktop heights, source assets, carousel timing, reveal motion, and mobile overflow evidence.
