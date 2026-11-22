// Chart reading in the real journal (DESIGN.md › Chart reading): each added chart goes to /api/chart-read,
// faked here; the reading rules and the server function are unit tested (src/lib/chartRead.test.ts).
import { expect, test, type Page } from "@playwright/test";

const read = { ok: true, pair: "GBPUSD", dir: "Short", entry: "1.26840", stop: "1.27010", target: "1.26480", timeframe: "15m", unreadable: false };
const png = { name: "chart.png", mimeType: "image/png", buffer: Buffer.from("89504e470d0a1a0a", "hex") };

/** Fake the reader: one answer for every chart, or a list with one answer per chart in order. */
async function server(page: Page, answer: unknown, ready = true) {
  const asked: string[] = [];
  const answers = Array.isArray(answer) ? [...answer] : null;
  await page.route("**/api/voice-note", (r) => r.fulfill({ json: { ready } }));
  await page.route("**/api/chart-read", async (r) => {
    asked.push(r.request().postData() ?? "");
    await new Promise((f) => setTimeout(f, 300));
    return r.fulfill({ body: "  " + JSON.stringify(answers ? answers.shift() : answer), contentType: "application/json" });
  });
  return asked;
}
const trade = (page: Page) => page.getByRole("region", { name: "Trade" });
const addChart = async (page: Page) => {
  await expect(page.getByText("Drop, paste or choose charts")).toBeVisible();
  await page.locator('#main input[type="file"]').first().setInputFiles(png);
};

test("a chart fills the empty facts, says so while reading, and can be undone", async ({ page }) => {
  const asked = await server(page, read);
  await page.goto("/new");
  await addChart(page);
  await expect(trade(page).getByText("Reading your chart…")).toBeVisible();
  await expect(trade(page).getByRole("button", { name: "Pair: GBPUSD" })).toBeVisible();
  await expect(trade(page).getByRole("button", { name: "Direction: Short" })).toBeVisible();
  await expect(trade(page)).toContainText("1.26840");
  await expect(trade(page)).toContainText("1.27010");
  await expect(trade(page)).toContainText("1.26480");
  await expect(page.getByRole("status").filter({ hasText: "Read from your chart: pair, direction and 3 prices" })).toBeVisible();
  const sent = JSON.parse(asked[0]);
  expect(sent.mime).toBe("image/png");
  expect(sent.context.pairs).toContain("GBPUSD");
  await page.getByRole("status").getByRole("button", { name: "Undo" }).click();
  await expect(trade(page).getByRole("button", { name: "Pair: not set" })).toBeVisible();
});

/** Wait until every chart added so far has been read. */
const readAll = async (page: Page, asked: string[], n: number) => {
  await expect.poll(() => asked.length).toBe(n);
  await expect(trade(page).getByText("Reading your chart…")).toHaveCount(0);
};
const filledToast = (page: Page) => page.getByRole("status").filter({ hasText: "Read from your chart" });
const pickPair = async (page: Page, pair: string) => {
  await trade(page).getByRole("button", { name: "Pair: not set" }).click();
  await page.getByRole("option", { name: pair }).click();
};

test("several charts: a chart of another pair fills nothing, silently", async ({ page }) => {
  const asked = await server(page, read); // a GBPUSD chart
  await page.goto("/new");
  await pickPair(page, "EURUSD");
  await addChart(page);
  await readAll(page, asked, 1);
  await expect(trade(page).getByRole("button", { name: "Pair: EURUSD" })).toBeVisible();
  await expect(trade(page).getByRole("button", { name: "Direction: not set" })).toBeVisible();
  await expect(trade(page)).not.toContainText("1.26840");
  await expect(filledToast(page)).toHaveCount(0);
});

test("several charts: the same pair chosen by hand stays, and the chart fills the rest", async ({ page }) => {
  const asked = await server(page, read);
  await page.goto("/new");
  await pickPair(page, "GBPUSD");
  await addChart(page);
  await readAll(page, asked, 1);
  await expect(trade(page).getByRole("button", { name: "Direction: Short" })).toBeVisible();
  await expect(trade(page)).toContainText("1.26480");
  await expect(filledToast(page).filter({ hasText: "direction and 3 prices" })).toBeVisible();
});

test("several charts: a box against the story's direction fills nothing", async ({ page }) => {
  const asked = await server(page, read); // a short
  await page.goto("/new");
  await trade(page).getByRole("button", { name: "Direction: not set" }).click();
  await page.getByRole("option", { name: "Long" }).click();
  await addChart(page);
  await readAll(page, asked, 1);
  await expect(trade(page).getByRole("button", { name: "Pair: not set" })).toBeVisible();
  await expect(trade(page)).not.toContainText("1.26840");
  await expect(filledToast(page)).toHaveCount(0);
});

