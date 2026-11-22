# The building blocks

`src/styles/tokens.css` holds the values; this page says which to use when. Components never use a raw colour,
corner or shadow: they use these. Sizes and spacing are written in px but must sit on the scales below
(`scripts/ui-lint.mjs` checks).

## Colour (both themes, set on `:root` and `[data-theme="dark"]`)
| Role | Tokens | Use |
| --- | --- | --- |
| Page | `--bg-app` | The ground behind the sidebar and main card |
| Surfaces | `--surface-1` main card, `--surface-2` cards, `--surface-3` menus and raised pieces, `--surface-inset` fields and wells | Lift goes up with the number |
| States | `--surface-hover`, `--surface-pressed` | Hover fill; selected or pressed fill (menu rows, segments, sidebar) |
| Lines | `--border-subtle` dividers, `--border` fields and outlines, `--border-strong` focus-within, emphasis | |
| Text | `--text-1` main, `--text-2` secondary, `--text-3` hints, labels, placeholders, `--text-disabled` | Never a lighter grey than `--text-3` for something to read |
| Meaning | `--profit`, `--loss` (results, never green and red), `--attention` (needs the owner), `--voice` and `--voice-border` (voice notes only) | |
| Inverse | `--inverse-bg`, `--inverse-fg` | Toasts, the on state of switches |
| Over images | `--on-media`, `--media-scrim` | Icons on chart thumbnails |
| Buttons | `--btn-p-*` primary, `--btn-g-*` secondary, `--btn-v-*` voice | |

## Type (Instrument Serif for page titles, Inter for everything else at `--tracking-body` +0.01em; tabular figures on)
| Size / line height | Use |
| --- | --- |
| 12 / 16 | Hints, labels, captions, meta lines, chips |
| 14 / 20 | Body, controls, menu rows, row headlines |
| 16 / 24 | Section titles, card titles |
| 26 / 32 | Page titles only: Instrument Serif 400, natural tracking, from `--title-size` (24 if titles use the body face) |
| 24 / 32 | Big numbers (Inter 600, `--tracking-figure` −0.01em) |

Weights: 400 body and page titles, 500 labels and controls (a selected segment stays 500), 600 only at 24px figures and the primary
button. Sentence case. A line height always goes with its size.

## Spacing
Steps: **2, 4, 8, 12, 16, 24, 32, 48** px (Tailwind 0.5 1 2 3 4 6 8 12). Nothing else.
- Inside a control: 12px at the sides. Two-line rows: 8px above and below (DESIGN.md › Menu options).
- Between related things 8, between groups 16 to 24, between sections 32 to 48.
- A label sits 8px from its field.

## Corners (DESIGN.md › Corners), continuous where supported
| Token | px | Use |
| --- | --- | --- |
| `--r-xs` | 7 | Chips and badges |
| `--r-sm` | 8 | 28px buttons, the selected segment, the focus ring |
| `--r-md` | 10 | 32px controls, fields, menu rows, sidebar items, thumbnails, tooltips |
| `--r-lg` | 12 | Segment tracks, inset rows |
| `--r-card`, `--r-menu` | 16 | Cards, notices, menus, toasts |
| `--r-panel` | 18 | The main card |
| `--r-dialog` | 20 | Dialogs |

Nested corners: the inner corner is the outer one minus the padding between them (a 16px menu with 4px padding
has rows of 12 or less; we use 10). Circles, dots and pills use their own sizes and stay round.

## Heights
Controls **32px** (`--h-md`), segments and small buttons **28px** (`--h-sm`), menu rows **34px**, large
controls **36px** (`--h-lg`). Touch targets at least **24px** (text buttons get 4px padding to reach it).
Rows: **48px** a Details row and an "Archived" disclosure row; **60px** an account row (archived or not); **64px**
the voice note's status card; Settings rows are 16px above and below a 32px line; Dashboard table rows 12px above
and below a 36px line. Chips and badges **22px** (`.kchip`, `.pill`). A `minHeight` is the content box unless the
element says `boxSizing: "border-box"`: padding and the top border add to it.

## Shadows (layers)
`--shadow-panel` the main card, `--shadow-card` cards, `--shadow-field` fields and dropdown buttons (barely
lifted), `--shadow-float` menus, popovers, toasts, `--shadow-dialog` dialogs. Nothing else casts a shadow.

## Icons
Lucide, stroke 1.8. **16px** in buttons, menus, filters, facts; **14px** in trade log facts and the filled
Details and stat icons (DESIGN.md). Names from `handoff/design-tokens/icons/ICONS.md` unless DESIGN.md adds one.

## Motion
Durations `--d-instant` 80ms, `--d-fast` 140ms, `--d-base` 220ms, `--d-slow` 320ms; easings `--ease-out`
(entering), `--ease-standard` (moving). Transform and opacity only; no motion on keyboard actions; reduced
motion keeps fades only (`.agents/skills/review-animations/STANDARDS.md`).
