# Approved reference images

These replace the handoff screenshot of the same name, only where the owner asked for a change after the
handoff (see `DESIGN.md`). Everything else is still compared with `handoff/screenshots/`.

| Images | Change | Asked |
| --- | --- | --- |
| `light/` and `dark/` 05-NewStory, 06-NewStoryTyped, 07-Story; `states/` 15 to 24 | Filled grey 16px icons on the Details labels (Setup, Tags, Plan, Headspace) and on the trade facts (pair, direction, status, account, date), facts 16px apart without dot separators; Notes fields aligned with their labels and the Talk it through card, even spacing; the Tags input aligned with the other Details values | 2026-11-19 |

| `chrome/` sidebar and story-top images; the story images above were refreshed | Breadcrumbs instead of back links, sidebar rows 36px with 16px icons | 2026-11-19 |

| `light/` and `dark/` 13-AddAccount, 14-EditAccount, 10-SetupEdit; `states/` 31, 35; story images refreshed | Breadcrumbs 16px above the title; story icons 14px and lighter; Re-record labelled; no result slot on entries without a result | 2026-11-19 |

| Story images and states 17 to 24 refreshed | Emoji beside each headspace | 2026-11-19 |

| Story images refreshed | Selected segment label at medium weight (500) | 2026-11-19 |

| `light/` and `dark/` 02-Dashboard; `states/` 01 to 06 | Dashboard notices redesigned (DESIGN.md); everything below them matches the handoff screenshot shifted 38px down (checked) | 2026-11-19 |

| Dashboard images refreshed | Edit and clear buttons on this week's focus | 2026-11-19 |

| Dashboard images refreshed | Weekly focus removed; below the notice everything matches the handoff screenshot moved up 80px (checked) | 2026-11-19 |

| `light/` and `dark/` 03-Main, 04-MainCal; `states/` 07 to 14 | Trade log rows read as facts only (DESIGN.md); layout unchanged (checked side by side) | 2026-11-19 |

| Dashboard images refreshed | Charts restyled, stat icons (DESIGN.md); only the stat row and chart cards changed (checked) | 2026-11-19 |

The other screens still compare with the handoff screenshots: the sidebar change stays within their tolerance,
and `tests/visual/chrome.spec.ts` checks the sidebar itself exactly.

To regenerate after another approved change: `APPROVE='<regex of refs>' npx playwright test <specs>`,
then look at every regenerated image against the handoff screenshot before committing.

| `states/` 12, 14, 17, 21, 22, 27, 31, 40 and the Story, NewStoryTyped, Main and story-top images | Toasts bottom right with icons; Notes tidied; Trade log rows at 12px (DESIGN.md). Only the toast, Notes card and row text changed (checked) | 2026-11-19 |

| Every image in `light/`, `dark/`, `states/` and `chrome/` | Rounder corners (DESIGN.md); only corners changed (checked dashboard, trade log, menus, settings in both themes) | 2026-11-19 |

| Story images and `states/` 15 to 24 | Chart tile controls moved onto the thumbnail (DESIGN.md, Chart tiles); only the tile row changed (checked) | 2026-11-19 |

| Story images and `states/` 15 to 24 | Trash replaces the chart menu (DESIGN.md, Chart tiles); state 19 retired. Only the tile row and hint changed (checked) | 2026-11-19 |

| Every image | Typeface changed to Geist (DESIGN.md); checked dashboard and story in both themes | 2026-11-20 |

| Story images and `states/` 20 | Pen icon on "Edit numbers" (DESIGN.md); only that button changed | 2026-11-20 |

| `states/` 20 and story images | Editing numbers redesigned (DESIGN.md) | 2026-11-20 |

| Story images and `states/` 20 | Numbers edit in place, no Edit numbers button (DESIGN.md, Editing numbers) | 2026-11-20 |

| Story images and `states/` 15 to 24 | Numbers on a three-column grid (DESIGN.md, Editing numbers) | 2026-11-20 |

| `light/` and `dark/` 12-Accounts; `states/` 34 | No default for screenshots: badge and the "Screenshots with no MT5 match go to" row removed (DESIGN.md) | 2026-11-20 |