test("several charts: prices come as one set from one chart, never mixed; the first box wins", async ({ page }) => {
  const noTarget = { ...read, target: null };
  const other = { ...read, entry: "1.26900", stop: "1.27100", target: "1.26300", timeframe: "4H" };
  const asked = await server(page, [noTarget, other]);
  await page.goto("/new");
  await addChart(page);
  await readAll(page, asked, 1);
  await expect(trade(page)).toContainText("1.26840");
  await expect(filledToast(page).filter({ hasText: "pair, direction and 2 prices" })).toBeVisible();
  await page.getByLabel("Add or paste another chart").setInputFiles(png);
  await readAll(page, asked, 2);
  await expect(trade(page)).toContainText("1.27010");
  await expect(trade(page)).not.toContainText("1.26300"); // the second chart's target isn't mixed in
  await expect(trade(page)).not.toContainText("1.26900");
});

test("several charts: a price typed by hand keeps the chart's prices out", async ({ page }) => {
  const asked = await server(page, read);
  await page.goto("/new");
  await trade(page).getByRole("button", { name: /^Entry/ }).click();
  await page.keyboard.type("1.26800");
  await page.keyboard.press("Enter");
  await addChart(page);
  await readAll(page, asked, 1);
  await expect(trade(page)).toContainText("1.26800");
  await expect(trade(page)).not.toContainText("1.27010");
  await expect(filledToast(page).filter({ hasText: "pair and direction" })).toBeVisible();
});

test("prices too small to read: the designed card", async ({ page }) => {
  await server(page, { ...read, dir: null, entry: null, stop: null, target: null, pair: null, unreadable: true });
  await page.goto("/new");
  await addChart(page);
  await expect(page.getByText("Prices on this screenshot are too small to read")).toBeVisible({ timeout: 10_000 }); // slow under a full run
});

test("nothing is read until the AI is set up", async ({ page }) => {
  const asked = await server(page, read, false);
  await page.goto("/new");
  await addChart(page);
  await page.waitForTimeout(800);
  expect(asked.length).toBe(0);
  await expect(trade(page).getByRole("button", { name: "Pair: not set" })).toBeVisible();
});

// ---------- when reading can't happen right away (DESIGN.md › Chart reading)

/** Fake the reader with a reply function per request (its number from 0), after `ms`. */
async function slowServer(page: Page, reply: (n: number) => unknown, ms = 1500) {
  const asked: string[] = [];
  await page.route("**/api/voice-note", (r) => r.fulfill({ json: { ready: true } }));
  await page.route("**/api/chart-read", async (r) => {
    const n = asked.push(r.request().postData() ?? "") - 1;
    await new Promise((f) => setTimeout(f, ms));
    return r.fulfill({ body: "  " + JSON.stringify(reply(n)), contentType: "application/json" }).catch(() => {});
  });
  return asked;
}

test("a chart removed before its reading lands fills nothing", async ({ page }) => {
  const asked = await slowServer(page, () => read);
  await page.goto("/new");
  await addChart(page);
  await expect.poll(() => asked.length).toBe(1);
  await page.getByRole("button", { name: "Remove first chart" }).click();
  await page.waitForTimeout(2000);
  await expect(trade(page).getByRole("button", { name: "Pair: not set" })).toBeVisible();
  await expect(trade(page)).not.toContainText("1.26840");
});

