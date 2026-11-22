// Recent chart stories (the last 6 with charts, whatever the period or accounts) and the page footnote.
// (The fewer-than-5-trades card is gone: the numbers show as far as they go, DESIGN.md.)
import { Link } from "react-router-dom";
import type { Entry } from "../../lib/types";
import { fr, tone } from "../../lib/format";

const SPRITE = /^[ls][wx][0-2]$/;

/** The story's first chart: a placeholder drawing on the canvas, or the trader's own image. */
export function firstChart(e: Entry): { sprite?: string; src?: string } {
  const c = e.chartList?.[0] ?? e.chartKey ?? (e.dir === "Short" ? "sx0" : "lx0");
  return SPRITE.test(c) ? { sprite: c } : { src: c };
}

/**
 * A card's top line is the pair, its direction and the result; a story without a result (running, watched, not
 * filled) says so at the start of the line below, so a six-letter pair never truncates or runs into the next card
 * (first ui-polish audit; the handoff's 1440 frame had "Not filled" wrapping and "Running" touching "EURJPY").
 */
export function Recent({ stories }: { stories: Entry[] }) {
  return (
    <section aria-labelledby="rch" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
        <h2 style={{ margin: "0", fontSize: "16px", fontWeight: "500", lineHeight: "24px" }}>
          <span id="rch">Recent chart stories</span>
        </h2>
        <Link to="/log" className="meta" style={{ color: "var(--text-2)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          Trade log
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
      <div className="kcards" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "12px" }}>
        {stories.map((e) => {
          const ch = firstChart(e);
          const alt = `${e.pair} ${(e.dir ?? "").toLowerCase()} chart`;
          const taken = e.status === "Taken";
          return (
            <Link key={e.id} to={`/story/${e.id}`} style={{ display: "flex", flexDirection: "column", gap: "8px", textDecoration: "none", color: "var(--text-1)", minWidth: "0" }}>
              <span className="chart" style={{ display: "block" }}>
                {ch.sprite ? (
                  <svg viewBox="0 0 320 180" role="img" aria-label={alt} style={{ display: "block", width: "100%", height: "auto" }}>
                    <use href={`#${ch.sprite}`} />
                  </svg>
                ) : (
                  <img src={ch.src} alt={alt} style={{ display: "block", width: "100%", aspectRatio: "320 / 180", objectFit: "contain" }} />
                )}
              </span>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500", minWidth: "0" }}>
                  <span style={{ whiteSpace: "nowrap" }}>{e.pair}</span>
                  {e.dir ? (
                    <span className="kchip">{e.dir}</span>
                  ) : null}
                </span>
                {taken ? (
                  <span className="num" style={{ flex: "none", whiteSpace: "nowrap", fontSize: "14px", fontWeight: "500", color: tone(e.r) }}>
                    {fr(e.r ?? 0)}
                  </span>
                ) : null}
              </span>
              <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {taken ? e.setup : `${e.status} · ${e.setup}`}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function Footnote() {
  return (
    <p className="meta" style={{ margin: "0", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
      <span style={{ display: "block", maxWidth: "480px" }}>
        This shows what happened. Your <Link to="/review">weekly review</Link> is where you decide what to change. Running, watched and not-filled trades stay out of every number. Win rate and expectancy need 5 trades.
      </span>
    </p>
  );
}
