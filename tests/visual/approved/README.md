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
| Every image in `light/`, `dark/`, `states/` and `chrome/` | First ui-polish audit (DESIGN.md › First ui-polish audit): 22px chips, one row height per kind, popovers on their trigger, text buttons by their text, recent stories' status on the meta line, numbers grid value columns, filled facts icons, Playbook "…" on the image, dark edges, 8px filter buttons, no duplicate empty-state actions, no zero counts, no "In R" (checked screen by screen in both themes) | 2026-11-22 |
