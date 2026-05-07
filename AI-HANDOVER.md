# 寰宇云医 Vue 3 项目 — AI 交接文档

> **重要约定**：每完成一个 Phase 或发生重大决策变更后，必须更新本文档对应章节。这是跨会话协作的唯一上下文来源。

> **最后更新**：2026-05-07 | Phase 5 完成，移动端深度适配已实施

---

## 1. 项目概述

**项目名称**：Studio-huanyu-Client（寰宇云医 H5 前端）

**一句话描述**：将 Kimi AI 生成的跨境医疗旅游网站（React 双项目）改造为自研 Vue 3 单体项目，面向 H5 平台，适配移动端和桌面端。

**项目位置**：`~/Desktop/1024Clients/huanyu/Studio-huanyu-Client/`

**原始素材位置**：`~/Desktop/1024Clients/huanyu/Kimi_Agent_双版医疗导航网站-3/`
- `patient-app/src/pages/` — 患者端 React 源码（C端，8 页，橙色主题，5 语言 i18n）
- `app/src/pages/` — 医院端 React 源码（B端，5 页，深蓝主题，仅中文）
- `webapp/` — 编译产物，**不是源码**，不要参考
- `cloudflare-upload/` — 图片素材（已复制到新项目）

**在线参考**（Kimi 版，可能已失效）：`https://z6ytgaxhvnpyw.ok.kimi.link/#/`

---

## 2. 需求与约定

### 2.1 核心需求

- React → Vue 3 全量改写（不是包装，是重写）
- `patient-app` + `app` 合并为一个项目
- 使用 Composition API + `<script setup>` 语法
- 移动优先，同时适配桌面端
- 用户逐节点验收，通过后再推进下一阶段

### 2.2 双端设计

项目包含两套独立视觉体系：

| 维度 | 患者端（C端） | 医院端（B端） |
|------|-------------|-------------|
| 路由前缀 | `/`（根路径） | `/hospital` |
| 主色 | 橙色 `#C05621` | 深蓝 `#1A365D` |
| 辅色 | `#DD6B20` | 青绿 `#319795` |
| 强调色 | `#ED8936` | 金色 `#D69E2E` |
| 浅底色 | `#FFF5EB` | `#F7FAFC` |
| 国际化 | 5 语言（zh/en/id/ru/mn） | 仅中文 |
| 页面数 | 8 页 | 5 页 |
| Layout | PatientLayout.vue | HospitalLayout.vue |

### 2.3 技术栈

```
运行时：Vue 3.5+ / Vue Router 4 / Pinia 2 / vue-i18n 10
构建：Vite 6 / TypeScript 5.6
样式：Tailwind CSS 4（@tailwindcss/vite 插件） + CSS 变量双色系
组件库：Vant 4（自动按需引入）
图表：ECharts 5 + vue-echarts 7
图标：lucide-vue-next
HTTP：Axios（预留，当前无后端）
移动适配：Tailwind 响应式工具类（px-4 md:px-6 等断点），postcss-px-to-viewport 已禁用
```

---

## 3. 开发阶段与当前进度

完整计划见 `~/Desktop/1024Clients/huanyu/寰宇云医-Vue3详细开发计划-执行版.md`，共 7 个 Phase、8 个验收节点。

### Phase 0：项目初始化 ✅ 已完成

- [x] Vite + Vue 3 + TS 项目脚手架
- [x] Tailwind CSS 4 配置 + CSS 变量双色系
- [x] postcss-px-to-viewport 移动适配配置
- [x] Vant 4 自动按需引入
- [x] Vue Router 4 路由配置（13 条路由，嵌套 Layout，懒加载）
- [x] Pinia store（locale + isMobile）
- [x] vue-i18n 配置 + 5 语言 JSON 文件
- [x] App 入口文件（main.ts / App.vue）
- [x] PatientLayout.vue + HospitalLayout.vue（含 Header/Footer 独立组件）
- [x] 图片素材复制（15 张 JPG/PNG → public/images/）
- [x] favicon.svg

