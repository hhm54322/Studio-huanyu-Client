# 寰宇云医 Vue 3 项目 — AI 交接文档

> **重要约定**：每完成一个 Phase 或发生重大决策变更后，必须更新本文档对应章节。这是跨会话协作的唯一上下文来源。

> **最后更新**：2026-05-07 | Phase 0 完成，待用户验收

---

## 1. 项目概述

**项目名称**：Studio-huanyu-Client（寰宇云医 H5 前端）

**一句话描述**：将 Kimi AI 生成的跨境医疗旅游网站（React 双项目）改造为自研 Vue 3 单体项目，面向 H5 平台，适配移动端和桌面端。

**项目位置**：`~/Desktop/1024Clients/huanyu/Studio-huanyu-Client/`

**原始素材位置**：`~/Desktop/1024Clients/huanyu/Kimi_Agent_双版医疗导航网站-3/`
- `patient-app/` — 患者端 React 源码（C端，8 页，橙色主题，5 语言 i18n）
- `app/` — 医院端 React 源码（B端，5 页，深蓝主题，仅中文）
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
移动适配：postcss-px-to-viewport-8-plugin（基准 375px，排除 Vant）
```

---

## 3. 开发阶段与当前进度

完整计划见 `~/Desktop/1024Clients/huanyu/寰宇云医-Vue3详细开发计划-执行版.md`，共 7 个 Phase、8 个验收节点。

### Phase 0：项目初始化 ✅ 已完成（待用户验收）

已完成的工作：

- [x] Vite + Vue 3 + TS 项目脚手架（package.json / vite.config.ts / tsconfig.json 等）
- [x] Tailwind CSS 4 配置 + CSS 变量双色系（main.css）
- [x] postcss-px-to-viewport 移动适配配置（375px 基准）
- [x] Vant 4 自动按需引入（unplugin-vue-components + VantResolver）
- [x] Vue Router 4 路由配置（13 条路由，嵌套 Layout，懒加载）
- [x] Pinia store（locale + isMobile）
- [x] vue-i18n 配置 + 5 语言 JSON 文件（从 React LanguageContext.tsx 转换，17 组 key）
- [x] App 入口文件（main.ts / App.vue）
- [x] PatientLayout.vue — 完整导航栏（8项 + 5语言切换 + 汉堡菜单）+ 页脚
- [x] HospitalLayout.vue — 完整导航栏（5项 + 立即入驻 CTA + 汉堡菜单）+ 页脚
- [x] 13 个占位页面（带标题 + 待实现提示）
- [x] 图片素材复制（15 张 JPG/PNG → public/images/）
- [x] favicon.svg（橙色渐变"寰"字）

待用户操作：
```bash
cd ~/Desktop/1024Clients/huanyu/Studio-huanyu-Client
npm install
npm run dev
# 访问 http://localhost:5173（患者端）和 http://localhost:5173/hospital（医院端）
```

待清理（无法在沙箱删除，需用户手动）：
- `src/i18n/convert.mjs` — 临时转换脚本，可删
- `src/i18n/locales/zh-CN.json` — 重复文件，保留 `zh.json` 即可

### Phase 1：布局与导航 ⏳ 待开始

> 注意：Phase 0 中 PatientLayout 和 HospitalLayout 已经包含了较完整的导航和页脚实现。Phase 1 原计划的内容已提前完成大部分，用户验收时可能会合并或跳过此阶段。根据用户反馈决定是否需要细化拆分 Header/Footer 为独立组件、添加 composables 等。

### Phase 2：数据层提取 ⏳ 待开始

从 React 源码中提取所有硬编码数据到 `src/data/` 和 `src/types/`：
- 42+ 家医院数据、8 国费用矩阵、8 个患者案例、签证数据、报告模板等
- 创建 TypeScript 接口定义
- 创建 API 抽象层（当前本地数据，未来可替换 HTTP）

### Phase 3：患者端 8 页开发 ⏳ 待开始

按顺序：首页（9 Section）→ 费用对比 → 中国医院 → 报告体验（4步向导）→ 患者案例 → 签证办理 → 就医步骤 → 关于我们

### Phase 4：医院端 5 页开发 ⏳ 待开始

首页（8 Section）→ 解决方案（含 ROI 计算器）→ 案例研究 → API 对接 → 申请入驻（含表单）

### Phase 5：移动端深度适配 ⏳ 待开始

触摸优化、图表适配、表单优化、性能优化、安全区域等

### Phase 6：构建与部署 ⏳ 待开始

生产构建优化、部署配置、最终检查清单

---

## 4. 项目文件结构

```
Studio-huanyu-Client/
├── index.html                          # 入口 HTML
├── package.json                        # 依赖声明（需 npm install）
├── vite.config.ts                      # Vite 配置（Vue + Tailwind + Vant 自动引入）
├── tsconfig.json                       # TS 配置（resolveJsonModule 已开启）
├── tsconfig.node.json                  # Vite 用 TS 配置
├── postcss.config.js                   # px-to-vw 移动适配
├── env.d.ts                            # 类型声明（Vite + .vue 模块）
├── .env.development / .env.production  # 环境变量
├── public/
│   ├── favicon.svg                     # 橙色渐变"寰"字图标
│   └── images/                         # 所有图片素材（15 张）
│       ├── hero-orange.jpg / hero-bg.jpg / ...（患者端）
│       └── hospital/                   # 医院端图片（4 张）
└── src/
    ├── main.ts                         # 入口：Vue + Pinia + Router + i18n + 样式
    ├── App.vue                         # 根组件：RouterView + 过渡动画 + 响应式初始化
    ├── assets/styles/main.css          # 全局样式：Tailwind + CSS 变量 + 基础重置
    ├── router/index.ts                 # 路由：13 条，嵌套 Layout，懒加载
    ├── stores/app.ts                   # Pinia：locale / isMobile / setLocale
    ├── i18n/
    │   ├── index.ts                    # vue-i18n 配置
    │   └── locales/{zh,en,id,ru,mn}.json  # 5 语言翻译文件
    ├── components/layout/
    │   ├── PatientLayout.vue           # 患者端 Layout（导航 + RouterView + 页脚）
    │   └── HospitalLayout.vue          # 医院端 Layout（导航 + RouterView + 页脚）
    ├── views/
    │   ├── patient/                    # 8 个患者端页面（当前为占位）
    │   │   ├── HomeView.vue            # 首页（含 Hero 占位）
    │   │   ├── CostView.vue            # 费用对比
    │   │   ├── HospitalView.vue        # 中国医院
    │   │   ├── ReportView.vue          # 报告体验
    │   │   ├── CaseView.vue            # 患者案例
    │   │   ├── VisaView.vue            # 签证办理
    │   │   ├── StepView.vue            # 就医步骤
    │   │   └── AboutView.vue           # 关于我们
    │   └── hospital/                   # 5 个医院端页面（当前为占位）
    │       ├── HomeView.vue            # 医院端首页
    │       ├── SolutionView.vue        # 解决方案
    │       ├── CaseStudyView.vue       # 案例研究
    │       ├── ApiView.vue             # API 对接
    │       └── ApplyView.vue           # 申请入驻
    ├── composables/                    # 组合式函数（待创建）
    ├── types/                          # TypeScript 类型（待创建）
    ├── data/                           # 静态数据（待创建）
    └── api/                            # API 抽象层（待创建）
