// Trade log entries open on a click anywhere, and saving a chart story says so (DESIGN.md).
import { expect, test } from "@playwright/test";

const row = (page: import("@playwright/test").Page, i: number) => page.locator("li.trow").nth(i);

test.beforeEach(async ({ page }) => {
  await page.goto("/log");
  await page.locator("#main").waitFor();
});

test("clicking an entry's details opens its story", async ({ page }) => {
  await row(page, 3).getByText("Funded 100K").click();
  await expect(page).toHaveURL(/\/story\/e20$/);
});

test("clicking a chart thumbnail in a row opens the story", async ({ page }) => {
  await row(page, 3).locator(".chart").first().click();
  await expect(page).toHaveURL(/\/story\/e20$/);
});

test("the entry's own controls keep their action", async ({ page }) => {
  await row(page, 3).getByRole("button", { name: "More actions" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page).toHaveURL(/\/log$/);
  await page.keyboard.press("Escape");
  // The drop zone on the MT5 trade without charts is a file picker over its whole area, not a way into the story.
  const chooser = page.waitForEvent("filechooser");
  await row(page, 2).locator('input[type="file"]').click();
  await chooser;
  await expect(page).toHaveURL(/\/log$/);
});

test("selecting text in an entry doesn't open it", async ({ page }) => {
  const t = row(page, 3).getByText("Supply zone, Break of structure, Retest");
  await t.selectText();
  await t.click({ position: { x: 4, y: 4 } }).catch(() => {});
  // A click that ends a selection keeps the selection; the page stays on the log.
  await page.evaluate(() => document.getSelection()?.selectAllChildren(document.querySelector("li.trow:nth-of-type(4) .kfacts-2")!));
  await row(page, 3).locator(".kfacts-2").dispatchEvent("click", { button: 0 });
  await expect(page).toHaveURL(/\/log$/);
});

test("list rows and grid cards show a hover state", async ({ page }) => {
  const r = row(page, 3);
  const before = await r.evaluate((el) => getComputedStyle(el).backgroundColor);
  await r.hover({ position: { x: 300, y: 10 } });
  await expect.poll(() => r.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
  expect(await r.evaluate((el) => getComputedStyle(el).cursor)).toBe("pointer");
  await page.getByRole("button", { name: "Grid view" }).click();
  const card = page.locator("li.tcard").nth(3);
  await card.hover();
  await expect.poll(() => card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42)).toBe(-1);
  await card.locator(".chart").first().click();
  await expect(page).toHaveURL(/\/story\//);
});

test("saving a chart story shows a toast", async ({ page }) => {
  await page.goto("/new");
  await page.locator("#main").waitFor();
  await page.getByRole("button", { name: "Save story" }).click();
  await expect(page).toHaveURL(/\/story\/e\d+$/);
  await expect(page.getByRole("status")).toContainText("Chart story saved");
});
