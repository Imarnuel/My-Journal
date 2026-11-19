// The numbers (shown from 5 trades in the period): top row, R over time, R by day / week, By setup, By session,
// Costliest mistakes. Markup from handoff/prototype/Dashboard.dc.html; values from src/lib/dashboard.ts.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { slug } from "../../app/routes";
import type { Entry, Period } from "../../lib/types";
import { fr, pct, shortDate, tone } from "../../lib/format";
import { barGroups, barHeight, bestWorst, breakdown, eqTicks, plural, type PeriodNumbers, type Row } from "../../lib/dashboard";
import { useCountUp } from "../../components/charts/tween";
import { EquityChart, type EqPoint } from "../../components/charts/EquityChart";
import { BarsChart, type Bar } from "../../components/charts/BarsChart";

const card = { display: "flex", flexDirection: "column", gap: "8px", padding: "16px 16px 16px", borderRadius: "12px", minWidth: "0" } as const;
const big = { fontSize: "24px", fontWeight: "600", lineHeight: "32px", letterSpacing: "-0.025em" } as const;

function Stat({ label, value, color, sub }: { label: string; value: string; color?: string; sub: string }) {
  return (
    <div className="card" style={card}>
      <span className="lbl">{label}</span>
      <span className="num" style={{ ...big, color: color ?? "var(--text-1)" }}>
        {value}
      </span>
      <span className="lbl">{sub}</span>
    </div>
  );
}

/** Top row. Values count to their new value when the period or accounts change (not on first load). */
export function StatRow({ p }: { p: PeriodNumbers }) {
  const { s } = p;
  const net = useCountUp(s.net);
  const ex = useCountUp(s.expectancy ?? 0);
  const wr = useCountUp(s.winRate ?? 0);
  const pl = useCountUp(s.planRate ?? 0);
  const n = useCountUp(s.n);
  return (
    <div className="card kstat" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", padding: "16px", borderRadius: "12px" }}>
      <Stat label="Net R" value={fr(net)} color={tone(s.net)} sub={`Worst drawdown ${fr(s.dd)}`} />
      <Stat label="Expectancy" value={fr(ex, 2)} sub="What an average trade made" />
      <Stat label="Win rate" value={pct(wr)} sub={`Wins avg ${s.avgWin == null ? "–" : fr(s.avgWin)}, losses ${s.avgLoss == null ? "–" : fr(s.avgLoss)}`} />
      <Stat label="Plan followed" value={pct(pl)} sub={`${s.followed} of ${s.n} trades`} />
      <Stat label="Trades taken" value={String(Math.round(n))} sub={`${p.watched} watched · ${p.notFilled} not filled`} />
    </div>
  );
}

function TableToggle({ on, flip }: { on: boolean; flip: () => void }) {
  return (
    <button type="button" className="btn btn-q ktab-tog" aria-pressed={on ? "true" : "false"} onClick={flip}>
      {on ? "Show chart" : "View as table"}
    </button>
  );
}

