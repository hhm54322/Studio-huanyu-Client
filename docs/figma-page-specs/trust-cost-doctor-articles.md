# 信任长文 · 费用低的原因 / 医生资质揭秘

- Route: `/trust` → 对应卡片“阅读全文”，站内原生弹窗，不增加详情页
- Figma frame: `信任深度长文详情模版`（桌面）及`03信任与常见问题-04信任深度长文-02/03`（逐篇正文）
- Node ID: `143:4206` + `1595:3491` / `1595:3519`
- Source baseline HTML: `docs/figma-source/trust-articles-revision/cost/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/trust-content-revision/trust/dev-styles-2026-10-21.css`
- Source asset manifest: `docs/figma-source/trust-articles-revision/assets-2026-10-22.json`
- Source extraction run: 2026-10-22，官方原生文件、14+14节点完整Layers和逐节点Dev CSS；先建立静态基线、具体owner映射和锁，再改Vue
- Desktop frame: 1440×754；桌面共用896px、padding32、radius24弹窗；行高和段距由原生模板确定，逐篇高度由其fit-content网格和真实正文决定
- Mobile frame: 375×812内容源仅用于读取真实文案；按用户要求暂停移动布局开发及验收
- Status: verified (desktop template composition only; mobile deferred by user)

## Layer Mapping

完整树、父节点、兄弟顺序、可见性、原生参数和逐节点Dev CSS分别保存于`docs/figma-source/trust-articles-revision/cost/`和`doctor/`。桌面具体映射为两份`desktop-variant-2026-10-22.json`的`contentMapping`，每个内容源节点均映射到PC模板真实DOM或明确的非网页设备装饰。原始375px截图不进入产品UI。

| 内容层 | 费用源节点 | 医生源节点 | 桌面运行owner |
| --- | --- | --- | --- |
| 根/遮罩 | `1595:3491` / `3492` | `1595:3519` / `3520` | `143:4206` / `143:4208`（native dialog/backdrop） |
| 面板 | `1595:3493` | `1595:3521` | `143:4209` HomeSourceNode |
| 关闭/图标/路径 | `1595:3494` / `3495` / `3496` | `1595:3522` / `3523` / `3524` | `143:4210` button / `143:4211`精确SVG（路径同owner） |
| 正文容器/正文 | `1595:3497` / `3498` | `1595:3525` / `3526` | `143:4218` / `143:4219` |
| 标题组/标题框/标题 | `1595:3499` / `3500` / `3501` | `1595:3527` / `3528` / `3529` | `143:4213` / `143:4214` / `143:4215` |
| 副标题框/副标题 | `1595:3502` / `3503` | `1595:3530` / `3531` | `143:4216` / `143:4217` |
| 设备横条 | `1595:3504` | `1595:3532` | 不渲染，非网页 |

## Typography

桌面严格复用PC模板：PingFang SC；标题32/32、600、字距.396、#1E3A5F；副标题14/22、400、#6B7280；正文16/24、400、#1E3A5F、两端对齐、段间12px。标题及副标题保留源WIDTH_AND_HEIGHT自然文字宽度，不把JCI标题180px固定宽度套在其它文本上。

## Components And Spacing

面板896＝32＋832＋32；标题32＋副标题padding8/line22＝62；正文顶部24；面板顶部/底部32。保持PC模板fit-content网格，不把其它文章固定为JCI的450px或手机的380/520px。关闭按钮36×36，距右/顶16，SVG20×20。短桌面保留40px上下安全间距、弹窗外层可滚动。

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| 桌面关闭图标 | `143:4211`（含`143:4212`） | 原始Dev Mode SVG20×20 | `public/images/figma/trust-content-revision/node-143-4211.svg` |
| 费用内容源关闭图标 | `1595:3495`（含`1595:3496`） | 原始Dev Mode SVG20×20，源核验使用 | `public/images/figma/trust-articles-revision/node-1595-3495.svg` |
| 医生内容源关闭图标 | `1595:3523`（含`1595:3524`） | 原始Dev Mode SVG20×20，源核验使用 | `public/images/figma/trust-articles-revision/node-1595-3523.svg` |

背景截图仅留artifacts。没有整图代替DOM，没有新增大图片。

## Prototype And Motion

静态通过后沿用已验收模板的轻量淡入/退出：进入320ms cubic-bezier(.22,1,.36,1)、y16→0，退出200ms ease/y0→8；遮罩250ms；reduced-motion关闭动画。关闭、Esc、遮罩、Tab锁焦、焦点恢复、滚动恢复逐篇验证，不跳转伪路由。

## Verification

- Figma reference screenshot: `artifacts/figma-content-2026-10-22/trust-02-figma.png` / `trust-03-figma.png`
- Local desktop screenshot: `artifacts/figma-content-2026-10-22/cost-final-local.png` / `doctor-final-local.png`
- Local mobile: deferred by user
- Verification run: 2026-10-22；原始源截图、开发环境和生产preview均实测，签证入口接入后再次刷新两篇桌面截图与完整行为/动效回归
- 比对口径：逐篇Figma帧为375px，桌面只有通用模板。原始内容源逐节点/全文核验；PC模板以JCI原始Figma截图回归；新正文桌面以锁定的PC Auto Layout组合基线核验接入一致性。不得把生成基线当作Figma截图、不得声称不存在的独立PC文章帧误差<1%。
- 原始Figma内容源面板逐像素比对：费用pixelmatch0.0013705%、nMAE0.2482559%；医生pixelmatch0.0018754%、nMAE0.2884314%。此处是提取源保真验证，不是移动端网站开发/验收。
- 桌面组合基线接入差异：费用pixelmatch0.0987768%、nMAE0.0585112%；医生pixelmatch0.1265991%、nMAE0.0706619%。实际高度分别498/402，由模板Auto Layout和真实全文得出。
- 1024/1440/1920桌面宽度、全文、Esc/关闭/遮罩、Tab锁焦、焦点和滚动恢复、短屏上下40px及末段可达、进入/退出、reduced-motion均通过；跨900px断点关闭桌面弹窗，避免错误切换成旧移动JCI内容。
- 证据：`artifacts/figma-content-2026-10-22/trust-article-source-qa.json`、`trust-variants-final-qa.json`、`production/trust-variants-production-qa.json`；原始来源与桌面组合明确分开记录。
- 医生原文`3\u001e5`仅在派生文本修正为`3-5`；原生源记录不改。
- 统计和质量承诺沿用设计原文，不等同于外部事实或医学合规已核实；不在本次UI工作中添加新的医疗承诺。
- Remaining differences: none

上述结论限定于明确记录的桌面模板组合；移动布局暂停，独立PC逐篇稿未存在，不将本批次通过宣称为全站完成。类型检查和直接生产构建通过；全站既有过期证据仍由总门禁保留，不绕过。未提交、推送或部署。
