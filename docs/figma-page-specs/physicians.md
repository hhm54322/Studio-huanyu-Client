# 中国医生（桌面）

- Route: `/doctors`
- Figma frame: `07寰宇云医 - 中国医生`
- Node ID: `1689:4814`
- Source baseline HTML: `docs/figma-source/physicians/revision-2026-10-29/baseline-2026-10-29.html`
- Source baseline CSS: `docs/figma-source/physicians/revision-2026-10-29/dev-styles-2026-10-29.css`
- Source asset manifest: `docs/figma-source/physicians/revision-2026-10-29/assets-2026-10-29.json`
- Source extraction run: 2026-10-29; official source exported 2026-10-28T21:36:39Z, SHA256 `b81bbd3eb95eb33a7a2db2d313f7f6e326e24ce2ad5a1c6c5e82d618308d081e`
- Desktop frame: Figma sample 1440×1790; document-backed runtime derives height from its 177 records
- Mobile frame: deferred by user; design not finalized; no mobile implementation in this batch
- Status: verified (177-record document directory, desktop-only; mobile deferred by user)

## Layer Mapping

All 306 expanded Layers are recorded in `ui-layers-2026-10-29.json`, each with exact ID, parent, order and name. Each was selected in IAB Dev Mode and its right-panel CSS/SVG recorded in `dev-mode-2026-10-29.json`. The mechanical conversion creates `node-to-code-2026-10-29.json`: every node maps to an independent DOM owner or the exact SVG owner. The source lock was created before Vue implementation. No full-page PNG is shipped as UI.

| Element | Node ID | Vue owner | Exact source dimensions |
| --- | --- | --- | --- |
| Page / Body / Main | `1689:4814/4815/4816` | PhysicianView > HospitalFigmaCanvas > HomeSourceNode | 1440×1790 / main 1334 |
| Hero | `1689:4817` | same source tree | 1440×460; content x112/y141.5, 1216×211 |
| Specialty filters | `1689:4839` | Source buttons / tablist | 1216×42, x112/y96 within directory, gap16 |
| Five doctor cards | `1741:5784` | Source card buttons | 1216×640, 3 columns, gap24; 389.33334×284 each |
| Header | `1689:5392` | Fixed source header | 1440×64 |
| Hospital menu | `1732:5716` | Hover/focus dropdown | x962/y72; 119×85; radius16; .5px border |
| Footer | `1689:5315` | Source tree | y1334; 1440×456 |

## Typography

Every text owner's copied CSS and native text runs/line layout are in the locked source. Hero title 64/96, weight600; subtitle20/29. Doctor names24/24; original label, detail and footer weights are retained individually.

## Assets

30 exact asset records (8 unique WebP photos/fills plus original Dev Mode SVGs), native image crop/transform/alpha retained. Photos compressed at quality90, maximum2048px. Full-page screenshots remain ignored local QA evidence.

| Asset | Source Node ID | Project path |
| --- | --- | --- |
| Hero professional-team icon | `1689:4822` | `/public/images/figma/physicians-revision/node-1689-4822.svg` |
| Tan doctor portrait | `2326:8512` | exact native image hash/crop in asset manifest |
| Ask Aning icon | `1689:5402` | `/public/images/figma/physicians-revision/node-1689-5402.svg` |

## Prototype And Motion

- Six shortcut filters plus all 34 document departments. The original Figma filter/card dimensions are retained; shortcut labels adapt to the document as recorded below. Switching filter types clears the previous filter.
- All doctor cards open the document-backed profile dialog. The detail panel reuses the existing Figma expert-dialog parameters; its contents and available tabs come from each document record. Homepage expert dialogs are unaffected.
- Hospital menu opens on hover/focus or click; both destinations work. Escape closes with focus restoration. Consultation, language selector, footer and navigation are wired.
- Card reveal/hover follows the existing source-preserving hospital motion; reduced motion removes these transitions.

## Verification

- Current verification: see the 2026-10-30 document-directory evidence below. The following 2026-10-29 evidence remains the historical five-record Figma baseline, not a claim that 177 records match the original five-record full page.
- Figma reference screenshot: `artifacts/figma-physicians-2026-10-29/revision-2026-10-29-figma.png`
- Local desktop screenshot: `artifacts/figma-physicians-2026-10-29/local-1440.png`
- Mobile geometry: deferred by user; the mobile source is not finalized and this batch is desktop-only
- Remaining differences: none
- Verification run: 2026-10-29; `nMAE 0.3965%`, changed-pixel ratio `0.2558%`, all 306 mapped owners, six filters, five detail dialogs and navigation behavior passed


## 2026-10-30 — 曜影医生名录接入

- User-authorized content change: 首页保持不变，仅 `/doctors` 将卡片和详情内容切换为归档 DOCX 的全部 177 位医生；保留按科室筛选，无头像时不显示头像，不编造资料。
- Content source: `docs/source/physicians/曜影医疗专家信息汇总.docx`，SHA256 `cb05c6c9413afd89de709596dcc0e168f0d23a4c674415cc39447ff3147ff9f2`。
- Runtime data: `src/data/yaoyingPhysicians.json`；可通过 `scripts/build-yaoying-physicians.py` 重新提取，稳定 ID 采用源文档序号。177 人，34 个科室，2 位“吴莹”独立保留。内部设计师核对附录只留存在原始 DOCX，不展示在患者端。
- Current live Design connection: 2026-10-30T09:23:34Z verified through `scripts/figma-connect.mjs`, current-session IAB tab 3, source node `1689:4814`; Design/Layers/Inspect all readable.
- Current official export: `/Users/hhm/Downloads/寰宇云医 (21).fig`，exported 2026-10-30T09:35:48.863Z，SHA256 `ee0e6f1811b55a75f28ac5c5aab3d90d92c163ed1dc1da58eb57ebd952c7f32e`。
- Whole-file comparison against the implementation's original `(9).fig` found changes elsewhere; physician root 306 nodes and shared dependencies remain unchanged; existing profile source `1432:7741` also unchanged. Report: `artifacts/figma-source-gate/current-physicians-directory.json`.
- Current source screenshot exported from the selected Design frame: `artifacts/physicians-directory-2026-10-30/figma-current.png`.

