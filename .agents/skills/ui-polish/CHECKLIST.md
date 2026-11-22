# What to look for

Each item is something this app has actually got wrong. Look for all of them on every screen, in both themes.

## Alignment
- [ ] **Edges line up with what you see**, not with an invisible box. A menu under a field starts at the
      field's visible edge and matches its width (the Setup menu sat 12px in, because `.ghost` fields are drawn
      12px wider than their slot).
- [ ] Text in a column starts at the same x as the text above and below it (labels, values, notes, cards).
- [ ] Icons sit centred on the first line of their text, not on the block.
- [ ] Rows in a grid share column edges (numbers line: Entry over Exit, Stop over Size, Target over Result).
- [ ] Nothing is off by 1 or 2px from its neighbours (measure with `boundingBox`, don't eyeball).

## Spacing and room
- [ ] Text never touches its container: a hover or selected fill has room on every side (the Status menu's
      two-line options had none above and below).
- [ ] Gaps come from the spacing steps and repeat: the same kind of gap is the same size everywhere.
- [ ] A hover or selected fill sits inside its container's padding, with the nested corner rule.
- [ ] Nothing is cramped or crowded; nothing floats with odd empty space either.

## Corners
- [ ] Every corner comes from the scale; inner = outer minus the padding between.
- [ ] Circles and pills are perfectly round; everything else is a continuous corner where supported.

## Type
- [ ] Only 12/16, 14/20, 16/24, 24/32; weights 400, 500, 600 as TOKENS.md says.
- [ ] Hierarchy reads at a glance: one thing per area is the headline.
- [ ] Long text truncates or wraps on purpose (pair names, setup names, notes), never overflows.

## Controls and behaviour (one behaviour per kind of control)
- [ ] The same kind of control looks and behaves the same everywhere (every fact applies at once; no Save on
      one picker when the others have none).
- [ ] Action rows read as one item, icon then label ("+ New setup"), not spread to both ends.
- [ ] Every control is at least 24px to hit, has a visible focus ring, and works with the keyboard.
- [ ] Hover, selected, disabled and empty states are all designed, not left to the browser.

## Words, numbers and units
- [ ] A unit appears once ("+2.1" in the box, R after it, not "+2.1R R").
- [ ] Placeholders show what to type ("3R"), not a label repeated or a vague phrase ("No result yet").
- [ ] Results in R with a sign and a real minus (−); dates and times in the app's own format.
- [ ] Sentence case; no em dashes; no new wording without the owner's approval.

## Tells of AI slop or a bug
- [ ] Decoration with no job: gradients, glows, emoji or icons added for flavour, borders and shadows stacked.
- [ ] Two ways of showing the same thing on one screen (two date formats, two button styles for one action).
- [ ] Leftovers: a doubled label, a stray separator (·) at a line's end, an empty element taking space, a
      toast or message that repeats what's on screen.
- [ ] A component from the browser that clashes (native select, date field) where the app has its own style.
- [ ] Dark mode as an afterthought: a hard-coded colour, a shadow that disappears, text that drops below
      `--text-3` contrast.
- [ ] Phone width: nothing wider than the screen, targets still 24px, nothing overlapping.
