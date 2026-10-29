# 信任长文 · 药品安全说明

- Route: `/trust` → 药品安全说明 → 阅读全文（原生弹窗，不新增路由）
- Figma frame: `03信任与常见问题-04信任深度长文-04`，`1595:3547`
- Desktop template: `信任深度长文详情模版`，`143:4206`，1440×754
- Source baseline HTML: `docs/figma-source/trust-safety-revision/medicine/baseline-2026-10-22.html`
- Desktop composition HTML: `docs/figma-source/trust-safety-revision/medicine/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/trust-safety-revision/medicine/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/trust-safety-revision/medicine/assets-2026-10-22.json`
- Source extraction: 2026-10-22；官方原生文件 SHA256 `8e274b299ca9208685e984e7cdb8b87ae5487c66e2c5103350e1118afc73a56d`；全量展开 Layers，14 节点逐项 Dev CSS 与原生参数交叉核对
- Static lock: 独立 `baseline-lock` / `desktop-composition-lock` 已在 Vue 接入前创建；不改前批文章源锁
- Mobile frame: 375×812，仅提取真实正文，移动网站开发/验收按用户要求暂停
- Status: verified (desktop template composition only; mobile deferred by user)

## Layer Mapping

每项原始 CSS 位于该目录的 `dev-mode-2026-10-22.json`，尺寸、位置、约束、文字、原生布局等位于 `native-parameters-2026-10-22.json`；完整兄弟顺序与可见性保留于 `native-inventory`。以下具体映射已保存于 `desktop-variant` 的 `contentMapping`，先完成映射再接入 Vue。

| Figma Node ID | 层级/父节点 | 桌面运行 owner / 元素 |
| --- | --- | --- |
| `1595:3547` | 根 | `143:4206` TrustArticleDialog / dialog |
| `1595:3548` | Container / `3547` | `143:4208` backdrop |
| `1595:3549` | Frame 631 / `3548` | `143:4209` HomeSourceNode 面板 |
| `1595:3550` | Button / `3549` | `143:4210` button |
| `1595:3551` | Icon / `3550` | `143:4211` 原始 SVG |
| `1595:3552` | Vector / `3551` | `143:4211` 精确路径 owner |
| `1595:3553` | Container / `3549` | `143:4218` 正文容器 |
| `1595:3554` | Text / `3553` | `143:4219` 完整六段正文 |
| `1595:3555` | Container / `3549` | `143:4213` 标题组 |
| `1595:3556` | Heading 2 / `3555` | `143:4214` 标题容器 |
| `1595:3557` | 药品安全说明 / `3556` | `143:4215` 标题 |
| `1595:3558` | Paragraph / `3555` | `143:4216` 副标题容器 |
| `1595:3559` | 一细胞一码，全链路可追溯 / `3558` | `143:4217` 副标题；明显笔误修正“一药一码” |
| `1595:3560` | dragger / `3547` | 设备横条，非网页内容，不渲染 |

## Sections / Typography / Components

| 项目 | 原始内容源参数 | 桌面模板参数 |
| --- | --- | --- |
| 面板 | 343×398、padding16、radius20、白底、fit-content 网格 | width896、padding32、radius24、inner832、自然内容高度 |
| 标题 | PingFang SC16/16、600、字距.396、#1E3A5F | PingFang SC32/32、600、字距.396、#1E3A5F |
| 副标题 | 11/16、400、#6B7280，容器顶部8 | 14/22、400、#6B7280，容器顶部8 |
| 正文 | 311×310、12/18、400、#4B5563、两端对齐 | 832px、16/24、400、#1E3A5F、两端对齐、段距12 |
| 正文容器 | padding-top16 | padding-top24 |
| 关闭 | 36×36、right8/top8、SVG20 | 36×36、right16/top16、SVG20 |
| 遮罩 | 黑色50%、blur4 | 黑色50%、blur4、上下安全区40 |

桌面沿用已读取的 PC 模板 Auto Layout；不把手机宽度和固定高度搬到桌面，也不把该组合称为独立 Figma PC 稿。没有新增整图 UI。

## Assets

| 资源 | 源节点 | 项目路径 |
| --- | --- | --- |
| 内容源关闭 SVG20 | `1595:3551`（含 `3552`） | `public/images/figma/trust-safety-revision/medicine/node-1595-3551.svg` |
| 桌面关闭 SVG20 | `143:4211`（含 `4212`） | `public/images/figma/trust-content-revision/node-143-4211.svg` |

内容源背景是设计参考截图，仅留 ignored artifacts，运行时不使用该截图代替 DOM。

## Prototype And Motion

点击阅读全文在当前页打开，关闭/Esc/遮罩可关闭；锁定背景滚动、Tab 焦点循环、恢复触发按钮焦点和原滚动位置。复用前批已核验的轻量动效：进入320ms cubic-bezier(.22,1,.36,1)、y16→0；退出200ms ease、y0→8；遮罩250ms；reduced-motion 关闭动画。静态截图使用 reduce，之后再逐篇核验动态插值与交互。

## Verification

- Figma reference screenshot: `artifacts/figma-content-2026-10-22/safety/medicine-figma.png`
- Local desktop: `artifacts/figma-content-2026-10-22/safety/medicine/medicine-final-local.png`，生产 preview 对应同目录`medicine-production-local.png`
- Local mobile: deferred by user
- 源截图核验与桌面模板组合核验分开报告，生成基线不是独立 Figma 桌面截图。
- 原始参数和全文不改；只在派生显示文本及入口副标题修正“一细胞一码”笔误。
- 设计中的医疗/统计表述按原文接入，不代表已进行外部医学事实审核，本次不新增医疗承诺。
- Verification run: 2026-10-22；静态截图人工查看后，已实测开发/生产 preview 的 1024/1440/1920、全文、关闭/Esc/遮罩、Tab 锁焦、焦点/滚动恢复、短屏上下40px、进入/退出插值、reduced-motion、跨900px断点清理，无坏图或横向溢出。
- 源稿面板对实际 Figma 导出：pixelmatch0.0015464%、nMAE0.2505906%。这是提取源保真，不是移动网站验收。
- 桌面模板组合接入：pixelmatch0.1180259%、nMAE0.0692237%；实际896×426，由真实全文和 PC 模板自然布局得到。该指标不是不存在的独立 PC 文章稿比较。签证入口接入后开发/生产证据已再次完整刷新。
- 专项记录：`safety/medicine/source-qa.json`、`final-qa.json`、`production-qa.json`；pixelmatch threshold.15/includeAA=false 与 nMAE 均<1%，另存原始RGB>16诊断值0.1366271%。
- Remaining differences: none