### Phase 1：布局与导航 ✅ 已完成

- [x] PatientHeader.vue / PatientFooter.vue
- [x] HospitalHeader.vue / HospitalFooter.vue
- [x] Composables: useResponsive.ts, useScroll.ts, useAppSide.ts

### Phase 2：数据层提取 ✅ 已完成

所有 React 硬编码数据已提取到 `src/data/` TypeScript 文件：

- [x] `src/data/costs.ts` — radarData, barData, costMatrix, countries, chinaColumnIndex, savingsCases, freeVsPro
- [x] `src/data/cases.ts` — 8 个 PatientCase 记录（含 bg/text/border 色彩类）
- [x] `src/data/hospitals.ts` — 51 家 Hospital 对象 + cities 数组（1362 行），含完整双语字段
- [x] `src/data/visa.ts` — visaFreeData(3区域45国), materials(9项), timelineSteps(6步), urgentServices(3档), faqData(5条)
- [x] `src/data/steps.ts` — stepsData(6步), StepData interface
- [x] `src/data/report.ts` — diseases(11种), regions(7), budgets(5), reportData(8国完整报告), packages(3档), coreHighlights(6条)
- [x] `src/data/hospitalB.ts` — 全部医院端数据：heroStats, painPoints, solutions, coreSolutions, dashboardFeatures, processSteps, successCases, pricingPlans, customPlanFeatures, comparisonRows, featureHighlights, platformStats, caseStudies, growthData, apiFeatures, endpoints, requestExample, responseExample, techArchPoints, applyProcessSteps, applyRequirements, deptOptions, applyFaqs

### Phase 3：患者端 8 页开发 ✅ 已完成

全部 8 个患者端页面已从 React 完整转换：

- [x] **HomeView.vue** — 9 Section：Hero + Stats + Features + Charts(ECharts radar+bar) + Cases + CostMatrix + FreeVsPro + Trust + CTA
- [x] **CostView.vue** — 费用矩阵(7×8) + ECharts 柱状图(8国) + 3 节省案例
- [x] **HospitalView.vue** — 51 医院 3 列网格 + 城市筛选 + 中英切换 + Teleport 详情弹窗 + ECharts 雷达图
- [x] **ReportView.vue** — 4 步向导(疾病/地区/预算/确认) + 6 章节报告(患者摘要/8 国对比/评分/医院推荐/治疗方案/升级包)
- [x] **CaseView.vue** — 8 案例卡片 + 渐变头部 + 费用对比 + 底部统计 + CTA
- [x] **VisaView.vue** — Hero + 免签国家网格 + M签证说明 + 材料清单 + 时间线 + 加急服务 + FAQ 手风琴
- [x] **StepView.vue** — Hero + 6 步交替时间线(桌面居中/移动左侧) + 行动标签 + 时间费用元数据 + CTA
- [x] **AboutView.vue** — Hero + 5 价值卡 + 对比表 + 承诺区 + 3 团队卡 + 3 联系卡 + CTA

### Phase 4：医院端 5 页开发 ✅ 已完成

全部 5 个医院端页面已从 React 完整转换：

- [x] **HomeView.vue** — 8 Section：Hero(全屏渐变) + StatsBar(4 指标) + 传统vs云医对比 + 核心方案(3卡) + 管理后台(双栏) + 入驻流程(4步) + 成功案例(3卡+5星) + CTA表单(4字段)
- [x] **SolutionView.vue** — Hero + 3 定价方案(Pro/Enterprise/定制) + 10 行功能对比表 + ROI 计算器(3 输入3 输出) + 4 核心亮点
- [x] **CaseStudyView.vue** — Hero + 4 平台统计 + 3 医院案例(挑战/方案/结果/引言) + 12 月增长柱状图(CSS渐变+hover)
- [x] **ApiView.vue** — Hero + 技术架构(4 要点) + 5 API 功能卡 + 6 端点表(GET/POST/PUT色标) + 代码示例(请求+响应+复制) + 3 安全方案 + CTA
- [x] **ApplyView.vue** — Hero + 左侧栏(入驻条件5项+流程5步) + 右侧表单(8字段+14科室多选) + FAQ手风琴(5项) + CTA

