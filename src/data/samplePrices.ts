// Prices for the sample trades (DESIGN.md, Sample prices). The handoff's sample entries carry a result in R but
// no entry, stop, target, exit or size; in real use MT5 sync or the chart reader fills them (06-open-items.md,
// Back end). This stands in for that, so the preview reads like real use: realistic levels for each pair, a
// stop on the right side, a target 2 to 3 times the risk, and an exit that gives exactly the trade's recorded R.
// Same trade, same prices, every time (seeded by the entry id). Only used for entries that have no numbers.
import type { Entry } from "../lib/types";
import type { Numbers } from "../lib/story";

type PairSpec = { level: number; dp: number; risk: [number, number]; lots: string[] };
const FX = (level: number): PairSpec => ({ level, dp: 5, risk: [0.0012, 0.0035], lots: ["0.20", "0.25", "0.50", "1.00"] });
const JPY = (level: number): PairSpec => ({ level, dp: 3, risk: [0.12, 0.35], lots: ["0.20", "0.25", "0.50", "1.00"] });
const PAIRS: Record<string, PairSpec> = {
  EURUSD: FX(1.085),
  GBPUSD: FX(1.268),
  AUDUSD: FX(0.655),
  NZDUSD: FX(0.595),
  USDCAD: FX(1.385),
  USDJPY: JPY(152.4),
  EURJPY: JPY(164.8),
  GBPJPY: JPY(193.2),
  XAUUSD: { level: 2650, dp: 2, risk: [4, 12], lots: ["0.10", "0.20", "0.30"] },
};

/** A repeatable 0..1 number for an entry id and a slot (no randomness: same id, same prices). */
function seeded(id: string, slot: number): number {
  let h = 2166136261 ^ slot;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

export function sampleNumbers(e: Pick<Entry, "id" | "pair" | "dir" | "status" | "r">): Partial<Numbers> {
  const spec = PAIRS[e.pair];
  if (!spec || !e.dir || e.status === "Analysis") return {};
  const sign = e.dir === "Long" ? 1 : -1;
  const at = (x: number) => x.toFixed(spec.dp);
  const entry = Number(at(spec.level * (1 + (seeded(e.id, 1) - 0.5) * 0.03)));
  const risk = Number(at(spec.risk[0] + (spec.risk[1] - spec.risk[0]) * seeded(e.id, 2)));
  const rr = [2, 2.5, 3][Math.floor(seeded(e.id, 3) * 3)];
  const out: Partial<Numbers> = { entry: at(entry), stop: at(entry - sign * risk), target: at(entry + sign * risk * rr) };
  if (e.status === "Taken" || e.status === "Running") out.size = `${spec.lots[Math.floor(seeded(e.id, 4) * spec.lots.length)]} lots`;
  if (e.status === "Taken" && e.r != null) out.exit = at(entry + sign * risk * e.r);
  return out;
}
