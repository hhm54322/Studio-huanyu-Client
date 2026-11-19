## 2026-11-17 手机案例匹配修正（验证进行中）

- 智能匹配弹窗的就医时间问题由重复序号 2 改为 3；390px 内置浏览器已检查弹窗。当前源比对及最终验收仍待完成。

# 患者案例

- Route: `/cases`
- Figma frame: `07寰宇云医 - 患者案例`
- Node ID: `190:5300`
- Source baseline HTML: `docs/figma-source/cases/source-frame-2026-09-29.html`
- Source baseline CSS: `docs/figma-source/cases/dev-styles-2026-09-29.css`
- Source asset manifest: `docs/figma-source/cases/assets.json`
- Source extraction run: `2026-09-29`, 248 expanded Layers and selected Dev Mode reads
- Desktop frame: `1440 x 1822px`
- Mobile frame: no authored mobile frame; responsive adaptation
- Status: implementation — 2026-11-19 患者案例新版已接入；完整逐节点映射与全站设计门禁仍待验收

## Source Inventory And Parameter Record

All files below are in `docs/figma-source/cases/`:

- `layers-2026-09-29.json`: every Node ID, parent and displayed sibling order; no index gaps.
- `native-inventory-2026-09-29.json`: 248 nodes, 229 rendered, 19 authored-hidden nodes; browser hierarchy cross-check has zero mismatch.
- `dev-mode-2026-09-29.json`: all 248 nodes selected in parent-first order and the visible Inspect panel copied. For the 19 hidden nodes Figma Inspect displays the visible ancestor's CSS; this is not claimed as their own CSS.
- `native-parameters-2026-09-29.json`: exact native properties for every node, including hidden nodes, image transforms and mixed text styles.
- `node-to-code-2026-09-29.json`: all 248 concrete selectors; hidden hierarchy is retained in a hidden source subtree.
- `baseline-lock-2026-09-29.json`: source artifacts locked before page Vue changes.
- `content-2026-09-29.json`: actual image paints and editable source card/metric data.
- Native source SHA256: `f46e9364d764719ef3534683e7a8ab3289f0d4dda20e10292373fcb7a18d74eb`.

## Layer Mapping

Complete mapping is in the JSON record above. Principal nodes:

| Node ID | Parent | Source layer | Vue element |
| --- | --- | --- | --- |
| `190:5303` | `190:5302` | Hero Section | `.case-hero` |
| `190:5304` | `190:5303` | Frame 74 | `.case-hero__content` |
| `190:5305` | `190:5304` | Copy Container | `.case-hero__copy` |
| `190:5320` | `190:5319` | Title Text | `h1` |
| `190:5322` | `190:5321` | Subtitle Text | `p` |
| `190:5323` | `190:5305` | Link | `.case-match-button` |
| `221:6192` | `221:6191` | Filter row | `.case-filters` |
| `190:5365` | `190:5328` | Grid | `.case-grid` |
| `190:5366` | `190:5365` | Maria card | `.case-grid>article:nth-child(1)` |
| `190:5383` | `190:5365` | James card | `.case-grid>article:nth-child(2)` |
| `190:5402` | `190:5302` | Metrics Section | `.case-summary` |
| `190:5429` | `190:5428` | Footer | `PatientFooter.vue` |
| `484:1592` | `190:5301` | Header | `PatientHeader.vue` |

## Sections

| Section | Node ID | W x H | Parameters |
| --- | --- | --- | --- |
| Hero | `190:5303` | 1440 x460 | copy x112/y129.5, 1216 x235; inner568; gap24 |
| Directory | `190:5328` | 1440 x622 | padding96/40; filter42; grid388 including top48 |
| Metrics | `190:5402` | 1440 x284 | padding96/0; content1216 x92; four286px columns, gap24 |
| Footer | `190:5429` | 1440 x456 | existing shell with per-page source icons/fonts |

## Typography

| Element | Node ID | Font | Size / line-height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title | `190:5320` | PingFang SC | 64/96 | 600 | #143162 |
| Hero subtitle | `190:5322` | PingFang SC | 20/29 | 400 | #5B606A |
| Match CTA | `190:5327` | PingFang SC | 20/30 | 600 | #FFFFFF |
| Patient names | `190:5371`, `190:5388` | SF Pro | 18/18 | native600 | #1E3A5F |
| Card titles | `190:5376`, `190:5395` | PingFang SC | 24/24 | 500 | #1E3A5F |
| Metric values | `190:5407`, `190:5412`, `190:5417`, `190:5422` | SF Pro | 56/56 | 700 | #52E8FF |

