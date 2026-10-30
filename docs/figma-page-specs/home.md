# 首页

- Route: `/`
- Figma frame: `01寰宇云医 - 首页`
- Node ID: `1412:5682`; mobile `1528:115`
- Source baseline HTML: `docs/figma-source/home/baseline-2026-10-19.html`、`baseline-mobile-2026-10-19.html`
- Source baseline CSS: `docs/figma-source/home/dev-styles-2026-10-19.css`、`dev-styles-mobile-2026-10-19.css`
- Source asset manifest: `docs/figma-source/home/assets-2026-10-19.json`，对应 `public/images/figma/home-revision/`
- Source extraction run: `2026-10-19`，官方原生导出与UI Layers/逐节点Dev Mode交叉核验；主帧基线锁为 `baseline-lock-2026-10-19.json`；2026-10-28/29 以当前官方导出复核全部已接入源帧。
- Desktop frame: `1440 x 8921px`
- Mobile frame: 外容器 `1528:115` 为375×7652px；网站本体 `1528:116` 为375×7566.0625px
- Status: verified — desktop corrections against Figma, 2026-10-29; mobile deferred by user

### 患者照片轮播与宽屏修正 — 2026-10-29

用户确认：患者故事及详情均为同一位 Michael W. 的五张照片，病例文案不切换。此前从病例页/其他页面借用 Maria、James、新加坡及马来西亚患者内容的做法作废，删除首页相关数据与跳转。下文旧日期中“五个故事状态”的验收不能证明这项语义正确。

本轮官方源导出 `artifacts/figma-home-corrections-2026-10-29/current.fig`，导出时间 `2026-10-29T14:48:20.070Z`，SHA-256 `7ed9a18debe13572cfdbe58e2721d265e16395077040615b95a8116b6f8ee9bf`。现有首页根及弹窗源逐节点比较无变化；八个独立照片源新增提取记录已完成 live Layers/Dev CSS 及 native 父子顺序交叉核验，参数、源码、映射及锁位于该目录 `sources/`。照片不是新患者记录。

| 用途 | Figma 节点 → Vue 归属 | 精确静态参数 |
| --- | --- | --- |
| 主页五张照片 | `1466:843`、`1412:5862 > 1466:846`、`1466:848 > 1466:849`、`1466:850 > 1466:851`、`1466:852 > 1466:853` → `HomePatientStories > HomeSourceNode` | 外框389.33334×400，圆角24；后四张内部图片600×400，x分别−105、−105、−80、−16，y均0。保留首张原生填充变换。 |
| 详情五张照片 | `1407:20`、`1466:856`、`1466:865`、`1466:866`、`1466:867` → `HomeSourceDialog > HomeSourceNode` | 404×269.33334，圆角24，使用各自原图及原生图像填充。 |
| 详情照片圆点 | `1466:858 > 1466:859–863` → `HomeSourceDialog` | 容器104×10，x150、y243；活动32×10，其他10×10，间隔8。只切图片。 |
| 详情右侧滚动到底 | `1407:28/30`、底部状态`1414:7361/7363` → `HomeSourceDialog` | 视口404×532，内容404×778，底部状态y−278，得出白色尾部间距32；内容下圆角24。 |
| 宽屏首屏 | `143:1190/1222/1251`、`1523:33` → `HomeHeroSection` | 保留1440×754基线；宽度超过1440时按stretch约束扩展背景，文案保持1280版心，左右控件距视口边24，圆点居中。 |

运行数据为 `docs/figma-source/home/story-carousel/source-trees-2026-10-29.json`，所有照片使用 SHA1 校验的 Figma 原图压缩 WebP。开始 Vue 修改前已建立完整静态基线；接线后重新核验五张图片、同一病例文案、详情滚动、关闭焦点恢复、暂停/键盘/reduced-motion，以及1440/1920宽屏几何与截图。

顶部导航透明度：用户2026-10-29确认使用透明底。现场重新读取主帧导航 `1412:6749` 的 Dev Mode CSS，无背景填充，1440×64、absolute；子容器 `1412:6750` 为1280×64、x80、左右padding32。继续保留最新独立首屏 `1523:75` 的导航内容/Logo/菜单几何，仅桌面静止态采用主帧透明底，不沿用独立帧里的白色填充。参数证据 `artifacts/figma-home-corrections-2026-10-29/live-header-transparent.txt`。页面滚动后的已有可读性背景不影响首屏透明状态；手机冻结。

验收结果：主页及弹窗两组独立图片分别绑定自身的源节点，未将一组重新裁成另一组。通过 Figma 的 Copy as PNG 逐个导出10个节点，与浏览器原生DPR2逐张对照：最高nMAE 0.7314%，最高pixelmatch 0.1668%；照片正文始终为同一 Michael W. 病例。详情底部完整面板对照为0.5608%/0.2187%，右侧底部留白32px，关闭恢复焦点及页面位置。两组自动播放、悬停/聚焦暂停、键盘、reduced-motion通过。4个Hero状态在1024/1440/1920/2560宽度共16组合均无白边或横向溢出，首屏导航三层底色均透明。

证据：`artifacts/figma-home-corrections-2026-10-29/references/` 是两组各自的Figma节点图，`verification/qa.json`、`*-comparison.png` 是本轮逐图/底部/宽屏验收；已有八组首页回归已在本轮代码后重跑，`artifacts/figma-home-2026-10-28/` 的13分区、9状态、7详情、15专家状态均双指标<1%。`scripts/audit-current-home.mjs`新增10张照片、固定病例内容、32px留白、两组播放、透明导航与全宽检查；不使用旧的首张截图代替新增状态验证。

交付前另从同一IAB下载 `/Users/hhm/Downloads/寰宇云医 (17).fig`，完整首页、独立Hero及八个新照片源分别与各自实现源导出比较，相关源全部unchanged。原始源锁不更新。当前桌面这些修正剩余差异：无；手机按用户要求继续冻结。

外网发布版本 `20261029160923`，地址 `https://www.huanyumedical.com/`。完整 `pnpm build`（含42份规范门禁）、类型检查及 diff 检查通过；共享导航涉及的关于我们、病例、病种及专家目录已实际重跑回归。外网重新逐张核验两组共10张照片，最高 nMAE 0.7303%、pixelmatch 0.1656%；详情底部32px留白、关闭恢复位置和焦点、自动播放/暂停/键盘/reduced-motion，以及4个Hero状态×4种桌面宽度的透明导航与全宽检查均通过，无页面错误。证据为 `artifacts/figma-home-corrections-2026-10-29/online/qa.json`、`online-summary.json`，发布记录为 `artifacts/deployment/20261029160923/`。主站文件与发布清单2094项校验一致，API健康检查通过；后台与报告生成未改动。

### 历史桌面源稿与验收 — 2026-10-28（本次修正前）

当前独立首屏 `1523:31`（1440×754，89节点）已完整提取 Layers/Dev Mode 并接入；长页及原有桌面状态经完整官方源比较无变化。交付前最新官方导出为 `docs/figma-source/huanyu-current-2026-10-29.fig`（导出时间2026-10-28T19:56:21.274Z，SHA-256 `dd25ba88e97467ac8803951a3aebe3596f13f8e69c41ed30f5988b5408a40353`）；首页相关源帧逐节点比较 unchanged。Logo `2326:8518` 已使用准确选中导出资源。

当前代码后的八组桌面核验已通过：hero/page/states/dialogs/experts/interactions/site/behavior，证据位于 `artifacts/figma-home-2026-10-28/`。主帧13分区、补充9状态、六详情与15专家状态均为nMAE和pixelmatch双指标<1%。1024/1440/1920检验菜单hover/键盘、语言、固定助手、咨询开关、FAQ独立展开、焦点恢复、无横溢出；ECharts、滚动联动、轮播暂停及reduced-motion通过。完整源与证据门禁 `scripts/audit-current-home.mjs` 已通过。手机继续冻结；未部署。下文为按日期保留的历史过程，不能覆盖本节当前结论。

### 最新交接：按用户要求回到商业发展计划 — 2026-10-23