### Data-driven node mapping and copied parameters

| Source owner | Runtime owner | Copied parameters and permitted content adaptation |
| --- | --- | --- |
| `1689:4814`, `1689:4815`, `1689:4816`, `1689:4838` | `PhysicianView > HospitalFigmaCanvas` | Preserve page/hero/footer source; derive directory/main/page height from row count. |
| `1689:4839`, `1689:4843`, `1689:4846`, `1689:4849`, `1689:4852`, `1689:4840`, `2320:8384` | six source filter buttons | Preserve x/y, widths, 42px height, radius, gaps and type. Labels now use actual DOCX departments: 全部 / 牙科（口腔科） / 骨科 / 血液内科 / 乳腺外科 / 全科. Additional native select exposes all 34 exact source departments. Selecting a shortcut clears the select; selecting a department clears the shortcut, so filtering never produces a stale intersection. |
| `1741:5784` | `#physician-results` | Three columns, 1216px wide, 24px gaps, 48px top padding; repeated card grid height depends on record count. |
| `1741:5817` | `[data-figma-node="physician-card:<stable-ID>"]` | Reuse the complete source card tree, width389.33334 / height284, 24px padding, radius24, fill#F5F6F7. Each descendant ID retains the source ID and stable record suffix. |
| `1741:5821`, `1741:5822`, `1741:5823` | record name/title | Source name24/24 weight600 #1E3A5F; title14/16 weight400 #9CA3AF; expand text to available source column width. Missing avatars hide the image subtree and move identity to x0 within the source header. |
| `1741:5819`, `1741:5820` | record portrait | Only verified Figma portraits for 周莉莉 / 柳光宇 / 陈疾忤; all other image owners omitted. No fallback stock photo or placeholder. |
| `1741:5831`, `1741:5840`, `1741:5842` | DOCX label/workplace/specialty | Source type/color/coordinates retained; employment lines ellipsize within card, specialty limited to 2 source lines. Full detail remains readable in the dialog. Empty specialties stay empty. |
| `1432:7744`, `1432:7745`, `1432:7750`, `1432:7757`, `1432:7759`, `1432:7763`, `1432:7774`, `1432:7790` | `PhysicianProfileDialog` panel/close/heading/identity/tabs/content | Data-driven extension of the extracted expert dialog: panel896px, radius24, white, padding32; close36px at16px inset; title32/32 weight600 #1E3A5F; name18/18 weight590; metadata14/20; tabs14/18 with 2px #2563EB active underline; body16/24 #4B5563. Flow height adapts to the actual source paragraphs, with in-dialog scrolling. |

All 177 doctor details use the new document source, including known doctors; old homepage profile copy is not reused. Basic information remains visible above the tabs. Empty academic/research sections are hidden. No source-designer notes, license IDs or placeholder slashes are emitted.

### Current desktop verification — 2026-10-30

- Figma connection rechecked at 2026-10-30T09:50:30.439Z through the same current-session IAB Design tab; source node `1689:4814`, Design/Layers/Properties all readable and retained for handoff.
- Source/content verification: `artifacts/physicians-directory-2026-10-30/data-verification.json`; all 177 document records retained with 177 unique IDs, 34 departments, both same-name records and three deliberately empty card specialties.
- Local desktop screenshot: `artifacts/physicians-directory-2026-10-30/all-desktop-1440.png`; additional desktop captures at 1024/1280/1440/1920, all without horizontal overflow or broken images.
- Figma reference: `artifacts/physicians-directory-2026-10-30/figma-current.png`; unchanged hero crop nMAE **0.9164%**, unchanged footer crop **0.3006%**. Card geometry x112/y646, width389.328125 (browser subpixel rounding), height284, source gap24. Additional document records and the complete department selector are user-authorized content extensions, not full-page pixel-equivalent to the five-record sample.
- Behavior evidence: `artifacts/physicians-directory-2026-10-30/behavior-qa.json`; six shortcuts and all 34 exact-department selections verified against complete record IDs. Every one of 177 detail dialogs opened and every populated tab compared against the document-derived data; avatar visibility, Escape/button/overlay close, focus restoration and scroll restoration passed. Header menu and consultation entry also passed. No browser errors or failed local resources.
- Reviewed screenshots: all-doctors, 1024/1920 desktop, full-department selector state, document details with/without portraits and both same-name records. Motion preserves resting geometry and reduced-motion behavior remains available.
- Current gate: `scripts/audit-physician-directory.mjs` runs after the locked historical Figma baseline audit. It requires fresh unchanged current Figma sources, the archived document hash, current implementation/data hashes, all 177 detail checks, all department IDs and fresh desktop screenshots. Historical sample screenshots are never accepted as current directory evidence.
- Mobile geometry: frozen by the user's desktop-only instruction; no new mobile scope is claimed.
- Validation commands: scoped `audit:figma physicians.md`, `build:app` (image preparation, `vue-tsc -b`, Vite production build), and `git diff --check` passed. Logs: `artifacts/physicians-directory-2026-10-30/app-build.log` and `behavior-qa.json`. The full-site audit remains blocked by unrelated pages' historical screenshot/evidence freshness; see `full-site-gate.log`. The doctors scope itself passes. No deployment was performed in this task.
