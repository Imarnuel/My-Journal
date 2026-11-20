// Frames 05 / 06 / 07 · The chart story: New chart story (/new, before and after the note) and a saved
// story (/story/:id). One component; only the starting state and the footer differ (01-decisions.md,
// "Chart story"). Markup from src/screens/body/Story.body.tsx and NewStory.body.tsx; a saved story reads
// and writes its Entry in the shared store, a new one is a draft until Save story adds it.
import { Breadcrumbs } from "../components/primitives/Breadcrumbs";
import { Icon } from "../components/primitives/Icon";
import { DetailIcon, type DetailIconName } from "./story/detailIcons";
import { useTileReorder } from "./story/useTileReorder";
import { Fragment, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Shell } from "../app/Shell";
import { useStore } from "../data/store";
import type { Entry, Status, TagKind } from "../lib/types";
import { dateTime, fr, tone } from "../lib/format";
import {
  HEADSPACE,
  HEADSPACE_EMOJI,
  NUMBER_FIELDS,
  STATUS_OPTS,
  applyVoiceNote,
  clock,
  clockSeconds,
  entryFromStory,
  entryPatch,
  isImage,
  linkedAnalysis,
  moveItem,
  nextId,
  niceTag,
  ordinal,
  parseR,
  prevOf,
  sessionOf,
  storyFromEntry,
  tagSuggestions,
  voiceToast,
  type Numbers,
  type Story,
} from "../lib/story";
import { readVoiceNote, transcriptRuns } from "../lib/voiceNote";
import { useMenu, useToastAction } from "./useKit";
import { StorySprite } from "./story/StorySprite";
import { CANVAS_EXTRAS, PAIRS, captionOf, newStoryStart } from "./story/canvas";
import { useStoryExtras } from "./story/extras";
import { Chevron, Closer, DetailRow, Dots, MenuItem, Mic, OptionList, Plus, ProblemCard, factBtn, factText } from "./story/parts";

const KINDS: { k: TagKind; hint: string }[] = [
  { k: "Good", hint: "Something to repeat" },
  { k: "Mistake", hint: "Counts in costliest mistakes" },
  { k: "Neutral", hint: "Just context" },
];

const query = (k: string) => {
  try {
    return new URLSearchParams(window.location.search).get(k);
  } catch {
    return null;
  }
};

export function ChartStory() {
  const { id } = useParams();
  return <StoryScreen key={id ?? "new"} id={id ?? null} />;
}

