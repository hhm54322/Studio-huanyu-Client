# 信任长文 · 感染控制数据

- Route: `/trust` → 感染控制数据 → 阅读全文（原生弹窗，不新增路由）
- Figma frame: `03信任与常见问题-04信任深度长文-05`，`1595:3477`
- Desktop template: `信任深度长文详情模版`，`143:4206`，1440×754
- Source baseline HTML: `docs/figma-source/trust-safety-revision/infection/baseline-2026-10-22.html`
- Desktop composition HTML: `docs/figma-source/trust-safety-revision/infection/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/trust-safety-revision/infection/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/trust-safety-revision/infection/assets-2026-10-22.json`
- Source extraction: 2026-10-22；官方原生文件 SHA256 `8e274b299ca9208685e984e7cdb8b87ae5487c66e2c5103350e1118afc73a56d`；全量展开 Layers，14 节点逐项 Dev CSS 与原生参数交叉核对
- Static lock: 独立 `baseline-lock` / `desktop-composition-lock` 已在 Vue 接入前创建；不改前批文章源锁
- Mobile frame: 375×812，仅提取真实正文，移动网站开发/验收按用户要求暂停
- Status: verified (desktop template composition only; mobile deferred by user)

## Layer Mapping

完整父子层级、兄弟顺序、可见性及具体参数保存在该目录的 `native-inventory` / `native-parameters` / `ui-layers` / `dev-mode`，完整桌面映射在 `desktop-variant` 的 `contentMapping`，没有以模糊子节点标签代替映射。

| Figma Node ID | 层级/父节点 | 桌面运行 owner / 元素 |
| --- | --- | --- |
| `1595:3477` | 根 | `143:4206` TrustArticleDialog / dialog |
| `1595:3478` | Container / `3477` | `143:4208` backdrop |
| `1595:3479` | Frame 631 / `3478` | `143:4209` HomeSourceNode 面板 |
| `1595:3480` | Button / `3479` | `143:4210` button |
| `1595:3481` | Icon / `3480` | `143:4211` 原始 SVG |
| `1595:3482` | Vector / `3481` | `143:4211` 精确路径 owner |
| `1595:3483` | Container / `3479` | `143:4218` 正文容器 |
| `1595:3484` | Text / `3483` | `143:4219` 完整八段正文（含四项管控支柱） |
| `1595:3485` | Container / `3479` | `143:4213` 标题组 |
| `1595:3486` | Heading 2 / `3485` | `143:4214` 标题容器 |
| `1595:3487` | 感染控制数据 / `3486` | `143:4215` 标题 |
| `1595:3488` | Paragraph / `3485` | `143:4216` 副标题容器 |
| `1595:3489` | 0.5% vs 欧美1.2%，4大核心支柱 / `3488` | `143:4217` 副标题 |
| `1595:3490` | dragger / `3477` | 设备横条，非网页内容，不渲染 |

## Sections / Typography / Components

| 项目 | 原始内容源参数 | 桌面模板参数 |
| --- | --- | --- |
| 面板 | 343×450、padding16、radius20、白底、fit-content 网格 | width896、padding32、radius24、inner832、自然内容高度 |
| 标题 | PingFang SC16/16、600、字距.396、#1E3A5F | PingFang SC32/32、600、字距.396、#1E3A5F |
| 副标题 | 11/16、400、#6B7280，容器顶部8 | 14/22、400、#6B7280，容器顶部8 |
| 正文 | 311×362、12/18、400、#4B5563、两端对齐 | 832px、16/24、400、#1E3A5F、两端对齐、段距12 |
| 正文容器 | padding-top16 | padding-top24 |
| 关闭 | 36×36、right8/top8、SVG20 | 36×36、right16/top16、SVG20 |
| 遮罩 | 黑色50%、blur4 | 黑色50%、blur4、上下安全区40 |

Figma逐篇内容位于375px源帧，桌面只有通用弹窗模板；使用模板原有 Auto Layout 接入真实全文，不猜独立桌面参数、不将生成组合冒充独立 Figma 桌面截图。

## Assets

| 资源 | 源节点 | 项目路径 |
| --- | --- | --- |
| 内容源关闭 SVG20 | `1595:3481`（含 `3482`） | `public/images/figma/trust-safety-revision/infection/node-1595-3481.svg` |
| 桌面关闭 SVG20 | `143:4211`（含 `4212`） | `public/images/figma/trust-content-revision/node-143-4211.svg` |

内容源底页截图仅留 ignored artifacts；产品使用真实底页、原生 dialog 和 DOM 全文，不新增高分辨率图片。

## Prototype And Motion

阅读全文原地打开，关闭/Esc/遮罩关闭；Tab 锁焦，背景滚动锁定，关闭后恢复触发焦点和页面滚动位置。复用前批已核验动效：进入320ms cubic-bezier(.22,1,.36,1)、y16→0；退出200ms ease、y0→8；遮罩250ms；reduced-motion 无动画。先完成静态比对，再核验动态插值及交互。

## Verification

- Figma reference screenshot: `artifacts/figma-content-2026-10-22/safety/infection-figma.png`
- Local desktop screenshot: `artifacts/figma-content-2026-10-22/safety/infection/infection-final-local.png`，生产 preview 对应同目录`infection-production-local.png`
- Local mobile: deferred by user
- 比对口径：原始源截图保真与桌面模板组合接入分开报告，不宣称独立 PC 感染文章稿存在。
- 统计及医疗质量表述沿用设计全文，不代表已进行外部事实或医学合规审核，本次不新增医疗承诺。
- Verification run: 2026-10-22；开发/生产 preview 实测 1024/1440/1920、全文、关闭/Esc/遮罩、Tab 锁焦、焦点/滚动恢复、短屏上下40px、进入/退出插值、reduced-motion、跨900px断点清理，无坏图或横向溢出。
- 源稿面板对实际 Figma 导出：pixelmatch0.0017277%、nMAE0.2650884%。这是提取源保真，不是移动网站验收。
- 桌面模板组合接入：pixelmatch0.1104911%、nMAE0.0641981%；实际896×450，由真实全文和 PC 模板自然布局得到；该指标不是不存在的独立 PC 文章稿比较。签证入口接入后开发/生产证据已再次完整刷新。
- 专项记录：`safety/infection/source-qa.json`、`final-qa.json`、`production-qa.json`；pixelmatch threshold.15/includeAA=false 与 nMAE 均<1%，另存原始RGB>16诊断值0.1293403%。
- Remaining differences: none
