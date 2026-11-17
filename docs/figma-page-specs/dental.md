> 2026-11-03：用户授权更新公开邮箱/WhatsApp，公共入口参数、源比较及专项截图回归见 [public-contacts.md](../public-contacts.md)。本次不重新声明全页 Figma 验收通过。

# 牙科服务 · 项目选择与城市医生匹配

## 2026-11-16 动画接入与核对（进行中）

- 本会话通过 `scripts/figma-connect.mjs` 成功连接 IAB：2026-11-16T02:39:19Z，Design/Layers/Inspect 均可读；牙科项目选择源节点 `2294:8240` 已在 Dev Mode 打开。此前初始化后过早读取了尚在加载的页面，不能据此判断连接不可用。
- 当前官方源 `/Users/hhm/Downloads/寰宇云医.fig`，导出时间 2026-11-16T02:40:07Z，SHA-256 `303bbc4d0d6df5a749d538a8d3cef2e3b68bb2d36baecaaee7bf83cfa98ec9b4`。针对既有实施基线运行 `figma-source-gate.cjs --page dental`，报告 `artifacts/figma-source-gate/latest-dental.json` 为 changed；三步页面 Header 子树被替换，若干历史详情源节点已移除，尚须核对新节点与具体变化，不能自动接受基线。
- 2026-11-16T03:09Z：已在当前 Figma Inspect 分别读取 Header `3824:8431` 的 42 个节点，逐节点快照位于 `artifacts/dental-animation-20261116/header/live/`；Layers 已核对 Header、Container、Navigation 及大部分一级导航，随后通过调整视口展开完整 42 个节点，已核对 ID、名称与层级并记录映射；页面最终视觉验收尚未完成。
- 用户要求新增的牙齿动画以所提供的在线演示为设计依据，放在顶部图与步骤导航之间；不接入演示左侧文案。演示页当前网络请求返回连接关闭，未取得源码；交互曾观察到扫描、牙齿信息和美白预览。已在本地接入，尚未完成设计门禁或发布。
- 2026-11-16T02:48Z 重新核验当前会话连接及导出，源节点 `2294:8240`，导出 SHA-256 `202397a1358d3ee2be6e5365fbad50ebbd5f362254efd0d2073b0047450c3dcb`。Dev Mode 已确认替换后的 Header `3824:8431` 为 1440×64，原生文件中包含首页、医疗服务、牙科、中国医院等导航；临时节点清单 `artifacts/dental-animation-20261116/current/native-inventory-2026-11-16.json` 为待 Layers 交叉检查的发现记录。顶部图节点 `2294:8243` 与内容区域 `2294:8250` 位于同一 Main Content，步骤位于 `2294:8256`；桌面页面按坐标渲染，插入模块需同步调整后续内容及画布高度。
- 2026-11-16T02:53Z 最新导出 `/Users/hhm/Downloads/寰宇云医 (2).fig`，SHA-256 `c69e41c82153774cd413451859834c1e9df0e8ee48a839155004987b704be811`。原生 Header 对比见 `artifacts/dental-animation-20261116/header/native-header-comparison.json`：旧文字标识被 148×48 图像替换，医疗服务、中国医院增加箭头，导航宽度/横向位置及部分字色、字体有变化。38 组节点仅按同级顺序暂配对，尚须 Layers/Dev Mode 核对；实际导航由 `PatientDesktopNavigation` 消费原 Header 节点，不能将原生数据对照误记为已实现。

### 2026-11-16 current dental page mapping

- Current Figma export `(4).fig`, 2026-11-16T03:21:32Z, SHA256 `7acd3aa3f05cb5d7ab40667c9a2123f96fc6c92f527e181dce093c3416a46c65`; verified IAB connection 03:18:03Z. Baseline comparison shows the project frame header subtree replaced and Body child references updated; other hero/content nodes and dependencies unchanged. Removed old detail frames remain separately unverified.
- All 42 new Header nodes cross-checked by ID, name and level against live Layers (`artifacts/dental-animation-20261116/header/layers-live.json`). Inspect parameters recorded individually in `header/live/<node>.txt`. Mapping identifies existing component owners; visual fidelity remains to be checked.
- The new dental scan is user-requested demonstration content outside the Figma design, inserted in `2294:8242` between hero `2294:8243` and step content `2294:8250`.

