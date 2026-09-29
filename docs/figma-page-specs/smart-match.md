# 智能匹配

- Route entry: `/cases` -> `开始智能匹配`
- Figma frame: `智能匹配`
- Node ID: `190:5550`
- Source baseline HTML: `docs/figma-source/cases/smart-match.html`
- Source baseline CSS: `docs/figma-source/cases/smart-match-styles.txt`
- Source asset manifest: `docs/figma-source/cases/smart-match-assets.json`
- Source extraction run: 2026-09-29, Dev Mode HTML plus recursively expanded Layers tree and native parameter supplement
- Source reference: `/Users/hhm/Downloads/智能匹配.png`
- Desktop authored state: `1440 x 834px`
- Mobile frame: responsive fallback at `390 x 844px` (no authored mobile matcher frame)
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer/type | Parent | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |
| `190:5550` | `智能匹配` frame | document | matcher authored state | 1440 x 834 | source state |
| `190:5551` | background page image | `190:5550` | existing `/cases` directory | 1440 x 1136 at 0,0 | dimmed by overlay |
| `190:5552` | `Container` overlay | `190:5550` | `.matcher-backdrop` | 1440 x 834; 40px padding; black 50%; blur 4px | centered modal |
| `190:5553` | `Frame 631` dialog | `190:5552` | `.matcher-dialog` | 896 x 754; 32px content inset; radius 24px; white | fixed desktop geometry |
| `190:5554`–`190:5556` | close Button / Icon / Vector | `190:5553` | close button and exported SVG | 36px hit area; 8px padding; 20px icon; top/right 16px; blur 8px | focus, click and Escape close |
| `190:5557`–`190:5559` | title containers / `智能匹配` | `190:5553` | matcher header and `h2` | 32/32px; 600; .4px tracking; `#1E3A5F`; left origin | source hierarchy retained |
| `190:5560`, `190:5561` | question-one outer/container | `190:5553` | first `fieldset` | 32px top spacing; vertical Auto Layout | required group |
| `190:5562`–`190:5565` | badge frame/text and question title | `190:5561` | first `legend` | 24px badge; 8px gap; title 24/24px; red required marker | badge `1` |
| `190:5566`, `190:5567` | helper frame/text | `190:5561` | first helper `p` | 32px left inset; 14/22px; `#6B7280` | exact copy |
| `190:5568`, `190:5569` | first option margin/container | `190:5560` | first `.matcher-options--wide` | 24px top; 32px left; five-column wrap; 24px gaps | 8 options |
| `190:5570`–`190:5583`, `201:5627`, `201:5628` | eight option Buttons/text | `190:5569` | focus option buttons | 48px; 36px horizontal and 14px vertical padding; radius 14px; `#F9FAFB`; 2px `#F3F4F6` inset outline | order: 肿瘤科 through 其他 |
| `190:5584`, `190:5585` | question-two outer/container | `190:5553` | second `fieldset` | 32px top spacing; vertical Auto Layout | optional group |
| `190:5586`–`190:5589` | badge frame/text and age title | `190:5585` | second `legend` | same badge/title values | badge `2` |
| `190:5590`, `190:5591` | age helper frame/text | `190:5585` | second helper `p` | 32px left inset; 14/22px | exact copy |
| `190:5592`, `190:5593` | age option margin/container | `190:5584` | second `.matcher-options` | 24px top; 32px left; five columns; 24px gaps | 4 options |
| `190:5594`–`190:5601` | four age Buttons/text | `190:5593` | age option buttons | copied 48px option geometry | 18-30 through 60+ |
| `190:5602`, `190:5603` | question-three outer/container | `190:5553` | third `fieldset` | 32px top spacing; vertical Auto Layout | optional group |
| `190:5604`–`190:5607` | badge frame/text and timing title | `190:5603` | third `legend` | same badge/title values | Figma badge text is `2`; corrected to `3` as an obvious sequence typo |
| `190:5608`, `190:5609` | timing helper frame/text | `190:5603` | third helper `p` | 32px left inset; 14/22px | exact copy |
| `190:5610`, `190:5611` | timing option margin/container | `190:5602` | third `.matcher-options` | 24px top; 32px left; five columns; 24px gaps | 4 options |
| `190:5612`–`190:5619` | four timing Buttons/text | `190:5611` | timing option buttons | copied 48px option geometry | 1个月内 through 暂未确定 |
| `190:5620`, `190:5621` | action container / Link | `190:5553` | matcher footer and submit button | 48px top; centered; 32px bottom | required-state action |
| `190:5622` | `为我推荐相似病例` | `190:5621` | submit label | PingFang SC 16/16px, 600, white | exact copy |
| `190:5623`–`190:5625` | action Icon / two Vectors | `190:5621` | exported arrow SVG | 20 x 20; 1.5px white stroke | 8px label gap |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Dialog title | `190:5559` | PingFang SC | 32px / 32px | 600 | `#1E3A5F` |
| Question titles | `190:5565`, `190:5589`, `190:5607` | PingFang SC | 24px / 24px | 600 | `#1E3A5F` |
| Badge numbers | `190:5564`, `190:5588`, `190:5606` | SF Pro | 12px / 16px | 700 | white |
| Helper copy | `190:5567`, `190:5591`, `190:5609` | PingFang SC | 14px / 22px | 400 | `#6B7280` |
| Option labels | `190:5571`–`190:5583`, `201:5628`, `190:5595`–`190:5601`, `190:5613`–`190:5619` | SF Pro | 16px / 16px | 400 | `#4B5563` |
| CTA label | `190:5622` | PingFang SC | 16px / 16px | 600 | white |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Dialog | `190:5553` | 896 x 754px | 32px content inset | 24px radius, white |
| Question badge | `190:5562`, `190:5586`, `190:5604` | 24 x 24px | centered | circular, `#DD6B20` |
| Focus options | `190:5570`–`190:5583`, `201:5627` | five columns, two rows | 24px gap | 14px radius, 2px inset outline |
| Age/timing options | `190:5594`–`190:5600`, `190:5612`–`190:5618` | five equal columns, four occupied | 24px gap | same option treatment |

