# Screen map

Sixteen frames. Fifteen are product screens; frame 16 is a sheet of empty and problem states shown inside other screens. All frames are drawn at 1440px wide, light theme by default.

The routes are suggestions; keep them unless the stack makes them awkward.

| # | Frame (prototype file) | Screen | Suggested route | Sidebar item |
|---|---|---|---|---|
| 01 | `Start.dc.html` | First run: connect an account, add setups, log the first trade | `/start` | none |
| 02 | `Dashboard.dc.html` | Dashboard (home) | `/` | Dashboard |
| 03 | `Main.dc.html` | Trade log, List view | `/log` | Trade log |
| 04 | `MainCal.dc.html` | Trade log, Grid view, with the Date filter open | `/log?view=grid` | Trade log |
| 05 | `NewStory.dc.html` | New chart story, before the voice note (empty Details) | `/new` | Trade log |
| 06 | `NewStoryTyped.dc.html` | New chart story, after the note (or after typing): notes and Details filled | `/new` (same screen, later state) | Trade log |
| 07 | `Story.dc.html` | A saved chart story | `/story/:id` | Trade log |
| 08 | `PlaybookHome.dc.html` | Playbook: setups, Unsorted, Archived | `/playbook` | Playbook |
| 09 | `Playbook.dc.html` | Setup page: stats, rules, Examples / Patterns / Lessons | `/playbook/:setup` | Playbook |
| 10 | `SetupEdit.dc.html` | Setup editor (new setup, or Edit rules) | `/playbook/:setup/edit`, `/playbook/new` | Playbook |
| 11 | `Review.dc.html` | Weekly review, with Past weeks | `/review/:week` | Weekly review |
| 12 | `Accounts.dc.html` | Accounts list, Archived group, and the set-once rules (default account for screenshots, copied trades) | `/accounts` | Accounts |
| 13 | `AddAccount.dc.html` | Add an account (types, Practice, MT5) | `/accounts/new` | Accounts |
| 14 | `EditAccount.dc.html` | Edit an account (MT5 status, Archive, Delete) | `/accounts/:id` | Accounts |
| 15 | `Settings.dc.html` | Settings: Appearance, Weekly review, Reminders, Time and sessions, Your tags, Voice notes | `/settings` | Settings |
| 16 | `States.dc.html` | Empty and problem states (not a route) | n/a | n/a |

Screenshots: `screenshots/light/NN-Frame.png` and `screenshots/dark/NN-Frame.png` (full page). Exact copy and controls per screen: `docs/07-screens-inventory.md`.

## Shared shell (every screen except 16)
- Sidebar on the window ground: wordmark "Journal" (16/600) with its mark, then Dashboard, Trade log, Playbook, Weekly review, Accounts, Settings. Active item uses `--surface-pressed`.
- Main card inset 8px from the window (not on the sidebar side), radius 14px, padding 32px (48px at the bottom). Page content max 1080px, centred, sections 32px apart.
- Page header: title (`text-2xl`), a one-line subtitle in `--text-2`, actions on the right.
- Skip link "Skip to main content" is the first focusable element.
- One toast region (bottom centre). One menu open at a time.

## States to reproduce (screenshots/states)

