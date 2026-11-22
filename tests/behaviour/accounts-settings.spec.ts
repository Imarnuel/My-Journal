// Behaviour for Start, Add account, Edit account and Settings (01-decisions.md "Accounts and MT5",
// "Settings", "Tags", "Behaviour kit"; states 34 to 40 in handoff/screenshots/states).
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { diffAgainst, MAX_RATIO, maybeApprove, refPath, settle } from "../visual/compare";

/** The shared store, read through Vite's module graph (same instance the app uses). */
async function store<T>(page: Page, fn: string): Promise<T> {
  return page.evaluate(async (body) => {
    // Import the exact URL the app loaded (Vite adds ?t= after an edit), so it is the same instance.
    const url = performance.getEntriesByType("resource").map((e) => e.name).find((n) => n.includes("/src/data/store.ts")) ?? "/src/data/store.ts";
    const m = await import(url);
    return new Function("s", `return (${body})(s)`)(m.useStore.getState());
  }, fn);
}

/**
 * Diff the current viewport (not the full page) against a state screenshot. Used for states drawn
 * scrolled down the page (39, 40); same threshold and ratio as diffAgainst.
 */
async function diffViewport(page: Page, ref: string, info: TestInfo, maxRatio = MAX_RATIO) {
  const want = PNG.sync.read(fs.readFileSync(refPath(ref)));
  await settle(page);
  const got = PNG.sync.read(await page.screenshot());
  if (maybeApprove(ref, got)) return;
  const d = new PNG({ width: want.width, height: want.height });
  const n = pixelmatch(got.data, want.data, d.data, want.width, want.height, { threshold: 0.2 });
  const ratio = n / (want.width * want.height);
  if (ratio > maxRatio) {
    fs.mkdirSync("test-results/diffs", { recursive: true });
    fs.writeFileSync(`test-results/diffs/${ref.replace(/\//g, "_")}.diff.png`, PNG.sync.write(d));
    fs.writeFileSync(`test-results/diffs/${ref.replace(/\//g, "_")}.actual.png`, PNG.sync.write(got));
    await info.attach("diff", { body: PNG.sync.write(d), contentType: "image/png" });
  }
  expect(ratio, `pixels differing from ${ref}`).toBeLessThanOrEqual(maxRatio);
}

async function fillMt5(page: Page) {
  await page.getByLabel("Login").fill("51234567");
  await page.getByLabel("Server").fill("FTMO-Demo2");
  await page.getByLabel("Investor password").fill("readonly");
}

const practice = (page: Page) => page.getByRole("switch", { name: "Practice account" });

async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
}

// ---------- Accounts (frame 12, already ported) ----------

test("state 34: Archived (2) opens the archived group", async ({ page }, info) => {
  await page.goto("/accounts");
  await page.getByRole("button", { name: /Archived \(2\)/ }).click();
  await expect(page.getByRole("button", { name: "Restore" })).toHaveCount(2);
  await page.mouse.move(0, 0);
  await diffAgainst(page, "states/34-accounts-archived-open.png", info, { height: 1000 });
});

// ---------- Add account (frame 13) ----------

