# Icons

The SVG files in this folder are the exact icons on the canvas. They are drawn in the Lucide style (24 × 24 grid, round caps and joins, stroke 1.8 at 16px). Use `lucide-react` where the Lucide icon is the same shape, and the SVG file here where it isn't or where you need an exact match. Either way: one family, monochrome, `currentColor`, colour set by the text tone rules in `02-look-and-feel.md` section 10.

Sizes on the canvas: 16px in buttons, menus, filters and notice tiles; 17 to 18px in the sidebar; 14px in a trade log entry's facts and status lines.

| File | Where it's used | Closest Lucide |
|---|---|---|
| `dash.svg` | Sidebar: Dashboard | `layout-dashboard` |
| `log.svg` | Sidebar: Trade log | `calendar` |
| `book.svg` | Sidebar: Playbook | `book` |
| `review.svg` | Sidebar: Weekly review | `chart-line` |
| `acct.svg` | Sidebar: Accounts; account picker button | `credit-card` |
| `gear.svg` | Sidebar: Settings | `settings` |
| `plus.svg` | New chart story, New setup, Add a rule, Your own type, Add (chart tile) | `plus` |
| `mic.svg` | Talk it through, Add a note, re-record, "Drafted from your voice notes" (in `--voice`) | `mic` |
| `play.svg` | Play the voice note | `play` |
| `img.svg`, `img16.svg` | Drop, paste or choose charts; "no charts yet" notice; screenshots-only status | `image` |
| `check.svg` | Selected option in a choice menu | `check` |
| `chev.svg` | Dropdown triggers | `chevron-down` |
| `right.svg`, `back.svg` | Row chevrons; back link ("Trade log", "Accounts") | `chevron-right`, `chevron-left` |
| `left.svg`, `right.svg` (menu) | Move left / Move right in a chart's menu | `arrow-left`, `arrow-right` |
| `arrow.svg` | Trailing arrow on links to another page (Open playbook, Trade log) | `arrow-right` |
| `more.svg` | Every "more actions" button (filled dots) | `ellipsis` |
| `x.svg`, `x16.svg` | Remove in menus; × on tags and rules | `x` |
| `grip.svg` | Drag handle on setup rules (filled dots) | `grip-vertical` |
| `cal.svg` | Change date (menu row) | `calendar` |
| `stats.svg` | Exclude from stats / Include in stats (menu row) | `chart-line` |
| `trash.svg` | Delete (menu row, in `--loss`) | `trash` |
| `archive.svg` | Archive setup; Archived groups | `archive` |
| `pen.svg` | Edit rules, Rename, Edit (Rules section) | `pen-line` |
| `mark.svg` | Pin as textbook | `bookmark` |
| `link.svg` | MT5 · synced status | `link` |
| `alert.svg` | MT5 · reconnect needed (in `--attention`) | `circle-alert` |
| `clock.svg` | Very short trade notice | `clock` |
| `target.svg` | This week's focus; The week before, you said | `target` |
| `spark.svg` | Suggestions from the journal (in `--voice`) | `sparkles` |
| `filter-date.svg` / `fact-date.svg` | Date filter; date in a trade log entry | `calendar` |
| `filter-pair.svg` / `fact-pair.svg` | Pair filter | `arrow-right-left` |
| `filter-setup.svg` / `fact-setup.svg` | Setup filter; setup in an entry | `book-open` (close) |
| `filter-tag.svg` / `fact-tag.svg` | Tags filter; tags in an entry | `tag` |
| `filter-dir.svg` / `fact-dir.svg` | Direction filter | `arrow-down-up` |
| `filter-status.svg` / `fact-status.svg` | Status filter; status in an entry | `circle-check` |
| `filter-sort.svg` / `fact-sort.svg` | Sort | `list-filter` |
| `fact-acct.svg` | Account in an entry | `credit-card` |
| `fact-plan.svg` | Plan in an entry | `clipboard-check` |
| `fact-excl.svg` | Excluded from stats in an entry | `ban` |

`logo-mark.svg` is the wordmark's mark, white on the primary button fill (26 × 26, radius 8), next to "Journal" (16/600).

Medallions (empty and system states) are drawn shapes, not icons: see `02-look-and-feel.md` section 10 and frame 16.