Mixed card body text: label PingFang500 #1E3A5F, value PingFang400 #4B5563, both14/22. Source letter spacing is normalized to zero under application instructions. Text fixes for `190:5397`: remove duplicate colon; restore the missing character in both occurrences of 风险.

## Components And Spacing

- Hero fill: original image, exact Dev crop `0px -78.03px / 100% 123.964% no-repeat`; no text baked into the live hero.
- CTA: 199 x62, padding16/24, gap8, radius14, source icon24, #1E3A5F, source shadow.
- Dropdowns: 220 x42, padding1/16, border1 #DBDEE6, radius10, source arrow10 x6 in20 x38.5 wrapper; placeholders match source.
- Filter/reset buttons: 104/106 x42, gap8, padding16/24, radius14.
- Grid: 1216 x388, three equal columns389.3333, gap24, top48; two authored cards.
- Cards: 389.3333 x340, padding24, gap80 between60px header and152px body; radius24, #F5F6F7.
- Avatars: 60 x60, radius16; exact source photo/crop; no border/shadow.
- Recommendation: 64 x28, top16/right15.667, padding8, radius8, #03956D; text12/12 white.
- Metric dividers: 1 x70, top11 at native x298/608/917, white10% opacity. Metrics background image opacity50% over #1E3A5F.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero photo | `190:5303` | original image paint | `public/images/figma/case-source/node-190-5303.webp` |
| Maria avatar | `190:5368` | original image/crop | `public/images/figma/case-source/node-190-5368.webp` |
| James avatar | `190:5385` | original image/crop | `public/images/figma/case-source/node-190-5385.webp` |
| Metrics photo | `190:5402` | original image50% opacity | `public/images/figma/case-source/node-190-5402.webp` |
| Match icon | `190:5324` | exact Dev SVG | `public/images/figma/case-source/node-190-5324.svg` |

All 32 SVG/photo asset rows and source IDs are in the manifest.

## Prototype And Motion

- Preserve the existing smart-matcher business entry; its independent source state is `190:5550`, tracked separately in `smart-match.md`.
- Four filters participate in apply/reset logic; empty results stay usable and do not hide later sections.
- Existing Octagos-inspired viewport reveal/card hover/count-up motion preserves source resting layout. Cards lift 6px over 350ms with cubic-bezier(.22,1,.36,1), without changing width/height; metrics count up over 1300ms with cubic ease-out. Mobile disables hover lift; reduced motion removes transforms and reduces transitions to .01ms.
- Keyboard focus trap, Escape, focus restoration and mobile scroll are required for the matcher entry.
- No hospital administration or medical-report generation behavior is modified.

## Verification

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/figma-reference-native.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/local-1440.png`
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/local-390.png`
- Verification run: 2026-09-29; final screenshots regenerated after the last UI edit and personally reviewed with section crops, overlay and diff.
- Source QA: `source-map-results.json`, 248 concrete selectors, 75 exact text-style checks, 17 geometry checks within .05px; authored-hidden nodes remain hidden.
- State QA: `state-results.json`, 1440/1024/768/390px; four filters, reset, incompatible-filter empty state, required first matching group, independent answer groups, matching result, close button, backdrop, Escape, forward/backward focus trap, opener restoration, body scroll restoration, card hover and reduced motion. Zero runtime errors, broken images or horizontal overflow.
- Static comparison: Figma and desktop are both 1440 x1822; four sections match source coordinates/heights exactly. Changed-pixel ratio is 0.0162866661 with threshold .15 and anti-alias exclusion. This is a pixel-diff metric, not a percentage claim of design completeness. Residual differences are text rasterization/zero tracking and the documented typo corrections.
- Matcher comparison: independent frame `190:5550`; 5 internal geometry groups and all resting title/question/badge/helper/option/CTA typography checked; foreground changed-pixel ratio 0.0140041801. Its authored background belongs to the trust page; the live dialog correctly remains over cases. See `smart-match.md` for permanent evidence.
- Source audit: `node scripts/audit-cases-source.mjs` passes and is now part of `audit:figma`; screenshot freshness is checked against the last shared/page UI modification.
- Compilation: `pnpm exec vue-tsc -b` and `pnpm exec vite build` pass. `git diff --check` passes.
- Completion gate: source inventory, exact Dev Mode mapping, current-page desktop/mobile state QA, screenshot comparison, type checking and production build pass. Other page specifications are audited independently and do not change this page's evidence.
- Remaining differences: none

