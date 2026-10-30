# 牙科服务 · 项目选择与城市医生匹配

## 2026-10-30 案例集显示修正（当前发布）

- 案例预览不再使用统一的 Figma 示例图。卡片案例区、案例入口和详情「案例集」标签只读取该医生自己的 `caseStudies` 数据；没有真实授权案例时全部隐藏，详情显示空态。
- 当前六位医生资料均未提供真实授权案例，因此六张卡片均为无案例布局（卡片高度 338px），不会再出现内容完全相同的案例图。
- 若后续补充某位医生的真实案例，卡片只显示该医生的标题与图片，点击后直接打开该医生详情的「案例集」标签；其他医生不受影响。
- 公网版本：`20261030150141`。验证证据：`artifacts/deployment/20261030150141/online/dental-assets.json`、`dental-matching-loaded.png`、`dental-profile-loaded.png`。六位医生卡片均为338px，案例预览与案例入口数量为0，详情五个标签及图片请求无错误，列表截图与同一发布构建 NMAE `0.00843%`。

## 2026-10-30 牙科医生资料接入

### 案例数据条件修正

- 用户明确：医生详情有案例时才显示卡片案例区。卡片和详情统一使用该医生的 `caseStudies` 集合；历史 `cases` 数字和 Figma 示例图都不是可发布案例。当前原始资料未提供真实授权案例，六位医生该集合为空。
- 卡片仍以 `2294:7061` 的 Auto Layout 为准。隐藏 `2294:7088` 后移除134px内容及相邻24px间距：卡片496→338px，机构入口376→218px，按钮行430→272px；卡片宽度、padding24、radius24、列距/行距24保持源值。混合有/无案例的行按该行最高卡片定位下一行，空筛选保持有限高度。
- 有案例时，卡片预览使用该集合首个案例的标题及前两张图片，详情案例标签展示同一集合；不回退到设计稿示例。详情容器/标题/图片行继续使用源节点 `2294:7375/7376/7377/7378/7379` 的 Design参数。

### 同日卡片设计回归修复

- 用户指出评分价格块和案例图片区偏离源稿。本次恢复 `2294:7080–7085` 的评分/价格层级，并按医生详情数据控制 `2294:7088–7092` 案例预览子树。医生姓名、头像、专业信息和价格金额仍取归档 DOCX。
- 价格框 `84×60`、radius12、#FFF；星级沿用源卡静态内容。金额沿用 `2294:7085` 的蓝色 #2563EB、14px/600 富文本 run，单位沿用 #4B5563、14px/400；不再替换为“参考价”文字框。参考价格说明保留在详情和悬停说明。
- 有真实授权案例时，案例框使用源稿的 `341.33334×134`、radius16、padding16、标题14/14/500、两张80×80图片、gap8；当前六位医生详情均无案例，整棵子树隐藏并将机构入口和按钮行按同一Auto Layout间距上移，避免展示 Figma 示例图片或空白案例框。Figma 示例资源的来源、参数和哈希仅留在 `docs/source/dental-physicians/card-assets.json`，未作为生产图片使用。
- `DentalSourceCanvas` 向 `HomeSourceNode` 传入已知画布scale，文字基线按该比例计算，避免 `offsetHeight` 的整数舍入影响14px文字。其他调用方继续保持原有默认计算；缩放变化后重新对齐。
- 数字从业年限补充“经验”；已有“专家”或“经验”的文案不重复追加。只有详情数据存在真实案例时，案例预览整块才可点击并进入对应医生的案例标签；无真实个人案例的详情显示原空态，卡片不显示案例区。
- 本任务初次连接成功，后续现有IAB源页返回 `ERR_SSL_PROTOCOL_ERROR`。当前参数沿用本任务已取得的官方导出 `(23).fig`，不声称收尾时获取了新导出；源截图和源节点均与用户本次图1对应。
- 当前截图与交互证据重新生成到 `artifacts/dental-physicians-2026-10-30/development/` 和 `production/`；专门检查评分区、无案例条件下的卡片重排及六位医生详情、筛选和报价。
- 本次生产构建：评分/价格区 NMAE 0.62168%、pixelmatch 0.53943%；hero NMAE 0.75918%、footer NMAE 0.38745%。案例预览项记录为 `omitted`，因为当前详情没有真实授权案例；这些指标仅对应指定静态区域。
- 上一发布版本 `20261030142104` 的案例示例显示修复已由本次 `20261030150141` 覆盖；当前公网证据见本页顶部的“案例集显示修正（当前发布）”。

