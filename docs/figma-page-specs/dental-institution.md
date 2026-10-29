# 牙科 · 上海牙科机构详情

- Route: `/dental` → 02 → 上海牙科机构
- Figma frame: `上海牙科机构`、`上海牙科机构`
- Node ID: `2294:7631`、`2294:7691`
- Source baseline HTML: `docs/figma-source/dental-revision-2026-10-28/institution-scroll/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/dental-revision-2026-10-28/institution-scroll/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/dental-revision-2026-10-28/assets-2026-10-28.json`
- Source extraction run: 2026-10-28；官方原生导出、完整Layers及逐节点Dev Mode交叉核对；各状态共44节点。
- Source SHA256: `915e3f7a3fe7a34c50b40de5f3885c55d15419eaad4b844851292527eed1f583`；baseline `huanyu-2026-10-29.fig`
- Current source comparison: `artifacts/figma-source-gate/latest-dental.json`；当前官方导出`huanyu-current-2026-10-29.fig`，源比较状态 unchanged。
- Live connection evidence: current-session `iab` / `figma-connect.mjs`；Design/Layers/Dev Mode验证。
- Desktop frame: institution-scroll 1440.000×756.000；institution 1440.000×853.000
- Mobile frame: deferred by user; mobile design freeze remains in effect
- Status: verified (desktop; mobile deferred by user) — 2026-10-28

## Layer Mapping

2294:7631提供896×640实际滚动视口；2294:7691提供773.3333px高完整面板和八张机构照片。视口中的图库替换为完整稿2294:7742的八图子树，保留说明、精确间距和原裁切。不能只展示六张首屏照片。

每个源目录均有逐节点`native-inventory`、`native-parameters`、`ui-layers`、`layers-crosscheck`、`dev-mode`、`node-to-code`、`source-tree`和HTML/CSS；13帧总源锁为`baseline-lock-2026-10-28.json`。完整映射按每个Node ID保存在JSON中。

| Node ID | Parent | Concrete owner | Exact source geometry |
| --- | --- | --- | --- |
| `2294:7631` | `source-root` | `DentalDoctorSourceDialog.vue` `[data-figma-node="2294:7631"]` | 1440.000×756.000; x33325.000, y6469.000 |
| `2294:7634` | `2294:7633` | `DentalDoctorSourceDialog.vue` `.dental-source-dialog__clip[data-figma-node="2294:7634"]` | 896.000×640.000; x272.000, y58.000 |
| `2294:7635` | `2294:7633` | `HomeSourceNode.vue` `[data-figma-node="2294:7635"]` | 896.000×640.000; x272.000, y58.000 |
| `2294:7636` | `2294:7635` | `HomeSourceNode.vue` `[data-figma-node="2294:7636"]` | 36.000×36.000; x844.000, y16.000 |
| `2294:7642` | `2294:7641` | `HomeSourceNode.vue` `[data-figma-node="2294:7642"]` | 194.000×32.000; x0.000, y0.000 |
| `2294:7682` | `2294:7681` | `HomeSourceNode.vue` `[data-figma-node="2294:7682"]` | 848.000×72.000; x0.000, y28.000 |
| `2294:7683` | `2294:7639` | `HomeSourceNode.vue` `[data-figma-node="2294:7683"]` | 848.000×577.333; x0.000, y132.000 |
| `2294:7691` | `source-root` | 完整图库源，合入 `DentalDoctorSourceDialog.vue` `[data-figma-node="2294:7631"]` | 1440.000×853.000; x34888.000, y6469.000 |
| `2294:7694` | `2294:7693` | 完整高度由 `[data-figma-node="2294:7635"]` 消费 | 896.000×773.333; x272.000, y40.000 |
| `2294:7742` | `2294:7698` | 八图子树由 `[data-figma-node="2294:7683"]` 消费 | 848.000×577.333; x0.000, y132.000 |
| `2294:7743` | `2294:7742` | `HomeSourceNode.vue` `[data-figma-node="2294:7743"]` | 266.667×177.778; x0.000, y24.000 |
| `2294:7750` | `2294:7742` | `HomeSourceNode.vue` `[data-figma-node="2294:7750"]` | 266.667×177.778; x290.667, y399.556 |

## Typography

字体、字号、字重、行高、颜色、富文本run及行基线均使用本状态`dev-mode-2026-10-28.json`和`native-parameters-2026-10-28.json`。文字是DOM，保留Figma原始换行和小数基线，不以图片或截图反推样式。

## Components And Spacing

页面由`DentalDesktopFlow.vue → DentalSourceCanvas.vue → HomeSourceNode.vue`渲染；详情由`DentalDoctorSourceDialog.vue → HomeSourceNode.vue`渲染。几何、间距、圆角、描边、阴影、图片裁切来自上述锁定源。短屏以视口内滚动保持正文可达。

## Assets

| Asset | Exact Node ID | Project path |
| --- | --- | --- |
| Icon | `2294:7696` | `/public/images/figma/dental-revision/node-2294-7696.svg` |
| 86f8c982447e4cf7a3f7d550b6c1b306 1 | `2294:7743` | `/public/images/figma/dental-revision/selected-image-2294-7743.png` |
| a5800cad5fce38559b8cbb157cc86c6c 1 | `2294:7744` | `/public/images/figma/dental-revision/selected-image-2294-7744.png` |
| 98072f298e3740b7b1acb000abde8a32 1 | `2294:7745` | `/public/images/figma/dental-revision/selected-image-2294-7745.png` |
| 98072f298e3740b7b1acb000abde8a32 2 | `2294:7746` | `/public/images/figma/dental-revision/selected-image-2294-7746.png` |
| 98072f298e3740b7b1acb000abde8a32 5 | `2294:7747` | `/public/images/figma/dental-revision/selected-image-2294-7747.png` |
| 98072f298e3740b7b1acb000abde8a32 3 | `2294:7748` | `/public/images/figma/dental-revision/selected-image-2294-7748.png` |
| 98072f298e3740b7b1acb000abde8a32 4 | `2294:7749` | `/public/images/figma/dental-revision/selected-image-2294-7749.png` |

完整125项资源由同源manifest和哈希逐项核验；图片压缩为WebP，图标使用精确透明SVG。

## Prototype And Motion

Esc、关闭按钮、遮罩均可退出；焦点及页面滚动恢复；1024/1440/1920宽实际滚动到第八张照片2294:7750。

弹窗320ms淡入轻抬16px、遮罩250ms淡入；图库原生内部滚动。 reduced-motion关闭过渡，内容即时可读；不改变Figma静止布局。

## Verification
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/institution-reference.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/institution-local.png`
- Local mobile: deferred by user; this verification covers desktop only
- Visual evidence: `artifacts/figma-dental-2026-10-28/visual/qa.json`；生产preview `artifacts/figma-dental-2026-10-28/production/visual/qa.json`；状态：institution, institution-full。DPR2、1440px源宽；nMAE和pixelmatch均须<1%。
- Behavior evidence: `artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`、`artifacts/figma-dental-2026-10-28/production/behavior/behavior-qa.json`；1024×600、1440×900、1920×1080。
- Full-content evidence: 治疗流程01–06、保障十项、机构八图除实际640px滚动视口外，另以完整源面板高度截取内部DOM核验。
- Source audit: `scripts/audit-dental-revision.mjs`及`scripts/audit-doctors-revision.mjs`；只接受当前13帧、1358节点、125资源及代码修改后的证据。
- Remaining differences: none
- Verification run: 2026-10-28（本地桌面开发及生产preview；未部署外网）
