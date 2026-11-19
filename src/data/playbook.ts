// Playbook area state and actions. Setups and their rules live in the shared store (`setups`); this module
// fills the example setups' rules from the frames the first time, keeps the look-alike suggestion, and
// carries out rename / archive / delete / create so every story's `setup` follows (Trade log and Dashboard agree).
import { create } from "zustand";
import { useStore, type Rules, type Setup } from "./store";

export const GROUPS = ["Context", "Entry", "Exit"] as const;
export type Group = (typeof GROUPS)[number];
/** Sub-labels under each group heading (frames 09 and 10). Exit has none. */
export const GROUP_NOTE: Record<Group, string | null> = { Context: "Higher timeframes", Entry: "Lower timeframe", Exit: null };

/** Rules drawn on frame 09 (prototype/Playbook.dc.html). The other example setups have none drawn. */
const SEED_RULES: Record<string, Rules> = {
  "4H supply pullback": {
    Context: ["Daily trend is bearish", "4H pulls back into a marked supply zone"],
    Entry: ["15m breaks structure inside the zone", "Enter on the retest"],
    Exit: ["Stop above the zone", "Target 2R or more"],
  },
};

/** The canvas's example setups ("Example setups shown", "Example setup. Yours replace it on day one."). */
const SEED_EXAMPLES = ["4H supply pullback", "London breakout", "Asian range fade"];

/**
 * The look-alike suggestion on Unsorted (frames 08, 09, 10). The AI groups similar unsorted stories; on the canvas
 * it found four. Their placeholder drawings are the frame's (pbu0 to pbu3 in the playbook sprite).
 * The frame captions them GBPUSD 13 Nov, EURUSD 9 Nov, AUDUSD 6 Nov, XAUUSD 3 Nov, but no such unsorted stories
 * exist in data/entries.json, so it points at four real unsorted stories and the captions come from them.
 */
export const SUGGESTION = {
  ids: ["e38", "e48", "e56", "e82"],
  charts: ["pbu0", "pbu1", "pbu2", "pbu3"],
  /** Sentence case continues after "4 of them look alike: ". */
  summary: "daily bullish, Asian low swept, then a 15m break of structure",
  name: "Asian sweep reversal",
  rules: {
    Context: ["Daily trend is bullish", "Price sweeps the Asian session low"],
    Entry: ["15m breaks structure after the sweep", "Enter on the retest"],
    Exit: ["Stop below the sweep", "Target the previous high"],
  } as Rules,
};

type PB = {
  /** Names of the example setups still shown as examples (renames follow). */
  examples: string[];
  /** "Not now": hidden until more stories look alike. */
  suggestHidden: boolean;
  /** The suggestion became a setup. */
  suggestUsed: boolean;
  archivedOpen: boolean;
};

export const usePlaybook = create<PB>(() => ({ examples: SEED_EXAMPLES, suggestHidden: false, suggestUsed: false, archivedOpen: false }));

const emptyRules = (r: Rules) => !r.Context.length && !r.Entry.length && !r.Exit.length;
const cloneRules = (r: Rules): Rules => ({ Context: [...r.Context], Entry: [...r.Entry], Exit: [...r.Exit] });

/** Fill the example setups' rules from the frames, once (store.ts seeds them empty). */
let seeded = false;
export function seedPlaybook() {
  if (seeded) return;
  seeded = true;
  useStore.getState().setSetups((list) => list.map((s) => (SEED_RULES[s.name] && emptyRules(s.rules) ? { ...s, rules: cloneRules(SEED_RULES[s.name]) } : s)));
}
seedPlaybook();

const st = () => useStore.getState();

/** Move stories between setups. Returns the ids moved, for Undo. */
function moveStories(ids: string[], to: string) {
  for (const id of ids) st().updateEntry(id, { setup: to });
}
const idsIn = (name: string) => st().entries.filter((e) => e.setup === name).map((e) => e.id);

export function renameSetup(from: string, to: string) {
  if (from === to) return;
  const ids = idsIn(from);
  st().setSetups((list) => list.map((s) => (s.name === from ? { ...s, name: to } : s)));
  moveStories(ids, to);
  usePlaybook.setState((p) => ({ examples: p.examples.map((x) => (x === from ? to : x)) }));
}

export function setArchived(name: string, archived: boolean) {
  st().setSetups((list) => list.map((s) => (s.name === name ? { ...s, archived } : s)));
}

/** Delete a setup: its stories move to Unsorted. Returns an Undo that restores exactly. */
export function deleteSetup(name: string): { moved: number; undo: () => void } {
  const list = st().setups;
  const index = list.findIndex((s) => s.name === name);
  const setup = list[index];
  const ids = idsIn(name);
  const wasExample = usePlaybook.getState().examples.includes(name);
  st().setSetups((l) => l.filter((s) => s.name !== name));
  moveStories(ids, "Unsorted");
  return {
    moved: ids.length,
    undo: () => {
      st().setSetups((l) => {
        const next = [...l];
        next.splice(Math.min(index, next.length), 0, setup);
        return next;
      });
      moveStories(ids, name);
      if (wasExample) usePlaybook.setState((p) => ({ examples: p.examples.includes(name) ? p.examples : [...p.examples, name] }));
    },
  };
}

const clean = (r: Rules): Rules => ({
  Context: r.Context.map((t) => t.trim()).filter(Boolean),
  Entry: r.Entry.map((t) => t.trim()).filter(Boolean),
  Exit: r.Exit.map((t) => t.trim()).filter(Boolean),
});

/** Save setup from the editor: a new setup (its stories move into it) or an existing one's name and rules. */
export function saveSetup(opts: { original: string | null; name: string; rules: Rules; stories: string[] }) {
  const name = opts.name.trim();
  const rules = clean(opts.rules);
  if (opts.original) {
    renameSetup(opts.original, name);
    st().setSetups((list) => list.map((s) => (s.name === name ? { ...s, rules } : s)));
    return;
  }
  const first = st().entries.find((e) => e.id === opts.stories[0]);
  const setup: Setup = { name, chart: first?.chartKey ?? "", rules, archived: false };
  st().setSetups((list) => [...list, setup]);
  moveStories(opts.stories, name);
  if (opts.stories.some((id) => SUGGESTION.ids.includes(id))) usePlaybook.setState({ suggestUsed: true });
}

/** Whether a name can be used for a setup (not empty, not another setup's name, not Unsorted). */
export function nameFree(name: string, original: string | null) {
  const n = name.trim();
  if (!n || n.toLowerCase() === "unsorted") return false;
  return !st().setups.some((s) => s.name.toLowerCase() === n.toLowerCase() && s.name !== original);
}

export function hideSuggestion(hidden: boolean) {
  usePlaybook.setState({ suggestHidden: hidden });
}

/** The suggested stories still unsorted, newest first, with their placeholder drawings. */
export function useSuggestion() {
  const entries = useStore((s) => s.entries);
  const { suggestHidden, suggestUsed } = usePlaybook();
  const stories = SUGGESTION.ids
    .map((id, i) => ({ e: entries.find((x) => x.id === id), chart: SUGGESTION.charts[i] }))
    .filter((x): x is { e: NonNullable<typeof x.e>; chart: string } => !!x.e && x.e.setup === "Unsorted");
  const live = !suggestUsed && stories.length >= 2;
  return { stories, live, shown: live && !suggestHidden };
}
