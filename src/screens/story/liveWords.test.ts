import { describe, expect, it } from "vitest";
import { heardText, sampleHeard, sampleLevel, speechLocale } from "./liveWords";

describe("live words (DESIGN.md › Voice note: recording)", () => {
  it("the sample speaker is quiet for the first two seconds, then talks", () => {
    expect(sampleHeard(1500)).toEqual({ final: [], partial: "" });
    expect(sampleLevel(1500)).toBe(0);
    const h = sampleHeard(6000);
    expect(heardText(h).startsWith("Short from last week's")).toBe(true);
    expect(h.partial.length).toBeGreaterThan(0); // the last few words are still being worked out
  });
  it("settles every phrase once the speaker is done", () => {
    const h = sampleHeard(60_000);
    expect(h.partial).toBe("");
    expect(h.final.at(-1)).toBe("Worth repeating.");
    expect(sampleLevel(60_000)).toBe(0);
  });
  it("words only ever grow while talking", () => {
    let prev = "";
    for (let ms = 0; ms < 20_000; ms += 250) {
      const t = heardText(sampleHeard(ms));
      expect(t.startsWith(prev.split(" ").slice(0, -3).join(" "))).toBe(true);
      prev = t;
    }
  });
  it("uses the voice note language as the speech locale", () => {
    expect(speechLocale("French").startsWith("fr")).toBe(true);
    expect(speechLocale("Arabic").startsWith("ar")).toBe(true);
    expect(speechLocale("Klingon")).toBe("en-US");
  });
});
