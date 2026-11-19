// The no-charts notice (an MT5 trade with no charts: drop, paste or choose charts; it leaves once a chart is added)
// and "This week's focus" (the latest review's takeaway, linking to that review). Markup from the prototype.
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useStore } from "../../data/store";
import type { Entry } from "../../lib/types";
import { fr, mondayOf, shortDate, tone, weekRange } from "../../lib/format";
import type { WeekFocus } from "../../lib/focus";
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

const Target = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

/**
 * This week's focus, owned by the owner (DESIGN.md): shows their focus for the week, or last week's review
 * takeaway when they haven't set one. Edit it in place, clear it (Undo), or set one when there is none.
 * With no focus there is no card, only a quiet "Set a focus for this week".
 */
export function Focus({ focus }: { focus: WeekFocus | null }) {
  const today = useStore((s) => s.today);
  const own = useStore((s) => s.focus);
  const setFocus = useStore((s) => s.setFocus);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const monday = mondayOf(today);

  const start = (ev: { currentTarget: HTMLElement }) => {
    opener.current = ev.currentTarget;
    setDraft(focus?.text ?? "");
    setEditing(true);
    requestAnimationFrame(() => {
      const f = field.current;
      if (f) {
        f.focus({ preventScroll: true });
        f.setSelectionRange(f.value.length, f.value.length);
      }
    });
  };
  const done = () => {
    setEditing(false);
    requestAnimationFrame(() => (document.getElementById("focus-edit") ?? document.getElementById("focus-set") ?? opener.current)?.focus({ preventScroll: true }));
  };
  const save = () => {
    const text = draft.trim();
    setFocus({ monday, text: text || null });
    done();
  };
  const clear = () => {
    const before = own;
    setFocus({ monday, text: null });
    toast("Focus cleared", () => setFocus(before));
  };

  if (editing)
    return (
      <section aria-labelledby="focus-h" className="card knotice">
        <span className="knote-tile" aria-hidden="true">
          <Target />
        </span>
        <form
          className="knotice-body"
          style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}
          onSubmit={(ev) => {
            ev.preventDefault();
            save();
          }}
        >
          <label id="focus-h" htmlFor="focus-field" style={{ fontSize: "12px", fontWeight: 500, lineHeight: "16px", color: "var(--text-2)" }}>
            This week's focus
          </label>
          <textarea
            id="focus-field"
            ref={field}
            rows={2}
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
                save();
              } else if (ev.key === "Escape") {
                ev.preventDefault();
                done();
              }
            }}
            placeholder="One thing to keep in mind when you trade this week"
            style={{ display: "block", margin: 0, width: "100%", boxSizing: "border-box", border: "1px solid var(--border-strong)", background: "var(--surface-inset)", borderRadius: "8px", fontSize: "14px", lineHeight: "20px", padding: "8px 12px", resize: "vertical", color: "var(--text-1)", maxWidth: "72ch" }}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center", maxWidth: "72ch" }}>
            <button type="submit" className="btn btn-g">
              Save
            </button>
            <button type="button" className="btn btn-q" onClick={done}>
              Cancel
            </button>
            <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px", marginLeft: "auto" }}>{`For ${weekRange(monday)}`}</span>
          </div>
        </form>
      </section>
    );

  if (!focus)
    return (
      <button id="focus-set" type="button" className="btn btn-q kfocus-set" onClick={start}>
        <Target />
        Set a focus for this week
      </button>
    );

  return (
    <section aria-labelledby="focus-h" className="card knotice">
      <span className="knote-tile" aria-hidden="true">
        <Target />
      </span>
      <div className="knotice-body" style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <h2 id="focus-h" style={{ margin: 0, fontSize: "12px", fontWeight: 500, lineHeight: "16px", color: "var(--text-2)" }}>
          This week's focus
        </h2>
        <blockquote style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px", color: "var(--text-1)", maxWidth: "72ch", textWrap: "pretty" }}>{`“${focus.text}”`}</blockquote>
        {focus.source === "review" && focus.reviewMonday ? (
          <Link to={`/review/${focus.reviewMonday}`} className="kcite">
            {focus.from}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </Link>
        ) : (
          <span className="kcite" style={{ cursor: "default" }}>
            {focus.from}
          </span>
        )}
      </div>
      <div className="kfocus-actions">
        <button id="focus-edit" type="button" className="btn btn-q kicon-btn" aria-label="Edit this week's focus" title="Edit" onClick={start}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </button>
        <button type="button" className="btn btn-q kicon-btn" aria-label="Clear this week's focus" title="Clear" onClick={clear}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </section>
  );
}
