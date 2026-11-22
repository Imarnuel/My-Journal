// Starter tags and mistakes (DESIGN.md › Mistakes). Tags and mistakes are two fields; the vocabulary keeps them
// apart by kind ("Mistake" for mistakes), which nobody is ever asked to choose (the owner, 2026-11-22).
import type { Tag } from "./types";

/**
 * What a new journal starts with (the owner, 2026-11-22: "preload some items in the tags section … a starting
 * point"): six mistakes (kind "Mistake") and six tags. The same names as the sample journal; nothing the app
 * already knows (sessions come from the time, plan adherence is Plan).
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

/** The starter tags a journal doesn't have yet (by name, ignoring case), to add without touching the rest. */
export function missingStarters(tags: Tag[]): Tag[] {
  const have = new Set(tags.map((x) => x.t.toLowerCase()));
  return STARTER_TAGS.filter((x) => !have.has(x.t.toLowerCase()));
}
