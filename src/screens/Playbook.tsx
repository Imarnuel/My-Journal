// Frame 08 · Playbook home: setups with stats and sparkline, Unsorted with the look-alike suggestion,
// the Archived group, each setup's menu, New setup. Markup from handoff/prototype/PlaybookHome.dc.html;
// every number comes from the shared store and follows the account picker (numbers only, never examples).
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shell } from "../app/Shell";
import { slug } from "../app/routes";
import { useStore, useCountedAccounts } from "../data/store";
import { deleteSetup, nameFree, renameSetup, setArchived, SUGGESTION, usePlaybook, useSuggestion } from "../data/playbook";
import { isStory, setupStats, spark, unsortedOf } from "../lib/playbook";
import { fr } from "../lib/format";
import { toast } from "../components/primitives/toast";
import { useKit, useMenu } from "./useKit";
import { AccountPicker } from "../components/primitives/AccountPicker";
import { ArchiveIcon, ChartArt, closeMenuBtn, Dot, h1Style, PencilIcon, PlaybookSprite, PlusIcon, Sparkle } from "./playbook/parts";

const optStyle = { font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", color: "var(--text-1)", background: "transparent", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px", cursor: "pointer", width: "100%" } as const;

function NoSetups() {
  return (
    <div className="card" style={{ ["--card-fill" as string]: "var(--surface-2)", padding: "24px", borderRadius: "var(--r-card)", display: "flex", flexDirection: "column", gap: "12px", minHeight: "150px", boxSizing: "border-box" }}>
      <div style={{ fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>No setups yet</div>
      <p className="meta" style={{ margin: 0 }}>Add the setups you trade, or keep logging. When a few similar charts show up, you'll be asked to name them.</p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Link to="/playbook/new" className="btn btn-g">
          <PlusIcon />
          New setup
        </Link>
      </div>
    </div>
  );
}

export function Playbook() {
  const menu = useMenu();
  const kit = useKit(menu);
  const nav = useNavigate();
  const entries = useStore((s) => s.entries);
  const setups = useStore((s) => s.setups);
  const picked = useCountedAccounts(); // ticked accounts, plus trades with no account (DESIGN.md)
  const { examples, archivedOpen } = usePlaybook();
  const sug = useSuggestion();
  const [renaming, setRenaming] = useState<{ name: string; draft: string } | null>(null);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(SUGGESTION.name);
  const nameBtn = useRef<HTMLButtonElement>(null);
  const live = setups.filter((s) => !s.archived);
  const archived = setups.filter((s) => s.archived);
  const unsorted = unsortedOf(entries);
  const storiesIn = (name: string) => entries.filter((e) => e.setup === name && isStory(e)).length;
  const anyExample = setups.some((s) => examples.includes(s.name));

  // The strip shows the suggested look-alike stories while the suggestion stands, else the newest unsorted charts.
  const strip = sug.shown ? sug.stories.map((x) => x.chart) : unsorted.filter((e) => e.chartKey).slice(0, 4).map((e) => e.chartKey as string);

  const closeName = () => {
    setNameOpen(false);
    requestAnimationFrame(() => nameBtn.current?.focus());
  };
  useEffect(() => {
    if (!nameOpen) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeName();
      if (e.key !== "Tab") return;
      // Keep focus inside the dialog.
      const f = [...document.querySelectorAll<HTMLElement>('[role="dialog"] input, [role="dialog"] button')];
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey ? i <= 0 : i === f.length - 1) {
        e.preventDefault();
        f[e.shiftKey ? f.length - 1 : 0]?.focus();
      }
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [nameOpen]);

  const saveRename = () => {
    if (!renaming) return;
    const v = renaming.draft.trim();
    if (!nameFree(v, renaming.name)) return;
    const from = renaming.name;
    setRenaming(null);
    if (v === from) return;
    renameSetup(from, v);
    toast(`Renamed to ${v}`, () => renameSetup(v, from), "edited");
  };

  return (
    <Shell active="playbook">
      <PlaybookSprite />
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          <h1 style={h1Style}>Playbook</h1>
          <p className="meta" style={{ margin: 0 }}>{anyExample ? "Your setups, built from your chart stories. Example setups shown." : "Your setups, built from your chart stories."}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <AccountPicker kit={kit} />
          <Link to="/playbook/new" className="btn btn-p">
            <PlusIcon />
            New setup
          </Link>
        </div>
      </header>

      {live.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "24px" }}>
          {live.map((s) => {
            const x = setupStats(entries, s.name, picked);
            const sp = spark(x.last, 150, 30);
            const key = `s:${s.name}`;
            const open = menu.isOpen(key);
            const ren = renaming?.name === s.name;
            return (
              <div key={s.name} style={{ position: "relative" }}>
                {ren ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "var(--r-card)", border: "1px solid var(--border-strong)" }}>
                    <span className="chart" style={{ display: "block" }}>
                      <ChartArt src={s.chart} />
                    </span>
                    <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--text-2)" }}>
                      Setup name
                      <input
                        id="rename"
                        type="text"
                        autoFocus
                        value={renaming.draft}
                        onChange={(e) => setRenaming({ name: s.name, draft: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename();
                          if (e.key === "Escape") setRenaming(null);
                        }}
                        style={{ font: "inherit", fontSize: "16px", fontWeight: 500, color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "8px 12px", lineHeight: "24px" }}
                      />
                    </label>
                    <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>Every story in this setup keeps it under the new name.</span>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-g" onClick={() => setRenaming(null)}>
                        Cancel
                      </button>
                      <button type="button" className="btn btn-p" onClick={saveRename}>
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to={`/playbook/${slug(s.name)}`} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "var(--r-card)", textDecoration: "none", color: "var(--text-1)" }}>
                      <span className="chart" style={{ display: "block" }}>
                        <ChartArt src={s.chart} />
                      </span>
                      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>{s.name}</span>
                        <span className="num" style={{ fontSize: "14px", fontWeight: 500 }}>{x.rated ? x.exp : ""}</span>
                      </span>
                      {x.hasLine ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <svg width="150" height="30" viewBox="0 0 150 30" role="img" aria-label={`Cumulative R, last ${x.lastN} trades, ending at ${fr(sp.end)}`}>
                            <line x1="2" y1={sp.zero} x2="148" y2={sp.zero} strokeDasharray="2 3" style={{ stroke: "var(--border-strong)" }} />
                            <polyline points={sp.points} fill="none" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: "var(--text-1)" }} />
                          </svg>
                          <span className="lbl">{`Last ${x.lastN} trades`}</span>
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", height: "30px" }}>
                          <span className="lbl">Trend appears after 10 trades</span>
                        </span>
                      )}
                      <span style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                        <span className="lbl">{`${x.n} taken · ${x.watched} watched`}</span>
                        {!x.rated || x.early ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-2)", lineHeight: "16px" }}>
                            <Dot />
                            {!x.rated ? "Too few trades for numbers" : "Early signal"}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                    <button
                      className="kmore kmore-media"
                      type="button"
                      aria-label={`Actions for ${s.name}`}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : "false"}
                      onClick={() => menu.toggle(key)}
                      style={{ position: "absolute", top: "24px", right: "24px", width: "28px", height: "28px", border: 0, borderRadius: "var(--r-sm)", cursor: "pointer", zIndex: 5 }}

                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="5" cy="12" r="1.6" />
                        <circle cx="12" cy="12" r="1.6" />
                        <circle cx="19" cy="12" r="1.6" />
                      </svg>
                    </button>
                    {open ? (
                      <>
                        <button type="button" aria-label="Close menu" tabIndex={-1} onClick={menu.close} style={closeMenuBtn} />
                        <div role="menu" aria-label={`Actions for ${s.name}`} className="kmenu" style={{ position: "absolute", zIndex: 6, display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box", top: "58px", right: "24px", width: "210px", transformOrigin: "top right" }}>
                          <button
                            type="button"
                            role="menuitem"
                            className="kit-opt"
                            onClick={() => {
                              menu.close();
                              setRenaming({ name: s.name, draft: s.name });
                            }}
                            style={optStyle}
                          >
                            <span className="mi">
                              <PencilIcon />
                              <span>Rename</span>
                            </span>
                          </button>
                          <Link to={`/playbook/${slug(s.name)}/edit`} role="menuitem" className="kit-opt" style={{ ...optStyle, textDecoration: "none" }}>
                            <span className="mi">
                              <PencilIcon />
                              <span>Edit rules</span>
                            </span>
                          </Link>
                          <button
                            type="button"
                            role="menuitem"
                            className="kit-opt"
                            onClick={() => {
                              menu.close();
                              setArchived(s.name, true);
                              toast(`${s.name} archived`, () => setArchived(s.name, false), "archived");
                            }}
                            style={optStyle}
                          >
                            <span className="mi">
                              <ArchiveIcon />
                              <span>Archive setup</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="kit-opt"
                            onClick={() => {
                              menu.close();
                              const { moved, undo } = deleteSetup(s.name);
                              toast(`${s.name} deleted. ${moved} ${moved === 1 ? "story" : "stories"} moved to Unsorted`, undo, "deleted");
                            }}
                            style={{ ...optStyle, color: "var(--loss)" }}
                          >
                            <span className="mi">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M6 6l1 14h10l1-14" />
                              </svg>
                              <span>Delete setup</span>
                            </span>
                          </button>
                          <span style={{ fontSize: "12px", color: "var(--text-3)", padding: "8px 12px 4px", lineHeight: "16px" }}>Archiving keeps its stories and examples. Deleting moves its stories to Unsorted.</span>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <NoSetups />
      )}

      <section aria-labelledby="unsorted" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "24px", borderRadius: "var(--r-card)", border: "1px dashed var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
          <h2 id="unsorted" style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>
            Unsorted <span style={{ fontWeight: 500, color: "var(--text-3)" }}>({unsorted.length})</span>
          </h2>
          <span className="lbl">Chart stories that don't fit a setup yet</span>
        </div>
        {strip.length ? (
          <div style={{ display: "flex", gap: "8px" }}>
            {strip.map((c, i) => (
              <div key={`${c}-${i}`} className="chart" style={{ flex: 1, minWidth: 0 }}>
                <ChartArt src={c} label="Sample playbook example chart" />
              </div>
            ))}
          </div>
        ) : null}
        {sug.shown ? (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <span aria-hidden="true" style={{ flex: "none", display: "inline-flex", color: "var(--voice)" }}>
                <Sparkle />
              </span>
              {`${sug.stories.length} of them look alike: ${SUGGESTION.summary}.`}
            </span>
            <button
              ref={nameBtn}
              type="button"
              className="btn btn-g"
              onClick={() => {
                menu.close();
                setNameDraft(SUGGESTION.name);
                setNameOpen(true);
              }}
            >
              Name this setup
            </button>
          </div>
        ) : null}
      </section>

      <button
        type="button"
        aria-expanded={archivedOpen ? "true" : "false"}
        onClick={() => usePlaybook.setState({ archivedOpen: !archivedOpen })}
        style={{ font: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "0 4px", minHeight: "48px", border: 0, borderTop: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-2)", cursor: "pointer", fontSize: "14px" }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <ArchiveIcon />
          {`Archived setups (${archived.length})`}
        </span>
        <span style={{ display: "flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {archivedOpen ? (
        <div className="kreveal" style={{ display: "flex", flexDirection: "column" }}>
          {archived.map((a) => (
            <div key={a.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 4px", borderTop: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "14px" }}>{a.name}</span>
              <span className="lbl">{`${storiesIn(a.name)} stories kept`}</span>
              <button
                type="button"
                className="btn btn-q"
                onClick={() => {
                  setArchived(a.name, false);
                  toast(`${a.name} restored`, () => setArchived(a.name, true), "restored");
                }}
              >
                Restore
              </button>
            </div>
          ))}
          {!archived.length ? (
            <span className="lbl" style={{ padding: "12px 4px" }}>
              Nothing archived. Archive a setup you've stopped trading; its stories and examples stay.
            </span>
          ) : null}
        </div>
      ) : null}

      {nameOpen ? (
        <>
          <button type="button" className="kscrim" aria-label="Close" tabIndex={-1} onClick={closeName} />
          <div style={{ position: "fixed", inset: 0, zIndex: 31, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "14vh", pointerEvents: "none" }}>
            <div role="dialog" aria-modal="true" aria-labelledby="ndh" className="kdialog" style={{ pointerEvents: "auto", width: "480px", maxWidth: "calc(100% - 32px)", boxSizing: "border-box", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 id="ndh" style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>
                Name this setup
              </h2>
              <p className="meta" style={{ margin: "-8px 0 0" }}>{`${sug.stories.length} unsorted stories look alike: ${SUGGESTION.summary}. They move into it.`}</p>
              <form
                style={{ display: "contents" }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!nameFree(nameDraft, null)) return;
                  nav(`/playbook/new?draft=suggestion&name=${encodeURIComponent(nameDraft.trim())}`);
                }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--text-2)" }}>
                  Setup name
                  <input
                    id="setupname"
                    type="text"
                    autoFocus
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="e.g. Asian sweep reversal"
                    style={{ font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px" }}
                  />
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                  <button type="button" className="btn btn-g" onClick={closeName}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-p">
                    Create and add rules
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </Shell>
  );
}