## Latest desktop revision — 2026-10-29

The current official export and live Design node `190:5550` retain the matcher hierarchy. Re-read source typography and native baseline coordinates before applying browser line-box alignment: title `190:5559` is 130×32, tracking .3955078125 and baseline 27.52000046; question texts `190:5565/5589/5607` use tracking -.3125 and baseline 20.63999939; helper text uses baseline 16.04000092. Option labels use SF Pro 16/16, tracking -.150390625 and baseline13.6875. The submit button `190:5621` is203×52 at618.5/710; text `190:5622` is127×16 at642.5/728, baseline13.76000023. Labels remain native DOM text; line-box offsets are calculated from these source baselines against the browser's measured baseline. No screenshot-derived offsets are used. Latest reference: `artifacts/figma-cases-2026-10-29/matcher-reference-2x.png`.


## 2026-11-01 性能改动后的真实回归

- 生产构建80000重跑完整源节点/75文字/17几何检查、1440/1024/768/390状态、智能匹配与键盘/焦点/关闭恢复；没有修改页面实现、Figma参数、图源或既定阈值。
- 完整实际截图及原始指标另存`artifacts/performance-exhaustive-2026-11-01/cases-unmodified-captures/`。用户另行要求的WhatsApp常驻入口不在原始Figma帧内，源码层截图仅对这一固定悬浮入口临时设为不可见；页面内容全部保留。此项为授权新增控件的独立范围，不能将去除它后的指标冒充完整界面逐像素一致。该入口以`whatsapp-contact-qa.cjs`独立验证全13路由、位置与配置。
- 原始完整截图pixelmatch1.00924%、nMAE1.00702%；仅比较源稿页面层为pixelmatch0.78782%、nMAE0.83875%。两组指标和截图同时保留，源稿图片/源锁没有重写。
- 原始提取记录的`.fig`路径现存文件SHA与历史SHA不同，未将替代导出当作原始基线。最新完整源变更相等性尚缺该历史导出；本次结论限于锁定参数/图片的真实回归及性能无布局变化，不据此宣称本页全量最新设计已验收。见`artifacts/performance-exhaustive-2026-11-01/additional-source-summary.json`。

### 2026-11-17 手机匹配行为复核（进行中）
- 390px 实测选择骨科后仅展示现有脊柱案例，选择牙科时显示无匹配结果。为避免误导，年龄及就医时间提示已说明当前不参与案例筛选，五语文案同步；整体设计验收未完成。

## 2026-11-19 患者案例新版：源设计提取中

