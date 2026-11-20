# Handover

For the next Claude session on this project. Read this first, then `CLAUDE.md` and `DESIGN.md`.
Written 20 November 2026, at the end of the first build session.

## Where things stand
- The whole app is built from the design handoff and working: Start, Dashboard, Trade log (list and grid),
  New chart story and the saved chart story, Playbook, setup pages, the setup editor, Weekly review,
  Accounts (add, edit, archive) and Settings (appearance, review day, reminder, sessions, your tags).
- Since the build, the owner has made about 30 design corrections. Every one is a section in `DESIGN.md`
  with its reason. `DESIGN.md` wins over everything else, including `CLAUDE.md` and the handoff.
- `DESIGN.md` opens with "Principles (every screen)": the general rules behind those corrections. Apply them
  to new work before the owner has to correct it. `src/styles/taste.test.ts` checks the ones code can show.
- `CLAUDE.md` now agrees with `DESIGN.md` (radii, segment weight, icons). Keep it that way: when a correction
  changes something `CLAUDE.md` states, update that line in the same commit.
- Everything is committed and pushed on the branch `claude/sweet-mayer-v7v5nl` (not merged to `main`; no
  pull request has been opened). Keep committing to that branch unless the owner says otherwise.
- All checks pass: 90 unit tests (`npm test`), 325 browser tests (`npm run e2e`).

## How the owner works
- The owner looks at the app on the live preview: https://claude.ai/artifact/Lnqrd7dbSJgF2Q8DRExLt6
  After any visible change: `npm run build:artifact`, then republish `dist-artifact/journal.html` with files
  `assets/app.js` and `assets/app.css` to that URL (Artifact tool, `url` set to the link). Then commit and
  push. The owner expects all three every time.
- The owner gives one correction at a time, often with a screenshot, and is happy with a short
  explanation and a recommendation when something is a judgment call. When a request is ambiguous or
  would change the handoff's behaviour, propose first and build on a yes.
- Plain language. The owner isn't a developer; avoid jargon in replies.
- Each correction: add a `DESIGN.md` section (what, why, source file), update tests, regenerate the
  affected approved images (below), check them by eye in light and dark, then build, publish, push.

## Where things are
| What | Where |
| --- | --- |
| Design handoff (docs, screenshots, prototype, data) | `handoff/` |
| Owner's corrections (top authority) | `DESIGN.md` |
| Project rules and skills table | `CLAUDE.md` (kept in line with `DESIGN.md`) |
| App shell, routes, toasts | `src/app/` (`Shell.tsx`, `routes.ts`) |
| Screens | `src/screens/` (one file per screen, folders for their parts) |
| Chart story (new and saved; the largest file) | `src/screens/ChartStory.tsx`, `src/screens/story/` |
| Drag to reorder chart tiles | `src/screens/story/useTileReorder.ts` |
| Rules and calculations (pure, unit tested) | `src/lib/` (`calc.ts`, `story.ts`, `tradelog.ts`, `dashboard.ts`, `review.ts`, `playbook.ts`) |
| Data store (zustand, saved to the browser) | `src/data/store.ts`, `persist.ts`, `seed.ts` |
| Stand-in prices for sample trades | `src/data/samplePrices.ts` |
| Tokens (colours, radii, motion, font) | `src/styles/tokens.css`; extra rules in `globals.css`; the prototype's stylesheet in `canvas.css` |
| Charts (hand-drawn SVG) | `src/components/charts/` |
| Prototype ports kept for reference | `src/screens/body/`, `logic/`, `views/` (see `docs/PORTING.md`) |
| Questions sent to the owner during the build | `docs/DECISIONS-NEEDED.md` (1 to 16 still unanswered; 17 waits for the back end; 18 settled) |

## Tests and reference images
- Visual tests compare each screen at 1440px with a reference image. Approved images in
  `tests/visual/approved/` (light, dark, states, chrome) replace the handoff screenshots once the owner
  has changed a screen; every approval is logged in `tests/visual/approved/README.md`.
- To regenerate after an approved change: `APPROVE='<regex of image paths>' npx playwright test <specs>`,
  then look at each regenerated image before committing. Story screens, for example:
  `APPROVE='(05-NewStory|06-NewStoryTyped|07-Story|chrome/story|states/(1[5-9]|2[0-4])-)'`.
- State 19 (a chart's menu open) is retired: chart tiles no longer have a menu.
- Run the browser tests with `--workers=4`; a full run takes about 3 minutes.

## Gotchas learned the hard way
- Chromium is preinstalled. Scripts that launch it themselves need
  `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })`. Never run `playwright install`.
- In `ChartStory.tsx`, keep every hook above the early returns (the deleted-story view returns early).
  A hook below one broke "Story deleted" once.
- `canvas.css` gives every text input 12px side padding with `!important`. A compact input needs its own
  `!important` (see `.knums input.knum-in`).
- Accessible names must contain the visible text (axe `label-content-name-mismatch`). Don't replace a
  text space with a flex gap inside a button whose name includes both words.
- Tests that find buttons by name match loosely by default: "Stop" also finds "Stop 1.27010". Use
  `exact: true` for short names.
- Very long shell commands that delete files can be blocked by a safety check; keep `rm` in its own
  simple command.
- The dev server (`npx vite --port 5173`) isn't running at the start of a session. Playwright starts its
  own for tests.

## Open threads
- Nothing is half-built. The last change was the numbers grid (Entry/Exit, Stop/Size, Target/R).
- The owner asked about splitting work into one Claude session per module. We agreed it isn't needed now;
  revisit only if several screens need work at the same time. If so: write a module ownership map first
  (which files each module owns; shared parts stay with one coordinating session), start small (Chart
  story, Trade log, Dashboard), and keep a single preview link that shows the merged app.
- Not built, because the handoff leaves them undesigned (`handoff/docs/06-open-items.md`): the back end
  (MT5 sync, the real voice-note pipeline, chart reading, sign-in, server storage) and phone layouts
  beyond the fixes in `DESIGN.md`.
- The owner may like to run `/learn-taste` to capture their preferences from this session's corrections.

## Starting the next session
A good first message: "Read HANDOVER.md, CLAUDE.md and DESIGN.md, then wait for my next change."
