# 牙科上传影像资料

- Figma frame: `04寰宇云医 - 牙科 - 上传影像资料`
- Node ID: `231:815`
- Source: `/Users/hhm/Downloads/04寰宇云医 - 牙科 - 上传影像资料 (1).png`
- Desktop frame: `1440 x 1766px`
- Route/state: `/dental`, step `03 上传影像资料`
- Source baseline HTML: `docs/figma-source/dental/upload.html`
- Source baseline CSS: `docs/figma-source/dental/upload-styles.txt`
- Source asset manifest: `docs/figma-source/dental/upload-assets.json`
- Geometry: hero `460px`, step rail `164px`, upload workspace `686px`, shared footer `456px`
- Upload workspace: `918px` content width; `140 x 140px` image dropzone; fields use `52px` height; notes field uses `98px` authored height; orange submit action is `48px` high and centered below.
- Status: verified

## Layer Mapping

| Figma Node ID | Figma layer | Parent | Vue implementation | Dev Mode values copied | Notes |
| --- | --- | --- | --- | --- | --- |
| `231:815` | `04寰宇云医 - 牙科 - 上传影像资料` frame | document | `.dental-page--step-3` | `1440 x 1766` | authored desktop state |
| `231:815` | step rail | frame | `.dental-steps` | 40px nodes, 64px connectors, 24px labels | step 03 active |
| `231:815` | upload media | frame | `.dental-upload-media` | label 14px/14px; dropzone `140 x 140`, radius 14 | plus icon is CSS/Vue control |
| `231:815` | upload form | frame | `.dental-upload-form` | width 918px; inputs 52px, radius 14; notes 98px | budget/time/notes |
| `231:815` | submit action | frame | `.dental-submit` | height 48px; padding 24px; radius 14; `#DD6B20` | preserves form entry |

## Typography

| Element | Node ID | Font | Size/Line Height | Weight | Color |
| --- | --- | --- | --- | ---: | --- |
| Upload label | `231:815` | Upload media | PingFang SC | 14px / 14px | 400 | `#0F172A` |
| Upload helper | `231:815` | Upload media | SF Pro | 14px / 14px | 400 | `#CBD5E1` |
| Field label | `231:815` | Upload form | PingFang SC | 14px / 14px | 400 | `#0F172A` / `#1F2937` |
| Field placeholder | `231:815` | input | Inter | 15.4-16px / 16-24px | 400 | rgba slate 0.50 |

## Components And Spacing

| Element | Node ID | W x H | Padding/Gap | Radius/Border/Effect |
| --- | --- | --- | --- | --- |
| Dropzone | `231:815` | 140 x 140px | plus icon centered | 14px, 1px `#D1D5DC` |
| Upload form | `231:815` | 918px content | 24px section gap; 52px fields | white, no shadow |

## Prototype And Motion

| Interaction | Figma/Octagos Reference | Trigger | Timing/Easing | Mobile Fallback |
| --- | --- | --- | --- | --- |
| File selection | Figma authored upload state | File input change | Immediate state update | Same input, stacked fields |
| Submit feedback | Octagos restrained action feedback | Submit | Short opacity/transform | No layout shift |

## Assets

| Asset | Node ID | Export/Fit | Project Path |
| --- | --- | --- | --- |
| Dental upload hero | `231:815` | Cover crop, authored `1440 x 460px` | `/public/images/figma/dental-upload-hero.png` |

## Verification

- Figma reference screenshot: `/Users/hhm/Downloads/04寰宇云医 - 牙科 - 上传影像资料 (1).png`
- Local desktop screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/dental-upload-1440.png`
- Local mobile screenshot: `/Users/hhm/Desktop/1024Clients/huanyu/Studio-huanyu-Client/docs/figma-verification/dental/2026-09-29/dental-upload-390.png`
- Upload states: idle, ready, submitting, success, and retryable error feedback are implemented without changing the authored idle geometry. The submit action calls the backend `/api/dental-assessments` multipart endpoint and rejects empty submissions.
- Remaining differences: none
- Verification run: 2026-09-24. Re-read Dev Mode source frame `231:815`; verified authored desktop geometry `460 / 164 / 686 / 456px`, upload idle/reading/ready/error states, form submission feedback, mobile adaptation, image loading, no horizontal overflow, and reduced-motion fallback.
