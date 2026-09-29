# 费用对比

- Route: `/cost`
- Figma frame: `查看更多病种费用对比详情`
- Node ID: `143:2079`
- Source baseline HTML: `docs/figma-source/cost/frame.html`
- Source baseline CSS: `docs/figma-source/cost/styles.txt`
- Source asset manifest: `docs/figma-source/cost/assets.json`
- Source extraction run: 2026-09-24, Figma Dev Mode through `browser-client` and the `iab` design tab
- Desktop frame: `1440 x 1961.26px` (`143:2079` native size); the supplied Figma export rasterizes to `1440 x 1962px`
- Responsive QA viewport: `390 x 844`; no dedicated mobile source frame
- Status: verified

## Source Inventory And Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:2079` | 查看更多病种费用对比详情 / Frame | frame root | `.cost-generated-frame` | `1440 x 1961.26`, vertical padding `96px`, fill `#F5F6F7`, native bottom border `1px` | Route source frame |
| `143:2080` | Container | `143:2079` | `.cost-generated-heading` | width `1216px`, height `80px`, centered column | Heading group |
| `143:2081`, `143:2082` | Heading 2 / title | `143:2080`, `143:2081` | `.cost-generated-heading h1` | PingFang SC `40/40`, 600, `0.4px`, `#1E3A5F` | Exact copy |
| `143:2083`, `143:2084` | Paragraph / subtitle | `143:2080`, `143:2083` | `.cost-generated-heading p` | top gap `16px`, PingFang SC `16/24`, `#6B7280` | Exact copy |
| `143:2085` | Container | `143:2079` | `.cost-generated-chart` plus `.savings-marquee` | width `1216px`, height `547.26px`, top padding `48px` | Chart and ticker branch |
| `143:2086`, `143:2087` | Frame 645 / Group 615 | `143:2085`, `143:2086` | `.chart-plot` ECharts canvas | `1216 x 403px`; plot, labels and legend | Exact chart geometry; runtime bars are ECharts canvas |
| `143:2088`-`143:2106` | Grid Groups and Vectors | `143:2087` | ECharts `grid`, `xAxis`, `yAxis` | left/bottom axis and 9-column by 4-row grid | Runtime chart geometry rendered by ECharts |
| `143:2107`-`143:2136` | Category label Groups, Vectors and Text | `143:2087` | ECharts `xAxis.axisLabel` | nine authored labels, Inter `12px`, centered widths `37.83px`-`73.62px`, `#666666` | Exact source order |
| `143:2137`-`143:2154` | Y-axis Groups, Vectors and Text | `143:2087` | ECharts `yAxis` | `$600K`, `$450K`, `$300K`, `$150K`, `0`, Inter `12px`, right aligned | Top-to-bottom order verified |
| `143:2155`-`143:2280` | Six bar-series Groups and Vectors | `143:2087` | ECharts `BarChart` series; `generatedHeights` | `12.27px` bars; all 54 Figma heights and six source colors copied | Data remains editable constants; canvas-only runtime chart |
| `143:2281` | Frame 644 | `143:2086` | `.chart-legend` | inline row, `10px` gap, `16/24` SF Pro | Legend container |
| `143:2282`-`143:2285` | 美国 List Item, Icon, Vector, Text | `143:2281` | first `.chart-legend span` | `14px` swatch, `#9CA3AF`, label `美国` | SVG `cost-legend-us.svg` |
| `143:2286`-`143:2289` | 英国 List Item, Icon, Vector, Text | `143:2281` | second `.chart-legend span` | `14px` swatch, `#6B7280`, label `英国` | SVG `cost-legend-uk.svg` |
| `143:2290`-`143:2293` | 德国 List Item, Icon, Vector, Text | `143:2281` | third `.chart-legend span` | `14px` swatch, `#4B5563`, label `德国` | SVG `cost-legend-germany.svg` |
| `143:2294`-`143:2297` | 中国 List Item, Icon, Vector, Text | `143:2281` | fourth `.chart-legend span` | `14px` swatch, `#DD6B20`, label `中国` | SVG `cost-legend-china.svg` |
| `143:2298`-`143:2301` | 新加坡 List Item, Icon, Vector, Text | `143:2281` | fifth `.chart-legend span` | `14px` swatch, `#2563EB`, label `新加坡` | SVG `cost-legend-singapore.svg` |
| `143:2302`-`143:2305` | 日本 List Item, Icon, Vector, Text | `143:2281` | sixth `.chart-legend span` | `14px` swatch, `#3B82F6`, label `日本` | SVG `cost-legend-japan.svg` |
| `143:2306`-`143:2320` | Container:margin, ticker Container, mask, five chip Containers and Text | `143:2085` | `.savings-marquee`, `.savings-track` | top padding `48px`, height `48px`; chips `12px 24px`, radius `14px`, `16/24` | Five exact authored labels; side fades retained |
| `143:2321`-`143:2355` | Container:margin with three legacy card nodes | `143:2085` | not rendered | Omitted by the selected root's generated Dev Mode HTML | Source-only hidden duplicate set; canonical cards are `143:2372`-`143:2527` |
| `143:2356` | Container:margin | `143:2079` | `.cost-generated-actions` | top padding `48px`, centered column, `16px` gap | CTA branch |
| `143:2357` | Frame 646 | `143:2356` | `.cost-generated-buttons` | `667 x 52px`, horizontal gap `16px` | Button row |
| `143:2358`, `143:2359` | Link / label | `143:2357`, `143:2358` | orange details toggle | padding `18px 24px`, radius `14px`, shadow `0 4px 6px -4px rgba(0,0,0,.1)`, `16/16` 600 | `aria-expanded` state |
| `143:2360`-`143:2364` | Right-arrow and up-chevron Icons/Vectors | `143:2358` | toggle icon `<img>` | `16 x 16`, white `1.33px` strokes | Right arrow when closed; up-chevron when open |
| `143:2365`, `143:2366` | Link / label | `143:2357`, `143:2365` | `RouterLink` to `/report` | same geometry; fill `#1E3A5F` | Existing report route retained |
| `143:2367`-`143:2369` | Icon and Vectors | `143:2365` | report link `<img>` | `16 x 16`, white `1.33px` strokes | SVG `cost-arrow-right.svg` |
| `143:2370`, `143:2371` | Paragraph / supporting text | `143:2356`, `143:2370` | `.cost-generated-actions p` | PingFang SC `14/22`, `#6B7280` | Exact copy |
| `143:2372`, `143:2373` | Container:margin / Container | `143:2079`, `143:2372` | `.cost-generated-details` | top padding `32px`; `1216 x 972px`; three `389.33px` columns; `24px` row/column gap | Eight-card grid |
| `143:2374`-`143:2392` | 心脏搭桥手术 card structure, text and Icon | `143:2373` | first `.cost-detail-card` | `389.33 x 308px`, padding `24px`, radius `24px`, icon `32px`, content `341 x 148px` | Icon `143:2375`; exact copy/metrics |
| `143:2393`-`143:2410` | CAR-T card structure, text and Icon | `143:2373` | second `.cost-detail-card` | same card geometry and typography | Icon `143:2394`; exact copy/metrics |
| `143:2411`-`143:2433` | PET-CT card structure, text and Frame | `143:2373` | third `.cost-detail-card` | same card geometry and typography | Asset root `143:2412`; exact copy/metrics |
| `143:2434`-`143:2451` | 质子重离子 card structure, text and Icon | `143:2373` | fourth `.cost-detail-card` | same card geometry and typography | Icon `143:2435`; exact copy/metrics |
| `143:2452`-`143:2469` | 膝关节置换 card structure, text and Frame | `143:2373` | fifth `.cost-detail-card` | same card geometry and typography | Asset root `143:2453`; exact copy/metrics |
| `143:2470`-`143:2487` | 机器人微创 card structure, text and Icon | `143:2373` | sixth `.cost-detail-card` | same card geometry and typography | Icon `143:2471`; exact copy/metrics |
| `143:2488`-`143:2507` | All-on6 card structure, text and Frame | `143:2373` | seventh `.cost-detail-card` | same card geometry and typography | Asset root `143:2489`; exact copy/metrics |
| `143:2508`-`143:2527` | 单颗进口种植牙 card structure, text and Frame | `143:2373` | eighth `.cost-detail-card` | same card geometry and typography | Asset root `143:2509`; exact copy/metrics |

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Source frame | `143:2079` | `1440px` | `1961.26px` | centered `1216px` | native frame geometry |
| Heading | `143:2080` | `1216px` | `80px` | centered column | top at source padding `96px` |
| Chart and ticker | `143:2085` | `1216px` | `547.26px` | chart `403.26px`; ticker `96px` (`48px` top padding + `48px` chips) | exact bar heights |
| CTA | `143:2356` | stretch | `138px` | centered row then support text | `48px` top padding |
| Detail grid | `143:2372`, `143:2373` | `1216px` | `1004px` including top padding | 3 columns, `24px` gaps | final row contains two cards |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Page heading | `143:2082` | PingFang SC | `40px / 40px`, `0.4px` spacing | 600 | `#1E3A5F` |
| Page subtitle | `143:2084` | PingFang SC | `16px / 24px` | 400 | `#6B7280` |
| Chart and axis labels | `143:2112`-`143:2154` | Inter | `12px` | 400 | `#666666` |
| Country legend | `143:2285`-`143:2305` | SF Pro | `16px / 24px` | 400 | country source color |
| Ticker labels | `143:2310`, `143:2312`, `143:2314`, `143:2316`, `143:2318` | PingFang SC | `16px / 24px` | 400 | `#1E3A5F` |
| CTA labels | `143:2359`, `143:2366` | PingFang SC | `16px / 16px` | 600 | `#FFFFFF` |
| CTA support | `143:2371` | PingFang SC | `14px / 22px` | 400 | `#6B7280` |
| Card titles | `143:2380`, `143:2398`, `143:2421`, `143:2439`, `143:2457`, `143:2475`, `143:2495`, `143:2515` | PingFang SC | `24px / 24px` | 600 | `#1E3A5F` |
| Card metric labels/values | `143:2384`-`143:2526` | PingFang SC | `16px / 16px` | 400 / 500 | `#6B7280` / `#2563EB` |
| Card body | `143:2392`, `143:2410`, `143:2433`, `143:2451`, `143:2469`, `143:2487`, `143:2507`, `143:2527` | PingFang SC | `16px / 24px` | 400 | `#4B5563` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Chart bars | `143:2155`-`143:2280` | `12.27px` x source height | `3px` visual bar gap | six exact fills, rendered with ECharts |
| Ticker chips | `143:2309`, `143:2311`, `143:2313`, `143:2315`, `143:2317` | content width x `48px` | `12px 24px`; `24px` track gap | `14px`; white |
| CTA buttons | `143:2358`, `143:2365` | content width x `52px` | `18px 24px`; inner gap `8px` | `14px`; source shadow |
| Detail cards | `143:2374`, `143:2393`, `143:2411`, `143:2434`, `143:2452`, `143:2470`, `143:2488`, `143:2508` | `389.33 x 308px` | `24px`; icon/content gap `80px` in source auto layout | `24px`; white |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Six country swatches | `143:2283`, `143:2287`, `143:2291`, `143:2295`, `143:2299`, `143:2303` | SVG `14 x 14` | `/public/images/figma/cost-legend-*.svg` |
| Details up-chevron | `143:2363`, `143:2364` | SVG `16 x 16` | `/public/images/figma/cost-chevron-up.svg` |
| CTA right arrow | `143:2360`-`143:2362`, `143:2367`-`143:2369` | SVG `16 x 16` | `/public/images/figma/cost-arrow-right.svg` |
| Heart bypass | `143:2375`-`143:2377` | SVG `32 x 32` | `/public/images/figma/cost-heart-bypass.svg` |
| CAR-T | `143:2394`, `143:2395` | SVG `32 x 32` | `/public/images/figma/cost-car-t.svg` |
| PET-CT | `143:2412`-`143:2418` | SVG `32 x 32` | `/public/images/figma/cost-pet-ct.svg` |
| Proton therapy | `143:2435`, `143:2436` | SVG `32 x 32` | `/public/images/figma/cost-proton.svg` |
| Knee replacement | `143:2453`, `143:2454` | SVG `32 x 32` | `/public/images/figma/cost-knee.svg` |
| Surgical robot | `143:2471`, `143:2472` | SVG `32 x 32` | `/public/images/figma/cost-robot.svg` |
| Dental implant | `143:2489`-`143:2492`, `143:2509`-`143:2512` | SVG `32 x 32` | `/public/images/figma/cost-tooth.svg` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Chart bar emphasis | Octagos restrained data response | pointer hover | ECharts emphasis brightness/focus; no layout shift | no interaction dependency |
| Savings ticker | Figma fixed ticker composition plus Octagos continuous motion | settled page | `24s linear` loop; resting chip geometry unchanged | reduced motion stops the track |
| Details toggle | Figma open state uses node `143:2363`; closed state uses node `143:2360` | button activation | native immediate state change; `aria-expanded` synchronized | same accessible button |
| Report entry | Figma CTA plus existing business route | link activation | Vue Router to `/report` | same route |
| Card reveal | Octagos section-entry vocabulary | IntersectionObserver | global `520ms cubic-bezier(.22,1,.36,1)` | content remains visible without observer |
| Card/button hover | Octagos depth response | pointer hover/focus | `250ms` button and `450ms` card transitions | no hover requirement |
| Responsive chart | authored desktop chart adapted without changing values | viewport below `900px` | horizontally scrollable plot | axis grid hidden to preserve legibility |
| Reduced motion | accessibility contract | `prefers-reduced-motion: reduce` | ticker and transforms disabled | all content visible |

## Verification

- Figma reference screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cost/2026-09-29-cost-final4/figma-reference-native-2x.png`
- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cost/2026-09-29-cost-final4/local-1440-2x.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cost/2026-09-29-cost-final4/local-390-2x.png`
- Desktop geometry check: rendered source frame is `1440 x 1961.25px`, versus native Figma `1440 x 1961.26px`; `1216px` container, `389.33px` cards, `24px` gaps and all eight `308px` cards match
- Mobile geometry check: viewport width and document width are both `390px`; card grid is one column; chart scrolling is contained; horizontal overflow is `0px`
- Interaction check: details toggle open/closed state, `/report` link, hover transforms, marquee, and reduced-motion fallback exercised
- Verification run: 2026-09-29; Figma source frame re-exported at native `2x` (`2880 x 3923`) and compared against the local `2x` frame crop with pixelmatch threshold `0.15`, `includeAA: false`; changed-pixel ratio `0.642%`.
- Remaining differences: none
- Raster comparison evidence: accepted native-2x changed-pixel ratio `0.642%` at threshold `0.15` with `includeAA: false`; residual pixels are browser/Figma text rasterization and antialiasing only, with no source geometry, asset, interaction, or overflow differences.
