// Trade log entries: List view rows and Grid view cards, the row menu (Change date, Exclude / Include in
// stats, Delete) and the drop zone for a trade from MT5 with no charts. Markup from prototype/Main.dc.html.
import { useState, type ClipboardEvent, type DragEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Entry } from "../../lib/types";
import { isImage, rowFacts, thumbs } from "../../lib/tradelog";
import { IcAccount, IcBook, IcCalendar, IcChangeDate, IcExcluded, IcImage, IcMic, IcMore, IcPlan, IcStats, IcStatus, IcTag, IcTrash } from "./icons";

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

const itemStyle = { font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", color: "var(--text-1)", background: "transparent", border: 0, borderRadius: "8px", padding: "0 12px", minHeight: "32px", cursor: "pointer", width: "100%" } as const;

function DateDialog({ e, a }: { e: Entry; a: RowActions }) {
  const [draft, setDraft] = useState(`${e.date}T${e.time}`);
  const save = () => {
    if (!draft) return;
    const [d, t] = draft.split("T");
    a.saveDate(d, t.slice(0, 5));
  };
  return (
    <>
      {closer(a.close)}
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
            style={{ font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", colorScheme: "dark" }}
          />
        </label>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-g" onClick={a.close} style={{ minHeight: "32px" }}>
            Cancel
          </button>
          <button type="button" className="btn btn-p" onClick={save} style={{ minHeight: "32px" }}>
            Save
          </button>
        </div>
      </div>
    </>
  );
}

/** The more button and its menu or Change date dialog (one of them at a time). */
function RowMenu({ e, a }: { e: Entry; a: RowActions }) {
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        className="kmore"
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={a.menuOpen || a.dateOpen ? "true" : "false"}
        onClick={a.toggleMenu}
        style={{ width: "32px", height: "32px", border: 0, borderRadius: "8px", background: a.menuOpen ? "var(--surface-pressed)" : "transparent", color: "var(--text-1)", cursor: "pointer", fontSize: "16px", letterSpacing: "1px", position: "relative", zIndex: 5, lineHeight: "24px" }}
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
  const base = { minWidth: 0, border: "1.5px dashed var(--border-strong)", borderRadius: "8px", color: "var(--text-1)", cursor: "copy", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: 500, background: over ? "var(--surface-hover)" : undefined } as const;
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
      style={grid ? { ...base, position: "relative", aspectRatio: "16 / 9" } : { ...base, flex: 2, aspectRatio: "32 / 9" }}
    >
      <IcImage />
      <span>Drop, paste or choose charts</span>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(ev) => {
          const f = images(ev.target.files);
          if (f.length) a.addCharts(f);
          ev.target.value = "";
        }}
        style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }}
      />
    </label>
  );
}

function Chart({ c }: { c: string }) {
  if (isImage(c)) return <img src={c} alt="Your chart" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "contain", borderRadius: "8px" }} />;
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true" style={{ display: "block", width: "100%", height: "auto" }}>
      <use href={`#${c}`} />
    </svg>
  );
}

function DirChip({ e, grid }: { e: Entry; grid?: boolean }) {
  if (e.status === "Analysis")
    return <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--voice)", border: "1px solid var(--voice-border)", borderRadius: "6px", padding: grid ? "0 8px" : "2px 8px", lineHeight: "16px" }}>Analysis</span>;
  if (!e.dir) return null;
  return <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "6px", padding: "2px 8px", lineHeight: "16px" }}>{e.dir}</span>;
}

function Fact({ icon, sr, text }: { icon: ReactNode; sr?: string; text: string }) {
  return (
    <span className="kfact">
      <span className="kfact-ic">{icon}</span>
      {sr ? <span className="ksr">{sr}</span> : null}
      <span className="kfact-t" title={text}>
        {text}
      </span>
    </span>
  );
}

export function ListRow({ e, a }: { e: Entry; a: RowActions }) {
  const f = rowFacts(e);
  const t = thumbs(e);
  return (
    <li style={{ listStyle: "none", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 32px", padding: "16px 24px", borderTop: "1px solid var(--border-subtle)" }}>
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
          <Fact icon={<IcStatus s={14} />} sr="Status:" text={f.statusLabel} />
          {f.hasAcct ? <Fact icon={<IcAccount />} sr="Account:" text={f.acct} /> : null}
          {e.excluded ? <Fact icon={<IcExcluded />} text="Excluded from stats" /> : null}
        </span>
        {f.facts2 ? (
          <span className="kfacts kfacts-2">
            <Fact icon={<IcBook s={14} />} sr="Setup:" text={e.setup || "Unsorted"} />
            {f.plan ? <Fact icon={<IcPlan />} sr="Plan:" text={f.plan} /> : null}
            {e.tags.length ? <Fact icon={<IcTag s={14} />} sr="Tags:" text={e.tags.join(", ")} /> : null}
          </span>
        ) : (
          <span className="meta" style={{ color: "var(--text-3)" }}>
            {f.hint}
          </span>
        )}
      </div>
      <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", gap: "8px", alignItems: "center", position: "relative" }}>
        {t.n === 0 ? <DropZone a={a} /> : null}
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
  return (
    <li className="card" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", padding: "12px", borderRadius: "12px", minWidth: 0 }}>
      {t.n === 0 ? <DropZone a={a} grid /> : null}
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
