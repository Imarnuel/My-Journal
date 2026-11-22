// Seed data from handoff/data. "Today" on the canvas is Monday 16 November 2026.
import entriesJson from "../../handoff/data/entries.json";
import examplesJson from "../../handoff/data/playbook-examples.json";
import accountsJson from "../../handoff/data/accounts.json";
import tagsJson from "../../handoff/data/tags.json";
import weeksJson from "../../handoff/data/weeks.json";
import type { Account, Entry, Tag, Week } from "../lib/types";

export const TODAY = "2026-11-16";

type RawEntry = Omit<Entry, "chartKey" | "excluded" | "textbook">;
type RawExample = { id: string; c: string; tb: boolean }; // x in this file is the reflection text, not "excluded"

const ex = new Map((examplesJson as RawExample[]).map((e) => [e.id, e]));

/**
 * The very short trade on the Trade log canvas (prototype/Main.dc.html): "USDCHF closed 8 seconds after
 * opening". It isn't in entries.json; the owner made it a real trade (DESIGN.md › Very short trade), so it
 * counts until it's left out.
 */
export const SHORT_TRADE: Entry = {
  id: "mt5-48240",
  date: "2026-11-16",
  time: "15:42",
  pair: "USDCHF",
  dir: null,
  status: "Taken",
  account: "Main account",
  also: null,
  setup: "Unsorted",
  session: "New York",
  followed: null,
  tags: [],
  mistakes: [],
  r: -0.1,
  charts: 0,
  chartKey: null,
  note: false,
  refl: null,
  plan: null,
  mt5: "#48240",
  excluded: false,
  textbook: false,
  shortTrade: "ask",
};

/**
 * Stand-in "BOS" tags, so the look-alike prompt in Settings › Tags and mistakes acts on real tags (DESIGN.md ›
 * Sample BOS tag). Two older trades that don't already carry "Break of structure".
 */
export const SAMPLE_BOS_IDS = ["e42", "e49"];
export const SAMPLE_BOS_TAG: Tag = { t: "BOS", n: SAMPLE_BOS_IDS.length, k: "Good" };

/** The handoff's 134 entries exactly as drawn: unit tests check the screenshots' numbers against these. */
export const handoffEntries: Entry[] = (entriesJson as RawEntry[]).map((e) => {
  const x = ex.get(e.id);
  // Mistakes are their own field (DESIGN.md › Mistakes): the handoff kept them inside the tags too.
  return { ...e, tags: e.tags.filter((t) => !e.mistakes.includes(t)), chartKey: x?.c ?? null, excluded: false, textbook: !!x?.tb };
});

/** What the app starts with: the handoff's entries plus the owner-approved stand-ins above. */
export const seedEntries: Entry[] = [
  ...handoffEntries.map((e) => (SAMPLE_BOS_IDS.includes(e.id) ? { ...e, tags: [...e.tags, "BOS"] } : e)),
  SHORT_TRADE,
];

const sourceOf: Record<string, Account["source"]> = {
  "Main account": "mt5",
  "Funded 100K": "mt5",
  "Challenge 50K": "screenshots",
  "Demo account": "mt5-reconnect",
  Backtesting: "screenshots",
};

const typeOf: Record<string, string> = {
  "Main account": "Live",
  "Funded 100K": "Prop firm",
  "Challenge 50K": "Prop firm",
  "Demo account": "Demo",
  Backtesting: "Backtest",
};

export const seedAccounts: Account[] = [
  ...accountsJson.real.map((name) => ({ name, type: typeOf[name] ?? "Live", practice: false, archived: false, source: sourceOf[name] })),
  ...accountsJson.practice.map((name) => ({ name, type: typeOf[name] ?? "Demo", practice: true, archived: false, source: sourceOf[name] })),
  // Archived accounts only exist in the prototype (prototype/Accounts.dc.html).
  { name: "Challenge 25K", type: "Prop firm", practice: false, archived: true, source: "screenshots", archivedNote: "failed in September \u00b7 31 chart stories" },
  { name: "Funded 50K", type: "Prop firm", practice: false, archived: true, source: "screenshots", archivedNote: "reset in July \u00b7 22 chart stories" },
];

// accounts.json also names a "default for screenshots"; the owner removed that idea (DESIGN.md › Accounts).

/** The handoff's 13 tags as drawn. */
export const handoffTags: Tag[] = tagsJson.vocab_with_counts as Tag[];
export const seedTags: Tag[] = [...handoffTags, SAMPLE_BOS_TAG];

export const seedWeeks: Week[] = weeksJson as Week[];
