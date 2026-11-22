# Design rules from the owner

Corrections the owner made after the handoff. They win over `handoff/docs/02-look-and-feel.md` where the
two disagree. Each rule says why, so it can be applied to places the owner didn't point at.

## Principles (every screen)
General rules behind the owner's corrections. Apply them to every screen, including ones the owner hasn't
looked at yet; the sections below are the specific cases they came from. A reason marked *inferred* was
written by Claude from the corrections, not said by the owner: if the owner later gives a different
reason, replace it.

- **Every line of text leads to an action or a decision.** Never add hints, counts, captions or
  explanations that repeat what's already shown. Put supporting detail where it's acted on (tag counts live
  in Settings › Your tags, not in the tag menu).
  Why (*inferred*): extra text is something to read with nothing to do, and on a calm screen it reads as clutter.
  <!-- 2026-11-19/20: "If it's something that requires users' action, let us look for a brief way to communicate it" · "of what use is 'used 18 times'" · "remove this week focus on the dashboard" -->
- **Values you can change show as values and edit in place.** They carry the dashed underline and become an
  input on click, never behind an "Edit" button, a separate form or a mode. Enter keeps, Escape puts back,
  and nothing else on the screen moves while one is edited.
  Why: the owner wants to see the value as it is and change it where it is.
  <!-- 2026-11-20: "display as they used to display, but they become an editable input on click… instead of having 'edit numbers' as an action" -->
- **Actions on an image sit on the image.** Chart thumbnails and screenshots show their controls as white
  icons (`--on-media`) on the `--media-scrim` gradient, on hover or focus and always on touch. Never a row
  under the image just for controls, and never icons inside chip containers on an image.
  Why: a row under every picture wastes space and repeats.
  <!-- 2026-11-20: "why can't we just have it over the image thumbnail… a white icon that overlays on the image… a black overlay" -->
- **Anything you can act on looks like it.** A grip for draggable, a pen for edit, a chevron for expand, the
  dashed underline for an editable value, a trailing arrow for a link to another page. Never rely on finding
  it by trying.
  Why: "so the user knows" it can be used.
  <!-- 2026-11-19/20: "add the drag icon on hover so the user knows its draggable" · "'What you said' doesn't look interactive" · "add edit icon beside Edit numbers" -->
- **Values that pair across lines line up in a grid.** Label and value sets, numbers and facts that repeat
  over two or more lines sit in columns, never wrapped freely. A label sits 8px from what it labels.
  Why (*inferred*): aligned columns can be compared at a glance; ragged ones have to be read one by one.
  <!-- 2026-11-20: "align the entry with the exit, stop with the size, and target with the R" · earlier: "label far from input" -->
- **In rows and cards only the headline is 14px.** The identifying line (pair, direction chip, result) is
  14px; supporting facts, badges and meta are 12px, and their icons are lighter than their text. Applies to
  every list row and card (trade log, playbook, weekly review, recent chart stories).
  Why (*inferred*): the eye should land on what the item is, then the details.
  <!-- 2026-11-19: "every other text asides the pair needs to use a font size of 12px" · "Suggested pill too big" · "icons… smaller and a bit lighter" -->
