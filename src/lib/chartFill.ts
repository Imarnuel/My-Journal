// How one chart's reading fills a story (DESIGN.md › Chart reading, "Several charts"), shared by the open story
// page and by readings that finish after the page has gone. One rule per fact: a chart of another pair fills
// nothing; a box that points against the story's direction fills nothing; prices come as one set from one chart,
// only while entry, stop and target are all empty; the first chart with a box wins. A skipped chart is silent.
import type { ChartRead } from "./chartRead";
import type { Dir } from "./types";
import { instrumentOf, ownSpelling, tidyPair } from "./instruments";

export type FillFacts = { pair: string | null; dir: Dir | null; numbers: { entry: string; stop: string; target: string } };
export type ChartFill = {
  pair?: string;
  dir?: Dir;
  prices?: { entry: string; stop: string; target: string };
  /** What filled, for the toast: "pair", "direction", "3 prices". */
  filled: string[];
  /** A box whose prices can't be read, while the story's prices are still empty: the designed card. */
  unreadable: boolean;
};

/** Same instrument whatever the spelling: GOLD and XAUUSD.a are XAUUSD. */
const key = (p: string) => instrumentOf(p)?.t ?? tidyPair(p);

/** Everything a chart could fill is already set: nothing to read (saves the free allowance). */
export const factsFull = (f: FillFacts) => !!(f.pair && f.dir && f.numbers.entry && f.numbers.stop && f.numbers.target);

/** What a reading fills, or null when the chart is skipped (another pair, or against the story's direction). */
export function chartFill(cur: FillFacts, r: ChartRead, yours: string[]): ChartFill | null {
  const storyPairs = cur.pair ? cur.pair.split(",").map(key).filter(Boolean) : [];
  if (r.pair && storyPairs.length && !storyPairs.includes(key(r.pair))) return null;
  if (r.dir && cur.dir && r.dir !== cur.dir) return null;
  const out: ChartFill = { filled: [], unreadable: false };
  if (!cur.pair && r.pair) (out.pair = ownSpelling(r.pair, yours)), out.filled.push("pair");
  if (!cur.dir && r.dir) (out.dir = r.dir), out.filled.push("direction");
  const n = cur.numbers;
  const empty = !n.entry && !n.stop && !n.target;
  if (empty && r.entry && r.stop) {
    out.prices = { entry: r.entry, stop: r.stop, target: r.target ?? "" };
    out.filled.push(`${r.target ? 3 : 2} prices`);
  }
  out.unreadable = r.unreadable && empty && !out.prices;
  return out;
}
