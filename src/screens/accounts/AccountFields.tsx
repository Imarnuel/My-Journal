// Name, Type and Practice account: the shared top of Add account (frame 13) and Edit account (frame 14).
// Choosing Demo or Backtest switches Practice on for you; it can be changed (01-decisions.md, Accounts and MT5).
import { useEffect, useRef, type RefObject } from "react";
import { Switch } from "../settings/Switch";

export const PRESET_TYPES = ["Live", "Prop firm", "Demo", "Backtest"];
export const practiceFor = (type: string) => type === "Demo" || type === "Backtest";

export type AccountDraft = { name: string; type: string; own: string; ownOpen: boolean; practice: boolean };

export function draftFrom(a: { name: string; type: string; practice: boolean }): AccountDraft {
  const own = !PRESET_TYPES.includes(a.type);
  return { name: a.name, type: a.type, own: own ? a.type : "", ownOpen: own, practice: a.practice };
}

const field = { font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "0 16px", minHeight: "32px", width: "100%", boxSizing: "border-box" } as const;
const label = { fontSize: "14px", fontWeight: 500, color: "var(--text-2)" } as const;
const chip = { font: "inherit", fontSize: "14px", fontWeight: 500, color: "var(--text-1)", background: "transparent", border: "1px solid var(--border)", borderRadius: "999px", padding: "0 16px", minHeight: "32px", cursor: "pointer" } as const;

export function AccountFields({
  d,
  set,
  practiceHint,
  nameRef,
  nameInvalid,
  placeholder,
}: {
  d: AccountDraft;
  set: (patch: Partial<AccountDraft>) => void;
  practiceHint: string;
  nameRef?: RefObject<HTMLInputElement | null>;
  nameInvalid?: boolean;
  placeholder?: string;
}) {
  const ownRef = useRef<HTMLInputElement>(null);
  const focusOwn = useRef(false);
  useEffect(() => {
    if (d.ownOpen && focusOwn.current) {
      focusOwn.current = false;
      ownRef.current?.focus();
    }
  }, [d.ownOpen]);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label htmlFor="fld-name" style={label}>Name</label>
        <input
          ref={nameRef}
          id="fld-name"
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={d.name}
          aria-invalid={nameInvalid ? "true" : undefined}
          onChange={(e) => set({ name: e.target.value })}
          style={field}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span id="lbl-type" style={label}>Type</span>
        <div role="group" aria-labelledby="lbl-type" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {PRESET_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={d.type === t ? "true" : "false"}
              onClick={() => set({ type: t, practice: practiceFor(t) })}
              className="kchip"
              style={chip}
            >
              {t}
            </button>
          ))}
          {d.ownOpen ? (
            <input
              ref={ownRef}
              type="text"
              aria-label="Your own type"
              placeholder="e.g. Swing account"
              value={d.own}
              onFocus={() => d.own.trim() && set({ type: d.own.trim() })}
              onChange={(e) => set({ own: e.target.value, type: e.target.value.trim() })}
              style={{ font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border-strong)", borderRadius: "999px", padding: "0 16px", minHeight: "32px" }}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                focusOwn.current = true;
                set({ ownOpen: true });
              }}
              style={{ font: "inherit", fontSize: "14px", color: "var(--text-2)", background: "transparent", border: "1px dashed var(--border)", borderRadius: "999px", padding: "0 16px", minHeight: "32px", cursor: "pointer" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                Your own type
              </span>
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "16px 0", borderTop: "1px solid var(--border-subtle)" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>Practice account</div>
          <div className="lbl">{practiceHint}</div>
        </div>
        <Switch on={d.practice} label="Practice account" onFlip={() => set({ practice: !d.practice })} />
      </div>
    </>
  );
}

/** The "‹ Accounts" link above both account pages. */
export const backLinkStyle = { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-2)", textDecoration: "none", alignSelf: "flex-start", minHeight: "32px" } as const;
export const fieldStyle = field;
export const labelStyle = label;
