# 关于我们

- Route: `/about`
- Figma frame: `04寰宇云医 - 关于我们`
- Node ID: `484:1703`
- Source baseline HTML: `docs/figma-source/about/frame.html`
- Source baseline CSS: `docs/figma-source/about/styles.txt`
- Source asset manifest: `docs/figma-source/about/assets.json`
- Source extraction run: `2026-09-24 Dev Mode HTML/CSS expansion from node 484:1703`
- Desktop frame: `1440 x 4916px`, vertical Auto Layout, hug height
- Mobile frame: responsive adaptation of the desktop source; no separate mobile frame exists in this Figma page
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `484:1703` | `04寰宇云医 - 关于我们` frame | — | `.about-page` | `1440px` wide root frame | Source frame |
| `484:1705` | `Main Content` auto-layout | `484:1703` | `<main>` | `1440px` fill, vertical auto-layout | Shared header/footer remain shell-owned |
| `484:1706` | Hero section | `484:1705` | `.about-hero` | `1440 x 757px`, padding `180 112 146` | Hero image exported from Figma |
| `484:1707` | `Frame 74` auto-layout frame | `484:1706` | `.about-hero__content` | `1216 x 274px`; centered | Inner text column is `772px`; parent gap to CTA is `60px` |
| `484:1713` | `Link` CTA | `484:1706` | `.about-hero > .about-primary-button` | padding `16px 24px`, radius `14px`, background `#DD6B20`, parent top gap `60px` | Opens existing consultation panel |
| `484:1718` | Network section | `484:1705` | `.about-network` | `1440 x 708px`, padding `96px`, gap `48px` | Metrics and 3 cards |
| `484:2070` | Complex cases section | `484:1705` | `.about-complex` | `1440 x 839px`, padding `96px`, background `#1E3A5F` | Card nodes `484:2092`, `484:2106`, `484:2116`, `484:2126` |
| `484:2243` | Matching workflow section | `484:1705` | `.about-matching` | Dev Mode `1440 x 648px` content, section padding `96px`; visible current workflow branch | Current visible section; child content `484:2244`, grid wrapper `484:2251` |
| `484:2137` | Hidden legacy comparison section | `484:1705` | not rendered | Dev Mode `1440 x 576px` content; hidden legacy branch | Do not implement as a visible section |
| `484:2305` | Trust section | `484:1705` | `.about-proof` | `1440 x 948px`, padding `96px`, background `#F5F6F7` | Four trust cards |
| `484:2369` | Contact CTA section | `484:1705` | `.about-cta` | `1440 x 368px`, padding `96px`, background `#1E3A5F` | CTA image exported from Figma |

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Hero | `484:1706` | 1440 fill | 757px fixed | Vertical, padding `180 112 146`, gap `60` | White image stage; `Frame 74` is `1216 x 274px`; hero title node is `772 x 192px`; CTA is a sibling node |
| Network metrics and cards | `484:1718` | 1440 fill | 708px hug | Vertical, `96px` vertical padding, gap `48px` | Heading, four metrics and three cards: `看医院 / 看专家 / 看城市` |
| Hidden legacy layer | `484:1793` | 1440px | 978px hug | Not rendered in the exported frame | Do not implement as a visible section |
| Complex cases | `484:2070` | 1440 fill | 839px hug | `96px` vertical padding; inner `1216 x 647px`; 2 x 2, `24px` gaps | `#1E3A5F`; orthopedic, oncology, chronic/immune and dental states |
| Matching workflow | `484:2243` | 1440 fill | 840px hug | `96px` vertical padding; child content `484:2244` is `1440 x 648px`; grid wrapper `484:2251` is `1216 x 568px` with top padding `48px`; 2 x 3, `24px` gaps | Six-step path headed `匹配的全流程，每一步都可解释` |
| Hidden legacy comparison | `484:2137` | 1440 fill | 768px hug | `96px` vertical padding; content `1440 x 576px` | Hidden in current Figma frame; do not render |
| Verifiable trust | `484:2305` | 1440 fill | 948px hug | `96px` vertical padding; inner `1216 x 756px`; 2 x 2, `24px` gaps | `#F5F6F7`; subjects, privacy, medical boundary, official verification |
| Contact CTA | `484:2369` | 1440 fill | 368px hug | `96px` vertical padding | `#1E3A5F` base plus exported Figma image layer |

The root `Main Content` is `484:1705`, `1440px` fill by `4460px` hug. Shared footer and header are `484:2382` and `484:2459`; the existing patient shell remains their owner.

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero heading | `484:1710` | PingFang SC | `64px / 96px` | 600 | `#143162` |
| Hero heading width | `484:1710` | PingFang SC | `772 x 192px`, centered | 600 | `#143162` |
| Network heading | `484:1720` | PingFang SC | `40px / 40px` | 600 | `#1E3A5F` |
| Network paragraph | `484:1722` | PingFang SC | `16px / 24px` | 400 | `#6B7280` |
| Hero paragraph | `484:1712` | PingFang SC | `20px / 29px` | 400 | `#5B606A`, letter spacing `-0.439px` |
| Network metric number | `484:1727` (`100+`) | `484:1718` | `.network-stat strong` | `56px / 56px`, SF Pro, weight `700`, letter spacing `0.35px` | `#2563EB` |
| Network metric label | `484:1729` (`合作医疗机构`) | `484:1718` | `.network-stat span` | `14px / 20px`, SF Pro, weight `400` | `#6B7280` |
| Network card title | `484:1756` | `484:1748` | `.network-card h3` | `24px / 24px`, weight `600`, letter spacing `-0.4395px` | `#1E3A5F` |
| Network card body | `484:1758` | `484:1748` | `.network-card p` | `16px / 24px`, weight `400` | `#4B5563` |
| Complex case title | `484:2092` / `484:2106` / `484:2116` / `484:2126` card text nodes | `484:2070` | `.complex-card h3` | `24px / 24px`, weight `600` | `#FFFFFF` |
| Complex case body | `484:2092` / `484:2106` / `484:2116` / `484:2126` card text nodes | `484:2070` | `.complex-card p` | `16px / 24px`, weight `400` | `rgba(255,255,255,0.70)` |
| Complex case CTA | `484:2092` | `484:2092` | `.complex-card__read` | `16px / 16px`, weight `500` | `#DD6B20` |
| Contact CTA heading | `484:2369` | `484:2369` | `.about-cta h2` | `40px / 40px`, weight `600`, letter spacing `0.40px` | `#1E3A5F` |
| Contact CTA body | `484:2369` | `484:2369` | `.about-cta p` | `16px / 24px`, weight `400` | `#6B7280` |

