// Playbook formulas (handoff/docs/01-decisions.md "Playbook" and "Small samples"; 05-data-and-calculations.md).
// Pure functions over the one set of entries, so the playbook agrees with the Dashboard and the Trade log.
import type { Entry } from "./types";
import { counted, EARLY, MIN_RATE, SPARK_MIN } from "./calc";
import { fr } from "./format";

/** Entries that are chart stories in a setup's gallery and in Unsorted (not Running, not Analysis). */
export const STORY_STATUSES: Entry["status"][] = ["Taken", "Watched", "Not filled"];
export const isStory = (e: Entry) => STORY_STATUSES.includes(e.status);

export const SPARK_LAST = 20; // the cumulative R line covers the last 20 trades
export const PATTERNS_MIN = 20; // patterns need 20 trades in the setup
export const SPLIT_EARLY = 10; // a split side under 10 trades carries the early-signal dot

/** Newest day first. Within a day the frame lists the earlier trade first (09-Playbook: 10 Nov GBPUSD 09:05, then XAUUSD 14:10). */
export const byDayDesc = (a: Entry, b: Entry) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time);

/** Cumulative-R sparkline over results, as drawn on the canvas: one point per trade, 2px inset, 3px top and bottom. */
export function spark(rs: number[], w: number, h: number) {
  let c = 0;
  const pts = rs.map((r) => (c += r));
  const lo = Math.min(0, ...pts);
  const hi = Math.max(0, ...pts);
  const rng = hi - lo || 1;
  const y = (v: number) => (h - 3 - ((v - lo) / rng) * (h - 6)).toFixed(1);
  const points = pts.map((v, i) => `${((i * (w - 4)) / Math.max(1, pts.length - 1) + 2).toFixed(1)},${y(v)}`).join(" ");
  return { points, zero: y(0), end: c };
}

export type SetupStats = {
  /** Counted trades in the setup on the ticked accounts, oldest first. */
  T: Entry[];
  n: number;
  watched: number;
  /** From 5 trades: rates and averages show. */
  rated: boolean;
  /** 5 to 19 trades: "Early signal". */
  early: boolean;
  /** From 10 trades: the cumulative R line. */
  hasLine: boolean;
  exp: string;
  wr: string;
  avgW: string;
  lastN: number;
  /** Results of the last 20 trades, oldest first. */
  last: number[];
};

export function setupStats(entries: Entry[], setup: string, picked: string[]): SetupStats {
  const T = counted(entries, picked).filter((e) => e.setup === setup);
  const on = new Set(picked);
  const watched = entries.filter((e) => e.setup === setup && e.status === "Watched" && on.has(e.account)).length;
  const n = T.length;
  const rs = T.map((e) => e.r as number);
  const net = rs.reduce((a, b) => a + b, 0);
  const wins = rs.filter((r) => r > 0);
  const last = rs.slice(-SPARK_LAST);
  return {
    T,
    n,
    watched,
    rated: n >= MIN_RATE,
    early: n >= MIN_RATE && n < EARLY,
    hasLine: n >= SPARK_MIN,
    exp: n ? fr(net / n, 2) : "",
    wr: n ? `${Math.round((wins.length / n) * 100)}%` : "",
    avgW: wins.length ? fr(wins.reduce((a, b) => a + b, 0) / wins.length) : "–",
    lastN: last.length,
    last,
  };
}

/** Every chart story in the setup, from every account (practice included), newest first. */
export const examplesOf = (entries: Entry[], setup: string) => entries.filter((e) => e.setup === setup && isStory(e)).sort(byDayDesc);

export const EX_FILTERS = ["All", "Winners", "Losers", "Watched", "Not filled", "Textbook"] as const;
export type ExFilter = (typeof EX_FILTERS)[number];
const F: Record<ExFilter, (e: Entry) => boolean> = {
  All: () => true,
  Winners: (e) => e.status === "Taken" && (e.r ?? 0) > 0,
  Losers: (e) => e.status === "Taken" && (e.r ?? 0) <= 0,
  Watched: (e) => e.status === "Watched",
  "Not filled": (e) => e.status === "Not filled",
  Textbook: (e) => e.textbook,
};
export const filterExamples = (xs: Entry[], f: ExFilter) => xs.filter(F[f]);

export const EX_BATCH = 6;

export type SplitRow = { l: string; v: number; first: boolean; txt: string };
export type Split = { h: string; early: boolean; rows: SplitRow[] };

const wrOf = (xs: Entry[]) => (xs.length ? Math.round((xs.filter((e) => (e.r ?? 0) > 0).length / xs.length) * 100) : 0);

function split(h: string, a: string, A: Entry[], b: string, B: Entry[]): Split {
  return {
    h,
    early: A.length < SPLIT_EARLY || B.length < SPLIT_EARLY,
    rows: ([[a, A], [b, B]] as const).map(([l, xs], i) => ({ l, v: wrOf(xs), first: i === 0, txt: `${wrOf(xs)}% · ${xs.length}` })),
  };
}

/** Win rate split by what is recorded on every trade: session (best against worst), plan, whether the stop moved. */
export function patterns(T: Entry[]): Split[] {
  if (T.length < PATTERNS_MIN) return [];
  const bySess = (["London", "New York", "Asia"] as const)
    .map((s) => [s, T.filter((e) => e.session === s)] as const)
    .filter(([, xs]) => xs.length)
    .sort((p, q) => wrOf(q[1]) - wrOf(p[1]));
  const best = bySess[0];
  const worst = bySess[bySess.length - 1];
  const moved = (e: Entry) => e.mistakes.includes("Moved stop");
  return [
    split("Session", best[0], best[1], worst[0], worst[1]),
    split("Plan", "Followed", T.filter((e) => e.followed === true), "Not followed", T.filter((e) => e.followed !== true)),
    split("Stop", "Kept where planned", T.filter((e) => !moved(e)), "Moved", T.filter(moved)),
  ];
}

export const LESSONS_SHOWN = 5;

/** Lessons: the latest reflections on stories in the setup (frame 09 shows five). */
export const lessonsOf = (entries: Entry[], setup: string) =>
  entries.filter((e) => e.setup === setup && !!e.refl).sort(byDayDesc).slice(0, LESSONS_SHOWN);

/** Chart stories that fit no setup yet. */
export const unsortedOf = (entries: Entry[]) => entries.filter((e) => e.setup === "Unsorted" && isStory(e)).sort(byDayDesc);

/** Move one item in a list (rule reorder). */
export function moveItem<T>(xs: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= xs.length) return xs;
  const next = xs.slice();
  const [it] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, it);
  return next;
}
