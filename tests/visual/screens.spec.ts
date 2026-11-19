import { test } from "@playwright/test";
import { diffAgainst, FRAME_H } from "./compare";

// Screens ported to the shared store. Add each screen here when it is ported.
const SCREENS: { ref: string; url: string }[] = [
  { ref: "12-Accounts", url: "/accounts" },
];

for (const s of SCREENS)
  for (const theme of ["light", "dark"] as const)
    test(`${s.ref} ${theme}`, async ({ page }, info) => {
      await page.goto(`${s.url}${s.url.includes("?") ? "&" : "?"}theme=${theme}`);
      await diffAgainst(page, `${theme}/${s.ref}.png`, info, { height: FRAME_H[s.ref] });
    });
