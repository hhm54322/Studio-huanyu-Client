# 可信度详情

- Route: `/about`（由“可信度，靠证据不靠形容词”区域的“查看详情”打开）
- Figma frame: `可信度详情`
- Node ID: `484:2568`（设计稿当前选中状态；子节点参数按 Figma Design 读取）
- Source baseline HTML: `docs/figma-source/about/trust-detail.html`
- Source baseline CSS: `docs/figma-source/about/trust-detail-styles.txt`
- Source asset manifest: `docs/figma-source/about/trust-detail-assets.json`
- Desktop frame: `1440 x 1140px`
- Mobile frame: no dedicated mobile frame found; responsive single-column detail state
- Status: verified (static geometry, detail interaction, motion fallback, desktop/mobile overflow)

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Detail frame | `可信度详情` | 1440px | 1140px | vertical Auto Layout; top/bottom padding `96px`; fill `#F5F6F7` | full-screen detail state |
| Content margin | `Container:margin` | 1216px | 948px | vertical content; max width `1280px` | content starts at 96px |
| Heading | `Heading 2` | 1216px fill | 40px | 40px text box | `可信度，靠证据不靠形容词` |
| Subtitle | `Paragraph` | 1216px | 40px | top padding `16px`; 24px text line | `主体、隐私、边界——每一项都能被核实` |
| Evidence grid | `Container:margin` | 1216px fill | 780px | 2 rows x 2 columns; row/column gap `24px` | grid begins after 16px content gap |
| Closing note | `Paragraph` | 1216px | 40px | top padding `16px`; 24px text line | `把"该信谁"从玄学，变成可核对的事实` |

## Typography

| Element | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | ---: | --- |
| Heading 2 | PingFang SC | 40px / 40px | 600 | `#1E3A5F` |
| Subtitle and note | PingFang SC | 16px / 24px | 400 | `#6B7280` |
| Card heading | PingFang SC | 24px / 24px | 600 | `#1E3A5F` |
| Card body/evidence | PingFang SC | 16px / 24px | 400 | `#4B5563` |
| Card action | PingFang SC | 14px / 14px | 500 | `#9CA3AF` |

## Components And Spacing

| Element | W x H | Padding/Gap | Radius/Border/Effect |
| --- | ---: | --- | --- |
| Row 1 cards | 596px x 390px | 24px; icon-to-content gap `80px` | white fill; radius `24px`; no border |
| Row 2 cards | 596px x 366px | 24px; icon-to-content gap `80px` | white fill; radius `24px`; no border |
| Grid | 1216px x 780px | 2 columns x 2 rows; `24px` row/column gap | no outer border |
| Close control | 36px x 36px | top `24px`, right `32px` | circular; subtle white surface; keyboard accessible |

## Copy

| Card | Body |
| --- | --- |
| 主体与资质可查 | 平台由香港寰宇云医科技有限公司运营，香港跨境医疗长寿医学协会提供行业标准与品牌背书。合作机构须持有效《医疗机构执业许可证》，每 1–3 年校验一次，执照过期或超范围接诊即进入“暂不推荐”名单。 |
| 数据跨境与隐私合规 | 遵循《个人信息保护法》《数据出境安全评估办法》。病历影像最小化采集、加密存储、访问留痕；确需向境外提供时，依法通过安全评估、个人信息保护认证或标准合同三者之一，并向患者告知境外接收方与处理方式，取得单独同意。 |
| 诊疗边界清楚 | 平台做分诊、翻译、病例整理、医院与医生匹配；诊断、处方、手术等诊疗行为由实体医院及其注册医师完成。不远程首诊开处方，不承诺治愈、不承诺成功率，不使用“最便宜/最好/第一”等绝对化表述。 |
| 官方核验路径 | 不信我们一句话？你可以自己去卫健委查医院、查医生、查执照。每一项推荐都回到公开可验证的信息上。 |

## Assets

| Asset | Source | Project Path |
| --- | --- | --- |
| Subject qualification | `484:2578` | `public/images/figma/about-trust-detail/icon-scale.svg` |
| Detail chevron | `484:2588` | `public/images/figma/about-trust-detail/icon-chevron.svg` |
| Clinical boundary | `484:2594` | `public/images/figma/about-trust-detail/icon-shield.svg` |
| Official verification | `484:2612` | `public/images/figma/about-trust-detail/icon-search.svg` |
| Cross-border privacy | `484:2628` | `public/images/figma/about-trust-detail/icon-lock.svg` |

## Prototype And Motion

| Interaction | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- |
| Open trust detail | Click any About proof-card “查看详情” | overlay opacity `300ms`; page translateY `18px`, `420ms`, cubic-bezier `.22,1,.36,1` | full-width single-column state |
| Close trust detail | Close control, backdrop click, or Escape | same fade/translate reverse | body scroll restored |
| Reduced motion | `prefers-reduced-motion: reduce` | transitions disabled | readable static state |

## Verification

- Figma reference: `可信度详情` frame, Design properties read from the source file
- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/about-details/trust-desktop-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/about-details/trust-mobile-390.png`
- Interaction evidence: proof cards open the detail state; close button focus handoff, backdrop dismissal, Escape, body scroll lock, and reduced-motion fallback are implemented
- Verification run: 2026-09-24
- Remaining differences: none
