// Weekly review numbers against the screenshots (light/11-Review.png, states/32 and 33), seeded with
// data/entries.json and today = 16 November 2026, real accounts ticked.
import { describe, expect, it } from "vitest";
import { seedAccounts, seedEntries, TODAY } from "../data/seed";
import { realAccounts } from "../data/store";
import { fr } from "./format";
import { mistakeWhere, monthKey, pastWeeks, tradedWeeks, watchedLine, weekParam, weekReview, weekTitle } from "./review";

const real = realAccounts(seedAccounts);

describe("weeks", () => {
  it("opens on the latest traded week; the week in progress isn't listed", () => {
    const w = tradedWeeks(seedEntries, real, TODAY);
    expect(w[0]).toBe("2026-11-09");
    expect(w).not.toContain("2026-11-16");
    expect(tradedWeeks(seedEntries, real, "2026-11-20")[0]).toBe("2026-11-09");
    expect(tradedWeeks(seedEntries, real, "2026-11-23")[0]).toBe("2026-11-16");
  });

  it("lists every traded week with no limit", () => {
    expect(tradedWeeks(seedEntries, real, TODAY)).toHaveLength(30);
  });

  it("the account picker changes which weeks appear", () => {
    expect(tradedWeeks(seedEntries, ["Demo account"], TODAY)).toEqual(["2026-11-09", "2026-11-02", "2026-10-19"]);
  });

  it("labels", () => {
    expect(weekTitle("2026-11-09")).toBe("9 to 13 November");
    expect(weekTitle("2026-09-14")).toBe("14 to 18 September");
    expect(weekTitle("2026-08-31")).toBe("31 August to 4 September");
    expect(monthKey("2026-08-31")).toBe("2026-09");
    expect(weekParam("2026-09-16")).toBe("2026-09-14");
    expect(weekParam("nope")).toBeUndefined();
  });
});

describe("the week of 9 to 13 November", () => {
  const w = weekReview(seedEntries, real, "2026-11-09");

  it("Net, trades taken, plan followed", () => {
    expect(fr(w.net)).toBe("+3.4R");
    expect(w.n).toBe(11);
    expect(watchedLine(w.watched, w.notFilled)).toBe("2 watched · 1 not filled");
    expect(`${w.followed} of ${w.n}`).toBe("8 of 11");
  });

  it("mistakes tagged more than once", () => {
    expect(w.mistakes.map((m) => [m.tag, mistakeWhere(m), fr(m.r)])).toEqual([["Moved stop", "EURJPY 13 Nov, GBPUSD 11 Nov", "−2.0R"]]);
  });

  it("trade cards in screenshot order", () => {
    expect(w.trades.map((e) => `${e.pair} ${fr(e.r as number)}`)).toEqual([
      "EURJPY −1.0R", "GBPUSD −1.0R", "GBPJPY +1.7R", "USDCAD −1.0R", "XAUUSD +2.0R", "AUDUSD +1.0R",
      "USDJPY −1.0R", "GBPUSD −1.0R", "EURUSD −1.0R", "XAUUSD +2.6R", "GBPUSD +2.1R",
    ]);
  });

  it("reflections with pair", () => {
    expect(w.reflections.map((e) => e.pair)).toEqual(["EURJPY", "USDCAD", "XAUUSD", "GBPUSD"]);
  });

  it("the account picker changes every number", () => {
    const d = weekReview(seedEntries, ["Demo account"], "2026-11-09");
    expect([d.n, fr(d.net), d.watched, d.notFilled]).toEqual([1, "+2.4R", 0, 0]);
  });

  it("excluded trades never count", () => {
    const ex = seedEntries.map((e) => (e.id === "e9" ? { ...e, excluded: true } : e));
    const x = weekReview(ex, real, "2026-11-09");
    expect([x.n, fr(x.net)]).toEqual([10, "+0.8R"]);
    expect(tradedWeeks(ex, real, TODAY)[0]).toBe("2026-11-09");
  });
});

describe("the week of 14 to 18 September (state 33)", () => {
  const w = weekReview(seedEntries, real, "2026-09-14");
  it("numbers", () => {
    expect([fr(w.net), w.n, `${w.followed} of ${w.n}`, watchedLine(w.watched, w.notFilled)]).toEqual(["+0.6R", 2, "2 of 2", "Nothing watched or missed"]);
    expect(w.mistakes).toEqual([]);
    expect(w.reflections).toEqual([]);
    expect(w.trades.map((e) => `${e.pair} ${e.dir} ${fr(e.r as number)}`)).toEqual(["AUDUSD Long −1.0R", "AUDUSD Short +1.6R"]);
  });
});

describe("past weeks", () => {
  const months = pastWeeks(seedEntries, real, TODAY);

  it("month rows match the screenshot", () => {
    expect(months.map((m) => `${m.yearHead ? `${m.year} / ` : ""}${m.name} ${m.sub}`)).toEqual([
      "November 2 weeks · 18 trades · +4.9R",
      "October 3 weeks · 14 trades · 0.0R",
      "September 4 weeks · 14 trades · +3.1R",
      "August 3 weeks · 8 trades · −0.6R",
      "July 4 weeks · 11 trades · +2.4R",
      "June 3 weeks · 7 trades · +1.0R",
      "April 2 weeks · 5 trades · −1.2R",
      "March 4 weeks · 9 trades · +0.4R",
      "January 2 weeks · 3 trades · −0.5R",
      "2025 / December 2 weeks · 4 trades · +0.8R",
      "November 1 week · 2 trades · +0.3R",
    ]);
  });

  it("this month and last month open, older months fold", () => {
    expect(months.filter((m) => m.defaultOpen).map((m) => m.key)).toEqual(["2026-11", "2026-10"]);
  });

  it("week rows", () => {
    const rows = (k: string) => months.find((m) => m.key === k)!.weeks.map((w) => `${w.label} ${w.sub}`);
    expect(rows("2026-11")).toEqual(["9 to 13 Nov 11 trades · +3.4R", "2 to 6 Nov 7 trades · +1.5R"]);
    expect(rows("2026-10")).toEqual(["26 to 30 Oct 3 trades · −0.4R", "19 to 23 Oct 5 trades · +2.2R", "5 to 9 Oct 6 trades · −1.8R"]);
    expect(rows("2026-09").slice(0, 3)).toEqual(["21 to 25 Sep 4 trades · +1.9R", "14 to 18 Sep 2 trades · +0.6R", "7 to 11 Sep 5 trades · +1.2R"]);
    expect(rows("2026-09")[3]).toBe("31 Aug to 4 Sep 3 trades · −0.6R");
  });
});
