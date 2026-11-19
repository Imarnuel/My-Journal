// Weekly review (frame 11): 01-decisions.md "Weekly review", "History in lists", "Behaviour kit"; 03-screens.md states 32, 33.
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { diffAgainst } from "../visual/compare";

const pastWeeks = (page: Page) => page.getByRole("complementary", { name: "Past weeks" });
const month = (page: Page, name: RegExp) => pastWeeks(page).getByRole("button", { name }).first();
const week = (page: Page, label: string) => pastWeeks(page).getByRole("button", { name: new RegExp(`^${label} `) });
const subtitle = (page: Page) => page.locator("header p.meta");
const stat = (page: Page, label: string) => page.locator(".kstat > div").filter({ hasText: label });

test("opens on the latest week traded, with its numbers; the week in progress isn't listed", async ({ page }) => {
  await page.goto("/review");
  await expect(subtitle(page)).toHaveText("Week of 9 to 13 November");
  await expect(page.getByText("The week before, you said")).toBeVisible();
  await expect(page.getByText("“Wait for the 15m candle to close before entering.”").first()).toBeVisible();
  await expect(stat(page, "Net")).toContainText("+3.4R");
  await expect(stat(page, "Trades taken")).toContainText("112 watched · 1 not filled");
  await expect(stat(page, "Plan followed")).toContainText("8 of 11");
  const mist = page.getByRole("region", { name: "Mistakes you tagged more than once" });
  await expect(mist).toContainText("Moved stopEURJPY 13 Nov, GBPUSD 11 Nov−2.0R");
  await expect(page.getByRole("heading", { name: "Your trades 11 trades" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Your reflections" }).getByRole("listitem")).toHaveCount(4);
  await expect(week(page, "9 to 13 Nov")).toHaveAttribute("aria-current", "true");
  await expect(pastWeeks(page).getByText("16 to 20 Nov")).toHaveCount(0);
  await expect(page.locator("#takeaway")).toHaveValue("Leave the stop where I planned it. No moving it to breakeven before 1R.");
  await expect(page.getByText("Saved. It shows on your dashboard all next week.")).toBeVisible();
});

test("past weeks: every traded week, months fold, year header", async ({ page }) => {
  await page.goto("/review");
  const months = pastWeeks(page).locator("button[aria-expanded]");
  await expect(months).toHaveCount(11);
  await expect(month(page, /^November 2 weeks · 18 trades · \+4\.9R/)).toHaveAttribute("aria-expanded", "true");
  await expect(month(page, /^October 3 weeks · 14 trades · 0\.0R/)).toHaveAttribute("aria-expanded", "true");
  await expect(month(page, /^September 4 weeks · 14 trades · \+3\.1R/)).toHaveAttribute("aria-expanded", "false");
  await expect(pastWeeks(page).getByText("2025", { exact: true })).toBeVisible();
  await expect(week(page, "26 to 30 Oct")).toContainText("Not reviewed");
  await expect(pastWeeks(page)).toContainText("Every week you traded is here. Weeks you didn't trade don't appear.");
  // closing an open month folds it to one row
  await month(page, /^November/).click();
  await expect(month(page, /^November/)).toHaveAttribute("aria-expanded", "false");
  await expect(week(page, "9 to 13 Nov")).toHaveCount(0);
  await month(page, /^November/).click();
  await expect(week(page, "9 to 13 Nov")).toBeVisible();
});

test("state 32: open a folded month", async ({ page }, info) => {
  await page.goto("/review");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await month(page, /^September/).click();
  await expect(month(page, /^September/)).toHaveAttribute("aria-expanded", "true");
  await expect(week(page, "21 to 25 Sep")).toContainText("4 trades · +1.9R“Mark the Asian range before London opens.”");
  await expect(week(page, "14 to 18 Sep")).toContainText("Not reviewed");
  await expect(week(page, "31 Aug to 4 Sep")).toBeVisible();
  // the pointer stays on the September row, as in the screenshot
  await diffAgainst(page, "states/32-review-past-month-expanded.png", info);
});

test("state 33: pick a past week loads it, highlights it and scrolls to the top", async ({ page }, info) => {
  await page.goto("/review");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await month(page, /^September/).click();
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await week(page, "14 to 18 Sep").click();
  await expect(page).toHaveURL(/\/review\/2026-09-14$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(subtitle(page)).toHaveText("Week of 14 to 18 September");
  await expect(week(page, "14 to 18 Sep")).toHaveAttribute("aria-current", "true");
  await expect(week(page, "9 to 13 Nov")).not.toHaveAttribute("aria-current", "true");
  await expect(page.getByText("“No trades in the first 15 minutes of the session.”").first()).toBeVisible();
  await expect(stat(page, "Net")).toContainText("+0.6R");
  await expect(stat(page, "Trades taken")).toContainText("2Nothing watched or missed");
  await expect(stat(page, "Plan followed")).toContainText("2 of 2");
  await expect(page.getByRole("region", { name: "Mistakes you tagged more than once" })).toHaveCount(0);
  await expect(page.getByText("No reflections on this week's stories.")).toBeVisible();
  await expect(page.locator("#takeaway")).toHaveValue("");
  await expect(page.getByText("You can still write one. Only your latest week shows on the dashboard.")).toBeVisible();
  // the screenshot was taken with the pointer resting on the row below
  await week(page, "7 to 11 Sep").hover();
  await diffAgainst(page, "states/33-review-past-week-selected.png", info);
});

test("a link to a week opens it (its month opens); an unknown week falls back to the latest", async ({ page }) => {
  await page.goto("/review/2026-07-13");
  await expect(subtitle(page)).toHaveText("Week of 13 to 17 July");
  await expect(week(page, "13 to 17 Jul")).toHaveAttribute("aria-current", "true");
  await page.goto("/review/2026-11-02");
  await expect(subtitle(page)).toHaveText("Week of 2 to 6 November");
  // the week before (26 Oct) wasn't reviewed: the reminder is hidden
  await expect(page.getByText("The week before, you said")).toHaveCount(0);
  await page.goto("/review/2025-11-24");
  await expect(page.getByText("The week before, you said")).toHaveCount(0);
  await page.goto("/review/2026-11-16");
  await expect(subtitle(page)).toHaveText("Week of 9 to 13 November");
  await page.goto("/review/not-a-week");
  await expect(subtitle(page)).toHaveText("Week of 9 to 13 November");
});

test("the takeaway saves as you type and marks the week reviewed", async ({ page }) => {
  await page.goto("/review/2026-10-26");
  const box = page.getByRole("textbox", { name: "What I'll do differently next week" });
  await expect(box).toHaveValue("");
  await expect(page.getByText("You can still write one. Only your latest week shows on the dashboard.")).toBeVisible();
  await box.pressSequentially("Sit on my hands after a loss.");
  await expect(page.getByText("Saved.", { exact: true })).toBeVisible();
  await expect(week(page, "26 to 30 Oct")).toContainText("“Sit on my hands after a loss.”");
  // the next week now shows it as "The week before, you said"
  await week(page, "2 to 6 Nov").click();
  await expect(page.getByText("The week before, you said")).toBeVisible();
  await expect(page.locator(".card").filter({ hasText: "The week before, you said" })).toContainText("“Sit on my hands after a loss.”");
  // kept when leaving the screen and coming back
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Accounts" }).click();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Weekly review" }).click();
  await week(page, "26 to 30 Oct").click();
  await expect(box).toHaveValue("Sit on my hands after a loss.");
  // clearing it makes the week "Not reviewed" again
  await box.fill("");
  await expect(week(page, "26 to 30 Oct")).toContainText("Not reviewed");
});

test("latest week: empty takeaway note, then saved note", async ({ page }) => {
  await page.goto("/review");
  const box = page.locator("#takeaway");
  await box.fill("");
  await expect(page.getByText("Write one thing. It saves as you type and shows on your dashboard all next week.")).toBeVisible();
  await expect(week(page, "9 to 13 Nov")).toContainText("Not reviewed");
  await box.fill("Wait for the close.");
  await expect(page.getByText("Saved. It shows on your dashboard all next week.")).toBeVisible();
  await expect(week(page, "9 to 13 Nov")).toContainText("“Wait for the close.”");
});

test("account picker changes every number and which weeks appear; Escape, outside click, Reset", async ({ page }) => {
  await page.goto("/review");
  const trigger = page.getByRole("button", { name: "3 accounts" });
  await trigger.click();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole("button", { name: "Show only Demo account" }).click();
  await expect(page.getByRole("button", { name: "Demo account" }).first()).toBeVisible();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  // at least one stays ticked
  await page.getByRole("checkbox", { name: /Demo account/ }).click();
  await expect(page.getByRole("checkbox", { name: /Demo account/ })).toBeChecked();
  await page.mouse.click(10, 990); // outside
  await expect(page.locator(".kmenu")).toHaveCount(0);

  await expect(subtitle(page)).toHaveText("Week of 9 to 13 November");
  await expect(stat(page, "Net")).toContainText("+2.4R");
  await expect(stat(page, "Trades taken")).toContainText("1Nothing watched or missed");
  await expect(page.getByRole("heading", { name: "Your trades 1 trade" })).toBeVisible();
  await expect(pastWeeks(page).locator("button[aria-expanded]")).toHaveCount(2);
  await expect(month(page, /^November 2 weeks · 2 trades · \+1\.4R/)).toBeVisible();
  await expect(month(page, /^October 1 week · 1 trade · \+1\.8R/)).toBeVisible();

  await page.getByRole("button", { name: "Demo account" }).first().click();
  await page.getByRole("button", { name: "Reset" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "3 accounts" })).toBeVisible();
  await expect(stat(page, "Net")).toContainText("+3.4R");
});

test("trade cards open their story; Open in trade log", async ({ page }) => {
  await page.goto("/review");
  const cards = page.getByRole("region", { name: /Your trades/ }).getByRole("listitem");
  await expect(cards).toHaveCount(11);
  await expect(cards.first()).toContainText("EURJPYLong−1.0R13 Nov · London breakout · Not followed");
  await expect(cards.nth(1)).toContainText("13 Nov · 4H supply pullback");
  await expect(cards.nth(1)).not.toContainText("Not followed");
  await cards.first().getByRole("link").click();
  await expect(page).toHaveURL(/\/story\/e18$/);
  await page.goto("/review");
  await page.getByRole("link", { name: "Open in trade log" }).click();
  await expect(page).toHaveURL(/\/log$/);
});

test("keyboard: open a month and pick a week without a mouse", async ({ page }) => {
  await page.goto("/review");
  await month(page, /^September/).focus();
  await page.keyboard.press("Enter");
  await expect(month(page, /^September/)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(week(page, "21 to 25 Sep")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/review\/2026-09-21$/);
  await expect(subtitle(page)).toHaveText("Week of 21 to 25 September");
  await page.locator("#takeaway").focus();
  await page.keyboard.type(" Again.");
  await expect(week(page, "21 to 25 Sep")).toContainText("London opens. Again.");
});

for (const theme of ["light", "dark"])
  test(`review has no serious accessibility violations (${theme})`, async ({ page }) => {
    await page.goto(`/review?theme=${theme}`);
    await month(page, /^September/).click();
    const r = await new AxeBuilder({ page }).analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });

test("reduced motion: picking a week and the picker still work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/review");
  await month(page, /^July/).click();
  await week(page, "27 to 31 Jul").click();
  await expect(subtitle(page)).toHaveText("Week of 27 to 31 July");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole("button", { name: "3 accounts" }).click();
  await expect(page.locator(".kmenu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".kmenu")).toHaveCount(0);
});
