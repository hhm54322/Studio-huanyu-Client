# 患者端桌面公共导航

- Scope: 本轮用户明确的交互修正；移动端设计继续冻结。
- Route: 患者端全部桌面公共导航
- Figma frame: 首页 Header / Navigation；医疗服务与中国医院菜单
- Node ID: `1523:75`、`1523:82`、`1524:2`、`1741:5732`、`1732:5716`
- Source baseline HTML: `docs/figma-source/home/revision-2026-10-28/hero/baseline-2026-10-28.html`
- Source baseline CSS: `docs/figma-source/home/revision-2026-10-28/hero/dev-styles-2026-10-28.css`
- Source asset manifest: `docs/figma-source/home/assets-2026-10-19.json`
- Source extraction run: 2026-11-03；保留原逐节点抽取与参数锁，仅实施用户授权的统一导航状态与中国医院箭头扩展
- Desktop frame: 1440×64 Header；Navigation835×28，增加医院箭头后内部向左扩展18px、右沿不变
- Mobile frame: 用户冻结；仅做原版回归
- Source: Figma `s6gMozOqPBJFujindYruwb`；`1523:75/82/95`（首页 Header / Navigation / 医疗服务），`1524:2`（医疗服务菜单），`1741:5732` / `1732:5716`（医院/医生菜单）。
- Connection: `scripts/figma-connect.mjs`，2026-11-03T02:59:18.607Z，当前会话 IAB6/tab4，Design/Layers/Properties 均可读；原证据在 `artifacts/patient-navigation-avatars-20261103/connection.json`。
- Current official export: `/Users/hhm/Downloads/寰宇云医 (35).fig`，2026-11-03T04:07:25.377Z，SHA256 `00ef223839b8cfdf6be3eddbd18a691d5e96030201bd07b24ddfec9b74c0b2ca`。
- Comparison: `artifacts/figma-source-gate/navigation-start-home.json`、`navigation-start-shared.json` 和 `latest-dental.json`。首页、医院、医生、信任及牙科三主步骤节点未变。牙科详情 `2294:7751` 仅源帧名由「05案例集」改为「05医生简介」，保留 changed 报告，另行核对该名称，不自动接受基线。
- Locked baseline: 各页面现有 source-tree / native-parameters / Dev Mode 与节点映射继续保留；下表列用户授权的公共行为修正。
- Final connection: 同一入口于2026-11-03T04:19:38.469Z再次验证当前会话IAB6/tab4；证据 `artifacts/patient-navigation-avatars-20261103/connection-final.json`。交付前源比较 `navigation-final-shared.json` 的七组源与原实施导出一致；首页与医生登记源也一致。新牙科案例详情帧 `3210:1718` 已在live Layers检查，与本轮公共导航修正无关，未替换任何案例内容。
- Status: verified — desktop shared navigation; frozen mobile preserved; local production build only

## Layer Mapping

| Figma 节点 | Vue owner | 已读取参数 / 行为 |
| --- | --- | --- |
| `1523:75/76/82` | HomeSourceNode > PatientDesktopNavigation | Header1440×64，Container1280×64、左右32，Navigation835×28、gap2；保留原壳与标识位置 |
| `1523:89/91/93/99/103/105/107` | 对应 RouterLink | 高28，padding6/10，radius8，文字12/16；当前路由才显示 #2563EB 和10%蓝底 |
| `1523:95/96/97/98` | 医疗服务下拉 trigger | 宽86，高28，文字48×16，文字与图标gap2、图标框16×16；复用准确SVG路径。默认文字按用户改为 #4B5563 |
| `1523:101/102`、`484:1573/1574`、`1689:5416/5417` | 中国医院下拉 trigger | 按用户增加同源小箭头；选择后显示中国医院/中国医生；交互与医疗服务统一 |
| `1524:2/3/4/7/8/9/10/13/14` | 医疗服务 panel / 项 | panel111×149、padding12/14/12/12、gap4、radius16、边框0.5 #E3E4E8、白底；子项84×28、padding6/10、radius8、12/16 |
| `1741:5732/5733/5734/5735/5736`、`1732:5716/5717/5718/5719/5720` | 中国医院 panel / 项 | panel高85，医院/医生两项，radius16、padding12、gap4；路由链接为 /hospitals 和 /doctors |
| `1523:84/85/88/110/111/115/117` | 问阿宁 / 语言 | 继续使用原图标、渐变80×28、语言65×28；共用原咨询入口与 locale 存储 |
| 各页 Navigation 同源子树 | HomeSourceNode > 同一公共实现 | 按已锁定源节点的名称及父子结构识别桌面导航；每个控制保留原 Node ID，保持外壳位置，内部以原gap/padding自适应新增箭头；末端仍与源容器右沿对齐 |

## Assets

| 图源 | Figma Node ID | 项目路径与用途 |
| --- | --- | --- |
| 咨询图标 | `1523:85` | `public/images/figma/home-revision/node-1523-85.svg`，14×14 |
| 下拉箭头 | `1523:98` | `public/images/figma/home-revision/node-1523-98.svg`，16×16图标框内8×4路径，两组复用 |
| 语言图标 | `1523:111` | `public/images/figma/home-revision/node-1523-111.svg`，14×14 |

## Prototype And Motion

- 两组菜单 hover/focus 展开，支持点击、ArrowDown/Up、Home/End、Escape、Tab 和外部点击关闭。浮层避免被画布裁剪；触发器与浮层之间保留可通过的悬停区域。
- 首次访问默认显示医疗服务/中国医院；进入子项后保存本标签页选择，其他路由显示已选名称但保持未选中颜色。直接访问子路由同样恢复对应名称。
- 当前路由所属组才高亮；只展开菜单不选中。没有落地页的三个医疗服务入口保留待开放状态，不编造页面。
- 首页/牙科/医院/医生/信任/工具包及其余共享导航页面使用同一状态与组件。