### Phase 5：移动端深度适配 ✅ 已完成

全局移动端工具类 + 全部 13 页逐一优化：

- [x] **main.css 全局工具类** — 安全区域适配(safe-area-*)、滚动锁定(scroll-locked)、触摸优化(@media pointer:coarse 44px 最小触摸区)、滚动提示渐变(.scroll-hint)、响应式图表容器(.chart-container-mobile 260px/400px)
- [x] **CostView.vue** — 8 国柱状图移动端响应式(字号/条宽/旋转/间距)、表格横向滚动+移动端提示文字
- [x] **HospitalView.vue** — 详情弹窗滚动锁定(save/restore scrollY)、雷达图移动端尺寸(55%/10px)、弹窗响应式头部(h-40 md:h-56)、安全区域底部适配、tooltip confine
- [x] **CaseStudyView.vue** — 增长柱状图响应式高度(h-48 md:h-64)、间距优化(gap-1 md:gap-3)
- [x] **ReportView.vue** — 报告头部响应式内边距(px-4 md:px-8)、向导步进器小尺寸(h-8 w-8 md:h-10 w-10)、顾虑表横向滚动(min-width 480px)、费用明细表横向滚动、升级包网格响应式
- [x] **AboutView.vue** — 对比表横向滚动+sticky 首列+移动端提示、承诺区响应式内边距
- [x] **SolutionView.vue** — 功能对比表最小宽度+圆角
- [x] **ApiView.vue** — 端点表横向滚动(min-width 520px)、代码块响应式字号(text-xs md:text-sm)和内边距(p-4 md:p-6)、架构图响应式高度
- [x] **HomeView.vue** — 雷达图+柱状图移动端响应式(字号/条宽/图例/半径/间距)、图表使用.chart-container-mobile、费用矩阵 sticky 首列、Free vs Pro 表最小宽度
- [x] **ApplyView.vue** — 表单区域响应式内边距(p-4 md:p-8)

### Phase 6：构建与部署 ⏳ 待开始

生产构建优化、部署配置、最终检查清单

---

## 4. 项目文件结构

```
Studio-huanyu-Client/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.node.json
├── postcss.config.js
├── env.d.ts
├── .env.development / .env.production
├── AI-HANDOVER.md                      # 本文档
├── public/
│   ├── favicon.svg
│   └── images/                         # 所有图片素材（15 张）
└── src/
    ├── main.ts
    ├── App.vue
    ├── assets/styles/main.css          # Tailwind + CSS 变量 + 基础重置
    ├── router/index.ts                 # 13 条路由，嵌套 Layout，懒加载
    ├── stores/app.ts                   # Pinia: locale / isMobile
    ├── i18n/
    │   ├── index.ts
    │   └── locales/{zh,en,id,ru,mn}.json
    ├── composables/
    │   ├── useResponsive.ts
    │   ├── useScroll.ts
    │   └── useAppSide.ts
    ├── components/layout/
    │   ├── PatientLayout.vue
    │   ├── PatientHeader.vue
    │   ├── PatientFooter.vue
    │   ├── HospitalLayout.vue
    │   ├── HospitalHeader.vue
    │   └── HospitalFooter.vue
    ├── data/                           # 静态数据（TypeScript）
    │   ├── costs.ts                    # 费用对比数据
    │   ├── cases.ts                    # 8 患者案例
    │   ├── hospitals.ts                # 51 家医院 + cities（1362 行）
    │   ├── visa.ts                     # 签证数据（免签国/材料/流程/FAQ）
    │   ├── steps.ts                    # 6 步就医流程
    │   ├── report.ts                   # 报告数据（疾病/地区/预算/8国报告/套餐）
    │   └── hospitalB.ts                # 医院端全部数据（首页~申请入驻）
    └── views/
        ├── patient/                    # 8 个患者端页面 ✅ 全部完成
        │   ├── HomeView.vue            # 首页（9 Section + ECharts）
        │   ├── CostView.vue            # 费用对比（矩阵 + 柱状图）
        │   ├── HospitalView.vue        # 中国医院（51 院 + 弹窗 + 雷达图）
        │   ├── ReportView.vue          # 报告体验（4 步向导 + 6 章节报告）
        │   ├── CaseView.vue            # 患者案例（8 案例卡片）
        │   ├── VisaView.vue            # 签证办理（免签 + M签 + FAQ）
        │   ├── StepView.vue            # 就医步骤（交替时间线）
        │   └── AboutView.vue           # 关于我们（价值 + 对比 + 团队）
        └── hospital/                   # 5 个医院端页面 ✅ 全部完成
            ├── HomeView.vue            # 首页（8 Section + CTA 表单）
            ├── SolutionView.vue        # 解决方案（定价 + ROI + 对比）
            ├── CaseStudyView.vue       # 案例研究（3 案例 + 增长图）
            ├── ApiView.vue             # API 对接（端点 + 代码示例）
            └── ApplyView.vue           # 申请入驻（条件 + 表单 + FAQ）
```

