// Dashboard header: title, period line, period choice, account picker, New chart story. Markup from the prototype.
import { Link } from "react-router-dom";
import type { Period } from "../../lib/types";
import { PERIODS } from "../../lib/dashboard";
import type { useKit } from "../useKit";
import { instantNext } from "../../components/charts/tween";
import { AccountPicker } from "../../components/primitives/AccountPicker";

type Kit = ReturnType<typeof useKit>;

export function Header({ sub, period, setPeriod, kit }: { sub: string; period: Period; setPeriod: (p: Period) => void; kit: Kit }) {
  return (
    <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
        <h1 style={{ margin: "0", fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: "600", lineHeight: "32px", letterSpacing: "-0.025em" }}>Dashboard</h1>
        <p className="meta" style={{ margin: "0" }}>
          {sub}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div role="group" aria-label="Period" className="kseg-track" style={{ display: "flex", gap: "2px", padding: "4px", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" }}>
          {PERIODS.map((o) => {
            const on = o.key === period;
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={on ? "true" : "false"}
                onClick={(e) => {
                  if (e.detail === 0) instantNext();
                  setPeriod(o.key);
                }}
                style={{
                  font: "inherit", fontSize: "14px", fontWeight: on ? 600 : 500, color: on ? "var(--text-1)" : "var(--text-2)", background: on ? "var(--surface-3)" : "transparent",
                  border: "0", borderRadius: "var(--r-md)", padding: "0 16px", minHeight: "32px", cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <AccountPicker kit={kit} onKeyDownCapture={instantNext} />
        <Link to="/new" className="btn btn-p">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          New chart story
        </Link>
      </div>
    </header>
  );
}
