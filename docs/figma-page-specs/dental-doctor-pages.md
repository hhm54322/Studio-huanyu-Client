# 牙科医生详情独立页面

- Route: `/dental/doctors/:slug?tab=profile|treatment|cases|reviews|services`
- Status: verified — 2026-11-03；本次桌面页面及案例组件通过，移动端按用户要求冻结并保留原流程。
- Figma frame: 05医生简介、06治疗流程、07案例集、08患者评价、09在华就医保障服务及独立滚动/案例状态。
- Source baseline HTML: `docs/figma-source/dental-pages-2026-11-03/profile/baseline-2026-11-03.html`
- Source baseline CSS: `docs/figma-source/dental-pages-2026-11-03/profile/dev-styles-2026-11-03.css`
- Source asset manifest: `docs/figma-source/dental-pages-2026-11-03/assets-2026-11-03.json`
- Source export: `artifacts/dental-page-20261103/source/huanyu-2026-11-03.fig`
- Source SHA256: `226e87c1db70c194a959bf0a74a5549f8592ed6d2f6b02fe2031adadd71d02cc`
- ExportedAt: 2026-11-03T09:47:45.482Z
- Live connection: `figma-connect.mjs`；current session `01a0bebd-b6f9-7fd3-bf5a-b79501589b80`，IAB tab4，Design/Layers/Properties 均通过。完整证据 `artifacts/dental-page-20261103/connection-evidence.json`。
- 原实现比较: `artifacts/figma-source-gate/latest-dental.json`，旧详情7帧已删除，主流程/机构不变。
- 同名候选: `3423:5659` 已在 live Design 核对，为徐宇中国医生页，不属于牙科本次范围；`3421:1925` 等草稿保留历史意义，不作为新页面源。
- Final connection check: 2026-11-03T12:58:17.044Z，同一IAB tab4/session；Design/Layers/Properties 均可读，选中案例图片 `3423:6067`。此连接核验与页面比对分别记录。
- Final official export: `artifacts/dental-page-20261103/source/huanyu-final-2026-11-03.fig`；导出2026-11-03T12:41:19.646Z；SHA256 `6c33f3d56ac70481f6c462def8d3496c42bf3d2655969b4de75fb399a9ae3e9f`。
- Current-source comparison: `artifacts/dental-page-20261103/final-source-comparison.json`，针对下表7个源及共享依赖均无变化，无缺失图像、向量或完整性错误。全文件另有徐宇候选页3项属性变化，明确排除牙科范围，未自动接受任何新基线。

## 源与逐节点映射

| 状态 | Node ID | Desktop frame | Nodes |
| --- | --- | --- | ---: |
| profile | `3421:2534` | 1440 × 1493 | 277 |
| treatment | `3421:2810` | 1440 × 1980 | 303 |
| cases | `3421:3113` | 1440 × 1528 | 267 |
| reviews | `3421:3380` | 1440 × 2016 | 318 |
| services | `3421:3698` | 1440 × 1698 | 312 |
| scroll | `3423:4315` | 1440 × 1087 | 147 |
| case-detail | `3423:5936` | 888 × 478 | 20 |

所有1644节点的完整父子关系、兄弟顺序、可见性、选中URL及Dev Mode CSS/SVG、原生几何/字形基线、资产填充均在 `docs/figma-source/dental-pages-2026-11-03/<state>/` 下的 `ui-layers`、`dev-mode`、`native-inventory`、`native-parameters`、`native-image-paints`。在 Vue 改动之前已生成 `baseline-2026-11-03.html`、`dev-styles-2026-11-03.css`、`source-tree-2026-11-03.json`、`node-to-code-2026-11-03.json` 和不可覆盖的 baseline-lock。每个Node均映射到 `HomeSourceNode.vue[data-figma-node]`，动态资料子树由 `DentalDoctorPageContent.vue` 以 `data-figma-source-node` 保留来源。

## 几何、字体与资源

- 页宽1440，顶部公共导航65。内容起点x112/y113；左右列304/888，间距24；主内容宽1216。侧卡448高，内边距32，头像110×110。
- 右侧内宽824，左右padding32。菜单高33，内容起点相对右侧top77/81；白底圆角24。
- 主内容结束后48间距到相关推荐；推荐卡三列，单卡389.33334×284，列距24；相关推荐尾至页脚96。
- 字体、字号、行高、字重、颜色、小数坐标、填充变换以各节点Dev Mode及native参数完整记录为准，不从截图估值。
- 原始图片与精确SVG在 `/images/figma/dental-pages-20261103/`，manifest `assets-2026-11-03.json`。医生头像另按2026-11-03供稿更新，保留ZIP与映射。

## Assets

