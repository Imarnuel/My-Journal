// Frame 11 · Weekly review (01-decisions.md, "Weekly review"). /review opens on the latest week the user traded;
// /review/:week (the week's Monday) opens that week. Markup from handoff/prototype/Review.dc.html; every number
// comes from the shared store and follows the account picker.
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Shell } from "../app/Shell";
import { useStore } from "../data/store";
import { fr, shortDate, tone } from "../lib/format";
import { mistakeWhere, pastWeeks, tradedWeeks, watchedLine, weekParam, weekReview, weekTitle } from "../lib/review";
import type { Entry } from "../lib/types";
import { useKit, useMenu } from "./useKit";
import { AccountPicker } from "../components/primitives/AccountPicker";
import { PastWeeks } from "./review/PastWeeks";

const h2 = { margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" } as const;
const stat = { display: "flex", flexDirection: "column", gap: "4px", padding: "16px 16px", borderRadius: "var(--r-card)", minWidth: 0 } as const;
const statNum = { fontSize: "24px", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: "32px" } as const;
const small = { fontSize: "12px", lineHeight: "16px" } as const;
const q = (t: string) => `“${t}”`;

const isSpriteKey = (k: string) => /^[a-z]{2}\d$/.test(k);

function Chart({ e, alt }: { e: Entry; alt: string }) {
  const first = e.chartList?.[0] ?? e.chartKey;
  if (first && !isSpriteKey(first))
    return <img src={first} alt={alt} style={{ display: "block", width: "100%", aspectRatio: "320 / 180", objectFit: "contain" }} />;
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={alt} style={{ display: "block", width: "100%", height: "auto" }}>
      {first ? <use href={`#${first}`} /> : null}
    </svg>
  );
}

function TradeCard({ e }: { e: Entry }) {
  const r = e.r as number;
  const alt = `${e.pair} ${(e.dir ?? "").toLowerCase()}, ${fr(r)}`;
  return (
    <li style={{ listStyle: "none", minWidth: 0 }}>
      <Link to={`/story/${e.id}`} style={{ display: "flex", flexDirection: "column", gap: "8px", textDecoration: "none", color: "var(--text-1)" }}>
        <span className="chart" style={{ display: "block" }}>
          <Chart e={e} alt={alt} />
        </span>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500 }}>
            {e.pair}
            {e.dir ? <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "var(--r-xs)", padding: "0 8px", lineHeight: "16px" }}>{e.dir}</span> : null}
          </span>
          <span className="num" style={{ fontSize: "14px", fontWeight: 500, color: tone(r) }}>
            {fr(r)}
          </span>
        </span>
        <span className="lbl" style={small}>
          {`${shortDate(e.date)} · ${e.setup}${e.followed === false ? " · Not followed" : ""}`}
        </span>
      </Link>
    </li>
  );
}

