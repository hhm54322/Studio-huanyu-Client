# 种植牙详情页

- 2026-11-24 多语排版专项：当前会话 `figma-connect.mjs` 验证 IAB 2 / tab 6，前后导出 `(34).fig`、`(35).fig`；最新 SHA-256 `35bb7e9d6daa1cecc8ffee8ea4398fb80e927af16d520bcc622be474850f13b0`。与实际实施源 `artifacts/figma-final-20261123/final.fig` 对比 `artifacts/figma-source-gate/implant-delivery-lang-20261124.json`：正文根因新页脚而 changed，滚动态 `4542:5156` 和 FAQ 辅助稿 `4542:6662` unchanged，不自动认定全页设计通过。
- 三组对照表 `4542:4004/4222/4629` 的外语单元格按同一行最高内容对齐；方案卡片 `4542:3902/3929` 同行术语和说明共享列宽及高度；流程卡片 `4542:4158` 等五组编号居中、外文段落左对齐，大写时间文本按实际宽度测量。`4542:3862/3900` 中文仍修正原稿笔误，外语使用原始词条以正确匹配四种译文。
- IAB 测量英、印尼、马来及葡语三表行线一致，未见汉字残留；390px 马来语页面无整页横向溢出。截图见 `artifacts/language-layout-fixes-20261124/implant-{en-table,en-process,ms-mobile}.png`。布局测试、类型检查、四语资源审计和直接 Vite 构建通过；全站设计审计仍有历史证据失败，本页状态继续为 implementation。

- 2026-11-24 补充接入与复核：当前会话按 `figma-connect.mjs` 验证 IAB 2 / tab 6，`2026-11-24T02:57:25Z` 的 Design、Layers 和 Inspect 可读；最终官方源 `artifacts/dental-motion-20261124/post-footer.fig` 导出于 `2026-11-24T03:08:15Z`，SHA-256 `afa8a705ad9db1fdff97fc49b8a0e0369717fba90383e556281fd694cd4d71f4`。与本页实际实施基准 `artifacts/figma-final-20261123/final.fig` 的所有节点及依赖对照见 `post-footer-comparison.json`：正文内旧页脚 `4542:4830` 隐藏，新页脚 `4759:179` 新增；滚动态 `4542:5156` 和 FAQ 辅助稿 `4542:6662` 未变，其余正文范围没有节点变动。不能将新页脚或全站审计自动认定为严格设计验收通过。
- 新页脚源 `4759:179`（1440 × 393，背景 `#021D2E`），内层 `4759:180` 为 1280 最大宽、左右 32 与上下 64 间距，主体 `4759:181` 为 1216 宽四列、间距 48；联系方式 `4759:215` 采用 14 px / 20 px、图标 16 px、图文间距 8 px，条目间距 12 px。邮箱 `4759:219/224` → `PatientFooter` 邮件链接；电话 `4759:225/229` → 电话链接；Instagram `4759:260/264/266/267/268/270` → 指定账号和主页链接；Facebook `4759:237/238/239/241` → 指定页面；WhatsApp `4759:230/231/232/233/234/236` → 现有带来源的咨询入口。二维码 `4759:242–247` 在新源中隐藏，并按用户要求不再显示；底部 WhatsApp 按钮按用户明确指令补充，其样式及位置不属于 Figma 现有节点。Instagram、Facebook、WhatsApp 图标通过当前 IAB Design 官方导出于 `public/images/figma/footer-2026-11-24/`。未经逐层 Layers / Dev Mode 交叉验收的新增页脚其余节点，保持为待验收状态；原生节点清单和参数的暂定提取位于 `artifacts/dental-motion-20261124/footer-native/`。
- 本地在内置浏览器核验首页、牙科、种植牙详情、中国医生和新闻等共用页脚；详情页 320/390/430/768/1024/1440/1920 宽度及五语检查未见横向溢出或联系区遮挡。Instagram、Facebook 和 WhatsApp 实际点击均打开对应页面，WhatsApp 到达 `huanyu china medical tourism` 并保留预填信息。桌面、手机页脚截图分别为 `footer-desktop-final.jpg`、`footer-mobile-final.jpg`；图片动态 20 个源节点、播放器和手机图片加载检查见本目录专项记录。字体/资产精确设计差异及全站 Figma 审计未完成，状态保持 implementation。

