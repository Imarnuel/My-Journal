// The no-charts notice (an MT5 trade with no charts: drop, paste or choose charts; it leaves once a chart is added)
// and "This week's focus" (the latest review's takeaway, linking to that review). Markup from the prototype.
import { useEffect, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "../../data/store";
import type { Entry } from "../../lib/types";
import { fr, shortDate, tone } from "../../lib/format";
import { plural } from "../../lib/dashboard";
import { toast } from "../../components/primitives/toast";
import { reducedMotion } from "../../components/charts/tween";

const images = (files: FileList | File[] | null | undefined) => [...(files ?? [])].filter((f) => f.type.startsWith("image/"));

/** Adds the chosen images to the trade at once, with Undo restoring its charts exactly. */
function useAddCharts(e: Entry | undefined) {
  const updateEntry = useStore((s) => s.updateEntry);
  return (files: File[]) => {
    if (!e || !files.length) return;
    const before = { charts: e.charts, chartList: e.chartList };
    const urls = files.map((f) => URL.createObjectURL(f));
    updateEntry(e.id, { charts: e.charts + urls.length, chartList: [...(e.chartList ?? []), ...urls] });
    toast(`Chart added to ${e.pair}`, () => updateEntry(e.id, before));
  };
}

export function NoChartsNotice({ trades }: { trades: Entry[] }) {
  const e = trades[0];
  const add = useAddCharts(e);
  const [over, setOver] = useState(false);

  // Paste: while the notice shows, an image pasted on the page goes to its trade.
  useEffect(() => {
    if (!e) return;
    const onPaste = (ev: ClipboardEvent) => {
      const t = ev.target as HTMLElement | null;
      if (t?.closest?.("input, textarea, [contenteditable]")) return;
      const files = images(ev.clipboardData?.files);
      if (!files.length) return;
      ev.preventDefault();
      add(files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  });

  const drop = (ev: DragEvent) => {
    ev.preventDefault();
    setOver(false);
    add(images(ev.dataTransfer?.files));
  };
  const rm = reducedMotion();

  return (
    <AnimatePresence initial={false}>
      {e ? (
        <motion.div
          key="nocharts"
          initial={rm ? { opacity: 0 } : { opacity: 0, height: 0, marginBottom: -16 }}
          animate={rm ? { opacity: 1 } : { opacity: 1, height: "auto", marginBottom: 0 }}
          exit={rm ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, height: 0, marginBottom: -16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: "hidden", padding: "1px 1px 2px", margin: "-1px -1px -2px" }}
        >
          {/* Redesigned (DESIGN.md, Dashboard notices): icon tile, then the title, the trade's facts on their own
              line and the instruction quieter; on the right the drop slot, drawn where the chart goes, and a
              quiet link. */}
          <section aria-labelledby="nochart-h" className="card knotice">
            <span className="knote-tile" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2.5" />
                <circle cx="9" cy="9" r="1.8" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </span>
            <div className="knotice-body" style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2 id="nochart-h" style={{ margin: 0, fontSize: "14px", fontWeight: 500, lineHeight: "20px" }}>
                {trades.length === 1 ? "1 trade has no charts yet" : `${plural(trades.length, "trade")} have no charts yet`}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px", fontSize: "14px", lineHeight: "20px", color: "var(--text-2)" }}>
                <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{e.pair}</span>
                {e.dir ? <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0 8px", lineHeight: "18px" }}>{e.dir}</span> : null}
                <span className="num" style={{ color: tone(e.r), fontWeight: 500 }}>
                  {fr(e.r ?? 0)}
                </span>
                <span aria-hidden="true" style={{ color: "var(--text-disabled)" }}>·</span>
                <span>{`${shortDate(e.date)}, ${e.time}`}</span>
                <span aria-hidden="true" style={{ color: "var(--text-disabled)" }}>·</span>
                <span>{e.account}</span>
                <span aria-hidden="true" style={{ color: "var(--text-disabled)" }}>·</span>
                <span>from MT5</span>
              </div>
              <p style={{ margin: 0, fontSize: "14px", lineHeight: "20px", color: "var(--text-3)" }}>No screenshot? Scroll back on your chart and take one now. It still counts.</p>
            </div>
            <label
              className={over ? "kslot over" : "kslot"}
              onDragOver={(ev) => {
                ev.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={drop}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2.5" />
                <circle cx="9" cy="9" r="1.8" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span>Add chart</span>
              <input
                type="file"
                accept="image/*"
                multiple
                aria-label={`Drop, paste or choose charts for ${e.pair}, ${shortDate(e.date)}`}
                onChange={(ev) => {
                  add(images(ev.target.files));
                  ev.target.value = "";
                }}
              />
            </label>
            <Link to="/log" className="btn btn-q knotice-link">
              Trade log
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </Link>
          </section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Focus({ focus }: { focus: { monday: string; takeaway: string; from: string } | null }) {
  if (!focus) return null;
  // Redesigned (DESIGN.md, Dashboard notices): a small label on top, the owner's own words as the content,
  // and where they were written as an attribution link underneath.
  return (
    <section aria-labelledby="focus-h" className="card knotice">
      <span className="knote-tile" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      </span>
      <div className="knotice-body" style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <h2 id="focus-h" style={{ margin: 0, fontSize: "12px", fontWeight: 500, lineHeight: "16px", color: "var(--text-2)" }}>
          This week's focus
        </h2>
        <blockquote style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px", color: "var(--text-1)", maxWidth: "72ch", textWrap: "pretty" }}>{`“${focus.takeaway}”`}</blockquote>
        <Link to={`/review/${focus.monday}`} className="kcite">
          {focus.from}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