| Node | Layer | Parent | Component / element | Inspect record |
| --- | --- | --- | --- | --- |
| `3824:8431` | Header | `2294:8241` | HomeSourceNode: Header | `header/live/3824-8431.txt` |
| `3824:8432` | Container | `3824:8431` | HomeSourceNode: Header container | `header/live/3824-8432.txt` |
| `3824:8433` | 未标题-1 2 | `3824:8432` | HomeSourceNode: logo | `header/live/3824-8433.txt` |
| `3824:8434` | Navigation | `3824:8432` | PatientDesktopNavigation: navigation | `header/live/3824-8434.txt` |
| `3824:8435` | Link:margin | `3824:8434` | PatientDesktopNavigation: consult wrapper | `header/live/3824-8435.txt` |
| `3824:8436` | Link | `3824:8435` | PatientDesktopNavigation: consult button | `header/live/3824-8436.txt` |
| `3824:8437` | Icon | `3824:8436` | PatientDesktopNavigation: consult icon | `header/live/3824-8437.txt` |
| `3824:8438` | Vector | `3824:8437` | PatientDesktopNavigation: consult icon | `header/live/3824-8438.txt` |
| `3824:8439` | Text | `3824:8436` | PatientDesktopNavigation: consult text | `header/live/3824-8439.txt` |
| `3824:8440` | 问阿宁 | `3824:8439` | PatientDesktopNavigation: consult text | `header/live/3824-8440.txt` |
| `3824:8441` | Link | `3824:8434` | PatientDesktopNavigation: home link | `header/live/3824-8441.txt` |
| `3824:8442` | 首页 | `3824:8441` | PatientDesktopNavigation: home text | `header/live/3824-8442.txt` |
| `3824:8443` | Link | `3824:8434` | PatientDesktopNavigation: why China link | `header/live/3824-8443.txt` |
| `3824:8444` | 为什么选择中国 | `3824:8443` | PatientDesktopNavigation: why China text | `header/live/3824-8444.txt` |
| `3824:8445` | Link | `3824:8434` | PatientDesktopNavigation: FAQ link | `header/live/3824-8445.txt` |
| `3824:8446` | 信任与常见问题 | `3824:8445` | PatientDesktopNavigation: FAQ text | `header/live/3824-8446.txt` |
| `3824:8447` | Link | `3824:8434` | PatientDesktopNavigation: service button | `header/live/3824-8447.txt` |
| `3824:8448` | 医疗服务 | `3824:8447` | PatientDesktopNavigation: service text | `header/live/3824-8448.txt` |
| `3824:8449` | Container:margin | `3824:8447` | PatientDesktopNavigation: service arrow | `header/live/3824-8449.txt` |
| `3824:8450` | Vector | `3824:8449` | PatientDesktopNavigation: service arrow | `header/live/3824-8450.txt` |
| `3824:8451` | Link | `3824:8434` | PatientDesktopNavigation: dental link | `header/live/3824-8451.txt` |
| `3824:8452` | 牙科 | `3824:8451` | PatientDesktopNavigation: dental text | `header/live/3824-8452.txt` |
| `3824:8453` | Link | `3824:8434` | PatientDesktopNavigation: hospital button | `header/live/3824-8453.txt` |
| `3824:8454` | 中国医院 | `3824:8453` | PatientDesktopNavigation: hospital text | `header/live/3824-8454.txt` |
| `3824:8455` | Container:margin | `3824:8453` | PatientDesktopNavigation: hospital arrow | `header/live/3824-8455.txt` |
| `3824:8456` | Vector | `3824:8455` | PatientDesktopNavigation: hospital arrow | `header/live/3824-8456.txt` |
| `3824:8457` | Link | `3824:8434` | PatientDesktopNavigation: cases link | `header/live/3824-8457.txt` |
| `3824:8458` | 患者案例 | `3824:8457` | PatientDesktopNavigation: cases text | `header/live/3824-8458.txt` |
| `3824:8459` | Link | `3824:8434` | PatientDesktopNavigation: insurance link | `header/live/3824-8459.txt` |
| `3824:8460` | 保险指南 | `3824:8459` | PatientDesktopNavigation: insurance text | `header/live/3824-8460.txt` |
| `3824:8461` | Link | `3824:8434` | PatientDesktopNavigation: about link | `header/live/3824-8461.txt` |
| `3824:8462` | 关于我们 | `3824:8461` | PatientDesktopNavigation: about text | `header/live/3824-8462.txt` |
| `3824:8463` | Container:margin | `3824:8434` | PatientDesktopNavigation: language margin | `header/live/3824-8463.txt` |
| `3824:8464` | Button | `3824:8463` | PatientDesktopNavigation: language button | `header/live/3824-8464.txt` |
| `3824:8465` | Icon | `3824:8464` | PatientDesktopNavigation: language icon | `header/live/3824-8465.txt` |
| `3824:8466` | Vector | `3824:8465` | PatientDesktopNavigation: language icon | `header/live/3824-8466.txt` |
| `3824:8467` | Vector | `3824:8465` | PatientDesktopNavigation: language icon | `header/live/3824-8467.txt` |
| `3824:8468` | Vector | `3824:8465` | PatientDesktopNavigation: language icon | `header/live/3824-8468.txt` |
| `3824:8469` | Text | `3824:8464` | PatientDesktopNavigation: language flag | `header/live/3824-8469.txt` |
| `3824:8470` | 🇨🇳 | `3824:8469` | PatientDesktopNavigation: language flag | `header/live/3824-8470.txt` |
| `3824:8471` | Text | `3824:8464` | PatientDesktopNavigation: language text | `header/live/3824-8471.txt` |
| `3824:8472` | ZH | `3824:8471` | PatientDesktopNavigation: language text | `header/live/3824-8472.txt` |

