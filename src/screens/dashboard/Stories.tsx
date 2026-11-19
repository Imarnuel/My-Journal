// Recent chart stories (the last 6 with charts, whatever the period or accounts), the fewer-than-5-trades state
// (frame 16, "Your numbers start after 5 trades", with a button that widens the period), and the page footnote.
import { Link } from "react-router-dom";
import type { Entry, Period } from "../../lib/types";
import { fr, tone } from "../../lib/format";
import { PERIODS, plural } from "../../lib/dashboard";
import { instantNext } from "../../components/charts/tween";

const SPRITE = /^[ls][wx][0-2]$/;

/** The story's first chart: a placeholder drawing on the canvas, or the trader's own image. */
export function firstChart(e: Entry): { sprite?: string; src?: string } {
  const c = e.chartList?.[0] ?? e.chartKey ?? (e.dir === "Short" ? "sx0" : "lx0");
  return SPRITE.test(c) ? { sprite: c } : { src: c };
}

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "12px" }}>
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
                  {e.pair}
                  {e.dir ? (
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "5px", padding: "0 8px", lineHeight: "16px" }}>{e.dir}</span>
                  ) : null}
                </span>
                <span className="num" style={{ fontSize: "14px", fontWeight: "500", color: taken ? tone(e.r) : "var(--text-2)" }}>
                  {taken ? fr(e.r ?? 0) : e.status}
                </span>
              </span>
              <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                {e.setup}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Frame 16, "Dashboard · fewer than 5 trades": replaces the numbers until the period has 5 trades. */
export function TooFew({ n, wider, widen }: { n: number; wider: Period | null; widen: () => void }) {
  const label = wider ? `Show ${PERIODS.find((p) => p.key === wider)!.label.replace(/^This/, "this")}` : null;
  return (
    <section
      aria-labelledby="tfh"
      className="card"
      style={{ ["--card-fill" as string]: "var(--surface-2)", padding: "24px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "150px", boxSizing: "border-box" }}
    >
      <h2 id="tfh" style={{ margin: 0, fontSize: "16px", fontWeight: "500", lineHeight: "24px" }}>
        Your numbers start after 5 trades
      </h2>
      <p className="meta" style={{ margin: "0" }}>
        {`${plural(n, "trade")} logged so far. Until then this page shows your chart stories, and the numbers fill in as you go.`}
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {label ? (
          <button
            type="button"
            className="btn btn-g"
            onClick={(e) => {
              if (e.detail === 0) instantNext();
              widen();
            }}
          >
            {label}
          </button>
        ) : null}
        <Link to="/new" className="btn btn-g">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          New chart story
        </Link>
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