- 本轮六卡整卡/hover/focus及15个专家标签的实现、截图与行为已核验。最后人工复核发现图表透明父层继承问题，已按下方源参数修复，不进入下一页。
- 修复后重新执行类型检查、直接Vite生产构建及diff检查，全部通过；开发/生产preview重新截取13个主帧分区，双指标均<1%（两环境最高nMAE0.8774723%、pixelmatch0.7429469%）。费用图分区开发为0.5727888%/0.4634244%，生产为0.5092852%/0.3647476%（nMAE/pixelmatch），已亲自复看，透明文案不再显示。证据：`artifacts/figma-regression-2026-10-23/home/{development,production}/page/qa.json`。
- 关于我们联合专项通过；首页专项源参数/层级/透明度检查通过，但按证据时效规则拦截旧的`development/states`报告。最终改动后只重跑了整页13分区，不把此前9补充状态、弹窗及行为报告冒充最新代码后的全量通过。恢复时须真实重跑两环境states/site/behavior/dialogs/experts/expert-motion/interactions，再跑联合门禁；不修改时间戳或放松检查。
- 移动端仍暂停。未改后端、医院管理或报告生成，未提交、推送或部署。下一页仍为`/why-china`，首页最终专项通过后才能进入。

### 当前桌面回归：卡片交互补齐 — 2026-10-23

本轮按用户要求只做桌面；手机开发/验收继续暂停。主帧1138层已从当前Figma Layers全量展开交叉核对；30组桌面源共3237节点与最新官方`.fig`逐参数、矢量blob实际SHA256和图片字节比较均无变化，沿用完整已锁定Dev基线，不以截图估算新值。

当前六卡片`1412:5795/5810/5819/5827/5835/5844`整卡按钮已接对应六详情。补齐用户明确要求的hover/focus展示详情入口：源稿第一卡`1412:5799`是含入口的120px内容块，其他五卡是88px内容块；使用原差值32px作交互位移。入口完整复用`1412:5804`（341×32，顶padding16，gap4）、文字`1412:5806`（16px/16px，500，#2563EB）和精确SVG`1412:5807`（16×16），不新增推测样式或替代图标。其余五卡的入口用同源组件replica呈现，保留其原有文字和尺寸；静止态不显示入口，hover/键盘focus时出现。Figma整页第一卡显示的是展开示意态，截图核验显式悬停第一卡，不把交互态差异改成静态布局偏移。

具体运行映射：卡片 → `HomeView.vue` 的六整卡源按钮；内容`1412:5799/5814/5822/5830/5839/5848` → 各自源DOM；入口`1412:5804` → 第一卡源DOM，其余五卡由`HomeSourceNode`复用同一真实源节点并设replica，不伪造新Figma ID。淡入/位移使用既有Octagos式opacity/transform语言，300ms、cubic-bezier(.22,1,.36,1)，reduced-motion立即切换，卡片外框不移动。

本段为实现前的交互参数记录；最终截图和专项门禁记录在后续本日回归段，不以上述计划代替完成证据。

### 图表父层透明度修正 — 2026-10-23

截图人工复核发现费用图中多出文字“脊柱手术”。逐层核对 Figma Design/Dev Mode 与锁定原生参数：文字 `1412:6312` 为 SF Pro 12/18px、#1C1917；父层 `1412:6311`、`1412:6310`、`1412:6309` 的原生 opacity 均为0。现有图表转换只复制了文字自身参数，遗漏父层透明度。本次保留全部原生参数与节点映射，以相对 ECharts owner 的完整祖先链计算每个图表图元的有效透明度；不删除该源节点、不凭截图隐藏文字。仅重生成桌面派生 chart-spec 及对应派生文件哈希，移动源不改。修复与定向截图通过后暂停开发，回到商业发展计划；不据历史证据宣称新一轮首页全量门禁完成。

### 专家详情源锁与接入记录 — 2026-10-21

本次先完成源提取和静态基线再改 Vue。四位专家桌面15状态、手机15状态及柳光宇手机任职滚动状态，共31源集、2,117个逐节点 Layers/Dev Mode 记录，位于 `docs/figma-source/home/experts/<name>/`。每一源集含 `native-inventory`、`native-parameters`、`native-image-paints`、`ui-layers`、`dev-mode`、`source-tree`、`node-to-code`、`layers-crosscheck`、`baseline.html`、`dev-styles.css` 和 `dialog-model`（日期2026-10-19）。完整源锁由 `scripts/build-home-revision.cjs` 更新，聚合面板源文件 `experts/dialog-sources-2026-10-19.json` 只用于机械转换，不重新编写内容/样式。

| 首页卡片顺序 | 专家 | 桌面源状态 | 手机源状态 | 标签数 |
| --- | --- | --- | --- | --- |
| 1 | 徐宇 | `1432:7917/8267/8688` | `1552:39/166/377` | 3 |
| 2 | 周莉莉 | `1432:7741/7980/8329/8558` | `1552:104/216/318/438` | 4 |
| 3 | 柳光宇 | `1432:7801/8082/8386`、`1455:672` | `1556:581/701/883/991`；任职滚动态 `1648:1878` | 4 |
| 4 | 陈疾忤 | `1432:7861/8194/8443/8625` | `1556:643/815/942/1058` | 4 |

静态映射：`Frame 631` → `HomeExpertDialog.vue > HomeSourceNode`；原生根帧和全屏 Container → 同一原生dialog/遮罩；根节点的“信任页”截图和手机dragger是设计演示背景/设备装饰，不进入网站DOM。面板内每个子节点都按自己的ID映射，不以整张源截图代替。实际Figma头像和图标保持原填充/裁切，压缩为WebP或原生SVG。桌面面板宽896px、圆角24px、padding32px；手机宽343px、圆角20px、padding16px；各状态原始高度保存在对应 `dialog-model`，不统一硬套高度。偏离375px的手机宽度使用原Auto Layout转换的流式排版，不压缩字体/头像比例。

交互接入：卡片打开本人专业擅长；切换标签保留弹窗并更新本人源树；左右键/Home/End切换标签，Escape、关闭按钮和遮罩关闭；使用原生dialog并显式处理Tab首尾循环，关闭后恢复原触发点并保持页面滚动位置。柳光宇任职手机稿包含独立固定头部/可滚动正文版本，按实际源层级处理。90个标签/视口组合及额外短屏滚动态已通过截图、焦点锁定/恢复、关闭路径和滚动恢复回归；专家状态已验收。

### 当前批次验收进展 — 2026-10-21

本页已按新版 Figma `1412:5682`（桌面）与 `1528:116`（手机网站根）完成主帧逐节点源锁、Dev Mode 参数复制、Node-to-Vue 映射与截图检查。当前源锁包含56个源集、5,667个原生节点、484个锁定文件和609项资源；图表由 ECharts 绘制，图片使用真实 Figma 图源并压缩为 WebP。四位专家的31个桌面/手机标签源状态已逐一接入并核验。

- 交互：Hero 四状态、流程 01–04 定位、为什么来中国就医六状态弹窗、患者故事五状态轮播、FAQ 独立展开、咨询弹窗、语言/移动菜单、页脚联系方式均通过键盘、Escape、焦点恢复、触摸和关闭路径检查。
- 动效：Hero/故事淡入、实力左侧连续滚动与右图淡入淡出、合作伙伴无缝滚动；悬停/聚焦暂停，`prefers-reduced-motion` 停止自动切换并保留可读静态状态。
- 截图：桌面13个、手机17个源分区均在1%以内（桌面最高0.8775%，手机最高0.9215%）；专家桌面15状态最高0.4354%、手机15状态最高0.6732%、额外短屏滚动态0.7568%。指标为RGB归一化平均绝对误差nMAE，不等同于变化像素比例。六种视口（1440/768/430/390/375/320）无页面错误、横向溢出或断图。
- 门禁证据：`artifacts/figma-2026-10-19/site/qa.json`、`page/qa.json`、`behavior/qa.json`、`dialogs/qa.json`、`experts/qa.json`；新版源审计：`scripts/audit-home-revision.mjs`。
- Figma reference screenshot: `artifacts/figma-2026-10-19/page/1440-1412-5685-figma.png`
- Local desktop screenshot: `artifacts/figma-2026-10-19/page/1440-1412-5685-local.png`
- Local mobile screenshot: `artifacts/figma-2026-10-19/page/375-1528-127-local.png`
- Verification run: `2026-10-28`（最新官方源复核；桌面验收，移动端按用户要求暂缓）
- Remaining differences: none

