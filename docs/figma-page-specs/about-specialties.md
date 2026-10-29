# 关于我们 — 专项病例详情

- Route: `/about`
- Figma frame: `肿瘤 · 多学科诊疗（MDT）`、`慢病与自身免疫 · 个体化长期管理`、`牙科 · 精准种植与美学修复`
- Node ID: `1741:5753`、`1742:5973`、`1742:6014`
- Source baseline HTML: `docs/figma-source/about/specialties-revision-2026-10-29/oncology/baseline-2026-10-29.html`
- Source baseline CSS: `docs/figma-source/about/specialties-revision-2026-10-29/oncology/dev-styles-2026-10-29.css`
- Source asset manifest: `docs/figma-source/about/specialties-revision-2026-10-29/assets-2026-10-29.json`
- Source extraction run: 2026-10-29, parent-first live Layers and selected Dev Mode CSS for all three source frames
- Desktop frame: 896×338 / 896×290 / 896×290
- Mobile frame: deferred by user
- Status: verified (desktop only; mobile deferred by user)
- Desktop only; mobile implementation is deferred by the user.
- Current official source: `/Users/hhm/Downloads/寰宇云医 (9).fig`, SHA-256 `b81bbd3eb95eb33a7a2db2d313f7f6e326e24ce2ad5a1c6c5e82d618308d081e`.
- Source directory: `docs/figma-source/about/specialties-revision-2026-10-29/`.
- All 89 nodes were expanded in live Layers and selected individually in Dev Mode. The three `ui-layers`, `native-parameters`, `dev-mode`, `node-to-code`, `source-tree`, `baseline`, `dev-styles` files contain every node's parent/order, geometry, CSS and concrete owner. `baseline-lock-2026-10-29.json` was generated before Vue changes.

| Card | Source frame | Exact dimensions | Source content | Entry |
| --- | --- | --- | --- | --- |
| 肿瘤 · 多学科诊疗（MDT） | `1741:5753` | 896 × 338 | 3 cards, 30 Layers nodes | About complex-case card 2 |
| 慢病与自身免疫 · 个体化长期管理 | `1742:5973` | 896 × 290 | 3 cards, 28 Layers nodes | About complex-case card 3 |
| 牙科 · 精准种植与美学修复 | `1742:6014` | 896 × 290 | 3 cards, 31 Layers nodes | About complex-case card 4 |

All roots have 32px padding and white fill. The inner grid is 832px wide, three columns, 24px gap. Each card has its own exact source icon, text wrapping, grid placement and dimensions, copied mechanically from the selected-node Dev CSS and native parameters. Nine actual SVG assets are under `public/images/figma/about-specialties-revision/`; no substitute icon is used.

These are compact authored detail panels, not complete long-form articles. Render their own source trees without copying the unrelated orthopedic article text into them. The existing orthopedic full detail remains bound to `484:2646` / `484:2649`. Dialog close, focus, backdrop and scroll lock belong to the runtime shell, outside the compact source composition.



## Layer Mapping

The three locked node-to-code records contain all 89 exact owners, parents and sibling orders. SVG descendants map to the corresponding exact SVG owner.

| Figma Node ID | Layer | Vue element | Dev Mode values |
| --- | --- | --- | --- |
| `1741:5753` | MDT root | HomeSourceNode > oncology source tree | 896×338, padding32, white |
| `1742:5973` | Chronic root | HomeSourceNode > chronic source tree | 896×290, padding32, white |
| `1742:6014` | Dental root | HomeSourceNode > dental source tree | 896×290, padding32, white |

## Sections

Each source has one 832px three-column grid with 24px gaps. Content dimensions and text wrapping are preserved per source node.

## Typography

All selected-node CSS and native text runs are locked in the three source directories; headings18/28 weight600, body16/24 weight400, authored colors preserved.

## Components And Spacing

Source root padding32; each capability card padding24, gap32, radius24; exact per-card heights remain copied from source. The runtime close control is outside the source composition.

## Assets

| Source Node ID | Export | Project path |
| --- | --- | --- |
| `1742:5930` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-5930.svg` |
| `1742:5926` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-5926.svg` |
| `1742:5961` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-5961.svg` |
| `1742:6003` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-6003.svg` |
| `1742:6011` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-6011.svg` |
| `1742:6006` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-6006.svg` |
| `1742:6056` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-6056.svg` |
| `1742:6047` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-6047.svg` |
| `1742:6052` | Selected Dev Mode SVG | `public/images/figma/about-specialties-revision/node-1742-6052.svg` |

## Prototype And Motion

Cards open their corresponding detail on click, Enter or Space. Escape, close and backdrop restore focus without page scrolling. The dialog uses the existing 380ms cubic-bezier(.22,1,.36,1) opacity/18px entry, verified at 0/120/380ms without geometry changes; reduced motion leaves the settled layout visible.

## Verification

- Figma reference screenshot: `artifacts/figma-about-specialties-2026-10-29/source/oncology-figma.png`; other sources: `chronic-figma.png`, `dental-figma.png`
- Local desktop screenshot: `artifacts/figma-about-specialties-2026-10-29/oncology-local.png`; other states: `chronic-local.png`, `dental-local.png`; source/local comparison personally reviewed in `comparison.png`
- Mobile geometry: deferred by user; no mobile implementation in this batch
- Verification run: 2026-10-29; nMAE 0.1418% / 0.1437% / 0.1100%, pixelmatch 0.0021% / 0.0013% / 0.0009%; all 89 owners present exactly once, all 9 SVG hashes verified, 1024/1440/1920px dialog keyboard/focus/scroll behavior passed
- Remaining differences: none
