# Huanyu Figma Implementation Standard

This document is mandatory for all patient-facing frontend redesign work in the Huanyu workspace.

## 1. Source Of Truth

Use the following precedence. A lower source must never override a higher one.

1. **Figma Design file**: exact static implementation parameters and assets.
2. **Figma Prototype**: authored navigation, state changes, and transitions.
3. **Octagos**: motion vocabulary and interaction inspiration only.
4. **Existing application**: API contracts, business behavior, report generation, and data flow that must be preserved.

Primary design file:

`https://www.figma.com/design/s6gMozOqPBJFujindYruwb/`

Motion reference:

`https://www.octagos.com/`

## 2. Figma Is Implementation Data

Figma must not be treated as a screenshot or a loose visual reference. For every implemented node, read the available values directly from Figma Design or Dev Mode:

- frame width, height, X/Y position, constraints, and layout grid;
- Auto Layout direction, alignment, gap, padding, wrapping, and sizing mode;
- text family, size, weight, line height, alignment, decoration, and color;
- fill, opacity, gradient stops, border color/width, radius, and shadow/effect;
- image crop, fit, focal position, mask, and export scale;
- component variant, state, visibility, and responsive behavior;
- icon size, stroke width, button hit area, and spacing;
- section height, container width, column width, and inter-section spacing.

When Figma exposes CSS or Dev Mode code, use those values as the starting point. Convert them only when required by the existing Vue/CSS architecture, without changing the rendered result.

Do not estimate values from exported PNGs when the node properties are accessible. Screenshots are verification evidence, not the source of dimensions.

### 2.1 Dev Mode extraction and copy discipline

Use Figma Dev Mode as the implementation handoff surface for every patient-facing page:

- the **Layers** panel on the left is the authoritative parent-child hierarchy, sibling order, node name, and visibility source;
- the **Code/CSS** and **Layer properties** panels on the right are the authoritative source for the selected node's CSS values, Auto Layout values, typography, colors, borders, radii, effects, constraints, and sizing modes;
- select and read the parent node first, then recurse through every implemented child node; do not copy only the outer frame and hand-write or visually infer its internal styles;
- copy the Dev Mode values into the project as the starting implementation values. Convert syntax only as required by Vue/CSS architecture (for example, a Figma variable reference to a project token), without changing the resulting geometry or appearance;
- preserve a mapping from every implemented Figma node ID to its Vue element/component and record that mapping in the page specification;
- export or download the actual selected Figma image/SVG assets and record their source node IDs. CSS snippets do not contain the asset files themselves;
- read prototype states and interactions separately. Dev Mode CSS is not a substitute for modal, tab, upload, matching, navigation, or transition behavior;
- if a value is unavailable in Dev Mode, mark that exact field as unresolved and continue extracting the remaining fields. Never fill the gap with a screenshot measurement, a common design-token value, or a visual guess.

The generated or copied HTML/CSS is a static fidelity baseline, not a complete production Vue page. It must be converted into the existing component structure and then wired to the existing routes, API contracts, authored states, accessibility behavior, and responsive rules.

### 2.3 Mandatory Figma-first execution gate

This is an execution gate, not a documentation preference. The implementation owner must complete these phases in order for every page:

1. **Source inventory**: select the Figma source frame and recursively expand the Layers panel from parent to child. Record every implemented Frame, Group, Component, Text, Image, Icon, Button, and state-bearing node with its exact Node ID, parent Node ID, sibling order, visibility, and asset source. Generic labels such as `child`, `repeated child`, `shared dialog child`, `pending`, or `unresolved` are not valid mappings.
2. **Dev Mode copy**: select each inventoried node and copy its available Dev Mode values into the page specification before writing or changing Vue/CSS. Record geometry, Auto Layout, typography, color, border, radius, effect, asset crop, constraints, and state values for that exact node.
3. **Node-to-code mapping**: map every inventoried Node ID to a concrete Vue component or DOM element. A page cannot enter implementation status while any source node is absent from the mapping.
4. **Implementation and behavior**: only after the static inventory and parameter record are complete, implement the resting layout, then wire prototype interactions, business entry points, motion, responsive behavior, and reduced-motion fallback.
5. **Evidence and gate**: capture Figma/source and local desktop/mobile/state evidence, run `pnpm run audit:figma`, then run type checking, production build, and diff checks. A failed command means the page remains incomplete and must not be reported as done.

The order is non-skippable. Generated Figma HTML/CSS is an implementation input, not proof that the source hierarchy or every child parameter was copied. If a node or value cannot be read, stop completion for that page and record the exact blocker rather than inventing a substitute.

### 2.2 Implementation ownership and delivery responsibility

The implementation owner is responsible for the complete page delivery after the Figma static baseline is copied into Vue. This responsibility includes:

- wiring all page interactions and business entry points, including navigation, tabs, hover/focus states, accordions, dialogs, uploads, matching states, forms, and authored prototype transitions;
- implementing the selected Octagos-inspired motion after the static Figma match, including desktop behavior, mobile fallback, and reduced-motion behavior;
- running the screenshot comparison and responsive verification personally at the Figma desktop and mobile frame sizes, then fixing discrepancies in geometry, typography, assets, states, and overflow;
- keeping the Figma parameter record, node-to-code mapping, interaction notes, and verification evidence up to date;
- treating the page as incomplete until the implementation, interaction logic, motion, and screenshot verification all pass the completion gate below.