## Verification

- Verification run: 2026-11-03T04:21:38.421Z；正式构建 `20261103210000`，`scripts/patient-navigation-qa.cjs`。
- Figma reference screenshot: `artifacts/figma-home-2026-10-28/figma-1523-31-2x.png`
- Local desktop screenshot: `artifacts/patient-navigation-avatars-20261103/production/home-services-open.png`
- Local mobile screenshot: `artifacts/patient-navigation-avatars-20261103/production/mobile-390-home.png`
- 首页、牙科、医院、医生、专科、信任、为什么中国、案例、保险、关于、步骤及工具包共12路由：单一公共导航、两组悬停菜单/箭头、当前路由颜色、无重复旧菜单和无溢出全部通过。三组子项选择均核验跳转、名称保留、其他页面恢复灰色及刷新保留。
- 两组键盘回归通过：ArrowUp/Down、Home/End、Escape焦点恢复、Tab关闭及外部点击。个人复看首页透明首屏及两菜单、牙科菜单、医生选中状态截图。
- 同批牙科按钮在1024/1280/1440/1920两步骤共8状态核验固定间距及页脚让位；320/390/430首页与牙科共6次回归确认没有新增桌面控件或横向溢出。证据 `artifacts/patient-navigation-avatars-20261103/production/qa.json`，含当前实现SHA256，无页面错误或资源失败。
- 类型检查、生产构建和diff检查通过。其他页面历史全站门禁的截图/时效问题保留在 `full-figma-gate.log`，本记录不宣称全站重新验收或公网发布。
- Remaining differences: none

## 2026-11-03：下拉菜单间距修正

- 用户反馈「下拉间距太大了」：本次明确将触发项底边至菜单顶边从26px收紧至8px（设计坐标，随导航缩放）。这是用户授权的间距修正，非Figma原始参数；选项gap4、padding12/14/12/12、radius16、border0.5及原文字/图标保持原始参数。
- 连接：唯一入口在2026-11-03T13:55:34.409Z验证当前会话IAB2/tab4；随后实时选择`1524:26`并读取Layers和Inspect，证据`artifacts/dropdown-spacing-20261103/connection.json`、`figma-menu-live.txt`。源菜单top72，触发项底边46；源距离确为26。
- 当前官方导出：`/Users/hhm/Downloads/寰宇云医 (42).fig`；比较原实施源的`dropdown-spacing-start-home.json`、`dropdown-spacing-start-hospitals.json`、`dropdown-spacing-start-physicians.json`均确认本次Header/菜单子树不变；全文件差异属于其他模块，不自动更新基线。
- 交付前导出：`/Users/hhm/Downloads/寰宇云医 (43).fig`，2026-11-03T14:09:34.702Z，SHA256 `e0d762d0771ae80e15c120dd37de2a8fa53a0de52af7e3e11aaef0973e4a5736`；`dropdown-spacing-final-home.json`、`dropdown-spacing-final-hospitals.json`、`dropdown-spacing-final-physicians.json`的目标子树、依赖及同名候选均unchanged。14:11:12.115Z再次验证同会话Design/Layers/Inspect可读，证据`connection-final.json`。
- 节点映射继续使用上表；仅改变`PatientDesktopNavigation.vue`中的浮层定位及其透明悬停衔接区，医疗服务、中国医院和语言菜单共用一致间距。
- 实施参数：浮层偏移8px，透明衔接区9px（额外1px跨过边框），共享同一间距变量，维持140ms关闭延迟。仅桌面端。
- Verification: 2026-11-03T14:11:41.656Z；`artifacts/dropdown-spacing-20261103/qa.json`。开发预览在1024/1280/1440/1920检查首页、牙科、专科诊疗的两组菜单，共24状态；实际间距均为8px（按导航缩放），慢速经过衔接区不收起；ArrowDown、Escape焦点恢复、外部点击及医院菜单跳转通过。生产预览1440再次核验8px间距并截图，菜单内部图像平均归一化差异0.3369%，含抗锯齿与半透明边框背景差异；尺寸、文字、内部间距均未改。个人复看`diseases-technologies-hospitals-after.png`、`production-after.png`。牙科详情既有完整dev/production截图与交互检查亦重新通过；`vue-tsc -b`、Vite生产构建及diff检查通过。Remaining differences: none.

## 2026-11-03：M02 五语联系入口与长度兼容

- M02 复用本页已锁定的 Header/Navigation 节点；当前源稿 `/Users/hhm/Downloads/寰宇云医 (45).fig` 的 Header、医疗服务菜单、中国医院菜单子树及依赖与实施源一致，未将全文件其他变化接受为导航基线。连接与比较证据在 `artifacts/m02-20261103/connection-final.json` 和 `artifacts/m02-20261103/source/final-*.json`。
- 在共享导航和联系入口上增加五语兼容：顶部导航使用紧凑显示文案并保留完整 `title`/ARIA，菜单按内容宽度并受视口限制，长项换行；中文原布局保持不变。移动端继续冻结。
- 最终开发与生产预览均通过75个布局场景（5语言×5桌面宽度×3页面，每页检查两组下拉与语言菜单）；个人复看最终葡语/印尼语1024和1440截图，无文字重叠、截断或超出视口。中文首页和牙科导航与变更前像素一致。直接源菜单图片比较保留了原有149px/150px边框栅格化差异，不声称本轮完成全站Figma重新验收。
- M02 详细行为、主题映射、WhatsApp 来源字段和验证结果见 `docs/implementation/m02-contact-localization.md`。