- 用户授权：两份牙科医生 DOCX 归档，六位深圳医生使用现有 Figma 卡片和详情样式；本批仅桌面端内容接入。
- 当前连接：`artifacts/dental-physicians-2026-10-30/connection.json`，current-session IAB，Design/Layers/Inspect 可读。
- 当前官方导出：`/Users/hhm/Downloads/寰宇云医 (23).fig`；实施前执行 `figma-source-gate.cjs --page dental --current ...`，13 个牙科源帧和共享依赖全部 unchanged。全文件其他页差异不在本批修改范围。
- 原始数据/资源：`docs/source/dental-physicians/`；提取数据 `src/data/dentalPhysicians.json`，六个稳定 ID 为 101–106；头像和源文档哈希见该文件。
- 状态：文档接入及案例显示回归已完成桌面验证，开发环境、生产构建预览和公网验证均通过；当前版本 `20261030150141`。下文旧截图只记录历史样例基线，不作为当前案例显示依据。
- 官方导出时间：2026-10-30T10:17:45.695Z；SHA256 `c4dbeb0db24b090ebfac2997d15957416d4e7597cc0920833dcb2d026f985983`。收尾时 IAB 源页返回 `ERR_SSL_PROTOCOL_ERROR`，未重新导出；最终源比较使用本次任务已成功取得的官方导出，不声称收尾时完成在线复核。

### 本批验证结果

- 核验脚本：`scripts/dental-physicians-qa.cjs`；开发与生产证据分别为 `artifacts/dental-physicians-2026-10-30/development/behavior-qa.json` 和 `production/behavior-qa.json`。
- 六位医生逐一验证完整简介、资质、专业领域、履历、五个标签及对应机构资料；长内容在弹窗内可滚到底；关闭、Escape、遮罩、焦点和页面滚动恢复通过。
- 15组筛选、4种排序和1024/1280/1440/1920桌面宽度通过，无横向溢出或破图。六位医生的报价均正确带入意向医生；接口采用本地拦截核验失败重试和重复提交保护，未创建真实业务资料。
- 首屏NMAE：开发0.72195%、生产0.72191%；页脚NMAE均0.36000%。卡片继承389.33334×496、24px行列距；新文档替换内容不宣称与旧样例整页像素一致。
- 当前资料门禁：`scripts/audit-dental-physicians.mjs`；由`audit-dental-revision.mjs`完成13帧源锁检查后调用，校验归档哈希、运行数据/头像、代码哈希和两套当前QA。历史单医生样例审计分支仍保留。
- 发布构建复核：`artifacts/deployment/20261030124327/production-dental/behavior-qa.json`；公网核验：同目录 `online/smoke.json`、`online/dental-assets.json`。公网六位医生全部五个详情标签、图标加载、筛选、报价入口和关闭后的焦点/滚动恢复通过。已人工查看 `dental-profile-loaded.png` 与 `dental-matching-loaded.png`；公网医生列表对同一发布构建的 NMAE 为 0.02344%（部署一致性，非新文案对旧 Figma 样例的整页误差）。

### 实施前参数与映射

所有基础节点继续使用原始 `native-parameters`、`dev-mode`、`node-to-code` 和锁定 `source-tree`，不覆写基线。动态医生树为每个继承节点记录 `data-figma-source-node` 和医生 ID 后缀。

