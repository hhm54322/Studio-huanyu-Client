# 中国医院

- Route: `/hospitals`
- Figma frame: `07寰宇云医 - 中国医院`
- Node ID: `144:4707`
- Source baseline HTML: `docs/figma-source/hospitals/baseline-2026-10-20.html`，各详情状态同名文件位于对应子目录
- Source baseline CSS: `docs/figma-source/hospitals/dev-styles-2026-10-20.css`
- Source asset manifest: `docs/figma-source/hospitals/assets-2026-10-20.json`
- Source extraction run: `2026-10-20`，最新官方原生导出、UI Layers、逐节点 Dev Mode 三方核对
- Desktop frame: `1440 x 2440px`
- Mobile frame: `1620:581`, 375×4223（网站根 `1620:582`，不含设备容器）
- Status: verified (desktop; mobile deferred by user)

用户于2026-10-20暂停移动端开发与验收（设计未定稿）。本次继续执行的范围仅为桌面列表、详情、事件和动效；移动源锁保留，不宣称移动完成。

## 当前批次 — 2026-10-20

本节覆盖下方旧版verified与“无独立手机帧”的历史结论。官方导出 `/Users/hhm/Downloads/寰宇云医 (2).fig`，时间 `2026-10-20T23:36:07.569Z`，SHA256 `29d97343e7e947187db27918706dc9b16c2f7886e08cf2dba453ed1a83bfb1bc`。本轮医院共22个源集，目录 `sources-2026-10-20.json`。静态参数提取和源锁完成前不改Vue/CSS。

| 范围 | 桌面源 | 手机源 | 接入边界 |
| --- | --- | --- | --- |
| 医院列表 | `144:4707`，625节点 | `1620:581`，567原生节点 | 独立卡片顺序/尺寸/文字，不用桌面缩小；保留城市筛选及咨询 |
| 普通医院详情 | 既有真实医院数据及详情行为 | `1626:277`、`1626:402`、`1626:476` | 本人医院信息；纠正源稿协和英文误写曜影的明显错误，不混用曜影专属介绍 |
| 上海曜影首屏与菜单 | `1487:5`、`1487:119` | `1620:1878`、`1620:2024`、`1620:2126` | 专属医院数据，滚动固定菜单；关闭后焦点与页面位置恢复 |
| 曜影六内容 | `1487:232/412/572/717/883/1037` | `1620:1165/1309/1428/1534/1661/1777` | 医院概况、科室中心、国际服务、医疗实力、院区网点、认证荣誉；图表用ECharts |

在线新稿新增医院/中国医生入口 `1741:5732`（子节点 `1741:5735/5736/5733/5734`），已重新导出真实源文件而非沿用10月19日原生副本。“中国医生”的完整页面源在本项源范围外，后续医生批次绑定；不能擅自给它复制医院内容。

22组源集的Layers、逐节点Dev Mode、原生参数全部齐全（共3719原生节点），已生成原始HTML/CSS、370条资源映射、完整Node-to-DOM映射和哈希锁。雷达图的逐节点路径与文字参数纳入锁，接入ECharts而非图表SVG。桌面列表、详情首屏、六个详情分区及其交互/动效已完成并通过本批次门禁；移动端设计尚未定稿，保留已提取源文件但暂停开发和验收。下方2026-09-29记录仅为历史。

## Customer mobile-density correction — 2026-10-10

There is no independent phone frame. The desktop card geometry, source crops, badge records and node mapping below remain authoritative. Up to 650px, the directory uses natural card/body height, a proportional cover image with height `clamp(128px, 38vw, 164px)`, 16px body padding, 18/27px hospital names and wrapping specialties/facts. Both card actions have 44px height. The location badge is anchored 12px above the image's lower edge rather than retaining its desktop Y coordinate. The mobile hero uses a 520px stage, a 290px proportional image region and 32/42px text; these are explicit responsive adaptations to the customer's oversized-phone-layout feedback. Evidence is stored locally in ignored `artifacts/mobile-feedback-2026-10-10/`; modal details, city filters and consultation behavior are retained.

## Source Gate

- Complete Layers inventory: `layers-2026-09-29.json`, 566 nodes.
- Every node selected and Dev Mode CSS copied: `dev-mode-2026-09-29.json`, 566 records.
- Native cross-check: `native-inventory-2026-09-29.json` and `native-parameters-2026-09-29.json`, 566 records; no missing ID, parent or displayed sibling-order mismatch.
- Native source SHA256: `f46e9364d764719ef3534683e7a8ab3289f0d4dda20e10292373fcb7a18d74eb`.
- Concrete mapping: `node-to-code-2026-09-29.json`, 566 selectors, including exact exported vector owners; every source node is also present in the static HTML.
- Source lock: `baseline-lock-2026-09-29.json`.
- Editable authored card data: `card-data-2026-09-29.json`. Original image paints/crops: `native-image-paints-2026-09-29.json`.
- All filenames above are under `docs/figma-source/hospitals/`. Historical `frame.html` and `styles.txt` do not override this locked baseline.

