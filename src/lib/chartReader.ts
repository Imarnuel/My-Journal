// The app's side of chart reading (DESIGN.md › Chart reading): send one screenshot to /api/chart-read and read
// the answer from the server's open line (spaces while Gemini reads, the JSON last).
import { toBase64 } from "./recorder";
import type { ChartReadContext, ChartReadResult } from "./chartRead";

/** The longest the app waits for one chart before it simply leaves the facts for the user. */
export const CHART_LIMIT_MS = 60_000;
/** Larger screenshots are scaled down (prices stay legible at this size) so they send quickly. */
const MAX_SIDE = 2400;
const MAX_BYTES = 4 * 1024 * 1024;

async function shrink(file: Blob): Promise<Blob> {
  if (file.size <= MAX_BYTES || typeof createImageBitmap === "undefined") return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = new OffscreenCanvas(Math.round(bmp.width * k), Math.round(bmp.height * k));
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
  } catch {
    return file;
  }
}

export async function readChart(file: Blob, ctx: ChartReadContext): Promise<ChartReadResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { ok: false, reason: "offline" };
  const ctl = new AbortController();
  const limit = setTimeout(() => ctl.abort(), CHART_LIMIT_MS);
  try {
    const img = await shrink(file);
    const res = await fetch("/api/chart-read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: await toBase64(img), mime: img.type || "image/png", context: ctx }),
      signal: ctl.signal,
    });
    const out = JSON.parse((await res.text()).trim()) as ChartReadResult;
    return out && typeof out === "object" && out.ok === true ? out : { ok: false, reason: "failed" };
  } catch {
    return { ok: false, reason: navigator.onLine === false ? "offline" : "failed" };
  } finally {
    clearTimeout(limit);
  }
}
