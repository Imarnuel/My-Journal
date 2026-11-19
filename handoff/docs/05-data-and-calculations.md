# Data and calculations

Every screen is computed from one set of entries. No screen keeps its own copy of the numbers, so filters, periods and accounts always agree across screens.

## Sample data (data/)
Seed the app with these so the build shows exactly the numbers in the screenshots. The canvas's "today" is **Monday 16 November 2026**; fix the clock to it in development and tests.

| File | Contents |
|---|---|
| `entries.json` | 134 entries, November 2025 to 16 November 2026: 100 Taken, 24 Watched, 8 Not filled, 1 Running, 1 Analysis |
| `weeks.json` | Each week's Monday, its review takeaway (or null), watched and not-filled counts |
| `accounts.json` | Real accounts (Main account, Funded 100K, Challenge 50K), practice accounts (Demo account, Backtesting), default for screenshots |
| `tags.json` | Tags by kind (good, mistake, neutral) and the tag list with use counts as Settings shows it |
| `playbook-examples.json` | The entries in the short form the playbook screens use (`d` date, `p` pair, `dir`, `st` status, `a` account, `r` result, `s` setup, `se` session, `f` followed, `m` mistakes, `x` excluded, `c` chart key, `tb` textbook) |
| `meta.json` | Canvas today, this week's Monday, pairs, frame heights |
| `chart-placeholders.svg` | The placeholder chart drawings used on the canvas. In the app, charts are the trader's own screenshots |

Archived accounts on the Accounts screen (Challenge 25K, Funded 50K) are only in the prototype (`prototype/Accounts.dc.html`).

## Entry
```ts
type Status = 'Taken' | 'Running' | 'Watched' | 'Not filled' | 'Analysis';
type Entry = {
  id: string;
  date: string;          // 'YYYY-MM-DD'
  time: string;          // 'HH:MM', local to the user's time zone setting
  pair: string;          // 'GBPUSD'; an Analysis entry may cover two: 'GBPUSD, XAUUSD'
  dir: 'Long' | 'Short' | null;   // null for Analysis
  status: Status;        // Running is set automatically while MT5 shows the trade open
  account: string;       // account name
  also: string | null;   // a second account the same screenshots were attached to (copied trades)
  setup: string;         // setup name, or 'Unsorted'
  session: 'Asia' | 'London' | 'New York';   // derived from time and the session times in Settings
  followed: boolean | null;   // Plan: Followed / Not followed / not set
  tags: string[];        // one Tags field; each tag has a kind (Good, Mistake, Neutral) stored on the tag, not the entry
  mistakes: string[];    // the entry's mistake-kind tags (derived from tags + tag kinds)
  r: number | null;      // result in R; Taken only (Watched may have a typed "would have" result)
  charts: number;        // number of charts; 0 for an MT5 trade without screenshots
  note: boolean;         // has a voice note
  refl: string | null;   // Reflection
  plan: string | null;   // Analysis entries: the plan note
  mt5: string | null;    // MT5 ticket, '#48231'
};
```
Fields the app needs that the sample doesn't carry: the two notes' text (Before / during, Reflection), the voice note audio and transcript, chart images and their order and captions, entry/stop/target/exit/size, excluded-from-stats, textbook pin, and tag kinds. See `01-decisions.md` (Notes, Charts in a story, Manual entry).

## What counts
- Only **Taken** entries count in numbers. Running, Watched, Not filled and Analysis never count.
- An entry **excluded from stats** never counts.
- **Practice accounts** (Demo, Backtest, or ticked Practice) are out of numbers by default but always feed the playbook's examples.
- The **account picker** decides which accounts count. It never changes examples or recency (Recent chart stories, the trade log).
- The **period** filters by entry date: This week (from Monday), This month (from the 1st, default), 3 months (from the Monday 13 weeks back; on the canvas 17 August 2026).

## Formulas
`T` = counted entries in the period, oldest first. `n = T.length`.

| Number | Formula | Shown as |
|---|---|---|
| Net R | `sum(T.r)` rounded to 2 dp | `+7.6R` (1 dp, sign, U+2212 minus) |
| Worst drawdown | running sum `pts = [0, r1, r1+r2, …]`; `dd = min(v − max(previous pts))` | `Worst drawdown −2.0R` |
| Expectancy | `net / n` | `+0.38R` (2 dp); only when `n ≥ 5` |
| Win rate | `wins / n`, wins are `r > 0` | `50%`; only when `n ≥ 5` |
| Average win / loss | `sum(wins)/wins.length`, `sum(losses)/losses.length` (losses are `r ≤ 0`) | `Wins avg +1.8R, losses −1.0R` |
| Plan followed | `count(followed === true) / n` | `70%`, `14 of 20 trades` |
| Trades taken | `n` | `20`, with `8 watched · 2 not filled` from the same period |
| R over time | the running sum `pts`, one point per trade plus the start at 0 | line chart |
| R by day | sum of `r` per date; for 3 months, per week (Monday) | bars, `7 of 11 days up` |
| Best / worst | the highest and lowest day (or week) | `Best +2.7R · 12 Nov` |
| By setup / By session | per group: trades, win rate and expectancy (only from 5 trades), net | table with breakdown bar |
| Costliest mistakes | per mistake-kind tag: trades carrying it and the sum of their `r`, most negative first | `x of n trades had no mistake tagged` |

Format rules: one decimal for R (`+2.1R`), two for expectancy (`+0.38R`), zero shows as `0.0R` in `--text-2`. Positive `--profit`, negative `--loss`.

## Small samples (same rule everywhere)
- Fewer than 5 trades: no rates or averages, just the count, with "Too few trades for numbers" or "Too few to rate". On the dashboard, under 5 trades in the period, the numbers give way to "Your numbers start after 5 trades".
- 5 to 19 trades in a setup: numbers show with an "Early signal" flag.
- The cumulative R sparkline on a setup appears from 10 trades (last 20 trades).
- Patterns need 20 trades in the setup; any split where one side has fewer than 10 carries the early-signal dot.

## Weekly review
- Weeks run Monday to Sunday. The week in progress isn't listed until it ends; the review opens on the latest week the user traded.
- A week shows: Net R, trades taken (with watched and not filled), plan followed (x of y), mistakes tagged more than once that week with their trades and R, the week's chart cards, the week's reflections, and one takeaway box.
- Past weeks: every week with at least one entry, grouped by month (this month and last month open, older months fold to one row with weeks, trades and R).
- The dashboard's "This week's focus" is the takeaway of the latest reviewed week.