- 页面与用户提供的截图、需求跟踪表一致：`pc改版` 的 `01患者案例列表`（`4342:1210`，1440×2692）、`02首页轮播卡片`（`4342:983`，1456×3036），以及 `03患者1全部` 至 `08患者6全部` 六个详情弹窗（依次为 `4342:407`、`4342:489`、`4342:611`、`4342:672`、`4342:778`、`4342:850`）。新版列表实际可见六例；列表中的其他两例是隐藏旧图层。
- 2026-11-19 03:53:38 UTC 按 `figma-connect.mjs` 完成会话、文件、Design、Layers、属性核验；IAB browser `2`、tab `2`。随后通过同一标签选取新版画板，导出官方设计，导出时间 2026-11-19 03:56:09 UTC，SHA-256 `403592e06935c1dc563b68e767c2d279b98b1fc0c39ae1fc5fbdc2965f17d93e`。
- 完整展开新版八个画板，Layers 与原生节点数及父子顺序逐项一致，依次 400、227、82、122、61、106、72、112 个节点。每个可见节点已在 Dev Mode 单独选中读取并记录 CSS/SVG 或可复制属性；隐层按设计不显示。临时材料位于 `docs/figma-source/cases-revision-2026-11-19/`（本地忽略，不作为发布资源）。该采集尚不等于实现映射或验收。
- 当前 `.fig` 与本地 2026-10-29 导出作初步变更扫描：旧案例页和智能匹配画板未变化，上述八个新版画板为新增，细节见 `source-comparison.json`。旧页面规范记录的原始基线 SHA 为 `f46e9364d764719ef3534683e7a8ab3289f0d4dda20e10292373fcb7a18d74eb`，当前本地旧导出不匹配该 SHA，故此比较不能代替对实际实现基线的完整验证，待继续查找或记录为未解决。
- 患者压缩包分 1–6 六组，共 23 张，第三例一张。转换 WebP 后共约 1.65 MB，原文件约 10.32 MB；映射与原文件哈希记录在 `patient-photo-manifest.json`。详情照片均使用对应组，不跨患者混用。
- 群聊需求 R013/R014/R016/R017/R018：案例详情版式统一，第三例只显示一张图；第五例使用美国 D 先生，第六例使用印尼丽丽安，保留详细内容；注明案例来源。Figma 中仅丽丽安详情明确标注“来源于广州现代肿瘤医院公开信息披露”，不能未经核实将此来源套用给其他案例。
- 源稿明显串稿：丽丽安列表年龄为“739岁”、摘要为“9岁”，其详情标题及正文两处均为“39岁”；将统一为 39 岁。丽丽安第 3 节误带 D 先生术后行走引语，Rafi 详情第 4 节误带 Dale 的 CAR-T 疗效数据；以上错配不得直接呈现，保留各自其他真实内容。具体患者素材与医疗描述以本次 Figma、图片包为依据。
- 详情源共用主要几何：弹窗框宽 1096、圆角 24、内边距 32；正文双列宽 404 和 604，间距 24。详情应支持长内容滚动、关闭及照片切换，第三例无需轮播。交互、可访问性、移动端和五语适配待实现和实测。
- 状态：**采集完成，尚未完成逐节点实现映射、代码接入及验证**。不得标记为 verified。
- 已预备 `src/data/patientCasesDesignSource.json` 与 `src/data/patientCases.ts`，仅保存/整理 Figma 六例的可见内容及患者对应图片，尚未接入任何页面。六例的详情章节数量依次为 4、4、3、5、4、7，图片数量依次为 5、4、1、3、3、7；首图已逐一与 Figma 图像比对。数据层剔除两个跨患者误复制节点 `4342:606`、`4342:913`，原始记录仍保留。
- 2026-11-19 强制重建类型检查 `vue-tsc -b --force` 通过；数据层单独检查 6 条记录和 23 张文件均存在。数据尚未接线，不代表列表、筛选、首页轮播、详情弹窗或五语已完成。

### 2026-11-19 再次核验

用户已明确旧实现原始导出无法取得时按新版设计实施。重新连接成功（IAB browser 2、tab 2，2026-11-19 05:32:05 UTC）；当前官方导出 SHA-256 `29bb7d0827145fd62f68934ecd32564e7f3d2f66a4c79518ca85fa3b16055345`，将上次逐节点采集的新版导出作为新版实施基线运行 `figma-source-gate.cjs`，六个详情、列表、首页卡片 8 个根均为 unchanged，全部节点及图片无缺失；报告 `artifacts/figma-cases-2026-11-19/final-comparison.json`。这是新版源设计没有变化的证据，不代表新版页面已接入或验收。修复比对器对 Figma 大整数属性的序列化，保留精度并通过 14 项测试。

### 后续实施状态

- 本轮连接 2026-11-19 05:44:20 UTC；以新版导出为基线的再次源比较结果仍为 unchanged，见 `artifacts/figma-cases-2026-11-19/start-comparison.json`。
- 案例列表与详情弹窗接线草稿存放在 `artifacts/figma-cases-2026-11-19/CaseView-in-progress.vue`；由于新增案例的四种外语未就绪、语言门禁拒绝构建，实际 `CaseView.vue` 已恢复到原版本，当前站点不引用这份草稿。
- 模块尚未完成：首页轮播接入、全部翻译、交互验证、跨尺寸与 Figma 截图对照、最后一次源比对及完整构建均未完成。`PatientCaseDialog.vue` 与案例数据目前不在站点导入图中。
- 用户已明确不需要项目翻译接口。现由助手直接翻译，逐项写入现有四种外语文案目录；已完成 59 组案例标题及字段（共 236 条外语），后续病例正文及其他文案仍须继续翻译并核对。当前页面仍未接入，既有站点语言审计通过不代表新案例的翻译已完整。

