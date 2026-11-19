// One dataset for every screen (handoff/docs/01-decisions.md, "One dataset").
// Screens read from here and never keep their own copy of the numbers.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistOptions, toDataUrl } from "./persist";
import type { Account, Entry, Tag, TagKind, Week } from "../lib/types";
import { seedAccounts, seedEntries, seedTags, seedWeeks, TODAY } from "./seed";
import { fadeTheme } from "../components/primitives/motion";

export type Appearance = "system" | "light" | "dark";

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
  today: TODAY,
  entries: seedEntries,
  accounts: seedAccounts,
  tags: seedTags,
  weeks: seedWeeks,
  picked: realAccounts(seedAccounts),
  appearance: typeof window === "undefined" ? "light" : initialAppearance(),
  setups: seedSetups,
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
  addAccount: (a) => set((s) => ({ accounts: [...s.accounts, a] })),
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
    // Only the data is saved; actions are recreated, and Appearance has its own key (read before first paint).
    partialize: (s) => ({ entries: s.entries, accounts: s.accounts, tags: s.tags, weeks: s.weeks, picked: s.picked, setups: s.setups, settings: s.settings }),
  },
  ),
);

// Uploaded charts start as blob: URLs, which die with the page. Turn them into data URLs so they are saved
// with their entry (only the URLs this visit created; everything else is left alone).
const converted = new Map<string, string>();
const converting = new Set<string>();
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

