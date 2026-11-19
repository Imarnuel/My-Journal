// Account details the shared Account type doesn't carry: when it was added and its MT5 login and server.
// Per-area state (docs/PORTING.md): kept here, keyed by account name, renamed along with the account.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistOptions } from "../../data/persist";

export type AccountMeta = { added?: string; server?: string; login?: string };

type S = {
  meta: Record<string, AccountMeta>;
  setMeta: (name: string, m: AccountMeta) => void;
  renameMeta: (from: string, to: string) => void;
};

/** From the Edit account frame (Funded 100K: added 2 October, FTMO-Demo2). */
const seed: Record<string, AccountMeta> = { "Funded 100K": { added: "2026-10-02", server: "FTMO-Demo2" } };

export const useAccountMeta = create<S>()(
  persist(
    (set) => ({
  meta: seed,
  setMeta: (name, m) => set((s) => ({ meta: { ...s.meta, [name]: { ...s.meta[name], ...m } } })),
  renameMeta: (from, to) =>
    set((s) => {
      if (from === to || !s.meta[from]) return s;
      const { [from]: m, ...rest } = s.meta;
      return { meta: { ...rest, [to]: m } };
    }),
    }),
    { name: "journal:account-meta", ...persistOptions, partialize: (s) => ({ meta: s.meta }) },
  ),
);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2 October" in the current year, "2 October 2025" otherwise. */
export function addedLabel(iso: string, today: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}${String(y) === today.slice(0, 4) ? "" : ` ${y}`}`;
}