## Layer Mapping

The complete per-node hierarchy, source CSS, parameter and DOM mapping is recorded in the JSON files above. Key nodes:

| Node ID | Layer | Parent Node ID | Vue element | Exact values |
| --- | --- | --- | --- | --- |
| `144:4707` | page frame | `143:2` | `.hospital-page` | 1440 x 2440 |
| `144:4710` | hero | `144:4709` | `.hospital-hero` | 1440 x 460 |
| `144:4711` | hero content | `144:4710` | `.hospital-hero__content` | x112/y141.5, 1216 x 211 |
| `144:4728` | hero title | `144:4712` | `h1` | PingFang SC600, 64/96 |
| `144:4730` | subtitle | `144:4712` | `p` | PingFang SC400, 20/29 |
| `144:4732` | tabs | `144:4731` | `.city-tabs` | 1216 x 42, gap16 |
| `144:4748` | grid | `144:4731` | `.hospital-grid` | 1216 x1290, columns389.3333, gap24 |
| `144:4749` | Union card | `144:4748` | `article[data-figma-node]` | row1/col1, 389.3333 x398 |
| `144:4803` | Cancer Hospital card | `144:4748` | `article[data-figma-node]` | row1/col3 |
| `144:4852` | University Cancer card | `144:4748` | `article[data-figma-node]` | row2/col1 |
| `144:4901` | University People card | `144:4748` | `article[data-figma-node]` | row2/col2 |
| `144:4950` | University Third card | `144:4748` | `article[data-figma-node]` | row2/col3 |
| `144:5005` | China-Japan Friendship card | `144:4748` | `article[data-figma-node]` | row3/col1 |
| `144:5055` | Anzhen card | `144:4748` | `article[data-figma-node]` | row3/col2 |
| `144:5104` | Fuwai card | `144:4748` | `article[data-figma-node]` | row1/col2 |
| `144:5154` | footer | `144:4707` | `PatientFooter.vue` | 1440 x456 |

Grid DOM order retains Layers order; desktop placement uses native grid coordinates, which are not the same as Layers order.

## Sections

| Section | Node ID | Width | Height | Layout |
| --- | --- | ---: | ---: | --- |
| Hero | `144:4710` | 1440 | 460 | content x112/y141.5, actual source image |
| Directory | `144:4731` | 1440 | 1524 | padding96/40, 1216px content, grid top padding48 |
| Footer | `144:5154` | 1440 | 456 | shared shell |

Header overlays the hero. Total desktop height is exactly 2440px.

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Hero title | `144:4728` | PingFang SC | 64/96 | 600 | #143162 |
| Subtitle | `144:4730` | PingFang SC | 20/29 | 400 | #5B606A |
| Union title | `144:4767` | PingFang SC | 24/36 | 600 | #111827 |

Other titles use the exact per-card font data in the source JSON. SF Pro Medium has native weight 510; CSS nominal500 is supplemented with that native value. Source letter-spacing is normalized to zero under the application instruction; minor glyph rasterization differences are accepted, not a pixel-identity claim.

## Components And Spacing

- Hero inner copy: 644 x211, gap24. Chips: 106 x38, gap4, padding12/16, source icons14px, blue10% fill.
- Hero background: original 2814 x878 image; exact Dev crop `-174px -31.688px / 112.106% 109.497% no-repeat`.
- Inactive tabs: 82 x42, border1 #DBDEE6, radius24, PingFang400 16/16 #1E3A5F. Beijing: 80 x42, #DD6B20, weight500 16/18.
- Cards: 389.3333 x398, image192 +body206, body padding20/24/24, no visible border, radius24, #F5F6F7, shadow0/1/2 rgba(0,0,0,.05).
- Specialties: row36 including top12; tags24, padding4/8, font12/16. Facts: row36 including top16, gap16, source icons14, font14/20 #6B7280.
- Actions: row54 including top16, buttons38, gap8, widths168.6133/164.72, radius10, font14/20.
- Mobile retains source assets, uses single-column cards and horizontally scrolling tabs; hero fallback uses the hero section fill instead of exposed gray image-paint fallback. Title uses balanced wrapping.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Hero | `144:4710` | original lossless WebP, exact Dev crop | `public/images/figma/hospital-source/node-144-4710.webp` |
| Union photo | `144:4751` | original image pixels and authored crop | `public/images/figma/hospital-source/node-144-4751.webp` |
| JCI icon | `144:4754` | exact SVG | `public/images/figma/hospital-source/node-144-4754.svg` |
| Location icon | `144:4761` | exact SVG | `public/images/figma/hospital-source/node-144-4761.svg` |
| Calendar icon | `144:4777` | exact SVG | `public/images/figma/hospital-source/node-144-4777.svg` |

