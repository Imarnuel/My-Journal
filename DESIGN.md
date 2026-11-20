# Design rules from the owner

Corrections the owner made after the handoff. They win over `handoff/docs/02-look-and-feel.md` where the
two disagree. Each rule says why, so it can be applied to places the owner didn't point at.

## Icons
- **Story Details labels have icons**: Setup (book), Tags (tag), Plan (clipboard with a check), Headspace
  (face), before the label, 8px gap. Why: the labels are scanned, and an icon makes each row findable at a
  glance. This overrides section 10's "never on field labels" for the story's Details panel.
- **Trade facts read from MT5 have icons**: pair (two arrows), direction (trend down for Short, up for Long),
  status (circle with a check), account (card), date and time (calendar). Facts sit 16px apart with no "·"
  separators, matching the Trade log's facts. The dashed underline marks the words only, not the icon.
- **These icons are filled, 14px, a step lighter than tertiary text (`--text-3` at 72% opacity).** (Was 16px
  at full `--text-3`; the owner asked for smaller and lighter so the labels lead.) Source: `src/screens/story/detailIcons.tsx`. Other
  icons in the app stay as the handoff draws them (stroke icons) unless the owner says otherwise.

## Spacing and alignment
- **Fields line up with their labels and with the cards beside them.** A text field never takes the ghost
  field's negative margin; it is full width with `box-sizing: border-box`, 8px corners.
- **Even rhythm inside a card**: 16px between the parts of a card, 12px from the card header to its first
  part, 8px from a label to its field. A label row only grows to 28px when controls sit beside the label.
- **Inputs inside a tag field start at the same x as the other values** (no field padding).

## Navigation
- **Breadcrumbs replace "‹ Back" links.** Every page below a section shows its trail: each step is a 16px
  icon and its name, separated by a 16px chevron (`--text-3`). Earlier steps are links in `--text-2` that
  turn `--text-1` with a hover fill; the current page is `--text-1` and not a link. Icons are the section's
  sidebar icon, then the item's own (pair, setup, account), or a plus for "new" pages, a pen for editing.
  Component: `src/components/primitives/Breadcrumbs.tsx`. Why: the trail says where you are and every
  level above is one click away, as in the owner's reference (Linear-style).
- **Sidebar rows are roomier**: 36px tall, 4px apart, 16px icons, 10px from icon to label. Why: the
  tighter 32px rows read cramped next to the calm main card.

## Page tops and the story header
- **Breadcrumbs sit 16px above the page title**, not the 32px between page sections: the trail belongs to
  the title. Why: the owner found the top of the page too airy.
- **The story header shows a result only when there is one** (a taken trade). A running, watched or
  not-filled entry already says its status under the title, so the 24px slot stays empty instead of
  repeating it.

## Voice note
- **Re-record is a labelled button** ("Re-record" with the mic), not a bare icon, so it can be found. It
  records a new note and, like the first one, fills only what is still empty.

## Headspace
- **Each headspace has an emoji beside its name**: Calm 😌, Confident 😎, Focused 🧐, Rushed 😬, Tired 😴,
  Frustrated 😤, in the Headspace menu and on the chosen value. The word stays the value and carries the
  meaning; the emoji is decorative (hidden from screen readers). This overrides the handoff's "no emoji in
  the interface" for Headspace only. Source: `HEADSPACE_EMOJI` in `src/lib/story.ts`.

## Trade log entries
- **An entry opens its story from a click anywhere on it**, List row or Grid card, with a hover state:
  rows take the row hover fill, cards lift 1px and strengthen their edge (never scale). The entry's own
  controls (pair link, More menu, Add a note, the drop zone) keep their action, and selecting text opens
  nothing. The pair link stays the keyboard route. Source: `useOpenOnClick` in `src/screens/tradelog/Rows.tsx`.

## Feedback
- **Saving a chart story shows a toast**, "Chart story saved", as the app moves to the saved story.
  Why: the page changes underneath you, and the toast confirms the trade is in the log.

## Segmented controls
- **The selected segment's label is medium (500)**, the same weight as the others; the raised fill alone
  marks the choice. This overrides the handoff's 600 on a selected segment. Why: the owner prefers the calmer
  weight, and the labels no longer change width as the selection moves.

