// Every formula in handoff/docs/05-data-and-calculations.md. Pure functions over one set of entries.
import type { Entry, Period, Session } from "./types";
import { addDays, mondayOf } from "./format";

export const MIN_RATE = 5; // fewer than 5: no rates or averages
export const EARLY = 20; // 5 to 19 in a setup: early signal
export const SPARK_MIN = 10; // cumulative R line from 10 trades

export const byTime = (a: Entry, b: Entry) => (a.date + a.time).localeCompare(b.date + b.time);

/** Start date (inclusive) of a dashboard period, given today. */
export function periodStart(period: Period, today: string): string {
  if (period === "week") return mondayOf(today);
  if (period === "month") return today.slice(0, 8) + "01";
  return addDays(mondayOf(today), -13 * 7); // 3 months: the Monday 13 weeks back
}

/** Counted entries: Taken, not excluded, in the ticked accounts, oldest first. */
export function counted(entries: Entry[], accounts: string[], from?: string, to?: string): Entry[] {
  const set = new Set(accounts);
  return entries
    .filter((e) => e.status === "Taken" && !e.excluded && e.r != null && set.has(e.account))
    .filter((e) => (!from || e.date >= from) && (!to || e.date <= to))
    .sort(byTime);
}

const round = (x: number, dp: number) => Math.round(x * 10 ** dp) / 10 ** dp;

export type Stats = {
  n: number;
  net: number;
  dd: number;
  expectancy: number | null;
  winRate: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  followed: number;
  planRate: number | null;
  pts: number[];
};

export function stats(T: Entry[]): Stats {
  const n = T.length;
  const rs = T.map((e) => e.r as number);
  const net = round(rs.reduce((a, b) => a + b, 0), 2);
  const pts = [0];
  for (const r of rs) pts.push(round(pts[pts.length - 1] + r, 2));
  let peak = 0;
  let dd = 0;
  for (const v of pts) {
    peak = Math.max(peak, v);
    dd = Math.min(dd, v - peak);
  }
  const wins = rs.filter((r) => r > 0);
  const losses = rs.filter((r) => r <= 0);
  const followed = T.filter((e) => e.followed === true).length;
  const ok = n >= MIN_RATE;
  return {
    n,
    net,
    dd: round(dd, 2),
    expectancy: ok ? net / n : null,
    winRate: ok ? wins.length / n : null,
    avgWin: ok && wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : null,
    avgLoss: ok && losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : null,
    followed,
    planRate: n ? followed / n : null,
    pts,
  };
}

/** Entries of a status in the period and accounts (watched, not filled). */
export function countStatus(entries: Entry[], status: Entry["status"], accounts: string[], from: string, to?: string) {
  const set = new Set(accounts);
  return entries.filter((e) => e.status === status && set.has(e.account) && e.date >= from && (!to || e.date <= to)).length;
}

/** Sum of r per key (date, or week Monday), in order. */
export function rBy(T: Entry[], key: (e: Entry) => string): { k: string; r: number; n: number }[] {
  const m = new Map<string, { r: number; n: number }>();
  for (const e of T) {
    const k = key(e);
    const v = m.get(k) ?? { r: 0, n: 0 };
    v.r = round(v.r + (e.r as number), 2);
    v.n++;
    m.set(k, v);
  }
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ k, ...v }));
}

export type Group = { key: string; n: number; net: number; winRate: number | null; expectancy: number | null };

export function groupBy(T: Entry[], key: (e: Entry) => string): Group[] {
  const m = new Map<string, Entry[]>();
  for (const e of T) m.set(key(e), [...(m.get(key(e)) ?? []), e]);
  return [...m.entries()].map(([k, es]) => {
    const s = stats(es);
    return { key: k, n: s.n, net: s.net, winRate: s.winRate, expectancy: s.expectancy };
  });
}

export const SESSIONS: Session[] = ["Asia", "London", "New York"];

/** Costliest mistakes: per mistake-kind tag, trades carrying it and their summed r, most negative first. */
export function costliest(T: Entry[]): { tag: string; n: number; r: number }[] {
  const m = new Map<string, { n: number; r: number }>();
  for (const e of T)
    for (const t of e.mistakes) {
      const v = m.get(t) ?? { n: 0, r: 0 };
      v.n++;
      v.r = round(v.r + (e.r as number), 2);
      m.set(t, v);
    }
  return [...m.entries()].map(([tag, v]) => ({ tag, ...v })).sort((a, b) => a.r - b.r || b.n - a.n);
}

export const noMistake = (T: Entry[]) => T.filter((e) => e.mistakes.length === 0).length;

/** Setup early-signal flag: 5 to 19 trades. */
export const earlySignal = (n: number) => n >= MIN_RATE && n < EARLY;
