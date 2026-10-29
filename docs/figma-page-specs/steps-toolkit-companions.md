# 工具包 · 家属陪同攻略

- Route: `/steps/toolkit-detail?article=companions`
- Figma frame: `03信任与常见问题-05来华就医全流程工具包-05`
- Node ID: `1604:405`；真实文章 `1604:417`；已核验 PC 模板 `143:3058`
- Source baseline HTML: `docs/figma-source/toolkit-revision/companions/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/toolkit-revision/companions/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/toolkit-revision/companions/assets-2026-10-22.json`
- Desktop frame: PC 模板 1440px，Auto Layout 高度由真实全文排版计算
- Mobile frame: deferred by user; existing mobile UI unchanged
- Status: verified (desktop only; mobile deferred by user)

## Layer Mapping

实施前已完整展开 Live Figma Layers，逐个选中全部 15 节点复制 Dev CSS/SVG，原生 `.fig` 对名称、父子、同级顺序和可见性逐项交叉核验 15/15 一致。完整参数、CSS、映射位于本篇独立源目录；正文旧图层名虽然是保险文字，但以其实际 TEXT 为准。

| Figma node | PC owner | 参数 / 内容 |
| --- | --- | --- |
| `1604:417` | `143:3062` | 375×1919.1171875 源文章；PC906px、padding32、radius24 |
| `1604:418` | `143:3065` | 返回链接；源高27.1171875、gap8 |
| `1604:419`、`1604:420`、`1604:421` | `143:3066` | 12px 返回 SVG 及完整子路径 |
| `1604:422` | `143:3069` | 返回信任与常见问题；源12/12、400、#5C6584 |
| `1604:423` | `143:3070` | 分类外层，源 padding-top24 |
| `1604:424` | `143:3071` | 分类背景，源 padding8/12、radius9999、蓝10% |
| `1604:425`、`1604:426` | `143:3072` | 原始标签“01 出行前 · 决策评估工具”；源10/10、500；不按卡片所在阶段猜改源标签 |
| `1604:427`、`1604:428` | `143:3073`、`143:3074` | 家属陪同攻略；源20/20、600；PC40/60、600 |
| `1604:429`、`1604:430`、`1604:431` | `143:3075`、`143:3076`、`143:3077` | 真实完整正文；源12/18、章节14/22及局部500/600；PC16/24、章节24/36、段距12 |

真实原文与独立已核验 PC 模板组合，原始375px稿和PC组合分别截图核验，不能将组合图宣称为独立Figma PC文章稿。仅在派生PC文本修正明显重复字“全程全程陪同”为“全程陪同”，原生Figma记录不改；源正文少量缺词不擅自补写签证、医院陪护与服务承诺。无新增API、预约业务或医疗报告行为。

## Assets

| 资源 | Figma node | 项目路径 / 用途 |
| --- | --- | --- |
| 本篇返回箭头 | `1604:419` | `public/images/figma/toolkit-revision/companions/node-1604-419.svg`，精确 Dev SVG，仅源保真 QA |
| PC 返回、咨询、语言 | `143:3066`、`143:3129`、`143:3155` | 已锁定 PC 模板同源 SVG |
| PC 联系图标 | `143:3208`、`143:3214`、`143:3219` | 已锁定 PC 模板同源 SVG；正文无照片或大图 |

## Prototype And Motion

PC 目录 `143:3103` 接入本篇；返回 `/trust`。原有家属卡片没有阅读全文，不新增设计外按钮。复用已实际检查 Octagos 长文自然滚动后的目录固定24px/底部释放、620ms进入与220ms链接反馈；静态比对通过后再验证动效，不改变休止布局。reduced-motion关闭过渡，移动端按用户要求暂缓。

## Verification

- Figma reference screenshot: `artifacts/figma-toolkit-2026-10-22/companions/source-figma.png`
- Local desktop screenshot: `artifacts/figma-toolkit-2026-10-22/companions/desktop-final.png`
- Local mobile: deferred by user
- Verification run: 2026-10-22，源提取/锁定及静态比对通过后接目录和复用动效，开发及生产 preview 均重新执行全套核验。
- Figma 原稿导出750×3839：pixelmatch0.6303378%、nMAE0.9042610%；原始RGB>16诊断5.6739776%，与主指标分开保留，不宣称所有诊断<1%。仅归一化小数帧高造成的1原生像素底边，不缩放或位移内容。
- PC组合与Vue：1440×3269px，pixelmatch0%、nMAE<0.000001%；15/15具体owner存在，正文和经记录的明显重复字修正一致，无坏图或横向溢出。已亲自查看源稿三段并排、整页、实际浏览器首屏和正文中段/目录固定状态。
- 1024×600、1440×900、1920×1080：全文、目录进入/当前页、返回和历史前后退、咨询/联系、未接入口不导航、目录24px固定/底界释放/回滚恢复全部通过。
- 620ms进入真实插值与静止恢复、reduced-motion通过。<=900px只验证新桌面入口安全降级至/trust，不开发或验收未定稿移动UI。
- 类型检查、直接生产构建、diff检查及源锁门禁通过。原有卡片不增造阅读全文，未改后端/管理端/报告生成，未提交、推送或发布。原稿缺词保留，后续由业务确认，不擅自编写签证与陪护政策。
- Remaining differences: none