### 2026-11-19 病例实现与翻译进度

- 06:04 UTC 通过当前会话 IAB 再次连接，获取官方导出 `/Users/hhm/Downloads/寰宇云医 (3).fig`，以本次新版提取源作比较，8 个相关画板全量 unchanged；记录 `artifacts/figma-cases-2026-11-19/latest-comparison.json`。
- 助手直接制作四语译文，新增病例标题、关键字段的翻译，完整正文尚未译完，不使用外部翻译接口及占位文案。
- 另行临时开启仅用于中文测试的本地检查环境，六个列表项、病例二详情表格、病例二图片切换、病例三单图不显示切换、首页病例六进入正确详情已实测；测试进程停止并恢复严格语言门禁。此次中文测试不能作为正式版本、五语或完整设计验收。
- 由于五语正文未全部完成，接线草稿另存于 `artifacts/figma-cases-2026-11-19/CaseView-in-progress.vue` 和 `HomePatientStories-in-progress.vue`，实际页面已恢复原版避免影响已有构建。当前 `audit:i18n:site` 仅检查实际接入的旧页面，不能作为新版五语完成的证据。

### 2026-11-19 本轮接入与核验（覆盖以上进行中状态）

- 06:39:41 UTC 在当前会话按唯一连接入口验证 Design/Layers/Properties：IAB browser `2`、tab `2`，文件 `s6gMozOqPBJFujindYruwb`。以此前用于实施的新案例导出 SHA-256 `403592e06935c1dc563b68e767c2d279b98b1fc0c39ae1fc5fbdc2965f17d93e` 为基线，07:26:59 UTC 从同一设计页导出文件 SHA-256 `65eeec0b72089fc8057b34338faa27b6377ee25c4df8b1be3a738861426bfba8`。交付比较 `artifacts/figma-cases-2026-11-19/delivery-comparison.json` 包含上述八个画板，均为 `unchanged`；全文件其余位置有 25 个变量记录移除及内部画布变化，相关八个画板的依赖比较均无变化；未据此声称其他页面未改动。
- 实际路由 `/cases` 已使用六个新版卡片及共享详情弹窗；首页使用六组新版故事摘要和对应患者详情。首页卡片首屏分别使用各患者图片组，单图病例不显示切换控件；详情共 23 张图片，全部从用户提供的患者图片包转换，患者分组、来源 SHA 和映射见本地 `patient-photo-manifest.json`。列表头像沿用各设计节点图片与原始裁切：`4342:1279`、`4342:1301`、`4342:1325`、`4342:1349`、`4342:1373`、`4342:1397`。
- 首页卡片源参数复核：图片 `4342:985` 宽 389.333、高 400、半径 24；正文 `4342:986` 宽 802.667、高至少 400、内边距 32、半径 24、背景 `#F5F6F7`，两列间隔 24；标题 `4342:991` 24/36、正文 `4342:998` 16/24、按钮 `4342:1015` 高 52、内边距 18/24、半径 14、橙色 `#DD6B20`。标注、两条要点、按钮分别渲染设计源的可见文本；误写的“查看患他的故事/查看患她的故事”改为“查看他的故事/查看她的故事”。案例选择控件为六例接入所需的交互扩展。
- 列表桌面 1440px 实测：容器 1216px、三列各 389.33px、列间隔 24px，第一行 516px、第二行 670px、行间隔 24px；第一卡的头部 60px、正文起点距头部下沿 48px。详情弹窗宽 1096px，内边距 32px，图片 404×269.33px，内容列 604px，列间隔 24px；正文、标题、摘要和来源按各节点提取。长文允许自然增高、整个弹窗可滚动。手机适配单列，保留既有桌面设计层级。
- 五语文本由助手直接翻译写入项目已有文案目录，不依赖项目翻译接口。六例中文、英语、印尼语、马来语、葡语在案例列表与首页均接入；对六个详情逐一检查四种外语未出现中文遗漏，390px 页面和弹窗无横向溢出。新增两个患者故事按钮及其相应翻译。
- 案例首页与详情图片轮播均为 5 秒，鼠标停在图片时暂停，移开后恢复；对单图不显示轮播控制。测试了首页切换第 6 例进入对应详情、各例图数 5/4/1/3/3/7、详情第二例表格七行、筛选与重置、关闭后焦点恢复、桌面与手机弹窗。截图 `artifacts/figma-cases-2026-11-19/qa/`，Figma 对照导出 `artifacts/figma-cases-2026-11-19/4342:983-figma.png` 和 `/Users/hhm/Downloads/08患者6全部.png`。
- 数据纠错：丽丽安年龄按详情及正文一致改为 39 岁；移除两处跨患者串稿。第三例第四周结果按用户明确要求恢复设计稿原文“缩小 28%（部分缓解 PR）”，五语直接翻译该原文；其余来源与治疗叙述以设计稿为准。
- 验证结果：`vue-tsc -b --force`、语言审计及 17 项案例数据/源变更比较测试通过；直接运行 Vite 生产构建通过。全站 `audit:figma` 实际执行仍失败：除本页新旧证据需更新外，其他页面存在历史截图时间、旧源比较和缺失 `/Users/hhm/Downloads/寰宇云医 (9).fig` 等既有门禁问题；本次没有修改门禁或伪造截图。新版全部可见节点的逐节点映射仍处于 planned，尚未满足本仓库 Figma 完整验收标准，不能将本页标为 verified 或作为标准生产发布包。

