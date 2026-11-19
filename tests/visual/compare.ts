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

/**
 * Reference image for a screen or state. The handoff screenshots are the reference, except where the owner
 * asked for a change after the handoff: those screens have an approved image in tests/visual/approved
 * (see tests/visual/approved/README.md). Running with APPROVE=<regex> writes the current render as the
 * approved image for matching refs, after which it must be looked at before committing.
 */
export function refPath(ref: string): string {
  const approved = path.join("tests/visual/approved", ref);
  return fs.existsSync(approved) ? approved : path.join("handoff/screenshots", ref);
}

/** Write `img` as the approved reference for `ref` when APPROVE matches it. Returns true if it did. */
export function maybeApprove(ref: string, img: PNG): boolean {
  const pat = process.env.APPROVE;
  if (!pat || !new RegExp(pat).test(ref)) return false;
  const out = path.join("tests/visual/approved", ref);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, PNG.sync.write(img));
  return true;
}

/** Fraction of pixels allowed to differ: anti-aliasing and font hinting only. */
export const MAX_RATIO = 0.004;

export async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  await page.waitForTimeout(150);
}

export async function diffAgainst(page: Page, ref: string, info: TestInfo, opts: { height?: number; maxRatio?: number } = {}) {
  const approving = !!process.env.APPROVE && new RegExp(process.env.APPROVE).test(ref);
  const want = approving && !fs.existsSync(refPath(ref)) ? new PNG({ width: 1440, height: opts.height ?? 1000 }) : PNG.sync.read(fs.readFileSync(refPath(ref)));
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
  if (maybeApprove(ref, a)) return;
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
