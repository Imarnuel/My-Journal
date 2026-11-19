// Dashboard behaviour (03-screens.md "Dashboard", 01-decisions.md "Dashboard", "Behaviour kit", "Small samples")
// and the states in handoff/screenshots/states/01 to 06.
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { diffAgainst } from "../visual/compare";

const PNG_1PX = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

async function open(page: Page, url = "/") {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url);
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  await expect(page.locator(".kdraw")).toHaveCount(0); // the line has drawn in
}

const stat = (page: Page, label: string) => page.locator(".kstat > div").filter({ hasText: label }).locator(".num");

test.describe("states (handoff/screenshots/states)", () => {
  test("01 account picker open", async ({ page }, info) => {
    await open(page);
    await page.getByRole("button", { name: "3 accounts" }).click();
    await expect(page.locator(".kmenu")).toBeVisible();
    await diffAgainst(page, "states/01-dashboard-account-picker.png", info, { height: 1000 });
  });

  test("02 period 3 months: R by day becomes R by week", async ({ page }, info) => {
    await open(page);
    await page.getByRole("button", { name: "3 months" }).click();
    await expect(page.getByRole("heading", { name: "R by week" })).toBeVisible();
    await expect(stat(page, "Net R")).toHaveText("+9.1R");
    await expect(stat(page, "Trades taken")).toHaveText("53");
    await page.waitForTimeout(400); // let the line and bars finish morphing
    await diffAgainst(page, "states/02-dashboard-period-3-months.png", info, { height: 1000 });
  });

  test("03 line chart hover", async ({ page }, info) => {
    await open(page);
    const pt = page.locator(".kpt").filter({ hasText: "12 Nov · GBPJPY" });
    await pt.hover();
    await expect(pt.locator(".kpt-on")).toHaveCSS("opacity", "1");
    await expect(pt.locator(".ktip")).toContainText("+5.9R total");
    await diffAgainst(page, "states/03-dashboard-line-chart-hover.png", info, { height: 1000 });
  });

  test("04 bar chart hover", async ({ page }, info) => {
    await open(page);
    const bar = page.locator(".kbar").nth(4); // 6 Nov
    await bar.hover();
    await expect(bar.locator(".ktip-bar")).toHaveCSS("opacity", "1");
    await expect(bar.locator(".ktip-bar")).toContainText("+1.5R1 trade");
    await diffAgainst(page, "states/04-dashboard-bar-chart-hover.png", info, { height: 1000 });
  });

  test("05 both charts as tables", async ({ page }, info) => {
    await open(page);
    await page.locator("section[aria-labelledby=eqh]").getByRole("button", { name: "View as table" }).click();
    await page.locator("section[aria-labelledby=dayh]").getByRole("button", { name: "View as table" }).click();
    await expect(page.getByRole("table", { name: "Each trade in the period, oldest first" })).toBeVisible();
    await expect(page.getByRole("table", { name: "R by day" })).toBeVisible();
    // The screenshot was taken with the pointer still on the second "Show chart".
    await page.locator("section[aria-labelledby=dayh]").getByRole("button", { name: "Show chart" }).hover();
    await diffAgainst(page, "states/05-dashboard-charts-as-tables.png", info, { height: 1000 });
  });

  test("06 skip link focused", async ({ page }, info) => {
    await open(page);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await diffAgainst(page, "states/06-dashboard-skip-link-focused.png", info, { height: 1000 });
  });
});

