// Weekly review formulas (handoff/docs/05-data-and-calculations.md, "Weekly review"; 01-decisions.md, "Weekly review").
// Pure functions over the shared entries. Weeks run Monday to Sunday and are named by their Monday.
import type { Entry } from "./types";
import { counted, countStatus } from "./calc";
import { addDays, fr, mondayOf, parseDate, shortDate, weekRange } from "./format";

const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const round2 = (x: number) => Math.round(x * 100) / 100;
const sumR = (T: Entry[]) => round2(T.reduce((a, e) => a + (e.r as number), 0));

/** "9 to 13 November" (the page subtitle), or across months "30 November to 4 December". */
export function weekTitle(monday: string): string {
  const a = parseDate(monday);
  const b = parseDate(addDays(monday, 4));
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()} to ${b.getUTCDate()} ${MONTH[b.getUTCMonth()]}`;
  return `${a.getUTCDate()} ${MONTH[a.getUTCMonth()]} to ${b.getUTCDate()} ${MONTH[b.getUTCMonth()]}`;
}

/** "9 to 13 Nov" (a row in Past weeks). */
export const weekLabel = (monday: string) => weekRange(monday);

/** The month a week is listed under: the month of its Friday, as YYYY-MM. */
export const monthKey = (monday: string) => addDays(monday, 4).slice(0, 7);

/** Previous calendar month of a YYYY-MM key. */
function prevMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

/**
 * Weeks the user traded in the ticked accounts, newest first. A week is listed when it has at least one
 * taken trade and has ended (the week in progress isn't listed until it ends).
 */
export function tradedWeeks(entries: Entry[], picked: string[], today: string): string[] {
  const set = new Set(picked);
  const current = mondayOf(today);
  const weeks = new Set<string>();
  for (const e of entries) {
    if (e.status !== "Taken" || !set.has(e.account)) continue;
    const w = mondayOf(e.date);
    if (w < current) weeks.add(w);
  }
  return [...weeks].sort().reverse();
}

/** Counted trades of one week, in the order the review lists them: newest day first, then through the day. */
export function weekTrades(entries: Entry[], picked: string[], monday: string): Entry[] {
  return counted(entries, picked, monday, addDays(monday, 6)).sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));
}

export type Mistake = { tag: string; trades: Entry[]; r: number };

export type WeekReview = {
  monday: string;
  trades: Entry[];
  n: number;
  net: number;
  followed: number;
  watched: number;
  notFilled: number;
  /** Mistake tags carried by more than one of the week's trades, in the order they first appear. */
  mistakes: Mistake[];
  /** The week's trades that have a reflection. */
  reflections: Entry[];
};

export function weekReview(entries: Entry[], picked: string[], monday: string): WeekReview {
  const trades = weekTrades(entries, picked, monday);
  const to = addDays(monday, 6);
  const byTag = new Map<string, Entry[]>();
  for (const e of trades) for (const m of e.mistakes) byTag.set(m, [...(byTag.get(m) ?? []), e]);
  const mistakes = [...byTag.entries()].filter(([, T]) => T.length > 1).map(([tag, T]) => ({ tag, trades: T, r: sumR(T) }));
  return {
    monday,
    trades,
    n: trades.length,
    net: sumR(trades),
    followed: trades.filter((e) => e.followed === true).length,
    watched: countStatus(entries, "Watched", picked, monday, to),
    notFilled: countStatus(entries, "Not filled", picked, monday, to),
    mistakes,
    reflections: trades.filter((e) => !!e.refl),
  };
}

/** "2 watched · 1 not filled", or "Nothing watched or missed". */
export function watchedLine(watched: number, notFilled: number): string {
  return [watched ? `${watched} watched` : "", notFilled ? `${notFilled} not filled` : ""].filter(Boolean).join(" · ") || "Nothing watched or missed";
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

export type PastWeek = { monday: string; label: string; n: number; net: number; sub: string };
export type PastMonth = {
  key: string; // YYYY-MM
  name: string; // "September"
  year: string;
  /** A year header goes above this month: the list has crossed into an earlier year. */
  yearHead: boolean;
  /** This month and last month start open; older months fold to one row. */
  defaultOpen: boolean;
  weeks: PastWeek[];
  n: number;
  net: number;
  /** "4 weeks · 14 trades · +3.1R" */
  sub: string;
};

/** Past weeks grouped under month headers, newest first. Every traded week, no limit. */
export function pastWeeks(entries: Entry[], picked: string[], today: string): PastMonth[] {
  const list = tradedWeeks(entries, picked, today);
  const T = counted(entries, picked);
  const byWeek = new Map<string, Entry[]>();
  for (const e of T) {
    const w = mondayOf(e.date);
    byWeek.set(w, [...(byWeek.get(w) ?? []), e]);
  }
  const thisM = today.slice(0, 7);
  const lastM = prevMonth(thisM);
  const months: PastMonth[] = [];
  let year = today.slice(0, 4);
  for (const w of list) {
    const key = monthKey(w);
    let m = months[months.length - 1];
    if (!m || m.key !== key) {
      const y = key.slice(0, 4);
      m = { key, name: MONTH[Number(key.slice(5)) - 1], year: y, yearHead: y !== year, defaultOpen: key === thisM || key === lastM, weeks: [], n: 0, net: 0, sub: "" };
      year = y;
      months.push(m);
    }
    const wt = byWeek.get(w) ?? [];
    const net = sumR(wt);
    m.weeks.push({ monday: w, label: weekLabel(w), n: wt.length, net, sub: `${plural(wt.length, "trade")} · ${fr(net)}` });
  }
  for (const m of months) {
    m.n = m.weeks.reduce((a, w) => a + w.n, 0);
    m.net = round2(m.weeks.reduce((a, w) => a + w.net, 0));
    m.sub = `${plural(m.weeks.length, "week")} · ${plural(m.n, "trade")} · ${fr(m.net)}`;
  }
  return months;
}

/** "EURJPY 13 Nov, GBPUSD 11 Nov": where a repeated mistake happened. */
export const mistakeWhere = (m: Mistake) => m.trades.map((e) => `${e.pair} ${shortDate(e.date)}`).join(", ");

/** The week a /review/:week param names (any date in the week), or undefined if it isn't a date. */
export function weekParam(p: string | undefined): string | undefined {
  if (!p || !/^\d{4}-\d{2}-\d{2}$/.test(p) || Number.isNaN(parseDate(p).getTime())) return undefined;
  return mondayOf(p);
}

