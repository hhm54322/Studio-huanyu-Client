# 信任长文 · 数据隐私合规

- Route: `/trust` → 数据隐私合规 → 阅读全文，原地弹窗
- Figma frame: `03信任与常见问题-04信任深度长文-07`，`1595:3533`
- Node ID: 内容 `1595:3533`；桌面通用模板 `143:4206`
- Source baseline HTML: `docs/figma-source/trust-safety-revision/privacy/baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/trust-safety-revision/privacy/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/trust-safety-revision/privacy/assets-2026-10-22.json`
- Desktop composition: `docs/figma-source/trust-safety-revision/privacy/desktop-baseline-2026-10-22.html`
- Source extraction run: 2026-10-22；官方`.fig` SHA256 `8e274b299ca9208685e984e7cdb8b87ae5487c66e2c5103350e1118afc73a56d`；14节点完整展开Layers及逐节点右栏Dev CSS，父子顺序/可见性/参数与原生文件交叉核对
- Desktop frame: 模板1440×754；面板width896，高度随真实全文和原生fit-content网格自然确定
- Mobile frame: 375×812；只取逐篇原文并验证提取保真，不开发或验收暂停中的移动网站
- Status: verified

## Layer Mapping

原生参数、图层树、每一项Dev CSS、资源和具体桌面owner分别保存在该篇独立目录的`native-parameters`、`native-inventory`、`ui-layers`、`dev-mode`、`assets`和`desktop-variant.contentMapping`。先建立独立源锁及完整映射，再改Vue，不覆盖既有文章源锁。

| Figma Node ID | 名称/类型 | Parent Node ID | Vue组件/DOM owner | 来源/处理 |
| --- | --- | --- | --- | --- |
| `1595:3533` | 07/Frame | 无 | TrustArticleDialog `143:4206` dialog | 参考底页截图不入产品 |
| `1595:3534` | Container/Frame | `1595:3533` | TrustArticleDialog `143:4208` 遮罩 | PC原始50%黑/blur4 |
| `1595:3535` | Frame 631 | `1595:3534` | HomeSourceNode `143:4209` | PC面板网格 |
| `1595:3536` | Button | `1595:3535` | HomeSourceNode `143:4210` button | 关闭操作 |
| `1595:3537` | Icon | `1595:3536` | HomeSourceNode `143:4211` SVG | PC精确SVG |
| `1595:3538` | Vector | `1595:3537` | `143:4211` 原始路径owner | 不绘制替代形状 |
| `1595:3539` | Container | `1595:3535` | HomeSourceNode `143:4218` | 正文容器 |
| `1595:3540` | Text | `1595:3539` | HomeSourceNode `143:4219` | 八段全文，含四项保护条目 |
| `1595:3541` | Container | `1595:3535` | HomeSourceNode `143:4213` | 标题组 |
| `1595:3542` | Heading 2 | `1595:3541` | HomeSourceNode `143:4214` | 标题容器 |
| `1595:3543` | 数据隐私合规/Text | `1595:3542` | HomeSourceNode `143:4215` | 完整原题 |
| `1595:3544` | Paragraph | `1595:3541` | HomeSourceNode `143:4216` | 副标题容器 |
| `1595:3545` | GDPR/HIPAA双合规/Text | `1595:3544` | HomeSourceNode `143:4217` | 完整原文 |
| `1595:3546` | dragger/Rectangle | `1595:3533` | 不渲染 | 非网页设备横条 |

## Sections / Typography / Components And Spacing

| 项目 | 原始内容源Dev参数 | 桌面模板Dev参数 |
| --- | --- | --- |
| 面板 | 343×432，padding16，radius20，白底，fit-content grid | width896，padding32，inner832，radius24，fit-content grid |
| 标题 | PingFang SC16/16，600，字距.396，#1E3A5F | PingFang SC32/32，600，字距.396，#1E3A5F |
| 副标题 | 11/16，400，#6B7280，顶部padding8 | 14/22，400，#6B7280，顶部padding8 |
| 正文 | 311×344，12/18，400，#4B5563，两端对齐 | width832，16/24，400，#1E3A5F，两端对齐，段距12 |
| 正文容器 | 311×360，padding-top16 | padding-top24 |
| 关闭 | 36×36，right8/top8，SVG20 | 36×36，right16/top16，SVG20 |
| 遮罩 | 50%黑、blur4 | 50%黑、blur4，上下40安全区 |

逐篇正文只有375px源帧，PC只有已核验通用模板。桌面组合使用精确模板布局和逐篇全文，不套用JCI固定450px高度，不将组合截图称为独立Figma PC文章稿。

## Assets

| 资源 | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| 内容源关闭图标 | `1595:3537`，含`1595:3538` | 精确Dev SVG20×20 | `public/images/figma/trust-safety-revision/privacy/node-1595-3537.svg` |
| 桌面关闭图标 | `143:4211`，含`143:4212` | 精确Dev SVG20×20 | `public/images/figma/trust-content-revision/node-143-4211.svg` |

底页参考图仅存ignored artifacts，不作为网页/弹窗产品UI，没有新增大图。

## Prototype And Motion

阅读全文当前页打开；关闭/Esc/遮罩关闭；背景锁滚、Tab焦点循环、恢复触发焦点和原滚动位置。沿用此前实际核验的Octagos风格模板轻入场：320ms cubic-bezier(.22,1,.36,1)，y16→0；退出200ms ease/y0→8，遮罩250ms；reduced-motion无动画。先核对静态，再逐篇核验交互/动态；移动端不新增入口，跨900断点清理桌面弹窗。

## Verification

- Figma reference screenshot: `artifacts/figma-content-2026-10-22/safety/privacy-figma.png`
- Local desktop screenshot: `artifacts/figma-content-2026-10-22/safety/privacy/privacy-final-local.png`；生产为同目录`privacy-production-local.png`
- Local mobile: deferred by user
- 原始Figma源保真与PC模板组合接入分开比较；不把组合HTML生成图标成Figma截图。
- GDPR/HIPAA表述为设计原文；本次只接入UI，不代表系统合规认证或外部法务审核，不改变现有数据存储、传输和授权行为。
- Verification run: 2026-10-22。已人工查看源稿、静态组合和最终截图；实际Figma源保真pixelmatch0.0014247% / nMAE0.2296067%，PC精确模板组合接入pixelmatch0.1143973% / nMAE0.0852995%。原始RGB>16诊断为0.1297123%，指标分别保存，不混用。
- 开发及生产preview的1024/1440/1920、完整正文、无虚构路由/截图UI、关闭/Esc/遮罩、Tab锁焦、背景锁滚、焦点及滚动恢复、短屏上下40px、进入/退出/reduced-motion与900断点清理均通过。签证入口接入后开发/生产证据已再次完整刷新；报告：`safety/privacy/{source,static,final,production}-qa.json`。
- Remaining differences: none
