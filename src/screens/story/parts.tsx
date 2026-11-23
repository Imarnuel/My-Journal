// Small pieces of the chart story markup (copied from src/screens/body/Story.body.tsx), shared by the
// Details menus, the facts line and the action menus.
import { AiMic } from "../../components/primitives/AiMic";
import type { CSSProperties, ReactNode } from "react";

/** Transparent layer behind an open menu: a click anywhere outside closes it (menuKeys relies on it). */
export function Closer({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close menu"
      tabIndex={-1}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 4, background: "transparent", border: 0, padding: 0, cursor: "default" }}
    />
  );
}

export const menuBox: CSSProperties = { position: "absolute", zIndex: 6, top: "calc(100% + 6px)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box" };

const optStyle: CSSProperties = { font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", color: "var(--text-1)", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px", cursor: "pointer", width: "100%" };

export function Check() {
  return (
    <span style={{ display: "flex" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

export type Opt = { label: string; hint?: string; lead?: string };

/** A choice listbox: label, optional hint, a check on the selected row. */
export function OptionList({ opts, value, onPick, style, label, children }: { opts: Opt[]; value: string | null; onPick: (v: string) => void; style: CSSProperties; label?: string; children?: ReactNode }) {
  const rows = opts.map((o) => {
        const sel = o.label === value;
        return (
          <button key={o.label} type="button" role="option" aria-selected={sel ? "true" : "false"} onClick={() => onPick(o.label)} className="kit-opt" style={{ ...optStyle, ...(o.hint ? { padding: "8px 12px" } : {}), background: sel ? "var(--surface-pressed)" : "transparent" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                {o.lead ? <Emoji char={o.lead} /> : null}
                {o.label}
              </span>
              {o.hint ? <span style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>{o.hint}</span> : null}
            </span>
            {sel ? <Check /> : null}
          </button>
        );
      });
  if (!children)
    return (
      <div role="listbox" aria-label={label} className="kmenu" style={{ ...menuBox, ...style }}>
        {rows}
      </div>
    );
  // An action row under the options (Setup's "New setup") sits outside the listbox.
  return (
    <div className="kmenu" style={{ ...menuBox, ...style }}>
      <div role="listbox" aria-label={label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {rows}
      </div>
      {children}
    </div>
  );
}

/** An emoji beside a label (Headspace, owner's request): decorative, the word carries the meaning. */
export function Emoji({ char }: { char: string }) {
  return (
    // ui-lint-ignore (next line): an emoji glyph in a menu row's 20px line, not text
    <span aria-hidden="true" style={{ fontSize: "16px", lineHeight: "20px", width: "20px", textAlign: "center", flex: "none", fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}>
      {char}
    </span>
  );
}

/** A row in an action menu (icon + label). */
export function MenuItem({ icon, children, onClick, danger }: { icon: ReactNode; children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" role="menuitem" className="kit-opt" onClick={onClick} style={{ ...optStyle, background: "transparent", color: danger ? "var(--loss)" : "var(--text-1)" }}>
      <span className="mi">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {icon}
        </svg>
        <span>{children}</span>
      </span>
    </button>
  );
}

export function Dots() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

export function Chevron() {
  return (
    <span style={{ color: "var(--text-3)", display: "flex" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}

/** The voice note mark: the filled mic with a sparkle (components/primitives/AiMic.tsx). */
export function Mic({ size = 16 }: { size?: number }) {
  return <AiMic size={size} />;
}

export function Plus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

/** One part of the facts line: a dashed-underline button that opens its menu. */
export const factBtn: CSSProperties = { font: "inherit", fontSize: "14px", fontWeight: 500, color: "var(--text-1)", background: "transparent", border: 0, padding: "2px 0", cursor: "pointer", position: "relative", zIndex: 5, display: "inline-flex", alignItems: "center", gap: "8px" };
/** The fact's value: a dashed underline marks it as tappable (under the words only, not the icon). */
export const factText: CSSProperties = { borderBottom: "1px dashed var(--border-strong)", lineHeight: "20px" };
/**
 * A fact not set yet shows its name ("Pair", "Account") in grey, like every empty field's placeholder, so what is
 * set reads first (the owner, 2026-11-22: "grey a bit the options that have not been selected").
 */
export const factEmpty: CSSProperties = { ...factText, color: "var(--text-3)" };

export function Sep() {
  return (
    <span aria-hidden="true" style={{ color: "var(--text-disabled)" }}>
      ·
    </span>
  );
}

/** A Details row: label on the left, control on the right. */
/** A field's voice note moment: shimmer while the note is read, a brief glow when it was just filled. */
export type Fx = "awaiting" | "filled" | undefined;

export function DetailRow({ label, icon, fx, children }: { label: string; icon?: ReactNode; fx?: Fx; children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr)", gap: "12px", alignItems: "center", minHeight: "48px", borderTop: "1px solid var(--border-subtle)" }}>
      <dt className="lbl lbl-k" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
        {icon}
        {label}
      </dt>
      <dd className="kfx" data-fx={fx} style={{ margin: 0, minWidth: 0, padding: "4px 0 4px 12px" }}>{children}</dd>
    </div>
  );
}

/** Frame 16 problem card ("Couldn't make out your note", "Prices on this screenshot are too small to read"). */
export function ProblemCard({ title, text, children, swap }: { title: string; text?: string; children: ReactNode; swap?: boolean }) {
  return (
    <div role="status" className={swap ? "card kswap" : "card"} style={{ ["--card-fill" as string]: "var(--surface-2)", padding: "24px", borderRadius: "var(--r-card)", display: "flex", flexDirection: "column", gap: "12px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500 }}>
        <span aria-hidden="true" style={{ flex: "none", width: "8px", height: "8px", borderRadius: "4px", background: "var(--attention)" }} />
        {title}
      </div>
      {text ? (
        <p className="meta" style={{ margin: 0 }}>
          {text}
        </p>
      ) : null}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}
