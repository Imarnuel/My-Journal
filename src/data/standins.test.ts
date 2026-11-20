// The owner-approved stand-ins on top of the handoff data (DESIGN.md › Very short trade, Sample BOS tag),
// and the upgrade that adds them to journals saved before they existed.
import { describe, expect, it } from "vitest";
import { handoffEntries, handoffTags, SAMPLE_BOS_IDS, seedEntries, seedTags, SHORT_TRADE } from "./seed";
import { migrateData } from "./store";
import { noChartTrades } from "../lib/dashboard";
import { findLookalikes, mergeTags, retagEntries } from "../screens/settings/tags";

describe("very short trade", () => {
  it("is a real entry that counts until it's left out", () => {
    expect(handoffEntries).toHaveLength(134);
    expect(seedEntries).toHaveLength(135);
    const e = seedEntries.find((x) => x.id === SHORT_TRADE.id)!;
    expect(e).toMatchObject({ pair: "USDCHF", r: -0.1, status: "Taken", shortTrade: "ask", excluded: false });
  });
  it("isn't the trade the Dashboard asks charts for", () => {
    expect(noChartTrades(seedEntries).map((e) => e.pair)).toEqual(["EURUSD"]);
  });
});

describe("sample BOS tag", () => {
  it("sits on two trades, and its count is theirs", () => {
    const withBos = seedEntries.filter((e) => e.tags.includes("BOS")).map((e) => e.id);
    expect(withBos).toEqual(SAMPLE_BOS_IDS);
    expect(seedTags.find((t) => t.t === "BOS")?.n).toBe(2);
    expect(seedEntries.filter((e) => e.tags.includes("Break of structure") && e.tags.includes("BOS"))).toHaveLength(0);
  });
  it("is found as a look-alike of Break of structure, and merging gives 20", () => {
    expect(findLookalikes(seedTags.map((t) => t.t))).toEqual([{ from: "BOS", into: "Break of structure" }]);
    expect(mergeTags(seedTags, "BOS", "Break of structure").find((t) => t.t === "Break of structure")?.n).toBe(20);
    expect(retagEntries(seedEntries, "BOS", "Break of structure").patches).toHaveLength(2);
  });
});

describe("upgrading a journal saved before the stand-ins", () => {
  const old = () => ({ entries: handoffEntries.map((e) => (e.id === "e42" ? { ...e, refl: "Mine." } : e)), tags: handoffTags, settings: {} });

  it("adds the short trade and the BOS tags, keeping the owner's edits", async () => {
    const up = await migrateData(old(), 1);
    expect(up.entries).toHaveLength(135);
    expect(up.entries!.find((e) => e.id === "e42")).toMatchObject({ refl: "Mine.", tags: expect.arrayContaining(["BOS"]) });
    expect(up.tags!.filter((t) => t.t === "BOS")).toHaveLength(1);
  });
  it("adds nothing twice, and leaves BOS alone once the drawn prompt was merged", async () => {
    const twice = await migrateData(await migrateData(old(), 1), 1);
    expect(twice.entries).toHaveLength(135);
    expect(twice.entries!.find((e) => e.id === "e42")!.tags.filter((t) => t === "BOS")).toHaveLength(1);
    const merged = await migrateData({ ...old(), settings: { mergedLookalikes: ["BOS>Break of structure"] } }, 1);
    expect(merged.tags!.some((t) => t.t === "BOS")).toBe(false);
  });
  it("leaves data from this version as it is", async () => {
    const now = { entries: [], tags: [] };
    expect(await migrateData(now, 2)).toBe(now);
  });
});
