# Decisions needed from the owner

Everything below was built "as drawn" or with the smallest reasonable choice, and is waiting for a
yes or a different answer. Reply with the numbers you want changed, e.g. "3: use Whenever you trade".

## Sample data that disagrees with the frames
1. **Default account for screenshots.** `data/accounts.json` says Main account; the Accounts frame shows Challenge 50K. Built: Challenge 50K (the frame).
2. **Funded 100K story count.** Edit account frame says "46 chart stories"; the data has 80 entries on that account. Built: computed (80).
3. **e20 pinned as textbook?** `playbook-examples.json` pins it; frame 07 draws it unpinned. Built: pinned (the data).
4. **USDCHF very short trade** (#48240, −0.1R, 8 seconds) appears on the Trade log but isn't in the 134 entries. Built: held by the Trade log only. Should it be a real entry, and does it count in the 134?
5. **"Name this setup" look-alike stories** (GBPUSD 13 Nov, EURUSD 9 Nov, AUDUSD 6 Nov, XAUUSD 3 Nov) aren't unsorted stories in the data. Built: points at four real unsorted stories.
6. **"BOS" look-alike tag** for the Merge prompt isn't in the data. Built: the frame's prompt is kept as drawn.
7. **Archived setup story count**: state 27 says "17 stories kept"; counting real stories gives 28. Built: 28.
8. **Asian range fade thumbnail**: the Dashboard frame draws `sw2`, the Playbook draws `sx2`. Built: `sx2` everywhere.

## Copy and small design questions
9. **Start screen "Every trading day"** (open item 3 suggests "Whenever you trade"). Built as drawn.
10. **"Type instead" on the voice-note error** (open item 1). Built as drawn; it focuses Before / during.
11. **Lessons tab shows the latest 5 of 10 reflections** ("Lessons 5" in the frame) but "lists never cut history off". Show all?
12. **"Not followed" label**: shown only when the plan was marked Not followed, not when it was left empty. OK?
13. **Weekly review with no weeks** (e.g. only Backtesting ticked): no design exists; shows the header, picker and an empty Past weeks.
14. **Restoring an archived setup** shows no toast (as in the prototype); restoring an account does. Make them the same?
15. **Expectancy caption** "What an average trade made" wraps at 1440px (open item 4 suggests "Per trade, on average"). Built as drawn.
16. **Phone layouts** aren't designed (open item 1). Built: the main card goes full-bleed, the sidebar becomes a scrolling row of links, stat groups wrap to two columns. Good enough until phone frames exist?

## Not built because there's no back end yet (open item 7)
17. MT5 sync (Test connection is a stand-in that always succeeds), the voice-note pipeline (a simulated result in `src/lib/voiceNote.ts`), chart reading, accounts and sign-in, storage.
18. **Persistence**: edits live in memory and reset on reload (only Appearance survives). Next step options: save to the browser (IndexedDB) now, or wait for the back end.
