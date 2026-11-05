> 2026-11-03：用户授权更新公开邮箱/WhatsApp，公共入口参数、源比较及专项截图回归见 [public-contacts.md](../public-contacts.md)。本次不重新声明全页 Figma 验收通过。

# 中国医生（桌面）

## 2026-11-03 补齐头像与统一公共导航

- 用户授权将提供的通用头像按性别分配给缺头像医生。原有周莉莉、柳光宇、谭兆林、徐宇、陈疾忤5个源头像保留；新增55张（男30/女25），未改名录、资料和科室筛选。
- 依据为归档文档明确性别、正文明确代词和用户补充（柳光宇男、徐化梅女、苗华栋男、陈骏良男），不按姓名猜测。稳定ID映射及每张原图/输出SHA256见 `docs/source/physicians/avatar-assignments.json`，生成器 `scripts/build-physician-avatars.py`，运行数据 `src/data/physicianAvatars.json`。
- 头像延续源 `1741:5819/5820` 的图片框/裁切/圆角，320×320 WebP；原20,778,152B压至404,918B，约98.1%缩减。既有源卡结构和本人原头像优先。
- 当前官方源 `(35).fig`，2026-11-03T04:07:25.377Z，SHA256 `00ef223839b8cfdf6be3eddbd18a691d5e96030201bd07b24ddfec9b74c0b2ca`。对原实施 `(9).fig` 的 `1689:4814/1432:7741`全节点/资源/依赖无变化。当前连接及公共导航参数见 `patient-navigation.md`。
- 开发和正式构建 `20261103210000` 均验证全部60个详情、36科室+6快捷筛选、55个分配头像原件哈希/唯一性/实际解码和卡片/详情一致性，1024/1280/1440/1920无溢出、破图或页面错误；医生资料与原3位专家详情保留。
- 已个人复看列表及公共导航截图。生产未改Hero内容区nMAE0.98765%、Footer0.57848%；授权变更的顶部64px导航单独由导航专项验证。证据 `artifacts/patient-navigation-avatars-20261103/physicians-production/behavior-qa.json` 与 `all-desktop-1440.png`；开发证据保留默认路径，专项目录门禁通过。本轮未发布公网，移动端设计冻结。

## 2026-10-31 当前精简名录、原有医生与验收

- Status: verified — 60 merged desktop doctors, 42 filters and production preview; mobile deferred by user. This batch is not deployed.
- 当前源：本会话 IAB 验证 Design/Layers/Properties（2026-10-31T15:03:29.138Z，browser6/tab4）；官方导出 `(25).fig`，2026-10-31T15:08:23.937Z，SHA256 `b8e39c0623027d2db8c3a2e90400a4a353304c508ca64f916302c506a7f67854`。`current-physicians-directory.json` 的 `1689:4814`、`1432:7741` 节点、图片/矢量及依赖均 unchanged，沿用下方Dev参数。
- 新原件 `docs/source/physicians/曜影医疗专家信息汇总-精简发布版.docx` 含57位/34科室，替代同来源历史177位名单；旧原件保留。原网站谭兆林、徐宇、周莉莉、柳光宇、陈疾忤保留，同名采用新文档内容，合并为60位/36科室。首页专家不改。
- 谭兆林、徐宇、陈疾忤非重复，保留各自原卡片/原详情（源卡 `1741:5785`、`2324:8478`、`1741:5869`），不借用其他医生资料；文档缺头像不显示。
- 周莉莉血液病擅长沿用原网站，其他字段按新文档；用户批准及原节点 `1432:7784/7790/7795/7800` 记录在 `publication-overrides.json`。原DOCX不改，导入仅覆盖批准的 specialty/professionalExpertise 两字段并记录哈希。
- 保留6个快捷筛选和全部36科室下拉，共42组合，逐一比对完整医生ID。60个详情的非空标签、关闭、键盘、焦点/滚动恢复通过；原3人保留自身3/4/5标签及原案例/机构。
- 资料独立校验直接读取DOCX ZIP/XML，不调用导入器：57条/969字段与运行JSON一致，差异0；明确应用上述已批准字段。原件、导入器、JSON与override的SHA256见 `artifacts/patient-updates-2026-10-31/physicians/data-verification.json`。
- 开发与 production preview 证据：`artifacts/patient-updates-2026-10-31/physicians/behavior-qa.json`、`production-physicians/behavior-qa.json`。1024/1280/1440/1920无溢出、破图或页面错误。未改源区域Hero nMAE **0.91644%**、Footer **0.57849%**；卡片389.33334×284、x112/y646。60人扩展名录不宣称与旧5人样例整页像素一致。
- 已亲自复看列表、周莉莉血液病详情和缺头像详情；`scripts/audit-physician-directory.mjs`、类型检查及生产构建通过。本轮未发布外网；下方177位信息仅记录历史版本。

