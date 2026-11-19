// Dashboard numbers for every period, checked against the prototype (handoff/prototype/Dashboard.dc.html)
// and the screenshots (light/02-Dashboard.png, states/02-dashboard-period-3-months.png).
import { describe, expect, it } from "vitest";
import { seedEntries, seedTags, TODAY } from "../data/seed";
import type { Entry, TagKind } from "./types";
import { fr, pct } from "./format";
import {
  barGroups, barHeight, bestWorst, breakdown, dateSpan, eqGrid, eqPaths, eqScale, eqTicks, firstWeekday,
  mistakeRows, mistakesOf, noChartTrades, periodNumbers, recentStories, resample, setupOrder, subtitle, widerPeriod,
} from "./dashboard";

const REAL = ["Main account", "Funded 100K", "Challenge 50K"];
const kindOf = (t: string): TagKind | undefined => seedTags.find((x) => x.t === t)?.k;
const SETUPS = [{ name: "4H supply pullback" }, { name: "London breakout" }, { name: "Asian range fade" }];

const top = (p: ReturnType<typeof periodNumbers>) => [
  fr(p.s.net), fr(p.s.dd), p.s.expectancy == null ? null : fr(p.s.expectancy, 2), p.s.winRate == null ? null : pct(p.s.winRate),
  p.s.avgWin == null ? null : fr(p.s.avgWin), p.s.avgLoss == null ? null : fr(p.s.avgLoss), `${p.s.followed} of ${p.s.n}`, p.watched, p.notFilled,
];
const rowTxt = (rows: ReturnType<typeof breakdown>) =>
  rows.map((r) => [r.name, r.n, r.rated ? pct(r.winRate) : "-", r.rated ? fr(r.expectancy, 2) : "-", fr(r.net), `${r.bar.side} ${r.bar.pct}`]);

describe("period line", () => {
  it("subtitles", () => {
    expect(subtitle("week", TODAY)).toBe("This week so far · 16 November · all figures in R");
    expect(subtitle("month", TODAY)).toBe("November so far · 2 to 16 November · all figures in R");
    expect(subtitle("3m", TODAY)).toBe("Last 3 months · 17 August to 16 November · all figures in R");
  });
  it("first weekday and spans", () => {
    expect(firstWeekday("2026-11-01")).toBe("2026-11-02");
    expect(firstWeekday("2026-11-04")).toBe("2026-11-04");
    expect(dateSpan("2026-11-18", "2026-11-18")).toBe("18 November");
    expect(dateSpan("2026-11-16", "2026-11-18")).toBe("16 to 18 November");
  });
  it("wider period", () => {
    expect(widerPeriod("week")).toBe("month");
    expect(widerPeriod("month")).toBe("3m");
    expect(widerPeriod("3m")).toBeNull();
  });
});