test("state 35: choosing Demo switches Practice on, and it can be changed", async ({ page }, info) => {
  await page.goto("/accounts/new");
  await expect(practice(page)).toHaveAttribute("aria-checked", "false");
  await fillMt5(page);
  await page.getByRole("button", { name: "Demo", exact: true }).click();
  await expect(page.getByRole("button", { name: "Demo", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Prop firm" })).toHaveAttribute("aria-pressed", "false");
  await expect(practice(page)).toHaveAttribute("aria-checked", "true");
  await page.mouse.move(0, 0);
  await diffAgainst(page, "states/35-addaccount-demo-chosen-practice-on.png", info, { height: 1000 });

  await practice(page).click();
  await expect(practice(page)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "Backtest" }).click();
  await expect(practice(page)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Live" }).click();
  await expect(practice(page)).toHaveAttribute("aria-checked", "false");
});

test("add account: your own type opens a focused field and replaces the chosen chip", async ({ page }) => {
  await page.goto("/accounts/new");
  await page.getByRole("button", { name: "Your own type" }).click();
  const own = page.getByRole("textbox", { name: "Your own type" });
  await expect(own).toBeFocused();
  await own.fill("Swing account");
  await expect(page.locator(".kchip[aria-pressed=true]")).toHaveCount(0);
  await page.getByLabel("Name").fill("Swing 10K");
  await page.getByRole("link", { name: "Add account" }).click();
  await expect(page).toHaveURL(/\/accounts$/);
  const row = page.getByRole("link", { name: /Swing 10K/ });
  await expect(row).toContainText("Swing account");
});

test("add account: MT5 fields let password managers fill them; Test connection shows loading in the button", async ({ page }) => {
  await page.goto("/accounts/new");
  await expect(page.getByLabel("Login")).toHaveAttribute("autocomplete", "username");
  await expect(page.getByLabel("Investor password")).toHaveAttribute("autocomplete", "current-password");
  await expect(page.getByLabel("Investor password")).toHaveAttribute("type", "password");
  await fillMt5(page);
  const btn = page.getByRole("button", { name: "Test connection" });
  const w = (await btn.boundingBox())!.width;
  await btn.click();
  await expect(btn).toHaveAttribute("aria-busy", "true");
  await expect(btn.locator(".kload-label")).toHaveCSS("opacity", "0");
  expect((await btn.boundingBox())!.width).toBe(w); // keeps its width
  await expect(btn).toBeDisabled(); // aria-disabled: not clickable while loading
  await btn.dispatchEvent("click");
  await expect(btn).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("status").filter({ hasText: "Connected" })).toHaveText("Connected · FTMO-Demo2 · 100,000 USD");
  await expect(btn).toHaveCount(0);
  // Changing a field asks for a new test.
  await page.getByLabel("Server").fill("FTMO-Server3");
  await expect(page.getByRole("button", { name: "Test connection" })).toBeVisible();
});

test("add account: adds to the store and goes to Accounts; without a name it stays on the field", async ({ page }) => {
  await page.goto("/accounts/new");
  await page.getByRole("link", { name: "Add account" }).click();
  await expect(page).toHaveURL(/\/accounts\/new$/);
  await expect(page.getByLabel("Name")).toBeFocused();
  await page.getByLabel("Name").fill("Funded 200K");
  await fillMt5(page);
  await page.getByRole("link", { name: "Add account" }).click();
  await expect(page).toHaveURL(/\/accounts$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("(6)");
  const a = await store<{ name: string; type: string; practice: boolean; source: string }>(page, `(s) => s.accounts.find((a) => a.name === "Funded 200K")`);
  expect(a).toMatchObject({ type: "Prop firm", practice: false, source: "mt5" });
  await page.getByRole("link", { name: /Funded 200K/ }).click();
  await expect(page).toHaveURL(/\/accounts\/funded-200k$/);
  await expect(page.getByText("Prop firm · added 16 November · 0 chart stories")).toBeVisible();
});

test("add account: without MT5 it reads from screenshots, and there is no default for screenshots", async ({ page }) => {
  await page.goto("/accounts/new");
  await page.getByRole("switch", { name: "Connect MT5" }).click();
  await expect(page.getByLabel("Login")).toHaveCount(0);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await page.getByLabel("Name").fill("Notebook");
  await page.getByRole("link", { name: "Add account" }).click();
  await expect(page.getByRole("link", { name: /Notebook/ })).toContainText("Your screenshots");
  await expect(page.getByText(/default for screenshots|no MT5 match go to/i)).toHaveCount(0);
});

test("add account: the Accounts link goes back", async ({ page }) => {
  await page.goto("/accounts/new");
  await page.getByRole("main").getByRole("link", { name: "Accounts" }).click();
  await expect(page).toHaveURL(/\/accounts$/);
});

// ---------- Edit account (frame 14) ----------

test("state 36: Delete shows the deleted state; Undo restores the account and its stories exactly", async ({ page }, info) => {
  await page.goto("/accounts/funded-100k");
  const before = await store<string>(page, `(s) => JSON.stringify({ a: s.accounts, e: s.entries.map((e) => e.id), p: s.picked })`);
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("heading", { name: "Funded 100K deleted" })).toBeVisible();
  expect(await store<number>(page, `(s) => s.entries.filter((e) => e.account === "Funded 100K").length`)).toBe(0);
  expect(await store<boolean>(page, `(s) => s.accounts.some((a) => a.name === "Funded 100K")`)).toBe(false);
  await page.mouse.move(0, 0);
  // The frame says 46 chart stories; the sample data has 80 entries on Funded 100K (reported), so the
  // two digits differ: well inside the ratio.
  await diffAgainst(page, "states/36-editaccount-deleted-state.png", info, { height: 1000 });
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("heading", { name: "Funded 100K", exact: true })).toBeVisible();
  expect(await store<string>(page, `(s) => JSON.stringify({ a: s.accounts, e: s.entries.map((e) => e.id), p: s.picked })`)).toBe(before);
});

test("edit account: deleted state has a way back to Accounts", async ({ page }) => {
  await page.goto("/accounts/funded-100k");
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("link", { name: "Back to accounts" }).click();
  await expect(page).toHaveURL(/\/accounts$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("(4)");
  await expect(page.getByRole("link", { name: /Funded 100K/ })).toHaveCount(0);
});

test("edit account: Archive shows a bar with Restore and an Undo toast", async ({ page }) => {
  await page.goto("/accounts/funded-100k");
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(page.getByText("Archived. It has left your account lists; its chart stories stay in your playbook.")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Funded 100K archived");
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText(/^Archived\. It has left/)).toHaveCount(0);
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText(/^Archived\. It has left/)).toHaveCount(0);
  expect(await store<boolean>(page, `(s) => s.accounts.find((a) => a.name === "Funded 100K").archived`)).toBe(false);
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Accounts" }).click();
  await expect(page.getByRole("button", { name: /Archived \(3\)/ })).toBeVisible();
});

test("edit account: rename, type and Practice save with Save changes and go to Accounts", async ({ page }) => {
  await page.goto("/accounts/funded-100k");
  await expect(page.getByLabel("Name")).toHaveValue("Funded 100K");
  await expect(page.getByRole("button", { name: "Prop firm" })).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Name").fill("Funded 100K (phase 2)");
  await page.getByRole("button", { name: "Demo", exact: true }).click();
  await expect(practice(page)).toHaveAttribute("aria-checked", "true");
  await practice(page).click();
  await page.getByRole("link", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/accounts$/);
  const row = page.getByRole("link", { name: /Funded 100K \(phase 2\)/ });
  await expect(row).toContainText("Demo");
  await expect(row).not.toContainText("Practice");
  // Entries follow the rename.
  expect(await store<number>(page, `(s) => s.entries.filter((e) => e.account === "Funded 100K (phase 2)").length`)).toBe(80);
  await row.click();
  await expect(page).toHaveURL(/\/accounts\/funded-100k-phase-2$/);
});

test("edit account: Reconnect confirms with a toast", async ({ page }) => {
  await page.goto("/accounts/funded-100k");
  await expect(page.getByText("Synced 2 min ago · FTMO-Demo2")).toBeVisible();
  await page.getByRole("button", { name: "Reconnect" }).click();
  await expect(page.getByRole("status")).toContainText("reconnected and synced");
});

test("edit account: an address with no account goes back to Accounts", async ({ page }) => {
  await page.goto("/accounts/no-such-account");
  await expect(page).toHaveURL(/\/accounts$/);
});

// ---------- Settings (frame 15) ----------

test("state 37: Review day menu; one menu at a time, outside click and Escape close, choosing sets it", async ({ page }, info) => {
  await page.goto("/settings?theme=system");
  const rday = page.getByRole("button", { name: "Review day: Saturday" });
  await rday.click();
  await expect(page.getByRole("listbox", { name: "Review day" })).toBeVisible();
  await diffAgainst(page, "states/37-settings-review-day-menu.png", info, { height: 1000 });
  // Another menu's trigger: one menu open at a time.
  await page.getByRole("button", { name: "Time zone: Lagos (UTC+1)" }).click();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  await expect(page.getByRole("listbox", { name: "Time zone" })).toBeVisible();
  // A click anywhere outside closes it.
  await page.mouse.click(700, 60);
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await page.getByRole("button", { name: "Time zone: Lagos (UTC+1)" }).click();
  await expect(page.locator(".kmenu")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Time zone: Lagos (UTC+1)" })).toBeFocused();
  await rday.click();
  await page.getByRole("option", { name: "Sunday" }).click();
  await expect(page.locator(".kmenu")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Review day: Sunday" })).toBeVisible();
  expect(await store<string>(page, `(s) => s.settings.reviewDay`)).toBe("Sunday");
  // Kept when coming back to Settings.
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Accounts" }).click();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("button", { name: "Review day: Sunday" })).toBeVisible();
});

test("settings: keyboard opens a menu on the selected option and chooses with Enter", async ({ page }) => {
  await page.goto("/settings");
  const lang = page.getByRole("button", { name: "Voice note language: English" });
  await lang.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "English" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "French" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Voice note language: French" })).toBeVisible();
  const rtime = page.getByRole("button", { name: "Reminder time: 8:00 pm" });
  await rtime.click();
  await page.getByRole("option", { name: "9:00 pm" }).click();
  await expect(page.getByRole("button", { name: "Reminder time: 9:00 pm" })).toBeVisible();
});

test("settings: the reminder and Keep recordings switches flip and are kept", async ({ page }) => {
  await page.goto("/settings");
  for (const name of ["Reminder", "Keep recordings"]) {
    const sw = page.getByRole("switch", { name });
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await sw.click();
    await expect(page.getByRole("switch", { name })).toHaveAttribute("aria-checked", "false");
  }
  expect(await store<unknown[]>(page, `(s) => [s.settings.reminderOn, s.settings.keepRecordings]`)).toEqual([false, false]);
});

test("state 38: Edit session times turns the sessions into time inputs with Done and Reset to defaults", async ({ page }, info) => {
  await page.goto("/settings?theme=system");
  await page.getByRole("button", { name: "Edit session times" }).click();
  await expect(page.getByLabel("Asia starts")).toHaveValue("01:00");
  await expect(page.getByLabel("New York ends")).toHaveValue("23:00");
  await page.getByRole("button", { name: "Reset to defaults" }).hover();
  await diffAgainst(page, "states/38-settings-edit-session-times.png", info, { height: 1000 });
  await page.getByLabel("London starts").fill("08:00");
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByText("08:00 to 17:30")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset to defaults" })).toHaveCount(0);
  await page.getByRole("button", { name: "Edit session times" }).click();
  await page.getByRole("button", { name: "Reset to defaults" }).click();
  await expect(page.getByLabel("London starts")).toHaveValue("09:00");
});

/** States 39 and 40 are drawn scrolled to the Time and sessions section, on the frame's 1630px canvas. */
async function scrollToSessions(page: Page) {
  await page.addStyleTag({ content: ".app{min-height:1630px!important}" });
  await page.evaluate(() => window.scrollTo(0, 630));
}

test("state 39: the Tags and Mistakes rows each open their own list, with use counts", async ({ page }, info) => {
  await page.goto("/settings?theme=system");
  await expect(page.getByText("Headspace (")).toHaveCount(0); // fixed lists aren't shown (DESIGN.md › Settings: tags and mistakes)
  await expect(page.getByText("Plan (")).toHaveCount(0);
  const tagsRow = page.getByRole("button", { name: /^Tags\b/ });
  await tagsRow.click();
  await expect(tagsRow).toHaveAttribute("aria-expanded", "true");
  const tags = page.getByRole("list", { name: "Tags" });
  await expect(tags.getByRole("listitem")).toHaveCount(11); // the handoff's tags and the sample "BOS" (DESIGN.md)
  await expect(tags.getByRole("listitem").first()).toContainText("used 18 times");
  await page.getByRole("button", { name: /^Mistakes\b/ }).click();
  const mistakes = page.getByRole("list", { name: "Mistakes" });
  await expect(mistakes.getByRole("listitem")).toHaveCount(3);
  await expect(mistakes.getByRole("listitem").last().getByRole("textbox", { name: /^Rename / })).toHaveValue("Moved stop");
  await tagsRow.click(); // each closes on its own
  await expect(tags).toHaveCount(0);
  await expect(mistakes).toBeVisible();
  await tagsRow.click();
  await scrollToSessions(page);
  await diffViewport(page, "states/39-settings-manage-tags.png", info);
});

test("settings: renaming a tag in place updates old entries", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: /^Tags\b/ }).click();
  const field = page.getByRole("textbox", { name: "Rename Retest" });
  await field.fill("Retest of zone");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("textbox", { name: "Rename Retest of zone" })).toHaveValue("Retest of zone");
  expect(await store<number[]>(page, `(s) => [s.entries.filter((e) => e.tags.includes("Retest of zone")).length, s.entries.filter((e) => e.tags.includes("Retest")).length]`)).toEqual([7, 0]);
  // An empty name or another tag's name is not kept; Escape cancels.
  const f2 = page.getByRole("textbox", { name: "Rename Retest of zone" });
  await f2.fill("supply zone");
  await f2.blur();
  await expect(f2).toHaveValue("Retest of zone");
  await f2.fill("Something");
  await page.keyboard.press("Escape");
  await expect(f2).toHaveValue("Retest of zone");
});