## 历史参数与验证记录

- Route: `/doctors`
- Figma frame: `07寰宇云医 - 中国医生`
- Node ID: `1689:4814`
- Source baseline HTML: `docs/figma-source/physicians/revision-2026-10-29/baseline-2026-10-29.html`
- Source baseline CSS: `docs/figma-source/physicians/revision-2026-10-29/dev-styles-2026-10-29.css`
- Source asset manifest: `docs/figma-source/physicians/revision-2026-10-29/assets-2026-10-29.json`
- Source extraction run: 2026-10-29; official source exported 2026-10-28T21:36:39Z, SHA256 `b81bbd3eb95eb33a7a2db2d313f7f6e326e24ce2ad5a1c6c5e82d618308d081e`
- Desktop frame: Figma sample 1440×1790; document-backed runtime derives height from its 177 records
- Mobile frame: deferred by user; design not finalized; no mobile implementation in this batch
- Status: verified (177-record document directory, desktop-only; mobile deferred by user)

## Layer Mapping

All 306 expanded Layers are recorded in `ui-layers-2026-10-29.json`, each with exact ID, parent, order and name. Each was selected in IAB Dev Mode and its right-panel CSS/SVG recorded in `dev-mode-2026-10-29.json`. The mechanical conversion creates `node-to-code-2026-10-29.json`: every node maps to an independent DOM owner or the exact SVG owner. The source lock was created before Vue implementation. No full-page PNG is shipped as UI.

| Element | Node ID | Vue owner | Exact source dimensions |
| --- | --- | --- | --- |
| Page / Body / Main | `1689:4814/4815/4816` | PhysicianView > HospitalFigmaCanvas > HomeSourceNode | 1440×1790 / main 1334 |
| Hero | `1689:4817` | same source tree | 1440×460; content x112/y141.5, 1216×211 |
| Specialty filters | `1689:4839` | Source buttons / tablist | 1216×42, x112/y96 within directory, gap16 |
| Five doctor cards | `1741:5784` | Source card buttons | 1216×640, 3 columns, gap24; 389.33334×284 each |
| Header | `1689:5392` | Fixed source header | 1440×64 |
| Hospital menu | `1732:5716` | Hover/focus dropdown | x962/y72; 119×85; radius16; .5px border |
| Footer | `1689:5315` | Source tree | y1334; 1440×456 |

## Typography

Every text owner's copied CSS and native text runs/line layout are in the locked source. Hero title 64/96, weight600; subtitle20/29. Doctor names24/24; original label, detail and footer weights are retained individually.

## Assets

30 exact asset records (8 unique WebP photos/fills plus original Dev Mode SVGs), native image crop/transform/alpha retained. Photos compressed at quality90, maximum2048px. Full-page screenshots remain ignored local QA evidence.

| Asset | Source Node ID | Project path |
| --- | --- | --- |
| Hero professional-team icon | `1689:4822` | `/public/images/figma/physicians-revision/node-1689-4822.svg` |
| Tan doctor portrait | `2326:8512` | exact native image hash/crop in asset manifest |
| Ask Aning icon | `1689:5402` | `/public/images/figma/physicians-revision/node-1689-5402.svg` |

## Prototype And Motion

- Six shortcut filters plus all 34 document departments. The original Figma filter/card dimensions are retained; shortcut labels adapt to the document as recorded below. Switching filter types clears the previous filter.
- All doctor cards open the document-backed profile dialog. The detail panel reuses the existing Figma expert-dialog parameters; its contents and available tabs come from each document record. Homepage expert dialogs are unaffected.
- Hospital menu opens on hover/focus or click; both destinations work. Escape closes with focus restoration. Consultation, language selector, footer and navigation are wired.
- Card reveal/hover follows the existing source-preserving hospital motion; reduced motion removes these transitions.

## Verification

