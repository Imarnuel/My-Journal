// The recording card (DESIGN.md › Voice note: recording): a small live waveform, "Listening · 0:14", Cancel and
// Stop, and under them what is being heard, as it is heard. Settled words are in the text colour; the last few,
// still being worked out, are grey and change in place. The words stop at three lines: earlier lines slide up
// under a soft fade. Where live words aren't available, the approved line stays in their place.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Heard } from "./liveWords";

const BARS = 18;
const STEP_MS = 90; // a new bar every 90ms: the line moves left at an easy reading pace

/** The live waveform: 18 bars, newest on the right; quiet shows as dots. Transform and opacity only. */
export function LiveWave({ level, size = "sm" }: { level: () => number; size?: "sm" }) {
  const [vals, setVals] = useState<number[]>(() => Array(BARS).fill(0));
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let peak = 0;
    const tick = (t: number) => {
      peak = Math.max(peak, level());
      if (t - last >= STEP_MS) {
        last = t;
        const v = peak;
        peak = 0;
        setVals((xs) => [...xs.slice(1), v]);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [level]);
  return (
    <span className="kwave" data-size={size} aria-hidden="true">
      {vals.map((v, i) => (
        <span key={i} style={{ transform: `scaleY(${Math.max(0.1, v)})`, opacity: v < 0.08 ? 0.5 : 1 }} />
      ))}
    </span>
  );
}

/** The words heard so far, at most three lines, newest at the bottom. New phrases fade in. */
export function HeardWords({ heard, settled = false }: { heard: Heard; settled?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState(false);
  useLayoutEffect(() => {
    const el = box.current;
    if (el) setOver(el.scrollHeight > el.clientHeight + 1);
  }, [heard]);
  return (
    <div ref={box} className="kheard" data-over={over ? "" : undefined} data-settled={settled ? "" : undefined}>
      <p>
        {heard.final.map((f, i) => (
          <span key={i} className="kword-in">
            {i ? " " : ""}
            {f}
          </span>
        ))}
        {heard.partial ? <span className="kheard-partial">{`${heard.final.length ? " " : ""}${heard.partial}`}</span> : null}
        {settled ? null : <span className="kheard-caret" aria-hidden="true" />}
      </p>
    </div>
  );
}

/** The recording card. `heard` is null when live words aren't available here. */
export function LiveCard({ secs, level, heard, actions }: { secs: string; level: () => number; heard: Heard | null; actions: ReactNode }) {
  const any = !!heard && (heard.final.length > 0 || !!heard.partial);
  return (
    <div className="kswap klive">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <LiveWave level={level} />
        <span role="status" style={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>
          Listening · {secs}
        </span>
        {actions}
      </div>
      {any && heard ? (
        <HeardWords heard={heard} />
      ) : (
        <p className="meta" style={{ margin: 0, fontSize: "14px", lineHeight: "20px" }}>
          Talk as long as you like. Stop when you're done.
        </p>
      )}
    </div>
  );
}
