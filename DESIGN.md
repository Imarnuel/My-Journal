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
