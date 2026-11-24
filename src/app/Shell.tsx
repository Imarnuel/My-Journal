// The shared shell (03-screens.md): sidebar on the window ground, the main card, skip link, one toast region.
// Markup and inline values match the prototype frames exactly.
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link, useLocation } from "react-router-dom";
import { slideSegments, trackInputModality } from "../components/primitives/motion";
import { Icon, type IconName } from "../components/primitives/Icon";
import { focusFirstItem, noteTrigger, onMenuKeyDown } from "../components/primitives/menuKeys";
import { isSuccess, useToast } from "../components/primitives/toast";
import { useImageFade } from "./useImageFade";

export type NavKey = "dashboard" | "log" | "playbook" | "review" | "accounts" | "settings" | null;

const NAV: { key: Exclude<NavKey, null>; to: string; label: string; icon: IconName }[] = [
  { key: "dashboard", to: "/", label: "Dashboard", icon: "dash" },
  { key: "log", to: "/log", label: "Trade log", icon: "log" },
  { key: "playbook", to: "/playbook", label: "Playbook", icon: "book" },
  { key: "review", to: "/review", label: "Weekly review", icon: "review" },
  { key: "accounts", to: "/accounts", label: "Accounts", icon: "acct" },
  { key: "settings", to: "/settings", label: "Settings", icon: "gear" },
];

export function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 12px" }}>
      <span
        aria-hidden="true"
        style={{ width: "26px", height: "26px", borderRadius: "var(--r-md)", background: "var(--btn-p-bg)", boxShadow: "var(--btn-p-shadow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--btn-p-fg)" }}
      >
        <Icon name="logo-mark" />
      </span>
      <span style={{ fontWeight: "600", fontSize: "16px", letterSpacing: "var(--tracking-body)" }}>Journal</span>
    </div>
  );
}

/**
 * The success mark: a filled 16px circle in the toast's text colour with the tick cut out in the toast's own
 * colour (DESIGN.md › Toasts). The tick draws in as the toast lands.
 */
function SuccessCheck() {
  return (
    <svg className="ktoast-check" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path d="M4.8 8.3l2.1 2.1 4.3-4.5" pathLength={1} fill="none" stroke="var(--inverse-bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The toast (DESIGN.md › Toasts). Two variants: with an action (a ghost Undo, no outline) and without one.
 * A success leads with the filled check; a notification has no icon. It rises in from below the edge and goes
 * back the way it came, faster; a toast that replaces another keeps its place and cross-fades its content.
 * Transitions, not keyframes, so a toast that comes back mid-exit turns around smoothly.
 */
export function Toasts() {
  const live = useToast((s) => s.toast);
  const runUndo = useToast((s) => s.runUndo);
  const pause = useToast((s) => s.pause);
  const resume = useToast((s) => s.resume);
  // Keep the last toast on screen while it leaves.
  const [shown, setShown] = useState(live);
  useEffect(() => {
    if (live) return setShown(live);
    if (!shown) return;
    const id = window.setTimeout(() => setShown(null), 240);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);
  // A hidden tab doesn't count down: the toast is still there when you come back.
  useEffect(() => {
    const onVis = () => (document.hidden ? pause("tab") : resume("tab"));
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pause, resume]);
  // The pointer and focus pauses end with the toast.
  useEffect(() => {
    if (!live) (resume("pointer"), resume("focus"));
  }, [live, resume]);
  const t = live ?? shown;
  if (!t) return null;
  const success = isSuccess(t.kind);
  return (
    <div
      role="status"
      className="ktoast"
      data-variant={t.undo ? "action" : "plain"}
      data-leaving={live ? undefined : ""}
      onPointerEnter={() => pause("pointer")}
      onPointerLeave={() => resume("pointer")}
      onFocus={() => pause("focus")}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && resume("focus")}
    >
      <div key={t.id} className="ktoast-body">
        {success ? <SuccessCheck /> : null}
        <span className="ktoast-msg">{t.msg}</span>
        {t.undo ? (
          <button type="button" className="ktoast-undo" onClick={runUndo}>
            Undo
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Keyboard support for menus and "open from keyboard" focus, for every screen. */
function useMenuKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => onMenuKeyDown(e);
    const click = (e: MouseEvent) => {
      // A menu trigger activated from the keyboard (Enter/Space give detail 0) moves focus into the menu.
      const t = (e.target as HTMLElement).closest<HTMLElement>("[aria-haspopup]");
      noteTrigger(t);
      if (t && e.detail === 0) focusFirstItem();
    };
    document.addEventListener("keydown", down);
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("click", click, true);
    };
  }, []);
}

/** Shared motion for the whole page: sliding segmented controls and keyboard-aware entrances. */
function useSharedMotion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => trackInputModality(), []);
  useEffect(() => (ref.current ? slideSegments(ref.current) : undefined), []);
  return ref;
}

