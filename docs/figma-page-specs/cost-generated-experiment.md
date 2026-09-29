# 费用对比 Figma-to-Vue 试点

- Route: `/cost-generated`
- Figma frame: `查看更多病种费用对比详情`
- Node ID: `143:2079`
- Figma page: `改版`
- Desktop frame: `1440 x 1768px`
- Mobile frame: no dedicated Figma frame; responsive verification added at 390px
- Status: generated baseline converted to Vue; experiment route only

## Generation Source

- Figma Dev Mode plugin: `Figma to Code (HTML, Tailwind, Flutter, SwiftUI)`
- Selected output: `HTML`
- Copied output size: `44,972` characters
- The generated result was not pasted into the application unchanged. Inline styles and primitive icon geometry were converted to data-driven Vue markup, an ECharts canvas for the authored bar chart, scoped CSS, existing router links, and existing motion/reduced-motion conventions.

## Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `143:2079` | `查看更多病种费用对比详情` / Auto layout frame | page `改版` | `.cost-generated-frame` | `1440 x 1768`, vertical, `padding: 96px 0`, fill `#F5F6F7` | No image asset; chart and cards are vector/text layers |
| unresolved | Chart group / Auto layout | `143:2079` | `.chart-plot` ECharts canvas | `1216px` content, chart labels 12px, legend 16px | Generated pixel bar heights retained as editable constants; canvas is runtime source |
| unresolved | Savings ticker / Auto layout | `143:2079` | `.savings-marquee` | 24px pill horizontal padding, 14px radius | Added looped motion; resting layout remains unchanged |
| unresolved | Cost detail cards / Auto layout | `143:2079` | `.cost-detail-card` | 24px padding, 24px radius, 80px source gap | Icons converted to existing `lucide-vue-next` components |

## Verification

- Figma reference: node `143:2079` in Dev Mode
- Local route: `http://127.0.0.1:5173/cost-generated`
- Desktop: checked at `1440 x 900`; no page-level horizontal overflow; nonblank ECharts canvas, legend, ticker, CTA, and detail-card hierarchy are visible.
- Mobile: checked at `390 x 844`; `document.documentElement.scrollWidth === 390`, so the page has no horizontal overflow; the responsive ECharts canvas remains nonblank.
- Interaction: CTA links resolve to `/diseases-technologies` and `/report`; ticker animation has a `prefers-reduced-motion` fallback.
- Build: `npm run build` passes with the NVM Node 22 runtime. The system Homebrew Node 20 binary is broken because it references an unavailable ICU 74 library.
- Remaining differences: exact child Node IDs and Figma-authored mobile frame are unresolved. The converted baseline measures about `2103px` of content height versus the source frame's `1768px`, so density still needs a final Figma screenshot pass before this is considered production-ready.