### 2026-11-16 本地实现及验证

- `DentalScanShowcase.vue` 按用户演示截图重绘 14 颗牙齿、扫描线、项目切换信息与美白预览；价格与周期引用现有牙科项目，非扫描诊断结果。新增区域位于桌面三个步骤页的顶部图与步骤区之间；随顶部图翻译后的实际高度调整位置，不改变移动端分支。
- 动画在页面离开视口时暂停，支持减少动态效果、键盘选择及开关。五语文案已同步，中文、英语、印尼语、马来语、葡语及 1024/1440/1920 宽度检查通过，见 `artifacts/dental-animation-20261116/qa/qa.json` 和对应截图。
- 生产预览的三步骤、上海筛选及重置、医生详情跳转、上传入口检查通过；类型检查、五语完整性审计和 `vite build` 通过。旧的 `dental-current-behavior-qa.cjs` 仍要求打开已改为独立页面的旧弹窗，不能作为本次通过证据。
- 最终官方源 `(5).fig` 导出于 2026-11-16T03:37:05Z，SHA256 `2af5711dad06601ac9cde1a8a93e3be67b5a1ec0441fa5b53303e09071f76b04`。与本轮 `(4).fig` 比较，三步主帧无新变化；与原实施基线比较仍为 changed（Header 替换及已移除的旧详情源），禁止标记全页 verified。
- 全站 `audit:figma` 未通过：包括牙科历史详情源变化、原截图证据过期，以及其他页面的过期或缺失证据；未绕过这些门禁。原始 Hero 静态对比截图位于 `artifacts/dental-animation-20261116/qa/hero-ref.png` 和 `hero-local.png`；当前 Figma 的 2× 官方导出顶部与生产预览对比：Hero nMAE 0.648%，导航区域 0.676%；截图 `artifacts/dental-animation-20261116/qa/hero-current-figma.png` 和 `hero-local.png`。尚未发布。

### 2026-11-16 牙科医生详情基线复核

- 实际详情页使用 `dental-pages-2026-11-05`，不是 10 月 28 日旧弹窗。旧审计的 11 月 3 日详情源无法作为当前实现基线。使用 `artifacts/home-layout-charts-20261105/current.fig`（2026-11-05，已记录的官方导出，SHA256 `81af68ed54ff56e021156447e9b7826af08fc43ba9046ca8ff5d63737696c4d9`）与 2026-11-16 最新官方导出 `(6).fig` 比对，医生简介、治疗流程、案例集、患者评价、在华保障、滑动状态与案例图七个当前帧均 `unchanged`，无未解析图片、矢量或依赖；详见 `artifacts/dental-animation-20261116/doctor-regression/current-source-comparison.json`。该比较以 11 月 5 日晚的源为基准，未能替代丢失的原始 `(52).fig` 逐字节比较；11 月 5 日记录已有 `(52)` 至后来官方源的逐字段比较，历史证据保留。
- 本地生产预览逐一访问 7 位医生，切换 5 个详情标签、检查内容可见、页面无横向溢出和运行时错误；证据 `artifacts/dental-animation-20261116/doctor-regression/seven-doctors.json`。原 `doctor-brand-update-qa.cjs` 在部分路径耗时过久后手动停止，未声称其通过。全站设计门禁其他旧来源、截图鲜度和未完成的导航视觉比较仍未通过。

### 2026-11-16 原始动画代码适配

- 通过已打开的原演示标签读取实际 SVG、CSS 和脚本，原始抓取保存在本地忽略目录 `artifacts/dental-animation-20261116/original/`。`DentalScanShowcase.vue` 按原 640×520 坐标、14 颗不同形状牙齿、牙龈曲线、扫描速度 215 单位/秒、3400ms 自动轮换、2600ms 展示、6000ms 人工交互停顿、美白闪光及鼠标倾斜实现；文案和参考价格接入现有五语与牙科项目数据。
- 正式预览 5 种语言 × 1024/1440/1920 三种宽度共 15 组，逐颗牙齿的焦点与提示框边界、扫描进度、美白开关、自动轮换、减少动态效果及页面错误检查通过，证据 `artifacts/dental-animation-20261116/qa/final-check.json`。原页及本地截图分别见 `original/card-live.png` 和 `qa/card-exact.png`；页面宽度和扫描进度不同，不能将两张图片直接作为像素级一致证明。
- 最终官方源 `(9).fig` 导出于 2026-11-16T04:36:25Z，SHA256 `f44e1655459c0e29f663f1e09d2431c3f3a90327a24615415ebf4dea1ce05a3e`；按已记录的 11 月 5 日官方源比较，三步主页面及现有 7 个医生详情状态均 unchanged。原演示与本地的 14 个牙齿 SVG 路径、14 个变换和牙龈路径逐项完全一致。步骤加载、切换、失败重试和草稿保留最终生产回归通过（`artifacts/dental-animation-20261116/step-loading-complete/qa.json`）。减少动态效果状态下美白切换仍保持扫描完成状态；五语、三个宽度、所有牙齿的提示框及底部控制在界限内。
- 本地直接 `vite build`、类型检查、i18n 审计通过；项目全站 Figma 审计仍有其他页面过期证据和旧牙科弹窗检查未通过，未对其伪造通过状态，尚未发布。

