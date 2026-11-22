// Frame 09 · Setup page: stats following the account picker, rules beside the examples, tabs Examples /
// Patterns / Lessons, the look-alike suggestion. Markup from handoff/prototype/Playbook.dc.html; numbers,
// examples, patterns and lessons are computed from the shared store.
import { Breadcrumbs } from "../components/primitives/Breadcrumbs";
import { Icon } from "../components/primitives/Icon";
import { Fragment, useState, type KeyboardEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Shell } from "../app/Shell";
import { slug } from "../app/routes";
import { useStore } from "../data/store";
import { GROUP_NOTE, GROUPS, hideSuggestion, SUGGESTION, usePlaybook, useSuggestion } from "../data/playbook";
import { EX_BATCH, EX_FILTERS, examplesOf, filterExamples, LESSONS_BATCH, lessonsOf, patterns, setupStats, spark, type ExFilter } from "../lib/playbook";
import { fr, shortDate, tone } from "../lib/format";
import type { Entry } from "../lib/types";
import { toast } from "../components/primitives/toast";
import { useKit, useMenu } from "./useKit";
import { AccountPicker } from "../components/primitives/AccountPicker";
import { ChartArt, Dot, groupHead, h1Style, PencilIcon, PlaybookSprite, Sparkle } from "./playbook/parts";

type Tab = "ex" | "pat" | "les";
const TABS: { k: Tab; label: string }[] = [
  { k: "ex", label: "Examples" },
  { k: "pat", label: "Patterns" },
  { k: "les", label: "Lessons" },
];

const statNum = { fontSize: "24px", fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.025em" } as const;
const tabBtn = { font: "inherit", fontSize: "14px", fontWeight: 500, border: 0, borderRadius: "var(--r-md)", padding: "0 16px", minHeight: "32px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" } as const;

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span className="lbl lbl-k">{k}</span>
      <span className="num" style={statNum}>{v}</span>
    </div>
  );
}