```

---

## 5. 关键技术决策记录

### 5.1 Tailwind CSS 4 而非 3

使用 `@tailwindcss/vite` 插件而非 PostCSS 方式，`main.css` 中用 `@import "tailwindcss"` 而非旧版 `@tailwind` 指令。不需要 `tailwind.config.js`。

### 5.2 CSS 变量管理色彩而非 Tailwind 主题

双端色彩通过 `:root` CSS 变量定义（`--patient-primary` / `--hospital-primary` 等），在组件中用 `style` 绑定引用。这样做是因为两套色系需要在同一项目共存，且不同 Layout 下自动切换。

### 5.3 i18n 转换方式

React 版用平坦 key（`'nav.home': '首页'`），Vue 版用嵌套 JSON（`{ nav: { home: '首页' } }`）。通过 `convert.mjs` 脚本批量转换。5 语种共 17 组 key（nav/footer/hero/stat/feature/cases/case/costTable/compare/trust/cta/cost/report/pkg/hospitals/about/common）。

### 5.4 Layout 已内嵌导航和页脚

Phase 0 中 PatientLayout 和 HospitalLayout 直接包含了完整的 Header + Footer，没有拆成独立组件。如果后续需要复用或测试，可以拆分。

### 5.5 沙箱限制

- npm 网络被沙箱拦截（403），所有 `npm install` 需用户在本地执行
- 文件删除受限，临时文件需用户手动清理
- 开发模式下只能通过用户本地 `npm run dev` 验证

### 5.6 图表选型

React 版用 recharts，Vue 版改用 ECharts 5 + vue-echarts 7。雷达图、柱状图、趋势图等都需要用 ECharts option 重写。

---

## 6. React 源码参考指南

接手时实现各页面需要回读 React 源码。以下是每个文件的位置和核心内容：

### 患者端（`Kimi_Agent_双版医疗导航网站-3/patient-app/src/`）

| Vue 页面 | React 源文件 | 核心内容 |
|----------|------------|---------|
| HomeView | `pages/Home.tsx` | 9 Section：Hero/Stats/Features/Charts(radar+bar)/Cases/CostMatrix/FreeVsPro/Trust/CTA |
| CostView | `pages/CostComparison.tsx` | 费用矩阵(7×8) + 柱状图(8国) + 3 节省案例 |
| HospitalView | `pages/Hospitals.tsx` | 42+ 医院数据 + 城市筛选 + 展开详情面板 |
| ReportView | `pages/ReportDemo.tsx` | 4 步向导 + 6 章节报告 + 3 档升级包 |
| CaseView | `pages/Cases.tsx` | 8 个患者案例（来自 8 国） |
| VisaView | `pages/Visa.tsx` | 免签政策(3区域45国) + M签证 + 材料 + 流程 + FAQ |
| StepView | `pages/Steps.tsx` | 6 步就医时间轴 |
| AboutView | `pages/About.tsx` | 5 核心价值 + 对比表 + 团队 + 联系方式 |
| — | `context/LanguageContext.tsx` | **所有翻译字符串**（~1306 行，5 语种） |

### 医院端（`Kimi_Agent_双版医疗导航网站-3/app/src/`）

| Vue 页面 | React 源文件 | 核心内容 |
|----------|------------|---------|
| HomeView | `pages/Home.tsx` | 8 Section：Hero/Stats/Comparison/Solutions/Dashboard/Process/Cases/CTA表单 |
| SolutionView | `pages/Solutions.tsx` | 3 定价方案 + ROI计算器 + 对比表 + 4 亮点 |
| CaseStudyView | `pages/CaseStudies.tsx` | 3 医院案例 + 平台统计 + 12 月增长图 |
| ApiView | `pages/API.tsx` | 5 API功能 + 6 端点表 + 代码示例 + 3 安全方案 |
| ApplyView | `pages/Apply.tsx` | 入驻条件 + 5 步流程 + 表单(14科室多选) + FAQ |

---

## 7. 验收节点清单

| 节点 | Phase | 状态 | 核心验收内容 |
|------|-------|------|-------------|
| 1 | Phase 0 | 🟡 待验收 | 项目可运行，13 路由可跳转，i18n 可切换 |
| 2 | Phase 1 | ⚪ 待开始 | 双端导航+页脚完整，移动端菜单正常 |
| 3 | Phase 2 | ⚪ 待开始 | 数据层完整，类型定义完备，构建无错误 |
| 4a | Phase 3 | ⚪ 待开始 | 患者端首页 9 个 Section 完整 |
| 4b | Phase 3 | ⚪ 待开始 | 患者端 8 页全部完成 |
| 5 | Phase 4 | ⚪ 待开始 | 医院端 5 页全部完成 |
| 6 | Phase 5 | ⚪ 待开始 | 移动端深度适配通过 |
| 7 | Phase 6 | ⚪ 待开始 | 构建部署就绪，最终验收 |

---

## 8. 接手指南

### 8.1 快速上手

```bash
# 1. 阅读本文档了解全貌
# 2. 阅读详细开发计划
cat ~/Desktop/1024Clients/huanyu/寰宇云医-Vue3详细开发计划-执行版.md

