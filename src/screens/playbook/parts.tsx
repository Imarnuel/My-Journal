// Small pieces the three playbook screens share.
import { PLAYBOOK_SPRITE } from "./sprite.data";

/** The playbook's own placeholder drawings (higher-timeframe strip, the suggested stories). */
export function PlaybookSprite() {
  return <div aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: PLAYBOOK_SPRITE }} />;
}

/** The early-signal dot. */
export function Dot() {
  return <span aria-hidden="true" style={{ flex: "none", width: "7px", height: "7px", borderRadius: "3px", background: "var(--attention)" }} />;
}

/** A placeholder chart drawing, or an uploaded chart image. */
export function ChartArt({ src, label }: { src: string | null | undefined; label?: string }) {
  if (src && /^(blob:|data:|https?:|\/)/.test(src))
    return <img src={src} alt={label ?? ""} style={{ display: "block", width: "100%", aspectRatio: "320 / 180", objectFit: "contain" }} />;
  return (
    <svg viewBox="0 0 320 180" {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })} style={{ display: "block", width: "100%", height: "auto" }}>
      {src ? <use href={`#${src}`} /> : null}
    </svg>
  );
}

export const Sparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </svg>
);

export const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const ArchiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="5" rx="1.5" />
    <path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
    <path d="M10 13h4" />
  </svg>
);

export const PlusIcon = ({ w = 1.8 }: { w?: number }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const backLink = { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-2)", textDecoration: "none", alignSelf: "flex-start", minHeight: "32px" } as const;
export const h1Style = { margin: 0, lineHeight: "32px" } as const;
export const groupHead = { fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-2)", lineHeight: "16px" } as const;
export const closeMenuBtn = { position: "fixed", inset: 0, zIndex: 4, background: "transparent", border: 0, padding: 0, cursor: "default" } as const;