describe("This month (light/02-Dashboard.png)", () => {
  const p = periodNumbers(seedEntries, REAL, "month", TODAY);
  it("top row", () => {
    expect(p.enough).toBe(true);
    expect(top(p)).toEqual(["+7.6R", "−2.0R", "+0.38R", "50%", "+1.8R", "−1.0R", "14 of 20", 8, 2]);
  });
  it("R over time geometry matches the prototype", () => {
    const { lo, hi, step } = eqScale(p.s.pts);
    expect([lo, hi, step]).toEqual([-1, 8, 4]);
    const g = eqPaths(p.s.pts, lo, hi);
    // The plot now runs from the left edge to the value labels on the right (DESIGN.md, Dashboard charts);
    // the heights are the prototype's, unchanged.
    expect(g.line.startsWith("M6.0 203.6 L33.5 224.0 L61.0 187.2")).toBe(true);
    expect(g.line.endsWith("L528.5 60.4 L556.0 48.2")).toBe(true);
    expect(g.line.split(" L").length).toBe(21);
    expect([g.endX.toFixed(1), g.endY.toFixed(1)]).toEqual(["556.0", "48.2"]);
    expect(eqGrid(lo, hi, step)).toEqual([0, 4, 8]);
    expect(eqTicks(p.T, "month")).toEqual([
      { i: 1, label: "2 Nov" },
      { i: 8, label: "9 Nov" },
      { i: 19, label: "16 Nov" },
    ]);
  });
  it("R by day", () => {
    const g = barGroups(p.T, false);
    expect(g.map((x) => [x.k.slice(8), fr(x.r), x.n, barHeight(x.r, g)])).toEqual([
      ["02", "+0.8R", 2, 25], ["03", "−1.0R", 1, 31], ["04", "+2.2R", 1, 68], ["05", "−2.0R", 2, 62], ["06", "+1.5R", 1, 47], ["09", "+2.1R", 1, 65],
      ["10", "+1.6R", 2, 50], ["11", "−1.0R", 3, 31], ["12", "+2.7R", 3, 84], ["13", "−2.0R", 2, 62], ["16", "+2.7R", 2, 84],
    ]);
    const { best, worst } = bestWorst(g, p.from);
    expect([fr(best.r), best.k, fr(worst.r), worst.k]).toEqual(["+2.7R", "2026-11-12", "−2.0R", "2026-11-05"]);
  });
  it("by setup, by session, costliest mistakes", () => {
    expect(rowTxt(breakdown(p.T, setupOrder(SETUPS, p.T), (e) => e.setup))).toEqual([
      ["4H supply pullback", 9, "67%", "+1.09R", "+9.8R", "left 50"],
      ["London breakout", 5, "40%", "+0.04R", "+0.2R", "left 1"],
      ["Asian range fade", 3, "-", "-", "−1.0R", "right 5.1"],
      ["Unsorted", 3, "-", "-", "−1.4R", "right 7.1"],
    ]);
    expect(rowTxt(breakdown(p.T, ["Asia", "London", "New York"], (e) => e.session))).toEqual([
      ["Asia", 3, "-", "-", "−1.0R", "right 10.4"],
      ["London", 12, "50%", "+0.32R", "+3.8R", "left 39.6"],
      ["New York", 5, "60%", "+0.96R", "+4.8R", "left 50"],
    ]);
    const m = mistakeRows(p.T, kindOf);
    expect(m.rows.map((x) => [x.tag, x.n, fr(x.r), x.pct])).toEqual([
      ["Moved stop", 3, "−3.0R", 100],
      ["Entered before close", 2, "−2.0R", 67],
      ["Chased entry", 2, "−2.0R", 67],
    ]);
    expect(m.untagged).toBe(14);
  });
  it("one account only", () => {
    const q = periodNumbers(seedEntries, ["Main account"], "month", TODAY);
    expect(top(q)).toEqual(["−0.4R", "−3.0R", "−0.08R", "40%", "+1.3R", "−1.0R", "3 of 5", 0, 1]);
  });
});

