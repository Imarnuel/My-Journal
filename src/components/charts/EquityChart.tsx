// R over time: cumulative R per trade, straight segments (DESIGN.md, Dashboard charts: the line is blue above
// zero and orange below it, a light wash of the same colour under it, hairline guides with values on the right,
// no drawdown shading), hover readout per point. Draws in once on first load, then morphs to new data.
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
  // Labels stay 12px on screen however narrow the chart is drawn (phones; DESIGN.md › Phone layouts): the chart is
  // 600 units wide and scaled to fit, so the label size in units grows as the drawing shrinks.
  const svgRef = useRef<SVGSVGElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setK(Math.min(1, Math.max(0.3, el.getBoundingClientRect().width / W))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [W]);
  const labelSize = 12 / k;
  const scale = useMemo(() => eqScale(pts), [pts]);
  const target = useMemo<Geo>(() => ({ pts, lo: scale.lo, hi: scale.hi }), [pts, scale]);
  const geo = useTween(target, lerpGeo, sameGeo);
  const paths = eqPaths(geo.pts, geo.lo, geo.hi);
  const grid = eqGrid(scale.lo, scale.hi, scale.step);
  const n = pts.length;
  const zeroY = eqY(0, geo.lo, geo.hi);
  // The wash runs from the line to zero (not to the bottom), so it reads as gain above and loss below.
  const fillToZero = `${paths.line} L${paths.endX.toFixed(1)} ${zeroY.toFixed(1)} L${eqX(0, Math.max(1, geo.pts.length)).toFixed(1)} ${zeroY.toFixed(1)} Z`;
  const endUp = (geo.pts[geo.pts.length - 1] ?? 0) >= 0;

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
        ref={svgRef}
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
          {/* Above zero the line and its wash are profit blue; below zero, loss orange. */}
          <clipPath id="keqUp">
            <rect x="0" y="0" width={W} height={zeroY.toFixed(1)} />
          </clipPath>
          <clipPath id="keqDown">
            <rect x="0" y={zeroY.toFixed(1)} width={W} height={(H - zeroY).toFixed(1)} />
          </clipPath>
          <linearGradient id="keqUpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--profit)", stopOpacity: "0.14" }} />
            <stop offset="1" style={{ stopColor: "var(--profit)", stopOpacity: "0" }} />
          </linearGradient>
          <linearGradient id="keqDownFill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" style={{ stopColor: "var(--loss)", stopOpacity: "0.14" }} />
            <stop offset="1" style={{ stopColor: "var(--loss)", stopOpacity: "0" }} />
          </linearGradient>
        </defs>
        {grid.map((g) => {
          const y = eqY(g, geo.lo, geo.hi);
          return (
            <Fragment key={g}>
              <line x1={EQ.pl} y1={y.toFixed(1)} x2={W - EQ.pr + 8} y2={y.toFixed(1)} style={{ stroke: g === 0 ? "var(--border)" : "var(--border-subtle)" }} />
              <text x={W} y={(y + 4 * (1 / k)).toFixed(1)} textAnchor="end" fontSize={labelSize} style={{ fill: "var(--text-3)" }}>
                {g ? fr(g, 0) : "0R"}
              </text>
            </Fragment>
          );
        })}
        <path d={fillToZero} clipPath="url(#keqUp)" style={{ fill: "url(#keqUpFill)" }} />
        <path d={fillToZero} clipPath="url(#keqDown)" style={{ fill: "url(#keqDownFill)" }} />
        {(["keqUp", "keqDown"] as const).map((c, k) => (
          <path
            key={c}
            ref={k === 0 ? lineRef : undefined}
            className={drawIn ? "kdraw" : undefined}
            pathLength={drawIn ? 1 : undefined}
            d={paths.line}
            clipPath={`url(#${c})`}
            fill="none"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ stroke: k === 0 ? "var(--profit)" : "var(--loss)" }}
          />
        ))}
        {/* The latest point: filled in the line's colour with a 2px surface ring. */}
        <circle cx={paths.endX.toFixed(1)} cy={paths.endY.toFixed(1)} r="6" style={{ fill: "var(--surface-2)" }} />
        <circle cx={paths.endX.toFixed(1)} cy={paths.endY.toFixed(1)} r="4" style={{ fill: endUp ? "var(--profit)" : "var(--loss)" }} />
        {tk.map((k) => (
          <text key={k.label + k.x} x={k.x.toFixed(1)} y={H - 4} textAnchor={k.anchor} fontSize={labelSize} style={{ fill: "var(--text-3)" }}>
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
