import { describe, expect, it } from "vitest";
import { handoffEntries, handoffTags } from "../../data/seed";
import type { Entry } from "../../lib/types";
import { findLookalikes, mergeTags, renameTag, retagEntries, tagMix, usedLabel, validRename } from "./tags";

const entry = (id: string, tags: string[], mistakes: string[] = []) => ({ id, tags, mistakes }) as unknown as Entry;

describe("Settings tags", () => {
  it("kind breakdown matches the frame with the sample tags", () => {
    expect(handoffTags).toHaveLength(13);
    expect(tagMix(handoffTags)).toBe("7 good · 3 mistakes · 3 neutral");
    expect(tagMix([{ t: "a", n: 1, k: "Mistake" }])).toBe("0 good · 1 mistake · 0 neutral");
  });

  it("use count label", () => {
    expect(usedLabel(1)).toBe("used 1 time");
    expect(usedLabel(18)).toBe("used 18 times");
  });

  it("retags only the entries that carry the tag, in tags and mistakes, without duplicates", () => {
    const es = [entry("a", ["BOS", "Retest"]), entry("b", ["Retest"]), entry("c", ["BOS", "Break of structure"]), entry("d", ["Chased entry"], ["Chased entry"])];
    const { patches, before } = retagEntries(es, "BOS", "Break of structure");
    expect(patches).toEqual([
      { id: "a", tags: ["Break of structure", "Retest"], mistakes: [] },
      { id: "c", tags: ["Break of structure"], mistakes: [] },
    ]);
    expect(before.map((b) => b.id)).toEqual(["a", "c"]);
    const rm = retagEntries(es, "Chased entry", null);
    expect(rm.patches).toEqual([{ id: "d", tags: [], mistakes: [] }]);
  });

  it("sample data: Break of structure is on 18 entries", () => {
    expect(retagEntries(handoffEntries, "Break of structure", "x").patches).toHaveLength(18);
  });

  it("rename keeps a unique, non-empty name", () => {
    expect(validRename(handoffTags, "Retest", "Retest of zone")).toBe(true);
    expect(validRename(handoffTags, "Retest", "  ")).toBe(false);
    expect(validRename(handoffTags, "Retest", "supply zone")).toBe(false);
    expect(renameTag(handoffTags, "Retest", " Retest of zone ").find((t) => t.n === 7 && t.t.startsWith("Retest"))?.t).toBe("Retest of zone");
  });

  it("merge keeps one tag with both counts", () => {
    const m = mergeTags([{ t: "BOS", n: 2, k: "Good" }, { t: "Break of structure", n: 18, k: "Good" }], "BOS", "Break of structure");
    expect(m).toEqual([{ t: "Break of structure", n: 20, k: "Good" }]);
  });

  it("look-alikes: abbreviations and spelling variants, none in the sample tags", () => {
    expect(findLookalikes(["Break of structure", "BOS", "Retest"])).toEqual([{ from: "BOS", into: "Break of structure" }]);
    expect(findLookalikes(["Supply zones", "supply zone"])).toEqual([{ from: "supply zone", into: "Supply zones" }]);
    expect(findLookalikes(handoffTags.map((t) => t.t))).toEqual([]);
  });
});
