# 中国医生（桌面）

- Route: `/doctors`
- Figma frame: `07寰宇云医 - 中国医生`
- Node ID: `1689:4814`
- Source baseline HTML: `docs/figma-source/physicians/revision-2026-10-29/baseline-2026-10-29.html`
- Source baseline CSS: `docs/figma-source/physicians/revision-2026-10-29/dev-styles-2026-10-29.css`
- Source asset manifest: `docs/figma-source/physicians/revision-2026-10-29/assets-2026-10-29.json`
- Source extraction run: 2026-10-29; official source exported 2026-10-28T21:36:39Z, SHA256 `b81bbd3eb95eb33a7a2db2d313f7f6e326e24ce2ad5a1c6c5e82d618308d081e`
- Desktop frame: 1440×1790
- Mobile frame: deferred by user; design not finalized; no mobile implementation in this batch
- Status: verified (desktop only; mobile deferred by user)

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

- Six filters: all / dental / sports medicine / hematology / orthopedic oncology / breast surgery. The original all state is copied exactly; filtered cards retain their own source subtree and reflow with source column/gap values.
- Doctor cards open the corresponding existing Figma detail: Tan dental five-tab dialog; Xu, Zhou, Liu and Chen respective expert dialogs. No synthesized doctor profile.
- Hospital menu opens on hover/focus or click; both destinations work. Escape closes with focus restoration. Consultation, language selector, footer and navigation are wired.
- Card reveal/hover follows the existing source-preserving hospital motion; reduced motion removes these transitions.

## Verification

- Figma reference screenshot: `artifacts/figma-physicians-2026-10-29/revision-2026-10-29-figma.png`
- Local desktop screenshot: `artifacts/figma-physicians-2026-10-29/local-1440.png`
- Mobile geometry: deferred by user; the mobile source is not finalized and this batch is desktop-only
- Remaining differences: none
- Verification run: 2026-10-29; `nMAE 0.3965%`, changed-pixel ratio `0.2558%`, all 306 mapped owners, six filters, five detail dialogs and navigation behavior passed