- 2026-11-24 图片动态接入与专项验证：当前会话经 `scripts/figma-connect.mjs` 验证 IAB 2 / 标签 6，`2026-11-24T02:35:29Z` 的 Design、Layers、Inspect 可读；实施前官方源 `artifacts/dental-motion-20261124/before.fig`，SHA-256 `295019c79694814c2c30a90aceeab21ebba108431820e0695843e06ee04e5c30`。对本页实际实施源 `artifacts/figma-final-20261123/final.fig` 的 `4542:3529/5156/6662` 逐层、资源和依赖比较均无变化，报告 `before-comparison.json`。实施后设计新增页脚，最终复核及未完成的设计门禁见上方记录。
- 客户新演示采用现有图片而非 GIF：普通照片 `scale(1.10) translate(-5%, -3%)` 至 `scale(1.42) translate(5%, 3%)`，6秒 ease-in-out 循环；示意图/病例 `scale(1.05) translate(-3%, -2%)` 至 `scale(1.22) translate(3%, 2%)`，8秒循环，病例依次错开0/−2/−4秒；进视野容器上移淡入，0.75秒。图片内容、固定边框及布局仍以 Figma 为准；按用户要求将动态效果用于对应图片，减弱动态偏好保持原静态图。
- 动态映射：首屏 `4542:3556`；正文照片 `4542:3616/3801/3849/3888/4073/4153/4217/4412/4521/4568/4695/4773/4548:7245`；规划与全口示意 `4542:3873/3979/3988`；三例 `4542:4305/4339/4373`。原视频播放封面和品牌图不纳入照片循环，以免影响播放控件与商标。动态层与源节点同尺寸、内部裁切，不改变卡片、文案及其它功能。
- 2026-11-23 针对性修复：当前会话 IAB 2 / 标签 6 于 `08:19:44Z` 核验 Design、Layers、Inspect；实施前及完成后的官方源见 `artifacts/dental-arrow-20261123/{before,final}.fig`，最终 SHA-256 `ea185414be057755c1b5d3656fe5e3af52f1a890eceee3fe5ec2e3f5d6054d7b`。相对 `artifacts/figma-final-20261123/final.fig`，正文 `4542:3529`、滚动态 `4542:5156` 和 FAQ 辅助稿 `4542:6662` 的节点与依赖未变，结果见 `final-implant-comparison.json`。
- 背景按每一节源节点的原始颜色或图像铺满窗口，内部仍按源稿居中；`4542:3544/3549` 的箭头统一为同稿 16 × 16 源矢量 `4542:4819`，英文 X 光按钮文案去掉重复的文字箭头。字幕按用户给出的九步文案和编号分隔样式重排，并同步更新四种译文。FAQ 截短已隐藏的原始列表占位，避免出现额外空白；五语、按钮与 1920 px 宽屏检查见 `artifacts/dental-arrow-20261123/`。全站 Figma 门禁仍有历史失败项，本页未标记 verified。
- Status: implementation — 已按设计定稿更新详情布局、表格和文案，设计审计仍待全站历史证据通过。
- 本次定稿对照导出于 `2026-11-23T07:31:19.298Z`，SHA-256 `c1c33b8fc3caa5f94d4bf08a9e815b2aeb36b59c20864177b72f241f068a69cc`，差异报告为 `artifacts/figma-final-20261123/implementation-comparison.json`。页眉标题、两组表格、病例说明、风险区和 FAQ 已按最新图层更新；医疗术语中的「灯具」按上下文修正为「种植体」。
- 最终导出于 `2026-11-23T07:57:13.363Z`，SHA-256 `7b7b03a92bf5eb89547c3bc432fbb9240de6661ceacafec08a52a9f05c6be0d3`。对比报告 `artifacts/figma-final-20261123/final-comparison.json` 中的变化为首屏容器尺寸模式及 10 个表格单元的空几何字段；其最终尺寸和隐藏底边已按最新属性保留。其余四个修改栏画框及页脚源无变化。
- 历史记录（已被 2026-11-24 更新取代）：页脚 `4542:4830` 曾使用旧邮箱和二维码；现行联系方式和二维码处理以上方新记录为准。
- 交付前官方源导出于 `2026-11-23T06:20:21.074Z`，SHA-256 `c679396b19756a3bfe5b33f625a3a444e49749976140a1ed4ea1746522be146e`。比较结果 `artifacts/dental-revision-20261123/layout-source-comparison.json` 记录三处文案变化和一处样式变化。按当前任务优先级，已重新读取 `4542:4752` 并同步 24 px 圆角、1 px 描边和底色。
- Figma「修改」页 `4542:3528`，详情正文 `4542:3529`（1440 × 27710），固定导航和吸底返回状态 `4542:5156`（1440 × 757），展开的 FAQ 辅助稿 `4542:6662`（1216 × 4352）。
- 入口：牙科项目选择页 `4542:5518`，种植牙卡片内的「更多详情」`4542:5710`。卡片原有的「查看详情」`4542:5715` 是另一层控制，保留项目摘要的展开用途。三个步骤仍属于既有牙科流程。
- 当前会话 IAB `2`，Design、Layers、Inspect 已核实。实现基准官方导出于 `2026-11-23T03:57:52.939Z`，SHA-256 `70c8cc4270f97cd6a6d61db7a32d0df11ebcc639e6a6d5844c69d211fdd283e1`。与既有牙科实现源比较，新详情、滚动态、FAQ 辅助稿及改版项目列表是新增设计。
- 原生逐节点参数、Dev Mode 样式及静态基线见 `artifacts/dental-revision-20261123/goal-native/`。前后源比较见 `final-source-comparison.json`。

