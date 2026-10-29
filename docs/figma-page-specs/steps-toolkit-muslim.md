# 工具包 · 穆斯林患者实操手册

- Route: `/steps/toolkit-detail?article=muslim`
- Figma frame: `03信任与常见问题-05来华就医全流程工具包-06`
- Node ID: `1604:675`；正文 `1604:687`；PC 模板 `143:3058`
- Source baseline HTML: `docs/figma-source/toolkit-revision/muslim/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/toolkit-revision/muslim/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/toolkit-revision/muslim/assets-2026-10-22.json`
- Desktop frame: PC 模板1440px，正文Auto Layout
- Mobile frame: deferred by user; existing mobile UI unchanged
- Status: verified (desktop only; mobile deferred by user)

## Layer Mapping

先完整展开实时 Figma Layers，逐节点选中并复制右侧 Dev CSS/SVG，再用官方 `.fig` 核对15/15节点的父子、同级顺序及名称。完整参数、CSS、节点映射与源锁位于本篇独立源目录。正文旧层名虽是保险文字，实际TEXT为本手册，不按旧层名猜写内容。

| Figma node | PC owner | 参数 / 内容 |
| --- | --- | --- |
| `1604:687` | `143:3062` | 源375×2083.1171875；PC906px、padding32、radius24 |
| `1604:688` | `143:3065` | 返回链接；源高27.1171875、gap8 |
| `1604:689`、`1604:690`、`1604:691` | `143:3066` | 12px返回SVG及两个真实子路径 |
| `1604:692` | `143:3069` | 返回原文；源12/12、400、#5C6584 |
| `1604:693` | `143:3070` | 分类外层；源padding-top24 |
| `1604:694` | `143:3071` | 分类标签；源padding8/12、radius9999、蓝10% |
| `1604:695`、`1604:696` | `143:3072` | 原文“02 出行中 · 落地办理工具”；源10/10、600、字距-0.15 |
| `1604:697`、`1604:698` | `143:3073`、`143:3074` | 标题；源20/20、600；PC40/60、600 |
| `1604:699`、`1604:700`、`1604:701` | `143:3075`、`143:3076`、`143:3077` | 真实完整正文；源12/18、章节14/22、局部600；PC16/24、章节24/36、段距12 |

先锁定真实内容与独立已核验PC模板组合的静态HTML/CSS，再接入Vue；源375px文章和PC组合分开统计，不称存在独立Figma PC文章稿。静态源比对0.5885289%、PC组合0%通过之后才启用目录及复用动效。源文案“无强制、无打扰、无”缺词照实保留，不擅自补写服务或医疗承诺。

## Sections And Typography

正文源375×2083.1171875px，完整7节；PC页面1440×3365.1171875px，文章宽906px、正文宽842px。使用PC模板返回14/22、标题40/60（600）、正文16/24和章节24/36（600），文章padding32px、段距12px、radius24px。

分类标签按照实时Dev Mode`143:3071`的Hug宽度及左右16px、上下10px重新生成，PC分类文字14/14（500）、字距-0.15px。本篇文本161.546875px，胶囊193.546875×34px；不沿用不同文章的固定宽度。源稿375px样式不因此改变，最终开发/生产均验证文字左右16px且无裁切。

## Assets

| 资源 | Figma node | 项目路径 / 用途 |
| --- | --- | --- |
| 本篇返回箭头 | `1604:689` | `public/images/figma/toolkit-revision/muslim/node-1604-689.svg`，精确Dev SVG，仅源保真QA |
| PC返回、咨询、语言 | `143:3066`、`143:3129`、`143:3155` | 已锁定PC模板同源SVG |
| PC联系图标 | `143:3208`、`143:3214`、`143:3219` | 已锁定PC模板同源SVG；正文无照片或大图 |

## Prototype And Motion

PC目录`143:3107`进入本篇；返回`/trust`。原有卡片没有阅读全文，不增造设计外按钮。实际检查Octagos长文两次滚动、回滚及目录点击，只复用自然阅读、620ms轻量进入和220ms链接反馈；目录固定24px并在真实底界释放，静止布局不变。reduced-motion关闭过渡。移动端按用户要求冻结。

## Verification

- Figma reference screenshot: `artifacts/figma-toolkit-2026-10-22/muslim/source-figma.png`
- Local desktop screenshot: `artifacts/figma-toolkit-2026-10-22/muslim/desktop-final.png`
- Local mobile: deferred by user
- Verification run: 2026-10-22批次，最终证据UTC 2026-10-23；源锁和静态通过后接目录/交互/动效，分类Hug修正后开发及生产preview重新截图实测。
- 源稿750×4167：pixelmatch0.5885289%、nMAE0.8336845%；原始RGB>16诊断5.4328134%，与主指标分开保留，不宣称所有诊断<1%。仅归一化小数帧高产生的1原生像素底边，不缩放或位移内容。
- PC组合与Vue：1440×3365px，pixelmatch0%、nMAE<0.00002%；15/15具体owner存在，全文一致，无坏图、横向溢出；亲自查看源稿三段并排、桌面全页及正文排版。
- 1024×600、1440×900、1920×1080：全文、当前目录、键盘进入/返回、历史前后退、咨询/联系、未接入口不导航、目录固定24px/底界释放/回滚恢复均通过。
- 620ms进入真实插值、静止恢复及reduced-motion通过；<=900px只验证新桌面入口安全降级，不开发或验收未定稿移动UI。
- 类型检查、直接Vite生产构建及本篇源/证据门禁通过。未改后端/管理端/报告生成，未提交、推送或发布。本篇通过不代表全站旧证据回归通过。
- Remaining differences: none
