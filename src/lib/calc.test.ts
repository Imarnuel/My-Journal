import { describe, expect, it } from "vitest";
import { handoffEntries, TODAY } from "../data/seed";
import { costliest, countStatus, counted, groupBy, noMistake, periodStart, rBy, stats } from "./calc";
import { fr, pct } from "./format";

const REAL = ["Main account", "Funded 100K", "Challenge 50K"];

describe("dashboard, This month, real accounts (screenshots/light/02-Dashboard.png)", () => {
  const from = periodStart("month", TODAY);
  const T = counted(handoffEntries, REAL, from, TODAY);
  const s = stats(T);

  it("top row", () => {
    expect(from).toBe("2026-11-01");
    expect(fr(s.net)).toBe("+7.6R");
    expect(fr(s.dd)).toBe("−2.0R");
    expect(fr(s.expectancy!, 2)).toBe("+0.38R");
    expect(pct(s.winRate!)).toBe("50%");
    expect(fr(s.avgWin!)).toBe("+1.8R");
    expect(fr(s.avgLoss!)).toBe("−1.0R");
    expect(pct(s.planRate!)).toBe("70%");
    expect(s.followed).toBe(14);
    expect(s.n).toBe(20);
    expect(countStatus(handoffEntries, "Watched", REAL, from, TODAY)).toBe(8);
    expect(countStatus(handoffEntries, "Not filled", REAL, from, TODAY)).toBe(2);
  });

  it("R by day", () => {
    const days = rBy(T, (e) => e.date);
    expect(days.length).toBe(11);
    expect(days.filter((d) => d.r > 0).length).toBe(7);
    const best = days.reduce((a, b) => (b.r > a.r ? b : a));
    const worst = days.reduce((a, b) => (b.r < a.r ? b : a));
    expect([fr(best.r), best.k]).toEqual(["+2.7R", "2026-11-12"]);
    expect([fr(worst.r), worst.k]).toEqual(["−2.0R", "2026-11-05"]);
  });

  it("by setup and session", () => {
    const g = Object.fromEntries(groupBy(T, (e) => e.setup).map((x) => [x.key, x]));
    expect(g["4H supply pullback"].n).toBe(9);
    expect(fr(g["4H supply pullback"].net)).toBe("+9.8R");
    expect(fr(g["4H supply pullback"].expectancy!, 2)).toBe("+1.09R");
    expect(fr(g["London breakout"].net)).toBe("+0.2R");
    expect(g["Asian range fade"].winRate).toBeNull();
    expect(fr(g["Unsorted"].net)).toBe("−1.4R");
    const se = Object.fromEntries(groupBy(T, (e) => e.session).map((x) => [x.key, x]));
    expect([se.London.n, fr(se.London.net), fr(se.London.expectancy!, 2)]).toEqual([12, "+3.8R", "+0.32R"]);
    expect([se["New York"].n, fr(se["New York"].net)]).toEqual([5, "+4.8R"]);
  });

  it("costliest mistakes", () => {
    const c = costliest(T);
    expect(c.map((x) => [x.tag, x.n, fr(x.r)])).toEqual([
      ["Moved stop", 3, "−3.0R"],
      ["Entered before close", 2, "−2.0R"],
      ["Chased entry", 2, "−2.0R"],
    ]);
    expect(noMistake(T)).toBe(14);
  });
});

describe("format", () => {
  it("signs and zero", () => {
    expect(fr(0)).toBe("0.0R");
    expect(fr(-0.04)).toBe("0.0R");
    expect(fr(2.14)).toBe("+2.1R");
    expect(fr(0.375, 2)).toBe("+0.38R");
  });
  it("3 months starts 17 Aug 2026", () => {
    expect(periodStart("3m", TODAY)).toBe("2026-08-17");
  });
});
