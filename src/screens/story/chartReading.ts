// Chart reading for the real journal, kept apart from the story page (DESIGN.md › Chart reading, "When reading
// can't happen right away"), so a reading still running when a new story is saved fills the saved story, a chart
// removed before it is read fills nothing, nothing is read once every fact is set, an offline chart is read once
// the device is back online, and a busy service is quietly asked again a little later. Charts are read one at a
// time, in the order they were added.
import { create } from "zustand";
import { chartKey, useStore } from "../../data/store";
import { idbStorage } from "../../data/persist";
import { DEFAULT_SESSIONS, setReadingPaused } from "../../data/settings";
import { readChart } from "../../lib/chartReader";
import { aiReady } from "../../app/useVoice";
import type { ChartRead } from "../../lib/chartRead";
import { chartFill, factsFull, type FillFacts } from "../../lib/chartFill";
import { INSTRUMENTS, yourPairs } from "../../lib/instruments";
import { entryPatch, sessionOf, storyFromEntry } from "../../lib/story";
import { localDate, localTime } from "../../app/mode";
import { CANVAS_EXTRAS } from "./canvas";
import { useStoryExtras } from "./extras";

/** Which story a reading is for: a new story's draft key ("draft:…"), or a saved entry's id. */
type Target = string;
type Job = { file: File; url: string; target: Target; tries: number; counted: boolean; cancelled: boolean };

/** What an open story page offers: its facts and charts as they are now, and how it shows a reading. */
export type StoryPort = { facts: () => FillFacts; charts: () => string[]; apply: (read: ChartRead) => void };

/**
 * Per story: charts waiting or being read (the page shows "Reading your chart…"), and charts that couldn't be
 * read even after asking again (the page shows "Couldn't read your chart just now · Try again").
 */
export const useChartReading = create<{ pending: Record<Target, number>; failed: Record<Target, number> }>(() => ({ pending: {}, failed: {} }));

const ports = new Map<Target, StoryPort>();

/**
 * Stories whose date is still the automatic one (a new story's screenshot time), so a chart's TradingView capture
 * line may set it; and the earliest capture time read so far for each. A date set by hand takes a story out.
 * Saving a new story carries both over, so a chart read after Save still dates it (the owner, 2026-11-22: the
 * GBPJPY story kept today's date).
 */
const autoDate = new Set<Target>();
const readDate = new Map<Target, string>();
export function setDateAuto(target: Target, auto: boolean) {
  if (auto) autoDate.add(target);
  else autoDate.delete(target);
}
/** The capture time a reading may set: only on an automatic date, and only when earlier than one already used. */
export function dateFromRead(target: Target, takenAt: string | null | undefined): string | null {
  if (!takenAt || !autoDate.has(target)) return null;
  const was = readDate.get(target);
  if (was && was <= takenAt) return null;
  readDate.set(target, takenAt);
  return takenAt;
}
const failedJobs = new Map<Target, Job[]>();
const syncFailed = (t: Target) => useChartReading.setState((s) => ({ failed: { ...s.failed, [t]: failedJobs.get(t)?.length ?? 0 } }));

function giveUp(job: Job) {
  jobs.delete(job);
  failedJobs.set(job.target, [...(failedJobs.get(job.target) ?? []), job]);
  syncFailed(job.target);
}

/** Try again: the charts that couldn't be read are read again, from the start. */
export function retryFailedReads(target: Target) {
  const list = failedJobs.get(target) ?? [];
  failedJobs.delete(target);
  syncFailed(target);
  for (const j of list) if (!j.cancelled) enqueue({ ...j, tries: 0, counted: false });
}
const jobs = new Set<Job>();
let chain: Promise<void> = Promise.resolve();
/** How long a busy or failing service is left before it is asked again (twice at most), in ms. */
export const RETRY_MS = [60_000, 180_000];

const bump = (t: Target, d: number) =>
  useChartReading.setState((s) => ({ pending: { ...s.pending, [t]: Math.max(0, (s.pending[t] ?? 0) + d) } }));

/** The owner's pairs first (readings map to their spelling), then the dictionary's tickers. */
export function chartPairs(): string[] {
  return [...new Set([...yourPairs(useStore.getState().entries), ...INSTRUMENTS.map((i) => i.t)])];
}

/** An open story page takes its readings itself (with the glow and the toast); returns the disconnect. */
export function connectStory(target: Target, port: StoryPort): () => void {
  ports.set(target, port);
  return () => {
    if (ports.get(target) === port) ports.delete(target);
  };
}

export function queueChartRead(file: File, url: string, target: Target) {
  enqueue({ file, url, target, tries: 0, counted: false, cancelled: false });
}

function enqueue(job: Job) {
  jobs.add(job);
  job.counted = true;
  bump(job.target, 1);
  chain = chain.then(() => run(job)).catch(() => {});
}

