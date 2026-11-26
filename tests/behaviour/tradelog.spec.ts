// Trade log (frames 03, 04 and the Trade log states of frame 16): behaviour from 01-decisions.md
// ("Trade log", "Behaviour kit", "Capture") and the states in 03-screens.md (states 07 to 14).
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { MAX_RATIO, settle, refPath, maybeApprove } from "../visual/compare";

/**
 * The state screenshots are 1440 × 1000 viewport captures (a fixed toast sits at the viewport's bottom),
 * so these compare the viewport, not the full page that `diffAgainst()` captures.
 */
async function diffViewport(page: Page, ref: string, info: TestInfo, maxRatio = MAX_RATIO) {
  const want = PNG.sync.read(fs.readFileSync(refPath(ref)));
  // The states are drawn at the top of the page. Under load Playwright may scroll an element into view
  // before clicking it (layout still settling), so put the page back at the top before capturing.
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  const got = PNG.sync.read(await page.screenshot());
  if (maybeApprove(ref, got)) return;
  const { width: W, height: H } = want;
  const d = new PNG({ width: W, height: H });
  const n = pixelmatch(got.data, want.data, d.data, W, H, { threshold: 0.2 });
  const ratio = n / (W * H);
  if (ratio > maxRatio) {
    const dir = process.env.DIFF_DIR ?? "test-results/diffs";
    fs.mkdirSync(dir, { recursive: true });
    const base = `${dir}/${ref.replace(/\//g, "_")}`;
    fs.writeFileSync(`${base}.diff.png`, PNG.sync.write(d));
    fs.writeFileSync(`${base}.actual.png`, PNG.sync.write(got));
    await info.attach("diff", { body: PNG.sync.write(d), contentType: "image/png" });
  }
  expect(ratio, `pixels differing from ${ref}`).toBeLessThanOrEqual(maxRatio);
}

/** The shared store, reached through Vite's module graph (same instance the app uses). */
async function setStore(page: Page, fn: string) {
  await page.evaluate(async (body) => {
    // The app's own module instance (Vite adds ?t= after a hot update).
    const url = performance.getEntriesByType("resource").map((e) => e.name).filter((n) => n.includes("/src/data/store.ts")).pop() ?? "/src/data/store.ts";
    const m = await import(/* @vite-ignore */ url);
    new Function("s", body)(m.useStore);
  }, fn);
}

const rows = (page: Page) => page.getByRole("list", { name: "Trade log" }).locator(":scope > li");
const count = (page: Page) => page.locator(".ksticky .meta").first();
const more = (page: Page, i: number) => rows(page).nth(i).getByRole("button", { name: "More actions" });
const toast = (page: Page) => page.locator(".ktoast");

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
});

// ---- States (handoff/screenshots/states) ---------------------------------------------------------

test("state 07: Date filter open, counts beside every option", async ({ page }, info) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Date: All time" }).click();
  const menu = page.getByRole("listbox", { name: "Date" });
  await expect(menu.getByRole("option")).toHaveText([/All time\s*135/, /This week\s*6/, /Last week\s*15/, /This month\s*35/, /Last 3 months\s*81/, /Pick dates/]);
  await diffViewport(page, "states/07-tradelog-date-filter-open.png", info);
});

test("state 08: Pick dates shows From and To, Apply sets the range", async ({ page }, info) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Date: All time" }).click();
  // A real pointer click: Playwright's own scroll-into-view misreads options inside the sticky toolbar.
  const box = (await page.getByRole("option", { name: /Pick dates/ }).boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("2026-11-01");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("2026-11-16");
  await diffViewport(page, "states/08-tradelog-date-pick-dates.png", info);
  await page.getByLabel("From", { exact: true }).fill("2026-11-09");
  await page.getByLabel("To", { exact: true }).fill("2026-11-13");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Date: 9 Nov to 13 Nov" })).toBeVisible();
  await expect(count(page)).toHaveText("15 entries");
  await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible();
});

test("state 09: Setup filter open with counts computed with the other filters applied", async ({ page }, info) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Setup: Any setup" }).click();
  await expect(page.getByRole("listbox", { name: "Setup" })).toBeVisible();
  await diffViewport(page, "states/09-tradelog-setup-filter-open.png", info);
});

test("state 10: row menu open", async ({ page }, info) => {
  await page.goto("/log");
  await more(page, 3).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(page.getByRole("menuitem")).toHaveText(["Change date", "Exclude from stats", "Delete"]);
  await diffViewport(page, "states/10-tradelog-row-menu-open.png", info);
});