describe("3 months (states/02-dashboard-period-3-months.png)", () => {
  const p = periodNumbers(seedEntries, REAL, "3m", TODAY);
  it("top row", () => {
    expect(p.from).toBe("2026-08-17");
    expect(top(p)).toEqual(["+9.1R", "−4.0R", "+0.17R", "43%", "+1.7R", "−1.0R", "42 of 53", 16, 6]);
  });
  it("R by week", () => {
    const g = barGroups(p.T, true);
    expect(g.length).toBe(12);
    expect(g.filter((x) => x.r > 0).length).toBe(8);
    expect(g.map((x) => [x.k, fr(x.r), x.first, barHeight(x.r, g)])).toEqual([
      ["2026-08-17", "−2.0R", true, 49], ["2026-08-24", "+0.4R", false, 10], ["2026-08-31", "−0.6R", false, 15], ["2026-09-07", "+1.2R", true, 30],
      ["2026-09-14", "+0.6R", false, 15], ["2026-09-21", "+1.9R", false, 47], ["2026-10-05", "−1.8R", true, 44], ["2026-10-19", "+2.2R", false, 54],
      ["2026-10-26", "−0.4R", false, 10], ["2026-11-02", "+1.5R", true, 37], ["2026-11-09", "+3.4R", false, 84], ["2026-11-16", "+2.7R", false, 67],
    ]);
    const { best, worst } = bestWorst(g, p.from);
    expect([fr(best.r), best.k, fr(worst.r), worst.k]).toEqual(["+3.4R", "2026-11-09", "−2.0R", "2026-08-17"]);
  });
  it("line scale and month ticks", () => {
    const { lo, hi, step } = eqScale(p.s.pts);
    expect([hi, step]).toEqual([12, 4]);
    expect(eqGrid(lo, hi, step)).toEqual([0, 4, 8, 12]);
    expect(eqTicks(p.T, "3m").map((t) => t.label)).toEqual(["Aug", "Sep", "Oct", "Nov"]);
    expect(eqPaths(p.s.pts, lo, hi).endY.toFixed(1)).toBe("77.6");
  });
  it("breakdowns", () => {
    expect(rowTxt(breakdown(p.T, setupOrder(SETUPS, p.T), (e) => e.setup))).toEqual([
      ["4H supply pullback", 25, "48%", "+0.38R", "+9.6R", "left 50"],
      ["London breakout", 11, "45%", "+0.18R", "+2.0R", "left 10.4"],
      ["Asian range fade", 7, "29%", "−0.26R", "−1.8R", "right 9.4"],
      ["Unsorted", 10, "40%", "−0.07R", "−0.7R", "right 3.6"],
    ]);
    const m = mistakeRows(p.T, kindOf);
    expect(m.rows.map((x) => [x.tag, x.n, fr(x.r), x.pct])).toEqual([
      ["Entered before close", 5, "−5.0R", 100],
      ["Moved stop", 5, "−5.0R", 100],
      ["Chased entry", 2, "−2.0R", 40],
    ]);
    expect(m.untagged).toBe(42);
  });
});

describe("This week (fewer than 5 trades)", () => {
  const p = periodNumbers(seedEntries, REAL, "week", TODAY);
  it("too few for numbers", () => {
    expect(p.from).toBe("2026-11-16");
    expect(p.T.length).toBe(2);
    expect(p.enough).toBe(false);
    expect(p.s.winRate).toBeNull();
    expect(p.s.expectancy).toBeNull();
    expect(fr(p.s.net)).toBe("+2.7R");
    expect([p.watched, p.notFilled]).toEqual([1, 0]);
    expect(eqTicks(p.T, "week")).toEqual([{ i: 1, label: "16 Nov" }]);
  });
});

describe("recency and notice", () => {
  it("recent chart stories ignore period and accounts", () => {
    expect(recentStories(seedEntries).map((e) => `${e.pair} ${e.status}`)).toEqual([
      "AUDUSD Running", "EURJPY Watched", "GBPUSD Taken", "GBPUSD Taken", "EURJPY Taken", "NZDUSD Not filled",
    ]);
  });
  it("no-charts notice: MT5 trades without charts", () => {
    const n = noChartTrades(seedEntries);
    expect(n.map((e) => e.id)).toEqual(["e19"]);
    const after = seedEntries.map((e): Entry => (e.id === "e19" ? { ...e, charts: 1 } : e));
    expect(noChartTrades(after)).toEqual([]);
    expect(recentStories(after).map((e) => e.id).slice(0, 3)).toEqual(["e24", "e25", "e19"]);
  });
  it("mistakes come from tag kinds", () => {
    const e = seedEntries.find((x) => x.id === "e18")!;
    expect(mistakesOf(e, kindOf).sort()).toEqual(["Chased entry", "Moved stop"]);
    expect(mistakesOf({ ...e, tags: [...e.tags, "Supply zone"] }, kindOf).sort()).toEqual(["Chased entry", "Moved stop"]);
  });
  it("resample keeps the ends", () => {
    expect(resample([0, 2], 3)).toEqual([0, 1, 2]);
    expect(resample([0, 1, 2, 3, 4], 3)).toEqual([0, 2, 4]);
    expect(resample([], 2)).toEqual([0, 0]);
  });
});
