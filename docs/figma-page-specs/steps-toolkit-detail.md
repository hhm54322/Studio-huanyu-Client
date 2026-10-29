# 08 来华就医全流程工具包详情 · 桌面改版

- Route: `/steps/toolkit-detail`
- Figma frame: `08来华就医全流程工具包详情模版`
- Node ID: `143:3058`
- Source baseline HTML: `docs/figma-source/content-revision/toolkit/baseline-2026-10-21.html`
- Source baseline CSS: `docs/figma-source/content-revision/toolkit/dev-styles-2026-10-21.css`
- Source asset manifest: `docs/figma-source/content-revision/assets-2026-10-21.json`
- Source extraction run: 2026-10-21，Figma官方原生文件、完整Layers与逐节点Dev Mode CSS交叉核对
- Source SHA256: `29d97343e7e947187db27918706dc9b16c2f7886e08cf2dba453ed1a83bfb1bc`
- Desktop frame: 1440 × 2909.1171875；main高2453.1171875、footer高456、header高64
- Mobile frame: deferred by user; design not finalized, existing mobile implementation frozen
- Status: verified (desktop only; mobile deferred by user)

## Layer Mapping

本帧183个原生节点全部完成父子关系、兄弟顺序、可见性、参数与独立DOM/SVG owner映射。完整记录在 `docs/figma-source/content-revision/toolkit/`：

- `native-inventory-2026-10-21.json`：183个源节点及精确树结构。
- `ui-layers-2026-10-21.json`：左侧Layers递归展开后的完整顺序。
- `native-parameters-2026-10-21.json`、`dev-mode-2026-10-21.json`：每节点原生属性与右侧CSS。
- `node-to-code-2026-10-21.json`：183项具体组件、selector及SVG owner；不以父节点概述代替后代映射。
- `layers-crosscheck-2026-10-21.json`：原生树与Layers无缺失、无层级或顺序差异。
- `source-tree-2026-10-21.json`：供Vue使用的静态源树。
- `../baseline-lock-2026-10-21.json`：上述文件的内容哈希；修订过程见 `../revision-history-2026-10-21.md`。

渲染链：`ToolkitDetailView.vue → ContentArticleCanvas.vue → HospitalFigmaCanvas.vue → HomeSourceNode.vue`。正文为可选中文本DOM，不使用整帧图片替代页面。

| Figma Node ID | Parent Node ID | Vue/DOM owner | 已复制参数/行为 |
| --- | --- | --- | --- |
| `143:3058` | 源帧根 | `[data-figma-node="143:3058"]` | 1440×2909.1171875 |
| `143:3060` | `143:3059` | 同ID DOM | #F5F6F8，顶部/底部112px |
| `143:3061` | `143:3060` | 同ID DOM | x112/y112，1216×2229.1171875，24px列间距 |
| `143:3062` | `143:3061` | 同ID article role | 906×2229.1171875，padding32，radius24 |
| `143:3065` | `143:3064` | 同ID RouterLink | 返回信任与常见问题，`/trust` |
| `143:3071` | `143:3064` | 同ID DOM | 191×34，radius6，padding16 |
| `143:3074` | `143:3073` | 同ID heading role | 357×60，40/60px，600 |
| `143:3077` | `143:3076` | 同ID TEXT DOM | 842×644，保留源混合样式与段落 |
| `143:3078` | `143:3075` | 同ID DOM | x144/y1021.1171875，842×260，gap24 |
| `143:3079` | `143:3078` | 同ID image fill | 409×260，radius24，精确单节点导出crop |
| `143:3080` | `143:3078` | 同ID image fill | 409×260，radius16，精确单节点导出crop |
| `143:3081` | `143:3075` | 同ID TEXT DOM | 842×1004，源段落和混合字重 |
| `143:3082` | `143:3061` | 同ID navigation role | 286×465，padding24、radius24；边界内固定 |
| `143:3087` | `143:3086` | 同ID RouterLink | 来华就医可行性评估 → `/steps/toolkit-detail?article=assessment`；按已接入的真实工具包内容跳转 |
| `143:3091` | `143:3086` | 同ID RouterLink | 签证申请清单 → `/steps/toolkit-detail?article=visa`；使用对应真实全文，不再禁用 |
| `143:3095`,`143:3099`,`143:3103`,`143:3107`,`143:3111`,`143:3115` | `143:3086` | 各自同ID DOM | 各为独立文章入口，当前无已验收目的文章，不跳转、不伪造本篇锚点 |
| `143:3119` | `143:3060` | 同ID header DOM | 1440×64；不叠加共享header |
| `143:3163` | `143:3058` | 同ID footer DOM | y2453.1171875，1440×456；不叠加共享footer |

以上是重点摘要，183项精确映射以同目录JSON为完整机器可检查记录。

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |
| Main | `143:3059` | 1440 | 2453.1171875 | #F5F6F8 | 源header覆盖顶部 |
| Article | `143:3062` | 906 | 2229.1171875 | padding32 | x112/y112 |
| Index | `143:3082` | 286 | 465 | padding24 | x1042/y112 |
| Footer | `143:3163` | 1440 | 456 | 完整源footer树 | y2453.1171875 |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| 标题 | `143:3074` | PingFang SC | 40/60px | 600 | #1E3A5F |
| 正文 | `143:3077`,`143:3081` | PingFang SC | 16/24px，段间12px | 400，局部600 | #4B5563，局部#1E3A5F |
| 内嵌节标题 | 同上源text runs | PingFang SC | 24/36px | 600 | #1E3A5F |
| 目录标题 | `143:3085` | PingFang SC | 18/18px | 600 | #1E3A5F |
| 目录条目 | 各项TEXT节点 | PingFang SC | 14/14px | 400 | #6B7280 |

