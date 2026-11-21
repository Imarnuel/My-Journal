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
  await expect(page.getByText("Prices on this screenshot are too small to read")).toBeVisible();
});

test("nothing is read until the AI is set up", async ({ page }) => {
  const asked = await server(page, read, false);
  await page.goto("/new");
  await addChart(page);
  await page.waitForTimeout(800);
  expect(asked.length).toBe(0);
  await expect(trade(page).getByRole("button", { name: "Pair: not set" })).toBeVisible();
});
