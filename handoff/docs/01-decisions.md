# Trading journal concept: decisions to check every change against

Canvas: https://claude.ai/artifact/9SsKH9vyMPxomtAWzLPtst

## Purpose
- Charts are the record. Tags, numbers and patterns exist only to help read them.
- Built for traders who quit journaling because it felt like work (Emmanuel has ADHD). Frictionless is the deciding principle.
- Realistic over ideal: only design what a real trader will actually use on an ordinary evening. If a feature sounds like pro practice but duplicates something already captured, or depends on data the user won't have, cut it.
- Think in systems: decide one rule per kind of surface (lists, numbers, recency, prompts) and one behaviour per kind of control, and apply it on every screen, instead of solving each screen on its own.
- Design behaviour, not just screens: nothing is done until every control's trigger and result, every state, and what persists are designed. On the canvas every control works.
- The core capture loop: drop the charts, talk it through once, and the AI turns that one voice note into a before/during note, a reflection and the tags. Every capture screen is built around that loop.
- AI only ever pre-fills. Every field in a story can be entered by hand with no AI involved: charts, both notes, Setup, Tags, Plan, Headspace, pair, direction, status, account, date and time, entry, stop, target, exit, size and result. Empty fields are real, visible controls, never placeholders that wait for AI. A voice note only fills fields the user hasn't set; it never overwrites a choice made by hand.
- Use standard microcopy that's true whether the AI or the user filled something in: "Notes", "Details". Never headings like "What we captured" that assume the AI did it.
- When learning from another app, take the concept, not its design pattern or visuals, unless Emmanuel asks for the pattern.
- Never hard-code Emmanuel's own approach (timeframes, setups, sessions, style).
- Design for traders who don't trade every day and take 1 or 2 trades when they do. Never assume a busy day or a daily routine: anything can be recorded any time.
- Done is the default and nothing piles up. No screen should make the user feel behind, especially after a loss.
- Don't make the system detect what the user's own habits already tell it.
- Calm screens come from careful structure, not from stripping things out: a clear order that matches how the screen is used, one thing to look at first, filled values shown as something to read (not forms to check), no helper text under every field. Keep side panels short; long text goes in the main column.
- One design per thing: when a layout is replaced, the old one is retired everywhere, not kept alongside.
- Look and feel: see `02-look-and-feel.md`. Typeface: Inter on every element, form controls and chart labels included. Light is the default theme.
- Design rules review: the UI/UX Pro Max rule set is used as a review lens. Where it conflicts with a decision here (confirm dialogs, 3 to 5 second toasts, 16px body and 44px controls on desktop), the decision here wins.

