// Dashboard formulas (handoff/docs/05-data-and-calculations.md) on top of calc.ts: the period line,
// R over time geometry, R by day / week, breakdown rows, recent stories, the no-charts notice and the focus line.
// Pure functions over one set of entries, so every number follows the period and the account picker.
import type { Entry, Period, TagKind, Week } from "./types";
import { MIN_RATE, byTime, countStatus, counted, periodStart, stats, type Stats } from "./calc";
import { addDays, monShort, monthName, mondayOf, parseDate, shortDate, weekRange } from "./format";

const round2 = (x: number) => Math.round(x * 100) / 100;

export const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "3m", label: "3 months" },
];

/** The period to offer when a period has too few trades: This week widens to This month, This month to 3 months. */
export function widerPeriod(p: Period): Period | null {
  return p === "week" ? "month" : p === "month" ? "3m" : null;
}

/** First Monday to Friday date on or after `d` (markets are closed at the weekend). */
export function firstWeekday(d: string): string {
  let x = d;
  for (let i = 0; i < 7; i++) {
    const dow = parseDate(x).getUTCDay();
    if (dow !== 0 && dow !== 6) return x;
    x = addDays(x, 1);
  }
  return d;
}

/** "17 August to 16 November", "2 to 16 November", or "16 November" for a single day. */
export function dateSpan(from: string, to: string): string {
  const a = parseDate(from);
  const b = parseDate(to);
  if (from >= to) return `${b.getUTCDate()} ${monthName(to)}`;
  if (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()) return `${a.getUTCDate()} to ${b.getUTCDate()} ${monthName(to)}`;
  return `${a.getUTCDate()} ${monthName(from)} to ${b.getUTCDate()} ${monthName(to)}`;
}

/** Page subtitle: "November so far · 2 to 16 November · all figures in R". */
export function subtitle(period: Period, today: string): string {
  const span = dateSpan(firstWeekday(periodStart(period, today)), today);
  const name = period === "week" ? "This week so far" : period === "month" ? `${monthName(today)} so far` : "Last 3 months";
  return `${name} · ${span} · all figures in R`;
}

/** An entry's mistake-kind tags: tags whose kind is Mistake (falls back to the stored list when it carries no tags). */
export function mistakesOf(e: Entry, kindOf: (t: string) => TagKind | undefined): string[] {
  if (!e.tags.length) return e.mistakes;
  return [...new Set(e.tags.filter((t) => kindOf(t) === "Mistake"))];
}

export type PeriodNumbers = { from: string; T: Entry[]; s: Stats; watched: number; notFilled: number; enough: boolean };

/** Counted trades in the period and ticked accounts, their stats, and the watched / not filled counts. */
export function periodNumbers(entries: Entry[], picked: string[], period: Period, today: string): PeriodNumbers {
  const from = periodStart(period, today);
  const T = counted(entries, picked, from, today);
  return {
    from,
    T,
    s: stats(T),
    watched: countStatus(entries, "Watched", picked, from, today),
    notFilled: countStatus(entries, "Not filled", picked, from, today),
    enough: T.length >= MIN_RATE,
  };
}

// ---------- R over time ----------

export const EQ = { W: 600, H: 248, pl: 40, pr: 10, pt: 40, pb: 24 } as const;

/** Value range of the line: from the lowest point (or 0) up to the next multiple of 4 above the peak. */
export function eqScale(pts: number[]): { lo: number; hi: number; step: number } {
  const lo = Math.min(0, ...pts) || 0;
  const hi = (Math.floor(Math.max(...pts) / 4) + 1) * 4;
  return { lo, hi, step: hi - lo > 24 ? 8 : 4 };
}

export const eqX = (i: number, count: number) => EQ.pl + (i * (EQ.W - EQ.pl - EQ.pr)) / Math.max(1, count - 1);
export const eqY = (v: number, lo: number, hi: number) => EQ.pt + ((hi - v) / (hi - lo)) * (EQ.H - EQ.pt - EQ.pb);

