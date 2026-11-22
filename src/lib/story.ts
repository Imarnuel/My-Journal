// The chart story (New chart story and the saved story): one model, pure rules.
// Behaviour from handoff/docs/01-decisions.md ("Manual entry", "Notes", "Tags", "Charts in a story",
// "Chart story") and the prototype logic in src/screens/logic/Story.logic.ts.
import type { Dir, Entry, Session, Status, Tag, TagKind } from "./types";
import type { Outcome, VoiceNoteFill } from "./voiceNote";
import { MINUS } from "./format";
import { sampleNumbers } from "../data/samplePrices";
import { REAL } from "../app/mode";

export type Numbers = { entry: string; stop: string; target: string; exit: string; size: string };
/** A number in the story's numbers line: a price, the size, or the result. */
export type NumKey = keyof Numbers | "result";

/** Everything the story form shows. A saved story is read from its Entry; a new one lives in a draft. */
export type Story = {
  pair: string;
  dir: Dir | null;
  status: Status;
  account: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  session: Session;
  numbers: Numbers;
  r: number | null;
  /** The result was typed by hand; editing the prices then leaves it alone. */
  rByHand: boolean;
  charts: string[]; // chart keys (placeholder drawings) or image URLs, in the user's order
  before: string;
  refl: string;
  suggested: boolean;
  setup: string | null;
  tags: string[];
  /** Its own field since 2026-11-22 (DESIGN.md › Mistakes): what went wrong, apart from the tags. */
  mistakes: string[];
  followed: boolean | null;
  headspace: string | null;
  voice: boolean;
  voiceLen: string | null;
  transcript: string;
  textbook: boolean;
  excluded: boolean;
  closeTime: string | null;
};

/** Fields a story may carry beyond the sample data (handoff/docs/05-data-and-calculations.md). */
export type StoryExtras = Partial<Pick<Entry, "before" | "refl" | "suggested" | "headspace" | "transcript" | "chartList" | "numbers">> & {
  voiceLen?: string;
  closeTime?: string;
};

export const STATUS_OPTS: { label: Status; hint: string }[] = [
  { label: "Taken", hint: "Counts in your results" },
  { label: "Watched", hint: "You saw it, didn't take it" },
  { label: "Not filled", hint: "Order never triggered" },
  { label: "Analysis", hint: "Charts before trading" },
];
export const HEADSPACE = ["Calm", "Confident", "Focused", "Rushed", "Tired", "Frustrated"];
/** The emoji shown beside each headspace (owner's request, DESIGN.md). The word stays the value. */
export const HEADSPACE_EMOJI: Record<string, string> = { Calm: "😌", Confident: "😎", Focused: "🧐", Rushed: "😬", Tired: "😴", Frustrated: "😤" };
export const NUMBER_FIELDS: { key: keyof Numbers | "result"; label: string }[] = [
  { key: "entry", label: "Entry" },
  { key: "stop", label: "Stop" },
  { key: "target", label: "Target" },
  { key: "exit", label: "Exit" },
  { key: "size", label: "Size" },
  { key: "result", label: "Result" },
];
export const ORDINAL = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
export const ordinal = (i: number) => ORDINAL[i] ?? `${i + 1}th`;

/** The session follows the time (prototype rule: before 07:00 Asia, before 13:00 London, else New York). */
/**
 * The session a time falls in. With the owner's session times (Settings › Time and sessions), it is the
 * session open at that time; where two overlap, the one that opened most recently (09:45 is London, not
 * Asia). Outside every session, or without times, it falls back to fixed hours.
 */
export function sessionOf(time: string, sessions?: [name: string, start: string, end: string][]): Session {
  const open = (sessions ?? [])
    .filter(([, a, b]) => (a <= b ? time >= a && time < b : time >= a || time < b))
    .sort((x, y) => (x[1] < y[1] ? 1 : -1));
  const hit = open[0]?.[0];
  if (hit === "Asia" || hit === "London" || hit === "New York") return hit;
  const h = Number(time.slice(0, 2));
  return h < 7 ? "Asia" : h < 13 ? "London" : "New York";
}