| # | File | Screen | How to reach it |
|---|---|---|---|
| 01 | dashboard-account-picker | Dashboard | Click "3 accounts" |
| 02 | dashboard-period-3-months | Dashboard | Click "3 months" (R by day becomes R by week) |
| 03 | dashboard-line-chart-hover | Dashboard | Hover a point on R over time |
| 04 | dashboard-bar-chart-hover | Dashboard | Hover a bar on R by day |
| 05 | dashboard-charts-as-tables | Dashboard | "View as table" on both charts |
| 06 | dashboard-skip-link-focused | Dashboard | Press Tab once |
| 07 | tradelog-date-filter-open | Trade log | Date filter |
| 08 | tradelog-date-pick-dates | Trade log | Date filter, Pick dates |
| 09 | tradelog-setup-filter-open | Trade log | Setup filter (counts beside options) |
| 10 | tradelog-row-menu-open | Trade log | Row menu (more icon) |
| 11 | tradelog-change-date-dialog | Trade log | Row menu, Change date |
| 12 | tradelog-excluded-with-undo-toast | Trade log | Row menu, Exclude from stats |
| 13 | tradelog-grid-view | Trade log | Grid |
| 14 | tradelog-short-trade-counted-toast | Trade log | "Count it" on the very short trade prompt |
| 15 | newstory-setup-menu-open | New chart story | Setup dropdown |
| 16 | newstory-recording | New chart story | Talk it through (recording, timer, Cancel, Stop) |
| 17 | newstory-after-voice-note-filled | New chart story | Stop: notes and empty Details filled, toast lists what was filled, Undo |
| 18 | story-more-menu-open | Story | More (header) |
| 19 | story-chart-menu-open | Story | A chart's menu: Move left, Move right, Remove |
| 20 | story-edit-numbers-open | Story | Edit numbers (six live inputs) |
| 21 | story-pinned-textbook | Story | More, Pin as textbook |
| 22 | story-excluded-bar | Story | More, Exclude from stats (bar with Include again) |
| 23 | story-deleted-state | Story | More, Delete story (deleted state with Undo) |
| 24 | story-headspace-menu-open | Story | Headspace dropdown |
| 25 | playbook-setup-menu-open | Playbook | A setup's menu |
| 26 | playbook-name-this-setup-dialog | Playbook | "Name this setup" on Unsorted |
| 27 | playbook-archived-setups-open | Playbook | Archive a setup, open Archived setups |
| 28 | setup-losers-filter | Setup page | Losers filter |
| 29 | setup-patterns-tab | Setup page | Patterns tab |
| 30 | setup-lessons-tab | Setup page | Lessons tab |
| 31 | setup-editor-rule-removed-toast | Setup editor | Remove a rule (Undo toast) |
| 32 | review-past-month-expanded | Weekly review | Open a folded month in Past weeks |
| 33 | review-past-week-selected | Weekly review | Pick a past week |
| 34 | accounts-archived-open | Accounts | Archived (2) |
| 35 | addaccount-demo-chosen-practice-on | Add account | Choose Demo: Practice switches on |
| 36 | editaccount-deleted-state | Edit account | Delete (deleted state with Undo) |
| 37 | settings-review-day-menu | Settings | Review day |
| 38 | settings-edit-session-times | Settings | Edit session times |
| 39 | settings-manage-tags | Settings | Manage tags |
| 40 | settings-tags-merged-toast | Settings | Merge look-alike tags |

The prototype shows more states than these; click through every control. If a state appears in the prototype but not here, the prototype is the reference.

## Notes per screen (what a screenshot can't tell you)

**Dashboard.** Period (This week / This month default / 3 months) and accounts change every number. The no-charts notice appears only when a trade from MT5 has no charts and leaves once a chart is added. "This week's focus" is the latest review's takeaway. Under 5 trades in the period, the numbers give way to "Your numbers start after 5 trades" (frame 16). Win rate and expectancy show only from 5 trades. Charts draw in once on first load, then morph on change.

**Trade log.** Filters are dropdowns with counts computed with the other filters applied; options that would leave nothing are dimmed. "Clear filters" appears whenever a filter is set. Sort menu. List / Grid toggle. "Show older entries" loads 12 more on the canvas (infinite scroll in the app). Each row: pair, direction chip, result; facts with icons; the last two charts; "Add a note" when there's none; row menu. A trade from MT5 without charts shows a drop zone in its row.

**New chart story and Story.** One component. Main column: large chart, strip of all charts in the user's order (drag to reorder, or each chart's menu), then Notes (Talk it through, Before / during, Reflection, play, What you said, re-record), then the linked analysis. Side panel: Details (Setup, Tags, Plan, Headspace), facts line (each part is a menu or picker), numbers line with Edit numbers, then Cancel and Save story (new) or Done (saved: changes save as you make them).

**Playbook and setup page.** Account picker changes numbers only, never examples. Examples show 6 at a time with "Show more". Patterns appear only from 20 trades; until then the tab says how many so far. Every setup has Rename (inline), Edit rules, Archive, Delete.

**Weekly review.** Opens on the latest week the user traded. One text box ("What I'll do differently next week") saves as you type. Past weeks: every traded week, grouped by month, older months fold to one row.

**Accounts.** Choosing Demo or Backtest switches Practice on. Archive shows a bar with Restore; Delete shows a deleted state with Undo.

**Settings.** Appearance changes the theme instantly. Edit session times turns the three sessions into time inputs with Done and Reset to defaults. Manage tags: rename in place, kind and use count, remove with Undo; look-alike tags get a Merge prompt.
