# 为什么选择中国

- Route: `/why-china`
- Figma frame: `03寰宇云医 - 为什么选择中国`
- Node ID: `143:1299`
- Source baseline HTML: `docs/figma-source/why-china/frame.html`
- Source baseline CSS: `docs/figma-source/why-china/native-styles-2026-09-29.css`
- Source asset manifest: `docs/figma-source/why-china/assets.json`
- Source extraction run: `2026-09-29 native Kiwi parse; 778 nodes cross-checked against Dev Mode Layers, with no missing IDs, incorrect parents, or incorrect sibling order`
- Desktop frame: `1440 x 5655.2603px`
- Mobile frame: no dedicated frame found; implemented as a responsive adaptation of the desktop source
- Status: verified

## Layer Mapping

The complete 778-node map is `docs/figma-source/why-china/node-to-code-2026-09-29.json`. Every node has an exact Node ID, parent, sibling order, own/effective visibility, and a concrete Vue/DOM selector or ECharts owner. The 111 hidden nodes identify the exact hidden ancestor that excludes them. Layout-only wrappers are consolidated into their specified semantic elements; SVG descendants map to their exported asset element.

All raw node parameters, including rich text, font metadata, image paint/filter, transforms, constraints, Auto Layout, grid tracks, and effects, are in `docs/figma-source/why-china/native-parameters-2026-09-29.json`. The inventory is `native-inventory-2026-09-29.json`; image parameters are in `native-image-paints-2026-09-29.json`. The CSS file is an extraction record, not a runtime stylesheet; raw native parameters take precedence over limitations of the existing HTML export.

Native source: `/Users/hhm/Downloads/寰宇云医.fig`, exported `2026-09-28T21:02:13.294Z`; SHA-256 `f46e9364d764719ef3534683e7a8ab3289f0d4dda20e10292373fcb7a18d74eb`. The 129MB original remains outside Git. `baseline-lock-2026-09-29.json` locks the extracted source files.

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:1299` | `03寰宇云医 - 为什么选择中国` frame | — | `.why-page` | `1440 x 5655px` | Source frame |
| `143:1301` | `Main Content` auto-layout | `143:1300` | page section flow | `1440 x 5199px` | Header/footer shell-owned |
| `143:1302` | Hero section | `143:1301` | `.why-hero` | `1440 x 757px`, padding `180px 112px 96px`, gap `60px` | Hero background asset |
| `143:1353` | Capability container | `143:1301` | `.capability-section` | `1216px` content, 8-card grid | First card expanded |
| `143:1473` | Cost comparison section | `143:1301` | `.cost-section` | `1440 x 957.26px` | Six-country chart and action strip |
| `143:1766` | Wait-time section | `143:1301` | `.wait-section` | `1440 x 552px`, 4 cards | Fourth card highlighted |
| `143:1790` | National strength section | `143:1301` | `.national-section` | `1440 x 512px`, full bleed | Background blend asset |
| `143:1824` | Patient stories section | `143:1301` | `.stories-section` | `1440 x 593px`, 3 cards | Portrait assets |
| `143:1912` | Final CTA section | `143:1301` | `.why-cta` | `1440 x 412px` | Visible CTA branch |
| `143:1958` | Footer | `143:1300` | `PatientFooter.vue` | `1440 x 456px` | Shared shell |

## Page Structure

- `Body` (`143:1300`): `1440 x 5655px`.
- `Main Content` (`143:1301`): `1440 x 5199px`.
- Shared footer: `1440 x 456px`.
- Shared header: overlay, `1440 x 64px`; inner container `1280px` with `32px` horizontal padding.
- Main content width: `1216px`.

## Sections

| Order | Section | Node ID | Width | Height | Container/Grid | Notes |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | Hero | `143:1302` | 1440 | 757 | centered fixed-height stage | exact Figma hero background, HTML copy and CTAs |
| 2 | 中国严肃医疗能力 | `143:1353` container | 1440 | 1416 | outer grid `1216 x 1224`; `389.33px + 24px + 802.67px`; capability grid 4 rows x 2 columns | sticky left copy; right 2-column capability grid; section padding `96px 40px`; default first card expanded |
| 3 | 全球费用对比 | `143:1473` | 1440 | 957.26 | `1216px`; heading `1216 x 80`; chart/content `1216 x 547.26` with 48px top padding; lower action strip `1440 x 138` | six-country comparison and editable constants; source 1px stroke paint is hidden and is not rendered |
| 4 | 全球等待时长 | `143:1766` | 1440 | 552 | `1216px`, 4 columns; section padding top/bottom `96px` | fourth card highlighted |
| 5 | 国家级医疗实力 | `143:1790` | 1440 | 512 | full-bleed background; `1216px` content; section padding top/bottom `96px` | background image opacity `80%`, multiply blend, fill `#1E3A5F`; four metrics and CTA |
| 6 | 国际患者反馈 | `143:1824` | 1440 | 593 | `1216px`, 3 columns; section padding top/bottom `96px` | Figma patient portraits and copy |
| 7 | Final CTA | `143:1912` | 1440 | 412 | centered content; inner content `1440 x 220`; section padding top/bottom `96px` | visible CTA uses `#F5F6F7`; hidden alternate gradient section `143:1873` is excluded |
| 8 | Shared footer | shared component | 1440 | 456 | `1216px` content | common patient footer |

