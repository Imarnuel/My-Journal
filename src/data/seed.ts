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

export const seedEntries: Entry[] = (entriesJson as RawEntry[]).map((e) => {
  const x = ex.get(e.id);
  return { ...e, chartKey: x?.c ?? null, excluded: false, textbook: !!x?.tb };
});

const typeOf: Record<string, string> = {
  "Main account": "Live",
  "Funded 100K": "Prop firm",
  "Challenge 50K": "Prop firm",
  "Demo account": "Demo",
  Backtesting: "Backtest",
};

export const seedAccounts: Account[] = [
  ...accountsJson.real.map((name) => ({ name, type: typeOf[name] ?? "Live", practice: false, archived: false })),
  ...accountsJson.practice.map((name) => ({ name, type: typeOf[name] ?? "Demo", practice: true, archived: false })),
  // Archived accounts only exist in the prototype (prototype/Accounts.dc.html).
  { name: "Challenge 25K", type: "Prop firm", practice: false, archived: true },
  { name: "Funded 50K", type: "Prop firm", practice: false, archived: true },
];

export const defaultScreenshotAccount = accountsJson.default_for_screenshots;

export const seedTags: Tag[] = tagsJson.vocab_with_counts as Tag[];

export const seedWeeks: Week[] = weeksJson as Week[];
