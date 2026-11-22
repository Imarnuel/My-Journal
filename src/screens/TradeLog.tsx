// Frames 03 and 04 · Trade log: one list of everything recorded, List and Grid views (view kept in the URL,
// `/log?view=grid`), compact filter dropdowns with counts, sort, batches of 12, the row menu with Undo, the
// very short trade prompt, and the frame-16 states that belong here. Markup from prototype/Main.dc.html.
import { entryName } from "../lib/format";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Shell } from "../app/Shell";
import { slug } from "../app/routes";
import { useStore } from "../data/store";
import type { Entry } from "../lib/types";
import { periodStart } from "../lib/calc";
import {
  anyFilter,
  applyFilters,
  BATCH,
  customLabel,
  DATE_PRESETS,
  DIRS,
  entriesText,
  NO_FILTERS,
  optionCount,
  pairsOf,
  setupOf,
  shortTradeLine,
  SORTS,
  sortEntries,
  STATUSES,
  valuesBy,
  type FilterKey,
  type Filters,
} from "../lib/tradelog";
import { toast, type ToastKind } from "../components/primitives/toast";
import { useMenu } from "./useKit";
import { sessionOf } from "../lib/story";
import { DEFAULT_SESSIONS } from "../data/settings";
import { FilterMenu, type Opt } from "./tradelog/FilterMenu";
import { GridCard, ListRow, type RowActions } from "./tradelog/Rows";
import { SHORT_SECONDS, useTradeLog } from "./tradelog/state";
import { IcBook, IcCalendar, IcClock, IcDir, IcGrid, IcList, IcPair, IcPlus, IcSort, IcStatus, IcTag } from "./tradelog/icons";

const segStyle = (on: boolean) =>
  ({ font: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: 500, color: on ? "var(--inverse-fg)" : "var(--text-2)", background: on ? "var(--inverse-bg)" : "transparent", border: 0, borderRadius: "var(--r-sm)", padding: "0 12px", minHeight: "32px", cursor: "pointer" }) as const;

const pickInput = { font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "8px 8px", colorScheme: "dark" } as const;
const pickLabel = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-2)" } as const;

/** Frame 16 card markup (prototype/States.dc.html). */
const stateCard = { padding: "24px", borderRadius: "var(--r-card)", display: "flex", flexDirection: "column", gap: "12px", minHeight: "150px", boxSizing: "border-box" } as const;

