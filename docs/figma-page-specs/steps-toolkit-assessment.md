# 工具包 · 来华就医可行性评估

- Route: `/steps/toolkit-detail?article=assessment`
- Figma frame: `03信任与常见问题-05来华就医全流程工具包-02`；正文结合已核验PC工具包模板
- Node ID: `1604:270`，正文 `1604:282`；PC模板 `143:3058`
- Source baseline HTML: `docs/figma-source/toolkit-revision/assessment/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/toolkit-revision/assessment/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/toolkit-revision/assessment/assets-2026-10-22.json`
- Desktop frame: PC模板1440px，正文与整页高度由已复制Auto Layout和真实全文计算
- Mobile frame: deferred by user; existing mobile UI unchanged
- Status: verified (desktop only; mobile deferred by user)

## 来源与层级

先在Figma左侧递归展开Layers，记录整页121个网站节点，再将本篇实际使用的文章子树15节点逐个选中复制右侧Dev Mode CSS。原生`.fig`与这15项的父子层级、同级顺序、显隐和名称全部核对；原文、混合字重、段距、字号来自真实TEXT节点。无截图猜参数。

`docs/figma-source/toolkit-revision/assessment/`保存逐节点Layers、原生参数、Dev CSS、源树、具体Node ID→Vue owner、静态HTML/CSS和独立哈希锁。桌面沿用已核验模板 `143:3058` 的完整导航、双栏、目录、正文排版、页脚和图标，不开发尚未定稿的手机UI。源稿15节点和桌面模板节点分别记录，不将PC组合基线称作独立Figma桌面稿。

| Figma node | Parent | Vue owner | 参数来源 |
| --- | --- | --- | --- |
| `1604:282` | 本篇根 | `143:3062`文章区域 | PC906px、32px内边距、24px圆角 |
| `1604:283–287` | 逐层记录JSON | `143:3065/3066/3069`返回链接与精确SVG | PC返回样式；返回`/trust` |
| `1604:288–291` | 逐层记录JSON | `143:3070/3071/3072`分类标签 | PC14/14、10×16px内边距 |
| `1604:292/293` | 逐层记录JSON | `143:3073/3074`标题 | 原文，PC40/60、600 |
| `1604:294–296` | 逐层记录JSON | `143:3075/3076/3077`全文 | PC842px、16/24、段距12；章节24/36、600 |

以上仅摘要；15项各自具体ID与selector以`node-to-code-2026-10-22.json`为准，不以区间代替机器映射。

## Assets

| 资源 | Figma Node ID | 项目路径 / 用途 |
| --- | --- | --- |
| 本篇返回箭头 | `1604:284` | `public/images/figma/toolkit-revision/assessment/node-1604-284.svg`；精确Dev SVG，按原生变换后边界放置，仅源稿核验 |
| PC返回、咨询、语言图标 | `143:3066`、`143:3129`、`143:3155` | PC模板的同源SVG，见`assets-2026-10-22.json` |
| PC联系图标 | `143:3208`、`143:3214`、`143:3219` | PC模板的同源SVG，无新增正文图片 |

## Prototype And Motion

只接文章阅读、目录、返回和既有咨询入口，不改`/report`、API或医疗报告生成。分类标签/标题/全文来自本篇Figma；未接文章目录仍不导航。沿用已验证的文章620ms轻量进入和220ms链接反馈，静止布局不变；reduced-motion关闭过渡。目录保持视口顶部24px并在双栏底部释放。

## Verification

- Figma reference screenshot: `artifacts/figma-toolkit-2026-10-22/assessment/source-figma.png`
- Local desktop screenshot: `artifacts/figma-toolkit-2026-10-22/assessment/desktop-final.png`
- Local mobile: deferred by user
- Verification run: 2026-10-22，`scripts/toolkit-article-qa.cjs assessment`；开发与生产preview均重新执行完整截图、行为和动效核验
- 原始375px内容导出保真与1440px桌面模板组合接入分别记录，不混淆指标。
- 原始Figma导出750×3951：pixelmatch0.6179364%，nMAE0.9578433%；保留单独RGB>16诊断6.0587193%，不混称所有诊断均<1%。仅将Chromium小数帧高产生的1原生像素底边归一化，不缩放或移动内容。
- 1440px桌面组合：pixelmatch0%，nMAE<0.00002%；这表示Vue接入与锁定PC组合一致，不表示存在独立PC原文稿。源15个节点全量映射、全文一致，无坏图或横向溢出；已亲自查看原图并排与实际桌面页面。
- 1024×600、1440×900、1920×1080：目录顶部24px固定、按双栏真实底界释放、回滚恢复、键盘返回、目录入口、历史前进后退、咨询打开关闭、联系链接、未开放入口不导航通过；完整620ms进入插值与reduced-motion通过。
- 生产preview重复同套核验通过。类型检查、直接生产构建和本篇专项门禁通过；全站历史证据问题仍留既定回归批次，不代表全站门禁通过。未提交或发布，未改后端或医疗报告行为。
- Remaining differences: none