const sectionCard = { display: "flex", flexDirection: "column", gap: "8px", padding: "24px", borderRadius: "12px", minWidth: "0" } as const;
const headRow = { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" } as const;
const h2 = { margin: "0", fontSize: "16px", fontWeight: "500", lineHeight: "24px" } as const;

export function Charts({
  p, period, eqTab, barTab, flipEq, flipBar, drawIn, onDrawn,
}: {
  p: PeriodNumbers;
  period: Period;
  eqTab: boolean;
  barTab: boolean;
  flipEq: () => void;
  flipBar: () => void;
  drawIn: boolean;
  onDrawn: () => void;
}) {
  const { s, T } = p;
  const byWeek = period === "3m";
  const points: EqPoint[] = [{ when: "Start of period", r: null }, ...T.map((e: Entry) => ({ when: `${shortDate(e.date)} · ${e.pair}`, r: e.r }))];
  const groups = barGroups(T, byWeek);
  const bars: Bar[] = groups.map((g) => {
    const h = barHeight(g.r, groups);
    return {
      up: g.r >= 0 ? h : 0,
      down: g.r < 0 ? h : 0,
      col: tone(g.r),
      label: byWeek ? (g.first ? shortDate(g.k).split(" ")[1] : "") : String(Number(g.k.slice(8))),
      when: (byWeek ? "Week of " : "") + shortDate(g.k),
      r: fr(g.r),
      n: plural(g.n, "trade"),
    };
  });
  const { best, worst } = bestWorst(groups, p.from);
  const wk = byWeek ? "week of " : "";
  const barTitle = byWeek ? "R by week" : "R by day";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)", gap: "24px" }}>
      <section aria-labelledby="eqh" className="card" style={sectionCard}>
        <div style={headRow}>
          <h2 id="eqh" style={h2}>
            R over time
          </h2>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
            {!eqTab ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }} className="lbl">
                <span aria-hidden="true" style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--loss)", opacity: "0.35" }} />
                Drawdown from peak
              </span>
            ) : null}
            <TableToggle on={eqTab} flip={flipEq} />
          </span>
        </div>
        {!eqTab ? (
          <EquityChart
            pts={s.pts}
            points={points}
            ticks={eqTicks(T, period)}
            label={`Cumulative R, trade by trade, ending at ${fr(s.net)}. Deepest drawdown ${fr(s.dd)}.`}
            drawIn={drawIn}
            onDrawn={onDrawn}
          />
        ) : (
          <div className="ktable-wrap">
            <div className="ktable" role="table" aria-label="Each trade in the period, oldest first">
              <div role="row" className="ktr kth">
                <span role="columnheader">Trade</span>
                <span role="columnheader" className="r">
                  Result
                </span>
                <span role="columnheader" className="r">
                  Running total
                </span>
              </div>
              {points.slice(1).map((q, i) => (
                <div key={i} role="row" className="ktr">
                  <span role="cell">{q.when}</span>
                  <span role="cell" className="r num" style={{ color: tone(q.r) }}>
                    {fr(q.r ?? 0)}
                  </span>
                  <span role="cell" className="r num">
                    {fr(s.pts[i + 1])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <section aria-labelledby="dayh" className="card" style={sectionCard}>
        <div style={headRow}>
          <h2 id="dayh" style={h2}>
            {barTitle}
          </h2>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
            <span className="lbl">{`${groups.filter((g) => g.r > 0).length} of ${groups.length}${byWeek ? " weeks up" : " days up"}`}</span>
            <TableToggle on={barTab} flip={flipBar} />
          </span>
        </div>
        {!barTab ? (
          <BarsChart bars={bars} label={(byWeek ? "R by week: " : "R by trading day: ") + groups.map((g) => `${shortDate(g.k)} ${fr(g.r)}`).join(", ")} />
        ) : (
          <div className="ktable-wrap">
            <div className="ktable" role="table" aria-label={barTitle}>
              <div role="row" className="ktr kth">
                <span role="columnheader">{byWeek ? "Week" : "Day"}</span>
                <span role="columnheader" className="r">
                  Trades
                </span>
                <span role="columnheader" className="r">
                  Result
                </span>
              </div>
              {groups.map((g, i) => (
                <div key={i} role="row" className="ktr">
                  <span role="cell">{bars[i].when}</span>
                  <span role="cell" className="r num">
                    {g.n}
                  </span>
                  <span role="cell" className="r num" style={{ color: bars[i].col }}>
                    {bars[i].r}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
          <span className="lbl">
            Best{" "}
            <span className="num" style={{ color: "var(--profit)", fontWeight: "500" }}>
              {fr(best.r)}
            </span>{" "}
            · {wk + shortDate(best.k)}
          </span>
          <span className="lbl">
            Worst{" "}
            <span className="num" style={{ color: "var(--loss)", fontWeight: "500" }}>
              {fr(worst.r)}
            </span>{" "}
            · {wk + shortDate(worst.k)}
          </span>
        </div>
      </section>
    </div>
  );
}

function RowCells({ x }: { x: Row }) {
  const c = tone(x.net);
  return (
    <>
      <span className="num" style={{ fontSize: "14px", textAlign: "right" }}>
        {x.n}
      </span>
      {x.rated ? (
        <>
          <span className="num" style={{ fontSize: "14px", textAlign: "right" }}>
            {pct(x.winRate)}
          </span>
          <span className="num" style={{ fontSize: "14px", textAlign: "right" }}>
            {fr(x.expectancy, 2)}
          </span>
        </>
      ) : (
        <span className="lbl" style={{ gridColumn: "span 2", textAlign: "right" }}>
          Too few to rate
        </span>
      )}
      <div aria-hidden="true" style={{ position: "relative", height: "8px", borderRadius: "4px", background: "var(--surface-2)" }}>
        <div style={{ position: "absolute", top: "0", bottom: "0", left: "50%", width: "1px", background: "var(--border-strong)" }} />
        <div style={{ position: "absolute", top: "0", bottom: "0", [x.bar.side]: "50%", width: `${x.bar.pct}%`, borderRadius: "4px", background: c }} />
      </div>
      <span className="num" style={{ fontSize: "14px", fontWeight: "500", textAlign: "right", color: c }}>
        {fr(x.net)}
      </span>
    </>
  );
}

const SETUP_COLS = "minmax(0, 1.7fr) 64px 72px 92px minmax(90px, 1fr) 64px";
const SESS_COLS = "minmax(0, 1fr) 50px 64px 82px minmax(60px, 1fr) 56px";

function Heads({ cols, first, k }: { cols: string; first: string; k?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: "12px", padding: "0 0 8px", alignItems: "end" }}>
      <span className={k ? "lbl lbl-k" : "lbl"} style={{ textAlign: "left" }}>
        {first}
      </span>
      <span className="lbl" style={{ textAlign: "right" }}>
        Trades
      </span>
      <span className="lbl" style={{ textAlign: "right" }}>
        Win rate
      </span>
      <span className="lbl" style={{ textAlign: "right" }}>
        Expectancy
      </span>
      <span className="lbl" style={{ textAlign: "left" }} />
      <span className="lbl" style={{ textAlign: "right" }}>
        Net
      </span>
    </div>
  );
}

const listCard = { display: "flex", flexDirection: "column", gap: "4px", padding: "24px", borderRadius: "12px" } as const;
const listHead = { ...headRow, marginBottom: "12px" } as const;

export function BySetup({ rows, thumbs }: { rows: Row[]; thumbs: Record<string, string> }) {
  return (
    <section aria-labelledby="bsh" className="card" style={listCard}>
      <div style={listHead}>
        <h2 id="bsh" style={h2}>
          By setup
        </h2>
        <Link to="/playbook" className="lbl" style={{ color: "var(--text-2)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          Open playbook
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
      <Heads cols={SETUP_COLS} first="Setup" k />
      {rows.map((x) => {
        const thumb = thumbs[x.name];
        return (
          <Link
            key={x.name}
            to={x.name === "Unsorted" ? "/playbook" : `/playbook/${slug(x.name)}`}
            style={{ display: "grid", gridTemplateColumns: SETUP_COLS, gap: "12px", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border-subtle)", textDecoration: "none", color: "var(--text-1)", minHeight: "32px" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "0" }}>
              {thumb ? (
                <span className="chart" style={{ flex: "none", width: "64px", display: "block" }}>
                  <svg viewBox="0 0 320 180" aria-hidden="true" style={{ display: "block", width: "100%", height: "auto" }}>
                    <use href={`#${thumb}`} />
                  </svg>
                </span>
              ) : (
                <span aria-hidden="true" style={{ flex: "none", width: "64px", height: "36px", borderRadius: "8px", border: "1px dashed var(--border)", boxSizing: "border-box" }} />
              )}
              <span style={{ fontSize: "14px", fontWeight: "500" }}>{x.name}</span>
            </span>
            <RowCells x={x} />
          </Link>
        );
      })}
    </section>
  );
}

export function SessionsAndMistakes({ sessions, mistakes, untagged, n }: { sessions: Row[]; mistakes: { tag: string; n: number; r: number; pct: number }[]; untagged: number; n: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "24px" }}>
      <section aria-labelledby="ssh" className="card" style={{ ...listCard, minWidth: "0" }}>
        <div style={listHead}>
          <h2 id="ssh" style={h2}>
            By session
          </h2>
          <span className="lbl">From each trade's open time</span>
        </div>
        <Heads cols={SESS_COLS} first="Session" />
        {sessions.map((x) => (
          <div key={x.name} style={{ display: "grid", gridTemplateColumns: SESS_COLS, gap: "12px", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border-subtle)", textDecoration: "none", color: "var(--text-1)", minHeight: "44px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "0" }}>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>{x.name}</span>
            </span>
            <RowCells x={x} />
          </div>
        ))}
      </section>
      <section aria-labelledby="msh" className="card" style={{ ...listCard, minWidth: "0" }}>
        <div style={listHead}>
          <h2 id="msh" style={h2}>
            Costliest mistakes
          </h2>
          <span className="lbl">R from trades with each mistake tag</span>
        </div>
        {mistakes.length ? (
          <>
            {mistakes.map((x) => (
              <Fragment key={x.tag}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) 70px minmax(60px, 1fr) 60px", gap: "12px", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border-subtle)", minHeight: "44px" }}>
                  <span>
                    <span className="pill">{x.tag}</span>
                  </span>
                  <span className="lbl" style={{ textAlign: "right" }}>
                    {plural(x.n, "trade")}
                  </span>
                  <div aria-hidden="true" style={{ height: "8px", borderRadius: "4px", background: "var(--surface-2)", overflow: "hidden" }}>
                    <div style={{ width: `${x.pct}%`, height: "100%", background: "var(--loss)", borderRadius: "4px" }} />
                  </div>
                  <span className="num" style={{ fontSize: "14px", fontWeight: "500", textAlign: "right", color: tone(x.r) }}>
                    {fr(x.r)}
                  </span>
                </div>
              </Fragment>
            ))}
            <p className="lbl" style={{ margin: "12px 0 0" }}>
              A trade with two tags counts under both. {`${untagged} of ${n} trades had no mistake tagged.`}
            </p>
          </>
        ) : (
          <p className="lbl" style={{ margin: "0", padding: "12px 0", borderTop: "1px solid var(--border-subtle)" }}>
            No mistakes tagged in this period.
          </p>
        )}
      </section>
    </div>
  );
}

export { breakdown };