export function TradeLog() {
  const menu = useMenu<string>();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "grid" ? "grid" : "list";
  const setView = (v: "list" | "grid") => {
    const next = new URLSearchParams(params);
    if (v === "grid") next.set("view", "grid");
    else next.delete("view");
    setParams(next, { replace: true });
  };

  const entries = useStore((s) => s.entries);
  const accounts = useStore((s) => s.accounts);
  const today = useStore((s) => s.today);
  const updateEntry = useStore((s) => s.updateEntry);
  const removeEntry = useStore((s) => s.removeEntry);
  const restoreEntry = useStore((s) => s.restoreEntry);
  const { filters: f, sort, limit, setFilters, setSort, setLimit } = useTradeLog();
  // "Show older entries": the rows it adds arrive together as one block (DESIGN.md › Motion); a new filter or
  // sort starts the list over, so nothing else animates.
  const [grownFrom, setGrownFrom] = useState<number | null>(null);
  useEffect(() => {
    if (limit === BATCH) setGrownFrom(null);
  }, [limit]);

  const [picking, setPicking] = useState(false);
  const [pFrom, setPFrom] = useState("");
  const [pTo, setPTo] = useState("");

  const act = (msg: string, undo?: () => void, kind?: ToastKind) => {
    menu.close();
    toast(msg, undo, kind);
  };

  // ---- Filters ----
  const setF = (k: FilterKey, v: string | null) => {
    setFilters({ ...f, [k]: v } as Filters);
    menu.close();
  };
  const mk = (k: FilterKey, values: string[], allLabel: string): Opt[] =>
    [{ v: k === "date" ? "All time" : null, label: allLabel }, ...values.map((v) => ({ v: v as string | null, label: v }))].map((o) => {
      const c = optionCount(entries, f, today, k, o.v);
      const sel = o.v === f[k];
      return { label: o.label, count: String(c), dim: !c && !sel, sel, pick: () => setF(k, o.v) };
    });
  const isActive = (k: FilterKey) => (k === "date" ? f.date !== "All time" : f[k] != null);
  const toggle = (k: string) => {
    setPicking(false);
    menu.toggle(k);
  };

  const dateLabel = f.date === "Custom" ? customLabel(f.from, f.to, today) : f.date;
  const dateOpts = mk("date", DATE_PRESETS.slice(1), "All time");
  dateOpts.push({
    label: "Pick dates…",
    count: "",
    dim: false,
    sel: f.date === "Custom",
    pick: () => {
      setPicking(true);
      setPFrom(f.from || periodStart("month", today));
      setPTo(f.to || today);
    },
  });
  const applyDates = () => {
    setFilters({ ...f, date: "Custom", from: pFrom || null, to: pTo || null });
    setPicking(false);
    menu.close();
  };

  const FILTERS: { k: FilterKey; name: string; icon: ReactNode; width: number; all: string; values: string[] }[] = [
    { k: "pair", name: "Pair", icon: <IcPair />, width: 220, all: "Any pair", values: valuesBy(entries, pairsOf) },
    { k: "setup", name: "Setup", icon: <IcBook />, width: 260, all: "Any setup", values: valuesBy(entries, (e) => [setupOf(e)]) },
    { k: "tag", name: "Tags", icon: <IcTag />, width: 260, all: "Any tag", values: valuesBy(entries, (e) => e.tags) },
    { k: "dir", name: "Direction", icon: <IcDir />, width: 180, all: "Long and short", values: [...DIRS] },
    { k: "status", name: "Status", icon: <IcStatus />, width: 220, all: "Any status", values: STATUSES },
  ];

  const anyF = anyFilter(f);
  const rows = sortEntries(applyFilters(entries, f, today), sort);
  const shown = rows.slice(0, limit);

  // ---- Row actions ----
  const actions = (e: Entry): RowActions => ({
    menuOpen: menu.isOpen("m" + e.id),
    dateOpen: menu.isOpen("d" + e.id),
    toggleMenu: () => menu.toggle("m" + e.id),
    openDate: () => menu.open("d" + e.id),
    close: menu.close,
    // A new date applies when the picker closes, quietly: the row simply moves to its place (the owner,
    // 2026-11-22: "no escape, no saving", "no toast"). The session follows the time, as on the story.
    saveDate: (date, time) => {
      const sessions = (useStore.getState().settings.sessions as [string, string, string][] | undefined) ?? DEFAULT_SESSIONS;
      updateEntry(e.id, { date, time, session: sessionOf(time, sessions) });
      menu.close();
    },
    toggleExcluded: () => {
      const was = e.excluded;
      updateEntry(e.id, { excluded: !was });
      act(was ? `${e.pair} is back in your stats` : `${e.pair} left out of your stats`, () => updateEntry(e.id, { excluded: was }), was ? "restored" : "hidden");
    },
    remove: () => {
      const index = useStore.getState().entries.findIndex((x) => x.id === e.id);
      removeEntry(e.id);
      act(`${entryName(e)} deleted`, () => restoreEntry(e, index), "deleted");
    },
    addCharts: (files) => {
      const urls = files.map((file) => URL.createObjectURL(file));
      const list = [...(e.chartList ?? []), ...urls];
      updateEntry(e.id, { chartList: list, charts: list.length });
      act(urls.length === 1 ? `Chart added to ${e.pair}` : `${urls.length} charts added to ${e.pair}`, undefined, "added");
    },
  });

  // ---- The very short trade prompt (one at a time, above the list, hidden while filtering) ----
  const asking = entries.find((e) => e.shortTrade === "ask" && SHORT_SECONDS[e.id] != null);
  const answer = (e: Entry, a: "counted" | "left-out") => {
    const was = { shortTrade: e.shortTrade, excluded: e.excluded };
    const patch = { shortTrade: a, excluded: a === "left-out" ? true : e.excluded };
    const apply = (p: Partial<Entry>) => updateEntry(e.id, p);
    apply(patch);
    act(a === "counted" ? `${e.pair} counts in your stats` : `${e.pair} left out of your stats`, () => apply(was), a === "counted" ? "done" : "hidden");
  };

  // ---- Frame 16: an account that stopped syncing (real accounts only; see report) ----
  const stopped = accounts.filter((a) => a.source === "mt5-reconnect" && !a.practice && !a.archived);
  const mt5 = accounts.some((a) => a.source === "mt5" && !a.archived);

  return (
    <Shell active="log">
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          <h1 style={{ margin: 0, lineHeight: "32px" }}>Trade log</h1>
          <p className="meta" style={{ margin: 0 }}>
            {`Everything you've recorded, whenever you recorded it${mt5 ? " · MT5 synced 2 min ago" : ""}`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/new" className="btn btn-p">
            <IcPlus />
            New chart story
          </Link>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="card" style={{ ...stateCard, ["--card-fill" as string]: "var(--surface-2)" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>Your log starts here</h2>
          <p className="meta" style={{ margin: 0 }}>
            Record a trade, a watched setup or your analysis whenever it suits you. It all lands here, newest first.
          </p>
          {/* No second "New chart story" here: the header's button is the one action (first ui-polish audit). */}
        </div>
      ) : (
        <>
          <div className="ksticky" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div role="group" aria-label="Filter" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <FilterMenu
                name="Date"
                icon={<IcCalendar />}
                label={dateLabel}
                aria={`Date: ${dateLabel}`}
                active={isActive("date")}
                open={menu.isOpen("date")}
                onToggle={() => toggle("date")}
                onClose={menu.close}
                opts={dateOpts}
                width={240}
              >
                {picking ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 8px 8px", borderTop: "1px solid var(--border-subtle)", marginTop: "4px" }}>
                    <label style={pickLabel}>
                      From
                      <input type="date" value={pFrom} onChange={(ev) => setPFrom(ev.target.value)} style={pickInput} />
                    </label>
                    <label style={pickLabel}>
                      To
                      <input type="date" value={pTo} onChange={(ev) => setPTo(ev.target.value)} style={pickInput} />
                    </label>
                    <button type="button" className="btn btn-p" onClick={applyDates} style={{ minHeight: "32px" }}>
                      Apply
                    </button>
                  </div>
                ) : null}
              </FilterMenu>
              {FILTERS.map((x) => {
                const cur = f[x.k];
                return (
                  <FilterMenu
                    key={x.k}
                    name={x.name}
                    icon={x.icon}
                    label={cur ?? x.name}
                    aria={`${x.name}: ${cur ?? x.all}`}
                    active={isActive(x.k)}
                    open={menu.isOpen(x.k)}
                    onToggle={() => toggle(x.k)}
                    onClose={menu.close}
                    opts={mk(x.k, x.values, x.all)}
                    width={x.width}
                  />
                );
              })}
              {anyF ? (
                <button type="button" className="btn btn-q" onClick={() => { setFilters(NO_FILTERS); menu.close(); }} style={{ minHeight: "32px" }}>
                  Clear filters
                </button>
              ) : null}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span className="meta" aria-live="polite">
                {entriesText(rows.length)}
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <FilterMenu
                  name="Sort"
                  icon={<IcSort />}
                  label={sort}
                  aria={`Sort: ${sort}`}
                  active={false}
                  open={menu.isOpen("sort")}
                  onToggle={() => toggle("sort")}
                  onClose={menu.close}
                  width={200}
                  align="right"
                  opts={SORTS.map((o) => ({ label: o, count: "", dim: false, sel: o === sort, pick: () => { setSort(o); menu.close(); } }))}
                />
                <div role="group" aria-label="View" className="kseg-track" style={{ display: "flex", gap: "2px", padding: "2px", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" }}>
                  <button type="button" aria-pressed={view === "list" ? "true" : "false"} aria-label="List view" onClick={() => setView("list")} style={segStyle(view === "list")}>
                    <IcList />
                    List
                  </button>
                  <button type="button" aria-pressed={view === "grid" ? "true" : "false"} aria-label="Grid view" onClick={() => setView("grid")} style={segStyle(view === "grid")}>
                    <IcGrid />
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </div>

          {stopped.map((a) => (
            <div key={a.name} className="card" style={{ ...stateCard, ["--card-fill" as string]: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500 }}>
                <span aria-hidden="true" style={{ flex: "none", width: "8px", height: "8px", borderRadius: "4px", background: "var(--attention)" }} />
                {`${a.name} stopped syncing yesterday`}
              </div>
              <p className="meta" style={{ margin: 0 }}>
                The investor password may have changed. Your screenshots still come in; only the trade numbers are waiting.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Link to={`/accounts/${slug(a.name)}`} className="btn btn-g" aria-label={`Reconnect ${a.name}`}>
                  Reconnect
                </Link>
              </div>
            </div>
          ))}

          {asking && !anyF ? (
            <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderRadius: "var(--r-card)" }}>
              <div className="knote" style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: "1 1 360px" }}>
                <span className="knote-ic">
                  <IcClock />
                </span>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{`${asking.pair} closed ${SHORT_SECONDS[asking.id]} seconds after opening`}</span>
                <span className="meta">{shortTradeLine(asking)}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn btn-q" onClick={() => answer(asking, "counted")}>
                  Count it
                </button>
                <button type="button" className="btn btn-g" onClick={() => answer(asking, "left-out")}>
                  Leave it out
                </button>
              </div>
            </div>
          ) : null}

          {rows.length && view === "list" ? (
            <ol aria-label="Trade log" style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", borderBottom: "1px solid var(--border-subtle)" }}>
              {shown.map((e, i) => (
                <ListRow key={e.id} e={e} a={actions(e)} fresh={grownFrom != null && i >= grownFrom} />
              ))}
            </ol>
          ) : null}
          {rows.length && view === "grid" ? (
            <ol aria-label="Trade log" style={{ margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
              {shown.map((e, i) => (
                <GridCard key={e.id} e={e} a={actions(e)} fresh={grownFrom != null && i >= grownFrom} />
              ))}
            </ol>
          ) : null}

          {rows.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "48px 0" }}>
              <div className="medal" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 32 32">
                  <path d="M6 8h20l-8 9v6l-4 2v-8z" style={{ fill: "var(--medal-glyph)" }} />
                  <circle cx="24" cy="23" r="4" style={{ fill: "var(--medal-glyph-2)" }} />
                </svg>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 500, marginTop: "8px", lineHeight: "24px" }}>No entries match these filters</span>
              <span className="meta">Try a wider date range, or clear one of the filters.</span>
              <button type="button" className="btn btn-g" onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </button>
            </div>
          ) : null}

          {rows.length > limit ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <span className="lbl">{`Showing ${shown.length} of ${rows.length}`}</span>
              <button type="button" className="btn btn-g" onClick={() => (setGrownFrom(limit), setLimit(limit + BATCH))}>
                Show older entries
              </button>
            </div>
          ) : null}
        </>
      )}
    </Shell>
  );
}