## One dataset
- Every screen is computed from one set of entries (taken, running, watched, not filled, analysis), each with date and time, pair, direction, account, setup, session, plan, tags, mistakes, reflection, charts and result. No screen keeps its own copy of the numbers, so filters, periods and accounts always show true results and every screen agrees.
- The canvas sample: 134 entries from November 2025 to 16 November 2026 (the canvas's "today"), 97 taken trades on real accounts plus a few practice ones.

## Behaviour kit (one behaviour per kind of control)
- Menus and dropdowns: one open at a time. The trigger toggles it; choosing an option sets it and closes the menu; a click anywhere outside closes it. The button shows the field's name until a value is picked, then the value.
- Filter menus show a count beside every option, computed with the other filters applied. Options that would leave nothing are dimmed, not hidden. "Clear filters" appears whenever any filter is set. A list that matches nothing says so and offers Clear filters.
- Choices (segmented controls, chips): one pressed at a time; the pressed state moves on click.
- Switches flip on click. A setting that takes effect at once is always a switch, never a checkbox (Practice account is a switch on both Add account and Edit account).
- Account picker: tick accounts in or out, "Only" on hover, Reset to default (real accounts). At least one stays ticked. It changes numbers only, never examples or recency.
- Destructive or hiding actions (delete, remove, exclude, archive, hide a prompt, merge): happen at once and show a toast with Undo for 6 seconds. No confirm dialogs. Deleting a whole story or account replaces the page with a deleted state that has Undo and a way back. Copy never says "can't be undone"; it says the action can be undone straight after.
- Navigation actions (Save story, Add account, Save changes, Skip for now) go to the screen they lead to.
- File drops: every drop zone is also a file picker. A chosen image appears where the chart would be.
- Long lists load in batches ("Show older entries", 12 at a time on the canvas; as you scroll in the real app).
- Selecting something that changes the whole page (a past week) scrolls back to the top.
- Charts: hover (or tap on touch) shows the readout; "View as table" in the chart's header swaps the chart for its numbers and "Show chart" swaps back.

## Small samples (one rule everywhere numbers appear)
- Fewer than 5 trades: no rates or averages, just the count, with "Too few trades for numbers" or "Too few to rate". On the dashboard, under 5 trades in the period the numbers give way to "Too few trades to read yet", with a button to widen the period.
- 5 to 19 trades in a setup: numbers show with an "Early signal" flag.
- The cumulative R line appears from 10 trades (last 20 trades).
- Patterns need 20 trades in the setup; any split where one side has fewer than 10 trades carries the early-signal dot.

## History in lists
- Lists never cut history off. Trade log, a setup's stories and the review's Past weeks show everything, newest first. Filters narrow a list; nothing is hidden by default.
- Long lists stay readable by grouping, not by limiting: month headers, older entries loading as you scroll, older months folding to one row where the list sits in a side column.

## Manual entry (no AI) checklist
- Charts: drop, paste or "+ Add" (file picker); reorder by drag or menu.
- Before / during and Reflection: two visible fields under "Talk it through", "Fills from your note, or write it yourself". Writing in them directly is the typing path (there is no separate "Type instead" box).
- Setup and Headspace: empty dropdowns ("Pick a setup", "Pick one"). Tags: empty tag field ("Add a tag"). Plan: toggle with nothing selected (tap the pressed option again to clear it).
- Pair, direction, status, account, date and time: each part of the facts line is a working menu or date-time picker. The session follows the time.
- Entry, stop, target, exit, size, result: shown as a numbers line with "Edit numbers", which opens six live inputs. Same on New chart story and the chart story page.
- Watched setups: their "would have" result can be typed in the Result field (not drawn yet).
- A story still needs at least one chart (no chart-less manual entry); MT5 trades without charts show a drop zone.

## Notes (from one voice note)
- One voice note per story. The AI writes two short summaries from it: Before / during (why the trade was taken and how it was managed) and Reflection (what to keep or change). The raw transcript is not the story's note.
- Recording: "Talk it through" starts listening with a timer, Cancel or Stop. Stop fills the notes and every detail the user hasn't set, and a toast lists what was filled, with Undo.
- Summaries are short, 1 to 3 lines, in the AI's own words. Both are editable in place, and both can be written by hand instead.
- Reflection: taken from what was said. If nothing reflective was said but a reflection can reasonably be inferred from the note, it is offered as a Suggested reflection (Keep / Delete). If nothing can be inferred, it stays empty and can be written. The AI never invents a lesson the note doesn't support. Editing a suggested reflection makes it yours.
- One note only. If the user recorded while the trade was running, the reflection comes from that same note; there is no second after-note prompt.
- Under the two notes: play and pause the voice note, "What you said" to show the transcript (with the words that became tags highlighted), and re-record (icon), which fills again only what is still empty.
- Placement: Notes sit in the main column, directly under the charts, on both New chart story and the chart story page. The side panel holds only Details, the trade facts and numbers, and the final button, so it stays short.
- Reflection replaces the old Lesson field. The playbook's Lessons tab is built from reflections on stories in that setup; the weekly review lists the week's reflections.

## Tags
- One Tags field covers quality, mistakes and context. There are no separate Mistakes, Location or Trigger fields.
- The note fills the tags; the user edits them in place: × on every pill (Undo), typing autocompletes from tags already used with how often, Enter adds the first match, Backspace on an empty field removes the last tag, and "Add "x" as a new tag" when nothing matches. The "Add a tag" prompt shows only when the field is empty. No picker list, no colour tints.
- Every tag carries a meaning, set once when the tag is first created: Good, Mistake or Neutral. Adding a brand-new tag asks this once, inline. The kind lives in the data, not in the tag's look. It powers the numbers: the dashboard's "Costliest mistakes" and the review's repeated mistakes use mistake-kind tags.
- Don't turn into tags what the app already knows: sessions come from trade time; plan adherence is the Plan field (Followed / Not followed), not "Perfect" or "Broke rules" tags.
- Every tag is a filter in the Trade log. Tags are for filtering and reading, not for automatic patterns, because they aren't on every trade.
- Settings shows one Tags group with its kind breakdown computed from the tags in use, plus Headspace (fixed list) and Plan (fixed). Manage tags opens the full list: rename in place, see kind and use count, remove (Undo). Look-alike tags get a Merge prompt. Renames and merges update old stories.

## Dashboard (the home screen)
- Shows what happened. The weekly review is where the user decides what to change. No insight text or advice on the dashboard.
- If any trade has no charts (known from MT5), one card leads the page with a drop zone; it leaves once a chart is added.
- "This week's focus": the takeaway from the latest review, one quiet line above the numbers, linking to that review.
- Every number in R or %, never money.
- Top row: Net R (with worst drawdown), Expectancy, Win rate (with average win and loss), Plan followed, Trades taken (with watched and not filled).
- R over time (cumulative R per trade, drawdowns shaded) and R by day; for 3 months it becomes R by week. Both have a hover or tap readout and "View as table".
- By setup (rows link to setup pages, Unsorted links to the playbook), By session, Costliest mistakes (R from trades with each mistake-kind tag).
- Win rate and expectancy only show once a row has 5 trades. Running, watched, not-filled and analysis entries stay out of every number.
- Recent chart stories: the last 6 stories with charts, whatever the period or accounts. Thumbnails with pair, direction chip, result and setup; no status flags.
- Controls: This week / This month (default) / 3 months, account picker, New chart story. Period and accounts change every number.

## Weekly review
- One page per week, built only from what was already recorded. No steps, no "Finish" ritual, no new fields, no grading, no AI insights or patterns, no money.
- Opens on the latest week the user traded (the week in progress isn't listed until it ends).
- Top: "The week before, you said" with the previous traded week's takeaway; hidden if that week had none.
- The week: Net R, trades taken (with watched and not filled), plan followed (x of y).
- Mistakes you tagged more than once that week, with the trades and the R they cost. Hidden if nothing repeated.
- Your trades: the week's chart cards (pair, direction, R, date, setup, "Not followed" when relevant), linking to each story; "Open in trade log".
- Your reflections: the week's reflections listed together, with pair and date; says so when there are none.
- One text box: "What I'll do differently next week". It saves as you type and marks the week reviewed. Only the latest week's takeaway shows on the dashboard; older weeks can still be written for the record.
- Past weeks: every week the user traded, with no limit. Each week shows its takeaway (or "Not reviewed"), trade count and R; clicking one loads that week and highlights it. Grouped under month headers: this month and last month open; older months fold to one row ("September · 4 weeks · 14 trades · +3.1R") that opens to its weeks; a year header appears when the list crosses into the previous year. Weeks without trades don't appear.
- The account picker changes every number and which weeks appear.
- One reminder on the chosen review day, only if the user traded that week. Skipped weeks just show "Not reviewed": no nagging, no backlog.
- The first week looks like any other week (no separate first-week screen).
- Anything still without charts closes when the week passes, as it is, with its numbers kept.

## Capture
- One chart story is one position. Re-entries and extra positions are separate stories; a screenshot that shows both can be added to both. The system never splits an upload.
- New chart story: main column has the charts (one large view plus the strip in the user's order), then Notes ("Talk it through" as the main action, with the two note fields under it). Side panel has Details (Setup, Tags, Plan, Headspace as real controls, "From your note, or set them yourself"), the trade facts line (each part tappable) with the numbers line and "Edit numbers", then Cancel and Save story.
- Status explains its options inside its menu (Taken counts in your results; Watched, Not filled and Analysis don't).
- Charts alone complete a story. Notes and after charts are extras and never count against the user.
- No dumping a whole day's screenshots.
- Statuses: Taken, Watched, Not filled, Analysis. Running is automatic while MT5 shows the trade open; when it closes, the user gets one chance to add an after chart, and skipping is fine.
- Analysis (pre-trade charts and a plan note) is just an entry with the Analysis status: it lives in the Trade log like anything else and never counts as a trade.
- A watched setup's result comes from what the user says in the note or types in Result; if neither, it has none. Never read from a picture.
- A trade from MT5 with no screenshot shows a drop zone in its row and the line "Scroll back on your chart and take one now. It still counts."
- Very short trades ask "Count it in your stats?" (Count it / Leave it out, both with Undo); ignoring it means it counts.
- Date and time on every entry, filled from screenshot time or MT5, always editable.
- No price data feed, no bar replay. The app cannot make an after chart itself.

## Charts in a story
- A story's charts are kept in the order the user added them. No roles (entry, context, after), no Entry badge, no automatic sorting.
- Reorder by dragging the whole tile, or each chart's menu: Move left, Move right, Remove (Undo). The first chart has no Move left, the last no Move right, and the last remaining chart can't be removed. That order is used everywhere.
- Layout: New chart story and the chart story page show the last chart large with the full strip under it (tap a thumbnail to view it large). Playbook examples show earlier charts as a small strip and the last two large. Thumbnails use the last charts.
- Timeframe captions are read only from the chart's legend (TradingView or MT5), normalised (240, 4h, H4 all become 4H), and shown only on a clean match. No inference from the time axis. An unread caption is simply blank: no flag, no check item, never blocks saving. Timeframes feed no stats; captions exist for small thumbnails.
- For non-MT5 accounts, every chart is scanned for a position box to read entry, stop and target. If prices can't be read, the user types them.

## Trade log (was Daily log, then Log)
- One list of everything recorded, whenever it was recorded. No day grouping, no week dividers, no day pager: nothing implies a daily pattern.
- Every entry shows its own date and time.
- Two views: List (rows with the last two charts) and Grid (cards led by the last chart). Toggle in the toolbar.
- Filters are all compact dropdowns, never inline segmented controls: Date (All time, This week, Last week, This month, Last 3 months, Pick dates with from and to), Pair, Setup, Tags, Direction (Long and short / Long / Short), Status (includes Running and Analysis). Sort: Newest first (default), Oldest first, Best R first, Worst R first.
- Each filter button leads with an icon (calendar, swap arrows, book, tag, up/down arrows, check circle, sort lines). It shows the filter's name until a value is picked, then the value. Date always shows its range.
- Entry count follows the filters.
- This is also how old trades are found; there is no separate stories library.
- Direction is never part of a story's name. The name is the pair; direction is a chip next to it and a selectable field on the story. Analysis entries show an Analysis chip instead.
- Older entries load as you scroll.
- Each entry's details read as facts with icons: date and time, status and account on the first line; setup, plan and tags on the second (or a one-line hint for running, watched, not-filled and chart-less entries). Each fact uses the same icon as its filter. No dot separators.
- No progress icons or completion flags, no progress bar, no "x of y complete", no yellow check flags, no backlog.
- The only actions on an entry: a drop zone when it has no charts, a quiet "Add a note" when it has none, and the row menu: Change date (date-time picker; the entry moves to its new place), Exclude from stats (becomes "Include in stats"; the row says "Excluded from stats"), Delete. All with Undo.
- The one prompt that needs an answer (a very short trade) sits above the list.
- MT5 last-synced shown in the header.

## Chart story
- One design and one component: New chart story (before and after the note) and the saved story are the same form with the same behaviour. Only the starting state and the footer differ.
- Header: back to Trade log; the pair with a direction chip; status · account · time span · session (all follow the facts); the result in R; a "···" menu: Pin as textbook / Unpin (adds a "Textbook example" label), Change date, Exclude from stats / Include in stats (shows a bar with "Include again"), Delete story (deleted state with Undo).
- Main column: one large chart with the strip of all charts under it, then Notes (Before / during, Reflection, voice note controls), then the linked analysis.
- Side panel: Details (Setup, Tags, Plan, Headspace, "Tap anything to change"), the trade facts line and numbers line with "Edit numbers" ("From your charts and MT5, or typed by you"), then Done ("Changes save as you make them").
- AI-filled fields stand unless the user changes them; nothing asks to be checked.
- No source dots or source legend.
- The analysis linked to a trade is labelled by its own date and time ("Your analysis before this trade · Mon 16 Nov, 07:30"), never "this morning".
- Bias is not a field; it comes from direction.
- Ghost fields, no edit icons; note boxes are visibly bordered text fields.

## Settings
- Appearance: System, Light (default), Dark.
- Your tags: see Tags.
- Weekly review: review day (menu), with one reminder that day only if the user traded that week.
- One gentle reminder (switch, time menu), triggered only when a trade from MT5 has no charts yet. Never daily, never more than one, nothing piles up.
- Time zone (menu) and session times: "Edit session times" turns the three sessions into time inputs, with Done and Reset to defaults.
- Voice note language (menu); Keep recordings (switch).

## Playbook
- A setup is context plus an entry model (e.g. a 15m QM is the entry; the higher-timeframe conditions are part of the setup).
- Setup rules are grouped: Context (higher timeframes), Entry (lower timeframe), Exit. Rules stay visible beside the examples. In the setup editor each rule is an editable field with × (Undo), and each group has "+ Add a rule".
- Every example in a setup's gallery is the whole chart story in the user's order: earlier charts as a small strip, the last two large. Examples come from every account, practice included; an example from an account not ticked in the picker names its account.
- Setup page: numbers follow the account picker; tabs Examples (default; filters All, Winners, Losers, Watched, Not filled, Textbook with counts; 6 at a time with "Show more"), Patterns, Lessons (built from reflections on stories in the setup). Tab counts are real.
- Patterns only appear once a setup has 20 trades, and only use data recorded on every trade (session, plan, whether the stop was moved). Until then the tab says how many trades so far.
- Results in R, never dollars. Each setup shows a small cumulative-R line over its last 20 trades (from 10 trades onward).
- Every setup has a menu: Rename (inline, Save or Cancel), Edit rules, Archive (keeps its stories and examples; Restore from the collapsed Archived group), Delete (its stories move to Unsorted; Undo).
- Unsorted holds stories that fit no setup and suggests naming new ones; "Not now" hides the suggestion until more stories look alike. "Name this setup" opens a short dialog for the name, then goes on to the rules.

## Accounts and MT5
- MT5 is optional and only fills each trade's numbers. Read-only investor password. Login and password fields allow password managers and paste.
- MT5 syncing cost: local script on the user's Windows terminal or MT5's history export are free; cloud sync (e.g. MetaApi) has a free personal tier, then paid per account. Decide at build time.
- Accounts are user-named with flexible types (Live, Prop firm, Demo, Backtest, or your own); practice accounts stay out of numbers by default but always feed the playbook. Choosing Demo or Backtest switches Practice on for you; it can be changed.
- Set-once rules: default account for screenshots, and what happens to copied trades (Attach to both, Only the first account, Ask me each time). Never ask during logging.
- Account picker only where numbers are filtered: Dashboard, Playbook, setup page and Weekly review.
- Archived accounts sit in a collapsed group with Restore. Archiving from the edit page shows a bar with Restore; deleting shows a deleted state with Undo.

## Declined or removed
- Removed until their value is clear: blind replay, chart stories library (the Trade log's filters cover finding old trades).
- Considered and declined: automatic risk per trade, best trade of the day, checking trades against the morning plan, monthly playbook check, sharing setups, dollar-based stats, trade tables without charts, composite scores, customisable widgets, editable timeframe or role labels, detecting chart roles, splitting one upload into several stories, a day-by-day pager, grouping the log by day, source dots, separate Location, Trigger and Mistakes fields, a daily reminder, session tags, plan tags, a tag picker list, coloured tag kinds, a second after-note prompt, a separate Lesson field, chart-less stories, process grading in the review, hidden results while reviewing, playbook tidying inside the review, trade-count review cadence, AI insights or patterns in the weekly review, a step-by-step review, a separate first-week review screen, a fixed cap on how many past weeks are shown, confirm dialogs, a frosted sidebar in the browser.

## Still open (from the design rules review)
- Phone frames (390px) for New chart story, Trade log and Story.
- Add account error states (wrong login, wrong server, failed test) and a show/hide toggle on the password.
- Dashboard loading and "couldn't load" states.
- A text search across notes in the Trade log (optional; filters already cover pairs, setups and tags).
- Dashboard layout: what leads, and whether the no-charts notice and focus line sit above the numbers.

## Working rule
After any change, check every screen against this list and fix knock-on effects before reporting. Think in systems: when a question comes up about one screen, answer it as a rule for every screen of that kind. Design each control's behaviour along with its look: trigger and result, every state, and what persists. Then click through it.
