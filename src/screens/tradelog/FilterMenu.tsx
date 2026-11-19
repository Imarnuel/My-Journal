// A Trade log filter: a compact dropdown led by the filter's icon, with a count beside every option
// (computed with the other filters applied) and options that would leave nothing dimmed, not hidden.
// Markup from prototype/Main.dc.html.
import { useRef, type ReactNode } from "react";
import { IcCheck, IcChev } from "./icons";

export type Opt = { label: string; count: string; dim: boolean; sel: boolean; pick: () => void };

type Props = {
  name: string; // "Date", "Pair", ...
  icon: ReactNode;
  label: string; // what the button shows
  aria: string; // "Date: All time"
  active: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  opts: Opt[];
  width: number;
  align?: "left" | "right";
  children?: ReactNode; // Pick dates fields under the options
};

/** After choosing closes the menu, focus goes back to its trigger instead of being lost. */
export function returnFocus(trigger: HTMLElement | null) {
  requestAnimationFrame(() => {
    if (trigger && (!document.activeElement || document.activeElement === document.body)) trigger.focus({ preventScroll: true });
  });
}

export function FilterMenu({ name, icon, label, aria, active, open, onToggle, onClose, opts, width, align = "left", children }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        ref={ref}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        aria-label={aria}
        onClick={onToggle}
        style={{ font: "inherit", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-1)", background: active || open ? "var(--surface-pressed)" : "transparent", border: `1px solid ${active ? "var(--border-strong)" : "var(--border)"}`, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px", cursor: "pointer", position: "relative", zIndex: 5 }}
      >
        <span style={{ color: "var(--text-2)", display: "flex" }}>{icon}</span>
        {label}
        <span style={{ color: "var(--text-3)", display: "flex" }}>
          <IcChev />
        </span>
      </button>
      {open ? (
        <>
          <button type="button" aria-label="Close menu" tabIndex={-1} onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 4, background: "transparent", border: 0, padding: 0, cursor: "default" }} />
          <div
            role="listbox"
            aria-label={name}
            className="kmenu"
            onClick={() => returnFocus(ref.current)}
            style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box", [align]: 0, width: `${width}px`, transformOrigin: align === "right" ? "top right" : "top left" }}
          >
            {opts.map((o) => (
              <button
                key={o.label}
                type="button"
                role="option"
                aria-selected={o.sel ? "true" : "false"}
                onClick={o.pick}
                className="kit-opt"
                style={{ font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", color: "var(--text-1)", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px", cursor: "pointer", width: "100%", background: o.sel ? "var(--surface-pressed)" : "transparent" }}
              >
                <span style={{ color: o.dim ? "var(--text-disabled)" : "var(--text-1)" }}>{o.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--text-3)", fontSize: "12px", lineHeight: "16px" }}>{o.count}</span>
                  {o.sel ? (
                    <span style={{ color: "var(--text-1)", display: "flex" }}>
                      <IcCheck />
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
            {children}
          </div>
        </>
      ) : null}
    </span>
  );
}
