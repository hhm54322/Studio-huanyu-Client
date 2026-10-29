# 工具包 · 就医步骤与就诊流程

- Route: `/steps/toolkit-detail?article=steps-flow`
- Figma frame: `03信任与常见问题-05来华就医全流程工具包-07`
- Node ID: `1604:810`；正文 `1604:822`；PC 模板 `143:3058`
- Source baseline HTML: `docs/figma-source/toolkit-revision/steps-flow/desktop-baseline-2026-10-22.html`
- Source baseline CSS: `docs/figma-source/toolkit-revision/steps-flow/dev-styles-2026-10-22.css`
- Source asset manifest: `docs/figma-source/toolkit-revision/steps-flow/assets-2026-10-22.json`
- Source extraction run: 2026-10-22，实时 Figma Layers / 逐节点 Dev Mode CSS / 官方 .fig 交叉核验
- Desktop frame: PC模板1440px，正文Auto Layout
- Mobile frame: deferred by user; existing mobile UI unchanged
- Status: verified (desktop only; mobile deferred by user)

## Layer Mapping

实时 Figma Layers 递归展开正文15个节点，逐个选中读取 Dev CSS/SVG，再与官方`.fig`核对15/15父子、同级顺序及名称；完整参数、实际层级、映射和源锁均在本篇独立源目录。正文层名沿用旧保险文字，实际TEXT是就医全流程，不从层名猜正文。

| Figma Node ID | Parent Node ID | PC owner / Vue element | Dev Mode 参数与内容 |
| --- | --- | --- | --- |
| `1604:822` | `1604:810` | `143:3062` / article | 源375×1405.1171875；左右16、底40；PC906px、padding32、radius24 |
| `1604:823` | `1604:822` | `143:3065` / 返回链接 | 源343×27.1171875、gap8；PC模板原几何 |
| `1604:824` | `1604:823` | `143:3066` / 返回SVG | 源12×12，精确Dev SVG |
| `1604:825` | `1604:824` | `143:3066` / SVG path | 横线原生矢量，不替代图标 |
| `1604:826` | `1604:824` | `143:3066` / SVG path | 箭头原生矢量，不替代图标 |
| `1604:827` | `1604:823` | `143:3069` / 返回文字 | PingFang SC Regular12/12、#5C6584；PC14/22 |
| `1604:828` | `1604:822` | `143:3070` / 分类外层 | 源343×50、顶部24；PC842×66、顶部32 |
| `1604:829` | `1604:828` | `143:3071` / 蓝色标签 | 源157×26、padding8/12；PCpadding10/16、radius9999、#2563EB10% |
| `1604:830` | `1604:829` | `143:3072` / 分类文字owner | 源133×10、水平gap4；PC沿用已核验文本样式 |
| `1604:831` | `1604:830` | `143:3072` / 分类文字 | “03 在华&回国 · 就诊随访工具”；源10/10、600；PC14/14、500、字距-0.15 |
| `1604:832` | `1604:822` | `143:3073` / 标题外层 | 源177×32、顶部12；PC原模板间距 |
| `1604:833` | `1604:832` | `143:3074` / h1 | 原文“就医步骤与就诊流程”；源20/20、600；PC40/60、600 |
| `1604:834` | `1604:822` | `143:3075` / 正文外层 | 源343×1256、顶部24；PC原模板间距 |
| `1604:835` | `1604:834` | `143:3076` / 正文容器 | 源343×1232；PC根据完整正文自然增高 |
| `1604:836` | `1604:835` | `143:3077` / 完整TEXT | 源12/18、章节14/22、局部600；PC16/24、章节24/36、段距12 |

## Sections

| Section | Node ID | Width / height | 规则 |
| --- | --- | --- | --- |
| 本篇内容源 | `1604:822` | 375×1405.1171875 | 原稿保真单独比对，不作为移动网站开发 |
| 桌面文章区域 | `143:3062` | 906×1773.1171875 | PC模板 + 本篇真实全文，完整7节 |
| 桌面页面 | `143:3058` | 1440×2453.1171875 | 左文章 + 右目录，原模板页眉页脚 |

## Typography And Auto Layout