### 2026-11-19 本轮追加核对（覆盖上文的详情映射进度）

- 本次连接 `2026-11-19T08:17:19Z`：当前会话 IAB browser `2` / tab `2`，选中 `4342:611`，Design / Layers / Properties 均可读。`08:31:41Z` 从该标签保存最新官方源，SHA-256 `728a678903f2f0107c8180cd0b82d87b1102859dafa3a443d9f7ec539eac73bf`。与本次实施原始源 SHA-256 `403592e06935c1dc563b68e767c2d279b98b1fc0c39ae1fc5fbdc2965f17d93e` 对比，列表、首页案例卡片与六个详情共八个范围均 unchanged；完整报告 `artifacts/figma-cases-2026-11-19/delivery-latest-0831.json`。全文件 25 个变量记录移除及一处画布变化位于其他范围，不据此推断其他页面无变化。
- 六个详情中按真实 DOM 记录了源节点、实际选择器、隐藏层和合并层；运行时采集的逐节点覆盖见 `artifacts/figma-cases-2026-11-19/qa/detail-node-coverage.json`。除已记录的两处跨患者串稿节点外，所有可见详情节点均找到实际承载元素；未在 DOM 中虚构隐藏节点。详情文字比较见同目录 `detail-text-comparison.json`：第三例文字与设计稿一致，第六例摘要将明显笔误 9 岁统一为 39 岁。
- 第三例按用户明确要求保留“缩小 28%（部分缓解 PR）”，其他四种语言直接翻译并保留 28% / PR；未使用翻译接口。设计稿中分段标题的 semibold 字重和摘要卡片的 238px 最小高度也已恢复。
- 内置浏览器实测五语 × 320 / 390 / 430 / 768 / 1440px 的六个详情，各组合均可打开、图片可载入、无文档横向溢出，四种外语详情未发现中文遗漏，见 `locale-viewport-results.json`。首页六组案例的五语和对应照片检查见 `home-locales.json`；第三例单图不显示轮播控件。列表筛选、无结果、重置、智能匹配、详情表格、长文滚动、Escape、焦点约束及关闭恢复已实测；生产构建预览也逐语验证第三例原文与译文。
- `vue-tsc -b --force`、直接 Vite 生产构建、语言审计、25 项数据/翻译/源比较测试和 `git diff --check` 已通过。全站 `audit:figma` 仍失败：本页专项脚本仍指向旧版案例基线和旧截图，列表与首页案例卡片尚未完成全部源节点到代码的核对；另有其他页面历史证据过期或源文件缺失。截图和当前比对不能替代这些门禁，页面仍保持 implementation，未标为 verified。

### 最终回归补充（覆盖上文映射与交互进度）