The manifest contains all 187 exact asset rows and source owners. Photos do not bake text/badges; live semantic text and separate source icons remain inspectable.

## Prototype And Motion

| Interaction | Reference | Trigger | Timing/Easing | Mobile/Reduced Fallback |
| --- | --- | --- | --- | --- |
| City filter | prototype state / existing hospital constants | click, Enter, Space | color transition .25s ease, aria-pressed | horizontal tab scroll; reduced transitions disabled |
| Detail modal | existing patient business flow | detail action | opacity .25s, panel .3s | bottom sheet; focus trap, Escape, restoration |
| Consultation | existing open-consultation event | direct action or modal CTA | transfers to consultation panel | same business event |
| Reveal | Octagos scroll vocabulary | viewport/scroll | opacity .62s, lift .72s cubic-bezier(.22,1,.36,1), stagger45ms | readable resting content with reduced motion |
| Hover | Octagos restrained interactive feedback | pointer | lift6px .38s, photo1.025 .7s | reduced-motion removes transforms |

Octagos was actively inspected through scrolling, Device Volume tabs and accordion interaction. Motion does not restructure Figma or change resting card dimensions. Existing hospital modal content is retained, not claimed as an authored state inside this resting source frame.

## Verification

### Desktop current-source recheck — 2026-10-29

Latest source `/Users/hhm/Downloads/寰宇云医 (10).fig` was compared with the actual `2026-10-20` implementation source `(2).fig`. `artifacts/figma-source-gate/current-hospitals-2026-10-29.json` reports all nine desktop roots unchanged: list, initial detail, pinned menu and six content tabs. New/removed source frames and dependency changes were also inspected; only mobile hospital states changed outside this desktop scope.

Fresh local desktop captures and behavior/motion runs are archived under `artifacts/figma-hospitals-2026-10-29/`, with `rerun-provenance.json` recording the original QA output directory. List hero/directory/footer normalized RGB error is `0.9452/0.7037/0.2719%`; detail initial state `0.7965%`; six complete tabs `0.7798/0.5661/0.5754/0.4992/0.7898/0.5849%`. All are below 1%. Five city filters, real hospital selection, six tab source owners, keyboard, consultation handoff, Escape/backdrop/focus/scroll restoration pass at 1024/1440/1920. Short 600/754px screens, reveal/hover, dialog/tab motion and reduced-motion pass. No runtime errors, broken images or horizontal overflow. Mobile remains deferred.

- Current desktop verification: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-hospitals-2026-10-20/list-qa.json`, `detail-qa.json`, `behavior-qa.json`, `motion-qa.json`
- Desktop screenshot gate: list hero/directory/footer and detail opening state plus all six content sections are each below 1% nMAE.
- Desktop interaction gate: 1024/1440/1920 city filters, 52/15/11/6/9 directory counts, real hospital mapping, six tabs, gallery, focus trap, Escape/backdrop close, scroll restoration, consultation transfer, header dropdown/language menu and contact links.
- Desktop motion gate: card reveal/hover, dialog fade/lift, tab fade, sticky tab boundary, short 600px/754px viewport, and reduced-motion fallback.
- Mobile geometry: deferred by user; mobile Figma design is not final, so no mobile implementation or acceptance is claimed in this batch.

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-hospitals-2026-10-20/hospitals-figma.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/artifacts/figma-hospitals-2026-10-20/list-1440-local.png`
- Local mobile: deferred by user; older mobile screenshots below are historical and do not constitute current acceptance.
- Verification run: `2026-10-20`, final evidence written `2026-10-21T04:04:46Z`; desktop scope only.
- Remaining differences: none
- Accepted minor rendering tolerance: glyph antialiasing/tracking and subpixel image sampling; not mathematical pixel identity. Mobile is adaptation, not comparison against a nonexistent authored mobile frame.
- Evidence directory: `docs/figma-verification/hospitals/2026-09-29/`; source and local hero/directory/footer crops personally reviewed. Desktop pixelmatch changedPixelRatio: 0.0151073 (threshold0.15, AA excluded); this metric is not a fidelity percentage.
- Fresh screenshots generated after final mobile changes; gray fallback and orphaned title wrapping fixed and rechecked.
- Final detail screenshots wait for the enter animation to settle; detail imagery reuses the selected card's exact source photo, fixing the legacy incorrect Union Hospital image.
- Source QA: 566 resolved mappings, 139 exact typography checks, 15 geometry checks.
- State QA: 1440/1024/768/390 widths, 20 filters, keyboard activation, modal focus trap, Escape, focus restoration, consultation transfer/direct CTA, home/footer links, hover/reduced-motion. No page errors, broken images or horizontal overflow.
- Desktop geometry: 460 /1524 /456; total2440. Mobile: 620 /3498 /778.25; total4896.
- Type check, direct Vite production compilation and git diff checks pass.
- Formal `pnpm build` passed after the whole-site evidence gate was refreshed on 2026-09-29.