- Current verification: see the 2026-10-30 document-directory evidence below. The following 2026-10-29 evidence remains the historical five-record Figma baseline, not a claim that 177 records match the original five-record full page.
- Figma reference screenshot: `artifacts/figma-physicians-2026-10-29/revision-2026-10-29-figma.png`
- Local desktop screenshot: `artifacts/figma-physicians-2026-10-29/local-1440.png`
- Mobile geometry: deferred by user; the mobile source is not finalized and this batch is desktop-only
- Remaining differences: none
- Verification run: 2026-10-29; `nMAE 0.3965%`, changed-pixel ratio `0.2558%`, all 306 mapped owners, six filters, five detail dialogs and navigation behavior passed


## 2026-10-30 — 曜影医生名录接入

- User-authorized content change: 首页保持不变，仅 `/doctors` 将卡片和详情内容切换为归档 DOCX 的全部 177 位医生；保留按科室筛选，无头像时不显示头像，不编造资料。
- Content source: `docs/source/physicians/曜影医疗专家信息汇总.docx`，SHA256 `cb05c6c9413afd89de709596dcc0e168f0d23a4c674415cc39447ff3147ff9f2`。
- Runtime data: `src/data/yaoyingPhysicians.json`；可通过 `scripts/build-yaoying-physicians.py` 重新提取，稳定 ID 采用源文档序号。177 人，34 个科室，2 位“吴莹”独立保留。内部设计师核对附录只留存在原始 DOCX，不展示在患者端。
- Current live Design connection: 2026-10-30T09:23:34Z verified through `scripts/figma-connect.mjs`, current-session IAB tab 3, source node `1689:4814`; Design/Layers/Inspect all readable.
- Current official export: `/Users/hhm/Downloads/寰宇云医 (21).fig`，exported 2026-10-30T09:35:48.863Z，SHA256 `ee0e6f1811b55a75f28ac5c5aab3d90d92c163ed1dc1da58eb57ebd952c7f32e`。
- Whole-file comparison against the implementation's original `(9).fig` found changes elsewhere; physician root 306 nodes and shared dependencies remain unchanged; existing profile source `1432:7741` also unchanged. Report: `artifacts/figma-source-gate/current-physicians-directory.json`.
- Current source screenshot exported from the selected Design frame: `artifacts/physicians-directory-2026-10-30/figma-current.png`.

### Data-driven node mapping and copied parameters

| Source owner | Runtime owner | Copied parameters and permitted content adaptation |
| --- | --- | --- |
| `1689:4814`, `1689:4815`, `1689:4816`, `1689:4838` | `PhysicianView > HospitalFigmaCanvas` | Preserve page/hero/footer source; derive directory/main/page height from row count. |
| `1689:4839`, `1689:4843`, `1689:4846`, `1689:4849`, `1689:4852`, `1689:4840`, `2320:8384` | six source filter buttons | Preserve x/y, widths, 42px height, radius, gaps and type. Labels now use actual DOCX departments: 全部 / 牙科（口腔科） / 骨科 / 血液内科 / 乳腺外科 / 全科. Additional native select exposes all 34 exact source departments. Selecting a shortcut clears the select; selecting a department clears the shortcut, so filtering never produces a stale intersection. |
| `1741:5784` | `#physician-results` | Three columns, 1216px wide, 24px gaps, 48px top padding; repeated card grid height depends on record count. |
| `1741:5817` | `[data-figma-node="physician-card:<stable-ID>"]` | Reuse the complete source card tree, width389.33334 / height284, 24px padding, radius24, fill#F5F6F7. Each descendant ID retains the source ID and stable record suffix. |
| `1741:5821`, `1741:5822`, `1741:5823` | record name/title | Source name24/24 weight600 #1E3A5F; title14/16 weight400 #9CA3AF; expand text to available source column width. Missing avatars hide the image subtree and move identity to x0 within the source header. |
| `1741:5819`, `1741:5820` | record portrait | Only verified Figma portraits for 周莉莉 / 柳光宇 / 陈疾忤; all other image owners omitted. No fallback stock photo or placeholder. |
| `1741:5831`, `1741:5840`, `1741:5842` | DOCX label/workplace/specialty | Source type/color/coordinates retained; employment lines ellipsize within card, specialty limited to 2 source lines. Full detail remains readable in the dialog. Empty specialties stay empty. |
| `1432:7744`, `1432:7745`, `1432:7750`, `1432:7757`, `1432:7759`, `1432:7763`, `1432:7774`, `1432:7790` | `PhysicianProfileDialog` panel/close/heading/identity/tabs/content | Data-driven extension of the extracted expert dialog: panel896px, radius24, white, padding32; close36px at16px inset; title32/32 weight600 #1E3A5F; name18/18 weight590; metadata14/20; tabs14/18 with 2px #2563EB active underline; body16/24 #4B5563. Flow height adapts to the actual source paragraphs, with in-dialog scrolling. |

