# Trading journal: design handoff

Everything needed to build the trading journal in Claude Code so it looks and behaves exactly like the approved design.

The design was made on a Claude Design canvas (16 frames). This package holds the frames as a runnable prototype, full-page screenshots of every frame in light and dark, 40 screenshots of interaction states, the design tokens and Tailwind config, every icon, the sample data, the reference images, and the written decisions.

Live canvas (view only): https://claude.ai/artifact/9SsKH9vyMPxomtAWzLPtst

## Start here

1. Put `CLAUDE.md` at the root of the new repo. It's the instruction file Claude Code reads first.
2. Open the prototype so you can click through the real design:
   ```bash
   cd prototype
   python3 -m http.server 8765
   # open http://localhost:8765/  (index of all 16 frames)
   # add ?theme=dark to any frame URL to see it in dark mode
   ```
3. Ask Claude Code to read `CLAUDE.md`, then `docs/04-build-plan.md`, and start with phase 1.

## What's inside

| Folder | What it is | Used for |
|---|---|---|
| `CLAUDE.md` | Rules and workflow for Claude Code | Copy to the repo root |
| `docs/01-decisions.md` | What every screen does and how every control behaves. The product rules | Behaviour. Wins on behaviour |
| `docs/02-look-and-feel.md` | Every visual decision with values: tokens, type, spacing, components, motion, accessibility | Look. Wins on look |
| `docs/03-screens.md` | Screen map: each screen, its route, its frame, its states, its screenshots | Planning the routes and pages |
| `docs/04-build-plan.md` | Stack, folder structure, build order, and how each phase is checked | The build itself |
| `docs/05-data-and-calculations.md` | The data model and every formula behind the numbers | Data layer, dashboard, review, playbook |
| `docs/06-open-items.md` | What is not designed yet, and known gaps | So nothing is invented silently |
| `docs/07-screens-inventory.md` | Generated list of every heading, button, link, field and the full visible text per screen | Copy must match word for word |
| `prototype/` | The 16 canvas frames, runnable in a browser with `support.js` | Ground truth for layout, copy and behaviour |
| `screenshots/light/`, `screenshots/dark/` | Full-page captures of every frame at 1440px wide | Visual comparison (the build must match) |
| `screenshots/states/` | 40 interaction states: menus, dialogs, toasts, hovers, tables, deleted states | Matching states that a static frame doesn't show |
| `design-tokens/tokens.css` | Colour, shadow, radius, height, motion tokens for light and dark | Copy into `src/styles/tokens.css` |
| `design-tokens/tailwind.config.ts` | Tailwind theme: the 4 type sizes, 8 spacing steps, token colours | Copy into the repo |
| `design-tokens/tokens.ts` | The same tokens for JS (charts) | Charts and canvas drawing |
| `design-tokens/canvas-stylesheet.css` | The exact stylesheet the frames use, including component classes | Reference when matching a component |
| `design-tokens/icons/` | Every icon as SVG, plus `ICONS.md` with the Lucide names | Icons |
| `data/` | The sample dataset (134 entries) and supporting data as JSON | Seed data, so the build shows the same numbers as the screenshots |
| `references/` | The 7 look-and-feel reference images and the Monny dashboard video. `inspiration-concepts-only/` holds competitor and old-journal screenshots: concepts only, never copy them | Understanding the direction |
| `reference-code/generator/` | The Python that generated the frames | Archaeology only. Don't port it |

## Order of authority

When two sources disagree:
1. `docs/01-decisions.md` wins on behaviour (what happens).
2. The prototype and screenshots win on exact pixels, layout and copy: where things are, what they say, and their measured size, padding and colour. Read values from the prototype's computed styles in the browser's dev tools when in doubt.
3. `docs/02-look-and-feel.md` explains the system behind those values (tokens, scales, rules) and covers what a static frame can't show (motion, hover, focus, phone). If it ever disagrees with a measured value in the prototype, the prototype wins; note the difference.
4. Everything else is supporting material.

If something isn't covered anywhere, it's in `docs/06-open-items.md` or it's a gap: ask, don't invent.
