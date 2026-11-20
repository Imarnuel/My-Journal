import { describe, expect, it } from "vitest";
import { handoffEntries } from "../data/seed";
import type { Entry } from "./types";
import { examplesOf, filterExamples, lessonsOf, moveItem, patterns, setupStats, spark, unsortedOf, EX_FILTERS } from "./playbook";

const REAL = ["Main account", "Funded 100K", "Challenge 50K"];
const S = "4H supply pullback";

describe("setup stats (frames 08 and 09, real accounts)", () => {
  it("4H supply pullback: +0.29R, 46%, +1.8R, 41 taken, 7 watched, line over the last 20", () => {
    const x = setupStats(handoffEntries, S, REAL);
    expect([x.exp, x.wr, x.avgW, x.n, x.watched]).toEqual(["+0.29R", "46%", "+1.8R", 41, 7]);
    expect([x.rated, x.early, x.hasLine, x.lastN]).toEqual([true, false, true, 20]);
  });
  it("London breakout and Asian range fade carry the early signal", () => {
    const l = setupStats(handoffEntries, "London breakout", REAL);
    const a = setupStats(handoffEntries, "Asian range fade", REAL);
    expect([l.exp, l.n, l.watched, l.early, l.lastN]).toEqual(["+0.12R", 17, 7, true, 17]);
    expect([a.exp, a.n, a.watched, a.early, a.lastN]).toEqual(["−0.13R", 19, 9, true, 19]);
  });
  it("follows the account picker and leaves out excluded trades", () => {
    expect(setupStats(handoffEntries, S, ["Demo account"]).n).toBe(2);
    const ex = handoffEntries.map((e) => (e.id === "e20" ? { ...e, excluded: true } : e));
    expect(setupStats(ex, S, REAL).n).toBe(40);
  });
  it("under 5 trades: no rates, too few for numbers; 5 to 9: rated without the line", () => {
    const few = setupStats(handoffEntries, S, ["Demo account"]);
    expect([few.n, few.rated, few.hasLine]).toEqual([2, false, false]);
    const some = setupStats(handoffEntries, S, ["Challenge 50K"]);
    expect([some.n, some.rated, some.early, some.hasLine]).toEqual([9, true, true, false]);
  });
});

describe("sparkline", () => {
  it("draws cumulative R with a 2px inset and the zero line", () => {
    const s = spark([1, -1, 2], 150, 30);
    expect(s.points).toBe("2.0,15.0 75.0,27.0 148.0,3.0");
    expect(s.zero).toBe("27.0");
    expect(s.end).toBe(2);
  });
});

describe("examples", () => {
  const all = examplesOf(handoffEntries, S);
  it("every chart story from every account, with real filter counts", () => {
    expect(all.length).toBe(52);
    expect(EX_FILTERS.map((f) => filterExamples(all, f).length)).toEqual([52, 21, 22, 7, 2, 3]);
  });
  it("newest day first, in the frame's order", () => {
    expect(all.slice(0, 6).map((e) => `${e.pair} ${e.date.slice(5)}`)).toEqual(["GBPUSD 11-16", "GBPUSD 11-13", "XAUUSD 11-12", "GBPUSD 11-11", "GBPUSD 11-10", "XAUUSD 11-10"]);
  });
});

describe("patterns", () => {
  it("need 20 trades; splits under 10 on a side carry the early dot (frame 29)", () => {
    const T = setupStats(handoffEntries, S, REAL).T;
    const p = patterns(T);
    expect(p.map((x) => [x.h, x.early, x.rows.map((r) => `${r.l} ${r.txt}`)])).toEqual([
      ["Session", false, ["New York 47% · 19", "London 45% · 22"]],
      ["Plan", true, ["Followed 59% · 32", "Not followed 0% · 9"]],
      ["Stop", true, ["Kept where planned 50% · 38", "Moved 0% · 3"]],
    ]);
    expect(patterns(T.slice(0, 19))).toEqual([]);
  });
});

describe("lessons and unsorted", () => {
  it("lessons are every reflection in the setup, newest first; the first five are frame 30's", () => {
    const all = lessonsOf(handoffEntries, S).map((e) => `${e.pair} ${e.date.slice(5)}`);
    expect(all.slice(0, 5)).toEqual(["XAUUSD 11-12", "GBPUSD 11-11", "GBPUSD 11-05", "USDCAD 10-19", "USDCAD 09-09"]);
    expect(all.length).toBe(10);
  });
  it("Unsorted counts chart stories, not the running trade or analysis (21)", () => {
    expect(unsortedOf(handoffEntries).length).toBe(21);
    const moved = handoffEntries.map((e): Entry => (e.setup === "London breakout" ? { ...e, setup: "Unsorted" } : e));
    expect(unsortedOf(moved).length).toBe(21 + 28);
  });
});

describe("moveItem", () => {
  it("moves one item and leaves the rest in order", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moveItem(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });
});