| 资产 | Node ID | 使用方式与路径 |
| --- | --- | --- |
| 资质图标 | `3421:2631` | 原始Dev Mode SVG，`public/images/figma/dental-pages-20261103/node-3421-2631.svg` |
| 案例箭头 | `3423:6063` | 原始Dev Mode SVG，`public/images/figma/dental-pages-20261103/node-3423-6063.svg` |
| 案例缩略图样式 | `3423:6067` | 原生FILL，80×80、圆角16；供稿图片生成 `public/images/dental-cases/case-01-thumb.webp` 等 |
| 原医生头像 | `3421:2582` | 原生110×110头像蒙版；六位新增医生按供稿替换内容，具名映射见资料README |

其余138条资产映射、图像源哈希与填充变换见完整manifest及各状态native-image-paints；SVG内部向量保留精确所属导出节点。运行时JSON、生产SVG/WebP、资料文档入Git；截图、Dev Mode导出记录、.fig、82MB原图ZIP仅本地留档并忽略Git。

## Prototype And Motion

- 查看详情与卡片案例入口进入同一个医生独立页面；五标签为同一页面的内容状态，可直接链接与刷新。机构介绍仍使用原机构弹窗。
- 用户2026-11-03补充：案例默认收起，保留标题及80×80缩略图，点击右侧24×24箭头展开/收起说明。对应 `3423:5936` 展开/收起设计；条目824宽、圆角24、padding24、间距24。新内容按自然高度排版，无硬裁切。
- 六位文档医生依列表顺序分别分配案例1–18，每人三个；谭兆林保留原案例并补充19–20。全部内容与编号追溯到原文档/图片ZIP，不生成医生或患者事实。
- 点击获取报价回到原牙科第3步，携带doctorId；返回列表保留筛选/项目/排序及输入状态。新路由无移动端导航入口。
- 按注释 `3423:4659`：左侧医生卡与菜单容器同步吸顶，卡片top113、菜单文字top137（容器内24），主内容滚完、相关推荐到达时同步释放，相关推荐与侧卡保留48间距；1024宽时按源比例缩放。
- 不添加改变布局的入场动画；箭头状态、自然滚动在reduced-motion下即时可用；不改报告和管理端。
- 报价输入与上传仅在内存保留，不写localStorage。保留已提交请求以防重复；更换意向医生或申请内容则使用新请求编号。

## Verification

- Verification run: 2026-11-03T13:22:37.390Z；`scripts/dental-doctor-pages-qa.cjs`，开发与生产预览均通过；`scripts/audit-dental-doctor-pages.mjs`独立校验源、全部节点覆盖、不可覆盖基线、供稿/资产哈希和证据时效。
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/dental-page-20261103/reference/native-3421-2534-figma.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/dental-page-20261103/production-qa/profile-page.png`
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/dental-page-20261103/production-qa/mobile-regression-390.png`
- 全部5标签、原侧卡及案例展开/收起状态分别截图；7个可直接对照的区域同时满足nMAE<1%、pixelmatch<1%。最大差异为案例展开区域0.654%/0.892%，包含字体渲染及压缩差异。供稿替换的简介、头像、案例数与相关推荐按授权数据检查，不以Figma旧示例文字作业务数据。
- 7位医生逐一访问5标签、案例默认收起/展开/收起、放大/Escape、机构介绍和键盘标签导航；1024/1440/1920宽吸顶及释放边界和横向溢出均通过。
- 真实列表筛选→详情→返回→案例→报价→资料保留；模拟提交验证医生关联、相同请求防重复与换医生后新请求。未向真实后端提交患者资料。
- 390/430宽保留旧移动流程，新详情链接回到原移动列表；本次不开发移动端版式。
- 类型检查和Vite生产构建通过。本次页面门禁单独运行；全站审计仍会报告其他历史页面的旧证据失效，原历史基线和门禁未放宽。
- Remaining differences: none


## 2026-11-05：医生资料卡与品牌更新（实施前参数记录）