test("saving while a chart is still being read: the reading fills the saved story", async ({ page }) => {
  await slowServer(page, () => read);
  await page.goto("/new");
  await addChart(page);
  await page.getByRole("button", { name: "Save story", exact: true }).click();
  await expect(page).toHaveURL(/\/story\//);
  await expect(trade(page).getByRole("button", { name: "Pair: GBPUSD" })).toBeVisible({ timeout: 8000 });
  await expect(trade(page)).toContainText("1.26840");
  await page.reload();
  await expect(trade(page).getByRole("button", { name: "Pair: GBPUSD" })).toBeVisible(); // saved, not just shown
});

test("nothing is read once pair, direction and prices are all set (saves the free allowance)", async ({ page }) => {
  const asked = await server(page, read);
  await page.goto("/new");
  await addChart(page);
  await expect(trade(page)).toContainText("1.26480");
  await page.getByLabel("Add or paste another chart").setInputFiles(png);
  await expect(page.getByText("2 of 2")).toBeVisible();
  await page.waitForTimeout(800);
  expect(asked.length).toBe(1);
});

test("offline: the chart is read once the device is back online", async ({ page, context }) => {
  const asked = await server(page, read);
  await page.goto("/new");
  await context.setOffline(true);
  await addChart(page);
  await page.waitForTimeout(600);
  expect(asked.length).toBe(0);
  await expect(trade(page).getByText("Reading your chart…")).toHaveCount(0); // nothing is being read
  await context.setOffline(false);
  await expect(trade(page).getByRole("button", { name: "Pair: GBPUSD" })).toBeVisible();
});

test("a busy service is quietly asked again a minute later", async ({ page }) => {
  await page.clock.install();
  const asked = await slowServer(page, (n) => (n === 0 ? { ok: false, reason: "failed" } : read), 50);
  await page.goto("/new");
  await addChart(page);
  await expect.poll(() => asked.length).toBe(1);
  await page.clock.runFor(2000);
  await expect(trade(page).getByRole("button", { name: "Pair: not set" })).toBeVisible(); // silent, nothing filled yet
  await page.clock.runFor(61_000);
  await expect.poll(() => asked.length).toBe(2);
  await page.clock.runFor(1000);
  await expect(trade(page).getByRole("button", { name: "Pair: GBPUSD" })).toBeVisible();
});

test.describe("dates from TradingView's own line", () => {
  test.use({ timezoneId: "UTC" });
  test("a new story takes the capture time printed on the chart", async ({ page }) => {
    await server(page, { ...read, takenAt: "2026-11-12T04:39:00.000Z" });
    await page.goto("/new");
    await addChart(page);
    // Reading can be slow while the whole suite runs: allow it longer than one assertion's default.
    await expect(page.getByRole("status").filter({ hasText: "Read from your chart: pair, direction, date and 3 prices" })).toBeVisible({ timeout: 10_000 });
    await expect(trade(page)).toContainText("12 Nov");
    await expect(trade(page)).toContainText("04:39");
  });
});

test("a fact the reader filled and the owner changed is noted on this device, never shown", async ({ page }) => {
  await server(page, read);
  await page.goto("/new");
  await addChart(page);
  await expect(trade(page).getByRole("button", { name: "Pair: GBPUSD" })).toBeVisible();
  await trade(page).getByRole("button", { name: "Pair: GBPUSD" }).click();
  await page.getByRole("combobox", { name: "Search or type a pair" }).fill("EURUSD");
  await page.keyboard.press("Enter");
  await expect(trade(page).getByRole("button", { name: "Pair: EURUSD" })).toBeVisible();
  const log = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const req = indexedDB.open("journal-real", 1);
        req.onsuccess = () => {
          const r = req.result.transaction("kv").objectStore("kv").get("chart:corrections");
          r.onsuccess = () => resolve(String(r.result ?? ""));
        };
      }),
  );
  expect(JSON.parse(log)).toMatchObject([{ field: "pair", read: "GBPUSD", typed: "EURUSD" }]);
});

// ---------- the approved messages (DESIGN.md › Chart reading, #12, #22, #23, #25)

test("a box with no prices printed: its own card, with the tip only the first time", async ({ page }) => {
  await server(page, { ...read, dir: null, entry: null, stop: null, target: null, unreadable: false, noPrices: true });
  await page.goto("/new");
  await addChart(page);
  const card = page.getByRole("status").filter({ hasText: "This chart has no prices on it" });
  await expect(card).toBeVisible({ timeout: 10_000 });
  await expect(card).toContainText("Click the position box before taking the screenshot and its prices show.");
  await expect(page.getByText("Prices on this screenshot are too small to read")).toHaveCount(0);
  await card.getByRole("button", { name: "Type the numbers" }).click();
  await expect(page.getByLabel("Entry", { exact: true })).toBeFocused();
  // A second time: the card, without the tip.
  await page.goto("/new");
  await addChart(page);
  await expect(page.getByRole("status").filter({ hasText: "This chart has no prices on it" })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Click the position box before taking the screenshot")).toHaveCount(0);
});

test("still can't read after asking again: one quiet line with Try again", async ({ page }) => {
  await page.clock.install();
  const asked = await server(page, { ok: false, reason: "failed" });
  await page.goto("/new");
  await addChart(page);
  await expect.poll(() => asked.length).toBe(1);
  await page.waitForTimeout(700); // the (fake) server answers before the clock moves on
  await page.clock.runFor(61_000);
  await expect.poll(() => asked.length).toBe(2);
  await page.waitForTimeout(700);
  await expect(page.getByText("Couldn't read your chart just now")).toHaveCount(0); // not yet: one more try
  await page.clock.runFor(181_000);
  await expect.poll(() => asked.length).toBe(3);
  const line = trade(page).getByRole("status").filter({ hasText: "Couldn't read your chart just now" });
  await expect(line).toBeVisible();
  await line.getByRole("button", { name: "Try again" }).click();
  await expect.poll(() => asked.length).toBe(4);
});

test("out of free requests: no retries, the same line, and Settings says reading is paused; what's sent is said", async ({ page }) => {
  const asked = await server(page, { ok: false, reason: "quota" });
  await page.goto("/new");
  await addChart(page);
  await expect(trade(page).getByRole("status").filter({ hasText: "Couldn't read your chart just now" })).toBeVisible({ timeout: 10_000 });
  expect(asked.length).toBe(1);
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByText("Chart and voice reading is paused until tomorrow.")).toBeVisible();
  await expect(page.getByText("Charts and voice notes are sent to Google to be read. Google doesn't keep them.")).toBeVisible();
});
