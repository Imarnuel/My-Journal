---
name: ui-polish
description: Audit and fix UI inconsistencies in this trading journal so every screen looks deliberate, never like AI slop or a bug. Use when the owner asks to make the UI cleaner, more consistent or polished, when something looks off (alignment, spacing, corners, cramped or cluttered, a unit shown twice, a placeholder that doesn't help), before reporting any visual change done, and for a periodic full audit. Covers the building blocks (colour, type, spacing, corner, height, shadow, icon and motion tokens), an automatic check for off-scale values, screenshots of every screen in both themes, and a checklist of the mistakes this app has actually made.
---

# UI polish

The goal: every screen looks like one careful person designed it. Same building blocks everywhere, edges that
line up with what you see, room around every piece of text, one way of doing each kind of thing.

The owner's words: "these are the building blocks of a polished and consistent UI. Ensuring alignment, spacing
is right. nothing looking like AI slop/bug."

## Read first
1. `DESIGN.md` › Principles (every screen), then the section for the screen you're touching. DESIGN.md wins.
2. [TOKENS.md](TOKENS.md): the building blocks and when to use each one.
3. [CHECKLIST.md](CHECKLIST.md): what to look for. Every item is a mistake this app has made at least once.

## The loop

1. **Check the code.** `node scripts/ui-lint.mjs` lists every value off the scales (font size, line height,
   weight, spacing, control height, raw colours) with file and line. A listed value is either fixed onto the
   scale or, if it's a deliberate one-off (a chart's geometry, an image's size), added to the script's
   allowlist with a comment saying why.
2. **Look at every screen.** `node scripts/ui-shots.mjs <folder>` (the dev servers must be running, or it
   starts them) saves every screen and its key states, light and dark, at 2x, for both the sample preview and
   the real journal. Look at each one, then crop and zoom into controls, menus, cards and their corners. A
   screenshot at normal size hides 1px and 2px problems.
3. **Measure when unsure.** Don't eyeball alignment: read the boxes with Playwright
   (`locator.boundingBox()`) and compare edges, gaps and centres. Two edges that should line up must match to
   the pixel.
4. **Report before fixing** (for a full audit): a short list, most visible first. For each: the screen, what's
   wrong (with a crop), the rule it breaks, and the fix as a rule for every screen ("menus line up with the
   field you see", not "move the Setup menu 12px"). Small, exact fixes the owner already asked for don't need
   a report.
5. **Fix as a system.** One rule per kind of thing, applied on every screen where it appears. Prefer fixing the
   shared piece (`OptionList`, `.ghost`, `ProblemCard`, a token) over patching one screen.
6. **Record and prove it.** Add or update the DESIGN.md section (rule, why, the owner's words), regenerate the
   approved images for the screens that changed (`APPROVE='<regex>' npx playwright test <specs>`, then look at
   each against the old one), log them in `tests/visual/approved/README.md`, and add a check to
   `src/styles/taste.test.ts` when the rule can be read from the code.
7. **Before saying done:** lint clean, the affected screenshots looked at in both themes, the full test suite
   run, the preview republished (CLAUDE.md › Live preview). Push to the working branch only; `main` only when
   the owner says "publish it".

## Judgement
- The owner decides taste. Small spacing or clutter fixes: use your own judgement (no Mobbin). New experiences
  or real redesigns: propose first.
- New wording needs the owner's approval. A fix that changes what a screen says is not a polish fix.
- When a rule here and DESIGN.md disagree, DESIGN.md wins; fix this skill.
- Keep the tokens as they are unless the owner changes them. Polish means using them consistently, not
  inventing new values.
