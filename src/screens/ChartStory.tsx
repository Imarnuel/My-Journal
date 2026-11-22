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
import { dateTime, fr, signed, tone } from "../lib/format";
import {
  HEADSPACE,
  HEADSPACE_EMOJI,
  NUMBER_FIELDS,
  type NumKey,
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
  outcomeChoices,
  outcomePatch,
  parseR,
  rFromPrices,
  prevOf,
  sessionOf,
  storyFromEntry,
  tagSuggestions,
  voiceToast,
  type Numbers,
  type Story,
} from "../lib/story";
import { transcriptRuns, type VoiceNoteFill } from "../lib/voiceNote";
import { ChartViewer } from "./story/ChartViewer";
import { cancelVoiceRead, clearVoiceFailure, connectVoice, readVoice, retargetVoice, useVoiceReading, type ReadPhase, type VoiceProblem } from "./story/voiceReading";
import { startRecorder, type Recorder, type Recording } from "../lib/recorder";
import type { VoiceContext } from "../lib/voicePrompt";
import type { Outcome } from "../lib/voiceNote";
import { loadVoiceAudio, saveVoiceAudio } from "../data/voiceAudio";
import type { ChartRead } from "../lib/chartRead";
import { useMenu, useToastAction } from "./useKit";
import { StorySprite } from "./story/StorySprite";
import { CANVAS_EXTRAS, captionOf, newStoryStart } from "./story/canvas";
import { PairList } from "./story/PairMenu";
import { yourPairs } from "../lib/instruments";
import { chartFill } from "../lib/chartFill";
import { cancelChartRead, connectStory, dateFromRead, noteCorrection, queueChartRead, retargetReads, retryFailedReads, setDateAuto, useChartReading } from "./story/chartReading";
import { factsFull } from "../lib/chartFill";
import { localDate, localTime, REAL } from "../app/mode";
import { useVoice } from "../app/useVoice";
import { DEFAULT_SESSIONS, SETTINGS_DEFAULTS, usePref } from "../data/settings";
import { useStoryExtras } from "./story/extras";
import { Chevron, Closer, DetailRow, Dots, MenuItem, Mic, OptionList, Plus, ProblemCard, factBtn, factEmpty, factText, type Fx } from "./story/parts";

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
  // The story as of the latest render, for answers that arrive later (a voice note read by Gemini).
  const VOICE = useVoice();
  const storyRef = useRef<Story | null>(story);
  storyRef.current = story;

  // UI state
  const [sel, setSel] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pSec, setPSec] = useState(0);
  const [said, setSaid] = useState(false);
  const [tagQ, setTagQ] = useState("");
  const [kindFor, setKindFor] = useState<string | null>(null);

  const dateByHand = useRef(false);
  // Which number is being edited in place (DESIGN.md, Editing numbers), and what it was, for Escape.
  const [editingNum, setEditingNum] = useState<NumKey | null>(null);
  const editingRef = useRef<NumKey | null>(null);
  const numBefore = useRef<Pick<Story, "numbers" | "r" | "rByHand"> | null>(null);
  const [resDraft, setResDraft] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<{ e: Entry; index: number } | null>(null);
  // Why the last voice note gave nothing (frame 16's "unclear", or the real journal's other cases).
  const [voiceError, setVoiceError] = useState<VoiceProblem | null>(null);
  // Real journal: the microphone recorder, the last recording (kept for Try again), Gemini reading it,
  // and the story's own recording for playback (DESIGN.md › Real app).
  const recorder = useRef<Recorder | null>(null);
  const pendingAudio = useRef<Blob | null>(null);
  const saving = useRef(false); // Save story runs once per press
  // What was just filled (a brief glow) and the tags that just arrived (a short wave). DESIGN.md › Voice note
  // feedback. What the reading card says comes from the reading service (story/voiceReading.ts).
  const [justFilled, setJustFilled] = useState<Set<string>>(new Set());
  const [newTags, setNewTags] = useState<string[]>([]);
  // Charts being read (real journal): the facts line says so and the empty facts shimmer (DESIGN.md › Chart reading).
  // Reading lives outside the page (story/chartReading.ts), so it carries on into the saved story.
  // The chart open full screen, if any (story/ChartViewer.tsx).
  const [viewing, setViewing] = useState<number | null>(null);
  const draftKey = useRef(`draft:${Math.random().toString(36).slice(2)}`);
  const readTarget = saved ? (id ?? "") : draftKey.current;
  const chartsReading = useChartReading((st) => st.pending[readTarget] ?? 0);
  const chartsFailed = useChartReading((st) => st.failed[readTarget] ?? 0);
  // The voice note being read, or the one that couldn't be read (kept for Try again). Reading lives outside the
  // page (story/voiceReading.ts), so it carries on after the page is left and fills the saved story.
  const voicePhase = useVoiceReading((st) => st.phase[readTarget]);
  const voiceFailed = useVoiceReading((st) => st.failed[readTarget]);
  const reading = voicePhase != null;
  /** The problem the Notes card shows: the microphone's (on this page) or the reading's (from the service). */
  const shownError: VoiceProblem | null = voiceError ?? voiceFailed?.reason ?? null;
  const phase: ReadPhase = voicePhase ?? "sending";
  // "This chart has no prices on it" (#12), with its tip the first time only.
  const [noPrices, setNoPrices] = useState(false);
  const [seenTip, setSeenTip] = usePref("seenPricesTip");
  const [showTip, setShowTip] = useState(false);
  const applyRef = useRef<(r: ChartRead) => void>(() => {});
  useEffect(
    () =>
      connectStory(readTarget, {
        facts: () => storyRef.current ?? { pair: null, dir: null, numbers: { entry: "", stop: "", target: "" } },
        charts: () => storyRef.current?.charts ?? [],
        apply: (r) => applyRef.current(r),
      }),
    [readTarget],
  );
  // The voice note's answer, when it lands while this page is open (set further down, after its helpers).
  const applyVoiceRef = useRef<(res: VoiceNoteFill, rec?: Recording) => void>(() => {});
  useEffect(() => connectVoice(readTarget, { apply: (res, rec) => applyVoiceRef.current(res, rec) }), [readTarget]);
  /** Facts the reader filled on this page, to notice when the owner corrects one (noteCorrection). */
  const readerFilled = useRef<Record<string, string>>({});
  // A new story's date is automatic (its screenshot time) until set by hand: a chart's capture line may set it,
  // even when the chart is read after Save (story/chartReading.ts).
  useEffect(() => {
    if (!saved) setDateAuto(readTarget, !dateByHand.current);
  }, [saved, readTarget]);
  const readTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const [unreadable, setUnreadable] = useState(() => query("charts") === "unreadable");
  const recT = useRef<ReturnType<typeof setInterval>>(undefined);
  const playT = useRef<ReturnType<typeof setInterval>>(undefined);
  const tileGrid = useRef<HTMLDivElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const numBtns = useRef<Partial<Record<NumKey, HTMLButtonElement | null>>>({});
  const numGrid = useRef<HTMLDivElement>(null);
  // While a number is edited, the columns keep the widths they had, so nothing else moves.
  const [numCols, setNumCols] = useState<string | null>(null);

  useEffect(
    () => () => {
      clearInterval(recT.current);
      clearInterval(playT.current);
      recorder.current?.cancel();
      audioEl.current?.pause();
      readTimers.current.forEach(clearTimeout); // a note still being read carries on (story/voiceReading.ts)
    },
    [],
  );
  // A saved story's recording, if one was kept.
  useEffect(() => {
    if (!REAL || !saved || !id) return;
    let live = true;
    loadVoiceAudio(id).then((u) => live && setAudioUrl(u));
    return () => void (live = false);
  }, [saved, id]);

  const kindOf = (t: string) => pendingKinds[t] ?? tagKind(t);

  /** Apply a change: a saved story saves at once, a new one updates its draft. */
  const update = (p: Partial<Story>) => {
    // The owner changed a fact the reader had filled: noted on this device to improve the reading rules.
    const rf = readerFilled.current;
    const changed: [string, unknown][] = [["pair", p.pair], ["dir", p.dir], ["entry", p.numbers?.entry], ["stop", p.numbers?.stop], ["target", p.numbers?.target]];
    for (const [k, v] of changed)
      if (v !== undefined && rf[k] != null && String(v ?? "") !== rf[k]) {
        void noteCorrection(k, rf[k], String(v ?? ""));
        delete rf[k];
      }
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "48px 0" }}>
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
    cancelChartRead(charts[i]); // a removed chart fills nothing, even if its reading was under way
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
    // A new story in the real journal takes its date and time from the oldest screenshot, unless the owner
    // set them by hand (01-decisions.md "Capture": filled from screenshot time, always editable).
    const when = REAL && !saved && !dateByHand.current ? screenshotTime(imgs) : null;
    update({ charts: charts.concat(urls), ...(when ?? {}) });
    // The real journal reads each new chart (one at a time) and fills only the facts still empty.
    // Queued whatever the page knows yet: the reading service waits for the server to say reading is set up.
    if (REAL) imgs.forEach((f, i) => queueChartRead(f, urls[i], readTarget));
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
  const startRec = async () => {
    clearInterval(playT.current);
    clearInterval(recT.current);
    audioEl.current?.pause();
    setPlaying(false);
    setVoiceError(null);
    clearVoiceFailure(readTarget);
    if (REAL) {
      try {
        recorder.current = await startRecorder();
      } catch {
        setVoiceError("mic");
        return;
      }
    }
    setRecording(true);
    setRecSec(0);
    recT.current = setInterval(() => setRecSec((x) => x + 1), 1000);
  };
  const cancelRec = () => {
    clearInterval(recT.current);
    recorder.current?.cancel();
    recorder.current = null;
    setRecording(false);
    setRecSec(0);
  };
  const stopRec = async () => {
    clearInterval(recT.current);
    const secs = recSec;
    setRecording(false);
    setRecSec(0);
    setSaid(false);
    let rec: Recording | undefined;
    if (REAL && recorder.current) {
      rec = await recorder.current.stop();
      recorder.current = null;
    }
    await readAndFill(secs, rec);
  };
  /** Read a note (story/voiceReading.ts); the answer fills what is still empty when it arrives. */
  const readAndFill = (secs: number, rec?: Recording, ctx?: VoiceContext) => {
    setVoiceError(null);
    readVoice(readTarget, secs, rec, ctx ?? (rec ? voiceContext() : undefined));
  };
  /** The answer lands on this page: fill from the story as it is now, glow, and say what was filled. */
  const applyVoice = (res: VoiceNoteFill, rec?: Recording) => {
    const cur = storyRef.current ?? s;
    const { patch, filled, newKinds } = applyVoiceNote(cur, res);
    const prev = prevOf(cur, patch);
    registerKinds(newKinds);
    update(patch);
    if (rec) keepRecording(rec.blob);
    // What it filled glows together, new tags arrive in a short wave (not on reduced motion, handled in CSS).
    // Cleared after the glow so it never replays.
    const keys = (["before", "refl", "setup", "tags", "followed", "headspace"] as const).filter((k) => k in patch);
    setJustFilled(new Set(keys));
    setNewTags((patch.tags ?? []).filter((t) => !cur.tags.includes(t)));
    readTimers.current.push(setTimeout(() => (setJustFilled(new Set()), setNewTags([])), 1400));
    toastA(voiceToast(filled), () => update(prev), "voice");
  };
  applyVoiceRef.current = applyVoice;
  /**
   * Cancel while a note is read (DESIGN.md › Voice note feedback): reading stops at once, nothing is filled and
   * the recording is let go (the notes matter, not the audio). Undo for 6 seconds reads it again.
   */
  const cancelRead = () => {
    const args = cancelVoiceRead(readTarget);
    toastA("Voice note deleted", args ? () => readAndFill(args.secs, args.rec, args.ctx) : undefined, "deleted");
  };
  /**
   * Fill the story from one chart's reading (DESIGN.md › Chart reading): the rules are in lib/chartFill.ts; a
   * new story also takes its date from TradingView's own capture line, unless the date was set by hand.
   */
  const applyChartRead = (r: ChartRead) => {
    const cur = storyRef.current;
    if (!cur) return;
    const fill = chartFill(cur, r, yourPairs(useStore.getState().entries));
    if (!fill) return; // another pair, or against the story's direction: silent
    const patch: Partial<Story> = {};
    const parts: string[] = [];
    if (fill.pair) (patch.pair = fill.pair), parts.push("pair");
    if (fill.dir) (patch.dir = fill.dir), parts.push("direction");
    const at = dateFromRead(readTarget, r.takenAt);
    if (at) {
      const d = new Date(at);
      const [date, time] = [localDate(d), localTime(d)];
      if (date !== cur.date || time !== cur.time) Object.assign(patch, { date, time, session: sessionOf(time, sessionTimes()) }), parts.push("date");
    }
    if (fill.prices) (patch.numbers = { ...cur.numbers, ...fill.prices }), parts.push(fill.filled[fill.filled.length - 1]);
    // A box whose prices can't be read gets the designed card (frame 16); a box with no prices printed gets its
    // own card, with a tip the first time (DESIGN.md › Chart reading, #12).
    if (fill.unreadable) setUnreadable(true);
    else if (fill.noPrices) {
      setNoPrices(true);
      if (!seenTip) (setShowTip(true), setSeenTip(true));
    }
    if (!Object.keys(patch).length) return;
    const prev = prevOf(cur, patch);
    update(patch);
    Object.assign(readerFilled.current, {
      ...(fill.pair ? { pair: fill.pair } : {}),
      ...(fill.dir ? { dir: fill.dir } : {}),
      ...(fill.prices ? { entry: fill.prices.entry, stop: fill.prices.stop, ...(fill.prices.target ? { target: fill.prices.target } : {}) } : {}),
    });
    setJustFilled(new Set(["facts"]));
    readTimers.current.push(setTimeout(() => setJustFilled(new Set()), 1400));
    const what = listOf(parts);
    toastA(`${what[0].toUpperCase()}${what.slice(1)} read from your chart`, () => update(prev), "added");
  };
  applyRef.current = applyChartRead;
  /** A field's voice moment: shimmer while the note is read (only if still empty), glow just after. */
  const fx = (key: string, empty: boolean): Fx => (reading && empty ? "awaiting" : justFilled.has(key) ? "filled" : undefined);
  /** Keep the recording with the story, unless Settings › Voice notes › Keep recordings is off. */
  const keepRecording = (blob: Blob) => {
    const keep = (useStore.getState().settings.keepRecordings as boolean | undefined) ?? SETTINGS_DEFAULTS.keepRecordings;
    audioEl.current?.pause();
    audioEl.current = null;
    if (!keep) {
      setAudioUrl(null);
      return;
    }
    setAudioUrl(URL.createObjectURL(blob));
    if (saved && id) void saveVoiceAudio(id, blob);
    else pendingAudio.current = blob;
  };
  const len = s.voiceLen;
  const togglePlay = () => {
    if (REAL && audioUrl) {
      const a = audioEl.current ?? (audioEl.current = new Audio(audioUrl));
      a.ontimeupdate = () => setPSec(Math.floor(a.currentTime));
      a.onended = () => {
        setPlaying(false);
        setPSec(0);
      };
      if (playing) {
        a.pause();
        setPlaying(false);
      } else {
        void a.play();
        setPlaying(true);
      }
      return;
    }
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
  // Date and time (DESIGN.md › Date and time): no Save, no Escape to undo, no toast. The date changes live as it
  // is set (only whole, valid values), like every other fact; the picker simply closes.
  const setDate = (v: string) => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) return;
    const [d, t] = [v.slice(0, 10), v.slice(11, 16)];
    if (d === s.date && t === s.time) return;
    update({ date: d, time: t, session: sessionOf(t, sessionTimes()) });
    dateByHand.current = true;
    setDateAuto(readTarget, false);
  };
  const dirChip = s.status === "Analysis" ? "Analysis" : s.dir;
  const resVal = s.status === "Taken" ? (s.r != null ? fr(s.r) : "No result yet") : s.status;
  const resCol = s.status !== "Taken" || s.r == null ? "var(--text-2)" : tone(s.r);
  // Editing numbers (DESIGN.md): the line becomes the editor; the result works itself out from the prices
  // unless it was typed by hand.
  const autoR = rFromPrices(s.numbers, s.dir);
  // Say where the result came from only when it truly is the worked-out one.
  const autoResult = !s.rByHand && autoR != null && s.r != null && Math.round(autoR * 10) === Math.round(s.r * 10);
  // The numbers you can edit, in line order. A result is only typed on a taken trade.
  const numKeys = NUMBER_FIELDS.map((f) => f.key).filter((k) => k !== "result" || s.status === "Taken");
  const editNum = (k: NumKey | null) => {
    if (k && !editingRef.current && numGrid.current) setNumCols(getComputedStyle(numGrid.current).gridTemplateColumns);
    if (!k) setNumCols(null);
    editingRef.current = k;
    setEditingNum(k);
    setResDraft(null);
    numBefore.current = k ? { numbers: s.numbers, r: s.r, rByHand: s.rByHand } : null;
  };
  /** Enter, Escape or done: back to the line, focus on the number you were editing. */
  const leaveNum = (k: NumKey, revert: boolean) => {
    if (revert && numBefore.current) update(numBefore.current);
    editNum(null);
    requestAnimationFrame(() => numBtns.current[k]?.focus());
  };
  const setPrice = (k: keyof Numbers, v: string) => {
    const numbers = { ...s.numbers, [k]: v };
    const patch: Partial<Story> = { numbers };
    if ((k === "entry" || k === "stop" || k === "exit") && !s.rByHand) {
      const r = rFromPrices(numbers, s.dir);
      if (r != null) patch.r = r;
    }
    update(patch);
  };
  const setResult = (v: string) => {
    setResDraft(v);
    // Clearing the result hands it back to the prices; anything typed is kept as yours.
    if (v.trim() === "") update({ rByHand: false, r: autoR });
    else update({ r: parseR(v), rByHand: true });
  };
  // How did it end? One tap fills Exit and the R follows (DESIGN.md › Result). No toast: the numbers glow, and
  // a different tap or the Exit field changes it.
  const outcomes = outcomeChoices(s);
  const endAs = (key: Outcome) => {
    const p = outcomePatch(s, key);
    if (!p) return;
    update(p);
    setJustFilled(new Set(["facts"]));
    readTimers.current.push(setTimeout(() => setJustFilled(new Set()), 1400));
  };
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

  const saveStory = async () => {
    if (saving.current) return; // one story per press, even while the recording is written
    saving.current = true;
    const nid = nextId(useStore.getState().entries);
    const fresh = Object.entries(pendingKinds).filter(([t]) => !useStore.getState().tags.some((x) => x.t === t));
    if (fresh.length) setTags([...useStore.getState().tags, ...fresh.map(([t, k]) => ({ t, n: 1, k }))]);
    addEntry(entryFromStory(nid, s, kindOf));
    retargetReads(draftKey.current, nid); // charts still being read fill the saved story
    retargetVoice(draftKey.current, nid); // and so does a voice note still being read
    if (s.voiceLen) setExtras(nid, { voiceLen: s.voiceLen });
    // The recording is written before the story page opens, so the page finds it.
    if (pendingAudio.current) await saveVoiceAudio(nid, pendingAudio.current);
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
              <h1 style={{ margin: 0, lineHeight: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
                {s.pair}{" "}
                {dirChip ? <span className="kchip">{dirChip}</span> : null}
                {s.textbook ? <span className="kchip" style={{ color: "var(--text-1)", background: "var(--surface-pressed)", borderColor: "transparent" }}>Textbook example</span> : null}
              </h1>
              <p className="meta" style={{ margin: 0 }}>
                {`${s.status} · ${s.account} · ${dtLabel}${s.closeTime ? ` to ${s.closeTime}` : ""} · ${s.session}`}
              </p>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, lineHeight: "32px" }}>New chart story</h1>
              <p className="meta" style={{ margin: 0 }}>
                {/* The real journal has no voice notes yet (DESIGN.md › Real app, approved wording). */}
                {REAL ? "Drop the charts and add a note if you like." : "Drop the charts and talk it through. Your note fills the tags."}
              </p>
            </>
          )}
        </div>
        {saved ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", alignSelf: s.status === "Taken" ? undefined : "flex-start" }}>
            {/* The result only when there is one: a running or watched entry already says its status under the title. */}
            {s.status === "Taken" ? (
              <span className="num" style={{ fontSize: "24px", fontWeight: 600, color: resCol, letterSpacing: "var(--tracking-figure)", lineHeight: "32px" }}>
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
                {/* Click to open it full screen (DESIGN.md › Chart viewer). */}
                <button type="button" className="chart kchart-open" aria-label={`Open chart ${selI + 1} of ${charts.length}`} aria-haspopup="dialog" onClick={() => setViewing(selI)} style={{ borderRadius: "var(--r-card)" }}>
                  {isImage(big) ? (
                    <img src={big} alt="Your chart" style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "contain", background: "var(--surface-inset)" }} />
                  ) : (
                    <svg viewBox="0 0 320 180" role="img" aria-label={`${captionOf(big) || "Chart"}, chart ${selI + 1} of ${charts.length}`} style={{ display: "block", width: "100%", height: "auto" }}>
                      <use href={`#${big}`} />
                    </svg>
                  )}
                </button>
                {viewing != null && charts[viewing] ? (
                  <ChartViewer charts={charts} index={viewing} isImage={isImage} onIndex={(i) => (setViewing(i), setSel(i))} onClose={() => setViewing(null)} />
                ) : null}
                <figcaption style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="lbl">{isImage(big) ? "" : captionOf(big)}</span>
                  <span className="lbl">{`${selI + 1} of ${charts.length}`}</span>
                </figcaption>
              </figure>
            ) : (
              <label style={{ position: "relative", font: "inherit", border: "1.5px dashed var(--border-strong)", borderRadius: "var(--r-card)", color: "var(--text-3)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", aspectRatio: "16 / 9", textAlign: "center", padding: "24px" }}>
                <Plus />
                {/* An MT5 trade without charts keeps the design's line; a new story asks for its charts. */}
                {entry?.mt5 ? "Scroll back on your chart and take one now. It still counts." : "Drop, paste or choose charts"}
                <input type="file"
                title="" accept="image/*" multiple onChange={onPick} style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }} />
              </label>
            )}
            {charts.length ? (
            <>
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
                    {/* Every chart can be removed, the last one too (DESIGN.md › Chart tiles): the drop area returns. */}
                    <button type="button" className="ktile-rm" aria-label={`Remove ${ordinal(i)} chart`} onClick={() => removeChart(i)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  </figure>
                );
              })}
              <label aria-label="Add or paste another chart" style={{ position: "relative", font: "inherit", border: "1.5px dashed var(--border-strong)", borderRadius: "var(--r-md)", color: "var(--text-3)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", fontSize: "12px", aspectRatio: "16 / 9", lineHeight: "16px" }}>
                <Plus />
                Add
                <input type="file"
                title="" accept="image/*" multiple onChange={onPick} style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }} />
              </label>
            </div>
            <p id="tiles-hint" className="lbl" style={{ margin: 0, fontSize: "12px", lineHeight: "16px" }}>
              Drag to reorder.
            </p>
            </>
            ) : null}
            {noPrices && !unreadable && !s.numbers.entry ? (
              <ProblemCard title="This chart has no prices on it" text={showTip ? "Click the position box before taking the screenshot and its prices show." : undefined}>
                <button
                  type="button"
                  className="btn btn-q"
                  onClick={() => {
                    setNoPrices(false);
                    editNum("entry");
                  }}
                >
                  Type the numbers
                </button>
              </ProblemCard>
            ) : null}
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
                    editNum("entry");
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
            {reading ? (
              // Gemini reads the note (real journal); the notes stay editable meanwhile. One line that says what is
              // really happening, shimmering in the voice colour; each new message cross-fades in.
              <div role="status" aria-live="polite" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "var(--r-card)", background: "var(--surface-inset)", border: "1px solid var(--voice-border)", minHeight: "64px", boxSizing: "border-box" }}>
                <span aria-hidden="true" className="kbreathe" style={{ flex: "none", width: "12px", height: "12px", borderRadius: "6px", background: "var(--voice)" }} />
                <span style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                  <span key={phase} className="kshimmer kmsg" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-1)" }}>
                    {READ_COPY[phase].title}
                  </span>
                  {READ_COPY[phase].text ? (
                    <span key={`${phase}-t`} className="meta kmsg" style={{ fontSize: "14px" }}>
                      {READ_COPY[phase].text}
                    </span>
                  ) : null}
                </span>
                <button type="button" className="btn btn-q" onClick={cancelRead}>
                  Cancel
                </button>
              </div>
            ) : shownError && !recording ? (
              <ProblemCard title={VOICE_COPY[shownError].title} text={VOICE_COPY[shownError].text}>
                {(shownError === "offline" || shownError === "failed") && voiceFailed?.rec ? (
                  <>
                    <button type="button" className="btn btn-g" onClick={() => voiceFailed.rec && readAndFill(voiceFailed.rec.seconds, voiceFailed.rec)}>
                      Try again
                    </button>
                    {/* Hear what you said while it waits (the recording is kept). */}
                    <KeptRecording rec={voiceFailed.rec} />
                  </>
                ) : (
                  <button type="button" className="btn btn-g" onClick={startRec}>
                    <Mic />
                    Record again
                  </button>
                )}
              </ProblemCard>
            ) : VOICE && !s.voice && !recording ? (
              <button type="button" onClick={startRec} style={{ font: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "16px", borderRadius: "var(--r-card)", background: "var(--surface-inset)", border: "1px dashed var(--border-strong)", color: "var(--text-1)", cursor: "pointer" }}>
                <span className="kvoice" style={{ flex: "none", width: "48px", height: "48px", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mic />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500, lineHeight: "20px" }}>Talk it through</span>
                  <span className="meta" style={{ fontSize: "12px", lineHeight: "16px" }}>
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
                <label htmlFor="nB" className="lbl" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-2)", lineHeight: "20px" }}>
                  Before / during
                </label>
              </div>
              <div className="kfx" data-fx={fx("before", !s.before.trim())} style={{ borderRadius: "var(--r-md)" }}>
              <textarea id="nB" className="ghost" rows={2} placeholder={REAL ? undefined : "Fills from your note, or write it yourself"} value={s.before} onChange={(e) => update({ before: e.target.value })} style={NOTE_FIELD} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Tidied (DESIGN.md, Notes): the label row is only the label and a small Suggested badge, so it
                  sits 8px from its field like Before / during; Keep and Delete move under the field. */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label htmlFor="nR" className="lbl" style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-2)", lineHeight: "20px" }}>
                  Reflection
                </label>
                {s.suggested && s.refl ? (
                  <span className="ksugg" title="Inferred from your note">
                    Suggested
                  </span>
                ) : null}
              </div>
              <div className="kfx" data-fx={fx("refl", !s.refl.trim())} style={{ borderRadius: "var(--r-md)" }}>
              <textarea id="nR" className="ghost" rows={2} placeholder={REAL ? undefined : "Fills from your note, or write it yourself"} value={s.refl} onChange={(e) => update({ refl: e.target.value, suggested: false })} style={NOTE_FIELD} />
              </div>
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
                  {REAL && !audioUrl ? null : (
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
                  )}
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
            <Link to={`/story/${analysis.id}`} className="card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px 24px", borderRadius: "var(--r-card)", textDecoration: "none", color: "var(--text-1)" }}>
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
              {REAL ? null : (
                <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                  {s.voice ? "From your note · tap anything to change" : "From your note, or set them yourself"}
                </span>
              )}
            </div>
            <dl style={{ margin: 0, display: "flex", flexDirection: "column" }}>
              <DetailRow label="Setup" icon={<DetailIcon name="setup" />} fx={fx("setup", !s.setup)}>
                <div style={{ position: "relative" }}>
                  <button type="button" className="ghost tagfield" aria-haspopup="listbox" aria-expanded={exp("setup")} aria-label={`Setup: ${s.setup ?? "Pick a setup"}`} onClick={() => menu.toggle("setup")} style={{ justifyContent: "space-between", position: "relative", zIndex: 5 }}>
                    {s.setup ? <span className="pill">{s.setup}</span> : <span style={{ fontSize: "14px", color: "var(--text-3)" }}>Pick a setup</span>}
                    <Chevron />
                  </button>
                  {menu.isOpen("setup") ? (
                    <>
                      <Closer onClose={menu.close} />
                      <OptionList label="Setup" opts={setupNames.map((label) => ({ label }))} value={s.setup} onPick={pick("setup")} style={UNDER_FIELD}>
                        <Link to="/playbook/new" className="kit-opt" style={{ font: "inherit", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "8px", background: "transparent", border: 0, borderRadius: "var(--r-md)", padding: "0 12px", minHeight: "32px", cursor: "pointer", width: "100%", color: "var(--text-2)", textDecoration: "none", boxSizing: "border-box" }}>
                          <Plus />
                          New setup
                        </Link>
                      </OptionList>
                    </>
                  ) : null}
                </div>
              </DetailRow>
              <DetailRow label="Tags" icon={<DetailIcon name="tags" />} fx={fx("tags", !s.tags.length)}>
                <div style={{ position: "relative" }}>
                  <div className="ghost tagfield" role="group" aria-label="Tags" onClick={() => document.getElementById("taginput")?.focus()} style={{ cursor: "text", flexWrap: "wrap", position: "relative", zIndex: 5 }}>
                    {s.tags.map((t, i) => (
                      <span key={t} className={newTags.includes(t) ? "pill knew" : "pill"} style={{ display: "inline-flex", alignItems: "center", gap: "4px", paddingRight: "4px", ["--wave" as string]: `${WAVE_MS[Math.min(newTags.indexOf(t), WAVE_MS.length - 1)] ?? 0}ms` }}>
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
                      style={{ flex: 1, font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "transparent", border: 0, outline: "none", padding: "4px 2px" }}
                    />
                  </div>
                  {menu.isOpen("tag") ? (
                    <>
                      <Closer onClose={menu.close} />
                      <div id="tagsug" role="listbox" aria-label="Matching tags" className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", boxSizing: "border-box", ...UNDER_FIELD }}>
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
                      <div role="dialog" aria-label="New tag" className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", display: "flex", flexDirection: "column", boxSizing: "border-box", ...UNDER_FIELD, gap: "8px" }}>
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
              <DetailRow label="Plan" icon={<DetailIcon name="plan" />} fx={fx("followed", s.followed == null)}>
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
              <DetailRow label="Headspace" icon={<DetailIcon name="headspace" />} fx={fx("headspace", !s.headspace)}>
                <div style={{ position: "relative" }}>
                  <button type="button" className="ghost tagfield" aria-haspopup="listbox" aria-expanded={exp("head")} aria-label={`Headspace: ${s.headspace ?? "Pick one"}`} onClick={() => menu.toggle("head")} style={{ justifyContent: "space-between", position: "relative", zIndex: 5 }}>
                    {s.headspace ? (
                      <span className="pill" style={{ gap: "4px" }}>
                        {/* ui-lint-ignore: an emoji in a chip's 16px line */}{HEADSPACE_EMOJI[s.headspace] ? <span aria-hidden="true" style={{ fontSize: "14px", lineHeight: "16px" }}>{HEADSPACE_EMOJI[s.headspace]}</span> : null}
                        {s.headspace}
                      </span>
                    ) : <span style={{ fontSize: "14px", color: "var(--text-3)" }}>Pick one</span>}
                    <Chevron />
                  </button>
                  {menu.isOpen("head") ? (
                    <>
                      <Closer onClose={menu.close} />
                      <OptionList label="Headspace" opts={HEADSPACE.map((label) => ({ label, lead: HEADSPACE_EMOJI[label] }))} value={s.headspace} onPick={pick("headspace")} style={UNDER_FIELD} />
                    </>
                  ) : null}
                </div>
              </DetailRow>
            </dl>
          </section>

          <section aria-label="Trade" className="kfx kfx-soft" data-fx={chartsReading && (!s.pair || !s.numbers.entry) ? "awaiting" : justFilled.has("facts") ? "filled" : undefined} style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px", borderRadius: 0 }}>
            {chartsReading ? (
              <span role="status" className="kshimmer kmsg" style={{ fontSize: "12px", lineHeight: "16px", fontWeight: 500, alignSelf: "flex-start" }}>
                Reading your chart…
              </span>
            ) : chartsFailed && !factsFull(s) ? (
              // Still couldn't read after asking again (#22), or out of free requests (#23): one quiet line.
              <span role="status" className="lbl kmsg" style={{ fontSize: "12px", lineHeight: "16px", display: "inline-flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                Couldn't read your chart just now ·
                <button type="button" onClick={() => retryFailedReads(readTarget)} style={{ font: "inherit", fontWeight: 500, color: "var(--text-1)", background: "transparent", border: 0, padding: "4px 2px", margin: "-4px 0", minHeight: "24px", cursor: "pointer" }}>
                  Try again
                </button>
              </span>
            ) : (
              <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                {REAL ? "Tap anything to change" : saved ? "From your charts and MT5, or typed by you" : "Read from your charts and MT5 · tap anything to change"}
              </span>
            )}
            {/* Each fact leads with its icon and they sit 16px apart, no dot separators (the Trade log's facts rule). */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px" }}>
              <PairFact value={s.pair} menu={menu} onPick={pick("pair")} />
              <Fact name="Direction" k="dir" icon={s.dir === "Long" ? "long" : s.dir === "Short" ? "short" : "nodir"} value={s.dir} menu={menu} opts={[{ label: "Long" }, { label: "Short" }]} onPick={pick("dir")} />
              <Fact name="Status" k="status" icon="status" value={s.status} menu={menu} opts={STATUS_OPTS} onPick={(v) => pick("status")(v as Status)} />
              <Fact name="Account" k="acct" icon="account" value={s.account} menu={menu} opts={acctNames.map((label) => ({ label }))} onPick={pick("account")} />
              <span style={{ position: "relative", display: "inline-flex" }}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={exp("dt")}
                  aria-label={`Date and time: ${dtLabel}`}
                  onClick={() => menu.toggle("dt")}
                  style={factBtn}
                >
                  <DetailIcon name="date" />
                  <span style={factText}>{dtLabel}</span>
                </button>
                {menu.isOpen("dt") ? (
                  <>
                    <Closer onClose={menu.close} />
                    <div role="dialog" aria-label="Date and time" className="kmenu" style={{ position: "absolute", zIndex: 6, top: "calc(100% + 6px)", display: "flex", flexDirection: "column", boxSizing: "border-box", left: 0, width: "260px", gap: "8px", transformOrigin: "top left" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--text-2)" }}>
                        Date and time
                        <input
                          type="datetime-local"
                          value={dtValue}
                          onChange={(e) => setDate(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.preventDefault(), menu.close());
                          }}
                          style={{ font: "inherit", fontSize: "14px", color: "var(--text-1)", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "8px 12px" }}
                        />
                      </label>
                      <span style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: "16px" }}>The session follows the time.</span>
                    </div>
                  </>
                ) : null}
              </span>
            </div>
            <div ref={numGrid} role="group" aria-label="Numbers" className="knums" style={numCols ? { gridTemplateColumns: numCols } : undefined}>
              {numKeys.map((k, i) => {
                const isRes = k === "result";
                const label = NUMBER_FIELDS.find((f) => f.key === k)!.label;
                const value = isRes ? (s.r != null ? fr(s.r) : "") : s.numbers[k];
                if (editingNum === k) {
                  return (
                    <label key={k} className={isRes ? "knum knum-edit knum-res" : "knum knum-edit"}>
                      {isRes ? null : <span className="knum-k">{label}</span>}
                      <input
                        ref={(el) => {
                          // Focused as it appears, not a frame later: a quick second Tab would otherwise land
                          // elsewhere and close the editor.
                          if (el && document.activeElement !== el) (el.focus({ preventScroll: true }), el.select());
                        }}
                        aria-label={label}
                        className="knum-in"
                        type="text"
                        inputMode={k === "size" ? "text" : "decimal"}
                        autoComplete="off"
                        enterKeyHint="done"
                        placeholder={isRes ? R_HINT_TYPING : undefined}
                        value={isRes ? resDraft ?? (s.r != null ? signed(s.r) : "") : value}
                        onChange={(e) => (isRes ? setResult(e.target.value) : setPrice(k, e.target.value))}
                        onBlur={() => editingRef.current === k && editNum(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            leaveNum(k, e.key === "Escape");
                          } else if (e.key === "Tab") {
                            // Tab goes straight into the next number, so a whole trade types in one go.
                            const next = numKeys[i + (e.shiftKey ? -1 : 1)];
                            e.preventDefault();
                            if (next) editNum(next);
                            else leaveNum(k, false);
                          }
                        }}
                      />
                      {isRes ? <span aria-hidden="true" className="knum-r">R</span> : null}
                    </label>
                  );
                }
                return (
                  <button
                    key={k}
                    ref={(el) => {
                      numBtns.current[k] = el;
                    }}
                    type="button"
                    className={isRes ? "knum knum-res" : "knum"}
                    aria-label={value ? (isRes ? `Result ${resVal}` : undefined) : `${label} empty`}
                    onClick={() => editNum(k)}
                  >
                    {isRes ? null : <span className="knum-k">{`${label} `}</span>}
                    {/* An empty result shows a grey example of what goes there (the owner, 2026-11-22, replacing
                        "No result yet"). */}
                    <span className={value ? "knum-v" : "knum-v knum-empty"} style={isRes && value ? { color: resCol, fontWeight: 500 } : isRes ? { color: "var(--text-3)" } : undefined}>
                      {isRes ? (value ? resVal : R_HINT) : value || "\u00a0"}
                    </span>
                  </button>
                );
              })}
              {s.status !== "Taken" ? (
                <span className="num" style={{ color: resCol, fontWeight: 500, gridColumn: "span 2" }}>
                  {resVal}
                </span>
              ) : null}
            </div>
            {editingNum && autoResult ? <span style={{ fontSize: "12px", lineHeight: "16px", color: "var(--text-3)" }}>Result from entry, stop and exit</span> : null}
            {outcomes.length && !editingNum ? (
              <div role="group" aria-label="How did it end?" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0 8px", fontSize: "12px", lineHeight: "16px" }}>
                <span className="lbl" style={{ fontSize: "12px", lineHeight: "16px" }}>
                  How did it end?
                </span>
                {outcomes.map((o, i) => (
                  <Fragment key={o.key}>
                    {i ? (
                      <span aria-hidden="true" className="lbl" style={{ fontSize: "12px" }}>
                        ·
                      </span>
                    ) : null}
                    <button type="button" onClick={() => endAs(o.key)} style={{ font: "inherit", fontSize: "12px", lineHeight: "16px", fontWeight: 500, color: "var(--text-1)", background: "transparent", border: 0, padding: "4px 0", minHeight: "24px", cursor: "pointer", display: "inline-flex", gap: "4px" }}>
                      {OUTCOME_LABEL[o.key]}
                      <span style={{ color: tone(o.r) }}>{fr(o.r)}</span>
                    </button>
                  </Fragment>
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
const NOTE_FIELD = { display: "block", margin: 0, width: "100%", boxSizing: "border-box", border: "1px solid var(--border)", background: "var(--surface-inset)", borderRadius: "var(--r-md)", cursor: "text", fontSize: "14px", lineHeight: "20px", padding: "8px 12px", resize: "none", color: "var(--text-1)" } as const;

function Fact({ name, k, icon, value, menu, opts, onPick }: { name: string; k: string; icon: DetailIconName; value: string | null; menu: ReturnType<typeof useMenu<string>>; opts: { label: string; hint?: string }[]; onPick: (v: string) => void }) {
  const open = menu.isOpen(k);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open ? "true" : "false"} aria-label={`${name}: ${value || "not set"}`} onClick={() => menu.toggle(k)} style={factBtn}>
        <DetailIcon name={icon} />
        <span style={value ? factText : factEmpty}>{value || name}</span>
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

/** The facts line's Pair (DESIGN.md › Pair picker): search or type, the owner's pairs first. */
function PairFact({ value, menu, onPick }: { value: string | null; menu: ReturnType<typeof useMenu<string>>; onPick: (v: string) => void }) {
  const open = menu.isOpen("pair");
  const entries = useStore((st) => st.entries);
  const yours = useMemo(() => yourPairs(entries), [entries]);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open ? "true" : "false"} aria-label={`Pair: ${value || "not set"}`} onClick={() => menu.toggle("pair")} style={factBtn}>
        <DetailIcon name="pair" />
        <span style={value ? factText : factEmpty}>{value || "Pair"}</span>
      </button>
      {open ? (
        <>
          <Closer onClose={menu.close} />
          <PairList value={value} yours={yours} onPick={onPick} style={{ left: 0, transformOrigin: "top left" }} />
        </>
      ) : null}
    </span>
  );
}

/** The owner's session times (Settings), so a story's session follows them. */
const sessionTimes = () => (useStore.getState().settings.sessions as [string, string, string][] | undefined) ?? DEFAULT_SESSIONS;

/** Date, time and session from the oldest screenshot's file time (a pasted image carries the time it was pasted). */
function screenshotTime(files: File[]): Pick<Story, "date" | "time" | "session"> | null {
  const ms = Math.min(...files.map((f) => f.lastModified).filter((n) => Number.isFinite(n) && n > 0));
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms);
  const time = localTime(d);
  return { date: localDate(d), time, session: sessionOf(time, sessionTimes()) };
}


/**
 * Voice note wording. "unclear" is frame 16's; the rest are the real journal's, approved by the owner
 * (DESIGN.md › Real app, voice notes).
 */
const VOICE_COPY: Record<VoiceProblem, { title: string; text: string }> = {
  unclear: { title: "Couldn't make out your note", text: "Too much background noise. Nothing was filled in, so nothing wrong was saved." },
  mic: { title: "The microphone is off", text: "Allow the microphone for this site in your browser, then record again." },
  offline: { title: "You're offline", text: "Your recording is kept. Try again when you're back online." },
  failed: { title: "Couldn't read your note just now", text: "Your recording is kept. Try again in a moment." },
};

/** What the voice note server needs to map a note onto the user's own setups, tags and language. */
function voiceContext(): VoiceContext {
  const st = useStore.getState();
  return {
    setups: st.setups.filter((x) => !x.archived).map((x) => x.name),
    tags: [...st.tags].sort((a, b) => b.n - a.n).map((t) => ({ t: t.t, k: t.k })),
    headspaces: HEADSPACE,
    language: (st.settings.voiceLanguage as string | undefined) ?? SETTINGS_DEFAULTS.voiceLanguage,
  };
}

/** What the reading card says. "sending" and "listening" are real events, "busy" comes from the server;
 *  "writing", "still" and "long" are timed and only follow them. Approved by the owner (DESIGN.md). */
const READ_COPY: Record<ReadPhase, { title: string; text?: string }> = {
  sending: { title: "Sending your note…" },
  listening: { title: "Listening to your note…" },
  writing: { title: "Writing your notes…" },
  busy: { title: "Busy right now, trying again…" },
  still: { title: "Still writing.", text: "Longer notes take a little longer." },
  long: { title: "Taking longer than usual" },
};

/** The empty result's grey example ("3R", the owner: "use 3R to reduce clutter"), and "3" inside the box, where R
 *  follows it. */
const R_HINT = "3R";
const R_HINT_TYPING = "3";

/**
 * A menu under a Details field lines up with the field you see: same left edge, same width. The Details fields
 * (Setup, Tags, Headspace) keep their text on the Plan control's left edge and hang their hover fill 12px into
 * the row's gutter, and reach the same right edge as the Plan control (`.tagfield`; the owner, 2026-11-22: "our
 * app needs to look clean"; first audit).
 */
const UNDER_FIELD = { left: "-12px", width: "calc(100% + 12px)" } as const;

/** The one-tap outcomes under the numbers (approved wording, DESIGN.md › Result). */
const OUTCOME_LABEL: Record<Outcome, string> = { target: "Target", stop: "Stop", breakeven: "Breakeven" };

/** The abort reason that marks a read the owner cancelled (not the time limit, which offers Try again). */

/** New tags arrive in a short wave, quicker as it goes (never a metronome), all in under 200ms. */
const WAVE_MS = [0, 45, 80, 105, 125, 140, 150];

/** Play / pause the recording kept for Try again, on the failure card. */
function KeptRecording({ rec }: { rec: Recording }) {
  const [on, setOn] = useState(false);
  const el = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(rec.blob);
    const a = new Audio(url);
    a.onended = () => setOn(false);
    el.current = a;
    return () => {
      a.pause();
      URL.revokeObjectURL(url);
    };
  }, [rec]);
  return (
    <button
      type="button"
      className="kplay"
      aria-label={on ? "Pause your recording" : "Play your recording"}
      onClick={() => {
        const a = el.current;
        if (!a) return;
        if (on) a.pause();
        else void a.play();
        setOn(!on);
      }}
    >
      {on ? (
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
  );
}

/** Pairs the chart reader should match: the menu's, plus any the user has logged. */

/** "pair, direction and 3 prices". */
function listOf(parts: string[]): string {
  return parts.length <= 1 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