# 3. 了解当前项目结构
ls -la ~/Desktop/1024Clients/huanyu/Studio-huanyu-Client/src/

# 4. 查看当前进度（本文档第 3 节）

# 5. 开始下一个待办 Phase
```

### 8.2 开发注意事项

- **始终使用 `<script setup lang="ts">`**，不要用 Options API
- **患者端页面必须支持 i18n**，用 `const { t } = useI18n()` 获取翻译函数
- **医院端页面仅中文**，可以直接硬编码中文文本
- **图片引用路径**：`/images/xxx.jpg`（public 目录下的静态资源）
- **颜色引用方式**：使用 CSS 变量 `var(--patient-primary)` 而非硬编码色值
- **移动适配**：px 会被 postcss 自动转为 vw（375px 基准），Vant 组件除外
- **添加新依赖时**：更新 package.json 后告知用户执行 `npm install xxx`
- **ECharts 替代 recharts**：所有图表需用 ECharts option 格式重写

### 8.3 每次完成工作后

1. 更新本文档第 3 节的进度状态
2. 更新第 7 节验收节点状态
3. 如果有新的技术决策，更新第 5 节
4. 如果文件结构变化，更新第 4 节

---

## 9. 更新日志

| 日期 | 操作者 | 内容 |
|------|-------|------|
| 2026-05-07 | Claude (Opus) | 初始文档创建。Phase 0 完成：项目脚手架、路由、i18n、Layout、13 占位页、图片素材 |

<!-- 后续每次会话结束前，在此追加一行更新记录 -->
