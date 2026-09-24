# 来华就医专业评估报告

- Route: `/professional-report`
- Figma frame: no dedicated professional-report intake/upload frame exists in the current design file
- Node ID: unresolved because no source frame exists
- Desktop QA viewport: `1440px`
- Mobile QA viewport: a real `390px` CSS viewport
- Status: not in current Figma scope; navigation disabled

## Figma Source Audit

- Audit date: 2026-09-24.
- Design file: `s6gMozOqPBJFujindYruwb`, inspected in Dev Mode through `browser-client` and the `iab` Figma tab.
- Search scope was explicitly changed from `This page` to `All pages`.
- Exact search `来华就医专业评估报告` returned `No results in this file`.
- Exact upload-page title `上传资料，生成来华就医专业评估报告` returned `No results in this file`.
- Generic search `专业评估报告` returned two text nodes only: a free-report upgrade prompt and the paid sample-report title. Those belong to `/report` states and do not provide the independent intake/upload hierarchy used by `/professional-report`.
- The paid sample-report frame `43:6175` is already implemented and verified inside `/report`; it must not be reused as evidence for this separate upload route.
- Exact hierarchy, Dev Mode parameters, assets, responsive rules, and source screenshot comparison therefore remain unavailable. No screenshot measurement or inferred token is being recorded as Figma truth.

## Current Implementation Scope

| Section | Node ID | Vue component/element | Current behavior | Figma status |
| --- | --- | --- | --- | --- |
| Intro/header | unresolved | `.professional-report-page` heading branch | report context and return action | blocked: no source node |
| Imported free-report summary | unresolved | source summary panel | restores linked submission data | blocked: no source node |
| Patient/clinical form | unresolved | form field groups | validation and editable clinical inputs | blocked: no source node |
| Upload | unresolved | upload control and file list | file validation, list and remove action | blocked: no source node |
| Region selection | unresolved | region toggle group | editable comparison regions | blocked: no source node |
| Generated report | unresolved | tabbed report sections | existing API result rendering | blocked: no source node |
| Packages/contact | unresolved | package cards and CTA | existing service entries | blocked: no source node |

## Business And Accessibility QA

- Existing free-report query restoration, professional-report submission services, file validation, file removal, result tabs, and package/contact actions remain unchanged.
- Empty-submit validation was exercised and stopped at `请填写姓名。`; no API submission occurred.
- Desktop body `scrollWidth` and `clientWidth` both measured `1434px` inside the `1440px` browser viewport.
- Mobile body `scrollWidth` and `clientWidth` both measured `384px` inside the real `390px` browser viewport.
- Broken image count was zero at both viewports; browser warning/error log was empty.
- Keyboard focus styling and 48px minimum form controls remain implemented.

## Prototype And Motion

- File loading, generation, error, and generated-tab states retain the existing application behavior.
- Section/card transitions do not change settled layout.
- Reduced-motion rules keep all content visible and remove nonessential transforms.
- These are production behavior checks only; they cannot be attributed to Figma Prototype while the route has no source frame.

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Intake/report icons | unresolved | runtime component icons | `lucide-vue-next` via `src/views/patient/ProfessionalReportView.vue` |

## Verification

- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/professional-report/desktop-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/artifacts/professional-report/mobile-390.png`
- Interaction evidence: empty generate action produced `请填写姓名。`; form remained on-page and no submission occurred.
- Responsive evidence: desktop and mobile have no document-level horizontal overflow, broken images, or browser warnings/errors.
- Verification run: 2026-09-24
- Figma verification: blocked by the missing dedicated source frame.
- Remaining differences: exact Figma hierarchy, dimensions, spacing, typography, colors, effects, assets, states, responsive structure, and screenshot comparison are unresolved because the design file contains no `/professional-report` source frame.
