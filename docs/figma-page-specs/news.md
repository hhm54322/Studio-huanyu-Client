# 新闻与咨询

- Status: implementation — 已接入并通过桌面、手机布局和交互复测，设计提供的文章摘要可读。
- 2026-11-23 定稿对照使用 `artifacts/figma-final-20261123/final.fig`，新闻帧 `4542:5973` 全节点和依赖未变化。共享页脚更新为种植牙详情页中的定稿 `4542:4830`，联系方式及品牌图见 `dental-implant.md`。
- 交付前官方源 `2026-11-23T06:20:21.074Z` 导出，新闻页 688 个节点与关联资源均未变更。证据见 `artifacts/dental-revision-20261123/layout-source-comparison.json`。
- Figma「修改」页 `4542:3528`，完整设计帧 `4542:5973`（1440 × 4846）。
- 当前会话 IAB `2` / 标签 `1`，Design、Layers、Inspect 已核实。当前官方导出于 `2026-11-23T03:57:52.939Z`，SHA-256 `70c8cc4270f97cd6a6d61db7a32d0df11ebcc639e6a6d5844c69d211fdd283e1`。原生 688 个节点均纳入记录，其中 577 个可见；隐藏的同类稿用于状态比对。节点、图片和重点 Dev Mode 数据见 `artifacts/dental-revision-20261123/`。

| 可见模块 | 设计节点 | 主要能力 |
| --- | --- | --- |
| 首屏及搜索 | `4542:6015` | 疾病、疗法和案例关键词搜索，热门搜索快捷入口 |
| 本期推荐 | `4542:6054` | 推荐内容及阅读入口 |
| 全部内容 | `4542:6100` | 分类筛选、内容卡片及列表 |
| 信任说明 | `4542:6458` | 内容来源、医学审校、故事隐私边界 |
| 行动区 | `4542:6516` | 咨询阿宁、免费评估 |
| 页眉页脚 | `4542:6617`、`4542:6540` | 共用导航新增新闻入口 |

同名首屏 `4542:5976` 及信任说明候选 `4542:6428`、`4542:6488` 在当前设计中隐藏。逐节点静态参数见本轮源记录。

## Runtime mapping

- Route: `/news`，由公共导航进入。
- Source baseline HTML: `artifacts/dental-revision-20261123/goal-native/news/baseline-2026-11-23.html`
- Source baseline CSS: `artifacts/dental-revision-20261123/goal-native/news/dev-styles-2026-11-23.css`
- Source asset manifest: `docs/figma-source/november-revision-2026-11-23/news/assets-2026-11-23.json`
- Source extraction run: IAB 2 / 标签 1，688 个节点逐层比对，记录见 `artifacts/dental-revision-20261123/goal-native/news/`。
- Mobile frame: 本轮仅有桌面源，手机沿用相同内容层级和图源，卡片改为单列，平板为双列。

## Assets

| 资源 | 设计节点 | 项目路径 |
| --- | --- | --- |
| 首屏背景 | `4542:6015` | `/images/figma/news-2026-11-23/image-63cc290c0f6b33b798ab87a0dd99f887e4a5c5a2.webp` |
| 本期推荐照片 | `4542:6062` | `/images/figma/news-2026-11-23/image-e96534af5458e6582ef54fb9e708a0c35dec782c.webp` |
| 搜索图标 | `4542:6024` | `/images/figma/news-2026-11-23/node-4542-6024.svg` |

## Prototype And Motion

搜索、热门词、分类、日期排序、结果计数及摘要弹窗可用。页尾按钮进入阿宁和免费评估。设计中可见 9 张内容卡，示例写了 12 篇；按 9 条有效数据计算，不显示未有对应内容的加载更多入口。推荐和列表使用设计提供的标题、封图、摘要，点击打开原摘要。Figma 范围没有详细文章或外部正文地址。

## Verification

- Figma reference screenshot: `artifacts/dental-revision-20261123/goal-native/news/figma-reference.png`
- Local desktop screenshot: `artifacts/dental-revision-20261123/goal-native/news/local-desktop.png`
- Local mobile screenshot: `artifacts/dental-revision-20261123/goal-native/news/local-first-390.png`
- Verification run: 2026-11-23。首屏、推荐、列表与信任区对照截图已留档，9 张卡片图片在桌面及手机高度统一。搜索、排序、分类、摘要与咨询入口已实测。五语及各屏宽证据见 `goal-native/layout-matrix.json` 和 `goal-native/final-state-captures-other.json`。
- Remaining differences: 依据已提供内容，阅读全文使用查看摘要，底部无「查看更多内容 (3篇)」入口。全站设计审计有历史源锁或旧截图校验失败。
