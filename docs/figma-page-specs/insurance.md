# 保险指南

- Route: `/insurance`
- Figma frame: `保险指南`
- Node ID: `419:31`
- Source baseline HTML: `docs/figma-source/insurance/frame.html`
- Source baseline CSS: `docs/figma-source/insurance/styles.txt`
- Source asset manifest: `docs/figma-source/insurance/assets.json`
- Source extraction run: `2026-09-24`, Dev Mode root HTML plus recursively expanded 798-row Layers inventory
- Desktop frame: `1440 x 6211px`
- Mobile frame: responsive implementation verified at `390 x 844px`; Figma has no separate mobile source frame
- Status: verified

## Expanded Figma States (2026-09-30)

| Figma node | State | Implemented UI | Source frame height |
| --- | --- | --- | ---: |
| `419:832` | Assessment result beneath the hero form | `.insurance-assessment-result` | 1150px |
| `419:1118` | Three medical scenarios expanded | `.insurance-scenario-detail` in each card | 1093px |
| `419:943` | Three reimbursement paths expanded | `.insurance-path-detail` in each card | 1026px |

- `立即评估` now opens or closes the result within `/insurance`; it does not navigate to `/report`.
- All three scenario cards and all three reimbursement cards expand independently, including their action labels and chevrons. The selected scenario keeps the Figma blue outline.
- The insurer partner matrix from source node `419:451` uses the same unfaded insurer-card source and fixed edge fade as the homepage partner marquee. Only the cards move; the edge overlays remain fixed. It pauses on hover and remains static under reduced motion.
- Expanded desktop section heights were checked at 1440px: scenarios 1093px and reimbursement paths 1026px. Assessment expansion keeps the hero at 1150px. Mobile at 390px has no horizontal page overflow.

## Layer Mapping

