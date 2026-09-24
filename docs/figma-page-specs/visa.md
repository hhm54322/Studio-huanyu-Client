# 签证办理流程

- Route: `/visa`
- Figma frame: no dedicated visa detail frame exists in the current design file
- Node ID: unresolved because no source frame exists
- Desktop QA viewport: `1440px`
- Mobile QA viewport: a real `390px` CSS viewport
- Status: not in current Figma scope; navigation disabled

## Figma Source Audit

- Audit date: 2026-09-24.
- Design file: `s6gMozOqPBJFujindYruwb`, inspected in Dev Mode through `browser-client` and the `iab` Figma tab.
- Full-file searches for `签证办理流程`, `全球医疗签证服务`, `寰宇云医协助您快速获得中国医疗签证`, `免签国家/地区`, `医疗签证类型`, `所需材料清单`, `办理步骤`, `加急服务`, `M字签证`, and `普通旅游签证` all returned `No results in this file`.
- `签证办理` appears only in shared navigation copy; it does not resolve to an independent page frame or child hierarchy.
- Existing desktop/mobile banner JPGs are implementation inputs from the repository, not proof of a Figma page frame.
- Exact hierarchy, Node IDs, Dev Mode parameters, source assets, and source screenshot comparison therefore remain unavailable. No screenshot measurement or inferred token is being recorded as Figma truth.

## Current Implementation Scope

| Section | Node ID | Vue component/element | Current behavior | Figma status |
| --- | --- | --- | --- | --- |
| Visa hero | unresolved | `.visa-hero` | responsive `<picture>` banner and copy | blocked: no source node |
| Visa-free countries | unresolved | `.visa-countries` | grouped country cards | blocked: no source node |
| Visa type | unresolved | `.visa-type` | M/L visa guidance | blocked: no source node |
| Materials | unresolved | `.visa-materials` | editable document list | blocked: no source node |
| Process | unresolved | `.visa-process` | responsive timeline | blocked: no source node |
| Urgent service | unresolved | `.visa-urgent` | service guidance | blocked: no source node |
| FAQ | unresolved | `.visa-faq` | accessible one-at-a-time accordion | blocked: no source node |
| CTA | unresolved | `.visa-cta` | report/service entry links | blocked: no source node |

## Business And Accessibility QA

- FAQ buttons use `type="button"`, synchronized `aria-expanded`, and matching `aria-controls` / answer `id` values.
- First FAQ state sequence was exercised as `true -> false -> true`.
- Verified first control relationship: `aria-controls="visa-faq-answer-0"`.
- Country/material data remains directly editable in the existing frontend constants.
- Desktop and mobile route rendering completed without page errors or broken layout.
- Both viewports satisfy `scrollWidth === clientWidth`.

## Prototype And Motion

- The FAQ height and chevron transitions preserve accessible button behavior.
- Existing card/section transitions do not change settled layout.
- Focus-visible and reduced-motion rules remain active.
- These are production behavior checks only; they cannot be attributed to Figma Prototype while the page has no source frame.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Visa desktop banner | unresolved | repository JPG, `2880 x 706` | `public/images/page-banners/visa-pc.jpg` |
| Visa mobile banner | unresolved | repository JPG, `750 x 444` | `public/images/page-banners/visa-mobile.jpg` |

## Verification

- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/visa/desktop-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/visa/mobile-390.png`
- Desktop/mobile geometry: no horizontal overflow; page error list was empty.
- Interaction evidence: first FAQ toggled closed and open; ARIA relationship remained synchronized.
- Verification run: 2026-09-24
- Figma verification: blocked by the missing dedicated source frame.
- Remaining differences: exact Figma hierarchy, dimensions, spacing, typography, colors, effects, assets, states, responsive structure, and screenshot comparison are unresolved because the design file contains no `/visa` source frame.
