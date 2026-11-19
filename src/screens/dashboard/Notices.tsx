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
          initial={rm ? { opacity: 0 } : { opacity: 0, height: 0, marginBottom: -32 }}
          animate={rm ? { opacity: 1 } : { opacity: 1, height: "auto", marginBottom: 0 }}
          exit={rm ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, height: 0, marginBottom: -32 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: "hidden" }}
        >
          <section
            aria-label="Trade without charts"
            style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 24px", padding: "16px 24px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface-2)" }}
          >
            <div className="knote" style={{ flex: "1 1 380px", minWidth: "0", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span className="knote-ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2.5" />
                  <circle cx="9" cy="9" r="1.8" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </span>
              <h2 style={{ margin: "0", fontSize: "14px", fontWeight: "500", lineHeight: "20px" }}>{trades.length === 1 ? "1 trade has no charts yet" : `${plural(trades.length, "trade")} have no charts yet`}</h2>
              <span className="meta">
                {`${e.pair} · ${e.dir ?? ""} · ${shortDate(e.date)} · ${e.account} ·`}{" "}
                <span className="num" style={{ color: tone(e.r), fontWeight: "500" }}>
                  {fr(e.r ?? 0)}
                </span>{" "}
                from MT5. No screenshot? Scroll back on your chart and take one now. It still counts.
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label
                onDragOver={(ev) => {
                  ev.preventDefault();
                  setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={drop}
                style={{
                  position: "relative", font: "inherit", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500", color: "var(--text-1)",
                  border: "1.5px dashed var(--border-strong)", borderRadius: "8px", padding: "0 16px", minHeight: "32px", cursor: "copy",
                  background: over ? "var(--surface-inset)" : undefined,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2.5" />
                  <circle cx="9" cy="9" r="1.8" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                Drop, paste or choose charts
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(ev) => {
                    add(images(ev.target.files));
                    ev.target.value = "";
                  }}
                  style={{ position: "absolute", width: "1px", height: "1px", opacity: "0" }}
                />
              </label>
              <Link to="/log" className="btn btn-q">
                Trade log
              </Link>
            </div>
          </section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Focus({ focus }: { focus: { monday: string; takeaway: string; from: string } | null }) {
  if (!focus) return null;
  return (
    <section aria-label="This week's focus" className="card" style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 12px", padding: "16px 16px", borderRadius: "12px" }}>
      <span className="lbl" style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", lineHeight: "16px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
        This week's focus
      </span>
      <span style={{ fontSize: "14px", color: "var(--text-1)" }}>{`“${focus.takeaway}”`}</span>
      <Link to={`/review/${focus.monday}`} className="lbl" style={{ fontSize: "12px", color: "var(--text-2)", marginLeft: "auto", lineHeight: "16px" }}>
        {focus.from}
      </Link>
    </section>
  );
}