test("state 11: Change date dialog", async ({ page }, info) => {
  await page.goto("/log");
  await more(page, 4).click();
  await page.getByRole("menuitem", { name: "Change date" }).click();
  await expect(page.getByRole("dialog", { name: "Change date" })).toBeVisible();
  await expect(page.getByLabel("Date and time")).toHaveValue("2026-11-16T09:45");
  await diffViewport(page, "states/11-tradelog-change-date-dialog.png", info);
});

test("state 12: Exclude from stats, the row says so, Undo toast", async ({ page }, info) => {
  await page.goto("/log");
  await more(page, 4).click();
  await page.getByRole("menuitem", { name: "Exclude from stats" }).click();
  await expect(rows(page).nth(4)).toContainText("Excluded from stats");
  await expect(toast(page)).toContainText("left out of your stats");
  await page.mouse.move(0, 999);
  await diffViewport(page, "states/12-tradelog-excluded-with-undo-toast.png", info);
});

test("state 13: Grid view", async ({ page }, info) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Grid view" }).click();
  await expect(page).toHaveURL(/\/log\?view=grid$/);
  await expect(page.getByRole("button", { name: "Grid view" })).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 999);
  await diffViewport(page, "states/13-tradelog-grid-view.png", info);
});

test("state 14: Count it on the very short trade, toast with Undo", async ({ page }, info) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Count it" }).click();
  await expect(page.getByText("USDCHF closed 8 seconds after opening")).toHaveCount(0);
  await expect(toast(page)).toContainText("USDCHF counts in your stats");
  await expect(count(page)).toHaveText("135 entries");
  await page.mouse.move(0, 999);
  await diffViewport(page, "states/14-tradelog-short-trade-counted-toast.png", info);
});

// ---- Filters, sort, batches ---------------------------------------------------------------------

test("filters: choosing sets the value, counts follow the other filters, zero options are dimmed, Clear filters", async ({ page }) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Setup: Any setup" }).click();
  await page.getByRole("option", { name: /London breakout/ }).click();
  await expect(page.locator(".kmenu")).toHaveCount(0);
  const setupBtn = page.getByRole("button", { name: "Setup: London breakout" });
  await expect(setupBtn).toHaveText(/London breakout/);
  const n = Number((await count(page).textContent())!.split(" ")[0]);
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThan(134);
  await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible();
  // The short trade prompt only sits above the unfiltered list.
  await expect(page.getByText("USDCHF closed 8 seconds after opening")).toHaveCount(0);

  // Status counts are computed with the Setup filter applied and add up to the entry count.
  await page.getByRole("button", { name: "Status: Any status" }).click();
  const opts = page.getByRole("listbox", { name: "Status" }).getByRole("option");
  await expect(opts.first()).toContainText(String(n));
  const nums = await opts.locator(":scope > span:last-child > span:first-child").allTextContents();
  expect(nums.slice(1).map(Number).reduce((a, b) => a + b, 0)).toBe(n);
  // London breakout has no Analysis entries: that option is dimmed, not hidden.
  const analysis = page.getByRole("option", { name: /Analysis/ });
  await expect(analysis).toContainText("0");
  await expect(analysis.locator("span").first()).toHaveCSS("color", await page.evaluate(() => {
    const el = document.createElement("span");
    el.style.color = "var(--text-disabled)";
    document.body.appendChild(el);
    const c = getComputedStyle(el).color;
    el.remove();
    return c;
  }));
  await page.getByRole("option", { name: /^Taken/ }).click();
  await expect(page.getByRole("button", { name: "Status: Taken" })).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(count(page)).toHaveText("135 entries");
  await expect(page.getByRole("button", { name: "Setup: Any setup" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear filters" })).toHaveCount(0);
});

test("a filter set that matches nothing says so and offers Clear filters", async ({ page }) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Status: Any status" }).click();
  await page.getByRole("option", { name: /^Analysis/ }).click();
  await page.getByRole("button", { name: "Direction: Long and short" }).click();
  await page.getByRole("option", { name: /^Long\s*\d+$/ }).click();
  await expect(count(page)).toHaveText("0 entries");
  await expect(page.getByText("No entries match these filters")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).last().click();
  await expect(count(page)).toHaveText("135 entries");
});

test("date presets and pair filter (an analysis on two pairs counts for both)", async ({ page }) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Date: All time" }).click();
  await page.getByRole("option", { name: /This week/ }).click();
  await expect(page.getByRole("button", { name: "Date: This week" })).toBeVisible();
  await expect(count(page)).toHaveText("6 entries");
  await page.getByRole("button", { name: "Pair: Any pair" }).click();
  await expect(page.getByRole("option", { name: /^XAUUSD/ })).toContainText("1");
  await page.getByRole("option", { name: /^XAUUSD/ }).click();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText("GBPUSD, XAUUSD");
});