The native seven-section height is `5199.2603px`; with the `456px` footer the source is `5655.2603px`. Browser layout quantizes the cost section to `957.25px`, so its section boundaries differ by less than `.02px`. The page raster is `5655px` high; the Figma 2x export rounds to `11311px`.

## Typography

| Element | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | ---: | --- |
| Hero heading | PingFang SC / system sans | `64/96px` | 600 | `#143162`, second line `#1E3A5F` |
| Hero supporting copy | PingFang SC / system sans | `20/30px` | 400 | `#5B606A` |
| Hero buttons | PingFang SC / system sans | `20/30px` | 600 | `#FFFFFF` |
| Action/CTA buttons | PingFang SC / system sans | `16/16px` | 600 | `#FFFFFF` |
| Section heading | PingFang SC / system sans | `40/40px` | 600 | `#1E3A5F` |
| Supporting copy | PingFang SC / system sans | `16/24px` | 400 | `#6B7280` |
| Capability title | PingFang SC / system sans | `24/24px` | 600 | `#1E3A5F` |
| National heading | SF Pro / system sans | `40/40px` | 700 | `#FFFFFF` |
| National metrics | SF Pro / system sans | `56/56px` | 700 | `#52E8FF` |
| Chart axes | Inter | `12px`, 100% line-height | 400 | `#666666` |
| Chart legend | SF Pro | `16/24px` | 400 | country color |
| Story quote | PingFang SC | `16/24px` | 500 | `#1E3A5F` |
| Story metadata | DM Sans | `14/21px` | 400 | `#9CA3AF` |

Native letter spacing is retained verbatim in the raw record; browser text uses zero tracking and system font fallbacks. Font shaping/antialiasing can differ by a few pixels, so this verification does not claim mathematically identical raster pixels.

All 122 visible HTML text nodes are checked against native font size, line height, font weight, and effective color/opacity. This page overrides shared footer logo typography to `14/20px 700` for the mark and `18/28px 700` for the name. Source SF Pro weights `590/510` are retained in page-scoped navigation/footer overrides. The highlighted wait value uses a `40px` baseline-aligned mixed-size row, inside the source `72px` content group.

## Components And Spacing