const f1 = (v: number) => v.toFixed(1);

/** SVG paths for the line (straight segments), the area under it, and the drawdown band between running peak and line. */
export function eqPaths(pts: number[], lo: number, hi: number) {
  const P = pts.map((v, i) => [eqX(i, pts.length), eqY(v, lo, hi)] as const);
  const pp = (q: readonly [number, number]) => `${f1(q[0])} ${f1(q[1])}`;
  const line = "M" + P.map(pp).join(" L");
  const base = eqY(lo, lo, hi);
  const last = P[P.length - 1];
  const area = `${line} L${f1(last[0])} ${f1(base)} L${f1(P[0][0])} ${f1(base)} Z`;
  let pk = -1e9;
  const peak = P.map((q, i) => {
    pk = Math.max(pk, pts[i]);
    return (i ? " L" : "M") + f1(q[0]) + " " + f1(eqY(pk, lo, hi));
  }).join("");
  const back = P.slice(0, -1)
    .reverse()
    .map((q) => " L" + pp(q))
    .join("");
  const dd = `${peak} L${pp(last)}${back} Z`;
  return { line, area, dd, endX: last[0], endY: last[1] };
}

/** Gridlines every `step` R from the lowest multiple at or above lo up to hi. */
export function eqGrid(lo: number, hi: number, step: number): number[] {
  const g: number[] = [];
  for (let v = Math.ceil(lo / step) * step || 0; v <= hi; v += step) g.push(v);
  return g;
}

/** Date labels under the line: one at the first trade of each week (month), each day (week) or each month (3 months). */
export function eqTicks(T: Entry[], period: Period): { i: number; label: string }[] {
  const seen = new Set<string>();
  const out: { i: number; label: string }[] = [];
  T.forEach((e, i) => {
    const key = period === "3m" ? e.date.slice(0, 7) : period === "week" ? e.date : mondayOf(e.date);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ i: i + 1, label: period === "3m" ? monShort(e.date) : shortDate(e.date) });
  });
  return out;
}

/** Resample a series to `n` points by position along the x axis (for morphing between periods). */
export function resample(pts: number[], n: number): number[] {
  if (n <= 0) return [];
  if (pts.length === 0) return Array(n).fill(0);
  if (pts.length === 1 || n === 1) return Array(n).fill(pts[pts.length - 1]);
  const out: number[] = [];
  for (let j = 0; j < n; j++) {
    const u = (j / (n - 1)) * (pts.length - 1);
    const a = Math.floor(u);
    const b = Math.min(pts.length - 1, a + 1);
    out.push(pts[a] + (pts[b] - pts[a]) * (u - a));
  }
  return out;
}

// ---------- R by day / week ----------

export type BarGroup = { k: string; r: number; n: number; first: boolean };

/** Sum of r per trading day, or per week (Monday) for 3 months, oldest first. `first` marks a group starting a new month. */
export function barGroups(T: Entry[], byWeek: boolean): BarGroup[] {
  const grp: BarGroup[] = [];
  for (const e of [...T].sort(byTime)) {
    const k = byWeek ? mondayOf(e.date) : e.date;
    let g = grp[grp.length - 1];
    if (!g || g.k !== k) {
      g = { k, r: 0, n: 0, first: false };
      grp.push(g);
    }
    g.r = round2(g.r + (e.r as number));
    g.n += 1;
  }
  grp.forEach((g, i) => (g.first = i === 0 || g.k.slice(0, 7) !== grp[i - 1].k.slice(0, 7)));
  return grp;
}

/** Bar height in px (84px each side of the baseline, at least 3px). */
export function barHeight(r: number, groups: BarGroup[]): number {
  const mx = Math.max(0.01, ...groups.map((g) => Math.abs(g.r)));
  return Math.max(3, Math.round((Math.abs(r) / mx) * 84));
}

