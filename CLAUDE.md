# My-Journal — instructions for Claude

These rules apply to every session in this repository. Follow them without being reminded.

## 1. Source of truth

- **`SPEC.md` is the product prompt.** Read it before starting any work. Build what it says and nothing more. If it is silent on something, use the defaults in section 4. Ask only when a wrong guess would be expensive to undo, such as a data model, auth, or a paid service.
- When the user corrects a design choice, write the rule into `DESIGN.md` immediately, with its reason, so the correction never has to be repeated.
- `DESIGN.md` (once it exists) overrides the general skill guidance where they conflict.

## 2. Skills are mandatory, not optional

The installed skills live in `.agents/skills/` (linked into `.claude/skills/`). Load the relevant one before doing the work it covers, not after.

| When you are… | Load / read |
| --- | --- |
| Building or reviewing any component's interactions, states, or polish | `emil-design-eng` |
| Gestures, drag/swipe/sheets, springs, materials, typography | `apple-design` |
| Several elements animating together (lists, entrances, view swaps) | `choreograph` |
| Choosing what property to animate, or anything janky | `animation-performance` |
| Anything that runs on a phone (this is a web app, so: everything) | `mobile-native` |
| Naming a motion effect | `animation-vocabulary` |
| Adding a dependency | read `.agents/skills/pick-ui-library/SKILL.md` and use its pick |
| Finishing a feature with motion | read `.agents/skills/review-animations/STANDARDS.md` and check against it |
| Planning/auditing motion across the app | `improve-animations`, `find-animation-opportunities`, `remove-animations` |

`pick-ui-library`, `review-animations`, `prototype`, and `learn-taste` can only be *invoked* by the user (`/name`), but their files are plain guidance: **read them directly** whenever the table above says so. Suggest `/prototype` when a UI piece has no clear design yet, and `/learn-taste` at the end of a session with several design corrections.

`write-swift` does not apply to this web app.

## 3. Definition of done (tests come from the skills)

A feature is done only when all of these pass. Encode each as an automated Playwright test where possible; otherwise check it by hand and say so.

- **Unit/integration tests** for logic, and **Playwright e2e tests** for each user flow. Run them before reporting done; report failures with output, never hide them.
- **Mobile (`mobile-native`):** test at a phone viewport (e.g. iPhone 13 device preset). No horizontal scroll; inputs ≥16px font (no zoom on focus); safe-area insets respected; no sticky hover (hover styles gated by `@media (hover: hover) and (pointer: fine)`); tap targets ≥44px; uses `dvh`/`svh`, not bare `100vh`.
- **Motion (`review-animations` STANDARDS):** only `transform`/`opacity` animated unless a documented exception; custom ease-out curves, no `ease-in` on UI; UI durations under ~300ms; no animation on keyboard-triggered or high-frequency actions; animations are interruptible.
- **Reduced motion:** a test with `reducedMotion: 'reduce'` confirms motion is gentler (not necessarily zero) and nothing breaks.
- **Accessibility:** keyboard reachable, visible focus, labelled controls; run an axe check in e2e.
- **Visual check:** take a screenshot at desktop and phone width and look at it before saying the UI is done.

## 4. Defaults (use unless SPEC.md says otherwise — don't ask)

- Vite + React + TypeScript, strict mode. Styling: Tailwind CSS with `clsx` + `cva`.
- Libraries from `pick-ui-library` only (base-ui, motion, Sonner, Vaul, cmdk, zustand, etc.).
- Easing/duration live as shared CSS tokens in one file (e.g. `src/styles/tokens.css`); never hand-type a curve in a component.
- Tests: Vitest for units, Playwright (`--trace off`) for e2e. Chromium is preinstalled; never run `playwright install`.
- Package manager: npm. Node LTS.
- Persistence: local-first (IndexedDB) until the spec asks for a backend.

## 5. Working style

- Work in small, complete vertical slices: build → test → screenshot → commit → push. Commit after each slice with a clear message.
- Don't stop to ask for permission between slices; keep going until the spec is done or you are genuinely blocked. When blocked, say exactly what you need in one message.
- Keep the final report short: what was built, test results, what was not done and why.
