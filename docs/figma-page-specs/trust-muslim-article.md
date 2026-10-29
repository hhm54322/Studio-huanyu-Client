# 信任长文 · 穆斯林患者就医保障

- Route: `/trust` → 穆斯林患者就医保障 → 阅读全文，原地弹窗
- Figma frame: `03信任与常见问题-04信任深度长文-08`，`1595:3561`
- Node ID: 逐篇内容 `1595:3561`；桌面通用弹窗模板 `143:4206`
- Source baseline HTML: `docs/figma-source/trust-safety-revision/muslim/baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/trust-safety-revision/muslim/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/trust-safety-revision/muslim/assets-2026-10-22.json`
- Desktop composition: `docs/figma-source/trust-safety-revision/muslim/desktop-baseline-2026-10-22.html`
- Source extraction run: 2026-10-22；官方 `.fig` SHA256 `8e274b299ca9208685e984e7cdb8b87ae5487c66e2c5103350e1118afc73a56d`；实时 Layers 完整展开14节点，每节点选中并等待250ms后读取右栏Dev CSS/SVG；与原生导出逐一核对名称、父子、同级顺序和可见性。
- Desktop frame: 通用模板1440×754；面板width896、原生fit-content网格，真实全文决定高度。
- Mobile frame: 375×812；仅核验源内容提取保真，移动网站依用户要求暂缓，不新增移动入口。
- Status: verified

## Layer Mapping

`native-parameters`、`ui-layers`、`dev-mode`保存全部逐节点参数与每次选中URL；`desktop-variant.contentMapping`记录具体桌面owner。下表在Vue接入之前建立，不用通用child占位映射。

| Figma Node ID | 名称/类型 | Parent Node ID | Vue组件/DOM owner | 来源/处理 |
| --- | --- | --- | --- | --- |
| `1595:3561` | 08/Frame | 无 | TrustArticleDialog `143:4206` dialog | 底页参考截图不入产品 |
| `1595:3562` | Container/Frame | `1595:3561` | TrustArticleDialog `143:4208` 遮罩 | PC原始50%黑/blur4 |
| `1595:3563` | Frame 631 | `1595:3562` | HomeSourceNode `143:4209` | PC面板网格 |
| `1595:3564` | Button | `1595:3563` | HomeSourceNode `143:4210` button | 关闭操作 |
| `1595:3565` | Icon | `1595:3564` | HomeSourceNode `143:4211` SVG | PC精确SVG |
| `1595:3566` | Vector | `1595:3565` | `143:4211` 原始路径owner | 不绘制替代图标 |
| `1595:3567` | Container | `1595:3563` | HomeSourceNode `143:4218` | 正文容器 |
| `1595:3568` | Text | `1595:3567` | HomeSourceNode `143:4219` | 九段完整正文 |
| `1595:3569` | Container | `1595:3563` | HomeSourceNode `143:4213` | 标题组 |
| `1595:3570` | Heading 2 | `1595:3569` | HomeSourceNode `143:4214` | 标题容器 |
| `1595:3571` | 穆斯林患者就医保障/Text | `1595:3570` | HomeSourceNode `143:4215` | 原题完整保留 |
| `1595:3572` | Paragraph | `1595:3569` | HomeSourceNode `143:4216` | 副标题容器 |
| `1595:3573` | 清真饮食…/Text | `1595:3572` | HomeSourceNode `143:4217` | 原文完整保留 |
| `1595:3574` | dragger/Rectangle | `1595:3561` | 不渲染 | 设备横条不是网站内容 |

## Sections / Typography / Components And Spacing

| 项目 | 原始内容源Dev参数 | 桌面模板Dev参数 |
| --- | --- | --- |
| 面板 | 343×656，padding16，radius20，白底，fit-content grid | width896，padding32，inner832，radius24，fit-content grid |
| 标题 | PingFang SC16/16，600，字距.396，#1E3A5F | PingFang SC32/32，600，字距.396，#1E3A5F |
| 副标题 | 11/16，400，#6B7280，padding-top8 | 14/22，400，#6B7280，padding-top8 |
| 正文 | 311×568，12/18，400，#4B5563，两端对齐 | width832，16/24，400，#1E3A5F，两端对齐，段距12 |
| 正文容器 | 311×584，padding-top16 | padding-top24 |
| 关闭 | 36×36，right8/top8，SVG20 | 36×36，right16/top16，SVG20 |
| 遮罩 | 375×730，top82，padding16/0，50%黑、blur4 | 50%黑、blur4，上下40安全区 |

本篇只有375px内容源，桌面采用已逐节点提取的PC通用模板。原稿保真与桌面组合分别截图，不将内容派生组合称为独立Figma PC文章帧。所有服务描述保持设计原文，本次UI接入不新增医疗服务承诺或修改业务流程。

## Assets

| 资源 | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| 内容源关闭图标 | `1595:3565`，含`1595:3566` | 精确Dev SVG20×20 | `public/images/figma/trust-safety-revision/muslim/node-1595-3565.svg` |
| 桌面关闭图标 | `143:4211`，含`143:4212` | 精确Dev SVG20×20 | `public/images/figma/trust-content-revision/node-143-4211.svg` |

底页截图只保存在ignored artifacts供核验，产品不加载该截图。

## Prototype And Motion

沿用已核验的信任弹窗行为：阅读全文原地打开；关闭/Esc/遮罩关闭；锁滚、Tab焦点循环、恢复触发焦点和原滚动位置。静态验收后复测Octagos长文滚动与导航轻反馈，保留适合阅读弹窗的轻入场：320ms cubic-bezier(.22,1,.36,1)，y16→0；退出200ms ease/y0→8；遮罩250ms；reduced-motion无动画。移动端不新增入口，跨900断点清理桌面弹窗。

## Verification

- Figma reference screenshot: `artifacts/figma-content-2026-10-22/safety/muslim-figma.png`
- Local desktop screenshot: `artifacts/figma-content-2026-10-22/safety/muslim/muslim-final-local.png`；生产为同目录`muslim-production-local.png`。
- Local mobile: deferred by user
- Verification run: 2026-10-22（运行日志保留真实UTC时间）。已亲自查看Figma原稿、提取稿、PC静态并排及最终截图。原始源提取pixelmatch0.0112589% / nMAE0.3687195%；PC模板接入pixelmatch0.0850866% / nMAE0.0629299%；原始RGB>16诊断0.0961368%。主指标沿用threshold0.15、includeAA=false，不把PC组合基线称为独立Figma稿。
- 开发和生产preview的1024/1440/1920、九段全文、关闭/Esc/遮罩、Tab锁焦、背景锁滚、焦点及原滚动恢复、短屏上下40px、进入/退出真实插值、reduced-motion及900断点清理通过；专项源锁/映射/证据新鲜度门禁通过。参数映射14/14，缺失owner和坏图均为0。
- 报告：`safety/muslim/{source,static,final,production}-qa.json`。本轮未提交、推送或部署，不改后端/管理端/报告生成。
- Remaining differences: none
