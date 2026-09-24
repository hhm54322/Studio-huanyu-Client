# 信任与常见问题

- Route: `/trust`
- Figma frame: `04寰宇云医 - 信任与常见问题`
- Node ID: `143:2528`
- Source baseline HTML: `docs/figma-source/trust/frame.html`
- Source baseline CSS: `docs/figma-source/trust/styles.txt`
- Source asset manifest: `docs/figma-source/trust/assets.json`
- Source extraction run: 2026-09-24, Figma Dev Mode through `browser-client` and the `iab` tab; full Code and Text Styles expanded before capture
- Desktop frame: `1440 x 4165.04px`
- Mobile frame: no separate authored frame; verified responsive adaptation at `390 x 844px`
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:2528` | 04寰宇云医 - 信任与常见问题 / Frame | file page | `TrustView.vue` plus patient layout | `1440 x 4165.04`; vertical page composition | root source frame |
| `143:2529` | Body / Frame | `143:2528` | `.trust-page` plus shared header/footer | `1440 x 4165.04`; relative root | contains main content and overlay header |
| `143:2530` | Main Content / Frame | `143:2529` | `.trust-page` main sections | `1440 x 3709.04`; vertical Auto Layout | five ordered page sections |
| `143:2531` | 就医保障 · 信任中心 / Section | `143:2530` | `.trust-hero` | `1440 x 757`; padding `180 112 96`; gap `48`; image fill at 40% | source image and assurance state |
| `143:2540` | 正规企业资质 / Icon | `143:2531` | first `.assurance-icon` | `32 x 32` | `Icon-22.svg` |
| `480:1338` | 医疗机构 / shared Icon | `143:2531` | second `.assurance-icon` | `32 x 32` | `Icon-15.svg` |
| `143:2568` | 全程直连 / Frame icon | `143:2531` | third `.assurance-icon` | `32 x 32` | `Frame-3.svg` |
| `143:2579` | 权益保障 / Frame icon | `143:2531` | fourth `.assurance-icon` | `32 x 32` | `Frame-4.svg` |
| `143:2565` | 查看详情 / Icon | `143:2531` | `.assurance-chevron` | `14 x 14` | rotated for expanded state |
| `143:2589` | 20个高频就医疑问 / Section | `143:2530` | `.faq-section` | `1440 x 650.04`; padding `96 0`; inner `389 + 25 + 802` | first answer expanded at rest |
| `143:2603` | FAQ expanded / Icon | `143:2589` | active `.faq-chevron` | `24 x 24` | `Icon-18.svg` |
| `143:2616` | FAQ collapsed / Icon | `143:2589` | inactive `.faq-chevron` | `24 x 24` | `Icon-11.svg` |
| `143:2638` | 8篇信任深度长文 / Section | `143:2530` | `.articles-section` | `1440 x 1136`; padding `96 40`; `3 x 3`, gap `24` | eight authored cards |
| `143:2708` | JCI认证 / Icon | `143:2638` | JCI `.article-icon` | `32 x 32` | `Icon-6.svg` |
| `143:2646` | 费用结构 / Icon | `143:2638` | cost `.article-icon` | `32 x 32` | `Icon-9.svg` |
| `143:2655` | 医生资质 / Frame icon | `143:2638` | doctor `.article-icon` | `32 x 32` | `Frame-2.svg` |
| `143:2663` | 药品安全 / Icon | `143:2638` | medicine `.article-icon` | `32 x 32` | `Icon-8.svg` |
| `143:2671` | 感染控制 / Icon | `143:2638` | infection `.article-icon` | `32 x 32` | `Icon-7.svg` |
| `143:2682` | 权益保障 / Icon | `143:2638` | rights `.article-icon` | `32 x 32` | `Icon-12.svg` |
| `143:2690` | 数据隐私 / Icon | `143:2638` | privacy `.article-icon` | `32 x 32` | `Icon-3.svg` |
| `143:2699` | 穆斯林保障 / Frame icon | `143:2638` | Muslim-care `.article-icon` | `32 x 32` | `Frame-1.svg` |
| `143:2719` | 阅读全文 / Icon | `143:2638` | `.arrow-icon` | `16 x 16` | `Icon-2.svg` |
| `204:5636` | 来华就医全流程工具包 / Section | `143:2530` | `.toolkit-section` | `1440 x 754`; padding `96 40`; inner `389 + 25 + 802` | sticky desktop copy, natural mobile flow |
| `204:5652` | 病历翻译 / Frame icon | `204:5636` | first `.tool-icon` | `32 x 32` | `Frame.svg` |
| `204:5666` | 可行性评估 / Icon | `204:5636` | second `.tool-icon` | `32 x 32` | `Icon-21.svg` |
| `143:2900` | Final CTA / Section | `143:2530` | `.trust-cta` | `1440 x 412`; padding `96 0`; orange-to-blue 90deg gradient | three business entries |
| `143:2909` | 免费问阿宁 / Icon | `143:2900` | first `.cta-icon` | `20 x 20` | `Icon-1.svg` |
| `143:2913` | 生成可行性报告 / Icon | `143:2900` | second `.cta-icon` | `20 x 20` | `Icon-17.svg` |
| `143:2918` | 预约专家 / Icon | `143:2900` | third `.cta-icon` | `20 x 20` | `Icon-10.svg` |
| `143:2923` | CTA assurance / Icon | `143:2900` | `.trust-cta small img` | `12 x 12` | `Icon-19.svg` |
| `484:1473` | 问阿宁 / shared Icon | shared header | `PatientHeader.vue .ask-aning img` | `14 x 14` | `Icon-5.svg` |
| `484:1497` | 语言 / shared Icon | shared header | `PatientHeader.vue .language-button img` | `14 x 14` | `Icon-4.svg` |
| `143:2981` | 邮箱 / Icon | shared footer | `PatientFooter.vue` email image | `16 x 16` | `Icon.svg` |
| `143:2987` | 电话 / Icon | shared footer | `PatientFooter.vue` phone image | `16 x 16` | `Icon-20.svg` |
| `143:2992` | WhatsApp / Icon | shared footer | `PatientFooter.vue` WhatsApp image | `16 x 16` | `Icon-13.svg` |

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Hero and assurances | `143:2531` | 1440 | 757 | `1216`, four `286px` columns, `24px` gap | first card `373px`, others `263px` |
| FAQ | `143:2589` | 1440 | 650.04 | `389px + 25px + 802px` | first row expanded |
| Articles | `143:2638` | 1440 | 1136 | three `389px` columns and `24px` gaps | card `389 x 256`, radius `24px` |
| Toolkit | `204:5636` | 1440 | 754 | `389px + 25px + 802px` | cards `389 x 305`, radius `24px` |
| CTA | `143:2900` | 1440 | 412 | centered `1216px` | button gap `16px`, height `48px` |
| Shared footer | `143:2529` | 1440 | 456 | `1216px` | `#021D2E`, `64px` vertical padding |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title | `143:2531` | PingFang SC | `64 / 96px` | 600 | `#143162` |
| Hero subtitle | `143:2531` | PingFang SC | `20 / 30px` | 400 | `#5B606A` |
| Assurance title | `143:2531` | PingFang SC | `24 / 36px` | 600 | `#1E3A5F` |
| FAQ section title | `143:2589` | SF Pro | `40 / 40px` | 700 | `#1E3A5F` |
| FAQ question | `143:2589` | PingFang SC | `24 / 28.8px` | 600 | `#1E3A5F` |
| Article/tool title | `143:2638` / `204:5636` | PingFang SC | `24 / 24px` | 600 | section foreground |
| CTA title | `143:2900` | PingFang SC | `40 / 40px` | 600 | white |
| CTA button | `143:2900` | PingFang SC / SF Pro | `16 / 16-24px` | 600 | authored button foreground |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Assurance card | `143:2531` | `286 x 263/373` | `24px`; internal gap `80px` | `24px`; `0 1px 20px rgba(237,247,254,.7)` |
| FAQ row | `143:2589` | `802 x auto` | `24px 0` | bottom border `#DBDEE6` |
| Article card | `143:2638` | `389 x 256` | `24px` | `24px`; white |
| Toolkit card | `204:5636` | `389 x 305` | `24px`; internal gap `80px` | `24px`; `#0F213E` |
| CTA buttons | `143:2900` | auto `x 48` | `12/16px 24px`; gap `8px` | `14px`; authored fill/outline |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero hospital and clinician image | `143:2531` | original `1742 x 903`, cover, 40% layer opacity | `public/images/figma/trust/hero-source.png` |
| Four assurance icons | `143:2540`, `480:1338`, `143:2568`, `143:2579` | SVG, authored `32 x 32` | `public/images/figma/trust/` |
| Assurance and FAQ arrows | `143:2565`, `143:2603`, `143:2616` | SVG, authored sizes | `public/images/figma/trust/` |
| Eight article icons | `143:2708`, `143:2646`, `143:2655`, `143:2663`, `143:2671`, `143:2682`, `143:2690`, `143:2699` | SVG, `32 x 32` | `public/images/figma/trust/` |
| Toolkit icons | `204:5652`, `204:5666` | SVG, `32 x 32` | `public/images/figma/trust/Frame.svg`, `public/images/figma/trust/Icon-21.svg` |
| CTA icons | `143:2909`, `143:2913`, `143:2918`, `143:2923` | SVG, authored sizes | `public/images/figma/trust/` |
| Shared header icons | `484:1473`, `484:1497` | SVG, `14 x 14` | `public/images/figma/trust/Icon-5.svg`, `public/images/figma/trust/Icon-4.svg` |
| Shared footer contact icons | `143:2981`, `143:2987`, `143:2992` | SVG, `16 x 16` | `public/images/figma/trust/` |

