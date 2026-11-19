// Shell, menus and the Accounts screen: behaviour kit checks shared by every screen.
import { expect, test, devices } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("skip link is the first focusable element and moves focus to the main card", async ({ page }) => {
  await page.goto("/accounts");
  await page.locator("#main").waitFor(); // the app renders once saved data has loaded
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("sidebar marks the current page", async ({ page }) => {
  await page.goto("/accounts");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Accounts" })).toHaveAttribute("aria-current", "page");
});

test("choice menu: opens, one at a time, Escape closes and returns focus, choosing sets the value", async ({ page }) => {
  await page.goto("/accounts");
  const dflt = page.getByRole("button", { name: "Screenshots with no MT5 match go to: Challenge 50K" });
  const copy = page.getByRole("button", { name: "Copied trades: Attach to both" });
  await dflt.click();
  await expect(page.getByRole("listbox", { name: "Screenshots with no MT5 match go to" })).toBeVisible();
  await copy.click({ force: true }); // a click outside closes the open menu first
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await copy.click();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Attach to both" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Only the first account" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await expect(copy).toBeFocused();
  await copy.click();
  await page.getByRole("option", { name: "Ask me each time" }).click();
  await expect(page.getByRole("button", { name: "Copied trades: Ask me each time" })).toBeVisible();
  await expect(page.locator(".kmenu")).toHaveCount(0);
});

test("keyboard: Enter opens a menu with focus on the selected option; typing jumps", async ({ page }) => {
  await page.goto("/accounts");
  const dflt = page.getByRole("button", { name: /Screenshots with no MT5 match go to/ });
  await dflt.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "Challenge 50K" })).toBeFocused();
  await page.keyboard.press("b");
  await expect(page.getByRole("option", { name: "Backtesting" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Screenshots with no MT5 match go to: Backtesting" })).toBeVisible();
  await expect(page.getByText("Default for screenshots")).toHaveCount(1);
});

test("archived accounts: Restore happens at once with an Undo toast that restores exactly", async ({ page }) => {
  await page.goto("/accounts");
  await page.getByRole("button", { name: /Archived \(2\)/ }).click();
  await page.getByRole("button", { name: "Restore" }).first().click();
  await expect(page.getByRole("status")).toContainText("Challenge 25K is back in your lists");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("(6)");
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("(5)");
  await expect(page.getByRole("button", { name: /Archived \(2\)/ })).toBeVisible();
});

test("accounts rows open the edit page", async ({ page }) => {
  await page.goto("/accounts");
  await page.getByRole("link", { name: /Funded 100K/ }).click();
  await expect(page).toHaveURL(/\/accounts\/funded-100k$/);
});

for (const theme of ["light", "dark"])
  test(`accounts has no serious accessibility violations (${theme})`, async ({ page }) => {
    await page.goto(`/accounts?theme=${theme}`);
    const r = await new AxeBuilder({ page }).analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });

test("reduced motion: menus still open and close", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/accounts");
  await page.getByRole("button", { name: /Copied trades/ }).click();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator(".kmenu")).toHaveCount(0);
});

test.describe("phone", () => {
  const { defaultBrowserType: _ignored, ...iphone } = devices["iPhone 13"];
  void _ignored;
  test.use(iphone);
  test("no horizontal scroll and the main card is full-bleed", async ({ page }) => {
    await page.goto("/accounts");
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(sw).toBeLessThanOrEqual(iw);
    const r = await page.locator("#main").evaluate((el) => getComputedStyle(el).borderRadius);
    expect(r).toBe("0px");
  });
});
