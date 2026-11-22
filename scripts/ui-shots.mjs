// ui-polish's screenshots (.agents/skills/ui-polish): every screen and its key states, light and dark, at 2x,
// for the sample preview (:5173) and the real journal (:5174). Usage: node scripts/ui-shots.mjs <folder>
// ONLY=regex limits to matching shot names (ONLY="story-date|pair" node scripts/ui-shots.mjs out).
// Start the dev servers first (`npm run dev` and `npm run dev:real`), or let Playwright's webServer do it.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "ui-shots";
mkdirSync(OUT, { recursive: true });
const SAMPLE = "http://localhost:5173";
const REAL = "http://localhost:5174";

/** Each shot: a name, where to go, and what to do first (open a menu, hover). */
const SHOTS = [
  { name: "01-dashboard", url: `${SAMPLE}/` },
  { name: "02-tradelog", url: `${SAMPLE}/log` },
  { name: "03-tradelog-grid", url: `${SAMPLE}/log`, act: (p) => p.getByRole("button", { name: "Grid" }).click() },
  { name: "04-tradelog-filter", url: `${SAMPLE}/log`, act: (p) => p.getByRole("button", { name: /^Pair/ }).first().click() },
  { name: "05-new-story", url: `${SAMPLE}/new` },
  { name: "06-new-story-status", url: `${SAMPLE}/new`, act: (p) => p.getByRole("button", { name: /^Status:/ }).click() },
  { name: "07-new-story-pair", url: `${SAMPLE}/new`, act: (p) => p.getByRole("button", { name: /^Pair:/ }).click() },
  { name: "08-new-story-setup", url: `${SAMPLE}/new`, act: (p) => p.getByRole("button", { name: /^Setup/ }).click() },
  { name: "09-story", url: `${SAMPLE}/story/e20` },
  { name: "10-story-more", url: `${SAMPLE}/story/e20`, act: (p) => p.getByRole("button", { name: "More actions" }).click() },
  { name: "11-story-date", url: `${SAMPLE}/story/e20`, act: (p) => p.getByRole("button", { name: /^Date and time:/ }).click() },
  { name: "12-playbook", url: `${SAMPLE}/playbook` },
  { name: "13-setup", url: `${SAMPLE}/playbook`, act: (p) => p.locator('#main a[href^="/playbook/"]:not([href="/playbook/new"])').first().click() },
  { name: "14-setup-new", url: `${SAMPLE}/playbook/new` },
  { name: "15-review", url: `${SAMPLE}/review` },
  { name: "16-accounts", url: `${SAMPLE}/accounts` },
  { name: "17-account-new", url: `${SAMPLE}/accounts/new` },
  { name: "18-account-edit", url: `${SAMPLE}/accounts`, act: (p) => p.locator('#main a[href^="/accounts/"]:not([href="/accounts/new"])').first().click() },
  { name: "19-settings", url: `${SAMPLE}/settings` },
  { name: "20-start", url: `${SAMPLE}/start` },
  { name: "21-real-start", url: `${REAL}/start`, real: true },
  { name: "22-real-tradelog", url: `${REAL}/log`, real: true },
  { name: "23-real-new-story", url: `${REAL}/new`, real: true },
  { name: "24-real-new-story-result", url: `${REAL}/new`, real: true, act: (p) => p.getByRole("button", { name: "Result empty" }).click() },
  { name: "25-real-accounts", url: `${REAL}/accounts`, real: true },
  { name: "26-real-settings", url: `${REAL}/settings`, real: true },
];

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/opt/pw-browsers/chromium" });
for (const theme of ["light", "dark"]) {
  for (const s of SHOTS.filter((x) => !process.env.ONLY || new RegExp(process.env.ONLY).test(x.name))) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
    // The real journal's voice and chart reading show when the server says it's ready.
    if (s.real) await page.route("**/api/voice-note", (r) => r.fulfill({ json: { ready: true } }));
    try {
      await page.goto(s.url);
      await page.waitForTimeout(500);
      await page.evaluate(async (t) => {
        const { useStore } = await import("/src/data/store.ts");
        useStore.getState().setAppearance(t);
      }, theme);
      await page.waitForTimeout(300);
      if (s.act) await s.act(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(OUT, `${s.name}-${theme}.png`), fullPage: true });
    } catch (e) {
      console.log(`${s.name} (${theme}): ${String(e).split("\n")[0]}`);
    }
    await page.close();
  }
}
await browser.close();
console.log(`Saved to ${OUT}`);
