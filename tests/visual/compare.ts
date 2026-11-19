// Visual diff against the handoff screenshots (CLAUDE.md, Definition of done 1).
// The page is captured at 1440 × frame height and compared with the screenshot cropped to that height.
import { expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

export const FRAME_H: Record<string, number> = {
  "01-Start": 740, "02-Dashboard": 2090, "03-Main": 2070, "04-MainCal": 1220, "05-NewStory": 1160,
  "06-NewStoryTyped": 1100, "07-Story": 1210, "08-PlaybookHome": 890, "09-Playbook": 1720, "10-SetupEdit": 1280,
  "11-Review": 1670, "12-Accounts": 820, "13-AddAccount": 940, "14-EditAccount": 980, "15-Settings": 1630, "16-States": 920,
};

/** Fraction of pixels allowed to differ: anti-aliasing and font hinting only. */
export const MAX_RATIO = 0.004;

export async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  await page.waitForTimeout(150);
}

export async function diffAgainst(page: Page, ref: string, info: TestInfo, opts: { height?: number; maxRatio?: number } = {}) {
  const refPath = path.join("handoff/screenshots", ref);
  const want = PNG.sync.read(fs.readFileSync(refPath));
  const h = opts.height ?? want.height;
  await page.setViewportSize({ width: 1440, height: h });
  await settle(page);
  const got = PNG.sync.read(await page.screenshot({ fullPage: true }));
  const H = Math.min(h, want.height, got.height);
  const crop = (img: PNG) => {
    const out = new PNG({ width: 1440, height: H });
    PNG.bitblt(img, out, 0, 0, 1440, H, 0, 0);
    return out;
  };
  const a = crop(got);
  const b = crop(want);
  const d = new PNG({ width: 1440, height: H });
  const n = pixelmatch(a.data, b.data, d.data, 1440, H, { threshold: 0.2 });
  const ratio = n / (1440 * H);
  if (ratio > (opts.maxRatio ?? MAX_RATIO)) {
    await info.attach("diff", { body: PNG.sync.write(d), contentType: "image/png" });
    await info.attach("actual", { body: PNG.sync.write(a), contentType: "image/png" });
    fs.mkdirSync("test-results/diffs", { recursive: true });
    const base = `test-results/diffs/${ref.replace(/\//g, "_")}`;
    fs.writeFileSync(`${base}.diff.png`, PNG.sync.write(d));
    fs.writeFileSync(`${base}.actual.png`, PNG.sync.write(a));
  }
  expect(got.height, "page height").toBeGreaterThanOrEqual(Math.min(h, want.height) - 2);
  expect(ratio, `pixels differing from ${ref} (diff in test-results/diffs)`).toBeLessThanOrEqual(opts.maxRatio ?? MAX_RATIO);
}
