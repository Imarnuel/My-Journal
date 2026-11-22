// Tags without admin work (DESIGN.md › Tags: kind set for you, starter tags). Adding a tag never asks Good,
// Mistake or Neutral (the owner, 2026-11-22: choosing a tag's kind was "too much admin work"): the kind comes from
// the words, a voice note sets its own, and Settings › Your tags › Manage tags can change it.
import type { Tag, TagKind } from "./types";

/**
 * What a new journal starts with (the owner, 2026-11-22: "preload some items in the tags section … a starting
 * point"). Mostly mistakes, since those drive Costliest mistakes and the review; the same names as the sample
 * journal; nothing the app already knows (sessions come from the time, plan adherence is Plan).
 */
export const STARTER_TAGS: Tag[] = [
  { t: "Retest", n: 0, k: "Good" },
  { t: "Waited for confirmation", n: 0, k: "Good" },
  { t: "Let it run", n: 0, k: "Good" },
  { t: "Chased entry", n: 0, k: "Mistake" },
  { t: "Moved stop", n: 0, k: "Mistake" },
  { t: "FOMO", n: 0, k: "Mistake" },
  { t: "Revenge trade", n: 0, k: "Mistake" },
  { t: "Overtraded", n: 0, k: "Mistake" },
  { t: "Exited early", n: 0, k: "Mistake" },
  { t: "Break of structure", n: 0, k: "Neutral" },
  { t: "Liquidity sweep", n: 0, k: "Neutral" },
  { t: "News", n: 0, k: "Neutral" },
];

/** Words that make a tag a mistake: what traders say went wrong. */
const MISTAKE = [
  /\bchas/, /\bfomo\b/, /\brevenge/, /\bover ?trad/, /\bover ?siz/, /\btoo (big|large|much)/, /\bmov(ed|ing|e) (my )?stop/,
  /\bearly\b/, /\blate\b/, /\bimpuls/, /\bgreed/, /\bhesitat/, /\bmissed\b/, /\bno stop\b/, /\bwithout (a )?stop/,
  /\bignor/, /\brush/, /\bforc(ed|ing)\b/, /\btilt/, /\bbored/, /\baverag(ed|ing) down/, /\bmistake/, /\bbad\b/,
  /\bpanic/, /\bfear/, /\bjump(ed)? in/, /\bcut (my )?winner/, /\bwide stop/, /\bno plan\b/, /\bdidn'?t wait/, /\bno confirm/,
];
/** Words that make a tag good: what traders want to repeat. */
const GOOD = [
  /\bpatien/, /\bwait(ed|ing)? for/, /\bconfirm/, /\blet (it|them) run/, /\bclean\b/, /\bscal(ed|ing) out/,
  /\btook profit/, /\bpartials?\b/, /\bgood\b/, /\bgreat\b/, /\bperfect/, /\ba\+/, /\bcalm entry/,
  /\bretest\b/, /\bsniper/, /\bprecise/,
];

/** The kind a new tag gets from its words: mistake words first, then good ones; anything else is context. */
export function guessKind(name: string): TagKind {
  const t = name.toLowerCase();
  if (MISTAKE.some((r) => r.test(t))) return "Mistake";
  if (GOOD.some((r) => r.test(t))) return "Good";
  return "Neutral";
}

/** The starter tags a journal doesn't have yet (by name, ignoring case), to add without touching the rest. */
export function missingStarters(tags: Tag[]): Tag[] {
  const have = new Set(tags.map((x) => x.t.toLowerCase()));
  return STARTER_TAGS.filter((x) => !have.has(x.t.toLowerCase()));
}