以下“暂停交接”和旧版 `143:45` 内容保留为历史记录，不作为当前验收状态。

### 恢复开发：患者故事轮播接线 — 2026-10-20

静态初始状态继续使用桌面 `1412:5853` / 手机 `1528:360` 的完整源树，不重新设计布局。桌面图片 `1466:843`、内容 `1412:5863`、标签 `1412:5866`、正文 `1412:5868`、结果 `1412:5875`、署名 `1412:5891`、入口 `1412:5892`、五个圆点 `1412:5898`–`1412:5902`；手机对应 `1528:365` / `1528:372` / `1528:375` / `1528:376` / `1528:382` / `1528:385` / `1528:386` / `1528:367`–`1528:371`。所有静态值引用现有锁定的 Dev Mode / source-tree，不从截图补样式。

轮播仅替换数据字段，初始为当前新西兰 CAR-T 源内容。其余四条使用已接入页面的 Figma 内容：`cases/content-2026-09-29.json` 的 `190:5366`（Maria S.）、`190:5383`（James T.），及 `why-china` 页面原稿的新加坡肿瘤、马来西亚牙科反馈。对应原始图片沿用其已记录图源，按比例 cover，不关联不相符的患者肖像，不添加疗效/费用承诺。CAR-T 入口打开 `1407:8` / `1543:42`；其他入口去现有病例或来源页面，绝不重复打开 CAR-T 详情。

交互：可见时每6.5秒切换；五个源圆点、左右键、横向手势可选；hover、focus、touch、后台标签暂停；提供键盘可见的暂停控件；reduced-motion 停止自动轮播并取消淡入淡出。切换使用 opacity，不改变静态分区几何。此记录是接线计划，最终截图与行为通过前不改 `verified`。

## 当前改版批次 — 2026-10-19

以下旧版 `143:45` 的参数与截图是历史记录，不是本轮新版验收证据。

### 暂停交接 — 2026-10-20

按用户要求暂停开发，先完成商业计划。本轮改动全部保留，未提交、未部署；首页整体尚未验收完成。

- 已修复源文本的段间距、精确行布局、单边描边与 SF Pro 回退，以及弹窗小屏表格、标题、步骤编号和故事图片布局。
- `artifacts/figma-2026-10-19/dialogs/qa.json`（`2026-10-20T14:37:21.073Z`）：六组 why 弹窗及故事弹窗在1440/375宽的局部截图 nMAE 均低于1%，桌面最高0.790%、手机最高0.581%。320/375/390/430/768/1440宽无脚本错误或弹窗横向溢出，关闭后滚动位置保持。局部结果不代表整页通过。
- 流程02–04局部桌面对比为0.099%/0.777%/0.332%，实力三状态为0.307%/0.259%/0.243%。相关新版源树及实现已接入，下方旧进展中“流程02–04仍为旧DOM”的描述已被本交接更新。
- 恢复时先复看最后一轮320/390/430等自适应弹窗截图，再核验 Hero 各状态、手机导航、合作伙伴滚动、故事轮播及真实交互动效。最后完成整页桌面/手机截图、生产构建和门禁，不能直接沿用局部通过结论。

- 当前桌面完整源帧：`1412:5682`，`1440 × 8921px`；主体 `1412:5684`，`1440 × 8465px`。
- 当前手机完整源帧：`1528:115`，`375 × 7652px`。已存在独立手机设计，不再使用“无手机源帧”的旧结论。
- 官方来源：通过 Figma `File → Save local copy…` 导出的 `/Users/hhm/Downloads/寰宇云医.fig`，导出时间 `2026-10-19T08:48:03.302Z`，SHA-256 `0bfad9ab064870007faeecf686ebf19bb5d5ccecb7bfb8259947d2ca7965917c`。
- 桌面递归目录/参数/图片填充：`docs/figma-source/home/native-{inventory,parameters,image-paints}-2026-10-19.json`，1138 个节点，其中985个可见、153个隐藏，135条图片填充。
- 手机递归目录/参数/图片填充：`docs/figma-source/home/native-{inventory,parameters,image-paints}-mobile-2026-10-19.json`，764 个节点，其中762个可见、2个隐藏，43条图片填充。
- 便于检索的精简目录：`native-node-index-2026-10-19.json`、`native-node-index-mobile-2026-10-19.json`，含父节点、同级顺序、显隐、尺寸、坐标和文字；不是UI Layers交叉核验证明。
- 当前阶段：主帧的UI Layers、逐节点Dev Mode/CSS、HTML/CSS基线及Vue映射已生成。桌面1138个原生节点与UI目录一致；手机764个原生节点与UI目录一致，额外16个UI设备装饰节点不属于网站。独立核验结果见两份 `layers-crosscheck*-2026-10-19.json`。原始导出中的 `layersCrossCheck: false` 保留为提取时状态，不篡改历史字段。
- 例外口径：源稿中的 `$185起` 不覆盖用户后续明确要求的专家面诊 `$200`；手机稿里的系统状态栏、网页容器导航、底部手势条不是网站组件，不复制进网页DOM。
- 首页主分区及首页Header/Footer已经接入 `HomeSourceNode.vue` / `HomeFigmaSection.vue` 的真实节点DOM；图表保留ECharts。未修改后端、管理端及报告生成行为，尚未发布。

### 当前实现及核验状态（续）

- 完整递归映射：`node-to-code-2026-10-19.json`、`node-to-code-mobile-2026-10-19.json`；运行时每个源元素带 `data-figma-node`。985个桌面可见节点、748个手机网站可见节点分别由Vue DOM、精确SVG或ECharts负责。
- 手机01–04已分别使用源帧366/720/742/462px结构；医院、专家、疾病与陪伴卡片为原生横滑。FAQ可独立展开，语言菜单及Escape关闭已经接线，仍需完成最终状态截图与回归。
- 图片由原始Figma图源压缩为WebP（quality 90、最长边2048）；保留Dev Mode裁切、原生镜像矩阵及图片填充自身的30%/50%透明度，不把整块节点一起透明化。
- 正在处理：ECharts手机几何/图例、320px内部文字截断、图源裁切差异，以及流程02–04、实力其他状态的完整Dev Mode补录和接入。
- 桌面流程02–04目前仍保留旧DOM；Hero其他状态、故事轮播、实力滚动与合作伙伴滚动尚未完成新版核验。不能据主帧已映射就声称整个首页已完成。
- 阶段性本地截图在忽略目录 `artifacts/figma-2026-10-19/`；目前不是最终验收证据。最新类型检查通过，但整页<1%、全部交互/动效及生产门禁尚未通过。

### 新版桌面分区目录

| 顺序 | 分区 | Node ID | 尺寸 | 已确认变化 |
| ---: | --- | --- | --- | --- |
| 1 | Hero | `1412:5685` | 1440×754 | 独立新源绑定，仍有真实患者声音状态 |
| 2 | 来华就医流程 | `1412:5718` | 1440×516 | 01–04入口保留用户已确认的站内定位逻辑 |
| 3 | 为什么来中国就医 | `1412:5765` | 1440×1208 | 六卡片与状态继续逐节点核对 |
| 4 | 患者故事 | `1412:5853` | 1440×720 | 首个故事改为新西兰CAR-T病例，图片和详情入口需一起更新 |
| 5 | 就医全程陪伴 | `1412:6019` | 1440×544 | 保留就诊前、中、后三阶段 |
| 6 | 陪你走全程的人 | `1412:6055` | 1440×596 | 医疗管家、陪诊翻译、医学顾问、海外协调 |
| 7 | 中国医疗数据优势 | `1412:6092` | 1440×740 | 继续使用ECharts，不以导出图代替图表 |
| 8 | 权威合作医院 | `1412:6313` | 1440×703 | 四家合作医院 |
| 9 | 权威专家团队 | `1412:6350` | 1440×647 | 徐宇、周莉莉、柳光宇、陈疾忤替换旧专家内容；旧分区高667px |
| 10 | 我们的实力 | `1442:343` | 1440×834 | 整页内分区高834px，旧基线699px；保留另两状态再核对滚动实现 |
| 11 | 合作伙伴 | `1412:6495` | 1440×791 | 新实例下继续核对完整未虚化图源与固定边缘渐隐 |
| 12 | 末尾CTA | `1412:6635` | 1440×412 | 面诊价格按用户明确要求保留200美元 |
| 13 | 页脚 | `1412:6672` | 1440×456 | 与手机514px页脚分别绑定 |
| 14 | 页头（覆盖层） | `1412:6749` | 1440×64 | 与手机52px导航分别绑定 |

