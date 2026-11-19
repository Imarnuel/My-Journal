# Build plan

## Stack (recommended)
- **React + TypeScript + Vite** (or Next.js App Router if server rendering is wanted later). Client-side routing with the routes in `03-screens.md`.
- **Tailwind CSS** with `design-tokens/tailwind.config.ts`, and `design-tokens/tokens.css` imported once at the root.
- **Radix UI primitives** for Menu, Popover, Dialog, Select, Switch, Tooltip, Toast (keyboard and focus handling for free), styled with the tokens.
- **Motion** (Framer Motion) for layout/FLIP, sheets and springs; CSS transitions for hover, press and colour.
- **lucide-react** icons, size 16, strokeWidth 1.8, wrapped once.
- **Inter** self-hosted: `@fontsource-variable/inter`, latin subset preloaded, `font-variant-numeric: tabular-nums` on the root.
- **Charts:** hand-drawn SVG (as the prototype does), not a chart library. The line chart is straight segments, the drawdown and area fills are paths, hover readouts are HTML overlays.
- **Data:** start with a local store seeded from `data/entries.json` (e.g. Zustand or React context), with "today" fixed to 16 November 2026 so numbers match the screenshots. Persistence, auth, MT5 sync and the voice-note AI are later phases (see `06-open-items.md`).
- **Testing:** Playwright for visual diffs and behaviour, axe for accessibility.

## Folder structure
```
src/
  styles/tokens.css          (from design-tokens/tokens.css)
  styles/globals.css         (Tailwind layers, base styles)
  lib/tokens.ts              (from design-tokens/tokens.ts)
  lib/format.ts              (fr(): +2.1R / −1.0R with U+2212, dates "Mon 16 Nov, 09:45")
  lib/calc.ts                (all formulas in 05-data-and-calculations.md)
  data/seed.ts               (loads data/*.json)
  components/primitives/     Button, IconButton, SegmentedControl, Menu (action and choice), Popover, Dialog, Sheet,
                             Toast (with Undo), Input, TextArea, Select, Switch, TagField, Card, StatGroup, Notice,
                             Facts (icon + text items), ChartFrame, Skeleton, Medallion, SidebarNav, AccountPicker,
                             DropZone, Pill, DirectionChip, Table
  components/charts/         EquityLine, RByDay, Sparkline, BreakdownBar, ChartTable
  screens/                   Start, Dashboard, TradeLog, ChartStory (new and saved), Playbook, SetupPage, SetupEditor,
                             WeeklyReview, Accounts, AddAccount, EditAccount, Settings
  app/Shell.tsx              sidebar, main card, skip link, toast region
tests/visual/                one spec per screen, light and dark
tests/behaviour/             one spec per screen from the decisions list
```

## Phases
Each phase ends with its checks passing. Don't start the next phase with failing checks.

1. **Foundations.** Tokens, Tailwind config, Inter, globals, the Shell (sidebar, main card, skip link), theme switching (System/Light/Dark, set before first paint). Check: an empty page in light and dark matches the shell in `screenshots/light/02-Dashboard.png` and `screenshots/dark/02-Dashboard.png` (sidebar, ground, main card, radii, shadows).
2. **Primitives.** Every component in `components/primitives`, with every state (rest, hover, pressed, focus-visible, disabled, loading). Build a `/dev/primitives` page showing them all in both themes. Check against `design-tokens/canvas-stylesheet.css` and `02-look-and-feel.md` section 11; heights 32/28/34, radii, type and spacing exactly as specified.
3. **Data and calculations.** Seed store, `calc.ts`, `format.ts`. Unit-test every formula against the numbers in the screenshots (for example, Dashboard This month: Net R +7.6R, Expectancy +0.38R, Win rate 50%, Plan followed 70%, Trades taken 20).
4. **Screens, in this order:** Trade log (03, 04), Chart story (05, 06, 07), Dashboard (02), Playbook (08), Setup page (09), Setup editor (10), Weekly review (11), Accounts (12, 13, 14), Settings (15), Start (01), then the states in frame 16 inside their screens. For each screen: build, then reproduce its states from `screenshots/states/`, then click through the prototype side by side.
5. **Motion and polish.** Section 12 of `02-look-and-feel.md`: menus grow from their trigger, dialogs rise, toasts, segmented slide, FLIP list moves, number count-ups, chart draw-in and morph, reduced motion.
6. **Accessibility pass.** Section 14 of `02-look-and-feel.md`; axe clean; keyboard-only run through every screen.

## Visual check (required for every screen)
Run the prototype and the app side by side and diff full-page screenshots at 1440px wide:
```ts
// tests/visual/dashboard.spec.ts (sketch)
test('dashboard light', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('02-Dashboard.png', { fullPage: true, maxDiffPixelRatio: 0.01 });
});
```
Seed the expected images from `screenshots/light/` and `screenshots/dark/` (copy them into the snapshot folder with matching names). Differences beyond anti-aliasing are bugs in the build, not in the screenshots. Fonts must be Inter for the diff to be meaningful.

## Behaviour check (required for every screen)
For each screen, write tests from `01-decisions.md` and `03-screens.md`. At minimum:
- every menu: opens, one at a time, closes on outside click and Escape, choosing sets the value and closes;
- every filter: counts with other filters applied, dimmed options, Clear filters;
- every destructive action: happens at once, toast with Undo for 6 seconds, Undo restores exactly;
- the voice note fills only empty fields, and Undo restores them;
- period and account changes update every number on the page.

## Things that are easy to get wrong
- The type scale is Tailwind's (12/16, 14/20, 16/24, 24/32). No 13px or 15px anywhere.
- Spacing is only 2, 4, 8, 12, 16, 24, 32, 48. Cards are padded 24px, list rows 16px 24px.
- `--text-3` steps up to `--text-2` on selected and pressed backgrounds.
- Results use colour at weight 500, never bold.
- The R over time line uses straight segments, not a smoothed curve.
- A chart screenshot is never recoloured for the theme.
- Direction is never part of a story's name; it's a chip.
- Practice is a switch on both Add account and Edit account.
- "This can't be undone" never appears: every delete has Undo.
