// Per-story values the shared Entry type has no field for: the voice note's length and the time the
// trade closed. Keyed by entry id. (Asked for in the report as Entry fields.)
import { create } from "zustand";

type Extra = { voiceLen?: string; closeTime?: string };
type S = { byId: Record<string, Extra>; set: (id: string, x: Extra) => void };

export const useStoryExtras = create<S>((set) => ({
  byId: {},
  set: (id, x) => set((s) => ({ byId: { ...s.byId, [id]: { ...s.byId[id], ...x } } })),
}));