test("period: one pressed at a time, every number follows", async ({ page }) => {
  await open(page);
  const seg = page.getByRole("group", { name: "Period" });
  await expect(seg.getByRole("button", { name: "This month" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("November so far · 2 to 16 November · all figures in R")).toBeVisible();
  await expect(stat(page, "Net R")).toHaveText("+7.6R");
  await expect(page.getByText("7 of 11 days up")).toBeVisible();

  await seg.getByRole("button", { name: "3 months" }).click();
  await expect(seg.getByRole("button", { name: "3 months" })).toHaveAttribute("aria-pressed", "true");
  await expect(seg.getByRole("button", { name: "This month" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Last 3 months · 17 August to 16 November · all figures in R")).toBeVisible();
  await expect(stat(page, "Expectancy")).toHaveText("+0.17R");
  await expect(stat(page, "Win rate")).toHaveText("43%");
  await expect(stat(page, "Plan followed")).toHaveText("79%");
  await expect(page.getByText("8 of 12 weeks up")).toBeVisible();
  await expect(page.getByText("16 watched · 6 not filled")).toBeVisible();
  await expect(page.locator("section[aria-labelledby=bsh] a").filter({ hasText: "4H supply pullback" })).toContainText("25");
  await expect(page.getByText("42 of 53 trades had no mistake tagged.")).toBeVisible();
  // The chart morphed instead of redrawing from zero.
  await expect(page.locator(".kdraw")).toHaveCount(0);
});

test("fewer than 5 trades: the numbers give way, and the button widens the period", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "This week", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your numbers start after 5 trades" })).toBeVisible();
  await expect(page.getByText("2 trades logged so far. Until then this page shows your chart stories, and the numbers fill in as you go.")).toBeVisible();
  await expect(page.locator(".kstat")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "R over time" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Recent chart stories" })).toBeVisible();
  await page.getByRole("button", { name: "Show this month" }).click();
  await expect(page.getByRole("button", { name: "This month" })).toHaveAttribute("aria-pressed", "true");
  await expect(stat(page, "Net R")).toHaveText("+7.6R");
});

test("account picker: tick, Only, at least one stays, Reset; numbers change, recency doesn't", async ({ page }) => {
  await open(page);
  const recent = page.locator("section[aria-labelledby=rch] a[href^='/story/']");
  await expect(recent).toHaveCount(6);
  const firstStory = await recent.first().getAttribute("href");

  await page.getByRole("button", { name: "3 accounts" }).click();
  await page.getByRole("button", { name: "Show only Main account" }).click();
  await expect(page.getByRole("button", { name: "Main account" }).and(page.locator("[aria-haspopup]"))).toBeVisible();
  await expect(stat(page, "Net R")).toHaveText("−0.4R");
  await expect(stat(page, "Trades taken")).toHaveText("5");
  // At least one stays ticked.
  const main = page.getByRole("checkbox", { name: "Main account" });
  await main.uncheck({ force: true }).catch(() => {});
  await expect(main).toBeChecked();
  // Ticking practice accounts in changes the numbers.
  await page.getByRole("checkbox", { name: /Demo account/ }).check();
  await expect(page.getByRole("button", { name: "2 accounts" })).toBeVisible();
  await expect(recent.first()).toHaveAttribute("href", firstStory!);
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("button", { name: "3 accounts" })).toBeVisible();
  await expect(stat(page, "Net R")).toHaveText("+7.6R");
  await expect(recent).toHaveCount(6);
  await expect(recent.first()).toHaveAttribute("href", firstStory!);
});

test("account picker: click outside and Escape close it; Escape returns focus to the trigger", async ({ page }) => {
  await open(page);
  const trig = page.getByRole("button", { name: "3 accounts" });
  await trig.click();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  await page.mouse.click(700, 900);
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await trig.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".kmenu")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await expect(trig).toBeFocused();
  // Choosing a period while the menu is open closes it.
  await trig.click();
  await page.getByRole("button", { name: "3 months" }).click({ force: true });
  await expect(page.locator(".kmenu")).toHaveCount(0);
});

test("View as table and Show chart swap each chart for its numbers and back", async ({ page }) => {
  await open(page);
  const eq = page.locator("section[aria-labelledby=eqh]");
  await eq.getByRole("button", { name: "View as table" }).click();
  const rows = page.getByRole("table", { name: "Each trade in the period, oldest first" }).getByRole("row");
  await expect(rows).toHaveCount(21);
  await expect(rows.nth(1)).toContainText("2 Nov · EURUSD−1.0R−1.0R");
  await expect(rows.last()).toContainText("16 Nov · EURUSD+0.6R+7.6R");
  await expect(eq.getByRole("img")).toHaveCount(0);
  await eq.getByRole("button", { name: "Show chart" }).click();
  await expect(eq.getByRole("img")).toHaveCount(1);
  // Coming back shows the line without drawing it again.
  await expect(page.locator(".kdraw")).toHaveCount(0);

  const day = page.locator("section[aria-labelledby=dayh]");
  await day.getByRole("button", { name: "View as table" }).click();
  const drows = page.getByRole("table", { name: "R by day" }).getByRole("row");
  await expect(drows).toHaveCount(12);
  await expect(drows.nth(9)).toContainText("12 Nov3+2.7R");
  await page.getByRole("button", { name: "3 months" }).click();
  await expect(page.getByRole("table", { name: "R by week" }).getByRole("row").first()).toContainText("Week");
  await expect(page.getByRole("table", { name: "R by week" }).getByRole("row").nth(1)).toContainText("Week of 17 Aug");
  await expect(page.getByRole("table", { name: "R by week" }).getByRole("row").nth(1)).toContainText("−2.0R");
});

test("keyboard: arrow keys read the chart points", async ({ page }) => {
  await open(page);
  const svg = page.getByRole("img", { name: /Cumulative R, trade by trade, ending at \+7\.6R\. Deepest drawdown −2\.0R\./ });
  await svg.focus();
  await page.keyboard.press("End");
  const last = page.locator(".kpt").last().locator(".kpt-on");
  await expect(last).toHaveCSS("opacity", "1");
  await expect(last).toContainText("16 Nov · EURUSD");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".kpt").nth(19).locator(".kpt-on")).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(page.locator(".kpt").nth(19).locator(".kpt-on")).toHaveCSS("opacity", "0");

  const bars = page.getByRole("img", { name: /^R by trading day: 2 Nov \+0\.8R/ });
  await bars.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".kbar").first().locator(".ktip-bar")).toHaveCSS("opacity", "1");
  await expect(page.locator(".kbar").nth(1).locator(".kbar-fill").last()).toHaveCSS("opacity", "0.3");
});

