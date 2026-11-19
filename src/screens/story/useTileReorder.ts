// Drag to reorder the chart tiles (DESIGN.md, Chart reordering). Pointer Events, so it works with a mouse,
// a pen and a finger. The tile lifts once the pointer has moved 6px (a mouse) or after a 250ms press (touch,
// so a swipe still scrolls the page), follows the pointer 1:1 from where it was grabbed, and the other tiles
// slide to make room while you drag. On release it settles into its slot with the drag spring from
// 02-look-and-feel.md (stiffness 420, damping 34, no overshoot), carrying the release velocity, and only then
// is the new order saved. A cancelled pointer springs it back; Escape puts it back at once. Reduced motion: no lift, no slide,
// no settle; the tile still follows the pointer and the order changes on release.
import { flushSync } from "react-dom";
import { animate, type AnimationPlaybackControls } from "motion";
import { useEffect, useRef, type PointerEvent as RPointerEvent } from "react";

const MOUSE_SLOP = 6;
const TOUCH_SLOP = 8;
const HOLD_MS = 250;
const SPRING = { type: "spring" as const, stiffness: 420, damping: 34, mass: 1 };

type Pt = { x: number; y: number; t: number };
type Drag = {
  from: number;
  to: number;
  id: number;
  type: string;
  start: Pt;
  hist: Pt[];
  lifted: boolean;
  hold?: ReturnType<typeof setTimeout>;
  tiles: HTMLElement[];
  rects: DOMRect[];
  bounds: DOMRect;
  dx: number;
  dy: number;
};

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Past the edge the tile follows less and less (rubber-banding), so it never hits a wall. */
function band(over: number, dim: number, c = 0.55) {
  return (over * dim * c) / (dim + c * Math.abs(over));
}

/** Where each tile sits once `from` is moved to `to`. */
function slotOf(j: number, from: number, to: number) {
  if (j === from) return to;
  if (from < to && j > from && j <= to) return j - 1;
  if (from > to && j >= to && j < from) return j + 1;
  return j;
}

