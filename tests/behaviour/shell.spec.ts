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

test("choice menu: opens, click outside closes, Escape closes and returns focus, choosing sets the value", async ({ page }) => {
  await page.goto("/accounts");
  const copy = page.getByRole("button", { name: "Copied trades: Attach to both" });
  await copy.click();
  await expect(page.getByRole("listbox", { name: "Copied trades" })).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click({ force: true }); // a click outside closes the menu
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
  await page.getByRole("button", { name: /Copied trades/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "Attach to both" })).toBeFocused();
  await page.keyboard.press("o");
  await expect(page.getByRole("option", { name: "Only the first account" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Copied trades: Only the first account" })).toBeVisible();
});

test("archived accounts: Restore happens at once with an Undo toast that restores exactly", async ({ page }) => {
  await page.goto("/accounts");
  await page.getByRole("button", { name: /Archived \(2\)/ }).click();
  await page.getByRole("button", { name: "Restore" }).first().click();
  await expect(page.getByRole("status")).toContainText("Challenge 25K restored");
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

test("the sidebar stays put while the page scrolls, beside the page only (DESIGN.md › Sidebar stays put)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/log");
  await expect(page.getByText("135 entries")).toBeVisible(); // the log has loaded
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(500);
  expect(await page.locator(".sidebar").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0);
  await page.setViewportSize({ width: 700, height: 800 }); // above the page it's the slim top bar, which stays too
  await page.evaluate(() => scrollTo(0, 1500));
  expect(await page.locator(".sidebar").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0);
});

test("phones: the menu button opens the links in a drawer; Escape, outside or a link closes it (DESIGN.md › Phone navigation)", async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  await page.goto("/log");
  const burger = page.getByRole("button", { name: "Open menu" });
  await expect(burger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".ksidebar-nav")).toBeHidden(); // the links aren't on the bar
  await burger.click();
  const drawer = page.getByRole("dialog", { name: "Menu" });
  await expect(drawer).toBeVisible();
  await expect(burger).toHaveAttribute("aria-expanded", "true");
  await expect(drawer.getByRole("link", { name: "Trade log" })).toBeFocused(); // the page you're on
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(burger).toBeFocused();
  await burger.click();
  await page.mouse.click(370, 400); // outside the drawer
  await expect(drawer).toBeHidden();
  await burger.click();
  await drawer.getByRole("link", { name: "Accounts" }).click();
  await expect(page).toHaveURL(/\/accounts$/);
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  await ctx.close();
});

test("desktop: no menu button, the sidebar's links are on the page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/log");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  await expect(page.locator(".ksidebar-nav").getByRole("link", { name: "Accounts" })).toBeVisible();
});

test("phones: no screen is wider than a 360px phone, and the Details panel stacks (DESIGN.md › Phone layouts)", async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices["iPhone 13"], viewport: { width: 360, height: 800 } });
  const page = await ctx.newPage();
  for (const r of ["/", "/start", "/log", "/new", "/story/e20", "/playbook", "/playbook/4h-supply-pullback", "/playbook/4h-supply-pullback/edit", "/playbook/new", "/review", "/accounts", "/accounts/new", "/accounts/funded-100k", "/settings"]) {
    await page.goto(r);
    await page.locator("#main").waitFor();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), r).toBeLessThanOrEqual(360);
  }
  await page.goto("/story/e20");
  const plan = page.getByRole("group", { name: "Plan" });
  expect(await plan.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true); // "Not followed" is whole
  await ctx.close();
});

test("phones: a menu never runs off the screen; the accounts menu opens inside it (DESIGN.md › Phone layouts)", async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices["iPhone 13"], viewport: { width: 360, height: 760 } });
  const page = await ctx.newPage();
  await page.goto("/playbook");
  await page.getByRole("button", { name: /accounts/ }).first().click();
  const menu = page.locator(".kmenu").first();
  await expect(menu).toBeVisible();
  await page.waitForTimeout(400); // the pop-in has settled
  const box = await menu.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(15);
  expect(box!.x + box!.width).toBeLessThanOrEqual(345);
  await ctx.close();
});
