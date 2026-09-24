# 为什么选择中国

- Route: `/why-china`
- Figma frame: `03寰宇云医 - 为什么选择中国`
- Node ID: `143:1299`
- Source baseline HTML: `docs/figma-source/why-china/frame.html`
- Source baseline CSS: `docs/figma-source/why-china/styles.txt`
- Source asset manifest: `docs/figma-source/why-china/assets.json`
- Source extraction run: `2026-09-24 Dev Mode HTML expansion from node 143:1299`
- Desktop frame: `1440 x 5655px`
- Mobile frame: no dedicated frame found; implemented as a responsive adaptation of the desktop source
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:1299` | `03寰宇云医 - 为什么选择中国` frame | — | `.why-page` | `1440 x 5655px` | Source frame |
| `143:1301` | `Main Content` auto-layout | `143:1300` | page section flow | `1440 x 5199px` | Header/footer shell-owned |
| `143:1302` | Hero section | `143:1301` | `.why-hero` | `1440 x 757px`, padding `180px` top | Hero background asset |
| `143:1353` | Capability container | `143:1301` | `.capability-section` | `1216px` content, 8-card grid | First card expanded |
| `143:1473` | Cost comparison section | `143:1301` | `.cost-section` | `1440 x 957.26px` | Six-country chart and action strip |
| `143:1766` | Wait-time section | `143:1301` | `.wait-section` | `1440 x 552px`, 4 cards | Fourth card highlighted |
| `143:1790` | National strength section | `143:1301` | `.national-section` | `1440 x 512px`, full bleed | Background blend asset |
| `143:1824` | Patient stories section | `143:1301` | `.stories-section` | `1440 x 593px`, 3 cards | Portrait assets |
| `143:1912` | Final CTA section | `143:1301` | `.why-cta` | `1440 x 412px` | Visible CTA branch |
| `143:1958` | Footer | `143:1299` | `PatientFooter.vue` | `1440 x 456px` | Shared shell |

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
| 3 | 全球费用对比 | `143:1473` | 1440 | 957.26 | `1216px`; heading `1216 x 80`; chart/content `1216 x 547.26` with 48px top padding; lower action strip `1440 x 138` | six-country comparison and editable constants; section has 1px bottom border |
| 4 | 全球等待时长 | `143:1766` | 1440 | 552 | `1216px`, 4 columns; section padding top/bottom `96px` | fourth card highlighted |
| 5 | 国家级医疗实力 | `143:1790` | 1440 | 512 | full-bleed background; `1216px` content; section padding top/bottom `96px` | background image opacity `80%`, multiply blend, fill `#1E3A5F`; four metrics and CTA |
| 6 | 国际患者反馈 | `143:1824` | 1440 | 593 | `1216px`, 3 columns; section padding top/bottom `96px` | Figma patient portraits and copy |
| 7 | Final CTA | `143:1912` | 1440 | 412 | centered content; inner content `1440 x 220`; section padding top/bottom `96px` | visible CTA uses `#F5F6F7`; hidden alternate gradient section `143:1873` is excluded |
| 8 | Shared footer | shared component | 1440 | 456 | `1216px` content | common patient footer |

The seven content sections total `5199px`; with the `456px` footer the page is exactly `5655px` high.

## Typography

| Element | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | ---: | --- |
| Hero heading | PingFang SC / system sans | `64/96px` | 600 | `#143162`, second line `#1E3A5F` |
| Hero supporting copy | PingFang SC / system sans | `20/30px` | 400 | `#5B606A` |
| Hero and CTA buttons | PingFang SC / system sans | `20/30px` | 600 | `#FFFFFF` |
| Section heading | SF Pro / system sans | `40/40px` | 600 | `#1E3A5F` |
| Supporting copy | PingFang SC / system sans | `16/24px` | 400 | `#6B7280` |
| Capability title | PingFang SC / system sans | `22/28px` | 700 | `#1E3A5F` |
| National heading | SF Pro / system sans | `40/40px` | 700 | `#FFFFFF` |
| National metrics | SF Pro / system sans | `56/56px` | 700 | `#52E8FF` |

