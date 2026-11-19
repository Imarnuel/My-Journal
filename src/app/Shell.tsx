// The shared shell (03-screens.md): sidebar on the window ground, the main card, skip link, one toast region.
// Markup and inline values match the prototype frames exactly.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { slideSegments, trackInputModality } from "../components/primitives/motion";
import { Icon, type IconName } from "../components/primitives/Icon";
import { focusFirstItem, noteTrigger, onMenuKeyDown } from "../components/primitives/menuKeys";
import { useToast, type ToastKind } from "../components/primitives/toast";

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
      <span style={{ fontWeight: "600", fontSize: "16px", letterSpacing: "-0.01em" }}>Journal</span>
    </div>
  );
}

/** One icon per kind of outcome, 16px, stroke 1.8 like the rest of the interface. */
function ToastIcon({ kind }: { kind: ToastKind }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "deleted":
      return (
        <svg {...p}>
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V4h6v3" />
        </svg>
      );
    case "hidden":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M5.6 5.6l12.8 12.8" />
        </svg>
      );
    case "restored":
      return (
        <svg {...p}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      );
    case "added":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="9" cy="9" r="1.8" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case "moved":
      return (
        <svg {...p}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      );
    case "voice":
      return (
        <svg {...p}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
        </svg>
      );
    case "archived":
      return (
        <svg {...p}>
          <rect x="3" y="4" width="18" height="5" rx="1.5" />
          <path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
          <path d="M10 13h4" />
        </svg>
      );
    case "edited":
      return (
        <svg {...p}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.7 2.7L16 9.8" />
        </svg>
      );
  }
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
    <div key={t.id} role="status" className={leaving && !live ? "kstatus ktoast leaving" : "kstatus ktoast"}>
      <span className="ktoast-ic" data-kind={t.kind} aria-hidden="true">
        <ToastIcon kind={t.kind} />
      </span>
      <span className="ktoast-msg">{t.msg}</span>
      {t.undo ? (
        <button type="button" className="ktoast-undo" onClick={runUndo}>
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
              <Icon name={n.icon} size={16} />
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