| 源节点 | 接入位置与准确参数 | 文档授权内容变化 |
| --- | --- | --- |
| `2294:6971/6972/6973/6981/7214` | `DentalDesktopFlow > DentalSourceCanvas`，1440px 页面，460px hero，456px footer | 根据实际卡片行数调整列表区、下一步和页脚位置，保持源间距 |
| `2294:7060` | 三列1216px，列距/行距24px | 六张卡，两行；筛选后按结果重新排布 |
| `2294:7061` / `2323:8392` | 重复完整卡片树，389.33334×496，padding24，radius24，#F5F6F7 | 用 DOCX 姓名/职称/深圳/专科/经验/擅长/参考价格；评分保留Figma组件静态内容，未写入医生真实评分字段 |
| `2294:7063/7068/7070/7075/7079` | 60×60头像，radius16；姓名18/18、600；职称14/16；元信息14/20 | 图片来自对应医生原始DOCX，不借用样例医生；卡片长文省略，完整内容放详情 |
| `2294:7086/7087/7088/7089/7090` | 擅长341.33334×72；有案例时显示白色案例预览框341.33334×134、radius16、padding16，两张80×80、radius16图片、gap8 | 案例预览由详情数据控制；当前六位医生无真实授权案例，隐藏该子树并重排后续机构/按钮行，不把 Figma 示例图误归因给医生 |
| `2294:7093/7099/7101` | 机构入口122×30；详情168.61334×42；报价164.720×42 | 机构入口绑定该医生；报价携带该医生进入原上传流程 |
| `2294:7754/7758/7762/7779/7789/7791` | 医生详情896×640，radius24，padding32，正文832宽；头像60；五Tab | 按实际医生显示简介、4项资质、完整专业领域和原始履历，超出在弹窗内滚动 |
| `2294:7790/7793/7794/7796` | 正文16/24、#4B5563；小标题16/16、600、#0F162E；资质行gap8，行距12，使用同源资质图标 | 文案高度由实际DOM内容决定，不裁剪资料 |
| `2294:7526/7856`、`2294:7914/7420` | 源治疗流程01–06和十项保障的完整子树 | 复用与文档一致的流程/保障，替换当前医生身份，不改变源布局 |
| `2294:7337`、`231:1425/1458` | 同源案例空态/评价卡，panel896，评价内容块832、padding24、radius16 | 无真实案例不显示示例图；评价数量及原文来自各医生文档，不显示样例128条或评分 |
| `2294:7635/7639/7642/7681/7683` | 机构panel896×640、padding32、标题32/32、正文16/24 | 对应机构名称、简介、环境来自文档；未提供照片，不沿用上海机构照片 |


- Route: `/dental` → 步骤01、02
- Figma frame: `04寰宇云医 - 牙科 - 选择牙科项目`、`04寰宇云医 - 牙科 - 城市与医生匹配`、`Container`
- Node ID: `2294:8240`、`2294:6971`、`2323:8392`
- Source baseline HTML: `docs/figma-source/dental-revision-2026-10-28/project/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/dental-revision-2026-10-28/project/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/dental-revision-2026-10-28/assets-2026-10-28.json`
- Source extraction run: 2026-10-30；官方原生导出、完整Layers及逐节点Dev Mode交叉核对；13个状态帧共1358节点，另接入完整项目选择帧307节点。
- Source SHA256: `915e3f7a3fe7a34c50b40de5f3885c55d15419eaad4b844851292527eed1f583`；完整项目源 `231:88`。
- Current source comparison: `artifacts/figma-source-gate/latest-dental.json`；本次官方导出 `/Users/hhm/Downloads/寰宇云医 (23).fig`，13个源状态完整节点比较均 unchanged。
- Live connection evidence: current-session `iab` / `figma-connect.mjs`；Design/Layers/Dev Mode验证。
- Desktop frame: project first-screen 1440.000×1156.000；complete project selection 1440.000×2384.000；matching 1440.000×2052.000；doctor-card 389.333×496.000
- Mobile frame: deferred by user; mobile design freeze remains in effect
- Status: verified (desktop document integration; mobile deferred by user) — 2026-10-30