---

## 5. 关键技术决策记录

### 5.1 Tailwind CSS 4 而非 3

使用 `@tailwindcss/vite` 插件而非 PostCSS 方式，`main.css` 中用 `@import "tailwindcss"` 而非旧版 `@tailwind` 指令。不需要 `tailwind.config.js`。

### 5.2 CSS 变量管理色彩而非 Tailwind 主题

双端色彩通过 `:root` CSS 变量定义（`--patient-primary` / `--hospital-primary` 等），在组件中用 `style` 绑定引用。这样做是因为两套色系需要在同一项目共存，且不同 Layout 下自动切换。

### 5.3 i18n 转换方式

React 版用平坦 key（`'nav.home': '首页'`），Vue 版用嵌套 JSON（`{ nav: { home: '首页' } }`）。5 语种共 17 组 key。

### 5.4 ECharts 替代 recharts

React 版用 recharts，Vue 版改用 ECharts 5 + vue-echarts 7。需要在 `<script setup>` 中 `use()` 注册图表类型和组件（如 `use([RadarChart, RadarComponent, TooltipComponent, CanvasRenderer])`），然后用 `<v-chart :option="..." autoresize />` 渲染。

### 5.5 图标动态映射模式

Vue 不能像 React 那样在数据数组中直接引用组件。解决方案是创建 `iconMap: Record<string, any>` 映射表，数据中存储图标名称字符串，模板中用 `<component :is="iconMap[item.icon]" />` 动态渲染。所有 13 个页面都使用此模式。

### 5.6 医院数据提取方式

51 家医院数据（1362 行）通过 bash `sed` 从 `Hospitals.tsx` 行 34-1366 批量提取到 `src/data/hospitals.ts`，避免手动输入。

### 5.7 Teleport 替代 React Portal

HospitalView 的详情弹窗使用 `<Teleport to="body">` 实现全屏覆盖层，等效于 React 的 fixed 定位覆盖层模式。

### 5.8 沙箱限制

- npm 网络受限（平台差异），所有 `npm install` 需用户在本地 macOS 执行
- 文件删除受限，临时文件需用户手动清理
- 开发模式下只能通过用户本地 `npm run dev` 验证

### 5.9 移动端适配策略

**重要变更**：已禁用 `postcss-px-to-viewport-8-plugin`。该插件会将 Tailwind CSS 4 生成的 px 值转为 vw，导致所有 padding/margin/spacing 在移动端被错误缩放（内容贴边、间距异常）。Kimi 原版也未使用此插件。Tailwind 自身的响应式工具类（`px-4 md:px-6 lg:px-8`、`grid-cols-2 md:grid-cols-4` 等）已完整覆盖移动端适配需求。

