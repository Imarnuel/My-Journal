// Voice note reading, kept apart from the story page like chart reading (story/chartReading.ts), so a note keeps
// being read after the page is left (the owner, 2026-11-22: "build 1 to 3"): record, tap Done, move on. An open
// story page shows the reading card and takes the answer itself (glow, toast); a saved story that isn't open is
// filled quietly; a new story left without saving lets its reading go. What the card says, and when, lives here
// too, so a page opened mid-reading picks up where the reading is. DESIGN.md › Voice note feedback.
import { create } from "zustand";
import { useStore } from "../../data/store";
import { SETTINGS_DEFAULTS, setReadingPaused } from "../../data/settings";
import { saveVoiceAudio } from "../../data/voiceAudio";
import { readVoiceNote, type VoiceNoteFill, type VoiceNoteResult, type VoicePhase } from "../../lib/voiceNote";
import type { Recording } from "../../lib/recorder";
import type { VoiceContext } from "../../lib/voicePrompt";
import { applyVoiceNote, entryPatch, storyFromEntry } from "../../lib/story";
import { CANVAS_EXTRAS } from "./canvas";
import { useStoryExtras } from "./extras";

/** Which story a note is for: a new story's draft key ("draft:…"), or a saved entry's id. */
type Target = string;
/** What the reading card says: real steps ("sending", "listening", "busy"), then timed reassurance only after them. */
export type ReadPhase = VoicePhase | "writing" | "still" | "long";
export type VoiceProblem = Exclude<VoiceNoteResult, { ok: true }>["reason"];
/** A note that couldn't be read keeps its recording (in memory only) for Try again. */
export type VoiceFailure = { reason: VoiceProblem; rec?: Recording; secs: number };

type Job = { target: Target; secs: number; rec?: Recording; ctx?: VoiceContext; stop: AbortController; timers: ReturnType<typeof setTimeout>[] };

/** An open story page takes the answer itself: fills what is empty, glows, says what it filled. */
export type VoicePort = { apply: (fill: VoiceNoteFill, rec?: Recording) => void };

export const useVoiceReading = create<{ phase: Record<Target, ReadPhase | undefined>; failed: Record<Target, VoiceFailure | undefined> }>(() => ({ phase: {}, failed: {} }));

const jobs = new Map<Target, Job>();
const ports = new Map<Target, VoicePort>();
const CANCELLED = "cancelled";

const setPhase = (t: Target, p: ReadPhase | undefined | ((cur: ReadPhase | undefined) => ReadPhase | undefined)) =>
  useVoiceReading.setState((s) => ({ phase: { ...s.phase, [t]: typeof p === "function" ? p(s.phase[t]) : p } }));
const setFailed = (t: Target, f: VoiceFailure | undefined) => useVoiceReading.setState((s) => ({ failed: { ...s.failed, [t]: f } }));

export function connectVoice(target: Target, port: VoicePort): () => void {
  ports.set(target, port);
  return () => {
    if (ports.get(target) === port) ports.delete(target);
  };
}

/** Read a note for a story (a new reading for the same story replaces one under way). */
export function readVoice(target: Target, secs: number, rec?: Recording, ctx?: VoiceContext) {
  jobs.get(target)?.stop.abort(CANCELLED);
  setFailed(target, undefined);
  const job: Job = { target, secs, rec, ctx, stop: new AbortController(), timers: [] };
  jobs.set(target, job);
  void run(job);
}

/** Cancel: reading stops at once and nothing is filled. Returns what Undo needs to read it again. */
export function cancelVoiceRead(target: Target): { secs: number; rec?: Recording; ctx?: VoiceContext } | null {
  const job = jobs.get(target);
  if (!job) return null;
  job.stop.abort(CANCELLED);
  end(job);
  return { secs: job.secs, rec: job.rec, ctx: job.ctx };
}

export const clearVoiceFailure = (target: Target) => setFailed(target, undefined);

/** A new story was saved: its note, still being read (or waiting for Try again), now belongs to the saved story. */
export function retargetVoice(from: Target, to: Target) {
  const job = jobs.get(from);
  if (job) {
    jobs.delete(from);
    job.target = to;
    jobs.set(to, job);
    const p = useVoiceReading.getState().phase[from];
    setPhase(from, undefined);
    setPhase(to, p);
  }
  const f = useVoiceReading.getState().failed[from];
  if (f) (setFailed(from, undefined), setFailed(to, f));
}

function end(job: Job) {
  job.timers.forEach(clearTimeout);
  if (jobs.get(job.target) === job) jobs.delete(job.target);
  setPhase(job.target, undefined);
}

async function run(job: Job) {
  setPhase(job.target, "sending");
  // Timed reassurance only after the real steps: never earlier than what is actually happening.
  job.timers = [
    setTimeout(() => setPhase(job.target, (p) => (p === "listening" ? "writing" : p)), 4000),
    setTimeout(() => setPhase(job.target, (p) => (p === "long" ? p : "still")), 20_000),
    setTimeout(() => setPhase(job.target, "long"), 45_000),
  ];
  const onPhase = (p: VoicePhase) => setPhase(job.target, (cur) => (p === "listening" && cur !== "sending" ? cur : p));
  const res = await readVoiceNote(job.secs, job.rec, job.ctx, { onPhase, signal: job.stop.signal });
  // Cancelled (or replaced by a newer reading): the card was already reset; leave everything alone.
  if (job.stop.signal.aborted && job.stop.signal.reason === CANCELLED) return;
  end(job);
  if (!res.ok) {
    if (res.quota) setReadingPaused(true); // Settings says reading is paused until tomorrow (#23)
    setFailed(job.target, { reason: res.reason, rec: job.rec, secs: job.secs });
    return;
  }
  if (job.rec) setReadingPaused(false);
  const port = ports.get(job.target);
  if (port) port.apply(res, job.rec);
  else fillSavedEntry(job.target, res, job.rec);
}

/** A saved story that isn't open: the same rules as on the page, filled quietly (no toast away from the story). */
function fillSavedEntry(id: Target, fill: VoiceNoteFill, rec?: Recording) {
  const st = useStore.getState();
  const e = st.entries.find((x) => x.id === id);
  if (!e) return; // a new story left without saving: its note goes with it
  const story = storyFromEntry(e, CANVAS_EXTRAS[e.id], useStoryExtras.getState().byId[e.id]);
  const { patch, newKinds } = applyVoiceNote(story, fill);
  const fresh = Object.entries(newKinds).filter(([t]) => !st.tags.some((x) => x.t.toLowerCase() === t.toLowerCase()));
  if (fresh.length) st.setTags([...st.tags, ...fresh.map(([t, k]) => ({ t, n: 1, k }))]);
  st.updateEntry(id, entryPatch(e, story, patch, (t) => newKinds[t] ?? st.tagKind(t)));
  if ("voiceLen" in patch) useStoryExtras.getState().set(id, { voiceLen: patch.voiceLen ?? undefined });
  const keep = (st.settings.keepRecordings as boolean | undefined) ?? SETTINGS_DEFAULTS.keepRecordings;
  if (rec && keep) void saveVoiceAudio(id, rec.blob);
}
