# 疾病中心

- Route: `/diseases-technologies`
- Figma frame: `05寰宇云医 - 疾病中心`
- Node ID: `144:4380`
- Source baseline HTML: `docs/figma-source/diseases/frame.html`
- Source baseline CSS: `docs/figma-source/diseases/styles.txt`
- Source asset manifest: `docs/figma-source/diseases/assets.json`
- Source extraction run: `2026-09-23` via Figma Dev Mode Code view
- Desktop frame: `1440 x 3144px`
- Mobile frame: no dedicated frame found; responsive adaptation required
- Status: verified

## Sections

| Order | Section | Width | Height | Container/Grid | Notes |
| ---: | --- | ---: | ---: | --- | --- |
| 1 | Hero | `144:4383` | 1440 | 460 | `1216px` | Figma clinician/patient image, left-aligned copy |
| 2 | Disease directory | `144:4390` | 1440 | 1896 | `1216px`; 3 columns x 5 rows | `800 x 60px` search; `389 x 300px` cards; 24px gaps |
| 3 | Final CTA | `144:4572` | 1440 | 332 | centered content | `#F5F6F7`, report and consultation actions |
| 4 | Shared footer | 1440 | 456 | `1216px` | common patient footer |

The first three sections total `2688px`; adding the footer gives the exact `3144px` frame height.

## Layer Mapping (Pilot Extraction)

| Figma Node ID | Figma layer | Parent Node ID | Vue implementation | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `144:4380` | `05寰宇云医 - 疾病中心` | document | `.disease-page` | `1440 x 3144px` | source frame |
| `144:4383` | Hero section (image-filled) | `144:4380` | `.disease-hero` | `1440 x 460px`; image asset shown in Dev Mode as `2510 x 850` | background image is authored on the Section node |
| `144:4387` | 疾病中心 | `144:4383` | `.disease-hero h1` | `64px/96px`, weight `600`, `#143162`; PingFang SC | exact title text node read in Dev Mode |
| `144:4389` | 按疾病查找治疗方案，获取权威专家建议 | `144:4383` | `.disease-hero p` | `20px/30px`, `#5B606A`, weight `400` | exact text node read in Dev Mode |
| `144:4390` | Directory container | `144:4380` | `.disease-directory` | `1216px` content; `96px` vertical padding | directory parent |
| `144:4397` | Frame 609 (search field) | `144:4390` | `.disease-search` | `800 x 60px`; radius `46px`; border `1px` inside; padding `24px`; `#DBDEE6` | exact container node |
| `144:4415` | Container (disease card) | `144:4390` | `.disease-grid article` | `389.33 x 300px`; radius `24px`; padding `24px`; background `#F5F6F7`; justify `space-between` | first authored repeated card instance |
| `144:4423` | 肿瘤科 (card title) | `144:4415` | `.disease-grid h2` | `24px/24px`, weight `600`, letter spacing `-0.44px`, `#1E3A5F` | representative repeated title node |
| `143:3747` | 合作医院：32家 (card body) | authored card instance | `.disease-grid p` | `16px/24px`, weight `400`, PingFang SC | representative hospital line; same authored style repeats |
| `144:4402` | 搜索疾病 / Search diseases... | `144:4397` | `.disease-search input` placeholder | `16px`, `#9CA3AF`, SF Pro | exact placeholder text node |
| `144:4572` | Final CTA section | `144:4380` | `.disease-cta` | `332px` authored section | exact heading and action nodes recorded below |
| `144:4576` | 没有找到您的疾病？问阿宁帮您解答 | `144:4572` | `.disease-cta h2` | `40px/40px`, weight `700`, PingFang SC, `#1E3A5F` | exact CTA heading |
| `144:4578` | Link (提交病历) | `144:4577` | `.disease-cta a` | `140px x 52px` authored link surface | exact action node |
| `144:4582` | Link (免费咨询阿宁) | `144:4577` | `.disease-cta button` | `176px x 52px` authored link surface | exact action node |
| `144:4581` | 提交病历 | `144:4578` | `.disease-cta a` label | authored text node | exact CTA label |
| `144:4585` | 免费咨询阿宁 | `144:4582` | `.disease-cta button` label | authored text node | exact CTA label |

The pilot records one representative authored card instance and its repeated style rule; no generic child mapping is used.

## Assets

| Asset | Source | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Clinician and patient hero | Figma Node `144:4383` image fill (`2510 x 850` shown in Dev Mode) | `1440 x 460px`, cover | `/public/images/figma/disease-hero-background.png` |
| Search icon | Figma Assets panel / source frame `144:4397` | `24 x 24px` | `/public/images/figma/diseases/search.png` |
| Disease card icons (14) | Figma Assets panel / repeated card nodes under `144:4390` | `32 x 32px` | `/public/images/figma/diseases/icon-0.png` ... `icon-13.png` |
| CTA icons | Figma Assets panel / nodes `144:4578`, `144:4582` | `20 x 20px` | `/public/images/figma/diseases/submit.png`, `/public/images/figma/diseases/consult.png` |

## Behavior

- Search filters the editable frontend service constants by department, case type, and treatment feature.
- Dental retains its existing route to `/dental`; unfinished departments remain visible without invented destination pages.
- Card values remain local constants so hospital counts and placeholder data can be changed directly.
- Static Figma matching is completed before viewport and hover motion is finalized.
- Desktop cards use restrained lift and shadow feedback without changing the Figma geometry.

## Verification

- Figma reference screenshot: `/tmp/huanyu-figma-reference/diseases.png`
- Final desktop screenshot: `/tmp/huanyu-diseases-final-desktop.png`
- Final mobile screenshot: `/tmp/huanyu-diseases-final-mobile.png`
- Desktop geometry: `460 / 1896 / 332 / 456px`; exact total height `3144px`
- Desktop and mobile: no horizontal overflow, broken images, or reveal-hidden content
- Search regression: `牙科` returns one card; clearing restores all 14 cards
- Verification run: 2026-09-23 (desktop and mobile screenshots regenerated after asset replacement)
- Interaction verification: search `牙科` returns 1 card; clearing returns 14; dental card navigates to `/dental`; submit navigates to `/report`; consultation emits `open-consultation`
- Remaining differences: none

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title | `144:4387` | PingFang SC | 64px / 96px | 600 | `#143162` |
| Hero subtitle | `144:4389` | PingFang SC | 20px / 30px | 400 | `#5B606A` |
| Disease card title (first authored instance) | `144:4423` | PingFang SC | 24px / 24px | 600 | `#1E3A5F`; repeated authored card instances use the same text style |
| Disease card body (hospital line, first authored instance) | `143:3747` | PingFang SC | 16px / 24px | 400; hospital count 500 | `#4B5563`; count `#2563EB`; repeated authored card instances use the same text style |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Search field | `144:4397`; placeholder `144:4402` | 800 x 60px | 24px horizontal; 16px icon/text gap | 46px, 1px `#DBDEE6` |
| Disease card | `144:4415` (representative repeated instance) | 389.33 x 300px | 24px; 24px grid gap; `space-between` | 24px, `#F5F6F7` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Disease search | Figma authored state | Input | Immediate filtered list | Same input, single-column cards |
| Card detail | Octagos hover/reveal language | Hover/entry | Lift and opacity | No hover dependency |
