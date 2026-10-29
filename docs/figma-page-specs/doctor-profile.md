# 牙科医生详情 · 医生简介（05）

- Route: `/dental` → 02 → 查看谭兆林医生详情 → 医生简介
- Figma frame: `05案例集`
- Node ID: `2294:7751`
- Source baseline HTML: `docs/figma-source/dental-revision-2026-10-28/profile/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/dental-revision-2026-10-28/profile/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/dental-revision-2026-10-28/assets-2026-10-28.json`
- Source extraction run: 2026-10-28；官方原生导出、完整Layers及逐节点Dev Mode交叉核对；各状态共69节点。
- Source SHA256: `915e3f7a3fe7a34c50b40de5f3885c55d15419eaad4b844851292527eed1f583`；baseline `huanyu-2026-10-29.fig`
- Current source comparison: `artifacts/figma-source-gate/latest-dental.json`；当前官方导出`huanyu-current-2026-10-29.fig`，源比较状态 unchanged。
- Live connection evidence: current-session `iab` / `figma-connect.mjs`；Design/Layers/Dev Mode验证。
- Desktop frame: profile 1440.000×756.000
- Mobile frame: deferred by user; mobile design freeze remains in effect
- Status: verified (desktop; mobile deferred by user) — 2026-10-28

## Layer Mapping

Figma帧名为“05案例集”，实际选中的首个Tab是医生简介。必须按帧内内容判断用途：医生身份、完整简介及四条资质；其余标签分别进入06治疗流程、07案例集、患者评价、08在华保障。它们是同一医生详情的五个状态，不是独立路由。

每个源目录均有逐节点`native-inventory`、`native-parameters`、`ui-layers`、`layers-crosscheck`、`dev-mode`、`node-to-code`、`source-tree`和HTML/CSS；13帧总源锁为`baseline-lock-2026-10-28.json`。完整映射按每个Node ID保存在JSON中。

| Node ID | Parent | Concrete owner | Exact source geometry |
| --- | --- | --- | --- |
| `2294:7751` | `source-root` | `DentalDoctorSourceDialog.vue` `[data-figma-node="2294:7751"]` | 1440.000×756.000; x33325.000, y2188.000 |
| `2294:7753` | `2294:7751` | `DentalDoctorSourceDialog.vue` `[data-figma-node="2294:7753"]` | 1440.000×756.000; x0.000, y0.000 |
| `2294:7754` | `2294:7753` | `HomeSourceNode.vue` `[data-figma-node="2294:7754"]` | 896.000×640.000; x272.000, y58.000 |
| `2294:7755` | `2294:7754` | `HomeSourceNode.vue` `[data-figma-node="2294:7755"]` | 36.000×36.000; x844.000, y16.000 |
| `2294:7761` | `2294:7760` | `HomeSourceNode.vue` `[data-figma-node="2294:7761"]` | 130.000×32.000; x0.000, y0.000 |
| `2294:7781` | `2294:7780` | `HomeSourceNode.vue` `[data-figma-node="2294:7781"]` | 57.000×26.000; x0.000, y0.000 |
| `2294:7783` | `2294:7780` | `HomeSourceNode.vue` `[data-figma-node="2294:7783"]` | 77.000×26.000; x57.000, y0.000 |
| `2294:7785` | `2294:7780` | `HomeSourceNode.vue` `[data-figma-node="2294:7785"]` | 97.000×26.000; x134.000, y0.000 |
| `2294:7787` | `2294:7780` | `HomeSourceNode.vue` `[data-figma-node="2294:7787"]` | 128.000×26.000; x231.000, y0.000 |
| `2294:7988` | `2294:7780` | `HomeSourceNode.vue` `[data-figma-node="2294:7988"]` | 175.000×26.000; x359.000, y0.000 |
| `2294:7790` | `2294:7789` | `HomeSourceNode.vue` `[data-figma-node="2294:7790"]` | 832.000×72.000; x0.000, y16.000 |
| `2294:7817` | `2294:7812` | `HomeSourceNode.vue` `[data-figma-node="2294:7817"]` | 176.000×24.000; x24.000, y0.000 |

## Typography

字体、字号、字重、行高、颜色、富文本run及行基线均使用本状态`dev-mode-2026-10-28.json`和`native-parameters-2026-10-28.json`。文字是DOM，保留Figma原始换行和小数基线，不以图片或截图反推样式。

## Components And Spacing

页面由`DentalDesktopFlow.vue → DentalSourceCanvas.vue → HomeSourceNode.vue`渲染；详情由`DentalDoctorSourceDialog.vue → HomeSourceNode.vue`渲染。几何、间距、圆角、描边、阴影、图片裁切来自上述锁定源。短屏以视口内滚动保持正文可达。

## Assets

| Asset | Exact Node ID | Project path |
| --- | --- | --- |
| Icon | `2294:7756` | `/public/images/figma/dental-revision/node-2294-7756.svg` |
| Icon | `2294:7772` | `/public/images/figma/dental-revision/node-2294-7772.svg` |
| Frame | `2294:7776` | `/public/images/figma/dental-revision/node-2294-7776.svg` |
| Icon | `2294:7796` | `/public/images/figma/dental-revision/node-2294-7796.svg` |
| Icon | `2294:7802` | `/public/images/figma/dental-revision/node-2294-7802.svg` |
| Icon | `2294:7808` | `/public/images/figma/dental-revision/node-2294-7808.svg` |
| Icon | `2294:7814` | `/public/images/figma/dental-revision/node-2294-7814.svg` |
| source asset | `2294:7763` | `/public/images/figma/dental-revision/image-3a358e16a710d3ace711509d018e54023d2a9577.webp` |

完整125项资源由同源manifest和哈希逐项核验；图片压缩为WebP，图标使用精确透明SVG。

## Prototype And Motion

五Tab左右/Home/End键切换；切换归零内部滚动。Esc、关闭按钮、遮罩退出；焦点锁定并恢复原触发按钮及页面滚动。

弹窗320ms轻抬16px并淡入，遮罩250ms淡入；Tab内容240ms仅opacity，不改变静止尺寸。 reduced-motion关闭过渡，内容即时可读；不改变Figma静止布局。

## Verification
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/profile-reference.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/profile-local.png`
- Local mobile: deferred by user; this verification covers desktop only
- Visual evidence: `artifacts/figma-dental-2026-10-28/visual/qa.json`；生产preview `artifacts/figma-dental-2026-10-28/production/visual/qa.json`；状态：profile。DPR2、1440px源宽；nMAE和pixelmatch均须<1%。
- Behavior evidence: `artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`、`artifacts/figma-dental-2026-10-28/production/behavior/behavior-qa.json`；1024×600、1440×900、1920×1080。
- Full-content evidence: 治疗流程01–06、保障十项、机构八图除实际640px滚动视口外，另以完整源面板高度截取内部DOM核验。
- Source audit: `scripts/audit-dental-revision.mjs`及`scripts/audit-doctors-revision.mjs`；只接受当前13帧、1358节点、125资源及代码修改后的证据。
- Remaining differences: none
- Verification run: 2026-10-28（本地桌面开发及生产preview；未部署外网）
