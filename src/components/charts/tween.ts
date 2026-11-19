// Motion for data (02-look-and-feel.md section 12): numbers count to a new value and charts morph to new data,
// over --d-slow with --ease-standard, only on a change (never on first load). Reduced motion: values swap at once.
// Interruptible: a new target starts from whatever is on screen.
import { useEffect, useRef, useState } from "react";

export const D_SLOW = 320;

/** cubic-bezier(x1, y1, x2, y2) as a function of t in [0, 1]. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    t = Math.min(1, Math.max(0, t));
    return sy(t);
  };
}

/** --ease-standard: cubic-bezier(0.2, 0, 0, 1). */
export const easeStandard = bezier(0.2, 0, 0, 1);

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// Nothing animates on a keyboard-triggered change (review-animations STANDARDS): the control calls instantNext()
// and the change it causes in the next moment swaps at once.
let instantUntil = 0;
export const instantNext = () => {
  instantUntil = performance.now() + 150;
};
/** Swap at once instead of animating: reduced motion, or a change made from the keyboard. */
export const noMotion = () => reducedMotion() || performance.now() < instantUntil;

/**
 * Tween any value toward `target` with `lerp(from, to, k)`. The first value shows as-is; later changes animate.
 * `same` decides whether a new target is equal to the current one (no animation).
 */
export function useTween<T>(target: T, lerp: (a: T, b: T, k: number) => T, same: (a: T, b: T) => boolean, duration = D_SLOW): T {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  const goal = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    if (same(goal.current, target)) return;
    goal.current = target;
    cancelAnimationFrame(raf.current);
    if (noMotion()) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const from = shownRef.current;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const v = k >= 1 ? target : lerp(from, target, easeStandard(k));
      shownRef.current = v;
      setShown(v);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return shown;
}

const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;
const sameN = (a: number, b: number) => a === b;

/** A number that counts to its new value on a change (stats on the dashboard). */
export function useCountUp(value: number): number {
  return useTween(value, lerpN, sameN);
}
