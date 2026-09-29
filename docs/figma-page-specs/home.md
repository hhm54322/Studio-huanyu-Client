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
- State 1 CTA: `56px` height, `18px 24px` padding, `8px` gap, `14px` radius, `#1E3A5F`; obvious punctuation corrected from `提交病例.3分钟获取方案` to `提交病例 · 3分钟获取方案`.
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
| Partner logo matrix | `143:853` | Figma image, cover | `/public/images/figma/partners-matrix.png` |
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
| Partner marquee | Octagos continuous horizontal movement | continuous, hover pause | `55s` linear loop, pause on hover | slower continuous track; disabled for reduced motion |
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

- 2026-09-29: `audit-home-source.mjs` passed all 1103 main-frame nodes; three alternate Banner HTML/text-style exports and exact image/icon source IDs are recorded. `home-style-audit.cjs` found zero section text-style differences. Final full-page screenshot comparison ratio is `0.0125029178` at pixel threshold `0.15`, excluding antialiasing; this is a diagnostic rasterization measure, not a substitute for visual review. Desktop geometry is `1440 x 8806px`, matching the source exactly; mobile has no overflow or broken assets. `vue-tsc -b`, direct Vite production compilation, and `git diff --check` passed. Full-site `pnpm run build` is still blocked by missing `/tmp` verification screenshot files referenced by other page specs, not by the homepage.
- 2026-09-24: Re-read the complete Dev Mode HTML/CSS source after expanding the code panel; verified all twelve section node IDs, authored desktop heights, source assets, carousel timing, reveal motion, and mobile overflow evidence.
