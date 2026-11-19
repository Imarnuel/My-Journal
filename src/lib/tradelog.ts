// Trade log rules (handoff/docs/01-decisions.md, "Trade log" and "Behaviour kit"): filters with counts
// computed with the other filters applied, sort, batches, and the facts each row reads out.
// Pure functions over the shared entries; the screen is src/screens/TradeLog.tsx.
import type { Entry, Status } from "./types";
import { addDays, dateTime, fr, mondayOf, parseDate } from "./format";
import { periodStart } from "./calc";

export const BATCH = 12; // "Show older entries" loads 12 at a time

export type DatePreset = "All time" | "This week" | "Last week" | "This month" | "Last 3 months";
export const DATE_PRESETS: DatePreset[] = ["All time", "This week", "Last week", "This month", "Last 3 months"];
export const STATUSES: Status[] = ["Taken", "Running", "Watched", "Not filled", "Analysis"];
export const DIRS = ["Long", "Short"] as const;
export const SORTS = ["Newest first", "Oldest first", "Best R first", "Worst R first"] as const;
export type Sort = (typeof SORTS)[number];

export type Filters = {
  date: DatePreset | "Custom";
  from: string | null; // Custom range (Pick dates), inclusive
  to: string | null;
  pair: string | null;
  setup: string | null;
  tag: string | null;
  dir: string | null;
  status: string | null;
};
export type FilterKey = "date" | "pair" | "setup" | "tag" | "dir" | "status";
export const FILTER_KEYS: FilterKey[] = ["date", "pair", "setup", "tag", "dir", "status"];

export const NO_FILTERS: Filters = { date: "All time", from: null, to: null, pair: null, setup: null, tag: null, dir: null, status: null };

/** Inclusive [from, to] of a date preset, given today. */
export function presetRange(p: DatePreset, today: string): [string, string] {
  const mon = mondayOf(today);
  if (p === "This week") return [mon, "9999-12-31"];
  if (p === "Last week") return [addDays(mon, -7), addDays(mon, -1)];
  if (p === "This month") return [periodStart("month", today), "9999-12-31"];
  if (p === "Last 3 months") return [periodStart("3m", today), "9999-12-31"];
  return ["0000-01-01", "9999-12-31"];
}

export const pairsOf = (e: Entry) => e.pair.split(", ");
export const setupOf = (e: Entry) => e.setup || "No setup";

type Value = string | null;

/** Does an entry pass one filter at a value? A null value (or All time) passes everything. */
export function passes(e: Entry, k: FilterKey, v: Value, f: Filters, today: string): boolean {
  if (v == null || (k === "date" && v === "All time")) return true;
  switch (k) {
    case "date": {
      const [a, b] = v === "Custom" ? [f.from || "0000-01-01", f.to || "9999-12-31"] : presetRange(v as DatePreset, today);
      return e.date >= a && e.date <= b;
    }
    case "pair":
      return pairsOf(e).includes(v);
    case "setup":
      return setupOf(e) === v;
    case "tag":
      return e.tags.includes(v);
    case "dir":
      return e.dir === v;
    case "status":
      return e.status === v;
  }
}

/** Entries passing every filter except `skip`. */
export function applyFilters(entries: Entry[], f: Filters, today: string, skip?: FilterKey): Entry[] {
  return entries.filter((e) => FILTER_KEYS.every((k) => k === skip || passes(e, k, f[k], f, today)));
}

/** Count beside an option: entries that would show if this option were picked, other filters applied. */
export function optionCount(entries: Entry[], f: Filters, today: string, k: FilterKey, v: Value): number {
  return applyFilters(entries, f, today, k).filter((e) => passes(e, k, v, f, today)).length;
}

export const anyFilter = (f: Filters) => FILTER_KEYS.some((k) => (k === "date" ? f.date !== "All time" : f[k] != null));

