# 牙科医生详情 · 在华就诊保障（08）

- Route: `/dental` → 医生详情 → 在华就诊保障服务（10）
- Figma frame: `08在华就医保障服务`、`08在华就医保障服务`
- Node ID: `2294:7557`、`2294:7380`
- Source baseline HTML: `docs/figma-source/dental-revision-2026-10-28/services-scroll/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/dental-revision-2026-10-28/services-scroll/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/dental-revision-2026-10-28/assets-2026-10-28.json`
- Source extraction run: 2026-10-28；官方原生导出、完整Layers及逐节点Dev Mode交叉核对；各状态共215节点。
- Source SHA256: `915e3f7a3fe7a34c50b40de5f3885c55d15419eaad4b844851292527eed1f583`；baseline `huanyu-2026-10-29.fig`
- Current source comparison: `artifacts/figma-source-gate/latest-dental.json`；当前官方导出`huanyu-current-2026-10-29.fig`，源比较状态 unchanged。
- Live connection evidence: current-session `iab` / `figma-connect.mjs`；Design/Layers/Dev Mode验证。
- Desktop frame: services-scroll 1440.000×756.000；services 1440.000×893.000
- Mobile frame: deferred by user; mobile design freeze remains in effect
- Status: verified (desktop; mobile deferred by user) — 2026-10-28

## Layer Mapping

2294:7557提供896×640视口及当前五Tab；2294:7380提供十项保障卡完整内容。实际渲染复制完整稿2294:7420的十卡子树到视口正文，不只保留首屏可见卡。医疗协助、就医保障、全进口材料、失败赔付、五年服务、24h助手、接送、机票、住宿、签证全部可达。

每个源目录均有逐节点`native-inventory`、`native-parameters`、`ui-layers`、`layers-crosscheck`、`dev-mode`、`node-to-code`、`source-tree`和HTML/CSS；13帧总源锁为`baseline-lock-2026-10-28.json`。完整映射按每个Node ID保存在JSON中。

| Node ID | Parent | Concrete owner | Exact source geometry |
| --- | --- | --- | --- |
| `2294:7557` | `source-root` | `DentalDoctorSourceDialog.vue` `[data-figma-node="2294:7557"]` | 1440.000×756.000; x33325.000, y5492.000 |
| `2294:7560` | `2294:7559` | `DentalDoctorSourceDialog.vue` `.dental-source-dialog__clip[data-figma-node="2294:7560"]` | 896.000×640.000; x272.000, y58.000 |
| `2294:7561` | `2294:7559` | `HomeSourceNode.vue` `[data-figma-node="2294:7561"]` | 896.000×813.000; x272.000, y58.000 |
| `2294:7914` | `2294:7565` | `HomeSourceNode.vue` `[data-figma-node="2294:7914"]` | 832.000×560.000; x0.000, y189.000 |
| `2294:7380` | `source-root` | 完整内容源，合入 `DentalDoctorSourceDialog.vue` `[data-figma-node="2294:7557"]` | 1440.000×893.000; x34877.000, y5492.000 |
| `2294:7420` | `2294:7387` | 十卡子树由 `[data-figma-node="2294:7914"]` 消费 | 832.000×560.000; x0.000, y189.000 |
| `2294:7421` | `2294:7420` | `HomeSourceNode.vue` `[data-figma-node="2294:7421"]` | 832.000×544.000; x0.000, y16.000 |
| `2294:7486` | `2294:7484` | `HomeSourceNode.vue` `[data-figma-node="2294:7486"]` | 156.000×22.000; x0.000, y24.000 |

## Typography

字体、字号、字重、行高、颜色、富文本run及行基线均使用本状态`dev-mode-2026-10-28.json`和`native-parameters-2026-10-28.json`。文字是DOM，保留Figma原始换行和小数基线，不以图片或截图反推样式。

## Components And Spacing

页面由`DentalDesktopFlow.vue → DentalSourceCanvas.vue → HomeSourceNode.vue`渲染；详情由`DentalDoctorSourceDialog.vue → HomeSourceNode.vue`渲染。几何、间距、圆角、描边、阴影、图片裁切来自上述锁定源。短屏以视口内滚动保持正文可达。

## Assets

| Asset | Exact Node ID | Project path |
| --- | --- | --- |
| Icon | `2294:7385` | `/public/images/figma/dental-revision/node-2294-7385.svg` |
| Icon | `2294:7401` | `/public/images/figma/dental-revision/node-2294-7401.svg` |
| Frame | `2294:7405` | `/public/images/figma/dental-revision/node-2294-7405.svg` |
| Icon | `2294:7423` | `/public/images/figma/dental-revision/node-2294-7423.svg` |
| Icon | `2294:7429` | `/public/images/figma/dental-revision/node-2294-7429.svg` |
| Frame | `2294:7437` | `/public/images/figma/dental-revision/node-2294-7437.svg` |
| Vector | `2294:7446` | `/public/images/figma/dental-revision/node-2294-7446.svg` |
| Frame | `2294:7451` | `/public/images/figma/dental-revision/node-2294-7451.svg` |

完整125项资源由同源manifest和哈希逐项核验；图片压缩为WebP，图标使用精确透明SVG。

## Prototype And Motion

三个桌面宽度滚动到底检查第十项2294:7486；完整稿另做完整内容截图比较。

原生内部滚动；Tab仅opacity切换，不改卡片几何。 reduced-motion关闭过渡，内容即时可读；不改变Figma静止布局。

## Verification
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/services-scroll-reference.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/services-scroll-local.png`
- Local mobile: deferred by user; this verification covers desktop only
- Visual evidence: `artifacts/figma-dental-2026-10-28/visual/qa.json`；生产preview `artifacts/figma-dental-2026-10-28/production/visual/qa.json`；状态：services-scroll, services-full。DPR2、1440px源宽；nMAE和pixelmatch均须<1%。
- Behavior evidence: `artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`、`artifacts/figma-dental-2026-10-28/production/behavior/behavior-qa.json`；1024×600、1440×900、1920×1080。
- Full-content evidence: 治疗流程01–06、保障十项、机构八图除实际640px滚动视口外，另以完整源面板高度截取内部DOM核验。
- Source audit: `scripts/audit-dental-revision.mjs`及`scripts/audit-doctors-revision.mjs`；只接受当前13帧、1358节点、125资源及代码修改后的证据。
- Remaining differences: none
- Verification run: 2026-10-28（本地桌面开发及生产preview；未部署外网）
