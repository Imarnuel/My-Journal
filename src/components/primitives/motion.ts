// Shared motion from handoff/docs/02-look-and-feel.md section 12, applied once for every screen.
// - Segmented controls: the selected fill slides between segments (--d-fast, --ease-standard).
// - Keyboard-initiated menus and dialogs appear without animation (review-animations STANDARDS:
//   never animate keyboard-initiated actions).
// - Theme change: colours cross-fade over --d-slow; nothing moves.

/** Track the last input modality on <html data-input>, so CSS can skip entrance animations for keyboard use. */
export function trackInputModality(): () => void {
  const root = document.documentElement;
  const kbd = (e: KeyboardEvent) => {
    if (e.key === "Tab" || e.key === "Enter" || e.key === " " || e.key.startsWith("Arrow") || e.key === "Escape") root.dataset.input = "kbd";
  };
  const ptr = () => {
    root.dataset.input = "pointer";
  };
  document.addEventListener("keydown", kbd, true);
  document.addEventListener("pointerdown", ptr, true);
  return () => {
    document.removeEventListener("keydown", kbd, true);
    document.removeEventListener("pointerdown", ptr, true);
  };
}

const PRESSED = 'button[aria-pressed="true"], [role="tab"][aria-selected="true"]';

/** Position the sliding thumb of one segmented track under its pressed segment. */
function place(track: HTMLElement, animate: boolean) {
  const on = track.querySelector<HTMLElement>(PRESSED);
  let thumb = track.querySelector<HTMLElement>(":scope > .kseg-thumb");
  if (!on) {
    thumb?.remove();
    track.classList.remove("has-thumb");
    return;
  }
  if (!thumb) {
    thumb = document.createElement("span");
    thumb.className = "kseg-thumb";
    thumb.setAttribute("aria-hidden", "true");
    track.prepend(thumb);
    animate = false;
  }
  if (getComputedStyle(track).position === "static") track.style.position = "relative";
  track.classList.add("has-thumb");
  const x = on.offsetLeft;
  const y = on.offsetTop;
  thumb.style.transition = animate && document.documentElement.dataset.input !== "kbd" ? "" : "none";
  thumb.style.width = `${on.offsetWidth}px`;
  thumb.style.height = `${on.offsetHeight}px`;
  thumb.style.transform = `translate(${x}px, ${y}px)`;
  if (!animate) void thumb.offsetWidth; // commit the jump before transitions resume
}

/** Watch the page for segmented tracks and keep their thumbs on the pressed segment. */
export function slideSegments(root: HTMLElement): () => void {
  const seen = new WeakMap<HTMLElement, HTMLElement | null>();
  const sync = () => {
    root.querySelectorAll<HTMLElement>(".kseg-track").forEach((t) => {
      const on = t.querySelector<HTMLElement>(PRESSED);
      const had = seen.has(t);
      if (!had || seen.get(t) !== on) place(t, had);
      seen.set(t, on);
    });
  };
  sync();
  const mo = new MutationObserver(sync);
  mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-pressed", "aria-selected"] });
  const ro = new ResizeObserver(() => root.querySelectorAll<HTMLElement>(".kseg-track").forEach((t) => place(t, false)));
  ro.observe(root);
  return () => {
    mo.disconnect();
    ro.disconnect();
  };
}

/** Cross-fade colours while the theme changes (called by the store's setAppearance). */
export function fadeTheme(apply: () => void) {
  const root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
  root.classList.add("theme-fade");
  apply();
  window.setTimeout(() => root.classList.remove("theme-fade"), 360);
}
