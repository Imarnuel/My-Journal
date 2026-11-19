// Trade log (frames 03 and 04) against the handoff screenshots, light and dark, at 1440 × frame height.
import { test } from "@playwright/test";
import { diffAgainst, FRAME_H } from "./compare";

for (const theme of ["light", "dark"] as const) {
  test(`03-Main ${theme}`, async ({ page }, info) => {
    await page.goto(`/log?theme=${theme}`);
    await diffAgainst(page, `${theme}/03-Main.png`, info, { height: FRAME_H["03-Main"] });
  });

  test(`04-MainCal ${theme} (Grid, Date filter open)`, async ({ page }, info) => {
    await page.goto(`/log?view=grid&theme=${theme}`);
    await page.getByRole("button", { name: "Date: All time" }).click();
    await diffAgainst(page, `${theme}/04-MainCal.png`, info, { height: FRAME_H["04-MainCal"] });
  });
}
