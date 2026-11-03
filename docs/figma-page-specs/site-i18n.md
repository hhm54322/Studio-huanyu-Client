# 患者独立站五语适配记录

- Status: implementation — 未完成翻译与真实译文视觉验收，不能标记 verified。
- Scope: 全部已开放患者路由和其详情/弹窗/表单状态；中文、英语、印尼语、马来语、葡语。
- Source of truth: 原页面 Figma 参数与节点映射继续有效，未替换或自动接受变更基线。
- Live connection: `figma-connect.mjs`，2026-11-03T19:17:00.097Z；session `01a0bebd-b6f9-7fd3-bf5a-b79501589b80`，IAB browser2/tab4，Design/Layers/Properties 均可读；选中 `1523:75`。证据 `artifacts/i18n-20261104/connection-last.json`。
- Latest obtained official export: `/Users/hhm/Downloads/寰宇云医 (48).fig`，exportedAt `2026-11-03T18:32:42.464Z`，SHA256 `2d1ee146a6f80b0076073b23708d40ff049b9eaa5ad29f788bf2cb9bb3f13849`。扫描 36,318 节点、19,255 帧；这是实施中的源核验，不是最终交付确认。
- Comparison evidence: `artifacts/i18n-20261104/source-start-home.json`、`source-start-dental.json`、`source-groups.json`、`source-summary.json` 和逐历史基线报告。扫描实现导出的全部节点、隐藏状态、共享依赖及同名候选，未以帧大小/名称代替检查。

## 参数和映射

全部 Figma 参数、具体 Node ID、资产与节点映射沿用各已存在页面的 page spec 及 `docs/figma-source/**/source-tree-*.json`/native 参数记录。新增跨页映射为：

| 原节点/元素 | 实现 | 五语适配 |
| --- | --- | --- |
| 各源树所有 TEXT Node ID | `HomeSourceNode.vue[data-figma-node]` | `tx()`；中文使用原富文本/字形基线，翻译文本按原字号/列宽换行 |
| 原 Auto Layout/绝对坐标容器 | `src/i18n/sourceLayout.ts` | 容器与后续兄弟高度随译文增长；保留图片尺寸、矩阵镜像、列间距 |
| 全站 Navigation 实例，首页源 `1523:75` 内导航 | `PatientDesktopNavigation.vue` | 按需换行，菜单在完整导航行之后，保留路由及激活状态 |
| 实力原三状态 `1442:343`、`1451:534`、`1442:289` | `HomeStrengthSection.vue` | 三组文案使用相同翻译后窗口高度，保留切换与图片淡入淡出 |
| 牙科五标签 `3421:2534/2810/3113/3380/3698` | `DentalDoctorView.vue`、`DentalDoctorPageContent.vue` | 译文、医生资料和案例随内容增高，保留原状态与业务入口 |
| 医生目录 `1689:4814` 下源树和供稿卡片 | `PhysicianView.vue`、`PhysicianProfileDialog.vue` | 科室展示翻译，筛选值保留原值，姓名/专业资料使用公开目录译文 |
| 文章/医院/首页弹窗原源树 | 原 Canvas/Dialog + `HomeSourceNode.vue` | 包含滚动内容，公共 CTA/内容容器随译文增高 |
| 信任文章模板 `143:4209/4213/4214/4215/4216/4217/4218/4219`、关闭 `143:4210` | `TrustArticleDialog.vue` | 原生绝对坐标 JCI 模板保留内边距；已采用 Grid 的文章变体沿用自然流，避免叠加坐标；关闭图标仍绝对定位 |
| 首页/医院图表原 chart-spec TEXT Node ID | `HomeView.vue`、`HospitalRadar.vue` | 绘图文字翻译，语言变化后更新 Canvas |
| 原手写患者表单/标签/提示 | 各对应 Vue 模板 | `tx()`/`tf()`，文件名、用户输入和报告原文除外 |
| 医生快捷筛选 `1689:4839`、结果 `1741:5784` | `PhysicianView.vue` | 非中文时科室控件占独立行，结果区相应下移，六个快捷筛选与科室数据保持原值 |
| 医院图片、城市/资质标签所在原节点 | `sourceLayout.ts` | 原图片大小与裁切窗口不变；小型覆盖标签按译文增宽；等宽卡片不占用相邻列空白 |

节点的准确字号、行高、字重、填充、圆角、原位置及图源以对应源树/原 page spec 为准。本次没有替换为估测值。

## 当前源差异

- 最新牙科七个独立页/状态相对 2026-11-03 实现导出，无该范围内节点差异。全文件仍有其他候选变化，不自动采用。
- 部分旧牙科弹窗源已删除，已有独立页替代；不是本次遗漏页面。
- 首页专家 `1432:7917` 有同名新候选 `3424:6069`，其他部分历史/移动源有差异；没有因 i18n 任务自动改写设计基线。
- 历史基线 `f46e9364d…` 的原 native 导出缺失，保留 unresolved，不把缺失当相同。需以后续页面设计核验处理。
- 后续在当前 IAB 再次执行官方 `Save local copy…` 后未取得新下载；最新实际取得的文件仍为 `(48).fig`。不能将重新运行比较脚本表述为已取得最终新源。本次整体仍不交付、不自动更新任何基线。

## 验证

- `scripts/site-i18n-layout.test.cjs` 与 `site-i18n-copy.test.cjs`：20 项回归通过，不能代替截图。
- `scripts/m02-contact-qa.cjs`：五语/5档桌面宽度/3种公共导航，共75组布局检查通过；原70组路由联络信息回归另有记录。
- `scripts/site-i18n-qa.cjs`：主页面顶部/中段/底部、逐屏扫描和本地截图。加长文案仅用于应力测试，真实译文检查仍待完成。
- `scripts/site-i18n-states-qa.cjs`：覆盖详情、筛选、五标签、案例展开、信任文章与 FAQ、报告空表单校验；全部为本地 QA，不向真实接口提交资料。
- 中文牙科：`artifacts/i18n-20261104/dental-zh-baseline/qa.json`，7 个 Figma 对照区域差异均 <1%，完整流程自动化回归通过。曾有图像工具空输出，不能将那些调用记为视觉检查。后续已通过正常图像输出检查首页手机导航、牙科医生资料、医生目录、医院卡片、为什么选择中国、保险路径、文章和手机表单等部分截图，并修复可见问题；没有逐张检查所有状态，更不等于四套真实译文的完整视觉验收。
- 全文目录当前 5,936 条；英/印尼语各缺 5,656 条，马来语/葡语各缺 5,881 条，受 GPT 403 阻塞。`prebuild`/`build:app` 已加入完整度检查，未补齐前阻止发布。
- Remaining differences: 未完成，完整语言包和真实译文截图未验收。维护与阻塞见 `docs/implementation/site-i18n.md`。
