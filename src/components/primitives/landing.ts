// A chart that has just been added lands (DESIGN.md › Charts landing): its tile fades in while rising 4px and
// settling from 96% to full size, 240ms. Only charts added in the last second, so nothing already there moves, and
// the tile keeps its class while its blob: URL is swapped for the saved copy, so it doesn't land twice.
import { stableChartKey } from "../../data/store";

const fresh = new Map<string, number>();

/** Charts just added (their URLs as added). */
export function markLanding(urls: string[]) {
  const t = performance.now();
  for (const [u, at] of fresh) if (t - at > 2000) fresh.delete(u);
  urls.forEach((u) => fresh.set(u, t));
}

/** " kland" for a chart added in the last second, else "". */
export function landingClass(url: string): string {
  const t = fresh.get(stableChartKey(url));
  return t != null && performance.now() - t < 1000 ? " kland" : "";
}

// A landing is spent once it has played: its chart is forgotten and the class comes off, so a later re-render or a
// move (reordering tiles) can never replay it.
if (typeof document !== "undefined")
  document.addEventListener(
    "animationend",
    (e) => {
      if (e.animationName !== "kland" && e.animationName !== "kland-fade") return;
      const el = e.target as HTMLElement;
      const src = el.querySelector("img")?.getAttribute("src");
      if (src) fresh.delete(stableChartKey(src));
      el.classList.remove("kland");
    },
    true,
  );
