# 工具包 · 签证申请清单

- Route: `/steps/toolkit-detail?article=visa`
- Figma frame: `03信任与常见问题-05来华就医全流程工具包-03`，正文结合已核验PC工具包模板
- Node ID: `1604:540`；正文`1604:552`；PC模板`143:3058`
- Source baseline HTML: `docs/figma-source/toolkit-revision/visa/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/toolkit-revision/visa/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/toolkit-revision/visa/assets-2026-10-22.json`
- Desktop frame: PC模板1440px，Auto Layout高度按真实全文计算
- Mobile frame: deferred by user; existing mobile UI unchanged
- Status: verified (desktop only; mobile deferred by user)

## Layer Mapping

已在Figma左侧递归展开并读取文章子树15节点，逐个选中复制右侧Dev Mode CSS/SVG；原生`.fig`核对15/15父子、同级顺序和名称一致。完整映射和参数位于`docs/figma-source/toolkit-revision/visa/`，正文为真实TEXT内容，不用图层旧名称充当正文。正文图层沿用保险相关旧层名，但其实际全文为签证申请指引，实施以真实TEXT为准。

| Figma node | PC owner | 参数与内容 |
| --- | --- | --- |
| `1604:552` | `143:3062` | 文章区域；PC906px、padding32、radius24 |
| `1604:553` | `143:3065` | 返回控件，去`/trust` |
| `1604:554`、`1604:555`、`1604:556` | `143:3066` | 对应完整精确返回SVG |
| `1604:557` | `143:3069` | 返回原文 |
| `1604:558` | `143:3070` | 分类外层 |
| `1604:559` | `143:3071` | PC标签背景、圆角、间距 |
| `1604:560`、`1604:561` | `143:3072` | 原文“02 出行中 · 落地办理工具” |
| `1604:562`、`1604:563` | `143:3073`、`143:3074` | PC40/60、600；真实标题 |
| `1604:564`、`1604:565`、`1604:566` | `143:3075`、`143:3076`、`143:3077` | 真实完整正文；PC16/24、章节24/36、段距12 |

先将源内容和独立PC模板组合为静态HTML/CSS与源锁，再接Vue。源稿375px正文导出保真和桌面模板组合保真分开记录，不把组合HTML当独立Figma桌面稿。无新增API、报告行为、签证办理业务，源稿没有按钮则不添加按钮；`/visa`仍沿用暂无设计页不导航规则。

静态核验：源导出750×2831，pixelmatch0.5044625%、nMAE0.7617772%；PC组合与Vue静态pixelmatch0%，15个owner全存在，宽1440px、高2597px，无坏图和横向溢出。静态证据通过后再接目录与行为。

## Assets

| 资源 | Figma node | 项目路径 / 用途 |
| --- | --- | --- |
| 本篇返回箭头 | `1604:554` | `public/images/figma/toolkit-revision/visa/node-1604-554.svg`，精确Dev SVG，源QA |
| PC返回、咨询、语言 | `143:3066`、`143:3129`、`143:3155` | 已锁定PC模板同源SVG |
| PC联系图标 | `143:3208`、`143:3214`、`143:3219` | 已锁定PC模板同源SVG；正文无图片 |

## Prototype And Motion

目录签证项`143:3091`进入本篇；返回`/trust`。沿用PC自然滚动目录固定24px/底部释放、620ms轻量进入与220ms链接反馈；只接内容阅读与既有咨询入口，不虚构签证处理后端。reduced-motion关闭过渡。移动端UI按用户决定暂缓。

### 既有卡片入口接入记录

- `/trust` 的 `.toolkit-section--stage-1 .tool-grid article` 中“签证申请清单”既有阅读全文，映射对应桌面出行中卡片`204:5836`及操作`204:5845–5850`。
- `/steps` 的 `#travel .toolkit-stage__card--visa` 及既有阅读全文同样使用上述已记录节点。只把禁用文案替换为同样式 RouterLink，目的地为本篇；不改变卡片尺寸、样式、图标和文案。
- 两处只在宽度大于900px时启用；未定稿移动端维持原有禁用状态。未接正文的工具项继续不导航；“可行性评估”原卡片没有阅读全文，不增造按钮。
- 补充测试 `scripts/toolkit-entry-qa.cjs`：修改前后卡片几何/截图不变、桌面鼠标与键盘进入正确文章、历史返回与未接入口、移动端保持原状。

## Verification

- Figma reference screenshot: `artifacts/figma-toolkit-2026-10-22/visa/source-figma.png`
- Local desktop screenshot: `artifacts/figma-toolkit-2026-10-22/visa/desktop-final.png`
- Local mobile: deferred by user
- Verification run: 2026-10-22，逐节点源锁、静态后完整交互/动效及开发/生产preview复测；`scripts/toolkit-article-qa.cjs visa`和`toolkit-entry-qa.cjs`。
- 原始Figma内容导出750×2831：pixelmatch0.5044625%、nMAE0.7617772%；额外原始RGB>16诊断4.6920994%，与主指标分开保留，不宣称所有诊断值<1%。仅归一化小数帧高导致的1原生像素底边，不缩放或位移正文。
- 桌面组合基线与Vue：1440×2597px，pixelmatch0%、nMAE<0.00002%；源15项均有具体owner，全文一致，无坏图、横向溢出；已亲自检查首屏、后半正文、页脚及并排截图。源稿保真与PC模板组合指标分开记录，不称存在独立Figma桌面文章稿。
- 1024×600、1440×900、1920×1080：全文、目录固定24px/真实底界释放/回滚恢复、当前文章标记、键盘返回、目录进入、历史前后退、联系链接、咨询开关、未接入口不误跳均通过。
- `/trust`、`/steps`原有签证阅读全文：1024/1440/1920桌面鼠标与键盘进入、历史返回通过；启用前后卡片几何和截图差异0%，未新增设计外按钮。390px与900px仅核验原禁用状态未改变，不作为移动UI开发/验收。
- 620ms轻量进入实际插值、静止布局恢复、reduced-motion通过。Octagos长文实操滚动和目录点击，只沿用医疗内容适用的自然滚动/轻量过渡，不改Figma布局。
- 开发和生产preview重复同套核验通过，源/模板锁及本篇专项门禁通过；类型检查、直接生产构建通过。全站旧证据问题仍留既定回归批次，不以本篇通过代替全站结论。未提交、推送或发布；未改后端或医疗报告行为。
- Remaining differences: none
