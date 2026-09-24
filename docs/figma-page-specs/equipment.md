# 国际医疗设备

- Route: `/equipment`
- Figma frame: no separate equipment frame was present in the current Figma canvas; implementation follows the hospital/service page system and existing editable equipment data
- Node ID: unresolved; no dedicated equipment frame present
- Desktop layout: centered `max-width: 1152px` content with a full-width light-blue hero and real equipment imagery
- Mobile layout: one-column cards/tables with horizontal table scrolling at 390px
- Status: not in current Figma scope; navigation disabled

## Figma Source Audit

- Checked all Figma pages in Dev Mode on 2026-09-24 using the file-wide Find scope.
- Searches for `国际医疗设备`, `高端治疗设备全景`, `设备全景`, `设备详情`, `CyberKnife`, `射波刀`, `国际一流设备`, `中国高端肿瘤治疗设备`, `核心优势速览`, `中国 vs 欧美 vs 东南亚`, `伽马刀 vs 射波刀`, `重点技术路线`, and `想了解适合自己的高端设备方案` returned `No results in this file`.
- `质子重离子治疗` returned one result, but it is body copy inside the existing redesigned disease page, not an equipment page/frame.
- Source-search evidence and scope are locked in `docs/figma-source/equipment/source-audit.md`.
- All dimensions below are existing product implementation values, not Figma values. They must remain marked unresolved until a source frame is provided.

## Structure

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Equipment hero | unresolved | 1440 full width | 520px desktop, hug mobile | Text left, real device image right | Light-blue wash, no decorative orb |
| Comparison tables | unresolved | 1152px max | hug | Four/five-column tables | Sticky first column, mobile horizontal scroll |
| Equipment catalog | unresolved | 1152px max | hug | 3-column desktop, 1-column mobile | Category filter and expandable cards |
| Routes / cases / partners / CTA | unresolved | 1152px max | hug | 3/2-column grids | Editable data constants |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title | unresolved | Patient shell heading | 30-48px / 1.2 | 700 | `#082D4B` |
| Section title | unresolved | Patient shell heading | 24-30px / 1.25 | 700 | `#082D4B` |
| Table/card body | unresolved | Patient shell body | 14-16px / 1.55 | 400 | `#152B3C` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Hero proof card | unresolved | 1fr x 72px min | 16px | 8px, white fill, soft shadow |
| Equipment card | unresolved | 1fr x hug | 20-24px | 8px, sky border, soft shadow |

- Hero: international equipment value proposition, three proof points, and a real CyberKnife treatment image.
- Comparison: core advantages, hardware comparison, price comparison, and Gamma Knife/CyberKnife matrix.
- Equipment catalog: category tabs, image cards, prices, expandable technical details, diseases, hospitals, and benefits.
- Treatment routes and patient cases: three route cards plus editable case summaries.
- Partner hospitals and CTA: partner capability cards and report handoff.

## Prototype And Motion

- Category tabs filter `equipmentList`; card expansion is independent and keyboard accessible.
- Tables retain sticky first columns and horizontal scroll on mobile.
- Hero uses a restrained image wash instead of decorative gradient orbs; hover/focus states remain subtle.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| CyberKnife hero | unresolved | Cover/multiply crop | `/public/images/equipment/image1.jpeg` |
| Equipment images | unresolved | Cover per card | `/public/images/equipment/image1.jpeg` - `image8.jpeg` |

## Verification

- Local desktop screenshot: `docs/figma-verification/equipment/local-desktop-1440.png`
- Local mobile screenshot: `docs/figma-verification/equipment/local-mobile-390.png`
- Desktop and 390px mobile: hero image crop, table scroll, category filtering, expansion state, CTA route, asset loading, and page-level overflow checked locally.
- Mobile geometry after the final CSS change: `documentElement.clientWidth = 390`, `documentElement.scrollWidth = 390`, `body.scrollWidth = 390`; Hero copy and proof cards remain inside the viewport.
- Interaction evidence: selecting `精准放疗` leaves three matching equipment cards and removes `质子治疗系统`; expanding `射波刀` shows one `技术特点` region and one `收起详情` control; CTA `href` is `/report`; all page images report a non-zero natural width; browser warnings/errors: none.
- Verification run: `2026-09-24`
- Remaining differences: exact Figma hierarchy, geometry, typography, colors, assets, states, and resting layout remain unresolved because the design file contains no dedicated equipment source frame.
- Figma verification: blocked by missing dedicated source frame; no screenshot is being treated as a substitute.