### 2026-11-16 动画最终状态检查（进行中）

- 原演示原始源码与本地组件在相同 1216px 卡片宽度下做静态截图对照；暂时隐藏扫描线、百分比、脉冲及随机粒子，以避免动态帧差异，整体 nMAE 0.3345%。截图位于 `artifacts/dental-animation-20261116/qa/reference-neutral.png` 与 `local-neutral.png`。运行时的动态状态另由专项交互测试核对。
- 修复了鼠标或键盘持续停留时自动展示切换覆盖用户选择的问题：实际持续停留 7.6 秒仍保持对应提示，离开后恢复；减少动态效果下切换美白不再重置扫描进度。
- 最终官方源 `(10).fig`，导出 `2026-11-16T04:42:59Z`，SHA256 `fdaf7217c43de8692ad067404d13b5638bc11a2ebe657f993bfce27d072f41bb`；与现有 11 月 5 日设计源比较，三步主页面和 7 个当前详情状态均 unchanged，见 `artifacts/dental-animation-20261116/qa/acceptance-source.txt`。
- 最终生产预览 15 组语言/宽度检查、步骤数据延迟与失败重试通过；类型检查、i18n 与直接 Vite 构建通过。全站 `audit:figma` 仍因其他页面证据过期和牙科旧源门禁而失败（`artifacts/dental-animation-20261116/qa/final-figma-audit.log`），当前页面不可标记为 verified，尚未发布。

### 2026-11-16 最终原型状态对照（进行中）

- 原始代码的 1216px 卡片在美白、贴面、种植三个悬停状态与当前生产版本比较，暂时隐藏随机粒子及扫描线：nMAE 分别 0.328%、0.356%、0.340%；卡片像素尺寸均为 1216×641。中文周期空格因采用既有项目数据与原型略有区别。截图及结果在 `artifacts/dental-animation-20261116/qa/states-comparison.json` 同目录。

### 2026-11-16 提示框坐标修正和美白状态复核

- 原演示按视口宽度直接计算提示框坐标；牙科页加宽卡片后，SVG 使用 `xMidYMid meet` 居中，沿用该计算会使提示框偏离对应牙齿。现按 SVG 实际缩放和居中偏移计算，1024、1440、1920 宽度的 14 颗牙均逐个核对提示框与牙齿对齐，证据 `artifacts/dental-animation-20261116/qa/tooltip-alignment.json`。这项修正有意改变原演示在宽卡片下的位置，上段悬停像素结果是修正前的历史记录。
- 修正后同尺寸重新比对，美白开关状态在隐藏随机粒子、扫描线和百分比后 nMAE 为 0.325%，两侧均为 6 个闪光；悬停的美白、贴面、种植分别为 0.679%、1.206%、3.314%，主要区别为提示框现随牙齿对齐。截图及计算脚本位于 `artifacts/dental-animation-20261116/qa/`。
- 重新验证自动轮换顺序为种植牙、牙齿贴面、牙齿美白、全瓷牙冠；键盘焦点停留 7.6 秒不会被自动播放抢走，见 `artifacts/dental-animation-20261116/qa/autoplay-check.json`。最终生产预览的五语 × 三种宽度复测通过。
- 类型检查、五语审计和直接 Vite 生产构建通过。正常 `pnpm run build` 在 `audit:figma` 阶段失败：全站其他页面证据未通过，牙科审计仍使用更早的基线并将之后已实施的设计变动判为 changed（`qa/final-build-gate.log` 和 `qa/dental-focused-gate.log`）。未绕过门禁，不能将页面标为 verified；动画尚未发布。

### 2026-11-16 多语言提示框复查

- 较长翻译可能换行而使提示框遮住牙齿，现使用提示框实际高度确定纵向位置，语言切换后重新测量；五语 × 1024/1440/1920 宽度共 210 个牙齿状态的文字框均未越界、未压住牙齿中心，见 `artifacts/dental-animation-20261116/qa/tooltip-multilingual.json`。最终组件再次通过类型检查、直接 Vite 构建和五语交互回归。
- 本轮通过同会话 `scripts/figma-connect.mjs` 验证 Figma Design/Layers/Inspect，可读源节点 `2294:8240`，连接时间 `2026-11-16T05:01:13Z`、IAB 3、tab 2。尝试从菜单保存官方本地副本，但未观察到新导出文件；之前的 `(11).fig` 是 `2026-11-16T04:50:44Z` 的官方导出，SHA-256 `93a6ab27b36dca3ef3e29d904bdb5cb5283d09038bb2eb289db079dd68247c55`，不把本轮未成功的导出当作新的源比较。

### 2026-11-16 当前源及三步骤布局复核