The complete, ordered source inventory is stored in `docs/figma-source/insurance/layers.csv`. The complete 798-node mapping to concrete Vue targets is stored in `docs/figma-source/insurance/node-map.csv`; no source row is omitted.

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `419:31` | 保险指南 / frame | root | `.insurance-page` | 1440x6211, vertical page frame | Route root |
| `419:32` | Body / frame | `419:31` | `.insurance-page`, `PatientHeader`, `PatientFooter` | relative body, `#F9FAFB` | Shell composition |
| `419:33` | Main Content / frame | `419:32` | `.insurance-page > section` | vertical Auto Layout | Eight ordered sections |
| `419:34` | Section / frame | `419:33` | `.insurance-hero` | 1440x757; padding 180/112/96; 60 gap | Image fill and assessment form |
| `419:101` | Section / frame | `419:33` | `.insurance-scenarios` | content 1440x390 plus 96px top/bottom padding; outer 582 | Three 302px cards |
| `419:153` | Section / frame | `419:33` | `.insurance-steps` | content 1440x595 plus 96px top/bottom padding; outer 787/788 | Four state controls and detail panel |
| `419:256` | Container / frame | `419:33` | `.insurance-paths` | content 1360x498; 40px sides, 96px top/bottom; outer 1440x690 | Three reimbursement cards |
| `419:380` | Section / frame | `419:33` | `.insurance-compare` | content 1440x475 plus 96px top/bottom; outer 667 | Comparison table |
| `419:445` | Section / frame | `419:33` | `.insurance-partners` | content 1440x599 plus 96px top/bottom; outer 791 | Exact 1440x472 partner matrix |
| `419:585` | Container / frame | `419:33` | `.insurance-faq` | content 1440x875 plus 96px top/bottom; outer 1067 | Two-column accordion |
| `419:678` | Section / frame | `419:33` | `.insurance-cta` | content 1440x220 plus 96px top/bottom; outer 412 | Three consultation entries |
| `419:711` | Footer / frame | `419:32` | `PatientFooter.vue` | shared 458px footer | Shared patient shell |
| `484:1651` | Header / frame | `419:32` | `PatientHeader.vue` | absolute 64px header | Shared patient shell |

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Hero | `419:34` | 1440 | 757 | 1136 heading, 1120 three-column form | Exact Figma fill from node `419:34` |
| Scenarios | `419:101` | 1440 | 582 | 1216, 3 columns, 24 gap | 302px cards, 24 radius |
| Reimbursement steps | `419:153` | 1440 | 788 | 1216, four equal steps | Dark `#1E3A5F` stage |
| Reimbursement paths | `419:256` | 1440 | 690 | 1216, 3 columns, 24 gap | Blue/orange/navy rate panels |
| Comparison | `419:380` | 1440 | 667 | 1216 table | 56px rows, 10px row gap |
| Insurance partners | `419:445` | 1440 | 791 | 1216 heading; 1440 matrix | Full-bleed matrix retained |
| FAQ | `419:585` | 1440 | 1067 | 389.33 + 1fr, 80 gap | First item open by default |
| CTA | `419:678` | 1440 | 412 | 1216 centered | Three exact button variants |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero heading | `419:37` | PingFang SC | 64/96 | 600 | `#143162` |
| Hero subtitle | `419:39` | PingFang SC | 20/29 | 400 | `#5B606A` |
| Form label | `419:75` | PingFang SC | 16/16 | 500 | `#1E3A5F` |
| Form value | `419:77` | PingFang SC | 16/16 | 400 | `#9CA3AF` |
| Section heading | `419:106` | PingFang SC | 40/40 | 600 | `#1E3A5F` |
| Card title | `419:116` | PingFang SC | 24/24 | 600 | `#1E3A5F` |
| Card body | `419:121` | PingFang SC | 16/24 | 400 | `#4B5563` |
| FAQ heading | `419:589` | SF Pro | 40/40 | 700 | `#1E3A5F` |
| FAQ question | `419:596` | PingFang SC | 24/28.8 | 600 | `#1E3A5F` |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Select field | `419:76` | fill x 56 | 16 horizontal | 16 radius, 1px `#DBEAFE` |
| Primary CTA | `419:97` | hug x 52 | 24 horizontal, 16 vertical, 8 gap | 14 radius, `#1E3A5F` |
| Scenario card | `419:111` | 389.33 x 302 | 24 padding, 80 major gap | 24 radius, `#F5F6F7` |
| Step marker | `419:162` | 80 x 80 | 20px outer ring | circular, active cyan ring |
| Reimbursement card | `419:263` | 389.33 x 410 | 24 padding/gap | 24 radius, white |
| Rate panel | `419:273` | fill x 72 | 12 padding | 16 radius |
| FAQ row | `419:591` | fill | 24 vertical | 1px divider |
| CTA button | `419:686` | hug x 52 | 24 horizontal, 16 vertical, 8 gap | 14 radius, -4px shadow |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero image fill | `419:34` | PNG, cover/center | `public/images/figma/insurance/hero.png` |
| Planned treatment icon | `419:112` | SVG 32x32 | `public/images/figma/insurance/Icon-17.svg` |
| Emergency icon | `482:1351` | SVG 32x32 | `public/images/figma/insurance/Icon-15.svg` |
| Complication icon | `419:139` | SVG 32x32 | `public/images/figma/insurance/Icon-11.svg` |
| Condition check | `419:280` | SVG 20x20, repeated from exact exported source | `public/images/figma/insurance/Icon-10.svg` |
| FAQ chevrons | `419:599`, `419:612` | SVG 24x24, expanded/collapsed | `public/images/figma/insurance/Icon-7.svg`, `public/images/figma/insurance/Icon-6.svg` |
| Online service | `419:687` | SVG 20x20 | `public/images/figma/insurance/Frame.svg` |
| Email consultation | `419:691` | SVG 20x20 | `public/images/figma/insurance/Icon-8.svg` |
| Video consultation | `419:696` | SVG 20x20 | `public/images/figma/insurance/Icon-5.svg` |
| Partner matrix | `419:451` (same insurer-card source as home `143:854`) | Unfaded 3570x472 desktop loop; 1440x472 mobile crop | `public/images/figma/partners-track.webp`, `public/images/figma/partners-mobile-track.webp` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Scenario selection | Card state | click, Enter, Space | 280ms `cubic-bezier(.22,1,.36,1)` lift/fill | stacked card state |
| Reimbursement step | Authored detail state | click marker | immediate data swap; stable 788px stage | compact markers, detail follows |
| Assessment result | Figma state `419:832` | click `立即评估` | 420ms accordion; static under reduced motion | result stacks into one column |
| Scenario details | Figma state `419:1118` | click a scenario card or its action | independent 420ms accordion | stacked cards |
| Reimbursement path details | Figma state `419:943` | click a path card or its action | independent 420ms accordion | stacked cards |
| Partner matrix | Figma asset `419:451`, homepage loop pattern | continuous horizontal track, pause on hover; fixed 160px edge gradients | 120s linear; static under reduced motion | viewport-width track with fixed 40px gradients |
| FAQ accordion | Expanded/collapsed chevrons | click question | shared reveal plus exact state icon | one-column accordion |
| Card entrance | Octagos reveal vocabulary | viewport entry | shared 620-720ms eased reveal with 70ms stagger | reveal disabled below 768px |
| Buttons/cards | Octagos hover vocabulary | pointer hover | 240-280ms lift and shadow | no transform on coarse/reduced motion |
| Reduced motion | accessibility fallback | media query | all added transitions disabled | complete static layout |

## Verification

- Figma reference screenshot: `docs/figma-verification/insurance/figma-desktop-419-31.png`
- Local desktop screenshot: `docs/figma-verification/insurance/desktop-section-01.png`
- Additional desktop crops: `desktop-section-02.png` through `desktop-section-07.png`, reviewed section by section at a 1440x900 viewport.
- Local mobile screenshot: `docs/figma-verification/insurance/local-mobile-390.png`
- Post-interaction-fix mobile evidence: `artifacts/interaction-audit/insurance-mobile-517.jpg`
- Mobile geometry: 390px viewport, 384px body content width, no body overflow, no broken assets; comparison table scroll is intentionally contained inside `.insurance-compare`.
- Interaction evidence: scenario index 1 activated; step 02 detail rendered; the assessment result, three scenario details, and three reimbursement path details open in place and can remain open independently; FAQ item 2 expanded.
- Desktop geometry: section sequence `757 + 582 + 788 + 690 + 667 + 791 + 1067 + 412 = 5754px`; page plus shared 456px footer is 6210px versus 6211px source raster rounding.
- Verification run: `2026-09-29`
- Latest desktop diff: `docs/figma-verification/insurance/2026-09-29/geometry.json` (`0.72%` changed pixels using native 2x comparison; source height `6212px`, local height `6211px`)
- Partner marquee correction verified 2026-09-30: `docs/figma-verification/insurance/2026-09-30/partners-{1440,768,390}-{start,mid,seam}.png`. The 1440px resting crop differs from the Figma `419:451` matrix by 0.790% mean pixel value; loop seam difference is 0 at all three widths. No page-level horizontal overflow. Fixed edge fades remain stationary; hover pauses and reduced-motion disables the animation.
- Remaining differences: none
