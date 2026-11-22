# CLAUDE.md: trading journal

You are building a trading journal web app from an approved design. The goal is a build that looks and behaves exactly like the design: same layout, same copy, same sizes, same colours, same behaviour. Don't redesign, simplify, "improve" or add features.

The full design handoff lives in `handoff/`. Every path below is relative to it unless it starts with `src/` or `tests/`.

## Read first, in this order
1. `handoff/docs/04-build-plan.md` (stack, structure, phases, checks)
2. `handoff/docs/01-decisions.md` (behaviour rules for every screen and control)
3. `handoff/docs/02-look-and-feel.md` (every visual value)
4. `handoff/docs/03-screens.md` (screen map and states)
5. `handoff/docs/05-data-and-calculations.md` (data model and formulas)
6. `handoff/docs/06-open-items.md` (what is not designed)

Keep `handoff/docs/07-screens-inventory.md`, `handoff/screenshots/` and `handoff/prototype/` open while building each screen. Run the prototype with `cd handoff/prototype && python3 -m http.server 8765`.

## Order of authority
0. `DESIGN.md` (root): the owner's corrections after the handoff. It wins over everything below, including
   this file. When the owner corrects a design choice, add the rule there with its reason, and approve the new
   reference images (`tests/visual/approved/README.md`). Read its "Principles (every screen)" first.
   **Keep this file in step:** if a correction changes anything stated in this file (a value, a weight, a
   rule), update the line here in the same commit so the two never disagree.
1. `01-decisions.md` wins on behaviour.
2. The prototype and screenshots win on exact pixels, layout and copy.
3. `02-look-and-feel.md` explains the system behind those values and covers motion, hover, focus and phone.
4. The installed skills (below) are the quality bar for anything the handoff doesn't specify. Where a skill and the handoff disagree, the handoff wins; note the difference.

If something isn't covered anywhere, it's in `06-open-items.md` or it's a gap: ask, don't invent.

## Who it's for
Traders who quit journaling because it felt like work. The owner has ADHD. Frictionless is the deciding principle. Calm screens, nothing that nags, nothing that piles up, done is the default.

## Non-negotiables
- **Match the screenshots.** Every screen at 1440px wide must match `screenshots/light/` and `screenshots/dark/`, or the owner's approved image in `tests/visual/approved/` where one exists (it replaces the handoff screenshot once the owner has changed that screen). Compare with a visual diff, not by eye alone.
- **Copy is exact.** Use the wording in `07-screens-inventory.md` and the prototype. Sentence case. Results always in R with a sign and a real minus (−, U+2212), never money.
- **Tokens only.** Colours, shadows, radii, heights and motion come from `src/styles/tokens.css`. No raw hex in components.
- **Type: four sizes, plus the page title.** `text-xs` (12/16), `text-sm` (14/20), `text-base` (16/24), `text-2xl` (24/32, figures at `--tracking-figure`, 0); page titles only at 28/32. Weights 400 and 500; 600 only at 24px figures and the primary button (a selected segment stays 500, DESIGN.md). Instrument Serif 400 for page titles at 28px (`--title-size`; 24px if titles ever use the body face), Inter (variable, optical sizes) for everything else at Inter's own spacing (`--tracking-body` 0) with no forced font smoothing (DESIGN.md › Typeface), tabular figures on.
- **Spacing: eight steps only.** Tailwind `0.5 1 2 3 4 6 8 12` (2 4 8 12 16 24 32 48px).
- **Controls are 32px tall** (segments 28px, menu rows 34px). Radii come from the `--r-*` tokens only: 7px chips, 8px small buttons and segments, 10px controls and fields, 12px segment tracks, 16px cards and menus, 18px the main card, 20px dialogs, drawn as continuous (Apple-style) corners where the browser supports it (DESIGN.md › Corners). `src/styles/taste.test.ts` fails on a hard-coded radius.
- **Light is the default theme.** Dark is a full equal. Appearance: System, Light, Dark.
- **One behaviour per kind of control** (the behaviour kit in `01-decisions.md`): one menu open at a time, click outside closes, destructive actions happen at once with an Undo toast for 6 seconds, no confirm dialogs.
- **AI only pre-fills.** Every field can be set by hand. A voice note never overwrites a choice made by hand.
- **Icons:** Lucide, 16px, stroke 1.8, using the names in `design-tokens/icons/ICONS.md`, where `02-look-and-feel.md` section 10 or DESIGN.md says. DESIGN.md adds icons in several places and sets the filled 14px Details and stat icons.
- **Accessibility as drawn:** skip link, labelled fields, 24px minimum targets, focus rings, "View as table" on charts, reduced motion.
- **Never build anything on the "Declined or removed" list** in `01-decisions.md`.