- 同会话连接 `2026-11-16T05:06:15Z`：IAB 3 / tab 2，节点 `2294:8240`，Design、Layers、Inspect 均可读。使用下载事件取得官方导出 `/Users/hhm/Downloads/寰宇云医 (12).fig`，导出 `2026-11-16T05:06:42Z`，SHA-256 `5572f2cf655f9d6deae82e197c3b0d32559b39f6c9ad202c0a470c3f86315922`。对照 11 月 5 日使用的实际实现源，三个步骤和七个现行医生详情状态均 unchanged；全文件有其他页面新增及变更，故报告整体仍为 changed，并未将其误记为全文件无变化。详见 `artifacts/dental-animation-20261116/qa/current-source-0506.json`。
- 最终代码在生产预览重新运行步骤切换、草稿保留、并发切换及失败重试，五项通过，见 `qa/step-regression-final/qa.json`。五语、三个桌面宽度、三个步骤共 45 种布局中，动画均在 Hero 与步骤内容之间，浮动操作按钮未覆盖动画，见 `qa/flow-layout.json`。
- 已将三步骤布局、14 颗牙齿提示边界、美白开关及五语桌面宽度回归固化为 `pnpm run qa:dental:scan`，以生产预览实际运行通过；报告 `artifacts/dental-animation-20261116/qa/reusable-qa.json`。此专项回归不代替仍失败的全站 Figma 构建门禁。

### 2026-11-16 离屏后返回状态

- 修复自动展示提示期间滚离动画、再返回时旧提示因计时器取消而残留的问题；用户鼠标悬停或键盘聚焦的选择仍保持优先。离屏返回场景已加入 `scripts/dental-scan-qa.cjs`，并重新运行生产预览的三步加载与失败重试验证。

### 2026-11-16 混合输入与项目数据回归

- 当键盘聚焦和鼠标悬停分别处于不同牙齿时，离开一个输入目标后恢复另一个仍然有效的目标，避免提示意外消失。五语、三个桌面宽度逐颗检查提示标题与牙齿一致且价格和周期非空；包括离屏返回、混合输入在内的 `pnpm run qa:dental:scan` 在最终生产预览运行通过，日志 `artifacts/dental-animation-20261116/qa/project-mixed-final.log`。三步切换和失败重试回归通过，见 `qa/step-regression-mixed/qa.json`。类型检查和直接 Vite 构建通过；全站 Figma 审计仍未通过，未发布。

### 2026-11-16 倾斜动画对照

- 动画卡片外新增与演示 `.stage` 同尺寸的鼠标感应区域，修复原先因将外侧页面留白纳入计算导致倾斜幅度偏小。使用相同宽度的演示原始代码，在 15%/25%、50%/50%、85%/75% 三个鼠标位置对比，X/Y 旋转角度一致（`qa/tilt-reference.cjs`）。
- 演示 CSS 中的百分比右对齐声明被原始 HTML 的行内样式覆盖，实际与标题同行；按运行中的原始 HTML 实现，位置、字号、字重、颜色和字间距与原版逐项相同（`qa/progress-reference.cjs`）。美白开启的同尺寸静态对照 nMAE 0.320%，排除动态粒子和扫描线。
- 最后源码改动后再次通过类型检查、直接 Vite 构建、五语/三宽度/三步骤及交互回归（`qa/tilt-final-qa.log`）、步骤状态及失败重试回归（`qa/step-regression-tilt/qa.json`）。
- 连接证据：2026-11-16T05:27:28Z，同会话 IAB 3 / tab 2，源节点 `2294:8240`，Design、Layers、Inspect 可读；最终官方导出 `/Users/hhm/Downloads/寰宇云医 (14).fig`，2026-11-16T05:29:48Z，SHA-256 `9273ef3ccfc6937857c8d3f76f4560da60681780acf4143c10d3f1c923bc7d4e`。与实际使用的 11 月 5 日基线比较，牙科三个步骤及现行七个详情状态 unchanged；文件其他页面有变更，整体报告为 changed，见 `qa/source-tilt-final.json`。全站审计和牙科历史基线门禁仍未通过，未标记 verified，未发布。

### 2026-11-16 移动端内容与桌面一致性修复

- 用户要求移动设计未定稿时以桌面内容和流程为准，按手机屏幕适配，不要求逐像素还原。手机牙科医生列表改用桌面相同的七位医生资料、头像及各自的真实案例和评价；城市及机构筛选来源同步数据，不展示无资料的评分或虚构评价。手机保留原有详情容器和筛选布局。
- 本会话通过 `figma-connect.mjs` 连接 `iab` 3 / tab 2，2026-11-16T14:20:12Z Design/Layers/Inspect 可读；移动候选 `2839:354` 为 375×812，另有同名旧帧，参考该设计的手机呈现而不视其为最终稿。实施前官方源 `/Users/hhm/Downloads/寰宇云医 (18).fig` SHA256 `34730279f8bdc447e206a9c54c13939689cf4819c517ebad3799b0e9fc20c5ed`，交付前 `/Users/hhm/Downloads/寰宇云医 (19).fig` SHA256 `3c331c0b71b2d9f6b4f59b938d32757cf585222c21f53e8710019c6c2378fdd1`；`artifacts/seo-phase1/figma-dental-{before,after}.txt` 显示既有桌面节点替换和历史源缺失，整体仍为 changed，不标记全页 verified。
- 320/390px 手机检查医生列表、深圳筛选、真实案例、弹窗及五语姓名；390px 六篇工具文章及五语抽查，线上生产版确认牙科名单和签证文章。更多视觉调整待移动设计定稿。

