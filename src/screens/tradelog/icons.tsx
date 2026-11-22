// The Trade log's inline icons, exactly as drawn in prototype/Main.dc.html (Lucide shapes, 16px / 14px facts).
const P = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const IcCalendar = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
export const IcPair = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" />
  </svg>
);
export const IcBook = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z" />
    <path d="M5 17a3 3 0 0 1 3-3h11" />
  </svg>
);
export const IcTag = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.2 6.2a1.5 1.5 0 0 1-2.1 0z" />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);
/** Lucide triangle-alert: mistakes (DESIGN.md › Mistakes). */
export const IcMistake = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);
export const IcDir = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <path d="M8 20V4L4.5 7.5M16 4v16l3.5-3.5" />
  </svg>
);
export const IcStatus = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.2l2.4 2.4 4.6-5" />
  </svg>
);
export const IcSort = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <path d="M4 6h16M4 12h11M4 18h6" />
  </svg>
);
export const IcChev = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" {...P}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
export const IcCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="2.4" {...P}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
export const IcPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);
export const IcList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1" />
    <circle cx="3.5" cy="12" r="1" />
    <circle cx="3.5" cy="18" r="1" />
  </svg>
);
export const IcGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </svg>
);
export const IcClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IcAccount = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <rect x="2.5" y="5.5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19" />
  </svg>
);
export const IcExcluded = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6 6l12 12" />
  </svg>
);
export const IcPlan = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3h6v1" />
    <path d="M9 12.5l2 2 4-4.5" />
  </svg>
);
export const IcImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <circle cx="9" cy="9" r="1.8" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
export const IcMic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" {...P}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v4" />
  </svg>
);
export const IcMore = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);
export const IcChangeDate = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
    <path d="M3 9.5h18" />
    <path d="M8 2.5v4" />
    <path d="M16 2.5v4" />
  </svg>
);
export const IcStats = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-4 3 3 5-6" />
  </svg>
);
export const IcTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.8" {...P}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
  </svg>
);

export const IcLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);