The complete one-to-one filename, order, size, and Node ID mapping for all 29 exports is locked in `docs/figma-source/trust/assets.json`.

## Prototype And Motion

| Interaction | Figma/Octagos reference | Trigger | Timing/Easing | Mobile fallback |
| --- | --- | --- | --- | --- |
| Assurance cards | Figma expanded/collapsed state | click, Enter, Space | `520ms cubic-bezier(.22,1,.36,1)` height; no page-height shift | single-column accordion |
| FAQ rows | Figma first-row expanded state | click | `250ms` opacity/translate transition | same keyboard and touch behavior |
| Article/tool cards | Octagos restrained depth response | hover/focus | `350ms cubic-bezier(.22,1,.36,1)`, `-5px` only | no required hover |
| Toolkit copy | Octagos split-section motion | scroll | sticky at desktop section boundary | normal document flow |
| Section entry | Octagos reveal vocabulary | first viewport entry | `620-720ms`; observer unhooks after first reveal | reveal disabled below `768px` |
| Reduced motion | accessibility fallback | OS preference | transitions reduced and every node visible | same |

## Verification

- Figma reference screenshot: `docs/figma-verification/trust/figma-reference-2x.png`
- Local desktop screenshot: `artifacts/trust/local-desktop-1440.png`
- Local mobile screenshot: `artifacts/trust/local-mobile-390.png`
- Desktop geometry: document `1440 x 4165`; sections `757 / 650.04 / 1136 / 754 / 412`; shared footer `456`; horizontal overflow `0`.
- Pixel comparison: 2x Figma export normalized to `1440 x 4165`; overall mean absolute RGB difference `4.60 / 255`; section values `6.64 / 6.99 / 2.74 / 5.27 / 3.15 / 2.61` including footer.
- Mobile geometry: real `390 x 844` viewport; `clientWidth === scrollWidth === 390`; no hidden reveal nodes or broken images.
- Interaction evidence: assurance state changed `263 -> 373px` without changing document height; FAQ answer changed one-at-a-time; consultation opened, focused `#consult-name`, and closed with Escape; `/report` and `/steps` links resolved.
- Consultation submission now posts to `/api/consultations` with request-id deduplication, explicit submitting/error states, and focus restoration after closing the panel.
- Latest program regression screenshot: `artifacts/program-regression/consultation-success.png`; successful submission moves focus to the completion action, loops focus within the dialog, and restores focus to the opener on close.
- Shared footer re-check: Figma node `143:1024` contains the authored `80 x 80px` translucent “扫码加微信” placeholder, not a QR bitmap/vector asset. The implementation preserves that authored placeholder and makes email, telephone, and WhatsApp actionable links.
- Motion evidence: card hover settled at about `translateY(-5px)`; all `19/19` reveal nodes remained visible after scrolling; toolkit copy computed `position: sticky`; reduced-motion state left every reveal node visible with no transform.
- Verification run: 2026-09-24
- Remaining differences: none