export function useTileReorder(gridRef: React.RefObject<HTMLElement | null>, onMove: (from: number, to: number) => void, onLift?: () => void) {
  const drag = useRef<Drag | null>(null);
  const settling = useRef<{ stop: () => void } | null>(null);
  const swallowClick = useRef(false);
  const cleanup = useRef<() => void>(() => {});
  const moveRef = useRef(onMove);
  moveRef.current = onMove;

  useEffect(() => () => cleanup.current(), []);

  const tilesNow = () => [...(gridRef.current?.querySelectorAll<HTMLElement>("[data-tile]") ?? [])];

  const place = (d: Drag) => {
    const { dx, dy, bounds, rects, from } = d;
    // Keep the tile's centre inside the grid, softly.
    const r = rects[from];
    const cx = r.left + r.width / 2 + dx;
    const cy = r.top + r.height / 2 + dy;
    let x = dx;
    let y = dy;
    if (cx < bounds.left) x += band(cx - bounds.left, bounds.width) - (cx - bounds.left);
    if (cx > bounds.right) x += band(cx - bounds.right, bounds.width) - (cx - bounds.right);
    if (cy < bounds.top) y += band(cy - bounds.top, bounds.height) - (cy - bounds.top);
    if (cy > bounds.bottom) y += band(cy - bounds.bottom, bounds.height) - (cy - bounds.bottom);
    d.tiles[from].style.transform = `translate3d(${x}px, ${y}px, 0)`;
    return { x, y };
  };

  const nearest = (d: Drag) => {
    const r = d.rects[d.from];
    const cx = r.left + r.width / 2 + d.dx;
    const cy = r.top + r.height / 2 + d.dy;
    let best = d.from;
    let bestD = Infinity;
    d.rects.forEach((s, k) => {
      const dist = Math.hypot(s.left + s.width / 2 - cx, s.top + s.height / 2 - cy);
      if (dist < bestD) {
        bestD = dist;
        best = k;
      }
    });
    return best;
  };

  /** Slide the other tiles to where they'll be with the dragged one at `to`. */
  const shift = (d: Drag) => {
    d.tiles.forEach((el, j) => {
      if (j === d.from) return;
      const k = slotOf(j, d.from, d.to);
      const a = d.rects[j];
      const b = d.rects[k];
      el.style.transform = k === j ? "" : `translate3d(${b.left - a.left}px, ${b.top - a.top}px, 0)`;
    });
  };

  const reset = (tiles: HTMLElement[]) => {
    tiles.forEach((el) => {
      el.style.transition = "none";
      el.style.transform = "";
      el.removeAttribute("data-lifted");
      el.removeAttribute("data-active");
      el.removeAttribute("data-shifting");
    });
    gridRef.current?.removeAttribute("data-reordering");
    void gridRef.current?.offsetWidth; // apply the reset before transitions come back
    tiles.forEach((el) => (el.style.transition = ""));
  };

  const commit = (d: Drag) => {
    if (d.to !== d.from) flushSync(() => moveRef.current(d.from, d.to));
    reset(d.tiles);
  };

  const velocity = (d: Drag) => {
    const h = d.hist;
    const last = h[h.length - 1];
    const first = h.find((p) => last.t - p.t <= 100) ?? last;
    const dt = (last.t - first.t) / 1000;
    return dt > 0 ? { vx: (last.x - first.x) / dt, vy: (last.y - first.y) / dt } : { vx: 0, vy: 0 };
  };

  const settle = (d: Drag) => {
    const tile = d.tiles[d.from];
    tile.removeAttribute("data-lifted");
    if (reduced()) return commit(d);
    const target = d.rects[d.to];
    const tx = target.left - d.rects[d.from].left;
    const ty = target.top - d.rects[d.from].top;
    const at = place(d);
    const { vx, vy } = velocity(d);
    let x = at.x;
    let y = at.y;
    const draw = () => (tile.style.transform = `translate3d(${x}px, ${y}px, 0)`);
    // X and Y settle on their own springs, each starting at the pointer's speed on that axis.
    const ax: AnimationPlaybackControls = animate(at.x, tx, { ...SPRING, velocity: vx, onUpdate: (v) => ((x = v), draw()) });
    const ay: AnimationPlaybackControls = animate(at.y, ty, { ...SPRING, velocity: vy, onUpdate: (v) => ((y = v), draw()) });
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      settling.current = null;
      ax.stop();
      ay.stop();
      commit(d);
    };
    settling.current = { stop: finish };
    Promise.all([ax.finished, ay.finished]).then(finish, finish);
  };

  const end = (cancel: boolean, byKey = false) => {
    const d = drag.current;
    if (!d) return;
    clearTimeout(d.hold);
    drag.current = null;
    cleanup.current();
    if (!d.lifted) return;
    // The click that follows a drag must not select the chart.
    swallowClick.current = true;
    setTimeout(() => (swallowClick.current = false), 0);
    document.documentElement.removeAttribute("data-grabbing");
    if (cancel) {
      d.to = d.from;
      shift(d);
    }
    // Escape is a keyboard action, so the tile is back at once (no motion on keyboard actions).
    if (byKey) return reset(d.tiles);
    settle(d);
  };

  const lift = (d: Drag) => {
    d.lifted = true;
    d.tiles = tilesNow();
    d.rects = d.tiles.map((el) => el.getBoundingClientRect());
    d.bounds = gridRef.current!.getBoundingClientRect();
    gridRef.current!.setAttribute("data-reordering", "");
    d.tiles.forEach((el, j) => el.setAttribute(j === d.from ? "data-lifted" : "data-shifting", ""));
    d.tiles[d.from].setAttribute("data-active", ""); // stays on top until it has settled
    document.documentElement.setAttribute("data-grabbing", "");
    onLift?.();
    try {
      d.tiles[d.from].setPointerCapture(d.id);
    } catch {
      /* the pointer may already be gone */
    }
    place(d);
  };

  const onPointerDown = (i: number) => (e: RPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || drag.current) return; // one pointer at a time: a second finger is ignored
    if ((e.target as HTMLElement).closest(".kmore, [role=menu]")) return;
    settling.current?.stop(); // grabbing during a settle finishes it at once, then this drag starts
    const p = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    const d: Drag = { from: i, to: i, id: e.pointerId, type: e.pointerType, start: p, hist: [p], lifted: false, tiles: [], rects: [], bounds: new DOMRect(), dx: 0, dy: 0 };
    drag.current = d;
    if (d.type === "touch") d.hold = setTimeout(() => drag.current === d && lift(d), HOLD_MS);

    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== d.id) return;
      d.dx = ev.clientX - d.start.x;
      d.dy = ev.clientY - d.start.y;
      d.hist.push({ x: ev.clientX, y: ev.clientY, t: ev.timeStamp });
      if (d.hist.length > 8) d.hist.shift();
      if (!d.lifted) {
        const far = Math.hypot(d.dx, d.dy);
        if (d.type === "touch") {
          if (far > TOUCH_SLOP) end(true); // it's a scroll, not a hold
          return;
        }
        if (far < MOUSE_SLOP) return;
        lift(d);
      }
      place(d);
      const to = nearest(d);
      if (to !== d.to) {
        d.to = to;
        shift(d);
      }
    };
    const up = (ev: PointerEvent) => ev.pointerId === d.id && end(false);
    const cancel = (ev: PointerEvent) => ev.pointerId === d.id && end(true);
    const key = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && d.lifted) {
        ev.preventDefault();
        end(true, true);
      }
    };
    // Once lifted, a finger drags the tile instead of scrolling the page.
    const touchmove = (ev: TouchEvent) => d.lifted && ev.cancelable && ev.preventDefault();
    const menu = (ev: Event) => d.type === "touch" && ev.preventDefault();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("keydown", key, true);
    window.addEventListener("touchmove", touchmove, { passive: false });
    window.addEventListener("contextmenu", menu);
    cleanup.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("touchmove", touchmove);
      window.removeEventListener("contextmenu", menu);
    };
  };

  /** Put on the grid in the capture phase: drops the click that ends a drag. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return { onPointerDown, onClickCapture };
}
