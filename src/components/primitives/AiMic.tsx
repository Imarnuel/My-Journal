// The voice note mark (DESIGN.md › Voice note: the AI mic): a filled mic with a small sparkle cut into its top-right
// corner. The mic says "record", the sparkle says the note is read for you. Used wherever a voice note is recorded.
// Placement: in a circle (Talk it through) the mic sits just left of centre and the sparkle to its upper right, so
// the pair reads balanced: centring the pair left the mic too far left, centring the mic left the sparkle too close
// to the edge (the owner, 2026-11-23: "it's not optically aligned", then "the after is too close to the right"). The
// mic sits a hair below centre because its solid top reads high. Beside a label (Re-record, Add a note) the whole
// mark fits its box, so the sparkle never crowds the text.
import { useId } from "react";

const sparkle = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}Q${cx + r * 0.16} ${cy - r * 0.16} ${cx + r} ${cy}Q${cx + r * 0.16} ${cy + r * 0.16} ${cx} ${cy + r}Q${cx - r * 0.16} ${cy + r * 0.16} ${cx - r} ${cy}Q${cx - r * 0.16} ${cy - r * 0.16} ${cx} ${cy - r}Z`;
const CUT = sparkle(19.6, 4.4, 6.2);
const STAR = sparkle(19.6, 4.4, 4.2);

export function AiMic({ size = 16, inCircle = false }: { size?: number; inCircle?: boolean }) {
  const id = `aimic${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none", overflow: "visible" }}>
      <defs>
        <mask id={id}>
          <rect x="-2" y="-2" width="28" height="28" fill="white" />
          <path d={CUT} fill="black" />
        </mask>
      </defs>
      <g transform={inCircle ? "translate(1.1 0.8)" : "translate(0.1 1.1)"}>
        <g mask={`url(#${id})`}>
          <rect x="6.5" y="2" width="7" height="12.5" rx="3.5" fill="currentColor" />
          <path d="M3 11a7 7 0 0 0 14 0M10 18v3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
        <path d={STAR} fill="currentColor" />
      </g>
    </svg>
  );
}