/** A new story was saved: its readings, waiting or running, now fill the saved entry. */
export function retargetReads(from: Target, to: Target) {
  for (const j of jobs) {
    if (j.target !== from) continue;
    if (j.counted) (bump(from, -1), bump(to, 1));
    j.target = to;
  }
  if (autoDate.delete(from)) autoDate.add(to);
  const d = readDate.get(from);
  if (d) (readDate.delete(from), readDate.set(to, d));
  const failed = failedJobs.get(from);
  if (failed) {
    for (const j of failed) j.target = to;
    failedJobs.delete(from);
    failedJobs.set(to, [...(failedJobs.get(to) ?? []), ...failed]);
    syncFailed(from);
    syncFailed(to);
  }
}

/** A chart was removed: its reading, if it hasn't filled anything yet, never will. */
export function cancelChartRead(url: string) {
  for (const j of jobs) if (chartKey(j.url) === chartKey(url)) j.cancelled = true;
}

function finish(job: Job) {
  if (job.counted) bump(job.target, -1);
  job.counted = false;
  jobs.delete(job);
}

function entryOf(id: Target) {
  const e = useStore.getState().entries.find((x) => x.id === id);
  return e ? { e, story: storyFromEntry(e, CANVAS_EXTRAS[e.id], useStoryExtras.getState().byId[e.id]) } : null;
}

const factsOf = (t: Target): FillFacts | null => ports.get(t)?.facts() ?? entryOf(t)?.story ?? null;
const chartsOf = (t: Target): string[] | null => ports.get(t)?.charts() ?? entryOf(t)?.story.charts ?? null;
const present = (j: Job) => !!chartsOf(j.target)?.some((u) => chartKey(u) === chartKey(j.url));

async function run(job: Job) {
  // Only an explicit removal stops a reading before it starts (cancelChartRead): checking the story's charts here
  // raced the page, which may not have drawn a just-added chart yet. Presence is checked once the reading is back.
  if (job.cancelled) return finish(job);
  // Charts are queued as soon as they're added; whether reading is set up is known once the server has answered
  // (asking only at add time missed charts added before that answer, on a fresh page).
  if (!(await aiReady())) return finish(job);
  const before = factsOf(job.target);
  if (before && factsFull(before)) return finish(job); // nothing left to fill: don't spend a request
  const res = await readChart(job.file, { pairs: chartPairs() });
  if (!res.ok) {
    // Not counted while it waits: the page doesn't say "Reading…" when nothing is being read.
    if (job.counted) (bump(job.target, -1), (job.counted = false));
    if (res.reason === "offline") return waitForOnline(job);
    // Out of free requests for today: asking again won't help; Settings says reading is paused (#23).
    if (res.reason === "quota") return setReadingPaused(true), giveUp(job);
    const wait = RETRY_MS[job.tries];
    if (wait == null) return giveUp(job);
    job.tries++;
    setTimeout(() => (job.cancelled ? finish(job) : (jobs.delete(job), enqueue(job))), wait);
    return;
  }
  setReadingPaused(false);
  if (job.cancelled || !present(job)) return finish(job);
  const port = ports.get(job.target);
  if (port) port.apply(res);
  else fillSavedEntry(job.target, res);
  finish(job);
}

const offline: Job[] = [];
function waitForOnline(job: Job) {
  offline.push(job);
  if (offline.length === 1 && typeof window !== "undefined")
    window.addEventListener(
      "online",
      () => {
        for (const j of offline.splice(0)) if (!j.cancelled) (jobs.delete(j), enqueue(j));
      },
      { once: true },
    );
}

/** A reading for a saved story that isn't open: same rules, filled quietly (no toast away from the story). */
function fillSavedEntry(id: Target, read: ChartRead) {
  const found = entryOf(id);
  if (!found) return; // a new story left without saving: its readings go with it
  const fill = chartFill(found.story, read, yourPairs(useStore.getState().entries));
  if (!fill) return;
  const at = dateFromRead(id, read.takenAt);
  const when = at ? (() => {
    const d = new Date(at);
    const time = localTime(d);
    return { date: localDate(d), time, session: sessionOf(time, (useStore.getState().settings.sessions as [string, string, string][] | undefined) ?? DEFAULT_SESSIONS) };
  })() : {};
  const p = { ...(fill.pair ? { pair: fill.pair } : {}), ...(fill.dir ? { dir: fill.dir } : {}), ...(fill.prices ? { numbers: { ...found.story.numbers, ...fill.prices } } : {}), ...when };
  if (!Object.keys(p).length) return;
  useStore.getState().updateEntry(id, entryPatch(found.e, found.story, p, () => undefined));
}

/**
 * The owner changed a fact the reader had filled: kept on this device only, never shown, so the reading rules
 * can be improved from real mistakes (DESIGN.md › Chart reading). The last 200 are kept.
 */
export async function noteCorrection(field: string, read: string, typed: string) {
  try {
    const raw = await idbStorage.getItem("chart:corrections");
    const list = raw ? (JSON.parse(raw as string) as unknown[]) : [];
    list.push({ field, read, typed, at: new Date().toISOString() });
    await idbStorage.setItem("chart:corrections", JSON.stringify(list.slice(-200)));
  } catch {
    /* a log that can't be written is simply skipped */
  }
}
