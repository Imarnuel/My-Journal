// This week's focus belongs to the owner (DESIGN.md): edit in place, clear with Undo, set when there is none,
// saved across reloads. With nothing set, last week's review takeaway fills it in.
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const card = (page: Page) => page.getByRole("region", { name: "This week's focus" });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#main").waitFor();
});

test("with nothing set it shows last week's takeaway, linking to that review", async ({ page }) => {
  await expect(card(page)).toContainText("“Leave the stop where I planned it. No moving it to breakeven before 1R.”");
  await expect(card(page).getByRole("link", { name: "From your review of 9 to 13 Nov" })).toHaveAttribute("href", "/review/2026-11-09");
});

test("edit in place: Enter saves, it becomes yours and survives a reload", async ({ page }) => {
  await card(page).getByRole("button", { name: "Edit this week's focus" }).click();
  const field = page.getByRole("textbox", { name: "This week's focus" });
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Leave the stop where I planned it. No moving it to breakeven before 1R.");
  await field.fill("Only A+ setups this week.");
  await page.keyboard.press("Enter");
  await expect(card(page)).toContainText("“Only A+ setups this week.”");
  await expect(card(page)).toContainText("Set by you for 16 to 20 Nov");
  await expect(card(page).getByRole("link")).toHaveCount(0);
  await expect(card(page).getByRole("button", { name: "Edit this week's focus" })).toBeFocused();
  await page.waitForTimeout(150);
  await page.reload();
  await expect(card(page)).toContainText("“Only A+ setups this week.”");
});

test("Escape and Cancel leave it as it was", async ({ page }) => {
  await card(page).getByRole("button", { name: "Edit this week's focus" }).click();
  await page.getByRole("textbox", { name: "This week's focus" }).fill("Something else");
  await page.keyboard.press("Escape");
  await expect(card(page)).toContainText("Leave the stop where I planned it.");
  await card(page).getByRole("button", { name: "Edit this week's focus" }).click();
  await page.getByRole("textbox", { name: "This week's focus" }).fill("Something else");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(card(page)).toContainText("Leave the stop where I planned it.");
});

test("clear happens at once with Undo; with no focus there is only a quiet way to set one", async ({ page }) => {
  await card(page).getByRole("button", { name: "Clear this week's focus" }).click();
  await expect(card(page)).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Focus cleared");
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(card(page)).toContainText("Leave the stop where I planned it.");
  await card(page).getByRole("button", { name: "Clear this week's focus" }).click();
  const set = page.getByRole("button", { name: "Set a focus for this week" });
  await expect(set).toBeVisible();
  // Clearing sticks: the review takeaway doesn't come back after a reload.
  await page.waitForTimeout(150);
  await page.reload();
  await expect(page.getByRole("button", { name: "Set a focus for this week" })).toBeVisible();
  await page.getByRole("button", { name: "Set a focus for this week" }).click();
  await page.getByRole("textbox", { name: "This week's focus" }).fill("Stop after two losses.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(card(page)).toContainText("“Stop after two losses.”");
});

test("saving an empty focus clears it", async ({ page }) => {
  await card(page).getByRole("button", { name: "Edit this week's focus" }).click();
  await page.getByRole("textbox", { name: "This week's focus" }).fill("");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Set a focus for this week" })).toBeVisible();
});

test("no serious accessibility issues while editing", async ({ page }) => {
  await card(page).getByRole("button", { name: "Edit this week's focus" }).click();
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
});