test("no-charts notice: choosing a chart adds it to that trade, the card leaves, Undo brings it back", async ({ page }) => {
  await open(page);
  const card = page.getByRole("region", { name: "1 trade has no charts yet" });
  // Redesigned (DESIGN.md): the trade's facts on their own line, the instruction under them.
  await expect(card).toContainText("EURUSDLong+0.6R·16 Nov, 11:10·Main account·from MT5");
  await expect(card).toContainText("No screenshot? Scroll back on your chart and take one now. It still counts.");
  await expect(card.getByLabel("Drop, paste or choose charts for EURUSD, 16 Nov")).toBeAttached();
  await card.locator("input[type=file]").setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: PNG_1PX });
  await expect(page.getByRole("status")).toContainText("Chart added to EURUSD");
  await expect(card).toHaveCount(0);
  // The trade is now a story with a chart: it shows in Recent chart stories with the image.
  const story = page.locator("section[aria-labelledby=rch] a[href='/story/e19']");
  await expect(story.locator("img")).toHaveCount(1);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("region", { name: "1 trade has no charts yet" })).toBeVisible();
  await expect(page.locator("section[aria-labelledby=rch] a[href='/story/e19']")).toHaveCount(0);
});

test("no-charts notice: dropping an image works too", async ({ page }) => {
  await open(page);
  const zone = page.locator(".kslot");
  const dt = await page.evaluateHandle((b64) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const d = new DataTransfer();
    d.items.add(new File([bin], "c.png", { type: "image/png" }));
    return d;
  }, PNG_1PX.toString("base64"));
  await zone.dispatchEvent("drop", { dataTransfer: dt });
  await expect(page.getByRole("status")).toContainText("Chart added to EURUSD");
  await expect(page.getByRole("region", { name: "1 trade has no charts yet" })).toHaveCount(0);
});