上述分区索引不是完整Node-to-Vue映射。新版完成前，不能引用下方历史的 `Remaining differences: none`。

## Mobile adaptation correction — 2026-10-10

The source remains the desktop hierarchy and node-linked parameters above; there is no independent mobile source frame. Mobile rules are responsive adaptations, not new Figma measurements. Up to 700px, hospital image node `143:681` and its three siblings retain their source square crop in a two-column grid, with 16px gaps/radii, 16/24px titles and 13/20px descriptions. This responds to the customer's oversized-phone-card feedback; full hospital names remain readable. Patient stories use a proportional 4:3 image capped at 240px, natural text height, 20px padding and a non-wrapping CTA. Up to 900px, ECharts renders the same recorded country/medical data at the available width and a 280px reading height, with 11px labels and wrapping legends instead of shrinking a desktop canvas. Desktop chart coordinates remain unchanged. Resize observation updates charts after viewport/container changes. Mobile partner logos keep their source proportions in 1785 x 236px loop tiles with fixed edge fades, matching the insurance-page adaptation. Verification is generated locally under ignored `artifacts/mobile-responsive-2026-10-10/`.

### Customer-requested case autoplay

The static story (`143:209`, image `143:218`, content `143:219`, controls `143:257`–`143:260`) retains its desktop geometry and M·A copy at the initial state. The other two slides reuse the already implemented Maria S. and James T. patient-case source content and portraits recorded in `docs/figma-source/cases/content-2026-09-29.json`; their descriptions are case backgrounds, not invented patient quotations or treatment outcomes. Image/content/dots change together every 6.5 seconds while the section is visible. Dot selection and horizontal touch swipe work manually. Hover, keyboard focus, touch interaction, background tabs and reduced motion pause automatic changes. Slides share a grid row so different copy lengths cannot move the following section. Between 701px and 1199px, the image/content columns use a 34:66 ratio with the existing 24px gap and natural shared height (at least 400px); the bottom row wraps and the CTA never wraps its label. Up to 900px the content padding is 24px and quote type is 20/30px. These behavior and responsive sizes are explicit customer adaptations, not new desktop Figma parameters.

## Layer Mapping

The strength section uses a natural-flow list of all three authored text/image states up to 900px, avoiding the desktop fixed reading window on tablets. Its section spacing is applied once; all imagery remains proportional.

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:45` | `01寰宇云医 - 首页` frame | — | `.home-page` | `1440 x 8806px`, vertical hug | Source frame |
| `143:47` | `Main Content` auto-layout | `143:46` | `.home-page` section flow | `1440 x 8350px`, vertical auto-layout | Header/footer remain shell-owned |
| `143:48` | Hero section | `143:47` | `.home-hero` | `1440 x 754px`, fixed stage | `143:52` image, carousel state |
| `143:54` | Hero eyebrow | `143:53` | `.home-hero__eyebrow` | 14px icon, 10px/16px padding, 10px gap, 9999px radius | Icon asset `Frame.svg` (`143:56`) |
| `143:56` | Hero eyebrow icon | `143:55` | `.home-hero__eyebrow img` | `14 x 14px`, source vector copied | `/public/images/figma/home-icons/Frame.svg` |
| `143:81` | Journey flow section | `143:47` | `.home-flow` | `1440 x 516px`, padding `96px` | Four step links |
| `143:128` | China advantages section | `143:47` | `.why-overview` | `1440 x 1208px`, `#F5F6F7` | Sticky rail + 6 cards |
| `143:151` | Advantage card grid | `143:150` | `.why-overview__grid` | 2 columns x 3 rows, `389 x 280px`, 24px gap | Six card mappings below |
| `143:152` | Medical level icon | `143:151` | `.why-overview article:nth-child(1) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Icon-19.svg` |
| `143:167` | Cost advantage icon | `143:166` | `.why-overview article:nth-child(2) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Icon-17.svg` |
| `143:176` | Language support icon | `143:175` | `.why-overview article:nth-child(3) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Frame-3.svg` |
| `143:184` | Expert access icon | `143:183` | `.why-overview article:nth-child(4) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Frame-4.svg` |
| `143:192` | Integrative care icon | `143:191` | `.why-overview article:nth-child(5) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Frame-1.svg` |
| `143:201` | Visa convenience icon | `143:200` | `.why-overview article:nth-child(6) img` | `32 x 32px`, #2563EB vector | `/public/images/figma/home-icons/Frame-2.svg` |
| `143:209` | Patient story section | `143:47` | `.patient-story` | `1440 x 720px` | Image fill is child `143:218` |
| `143:218` | Patient story image panel | `143:217` | `.patient-story__image` | `389.33 x 400px`, 24px radius, image `154.11% 100%` at `-127.992px 0px` | `/public/images/figma/patient-story.png` |
| `143:377` | Global care section | `143:47` | `.care-section` | `1440 x 544px` | Three route cards |
| `143:413` | Team section | `143:47` | `.team-section` | `1440 x 596px` | Four portrait instances |
| `143:450` | Medical data section | `143:47` | `.data-section` | `1440 x 740px` | Radar and cost chart |
| `143:671` | Hospital section | `143:47` | `.hospital-section` | `1440 x 703px` | Four hospital image cards |
| `143:681` | Shanghai hospital image | `143:680` | `.hospital-grid__image` item 1 | `286 x 286px`, 24px radius, image `126.6% 100%` at `-70.681px 0.172px` | `/public/images/figma/hospital-shanghai-design.png` |
| `143:688` | Beijing hospital image | `143:687` | `.hospital-grid__image` item 2 | `286 x 286px`, 24px radius, image `133.4% 100%` at `-80.805px 0px` | `/public/images/figma/hospital-beijing-design.png` |
| `143:695` | Guangzhou hospital image | `143:694` | `.hospital-grid__image` item 3 | `286 x 286px`, 24px radius, image `168.881% 126.408%` at `-84.373px -0.369px` | `/public/images/figma/hospital-guangzhou-design.jpg` |
| `143:702` | Huaxi hospital image | `143:701` | `.hospital-grid__image` item 4 | `286 x 286px`, 24px radius, image `224.452% 166.86%` at `-178.054px 0px` | `/public/images/figma/hospital-huaxi-design.png` |
| `143:708` | Expert section | `143:47` | `.expert-section` | `1440 x 667px` | Three authored tab states |
| `143:827` | Strength section | `143:47` | `.strength-section` | `1440 x 699px` | `143:827` image instance |
| `143:847` | Partner section | `143:47` | `.partners-section` | `1440 x 791px` | `143:847` matrix marquee |
| `143:987` | Final CTA section | `143:47` | `.home-cta` | `1440 x 412px` | Three CTA actions |
| `143:1024` | Footer | `143:45` | `PatientFooter.vue` | `1440 x 456px` | Shared shell component |
| `484:1377` | Header | `143:46` | `PatientHeader.vue` | `1440 x 64px` overlay | Current source instance, replaces the old `143:1101` |

The complete recursive mapping is `docs/figma-source/home/node-to-code-2026-09-29.json`: 1103 source nodes, including 127 hidden nodes. `dev-mode-2026-09-29.json` contains the node-linked source properties. The table above is a section index, not a substitute for the complete mapping.