test("sort: Best R first and Oldest first", async ({ page }) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Sort: Newest first" }).click();
  await page.getByRole("option", { name: "Best R first" }).click();
  await expect(page.getByRole("button", { name: "Sort: Best R first" })).toBeVisible();
  const first = await rows(page).first().locator(".num").nth(1).textContent();
  const second = await rows(page).nth(1).locator(".num").nth(1).textContent();
  const r = (s: string | null) => Number(s!.replace("−", "-").replace("R", ""));
  expect(r(first)).toBeGreaterThanOrEqual(r(second));
  await page.getByRole("button", { name: "Sort: Best R first" }).click();
  await page.getByRole("option", { name: "Oldest first" }).click();
  await expect(rows(page).first()).toContainText("Thu 27 Nov"); // the oldest sample entry, November 2025
});

test("Show older entries loads 12 more at a time", async ({ page }) => {
  await page.goto("/log");
  await expect(rows(page)).toHaveCount(12);
  await expect(page.getByText("Showing 12 of 135")).toBeVisible();
  await page.getByRole("button", { name: "Show older entries" }).click();
  await expect(rows(page)).toHaveCount(24);
  await expect(page.getByText("Showing 24 of 135")).toBeVisible();
});

// ---- Menus: one at a time, outside click, Escape, keyboard ---------------------------------------

test("menus: one open at a time, a click outside closes, Escape closes and returns focus", async ({ page }) => {
  await page.goto("/log");
  const date = page.getByRole("button", { name: "Date: All time" });
  await date.click();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  // Another trigger sits above the click-outside layer: it swaps menus, never two at once.
  await page.getByRole("button", { name: "Pair: Any pair" }).click();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  await expect(page.getByRole("listbox", { name: "Pair" })).toBeVisible();
  // A row's more button sits under the toolbar's click-outside layer: that click only closes the menu.
  await more(page, 0).click({ force: true });
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await more(page, 0).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.mouse.click(700, 60);
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await date.click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await expect(date).toBeFocused();
});

test("keyboard: Enter opens a filter with focus on the selected option, arrows move, Enter chooses", async ({ page }) => {
  await page.goto("/log");
  const dir = page.getByRole("button", { name: "Direction: Long and short" });
  await dir.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: /Long and short/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: /^Short/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Direction: Short" })).toBeFocused();
  await expect(rows(page).first()).toContainText("Short");
});

test("keyboard: row menu, Change date, Escape returns focus to the more button", async ({ page }) => {
  await page.goto("/log");
  const btn = more(page, 1);
  await btn.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Change date" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Date and time")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await expect(btn).toBeFocused();
});

// ---- Row actions with Undo ---------------------------------------------------------------------

