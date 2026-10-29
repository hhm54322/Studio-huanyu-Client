# 牙科医生详情 · 患者评价

- Route: `/dental` → 医生详情 → 患者评价
- Figma frame: `患者评价`
- Node ID: `231:1421`
- Source baseline HTML: `docs/figma-source/dental-revision-2026-10-28/reviews/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/dental-revision-2026-10-28/reviews/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/dental-revision-2026-10-28/assets-2026-10-28.json`
- Source extraction run: 2026-10-28；官方原生导出、完整Layers及逐节点Dev Mode交叉核对；各状态共86节点。
- Source SHA256: `915e3f7a3fe7a34c50b40de5f3885c55d15419eaad4b844851292527eed1f583`；baseline `huanyu-2026-10-29.fig`
- Current source comparison: `artifacts/figma-source-gate/latest-dental.json`；当前官方导出`huanyu-current-2026-10-29.fig`，源比较状态 unchanged。
- Live connection evidence: current-session `iab` / `figma-connect.mjs`；Design/Layers/Dev Mode验证。
- Desktop frame: reviews 1440.000×756.000
- Mobile frame: deferred by user; mobile design freeze remains in effect
- Status: verified (desktop; mobile deferred by user) — 2026-10-28

## Layer Mapping

帧ID沿用231:1421，但当前内部节点、医生和Tab均以新版记录为准，不能因ID未变沿用旧参数。保留源三条评价、评分、来源与日期；第三条完整内容可滚动到达。透明裁切视口不把灰色蒙版绘制到页面上。

每个源目录均有逐节点`native-inventory`、`native-parameters`、`ui-layers`、`layers-crosscheck`、`dev-mode`、`node-to-code`、`source-tree`和HTML/CSS；13帧总源锁为`baseline-lock-2026-10-28.json`。完整映射按每个Node ID保存在JSON中。

| Node ID | Parent | Concrete owner | Exact source geometry |
| --- | --- | --- | --- |
| `231:1421` | `source-root` | `DentalDoctorSourceDialog.vue` `[data-figma-node="231:1421"]` | 1440.000×756.000; x33318.000, y4666.000 |
| `231:1424` | `231:1423` | `DentalDoctorSourceDialog.vue` `.dental-source-dialog__clip[data-figma-node="231:1424"]` | 896.000×640.000; x272.000, y51.000 |
| `231:1425` | `231:1423` | `HomeSourceNode.vue` `[data-figma-node="231:1425"]` | 896.000×654.000; x272.000, y51.000 |
| `231:1426` | `231:1425` | `HomeSourceNode.vue` `[data-figma-node="231:1426"]` | 36.000×36.000; x844.000, y16.000 |
| `231:1432` | `231:1431` | `HomeSourceNode.vue` `[data-figma-node="231:1432"]` | 130.000×32.000; x0.000, y0.000 |
| `2294:8000` | `2294:7999` | `HomeSourceNode.vue` `[data-figma-node="2294:8000"]` | 54.000×18.000; x0.000, y0.000 |
| `2294:8014` | `2294:8013` | `HomeSourceNode.vue` `[data-figma-node="2294:8014"]` | 108.000×26.000; x251.000, y0.000 |
| `231:1461` | `231:1460` | `HomeSourceNode.vue` `[data-figma-node="231:1461"]` | 12.000×10.000; x0.000, y0.000 |
| `231:1465` | `231:1458` | `HomeSourceNode.vue` `[data-figma-node="231:1465"]` | 784.000×14.000; x24.000, y80.000 |
| `231:1501` | `231:1500` | `HomeSourceNode.vue` `[data-figma-node="231:1501"]` | 269.000×14.000; x0.000, y0.000 |

## Typography

字体、字号、字重、行高、颜色、富文本run及行基线均使用本状态`dev-mode-2026-10-28.json`和`native-parameters-2026-10-28.json`。文字是DOM，保留Figma原始换行和小数基线，不以图片或截图反推样式。

## Components And Spacing

页面由`DentalDesktopFlow.vue → DentalSourceCanvas.vue → HomeSourceNode.vue`渲染；详情由`DentalDoctorSourceDialog.vue → HomeSourceNode.vue`渲染。几何、间距、圆角、描边、阴影、图片裁切来自上述锁定源。短屏以视口内滚动保持正文可达。

## Assets

| Asset | Exact Node ID | Project path |
| --- | --- | --- |
| Icon | `231:1427` | `/public/images/figma/dental-revision/node-231-1427.svg` |
| Icon | `2294:8004` | `/public/images/figma/dental-revision/node-2294-8004.svg` |
| Frame | `2294:8008` | `/public/images/figma/dental-revision/node-2294-8008.svg` |
| source asset | `2294:7995` | `/public/images/figma/dental-revision/image-3a358e16a710d3ace711509d018e54023d2a9577.webp` |
| source asset | `2294:7996` | `/public/images/figma/dental-revision/image-3d917ce08391a294490b64fe755d5643e23f6093.webp` |

完整125项资源由同源manifest和哈希逐项核验；图片压缩为WebP，图标使用精确透明SVG。

## Prototype And Motion

与医生详情共用五Tab、关闭、键盘及焦点/滚动恢复；滚动到底可读最后评价。

切换240ms仅opacity；评价正文不做位移。 reduced-motion关闭过渡，内容即时可读；不改变Figma静止布局。

## Verification
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/reviews-reference.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/reviews-local.png`
- Local mobile: deferred by user; this verification covers desktop only
- Visual evidence: `artifacts/figma-dental-2026-10-28/visual/qa.json`；生产preview `artifacts/figma-dental-2026-10-28/production/visual/qa.json`；状态：reviews。DPR2、1440px源宽；nMAE和pixelmatch均须<1%。
- Behavior evidence: `artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`、`artifacts/figma-dental-2026-10-28/production/behavior/behavior-qa.json`；1024×600、1440×900、1920×1080。
- Full-content evidence: 治疗流程01–06、保障十项、机构八图除实际640px滚动视口外，另以完整源面板高度截取内部DOM核验。
- Source audit: `scripts/audit-dental-revision.mjs`及`scripts/audit-doctors-revision.mjs`；只接受当前13帧、1358节点、125资源及代码修改后的证据。
- Remaining differences: none
- Verification run: 2026-10-28（本地桌面开发及生产preview；未部署外网）
