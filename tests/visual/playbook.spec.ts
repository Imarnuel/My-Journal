// Playbook screens (frames 08, 09, 10) against the handoff screenshots, light and dark.
import { test } from "@playwright/test";
import { diffAgainst, FRAME_H } from "./compare";

const SCREENS: { ref: string; url: string }[] = [
  { ref: "08-PlaybookHome", url: "/playbook" },
  { ref: "09-Playbook", url: "/playbook/4h-supply-pullback" },
  // Frame 10 is the new setup drafted from the look-alike unsorted stories ("Name this setup").
  { ref: "10-SetupEdit", url: "/playbook/new?draft=suggestion" },
];

for (const s of SCREENS)
  for (const theme of ["light", "dark"] as const)
    test(`${s.ref} ${theme}`, async ({ page }, info) => {
      await page.goto(`${s.url}${s.url.includes("?") ? "&" : "?"}theme=${theme}`);
      await diffAgainst(page, `${theme}/${s.ref}.png`, info, { height: FRAME_H[s.ref] });
    });