test("Exclude from stats becomes Include in stats; Undo restores exactly", async ({ page }) => {
  await page.goto("/log");
  await more(page, 4).click();
  await page.getByRole("menuitem", { name: "Exclude from stats" }).click();
  await expect(rows(page).nth(4)).toContainText("Excluded from stats");
  await more(page, 4).click();
  await expect(page.getByRole("menuitem", { name: "Include in stats" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Include in stats" }).click();
  await expect(toast(page)).toContainText("is back in your stats");
  await expect(rows(page).nth(4)).not.toContainText("Excluded from stats");
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(rows(page).nth(4)).toContainText("Excluded from stats");
});

test("Delete happens at once; Undo puts the entry back in its place", async ({ page }) => {
  await page.goto("/log");
  await expect(rows(page).nth(3)).toContainText("EURUSD");
  await more(page, 3).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(count(page)).toHaveText("134 entries");
  await expect(rows(page).nth(3)).toContainText("GBPUSD");
  await expect(toast(page)).toContainText("trade deleted");
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(count(page)).toHaveText("135 entries");
  await expect(rows(page).nth(3)).toContainText("EURUSD");
  await expect(rows(page).nth(3)).toContainText("Mon 16 Nov, 11:10");
});

test("Change date: what's set is kept when the picker closes, the entry moves to its place, no toast", async ({ page }) => {
  await page.goto("/log");
  await more(page, 1).click();
  await page.getByRole("menuitem", { name: "Change date" }).click();
  await expect(page.getByRole("dialog", { name: "Change date" }).getByRole("button")).toHaveCount(0); // no Save or Cancel
  // Opened and closed without a change: nothing moves.
  await page.getByLabel("Date and time").press("Escape");
  await expect(rows(page).nth(1)).toContainText("Mon 16 Nov, 15:20");
  await more(page, 1).click();
  await page.getByRole("menuitem", { name: "Change date" }).click();
  await page.getByLabel("Date and time").fill("2026-11-12T12:00");
  await page.mouse.click(1400, 950);
  await expect(page.getByRole("dialog", { name: "Change date" })).toHaveCount(0);
  await expect(rows(page).nth(1)).toContainText("EURJPY");
  await expect(rows(page).filter({ hasText: "AUDUSD" }).filter({ hasText: "Thu 12 Nov, 12:00" })).toHaveCount(1);
  await expect(toast(page)).toHaveCount(0);
  // Escape keeps what was set, like clicking away (now on the EURJPY row in place 1).
  await more(page, 1).click();
  await page.getByRole("menuitem", { name: "Change date" }).click();
  await page.getByLabel("Date and time").fill("2026-11-16T07:00");
  await page.getByLabel("Date and time").press("Escape");
  await expect(rows(page).filter({ hasText: "EURJPY" }).filter({ hasText: "Mon 16 Nov, 07:00" })).toHaveCount(1);
});

test("MT5 trade without charts: the drop zone is a file picker; the chosen image shows in the row", async ({ page }) => {
  await page.goto("/log");
  const row = rows(page).nth(3);
  // Facts only (DESIGN.md): the ticket is a fact and the drop zone is the signal, no instruction sentence.
  await expect(row).toContainText("MT5 #48231");
  await expect(row).not.toContainText("No screenshot?");
  await expect(row).toContainText("It still counts");
  await row.locator('input[type="file"]').setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: fs.readFileSync("handoff/screenshots/states/13-tradelog-grid-view.png") });
  await expect(toast(page)).toContainText("Chart added");
  // The upload shows at once (blob:) and is then saved as a data URL so it survives a reload.
  await expect(row.getByRole("img", { name: "Your chart" })).toHaveAttribute("src", /^(blob|data):/);
  await expect(row.getByText("Drop, paste or choose charts")).toHaveCount(0);
  await expect(row).toContainText("Trend continuation, Liquidity sweep"); // now reads as a taken trade with charts
  // The same chart leads the card in Grid view, from the shared store.
  await page.getByRole("button", { name: "Grid view" }).click();
  await expect(rows(page).nth(3).getByRole("img", { name: "Your chart" })).toBeVisible();
});

test("very short trade: a real entry; Leave it out marks its row, Undo brings the prompt back", async ({ page }) => {
  await page.goto("/log");
  // It is the newest entry, and it counts until it's left out (DESIGN.md › Very short trade).
  await expect(rows(page).first()).toContainText("USDCHF");
  await expect(rows(page).first()).not.toContainText("Excluded from stats");
  await expect(rows(page).first().getByText("Drop, paste or choose charts")).toHaveCount(0); // not asked for charts
  await page.getByRole("button", { name: "Leave it out" }).click();
  await expect(toast(page)).toContainText("USDCHF left out of your stats");
  await expect(page.getByText("USDCHF closed 8 seconds after opening")).toHaveCount(0);
  await expect(rows(page).first()).toContainText("Excluded from stats");
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("USDCHF closed 8 seconds after opening")).toBeVisible();
  await expect(rows(page).first()).not.toContainText("Excluded from stats");
});

// ---- Views and navigation -----------------------------------------------------------------------

test("List / Grid toggle keeps the view in the URL", async ({ page }) => {
  await page.goto("/log?view=grid");
  await expect(page.getByRole("button", { name: "Grid view" })).toHaveAttribute("aria-pressed", "true");
  await expect(rows(page).first()).toHaveClass(/card/);
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page).toHaveURL(/\/log$/);
  await expect(page.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true");
});