### Added state-frame mappings

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:4035` | `为什么来中国就医-01` frame | `143:45` | `.why-detail-modal` state 01 | `1440 x 1106`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4220` | `为什么来中国就医-02` frame | `143:45` | `.why-detail-modal` state 02 | `1440 x 1068`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4316` | `为什么来中国就医-03` frame | `143:45` | `.why-detail-modal` state 03 | `1440 x 1068`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4084` | `为什么来中国就医-04` frame | `143:45` | `.why-detail-modal` state 04 | `1440 x 952`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4127` | `为什么来中国就医-05` frame | `143:45` | `.why-detail-modal` state 05 | `1440 x 889`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:4167` | `为什么来中国就医-06` frame | `143:45` | `.why-detail-modal` state 06 | `1440 x 754`, white source frame copied into Vue DOM/CSS | no shipped bitmap; source frame is retained in Figma records |
| `143:1150` | `我们的实力-02` frame | `143:45` | `.strength-layout__image` state 02 | `1440 x 699`, section source frame | `/public/images/figma/home-source/strength-02-art-exact.webp` |
| `143:1170` | `我们的实力-03` frame | `143:45` | `.strength-layout__image` state 03 | `1440 x 699`, section source frame | `/public/images/figma/home-source/strength-03-art-exact.webp` |

### Partner marquee correction (2026-09-30)

- The previous `143:853` viewport bitmap included the side gradients and was not a valid looping asset.
- The replacement baseline is `docs/figma-source/home/partners-baseline.html`; complete group/card/image geometry and image hashes are in `partners-parameters.json` (64 cards, 130 descendants). Native geometry is paired with the existing node-linked Dev Mode CSS, not inferred from screenshots.
- `143:854` is rendered at `3546 x 472px`; a 24px inter-cycle gap continues the authored card spacing. Two 3570px tiles cover the viewport throughout the loop. Desktop origin is `-1002px` at 1440px viewport width.
- `143:985` maps to `.partners-marquee::before`, and `143:986` maps to `::after`: fixed 160px gradient layers, `#F5F6F7`, with 25%/75% opaque stops. Neither layer moves with the logos.
- The old child mappings to `.partners-marquee img:first-child` are retained as flattened-asset ownership; their actual parameters are now rendered in the full group asset instead of a cropped viewport screenshot.
- Narrow screens use a 1440 x 472 crop of the same Figma group (`partners-mobile-track.webp`) at `viewport / 1440`, while desktop uses the complete 3546px group. Both resources are unfaded; repeating the old faded viewport asset is forbidden. GPU transforms and integer-pixel tile widths prevent subpixel loop seams. Hover pauses; reduced motion holds the Figma source position; the animation returns to an identical cycle boundary.
- Release raster compression uses quality-90 WebP and a 2560px photo cap; alpha images and text/logo matrices keep native dimensions. Original Figma assets remain unchanged. Prebuild generates `.optimized.webp` companions and a manifest; Vite uses those actual existing public files before bundle hashing. Production uses independent WebP URLs because some CDN nodes ignore query strings on cached PNG URLs. Nginx also retains `Accept` negotiation and original-file fallback for legacy URLs.

### Homepage interaction corrections (2026-09-30)

- `143:128` advantage cards preserve the six-card Figma order and open a same-page detail dialog on the whole card. Hover/focus reveals `了解更多`, while click, Enter, and Space open the same state. Escape, backdrop click, focus trapping, and focus restoration are implemented.
- `143:81` journey nodes `01` through `04` are rendered as one connected four-node track with the Figma 80px circles, 20px warm outline, and 185px dashed connectors. The restored flow section keeps the source copy and uses same-page smooth scrolling to `#process-stage-01` through `#process-stage-04`; the left rail then updates to the selected stage.
- `143:827` strength content is a scroll-driven authored-state section. The section title remains fixed in the sticky frame; the left copy is a continuous vertical track of the three authored `596 x 380px` blocks, while the right artwork cross-fades at the three scroll ranges. Desktop uses the Octagos-style pinned reading stage; mobile releases the sticky frame and keeps all three text blocks readable; reduced motion removes the image transition while preserving the scroll sequence.
- Evidence after this change: local desktop QA verified the six-card dialog, Escape close, four-node flow, and strength state transition at `http://127.0.0.1:5173/`. Build and `audit:figma` passed on 2026-10-01.
- Flow restoration evidence (2026-10-01): `docs/figma-verification/home/2026-10-01-process/flow-desktop.png` and `flow-geometry.json`; `.home-flow` is `1440 x 516px`, each step is `285 x 176px`, and `scripts/home-interaction-qa.cjs` verifies all four click-to-stage scroll targets at desktop plus mobile overflow.

### Advantage dialog DOM baseline (2026-10-01)

- The six advantage dialogs are implemented as Vue DOM/CSS, not as exported board images. Figma source frames used for node/content verification are `为什么来中国就医-01` (`143:4035`, `1440 x 1106`), `-02` (`143:4220`, `1440 x 1068`), `-03` (`143:4316`, `1440 x 1068`), `-04` (`143:4084`, `1440 x 952`), `-05` (`143:4127`, `1440 x 889`), `-06` (`143:4167`, `1440 x 754`).
- Shared frame parameters: `Container` overlay `rgba(0,0,0,.50)` + `backdrop-filter: blur(4px)`, centered white modal, 24px radius, 32px internal padding at desktop, and responsive scroll on mobile. Dialog states map to structured `whyDetails` records with explicit Figma copy, table rows, card layout and icon components.
- State layouts: 01 `cards-2x2`; 02 `table-cards` with a five-row fee table and two cards; 03 `table-cards` with a five-row accompaniment table and two cards; 04 `wide-cards` with one wide card and two lower cards; 05 `wide-cards` with one wide card and two lower cards; 06 `cards-3` with three independent cards.
- Figma panel measurements recorded from Dev Mode: all states use `896px` outer width, `32px` panel padding and `24px` radius. Inner content heights are 876px (01), 924px (02), 924px (03), 808px (04), 745px (05), and 432px (06); the implementation preserves these state-specific composition proportions while allowing viewport scrolling on small screens.
- DOM screenshot evidence: `docs/figma-verification/home/2026-10-01-why-dom/why-01-desktop.png`, `why-02-desktop.png`, and `why-06-mobile.png`. The evidence checks the rendered DOM against the corresponding Figma source-frame composition; no `.why-detail-modal__source` image is present.
- The strength section now has three authored states: main source `143:827`, state 02 `143:1150`, and state 03 `143:1170`. The source title container is `1216 x 79px`; the content container is `1216 x 380px` with `48px` top padding, two `596 x 380px` columns, and `24px` column gap. The left track is `596 x 1140px` (three consecutive `380px` blocks). State 01 text nodes are `143:836`/`143:837` and `143:838`/`143:840`; state 02 and 03 repeat the same authored hierarchy in their own source frames. The right artwork node is `143:842` (`596 x 409px`, `28px` radius); all three states use compressed Figma image exports in `/public/images/figma/home-source/strength-01-art-exact.webp`, `strength-02-art-exact.webp`, and `strength-03-art-exact.webp`.
- Journey nodes are same-page anchors (`#why-overview`, `#data-section`, `#care-section`, `#home-cta`) and use smooth scrolling with hash updates. They no longer navigate to another route.
- This correction supersedes the previous hand-authored dialog copy and route-link behavior. Verification evidence: `docs/figma-verification/home/2026-10-01-why-01-local.png`, `docs/figma-verification/home/2026-10-01-flow-anchor-local.png`; `scripts/home-interaction-qa.cjs` passed on 2026-10-01.

### Strength scroll verification (2026-10-01)

- Desktop frame evidence: `docs/figma-verification/home/2026-10-01-strength-01-frame.png`, `2026-10-01-strength-02-frame.png`, and `2026-10-01-strength-03-frame.png` at `1440 x 699px`.
- Mobile evidence: `docs/figma-verification/home/2026-10-01-strength-390-final.png`; document width remains `390px` with all three text/image blocks readable.
- Figma source comparisons measured normalized mean pixel error `0.95%` for 01 (the supplied 01 evidence crop), `0.51%` for 02, and `0.53%` for 03; the title and content coordinates remain fixed while the left track translates `0 -> 760px` and the right image cross-fades.
- Remaining differences: none observed in the verified desktop/mobile states.

## Page Structure