test("links: setups to their pages, Unsorted to the playbook, stories, new story; no weekly focus (DESIGN.md)", async ({ page }) => {
  await open(page);
  await expect(page.getByText("This week's focus")).toHaveCount(0);
  const setups = page.locator("section[aria-labelledby=bsh]");
  await expect(setups.getByRole("link", { name: /^4H supply pullback/ })).toHaveAttribute("href", "/playbook/4h-supply-pullback");
  await expect(setups.getByRole("link", { name: /^Unsorted/ })).toHaveAttribute("href", "/playbook");
  await expect(setups.getByRole("link", { name: "Open playbook" })).toHaveAttribute("href", "/playbook");
  await expect(page.getByRole("link", { name: "New chart story" })).toHaveAttribute("href", "/new");
  const recent = page.locator("section[aria-labelledby=rch] a[href^='/story/']");
  await expect(recent.first()).toHaveAttribute("href", "/story/e24");
  await expect(recent.first()).toContainText("AUDUSDLongRunningUnsorted");
  await setups.getByRole("link", { name: /^London breakout/ }).click();
  await expect(page).toHaveURL(/\/playbook\/london-breakout$/);
});

test("accessibility: no serious or critical axe violations (light and dark, chart and table views)", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await open(page, `/?theme=${theme}`);
    let r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
    await page.locator("section[aria-labelledby=eqh]").getByRole("button", { name: "View as table" }).click();
    await page.locator("section[aria-labelledby=dayh]").getByRole("button", { name: "View as table" }).click();
    await page.getByRole("button", { name: "3 accounts" }).click();
    r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
  }
});

test("reduced motion: no draw-in, numbers and charts swap at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("path.kdraw")).toHaveCSS("stroke-dashoffset", "0px");
  await page.getByRole("button", { name: "3 months" }).click();
  // Without motion the value is final on the next frame.
  await expect(stat(page, "Net R")).toHaveText("+9.1R", { timeout: 200 });
  await expect(page.getByText("8 of 12 weeks up")).toBeVisible();
  await page.getByRole("button", { name: "This week", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your numbers start after 5 trades" })).toBeVisible();
});

test("numbers count to the new value on a change (not on first load)", async ({ page }) => {
  await page.goto("/");
  await expect(stat(page, "Net R")).toHaveText("+7.6R");
  await page.evaluate(() => {
    const el = [...document.querySelectorAll(".kstat > div")].find((d) => d.textContent?.startsWith("Trades taken"))!.querySelector(".num")!;
    const w = window as unknown as { seen: string[] };
    w.seen = [];
    new MutationObserver(() => w.seen.push(el.textContent ?? "")).observe(el, { characterData: true, subtree: true, childList: true });
  });
  await page.getByRole("button", { name: "3 months" }).click(); // a pointer click animates
  await expect(stat(page, "Trades taken")).toHaveText("53");
  const seen = await page.evaluate(() => (window as unknown as { seen: string[] }).seen);
  expect(new Set(seen).size).toBeGreaterThan(2); // passed through values between 20 and 53
  expect(seen[seen.length - 1]).toBe("53");
});

test("keyboard: a period chosen from the keyboard swaps the numbers at once (no count-up)", async ({ page }) => {
  await open(page);
  // Record every value the number passes through: from the keyboard it goes straight to the new one.
  // (Asserted on the values seen, not on a timeout, so it holds on a slow machine.)
  await page.evaluate(() => {
    const el = [...document.querySelectorAll(".kstat > div")].find((d) => d.textContent?.startsWith("Trades taken"))!.querySelector(".num")!;
    const w = window as unknown as { seen: string[] };
    w.seen = [];
    new MutationObserver(() => w.seen.push(el.textContent ?? "")).observe(el, { characterData: true, subtree: true, childList: true });
  });
  await page.getByRole("button", { name: "3 months" }).focus();
  await page.keyboard.press("Enter");
  await expect(stat(page, "Trades taken")).toHaveText("53");
  const seen = await page.evaluate(() => (window as unknown as { seen: string[] }).seen);
  expect([...new Set(seen)]).toEqual(["53"]);
  await expect(page.getByRole("button", { name: "3 months" })).toHaveAttribute("aria-pressed", "true");
});