| 内容或状态 | 设计节点 | 页面用途 |
| --- | --- | --- |
| 首屏及信任条 | `4542:3532`、`4542:3566` | 「发送我的 X 光片」接既有上传流程，「了解治疗流程」定位页内治疗流程 |
| 分区导航 | `4542:3588`、`4542:5201` | 六个页内目标，滚动状态以 63 px 高的可见版本为准。54 px 的 `4542:5214` 在源稿中隐藏 |
| 种植牙组成及演示 | `4542:3601` | 临床参考图、静态剖面图、互动动画和原视频按设计顺序排列 |
| 动画 | `4542:3673` / `4542:3674` | 1216 × 408，外层上留 48 px，双栏间距 24 px；两栏各宽 596 px，圆角 24 px；播放、后退、下一个、重播及完成入口 |
| 视频 | `4542:3757` / `4542:3758` | 1216 × 422，外层上留 48 px，双栏间距 28 px；播放器为 585.1953 × 329.1719，圆角 24 px；61 秒影片、九步内容、视频控件 |
| All-on-4 / All-on-6 | `4542:3876` | 动画完成入口的当前站内目标，对应演示中的 `#allon` |
| 其余正文 | `4542:3789`、`4542:3852`、`4542:4061`、`4542:4141`、`4542:4205`、`4542:4284`、`4542:4400`、`4542:4509`、`4542:4556`、`4542:4683`、`4542:4761` | 护理标准、数字化规划、适应症、治疗流程、材料、病例、评价、恢复、出行、风险和相关治疗 |
| 常见问题 | `4548:7233` / `4542:6662` | 正文稿确定默认折叠外观，辅助稿提供展开后的答案和布局 |
| 最终行动区 | `4542:4805` | 上传 X 光片或返回常见问题 |
| 吸底返回 | `4542:5416` / `4542:5418` | 80 px 高操作区，包含 199 × 48「返回选择牙科项目」入口 |

甲方演示中，动画入视口后自动播放一次，每 1900 ms 前进到下一阶段。阶段为缺牙、植体、基台、牙冠、完成，部件渐显 450 ms，标签和进度变化 400 ms。重播回到首帧，切换前后阶段时停止自动播放。SVG 原始路径、视频 MP4/WebM 和九步文字已保存在同目录 `reference/`，动画和影片已在独立预览实测。演示原封面资源返回 404，预览用图中所示深色封面和已取得的原品牌图。本地已验证减弱动态效果及返回后的流程状态。