## Skills are mandatory
The installed skills live in `.agents/skills/` (linked into `.claude/skills/`). Load the relevant one before doing the work it covers, not after.

| When you are… | Load / read |
| --- | --- |
| Building or reviewing any component's interactions, states, or polish | `emil-design-eng` |
| Gestures, drag/swipe/sheets, springs, materials, typography | `apple-design` |
| Several elements animating together (lists, entrances, view swaps) | `choreograph` |
| Choosing what property to animate, or anything janky | `animation-performance` |
| Phone layouts, touch, inputs, safe areas | `mobile-native` |
| Naming a motion effect | `animation-vocabulary` |
| Adding a dependency the build plan doesn't name | read `.agents/skills/pick-ui-library/SKILL.md` |
| Finishing a feature with motion | read `.agents/skills/review-animations/STANDARDS.md` and check against it |
| Auditing motion across the app | `improve-animations`, `find-animation-opportunities`, `remove-animations` |
| Redesigning a section, or asked to make something look better | `anthropic-skills:mobbin-ui-research` (see Working rules) |

`pick-ui-library`, `review-animations`, `prototype` and `learn-taste` can only be invoked by the user (`/name`), but their files are plain guidance: read them directly when the table says so. Suggest `/learn-taste` at the end of a session with several design corrections. `write-swift` doesn't apply.

Library choices: the build plan names Radix UI primitives, Motion, lucide-react and hand-drawn SVG charts, so those win over the `pick-ui-library` list. Use the list only for needs the build plan doesn't cover.

## Writing rules for any copy you must add
- No em dashes. Use commas, full stops or colons.
- Plain, standard microcopy that's true whether the AI or the user filled something in.
- If a screen needs text the design doesn't have, ask. Don't invent.

## Working rules
- **Research before a visual redesign.** When the owner asks to make a section look better, restyle it, or
  find inspiration, search Mobbin first (`mobbin-ui-research` skill, web platform), as a senior product
  designer would. Show the owner the references you'd draw from, each with its Mobbin link, and say what
  you'd take from each. Then propose one direction that fits this app's own style (tokens, calm, Instrument Serif and Inter,
  DESIGN.md principles), never a copy of another app, and build it on the owner's yes. Record the references
  in the DESIGN.md section for the change. Small, exact corrections ("make it 12px") don't need research, and
  neither do fixes to spacing, clutter or a single control: use your own judgement there (the owner,
  2026-11-22: "don't use mobbin, use your head"). Keep Mobbin for real redesigns of a section or a new
  experience, or when the owner asks for it.
  <!-- 2026-11-20, the owner: "add the Mobbin research as a standing instruction"; earlier: "check mobbin for inspiration… you're a senior product designer with 20+ years of experience" -->
- Think in systems: one rule per kind of surface and control, applied on every screen. If you fix something on one screen, fix it everywhere it appears.
- Design behaviour, not just looks: every control needs its trigger, result, every state, and what persists. The prototype shows them; click through it.
- After any change, check every affected screen against the screenshots and the decisions list before reporting.
- When something in the design seems wrong, raise it. Don't silently change it.
- Work in phases from the build plan. Each phase ends with its checks passing; commit and push after each slice. Don't stop to ask permission between slices.

## Definition of done for a screen
1. Visual diff against `screenshots/light/NN-Screen.png` and `screenshots/dark/NN-Screen.png` (or the approved image in `tests/visual/approved/` that replaces it) at 1440 × frame height shows no layout difference (anti-aliasing noise only).
2. Every state in `screenshots/states/` for that screen is reproduced (or its approved image; state 19 is retired, see DESIGN.md › Chart tiles).
3. Every control in the inventory works as `01-decisions.md` describes, including Undo and keyboard use.
4. Numbers match the screenshots when seeded with `data/entries.json` and "today" set to 16 November 2026.
5. Passes axe (no serious issues), keyboard-only use, and `prefers-reduced-motion`.
6. Motion checked against `review-animations/STANDARDS.md`: transform/opacity only, no `ease-in` on entering UI, interruptible, nothing on keyboard-triggered actions.

## Live preview for the owner
The owner looks at the app at https://claude.ai/artifact/Lnqrd7dbSJgF2Q8DRExLt6 (private claude.ai page).
After every change the owner should see, and before reporting it done: run `npm run build:artifact`, then
republish `dist-artifact/journal.html` with files `assets/app.js` and `assets/app.css` to that URL (Artifact
tool, `url` set to the link above when it's a new session). That build routes in memory (the page can't own
the address bar) and inlines the fonts.

## Tooling
- Vite + React + TypeScript (strict), Tailwind, Vitest for units, Playwright for e2e and visual diffs (`--trace off`). Chromium is preinstalled; never run `playwright install`.
- `npm run dev`, `npm test` (units), `npm run e2e` (Playwright).
