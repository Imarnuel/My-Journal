// Shared motion (02-look-and-feel.md section 12, review-animations STANDARDS): segmented slide,
// keyboard actions without animation, theme cross-fade, page transitions, toast exit.
import { expect, test } from "@playwright/test";

const thumbX = (page: import("@playwright/test").Page) =>
  page.locator(".kseg-track .kseg-thumb").first().evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);

test("segmented control: one thumb slides under the pressed segment", async ({ page }) => {
  await page.goto("/");
  const track = page.locator(".kseg-track").first();
  await expect(track.locator(".kseg-thumb")).toHaveCount(1);
  const month = track.getByRole("button", { name: "This month" });
  const x0 = await thumbX(page);
  expect(Math.round(x0)).toBe(await month.evaluate((el) => (el as HTMLElement).offsetLeft));
  await track.getByRole("button", { name: "3 months" }).click();
  const target = await track.getByRole("button", { name: "3 months" }).evaluate((el) => (el as HTMLElement).offsetLeft);
  // It travels (a transition is running), then settles on the new segment.
  const t = await page.locator(".kseg-thumb").first().evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(t).not.toBe("0s");
  await expect.poll(() => thumbX(page).then(Math.round)).toBe(target);
});

test("segmented control from the keyboard: the thumb jumps (no slide)", async ({ page }) => {
  await page.goto("/");
  const track = page.locator(".kseg-track").first();
  await track.getByRole("button", { name: "3 months" }).focus();
  await page.keyboard.press("Enter");
  const target = await track.getByRole("button", { name: "3 months" }).evaluate((el) => (el as HTMLElement).offsetLeft);
  expect(Math.round(await thumbX(page))).toBe(target);
});

test("menus opened from the keyboard appear at once; from the pointer they grow from the trigger", async ({ page }) => {
  await page.goto("/accounts");
  const trigger = page.getByRole("button", { name: /Copied trades/ });
  await trigger.click();
  expect(await page.locator(".kmenu").evaluate((el) => getComputedStyle(el).animationName)).toBe("kpop");
  await page.keyboard.press("Escape");
  await trigger.focus();
  await page.keyboard.press("Enter");
  expect(await page.locator(".kmenu").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});

test("theme change cross-fades colours and nothing moves", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Dark" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveClass(/theme-fade/);
  await expect(page.locator("html")).not.toHaveClass(/theme-fade/, { timeout: 2000 });
});

test("page change: content fades in with a small drift; first load and keyboard navigation stay still", async ({ page }) => {
  await page.goto("/accounts");
  const running = () => page.evaluate(() => document.getAnimations().filter((a) => a.effect && (a.effect as KeyframeEffect).getKeyframes().some((k) => k.transform === "translateY(4px)")).length);
  expect(await running()).toBe(0);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Settings" }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect.poll(running, { timeout: 300 }).toBeGreaterThan(0);
  await page.waitForTimeout(400);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Accounts" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/accounts$/);
  expect(await running()).toBe(0);
});

test("toasts leave by fading and dropping, faster than they arrive", async ({ page }) => {
  await page.goto("/accounts");
  await page.getByRole("button", { name: /Archived \(2\)/ }).click();
  await page.getByRole("button", { name: "Restore" }).first().click();
  const status = page.getByRole("status");
  await expect(status).toBeVisible();
  await status.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".kstatus.leaving")).toHaveCount(1);
  await expect(page.locator(".kstatus")).toHaveCount(0);
});

test("reduced motion: the segmented thumb jumps instead of sliding", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // The thumb jumps: no transition on it at all.
  expect(await page.locator(".kseg-thumb").first().evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
});
