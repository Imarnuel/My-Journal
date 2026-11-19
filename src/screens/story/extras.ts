// Per-story values the shared Entry type has no field for: the voice note's length and the time the
// trade closed. Keyed by entry id. (Asked for in the report as Entry fields.)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistOptions } from "../../data/persist";

type Extra = { voiceLen?: string; closeTime?: string };
type S = { byId: Record<string, Extra>; set: (id: string, x: Extra) => void };

export const useStoryExtras = create<S>()(
  persist(
    (set) => ({
      byId: {},
      set: (id, x) => set((s) => ({ byId: { ...s.byId, [id]: { ...s.byId[id], ...x } } })),
    }),
    { name: "journal:story-extras", ...persistOptions, partialize: (s) => ({ byId: s.byId }) },
  ),
);