export function WeeklyReview() {
  const { week } = useParams();
  const nav = useNavigate();
  const menu = useMenu<"ap">();
  const kit = useKit(menu);
  const entries = useStore((s) => s.entries);
  const picked = useStore((s) => s.picked);
  const today = useStore((s) => s.today);
  const weeks = useStore((s) => s.weeks);
  const setTakeaway = useStore((s) => s.setTakeaway);

  const list = useMemo(() => tradedWeeks(entries, picked, today), [entries, picked, today]);
  const months = useMemo(() => pastWeeks(entries, picked, today), [entries, picked, today]);
  const want = weekParam(week);
  const sel = want && list.includes(want) ? want : list[0];
  const w = useMemo(() => (sel ? weekReview(entries, picked, sel) : null), [entries, picked, sel]);
  const takes = useMemo(() => new Map(weeks.map((x) => [x.monday, x.takeaway ?? ""])), [weeks]);
  const takeaway = (monday: string) => takes.get(monday) ?? "";

  const pick = (monday: string) => {
    menu.close();
    if (week !== monday) nav(`/review/${monday}`);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const prev = sel ? list[list.indexOf(sel) + 1] : undefined;
  const prevTake = prev ? takeaway(prev) : "";
  const tk = sel ? takeaway(sel) : "";
  const isLatest = sel === list[0];
  const takeNote = isLatest
    ? tk
      ? "Saved. It comes back in next week's review."
      : "Write one thing. It saves as you type and comes back in next week's review."
    : tk
      ? "Saved."
      : "You can still write one for the record.";

  return (
    <Shell active="review">
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          <h1 style={{ margin: 0, lineHeight: "32px" }}>Weekly review</h1>
          {sel ? (
            <p className="meta" style={{ margin: 0 }}>
              {`Week of ${weekTitle(sel)}`}
            </p>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <AccountPicker kit={kit} />
        </div>
      </header>

      {!sel ? (
        // No traded week for the ticked accounts: one line, not an empty page (owner's answer, DESIGN.md).
        <p style={{ margin: 0, padding: "48px 0", textAlign: "center", fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>No trades on these accounts yet</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ flex: "999 1 640px", minWidth: 0, display: "flex", flexDirection: "column", gap: "32px" }}>
            {sel && w ? (
              <>
                {prevTake ? (
                  <div className="card" style={{ display: "flex", alignItems: "baseline", gap: "8px", padding: "16px 16px", borderRadius: "var(--r-card)", flexWrap: "wrap" }}>
                    <span className="lbl" style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", lineHeight: "16px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="12" cy="12" r="1" />
                      </svg>
                      The week before, you said
                    </span>
                    <span style={{ fontSize: "14px", color: "var(--text-1)" }}>{q(prevTake)}</span>
                  </div>
                ) : null}

                <section aria-labelledby="wn" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h2 id="wn" style={h2}>
                    The week
                  </h2>
                  <div className="card kstat" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", padding: "16px", borderRadius: "var(--r-card)" }}>
                    <div className="card" style={stat}>
                      <span className="lbl">Net</span>
                      <span className="num" style={{ ...statNum, color: tone(w.net) }}>
                        {fr(w.net)}
                      </span>
                      <span className="lbl" style={small}>
                        In R
                      </span>
                    </div>
                    <div className="card" style={stat}>
                      <span className="lbl">Trades taken</span>
                      <span className="num" style={{ ...statNum, color: "var(--text-1)" }}>
                        {String(w.n)}
                      </span>
                      <span className="lbl" style={small}>
                        {watchedLine(w.watched, w.notFilled)}
                      </span>
                    </div>
                    <div className="card" style={stat}>
                      <span className="lbl">Plan followed</span>
                      <span className="num" style={{ ...statNum, color: "var(--text-1)" }}>
                        {`${w.followed} of ${w.n}`}
                      </span>
                      <span className="lbl" style={small}>
                        Trades where you stuck to it
                      </span>
                    </div>
                  </div>
                </section>

                {w.mistakes.length ? (
                  <section aria-labelledby="wm" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h2 id="wm" style={h2}>
                      Mistakes you tagged more than once
                    </h2>
                    {w.mistakes.map((m) => (
                      <div key={m.tag} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "16px 16px", borderRadius: "var(--r-card)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span className="pill">{m.tag}</span>
                          <span className="lbl">{mistakeWhere(m)}</span>
                        </span>
                        <span className="num" style={{ fontSize: "14px", fontWeight: 500, color: tone(m.r) }}>
                          {fr(m.r)}
                        </span>
                      </div>
                    ))}
                  </section>
                ) : null}

                <section aria-labelledby="wc" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h2 id="wc" style={h2}>
                      Your trades{" "}
                      <span className="lbl" style={{ fontWeight: 500 }}>
                        {`${w.n} ${w.n === 1 ? "trade" : "trades"}`}
                      </span>
                    </h2>
                    <Link to="/log" className="meta" style={{ color: "var(--text-2)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      Open in trade log
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                  <ol className="kcards" style={{ margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px 12px" }}>
                    {w.trades.map((e) => (
                      <TradeCard key={e.id} e={e} />
                    ))}
                  </ol>
                </section>

                <section aria-labelledby="wr" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h2 id="wr" style={h2}>
                    Your reflections
                  </h2>
                  {w.reflections.length ? (
                    <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
                      {w.reflections.map((e) => (
                        <li key={e.id} style={{ listStyle: "none", padding: "12px 0", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "14px", color: "var(--text-1)" }}>{q(e.refl as string)}</span>
                          <span className="lbl" style={small}>
                            {`${e.pair} · ${shortDate(e.date)}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="lbl" style={{ margin: 0 }}>
                      No reflections on this week's stories.
                    </p>
                  )}
                </section>

                <section aria-labelledby="wt" className="card" style={{ ["--card-fill" as string]: "var(--surface-2)", display: "flex", flexDirection: "column", gap: "8px", padding: "16px 24px", borderRadius: "var(--r-card)" }}>
                  <label htmlFor="takeaway" id="wt" style={{ fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>
                    What I'll do differently next week
                  </label>
                  <textarea
                    id="takeaway"
                    rows={2}
                    placeholder="One thing, in your own words"
                    value={tk}
                    onChange={(ev) => setTakeaway(sel, ev.target.value)}
                    style={{ font: "inherit", fontSize: "14px", lineHeight: "20px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "12px 12px", resize: "vertical" }}
                  />
                  <span className="lbl" style={small}>
                    {takeNote}
                  </span>
                </section>
              </>
            ) : null}
          </div>
          <PastWeeks months={months} selected={sel} takeaway={takeaway} onPick={pick} />
        </div>
      )}
    </Shell>
  );
}
