// Frame 01 · Start: first run (connect an account, add setups, log the first trade). No sidebar item.
// Markup from handoff/prototype/Start.dc.html; step 1 names the first account in the shared store.
// "Whenever you trade", not the frame's "Every trading day": the owner's answer to 06-open-items.md item 3 (DESIGN.md).
import { Link } from "react-router-dom";
import { Shell } from "../app/Shell";
import { useStore } from "../data/store";

const step = { listStyle: "none", display: "flex", flexWrap: "wrap", gap: "16px 24px", alignItems: "center", padding: "24px", borderRadius: "var(--r-card)" } as const;
const stepBody = { flex: "1 1 360px", minWidth: 0, display: "flex", gap: "16px", alignItems: "flex-start" } as const;
const badge = { flex: "none", width: "28px", height: "28px", borderRadius: "999px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 500, color: "var(--text-2)" } as const;
const title = { fontSize: "16px", fontWeight: 500, lineHeight: "24px" } as const;
const expectRow = { display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", gap: "16px", padding: "16px 0", borderTop: "1px solid var(--border-subtle)" } as const;

const EXPECT: [string, string][] = [
  ["Whenever you trade", "One chart story per trade or setup: its screenshots, and a note if you like."],
  ["Every week", "A short look back at your week's charts and reflections, and one thing to do differently. Only if you traded."],
  ["After about 20 trades", "Your first setup patterns, marked as early signals until there's enough data to trust."],
];

export function Start() {
  const first = useStore((s) => s.accounts.find((a) => !a.archived && !a.practice) ?? s.accounts[0]);
  const done = first ? `${first.name} added.${first.source === "mt5" ? " MT5 connected to fill in trade numbers." : ""}` : "";

  return (
    <Shell active={null}>
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "24px", fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.025em" }}>Let's get your first trade in</h1>
          <p className="meta" style={{ margin: 0 }}>About 5 minutes. Skip anything you like.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }} />
      </header>

      <ol aria-label="First steps" style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <li className="card" style={{ ...step, background: "transparent" }}>
          <div style={stepBody}>
            <span style={{ flex: "none", width: "28px", height: "28px", borderRadius: "999px", background: "color-mix(in srgb, var(--profit) 16%, transparent)", color: "var(--profit)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={title}>Connect an account</span>
              <span className="meta">{done}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link to="/accounts" className="btn btn-q">Add another</Link>
          </div>
        </li>
        <li aria-current="step" style={{ ...step, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div style={stepBody}>
            <span className="num" style={{ ...badge, border: "1px solid var(--text-1)" }}>2</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={title}>Add your setups</span>
              <span className="meta">Name the setups you trade and their rules. Or skip, and the journal will suggest setups once it sees a few similar charts.</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link to="/" className="btn btn-q">Skip for now</Link>
            <Link to="/playbook/new" className="btn btn-p">Add setups</Link>
          </div>
        </li>
        <li className="card" style={{ ...step, background: "transparent" }}>
          <div style={stepBody}>
            <span className="num" style={{ ...badge, border: "1px solid var(--border)" }}>3</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={title}>Log your first trade</span>
              <span className="meta">Add the screenshots from one recent trade and say a sentence about it.</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link to="/new" className="btn btn-g">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              New chart story
            </Link>
          </div>
        </li>
      </ol>

      <section aria-labelledby="exp" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>
            <span id="exp">What to expect</span>
          </h2>
        </div>
        <div style={{ marginTop: "12px" }}>
          {EXPECT.map(([k, v]) => (
            <div key={k} style={expectRow}>
              <span className="lbl">{k}</span>
              <span style={{ fontSize: "14px" }}>{v}</span>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
