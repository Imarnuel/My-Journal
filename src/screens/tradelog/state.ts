// Trade log state that lives beyond one visit to the screen (in memory): filters, sort and how many
// entries are shown, so going into a story and back keeps your place. The very short trade is a real entry
// now (SHORT_TRADE in src/data/seed.ts); its answer is saved with it.
import { create } from "zustand";
import { SHORT_TRADE } from "../../data/seed";
import { BATCH, NO_FILTERS, type Filters, type Sort } from "../../lib/tradelog";

/** Seconds between open and close, per short trade (the shared Entry has no duration field). */
export const SHORT_SECONDS: Record<string, number> = { [SHORT_TRADE.id]: 8 };

type S = {
  filters: Filters;
  sort: Sort;
  limit: number;
  setFilters: (f: Filters) => void;
  setSort: (s: Sort) => void;
  setLimit: (n: number) => void;
};

export const useTradeLog = create<S>()((set) => ({
  filters: NO_FILTERS,
  sort: "Newest first",
  limit: BATCH,
  setFilters: (filters) => set({ filters, limit: BATCH }),
  setSort: (sort) => set({ sort }),
  setLimit: (limit) => set({ limit }),
}));
