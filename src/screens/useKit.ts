// The values every prototype view expects from its "kit" (account picker, menu close, toast),
// computed from the shared store. One menu open at a time per screen: `kmenu` holds its key.
import { useState } from "react";
import { realAccounts, useStore } from "../data/store";
import { toast as showToast, useToast, type ToastKind } from "../components/primitives/toast";

export function useMenu<T extends string = string>() {
  const [kmenu, setK] = useState<T | null>(null);
  return {
    kmenu,
    open: (k: T) => setK(k),
    close: () => setK(null),
    toggle: (k: T) => setK((cur) => (cur === k ? null : k)),
    isOpen: (k: T) => kmenu === k,
  };
}

/** Any screen's menu state that includes the account picker key "ap". */
type MenuWithPicker = { close: () => void; isOpen: (k: "ap") => boolean; toggle: (k: "ap") => void };

export function useKit(menu: MenuWithPicker) {
  const accounts = useStore((s) => s.accounts);
  const picked = useStore((s) => s.picked);
  const setPicked = useStore((s) => s.setPicked);
  const resetPicked = useStore((s) => s.resetPicked);
  const t = useToast((s) => s.toast);
  const runUndo = useToast((s) => s.runUndo);
  const ALL = accounts.filter((a) => !a.archived);
  const on = picked;
  return {
    kClose: menu.close,
    apOpen: menu.isOpen("ap"),
    apToggle: () => menu.toggle("ap"),
    apLabel: on.length === 1 ? on[0] : on.length === ALL.length ? "All accounts" : `${on.length} accounts`,
    apRows: ALL.map((a) => ({
      name: a.name,
      practice: a.practice,
      on: on.includes(a.name),
      onlyLabel: `Show only ${a.name}`,
      toggle: () => {
        const nx = on.includes(a.name) ? on.filter((x) => x !== a.name) : [...on, a.name];
        if (nx.length) setPicked(nx);
      },
      only: () => setPicked([a.name]),
    })),
    apReset: resetPicked,
    apDefault: realAccounts(accounts),
    // Toast fields are rendered by the Shell; kept for views that still reference them.
    toastOn: false,
    toastMsg: t?.msg ?? "",
    toastCanUndo: !!t?.undo,
    toastUndo: runUndo,
  };
}

/** Show a toast and close any open menu (prototype's this.toast). */
export function useToastAction(menu: { close: () => void }) {
  return (msg: string, undo?: () => void, kind?: ToastKind) => {
    menu.close();
    showToast(msg, undo, kind);
  };
}