### 2026-11-16 牙齿点击焦点框

- 随后按用户要求改为鼠标悬停查看详情，移开即收起；鼠标点击不获得焦点、不产生持续选中。无悬停时保留原有定时自动展示详情；键盘聚焦可查看对应详情，移开焦点后收起。
- 用户要求移除动画牙齿鼠标点击后的蓝色矩形焦点框；仅对该 SVG 控件去掉浏览器默认 outline，保留键盘 `:focus-visible` 的牙齿轮廓提示。Codex 内置浏览器 1440px 点击验证 outline 为 none、提示信息正常；Tab 切换验证键盘聚焦和牙齿轮廓生效。
- 本次仅修复用户提供的动画控件交互，无 Figma 对应动画节点；当前 Figma 连接 `2026-11-16T10:12:13Z`，IAB 3 / tab 2，源节点 `143:2`，Design/Layers/Properties 可读。未重新导出当前设计并执行全量源比较，不将本次修复视为牙科整页或全站设计验收。

### 2026-11-16 满幅背景与上下间距

- 用户要求动画背景铺满屏幕，且动画与上下内容的间距沿用原设计。原设计顶部图底边到步骤容器 `2294:8256` 顶边为 96px，现将顶部图到动画卡片、卡片到各步骤容器的间距均设为 96px；窄于 1440px 时随原页面画布等比例缩放。卡片实际高度变化时由 ResizeObserver 更新后续内容位置，避免多语言和开关状态导致重叠。
- 蓝色渐变由铺满视口的背景层绘制，动画卡片仍按原画布居中。1024/1440/1660/1920/2560 宽度截图采样验证背景左右无白边、无横向溢出、卡片居中及上下间距，结果见 `qa/fullbleed-spacing.json`；五语 × 三宽度 × 三步骤布局及交互回归见 `qa/equal-spacing-all-qa.log`，步骤切换、草稿保留和失败重试见 `qa/step-regression-equal-spacing/qa.json`。类型检查、直接 Vite 构建及 `git diff --check` 通过。历史全站 Figma 门禁未解除，未发布。
- 扩展专项回归：五语、三宽度逐颗选中 14 颗牙齿时，检查卡片高度变化后下方步骤仍保持设计间距，并对视口两侧实际像素采样确认背景满幅；`qa/fullbleed-active-final.log` 通过。
- `pnpm run qa:dental:scan` 现额外覆盖 1660px 和 2560px 的实际背景边缘像素、动画居中、上下间距以及横向溢出；最终回归日志 `qa/wide-reusable-final.log` 通过。
- 扩展验证在选中牙齿后改变窗口宽度（1440→1920→1024→1440），焦点与提示框保持对齐；五语、宽屏和交互回归重新通过，见 `qa/resize-final.log`。
- 普通动画模式下五种语言并行观察完整四项自动轮换；1024px 画布中卡片到步骤间距始终为按比例缩放的 68.27px，下方步骤位置无漂移，见 `qa/autoplay-layout.json`。
- 最终复核连接 `2026-11-16T05:47:50Z`，同会话 IAB 3 / tab 2，节点 `2294:8240`、Design/Layers/Inspect 可读；官方导出 `/Users/hhm/Downloads/寰宇云医 (16).fig`，`2026-11-16T05:48:09Z`，SHA-256 `1b40878c64afa4a6a525b4d7bda6ac13849906b12eee831c710a9592232f0171`。对照 11 月 5 日官方源，三个主步骤及七个医生详情状态均 unchanged；全文件其他页面有变化，整体为 changed，见 `qa/final-equal-spacing-source.json`。原医生详情实施导出的 `.fig` 不在磁盘上，仍不能以较晚源比较替代其逐字节验证。

### 2026-11-16 医生详情历史版本交叉检查

- 从 Figma 版本历史只读打开 11 月 5 日 10:29 的自动保存版本，导出 `/Users/hhm/Downloads/寰宇云医 (17).fig`，SHA-256 `60158dd1a2cc02f3e21a480a671de7766627f09b9eda01dbeba6f78d6c497368`；随后已返回当前版本，未恢复或修改设计文件。
- 对照已保留的 11 月 5 日较晚官方源，并与当时从实际实施源 `(52).fig` 得出的历史差异报告比对：医生详情六个状态的节点增删、变更内容和依赖差异逐项相同；脚本 `scripts/check-dental-historical-evidence.mjs` 和结果 `qa/historical-evidence-chain.json`。这加强了历史设计变化记录，但不能证明已丢失的 `(52).fig` 与重新导出的历史快照字节相同，也不构成通过现行全站验收门禁。
- 五语与 1024/1440/1920 宽度最终生产检查通过；三步骤与减少动态效果模式验证通过，完整构建、类型检查和 diff 检查通过。源码 `DentalScanShowcase.vue`、集成 `DentalDesktopFlow.vue`。
- 最新 Figma 官方源 `(11).fig`，2026-11-16T04:50:44Z，SHA256 `93a6ab27b36dca3ef3e29d904bdb5cb5283d09038bb2eb289db079dd68247c55`；三步及七个当前详情状态相对于 11 月 5 日实际设计源均 unchanged，`artifacts/dental-animation-20261116/qa/acceptance-final-source.txt`。全站 Figma 强制门禁仍不通过，未更改门禁或标记页面 verified；未发布。

