# Decisions needed from the owner

Questions sent to the owner during the build. All of 1 to 16 were answered on 2026-11-20, one at a time;
each answer is recorded below, and every change it led to has its section in `DESIGN.md`.

## Sample data that disagrees with the frames
1. **Default account for screenshots.** Answered 2026-11-20: there is no default for screenshots, for now. Removed (DESIGN.md › Accounts: no default for screenshots).
2. **Funded 100K story count.** Answered 2026-11-20: count the real entries (80). Kept as built.
3. **e20 pinned as textbook?** Answered 2026-11-20: keep it pinned (the setup page shows Textbook 3). Kept as built.
4. **USDCHF very short trade** Answered 2026-11-20: make it a real trade. It joins the entries and counts by default; Leave it out takes it out of the stats (DESIGN.md › Very short trade).
5. **"Name this setup" look-alike stories** Answered 2026-11-20: use the real unsorted trades. Kept as built.
6. **"BOS" look-alike tag** Answered 2026-11-20: make it real. Two sample trades carry "BOS", so the prompt and Merge act on real tags (DESIGN.md › Sample BOS tag).
7. **Archived setup story count** Answered 2026-11-20: count the real stories (28). Kept as built.
8. **Asian range fade thumbnail** Answered 2026-11-20: the same picture everywhere (`sx2`). Kept as built.

## Copy and small design questions
9. **Start screen "Every trading day"** Answered 2026-11-20: "Whenever you trade" (DESIGN.md › Start screen).
10. **"Type instead" on the voice-note error** Answered 2026-11-20: remove "Type instead"; the two note boxes sit right below the card (DESIGN.md › Voice note).
11. **Lessons tab shows the latest 5 of 10 reflections** Answered 2026-11-20: the latest 5, then Show more; the tab count is the real total (DESIGN.md › Lessons tab).
12. **"Not followed" label** Answered 2026-11-20: only when marked. Kept as built.
13. **Weekly review with no weeks** Answered 2026-11-20: one line, "No trades on these accounts yet" (DESIGN.md › Weekly review with no trades).
14. **Restoring an archived setup** Answered 2026-11-20: a toast with Undo for both (DESIGN.md › Restoring shows a toast).
15. **Expectancy caption** Answered 2026-11-20: keep "What an average trade made"; with Geist it fits on one line. Kept as built.
16. **Phone layouts** Answered 2026-11-20: good enough for now; phone screens get their own design work later (New chart story, Trade log, Chart story first). Kept as built.

## Not built because there's no back end yet (open item 7)
17. MT5 sync (Test connection is a stand-in that always succeeds), the voice-note pipeline (a simulated result in `src/lib/voiceNote.ts`), chart reading, accounts and sign-in, storage.
18. **Persistence**: settled. The journal saves to the browser (IndexedDB, falling back to localStorage) until there is a back end. Source: `src/data/persist.ts`.