The requester is not expected to separately wire interactions or perform screenshot QA. A copied Figma HTML/CSS result is only an implementation input and must never be reported as a completed page by itself.

## 3. Required Page Workflow

Work on exactly one page at a time.

### Step 1: Record The Figma Structure

Create or update `docs/figma-page-specs/<route-or-page>.md` before implementation. Record:

- Figma page/frame name and node ID;
- parent-child layer map with the Node ID of every implemented frame, group, component, text, image, and interactive control;
- desktop and mobile frame dimensions;
- ordered section list and section heights;
- container/grid rules;
- shared component instances;
- exact typography, color, spacing, border, radius, and effect values;
- source asset node/export paths;
- prototype interactions relevant to the page.

If a property cannot be read, record it as unresolved instead of guessing. Resolve it from the design file before declaring the page complete.

### Step 2: Implement The Static Page

Implement the Figma composition first:

- preserve the section order and hierarchy;
- use exact copy, correcting only obvious typos;
- reuse/export the actual Figma assets;
- keep placeholder metrics as directly editable frontend constants;
- preserve existing routes, API contracts, forms, and medical-report behavior;
- keep unfinished destinations visible but non-navigating when the design shows the entry.

No Octagos-inspired motion is added until the static page matches the Figma frame.

### Step 3: Verify The Static Page

Render the route at the exact Figma frame width. Capture the whole page and focused crops, then compare against the Figma frame section by section.

Verify at minimum:

- page and section dimensions;
- element coordinates and alignment;
- typography and wrapping;
- fills, borders, radius, shadows, and images;
- component states and visible copy;
- desktop and mobile overflow;
- missing or broken assets.

Fix visible differences before motion work begins.

### Step 4: Study And Specify Motion

Inspect Octagos actively. Do not rely on memory or a single pass.

- scroll the full relevant pages at different speeds;
- hover interactive controls and cards;
- click tabs, accordions, carousels, and navigation where available;
- observe sticky/pinned sections, left-fixed/right-scrolling layouts, section transitions, marquees, and image/text synchronization;
- record trigger, duration, easing, delay, direction, layering, and exit behavior;
- check how the behavior changes on narrow screens and with reduced motion.

For every adopted effect, document which Huanyu section receives it and why it supports that section. Adapt the motion language to Huanyu's medical brand; do not copy Octagos content or alter the Figma layout.

### Step 5: Add Motion Without Layout Drift

Motion may change opacity, transform, clip, filter, or scroll state, but it must not change the Figma resting layout.

- natural page scrolling remains usable;
- sticky sections must release at the correct boundary;
- hover states must retain the designed brand colors;
- animation must not resize controls or cause cumulative layout shift;
- mobile receives an intentional simplified behavior where desktop motion is unsuitable;
- `prefers-reduced-motion` must have a complete, readable fallback.

### 5.1 Asset and evidence hard gate

Icons, illustrations, logos, and photos are implementation assets, not decorative approximations. A page cannot be marked `verified` when a Figma asset is replaced by a Lucide icon, CSS-drawn shape, placeholder image, or an asset copied from an unrelated page. Each asset row must contain the exact Figma source Node ID and the exported project path.

The final desktop/mobile screenshots must be generated after the last code or asset change. Record the verification date and `Remaining differences: none` only after reviewing those new screenshots against the Figma frame. Existing screenshots from an earlier implementation pass do not satisfy this gate.

### Step 6: Final Page Verification

Repeat screenshots after motion is added. Test entry, mid-animation, settled, hover, active, modal, and responsive states as applicable.

Only then mark the page complete and proceed to the next page.

## 4. Page Specification Template

Each file under `docs/figma-page-specs/` should use this minimum structure:

```md
# <Page Name>

- Route:
- Figma frame:
- Node ID:
- Source baseline HTML:
- Source baseline CSS:
- Source asset manifest:
- Source extraction run:
- Desktop frame:
- Mobile frame:
- Status: extracting | static implementation | motion | verified

## Layer Mapping

| Figma Node ID | Figma layer name/type | Parent Node ID | Vue component/element | Dev Mode values copied | Asset/state notes |
| --- | --- | --- | --- | --- | --- |

## Sections

| Section | Node ID | Width | Height | Container/Grid | Notes |
| --- | --- | ---: | ---: | --- | --- |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |

## Verification

- Figma reference screenshot:
- Local desktop screenshot:
- Local mobile screenshot:
- Remaining differences: none | <explicit list>
```

## 5. Completion Gate

A page is not complete when it merely looks similar. It is complete only when all of the following are true:

- the locked Figma source baseline HTML/CSS and asset manifest exist before Vue implementation work begins;

- the Figma parameter record is complete;
- the static layout is verified against the matching Figma frame;
- intended prototype behavior works;
- selected Octagos-inspired motion is implemented and does not alter the resting layout;
- desktop and mobile screenshots have been reviewed;
- interactions, routes, assets, and responsive overflow have been tested;
- type checking and production build pass;
- no hospital administration or medical-report generation behavior was changed.

The entire redesign is not complete until every patient-facing page passes this gate.