- **The preview shows every feature filled in and believable.** When the sample data lacks a field, add a
  realistic stand-in that agrees with the data around it (as sample prices give each trade's recorded R),
  and record it here.
  Why (*inferred*): the owner judges the design from the preview, and an empty field there hides what it will look like.
  <!-- 2026-11-20: "I can't see the numbers prefilled" → "1. do that" -->
- **Checked automatically:** `src/styles/taste.test.ts` fails on an em dash in app text, a hard-coded control
  or card radius (use the `--r-*` tokens), or a typeface named directly (use `var(--font-sans)`).

## Icons
- **Story Details labels have icons**: Setup (book), Tags (tag), Plan (clipboard with a check), Headspace
  (face), before the label, 8px gap. Why: the labels are scanned, and an icon makes each row findable at a
  glance. This overrides section 10's "never on field labels" for the story's Details panel.
- **Trade facts read from MT5 have icons**: pair (two arrows), direction (trend down for Short, up for Long, a
  level line while it's empty), status (circle with a check), account (card), date and time (calendar). Pair and
  direction are knocked out of a filled circle like status, so every icon on the line has the same weight (first
  ui-polish audit, 2026-11-22: the bare arrows read as outline icons beside the filled ones). Facts sit 16px apart with no "·"
  separators, matching the Trade log's facts. The dashed underline marks the words only, not the icon. A fact not
  set yet shows its name ("Pair", "Direction", "Account") in `--text-3`, like every empty field's placeholder, so
  what is set reads first (the owner, 2026-11-22: "grey a bit the options that have not been selected").
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
- **When a note can't be made out, the card offers only "Record again".** No "Type instead": the two note
  boxes (Before / during, Reflection) sit right below it and can always be typed in. Why: the owner pointed out
  the typing boxes are already there, so the button repeated them (open question 10, 2026-11-20).

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
The no-charts notice is the only card above the numbers (see "No weekly focus on the Dashboard" below).
Source: `src/screens/dashboard/Notices.tsx`.
- **Leading 32px icon tile** (`--surface-inset`, hairline ring, `--text-2` icon), top-aligned with the title.
- **No-charts notice**: title (14/500); the trade's facts on their own line (pair, direction chip, result in
  its colour, date and time, account, "from MT5", with `--text-disabled` dots); the instruction under them in
  `--text-3`. On the right, the drop slot drawn where the chart goes (112 × 63, 16:9, dashed `--border-strong`,
  "Add chart"): it is the file picker and the drop target (solid `--text-1` border while a file is over it),
  and paste anywhere still works. Then a quiet "Trade log →" link. References: Oyster task rows, Airwallex
  and WeTransfer drop targets.
- **Phone**: the text stays beside its tile; the drop slot and link move to the next line.

## Phone fixes found while checking the redesign
- The dashboard's breakdown tables scroll sideways inside their own card on a phone, and chart card grids
  (Recent chart stories, a week's trades) go to two columns, so no page is wider than the screen. The phone
  test now compares with the phone's real width (390px), which is what exposed this.

## No weekly focus on the Dashboard
- **"This week's focus" is removed from the Dashboard** (owner's decision, after trying an owned, editable
  version). The weekly takeaway lives in the Weekly review, where it's written and read back ("The week
  before, you said"). The Dashboard shows what happened; the no-charts notice is the only card above the
  numbers, because it asks for an action.
- What was tried first, so it isn't proposed again: a focus card on the Dashboard showing last week's review
  takeaway, then a version the owner could set, edit and clear for the week. Both were removed.

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

## Dashboard period
Overrides the segmented period control in `02-look-and-feel.md` and the Dashboard frame. Why: the owner asked
for a dropdown like the Trade log's Date filter (2026-11-21); it also replaces the "Show 3 months" button,
because the counts already show which period has trades. Source: `Header` in `src/screens/dashboard/Header.tsx`.
- **The period is a dropdown** (the Trade log filter's component): calendar icon, the chosen period on the
  button ("This month"), and This week, This month, 3 months with the number of trades each holds in the
  ticked accounts. A period with none is dimmed, not hidden. Keyboard and pointer as every menu; a period
  picked from the keyboard swaps the numbers at once (no count-up).
- **"Your numbers start after 5 trades" keeps only New chart story**; no "Show this month" or "Show 3
  months" button.
- The motion checks for the sliding segment thumb now use the chart story's Plan control.

## Dashboard with few trades
Overrides frame 16's "Dashboard · fewer than 5 trades" card and `01-decisions.md` ("…the numbers give way to
'Too few trades to read yet'"). Why: the owner didn't want the "Your numbers start after 5 trades" card
(2026-11-21) and chose to see the numbers as far as they go. Source: `src/screens/Dashboard.tsx`, `StatRow`.
- **The numbers always show.** Net R, Plan followed and Trades taken count from the first trade; Expectancy
  and Win rate read "–" in `--text-3` with "Too few to rate" under them until the period has 5 trades (the
  small-samples rule still holds for rates, here and in the breakdown tables). The charts and tables show
  what there is.
- **No trades in the period: only the counts.** Charts and tables are left out rather than drawn empty.
- **R by day / week: one day has no separate worst**, and best and worst take the colour of their sign.

## Field shadow
Why: the owner asked for "very subtle" drop shadows on text inputs and dropdowns, "like it's done in modern
designs" (2026-11-21): fields sit a hair above the page. One token, `--shadow-field` (`src/styles/tokens.css`):
light `0 1px 2px rgba(15,17,21,0.05)`, dark `0 1px 2px rgba(0,0,0,0.28)`.
- **Every boxed text field** (the inset fields: names, login and server, dates and times, the note boxes, the
  takeaway, dialog name fields) and **every dropdown button** (Trade log filters and sort, the Dashboard
  period; the account picker and the Settings and Accounts menus already had the secondary button's soft
  shadow). One rule in `src/styles/globals.css`; dropdown buttons opt in with `kfield`.
- **Edit-in-place values stay flat**: the story's facts and numbers, ghost rows, the tag input. They show as
  values, not boxes (Principles).

## Dashboard stat row
- **Each stat label leads with a filled grey 14px icon** in the Details style: Net R (rising bars),
  Expectancy (a balance), Win rate (a trophy), Plan followed (clipboard with a check), Trades taken (a stack).
  Overrides section 10's "never on stat labels". Source: `src/screens/story/detailIcons.tsx`.

## Toasts
Overrides the bottom-centre toast in `02-look-and-feel.md`. Why: the owner wanted it out of the way of the
content, and quicker to read. Source: `Toasts` in `src/app/Shell.tsx`, `src/components/primitives/toast.ts`.
- **Bottom right**, up to 560px wide so messages fit on one line, 24px from the edges (safe areas included). On phones it spans the width, 16px gutters.
  Still one at a time, 6 seconds, Undo on anything destructive or hiding.
- **Success or notification** (the owner, 2026-11-22, "rework our toast notification… sleek and modern"; replaces
  one icon per kind). A success (saved, added, moved, restored, archived, renamed or merged, counted, filled from
  your note or chart) leads with a **filled 16px check**: a circle in the toast's text colour with the tick cut
  out in the toast's own colour. A notification (deleted, removed, hidden, left out) has **no icon**.
- **Two variants**: with an action, a **ghost Undo** (no outline; a 12% fill on hover, presses in to 0.97) in
  the corner with 8px of padding round it; and without one, 12px by 16px. Both are 48px tall. Icon to text 8px,
  text to Undo 12px.
- **Motion** (transitions, so a toast that comes back mid-exit turns round instead of restarting): it rises from
  below the screen edge in 400ms on a drawer curve (`--d-toast`, `--ease-toast`; toasts are occasional, the
  documented exception to the 300ms rule) and goes back down faster (220ms, ease-out). The check's tick draws in
  as the toast lands. A toast that replaces another keeps its place and cross-fades its content through a 2px
  blur. Reduced motion: fades only, 120ms.
- **The 6 seconds pause** while the pointer or keyboard focus is on the toast and while the tab is hidden; after
  a pause it stays at least 1.5 seconds more. So an Undo is never lost while it is being reached for.
- **Message rules**: the outcome first, naming the thing it happened to, in past tense, short enough for one
  line. "GBPUSD left out of your stats", "EURUSD trade deleted", "“Supply zone” removed",
  "Moved to Mon 16 Nov, 09:45", "Setup and 3 tags filled from your note". No "Done", no
  instructions, no em dashes, **no colons**: what was filled leads the sentence (the owner, 2026-11-22: "why is
  the toast microcopy carrying a colon?"; was "Filled from your note: setup and 3 tags").

## Notes reflection, tidied
Why: the owner found the Suggested pill too big, Keep and Delete nudging, and "What you said" not reading as
a control. Source: the Notes card in `src/screens/ChartStory.tsx`.
- **Suggested** is a 22px badge like every chip (12px text, voice colour on a 10% voice tint) beside the label
  (18px until the first ui-polish audit).
- **Under the field**: "Inferred from your note", then Keep (neutral 28px button with a check) and Delete
  (quiet 28px button in `--loss` with a ×). Green isn't in the palette and blue means profit, so Keep stays
  neutral rather than green.
- **Voice row**: a 28px play circle, the length, "What you said" as a ghost button with a speech icon and a
  chevron that turns when open, and Re-record in the voice colour with a mic, at the far right.
- Labels sit 8px above their fields.
- **Sizes** (the owner, 2026-11-22, on the Notes card): "Talk it through" at 14px (500), its line under it
  ("Why you took it and how it went…") at 12px, and the field labels "Before / during" and "Reflection" at 14px
  (500, `--text-2`). Were 16, 14 and 12.

## Plus is a circled plus; buttons tighter on the icon side
The owner, 2026-11-22: "change the plus icon to the plus that has a circle … here and also for every other place
it exists", then "reduce the padding just a bit, the horizontal padding". Every plus (New chart story, Add
account, New setup, + New setup in the Setup menu, the Add chart tile, Your own type, the "New …" breadcrumbs) is
Lucide's circle-plus at stroke 1.8. A button with an icon has 8px on the icon's side and 12px on the text's (the
icon's own whitespace evens it out); buttons without an icon keep 12px.

## List rows on hover
The owner, 2026-11-22: "The hover state should have rounded corners. also borders should disappear on hover."
Trade log and Accounts rows (`.krow`): the hover fill is a rounded tile (`--r-lg`) and the dividers above and below
the hovered row turn transparent, so it reads as one lifted row, not a band between two lines. Pointer devices
only. Also: a trade with no account no longer shows the account icon on its own.

## Trade log rows at 12px
Why: the owner wanted the pair to lead. Every line under the pair (date, status, account, ticket, setup,
plan, tags, plan notes) is 12/16 with 14px icons. The pair, direction chip and result stay at 14px as the
headline line.

## Corners: the rounder scale, with continuous (Apple-style) smoothing
Overrides the radii in `02-look-and-feel.md` (8 on controls, 12 on cards and menus, 14 on the main card). Why:
the owner wanted the whole app a little softer (2026-11-19), then asked for "continuous rounded
corner/smoothing like apple" on the same sizes (2026-11-22: "you were only supposed to apply the smoothing").
A revert to the handoff's sizes in between was a misreading and is undone. Every radius comes from one scale
in `src/styles/tokens.css`, so the next change is one line.
- `--r-xs` 7px: chips and badges (direction, Suggested, Demo).
- `--r-sm` 8px: 28px buttons, the selected segment, the focus ring.
- `--r-md` 10px: 32px controls (buttons, fields, filter dropdowns, the account picker), sidebar items, menu
  rows, chart thumbnails, tooltips, the drop zone.
- `--r-lg` 12px: segment tracks and inset rows. The selected segment inside is 12 minus the 4px padding.
- `--r-card` and `--r-menu` 16px: cards, notices, menus, toasts. `--r-panel` 18px: the main card.
  `--r-dialog` 20px.
- **Continuous corners**: every corner on the scale is drawn with Apple's continuous curve (`corner-shape:
  squircle`) at these sizes, where the browser supports it (Chrome, Edge, Android); elsewhere it stays a round
  corner of the same size. Stylesheet rules set it next to their `border-radius`, and one rule in `globals.css`
  covers inline styles that use a scale token (`src/styles/taste.test.ts` checks both).
- Toggle tracks are full pills; circles, dots, progress bars and the chart bars keep their own shapes and
  stay perfectly round.

## Chart viewer
The owner, 2026-11-22: "I should be able to open the image on click". Source: `src/screens/story/ChartViewer.tsx`.
- **Click the story's large chart** (new or saved story; the cursor shows a zoom-in) and it opens full screen,
  fitted to the window over a backdrop that dims and blurs the page (`--viewer-bg` at 56% black with a 16px blur,
  both themes; the owner: "a less dark overlay, but with background blur", was 88% black), with "2 of 5" under it
  when there are several.
- **← → or the side buttons** move between charts (they wrap round), and the large chart on the page follows.
  **Escape, the close button or a click outside the chart** closes; focus goes back to the chart. The page under
  it doesn't scroll.
- Buttons are 32px, white on a 10% white fill, like the chart tiles' controls. No new visible words.
- Motion: it opens like a dialog (fade, the chart from 0.96, `--d-base`, `--ease-out`) except from the keyboard;
  moving between charts and closing don't animate. Reduced motion: a 120ms fade.

## Motion, round 2 (2026-11-22)
The owner: "build the 5 animation suggestions" (from the find-animation-opportunities sweep), and "an animation
while loading images, and not just the image suddenly appearing". One-shot entrances on transform and opacity with
`--ease-out`; none from the keyboard; reduced motion keeps fades only (120ms). Styles at the end of `globals.css`.
- **Notes card states** (Talk it through, recording, reading, a problem, the voice row) arrive with a 4px rise in
  `--d-base`, once the page is in (not on first paint: the page has its own entrance).
- **Disclosures** (archived accounts and setups, a past month in Weekly review, Manage tags, What you said):
  what they reveal comes down 4px in 180ms; closing is instant.
- **Show older entries**: the rows it adds rise 8px together in 240ms, as one block, no stagger. Filters and sort
  never animate the list.
- **Buttons press in** to 0.97 (`--d-fast`), replacing the handoff's half-pixel nudge.
- **Start**: a done step's badge settles in from 0.9 and its tick draws (first run, the delight budget).
- **Images fade in** from an 8px blur over `--d-slow` when they finish loading; their chart frame pulses softly
  while they load. Images already loaded show at once (`src/app/useImageFade.ts`).
- Removed: the old toast exit rule (`.kstatus.leaving`, an ease-in drop) the reworked toast no longer uses.

## Chart reordering
Builds on `01-decisions.md` ("Reorder by dragging the whole tile, or each chart's menu") and the drag spring
in `02-look-and-feel.md`. Why: the owner wanted dragging charts to feel better; the browser's own drag gave a
ghost image, no sign of where the tile would land, and didn't work with a finger. Source:
`src/screens/story/useTileReorder.ts`.
- **Shows it can be dragged**: see Chart tiles below. The cursor is a grab hand.
- **Lift**: with a mouse after 6px of movement, with a finger after a 250ms press (so a swipe still
  scrolls). The thumbnail scales to 1.04 with a floating shadow, its trash hides (only the grip shows), and it
  follows the pointer 1:1 from where it was grabbed. Past the edge of the grid it follows less and less.
- **Make room**: the other tiles slide to where they'll be (`--d-base`, `--ease-standard`), so the gap shows
  where it will land.
- **Drop**: it settles into its slot with the drag spring (stiffness 420, damping 34, no overshoot), carrying
  the release speed, then the order is saved and the moved chart shows large (as moving it with the arrow keys does).
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
- **Trash removes the chart at once** with "Chart removed" and Undo, **the last chart too** (2026-11-21, the
  owner: "i should be able to delete a single chart i just uploaded"; this replaces "a story keeps at least
  one chart"). With no charts left, the drop area returns, as on a story without charts ("Drop, paste or
  choose charts"; an MT5 trade keeps "Scroll back on your chart and take one now. It still counts."). Reordering is by drag, or the arrow keys on the grip.
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

## Mistakes: their own field, and starter tags and mistakes
Overrides `01-decisions.md` › Tags ("One Tags field covers quality, mistakes and context", "Adding a brand-new tag
asks this once") and takes "separate … Mistakes fields" off its declined list. The owner, 2026-11-22: "preload some
items in the tags section … a starting point"; choosing a tag's kind was "too much admin work"; "we should separate
tags from mistakes … Let mistake be another entry. Let tags be its own entry"; "yes, build it". Why: a tag that
could be good, a mistake or context made people classify it; two fields need no classifying at all.
- **Two fields on the story**: Details has **Tags** then **Mistakes** (a filled warning-triangle icon), each a
  chip field that works the same: × on every chip with Undo, typing suggests what was used before in that field
  only (most used first), Enter adds the first match or a new one at once (no question), Backspace on an empty
  field removes the last chip. Empty hints: "Add a tag", "Add a mistake"; new ones: "Add “x” as a new tag" /
  "… as a new mistake"; toasts "“x” added as a new tag" / "… mistake". Nothing prompts you to fill Mistakes.
- **One click picks** (the owner, 2026-11-22: "I have to click twice sometimes to select"): pressing an option keeps
  the cursor in the field, so the field never shrinks under the pointer and moves the list; a click anywhere on
  the field opens its list, even when the cursor is already there.
- **Voice notes fill both**: what the note calls a mistake goes to Mistakes, the rest to Tags; the toast counts
  them apart ("Setup, 1 tag, 1 mistake, plan and headspace filled from your note").
- **Trade log**: a row shows its mistakes on their own facts line with the triangle icon; a **Mistakes** filter
  ("Any mistake") sits after Tags. **Dashboard and Weekly review** read the Mistakes field directly (Costliest
  mistakes, repeated mistakes): the same numbers.
- **Settings › Your tags**: "Tags (n)" (Every tag is a filter.) and "Mistakes (n)" (Counts in costliest
  mistakes); Manage tags lists the tags, then the mistakes, each with use count, rename, merge and remove. No
  kinds shown anywhere.
- **Starter items** (a new real journal; an existing one gets those it lacks, its own untouched): tags Retest,
  Waited for confirmation, Let it run, Break of structure, Liquidity sweep, News; mistakes Chased entry, Moved
  stop, FOMO, Revenge trade, Overtraded, Exited early. Source: `src/lib/tagKind.ts`.
- **Your data**: store version 5 moves each entry's mistake tags into its Mistakes (the sample data too); the
  vocabulary keeps mistakes apart by kind, which nobody sees or chooses.
- Wording left from the handoff that still says "tag" for mistakes, for the owner to confirm: Weekly review
  "Mistakes you tagged more than once"; Dashboard "R from trades with each mistake tag" and "A trade with two tags
  counts under both. … had no mistake tagged."

## Typeface: Instrument Serif for page titles, Inter for everything else
Overrides `02-look-and-feel.md`'s Inter-only rule for page titles, and the earlier Geist and Public Sans. The
owner, 2026-11-22: "Spectra for headings and public sans for others (body, labels)", page titles only; then
"Spectra is ugly, let's use instruments serif"; then "let's go back to inter for the body, label, buttons and the
rest, leaving only the headings, but the tracking shouldn't be as tight as it was in the beginning".
- **Instrument Serif** (400, its only weight), self-hosted from `@fontsource/instrument-serif`, set once in
  `--font-heading`, on the page title of every page (its `h1`: "Trade log", "New chart story", the pair on
  a story), at its natural tracking (0). One rule in `globals.css` sets the face, weight and tracking; page titles
  set none of them inline. Chips and labels inside a title (direction, Textbook example) stay Inter. A smaller
  `h1` that isn't a page title (an "… deleted" state) has `.kplain` and stays Inter. Nothing else is serif:
  section and card titles, numbers and the 24px stat figures stay Inter.
- **Inter** Variable with optical sizes (`opsz`), self-hosted from `@fontsource-variable/inter`, set once in
  `--font-sans`: body, labels, buttons, fields, numbers. Tabular figures stay on.
- **Tracking, by size** (the owner: "the tracking shouldn't be as tight as it was in the beginning", then "inspect
  the tracking … ensure the tracking values are just right"). `--tracking-body` is one formula, calc(0.48px −
  0.025em), worked out from each text's own size: **12px +0.015em** (labels, meta, chips), **14px +0.009em**
  (body, buttons, menus, fields), **16px +0.005em** (section and card titles), all more open than Inter's default
  of 0, smaller text more open for legibility. Every element computes it for itself (a zero-specificity rule in
  `globals.css`): it used to be set once at 14px and inherited as a fixed length, so 12px labels and 16px titles
  got 14px text's spacing, and the same size could get two values. The 24px figures keep `--tracking-figure`
  (−0.01em, from the handoff's −0.025em); page titles (Instrument Serif) keep their natural 0.
  The Dashboard stat cells pad 16px on the left and 12px on the right (were 24 and 24) so "Wins avg +1.8R, losses
  −0.9R" stays on one line in Inter at this tracking.
- **Page titles are 28px** (`--title-size`, line height 32px, so nothing below moves): the narrow display serif
  reads small at 24px (the owner, 2026-11-22: 28px, then "26 is better", then, with Inter for the body, "let's
  increase page title from 26px to 28px"). If page titles ever go back to the
  body face, `--title-size` goes back to 24px. Every other size is unchanged. `src/styles/taste.test.ts` allows
  only these two font variables.

## Editing numbers
Overrides `01-decisions.md` ("…a numbers line with 'Edit numbers', which opens six live inputs"). Why: the
owner wanted to see the numbers as they were and edit each one where it is, without an "Edit numbers"
action. Same on New chart story and the chart story page. Source: `ChartStory.tsx`, `rFromPrices` in
`src/lib/story.ts`.
- **Two rows, three columns**: Entry over Exit, Stop over Size, Target over the result, 24px between columns.
  While a number is edited the columns keep their widths, and its input fits in the room its column had, so
  nothing else moves.
- **On phones** the same pairs sit side by side in three rows of two (Entry | Exit, Stop | Size, Target | R),
  so the line fits the screen.
- **The line always shows every number**: Entry, Stop, Target, Exit, Size, then the result. Each value has
  the facts' dashed underline (solid on hover). An empty one shows its label and an empty underlined slot,
  so there's always something to click. No "Edit numbers" button.
- **Click a number to edit it in place**: it becomes a small inset input, 24px, in the same line, with the
  value selected so typing replaces it. Only one number is a field at a time.
- **Keys**: Enter, or clicking away, keeps it. Escape puts back what was there. Tab and Shift+Tab go straight
  into the next or previous number, already editable, so a whole trade types in one go. Changes save as you
  type.
- **The result works itself out**: (exit − entry) / (entry − stop), the same sum for a long and a short,
  whenever you edit entry, stop or exit; while you edit, "Result from entry, stop and exit" shows under the
  line. Typing a result keeps yours (prices then leave it alone); clearing it hands it back to the prices.
  Opening a story never changes a result; MT5 results only change when you edit a price.

## Menus line up with the field you see
Why: the owner, 2026-11-22: the Setup menu sat 12px in from its field ("our app needs to look clean"). The
Details fields (`.ghost`) are drawn 12px wider on the left than their slot so their text lines up with the other
rows; the menus under them (Setup, Headspace, tag suggestions, the new-tag kind choice) lined up with the slot.
Rule: **a menu under a field starts at the field's left edge and is as wide as the field** (`UNDER_FIELD` in
`ChartStory.tsx`). Action rows read as one item, icon then label ("+ New setup"), not spread to both ends.
Also: the result box holds just the number ("+2.1"), since the R follows the box.


Overrides the prototype's date picker (Cancel and Save) and `01-decisions.md` ("Change date … All with Undo")
for the date. Why: the owner, 2026-11-22: "why save for date and time?"; "no escape, no saving"; "no toast".
Source: the facts' date in `ChartStory.tsx`, `DateDialog` in `src/screens/tradelog/Rows.tsx`.
- **On a story** (the facts' date, and ··· › Change date): the date changes as it is set (whole, valid values
  only), the session follows the time, and the picker closes on click-away, Enter or Escape. Nothing else.
- **On a trade log row** (row menu › Change date): what's set is kept when the picker closes (click-away, Enter
  or Escape alike), then the row moves to its place quietly; the session follows the time there too (it didn't
  before). Applied on close, not live, so the row doesn't jump while the date is typed.
- No toast and no Undo for a date: changing it again is the way back.


Why: the owner, 2026-11-22: the Status menu looked cluttered and cramped ("how can we fix this clutter and
spacing"). Two-line options (a name and a grey hint) had no padding above and below, so the selected fill hugged
the words and options ran into each other. Rule for every option with a hint (`OptionList` in
`src/screens/story/parts.tsx`): **8px above and below, 12px at the sides**; one-line options keep their height.


Why: the owner, 2026-11-22: an empty result box gives "no way the user knows what to input" (it wants an R),
and "we need to ensure it's not too much admin work". Approved wording: "How did it end?", "Target", "Stop",
"Breakeven", each with its R, and an "R" after the result box. Source: `outcomeChoices` and `outcomePatch` in
`src/lib/story.ts`, the numbers line in `ChartStory.tsx`.
- **One quiet line under the numbers** while a taken trade has entry and stop but no result: "How did it end?
  Target +5.3R · Stop −1.0R · Breakeven 0.0R" (12px; each R in its tone). One tap fills **Exit** with the
  target, stop or entry price and the R follows from the prices, so Exit and result always agree. "Target" only
  with a target. The line goes once there is a result; no toast (the numbers glow). Hidden while a number is
  being edited, and for any status but Taken.
- **Anything else** is typed into Exit (already in the line) and the R follows; or the R itself, in the result
  box, which shows "R" after it.
- **The empty result shows a grey example**: "3R" in `--text-3` on the empty slot's dashed underline; inside
  the box, "3" with the R after it, gone as you type. It replaces "No result yet" in the numbers line (the owner,
  2026-11-22: "isn't a good placeholder"; "they should know they're to type X R"; then "use 3R to reduce
  clutter", over "e.g. 2.5R or −1R"). A loss is typed with a minus ("-1"). A saved story's header still says
  "No result yet" for a taken trade without one.
- **Voice notes fill it** when the owner says how it ended ("hit my target", "stopped out", "closed at
  breakeven"), only while Exit is empty; the toast lists "result". MT5 (later) brings the real exit.
- **Never required**: a story saves with "No result yet", and nothing nags.
- R from prices is kept precise and rounded once, for display (2026-11-22): it used to be rounded to two places
  and then to one, so 5.345 showed as +5.4R.


Why: the owner wanted the numbers prefilled in the preview. The handoff's sample trades carry a result in R
but no entry, stop, target, exit or size; in real use MT5 sync or the chart reader fills them, and that back
end isn't designed yet (`06-open-items.md`, Back end). Source: `src/data/samplePrices.ts`.
- A sample trade with no numbers gets stand-in prices when it's read: a realistic level for its pair, a stop
  12 to 35 pips away (gold $4 to $12) on the right side, a target 2 to 3 times the risk, and an exit that
  gives exactly the trade's recorded R. Same trade, same prices, every time.
- Taken trades get all five; running trades no exit; watched and not-filled entries get entry, stop and
  target; analysis entries get none. The designed GBPUSD story keeps its own prices.
- Once a story is edited its numbers are stored with it, and stand-ins never replace them. Trades you add
  start with your own numbers only.

## Accounts: no default for screenshots
Overrides the Accounts and Add account frames and `accounts.json`'s `default_for_screenshots`. Why: the owner
said "there's nothing like default for screenshot, for now at least" (2026-11-20, answering open question 1).
Source: `src/screens/Accounts.tsx`, `AddAccount.tsx`.
- **No "Default for screenshots" badge** on any account; only practice accounts carry a badge ("Practice").
- **When logging has one row**: "When one trade shows up on two accounts". The "Screenshots with no MT5 match
  go to" row is gone.
- **Add account without MT5** shows only "You'll confirm each trade's numbers from your screenshot instead."
  The "Make this the default…" checkbox is gone.
- A chart story's account is chosen on the story itself, as before.

## Answers to the build's open questions (2026-11-20)
The owner answered `docs/DECISIONS-NEEDED.md` one question at a time. Those kept as built are listed there;
the ones below changed something. Question 1 has its own section above (Accounts: no default for screenshots),
question 10 is under Voice note.

### Very short trade (question 4)
- **The USDCHF trade that closed after 8 seconds (MT5 #48240, −0.1R) is a real entry**, not something only
  the Trade log prompt holds. It shows in the log and, as `01-decisions.md` says, counts in every number
  unless the owner picks "Leave it out" (Undo either way). So the sample journal has 135 entries and this
  month's Net R reads +7.5R rather than the frame's +7.6R. Why: "Count it" and "Leave it out" must really
  do what they say. Source: `SHORT_TRADE` in `src/data/seed.ts`.
- **A very short trade isn't asked for charts**: the Dashboard's no-charts notice skips it (it stays on the
  EURUSD trade), and its Trade log row and Grid card have no drop zone. The Trade log already asks one
  question about it, and one question at a time is enough. Charts can still be added from its story.
  *Claude's call, flagged to the owner for a yes.*
- Unit tests still check every designed number against the handoff's own 134 entries (`handoffEntries`).

### Sample BOS tag (question 6)
- **Two sample trades carry a "BOS" tag** (AUDUSD 21 Oct, NZDUSD 6 Oct), so Settings › Your tags lists
  "BOS" (2) and its "looks like Break of structure" prompt is real: Merge moves both trades to Break of
  structure (18 to 20), with Undo. Why: the preview shows every feature working (Principles). Source:
  `SAMPLE_BOS_IDS` in `src/data/seed.ts`.
- Journals saved before this get the short trade and the BOS tags added once, without touching anything the
  owner changed (`migrateData` in `src/data/store.ts`, saved data version 2).

### Start screen (question 9)
- "What to expect" opens with **"Whenever you trade"**, not "Every trading day". Why: the user may not trade
  every day, and nothing should imply a routine to fall behind on.

### Lessons tab (question 11)
- **Every reflection in the setup is listed, newest first, five at a time**, with "Show 5 more of 5" under
  them (the Examples tab's pattern). The tab count is the real total ("Lessons 10"). Why: lists never cut
  history off.

### Weekly review with no trades (question 13)
- When the ticked accounts have no traded week, the page shows its title, the account picker and one line,
  **"No trades on these accounts yet"** (16/500, centred), in place of the review and the empty Past weeks.

### Restoring shows a toast (question 14)
- **Restoring an archived setup shows "London breakout restored" with Undo**, the same as restoring an
  account. One behaviour per kind of control.

## Voice note feedback (after Mobbin research)
Why: the owner wanted "more messages and taste (interaction) to the feedback" while a voice note is read
(2026-11-21), after a long silent "Reading your note…". Source: the Notes card in `src/screens/ChartStory.tsx`,
`readVoiceNote` in `src/lib/voiceNote.ts`, styles at the end of `src/styles/globals.css`.
References: Elicit and AirOps (named steps that move on), Amie and Gemini (one shimmering status line),
Linktree (the field being written shows it), Fireflies and Heidi (a calm way out when it's slow), Workable and
Databricks (filled values marked as new), Lyssna and Lightfield (the error in place, recording kept, retry).
- **One card that says what is really happening**: "Sending your note…" while the recording uploads,
  "Listening to your note…" once the server has it, "Writing your notes…" a few seconds later, and "Busy right
  now, trying again…" only when the server reports that another model took over (a tab in its stream). Timed
  reassurance only follows those: "Still writing." / "Longer notes take a little longer." at 20 seconds, "Taking
  longer than usual" at 45. The app stops waiting at 90 seconds; the server gives each model 40 at most, and asks the next after 6 of silence. The limit ends
  in "Couldn't read your note just now" with Try again.
- **Cancel, from the first second** (2026-11-21, replaces "Stop waiting" at 45 seconds). Why: the owner asked
  to be able to stop reading straight after recording, and chose to let the note go: "the transcription is the
  most important thing, not the audio. audio makes us run into storage issues quickly." Cancel stops reading
  at once, fills nothing, and lets the recording go (it is never stored); "Talk it through" comes back with the
  toast "Voice note deleted" and Undo for 6 seconds, which reads it again (the recording is held in memory only
  until then). Same word as the recording card's Cancel; the toast follows "Suggested reflection deleted".
- **Feel** (opacity and transform only): the status line is in the voice colour with a steady light sweep;
  each new message cross-fades in. While the note is read, only the **empty** notes and details shimmer softly,
  so what the owner typed is visibly safe. When the answer lands, everything it filled glows together in the
  voice colour and fades (1.2s, a fading state marker); new tags arrive in a short wave (0 to 150ms, quicker as
  it goes). Reduced motion: no sweeps or movement; message changes and new tags only fade.
- **Failure cards keep a play button** for the recording, beside Try again.
- **The chart's date** (the owner, 2026-11-22: "the date on the GBPJPY log shows today's date instead of the date
  on the chart"). TradingView's capture line is copied, not guessed, so one of the two reads finding it is enough
  (only two different times cancel out); that chart's line was seen by one read and dropped. And a new story's
  date stays automatic until set by hand even after Save, so a chart read after Save still dates the saved story.
  A date set by hand is never changed.
- **Reading carries on when you leave** (the owner, 2026-11-22, on the wait: "it leaves me thinking that this idea
  would never work in the real world"; then "build 1 to 3"). Record, tap Done or Save, move on: the note is read
  outside the page (`src/screens/story/voiceReading.ts`, like chart reading). A story saved while its note is
  read shows the same card on its own page and takes the answer there; a saved story that isn't open is filled
  quietly with the same rules (nothing overwritten, no toast away from the story); a new story left without saving
  lets its note go. Opening the story mid-reading shows where the reading is. A note that couldn't be read keeps
  its recording (in memory) for Try again on that story.
- **Plan adherence is never a tag or a mistake** (the owner, 2026-11-22: "followed rules was picked from my voice note despite
  having followed plan as the options"). Plan has its fixed Followed / Not followed; a tag that only says the plan
  or rules were followed or broken ("Followed rules", "Stuck to the plan", "Broke my rules", "Disciplined") is
  dropped from the answer and, if the note didn't otherwise say, sets Plan instead (`planTag` in
  `src/lib/voicePrompt.ts`). The prompt says so too. A tag already made that way can be removed in Settings ›
  Your tags › Manage tags.
- **The server asks models in parallel when one is slow** (`src/lib/geminiServer.ts`). Measured 2026-11-22 on the
  free tier: a model that answers does so in 6 to 7 seconds, a busy one says so within 4 or stays silent for the
  whole 40; a test note took 46 seconds, 40 of them waiting on a silent model. Now the next model is asked as well
  after 6 seconds of silence, or at once when one says it is busy, and the first good answer wins (the others are
  stopped). The model that answered last is asked first for 10 minutes; one that said it was busy is asked last
  for 2. The card's "Busy right now, trying again…" shows when the next model is asked. Chart reading uses the
  same client.

## Pair picker (search or type, nothing limited)
Why: the owner, 2026-11-22: the Pair menu only offered nine fixed pairs, so anyone trading crosses, indices,
crypto or stocks couldn't set their pair by hand. "it doesn't make sense that you leave out some crosses";
"approve the wording, build it". Research: Mobbin ([Origin](https://mobbin.com/screens/5cf55d30-6db9-4200-a48c-19ccfd4effee),
[Copilot Money](https://mobbin.com/screens/15388be2-46ab-4367-96eb-9a18d4667569), [Perplexity Finance](https://mobbin.com/screens/e547abb1-ff13-4ee4-a049-ab65817dada5),
[Notion](https://mobbin.com/screens/0fd15513-eb9f-4407-b3cc-ae27db947a8b), [Height](https://mobbin.com/screens/4e5fbae7-b4a2-477e-bbca-95cb262d9626))
and other journals (Edgewonk creates an instrument on first use; Tradervue maps alternate names; TradeZella makes
you pick an asset type first and ask support for new symbols, which we avoid). Source: `src/lib/instruments.ts`,
`src/screens/story/PairMenu.tsx`, `PairFact` in `ChartStory.tsx`.
- **The menu**: a search field at the top ("Search or type a pair", Lucide `search` icon, 16px; the cursor is
  in it on opening), then **Your pairs** (the 8 most used, from the owner's stories), then every group in full:
  **Majors** (7), **Crosses** (all 21), **Exotics**, **Metals**, **Indices**, **Crypto**, **Energy**. Group labels
  stick while their group scrolls; the list is about 10 rows tall and scrolls inside the menu (280px wide).
  A pair of yours also stays in its group, so no group looks incomplete. Rows: the ticker, and a quiet 12px
  name for non-forex (XAUUSD · Gold).
- **Search** by ticker, by one currency ("JPY" lists all seven yen pairs), by name ("gold", "nasdaq") and by
  nickname or shorthand ("gj", "cable"). Your pairs rank first; a close spelling ("GBPJYP") finds the real pair
  first. Enter picks the first row; arrows, Escape and outside click as in every menu.
- **Anything else is allowed**: the last row is **Use "…"** whenever what was typed isn't an exact ticker. Text
  is tidied (capitals, no broker prefix, slashes, spaces or symbols, 15 characters at most). No confirm step.
- **Nothing to manage**: Your pairs comes from the stories, so a typo goes once that story is fixed.
- **Broker spellings**: GOLD, XAUUSD.a, EURUSDm, US30.cash, USTEC map to the instrument, and a chart reading
  takes the owner's spelling (`ownSpelling`). What the owner types by hand is never rewritten. Later, if two
  spellings of one instrument both get used, Settings could offer to merge them (like look-alike tags).
- The label stays "Pair" for every market (the owner's choice).


Built on the owner's go-ahead (2026-11-21) to the behaviour in `01-decisions.md` "Charts in a story", with
the voice notes' key and models. Source: `src/lib/chartRead.ts` (what Gemini is asked and the checks),
`netlify/edge-functions/chart-read.ts` (`/api/chart-read`), `src/lib/chartReader.ts`, the facts in
`ChartStory.tsx`.
- **Each chart added to a story is read**, one at a time, once the AI is set up (the same readiness as voice
  notes). Gemini reads the **legend** (symbol, timeframe as written) and the **position box** (direction, and
  entry, stop and target as printed). It is told never to estimate a price from the axis.
- **Trust nothing**: prices must be plain numbers; prices only come from a position box; together they must
  fit the direction (a long's stop below entry and target above, a short's the other way), else the set is
  dropped. Symbols lose broker prefixes and map to the owner's own spelling ("OANDA:XAUUSD" → XAUUSD).
  Timeframes are normalised on a clean match only ("240", "4h", "H4" → "4H"); otherwise no caption.
- **Guesses are caught, not trusted** (added 2026-11-21 after live tests on drawn charts: a clear chart, the
  same at half size, a tiny one nobody could read, and one with the box but no prices printed). The free
  models read printed prices exactly, every time, but on the tiny chart they invented plausible prices on
  the right sides of the entry, different on each read (three reads, three stops), and twice called a short
  a long from the colours alone. So:
  - Each price must appear in the printed text the reader quotes back (`price_text`).
  - **Every chart is read twice at once**; prices and direction are kept only when both reads match exactly.
    A mismatch counts as unreadable. If only one read comes back, only pair and timeframe are used.
  - **A direction only comes with readable prices**, never from the colours alone. The owner picks Long or
    Short in one click.
  - Result of the tests: the clear and half-size charts filled correctly; the tiny one filled nothing and got
    the "too small to read" card; the one without printed prices filled only pair and timeframe.
- **The owner's real charts** (three TradingView screenshots, 2026-11-21) taught three more rules:
  - The legend writes the instrument's name ("Euro / U.S. Dollar", "Gold Spot / U.S. Dollar"), so the reader
    asks for the ticker; a pair is only ever one of the owner's pairs or something shaped like a ticker
    ("EURUSD", "US30"), never a name run together ("EUROUSDOLLAR", which an early read gave).
  - The position tool's prices often show only as coloured tags on the price axis (red stop, grey entry, blue
    target), not as labels in the box; the reader is told so.
  - **Several position tools on one chart** (the Gold chart had two shorts): each tool is read on its own.
    Only pair and direction fill, and the direction only when every tool's readable prices give the same one
    (the owner's choice: "Pair and direction only"). The owner types the prices of the position they took.
    Not "too small to read".
- **Several charts in one story** (2026-11-21, the owner: "build them, keep it silent"). Charts are read in the
  order they are added; one rule per fact (`applyChartRead` in `ChartStory.tsx`):
  - A chart of another pair than the story's fills nothing (a wrong upload, or DXY for context).
  - A chart whose box points against the story's direction fills nothing (likely another trade).
  - Prices come as one set from one chart, only while entry, stop and target are all empty: never mixed
    across charts or with a price typed by hand.
  - The first chart with a box wins; later charts never overwrite. Changing a fact is the owner's, by hand.
  - A skipped chart is silent: no message, nothing changes (the owner's choice).
- **Fills only what is still empty** (pair, direction, entry, stop, target); a pair chosen by hand stays. The
  facts line says "Reading your chart…" (shimmer) and the empty facts pulse softly while reading (no clipping,
  so the facts' menus still open); filled facts glow; the toast reads "Pair, direction and 3 prices read
  from your chart" with Undo (no colon, DESIGN.md › Toasts). A position box whose prices can't be read gets frame 16's "Prices on this screenshot
  are too small to read". If reading fails or is offline, nothing happens: the owner types as before.
  *The two lines of wording are new, written in the approved voice-note style: flagged to the owner.*
  *Open: a box with no prices printed at all can also get "too small to read" (the model can't tell the two
  apart reliably). Asked the owner whether that line is fine for both.*
- **Edge cases fixed** (the owner, 2026-11-22: "fix the edge cases we listed earlier"; the list is in the
  conversation of 2026-11-21, numbered as there). Reading now lives apart from the page
  (`src/screens/story/chartReading.ts`, rules in `src/lib/chartFill.ts`):
  - **#18** A chart removed before its reading lands fills nothing.
  - **#19** Saving a new story while a chart is still being read: the reading fills the saved story (quietly
    if that story isn't open).
  - **#20** Nothing is read once pair, direction, entry, stop and target are all set (saves the free allowance).
  - **#21** Offline: the chart waits and is read once the device is back online.
  - **#22** A busy or failing service is asked again quietly after a minute, then after three (no message
    yet; the visible "can't read right now" line waits for the owner's wording).
  - **#26** A new story takes its date from TradingView's own line ("created with TradingView.com, Nov 12, 2026
    04:39 UTC"), the earliest of its charts, unless the date was set by hand; the toast lists "date". The
    trader's own offset is applied when printed ("15:51 UTC-5" is 20:51 UTC; found on the owner's GBPJPY chart).
  - **#24** When the owner changes a fact the reader filled, the reading and the change are kept on this device
    (`chart:corrections`, last 200), never shown, to improve these rules from real mistakes.
  - **The prices decide the direction** (2026-11-22, the owner's GBPJPY chart: the model read every price right
    and still said "Long" for a short). The model's own Long/Short is ignored; stop and target must sit on
    opposite sides of the entry. Checked live on the branch preview with the owner's three charts: EURUSD (pair,
    30m, date, no trade) and Gold (XAUUSD, 30m, date, Short, prices left to type) correct; GBPJPY fully correct
    (Short, 211.840 / 212.008 / 211.197) on one of two runs, and on the other its two reads disagreed, so no
    prices filled. All runs used the weakest backup model: the two better free models were out of requests.
  - **#15** Decimal commas ("4.068,70", "1,26840") are told apart from thousands ("4,068.70") using all of a
    chart's prices together.
  - **#9** Broker spellings map to the owner's (see Pair picker).
  - **#4, #5, #6, #7, #16** The reading instructions now: find the position tool by where its zones sit, not only
    by colour; read MT5's entry line and its "sl" and "tp" lines as one position; take the symbol of the pane with
    the trade when a screenshot has several panes; ignore the current-price tag, line tags, the legend's open,
    high, low and close, indicator values and drawings.
  - **The owner's wording, approved 2026-11-22** ("approve the wording, keep it silent when reads disagree"):
    - **#12** A box read clearly but with no prices printed gets its own card, **"This chart has no prices on
      it"** with **Type the numbers**, and the first time only the tip **"Click the position box before taking
      the screenshot and its prices show."** (`seenPricesTip`). "Too small to read" stays for prices that are
      there but can't be made out. A card shows only when both reads say the same.
    - **Reads that disagree stay silent**: the prices are left empty and no card claims anything.
    - **#22** Still unreadable after the two quiet retries: the facts line reads **"Couldn't read your chart just
      now · Try again"** (in place of "Tap anything to change"); Try again reads those charts from the start.
      Hidden once every fact is set.
    - **#23** Every model out of free requests: no retries, the same line, and Settings › Voice notes says
      **"Chart and voice reading is paused until tomorrow."** for the rest of that day (`readingPausedOn`;
      cleared by the next successful reading). A voice note out of requests shows its usual "Couldn't read your
      note just now" card and sets the same line.
    - **#25** Settings › Voice notes always says **"Charts and voice notes are sent to Google to be read. Google
      doesn't keep them."**
- Not yet: showing the read timeframe as a caption under uploaded charts (stories keep no caption per uploaded
  image yet); the reader returns it already.

## Neutrals: half the blue tint
The owner, 2026-11-22: "our neutral color tokens have a bit of a blue tint, most especially in dark mode, and I
want to reduce it a bit and not take it away completely." Every neutral token in both themes (grounds, surfaces,
text greys, borders, hover and pressed fills, shadows' ink, buttons, the medal, the scrim, the theme colour in
`index.html` and the manifest) keeps its OKLCH lightness and hue and has its chroma halved. Contrast is
unchanged (lightness is). Dark mode's text greys went from about 0.02 chroma to 0.01, light mode's inks from
0.008 to 0.004. Result colours, attention and the voice colours are untouched. Pure white and black stay.

## First ui-polish audit (2026-11-22)
The owner: "fix 1-11, use your judgement on the rest", then "reduce the horizontal padding on the filter inputs so
it looks sleeker". Findings and method: `docs/ui-audit-2026-11-22.md`. One rule per kind of thing, on every screen:
- **Popovers sit on their trigger, inside their column.** The date and time popover opens under the date, left
  edges together; form popovers (date and time, a new tag's kind, Change date) have 12px inside, menus of options
  4px. The Details fields keep their text on the Plan control's edge, hang their hover fill 12px into the gutter
  and reach the column's right edge; their menus match the field exactly. A list that scrolls fades its last 24px
  while more rows are below (the Pair menu).
- **Quiet text buttons line up by their text** when they stand alone at a column's edge ("Edit session times",
  "Manage tags", "Add another", "Delete", the Rules "Edit"): the hover fill hangs into the gutter (`.kq-start`,
  `.kq-end`).
- **Text never overflows or leaves a stray "·".** Recent chart stories: the top line is pair, direction and
  result; a story without a result says its status at the start of the line below ("Running · Unsorted"), so a
  six-letter pair never truncates (the handoff frame had "Running" touching the next card). Weekly review tiles put
  "Not followed" on its own line. The Dashboard stat cells have less room on the right than the left so "Wins
  avg +1.8R, losses −0.9R" fits on one line (16px left and 12px right since Inter and its tracking, DESIGN.md › Typeface).
- **The same kind of element is the same size.** Chips and badges are 22px everywhere (`.kchip`, `.pill`; the
  Practice badge too, at `--r-xs`). Dashboard table rows are one height (a 64 × 36 thumbnail line), Settings rows
  one height (16px above and below a 32px line), the "Archived" disclosure rows 48px, account rows 60px, the
  Accounts menu's rows 34px. Every Dashboard column header is 12px. The linked analysis card pads 24px at the
  sides like the Notes card above it.
- **Dark mode:** chart images get a visible edge (`--chart-edge`); the off switch and the chart drop areas use
  `--border-strong`.
- **Actions on an image sit on the image:** the Playbook card's "…" is 28px, 8px inside the thumbnail's corner,
  white dots on the media scrim, like the chart tiles' trash.
- **No browser leftovers:** text fields grow with what's written, no resize grip.
- **Numbers grid:** each column is a label track and a value track, so values share their left edges (1.26840
  over 1.26482, Stop's over Size's); the result starts where Target does; a number being typed starts exactly
  where it rested.
- **Small holes:** a grid card that isn't asked for charts keeps the chart's place as a dashed empty box (as the
  Dashboard's Unsorted thumbnail), so its line and "…" match its neighbours; an analysis says "Before trading"
  with the status icon in the grid as in the list; the tag input fits beside the last chip until it's used; the
  Weekly review banner's label sits on the quote's baseline.
- **Judgement calls (owner delegated):** no "In R" under the Weekly review's Net figure (the unit was there
  twice); no zero counts ("Accounts", "Tags" and the kind mix appear once there's something to count); an empty
  Trade log or Accounts page has one action, the header's button (the empty card no longer repeats it); the
  Details hint says "tap anything to change" like the facts line; filter menus keep their counts (state 07) with
  the check in a fixed slot so the counts line up; both add-chart designs stay (the trade log's drop zone and the
  Dashboard's tile are both drawn in the handoff). **New wording, for the owner to confirm:** with Keep recordings
  off, its hint says "Only the written transcript is kept." (it said "Turn off to keep only the written transcript"
  beside a switch already off).
- **Filter buttons are 8px at the sides** (fields keep 12px), so the Trade log's filter row reads as one quiet strip.
- Not done: the date and time field still uses the browser's own picker ("11/16/2026, 09:45 AM"); a picker in the
  app's own format is a larger piece of work, for the owner to schedule.

## Real app (the owner's own journal)
The owner chose to make the journal usable for real trades on their own devices before any back end
(2026-11-20). Source: `src/app/mode.ts`; tests in `tests/real/`.
- **Two builds of one app.** The design preview (`npm run build:artifact`) and the dev server stay the
  sample journal: 135 sample trades, frozen on Monday 16 November 2026, so the owner can judge the design.
  The real journal (`npm run build:real`, `npm run dev:real`) starts empty, runs on today's date and has
  no sample stand-ins: no sample prices, no prefilled GBPUSD New chart story, no example setups, no sample
  account details. No new buttons or settings switch between them (the owner's choice).
- **Its own web address**, installable on computer and phone (the owner's choice); hosted free on Netlify,
  which the owner connected to GitHub: https://my-journal-rlfv.netlify.app (public: the data never leaves the
  device, and a login would get in the way of the installed app). Netlify builds the `main` branch (`netlify.toml`); finished, tested work
  moves from the working branch to `main`. Installable: `public/manifest.webmanifest`, icons drawn from the
  sidebar's logo mark (`scripts/app-icon.svg`, rendered by `scripts/app-icons.mjs`), and an offline worker
  (`public/sw.js`, real build only) so the app opens without a connection; the data itself is in the browser. Until there is a back end, data stays on each device, in its own browser
  database (`journal-real`), apart from the sample one.
- **Talk it through is hidden in the real journal** until voice notes work there: notes are typed. Voice
  notes come after hosting, through Gemini's free tier (the owner's choice, 2026-11-21: their claude.ai plan
  doesn't cover API use, and Gemini hears audio itself, so no browser speech step), via a small server
  function on the same host so no key sits in the page. On the free tier Google may use what is sent to
  improve its products; the owner was told.
- **Voice notes (Gemini, the owner's choice).** The app records the note (`src/lib/recorder.ts`) and posts it
  with the owner's setups, tags (with kinds), the headspace list and Settings' language to the edge function
  `netlify/edge-functions/voice-note.ts` (path `/api/voice-note`). It asks Gemini's Interactions API
  (`gemini-4-hydrogen`, free tier; `GEMINI_MODEL` overrides) for JSON in a fixed shape whose setup and headspace
  can only be the owner's own (`src/lib/voicePrompt.ts`), never stores the request, and checks every value
  again before answering. The story then fills only what is still empty, from the story as it is when the
  answer arrives, with the toast and Undo as before. The key is the Netlify variable `Gemini_API_Key` (Netlify fills
  `GEMINI_API_KEY` itself with a token for its own AI service, which Google rejects); it never
  reaches the page.
  - Waiting: low thinking for Gemini 4 (a short note), and the function answers at once and keeps the line
    open while Gemini reads, so a long note can't time out. When a model is busy or rate-limited it hands over
    to the next free one: `gemini-4-hydrogen`, then `gemini-3.8-flash`, then `gemini-3.5-flash-lite`.
  - `GET /api/voice-note?check` reports harmless facts about the key in use (variable, first 4 characters,
    length, publish), never the key. Checked live 2026-11-21: a spoken test note filled both notes, setup,
    tags with their kinds, plan and headspace.
  - Talk it through and Settings › Voice notes appear by themselves once the server says it is ready (a key is
    set); the last answer is remembered, so they also show offline (`src/app/useVoice.ts`).
  - **Only the written notes are kept** (the owner, 2026-11-21: "keep only the written notes for now"; why:
    "the transcription is the most important thing, not the audio. audio makes us run into storage issues
    quickly"). Keep recordings starts off in the real journal (`src/data/settings.ts`), so a story keeps its
    notes, details and "What you said", with no play button. Turning Keep recordings on keeps each new
    recording with its story in the browser (`src/data/voiceAudio.ts`), playable from the voice row.
    The recordings kept before this change were cleared once (the owner's choice; data version 3 in
    `src/data/store.ts`). A deleted story's recording is removed the next time the journal opens
    (`sweepVoiceAudio` in `src/data/voiceAudio.ts`, run from `src/main.tsx` once the journal has loaded): one
    rule for every way of deleting (story page, trade log, an account's trades), and an Undo never outlives the
    visit, so nothing Undo could restore is lost. The preview's sample stories keep
    their designed play button (they have no real audio).
  - Wording (approved by the owner 2026-11-21): "Reading your note…" while Gemini reads;
    "The microphone is off" / "Allow the microphone for this site in your browser, then record again." with
    Record again; "You're offline" / "Your recording is kept. Try again when you're back online." and
    "Couldn't read your note just now" / "Your recording is kept. Try again in a moment." with Try again (the
    same recording is sent again). "Couldn't make out your note" stays frame 16's.
- **Connect MT5 stays, marked as waiting** until sync exists (the owner's choice). Add account asks for
  login and server only, under the line "MT5 sync isn't built yet. Your login and server are kept, and trade
  numbers fill in once it is." (no investor password, no Test connection); both are needed while MT5 is on.
  The account's row reads "MT5 · waiting for sync"; Edit account says "Waiting for sync · <server>" with the
  same line and no Reconnect. Source type `mt5-waiting`.
- **Approved wording for the empty real journal** (2026-11-21):
  - New chart story: subtitle "Drop the charts and add a note if you like."; the empty chart area reads
    "Drop, paste or choose charts" and is the file picker; no tile strip, Add tile or "Drag to reorder." until
    there is a chart; the facts caption reads "Tap anything to change" (on saved stories too); no "From your
    note…" line and no placeholder in the note boxes; empty facts show their name ("Pair", "Account").
  - Start with no account: step 1 is the current step, "Connect an account" with "Add the account you
    trade. MT5 is optional." and Add account (primary); step 2's Add setups is then a plain button.
  - Accounts with none: the empty-state card "No accounts yet", "Add each account you trade. Practice
    accounts stay out of your numbers.", Add account; the practice line under the list is hidden then, so it
    isn't said twice.
  - Settings: the Reminders section is hidden until reminders can be sent; Review day has no "One reminder
    that day…" line; the Voice notes section shows only where voice notes work (`VOICE` in mode.ts).
  - Time zone is really detected (Intl), e.g. "New York (UTC−5)", and listed first if it isn't one of the
    usual zones (2026-11-21).
- **Date and time come from the screenshot**: a new story takes the oldest dropped, pasted or chosen
  screenshot's file time, until the owner sets the date by hand, which then stays.
- **Sessions follow Settings › Time and sessions** (both journals): a story's session is the one open at its
  time; where two overlap, the one that opened most recently (09:45 is London). Was fixed hours.
- **A new real account joins the picked accounts** at once (practice accounts stay out), so its trades count
  without pressing Reset. This applies to the sample journal too.
