// A journal starts with the starter tags and mistakes, and an older journal gets the ones it lacks.
import { describe, expect, it } from "vitest";
import { missingStarters, STARTER_TAGS } from "./tagKind";

describe("starter tags", () => {
  it("twelve, mostly mistakes, none about sessions or plan adherence", () => {
    expect(STARTER_TAGS).toHaveLength(12);
    expect(STARTER_TAGS.filter((t) => t.k === "Mistake")).toHaveLength(6);
    expect(STARTER_TAGS.every((t) => !/session|london|asia|new york|plan|rules/i.test(t.t))).toBe(true);
  });
  it("a journal gets only the ones it doesn't have, its own untouched", () => {
    const own = [{ t: "moved stop", n: 4, k: "Mistake" as const }, { t: "Supply zone", n: 2, k: "Neutral" as const }];
    const add = missingStarters(own);
    expect(add).toHaveLength(11);
    expect(add.some((t) => t.t === "Moved stop")).toBe(false);
  });
});
