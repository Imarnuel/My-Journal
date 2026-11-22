// One dataset for every screen (handoff/docs/01-decisions.md, "One dataset").
// Screens read from here and never keep their own copy of the numbers.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbStorage, persistOptions, toDataUrl } from "./persist";
import { sweepVoiceAudio } from "./voiceAudio";
import type { Account, Entry, Tag, TagKind, Week } from "../lib/types";
import { SAMPLE_BOS_IDS, SAMPLE_BOS_TAG, seedAccounts, seedEntries, seedTags, seedWeeks, SHORT_TRADE, TODAY } from "./seed";
import { fadeTheme } from "../components/primitives/motion";
import { localDate, REAL } from "../app/mode";

export type Appearance = "system" | "light" | "dark";

/**
 * Version of the saved journal data. 2 (2026-11-20): the very short USDCHF trade became a real entry and two
 * sample trades got the "BOS" tag (the owner's answers to open questions 4 and 6). 3 (2026-11-21): the voice
 * recordings kept until then are cleared once.
 */
const STORE_VERSION = 3;
type Saved = { entries?: Entry[]; tags?: Tag[] } & Record<string, unknown>;

/**
 * Bring data saved by an older version up to date without losing anything the owner changed: add what's
 * missing, never overwrite. The short trade keeps the answer saved by the old Trade log prompt, if any.
 */
export async function migrateData(saved: Saved, from: number): Promise<Saved> {
  // Version 3: the owner chose to keep only the written notes (2026-11-21), and asked for the recordings kept
  // until then to be cleared, once (DESIGN.md › Real app).
  if (from < 3) await sweepVoiceAudio(() => false);
  if (from >= 2 || !saved.entries) return saved;
  let entries = saved.entries;
  if (!entries.some((e) => e.id === SHORT_TRADE.id)) {
    let short: Entry = SHORT_TRADE;
    try {
      const old = await idbStorage.getItem("journal:tradelog");
      const answer = old ? (JSON.parse(old as string)?.state?.short as Partial<Entry> | undefined) : undefined;
      if (answer?.shortTrade) short = { ...short, shortTrade: answer.shortTrade, excluded: !!answer.excluded };
      await idbStorage.removeItem("journal:tradelog");
    } catch {
      /* keep the default: it counts and the prompt asks again */
    }
    entries = [...entries, short];
  }
  const tags = saved.tags ?? [];
  // Only when the owner hasn't already got a BOS tag of their own, or merged the drawn BOS prompt already.
  const merged = ((saved.settings as Record<string, unknown> | undefined)?.mergedLookalikes as string[] | undefined) ?? [];
  if (!tags.some((t) => t.t === SAMPLE_BOS_TAG.t) && !merged.some((k) => k.startsWith("BOS>"))) {
    entries = entries.map((e) => (SAMPLE_BOS_IDS.includes(e.id) && !e.tags.includes("BOS") ? { ...e, tags: [...e.tags, "BOS"] } : e));
    return { ...saved, entries, tags: [...tags, SAMPLE_BOS_TAG] };
  }
  return { ...saved, entries };
}

export type Rules = { Context: string[]; Entry: string[]; Exit: string[] };
export type Setup = { name: string; chart: string; rules: Rules; archived: boolean };

/** Setups on the canvas (prototype/PlaybookHome.dc.html). Screens fill in rules from their frames. */
const seedSetups: Setup[] = [
  { name: "4H supply pullback", chart: "sw0", rules: { Context: [], Entry: [], Exit: [] }, archived: false },
  { name: "London breakout", chart: "lw1", rules: { Context: [], Entry: [], Exit: [] }, archived: false },
  { name: "Asian range fade", chart: "sx2", rules: { Context: [], Entry: [], Exit: [] }, archived: false },
];

type State = {
  today: string;
  entries: Entry[];
  accounts: Account[];
  tags: Tag[];
  weeks: Week[];
  /** Accounts ticked in the account picker. Default: real (non-practice, non-archived) accounts. */
  picked: string[];
  appearance: Appearance;
  setups: Setup[];
  /** Set-once rules and preferences (Accounts rules, Settings). Keys are owned by the screen that sets them. */
  settings: Record<string, unknown>;
  setSetting: (key: string, value: unknown) => void;
  setSetups: (fn: (s: Setup[]) => Setup[]) => void;

  updateEntry: (id: string, patch: Partial<Entry>) => void;
  addEntry: (e: Entry) => void;
  removeEntry: (id: string) => void;
  restoreEntry: (e: Entry, index: number) => void;
  setPicked: (names: string[]) => void;
  resetPicked: () => void;
  updateAccount: (name: string, patch: Partial<Account>) => void;
  addAccount: (a: Account) => void;
  removeAccount: (name: string) => void;
  restoreAccount: (a: Account, index: number) => void;
  setTakeaway: (monday: string, text: string) => void;
  setTags: (tags: Tag[]) => void;
  tagKind: (t: string) => TagKind | undefined;
  setAppearance: (a: Appearance) => void;
};