## Components And Spacing

| Element | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- |
| Hero consultation CTA | `160 x 64px` | `24px` horizontal, `10px` gap | `14px`, orange-blue gradient, soft shadow |
| Hero report CTA | `354 x 64px` | `24px` horizontal, `10px` gap | `14px`, `#1E3A5F`, soft shadow |
| Capability grid | `802.67 x 1224px` | 4 rows x 2 columns; row gap `24px`, column gap `24px` | outer grid `1216 x 1224px`, 3 columns, column gap `24px` |
| Expanded capability card | `389.33 x 390px` | `24px`, internal gap `80px` | `24px`, `#F5F6F7` |
| Collapsed capability card | `389.33 x 254px` | `24px`, internal gap `80px` | `24px`, `#F5F6F7` |
| Wait card | fluid x `232px` | `48px 24px`, 12px content gap | `14px`, `#F5F6F7`; highlighted card `rgba(221,107,32,.10)` |
| Story card | fluid x `272px` | `24px` | `24px`, `#F5F6F7` |
| Story portrait | `60 x 60px` | - | `16px` radius |
| Story quote | fluid | - | `16/24px`, weight `500`, `#1E3A5F` |
| Final CTA actions | `52px` high | `48px` row top padding, `16px` gap, `16px 24px` horizontal/vertical button padding | `14px` radius, `16/16px` semibold text |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero doctor, globe, Shanghai skyline | `143:1302` | Figma image layer, cover | `/public/images/figma/why-china-hero-background.png` |
| National medical network | `143:1790` | Figma image layer, cover, multiply/80% | `/public/images/figma/why-china-national-background.png` |
| Singapore patient portrait | `143:1824` | Figma image instance, cover | `/public/images/figma/why-story-singapore.png` |
| Malaysia patient portrait | `143:1824` | Figma image instance, cover | `/public/images/figma/why-story-malaysia.png` |
| Europe patient portrait | `143:1824` | Figma image instance, cover | `/public/images/figma/why-story-europe.png` |

## Prototype And Motion

| Interaction | Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Left-fixed/right-scrolling capability layout | Octagos sticky split sections | page scroll | native sticky; no scroll interception | natural one-column card flow |
| Capability detail expansion | Figma card affordance, Octagos restrained accordion | click or keyboard | `520ms cubic-bezier(.22,1,.36,1)` | same interaction, auto-height cards |
| Cost bars grow from baseline | Octagos viewport data reveals | viewport entry | `800ms cubic-bezier(.22,1,.36,1)`, `70ms` country stagger | visible without initial hiding below `767px` |
| Section entry | shared Huanyu reveal behavior | viewport entry | opacity/translate reveal | static visible content |

All motion preserves the Figma resting layout and is disabled or simplified for `prefers-reduced-motion`.

## Verification

- Figma reference screenshot: `/tmp/huanyu-figma-reference/why-china.png`
- Local desktop screenshot: `/tmp/huanyu-why-china-desktop-verified.png`
- Local mobile screenshot: `/tmp/huanyu-why-china-mobile-verified.png`
- Verification run: `2026-09-24`
- Remaining differences: none
- Desktop render: `1440 x 5655px`, matching the Figma frame and all section boundaries.
- Desktop checks: no horizontal overflow, broken images, or unrevealed content after sequential viewport scrolling; page height `5655px` matches the Figma frame.
- Mobile render: `390px` viewport, no horizontal overflow, broken images, or unrevealed content.
- Interaction checks: all eight capability cards expand without changing page height; cost bars animate from baseline to final values.
- 2026-09-23: Re-read the Dev Mode source frame `143:1299`, corrected hero typography and split-line colors, capability copy, waiting-card labels/highlight structure, national metric styles, story-card typography/metadata, and final CTA spacing. Browser checks passed at `1440px` and `390px`; source frame and responsive page heights remain `5655px` and `8335px` respectively.