All 177 doctor details use the new document source, including known doctors; old homepage profile copy is not reused. Basic information remains visible above the tabs. Empty academic/research sections are hidden. No source-designer notes, license IDs or placeholder slashes are emitted.

### Current desktop verification — 2026-10-30

- Figma connection rechecked at 2026-10-30T09:50:30.439Z through the same current-session IAB Design tab; source node `1689:4814`, Design/Layers/Properties all readable and retained for handoff.
- Source/content verification: `artifacts/physicians-directory-2026-10-30/data-verification.json`; all 177 document records retained with 177 unique IDs, 34 departments, both same-name records and three deliberately empty card specialties.
- Local desktop screenshot: `artifacts/physicians-directory-2026-10-30/all-desktop-1440.png`; additional desktop captures at 1024/1280/1440/1920, all without horizontal overflow or broken images.
- Figma reference: `artifacts/physicians-directory-2026-10-30/figma-current.png`; unchanged hero crop nMAE **0.9164%**, unchanged footer crop **0.3006%**. Card geometry x112/y646, width389.328125 (browser subpixel rounding), height284, source gap24. Additional document records and the complete department selector are user-authorized content extensions, not full-page pixel-equivalent to the five-record sample.
- Behavior evidence: `artifacts/physicians-directory-2026-10-30/behavior-qa.json`; six shortcuts and all 34 exact-department selections verified against complete record IDs. Every one of 177 detail dialogs opened and every populated tab compared against the document-derived data; avatar visibility, Escape/button/overlay close, focus restoration and scroll restoration passed. Header menu and consultation entry also passed. No browser errors or failed local resources.
- Reviewed screenshots: all-doctors, 1024/1920 desktop, full-department selector state, document details with/without portraits and both same-name records. Motion preserves resting geometry and reduced-motion behavior remains available.
- Current gate: `scripts/audit-physician-directory.mjs` runs after the locked historical Figma baseline audit. It requires fresh unchanged current Figma sources, the archived document hash, current implementation/data hashes, all 177 detail checks, all department IDs and fresh desktop screenshots. Historical sample screenshots are never accepted as current directory evidence.
- Mobile geometry: frozen by the user's desktop-only instruction; no new mobile scope is claimed.
- Validation commands: scoped `audit:figma physicians.md`, `build:app` (image preparation, `vue-tsc -b`, Vite production build), and `git diff --check` passed. Logs: `artifacts/physicians-directory-2026-10-30/app-build.log` and `behavior-qa.json`. The full-site audit remains blocked by unrelated pages' historical screenshot/evidence freshness; see `full-site-gate.log`. The doctors scope itself passes. No deployment was performed in this task.

## 2026-11-05：医生卡片与品牌交互更新

- Current source check: `寰宇云医 (53).fig` → `寰宇云医 (54).fig`，官方导出差异检查覆盖 `1689:4814`（中国医生）及共享依赖，结果 `unchanged`；证据 `artifacts/doctor-brand-20261105/final/source-53-54.json`。
- Figma source card `1741:5785` 的 hover summary 使用 `SourceLearnMore.vue` 映射到真实 `1741:5814` SVG。常态 summary 保持卡片相对 y211，hover/focus 上移31px至y180，入口位于 x24/y244；整卡可点击、键盘可聚焦，卡片无阴影。
- 首页专家卡 `1412:6419`、`1414:7095`、`1414:7128`、`1414:7161` 使用真实 `1412:6447` 箭头资源；常态 summary y232、hover/focus y200，入口 x24/y272，四张卡无阴影。文案由 i18n 提供，触屏保持可见入口。
- 新页头 Logo 使用 Figma 148×48 资源 `/images/brand/univadoc-plus.png`；首页源图 `2326:8518`、中国医生页头 `1689:5394`、牙科及医生详情页均已检查。深色 footer 保留当前稿的浅色寰宇云医字标，避免深色背景上的深色新字标不可读。
- Verification: `artifacts/doctor-brand-20261105/final/{physicians-rest.png,physicians-hover.png,home-experts-rest.png,home-experts-hover.png,dental-profile-rest.png}`；中国医生 60 张卡、首页4张专家卡及牙科详情5标签在 1440 桌面回归无资源错误/横向溢出；医生详情卡截图 nMAE 0.3635%、右侧简介 nMAE 0.1632%。`vue-tsc -b`、Vite build、`git diff --check` passed。全站 `audit:figma` 仍会报告其他历史页面证据过期，不将其误报为本项失败。
- Status: verified for this desktop batch; mobile layout remains frozen per user instruction. This batch is local and has not been published.


