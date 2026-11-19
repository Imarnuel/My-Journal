// The shared shell (03-screens.md): sidebar on the window ground, the main card, skip link, one toast region.
// Markup and inline values match the prototype frames exactly.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { slideSegments, trackInputModality } from "../components/primitives/motion";
import { Icon, type IconName } from "../components/primitives/Icon";
import { focusFirstItem, noteTrigger, onMenuKeyDown } from "../components/primitives/menuKeys";
import { useToast } from "../components/primitives/toast";

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
        style={{ width: "26px", height: "26px", borderRadius: "8px", background: "var(--btn-p-bg)", boxShadow: "var(--btn-p-shadow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--btn-p-fg)" }}
      >
        <Icon name="logo-mark" />
      </span>
      <span style={{ fontWeight: "600", fontSize: "16px", letterSpacing: "-0.01em" }}>Journal</span>
    </div>
  );
}

export function Toasts() {
  const live = useToast((s) => s.toast);
  const runUndo = useToast((s) => s.runUndo);
  // Keep the last toast on screen briefly while it leaves (fade and drop 8px, faster than it arrived).
  const [shown, setShown] = useState(live);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (live) {
      setShown(live);
      setLeaving(false);
      return;
    }
    if (!shown) return;
    setLeaving(true);
    const id = window.setTimeout(() => {
      setShown(null);
      setLeaving(false);
    }, 160);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);
  const t = live ?? shown;
  if (!t) return null;
  return (
    <div
      key={t.id}
      role="status"
      className={leaving && !live ? "kstatus leaving" : "kstatus"}
      style={{ position: "fixed", zIndex: 20, left: "50%", bottom: "calc(28px + env(safe-area-inset-bottom, 0px))", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "16px", padding: "12px 12px 12px 16px", background: "var(--inverse-bg)", color: "var(--inverse-fg)", borderRadius: "12px", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", fontSize: "14px", whiteSpace: "nowrap" }}
    >
      <span>{t.msg}</span>
      {t.undo ? (
        <button
          type="button"
          onClick={runUndo}
          style={{ font: "inherit", fontSize: "14px", fontWeight: 500, color: "var(--inverse-fg)", background: "transparent", border: "1px solid var(--inverse-border)", borderRadius: "8px", padding: "0 12px", minHeight: "32px", cursor: "pointer" }}
        >
          Undo
        </button>
      ) : null}
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

export function Shell({ active, children, minHeight }: { active: NavKey; children: ReactNode; minHeight?: number }) {
  useMenuKeyboard();
  const ref = useSharedMotion();
  const page = usePageTransition();
  return (
    <div ref={ref} className="app" style={{ minHeight: minHeight ? `${minHeight}px` : "100dvh", fontSize: "14px", lineHeight: "20px", display: "flex", flexWrap: "wrap" }}>
      <a className="kskip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>
        Skip to main content
      </a>
      <aside className="sidebar" style={{ flex: "1 1 232px", maxWidth: "100%", boxSizing: "border-box", padding: "16px 12px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <Wordmark />
        <nav className="nav" aria-label="Main" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map((n) => (
            <Link key={n.key} to={n.to} className={active === n.key ? "on" : ""} aria-current={active === n.key ? "page" : undefined}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ flex: "999 1 560px", minWidth: 0, boxSizing: "border-box", padding: "8px 8px 8px 0", display: "flex" }}>
        <div className="panel" id="main" tabIndex={-1} style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "32px 32px 48px" }}>
          <div ref={page} style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>{children}</div>
        </div>
      </main>
      <Toasts />
    </div>
  );
}
