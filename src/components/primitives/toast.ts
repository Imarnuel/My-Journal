// One toast at a time, bottom right, 6 seconds, optional Undo (behaviour kit in 01-decisions.md; position and
// icon per DESIGN.md, Toasts). The kind picks the icon, so the toast says what happened at a glance.
import { create } from "zustand";

export type ToastKind = "done" | "deleted" | "hidden" | "restored" | "added" | "moved" | "voice" | "archived" | "edited";
type Toast = { id: number; msg: string; undo: (() => void) | null; kind: ToastKind };
type S = { toast: Toast | null; show: (msg: string, undo?: () => void, kind?: ToastKind) => void; dismiss: () => void; runUndo: () => void };

let timer: ReturnType<typeof setTimeout> | undefined;
let seq = 0;

export const useToast = create<S>((set, get) => ({
  toast: null,
  show: (msg, undo, kind = "done") => {
    clearTimeout(timer);
    set({ toast: { id: ++seq, msg, undo: undo ?? null, kind } });
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

/** Show a toast. Pass `undo` for destructive or hiding actions, and the kind for its icon. */
export const toast = (msg: string, undo?: () => void, kind?: ToastKind) => useToast.getState().show(msg, undo, kind);
