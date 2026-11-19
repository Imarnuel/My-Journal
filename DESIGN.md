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