| Element | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- |
| Hero consultation CTA | `160 x 62px` | `16px 24px`, `8px` gap | `14px`, 90deg orange-blue gradient, `0 4px 6px -4px rgba(0,0,0,.1)` |
| Hero report CTA | `353 x 62px` | `16px 24px`, `8px` gap | `14px`, `#1E3A5F`, same shadow |
| Capability grid | `802.67 x 1224px` | 4 rows x 2 columns; row gap `24px`, column gap `24px` | outer grid `1216 x 1224px`, 3 columns, column gap `24px` |
| Expanded capability card | `389.33 x 390px` | `24px`, internal gap `80px` | `24px`, `#F5F6F7` |
| Collapsed capability card | `389.33 x 254px` | `24px`, internal gap `80px` | `24px`, `#F5F6F7` |
| Wait card | fluid x `232px` | `48px 24px`, 12px content gap | `14px`, `#F5F6F7`; highlighted card `rgba(221,107,32,.10)` |
| Story card | `389.333 x 273px` | `24px`, icon/content gap `80px` | `24px`, `#F5F6F7` |
| Story portrait | `60 x 60px` | - | `16px` radius |
| Story quote | fluid | - | `16/24px`, weight `500`, `#1E3A5F` |
| Final CTA actions | `52px` high | `48px` row top padding, `16px` gap, `16px 24px` horizontal/vertical button padding | `14px` radius, `16/16px` semibold text |
| Saving tags | widths `177/259/268/255/223px`, height `48px` | gap `24px`, padding `12px 24px` | radius `14px`, edge fade `160px` |
| Cost action buttons | `263 x 52px`, `388 x 52px` | gap `16px`, padding `18px 24px` | radius `14px`, source shadow |
| National story CTA | `267 x 52px` | gap `8px`, icon `20px` | radius `14px` |
| Final action buttons | `172 x 52px`, `184 x 52px` | icons `20px`/`16px`, gap `8px` | radius `14px` |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero doctor, globe, Shanghai skyline | `143:1302` | Figma original image, 1729 x 910, cover, 40% opacity over white; native vibrance `-.27` converted to browser saturation `.73` | `/public/images/figma/why-china-hero-source.png` |
| National medical network | `143:1790` | Figma original image, 2103 x 748, cover, 80% opacity, multiply over `#1E3A5F` | `/public/images/figma/why-china-national-source.png` |
| Capability icons | `143:1363`, `143:1382`, `143:1395`, `143:1408`, `143:1422`, `143:1435`, `143:1448`, `143:1461` | Figma SVG, 32px | `/public/images/figma/why-china-icons/` |
| Capability detail arrow | `143:1376` | Figma SVG, 14px, rotated for collapsed cards | `/public/images/figma/why-china-icons/node-143-1376.svg` |
| Singapore patient portrait | `143:1835` | Figma image layer, cover, 2x export | `/public/images/figma/why-story-singapore-source-2x.png` |
| Malaysia patient portrait | `143:1848` | Figma image layer, cover, 2x export | `/public/images/figma/why-story-malaysia-source-2x.png` |
| Europe patient portrait | `143:1861` | Figma image layer, cover, 2x export | `/public/images/figma/why-story-europe-source-2x.png` |
| Hero icons | `143:1342`, `143:1346` | Original SVG, 24px | `/public/images/figma/why-china-icons/node-143-<id>.svg` |
| Cost action icons | `143:1757`, `143:1761` | Original SVG, 16px | `/public/images/figma/why-china-icons/node-143-<id>.svg` |
| National story icon | `143:1821` | Original SVG, 20px | `/public/images/figma/why-china-icons/node-143-1821.svg` |
| Final CTA icons | `143:1922`, `143:1927`, `143:1934` | Original SVG, 20px/16px/12px | `/public/images/figma/why-china-icons/node-143-<id>.svg` |

Hero and national original image SHA-256 values match their embedded `.fig` assets. The chart SVG is only retained in `docs` as geometry evidence; the website uses ECharts CustomChart, axes, legend, and graphic grid lines.

Figma's native vibrance and CSS saturation are different rendering operations. The hero uses the recorded `-.27` value through browser saturation `.73`; this is a browser approximation, not a claim of identical Figma shader math. Its final image appearance was checked against the source export, within the requested small-pixel rendering tolerance.

