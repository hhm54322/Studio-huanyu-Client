# 牙科服务 · 项目选择与城市医生匹配

- Route: `/dental` → 步骤01、02
- Figma frame: `04寰宇云医 - 牙科 - 选择牙科项目`、`04寰宇云医 - 牙科 - 城市与医生匹配`、`Container`
- Node ID: `2294:8240`、`2294:6971`、`2323:8392`
- Source baseline HTML: `docs/figma-source/dental-revision-2026-10-28/project/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/dental-revision-2026-10-28/project/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/dental-revision-2026-10-28/assets-2026-10-28.json`
- Source extraction run: 2026-10-28；官方原生导出、完整Layers及逐节点Dev Mode交叉核对；各状态共531节点。
- Source SHA256: `915e3f7a3fe7a34c50b40de5f3885c55d15419eaad4b844851292527eed1f583`；baseline `huanyu-2026-10-29.fig`
- Current source comparison: `artifacts/figma-source-gate/latest-dental.json`；当前官方导出`huanyu-current-2026-10-29.fig`，源比较状态 unchanged。
- Live connection evidence: current-session `iab` / `figma-connect.mjs`；Design/Layers/Dev Mode验证。
- Desktop frame: project 1440.000×1156.000；matching 1440.000×2052.000；doctor-card 389.333×496.000
- Mobile frame: deferred by user; mobile design freeze remains in effect
- Status: verified (desktop; mobile deferred by user) — 2026-10-28

## Layer Mapping

项目01只显示当前源稿的种植牙、美白、贴面三卡，整卡独立展开收起。步骤02展示谭兆林，六个筛选条件需点击筛选后生效，支持重置、价格/经验/评分排序和空态。独立卡 `2323:8392` 的25个DOM/SVG owner实际提供卡片壳、医生信息、简介、按钮；`matching-card-consumption-2026-10-28.json`逐节点记录对应关系。匹配主帧拥有评分/价格、案例预览、机构入口及按钮行位置，保留其准确坐标。按钮分别打开医生简介、案例标签、机构弹窗，或携带意向医生进入上传页。

每个源目录均有逐节点`native-inventory`、`native-parameters`、`ui-layers`、`layers-crosscheck`、`dev-mode`、`node-to-code`、`source-tree`和HTML/CSS；13帧总源锁为`baseline-lock-2026-10-28.json`。完整映射按每个Node ID保存在JSON中。

| Node ID | Parent | Concrete owner | Exact source geometry |
| --- | --- | --- | --- |
| `2294:8256` | `2294:8250` | `HomeSourceNode.vue` `[data-figma-node="2294:8256"]` | 918.000×66.000; x261.000, y96.000 |
| `2294:8281` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="2294:8281"]` | 389.333×446.000; x0.000, y0.000 |
| `2294:8302` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="2294:8302"]` | 389.333×290.000; x413.333, y0.000 |
| `2294:8319` | `2294:8280` | `HomeSourceNode.vue` `[data-figma-node="2294:8319"]` | 389.333×286.000; x826.667, y0.000 |
| `2294:8336` | `2294:8274` | `HomeSourceNode.vue` `[data-figma-node="2294:8336"]` | 236.000×48.000; x481.000, y398.000 |
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
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/project-reference.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/project-local.png`
- Local mobile: deferred by user; this verification covers desktop only
- Visual evidence: `artifacts/figma-dental-2026-10-28/visual/qa.json`；生产preview `artifacts/figma-dental-2026-10-28/production/visual/qa.json`；状态：project, matching。DPR2、1440px源宽；nMAE和pixelmatch均须<1%。
- Behavior evidence: `artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`、`artifacts/figma-dental-2026-10-28/production/behavior/behavior-qa.json`；1024×600、1440×900、1920×1080。
- Full-content evidence: 治疗流程01–06、保障十项、机构八图除实际640px滚动视口外，另以完整源面板高度截取内部DOM核验。
- Source audit: `scripts/audit-dental-revision.mjs`及`scripts/audit-doctors-revision.mjs`；只接受当前13帧、1358节点、125资源及代码修改后的证据。
- Remaining differences: none
- Verification run: 2026-10-28（本地桌面开发及生产preview；未部署外网）
