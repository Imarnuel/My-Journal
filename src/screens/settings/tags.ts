// Tag housekeeping for Settings > Tags and mistakes (01-decisions.md "Tags"): kind breakdown, rename, remove and
// merge look-alikes. Pure functions over the shared entries and tags; the screen applies the patches.
import type { Entry, Tag } from "../../lib/types";

export type TagPatch = { id: string; tags: string[]; mistakes: string[] };
export type Lookalike = { from: string; into: string };

/** "7 good · 3 mistakes · 3 neutral", computed from the tags in use. */
export function tagMix(tags: Tag[]): string {
  const n = (k: Tag["k"]) => tags.filter((t) => t.k === k).length;
  const m = n("Mistake");
  return `${n("Good")} good · ${m} ${m === 1 ? "mistake" : "mistakes"} · ${n("Neutral")} neutral`;
}

export const usedLabel = (n: number) => `used ${n} ${n === 1 ? "time" : "times"}`;

const swap = (list: string[], from: string, to: string | null) => {
  if (!list.includes(from)) return list;
  const out: string[] = [];
  for (const t of list) {
    const x = t === from ? to : t;
    if (x !== null && !out.includes(x)) out.push(x);
  }
  return out;
};

/** Patches that replace tag `from` with `to` (or remove it when `to` is null) on every entry that has it. */
export function retagEntries(entries: Entry[], from: string, to: string | null): { patches: TagPatch[]; before: TagPatch[] } {
  const patches: TagPatch[] = [];
  const before: TagPatch[] = [];
  for (const e of entries) {
    if (!e.tags.includes(from) && !e.mistakes.includes(from)) continue;
    before.push({ id: e.id, tags: e.tags, mistakes: e.mistakes });
    patches.push({ id: e.id, tags: swap(e.tags, from, to), mistakes: swap(e.mistakes, from, to) });
  }
  return { patches, before };
}

/** A rename is kept only when it leaves a name that no other tag already has. */
export function validRename(tags: Tag[], from: string, to: string): boolean {
  const t = to.trim();
  if (!t || t === from) return false;
  return !tags.some((x) => x.t !== from && x.t.toLowerCase() === t.toLowerCase());
}

export function renameTag(tags: Tag[], from: string, to: string): Tag[] {
  return tags.map((x) => (x.t === from ? { ...x, t: to.trim() } : x));
}

/** Merge `from` into `into`: one tag left, carrying both use counts. */
export function mergeTags(tags: Tag[], from: string, into: string): Tag[] {
  const src = tags.find((x) => x.t === from);
  return tags.filter((x) => x.t !== from).map((x) => (x.t === into ? { ...x, n: x.n + (src?.n ?? 0) } : x));
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/s$/, "");
const initials = (s: string) => s.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").toLowerCase();

/**
 * Tags that look like the same tag: the same words apart from case, punctuation or a plural, or an
 * abbreviation made of another tag's initials ("BOS" and "Break of structure"). The longer name is kept.
 */
export function findLookalikes(names: string[]): Lookalike[] {
  const out: Lookalike[] = [];
  const uniq = [...new Set(names)];
  for (let i = 0; i < uniq.length; i++)
    for (let j = i + 1; j < uniq.length; j++) {
      const [a, b] = uniq[i].length >= uniq[j].length ? [uniq[i], uniq[j]] : [uniq[j], uniq[i]];
      const same = norm(a) === norm(b);
      const abbr = !/\s/.test(b) && b.length >= 2 && a.split(/\s+/).length >= 2 && initials(a) === b.toLowerCase();
      if (same || abbr) out.push({ from: b, into: a });
    }
  return out;
}

export const pairKey = (p: Lookalike) => `${p.from}>${p.into}`;

