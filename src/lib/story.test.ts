import { describe, expect, it } from "vitest";
import type { Entry } from "./types";
import {
  applyVoiceNote,
  clock,
  entryFromStory,
  entryPatch,
  linkedAnalysis,
  moveItem,
  nextId,
  parseR,
  placeholderCharts,
  sessionOf,
  storyFromEntry,
  tagSuggestions,
  voiceToast,
  outcomeChoices,
  outcomePatch,
  type Story,
} from "./story";
import { readVoiceNote, transcriptRuns, type VoiceNoteFill } from "./voiceNote";

const base: Entry = {
  id: "e1", date: "2026-11-16", time: "09:45", pair: "GBPUSD", dir: "Short", status: "Taken", account: "Funded 100K", also: null,
  setup: "4H supply pullback", session: "London", followed: true, tags: ["Retest"], mistakes: [], r: 2.1, charts: 3, chartKey: "sw2",
  note: false, refl: null, plan: null, mt5: null, excluded: false, textbook: false,
};

const fill: VoiceNoteFill = {
  ok: true, length: "0:24", transcript: "said", before: "B", refl: "R", suggested: true, setup: "4H supply pullback",
  tags: [{ t: "Supply zone", k: "Good" }, { t: "Retest", k: "Good" }], followed: true, headspace: "Calm",
};

const empty = (): Story => ({ ...storyFromEntry({ ...base, setup: "Unsorted", followed: null, tags: [] }, undefined), before: "", refl: "" });