PC分类标签不是固定191px。2026-10-22重新在实时Dev Mode选中`143:3071`，画布显示宽高Hug，右侧CSS为`padding:10px 16px; justify-content:center; align-items:center; gap:4px`，没有固定宽度；`143:3072`原生`textAutoResize:WIDTH_AND_HEIGHT`。按原PC字体测量本篇文字185.671875px，胶囊为217.671875×34px，左右精确16px；未从截图估算。生成器与QA均验证文字完整且不越出背景，旧文章也重新按相同Hug语义生成并回归。

先锁定原始源及独立PC模板组合的HTML/CSS，再接Vue。静态源保真和PC组合接入分别统计；没有独立Figma PC文章帧，不将组合HTML冒充独立设计稿。仅在派生PC文案修正`生活管家**`及`注意事项务`两个明显笔误，原始源数据和源截图保持不变，不擅自改变医疗、签证或服务政策。

## Assets

| 资源 | Figma Node ID | 项目路径 / 用途 |
| --- | --- | --- |
| 本篇返回箭头 | `1604:824` | `public/images/figma/toolkit-revision/steps-flow/node-1604-824.svg`，原生Dev SVG，源保真QA |
| PC返回、咨询、语言图标 | `143:3066`、`143:3129`、`143:3155` | 已锁定PC模板同源SVG，完整路径见本篇assets记录 |
| PC联系图标 | `143:3208`、`143:3214`、`143:3219` | 已锁定PC模板同源SVG；正文无图片或新大资源 |

## Prototype And Motion

| 交互 | 来源 / 触发 | 行为 |
| --- | --- | --- |
| 工具包目录 | `143:3111` | 桌面进入本篇，当前文章标记；返回`/trust` |
| 已有阅读全文 | `/steps`卡片`204:6028`、操作`204:6039–6044`；`/trust`既有同内容卡片 | 仅启用已有按钮，目的地为本篇，不改卡片外观，不增设计外入口 |
| 自然阅读目录固定 | PC目录`143:3082` | 距视口顶24px，真实内容底界释放，回滚恢复，无内部滚轮劫持 |
| 进入与链接反馈 | Octagos长文实操滚动、回滚和目录点击 | 620ms cubic-bezier(.22,1,.36,1)进入、220ms链接反馈；不改变静止几何 |
| reduced-motion / 窄屏 | 无障碍与用户暂停移动UI要求 | 关闭过渡；≤900px新入口维持禁用，直接访问新文章安全返回`/trust` |

## Verification

- Figma reference screenshot: `artifacts/figma-toolkit-2026-10-22/steps-flow/source-figma.png`
- Local desktop screenshot: `artifacts/figma-toolkit-2026-10-22/steps-flow/desktop-final.png`
- Local mobile: deferred by user
- Verification run: 2026-10-22批次，最终证据UTC 2026-10-23；静态通过后接入现有阅读全文、目录、行为与动效，开发及生产preview重复同套实测。
- 静态源稿750×2811：pixelmatch0.5788687%、nMAE0.9385600%；原始RGB>16诊断6.1419187%，与主指标分开保留。仅归一化小数高度造成的1原生像素底边，不缩放、位移或遮罩正文。
- PC组合与Vue静态比对：pixelmatch0%，1440×2453px，15/15具体owner存在，无坏图和横向溢出；已亲自检查源稿首尾并排和PC首屏，长标签不裁切。
- 动效接入后的最终开发/生产截图同样通过：源稿pixelmatch0.5788687%、nMAE0.9385600%；PC组合pixelmatch0%、nMAE<0.000001%。已亲自查看最终源稿两段并排、桌面全页及生产全页，真实正文与7个章节完整。
- 1024×600、1440×900、1920×1080：全文、当前目录、键盘返回、历史前后退、目录进入、咨询/联系、未接目的地不误跳，目录24px固定/真实底界释放/回滚恢复均通过。
- `/trust`及`/steps`现有阅读全文的启用前后卡片截图/几何差异0%，桌面鼠标、键盘、历史及文章返回通过；390/900px保持原有禁用状态，resize恢复桌面入口。新文章窄屏直访安全返回`/trust`，不冒充已完成移动端UI。
- 620ms进入真实插值、静止恢复、220ms链接反馈及reduced-motion通过。参数/源锁/专项门禁、类型检查、直接Vite生产构建和diff检查通过；未改后端、管理端或报告生成，未提交、推送或发布。本篇通过不等于全站旧证据回归通过。
- Remaining differences: none
