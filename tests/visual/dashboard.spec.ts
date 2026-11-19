// Dashboard (frame 02) against handoff/screenshots/{light,dark}/02-Dashboard.png at 1440 × 2090.
import { expect, test } from "@playwright/test";
import { diffAgainst, FRAME_H } from "./compare";

for (const theme of ["light", "dark"] as const)
  test(`02-Dashboard ${theme}`, async ({ page }, info) => {
    await page.goto(`/?theme=${theme}`);
    // The line draws in once (600ms); wait for it to finish so the capture shows the drawn line.
    await expect(page.locator(".kdraw")).toHaveCount(0);
    await diffAgainst(page, `${theme}/02-Dashboard.png`, info, { height: FRAME_H["02-Dashboard"] });
  });
