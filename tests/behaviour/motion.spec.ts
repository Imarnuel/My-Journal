// Shared motion (02-look-and-feel.md section 12, review-animations STANDARDS): segmented slide,
// keyboard actions without animation, theme cross-fade, page transitions, toast exit.
import { expect, test } from "@playwright/test";

/** The story's Plan control (Followed / Not followed): a segmented track that keeps its size when pressed. */
const planTrack = (page: import("@playwright/test").Page) => page.locator(".kseg-track").filter({ has: page.getByRole("button", { name: "Not followed" }) });
const thumbX = (page: import("@playwright/test").Page) =>
  planTrack(page).locator(".kseg-thumb").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);

// The Dashboard period is a dropdown now (DESIGN.md › Dashboard period); the chart story's Plan control is
// the segmented control these check.
test("segmented control: one thumb slides under the pressed segment", async ({ page }) => {
  await page.goto("/story/e20");
  const track = planTrack(page);
  await expect(track.locator(".kseg-thumb")).toHaveCount(1);
  const followed = track.getByRole("button", { name: "Followed", exact: true });
  const x0 = await thumbX(page);
  expect(Math.round(x0)).toBe(await followed.evaluate((el) => (el as HTMLElement).offsetLeft));
  await track.getByRole("button", { name: "Not followed" }).click();
  const target = await track.getByRole("button", { name: "Not followed" }).evaluate((el) => (el as HTMLElement).offsetLeft);
  // It travels (a transition is running), then settles on the new segment.
  const t = await track.locator(".kseg-thumb").evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(t).not.toBe("0s");
  await expect.poll(() => thumbX(page).then(Math.round)).toBe(target);
});

test("segmented control from the keyboard: the thumb jumps (no slide)", async ({ page }) => {
  await page.goto("/story/e20");
  const track = planTrack(page);
  await track.getByRole("button", { name: "Not followed" }).focus();
  await page.keyboard.press("Enter");
  const target = await track.getByRole("button", { name: "Not followed" }).evaluate((el) => (el as HTMLElement).offsetLeft);
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
  await page.locator("#main").waitFor();
  // Record the class as it comes and goes (it only lasts the length of the fade).
  await page.evaluate(() => {
    const w = window as unknown as { fades: boolean[] };
    w.fades = [];
    new MutationObserver(() => w.fades.push(document.documentElement.classList.contains("theme-fade"))).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  });
  await page.getByRole("button", { name: "Dark" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveClass(/theme-fade/, { timeout: 2000 });
  const fades = await page.evaluate(() => (window as unknown as { fades: boolean[] }).fades);
  expect(fades).toEqual([true, false]);
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
  await page.goto("/story/e20");
  // The thumb jumps: no transition on it at all.
  expect(await planTrack(page).locator(".kseg-thumb").evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
});
