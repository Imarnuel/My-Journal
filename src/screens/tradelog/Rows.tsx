// Trade log entries: List view rows and Grid view cards, the row menu (Change date, Exclude / Include in
// stats, Delete) and the drop zone for a trade from MT5 with no charts. Markup from prototype/Main.dc.html.
import { useRef, useState, type ClipboardEvent, type DragEvent, type MouseEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Entry } from "../../lib/types";
import { isImage, rowFacts, thumbs, type Thumbs } from "../../lib/tradelog";
import { returnFocus } from "./FilterMenu";
import { IcAccount, IcBook, IcCalendar, IcChangeDate, IcExcluded, IcImage, IcLink, IcMic, IcMore, IcPlan, IcStats, IcStatus, IcTag, IcTrash } from "./icons";

export type RowActions = {
  menuOpen: boolean;
  dateOpen: boolean;
  toggleMenu: () => void;
  openDate: () => void;
  close: () => void;
  saveDate: (date: string, time: string) => void;
  toggleExcluded: () => void;
  remove: () => void;
  addCharts: (files: File[]) => void;
};

const TONE = { profit: "var(--profit)", loss: "var(--loss)", flat: "var(--text-1)", muted: "var(--text-2)" } as const;
const story = (e: Entry) => `/story/${e.id}`;

const closer = (onClick: () => void) => (
  <button type="button" aria-label="Close menu" tabIndex={-1} onClick={onClick} style={{ position: "fixed", inset: 0, zIndex: 4, background: "transparent", border: 0, padding: 0, cursor: "default" }} />
);

const itemStyle = { font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", color: "var(--text-1)", background: "transparent", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px", cursor: "pointer", width: "100%" } as const;

function DateDialog({ e, a }: { e: Entry; a: RowActions }) {
  const [draft, setDraft] = useState(`${e.date}T${e.time}`);
  // Same rule as the story's date (DESIGN.md › Date and time): no Save, no Escape to undo, no toast. What's set is
  // kept when the picker closes (click away, Enter or Escape alike), then the row moves to its place.
  const save = () => {
    if (!draft || draft === `${e.date}T${e.time}` || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(draft)) return a.close();
    const [d, t] = draft.split("T");
    a.saveDate(d, t.slice(0, 5));
  };
  return (
    <>
      {closer(save)}
      <div role="dialog" aria-label="Change date" className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", display: "flex", flexDirection: "column", boxSizing: "border-box", right: 0, width: "260px", padding: "12px", gap: "8px", transformOrigin: "top right" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--text-2)" }}>
          Date and time
          <input
            type="datetime-local"
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") save();
            }}
            style={{ font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "8px 12px", colorScheme: "dark" }}
          />
        </label>

      </div>
    </>
  );
}

/** The more button and its menu or Change date dialog (one of them at a time). */
function RowMenu({ e, a }: { e: Entry; a: RowActions }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <span style={{ position: "relative", display: "inline-flex" }} onClickCapture={(ev) => (ev.target as HTMLElement).closest(".kmenu") && returnFocus(ref.current)}>
      <button
        ref={ref}
        className="kmore"
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={a.menuOpen || a.dateOpen ? "true" : "false"}
        onClick={a.toggleMenu}
        style={{ width: "32px", height: "32px", border: 0, borderRadius: "var(--r-md)", background: a.menuOpen ? "var(--surface-pressed)" : "transparent", color: "var(--text-1)", cursor: "pointer", fontSize: "16px", letterSpacing: "1px", position: "relative", zIndex: 5, lineHeight: "24px" }}
      >
        <IcMore />
      </button>
      {a.menuOpen ? (
        <>
          {closer(a.close)}
          <div role="menu" aria-label={`${e.pair} actions`} className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box", right: 0, width: "220px", transformOrigin: "top right" }}>
            <button type="button" role="menuitem" aria-haspopup="dialog" className="kit-opt" onClick={a.openDate} style={itemStyle}>
              <span className="mi">
                <IcChangeDate />
                <span>Change date</span>
              </span>
            </button>
            <button type="button" role="menuitem" className="kit-opt" onClick={a.toggleExcluded} style={itemStyle}>
              <span className="mi">
                <IcStats />
                <span>{e.excluded ? "Include in stats" : "Exclude from stats"}</span>
              </span>
            </button>
            <button type="button" role="menuitem" className="kit-opt" onClick={a.remove} style={{ ...itemStyle, color: "var(--loss)" }}>
              <span className="mi">
                <IcTrash />
                <span>Delete</span>
              </span>
            </button>
          </div>
        </>
      ) : null}
      {a.dateOpen ? <DateDialog e={e} a={a} /> : null}
    </span>
  );
}

