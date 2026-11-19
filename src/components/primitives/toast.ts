// One toast at a time, bottom centre, 6 seconds, optional Undo (behaviour kit in 01-decisions.md).
import { create } from "zustand";

type Toast = { id: number; msg: string; undo: (() => void) | null };
type S = { toast: Toast | null; show: (msg: string, undo?: () => void) => void; dismiss: () => void; runUndo: () => void };

let timer: ReturnType<typeof setTimeout> | undefined;
let seq = 0;

export const useToast = create<S>((set, get) => ({
  toast: null,
  show: (msg, undo) => {
    clearTimeout(timer);
    set({ toast: { id: ++seq, msg, undo: undo ?? null } });
    timer = setTimeout(() => set({ toast: null }), 6000);
  },
  dismiss: () => {
    clearTimeout(timer);
    set({ toast: null });
  },
  runUndo: () => {
    const t = get().toast;
    clearTimeout(timer);
    set({ toast: null });
    t?.undo?.();
  },
}));

/** Show a toast. Pass `undo` for destructive or hiding actions. */
export const toast = (msg: string, undo?: () => void) => useToast.getState().show(msg, undo);