describe("story rules", () => {
  it("the session follows the time", () => {
    expect(sessionOf("06:59")).toBe("Asia");
    expect(sessionOf("07:00")).toBe("London");
    expect(sessionOf("12:59")).toBe("London");
    expect(sessionOf("13:00")).toBe("New York");
  });

  it("with the owner's session times, the session open at that time; overlaps go to the newer one", () => {
    const S: [string, string, string][] = [["Asia", "01:00", "10:00"], ["London", "09:00", "17:30"], ["New York", "14:00", "23:00"]];
    expect(sessionOf("07:30", S)).toBe("Asia");
    expect(sessionOf("09:45", S)).toBe("London");
    expect(sessionOf("15:00", S)).toBe("New York");
    expect(sessionOf("17:45", S)).toBe("New York");
    expect(sessionOf("23:30", S)).toBe("New York"); // outside every session: fixed hours
    expect(sessionOf("02:00", [["Asia", "23:00", "08:00"]])).toBe("Asia"); // a session across midnight
  });

  it("reads typed results with a real minus, plain numbers or R", () => {
    expect(parseR("+2.1R")).toBe(2.1);
    expect(parseR("−1.0R")).toBe(-1);
    expect(parseR("-0.5")).toBe(-0.5);
    expect(parseR(" 3 ")).toBe(3);
    expect(parseR("")).toBeNull();
    expect(parseR("abc")).toBeNull();
  });

  it("formats the timer as m:ss", () => {
    expect(clock(0)).toBe("0:00");
    expect(clock(24)).toBe("0:24");
    expect(clock(75)).toBe("1:15");
  });

  it("moves charts and keeps the rest in order", () => {
    expect(moveItem(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(["a", "b", "c"], 2, 1)).toEqual(["a", "c", "b"]);
  });

  it("gives sample entries placeholder charts ending with their chart key", () => {
    expect(placeholderCharts(base)).toEqual(["sw0", "sw1", "sw2"]);
    expect(placeholderCharts({ ...base, charts: 0 })).toEqual([]);
    expect(placeholderCharts({ ...base, charts: 1, chartKey: null, dir: "Long", r: -1 })).toEqual(["lx0"]);
  });

  it("a voice note fills only what is empty and lists it", () => {
    const { patch, filled, newKinds } = applyVoiceNote(empty(), fill);
    expect(patch).toMatchObject({ before: "B", refl: "R", suggested: true, setup: "4H supply pullback", tags: ["Supply zone", "Retest"], followed: true, headspace: "Calm", voice: true });
    expect(filled).toEqual(["setup", "2 tags", "plan", "headspace"]);
    expect(voiceToast(filled)).toBe("Setup, 2 tags, plan and headspace filled from your note");
    expect(newKinds).toEqual({ "Supply zone": "Good", Retest: "Good" });
  });

  it("a voice note puts mistakes in Mistakes and the rest in Tags (DESIGN.md › Mistakes)", () => {
    const withMistakes = { ...fill, tags: [{ t: "Retest", k: "Good" as const }, { t: "Moved stop", k: "Mistake" as const }] };
    const { patch, filled } = applyVoiceNote({ ...empty(), mistakes: ["FOMO"] }, withMistakes);
    expect(patch.tags).toEqual(["Retest"]);
    expect(patch.mistakes).toEqual(["FOMO", "Moved stop"]);
    expect(voiceToast(filled)).toBe("Setup, 1 tag, 1 mistake, plan and headspace filled from your note");
  });

  it("a voice note never overwrites a choice made by hand", () => {
    const s = { ...empty(), before: "mine", setup: "London breakout", tags: ["retest"], followed: false, headspace: "Tired" };
    const { patch, filled } = applyVoiceNote(s, fill);
    expect(patch.before).toBeUndefined();
    expect(patch.setup).toBeUndefined();
    expect(patch.followed).toBeUndefined();
    expect(patch.headspace).toBeUndefined();
    expect(patch.tags).toEqual(["retest", "Supply zone"]);
    expect(filled).toEqual(["1 tag"]);
    const all = applyVoiceNote({ ...s, refl: "x", tags: ["Supply zone", "Retest"] }, fill);
    expect(voiceToast(all.filled)).toBe("Both notes filled from your voice note");
  });

  it("tag autocomplete: most used first, excludes tags already on the story, offers a new tag", () => {
    const vocab = [{ t: "Break of structure", n: 18, k: "Good" as const }, { t: "Supply zone", n: 7, k: "Good" as const }, { t: "Retest", n: 7, k: "Good" as const }];
    expect(tagSuggestions(vocab, ["Retest"], "").sug.map((v) => v.t)).toEqual(["Break of structure", "Supply zone"]);
    expect(tagSuggestions(vocab, [], "sup").sug.map((v) => v.t)).toEqual(["Supply zone"]);
    expect(tagSuggestions(vocab, [], "supply zone").canAdd).toBe(false);
    expect(tagSuggestions(vocab, [], "revenge").canAdd).toBe(true);
    expect(tagSuggestions(vocab, ["Break of structure", "Supply zone", "Retest"], "").none).toBe(true);
  });

  it("links the latest analysis earlier that day covering the pair", () => {
    const a: Entry = { ...base, id: "a", status: "Analysis", dir: null, time: "07:30", pair: "GBPUSD, XAUUSD", plan: "p" };
    const late: Entry = { ...a, id: "b", time: "10:00" };
    const other: Entry = { ...a, id: "c", pair: "EURUSD" };
    expect(linkedAnalysis([a, late, other], base)?.id).toBe("a");
    expect(linkedAnalysis([a], { ...base, date: "2026-11-17" })).toBeNull();
  });

  it("the overlay applies until the story is first edited, then the entry keeps its own values", () => {
    const overlay = { before: "Canvas note", refl: "Canvas reflection", headspace: "Calm", chartList: ["gW", "gA"], numbers: { entry: "1.2" } };
    const s = storyFromEntry(base, overlay);
    expect([s.before, s.refl, s.headspace, s.charts, s.numbers.entry]).toEqual(["Canvas note", "Canvas reflection", "Calm", ["gW", "gA"], "1.2"]);
    const patch = entryPatch(base, s, { refl: "" });
    expect(patch).toMatchObject({ before: "Canvas note", refl: null, headspace: "Calm", chartList: ["gW", "gA"] });
    const after = storyFromEntry({ ...base, ...patch }, overlay);
    expect(after.refl).toBe("");
    expect(after.before).toBe("Canvas note");
  });

  it("tags and mistakes are saved as two lists (DESIGN.md › Mistakes)", () => {
    const s = storyFromEntry({ ...base, before: "" }, undefined);
    const p = entryPatch({ ...base, before: "" }, s, { tags: ["Retest"], mistakes: ["Moved stop"] });
    expect(p).toEqual({ tags: ["Retest"], mistakes: ["Moved stop"] });
    // Older data kept mistakes inside the tags too: they show only in Mistakes.
    expect(storyFromEntry({ ...base, tags: ["Retest", "Moved stop"], mistakes: ["Moved stop"] }, undefined)).toMatchObject({ tags: ["Retest"], mistakes: ["Moved stop"] });
  });

  it("a saved new story becomes an entry with the next id", () => {
    expect(nextId([{ id: "e9" }, { id: "e134" }, { id: "e20" }])).toBe("e135");
    const e = entryFromStory("e135", { ...empty(), charts: ["gW", "gE"], tags: [], mistakes: ["Moved stop"] });
    expect(e).toMatchObject({ id: "e135", setup: "Unsorted", charts: 2, chartList: ["gW", "gE"], mistakes: ["Moved stop"], chartKey: "sw0" });
  });
});

describe("voice note (simulated pipeline)", () => {
  it("returns notes and details to fill", async () => {
    const r = await readVoiceNote(24);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tags.map((t) => t.t)).toEqual(["Supply zone", "Break of structure", "Retest"]);
  });

  it("splits the transcript into highlighted runs", () => {
    expect(transcriptRuns("I took the [[retest]]. Felt [[calm]].")).toEqual([
      { text: "I took the ", mark: false },
      { text: "retest", mark: true },
      { text: ". Felt ", mark: false },
      { text: "calm", mark: true },
      { text: ".", mark: false },
    ]);
  });
});

