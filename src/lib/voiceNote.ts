// The voice-note pipeline: recording -> transcript -> the two short notes and the details it can fill.
//
// SIMULATED in the sample journal; the real journal records and asks Gemini through
// netlify/edge-functions/voice-note.ts (DESIGN.md › Real app). Originally there was no speech or AI back end (handoff/docs/06-open-items.md, "Back end": the
// voice-note pipeline is not designed). This module returns the prototype's fixed result
// (handoff/prototype/NewStory.dc.html, FILL) so the capture loop works end to end. Replace
// `readVoiceNote` with the real pipeline; nothing else in the app knows the result is canned.
//
// Test hook: `?voice=unclear` in the URL makes the note come back unreadable, which shows frame 16's
// "Couldn't make out your note" state. It is not reachable from the UI.

import type { TagKind } from "./types";
import { toBase64, type Recording } from "./recorder";
import type { VoiceContext } from "./voicePrompt";

export type VoiceNoteFill = {
  ok: true;
  /** Length of the recording, "0:24". */
  length: string;
  /** What was said. Words that became tags or details are wrapped in [[ ]] for highlighting. */
  transcript: string;
  before: string;
  /** Reflection, if one was said or can reasonably be inferred. Empty when nothing supports one. */
  refl: string;
  /** True when the reflection was inferred rather than said (shown as a Suggested reflection). */
  suggested: boolean;
  setup: string | null;
  tags: { t: string; k: TagKind }[];
  followed: boolean | null;
  headspace: string | null;
};

/**
 * Why a note gave nothing: "unclear" (no understandable speech), "offline", "failed" (the service didn't
 * answer), "mic" (no microphone access). Only "unclear" has designed copy (frame 16); the others use the
 * owner-approved wording in ChartStory (DESIGN.md › Voice notes in the real journal).
 */
export type VoiceNoteResult = VoiceNoteFill | { ok: false; reason: "unclear" | "offline" | "failed" | "mic" };

const CANNED: VoiceNoteFill = {
  ok: true,
  length: "0:24",
  transcript:
    '"Weekly and daily both bearish, so I took the [[4H supply pullback]]. Price came into last week\'s [[supply zone]], the fifteen minute [[broke structure]], I waited for the candle to close and got in on the [[retest]]. Felt [[calm]]. Stuck to the [[plan]]."',
  before: "Short from last week's 4H supply zone with weekly and daily bearish. Entered on the 15m retest after a break of structure, on plan.",
  refl: "Waiting for the candle to close kept the entry calm and on plan. Worth repeating.",
  suggested: true,
  setup: "4H supply pullback",
  tags: [
    { t: "Supply zone", k: "Good" },
    { t: "Break of structure", k: "Good" },
    { t: "Retest", k: "Good" },
  ],
  followed: true,
  headspace: "Calm",
};

function simulatedMode(): string | null {
  try {
    return new URLSearchParams(window.location.search).get("voice");
  } catch {
    return null;
  }
}

/**
 * Turn a finished recording into notes and details. `seconds` is how long the user talked. With a recording
 * (the real journal) it goes to the server function, which asks Gemini; without one (the sample journal)
 * the prototype's fixed result comes back.
 */
export async function readVoiceNote(seconds: number, rec?: Recording, ctx?: VoiceContext): Promise<VoiceNoteResult> {
  if (rec && ctx) return readOnServer(rec, ctx);
  if (simulatedMode() === "unclear") return { ok: false, reason: "unclear" };
  void seconds;
  return { ...CANNED, tags: CANNED.tags.map((t) => ({ ...t })) };
}

async function readOnServer(rec: Recording, ctx: VoiceContext): Promise<VoiceNoteResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { ok: false, reason: "offline" };
  try {
    const res = await fetch("/api/voice-note", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ audio: await toBase64(rec.blob), mime: rec.mime, seconds: rec.seconds, context: ctx }),
    });
    const out = (await res.json().catch(() => null)) as VoiceNoteResult | null;
    if (!out || typeof out !== "object" || !("ok" in out)) return { ok: false, reason: "failed" };
    return out.ok ? out : { ok: false, reason: out.reason === "unclear" ? "unclear" : "failed" };
  } catch {
    return { ok: false, reason: navigator.onLine === false ? "offline" : "failed" };
  }
}

/** Split a transcript into plain and highlighted runs. */
export function transcriptRuns(s: string): { text: string; mark: boolean }[] {
  return s
    .split(/(\[\[[^\]]+\]\])/)
    .filter(Boolean)
    .map((p) => (p.startsWith("[[") ? { text: p.slice(2, -2), mark: true } : { text: p, mark: false }));
}
