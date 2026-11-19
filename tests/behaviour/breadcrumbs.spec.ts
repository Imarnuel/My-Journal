// Breadcrumbs (DESIGN.md): earlier steps are links, the current page is marked and not a link.
import { expect, test } from "@playwright/test";

const CASES: { url: string; trail: string[]; back: { name: string; to: RegExp } }[] = [
  { url: "/story/e20", trail: ["Trade log", "GBPUSD"], back: { name: "Trade log", to: /\/log$/ } },
  { url: "/new", trail: ["Trade log", "New chart story"], back: { name: "Trade log", to: /\/log$/ } },
  { url: "/playbook/4h-supply-pullback", trail: ["Playbook", "4H supply pullback"], back: { name: "Playbook", to: /\/playbook$/ } },
  { url: "/playbook/4h-supply-pullback/edit", trail: ["Playbook", "4H supply pullback", "Edit rules"], back: { name: "4H supply pullback", to: /\/playbook\/4h-supply-pullback$/ } },
  { url: "/playbook/new", trail: ["Playbook", "New setup"], back: { name: "Playbook", to: /\/playbook$/ } },
  { url: "/accounts/new", trail: ["Accounts", "Add an account"], back: { name: "Accounts", to: /\/accounts$/ } },
  { url: "/accounts/funded-100k", trail: ["Accounts", "Funded 100K"], back: { name: "Accounts", to: /\/accounts$/ } },
];

for (const c of CASES)
  test(`breadcrumbs on ${c.url}`, async ({ page }) => {
    await page.goto(c.url);
    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav.getByRole("listitem")).toHaveText(c.trail);
    const current = nav.locator('[aria-current="page"]');
    await expect(current).toHaveText(c.trail[c.trail.length - 1]);
    await expect(nav.getByRole("link")).toHaveCount(c.trail.length - 1);
    await expect(nav.locator("svg").first()).toHaveAttribute("width", /16/);
    await nav.getByRole("link", { name: c.back.name }).click();
    await expect(page).toHaveURL(c.back.to);
  });

test("sidebar: 16px icons, 36px rows, 4px apart", async ({ page }) => {
  await page.goto("/accounts");
  const links = page.getByRole("navigation", { name: "Main" }).getByRole("link");
  const boxes = await links.evaluateAll((els) => els.map((el) => { const r = el.getBoundingClientRect(); const i = el.querySelector("svg")!.getBoundingClientRect(); return [r.top, r.height, i.width, i.height]; }));
  for (const [, h, iw, ih] of boxes) expect([h, iw, ih]).toEqual([36, 16, 16]);
  expect(Math.round(boxes[1][0] - boxes[0][0])).toBe(40);
});