test("settings: removing a tag happens at once; Undo restores the tag and every entry exactly", async ({ page }) => {
  await page.goto("/settings");
  const snap = `(s) => JSON.stringify({ t: s.tags, e: s.entries.map((e) => [e.id, e.tags, e.mistakes]) })`;
  const before = await store<string>(page, snap);
  await page.getByRole("button", { name: /^Mistakes\b/ }).click();
  await page.getByRole("button", { name: "Remove Chased entry" }).click();
  await expect(page.getByRole("status")).toContainText("“Chased entry” removed from 7 stories");
  await expect(page.getByText("Mistakes (2)")).toBeVisible();
  expect(await store<number>(page, `(s) => s.entries.filter((e) => e.tags.includes("Chased entry") || e.mistakes.includes("Chased entry")).length`)).toBe(0);
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Mistakes (3)")).toBeVisible();
  expect(await store<string>(page, snap)).toBe(before);
});

test("state 40: Merge look-alike tags shows an Undo toast; Undo brings the prompt back", async ({ page }, info) => {
  await page.goto("/settings?theme=system");
  const prompt = page.getByText('"BOS" and "Break of structure" look like the same tag');
  await expect(prompt).toBeVisible();
  await expect(page.getByText("Tags (11)")).toBeVisible();
  await page.getByRole("button", { name: "Merge" }).click();
  await expect(prompt).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Merged into “Break of structure”");
  await expect(page.getByText("Tags (10)")).toBeVisible();
  await page.mouse.move(0, 0);
  await scrollToSessions(page);
  await diffViewport(page, "states/40-settings-tags-merged-toast.png", info);
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(prompt).toBeVisible();
});

