# Open items and known gaps

Nothing here is designed yet, or the design has a small inconsistency. Don't fill these gaps by guessing: build what's designed, and raise these with the owner.

## Not designed yet
1. **Phone layouts.** Everything is drawn at 1440px. `02-look-and-feel.md` gives the rules (main card goes full-bleed, dialogs become bottom sheets, 44px touch targets, 16px text for body and fields), but no phone frames exist. Priority screens for phones: New chart story, Trade log, Chart story.
2. **Add account errors.** Wrong login, wrong server, failed Test connection: each should state the cause and the fix next to the field. Also a show/hide toggle on the investor password.
3. **Dashboard loading and error.** Skeletons (spec in `02-look-and-feel.md`, Skeletons and progress) and a "Couldn't load your numbers" state with Retry.
4. **Search across notes** in the Trade log (optional; the owner hasn't decided).
5. **Dashboard layout rework.** The owner wants to revisit what leads the dashboard (whether the no-charts notice and the focus line sit above the numbers). Build it as drawn until told otherwise.
6. **Plan control on the story.** Plan is drawn as a segmented control (Followed / Not followed). A proposal is open to make it a pill with a menu like Setup and Headspace, so the Details panel reads consistently. Build as drawn until decided.
7. **Back end.** Accounts and auth, storage, MT5 sync (local script, MT5 history export, or a cloud service such as MetaApi: decide at build time), chart image storage, the voice-note pipeline (recording, transcription, the two summaries, tag filling), timeframe captions read from chart legends, and position-box reading for non-MT5 accounts. Behaviour for all of these is in `01-decisions.md`; the plumbing is not designed.

## Small inconsistencies in the frames
1. **"Type instead" on the voice-note error** (frame 16, "Couldn't make out your note"). The decisions say there is no separate "Type instead" box: writing in the note fields is the typing path. Suggested fix: make that action focus the Before / during field.
2. **Problem cards in frame 16** start with a small attention dot, while notices elsewhere (Trade log, Dashboard) start with a 32px icon tile. The notices rule in `02-look-and-feel.md` says notices that ask for something start with the icon tile. Suggested fix: use the icon tile with the attention icon.
3. **"Every trading day" on the Start screen** ("What to expect"). The decisions say never assume a daily routine; the user may not trade every day. Suggested copy: "Whenever you trade".
4. **"What an average trade made"** under Expectancy wraps to two lines at 1440px. Suggested copy: "Per trade, on average".

Ask the owner before applying any of these. Until then, build them as drawn.
