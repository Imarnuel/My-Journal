// Tags without admin work: a new tag's kind comes from its words; a journal starts with the starter tags.
import { describe, expect, it } from "vitest";
import { guessKind, missingStarters, STARTER_TAGS } from "./tagKind";

describe("guessKind", () => {
  it("mistakes, good habits and context", () => {
    for (const t of ["Revenge entry", "Chased the move", "FOMO", "Moved my stop", "Entered late", "Oversized", "Didn't wait for confirmation", "No confirmation", "Cut my winner"]) expect(guessKind(t), t).toBe("Mistake");
    for (const t of ["Waited for confirmation", "Patient", "Let it run", "Scaled out", "Clean entry", "Retest"]) expect(guessKind(t), t).toBe("Good");
    for (const t of ["Supply zone", "Break of structure", "News", "Asian range", "Trend continuation"]) expect(guessKind(t), t).toBe("Neutral");
  });
  it("the starter tags read as the kinds they were given", () => {
    for (const t of STARTER_TAGS) expect(guessKind(t.t), t.t).toBe(t.k);
  });
});

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
