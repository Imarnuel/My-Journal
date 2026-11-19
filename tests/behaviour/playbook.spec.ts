// Playbook home, setup page and setup editor: behaviour from 01-decisions.md (Playbook, Small samples,
// Behaviour kit) and 03-screens.md, plus the states 25 to 31 compared with handoff/screenshots/states.
import { devices, expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { diffAgainst } from "../visual/compare";

const status = (page: Page) => page.getByRole("status");
const undo = (page: Page) => status(page).getByRole("button", { name: "Undo" });
const card = (page: Page, name: string) => page.getByRole("link", { name: new RegExp(`^${name}`) });
const unsorted = (page: Page) => page.getByRole("heading", { name: /^Unsorted/ });

async function noSerious(page: Page) {
  const r = await new AxeBuilder({ page }).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
}

test.describe("playbook home", () => {
  test("setups show stats, sparkline, early signal; Unsorted counts its stories", async ({ page }) => {
    await page.goto("/playbook");
    await expect(card(page, "4H supply pullback")).toContainText("+0.29R");
    await expect(card(page, "4H supply pullback")).toContainText("41 taken · 7 watched");
    await expect(card(page, "4H supply pullback")).not.toContainText("Early signal");
    await expect(card(page, "London breakout")).toContainText("Early signal");
    await expect(card(page, "Asian range fade")).toContainText("−0.13R");
    await expect(page.getByRole("img", { name: /^Cumulative R, last 20 trades, ending at [+−]\d+\.\dR$/ }).first()).toBeVisible();
    await expect(unsorted(page)).toHaveText("Unsorted (21)");
    await expect(page.getByText("4 of them look alike: daily bullish, Asian low swept, then a 15m break of structure.")).toBeVisible();
  });

  test("account picker changes numbers only; one menu open at a time", async ({ page }) => {
    await page.goto("/playbook");
    await page.getByRole("button", { name: "3 accounts" }).click();
    await page.getByRole("button", { name: "Show only Challenge 50K" }).click();
    await expect(page.getByRole("button", { name: "Challenge 50K", exact: true })).toBeVisible();
    await expect(card(page, "4H supply pullback")).toContainText("9 taken");
    await expect(card(page, "4H supply pullback")).toContainText("Trend appears after 10 trades");
    await expect(unsorted(page)).toHaveText("Unsorted (21)");
    // One menu at a time: a click outside closes the picker; another setup's menu replaces the open one.
    await page.mouse.click(700, 960);
    await expect(page.locator(".kmenu")).toHaveCount(0);
    await page.getByRole("button", { name: "Actions for London breakout" }).click();
    await expect(page.locator(".kmenu")).toHaveCount(1);
    await expect(page.getByRole("menu", { name: "Actions for London breakout" })).toBeVisible();
    await page.getByRole("button", { name: "Actions for Asian range fade" }).click();
    await expect(page.locator(".kmenu")).toHaveCount(1);
    await expect(page.getByRole("menu", { name: "Actions for Asian range fade" })).toBeVisible();
    await page.getByRole("button", { name: "Actions for Asian range fade" }).click();
    await expect(page.locator(".kmenu")).toHaveCount(0);
  });

  test("setup menu: Escape closes and returns focus; outside click closes (state 25)", async ({ page }, info) => {
    await page.goto("/playbook");
    const trig = page.getByRole("button", { name: "Actions for London breakout" });
    await trig.click();
    await expect(page.getByRole("menu", { name: "Actions for London breakout" })).toBeVisible();
    await diffAgainst(page, "states/25-playbook-setup-menu-open.png", info);
    await page.keyboard.press("Escape");
    await expect(page.locator(".kmenu")).toHaveCount(0);
    await expect(trig).toBeFocused();
    await trig.click();
    await page.mouse.click(700, 960);
    await expect(page.locator(".kmenu")).toHaveCount(0);
  });

  test("keyboard: the menu opens with focus inside and arrows move", async ({ page }) => {
    await page.goto("/playbook");
    await page.getByRole("button", { name: "Actions for 4H supply pullback" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem", { name: "Rename" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Edit rules" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/playbook\/4h-supply-pullback\/edit$/);
  });

  test("rename inline: Save renames every story (setup page agrees), Undo restores, Cancel keeps", async ({ page }) => {
    await page.goto("/playbook");
    await page.getByRole("button", { name: "Actions for London breakout" }).click();
    await page.getByRole("menuitem", { name: "Rename" }).click();
    const field = page.getByLabel("Setup name");
    await expect(field).toBeFocused();
    await field.fill("London open break");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(status(page)).toContainText("Renamed to London open break");
    await expect(card(page, "London open break")).toContainText("17 taken · 7 watched");
    await card(page, "London open break").click();
    await expect(page).toHaveURL(/\/playbook\/london-open-break$/);
    await expect(page.getByRole("tab", { name: /Examples/ })).toContainText("28");
    await undo(page).click();
    await expect(page).toHaveURL(/\/playbook$/);
    await page.goto("/playbook");
    await page.getByRole("button", { name: "Actions for London breakout" }).click();
    await page.getByRole("menuitem", { name: "Rename" }).click();
    await page.getByLabel("Setup name").fill("Something else");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(card(page, "London breakout")).toBeVisible();
    await expect(status(page)).toHaveCount(0);
  });

  test("rename Undo restores the name and the stories", async ({ page }) => {
    await page.goto("/playbook");
    await page.getByRole("button", { name: "Actions for Asian range fade" }).click();
    await page.getByRole("menuitem", { name: "Rename" }).click();
    await page.getByLabel("Setup name").fill("Range fade");
    await page.keyboard.press("Enter");
    await expect(card(page, "Range fade")).toBeVisible();
    await undo(page).click();
    await expect(card(page, "Asian range fade")).toContainText("19 taken · 9 watched");
  });

  test("archive: at once with Undo; Archived group with Restore (state 27)", async ({ page }, info) => {
    await page.goto("/playbook");
    await expect(page.getByRole("button", { name: "Archived setups (0)" })).toBeVisible();
    await page.getByRole("button", { name: "Actions for London breakout" }).click();
    await page.getByRole("menuitem", { name: "Archive setup" }).click();
    await expect(status(page)).toContainText("London breakout archived");
    await expect(card(page, "London breakout")).toHaveCount(0);
    await page.getByRole("button", { name: "Archived setups (1)" }).click();
    await expect(page.getByText("28 stories kept")).toBeVisible();
    await page.mouse.move(0, 0);
    await diffAgainst(page, "states/27-playbook-archived-setups-open.png", info);
    await page.getByRole("button", { name: "Restore" }).click();
    await expect(card(page, "London breakout")).toBeVisible();
    await expect(page.getByRole("button", { name: "Archived setups (0)" })).toBeVisible();
    await expect(page.getByText("Nothing archived. Archive a setup you've stopped trading; its stories and examples stay.")).toBeVisible();
  });

  test("archive Undo restores exactly", async ({ page }) => {
    await page.goto("/playbook");
    await page.getByRole("button", { name: "Actions for 4H supply pullback" }).click();
    await page.getByRole("menuitem", { name: "Archive setup" }).click();
    await undo(page).click();
    await expect(page.getByRole("button", { name: "Archived setups (0)" })).toBeVisible();
    const names = await page.locator('a.card[href^="/playbook/"] > span:nth-child(2) > span:first-child').allTextContents();
    expect(names).toEqual(["4H supply pullback", "London breakout", "Asian range fade"]);
  });

  test("delete: its stories move to Unsorted, Undo puts everything back in place", async ({ page }) => {
    await page.goto("/playbook");
    await page.getByRole("button", { name: "Actions for London breakout" }).click();
    await page.getByRole("menuitem", { name: "Delete setup" }).click();
    await expect(status(page)).toContainText("London breakout deleted. Its 28 stories moved to Unsorted");
    await expect(card(page, "London breakout")).toHaveCount(0);
    await expect(unsorted(page)).toHaveText("Unsorted (49)");
    await undo(page).click();
    await expect(unsorted(page)).toHaveText("Unsorted (21)");
    const names = await page.locator('a.card[href^="/playbook/"] > span:nth-child(2) > span:first-child').allTextContents();
    expect(names).toEqual(["4H supply pullback", "London breakout", "Asian range fade"]);
    await expect(card(page, "London breakout")).toContainText("17 taken · 7 watched");
  });

  test("no setups yet (frame 16 state) when every setup is gone", async ({ page }) => {
    await page.goto("/playbook");
    for (const n of ["4H supply pullback", "London breakout", "Asian range fade"]) {
      await page.getByRole("button", { name: `Actions for ${n}` }).click();
      await page.getByRole("menuitem", { name: "Delete setup" }).click();
    }
    await expect(page.getByText("No setups yet", { exact: true })).toBeVisible();
    await expect(page.getByText("Add the setups you trade, or keep logging. When a few similar charts show up, you'll be asked to name them.")).toBeVisible();
    await expect(page.getByRole("link", { name: "New setup" })).toHaveCount(2);
    await expect(page.getByText("Your setups, built from your chart stories.", { exact: true })).toBeVisible();
  });

  test("Name this setup: dialog (state 26), Escape and Cancel close, then on to the rules", async ({ page }, info) => {
    await page.goto("/playbook");
    const btn = page.getByRole("button", { name: "Name this setup" });
    await btn.click();
    const dlg = page.getByRole("dialog", { name: "Name this setup" });
    await expect(dlg).toContainText("4 unsorted stories look alike: daily bullish, Asian low swept, then a 15m break of structure. They move into it.");
    await expect(page.getByLabel("Setup name")).toHaveValue("Asian sweep reversal");
    await page.getByLabel("Setup name").blur();
    await page.mouse.move(0, 0);
    await diffAgainst(page, "states/26-playbook-name-this-setup-dialog.png", info);
    await page.keyboard.press("Escape");
    await expect(dlg).toHaveCount(0);
    await expect(btn).toBeFocused();
    await btn.click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(dlg).toHaveCount(0);
    await btn.click();
    await page.getByLabel("Setup name").fill("Asian low sweep");
    await page.getByRole("button", { name: "Create and add rules" }).click();
    await expect(page).toHaveURL(/\/playbook\/new\?draft=suggestion/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("New setup");
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Asian low sweep");
    await expect(page.getByText("Drafted from 4 unsorted chart stories that look alike. Change anything.")).toBeVisible();
    await page.getByRole("button", { name: "Save setup" }).click();
    await expect(page).toHaveURL(/\/playbook\/asian-low-sweep$/);
    await expect(page.getByRole("tab", { name: /Examples/ })).toContainText("4");
    await expect(page.getByText("Price sweeps the Asian session low")).toBeVisible();
    await expect(page.getByText("Example setup. Yours replace it on day one.")).toHaveCount(0);
    await page.getByRole("link", { name: "Playbook", exact: true }).first().click();
    await expect(unsorted(page)).toHaveText("Unsorted (17)");
    await expect(card(page, "Asian low sweep")).toContainText("Too few trades for numbers");
    await expect(page.getByRole("button", { name: "Name this setup" })).toHaveCount(0);
  });

  test("New setup opens a blank editor; Cancel goes back", async ({ page }) => {
    await page.goto("/playbook");
    await page.getByRole("link", { name: "New setup" }).click();
    await expect(page).toHaveURL(/\/playbook\/new$/);
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
    await expect(page.getByLabel("Rule", { exact: true })).toHaveCount(0);
    await expect(page.getByText("These stories move into this setup")).toHaveCount(0);
    await page.getByRole("link", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/\/playbook$/);
  });

  for (const theme of ["light", "dark"])
    test(`no serious accessibility violations (${theme})`, async ({ page }) => {
      await page.goto(`/playbook?theme=${theme}`);
      await noSerious(page);
      await page.getByRole("button", { name: "Actions for London breakout" }).click();
      await noSerious(page);
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Name this setup" }).click();
      await noSerious(page);
    });

  test("reduced motion: menus, dialog and toasts still work", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/playbook");
    await page.getByRole("button", { name: "Actions for London breakout" }).click();
    await page.getByRole("menuitem", { name: "Archive setup" }).click();
    await expect(status(page)).toContainText("archived");
    await page.getByRole("button", { name: "Name this setup" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("setup page", () => {
  const URL = "/playbook/4h-supply-pullback";

  test("stats follow the picker; examples come from every account and name an unticked one", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByText("Expectancy per trade")).toBeVisible();
    await expect(page.getByText("+0.29R")).toBeVisible();
    await expect(page.getByText("10 Nov · London · Demo account")).toBeVisible();
    await page.getByRole("button", { name: "3 accounts" }).click();
    await page.getByRole("checkbox", { name: "Demo account" }).check();
    await expect(page.getByText("10 Nov · London", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Show only Challenge 50K" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Early signal: fewer than 20 trades")).toBeVisible();
    await expect(page.getByRole("tab", { name: /Examples/ })).toContainText("52");
    await expect(page.getByText("10 Nov · London · Demo account")).toBeVisible();
    await page.getByRole("tab", { name: /Patterns/ }).click();
    await expect(page.getByText("Patterns appear once this setup has 20 trades on these accounts. 9 so far.")).toBeVisible();
    await expect(page.getByRole("tab", { name: /Patterns/ })).toContainText("0");
  });

  test("filters with real counts, 6 at a time with Show more (state 28)", async ({ page }, info) => {
    await page.goto(URL);
    const cards = page.locator('#panel-ex a.card');
    await expect(cards).toHaveCount(6);
    await page.getByRole("button", { name: "Show 6 more of 46" }).click();
    await expect(cards).toHaveCount(12);
    await expect(page.getByRole("button", { name: "Show 6 more of 40" })).toBeVisible();
    await page.getByRole("button", { name: "Losers 22" }).click();
    await expect(page.getByRole("button", { name: "Losers 22" })).toHaveAttribute("aria-pressed", "true");
    await expect(cards).toHaveCount(6);
    await expect(cards.first()).toContainText("−1.0R");
    await page.mouse.move(0, 0);
    await diffAgainst(page, "states/28-setup-losers-filter.png", info);
    await page.getByRole("button", { name: "Not filled 2" }).click();
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText("Not filled");
    await expect(page.getByRole("button", { name: /Show 6 more/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Textbook 3" }).click();
    await expect(cards).toHaveCount(3);
    await cards.first().click();
    await expect(page).toHaveURL(/\/story\/e20$/);
  });

  test("Patterns tab (state 29) and Lessons tab (state 30); arrow keys move between tabs", async ({ page }, info) => {
    await page.goto(URL);
    await page.getByRole("tab", { name: /Patterns/ }).click();
    await expect(page.getByRole("tab", { name: /Patterns/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("47% · 19")).toBeVisible();
    await page.mouse.move(0, 0);
    await diffAgainst(page, "states/29-setup-patterns-tab.png", info);
    await page.getByRole("tab", { name: /Lessons/ }).click();
    await expect(page.getByText("“Patience on the retest paid off. Same again on Gold.”")).toBeVisible();
    await page.mouse.move(0, 0);
    await diffAgainst(page, "states/30-setup-lessons-tab.png", info);
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: /Patterns/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: /Patterns/ })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: /Examples/ })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /Lessons/ }).click();
    await page.getByRole("link", { name: "XAUUSD · 12 Nov" }).click();
    await expect(page).toHaveURL(/\/story\/e15$/);
  });

  test("Not now hides the suggestion everywhere; Undo brings it back", async ({ page }) => {
    await page.goto(URL);
    await page.getByRole("button", { name: "Not now" }).click();
    await expect(status(page)).toContainText("Hidden. It comes back if more stories look alike.");
    await expect(page.getByText("4 unsorted chart stories look alike")).toHaveCount(0);
    await undo(page).click();
    await expect(page.getByText("4 unsorted chart stories look alike")).toBeVisible();
    await page.getByRole("button", { name: "Not now" }).click();
    await page.getByRole("link", { name: "Playbook", exact: true }).first().click();
    await expect(page.getByRole("button", { name: "Name this setup" })).toHaveCount(0);
    await expect(unsorted(page)).toHaveText("Unsorted (21)");
  });

  test("Name this setup goes to the drafted editor; Edit goes to the rules", async ({ page }) => {
    await page.goto(URL);
    await page.getByRole("link", { name: "Name this setup" }).click();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
    await expect(page.getByLabel("Rule", { exact: true })).toHaveCount(6);
    await page.goBack();
    await page.getByRole("link", { name: "Edit rules" }).click();
    await expect(page).toHaveURL(/\/playbook\/4h-supply-pullback\/edit$/);
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("4H supply pullback");
    await expect(page.getByLabel("Rule", { exact: true }).first()).toHaveValue("Daily trend is bearish");
  });

  test("an unknown setup goes back to the playbook", async ({ page }) => {
    await page.goto("/playbook/nothing-here");
    await expect(page).toHaveURL(/\/playbook$/);
  });

  for (const theme of ["light", "dark"])
    test(`no serious accessibility violations (${theme})`, async ({ page }) => {
      await page.goto(`${URL}?theme=${theme}`);
      await noSerious(page);
      await page.getByRole("tab", { name: /Patterns/ }).click();
      await noSerious(page);
      await page.getByRole("tab", { name: /Lessons/ }).click();
      await noSerious(page);
    });
});

test.describe("setup editor", () => {
  const NEW = "/playbook/new?draft=suggestion";

  test("× removes a rule at once with Undo that restores exactly (state 31)", async ({ page }, info) => {
    await page.goto(NEW);
    const rules = page.getByLabel("Rule", { exact: true });
    await expect(rules).toHaveCount(6);
    await page.getByRole("button", { name: "Remove rule" }).first().click();
    await expect(status(page)).toContainText("Rule removed");
    await expect(rules).toHaveCount(5);
    await expect(rules.first()).toHaveValue("Price sweeps the Asian session low");
    await diffAgainst(page, "states/31-setup-editor-rule-removed-toast.png", info);
    await undo(page).click();
    await expect(rules).toHaveCount(6);
    await expect(rules.first()).toHaveValue("Daily trend is bullish");
    await expect(rules.nth(1)).toHaveValue("Price sweeps the Asian session low");
  });

  test("Add a rule gives a focused empty field; rules are editable", async ({ page }) => {
    await page.goto(NEW);
    const exit = page.getByRole("group", { name: "Exit rules" });
    await exit.getByRole("button", { name: "Add a rule" }).click();
    const last = exit.getByLabel("Rule", { exact: true }).last();
    await expect(last).toBeFocused();
    await expect(last).toHaveAttribute("placeholder", "Describe the rule");
    await page.keyboard.type("Move stop to breakeven at 1R");
    await expect(exit.getByLabel("Rule", { exact: true })).toHaveCount(3);
  });

  test("reorder by the grip: drag, and arrow keys on the grip", async ({ page }) => {
    await page.goto(NEW);
    const ctx = page.getByRole("group", { name: "Context rules" });
    const grips = ctx.getByRole("button", { name: "Reorder rule" });
    const a = await grips.first().boundingBox();
    const rows = ctx.locator("[data-row]");
    const b = await rows.nth(1).boundingBox();
    await page.mouse.move(a!.x + a!.width / 2, a!.y + a!.height / 2);
    await page.mouse.down();
    await page.mouse.move(a!.x + a!.width / 2, b!.y + b!.height - 4, { steps: 6 });
    await page.mouse.up();
    await expect(ctx.getByLabel("Rule", { exact: true }).first()).toHaveValue("Price sweeps the Asian session low");
    await expect(ctx.getByLabel("Rule", { exact: true }).nth(1)).toHaveValue("Daily trend is bullish");
    await grips.nth(1).focus();
    await page.keyboard.press("ArrowUp");
    await expect(ctx.getByLabel("Rule", { exact: true }).first()).toHaveValue("Daily trend is bullish");
    await expect(grips.first()).toBeFocused();
  });

  test("click a chart to leave it out; Save moves only the rest", async ({ page }) => {
    await page.goto(NEW);
    const charts = page.locator('section[aria-labelledby="moving"] button[aria-pressed]');
    await expect(charts).toHaveCount(4);
    await charts.first().click();
    await expect(charts.first()).toHaveAttribute("aria-pressed", "false");
    await charts.nth(1).click();
    await charts.nth(1).click();
    await expect(charts.nth(1)).toHaveAttribute("aria-pressed", "true");
    await page.getByLabel("Name", { exact: true }).fill("Asian low sweep");
    await page.getByRole("button", { name: "Save setup" }).click();
    await expect(page.getByRole("tab", { name: /Examples/ })).toContainText("3");
    await page.getByRole("link", { name: "Playbook", exact: true }).first().click();
    await expect(unsorted(page)).toHaveText("Unsorted (18)");
  });

  test("Save needs a name that isn't taken", async ({ page }) => {
    await page.goto(NEW);
    await page.getByRole("button", { name: "Save setup" }).click();
    await expect(page).toHaveURL(/\/playbook\/new/);
    await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
    await page.getByLabel("Name", { exact: true }).fill("London breakout");
    await page.getByRole("button", { name: "Save setup" }).click();
    await expect(page).toHaveURL(/\/playbook\/new/);
  });

  test("Edit rules saves the rules and a new name; stories follow the name", async ({ page }) => {
    await page.goto("/playbook/4h-supply-pullback/edit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("4H supply pullback");
    await page.getByLabel("Rule", { exact: true }).first().fill("Daily trend is bearish and clean");
    await page.getByLabel("Name", { exact: true }).fill("4H supply");
    await page.getByRole("button", { name: "Save setup" }).click();
    await expect(page).toHaveURL(/\/playbook\/4h-supply$/);
    await expect(page.getByText("Daily trend is bearish and clean")).toBeVisible();
    await expect(page.getByText("+0.29R")).toBeVisible();
    await expect(page.getByRole("tab", { name: /Examples/ })).toContainText("52");
  });

  test("Cancel on Edit rules discards and goes back to the setup", async ({ page }) => {
    await page.goto("/playbook/4h-supply-pullback");
    await page.getByRole("link", { name: "Edit rules" }).click();
    await page.getByRole("button", { name: "Remove rule" }).first().click();
    await page.getByRole("link", { name: "Cancel" }).click();
    await expect(page).toHaveURL(/\/playbook\/4h-supply-pullback$/);
    await expect(page.getByText("Daily trend is bearish")).toBeVisible();
  });

  for (const theme of ["light", "dark"])
    test(`no serious accessibility violations (${theme})`, async ({ page }) => {
      await page.goto(`${NEW}&theme=${theme}`);
      await noSerious(page);
    });

  test("reduced motion: removing and restoring a rule still works", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(NEW);
    await page.getByRole("button", { name: "Remove rule" }).first().click();
    await undo(page).click();
    await expect(page.getByLabel("Rule", { exact: true })).toHaveCount(6);
  });
});

test.describe("phone", () => {
  const { defaultBrowserType: _ignored, ...iphone } = devices["iPhone 13"];
  void _ignored;
  test.use(iphone);
  for (const url of ["/playbook", "/playbook/4h-supply-pullback", "/playbook/new?draft=suggestion"])
    test(`no horizontal scroll on ${url}`, async ({ page }) => {
      await page.goto(url);
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      expect(sw).toBeLessThanOrEqual(iw);
    });
});