Hero copy: `把你的病情 交给最适合接住它的那双手`.

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Hero content frame | `484:1707` | `1216 x 274px` hug | inner text column `772px`; paragraph top gap `24px`; centered | no border/effect |
| Hero CTA | `484:1713` | `124px` content width, `52px` total box height | parent top gap `60px`; padding `16px 24px`; icon/text gap `8px` | radius `14px`, fill `#DD6B20` |
| Contact CTA button | `484:2370` | `484:2369` | `.about-cta .about-primary-button` | hug width, `48px` total box height; parent top gap `48px`; padding `12px 24px`; icon/text gap `8px` | radius `14px`, fill `#DD6B20` |
| Network frame | `484:1719` | `1216 x 80px` hug | vertical title/body, gap `16px`; centered | no border/effect |
| Network metrics grid | `484:1724` | `1216 x 92px` | 1 row x 4 columns, `24px` row/column gap; parent top/bottom gaps `48px` | Dividers are `1 x 70px` |
| Network card grid | `484:1748` | `1216 x 248px` | 1 row x 3 columns, `24px` row/column gap; parent top gap `48px` | Each card is `389.33 x 248px` |
| Complex grid | `484:2070` inner Container:margin | `1216 x 520px` | 2 rows x 2 columns, `24px` row/column gap | Each card `596 x 248px`, radius `24px`, border `1px`, padding `24px`, gap `80px`, fill `#0F213E` |
| Matching content | `484:2244` | `1440 x 648px` | Parent vertical padding `96px` | Visible current branch |
| Matching grid | `484:2251` | `1216 x 568px` (content box `1216 x 520px`) | top padding `48px`; 2 rows x 3 columns, `24px` row/column gap | Each card `389.33 x 248px`; radius `24px`, border `1px`, padding `24px`, gap `80px`, fill `#F5F6F7` |
| Trust grid | `484:2305` inner Container:margin | `1216 x 628px` | 2 rows x 2 columns, `24px` row/column gap; wrapper top padding `48px` | Each card `596 x 302px`, radius `24px`, border `1px`, padding `24px`, gap `80px`, fill `#FFFFFF` |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero image layer | `484:1706`, hash `d2a1f870c81a1fc83c1e47406c2b133e` | Figma-native download, cover | `/public/images/figma/about-hero.jpg` |
| Complex case active image | `484:2070` row 1 / column 1, image hash `7974262c40da8127945be8a53e71db31fb4a2e57` | Figma-native download, cover, opacity `15%` | `/public/images/figma/about-complex-knee.png` |
| CTA image layer | `484:2369`, hash `df3413872355a84f57d6375ec0744d525ad39ca2` | Figma-native download, cover | `/public/images/figma/about-cta-background.png` |
| Shared header/footer | `484:2459`, `484:2382` | Existing shared components | `src/components/layout/PatientHeader.vue`, `PatientFooter.vue` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Section reveal | Octagos scroll/reveal vocabulary | viewport entry | opacity + `translateY(22px)` + blur, `0.6s` cubic-bezier, stagger from `--reveal-delay`; no layout drift | static visible content when motion is reduced |
| Complex case switch | Figma authored card interaction | card click/keyboard | background/image opacity settles in `0.4s`; card hover lift `4px` over `0.42s`; no geometry changes | single-column buttons, same state model |
| Trust evidence | Figma card affordance | card action | copy-state change in place; card lift `4px` over `0.32s`; no scroll jump | stacked cards with the same expand/collapse control |
| CTA | Figma `484:1713` | click | opens existing consultation side panel; panel enters from right in `0.38s` cubic-bezier | full-width panel with body scroll lock |

## Verification

- Figma reference screenshot: `/Users/hhm/Downloads/04寰宇云医 - 关于我们 (2).png`
- Local desktop screenshot: `/tmp/huanyu-about-desktop-verified.png`; route `http://127.0.0.1:5173/about`, `1440 x 900`, full-page after scrolling each section into the viewport; measured document height `4916px`
- Local mobile screenshot: `/tmp/huanyu-about-mobile-verified.png`; `390 x 844`, full-page after section-by-section scroll; measured document height `7197px`, `scrollWidth === innerWidth`
- Interaction evidence: complex case switch, detail modal focus and Escape close, trust-detail focus and Escape close, body scroll lock/unlock, CTA consultation panel, reduced-motion fallback, and asset URL resolution verified in tab `36`
- Build and lint evidence: bundled-node production build, typecheck, and `git diff --check` recorded on `2026-09-24`
- Verification run: `2026-09-24`
- Remaining differences: none