## Layer Mapping

项目01使用当前首屏前三卡，并按完整源帧 `231:88` 接回隐形正畸、全瓷牙冠、洁牙/牙周、根管治疗、儿童齿科，共8个项目；所有卡片整卡独立展开收起，动态行高与源网格保持一致。步骤02接入六位深圳医生，六个筛选条件需点击筛选后生效，支持重置、价格/经验/评分排序和空态。独立卡 `2323:8392` 的25个DOM/SVG owner实际提供卡片壳、医生信息、简介、按钮；`matching-card-consumption-2026-10-28.json`逐节点记录对应关系。匹配主帧拥有评分/价格、可选案例预览、机构入口及按钮行位置；只有详情中存在真实授权案例时才渲染案例子树与入口。按钮分别打开医生简介、机构弹窗，或携带意向医生进入上传页；有案例的医生另有案例标签入口。完整源公共页脚 `231:276` 原样接入，下一步按钮为普通文档内容，距页脚保留源稿96px间距，不使用fixed/sticky。

每个源目录均有逐节点`native-inventory`、`native-parameters`、`ui-layers`、`layers-crosscheck`、`dev-mode`、`node-to-code`、`source-tree`和HTML/CSS；13帧总源锁为`baseline-lock-2026-10-28.json`。完整映射按每个Node ID保存在JSON中。

| Node ID | Parent | Concrete owner | Exact source geometry |
| --- | --- | --- | --- |
| `2294:8256` | `2294:8250` | `HomeSourceNode.vue` `[data-figma-node="2294:8256"]` | 918.000×66.000; x261.000, y96.000 |
| `2294:8281` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="2294:8281"]` | 389.333×446.000; x0.000, y0.000 |
| `2294:8302` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="2294:8302"]` | 389.333×290.000; x413.333, y0.000 |
| `2294:8319` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="2294:8319"]` | 389.333×286.000; x826.667, y0.000 |
| `2294:8336` | `2294:8274` | `HomeSourceNode.vue` `[data-figma-node="2294:8336"]` | 236.000×48.000; grid bottom + 48px; ordinary document flow |
| `231:184` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="231:184"]` | 389.333×286.000; complete source row 2 |
| `231:201` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="231:201"]` | 389.333×286.000; complete source row 2 |
| `231:217` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="231:217"]` | 389.333×286.000; complete source row 2 |
| `231:235` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="231:235"]` | 389.333×286.000; complete source row 3 |
| `231:253` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="231:253"]` | 389.333×286.000; complete source row 3 |
| `231:276` | `231:88` | `HomeSourceNode.vue` `[data-figma-node="231:276"]` | 1440.000×456.000; public footer |
| `2294:7006` | `2294:7005` | `HomeSourceNode.vue` `[data-figma-node="2294:7006"]` | 220.000×42.000; x0.000, y0.000 |
| `2294:7036` | `2294:7005` | `HomeSourceNode.vue` `[data-figma-node="2294:7036"]` | 104.000×42.000; x236.000, y56.000 |
| `2294:7040` | `2294:7005` | `HomeSourceNode.vue` `[data-figma-node="2294:7040"]` | 106.000×42.000; x356.000, y56.000 |
| `2294:7047` | `2294:7046` | `HomeSourceNode.vue` `[data-figma-node="2294:7047"]` | 82.000×32.000; x0.000, y0.000 |
| `2294:7053` | `2294:7046` | `HomeSourceNode.vue` `[data-figma-node="2294:7053"]` | 92.000×32.000; x282.000, y0.000 |
| `2294:7061` | `2294:7060` | `HomeSourceNode.vue` `[data-figma-node="2294:7061"]` | 389.333×496.000; x0.000, y0.000 |
| `2323:8392` | `source-root` | `HomeSourceNode.vue` `[data-figma-node="2294:7061"][data-figma-source-node="2323:8392"]` | 389.333×496.000; x16928.000, y5927.000 |
| `2294:7088` | `2294:7061` | `HomeSourceNode.vue` `[data-figma-node="2294:7088"]` | 341.333×134.000; x24.000, y218.000 |
| `2294:7093` | `2294:7061` | `HomeSourceNode.vue` `[data-figma-node="2294:7093"]` | 122.000×30.000; x243.333, y376.000 |
| `2294:7099` | `2294:7098` | `HomeSourceNode.vue` `[data-figma-node="2294:7099"]` | 168.613×42.000; x0.000, y0.000 |
| `2294:7101` | `2294:7098` | `HomeSourceNode.vue` `[data-figma-node="2294:7101"]` | 164.720×42.000; x176.613, y0.000 |
| `2294:7209` | `2294:6981` | `HomeSourceNode.vue` `[data-figma-node="2294:7209"]` | 221.000×48.000; x609.500, y992.000 |