/** One example: the whole chart story, earlier charts as a small strip, the last one large. */
function Example({ e, picked }: { e: Entry; picked: string[] }) {
  const list = e.chartList?.length ? e.chartList : null;
  const strip = list ? list.slice(0, -1).map((c) => ({ c, cap: "" })) : [{ c: "gW", cap: "Weekly" }, { c: "gD", cap: "Daily" }, { c: "g4H", cap: "4H" }];
  const big = list ? list[list.length - 1] : e.chartKey;
  const taken = e.status === "Taken";
  const meta = `${shortDate(e.date)} · ${e.session}${picked.includes(e.account) ? "" : ` · ${e.account}`}`;
  return (
    <Link to={`/story/${e.id}`} className="card" style={{ display: "flex", flexDirection: "column", gap: "8px", textDecoration: "none", color: "var(--text-1)", padding: "12px", borderRadius: "var(--r-card)" }}>
      {strip.length ? (
        <div style={{ display: "flex", gap: "8px" }}>
          {strip.map((s, i) => (
            <figure key={i} style={{ margin: 0, flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div className="chart">
                <ChartArt src={s.c} />
              </div>
              {s.cap ? <figcaption style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>{s.cap}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : null}
      <div className="chart">
        <ChartArt src={big} label={`${e.pair} ${(e.dir ?? "").toLowerCase()} chart`} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", marginTop: "2px" }}>
        <span style={{ fontSize: "14px", fontWeight: 500 }}>{e.pair}</span>
        <span className="num" style={{ fontSize: "14px", fontWeight: 500, color: taken ? tone(e.r) : "var(--text-2)" }}>{taken ? fr(e.r ?? 0) : e.status}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
        <span className="lbl">{meta}</span>
        <span style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: "16px" }}>{e.textbook ? "Textbook" : e.status === "Watched" ? "Not taken" : ""}</span>
      </div>
    </Link>
  );
}

export function SetupPage() {
  const { setup: param } = useParams();
  const menu = useMenu();
  const kit = useKit(menu);
  const entries = useStore((s) => s.entries);
  const setups = useStore((s) => s.setups);
  const picked = useStore((s) => s.picked);
  const examples = usePlaybook((s) => s.examples);
  const sug = useSuggestion();
  const [tab, setTab] = useState<Tab>("ex");
  const [f, setF] = useState<ExFilter>("All");
  const [lim, setLim] = useState(EX_BATCH);
  const [lesLim, setLesLim] = useState(LESSONS_BATCH);

  const setup = setups.find((s) => slug(s.name) === param);
  if (!setup) return <Navigate to="/playbook" replace />;
  const S = setup.name;

  const x = setupStats(entries, S, picked);
  const sp = spark(x.last, 140, 34);
  const all = examplesOf(entries, S);
  const list = filterExamples(all, f);
  const pats = patterns(x.T);
  const lessons = lessonsOf(entries, S);
  const counts: Record<Tab, number> = { ex: all.length, pat: pats.length, les: lessons.length };

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.k === tab);
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length].k;
    setTab(next);
    requestAnimationFrame(() => document.getElementById(`tab-${next}`)?.focus());
  };

  return (
    <Shell active="playbook">
      <PlaybookSprite />
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <Breadcrumbs items={[{ label: "Playbook", to: "/playbook", icon: <Icon name="book" size={16} /> }, { label: S, icon: <Icon name="filter-setup" size={16} /> }]} />
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
            <h1 style={h1Style}>{S}</h1>
            {examples.includes(S) ? <p className="meta" style={{ margin: 0 }}>Example setup. Yours replace it on day one.</p> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <AccountPicker kit={kit} />
          </div>
        </header>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px 48px", paddingBottom: "32px", borderBottom: "1px solid var(--border-subtle)" }}>
        {x.rated ? (
          <>
            <Stat k="Expectancy per trade" v={x.exp} />
            <Stat k="Win rate" v={x.wr} />
            <Stat k="Average winner" v={x.avgW} />
          </>
        ) : null}
        <Stat k="Trades taken" v={String(x.n)} />
        <Stat k="Watched" v={String(x.watched)} />
        {x.hasLine ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <svg width="140" height="34" viewBox="0 0 140 34" role="img" aria-label={`Cumulative R, last ${x.lastN} trades, ending at ${fr(sp.end)}`}>
              <line x1="2" y1={sp.zero} x2="138" y2={sp.zero} strokeDasharray="2 3" style={{ stroke: "var(--border-strong)" }} />
              <polyline points={sp.points} fill="none" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: "var(--text-1)" }} />
            </svg>
            <span className="lbl">{`Last ${x.lastN} trades, in R`}</span>
          </div>
        ) : null}
        {!x.rated || x.early ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-2)", alignSelf: "center", lineHeight: "16px" }}>
            <Dot />
            {!x.rated ? "Too few trades for numbers" : "Early signal: fewer than 20 trades"}
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
        <section aria-label="Examples, patterns and lessons" style={{ flex: "2 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
          <div role="tablist" aria-label="Setup sections" onKeyDown={onTabKey}>
            <div className="kseg-track" style={{ display: "inline-flex", gap: "2px", padding: "4px", background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-lg)" }}>
              {TABS.map((t) => {
                const on = t.k === tab;
                return (
                  <button
                    key={t.k}
                    id={`tab-${t.k}`}
                    type="button"
                    role="tab"
                    aria-selected={on ? "true" : "false"}
                    aria-controls={`panel-${t.k}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setTab(t.k)}
                    style={{ ...tabBtn, color: on ? "var(--inverse-fg)" : "var(--text-2)", background: on ? "var(--inverse-bg)" : "transparent" }}
                  >
                    {t.label}
                    <span style={{ fontWeight: 500, color: on ? "var(--text-disabled)" : "var(--text-3)" }}>{counts[t.k]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {tab === "ex" ? (
            <div id="panel-ex" role="tabpanel" aria-labelledby="tab-ex" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div role="group" aria-label="Filter examples" style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {EX_FILTERS.map((k) => {
                  const on = k === f;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={on ? "true" : "false"}
                      onClick={() => {
                        setF(k);
                        setLim(EX_BATCH);
                      }}
                      style={{ font: "inherit", fontSize: "14px", fontWeight: on ? 600 : 500, color: on ? "var(--text-1)" : "var(--text-2)", background: "transparent", border: 0, borderBottom: `2px solid ${on ? "var(--text-1)" : "transparent"}`, padding: "0 0 8px", cursor: "pointer" }}
                    >
                      {k} <span style={{ color: "var(--text-3)", fontWeight: 500 }}>{filterExamples(all, k).length}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "32px 24px" }}>
                {list.slice(0, lim).map((e) => (
                  <Example key={e.id} e={e} picked={picked} />
                ))}
              </div>
              {!list.length ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "32px 0" }}>
                  <div className="medal" aria-hidden="true">
                    <svg width="34" height="34" viewBox="0 0 32 32">
                      <rect x="5" y="7" width="22" height="18" rx="3" style={{ fill: "var(--medal-glyph)" }} />
                      <path d="M9 20l4-4 3 2 6-6" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--medal-glyph-2)" }} />
                    </svg>
                  </div>
                  <p className="meta" style={{ margin: "8px 0 0" }}>{f === "Textbook" ? "Pin a story as a textbook example from its ··· menu." : "Nothing here yet."}</p>
                </div>
              ) : null}
              {list.length > lim ? (
                <button type="button" className="btn btn-g" onClick={() => setLim(lim + EX_BATCH)} style={{ alignSelf: "center" }}>
                  {`Show ${Math.min(EX_BATCH, list.length - lim)} more of ${list.length - lim}`}
                </button>
              ) : null}
            </div>
          ) : null}

          {tab === "pat" ? (
            <section id="panel-pat" role="tabpanel" aria-labelledby="tab-pat" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {pats.length ? (
                <>
                  <span className="lbl">Win rate, split by things recorded on every trade</span>
                  {pats.map((p) => (
                    <div key={p.h} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px 0", borderTop: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500 }}>
                        {p.h}
                        {p.early ? (
                          <span title="Early signal: few trades so far" style={{ display: "inline-flex" }}>
                            <Dot />
                          </span>
                        ) : null}
                      </div>
                      {p.rows.map((b) => (
                        <Fragment key={b.l}>
                          <div style={{ display: "grid", gridTemplateColumns: "112px minmax(0, 1fr) 70px", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: "16px" }}>{b.l}</span>
                            <div style={{ height: "6px", borderRadius: "3px", background: "var(--surface-pressed)" }}>
                              <div style={{ width: `${b.v}%`, height: "100%", borderRadius: "3px", background: b.first ? "var(--text-1)" : "var(--border-strong)" }} />
                            </div>
                            <span className="num" style={{ fontSize: "12px", textAlign: "right", lineHeight: "16px" }}>{b.txt}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  ))}
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-3)", paddingTop: "8px", lineHeight: "16px" }}>
                    <Dot />
                    Early signal: one side has fewer than 10 trades
                  </span>
                </>
              ) : (
                <p className="meta" style={{ margin: 0 }}>{`Patterns appear once this setup has 20 trades on these accounts. ${x.T.length} so far.`}</p>
              )}
            </section>
          ) : null}

          {tab === "les" ? (
            <section id="panel-les" role="tabpanel" aria-labelledby="tab-les" style={{ display: "flex", flexDirection: "column" }}>
              <span className="lbl">From your reflections on stories in this setup</span>
              <ul style={{ margin: "8px 0 0", padding: 0 }}>
                {lessons.slice(0, lesLim).map((l) => (
                  <li key={l.id} style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px", padding: "12px 0", borderTop: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "14px" }}>{`“${l.refl}”`}</span>
                    <Link to={`/story/${l.id}`} className="lbl" style={{ color: "var(--text-3)" }}>
                      {`${l.pair} · ${shortDate(l.date)}`}
                    </Link>
                  </li>
                ))}
              </ul>
              {lessons.length > lesLim ? (
                <button type="button" className="btn btn-g" onClick={() => setLesLim(lesLim + LESSONS_BATCH)} style={{ alignSelf: "center", marginTop: "16px" }}>
                  {`Show ${Math.min(LESSONS_BATCH, lessons.length - lesLim)} more of ${lessons.length - lesLim}`}
                </button>
              ) : null}
            </section>
          ) : null}
        </section>

        <aside style={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: "32px" }}>
          <section aria-labelledby="rules" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>
                <span id="rules">Rules</span>
              </h2>
              <Link to={`/playbook/${slug(S)}/edit`} className="btn btn-q kq-end" aria-label="Edit rules">
                <PencilIcon />
                Edit
              </Link>
            </div>
            {GROUPS.map((g) => (
              <div key={g} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 0", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <span style={groupHead}>{g}</span>
                  {GROUP_NOTE[g] ? <span className="lbl">{GROUP_NOTE[g]}</span> : null}
                </div>
                {setup.rules[g].length ? (
                  <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-2)", fontSize: "14px" }}>
                    {setup.rules[g].map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        </aside>
      </div>

      {sug.shown ? (
        <section aria-label="Suggested setup" className="card" style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderRadius: "var(--r-card)" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: "1 1 400px", minWidth: 0 }}>
            <span aria-hidden="true" className="knote-ic" style={{ position: "static", flex: "none", color: "var(--voice)" }}>
              <Sparkle />
            </span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{`${sug.stories.length} unsorted chart stories look alike`}</div>
              <div className="meta">{`${SUGGESTION.summary[0].toUpperCase()}${SUGGESTION.summary.slice(1)}.`}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-q"
              onClick={() => {
                hideSuggestion(true);
                toast("Suggestion hidden until more stories look alike", () => hideSuggestion(false), "hidden");
              }}
            >
              Not now
            </button>
            <Link to="/playbook/new?draft=suggestion" className="btn btn-g">
              Name this setup
            </Link>
          </div>
        </section>
      ) : null}
    </Shell>
  );
}
