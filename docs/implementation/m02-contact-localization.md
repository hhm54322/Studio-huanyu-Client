# M02：五语 WhatsApp 预填及长度兼容

- Scope: 用户确认的 M02，桌面端联系入口与语言选择；移动端不改版，仅保留既有入口的功能兼容。全站正文翻译、M03 改版、M05 点击统计另行实施。
- Source: 《寰宇云医独立站改造对照清单(1).xlsx》M02，及聊天确认的全部病种、中/英/印尼/马来/葡语。
- Figma: `s6gMozOqPBJFujindYruwb`，公共 Header/Navigation `1523:75/82`，菜单 `1524:26`、`1741:5732`、`1732:5716`；固定 WhatsApp 为用户另行授权的控件。
- Connection: 唯一入口 `scripts/figma-connect.mjs`，2026-11-03T15:12:54.018Z，当前 session `01a0bebd-b6f9-7fd3-bf5a-b79501589b80`，IAB2/tab4，Design/Layers/Properties 均可读。
- Current source: 本轮从同会话 Design 导出 `/Users/hhm/Downloads/寰宇云医 (45).fig`（2026-11-03T15:36:30.721Z，SHA-256 `855f2660049d0e81e3cebd29ad683b873a6a6b7dc3ac990a7db43deb3db94962`）；原实施源比较 `artifacts/m02-20261103/source/start-{home,hospitals,physicians}.json`，交付前比较 `source/final-{home,hospitals,physicians}.json`。目标 Header/两组菜单所有节点、依赖、同名候选不变；全文件其他模块仍存在变化，未接受为新基线。
- Parameters/mapping: 沿用 `patient-navigation.md` 的逐节点映射和已有 Dev Mode 抽取。实时 Inspect 再确认菜单 padding12/14/12/12、gap4、radius16、border0.5 #E3E4E8。中文28px导航高、12/16文字、8px用户要求菜单距离保留。
- Authorized localization: 非中文按钮随文案增长；菜单以实际文字宽度测量，限制在视口内并允许换行；非中文导航使用独立的紧凑文案，并在有限空间内换行，不缩放文字或截断含义。无外语 Figma 稿，不将这些兼容规则声称为外语逐像素还原。
- Node-to-code: 公共导航 → `PatientDesktopNavigation.vue`；源树页脚 WhatsApp ID → `HomeSourceNode.vue` 的链接属性，保持原文字/几何；共享页脚 → `PatientFooter.vue`；报告独立页脚 → `ReportView.vue`；固定入口 → `WhatsAppContact.vue`。原 Figma JSON/CSS/图片不修改。
- Behavior: 五语模板与病种名保存在 i18n；URL `lang` 及用户选择同步；公开投放来源随本标签页站内跳转保留。病种优先当前页选择，其次明确链接参数；未知内容使用通用咨询，不代入私人病历。只打开用户可检查并发送的 WhatsApp 预填框，不代发消息。
- Verification: passed on 2026-11-03. `scripts/audit-contact-i18n.mjs` verified five catalogs with exact key/placeholder parity and 33 public disease/department/dental topics; `node --test scripts/whatsapp-prefill.test.cjs` passed 4 tests; `vue-tsc -b` and direct Vite production build passed; `git diff --check` passed. `scripts/m02-contact-qa.cjs` passed 70 route×language checks and 75 desktop layout/menu checks in development and production preview, covering widths 701/1024/1280/1440/1920 and all five locales. It also verified source persistence/new-campaign replacement, URL locale synchronization, actual intercepted WhatsApp click URLs, blocked-storage fallback, zero page errors and zero HTTP errors. Evidence: `artifacts/m02-20261103/{qa/qa.json,production-final/qa.json,layout-final/qa.json,production-layout-final/qa.json}` and final screenshots. Chinese home/dental header regression remained pixel-identical (`chinese-regression.json`); the current Figma source connection is recorded in `connection-final.json`. This verifies the M02 scope only; it does not claim whole-site body translation or renewed full-site Figma acceptance.

## Length and compatibility rules

- Foreign labels are translated in the five locale catalogs and are never clipped with fixed Chinese widths. Shared navigation measures its available desktop width, uses compact labels for the top bar while retaining the full translation in `title`/ARIA and dropdowns, and wraps only when the viewport cannot fit one row.
- Dropdown panels use content-aware widths constrained to the viewport; long items wrap within their own row and gain a scrollbar only when the viewport height requires it. The existing Chinese geometry remains unchanged.
- The fixed WhatsApp CTA switches to auto height and bounded width for longer labels. Its text can wrap without moving the icon or overflowing the viewport. Desktop only is in scope while the mobile design remains frozen.
- Any future patient-facing copy change must update all five `conversion` catalogs and pass `audit:i18n`; adding a public topic also requires an alias and translated topic label in all five catalogs.

## Public source-link convention

Example landing link: `/?lang=id&disease=lung_cancer&country=ID&utm_source=facebook&utm_medium=paid_social&utm_campaign=HY-lung-id-2026&utm_content=ad1`.

- `lang`: one of the five locale codes; region variants such as `pt-BR` normalize to `pt`.
- `disease` or `topic`: a public key or exact registered alias in `src/data/contactTopics.ts`; unknown values use general consultation. Current page selections take precedence.
- `country`: optional explicit two-letter code. Language, IP and browser locale do not imply a country.
- Source fields are limited to `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `source_id`; M05 also adds `utm_term` for explicitly supplied campaign keywords. Values are public labels of at most 80 letters/numbers/spaces/underscore/dot/hyphen. Campaign labels must never contain patient information.
- Route and button entry are generated internally. Sources survive internal navigation and campaign labels survive refresh within the same browser tab. A new explicitly attributed link replaces the previous campaign fields as one set; unrelated private URL parameters are excluded.
- `HY1` is a structured identifier inside the WhatsApp prefilled message. M02 does not write click events to the backend or confirm that a message was sent/received; those are separate M05 or messaging integrations.

## Remaining verification boundary

- The full-site Figma gate was executed and still fails on pre-existing stale page/source evidence and shared-code hash locks outside this M02 scope (`artifacts/m02-20261103/full-figma-gate.log`). No gate or source baseline was weakened. The targeted navigation spec audit passed.
- The source-menu image comparison preserves an existing 149px-versus-150px border rasterization difference. The pixel-identical Chinese header regression verifies no new header drift, not a renewed whole-site pixel tolerance claim.
- `ms` and `pt` currently cover M02 contact/navigation strings. Whole-site source-rendered body copy and all legacy report strings have not been translated by this task. Mobile redesign remains frozen. This task has not deployed M02 to the public site.