## 2026-11-03 桌面悬浮下一步与公共导航修正

- 用户本次重新要求下一步底部悬浮，覆盖下方历史非悬浮记录。第一步 `2294:8336`、第二步 `2294:7209` 保留各自源按钮和点击逻辑，第三步不增加按钮。原位置保留布局空间，页面只出现一个可操作按钮。
- 使用完整源 `231:88` 提取的底部间距96px，桌面按画布比例缩放。按钮底边位于 `min(viewportBottom, footerTop) - 96×scale`，页脚进入视口后同步上移；滚动/尺寸与手风琴高度变化合并至动画帧。公共导航由 `patient-navigation.md` 承接。
- 当前官方源 `(35).fig` 于2026-11-03T04:07:25.377Z导出，SHA256 `00ef223839b8cfdf6be3eddbd18a691d5e96030201bd07b24ddfec9b74c0b2ca`。12个登记源不变，`2294:7751`仅外层帧名由05案例集变为05医生简介；已重新读取live Layers/Dev Mode，记录 `docs/figma-source/dental-revision-2026-11-03/profile-frame-name.json`。原基线与changed报告保留；无其他参数/内容/资源变动。
- 正式构建 `20261103210000`：1024/1280/1440/1920两步骤8种悬浮/页脚状态全部通过，间距误差<1px；第三步无重复按钮。证据 `artifacts/patient-navigation-avatars-20261103/production/qa.json` 与 `dental-1-1440-footer.png`，已个人复看截图。
- 开发与正式构建7位医生全部标签、15组筛选、4种排序、机构/案例、报价提交失败重试及焦点/滚动恢复通过，无真实资料提交。生产图片严格按 `dist/asset-cache-manifest.json` 比对内容哈希URL，不跳过图片断言。
- 最新生产截图对源：案例预览nMAE0.73241%、pixelmatch0.26973%；评分/价格0.62168%/0.53943%；Hero0.99549%、Footer0.66522%，均<1%。证据 `artifacts/patient-navigation-avatars-20261103/dental-production/behavior-qa.json`；专项目录门禁通过。当前仅本地构建验证，未发布公网；移动端设计保持冻结。

## 2026-11-01 牙科首屏进一步优化

- 沿用已锁定的13组页面/详情/卡片源及8项目+页脚补充源。官方源`寰宇云医 (31).fig`于2026-11-01T03:36:23.606Z导出，SHA256 `b12a7b02b462486846e75e7a0f0552a30a2e800f1c7452fdb925891c9f98abf4`；对原实施源逐节点无新增差异，未修改参数、资产或源锁。本轮`final-source-summary.json`留档。
- 仅拆分运行数据：第一步先加载8个项目与页脚；第二步匹配源及独立医生卡模板、第三步上传源在进入时准备。保留资料、筛选、顺序、独立展开、详情和业务接口。先加载再切换，缓存/并发去重/最后操作优先；失败保留当前步骤并可重试。窄屏原有流程不加载桌面源。
- 后续实测与静态、交互回归结果待填写，目前不声明完成。

## 2026-10-31 当前医生补充与验收

- Status: verified — seven merged desktop dental doctors and production preview; mobile deferred by user. This batch is not deployed.
- 当前源：本会话 IAB 验证 Design/Layers/Properties（2026-10-31T15:03:29.138Z，browser6/tab4）；官方导出 `(25).fig`，2026-10-31T15:08:23.937Z，SHA256 `b8e39c0623027d2db8c3a2e90400a4a353304c508ca64f916302c506a7f67854`。`latest-dental.json` 的13源帧逐节点/图片/矢量/依赖均 unchanged，沿用下方完整参数。
- 完整8项目源 `231:88` 的节点与依赖未变；历史比较同时发现同名短帧 `2294:8240`。`current-dental-complete-original.json` 保留 status=changed 及该alternative，未改为 unchanged。按用户确认的8项目继续组合短帧首屏与完整源后5项目/页脚；`current-dental-complete-frame.json` 比较 unchanged。
- 谭兆林（业务ID5，源卡 `2294:7061`）保留，补充文档6位深圳医生ID101–106，共7位；同名文档优先。谭兆林保留自己的5标签、案例和上海机构；新6位无真实授权案例则不显示预览/入口，不复制谭兆林或源样例。
- 卡片沿用389.33334宽、padding24、radius24、行列距24；谭兆林有案例496高，新6位无案例338高；混合行按最大高度定位下一行。评分价格区保留源层级/富文本参数，价格按各自资料。
- 开发与 production preview：`artifacts/patient-updates-2026-10-31/dental/behavior-qa.json`、`dental-production/behavior-qa.json`。7人标签/机构/案例、15筛选、4排序、报价带入、失败重试和重复提交保护通过；仅本地拦截API，未提交真实资料。1024/1280/1440/1920无溢出、破图或页面错误。
- 源区域对照：案例预览 nMAE **0.73241%**、pixelmatch **0.26973%**；评分/价格 **0.62169%/0.53944%**；Hero **0.75919%**、Footer **0.66523%**。新资料不宣称与旧单人样例整页像素一致。
- 本地临时案例回归验证：有详情案例才显示预览，计数不创建案例、不完整案例不显示，各医生预览与本人详情图片一致；混合行/空筛选/重置通过，原谭兆林案例保留。测试数据仅拦截响应，未写入源码或服务端。
- 已亲自复看7人列表、谭兆林案例和新医生详情；`scripts/audit-dental-physicians.mjs`、类型检查与直接 Vite 生产构建通过。本轮未发布外网；下方六位文档医生信息为历史版本。