Dev Mode supplement `docs/figma-source/cases/smart-match-dev-supplement-2026-09-29.json` rechecks the actual grids `190:5593` and `190:5611`: both are `800 x 48`, `repeat(5,minmax(0,1fr))`, 24px gaps. The older generated HTML did not preserve this grid parameter; the selected-node CSS takes precedence. Source typography above also takes precedence over legacy CSS. Tracking is normalized to zero under application instructions.
| CTA | `190:5621` | 203 x 48px | 16px vertical; 24px horizontal; 8px gap | 14px radius; `#DD6B20` resting fill |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Close icon | `190:5555`, `190:5556` | 20 x 20px | `/public/images/figma/smart-match-close.svg` |
| Submit arrow | `190:5623`–`190:5625` | 20 x 20px | `/public/images/figma/smart-match-arrow.svg` |

## Prototype And Motion

| Interaction | Trigger | Authored/local behavior | Timing/Easing | Mobile fallback |
| --- | --- | --- | --- | --- |
| Open matcher | `开始智能匹配` | centered state over blurred case directory | 280ms backdrop; 420ms cubic-bezier(.22,1,.36,1) lift | bottom-aligned, scrollable dialog |
| Select answer | option click | updates one value per question; blue selected emphasis without changing geometry | 200ms color transition | two-column options |
| Submit | CTA click | first group required; applies matching filters and announces result | result scroll uses smooth unless reduced motion | full-width CTA |
| Close | close, backdrop, Escape | closes dialog and restores body scroll | reverse fade/lift | same |
| Reduced motion | OS preference | all matcher motion reduced to .01ms | immediate | immediate |

## Verification

- Figma reference screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/figma-matcher-1440.png`
- Local desktop screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/matcher-1440.png`
- Local selected-state screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/matcher-selected-1440.png`
- Local mobile screenshot: `/Users/hhm/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/cases/2026-09-29/matcher-390.png`
- Desktop geometry: viewport `1440 x 834`; dialog `896 x 754` at `(272, 40)`; first option region `800 x 120` at `(336, 218)`; age options `800 x 48` at `(336, 452)`; timing options `800 x 48` at `(336, 614)`; CTA `205 x 48` at `(617.5, 710)`.
- Mobile geometry: viewport `390 x 844`; dialog `366 x 789` at `(12, 43)`; the body viewport is `639px` high with `797px` scroll height; document width remains `390px` with no horizontal overflow.
- Interaction checks: option groups update independently; required first-group validation is retained; submitting `消化系统 / 31-45 / 1-3个月` closes the dialog, renders Maria and the result note and restores body scrolling; changing to 骨科 displays James. Close button, Escape and backdrop restore scroll and the actual opening element after the leave transition. Forward/backward Tab trapping is checked both before and after submit becomes enabled.
- Motion checks: 280ms backdrop fade and 420ms cubic-bezier(.22,1,.36,1) dialog lift retain the resting geometry; option state transitions do not shift layout; reduced-motion fallback remains active.
- Copy correction: source node `190:5606` contains a duplicate badge `2`; the implementation displays `3` under the instruction to correct obvious copy errors.
- Foreground screenshot comparison: changed-pixel ratio 0.0140041801; foreground only because the source background is a trust-page image while this entry opens over cases. Typography/rasterization, normalized tracking and corrected badge are retained; source geometry matches.
- Medium viewport: 768px dialog width744 at x12; internal content scrolls rather than overflowing horizontally. Four viewport states and reduced-motion checks are in `state-results.json` and enforced by `audit-cases-source.mjs`.
- Completion gate: source inventory, exact Dev Mode mapping, current-page desktop/mobile state QA, screenshot comparison, type checking and production build pass. The full-site audit may still report unrelated page specifications independently; that does not invalidate this state record.
- Remaining differences: none
- Verification run: 2026-09-29
