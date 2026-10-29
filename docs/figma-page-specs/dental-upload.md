# 牙科 · 上传影像资料

- Route: `/dental` → 步骤03
- Figma frame: `04寰宇云医 - 牙科 - 上传影像资料`
- Node ID: `2294:8037`
- Source baseline HTML: `docs/figma-source/dental-revision-2026-10-28/upload/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/dental-revision-2026-10-28/upload/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/dental-revision-2026-10-28/assets-2026-10-28.json`
- Source extraction run: 2026-10-28；官方原生导出、完整Layers及逐节点Dev Mode交叉核对；各状态共198节点。
- Source SHA256: `915e3f7a3fe7a34c50b40de5f3885c55d15419eaad4b844851292527eed1f583`；baseline `huanyu-2026-10-29.fig`
- Current source comparison: `artifacts/figma-source-gate/latest-dental.json`；当前官方导出`huanyu-current-2026-10-29.fig`，源比较状态 unchanged。
- Live connection evidence: current-session `iab` / `figma-connect.mjs`；Design/Layers/Dev Mode验证。
- Desktop frame: upload 1440.000×1740.000
- Mobile frame: deferred by user; mobile design freeze remains in effect
- Status: verified (desktop; mobile deferred by user) — 2026-10-28

## Layer Mapping

上传区直接展示当前Figma三张照片示例；“照片示例”是行内说明，不能额外打开自编弹窗。预算、到访日期和其他说明由原生控件叠加在对应源框内，输入后隐藏原占位。JPG/PNG/PDF，单份≤10MB，最多5份；至少1份有效文件才能提交。上传文件名、失败提示、重试、提交中和成功状态均可见。

每个源目录均有逐节点`native-inventory`、`native-parameters`、`ui-layers`、`layers-crosscheck`、`dev-mode`、`node-to-code`、`source-tree`和HTML/CSS；13帧总源锁为`baseline-lock-2026-10-28.json`。完整映射按每个Node ID保存在JSON中。

| Node ID | Parent | Concrete owner | Exact source geometry |
| --- | --- | --- | --- |
| `2294:8053` | `2294:8047` | `HomeSourceNode.vue` `[data-figma-node="2294:8053"]` | 918.000×66.000; x261.000, y96.000 |
| `2294:8073` | `2294:8072` | `HomeSourceNode.vue` `[data-figma-node="2294:8073"]` | 918.000×166.000; x0.000, y0.000 |
| `2294:8078` | `2294:8077` | `HomeSourceNode.vue` `[data-figma-node="2294:8078"]` | 140.000×140.000; x0.000, y0.000 |
| `2294:8084` | `2294:8083` | `HomeSourceNode.vue` `[data-figma-node="2294:8084"]` | 56.000×14.000; x0.000, y0.000 |
| `2294:8093` | `2294:8090` | `HomeSourceNode.vue` `[data-figma-node="2294:8093"]` | 447.000×52.000; x0.000, y26.000 |
| `2294:8099` | `2294:8096` | `HomeSourceNode.vue` `[data-figma-node="2294:8099"]` | 447.000×52.000; x0.000, y26.000 |
| `2294:8111` | `2294:8108` | `HomeSourceNode.vue` `[data-figma-node="2294:8111"]` | 918.000×98.000; x0.000, y32.000 |
| `2294:8114` | `2294:8047` | `HomeSourceNode.vue` `[data-figma-node="2294:8114"]` | 216.000×48.000; x612.000, y680.000 |

## Typography

字体、字号、字重、行高、颜色、富文本run及行基线均使用本状态`dev-mode-2026-10-28.json`和`native-parameters-2026-10-28.json`。文字是DOM，保留Figma原始换行和小数基线，不以图片或截图反推样式。

## Components And Spacing

页面由`DentalDesktopFlow.vue → DentalSourceCanvas.vue → HomeSourceNode.vue`渲染；详情由`DentalDoctorSourceDialog.vue → HomeSourceNode.vue`渲染。几何、间距、圆角、描边、阴影、图片裁切来自上述锁定源。短屏以视口内滚动保持正文可达。

## Assets

| Asset | Exact Node ID | Project path |
| --- | --- | --- |
| Group 623 | `2294:8079` | `/public/images/figma/dental-revision/node-2294-8079.svg` |
| image | `2294:8105` | `/public/images/figma/dental-revision/node-2294-8105.svg` |
| Icon | `2294:8160` | `/public/images/figma/dental-revision/node-2294-8160.svg` |
| Icon | `2294:8166` | `/public/images/figma/dental-revision/node-2294-8166.svg` |
| Icon | `2294:8171` | `/public/images/figma/dental-revision/node-2294-8171.svg` |
| Icon | `2294:8203` | `/public/images/figma/dental-revision/node-2294-8203.svg` |
| Icon | `2294:8227` | `/public/images/figma/dental-revision/node-2294-8227.svg` |
| source asset | `2294:8040` | `/public/images/figma/dental-revision/image-95a7534f58ff374efc9bc43e522f01d1513d25a0.webp` |

完整125项资源由同源manifest和哈希逐项核验；图片压缩为WebP，图标使用精确透明SVG。

## Prototype And Motion

沿用`POST /api/dental-assessments` multipart契约；项目、预算、日期、说明、文件和意向医生传入接口。提交中及成功后阻止重复提交；重试复用requestId；隔离HTTP桩验证失败/重试及幂等，未向正式系统写入测试病例。

保留180ms按钮反馈，aria-live提示提交进度/错误。 reduced-motion关闭过渡，内容即时可读；不改变Figma静止布局。

## Verification
- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/upload-reference.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-dental-2026-10-28/visual/upload-local.png`
- Local mobile: deferred by user; this verification covers desktop only
- Visual evidence: `artifacts/figma-dental-2026-10-28/visual/qa.json`；生产preview `artifacts/figma-dental-2026-10-28/production/visual/qa.json`；状态：upload。DPR2、1440px源宽；nMAE和pixelmatch均须<1%。
- Behavior evidence: `artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`、`artifacts/figma-dental-2026-10-28/production/behavior/behavior-qa.json`；1024×600、1440×900、1920×1080。
- Full-content evidence: 治疗流程01–06、保障十项、机构八图除实际640px滚动视口外，另以完整源面板高度截取内部DOM核验。
- Source audit: `scripts/audit-dental-revision.mjs`及`scripts/audit-doctors-revision.mjs`；只接受当前13帧、1358节点、125资源及代码修改后的证据。
- Remaining differences: none
- Verification run: 2026-10-28（本地桌面开发及生产preview；未部署外网）
