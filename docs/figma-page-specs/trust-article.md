# 信任深度长文 · JCI认证真相弹窗

- Route: `/trust` → JCI认证真相“阅读全文”，不新增详情路由
- Figma frame: `信任深度长文详情模版`
- Node ID: `143:4206`
- Source baseline HTML: `docs/figma-source/trust-content-revision/trust/baseline-2026-10-21.html`
- Source baseline CSS: `docs/figma-source/trust-content-revision/trust/dev-styles-2026-10-21.css`
- Source asset manifest: `docs/figma-source/trust-content-revision/assets-2026-10-21.json`
- Source extraction run: 2026-10-21；Figma原生文件、完整Layers和14节点逐项Dev CSS
- Desktop frame: 1440×754；居中弹窗896×450，x272/y152
- Mobile frame: deferred by user; design not finalized, existing mobile dialog frozen
- Status: verified (desktop only; mobile deferred by user)

## Layer Mapping

14个节点在Vue变更前已完成Layers/Dev CSS/原生参数/HTML/CSS/具体owner映射并由独立baseline-lock锁定。完整机器记录位于`docs/figma-source/trust-content-revision/trust/`；文件名均带`2026-10-21`，包含native-inventory、native-parameters、native-image-paints、ui-layers、dev-mode、source-tree、node-to-code、layers-crosscheck。原生文件SHA256为`29d97343e7e947187db27918706dc9b16c2f7886e08cf2dba453ed1a83bfb1bc`。

| Node ID | Name/type | Parent ID | Vue/DOM owner | Parameters/state |
| --- | --- | --- | --- | --- |
| `143:4206` | 信任深度长文详情模版/FRAME | 根 | TrustArticleDialog.vue dialog | 1440×754参考视窗，原生modal隔离底页 |
| `143:4207` | 底页参考截图/ROUNDED_RECTANGLE | `143:4206` | 不渲染；仅核验资料 | 1440×1136；不得用此整页图代替产品UI |
| `143:4208` | Container/FRAME | `143:4206` | modal overlay DOM | 黑色50%、backdrop blur4，垂直padding40、居中 |
| `143:4209` | Frame 631/FRAME | `143:4208` | HomeSourceNode同ID | 896×450、radius24、white、源padding32 |
| `143:4210` | Button/FRAME | `143:4209` | 同ID button | x844/y16、36×36，关闭 |
| `143:4211` | Icon/FRAME | `143:4210` | 同ID SVG owner | x8/y8、20×20 |
| `143:4212` | Vector/VECTOR | `143:4211` | `143:4211`精确SVG路径 | 10×10，stroke1.66667、#1E3A5F |
| `143:4213` | Container/FRAME | `143:4209` | 同ID DOM | x32/y32、832×62 |
| `143:4214` | Heading 2/FRAME | `143:4213` | 同ID DOM | 832×32 |
| `143:4215` | JCI认证真相/TEXT | `143:4214` | 同ID heading role | 180×32、32/32、600、letter-spacing.396 |
| `143:4216` | Paragraph/FRAME | `143:4213` | 同ID DOM | y32、832×30，padding-top8 |
| `143:4217` | 副标题/TEXT | `143:4216` | 同ID DOM | y8、287×22，14/22、400、#6B7280 |
| `143:4218` | Frame 654/FRAME | `143:4209` | 同ID DOM | x32/y94、832×324，顶部24 |
| `143:4219` | 正文/TEXT | `143:4218` | 同ID可选中文本DOM | y24、832×300，16/24、400、两端对齐、段间12 |

## Sections

源为弹窗不是网页。运行时保留实际`/trust`页面，复制原生弹窗层级；1440×754视窗中心对应x272/y152。较短桌面保留40px上下内边距并允许弹窗容器滚动，不裁掉关闭按钮或末段。移动分支保留旧实现，待设计定稿后再接新源。

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| 标题 | `143:4215` | PingFang SC | 32/32px，字距.396 | 600 | #1E3A5F |
| 副标题 | `143:4217` | PingFang SC | 14/22px | 400 | #6B7280 |
| 正文 | `143:4219` | PingFang SC | 16/24px，段间12 | 400 | #1E3A5F |

## Components And Spacing

896px弹窗＝32＋832＋32；高450＝32＋62＋24＋300＋32。关闭36px，距右/顶16px，图标20px。标题、副标题及正文均采用真实源文字与CSS/原生行基线，不使用截图文字。

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| 关闭X | `143:4211`（含`143:4212`） | 右侧Dev Mode精确SVG，20×20 | `public/images/figma/trust-content-revision/node-143-4211.svg` |

`143:4207`为Figma演示底页，原始图只保存到忽略的artifacts，不进入public资源，不在实际产品中渲染。

## Prototype And Motion

静态截图核验后加入进入/退出淡入和轻位移动效，保持源静止位置。已验证点击阅读全文、关闭、Escape、底页遮罩、Tab焦点锁定、焦点与滚动恢复、短屏和reduced-motion。不将本模板通过等同于其余7篇信任文章已经完成。

动效沿用本批次实际浏览Octagos长文/导航后选择的轻量语汇：进入320ms cubic-bezier(.22,1,.36,1)，opacity0→1、y16→0；遮罩250ms ease；退出200ms ease，opacity1→0、y0→8，结束后才解除滚动锁并恢复焦点。关闭hover为180ms背景反馈，静止时源几何不变。reduced-motion无进入/退出动画。关闭按钮增加不改变几何的z-index，以免源Heading宽容器遮挡点击。

## Verification

- Figma reference screenshot: `artifacts/figma-content-2026-10-21/trust-figma.png`
- Local desktop screenshot: `artifacts/figma-content-2026-10-22/jci-regression/trust-final-local.png`
- Local mobile: deferred by user
- Verification run: 2026-10-22，`scripts/trust-article-revision-qa.cjs`，签证阅读全文入口接入后重新执行开发与生产preview回归
- Verification scope: 原生弹窗896×450全区域，包括全部文字与关闭控件；源底页是设计截图，实际产品底页不以截图伪造，因此不把二者背景差异算入弹窗指标。全视窗另外留证，验证遮罩、位置和真实底页。
- 主像素门槛：pixelmatch threshold0.15、includeAA=false，差异0.0859995%；nMAE＝0.3592044%，均<1%。额外RGB>16诊断1.5181052%，单独保留，不与主门槛混用。
- 1024/1440/1920桌面宽度、短屏、键盘焦点、背景滚动锁定、关闭恢复、无伪路由/无截图UI、进入动画与reduced-motion均通过。
- Production preview: 127.0.0.1:5186已复测通过，截图指标和三种宽度交互与开发环境一致；新证据位于`artifacts/figma-content-2026-10-22/jci-regression/production/`。
- 类型检查、直接生产构建通过。全站prebuild门禁仍有其他页面证据过期/文件失效，不能由本弹窗通过代替；未修改或绕过这些检查。
- Source content note: 137家、0.5%、1.2%等为设计原文，本轮不以UI还原冒充独立事实核验；后续文章批次需内容来源复核。
- Remaining differences: none
