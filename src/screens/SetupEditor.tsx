// Frame 10 · Setup editor: a new setup (drafted from the look-alike stories, or blank) or Edit rules on an
// existing setup. Rule groups with editable fields, × removes with Undo, "Add a rule", reorder by the grip
// (drag, or arrow keys on the grip). Markup from handoff/prototype/SetupEdit.dc.html.
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Shell } from "../app/Shell";
import { slug } from "../app/routes";
import { useStore, type Rules } from "../data/store";
import { GROUP_NOTE, GROUPS, nameFree, saveSetup, SUGGESTION, useSuggestion, type Group } from "../data/playbook";
import { moveItem } from "../lib/playbook";
import { shortDate } from "../lib/format";
import { toast } from "../components/primitives/toast";
import { BackIcon, backLink, ChartArt, groupHead, h1Style, PlaybookSprite, PlusIcon } from "./playbook/parts";

type Row = { id: number; t: string };
type Draft = Record<Group, Row[]>;

let rid = 0;
const toDraft = (r: Rules): Draft => ({ Context: r.Context.map((t) => ({ id: ++rid, t })), Entry: r.Entry.map((t) => ({ id: ++rid, t })), Exit: r.Exit.map((t) => ({ id: ++rid, t })) });
const toRules = (d: Draft): Rules => ({ Context: d.Context.map((r) => r.t), Entry: d.Entry.map((r) => r.t), Exit: d.Exit.map((r) => r.t) });
const EMPTY: Rules = { Context: [], Entry: [], Exit: [] };