## 历史参数与验证记录

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

### 2026-11-01 详情数据按需加载

- 原始13组Figma树、节点参数及图源均未改动。首屏仅载入项目、匹配、上传及医生卡片树，其余医生/机构详情在首次打开时按原排序注册；完整8项目/页脚扩展继续保有原有节点查找优先级。
- 生产/开发环境已验证7位医生全部标签、机构、案例、筛选、报价重试、关闭/焦点/滚动恢复及4个桌面宽度。首次进入不请求详情组件或其数据，详情首次打开仍完整可用。
- 与上次发布版对照首屏nMAE为0.0097%，无运行错误或溢出。首次JS解码1,719,408→1,133,821B，gzip 245,451→203,736B；这是受控本地资源统计，不是公网SLA。
- 证据：`artifacts/performance-followup-2026-11-01/dental-loader/qa.json`及`artifacts/patient-updates-2026-10-31/{dental,dental-production}/behavior-qa.json`。移动端设计保持冻结。


### 2026-11-01 第五轮详情标签拆分（80000）

- 医生及机构详情按当前标签加载，保留完整治疗流程、服务保障、机构图库及原滚动源；公共工厂不再提前带入牙科主数据。Figma节点、文案和源锁未改。
- 开发/生产7位医生全部标签、案例、机构、筛选、报价重试及关闭/焦点/滚动恢复通过；新增慢下载快速换标签、请求未完成时关闭和缓存重开回归通过。专项门禁通过。
- 同条件3次中位LCP2496→2248ms；谭兆林简介首次点击下载JS编码量49,552→11,495B、显示600→523ms。弹窗显示和全部图片完成分开统计。
- 证据：`artifacts/performance-exhaustive-2026-11-01/{final-verification.json,detail-open/qa.json,final-source-summary.json}`及`artifacts/patient-updates-2026-10-31/{dental,dental-production}/behavior-qa.json`。移动设计继续冻结。

### 2026-11-01 牙科性能收敛复核

- 最新官方源导出 `/Users/hhm/Downloads/寰宇云医 (32).fig`，SHA256 `647b79b83961afbbbfb58e1d788f2ab146304da79da7a5ff0fa499d3afeabad6`；13 个登记源帧、1358 个节点和125个资源均 unchanged。
- 最终包 `20261101111000` 对线上 `20261101080000` 的受控慢网中位：LCP `2332→2100ms`、FCP `1768→1536ms`、CLS `0`；JS 解码 `1,138,150→542,513B`，gzip `205,730→176,154B`。匹配、上传和详情源按步骤/标签加载，7位医生、15组筛选、8个项目、上传失败重试、步骤过期请求和五种宽度对照均通过。
- 证据：`artifacts/performance-home-dental-2026-11-01/{slow-final/qa.json,runtime-final/dental-interleaved.json,step-loading-final/qa.json,visual-final/qa.json}`及`artifacts/figma-dental-2026-10-28/behavior/behavior-qa.json`。原始医生卡/页脚的既有 Figma 残差与 WhatsApp 独立控件仍按源稿门禁单独记录，未放宽1%阈值；本轮尚未部署公网。

### 2026-11-17 手机可用性复核（进行中）
- 320px 下牙医列表“了解更多”在有鼠标能力的窄屏设备也保持可见；桌面保留 hover 显示。葡语首屏较长时容器自适应，避免标题与说明被固定高度裁切。
- 320px 实际打开谭兆林五个资料标签；另六位各自三例和患者评价可打开。320/390/430px 中文、320px 五语各步骤基础宽度检查通过；这不是全站 Figma 设计完成验收。
- 2026-11-17 补查：7位牙医的桌面详情分享地址在手机跳转时保留医生身份，案例标签可直达；生产预览逐一验证7位，公网验证谭兆林案例。无视图截图可视为全站Figma验收。
