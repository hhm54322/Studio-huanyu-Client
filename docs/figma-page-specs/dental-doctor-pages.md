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
