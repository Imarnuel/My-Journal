// Visual diffs for Start, Add account, Edit account and Settings (frames 01, 13, 14, 15), light and dark.
import { test } from "@playwright/test";
import { diffAgainst, FRAME_H } from "./compare";

/** Add account is drawn with the MT5 fields filled in; the real form starts empty. */
async function fillMt5(page: import("@playwright/test").Page) {
  await page.getByLabel("Login").fill("51234567");
  await page.getByLabel("Server").fill("FTMO-Demo2");
  await page.getByLabel("Investor password").fill("readonly");
  await page.locator("#fld-investor-password").blur();
}

const SCREENS: { ref: string; url: string; prep?: (page: import("@playwright/test").Page) => Promise<void> }[] = [
  { ref: "01-Start", url: "/start" },
  { ref: "13-AddAccount", url: "/accounts/new", prep: fillMt5 },
  { ref: "14-EditAccount", url: "/accounts/funded-100k" },
  // The frame shows Appearance on System (light and dark previews of it).
  { ref: "15-Settings", url: "/settings?theme=system" },
];

for (const s of SCREENS)
  for (const theme of ["light", "dark"] as const)
    test(`${s.ref} ${theme}`, async ({ page }, info) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(s.url.includes("theme=") ? s.url : `${s.url}?theme=${theme}`);
      if (s.prep) await s.prep(page);
      await diffAgainst(page, `${theme}/${s.ref}.png`, info, { height: FRAME_H[s.ref] });
    });
