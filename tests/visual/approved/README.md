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

The other screens still compare with the handoff screenshots: the sidebar change stays within their tolerance,
and `tests/visual/chrome.spec.ts` checks the sidebar itself exactly.

To regenerate after another approved change: `APPROVE='<regex of refs>' npx playwright test <specs>`,
then look at every regenerated image against the handoff screenshot before committing.
