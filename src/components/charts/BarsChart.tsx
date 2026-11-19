// R by day / R by week: slim 10px bars in profit or loss either side of a 1px baseline, rounded at the value end
// and square at the baseline (DESIGN.md, Dashboard charts),
// readout in a reserved strip above the bars, the other bars fade while one is hovered.
// When the data changes, each bar grows or shrinks to its new height (transform only). Markup from the prototype.
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { D_SLOW, noMotion } from "./tween";

export type Bar = { up: number; down: number; col: string; label: string; when: string; r: string; n: string };

export function BarsChart({ bars, label }: { bars: Bar[]; label: string }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const prev = useRef<number[] | null>(null);

  // Morph: grow each fill from its previous height (scaleY), keeping the final layout pixel-exact.
  useLayoutEffect(() => {
    const now = bars.flatMap((b) => [b.up, b.down]);
    const was = prev.current;
    prev.current = now;
    if (!was || noMotion()) return;
    now.forEach((h, j) => {
      const el = refs.current[j];
      const before = was[j] ?? 0;
      if (!el || h === 0 || h === before) return;
      el.style.transition = "none";
      el.style.transform = `scaleY(${before / h})`;
      void el.offsetHeight;
      el.style.transition = `transform ${D_SLOW}ms var(--ease-standard), opacity 140ms var(--ease-standard)`;
      el.style.transform = "";
    });
  }, [bars]);

  const [active, setActive] = useState<number | null>(null);
  useEffect(() => setActive((a) => (a == null ? a : Math.min(a, bars.length - 1))), [bars.length]);
  const onKey = (e: KeyboardEvent) => {
    const last = bars.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active == null ? 0 : Math.min(last, active + 1);
    else if (e.key === "ArrowLeft") next = active == null ? last : Math.max(0, active - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else if (e.key === "Escape" && active != null) next = null;
    else return;
    e.preventDefault();
    setActive(next);
  };
  const fade = (i: number) => (active != null && active !== i ? { opacity: 0.3 } : {});

  return (
    <div
      className="kbars"
      role="img"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKey}
      onBlur={() => setActive(null)}
      onMouseEnter={() => setActive(null)}
      style={{ display: "flex", gap: "4px", marginTop: "0", flex: "1" }}
    >
      {bars.map((b, i) => (
        <div key={i} className="kbar" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", paddingTop: "48px" }}>
          <div style={{ height: "84px", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div
              ref={(el) => {
                refs.current[i * 2] = el;
              }}
              className="kbar-fill"
              style={{ height: `${b.up}px`, width: "50%", maxWidth: "10px", borderRadius: "4px 4px 0 0", background: b.col, transformOrigin: "bottom", ...fade(i) }}
            />
          </div>
          <div style={{ height: "1px", width: "100%", background: "var(--border)" }} />
          <div style={{ height: "84px", width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            <div
              ref={(el) => {
                refs.current[i * 2 + 1] = el;
              }}
              className="kbar-fill"
              style={{ height: `${b.down}px`, width: "50%", maxWidth: "10px", borderRadius: "0 0 4px 4px", background: b.col, transformOrigin: "top", ...fade(i) }}
            />
          </div>
          <span className="lbl" style={{ fontSize: "12px", marginTop: "8px", whiteSpace: "nowrap", lineHeight: "16px" }}>
            {b.label}
          </span>
          <div className="ktip ktip-bar" role="presentation" style={active === i ? { opacity: 1 } : undefined}>
            <span className="ktip-k">{b.when}</span>
            <span className="ktip-v">
              <span className="num" style={{ color: b.col }}>
                {b.r}
              </span>
              <span>{b.n}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
