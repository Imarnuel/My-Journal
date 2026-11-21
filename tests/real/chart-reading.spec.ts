// Chart reading in the real journal (DESIGN.md › Chart reading): each added chart goes to /api/chart-read,
// faked here; the reading rules and the server function are unit tested (src/lib/chartRead.test.ts).
import { expect, test, type Page } from "@playwright/test";

const read = { ok: true, pair: "GBPUSD", dir: "Short", entry: "1.26840", stop: "1.27010", target: "1.26480", timeframe: "15m", unreadable: false };
const png = { name: "chart.png", mimeType: "image/png", buffer: Buffer.from("89504e470d0a1a0a", "hex") };

async function server(page: Page, answer: unknown, ready = true) {
  const asked: string[] = [];
  await page.route("**/api/voice-note", (r) => r.fulfill({ json: { ready } }));
  await page.route("**/api/chart-read", async (r) => {
    asked.push(r.request().postData() ?? "");
    await new Promise((f) => setTimeout(f, 300));
    return r.fulfill({ body: "  " + JSON.stringify(answer), contentType: "application/json" });
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

test("a pair chosen by hand is never replaced", async ({ page }) => {
  await server(page, read);
  await page.goto("/new");
  await trade(page).getByRole("button", { name: "Pair: not set" }).click();
  await page.getByRole("option", { name: "EURUSD" }).click();
  await addChart(page);
  await expect(trade(page).getByRole("button", { name: "Direction: Short" })).toBeVisible();
  await expect(trade(page).getByRole("button", { name: "Pair: EURUSD" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Read from your chart: direction and 3 prices" })).toBeVisible();
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
