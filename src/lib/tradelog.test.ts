import { describe, expect, it } from "vitest";
import { handoffEntries, TODAY } from "../data/seed";
import {
  anyFilter,
  applyFilters,
  customLabel,
  NO_FILTERS,
  optionCount,
  pairsOf,
  presetRange,
  rowFacts,
  shortTradeLine,
  sortEntries,
  thumbs,
  valuesBy,
  type Filters,
} from "./tradelog";
import type { Entry } from "./types";

const E = handoffEntries;
const f = (p: Partial<Filters>): Filters => ({ ...NO_FILTERS, ...p });
const byId = (id: string) => E.find((e) => e.id === id)!;

describe("date presets (today Mon 16 Nov 2026)", () => {
  it("ranges", () => {
    expect(presetRange("This week", TODAY)[0]).toBe("2026-11-16");
    expect(presetRange("Last week", TODAY)).toEqual(["2026-11-09", "2026-11-15"]);
    expect(presetRange("This month", TODAY)[0]).toBe("2026-11-01");
    expect(presetRange("Last 3 months", TODAY)[0]).toBe("2026-08-17");
  });
  it("counts match the Date menu on the canvas: 134, 5, 15, 34, 80", () => {
    const counts = (["All time", "This week", "Last week", "This month", "Last 3 months"] as const).map((v) => optionCount(E, NO_FILTERS, TODAY, "date", v));
    expect(counts).toEqual([134, 5, 15, 34, 80]);
  });
  it("Pick dates is inclusive and the label names the range", () => {
    expect(applyFilters(E, f({ date: "Custom", from: "2026-11-09", to: "2026-11-13" }), TODAY)).toHaveLength(15);
    expect(customLabel("2026-11-01", "2026-11-16", TODAY)).toBe("1 Nov to 16 Nov");
    expect(customLabel("2025-12-01", null, TODAY)).toBe("1 Dec 2025 to …");
  });
});

describe("filters", () => {
  it("counts are computed with the other filters applied", () => {
    const week = f({ date: "This week" });
    const taken = optionCount(E, week, TODAY, "status", "Taken");
    expect(taken).toBe(applyFilters(E, f({ date: "This week", status: "Taken" }), TODAY).length);
    // The option's own filter is ignored when counting its options.
    const st = f({ date: "This week", status: "Taken" });
    expect(optionCount(E, st, TODAY, "status", "Running")).toBe(1);
    expect(optionCount(E, st, TODAY, "status", null)).toBe(5);
  });
  it("an analysis on two pairs matches both, an entry without a setup is No setup", () => {
    expect(pairsOf(byId("e26"))).toEqual(["GBPUSD", "XAUUSD"]);
    expect(applyFilters(E, f({ date: "This week", pair: "XAUUSD" }), TODAY).map((e) => e.id)).toEqual(["e26"]);
    expect(applyFilters(E, f({ setup: "No setup" }), TODAY).every((e) => !e.setup)).toBe(true);
  });
  it("option values are most used first", () => {
    const setups = valuesBy(E, (e) => [e.setup || "No setup"]);
    const n = (s: string) => E.filter((e) => (e.setup || "No setup") === s).length;
    for (let i = 1; i < setups.length; i++) expect(n(setups[i - 1])).toBeGreaterThanOrEqual(n(setups[i]));
  });
  it("anyFilter", () => {
    expect(anyFilter(NO_FILTERS)).toBe(false);
    expect(anyFilter(f({ dir: "Long" }))).toBe(true);
    expect(anyFilter(f({ date: "Last week" }))).toBe(true);
  });
});

describe("sort", () => {
  it("newest first matches the canvas order", () => {
    expect(sortEntries(E, "Newest first").slice(0, 5).map((e) => e.id)).toEqual(["e24", "e25", "e19", "e20", "e26"]);
  });
  it("best and worst R put entries without a result last", () => {
    const best = sortEntries(E, "Best R first");
    expect(best[0].r).toBe(Math.max(...E.filter((e) => e.r != null).map((e) => e.r!)));
    expect(best[best.length - 1].r).toBeNull();
    const worst = sortEntries(E, "Worst R first");
    expect(worst[0].r).toBe(Math.min(...E.filter((e) => e.r != null).map((e) => e.r!)));
  });
});

describe("rows", () => {
  it("placeholder charts follow the canvas: last two in the list, the last one leads the card", () => {
    expect(thumbs(byId("e20"))).toEqual({ n: 5, list: ["sw0", "sw2"], grid: "sw2", more: "+3 charts" });
    expect(thumbs(byId("e16")).more).toBe("+1 chart");
    expect(thumbs(byId("e24"))).toMatchObject({ n: 1, list: ["lx1"], grid: "lx0" }); // no key in the sample
    expect(thumbs(byId("e19"))).toMatchObject({ n: 0, list: [], grid: null });
  });
  it("an entry's own charts win (uploads)", () => {
    const e: Entry = { ...byId("e19"), chartList: ["blob:a", "blob:b", "blob:c"], charts: 3 };
    expect(thumbs(e)).toEqual({ n: 3, list: ["blob:b", "blob:c"], grid: "blob:c", more: "+1 chart" });
    expect(rowFacts(e).facts2).toBe(true);
  });
  it("rows read as facts only (DESIGN.md): no status sentences, the status explains itself on hover", () => {
    expect(rowFacts(byId("e19"))).toMatchObject({ res: "+0.6R", noCharts: true, facts2: true, noNote: true, mt5: "MT5 #48231", hint: "", gridLine: "Unsorted" });
    expect(rowFacts(byId("e17"))).toMatchObject({ res: "−1.0R", resTone: "loss", plan: "Followed", when: "Fri 13 Nov, 15:40", mt5: "" });
    // Running: no "Open" beside the pair, the status says it; the setup reads as a normal fact.
    expect(rowFacts(byId("e24"))).toMatchObject({ res: "", gres: "Running", statusLabel: "Running", hint: "", facts2: true, gridLine: "Unsorted" });
    expect(rowFacts(byId("e24")).statusHint).toContain("Still open in MT5");
    // Analysis keeps the owner's own plan note.
    expect(rowFacts(byId("e26"))).toMatchObject({ statusLabel: "Before trading", hasAcct: false, gres: "", facts2: false });
    expect(rowFacts(byId("e26")).hint).toMatch(/^“Dollar weak into New York/);
    expect(rowFacts(byId("e15")).acct).toBe("Main account and Funded 100K");
    expect(rowFacts(byId("e27"))).toMatchObject({ gres: "Not filled", hint: "", statusHint: "Your order never triggered. Stays out of your results." });
  });
  it("short trade line", () => {
    expect(shortTradeLine({ ...byId("e19"), mt5: "#48240", r: -0.1 })).toBe("MT5 #48240 · −0.1R. Count it in your stats? If you leave this, it counts.");
  });
});