- `Body` (`143:46`): `1440px` fill x `8806px` hug.
- `Main Content` (`143:47`): vertical flow, `1440px` fill x `8350px` hug.
- `Footer` (`143:1024`): `1440px` fill x `456px` hug.
- `Header` (`484:1377`): `1440 x 64px` hug; it overlays the page and does not add to the body height.
- Header container (`484:1378`): horizontal flow, `1280 x 64px`, max-width `1280px`, `space-between`, horizontal padding token `item spacing/m`.
- Header logo link (`484:1379`): `111 x 32px` hug.

## Sections

All non-hero sections use vertical Auto Layout and `96px` top/bottom padding unless noted otherwise.

| Order | Section | Node ID | Width | Height | Container/Grid | Background / Notes |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | Hero / patient voice | `143:48` | 1440 | 754 | Fixed-height stage | Hero container `143:50` has 80px left/right padding |
| 2 | 来华就医流程 | `143:81` | 1440 | 516 | `1216px` content | White, 1px bottom border |
| 3 | 为什么来中国就医 | `143:128` | 1440 | 1208 | 220px rail + 802px content | `#F5F6F7`, fixed height |
| 4 | 患者故事 | `143:209` | 1440 | 720 | `1216px` content | `#FFFFFF` |
| 5 | 就医全程陪伴 | `143:377` | 1440 | 544 | `1216px` content, 3-card grid, `24px` gap | `#F5F6F7` |
| 6 | 陪你走全程的人 | `143:413` | 1440 | 596 | `1216px` content, 4-card grid, `24px` gap | `#FFFFFF` |
| 7 | 中国医疗数据优势 | `143:450` | 1440 | 740 | `1216px` content, 2 data cards, `32px` gap | `#F5F6F7` |
| 8 | 权威合作医院 | `143:671` | 1440 | 703 | `1216px` content, 4-card grid, `24px` gap | `#FFFFFF` |
| 9 | 权威专家团队 | `143:708` | 1440 | 667 | `1216px` content, 4-card grid with authored tabs | `#F5F6F7` |
| 10 | 我们的实力 | `143:827` | 1440 | 699 | `1216px` two-column content, `24px` gap | `#FFFFFF` |
| 11 | 合作伙伴 | `143:847` | 1440 | 791 | min-width 1280; max-width 1920 | `#F5F6F7` |
| 12 | Final CTA | `143:987` | 1440 | 412 | `143:988` is 1440 x 220px | Linear gradient `#DD6B20` to `#3B82F6` |

Section heights total exactly `8350px`, matching `Main Content`.

## Hero

### Independent Banner States

| State | Source Frame | Image Node | Source Baseline | Vue State |
| --- | --- | --- | --- | --- |
| 让全球患者安心赴华就医 | `143:1190` | `143:1194` | `banner-01.html` / `banner-01-styles.txt` | `heroSlides[0]` |
| 8000+个家庭已陪伴赴华就医 | `143:1222` | `143:1226` | `banner-02.html` / `banner-02-styles.txt` | `heroSlides[1]` |
| 就医保障，写在前面 | `143:1251` | `143:1255` | `banner-03.html` / `banner-03-styles.txt` | `heroSlides[2]` |
| 真实患者声音 | `143:48` | `143:52` | Main frame baseline | `heroSlides[3]` (initial state) |

- Independent frames: `1440 x 754px`; copy parent `1280px`, max-width `1280px`, horizontal padding `32px`, gap `40px`; outer stage horizontal padding `80px`.
- States 1/2: eyebrow padding `10px 16px`, gap `4px`, icon `14px`; heading/copy gap `24px`; title PingFang SC `52/52px`, 600, `#143162`; subtitle `18/18px`, 400, `#5B606A`.
- State 1 CTA: `56px` height, `18px 24px` padding, `8px` gap, `14px` radius, `#1E3A5F`; source copy is `提交病例·3分钟获取方案`.
- State 2 has no CTA. `XXX` is an editable source placeholder, not an invented business metric.
- State 3: heading/list gap `48px`; list gap `32px`; item gap `12px`; heading icon `20px`, `8px` gap; item heading PingFang SC `20/20px`, 600.
- The three frames do not contain the shared page Header or assistant. Comparison evidence must distinguish those shell-owned overlays from differences in the Banner itself.
- Image-node exports preserve Figma image adjustments/crop. Downloading the original image alone did not preserve the actual Figma rendering.

- Stage wrapper `143:49`: `1440 x 754px`.
- Content/image frame `143:50`: vertical flow, `1440 x 754px`, 80px left/right padding, 10px gap, `#FFFFFF`.
- Image frame `143:51`: `1440 x 754px`; bitmap node `143:52` is `1440.72 x 757px`.
- Copy container `143:53`: vertical flow, `1280 x 362px` hug, max-width `1280px`, 40px gap, horizontal padding token `item spacing/m`.
- Eyebrow `143:54`: `134 x 34px`, horizontal flow, 9999px radius, 1px border, 10px vertical / 16px horizontal padding, 10px gap, `#2563EB` at 10% fill.
- Heading wrapper `143:59`: `730 x 94px`, vertical flow, 24px gap.
- Main heading `143:60`: `732 x 52px`, PingFang SC Semibold 600, 52/52px, `#143162`.
- Supporting copy `143:61`: `475 x 18px`, PingFang SC Regular 400, 18/18px, `#5B606A`.
- Case chip `143:62`: `361 x 46px`, 10px radius, 1px border, 12px padding, 10px gap, `#FFFFFF` at 10%; border `#2563EB` at 20%.
- Case chip text `143:63`: `335 x 20px`, PingFang SC Regular 400, 14/20px, `#3B82F6`.
- CTA spacer/wrapper `143:64`: `168 x 68px`, 16px top padding.
- CTA link `143:65`: `168 x 52px`, horizontal flow, 14px radius, 18px vertical / 24px horizontal padding, token gap `item spacing/xs`, shadow `0 4px 6px -4px rgba(0,0,0,.1)`.
- CTA text `143:66`: `96 x 16px`, PingFang SC Semibold 600, 16/16px, `#FFFFFF`.
- Hero arrows `143:70` and `143:73`: `48 x 48px`.
- Hero pagination `143:76`: `86 x 10px` hug, token gap `item spacing/xs`; dot `143:77` is `10 x 10px`.

## Journey Flow

- Section `143:81`: vertical flow, `1440 x 516px`, 96px top/bottom padding, 1px bottom border, `#FFFFFF`.
- Heading container `143:82`: `1216 x 80px` hug.
- Heading wrapper `143:83`: `1216 x 40px`.
- Heading text `143:84`: `242 x 40px`, SF Pro Bold 700, 40/40px, centered, `#1E3A5F`.
- Supporting wrapper `143:85`: `1216 x 40px`, 16px top padding.
- Supporting text `143:86`: `208 x 24px`, PingFang SC Regular 400, 16/24px, centered, `#6B7280`.
- Steps offset container `143:87`: `1216 x 244px`, 68px top padding.
- Steps grid `143:88`: `1216 x 244px`, 1 row x 4 columns.
- First step `143:89`: `285 x 176px`, vertical flow, 20px horizontal padding, top position 68px.
- Step visual `143:90`: `245 x 80px`; the implementation uses four fixed `285px` columns with `space-between` distribution.
- Step link/line anchor `143:91`: `80 x 19px`, top 34.5px, left 82.5px.
- Number circle `143:92`: `80 x 80px`, radius 40px, 20px outer border `#FCF1E9`, white fill, top -34.5px. This was corrected from the previous 120px implementation.
- Number text `143:93`: PingFang SC Semibold 600, 32/80px, centered, `#1E3A5F`.
- Connector `143:94`: `185 x 4px`, top 38px, left 182px, 2px dashed `#FCF1E9`, dash pattern 4/2.
- Step heading wrapper `143:95`: `245 x 64px`, 40px top padding.
- Step heading `143:96`: SF Pro Bold 700, 24/24px, centered, `#DD6B20`.
- Step paragraph wrapper `143:97`: `245 x 32px`.
- Step paragraph `143:98`: SF Pro Regular 400, 16/16px, centered, `#6B7280`.

## China Advantages

