// Chart story (frames 05, 06, 07 and the chart-story states of frame 16): behaviour from 01-decisions.md
// ("Manual entry", "Notes", "Tags", "Capture", "Charts in a story", "Chart story", "Behaviour kit") and the
// states in 03-screens.md (states 15 to 24).
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { MAX_RATIO, maybeApprove, refPath, settle } from "../visual/compare";

/** State screenshots are 1440 × 1000 viewport captures (a fixed toast sits at the viewport's bottom). */
async function diffViewport(page: Page, ref: string, info: TestInfo, maxRatio = MAX_RATIO) {
  const want = PNG.sync.read(fs.readFileSync(refPath(ref)));
  await page.evaluate(() => window.scrollTo(0, 0)); // every state is drawn at the top of the page
  await settle(page);
  const got = PNG.sync.read(await page.screenshot());
  if (maybeApprove(ref, got)) return;
  const { width: W, height: H } = want;
  const d = new PNG({ width: W, height: H });
  const n = pixelmatch(got.data, want.data, d.data, W, H, { threshold: 0.2 });
  const ratio = n / (W * H);
  if (ratio > maxRatio) {
    fs.mkdirSync("test-results/diffs", { recursive: true });
    const base = `test-results/diffs/${ref.replace(/\//g, "_")}`;
    fs.writeFileSync(`${base}.diff.png`, PNG.sync.write(d));
    fs.writeFileSync(`${base}.actual.png`, PNG.sync.write(got));
    await info.attach("diff", { body: PNG.sync.write(d), contentType: "image/png" });
  }
  expect(ratio, `pixels differing from ${ref}`).toBeLessThanOrEqual(maxRatio);
}

/** The app's shared store, through Vite's module graph (the same instance the app uses). */
async function store<T>(page: Page, fn: string): Promise<T> {
  return page.evaluate(async (body) => {
    const url = performance.getEntriesByType("resource").map((e) => e.name).filter((n) => n.includes("/src/data/store.ts")).pop() ?? "/src/data/store.ts";
    const m = await import(/* @vite-ignore */ url);
    return new Function("s", body)(m.useStore);
  }, fn) as Promise<T>;
}

/**
 * The sample data pins e20 as a textbook example (playbook-examples.json, tb: true); frames 07 and
 * states 18 to 24 draw it unpinned. Put the store in the frame's state for those comparisons.
 */
const asDrawn = (page: Page) => store(page, `s.getState().updateEntry("e20", { textbook: false })`);

