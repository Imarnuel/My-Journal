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
- **These icons are filled, grey (`--text-3`), 16px.** Source: `src/screens/story/detailIcons.tsx`. Other
  icons in the app stay as the handoff draws them (stroke icons) unless the owner says otherwise.

## Spacing and alignment
- **Fields line up with their labels and with the cards beside them.** A text field never takes the ghost
  field's negative margin; it is full width with `box-sizing: border-box`, 8px corners.
- **Even rhythm inside a card**: 16px between the parts of a card, 12px from the card header to its first
  part, 8px from a label to its field. A label row only grows to 28px when controls sit beside the label.
- **Inputs inside a tag field start at the same x as the other values** (no field padding).
