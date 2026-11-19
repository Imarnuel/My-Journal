// App-wide accessibility and phone checks (02-look-and-feel.md section 14, mobile-native skill), every route.
import { expect, test, devices } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/", "/log", "/log?view=grid", "/new", "/story/e20", "/playbook", "/playbook/4h-supply-pullback",
  "/playbook/4h-supply-pullback/edit", "/playbook/new", "/review", "/accounts", "/accounts/new",
  "/accounts/funded-100k", "/settings", "/start",
];
const q = (r: string, theme: string) => `${r}${r.includes("?") ? "&" : "?"}theme=${theme}`;

for (const r of ROUTES)
  for (const theme of ["light", "dark"])
    test(`axe: ${r} (${theme}) has no serious or critical violations`, async ({ page }) => {
      await page.goto(q(r, theme));
      await page.evaluate(() => document.fonts.ready);
      const res = await new AxeBuilder({ page }).analyze();
      const bad = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target).join(", ")}`)).toEqual([]);
    });

for (const r of ROUTES)
  test(`keyboard: ${r} starts with the skip link, and every focusable control shows focus`, async ({ page }) => {
    await page.goto(r);
    await page.locator("#main").waitFor(); // the app has rendered before the first Tab
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    // Tab through the first controls: each one is visible and draws a focus ring (outline or box-shadow).
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const ok = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return true;
        const cs = getComputedStyle(el);
        return cs.outlineStyle !== "none" || cs.boxShadow !== "none";
      });
      expect(ok, `focus visible on tab stop ${i + 1}`).toBe(true);
    }
  });

test.describe("phone", () => {
  const { defaultBrowserType: _d, ...iphone } = devices["iPhone 13"];
  void _d;
  test.use(iphone);
  for (const r of ROUTES)
    test(`phone: ${r} has no horizontal page scroll`, async ({ page }) => {
      await page.goto(r);
      await page.waitForTimeout(150);
      // Compare with the phone's own width (390): a page wider than that makes the browser zoom it out,
      // which also widens innerWidth, so comparing with innerWidth alone hides the bug.
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw, "page width").toBeLessThanOrEqual(390);
    });
});