/** Drop zone that is also a file picker (behaviour kit, "File drops"); paste works while it has focus. */
function DropZone({ a, grid }: { a: RowActions; grid?: boolean }) {
  const [over, setOver] = useState(false);
  const images = (list: FileList | null | undefined) => [...(list ?? [])].filter((f) => f.type.startsWith("image/"));
  const onDrop = (ev: DragEvent) => {
    ev.preventDefault();
    setOver(false);
    const f = images(ev.dataTransfer?.files);
    if (f.length) a.addCharts(f);
  };
  const onPaste = (ev: ClipboardEvent) => {
    const f = images(ev.clipboardData?.files);
    if (f.length) {
      ev.preventDefault();
      a.addCharts(f);
    }
  };
  const base = { minWidth: 0, border: "1.5px dashed var(--border-strong)", borderRadius: "var(--r-md)", color: "var(--text-1)", cursor: "copy", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: 500, background: over ? "var(--surface-hover)" : undefined } as const;
  return (
    <label
      className="kdrop"
      onDragOver={(ev) => {
        ev.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onPaste={onPaste}
      style={grid ? { ...base, position: "relative", aspectRatio: "16 / 9" } : { ...base, position: "relative", flex: 2, aspectRatio: "32 / 9" }}
    >
      <IcImage />
      <span>Drop, paste or choose charts</span>
      {grid ? null : <span style={{ fontSize: "12px", lineHeight: "16px", fontWeight: 400, color: "var(--text-3)" }}>It still counts</span>}
      <input
        type="file"
                title=""
        accept="image/*"
        multiple
        onChange={(ev) => {
          const f = images(ev.target.files);
          if (f.length) a.addCharts(f);
          ev.target.value = "";
        }}
        // The whole zone is the picker: the input covers it, invisible (a click anywhere opens it).
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, padding: 0, opacity: 0, cursor: "pointer" }}
      />
    </label>
  );
}

function Chart({ c }: { c: string }) {
  if (isImage(c)) return <img src={c} alt="Your chart" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "contain", borderRadius: "var(--r-md)" }} />;
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true" style={{ display: "block", width: "100%", height: "auto" }}>
      <use href={`#${c}`} />
    </svg>
  );
}

function DirChip({ e, grid }: { e: Entry; grid?: boolean }) {
  if (e.status === "Analysis")
    return <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--voice)", border: "1px solid var(--voice-border)", borderRadius: "var(--r-xs)", padding: grid ? "0 8px" : "2px 8px", lineHeight: "16px" }}>Analysis</span>;
  if (!e.dir) return null;
  return <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "var(--r-xs)", padding: "2px 8px", lineHeight: "16px" }}>{e.dir}</span>;
}

function Fact({ icon, sr, text, hint }: { icon: ReactNode; sr?: string; text: string; hint?: string }) {
  return (
    <span className="kfact">
      <span className="kfact-ic">{icon}</span>
      {sr ? <span className="ksr">{sr}</span> : null}
      <span className="kfact-t" title={hint ? `${text}: ${hint}` : text}>
        {text}
      </span>
    </span>
  );
}

/**
 * A click anywhere on an entry opens its story (owner's request, DESIGN.md). Clicks on the entry's own
 * controls (links, buttons, the drop zone, menus) keep their own action, and selecting text opens nothing.
 * Keyboard users open it with the pair link, which stays the entry's one tab stop for this.
 */
function useOpenOnClick(to: string) {
  const nav = useNavigate();
  return (ev: MouseEvent<HTMLElement>) => {
    if (ev.defaultPrevented || ev.button !== 0) return;
    const t = ev.target as HTMLElement;
    if (t.closest('a, button, input, label, textarea, select, [role="menu"], [role="dialog"], [role="listbox"], .kmenu')) return;
    if (window.getSelection()?.toString()) return;
    nav(to);
  };
}

/**
 * An entry without charts shows the drop zone, except a very short trade: the prompt above the list already
 * asks one question about it, and it isn't asked for charts anywhere (DESIGN.md › Very short trade).
 */
const asksCharts = (e: Entry, t: Thumbs) => t.n === 0 && !e.shortTrade;

