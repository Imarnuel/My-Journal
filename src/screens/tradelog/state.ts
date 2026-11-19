// Trade log state that lives beyond one visit to the screen (in memory): filters, sort and how many
// entries are shown, so going into a story and back keeps your place. Plus the canvas's very short trade.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistOptions } from "../../data/persist";
import type { Entry } from "../../lib/types";
import { BATCH, NO_FILTERS, type Filters, type Sort } from "../../lib/tradelog";

/**
 * The very short trade on the canvas (prototype/Main.dc.html): "USDCHF closed 8 seconds after opening".
 * It is not one of the 134 sample entries (the entry count stays 134 before and after answering), so it is
 * kept here as an Entry with `shortTrade: "ask"` rather than added to the shared dataset.
 */
export const SAMPLE_SHORT: Entry = {
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
/** Seconds between open and close, per short trade (the shared Entry has no duration field). */
export const SHORT_SECONDS: Record<string, number> = { [SAMPLE_SHORT.id]: 8 };

type S = {
  filters: Filters;
  sort: Sort;
  limit: number;
  short: Entry;
  setFilters: (f: Filters) => void;
  setSort: (s: Sort) => void;
  setLimit: (n: number) => void;
  setShort: (patch: Partial<Entry>) => void;
};

export const useTradeLog = create<S>()(
  persist(
    (set) => ({
  filters: NO_FILTERS,
  sort: "Newest first",
  limit: BATCH,
  short: SAMPLE_SHORT,
  setFilters: (filters) => set({ filters, limit: BATCH }),
  setSort: (sort) => set({ sort }),
  setLimit: (limit) => set({ limit }),
  setShort: (patch) => set((s) => ({ short: { ...s.short, ...patch } })),
}),
    // Filters and place in the list are for the visit; the answer to the short-trade prompt is saved.
    { name: "journal:tradelog", ...persistOptions, partialize: (s) => ({ short: s.short }) },
  ),
);
