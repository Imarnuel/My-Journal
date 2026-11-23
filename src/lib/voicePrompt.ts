// What the voice-note server function asks Gemini, and how its answer becomes a VoiceNoteFill.
// Pure and shared: netlify/functions/voice-note.mts sends it, the unit tests check it. The rules come from
// handoff/docs/01-decisions.md "Notes (from one voice note)" and "Tags"; the app itself still decides what to
// fill (applyVoiceNote in story.ts fills only what the user hasn't set).
import type { TagKind } from "./types";
import type { VoiceNoteResult } from "./voiceNote";

/** What the app tells the server about the user's journal, so the note maps onto their own words. */
export type VoiceContext = {
  /** Setups the user has (names exactly as in their playbook). */
  setups: string[];
  /** Tags already used, with their kind, most used first. */
  tags: { t: string; k: TagKind }[];
  /** The fixed Headspace list. */
  headspaces: string[];
  /** Settings › Voice notes › Language. */
  language: string;
};

const KINDS: TagKind[] = ["Good", "Mistake", "Neutral"];

/** Shape Gemini must answer in (JSON Schema, structured output). Enums use the user's own lists. */
export function voiceSchema(ctx: VoiceContext) {
  const setup = ctx.setups.length ? { type: ["string", "null"], enum: [...ctx.setups, null] } : { type: "null" };
  return {
    type: "object",
    properties: {
      unclear: { type: "boolean", description: "True when the recording has no understandable speech (noise, silence, mumbling)." },
      transcript: { type: "string", description: "What was said, word for word, in the language spoken. Wrap each phrase that produced a tag, the setup, the plan or the headspace in [[double brackets]]." },
      before: { type: "string", description: "Before / during: why the trade was taken and how it was managed. 1 to 3 short lines, your own words, no 'I'. Empty if the note says nothing about it." },
      reflection: { type: "string", description: "What to keep or change, from what was said. If nothing reflective was said but one clearly follows from the note, write it. Otherwise empty. Never invent a lesson the note doesn't support." },
      reflection_inferred: { type: "boolean", description: "True when the reflection was inferred rather than said." },
      setup: { ...setup, description: "The user's setup this trade was, only if the note clearly names or describes it. Otherwise null." },
      tags: {
        type: "array",
        description: "Tags for what the note says about the trade (quality, mistakes, context). Prefer the user's existing tags, spelled exactly. A new tag only for something clearly said that no existing tag covers. Never a session, never plan adherence (no \"Followed rules\", \"Followed plan\", \"Broke rules\": that goes in plan_followed).",
        items: {
          type: "object",
          properties: {
            tag: { type: "string" },
            kind: { type: "string", enum: KINDS, description: "Good, Mistake or Neutral. For an existing tag, its kind." },
          },
          required: ["tag", "kind"],
        },
      },
      plan_followed: { type: ["boolean", "null"], description: "True if the note says the plan was followed, false if it says it wasn't, null if it doesn't say." },
      headspace: { type: ["string", "null"], enum: [...ctx.headspaces, null], description: "How the trader felt, only if said or clearly implied. Otherwise null." },
      outcome: {
        type: ["string", "null"],
        enum: ["target", "stop", "breakeven", null],
        description: "How the trade ended, only if said: 'target' (hit the target or take profit), 'stop' (stopped out, hit the stop loss), 'breakeven' (closed at the entry price). Null for anything else, a partial close, or if not said.",
      },
    },
    required: ["unclear", "transcript", "before", "reflection", "reflection_inferred", "setup", "tags", "plan_followed", "headspace", "outcome"],
  };
}

/** The instruction sent with the audio. */
export function voicePrompt(ctx: VoiceContext): string {
  const tags = ctx.tags.length ? ctx.tags.map((t) => `${t.t} (${t.k})`).join(", ") : "none yet";
  return [
    "You turn a trader's spoken note about one trade into their journal entry.",
    `The note is in ${ctx.language}. Write everything in ${ctx.language}.`,
    "Only use what the note says. Never guess prices, results or details that weren't said.",
    "Write the two notes short and plain, in your own words, like the trader's own shorthand.",
    `The trader's setups: ${ctx.setups.length ? ctx.setups.join(", ") : "none yet"}.`,
    `The trader's tags (kind): ${tags}.`,
    `Headspace options: ${ctx.headspaces.join(", ")}. Pick the closest one to how they felt (for example greedy or euphoric is Overconfident, FOMO or impatient is Rushed, scared or hesitant is Anxious, angry or revenge is Frustrated), only from these.`,
    "If there is no understandable speech, set unclear to true and leave everything else empty or null.",
  ].join("\n");
}