/** "+2.1R", "−1.0R", "2.1", "-1" → number; anything else → null. */
export function parseR(s: string): number | null {
  const t = s.trim().replace(MINUS, "-").replace(/r$/i, "").trim();
  if (!t || !/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return Number(t);
}

/** A price as typed: "1.26840", or "1,26840" with a decimal comma. Anything else is null. */
export function parsePrice(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!t || !/^(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return Number(t);
}

/**
 * The result in R from the prices (DESIGN.md, Editing numbers): (exit − entry) / (entry − stop), which is
 * the same sum for a long and a short. Null when a price is missing, there's no risk, or the stop is on the
 * wrong side for the direction. Two decimals, like expectancy.
 */
export function rFromPrices(n: Pick<Numbers, "entry" | "stop" | "exit">, dir: Dir | null): number | null {
  const entry = parsePrice(n.entry);
  const stop = parsePrice(n.stop);
  const exit = parsePrice(n.exit);
  if (entry == null || stop == null || exit == null) return null;
  const risk = entry - stop;
  if (risk === 0) return null;
  if ((dir === "Long" && risk < 0) || (dir === "Short" && risk > 0)) return null;
  const r = (exit - entry) / risk;
  return Math.round(r * 10000) / 10000 || 0; // kept precise: rounding twice (to 2 places, then 1 for display) shows 5.345 as +5.4R
}

/**
 * How a taken trade ended, one tap each (DESIGN.md › Result): only while it has no result yet and its entry and
 * stop are set; "Target" only with a target. Each fills Exit (the target, stop or entry price) and the R follows
 * from the prices, so exit and result always agree.
 */
export function outcomeChoices(s: Pick<Story, "status" | "r" | "numbers" | "dir">): { key: Outcome; exit: string; r: number }[] {
  if (s.status !== "Taken" || s.r != null) return [];
  const n = s.numbers;
  const out: { key: Outcome; exit: string; r: number }[] = [];
  const add = (key: Outcome, exit: string) => {
    const r = exit ? rFromPrices({ ...n, exit }, s.dir) : null;
    if (r != null) out.push({ key, exit, r });
  };
  add("target", n.target);
  add("stop", n.stop);
  add("breakeven", n.entry);
  return out;
}

/** The change one outcome makes: Exit, and the result from the prices (not typed by hand). */
export function outcomePatch(s: Pick<Story, "status" | "r" | "numbers" | "dir">, key: Outcome): Partial<Story> | null {
  const c = outcomeChoices(s).find((x) => x.key === key);
  return c ? { numbers: { ...s.numbers, exit: c.exit }, r: c.r, rByHand: false } : null;
}

/** m:ss for the recording timer and playback. */
export function clock(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}
export function clockSeconds(s: string | null): number {
  if (!s) return 0;
  const [m, x] = s.split(":").map(Number);
  return (m || 0) * 60 + (x || 0);
}

export const isImage = (k: string) => /^(blob:|data:|https?:|\/)/.test(k);

/** Placeholder drawing for a story's thumbnail on other screens (shared sprite: s/l, w/x). */
export function placeholderKey(dir: Dir | null, r: number | null): string {
  return `${dir === "Long" ? "l" : "s"}${r != null && r > 0 ? "w" : "x"}0`;
}

/** Placeholder charts for a sample entry that has no chart list: n drawings ending with its chart key. */
export function placeholderCharts(e: Pick<Entry, "charts" | "chartKey" | "dir" | "r">): string[] {
  const n = Math.max(0, e.charts);
  if (!n) return [];
  const key = e.chartKey ?? placeholderKey(e.dir, e.r);
  const fam = key.slice(0, 2);
  const v = Number(key.slice(2)) || 0;
  return Array.from({ length: n }, (_, i) => fam + (((v - (n - 1 - i)) % 3) + 3) % 3);
}

/** Move one item from i to j, keeping everything else in order. */
export function moveItem<T>(list: T[], i: number, j: number): T[] {
  const c = list.slice();
  const [x] = c.splice(i, 1);
  c.splice(j, 0, x);
  return c;
}

const blankNumbers: Numbers = { entry: "", stop: "", target: "", exit: "", size: "" };

/**
 * Read a saved entry as a story. `overlay` supplies fields the sample data doesn't carry for this
 * entry (the canvas story's notes, numbers and charts); it applies until the story is first edited here.
 */
export function storyFromEntry(e: Entry, overlay: StoryExtras | undefined, extras: { voiceLen?: string; closeTime?: string } = {}): Story {
  const o = e.before === undefined ? overlay : undefined;
  // Sample trades have no prices; stand-ins fill them until MT5 sync exists (DESIGN.md, Sample prices).
  // Never in the real journal: an entry there shows only the numbers the owner gave it.
  const n = { ...blankNumbers, ...(e.numbers || REAL ? {} : sampleNumbers(e)), ...(o?.numbers ?? {}), ...(e.numbers ?? {}) };
  return {
    pair: e.pair,
    dir: e.dir,
    status: e.status,
    account: e.account,
    date: e.date,
    time: e.time,
    session: e.session,
    numbers: n,
    r: e.r,
    rByHand: !!e.rByHand,
    charts: e.chartList ?? o?.chartList ?? (REAL ? [] : placeholderCharts(e)),
    before: e.before ?? o?.before ?? (e.status === "Analysis" ? e.plan ?? "" : ""),
    refl: e.refl ?? o?.refl ?? "",
    suggested: !!(e.suggested ?? o?.suggested),
    setup: !e.setup || e.setup === "Unsorted" ? null : e.setup,
    // Older data kept mistakes inside the tags too: a mistake shows only in Mistakes.
    tags: e.tags.filter((t) => !e.mistakes.includes(t)),
    mistakes: e.mistakes,
    followed: e.followed,
    headspace: e.headspace ?? o?.headspace ?? null,
    voice: e.note,
    voiceLen: extras.voiceLen ?? overlay?.voiceLen ?? null,
    transcript: e.transcript ?? o?.transcript ?? "",
    textbook: e.textbook,
    excluded: e.excluded,
    closeTime: extras.closeTime ?? overlay?.closeTime ?? null,
  };
}

/** Turn a change to the story into a patch for its Entry. */
export function entryPatch(e: Entry, cur: Story, p: Partial<Story>): Partial<Entry> {
  const out: Partial<Entry> = {};
  // First edit of a story whose extra fields come from the overlay: store them all, so they stay.
  if (e.before === undefined) {
    Object.assign(out, { before: cur.before, refl: cur.refl || null, suggested: cur.suggested, headspace: cur.headspace, transcript: cur.transcript || null, chartList: cur.charts, numbers: cur.numbers });
  }
  if ("rByHand" in p) out.rByHand = p.rByHand!;
  if ("pair" in p) out.pair = p.pair!;
  if ("dir" in p) out.dir = p.dir!;
  if ("status" in p) out.status = p.status!;
  if ("account" in p) out.account = p.account!;
  if ("date" in p) out.date = p.date!;
  if ("time" in p) out.time = p.time!;
  if ("session" in p) out.session = p.session!;
  if ("numbers" in p) out.numbers = p.numbers!;
  if ("r" in p) out.r = p.r ?? null;
  if ("charts" in p) {
    out.chartList = p.charts!;
    out.charts = p.charts!.length;
  }
  if ("before" in p) {
    out.before = p.before!;
    if ((p.status ?? cur.status) === "Analysis") out.plan = p.before || null;
  }
  if ("refl" in p) out.refl = p.refl || null;
  if ("suggested" in p) out.suggested = p.suggested!;
  if ("setup" in p) out.setup = p.setup ?? "Unsorted";
  if ("tags" in p) out.tags = p.tags!;
  if ("mistakes" in p) out.mistakes = p.mistakes!;
  if ("followed" in p) out.followed = p.followed ?? null;
  if ("headspace" in p) out.headspace = p.headspace ?? null;
  if ("voice" in p) out.note = !!p.voice;
  if ("transcript" in p) out.transcript = p.transcript || null;
  if ("textbook" in p) out.textbook = !!p.textbook;
  if ("excluded" in p) out.excluded = !!p.excluded;
  return out;
}

/** A new Entry from a story draft (Save story). */
export function entryFromStory(id: string, s: Story): Entry {
  return {
    id,
    date: s.date,
    time: s.time,
    pair: s.pair,
    dir: s.dir,
    status: s.status,
    account: s.account,
    also: null,
    setup: s.setup ?? "Unsorted",
    session: s.session,
    followed: s.followed,
    tags: s.tags,
    mistakes: s.mistakes,
    r: s.status === "Taken" || s.status === "Watched" ? s.r : null,
    charts: s.charts.length,
    chartKey: placeholderKey(s.dir, s.r),
    note: s.voice,
    refl: s.refl || null,
    plan: s.status === "Analysis" ? s.before || null : null,
    mt5: null,
    excluded: s.excluded,
    textbook: s.textbook,
    before: s.before,
    suggested: s.suggested,
    headspace: s.headspace,
    transcript: s.transcript || null,
    chartList: s.charts,
    numbers: s.numbers,
    rByHand: s.rByHand,
  };
}

/** Next free entry id ("e135"). */
export function nextId(entries: Pick<Entry, "id">[]): string {
  const max = entries.reduce((m, e) => Math.max(m, Number(e.id.replace(/\D/g, "")) || 0), 0);
  return `e${max + 1}`;
}

/**
 * What a voice note fills: both notes and every detail the user hasn't set. Never overwrites a value
 * that is already there (01-decisions.md, Purpose and Notes). Returns the change and the toast parts.
 */
export function applyVoiceNote(s: Story, fill: VoiceNoteFill): { patch: Partial<Story>; filled: string[]; newKinds: Record<string, TagKind> } {
  const patch: Partial<Story> = { voice: true, voiceLen: fill.length, transcript: fill.transcript };
  const filled: string[] = [];
  const newKinds: Record<string, TagKind> = {};
  if (!s.before.trim() && fill.before) patch.before = fill.before;
  if (!s.refl.trim() && fill.refl) {
    patch.refl = fill.refl;
    patch.suggested = fill.suggested;
  }
  if (!s.setup && fill.setup) {
    patch.setup = fill.setup;
    filled.push("setup");
  }
  // What the note calls a mistake goes to Mistakes, the rest to Tags (DESIGN.md › Mistakes).
  const have = [...s.tags, ...s.mistakes].map((t) => t.toLowerCase());
  const fresh = fill.tags.filter((t) => !have.includes(t.t.toLowerCase()));
  const addT = fresh.filter((t) => t.k !== "Mistake");
  const addM = fresh.filter((t) => t.k === "Mistake");
  for (const t of fresh) newKinds[t.t] = t.k;
  if (addT.length) {
    patch.tags = s.tags.concat(addT.map((t) => t.t));
    filled.push(`${addT.length} ${addT.length === 1 ? "tag" : "tags"}`);
  }
  if (addM.length) {
    patch.mistakes = s.mistakes.concat(addM.map((t) => t.t));
    filled.push(`${addM.length} ${addM.length === 1 ? "mistake" : "mistakes"}`);
  }
  if (s.followed == null && fill.followed != null) {
    patch.followed = fill.followed;
    filled.push("plan");
  }
  if (!s.headspace && fill.headspace) {
    patch.headspace = fill.headspace;
    filled.push("headspace");
  }
  // "Hit my target", "stopped out": the result, only while the trade has none and Exit is empty.
  if (fill.outcome && !s.numbers.exit) {
    const o = outcomePatch(s, fill.outcome);
    if (o) Object.assign(patch, o), filled.push("result");
  }
  return { patch, filled, newKinds };
}

/** The toast after a voice note: what it filled besides the notes (DESIGN.md, Toasts). */
export function voiceToast(filled: string[]): string {
  if (!filled.length) return "Both notes filled from your voice note";
  const parts = filled.map((x) => x.toLowerCase());
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  // What was filled leads, no colon (the owner, 2026-11-22: "why is the toast microcopy carrying a colon?").
  return `${list[0].toUpperCase()}${list.slice(1)} filled from your note`;
}

/** The values a patch replaces, for Undo. */
export function prevOf(s: Story, p: Partial<Story>): Partial<Story> {
  const prev: Partial<Story> = {};
  for (const k of Object.keys(p) as (keyof Story)[]) (prev as Record<string, unknown>)[k] = s[k];
  return prev;
}

export const niceTag = (q: string) => q.trim().charAt(0).toUpperCase() + q.trim().slice(1);

/** Tag field autocomplete: tags already used, most used first, with how often. */
export function tagSuggestions(vocab: Tag[], have: string[], q: string) {
  const ql = q.trim().toLowerCase();
  const hv = have.map((t) => t.toLowerCase());
  const pool = vocab.filter((v) => !hv.includes(v.t.toLowerCase()));
  const sug = ql ? pool.filter((v) => v.t.toLowerCase().includes(ql)).slice(0, 6) : pool.slice(0, 5);
  const exact = vocab.some((v) => v.t.toLowerCase() === ql) || hv.includes(ql);
  return { sug, canAdd: !!ql && !exact, none: !ql && !sug.length, ql };
}


/** The analysis an entry was planned in: the latest Analysis entry earlier that day covering its pair. */
export function linkedAnalysis(entries: Entry[], e: Pick<Entry, "id" | "date" | "time" | "pair" | "status">): Entry | null {
  if (e.status === "Analysis") return null;
  const c = entries
    .filter((a) => a.status === "Analysis" && a.id !== e.id && a.date === e.date && a.time < e.time)
    .filter((a) => a.pair.split(/,\s*/).includes(e.pair))
    .sort((a, b) => b.time.localeCompare(a.time));
  return c[0] ?? null;
}