function StoryScreen({ id }: { id: string | null }) {
  const saved = id != null;
  const nav = useNavigate();
  const menu = useMenu<string>();
  const toastA = useToastAction(menu);

  const entries = useStore((s) => s.entries);
  const accounts = useStore((s) => s.accounts);
  const setups = useStore((s) => s.setups);
  const vocabRaw = useStore((s) => s.tags);
  const setTags = useStore((s) => s.setTags);
  const tagKind = useStore((s) => s.tagKind);
  const updateEntry = useStore((s) => s.updateEntry);
  const addEntry = useStore((s) => s.addEntry);
  const removeEntry = useStore((s) => s.removeEntry);
  const restoreEntry = useStore((s) => s.restoreEntry);
  const extrasById = useStoryExtras((s) => s.byId);
  const setExtras = useStoryExtras((s) => s.set);

  const entry = saved ? entries.find((e) => e.id === id) ?? null : null;
  const [draft, setDraft] = useState<Story>(newStoryStart);
  const [pendingKinds, setPendingKinds] = useState<Record<string, TagKind>>({});
  const story: Story | null = useMemo(
    () => (saved ? (entry ? storyFromEntry(entry, CANVAS_EXTRAS[entry.id], extrasById[entry.id]) : null) : draft),
    [saved, entry, extrasById, draft],
  );

  // UI state
  const [sel, setSel] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pSec, setPSec] = useState(0);
  const [said, setSaid] = useState(false);
  const [tagQ, setTagQ] = useState("");
  const [kindFor, setKindFor] = useState<string | null>(null);
  const [dtDraft, setDtDraft] = useState<string | null>(null);
  const [numOpen, setNumOpen] = useState(false);
  const [resDraft, setResDraft] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<{ e: Entry; index: number } | null>(null);
  const [voiceError, setVoiceError] = useState(false);
  const [unreadable, setUnreadable] = useState(() => query("charts") === "unreadable");
  const recT = useRef<ReturnType<typeof setInterval>>(undefined);
  const playT = useRef<ReturnType<typeof setInterval>>(undefined);
  const tileGrid = useRef<HTMLDivElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const firstNum = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      clearInterval(recT.current);
      clearInterval(playT.current);
    },
    [],
  );

  const kindOf = (t: string) => pendingKinds[t] ?? tagKind(t);

  /** Apply a change: a saved story saves at once, a new one updates its draft. */
  const update = (p: Partial<Story>) => {
    if (!saved) {
      setDraft((d) => ({ ...d, ...p }));
      return;
    }
    const e = useStore.getState().entries.find((x) => x.id === id);
    if (!e) return;
    const cur = storyFromEntry(e, CANVAS_EXTRAS[e.id], useStoryExtras.getState().byId[e.id]);
    updateEntry(e.id, entryPatch(e, cur, p, kindOf));
    if ("voiceLen" in p) setExtras(e.id, { voiceLen: p.voiceLen ?? undefined });
  };

  /** A tag's kind is set once, when the tag is first created. */
  const registerKinds = (kinds: Record<string, TagKind>) => {
    const fresh = Object.entries(kinds).filter(([t]) => !useStore.getState().tags.some((x) => x.t.toLowerCase() === t.toLowerCase()));
    if (!fresh.length) return;
    if (saved) setTags([...useStore.getState().tags, ...fresh.map(([t, k]) => ({ t, n: 1, k }))]);
    else setPendingKinds((p) => ({ ...p, ...Object.fromEntries(fresh) }));
  };

  // A pasted image becomes a chart, from anywhere on the page.
  const addFilesRef = useRef<(f: File[]) => void>(() => {});
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])].filter((f) => f.type.startsWith("image/"));
      if (files.length) {
        e.preventDefault();
        addFilesRef.current(files);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => {
    if (story) document.title = saved ? `${story.pair} ${story.status === "Analysis" ? "Analysis" : story.dir ?? ""}`.trim() : "New chart story";
  }, [saved, story]);

  // Before any early return: hooks run in the same order on every render. `move` is read at drop time.
  const moveRef = useRef<(i: number, j: number) => void>(() => {});
  const tileDrag = useTileReorder(tileGrid, (i, j) => moveRef.current(i, j), () => menu.close());
  if (saved && !entry && !deleted) return <Navigate to="/log" replace />;

  if (deleted || !story) {
    return (
      <Shell active="log">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "120px 0" }}>
          <div className="medal" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 32 32">
              <rect x="9" y="11" width="14" height="15" rx="2.5" style={{ fill: "var(--medal-glyph)" }} />
              <rect x="7" y="7" width="18" height="3" rx="1.5" style={{ fill: "var(--medal-glyph-2)" }} />
              <rect x="13" y="5" width="6" height="3" rx="1.5" style={{ fill: "var(--medal-glyph-2)" }} />
            </svg>
          </div>
          <span style={{ fontSize: "16px", fontWeight: 500, marginTop: "8px", lineHeight: "24px" }}>Story deleted</span>
          <span className="meta">Its charts and notes are gone. Your numbers no longer include it.</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-g"
              onClick={() => {
                if (deleted) restoreEntry(deleted.e, deleted.index);
                setDeleted(null);
              }}
            >
              Undo
            </button>
            <Link to="/log" className="btn btn-p">
              Back to trade log
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const s = story;

  // ---- charts
  const charts = s.charts;
  const selI = charts.length ? Math.min(sel ?? charts.length - 1, charts.length - 1) : -1;
  const big = selI >= 0 ? charts[selI] : null;
  const move = (i: number, j: number) => {
    update({ charts: moveItem(charts, i, j) });
    setSel(j);
    menu.close();
  };
  moveRef.current = move;
  const tiles = { onPointerDown: tileDrag.onPointerDown, onClickCapture: tileDrag.onClickCapture };
  // Keys follow the chart, not its place, so a tile keeps its element when the order changes.
  const tileKeys = charts.map((c, i) => `${c}#${charts.slice(0, i).filter((x) => x === c).length}`);
  const removeChart = (i: number) => {
    const before = charts;
    const prevSel = selI;
    const next = charts.filter((_, k) => k !== i);
    update({ charts: next });
    setSel(Math.min(selI, next.length - 1));
    toastA(
      "Chart removed",
      () => {
        update({ charts: before });
        setSel(prevSel);
      },
      "deleted",
    );
  };
  const addFiles = (files: File[]) => {
    const imgs = files.filter((f) => !f.type || f.type.startsWith("image/"));
    if (!imgs.length) return;
    const urls = imgs.map((f) => URL.createObjectURL(f));
    update({ charts: charts.concat(urls) });
    setSel(charts.length + urls.length - 1);
    toastA(urls.length === 1 ? "Chart added" : `${urls.length} charts added`, undefined, "added");
  };
  addFilesRef.current = addFiles;
  const onPick = (ev: ChangeEvent<HTMLInputElement>) => {
    addFiles([...(ev.target.files ?? [])]);
    ev.target.value = "";
  };
  const onSectionDragOver = (e: DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) e.preventDefault();
  };
  const onSectionDrop = (e: DragEvent) => {
    const files = [...e.dataTransfer.files];
    if (!files.length) return;
    e.preventDefault();
    addFiles(files);
  };
  const replaceLast = (ev: ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    ev.target.value = "";
    if (!f) return;
    const next = charts.slice();
    next[next.length - 1] = URL.createObjectURL(f);
    update({ charts: next });
    setSel(next.length - 1);
    setUnreadable(false);
  };

  // ---- notes
  const startRec = () => {
    clearInterval(playT.current);
    clearInterval(recT.current);
    setPlaying(false);
    setVoiceError(false);
    setRecording(true);
    setRecSec(0);
    recT.current = setInterval(() => setRecSec((x) => x + 1), 1000);
  };
  const cancelRec = () => {
    clearInterval(recT.current);
    setRecording(false);
    setRecSec(0);
  };
  const stopRec = async () => {
    clearInterval(recT.current);
    const secs = recSec;
    setRecording(false);
    setRecSec(0);
    setSaid(false);
    const res = await readVoiceNote(secs);
    if (!res.ok) {
      setVoiceError(true);
      return;
    }
    const { patch, filled, newKinds } = applyVoiceNote(s, res);
    const prev = prevOf(s, patch);
    registerKinds(newKinds);
    update(patch);
    toastA(voiceToast(filled), () => update(prev), "voice");
  };
  const len = s.voiceLen;
  const togglePlay = () => {
    if (playing) {
      clearInterval(playT.current);
      setPlaying(false);
      return;
    }
    const total = clockSeconds(len) || 24;
    setPlaying(true);
    playT.current = setInterval(() => {
      setPSec((n) => {
        if (n + 1 > total) {
          clearInterval(playT.current);
          setPlaying(false);
          return 0;
        }
        return n + 1;
      });
    }, 1000);
  };
  const playText = playing || pSec ? `Playing ${clock(pSec)} of ${len ?? clock(24)}` : len ? `From your ${len} voice note` : "From your voice note";

  // ---- tags
  const vocab = [...vocabRaw].sort((a, b) => b.n - a.n);
  const ts = tagSuggestions(vocab, s.tags, tagQ);
  const addTag = (t: string) => {
    update({ tags: s.tags.concat([t]) });
    setTagQ("");
    setKindFor(null);
    menu.close();
  };
  const askKind = () => {
    setKindFor(niceTag(tagQ));
    menu.open("kind");
  };
  const tagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (ts.sug.length && ts.ql) addTag(ts.sug[0].t);
      else if (ts.canAdd) askKind();
    }
    if (e.key === "Backspace" && !tagQ && s.tags.length) update({ tags: s.tags.slice(0, -1) });
  };

  // ---- facts
  const dtValue = `${s.date}T${s.time}`;
  const dtLabel = dateTime(s.date, s.time);
  const saveDate = () => {
    const v = dtDraft;
    if (v && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) {
      const [d, t] = [v.slice(0, 10), v.slice(11, 16)];
      const prev = { date: s.date, time: s.time, session: s.session };
      update({ date: d, time: t, session: sessionOf(t) });
      setDtDraft(null);
      toastA(`Moved to ${dateTime(d, t)}`, () => update(prev), "moved");
    } else menu.close();
  };
  const dirChip = s.status === "Analysis" ? "Analysis" : s.dir;
  const resVal = s.status === "Taken" ? (s.r != null ? fr(s.r) : "No result yet") : s.status;
  const resCol = s.status !== "Taken" || s.r == null ? "var(--text-2)" : tone(s.r);
  const numLine = (["entry", "stop", "target", "exit"] as const).filter((k) => s.numbers[k]).map((k) => `${k[0].toUpperCase()}${k.slice(1)} ${s.numbers[k]}`);
  const acctNames = accounts.filter((a) => !a.archived).map((a) => a.name);
  const setupNames = setups.filter((x) => !x.archived).map((x) => x.name);

  const pick = (k: keyof Story) => (v: string) => {
    update({ [k]: v } as Partial<Story>);
    menu.close();
  };

  // ---- saved story actions
  const pinT = () => {
    const was = s.textbook;
    update({ textbook: !was });
    toastA(was ? "No longer a textbook example" : "Pinned as a textbook example", () => update({ textbook: was }), was ? "restored" : "done");
  };
  const exclT = () => {
    const was = s.excluded;
    update({ excluded: !was });
    toastA(was ? "Back in your stats" : "Left out of your stats", () => update({ excluded: was }), was ? "restored" : "hidden");
  };
  const delStory = () => {
    const all = useStore.getState().entries;
    const index = all.findIndex((e) => e.id === id);
    if (index < 0) return;
    menu.close();
    setDeleted({ e: all[index], index });
    removeEntry(all[index].id);
  };

  const saveStory = () => {
    const nid = nextId(useStore.getState().entries);
    const fresh = Object.entries(pendingKinds).filter(([t]) => !useStore.getState().tags.some((x) => x.t === t));
    if (fresh.length) setTags([...useStore.getState().tags, ...fresh.map(([t, k]) => ({ t, n: 1, k }))]);
    addEntry(entryFromStory(nid, s, kindOf));
    if (s.voiceLen) setExtras(nid, { voiceLen: s.voiceLen });
    nav(`/story/${nid}`);
    toastA(`${s.pair} saved to your trade log`);
  };

  const analysis = saved && entry ? linkedAnalysis(entries, entry) : null;
  const analysisChart = analysis ? storyFromEntry(analysis, CANVAS_EXTRAS[analysis.id]).charts.at(-1) ?? null : null;

  const exp = (k: string) => (menu.isOpen(k) ? "true" : "false");

  return (
    <Shell active="log">
      <StorySprite />
      <Breadcrumbs
        items={[
          { label: "Trade log", to: "/log", icon: <Icon name="log" size={16} /> },
          saved ? { label: s.pair, icon: <Icon name="fact-pair" size={16} /> } : { label: "New chart story", icon: <Icon name="plus" size={16} /> },
        ]}
      />
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          {saved ? (
            <>
              <h1 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.025em", display: "flex", alignItems: "center", gap: "12px" }}>
                {s.pair}{" "}
                {dirChip ? <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "var(--r-xs)", padding: "2px 8px", lineHeight: "16px" }}>{dirChip}</span> : null}
                {s.textbook ? <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-1)", background: "var(--surface-pressed)", borderRadius: "var(--r-xs)", padding: "2px 8px", lineHeight: "16px" }}>Textbook example</span> : null}
              </h1>
              <p className="meta" style={{ margin: 0 }}>
                {`${s.status} · ${s.account} · ${dtLabel}${s.closeTime ? ` to ${s.closeTime}` : ""} · ${s.session}`}
              </p>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.025em" }}>New chart story</h1>
              <p className="meta" style={{ margin: 0 }}>
                Drop the charts and talk it through. Your note fills the tags.
              </p>
            </>
          )}
        </div>
        {saved ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", alignSelf: s.status === "Taken" ? undefined : "flex-start" }}>
            {/* The result only when there is one: a running or watched entry already says its status under the title. */}
            {s.status === "Taken" ? (
              <span className="num" style={{ fontSize: "24px", fontWeight: 600, color: resCol, letterSpacing: "-0.025em", lineHeight: "32px" }}>
                {resVal}
              </span>
            ) : null}
            <span style={{ position: "relative", display: "inline-flex" }}>
              <button className="kmore" type="button" aria-label="More actions" aria-haspopup="menu" aria-expanded={exp("sm")} onClick={() => menu.toggle("sm")} style={{ width: "32px", height: "32px", border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "transparent", color: "var(--text-1)", cursor: "pointer", fontSize: "16px", letterSpacing: "1px", position: "relative", zIndex: 5, lineHeight: "24px" }}>
                <Dots />
              </button>
              {menu.isOpen("sm") ? (
                <>
                  <Closer onClose={menu.close} />
                  <div role="menu" aria-label="More actions" className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box", right: 0, width: "220px", transformOrigin: "top right" }}>
                    <MenuItem icon={<path d="M6 3h12v18l-6-4-6 4z" />} onClick={pinT}>
                      {s.textbook ? "Unpin textbook example" : "Pin as textbook"}
                    </MenuItem>
                    <MenuItem
                      icon={
                        <>
                          <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
                          <path d="M3 9.5h18" />
                          <path d="M8 2.5v4" />
                          <path d="M16 2.5v4" />
                        </>
                      }
                      onClick={() => menu.open("dt")}
                    >
                      Change date
                    </MenuItem>
                    <MenuItem
                      icon={
                        <>
                          <path d="M3 3v18h18" />
                          <path d="M7 15l4-4 3 3 5-6" />
                        </>
                      }
                      onClick={exclT}
                    >
                      {s.excluded ? "Include in stats" : "Exclude from stats"}
                    </MenuItem>
                    <MenuItem
                      danger
                      icon={
                        <>
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M6 6l1 14h10l1-14" />
                        </>
                      }
                      onClick={delStory}
                    >
                      Delete story
                    </MenuItem>
                  </div>
                </>
              ) : null}
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }} />
        )}
      </header>
      {saved && s.excluded ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "var(--r-lg)", border: "1px solid var(--border)" }}>
          <span className="meta">Excluded from your stats. It still shows in your trade log and playbook.</span>
          <button type="button" className="btn btn-q" onClick={exclT} style={{ marginLeft: "auto" }}>
            Include again
          </button>
        </div>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
        <div style={{ flex: "3 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
          <section aria-label="Charts" onDragOver={onSectionDragOver} onDrop={onSectionDrop} style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {big != null ? (
              <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="chart" style={{ borderRadius: "var(--r-card)" }}>
                  {isImage(big) ? (
                    <img src={big} alt="Your chart" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "contain", background: "var(--surface-inset)" }} />
                  ) : (
                    <svg viewBox="0 0 320 180" role="img" aria-label={`${captionOf(big) || "Chart"}, chart ${selI + 1} of ${charts.length}`} style={{ display: "block", width: "100%", height: "auto" }}>
                      <use href={`#${big}`} />
                    </svg>
                  )}
                </div>
                <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="lbl">{isImage(big) ? "" : captionOf(big)}</span>
                  <span className="lbl">{`${selI + 1} of ${charts.length}`}</span>
                </figcaption>
              </figure>
            ) : (
              <label style={{ position: "relative", font: "inherit", border: "1.5px dashed var(--border)", borderRadius: "var(--r-card)", color: "var(--text-3)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", aspectRatio: "16 / 9", textAlign: "center", padding: "24px" }}>
                <Plus />
                Scroll back on your chart and take one now. It still counts.
                <input type="file"
                title="" accept="image/*" multiple onChange={onPick} style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }} />
              </label>
            )}
            <div ref={tileGrid} className="ktiles" onClickCapture={tiles.onClickCapture} style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "8px", alignItems: "start" }}>
              {charts.map((c, i) => {
                return (
                  <figure
                    key={tileKeys[i]}
                    data-tile
                    data-chart={isImage(c) ? "image" : c}
                    className="ktile"
                    onPointerDown={tiles.onPointerDown(i)}
                    onDragStart={(e) => e.preventDefault()}
                    aria-roledescription="Draggable chart"
                    style={{ margin: 0, display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}
                  >
                    <button type="button" aria-label={`Show ${ordinal(i)} chart`} aria-pressed={i === selI ? "true" : "false"} onClick={() => setSel(i)} className="chart" style={{ position: "relative", display: "block", padding: 0, border: 0, cursor: "inherit", boxShadow: i === selI ? "0 0 0 2px var(--text-1)" : "none" }}>
                      <span className="ktile-scrim" aria-hidden="true" />
                      {isImage(c) ? (
                        <img src={c} alt="" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }} />
                      ) : (
                        <svg viewBox="0 0 320 180" aria-hidden="true" style={{ display: "block", width: "100%", height: "auto" }}>
                          <use href={`#${c}`} />
                        </svg>
                      )}
                    </button>
                    {!isImage(c) && captionOf(c) ? (
                      <figcaption className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                        {captionOf(c)}
                      </figcaption>
                    ) : null}
                    <button
                      type="button"
                      className="kgrip"
                      aria-label={`Reorder ${ordinal(i)} chart`}
                      aria-describedby="tiles-hint"
                      onKeyDown={(e) => {
                        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                        e.preventDefault();
                        const j = i + (e.key === "ArrowLeft" ? -1 : 1);
                        if (j < 0 || j >= charts.length) return;
                        move(i, j);
                        // Focus follows the chart to its new place, as on setup rules.
                        requestAnimationFrame(() => tileGrid.current?.querySelectorAll<HTMLElement>(".kgrip")[j]?.focus());
                      }}
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
                    {charts.length > 1 ? (
                      <button type="button" className="ktile-rm" aria-label={`Remove ${ordinal(i)} chart`} onClick={() => removeChart(i)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M6 6l1 14h10l1-14" />
                        </svg>
                      </button>
                    ) : null}
                  </figure>
                );
              })}
              <label aria-label="Add or paste another chart" style={{ position: "relative", font: "inherit", border: "1.5px dashed var(--border)", borderRadius: "var(--r-md)", color: "var(--text-3)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", fontSize: "12px", aspectRatio: "16 / 9", lineHeight: "16px" }}>
                <Plus />
                Add
                <input type="file"
                title="" accept="image/*" multiple onChange={onPick} style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }} />
              </label>
            </div>
            <p id="tiles-hint" className="lbl" style={{ margin: 0, fontSize: "12px", lineHeight: "16px" }}>
              Drag to reorder.
            </p>
            {unreadable ? (
              <ProblemCard title="Prices on this screenshot are too small to read" text="It's still in the story. Replace it with a sharper one, or type the entry, stop and target yourself.">
                <button type="button" className="btn btn-g" onClick={() => replaceInput.current?.click()}>
                  Replace
                </button>
                <button
                  type="button"
                  className="btn btn-q"
                  onClick={() => {
                    setUnreadable(false);
                    setNumOpen(true);
                    requestAnimationFrame(() => firstNum.current?.focus());
                  }}
                >
                  Type the numbers
                </button>
                <input ref={replaceInput} type="file"
                title="" accept="image/*" tabIndex={-1} aria-hidden="true" onChange={replaceLast} style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }} />
              </ProblemCard>
            ) : null}
          </section>

          <section aria-labelledby="nh" className="card" style={{ ["--card-fill" as string]: "var(--surface-2)", display: "flex", flexDirection: "column", gap: "16px", padding: "24px", borderRadius: "var(--r-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "-4px" }}>
              <h2 id="nh" style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>
                Notes
              </h2>
              <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                Optional
              </span>
            </div>
            {voiceError && !recording ? (
              <ProblemCard title="Couldn't make out your note" text="Too much background noise. Nothing was filled in, so nothing wrong was saved.">
                <button type="button" className="btn btn-g" onClick={startRec}>
                  <Mic />
                  Record again
                </button>
                <button
                  type="button"
                  className="btn btn-q"
                  onClick={() => {
                    setVoiceError(false);
                    document.getElementById("nB")?.focus();
                  }}
                >
                  Type instead
                </button>
              </ProblemCard>
            ) : !s.voice && !recording ? (
              <button type="button" onClick={startRec} style={{ font: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "16px", borderRadius: "var(--r-card)", background: "var(--surface-inset)", border: "1px dashed var(--border-strong)", color: "var(--text-1)", cursor: "pointer" }}>
                <span className="kvoice" style={{ flex: "none", width: "48px", height: "48px", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mic />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>Talk it through</span>
                  <span className="meta" style={{ fontSize: "14px" }}>
                    Why you took it and how it went. It fills both notes and the details you haven't set.
                  </span>
                </span>
              </button>
            ) : null}
            {recording ? (
              <div role="status" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "var(--r-card)", background: "var(--surface-inset)", border: "1px solid var(--voice-border)" }}>
                <span aria-hidden="true" className="kbreathe" style={{ flex: "none", width: "12px", height: "12px", borderRadius: "6px", background: "var(--loss)" }} />
                <span style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>Listening · {clock(recSec)}</span>
                  <span className="meta" style={{ fontSize: "14px" }}>
                    Talk as long as you like. Stop when you're done.
                  </span>
                </span>
                <button type="button" className="btn btn-q" onClick={cancelRec}>
                  Cancel
                </button>
                <button type="button" className="btn btn-p" onClick={stopRec}>
                  Stop
                </button>
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label htmlFor="nB" className="lbl" style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-2)", lineHeight: "16px" }}>
                  Before / during
                </label>
              </div>
              <textarea id="nB" className="ghost" rows={2} placeholder="Fills from your note, or write it yourself" value={s.before} onChange={(e) => update({ before: e.target.value })} style={NOTE_FIELD} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Tidied (DESIGN.md, Notes): the label row is only the label and a small Suggested badge, so it
                  sits 8px from its field like Before / during; Keep and Delete move under the field. */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label htmlFor="nR" className="lbl" style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-2)", lineHeight: "16px" }}>
                  Reflection
                </label>
                {s.suggested && s.refl ? (
                  <span className="ksugg" title="Inferred from your note">
                    Suggested
                  </span>
                ) : null}
              </div>
              <textarea id="nR" className="ghost" rows={2} placeholder="Fills from your note, or write it yourself" value={s.refl} onChange={(e) => update({ refl: e.target.value, suggested: false })} style={NOTE_FIELD} />
              {s.suggested && s.refl ? (
                <div className="ksugg-row">
                  <span>Inferred from your note</span>
                  <button type="button" className="btn btn-g kbtn-sm" onClick={() => update({ suggested: false })}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Keep
                  </button>
                  <button
                    type="button"
                    className="btn btn-q kbtn-sm kbtn-loss"
                    onClick={() => {
                      const r = s.refl;
                      update({ refl: "", suggested: false });
                      toastA("Suggested reflection deleted", () => update({ refl: r, suggested: true }), "deleted");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
            {s.voice && !recording ? (
              <>
                {/* The voice note row: one height (28px controls), 14px control labels, 12px for the length. */}
                <div className="kvoice-row">
                  <button type="button" className="kplay" aria-label={playing ? "Pause your voice note" : "Play your voice note"} onClick={togglePlay}>
                    {playing ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5l11 7-11 7z" />
                      </svg>
                    )}
                  </button>
                  <span className="kvoice-len">{playText}</span>
                  <button type="button" className="btn btn-q kbtn-sm" aria-expanded={said ? "true" : "false"} onClick={() => setSaid(!said)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z" />
                    </svg>
                    What you said
                    <svg className="kchev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {/* Re-record in the voice colour, so it reads as the voice action (DESIGN.md). */}
                  <button type="button" className="btn btn-q kbtn-sm kbtn-voice" title="Record a new note. It fills only what is still empty." onClick={startRec} style={{ marginLeft: "auto" }}>
                    <Mic />
                    Re-record
                  </button>
                </div>
                {said ? (
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "20px", color: "var(--text-2)", padding: "12px", borderRadius: "var(--r-md)", background: "var(--surface-inset)", border: "1px solid var(--border-subtle)" }}>
                    {transcriptRuns(s.transcript).map((r, i) =>
                      r.mark ? (
                        <mark key={i} style={{ background: "color-mix(in srgb, var(--voice) 16%, transparent)", color: "var(--text-1)", borderRadius: "4px", padding: "0 2px" }}>
                          {r.text}
                        </mark>
                      ) : (
                        <Fragment key={i}>{r.text}</Fragment>
                      ),
                    )}
                  </p>
                ) : null}
              </>
            ) : null}
          </section>

          {analysis ? (
            <Link to={`/story/${analysis.id}`} className="card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 16px", borderRadius: "var(--r-card)", textDecoration: "none", color: "var(--text-1)" }}>
              <div className="chart" style={{ flex: "none", width: "112px" }}>
                {analysisChart && isImage(analysisChart) ? (
                  <img src={analysisChart} alt="" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }} />
                ) : (
                  <svg viewBox="0 0 320 180" aria-hidden="true" style={{ display: "block", width: "100%", height: "auto" }}>
                    {analysisChart ? <use href={`#${analysisChart}`} /> : null}
                  </svg>
                )}
              </div>
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>{`Your analysis before this trade · ${dateTime(analysis.date, analysis.time)}`}</span>
                {analysis.plan ? <span style={{ fontSize: "14px", color: "var(--text-2)" }}>{`“${analysis.plan}”`}</span> : null}
              </div>
            </Link>
          ) : null}
        </div>

        <aside aria-label="Details" className="card" style={{ ["--card-fill" as string]: "var(--surface-2)", flex: "2 1 380px", minWidth: 0, position: "sticky", top: "24px", display: "flex", flexDirection: "column", borderRadius: "var(--r-card)" }}>
          <section aria-labelledby="th" style={{ padding: "16px 24px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", paddingBottom: "8px" }}>
              <h2 id="th" style={{ margin: 0, fontSize: "16px", fontWeight: 500, lineHeight: "24px" }}>
                Details
              </h2>
              <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                {s.voice ? "From your note · tap any to change" : "From your note, or set them yourself"}
              </span>
            </div>
            <dl style={{ margin: 0, display: "flex", flexDirection: "column" }}>
              <DetailRow label="Setup" icon={<DetailIcon name="setup" />}>
                <div style={{ position: "relative" }}>
                  <button type="button" className="ghost tagfield" aria-haspopup="listbox" aria-expanded={exp("setup")} aria-label={`Setup: ${s.setup ?? "Pick a setup"}`} onClick={() => menu.toggle("setup")} style={{ justifyContent: "space-between", position: "relative", zIndex: 5 }}>
                    {s.setup ? <span className="pill">{s.setup}</span> : <span style={{ fontSize: "14px", color: "var(--text-3)" }}>Pick a setup</span>}
                    <Chevron />
                  </button>
                  {menu.isOpen("setup") ? (
                    <>
                      <Closer onClose={menu.close} />
                      <OptionList label="Setup" opts={setupNames.map((label) => ({ label }))} value={s.setup} onPick={pick("setup")} style={{ left: 0, width: "100%" }}>
                        <Link to="/playbook/new" className="kit-opt" style={{ font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", background: "transparent", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px", cursor: "pointer", width: "100%", color: "var(--text-2)", textDecoration: "none", boxSizing: "border-box" }}>
                          <Plus />
                          New setup
                        </Link>
                      </OptionList>
                    </>
                  ) : null}
                </div>
              </DetailRow>
              <DetailRow label="Tags" icon={<DetailIcon name="tags" />}>
                <div style={{ position: "relative" }}>
                  <div className="ghost tagfield" role="group" aria-label="Tags" onClick={() => document.getElementById("taginput")?.focus()} style={{ cursor: "text", flexWrap: "wrap", position: "relative", zIndex: 5 }}>
                    {s.tags.map((t, i) => (
                      <span key={t} className="pill" style={{ display: "inline-flex", alignItems: "center", gap: "4px", paddingRight: "4px" }}>
                        {t}
                        <button
                          type="button"
                          aria-label={`Remove ${t}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const prev = s.tags;
                            update({ tags: s.tags.filter((_, k) => k !== i) });
                            toastA(`“${t}” removed`, () => update({ tags: prev }), "deleted");
                          }}
                          style={{ width: "24px", height: "24px", margin: "-2px -4px -2px -2px", border: 0, borderRadius: "var(--r-sm)", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    <input
                      id="taginput"
                      type="text"
                      role="combobox"
                      aria-expanded={menu.isOpen("tag") ? "true" : "false"}
                      aria-controls="tagsug"
                      aria-autocomplete="list"
                      aria-label="Add a tag"
                      placeholder={s.tags.length ? "" : "Add a tag"}
                      value={tagQ}
                      onChange={(e) => {
                        setTagQ(e.target.value);
                        menu.open("tag");
                      }}
                      onFocus={() => {
                        if (!menu.isOpen("tag")) menu.open("tag");
                      }}
                      onKeyDown={tagKey}
                      className="tag-input"
                      style={{ flex: 1, minWidth: "90px", font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "transparent", border: 0, outline: "none", padding: "4px 2px" }}
                    />
                  </div>
                  {menu.isOpen("tag") ? (
                    <>
                      <Closer onClose={menu.close} />
                      <div id="tagsug" role="listbox" aria-label="Matching tags" className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box", left: 0, right: 0 }}>
                        {ts.sug.map((o) => (
                          <button key={o.t} type="button" role="option" aria-selected="false" onClick={() => addTag(o.t)} className="kit-opt" style={{ font: "inherit", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", color: "var(--text-1)", background: "transparent", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", cursor: "pointer", width: "100%", fontSize: "14px", minHeight: "32px" }}>
                            <span>{o.t}</span>
                          </button>
                        ))}
                        {ts.canAdd ? (
                          <button type="button" role="option" aria-selected="false" onClick={askKind} className="kit-opt" style={{ font: "inherit", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", background: "transparent", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", cursor: "pointer", width: "100%", fontSize: "14px", minHeight: "32px", color: "var(--text-2)" }}>
                            {`Add “${niceTag(tagQ)}” as a new tag`}
                          </button>
                        ) : null}
                        {ts.none ? <span style={{ fontSize: "12px", color: "var(--text-3)", padding: "8px 12px", lineHeight: "16px" }}>Type to find a tag or make a new one</span> : null}
                      </div>
                    </>
                  ) : null}
                  {menu.isOpen("kind") && kindFor ? (
                    <>
                      <Closer onClose={menu.close} />
                      <div role="dialog" aria-label="New tag" className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", display: "flex", flexDirection: "column", boxSizing: "border-box", left: 0, right: 0, padding: "12px", gap: "8px" }}>
                        <span style={{ fontSize: "14px", color: "var(--text-1)" }}>
                          What kind of tag is <b>{kindFor}</b>? You only set this once.
                        </span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {KINDS.map(({ k, hint }) => (
                            <button
                              key={k}
                              type="button"
                              className="btn btn-g"
                              onClick={() => {
                                const t = kindFor;
                                registerKinds({ [t]: k });
                                addTag(t);
                                toastA(`“${t}” added as a new ${k.toLowerCase()} tag`, undefined, "added");
                              }}
                              style={{ minHeight: "32px", flex: 1, flexDirection: "column", gap: 0, padding: "4px 12px" }}
                            >
                              <span style={{ fontSize: "14px", fontWeight: 500 }}>{k}</span>
                              <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 400, lineHeight: "16px" }}>{hint}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </DetailRow>
              <DetailRow label="Plan" icon={<DetailIcon name="plan" />}>
                <div role="group" aria-label="Plan" className="kseg-track" style={{ display: "flex", gap: "2px", padding: "2px", background: "var(--surface-inset)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-md)" }}>
                  {([["Followed", true], ["Not followed", false]] as const).map(([label, val]) => {
                    const on = s.followed === val;
                    return (
                      <button key={label} type="button" aria-pressed={on ? "true" : "false"} onClick={() => update({ followed: on ? null : val })} style={{ flex: 1, font: "inherit", fontSize: "14px", fontWeight: on ? 600 : 500, color: on ? "var(--text-1)" : "var(--text-2)", background: on ? "var(--surface-3)" : "transparent", border: 0, borderRadius: "var(--r-sm)", padding: "0 12px", minHeight: "32px", cursor: "pointer" }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </DetailRow>
              <DetailRow label="Headspace" icon={<DetailIcon name="headspace" />}>
                <div style={{ position: "relative" }}>
                  <button type="button" className="ghost tagfield" aria-haspopup="listbox" aria-expanded={exp("head")} aria-label={`Headspace: ${s.headspace ?? "Pick one"}`} onClick={() => menu.toggle("head")} style={{ justifyContent: "space-between", position: "relative", zIndex: 5 }}>
                    {s.headspace ? (
                      <span className="pill" style={{ gap: "4px" }}>
                        {HEADSPACE_EMOJI[s.headspace] ? <span aria-hidden="true" style={{ fontSize: "14px", lineHeight: "16px" }}>{HEADSPACE_EMOJI[s.headspace]}</span> : null}
                        {s.headspace}
                      </span>
                    ) : <span style={{ fontSize: "14px", color: "var(--text-3)" }}>Pick one</span>}
                    <Chevron />
                  </button>
                  {menu.isOpen("head") ? (
                    <>
                      <Closer onClose={menu.close} />
                      <OptionList label="Headspace" opts={HEADSPACE.map((label) => ({ label, lead: HEADSPACE_EMOJI[label] }))} value={s.headspace} onPick={pick("headspace")} style={{ left: 0, width: "100%" }} />
                    </>
                  ) : null}
                </div>
              </DetailRow>
            </dl>
          </section>

          <section aria-label="Trade" style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
              {saved ? "From your charts and MT5, or typed by you" : "Read from your charts and MT5 · tap anything to change"}
            </span>
            {/* Each fact leads with its icon and they sit 16px apart, no dot separators (the Trade log's facts rule). */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px" }}>
              <Fact name="Pair" k="pair" icon="pair" value={s.pair} menu={menu} opts={PAIRS.map((label) => ({ label }))} onPick={pick("pair")} />
              <Fact name="Direction" k="dir" icon={s.dir === "Long" ? "long" : "short"} value={s.dir} menu={menu} opts={[{ label: "Long" }, { label: "Short" }]} onPick={pick("dir")} />
              <Fact name="Status" k="status" icon="status" value={s.status} menu={menu} opts={STATUS_OPTS} onPick={(v) => pick("status")(v as Status)} />
              <Fact name="Account" k="acct" icon="account" value={s.account} menu={menu} opts={acctNames.map((label) => ({ label }))} onPick={pick("account")} />
              <span style={{ position: "relative", display: "inline-flex" }}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={exp("dt")}
                  aria-label={`Date and time: ${dtLabel}`}
                  onClick={() => {
                    setDtDraft(null);
                    menu.toggle("dt");
                  }}
                  style={factBtn}
                >
                  <DetailIcon name="date" />
                  <span style={factText}>{dtLabel}</span>
                </button>
                {menu.isOpen("dt") ? (
                  <>
                    <Closer onClose={menu.close} />
                    <div role="dialog" aria-label="Date and time" className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", display: "flex", flexDirection: "column", boxSizing: "border-box", right: 0, width: "260px", padding: "12px", gap: "8px", transformOrigin: "top right" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--text-2)" }}>
                        Date and time
                        <input type="datetime-local" value={dtDraft ?? dtValue} onChange={(e) => setDtDraft(e.target.value)} style={{ font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "8px 12px" }} />
                      </label>
                      <span style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>The session follows the time.</span>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button type="button" className="btn btn-g" onClick={menu.close} style={{ minHeight: "32px" }}>
                          Cancel
                        </button>
                        <button type="button" className="btn btn-p" onClick={saveDate} style={{ minHeight: "32px" }}>
                          Save
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 12px", fontSize: "14px", color: "var(--text-2)", paddingTop: "4px" }}>
              {numLine.map((x) => (
                <span key={x} className="num">
                  {x}
                </span>
              ))}
              <span className="num" style={{ color: resCol, fontWeight: 500 }}>
                {resVal}
              </span>
              <button
                type="button"
                className="btn btn-q"
                aria-expanded={numOpen ? "true" : "false"}
                onClick={() => {
                  setNumOpen(!numOpen);
                  setResDraft(null);
                }}
                style={{ minHeight: "28px", padding: "0 4px", fontSize: "14px" }}
              >
                {numOpen ? "Done" : "Edit numbers"}
              </button>
            </div>
            {numOpen ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px 8px", paddingTop: "8px" }}>
                {NUMBER_FIELDS.map((f, i) => (
                  <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                    <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                      {f.label}
                    </span>
                    <input
                      ref={i === 0 ? firstNum : undefined}
                      className="ghost num"
                      type="text"
                      value={f.key === "result" ? resDraft ?? (s.r != null ? fr(s.r) : "") : s.numbers[f.key as keyof Numbers]}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (f.key === "result") {
                          setResDraft(v);
                          update({ r: parseR(v) });
                        } else update({ numbers: { ...s.numbers, [f.key]: v } });
                      }}
                      placeholder="Type it"
                      style={{ margin: 0, width: "100%", boxSizing: "border-box", padding: "0 8px", fontSize: "14px", fontWeight: 500, minHeight: "32px" }}
                    />
                  </label>
                ))}
              </div>
            ) : null}
          </section>

          {saved ? (
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link to="/log" className="btn btn-p" style={{ justifyContent: "center" }}>
                Done
              </Link>
              <span className="lbl" style={{ fontSize: "12px", textAlign: "center", lineHeight: "16px" }}>
                Changes save as you make them
              </span>
            </div>
          ) : (
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Link to="/log" className="btn btn-q">
                Cancel
              </Link>
              <button type="button" className="btn btn-p" onClick={saveStory} style={{ flex: 1, justifyContent: "center" }}>
                Save story
              </button>
            </div>
          )}
        </aside>
      </div>
    </Shell>
  );
}

/** One menu in the facts line. Shows the field's name until a value is picked. */
/** Note fields line up with the labels and the Talk it through card: no ghost-field pull, full width, 8px corners. */
const NOTE_FIELD = { display: "block", margin: 0, width: "100%", boxSizing: "border-box", border: "1px solid var(--border)", background: "var(--surface-inset)", borderRadius: "var(--r-md)", cursor: "text", fontSize: "14px", lineHeight: "20px", padding: "8px 12px", resize: "vertical", color: "var(--text-1)" } as const;

function Fact({ name, k, icon, value, menu, opts, onPick }: { name: string; k: string; icon: DetailIconName; value: string | null; menu: ReturnType<typeof useMenu<string>>; opts: { label: string; hint?: string }[]; onPick: (v: string) => void }) {
  const open = menu.isOpen(k);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open ? "true" : "false"} aria-label={`${name}: ${value ?? "not set"}`} onClick={() => menu.toggle(k)} style={factBtn}>
        <DetailIcon name={icon} />
        <span style={factText}>{value ?? name}</span>
      </button>
      {open ? (
        <>
          <Closer onClose={menu.close} />
          <OptionList label={name} opts={opts} value={value} onPick={onPick} style={{ left: 0, width: "240px", transformOrigin: "top left" }} />
        </>
      ) : null}
    </span>
  );
}