test("settings: Merge moves the sample trades tagged BOS to Break of structure; Undo puts them back", async ({ page }) => {
  await page.goto("/settings");
  const counts = `(s) => [s.entries.filter((e) => e.tags.includes("BOS")).length, s.entries.filter((e) => e.tags.includes("Break of structure")).length]`;
  expect(await store<number[]>(page, counts)).toEqual([2, 18]);
  // An entry carrying both keeps one "Break of structure".
  await store(page, `(s) => s.updateEntry(s.entries.find((e) => e.tags.includes("Break of structure")).id, { tags: ["Break of structure", "BOS"] })`);
  await page.getByRole("button", { name: "Merge" }).click();
  expect(await store<number[]>(page, counts)).toEqual([0, 20]);
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  expect(await store<string[]>(page, `(s) => s.entries.find((e) => e.id === "e42").tags`)).toContain("BOS");
  expect(await store<number[]>(page, counts)).toEqual([3, 18]);
});

test("appearance: the switch flips data-theme on <html> at once and persists across reload", async ({ page }) => {
  await page.goto("/settings");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");
  // System follows the computer.
  await page.emulateMedia({ colorScheme: "dark" });
  await page.getByRole("button", { name: "System" }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "System" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Light" }).click();
  await page.goto("/accounts");
  await expect(html).toHaveAttribute("data-theme", "light");
});

// ---------- Start (frame 01) ----------

test("start: no sidebar item is current; every step leads where it says", async ({ page }) => {
  await page.goto("/start");
  await expect(page.getByRole("navigation", { name: "Main" }).locator("[aria-current]")).toHaveCount(0);
  await expect(page.getByText("Main account added. MT5 connected to fill in trade numbers.")).toBeVisible();
  for (const [name, url] of [["Add another", /\/accounts$/], ["Skip for now", /:5173\/$/], ["Add setups", /\/playbook\/new$/], ["New chart story", /\/new$/]] as const) {
    await page.goto("/start");
    await page.getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
  }
});

// ---------- Accessibility, keyboard and reduced motion ----------

for (const url of ["/start", "/accounts/new", "/accounts/funded-100k", "/settings"])
  for (const theme of ["light", "dark"])
    test(`axe: ${url} (${theme}) has no serious or critical violations`, async ({ page }) => {
      await page.goto(`${url}?theme=${theme}`);
      await expect(page.locator("h1")).toBeVisible();
      if (url === "/settings") for (const row of [/^Tags\b/, /^Mistakes\b/]) await page.getByRole("button", { name: row }).click();
      await axe(page);
    });

test("axe: deleted state and Settings with a menu open", async ({ page }) => {
  await page.goto("/accounts/funded-100k");
  await page.getByRole("button", { name: "Delete" }).click();
  await axe(page);
  await page.goto("/settings");
  await page.getByRole("button", { name: "Edit session times" }).click();
  await page.getByRole("button", { name: "Review day: Saturday" }).click();
  await axe(page);
});

test("keyboard only: add an account", async ({ page }) => {
  await page.goto("/accounts/new");
  await page.getByLabel("Name").focus();
  await page.keyboard.type("Keys 5K");
  await page.keyboard.press("Tab"); // Live
  await page.keyboard.press("Tab"); // Prop firm
  await page.keyboard.press("Tab"); // Demo
  await expect(page.getByRole("button", { name: "Demo", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(practice(page)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("link", { name: "Add account" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/accounts$/);
  await expect(page.getByRole("link", { name: /Keys 5K/ })).toContainText("Practice");
});

test("reduced motion: the screens still work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/accounts/new");
  await fillMt5(page);
  await page.getByRole("button", { name: "Test connection" }).click();
  await expect(page.getByText("Connected · FTMO-Demo2 · 100,000 USD")).toBeVisible();
  await page.goto("/accounts/funded-100k");
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Funded 100K archived");
  await page.goto("/settings");
  await page.getByRole("button", { name: "Review day: Saturday" }).click();
  await page.getByRole("option", { name: "Monday" }).click();
  await expect(page.getByRole("button", { name: "Review day: Monday" })).toBeVisible();
  await page.getByRole("button", { name: "Merge" }).click();
  await expect(page.getByRole("status")).toContainText("Merged into “Break of structure”");
});