## Prototype And Motion

| Interaction | Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Left-fixed/right-scrolling capability layout | Octagos sticky split sections | page scroll | native sticky; no scroll interception | natural one-column card flow |
| Capability detail expansion | Figma card affordance, Octagos restrained accordion | click or keyboard | `520ms cubic-bezier(.22,1,.36,1)` | same interaction, auto-height cards |
| Cost bars grow from baseline | Octagos dashboard transitions, adapted to this chart | viewport entry | `800ms cubicOut` | complete bars immediately below `768px`, with reduced motion, or without IntersectionObserver |
| Section entry | shared Huanyu reveal behavior | viewport entry | opacity/translate reveal | static visible content |

All motion preserves the Figma resting layout and is disabled or simplified for `prefers-reduced-motion`.

Octagos was revisited on `2026-09-29`: slow scrolling, a five-page fast scroll, Skip to Content, Device Volume tab switching, and repeated Fast & Free Setup / Proven EHR Expertise accordion switching. The inspected accordion uses `max-height .2s` and heading `color .2s`; the source also has a sticky dashboard at `91.6667px` and FAQ heading at `122.667px`. Huanyu keeps its own Figma composition and uses the timings in the table rather than copying those source dimensions or the immersive hero.

Consultation buttons use the existing shared dialog with focus lock, Escape close, and trigger focus restoration. CTA routes use `/report`, `/cost`, and `/cases`. Only the first capability has an authored expanded text branch in this source; other expanded descriptions are editable frontend content. No hospital administration or report-generation behavior is changed.

## Verification

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/why-china/2026-09-29/figma-source-2x.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/why-china/2026-09-29/local-1440.png`
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/why-china/2026-09-29/local-390.png`
- Source-map evidence: `docs/figma-verification/why-china/2026-09-29/source-map-results.json`
- Interaction evidence: `docs/figma-verification/why-china/2026-09-29/interaction-results.json`
- Verification run: `2026-09-29`
- Desktop geometry: all seven content sections and footer match native boundaries within `.02px`; 23 key geometry checks are under `1px`.
- Source map: all `778` node mappings resolve, including all mapped visible text checks.
- Text styles: all `122` HTML text nodes pass font size, line height, weight, and effective color/opacity checks. Six CTA shadow checks pass, including the deliberately hidden shadow on the final report button.
- Four-width checks: `1440/1024/768/390`; no overflow, clipped controls, broken images, console errors, or failed resources.
- State checks: eight cards, Enter/Space activation, consultation Tab containment, Escape, focus restoration, cost/cases routes pass.
- ECharts checks: nonblank canvas, viewport entry animation, reduced-motion and mobile complete bar states pass.
- Final visual review: all eight desktop source/local section pairs and all eight mobile adaptation crops reviewed after the last UI change; highlight baseline and footer typography corrections confirmed.
- Mobile capture: viewport tiles avoid Chromium's 2x long-page texture limit; the actual bottom viewport is additionally recorded in `mobile-footer-viewport.png`.
- Raster comparison: `1.9625%` of pixels exceed pixelmatch's `.15` color threshold with antialiasing excluded. This number is not a fidelity percentage; source/local crops were reviewed directly. Font tracking/fallback, shader and shadow rasterization retain the rendering tolerances described above.
- Type/build checks: `pnpm exec vue-tsc -b`, `pnpm exec vite build`, and `git diff --check` passed after the last UI change.
- Page-specific gate: `pnpm run audit:figma why-china.md` passed after final visual review. Final delivery status remains withheld because the mandatory whole-project gate below failed.
- Whole-project gate: `pnpm run audit:figma` and `pnpm build` passed on 2026-09-29 after all verification evidence was moved into the project and refreshed.
- Remaining visual differences: none outside the documented small-pixel renderer tolerances
- Remaining differences: none