/** Values of a field across all entries, most used first (ties keep first-seen order). */
export function valuesBy(entries: Entry[], fn: (e: Entry) => (string | null)[]): string[] {
  const c = new Map<string, number>();
  for (const e of entries) for (const v of fn(e)) if (v != null) c.set(v, (c.get(v) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
}

const key = (e: Entry) => e.date + e.time;
export function sortEntries(entries: Entry[], sort: Sort): Entry[] {
  const by: Record<Sort, (a: Entry, b: Entry) => number> = {
    "Newest first": (a, b) => key(b).localeCompare(key(a)),
    "Oldest first": (a, b) => key(a).localeCompare(key(b)),
    "Best R first": (a, b) => (b.r ?? -99) - (a.r ?? -99),
    "Worst R first": (a, b) => (a.r ?? 99) - (b.r ?? 99),
  };
  return entries.slice().sort(by[sort]);
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Date button label for Pick dates: "1 Nov to 16 Nov", with the year when it isn't this year. */
export function customLabel(from: string | null, to: string | null, today: string): string {
  const y = parseDate(today).getUTCFullYear();
  const fm = (x: string | null) => {
    if (!x) return "…";
    const d = parseDate(x);
    return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}${d.getUTCFullYear() !== y ? " " + d.getUTCFullYear() : ""}`;
  };
  return `${fm(from)} to ${fm(to)}`;
}

/** "Showing 12 of 134" and the entry count. */
export const entriesText = (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`;

// ---- Charts on a row -------------------------------------------------------------------------

export const isImage = (c: string) => /^(blob:|data:|https?:|\/)/.test(c);

/** Placeholder chart drawing for an entry the sample gives no key for (same family rule as the canvas). */
function lastKey(e: Entry): string {
  if (e.chartKey) return e.chartKey;
  const fam = (e.dir === "Short" ? "s" : "l") + (e.r != null && e.r > 0 ? "w" : "x");
  return fam + ((parseInt(e.id.replace(/\D/g, ""), 10) || 0) % 3);
}
const prevKey = (k: string) => k.slice(0, 2) + ((Number(k.slice(2)) + 1) % 3);

export type Thumbs = { n: number; list: string[]; grid: string | null; more: string };

/**
 * What a row shows: `list` (List view: up to two charts) and `grid` (Grid view: the card's lead chart).
 * An entry's own `chartList` (uploads or reordered charts) wins: the last two, the last one leads.
 * Without one, the canvas placeholders are used exactly as drawn on the canvas.
 */
export function thumbs(e: Entry): Thumbs {
  const own = e.chartList;
  if (own && own.length) {
    const n = own.length;
    return { n, list: own.slice(-2), grid: own[n - 1], more: n > 2 ? `+${n - 2} ${n - 2 === 1 ? "chart" : "charts"}` : "" };
  }
  const n = e.charts;
  if (n <= 0) return { n: 0, list: [], grid: null, more: "" };
  const last = lastKey(e);
  const k = [prevKey(last), last];
  return { n, list: n === 1 ? [k[0]] : k, grid: last, more: n > 2 ? `+${n - 2} ${n - 2 === 1 ? "chart" : "charts"}` : "" };
}

// ---- What each row reads out -----------------------------------------------------------------

export type RowFacts = {
  when: string;
  res: string; // List view result ("+2.1R", "Open", or empty)
  gres: string; // Grid view result (falls back to the status)
  resTone: "profit" | "loss" | "flat" | "muted";
  statusLabel: string;
  acct: string;
  hasAcct: boolean;
  plan: string;
  /** Second facts line (setup, plan, tags) for a taken trade with charts; otherwise a one-line hint. */
  facts2: boolean;
  hint: string;
  gridLine: string; // Grid view: setup, or a short hint
  gridSetup: boolean;
  noCharts: boolean;
  noNote: boolean;
};

export function rowFacts(e: Entry): RowFacts {
  const t = thumbs(e);
  const noCharts = t.n === 0;
  const taken = e.status === "Taken";
  const plan = e.followed === true ? "Followed" : e.followed === false ? "Not followed" : "";
  let hint = "";
  if (taken && noCharts) hint = `From MT5${e.mt5 ? " " + e.mt5 : ""}. No screenshot? Scroll back on your chart and take one now. It still counts.`;
  else if (e.status === "Running") hint = "Still open in MT5. When it closes you'll get one chance to add an after chart. Skipping is fine.";
  else if (e.status === "Watched") hint = `${e.setup} · Add an after chart any time if you want to see how it played out`;
  else if (e.status === "Not filled") hint = "Your limit order never triggered · stays out of your results";
  else if (e.status === "Analysis") hint = `“${e.plan ?? ""}”`;
  const res = taken && e.r != null ? fr(e.r) : e.status === "Running" ? "Open" : "";
  const v = e.r == null ? 0 : Math.round(e.r * 10) / 10;
  const gridLine =
    e.status === "Analysis" ? "Before trading"
    : e.status === "Running" ? "Running in MT5"
    : e.status === "Not filled" ? "Limit order never triggered"
    : noCharts ? "From MT5 · no charts yet"
    : e.setup || "";
  return {
    when: dateTime(e.date, e.time),
    res,
    gres: res || (e.status === "Analysis" ? "" : e.status),
    resTone: !taken ? "muted" : v > 0 ? "profit" : v < 0 ? "loss" : "flat",
    statusLabel: e.status === "Analysis" ? "Before trading" : e.status,
    acct: e.also ? `${e.account} and ${e.also}` : e.account,
    hasAcct: e.status !== "Analysis",
    plan,
    facts2: taken && !noCharts,
    hint,
    gridLine,
    gridSetup: taken && !noCharts && !!e.setup,
    noCharts,
    noNote: !e.note && taken,
  };
}

/** The very short trade prompt's details line: "MT5 #48240 · −0.1R. Count it in your stats? …" */
export function shortTradeLine(e: Entry): string {
  return `MT5 ${e.mt5 ?? ""} · ${e.r != null ? fr(e.r) : "0.0R"}. Count it in your stats? If you leave this, it counts.`;
}

