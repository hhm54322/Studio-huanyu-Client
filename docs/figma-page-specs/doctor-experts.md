# 权威专家详情（桌面）

- Route: `/` → 权威专家团队卡片
- Figma frame: `周莉莉/柳光宇/陈疾忤/徐宇` 的专业擅长、专业任职、科研和跨境医疗服务状态
- Node ID: `1432:7741`、`1432:7801`、`1432:7861`、`1432:7917` 等下表15个独立状态
- Source baseline HTML: `docs/figma-source/home/experts/zhou-li-li-01/baseline-2026-10-19.html`
- Source baseline CSS: `docs/figma-source/home/experts/zhou-li-li-01/dev-styles-2026-10-19.css`
- Source asset manifest: `docs/figma-source/home/assets-2026-10-19.json`
- Source extraction run: 2026-10-19 全量 Layers/逐节点 Dev Mode；2026-10-28 以当前官方源重新核对，15状态布局、文案、样式、图片填充均无变更
- Desktop frame: 1440×756；对话框896px宽，各状态高度使用各自源参数
- Mobile frame: deferred by user; design not finalized, no mobile development or acceptance in this batch
- Status: verified (desktop only; mobile deferred by user)

## Layer Mapping

每一行目录均包含完整的 `native-inventory`、`native-parameters`、`ui-layers`、`dev-mode`、`layers-crosscheck`、`node-to-code`、`source-tree`、`dialog-model`、HTML/CSS静态基线（日期2026-10-19）。逐节点映射而非将同级节点合并成范围标签；总源锁为 `docs/figma-source/home/baseline-lock-2026-10-19.json`。

| 专家 | 状态源 Node ID（按 Tab 顺序） | 源目录（home/experts/） | Vue/DOM |
| --- | --- | --- | --- |
| 徐宇 | `1432:7917`、`1432:8267`、`1432:8688` | `xu-yu-01`、`xu-yu-02`、`xu-yu-03` | `HomeExpertDialog.vue > HomeSourceNode.vue`；每节点独立 `data-figma-node` |
| 周莉莉 | `1432:7741`、`1432:7980`、`1432:8329`、`1432:8558` | `zhou-li-li-01`、`zhou-li-li-02`、`zhou-li-li-03`、`zhou-li-li-04` | 同上，使用本人源树 |
| 柳光宇 | `1432:7801`、`1432:8082`、`1432:8386`、`1455:672` | `liu-guang-yu-01`、`liu-guang-yu-02`、`liu-guang-yu-03`、`liu-guang-yu-04` | 同上，使用本人源树 |
| 陈疾忤 | `1432:7861`、`1432:8194`、`1432:8443`、`1432:8625` | `chen-ji-wu-01`、`chen-ji-wu-02`、`chen-ji-wu-03`、`chen-ji-wu-04` | 同上，使用本人源树 |

原生帧/遮罩由dialog/overlay负责，设计演示页背景不复制到网页；SVG子节点映射到其精确SVG owner，其他可见子节点由独立DOM负责。完整原生导出复核结果：`artifacts/figma-doctors-2026-10-20/revision-check.json`。

## Typography

文字按各节点复制的Dev CSS/native文字样式和行布局执行，不额外统一字重、字号或段距；详见各状态 `dev-mode` / `native-parameters`。

## Components And Spacing

| 元素 | Node ID | W×H | 参数来源 |
| --- | --- | --- | --- |
| 周莉莉专业擅长面板 | `1432:7744` | 896×650 | 白底、24px圆角、32px内边距，原始Dev CSS |
| 周莉莉任职面板 | `1432:7983` | 896×690 | 原始Dev CSS；不把其他状态强制拉成690px |
| 柳光宇任职面板 | `1432:8085` | 896×754 | 原始Dev CSS；短屏采用外层滚动使全部内容可达 |

## Assets

| 资源 | Node ID | 映射 |
| --- | --- | --- |
| 周莉莉头像 | `1432:7752` | `home/assets-2026-10-19.json` 对应节点原图；保留源裁切、比例和镜像 |
| 周莉莉关闭图标 | `1432:7746` | 同源manifest精确SVG；不替换为图标库 |

其余每一资产的Node ID/路径详见同一manifest，所有图片均压缩，未使用整页截图。

## Prototype And Motion

| 交互 | 来源 | 参数/行为 |
| --- | --- | --- |
| 卡片/Tab | Figma各独立状态 | 打开本人专业擅长；Tab更新本人完整源树；徐宇只有3项，不补不存在的科研页 |
| 键盘/关闭 | 网页可访问性 | 左右/Home/End；Tab焦点循环；Esc/关闭/遮罩；恢复触发焦点及页面原滚动位置 |
| 入场/内容切换 | 实际复看Octagos滚动、内容切换后做适配 | 桌面面板320ms淡入并轻抬16px；Tab内容240ms仅opacity；不改Figma静止几何 |
| 减少动态 | prefers-reduced-motion | 关闭上述动画，所有内容保持直接可读 |

移动端既有实现保留，不在本批修改或验收。

## Verification

- Figma reference screenshot: `artifacts/figma-2026-10-19/experts/zhou-li-li-01-figma.png`
- Local desktop screenshot: `artifacts/figma-doctors-2026-10-20/zhou-li-li-01-1440-local.png`
- Local mobile: deferred by user; not included in this batch
- 静态基线复跑：15桌面状态nMAE 0.1367%–0.4354%，全部映射owner存在，无横向溢出。独立截图和交互证据：`artifacts/figma-doctors-2026-10-20/qa.json`。
- 动效/短屏：`artifacts/figma-doctors-2026-10-20/expert-motion-qa.json`；1024×600、1440×754、1920×1080，15状态全部内容可达，焦点/滚动恢复及入场、Tab淡入、快速切换、reduced-motion通过。
- Source audit: `scripts/audit-doctors-revision.mjs`，检查首页15个专家状态及牙科五个医生Tab、完整稿/滚动视口稿、机构图库和独立医生卡的源锁、逐节点覆盖、资源、截图阈值和证据时效，已接入`audit:figma`。当前证据位于 `artifacts/figma-home-2026-10-28/experts/qa.json` 与 `artifacts/figma-dental-2026-10-28/{visual,behavior,production/visual,production/behavior}/`。
- Remaining differences: none
- Verification run: 2026-10-28
