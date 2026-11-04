# 患者独立站五语适配记录

- Status: implementation — 五语文案及专项排版回归已完成并以 `20261104100320` 正式发布；全站当前Figma设计门禁仍有明确差异，不标记全站设计verified。
- Scope: 全部14条已开放患者路由及其详情/弹窗/表单状态；`zh/en/id/ms/pt`。移动端仅做已有布局语言兼容，不开展设计改版。
- Static baseline: 各原页面的节点树、原HTML/CSS、资产及逐节点参数映射保留，未自动替换历史设计基线；详见对应page spec和 `docs/figma-source/`。
- Live connection: `figma-connect.mjs`，2026-11-04T09:05:54.799Z，session `01a0bebd-b6f9-7fd3-bf5a-b79501589b80`，IAB browser2/tab4；Design/Layers/Properties均可读。证据 `artifacts/i18n-20261104/direct/connection-delivery.json`。另已逐一读取并留存首页、信任页、牙科新增节点、医院按钮/标签的Dev Mode。
- Current official source: `/Users/hhm/Downloads/寰宇云医 (51).fig`，exportedAt `2026-11-04T09:24:57.573Z`，SHA256 `039c559b7c0292b79f3f4626d37e16805baa027099e59dbc6b56889e4c1ee4b1`，35,986节点/19,050帧。
- Current-source comparison: `artifacts/i18n-20261104/direct/delivery-source-summary.json`及各逐历史基线报告。包括全部节点、小/隐藏状态、同名候选及共享依赖；缺失历史导出保留为缺失，不用帧大小、名称或截图代替检查。

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


## 本轮精确参数补充

| Node ID | Live Dev Mode / 原值 | 映射与适配 |
| --- | --- | --- |
| `204:5638`、`204:5639` | 原左侧工具包固定列；标题局部top=0px，原字号/行高保留 | `TrustDesktopPage.vue`，拆出的固定列继续保留absolute元信息，译文不挤入右列；0px显式保留单位 |
| `1620:769`（TEXT `1620:770`） | 按钮149.64 Fill×38，padding10px 0，gap4，圆角10，#DD6B20；兄弟间gap8 | `HospitalView.vue`，仅外语的fluid窄屏两操作等宽分配，长标签换行、容器可增高；中文原几何不改 |
| `1620:2030`、`1620:2032` | Mask 311×23；内部Container394 Hug×23 Hug；父padding16；底边1px #F1F5F9 | `HospitalSourceDialog.vue`，四语标签保留Hug宽度并横向滚动，静止和上滑固定两状态一致 |
| `1620:1213`、`1620:1215`、按钮 `1620:1216`–`1620:1226` | 原概况页标签Mask、inline-flex容器，padding-top24；文字12/12，tracking .064 | 同组件原有手机自然流，仅外语避免flex强缩窄及absolute行不撑高 |
| `1541:1100` | 费用弹窗医疗项目，12/18，600，tracking−.15；原列宽84 | `site-copy/pt.json`，“Quimioterapia / terapia-alvo / imunoterapia”保留治疗含义并添加正常断词空格，未缩小字体 |
| `190:5323`（TEXT `190:5327`） | 案例主CTA原199×62，padding16/24，gap8，圆角14，文字20/30、600；完整源参数沿用 `cases.md` 的248节点记录 | `CaseView.vue`，仅外语以内容宽高覆盖生产懒加载的固定高度，保留最小高度62；中文不改 |
| `221:6192` | 案例筛选原4×220及104/106操作按钮，gap16，高42；同上原源记录 | 同组件，仅外语操作列使用内容宽度，≤1000px两列、≤650px操作按钮全宽自然高度，避免标签被强行断字或截断 |

Live证据：`direct/live-trust-5638.txt`、`live-trust-5639.txt`、`live-hospital-button-769.txt`、`live-hospital-tabs-2030.txt`；医院相关源在最终全节点比较中保留其既有历史差异。

## Assets

| 精确源节点 | 资产处理 |
| --- | --- |
| `1523:59` 首页首图容器 | 原Figma图片与铺满裁切保留；本次只约束译文最大宽度 |
| `204:5638` 固定列下TEXT节点 | 无新增位图，以原TEXT字体渲染四语 |
| `1620:769`、`1620:2030` | 无新增位图，保留原按钮/标签颜色、圆角及图标资产 |

其他图源、导出路径和NodeID沿用各页面既有Assets表；本次没有新增或替换照片。

## Behavior And Verification

