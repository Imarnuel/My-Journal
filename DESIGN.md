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

## Typeface: Geist
Overrides Inter in `CLAUDE.md` and `02-look-and-feel.md`. Why: the owner's choice. Geist Variable, self-hosted
from `@fontsource-variable/geist` (latin and latin-ext), set once in `--font-sans`; nothing names a font
directly. Sizes, weights, line heights and tracking are unchanged; tabular figures stay on (Geist has them).

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

## Sample prices
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
  longer than usual" at 45. The app stops waiting at 90 seconds; the server gives each model 40. The limit ends
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
  so the facts' menus still open); filled facts glow; the toast reads "Read from your chart: pair, direction
  and 3 prices" with Undo. A position box whose prices can't be read gets frame 16's "Prices on this screenshot
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
