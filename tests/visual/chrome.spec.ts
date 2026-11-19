// The sidebar and breadcrumbs after the owner's changes (DESIGN.md): roomier rows, 16px icons, breadcrumbs.
// Compared with approved images (tests/visual/approved), since the handoff screenshots predate the change.
import { test } from "@playwright/test";
import { diffAgainst } from "./compare";

for (const theme of ["light", "dark"] as const) {
  test(`sidebar (${theme})`, async ({ page }, info) => {
    await page.goto(`/accounts?theme=${theme}`);
    await page.locator("#main").waitFor();
    await diffAgainst(page, `chrome/sidebar-${theme}.png`, info, { height: 820 });
  });
  test(`breadcrumbs on a saved story (${theme})`, async ({ page }, info) => {
    await page.goto(`/story/e20?theme=${theme}`);
    await page.locator("#main").waitFor();
    await diffAgainst(page, `chrome/story-top-${theme}.png`, info, { height: 1210 });
  });
}
