# 首页

- Route: `/`
- Figma frame: `01寰宇云医 - 首页`
- Node ID: `143:45`
- Source baseline HTML: `docs/figma-source/home/frame.html`
- Source baseline CSS: `docs/figma-source/home/styles.txt`
- Source asset manifest: `docs/figma-source/home/assets.json`
- Source extraction run: `2026-09-24 Dev Mode HTML/CSS expansion from node 143:45`
- Desktop frame: `1440 x 8806px`
- Mobile frame: responsive adaptation of the desktop source; no separate mobile frame exists in this Figma page
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:45` | `01寰宇云医 - 首页` frame | — | `.home-page` | `1440 x 8806px`, vertical hug | Source frame |
| `143:47` | `Main Content` auto-layout | `143:46` | `.home-page` section flow | `1440 x 8350px`, vertical auto-layout | Header/footer remain shell-owned |
| `143:48` | Hero section | `143:47` | `.home-hero` | `1440 x 754px`, fixed stage | `143:52` image, carousel state |
| `143:81` | Journey flow section | `143:47` | `.home-flow` | `1440 x 516px`, padding `96px` | Four step links |
| `143:128` | China advantages section | `143:47` | `.why-overview` | `1440 x 1208px`, `#F5F6F7` | Sticky rail + 6 cards |
| `143:209` | Patient story section | `143:47` | `.patient-story` | `1440 x 720px` | `143:209` story image |
| `143:377` | Global care section | `143:47` | `.care-section` | `1440 x 544px` | Three route cards |
| `143:413` | Team section | `143:47` | `.team-section` | `1440 x 596px` | Four portrait instances |
| `143:450` | Medical data section | `143:47` | `.data-section` | `1440 x 740px` | Radar and cost chart |
| `143:671` | Hospital section | `143:47` | `.hospital-section` | `1440 x 703px` | Four hospital image cards |
| `143:708` | Expert section | `143:47` | `.expert-section` | `1440 x 667px` | Three authored tab states |
| `143:827` | Strength section | `143:47` | `.strength-section` | `1440 x 699px` | `143:827` image instance |
| `143:847` | Partner section | `143:47` | `.partners-section` | `1440 x 791px` | `143:847` matrix marquee |
| `143:987` | Final CTA section | `143:47` | `.home-cta` | `1440 x 412px` | Three CTA actions |
| `143:1024` | Footer | `143:45` | `PatientFooter.vue` | `1440 x 456px` | Shared shell component |
| `143:1101` | Header | `143:45` | `PatientHeader.vue` | `1440 x 64px` overlay | Shared shell component |

## Page Structure

- `Body` (`143:46`): `1440px` fill x `8806px` hug.
- `Main Content` (`143:47`): vertical flow, `1440px` fill x `8350px` hug.
- `Footer` (`143:1024`): `1440px` fill x `456px` hug.
- `Header` (`143:1101`): `1440 x 64px` hug; it overlays the page and does not add to the body height.
- Header container (`143:1102`): horizontal flow, `1280 x 64px`, max-width `1280px`, `space-between`, horizontal padding token `item spacing/m`.
- Header logo link (`143:1103`): `111 x 32px` hug.

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

## Final CTA

- Section `143:987`: `1440 x 412px`, `96px` top/bottom padding; inner content `143:988` is `1440 x 220px`.
- Heading: `40px / 40px`, weight `600`, `0.4px` source letter spacing retained as the nearest project token.
- Supporting copy: `16px / 24px`, `rgba(255,255,255,.80)`, top margin `16px`.
- Button row: `48px` top padding, `16px` gap; white primary is `52px` high with `16px 24px` padding; outline and dark actions are `48px` high with `12px 24px` padding; all use `14px` radius and `16px / 24px` semibold text.
- Benefits row: `24px` top margin, `12px / 16px` text, `rgba(255,255,255,.60)`.

## Shared Typography

Section headings are based on the verified journey heading style: SF Pro Bold 700, 40/40px, centered, `#1E3A5F`. Each later section heading must still be selected in Figma to confirm whether it overrides this shared style.

Figma contains positive or negative letter-spacing values on some text nodes. The implementation uses `letter-spacing: 0` to comply with the project UI rule while retaining all other Figma typography values.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero patient image | `143:52` | Figma bitmap, cover | `/public/images/figma/patient-hero.png` |
| Global care artwork | `143:827` | Figma image, contain | `/public/images/figma/global-care.png` |
| Partner logo matrix | `143:847` | Figma image, cover | `/public/images/figma/partners-matrix.png` |
| Patient story image | `143:209` | Figma image, cover | `/public/images/figma/patient-story.png` |
| Team portraits | `143:413` | Figma image instances, cover | `/public/images/figma/team-medical-steward.png`, `/public/images/figma/team-interpreter.png`, `/public/images/figma/team-advisor.png`, `/public/images/figma/team-coordinator.png` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Hero carousel | Figma prototype + source frame `143:48` | arrows, dots, timed advance | `7000ms`, `0.55s` opacity/scale settle | swipe/natural controls |
| China advantages story | Octagos left-pinned/right-scrolling language | page scroll | sticky rail remains within `143:128` section; cards reveal `0.62s` | natural card list |
| Partner marquee | Octagos continuous horizontal movement | continuous, hover pause | `55s` linear loop, pause on hover | slower continuous track; disabled for reduced motion |
| Section reveal | Octagos restrained section transitions | viewport entry | opacity + `translateY(22px)` + blur, `0.62s` cubic-bezier; no layout drift | static visible content when motion is reduced |

## Verification

- Figma reference screenshot: `/tmp/huanyu-figma-reference/home.png`
- Local desktop screenshot: `/tmp/huanyu-home-desktop-verified.png`; `1440 x 900`, full-page after section-by-section scroll; measured document height `8806px`
- Local mobile screenshot: `/tmp/huanyu-home-mobile-verified.png`; `390 x 844`, full-page after section-by-section scroll; measured document height `13265px`, `scrollWidth === innerWidth`
- Interaction evidence: hero arrows/dots and 7s advance, flow and card routes, expert tab data states (with an explicit unavailable-data fallback), CTA consultation/report actions, partner hover pause, reduced-motion fallback, and all asset URLs verified.
- Latest program regression screenshot: `artifacts/program-regression/home-expert-tab.png`; tumor tabs restore the four authored expert records, while heart/cardiovascular and orthopedics show the explicit manual-matching state because no verified expert records or portraits are present in the source.
- Verification run: `2026-09-24`
- Remaining differences: none

## Latest Audit

- 2026-09-24: Re-read the complete Dev Mode HTML/CSS source after expanding the code panel; verified all twelve section node IDs, authored desktop heights, source assets, carousel timing, reveal motion, and mobile overflow evidence.