| `light/` and `dark/` 02-Dashboard, 03-Main, 04-MainCal; `states/` 01 to 14 | The very short USDCHF trade is a real entry (DESIGN.md, question 4): it heads the Trade log (no drop zone), and the Dashboard's numbers include it (+7.5R, 21 trades, 14 of 21 followed) | 2026-11-20 |

| `light/` and `dark/` 01-Start, 08-PlaybookHome, 09-Playbook, 15-Settings; `states/` 25, 27 to 30, 39 | "Whenever you trade"; Unsorted (22); "Lessons 10" with Show more; sample BOS tag in Your tags (DESIGN.md, questions 6, 9, 11); only those words and the Lessons list changed (checked) | 2026-11-20 |

| `light/` and `dark/` 02-Dashboard; `states/` 01 to 06 | Period as a dropdown like the Trade log's Date filter (DESIGN.md, Dashboard period); only the header control changed (checked in both themes) | 2026-11-21 |

| `chrome/` sidebar light and dark | Refreshed: the sidebar image is taken on Accounts, which no longer has the default for screenshots (2026-11-20); that change stayed inside this image's tolerance at the time. Field shadow (DESIGN.md) is below the comparison threshold, so no other image changed | 2026-11-21 |

| `states/` 11 | The Change date picker has no Save or Cancel (DESIGN.md › Date and time); only the dialog changed (checked against the previous approved image) | 2026-11-22 |
| Every image in `light/`, `dark/`, `states/` and `chrome/` | Continuous (Apple-style) corners on the rounder scale (DESIGN.md › Corners: 7, 8, 10, 12, 16, 16, 18, 20). A revert to the handoff's sizes earlier the same day was a misreading and is undone; only the corner curves changed against the 2026-11-19 images (checked new story, settings, dashboard) | 2026-11-22 |
| Every image in `light/`, `dark/`, `states/` and `chrome/` | Typeface: Instrument Serif page titles at 26px, Public Sans for everything else (DESIGN.md › Typeface); layout unchanged, title line height stays 32px (checked the story, trade log and dashboard) | 2026-11-22 |
| Every image in `light/`, `dark/`, `states/` and `chrome/` | First ui-polish audit (DESIGN.md › First ui-polish audit): 22px chips, one row height per kind, popovers on their trigger, text buttons by their text, recent stories' status on the meta line, numbers grid value columns, filled facts icons, Playbook "…" on the image, dark edges, 8px filter buttons, no duplicate empty-state actions, no zero counts, no "In R"; and Inter again for everything but page titles, at +0.01em (figures −0.01em) (DESIGN.md › Typeface) (checked screen by screen in both themes) | 2026-11-22 |
| `light/` and `dark/` 05-NewStory, 06-NewStoryTyped, 07-Story; `states/` 15 to 18, 20 to 22, 24; `chrome/` story top | Notes card sizes (DESIGN.md › Notes reflection, tidied): "Talk it through" 14px, its line 12px, the "Before / during" and "Reflection" labels 14px; nothing else changed | 2026-11-22 |
| Every image in `light/`, `dark/`, `states/` and `chrome/` | Neutrals with half the blue tint (DESIGN.md › Neutrals: half the blue tint): same lightness and hue, chroma halved; layout unchanged (checked the story in dark against the previous image) | 2026-11-22 |
| Every image in `light/`, `dark/`, `states/` and `chrome/` | Page titles at 28px (DESIGN.md › Typeface), line height still 32px so nothing below moves (checked the story and trade log tops) | 2026-11-22 |
| `states/` 12, 14, 17, 21, 31, 40 | Toasts reworked (DESIGN.md › Toasts): a filled check on a success, no icon on a notice, a ghost Undo; only the toast changed (checked 12 and 40) | 2026-11-22 |
| `states/` 17 | The voice note toast leads with what was filled, no colon ("Setup, 3 tags, plan and headspace filled from your note"; DESIGN.md › Toasts) | 2026-11-22 |
| `states/` 39 | Manage tags: each tag's kind is a small menu to change it (DESIGN.md › Tags: starter tags, and no kind question) | 2026-11-22 |
| `light/` and `dark/` 03-Main, 04-MainCal, 05-NewStory, 06-NewStoryTyped, 07-Story, 15-Settings; `states/` 07 to 18, 20 to 22, 24, 39, 40; `chrome/` story top | Mistakes are their own field (DESIGN.md › Mistakes): a Mistakes row under Tags on the story, a mistakes line and a Mistakes filter in the Trade log, Tags and Mistakes apart in Settings (checked the story and a trade log row) | 2026-11-22 |
| Every image in `light/`, `dark/`, `states/` and `chrome/` | Circle-plus for every plus, buttons 8px on the icon side (DESIGN.md › Plus is a circled plus); checked New chart story, Add account and New setup in both themes | 2026-11-22 |
| `light/` and `dark/` 05-NewStory, 06-NewStoryTyped, 07-Story, 10-SetupEdit, 13-AddAccount, 14-EditAccount; their `states/`; `chrome/` story top | The breadcrumb trail sits 16px from the top of the main card, not 32px (DESIGN.md › Page tops and the story header); everything under it moves up 16px | 2026-11-22 |
| `light/` and `dark/` 05, 06, 07, 09, 10, 13, 14; their `states/` (15 to 18, 20 to 24, 28 to 31, 35, 36); `chrome/` story top | Page top bar (DESIGN.md › Page tops and the story header): the trail and the story's "…" menu in a slim bar along the top of the main card, a hairline under it, the title 16px below; checked the story, New chart story, a setup, Add and Edit account in both themes and at phone width | 2026-11-22 |
| Every image in `light/`, `dark/`, `states/` and `chrome/` | Inter as it is drawn (DESIGN.md › Typeface): body text and figures at Inter's own spacing (smoothing stays antialiased, which these Linux captures don't show); checked the Dashboard and the Trade log for wrapping | 2026-11-22 |
| Every image in `light/`, `dark/`, `states/` and `chrome/` | Inter's tracking by size (DESIGN.md › Typeface): 12px 0, 14px −0.006em, 16px −0.011em, figures −0.019em, chosen from a side by side; checked the Dashboard, a story and Settings | 2026-11-22 |
| `light/` and `dark/` 15-Settings; `states/` 39, 40 | Tags and mistakes (DESIGN.md › Settings: tags and mistakes): each list opens from its own row, no Manage tags button, no Headspace or Plan rows; checked both themes with a list open | 2026-11-22 |
| `states/` 24 | Seven headspaces (DESIGN.md › Headspace): Calm, Focused, Confident, Overconfident, Rushed, Anxious, Frustrated; Tired no longer offered; checked the open menu in both themes | 2026-11-23 |
| `states/` 16 | Recording shows live words (DESIGN.md › Voice note: recording): small waveform, Listening · 0:01, the approved line until the first words; checked against the storyboard | 2026-11-23 |
| `light/` and `dark/` 03, 05, 06, 07; `states/` 07 to 12, 14, 15, 17, 18, 20, 21, 24; `chrome/` story top | The AI mic (DESIGN.md › Voice note: the AI mic): a filled mic with a sparkle on Talk it through (20px, gradient depth, subtle ring), Re-record and Add a note; only the mic changed (re-capture noise reverted) | 2026-11-23 |
| `light/` and `dark/` 15-Settings; `states/` 40 | Settings › Voice notes gains the live-words line (awaiting the owner's wording approval; DESIGN.md › Voice note: recording) | 2026-11-23 |
| `light/` and `dark/` 05-NewStory; `states/` 15 | The AI mic centred on the mic in its circle, the sparkle hanging off (DESIGN.md › Voice note: the AI mic); only the glyph moved | 2026-11-23 |
| `light/` and `dark/` 05-NewStory; `states/` 15 | The voice circle: the mic just left of centre with the sparkle to its upper right (the middle of five steps), and the circle drifting from purple to blue (DESIGN.md › Voice note: the AI mic) | 2026-11-23 |
| `light/` and `dark/` 15-Settings; `states/` 40 | The live-words line leaves Settings (the owner: "needless to be user-facing") | 2026-11-23 |
| `light/` and `dark/` 05, 06, 07; `states/` 15 to 18, 20 to 22, 24; `chrome/` story top | The selected chart thumbnail's ring is 1px, not 2px (DESIGN.md › Chart tiles); only the ring changed | 2026-11-23 |
