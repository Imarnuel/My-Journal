// The owner's real journal (DESIGN.md › Real app): it starts empty, on today's date, with no sample
// stand-ins. Runs against `vite --mode real` (the "real" project in playwright.config.ts).
import { expect, test } from "@playwright/test";

/** Today as the app writes it in facts: "Fri 20 Nov". */
const todayLabel = () => {
  const d = new Date();
  const wd = d.toLocaleDateString("en-GB", { weekday: "short" });
  const mon = d.toLocaleDateString("en-GB", { month: "short" });
  return `${wd} ${d.getDate()} ${mon}`;
};

test("the Trade log starts empty: Your log starts here", async ({ page }) => {
  await page.goto("/log");
  await expect(page.getByRole("heading", { name: "Your log starts here" })).toBeVisible();
  await expect(page.getByText("USDCHF")).toHaveCount(0);
  await expect(page.getByText(/MT5 synced/)).toHaveCount(0);
});

test("the Playbook starts with no setups", async ({ page }) => {
  await page.goto("/playbook");
  await expect(page.getByText("No setups yet")).toBeVisible();
  await expect(page.getByText("4H supply pullback")).toHaveCount(0);
});

test("New chart story starts blank, dated today, with no voice note to fake", async ({ page }) => {
  await page.goto("/new");
  await expect(page.locator("#main")).toBeVisible();
  await expect(page.getByText("GBPUSD")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Talk it through/ })).toHaveCount(0);
  await expect(page.getByText("Mon 16 Nov")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Trade" })).toContainText(todayLabel());
});

test("the real journal keeps its own saved data, apart from the sample one", async ({ page }) => {
  await page.goto("/log");
  await expect(page.getByRole("heading", { name: "Your log starts here" })).toBeVisible();
  const dbs = await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name));
  expect(dbs).toContain("journal-real");
  expect(dbs).not.toContain("journal");
});
