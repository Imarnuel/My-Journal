# Porting a screen from the prototype

Every screen starts as the prototype frame running inside the app (a working baseline), and is
ported to the shared store so every screen reads one dataset. `src/screens/Accounts.tsx` is the
reference port: read it first.

## What you have
- `src/screens/body/<Frame>.body.tsx`: the frame's page content (inside the shell) converted to JSX
  by `scripts/dc2tsx.py --body`. It reads everything from a values object `v`. Copy markup from here:
  it is pixel-exact (inline styles, class names from `src/styles/canvas.css`).
- `src/screens/logic/<Frame>.logic.ts`: the prototype's logic class. `baseVals()` computes `v`.
  This is the behaviour reference: every handler, every state, every toast.
- `src/screens/views/<Frame>.view.tsx`: the full frame including its own shell. Used only by the
  baseline (`/proto/<Frame>` routes still render the untouched prototype for side-by-side checks).
- `handoff/prototype/<Frame>.dc.html` and `cd handoff/prototype && python3 -m http.server 8765`: the
  original, if you need to click through it (port 8765 may already be running).

## Shared pieces (use them, don't duplicate them)
- `src/app/Shell.tsx`: `<Shell active="log">` renders the sidebar, the main card, the skip link and
  the toast region. Your screen renders only the page content as children.
- `src/data/store.ts` (zustand): entries, accounts, tags, weeks, setups, `picked` (account picker),
  `settings` (free-form key/value for set-once rules and preferences), and actions. **Do not edit
  `store.ts`, `seed.ts` or `src/lib/types.ts`**; other screens are being ported at the same time.
  If you need extra state, keep UI state in `useState`, and put persistent per-area state in your own
  zustand store under `src/data/<area>.ts`. `Entry` already has optional fields for notes, charts,
  numbers, headspace and the short-trade prompt; store them with `updateEntry(id, patch)`.
  If you truly need a shared-model change, say so in your final report instead of making it.
- `src/lib/calc.ts` and `src/lib/format.ts`: every formula and formatter (`fr()` gives `+2.1R` /
  `−1.0R` with U+2212). Unit tests in `src/lib/calc.test.ts`. Add tests in a new
  `src/lib/<area>.test.ts` for formulas you add (put new formulas in `src/lib/<area>.ts`).
- `src/screens/useKit.ts`: `useMenu()` (one menu open at a time: `kmenu` key), `useKit(menu)` (the
  account picker values `apOpen`, `apRows`, `apLabel`, `apReset`, `kClose` that the bodies expect).
- `src/components/primitives/toast.ts`: `toast(msg, undo?)`. One at a time, 6 seconds, Undo.
  Destructive or hiding actions happen at once and pass an `undo` that restores exactly.
- `src/components/primitives/ChoiceSelect.tsx`: a choice menu behind a secondary button.
- `src/components/primitives/menuKeys.ts`: keyboard for every `.kmenu` (arrows, Escape returns focus
  to the trigger, typing jumps). It relies on the prototype markup: the trigger has
  `aria-expanded="true"` while open and a transparent `aria-label="Close menu"` button sits behind
  the menu. Keep that markup.
- `src/app/routes.ts`: `slug()` for URL ids (setup names, account names).
- Chart placeholders: `<svg viewBox="0 0 320 180"><use href="#lx0" /></svg>` (sprite mounted once at
  the root). Uploaded charts are object URLs rendered as `<img>` with `object-fit: contain`.

## Rules
- Follow `CLAUDE.md` (root). Behaviour from `handoff/docs/01-decisions.md`, copy from
  `handoff/docs/07-screens-inventory.md`, states from `handoff/docs/03-screens.md`.
- Replace data the frame hard-codes (its own `E`/`E0` arrays, literal rows in the markup) with values
  computed from the store, so numbers follow periods, filters and accounts, and edits on one screen
  show on every other screen. With the seed data the screen must still match the screenshots.
- Links: use react-router `<Link>` / `useNavigate` with the routes in `src/app/App.tsx`, not
  `*.dc.html` hrefs.
- Keep markup, inline styles and class names from the body file unless a behaviour needs a change.
  No raw hex in new code: tokens only.
- Don't edit files owned by another screen. You own: your screen file(s) in `src/screens/`, new files
  you create, your tests. Don't edit `App.tsx` (routes are wired already), `Shell.tsx`, or shared
  primitives; if a shared primitive needs a fix, report it.
- Don't commit; the lead commits.

## Definition of done (check each, report honestly)
1. `tests/visual/<area>.spec.ts`: light and dark at 1440 × frame height against
   `handoff/screenshots/{light,dark}/NN-Frame.png` using `diffAgainst()` from
   `tests/visual/compare.ts`. Must pass (≤ 0.4% pixels differ).
2. `tests/behaviour/<area>.spec.ts`: Playwright tests for the behaviour in `03-screens.md` and
   `01-decisions.md` for this screen: every menu (opens, one at a time, outside click and Escape
   close, choosing sets the value), filters, Undo restoring exactly, navigation, keyboard. Reproduce
   the states listed for this screen in `03-screens.md` (`handoff/screenshots/states/NN-*.png`) and
   compare them visually where practical (`diffAgainst(page, "states/NN-name.png", info)`; use a
   looser `maxRatio` only if the difference is explained, and say so).
3. Accessibility: `@axe-core/playwright` on the screen has no serious or critical violations.
4. Reduced motion: the screen works with `page.emulateMedia({ reducedMotion: "reduce" })`.
5. `npx tsc --noEmit -p .` and `npx vitest run` pass.
Run Playwright with `npx playwright test <files> --trace off`. The dev server on port 5173 is shared
and reused (don't kill it).
