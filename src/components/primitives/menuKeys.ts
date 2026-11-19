// Keyboard for every menu on the page (02-look-and-feel.md section 11, Menus):
// arrows move, Enter chooses (native button), Escape closes and returns focus to the trigger,
// typing jumps to a matching row. Works on any open `.kmenu` with the prototype's markup:
// the trigger carries aria-expanded="true" and a transparent "Close menu" button sits behind the menu.

const ITEM = 'button:not([disabled]):not([aria-label="Close menu"]), [role="option"], [role="menuitem"], input, a[href]';

function openMenu(): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(".kmenu");
  return all.length ? all[all.length - 1] : null;
}

function items(menu: HTMLElement): HTMLElement[] {
  return [...menu.querySelectorAll<HTMLElement>(ITEM)].filter((el) => el.offsetParent !== null);
}

let lastTrigger: HTMLElement | null = null;

/** Remember the control that opened a menu, so Escape returns focus to it (not to another expanded section). */
export function noteTrigger(el: HTMLElement | null) {
  if (el) lastTrigger = el;
}

function trigger(): HTMLElement | null {
  if (lastTrigger?.isConnected && lastTrigger.getAttribute("aria-expanded") === "true") return lastTrigger;
  const t = document.querySelectorAll<HTMLElement>('[aria-haspopup][aria-expanded="true"]');
  if (t.length) return t[t.length - 1];
  const any = document.querySelectorAll<HTMLElement>('[aria-expanded="true"]');
  return any.length ? any[any.length - 1] : null;
}

export function closeOpenMenu(): boolean {
  const menu = openMenu();
  if (!menu) return false;
  const t = trigger();
  const closer = document.querySelector<HTMLElement>('[aria-label="Close menu"]');
  if (closer) closer.click();
  else t?.click();
  requestAnimationFrame(() => t?.focus({ preventScroll: true }));
  return true;
}

let typed = "";
let typedAt = 0;

export function onMenuKeyDown(e: KeyboardEvent) {
  const menu = openMenu();
  if (!menu) return;
  const list = items(menu);
  const i = list.indexOf(document.activeElement as HTMLElement);
  const inField = (document.activeElement as HTMLElement | null)?.matches?.("input, textarea");
  if (e.key === "Escape") {
    e.preventDefault();
    closeOpenMenu();
    return;
  }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (!list.length) return;
    e.preventDefault();
    const d = e.key === "ArrowDown" ? 1 : -1;
    const next = i < 0 ? (d > 0 ? 0 : list.length - 1) : (i + d + list.length) % list.length;
    list[next].focus({ preventScroll: true });
    return;
  }
  if (e.key === "Home" || e.key === "End") {
    if (inField || !list.length) return;
    e.preventDefault();
    list[e.key === "Home" ? 0 : list.length - 1].focus({ preventScroll: true });
    return;
  }
  if (e.key.length === 1 && !inField && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const now = Date.now();
    typed = now - typedAt > 700 ? e.key.toLowerCase() : typed + e.key.toLowerCase();
    typedAt = now;
    const hit = list.find((el) => (el.textContent || "").trim().toLowerCase().startsWith(typed));
    if (hit) hit.focus({ preventScroll: true });
  }
}

/** When a menu opens from the keyboard, move focus into it. */
export function focusFirstItem() {
  requestAnimationFrame(() => {
    const menu = openMenu();
    if (!menu) return;
    const sel = menu.querySelector<HTMLElement>('[aria-selected="true"], [aria-checked="true"]');
    (sel ?? items(menu)[0])?.focus({ preventScroll: true });
  });
}