/** Page changes inside the app: the content cross-fades with a 4px upward drift over --d-slow.
 *  Runs on every route change without remounting the screen (its state is kept). Skipped for keyboard
 *  navigation and on the first load; reduced motion makes it a short fade. */
// Each screen mounts its own Shell, so the last shown path is app-wide. Comparing paths (not "has run")
// keeps the first load still, including React's development double-mount.
let lastPath: string | null = null;

function usePageTransition() {
  const page = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const from = lastPath;
    lastPath = pathname;
    if (from === null || from === pathname) return;
    const el = page.current;
    if (!el || document.documentElement.dataset.input === "kbd") return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.animate(
      reduce ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
      { duration: reduce ? 120 : 320, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }, [pathname]);
  return page;
}

const menuIcon = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

/**
 * Below 800px, where the sidebar can't sit beside the page (DESIGN.md › Phone navigation): a slim top bar with the
 * wordmark and a menu button, and the sidebar's links in a drawer that slides in from the left over the dimmed,
 * blurred page. A tap outside, the close button, Escape or choosing a page closes it; focus moves in and comes back.
 */
function NavDrawer({ active, open, onClose, back }: { active: NavKey; open: boolean; onClose: () => void; back: RefObject<HTMLButtonElement | null> }) {
  const panel = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) back.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    (panel.current?.querySelector<HTMLElement>("a.on") ?? panel.current?.querySelector<HTMLElement>("a"))?.focus({ preventScroll: true });
    const html = document.documentElement;
    const was = html.style.overflow;
    html.style.overflow = "hidden"; // the page underneath doesn't scroll
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") (e.preventDefault(), onClose());
      if (e.key !== "Tab" || !panel.current) return;
      // Focus stays in the drawer while it's open.
      const items = [...panel.current.querySelectorAll<HTMLElement>("a, button")];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = was;
    };
  }, [open, onClose, back]);
  return (
    <div className="kdrawer-root" data-open={open ? "" : undefined}>
      <button type="button" className="kdrawer-scrim" aria-label="Close menu" tabIndex={-1} onClick={onClose} />
      <div ref={panel} id="nav-drawer" role="dialog" aria-modal="true" aria-label="Menu" className="kdrawer" inert={!open}>
        <div className="kdrawer-head">
          <Wordmark />
          <button type="button" className="btn btn-q kmenu-btn" aria-label="Close menu" onClick={onClose}>
            <svg {...menuIcon}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="nav" aria-label="Main" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map((n) => (
            <Link key={n.key} to={n.to} className={active === n.key ? "on" : ""} aria-current={active === n.key ? "page" : undefined} onClick={onClose}>
              <Icon name={n.icon} size={16} />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

/**
 * `bar`: a page's top bar (DESIGN.md › Page top bar): its breadcrumb trail and actions in a slim strip along the top
 * of the main card, edge to edge with a hairline under it; the page starts 16px below.
 */
export function Shell({ active, children, minHeight, bar }: { active: NavKey; children: ReactNode; minHeight?: number; bar?: ReactNode }) {
  useMenuKeyboard();
  useImageFade();
  const ref = useSharedMotion();
  const page = usePageTransition();
  const [navOpen, setNavOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const closeNav = useCallback(() => setNavOpen(false), []);
  return (
    <div ref={ref} className="app" style={{ minHeight: minHeight ? `${minHeight}px` : "100dvh", fontSize: "14px", lineHeight: "20px", display: "flex", flexWrap: "wrap" }}>
      <a className="kskip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>
        Skip to main content
      </a>
      <aside className="sidebar" style={{ flex: "1 1 232px", maxWidth: "100%", boxSizing: "border-box", padding: "16px 12px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="ksidebar-head">
          <Wordmark />
          <button ref={burger} type="button" className="btn btn-q kmenu-btn kburger" aria-label="Open menu" aria-expanded={navOpen ? "true" : "false"} aria-controls="nav-drawer" onClick={() => setNavOpen(true)}>
            <svg {...menuIcon}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav className="nav ksidebar-nav" aria-label="Main" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map((n) => (
            <Link key={n.key} to={n.to} className={active === n.key ? "on" : ""} aria-current={active === n.key ? "page" : undefined}>
              <Icon name={n.icon} size={16} />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ flex: "999 1 560px", minWidth: 0, boxSizing: "border-box", padding: "8px 8px 8px 0", display: "flex" }}>
        <div className={bar ? "panel kwithbar" : "panel"} id="main" tabIndex={-1} style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: bar ? "0 32px 48px" : "32px 32px 48px" }}>
          {bar ? (
            <div className="kpagebar">
              <div className="kpagebar-in">{bar}</div>
            </div>
          ) : null}
          <div ref={page} style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px", ...(bar ? { marginTop: "16px" } : {}) }}>{children}</div>
        </div>
      </main>
      <NavDrawer active={active} open={navOpen} onClose={closeNav} back={burger} />
      <Toasts />
    </div>
  );
}