- 当前源：`/Users/hhm/Downloads/寰宇云医 (52).fig`，导出 `2026-11-05T02:39:46.682Z`，SHA256 `40cfc2a778a324a311807aa26d51799bdfde168e33c00bfb9800f28d62ea1de5`。历史2026-11-03锁与截图保留。
- 连接：唯一入口 `figma-connect.mjs`，本会话 IAB tab22，Design/Layers/Inspect 均通过；证据 `artifacts/doctor-brand-20261105/connection-start.json`。
- 当前源比较：`artifacts/doctor-brand-20261105/source-start-dental.json`；五个标签与滚动状态的卡片已替换为新子树。未改变节点保留此前逐节点 Dev Mode 记录，比较器逐字段及共享依赖确认一致；变更及新增节点重新选中 live Layers，抄录 Dev Mode。完整当前层级与 Node→DOM 映射记录在 `docs/figma-source/dental-pages-2026-11-05/<state>/`。
- 新资料卡：profile `3800:7081`、treatment `3800:7116`、cases `3800:7151`、reviews `3800:7186`、services `3800:7221`；滚动样式 `3796:7024`。对应 `HomeSourceNode[data-dental-doctor-card]`，每个子节点精确映射 `[data-figma-node="ID"]`。
- 资料卡304×489，padding32，圆角24，白底，无阴影；垂直gap20。头像110×110在x97/y32；姓名/职称组y154；分隔线`3800:7090/7091` x32/y216、240×1，#F3F4F6。资料组`3800:7092` x32/y237、240×52，两行gap12；评分/参考价组`3800:7103` x61/y309、182×32；按钮组`3800:7110` x32/y361、240×96，两按钮240×42、gap12。
- profile右侧同时新增分隔线`3741:6491/6492` x32/y177、824×1，说明内容`3421:2625`由y177变为202；右侧与主区高度489，相关推荐y585。对应尺寸由新的精确源树承接。
- 头像、姓名、职称、城市及经验、参考价继续使用既有供稿数据；长文本需在授权内容替换时居中并保持原分隔线与模块间距，不能依赖旧child索引。
- Logo节点 `3796:7061/7063/7065/7067/7069/7071` 均148×48、FILL，图像SHA1 `db2b7822dd673324ce608b02dd62b1f1ca8bdc36`，与用户提供图2核对。所有品牌入口保留各页原Logo容器与首页导航行为。
- Status: static implementation；当前仅桌面修改，移动版式冻结，仅回归。


## 2026-11-05 scoped entry, hover and scroll fixes

- Scope: the reported interaction defects, not a new whole-page or whole-site design acceptance. Per the latest user instruction, all unfinished footer links and placeholder contact details are retained; shared and report footers are unchanged. Source Footer subtrees explicitly preserve their existing entries.
- Connection: current-session browser2/tab22 verified through the unique connector at 2026-11-05T07:57:35.089Z; Design/Layers/Properties readable. Evidence: `artifacts/entry-hover-scroll-20261105/connection-final.json`.
- Official final export: exportedAt `2026-11-05T08:03:05.948Z`, SHA256 `0c82c204361fb010701848646b65c42c6bbe51152113e81bc5d46df5e50d2442`. Reports `final-home-original.json` and `final-physicians-original.json` compare with the original implementation exports. The homepage main frame and the physician 306-node frame remain unchanged. `final-dental-original.json` compares the current dental implementation export (52): card/content/tabs unchanged, header navigation changed. `final-current.json` verifies all 16636 pc-page nodes and dependencies unchanged between (54) and final (56). Reports are in `artifacts/entry-hover-scroll-20261105/`; historical locks are untouched.
- Live navigation reread: 853x28, gap2; Home44x28 with24x16 text; services text/arrow #4B5563. Header replacement IDs map to the existing semantic public navigation component by label/route; dental and its detail routes highlight Dental only. Live `1523:59` unbound its variable, retaining the #1E3A5F over #DD6B20 fill,14 radius,52 height already rendered as resolved CSS.
- Final production build: `20261105083000`. `production-final/qa.json`:60 physician cards,4 homepage cards,5 dental tabs,6 supplied doctors,12 translated checks,12 narrow-screen regressions; no browser errors, failed assets or horizontal overflow. `production-behavior-final/qa.json`:14 route entrance checks, frame-by-frame hover,3 desktop widths x5 languages; card/name drift0, scroll style mutations0, synchronized release. No patient data submitted.
- Final screenshot comparison: `visual-final/comparison.json`; physician hover nMAE0.9010%/pixelmatch0.2798%, homepage expert hover0.3984%/0.1090%, dental card0.3636%/0.2681%, profile content0.1632%/0.0028%. Actual source DPR/fractional crop used, without stretching the card to the export's pixel width. Desktop, hover, pinned/released and English captures personally reviewed.
- Type checking, five-language catalog checks, image preparation, production build and diff checks passed. Full `audit:figma` still fails historical whole-site evidence/source locks, including old expert dialogs replaced in current Design. This scoped evidence does not mark those pages complete and no historical gate was weakened.
- Replace per-scroll reactive transforms with native sticky tracks: header top0, card top113, tab container top133 with the original text baseline. Card and tabs release at the same content boundary, 48px above related recommendations. CSS zoom preserves source coordinates at scaled desktop widths. ResizeObserver only updates translated card height; scrolling writes no styles.