test("navigation: rows open the story, Add a note opens the story, New chart story goes to /new", async ({ page }) => {
  await page.goto("/log");
  await rows(page).nth(1).getByRole("link", { name: "AUDUSD" }).click();
  await expect(page).toHaveURL(/\/story\/e24$/);
  await page.goto("/log");
  await rows(page).nth(3).getByRole("link", { name: /Add a note/ }).click();
  await expect(page).toHaveURL(/\/story\/e19$/);
  await page.goto("/log?view=grid");
  await rows(page).nth(4).getByRole("link", { name: "GBPUSD" }).click();
  await expect(page).toHaveURL(/\/story\/e20$/);
  await page.goto("/log");
  await page.getByRole("link", { name: "New chart story" }).click();
  await expect(page).toHaveURL(/\/new$/);
});

test("edits in the shared store show at once (one dataset)", async ({ page }) => {
  await page.goto("/log");
  await setStore(page, `s.getState().updateEntry("e24", { pair: "NZDJPY" });`);
  await expect(rows(page).nth(1)).toContainText("NZDJPY");
});

// ---- Frame 16 states that belong here ---------------------------------------------------------

test("brand new: Your log starts here, with New chart story", async ({ page }) => {
  await page.goto("/log");
  await setStore(page, `s.setState({ entries: [] });`);
  await expect(page.getByRole("heading", { name: "Your log starts here" })).toBeVisible();
  await expect(page.getByText("Record a trade, a watched setup or your analysis whenever it suits you. It all lands here, newest first.")).toBeVisible();
  await expect(page.getByRole("group", { name: "Filter" })).toHaveCount(0);
  // One action: the header's button (the empty card doesn't repeat it, first ui-polish audit).
  await expect(page.getByRole("link", { name: "New chart story" })).toHaveCount(1);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});

test("an account that stopped syncing shows Reconnect (hidden with the sample data)", async ({ page }) => {
  await page.goto("/log");
  await expect(page.getByText(/stopped syncing/)).toHaveCount(0);
  await setStore(page, `s.getState().updateAccount("Funded 100K", { source: "mt5-reconnect" });`);
  await expect(page.getByText("Funded 100K stopped syncing yesterday")).toBeVisible();
  await expect(page.getByText("The investor password may have changed. Your screenshots still come in; only the trade numbers are waiting.")).toBeVisible();
  await page.getByRole("link", { name: "Reconnect Funded 100K" }).click();
  await expect(page).toHaveURL(/\/accounts\/funded-100k$/);
});

// ---- Accessibility and reduced motion -----------------------------------------------------------

for (const url of ["/log", "/log?view=grid"])
  for (const theme of ["light", "dark"])
    test(`axe: no serious or critical issues (${url}, ${theme})`, async ({ page }) => {
      await page.goto(`${url}${url.includes("?") ? "&" : "?"}theme=${theme}`);
      await page.getByRole("button", { name: "Setup: Any setup" }).click();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });

test("reduced motion: menus, dialogs and toasts still work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/log");
  await page.getByRole("button", { name: "Date: All time" }).click();
  await page.getByRole("option", { name: /Last week/ }).click();
  await expect(count(page)).toHaveText("15 entries");
  await more(page, 0).click();
  await page.getByRole("menuitem", { name: "Exclude from stats" }).click();
  await expect(toast(page)).toContainText("left out of your stats");
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(toast(page)).toHaveCount(0);
});

test("a chart dropped on a row lands once: the tile settles in, and keeps its place when it's saved (DESIGN.md › Charts landing)", async ({ page }) => {
  await page.goto("/log");
  await page.locator(".trow").filter({ hasText: "EURUSD" }).filter({ hasText: "Drop, paste or choose charts" }).first().evaluate((el) => el.setAttribute("data-test-row", ""));
  const row = page.locator("[data-test-row]"); // the row stays the row once its drop zone is gone
  await row.locator("input[type=file]").setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64") });
  const tile = row.locator(".chart").first();
  await expect(tile).toHaveClass(/kland/);
  expect(await tile.evaluate((el) => el.getAnimations().map((a) => (a as CSSAnimation).animationName))).toContain("kland");
  await tile.evaluate((el) => ((window as unknown as { __tile: Element }).__tile = el));
  // Once saved, its blob: URL becomes a data URL: the same tile, no second landing, no second fade.
  await expect(row.locator(".chart img")).toHaveAttribute("src", /^data:/, { timeout: 5000 });
  expect(await row.locator(".chart").first().evaluate((el) => el === (window as unknown as { __tile: Element }).__tile)).toBe(true);
  await expect(row.locator(".chart img")).not.toHaveAttribute("data-loading", "");
  await page.waitForTimeout(1100);
  await expect(row.locator(".chart").first()).not.toHaveClass(/kland/); // nothing lands twice
});
