// Formatting rules from handoff/docs/05-data-and-calculations.md.
export const MINUS = "−";

/** +2.1R / −1.0R / 0.0R. `dp` 1 for results, 2 for expectancy. */
export function fr(r: number, dp = 1): string {
  const v = Math.round(r * 10 ** dp) / 10 ** dp;
  if (v === 0) return `${(0).toFixed(dp)}R`;
  return `${v > 0 ? "+" : MINUS}${Math.abs(v).toFixed(dp)}R`;
}

/** Signed number without the R, with a real minus. */
export function signed(n: number, dp = 1): string {
  const v = Math.round(n * 10 ** dp) / 10 ** dp;
  if (v === 0) return (0).toFixed(dp);
  return `${v > 0 ? "+" : MINUS}${Math.abs(v).toFixed(dp)}`;
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

/** Tone class for a result: profit, loss, or text-2 for zero. */
export function tone(r: number | null | undefined): string {
  if (r == null) return "var(--text-2)";
  const v = Math.round(r * 10) / 10;
  return v > 0 ? "var(--profit)" : v < 0 ? "var(--loss)" : "var(--text-2)";
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function parseDate(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}
export function isoDate(dt: Date): string {
  return dt.toISOString().slice(0, 10);
}
export function addDays(d: string, n: number): string {
  const dt = parseDate(d);
  dt.setUTCDate(dt.getUTCDate() + n);
  return isoDate(dt);
}
export function mondayOf(d: string): string {
  const dt = parseDate(d);
  const dow = (dt.getUTCDay() + 6) % 7;
  return addDays(d, -dow);
}

/** "Mon 16 Nov" */
export function dayLabel(d: string): string {
  const dt = parseDate(d);
  return `${DOW[dt.getUTCDay()]} ${dt.getUTCDate()} ${MON[dt.getUTCMonth()]}`;
}
/** "Mon 16 Nov, 09:45" */
export function dateTime(d: string, t: string): string {
  return `${dayLabel(d)}, ${t}`;
}
/** "16 Nov" */
export function shortDate(d: string): string {
  const dt = parseDate(d);
  return `${dt.getUTCDate()} ${MON[dt.getUTCMonth()]}`;
}
export function monthName(d: string): string {
  return MONTH[parseDate(d).getUTCMonth()];
}
export function monShort(d: string): string {
  return MON[parseDate(d).getUTCMonth()];
}
/** "9 to 13 Nov" (Monday to Friday of a week), or across months "30 Nov to 4 Dec". */
export function weekRange(monday: string, days = 4): string {
  const a = parseDate(monday);
  const b = parseDate(addDays(monday, days));
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()} to ${b.getUTCDate()} ${MON[b.getUTCMonth()]}`;
  return `${a.getUTCDate()} ${MON[a.getUTCMonth()]} to ${b.getUTCDate()} ${MON[b.getUTCMonth()]}`;
}

/** What an entry is called in a message: "GBPUSD trade", "EURJPY watched setup", "GBPUSD, XAUUSD analysis". */
export function entryName(e: { pair: string; status: string }): string {
  const noun = e.status === "Watched" ? "watched setup" : e.status === "Not filled" ? "order" : e.status === "Analysis" ? "analysis" : "trade";
  return `${e.pair} ${noun}`;
}
