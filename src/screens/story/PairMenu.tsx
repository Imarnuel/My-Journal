// The Pair menu (DESIGN.md › Pair picker): search or type, the owner's pairs first, every group in full, and
// Use "…" for anything else. Keyboard follows every other menu (components/primitives/menuKeys.ts): arrows move,
// Enter picks, Escape closes back to the trigger; Enter in the search picks the first row.
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { pairResults, tidyPair } from "../../lib/instruments";
import { Check, menuBox } from "./parts";

const rowStyle: CSSProperties = {
  font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-1)",
  border: 0, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "34px", cursor: "pointer", width: "100%", flex: "none",
};

export function PairList({ value, yours, onPick, style }: { value: string | null; yours: string[]; onPick: (t: string) => void; style?: CSSProperties }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  // The search has the cursor as soon as the menu opens (after the menu keyboard's own focus move).
  useEffect(() => {
    let b = 0;
    const a = requestAnimationFrame(() => (b = requestAnimationFrame(() => input.current?.focus({ preventScroll: true }))));
    return () => (cancelAnimationFrame(a), cancelAnimationFrame(b));
  }, []);
  const res = pairResults(q, yours);
  const first = res.sections[0]?.rows[0]?.t ?? res.use;
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && first) {
      e.preventDefault();
      onPick(first);
    }
  };
  // Keyboard focus can move past the visible rows: keep the focused row in view.
  const show = (el: HTMLElement) => el.scrollIntoView({ block: "nearest" });
  return (
    <div className="kmenu kpairs" style={{ ...menuBox, width: "280px", padding: "4px", gap: "4px", ...style }}>
      {/* The field is the label box (icon + plain input), so global input styles can't shift the text under the
          icon; the cursor always sits here, so the box shows focus with its border, not a second ring. */}
      <label className="kfield kpairs-search" style={{ display: "flex", alignItems: "center", gap: "8px", flex: "none", minHeight: "32px", boxSizing: "border-box", padding: "0 12px", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", cursor: "text" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", color: "var(--text-3)" }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={input}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="pairlist"
          aria-autocomplete="list"
          aria-label="Search or type a pair"
          placeholder="Search or type a pair"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          style={{ flex: 1, minWidth: 0, font: "inherit", fontSize: "14px", lineHeight: "20px", color: "var(--text-1)", background: "transparent", border: 0, outline: "none", padding: 0, boxShadow: "none" }}
        />
      </label>
      <div id="pairlist" role="listbox" aria-label="Pair" className="kpairs-list" style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "360px", overflowY: "auto", overscrollBehavior: "contain" }}>
        {res.sections.map((s) => (
          <div key={s.label ?? "matches"} role="group" aria-label={s.label ?? "Matches"} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {s.label ? (
              <div aria-hidden="true" className="kpairs-label" style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--surface-3)", fontSize: "12px", lineHeight: "16px", fontWeight: 500, color: "var(--text-3)", padding: "8px 12px 4px" }}>
                {s.label}
              </div>
            ) : null}
            {s.rows.map((r) => {
              const sel = r.t === value;
              return (
                <button key={r.t} type="button" role="option" aria-selected={sel ? "true" : "false"} className="kit-opt" onClick={() => onPick(r.t)} onFocus={(e) => show(e.currentTarget)} style={{ ...rowStyle, background: sel ? "var(--surface-pressed)" : "transparent" }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{r.t}</span>
                  {r.name ? <span style={{ fontSize: "12px", lineHeight: "16px", color: "var(--text-3)" }}>{r.name}</span> : null}
                  {sel ? <Check /> : null}
                </button>
              );
            })}
          </div>
        ))}
        {res.use ? (
          <button type="button" role="option" aria-selected="false" className="kit-opt" onClick={() => onPick(tidyPair(res.use!))} onFocus={(e) => show(e.currentTarget)} style={{ ...rowStyle, background: "transparent", color: "var(--text-2)" }}>
            {`Use “${res.use}”`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
