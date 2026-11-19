// A choice menu behind a secondary button (02-look-and-feel.md section 11, Menus): no leading icons,
// a check on the selected row. Markup matches the prototype's select menus exactly.
import { Icon } from "./Icon";

export type ChoiceSelectProps = {
  /** Accessible name of the field, e.g. "Review day". */
  name: string;
  /** aria-label prefix on the trigger when it differs from `name` ("Copied trades"). */
  triggerName?: string;
  value: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPick: (v: string) => void;
  align?: "left" | "right";
  width?: number;
};

export function ChoiceSelect({ name, triggerName, value, options, open, onToggle, onClose, onPick, align = "right", width = 240 }: ChoiceSelectProps) {
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        aria-label={`${triggerName ?? name}: ${value}`}
        onClick={onToggle}
        className="btn btn-g"
        style={{ fontWeight: 500, gap: "8px", position: "relative", zIndex: 5 }}
      >
        {value}
        <span style={{ color: "var(--text-3)", display: "flex" }}>
          <Icon name="chev" />
        </span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 4, background: "transparent", border: 0, padding: 0, cursor: "default" }}
          />
          <div
            role="listbox"
            aria-label={triggerName ?? name}
            className="kmenu"
            style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box", [align]: 0, width: `${width}px`, transformOrigin: align === "right" ? "top right" : "top left" }}
          >
            {options.map((o) => {
              const sel = o === value;
              return (
                <button
                  key={o}
                  type="button"
                  role="option"
                  aria-selected={sel ? "true" : "false"}
                  onClick={() => onPick(o)}
                  className="kit-opt"
                  style={{ font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", color: "var(--text-1)", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px", cursor: "pointer", width: "100%", background: sel ? "var(--surface-pressed)" : "transparent" }}
                >
                  <span>{o}</span>
                  {sel ? (
                    <span style={{ display: "flex" }}>
                      <Icon name="check" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </span>
  );
}
