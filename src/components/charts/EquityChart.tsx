// R over time (02-look-and-feel.md section 13): cumulative R per trade, straight segments, drawdown from the
// running peak shaded, hover readout per point. Draws in once on first load, then morphs to new data.
// Markup and class names from handoff/prototype/Dashboard.dc.html.
import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { EQ, eqGrid, eqPaths, eqScale, eqX, eqY, resample } from "../../lib/dashboard";
import { fr } from "../../lib/format";
import { useTween } from "./tween";

export type EqPoint = { when: string; r: number | null }; // one per point; the first is the start of the period

type Geo = { pts: number[]; lo: number; hi: number };
const lerpGeo = (a: Geo, b: Geo, k: number): Geo => {
  const from = resample(a.pts, b.pts.length);
  return { pts: b.pts.map((v, i) => from[i] + (v - from[i]) * k), lo: a.lo + (b.lo - a.lo) * k, hi: a.hi + (b.hi - a.hi) * k };
};
const sameGeo = (a: Geo, b: Geo) => a.lo === b.lo && a.hi === b.hi && a.pts.length === b.pts.length && a.pts.every((v, i) => v === b.pts[i]);
const col = (r: number) => (r > 0 ? "var(--profit)" : r < 0 ? "var(--loss)" : "var(--text-2)");

export function EquityChart({
  pts, points, ticks, label, drawIn, onDrawn,
}: {
  pts: number[];
  points: EqPoint[];
  ticks: { i: number; label: string }[];
  label: string;
  drawIn: boolean;
  onDrawn: () => void;
}) {
  const { W, H } = EQ;
  const scale = useMemo(() => eqScale(pts), [pts]);
  const target = useMemo<Geo>(() => ({ pts, lo: scale.lo, hi: scale.hi }), [pts, scale]);
  const geo = useTween(target, lerpGeo, sameGeo);
  const paths = eqPaths(geo.pts, geo.lo, geo.hi);
  const grid = eqGrid(scale.lo, scale.hi, scale.step);
  const n = pts.length;

  const lineRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = lineRef.current;
    if (!el || !drawIn) return;
    const done = () => onDrawn();
    el.addEventListener("animationend", done);
    el.addEventListener("animationcancel", done);
    return () => {
      el.removeEventListener("animationend", done);
      el.removeEventListener("animationcancel", done);
    };
  }, [drawIn, onDrawn]);

  // Final positions for the hover readout (not the tweened ones).
  const P = pts.map((v, i) => [eqX(i, n), eqY(v, scale.lo, scale.hi)] as const);
  const hover = P.map((q, i) => {
    const prev = i ? P[i - 1][0] : q[0];
    const next = i < n - 1 ? P[i + 1][0] : q[0];
    const hx = i ? (prev + q[0]) / 2 : 0;
    const hr = i < n - 1 ? (q[0] + next) / 2 : W;
    return {
      hl: ((hx / W) * 100).toFixed(2),
      hw: (((hr - hx) / W) * 100).toFixed(2),
      cx: (((q[0] - hx) / (hr - hx)) * 100).toFixed(1),
      cy: ((q[1] / H) * 100).toFixed(1),
      ta: q[0] < 90 ? "start" : q[0] > W - 90 ? "end" : "mid",
    };
  });

  const tk = ticks.map((t) => ({ x: eqX(t.i, n), label: t.label, anchor: "middle" as "start" | "middle" | "end" }));
  if (tk.length) {
    if (tk[0].x < 40) tk[0].anchor = "start";
    const lt = tk[tk.length - 1];
    if (lt.x > W - 40) lt.anchor = "end";
  }

  // Keyboard: arrow keys move through the points once the chart has focus (02-look-and-feel.md section 14).
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => setActive((a) => (a == null ? a : Math.min(a, n - 1))), [n]);
  const onKey = (e: KeyboardEvent) => {
    const last = n - 1;
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

  return (
    <div className="keq" style={{ position: "relative" }} onMouseEnter={() => setActive(null)}>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        style={{ display: "block", overflow: "visible", fontFamily: "inherit" }}
      >
        <defs>
          <linearGradient id="keqFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--text-1)", stopOpacity: "0.07" }} />
            <stop offset="1" style={{ stopColor: "var(--text-1)", stopOpacity: "0" }} />
          </linearGradient>
          <linearGradient id="keqDd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--loss)", stopOpacity: "0.14" }} />
            <stop offset="1" style={{ stopColor: "var(--loss)", stopOpacity: "0.05" }} />
          </linearGradient>
        </defs>
        {grid.map((g) => {
          const y = eqY(g, geo.lo, geo.hi);
          return (
            <Fragment key={g}>
              <line x1="40" y1={y.toFixed(1)} x2="600" y2={y.toFixed(1)} style={{ stroke: g === 0 ? "var(--border)" : "var(--surface-pressed)", strokeDasharray: "2 4" }} />
              <text x="0" y={(y + 4).toFixed(1)} fontSize="12" style={{ fill: "var(--text-3)" }}>
                {g ? fr(g, 0) : "0"}
              </text>
            </Fragment>
          );
        })}
        <path d={paths.area} style={{ fill: "url(#keqFill)" }} />
        <path d={paths.dd} style={{ fill: "url(#keqDd)" }} />
        <path
          ref={lineRef}
          className={drawIn ? "kdraw" : undefined}
          pathLength={drawIn ? 1 : undefined}
          d={paths.line}
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ stroke: "var(--text-1)" }}
        />
        <circle cx={paths.endX.toFixed(1)} cy={paths.endY.toFixed(1)} r="9" style={{ fill: "var(--text-1)", fillOpacity: "0.08" }} />
        <circle cx={paths.endX.toFixed(1)} cy={paths.endY.toFixed(1)} r="4" strokeWidth="2" style={{ fill: "var(--surface-2)", stroke: "var(--text-1)" }} />
        {tk.map((k) => (
          <text key={k.label + k.x} x={k.x.toFixed(1)} y="244" textAnchor={k.anchor} fontSize="12" style={{ fill: "var(--text-3)" }}>
            {k.label}
          </text>
        ))}
      </svg>
      {hover.map((q, i) => {
        const p = points[i];
        return (
          <div key={i} className="kpt" style={{ left: `${q.hl}%`, width: `${q.hw}%` }}>
            <div className="kpt-on" aria-hidden="true" style={active === i ? { opacity: 1 } : undefined}>
              <span className="kpt-line" style={{ left: `${q.cx}%` }} />
              <span className="kpt-dot" style={{ left: `${q.cx}%`, top: `${q.cy}%` }} />
              <span className="ktip" data-a={q.ta} style={{ left: `${q.cx}%` }}>
                <span className="ktip-k">{p?.when}</span>
                <span className="ktip-v">
                  <span className="num">{`${fr(pts[i])} total`}</span>
                  <span className="num" style={{ color: p?.r == null ? "var(--text-2)" : col(p.r) }}>
                    {p?.r == null ? "" : fr(p.r)}
                  </span>
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