- Section `143:128`: `1440 x 1208px`, 96px top/bottom padding, `#F5F6F7`.
- Old rail `143:129`: `220 x 650px`, hidden.
- Visible rail `143:136`: `220 x 650px`.
- Rail number visual `143:141`: `120 x 120px`.
- Main content `143:143`: `802 x 1016px`, vertical flow, max-width `1280px`.
- Heading container `143:144`: `802 x 80px` hug.
- Cards spacer `143:149`: `802 x 936px`, 48px top padding.
- Card grid `143:150`: `802 x 888px`, 3 rows x 2 columns, 24px row/column gap.
- Card `143:151`: `389 x 280px`, vertical flow, 24px radius, 24px padding, 80px content gap, `#FFFFFF`.

## Patient Story

- Section `143:209`: `1440 x 720px`, 96px top/bottom padding, `#FFFFFF`.
- Outer content `143:210`: `1440 x 528px`.
- Inner container `143:211`: `1216 x 528px`, max-width `1280px`.
- Image panel: `389.33 x 400px`, 24px radius; story content panel: remaining `802.67 x 400px`, 24px radius, `#F5F6F7` fill, `32px` padding.
- Savings badge: `14px / 21px`, regular weight, `4px 12px` padding, `14px` radius, `#3B82F6` fill.
- Quote: `24px / 36px`, weight `500`, `#1E3A5F`; copy is `"天坛医院的张俊廷教授给了我第二次生命。从确诊到手术仅用了5天，术后3年无复发。"`.

## Medical Data Charts (ECharts)

- User requirement (2026-09-28): render data charts with ECharts. Exported chart SVGs remain source evidence, not runtime images. This exception applies only to the two data charts, not ordinary UI icons or other design assets.
- Source: Dev Mode HTML above, chart nodes `143:462` and `143:535`, and exported vector paths `public/images/figma/home-medical-capability.svg` / `home-treatment-cost.svg`.
- Chart wrapper nodes `143:461` / `143:534`: `542 x 316`, including `16px` top padding. Drawing region: `542 x 300`.
- Radar: center `(271,150)`, radius `88.4`, four polygon subdivisions; line width `2`, grid `#E5E7EB` width `1`. Data paths use blue `#2563EB` with alpha `.30`, navy `#1E3A5F` with alpha `.15`, gold `#C9A84C` with alpha `.15`.
- Radar values, clockwise from top (treatment cost, cure rate, waiting time, technology, service, language): China `95,88,95,90,85,92`; USA `30,92,50,95,82,60`; Germany `50,90,65,93,88,55`. These values reproduce the exported source vector vertices; they are editable example constants, not clinical evidence. ECharts takes the corresponding counterclockwise ordering.
- Radar label nodes: `143:481`, `143:484`, `143:487`, `143:490`, `143:493`, `143:496`; exact source coordinates copied to ECharts `graphic` text. Scale text nodes: `143:501`, `143:503`, `143:505`, `143:507`, `143:509`.
- Cost chart: plot `(50,5)` to `(537,253)`, Y-axis `0,30,60,90,120`, bar width `13`, gap `4`, top radius `4`. Colors match radar plus Japan `#94A3B8`. Grid dash `3,3`, axis `#666666`.
- Cost labels: nodes `143:557`, `143:560`, `143:563`, `143:566`, `143:569`, `143:572`; Inter `11px`, `#374151`. Y-axis text nodes: `143:578`, `143:581`, `143:584`, `143:587`, `143:590`; Inter `11px`, `#6B7280`.
- Cost values (China/USA/Germany/Japan), in thousands of USD:
  - heart bypass: `15/120/80/75`
  - tumor surgery: `12/80/55/60`
  - joint replacement: `8/55/35/40`
  - spine surgery: `10/65/45/50`
  - dental implant: `1.2/4.5/3/3.5`
  - orthodontics: `2.2/6.5/4.8/5`
- Radar legend text nodes `143:522`, `143:526`, `143:530`: SF Pro `12/18`. Cost legend nodes `143:654`, `143:658`, `143:662`, `143:666`: SF Pro `11/16.5`. Their colored markers and exact coordinates are implemented in `chartLegend()`.
- Implementation: `HomeView.vue` refs `radarChartEl` / `costChartEl`, `initCharts()`, `radarSeries`, `costs`, `chartLegend()`. Chart instances are disposed on route unmount and recreated on return. No tooltip or selection is added to the authored resting state.
- Mobile: proportional scaling of the complete canonical chart; wrapper constrains chart and canvas without document overflow. No independent mobile source frame exists. Animation is disabled in ECharts; existing section reveal remains the motion layer, with reduced-motion fallback.
- Regression: `node scripts/home-chart-qa.cjs`; screenshots `docs/figma-verification/home/2026-09-28/echarts-*.png`, canvas pixel/overflow/remount results `echarts-qa.json`, difference image `echarts-diff.png`.
- This chart change does not mark the whole homepage verified. Other homepage differences remain under review.

## Final CTA

- Section `143:987`: `1440 x 412px`, `96px` top/bottom padding; inner content `143:988` is `1440 x 220px`.
- Heading: `40px / 40px`, weight `600`, `0.4px` source letter spacing retained as the nearest project token.
- Supporting copy: `16px / 24px`, `rgba(255,255,255,.80)`, top margin `16px`.
- Button row: `48px` top padding, `16px` gap; white primary is `52px` high with `16px 24px` padding; outline and dark actions are `48px` high with `12px 24px` padding; all use `14px` radius and `16px / 24px` semibold text.
- Benefits row: `24px` top margin, `12px / 16px` text, `rgba(255,255,255,.60)`.

## Shared Typography

The 12 section text styles are checked against the node-linked Dev Mode source by `scripts/home-style-audit.cjs` (zero reported differences). The journey heading is SF Pro Bold 700, 40/40px, centered, `#1E3A5F`; individual overrides remain in the node-linked record.

Figma contains positive or negative letter-spacing values on some text nodes. The implementation uses `letter-spacing: 0` to comply with the project UI rule while retaining all other Figma typography values.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero patient image | `143:52` | Figma bitmap, cover | `/public/images/figma/patient-hero.png` |
| Banner images 1/2/3 | `143:1194`, `143:1226`, `143:1255` | Selected image-node exports | `/public/images/figma/home-banner-01-source.png`, `/public/images/figma/home-banner-02-source.png`, `/public/images/figma/home-banner-03-source.png` |
| Banner 1 eyebrow / CTA | `143:1198`, `143:1208` | `14px` / `16px` SVG | `/public/images/figma/home-icons/banner-01-eyebrow.svg`, `/public/images/figma/home-icons/banner-01-action.svg` |
| Banner 2 eyebrow | `143:1230` | `14px` SVG | `/public/images/figma/home-icons/banner-02-eyebrow.svg` |
| Banner 3 assurance check | `143:1283` | `20px` SVG | `/public/images/figma/home-icons/banner-03-check.svg` |
| Global care artwork | `143:842` | `100% 103.918%` at `0px -0.5px` | `/public/images/figma/home-global-care-source.png` |
| Partner logo matrix | `143:854` | Complete Figma group `3546 x 472px`, with 24px loop spacing; no baked-in fade | `/public/images/figma/partners-track.webp` |
| Partner logo mobile viewport | `143:854` | Same group crop, `1440 x 472px`; no baked-in fade | `/public/images/figma/partners-mobile-track.webp` |
| Patient story image | `143:218` | Figma image, `154.11% 100%` at `-127.992px 0px` | `/public/images/figma/patient-story.png` |
| Shanghai hospital image | `143:681` | Figma image, `126.6% 100%` at `-70.681px 0.172px` | `/public/images/figma/hospital-shanghai-design.png` |
| Beijing hospital image | `143:688` | Figma image, `133.4% 100%` at `-80.805px 0px` | `/public/images/figma/hospital-beijing-design.png` |
| Guangzhou hospital image | `143:695` | Figma image, `168.881% 126.408%` at `-84.373px -0.369px` | `/public/images/figma/hospital-guangzhou-design.jpg` |
| Huaxi hospital image | `143:702` | Figma image, `224.452% 166.86%` at `-178.054px 0px` | `/public/images/figma/hospital-huaxi-design.png` |
| Team portraits | `143:423`, `143:430`, `143:437`, `143:444` | Source crop values in `HomeView.vue` | `/public/images/figma/team-medical-steward.png`, `/public/images/figma/team-interpreter.png`, `/public/images/figma/team-advisor.png`, `/public/images/figma/team-coordinator.png` |
| Expert portraits | `143:729`, `143:754`, `143:779`, `143:804` | Source crop/flip values in `HomeView.vue` | `/public/images/figma/expert-wu-yilong-source.png`, `/public/images/figma/expert-shao-zhimin-source.png`, `/public/images/figma/expert-zhang-junting-source.png`, `/public/images/figma/expert-li-jin-source.png` |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| Hero carousel | Figma source frames above | arrows, dots, timed advance; hover pauses | `7000ms`, `0.55s` opacity/scale settle | same arrows/dots; balanced heading wrap; readable background wash; no autoplay for reduced motion |
| China advantages story | Octagos left-pinned/right-scrolling language | page scroll | sticky rail remains within `143:128` section; cards reveal `0.62s` | natural card list |
| Partner marquee | Octagos continuous horizontal movement | centered source matrix, continuous loop, hover pause | `55s` linear loop across four `1440px` copies; the source matrix stays centered on the viewport and the track pauses on hover | same centered track at `100vw` on mobile; disabled for reduced motion |
| Section reveal | Octagos restrained section transitions | viewport entry | opacity + `translateY(22px)` + blur, `0.62s` cubic-bezier; no layout drift | static visible content when motion is reduced |

