# 牙科医生详情 · 治疗流程（06）

- Route: `/dental` → 医生详情 → 治疗流程
- Figma frame: `06治疗流程`、`06治疗流程`
- Node ID: `2294:7487`、`2294:7818`
- Source baseline HTML: `docs/figma-source/dental-revision-2026-10-28/treatment-scroll/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/dental-revision-2026-10-28/treatment-scroll/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/dental-revision-2026-10-28/assets-2026-10-28.json`
- Source extraction run: 2026-10-28；官方原生导出、完整Layers及逐节点Dev Mode交叉核对；各状态共169节点。
- Source SHA256: `915e3f7a3fe7a34c50b40de5f3885c55d15419eaad4b844851292527eed1f583`；baseline `huanyu-2026-10-29.fig`
- Current source comparison: `artifacts/figma-source-gate/latest-dental.json`；当前官方导出`huanyu-current-2026-10-29.fig`，源比较状态 unchanged。
- Live connection evidence: current-session `iab` / `figma-connect.mjs`；Design/Layers/Dev Mode验证。
- Desktop frame: treatment-scroll 1440.000×756.000；treatment 1440.000×1191.000
- Mobile frame: deferred by user; mobile design freeze remains in effect
- Status: verified (desktop; mobile deferred by user) — 2026-10-28

## Layer Mapping

两份同名源有明确分工：2294:7487提供896×640滚动视口、标题、五个Tab和初始01–03行；2294:7818提供01–06完整流程。完整稿04–06子节点接入实际视口，正文总高度使用完整源参数，不另建落地页。滚动依次展示远程咨询、面诊评估/报价、一期手术、临时修复、愈合期、二期修复。

每个源目录均有逐节点`native-inventory`、`native-parameters`、`ui-layers`、`layers-crosscheck`、`dev-mode`、`node-to-code`、`source-tree`和HTML/CSS；13帧总源锁为`baseline-lock-2026-10-28.json`。完整映射按每个Node ID保存在JSON中。

| Node ID | Parent | Concrete owner | Exact source geometry |
| --- | --- | --- | --- |
| `2294:7487` | `source-root` | `DentalDoctorSourceDialog.vue` `[data-figma-node="2294:7487"]` | 1440.000×756.000; x33325.000, y3014.000 |
| `2294:7490` | `2294:7489` | `DentalDoctorSourceDialog.vue` `.dental-source-dialog__clip[data-figma-node="2294:7490"]` | 896.000×640.000; x272.000, y58.000 |
| `2294:7491` | `2294:7489` | `HomeSourceNode.vue` `[data-figma-node="2294:7491"]` | 896.000×733.000; x272.000, y58.000 |
| `2294:7526` | `2294:7495` | `HomeSourceNode.vue` `[data-figma-node="2294:7526"]` | 832.000×480.000; x0.000, y189.000 |
| `2294:7818` | `source-root` | 完整内容源，合入 `DentalDoctorSourceDialog.vue` `[data-figma-node="2294:7487"]` | 1440.000×1191.000; x34877.000, y3014.000 |
| `2294:7821` | `2294:7820` | 完整高度由 `[data-figma-node="2294:7491"]` 消费 | 896.000×1111.000; x272.000, y40.000 |
| `2294:7856` | `2294:7825` | 04–06 子树与完整高度由 `[data-figma-node="2294:7526"]` 消费 | 832.000×858.000; x0.000, y189.000 |
| `2294:7887` | `2294:7856` | `HomeSourceNode.vue` `[data-figma-node="2294:7887"]` | 832.000×126.000; x0.000, y480.000 |
| `2294:7896` | `2294:7856` | `HomeSourceNode.vue` `[data-figma-node="2294:7896"]` | 832.000×126.000; x0.000, y606.000 |
| `2294:7905` | `2294:7856` | `HomeSourceNode.vue` `[data-figma-node="2294:7905"]` | 832.000×126.000; x0.000, y732.000 |
| `2294:7912` | `2294:7910` | `HomeSourceNode.vue` `[data-figma-node="2294:7912"]` | 768.000×14.000; x16.000, y44.000 |

## Typography

字体、字号、字重、行高、颜色、富文本run及行基线均使用本状态`dev-mode-2026-10-28.json`和`native-parameters-2026-10-28.json`。文字是DOM，保留Figma原始换行和小数基线，不以图片或截图反推样式。

## Components And Spacing

页面由`DentalDesktopFlow.vue → DentalSourceCanvas.vue → HomeSourceNode.vue`渲染；详情由`DentalDoctorSourceDialog.vue → HomeSourceNode.vue`渲染。几何、间距、圆角、描边、阴影、图片裁切来自上述锁定源。短屏以视口内滚动保持正文可达。

## Assets

| Asset | Exact Node ID | Project path |
| --- | --- | --- |
| Icon | `2294:7823` | `/public/images/figma/dental-revision/node-2294-7823.svg` |
| Icon | `2294:7839` | `/public/images/figma/dental-revision/node-2294-7839.svg` |
| Frame | `2294:7843` | `/public/images/figma/dental-revision/node-2294-7843.svg` |
| source asset | `2294:7830` | `/public/images/figma/dental-revision/image-3a358e16a710d3ace711509d018e54023d2a9577.webp` |
| source asset | `2294:7831` | `/public/images/figma/dental-revision/image-3d917ce08391a294490b64fe755d5643e23f6093.webp` |
| Icon | `2294:7493` | `/public/images/figma/dental-revision/node-2294-7493.svg` |
| Icon | `2294:7509` | `/public/images/figma/dental-revision/node-2294-7509.svg` |
| Frame | `2294:7513` | `/public/images/figma/dental-revision/node-2294-7513.svg` |

完整125项资源由同源manifest和哈希逐项核验；图片压缩为WebP，图标使用精确透明SVG。

## Prototype And Motion

三个桌面宽度均实际滚动到底并检查2294:7912完整可读；另以完整稿核验全部01–06拼接后的静态内容。

滚动为原生连续滚动，Tab切换240ms opacity；不通过翻页或截图模拟滚动。 reduced-motion关闭过渡，内容即时可读；不改变Figma静止布局。

## Verification
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/treatment-scroll-reference.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/treatment-scroll-local.png`
- Local mobile: deferred by user; this verification covers desktop only
- Visual evidence: `artifacts/figma-dental-2026-10-28/visual/qa.json`；生产preview `artifacts/figma-dental-2026-10-28/production/visual/qa.json`；状态：treatment-scroll, treatment-full。DPR2、1440px源宽；nMAE和pixelmatch均须<1%。
- Behavior evidence: `artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`、`artifacts/figma-dental-2026-10-28/production/behavior/behavior-qa.json`；1024×600、1440×900、1920×1080。
- Full-content evidence: 治疗流程01–06、保障十项、机构八图除实际640px滚动视口外，另以完整源面板高度截取内部DOM核验。
- Source audit: `scripts/audit-dental-revision.mjs`及`scripts/audit-doctors-revision.mjs`；只接受当前13帧、1358节点、125资源及代码修改后的证据。
- Remaining differences: none
- Verification run: 2026-10-28（本地桌面开发及生产preview；未部署外网）