const clean = (s: unknown, max = 600) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "");
const clockOf = (secs: number) => `${Math.floor(secs / 60)}:${String(Math.round(secs) % 60).padStart(2, "0")}`;

/**
 * Turn Gemini's JSON answer into a fill, trusting nothing: the setup and headspace must be on the user's
 * lists, an existing tag keeps its own spelling and kind, a new tag needs a valid kind.
 */
/**
 * A tag that only says whether the plan was followed ("Followed rules", "Stuck to the plan", "Broke my rules"):
 * that is the Plan field's job, never a tag (the owner, 2026-11-22: "followed rules was picked from my voice note
 * despite having followed plan as the options"). Returns what it says about the plan, or null when the tag is
 * about something else. Words that are only near the plan ("Plan B entry") aren't caught.
 */
export function planTag(name: string): boolean | null {
  const t = name.toLowerCase().replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
  const about = /\b(plan|plans|rules?|system|strategy|checklist|process)\b/;
  const broke = /\b(broke|broken|break|breaking|ignored?|ignoring|deviat\w*|off|against|abandon\w*|didn't|did not|not|no|without|skipped)\b/;
  const kept = /\b(follow\w*|stuck|stick\w*|kept|keep|on|per|by|respect\w*|obey\w*|honou?r\w*|executed|according)\b/;
  if (/^(disciplined|undisciplined|discipline|no discipline|lack of discipline)$/.test(t)) return !/^(un|no|lack)/.test(t);
  if (!about.test(t)) return null;
  if (broke.test(t)) return false;
  if (kept.test(t) || /^(plan|rules?) (followed|kept|respected)$/.test(t)) return true;
  return null;
}

export function fillFromAnswer(raw: unknown, ctx: VoiceContext, seconds: number): VoiceNoteResult {
  const a = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const before = clean(a.before);
  const refl = clean(a.reflection);
  if (a.unclear === true || (!before && !refl && !clean(a.transcript))) return { ok: false, reason: "unclear" };
  const setup = typeof a.setup === "string" ? ctx.setups.find((x) => x.toLowerCase() === a.setup!.toString().toLowerCase()) ?? null : null;
  const headspace = typeof a.headspace === "string" ? ctx.headspaces.find((x) => x.toLowerCase() === a.headspace!.toString().toLowerCase()) ?? null : null;
  const seen = new Set<string>();
  const tags: { t: string; k: TagKind }[] = [];
  let planFromTags: boolean | null = null;
  for (const item of Array.isArray(a.tags) ? a.tags : []) {
    const name = clean((item as Record<string, unknown>)?.tag, 40);
    if (!name || seen.has(name.toLowerCase())) continue;
    // Plan adherence goes to Plan, never a tag (even if the model reused such a tag from the user's list).
    const plan = planTag(name);
    if (plan != null) {
      planFromTags ??= plan;
      continue;
    }
    const known = ctx.tags.find((t) => t.t.toLowerCase() === name.toLowerCase());
    const kind = (item as Record<string, unknown>)?.kind;
    if (known) tags.push({ t: known.t, k: known.k });
    else if (KINDS.includes(kind as TagKind)) tags.push({ t: name[0].toUpperCase() + name.slice(1), k: kind as TagKind });
    else continue;
    seen.add(name.toLowerCase());
  }
  return {
    ok: true,
    length: clockOf(seconds),
    transcript: clean(a.transcript, 4000),
    before,
    refl,
    suggested: !!refl && a.reflection_inferred === true,
    setup,
    tags: tags.slice(0, 8),
    followed: typeof a.plan_followed === "boolean" ? a.plan_followed : planFromTags,
    headspace,
    outcome: a.outcome === "target" || a.outcome === "stop" || a.outcome === "breakeven" ? a.outcome : null,
  };
}
