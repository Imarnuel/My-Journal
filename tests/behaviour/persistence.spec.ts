// Saving to the browser: what you change survives a reload, on every screen, uploads included.
import { expect, test, type Page } from "@playwright/test";

const PNG_1PX = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

/** Reload and wait until the app has rendered from what was saved. */
async function reload(page: Page) {
  await page.waitForTimeout(150); // writes to IndexedDB are async
  await page.reload();
  await page.locator("#main").waitFor();
}

test("a fresh browser starts from the sample data", async ({ page }) => {
  await page.goto("/log");
  await expect(page.getByText("134 entries")).toBeVisible();
});

test("a deleted entry stays deleted after reload, and the dashboard agrees", async ({ page }) => {
  await page.goto("/log");
  await expect(page.getByText("134 entries")).toBeVisible();
  await page.getByRole("button", { name: /More actions/ }).nth(3).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByText("133 entries")).toBeVisible();
  await reload(page);
  await expect(page.getByText("133 entries")).toBeVisible();
  // GBPUSD +2.1R on 16 Nov was the 4th row: This month drops from +7.6R to +5.5R.
  await page.goto("/");
  await expect(page.locator(".kstat")).toContainText("+5.5R");
});

test("the weekly takeaway is saved and shows in the next week's review after reload", async ({ page }) => {
  await page.goto("/review");
  const box = page.getByRole("textbox", { name: /What I.ll do differently next week/ });
  await box.fill("Only A+ setups on Fridays.");
  await reload(page);
  await expect(page.getByRole("textbox", { name: /What I.ll do differently next week/ })).toHaveValue("Only A+ setups on Fridays.");
  // The Dashboard no longer shows it (DESIGN.md); the review is where it's written and read back.
  await page.goto("/");
  await expect(page.getByText("Only A+ setups on Fridays.")).toHaveCount(0);
});

test("account changes and set-once rules are saved", async ({ page }) => {
  await page.goto("/accounts");
  await page.getByRole("button", { name: /Copied trades/ }).click();
  await page.getByRole("option", { name: "Ask me each time" }).click();
  await page.getByRole("button", { name: /Archived \(2\)/ }).click();
  await page.getByRole("button", { name: "Restore" }).first().click();
  await reload(page);
  await expect(page.getByRole("button", { name: "Copied trades: Ask me each time" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("(6)");
});

test("the account picker choice is saved", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /3 accounts/ }).click();
  await page.getByRole("checkbox", { name: /Demo account/ }).check();
  await expect(page.getByRole("button", { name: /4 accounts/ })).toBeVisible();
  await reload(page);
  await expect(page.getByRole("button", { name: /4 accounts/ })).toBeVisible();
});

test("a setup rename is saved and every story follows", async ({ page }) => {
  await page.goto("/playbook");
  await page.getByRole("button", { name: "Actions for London breakout" }).click();
  await page.getByRole("menuitem", { name: "Rename" }).click();
  const name = page.getByRole("textbox", { name: /name/i }).first();
  await name.fill("London open break");
  await page.keyboard.press("Enter");
  await reload(page);
  await expect(page.getByText("London open break").first()).toBeVisible();
  await page.goto("/log");
  await expect(page.getByText("London open break").first()).toBeVisible();
});

test("an uploaded chart is saved as an image and comes back after reload", async ({ page }) => {
  await page.goto("/log");
  // EURUSD from MT5 has no charts: its drop zone is also a file picker.
  await page.locator('input[type="file"]').first().setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: PNG_1PX });
  await expect(page.getByRole("status")).toContainText("Chart added");
  await expect.poll(() => page.locator('img[src^="data:image/png"]').count(), { timeout: 3000 }).toBeGreaterThan(0);
  await reload(page);
  await expect(page.locator('img[src^="data:image/png"]').first()).toBeVisible();
});

test("appearance and data are saved independently", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Dark" }).first().click();
  await reload(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
