// Chart story (frames 05, 06, 07) against the handoff screenshots, light and dark, at 1440 × frame height.
import { expect, test, type Page } from "@playwright/test";
import { diffAgainst, FRAME_H } from "./compare";

const toastGone = (page: Page) => expect(page.locator(".kstatus")).toHaveCount(0, { timeout: 8000 });

for (const theme of ["light", "dark"] as const) {
  test(`05-NewStory ${theme}`, async ({ page }, info) => {
    await page.goto(`/new?theme=${theme}`);
    await diffAgainst(page, `${theme}/05-NewStory.png`, info, { height: FRAME_H["05-NewStory"] });
  });

  test(`06-NewStoryTyped ${theme} (after the voice note)`, async ({ page }, info) => {
    await page.goto(`/new?theme=${theme}`);
    await page.getByRole("button", { name: "Talk it through" }).click();
    await page.getByRole("button", { name: "Stop", exact: true }).click();
    await expect(page.getByText("Suggested", { exact: true })).toBeVisible();
    await toastGone(page);
    await page.locator("body").click({ position: { x: 5, y: 900 } });
    await diffAgainst(page, `${theme}/06-NewStoryTyped.png`, info, { height: FRAME_H["06-NewStoryTyped"] });
  });

  test(`07-Story ${theme}`, async ({ page }, info) => {
    await page.goto(`/story/e20?theme=${theme}`);
    // The sample data pins e20 as a textbook example (playbook-examples.json); frame 07 draws it unpinned.
    await page.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: "Unpin textbook example" }).click();
    await toastGone(page);
    await diffAgainst(page, `${theme}/07-Story.png`, info, { height: FRAME_H["07-Story"] });
  });
}
