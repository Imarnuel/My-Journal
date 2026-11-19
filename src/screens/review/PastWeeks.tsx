// Past weeks (01-decisions.md, "Weekly review" and "History in lists"): every traded week, no limit, under
// month headers. This month and last month start open; older months fold to one row that opens.
// Open or closed is kept per month for the visit.
// Markup from src/screens/body/Review.body.tsx.
import { Fragment } from "react";
import { create } from "zustand";
import { monthKey, type PastMonth } from "../../lib/review";

/** Months the user opened or closed, kept for the visit (across weeks and back again). */
export const useMonthsOpen = create<{ open: Record<string, boolean>; set: (key: string, v: boolean) => void }>((set) => ({
  open: {},
  set: (key, v) => set((s) => ({ open: { ...s.open, [key]: v } })),
}));

const rowBtn = { font: "inherit", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "12px 16px", border: 0, borderRadius: "8px", background: "transparent", color: "var(--text-1)", cursor: "pointer", textAlign: "left" } as const;
const weekBtn = { font: "inherit", width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px", padding: "12px 16px", borderRadius: "8px", border: 0, color: "var(--text-1)", cursor: "pointer" } as const;

export function PastWeeks({ months, selected, takeaway, onPick }: { months: PastMonth[]; selected: string | undefined; takeaway: (monday: string) => string; onPick: (monday: string) => void }) {
  const open = useMonthsOpen((s) => s.open);
  const setOpen = useMonthsOpen((s) => s.set);
  return (
    <aside aria-labelledby="pw" style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
      <h2 id="pw" style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 500, color: "var(--text-2)" }}>
        Past weeks
      </h2>
      <ol style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
        {months.map((m) => {
          // The selected week's month opens too, so the highlighted week is always in view (a link to an old week).
          const isOpen = m.key in open ? open[m.key] : m.defaultOpen || (!!selected && monthKey(selected) === m.key);
          return (
            <Fragment key={m.key}>
              {m.yearHead ? (
                <li style={{ listStyle: "none", padding: "16px 16px 4px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-2)" }}>{m.year}</span>
                </li>
              ) : null}
              <li style={{ listStyle: "none" }}>
                <button type="button" aria-expanded={isOpen ? "true" : "false"} onClick={() => setOpen(m.key, !isOpen)} className="kit-opt" style={rowBtn}>
                  <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>{m.name}</span>
                    <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                      {m.sub}
                    </span>
                  </span>
                  <span style={{ color: "var(--text-3)", display: "flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={isOpen ? "M6 9l6 6 6-6" : "M9 6l6 6-6 6"} />
                    </svg>
                  </span>
                </button>
                {isOpen ? (
                  <ol style={{ margin: "0 0 4px 16px", padding: "0 0 0 12px", display: "flex", flexDirection: "column", gap: "2px", borderLeft: "1px solid var(--border-subtle)" }}>
                    {m.weeks.map((w) => {
                      const sel = w.monday === selected;
                      const tk = takeaway(w.monday);
                      return (
                        <li key={w.monday} style={{ listStyle: "none" }}>
                          <button
                            type="button"
                            aria-current={sel ? "true" : undefined}
                            onClick={() => onPick(w.monday)}
                            className={sel ? undefined : "kit-opt"}
                            style={{ ...weekBtn, background: sel ? "var(--surface-pressed)" : "transparent" }}
                          >
                            <span style={{ display: "flex", justifyContent: "space-between", gap: "8px", width: "100%" }}>
                              <span style={{ fontSize: "14px", fontWeight: 500 }}>{w.label}</span>
                              <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                                {w.sub}
                              </span>
                            </span>
                            {tk ? (
                              <span style={{ fontSize: "14px", color: "var(--text-2)" }}>{`“${tk}”`}</span>
                            ) : (
                              <span style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>Not reviewed</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                ) : null}
              </li>
            </Fragment>
          );
        })}
      </ol>
      <p className="lbl" style={{ margin: "4px 0 0", fontSize: "12px", lineHeight: "16px" }}>
        Every week you traded is here. Weeks you didn't trade don't appear.
      </p>
    </aside>
  );
}