## Runtime mapping

- Route: `/dental/implants`，由牙科项目「更多详情」进入。
- Source baseline HTML: `artifacts/dental-revision-20261123/goal-native/implant/baseline-2026-11-23.html`
- Source baseline CSS: `artifacts/dental-revision-20261123/goal-native/implant/dev-styles-2026-11-23.css`
- Source asset manifest: `docs/figma-source/november-revision-2026-11-23/implant/assets-2026-11-23.json`
- Source extraction run: IAB 2，原标签 1，滚动态复核标签 6。正文 1626，滚动态 267，FAQ 辅助稿 193。逐层 Design、Layers、Inspect 数据和源锁分别存于 `artifacts/dental-revision-20261123/goal-native/` 和 `implant-baseline/`。
- Mobile frame: 本轮「修改」只有桌面源。手机使用原图比例、文字自然换行、单列卡片和横向可滚动的页内导航。

## Assets

| 资源 | 设计节点 | 项目路径 |
| --- | --- | --- |
| 首屏诊疗图 | `4542:3556` | `/images/figma/dental-implants-2026-11-23/image-36c538be5a733f483b0f759ad199d542a080e976.webp` |
| 静态剖面图 | `4542:3629` | `/images/figma/dental-implants-2026-11-23/node-4542-3629.svg`，Figma 完整图层导出 |
| 原动画路径 | `4542:3676` | `src/components/common/implant-anatomy.svg`，取自 WorkBuddy 演示的 SVG |
| 原版视频 | `4542:3781` | `/images/figma/dental-implants-2026-11-23/media/implant-journey-v3.{webm,mp4}` |
| 视频封面 | `4542:3781` | `/images/figma/dental-implants-2026-11-23/image-f37db12d67c999765150a40b6aa768d4b2d99596.webp`，采用设计稿原图 |
| 返回箭头 | `4542:5419` | `/images/figma/dental-implants-2026-11-23/node-4542-5419.svg` |

## Prototype And Motion

- 六个页内锚点随阅读位置更新选中项。导航到达顶部后保持固定，返回按钮进入正文后显示，到达页脚前释放回页面。
- 动画入视口 45% 后播放，1900 ms 一个阶段，部件渐显 450 ms，标签和进度条 400 ms。支持暂停、前后切换、重播和完成后跳转到 All-on-4 / All-on-6。减弱动态效果时可手动切换全部阶段。
- 影片点击后才请求资源，优先 WebM，回退 MP4，支持浏览器控件。九步说明支持站点五语。页面内原动画在首帧等待，而 Figma 正文静态示例保留完成状态。
- FAQ 正文默认折叠，按展开稿的 23 个题目接入正确答案。All-on-4 问题中的「日元」依正文和同条报价上下文修正为「人民币」。Straumann 段落在 Figma 截断，按演示补全结尾。
- X 光片入口保留原来的牙科上传流程。报告生成与医院后台无此改动。

## Verification

- Figma reference screenshot: `artifacts/dental-revision-20261123/goal-native/implant/figma-reference.png`
- Local desktop screenshot: `artifacts/dental-revision-20261123/goal-native/implant/local-desktop.png`
- Local mobile screenshot: `artifacts/dental-revision-20261123/goal-native/implant/local-first-390.png`
- Verification run: 2026-11-23。本地测到 61 秒、1280×720，分别播放原版 WebM 和 MP4，23 个 FAQ 答案均可打开且各不相同。完成动画后跳转、返回牙科项目和进入上传页通过。证据为 `behavior-final.json` 和 `goal-native/layout-matrix.json`。
- 最终截图包括正文、动画第 0 / 2 / 4 步、固定导航、页脚释放和展开 FAQ。专项结果见 `goal-native/final-state-captures-implant.json` 和 `goal-native/implant/animation-layout.json`。
- Remaining differences: 动画滚入播放保留演示的动态状态，Figma 为完成态示意。九步内容可展开阅读。全站设计审计仍存在历史源锁或证据校验失败。
