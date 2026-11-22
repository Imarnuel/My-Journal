// A story's chart, full screen (the owner, 2026-11-22: "I should be able to open the image on click"). Opens from
// the large chart; the chart fills the screen over a dark backdrop with "2 of 5" under it. ← → (or the side
// buttons) move between charts, Escape, the close button or a click outside the chart closes, and focus goes
// back to the chart. DESIGN.md › Chart viewer.
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = { charts: string[]; index: number; isImage: (c: string) => boolean; onIndex: (i: number) => void; onClose: () => void };

const icon = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export function ChartViewer({ charts, index, isImage, onIndex, onClose }: Props) {
  const close = useRef<HTMLButtonElement>(null);
  const c = charts[index];
  const many = charts.length > 1;
  const go = (d: number) => onIndex((index + d + charts.length) % charts.length);
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    close.current?.focus({ preventScroll: true });
    // The page underneath doesn't scroll while the chart is open.
    const html = document.documentElement;
    const was = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") (e.preventDefault(), e.stopPropagation(), onClose());
      else if (many && (e.key === "ArrowLeft" || e.key === "ArrowRight")) (e.preventDefault(), e.stopPropagation(), goRef.current(e.key === "ArrowLeft" ? -1 : 1));
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      html.style.overflow = was;
      back?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`Chart ${index + 1} of ${charts.length}`} className="kviewer" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button ref={close} type="button" className="kviewer-btn kviewer-close" aria-label="Close" onClick={onClose}>
        <svg {...icon}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      {many ? (
        <button type="button" className="kviewer-btn kviewer-prev" aria-label="Previous chart" onClick={() => go(-1)}>
          <svg {...icon}>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      ) : null}
      <figure className="kviewer-fig" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {isImage(c) ? (
          <img key={c} src={c} alt={`Chart ${index + 1} of ${charts.length}`} className="kviewer-img" />
        ) : (
          <svg key={c} viewBox="0 0 320 180" role="img" aria-label={`Chart ${index + 1} of ${charts.length}`} className="kviewer-img">
            <use href={`#${c}`} />
          </svg>
        )}
        {many ? <figcaption className="kviewer-count">{`${index + 1} of ${charts.length}`}</figcaption> : null}
      </figure>
      {many ? (
        <button type="button" className="kviewer-btn kviewer-next" aria-label="Next chart" onClick={() => go(1)}>
          <svg {...icon}>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      ) : null}
    </div>,
    document.querySelector(".app") ?? document.body,
  );
}
