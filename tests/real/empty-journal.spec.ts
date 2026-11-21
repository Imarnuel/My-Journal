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

// ---- Approved wording for the empty real journal (DESIGN.md › Real app) ----------------------------

test("blank New chart story: asks for charts, nothing promised that the real app can't do", async ({ page }) => {
  await page.goto("/new");
  await expect(page.getByText("Drop the charts and add a note if you like.")).toBeVisible();
  await expect(page.getByText("Drop, paste or choose charts")).toBeVisible();
  await expect(page.getByText("Drag to reorder.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add or paste another chart" })).toHaveCount(0);
  await expect(page.getByText("Tap anything to change")).toBeVisible();
  await expect(page.getByText(/From your note/)).toHaveCount(0);
  await expect(page.locator("#nB")).not.toHaveAttribute("placeholder", /.+/);
  const trade = page.getByRole("region", { name: "Trade" });
  await expect(trade.getByRole("button", { name: "Pair: not set" })).toContainText("Pair");
  await expect(trade.getByRole("button", { name: "Account: not set" })).toContainText("Account");
});

test("a dropped screenshot dates a new story by its file time; a date set by hand stays", async ({ page }) => {
  await page.goto("/new");
  const drop = (iso: string) =>
    page.evaluate((t) => {
      const dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array([137, 80, 78, 71])], "shot.png", { type: "image/png", lastModified: new Date(t).getTime() }));
      const target = document.querySelector("#main input[type=file]")!.closest("section")!; // the charts area
      target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, iso);
  await expect(page.getByText("Drop, paste or choose charts")).toBeVisible(); // the page has loaded
  await drop("2026-03-04T08:15:00");
  const trade = page.getByRole("region", { name: "Trade" });
  await expect(trade).toContainText("Wed 4 Mar, 08:15");
  // Set by hand, then another screenshot: the hand-set date stays.
  await trade.getByRole("button", { name: /^Date and time/ }).click();
  await page.getByRole("textbox", { name: "Date and time" }).fill("2026-03-05T14:30");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(trade).toContainText("Thu 5 Mar, 14:30");
  await drop("2026-03-01T09:00:00");
  await expect(trade).toContainText("Thu 5 Mar, 14:30");
});

test("Start with no account: step 1 is current, with Add account", async ({ page }) => {
  await page.goto("/start");
  const step1 = page.getByRole("listitem").filter({ hasText: "Connect an account" });
  await expect(step1).toHaveAttribute("aria-current", "step");
  await expect(step1).toContainText("Add the account you trade. MT5 is optional.");
  await step1.getByRole("link", { name: "Add account" }).click();
  await expect(page).toHaveURL(/\/accounts\/new$/);
});

test("Accounts with none: No accounts yet, without repeating the practice line", async ({ page }) => {
  await page.goto("/accounts");
  await expect(page.getByRole("heading", { name: "No accounts yet" })).toBeVisible();
  await expect(page.getByText("Add each account you trade. Practice accounts stay out of your numbers.")).toBeVisible();
  await expect(page.getByText(/Practice accounts never mix/)).toHaveCount(0);
});

test("MT5 waits for sync: no password asked, login and server kept, row says waiting", async ({ page }) => {
  await page.goto("/accounts/new");
  await page.getByLabel("Name").fill("Funded 100K");
  await expect(page.getByText("MT5 sync isn't built yet. Your login and server are kept, and trade numbers fill in once it is.")).toBeVisible();
  await expect(page.getByLabel("Investor password")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Test connection" })).toHaveCount(0);
  // Login and server are needed while MT5 is on.
  await page.getByRole("link", { name: "Add account" }).click();
  await expect(page.getByLabel("Login")).toBeFocused();
  await page.getByLabel("Login").fill("12345678");
  await page.getByLabel("Server").fill("FTMO-Server");
  await page.getByRole("link", { name: "Add account" }).click();
  await expect(page.getByRole("link", { name: /Funded 100K/ })).toContainText("MT5 · waiting for sync");
  await page.getByRole("link", { name: /Funded 100K/ }).click();
  await expect(page.getByText("Waiting for sync · FTMO-Server")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reconnect" })).toHaveCount(0);
});

test("Settings: no reminder the real app can't send", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  await expect(page.getByText("One gentle reminder")).toHaveCount(0);
});