全部混合样式和原生段落/行参数保存于源参数记录，不从截图猜行距。

按规范修正源中两处明显笔误：`为**规整`去掉误留的Markdown星号，`全球患者可安心四、`补为`全球患者可安心。四、`。只在派生DOM文字中修正，不改源锁、层级、尺寸或样式，不新增医疗承诺。

## Components And Spacing

双栏1216px＝906＋24＋286；文章内部842px＝906−64。两图409＋24＋409。图片上、下各24px。目录非本篇章节，不再使用历史版本不存在的伪锚点。1024px桌面按源整体比例适配，1920px桌面居中且不放大1440px基线。移动端不纳入本批次。

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| 病历整理示例 | `143:3079` | 单节点2x PNG → 818×520 WebP quality90，保留源crop/radius24 | `public/images/figma/content-revision/example-1.webp` |
| 评估报告示例 | `143:3080` | 单节点2x PNG → 818×520 WebP quality90，保留源crop/radius16 | `public/images/figma/content-revision/example-2.webp` |
| 返回图标 | `143:3066` | 精确Dev Mode SVG | `public/images/figma/content-revision/node-143-3066.svg` |
| 页头咨询/语言图标 | `143:3129`,`143:3155` | 各自精确Dev Mode SVG | `public/images/figma/content-revision/node-143-3129.svg`、`node-143-3155.svg` |
| 联系图标 | `143:3208`,`143:3214`,`143:3219` | 各自精确Dev Mode SVG | `public/images/figma/content-revision/node-143-3208.svg`、`node-143-3214.svg`、`node-143-3219.svg` |

共8项，不引入无关图片或替代图标。完整文件哈希与下载来源见资源清单。

## Prototype And Motion

| Interaction | Reference | Trigger | Timing/Easing | Fallback |
| --- | --- | --- | --- | --- |
| 返回/现有导航 | Figma源入口＋既有路由 | 点击、键盘Enter | Vue Router | 同业务路由 |
| 咨询 | 源“问阿宁” | 点击 | 打开既有正式咨询表单 | 无新API、未创建测试病例 |
| 目录固定 | 复看Octagos长文目录与自然滚动后适配 | 页面滚动 | rAF更新；视窗顶24px，文章双栏底部释放 | reduced-motion仍完整可用 |
| 文章进入 | Octagos长文的轻量内容揭示 | 进入路由 | 620ms cubic-bezier(.22,1,.36,1)，opacity0→1、y12→0 | reduced-motion关闭 |
| 链接反馈 | Octagos实际hover/导航观察 | hover/focus | 220ms亮度/颜色，不改变布局 | reduced-motion关闭过渡 |
| 暂无目的页入口 | 用户既定规则 | 点击 | 无href、aria-disabled，不生成假页面 | 一致 |
| 多语言 | 用户暂缓 | 无切换 | 保留中文、禁用入口 | 一致 |

本轮实际访问Octagos首页、Resources、Learning Center和长文，执行滚动、hover与目录点击；只采用动效语汇，不改Figma静态布局。本文源中的医疗承诺、统计和隐私合规措辞为设计文案，不代表完成外部事实或认证核验；内容全批次仍需逐篇核实，不伪造证明。

## Verification

- Figma reference screenshot: `artifacts/figma-content-2026-10-21/toolkit-figma.png`
- Local desktop screenshot: `artifacts/figma-content-2026-10-21/toolkit-final-local.png`
- Local mobile: deferred by user; existing implementation not re-accepted in this desktop batch
- Verification run: 2026-10-22，`scripts/content-article-revision-qa.cjs`、`scripts/content-article-behavior-qa.cjs`；两篇新文章和签证入口接入后刷新开发/生产完整回归
- 原生DPR2：参考2880×5819；Chromium2880×5818。只补齐Figma小数帧高取整造成的≤1原生像素白色底边，不缩放或重定位内容。
- 主像素门槛：项目既有pixelmatch threshold0.15、includeAA=false；最终差异0.2290091%。nMAE＝0.3812585%，均<1%；包含上述两处授权范围内的笔误修正。
- 额外诊断：RGB任一通道差>16的像素占比为1.8469847%；此项包含字形栅格化/抗锯齿差异及笔误修正，不与pixelmatch口径混用，也不宣称全部指标<1%。
- 已亲自检查原生截图及分区并排图；183项DOM/SVG owner全部存在，帧高一致，无坏图、横向溢出或浏览器异常。
- 1024×600、1440×900、1920×900：返回键盘操作、目录固定/底部释放/回滚恢复、未接文章不误跳、联系链接、咨询打开关闭通过。
- 0/200/620ms进入插值、静止几何恢复和reduced-motion通过。
- Production preview: 同套截图/交互在127.0.0.1:5186复测通过，pixelmatch0.2290091%、nMAE0.3812585%、RGB>16占比1.8469847%。本次开发/生产指标一致、直接pixelmatch为0；原始指标保留在JSON，不隐去或改写。证据位于同目录production/。
- 类型检查、直接生产构建、专项源/证据门禁和diff检查通过。全站门禁的其他页历史证据问题单独保留，未借本页通过覆盖全站结论。
- Remaining differences: none