export function SetupEditor() {
  const { setup: param } = useParams();
  const [q] = useSearchParams();
  const nav = useNavigate();
  const setups = useStore((s) => s.setups);
  const sug = useSuggestion();
  // The setup being edited, fixed at open: saving a new name must not make this page lose it.
  const [editing] = useState(() => (param ? setups.find((s) => slug(s.name) === param) ?? null : null));
  const fromSuggestion = !param && q.get("draft") === "suggestion" && sug.live;

  const [name, setName] = useState(() => editing?.name ?? (fromSuggestion ? q.get("name") ?? "" : ""));
  const [rules, setRules] = useState<Draft>(() => toDraft(editing?.rules ?? (fromSuggestion ? SUGGESTION.rules : EMPTY)));
  const [leftOut, setLeftOut] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ g: Group; id: number } | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  if (param && !editing) return <Navigate to="/playbook" replace />;
  const original = editing?.name ?? null;
  const stories = fromSuggestion ? sug.stories : [];
  const back = editing ? `/playbook/${slug(editing.name)}` : "/playbook";

  const focusRow = (id: number) => requestAnimationFrame(() => document.querySelector<HTMLInputElement>(`[data-rule="${id}"]`)?.focus());
  const setRow = (g: Group, id: number, t: string) => setRules((d) => ({ ...d, [g]: d[g].map((r) => (r.id === id ? { ...r, t } : r)) }));
  const remove = (g: Group, id: number) => {
    const prev = rules;
    setRules((d) => ({ ...d, [g]: d[g].filter((r) => r.id !== id) }));
    toast("Rule removed", () => setRules(prev));
  };
  const add = (g: Group) => {
    const row = { id: ++rid, t: "" };
    setRules((d) => ({ ...d, [g]: [...d[g], row] }));
    focusRow(row.id);
  };
  const move = (g: Group, id: number, to: number) =>
    setRules((d) => {
      const from = d[g].findIndex((r) => r.id === id);
      return { ...d, [g]: moveItem(d[g], from, to) };
    });

  const onGripKey = (g: Group, id: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const i = rules[g].findIndex((r) => r.id === id);
    move(g, id, i + (e.key === "ArrowUp" ? -1 : 1));
    const el = e.currentTarget;
    requestAnimationFrame(() => el.focus());
  };
  const onGripDown = (g: Group, id: number) => (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { g, id };
    setDragging(id);
  };
  const onGripMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const rows = [...document.querySelectorAll<HTMLElement>(`[data-group="${d.g}"] [data-row]`)];
    const others = rows.filter((r) => Number(r.dataset.row) !== d.id);
    let to = others.length;
    for (let i = 0; i < others.length; i++) {
      const b = others[i].getBoundingClientRect();
      if (e.clientY < b.top + b.height / 2) {
        to = i;
        break;
      }
    }
    const from = rows.findIndex((r) => Number(r.dataset.row) === d.id);
    if (from !== to) move(d.g, d.id, to);
  };
  const onGripUp = () => {
    drag.current = null;
    setDragging(null);
  };

  const save = () => {
    if (!nameFree(name, original)) {
      nameRef.current?.focus();
      return;
    }
    saveSetup({ original, name, rules: toRules(rules), stories: stories.map((s) => s.e.id).filter((id) => !leftOut.includes(id)) });
    nav(`/playbook/${slug(name.trim())}`);
  };

  return (
    <Shell active="playbook">
      <PlaybookSprite />
      <div style={{ maxWidth: "760px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        <Link to="/playbook" style={backLink}>
          <BackIcon />
          Playbook
        </Link>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
            <h1 style={h1Style}>{editing ? editing.name : "New setup"}</h1>
            {fromSuggestion ? <p className="meta" style={{ margin: 0 }}>{`Drafted from ${stories.length} unsorted chart stories that look alike. Change anything.`}</p> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }} />
        </header>

        {stories.length ? (
          <section aria-labelledby="moving" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span id="moving" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-2)" }}>
                These stories move into this setup
              </span>
              <span className="lbl">Click a chart to leave it out</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {stories.map(({ e, chart }) => {
                const out = leftOut.includes(e.id);
                const cap = `${e.pair} · ${shortDate(e.date)}`;
                return (
                  <figure key={e.id} style={{ margin: 0, display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0, opacity: out ? 0.45 : 1, transition: "opacity var(--d-fast) var(--ease-standard)" }}>
                    <button
                      type="button"
                      aria-pressed={out ? "false" : "true"}
                      aria-label={cap}
                      onClick={() => setLeftOut((l) => (out ? l.filter((x) => x !== e.id) : [...l, e.id]))}
                      className="chart"
                      style={{ display: "block", padding: 0, font: "inherit", cursor: "pointer", width: "100%" }}
                    >
                      <ChartArt src={chart} />
                    </button>
                    <figcaption className="lbl">{cap}</figcaption>
                  </figure>
                );
              })}
            </div>
          </section>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="fld-name" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-2)" }}>
            Name
          </label>
          <input
            ref={nameRef}
            id="fld-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Asian low sweep"
            style={{ font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 16px", minHeight: "32px", width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <section aria-labelledby="rules-h" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span id="rules-h" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-2)" }}>
              Rules
            </span>
            {fromSuggestion ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>
                <span aria-hidden="true" style={{ flex: "none", display: "inline-flex", color: "var(--voice)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <path d="M12 17v4" />
                  </svg>
                </span>
                Drafted from your voice notes on these stories
              </span>
            ) : null}
          </div>
          {GROUPS.map((g) => (
            <div key={g} role="group" aria-label={`${g} rules`} data-group={g} style={{ display: "flex", flexDirection: "column", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", padding: "8px 0" }}>
                <span style={groupHead}>{g}</span>
                {GROUP_NOTE[g] ? <span className="lbl">{GROUP_NOTE[g]}</span> : null}
              </div>
              {rules[g].map((r) => (
                <div key={r.id} data-row={r.id} style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-subtle)", padding: "8px 0", background: dragging === r.id ? "var(--surface-hover)" : undefined }}>
                  <button
                    type="button"
                    aria-label="Reorder rule"
                    onKeyDown={onGripKey(g, r.id)}
                    onPointerDown={onGripDown(g, r.id)}
                    onPointerMove={onGripMove}
                    onPointerUp={onGripUp}
                    onPointerCancel={onGripUp}
                    style={{ color: "var(--text-3)", cursor: dragging === r.id ? "grabbing" : "grab", display: "inline-flex", padding: 0, border: 0, background: "transparent", touchAction: "none" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="9" cy="6" r="1.5" />
                      <circle cx="15" cy="6" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="18" r="1.5" />
                      <circle cx="15" cy="18" r="1.5" />
                    </svg>
                  </button>
                  <input className="ghost" type="text" aria-label="Rule" data-rule={r.id} value={r.t} onChange={(e) => setRow(g, r.id, e.target.value)} placeholder="Describe the rule" style={{ flex: 1 }} />
                  <button className="kmore" type="button" aria-label="Remove rule" onClick={() => remove(g, r.id)} style={{ width: "32px", height: "32px", border: 0, borderRadius: "8px", background: "transparent", color: "var(--text-3)", cursor: "pointer", fontSize: "16px", lineHeight: "24px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => add(g)} style={{ font: "inherit", fontSize: "14px", color: "var(--text-2)", background: "transparent", border: 0, borderTop: "1px solid var(--border-subtle)", textAlign: "left", padding: "12px 0", cursor: "pointer" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <PlusIcon w={1.8} />
                  Add a rule
                </span>
              </button>
            </div>
          ))}
        </section>

        <p className="lbl" style={{ margin: 0 }}>You can pin textbook examples from any chart story in this setup later.</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link to={back} className="btn btn-q">
            Cancel
          </Link>
          <button type="button" className="btn btn-p" onClick={save} style={{ flex: 1 }}>
            Save setup
          </button>
        </div>
      </div>
    </Shell>
  );
}