三层适配方案：
1. **Tailwind 响应式工具类**：使用 `px-4 sm:px-6 lg:px-8` 等断点类控制不同屏幕尺寸的间距和布局，这是主要的适配手段
2. **CSS 全局工具层**：`main.css` 中定义 `.chart-container-mobile`（260px/400px 响应式高度）、`.scroll-hint`（右侧渐变提示）、`body.scroll-locked`（弹窗滚动锁定）、`@media (pointer: coarse)` 触摸优化（44px 最小触摸区域）
3. **ECharts 响应式配置**：通过 `ref(false)` + `resize` 监听的 `isMobile` 状态，在 `computed` 中动态切换字号、半径、条宽、间距、图例尺寸等。同时为 tooltip 添加 `confine: true` 防止溢出
4. **表格横向滚动**：所有数据密集型表格使用 `overflow-x-auto` + `min-width` 确保可滚动，首列通过 `sticky left-0` 固定，移动端额外显示「左右滑动」提示

---

## 6. React 源码参考指南

### 患者端（`Kimi_Agent_双版医疗导航网站-3/patient-app/src/pages/`）

| Vue 页面 | React 源文件 | 行数 | 核心内容 |
|----------|------------|------|---------|
| HomeView | Home.tsx | ~600 | 9 Section：Hero/Stats/Features/Charts/Cases/CostMatrix/FreeVsPro/Trust/CTA |
| CostView | CostComparison.tsx | ~400 | 费用矩阵(7×8) + 柱状图(8国) + 3 节省案例 |
| HospitalView | Hospitals.tsx | 1606 | 51 医院数据 + 城市筛选 + 详情弹窗 + recharts 雷达图 |
| ReportView | ReportDemo.tsx | 672 | 4 步向导 + 6 章节报告 + 3 档升级包 |
| CaseView | Cases.tsx | 335 | 8 个患者案例卡片 |
| VisaView | Visa.tsx | 760 | 免签政策 + M签证 + 材料 + 流程 + FAQ |
| StepView | Steps.tsx | 268 | 6 步交替时间线 |
| AboutView | About.tsx | 235 | 5 价值 + 对比表 + 团队 + 联系方式 |

### 医院端（`Kimi_Agent_双版医疗导航网站-3/app/src/pages/`）

| Vue 页面 | React 源文件 | 行数 | 核心内容 |
|----------|------------|------|---------|
| HomeView | Home.tsx | 410 | 8 Section：Hero/Stats/PainVsSolution/Solutions/Dashboard/Process/Cases/CTA |
| SolutionView | Solutions.tsx | 264 | 3 定价方案 + ROI计算器 + 对比表 + 4 亮点 |
| CaseStudyView | CaseStudies.tsx | 193 | 3 医院案例 + 平台统计 + 12 月增长图 |
| ApiView | API.tsx | 256 | 5 API功能 + 6 端点表 + 代码示例 + 3 安全方案 |
| ApplyView | Apply.tsx | 283 | 入驻条件 + 5 步流程 + 表单 + FAQ |

---

## 7. 验收节点清单

