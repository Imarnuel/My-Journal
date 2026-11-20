import { describe, expect, it } from "vitest";
import raw from "../../handoff/data/entries.json";
import type { Entry } from "../lib/types";
import { fr } from "../lib/format";
import { rFromPrices } from "../lib/story";
import { sampleNumbers } from "./samplePrices";

const entries = ((Array.isArray(raw) ? raw : (raw as { entries: unknown[] }).entries) as Entry[]);

describe("sample prices (DESIGN.md, Sample prices)", () => {
  it("every taken sample trade gets prices that give exactly its recorded R", () => {
    const taken = entries.filter((e) => e.status === "Taken" && e.pair.indexOf(",") < 0);
    expect(taken.length).toBeGreaterThan(90);
    for (const e of taken) {
      const n = sampleNumbers(e);
      expect(n.entry && n.stop && n.target && n.exit && n.size, e.id).toBeTruthy();
      expect(fr(rFromPrices({ entry: n.entry!, stop: n.stop!, exit: n.exit! }, e.dir)!), e.id).toBe(fr(e.r!));
    }
  });
  it("puts the stop and target on the right side, and is the same every time", () => {
    for (const e of entries.filter((x) => x.dir && x.status !== "Analysis")) {
      const n = sampleNumbers(e);
      if (!n.entry) continue;
      const [entry, stop, target] = [n.entry, n.stop, n.target].map(Number);
      if (e.dir === "Long") expect(stop < entry && target > entry, e.id).toBe(true);
      else expect(stop > entry && target < entry, e.id).toBe(true);
      expect(sampleNumbers(e)).toEqual(n);
    }
  });
  it("watched and not-filled entries get a plan (entry, stop, target) but no exit or size", () => {
    const w = entries.find((e) => e.status === "Watched")!;
    expect(Object.keys(sampleNumbers(w)).sort()).toEqual(["entry", "stop", "target"]);
    const a = entries.find((e) => e.status === "Analysis")!;
    expect(sampleNumbers(a)).toEqual({});
  });
});