describe("result from the prices (DESIGN.md, Editing numbers)", () => {
  it("works out R the same way for a short and a long", async () => {
    const { rFromPrices } = await import("./story");
    // The canvas trade: short 1.26840, stop 1.27010, exit 1.26482 is +2.1R.
    expect(rFromPrices({ entry: "1.26840", stop: "1.27010", exit: "1.26482" }, "Short")).toBe(2.1059);
    // Kept precise, so it is rounded once for display: 5.345 shows as +5.3R, not +5.4R (the owner's GBPJPY target).
    expect(rFromPrices({ entry: "210.443", stop: "210.695", exit: "209.096" }, "Short")).toBe(5.3452);
    expect(rFromPrices({ entry: "1.1000", stop: "1.0950", exit: "1.1100" }, "Long")).toBe(2);
    expect(rFromPrices({ entry: "1.1000", stop: "1.0950", exit: "1.0950" }, "Long")).toBe(-1);
    expect(rFromPrices({ entry: "1.1000", stop: "1.0950", exit: "1.1000" }, "Long")).toBe(0);
  });
  it("accepts a decimal comma and gives nothing for a missing price, no risk or a stop on the wrong side", async () => {
    const { rFromPrices, parsePrice } = await import("./story");
    expect(parsePrice("1,26840")).toBe(1.2684);
    expect(parsePrice("0.50 lots")).toBeNull();
    expect(rFromPrices({ entry: "1.1", stop: "", exit: "1.2" }, "Long")).toBeNull();
    expect(rFromPrices({ entry: "1.1", stop: "1.1", exit: "1.2" }, "Long")).toBeNull();
    expect(rFromPrices({ entry: "1.1", stop: "1.2", exit: "1.0" }, "Long")).toBeNull();
    expect(rFromPrices({ entry: "1.1", stop: "1.2", exit: "1.0" }, null)).toBe(1);
  });
});

describe("how did it end? (DESIGN.md › Result)", () => {
  // The owner's GBPJPY short: entry 210.443, stop 210.695, target 209.096.
  const gj = (): Story => ({ ...empty(), dir: "Short", r: null, numbers: { entry: "210.443", stop: "210.695", target: "209.096", exit: "", size: "" } });
  it("target, stop and breakeven, each with its R, only while there is no result", () => {
    expect(outcomeChoices(gj()).map((o) => [o.key, o.exit, o.r])).toEqual([["target", "209.096", 5.3452], ["stop", "210.695", -1], ["breakeven", "210.443", 0]]);
    expect(outcomeChoices({ ...gj(), r: 1.2 })).toEqual([]);
    expect(outcomeChoices({ ...gj(), status: "Watched" })).toEqual([]);
    expect(outcomeChoices({ ...gj(), numbers: { ...gj().numbers, target: "" } }).map((o) => o.key)).toEqual(["stop", "breakeven"]);
    expect(outcomeChoices({ ...gj(), numbers: { ...gj().numbers, stop: "" } })).toEqual([]);
  });
  it("one tap fills Exit, and the result follows the prices", () => {
    expect(outcomePatch(gj(), "target")).toEqual({ numbers: { ...gj().numbers, exit: "209.096" }, r: 5.3452, rByHand: false });
  });
  it("a voice note that says how it ended fills the result, only while Exit is empty", () => {
    const { patch, filled } = applyVoiceNote(gj(), { ...fill, outcome: "stop" });
    expect(patch).toMatchObject({ r: -1, numbers: { exit: "210.695" } });
    expect(filled).toContain("result");
    const typed = { ...gj(), numbers: { ...gj().numbers, exit: "210.100" } };
    expect(applyVoiceNote(typed, { ...fill, outcome: "target" }).patch.numbers).toBeUndefined();
  });
});