| 节点 | Phase | 状态 | 核心验收内容 |
|------|-------|------|-------------|
| 1 | Phase 0 | ✅ 已完成 | 项目可运行，13 路由可跳转，i18n 可切换 |
| 2 | Phase 1 | ✅ 已完成 | 双端导航+页脚完整，移动端菜单正常 |
| 3 | Phase 2 | ✅ 已完成 | 数据层完整，7 个 data/*.ts 文件，类型齐全 |
| 4a | Phase 3 | ✅ 已完成 | 患者端首页 9 个 Section 完整 |
| 4b | Phase 3 | ✅ 已完成 | 患者端 8 页全部完成 |
| 5 | Phase 4 | ✅ 已完成 | 医院端 5 页全部完成 |
| 6 | Phase 5 | ✅ 已完成 | 移动端深度适配通过 |
| 7 | Phase 6 | ⚪ 待开始 | 构建部署就绪，最终验收 |

---

## 8. 接手指南

### 8.1 快速上手

```bash
# 1. 阅读本文档了解全貌
# 2. 启动项目
cd ~/Desktop/1024Clients/huanyu/Studio-huanyu-Client
npm install
npm run dev
# 访问 http://localhost:5173（患者端）和 http://localhost:5173/hospital（医院端）

# 3. 查看当前进度（本文档第 3 节）
# 4. 下一步：Phase 5 移动端深度适配 或 Phase 6 构建部署
```

### 8.2 开发注意事项

- **始终使用 `<script setup lang="ts">`**，不要用 Options API
- **患者端页面必须支持 i18n**，用 `const { t } = useI18n()` 获取翻译函数
- **医院端页面仅中文**，可以直接硬编码中文文本
- **图片引用路径**：`/images/xxx.jpg`（public 目录下的静态资源）
- **颜色引用方式**：大部分页面直接使用色值（如 `text-[#C05621]`），CSS 变量在 Layout 层切换
- **移动适配**：px 会被 postcss 自动转为 vw（375px 基准），Vant 组件除外
- **图标映射**：所有页面使用 `iconMap: Record<string, any>` + `<component :is="...">` 模式
- **ECharts**：需要 `use()` 注册组件，通过 `<v-chart :option="..." autoresize />` 使用

### 8.3 每次完成工作后

1. 更新本文档第 3 节的进度状态
2. 更新第 7 节验收节点状态
3. 如果有新的技术决策，更新第 5 节
4. 如果文件结构变化，更新第 4 节

---

## 9. 待清理项

- `src/i18n/convert.mjs` — 临时转换脚本，可删
- `src/i18n/locales/zh-CN.json` — 重复文件，保留 `zh.json` 即可

---

## 10. 更新日志

| 日期 | 操作者 | 内容 |
|------|-------|------|
| 2026-05-07 | Claude (Opus) | 初始文档创建。Phase 0 完成：项目脚手架、路由、i18n、Layout、13 占位页、图片素材 |
| 2026-05-07 | Claude (Opus) | Phase 1-2 完成：Layout 组件拆分、composables、患者端首页+费用对比页完整实现 |
| 2026-05-07 | Claude (Opus) | Phase 3 完成：全部 8 个患者端页面实现（Case/Visa/Step/About/Report/Hospital），含 7 个 data 文件 |
| 2026-05-07 | Claude (Opus) | Phase 4 完成：全部 5 个医院端页面实现（Home/Solution/CaseStudy/Api/Apply），hospitalB.ts 数据文件。全项目 13 页开发完毕 |
| 2026-05-07 | Claude (Opus) | Phase 5 完成：移动端深度适配。main.css 全局工具类 + 10 个页面逐一优化（ECharts 响应式、表格横向滚动+sticky、弹窗滚动锁定、安全区域、触摸优化、代码块/表单响应式） |
| 2026-05-07 | Claude (Opus) | 紧急修复：禁用 postcss-px-to-viewport-8-plugin。该插件将 Tailwind 生成的 px 值转为 vw 导致移动端布局崩坏（padding/margin 全部被错误缩放，内容贴边）。Kimi 原版未使用此插件，Tailwind 自身响应式类已足够 |
| 2026-05-07 | Claude (Opus) | 细节修复：1) en.json `about.promiseText` 反斜杠截断修复；2) About 页承诺区块 padding p-6→p-10 对齐 Kimi；3) Cases 页 header 图标 Activity→Heart 对齐 Kimi；4) en.json `footer.desc`/`about.missionText` 截断修复（此前已完成） |

<!-- 后续每次会话结束前，在此追加一行更新记录 -->