export const realAccounts = (accounts: Account[]) => accounts.filter((a) => !a.practice && !a.archived).map((a) => a.name);

function applyTheme(a: Appearance) {
  try {
    localStorage.setItem("appearance", a);
  } catch {
    /* storage unavailable: theme still applies for this visit */
  }
  const dark = a === "dark" || (a === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

function initialAppearance(): Appearance {
  try {
    const q = new URLSearchParams(location.search).get("theme");
    const v = (q || localStorage.getItem("appearance") || "light") as Appearance;
    return v === "dark" || v === "system" ? v : "light";
  } catch {
    return "light";
  }
}

export const useStore = create<State>()(
  persist(
  (set, get) => ({
  // The real journal starts empty on today's date; the sample one is frozen on the canvas's Monday.
  today: REAL ? localDate() : TODAY,
  entries: REAL ? [] : seedEntries,
  accounts: REAL ? [] : seedAccounts,
  tags: REAL ? [] : seedTags,
  weeks: REAL ? [] : seedWeeks,
  picked: REAL ? [] : realAccounts(seedAccounts),
  appearance: typeof window === "undefined" ? "light" : initialAppearance(),
  setups: REAL ? [] : seedSetups,
  settings: {},
  setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
  setSetups: (fn) => set((s) => ({ setups: fn(s.setups) })),

  updateEntry: (id, patch) => set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
  addEntry: (e) => set((s) => ({ entries: [e, ...s.entries] })),
  removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
  restoreEntry: (e, index) =>
    set((s) => {
      const next = [...s.entries];
      next.splice(Math.min(index, next.length), 0, e);
      return { entries: next };
    }),
  setPicked: (names) => set({ picked: names.length ? names : get().picked }),
  resetPicked: () => set((s) => ({ picked: realAccounts(s.accounts) })),
  updateAccount: (name, patch) =>
    set((s) => {
      const accounts = s.accounts.map((a) => (a.name === name ? { ...a, ...patch } : a));
      const renamed = patch.name && patch.name !== name;
      return {
        accounts,
        entries: renamed ? s.entries.map((e) => (e.account === name ? { ...e, account: patch.name! } : e)) : s.entries,
        picked: renamed ? s.picked.map((p) => (p === name ? patch.name! : p)) : s.picked,
      };
    }),
  // A new real account joins the picked accounts, so its trades count at once (practice ones stay out).
  addAccount: (a) => set((s) => ({ accounts: [...s.accounts, a], picked: a.practice || a.archived || s.picked.includes(a.name) ? s.picked : [...s.picked, a.name] })),
  removeAccount: (name) => set((s) => ({ accounts: s.accounts.filter((a) => a.name !== name), picked: s.picked.filter((p) => p !== name) })),
  restoreAccount: (a, index) =>
    set((s) => {
      const next = [...s.accounts];
      next.splice(Math.min(index, next.length), 0, a);
      return { accounts: next };
    }),
  setTakeaway: (monday, text) =>
    set((s) => {
      const has = s.weeks.some((w) => w.monday === monday);
      const weeks = has
        ? s.weeks.map((w) => (w.monday === monday ? { ...w, takeaway: text || null } : w))
        : [{ monday, takeaway: text || null, watched: 0, not_filled: 0 }, ...s.weeks];
      return { weeks };
    }),
  setTags: (tags) => set({ tags }),
  tagKind: (t) => get().tags.find((x) => x.t === t)?.k,
  setAppearance: (a) => {
    fadeTheme(() => applyTheme(a));
    set({ appearance: a });
  },
}),
  {
    name: "journal:data",
    ...persistOptions,
    version: STORE_VERSION,
    migrate: (saved, from) => migrateData(saved as Saved, from),
    // Only the data is saved; actions are recreated, and Appearance has its own key (read before first paint).
    partialize: (s) => ({ entries: s.entries, accounts: s.accounts, tags: s.tags, weeks: s.weeks, picked: s.picked, setups: s.setups, settings: s.settings }),
  },
  ),
);

// Uploaded charts start as blob: URLs, which die with the page. Turn them into data URLs so they are saved
// with their entry (only the URLs this visit created; everything else is left alone).
const converted = new Map<string, string>();
const converting = new Set<string>();
/** The same chart before and after it is saved (its blob: URL becomes a data URL). */
export const chartKey = (url: string) => converted.get(url) ?? url;
useStore.subscribe((s, prev) => {
  if (s.entries === prev.entries) return;
  for (const e of s.entries) {
    for (const url of e.chartList ?? []) {
      if (!url.startsWith("blob:") || converting.has(url)) continue;
      converting.add(url);
      toDataUrl(url).then((data) => {
        converting.delete(url);
        if (data === url) return;
        converted.set(url, data);
        const st = useStore.getState();
        for (const x of st.entries)
          if (x.chartList?.includes(url)) st.updateEntry(x.id, { chartList: x.chartList.map((u) => converted.get(u) ?? u) });
      });
    }
  }
});