export function ListRow({ e, a }: { e: Entry; a: RowActions }) {
  const f = rowFacts(e);
  const t = thumbs(e);
  const open = useOpenOnClick(story(e));
  return (
    <li className="krow trow" onClick={open} style={{ listStyle: "none", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 32px", padding: "16px 24px", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Link to={story(e)} className="num" style={{ fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
            {e.pair}
          </Link>
          <DirChip e={e} />
          <span className="num" style={{ fontSize: "14px", fontWeight: 500, color: TONE[f.resTone] }}>
            {f.res}
          </span>
        </div>
        <span className="kfacts">
          <Fact icon={<IcCalendar s={14} />} sr="Date:" text={f.when} />
          <Fact icon={<IcStatus s={14} />} sr="Status:" text={f.statusLabel} hint={f.statusHint} />
          {f.hasAcct ? <Fact icon={<IcAccount />} sr="Account:" text={f.acct} /> : null}
          {f.mt5 ? <Fact icon={<IcLink />} sr="From:" text={f.mt5} /> : null}
          {e.excluded ? <Fact icon={<IcExcluded />} text="Excluded from stats" /> : null}
        </span>
        {f.facts2 ? (
          <span className="kfacts kfacts-2">
            <Fact icon={<IcBook s={14} />} sr="Setup:" text={e.setup || "Unsorted"} />
            {f.plan ? <Fact icon={<IcPlan />} sr="Plan:" text={f.plan} /> : null}
            {e.tags.length ? <Fact icon={<IcTag s={14} />} sr="Tags:" text={e.tags.join(", ")} /> : null}
          </span>
        ) : f.hint ? (
          <span className="meta" style={{ color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.hint}>
            {f.hint}
          </span>
        ) : null}
      </div>
      <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", gap: "8px", alignItems: "center", position: "relative" }}>
        {asksCharts(e, t) ? <DropZone a={a} /> : null}
        {t.list.map((c, i) => (
          <div key={`${i}-${c}`} className="chart" style={{ flex: 1, minWidth: 0 }}>
            <Chart c={c} />
          </div>
        ))}
        {t.list.length === 1 ? <div aria-hidden="true" style={{ flex: 1, minWidth: 0 }} /> : null}
        <span style={{ flex: "none", fontSize: "12px", color: "var(--text-3)", width: "56px", textAlign: "center", lineHeight: "16px" }}>{t.more}</span>
      </div>
      <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", minWidth: "170px" }}>
        {f.noNote ? (
          <Link to={story(e)} className="btn btn-q" style={{ padding: "0 12px", fontWeight: 500 }} aria-label={`Add a note to ${e.pair}, ${f.when}`}>
            <IcMic />
            Add a note
          </Link>
        ) : null}
        <RowMenu e={e} a={a} />
      </div>
    </li>
  );
}

export function GridCard({ e, a }: { e: Entry; a: RowActions }) {
  const f = rowFacts(e);
  const t = thumbs(e);
  const open = useOpenOnClick(story(e));
  return (
    <li className="card tcard" onClick={open} style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", padding: "12px", borderRadius: "var(--r-card)", minWidth: 0 }}>
      {asksCharts(e, t) ? <DropZone a={a} grid /> : null}
      {t.grid ? (
        <span className="chart" style={{ display: "block" }}>
          <Chart c={t.grid} />
        </span>
      ) : null}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <Link to={story(e)} style={{ fontSize: "14px", fontWeight: 500, textDecoration: "none", color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {e.pair}
          </Link>
          <DirChip e={e} grid />
        </span>
        <span className="num" style={{ fontSize: "14px", fontWeight: 500, color: TONE[f.resTone], whiteSpace: "nowrap" }}>
          {f.gres}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <span style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
          <span className="kfact kfact-s">
            <span className="kfact-ic">
              <IcCalendar s={14} />
            </span>
            <span className="ksr">Date:</span>
            <span className="kfact-t" title={f.when}>
              {f.when}
            </span>
          </span>
          {e.excluded ? (
            <span className="kfact kfact-s">
              <span className="kfact-ic">
                <IcExcluded />
              </span>
              <span className="kfact-t" title="Excluded from stats">
                Excluded from stats
              </span>
            </span>
          ) : null}
          {f.gridSetup ? (
            <span className="kfact kfact-s">
              <span className="kfact-ic">
                <IcBook s={14} />
              </span>
              <span className="ksr">Setup:</span>
              <span className="kfact-t" title={f.gridLine}>
                {f.gridLine}
              </span>
            </span>
          ) : (
            <span className="lbl" style={{ fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "16px" }}>
              {f.gridLine}
            </span>
          )}
        </span>
        <RowMenu e={e} a={a} />
      </div>
    </li>
  );
}