- 案例列表主内容 280 个源节点（205 显示、75 隐藏）、首页卡片全部 226 个子节点、六个详情全部可见节点，均记录到实际 DOM、合并层或相应隐藏/串稿例外；公共页眉和页脚 120 个可见节点映射到项目共用组件。实际结果位于 `artifacts/figma-cases-2026-11-19/qa/list-node-coverage.json`、`home-node-coverage.json`、`detail-node-coverage-final.json` 与 `shared-node-mapping.json`，其中共用导航 Logo、邮箱和链接沿用用户后来指定的版本。
- 逐例对照 Figma 后，首页照片指示器改为位于图片下方 22px；故事按钮与蓝色勾选图标使用从设计稿读取的 SVG 路径。详情按设计恢复混合字重、8px 段落间距、引语的 14/22 字号与 12px 内边距，以及不同章节的底部间隔。第一例在 1440px 画板中弹窗实测高 1428px，与源稿一致；第二例和第六例因去掉跨患者串稿而缩短，第四例约短 8px，第三、第五例约差 1px，结果见 `current-dialog-geometry.json`；不将这些差异称为逐像素一致。
- 末次五语 × 320 / 390 / 430 / 768 / 1440px 六个详情复测无横向溢出、坏图或外语中文残留，见 `latest-locale-viewport.json`；首页六组五语 × 五宽度核验见 `home-viewport-final.json`。首页与弹窗照片实测鼠标停留暂停，移开后恢复 5 秒切换；筛选、无结果、重置、匹配、关闭、焦点恢复与背景关闭结果见 `behavior-final.json`。
- 最后一次设计导出 `2026-11-19T09:45:08Z`，SHA-256 `a4a3b3d0d285fa2fb56123216e2a3a3f228d91a4efbeccb80b234461f5b2262c`；与本次实施源的八个相关范围再次逐节点对比均 unchanged，报告 `delivery-0945.json`。设计核对范围以此八帧为准。
- 标准全站门禁仍未通过：案例审计脚本仍检查旧版案例及旧截图，其他页面也存在历史截图过期、旧源比较过期和缺少原始文件。当前不修改这些检查以制造通过结果，也不将页面标为 verified；页面改动已接入本地，尚未提交或发布。

## 2026-11-19 最终复核补充

- 用户明确要求第三例按设计原文呈现“缩小 28%（部分缓解 PR）”，英语、印尼语、马来语和葡语直接翻译；对应的五语文案及数据测试均已核对。
- 10:04:52 UTC 通过当前会话 `browser-client + iab` 验证 Figma Design、Layers 和 Properties，选中节点 `4342:611`。10:17 UTC 从同一标签重新保存官方 `.fig`：`artifacts/figma-cases-2026-11-19/delivery-1020.fig`，SHA-256 `ca0e090702ea4374bd590a76fbf85b164ece16c4935d021cbb4f17a71a623314`。与实际实施源 `current.fig`（SHA-256 `403592e06935c1dc563b68e767c2d279b98b1fc0c39ae1fc5fbdc2965f17d93e`）比较，案例列表、首页卡片、六个详情八个范围均 unchanged；比较报告 `artifacts/figma-cases-2026-11-19/delivery-1020.json`。全文件还有其他范围的变量和画布变化，未对其他页面作结论。
- 用 Codex 内置浏览器复测六例 × 五语 × 320 / 390 / 430 / 768 / 1440px，共 150 组：图片加载正常、每例图片数正确、文档无横向溢出、表格单元格内容完整，四种外语正文无中文遗漏，第三例保留 28% 和 PR。结果见 `artifacts/figma-cases-2026-11-19/qa/verification-1015.json`；外语表格长词已允许换行，手机表格可横向滚动。
- 修正第四例与第六例两处重复句号，并沿用原对应翻译。第四例表格适配了字体实际宽度，桌面恢复设计稿中的单行显示，移动端表格可横向滚动；1440px 下弹窗高度 1156px，与设计画板一致，五语及多尺寸表格未出现文字截断，记录为 `qa/verification-1033-tables.json`。筛选、重置、智能匹配、弹窗关闭及轮播的实测结果保留在 `artifacts/figma-cases-2026-11-19/qa/behavior-final.json`；最终截图另见同目录 `verified-1024-third-case.jpg`、`verified-1024-mobile.jpg`。
- `vue-tsc -b --force`、五语文案审计、26 项数据及文案测试、直接 Vite 构建和 `git diff --check` 通过。标准 `audit:figma` 仍不通过：案例专项审计仍以旧版画板及旧截图作为核验对象，且新版没有在实施前锁定的静态 HTML/CSS 基线；其他页面亦有既存的设计源及截图门禁失败。因此页面仍为 implementation，不能把直接构建通过当作标准发布门禁通过。
- 10:28:31 UTC 再次验证当前会话 Figma 连接，并于 10:28:47 UTC 保存交付前源文件 `delivery-final.fig`，SHA-256 `72fc5b3034eebadde4c8fcb60ab47968f5000437901877fd48b1c9fc042908de`；与实施源的八个案例范围均 unchanged，报告 `delivery-final-check.json`。生产构建预览再次检查五语的第三、第四、第六例，第三例文字、外语及表格均符合本次检查要求，记录 `qa/production-verification-1027.json`。
- 10:32:48 UTC 在第四例表格调整后再次验证连接并导出设计源 `delivery-final-1035.fig`，SHA-256 `d0b93a95ef064564cb3603c12ecdb2a6b032cf079e468ad4a823a972063b0d64`。与实施源比较的八个范围均 unchanged，报告 `delivery-final-1035.json`；全文件其他区域依然存在上述 25 条变量移除和一处画布变化。

