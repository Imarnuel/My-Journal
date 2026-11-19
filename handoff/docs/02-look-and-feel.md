# Trading journal: look and feel

How the journal should look, feel and move. Written for the build in Claude Code, so every decision has a value you can type in.

Read this alongside `01-decisions.md`. That doc says what each screen does and how each control behaves. This one says how it looks and moves. If the two ever disagree, the decisions doc wins on behaviour and this doc wins on look.

Canvas: https://claude.ai/artifact/9SsKH9vyMPxomtAWzLPtst (every frame is styled to this direction, set in Inter, and opens in light mode; switch a frame to dark in Settings, Appearance, or with the "Dark preview" switch in that frame's Tweaks)

---

## 1. The direction in one paragraph

Quiet, physical and precise. The app is made of layered surfaces you can feel. The window background sits at the bottom, with the sidebar on it. The main content is a card resting on it. Smaller cards sit inside that. Menus and dialogs float above, with real shadows. Edges get a hairline of light along the top instead of heavy borders. Buttons are slightly glossy, like real keys. Controls are compact (32px), so screens feel calm and dense without feeling crowded. Text steps down in three clear tones, so the eye knows what to read first. Motion is fast, soft and always starts from where you clicked. Colour is almost absent, so the few colours that do appear (profit blue, loss orange, the voice note's lavender) carry meaning. Set in Inter. **Light is the default theme. Dark is a full equal.**

---

## 2. What we take from each reference

The seven reference images and one video, described so this doc works without them. They are in this package's `references/` folder with these names; keep them in `docs/design/references/` in the repo.

| # | Reference (file) | What it shows | What we take | What we leave |
|---|---|---|---|---|
| 1 | `ref-1-create-menu.png` | A blue "Create application" button with a two-level dropdown: rows with icons, a submenu opening to the right | **The button:** a soft vertical gradient, a 1px darker edge, a 1px inner highlight on the top edge, a small drop shadow. **The menu:** a white surface, a hairline border, a large soft diffuse shadow, inset rows with a rounded hover fill and a leading icon, a full-width divider between groups, and the submenu opening beside the row it came from | The blue colour (blue means profit here). The coloured icon per row. Our menu icons are monochrome, and only brand marks such as MT5 keep their colour |
| 2 | `ref-2-verify-email.png` | A "Verify your email" card: an envelope glyph in a soft round medallion, a headline, grey body text, a full-width primary button, "Resend" | **The button:** the same glossy treatment. **The illustration:** one simple flat glyph in a soft raised circle with a white ring. Two tones, low contrast, no outlines, no scene | The faint geometric background shapes |
| 3 | `ref-3-upgrade-overlay.png` | An upgrade dialog over a blurred table, with a gradient app icon, a black primary and a white secondary button | **The overlay:** the page behind is blurred and washed, not just darkened. The dialog reads as the only thing in focus. The pairing of a black primary with a white bordered secondary | The upsell content and the purple gradient icon tile |
| 4 | `ref-4-send-motion.png` (a still from a screen recording) | A crypto "Send" screen: a thin progress line under the header, skeleton bars where the fee estimate will load, a spinner inside the button | **The motion feel:** smooth, short, continuous. Progress is shown in place (a hairline, skeletons, a spinner in the button), never with a full-screen loader | The teal colour. Only a still was available, so the motion values in section 12 are our own spec in that spirit |
| 5 | `ref-5-linear-ask.png` | A Linear workspace: the sidebar on the window background, and the main area a rounded card inset from the window edges | **The card style of the main surface.** The work area is a raised, rounded panel separated by elevation, not by a border line or a colour band. The sidebar and the ground read as one surface | Linear's chat UI |
| 6 | `ref-6-calendar-dark.png` | Untitled UI calendar in dark mode, with a sidebar you can see the wallpaper through | **Dark mode:** near-black ground, hairline borders, a raised segmented control, quiet nav highlights | The coloured event chips (tags have no colour tints). The frosted sidebar: in a browser there's nothing behind the sidebar to frost, and on the canvas it only left a visible seam against the ground. A native desktop app on macOS may use real vibrancy there |
| 7 | `ref-7-pricing-dark.png` | Untitled UI pricing in dark mode: three plan cards with a raised secondary button | **The subtle highlight on cards:** a brighter hairline on the top edge that fades down the sides, so the card catches light from above. **The dark secondary button:** a slightly lighter fill, a hairline border and a top highlight | Pricing-page layout and big marketing type |
| 8 | `ref-8-monny-dashboard.mp4` (a screen recording) | A finance dashboard in light mode | **The sizing:** compact 32px controls, small 8px corners, 24px titles and numbers, 14px body, a stat row drawn as one card with dividers instead of separate tiles, generous whitespace around few elements | Its brand colours and chart styles |

---

## 3. Principles

1. **Elevation over lines.** Separate things by putting them on different layers (section 5). Use a border only when two things sit on the same layer and still need a line between them, such as list rows.
2. **Light comes from above.** Raised things get a 1px highlight on their top edge. Pressed things lose it. Shadows always fall downward.
3. **Colour means something or isn't there.** The interface is neutral. Colour is reserved for profit and loss, attention, and the voice note. A primary button is neutral (dark on light, light on dark), never blue, because blue is profit. Status that isn't a result (MT5 connected, screenshots only) uses an icon in a grey tone, never a coloured dot.
4. **Three tones of text, each with one job.** What you read or act on, what supports it, and what only guides (section 4, text hierarchy). If two pieces of text compete, one of them is in the wrong tone.
5. **Icons where they help you act or recognise, nowhere else.** Controls, action menus, notices, status and icon-only buttons get icons. Headings, labels and body text never do (section 10).
6. **Blur only behind dialogs.** The scrim behind a dialog or sheet blurs the page. Nothing else blurs: not the sidebar, sticky bars, menus or cards.
7. **Motion starts where you acted.** A menu grows out of its button. A dialog rises from just below its final position. Things leave faster than they arrive.
8. **Glossy is a whisper.** The gradient on a button is a few percent of lightness, not a shine. If you notice the gradient before you notice the button, it's too strong.
9. **Calm ADHD-friendly screens.** One thing to look at first per screen, generous spacing, nothing that moves unless you caused it (except progress you're waiting for).

---

## 4. Themes and colour

**Light is the default.** Dark is a complete theme, not an afterthought, for traders who review at night. Settings has Appearance: System, Light, Dark. System follows the computer's setting; when there is none, the app uses light. Build and check every screen in light first, then dark.

Chart screenshots are never themed. They show whatever the trader's charting app looked like, so a dark TradingView chart stays dark in light mode. Chart frames give them a neutral edge so they sit well on either theme.

### Light tokens (default)

| Token | Value | Use |
|---|---|---|
| `--bg-app` | `#F2F2F4` | The window ground. The sidebar sits directly on it; the main card rests on it |
| `--bg-app-glow` | `radial-gradient(1200px 600px at 12% -10%, rgba(255,255,255,0.9), transparent 60%)` | A faint glow on the ground, under the sidebar and the window edges |
| `--surface-1` | `#FFFFFF` | The main content card (the ref 5 panel) |
| `--surface-2` | `#FFFFFF` | Cards inside the main card, separated by a hairline ring and a light shadow (section 5) |
| `--surface-3` | `#FFFFFF` | Floating: menus, popovers, the selected segment, dialogs |
| `--surface-inset` | `#F6F6F8` | Wells: inputs, text areas, segmented-control tracks, chart frames, notice icon tiles |
| `--surface-hover` | `rgba(15,17,21,0.04)` | Row and ghost-button hover |
| `--surface-pressed` | `rgba(15,17,21,0.07)` | Row press, the selected nav item |
| `--border-subtle` | `rgba(15,17,21,0.06)` | Between rows |
| `--border` | `rgba(15,17,21,0.10)` | Inputs, cards that need an edge |
| `--border-strong` | `rgba(15,17,21,0.16)` | An active filter, drop zones |
| `--highlight` | `rgba(255,255,255,0.9)` | The 1px top highlight on raised things |
| `--highlight-strong` | `#FFFFFF` | The highlight on buttons |
| `--text-1` | `#141519` | Primary (18.2:1 on white) |
| `--text-2` | `#4A4E56` | Secondary (8.2:1 on white, 7.3:1 on the ground) |
| `--text-3` | `#6B6F77` | Tertiary (5.1:1 on white, 4.6:1 on the ground) |
| `--text-disabled` | `#A2A6AE` | Disabled only. Never meaningful text |
| `--profit` | `#1D63D6` | Positive R, winning bars (5.0:1 or more) |
| `--loss` | `#C2410C` | Negative R, drawdown, destructive text (4.7:1 or more) |
| `--attention` | `#8F5A06` | The single "needs a look" dot or icon (5.3:1 or more) |
| `--voice` | `#6D4FD8` | The voice note action, "Suggested" labels, the Analysis chip (5.1:1 or more) |
| `--focus` | `#141519` | The focus ring |
| `--inverse-bg` / `--inverse-fg` | `#18191D` / `#FFFFFF` | Toasts, switches when on, the play button |

### Dark tokens

| Token | Value |
|---|---|
| `--bg-app` | `#0B0C0E` |
| `--bg-app-glow` | `radial-gradient(1200px 600px at 12% -10%, rgba(120,140,170,0.10), transparent 60%)` |
| `--surface-1` | `#121418` |
| `--surface-2` | `#181B20` |
| `--surface-3` | `#1E2127` |
| `--surface-inset` | `#0E1013` |
| `--surface-hover` | `rgba(255,255,255,0.05)` |
| `--surface-pressed` | `rgba(255,255,255,0.08)` |
| `--border-subtle` | `rgba(255,255,255,0.06)` |
| `--border` | `rgba(255,255,255,0.09)` |
| `--border-strong` | `rgba(255,255,255,0.14)` |
| `--highlight` | `rgba(255,255,255,0.06)` |
| `--highlight-strong` | `rgba(255,255,255,0.12)` |
| `--text-1` | `#ECEEF1` (13.9 to 16.8:1 on every surface) |
| `--text-2` | `#B0B6C0` (8.4:1 or more) |
| `--text-3` | `#828995` (4.6:1 or more) |
| `--text-disabled` | `#5F6672` |
| `--profit` | `#5BA2FF` (6.2:1 or more) |
| `--loss` | `#FF9A4D` (7.7:1 or more) |
| `--attention` | `#E8C766` |
| `--voice` | `#B9A6FF` |
| `--focus` | `#ECEEF1` |
| `--inverse-bg` / `--inverse-fg` | `#ECEEF1` / `#0E1014` |

The contrast figures were checked against every surface in their theme. Profit and loss differ in lightness as well as hue, so they still read apart for colour-blind users. Results always carry a sign (+2.1R, −1.0R), so colour is never the only signal.

### Text hierarchy

Three tones, each with one job. The steps between them are wide on purpose: the first version had secondary and tertiary text so close in tone (`#52565E` and `#62666E`) that a row's details and its hint looked the same.

| Tone | Job | Examples |
|---|---|---|
| `--text-1` | What you read or act on | Page and card titles, pair names, values and numbers, input values, labels on buttons and filters, menu rows, the user's own words when they are the content (a quote, a note in a field) |
| `--text-2` | Supporting copy, and labels that name a value | Subtitles, a row's details line (date, status, account), descriptions under settings, labels above a stat ("Net R", "Win rate") and beside a field value ("Setup", "Tags"), nav items at rest, ghost buttons ("Count it", "Trade log"), icons inside buttons and menus |
| `--text-3` | Hints and scaffolding | Helper text under fields, the last line of a row (a hint or the setup and tags), the line under a stat number, column headers, chart axis labels, counts beside tab labels, timestamps on their own, captions under thumbnails, placeholders |

Rules that follow from it:
- **A stat is label, then value, then context.** Label `--text-2` 14/500, value `--text-1` 24/600, context `--text-3` 12/400. Never value above label.
- **One tone per line.** Don't mix tones inside a sentence, except a coloured result (+0.6R) inside a details line.
- **Weight before tone.** To lift something inside the same tone, use weight (500 or 600), not a darker colour.
- **Disabled is not a tone.** `--text-disabled` is only for things you can't use.

---

## 5. Surfaces and elevation

Five layers. Every element belongs to exactly one.

| Layer | What lives here | Light | Dark |
|---|---|---|---|
| 0 Ground | The window and the sidebar (transparent, directly on the ground) | `--bg-app` plus `--bg-app-glow` | Same |
| 1 Main card | The page's content area (ref 5) | `--surface-1`, `0 0 0 1px rgba(15,17,21,0.05), 0 1px 2px rgba(15,17,21,0.04), 0 8px 24px -12px rgba(15,17,21,0.08)` | `--surface-1`, a 1px `--border-subtle` edge, `inset 0 1px 0 var(--highlight)` |
| 2 Cards | Tiles, chart cards, the Details panel, Notes, the weekly takeaway, notices, stat groups | `--surface-2`, `0 0 0 1px rgba(15,17,21,0.08), 0 1px 2px rgba(15,17,21,0.04)` | `--surface-2`, a gradient hairline (section 6), no drop shadow |
| 3 Floating | Menus, popovers, tooltips, the selected segment | `#FFF`, `0 0 0 1px rgba(15,17,21,0.06), 0 4px 10px -4px rgba(15,17,21,0.08), 0 18px 44px -12px rgba(15,17,21,0.20)` (the ref 1 menu) | `--surface-3`, `0 0 0 1px rgba(255,255,255,0.08), 0 4px 8px -2px rgba(0,0,0,0.45), 0 16px 40px -8px rgba(0,0,0,0.65)`, top highlight |
| 4 Overlay | Dialogs and sheets, over a blurred scrim | `#FFF`, `0 24px 64px -16px rgba(15,17,21,0.28)` | `--surface-1`, `0 24px 64px -12px rgba(0,0,0,0.7)` |

**Layout of every page (ref 5):** the sidebar sits directly on the ground with no background, border or blur, so the two read as one surface with no seam. The main card fills the rest, inset `8px` from the top, right and bottom window edges (and `0` on the sidebar side), with radius `--r-panel` (14px). The page scrolls inside the main card, not the window. On phone width, the inset becomes `0` and the radius `0`, so the main card is the screen.

**Inside the main card:** cards are layer 2. List rows are not cards. They sit directly on layer 1 and are separated by `--border-subtle` hairlines.

**Stat groups are one card.** A row of stats (the dashboard's five, the weekly review's three) is a single layer 2 card with `1px` `--border-subtle` vertical dividers between the stats (inset 6px from the top and bottom), not a row of separate tiles. The playbook's header stats sit directly on layer 1 with no card, because they belong to the page title.

---

## 6. Highlights, borders and shadows

**Top highlight (refs 1, 2, 7).** Every raised surface (layers 1 to 3, and buttons) gets `box-shadow: inset 0 1px 0 var(--highlight)`. On buttons, use `--highlight-strong`. In light mode it is barely visible on white; it matters most on buttons and in dark mode.

**Cards in light mode:** a hairline ring plus a soft contact shadow (layer 2 above). No gradient edge.

**Gradient hairline on cards (ref 7, dark only).** A card's border is brighter at the top and fades down the sides:

```css
[data-theme="dark"] .card {
  background:
    linear-gradient(var(--surface-2), var(--surface-2)) padding-box,
    linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.03)) border-box;
  border: 1px solid transparent;
  border-radius: var(--r-card);
}
[data-theme="dark"] .card:is(a, button):hover {
  background:
    linear-gradient(var(--surface-2), var(--surface-2)) padding-box,
    linear-gradient(180deg, rgba(255,255,255,0.17), rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.04)) border-box;
}
```

**Shadows** are always layered: one tight, darker shadow for contact plus one wide, soft shadow for lift. They never sit sideways, never use colour, and never glow.

**Borders** are 1px and use a token, never a hard-coded hex. There are no 2px borders except the focus ring and the selected underline on filter tabs.

---

## 7. Translucency and blur

| Where | Treatment |
|---|---|
| Sidebar | **No blur, no background.** It is transparent on the ground. In a native desktop wrapper on macOS (Tauri or Electron), real window vibrancy may be used instead, because there the wallpaper is behind it |
| Sticky headers inside the main card (trade log toolbar, story header) | **Solid `--surface-1`, no blur.** Add a `--border-subtle` bottom hairline only once the page has scrolled. (A frosted bar was tried; it cost rendering time on every scroll for an effect you barely see on white) |
| Overlay scrim (ref 3) | Light `rgba(242,242,244,0.55)`, dark `rgba(8,9,11,0.45)`, both with `backdrop-filter: blur(10px) saturate(120%)`. The blur goes on the scrim, not on the dialog. This is the only blur in the app |
| Bottom sheets on phone | Like dialogs, with a 36 × 4px drag handle |
| Menus and popovers | Opaque. No blur: text in menus must be crisp, and a menu over a chart must not show the chart through it |

**Fallbacks:** if `backdrop-filter` isn't supported, or the user has `prefers-reduced-transparency: reduce`, the scrim uses the same colour at 80% opacity. Nothing depends on the blur to be readable.

---

## 8. Shape, size and spacing

### Radius

| Token | Value | Use |
|---|---|---|
| `--r-xs` | `6px` | Pills, tags, direction chips, keyboard shortcut badges |
| `--r-sm` | `6px` | Menu rows, segments, nav items |
| `--r-md` | `8px` | Buttons, inputs, segmented track, notice icon tiles |
| `--r-card` | `12px` | Layer 2 cards, stat groups, chart thumbnails (`8px` when under 120px wide) |
| `--r-menu` | `12px` | Menus and popovers |
| `--r-panel` | `14px` | The main card |
| `--r-dialog` | `16px` | Dialogs, sheets (top corners only on sheets) |
| `--r-full` | `999px` | Avatars, the voice record button, medallions |

**Nested radii:** an inner radius equals the outer radius minus the padding between them. A menu (12px, padding 4px) has rows at 8px or less (we use 6px). A segmented track (8px, padding 2px) has segments at 6px.

### Control heights

One height for every control, so a row of mixed controls (a filter, a select, a segmented control and a button) lines up on one line.

| Token | Value | Use |
|---|---|---|
| `--h-sm` | `28px` | Segments inside a segmented control, small inline buttons |
| `--h-md` | `32px` | **The default:** buttons, inputs, selects, filter triggers, icon buttons (32 × 32), drop targets styled as buttons, sidebar nav items |
| `--h-lg` | `36px` | Rarely: a full-width primary at the end of a form may use it |
| `--h-row` | `34px` | Menu rows |

Side padding is `12px` on buttons, inputs and nav items. Icons inside controls are `16px` (nav icons `17px`), with an `8px` gap to the label.

**Touch targets** are at least 44px on touch devices: controls keep their look and grow their hit area with padding or a pseudo-element. On desktop, the sizes above are the hit areas.

### Spacing

Tailwind's 4px scale, limited to eight steps. Nothing else is used for gaps, padding or margins (the first version had 17 gap sizes and 20 padding sizes).

| px | Tailwind | Used for |
|---|---|---|
| 2 | `0.5` | Label to value inside a stat, chip and badge padding top and bottom, nudges inside small parts |
| 4 | `1` | Text to its caption, inner spacing of a pill, the menu's inner padding |
| 8 | `2` | Icon to label in buttons, menus and nav; field label to input; between chips and tags; between buttons in a group; chip side padding |
| 12 | `3` | Button, input and nav item side padding; card header to content; menu row side padding; between rows of a form |
| 16 | `4` | Between parts inside a card; list row padding top and bottom; between controls in a toolbar |
| 24 | `6` | Card padding; the gap between cards in a grid; list row side padding |
| 32 | `8` | Between sections of a page; page padding inside the main card |
| 48 | `12` | Page bottom padding; space around an empty state |

- **Rule of thumb:** the closer two things are related, the smaller the step. Inside a control 4 to 8, inside a card 12 to 16, between cards 24, between sections 32.
- Icon-only buttons have no padding; their size (32 × 32) sets the hit area.
- The window inset around the main card stays `8px` and the sidebar padding `16px 12px`.

---

## 9. Typography

- **Inter** for everything: headings, body, form controls, numbers and chart labels. One family, no second typeface. In the build, use the variable font with optical sizing (`opsz` 14 to 32). The canvas loads four static weights (400, 500, 600, 700) because the editor preview couldn't keep up with the variable font; the look is the same.
- **Numbers:** `font-variant-numeric: tabular-nums` everywhere a number can change or sit in a column (R values, counts, prices, times, MT5 ticket numbers). The minus sign is a real `−` (U+2212), never a hyphen.
- Optional character variants: `"cv11"` (single-storey a) is allowed if it reads better at small sizes; decide once and use it everywhere.

**The scale: Tailwind's, four sizes.** The journal uses four steps of Tailwind's default type scale, with Tailwind's own line heights, so the build can use Tailwind's `text-*` classes as they are. Earlier versions used up to seven sizes (11 to 30, then 12, 13, 14, 15, 16 and 24); 13 and 15 sat between standard steps and are gone.

| Tailwind class | Size / line height | Weight | Tracking | Used for |
|---|---|---|---|---|
| `text-2xl` | 24 / 32 | 600 (`font-semibold`) | −0.025em (`tracking-tight`) | Page titles, stat numbers, the result in a story header |
| `text-base` | 16 / 24 | 500 (`font-medium`) | 0 | Card, section, dialog and state titles; the wordmark (600) |
| `text-sm` | 14 / 20 | 400 or 500 | 0 | Body, buttons, fields, menus, table cells, segments, row titles (500), details lines and descriptions (`--text-2`), labels that name a value (500, `--text-2`), form labels (500) |
| `text-xs` | 12 / 16 | 400 or 500 | 0 | Hints, captions under thumbnails, the context line under a stat, column headers, tags and chips (500), chart axis labels, the first line of a chart readout |

- **Weights:** 400 for body and data, 500 for names, headings and emphasis, 600 only at 24px, on the primary button and on a selected option in a segmented control.
- **Colour carries results, not weight.** +2.1R is `--profit` at 500, not bold.
- **Hierarchy within 14px comes from weight and tone,** not size: a row is title (14/500 `--text-1`), details (14/400 `--text-2`), hint (14 or 12 `--text-3`).
- **Writing boxes** (notes, reflection, review takeaway) use `leading-relaxed` (1.625).
- **Phones:** fields and body text go up to `text-base` (16px) so iOS doesn't zoom in on focus.
- **Rendering:** `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` on the root.
- **Figures:** `font-variant-numeric: tabular-nums` on the root, so every number (counts in tabs, axis labels, calendar counts, years) keeps its width.
- **Tracking resets below 16px.** Text inside a heading (a chip or count in the page title) must not inherit the heading's negative tracking: `letter-spacing: 0` on spans inside headings, labels and meta text.
- **Measure:** 72 characters per line at most. A note that runs across a wide card gets a max width of about 520px at 14px.
- **Wrapping:** `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs and helper text, so no line ends on one stray word. `overflow-wrap: break-word` on the root, so long user text (account names, MT5 server names, ticket numbers) wraps instead of widening a layout.
- **Fields:** every input, select and text area is `text-sm` (14px).
- **Quotes:** quoted notes use curly quotes (“ ”), never straight ones.
- **A count beside a page title** is regular weight in `--text-3`: "Accounts (5)".

| Style | Size / line height | Weight | Tracking | Tone |
|---|---|---|---|---|
| Display: page title, stat value, hero result | 24 / 30 | 600 | −0.02em | `--text-1`, or profit/loss for results |
| Heading: card, section and dialog titles | 16 / 22 | 500 | −0.01em | `--text-1` |
| Row title: pair, account name in a list | 15 / 20 | 500 | 0 | `--text-1` |
| Body | 14 / 20 | 400 | 0 | `--text-1` or `--text-2` |
| Body strong: setup names, notice titles, results in tables | 14 / 20 | 500 | 0 | `--text-1`, or profit/loss |
| Details line, description | 13 / 18 | 400 | 0 | `--text-2` |
| Label (names a value) and form label | 13 / 18 | 500 | 0 | `--text-2` for labels, `--text-1` for form labels |
| Hint, column header | 13 / 18 | 400 | 0 | `--text-3` |
| Caption, chip, axis label | 12 / 16 | 400 (chips 500) | 0 | `--text-3` (chips `--text-2`) |
| Section label (CONTEXT, ENTRY) | 12 / 16 | 500, uppercase | 0.04em | `--text-2` |

Links that continue a sentence get a 1px underline in `--border-strong`, offset 3px, that turns `--text-1` on hover (ref 2's "Resend").

---

## 10. Icons and illustration

**Interface icons:** stroke icons, `1.8px` stroke at `16px` (`1.5px` at `20px`), round caps and joins. Use one family throughout (Lucide matches this). They are monochrome and follow the text hierarchy: `--text-2` at rest inside buttons, menus and nav; `--text-1` on hover or when active; `--text-3` for status icons in a details line. The only coloured icons are third-party brand marks (MT5, TradingView), the voice note microphone (`--voice`), an attention icon (`--attention`), and icons in a destructive menu row, which take the row's `--loss`.

### Where icons go

| Place | Icon | Examples on the canvas |
|---|---|---|
| Sidebar nav | Always, one per item | Dashboard, Trade log, Playbook |
| Buttons that create, add, upload, record or pick | Leading, 16px | New chart story (+), Drop, paste or choose charts, Add a note (mic), the account picker |
| Filter and sort triggers | Leading icon for the dimension, trailing chevron | All time (calendar), Tags (tag), Newest first |
| Action menus (things you do to an item) | Leading 16px icon on every row | Change date (calendar), Exclude from stats (chart), Delete (trash), Archive setup, Edit rules, Rename (pen), Move left and right (arrows), Remove (×), Pin as textbook (bookmark) |
| Choice menus (picking a value) | **No leading icons.** Only a check on the right of the selected row | Pair, Setup, Status, Review day |
| Icon-only buttons | The icon, with an `aria-label` and a tooltip | More (three dots, never the "···" text glyph), close, back |
| Notices that ask for something | A 32px tile: `--surface-inset`, `--r-md`, a `--border-subtle` ring, a 16px icon in `--text-2`, top-aligned with the title, 12px gap | "USDCHF closed 8 seconds after opening" (clock), "1 trade has no charts yet" (image) |
| Status in a details line | A 14px icon before the words, in `--text-3` (or `--attention` when it needs a look) | MT5 · synced (link), Your screenshots (image), MT5 · reconnect needed (alert) |
| Facts in a trade log entry | Each fact is a 14px icon in `--text-3` plus its text, 8px apart, with 16px between facts and no "·" separators. The icon is the same one its filter uses, so a fact and its filter read as one thing: date (calendar), status (check circle), account (card), setup (book), plan (clipboard check), tags (tag), excluded from stats (circle with a line). Hints written as sentences ("Still open in MT5…") keep no icon. Grid cards show date and setup the same way at 12px | Trade log list and grid |
| Empty and system states | A medallion (below) | Trade log · brand new |
| Links that take you to another page | A trailing 14px arrow | Open playbook, Open in trade log, Trade log |
| The week's focus, wherever it appears | A leading 14px target icon in `--text-3` | This week's focus (dashboard), The week before, you said (review) |
| Something the journal suggests or drafted | A sparkle icon in `--voice` (in a 32px tile when it's a notice). Drafted from voice notes uses a mic icon in `--voice` instead | 4 of them look alike, 4 unsorted chart stories look alike, Drafted from your voice notes |
| Add-a-row buttons and add chips | A leading plus icon, never a typed "+" | Add a rule, Your own type |
| Reorderable rows | A grip icon (six dots), never "⋮⋮" | Setup rules |
| Remove buttons | An × icon in a 32px ghost button, never the "×" character | Rules, tags in Settings |
| Archived groups | A leading archive icon | Archived (2), Archived setups |
| Edit on a page section | A leading pen icon | Rules · Edit |

**Never:** on page titles, card titles, section headings, stat labels, field labels, or in the middle of body text. A tab or segment has no icon unless it switches a view (List and Grid). A button whose label toggles to "Done" (Edit numbers, Edit session times, Manage tags) has no icon, because the icon would no longer match the label.

**The attention dot** (a 7px `--attention` dot) stays as the one "needs a look" marker on cards and rows, such as a setup with an early signal. It is never used for connection status.

### Illustrations (ref 2)

Used for empty states, first run, and system states such as "MT5 connected" or "Microphone blocked". Each is a single medallion, never a scene:
- A circle `80px` (`64px` on phone), filled with a soft vertical gradient. Light: `#ECECEF` → `#DEDEE2`. Dark: `#262A31` → `#1B1E23`.
- A `4px` ring in the surface colour around it, so it looks seated in the card.
- Shadow: light `0 10px 24px -10px rgba(15,17,21,0.25)`, dark `0 8px 24px -8px rgba(0,0,0,0.6)`.
- One flat glyph inside, `32px`, two tones at most (light: white fill with a mid-grey detail; dark: mid-grey fill with a darker detail), no outlines.
- Optionally one tiny badge at the bottom right (`16px` circle) for status, such as a sync arc or a check.

There is one medallion per screen at most, centred above its headline.

---

## 11. Components

### Buttons (refs 1, 2, 3, 7)

All buttons have a radius of `--r-md` (8px), use Inter 14/500 (primary 600), and have `gap: 8px` between the icon and the label. Sizes: `sm` 28px, `md` 32px (the default), `lg` 36px, all with `12px` side padding. Icon-only buttons are 32 × 32.

| Variant | Light | Dark | Use |
|---|---|---|---|
| **Primary** | `linear-gradient(180deg, #2B2D33, #18191D)`, text `#FFFFFF`, `box-shadow: 0 0 0 1px #0B0C0E, inset 0 1px 0 rgba(255,255,255,0.14), 0 1px 2px rgba(15,17,21,0.25), 0 4px 10px -4px rgba(15,17,21,0.35)` (ref 3's black primary) | `linear-gradient(180deg, #FFFFFF, #E4E7EB)`, text `#0E1014`, `box-shadow: 0 0 0 1px rgba(255,255,255,0.7), inset 0 -1px 0 rgba(15,17,21,0.12), 0 1px 2px rgba(0,0,0,0.5), 0 4px 10px -4px rgba(0,0,0,0.5)` | One per screen: Save story, Done, New chart story, Apply |
| **Secondary** | `linear-gradient(180deg, #FFFFFF, #FAFAFB)`, text `--text-1`, icon `--text-2`, `0 0 0 1px var(--border), 0 1px 2px rgba(15,17,21,0.06)` (ref 3 "Watch Demo") | `linear-gradient(180deg, #2A2D33, #23262B)`, text `--text-1`, icon `--text-2`, `0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.4)` (ref 7) | Cancel, Clear filters, Show older entries, filter and menu triggers |
| **Ghost** | No fill, text and icon `--text-2`; `--surface-hover` and `--text-1` on hover | Same | Toolbar icons, row menus (more), "Count it", "Edit numbers" |
| **Voice** | `linear-gradient(180deg, #7D62E6, #6247CF)`, text `#FFF`, the primary shadow recipe | `linear-gradient(180deg, #C9B9FF, #A893F5)`, text `#0E1014` | Only "Talk it through" and its record button |
| **Destructive** | Ghost or secondary with text `--loss` | Same | Delete in menus. Never a filled red or orange button (Undo makes deletes safe) |

**States:**
- **Hover:** the fill shifts about 3% (darker in light, lighter in dark), the highlight goes to `--highlight-strong`, and the icon goes from `--text-2` to `--text-1`.
- **Pressed:** `translateY(0.5px)`. The gradient flattens to its bottom colour, the drop shadows drop to their contact layer only, and the inset highlight is removed. This takes `80ms`.
- **Focus-visible:** `0 0 0 2px var(--surface-1), 0 0 0 4px var(--focus)`, added to the existing shadows.
- **Disabled:** `opacity: 0.45`, no shadow, `cursor: not-allowed`. Prefer hiding over disabling where the decisions doc allows it.
- **Loading (ref 4):** the label fades out and a `16px` spinner fades in at the centre. The button keeps its width. It is not clickable while loading. Use this for "Test connection", Save while uploading, and "Stop" while a note is processed.

### Segmented controls (refs 6, 7)

One control for every switch between a few options: the dashboard period, Plan (Followed / Not followed), List / Grid, Appearance, and the playbook's Examples / Patterns / Lessons. The track is `--surface-inset` with a 1px `--border-subtle`, radius `--r-md` (8px) and padding `2px`. Each segment is `28px` tall, radius `6px`, padding `0 12px`, label 14/500 `--text-2`. The selected segment is `--surface-3`, label `--text-1` 600, with `0 0 0 1px var(--border-subtle), 0 1px 2px rgba(15,17,21,0.08)` and the top highlight (dark: `0 1px 2px rgba(0,0,0,0.35)`). A count inside a segment ("Examples 52") is `--text-3`, or `--text-2` in the selected segment. The selected fill **slides** between segments (section 12). It does not jump. It is never an inverse (black) fill.

Account types on Add account use filled chips instead (`--inverse-bg` when chosen), because they are a pick-one list that can grow, not a switch.

**Filter tabs** (All, Winners, Losers on a setup) are a second, quieter level under a segmented control: plain text 14/500 `--text-2`, the selected tab `--text-1` 600 with a 2px `--text-1` underline, counts in `--text-3`.

### Menus and dropdowns (ref 1)

- Layer 3. Radius `--r-menu` (12px), padding `4px`, width matching the trigger or 220 to 300px.
- Rows are `34px` tall, with radius `6px`, padding `0 12px` and an `8px` gap. The label is 14/400 `--text-1`, and the meta (counts, shortcuts) 12/500 `--text-3` on the right.
- **Action menus** have a 16px leading icon in `--text-2` on every row (section 10). **Choice menus** have none.
- **Hover and keyboard focus:** a `--surface-hover` fill on the inset row (ref 1's grey row), with no border.
- **Selected option:** a check icon on the right, not a fill.
- Dividers are a full-bleed 1px `--border-subtle`, with `6px` above and below.
- A small section label (12/500 `--text-3`) is allowed above a group.
- **Submenus** open beside the menu with an `8px` gap, their first row aligned to the row that opened them, on hover after 120ms or on Right arrow. A chevron marks rows that have one.
- The menu opens below the trigger with a `6px` gap. It flips up if there's no room, and is never clipped by the main card.
- Keyboard: arrows move, Enter chooses, Escape closes and returns focus to the trigger, and typing jumps to a matching row.
- Behaviour (one open at a time, clicking outside closes, counts in filter menus) is in the decisions doc's behaviour kit.

### Inputs and text areas

- `--surface-inset` fill, 1px `--border`, radius `--r-md` (8px), `32px` tall, padding `0 12px`, 14px text.
- Hover changes the border to `--border-strong`. Focus keeps the border `--border-strong` and adds the focus ring.
- Placeholder is `--text-3`. Note text areas grow with their content up to 8 lines, then scroll.
- A form label sits `6px` above its input (14/500 `--text-1`). Helper text sits `6px` below (12/400 `--text-3`).
- **Details value buttons** (Setup, Headspace on a story) are 34px tall, padding `4px 12px`, radius 6px, holding the value as a 12px pill with a chevron on the right.
- **Ghost fields** (Details values that read as text until clicked) have no fill and no border at rest, show `--surface-hover` on hover, and become a full input on focus.
- **The tag field** is an input that holds pills. The autocomplete menu is a standard choice menu.

### Cards

Layer 2, `--r-card` (12px), padding `24px` for content cards (charts, tables, notes) and `16px` for compact cards (the focus line, stat groups, the Details panel's rows): a hairline ring and soft shadow in light, the gradient hairline in dark. A clickable card strengthens its edge on hover (section 6) and moves up `1px` over `140ms`. It never scales.

Card headers are a title (16/500) on the left with a caption or a quiet link on the right, and `12px` above the content. Card padding is `24px`.

### Stat groups

One layer 2 card, padding `16px`, holding the stats in a grid. Each stat: label (14/500 `--text-2`), value (24/600 `--text-1`, or profit/loss for a result) `4px` below, context line (12/400 `--text-3`) `4px` below that. Stats are padded `2px 20px` (the first `2px 4px` on the left) and divided by 1px `--border-subtle` lines inset 6px from the top and bottom. On narrow widths the grid wraps to two columns and the dividers become row hairlines.

### Notices

A notice asks the trader to do something now: count or leave out a very short trade, add charts to a trade that has none. It is a layer 2 card, padding `16px 24px`, with the icon tile (section 10) on the left, a title (14/500 `--text-1`) and one details line (14/400 `--text-2`) beside it, and its actions on the right (a secondary or a dashed drop target, then a ghost button). A notice disappears once acted on; it is never stacked more than one per kind.

### Dialogs and sheets (ref 3)

The scrim follows section 7. The dialog is layer 4, `--r-dialog` (16px), width `440 to 640px`, padding `24px`, with the title, then the body, then actions right-aligned (primary last).

Use them sparingly: the journal has no confirm dialogs (decisions doc). Dialogs are for focused tasks only, such as naming a new setup from Unsorted (drawn on the canvas) or connecting MT5. On phone, every dialog becomes a bottom sheet.

### Popovers and tooltips

A popover (Change date, the tag-kind question) is layer 3, `--r-menu`, padding `12px`. A tooltip is `#141519` with white text in light mode and `--surface-3` in dark mode, `--r-sm`, 12/500, padding `6px 8px`, no arrow, shown after a 400ms hover or immediately on keyboard focus. Tooltips are for icon-only buttons and truncated text only.

### Toasts

Toasts sit at the bottom centre, `28px` from the edge, in the inverse colours (`--inverse-bg` and `--inverse-fg`: near-black with white text in light, near-white with dark text in dark). Radius `12px`, padding `12px 12px 12px 16px`, the layer 3 shadow. Undo is an outlined button inside. One toast at a time: a new one replaces the old.

### Sidebar navigation (refs 5, 6)

The sidebar sits on the ground with no background, border or blur (section 7). Width is `232px`, padding `16px 12px`, with `24px` between the wordmark and the nav. Items are `32px` tall with radius `6px`, padding `0 12px`, an `8px` gap, an icon `17px` in `--text-2`, and a label 14/500 `--text-2`. The active item has a `--surface-pressed` fill with the top highlight, icon and label in `--text-1`. Hover shows `--surface-hover`. Counts and shortcuts on the right are 12/500 `--text-3`. A small section label (12/500 uppercase `--text-3`, tracking 0.04em) separates groups. The account and settings live at the bottom.

### Switches

46 × 28px, radius 12px. Off: `--surface-inset` track with a 1px `--border`, a 20px `--text-3` knob 3px from the left. On: `--inverse-bg` track, no border, a 22px `--surface-inset` knob 3px from the right. Used for settings that take effect at once (Practice account, Reminder, Keep recordings).

### Pills, tags and chips

- **Tags:** `--surface-inset` fill, 1px `--border` ring, `--r-xs`, 12px 500 `--text-1`, padding `2px 8px`, a × icon button inside when editable. No colour by kind.
- **Direction chip** (Long, Short): the same shape, 12px 500 `--text-2`, with a `--border-strong` outline and no fill.
- **Analysis and Suggested:** `--voice` text and outline, no fill.
- **Textbook example:** `--surface-pressed` fill, 12/500 `--text-1`.
- **Keyboard shortcut badge** (ref 6's ⌘1): 11/500 `--text-3` with a 1px `--border` outline, `--r-xs`, 20px tall.

### Lists and rows

Rows sit on layer 1 with no card. Their details are icon-and-text facts (section 10). They are separated by a `--border-subtle` hairline, padding `16px 24px`, and the whole row shows `--surface-hover` on hover when it opens something. A row reads in three tones: title (14/500 `--text-1`, with its chips and result), details line (14 `--text-2`), last line (14 `--text-3`). The row menu (the more icon in a 32px ghost button) appears on hover and focus on desktop and is always visible on touch.

### Tables

Used where rows share columns (Accounts, By setup). Column headers are 12/400 `--text-3`, left-aligned for text and right-aligned for numbers. Cell text is 14 `--text-1` for the name and numbers, `--text-2` for categories (Type). A chevron on the right (16px `--text-3`) marks a row that opens something.

### Chart thumbnails and chart frames

- A chart is shown in a frame with `--surface-inset` background, radius `--r-card` (8px when small), a 1px `--border-subtle` and no shadow. The chart image fills the frame with `object-fit: contain`. The image itself is never recoloured for the theme.
- **Selected thumbnail:** a `2px` `--text-1` ring with a `2px` gap (`0 0 0 2px var(--surface-1), 0 0 0 4px var(--text-1)`).
- **Drop zones:** a `1.5px` dashed `--border-strong`, `--r-card`, `--text-1` label with a 16px image icon. On drag-over, the border becomes solid `--text-1` and the fill `--surface-hover`. A drop target that sits in a row of buttons takes the control height (32px) and `--r-md`.

### Empty states

An empty state is a medallion (section 10), a title, one line of body text and at most one action. It is centred in the space the content would take, never in a card of its own.

### Skeletons and progress (ref 4)

- **Skeletons** take the exact shape of what's loading (text lines at their real widths, chart frames at 16:9). Fill `--surface-hover`, `--r-xs`, with a shimmer: a 30%-wide highlight band (`rgba(255,255,255,0.6)` light, `rgba(255,255,255,0.04)` dark) moving left to right every `1.4s`.
- **Progress hairline:** a `2px` line at the top of the main card (`--text-1` at 70%) for multi-step work such as an MT5 sync, an upload, or processing a voice note. It moves smoothly and never jumps back.
- **Never** a full-screen spinner. Content that's already on screen stays, and only the part that's loading shows a skeleton.

---

## 12. Motion (ref 4)

Fast, soft and continuous. Interactions feel immediate, transitions feel smooth, and nothing bounces.

### Timing

| Token | Duration | Use |
|---|---|---|
| `--d-instant` | `80ms` | Press, hover colour, checkbox |
| `--d-fast` | `140ms` | Menus, popovers, tooltips, the segmented slide |
| `--d-base` | `220ms` | Dialogs, sheets, toasts, expanding sections, rows entering or leaving |
| `--d-slow` | `320ms` | Page-level changes: a past week loading, the dashboard period change, route transitions |

Exits use about 70% of the enter duration.

### Easing

| Token | Curve | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Anything entering or growing |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Anything leaving |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Things that move while staying on screen (the segmented slide, reorders, number changes) |
| Spring | stiffness 420, damping 34, mass 1 (no overshoot) | Drag and drop: chart reordering, rule reordering |

### What moves, and how

- **Menus and popovers:** they grow from the trigger's side. `opacity 0 → 1`, `scale 0.97 → 1`, `translateY(-4px) → 0`, with `transform-origin` at the trigger, over `--d-fast` `--ease-out`. They close with opacity only, over `100ms`.
- **Submenus:** slide `4px` from the parent's side and fade.
- **Dialogs:** the scrim fades over `--d-base`. The dialog runs `opacity 0 → 1`, `scale 0.98 → 1`, `translateY(8px) → 0`, over `--d-base` `--ease-out`, starting `40ms` after the scrim. It exits faster, and the blur animates with the scrim.
- **Sheets (phone):** slide up from the bottom over `--d-base`, and follow the finger when dragged down. Releasing more than 30% of the way down dismisses the sheet.
- **Toasts:** rise `12px` and fade in over `--d-base`, and leave by fading and dropping `8px`. A replacing toast cross-fades.
- **Segmented controls:** the selected fill slides to the new segment over `--d-fast` `--ease-standard`, and the labels cross-fade their weight.
- **Lists:** when filters change, rows that stay move to their new position (FLIP) over `--d-base`. New rows fade in with a 20ms stagger, capped at 8 rows. A removed row collapses its height and fades over `--d-base`. An Undo restores it with the reverse animation.
- **Notices:** when acted on, a notice collapses its height and fades over `--d-base`.
- **Numbers:** when a stat changes (switching the period or accounts), it counts to its new value over `--d-slow` `--ease-standard`. This happens only on a change, never on first load.
- **Charts:** they draw in once on first load (the line traces left to right over `600ms`). When the data changes, they morph to the new values over `--d-slow`. They never redraw from zero on a filter change.
- **Theme change:** colours cross-fade over `--d-slow` when the trader switches Appearance. Nothing moves.
- **Page changes inside the app:** the main card's content cross-fades with a `4px` upward drift over `--d-slow`. The sidebar and the main card itself never move.
- **The voice note:** while recording, the record dot breathes (`1.6s`, ease-in-out, infinite) and the timer ticks. This is the one continuous animation allowed outside of loading.
- **Hover on cards:** only the edge and a `1px` lift change. No scale and no shadow bloom.

The canvas shows menus, dialogs, toasts, the recording dot, the equity line drawing in, and hover and press. It can't show exit animations, the segmented slide, FLIP list moves or counting numbers; build those from this section.

### Reduced motion

With `prefers-reduced-motion: reduce`:
- Every movement becomes an opacity fade of `120ms` or less.
- Shimmer stops, so skeletons stay still.
- Numbers swap instantly and charts appear without drawing.
- The recording dot stops breathing, and the timer keeps ticking.

---

## 13. Data and charts

- **Results** use `--profit` and `--loss`. Zero uses `--text-2`. Always in R with a sign, never money.
- **R over time:** the line is `--text-1`, `2px`, straight segments between trades with round joins (no smoothing: a curve would invent values between trades). Under it, a soft area fill: `--text-1` from 7% at the top to 0 at the bottom. Drawdown from the running peak is a `--loss` gradient fill (14% to 5%) between the peak and the line. Gridlines are `2 4` dashed `--border-subtle` (the zero line `--border-strong`), with labels 12px `--text-3` in a 40px left gutter. Date labels sit under the chart, the first aligned left and the last aligned right. The latest point is a 4px ring (`--surface-2` fill, 2px `--text-1` stroke) on a 9px halo of `--text-1` at 8%.
- **Table view:** see section 14.
- **Hover readout (both charts):** a 1px `--border-strong` crosshair and the point's ring, plus a small popover (layer 3, 8px radius, padding `8px 12px`): first line 12px `--text-3` (date and pair, or the day), second line 14/500 (running total, then the trade's result in profit or loss). Bars: the hovered bar stays full, the others fade to 30% over `--d-fast`. The readout sits in a reserved strip above the bars so it never covers one. On touch, tap shows the same readout.
- **Bars** (R by day or week) use `--profit` or `--loss`, 50% of the slot wide up to 14px, radius `3px` at the value end and `1px` at the baseline, on a 1px `--border-strong` baseline, with 12px `--text-3` day labels.
- **Sparklines** are a `1.6px` `--text-1` line with a dashed zero line, and no axes.
- **Breakdown bars** (by setup, by session) sit on a track that is `--surface-inset`, 8px tall, with `--r-xs`, diverging from the centre for R.
- **Category colour is not used.** If a chart ever needs several series, they use lightness steps of `--text-1` before any hue.
- A chart's tooltip is a popover (layer 3) and shows its numbers in tabular figures.

The dashboard's layout (how much weight each card gets) is still to be revisited from new references; the chart rules above hold either way.

---

## 14. Accessibility

- Text contrast is at least 4.5:1 on every surface in both themes, including `--text-3`. The values in section 4 were checked.
- **Focus** is always visible as the 2px ring with a 2px gap. It's never removed, and only shows for keyboard focus (`:focus-visible`).
- **Blur** is decorative, with a solid fallback (section 7). The same goes for motion (section 12).
- Hit areas follow section 8. Nothing clickable is smaller than 24 × 24px (WCAG 2.2 target size); icon buttons are 32 × 32px, including chart menus under thumbnails. The × inside a tag pill is 24 × 24px. Text links standing alone (Open playbook, a pair name in a row) are exempt by spacing, but keep at least 24px between them.
- **Skip link:** the first focusable element on every page is "Skip to main content", hidden until focused, in the inverse colours at the top left. It moves focus to the main card (`id="main"`, `tabindex="-1"`).
- **Fields are labelled in code:** every visible field label is a `<label for>` tied to its input. Login uses `autocomplete="username"` and the investor password `autocomplete="current-password"`, so password managers and paste work.
- **Charts have a table view:** each dashboard chart has a quiet "View as table" button in its header that swaps the chart for its numbers (each trade with result and running total; each day or week with trades and result), and "Show chart" swaps back. This is the keyboard and screen-reader route to exact values. Readouts also show on tap on touch screens. In the build, chart points are reachable with the arrow keys once the chart has focus.
- **Text on a selected or pressed background** (a selected week, a ticked menu row) steps tertiary text up to `--text-2`, because `--text-3` drops below 4.5:1 on `--surface-pressed`.
- **Destructive text keeps its colour** in every button style: a quiet button with `--loss` text never falls back to grey.
- Icon-only buttons have a label, and the tooltip shows the same text.
- Colour never carries meaning alone: signs on results, the check on selected options, words beside status icons.

---

## 15. Implementation notes for Claude Code

- Tokens live in one place: `src/styles/tokens.css` (CSS custom properties). Light is on `:root`; dark overrides it on `[data-theme="dark"]` on `<html>`. Resolve the theme from Settings (System, Light, Dark); System reads `prefers-color-scheme` and falls back to light. Set the attribute before first paint so the page never flashes the wrong theme. If charts or JS need values, mirror them in `tokens.ts`. Components never use raw hex values.
- If the stack uses Tailwind, map the tokens into the theme (`colors.surface.1: 'var(--surface-1)'`, `height.control: 'var(--h-md)'` and so on) rather than using Tailwind's palette and spacing defaults.
- Build the primitives first, then the screens: `Button`, `IconButton`, `SegmentedControl`, `Menu` (action and choice variants, with submenu), `Popover`, `Dialog` and `Sheet`, `Toast`, `Input` and `TextArea`, `TagField`, `Card`, `StatGroup`, `Notice`, `StatusLine`, `ChartFrame`, `Skeleton`, `Medallion`, `SidebarNav`, `AccountPicker`. Every screen is made only from these. Text tones come from three utility classes or components (`text-primary`, `text-secondary`, `text-tertiary`), never ad hoc colours.
- Use a headless accessibility layer for menus, popovers, dialogs and comboboxes (for example Radix UI primitives) and style it with these tokens. This brings keyboard behaviour and focus handling for free.
- Icons: `lucide-react`, with `size={16}` and `strokeWidth={1.8}` as the defaults set once in a wrapper. The more icon is `MoreHorizontal`.
- Motion: Motion (Framer Motion) for layout and FLIP animations, springs and sheets. Plain CSS transitions for hover, press and colour. The duration and easing tokens are shared by both.
- **Font:** self-host Inter's variable font (for example `@fontsource-variable/inter`, or `next/font` with Inter if the stack is Next.js) with the `opsz` axis, not a CDN. Preload the latin subset. Set `font-feature-settings` only once, on the root.
- The canvas's generated styles (in its frames' `<helmet>`) are a working reference for these tokens, including the button, card, menu, segmented, stat group, notice and sidebar rules.

A starting `tokens.css`:

```css
:root, [data-theme="light"] {
  --bg-app: #F2F2F4;
  --bg-app-glow: radial-gradient(1200px 600px at 12% -10%, rgba(255,255,255,0.9), transparent 60%);
  --surface-1: #FFFFFF; --surface-2: #FFFFFF; --surface-3: #FFFFFF; --surface-inset: #F6F6F8;
  --surface-hover: rgba(15,17,21,0.04); --surface-pressed: rgba(15,17,21,0.07);
  --border-subtle: rgba(15,17,21,0.06); --border: rgba(15,17,21,0.10); --border-strong: rgba(15,17,21,0.16);
  --highlight: rgba(255,255,255,0.9); --highlight-strong: #FFFFFF;
  --text-1: #141519; --text-2: #4A4E56; --text-3: #6B6F77; --text-disabled: #A2A6AE;
  --profit: #1D63D6; --loss: #C2410C; --attention: #8F5A06; --voice: #6D4FD8; --focus: #141519;
  --inverse-bg: #18191D; --inverse-fg: #FFFFFF;
  --shadow-card: 0 0 0 1px rgba(15,17,21,0.08), 0 1px 2px rgba(15,17,21,0.04);
  --shadow-float: 0 0 0 1px rgba(15,17,21,0.06), 0 4px 10px -4px rgba(15,17,21,0.08), 0 18px 44px -12px rgba(15,17,21,0.20);
  --shadow-dialog: 0 0 0 1px rgba(15,17,21,0.06), 0 24px 64px -16px rgba(15,17,21,0.28);
  --scrim: rgba(242,242,244,0.55);
  color-scheme: light;
}
[data-theme="dark"] {
  --bg-app: #0B0C0E;
  --bg-app-glow: radial-gradient(1200px 600px at 12% -10%, rgba(120,140,170,0.10), transparent 60%);
  --surface-1: #121418; --surface-2: #181B20; --surface-3: #1E2127; --surface-inset: #0E1013;
  --surface-hover: rgba(255,255,255,0.05); --surface-pressed: rgba(255,255,255,0.08);
  --border-subtle: rgba(255,255,255,0.06); --border: rgba(255,255,255,0.09); --border-strong: rgba(255,255,255,0.14);
  --highlight: rgba(255,255,255,0.06); --highlight-strong: rgba(255,255,255,0.12);
  --text-1: #ECEEF1; --text-2: #B0B6C0; --text-3: #828995; --text-disabled: #5F6672;
  --profit: #5BA2FF; --loss: #FF9A4D; --attention: #E8C766; --voice: #B9A6FF; --focus: #ECEEF1;
  --inverse-bg: #ECEEF1; --inverse-fg: #0E1014;
  --shadow-card: inset 0 1px 0 rgba(255,255,255,0.05);
  --shadow-float: 0 0 0 1px rgba(255,255,255,0.08), 0 4px 8px -2px rgba(0,0,0,0.45), 0 16px 40px -8px rgba(0,0,0,0.65);
  --shadow-dialog: 0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px -12px rgba(0,0,0,0.7);
  --scrim: rgba(8,9,11,0.45);
  color-scheme: dark;
}
:root {
  --r-xs: 6px; --r-sm: 6px; --r-md: 8px; --r-card: 12px; --r-menu: 12px; --r-panel: 14px; --r-dialog: 16px; --r-full: 999px;
  --h-sm: 28px; --h-md: 32px; --h-lg: 36px; --h-row: 34px;
  --d-instant: 80ms; --d-fast: 140ms; --d-base: 220ms; --d-slow: 320ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1); --ease-in: cubic-bezier(0.4, 0, 1, 1); --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --font-sans: "Inter Variable", "Inter", system-ui, sans-serif;
}
html { font-family: var(--font-sans); font-optical-sizing: auto; }
@media (prefers-reduced-motion: reduce) {
  :root { --d-fast: 100ms; --d-base: 120ms; --d-slow: 120ms; }
}
```

---

## 16. From the old canvas palette to the tokens

The canvas was first drawn in a flat dark palette set in Geist, with 40px controls. Every frame has since been converted with this mapping, which also helps when reading older notes or screenshots:

| Old value | Became |
|---|---|
| Geist | Inter |
| `#0E1014` page background | `--bg-app`, with content moved into a `--surface-1` main card |
| `#15181E` panels (Details, Notes, takeaway) | `--surface-2` cards |
| `#1B1F27` row lines and card borders | `--border-subtle` |
| `#252A33` panel borders | Removed in favour of elevation |
| `#353B46` control borders | `--border` |
| `#ECEEF1` / `#A3AAB5` / `#8C939F` text | `--text-1` / `--text-2` / `--text-3` |
| `#ECEEF1` filled buttons | Primary (glossy) |
| `.btn-g` outlined buttons | Secondary |
| `.btn-q` quiet buttons | Ghost |
| `#5BA2FF` / `#FF9A4D` | `--profit` / `--loss` |
| `#B9A6FF` | `--voice` |
| Menus (`#15181E` with a border) | Layer 3 with `--shadow-float` and the motion spec |
| 40px controls, 10px radius | 32px controls, 8px radius |
| 30px titles, 26 to 28px stat numbers | 24px |
| Five separate stat tiles | One stat group card with dividers |
| "···" text glyph | The more icon |
| Blue status dots for MT5 | Grey link icon |

---

## 17. Don'ts

- No blue primary buttons (blue is profit), and no coloured buttons except the voice action.
- No coloured dots for status that isn't a result or a "needs a look". MT5 connected is a grey icon.
- No coloured tags, category colours or rainbow charts.
- No heavy borders around cards. Use elevation: the ring and soft shadow in light, the gradient hairline in dark.
- No glows, neon, gradient text, or gradient washes behind content.
- No blur anywhere except the dialog scrim.
- No second typeface. Inter only.
- No bold for emphasis below 24px. Use 500, or colour for results.
- No text tones outside the three, and no greys picked by eye.
- No icons on headings, labels or body text, and no text glyphs standing in for icons.
- No inverse (black) fill on a selected segment or tab.
- No bounce, overshoot, or animation that loops on its own (except the recording dot and loading).
- No full-screen loaders or confirm dialogs.
- No emoji in the interface.
- No raw hex values in components.
- No recolouring of chart screenshots for the theme.