/** Highest and lowest day (or week); the first one wins a tie. */
export function bestWorst(groups: BarGroup[], fallback: string) {
  const z = { k: fallback, r: 0, n: 0, first: true };
  const best = groups.reduce((a, g) => (g.r > a.r ? g : a), groups[0] ?? z);
  const worst = groups.reduce((a, g) => (g.r < a.r ? g : a), groups[0] ?? z);
  return { best, worst };
}

// ---------- By setup, by session, costliest mistakes ----------

export type Row = { name: string; n: number; rated: boolean; winRate: number; expectancy: number; net: number; bar: { side: "left" | "right"; pct: number } };

/** One breakdown row per name with trades, in the given order. Bars diverge from the centre, scaled to the largest |net|. */
export function breakdown(T: Entry[], names: string[], key: (e: Entry) => string): Row[] {
  const rows = names
    .map((name) => {
      const xs = T.filter((e) => key(e) === name);
      const k = xs.length;
      const net = round2(xs.reduce((a, e) => a + (e.r as number), 0));
      const w = xs.filter((e) => (e.r as number) > 0).length;
      return { name, n: k, rated: k >= MIN_RATE, winRate: k ? w / k : 0, expectancy: k ? net / k : 0, net, bar: { side: "left" as const, pct: 0 } };
    })
    .filter((r) => r.n > 0);
  const m = Math.max(0.01, ...rows.map((r) => Math.abs(r.net)));
  for (const r of rows) r.bar = { side: r.net >= 0 ? "left" : "right", pct: Math.round((Math.abs(r.net) / m) * 500) / 10 };
  return rows;
}

/** Setup order: the playbook's setups, then any other setup name seen in the period, then Unsorted. */
export function setupOrder(setups: { name: string }[], T: Entry[]): string[] {
  const names = setups.map((s) => s.name);
  for (const e of T) if (e.setup !== "Unsorted" && !names.includes(e.setup)) names.push(e.setup);
  return [...names.filter((n) => n !== "Unsorted"), "Unsorted"];
}

/** Costliest mistakes with the bar length as a share of the costliest one. */
export function mistakeRows(T: Entry[], kindOf: (t: string) => TagKind | undefined) {
  const m = new Map<string, { n: number; r: number }>();
  for (const e of T)
    for (const t of mistakesOf(e, kindOf)) {
      const v = m.get(t) ?? { n: 0, r: 0 };
      v.n++;
      v.r = round2(v.r + (e.r as number));
      m.set(t, v);
    }
  const rows = [...m.entries()].map(([tag, v]) => ({ tag, ...v })).sort((a, b) => a.r - b.r);
  const mm = Math.max(0.01, ...rows.map((x) => Math.abs(x.r)));
  const untagged = T.filter((e) => mistakesOf(e, kindOf).length === 0).length;
  return { rows: rows.map((x) => ({ ...x, pct: Math.round((Math.abs(x.r) / mm) * 100) })), untagged };
}

// ---------- Recent chart stories, no-charts notice, focus ----------

/** The last `k` stories with charts, newest first, whatever the period or accounts. */
export function recentStories(entries: Entry[], k = 6): Entry[] {
  return entries
    .filter((e) => e.charts > 0 && e.status !== "Analysis")
    .sort((a, b) => byTime(b, a))
    .slice(0, k);
}

/** Trades known from MT5 that have no charts yet, newest first. */
export function noChartTrades(entries: Entry[]): Entry[] {
  return entries.filter((e) => e.status === "Taken" && e.charts === 0 && !!e.mt5).sort((a, b) => byTime(b, a));
}

/** "This week's focus": the takeaway of the latest reviewed week up to today. */
export function latestFocus(weeks: Week[], today: string): { monday: string; takeaway: string; from: string } | null {
  const w = [...weeks].filter((x) => x.monday <= today && x.takeaway && x.takeaway.trim()).sort((a, b) => b.monday.localeCompare(a.monday))[0];
  return w ? { monday: w.monday, takeaway: w.takeaway!.trim(), from: `From your review of ${weekRange(w.monday)}` } : null;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
