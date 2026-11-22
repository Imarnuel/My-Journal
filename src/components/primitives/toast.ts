// One toast at a time, bottom right, 6 seconds, optional Undo (behaviour kit in 01-decisions.md; look per
// DESIGN.md › Toasts). The kind says whether it is a success (a filled check) or a notification (no icon).
// The 6 seconds pause while the pointer or keyboard focus is on the toast, and while the tab is hidden, so an
// Undo is never lost while it is being reached for.
import { create } from "zustand";

export type ToastKind = "done" | "deleted" | "hidden" | "restored" | "added" | "moved" | "voice" | "archived" | "edited";
type Toast = { id: number; msg: string; undo: (() => void) | null; kind: ToastKind };
type S = {
  toast: Toast | null;
  show: (msg: string, undo?: () => void, kind?: ToastKind) => void;
  dismiss: () => void;
  runUndo: () => void;
  /** Stop the clock (pointer or focus on the toast, or the tab hidden); `resume` restarts it with what was left. */
  pause: (why: string) => void;
  resume: (why: string) => void;
};

/** A success gets the check: something the owner did, or asked for, is done. Removals and hiding are notices. */
export const isSuccess = (k: ToastKind) => k !== "deleted" && k !== "hidden";

export const TOAST_MS = 6000;
/** After a pause the toast stays at least this long, so it doesn't vanish the moment the pointer leaves. */
const AFTER_PAUSE_MS = 1500;

let timer: ReturnType<typeof setTimeout> | undefined;
let seq = 0;
let left = TOAST_MS;
let since = 0;
const pausedBy = new Set<string>();

export const useToast = create<S>((set, get) => {
  const run = (ms: number) => {
    clearTimeout(timer);
    left = ms;
    since = Date.now();
    timer = setTimeout(() => set({ toast: null }), ms);
  };
  return {
    toast: null,
    show: (msg, undo, kind = "done") => {
      set({ toast: { id: ++seq, msg, undo: undo ?? null, kind } });
      if (pausedBy.size) (clearTimeout(timer), (left = TOAST_MS));
      else run(TOAST_MS);
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
    pause: (why) => {
      if (pausedBy.has(why)) return;
      if (!pausedBy.size && get().toast) {
        clearTimeout(timer);
        left = Math.max(0, left - (Date.now() - since));
      }
      pausedBy.add(why);
    },
    resume: (why) => {
      if (!pausedBy.delete(why) || pausedBy.size) return;
      if (get().toast) run(Math.max(left, AFTER_PAUSE_MS));
    },
  };
});

/** Show a toast. Pass `undo` for destructive or hiding actions, and the kind (success or notice). */
export const toast = (msg: string, undo?: () => void, kind?: ToastKind) => useToast.getState().show(msg, undo, kind);