const toast = (page: Page) => page.locator(".kstatus");
const openStory = async (page: Page, id = "e20") => {
  await page.goto(`/story/${id}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
};
const facts = (page: Page) => page.getByRole("region", { name: "Trade" });
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
});

// ---------- states 15 to 24

test("state 15: New chart story, Setup menu open", async ({ page }, info) => {
  await page.goto("/new");
  await page.getByRole("button", { name: "Setup" }).click();
  await expect(page.getByRole("option", { name: "London breakout" })).toBeVisible();
  await diffViewport(page, "states/15-newstory-setup-menu-open.png", info);
});

test("state 16: recording with timer, Cancel and Stop", async ({ page }, info) => {
  await page.goto("/new");
  await page.getByRole("button", { name: "Talk it through" }).click();
  await expect(page.getByText("Listening · 0:01")).toBeVisible({ timeout: 3000 });
  await diffViewport(page, "states/16-newstory-recording.png", info);
});

test("state 17: Stop fills the notes and empty Details, toast lists them with Undo", async ({ page }, info) => {
  await page.goto("/new");
  await page.getByRole("button", { name: "Talk it through" }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(toast(page)).toContainText("From your note: notes, setup, 3 tags, plan, headspace");
  await page.mouse.move(5, 990);
  await diffViewport(page, "states/17-newstory-after-voice-note-filled.png", info);
});

test("state 18: Story, More menu open", async ({ page }, info) => {
  await openStory(page);
  await asDrawn(page);
  await page.getByRole("button", { name: "More actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Pin as textbook" })).toBeVisible();
  await diffViewport(page, "states/18-story-more-menu-open.png", info);
});

test("state 19: a chart's menu (first chart: Move right, Remove)", async ({ page }, info) => {
  await openStory(page);
  await asDrawn(page);
  await page.getByRole("button", { name: "Actions for first chart" }).click();
  await expect(page.getByRole("menuitem", { name: "Move left" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "Move right" })).toBeVisible();
  await diffViewport(page, "states/19-story-chart-menu-open.png", info);
});

test("state 20: Edit numbers opens six live inputs", async ({ page }, info) => {
  await openStory(page);
  await asDrawn(page);
  await page.getByRole("button", { name: "Edit numbers" }).click();
  for (const l of ["Entry", "Stop", "Target", "Exit", "Size", "Result"]) await expect(facts(page).getByLabel(l, { exact: true })).toBeVisible();
  await diffViewport(page, "states/20-story-edit-numbers-open.png", info);
});

test("state 21: Pin as textbook adds the label and a toast with Undo", async ({ page }, info) => {
  await openStory(page);
  await asDrawn(page);
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Pin as textbook" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Textbook example");
  await expect(toast(page)).toContainText("Pinned as a textbook example in 4H supply pullback");
  await page.mouse.move(5, 990);
  await diffViewport(page, "states/21-story-pinned-textbook.png", info);
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Textbook example");
  expect(await store<boolean>(page, `return s.getState().entries.find((e) => e.id === "e20").textbook`)).toBe(false);
});

test("state 22: Exclude from stats shows the bar with Include again", async ({ page }, info) => {
  await openStory(page);
  await asDrawn(page);
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Exclude from stats" }).click();
  await expect(page.getByText("Excluded from your stats. It still shows in your trade log and playbook.")).toBeVisible();
  expect(await store<boolean>(page, `return s.getState().entries.find((e) => e.id === "e20").excluded`)).toBe(true);
  await page.mouse.move(5, 990);
  await diffViewport(page, "states/22-story-excluded-bar.png", info);
  await page.getByRole("button", { name: "Include again" }).click();
  await expect(page.getByText("Excluded from your stats.")).toHaveCount(0);
  await expect(toast(page)).toContainText("Back in your stats");
  await page.getByRole("button", { name: "More actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Exclude from stats" })).toBeVisible();
});

test("state 23: Delete story shows the deleted state; Undo brings it back exactly", async ({ page }, info) => {
  await openStory(page);
  await asDrawn(page);
  const before = await store<string>(page, `return JSON.stringify(s.getState().entries)`);
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Delete story" }).click();
  await expect(page.getByText("Story deleted")).toBeVisible();
  expect(await store<boolean>(page, `return s.getState().entries.some((e) => e.id === "e20")`)).toBe(false);
  await diffViewport(page, "states/23-story-deleted-state.png", info);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("GBPUSD");
  expect(await store<string>(page, `return JSON.stringify(s.getState().entries)`)).toBe(before);
  // and the way back
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Delete story" }).click();
  await page.getByRole("link", { name: "Back to trade log" }).click();
  await expect(page).toHaveURL(/\/log$/);
});

test("state 24: Headspace menu open", async ({ page }, info) => {
  await openStory(page);
  await asDrawn(page);
  await page.getByRole("button", { name: "Headspace" }).click();
  await expect(page.getByRole("option", { name: "Calm" })).toHaveAttribute("aria-selected", "true");
  await diffViewport(page, "states/24-story-headspace-menu-open.png", info);
});

// ---------- menus (behaviour kit)

test("menus: one open at a time, outside click and Escape close, choosing sets the value", async ({ page }) => {
  await page.goto("/new");
  const setup = page.getByRole("button", { name: "Setup" });
  await setup.click();
  await expect(setup).toHaveAttribute("aria-expanded", "true");
  // another trigger sits above the outside layer: it opens its own menu and the first one closes
  await page.getByRole("button", { name: "Pair: GBPUSD" }).click();
  await expect(page.getByRole("listbox", { name: "Pair" })).toBeVisible();
  await expect(page.getByRole("listbox")).toHaveCount(1);
  await expect(setup).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Headspace" }).click();
  await expect(page.getByRole("listbox", { name: "Headspace" })).toBeVisible();
  await expect(page.getByRole("listbox")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Headspace" })).toBeFocused();
  await page.getByRole("button", { name: "Setup" }).click();
  await page.getByRole("option", { name: "London breakout" }).click();
  await expect(page.getByRole("button", { name: "Setup" })).toContainText("London breakout");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await page.mouse.click(1400, 950);
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("keyboard: open Setup from the keyboard, arrows move, Enter chooses", async ({ page }) => {
  await page.goto("/new");
  await page.getByRole("button", { name: "Setup" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "4H supply pullback" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "London breakout" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Setup" })).toContainText("London breakout");
});

test("the facts line: each part is a menu; Status explains its options; the date picker moves the session", async ({ page }) => {
  await openStory(page);
  await page.getByRole("button", { name: "Status: Taken" }).click();
  await expect(page.getByRole("option", { name: /Taken.*Counts in your results/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Watched.*You saw it, didn't take it/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Not filled.*Order never triggered/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Analysis.*Charts before trading/ })).toBeVisible();
  await page.getByRole("option", { name: /Watched/ }).click();
  await expect(page.locator("header .meta")).toContainText("Watched · Funded 100K");
  await page.getByRole("button", { name: "Pair: GBPUSD" }).click();
  await page.getByRole("option", { name: "EURUSD" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("EURUSD");
  await page.getByRole("button", { name: "Direction: Short" }).click();
  await page.getByRole("option", { name: "Long" }).click();
  await page.getByRole("button", { name: "Account: Funded 100K" }).click();
  await page.getByRole("option", { name: "Main account" }).click();
  const e = await store<{ pair: string; dir: string; status: string; account: string }>(page, `return s.getState().entries.find((e) => e.id === "e20")`);
  expect([e.pair, e.dir, e.status, e.account]).toEqual(["EURUSD", "Long", "Watched", "Main account"]);

  await page.getByRole("button", { name: "Date and time: Mon 16 Nov, 09:45" }).click();
  await page.getByRole("dialog", { name: "Date and time" }).locator("input").fill("2026-11-13T15:10");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("header .meta")).toContainText("Fri 13 Nov, 15:10 to 13:20 · New York");
  await expect(toast(page)).toContainText("Date changed");
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("header .meta")).toContainText("Mon 16 Nov, 09:45 to 13:20 · London");
});

test("Change date from the More menu opens the date and time picker", async ({ page }) => {
  await openStory(page);
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Change date" }).click();
  await expect(page.getByRole("dialog", { name: "Date and time" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog", { name: "Date and time" })).toHaveCount(0);
});

// ---------- notes and the voice note

test("Talk it through: Cancel records nothing", async ({ page }) => {
  await page.goto("/new");
  await page.getByRole("button", { name: "Talk it through" }).click();
  await expect(page.getByText("Talk as long as you like. Stop when you're done.")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).first().click();
  await expect(page.getByRole("button", { name: "Talk it through" })).toBeVisible();
  await expect(page.locator("#nB")).toHaveValue("");
});

test("voice note: Undo restores exactly; it never overwrites what was set by hand", async ({ page }) => {
  await page.goto("/new");
  await page.getByRole("button", { name: "Talk it through" }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.locator("#nB")).toHaveValue(/Short from last week's 4H supply zone/);
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("#nB")).toHaveValue("");
  await expect(page.locator("#nR")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Setup" })).toContainText("Pick a setup");
  await expect(page.getByRole("group", { name: "Tags" }).locator(".pill")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Talk it through" })).toBeVisible();

  // set some details by hand, then record
  await page.locator("#nB").fill("My own words.");
  await page.getByRole("button", { name: "Setup" }).click();
  await page.getByRole("option", { name: "London breakout" }).click();
  await page.getByRole("button", { name: "Not followed" }).click();
  await page.getByRole("button", { name: "Headspace" }).click();
  await page.getByRole("option", { name: "Tired" }).click();
  await page.getByRole("button", { name: "Talk it through" }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(toast(page)).toContainText("From your note: notes, 3 tags");
  await expect(page.locator("#nB")).toHaveValue("My own words.");
  await expect(page.getByRole("button", { name: "Setup" })).toContainText("London breakout");
  await expect(page.getByRole("button", { name: "Not followed" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Headspace" })).toContainText("Tired");
  await expect(page.locator("#nR")).toHaveValue(/Waiting for the candle to close/);
});

test("Suggested reflection: Keep makes it yours, Delete has Undo, editing makes it yours", async ({ page }) => {
  await page.goto("/new");
  await page.getByRole("button", { name: "Talk it through" }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.getByText("Inferred from your note")).toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.locator("#nR")).toHaveValue("");
  await expect(toast(page)).toContainText("Reflection deleted");
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("#nR")).toHaveValue(/Waiting for the candle/);
  await expect(page.getByText("Inferred from your note")).toBeVisible();
  await page.getByRole("button", { name: "Keep" }).click();
  await expect(page.getByText("Inferred from your note")).toHaveCount(0);
  await expect(page.locator("#nR")).toHaveValue(/Waiting for the candle/);
});

test("re-record fills only what is still empty", async ({ page }) => {
  await openStory(page);
  await page.locator("#nR").fill("");
  await page.locator("#nB").fill("Kept as typed.");
  await page.getByRole("button", { name: "Re-record" }).click();
  await expect(page.getByText(/Listening/)).toBeVisible();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(toast(page)).toContainText("Notes filled from your note");
  await expect(page.locator("#nB")).toHaveValue("Kept as typed.");
  await expect(page.locator("#nR")).toHaveValue(/Waiting for the candle/);
  await expect(page.getByRole("button", { name: "Setup" })).toContainText("4H supply pullback");
});

test("play and pause the voice note; What you said shows the transcript with tag words highlighted", async ({ page }) => {
  await openStory(page);
  await expect(page.getByText("From your 0:24 voice note")).toBeVisible();
  await page.getByRole("button", { name: "Play your voice note" }).click();
  await expect(page.getByText("Playing 0:01 of 0:24")).toBeVisible({ timeout: 3000 });
  await page.getByRole("button", { name: "Pause your voice note" }).click();
  await expect(page.getByRole("button", { name: "Play your voice note" })).toBeVisible();
  const said = page.getByRole("button", { name: "What you said" });
  await said.click();
  await expect(said).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("mark")).toHaveText(["4H supply pullback", "supply zone", "broke structure", "retest", "calm", "plan"]);
  await said.click();
  await expect(page.locator("mark")).toHaveCount(0);
});

test("notes are editable in place and a saved story saves them at once", async ({ page }) => {
  await openStory(page);
  await page.locator("#nB").fill("Rewritten note.");
  await page.getByRole("link", { name: "Done" }).click();
  await expect(page).toHaveURL(/\/log$/);
  await page.goBack();
  await expect(page.locator("#nB")).toHaveValue("Rewritten note.");
  await expect(page.locator("#nR")).toHaveValue(/Patience paid off/);
  await expect(page.getByRole("button", { name: "Headspace" })).toContainText("Calm");
});

// ---------- frame 16 states

test("frame 16: Couldn't make out your note; Record again records, Type instead focuses Before / during", async ({ page }) => {
  await page.goto("/new?voice=unclear");
  await page.getByRole("button", { name: "Talk it through" }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.getByText("Couldn't make out your note")).toBeVisible();
  await expect(page.getByText("Too much background noise. Nothing was filled in, so nothing wrong was saved.")).toBeVisible();
  await expect(page.locator("#nB")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Setup" })).toContainText("Pick a setup");
  await page.getByRole("button", { name: "Type instead" }).click();
  await expect(page.locator("#nB")).toBeFocused();
  await page.getByRole("button", { name: "Talk it through" }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await page.getByRole("button", { name: "Record again" }).click();
  await expect(page.getByText(/Listening/)).toBeVisible();
});

test("frame 16: Prices on this screenshot are too small to read; Type the numbers, Replace", async ({ page }) => {
  await page.goto("/new?charts=unreadable");
  await expect(page.getByText("Prices on this screenshot are too small to read")).toBeVisible();
  await page.getByRole("button", { name: "Type the numbers" }).click();
  await expect(facts(page).getByLabel("Entry", { exact: true })).toBeFocused();
  await expect(page.getByText("Prices on this screenshot are too small to read")).toHaveCount(0);

  await page.goto("/new?charts=unreadable");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Replace" }).click();
  await (await chooser).setFiles({ name: "sharper.png", mimeType: "image/png", buffer: png });
  await expect(page.getByRole("img", { name: "Your chart" })).toBeVisible();
  await expect(page.getByText("4 of 4")).toBeVisible();
  await expect(page.getByText("Prices on this screenshot are too small to read")).toHaveCount(0);
});

// ---------- tags

test("tags: autocomplete with counts, Enter, Backspace, × with Undo, a new tag asks its kind", async ({ page }) => {
  await page.goto("/new");
  const input = page.getByRole("combobox", { name: "Add a tag" });
  await expect(input).toHaveAttribute("placeholder", "Add a tag");
  await input.click();
  await expect(page.getByRole("listbox", { name: "Matching tags" }).getByRole("option")).toHaveCount(5);
  await expect(page.getByRole("option", { name: /Break of structure.*used 18 times/ })).toBeVisible();
  await input.fill("supp");
  await expect(page.getByRole("option", { name: /Supply zone.*used 7 times/ })).toBeVisible();
  await input.press("Enter");
  const pills = page.getByRole("group", { name: "Tags" }).locator(".pill");
  await expect(pills).toHaveText(["Supply zone"]);
  await expect(input).toHaveAttribute("placeholder", "");
  await input.fill("retest");
  await input.press("Enter");
  await expect(pills).toHaveText(["Supply zone", "Retest"]);
  await input.press("Backspace");
  await expect(pills).toHaveText(["Supply zone"]);
  await page.getByRole("button", { name: "Remove Supply zone" }).click();
  await expect(pills).toHaveCount(0);
  await expect(toast(page)).toContainText("Removed Supply zone");
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(pills).toHaveText(["Supply zone"]);

  await input.fill("revenge entry");
  await expect(page.getByRole("option", { name: "Add “Revenge entry” as a new tag" })).toBeVisible();
  await input.press("Enter");
  const ask = page.getByRole("dialog", { name: "New tag" });
  await expect(ask).toContainText("What kind of tag is Revenge entry? You only set this once.");
  await ask.getByRole("button", { name: /Mistake/ }).click();
  await expect(pills).toHaveText(["Supply zone", "Revenge entry"]);
  await expect(toast(page)).toContainText("New tag “Revenge entry” (mistake)");

  // the kind is stored once the story is saved, and the tag counts as a mistake
  await page.getByRole("button", { name: "Save story" }).click();
  await expect(page).toHaveURL(/\/story\/e\d+$/);
  const kind = await store<string>(page, `return s.getState().tags.find((t) => t.t === "Revenge entry").k`);
  expect(kind).toBe("Mistake");
  const id = page.url().split("/").pop();
  const e = await store<{ mistakes: string[] }>(page, `return s.getState().entries.find((e) => e.id === "${id}")`);
  expect(e.mistakes).toEqual(["Revenge entry"]);
});

test("Plan: Followed / Not followed, click again to clear", async ({ page }) => {
  await page.goto("/new");
  const f = page.getByRole("button", { name: "Followed", exact: true });
  await f.click();
  await expect(f).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Not followed" }).click();
  await expect(f).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Not followed" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Not followed" }).click();
  await expect(page.getByRole("button", { name: "Not followed" })).toHaveAttribute("aria-pressed", "false");
});

// ---------- numbers

test("Edit numbers: live inputs; Result updates the header and the shared store", async ({ page }) => {
  await openStory(page);
  await page.getByRole("button", { name: "Edit numbers" }).click();
  await facts(page).getByLabel("Exit", { exact: true }).fill("1.27010");
  await facts(page).getByLabel("Result", { exact: true }).fill("−1.0R");
  await expect(page.locator("header .num")).toHaveText("−1.0R");
  await expect(facts(page)).toContainText("Exit 1.27010");
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await expect(facts(page).getByLabel("Entry", { exact: true })).toHaveCount(0);
  const e = await store<{ r: number; numbers: { exit: string } }>(page, `return s.getState().entries.find((e) => e.id === "e20")`);
  expect(e.r).toBe(-1);
  expect(e.numbers.exit).toBe("1.27010");
});

// ---------- charts

test("charts: tap a thumbnail to view it large; Move left / Move right; Remove with Undo", async ({ page }) => {
  await openStory(page);
  const big = page.getByRole("region", { name: "Charts" }).locator("figure").first();
  await expect(big).toContainText("5 of 5");
  await page.getByRole("button", { name: "Show first chart" }).click();
  await expect(big).toContainText("Weekly");
  await expect(big).toContainText("1 of 5");
  await expect(page.getByRole("button", { name: "Show first chart" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Actions for first chart" }).click();
  await page.getByRole("menuitem", { name: "Move right" }).click();
  await expect(big).toContainText("2 of 5");
  const caps = page.getByRole("region", { name: "Charts" }).locator("figure[draggable] .lbl");
  await expect(caps).toHaveText(["", "Weekly", "4H", "15m", "15m"]);
  await page.getByRole("button", { name: "Actions for second chart" }).click();
  await page.getByRole("menuitem", { name: "Move left" }).click();
  await expect(caps).toHaveText(["Weekly", "", "4H", "15m", "15m"]);

  await page.getByRole("button", { name: "Actions for fifth chart" }).click();
  await expect(page.getByRole("menuitem", { name: "Move right" })).toHaveCount(0);
  await page.getByRole("menuitem", { name: "Remove" }).click();
  await expect(caps).toHaveCount(4);
  await expect(toast(page)).toContainText("Chart removed");
  await toast(page).getByRole("button", { name: "Undo" }).click();
  await expect(caps).toHaveCount(5);
  const list = await store<string[]>(page, `return s.getState().entries.find((e) => e.id === "e20").chartList`);
  expect(list).toEqual(["gW", "gD", "g4H", "gE", "gA"]);
});

test("charts: drag a tile to reorder", async ({ page }) => {
  await openStory(page);
  const tiles = page.getByRole("region", { name: "Charts" }).locator("figure[draggable]");
  await tiles.nth(0).dragTo(tiles.nth(2));
  await expect(page.getByRole("region", { name: "Charts" }).locator("figure[draggable] .lbl")).toHaveText(["", "4H", "Weekly", "15m", "15m"]);
});

test("charts: the last remaining chart can't be removed", async ({ page }) => {
  await openStory(page, "e10"); // one chart
  await page.getByRole("button", { name: "Actions for first chart" }).click();
  await expect(page.getByText("A story keeps at least one chart")).toBeVisible();
  await expect(page.getByRole("menuitem")).toHaveCount(0);
});

test("charts: + Add is a file picker; a dropped image becomes a chart", async ({ page }) => {
  await page.goto("/new");
  await page.getByLabel("Add or paste another chart").setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: png });
  await expect(page.getByText("5 of 5")).toBeVisible();
  await expect(toast(page)).toContainText("Chart added");
  await expect(page.getByRole("img", { name: "Your chart" })).toBeVisible();

  const dt = await page.evaluateHandle((b64) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const d = new DataTransfer();
    d.items.add(new File([bin], "drop.png", { type: "image/png" }));
    return d;
  }, png.toString("base64"));
  await page.getByRole("region", { name: "Charts" }).dispatchEvent("drop", { dataTransfer: dt });
  await expect(page.getByText("6 of 6")).toBeVisible();

  // a pasted image becomes a chart too
  await page.evaluate((b64) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const d = new DataTransfer();
    d.items.add(new File([bin], "paste.png", { type: "image/png" }));
    document.dispatchEvent(new ClipboardEvent("paste", { clipboardData: d, bubbles: true }));
  }, png.toString("base64"));
  await expect(page.getByText("7 of 7")).toBeVisible();
});

// ---------- saving and navigation

test("Save story adds the entry to the store and opens the saved story", async ({ page }) => {
  await page.goto("/new");
  const n = await store<number>(page, `return s.getState().entries.length`);
  await page.getByRole("button", { name: "Talk it through" }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await page.getByRole("button", { name: "Save story" }).click();
  await expect(page).toHaveURL(/\/story\/e\d+$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("GBPUSD");
  await expect(page.locator("header .meta")).toHaveText("Taken · Funded 100K · Mon 16 Nov, 09:45 · London");
  await expect(page.getByRole("link", { name: "Done" })).toBeVisible();
  await expect(page.getByText("From your 0:24 voice note")).toBeVisible();
  expect(await store<number>(page, `return s.getState().entries.length`)).toBe(n + 1);
  const id = page.url().split("/").pop();
  const e = await store<{ setup: string; tags: string[]; followed: boolean; chartList: string[]; r: number }>(page, `return s.getState().entries.find((e) => e.id === "${id}")`);
  expect(e.setup).toBe("4H supply pullback");
  expect(e.tags).toEqual(["Supply zone", "Break of structure", "Retest"]);
  expect(e.followed).toBe(true);
  expect(e.chartList).toEqual(["gW", "gD", "g4H", "gE"]);
  expect(e.r).toBe(2.1);
});

test("Cancel and the Trade log link go back to the trade log", async ({ page }) => {
  await page.goto("/new");
  await page.getByRole("link", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/log$/);
  await openStory(page);
  await page.getByRole("link", { name: "Trade log" }).first().click();
  await expect(page).toHaveURL(/\/log$/);
});

test("every saved entry opens in the story; the analysis is linked by its own date and time", async ({ page }) => {
  await openStory(page);
  const link = page.getByRole("link", { name: /Your analysis before this trade · Mon 16 Nov, 07:30/ });
  await expect(link).toContainText("“Dollar weak into New York. Only shorts on GBP below the weekly level.”");
  await link.click();
  await expect(page).toHaveURL(/\/story\/e26$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Analysis");
  await expect(page.locator("#nB")).toHaveValue("Dollar weak into New York. Only shorts on GBP below the weekly level.");

  await openStory(page, "e18");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("EURJPY");
  await expect(page.locator("header .meta")).toHaveText("Taken · Challenge 50K · Fri 13 Nov, 10:05 · London");
  await expect(page.locator("header .num")).toHaveText("−1.0R");
  await expect(page.locator("#nR")).toHaveValue("Chased the London open after missing my entry. Moved the stop too.");
  await expect(page.getByRole("group", { name: "Tags" }).locator(".pill")).toHaveText(["Moved stop", "Chased entry"]);
  await expect(page.getByRole("button", { name: "Not followed" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("2 of 2")).toBeVisible();

  await page.goto("/story/nope");
  await expect(page).toHaveURL(/\/log$/);
});

// ---------- accessibility and reduced motion

for (const [name, go] of [
  ["New chart story", async (p: Page, q: string) => p.goto(`/new?${q}`)],
  [
    "New chart story after the note",
    async (p: Page, q: string) => {
      await p.goto(`/new?${q}`);
      await p.getByRole("button", { name: "Talk it through" }).click();
      await p.getByRole("button", { name: "Stop" }).click();
      await p.getByRole("button", { name: "What you said" }).click();
    },
  ],
  ["Story", async (p: Page, q: string) => p.goto(`/story/e20?${q}`)],
  [
    "New chart story with the Setup menu open",
    async (p: Page, q: string) => {
      await p.goto(`/new?${q}`);
      await p.getByRole("button", { name: "Setup" }).click();
    },
  ],
  [
    "Story with the More menu and numbers open",
    async (p: Page, q: string) => {
      await p.goto(`/story/e20?${q}`);
      await p.getByRole("button", { name: "Edit numbers" }).click();
      await p.getByRole("button", { name: "More actions" }).click();
    },
  ],
  [
    "New chart story with both frame 16 problems",
    async (p: Page, q: string) => {
      await p.goto(`/new?voice=unclear&charts=unreadable&${q}`);
      await p.getByRole("button", { name: "Talk it through" }).click();
      await p.getByRole("button", { name: "Stop" }).click();
      await p.getByText("Couldn't make out your note").waitFor();
    },
  ],
  [
    "Story with the tag menu open",
    async (p: Page, q: string) => {
      await p.goto(`/story/e20?${q}`);
      await p.getByRole("combobox", { name: "Add a tag" }).click();
    },
  ],
] as const)
  for (const theme of ["light", "dark"] as const)
    test(`axe: ${name} (${theme}) has no serious or critical issues`, async ({ page }) => {
      await go(page, `theme=${theme}`);
      await expect(page.locator("#nB")).toBeVisible();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });

test("reduced motion: recording, menus and toasts still work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/new");
  await page.getByRole("button", { name: "Talk it through" }).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(toast(page)).toBeVisible();
  await page.getByRole("button", { name: "Headspace" }).click();
  await page.getByRole("option", { name: "Focused" }).click();
  await expect(page.getByRole("button", { name: "Headspace" })).toContainText("Focused");
});