- 语言切换通过真实 `setLocale()` 并同步 `html[lang]`、URL、存储，异步包先加载后统一切换；过滤值、路由、业务字段保持原值。私有病例、上传文件名及报告原文不翻译。
- `direct/audit-delivery.log`：四套语言包均5837/5837，零缺项/无效/未同步源；`tests-with-case-final.log`最后代码34项回归通过；`types-final.log`类型通过。
- 主路由210组，其中168组外语所检边界/漏翻/脚本无问题；交互668组中的1处葡语初次失败已修并另20组复验。额外168组窄屏中的医院4组问题已修并另16组路由/96组详情复验。完整原始失败保留，不将初次报告改写为全绿。
- 实际译文截图逐页生成，并人工查看关键长文、按钮、手机标签和弹窗。中文信任页五区域截图nMAE最高0.50848%、pixelmatch最高0.37897%；中文牙科此前7区域均<1%。详细路径与范围见 `docs/implementation/site-i18n.md`。
- Prototype/业务：首页原因/故事/专家、医生筛选/详情、医院六标签、牙科五标签/案例展开/报价、工具文章、信任FAQ/长文、报告空表单和咨询均回归；QA拦截非GET，不向真实接口提交病例或发消息。
- 最终生产包 `artifacts/deployment/20261104100320/production-qa/report.json`：95组主路由检查中76组外语无所检异常，中文19组原观察保留；医院/牙科44组标签状态通过。生产CSS顺序导致的案例按钮问题已修，`case-controls-qa/report.json`四语×五宽20组全部通过，原始失败另档保留。公网70组通过，旧版升级后57项已加载资源重复访问传输为0；CDN34刷新+184预热全部完成100%。部署不包含后台或报告生成行为变更。
- Remaining differences: 全站当前设计验收仍有历史源删除/替换、证据时效、共享代码哈希以及当前牙科简介分隔线新增等差异。缺失历史 `f46e9364d…` 原始导出未被视为相同。不得将本次语言专项回归写成全站Figma门禁通过；当前未放宽门禁或接受变更基线。

## 2026-11-04 首页真实译文兼容复核

本轮唯一入口连接时间 `2026-11-04T04:25:16.285Z`，当前会话 IAB browser2/tab4，源 `1528:135`，Design/Layers/Properties 可读。已实际取得官方副本 `/Users/hhm/Downloads/寰宇云医 (49).fig`（2026-11-04T04:05:56.589Z，SHA256 `2e3b24ce24a2f555f94f2c61bcd4586c16816a97488355e1924ddcc4667508fe`）；全节点、隐藏状态、共享依赖及同名候选比较记录在 `artifacts/i18n-20261104/direct/home-mobile-source-before.json`。移动主帧的尺寸/行高差异已逐项回查 live Dev Mode，未自动替换历史 native 基线。

| Node ID | 父节点 | 当前 Dev Mode 原值 | 具体映射与本轮适配 |
| --- | --- | --- | --- |
| `1528:134` Container | `1528:127` Section | 375×118 Hug，纵向居中，gap20 | `HomeFigmaSection.vue [data-figma-node="1528:134"]`，仅非中文恢复 Hug 高度 |
| `1528:135` Heading 1 | `1528:134` | 327×64 Hug，column，align center，gap12 | 同节点元素，仅非中文随文案自然增高 |
| `1528:136` Frame 77 | `1528:135` | 327×34 Hug，row，center/start，gap4 | 同节点元素，译文标题的自然行高 |
| `1528:138` 标题 | `1528:136` | PingFang SC22/34，600，#143162，居中，291×34 | 同节点 TEXT，保留字体，允许换行 |
| `1528:141` 副标题 | `1528:135` | 313×18 Hug，12/18，400，#5B606A，letter-spacing−0.439 | 同节点 TEXT；live 证据 `live-mobile-141.txt` |
| `1528:142` CTA Container | `1528:134` | 124×34 Hug，column/start，gap32，前间距20 | 同节点元素，随前文推移；live `live-mobile-142.txt` |
| `1528:149` 流程标题 Container | `1528:148` | 156×52 Hug，column/start，gap4，父padding40/16 | 同节点元素，非中文利用父容器可用宽度；live `live-mobile-149.txt` |
| `1528:152` Frame83 | `1528:148` | 343 Fill×116 Hug，row，space-between，align center，前gap32 | 同节点流程行；live `live-mobile-152.txt`，译文各列按可用宽度分配，顶部数字对齐 |
| `1528:153/160/167/174` Frame79–82 | `1528:152` | 每列61 Hug×116，column/center，gap10 | 同节点4个可点击阶段列，保留4列与圆圈原尺寸，译文等宽使用剩余空间 |
| `1528:157/164/171/178` Heading7 | 上述对应阶段 | column/center，gap8，原宽61/61/49/49 | 同节点标题说明组，非中文使用阶段列宽 |
| `1528:154/161/168/175` 数字圆圈 | 上述对应阶段 | 52×52 | 同节点原图形，尺寸不变 |

这是已有移动布局的语言兼容修复，不是移动设计改版。中文和桌面原几何不变。验证仍须使用真实译文截图；前次 DOM 零溢出未发现 CTA/副标题相叠，不能作为视觉通过依据。