## Verification

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/home/2026-09-28/figma-1440.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/home/2026-09-28/local-1440.png`; full-page `1440 x 8806px`, every section height equals the Figma source.
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/home/2026-09-28/local-390.png`; `390px`, no horizontal overflow or broken image. There is no independent Figma mobile frame.
- Hero state evidence: `docs/figma-verification/home/2026-09-29/figma-banner-{1,2,3}.png`, `local-banner-{1,2,3,4}-{1440,390}.png`, `state-qa.json`. Independent Banner references omit the shared Header and consultation assistant; those are intentionally visible on the complete page.
- Interaction evidence: `scripts/home-interaction-qa.cjs` passed routes, consultation open/Escape close, expert tab data states and fallback, 7-second autoplay, reduced-motion no-autoplay, and mobile overflow. `scripts/home-state-qa.cjs` passed all four slide states at 1440/390.
- Chart evidence: `scripts/home-chart-qa.cjs` passed nonblank ECharts canvas and overflow at 1440/768/390/320 with both motion settings.
- Verification run: `2026-09-29`
- Remaining differences: none

## Latest Audit

### Continuous China-care process (2026-10-01)

- Figma source frame: `来华就医流程`, node `143:3691`.
- The authored process is implemented as one continuous right-hand content stack with one sticky left rail. The existing homepage advantage frame `143:128` is the source baseline for `01 认知`; the current authored process source frames are `143:3692` (`02 评估`), `143:3954` (`03 信任`), and `143:3722` (`04 行动`). The parent flow frame is `143:3691`.
- Desktop source geometry copied from Dev Mode: the parent content width is `1216px`; the rail group `143:3723` is `220 x 650px` at `left:132px` (the rail's 1440px-frame x coordinate); the right content column `143:3707`/`143:3730` is `802px` wide at `right:112px`, placing it at `x=526px` in the `1440px` frame. The stage backgrounds use `#F5F6F7` across the full viewport.
- The rail's vertical dashed child is `143:3726`/`143:3727`, `245 x 8px`, rotated `90deg` (one direction is mirrored), with `4px` dashed border and the source gradient; the active number child `143:3728` is a `1:1` circle with `20px` solid `rgba(30,58,95,.10)` border, `#1E3A5F` fill, and `62px` source radius. The Vue rail preserves the `120px` content diameter plus `20px` border (`160px` rendered outer diameter), including the source stroke's `20px` outward extension (`margin-left:-20px`), and positions the rail group at `x=132px` while keeping the content column at `x=526px`.
- Stage baselines: `01` uses `1440 x 1208px`, `96px` vertical padding, a `389 x 280px` two-column card grid with `24px` gaps; `02` uses the authored `754px` frame with `80px` vertical padding; `03` uses the authored `1148px` frame with `96px` vertical padding; `04` uses the authored disease-card frame with `300px` cards, `24px` padding/radius, `32px` icons, `24px` titles, and `16px / 24px` body text.
- The four process stages are joined directly with no inter-stage margin, so the `#F5F6F7` source background remains continuous. The left rail uses the source repeating dashed pattern with a vertical mask/gradient that fades at both ends; the mobile rail uses the same treatment at its compact scale.
- Stage state is derived from the right stack's top edge crossing the desktop reading pivot. The rail number and label therefore remain fixed while scrolling, changing in order `01 认知` -> `02 评估` -> `03 信任` -> `04 行动`. On mobile the rail is released into a compact top status bar and the stack becomes a normal readable list.
- `02` buttons use the exported Figma icon assets and the authored gradient/outline treatment. The secondary `生成可行性报告` link contains only the document icon and text in the source hierarchy (no arrow). `03` FAQ rows remain independently expandable with the first row open in the source resting state. `04` uses the six exported Figma disease icons from `docs/figma-source/diseases/dev-styles-2026-09-29.css`.
- Evidence: `docs/figma-verification/home/2026-10-01-process/desktop-full.png`, `desktop-stage-{1,2,3,4}.png`, `mobile-stage-{1,2,3,4}.png`, `mobile-full.png`, and `geometry.json`. `scripts/home-process-qa.cjs` checks all four scroll states, the desktop sticky top edge, rail circle/line/label coordinates, four source-frame heights, right-column placement, and mobile overflow.

- 2026-09-29: `audit-home-source.mjs` passed all 1103 main-frame nodes; three alternate Banner HTML/text-style exports and exact image/icon source IDs are recorded. `home-style-audit.cjs` found zero section text-style differences. Final full-page screenshot comparison ratio is `0.0125029178` at pixel threshold `0.15`, excluding antialiasing; this is a diagnostic rasterization measure, not a substitute for visual review. Desktop geometry is `1440 x 8806px`, matching the source exactly; mobile has no overflow or broken assets. `vue-tsc -b`, direct Vite production compilation, and `git diff --check` passed. Full-site `pnpm run build` is still blocked by missing `/tmp` verification screenshot files referenced by other page specs, not by the homepage.
- 2026-09-24: Re-read the complete Dev Mode HTML/CSS source after expanding the code panel; verified all twelve section node IDs, authored desktop heights, source assets, carousel timing, reveal motion, and mobile overflow evidence.

## 2026-10-28 desktop source refresh

- Scope: desktop only, per current user instruction; mobile source is frozen.
- Live source: `1523:31` (1440 × 754), IAB session `01a0bebd-b6f9-7fd3-bf5a-b79501589b80`, browser `3`, tab `1`, verified 2026-10-28T16:10:40Z through `scripts/figma-connect.mjs`.
- The long page and existing separate states are unchanged by the native full-file comparison. The separate first screen has 89 current nodes, all cross-checked through Layers and copied from Dev Mode before integration.
- Parameter files / full mapping / static HTML: `docs/figma-source/home/revision-2026-10-28/hero/`, date `2026-10-28`. Build lock is at its parent. New logo `2326:8518` is the selected Figma 2× crop, compressed to WebP, not a replacement logo.
- Runtime mapping: `1523:33` → `HomeHeroSection`; `1523:75` → `PatientHeader`; `1524:26` → header hover/focus submenu; `1523:119` → body-teleported fixed assistant at right 24 / bottom 24, 158 × 44. Descendants render through `HomeSourceNode`; every ID has a concrete ownership entry.
- Green design annotations: cards/FAQ initially collapsed; blue detail links appear on hover/focus only; non-action cards have no hover treatment. These instructions override the expanded example state in static frames.
- Existing API/report generation remains unchanged. Assistant dispatches the existing consultation event. Specialty menu points to the existing disease service route; categories without designed destinations remain non-navigating.
- Status: verified desktop; source locks and eight current QA groups passed; mobile deferred by user.
