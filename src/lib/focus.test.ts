import { describe, expect, it } from "vitest";
import { weekFocus } from "./focus";
import type { Week } from "./types";

const W = (monday: string, takeaway: string | null): Week => ({ monday, takeaway, watched: 0, not_filled: 0 });
const weeks = [W("2026-11-09", "Leave the stop where I planned it."), W("2026-11-02", "Wait for the 15m close.")];
const TODAY = "2026-11-16"; // a Monday
const THU = "2026-11-19";

describe("this week's focus belongs to the owner", () => {
  it("with nothing set, last week's review takeaway fills it in and links to that review", () => {
    expect(weekFocus(weeks, null, TODAY)).toEqual({
      monday: "2026-11-16",
      text: "Leave the stop where I planned it.",
      source: "review",
      reviewMonday: "2026-11-09",
      from: "From your review of 9 to 13 Nov",
    });
    expect(weekFocus(weeks, null, THU)?.text).toBe("Leave the stop where I planned it.");
  });

  it("the owner's own focus for this week wins over the review", () => {
    expect(weekFocus(weeks, { monday: "2026-11-16", text: "Only A+ setups." }, THU)).toEqual({
      monday: "2026-11-16",
      text: "Only A+ setups.",
      source: "own",
      from: "Set by you for 16 to 20 Nov",
    });
  });

  it("clearing it means no focus this week, and the review doesn't refill it", () => {
    expect(weekFocus(weeks, { monday: "2026-11-16", text: null }, TODAY)).toBeNull();
    expect(weekFocus(weeks, { monday: "2026-11-16", text: "   " }, TODAY)).toBeNull();
  });

  it("expires with its week: next week starts from that week's review, never an older one", () => {
    const own = { monday: "2026-11-16", text: "Only A+ setups." };
    expect(weekFocus(weeks, own, "2026-11-23")).toBeNull(); // 16 Nov week has no takeaway yet
    expect(weekFocus([W("2026-11-16", "Journal every trade."), ...weeks], own, "2026-11-23")?.text).toBe("Journal every trade.");
    // Last week had no takeaway: no focus, even though an older week has one.
    expect(weekFocus([W("2026-11-09", null), W("2026-11-02", "Wait for the 15m close.")], null, TODAY)).toBeNull();
  });
});