## Typography

字体、字号、字重、行高、颜色、富文本run及行基线均使用本状态`dev-mode-2026-10-28.json`和`native-parameters-2026-10-28.json`。文字是DOM，保留Figma原始换行和小数基线，不以图片或截图反推样式。

## Components And Spacing

页面由`DentalDesktopFlow.vue → DentalSourceCanvas.vue → HomeSourceNode.vue`渲染；详情由`DentalDoctorSourceDialog.vue → HomeSourceNode.vue`渲染。几何、间距、圆角、描边、阴影、图片裁切来自上述锁定源。短屏以视口内滚动保持正文可达。

## Assets

| Asset | Exact Node ID | Project path |
| --- | --- | --- |
| Frame | `2294:8282` | `/public/images/figma/dental-revision/node-2294-8282.svg` |
| Icon | `2294:8295` | `/public/images/figma/dental-revision/node-2294-8295.svg` |
| Frame | `2294:8303` | `/public/images/figma/dental-revision/node-2294-8303.svg` |
| Icon | `2294:8317` | `/public/images/figma/dental-revision/node-2294-8317.svg` |
| Frame | `2294:8320` | `/public/images/figma/dental-revision/node-2294-8320.svg` |
| Icon | `2294:8334` | `/public/images/figma/dental-revision/node-2294-8334.svg` |
| Icon | `2294:8338` | `/public/images/figma/dental-revision/node-2294-8338.svg` |
| Icon | `2294:8351` | `/public/images/figma/dental-revision/node-2294-8351.svg` |

完整125项资源由同源manifest和哈希逐项核验；图片压缩为WebP，图标使用精确透明SVG。

## Prototype And Motion

三步骤来回切换保留项目、筛选、资料和表单；整卡Enter/Space可用；仅一个排序激活；医生详情五Tab和机构入口可达。

项目各自独立展开，420ms cubic-bezier(.22,1,.36,1)高度过渡；边框切换补偿源坐标，摘要不跳动。hover使用180–240ms颜色/阴影反馈。 reduced-motion关闭过渡，内容即时可读；不改变Figma静止布局。

## Verification

### Historical Static Baseline — 2026-10-28
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/project-reference.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/project-local.png`
- Local mobile: deferred by user; this verification covers desktop only
- Visual evidence: `artifacts/figma-dental-2026-10-28/visual/qa.json`；生产preview `artifacts/figma-dental-2026-10-28/production/visual/qa.json`；状态：project, matching。DPR2、1440px源宽；nMAE和pixelmatch均须<1%。
- Behavior evidence: `artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`、`artifacts/figma-dental-2026-10-28/production/behavior/behavior-qa.json`；1024×600、1440×900、1920×1080。
- Full-content evidence: 治疗流程01–06、保障十项、机构八图除实际640px滚动视口外，另以完整源面板高度截取内部DOM核验。
- Source audit: `scripts/audit-dental-revision.mjs`及`scripts/audit-doctors-revision.mjs`；只接受当前13帧、1358节点、125资源及代码修改后的证据。
- Remaining differences: none
- Verification run: 2026-10-28（本地桌面开发及生产preview；未部署外网）