## Dashboard notices (redesigned after Mobbin research)
Both cards at the top of the Dashboard share one anatomy, sit 16px apart (they belong together), and read
as one calm zone before the numbers. Source: `src/screens/dashboard/Notices.tsx`.
- **Leading 32px icon tile** (`--surface-inset`, hairline ring, `--text-2` icon), top-aligned with the title,
  so both cards' text columns line up.
- **No-charts notice**: title (14/500); the trade's facts on their own line (pair, direction chip, result in
  its colour, date and time, account, "from MT5", with `--text-disabled` dots); the instruction under them in
  `--text-3`. On the right, the drop slot drawn where the chart goes (112 × 63, 16:9, dashed `--border-strong`,
  "Add chart"): it is the file picker and the drop target (solid `--text-1` border while a file is over it),
  and paste anywhere still works. Then a quiet "Trade log →" link. References: Oyster task rows, Airwallex
  and WeTransfer drop targets.
- **This week's focus**: a small label (12/500 `--text-2`), the owner's takeaway as the content (16/500
  `--text-1`, curly quotes, 72ch at most), and where it was written as an attribution link under it
  (12px `--text-3`, trailing arrow). References: Open's quote with attribution, Codecademy's small label.
- **Phone**: the text stays beside its tile; the drop slot and link move to the next line.