## 2026-11-01 当前数据与第五轮回归（80000）

- 当前以精简发布文档为准：57位文档医生与3位原站保留医生，共60位、36科室；上文177位为历史版本。保留用户确认的周莉莉血液病擅长覆盖，其余字段按精简文档。首页专家未按此目录替换。
- 全部60医生详情及36科室筛选、6快捷入口、4桌面宽度、无头像状态、关闭/焦点/滚动恢复回归通过；共享加载/基线测量优化未改变医生数据。首次主图预请求在实测不利后未采纳。
- 同条件LCP中位3364→3404ms，约1%差值视为持平。专项源及证据门禁通过；证据为`artifacts/patient-updates-2026-10-31/physicians/behavior-qa.json`及`artifacts/performance-exhaustive-2026-11-01/{final-verification.json,final-source-summary.json,slow-final/qa.json}`。移动设计冻结。


## 2026-11-05 scoped entry, hover and scroll fixes

- Scope: the reported interaction defects, not a new whole-page or whole-site design acceptance. Per the latest user instruction, all unfinished footer links and placeholder contact details are retained; shared and report footers are unchanged. Source Footer subtrees explicitly preserve their existing entries.
- Connection: current-session browser2/tab22 verified through the unique connector at 2026-11-05T07:57:35.089Z; Design/Layers/Properties readable. Evidence: `artifacts/entry-hover-scroll-20261105/connection-final.json`.
- Official final export: exportedAt `2026-11-05T08:03:05.948Z`, SHA256 `0c82c204361fb010701848646b65c42c6bbe51152113e81bc5d46df5e50d2442`. Reports `final-home-original.json` and `final-physicians-original.json` compare with the original implementation exports. The homepage main frame and the physician 306-node frame remain unchanged. `final-dental-original.json` compares the current dental implementation export (52): card/content/tabs unchanged, header navigation changed. `final-current.json` verifies all 16636 pc-page nodes and dependencies unchanged between (54) and final (56). Reports are in `artifacts/entry-hover-scroll-20261105/`; historical locks are untouched.
- Live navigation reread: 853x28, gap2; Home44x28 with24x16 text; services text/arrow #4B5563. Header replacement IDs map to the existing semantic public navigation component by label/route; dental and its detail routes highlight Dental only. Live `1523:59` unbound its variable, retaining the #1E3A5F over #DD6B20 fill,14 radius,52 height already rendered as resolved CSS.
- Final production build: `20261105083000`. `production-final/qa.json`:60 physician cards,4 homepage cards,5 dental tabs,6 supplied doctors,12 translated checks,12 narrow-screen regressions; no browser errors, failed assets or horizontal overflow. `production-behavior-final/qa.json`:14 route entrance checks, frame-by-frame hover,3 desktop widths x5 languages; card/name drift0, scroll style mutations0, synchronized release. No patient data submitted.
- Final screenshot comparison: `visual-final/comparison.json`; physician hover nMAE0.9010%/pixelmatch0.2798%, homepage expert hover0.3984%/0.1090%, dental card0.3636%/0.2681%, profile content0.1632%/0.0028%. Actual source DPR/fractional crop used, without stretching the card to the export's pixel width. Desktop, hover, pinned/released and English captures personally reviewed.
- Type checking, five-language catalog checks, image preparation, production build and diff checks passed. Full `audit:figma` still fails historical whole-site evidence/source locks, including old expert dialogs replaced in current Design. This scoped evidence does not mark those pages complete and no historical gate was weakened.
- Physician summaries move up 31px on hover/keyboard focus; identity and card geometry remain stable. Keep authored glyph positions for original source cards and the existing text clamp for document records. No physician data or department filtering was changed.
