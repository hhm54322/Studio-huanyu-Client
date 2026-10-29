# 工具包 · 药品入境规定

- Route: `/steps/toolkit-detail?article=medication-entry`
- Figma frame: `03信任与常见问题-05来华就医全流程工具包-04`
- Node ID: `1604:945`；真实文章 `1604:957`；已核验 PC 模板 `143:3058`
- Source baseline HTML: `docs/figma-source/toolkit-revision/medication-entry/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/toolkit-revision/medication-entry/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/toolkit-revision/medication-entry/assets-2026-10-22.json`
- Desktop frame: PC 模板 1440px，Auto Layout 高度由真实全文排版计算
- Mobile frame: deferred by user; existing mobile UI unchanged
- Status: verified (desktop only; mobile deferred by user)

## Layer Mapping

实施前已在 Live Figma Dev Mode 完整展开文章子树，逐个选中全部 15 节点复制 CSS/SVG；原生 `.fig` 对父子、名称、同级顺序和可见性交叉核验 15/15 一致。完整参数及映射文件位于本篇独立源目录。正文源节点沿用保险旧图层名，但实际 TEXT 为药品入境规定，不按图层名猜正文。

| Figma node | PC owner | 参数 / 内容 |
| --- | --- | --- |
| `1604:957` | `143:3062` | 375×1381.1171875 源文章；PC 906px、padding32、radius24 |
| `1604:958` | `143:3065` | 返回链接；源高27.1171875、gap8 |
| `1604:959`、`1604:960`、`1604:961` | `143:3066` | 12px 源返回箭头及完整同源 SVG 子路径 |
| `1604:962` | `143:3069` | 返回信任与常见问题；源12/12、400、#5C6584 |
| `1604:963` | `143:3070` | 分类外层，源 padding-top24 |
| `1604:964` | `143:3071` | 分类背景，源 padding8/12、radius9999、蓝10% |
| `1604:965`、`1604:966` | `143:3072` | 02 出行中 · 落地办理工具；源10/10、600、#2563EB |
| `1604:967`、`1604:968` | `143:3073`、`143:3074` | 药品入境规定；源20/20、600；PC40/60、600 |
| `1604:969`、`1604:970`、`1604:971` | `143:3075`、`143:3076`、`143:3077` | 原始完整正文；源12/18、章节14/22；PC16/24、章节24/36、段距12 |

先建立真实源 HTML/CSS 与独立 PC 模板组合锁，再接 Vue。原始375px稿导出保真与桌面组合保真分别核验，不把组合图冒充独立Figma PC稿。原正文中个别句子存在拼接/缺词，保留源文字，不擅自补写海关法规与合规承诺。

## Assets

| 资源 | Figma node | 项目路径 / 用途 |
| --- | --- | --- |
| 本篇返回箭头 | `1604:959` | `public/images/figma/toolkit-revision/medication-entry/node-1604-959.svg`，精确 Dev SVG，仅源保真 QA |
| PC 返回、咨询、语言 | `143:3066`、`143:3129`、`143:3155` | 独立锁定 PC 模板同源 SVG |
| PC 联系图标 | `143:3208`、`143:3214`、`143:3219` | 独立锁定 PC 模板同源 SVG；本文无照片、无新增大图 |

## Prototype And Motion

PC 目录 `143:3099` 接入本篇，返回 `/trust`；原设计没有阅读全文的卡片不新增按钮。沿用已经实际检查 Octagos 长文滚动和目录后的自然粘性目录（24px/底部释放）、620ms进入与220ms链接反馈；静态基线通过后才验收复用动效。reduced-motion关闭过渡；移动端暂缓。不新增业务 API 或改医疗报告行为。

## Verification

- Figma reference screenshot: `artifacts/figma-toolkit-2026-10-22/medication-entry/source-figma.png`
- Local desktop screenshot: `artifacts/figma-toolkit-2026-10-22/medication-entry/desktop-final.png`
- Local mobile: deferred by user
- Verification run: 2026-10-22，完整源锁/静态核验后接入目录，开发及生产 preview 重复全套核验。
- Figma 原稿导出 750×2763：pixelmatch0.6297985%、nMAE0.9287430%；原始 RGB>16 诊断5.6478224%，单独保留，不宣称所有诊断均<1%。只归一化小数帧高造成的1原生像素底边，不缩放/位移正文。
- PC 组合与 Vue：1440×2393px，pixelmatch0%、nMAE<0.000001%；15个节点owner全存在，全文一致，无坏图或横向溢出。已亲自检查源稿并排首尾、整页、正文与页脚；原始源保真和PC组合保真口径不混用。
- 1024×600、1440×900、1920×1080：目录进入/当前页、返回、历史前后退、咨询/联系、未接入口不导航、自然粘性目录24px/底界释放/回滚恢复全部通过。
- 620ms进入实际插值及静止恢复、reduced-motion通过。仅复用已核验内容阅读动效；本轮再次实际滚动 Octagos 长文。
- 新文章在<=900px安全返回/trust，仅验证冻结边界，不作为移动开发/验收。未改 Trust/Step 卡片，因为本篇原卡片没有阅读全文，不添加设计外按钮。
- 类型检查、生产构建、diff检查及源专项门禁通过；未改后端、管理端、报告生成行为，未提交或发布。原稿缺词不擅补法规内容，属于原始文案待业务确认，不是隐藏的实现差异。
- Remaining differences: none
