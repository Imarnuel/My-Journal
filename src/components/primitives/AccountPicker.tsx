// The account picker (behaviour kit): tick accounts in or out, "Only" on hover, Reset to the real accounts,
// at least one stays ticked. Only where numbers are filtered: Dashboard, Playbook, setup page, Weekly review.
// It changes numbers only, never examples or recency. Markup from the prototype frames.
import { Fragment, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import type { useKit } from "../../screens/useKit";

export function AccountPicker({ kit, onKeyDownCapture }: { kit: ReturnType<typeof useKit>; onKeyDownCapture?: (e: KeyboardEvent) => void }) {
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button type="button" aria-haspopup="true" aria-expanded={kit.apOpen ? "true" : "false"} onClick={kit.apToggle} className="btn btn-g" style={{ gap: "8px", fontWeight: 500, position: "relative", zIndex: 5 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="6" width="20" height="14" rx="2.5" />
          <path d="M2 10h20" />
        </svg>
        <span>{kit.apLabel}</span>
        <span style={{ color: "var(--text-3)", display: "flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {kit.apOpen ? (
        <>
          <button type="button" aria-label="Close menu" tabIndex={-1} onClick={kit.kClose} style={{ position: "fixed", inset: 0, zIndex: 4, background: "transparent", border: 0, padding: 0, cursor: "default" }} />
          <fieldset className="kmenu" onKeyDownCapture={onKeyDownCapture} style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box", right: 0, width: "300px", margin: 0, textAlign: "left" }}>
            <legend style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Accounts to include</legend>
            {kit.apRows.map((a) => (
              <Fragment key={a.name}>
                <div className="kit-row" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 8px 0 12px", borderRadius: "var(--r-md)" }}>
                  <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", minHeight: "34px", cursor: "pointer" }}>
                    <input type="checkbox" checked={a.on} onChange={a.toggle} style={{ width: "18px", height: "18px", margin: 0, accentColor: "var(--text-1)" }} />
                    <span style={{ fontSize: "14px", color: "var(--text-1)" }}>{a.name}</span>
                    {a.practice ? <span style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>Practice</span> : null}
                  </label>
                  <button type="button" className="kit-only" aria-label={a.onlyLabel} onClick={a.only} style={{ font: "inherit", fontSize: "12px", fontWeight: 500, color: "var(--text-1)", background: "var(--surface-pressed)", border: 0, borderRadius: "var(--r-sm)", padding: "0 12px", minHeight: "28px", cursor: "pointer", lineHeight: "16px" }}>
                    Only
                  </button>
                </div>
              </Fragment>
            ))}
            <div style={{ height: "1px", background: "var(--surface-pressed)", margin: "8px 4px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
              <button type="button" onClick={kit.apReset} style={{ font: "inherit", fontSize: "14px", color: "var(--text-2)", background: "transparent", border: 0, minHeight: "32px", padding: "0 8px", cursor: "pointer" }}>
                Reset
              </button>
              <Link to="/accounts" style={{ fontSize: "14px", color: "var(--text-2)", minHeight: "32px", display: "flex", alignItems: "center", padding: "0 8px" }}>
                Manage accounts
              </Link>
            </div>
            <p style={{ margin: 0, padding: "8px 12px 8px", fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>This only changes the numbers. Examples from every account stay in your playbook.</p>
          </fieldset>
        </>
      ) : null}
    </div>
  );
}