## Phone fixes found while checking the redesign
- The dashboard's breakdown tables scroll sideways inside their own card on a phone, and chart card grids
  (Recent chart stories, a week's trades) go to two columns, so no page is wider than the screen. The phone
  test now compares with the phone's real width (390px), which is what exposed this.

## This week's focus belongs to the owner
Replaces "the latest review's takeaway". Source: `src/lib/focus.ts`, `Focus` in `src/screens/dashboard/Notices.tsx`.
- **The owner sets, edits or clears it** for the current week, in place on the Dashboard card (pen and ×
  icon buttons; Enter saves, Escape cancels; clearing has Undo). An empty save clears it.
- **If the owner hasn't set one, last week's review takeaway fills it in**, the way a voice note only fills
  empty fields, with "From your review of …" linking to that review. Once edited it reads "Set by you for …".
- **It lasts for its week.** It never falls back to an older takeaway, so a stale rule is never shown as this
  week's. Why: the owner's focus isn't always a lesson from last week, and nothing should pile up.
- **No focus means no card**, only one quiet "Set a focus for this week" line where the card would be.

## No weekly focus on the Dashboard
- **"This week's focus" is removed from the Dashboard** (owner's decision, after trying an owned, editable
  version). The weekly takeaway lives in the Weekly review, where it's written and read back ("The week
  before, you said"). The Dashboard shows what happened; the no-charts notice is the only card above the
  numbers, because it asks for an action. This supersedes the two focus sections above.

## Trade log rows read as facts only
Overrides `01-decisions.md` ("…or a one-line hint for running, watched, not-filled and chart-less entries").
Why: the hint sentences repeated on every entry of the same status, and some repeated a fact ("Open" next
to the pair said what "Running" says). Source: `rowFacts` in `src/lib/tradelog.ts`.
- **Every row has the same shape**: pair, direction chip, result (only when there is one); date, status,
  account; setup, plan, tags (on every entry that has them, running and watched included). Tags stay.
- **The status word carries the meaning; what it means is on hover** (`STATUS_HINT`), and the Status menu
  explains each option. No status sentences in rows.
- **Only things that need the owner get a signal, kept brief**: an MT5 trade without charts shows its ticket
  as a fact ("MT5 #48231") and its drop zone, which says "Drop, paste or choose charts · It still counts".
  The whole drop zone is the file picker.
- **The owner's own words stay**: an analysis entry shows its plan note on one line.
- Grid cards follow the same rules: the result, or the status when there is no result, beside the pair.

## Dashboard charts (restyled after Mobbin research and the dataviz guidance)
Overrides section 13 of `02-look-and-feel.md` for R over time and R by day. Why: the owner found the black
jagged line, the pink drawdown shading and the heavy bars noisy. References: Origin and Quicken (one line,
soft wash), Stripe, Whop and Revolut (labels on the right, recessive guides), Gemini (line coloured by sign).
- **R over time**: a 2px line, `--profit` above zero and `--loss` below it, with a wash of the same colour
  between the line and zero (14% to 0). No drawdown shading or legend (the stat row shows the worst drawdown).
  Solid hairline guides (`--border-subtle`, zero in `--border`), value labels on the right in `--text-3`.
  The latest point is a 4px dot in the line's colour with a 2px surface ring. Still straight segments.
- **R by day / by week**: 10px bars, rounded 4px at the value end and square at the baseline, on a `--border`
  baseline. Hover fades the others, as before.
- The profit/loss pair passes the dataviz validator for colour-blind separation and contrast in both themes.

## Dashboard stat row
- **Each stat label leads with a filled grey 14px icon** in the Details style: Net R (rising bars),
  Expectancy (a balance), Win rate (a trophy), Plan followed (clipboard with a check), Trades taken (a stack).
  Overrides section 10's "never on stat labels". Source: `src/screens/story/detailIcons.tsx`.

## Toasts
Overrides the bottom-centre toast in `02-look-and-feel.md`. Why: the owner wanted it out of the way of the
content, and quicker to read. Source: `Toasts` in `src/app/Shell.tsx`, `src/components/primitives/toast.ts`.
- **Bottom right**, up to 560px wide so messages fit on one line, 24px from the edges (safe areas included). On phones it spans the width, 16px gutters.
  Still one at a time, 6 seconds, Undo on anything destructive or hiding.
- **A 16px icon says what happened** (the action's kind): check (done), trash (deleted), ban (left out),
  rotate (restored), image (charts added), calendar (moved), mic (voice note, in the voice colour),
  archive (archived), pen (renamed or merged).
- **Message rules**: the outcome first, naming the thing it happened to, in past tense, short enough for one
  line. "GBPUSD left out of your stats", "EURUSD trade deleted", "“Supply zone” removed",
  "Moved to Mon 16 Nov, 09:45", "Filled from your note: setup and 3 tags". No "Done", no
  instructions, no em dashes.

## Notes reflection, tidied
Why: the owner found the Suggested pill too big, Keep and Delete nudging, and "What you said" not reading as
a control. Source: the Notes card in `src/screens/ChartStory.tsx`.
- **Suggested** is a small 18px badge (12px text, voice colour on a 10% voice tint) beside the label.
- **Under the field**: "Inferred from your note", then Keep (neutral 28px button with a check) and Delete
  (quiet 28px button in `--loss` with a ×). Green isn't in the palette and blue means profit, so Keep stays
  neutral rather than green.
- **Voice row**: a 28px play circle, the length, "What you said" as a ghost button with a speech icon and a
  chevron that turns when open, and Re-record in the voice colour with a mic, at the far right.
- Labels sit 8px above their fields.

## Trade log rows at 12px
Why: the owner wanted the pair to lead. Every line under the pair (date, status, account, ticket, setup,
plan, tags, plan notes) is 12/16 with 14px icons. The pair, direction chip and result stay at 14px as the
headline line.

## Rounder corners
Overrides the radii in `CLAUDE.md` and `02-look-and-feel.md` (8 on controls, 12 on cards and menus, 14 on
the main card). Why: the owner wanted the whole app a little softer. Every radius now comes from one scale in
`src/styles/tokens.css`, so the next change is one line.
- `--r-xs` 7px: chips and badges (direction, Suggested, Demo).
- `--r-sm` 8px: 28px buttons, the selected segment, the focus ring.
- `--r-md` 10px: 32px controls (buttons, fields, filter dropdowns, the account picker), sidebar items, menu
  rows, chart thumbnails, tooltips, the drop zone.
- `--r-lg` 12px: segment tracks and inset rows. The selected segment inside is 12 minus the 4px padding.
- `--r-card` and `--r-menu` 16px: cards, notices, menus, toasts. `--r-panel` 18px: the main card.
  `--r-dialog` 20px.
- Toggle tracks are full pills. Circles, dots, progress bars and the chart bars keep their own shapes.

## Chart reordering
Builds on `01-decisions.md` ("Reorder by dragging the whole tile, or each chart's menu") and the drag spring
in `02-look-and-feel.md`. Why: the owner wanted dragging charts to feel better; the browser's own drag gave a
ghost image, no sign of where the tile would land, and didn't work with a finger. Source:
`src/screens/story/useTileReorder.ts`.
- **Shows it can be dragged**: see Chart tiles below. The cursor is a grab hand.
- **Lift**: with a mouse after 6px of movement, with a finger after a 250ms press (so a swipe still
  scrolls). The thumbnail scales to 1.04 with a floating shadow, its ··· fades out, and it follows the
  pointer 1:1 from where it was grabbed. Past the edge of the grid it follows less and less.
- **Make room**: the other tiles slide to where they'll be (`--d-base`, `--ease-standard`), so the gap shows
  where it will land.
- **Drop**: it settles into its slot with the drag spring (stiffness 420, damping 34, no overshoot), carrying
  the release speed, then the order is saved and the moved chart shows large (as Move left/right do).
- **Cancel**: Escape puts it back at once. A click that ends a drag doesn't select the chart; a plain click
  still does. Grabbing a tile while another settles finishes that one first.
- **Reduced motion**: no lift scale and no slide; the tile still follows the pointer and the order changes on
  release.
- **Keyboard**: focus a tile's grip and press ← or → to move it one place; focus follows it (the same as the
  arrow keys on setup rule grips). Nothing animates.

## Chart tiles
Why: the owner didn't want a row under every thumbnail just for the ··· menu, or icons in white containers.
Overrides `01-decisions.md` ("…or each chart's menu: Move left, Move right, Remove"): there is no chart menu
any more, and state 19 (a chart's menu open) is retired.
- **Controls sit on the image**: on hover, a black wash (`--media-scrim`, fading out by 70% of the height)
  fades in from the top of the thumbnail, with the grip top left and a trash top right as white icons
  (`--on-media`) in 24px targets. Both themes use the same wash and white.
- **Trash removes the chart at once** with "Chart removed" and Undo. The last remaining chart has no trash
  (a story keeps at least one chart). Reordering is by drag, or the arrow keys on the grip.
- The wash and controls also show when a control in the tile has keyboard focus. While a tile is dragged,
  only its grip shows; the other tiles show nothing.
- **Touch has no hover**, so the wash and trash are always shown there; there's no grip (press and hold to
  drag).
- The hint under the tiles reads "Drag to reorder."
- **The caption under a thumbnail only appears when there is one** (the timeframe on sample charts), so
  uploaded charts take no extra row.

## Tag menu without counts
Why: in the story's tag menu "used 18 times" was reading with nothing to act on, and it made long tag names
wrap. The menu still lists the most used tags first. The counts stay in Settings > Your tags, where they help
decide what to rename, merge or remove.

## Typeface: Geist
Overrides Inter in `CLAUDE.md` and `02-look-and-feel.md`. Why: the owner's choice. Geist Variable, self-hosted
from `@fontsource-variable/geist` (latin and latin-ext), set once in `--font-sans`; nothing names a font
directly. Sizes, weights, line heights and tracking are unchanged; tabular figures stay on (Geist has them).

## Edit numbers has a pen
On a trade's story, "Edit numbers" leads with the 16px `pen-line` icon used for Rename and Edit rules, so it
reads as an action. While the numbers are open the button says "Done" without an icon.

## Editing numbers
Overrides `01-decisions.md` ("…with 'Edit numbers', which opens six live inputs") in how it opens and what
the result does. Why: the owner wanted a better experience; the numbers showed twice, there were two "Done"
buttons, the fields didn't look like fields and the result had to be typed although the prices give it.
Same on New chart story and the chart story page. Source: `ChartStory.tsx`, `rFromPrices` in `src/lib/story.ts`.
- **The line is the editor**: "Edit numbers" (or clicking any number in the line, which has the facts'
  dashed underline) swaps the line for six fields in the same place, with that field focused and its value
  selected. Nothing shows twice.
- **Fields look like fields**: bordered and inset like the note fields, 32px, labels 4px above. Prices get
  the number keypad on phones.
- **The result works itself out**: (exit − entry) / (entry − stop), the same sum for a long and a short,
  whenever you edit entry, stop or exit, and "Result from entry, stop and exit" says so. Typing a result
  keeps yours (prices then leave it alone); clearing it hands it back to the prices. Opening a story never
  changes a result; MT5 results only change when you edit a price.
- **Keyboard**: Enter moves to the next field; Enter on Result, or Escape, closes and puts focus back on
  "Edit numbers". Changes save as you type.
- **One meaning per word**: the fields close with "Close"; "Done" only means leaving the story.
