// This week's focus (DESIGN.md, "This week's focus belongs to the owner").
// The owner sets, edits or clears it for the week. If they haven't, last week's review takeaway fills it in,
// the way a voice note only fills empty fields. It lasts for its week; older takeaways never come back.
import type { Week } from "./types";
import { addDays, mondayOf, weekRange } from "./format";

/** The owner's own focus for one week: their words, or cleared ("no focus this week"). */
export type OwnFocus = { monday: string; text: string | null };

export type WeekFocus = {
  /** The week the focus is for (its Monday). */
  monday: string;
  text: string;
  /** "own": set by the owner. "review": last week's takeaway, linking to that review. */
  source: "own" | "review";
  /** Monday of the review it came from (source "review"). */
  reviewMonday?: string;
  /** The line under the quote. */
  from: string;
};

export function weekFocus(weeks: Week[], own: OwnFocus | null, today: string): WeekFocus | null {
  const monday = mondayOf(today);
  if (own && own.monday === monday) {
    const text = own.text?.trim();
    return text ? { monday, text, source: "own", from: `Set by you for ${weekRange(monday)}` } : null;
  }
  const last = addDays(monday, -7);
  const w = weeks.find((x) => x.monday === last);
  const text = w?.takeaway?.trim();
  return text ? { monday, text, source: "review", reviewMonday: last, from: `From your review of ${weekRange(last)}` } : null;
}
