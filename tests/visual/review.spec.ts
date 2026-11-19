// Weekly review (frame 11) against handoff/screenshots/{light,dark}/11-Review.png at 1440 × 1670.
import { test } from "@playwright/test";
import { diffAgainst, FRAME_H } from "./compare";

for (const theme of ["light", "dark"] as const)
  test(`11-Review ${theme}`, async ({ page }, info) => {
    await page.goto(`/review?theme=${theme}`);
    await page.getByRole("heading", { name: "Weekly review", level: 1 }).waitFor();
    await diffAgainst(page, `${theme}/11-Review.png`, info, { height: FRAME_H["11-Review"] });
  });