### 2026-11-19 详情轮播控件调整

- 根据用户要求，六个患者详情弹窗移除图片左右箭头，保留图片指示点、5 秒自动轮播和鼠标悬停暂停。首页案例轮播保持原样。1440px 与 390px 本地截图及操作检查见 `artifacts/figma-cases-2026-11-19/qa/case-no-arrows-desktop.jpg`、`case-no-arrows-mobile.jpg`。
- 当前会话 IAB browser `2`、tab `2` 于 10:44:00 和 10:46:38 UTC 验证 Design、Layers 与 Properties，选中节点 `4342:611`。修改前官方源文件 `no-arrows-start.fig` SHA-256 `853393ed0b1e21d9e9585e858462206e780d516556b0c05f90bcee185ab71bed`，修改后官方源文件 `no-arrows-final.fig` SHA-256 `96e148af7ca3235631a9dbabebed28fd82b306d1b6488b519756dfbfeb320bc0`；分别与实际实施基线比较，列表、首页案例卡片及六个详情范围均 unchanged，报告为 `no-arrows-start.json`、`no-arrows-final.json`。全文件其他范围的 25 个变量移除和一处画布变化不作其他页面结论。

### 2026-11-19 首页患者故事整体轮播

- 按用户新要求，以 `4342:983` 的六组故事作为整体轮播，移除左侧图片独立轮播及指示点。每 5 秒切换案例，当前故事向左退出、下一个故事从右进入，过渡 600ms；鼠标停在图片上暂停，移开后恢复计时，打开详情期间暂停。六张故事采用同一高度，按当前语言和屏宽最长内容确定；手机及较长译文可自然增高，避免截断。减弱动画设置禁用滑动动画和自动轮播，键盘聚焦当前故事时暂停，以免焦点随切换丢失。
- 本地内置浏览器验证 320、390、430、768、1440px × 五语布局；六条图片、六个对应详情、指示点、五秒切换、末尾回到第一条、悬停暂停及移开恢复均已检查。结果与截图保存在 `artifacts/figma-cases-2026-11-19/qa/home-stories-slider-*`。
- 修改前 `2026-11-19T10:52:22Z` 和交付前 `2026-11-19T14:23:22Z` 使用当前会话 IAB browser `2` / tab `2` 检查 Design、Layers、Properties；源画板 `4342:983`、详情 `4342:407/489/611/672/778/850`。两次官方源文件 SHA-256 分别为 `25e4ba77f9bcc87ad119711729d2079d84873110423fdcfe97bab99e3c43d9cc` 和 `8e204053b9e7618b499848fef7caba88519a248e5f7a39ed2af5c3d94bd8a4e8`；与实施基线 `current.fig` 的相应范围均 unchanged，报告为 `stories-carousel-before.json` 和 `stories-carousel-final.json`。全文件其他范围仍有 25 个变量移除及一处画布变化。
- 类型检查、五语文案审计、26 项相关测试及直接 Vite 构建通过；既有全站 Figma 审计仍未通过，页面继续保持 implementation 状态。
